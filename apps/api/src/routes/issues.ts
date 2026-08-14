import type { FastifyInstance } from "fastify";
import { desc, eq, and, sql } from "drizzle-orm";
import { issues, scores, repos } from "@firstpr/db";
import { db } from "../lib/auth.js";

/**
 * GET /api/issues?language=&sort=score&page=&pageSize=
 * Serves from Postgres cache only — never touches the GitHub API (C1).
 * Sorted by score desc; language filter optional.
 */
export async function issuesRoutes(app: FastifyInstance) {
  app.get("/api/issues", async (request, reply) => {
    const query = request.query as {
      language?: string;
      sort?: "score" | "fresh";
      page?: string;
      pageSize?: string;
    };
    const language = query.language?.trim();
    const sort = query.sort ?? "score";
    const page = Math.max(1, Number(query.page ?? "1"));
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize ?? "20")));

    const where = [
      eq(issues.state, "open"),
      eq(issues.stale, false), // only freshly-scored issues (CRIT-2)
      sql`${issues.pullRequestId} IS NULL`, // anti-gaming: not a PR
      // H3: exclude hard-filtered rows (archived repo, empty body, stale repo,
      // too-old issue) — they have a score row with total=0 / non-empty filters.
      sql`${scores.total} > 0`,
      sql`jsonb_array_length(${scores.hardFilters}) = 0`,
    ];
    if (language && language !== "all") where.push(eq(issues.language, language));

    const orderBy =
      sort === "fresh"
        ? [desc(issues.createdAt)]
        : [desc(scores.total)];

    const rows = await db
      .select({
        id: issues.id,
        title: issues.title,
        body: issues.body,
        htmlUrl: issues.htmlUrl,
        language: issues.language,
        stargazersCount: issues.stargazersCount,
        createdAt: issues.createdAt,
        repoFullName: repos.fullName,
        repoOwner: repos.owner,
        repoName: repos.name,
        total: scores.total,
        scoreMaintainer: scores.scoreMaintainer,
        scoreRepoHealth: scores.scoreRepoHealth,
        scoreIssueFreshness: scores.scoreIssueFreshness,
        scoreIssueClarity: scores.scoreIssueClarity,
        confidence: scores.confidence,
      })
      .from(issues)
      .innerJoin(repos, eq(issues.repoId, repos.id))
      .leftJoin(scores, eq(issues.scoreId, scores.id))
      .where(and(...where))
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const countRow = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(issues)
      .innerJoin(repos, eq(issues.repoId, repos.id))
      .innerJoin(scores, eq(issues.scoreId, scores.id))
      .where(and(...where))
      .limit(1);

    return {
      issues: rows.map((r) => ({
        id: r.id,
        title: r.title,
        repoFullName: r.repoFullName,
        repoUrl: `https://github.com/${r.repoFullName}`,
        htmlUrl: r.htmlUrl,
        language: r.language,
        stars: r.stargazersCount,
        createdAt: r.createdAt,
        score: r.total ?? 0,
        scoreBreakdown: {
          maintainer: r.scoreMaintainer,
          repoHealth: r.scoreRepoHealth,
          freshness: r.scoreIssueFreshness,
          clarity: r.scoreIssueClarity,
        },
        confidence: r.confidence,
      })),
      page,
      pageSize,
      total: countRow[0]?.count ?? 0,
    };
  });

  /** Distinct languages available for the filter chip row. */
  app.get("/api/issues/languages", async () => {
    const rows = await db
      .select({ language: issues.language })
      .from(issues)
      .groupBy(issues.language);
    return rows.map((r) => r.language).filter(Boolean);
  });
}
