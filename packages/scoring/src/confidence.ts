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
