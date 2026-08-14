import { describe, expect, it } from "vitest";
import { computeScore, scoreMaintainerResponsiveness, scoreIssueClarity, scoreJuniorFit } from "../src/index.js";

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
    repo: { archived: false, isBotOwned: false, pushedAt: new Date(), stargazersCount: 500 },
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

  it("hard-filters a bot-owned repo (anti-gaming)", () => {
    const r = computeScore({
      ...base,
      repo: { ...base.repo, isBotOwned: true },
      repoMetrics: {
        sampleCount: 40,
        medianFirstResponseHours: 16,
        mergeRate90d: 85,
        computedAt: new Date(),
      },
    });
    expect(r.excluded).toBe(true);
    expect(r.excludedReasons).toContain("repo_bot_owned");
    expect(r.score).toBe(0);
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

  it("blends junior-fit into clarity: docs-safe beats advanced kernel bug", () => {
    const metrics = {
      sampleCount: 30,
      medianFirstResponseHours: 16,
      mergeRate90d: 85,
      computedAt: new Date(),
    };
    const docsSafe = computeScore({
      ...base,
      repoMetrics: metrics,
      issue: {
        ...base.issue,
        title: "Write a tutorial and docs guide for the setup",
        labels: ["good first issue"],
      },
    });
    const advanced = computeScore({
      ...base,
      repoMetrics: metrics,
      issue: {
        ...base.issue,
        title: "LoRAMLPv6.apply: 17 positional parameters, kernel internals, unsafe FFI",
        labels: [],
      },
    });
    // Advanced task must no longer out-score the beginner-safe docs task.
    expect(advanced.score).toBeLessThan(docsSafe.score);
  });
});

describe("scoreJuniorFit — task approachability (D16)", () => {
  it("neutral when no markers", () => {
    const s = scoreJuniorFit({
      body: "A plain description.",
      state: "open",
      pullRequestId: null,
      createdAt: new Date(),
    });
    expect(s).toBe(50);
  });

  it("scores beginner-safe docs/tutorial markers high", () => {
    const s = scoreJuniorFit({
      body: "Add documentation for the setup guide and a tutorial example.",
      title: "Document how to write a user guide",
      state: "open",
      pullRequestId: null,
      createdAt: new Date(),
      labels: ["good first issue"],
    });
    expect(s).toBeGreaterThan(60);
  });

  it("penalizes advanced complexity markers", () => {
    const s = scoreJuniorFit({
      body: "LoRAMLPv6.apply takes 17 positional parameters and touches kernel internals with unsafe pointers.",
      title: "Fix the 17 positional parameters",
      state: "open",
      pullRequestId: null,
      createdAt: new Date(),
    });
    expect(s).toBeLessThan(40);
  });

  it("does not let a docs task about an advanced topic fall below neutral", () => {
    // "Write documentation for the kernel API" is still a beginner-fit task —
    // the docs task-type marker must win over the "kernel" content word.
    const s = scoreJuniorFit({
      body: "Document the kernel and its state machine so newcomers understand how the 17 positional parameters work.",
      title: "Write documentation for the kernel API",
      state: "open",
      pullRequestId: null,
      createdAt: new Date(),
    });
    expect(s).toBeGreaterThanOrEqual(50);
  });
});