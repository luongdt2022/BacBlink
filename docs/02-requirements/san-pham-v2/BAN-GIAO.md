# Bàn giao để bắt đầu viết mã

Tài liệu này dành cho phiên làm việc **tiếp theo** — phiên sẽ code, không phải phiên soạn tài liệu. Nó nói: đọc gì, xây gì, theo thứ tự nào, và những cái bẫy đã biết.

Mọi con số ở đây đo trong phiên ngày 2026-09-04 trên bản chạy thật, không phải đọc từ tài liệu kiến trúc.

## Đọc gì trước

Đừng đọc cả 59 tệp. Với mỗi việc, đọc đúng bốn thứ:

1. [`README.md`](README.md) — khung tài liệu và quy ước. 10 phút.
2. [`goal.md`](goal.md), mục **"Những gì đã chốt"** — các sự kiện chịu lực. **Không suy lại chúng, không mâu thuẫn với chúng.**
3. [`bug-triage.md`](bug-triage.md) — 46 mục lỗi, và quan trọng nhất là **ba cặp khoá thứ tự lẫn nhau** ở đầu tệp.
4. [`HUONG-DAN-TRIEN-KHAI.md`](HUONG-DAN-TRIEN-KHAI.md) — mã đặt ở đâu trong ba repo (chúng **không** dùng chung quy ước), client v2 dựng thế nào, và năm cái bẫy đã đo được.
5. Đặc tả của đúng việc đang làm: một tệp trong [`api-v2/`](api-v2/) và một tệp trong [`moi/`](moi/).

Rồi mở danh mục nghiệm thu tương ứng trong [`verification/api-v2-va-moi.md`](verification/api-v2-va-moi.md) **trước khi viết dòng mã đầu tiên**. 487 tiêu chí ở đó là tiêu chí nghiệm thu viết trước; chúng là định nghĩa "xong".

## Tình trạng thật của hệ thống

| | |
|---|---|
| Backend .NET | 12 module, tầng dịch vụ hoàn chỉnh, **140/140** test xanh (44 trước sprint 0). Hai client: bảng quản trị 40 bài, cổng 19 bài |
| Cửa HTTP | **73** đường facade `/api/v1` (74 trước khi gỡ [B-35](bug-triage.md#b-35-danh-sách-intake-ẩn-danh-trả-bản-nháp-của-mọi-người)), cộng **20 endpoint `/api/v2`** (9 đọc thuần kể cả lịch sử vòng ghép cặp và đề bài, 8 hồ sơ vụ việc đủ vòng đời, 1 đề bài, 2 lệnh ghi ghép cặp). Hai tài liệu OpenAPI đã tách đôi |
| Năng lực không có cửa | **6** có tầng dịch vụ đầy đủ: hồ sơ vụ việc (8 thao tác), môi giới (6), cấp quyền đọc (2), tra cứu kiểm toán, ảnh chụp chính sách, vòng ghép cặp. Cộng **1 chưa có mã**: cổng chất lượng — xem [B-36](bug-triage.md#b-36-cổng-chất-lượng-được-liệt-kê-là-đã-có-tầng-dịch-vụ-nhưng-không-có-mã-nào-nâng-được-mức) |
| Ba frontend | Đều build được; admin **27 route** (7 màn hình mới: nhật ký kiểm toán, hồ sơ vụ việc ×2, ảnh chụp chính sách, vòng ghép cặp ×3), cổng 12 khu vực (5 là vỏ), landing 1 trang. **Cả ba đã mở trên trình duyệt thật** |
| Ngày dừng v1 | **31/03/2027** — đã cấu hình, máy chủ đang gửi header `Sunset` |

## Việc phải làm, theo thứ tự

Thứ tự này **không tuỳ ý**. Sprint 0 đứng trước vì nó sửa thứ đang chạy hỏng trên bản phát hành.

Thứ tự từ sprint 1 trở đi **đã được sửa lại ngày 2026-09-04** sau khi kiểm kê năng lực. Bản đầu xếp toàn bộ nền v2 trước mọi endpoint v2, với lý do "không màn hình v2 nào viết được khi chưa có ba cơ chế nền". Đúng với **màn hình**, nhưng không đúng với **endpoint**: `IdempotencyMiddleware.cs:19` chỉ chặn `POST`, `PUT`, `PATCH`, `DELETE`. Endpoint `GET` trên `/api/v2` không phụ thuộc ADR-0004, nên ba nhóm đọc thuần đi trước được — và chúng kiểm chứng [ADR-0009](../../04-technical/adr/0009-noi-dat-endpoint-v2.md) trên ba ca dễ trước khi 15 nhóm còn lại xây trên nó.

### Sprint 0 — cầm máu — **đã xong 2026-09-04**

Không cái nào chờ v2, không cái nào cần thiết kế mới. Năm mục đều đã sửa và **đã đo lại trên bản chạy** — B-27 đo ngày 2026-09-05 sau khi có sidecar và chỉ mục PostgreSQL.

| Mã | Việc | Ghi chú |
|---|---|---|
| ~~[B-32](bug-triage.md#b-32-mọi-sửa-đổi-tạo-phiên-bản-nội-dung-mới-đều-thất-bại-với-409)~~ | Sửa nội dung trả 409 vĩnh viễn | **Xong** 2026-09-04, cùng B-31. Đo lại `LP-01`: 200 ở cả năm bước |
| ~~[B-31](bug-triage.md#b-31-sửa-một-đề-bài-mà-không-gửi-kèm-nội-dung-mật-sẽ-xoá-sạch-nội-dung-mật-đó)~~ | Sửa tiêu đề xoá sạch nội dung mật | **Xong** 2026-09-04, cùng lần sửa với B-32. `LP-06` đã chạy trước khi phát hành |
| ~~[B-19](bug-triage.md#b-19-apiv1publicstories-trả-email-và-số-điện-thoại-của-tác-giả-cho-người-chưa-đăng-nhập)~~ | Đường công khai trả email + điện thoại tác giả | **Xong** 2026-09-04 — `V1Mappers.PublicAuthor`, chỉ bốn khoá |
| ~~[B-20](bug-triage.md#b-20-đọc-một-bản-ghi-theo-định-danh-không-kiểm-quyền)~~ | Ẩn danh đọc được bản nháp và bản đã xoá mềm | **Xong** 2026-09-04, cả hai đường, cả hai đã đo lại |
| ~~[B-27](bug-triage.md#b-27-tìm-kiếm-trả-cả-bản-nháp-của-người-khác)~~ | Tìm kiếm trả bản nháp người khác | **Đã sửa** 2026-09-04; **đã đo 2026-09-05** với sidecar BGE-M3 thật (`verify-b27.sh` 9/9): bản nháp của người khác không còn trong kết quả |

### Sprint 1 — khung v2 và ba nhóm đọc thuần — **đã xong 2026-09-04**

[ADR-0009](../../04-technical/adr/0009-noi-dat-endpoint-v2.md) đã `ACCEPTED` và cài đặt. `/api/v2` đi từ **0 lên 6 endpoint**, tất cả đã đo trên bản chạy. Phát sinh: đo endpoint đầu tiên làm lộ [B-37](bug-triage.md#b-37-mọi-thông-điệp-lỗi-kiểm-tra-dữ-liệu-là-chuỗi-rỗng-trên-cả-hai-bề-mặt) — mọi thông điệp lỗi 400 của **cả v1 lẫn v2** là chuỗi rỗng, và đã hỏng từ trước. Đã sửa cùng đợt.

1. **Khung.** `apps/api/V2/` với `V2ControllerBase` riêng, không kế thừa `V1ControllerBase` và không dùng lại `V1Mappers`. Tách tài liệu OpenAPI: document hiện tên `v2` đang chứa toàn đường v1 — đổi thành `v1`, thêm `v2` thật. Đây cũng là mục nhỏ mà [B-01](bug-triage.md#b-01-apiv2-được-quảng-cáo-nhưng-chưa-có-endpoint-nào) đề nghị làm ngay bất kể lịch xây v2.
2. **Hai test ở cổng done của ADR-0009** — cấm tham chiếu chéo `V2/` ↔ `V1Compat/`, và đếm đường dẫn trong `openapi/v2.json`. Chúng phải có mặt **trước** endpoint thứ hai, không phải sau nhóm cuối.
3. **Ba nhóm `GET`:** tra cứu kiểm toán, ảnh chụp chính sách, vòng ghép cặp. Sáu phương thức dịch vụ, đã có sẵn.

Sản phẩm: `/api/v2` đi từ 0 endpoint sang có thật, và quyết định đặt endpoint được kiểm chứng bằng mã chạy được.

### Sprint 2 — vá hồi quy admin — **đã xong 2026-09-04**

Chín mục đã sửa trên cả ba repo; ba repo đều `tsc --noEmit` sạch và `npm run build` xanh. **B-02 vẫn mở** — nó chờ [ADR-0005](../../04-technical/adr/0005-xoa-nguoi-dung-nghia-la-gi.md), và giờ đã an toàn để chờ: ràng buộc thứ tự đã được gỡ đúng chiều.

**Thứ tự trong sprint này là bắt buộc:** B-26 trước B-02. Nút "Khoá tài khoản" đang gọi lệnh *xoá*; hôm nay vô hại vì lệnh đó trả 405. Sửa B-02 trước sẽ biến nút khoá thành nút xoá. B-02 còn chờ [ADR-0005](../../04-technical/adr/0005-xoa-nguoi-dung-nghia-la-gi.md); B-26 thì không — một nút mang nhãn khoá gọi đúng lệnh khoá không phải là quyết định sản phẩm.

Rồi [B-25](bug-triage.md#b-25-tạo-người-dùng-trong-admin-luôn-thất-bại-và-đó-là-đường-duy-nhất-tạo-tài-khoản-quản-trị) (hộp thoại tạo người dùng thiếu ô mật khẩu — đường duy nhất tạo tài khoản quản trị), rồi rà [B-05](bug-triage.md#b-05-bốn-thay-đổi-hành-vi-chưa-tới-được-frontend) trên ba client.

Gom luôn nhóm rẻ và không chặn: [B-14](bug-triage.md#b-14-ba-envexample-vẫn-trỏ-cổng-nestjs-cũ), [B-21](bug-triage.md#b-21-năm-nút-kêu-gọi-trên-trang-giới-thiệu-trỏ-về-hệ-nacentwin-cũ), [B-22](bug-triage.md#b-22-trang-giới-thiệu-có-thể-trắng-khi-tác-giả-câu-chuyện-không-tra-được), [B-11](bug-triage.md#b-11-đích-đến-sau-đăng-nhập-bị-ghi-lại-nhưng-không-được-dùng), [B-18](bug-triage.md#b-18-lớp-bảo-vệ-của-admin-không-kiểm-vai-trò).

Kèm một việc phát sinh từ sprint 0: kiểu `StoryAuthor` của trang giới thiệu khai `role` là bắt buộc, nhưng sau khi sửa B-19 trường đó không còn trong payload công khai. Runtime không hỏng vì không thành phần nào đọc nó, nhưng kiểu đang mô tả sai máy chủ — sửa cùng B-22, hai thứ ở cùng một tệp.

**Đã làm:** B-26 (trước B-02, đúng thứ tự) · B-25 · B-05 (rà cả bốn) · B-09 · B-10 lựa chọn (a) · B-14 · B-11 · B-18 · B-21 · B-22, cộng kiểu `StoryAuthor`.

**Ba thứ lộ ra khi làm, không mục nào dự đoán trước:**

1. [B-39](bug-triage.md#b-39-không-đường-nào-trong-hệ-thống-tạo-được-tài-khoản-quản-trị) — `Person.Register` cứng hoá `PlatformRoles.User`, nên **không đường nào tạo được tài khoản quản trị**. B-25 mô tả ngược chiều: nó gọi đường này là "đường duy nhất tạo tài khoản quản trị", trong khi đường này không tạo được. Cần quyết định sản phẩm.
2. [B-38](bug-triage.md#b-38-bộ-lọc-trạng-thái-và-trạng-thái-hiển-thị-dùng-chung-một-kiểu-và-ô-chọn-phát-ra-giá-trị-ngoài-kiểu-đó) — `npm run typecheck` của bảng quản trị **đang fail từ trước sprint 2**. Đã vá giữ nguyên hành vi; phần tách hai bộ từ vựng còn lại.
3. `tsconfig.json` của trang giới thiệu đặt `"strict": false`. Sửa kiểu ở repo đó không khiến trình biên dịch bắt được gì — đó là lý do B-22 tồn tại được, và lý do bản vá phải sửa thẳng chỗ đọc dữ liệu. Bật `strict` cho repo đó là việc riêng, đáng làm.

### Sprint 3 — nền client v2 — **đã xong 2026-09-04**

[ADR-0004](../../04-technical/adr/0004-sinh-khoa-chong-lap-o-client.md) đã `ACCEPTED` và cài đặt ở cả hai client có lệnh ghi. Ba cơ chế đi cùng nhau, và cả ba nằm trong bộ chặn HTTP chứ không ở màn hình.

Hai repo client trước đó **không có framework test nào** — `npm test` không tồn tại dù `CLAUDE.md` của chúng nói có. Đã thêm `vitest` (bản 3.x; bản 5 đòi `vite ≥ 6.4` còn hai repo ở 6.3.5) và **19 bài mỗi repo**, tất cả xanh.

- Khoá chống lặp ở client — xem [Quyết định 2](#quyết-định-2--quy-tắc-sinh-khoá-chống-lặp)
- `If-Match` / giữ số `version`
- Bộ dịch problem details: trường hiển thị đổi từ `message` sang **`detail`**
- Cộng thêm: nhánh xử lý 410 và đọc header `Sunset` — cùng chỗ trong bộ chặn HTTP, và đồng hồ đã chạy
- [B-08](bug-triage.md#b-08-thông-điệp-lỗi-nhiều-trường-là-mảng-client-đối-xử-như-chuỗi), [B-12](bug-triage.md#b-12-cổng-người-dùng-không-xử-lý-401), [B-09](bug-triage.md#b-09-cookie-sống-7-ngày-token-sống-24-giờ) thuộc đúng bộ chặn này — sửa cùng lượt, không tách

**Đã đo trên bản chạy:** `/api/v1` trả `Deprecation: true`, `Sunset: Wed, 31 Mar 2027 00:00:00 GMT`, `Link: </api/v2>; rel="successor-version"`; `/api/v2` không gửi cái nào. Bật `Api:V1CompatEnabled=false` để mô phỏng ngày dừng: `/api/v1` → **410**, `/api/v2` vẫn phục vụ. `POST /api/v1/auth/login` với hai trường sai trả `message` là **mảng** — đúng B-08, và bộ dịch nối lại thành một câu.

**Hai thứ lộ ra khi làm:**

1. [B-40](bug-triage.md#b-40-if-match-và-etag-được-quảng-cáo-nhưng-máy-chủ-không-đọc-không-phát) — **máy chủ không đọc header `If-Match` ở đâu cả**, và không chỗ nào phát `ETag`; cấu hình CORS thì có mở `ETag` cho một header không bao giờ được gửi. Cơ chế phiên bản thật chạy qua `expectedVersion` trong **thân** request. Đây là loại khiếm khuyết nguy hiểm hơn một tính năng thiếu: client gửi header đúng luật sẽ tin rằng mình được bảo vệ. Cần quyết định giữa cài đặt cho đủ hợp đồng, hay bỏ header khỏi đặc tả.
2. Bộ chặn cũ của cổng người dùng làm nhánh xử lý phản hồi lỗi trong `apiFetch` thành **mã chết** — `axios.isAxiosError` không bao giờ đúng sau khi lỗi bị thay bằng một `Error` trần. Sửa B-12 cũng sửa luôn chỗ đó.

**Chưa kiểm được:** luật 5 của ADR-0004 (phát lại được đối xử như thành công) cần một lệnh **ghi** trên `/api/v2`, mà sprint 1 chỉ mở endpoint `GET`. Nó đo được ở sprint 5.

### Sprint 4–7

4. ~~**Màn hình cho ba nhóm đã mở ở sprint 1**~~ — **màn hình nhật ký kiểm toán đã xong 2026-09-04**. Ràng buộc thứ tự đã tôn trọng: [B-29](bug-triage.md#b-29-tài-liệu-bị-loại-khỏi-danh-sách-không-sinh-dòng-kiểm-toán-từ-chối) và [B-30](bug-triage.md#b-30-việc-cắt-dữ-liệu-thiết-bị-hết-hạn-chưa-bao-giờ-chạy) làm **trước**, cộng [B-24](bug-triage.md#b-24-chú-thích-trong-mã-nói-kiểm-toán-ghi-cùng-giao-dịch-thực-tế-thì-không). ~~Còn lại: màn hình [ảnh chụp chính sách](moi/anh-chup-chinh-sach.md) và [vòng ghép cặp](moi/vong-ghep-cap.md).~~ — **cả hai xong 2026-09-05**, xem mục sprint 4 (phần còn lại) dưới.
5. ~~**Hồ sơ vụ việc**: `/api/v2/cases/*` + [console](moi/console-ho-so-vu-viec.md). Cần ADR-0008.~~ — **API xong sprint 5, console xong 2026-09-05.** Đối chiếu với [`portal/phong-thuong-thao.md`](portal/phong-thuong-thao.md) — `deal-room` là vỏ đã thiết kế xong của đúng thứ này; console ở bảng quản trị chưa hợp nhất với nó, đó là việc còn lại.
6. **Cấp quyền đọc + phòng dữ liệu** ([moi/phong-du-lieu-va-cap-quyen.md](moi/phong-du-lieu-va-cap-quyen.md)), cần ADR-0007. **Môi giới** + hợp nhất hai đường gán ([moi/phan-cong-moi-gioi.md](moi/phan-cong-moi-gioi.md)).
7. **Cổng chất lượng** — không phải "mở cửa cho tầng dịch vụ đã có" như các sprint trên, mà là **xây từ domain**: ma trận chuyển mức chất lượng, bất biến, test, rồi mới tới endpoint và [màn hình](moi/cong-chat-luong-cong-nghe.md). Xem [B-36](bug-triage.md#b-36-cổng-chất-lượng-được-liệt-kê-là-đã-có-tầng-dịch-vụ-nhưng-không-có-mã-nào-nâng-được-mức). Cần Elasticsearch và sidecar nhúng ở cổng 8003 — cùng thứ đang chặn phép đo của B-27.

### Sprint 4 — nhật ký kiểm toán — **màn hình đầu tiên đã xong 2026-09-04**

Ràng buộc thứ tự được tôn trọng đúng chiều: hai lỗ của nhật ký lấp **trước**, màn hình dựng **sau**.

**Backend, ba mục:**

- [B-29](bug-triage.md#b-29-tài-liệu-bị-loại-khỏi-danh-sách-không-sinh-dòng-kiểm-toán-từ-chối) — lượt bị loại khỏi danh sách nay để lại **một dòng tổng hợp**, không phải một dòng cho mỗi tài liệu.
- [B-30](bug-triage.md#b-30-việc-cắt-dữ-liệu-thiết-bị-hết-hạn-chưa-bao-giờ-chạy) — ba mảnh nay đủ: bộ chạy nền (đã có), xử lý `RETENTION_REVIEW` (mới), và thứ xếp lịch đầu tiên (mới). Hai con số thời hạn lưu nay tồn tại trong cấu hình.
- [B-24](bug-triage.md#b-24-chú-thích-trong-mã-nói-kiểm-toán-ghi-cùng-giao-dịch-thực-tế-thì-không) — hai chú thích nói sai về ranh giới giao dịch đã sửa.

**Hai năng lực API bổ sung**, cả hai do chính đặc tả màn hình nêu là đang chặn:

- **Lọc theo khoảng thời gian** (`from`/`to`) — đặc tả gọi nó là "khoảng trống nghiêm trọng nhất", vì mọi câu hỏi kiểm toán thật đều có dạng *"trong tháng vừa rồi"*.
- **`deviceDataRetainedFrom`** — mốc cho phép giao diện phân biệt *ba* trạng thái mà một ô IP rỗng đang gộp làm một: có giá trị · đã hết hạn và bị cắt · chưa từng ghi.

**Màn hình** ([`moi/nhat-ky-kiem-toan.md`](moi/nhat-ky-kiem-toan.md)), theo đúng bảy bước của [HUONG-DAN-TRIEN-KHAI.md](HUONG-DAN-TRIEN-KHAI.md#thêm-một-màn-hình-mới-vào-bảng-quản-trị): mở ra **rỗng** chứ không tự đổ nhật ký ra màn hình; sáu ô lọc **nằm trong URL**; nút "Xem các lượt bị từ chối" là nút riêng chứ không chôn trong ô chọn; kết quả `ALLOW`/`DENY` có nhãn chữ chứ không chỉ màu; mã quy tắc tách phần phiên bản; kết quả rỗng liệt kê bộ lọc đang áp; dải thường trực nói nhật ký chỉ-ghi-thêm và **không ghi mọi thứ**.

**Chưa làm, và nói rõ vì sao:**

- **Đổi mã người thao tác thành tên** — cần `POST /api/v2/people:resolve` và một quyết định sản phẩm về *ai được phép biết tên*, vốn **không cùng** một quyết định với *ai được đọc nhật ký*. Màn hình hiện mã rút gọn.
- **Lọc theo hành động, theo mã quy tắc, theo mã tương quan** — ba năng lực API chưa có. Cái cuối là thứ bộ phận hỗ trợ cần khi người dùng đọc cho họ một mã lỗi.
- **Xuất dữ liệu** — tạo một bản sao nhật ký nằm ngoài hệ thống, và bản sao đó không còn chỉ-ghi-thêm. Cần quyết định riêng.
- **Câu giải thích tiếng Việt cho từng mã quy tắc** — không phải dịch mà là viết mới; dữ liệu không kèm câu nào.

### Sprint 4 (phần còn lại) và console hồ sơ vụ việc — **2026-09-05**

Ba màn hình, mỗi màn hình theo đúng bảy bước của [HUONG-DAN-TRIEN-KHAI.md](HUONG-DAN-TRIEN-KHAI.md#thêm-một-màn-hình-mới-vào-bảng-quản-trị), và **định danh nằm trong đường dẫn** — ba màn hình đầu tiên của bảng quản trị làm đúng điều [`nen-tang/dieu-huong-va-url.md`](nen-tang/dieu-huong-va-url.md) đòi:

- **Console hồ sơ vụ việc** ([`moi/console-ho-so-vu-viec.md`](moi/console-ho-so-vu-viec.md)) — `/cases` với ba bộ lọc trong URL, `/cases/:id`. Thanh giai đoạn **chỉ cho bấm đích đi tới được** (ma trận chép từ `TransitionMatrix`, có test so hình dạng); hộp thoại chọn sẵn loại quyết định (ô chọn chỉ tồn tại khi có hai lựa chọn), nút Xác nhận tắt tới khi có diễn giải, Ctrl+Enter gửi, Enter xuống dòng, Escape hỏi trước khi bỏ diễn giải; **409 tải lại và giữ diễn giải**, hiện giai đoạn cũ → mới; 422 hiện câu nói phải làm gì tiếp kèm nút gỡ khoá / gán môi giới ngay trong hộp thoại; 403 tắt hẳn nút gửi. Khoá tạm là **danh sách từng khoá** với nút gỡ từng cái — lỗ hổng hợp đồng mà đặc tả nói phải lấp trước khi xây đã lấp bằng trường `holds` trên hồ sơ. Dòng thời gian vẽ gỡ khoá như ghi chú có người ký, không phải mũi tên.
- **Ảnh chụp chính sách** ([`moi/anh-chup-chinh-sach.md`](moi/anh-chup-chinh-sach.md)) — `/policy-snapshots/:id`. Tuyến, hai phiên bản, thời điểm chốt, còn hiện hành hay đã bị thay (so với `policySnapshotId` của hồ sơ — endpoint ảnh chụp không có chiều "bị thay bởi"); bảy nhóm cổng và **năm giai đoạn nói rõ "không đặt cổng"**; dải cảnh báo cổng là **luật đã ghi, chưa thi hành**; hash kèm mã chuẩn hoá `JCS-1`, nút chép bản chuẩn hoá, và **không** tự tuyên bố đã kiểm toàn vẹn.
- **Vòng ghép cặp** ([`moi/vong-ghep-cap.md`](moi/vong-ghep-cap.md)) — `/match-rounds/:kind/:id`, đúng phần API đã có: vòng mới nhất với bốn thông tin, **204 = chưa từng tính** phân biệt với 0 ứng viên, vòng nhập từ hệ cũ đánh dấu rõ, điểm thô không vẽ chung trục. ~~Trang so sánh chưa dựng~~ — **dựng cùng ngày, đợt bổ sung dưới.**

**Đợt bổ sung cùng ngày** — hai thứ đợt trên để ngoài phạm vi vì thiếu API, nay mở API rồi dựng nốt:

- **Lịch sử và so sánh vòng ghép cặp**: ba phương thức dịch vụ mới (`ListRoundsAsync`, `GetRoundAsync`, `ListRoundCandidatesAsync`) và ba đường đọc (`GET .../match-rounds`, `GET /api/v2/match-rounds/{roundId}`, `.../candidates`); `MatchRoundDto` thêm `queryText`, `isAuthoritative`. Màn hình: danh sách vòng với **bộ lọc trong URL**, chi tiết một vòng, trang so sánh — kết luận từ ba trục siêu dữ liệu, bảng hợp nhất chỉ A / cả hai / chỉ B, **điểm chỉ trừ cho nhau khi cùng chế độ**, một bên nhập từ hệ cũ thì "không kết luận được". Hai luật đó là hàm thuần có test (`matchRoundService.test.ts`, 7 bài).
- **Cảnh báo đề bài có bản mới hơn** trên console: `GET /api/v2/demand-briefs/{id}` mở (một đường, chỉ đề bài), console so `currentVersionNo` với phiên bản hồ sơ ghim; không đọc được đề bài thì nói "không so được", không im lặng.
- Đo: backend `MatchRoundHistoryTests` (114/114 lúc đó); trình duyệt `verification/anh-chup/ui-rounds.mjs` **21/21, 0 lỗi console** — vòng chèn thẳng vào PostgreSQL vì máy không có sidecar nhúng, nên đây là phép đo màn hình và API đọc, không phải thuật toán (B-27 vẫn chờ sidecar). Lộ ra [B-44](bug-triage.md#b-44-sửa-intake-v1-bằng-thân-json-trả-200-mà-không-đổi-gì).

Cùng đợt: bốn mục lỗi đóng — [B-35](bug-triage.md#b-35-danh-sách-intake-ẩn-danh-trả-bản-nháp-của-mọi-người) (gỡ đường), [B-38](bug-triage.md#b-38-bộ-lọc-trạng-thái-và-trạng-thái-hiển-thị-dùng-chung-một-kiểu-và-ô-chọn-phát-ra-giá-trị-ngoài-kiểu-đó), [B-41](bug-triage.md#b-41-corsorigins-khai-localhost-nên-mở-bằng-127001-là-hỏng-im-lặng), [B-42](bug-triage.md#b-42-người-giữ-hai-vai-trò-trong-một-hồ-sơ-bị-chấm-theo-vai-trò-đầu-tiên-không-theo-vai-trò-cho-phép) (có test đỏ/xanh). Đo trên trình duyệt: `verification/anh-chup/ui-cases.mjs` — **37 phép kiểm, 37 đạt**; lỗi console duy nhất là dòng 409 mà kịch bản cố ý gây ra.

### Gỡ Elasticsearch — chỉ mục tìm kiếm trong PostgreSQL — **2026-09-05**

Đội xác nhận Elasticsearch đã bỏ; kho chưa ghi, mã vẫn trỏ vào nó. [ADR-0010](../../04-technical/adr/0010-bo-elasticsearch-chi-muc-trong-postgresql.md) ghi quyết định và cài đặt:

- `PostgresSearchIndex` thay `ElasticsearchIndex` sau cùng hợp đồng `ISearchIndex`; bảng chiếu `matching.search_chunks` (migration SQL thuần, không đổi model EF): `vector(1024)` + HNSW cosine, `tsvector` sinh sẵn qua `unaccent` với tiêu đề nặng gấp đôi đoạn, cột lọc cứng. Ghi chiếu **cùng giao dịch** với `content_chunks`.
- Hai chế độ giữ hợp đồng: kiểu cũ cộng cosine + `ts_rank_cd` và lọc sau top-K; đã sửa lọc trước, hai kênh, RRF. Nhãn engine mới `postgres-16/pgvector-legacy|rrf`; hai nhãn Elasticsearch thành lịch sử.
- Hạ tầng: ảnh Postgres `pgvector/pgvector:pg16` ở compose và fixture test; dịch vụ `elasticsearch` gỡ khỏi compose; `ElasticsearchUrl`/`IndexName` gỡ khỏi cấu hình. Không gói NuGet mới.
- Đo: `PostgresSearchIndexTests` (3 bài, **117/117** toàn bộ) — chế độ đã sửa lọc bản nháp và bản của chính mình **trước** thu hồi, chế độ cũ không lọc; **"cong nghe sinh hoc" khớp "công nghệ sinh học"** chỉ bằng kênh từ khoá (ca §26.6.1 mà baseline Elasticsearch trượt); lọc lĩnh vực và ghi đè theo khoá đoạn. Cơ sở dữ liệu phát triển đã chuyển sang ảnh pgvector và chạy migration (giữ nguyên dữ liệu).
- Lộ ra [B-45](bug-triage.md#b-45-ngưỡng-điểm-ghép-cặp-đặt-theo-thang-cũ-loại-mọi-kết-quả-ở-chế-độ-đã-sửa): `MatchMinScore = 1.0` loại mọi kết quả RRF (≤ 0,033) — lỗi có từ trước, cần quyết định ngưỡng theo chế độ.
- **Đợt cùng ngày, đóng ba câu hỏi mở của ADR**: job dựng lại chỉ mục từ `content_chunks` (`RebuildSearchIndexJob`, enqueue sau ETL, không gọi sidecar); **kênh sparse** (`Matching:UseSparse`, cột `sparsevec(250002)`, RRF ba kênh, nhãn engine `postgres-16/pgvector-rrf3`); **B-45 sửa** (`MatchMinScoreCorrected`). Thêm `FakeEmbeddingClient` trong test-kit → `MatchingPipelineTests` (3 bài; **120/120** toàn bộ). Sidecar thật dựng được từ ảnh `dmst-rag:pinned` + volume model có sẵn; `verify-b27.sh` **9/9** trên mô hình thật — B-27 đo được lần đầu, kênh sparse có dữ liệu, không dấu vẫn tìm thấy.
- **Đợt ba cùng ngày — §26.6.6, rerank, cửa ghi v2**: kênh từ khoá chuyển sang cụm âm tiết (`phraseto_tsquery`), **hai trường** có dấu / không dấu, **kênh exact/trigram** thứ tư cho số hiệu và tên tổ chức, chuẩn hoá tiếng Việt (NFC + một kiểu đặt dấu) ở cả hai chiều; **cross-encoder rerank** (`/rerank` ở sidecar, `Matching:UseRerank`, nhãn engine `-rerank`); `POST .../match-rounds` và `.../index-jobs` (202, 403 kèm ruleId, 422, 428). Đo: `SearchPassFailCasesTests` 7 + `VietnameseTextTests` 12 (**140/140** toàn bộ); trên mô hình thật `verify-search-cases.mjs` **10/10** (tám ca §26.6.6 kể cả đoạn mức 3 không rò), `ui-rounds-real.mjs` **12/12** (vòng thật đầu tiên, VGC-08 qua giao diện). Lộ ra và sửa [B-46](bug-triage.md#b-46-vòng-mới-nhất-báo-0-ứng-viên-dù-có-10).
- Còn lại của nhóm ghép cặp: **chỉ §26.6.5** — golden set ≥ 200 truy vấn thật do broker chấm; không tự nghĩ ra được, `search_query_log` đang ghi để dựng.

### Sprint 5 — ghi có điều kiện và hồ sơ vụ việc (phần đọc + tạo) — **2026-09-04**

[B-40](bug-triage.md#b-40-if-match-và-etag-được-quảng-cáo-nhưng-máy-chủ-không-đọc-không-phát) đã sửa theo **lựa chọn (a)**: cài đặt cho đủ hợp đồng, không bỏ header khỏi đặc tả.

Bốn endpoint mới, tất cả đều **không chạm ADR-0008** — bộ loại quyết định chỉ liên quan tới *chuyển giai đoạn*:

| Endpoint | Đo được |
|---|---|
| `POST /api/v2/cases` | Thiếu khoá → **428** · lần đầu → **201** kèm `ETag: "0"` · cùng khoá cùng thân → **201 + `Idempotent-Replayed: true`**, cùng `caseId`, **1 hàng trong CSDL** · cùng khoá khác thân → **422** |
| `GET /api/v2/cases` | 200, hình dạng phân trang v2 |
| `GET /api/v2/cases/{id}` | 200 kèm `ETag: "0"` khớp `version` trong thân; id lạ → 404; không token → 401 |
| `GET /api/v2/cases/{id}/timeline` | 200 |

**Khoảng trống của sprint 3 đã đóng.** Luật 5 của [ADR-0004](../../04-technical/adr/0004-sinh-khoa-chong-lap-o-client.md) — *phát lại được đối xử như thành công* — trước đó **chưa kiểm được** vì `/api/v2` chỉ có endpoint `GET` và khoá chống lặp không áp cho lệnh đọc. Nay đo được, và nó chạy đúng: lần gửi thứ hai trả lại đúng phản hồi cũ thay vì tạo hồ sơ thứ hai.

**Bốn lệnh ghi còn lại đã làm ngày 2026-09-05**, sau khi ADR-0008 chốt: `transition`, `lead-broker`, `holds`, `holds/{id}/release`. Vòng đời đầy đủ đo qua HTTP — xem `verification/anh-chup/verify-case-writes.sh`. Số phiên bản là **bắt buộc** ở `transition` và `lead-broker`; `If-Match: *` bị từ chối có chủ ý ở hai lệnh đó với thông điệp nói rõ vì sao. Cùng lượt lộ ra [B-42](bug-triage.md#b-42-người-giữ-hai-vai-trò-trong-một-hồ-sơ-bị-chấm-theo-vai-trò-đầu-tiên-không-theo-vai-trò-cho-phép).

~~**Ba lệnh ghi còn lại của nhóm chưa làm, và không phải vì thiếu thời gian:**~~ chuyển giai đoạn bắt buộc mang một loại quyết định, mà bộ bốn loại hiện có không có loại nào ứng với *rút lui* hay *huỷ*. Theo luật đang chạy, người dùng phải chọn "Chấp thuận" để rút lui một hồ sơ, và bản ghi quyết định là dữ liệu chỉ-ghi-thêm nên dòng thời gian sẽ đọc sai nghĩa mãi về sau. Đó là **ADR-0008**, và nó rẻ nhất **bây giờ**.

### Cái gì chặn cái gì

| Quyết định | Chặn | Rẻ nhất khi nào |
|---|---|---|
| [ADR-0009](../../04-technical/adr/0009-noi-dat-endpoint-v2.md) — nơi đặt endpoint v2 | **sprint 1, và mọi thứ sau nó** | bây giờ — 0 endpoint đã viết |
| [ADR-0004](../../04-technical/adr/0004-sinh-khoa-chong-lap-o-client.md) — khoá chống lặp | sprint 3, và mọi lệnh ghi v2 | trước màn hình v2 đầu tiên |
| [ADR-0005](../../04-technical/adr/0005-xoa-nguoi-dung-nghia-la-gi.md) — "xoá người dùng" | chỉ B-02 trong sprint 2 | bất cứ lúc nào |
| [ADR-0006](../../04-technical/adr/0006-kiem-toan-o-duong-thanh-cong.md) — kiểm toán đường thành công | sprint 4 | **càng sớm càng đỡ mất** — dữ liệu của hôm qua không lấp ngược được |
| [ADR-0007](../../04-technical/adr/0007-muc-mat-internal.md) — mức mật `Internal` | sprint 6 | **bây giờ** — chưa có dữ liệu nào mang giá trị đó |
| [ADR-0008](../../04-technical/adr/0008-loai-quyet-dinh-cho-rut-lui-va-huy.md) — rút lui và huỷ | sprint 5 | **bây giờ** — cùng lý do |
| [ADR-0010](../../04-technical/adr/0010-bo-elasticsearch-chi-muc-trong-postgresql.md) — gỡ Elasticsearch, chỉ mục trong PostgreSQL | **đã cài đặt 2026-09-05** | đội chốt bỏ Elasticsearch; mã vẫn trỏ vào nó cho tới ADR này |

## Quyết định phải ra trước khi code

Đặc tả cố tình để ngỏ những chỗ này. Người viết mã không tự quyết được.

**Bảy ADR đã được viết**, trong `docs/04-technical/adr/` cùng chỗ với `0001` và `0002`. **Cả bảy đã `ACCEPTED` và cài đặt** tính đến 2026-09-05:

| ADR | Về việc | Chặn |
|---|---|---|
| [0003](../../04-technical/adr/0003-khoa-do-ung-dung-sinh.md) | Khoá do ứng dụng sinh phải khai `ValueGeneratedNever` | ~~Sprint 0~~ — **ACCEPTED, đã cài đặt** 2026-09-04 |
| [0009](../../04-technical/adr/0009-noi-dat-endpoint-v2.md) | **Nơi đặt endpoint `/api/v2`** | **Sprint 1, và mọi việc backend sau nó** |
| [0004](../../04-technical/adr/0004-sinh-khoa-chong-lap-o-client.md) | Quy tắc sinh khoá chống lặp ở client | ~~Sprint 3~~ — **ACCEPTED, đã cài đặt** 2026-09-04 |
| [0005](../../04-technical/adr/0005-xoa-nguoi-dung-nghia-la-gi.md) | "Xoá người dùng" nghĩa là gì | ~~Chỉ B-02~~ — **ACCEPTED** 2026-09-05: không có "xoá", vô hiệu hoá là thao tác cuối; B-02 đóng "không xây" |
| [0006](../../04-technical/adr/0006-kiem-toan-o-duong-thanh-cong.md) | Kiểm toán ghi gì ở đường thành công | ~~Nội dung nhật ký~~ — **ACCEPTED, đã cài đặt** 2026-09-05: `SUCCESS` sau commit; tra nhật ký tự ghi; sự kiện lưu vĩnh viễn tới khi có ADR riêng |
| [0007](../../04-technical/adr/0007-muc-mat-internal.md) | Mức mật `Internal` | ~~Sprint 6~~ — **ACCEPTED, đã cài đặt** 2026-09-05: bỏ khỏi mô hình |
| [0008](../../04-technical/adr/0008-loai-quyet-dinh-cho-rut-lui-va-huy.md) | Loại quyết định cho rút lui và huỷ | ~~Sprint 5~~ — **ACCEPTED, đã cài đặt** 2026-09-04 |

Không ADR nào còn `PROPOSED`. Mỗi ADR có mục **Quyết định** với lý do xếp theo sức nặng, mục **Cổng done**, và mục **Đã cài đặt** ghi kết quả chứng minh test bắt được lỗi (tắt bản vá → đỏ đúng bài → bật lại → xanh). Ba ADR bị nghiêng bởi bằng chứng đo được mà bản đề xuất chưa có: 0005 (24 cột tham chiếu, 0 khoá ngoại), 0006 (từ vựng `PERMIT`/`ALLOW` lệch ba tầng), 0007 (bảng quyết định không có luật cho `INTERNAL`).

**0009 là thứ chặn nhiều nhất hôm nay** — nó đứng giữa hôm nay và sáu năng lực đang vô hình, và nó rẻ nhất ngay lúc này vì chưa endpoint v2 nào được viết.

~~Hai ADR có **cửa sổ rẻ nhất là bây giờ**: 0007 và 0008~~ — cả hai đã chốt và cài đặt **trong cửa sổ đó**: 0008 ngày 2026-09-04 khi `decision_records` còn rỗng, 0007 ngày 2026-09-05 khi chưa hàng nào mang `Internal`. Không cuộc di trú nào phải xảy ra.

Tóm tắt từng quyết định ở dưới; chi tiết và bằng chứng ở chính ADR.

### Quyết định 1 — sửa B-32 thế nào

**Đây là quyết định kỹ thuật, và bằng chứng chỉ về một hướng.**

`Entity.Id` được gán ngay ở khai báo: `public Guid Id { get; protected set; } = Guid.CreateVersion7();`. Không cấu hình nào nói với EF rằng khoá do ứng dụng sinh, nên EF để mặc định `ValueGenerated.OnAdd` cho khoá Guid. Khi một hàng con mới ra đời với khoá **khác giá trị mặc định**, bộ theo dõi thay đổi xếp nó vào nhóm "đã tồn tại" và phát ra `UPDATE ... WHERE id = <khoá mới>` — không hàng nào khớp, và lỗi nổi lên dưới dạng lệch phiên bản.

Điểm quan trọng: **đây là lỗi toàn cục, không riêng module technology.** Cùng hình dạng ở `demand_brief_versions`, `document_versions`, `case_parties`, `case_holds`, `decision_records`, `assignments`, `access_grants`, `match_candidates`. Lệnh tạo mới không hỏng vì khi đó cả đồ thị là mới, nên trạng thái "thêm mới" lan xuống hàng con.

Hướng đề xuất: đặt `ValueGeneratedNever()` cho khoá của **mọi** kiểu kế thừa `Entity`, bằng một quy ước toàn cục. Chỗ đặt tự nhiên là `NacenTechDbContext.ApplyAggregateConventions` — nhưng lưu ý nó hiện chỉ duyệt các lớp kế thừa `AggregateRoot`; quy ước mới phải phủ cả `Entity`.

**Cổng done bắt buộc:** một test tích hợp **sửa-rồi-đọc-lại** cho cả đề bài và tài sản công nghệ. 44 test hiện tại đều xanh và không cái nào bắt được lỗi này, vì không test nào ghi một lần sửa xuống cơ sở dữ liệu rồi đọc lại. Không có test đó, cùng loại lỗi sẽ quay lại ở lần đổi ánh xạ tiếp theo.

### Quyết định 2 — quy tắc sinh khoá chống lặp

Phải chốt **trước** khi viết màn hình v2 đầu tiên, vì nó đổi cách viết nút gửi ở mọi biểu mẫu của ba client.

Luật: **một khoá cho mỗi lần bấm nút**, dùng lại đúng khoá đó cho mọi lần thử lại của cùng lần bấm. Sinh khoá mới ở mỗi lần thử lại làm mất hết ý nghĩa của cơ chế. Hai cái bẫy đã biết: khoá bị cắt còn 200 ký tự (hai khoá chỉ khác nhau ở phần đuôi bị coi là một), và phản hồi 4xx **có** được ghi lại để phát lại — nên gửi lại một lệnh từng bị 403 sẽ nhận lại đúng 403 kể cả khi quyền đã được cấp.

### Quyết định 3 — "xoá người dùng" nghĩa là gì

Chặn B-02, B-25, B-26. Mô hình dữ liệu **không có trạng thái đã xoá** cho người dùng — chỉ có cờ đang hoạt động. Ba lựa chọn: vô hiệu hoá vĩnh viễn, ẩn danh hoá, hay xoá thật. Rẻ nhất và nhất quán với phần còn lại: **bỏ nút xoá, thay bằng nút vô hiệu hoá**, vốn đã chạy được qua `PATCH`.

### Quyết định 4 — kiểm toán ghi gì ở đường thành công

Hiện cửa phân quyền chỉ ghi ở hai trường hợp: mọi lượt **bị từ chối**, và lượt được phép **đọc tài liệu mật**. Nghĩa là tạo hồ sơ, chuyển giai đoạn, giao việc, **cấp và thu hồi quyền đọc** đều không để lại dòng nào. Khoảng trống này không lấp ngược được — dữ liệu của hôm qua đã mất. Quyết định càng sớm càng đỡ mất.

### Quyết định 5 — mức mật `Internal`

Phép kiểm "có phải mật không" chỉ tính từ `Confidential` trở lên, nên `Internal` đi thẳng vào nhóm ai cũng đọc được, cùng với `Public`. Hôm nay chưa có đường nào tạo tài liệu mức này nên chưa lộ gì. Hai lựa chọn: đưa `Internal` vào nhóm cần kiểm quyền, hoặc bỏ nó khỏi mô hình. Một mức mật mà tên nói một đằng và hành vi nói một nẻo là thứ tệ hơn cả hai.

### Quyết định 6 — bốn loại quyết định của hồ sơ vụ việc

Không có loại nào tên là "rút lui" hay "huỷ". Chuyển sang `WITHDRAWN` hoặc `CANCELLED` là chuyển tiến, nên theo luật nó **bắt buộc mang `APPROVE` hoặc `WAIVE`** — người dùng phải chọn "Chấp thuận" để rút lui một hồ sơ, và dòng thời gian sẽ đọc sai nghĩa mãi về sau. Bản ghi quyết định là dữ liệu chỉ-ghi-thêm, nên sửa muộn không sửa được quá khứ.

## Cái bẫy khi dựng bề mặt

Ba thứ làm mất thời gian và triệu chứng đều trông giống "backend chết":

1. **Cả ba `.env.example` trỏ `localhost:3001`** — cổng NestJS cũ. Backend .NET ở **5000** (docker) hoặc **5199** (chạy tay). Với cổng người dùng, giá trị đó còn nằm trong **mã**, không chỉ trong tệp mẫu.
2. **`Cors:Origins` mặc định chỉ cho phép `5173` và `5174`.** Trang giới thiệu chạy ở cổng thứ ba — không thêm nó vào cấu hình thì mục câu chuyện biến mất, và đó **đúng là triệu chứng** mà `LANDING-01` đang đi tìm.
3. **`docker compose up -d postgres` fail** nếu chưa đặt `AUTH_SIGNING_KEY`, dù lệnh không liên quan tới service `api`. Compose nội suy cả tệp trước khi chọn service.

Cách dựng đầy đủ ở [`verification/README.md`](verification/README.md#cách-dựng-bề-mặt).

## Cái còn nợ, nói rõ để không ai tưởng đã xong

- ~~**Chưa mở màn hình nào trên trình duyệt.**~~ — **đã mở, 2026-09-04.** Lượt nghiệm thu đầu tiên trên Chromium thật chạy **17 phép kiểm, 17 đạt, 0 lỗi console** trên bảng quản trị: `/login`, `/audit-log`, `/users`, và hộp thoại tạo người dùng. Ảnh chụp màn hình có trong bản ghi của lượt.
  Bốn mục nghiệm thu chuyển từ `—` sang **pass**: `DNHAP-51`, `NDUNG-01`, `NDUNG-03`, `NDUNG-24`.
  **`NDUNG-03` là mục chỉ đo được qua giao diện** — máy chủ hoàn toàn khoẻ mạnh, cái sai nằm ở chỗ cái nút gọi lệnh nào. Bấm nút thật: bản ghi đếm được 1 hàng trước và sau (không bị xoá), `is_active` chuyển sang `f`. Không có phép đo nào bằng `curl` nói được điều đó.
  **Cổng người dùng đã mở, 2026-09-05: 8/8** — B-12 (phiên hết hạn) đo được lần đầu: token hỏng → `/login`, cookie xoá, không lặp vòng.
  **Trang giới thiệu đã mở, 2026-09-05: 9/9** (`ui-landing.mjs`) — LANDING-01 (mục câu chuyện hiện, tức CORS đúng cho origin thứ ba), B-21 (5 nút kêu gọi trỏ `PORTAL_URL`, 0 liên kết tới `twin.nacentech.vn`), và **B-22 đo được lần đầu**: một câu chuyện có `author_person_id` trỏ vào người không tồn tại → máy chủ trả `author: null` → thẻ vẫn hiện, **trang không trắng**, 0 lỗi runtime.
  **Ba màn hình mới của bảng quản trị: 37/37** (`ui-cases.mjs`). Phần lớn trong 1292 mục nghiệm thu vẫn chưa chạy.
- ~~**B-27 vẫn chưa đo được**~~ — **đã đo 2026-09-05**: sidecar `dmst-rag:pinned` chạy cục bộ với model đã cache, API ở chế độ đã sửa + sparse, `verify-b27.sh` 9/9. Không còn mục P1 nào của sprint 0 nợ phép đo. Bản vá đã vào mã (`PublishedOnly: true`) nhưng chỉ được kiểm bằng đọc mã và bằng bộ test, chưa bằng một lượt tìm kiếm thật. Đây là mục P1 còn nợ duy nhất của sprint 0.
- ~~**B-31 chưa quan sát được hậu quả**~~ — đã giải quyết: `LP-06` chạy ngày 2026-09-04, đúng cửa sổ bắt buộc (sau khi sửa B-32, trước khi phát hành). Nội dung mật còn nguyên.
- **Bốn thư mục mã nguồn không phải git repo.** Chân trang tài liệu vì thế trích ngày chụp thay vì SHA.

## Quy tắc giữ cho tài liệu không mục ruỗng

Nếu phiên sau sửa mã và tài liệu lệch đi:

- Sửa lỗi nào thì cập nhật **dòng đó trong `bug-triage.md`** cùng lúc, thêm dòng **Trạng thái** nói rõ đã sửa ở đâu.
- Sửa hành vi nào thì cập nhật tài liệu mô tả hành vi đó, và **chỉ tài liệu đó** — tài liệu khác liên kết tới nó, không chép lại.
- Chạy `python {đường dẫn skill}/references/check-links.py .` trước khi commit. Hiện là **2257 liên kết, 0 hỏng**; giữ nguyên con số 0. Cần `PYTHONIOENCODING=utf-8`, và xem cảnh báo về `NFKD` trong [HUONG-DAN-TRIEN-KHAI.md](HUONG-DAN-TRIEN-KHAI.md#trước-khi-mở-pr) — bản công cụ đang có trong máy bóc dấu tiếng Việt và báo nhầm 2221 liên kết hỏng.
- Đừng tạo sổ lỗi thứ hai. `bug-triage.md` là duy nhất.

Trạng thái ngày 2026-09-04, **sau sprint 0–5**: 59 tệp, 1292 mục nghiệm thu, 46 mục lỗi (15 cao / 19 trung bình / 12 thấp) trong đó **10 mục cao đã sửa, 1 mục cao đóng "không xây", và 10 mục trung bình/thấp đã sửa**; ba mục mới tìm ra trong lúc sửa ([B-35](bug-triage.md#b-35-danh-sách-intake-ẩn-danh-trả-bản-nháp-của-mọi-người), [B-38](bug-triage.md#b-38-bộ-lọc-trạng-thái-và-trạng-thái-hiển-thị-dùng-chung-một-kiểu-và-ô-chọn-phát-ra-giá-trị-ngoài-kiểu-đó), [B-39](bug-triage.md#b-39-không-đường-nào-trong-hệ-thống-tạo-được-tài-khoản-quản-trị) chưa sửa; [B-37](bug-triage.md#b-37-mọi-thông-điệp-lỗi-kiểm-tra-dữ-liệu-là-chuỗi-rỗng-trên-cả-hai-bề-mặt) đã sửa), 0 liên kết hỏng. Backend: **106/106** test xanh (trước sprint 0 là 44/44), `dotnet build NacenTech.slnx -m:1` sạch, `/api/v2` có **14 endpoint**. Trình duyệt thật: bảng quản trị **17/17**, cổng người dùng **8/8**.

Bốn thư mục mã nguồn vẫn không phải git repo, nên bản sửa của sprint 0 chưa nằm trong commit nào — đó là việc đầu tiên nên làm trước khi có người thứ hai chạm vào mã.
