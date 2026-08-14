# Thiết kế: Scoring Model + Portfolio Tự Động
## Open Source Contribution Finder cho junior Việt Nam

> **Ngày:** 2026-08-13
> **Trạng thái:** Thiết kế (design), chưa implement. Cơ sở: nghiên cứu trong `02-research.md`.
> **Nguyên tắc cốt lõi:** "Chất lượng" = **xác suất PR đầu của newcomer được merge & được hỗ trợ** — không phải "issue hay".

---

## PHẦN 1: SCORING MODEL

### 1.0 Nguyên tắc chuẩn hoá (BẮT BUỘC — tránh trọng số giả)

- Mỗi nhóm (A/B/C/D) phải được **chuẩn hoá về thang 0–100 TRƯỚC khi nhân trọng số**. Nếu không, trọng số danh nghĩa ≠ trọng số thực tế.
- **Lỗi cũ đã sửa:** RepoHealth trước đây cộng tối đa 85 (không phải 100) → `85 × 25% = 21.25`, không đạt đúng 25%. Freshness/Clarity có bonus cộng dồn **vượt 100** (age 100 + updated 10 + no-assignee 10 = 120). Cả hai đều sai.
- **Cách chuẩn hoá:** mỗi nhóm có tổng điểm thô → **clamp 0–100** → nhân trọng số.
- **Hard filter chạy TRƯỚC scoring:** repo archived / không còn sống, issue quá mốc, body rỗng → **loại ngay, không tính điểm**.

### 1.1 Công thức tổng

```
Score (0-100) = 20%·MaintainerResponsiveness + 15%·RepoHealth + 15%·IssueFreshness + 50%·IssueClarity&Fit
```

**Lý do trọng số (Phương án B — Junior-first, đã rebalance G1 2026-08-15):**
- **IssueClarity&Fit 50% (cao nhất):** khán giả mục tiêu là **junior** — FSE 2020 chỉ ra lý do newcomer fail nhiều lần chủ yếu là **issue mơ hồ, không hiểu nhiệm vụ**. Sau G1 rebalance, nhóm này gồm **clarity (body rõ)** + **junior-fit (task approachable)** — trọng số nâng 35→50 vì calibrate cho thấy docs/beginner issue trên repo nhỏ bị kéo xuống bởi maintainer+repoHealth 50%. Giờ "có hiểu được việc + có phù hợp beginner" quyết định.
- **MaintainerResponsiveness 30→20%:** vẫn quan trọng (ICSE 2023: expert involvement thúc đẩy success), nhưng repo nhỏ/fresh không nên chôn một issue beginner-hoàn hảo chỉ vì ít sample/stars.
- **RepoHealth 20→15%:** "repo còn sống" đã là **hard filter** (§1.0) — không tính lại. Phần còn lại (stars, license, CONTRIBUTING) bớt quyết định để beginner-fit được lên.
- **IssueFreshness 15%:** điều kiện cơ bản (issue tươi), giữ nguyên.

### 1.2 Nhóm A: Maintainer Responsiveness (30%)

**Repo-level** (tính từ cache ~30 issue/PR gần nhất của repo):

| Tín hiệu | Cách tính | Điểm |
|---|---|---|
| `median_first_response_hours` | giờ từ mở issue → comment đầu của người khác (non-author) | `< 24h → 100` · `< 72h → 80` · `< 7 ngày → 50` · còn lại → 20 |
| `merge_rate_90d` | % PR được merge trong 90 ngày qua | `> 80% → 100` · `> 60% → 75` · `> 40% → 50` · còn lại → 20 |

**Chuẩn tham chiếu (ICSE 2023):** median first-response ≈ **8.5h** → chuẩn "dưới 24h = 100" là hợp lý, không quá khắt khe.

**Issue-level (bonus):** maintainer có comment trên chính issue này trong `< 14 ngày` → **+20**.

**Max thô = 100** (responsiveness 80 + bonus 20). **Vì sao `merge_rate_90d` quan trọng:** FSE 2020 chứng minh label GFI *không đảm bảo* merge. `merge_rate` là tín hiệu **kết quả thật**, trực tiếp chống lại bẫy label.

### 1.3 Nhóm B: Repo Health (20%)

> **Hard filter (chạy TRƯỚC, §1.0):** repo `archived` = true, hoặc `pushed_at` > 90 ngày (repo chết) → **LOẠI NGAY, không tính điểm.** "Repo còn sống" là điều kiện để vào sân, không phải để kiếm điểm. → hết double-count với Responsiveness.

| Tín hiệu (API trả sẵn) | Điều kiện | Điểm (thô, clamp 0–100) |
|---|---|---|
| `stargazers_count` | `> 1000 → 30` · `> 100 → 20` · `> 10 → 10` · còn lại 0 | 0–30 |
| `license` | có đủ license | +20 |
| README có `../CONTRIBUTING.md` | có hướng dẫn đóng góp rõ | +25 |
| `has_issues` | `true` | +15 |
| `open_issues_count` | hợp lý (không 0 cũng không quá tải) | +10 |

**Max thô = 100.** Không repo nào "hoàn hảo" nếu thiếu tín hiệu. **Lưu ý:** điểm stars/activity CHỈ là dấu hiệu "có cộng đồng", KHÔNG phải là tín hiệu "chủ còn sống" (đã là hard filter).

### 1.4 Nhóm C: Issue Freshness (15%)

| Tín hiệu | Điều kiện | Điểm (thô, clamp 0–100) |
|---|---|---|
| **Age** | `created < 30d → 70` · `< 60d → 55` · `< 120d → 40` · `> 120d → 20` | lấy max ~70 |
| `updated_at` | `< 30d` (người ta vẫn biết đến issue) | +20 |
| `no:assignee` | chưa ai nhận (assigned = bỏ, đã có người làm) | +10 |
| **Hard filter** | **mở quá 180 ngày → LOẠI** (§1.0) | — |

**Max thô = 100** (70+20+10). **Lý do hard filter 180 ngày:** FSE 2020 — issue mốc = bẫy cho người mới; càng ít khả năng được ai nhớ tới.

### 1.5 Nhóm D: Issue Clarity & Fit (35%) — TRỌNG SỐ CAO NHẤT

> **Vì sao cao nhất:** khán giả là **junior**. FSE 2020: lý do newcomer fail nhiều lần chủ yếu là issue mơ hồ, không hiểu nhiệm vụ. "Hiểu được việc" là yếu tố quyết định PR đầu thành công.

| Tín hiệu | Điều kiện | Điểm (thô, clamp 0–100) |
|---|---|---|
| Body rỗng / không thể hiểu | **LOẠI** (hard filter, §1.0) | — |
| Body length + rõ ràng | `>= 200 ký tự` và mô tả được việc → +30 | ~30 |
| Có steps / hướng dẫn bắt đầu | mô tả cụ thể cách làm, điểm bắt đầu rõ → +25 | ~25 |
| Có reference (file/func/link) | đích danh nơi cần sửa → +15 | ~15 |
| **Scope nhỏ (a-ha)** | issue dạng docs / test / bugfix đóng khung → +20 (feature to → thấp) | ~20 |
| Label beginner | `good first issue` / `first-timers-only` / `help wanted` / `good first contribution`… → **BONUS +10** | +10 |

**Max thô = 100** (30+25+15+20+10).

**Scope nhỏ = chiều mới:** issue nhỏ, đóng khung rõ (docs, tests, bugfix nhỏ) tốt hơn nhiều cho PR đầu so với feature to. Estimating scope từ API khó — gộp nhẹ vào Clarity ở MVP, chưa tách thành nhóm riêng.

**Điểm chiến lược quan trọng:** label beginner chỉ là **bonus +10, không bắt buộc** (bỏ khỏi yêu cầu tối thiểu). Đây chính là chỗ khác biệt với goodfirstissue.dev (vốn tin tưởng label tuyệt đối). Dựa theo FSE 2020 + cảnh báo trend label yếu → thiết kế **không phụ thuộc 1 label**.

> **⚠️ G1 FAIL (2026-08-15) — Clarity hiện tại đọc body-length, không đọc độ khó:** calibrate 20 issues thật cho 45% agreement. Model chấm 92 cho cả tutorial notebook, state-machine bug, và method `birth()` (dễ) vì body dài + có repro → không phân giải **task complexity / junior-fit**. Đồng thời không thưởng "safe-zone: docs-only" (retinue/localmem/GCode) dù lý tưởng cho junior. **Recalibrate bắt buộc trước khi mở rộng:** thêm tín hiệu beginner-fit (từ khoá docs/safe-zone/first-timers-only, phạt pattern phức tạp như nhiều positional params, kernel/state-machine internals). Chi tiết: `07-decisions.md` D16.

### 1.6 Chống game hóa (anti-gaming) — trụ cột tin cậy

- **Loại PR** (field `pull_request`), loại issue đã đóng, loại repo bot-only.
- **Confidence score (0-100)**: thể hiện độ đầy đủ tín hiệu. Nếu repo signals cache cũ/hụt → giảm weight, hiển thị "chưa đủ dữ liệu".
- **Hiển thị breakdown per-criterion** cho từng issue: junior hiểu *vì sao* — vừa giáo dục vừa xây trust (đối nghịch với scoring black-box).
- **Anti self-star / fork-only** khi xây portfolio (xem Phần 2).

#### Confidence semantics (Q4 — đã chốt, MED-14)

| Level | Điều kiện | Điểm hiển thị |
|---|---|---|
| **High** | `sample_count ≥ 30` **và** `repo_metrics.computed_at` mới (≤ 30 ngày) | giữ nguyên score công thức |
| **Medium** | `sample_count` 10–29 | **giảm weight 0.9** (score hiển thị = 90% công thức) |
| **Low** | `sample_count < 10` **hoặc** metrics cũ > 30 ngày | **giảm weight 0.7** |

- Confidence KHÔNG chỉ decorate: khi không phải High, score hiển thị bị giảm weight (0.9/0.7) — nhưng vẫn hiển thị đầy đủ breakdown + nút toggle "score gốc theo công thức". Không bí mật, không black-box.
- Rule được implement trong `packages/scoring/src/confidence.ts` (factor + reason) và mirror ở API + UI.

#### Bot-only repo (anti-gaming, phase-02)

- Repo sở hữu bởi GitHub **Bot account** bị **hard-filter**: `type: "Bot"` hoặc login kết thúc `[bot]` (dependabot[bot], renovate[bot], github-actions[bot]) → `hardFilters` chứa `repo_bot_owned`, score 0, không vào danh sách.
- Lý do: repo bot mass-mine label `good first issue` bằng scripts, tạo issue rác — độc hại nhất với junior.
- Implement: `packages/github/src/sanitize.ts` `isBotOwner()`, detect tại crawler (`discover`), persist `repos.is_bot_owned`, hard-filter trong scoring.

### 1.7 Tính khả thi dưới rate limit (số cụ thể)

- **Discovery:** Search API 30 req/min; dùng qualifier `label:"good first issue"`, `language:`, `created:>`, tách query theo ngôn ngữ → mỗi query ≤ 1.000 results (cap đã xác nhận).
- **Crawl nền:** GitHub App token 12.500 req/h. Khoảng 2.000–5.000 repos active → refresh **repo-level mỗi ngày** + **issue-level T+2h**. Cache Postgres.
- **User load luôn đọc từ cache**, không query trực tiếp → đủ cho indie app.

### 1.8 V2 — vòng phản hồi outcome (moat tích lũy)

```
user: "tôi làm issue này"
  → repo detect PR merge → ghi nhận success/fail thật
  → mỗi tháng chạy tuning (coordinate descent / logistic regression)
  → weights tự cập nhật theo outcome thực
```

**Vì sao là moat:** công thức (1.1) có thể sao chép trong 1 ngày. **Vòng phản hồi outcome** thì không — càng chạy lâu, model càng đúng với thực tế VN, càng khó copy. Moat của bạn là **dữ liệu outcome tích lũy**, không phải công thức.

---

## PHẦN 2: PORTFOLIO TỰ ĐỘNG

### 2.1 Mục tiêu rõ ràng

> "Hồ sơ xin việc sống, share-able, phục vụ tuyển dụng VN." — **không phải thêm mạng xã hội.**

Junior VN cần **một URL gửi recruiter**, không cần nơi khoe thêm.

### 2.2 Cấu trúc trang portfolio (từ GitHub username)

1. **Hero:** ảnh, handle, tổng PR merged qua các OS projects, tổng issue đã hỗ trợ.
2. **Contribution map** (heatmap kiểu GitHub) + breakdown ngôn ngữ.
3. **Project cards:** repo, vai trò, tech stack, PR merged + issue đã giúp trên repo đó, link trực tiếp.
4. **Journey timeline:** "issue #123 repo X → PR merged 12/08/2026" — **câu chuyện, không phải list**.
5. **Badge path (gamification gắn thật):** `Contributor → Active → Merged-First-PR`… — **chỉ cấp khi có merged PR thật** (qua API), không tưởng tượng.

### 2.3 Khoảnh khắc share (viral loop)

- Mỗi user có URL duy nhất + **tự sinh OG image** cho Facebook/Telegram/Zalo → "Đây là open source mình đang contributing" — chuẩn bài viral VN.
- **Auto-update:** contribution mới tự thêm vào portfolio → **lý do quay lại mỗi kỳ cập nhật** (giải bài toán retention).

### 2.4 Integrity (bắt buộc — thị trường VN dễ nghi ngờ thổi phồng)

- **CHỈ hiển thị PR đã merge** (check state) — không hiển thị pending.
- **Chống thổi phồng:** loại PR fork-only, phát hiện self-star, tài khoản mới phải > X merged mới được active badge.
- Badge **"Verified"** cho tài khoản có nhiều contributions thật → xây trust với recruiter.

### 2.5 VN-specific (chiến lược, không phải dịch)

- **Recruiter-friendly export:** 1 nút "Export CV summary" → PDF / khối ATS "Open Source Contributions" — recruiter VN không phải lục GitHub.
- **Puzzle tuyển dụng:** so trùng tech stack portfolio vs job description → gợi ý "còn thiếu tín hiệu nào để hồ sơ mạnh hơn".

---

## Link ngược về điểm khác biệt với goodfirstissue.dev

| Câu hỏi "khác gì?" | Phần trả lời |
|---|---|
| goodfirstissue lọc bằng label | bạn lọc bằng **hành vi** (responsiveness + merge_rate + freshness) — §1.2–1.4 |
| họ dừng ở "tìm issue" | bạn **đưa trọn hành trình tới portfolio xin việc** — Phần 2 |
| họ không đo độ tin cậy | bạn **trắng trợn từng tiêu chí + confidence score** — §1.6 |
| họ không tự cải thiện | vòng phản hồi outcome → **model tự tốt lên theo thời gian** — §1.8 |

---

## Các câu hỏi cần chốt trước khi implement

1. **Trọng số (ĐÃ CHỐT — Phương án B):** `30/20/15/35` Junior-first. Cần validate bằng dữ liệu thật (mini-scan + vòng phản hồi outcome), không phải tin mù công thức.
2. **Điều chỉnh đã làm trong review này:**
   - **Normalization bắt buộc:** mỗi nhóm clamp 0–100 TRƯỚC khi nhân trọng số (sửa lỗi danh nghĩa ≠ thực tế).
   - **Hard filter tách riêng:** repo archived / > 90 ngày không push → loại trước khi score; "repo còn sống" không tính điểm nữa (hết double-count với Responsiveness).
   - **Clarity lên 35% (cao nhất):** junior-first — FSE 2020: issue mơ hồ là lý do fail #1.
   - **Scope nhỏ (docs/tests/bugfix) thêm vào Clarity:** a-ha cho PR đầu.
   - **Label beginner chỉ còn bonus +10** (bỏ khỏi yêu cầu tối thiểu).
3. **Chuẩn threshold** (§1.2–1.4): 24h/72h/7d; 180d hard filter; 90d push baseline… — là giả định hợp lý từ ICSE 2023, cần kiểm chứng với dữ liệu repo thật.
4. **Phạm vi ngôn ngữ ban đầu:** nên khởi đầu 2–3 ngôn ngữ (Python, JavaScript, TypeScript — chiếm đa số trong topic `good-first-issue`) để crawl sâu + validate trước khi mở rộng.
