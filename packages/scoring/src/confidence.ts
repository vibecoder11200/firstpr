import { computeConfidence, DEFAULT_CONFIG, type ScoreInput } from "./index.js";

/**
 * Confidence helpers — phase-02 Q4 rule, kept in a dedicated module so the
 * UI can mirror the exact wording. Rule:
 *   low    — sample_count < 10 OR metrics computed > 30 days ago
 *   medium — ≥ 10 samples but < 30
 *   high   — ≥ 30 samples and fresh
 */
export const confidenceLabel = computeConfidence;

export function confidenceFactor(
  confidence: "low" | "medium" | "high",
): number {
  return confidence === "high" ? 1 : confidence === "medium" ? 0.9 : 0.7;
}

/** One-line human explanation for why confidence is what it is (i18n key). */
export function confidenceReason(
  confidence: "low" | "medium" | "high",
  input: ScoreInput["repoMetrics"],
): string {
  if (confidence === "high") return "confidence.high";
  if (confidence === "low") {
    if (!input || input.sampleCount < DEFAULT_CONFIG.confidence.minSamplesMedium)
      return "confidence.lowSamples";
    return "confidence.stale";
  }
  return "confidence.medium";
}

/**
 * Display score after the confidence adjustment (Q4): the persisted composite
 * `total` scaled by the confidence factor. Single source used by API + UI so
 * the card, the drawer, and the detail endpoint always agree.
 */
export function displayedScore(
  total: number | null | undefined,
  confidence: "low" | "medium" | "high",
): number {
  if (total == null) return 0;
  return Math.round(total * confidenceFactor(confidence));
}

/**
 * Display weights as whole percentages, derived from the scoring config so the
 * UI never hardcodes the 30/20/15/35 split. Single source for both routes.
 */
export function displayWeights(): {
  maintainer: number;
  repoHealth: number;
  freshness: number;
  clarity: number;
} {
  return {
    maintainer: Math.round(DEFAULT_CONFIG.weights.maintainer * 100),
    repoHealth: Math.round(DEFAULT_CONFIG.weights.repoHealth * 100),
    freshness: Math.round(DEFAULT_CONFIG.weights.freshness * 100),
    clarity: Math.round(DEFAULT_CONFIG.weights.clarity * 100),
  };
}
