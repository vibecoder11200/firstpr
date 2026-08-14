import type { FastifyInstance } from "fastify";
import { and, eq } from "drizzle-orm";
import { issues, scores, repos, repoMetrics } from "@firstpr/db";
import { displayWeights } from "@firstpr/scoring";
import { db } from "../lib/auth.js";

/**
 * GET /api/issues/:id — full score breakdown + confidence for one issue.
 * Reads from Postgres cache only (C1); no GitHub calls.
 */
export async function issueDetailRoutes(app: FastifyInstance) {
  app.get("/api/issues/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const issueId = Number(id);
    if (!Number.isInteger(issueId) || issueId <= 0) {
      return reply.code(400).send({ error: "invalid issue id" });
    }

    const row = await db
      .select({
        issue: issues,
        repo: repos,
        score: scores,
        metrics: repoMetrics,
      })
      .from(issues)
      .innerJoin(repos, eq(issues.repoId, repos.id))
      .leftJoin(scores, eq(issues.scoreId, scores.id))
      .leftJoin(repoMetrics, eq(repos.repoMetricsId, repoMetrics.id))
      .where(and(eq(issues.id, issueId), eq(issues.state, "open")))
      .limit(1);

    if (!row.length) return reply.code(404).send({ error: "issue not found" });
    const { issue, repo, score, metrics } = row[0]!;

    return {
      id: issue.id,
      title: issue.title,
      body: issue.body,
      htmlUrl: issue.htmlUrl,
      language: issue.language,
      labels: issue.labels,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      repo: {
        fullName: repo.fullName,
        owner: repo.owner,
        name: repo.name,
        description: repo.description,
        stars: repo.stargazersCount,
        language: repo.language,
        archived: repo.archived,
        isBotOwned: repo.isBotOwned,
        pushedAt: repo.pushedAt,
      },
      score: {
        total: score?.total ?? 0,
        maintainer: score?.scoreMaintainer ?? 0,
        repoHealth: score?.scoreRepoHealth ?? 0,
        freshness: score?.scoreIssueFreshness ?? 0,
        clarity: score?.scoreIssueClarity ?? 0,
        confidence: score?.confidence ?? "low",
        metricVersion: score?.metricVersion ?? 1,
        recomputedAt: score?.recomputedAt ?? score?.computedAt ?? null,
        hardFilters: score?.hardFilters ?? [],
        displayedScore: score?.displayedScore ?? 0,
        weights: displayWeights(),
      },
      signals: {
        sampleCount: metrics?.sampleCount ?? 0,
        medianFirstResponseHours: metrics?.medianFirstResponseHours ?? null,
        mergeRate90d: metrics?.mergeRate90d ?? null,
        computedAt: metrics?.computedAt ?? null,
      },
    };
  });
}
