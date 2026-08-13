# MVP + Roadmap Build (Tuần 1–4)
## Open Source Contribution Finder cho junior Việt Nam

> **Ngày:** 2026-08-13
> **Trạng thái:** Kế hoạch build. Cơ sở: `02-research.md` (research) + `03-design.md` (design).
> **Triết lý MVP:** ship một cái gì đó **một junior thật sự dùng được trong tuần 1**, đo lường hành vi, rồi mới mở rộng. Không build full 3 tháng rồi mới hỏi ai cần.

---

## 1. Mục tiêu MVP (định nghĩa rõ — không mơ hồ)

**Câu hỏi validate trung tâm:** "Một junior VN có dùng tool này để tìm + hoàn thành 1 PR đầu tiên trong 2 tuần không?"

**3 điều phải đạt ở cuối tuần 4:**
1. ≥ 10 người dùng thật (bạn bè/cộng đồng dev VN) **tìm được issue + làm được ít nhất 1 contribution**.
2. Có **dữ liệu outcome thật** (PR merged/không merged) để calibrate score.
3. Biết được **người dùng bỏ ở đâu** (funnel: tìm issue → chọn → làm → merge).

**KHÔNG trong MVP:** VN-specific full, gamification, recruit-export, vòng phản hồi tuning (vào V2). Không đốt thời gian vào thứ chưa validate.

---

## 2. Kiến trúc tổng (nhỏ gọn, có chủ đích)

```
┌─────────────┐   ┌──────────────────────┐   ┌─────────────────────┐
│   Frontend   │──▶│   API (Node/TS)       │──▶│  Crawler nền         │
│  static SPA  │   │  /api/issues          │   │  (GitHub App token)  │
│  (Vite/React)│   │  /api/repos           │   │  12.500 req/h        │
└─────────────┘   │  /api/auth            │   └──────────┬──────────┘
                  └─────────┬────────────┘              │
                            │  cache                    │
                     ┌──────▼───────┐            ┌──────▼───────┐
                     │   Postgres   │            │   GitHub     │
                     │ (issues,repos│            │   API        │
                     │  scores)     │            │              │
                     └──────────────┘            └──────────────┘
```

- **Frontend:** static SPA, không cần SSR. Trang chủ = danh sách issue có score + bộ lọc ngôn ngữ.
- **API:** Node/TS, REST đơn giản. Auth: GitHub OAuth (user đăng nhập → lấy token → tự crawl cho riêng user).
- **Crawler nền:** GitHub App token (12.500 req/h), refresh repo-level daily + issue-level T+2h.
- **DB:** Postgres (issues, repos, scores, users, contributions).
- **Deploy:** một VM/Docker nhỏ. Không cloud phức tạp.

---

## 3. Roadmap tuần 1–4 (chi tiết, có deliverable mỗi ngày cuối tuần)

### Tuần 1 — Nền tảng + crawl + hiển thị thô

**Mục tiêu:** tìm issue được, hiển thị được, có dữ liệu thật.

| Ngày | Công việc | Deliverable |
|---|---|---|
| 1 | Setup repo, Docker, Postgres schema (issues, repos) | Schema chạy được |
| 2 | GitHub App + OAuth + token manager | Auth flow chạy được |
| 3 | **Crawler v1:** Search API `label:"good first issue"` + `language:Python/JS/TS`, lưu raw issues | Crawl ~1.000 issues đầu tiên |
| 4 | **Scoring v1 (heuristic):** tính 4 nhóm (responsiveness/repo-health/freshness/clarity) theo design file | Có score cho mỗi issue |
| 5 | **API + Frontend tối thiểu:** danh sách issue sắp theo score, filter ngôn ngữ | Trang chủ chạy được, có dữ liệu |
| 6 | **Test nội bộ:** tự thử làm 1 issue, sửa bug | 1 contribution nội bộ |
| 7 | Buffer + retro tuần 1 | — |

**Kết quả tuần 1:** một trang liệt kê ~1.000 issues có score, lọc được theo ngôn ngữ, đủ để người thật thấy.

### Tuần 2 — Scoring sắc + hiển thị breakdown + cache tốt

**Mục tiêu:** score đáng tin + người dùng hiểu vì sao.

| Ngày | Công việc | Deliverable |
|---|---|---|
| 1 | **Calibrate scoring:** lấy 20 issues, tự đánh giá thủ công, so với score model, chỉnh threshold/weight | Score khớp phán đoán thủ công ≥ 80% |
| 2 | **Breakdown per-criterion UI:** hiện 4 điểm thành phần + confidence | Người dùng hiểu vì sao issue được điểm này |
| 3 | **Anti-gaming filter:** loại PR, issue đóng, archived repo, body rỗng | Kết quả sạch hơn |
| 4 | **Cache tầng 2:** repo-level snapshot, giảm query trực tiếp | Load nhanh, không tốn rate |
| 5 | **Hard filter validation:** kiểm 180d age filter + no-assignee có thực sự giúp chất lượng | Số liệu trước/sau filter |
| 6 | Buffer | — |
| 7 | Retro + chuẩn bị cho 5 người dùng đầu | — |

**Kết quả tuần 2:** score đáng tin, có breakdown giải thích, cache ổn định — **sẵn sàng cho người dùng thật**.

### Tuần 3 — Mời 5–10 người dùng thật + đo funnel

**Mục tiêu:** validate trung tâm — người dùng có tìm + làm PR đầu không.

| Ngày | Công việc | Deliverable |
|---|---|---|
| 1 | **Recruit:** 5–10 dev junior (bạn bè/cộng đồng VN), hướng dẫn dùng | 5–10 user thật |
| 2 | **Track funnel:** Google Analytics / PostHog — tìm issue → click → xem chi tiết → (github) | Funnel data |
| 3 | **Onboarding v1:** checklist "làm PR đầu" ngắn gọn (5 bước) | User không lạc |
| 4 | **Feedback thu thập:** hỏi user: vì sao chọn/không chọn issue, chỗ nào bỏ | 5+ phản hồi định tính |
| 5 | **Outcome tracking v1:** detect PR merged từ user's GitHub | Biết user nào thành công |
| 6 | Fix bug + điều chỉnh nhỏ từ feedback | — |
| 7 | **Weekly sync:** đo funnel, quyết định pivot/continue | Quyết định rõ ràng |

**Kết quả tuần 3:** biết chính xác người dùng bỏ ở đâu + user nào làm được PR đầu. **Đây là lúc quyết định pivot/continue.**

### Tuần 4 — Portfolio v1 + 1 tính năng "a-ha"

**Mục tiêu:** biến tool-1-lần thành nơi quay lại + có 1 thứ khiến user "wow".

| Ngày | Công việc | Deliverable |
|---|---|---|
| 1 | **Portfolio v1:** trang đơn giản từ username GitHub: hero + project cards + timeline | User có URL gửi được |
| 2 | **OG image tự sinh:** cover cho FB/Telegram/Zalo khi share portfolio | Share đẹp, viral được |
| 3 | **Badge cơ bản:** chỉ cấp khi có merged PR thật | Gamification có thật |
| 4 | **Auto-update portfolio:** contribution mới tự thêm | Lý do quay lại |
| 5 | **Test portfolio + fix** | — |
| 6 | **Demo cho 10 user ban đầu** + thu thập ấn tượng | Feedback cuối tuần 4 |
| 7 | Retro tổng + quyết định V2 | — |

**Kết quả tuần 4:** tool + portfolio hoạt động; biết được người dùng có quay lại không, có share không.

---

## 4. Decision gates (điểm quyết định — quan trọng nhất)

| Gate | Khi nào | Quyết định |
|---|---|---|
| **G1 (cuối tuần 2)** | Score khớp phán đoán thủ công? | Không khớp → đừng mở rộng, đào lại scoring trước |
| **G2 (cuối tuần 3)** | ≥ 1 user làm được PR đầu? | Không ai → **PIVOT** (đổi wedge/hướng tiếp cận) |
| **G3 (cuối tuần 4)** | User quay lại + share portfolio? | Không → portfolio cần sửa; có → V2 |

**Triết lý gate:** nếu tuần 3 không ai làm được PR đầu, đừng tiếp tục build thêm — dữ liệu đang nói sản phẩm chưa đúng. Nghiên cứu đã đủ rồi; lúc này quyết định phải bằng hành vi người dùng thật, không phải bằng phân tích tiếp.

---

## 5. Nguồn lực cần thiết

- **Kỹ thuật:** 1 người (bạn). Node/TS + Postgres + Vite/React + GitHub App setup.
- **Chi phí:** ~ $0–10/tháng (VM nhỏ + GitHub App miễn phí). Dùng free tier càng nhiều càng tốt.
- **Rate limit:** GitHub App token 12.500 req/h là đủ cho ~2.000–5.000 repos (đã tính ở design file).

---

## 6. Rủi ro + giảm thiểu

| Rủi ro | Giảm thiểu |
|---|---|
| Không tìm đủ issue chất lượng (trend label yếu) | Không phụ thuộc label GFI — lọc đa tín hiệu (design §1.2–1.5) |
| Rate limit bóp nghẹt crawl | Cache + scheduled crawl + GitHub App token (design §1.7) |
| Người dùng bỏ sau 1 lần (retention) | Portfolio + auto-update là lý do quay lại (Phần 2) |
| Scoring chưa đúng (đoán sai) | Gate G1: calibrate thủ công tuần 2 trước khi mở rộng |
| Không ai làm PR đầu | Gate G2: pivot sớm, đừng ném thêm thời gian |

---

## 7. Sau MVP (V2 — làm moat tích lũy, KHÔNG trong MVP)

1. **Vòng phản hồi outcome:** detect PR merged → tuning weights theo dữ liệu thật (design §1.8) — moat không sao chép được.
2. **VN-specific full:** checklist PR đầu tiếng Việt, VFOSSA partnership, recruit-export, puzzle tuyển dụng.
3. **Mở rộng ngôn ngữ:** từ Python/JS/TS → Go, Rust, Java.
4. **Monetization:** B2B (công ty tuyển junior), sponsor từ cộng đồng dev, marketplace issue mentor.
