# Ảnh chụp lượt nghiệm thu trên trình duyệt

Chụp ngày **2026-09-04**, Chromium qua Playwright, bảng quản trị ở `http://localhost:5174` với backend ở
`127.0.0.1:5199`. **Lượt đầu tiên trong cả đợt có màn hình được mở thật** — trước đó mọi mô tả giao diện trong
[`../../admin/`](../../admin/), [`../../portal/`](../../portal/) và [`../../landing/`](../../landing/) là đọc từ mã.

Kết quả bảng quản trị (2026-09-04): **17 phép kiểm, 17 đạt, 0 lỗi console.** Cổng người dùng (2026-09-05): **8/8**.

| Ảnh | Nội dung | Mục nghiệm thu |
|---|---|---|
| `01-audit-log.png` | Nhật ký kiểm toán lúc vừa vào — **bộ lọc rỗng, không có kết quả**, dải thường trực nói nhật ký chỉ ghi thêm và không ghi mọi thứ | màn hình mới |
| `02-audit-deny.png` | Sau khi bấm "Xem các lượt bị từ chối" — 8 dòng thật, nhãn chữ trên cột kết quả, cột mã quy tắc đã tách khỏi phiên bản bộ quy tắc, bộ lọc nằm trong URL | màn hình mới |
| `03-audit-detail.png` | Ngăn chi tiết — mã tương quan, phiên bản bộ quy tắc `authz-v1`, và dấu vết thiết bị ở trạng thái *có giá trị* | màn hình mới |
| `04-users.png` | Danh sách người dùng sau khi bấm **Khóa tài khoản** thật | [`DNHAP-51`](../admin.md), `NDUNG-03` |
| `05-create-user.png` | Hộp thoại tạo người dùng — **có ô mật khẩu**, nút hiện/ẩn, và câu hướng dẫn | `NDUNG-01`, `NDUNG-24` |

## Cổng người dùng — 2026-09-05, 8/8

| Ảnh | Nội dung | Mục |
|---|---|---|
| `p1-logged-in.png` | Sau đăng nhập, ở `/ips`; cookie `dmst_access_token` sống **1,00 ngày** | B-09 |
| `p2-after-401.png` | Sau khi cookie bị thay bằng token hỏng và mở `/ips`: về `/login`, cookie đã xoá, tải lại không lặp vòng | **B-12** |

Kịch bản: `ui-portal.mjs`. Cùng lượt còn xác nhận **0 lời gọi tới cổng 3001** (B-14) — 4 lời gọi API, tất cả tới `5199`.

## Trang giới thiệu — 2026-09-05, 9/9

| Ảnh | Nội dung | Mục |
|---|---|---|
| `l1-landing.png` | Trang giới thiệu ở `localhost:5175` với hai câu chuyện dàn dựng: một có tác giả, một **mồ côi tác giả** (máy chủ trả `author: null`) — cả hai hiện, trang không trắng, 0 lỗi runtime | LANDING-01, **B-22**, B-21 |

Kịch bản: `ui-landing.mjs`. Lần đầu tiên trang giới thiệu được mở. Điều kiện để nó chạy là chính thứ B-41 sửa: origin `localhost:5175` phải có trong `Cors:Origins`, và trang phải ghim cổng `5175` — trước đó nó không ghim, nên khi chạy cùng cổng người dùng nó trôi sang cổng khác và rơi khỏi danh sách.

## Ba màn hình mới của bảng quản trị — 2026-09-05, 37/37

| Ảnh | Nội dung | Mục |
|---|---|---|
| `c1-cases-list.png` | `/cases?stage=DISCOVERY` — bộ lọc đọc từ URL, hồ sơ dàn dựng hiện | console |
| `c2-case-detail.png` | `/cases/:id` — ba thứ ở phần đầu (giai đoạn, khoá, phiên bản đề bài ghim), chính sách "chưa chốt, sẽ chốt khi vào Thẩm định", thanh giai đoạn chỉ cho bấm **Thẩm định**, đường ra **Từ chối + Rút lui** (không có Huỷ ở Khám phá) | console |
| `c3-dialog-409.png` | Hộp thoại quyết định sau khi "người khác" tăng phiên bản qua API: **không đóng**, nói hồ sơ vừa được cập nhật, **diễn giải hai dòng còn nguyên**, phiên bản mới lấy từ phản hồi | console, B-40 |
| `c4-after-transition.png` | Gửi lại → Khám phá → Thẩm định; dòng thời gian có mục kèm diễn giải; liên kết ảnh chụp chính sách xuất hiện. **B-42**: cùng một tài khoản là chủ bài toán + môi giới chính | console, **B-42** |
| `c5-on-hold.png` | Đang bị khoá — dải đầu trang có lý do, **mọi nút chuyển tắt**, khoá là danh sách có nút gỡ từng cái (trường `holds` mới) | console |
| `c6-hold-released.png` | Sau gỡ khoá — mục dòng thời gian vẽ như **ghi chú có người ký**, không phải mũi tên; nút chuyển bật lại | console |
| `c7-policy-snapshot.png` | `/policy-snapshots/:id` — tuyến, hai phiên bản, thời điểm chốt, "đang hiện hành"; 7 nhóm cổng + **5 giai đoạn nói "không đặt cổng"**; dải "luật đã ghi, chưa thi hành"; hash kèm `JCS-1` và nút chép bản chuẩn hoá | ảnh chụp chính sách |
| `c8-match-rounds.png` | `/match-rounds/commercialization-cases/:id` — 204 hiện thành **"chưa từng được tính"**, và câu nói thẳng trang so sánh chưa dựng được vì API | vòng ghép cặp |

Kịch bản: `ui-cases.mjs`. Cùng lượt còn đo **B-38**: đổi ô lọc trạng thái người dùng phát ra `status=active`, không có `locked`/`pending`. Lỗi console duy nhất của lượt là dòng `409 (Conflict)` mà kịch bản cố ý gây ra để kiểm hộp thoại.

## Lịch sử và so sánh vòng ghép cặp — 2026-09-05, 21/21

Máy này không có sidecar nhúng (và Elasticsearch đã gỡ — chỉ mục nay trong PostgreSQL), nên ba vòng được **chèn thẳng vào PostgreSQL** (`matching.match_rounds`, `matching.match_candidates`) với đúng hình dạng `MatchRound.Complete` / `MatchRound.Import` tạo ra: một vòng chấm điểm kiểu cũ, một vòng đã sửa (đang dùng), một vòng nhập từ hệ cũ. Cái được đo là API đọc và màn hình, không phải thuật toán — B-27 vẫn chờ sidecar.

| Ảnh | Nội dung | Mục |
|---|---|---|
| `r1-demand-newer.png` | Console hồ sơ: đề bài đã lên phiên bản 2 (sửa qua v1) trong khi hồ sơ ghim phiên bản 1 — ô "Đề bài đang ghim" cảnh báo, qua `GET /api/v2/demand-briefs/{id}` mới | console, CONS-07 |
| `r2-rounds-history.png` | Lịch sử vòng với bộ lọc `scoringMode=LEGACY_SCORING` **trong URL** — 2 trong 3 vòng, nhãn "đang dùng", vòng nhập từ hệ cũ đánh dấu | VGC-03 |
| `r3-compare.png` | So sánh vòng cũ (A) với vòng đã sửa (B): kết luận "có phần đến từ thuật toán, không tách được"; bảng hợp nhất chỉ A / cả hai / chỉ B; **không có cột hiệu số** vì khác chế độ; đoạn khớp của từng bên | VGC-04, VGC-05 |
| `r4-compare-imported.png` | So sánh với vòng nhập từ hệ cũ: **"Không kết luận được"** dù cùng nhãn chế độ | VGC-06 |

Kịch bản: `ui-rounds.mjs`. Cùng lượt còn đo ở tầng API: liệt kê mới-nhất-trước, lọc theo chế độ, đọc vòng theo định danh (kèm `queryText`, `isAuthoritative`), ứng viên theo hạng, 404 cho vòng không có **và** 404 (không phải 403) cho người không đọc được hồ sơ của vòng.

## B-27 trên bản chạy với mô hình thật — 2026-09-05, 9/9

`verify-b27.sh`: sidecar BGE-M3 (`dmst-rag:pinned`, model đã cache trong volume `search-bench_model_cache`) ở 8003, API chạy `Matching__ScoringMode=CORRECTED_SCORING Matching__UseSparse=true`. Hai bản ghi cùng nội dung — bản nháp của A, bản đã xuất bản của B — vào `matching.search_chunks` sau 6 giây kèm cột `sparse`; C gọi `POST /api/v1/search` với ngưỡng mặc định 2.0 → **chỉ bản đã xuất bản** (B-27), có kết quả dù ngưỡng thang cũ (B-45), nhật ký ghi `postgres-16/pgvector-rrf3 min=0`, câu không dấu vẫn tìm thấy. Hai cái bẫy của kịch bản: `curl -F` coi giá trị bắt đầu bằng `<` là tệp (dùng `--form-string`), và JSON tiếng Việt phải đi qua `--data-binary @tệp`.

## §26.6.6 tám ca đúng/sai và vòng thật — 2026-09-05

`verify-search-cases.mjs` **10/10** trên mô hình thật, chế độ đã sửa + sparse + rerank: cụm âm tiết, không dấu, giữ phân biệt khi có dấu, NFC/NFD và hai kiểu đặt dấu, từ tiếng Anh, số hiệu bằng sáng chế và tên tổ chức, lọc cứng trước top-K (20 bản nháp không chiếm chỗ), **đoạn mức 3 không vào bản chiếu và không rò trong kết quả** (chủ sở hữu vẫn đọc được). Viết bằng Node: `curl --form-string` trên Git Bash/Windows gửi tiếng Việt thành `?` — bản ghi tạo bằng bash không khớp `ILIKE '%công nghệ sinh học%'`, nên phép đo về dấu bằng bash là vô nghĩa (kịch bản bash đã bỏ).

`ui-rounds-real.mjs` **12/12** — vòng thật đầu tiên: `POST /api/v2/subjects/demand-briefs/:id/match-rounds` (428 khi thiếu khoá, 403 `DEFAULT_DENY` cho người lạ, 202 cho chủ, phát lại cùng khoá), việc nền tính bằng chỉ mục PostgreSQL + BGE-M3 + reranker, `latest` có 10 ứng viên với engine `postgres-16/pgvector-rrf3-rerank`, hiện trên bảng quản trị.

| Ảnh | Nội dung | Mục |
|---|---|---|
| `r5-real-round.png` | Vòng thật trên `/match-rounds/demand-briefs/:id`: bốn thông tin, ứng viên có điểm reranker và lý do `rrf_dense_lexical_exact_sparse_rerank` | VGC-08 |
| `r6-real-round-detail.png` | Chi tiết vòng thật, câu truy vấn là tiêu đề + nội dung đề bài | VGC-07 |

Vòng đời hồ sơ vụ việc qua HTTP (không cần trình duyệt) ở `verify-case-writes.sh`: tạo → gán môi giới → 422 đúng mã ADR-0008 → 409 không tạo bản ghi quyết định → chuyển giai đoạn → khoá tạm chặn → gỡ khoá → chuyển tiếp. Cùng kịch bản này lộ ra [B-42](../../bug-triage.md#b-42-người-giữ-hai-vai-trò-trong-một-hồ-sơ-bị-chấm-theo-vai-trò-đầu-tiên-không-theo-vai-trò-cho-phép).

## Vì sao `04-users.png` đáng giá hơn vẻ ngoài của nó

[`NDUNG-03`](../admin.md) là mục **chỉ đo được qua giao diện**. Máy chủ hoàn toàn khoẻ mạnh; cái sai của
[B-26](../../bug-triage.md#b-26-nút-khoá-tài-khoản-gọi-lệnh-xoá) nằm ở chỗ cái nút gọi lệnh nào. Không phép đo
`curl` nào nói được điều đó — phải bấm đúng cái nút ấy.

Khẳng định của lượt kiểm không đọc từ màn hình mà đếm từ PostgreSQL: **1 hàng trước khi bấm, 1 hàng sau khi
bấm**, và `is_active` chuyển sang `f`. Với một nút từng gọi nhầm lệnh xoá, "bản ghi vẫn còn" là câu đáng giá
nhất có thể nói.

Cách chạy lại lượt này ở [`../../HUONG-DAN-TRIEN-KHAI.md`](../../HUONG-DAN-TRIEN-KHAI.md#nghiệm-thu-trên-trình-duyệt),
kèm hai cái bẫy đã mất thời gian: origin `127.0.0.1` khác `localhost`
([B-41](../../bug-triage.md#b-41-corsorigins-khai-localhost-nên-mở-bằng-127001-là-hỏng-im-lặng)), và chờ
`networkidle` trên một SPA là chờ nhầm thứ.
