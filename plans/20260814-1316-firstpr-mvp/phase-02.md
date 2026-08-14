---
phase: 2
title: "Scoring sắc + breakdown UI + cache"
status: DONE_CODE, G1 55% — keyword ceiling; needs outcome-feedback
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

## Implementation notes (2026-08-14)

Nhiều hạng mục phase-02 đã được build sẵn trong phase-01 (confidence module + Q4 rule + score-adjustment, re-score stale, breakdown UI, i18n en/vi). Việc còn lại trong phase-02:

- **Bot-only repo anti-gaming (D15):** `isBotOwner()` trong `packages/github/sanitize.ts` (`type:"Bot"` hoặc login `[bot]` suffix); detect + persist `repos.is_bot_owned` trong crawler; hard filter `repo_bot_owned` trong scoring; API list loại repo bot. Migration `0001_empty_riptide` (is_bot_owned + `repo_metrics.computed_at` index).
- **Confidence-adjusted score là mặc định hiển thị (Q4):** `displayedScore` trả từ API list + detail (giữ `score` = công thức gốc); IssueCard + ScoreChip hiện `displayedScore`; ScoreBreakdown dùng `displayedScore`, toggle về `score` gốc.
- **Weights source-of-truth từ API:** `issues.ts` + `issue-detail.ts` trả `weights` từ `DEFAULT_CONFIG`; UI bỏ hardcode `WEIGHTS` const.
- **`scripts/calibrate.ts`:** tool calibrate G1 (grade N issues, so model ±10 = match, in ra agreement % + diff table). Chạy: `node --import tsx scripts/calibrate.ts --count 20`. Hỗ trợ interactive + piped input.
- **`displayed_score` persisted (fix double-rounding):** migration 0002 thêm `scores.displayed_score`; `score-compute` persist `ScoreResult.displayedScore` (tính từ raw chưa round); API list + detail đọc stored value — scoring/API/UI khớp tuyệt đối, không còn ±1. `displayedScore()` + `displayWeights()` helper trong `packages/scoring/confidence.ts` (single source).
- **Tests:** + confidence tests (7), bot-owner tests, API detail weights/displayedScore test, bot hard-filter test.

**Còn lại (cần data thật + human):**
- ~~**G1 gate:** chạy calibrate với 20 issues THẬT → quyết định ≥ 80%~~ → **ĐÃ CHẠY (2026-08-15): 45% — FAIL.** Chi tiết + hướng recalibrate ở `07-decisions.md` D16. Phải đào lại scoring trước, KHÔNG mở rộng (theo roadmap).
- **G1 recalibration (#13) — DONE (2026-08-15, agreement vẫn 45%):** thêm tín hiệu junior-fit `scoreJuniorFit` (blend 0.5 vào Clarity), feed `title+labels` từ worker + crawl-batch; crawl-batch đổi sang update-in-place (hết bloat scores); calibrate thêm `--issues` pin + oversample ×8; log kết quả ở `07-decisions.md`. Kết quả: **complexity penalty hoạt động đúng hướng** (forge-kernels 92→81, CONTINUUM 92→85) nhưng **agreement KHÔNG đổi (45%)** — bonus beginner-safe không thắng nổi 50% trọng số repo-health+responsiveness (repo nhỏ kéo docs-issue xuống). → **Next step: cân lại trọng số (giảm B/C hoặc tách fit thành term riêng) — quyết định sản phẩm, chờ chủ dự án. KHÔNG mở rộng.**
- **Hard-filter validation table:** trước/sau filter (180d, no-assignee) với data thật.
- **Deploy + demo** với user thật (phase-03).

### Code review status (2026-08-14)

`npm test` (4 workspaces: api 8, github 8, scoring 17, web 1) + `npm run typecheck` → **PASS** (34 tests).

**Đã verify:**
- Bot filter end-to-end: `discover.ts` `isBotOwner(repo.owner)` → `repos.is_bot_owned` (insert + onConflictDoUpdate) → score-compute `repo.isBotOwned` → scoring hard filter `repo_bot_owned` → API list `eq(repos.isBotOwned, false)` + `scores.total>0` + `hardFilters=[]`. Migration 0001 additive (ADD COLUMN default false + CREATE INDEX). List excludes bot issue; detail shows `hardFilters:['repo_bot_owned']` + `isBotOwned:true` (transparency).
- DisplayedScore: **persisted** `scores.displayed_score`, API list + detail đọc stored → verified khớp nhau cho mọi issue (không còn double-round ±1, ~18% trường hợp confidence≠high trước đây).
- Weights: `displayWeights()` từ `DEFAULT_CONFIG` — single source, API không còn hardcode.

**Findings đã fix (2026-08-14):**
1. ~~`issue-detail.ts:66` — displayedScore double-round~~ → **FIXED**: `displayedScore` persist từ `ScoreResult` (migration 0002), API đọc stored value.
2. ~~`calibrate.ts:129-138` — NaN% + false FAIL khi 0 rows~~ → **FIXED**: early-exit "no issues to calibrate".
3. ~~`calibrate.ts:94` — closeDb trong grade() khi rl mở~~ → **FIXED**: hoist `closeDb()` + `rl.close()` vào `finally` trong `run()`.
4. Weights hardcode → **FIXED**: `displayWeights()` từ config, dùng chung 2 route.
5. `repo_metrics_computed_at_idx` — chấp nhận (forward-looking cho staleness sweep tương lai).
6. Backfill `is_bot_owned=false` — chấp nhận (bot repos hiếm khi có issue GFI đã crawl).

### Real-data crawl fixes (2026-08-15)

Chạy crawler thật (G1 prep) phát hiện 3 bug phase-01 chưa từng chạy đúng vì thiếu token:

1. **BullMQ jobId chứa `:` bị reject** (`Custom Id cannot contain :`) — jobId `discover:${ISO}` (nhiều `:`) và `repo-metrics:${id}` (1 `:`) đều fail. BullMQ chỉ cho phép 0 `:` hoặc đúng 2 `:` (3 parts). **Fix:** `discover-${dayEpoch}`, `repo-metrics-${repoId}` (colon-free). `score-compute:${a}:${b}` (2 `:`) giữ nguyên.
2. **GitHub Search bắt buộc `is:issue`** — query thiếu qualifier → `Query must include 'is:issue' or 'is:pull-request'`. **Fix:** thêm `is:issue` vào query discover (đồng thời loại PR ở tầng API). Verified: 7d python trả total_count=1982.
3. **Issue/repo id GitHub vượt int4 (2^31)** — issue id 5153300123 > int4 → `integer out of range`. **Fix:** migration `0003_bright_sue_storm` chuyển `repos.id`, `issues.id`, `issues.repo_id`, `repo_metrics.repo_id`, `scores.issue_id` sang `bigint`.

Thêm `scripts/crawl-batch.ts` — driver batch self-contained (repo-metrics + score-compute cho repo đã crawl, không import Redis để tránh phình memory) cho calibrate.

**Kết quả crawl thật (2026-08-15):** 159 repos, 396 issues, 39 repos có metrics, 250 issues open đã score (125 confidence high/medium có metrics thật). Đủ cho G1 (cần 20).
