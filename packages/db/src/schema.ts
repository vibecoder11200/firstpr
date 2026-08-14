import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  index,
  uniqueIndex,
  primaryKey,
  jsonb,
} from "drizzle-orm/pg-core";

/* =====================================================================
 * FirstPR — database schema
 *
 * Tables:
 *   auth  -> user, session, account, verification  (Better Auth canonical)
 *   data  -> repos, issues, scores, repo_metrics, contributions
 *
 * Conventions:
 *   - TIMESTAMPTZ everywhere; JS controllers pass ISO strings.
 *   - Every GitHub-derived string is sanitized (plaintext, HTML stripped)
 *     before insert — see packages/github/sanitize.ts.
 *   - `contributions.pr_url` is the dedup PK (anti double-count, C4).
 *   - schema evolves ONLY via new Drizzle migration files (CRIT-3).
 * ===================================================================== */

/* ----------------------------- users ----------------------------- */

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),

  /** GitHub login (username) — derived from OAuth, sanitized. */
  githubLogin: text("github_login"),
  /** True when GitHub OAuth token was revoked → UI shows "re-login" banner. */
  tokenInvalid: boolean("token_invalid").notNull().default(false),
  tokenUpdatedAt: timestamp("token_updated_at", { withTimezone: true }),
});

export const sessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    token: text("token"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const accounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** provider id, e.g. "github" */
    providerId: text("provider_id").notNull(),
    /** provider account id */
    accountId: text("account_id").notNull(),
    /** scopes granted at OAuth time, space-separated (immutable) */
    scope: text("scope"),
    /** encrypted at rest when account.encryptOAuthTokens=true (C6) */
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    /** OAuth app id for this provider */
    appId: text("app_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("account_user_id_idx").on(t.userId), index("account_provider_idx").on(t.providerId)],
);

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------ repos ---------------------------- */

export const repos = pgTable(
  "repos",
  {
    id: integer("id").primaryKey(),
    owner: text("owner").notNull(),
    name: text("name").notNull(),
    fullName: text("full_name").notNull(),
    description: text("description"),
    /** stars at crawl time */
    stargazersCount: integer("stargazers_count").notNull().default(0),
    /** primary language from GitHub api */
    language: text("language"),
    /** true = archived → hard-filtered out of results */
    archived: boolean("archived").notNull().default(false),
    /** true = owned by a GitHub Bot account → hard-filtered (anti-gaming) */
    isBotOwned: boolean("is_bot_owned").notNull().default(false),
    /** last push date (drives the 90-day health hard filter) */
    pushedAt: timestamp("pushed_at", { withTimezone: true }),
    fork: boolean("fork").notNull().default(false),
    /** null when never crawled */
    repoMetricsId: integer("repo_metrics_id"),
    lastCrawledAt: timestamp("last_crawled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("repos_full_name_uq").on(t.fullName), index("repos_language_idx").on(t.language)],
);

/* ---------------------- repo_metrics (signals) -------------------- */

export const repoMetrics = pgTable(
  "repo_metrics",
  {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  repoId: integer("repo_id")
    .notNull()
    .references(() => repos.id, { onDelete: "cascade" }),
  /** sample size used to compute the metrics below */
  sampleCount: integer("sample_count").notNull().default(0),
  /** median first maintainer response (hours) across sample */
  medianFirstResponseHours: integer("median_first_response_hours"),
  /** fraction of PRs from the sample merged within 90 days */
  mergeRate90d: integer("merge_rate_90d"),
  /** business days the sample spans */
  sampleDays: integer("sample_days"),
  /** when these metrics were computed */
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("repo_metrics_repo_id_uq").on(t.repoId),
    // staleness lookups (confidence: metrics older than maxAgeDays) sort by this
    index("repo_metrics_computed_at_idx").on(t.computedAt),
  ],
);

/* ------------------------------ issues --------------------------- */

export const issues = pgTable(
  "issues",
  {
    id: integer("id").primaryKey(),
    repoId: integer("repo_id")
      .notNull()
      .references(() => repos.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    title: text("title").notNull(),
    /** sanitized, plaintext body (empty → hard filter out) */
    body: text("body"),
    /** offline searchable, lowercased tokens — for keyword filter later */
    searchText: text("search_text"),
    state: varchar("state", { length: 16 }).notNull().default("open"),
    /** pull_request.id set when this "issue" is a PR → excluded by anti-gaming */
    pullRequestId: integer("pull_request_id"),
    htmlUrl: text("html_url"),
    userLogin: text("user_login"),
    /** good first issue label detect */
    isGoodFirstIssue: boolean("is_good_first_issue").notNull().default(false),
    labels: jsonb("labels").$type<string[]>(),
    language: text("language"),
    stargazersCount: integer("stargazers_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    /** when the issue was first stored by crawler */
    discoveredAt: timestamp("discovered_at", { withTimezone: true }).notNull().defaultNow(),
    /** current computed score id (join), for O(1) listing */
    scoreId: integer("score_id"),
    lastScoreComputedAt: timestamp("last_score_computed_at", { withTimezone: true }),
    /** stale = needs re-score when repo_metrics refreshed */
    stale: boolean("stale").notNull().default(true),
  },
  (t) => [
    uniqueIndex("issues_repo_number_uq").on(t.repoId, t.number),
    // serving list sorted by score + language filter (C1 cache reads)
    index("issues_language_score_idx").on(t.language, t.lastScoreComputedAt),
    index("issues_stale_idx").on(t.stale),
  ],
);

/* ------------------------------ scores --------------------------- */

export const scores = pgTable(
  "scores",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    issueId: integer("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    /** 0–100 composite (raw formula, confidence NOT applied) */
    total: integer("total").notNull(),
    /** 0–100 displayed score after confidence adjustment (Q4) — stored at
     *  write time so scoring, API, and UI agree exactly (no double-rounding
     *  from reading back the already-rounded `total`). */
    displayedScore: integer("displayed_score").notNull().default(0),
    /** sub-scores, one per scoring group */
    scoreMaintainer: integer("score_maintainer"),
    scoreRepoHealth: integer("score_repo_health"),
    scoreIssueFreshness: integer("score_issue_freshness"),
    scoreIssueClarity: integer("score_issue_clarity"),
    /** scoring config version that produced this row (re-calibration bumps it) */
    metricVersion: integer("metric_version").notNull().default(1),
    /** recompute timestamp */
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
    /** PR-computed when re-scored (CRIT-2) */
    recomputedAt: timestamp("recomputed_at", { withTimezone: true }),
    /** confidence of signals feeding the score: low|medium|high */
    confidence: text("confidence").notNull().default("low").$type<"low" | "medium" | "high">(),
    /** hard filters applied during scoring (JSON array of flags) */
    hardFilters: jsonb("hard_filters").$type<string[]>().notNull().default([]),
  },
  (t) => [index("scores_issue_id_idx").on(t.issueId)],
);

/* -------------------------- contributions ------------------------- */

export const contributions = pgTable(
  "contribution",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** PR dedup key — unique per PR URL (C4) */
    prUrl: text("pr_url").notNull(),
    prNumber: integer("pr_number"),
    repoFullName: text("repo_full_name"),
    issueTitle: text("issue_title"),
    /** sanitized PR title */
    title: text("title"),
    /** merged time (source of truth for portfolio stats) */
    mergedAt: timestamp("merged_at", { withTimezone: true }),
    detectedAt: timestamp("detected_at", { withTimezone: true }).notNull().defaultNow(),
    /** whether it earned a "first PR" badge */
    isFirstPr: boolean("is_first_pr").notNull().default(false),
  },
  (t) => [uniqueIndex("contribution_pr_url_uq").on(t.prUrl), index("contribution_user_id_idx").on(t.userId)],
);

/* ------------------------- schema export -------------------------- */

export type Issue = typeof issues.$inferSelect;
export type Repo = typeof repos.$inferSelect;
export type Score = typeof scores.$inferSelect;
export type Contribution = typeof contributions.$inferSelect;

export const authSchema = { users, sessions, accounts, verifications };