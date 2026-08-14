---
phase: 1
title: "Nền tảng + crawl + score + trang chủ thô"
status: DONE (2026-08-14)
priority: P1
dependencies: []
---

# Phase 1: Nền tảng + crawl + score + trang chủ thô

## Overview

Tuần 1: dựng nền tảng chạy được (repo, Docker, Postgres, Fastify, Drizzle), set up GitHub App + Better Auth OAuth, crawl ~1.000 issues đầu (Python/JS/TS), tính score v1 (heuristic), và có một trang chủ SPA hiển thị danh sách issue. **Điều chỉnh từ red-team:** worker job `repo-metrics` (median_first_response, merge_rate_90d) phải có TRONG phase-01 — nếu không phase-01 scoring không chạy được (responsiveness = 0, hard filter vô hiệu). Secrets/encryption/migration/backup phải vào phase-01 (C6).

## Requirements

- Functional:
  - Repo khởi tạo: monorepo nhỏ (`apps/web`, `apps/api`, `apps/worker` hoặc `packages` chia share code).
  - Postgres schema: `repos`, `issues`, `scores`, `users`, `accounts`, `sessions`, `verifications` (auth), `repo_metrics`, `contributions` (chuẩn bị cho portfolio).
  - GitHub OAuth login bằng Better Auth → user có session + lưu accessToken (encrypted) vào `account`.
  - Crawler v1: Search API `label:"good first issue"` + `language:Python|TypeScript|JavaScript` + **date-range split** (tránh cap 1.000/query), lưu raw issues vào Postgres (upsert).
  - Pipeline scores: crawler → `repo-metrics` job → `score:compute` (4 nhóm theo `03-design` §1.1–1.5, normalization + hard filter). **repo-metrics nằm TRONG phase-01.**
  - API: `GET /api/issues` (sắp theo score, filter ngôn ngữ), `GET /api/auth/*` (Better Auth), `GET /api/me`, `GET /api/issues/:id` (breakdown). Đọc từ Postgres.
  - Frontend: trang chủ danh sách issue + filter ngôn ngữ + score chip + **GET /api/issues/:id breakdown drawer**. Dark theme mặc định (design research).
- Non-functional:
  - User load LUÔN đọc từ Postgres cache — KHÔNG query GitHub trực tiếp (C1).
  - Chạy được local bằng Docker Compose.
  - ESM (`"type": "module"`), Node 22, TS.
  - i18n: mọi string trong catalog `en`/`vi`, ship en+vi cùng change (C5).
  - **Secrets:** `.env.example` + `.env` gitignored; KHÔNG commit secret (bắt buộc, house rule CLAUDE.md).
  - **Request budget:** bảng request/day vs req/min vs req/h theo job type (C1).
  - **Django-grade migration:** drizzle-kit generate/migrate chạy clean on deploy; per-phase migration.

## Architecture

```
SPA (Vite/React/Tailwind)  ──▶  API (Fastify, /api/*)  ──▶  Postgres (cache + auth)
                                   │                        ▲
                                   └── worker (bullMQ + Redis) ──▶  GitHub API (Search)
```

- **Web (Fastify):** routes `/api/issues`, `/api/auth/*`, `/api/me`. Đọc từ Postgres. Không gọi GitHub trực tiếp.
- **Worker (bullMQ):** nhận job `crawl:discover` (Search API → lưu raw) + `crawl:repo-metrics` (tính responsiveness/health). Redis là queue.
- **Auth:** Better Auth, catch-all route `/api/auth/*` trên Fastify, `trustedOrigins`, CORS trước handler.

## Related Code Files

- Create:
  - `docker-compose.yml` (postgres + volumes, redis + AOF/volumes, api, worker, web, caddy, `db-backup` service)
  - `apps/api/package.json`, `apps/api/src/server.ts`, `apps/api/src/lib/auth.ts`, `apps/api/src/lib/db.ts`, `apps/api/src/plugins/rate-limit.ts`, `apps/api/src/routes/issues.ts`, `apps/api/src/routes/auth.ts`, `apps/api/src/routes/issue-detail.ts`
  - `apps/worker/package.json`, `apps/worker/src/index.ts`, `apps/worker/src/jobs/{discover,repo-metrics,score-compute}.ts`, `apps/worker/src/lib/rate-limiter.ts`
  - `apps/web/package.json`, `apps/web/src/*` (Vite scaffold), `apps/web/src/i18n/{en,vi}.json`, `apps/web/src/components/{ScoreChip,ScoreBreakdown,IssueCard}.tsx`
  - `packages/db/` (Drizzle schema + `drizzle-kit` config + migrations)
  - `packages/scoring/` (module tính score, dùng chung api+worker)
  - `packages/github/` (Octokit client wrapper)
  - `.env.example` (placeholders; `.env` gitignored, không commit)
  - `scripts/backup.sh` (pg_dump cron) + `scripts/restore.md` (runbook)
- Modify:
  - `apps/api/src/lib/auth.ts` (secrets, encryptOAuthTokens)
  - `CLAUDE.md` (thêm mục "Cách chạy local" nếu cần)
  - `docs/07-decisions.md` (log D12: repository layout + tooling; D13: Q1 scopes + Q2 encrypt)
- Delete: (none)

## Implementation Steps

1. **Khởi tạo monorepo** — npm workspaces, `packages/db`, `apps/{api,worker,web}`, `docker-compose.yml` (postgres:16 + volumes, redis:7 + AOF enabled + appendonly, api, worker, web, caddy). `npm run dev` chạy cả 3. **Cài đặt Redis TẮT persistence:** `appendonly yes` + volume để job queue không mất khi restart (HIGH-8).
2. **Secrets + infra security (C6)** — `.env.example` (BETTER_AUTH_SECRET, DATABASE_URL, REDIS_URL, GITHUB_APP params, PostHog key), `.env` gitignored. Redis `--protected-mode` + bind localhost + không expose port ngoài. **Checklist gate:** verify không secret nào trong git diff trước khi cấu Caddy production (HIGH-5).
3. **Drizzle schema + migration (CRIT-3)** — migrate với `drizzle-kit generate` → `drizzle-kit migrate`. Mọi phase sau chỉ thêm qua migration file mới (KHÔNG drop/re-run initial). Bảng: auth (Better Auth canonical + `account.encryptOAuthTokens: true`), `repos`, `issues`, `scores` (có `metric_version`, `recomputed_at`), `repo_metrics`, `contributions`.
4. **Better Auth setup (CRIT-1)** — `betterAuth({ database: drizzleAdapter(db,{provider:"pg"}), secret: process.env.BETTER_AUTH_SECRET, socialProviders.github (scope: ["read:user","user:email"] — KHÔNG `repo`; `public_repo` nếu cần), session: { expiresIn: 7d, updateAge: 1d }, account: { encryptOAuthTokens: true }, advanced.useSecureCookies: true (prod) })`. Fastify catch-all `/api/auth/*` với `fromNodeHeaders` + `JSON.stringify(body)`/null body. `trustedOrigins`.
5. **Auth guard + session-refresh handling (MED-12)** — `preHandler requireAuth` dùng `auth.api.getSession({ headers })`; on 401 → frontend "phiên hết hạn, đăng nhập lại" (không silent fail).
6. **CORS + rate limit (HIGH-4)** — `@fastify/cors` `credentials:true`. Thêm `@fastify/rate-limit` cho mọi public route (`/api/issues`, `/api/issues/:id`) với mức an toàn (VD 10 req/s) để chống scrape/abuse.
7. **Request-budget + rate-limiter (HIGH-5)** — `packages/github/rate-limiter.ts` (token bucket cho GitHub App token; parse `Retry-After`/`X-RateLimit-Reset`; circuit-break trên 429/403). Bảng budget theo job: Search discovery (`30 req/min`), repo-metrics (REST `12.500 req/h`), score-compute (local). **C1 mini-scan:** đo từ data thật (1-2 repor rate) để cam kết số repo/ngày refresh.
8. **Crawler v1 (HIGH-6, HIGH-11)** — job `discover`: Search `label:"good first issue" language:... created:{from}..{to}` **split date-range** (tránh cap 1.000/query), `per_page:100` + pagination. Upsert vào `issues`. **Idempotency:** `jobId=issue:{issueId}` singleton; sanitize tất cả GitHub-derived strings (strip HTML, plaintext) trước khi lưu.
9. **repo-metrics job (CRIT-2 — trong phase-01)** — job `repo-metrics` cho mỗi repo mới: fetch ~30 issue/PR gần nhất → tính `median_first_response_hours`, `merge_rate_90d`, `sample_count`, `computed_at`. Lưu `repo_metrics`. Enqueue từ discover; liên tục rate limiter.
10. **score-compute (CRIT-2)** — `packages/scoring`: 4 nhóm + normalization clamp 0-100 + hard filter (archived/pushed>90d/body rỗng/issue>180d) + **re-score** (`score:compute` chạy lại khi repo_metrics mới; ghi `recommended_at`). Job `score-compute` chạy sau repo-metrics + re-score issues cũ stale.
11. **API** — `GET /api/issues?language=&sort=score&page=` (index `(language, score)`), `GET /api/issues/:id` (breakdown + confidence). Cả 2 đọc cache Postgres, không gọi GitHub.
12. **Frontend** — scaffold Vite+React+TS+Tailwind; trang chủ: header (login GitHub), IssueCard (score chip donut), **ScoreBreakdown drawer (4 stacked bars + weight + why + confidence)**, filter ngôn ngữ chip, dark theme. i18n en/vi (sanitize render — text-node, tránh dangerouslySetInnerHTML).
13. **Docker Compose production + backups (HIGH-8)** — Caddyfile auto-HTTPS; `scripts/backup.sh` (weekly `pg_dump` → disk riêng) + `scripts/restore.md` runbook. `db-backup` service trong compose, cron.
14. **Deploy production tuần 1 (VALIDATION-1.3)** — sau local ổn: cài VPS, Caddy auto-HTTPS, trỏ domain, tạo **GitHub App production** + redirect URL production. Kiểm tra login + /api/issues thật trên prod. Checklist gate: verify không secret trong git trước deploy.
15. **Test nội bộ** — tự thử login + load /api/issues; chạy 1 discover job + repo-metrics + score-compute; sửa bug.
16. **Buffer + retro tuần 1** — ưu tiên: nếu tuần 1 trượt, hi sinh UI đẹp/extra, giữ nền tảng + crawl + score + deploy prod (MED-15).

## Success Criteria

- [ ] `npm run dev` khởi động api + worker + web; Postgres migrate clean (drizzle-kit).
- [ ] GitHub OAuth login hoạt động; session lưu; `GET /api/me` trả user.
- [ ] **Q1/Q2 đã chốt:** scope = `public_repo`/không `repo`; `encryptOAuthTokens: true` — token encrypt at rest (CRIT-1).
- [ ] Crawler crawl được ≥ 500 issues (Python/JS/TS) vào Postgres; `issues` có dữ liệu raw (sanitized).
- [ ] **repo-metrics + score-compute CÓ dữ liệu** trong tuần 1 (KHÔNG score zero chỉ vì thiếu metrics) (CRIT-2).
- [ ] Score tính cho mỗi issue (0–100), hard filter loại archived/body rỗng/issue>180d; `recommended_at` ghi khi re-score.
- [ ] `GET /api/issues` trả danh sách sắp theo score, filter ngôn ngữ hoạt động; `@fastify/rate-limit` active (HIGH-4).
- [ ] Trang chủ SPA hiển thị card issue + score chip + breakdown drawer + filter ngôn ngữ; dark theme; i18n en/vi (C5).
- [ ] **C1 (một phần):** /api/issues KHÔNG gọi GitHub (chỉ Postgres); worker là nơi duy nhất crawl; request-budget table đủ.
- [ ] **C6:** `.env.example` đúng; không secret trong git; Redis AOF + volumes; `scripts/backup.sh` hoạt động (HIGH-8).
- [ ] **Production tuần 1 (VALIDATION-1.3):** app deploy thật lên VPS + Caddy auto-HTTPS + domain; login + /api/issues hoạt động trên prod; GitHub App production redirect đúng.
- [ ] Docker Compose chạy local không lỗi; Caddyfile cấu hình production; migration per-phase.

## Risk Assessment

- **Search API rate limit (30 req/min)** — discovery bị chậm → tách query theo ngôn ngữ + **date range** + rate-limiter token bucket; job `discover` singleton; không crawl toàn bộ trong 1 lần (HIGH-5).
- **Scoring chưa đúng** — priors, chưa calibrate → phase-02 có G1. Không kỳ vọng đúng tuyệt đối tuần 1. **Nhưng không được lưu score zero từ thiếu metrics** — repo-metrics + score-compute nằm trong phase-01 (CRIT-2).
- **Better Auth + Fastify wiring** — không có plugin chính thức → theo catch-all pattern (research đã verify). Cẩn thận body/headers gotchas; **kiểm tra ngày publish gói** (tránh dính dependency chết).
- **AccessToken plaintext** — Q2 đã chốt `encryptOAuthTokens: true`; không ghi token vào log; DB least-privilege (CRIT-1).
- **Mất data (bus-factor=1)** — backup.sh + restore runbook trong phase-01, KHÔNG để tuần sau (HIGH-8).
- **Phase-01 nén nhiều** — ưu tiên: nền tảng + crawl + score giữ, hi sinh UI đẹp/extra nếu trượt (MED-15).

## Test/Validation

- Unit: `packages/scoring` (cho 1–2 issue mẫu, verify số khớp công thức); `rate-limiter.ts`.
- Integration: curl `/api/auth/*` flow (login mock), `/api/issues` filter + breakdown; `/api/issues` bị rate-limit sau threshold.
- Security: verify token encrypt at rest (đọc `account.access_token` = ciphertext); không secret trong `git diff`.
- Migration: `drizzle-kit migrate` chạy clean 2 lần (idempotent).
- Manual: tự chạy discover + repo-metrics + score-compute; mở SPA; kill Redis job rồi restart → job không mất (AOF).
- Vitest cho scoring + routes + backup script dry-run.
