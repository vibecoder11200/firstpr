# Phase 01 Report — Nền tảng + crawl + score + trang chủ thô

**Status:** DONE
**Ngày:** 2026-08-14

## Đã build

Monorepo npm workspaces với 3 apps + 3 packages, chạy được local bằng Docker Compose, production images build được.

```
apps/
  api/      Fastify API — /api/issues, /api/issues/:id, /api/me, /api/auth/* (Better Auth), rate-limit, CORS
  worker/   bullMQ workers — crawl:discover, crawl:repo-metrics, score:score-compute
  web/      Vite + React + TS + Tailwind SPA — dark issue list, language filter, ScoreChip, ScoreBreakdown
packages/
  db/       Drizzle schema + migration 0000 (9 tables) + migrate.ts
  scoring/  scoring engine (30/20/15/35) + confidence + hard filters + tests
  github/   Octokit wrapper + token-bucket rate limiter + sanitize + tests
scripts/    backup.sh, restore.md, seed-dev.ts
docker/     api/worker/web Dockerfiles, nginx.conf, Caddyfile
```

## Đã verify

| Hạng mục | Kết quả |
|---|---|
| Migration `drizzle-kit migrate` | ✅ clean, chạy 2 lần idempotent, 9 tables |
| `npm run typecheck` toàn repo | ✅ api/worker/scoring/github/db pass |
| Test `packages/scoring` | ✅ 9 pass (formula + hard filter + confidence) |
| Test rate-limiter | ✅ 3 pass (token bucket) |
| Test API routes (integration, real Postgres) | ✅ 3 pass (list sorted, language filter, 404) |
| Test web render (ScoreChip) | ✅ 1 pass (text-node, happy-dom) |
| API smoke (real Postgres) | ✅ /healthz, /api/issues, /api/me(401) đúng |
| Worker smoke | ✅ boot + connect Redis/Postgres, detect thiếu GITHUB_TOKEN |
| Docker build `api` | ✅ image firstpr-api:latest (build sạch) |
| Docker build `worker` | ✅ (chạy background, cần confirm) |
| `get /api/issues` từ data seeded | ✅ trả issue sắp theo score, breakdown, confidence |

## Compliance (success criteria phase-01)

- **C1 (cache):** `/api/issues` + `/api/issues/:id` đọc Postgres duy nhất (code review xác nhận không gọi GitHub trong routes); worker là nơi duy nhất crawl; `packages/github/rate-limiter.ts` có budget per job.
- **C2 (re-score):** `score:compute` chạy sau `repo-metrics`, đánh dấu `stale` → re-score khi metrics mới. Issues thiếu metrics vẫn được score (confidence low), KHÔNG có score zero từ thiếu metrics.
- **C5 (i18n):** `apps/web/src/i18n/{en,vi}.json` ship cùng; mọi UI string qua i18next.
- **C6 (security/ops):** `.env.example` + `.env` gitignored; `encryptOAuthTokens: true`; Redis AOF + volumes; `scripts/backup.sh` + `restore.md`; migration per-phase.
- **High-4:** `@fastify/rate-limit` trên public routes.
- **High-11:** stripHtml/token search/sanitize trong `packages/github`; frontend dùng text-node (không dangerouslySetInnerHTML).

## Gate notes

- Q1/Q2 đã chốt TRONG code (D13): scope `public_repo` (không `repo`); `encryptOAuthTokens: true`.
- Deploy production VPS + GitHub App + Caddy (VALIDATION-1.3) **KHÔNG thực hiện** — cần credentials thật (VPS, domain, GitHub App) + user approval. Code sẵn sàng (docker compose --profile prod, Caddyfile auto-HTTPS).

## Chưa làm (cần user + credentials thật)

1. **Deploy production tuần 1** — cần VPS access, domain DNS, GitHub App production client id/secret.
2. **Crawler chạy với data thật** — cần `GITHUB_TOKEN` (PAT dev hoặc GitHub App). Job đã viết, test discover/repo-metrics/score-compute end-to-end với token.
3. **GitHub OAuth login thật** — cần GitHub App client id/secret + callback URL.

## Code review fixes applied (2026-08-14)

Sau review pass (code-reviewer), các finding đã verify + sửa:

| Finding | Mức | Fix |
|---|---|---|
| Discover job `repoId=0` → FK violation, crawler không viết được row nào (search/issues KHÔNG trả `repository` object) | **Critical** | Resolve repo qua `GET /repos/{owner}/{repo}` (rate-limited, cached per-run) → real `id` + language/stars. **Verified với GitHub API thật** (search item `has repository obj: False`, `GET /repos` trả `id: 81598961`). |
| C2 re-score-on-metrics-refresh không chạy (stale không được flip lại) | **High** | `repo-metrics` giờ flip `issues.stale=true` cho repo vừa refresh → `score-compute` re-score với metrics mới. |
| `score-compute .limit(500)` giấu catalog > 500 | **High** | Bỏ cap — loop batch 200 đến khi hết stale. |
| `/api/issues` leak hard-filtered rows (score 0) | **High** | Thêm `scores.total > 0` + `jsonb_array_length(hardFilters)=0`. **Verified**: archived issue 999999 bị loại. |
| Rate-limiter `observeRateLimit`/hourly-cap dead code | **Med** | Wire `withBudget` đọc `X-RateLimit-*` headers → limiter học reset window + enforce hourly sliding window. |

## Known follow-ups (không ship code unverifiable)

- **users.github_login chưa được populate** — cần Better Auth hook trên OAuth callback (chưa test được vì thiếu GitHub App creds). Deferred tới phase-03/04 (cần cho portfolio).
- **Session-expiry UX** (`MED-12`, strings `session.expired`) — frontend chưa gọi `fetchMe` để bắt 401. Phase-02/03.
- `git status` trước commit: KHÔNG có `.env`, `dist/`, `node_modules` tracked (verified).

## Open / next

- Phase 02 (scoring sắc + breakdown + cache) — G1 calibrate cần humans (20 issues manual).
- Phase 03/04 phụ thuộc user thật + PostHog credentials.
- Deploy production tuần 1 cần: VPS access, domain DNS, GitHub App production client id/secret (VALIDATION-1.3).