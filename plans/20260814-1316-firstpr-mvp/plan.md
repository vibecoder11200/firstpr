---
title: "FirstPR MVP — build 4 tuần (tìm issue chất lượng + portfolio)"
status: in-progress
created: 2026-08-14
priority: P1
repo: firstpr
branch: main
phases: [phase-01, phase-02, phase-03, phase-04]
blockedBy: []
phase-01-status: DONE (2026-08-14)
---

# FirstPR MVP — Plan Build 4 Tuần

## Mục đích

Xây MVP FirstPR theo `docs/04-roadmap.md`: một junior VN có thể tìm được issue chất lượng (scored theo hành vi), hoàn thành PR đầu, và có portfolio tự động xin việc. Validate bằng dữ liệu thật qua 3 decision gates.

## Nguồn (docs đã đọc trước khi plan)

- `README.md` — bức tranh 1 trang
- `docs/01-vision.md` — vì sao, persona, scope, success metrics
- `docs/02-research.md` — feasibility, rate limit, nguồn
- `docs/03-design.md` — **scoring model (30/20/15/35) + portfolio**
- `docs/04-roadmap.md` — **4 tuần + gates G1/G2/G3**
- `docs/06-oss.md` — định vị C, chống phình, vận hành solo
- `docs/07-decisions.md` — D1–D11 (tech stack, Better Auth)
- `docs/09-techstack.md` — **tech stack chốt + C1 rate-limit acceptance**
- `docs/08-marketing.md` — câu chuyện Minh/ Ngọc (cho bản địa hoá + copy)

## Tech stack (D11 — đã chốt)

| Lớp | Chọn | Ghi chú |
|---|---|---|
| API | **Fastify** (Node/TS) | Schema validation built-in |
| ORM | **Drizzle** | TS-first, migration nhẹ |
| DB | **Postgres** | Cache chính + auth tables |
| Auth | **Better Auth** | Lucia đã deprecated; có `@better-auth/drizzle-adapter`, GitHub OAuth sẵn, lưu `accessToken` cho portfolio |
| Worker | **Redis + bullMQ** (worker riêng) | Crawl + tính metric; queue tách khỏi web |
| Frontend | **Vite + React + TypeScript + Tailwind** | SPA; Tailwind để custom design |
| i18n | **i18next + react-i18next** | catalog `en`/`vi` (bắt buộc cùng change) |
| OG image | **@vercel/og (Satori)** | 1200×630, không Puppeteer |
| Analytics | **PostHog cloud** | Funnel tuần 3 |
| Test | **Vitest** | Unit + integration |
| Deploy | **1 VPS + Docker + Caddy** | Caddy auto-HTTPS + reverse-proxy |
| E2E | **Playwright** (tuần 3) | Smoke login + funnel |

## Phases (4 tuần, 1 phase = 1 tuần)

| Phase | Tuần | Deliverable | Gate |
|---|---|---|---|
| `phase-01` | 1 | Nền tảng + crawl + score + trang chủ thô | — |
| `phase-02` | 2 | Scoring sắc + breakdown UI + cache | **G1** (score khớp ≥80%) |
| `phase-03` | 3 | 5–10 user thật + funnel + onboarding + outcome | **G2** (≥1 PR đầu) |
| `phase-04` | 4 | Portfolio v1 + OG + badge + auto-update | **G3** (retention + share) |

## Acceptance criteria tổng

- **C1 (rate-limit/cache):** user load LUÔN từ Postgres cache; không query GitHub trực tiếp; worker chỉ xử lý id. Đo từ data thật (mini-scan) trước khi cam kết số repo/tháng. Mỗi phase có **request-budget table** (queries/day vs req/min vs req/h theo job type) + rate-limit-aware scheduler.
- **C2 (scoring):** score khớp phán đoán thủ công ≥ 80% (G1, 20 issues mẫu). Mọi issue đã score phải có `score:compute` re-score khi repo_metrics mới (không có score stale từ phase-01).
- **C3 (funnel):** track event tìm → chọn → làm → merge. **`pr_created`/`pr_merged` = server-side detection** (search `is:pr is:merged`), không phải client event; `login` không phải hard funnel step. Kèm **volume bar:** ≥ 5 contributions detected (khôi phục mục tiêu roadmap).
- **C4 (portfolio):** URL share-able từ username GitHub; OG image render 1200×630 có **cache TTL + fallback static**; auto-update idempotent (dedup PR PK) + có "Refresh now" button. Chống SSRF.
- **C5 (i18n):** mọi UI string nằm trong catalog `en`/`vi`; không hardcode string trong component. Cả 2 catalog ship cùng change.
- **C6 (security/ops):** GitHub accessToken **encrypted at rest** (`encryptOAuthTokens: true`); không commit secret (`.env.example` gitignored); không leak token qua log; Redis có AOF + volumes; **weekly pg_dump + restore runbook**; drizzle-kit migration per-phase.

## Decision gates (từ `04-roadmap.md`)

| Gate | Khi | Điều kiện pass | Nếu fail |
|---|---|---|---|
| **G1** | cuối phase-02 | Score khớp thủ công ≥ 80% | Đào lại scoring trước, đừng mở rộng |
| **G2** | cuối phase-03 | ≥ 1 user làm được PR đầu | **PIVOT** (đổi wedge/hướng) |
| **G3** | cuối phase-04 | User quay lại + share portfolio | Sửa portfolio; có → V2 |

## Chống phình (từ `06-oss.md` §3)

- KHÔNG build: VN-specific full, gamification phức tạp, recruit-export, outcome-tuning model. Vào V2.
- Mỗi feature mới phải trả lời "chính mình dùng 6 tháng có thấy cần không".
- Scope MVP tối thiểu: **crawler + scoring v1 + trang kết quả + portfolio v1**. Portfolio là tuần 4, không ôm vào tuần 1.

## Rủi ro chính

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Cháy rate limit (cache tệ) | 🔴 | C1: Postgres = nguồn duy nhất; worker chỉ xử lý id; đo sớm |
| Scoring chưa đúng / score stale | 🔴 | G1 calibrate + re-score `score:compute` khi có metrics mới |
| Không ai làm PR đầu | 🔴 | G2 pivot sớm |
| AccessToken plaintext trong DB | 🔴 | `encryptOAuthTokens: true` + Q1/Q2 chốt TRƯỚC phase-01 + C6 |
| Auth dependency chết (Lucia) | 🟡 | Đã né — Better Auth active; kiểm tra ngày publish gói |
| Worker + Redis phình ops | 🟡 | Job types tối thiểu; Redis AOF + volumes; lịch bảo trì `06-oss` §4.2 |

## Open questions — ĐÃ CHỐT (từ red-team)

- **Q1 (scopes):** `public_repo` (chỉ đọc public). KHÔNG `repo` — giảm blast radius token leak. Chốt trước phase-01.
- **Q2 (encrypt tokens):** **`encryptOAuthTokens: true`** — token encrypt at rest; yêu cầu quản lý secret/rotation. Chốt trước phase-01.
- **Q3 (ngôn ngữ đầu):** Python/JS/TS — theo `03-design`.
- **Q4 (confidence semantics):** Low nếu < 10 samples HOẶC metrics cũ > 30 ngày; confidence giảm **weight trong score hiển thị** (không chỉ decorate). Chuyển vào phase-02 Requirements.

## Red Team Review

### Session — 2026-08-14
**Findings:** 15 (15 accepted, 0 rejected)
**Severity breakdown:** 3 Critical, 8 High, 4 Medium
**Nguồn:** 3 reviewer (Security Adversary, Assumption Destroyer, Failure Mode Analyst). Bằng chứng: mọi finding quote `file:line` từ plan/docs → pass evidence filter.

| # | Finding | Severity | Disposition | Applied To |
|---|---------|----------|-------------|------------|
| 1 | OAuth token plaintext + zero secrets provisioning + Better Auth hardening | Critical | Accept | Phase 1 |
| 2 | Phase-01 scoring phụ thuộc repo_metrics (job ở phase-02) → score giả/zero + không re-score | Critical | Accept | Phase 1 + 2 |
| 3 | Không migration/db-versioning (schema tiến hóa 3 phase) | Critical | Accept | Phase 1 |
| 4 | Zero rate limit public route; OG = DoS; cache không TTL | High | Accept | Phase 1 + 4 |
| 5 | Không request-budget/rate-limit scheduler (trộn Search 30/min + REST 12.5k/h) | High | Accept | Phase 1 + 2 |
| 6 | Funnel event sai nguồn; /user/events không "merged"; login hard-step | High | Accept | Phase 3 |
| 7 | Mất volume bar MVP (≥10 contribution vs "click issue") | High | Accept | Plan + Phase 3 |
| 8 | Redis-durability + Postgres không backup | High | Accept | Phase 1 |
| 9 | Crawl thiếu idempotency (crash = duplicate API calls) | High | Accept | Phase 1 |
| 10 | PostHog username→US cloud không consent (NĐ 13/2023) | High | Accept | Phase 3 |
| 11 | Search truncation (1.000/query) + XSS từ GitHub-derived strings | High | Accept | Phase 1 + 4 |
| 12 | Auth session-refresh failure → silent logout | Medium | Accept | Phase 1 |
| 13 | OG SSRF thiếu thiết kế + cache TTL | Medium | Accept | Phase 4 |
| 14 | Confidence rule nằm trong Risk không trong Requirements | Medium | Accept | Phase 2 |
| 15 | Phase-01 nén 2 tuần vào 1, không buffer | Medium | Accept | Phase 1 |

### Whole-Plan Consistency Sweep

Sau khi áp findings, rà toàn bộ plan cho stale terms/renamed files/contradictions:
- Phải cập nhật đồng bộ: "Scoring v1 tính 4 nhóm" (phase-01) → thành "scoring heuristic (re-score khi metrics)" nếu chuyển repo-metrics vào phase-01.
- "Không leak accessToken" (phase-04 success criterion) → điều kiện đã đổi thành "encrypted at rest" (C6) — cập nhật.
- Mọi nhắc "CDN cache headers" → thêm TTL + fallback static. (✅ phase-04 diagram đã đổi sang "render-once + disk + s-maxage").

*Kết quả sweep phải zero unresolved trước khi recommend cook.*

## Validation Log

### Session 1 — 2026-08-14
**Trigger:** User chọn `/ck:plan validate` sau red-team.
**Questions asked:** 3
**Guard:** `## Red Team Review` đã có verification evidence → bỏ qua verification pass, đi thẳng interview.

#### Questions & Answers

1. **[Tradeoffs]** Khi confidence thấp (repo thiếu dữ liệu), score hiển thị nên thế nào?
   - Options: Giảm weight + toggle (như plan) | Score cố định, confidence chỉ decorate | Score + uncertainty range
   - **Answer:** Giảm weight + toggle (như plan)
   - **Rationale:** Chống phình + đúng anti-gaming. UI mặc định hiện score điều chỉnh theo confidence, toggle "score gốc theo công thức" (phase-02).

2. **[Risk]** Crawler refresh repo pool — con số repos/ngày cam kết như thế nào?
   - Options: Đo trước, cam kết sau (như plan) | Chốt cứng ~300 repos/ngày | Chốt cứng ~800 repos/ngày
   - **Answer:** Đo trước, cam kết sau (như plan)
   - **Rationale:** Giữ C1 mini-scan là bước phase-01; không chốt số cứng trước khi có data thật. Cam kết động sau khi đo.

3. **[Scope]** Production deploy (VPS + Caddy) vào tuần nào?
   - Options: Deploy production tuần 1 (Recommended) | Local tuần 1, prod tuần 2 | Để sau quyết định
   - **Answer:** Deploy production tuần 1
   - **Rationale:** Cần URL thật + GitHub App + domain sớm để demo thật từ tuần 2 và mời user tuần 3. **Thay đổi so với plan gốc** (trước chỉ đặt Caddy production như baseline, chưa thành deliverable tuần 1).

#### Confirmed Decisions
- Confidence "giảm weight + toggle": đã chốt (phù hợp phase-02 hiện có).
- C1 "đo trước cam kết sau": giữ nguyên.
- **Production deploy tuần 1:** CÀI vào phase-01 (VPS + Caddy + GitHub App + domain).

#### Action Items
- [ ] **Phase-01:** chuyển "Caddy production" từ baseline-planning thành deliverable tuần 1 (VPS + Caddy + GitHub App production redirect + domain trỏ DNS).

#### Impact on Phases
- Phase 1: Thêm deploy production tuần 1. Step 13 (Docker Compose production + Caddy + backup) giữ; thêm "deploy thật lên VPS + trỏ domain + GitHub App production redirect".

### Whole-Plan Consistency Sweep (Validation)

- Sau khi ghi log: đồng bộ "deploy production tuần 1" vào phase-01 (success criterion + step) — làm ngay.
- Không contradiction mới ngoài phải thêm deploy tuần 1 vào phase-01.

## Link bên ngoài

- Better Auth Fastify: https://www.better-auth.com/docs/integrations/fastify
- Drizzle adapter: https://www.better-auth.com/docs/adapters/drizzle
- GitHub OAuth scopes: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
- @vercel/og: https://vercel.com/docs/functions/og-image-generation
