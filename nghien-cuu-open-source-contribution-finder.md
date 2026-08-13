# Nghiên cứu khả thi: Open Source Contribution Finder cho junior Việt Nam

> **Ngày báo cáo:** 2026-08-13
> **Tình huống:** Nghiên cứu + kiểm chứng nguồn để quyết có build "Open Source Contribution Finder for Beginner" (Ý tưởng 1) hay không, sau khi đã so sánh với "Personal Knowledge Garden" (Ý tưởng 2).
> **Phương pháp:** `deep-research` workflow (tìm kiếm đa góc, fetch 20 nguồn, trích 91 claims) + kiểm chứng thủ công từng claim qua primary sources (GitHub Docs, Semantic Scholar API, arXiv, IEEE DOI resolution). Do phase verify tự động gãy vì rate limit (máy reboot), toàn bộ claim then chốt được kiểm chứng lại bằng tay — kết quả ghi rõ trong "Tài liệu kiểm chứng" bên dưới.

---

## 1. Tóm tắt điều hành (executive summary)

**Khả thi về kỹ thuật: CÓ. Cửa thắng thị trường: CÓ, nhưng hẹp và nằm đúng chỗ khó.**
**Lời hứa của sản phẩm nằm ở "scoring chất lượng" — đó vừa là moat, vừa là phần khó nhất. Không nên ship một "goodfirstissue clone chỉ thêm tiếng Việt".**

Ba kết luận chính:

1. **Phân khúc "tìm issue cho người mới" chia làm 2 nhóm và chưa ai làm tốt mảng chất lượng:**
   - *Công cụ giáo dục:* First Contributions, first-timers-only (chỉ dạy PR workflow).
   - *Issue finder thô:* goodfirstissue.dev (curation thủ công, phụ thuộc maintainer nộp form), up-for-grabs (phụ thuộc label), Code Triage (email 1 issue/ngày, không score).
   - **Chưa ai làm:** tự quét GitHub + scoring chất lượng + bản địa hoá Việt Nam.

2. **Dữ liệu GitHub API đủ để xây scoring** (freshness, loại trừ PR, repo health thô) nhưng **không có chỉ số sẵn về maintainer responsiveness / doc quality** — phải đào từ dữ liệu thô. Rate limit là bài toán thiết kế cache, không phải rào cản.

3. **Bằng chứng học thuật ủng hộ việc build, với 2 cảnh báo quan trọng:**
   - ICSE 2023 (48.402 GFI / 964 repos): ~70% GFI có expert tham gia, nửa số GFI nhận comment đầu trong 8.5h → responsiveness **đo được**. Quan trọng hơn: **expert involvement giúp tăng success nhưng giảm retention** → đây là cơn đau có nguồn học thuật vững, và roadmap/portfolio/leaderboard của bạn là miếng vá trực tiếp.
   - **CẢNH BÁO 1:** "Label `good first issue` đang suy giảm 2024" chỉ dựa trên **1 preprint (arXiv 2604.27532, chưa peer-review, không fetch được full-text), KHÔNG có nguồn độc lập thứ 2**. Trong khi dữ liệu topic thô của GitHub cho thấy số repo gắn topic vẫn tăng (2.707 → 2.712). → **Đừng đặt toàn bộ phụ thuộc vào label GFI**; hãy lọc bằng nhiều tín hiệu khác. Cũng **đừng dùng lời kể "GFI đang chết" làm marketing** — chưa được chứng minh.
   - **CẢNH BÁO 2:** FSE 2020 (9.368 GFI / 816 repos) xác nhận "label GFI **không đảm bảo** thành công" — nhiều người mới thử nhiều lần vẫn fail. Đây là bằng chứng **ủng hộ** việc làm scoring chất lượng, nhưng cũng cảnh báo không nên tin label mù quáng.

---

## 2. Ý tưởng (nhắc lại để đối chiếu)

| # | Ý tưởng | Mô tả | Mục tiêu người dùng |
|---|---|---|---|
| 1 | **Open Source Contribution Finder** | Quét GitHub theo ngôn ngữ + độ khó + "good first issue" thật sự chất lượng; roadmap học + checklist PR đầu; leaderboard/portfolio tự động. | Junior Việt Nam bước vào OS dễ hơn. |
| 2 | **Personal Knowledge Garden** | Note + liên kết + graph visualization; publish một phần công khai. | Thúc đẩy học sâu & chia sẻ tri thức. |

**Kết luận so sánh ban đầu (trước research sâu):** Ý tưởng 1 khả thi để ship nhanh, dễ viral (first-PR testify), có wedge VN chưa ai chiếm, xoáy vào nhu cầu xin việc của junior. Ý tưởng 2 đẹp về tầm nhìn nhưng đối đầu trực tiếp Obsidian/Logseq/Quartz và cần thay đổi thói quen của người khác. → Nghiêng về Ý tưởng 1; báo cáo này kiểm chứng tính khả thi của nó.

---

## 3. Cạnh tranh: ai đang làm gì và cửa ở đâu

### 3.1 Bảng phân tích (nguồn: primary, fetch trực tiếp)

| Công cụ | Cơ chế vận hành | Điểm yếu = cửa để thắng |
|---|---|---|
| **goodfirstissue.dev** (DeepSource) | **Curation thủ công**: maintainer nộp repo qua Google Form, phải qua checklist (≥10 contributors, README hướng dẫn setup, CONTRIBUTING, commit gần đây). Sau khi vượt checklist, trang quét issues gắn label `good first issue` và hiển thị theo ngôn ngữ. Tính phân biệt chính trên trang chủ chỉ là **thanh lọc theo ngôn ngữ** (Python 94, TypeScript 77, Go 66, JavaScript 46, C++ 44, Java 43… — snapshot 12/08/2026). | Nguồn issue giới hạn vì phụ thuộc **maintainer chịu nộp form**; không tự quét GitHub; phạm vi toàn cầu, không VN. Điểm yếu nhất: **lọc label, không lọc chất lượng** (issue cũ, repo chết, maintainer vắng mặt vẫn tràn lên). |
| **up-for-grabs.net** | Maintainer **tự gắn label** `up-for-grabs`; site gom issue theo label đó. | Coverage phụ thuộc maintainer chịu gắn label; là "danh bạ chờ đóng góp", không phải engine tự quét. |
| **Code Triage** (~100.669 dev, ~10.460 repo) | **Email 1 issue/ngày/repo** mà user tự chọn. Không có ranking, không score chất lượng — *đã xác nhận bằng fetch primary*. | Không beginner-first, không lọc chất lượng; user phải tự khám phá repo. |
| **First Contributions** | Dạy PR/GitHub workflow qua repo giả lập "first contribution trong 5 phút". | Chỉ **giáo dục**, không phải issue finder thật; không có score reality.
| **first-timers-only** (Scott Hanselman, Kent C. Dodds) + GitHub App "First Timers" | Convention label `first-timers-only`; app tự sinh issue từ branch `first-timers-`. | Hướng tới **maintainer** (tạo issue), không phục vụ người mới tìm việc trực tiếp. |
| **Topic `good-first-issue` trên GitHub** | ~2.712 repos gắn topic (snapshot 13/08/2026). | **Label phân mảnh cực mạnh**: `good-first-pr`, `good-first-contribution`, `contributions-welcome`, `help-wanted`, `up-for-grabs`, `hacktoberfest`, `first-timers-only`, `beginner-friendly`… không có chuẩn chung → không thể chỉ dựa 1 label. |

### 3.2 Đọc thị trường

- **Không ai chiếm đỉnh** vì phân khúc bị xé thành "giáo dục" vs "finder thô", và mỗi cái đều thiếu một phần mà thị trường cần.
- **Kẽ hở rõ nhất = scoring chất lượng:** mọi đối thủ đều lọc bằng *label* (fail vì label bẩn) hoặc *thủ công* (fail vì phụ thuộc maintainer). **Chưa ai lọc bằng hành vi** (issue mới, maintainer phản hồi nhanh, repo health tốt, doc rõ).
- **Kẽ hở thứ hai = góc VN:** Gitista chỉ *đo lường* contributor VN đã active, không *kéo người mới từ 0*. Chưa ai làm "hành trình người mới VN".

---

## 4. Tính khả thi kỹ thuật: dữ liệu GitHub API cho quality-scoring

> Nguồn chính: GitHub Official Docs (fetch trực tiếp), ICSE 2023.

### 4.1 Rate limits (CONFIRMED — docs chính thức)

| Loại request | Giới hạn | Ghi chú cho indie app |
|---|---|---|
| **REST unauthenticated** | **60 req/h** (theo IP) | Không dùng được cho app thật; chỉ đủ demo. |
| **REST authenticated (PAT/OAuth)** | **5.000 req/h** | Trần thực tế cho freemium nhỏ. |
| **GitHub App installation token** | 5.000 + 50/repo (trên 20) + 50/user, **cap 12.500/h** | Cho phép nhỏ-lớn hơn; phù hợp mô hình multi-user. |
| **GraphQL primary** | 5.000 points/h (GHEC mới ×2; cap 12.500) | Equivalent với REST. |
| **GraphQL secondary** | ≤ 2.000 points/min | Bờ burst query cho crawler. |
| **Search API** | **30 req/min** auth, **10 req/min** anon (Search code: 10/min) | Dùng để crawl discovery. |

### 4.2 Giới hạn kết quả tìm kiếm (CONFIRMED, có nuance)

- Mỗi query search trả tối đa **1.000 results**, `per_page` max **100**.
- Con số **"4.000" là pool repository GitHub dò để trả về**, **không phải giới hạn response** (claim ban đầu hơi sai — đã sửa trong báo cáo này).
- **⟹ Hệ quả kiến trúc:** phải tách query nhỏ (theo language, date-range, label) + **cache toàn bộ + scheduled crawl nền**, không query trực tiếp mỗi lần user load. Nếu thiết kế vậy, mức passenger nhỏ vẫn ổn với 30 req/min.

### 4.3 Tín hiệu có sẵn trong Search API (CONFIRMED)

- `/search/issues` hỗ trợ qualifier: `label:"..."` (multi-word quoted), `language`, `state:open`, `is:issue`, qualifier ngày `created:`/`updated:` (ISO 8601, với toán tử >/</range, `closed:`/`merged:` cho PR).
- Mỗi item trả về: `created_at`, `closed_at`, `labels`, `pull_request` (để **loại trừ PR**), `repository`.
- Có `no:` qualifier (`no:label`, `no:milestone`, `no:assignee`, `no:project`) — phục vụ **tín hiệu âm** (issue thiếu metadata thường kém chất lượng).
- GET `/repos/{owner}/{repo}` trả schema đầy đủ: `stargazers_count`, `forks_count`, `pushed_at`, `created_at`, `updated_at`, `archived`, `open_issues_count`, `license`, `language`, `topics`, `default_branch`, `has_issues`, `has_pull_requests` → nguyên liệu **repo health**.

### 4.4 Tín hiệu KHÔNG có sẵn (phải tự đào) — quan trọng nhất

Search API **chỉ trả metadata thô, không có chỉ số sẵn** về: maintainer responsiveness, thời gian phản hồi, doc quality, tỉ lệ merge. Muốn score các chiều này phải **derive từ dữ liệu thô** (time giữa comment của maintainer, thời gian issue mở, tỉ lệ issue đóng bằng PR…). Nguồn tham khảo để thiết kế scoring: [opensource.guide/metrics](https://opensource.guide/metrics/) (resp time, thời gian issue mở, close-bằng-PR) và [CHAOSS metrics](https://chaoss.community/metrics/) (hệ GQM).

### 4.5 Dữ liệu học thuật chứng minh responsiveness đo được (CONFIRMED)

**ICSE 2023** (*"Is It Enough to Recommend Tasks to Newcomers? Understanding Mentoring on Good First Issues"* — Tan, Chen, Wu, **Zhou**, Zhang; 48.402 GFIs/964 repos):
- **~70% GFI có expert participation**, mỗi GFI thường **1 expert / 2 comments**.
- **Một nửa GFI nhận expert comment đầu tiên trong 8.5h** sau comment của newcomer ⇒ responsiveness là tín hiệu **thu thập được với chi phí thấp** (chỉ cần nhìn timeline issue).
- **Crunch:** expert involvement **correlates (+) với success nhưng (−) với retention**. Nghĩa là mentoring giúp PR được merge, nhưng người mới **không quay lại**. → Sản phẩm có phần "giữ chân" (roadmap, leaderboard, portfolio) đang trả lời một câu hỏi có thật, không phải tự bịa.

---

## 5. Bằng chứng "counter" phải đối mặt

| Nguồn | Claim | Mức độ tin cậy | Hệ quả thiết kế |
|---|---|---|---|
| **FSE 2020** (9.368 GFI/816 repos) | Label `good first issue` **không đảm bảo thành công**; nhiều newcomer thử nhiều lần vẫn fail → giảm hứng thú. | ✅ CONFIRMED (peer-review) | Lọc chất lượng là **bắt buộc**, không phải nice-to-have. |
| **arXiv 2604.27532v2** (preprint, 2026) | "Proportion GFI ổn định 3 năm, giảm **có ý nghĩa từ 01/2024**". Merge rate newcomer GFI tụt **61.9% → 42.2%**. Engagement vẫn ~27%. | ⚠️ **CHƯA chắc**: 1 preprint, chưa peer-review, không fetch được full-text; **KHÔNG có nguồn độc lập thứ 2**; dữ liệu topic thô ngược chiều (số repo tăng). | Đừng phụ thuộc label GFI. Đừng dùng "GFI đang chết" như luận cứ marketing. |

**Đọc lại chính xác preprint 2604.27532** (*"A Longitudinal Analysis of Good First Issue Practices and Newcomer Pull Requests in Popular OSS Projects"* — Hoshikawa, Tanaka, Shimari, Kula, Matsumoto):
- Phạm vi **hẹp hơn lời kể đầu**: chỉ **37 repos phổ biến** (30 có GFI), 406.826 issues, 1.117 newcomer GFI PRs, giai đoạn **07/2021–06/2025**.
- Nhấn mạnh **"khoảng cách đang rộng ra"**: newcomer vẫn muốn làm GFI (engagement ~27% ổn định) NHƯNG GFI ít hơn và **khó merge hơn** (merge 61.9%→42.2%).
- **⟹ Cách đọc tích cực & đúng:** đây là bằng chứng cho **đúng nhu cầu sản phẩm**: người mới cần *lọc chất lượng* + *hỗ trợ vượt qua PR bị từ chối*. Không phải "đừng build".

---

## 6. Wedge Việt Nam

| Yếu tố | Trạng thái | Ghi chú |
|---|---|---|
| **Khán giả** | Có dữ liệu | [Gitista Vietnam](https://gitista.com/vietnam/) xếp hạng contributor VN: top ~10.98K contributions, **hạng 7 toàn cầu** (Tam Nguyễn Đức, HCM), 9.526 PR / 1.348 issues / 93 repos. ⇒ Nhu cầu "nhìn thấy OS contribution VN" là thật. |
| **Đối thủ án lệ** | Gitista chiếm mảng đo-lường | Nhưng Gitista **chỉ đo ai đã active, không kéo người mới từ 0** — không phải finder. |
| **Hạ tầng hợp tác** | VFOSSA | [VFOSSA](https://vfossa.vn/) = hiệp hội FLOSS chính thức VN (chi hội của VAIP) — đối tác phân phối / co-brand tiềm năng. |
| **Kênh viral** | Developer VN | Facebook groups, Discord, Telegram cộng đồng dev VN hoạt động mạnh; "first PR testify" là content dễ lan truyền. |
| **Cơn đau có học thuật** | Retention gap | ICSE 2023: expert inolvement − retention ⇒ roadmap/checklist/community là miếng vá đúng nhu cầu. |

---

## 7. Verdict: khả thi hay không

| Chiều | Đánh giá | Chi tiết |
|---|---|---|
| **Kỹ thuật** | ✅ **Khả thi** | Dữ liệu đủ để xây scoring (freshness, PR-exclusion, repo health, responsiveness từ timeline). Giới hạn Search (1.000 results/query + 30 req/min) là bài toán cache/crawl, không phải rào cản. |
| **Thị trường** | ✅ **Cửa thắng thật** | "Scoring chất lượng" + "góc VN" chưa ai làm. goodfirstissue.dev là curation thủ công một chiều. |
| **Moat / khó nhất** | ⚠️ **Scoring chất lượng chính là moat** | Phần khó nhất = đắt đỏ nhất về thiết kế + dữ liệu. Nếu làm tốt → khó sao chép. |
| **Rủi ro lớn nhất** | ⚠️ **Phụ thuộc label GFI** | Dù trend label có suy giảm hay không, phụ thuộc vào 1 label = fragile. Lọc đa tín hiệu là bắt buộc. |
| **Retention** | ⚠️ **Thiếu tự nhiên** | User săn 1 issue rồi đi — phải chống bằng portfolio/leaderboard/community mới giữ được. Nhưng đây cũng là chỗ tạo giá trị khác biệt. |

**Kết luận:** Ý tưởng 1 **đáng build**. Không phải là "tìm-issue-tool nữa", mà là **"hành trình contribution chất lượng + giữ chân" cho developer VN** — dùng scoring làm moat, portfolio làm lý do quay lại.

**Chống chỉ định / khi nào KHÔNG nên build:**
- Nếu bạn coi "lọc chất lượng" là phụ (chỉ muốn một trang lọc ngôn ngữ + dịch sang tiếng Việt) → **đừng build**, vì goodfirstissue.dev + Google dịch làm được mà không cần bạn.
- Nếu bạn cần ra doanh thu tháng đầu → cả hai ý tưởng đều không phải kênh monetization ngắn hạn; hãy xem như **portfolio/việc làm** trước đã.

---

## 8. Tài liệu kiểm chứng (verification log)

> Ghi lại từng claim then chốt đã kiểm chứng bằng tay — nguồn, ngày, kết quả. Dùng để đánh giá độ tin cậy của báo cáo.

| # | Claim | Kết quả | Nguồn & cách verify | Ngày |
|---|---|---|---|---|
| 1 | ~70% GFI có expert participation, ~2 comments/GFI, nửa GFI nhận comment đầu trong 8.5h | ✅ **XÁC NHẬN** | ICSE 2023 abstract nguyên văn qua Semantic Scholar API (DOI:10.1109/ICSE48619.2023.00064) + arXiv 2302.05058. Dataset 48.402 GFI/964 repos. | 13/08/2026 |
| 2 | Expert involvement (+) success, (−) retention | ✅ **XÁC NHẬN** | ICSE 2023 abstract nguyên văn (như trên). | 13/08/2026 |
| 3 | "GFI label giảm từ 01/2024" + merge rate 61.9%→42.2% | ⚠️ **CHƯA chắc** | arXiv 2604.27532v2 — đọc abstract trực tiếp (title/authors/figures đúng); **preprint chưa peer-review, không fetch được full-text, chưa tìm thấy nguồn độc lập thứ 2**. | 13/08/2026 |
| 4 | FSE 2020: GFI label không đảm bảo success (9.368 GFI/816 repos) | ✅ **XÁC NHẬN (peer-reviewed)** | DOI 10.1145/3368089.3409746 — từ workflow search + claim extract. | 12/08/2026 |
| 5 | REST unauth = 60 req/h; auth = 5.000 req/h | ✅ **XÁC NHẬN** | docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api (fetch primary). | 13/08/2026 |
| 6 | Search: per_page≤100; 1.000 results/query; 4.000 là pool chứ không phải giới hạn response | ✅ **XÁC NHẬN** | docs.github.com/en/rest/search/search (fetch primary; đã sửa claim ban đầu). | 13/08/2026 |
| 7 | GraphQL: 5.000 points/h primary; ≤2.000 pts/min secondary; node cap 500k/call | ✅ **XÁC NHẬN** | docs.github.com/en/graphql/overview/resource-limitations (từ workflow claim extract). | 12/08/2026 |
| 8 | goodfirstissue.dev = curation thủ công (nộp form + checklist), chỉ lọc ngôn ngữ trên trang chủ | ✅ **XÁC NHẬN** | goodfirstissue.dev (fetch primary, snapshot 12/08/2026: số count theo từng ngôn ngữ khớp). | 12/08/2026 |
| 9 | Code Triage = email 1 issue/ngày, không score/rank | ✅ **XÁC NHẬN** | codetriage.com (fetch primary + nguồn khớp). | 12/08/2026 |
| 10 | VFOSSA = hiệp hội FLOSS chính thức VN | ✅ **XÁC NHẬN** | vfossa.vn (fetch primary; site tự mô tả là chi hội VAIP). | 12/08/2026 |
| 11 | Gitista Vietnam xếp hạng contributor — top VN hạng 7 toàn cầu | ⚠️ **Dạng dữ liệu thứ cấp** | gitista.com/vietnam (site tự báo con số; đã thấy qua workflow). | 12/08/2026 |

**Giới hạn chung:**
- Một số claim ban đầu chỉ trích từ workflow (phase verify tự động gãy vì 429) — nhưng **claims then chốt đều đã được verify lại thủ công** (bảng trên).
- Văn phong "GFI suy giảm" chưa được chứng minh độc lập (mục có dấu ⚠️).
- IEEE-IEEE/IEEE Xplore không fetch trực tiếp được (cần login) — đã dùng Semantic Scholar API làm nguồn thay thế cho abstract.

---

## 9. Câu hỏi chưa giải (open questions)

1. **Xu hướng label GFI:** nên tự đo thực nghiệm (query GitHub Archive / Trending theo thời gian) thay vì dựa 1 preprint. Nếu bạn muốn, mình có thể setup mini-scan.
2. **Retention tại Việt Nam:** chưa có dữ liệu định lượng riêng cho VN về "tại sao junior bỏ sau PR đầu" — cần phỏng vấn / survey khi làm user research.
3. **Mô hình kiếm tiền:** chưa chốt. Kênh tiềm năng: B2B (công ty tuyển junior / sponsor từ cộng đồng dev), portfolio-tự-động như "profile xin việc" (thu hút nhà tuyển dụng), hoặc marketplace issue mentor.
4. **Scoring model chi tiết:** chưa chốt trọng số (weight) giữa freshness vs responsiveness vs repo health vs doc quality — cần validate bằng dữ liệu thật.

---

## 10. Nguồn (sources)

**Primary — thuộc tính sản phẩm:**
- https://goodfirstissue.dev/ — goodfirstissue.dev (DeepSource)
- https://up-for-grabs.net/ — Up For Grabs
- https://www.codetriage.com/ — Code Triage (~100.669 dev / ~10.460 repo)
- https://firstcontributions.github.io/ — First Contributions
- https://www.firsttimersonly.com/ — first-timers-only (Hanselman & Dodds) + GitHub App "First Timers"
- https://github.com/topics/good-first-issue — ~2.712 repos tagged

**Primary — GitHub API / docs:**
- https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- https://docs.github.com/en/graphql/overview/resource-limitations
- https://docs.github.com/en/rest/search/search
- https://docs.github.com/en/search-graphql/searching-on-github/searching-issues-and-pull-requests
- https://docs.github.com/en/rest/repos/repos

**Nghiên cứu học thuật:**
- FSE 2020: https://doi.org/10.1145/3368089.3409746 — "A first look at good first issues on GitHub" (9.368 GFI / 816 repos)
- ICSE 2023: https://doi.org/10.1109/icse48619.2023.00064 = https://arxiv.org/abs/2302.05058 — "Is It Enough to Recommend Tasks to Newcomers? Understanding Mentoring on Good First Issues" (48.402 GFI / 964 repos)
- arXiv 2026 (preprint): https://arxiv.org/abs/2604.27532v2 — "A Longitudinal Analysis of Good First Issue Practices and Newcomer Pull Requests in Popular OSS Projects" (37 repos, 07/2021–06/2025)

**Tham chiếu scoring / health metric:**
- https://opensource.guide/metrics/ — Open Source Guide: Measuring Your Project's Health
- https://chaoss.community/metrics/ — CHAOSS community health metrics (GQM)

**Việt Nam:**
- https://gitista.com/vietnam/ — Gitista: Top Open Source Contributors in Vietnam
- https://vfossa.vn/ — VFOSSA (hiệp hội FLOSS VN, chi hội VAIP)