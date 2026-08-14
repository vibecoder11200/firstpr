---
phase: 2
title: "Scoring sắc + breakdown UI + cache"
status: pending
priority: P1
dependencies: [phase-01]
---

# Phase 2: Scoring sắc + breakdown UI + cache

## Overview

Tuần 2: làm score đáng tin (calibrate thủ công, gate G1), hiển thị **breakdown per-criterion + confidence** trên UI (đây là điểm khác biệt vs goodfirstissue.dev — "vì sao issue này được điểm này"), hoàn thiện cache 2 tầng và anti-gaming filters. Kết quả: sẵn sàng cho 5–10 người dùng thật.

## Requirements

- Functional:
  - Calibrate scoring: lấy 20 issues, tự đánh giá thủ công, so với model, chỉnh threshold/weight → khớp ≥ 80%.
  - **Breakdown per-criterion UI**: mỗi issue có chi tiết 4 nhóm (responsiveness/repo/freshness/clarity) + weight + confidence. Nút mở breakdown từ score chip trên card.
  - **Confidence (đã chốt Q4 — từ MED-14):** hiển thị mức **Low/Medium/High**. **Rule cụ thể:** `Low` nếu `sample_count < 10` HOẶC `repo_metrics.computed_at > 30 ngày`; `Medium` nếu ≥10 samples nhưng < 30; `High` nếu ≥30 samples & fresh. **Khi confidence không High, score hiển thị bị GIẢM weight (nhưng vẫn hiển thị breakdown đầy đủ + nút toggle "score gốc theo công thức")** — UI mặc định hiện score đã điều chỉnh + confidence meter. Chuyển rule này từ Risk → Requirements + acceptance (MED-14).
  - Anti-gaming filter: loại PR (field pull_request), issue đóng, archived repo, body rỗng, repo bot-only.
  - Cache tầng 2: repo-level snapshot (median_first_response, merge_rate_90d) trong `repo_metrics` — **job này đã xây ở phase-01**; phase-02 CHỈ calibrate threshold + thêm confidence (không xây lại).
  - Hard filter validation: so sánh trước/sau filter (issue>180d, no-assignee) có thực sự giúp chất lượng.
- Non-functional:
  - Score breakdown render nhanh trên mobile (375px) — donut 120px + stacked bars, không radar.
  - i18n en/vi cho mọi nhãn breakdown (C5), ship en+vi cùng change.
  - Không gọi GitHub trực tiếp khi user mở breakdown (đọc từ cache).
  - **Re-score:** khi `repo_metrics` mới (score:compute), issues cũ `stale` được tính lại — không còn score stale từ phase-01 (CRIT-2).

## Architecture

```
Scoring (packages/scoring)
  ├─ heuristic 4 nhóm (clamp 0–100, weight 30/20/15/35)
  ├─ hard filter (chạy trước)
  └─ confidence (dựa trên số tín hiệu repo_metrics có đủ không)

API /api/issues/:id → score + breakdown JSON (cache Postgres)
UI card → score chip → click → drawer/modal breakdown
```

## Related Code Files

- Create:
  - `packages/scoring/confidence.ts` (tính confidence từ sample count/staleness — rule Q4)
  - `apps/api/src/routes/issue-detail.ts` (GET /api/issues/:id → breakdown + confidence-adjusted score)
  - `apps/web/src/components/ScoreChip.tsx`, `apps/web/src/components/ScoreBreakdown.tsx` (donut + stacked bars + confidence + toggle gốc/điều chỉnh)
  - `apps/web/src/components/IssueCard.tsx` (refactor từ phase 1)
  - `scripts/calibrate.ts` (tool đánh giá thủ công 20 issues vs model)
- Modify:
  - `packages/scoring/index.ts` (threshold sau calibrate, confidence, score-adjustment theo confidence)
  - `packages/db/schema.ts` (thêm `metric_version`, `recommended_at` cho `scores`; `repo_metrics.computed_at` index — **qua migration mới, không drop**)
  - `apps/worker/src/jobs/score-compute.ts` (re-score issues stale khi metrics mới — extend từ phase-01)
  - `docs/03-design.md` (ghi kết quả calibrate + confidence semantics — Q4 đã chốt)
  - `docs/07-decisions.md` (log kết quả G1)
- Delete: (none)

## Implementation Steps

1. **Calibrate tool** — `scripts/calibrate.ts`: lấy 20 issues, hiển thị từng cái, hỏi "bạn đánh giá mấy/100 cho cái này", so với model score. Ghi mismatch.
2. **Điều chỉnh scoring** — dựa kết quả calibrate, chỉnh threshold (24h/72h/7d, stars bands, body length…) và weight nếu cần. Ghi rõ thay đổi vào `03-design.md`.
3. **Confidence (MED-14)** — `packages/scoring/confidence.ts` theo rule Q4 đã chốt (Requirements): `Low` nếu sample_count <10 OR computed_at >30d; `Medium` nếu ≥10 but <30 samples; `High` nếu ≥30 & fresh. **Score-adjustment:** confidence không High → giảm weight trong score hiển thị; UI có toggle "score gốc theo công thức" (không bí mật).
4. **Re-score (CRIT-2)** — extend `score:compute`: khi `repo_metrics` mới cho 1 repo, đánh dấu issues của repo đó `stale` → re-score với metrics mới + ghi `recommended_at`. Bảo đảm KHÔNG còn score zero/stale từ phase-01 sau khi metrics có.
5. **Anti-gaming** — filter: `pull_request` field loại, `state:open`, repo `archived=false`, body không rỗng, repo không bot-only (đếm top language + user login pattern). Thêm vào crawler + scoring.
6. **Hard filter validation** — chạy bảng số liệu trước/sau (180d, no-assignee): % issue còn lại + % chất lượng (theo đánh giá thủ công). Ghi kết luận.
7. **API issue-detail** — `GET /api/issues/:id` trả: score (điều chỉnh theo confidence), 4 sub-scores + weights, confidence, hard-filter applied flags, toggle value gốc. Từ Postgres, không gọi GitHub.
8. **UI breakdown** — `ScoreChip` (donut nhỏ màu theo tier) trên card; click → `ScoreBreakdown` drawer: donut 120px + 4 stacked bars (label — value — weight — one-line why) + confidence meter + toggle gốc/điều chỉnh. Mobile-first.
9. **UI refactor card** — IssueCard: owner/repo header, issue title, metadata (lang dot, stars, last activity, labels pills), score chip top-right. Dark theme.
10. **i18n** — thêm keys en/vi cho: nhóm label, why-lines, confidence text, empty state, toggle label. Ship en+vi cùng change (C5).
11. **Test + G1 gate** — chạy calibrate lại sau chỉnh; nếu khớp ≥ 80% → pass G1. Nếu không → đào lại scoring, đừng mở rộng. **G1 là cổng "đủ tốt để thử", không phải hoàn hảo.**

## Success Criteria

- [ ] **G1 pass:** score khớp phán đoán thủ công ≥ 80% (20 issues mẫu).
- [ ] Breakdown UI hiển thị đủ 4 nhóm + weight + one-line why + confidence (Low/Med/High).
- [ ] Confidence rule Q4 đúng (Low nếu sample_count<10 OR computed_at>30d); UI hiện score điều chỉnh + toggle gốc (MED-14).
- [ ] **Re-score:** issues cũ từ phase-01 được tính lại khi repo_metrics mới (không còn score stale) (CRIT-2).
- [ ] Score chip trên card; click mở breakdown; render nhanh mobile.
- [ ] Anti-gaming loại đúng PR/đóng/archived/body rỗng; kết quả sạch hơn.
- [ ] `repo_metrics` có dữ liệu (sample_count, median_first_response_hours, merge_rate_90d) cho các repo đã crawl (job từ phase-01).
- [ ] Hard filter validation có bảng số liệu trước/sau + kết luận.
- [ ] Breakdown load từ cache, không gọi GitHub (C1).
- [ ] i18n en/vi đầy đủ cho mọi nhãn mới, ship cùng change (C5).

## Risk Assessment

- **Calibrate chủ quan** — 20 issues là mẫu nhỏ; không overfit. G1 là cổng "đủ tốt để thử", không phải "hoàn hảo".
- **Confidence rule đổi hậu calibrate** — sau khi calibrate, nếu score gốc tốt ở mọi confidence, cân nhắc không giảm weight (chỉ decorate). Quyết định bằng data, ghi vào `03-design.md`.
- **Re-score kích hoạt rate limit** — score:compute chỉ chạy local (không gọi GitHub) — an toàn. Chỉ repo-metrics mới tốn rate (đã budget phase-01).
- **Breakdown UI phình** — giữ tối giản: donut + bars + confidence + 1 toggle. Không thêm radar/chart lib nặng.

## Test/Validation

- Unit: `packages/scoring` thresholds sau calibrate; `confidence.ts` (sample counts, staleness, score-adjustment).
- Integration: `/api/issues/:id` breakdown JSON đúng (score điều chỉnh + gốc); filter anti-gaming; re-score `stale` flag.
- UI: Playwright screenshot card + breakdown (dark theme, mobile 375px); toggle gốc/điều chỉnh hoạt động.
- G1: chạy `scripts/calibrate.ts`, ghi kết quả → gate decision.
