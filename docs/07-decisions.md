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