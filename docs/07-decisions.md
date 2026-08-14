# FirstPR — Decisions, Handoff & Glossary

> File này là file "bàn giao" — để **người kế nhiệm** hiểu vì sao từng quyết định được chốt, phân biệt cái gì *đóng* vs cái *mở*, và có checklist để nắm toàn bộ dự án trong 1 buổi.

**Ngày:** 2026-08-13
**Trạng thái:** Concept + Design.
**Bạn đọc:** Chủ dự án, người kế nhiệm, người mới tham gia.

---

## 1. Check: bạn đã đọc hết chưa? (Onboarding checklist)

> Người kế nhiệm nên đọc theo đúng thứ tự này để hiểu hết, không cần hỏi lại chủ dự án.

- [ ] **../README.md** — bức tranh 1 trang (bắt đầu)
- [ ] **01-vision.md** — VÌ SAO (đọc trước)
- [ ] **02-research.md** — THỊ TRƯỜNG + feasibility + kiểm chứng nguồn
- [ ] **03-design.md** — THIẾT KẾ scoring model + portfolio
- [ ] **04-roadmap.md** — LÀM GÌ tuần 1–4, có decision gates
- [ ] **05-business.md** — AI TRẢ TIỀN (sau validate)
- [ ] **06-oss.md** — VẬN HÀNH solo (rủi ro + sổ tay bảo trì)
- [ ] **07-decisions.md** (chính là file này) — QUYẾT ĐỊNH + câu hỏi mở
- [ ] **08-marketing.md** — KỂ CHUYỆN + nguyên liệu marketing (đọc sau cùng, không bắt buộc cho kế thừa)
- [ ] **09-techstack.md** — CHỐT KỸ THUẬT: stack + feasibility + C1 (đọc trước khi lập plan)

**Kiến thức cần nắm được sau khi đọc xong (tự kiểm tra):**
1. Vấn đề là gì, FirstPR giải quyết bằng 3 thứ nào?
2. Khác biệt vs goodfirstissue.dev chính xác là gì?
3. Công thức scoring + vì sao trọng số như vậy?
4. Kế hoạch MVP 4 tuần + decision gates (G1/G2/G3)?
5. Vòng phản hồi outcome cải thiện model ra sao?

---

## 2. Decisions Log — các quyết định ĐÃ chốt

> Mục đích: giải thích rationale (vì sao), để người kế nhiệm KHÔNG phải làm lại, và biết khi nào nên thay đổi.

| # | Ngày | Quyết định chốt | Rationale (vì sao) | Có thể thay đổi khi nào |
|---|---|---|---|---|
| D1 | 2026-08-13 | **Chọn hướng Open Source Contribution Finder** (không chọn Knowledge Garden) | Thị trường: nhiều tool "tìm issue" nhưng KHÔNG ai làm *scoring chất lượng hành vi* + bản địa hoá VN. Knowledge Garden cạnh tranh trực tiếp Obsidian/Logseq/Quartz — khó thắng. | Bối cảnh thị trường đổi; research mới phản bác timing |
| D2 | 2026-08-13 | **Scoring dựa hành vi (responsiveness/repo-health/freshness/clarity), KHÔNG dựa label** | FSE 2020 chứng minh label `good first issue` không đảm bảo thành công; preprint 2026 gợi ý label trend đang yếu → không phụ thuộc 1 label | Khi dữ liệu outcome thật học được weights (V2) |
| D3 | 2026-08-13 | **Trọng số Junior-first: 30/20/15/35 (responsiveness/repo/freshness/clarity)** | Khán giả là junior → clarity (hiểu việc) cao nhất. Repository "còn sống" tách làm hard filter (hết double-count với responsiveness). **Đã sửa lỗi normalization** (mỗi nhóm clamp 0–100 trước khi nhân trọng số) | Khi vòng phản hồi outcome cho trọng số thật (V2); đây là **priors** không phải sự thật |
| D4 | 2026-08-13 | **MVP = 4 tuần, ship nhẹ, đo hành vi** | Triết lý: ship một thứ junior dùng được trong tuần 1; quyết định bằng hành vi người dùng thật, không bằng phân tích thêm | Mỗi gate G1/G2/G3 là cơ hội pivot |
| D5 | 2026-08-13 | **Bản địa hoá VN làm khác biệt (persona An — junior VN)** | Phân khúc VN trống, VFOSSA + cộng đồng dev VN sẵn làm kênh; tool global không phớt lờ tiếng VN được | Khi mở rộng toàn cầu (V2 mở rộng ngôn ngữ) |
| D7 | 2026-08-13 | **README song ngữ: `../README.md` = EN chính + `../README_Vi.md` = VI riêng** | Phục vụ cả community VN + global/tuyển dụng; giữ README chính bằng tiếng Anh cho reach rộng | Không — ổn định rồi |
| D8 | 2026-08-13 | **Branch mặc định `main`** | Convention GitHub hiện đại; xoá master cũ khi set default | Không |
| D9 | 2026-08-13 | **Định vị: C — Công cụ cộng đồng VN (OSS, MIT, public)** | Khớp động lực "cùng dùng, cùng đóng góp" (Q1). A (portfolio) gộp vào C — build-in-public tự có. B (monetize) trì hoãn sau validate. Rủi ro + vận hành solo: `06-oss.md` | Khi có người dùng thật + dữ liệu outcome → cân nhắc B |
| D10 | 2026-08-13 | **Public repo + LICENSE MIT + CONTRIBUTING + 3 starter issues (dogfooding)** | Self-dogfooding = marketing không đối thủ nào dùng được; public để tự dùng + CV; repo tự gắn `good first issue` chứng minh sản phẩm | Không — nền tảng ổn định |
| D11 | 2026-08-14 | **Tech stack: Fastify + Drizzle + Postgres + Redis/bullMQ (worker riêng) + Vite/React + Better Auth (GitHub OAuth) + VPS/Docker/Caddy + PostHog cloud + i18next + Vitest + @vercel/og** | Brainstorm (docs/09). Nhẹ + TS-native + chi phí thấp; worker riêng + Redis để scale crawl; cache Postgres giữ đúng design §1.7. Auth = Better Auth (Lucia đã deprecated 2025-03 → không dùng). | Khi scale thật (user > 1–5k): cân nhắc managed DB / queue cloud |

Bổ sung cho D11 — acceptance criterion:
- **C1 (rate-limit/cache):** đo khả năng cache từ data thật (mini-scan) TRƯỚC khi cam kết số repo/tháng → đưa thành mục trong plan. Cache tệ → vỡ 12.500 req/h.

### Phase-01 build decisions (2026-08-14)

| # | Ngày | Quyết định chốt | Rationale | Có thể thay đổi khi nào |
|---|---|---|---|---|
| D12 | 2026-08-14 | **Monorepo npm workspaces:** `apps/{api,worker,web}` + `packages/{db,scoring,github}` | Tách worker khỏi web ngay từ đầu (queue riêng, scale crawl); chia shared code (scoring, db, github client) qua packages để API + worker dùng chung; npm (không pnpm/yarn) — không thêm tool. | Khi scale lớn: tách repo / monorepo tool chuyên dụng |
| D13 | 2026-08-14 | **Q1 đã chốt: GitHub OAuth scope = `read:user` + `user:email` (+ `public_repo`). KHÔNG `repo`.** **Q2 đã chốt: `encryptOAuthTokens: true` — accessToken encrypted at rest.** | `repo` scope quá rộng — leak blast radius lớn; `public_repo` đủ cho portfolio/outcome đọc public PR. Token encrypt at rest = C6 (token revoke vẫn không đọc được plaintext). | Khi cần đọc private repo của user (V2) — phải cân nhắc lại blast radius + review security |

Đồng bộ với plan phase-01:
- **C6 (secrets/encryption):** `.env.example` đã tạo + `.env` gitignored; `encryptOAuthTokens: true` trong `apps/api/src/lib/auth.ts`; Redis AOF + volumes trong compose; `scripts/backup.sh` (weekly pg_dump) + `scripts/restore.md` runbook.
- **C1 (cache):** API `/api/issues` đọc Postgres cache duy nhất (không gọi GitHub); worker là nơi duy nhất crawl; `packages/github/rate-limiter.ts` token-bucket theo job (discover 30 req/min, repo-metrics 12.5k/h).

### Phase-02 build decisions (2026-08-14)

| # | Ngày | Quyết định chốt | Rationale | Có thể thay đổi khi nào |
|---|---|---|---|---|
| D14 | 2026-08-14 | **Confidence hiển thị giảm weight (Q4):** score hiển thị = công thức × 1.0/0.9/0.7 theo High/Med/Low; toggle "score gốc theo công thức" trên breakdown. Rule implement `packages/scoring/src/confidence.ts`, mirror ở API + UI. | Khi tín hiệu thiếu/cũ → đừng chê/bốc issue bằng score "ảo". Giảm weight là hành động thật (anti-gaming), không chỉ decorate. Người dùng vẫn thấy breakdown + score gốc (không black-box). | Sau G1 calibrate nếu score gốc tốt ở mọi confidence → cân nhắc chỉ decorate. Quyết định bằng data, ghi vào `03-design.md`. |
| D15 | 2026-08-14 | **Bot-owned repo bị hard-filter (anti-gaming):** `isBotOwner()` = `type:"Bot"` hoặc login kết thúc `[bot]`; persist `repos.is_bot_owned`; hard filter `repo_bot_owned` trong scoring. Migration 0001. | Repo bot mass-mine label GFI bằng scripts → issue rác, độc hại với junior. `[bot]` suffix là convention GitHub rõ ràng, không false-positive login người thật. | Khi có dữ liệu thật cho thấy bỏ sót/kill nhầm repo chất lượng → calibrate lại. |
| D16 | 2026-08-15 | **G1 gate: FAIL 45% (cần ≥80%)** — recalibrate scoring, KHÔNG mở rộng. Đánh giá (AI-proxy: Claude grade 20 issues thật, cần xác nhận chủ dự án): model **over-score bài phức tạp** (forge-kernels 17-param kernel Δ−37, CONTINUUM state-machine Δ−27, ThePerson `birth()` Δ−20) và **under-score task docs/an toàn cho beginner** (retinue Δ+28, localmem Δ+26, GCode Δ+24). Root cause: **Clarity 35% đọc body length, không đọc độ khó/nhận biết "safe-zone"**. | G1 là cổng "đủ tốt để thử". Chỉ pass khi score khớp thủ công ≥80% trên 20 issues THẬT (do chủ dự án grade). |

**Kết quả calibrate chi tiết (G1, 2026-08-15)** — 20 issues thật, grade bởi Claude (proxy):
- Agreement raw ±10: **9/20 = 45%** · Displayed: 7/20 = 35% → **FAIL**
- Hai lỗi hệ thống rõ:
  1. **Doc/kernel complexity không phân giải:** body dài & có repro → 92 cho cả tutorial notebook, state-validator bug, `birth()` method, doc hardware tiers — không phân biệt junior-fit. Trusted B/C (repo health 20%) gần như hằng số với repo có metrics → toàn bộ trọng số dồn vào Clarity (body length).
  2. **"Safe-zone"/docs-only không được thưởng:** issue gắn cờ "safe zone: docs only, no core risk" (retinue, localmem, GCode) bị 62 dù lý tưởng cho junior.
- **Hướng recalibrate (đề xuất, chờ chủ dự án):** thêm tín hiệu **task complexity / beginner-fit** trong Clarity — gắn cờ từ khoá (docs, tutorial, safe-zone, first-timers-only) + phạt pattern phức tạp (nhiều positional param, kernel/state-machine internals); cân nhắc hạ trọng số clearness còn nếu body dài nhưng task khó.
- **Kết quả recalibrate (2026-08-15):**
  1. **Junior-fit signal** implement `packages/scoring` (`scoreJuniorFit`, feed title+labels). Docs-about-advanced-topic không còn dưới neutral.
  2. **Weight rebalance 20/15/15/50** (maintainer 30→20, repoHealth 20→15, clarity 35→50) — docs/beginner issue trên repo nhỏ được nâng (retinue 62→73, localmem 62→74, GCode 62→74). **Agreement: 45% → 55%** trên cùng 20 issues (11/20).
  3. **Gap còn lại tới 80%:** advanced penalty keyword-based KHÔNG bắt được một số task phức tạp (forge-kernels "Expose fused cross-entropy chunk_size" fit=60 neutral — không có từ khoá "kernel/positional"), và advanced task lại được hưởng clarity 50% (body dài). → Keyword-based complexity detection đạt trần ~55%; cần tín hiệu khác (outcome-feedback V2, hoặc ML đọc body) để vượt 80%. **Chưa pass G1.**
- **Đồng thời:** `vitest.config.ts` api thêm exclude `dist/**` (trước chạy test từ dist compile cũ).

---

## 3. Open Questions — câu hỏi CHƯA đóng (cần chủ dự án)

> Những câu này phải trả lời trước khi vượt quá giai đoạn chiến lược. Đánh dấu mức độ khẩn. (Q1, Q4 đã đóng — thay bằng D9/D10.)

| # | Câu hỏi | Ảnh hưởng tới | Độ khẩn | Ghi chú |
|---|---|---|---|---|
| ~~Q1~~ | ~~Mục tiêu dài hạn?~~ | — | — | ✅ **ĐÃ CHỐT → D9** (Công cụ cộng đồng VN) |
| Q2 | Mô hình giá cụ thể (B2B recruit-export / sponsor)? | `05-business.md` Hướng A/B | 🟡 Sau validate | Chưa cần ở MVP |
| Q3 | Xác minh trend "GFI label suy giảm 2024" bằng dữ liệu thật? | Độ tin cậy của 1 luận cứ trong vision | 🟡 Thấp | 1 preprint, chưa peer-review; khuyến nghị tự scan GitHub nếu dùng làm luận cứ |
| ~~Q4~~ | ~~Public repo khi nào?~~ | — | — | ✅ **ĐÃ CHỐT → D10** (đã public) |

---

## 4. Checklist bàn giao cho người kế nhiệm (từng bước)

> Khi thoả thuận "bàn giao" xong, người kế nhiệm nên hoàn thành checklist này trong 1 buổi.

**Trước khi viết code:**
- [ ] Đọc tất cả file ở `§1` theo thứ tự.
- [ ] Nắm 5 kiến thức cốt lõi (`§1` bạn tự kiểm tra).
- [ ] Chốt Q1 (mục tiêu dài hạn) với chủ dự án.

**Khi bắt đầu build:**
- [ ] Cài môi trường (Node/TS + Postgres + Vite/React).
- [ ] Setup GitHub App + OAuth + token manager (theo roadmap tuần 1).
- [ ] Tạo schema DB (issues, repos, scores, users, contributions).
- [ ] Build crawler v1 + scoring v1 (theo design).
- [ ] Theo đúng roadmap 4 tuần + decision gates.

**Trong quá trình:**
- [ ] Cập nhật `07-decisions.md` mỗi khi chốt quyết định mới.
- [ ] Ghi lại bất kỳ thay đổi rationale nào (để không mất ngữ cảnh).

---

## 5. Glossary — thuật ngữ dùng chung

| Thuật ngữ | Nghĩa |
|---|---|
| **GFI** | `good first issue` — label GitHub cho issue thân thiện người mới |
| **Scoring heuristic** | Scoring bằng luật/gợi ý thủ công (MVP), thay vì học từ dữ liệu |
| **Hard filter** | Điều kiện LOẠI ngay (archived repo, body rỗng…) trước khi tính điểm |
| **Priors** | Giá trị giả định từ nghiên cứu — chưa phải sự thật đo được |
| **Outcome feedback loop** | Vòng học: PR merged/không merged → cập nhật trọng số scoring |
| **Benchmark / Funnel** | Chuỗi hành vi user đo được (tìm issue → chọn → làm → merge) |
| **North Star Metric** | 1 chỉ số thành công duy nhất (số junior hoàn thành PR đầu/tuần) |
| **MONETIZE** | Bắt đầu tính tiền — KHÔNG làm trước khi validate |