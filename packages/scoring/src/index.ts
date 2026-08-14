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
    /** title + labels feed the junior-fit signal; optional for back-compat */
    title?: string | null;
    labels?: string[] | null;
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
  /**
   * junior-fit signal (G1 recalibration, D16): fold "task approachability"
   * into the Clarity group so a long body of ADVANCED code doesn't score as
   * high as a short beginner-safe task. Multipliers, all positive.
   */
  fit: {
    /** blend fraction [0..1] of the fit signal into the clarity sub-score */
    blend: number;
    /** normalized terms (regex source, +weight) that mark a task as
     *  beginner-safe: docs, tests, tutorials, safe-zone, first-timers-only */
    beginnerSafe: { pattern: string; weight: number }[];
    /** normalized terms that mark a task as advanced/complex (penalize) */
    advanced: { pattern: string; weight: number }[];
    /** label-level beginner markers (e.g. `good first issue`) — bonus */
    beginnerLabels: string[];
  };
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
  fit: {
    blend: 0.5,
    // beginner-safe markers → bonus
    beginnerSafe: [
      { pattern: "\\bdocs?\\b", weight: 12 },
      { pattern: "\\bdocument(ation|ed)?\\b", weight: 12 },
      { pattern: "\\btutorial\\b", weight: 14 },
      { pattern: "\\bguide\\b", weight: 12 },
      { pattern: "\\bsafe-?zone\\b", weight: 20 },
      { pattern: "\\bfirst-?timers?-only\\b", weight: 20 },
      { pattern: "\\btests?\\b|\\btest coverage\\b", weight: 10 },
      { pattern: "\\bexample\\b", weight: 10 },
      { pattern: "\\b(?:dev|development|project|environment|env)\\s+setup\\b|\\bgetting started\\b", weight: 12 },
      { pattern: "\\b(?:add|write|create)\\b.*\\b(?:doc|guide|tutorial|example)s?\\b", weight: 14 },
    ],
    // advanced/complex markers → penalty
    advanced: [
      { pattern: "\\b\\d{1,2}\\s+positional\\s+parameters?\\b", weight: 30 },
      { pattern: "\\bpositional\\s+parameters?\\b", weight: 22 },
      { pattern: "\\bkernel\\b", weight: 18 },
      { pattern: "\\bstate-?machine\\b|\\binternals\\b", weight: 16 },
      { pattern: "\\bLLVM\\b|\\bFFI\\b|\\bSIMD\\b|\\bassembly\\b|\\bunsafe\\b", weight: 18 },
      { pattern: "\\b(?:advanced|complex|low-?level|hard)\b", weight: 14 },
      { pattern: "\\bpositional\\b", weight: 10 },
    ],
    beginnerLabels: ["good first issue", "first-timers-only", "good first contribution", "help wanted", "beginner", "docs", "documentation"],
  },
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

/**
 * Junior-fit signal (G1 recalibration, D16). Scores a task on how
 * approachable it is for a newcomer, 0–100, independent of body length.
 * Beginner-safe markers (docs/tests/tutorials/safe-zone/labels) raise it;
 * advanced-complexity markers (positional params, kernel/state-machine
 * internals, FFI/unsafe) lower it. `computeScore` blends this into the
 * Clarity group so a long ADVANCED writeup no longer scores like a
 * beginner-safe task.
 */
export function scoreJuniorFit(
  issue: ScoreInput["issue"],
  cfg: ScoringConfig = DEFAULT_CONFIG,
): number {
  let score = 50; // neutral starting point
  const text = [
    issue.title ?? "",
    issue.body ?? "",
    ...(issue.labels ?? []),
  ].join(" ").toLowerCase();

  const matchAll = (terms: { pattern: string; weight: number }[]): number => {
    let n = 0;
    for (const t of terms) {
      const re = new RegExp(t.pattern, "gi");
      n += (text.match(re)?.length ?? 0) * t.weight;
    }
    return n;
  };

  const beginnerBonus = matchAll(cfg.fit.beginnerSafe);
  const advancedPenalty = matchAll(cfg.fit.advanced);
  const hasBeginnerLabel = cfg.fit.beginnerLabels.some((l) =>
    (issue.labels ?? []).some((x) => x.toLowerCase().includes(l)),
  );
  if (hasBeginnerLabel) score += 10;

  score += beginnerBonus;

  // A docs/tutorial task is still approachable even if it TOUCHES an advanced
  // topic ("Add documentation for the kernel API"). When a beginner-safe
  // task-type marker fired, don't let content words about the topic drag the
  // fit below neutral — treat task-type, not topic, as complexity.
  const taskTypeMarker =
    /\b(?:docs?|document(?:ation)?|tutorial|guide|write|example|setup|getting started)\b/.test(text);
  score -= taskTypeMarker ? Math.min(advancedPenalty, beginnerBonus) : advancedPenalty;
  return Math.round(clamp(score));
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
  // Clarity = how well-described AND how approachable for a junior (G1 D16).
  // Blends the body-length clarity with the junior-fit signal.
  const rawClarity = scoreIssueClarity(input.issue.body, cfg);
  const fit = scoreJuniorFit(input.issue, cfg);
  const issueClarity = Math.round(clamp(rawClarity * (1 - cfg.fit.blend) + fit * cfg.fit.blend));

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