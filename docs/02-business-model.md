# FirstPR — Business Model & Monetization

> File này trả lời câu "AI TRẢ TIỀN, TRẢ BẰNG GÌ, KHI NÀO". **Chưa áp dụng ở MVP** — đây là bức tranh cho giai đoạn sau khi đã validate (có người thật làm PR đầu). Đừng build tính năng kiếm tiền trước khi validate xong.

**Ngày:** 2026-08-13
**Trạng thái:** Ý tưởng chiến lược. Chưa áp dụng.
**Bạn đọc:** Chủ dự án, người bàn giao, nhà đầu tư/đối tác tiềm năng.

---

## 1. Nguyên tắc chung

- **Free-first:** user junior (người dùng chính) KHÔNG trả tiền. Họ là sản phẩm / kênh viral / nguồn dữ liệu.
- **Người trả tiền là bên mua khác** — người cần junior developer.
- **Monetize SAU khi validate** (có ≥1 user làm PR đầu, có retention). Không trước.

---

## 2. Ba hướng doanh thu (xếp theo mức ưu tiên)

### Hướng A — B2B Recruit-Export (ưu tiên cao nhất)

**Bán cho:** công ty tuyển junior VN.

**Sản phẩm:** "Recruit-export" — trả phí để:
- Xuất danh sách dev VN đã hoàn thành PR đầu (đã chứng minh kỹ năng thật = **đã lọc CV rác**).
- Xem portfolio xin việc của từng ứng viên tiềm năng.
- Kết nối trực tiếp (puzzle tuyển dụng).

**Vì sao mạnh:** junior VN là mục tiêu tuyển dụng lớn; "chứng minh được làm PR thật" là tín hiệu **đắt giá** cho HR (lọc bớt rác, tiết kiệm thời gian). Mỗi portfolio = lead chất lượng.

**Mô hình giá (gợi ý):** phí tháng/ứng viên, hoặc gói tuyển dụng. (Chưa chốt — cần chủ dự án quyết.)

### Hướng B — Cộng đồng & Sponsor (ưu tiên vừa)

**Bán cho:** cộng đồng dev VN, nhà tài trợ, công ty muốn branding nhà tuyển dụng.

**Sản phẩm:**
- Sponsorship banner từ công ty tuyển dụng trên trang chủ / newsletter.
- Partnerships với VFOSSA, cộng đồng dev groups.
- Có thể trở thành công cụ community / phi lợi nhuận nếu chọn hướng đó.

**Vì sao:** chi phí thấp, tăng trust, phù hợp nếu định hướng cộng đồng.

### Hướng C — Marketplace Issue Mentor (ưu tiên thấp, xa)

**Bán cho:** junior VN muốn được mentor 1-1.

**Sản phẩm:** marketplace nối junior ↔ senior VN để mentor qua từng issue. FirstPR ăn phần trăm.

**Vì sao xếp cuối:** đòi hỏi hạ tầng cộng đồng lớn, chất lượng mentor khó đảm bảo, rủi ro cao — chỉ khi đã có lượng user đủ lớn.

---

## 3. Ai là "buyer" thật (chi tiết)

| Hướng | Buyer | Cơn đau của họ | Sản phẩm họ mua |
|---|---|---|---|
| A | Công ty tuyển junior VN | CV rác, không biết ứng viên có kỹ năng thật | Danh sách dev đã chứng minh PR + portfolio |
| B | Sponsor / brand tuyển dụng | Muốn tuyển, muốn visibility trong cộng đồng dev | Banner, newsletter, partnership |
| C | Junior VN (trực tiếp) | Không có mentor, không biết bắt đầu | Session mentor 1-1 qua issue |

---

## 4. Unit Economics (sơ bộ — đừng tin quá kỹ ở giai đoạn này)

| Chi phí (gần như bằng 0) | Chi phí khi scale |
|---|---|
| VM nhỏ ~ $0–10/tháng | GitHub API rate limit (từng rẻ, cần cache/schedule) |
| GitHub App miễn phí | Nếu lớn: thêm DB, CDN, support |

**Bản chất:** dự án này **rẻ về chi phí, đắt về dữ liệu + cộng đồng.** Lợi thế là vòng phản hồi outcome + mạng lưới — không phải hạ tầng.

---

## 5. Thời điểm monetize

| Giai đoạn | Monetize? |
|---|---|
| Tuần 1–4 (MVP validate) | **KHÔNG** — đo hành vi, không tính tiền |
| Sau validate (có retention) | Thử B (sponsor) trước — nhẹ, không phá trải nghiệm |
| Có 50+ user active | Thử A (recruit-export) — đây là tiềm năng lớn nhất |
| Có cộng đồng lớn | Cân nhắc C (marketplace mentor) |

---

## 6. Rủi ro mô hình

1. **Bán dữ liệu user → phá niềm tin.** → Minh bạch, user opt-in, trọng tâm là "khoe portfolio" (user muốn) chứ không phải "bán dữ liệu" (user sợ).
2. **Recruit-export làm user cảm thấy bị "quản lý".** → Định vị là "cầu nối cơ hội", user kiểm soát portfolio của mình.
3. **Cạnh tranh từ nền tảng tuyển dụng lớn.** → Bám vào góc hẹp: "dev đã chứng minh bằng PR thật" — khác biệt hoá rõ.

---

## 7. Quyết định cần chủ dự án

- Chọn **định hướng dài hạn** (quan trọng nhất): startup kiếm tiền / công cụ cộng đồng phi lợi nhuận / dự án portfolio cá nhân → thay đổi toàn bộ phần này.
- Chốt mô hình giá cụ thể cho Hướng A/B (khi đến giai đoạn monetize).
