/* =====================================================================
 * FirstPR — scoring engine (packages/scoring)
 *
 * Composite score (0–100), per docs/03-design.md §1.1–1.5:
 *   30% MaintainerResponsiveness + 20% RepoHealth
 *   + 15% IssueFreshness + 35% IssueClarity
 *
 * Hard filters run first: archived repo, repo no-push > 90 days, empty
 * body, issue open > 180 days, PR records (anti-gaming).
 *
 * Confidence (Q4 — phase-02): low | medium | high feeds a display-time
 * weight adjustment; low if sample_count < 10 OR metrics computed > 30 days,
 * medium if 10–29 samples, high if ≥ 30 & fresh.
 *
 * All thresholds are priors (research-based). Phase-02 G1 calibration may
 * adjust them — keep them in ONE place so calibrate.ts can read them.
 * ===================================================================== */

export interface ScoreInput {
  /** repo health + responsiveness signals */
  repoMetrics: {
    sampleCount: number;
    medianFirstResponseHours: number | null;
    mergeRate90d: number | null; // 0–100
    computedAt: Date;
  } | null;
  /** repo-level flags */
  repo: {
    archived: boolean;
    isBotOwned: boolean;
    pushedAt: Date | null;
    stargazersCount: number;
  };
  /** issue-level data */
  issue: {
    body: string | null;
    state: "open" | "closed";
    pullRequestId: number | null;
    createdAt: Date;
    closedAt?: Date | null;
  };
}

export interface ScoreResult {
  score: number;
  /** sub-scores 0–100 before weights */
  maintainerResponsiveness: number;
  repoHealth: number;
  issueFreshness: number;
  issueClarity: number;
  /** hard-filter outcome */
  excluded: boolean;
  excludedReasons: string[];
  confidence: "low" | "medium" | "high";
  /** display score after confidence adjustment */
  displayedScore: number;
}

export interface ScoringConfig {
  weights: { maintainer: number; repoHealth: number; freshness: number; clarity: number };
  /** freshness window where issues score 100 (days), then decay to 0 by far edge */
  freshnessMaxDays: number;
  /** body length (chars) at/above which clarity scores full */
  clarityPerfectBodyChars: number;
  /** min chars for a body to count at all */
  clarityMinBodyChars: number;
  /** response hours at/under which responsiveness scores full */
  responsePerfectHours: number;
  /** response hours beyond which responsiveness bottoms out */
  responseDeadHours: number;
  /** stars at/above which health scores full */
  starsPerfect: number;
  /** hard-filter bounds */
  maxIssueAgeDays: number;
  maxNoPushDays: number;
  /** confidence thresholds (sample count + staleness in days) */
  confidence: { minSamplesHigh: number; minSamplesMedium: number; maxAgeDays: number };
}

export const DEFAULT_CONFIG: ScoringConfig = {
  weights: { maintainer: 0.3, repoHealth: 0.2, freshness: 0.15, clarity: 0.35 },
  freshnessMaxDays: 30,
  clarityPerfectBodyChars: 500,
  clarityMinBodyChars: 40,
  responsePerfectHours: 24,
  responseDeadHours: 72,
  starsPerfect: 1_000,
  maxIssueAgeDays: 180,
  maxNoPushDays: 90,
  confidence: { minSamplesHigh: 30, minSamplesMedium: 10, maxAgeDays: 30 },
};

const clamp = (n: number, lo = 0, hi = 100): number => Math.min(hi, Math.max(lo, n));

export function scoreMaintainerResponsiveness(
  medianResponseHours: number | null,
  mergeRate90d: number | null,
  sampleCount: number,
  cfg: ScoringConfig = DEFAULT_CONFIG,
): number {
  if (!medianResponseHours || sampleCount === 0) return 0;
  // linear decay from perfect (≤ perfect hours) to dead (≥ dead hours)
  const responsive = 100 - ((medianResponseHours - cfg.responsePerfectHours) /
    (cfg.responseDeadHours - cfg.responsePerfectHours)) * 100;
  const mergeBonus = mergeRate90d != null ? mergeRate90d * 0.2 : 0;
  return Math.round(clamp(responsive * 0.8 + mergeBonus));
}

export function scoreRepoHealth(
  { pushedAt, stargazersCount, archived }: ScoreInput["repo"],
  cfg: ScoringConfig = DEFAULT_CONFIG,
): number {
  if (archived) return 0;
  if (!pushedAt) return 0;
  const daysSincePush = (Date.now() - pushedAt.getTime()) / 86_400_000;
  if (daysSincePush > cfg.maxNoPushDays) return 0; // hard filter handled separately
  const activity = clamp(100 - (daysSincePush / cfg.maxNoPushDays) * 100);
  const size = clamp((stargazersCount / cfg.starsPerfect) * 100);
  return Math.round(clamp(activity * 0.6 + size * 0.4));
}

export function scoreIssueFreshness(
  createdAt: Date,
  cfg: ScoringConfig = DEFAULT_CONFIG,
): number {
  const ageDays = (Date.now() - createdAt.getTime()) / 86_400_000;
  if (ageDays <= 0) return 100;
  return Math.round(clamp(100 - (ageDays / cfg.freshnessMaxDays) * 100));
}

export function scoreIssueClarity(
  body: string | null,
  cfg: ScoringConfig = DEFAULT_CONFIG,
): number {
  if (!body) return 0;
  const len = body.length;
  if (len < cfg.clarityMinBodyChars) return 0;
  return Math.round(clamp((len / cfg.clarityPerfectBodyChars) * 100));
}

export function hardFilters(
  input: ScoreInput,
  cfg: ScoringConfig = DEFAULT_CONFIG,
): { excluded: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (input.repo.archived) reasons.push("repo_archived");
  if (input.repo.isBotOwned) reasons.push("repo_bot_owned");
  if (input.issue.state !== "open") reasons.push("issue_closed");
  if (input.issue.pullRequestId != null) reasons.push("is_pr");
  if (!input.issue.body || input.issue.body.trim().length === 0) reasons.push("empty_body");
  const ageDays = (Date.now() - input.issue.createdAt.getTime()) / 86_400_000;
  if (ageDays > cfg.maxIssueAgeDays) reasons.push("issue_too_old");
  if (input.repo.pushedAt) {
    const noPushDays = (Date.now() - input.repo.pushedAt.getTime()) / 86_400_000;
    if (noPushDays > cfg.maxNoPushDays) reasons.push("repo_inactive_90d");
  }
  return { excluded: reasons.length > 0, reasons };
}

export function computeConfidence(
  repoMetrics: ScoreInput["repoMetrics"],
  cfg: ScoringConfig = DEFAULT_CONFIG,
): "low" | "medium" | "high" {
  if (!repoMetrics || repoMetrics.sampleCount < cfg.confidence.minSamplesMedium) return "low";
  const ageDays = (Date.now() - repoMetrics.computedAt.getTime()) / 86_400_000;
  if (ageDays > cfg.confidence.maxAgeDays) return "low";
  if (repoMetrics.sampleCount >= cfg.confidence.minSamplesHigh) return "high";
  return "medium";
}

/** Composite score; returns 0 for filtered issues plus full breakdown. */
export {
  confidenceFactor,
  confidenceReason,
  confidenceLabel,
  displayedScore,
  displayWeights,
} from "./confidence.js";

export function computeScore(
  input: ScoreInput,
  cfg: ScoringConfig = DEFAULT_CONFIG,
): ScoreResult {
  const filtered = hardFilters(input, cfg);
  const confidence = computeConfidence(input.repoMetrics, cfg);

  const maintainerResponsiveness = scoreMaintainerResponsiveness(
    input.repoMetrics?.medianFirstResponseHours ?? null,
    input.repoMetrics?.mergeRate90d ?? null,
    input.repoMetrics?.sampleCount ?? 0,
    cfg,
  );
  const repoHealth = scoreRepoHealth(input.repo, cfg);
  const issueFreshness = scoreIssueFreshness(input.issue.createdAt, cfg);
  const issueClarity = scoreIssueClarity(input.issue.body, cfg);

  const raw =
    maintainerResponsiveness * cfg.weights.maintainer +
    repoHealth * cfg.weights.repoHealth +
    issueFreshness * cfg.weights.freshness +
    issueClarity * cfg.weights.clarity;

  // Confidence adjustment (Q4): when not high, scale displayed score by 0.9 / 0.7
  const confFactor = confidence === "high" ? 1 : confidence === "medium" ? 0.9 : 0.7;

  return {
    score: filtered.excluded ? 0 : Math.round(clamp(raw)),
    maintainerResponsiveness,
    repoHealth,
    issueFreshness,
    issueClarity,
    excluded: filtered.excluded,
    excludedReasons: filtered.reasons,
    confidence,
    displayedScore: filtered.excluded ? 0 : Math.round(clamp(raw * confFactor)),
  };
}