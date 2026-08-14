---
phase: 4
title: "Portfolio v1 + OG image + badge + auto-update"
status: pending
priority: P1
dependencies: [phase-03]
---

# Phase 4: Portfolio v1 + OG image + badge + auto-update

## Overview

Tuần 4: biến tool-1-lần thành nơi quay lại — portfolio tự động từ username GitHub (hero + contribution map + project cards + journey timeline + badges), OG image 1200×630 cho chia sẻ FB/Zalo/Telegram, auto-update contribution mới. Kết quả: user có URL gửi recruiter + lý do quay lại mỗi kỳ cập nhật — gate G3 (retention + share).

## Requirements

- Functional:
  - Portfolio page `/p/:username`: hero (avatar, handle, 1-line positioning, stat strip), contribution heatmap (kiểu GitHub), project cards (repo, role, tech, PR merged, link), journey timeline (issue → PR merged — "câu chuyện"), badges (verified qua API).
  - **Auto-update idempotent (Fail F7):** contribution mới tự thêm từ outcome check; **dedup PR url = PK** (không double-count); nếu outcome cron fail 2 ngày → alert. Có **"Refresh now" button** cho user (fire 1-off job) — không silent stale.
  - OG image: `@vercel/og` render 1200×630 (dark bg + brand + handle + 1 headline stat). **Cache policy (MED-13):** render-once + write to disk/object store; `Cache-Control: public, s-maxage=86400, immutable`; second request = static file, KHÔNG recompute. Font tiếng Việt (embed ttf/otf, Satori chỉ flexbox, <500KB).
  - Share: URL unique + OG; kiểm tra hiển thị trên FB/Zalo.
  - Export CV summary (basic): 1 nút "Export CV summary" → khối ATS "Open Source Contributions" (recruiter VN không phải lục GitHub).
- Non-functional:
  - Portfolio CHỈ hiển thị PR đã merge (check state); loại fork-only, chống self-star (anti-gaming §2.4).
  - OG image render nhanh + cache TTL rõ (không recompute mỗi request); fallback ảnh tĩnh placeholder nếu render fail.
  - Mobile-first: heatmap compact (horizontal scroll / last-30-days mini-grid).
  - i18n en/vi (portfolio labels, badge names).
  - **Security (MED-13):** OG route KHÔNG SSRF — resolve username STRICTLY từ DB (`contributions`/`users` table), CẤM fetch remote resources trong `og.tsx` (embed/bundle assets). Không leak accessToken (encrypted at rest, không log).
  - **Sanitize (HIGH-11):** mọi GitHub-derived string (issue/PR title) trước khi render portfolio/OG/CV — strip HTML, plaintext, tránh `dangerouslySetInnerHTML`. Portfolio là page public → XSS risk.

## Architecture

```
GET /p/:username (SPA) → API /api/portfolios/:username
   → đọc contributions (Postgres, merged only) → render portfolio

GET /og/:username.png (API, @vercel/og) → 1200×630 → render-once, lưu disk → Cache-Control (s-maxage=86400, immutable)

Worker cron `outcome:check` → detect PR merged → upsert contributions
   → portfolio tự cập nhật (no user action)
```

## Related Code Files

- Create:
  - `apps/web/src/pages/Portfolio.tsx`, `apps/web/src/components/Portfolio/{Hero,Heatmap,ProjectCards,Timeline,Badges,ExportCv}.tsx`
  - `apps/api/src/routes/portfolios.ts` (GET /api/portfolios/:username), `apps/api/src/routes/og.ts` (GET /og/:username.png)
  - `apps/api/src/lib/og.tsx` (@vercel/og render — React component)
  - `packages/scoring/portfolio.ts` (tính stats từ contributions: merged count, repo count, streak, language breakdown)
  - `apps/api/src/lib/cv-export.ts` (khối ATS text)
  - `apps/web/src/i18n/portfolio.{en,vi}.json`
  - `scripts/og-test.ts` (render thử + kiểm tra font VN)
- Modify:
  - `apps/worker/src/jobs/outcome.ts` (portfolio stats update sau detect)
  - `packages/db/schema.ts` (nếu cần cột badge/streak)
  - `docs/07-decisions.md` (log G3 kết quả + quyết định V2)
- Delete: (none)

## Implementation Steps

1. **Portfolio data API** — `GET /api/portfolios/:username`: đọc contributions merged từ Postgres → stats (PR merged, repos, streak, languages). Không gọi GitHub sống (cache). **Sanitize mọi string GitHub-derived** trước khi trả (HIGH-11).
2. **Portfolio page** — Hero (avatar + handle + positioning + stat strip), heatmap (7-row year grid / mini), project cards (what I did note), journey timeline (vertical story), badges (verified). Render text-node, không `dangerouslySetInnerHTML` (HIGH-11).
3. **Anti-gaming portfolio** — chỉ merged PR; loại fork-only (check base/head repo khác); chống self-star (repo tạo bởi user không tính); badge "Verified" chỉ khi ≥ X contributions thật.
4. **OG image** — `og.tsx` với @vercel/og: dark bg + brand + handle + big stat ("12 PR merged"). Embed font VN (Noto Sans VN / Inter subset, ttf). **CẤM fetch remote resources trong og.tsx** (chỉ data từ DB + font embedded). Test tiếng Việt dấu render đúng.
5. **OG caching + SSRF (MED-13)** — **render-once + write to disk/object store**; `Cache-Control: public, s-maxage=86400, immutable`. **Chống SSRF:** resolve username STRICTLY từ `contributions`/`users` table (validate strict, không fetch theo user input). `@fastify/rate-limit` trên `/og/` (chống DoS CPU). Fallback ảnh tĩnh nếu render fail. Test trên FB/Zalo preview.
6. **Auto-update idempotent (Fail F7)** — hook vào outcome job: detect PR merged → upsert `contributions` (dedup PR url PK) + cập nhật portfolio stats. **"Refresh now" button** cho user (fire 1-off job). Alert nếu outcome cron fail ≥ 2 ngày liên tiếp.
7. **Export CV summary** — 1 nút: tạo khối ATS "Open Source Contributions" (repo, PR link, merged date) copy-able, sanitized. Recruiter-friendly.
8. **Demo cho 10 user ban đầu** — trình portfolio; thu ấn tượng (có share không? có muốn quay lại không?).
9. **G3 gate + volume bar (HIGH-7)** — user quay lại + share portfolio? VÀ ≥ 5 contributions detected bằng cuối phase-04. Có → V2 planning. Không → sửa portfolio (đừng mở rộng feature mới). Ghi `07-decisions.md`.
10. **Retro tổng + quyết định V2** — tổng hợp cả 4 tuần, viết retro, chốt hướng V2.

## Success Criteria

- [ ] **G3 pass:** ≥ 1 user quay lại dùng (auto-update/portfolio) + share portfolio URL.
- [ ] **Volume bar (HIGH-7):** ≥ 5 contributions detected (verified merge) bằng cuối phase-04.
- [ ] Portfolio page render từ username GitHub: hero, heatmap, project cards, timeline, badges.
- [ ] OG image 1200×630 render đúng (font VN), cache TTL + fallback static, hiển thị chuẩn trên FB/Zalo.
- [ ] Auto-update idempotent: PR mới tự thêm (dedup PR url), "Refresh now" button hoạt động, no silent stale (Fail F7).
- [ ] Chỉ hiển thị PR merged; loại fork-only/self-star; "Verified" chỉ khi contributions thật.
- [ ] Export CV summary copy-able, khối ATS đúng, sanitized.
- [ ] Mobile render tốt (heatmap compact); i18n en/vi (C5).
- [ ] Không leak accessToken; OG route không SSRF (strict DB lookup, test malformed username + internal-IP probe) (MED-13).
- [ ] Sanitize GitHub-derived strings trước render (không `dangerouslySetInnerHTML`) (HIGH-11).
- [ ] Retro 4 tuần viết xong + hướng V2 rõ ràng.

## Risk Assessment

- **Satori/OG font VN lỗi dấu** — phải embed font đủ subset (Noto Sans VN), test kỹ tiếng Việt. Fallback: ảnh tĩnh placeholder + cache TTL để không recompute khi lỗi.
- **OG SSRF** — route public, không để user truyền URL tùy ý; **strict DB lookup** (không fetch user input) + rate-limit + test SSRF trong validation (MED-13).
- **OG render chậm/nặng CPU** — render-once + lưu disk + `s-maxage=86400`; rate-limit để chống DoS. Nếu 1 VPS không CDN, cache disk là lớp an toàn chính (HIGH-1).
- **Portfolio phình** — giữ tối giản (hero + heatmap + cards + timeline + badges + export). Không thêm chart lib nặng, không leaderboard trong MVP.
- **Auto-update phụ thuộc outcome detect** — nếu detect merge trễ, portfolio cập nhật chậm → chấp nhận (daily cron) + "Refresh now" cho user + alert khi cron fail (Fail F7).

## Test/Validation

- Unit: `packages/scoring/portfolio.ts` stats (merged count, streak, languages).
- Integration: `/api/portfolios/:username` trả contributions merged (sanitized); `/og/:username.png` render 200 + Cache-Control + rate-limit.
- Security: SSRF test — username malformed (`../`, `169.254.169.254` probe) không fetch; không `dangerouslySetInnerHTML`.
- UI: Playwright — portfolio page render, heatmap, badges, export CV; OG preview screenshot.
- Manual: share lên FB/Zalo test hiển thị; user demo feedback.
- G3: đo retention + share rate + volume bar; quyết định V2.