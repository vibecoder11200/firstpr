---
phase: 3
title: "5–10 user thật + funnel + onboarding + outcome"
status: pending
priority: P1
dependencies: [phase-02]
---

# Phase 3: 5–10 user thật + funnel + onboarding + outcome

## Overview

Tuần 3: đưa 5–10 junior dev VN (bạn bè/cộng đồng) vào dùng thật, đo funnel bằng PostHog (tìm → chọn → làm → merge), thêm onboarding checklist ngắn, detect PR merged để biết user nào thành công, thu feedback định tính. Kết quả: **biết chính xác user bỏ ở đâu + ai làm được PR đầu — quyết định G2 (pivot/continue).**

## Requirements

- Functional:
  - Mời 5–10 dev junior VN tham gia; hướng dẫn dùng.
  - **PostHog tracking (chi tiết, HIGH-7):** event **client-side** `issue_view`, `issue_click_github`, `checklist_start`, `onboarding_complete`, `portfolio_view`. Event **server-side** `signup`, `pr_created`, `pr_merged` (từ outcome job, KHÔNG phải client). **Không track `login` như hard funnel step** — bỏ (mâu thuẫn "không bắt buộc login") (HIGH-3).
  - **Funnel event owner rõ (HIGH-3):** mỗi stage 1 nguồn duy nhất:
    - `tìm` = `issue_view` (client)
    - `chọn` = `issue_click_github` (client)
    - `làm` = `pr_created` (**server-side** detect khi user mở PR qua outcome polling)
    - `merge` = `pr_merged` (**server-side** detect qua `search/issues is:pr is:merged`)
    - Funnel bỏ stage cứng `login` (thay = branch `login_or_not`).
  - Onboarding checklist "làm PR đầu" 5 bước (ngắn, tiếng Việt): chọn issue → clone → branch → PR → follow-up.
  - **Outcome tracking v1 (HIGH-3):** detect PR merged từ user's GitHub **bằng `/search/issues?q=author:{user} is:pr is:merged`** (primary) + resolve `merged_at` qua `/pulls/{number}`. KHÔNG dùng `/user/events` (không có action "merged"; feed 90 ngày + nhiễu). Có `per_page:100` + pagination → ghi `contributions` + badge.
  - **Token-invalid handling (Fail F7):** nếu token user bị revoke (401/403 trong outcome job) → đánh dấu `token_invalid`, hiển thị "đăng nhập lại", dừng cron loop cho user đó (KHÔNG silent fail).
  - Feedback collection: template hỏi user vì sao chọn/không chọn, chỗ nào bỏ.
- Non-functional:
  - **PostHog PII (HIGH-4):** KHÔNG gửi username/GitHub làm `distinct_id`. Dùng **server-assigned id** (uuid nội bộ, không đảo ngược → username). Event property **allowlist** rõ (chỉ: language filter, score band, page, referrer). **Consent banner** "cho phép theo dõi analytics" + privacy notice (NĐ 13/2023) trong onboarding.
  - Funnel nhìn được realtime trên PostHog dashboard.
  - Onboarding 5 bước hiển thị tiến độ; không bắt buộc login để xem issue (nhưng login để checklist + portfolio).
  - i18n en/vi cho onboarding + consent privacy notice.
  - **Volume bar (HIGH-7):** suốt tuần 3–4 phải có **≥ 5 contributions detected** (từ outcome, verified merge) — mục tiêu số khôi phục từ roadmap (không chỉ "5–10 user click issue").

## Architecture

```
SPA  ── PostHog events ──▶  PostHog cloud (funnel)
API  ── outcome job ──▶  GitHub API (user token) → detect merged PR
                        → ghi contributions (Postgres) → badge
Worker (bullMQ) cron: ──▶  job `outcome:check` quét user active
```

## Related Code Files

- Create:
  - `apps/web/src/lib/posthog.ts` (init + track helpers — server-assigned id, props allowlist)
  - `apps/web/src/components/OnboardingChecklist.tsx` (5 bước, progress + consent step)
  - `apps/web/src/components/ConsentBanner.tsx` (privacy notice, NĐ 13/2023)
  - `apps/worker/src/jobs/outcome.ts` (detect PR merged qua `/search/issues is:pr is:merged` + pagination → contributions + badge)
  - `apps/api/src/routes/me/prs.ts` (GET /api/me/prs — dùng token user, report PRs/state)
  - `apps/web/src/lib/i18n/onboarding.{en,vi}.json` + `privacy.{en,vi}.json`
  - `scripts/recruit-notes.md` (template questions + danh sách user)
- Modify:
  - `apps/api/src/lib/auth.ts` (Read-only: đảm bảo scope `public_repo` đủ cho `/search/issues is:pr is:merged` — Q1 đã chốt từ phase-01)
  - `packages/db/schema.ts` (bảng `contributions` hoàn chỉnh: issue_id, PR url, merged_at, badge; `users.token_invalid`, `token_updated_at` — qua migration mới)
  - `docs/07-decisions.md` (log G2 kết quả)
- Delete: (none)

## Implementation Steps

1. **Recruit** — mời 5–10 junior VN (bạn bè/cộng đồng dev VN: FB groups, Discord, Telegram). Ghi danh sách + kênh liên hệ trong `scripts/recruit-notes.md`.
2. **PostHog setup + consent (HIGH-4)** — project + SDK init; helper `track(event, props)` với **server-assigned id** (uuid, không phải username); **consent banner** + privacy notice trong onboarding; event property allowlist. KHÔNG gửi GitHub identity ra US cloud trước khi có consent.
3. **Funnel dashboard (HIGH-3)** — cấu hình PostHog funnel đúng event owner: `issue_view → issue_click_github → pr_created(server) → pr_merged(server)`. Bỏ `login` khỏi funnel (branch `login_or_not`). Đặt kỳ vọng: phân tích lần đầu có thể chưa đủ data.
4. **Onboarding checklist v1** — 5 bước tiếng Việt (ngắn): 1) Chọn issue trong list 2) Đọc breakdown + code path 3) Clone + branch 4) Viết fix + PR 5) Follow-up + ghi contribution. Lưu progress mỗi user (login). Kèm consent privacy step.
5. **Outcome tracking v1 (HIGH-3)** — job `outcome:check`: cho từng user active, lấy accessToken (encrypted) từ `account`, query `/search/issues?q=author:{user} is:pr is:merged` + pagination → resolve `merged_at` qua pulls endpoint. Detect merge → ghi `contributions` (issue_id, pr_url, merged_at) + cấp badge nếu PR đầu. Handle `token_invalid` (401/403) → mark + banner re-login.
6. **Badge cơ bản** — chỉ cấp khi có merged PR thật (verified qua API, `search is:merged`). Không tưởng tượng (anti-gaming, `03-design` §2.4).
7. **Feedback thu thập** — gửi hỏi user sau 1 tuần: vì sao chọn/không chọn issue? bỏ ở bước nào? feedback định tính ≥ 5 responses.
8. **Fix bug + điều chỉnh nhỏ** — từ feedback + funnel, sửa onboarding/UX nhỏ. KHÔNG build thêm tính năng lớn.
9. **G2 gate + volume bar (HIGH-7)** — cuối tuần: **≥ 1 user làm được PR đầu** (merge verified) VÀ hướng tới **≥ 5 contributions detected** bằng cuối phase-04. Có → continue V2 planning. Không → **PIVOT** (đổi wedge/hướng tiếp cận). Ghi kết quả vào `07-decisions.md`.

## Success Criteria

- [ ] **G2 pass:** ≥ 1 user (thật) hoàn thành PR được merge qua FirstPR (verified `is:merged`).
- [ ] **Volume bar:** ≥ 5 contributions detected (verified merge) bằng cuối phase-04 (HIGH-7).
- [ ] 5–10 user thật đăng ký + click qua ít nhất 1 issue.
- [ ] Funnel PostHog đúng event owner: `issue_view → issue_click_github → pr_created(server) → pr_merged(server)`; biết điểm rớt. Không `login` hard-step (HIGH-3).
- [ ] Onboarding checklist 5 bước hiển thị + lưu progress (login user) + consent privacy step.
- [ ] Outcome tracking detect PR merged qua `search is:pr is:merged` (KHÔNG `/user/events`); `contributions` có dữ liệu; badge cấp đúng (HIGH-3).
- [ ] `token_invalid` handling: user revoke → banner re-login, không silent fail (Fail F7).
- [ ] PostHog không gửi username làm distinct_id; consent banner hiển thị; props allowlist đúng (HIGH-4).
- [ ] Feedback định tính ≥ 5 responses; ghi lại chỗ bỏ.
- [ ] G2 decision rõ ràng trong `07-decisions.md` (continue/pivot).
- [ ] i18n en/vi cho onboarding + consent + feedback (C5).

## Risk Assessment

- **Không ai làm PR đầu** — rủi ro chính G2. Nếu xảy ra: phân tích funnel chỗ nào rớt, hỏi user trực tiếp, đổi wedge hoặc cách tiếp cận (đừng build thêm).
- **Search API cho outcome** — `/search/issues is:pr is:merged` dùng user token (5.000 req/h); nhưng outcome polling nhiều user có thể chạm 30 req/min (Search cap chung). → Rate-limiter + batch theo window; ưu tiên user mới active.
- **Outcome detect muộn** — PR merge có độ trễ; cron outcome check chạy daily, không realtime.
- **PostHog data ít trong tuần đầu** — funnel phân tích dựa mẫu nhỏ; kết hợp feedback định tính, không chỉ số.

## Test/Validation

- Integration: `/api/me/prs` trả PR list (mock token); outcome job detect merged PR qua `/search is:merged` đúng (unit test mock GitHub).
- UI: Playwright — onboarding checklist render + progress + consent banner; PostHog event fire đúng (server-assigned id).
- PostHog: check events đến cloud (realtime); verify distinct_id không phải username.
- Token-invalid: mock 401 → job đánh dấu token_invalid + banner.
- G2: thu thập số liệu user + feedback + volume bar → quyết định gate.