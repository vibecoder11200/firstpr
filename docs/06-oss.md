# FirstPR — OSS Maintenance & Solo-Operation Playbook

> File này ghi **quyết định định vị (Community Tool)** + **rủi ro của OSS 1 tác giả** + **cách vận hành solo bền vững**. Là "sổ tay bảo trì" cho chủ dự án và người kế nhiệm.

**Ngày:** 2026-08-13
**Trạng thái:** Repo đã public (MIT). Core code chưa build.
**Bạn đọc:** Chủ dự án, người kế nhiệm, contributor.

---

## 1. Định vị đã chốt: C — Công cụ cộng đồng VN (OSS)

| | Chọn | Lý do |
|---|---|---|
| **A — Portfolio cá nhân** (học + demo + CV) | ❌ Gộp vào C | Portfolio không phải thứ "chia sẻ, cùng đóng góp" — đúng khát vọng của chủ dự án |
| **B — Startup / kiếm tiền** | ❌ Trì hoãn | Chưa validate; tính tiền trước khi có người dùng là sai thứ tự |
| **C — Công cụ cộng đồng VN, mở nguồn** | ✅ **CHỌN** | Đúng động lực "cùng dùng, cùng đóng góp"; VFOSSA + cộng đồng dev VN sẵn làm kênh; chi phí bắt đầu = 0 |

**Bản chất lựa chọn:** public + MIT + repo chính là "con cưng" của sản phẩm. C là định vị chính; A (portfolio) tự có từ việc build-in-public; B (monetize) để sau validate — không làm trước.

**Hệ quả khác biệt:**
- Repo **public ngay** (đã làm 2026-08-13), không giấu tới khi "hoàn hảo".
- **Self-dogfooding** là chiêu marketing chính: repo tự gắn `good first issue` để tuyển contributor = chứng minh sản phẩm ngay trong sản phẩm. Không đối thủ nào dùng được vì họ đã lớn.
- VFOSSA/cộng đồng là **kênh phát hành sớm**, không phải điều kiện để bắt đầu.

---

## 2. Rủi ro OSS 1 tác giả (phải đọc, không tô hồng)

> Những rủi ro này là lý do đa số OSS solo chết. Biết trước → có biện pháp, không phải bi quan.

| # | Rủi ro | Mức | Biện pháp |
|---|---|---|---|
| R1 | **Contributor KHÔNG tự đến.** Đa số OSS vận hành bởi 1–2 người; contributions đến theo kiểu "user gửi PR sửa cái họ cần", không phải "ai đó xin nhận bảo trì" | 🔴 | Đặt kỳ vọng đúng: public để **tự dùng + build-in-public làm CV**, mời contributor **sau khi** core chạy ổn |
| R2 | **Solo = on-call cả đời dự án.** 100 user = 100 "sếp". Không có đồng nghiệp chia gánh → triage + bugfix + security + câu trả lời trùng lặp | 🔴 | Lịch bảo trì tối thiểu (§4); issue template + docs để người tự trả lời; phạm vi chống phình (§3) |
| R3 | **Bus-factor = 1.** Bạn dừng → dự án chết âm thầm, và cái chết *thấy được* (repo đóng băng) | 🔴 | Docs bàn giao đầy đủ (chính file này + 03); nếu biến mất, người khác đọc docs tiếp tục được |
| R4 | **Mất "độc quyền" code** — ai cũng chép; fork ngon hơn mọc lên thì danh tiếng về họ | 🟡 | Moat là **vòng phản hồi outcome** (data + trọng số học được), không phải code. Chấp nhận mất code, giữ data/vòng học |
| R5 | **Vận hành bẩn**: issue spam, tiếng lạ, security bị "săn" | 🟡 | Label + template sẵn; repo nhỏ nên gánh nhẹ; xử lý khi xảy ra, không chủ động lo |

---

## 3. Nguyên tắc chống phình (chống chết vì phạm vi)

> Phạm vi phình = gánh nặng bảo trì tăng = nguồn gốc chính của solo burnout. Đây là lối sống, không phải quy tắc.

1. **Mỗi feature mới = thêm 1 gánh nặng.** Từ chối feature khi chưa tự dùng thấy cần. "No" là câu trả lời mặc định; "yes" cần lý do.
2. **Solo build → phạm vi theo nhu cầu của chủ dự án** (tự dùng ít nhất 6 tháng). Đừng build theo feature request của người ngoài.
3. **Đồng thuận tối thiểu cho MVP:** crawler + scoring v1 + trang kết quả. Portfolio/leaderboard là V2 — không ôm vào MVP.
4. **Từ chối feature bằng cách ghi vào `docs/03-decisions-handoff.md`** (thêm dòng "không làm, vì…") để không phải giải thích lặp.

---

## 4. Vận hành solo bền vững (sổ tay thực hành)

### 4.1 Ba điều kiện để solo OSS bền

| Điều kiện | Nội dung | Với FirstPR |
|---|---|---|
| **1. Bạn là user #1** | Động lực bảo trì phải từ việc *bạn tự dùng* hằng ngày, không từ "nghĩa vụ với người khác" | ✅ Tool giải bài toán **của bạn** (tìm issue chất lượng + portfolio xin việc) — nguồn năng lượng duy nhất đủ bền |
| **2. Phạm vi chống phình** | §3 | ⚠️ Phần khó nhất — phải tự kỷ luật |
| **3. Bảo trì tự động hoá** | CI, dependabot, issue template, docs contributor | ✅ Làm sớm, rẻ |

### 4.2 Lịch bảo trì tối thiểu

> Đều đặn quan trọng hơn to. Không cần mỗi ngày.

| Tần suất | Việc | Thời lượng |
|---|---|---|
| **Mỗi tuần** | Triage issues: phân loại, trả lời hoặc đóng. 1 commit nhỏ (bugfix/docs). | 1 giờ |
| **Mỗi 2 tuần** | Rà PR: merge/request changes kịp thời (phản hồi nhanh = lời hứa của sản phẩm) | 1 giờ |
| **Mỗi tháng** | Check dependabot + CI đỏ; đọc metrics (nếu có); cập nhật roadmap | 1–2 giờ |
| **Mỗi quý** | Review lại 5 kiến thức cốt lõi (§1 docs/03); xoá feature chết; đánh giá có nên public-đổi-hướng | nửa ngày |

### 4.3 Quy ước phản hồi (SLA tự đặt — chính là lời hứa sản phẩm)

- **PR hợp lệ:** phản hồi trong **7 ngày**. Người mới gửi PR đầu = khoảnh khắc then chốt, ưu tiên trả lời sớm.
- **Issue `good first issue`:** giữ cập nhật trạng thái; khi ai claim → ghi tên vào issue để tránh tranh chấp.
- **Issue spam/trùng:** đóng với template ngắn, không cần phức tạp.

### 4.4 Quy ước commit & PR (ghi trong CONTRIBUTING.md — nhắc lại ở đây)

- **Hook chặn attribution trailers** (`Co-Authored-By`, `Signed-off-by`, `Reviewed-by`, `Generated with`…) — không bao giờ thêm vào commit.
- **Conventional Commits:** `type(scope): summary` (feat/fix/docs/refactor/test/chore/perf/style).
- PR nhỏ, 1 issue = 1 branch = 1 PR; mô tả nêu issue đóng (`Closes #N`).

---

## 5. Trình tự "mở" đúng (đã làm — ghi để không lặp sai)

> Quyết định public sớm được chốt ở §1, nhưng trình tự vẫn đặt kỳ vọng đúng:

1. ✅ Đổi repo public (2026-08-13) + LICENSE MIT + CONTRIBUTING.md
2. ✅ Tạo labels `good first issue` + `help wanted` + 3 starter issues (docs/scope nhỏ)
3. ⏳ Build core (crawler + scoring v1) — **tự dùng cho chính mình trước**
4. ⏳ Khi core chạy ổn → contributor guide + chính repo là dogfood
5. ⏳ VFOSSA/cộng đồng = kênh phát hành, không phải điều kiện bắt đầu

**Cảnh báo:** public skeleton rỗng = mời người vào dọn nhà khi vừa đặt nền. Nếu core chưa build xong, đừng quảng bá repo.

---

## 6. Khi nào nên đánh giá lại quyết định

| Tín hiệu | Hành động |
|---|---|
| **Đẹp:** tự dùng tốt → 10–50 junior VN dùng → vài PR nhỏ | Tiếp tục C; cân nhắc VFOSSA + build-in-public mạnh hơn |
| **Trung bình:** tự dùng tốt, ít người ngoài | Vẫn là CV tuyệt + học nhiều. Không thua. Duy trì lịch §4.2 |
| **Xấu:** phạm vi phình / kiệt sức / bỏ giữa chừng | **Cắt scope trước khi bỏ.** Một repo nhỏ sạch còn sống > repo to đã chết. Ghi quyết định vào 03 |
| Có fork/bản chép ngon hơn | Không cạnh tranh chiến đấu; giữ vòng học outcome + cộng đồng VN |

---

## 7. Checklist tái khởi động (nếu dự án bị bỏ giữa chừng, quay lại)

- [ ] Đọc README + docs/index.md theo thứ tự.
- [ ] Chạy lịch §4.2 trong 1 tháng, không mở rộng phạm vi.
- [ ] Merge PR còn treo; đóng issue lỗi thời.
- [ ] Cập nhật trạng thái docs (`index.md`, `03-decisions-handoff.md`).
- [ ] Chỉ mở rộng tính năng khi 1 user (chính mình) dùng đều đặn 4 tuần.

---

## 8. Các quyết định phát sinh trong file này (cập nhật decision log)

| # | Ngày | Quyết định | Rationale | Thay đổi khi nào |
|---|---|---|---|---|
| D9 | 2026-08-13 | **Định vị: C — Công cụ cộng đồng VN (OSS, MIT, public)** | Khớp động lực "cùng dùng, cùng đóng góp"; A gộp vào C; B trì hoãn sau validate | Khi có người dùng thật + dữ liệu outcome → cân nhắc B |
| D10 | 2026-08-13 | **Public repo + LICENSE MIT + CONTRIBUTING + 3 starter issues (dogfooding)** | Self-dogfooding = marketing không đối thủ nào dùng được; public để tự dùng + CV | Không — nền tảng ổn định |

**Bổ sung vào `docs/03-decisions-handoff.md`:** thay D6 (private) bằng D9/D10; đóng Q1 và Q4.
