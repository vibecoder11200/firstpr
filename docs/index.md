# 📚 FirstPR — Documentation Index

> Bản đồ toàn bộ tài liệu FirstPR. Đọc theo thứ tự để hiểu hết dự án.

**Trạng thái:** Concept + Design. Chưa implement.
**Ngày cập nhật:** 2026-08-14

---

## Đọc theo thứ tự

| Bước | File | Trả lời câu hỏi |
|---|---|---|
| 1 | [`../README.md`](../README.md) | FirstPR là gì (bức tranh 1 trang) |
| 2 | [`01-vision.md`](01-vision.md) | **VÌ SAO** — vấn đề, giải pháp, timing, đối thủ, mục tiêu |
| 3 | [`02-research.md`](02-research.md) | **THỊ TRƯỜNG** + feasibility + kiểm chứng nguồn |
| 4 | [`03-design.md`](03-design.md) | **THIẾT KẾ** scoring model + portfolio |
| 5 | [`04-roadmap.md`](04-roadmap.md) | **LÀM GÌ** — roadmap 4 tuần + decision gates |
| 6 | [`05-business.md`](05-business.md) | **AI TRẢ TIỀN** — monetization (sau validate) |
| 7 | [`06-oss.md`](06-oss.md) | **VẬN HÀNH** — định vị C (OSS), rủi ro, sổ tay solo |
| 8 | [`07-decisions.md`](07-decisions.md) | **QUYẾT ĐỊNH** + câu hỏi mở + checklist bàn giao |
| 9 | [`08-marketing.md`](08-marketing.md) | **KỂ CHUYỆN** — nguyên liệu marketing + câu chuyện Minh✅/Ngọc❌ (bản EN: [`08-marketing-en.md`](08-marketing-en.md)) |
| 10 | [`09-techstack.md`](09-techstack.md) | **CHỐT KỸ THUẬT** — tech stack + feasibility sau brainstorm, input cho `ck:plan` |

---

## Mục đích từng file

- **`../README.md` / `../README_Vi.md`** — giới thiệu công khai, song ngữ (EN/VI).
- **`01-vision.md`** — bức tranh lớn: vấn đề, giải pháp, timing, persona, đối thủ, success metrics, scope.
- **`02-research.md`** — bằng chứng thị trường + kỹ thuật + kiểm chứng nguồn học thuật.
- **`03-design.md`** — chi tiết kỹ thuật scoring model + thiết kế portfolio.
- **`04-roadmap.md`** — kế hoạch build 4 tuần + decision gates (pivot/continue).
- **`05-business.md`** — 3 hướng doanh thu, buyer, unit economics, timing.
- **`06-oss.md`** — định vị công cụ cộng đồng VN (OSS): rủi ro solo + sổ tay vận hành.
- **`07-decisions.md`** — kho quyết định (đã chốt + rationale), câu hỏi mở, checklist bàn giao, glossary.
- **`08-marketing.md`** (VI) / **`08-marketing-en.md`** (EN) — nguyên liệu marketing: giải thích dễ hiểu + câu chuyện Minh✅/Ngọc❌ + bảng trước/sau + ideas kênh.
- **`09-techstack.md`** — bản chốt kỹ thuật: stack đã chọn (Fastify/Drizzle/Postgres/Redis/bullMQ/VPS), feasibility, risk + acceptance criterion C1. **Đọc trước khi viết plan.**

---

## Trạng thái quyết định chính

| Quyết định | Trạng thái |
|---|---|
| Scoring dựa hành vi (không label) | ✅ Chốt (D2) |
| Trọng số 30/20/15/35 | ✅ Chốt — **priors** (D3) |
| MVP 4 tuần + gates | ✅ Chốt (D4) |
| Bản địa hoá VN | ✅ Chốt (D5) |
| **Mục tiêu dài hạn → Công cụ cộng đồng VN (OSS)** | ✅ Chốt (D9) |
| **Public repo + MIT + dogfooding** | ✅ Chốt (D10) |

Xem đầy đủ: [`07-decisions.md`](07-decisions.md)