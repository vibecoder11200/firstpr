import "dotenv/config";
import { desc, eq, and, isNull, sql } from "drizzle-orm";
import { createDb, closeDb, repos, issues, scores, repoMetrics } from "@firstpr/db";
import { GitHubClient } from "@firstpr/github";
import { computeScore, DEFAULT_CONFIG, type ScoreInput } from "@firstpr/scoring";

/* =====================================================================
 * Dev batch driver: run repo-metrics + score-compute for already-crawled
 * repos that still need metrics — for the G1 calibrate, without waiting
 * for the (rate-limited) full discovery sweep.
 *
 * Self-contained (no Redis / worker modules) so it stays light on dev
 * machines. usage: node --import tsx scripts/crawl-batch.ts --limit 12
 * ===================================================================== */

const arg = (n: string) => {
  const i = process.argv.indexOf(n);
  return i >= 0 ? Number(process.argv[i + 1]) : undefined;
};
const LIMIT = arg("--limit") ?? 12;

const medianOf = (arr: number[]): number | null => {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
};

async function metricsForRepo(
  db: ReturnType<typeof createDb>,
  client: GitHubClient,
  repoId: number,
): Promise<void> {
  const repo = await db.select().from(repos).where(eq(repos.id, repoId)).limit(1);
  if (!repo[0]) return;
  const { owner, name } = repo[0]!;

  let firstResponseHours: number[] = [];
  let merged = 0;
  let totalClosed = 0;

  try {
    const prs = await client.listPullRequests(owner, name, { state: "closed", perPage: 30 });
    const cutoff = Date.now() - 90 * 86_400_000;
    for (const pr of prs.data) {
      if (pr.closed_at && new Date(pr.closed_at).getTime() < cutoff) continue;
      totalClosed += 1;
      if (pr.merged_at) merged += 1;
    }

    const list = await client.listIssues(owner, name, { state: "all", perPage: 30 });
    for (const it of list.data) {
      const created = new Date(it.created_at).getTime();
      const updated = new Date(it.updated_at).getTime();
      if (created > 0 && updated >= created) {
        firstResponseHours.push((updated - created) / 3_600_000);
      }
    }
  } catch (err) {
    console.warn(`  metrics ${owner}/${name} error: ${(err as Error).message}`);
    return;
  }

  const sampleCount = firstResponseHours.length;
  const median = medianOf(firstResponseHours);
  const mergeRate = totalClosed > 0 ? Math.round((merged / totalClosed) * 100) : null;

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

  const metricsRow = await db
    .select({ id: repoMetrics.id })
    .from(repoMetrics)
    .where(eq(repoMetrics.repoId, repoId))
    .orderBy(desc(repoMetrics.id))
    .limit(1);
  if (metricsRow[0]) {
    await db.update(repos).set({ repoMetricsId: metricsRow[0]!.id }).where(eq(repos.id, repoId));
  }

  // Fresh metrics invalidate previously-scored issues (CRIT-2).
  await db.update(issues).set({ stale: true }).where(eq(issues.repoId, repoId));

  console.log(`  metrics ok: ${owner}/${name} samples=${sampleCount} median=${Math.round(median ?? 0)}h merge=${mergeRate}%`);
}

async function scoreAllStale(db: ReturnType<typeof createDb>): Promise<number> {
  const BATCH = 100;
  let total = 0;
  for (;;) {
    const stale = await db
      .select({ issue: issues, repo: repos, metrics: repoMetrics })
      .from(issues)
      .innerJoin(repos, eq(issues.repoId, repos.id))
      .leftJoin(repoMetrics, eq(repos.repoMetricsId, repoMetrics.id))
      .where(
        and(
          eq(issues.stale, true),
          eq(issues.state, "open"),
          isNull(issues.pullRequestId),
        ),
      )
      .limit(BATCH);
    if (stale.length === 0) break;

    for (const { issue, repo, metrics } of stale) {
      const input: ScoreInput = {
        repoMetrics: metrics
          ? {
              sampleCount: metrics.sampleCount,
              medianFirstResponseHours: metrics.medianFirstResponseHours,
              mergeRate90d: metrics.mergeRate90d,
              computedAt: metrics.computedAt,
            }
          : null,
        repo: {
          archived: repo.archived,
          isBotOwned: repo.isBotOwned,
          pushedAt: repo.pushedAt,
          stargazersCount: repo.stargazersCount,
        },
        issue: {
          body: issue.body,
          state: (issue.state === "open" ? "open" : "closed") as "open" | "closed",
          pullRequestId: issue.pullRequestId,
          createdAt: issue.createdAt,
          title: issue.title,
          labels: issue.labels,
        },
      };
      const result = computeScore(input, DEFAULT_CONFIG);
      // Update the existing linked score in place (no history bloat) — the
      // worker's job keeps score history; the dev batch tool overwrites.
      if (issue.scoreId != null) {
        await db
          .update(scores)
          .set({
            total: result.score,
            displayedScore: result.displayedScore,
            scoreMaintainer: result.maintainerResponsiveness,
            scoreRepoHealth: result.repoHealth,
            scoreIssueFreshness: result.issueFreshness,
            scoreIssueClarity: result.issueClarity,
            confidence: result.confidence,
            hardFilters: result.excludedReasons,
            recomputedAt: new Date(),
            computedAt: new Date(),
          })
          .where(eq(scores.id, issue.scoreId));
        await db
          .update(issues)
          .set({ stale: false, lastScoreComputedAt: new Date() })
          .where(eq(issues.id, issue.id));
      } else {
        const inserted = await db
          .insert(scores)
          .values({
            issueId: issue.id,
            total: result.score,
            displayedScore: result.displayedScore,
            scoreMaintainer: result.maintainerResponsiveness,
            scoreRepoHealth: result.repoHealth,
            scoreIssueFreshness: result.issueFreshness,
            scoreIssueClarity: result.issueClarity,
            confidence: result.confidence,
            hardFilters: result.excludedReasons,
            recomputedAt: new Date(),
            computedAt: new Date(),
          })
          .returning({ id: scores.id });
        await db
          .update(issues)
          .set({ scoreId: inserted[0]!.id, stale: false, lastScoreComputedAt: new Date() })
          .where(eq(issues.id, issue.id));
      }
      total += 1;
    }
  }
  return total;
}

async function main() {
  const db = createDb(process.env.DATABASE_URL!);

  // --score-only: re-score stale issues with the current model (no GitHub calls).
  if (process.argv.includes("--score-only")) {
    const scored = await scoreAllStale(db);
    console.log(`score-only done: ${scored} issues scored`);
    await closeDb();
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("GITHUB_TOKEN unset — cannot run repo-metrics.");
    process.exit(1);
  }
  const client = new GitHubClient({ token });

  const targets = await db
    .select({ id: repos.id, fullName: repos.fullName })
    .from(repos)
    .innerJoin(issues, eq(issues.repoId, repos.id))
    .leftJoin(repoMetrics, eq(repoMetrics.repoId, repos.id))
    .where(and(eq(issues.state, "open"), isNull(repos.repoMetricsId), eq(repos.isBotOwned, false)))
    .groupBy(repos.id)
    .orderBy(sql`count(${issues.id}) desc`)
    .limit(LIMIT);

  console.log(`processing ${targets.length} repos for metrics...`);
  for (const t of targets) {
    await metricsForRepo(db, client, t.id);
  }

  const scored = await scoreAllStale(db);
  console.log(`score-compute done: ${scored} issues scored`);
  await closeDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});