# FirstPR — Vision & Strategy

> File này trả lời câu "VÌ SAO" — bức tranh lớn. Đọc file này trước, rồi mới tới thiết kế và roadmap.
> Nếu bạn chỉ đọc 1 file, hãy đọc file này.

**Ngày:** 2026-08-13
**Trạng thái:** Concept + Design. Chưa implement.
**Bạn đọc:** Chủ dự án, người bàn giao, người kế nhiệm.

---

## 1. Elevator pitch (1 câu, nói trong 5 giây)

> **FirstPR giúp junior developer Việt Nam hoàn thành PR open-source đầu tiên — rồi tự động biến nó thành portfolio xin việc.**

---

## 2. Vấn đề (Problem)

**Người mới (junior VN) muốn bước vào open source nhưng thất bại vì 3 lý do:**

1. **Không tìm được issue "tốt thật".** Tool hiện có (goodfirstissue.dev…) chỉ lọc theo *label* `good first issue` — nhưng FSE 2020 (9.368 issue/816 repos) chứng minh: **label không đảm bảo thành công**. Nhiều issue được label vẫn mơ hồ, không ai trả lời, repo chết.
2. **Không biết bắt đầu từ đâu.** Tìm được issue rồi thì lạc giữa git workflow, cộng đồng, thuật ngữ. Thiếu một hành trình có cấu trúc.
3. **Không có "bằng chứng" để xin việc.** Làm xong PR thì nó nằm im trong GitHub — junior VN không biết khoe nó ra sao để nhà tuyển dụng thấy.

**Hệ quả:** phần lớn junior VN thử open source 1 lần, fail, rồi bỏ — phí phạm một kênh phát triển cực kỳ hiệu quả cho sự nghiệp.

---

## 3. Giải pháp (Solution)

FirstPR làm **3 việc** — đủ trọn hành trình:

| # | Thành phần | Trả lời vấn đề |
|---|---|---|
| 1 | **Issue scoring chất lượng** — lọc theo *hành vi* (maintainer responsiveness, repo health, freshness, độ rõ ràng) chứ không phải label. | Vấn đề 1 |
| 2 | **Roadmap học + checklist PR đầu + theo dõi outcome thật.** | Vấn đề 2 |
| 3 | **Portfolio tự động** — mỗi contribution thành trang hồ sơ share-able, phục vụ trực tiếp tuyển dụng. | Vấn đề 3 |

---

## 4. Tại sao BÂY GIỜ (Why Now)

1. **Cơn đau đang lớn dần.** Số developer VN tăng nhanh, nhu cầu "portfolio để xin việc" là ưu tiên số 1 — đúng lúc thị trường tuyển dụng junior cạnh tranh khốc liệt.
2. **Công cụ hiện có đã lỗi thời.** goodfirstissue.dev, up-for-grabs, Code Triage… chủ yếu sinh ra 2016–2020, đều lọc theo *label*, không ai làm *scoring chất lượng hành vi*.
3. **Dữ liệu để xây scoring đã sẵn.** GitHub API cung cấp đủ tín hiệu (responsiveness, freshness, repo health). Nghiên cứu học thuật (ICSE 2023: ~70% GFI có expert tham gia) đã chứng minh có thể đo được.
4. **Chưa ai chiếm phân khúc VN.** Tool toàn cầu phớt lờ ngôn ngữ + văn hoá VN. VFOSSA (hiệp hội FLOSS VN) sẵn sàng làm đối tác phân phối.

**Nói gọn:** *nhu cầu* có sẵn, *công cụ* lỗi thời, *dữ liệu* đủ, *phân khúc* trống. Thời điểm tốt.

---

## 5. Người dùng mục tiêu (Persona)

**Persona chính — "An, Junior VN 2 năm kinh nghiệm":**
- 22–26 tuổi, dev web (JS/TS/Python), 0–2 năm kinh nghiệm.
- Muốn nâng cấp CV, xin vào công ty tốt hơn.
- Ngại/không biết bắt đầu với open source. Đã thử 1–2 lần, bỏ.
- Học nhanh, hoạt động tích cực trên Facebook dev groups / Discord / Telegram VN.

**Người dùng phụ:** sinh viên CNTT năm cuối; senior VN muốn portfolio mạnh hơn; công ty tuyển dụng junior VN (bên mua).

---

## 6. Thị trường & đối thủ (phân khúc rõ)

### Bản đồ đối thủ

| Công cụ | Cách lọc | Điểm dừng | Kẽ hở |
|---|---|---|---|
| **goodfirstissue.dev** | Label `good first issue` | "Tìm issue" | Chỉ dựa label, không scoring; maintainer tự nộp → nguồn hẹp |
| **up-for-grabs.net** | Label `up-for-grabs` | "Tìm issue" | Coverage phụ thuộc maintainer chịu gắn label |
| **Code Triage** | Repo user tự chọn, email 1 issue/ngày | "Đọc issue" | Không score, không beginner-first |
| **First Contributions** | Dạy PR workflow giả lập | "Làm quen" | Chỉ giáo dục, không tìm issue thật |
| **First Timers (App)** | Tự sinh issue `first-timers-only` | Phía maintainer | Không phục vụ người mới trực tiếp |
| **Gitista (Vietnam)** | Xếp hạng contributor VN | "Đo lường" | Chỉ đo ai rồi, không giúp từ 0 |

### Điểm khác biệt cốt lõi (moat)

| Chiều | goodfirstissue.dev | **FirstPR** |
|---|---|---|
| Lọc bằng | Label | **Hành vi** (responsiveness + merge rate + freshness) |
| Dừng ở đâu | "Tìm issue" | **Trọn hành trình → portfolio xin việc** |
| Độ tin cậy | Không giải thích | **Per-criterion breakdown + confidence score** |
| Tự cải thiện | Không | **Vòng phản hồi outcome → model tự tốt lên** |
| Ngôn ngữ | Global | **Bản địa hoá VN** |

---

## 7. Mục tiêu & thành công (Success Metrics)

**North Star Metric (một con số duy nhất):**
> **Số lượng junior VN hoàn thành PR đầu tiên thành công qua FirstPR mỗi tuần.**

**Chỉ số hỗ trợ (cần đo để biết đúng/sai):**
- Số user active / week (WAU)
- Tỉ lệ chuyển funnel: tìm issue → chọn → làm → **PR merged**
- Thời gian từ đăng ký → PR merged đầu tiên
- Số portfolio được share (share rate = viral)
- Tỉ lệ quay lại (retention) — vì portfolio/auto-update là lý do quay lại

---

## 8. Phạm vi (Scope)

### ✅ TRONG phạm vi (MVP 4 tuần)
- Crawl + scoring issue v1 (4 nhóm: responsiveness, repo health, freshness, clarity)
- UI: danh sách issue sắp theo score + filter ngôn ngữ
- Checklist "làm PR đầu" + roadmap học
- Portfolio v1 (từ username GitHub) + OG image + badge
- Auth: GitHub OAuth

### ❌ NGOÀI phạm vi (V2+)
- VN-specific full, gamification, recruit-export (B2B), vòng phản hồi outcome tuning
- Mở rộng ngôn ngữ (Go, Rust, Java)
- Monetization

> **Triết lý:** validate xong (tuần 1–4) mới mở rộng. Không build full 3 tháng rồi mới hỏi ai cần.

---

## 9. Rủi ro chiến lược lớn nhất (nhìn thẳng)

1. **Scoring chưa đúng → người dùng thất vọng.** → Giảm thiểu: gate G1 (calibrate thủ công tuần 2).
2. **Không ai làm PR đầu (retention/activation thấp).** → Giảm thiểu: gate G2 (pivot sớm).
3. **Trend label GFI có thể đang yếu (preprint 2026).** → Không phụ thuộc label — lọc đa tín hiệu. (Chi tiết: file nghiên cứu §kiểm chứng.)
4. **Cạnh tranh tool global.** → Chiếm phân khúc VN + bản địa hoá + moat portfolio.

---

## 10. Quyết định chưa chốt (cần chủ dự án)

Xem `docs/03-decisions-handoff.md` — đặc biệt **mục tiêu dài hạn** (portfolio cá nhân vs startup vs công cụ cộng đồng) ảnh hưởng mọi quyết định phía sau.
