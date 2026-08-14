# FirstPR — Tech Stack & Feasibility Summary

> File này là **bản chốt kỹ thuật** sau buổi brainstorm: các quyết định về tech stack, lý do lựa chọn, và đánh giá tính khả thi trước khi viết `ck:plan`. Đọc sau `03-design.md` (scoring) và `04-roadmap.md` (build).

**Ngày:** 2026-08-14
**Trạng thái:** Quyết định chốt (brainstorm) — phục vụ viết plan.
**Bạn đọc:** Chủ dự án, người lập plan, người kế nhiệm.

---

## 1. Tóm tắt quyết định

| Lớp | Chọn | Lý do ngắn |
|---|---|---|
| **API** | **Fastify** | Nhẹ, TS-native, schema validation built-in. Hợp REST indie. |
| **Data layer** | **Drizzle ORM** | TS-first, nhẹ, migration dễ; cân bằng giữa raw SQL và Prisma nặng. |
| **Database** | **Postgres** | Cache chính (§1.7 design): issues, repos, scores, users, contributions. |
| **Frontend** | **Vite + React SPA** | Không cần SSR; trang chủ = danh sách issue + filter ngôn ngữ. |
| **Auth** | **GitHub OAuth** | User login → token → crawl riêng cho user. |
| **Crawler nền** | **Worker tách riêng + Redis/bullMQ** | Queue riêng cho crawl, retry rõ, scale được. Redis = scheduling/locks. |
| **OG image** | **@vercel/og (Satori + React)** | Sinh ảnh server-side nhẹ, không cần Puppeteer headless. |
| **Analytics** | **PostHog cloud (free tier)** | Event + funnel tracking đúng nhu cầu tuần 3. |
| **i18n** | **i18next + react-i18next** | Catalog en/vi là nguồn chân lý (đúng CLAUDE.md). |
| **Testing** | **Vitest** | Nhẹ, TS-native. |
| **Deploy** | **1 VPS + Docker + Caddy** | Kiểm soát tuyệt đối, chi phí ~$0–10/tháng, hợp OSS solo; tự lo backup/security/reverse-proxy. |
| **Auth nâng cao** | — (không chốt ở MVP) | Xem Open Questions §6. |

---

## 2. Chi tiết từng lớp + lý do (tech decision log)

| Lớp | Chọn | Vì sao KHÔNG chọn cái khác |
|---|---|---|
| **API framework** | Fastify | NestJS phình cho nhiệm vụ này; Express ít type-safety. Fastify có validation + TS sẵn. |
| **Data layer** | Drizzle ORM | Prisma nặng hơn, migration phức tạp hơn cho solo. Raw SQL thiếu type-safety hơn Drizzle. |
| **Auth** | **Better Auth** | **Lucia v3 đã deprecated từ 2025-03** (chính chủ ghi trên trang chủ) → không dùng. Better Auth đang là người kế nhiệm tích cực: framework-agnostic, có `@better-auth/drizzle-adapter`, GitHub OAuth sẵn, session quản lý mặc định (expiresIn/updateAge/refresh) — ít code auth thủ công hơn Lucia v2. Có thể cân nhắc **arctic + tự viết session** nếu muốn tối thiểu dependency (nhưng thêm code bảo trì). |
| **Worker** | Redis/bullMQ (queue riêng) | Chọn tách worker ngay từ đầu — bỏ single-process scheduler. **Lưu ý khả thi bên dưới.** |
| **Deploy** | VPS + Docker + Caddy | Managed (Railway/Fly) dễ hơn nhưng phụ thuộc nền tảng; Render free tier sleep khi idle — hại job nền. Caddy = auto-HTTPS + reverse-proxy, rẻ và quen. |
| **OG image** | @vercel/og | Puppeteer nặng, phình. Satori render PNG/JPEG server-side trực tiếp. |
| **Analytics** | PostHog cloud | GA4 funnel dựng thủ công, consent nặng. PostHog free đến 1M events/tháng, đúng scale. |

### 2.1 Alternatives đã xem xét (brainstorm mở rộng)

| Lớp | Option đã đánh giá | Verdict |
|---|---|---|
| **Auth** | Lucia (v2/v3) | ❌ **Deprecated 2025-03** (chính chủ công bố). Đừng dùng. |
| **Auth** | Better Auth | ✅ Chọn (người kế nhiệm Lucia, active, có Drizzle adapter). |
| **Auth** | Arctic + tự viết session | 🟡 OK nhưng thêm code bảo trì; chỉ hợp nếu muốn tối thiểu dependency. |
| **Worker/queue** | Redis + bullMQ | ✅ Chọn. |
| **Worker/queue** | **pg-boss (qua pg-bossman)** | 🟡 **Chạy job trên chính Postgres** — bỏ Redis. Khả thi: scheduling cron + retry + batch + singleton (dedup job trùng). Giảm 1 service, hợp OSS solo. Nhược: công việc nặng throughput thì Postgres kém Redis; lock không linh hoạt. Nếu chọn → **đổi quyết định D11**: bỏ Redis. |
| **Worker/queue** | GitHub Actions cron | ❌ Giới hạn runtime, dây trễ — không phù hợp crawl nền liên tục. |
| **Deploy** | VPS + Docker + Caddy | ✅ Chọn. |
| **Deploy** | **Coolify (self-hosted PaaS trên VPS)** | 🟡 **Cân nhắc thêm.** Deploy bằng UI (link Git, auto-deploy, zero-downtime), quản lý Postgres/Redis/Docker, có backups tự động. Hợp solo OSS "set-and-forget". Nhược: thêm 1 layer quản lý học thêm (nhưng ít hơn tự xử lý Caddy + systemd + backup thủ công). Có thể thay cho cặp Docker+Caddy. |
| **Deploy** | Railway / Fly (managed) | 🟡 Dễ nhưng phụ thuộc nền tảng + chi phí khi scale. |
| **Deploy** | Render free | ❌ Sleep khi idle — hại job nền. |
| **OG image** | Puppeteer headless | ❌ Nặng, phình. |

---

## 3. Workers: cách phối hợp Postgres + Redis (chống vỡ thiết kế)

> Mục đích: giữ đúng thiết kế cache (§1.7) + triết lý OSS chi phí thấp, nhưng vẫn có queue riêng cho crawl.

**Nguyên tắc lưu trữ:**

| Dữ liệu | Lưu ở đâu | Lý do |
|---|---|---|
| `issues`, `repos`, `scores`, `users`, `contributions` | **Postgres** (bảng chính) | Cache chính của app; user load luôn từ cache. |
| `Queue + job logs` | **Redis** | Scheduling + lock + retry nhanh — bullMQ cần nó. |
| Metric thô của repo (trước khi tính score) | **Redis** | Chỉ số liệu tạm, không phải nguồn chân lý. |

**Flow crawl:**
```
Crawler: Search API (30 req/min) → lưu raw issues → Postgres
         → đẩy repo-id vào Redis queue (để tính metric responsiveness/repo health)
Worker (bullMQ): nhận job → tính metric → ghi vào Postgres → sẵn sàng cho scoring
Scoring: chạy trên dữ liệu Postgres (heuristic + hard filter)
```

**Vì sao không được trộn:** if worker ping trực tiếp GitHub cho từng issue mỗi khi user load, thì vỡ rate limit (mâu thuẫn design §1.7). Job queue chỉ nên xử lý `repo-id` + `issue-id`, không phải query sống.

---

## 4. Đánh giá tính khả thi (cập nhật từ 02-research)

| Chiều | Verdict | Số liệu / bằng chứng |
|---|---|---|
| **Kỹ thuật** | ✅ | Search API 30 req/min, cap 1.000/query → tách query theo language/date/label + cache + scheduled crawl. GitHub App token 12.500 req/h đủ cho ~2–5k repos active. |
| **Scoring** | ⚠️ **Phần khó nhất** | Responsiveness **đo được** (ICSE 2023: ½ GFI phản hồi trong 8.5h), nhưng priors (30/20/15/35) **chưa phải sự thật** → bắt buộc G1 calibrate (tuần 2). |
| **Thị trường VN** | ✅ Cửa thật | Gitista hạng 7 toàn cầu (VN); chưa ai làm scoring chất lượng + bản địa hoá VN; VFOSSA làm kênh. |
| **Solo vận hành** | 🟡 Rủi ro biết trước | `06-oss.md` §2 (R1–R5) có biện pháp từng cái; BẮT BUỘC chống phình (§3). |
| **Chi phí vận hành** | 🟡 Cần giám sát | Rate limit + phạm vi caching quyết định chi phí hằng ngày. Thiết kế cache tệ → con số 2–5k repos / 12.500 req/h vỡ → phải là acceptance criterion sớm. |

**Một rủi ro chưa ai ghi — phải đưa vào plan:**
- **Cache-vs-cost:** mỗi metric trong scoring (median_first_response, merge_rate_90d, repo health) cần đọc lịch sử issues/PR → **càng nhiều repo càng tốn rate limit**. → **Phải đo từ data thật (mini-scan) trước khi cam kết con số vb repos-tháng với worker.** Đây là acceptance criterion C1 bên dưới.

---

## 5. Risk & Mitigation (techstack-level)

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| **Cache tệ → cháy rate limit** (worker + scoring đọc sống) | 🔴 | Postgres làm nguồn duy nhất cho user load; worker chỉ xử lý id; cache-aware retry; đo C1 sớm. |
| **Worker + Redis phình ops cho solo** | 🟡 | Cân nhắc **pg-boss/pg-bossman trên Postgres** (bỏ Redis) nếu Ops > benefit (§2.1). Giữ job types tối thiểu; lịch bảo trì `06-oss.md` §4.2. |
| **Auth dependency deprecated** (Lucia) | 🟡 | Đã né — chọn Better Auth hoạt động, có Drizzle adapter. Kiểm tra ngày publish gói khi cài (tránh dính dependency chết). |
| **OG image render edge** | 🟡 | Cần test font (tiếng Việt dấu) + fallback khi render lỗi ở VPS. |
| **PostHog data chứa PII** (GitHub username) | 🟡 | Track event không kèm PII; pseudonymize nếu cần; GD PR + OSS tự dùng. |

---

## 6. Open Questions (cần chốt trước/trong plan)

| # | Câu hỏi | Ảnh hưởng tới | Độ khẩn |
|---|---|---|---|
| Q1 | **Backend i18n/authorization framework** (nơi chứa `users`, `sessions`) | Kiến trúc, security | 🟡 Trong plan |
| Q2 | **Auth session strategy** (GitHub OAuth → cookie vs JWT; secure session storage) | Security | 🔴 Trong plan |
| Q3 | **Phạm vi ngôn ngữ ban đầu** (03 §câu hỏi 4, đang = Python/JS/TS) | Crawler + scoring | 🟡 Trước khi crawl tuần 3 |
| Q4 | **PostHog KÀ công cụ event-tracking khác** — đã chọn PostHog, cần tick dữ liệu tuần 3 | Measurement | 🟡 Khi tới tuần 3 |
| Q5 | **Redis trả phí hay local** (nếu deploy 1 VPS, Redis local = Docker service — rẻ) | Chi phí, simplicidad | 🟢 Khi setup Docker |

---

## 7. Next steps (sau brainstorm)

1. **Đọc lại toàn bộ docs theo index** trước khi viết plan (bước bắt buộc của CLAUDE.md).
2. **Chốt Open Questions** Q1–Q2 (kiến trúc auth), Q3 (ngôn ngữ đầu) trong phiên plan tiếp theo.
3. **Viết `ck:plan`** — với summary này làm input, chạy theo 4 tuần + decision gates G1/G2/G3 trong `04-roadmap.md`.
4. **Acceptance criterion C1 (rate-limit/cache):** đưa thành mục trong plan — đo khả năng cache trước khi cam kết con số repos-tháng.

---

*Không ai dùng FirstPR được nếu vỡ rate limit giữa đêm. Cache đúng = MVP sống sót.*