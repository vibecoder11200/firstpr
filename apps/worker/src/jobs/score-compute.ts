import { eq, and, isNull, sql } from "drizzle-orm";
import { createDb, issues, repos, repoMetrics, scores } from "@firstpr/db";
import { computeScore, DEFAULT_CONFIG, type ScoreInput } from "@firstpr/scoring";
import { env } from "../env.js";
import type { ScoreJobData } from "../queue.js";

const db = createDb(env.databaseUrl);

/**
 * score-compute job — re-score stale issues (CRIT-2).
 * Runs after repo-metrics refreshes, or as a full sweep after discover.
 * Scored issues get a `scores` row; issues lacking repo_metrics still get
 * scored (with low confidence) — NEVER left with score=0 from missing metrics.
 */
const BATCH = 200;

export async function scoreComputeJob(data: ScoreJobData): Promise<void> {
  const repoId = data.repoId;
  let totalRescored = 0;

  // Loop until no stale issues remain (no hard 500 cap — H2). Each batch sets
  // stale=false, so the next fetch returns the remainder until empty.
  for (;;) {
    const stale = await db
      .select({
        issue: issues,
        repo: repos,
        metrics: repoMetrics,
      })
      .from(issues)
      .innerJoin(repos, eq(issues.repoId, repos.id))
      .leftJoin(repoMetrics, eq(repos.repoMetricsId, repoMetrics.id))
      .where(
        and(
          eq(issues.stale, true),
          eq(issues.state, "open"),
          isNull(issues.pullRequestId),
          repoId ? eq(issues.repoId, repoId) : sql`true`,
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

      // Upsert score row (latest per issue; keep history via computedAt rows)
      const scoreId = await upsertScore(issue.id, result);
      await db
        .update(issues)
        .set({
          scoreId: scoreId ?? undefined,
          stale: false,
          lastScoreComputedAt: new Date(),
        })
        .where(eq(issues.id, issue.id));

      totalRescored += 1;
    }
  }

  console.log(`score-compute done: ${totalRescored} issues rescored${repoId ? ` (repo ${repoId})` : ""}`);
}

async function upsertScore(issueId: number, result: ReturnType<typeof computeScore>): Promise<number | null> {
  const inserted = await db
    .insert(scores)
    .values({
      issueId,
      total: result.score,
      // Persist the confidence-adjusted score computed from the UNROUNDED raw
      // composite, so API reads back the exact value the engine produced
      // (no double-rounding vs the stored `total`). (review finding #1)
      displayedScore: result.displayedScore,
      scoreMaintainer: result.maintainerResponsiveness,
      scoreRepoHealth: result.repoHealth,
      scoreIssueFreshness: result.issueFreshness,
      scoreIssueClarity: result.issueClarity,
      confidence: result.confidence,
      hardFilters: result.excludedReasons,
      computedAt: new Date(),
      recomputedAt: new Date(),
    })
    .returning({ id: scores.id });

  return inserted[0]?.id ?? null;
}
