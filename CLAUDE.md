# CLAUDE.md

Guidance for Claude Code (claude.ai/code) and contributors working in this repository.

---

## Project Overview

**FirstPR** — an open-source contribution finder that helps junior developers find genuinely good issues (scored by maintainer responsiveness, repo health, freshness, and clarity) and turn contributions into a job-seeking portfolio.

- **Status:** Phase-01 (foundation) implemented. Not yet in production.
- **Bilingual:** English is the working language; Vietnamese is the secondary content language. See `README.md` (EN) / `README_Vi.md` (VI).
- **Key docs:**
  - `docs/02-research.md` — market research + feasibility
  - `docs/03-design.md` — scoring model + portfolio design
  - `docs/04-roadmap.md` — MVP roadmap (weeks 1–4)

---

## Git & Commit Rules (MANDATORY)

1. **Never add attribution trailers.** Commits must NOT contain `Co-Authored-By:`, `Signed-off-by:` (unless the user explicitly asks), "Generated with", "via X", or any author-credit lines of any kind. A commit is: conventional subject + body. Nothing else.

   ✅ Good:
   ```
   docs: document the scoring model criteria

   Explain the four weighted criteria and the hard filters
   (archived / stale repos) so scoring behavior is explicit
   and testable before implementation.
   ```

   ❌ Bad:
   ```
   docs: document the scoring model criteria

   Generated with [Claude Code](https://claude.ai/code)
   via [Happy](https://happy.engineering)

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

2. **Follow Conventional Commits.** Subject format: `type(scope): short summary`. Allowed types:

   | Type | Meaning |
   |---|---|
   | `feat` | new capability |
   | `fix` | bug fix |
   | `docs` | documentation only |
   | `refactor` | behavior unchanged |
   | `perf` | performance |
   | `test` | tests |
   | `build` / `ci` | build system / CI |
   | `chore` | maintenance |
   | `style` | formatting, no logic change |
   | `i18n` | localization / translations |

3. **Always write a body (description).** Explain **what** changed and **why**. Reference the issue/PR id when relevant. A one-line subject is allowed only for trivial commits (typo, rename, single-line fix).

4. **Keep commits focused** — one logical change per commit. Do not mix refactors with fixes or docs with feature work.

5. **Never commit secrets.** No `.env`, tokens, API keys, credentials, or personal data. `git status` before committing; check staged files.

---

## i18n & Localization Rules (MANDATORY)

The product will ship in **multiple languages**, and bilingual authoring (English + Vietnamese) is already the project pattern. These rules apply to all code and content:

1. **Never hardcode user-facing strings.** Every string a user sees — UI labels, buttons, messages, errors, dates, numbers, currency — MUST be externalized through the i18n layer and keyed by locale. No literal sentences inside components, templates, or business logic.

2. **Never hardcode a language.** Do not assume English, do not embed a locale or language value in component code, and do not render content from a non-locale-aware variable. Language selection comes from locale negotiation (browser / URL / profile / config), never from a hardcoded default buried in code.

3. **The i18n catalog is the single source of truth.** All translations live in locale catalogs (e.g., `en`, `vi`, …). The default locale is `en`. When a feature is added, every supported catalog gets its keys in the same change — features must not ship English-only unless explicitly scoped.

4. **Locale-aware formatting.** Dates, numbers, plurals, and text direction are rendered through i18n-aware helpers — never manual string concatenation.

5. **Bilingual docs follow the existing pattern.** User-facing docs mirror `README.md` (EN) + `README_Vi.md` (VI) unless the document is explicitly internal. Internal docs, code comments, and commit messages stay in English.

6. **Translations live only in catalogs.** No translated content inside code, comments, or commit bodies.

7. When the i18n framework is chosen (concept stage today), use its standard extraction and formatting helpers over bespoke string building.

---

## How to Run Locally (Phase-01)

Monorepo: `apps/{api,worker,web}` (npm workspaces) + `packages/{db,scoring,github}`.

```bash
# 0. Install (first time)
npm install

# 1. Env — copy template & fill GitHub OAuth creds (required for auth/crawl)
cp .env.example .env
#   BETTER_AUTH_SECRET:  openssl rand -base64 32
#   GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET: GitHub OAuth App
#   GITHUB_TOKEN: PAT (dev) to enable the crawler

# 2. Infra — Postgres + Redis (volumes persist, AOF on for Redis)
docker compose up -d postgres redis

# 3. Migrations (per-phase; idempotent)
npm run db:migrate

# 4. Run all three apps (api :4000, worker, web :3000)
npm run dev

# 5. Tests
npm test
```

**Production compose:** `docker compose --profile prod up` (adds Caddy + db-backup).
**Dev seed data:** `node --import tsx scripts/seed-dev.ts` (inserts sample issues for visual work).

Rate-limit note (C1): the API only reads Postgres; crawling happens in the worker and goes through `packages/github/rate-limiter.ts` (Search 30 req/min, REST 12.5k/h). Never add live GitHub calls to API routes.
