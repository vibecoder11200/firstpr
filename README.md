# 🌱 FirstPR

> Find genuinely good open-source issues for your **first PR** — and build a job-seeking portfolio from it.

**Status:** Concept + Design. Not implemented.

**[🇻🇳 Tiếng Việt](README_Vi.md)** · English

> 📚 **Start here:** the full story lives in [`docs/index.md`](docs/index.md) — read everything in the documented order.

---

## About

**FirstPR** helps **junior developers** enter open source more easily:

- **Find genuinely good issues** — not just "issues with the `good first issue` label", but issues with a *high chance your PR gets merged and you get maintainer support*, based on behavior scoring (maintainer responsiveness, repo health, freshness, clarity).
- **Walk the full journey** — from learning roadmap → first-PR checklist → real outcome tracking.
- **Automatic portfolio** — every contribution becomes a living, shareable job-application profile.

---

## Differentiation

| Question | Answer |
|---|---|
| **How does goodfirstissue.dev filter?** | By the `good first issue` label |
| **How does FirstPR filter?** | By **behavior**: responsiveness + merge rate + freshness — §1.2–1.4 |
| **Where do they stop?** | "Find issue", done |
| **How far does FirstPR go?** | **Full journey to a job portfolio** |
| **Trust?** | **Per-criterion breakdown + confidence score** |
| **Self-improving?** | Outcome feedback loop → model **improves over time** |

---

## Documents

| File | Content |
|---|---|
| [`nghien-cuu-open-source-contribution-finder.md`](nghien-cuu-open-source-contribution-finder.md) | Market research + feasibility + source verification |
| [`thiet-ke-scoring-va-portfolio-open-source-contribution-finder.md`](thiet-ke-scoring-va-portfolio-open-source-contribution-finder.md) | Scoring model + portfolio design |
| [`roadmap-mvp-open-source-contribution-finder.md`](roadmap-mvp-open-source-contribution-finder.md) | MVP build roadmap (weeks 1–4) |
| [`docs/01-vision-strategy.md`](docs/01-vision-strategy.md) | Vision, problem, timing, personas, competitors, metrics, scope |
| [`docs/02-business-model.md`](docs/02-business-model.md) | Monetization — who pays, when, how |
| [`docs/03-decisions-handoff.md`](docs/03-decisions-handoff.md) | Decisions log + open questions + handoff checklist |
| [`docs/04-oss-maintenance.md`](docs/04-oss-maintenance.md) | Solo-OSS operation playbook (risks, maintenance schedule) |

---

## Scoring Model (summary)

```
Score (0-100) = 30%·MaintainerResponsiveness + 20%·RepoHealth + 15%·IssueFreshness + 35%·IssueClarity
```

- **IssueClarity 35%** — junior understanding the task is decisive (FSE 2020: unclear issues are failure reason #1).
- **MaintainerResponsiveness 30%** — getting help is what makes a PR succeed (ICSE 2023: ~70% of GFIs have expert participation, ~8.5h response).
- **RepoHealth 20%** — repo is alive (hard filter: archived / no push > 90 days → drop).
- **IssueFreshness 15%** — issue is fresh (hard filter: open > 180 days → drop).

Full details: [`thiet-ke-scoring-va-portfolio-open-source-contribution-finder.md`](thiet-ke-scoring-va-portfolio-open-source-contribution-finder.md)

---

## MVP Roadmap (summary)

| Week | Goal |
|---|---|
| **1** | Foundation + crawl ~1,000 issues + scoring v1 + basic UI |
| **2** | Calibrate score + per-criterion breakdown UI + cache |
| **3** | 5–10 real users + funnel tracking + pivot/continue gate |
| **4** | Portfolio v1 + OG image + badges |

Full details + decision gates: [`roadmap-mvp-open-source-contribution-finder.md`](roadmap-mvp-open-source-contribution-finder.md)

---

## Key Research

| Source | Finding |
|---|---|
| [FSE 2020](https://doi.org/10.1145/3368089.3409746) | The `good first issue` label **does not guarantee** success — 9,368 GFIs / 816 repos |
| [ICSE 2023](https://arxiv.org/abs/2302.05058) | ~70% of GFIs have expert participation, ~8.5h response; **experts help merge but reduce retention** |
| [GitHub Docs](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) | Rate limits: unauth 60/h, auth 5,000/h, GitHub App up to 12,500/h |

---

## Disclaimer

This is concept-stage design. Scoring weights are **priors** (research-based assumptions) — real weights must be learned from the outcome feedback loop once real data exists. Not yet a working product.
