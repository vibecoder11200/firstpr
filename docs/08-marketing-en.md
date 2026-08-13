# FirstPR — Story & Marketing Playbook (EN)

> This file captures **how to explain FirstPR to a stranger** (from simple → storytelling) — raw material for marketing: landing page, blog, community posts, video. It contains both character stories (Minh ✅ / Ngọc ❌) for "before–after" comparison content.
>
> 🇻🇳 [Tiếng Việt](08-marketing.md) · English

**Date:** 2026-08-14
**Status:** Concept + Design. Not yet implemented.
**Audience:** Owner, marketer, storyteller / content creator.

---

## 1. A note for marketers

This is a **told-back document**, not a technical one. Goal: anyone understands FirstPR **without reading** `01-vision.md` or `03-design.md`.

- **§2–4** — explainer styles from "simplest" to "with depth". Pick by the listener's level.
- **§5** — Minh's story ✅ (with FirstPR) — positive emotion, the "dream scenario".
- **§6** — Ngọc's story ❌ (without FirstPR) — the pain, the "no-product scenario".
- **§7** — before/after comparison table — for comparison-style posts.

> 💡 **Caveat:** Both stories are **pure fiction**, not a "real testimonial". Before publishing them as testimonials, replace with real user stories (after MVP weeks 3–4 when there are 5–10 users).

> ⚠️ **What to hold back or soften:** The "good first issue" market and the phrase "pick the right issue to get merged" are the product promise (the edge), but **don't oversell** it as "guaranteed to merge". The research-accurate wording is *"high likelihood of getting merged & supported"*. See `02-research.md` (the GFI-label caveat).

---

## 2. Explainer for a stranger (no jargon)

### The context: what problem does a junior dev have?

A fresh graduate (junior) wants to do open source to:
- Actually learn to code.
- Have something to "put on the CV" when applying for jobs.

They go on GitHub and look for issues labeled **"good first issue"** ("issues friendly to beginners"). Sounds right, but the reality is a **trap**:

- The repo died long ago; nobody replies.
- The issue has been open for 2 years; nobody touches it.
- They finish, submit a PR, and **nobody responds**.
- A beginner tries this a few times → demoralized, quits.

**Academic research confirms it:** the `good first issue` label **does not guarantee** success. Many newcomers fail repeatedly, mostly because they pick an obscure issue, a dead repo, or an indifferent maintainer. (See `02-research.md` — FSE 2020.)

### So what does FirstPR do? — a concrete example

Think of it like a **broker who already surveyed the market**:

**Step 1 — It scans GitHub itself,** listing thousands of open issues.

**Step 2 — It scores each issue 0–100** based on real behavior:
- Is the repo alive? (any commit in the last 90 days?)
- Does the maintainer reply fast? (median < 24h → high score)
- What % of PRs actually get merged? (80% → a repo with receipts)
- Is the issue clear? (detailed description, names the file, small scope?)

**Step 3 — It shows a ranked list:** which issues score high, **with the reason why**. You glance and think "ah, this repo is alive, the maintainer replies fast, the issue is small and clear — it fits me."

> **The core:** instead of "randomly picking an issue with a pretty label", the user picks an issue where **the data says they'll almost certainly get help and their PR gets accepted**.

### Part two: not just "find" but "make it yours"

You finish your first issue, the PR gets merged 🎉 → FirstPR **auto-creates a portfolio page** (a living CV):

- Hero: avatar + handle + total PRs merged.
- The projects you contributed to, with evidence (real PR links).
- **A timeline:** "issue #123 on repo X → PR merged 12/08".

Copy a **single link to send a recruiter**. Every time you contribute more, the page updates itself — no manual work.

> **Key point:** the portfolio **only shows PRs actually merged** (checked via the GitHub API) → it is **evidence, not boasting**. The VN market distrusts inflated claims, so evidence is where trust lives.

### In three sentences

1. **Problem:** juniors want to do open source but keep picking "dead" issues, then nobody responds → they give up.
2. **What FirstPR does:** scans GitHub, **scores how "worth doing" each issue is based on real behavior** (alive repo, fast maintainer, high merge rate, clear issue) → helps beginners pick right.
3. **And it goes further:** auto-turns merged PRs into an **evidence-backed job-search portfolio** — a reason to come back, and something to send recruiters.

---

## 3. The essence (deeper explanation)

- **"Quality" = probability a newcomer's first PR gets merged & supported** — not "is this issue interesting". This is the core principle in `03-design.md`.
- **How it differs from competitors:**
  - goodfirstissue.dev filters by **label** → FirstPR filters by **behavior** (responsiveness + merge rate + freshness).
  - They stop at "find an issue" → FirstPR takes the **whole journey to a job portfolio**.
  - They don't measure trust → FirstPR's **per-criterion breakdown + confidence score**.
  - They never improve → the **outcome feedback loop** makes the model steadily better.
- **Vietnam wedge:** nobody has built the "VN newcomer journey". Gitista only **measures** who is already active; it does not **pull newcomers from zero**. Distribution channels: VN dev Facebook/TG/Discord groups; "first-PR testify" content is easily viral.
- **Locked in:** positioning = **VN community tool (OSS)**, public repo + MIT, dogfooding. (See `05-business.md`, `06-oss.md`.)

---

## 4. Numbers to drop into any story

> Use to give the story data-backed weight. Pulled from `02-research.md`.

- **FSE 2020:** the `good first issue` label does not guarantee success — 9,368 GFIs / 816 repos.
- **ICSE 2023:** ~70% of GFIs have expert participation; half get their first response within **8.5h** → responsiveness is **measurable**; expert help raises success but **lowers retention** (newcomers don't come back).
- **GitHub rate limits (why we build our own):** unauth 60 req/h, auth 5,000/h, GitHub App up to 12,500/h. Search API: 30 req/min, a query returns max 1,000 results → design for background crawl + cache.

---

## 5. User story: Minh ✅ (with FirstPR)

> The "dream scenario" — positive emotion, near future. Use for landing page / intro video.

**Character: Minh, 22, junior dev, Ho Chi Minh City.**

Minh knows code (JavaScript, Python) but has no real work experience. The CV's "experience" section is empty. Friends say *"do open source, then show it to recruiters."* The catch: Minh tried once before and lost a whole week — picked a random `good first issue`, coded it, submitted a PR, and **nothing was answered for 6 months** (the repo was dead). Minh was demoralized.

Now, a friend introduces Minh to **FirstPR**.

**⏰ Saturday 20:00** — Lands on the home page. Not a bare list of issues but a **scored list with reasons**:

| Issue on repo X | Score **87** |
|---|---|
| 🟢 Repo alive | commits in the last 3 days |
| 🟢 Maintainer responds | median **5 hours** |
| 🟢 PR merge rate | **84%** |
| 🟢 Issue is clear | 300-char description + names file `validate.js` |

Next to it a few redder issues (scores 30–40) with small notes *"repo hasn't pushed in 100 days"*, *"not enough data"*. **You see the why at a glance.** Minh thinks *"this is a place that tells the truth."*

**⏰ 20:30** — Filters by language JavaScript, sorts by score. Top hit is an issue scoring **88**, with a concrete description:

> *"Fix: when the search box is empty, the page throws an error. Need to validate before calling the API. See `search.js` line 45."*

Minh understands the task, small scope. Clicks **"I'll work on this issue"** (the system records it to track the outcome).

**⏰ Tuesday 21:00** — A recruiter messages *"send over your CV"*. Minh sends **one link**: `firstpr.vn/minh`. The count is still 0 at this point — Minh is a bit embarrassed but sends it anyway with *"I'm contributing to open source, here's my progress page."* *(The nice part: the page only shows genuinely merged PRs → the recruiter knows it isn't made up.)*

**⏰ Thursday 20:00** — Codes for 1.5 hours, done. Opens a PR with the exact instructions the issue asked for. **That night the maintainer replies**: *"thanks — I noticed this spot too…"* — exactly what the data promised. (Last time, with the dead issue, Minh never got this message.)

**⏰ Next week 14:00 — Merged 🎉** FirstPR picks up the signal from the GitHub API and automatically:
1. Adds a project card to the portfolio + real PR link.
2. Updates merged-PR total: **1**.
3. Adds a timeline entry: *"issue #123 · repo X → PR merged 21/08"*.
4. Auto-generates an **OG image** for Facebook/Telegram/Zalo.

**⏰ 14:10 — Viral:** Minh shares on Facebook:

> *"👋 My first PR just got merged on an open-source project! Open source used to leave me frustrated, but now I get why picking an issue the maintainers actually care about changes everything. My journey 👇"* + portfolio link.

Nice OG image, friends in VN dev groups click → a few juniors try it → **the viral loop**.

**⏰ 1 month later:** Minh's portfolio has **3 merged PRs, 2 issues helped**. FirstPR has learned which issues really succeed in Vietnam (the outcome feedback loop) → the model gets better the longer it runs, and gets harder to copy. And **the recruiter calls Minh for an interview 🎯**

---

## 6. User story: Ngọc ❌ (without FirstPR)

> The "no-product scenario" — the pain, the emotional hook. Use for before/after comparison content, or the "problem" section of a landing page.

**Character: Ngọc, 22, Minh's classmate, also hasn't found FirstPR.** A perfect counter: same starting point, same goal — only one difference, Ngọc doesn't have FirstPR.

**⏰ Saturday 20:00 (same time as Minh)** — Ngọc goes on GitHub, hearing the words **"good first issue"**. Filters → **a mountain of issues**: no scores, no ranking, no explanation. Ngọc freezes: *"Which one is 'good'? Which one can I do?"* → picks by gut feel (a familiar-looking title), **gambling**: can't tell if the repo is alive, the maintainer replies, or the PR gets merged.

**⏰ 20:30** — Clicks an issue titled "*A few small improvements*" — a **2-line** description, no idea what to do, no file named. Ngọc thinks *"must be easy, I'll figure it out"*. Ngọc doesn't know the repo **hasn't been committed to in 4 months** (data that, with FirstPR, would have flashed red).

**⏰ Tuesday 21:00** — A recruiter messages Ngọc *"send over your CV"*. Ngọc **opens the old CV** — "experience" is bare. Nothing proves any open-source contribution, because **nothing is finished yet**. Ngọc sends the CV with a deflated feeling. *(Meanwhile, Minh mailed off a portfolio link that's slowly growing.)*

**⏰ Thursday 20:00** — Ngọc codes in full "wing-it" mode: a vague issue → **guessing what to do**. Opens a PR asking *"am I on the right track?"* → **total silence**: 1 day, 2 days, 1 week, nobody replies. Ngọc doesn't know what Ngọc doesn't know: the repo is dead, the issue is vague, **it's a PR to something nobody cares for.**

**⏰ 3 weeks later** — The only response:

> *"Thanks. But this repo is switching to a different stack, so we won't be merging anymore."*

Two sentences destroy 3 weeks of work. The PR sits there, never merged.

**⏰ The end:** Ngọc is **demoralized** — *"open source isn't for me"* — and goes back to job-hunting empty-handed. The CV is still bare, the recruiter still hasn't called. **Meanwhile Minh that same week: 1 merged PR, an evidence-backed portfolio, already on the second PR.**

> 💡 **Research calls this the "retention gap":** newcomers try, then **don't come back** — precisely because of experiences like Ngọc's. FirstPR exists to patch that hole: pick the right issue, get help, see the PR succeed, then come back.

---

## 7. The at-a-glance before/after table

> Content for an "image comparison" or a landing-page table.

| Moment | Ngọc (without FirstPR) | Minh (with FirstPR) |
|---|---|---|
| Picking an issue | Guesses by gut feel | Clear score + reason |
| Knows the repo is alive? | ❌ No | ✅ Yes (score + red warning line) |
| Knows the maintainer replies fast? | ❌ No | ✅ Yes |
| PR gets merged? | ❌ Dropped after 3 weeks | ✅ Merged, recorded automatically |
| Portfolio | ❌ Empty-handed | ✅ An evidence-backed link |
| Feeling | 😞 "Open source isn't for me" | 🎉 "I can do this!" |

> **Marketing truth:** people don't quit open source because they don't want to; they quit because **nobody helps them pick well** and **nobody turns the effort into something they can show off.**

---

## 8. Channel-adaptation ideas

- **Landing page hero:** "Pick the right issue, not just any issue." + a demo CTA.
- **Blog:** "Why most newcomers quit open source after their first attempt" (ICSE 2023, retention gap).
- **VN dev group posts:** the Ngọc vs Minh comparison (§7) with an image.
- **60-second video:** replay Minh's journey from Saturday → Merge → portfolio share (§5).
- **Testimonials (after MVP weeks 3–4):** replace the fictional stories with real users and real portfolio links.

---

## 9. Sources & references

- `01-vision.md` — vision, problem, solution, persona, competitors.
- `02-research.md` — market evidence & academic verification.
- `03-design.md` — scoring + portfolio details.
- `05-business.md`, `06-oss.md` — positioning C (OSS), monetization.
- Research: FSE 2020 (GFI does not guarantee success), ICSE 2023 (responsiveness measurable, retention gap).