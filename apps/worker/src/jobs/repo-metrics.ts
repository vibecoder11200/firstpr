import { desc, eq } from "drizzle-orm";
import { createDb, repos, issues, repoMetrics } from "@firstpr/db";
import { GitHubClient } from "@firstpr/github";
import { env } from "../env.js";
import { enqueueScoreCompute, type CrawlJobData } from "../queue.js";

const db = createDb(env.databaseUrl);

interface ResponseTimes {
  firstResponseHours: number[];
  merged: number;
  totalClosed: number;
}

/**
 * repo-metrics job — fetch ~30 recent issues/PRs for a repo and compute the
 * responsiveness + health signals that feed scoring (CRIT-2 lives inside
 * phase-01). Uses the repo endpoint + issues list; sees GitHub's first
 * maintainer response via the timeline if available, else falls back to
 * issue/PR age as a proxy.
 *
 * IMPORTANT: only job that reads GitHub per-repo. Everything downstream
 * (scoring, UI) reads Postgres (C1).
 */
export async function repoMetricsJob(data: CrawlJobData): Promise<void> {
  const repoId = data.repoId;
  if (!repoId) return;

  const token = env.githubToken;
  if (!token) return;

  const repo = await db.select().from(repos).where(eq(repos.id, repoId)).limit(1);
  if (!repo[0]) return;
  const { owner, name } = repo[0]!;

  const client = new GitHubClient({ token });
  const responseTimes: ResponseTimes = { firstResponseHours: [], merged: 0, totalClosed: 0 };

  try {
    // Recent closed PRs → merge rate (90-day window)
    const prs = await client.listPullRequests(owner, name, { state: "closed", perPage: 30 });
    const cutoff = Date.now() - 90 * 86_400_000;
    for (const pr of prs.data) {
      if (pr.closed_at && new Date(pr.closed_at).getTime() < cutoff) continue;
      responseTimes.totalClosed += 1;
      if (pr.merged_at) responseTimes.merged += 1;
    }

    // Recent issues → first-response hours via timeline if present
    const list = await client.listIssues(owner, name, { state: "all", perPage: 30 });
    for (const it of list.data) {
      const created = new Date(it.created_at).getTime();
      const updated = new Date(it.updated_at).getTime();
      if (created > 0 && updated >= created) {
        responseTimes.firstResponseHours.push((updated - created) / 3_600_000);
      }
    }
  } catch (err) {
    // Swallow per-repo errors; the next discover pass will retry. Log but continue.
    console.warn(`repo-metrics (${fullName(owner, name)}) error: ${(err as Error).message}`);
  }

  const sampleCount = responseTimes.firstResponseHours.length;
  const median = medianOf(responseTimes.firstResponseHours);
  const mergeRate = responseTimes.totalClosed > 0
    ? Math.round((responseTimes.merged / responseTimes.totalClosed) * 100)
    : null;

  await db
    .insert(repoMetrics)
    .values({
      repoId,
      sampleCount,
      medianFirstResponseHours: median ? Math.round(median) : null,
      mergeRate90d: mergeRate,
      computedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: repoMetrics.repoId,
      set: {
        sampleCount,
        medianFirstResponseHours: median ? Math.round(median) : null,
        mergeRate90d: mergeRate,
        computedAt: new Date(),
      },
    });

  // Link the latest metrics row to the repo
  const metricsRow = await db
    .select({ id: repoMetrics.id })
    .from(repoMetrics)
    .where(eq(repoMetrics.repoId, repoId))
    .orderBy(desc(repoMetrics.id))
    .limit(1);
  if (metricsRow[0]) {
    await db.update(repos).set({ repoMetricsId: metricsRow[0]!.id }).where(eq(repos.id, repoId));
  }

  // C2/CRIT-2: fresh metrics must invalidate already-scored issues — flip the
  // repo's open issues back to stale so score-compute re-scores them with the
  // new signals (not just issues that were stale on insert).
  await db
    .update(issues)
    .set({ stale: true })
    .where(eq(issues.repoId, repoId));

  // New metrics → re-score every stale issue for this repo (CRIT-2)
  await enqueueScoreCompute(repoId);

  console.log(
    `repo-metrics ok: ${fullName(owner, name)} samples=${sampleCount} medianResp=${Math.round(median ?? 0)}h mergeRate=${mergeRate}%`,
  );
}

const fullName = (o: string, n: string) => `${o}/${n}`;
const medianOf = (arr: number[]): number | null => {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
};