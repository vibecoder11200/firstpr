import { Queue, Worker, type Job } from "bullmq";
import { Redis as RedisConnection } from "ioredis";
import { env } from "./env.js";
import { discoverJob } from "./jobs/discover.js";
import { repoMetricsJob } from "./jobs/repo-metrics.js";
import { scoreComputeJob } from "./jobs/score-compute.js";

const connection = new RedisConnection(env.redisUrl, { maxRetriesPerRequest: null });

export const queues = {
  crawl: new Queue<CrawlJobData>("crawl", { connection }),
  score: new Queue<ScoreJobData>("score", { connection }),
};

export interface CrawlJobData {
  type: "discover" | "repo-metrics";
  /** for discover: language(s) + date range */
  languages?: string[];
  from?: string; // ISO date
  to?: string;
  /** for repo-metrics: repo id to process */
  repoId?: number;
}

export interface ScoreJobData {
  type: "score-compute";
  repoId?: number;
  issueId?: number;
}

export function registerWorkers(): Worker[] {
  const crawlWorker = new Worker<CrawlJobData>(
    "crawl",
    async (job: Job<CrawlJobData>) => {
      if (job.data.type === "discover") {
        await discoverJob(job.data);
      } else if (job.data.type === "repo-metrics") {
        await repoMetricsJob(job.data);
      }
    },
    { connection, concurrency: 2 },
  );

  const scoreWorker = new Worker<ScoreJobData>(
    "score",
    async (job: Job<ScoreJobData>) => {
      if (job.data.type === "score-compute") {
        await scoreComputeJob(job.data);
      }
    },
    { connection, concurrency: 2 },
  );

  crawlWorker.on("failed", (job, err) => {
    console.error(`crawl job failed (${job?.id}):`, err.message);
  });
  scoreWorker.on("failed", (job, err) => {
    console.error(`score job failed (${job?.id}):`, err.message);
  });

  return [crawlWorker, scoreWorker];
}

export async function enqueueDiscover(): Promise<void> {
  // Split the discovery window into chunks to avoid the 1,000/query cap (HIGH-11).
  const days = env.discoverDays;
  const now = Date.now();
  const chunkDays = 7;
  for (let end = now; end > now - days * 86_400_000; end -= chunkDays * 86_400_000) {
    const from = new Date(end - chunkDays * 86_400_000).toISOString();
    const to = new Date(end).toISOString();
    await queues.crawl.add(
      "discover",
      { type: "discover", languages: ["python", "typescript", "javascript"], from, to },
      {
        // singleton: one discover per window at a time. BullMQ job IDs are used
        // as Redis key suffixes; a `:` is only allowed when the id splits into
        // exactly 3 parts (repeatable-job compat). A single `:` is rejected, so
        // use a colon-free day-boundary epoch timestamp.
        jobId: `discover-${Math.floor(end / 86_400_000)}`,
        attempts: 3,
        backoff: { type: "exponential", delay: 30_000 },
        removeOnComplete: { age: 86_400 },
      },
    );
  }
}

export async function enqueueRepoMetrics(repoId: number): Promise<void> {
  await queues.crawl.add(
    "repo-metrics",
    { type: "repo-metrics", repoId },
    {
      // colon-free jobId (a single `:` is rejected by bullMQ)
      jobId: `repo-metrics-${repoId}`,
      attempts: 3,
      backoff: { type: "exponential", delay: 60_000 },
      removeOnComplete: { age: 86_400 },
    },
  );
}

export async function enqueueScoreCompute(repoId?: number, issueId?: number): Promise<void> {
  await queues.score.add(
    "score-compute",
    { type: "score-compute", repoId, issueId },
    {
      jobId: `score-compute:${repoId ?? "all"}:${issueId ?? "all"}`,
      attempts: 2,
      removeOnComplete: { age: 86_400 },
    },
  );
}
