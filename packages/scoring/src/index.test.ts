import { describe, expect, it } from "vitest";
import { computeScore, scoreMaintainerResponsiveness, scoreIssueClarity } from "../src/index.js";

describe("scoring — maintainer responsiveness", () => {
  it("scores 0 when no metrics", () => {
    expect(scoreMaintainerResponsiveness(null, null, 0)).toBe(0);
  });

  it("scores high for fast response", () => {
    // 12h response, 80% merge rate, healthy sample
    const s = scoreMaintainerResponsiveness(12, 80, 40);
    expect(s).toBeGreaterThan(70);
  });

  it("scores low for slow response", () => {
    const s = scoreMaintainerResponsiveness(96, 20, 40);
    expect(s).toBeLessThan(60);
  });
});

describe("scoring — clarity", () => {
  it("scores 0 for short/empty body", () => {
    expect(scoreIssueClarity("")).toBe(0);
    expect(scoreIssueClarity("short")).toBe(0);
  });

  it("scores full for detailed body", () => {
    const long = "x".repeat(600);
    expect(scoreIssueClarity(long)).toBe(100);
  });
});

describe("computeScore — full pipeline", () => {
  const base = {
    repo: { archived: false, pushedAt: new Date(), stargazersCount: 500 },
    issue: {
      body: "Detailed repro steps and acceptance criteria for the fix.",
      state: "open" as const,
      pullRequestId: null,
      createdAt: new Date(Date.now() - 5 * 86_400_000), // 5 days old
    },
  };

  it("returns a score for healthy signals", () => {
    const r = computeScore({
      ...base,
      repoMetrics: {
        sampleCount: 40,
        medianFirstResponseHours: 16,
        mergeRate90d: 85,
        computedAt: new Date(),
      },
    });
    expect(r.score).toBeGreaterThan(50);
    expect(r.excluded).toBe(false);
    expect(r.confidence).toBe("high");
  });

  it("hard-filters an archived repo", () => {
    const r = computeScore({
      ...base,
      repo: { ...base.repo, archived: true },
      repoMetrics: {
        sampleCount: 40,
        medianFirstResponseHours: 16,
        mergeRate90d: 85,
        computedAt: new Date(),
      },
    });
    expect(r.excluded).toBe(true);
    expect(r.excludedReasons).toContain("repo_archived");
    expect(r.score).toBe(0);
  });

  it("hard-filters a PR record", () => {
    const r = computeScore({
      ...base,
      issue: { ...base.issue, pullRequestId: 123 },
      repoMetrics: {
        sampleCount: 40,
        medianFirstResponseHours: 16,
        mergeRate90d: 85,
        computedAt: new Date(),
      },
    });
    expect(r.excludedReasons).toContain("is_pr");
  });

  it("low confidence when few samples", () => {
    const r = computeScore({
      ...base,
      repoMetrics: {
        sampleCount: 3,
        medianFirstResponseHours: 16,
        mergeRate90d: 85,
        computedAt: new Date(),
      },
    });
    expect(r.confidence).toBe("low");
    expect(r.displayedScore).toBeLessThan(r.score);
  });
});