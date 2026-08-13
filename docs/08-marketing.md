# FirstPR — Story & Marketing Playbook

> File này ghi lại **cách giải thích FirstPR cho người lạ** (từ đơn giản → kể chuyện) — dùng làm nguyên liệu cho marketing: landing page, blog, bài đăng cộng đồng VN, video. Chứa cả 2 câu chuyện nhân vật (Minh ✅ / Ngọc ❌) để làm content so sánh "trước–sau".
>
> 🇻🇳 Tiếng Việt · **[English](08-marketing-en.md)**

**Ngày:** 2026-08-14
**Trạng thái:** Concept + Design. Chưa implement.
**Bạn đọc:** Chủ dự án, người làm marketing, người kể chuyện (content creator).

---

## 1. Lời nói đầu cho người làm marketing

Đây là **tài liệu "kể lại"**, không phải tài liệu kỹ thuật. Mục tiêu: bất kỳ ai cũng hiểu FirstPR **mà không cần đọc** `01-vision.md` hay `03-design.md`.

- **Phần 2–4** — lối giải thích từ "dễ hiểu nhất" tới "có chiều sâu". Dùng theo trình độ người nghe.
- **Phần 5** — câu chuyện Minh ✅ (có FirstPR) — cảm xúc tích cực, "kịch bản ước mơ".
- **Phần 6** — câu chuyện Ngọc ❌ (không FirstPR) — nỗi đau, "kịch bản nếu không có sản phẩm".
- **Phần 7** — bảng so sánh trước/sau — dùng cho bài post dạng so sánh.

> 💡 **Chip lưu ý:** Cả 2 câu chuyện đều **thuần kể chuyện**, chưa phải "testimonial thật". Trước khi public dạng lời chứng thực (testimonial), phải thay bằng câu chuyện của user thật (sau tuần 3–4 của MVP khi có 5–10 người dùng).

> ⚠️ **Thứ giữ im hoặc điều chỉnh:** Thị trường "good first issue" và cách nói "chọn đúng issue để được merge" là hứa hẹn sản phẩm (điểm khác biệt), nhưng **đừng thổi phồng** thành "bảo đảm PR sẽ merge". Văn phong chuẩn trong research: *"khả năng cao được merge & được hỗ trợ"*. Xem `02-research.md` (cảnh báo về label GFI).

---

## 2. Giải thích kiểu "nói cho người lạ" (không thuật ngữ)

### Bối cảnh: junior dev có vấn đề gì?

Một developer mới ra trường (junior) muốn làm open source để:
- Học code thật sự.
- Có thứ gì đó "bỏ vào CV" khi đi xin việc.

Lên GitHub, họ tìm issue có nhãn **"good first issue"** ("issue tốt cho người mới"). Nghe đúng chỗ, nhưng thực tế là **"bẫy"**:

- Repo đã chết từ lâu, không ai trả lời.
- Issue mở 2 năm chẳng ai đụng tới.
- Làm xong, nộp PR, rồi **không ai phản hồi**.
- Người mới làm vậy vài lần → nản, bỏ nghề.

**Nghiên cứu học thuật xác nhận:** nhãn "good first issue" **không đảm bảo** thành công. Nhiều người mới thử nhiều lần vẫn fail, chủ yếu vì chọn phải issue tối nghĩa, repo chết, chủ dự án không quan tâm. (Xem `02-research.md` — FSE 2020.)

### Vậy FirstPR làm gì? — ví dụ cụ thể

Giống một **"người môi giới" đã khảo sát trước thị trường**:

**Bước 1 — Tự quét GitHub,** liệt kê hàng nghìn issue đang mở.

**Bước 2 — Chấm điểm từng issue 0–100** dựa trên hành vi thật:
- Repo còn sống không? (có commit trong 90 ngày qua?)
- Maintainer phản hồi nhanh không? (trung bình < 24 giờ → điểm cao)
- Bao nhiêu % PR được merge thật? (80% → repo "có sách mách có chứng")
- Issue có rõ ràng không? (mô tả chi tiết, chỉ đích danh file, phạm vi nhỏ?)

**Bước 3 — Hiện danh sách đã sắp xếp:** issue nào điểm cao, **kèm giải thích tại sao**. Nhìn là thấy "à, repo này còn sống, maintainer trả lời nhanh, issue nhỏ và rõ — hợp với mình".

> **Cốt lõi:** thay vì "chọn bừa một issue có nhãn đẹp", người dùng chọn một issue mà **dữ liệu cho thấy mình gần như chắc chắn được giúp và PR được duyệt**.

### Phần thứ hai: không chỉ "tìm" mà "biến thành của mình"

Làm xong issue đầu, PR được merge 🎉 → FirstPR **tự động tạo trang portfolio** (CV sống):

- Hero: avatar + nickname + tổng PR đã merge.
- Các project đã đóng góp, kèm bằng chứng (link PR thật).
- **Dòng thời gian:** "issue #123 ở repo X → PR merged 12/08".

Copy một **link duy nhất gửi nhà tuyển dụng**. Mỗi lần đóng góp thêm, trang tự cập nhật — không chỉnh tay.

> **Mấu chốt:** portfolio **chỉ hiển thị PR được merge thật** (kiểm từ GitHub API) → là **bằng chứng, không phải lời khoe**. Thị trường VN dễ nghi ngờ người thổi phồng, nên bằng chứng là chỗ đáng tin.

### Tóm trong 3 câu

1. **Vấn đề:** Junior muốn làm open source nhưng hay chọn nhầm issue "chết", làm xong chẳng ai phản hồi → nản.
2. **FirstPR làm gì:** Tự khảo sát GitHub, **chấm điểm độ "nên làm" của từng issue dựa trên hành vi thật** (repo sống, maintainer phản hồi nhanh, PR hay được merge, issue rõ ràng) → giúp người mới chọn đúng.
3. **Và đi xa hơn:** Tự động biến PR đã merge thành **portfolio xin việc có bằng chứng** — lý do quay lại, và thứ gửi nhà tuyển dụng.

---

## 3. Bản chất (giải thích có chiều sâu)

- **"Chất lượng" = xác suất PR đầu của newcomer được merge & được hỗ trợ** — không phải "issue hay". Đây là nguyên tắc cốt lõi trong `03-design.md`.
- **Khác biệt với đối thủ:**
  - goodfirstissue.dev lọc bằng **label** → bạn lọc bằng **hành vi** (responsiveness + merge rate + freshness).
  - Họ dừng ở "tìm issue" → bạn đưa **trọn hành trình tới portfolio xin việc**.
  - Họ không đo độ tin cậy → bạn **trắng trợn từng tiêu chí + confidence score**.
  - Họ không tự cải thiện → **vòng phản hồi outcome** giúp model tự tốt lên.
- **Wedge Việt Nam:** chưa ai làm "hành trình người mới VN". Gitista chỉ **đo** ai đã active, không **kéo người mới từ 0**. Kênh lan truyền: Facebook/TG/Discord nhóm dev VN, "first-PR testify" là content dễ viral.
- **Đã chốt:** định vị = **công cụ cộng đồng VN (OSS)**, repo public + MIT, dogfooding. (Xem `05-business.md`, `06-oss.md`.)

---

## 4. Numeric một số con số "ăn liền" khi kể

> Dùng để "chấm điểm" câu chuyện bằng dữ liệu. Rút từ `02-research.md`.

- **FSE 2020:** label `good first issue` không đảm bảo thành công — 9.368 GFIs / 816 repos.
- **ICSE 2023:** ~70% GFI có expert tham gia; một nửa nhận phản hồi đầu trong **8.5h** → responsiveness **đo được**; expert help tăng success nhưng **giảm retention** (người mới không quay lại).
- **GitHub rate limit (để hiểu vì sao tự xây):** unauth 60 req/h, auth 5.000/h, GitHub App tới 12.500/h. Search API: 30 req/min, query trả tối đa 1.000 results → thiết kế crawl nền + cache.

---

## 5. Câu chuyện user: Minh ✅ (có FirstPR)

> "Kịch bản ước mơ" — cảm xúc tích cực, tương lai gần. Dùng cho landing page / video giới thiệu.

**Nhân vật: Minh, 22 tuổi, junior dev, TP.HCM.**

Minh biết code (JavaScript, Python) nhưng chưa có kinh nghiệm làm việc thật. CV trống phần "kinh nghiệm". Bạn bè bảo *"làm open source đi, rồi lấy đó khoe nhà tuyển dụng"*. Vấn đề: Minh từng thử và mất hút một tuần — chọn đại issue có nhãn "good first issue", code xong nộp PR, **6 tháng chưa ai trả lời** (repo đã chết). Minh nản.

Bây giờ, bạn giới thiệu Minh dùng **FirstPR**.

**⏰ Thứ Bảy 20:00** — Vào trang chủ. Không phải danh sách issue trơ trẽn mà là danh sách **có điểm số + lý do**:

| Issue ở repo X | Điểm **87** |
|---|---|
| 🟢 Repo còn sống | commit trong 3 ngày qua |
| 🟢 Maintainer phản hồi | trung bình **5 giờ** |
| 🟢 Tỉ lệ PR merge | **84%** |
| 🟢 Issue rõ ràng | mô tả 300 ký tự + chỉ file `validate.js` |

Cạnh bên vài issue đỏ hơn (điểm 30–40) kèm dòng nhỏ *"repo không push 100 ngày"*, *"chưa đủ dữ liệu"*. **Nhìn là hiểu vì sao.** Minh thấy *"đây là chỗ biết nói thật"*.

**⏰ 20:30** — Lọc ngôn ngữ JavaScript, sắp theo điểm. Đầu bảng là issue **88 điểm**, mô tả cụ thể:

> *"Sửa lỗi: khi nhập trống trong ô tìm kiếm, trang báo lỗi. Cần validate trước khi gọi API. Xem file `search.js` dòng 45."*

Minh hiểu được việc, phạm vi nhỏ. Bấm **"Tôi làm issue này"** (hệ thống ghi nhận để theo dõi kết quả).

**⏰ Thứ Ba 21:00** — Nhà tuyển dụng nhắn *"em gửi CV qua nhé"*. Minh gửi **một đường link**: `firstpr.vn/minh`. Lúc này con số còn 0 — Minh hơi ngại nhưng vẫn gửi kèm: *"em đang đóng góp open-source, đây là trang theo dõi quá trình."* *(Điểm hay: trang chỉ hiển thị PR đã merge thật → nhà tuyển dụng biết không phải bịa.)*

**⏰ Thứ Năm 20:00** — Ngồi code 1,5 giờ là xong. Tạo PR kèm đúng hướng dẫn. **Đêm đó maintainer trả lời**: *"cảm ơn, mình để ý chỗ này nữa…"* — đúng như dữ liệu hứa. (Lần trước với issue chết, Minh không bao giờ được câu này.)

**⏰ Tuần sau 14:00 — Merge 🎉** FirstPR nhận tín hiệu từ GitHub API và tự động:
1. Thêm card project vào portfolio + link PR thật.
2. Cập nhật tổng PR merged: **1**.
3. Thêm 1 dòng timeline: *"issue #123 · repo X → PR merged 21/08"*.
4. Tự sinh **ảnh OG** cho Facebook/Telegram/Zalo.

**⏰ 14:10 — Viral:** Minh share Facebook:

> *"👋 PR đầu tiên của mình vừa được merge trên một dự án mã nguồn mở! Open source từng làm mình nản, nhưng giờ đã hiểu vì sao nên chọn issue đúng người duyệt. Hành trình của mình 👇"* + link portfolio.

Ảnh OG đẹp, bạn bè nhóm dev VN bấm vào → vài người junior thử → **vòng lặp viral**.

**⏰ 1 tháng sau:** Portfolio của Minh có **3 PR merged, 2 issue giúp**. FirstPR học được issue nào ở VN thật sự thành công (vòng phản hồi outcome) → model càng chạy càng đúng, càng khó bị sao chép. Và **nhà tuyển dụng gọi Minh phỏng vấn 🎯**

---

## 6. Câu chuyện user: Ngọc ❌ (không FirstPR)

> "Kịch bản nếu không có sản phẩm" — nỗi đau, điểm chạm cảm xúc. Dùng cho content so sánh trước/sau, hoặc phần "vấn đề" trên landing page.

**Nhân vật: Ngọc, 22 tuổi, cùng lớp với Minh, cũng chưa biết FirstPR.** Đối chứng hoàn hảo: cùng điểm xuất phát, cùng mục tiêu — chỉ khác một điều, Ngọc không có FirstPR.

**⏰ Thứ Bảy 20:00 (cùng lúc Minh)** — Ngọc vào GitHub, nghe chữ **"good first issue"**. Lọc thử → **một núi issue**: không điểm số, không xếp hạng, không lời giải thích. Ngọc đứng hình: *"Cái nào là 'tốt'? Cái nào mình làm được?"* → chọn theo trực giác (tiêu đề quen thuộc), **đánh bạc**: không biết repo còn sống không, maintainer có trả lời không, PR có được merge không.

**⏰ 20:30** — Ấn vào issue "*Thêm một vài cải thiện nhỏ*" — mô tả **2 dòng**, không nói rõ làm gì, không chỉ file. Ngọc nghĩ *"chắc dễ, tự xử"*. Ngọc không biết repo **không ai commit 4 tháng** (dữ liệu này nếu có FirstPR sẽ đỏ lòm).

**⏰ Thứ Ba 21:00** — Nhà tuyển dụng nhắn Ngọc *"gửi CV qua nhé"*. Ngọc **mở CV cũ** — "kinh nghiệm" trống trơn. Không có gì chứng minh đã đóng góp open-source, vì **chưa có gì xong cả**. Gửi CV với tâm trạng hụt hẫng. *(Cùng giờ, Minh gửi được link portfolio đang lớn dần.)*

**⏰ Thứ Năm 20:00** — Ngọc code theo nghĩa "tự bơi": issue mơ hồ → **đoán mò việc cần làm**. Tạo PR kèm hỏi *"mình làm đúng hướng không ạ?"* → **im lặng tuyệt đối**: 1 ngày, 2 ngày, 1 tuần, không ai trả lời. Ngọc không biết điều mình không biết: repo đã chết, issue mơ hồ, **nộp PR cho thứ không có người chăm sóc**.

**⏰ 3 tuần sau** — Phản hồi duy nhất:

> *"Cảm ơn. Nhưng repo này đang chuyển sang công nghệ khác, bọn mình sẽ không merge nữa."*

Hai câu đó phá tan 3 tuần công sức. PR nằm im, không bao giờ merge.

**⏰ Kết cục:** Ngọc **nản** — *"open source không dành cho mình"* — quay lại xin việc tay trắng. CV vẫn trống, nhà tuyển dụng vẫn chưa gọi. **Còn Minh cùng tuần đó: 1 PR merged, portfolio có bằng chứng, đang làm PR thứ hai.**

> 💡 **Nghiên cứu gọi đây là "retention gap":** người mới thử xong rồi **không quay lại** — chính vì những trải nghiệm kiểu Ngọc. FirstPR ra đời để vá lỗ hổng: chọn đúng issue, được giúp, thấy PR thành công, rồi quay lại.

---

## 7. Bảng so sánh chớp nhoáng (trước/sau)

> Content dạng "hình ảnh so sánh" hoặc bảng trên landing page.

| Mốc | Ngọc (không FirstPR) | Minh (có FirstPR) |
|---|---|---|
| Chọn issue | Đoán mò theo trực giác | Có điểm số + lý do rõ ràng |
| Biết repo còn sống? | ❌ Không | ✅ Có (điểm + dòng cảnh báo đỏ) |
| Biết maintainer phản hồi nhanh? | ❌ Không | ✅ Có |
| PR được merge? | ❌ 3 tuần → bị bỏ | ✅ Được merge, ghi nhận tự động |
| Portfolio | ❌ Tay trắng | ✅ Link có bằng chứng |
| Cảm giác | 😞 "Open source không dành cho mình" | 🎉 "Mình làm được!" |

> **Chân lý marketing:** người ta không bỏ open source vì không muốn, mà vì **không ai giúp họ chọn đúng** và **không ai biến cố gắng thành thứ khoe được**.

---

## 8. Ideas chuyển thể sang các kênh

- **Landing page hero:** câu "Chọn issue đúng, không chọn bừa." + nút demo.
- **Blog:** "Vì sao 70% người mới bỏ cuộc sau lần đầu làm open source" (dẫn ICSE 2023, retention gap).
- **Bài đăng group dev VN:** dạng so sánh Ngọc vs Minh (Phần 7), kèm ảnh.
- **Video 60s:** kể lại hành trình Minh từ Thứ Bảy → Merge → share portfolio (Phần 5).
- **Testimonial (sau tuần 3–4 MVP):** thay câu chuyện giả bằng user thật, có link portfolio thật.

---

## 9. Nguồn & tham chiếu

- `01-vision.md` — vision, vấn đề, giải pháp, persona, đối thủ.
- `02-research.md` — bằng chứng thị trường & kiểm chứng học thuật.
- `03-design.md` — chi tiết scoring + portfolio.
- `05-business.md`, `06-oss.md` — định vị C (OSS), monetization.
- Nghiên cứu: FSE 2020 (GFI không đảm bảo success), ICSE 2023 (responsiveness đo được, retention gap).