# 🌱 FirstPR

> Tìm open-source issue thật sự chất lượng cho **PR đầu tiên** của bạn — và xây portfolio xin việc từ đó.

**Trạng thái:** Khái niệm + thiết kế. Chưa implement.

🇻🇳 Tiếng Việt · **[English](README.md)**

> 📚 **Bắt đầu tại đây:** toàn bộ câu chuyện nằm trong [`docs/index.md`](docs/index.md) — đọc theo thứ tự để hiểu hết dự án.

---

## Giới thiệu

**FirstPR** giúp **developer junior** bước vào open source dễ dàng hơn:

- **Tìm issue thật sự chất lượng** — không phải "issue có label `good first issue`", mà là issue *có khả năng cao PR sẽ được merge & được maintainer hỗ trợ*, dựa trên scoring hành vi (maintainer responsiveness, repo health, freshness, độ rõ ràng).
- **Đi trọn hành trình** — từ roadmap học → checklist PR đầu → theo dõi outcome thật.
- **Portfolio tự động** — mỗi contribution trở thành một trang hồ sơ xin việc sống, share-able, phục vụ trực tiếp tuyển dụng.

---

## Điểm khác biệt

| Câu hỏi | Câu trả lời |
|---|---|
| **goodfirstissue.dev lọc bằng gì?** | Label `good first issue` |
| **Còn FirstPR thì sao?** | Lọc bằng **hành vi**: responsiveness + merge rate + freshness — §1.2–1.4 |
| **Họ dừng ở đâu?** | "Tìm issue" rồi hết |
| **FirstPR đi tiếp tới đâu?** | **Trọn hành trình tới portfolio xin việc** |
| **Độ tin cậy?** | **Trắng trợn từng tiêu chí + confidence score** |
| **Có tự cải thiện không?** | Vòng phản hồi outcome → model **tự tốt lên theo thời gian** |

---

## Tài liệu

| File | Nội dung |
|---|---|
| [`nghien-cuu-open-source-contribution-finder.md`](nghien-cuu-open-source-contribution-finder.md) | Nghiên cứu thị trường + tính khả thi + kiểm chứng nguồn |
| [`thiet-ke-scoring-va-portfolio-open-source-contribution-finder.md`](thiet-ke-scoring-va-portfolio-open-source-contribution-finder.md) | Thiết kế scoring model + portfolio |
| [`roadmap-mvp-open-source-contribution-finder.md`](roadmap-mvp-open-source-contribution-finder.md) | Roadmap build MVP tuần 1–4 |
| [`docs/01-vision-strategy.md`](docs/01-vision-strategy.md) | Tầm nhìn, vấn đề, timing, persona, đối thủ, metrics, phạm vi |
| [`docs/02-business-model.md`](docs/02-business-model.md) | Kiếm tiền — ai trả, khi nào, ra sao |
| [`docs/03-decisions-handoff.md`](docs/03-decisions-handoff.md) | Kho quyết định + câu hỏi mở + checklist bàn giao |

---

## Scoring Model (tóm tắt)

```
Score (0-100) = 30%·MaintainerResponsiveness + 20%·RepoHealth + 15%·IssueFreshness + 35%·IssueClarity
```

- **IssueClarity 35%** — junior hiểu được việc là yếu tố quyết định (FSE 2020: issue mơ hồ là lý do fail #1).
- **MaintainerResponsiveness 30%** — có người giúp thì PR mới thành (ICSE 2023: ~70% GFI có expert, phản hồi ~8.5h).
- **RepoHealth 20%** — repo sống (hard filter: archived/không push > 90 ngày → loại).
- **IssueFreshness 15%** — issue tươi (hard filter: mở > 180 ngày → loại).

Chi tiết đầy đủ: [`thiet-ke-scoring-va-portfolio-open-source-contribution-finder.md`](thiet-ke-scoring-va-portfolio-open-source-contribution-finder.md)

---

## Roadmap MVP (tóm tắt)

| Tuần | Mục tiêu |
|---|---|
| **1** | Nền tảng + crawl ~1.000 issues + scoring v1 + hiển thị thô |
| **2** | Calibrate score + breakdown per-criterion + cache |
| **3** | Mời 5–10 user thật + đo funnel + quyết định pivot/continue |
| **4** | Portfolio v1 + OG image + badge |

Chi tiết + decision gates: [`roadmap-mvp-open-source-contribution-finder.md`](roadmap-mvp-open-source-contribution-finder.md)

---

## Nghiên cứu nền tảng

| Nguồn | Phát hiện |
|---|---|
| [FSE 2020](https://doi.org/10.1145/3368089.3409746) | Label `good first issue` **không đảm bảo** thành công — 9.368 GFI / 816 repos |
| [ICSE 2023](https://arxiv.org/abs/2302.05058) | ~70% GFI có expert tham gia, phản hồi ~8.5h; **expert giúp merge nhưng giảm retention** |
| [GitHub Docs](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) | Rate limit: unauth 60/h, auth 5.000/h, GitHub App tới 12.500/h |

---

## Disclaimer

Đây là tài liệu thiết kế giai đoạn khái niệm. Trọng số scoring là **priors** (giả định từ nghiên cứu) — trọng số thật phải học từ vòng phản hồi outcome khi có dữ liệu thực. Chưa phải sản phẩm hoạt động.
