import { registerWorkers, enqueueDiscover } from "./queue.js";
import { env } from "./env.js";

/**
 * FirstPR worker entrypoint.
 * - Registers bullMQ workers (crawl, score).
 * - On boot, enqueues a fresh discovery sweep so the crawl stays warm.
 * Production runs this via Docker; local runs via `npm run dev -w @firstpr/worker`.
 */
async function main() {
  const workers = registerWorkers();
  console.log("worker: registered crawl + score workers");

  // Kick off initial discovery (date-range split, idempotent by jobId)
  if (env.githubToken) {
    await enqueueDiscover().catch((err) =>
      console.error("initial enqueue discover failed:", err.message),
    );
    console.log("worker: enqueued initial discovery window");
  } else {
    console.warn("worker: GITHUB_TOKEN unset — discovery disabled (set for real crawling).");
  }

  const shutdown = async () => {
    console.log("worker: shutting down");
    await Promise.all(workers.map((w) => w.close()));
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();