/* =====================================================================
 * FirstPR — GitHub client wrapper
 *
 * Single place that talks to the GitHub API. Two token sources:
 *   - search / public reads use the GitHub App token (or a PAT in dev)
 *   - per-user reads (outcome/portfolio) use the user's OAuth accessToken
 * Both go through the token-bucket rate limiter (rate-limiter.ts) so we
 * never trip the Search 30/min or REST 12.5k/h caps (C1).
 * ===================================================================== */

import { Octokit } from "octokit";
import { TokenBucketRateLimiter, type JobBudget } from "./rate-limiter.js";

/** Budgets per job type — single source of truth (C1 request-budget table). */
export const JOB_BUDGETS: Record<string, JobBudget> = {
  discover: { maxPerMinute: 30, maxPerHour: 12_500, burst: 5 },
  "repo-metrics": { maxPerMinute: 12, maxPerHour: 12_500, burst: 4 },
  outcome: { maxPerMinute: 30, maxPerHour: 5_000, burst: 5 },
};

/** GitHub response wrapper: exposes rate-limit headers for the limiter. */
export interface GhResponse<T> {
  data: T;
  headers: Record<string, string | undefined>;
  status: number;
}

/** Global, per-process limiter. Sorted by budget so big jobs can't starve small ones. */
const limiters = new Map<string, TokenBucketRateLimiter>();

function limiterFor(budget: JobBudget): TokenBucketRateLimiter {
  const key = `${budget.maxPerMinute}:${budget.maxPerHour}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new TokenBucketRateLimiter(budget);
    limiters.set(key, limiter);
  }
  return limiter;
}

export type PrState = "open" | "closed" | "all";

export class GitHubClient {
  private octokit: Octokit;
  readonly kind: "app" | "user";
  readonly userLogin?: string;

  constructor(opts: { token: string; kind?: "app" | "user"; userLogin?: string }) {
    this.kind = opts.kind ?? "app";
    this.userLogin = opts.userLogin;
    this.octokit = new Octokit({ auth: opts.token });
  }

  /** Run a rate-limited request; learns the real reset window from headers. */
  private async withBudget<T>(job: string, fn: () => Promise<T>): Promise<T> {
    const limiter = limiterFor(JOB_BUDGETS[job] ?? JOB_BUDGETS["repo-metrics"]!);
    await limiter.take();
    const res = await fn();
    // Observe actual X-RateLimit-* headers so the limiter adapts (C1/M2).
    const headers = (res as GhResponse<unknown>).headers ?? {};
    const remaining = Number(headers["x-ratelimit-remaining"] ?? "");
    const reset = Number(headers["x-ratelimit-reset"] ?? "");
    if (Number.isFinite(remaining) && Number.isFinite(reset) && reset > 0) {
      limiter.observeRemaining(job, remaining, reset * 1000);
    }
    return res;
  }

  async searchIssues(
    q: string,
    opts: { perPage?: number; page?: number; job?: string } = {},
  ): Promise<GhResponse<any>> {
    const job = opts.job ?? "discover";
    const res = await this.withBudget(job, () =>
      this.octokit.rest.search.issuesAndPullRequests({
        q,
        per_page: opts.perPage ?? 100,
        page: opts.page ?? 1,
      }),
    );
    return res as GhResponse<any>;
  }

  async getRepo(owner: string, repo: string): Promise<GhResponse<any>> {
    const res = await this.withBudget("repo-metrics", () =>
      this.octokit.rest.repos.get({ owner, repo }),
    );
    return res as GhResponse<any>;
  }

  async listIssues(
    owner: string,
    repo: string,
    opts: { state?: PrState; perPage?: number; page?: number } = {},
  ): Promise<GhResponse<any>> {
    const res = await this.withBudget("repo-metrics", () =>
      this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: opts.state ?? "all",
        per_page: opts.perPage ?? 30,
        page: opts.page ?? 1,
      }),
    );
    return res as GhResponse<any>;
  }

  async listPullRequests(
    owner: string,
    repo: string,
    opts: { state?: PrState; perPage?: number; page?: number } = {},
  ): Promise<GhResponse<any>> {
    const res = await this.withBudget("repo-metrics", () =>
      this.octokit.rest.pulls.list({
        owner,
        repo,
        state: opts.state ?? "all",
        per_page: opts.perPage ?? 30,
        page: opts.page ?? 1,
      }),
    );
    return res as GhResponse<any>;
  }
}
