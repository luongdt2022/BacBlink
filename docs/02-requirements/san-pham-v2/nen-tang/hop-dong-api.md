# Hợp đồng API

Tài liệu này sở hữu các con số và quy tắc mà mọi màn hình dựa vào khi nói chuyện với máy chủ: đường dẫn nào tồn tại, danh sách trả về hình gì, lỗi trông thế nào, và ba cơ chế mà API v2 sẽ bắt buộc. Tài liệu khác liên kết tới đây thay vì nhắc lại.

## Tóm tắt

Backend .NET phục vụ **đúng một** bộ đường dẫn cho ứng dụng: `/api/v1/*`, gọi là *facade v1*. Nó tái tạo hình dạng JSON, mã lỗi và mã trạng thái của NacenTwin/NestJS để ba frontend không phải sửa gì tại thời điểm cutover. Ngoài ra có `/health`, `/health/ready`, và `/files/{key}` để tải tệp về.

Kiến trúc đích quy định một bộ thứ hai, `/api/v2/*`, với hình dạng lỗi khác, khoá chống lặp bắt buộc và kiểm tra phiên bản lạc quan. Ba middleware trong mã đã chuẩn bị sẵn cho nó. **Nó chưa có endpoint nào.**

## Cái đang có

Đo trên bản chạy ngày 2026-09-04 bằng `GET /openapi/v2.json`:

| Nhóm đường dẫn | Số lượng |
|---|---|
| `/api/v1/*` | 74 |
| `/health`, `/health/ready` | 2 |
| `/api/v2/*` | **0** |

Tài liệu OpenAPI mang tên "NacenTech.Api | v2" nhưng bên trong không có đường dẫn v2 nào. Probe trực tiếp `/api/v2/cases`, `/api/v2/audit-events`, `/api/v2/brokers`, `/api/v2/data-room/documents`, `/api/v2/policy-snapshots` đều trả 404.

Toàn bộ 74 đường dẫn v1 nằm trong 13 tệp controller ở `apps/api/V1Compat/`. Không module nào trong `modules/` khai báo endpoint riêng. Hệ quả: bảy năng lực đã viết xong ở tầng dịch vụ không có đường nào tới người dùng — xem [`../bmad/BMAD_SOI_Vong1_2026-09-04.md`](../bmad/BMAD_SOI_Vong1_2026-09-04.md#s-03--backend-có-12-module-admin-dashboard-chạm-tới-5).

Một lỗ hổng cụ thể trong chính facade v1: **không có `DELETE /api/v1/admin/users/{id}`**. Bảng quản trị gọi nó và nhận 405. Xem [B-02](../bug-triage.md#b-02-xóa-người-dùng-trong-admin-trả-405).

### Địa chỉ gốc mà client dùng

Bảng quản trị dựng địa chỉ gốc từ ba biến môi trường lúc build (`VITE_API_BASE_URL`, `VITE_API_PREFIX`, `VITE_API_VERSION`). Nếu `VITE_API_BASE_URL` trống, nó rơi về đường dẫn tương đối `'/api/v1'`, tức là mọi lời gọi đi tới chính máy chủ đang phục vụ trang và cần một proxy đứng trước. Mọi lời gọi trong `src/services/` vì thế viết đường dẫn **không** có tiền tố `/api/v1`: `'/admin/auth/login'`, `'/admin/users'`.

Thời gian chờ mỗi lời gọi là 30 giây. Không có cơ chế thử lại tự động.

## Danh sách và phân trang

Endpoint trả danh sách dùng cùng một hình dạng:

```json
{ "success": true, "data": [ … ], "total": 137, "page": 2, "limit": 20, "totalPages": 7 }
```

- `page` bắt đầu từ **1**. Gửi 0 hoặc số âm thì được hiểu là 1 (đo được).
- `totalPages` là `ceil(total / limit)`, bằng 0 khi `limit` bằng 0.
- `limit` vượt trần bị **cắt im lặng**, không báo lỗi. Cách duy nhất phát hiện là so `limit` trong phản hồi với `limit` đã gửi.

**Mặc định và trần khác nhau ở từng endpoint.** Nền tảng đặt mặc định 20 và trần 100, nhưng năm trong bảy chỗ gọi ghi đè nó:

| Nhóm endpoint | Mặc định | Trần |
|---|---|---|
| Đề bài và tài sản công nghệ | 20 | 100 |
| Câu chuyện (đường quản trị và đường người dùng) | 20 | 100 |
| Câu chuyện (**đường công khai**) | **10** | **50** |
| Thông báo | 10 | **1000** |
| Lời mời hợp tác | 20 | **1000** |
| Danh sách người dùng | 10 | **1000** |

Đo trên bản chạy ngày 2026-09-04: `GET /api/v1/public/stories?limit=500` trả về `limit: 50`; không tham số thì trả `page: 1, limit: 10`.

Hai điều đáng lưu ý. Thứ nhất, giao diện không suy được trần từ một chỗ — nó phải biết trần của từng danh sách, hoặc phải luôn đọc `limit` trong phản hồi. Thứ hai, **trần 1000 ở danh sách người dùng** nghĩa là một lời gọi duy nhất kéo về được một nghìn hồ sơ kèm email và số điện thoại; một chỗ trong mã còn gọi thẳng với trần và mặc định đều bằng 1000. Xem [B-33](../bug-triage.md#b-33-bốn-danh-sách-cho-phép-lấy-1000-dòng-một-lần).

Endpoint trả một bản ghi đơn dùng `{ "success": true, "data": { … } }`. Một số endpoint xác thực không theo hình dạng này — xem mục dưới.

## Hình dạng lỗi

Đây là chỗ v1 và v2 khác nhau nhiều nhất, và là chỗ việc di trú tốn công nhất.

### Ánh xạ ngoại lệ sang mã trạng thái

Giống nhau ở cả hai phiên bản:

| Tình huống | Mã |
|---|---|
| Dữ liệu gửi lên không hợp lệ | 400 |
| Chưa đăng nhập, hoặc token hỏng/hết hạn | 401 |
| Đã đăng nhập nhưng không đủ quyền | 403 |
| Không tìm thấy | 404 |
| Xung đột trạng thái, hoặc lệch phiên bản | 409 |
| Hiểu được nhưng không xử lý được (ví dụ vượt capacity) | 422 |
| Quá giới hạn tần suất | 429 |
| Lỗi máy chủ | 500 |

Thân của lỗi 500 **không lộ chi tiết**. Đo trên bản chạy ngày 2026-09-04, một lỗi 500 thật từ `POST /api/v1/search` khi công cụ tìm kiếm không chạy:

```json
{"statusCode":500,"message":"Internal server error","error":"Internal Server Error"}
```

Không tên kiểu ngoại lệ, không đường dẫn tệp, không dấu vết ngăn xếp — đúng như mong muốn. Nhưng cũng **không có mã tương quan**: hình dạng lỗi của v1 không có chỗ cho nó. Người dùng gặp lỗi 500 ở v1 không có gì để đọc cho bộ phận hỗ trợ; mã tương quan chỉ tồn tại trong nhật ký máy chủ. Đây là một trong những chỗ v2 khá hơn hẳn — problem details luôn kèm `correlationId`.

### Thân lỗi của v1

Hai hình dạng, tuỳ mã lỗi:

**Hình dạng A** — cho 12 mã xác thực legacy (`INVALID_CREDENTIALS`, `ACCOUNT_NOT_ACTIVATED`, `EMAIL_ALREADY_IN_USE`, `CONFIRM_PASSWORD_MISMATCH`, `ACTIVATION_TOKEN_INVALID`, `ACCOUNT_NOT_FOUND`, `REGISTER_RATE_LIMITED`, `RESEND_RATE_LIMITED`, `CURRENT_PASSWORD_INCORRECT`, `LOGIN_RATE_LIMITED`, `FORGOT_PASSWORD_RATE_LIMITED`, `RESET_PASSWORD_TOKEN_INVALID`):

```json
{ "code": "INVALID_CREDENTIALS", "message": "…" }
```

**Hình dạng B** — mọi lỗi còn lại:

```json
{ "statusCode": 403, "message": "Admin access required", "error": "Forbidden" }
```

Khi kiểm tra dữ liệu thất bại ở nhiều trường cùng lúc, `message` là một **mảng chuỗi**, không phải chuỗi:

```json
{ "statusCode": 400, "message": ["email must be a valid email", "password must be a string"], "error": "Bad Request" }
```

> Ghi chú kỹ thuật: hàm trích thông điệp lỗi của bảng quản trị đọc thẳng `response.data.message`. Khi `message` là mảng, React sẽ nhận một mảng chỗ nó chờ một chuỗi. Xem [B-08](../bug-triage.md#b-08-thông-điệp-lỗi-nhiều-trường-là-mảng-client-đối-xử-như-chuỗi).

### Thân lỗi của v2

`Content-Type: application/problem+json`, theo RFC 9457:

```json
{
  "status": 409,
  "title": "Conflict",
  "detail": "Hồ sơ đã được cập nhật bởi người khác.",
  "instance": "/api/v2/cases/3f2a…/transition",
  "correlationId": "0HN7…",
  "code": "VERSION_CONFLICT",
  "currentVersion": 7
}
```

`correlationId` **luôn có**. Bốn trường mở rộng còn lại xuất hiện tuỳ lỗi:

| Trường | Có khi |
|---|---|
| `code` | lỗi nghiệp vụ có mã ổn định |
| `ruleId` | bị chính sách chặn — mã quy tắc đã ra quyết định từ chối |
| `currentVersion` | lệch phiên bản; đây là số hiện tại của bản ghi |
| `errors` | kiểm tra dữ liệu thất bại; mảng chuỗi |

Điều quan trọng cho client: **trường chứa câu để hiển thị đổi tên từ `message` sang `detail`**. Ba client hiện tại đều đọc `message`; nếu gọi v2 mà không sửa, người dùng sẽ thấy thông điệp mặc định của axios thay vì câu tiếng Việt máy chủ gửi.

## Ba cơ chế của v2

Cả ba đã có mã chạy và đã cắm vào pipeline, nhưng vì chưa endpoint v2 nào tồn tại nên **chưa cơ chế nào từng kích hoạt** trên thực tế.

### Khoá chống lặp

Bắt buộc với mọi `POST`, `PUT`, `PATCH`, `DELETE` trên `/api/v2`. Không áp cho v1.

| Tình huống | Kết quả |
|---|---|
| Thiếu header `Idempotency-Key` | **428 Precondition Required** |
| Cùng khoá, cùng thân request | Phát lại phản hồi đã lưu, kèm header `Idempotent-Replayed: true`. Không thực thi lại. |
| Cùng khoá, thân request khác | **422 Unprocessable Entity** |

Chi tiết ảnh hưởng tới hành vi màn hình:

- Khoá có **phạm vi theo người dùng**. Hai người cùng dùng chuỗi `"abc"` không đụng nhau.
- Khoá dài hơn 200 ký tự bị cắt còn 200. Hai khoá chỉ khác nhau sau ký tự thứ 200 sẽ bị coi là một.
- Phản hồi **5xx không được ghi lại**. Gửi lại sau lỗi máy chủ là thật sự thực thi lại, đúng ý muốn.
- Phát lại trả đúng mã trạng thái cũ, kể cả khi đó là 4xx. Gửi lại một lệnh từng bị từ chối vì thiếu quyền sẽ nhận lại đúng lỗi cũ, ngay cả khi quyền đã được cấp trong lúc đó.

Hệ quả cho giao diện: mỗi lần bấm nút gửi phải sinh **một** khoá và dùng lại đúng khoá đó cho mọi lần thử lại của cùng lần bấm. Sinh khoá mới ở mỗi lần thử lại thì mất hết ý nghĩa của cơ chế. Không client nào hiện làm việc này.

### Phiên bản lạc quan

Bản ghi có tranh chấp mang một số `version` tăng dần sau mỗi lần ghi. Lệnh ghi gửi kèm số mà giao diện đang hiển thị. Nếu bản ghi đã đổi trong lúc đó, máy chủ trả **409** với `code: "VERSION_CONFLICT"` và `currentVersion` là số hiện tại.

Hồ sơ vụ việc là chỗ đầu tiên cần nó: `TransitionAsync` nhận số phiên bản kỳ vọng và ghi giai đoạn, số phiên bản, và bản ghi quyết định trong **một giao dịch**. Xem [`../xuyen-suot/dong-thoi-va-if-match.md`](../xuyen-suot/dong-thoi-va-if-match.md).

### Dừng dịch vụ v1

Mọi phản hồi từ `/api/v1/*` mang ba header. Đo trên bản chạy ngày 2026-09-04, `GET /api/v1/sectors`:

```
Deprecation: true
Sunset: Wed, 31 Mar 2027 00:00:00 GMT
Link: </api/v2>; rel="successor-version"
```

**Đồng hồ đã chạy.** `appsettings.json` của API đặt ngày dừng là `2027-03-31`, không phải để trống. Điều kiện chết là "hôm nay đã *quá* ngày dừng", nên v1 trả 410 kể từ **01/04/2027 giờ UTC**. Đây là một hạn chót đã có trong mã, không phải một rủi ro giả định.

Khi **hôm nay đã quá ngày dừng**, hoặc khi cờ tương thích bị tắt, mọi đường dẫn v1 trả:

```
410 Gone
{"statusCode":410,"message":"API v1 đã ngừng (D2-148). Dùng /api/v2.","error":"Gone"}
```

Đây là một công tắc, không phải một dốc thoải. Không có chế độ nửa vời trong đó một phần v1 còn sống. Ngày nó bật, ba frontend chết cùng lúc nếu chưa chuyển xong. Kế hoạch chuyển ở [`../xuyen-suot/di-tru-v1-sang-v2.md`](../xuyen-suot/di-tru-v1-sang-v2.md).

Ba client hiện **không đọc** header `Deprecation` hay `Sunset`, và không có nhánh nào xử lý 410. Với cách bắt lỗi hiện tại, 410 sẽ hiện ra như một lỗi lạ không giải thích được.

## Xác thực trong mỗi lời gọi

Token đi trong header `Authorization: Bearer <token>`. Không có cookie phiên phía máy chủ. Chi tiết về token, vai trò và hết hạn ở [`xac-thuc-va-vai-tro.md`](xac-thuc-va-vai-tro.md).

CORS chỉ cho phép các địa chỉ trong cấu hình `Cors:Origins`, mặc định `http://localhost:5173` và `http://localhost:5174`. Bốn header được phép đọc từ trình duyệt: `Deprecation`, `Sunset`, `Link`, `ETag`. Bốn header này chính là bộ tối thiểu cần cho việc di trú và cho kiểm tra phiên bản — chúng đã được mở sẵn, chỉ chưa ai đọc.

## Tải và tải lên tệp

- `POST /api/v1/files/upload` nhận multipart. Giới hạn thân request là 12 MB ở tầng HTTP; giới hạn tệp là 10 MB ở tầng lưu trữ. Một tệp 11 MB vì thế qua được tầng HTTP rồi mới bị từ chối ở tầng dưới.
- `GET /files/{key}` trả nội dung tệp. Đường dẫn này **không** nằm trong tài liệu OpenAPI vì nó dùng route bắt-tất-cả; nó vẫn hoạt động.
- Địa chỉ công khai của tệp được dựng từ cấu hình `ObjectStorage:PublicBaseUrl`. Nếu cấu hình này lệch với địa chỉ API thật, mọi liên kết tệp trong dữ liệu trả về sẽ trỏ sai — và lệch này không lộ ra cho tới khi có người bấm vào một tệp.

## Tương tác với hệ thống khác

**Quyền và vai trò.** Thất bại quyền ở facade v1 là 403 với câu `"Admin access required"`. Ở v2, thất bại quyền kèm `ruleId` để tra được quy tắc nào đã chặn. Xem [`../xuyen-suot/quyen-va-vai-tro.md`](../xuyen-suot/quyen-va-vai-tro.md).

**Kiểm tra dữ liệu và cách hiện lỗi.** Kiểm tra ở máy chủ chạy trước khi vào tầng nghiệp vụ và trả 400 với danh sách thông điệp. Các thông điệp này là **tiếng Anh**, viết theo văn phong của thư viện kiểm tra NestJS cũ (`"email must be a valid email"`), vì facade tái tạo nguyên văn. Giao diện tiếng Việt hiển thị thẳng chúng sẽ lộ ra tiếng Anh.

**Thay đổi chưa lưu.** Không có tương tác — đây là chuyện của trình duyệt, xem [`../xuyen-suot/thay-doi-chua-luu.md`](../xuyen-suot/thay-doi-chua-luu.md).

**Cập nhật lạc quan và hoàn tác.** Không endpoint nào hỗ trợ hoàn tác. Sửa nội dung tạo phiên bản mới; quay lại phiên bản cũ nghĩa là tạo thêm một phiên bản nữa. Xem [`luu-va-phien-ban.md`](luu-va-phien-ban.md).

**Ngoại tuyến.** Không có hàng đợi ngoại tuyến ở bất kỳ client nào. Mất mạng giữa chừng là một lời gọi thất bại, không phải một lời gọi bị hoãn.

**Thông báo và toast.** Không có tương tác ở tầng hợp đồng.

**Trạng thái lọc/tìm trong URL.** Tham số phân trang và lọc đi trong query string của lời gọi API; việc chúng có được phản chiếu vào URL của trình duyệt hay không là quyết định của từng màn hình, xem [`dieu-huong-va-url.md`](dieu-huong-va-url.md).

**Đa ngôn ngữ.** Máy chủ trả thông điệp hỗn hợp: câu nghiệp vụ bằng tiếng Việt, câu kiểm tra dữ liệu bằng tiếng Anh. Không có header thương lượng ngôn ngữ.

**Khả năng truy cập.** Không có tương tác.

**Dấu vết kiểm toán.** Mỗi lời gọi thay đổi dữ liệu ghi một dòng kiểm toán, và lượt bị chính sách từ chối cũng ghi, với kết quả `DENY` và mã quy tắc. Dòng kiểm toán dùng **một giao dịch riêng** để nó sống sót qua việc lệnh bị cuộn ngược — xem [`mo-hinh-du-lieu.md`](mo-hinh-du-lieu.md#sự-kiện-kiểm-toán). Hệ quả cho người đọc nhật ký: một lệnh thất bại vẫn để lại dòng.

## Trường hợp biên

- **Tài liệu OpenAPI mang tên v2 nhưng chứa toàn v1.** Ai mở `/docs` để tìm hợp đồng v2 sẽ thấy một danh sách đầy đủ các đường dẫn v1 và có thể kết luận nhầm rằng v2 đã có, chỉ là đặt tên khác.
- **`Idempotency-Key` bị cắt ở ký tự thứ 200.** Client sinh khoá bằng cách nối nhiều mảnh (ví dụ đường dẫn + tham số + dấu thời gian) có thể tạo hai khoá chỉ khác nhau ở phần đuôi và bị coi là một.
- **Phát lại một lỗi 4xx.** Cùng khoá cùng thân sau khi lần đầu bị 403 sẽ trả lại 403, kể cả khi quyền đã được cấp. Người dùng thử lại và vẫn bị từ chối mà không hiểu vì sao.
- **`limit` bị cắt im lặng.** Không có header hay trường nào báo rằng yêu cầu đã bị cắt; chỉ có `limit` trong phản hồi khác `limit` đã gửi.
- **Giới hạn 12 MB và 10 MB lệch nhau.** Tệp trong khoảng giữa qua tầng HTTP rồi bị từ chối ở tầng lưu trữ, nên thông điệp lỗi đến từ chỗ khác với thông điệp cho tệp quá 12 MB.
- **`/files/{key}` vắng mặt trong OpenAPI.** Công cụ sinh client tự động từ OpenAPI sẽ không có hàm tải tệp.

## Câu hỏi mở và kiểm chứng

- Chưa đo hành vi phát lại của khoá chống lặp trên thực tế, vì chưa có endpoint v2 để gọi. Mọi điều nói ở mục đó đọc từ mã.
- Chưa xác nhận cấu hình `ObjectStorage:PublicBaseUrl` ở môi trường thật có khớp địa chỉ API không.
- `success: true` xuất hiện trong hình dạng danh sách và bản ghi đơn nhưng **không** xuất hiện trong phản hồi đăng nhập. Chưa rà hết 74 đường dẫn xem còn chỗ nào lệch hình dạng nữa; nếu có, mỗi chỗ lệch là một nhánh xử lý riêng ở client.
- Việc tài liệu OpenAPI đặt tên "v2" cho một bộ đường dẫn toàn v1 đáng bị coi là lỗi cấu hình hơn là một quyết định — xem [B-01](../bug-triage.md#b-01-apiv2-được-quảng-cáo-nhưng-chưa-có-endpoint-nào).

Đối chiếu với SourceCode/nacentech, bản chụp ngày 2026-09-04. Đo trên API chạy tại `127.0.0.1:5199`.
