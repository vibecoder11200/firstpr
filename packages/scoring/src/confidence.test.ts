import { describe, expect, it } from "vitest";
import { computeConfidence } from "./index.js";
import { confidenceFactor, confidenceReason } from "./confidence.js";

const metrics = (partial: { sampleCount: number; computedAt?: Date }) => ({
  sampleCount: partial.sampleCount,
  medianFirstResponseHours: 16,
  mergeRate90d: 80,
  computedAt: partial.computedAt ?? new Date(),
});

describe("confidence — Q4 rule", () => {
  it("is low when repo_metrics missing", () => {
    expect(computeConfidence(null)).toBe("low");
  });

  it("is low when fewer than 10 samples", () => {
    expect(computeConfidence(metrics({ sampleCount: 9 }))).toBe("low");
  });

  it("is medium at 10–29 samples", () => {
    expect(computeConfidence(metrics({ sampleCount: 10 }))).toBe("medium");
    expect(computeConfidence(metrics({ sampleCount: 29 }))).toBe("medium");
  });

  it("is high at 30+ samples", () => {
    expect(computeConfidence(metrics({ sampleCount: 30 }))).toBe("high");
  });

  it("is low when metrics are older than 30 days even with many samples", () => {
    const stale = new Date(Date.now() - 31 * 86_400_000);
    expect(computeConfidence(metrics({ sampleCount: 50, computedAt: stale }))).toBe("low");
  });
});

describe("confidenceFactor", () => {
  it("applies the Q4 display-weight factors", () => {
    expect(confidenceFactor("high")).toBe(1);
    expect(confidenceFactor("medium")).toBe(0.9);
    expect(confidenceFactor("low")).toBe(0.7);
  });
});

describe("confidenceReason", () => {
  it("maps low reasons to the right i18n keys", () => {
    expect(confidenceReason("high", metrics({ sampleCount: 50 }))).toBe("confidence.high");
    expect(confidenceReason("medium", metrics({ sampleCount: 20 }))).toBe("confidence.medium");
    expect(confidenceReason("low", metrics({ sampleCount: 3 }))).toBe("confidence.lowSamples");
    expect(confidenceReason("low", metrics({ sampleCount: 3, computedAt: new Date() }))).toBe(
      "confidence.lowSamples",
    );
    expect(
      confidenceReason("low", metrics({ sampleCount: 50, computedAt: new Date(Date.now() - 31 * 86_400_000) })),
    ).toBe("confidence.stale");
  });
});
