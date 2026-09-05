# Di trú v1 sang v2

## Tóm tắt

Ba frontend của NacenTech ĐMST sống hoàn toàn trên `/api/v1`. Backend .NET phục vụ đường đó như một *facade tương thích* có ngày hết hạn: khi ngày đó tới, hoặc khi một cờ cấu hình bị tắt, **mọi** đường v1 trả 410 Gone cùng một lúc. Không có giai đoạn nửa vời, không có nhóm endpoint nào sống lâu hơn nhóm khác, không có chế độ chỉ-đọc. Đây là một **công tắc**.

Đồng hồ đã được lên: cấu hình mặc định trong mã đặt ngày dừng là **31/03/2027**, và máy chủ đang gửi ngày đó trong header `Sunset` của mọi phản hồi v1. Ba client không đọc header ấy, không có nhánh nào xử lý 410, và không có gì trong giao diện nói cho ai biết. Ngày công tắc bật, bảng quản trị trắng bảng, cổng người dùng ném lỗi lạ ở mọi màn hình, và trang giới thiệu lặng lẽ giấu mất mục câu chuyện thành công.

Tài liệu này là kế hoạch để chuyện đó không xảy ra. Nó gồm bốn phần: vì sao bước đầu tiên **không phải** là sửa client, ba client đang mù ở chỗ nào, bản kiểm kê từng lời gọi và endpoint v2 phải có để thay nó, và thứ tự chuyển an toàn.

Các con số về hình dạng lỗi, phân trang, khoá chống lặp và header dừng dịch vụ thuộc [`../nen-tang/hop-dong-api.md`](../nen-tang/hop-dong-api.md).

## Công tắc, không phải dốc thoải

**Đồng hồ đã chạy.** Cấu hình mặc định đi kèm mã nguồn đặt ngày dừng là **31/03/2027**, và không có tệp cấu hình môi trường nào ghi đè nó. Nghĩa là mọi phản hồi v1 hôm nay đã mang header `Sunset` với ngày đó, và v1 sẽ trả 410 kể từ **01/04/2027 giờ UTC** — điều kiện là "hôm nay đã *quá* ngày dừng". Đây không phải một rủi ro giả định; đây là một hạn chót đã có trong mã.

Máy chủ có đúng hai điều kiện để chuyển v1 sang trạng thái chết, và chúng nằm trong cấu hình chứ không trong mã:

| Điều kiện | Hệ quả |
|---|---|
| Cờ tương thích v1 bị tắt | Mọi `/api/v1/*` trả 410 ngay lập tức |
| Hôm nay đã quá ngày dừng dịch vụ | Mọi `/api/v1/*` trả 410 ngay lập tức |

Thân của 410 là một chuỗi cố định, cùng hình dạng với lỗi v1 khác: `{"statusCode":410,"message":"API v1 đã ngừng (D2-148). Dùng /api/v2.","error":"Gone"}`.

Ba đặc tính khiến nó nguy hiểm hơn một lần deploy hỏng bình thường:

- **Nó xảy ra không cần deploy.** Đổi một dòng cấu hình, khởi động lại API, xong. Không có pull request nào để rà, không có bản dựng nào để rollback.
- **Nó bao trùm.** Kiểm tra nằm ở middleware, trước mọi định tuyến. Cả `POST /api/v1/auth/login` lẫn `GET /api/v1/public/stories` đều chết cùng nhau. Không có đường nào để đăng nhập vào mà xem chuyện gì đang xảy ra.
- **Nó là quá khứ, không phải hiện tại.** Điều kiện là "hôm nay đã **quá** ngày dừng". Đặt ngày dừng vào một ngày đã qua sẽ tắt v1 ngay lập tức, không có cảnh báo nào trước đó.

> Ghi chú kỹ thuật: middleware dừng dịch vụ chạy trước bộ xử lý ngoại lệ và trước bộ định tuyến, nên 410 không đi qua đường tạo thân lỗi thông thường. Đó là lý do thân của nó là một chuỗi viết cứng chứ không phải một đối tượng được dựng từ ngoại lệ.

## Bước đầu tiên là xây v2, không phải sửa client

Đây là chỗ dễ lập kế hoạch sai nhất.

`/api/v2` **có 0 endpoint**. Đo bằng tài liệu OpenAPI (0 trên 76 đường dẫn) và bằng probe trực tiếp, tất cả trả 404. Ba middleware của v2 — khoá chống lặp, hình dạng lỗi RFC 9457, quảng cáo phiên bản kế nhiệm — đã cắm vào pipeline và đang chờ một API chưa được viết. Middleware dừng dịch vụ hiện đang quảng cáo một phiên bản kế nhiệm trả 404.

Hệ quả: **không có bước nào của việc di trú client thực hiện được trước khi endpoint v2 tương ứng tồn tại.** Không thể "chuyển dần từng màn hình sang v2" vì không có gì để chuyển sang. Mọi công việc client trong kế hoạch này là công việc *sau*, không phải *song song*.

Điều duy nhất làm được ngay, và phải làm ngay, là **phòng thủ**: đọc header cảnh báo, xử lý 410 tử tế, và dựng ba cơ chế của v2 ở tầng client trước khi có endpoint để thử. Xem [Thứ tự chuyển an toàn](#thứ-tự-chuyển-an-toàn).

## Ba client đang mù

Máy chủ đã gửi tín hiệu. CORS đã mở đúng bốn header cho trình duyệt đọc — `Deprecation`, `Sunset`, `Link`, `ETag` — nghĩa là hạ tầng đã sẵn sàng. Không client nào đọc.

| Điều cần | Bảng quản trị | Cổng người dùng | Trang giới thiệu |
|---|---|---|---|
| Đọc header `Deprecation` / `Sunset` / `Link` | Không | Không | Không |
| Đọc header `ETag` | Không | Không | Không |
| Nhánh xử lý 410 | Không | Không | Không |
| Nhánh xử lý 401 | Có, tập trung ở bộ chặn phản hồi | **Không có nhánh 401 nào ở bộ chặn**; ba chỗ trong luồng xác thực có kiểm 401 riêng | Không áp dụng |
| Nhánh xử lý 409 | Không | Chỉ một chỗ: đăng ký trùng email | Không |
| Nhánh xử lý 428 hoặc 422 | Không | Không | Không |
| Gửi `Idempotency-Key` | Không | Không | Không |
| Gửi `If-Match`, hoặc giữ số `version` | Không | Không | Không |
| Đọc `detail` của problem details | Không — chỉ đọc `message` | Không — chỉ đọc `message` | Không đọc thân lỗi |
| Thời gian chờ mỗi lời gọi | 30 giây | **Không đặt** | Không đặt |

Bảng quản trị chỉ rẽ nhánh trên đúng **một** mã trạng thái trong toàn bộ mã nguồn: 401. Mọi mã khác — 403, 405, 409, 410, 422, 428 — rơi vào cùng một khối bắt lỗi và hiện ra như một chuỗi phẳng.

Cổng người dùng còn xa hơn: bộ chặn phản hồi của nó thay `AxiosError` bằng một `Error` chỉ mang thông điệp, nên **mã trạng thái bị vứt đi trước khi màn hình nhìn thấy nó**. Sau bộ chặn, không màn hình nào phân biệt được 410 với mất mạng, kể cả nếu muốn.

Trang giới thiệu tệ theo kiểu khác: khi lời gọi câu chuyện hỏng, mục câu chuyện thành công **trả về rỗng và biến mất khỏi trang**. Người xem không thấy lỗi, không thấy mục trống, chỉ thấy một trang ngắn hơn.

Cái người dùng sẽ thấy ngày công tắc bật:

| Bề mặt | Cái xảy ra |
|---|---|
| Bảng quản trị | Lời gọi kiểm phiên lúc khởi động trả 410. Không phải 401, nên cookie **không** bị xoá và người dùng **không** bị đưa về đăng nhập. Họ hạ cánh ở bảng điều khiển với mọi thẻ thống kê lỗi, và mọi màn hình sau đó hiện toast tiếng Việt viết cứng "Có lỗi xảy ra, vui lòng thử lại". |
| Cổng người dùng | Cùng câu chuyện, không có cả nhánh 401. Cookie sống 365 ngày nên trình duyệt tiếp tục tin rằng đã đăng nhập. Mọi màn hình hiện toast viết cứng của riêng nó. |
| Trang giới thiệu | Mục câu chuyện thành công biến mất. Không có thông điệp nào. Không phân biệt được với "chưa có câu chuyện nào". |

Không bề mặt nào nói được câu duy nhất cần nói: *phiên bản API mà ứng dụng này dùng đã ngừng phục vụ*.

## Bản kiểm kê

Ba bảng dưới đây liệt kê **mọi** lời gọi HTTP của ba client, endpoint v2 cần có để thay nó, và tài liệu đặc tả sẽ sở hữu hợp đồng đó. Cột "endpoint v2" là **đề xuất**: chưa endpoint nào tồn tại và chưa tài liệu `api-v2/` nào được soạn, nên tên đường dẫn ở đây là điểm bắt đầu cho việc đặc tả, không phải một hợp đồng đã chốt.

Một khó khăn chạy xuyên cả ba bảng: facade v1 **gộp đề bài và tài sản công nghệ vào một khái niệm `intakes`** phân biệt bằng tham số `type`, trong khi backend đã tách chúng thành hai module. Mỗi lời gọi `intakes` vì thế tách thành hai endpoint v2, và mỗi màn hình gọi nó phải biết mình đang xử lý loại nào — xem [`../nen-tang/mo-hinh-du-lieu.md`](../nen-tang/mo-hinh-du-lieu.md).

### Bảng quản trị — 31 lời gọi, 6 tệp

| Lời gọi v1 | Tệp client | Endpoint v2 cần có | Đặc tả sẽ ở |
|---|---|---|---|
| `POST /api/v1/admin/auth/login` | `services/authService.ts` | `POST /api/v2/sessions` (một đường đăng nhập, vai trò xét ở phản hồi) | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `GET /api/v1/admin/auth/me` | `services/authService.ts` | `GET /api/v2/me` | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `GET /api/v1/admin/users` | `services/userService.ts` | `GET /api/v2/people` | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `GET /api/v1/admin/users/{id}` | `services/userService.ts` | `GET /api/v2/people/{id}` | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `POST /api/v1/admin/users` | `services/userService.ts` | `POST /api/v2/people` — **cần `Idempotency-Key`** | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `PATCH /api/v1/admin/users/{id}` | `services/userService.ts` | `PATCH /api/v2/people/{id}` — **cần `Idempotency-Key` và `If-Match`** | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `DELETE /api/v1/admin/users/{id}` | `services/userService.ts` | **Không có ở v1 — trả 405 hôm nay.** v2 phải quyết: vô hiệu hoá hay xoá | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md), [B-02](../bug-triage.md#b-02-xóa-người-dùng-trong-admin-trả-405) |
| `POST /api/v1/admin/users/{id}/reset-password` | `services/userService.ts` | `POST /api/v2/people/{id}/password-reset` — **cần `Idempotency-Key`** | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `GET /api/v1/admin/users/{id}/profile` | `services/userService.ts` | `GET /api/v2/people/{id}` mở rộng, hoặc hai lời gọi riêng cho đề bài và công nghệ | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `GET /api/v1/admin/users/{id}/collaboration-history` | `services/userService.ts` | `GET /api/v2/invitations?personId=` | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `GET /api/v1/admin/intakes` | `services/intakeService.ts` | `GET /api/v2/demand-briefs` **và** `GET /api/v2/technology-assets` | [`demand-va-technology`](../api-v2/demand-va-technology.md) |
| `GET /api/v1/admin/intakes/{id}` | `services/intakeService.ts` | `GET /api/v2/demand-briefs/{id}` hoặc `GET /api/v2/technology-assets/{id}` | [`demand-va-technology`](../api-v2/demand-va-technology.md) |
| `POST /api/v1/admin/intakes` | `services/intakeService.ts` | Hai endpoint tạo riêng — **cần `Idempotency-Key`**; multipart | [`demand-va-technology`](../api-v2/demand-va-technology.md) |
| `PATCH /api/v1/admin/intakes/{id}` | `services/intakeService.ts` | Hai endpoint sửa riêng — **cần `Idempotency-Key` và `If-Match`**; tạo phiên bản mới | [`demand-va-technology`](../api-v2/demand-va-technology.md) |
| `DELETE /api/v1/admin/intakes/{id}` | `services/intakeService.ts` | Hai endpoint xoá mềm riêng — **cần `Idempotency-Key`** | [`demand-va-technology`](../api-v2/demand-va-technology.md) |
| `DELETE /api/v1/admin/intakes/{id}/attachments/{aid}` | `services/intakeService.ts` | `DELETE /api/v2/documents/{id}` — đi qua phòng dữ liệu | [`dataroom-va-cap-quyen`](../api-v2/dataroom-va-cap-quyen.md) |
| `GET /api/v1/admin/sectors` | `services/intakeService.ts` | `GET /api/v2/taxonomy/sectors` | [`policy-va-taxonomy`](../api-v2/policy-va-taxonomy.md) |
| `GET /api/v1/admin/categories` | `services/intakeService.ts` | `GET /api/v2/taxonomy/categories` | [`policy-va-taxonomy`](../api-v2/policy-va-taxonomy.md) |
| `POST /api/v1/admin/categories` | `services/intakeService.ts` | `POST /api/v2/taxonomy/categories` — **cần `Idempotency-Key`** | [`policy-va-taxonomy`](../api-v2/policy-va-taxonomy.md) |
| `PATCH /api/v1/admin/categories/{id}` | `services/intakeService.ts` | `PATCH /api/v2/taxonomy/categories/{id}` — **cần `If-Match`** | [`policy-va-taxonomy`](../api-v2/policy-va-taxonomy.md) |
| `DELETE /api/v1/admin/categories/{id}` | `services/intakeService.ts` | `DELETE /api/v2/taxonomy/categories/{id}` — vô hiệu hoá, không xoá | [`policy-va-taxonomy`](../api-v2/policy-va-taxonomy.md) |
| `GET /api/v1/admin/stats/intakes` | `services/statsService.ts` | `GET /api/v2/reports/subjects` | [`policy-va-taxonomy`](../api-v2/policy-va-taxonomy.md) |
| `GET /api/v1/admin/stats/users` | `services/statsService.ts` | `GET /api/v2/reports/people` | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `GET /api/v1/admin/stats/notifications` | `services/statsService.ts` | `GET /api/v2/reports/communication` | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `GET /api/v1/admin/stories` | `services/storyService.ts` | `GET /api/v2/stories` | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `GET /api/v1/admin/stories/{id}` | `services/storyService.ts` | `GET /api/v2/stories/{id}` | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `POST /api/v1/admin/stories` | `services/storyService.ts` | `POST /api/v2/stories` — **cần `Idempotency-Key`** | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `PUT /api/v1/admin/stories/{id}` | `services/storyService.ts` | `PUT /api/v2/stories/{id}` — **cần `If-Match`**. Đây là lời gọi `PUT` duy nhất của bảng quản trị | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `DELETE /api/v1/admin/stories/{id}` | `services/storyService.ts` | `DELETE /api/v2/stories/{id}` — **cần `Idempotency-Key`** | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `PATCH /api/v1/admin/stories/{id}/visibility` | `services/storyService.ts` | `PATCH /api/v2/stories/{id}` với trường ẩn/hiện, hoặc endpoint riêng — **cần `If-Match`** | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `POST /api/v1/files/upload` | `lib/api/files.ts` | `POST /api/v2/documents` — có mức mật, đi qua phòng dữ liệu | [`dataroom-va-cap-quyen`](../api-v2/dataroom-va-cap-quyen.md) |

Khu vực **hồ sơ triển khai** của bảng quản trị không có dòng nào ở đây: nó chạy hoàn toàn trên dữ liệu viết cứng trong mã, không gọi API nào, và không có module backend tương ứng. Nó không bị ảnh hưởng bởi việc dừng v1 và cũng không có gì để di trú.

### Cổng người dùng — 44 lời gọi, 7 tệp

| Lời gọi v1 | Tệp client | Endpoint v2 cần có | Đặc tả sẽ ở |
|---|---|---|---|
| `POST /api/v1/auth/login` | `services/api/auth.ts` | `POST /api/v2/sessions` | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `POST /api/v1/auth/register` | `services/api/auth.ts` | `POST /api/v2/people/registrations` — **cần `Idempotency-Key`** | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `POST /api/v1/auth/activate` | `services/api/auth.ts` | `POST /api/v2/people/activations` | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `POST /api/v1/auth/resend-activation` | `services/api/auth.ts` | `POST /api/v2/people/activations/resend` | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `POST /api/v1/auth/forgot-password` | `services/api/auth.ts` | `POST /api/v2/people/password-resets` | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `POST /api/v1/auth/reset-password` | `services/api/auth.ts` | `POST /api/v2/people/password-resets/confirm` | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `POST /api/v1/auth/change-password` | `services/api/auth.ts` | `POST /api/v2/me/password` | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `GET /api/v1/auth/me` | `services/api/auth.ts` | `GET /api/v2/me` | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `POST /api/v1/files/upload` | `services/api/files.ts` | `POST /api/v2/documents` | [`dataroom-va-cap-quyen`](../api-v2/dataroom-va-cap-quyen.md) |
| `GET /api/v1/intakes` | `features/intakes/api/intake.ts` | Hai endpoint công khai riêng. **Không màn hình nào gọi — mã chết** | [`demand-va-technology`](../api-v2/demand-va-technology.md) |
| `GET /api/v1/intakes/{id}` | `features/intakes/api/intake.ts` | Hai endpoint đọc riêng | [`demand-va-technology`](../api-v2/demand-va-technology.md) |
| `GET /api/v1/my/intakes` | `features/intakes/api/intake.ts` | `GET /api/v2/demand-briefs?mine=true` và tương tự cho công nghệ | [`demand-va-technology`](../api-v2/demand-va-technology.md) |
| `GET /api/v1/my/intakes/discover` | `features/intakes/api/intake.ts` | Chưa rõ tương ứng. **Mã chết** | [`matching`](../api-v2/matching.md) |
| `POST /api/v1/my/intakes` | `features/intakes/api/intake.ts` | Hai endpoint tạo riêng — **cần `Idempotency-Key`**; multipart | [`demand-va-technology`](../api-v2/demand-va-technology.md) |
| `PATCH /api/v1/my/intakes/{id}` | `features/intakes/api/intake.ts` | Hai endpoint sửa riêng — **cần `Idempotency-Key` và `If-Match`** | [`demand-va-technology`](../api-v2/demand-va-technology.md) |
| `DELETE /api/v1/my/intakes/{id}` | `features/intakes/api/intake.ts` | Hai endpoint xoá mềm riêng — **cần `Idempotency-Key`** | [`demand-va-technology`](../api-v2/demand-va-technology.md) |
| `DELETE /api/v1/my/intakes/{id}/attachments/{aid}` | `features/intakes/api/intake.ts` | `DELETE /api/v2/documents/{id}` | [`dataroom-va-cap-quyen`](../api-v2/dataroom-va-cap-quyen.md) |
| `POST /api/v1/my/intakes/{id}/compute-matches` | `features/intakes/api/intake.ts` | `POST /api/v2/match-rounds` — **cần `Idempotency-Key`**; trả về một *vòng ghép cặp* chứ không phải danh sách phẳng | [`matching`](../api-v2/matching.md) |
| `POST /api/v1/my/intakes/{id}/beautify` | `features/intakes/api/intake.ts` | `POST /api/v2/demand-briefs/{id}/rewrite` và tương tự — **cần `Idempotency-Key`** | [`demand-va-technology`](../api-v2/demand-va-technology.md) |
| `GET /api/v1/sectors` | `features/intakes/api/intake.ts` | `GET /api/v2/taxonomy/sectors` | [`policy-va-taxonomy`](../api-v2/policy-va-taxonomy.md) |
| `GET /api/v1/categories` | `features/intakes/api/intake.ts` | `GET /api/v2/taxonomy/categories` | [`policy-va-taxonomy`](../api-v2/policy-va-taxonomy.md) |
| `GET /api/v1/marketplace` | `features/intakes/api/intake.ts` | `GET /api/v2/demand-briefs?status=published` và tương tự | [`demand-va-technology`](../api-v2/demand-va-technology.md) |
| `GET /api/v1/marketplace/{id}` | `features/intakes/api/intake.ts` | Hai endpoint đọc công khai riêng | [`demand-va-technology`](../api-v2/demand-va-technology.md) |
| `POST /api/v1/my/collaboration-requests` | `features/collaboration/api/collaborationRequest.ts` | `POST /api/v2/invitations` — **cần `Idempotency-Key`** | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `GET /api/v1/my/collaboration-requests/sent` | `features/collaboration/api/collaborationRequest.ts` | `GET /api/v2/invitations?direction=sent` | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `GET /api/v1/my/collaboration-requests/received` | `features/collaboration/api/collaborationRequest.ts` | `GET /api/v2/invitations?direction=received` | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `POST /api/v1/my/collaboration-requests/{id}/accept` | `features/collaboration/api/collaborationRequest.ts` | `POST /api/v2/invitations/{id}/accept` — **cần `Idempotency-Key` và `If-Match`** | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `POST /api/v1/my/collaboration-requests/{id}/reject` | `features/collaboration/api/collaborationRequest.ts` | `POST /api/v2/invitations/{id}/reject` — **cần `Idempotency-Key` và `If-Match`** | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `DELETE /api/v1/my/collaboration-requests/{id}` | `features/collaboration/api/collaborationRequest.ts` | `DELETE /api/v2/invitations/{id}` — **cần `Idempotency-Key`** | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `GET /api/v1/my/notifications` | `features/notifications/api/notification.ts` | `GET /api/v2/notifications` | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `GET /api/v1/my/notifications/unread-count` | `features/notifications/api/notification.ts` | `GET /api/v2/notifications/unread-count` | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `PATCH /api/v1/my/notifications/{id}/read` | `features/notifications/api/notification.ts` | `PATCH /api/v2/notifications/{id}` — **cần `Idempotency-Key`** | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `PATCH /api/v1/my/notifications/read-all` | `features/notifications/api/notification.ts` | `POST /api/v2/notifications/mark-all-read` — **cần `Idempotency-Key`** | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `DELETE /api/v1/my/notifications/{id}` | `features/notifications/api/notification.ts` | `DELETE /api/v2/notifications/{id}` — **cần `Idempotency-Key`** | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `DELETE /api/v1/my/notifications/all` | `features/notifications/api/notification.ts` | `DELETE /api/v2/notifications` — **cần `Idempotency-Key`** | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `GET /api/v1/my/settings` | `features/settings/api/settings.ts` | `GET /api/v2/me/preferences` | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `PATCH /api/v1/my/settings` | `features/settings/api/settings.ts` | `PATCH /api/v2/me/preferences` — **cần `Idempotency-Key`** | [`identity-va-nguoi-dung`](../api-v2/identity-va-nguoi-dung.md) |
| `GET /api/v1/stories/my` | `features/stories/api/story.ts` | `GET /api/v2/stories?mine=true` | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `GET /api/v1/stories` | `features/stories/api/story.ts` | `GET /api/v2/stories`. **Mã chết** | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `GET /api/v1/stories/{id}` | `features/stories/api/story.ts` | `GET /api/v2/stories/{id}` | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `POST /api/v1/stories` | `features/stories/api/story.ts` | `POST /api/v2/stories` — **cần `Idempotency-Key`** | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `PUT /api/v1/stories/{id}` | `features/stories/api/story.ts` | `PUT /api/v2/stories/{id}` — **cần `If-Match`** | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `DELETE /api/v1/stories/{id}` | `features/stories/api/story.ts` | `DELETE /api/v2/stories/{id}` — **cần `Idempotency-Key`** | [`content-va-communication`](../api-v2/content-va-communication.md) |
| `PATCH /api/v1/stories/{id}/visibility` | `features/stories/api/story.ts` | Việc ẩn/hiện là hành động kiểm duyệt, thuộc quản trị. **Mã chết, và đường v1 tương ứng không tồn tại ở nhánh không phải admin** | [`content-va-communication`](../api-v2/content-va-communication.md) |

Bốn dòng đánh dấu **mã chết** không có màn hình nào gọi. Chúng vẫn phải được xử lý trong lúc di trú: hoặc xoá đi, hoặc chuyển sang v2 cùng phần còn lại. Để nguyên là để lại bốn lời gọi sẽ hỏng lặng lẽ khi có người nối chúng vào giao diện sau này.

### Trang giới thiệu — 1 lời gọi, 1 tệp

| Lời gọi v1 | Tệp client | Endpoint v2 cần có | Đặc tả sẽ ở |
|---|---|---|---|
| `GET {VITE_API_URL}/public/stories` | `core/api/stories.ts` | `GET /api/v2/stories?visibility=public` | [`content-va-communication`](../api-v2/content-va-communication.md) |

Trang giới thiệu là bề mặt dễ chuyển nhất — một lời gọi, không đăng nhập, không lệnh ghi — nhưng có một đặc điểm riêng đáng ngại: **đoạn `/api/v1` không nằm trong mã**. Nó nằm trọn trong biến môi trường địa chỉ gốc. Không đọc mã nguồn nào biết được trang này đang gọi phiên bản nào; chỉ cấu hình lúc triển khai mới biết. Đây cũng là bề mặt duy nhất mà việc chuyển sang v2 có thể làm bằng cách đổi một biến môi trường — nếu hình dạng phản hồi khớp.

## Thứ tự chuyển an toàn

Tám bước, xếp theo phụ thuộc. Mỗi bước đóng trọn một lát cắt và kiểm chứng được trước khi sang bước sau.

**Bước 1 — Xác nhận đồng hồ.** Ngày dừng mặc định trong mã là **31/03/2027**. Việc cần làm không phải là tìm xem nó có được đặt không — nó đã được đặt — mà là xác nhận từng môi trường đang chạy với giá trị nào, ghi lại ai có quyền đổi nó, và quyết định xem ngày đó có còn hợp lý so với tiến độ xây v2 hay không. Nếu không hợp lý thì đổi ngày là một quyết định phải ra sớm, không phải một việc để lại tới gần hạn.

**Bước 2 — Cho ba client nhìn thấy.** Đọc header `Sunset` ở bộ chặn phản hồi của cả ba client và ghi lại giá trị. Đây là việc làm được **ngay hôm nay**, không cần v2 tồn tại, và nó biến một sự cố bất ngờ thành một lịch trình. Xem [Phát hiện sớm](#phát-hiện-sớm).

**Bước 3 — Cho ba client chết tử tế.** Thêm nhánh 410 vào bộ chặn phản hồi: hiện một màn chặn nói rõ "phiên bản API mà ứng dụng này dùng đã ngừng phục vụ, hãy cập nhật ứng dụng", không phải một toast lỗi chung. Đồng thời sửa cổng người dùng để bộ chặn **giữ lại mã trạng thái** thay vì vứt đi — không có bước này thì không nhánh 410, 409 hay 428 nào ở cổng có thể chạy.

**Bước 4 — Dựng ba cơ chế của v2 ở tầng client.** Sinh `Idempotency-Key` một lần cho mỗi lần bấm nút và dùng lại đúng khoá đó cho mọi lần thử lại; giữ số `version` của bản ghi đang mở và gửi kèm lệnh ghi; đọc thân lỗi problem details bằng trường `detail` chứ không `message`. Ba việc này đi cùng nhau — làm lẻ một cái thì hai cái kia vẫn chặn màn hình đầu tiên. Xem [`loi-va-thong-bao.md`](loi-va-thong-bao.md) và [`dong-thoi-va-if-match.md`](dong-thoi-va-if-match.md).

**Bước 5 — Xây v2 cho nhóm đọc trước.** Danh sách và chi tiết của đề bài, tài sản công nghệ, câu chuyện, lĩnh vực, danh mục. Không lệnh ghi nào, nên không cần khoá chống lặp và không cần kiểm phiên bản. Đây là chỗ rẻ nhất để phát hiện hình dạng phản hồi v2 lệch với cái giao diện đang chờ.

**Bước 6 — Chuyển trang giới thiệu.** Một lời gọi, không đăng nhập. Đây là bề mặt đầu tiên chạy hoàn toàn trên v2 và là bằng chứng chạy được rằng chuỗi middleware của v2 hoạt động.

**Bước 7 — Xây v2 cho nhóm ghi, theo cụm.** Mỗi cụm là một màn hình hoàn chỉnh, không phải một endpoint lẻ: xác thực, rồi câu chuyện, rồi lĩnh vực và danh mục, rồi đề bài và công nghệ, rồi lời mời hợp tác, rồi thông báo và cài đặt. Chuyển client theo đúng cụm đó, một cụm một lần. Trong lúc chuyển, cả hai phiên bản đều sống, và client chọn đường theo cụm.

**Bước 8 — Đặt ngày dừng, rồi mới bật công tắc.** Chỉ đặt `Api:V1SunsetDate` khi cả ba client đã hết lời gọi v1 và đã có nhánh 410. Đặt ngày trước, để header `Sunset` chạy một thời gian đủ dài, rồi mới để nó qua. Đừng tắt cờ tương thích trực tiếp: nó bỏ qua toàn bộ giai đoạn cảnh báo.

Hai việc **không** thuộc kế hoạch này nhưng chặn nó: bảy năng lực backend chưa có cửa HTTP, và tám màn hình chưa tồn tại. Chúng nằm ở [`../bmad/BMAD_SOI_Vong1_2026-09-04.md`](../bmad/BMAD_SOI_Vong1_2026-09-04.md#đề-xuất-pha-xây).

## Phát hiện sớm

Mọi phản hồi v1 hôm nay mang `Deprecation: true` và `Link: </api/v2>; rel="successor-version"`. Vì cấu hình đã có ngày dừng, phản hồi **đang mang** thêm `Sunset: Wed, 31 Mar 2027 00:00:00 GMT`. Bốn header đã được mở cho trình duyệt đọc trong cấu hình CORS.

Nói cách khác: tín hiệu đã có ở đó, trong mọi phản hồi, từ ngày backend .NET được bật. Việc còn thiếu chỉ là đọc nó.

Ba mức phát hiện, xếp theo công sức:

| Mức | Làm gì | Ai thấy |
|---|---|---|
| Tối thiểu | Bộ chặn phản hồi ghi cảnh báo ra console khi thấy `Sunset` | Người phát triển đang mở bảng điều khiển trình duyệt |
| Nên có | Lưu giá trị `Sunset` vào trạng thái ứng dụng; hiện một dải cảnh báo trên cùng mọi trang khi còn dưới 30 ngày, đếm ngược theo ngày | Mọi người dùng đang đăng nhập |
| Đầy đủ | Thêm một lượt kiểm định kỳ ngoài trình duyệt: gọi một endpoint v1 bất kỳ, đọc `Sunset`, cảnh báo vào kênh vận hành khi giá trị xuất hiện hoặc đổi | Đội vận hành, kể cả khi không ai đang dùng ứng dụng |

Mức tối thiểu là việc của một buổi chiều và nó thay đổi bản chất của rủi ro: từ "một ngày nào đó mọi thứ chết" thành "chúng ta còn N ngày".

Dải cảnh báo nên nói ngày, không nói số ngày còn lại tính sẵn — múi giờ của header là UTC và người đọc ở múi giờ khác.

## Huỷ và gián đoạn

Trong khung của tài liệu này, "tương tác" là một lần bấm nút gửi đi qua một API sắp hoặc đã ngừng phục vụ.

| Sự kiện | Điều gì xảy ra |
|---|---|
| Người dùng bấm Huỷ hoặc nhấn Escape | Không ảnh hưởng. Không client nào huỷ được một lời gọi đang bay. |
| Người dùng đi chỗ khác trong app | Lời gọi bị bỏ. Nếu đó là lệnh ghi trên v2 đã tới máy chủ, nó vẫn được thực thi và vẫn được ghi kèm khoá chống lặp — lần bấm lại với cùng khoá sẽ nhận lại kết quả cũ thay vì thực thi hai lần. Trên v1 thì không: lệnh chạy hai lần. |
| Nút Back/Forward của trình duyệt | Như trên. |
| Tải lại trang, hoặc đóng tab | Khoá chống lặp sinh trong bộ nhớ trang bị mất, nên lần gửi sau là một lần gửi mới hoàn toàn. Đây là lý do khoá phải gắn với **một lần bấm**, không với một phiên. |
| Mất mạng, hoặc request quá hạn | Đây là tình huống mà khoá chống lặp sinh ra để giải quyết: thử lại với **cùng** khoá là an toàn. Sinh khoá mới ở mỗi lần thử lại làm mất hết ý nghĩa của cơ chế. Lưu ý phản hồi 5xx **không** được ghi lại, nên thử lại sau lỗi máy chủ là thật sự thực thi lại — đúng ý muốn. |
| Phiên hết hạn (401), hoặc v1 bị dừng (410 Gone) | 401 và 410 phải rẽ hai nhánh khác nhau. 401 nghĩa là "đăng nhập lại"; 410 nghĩa là "ứng dụng này đã cũ, đăng nhập lại cũng vô ích". Hôm nay không client nào phân biệt. |
| Bản ghi bị đổi bởi tab khác hoặc người khác (409), hoặc bị xoá | Trên v1 không phát hiện được vì không có số `version` nào được trả về cho client. Trên v2 thì phát hiện được — xem [`dong-thoi-va-if-match.md`](dong-thoi-va-if-match.md). |
| Trình duyệt tự điền, hoặc trình quản lý mật khẩu ghi vào biểu mẫu | Không ảnh hưởng. |

## Tương tác với hệ thống khác

**Quyền và vai trò.** Từ chối ở v1 là 403 với câu tiếng Anh `"Admin access required"`; ở v2 kèm `ruleId`. Chuyển sang v2 là cơ hội duy nhất để giao diện nói được *vì sao* bị từ chối. Xem [`quyen-va-vai-tro.md`](quyen-va-vai-tro.md).

**Kiểm tra dữ liệu và cách hiện lỗi.** Đây là thay đổi lớn nhất với client: trường chứa câu để hiển thị đổi tên từ `message` sang `detail`, và danh sách lỗi từng trường đổi từ `message` dạng mảng sang `errors`. Xem [`loi-va-thong-bao.md`](loi-va-thong-bao.md).

**Thay đổi chưa lưu.** Một lần gửi bị 410 giữa chừng khiến biểu mẫu vẫn bẩn và không lưu được nữa. Không client nào giữ bản nháp, nên nội dung đang gõ mất khi người dùng tải lại trang để thử — xem [`thay-doi-chua-luu.md`](thay-doi-chua-luu.md).

**Cập nhật lạc quan và hoàn tác.** Không có tương tác. Không endpoint nào của cả hai phiên bản hỗ trợ hoàn tác.

**Ngoại tuyến.** Không client nào có hàng đợi ngoại tuyến. Một lệnh gửi khi mất mạng là một lệnh thất bại, không phải một lệnh hoãn lại.

**Thông báo và toast.** Cả hai cổng dùng cùng một thư viện toast. Mẫu áp đảo ở cả hai là **vứt thông điệp của máy chủ và hiện một câu tiếng Việt viết cứng**, nghĩa là ngay cả khi máy chủ nói rõ "API v1 đã ngừng", người dùng vẫn chỉ thấy "Có lỗi xảy ra, vui lòng thử lại". Sửa chỗ này là điều kiện để bước 3 có tác dụng.

**Trạng thái lọc/tìm trong URL.** Không có tương tác.

**Đa ngôn ngữ.** Thân 410 của máy chủ là tiếng Việt. Đây là một trong số ít thông điệp máy chủ đã có sẵn tiếng Việt, và nó đang không được hiển thị ở đâu cả.

**Khả năng truy cập.** Dải cảnh báo dừng dịch vụ ở bước 2 phải là một vùng thông báo mà trình đọc màn hình đọc được, không phải một dải màu.

**Dấu vết kiểm toán.** Lời gọi trả 410 bị chặn ở middleware trước khi vào tầng dịch vụ, nên **không sinh dòng kiểm toán nào**. Sau ngày dừng, nhật ký kiểm toán sẽ im lặng hoàn toàn — không phải vì không ai thao tác, mà vì không thao tác nào tới được chỗ ghi.

## Trường hợp biên

- **410 không xoá phiên.** Nó không phải 401, nên bộ chặn của bảng quản trị không xoá cookie và không đẩy người dùng ra. Họ ở lại trong một ứng dụng đã chết với một phiên vẫn còn hiệu lực.
- **Đặt ngày dừng vào quá khứ tắt v1 tức thì.** Không có giai đoạn ân hạn, không có cảnh báo. Đây là cách dễ nhất để gây sự cố bằng một lỗi đánh máy trong cấu hình.
- **Cổng người dùng không đặt thời gian chờ.** Nếu máy chủ v1 bị tắt theo kiểu không trả lời (thay vì trả 410), lời gọi treo cho tới khi trình duyệt tự bỏ. Người dùng thấy một nút quay vô hạn.
- **Trang giới thiệu hỏng mà không ai biết.** Mục câu chuyện thành công tự ẩn khi lời gọi lỗi. Một trang công khai mất một mục là chuyện không có ai báo cáo.
- **Đoạn phiên bản của cổng người dùng không thống nhất.** Phần lớn lời gọi dựng đường dẫn từ biến môi trường, nhưng tệp lời mời hợp tác viết cứng chuỗi `/api/v1`. Đổi biến môi trường sang `v2` sẽ chuyển mọi thứ trừ khu vực đó, và khu vực đó sẽ là nơi duy nhất nhận 410.
- **Khoá chống lặp bị cắt ở ký tự thứ 200.** Client sinh khoá bằng cách nối đường dẫn với tham số có thể tạo hai khoá chỉ khác nhau ở phần đuôi và bị coi là một, khiến lần bấm thứ hai nhận lại kết quả của lần bấm thứ nhất.
- **Phát lại một lỗi 4xx.** Cùng khoá cùng thân sau khi lần đầu bị 403 sẽ trả lại 403, kể cả khi quyền đã được cấp trong lúc đó. Người dùng thử lại và vẫn bị từ chối mà không hiểu vì sao.
- **`DELETE /admin/users/{id}` không có ở v1.** Nó là lời gọi duy nhất trong ba client trỏ tới một đường không tồn tại. Việc di trú không sửa nó — v2 phải quyết định xoá người dùng nghĩa là gì trước đã.

## Câu hỏi mở và kiểm chứng

- `Api:V1SunsetDate` **đã có giá trị**: `2027-03-31` trong tệp cấu hình mặc định của API, không bị ghi đè bởi tệp cấu hình môi trường phát triển hay bởi cấu hình container. Điều này trả lời câu hỏi để ngỏ ở [`../nen-tang/hop-dong-api.md`](../nen-tang/hop-dong-api.md#câu-hỏi-mở-và-kiểm-chứng) và cần được cập nhật ở đó. Chưa xác nhận giá trị này ở môi trường thật — biến môi trường `Api__V1SunsetDate` có thể ghi đè và chưa rà được cấu hình triển khai.
- Chưa xác nhận header `Sunset` thực sự tới được trình duyệt qua CORS. Nó nằm trong danh sách header được phép đọc, nhưng chưa ai đo bằng một lời gọi thật từ một trang web.
- Chưa dựng bất kỳ frontend nào. Bản kiểm kê đọc từ mã nguồn, không phải từ lưu lượng thật. Một lượt kiểm bằng tay với bảng điều khiển mạng của trình duyệt sẽ xác nhận cả ba bảng và có thể tìm thêm lời gọi đi qua đường khác.
- Marketplace của cổng người dùng được liệt kê là *vỏ* trong các tài liệu trước, nhưng nó gọi hai endpoint thật (`GET /api/v1/marketplace` và `GET /api/v1/marketplace/{id}`) thông qua tệp API của khu vực đề bài và công nghệ, chứ không qua tệp API của riêng nó. Danh sách khu vực vỏ cần được rà lại và có thể phải sửa còn năm khu vực (chưa cấp mã lỗi).
- `PATCH /api/v1/stories/{id}/visibility` được khai báo ở cổng người dùng nhưng đường tương ứng chỉ tồn tại dưới nhánh quản trị. Nếu có người nối nó vào giao diện, nó sẽ hỏng ngay, không phải sau ngày dừng (chưa cấp mã lỗi).
- Bộ chặn phản hồi của cổng người dùng thay ngoại lệ axios bằng một `Error` thường **trước khi** hàm bọc lời gọi kiểm tra mã trạng thái, nên các nhánh 401, 409, 429 trong luồng xác thực có thể chưa bao giờ chạy. Cần đo trên bản chạy: đăng nhập sai mật khẩu và xem thông điệp hiện ra là câu tiếng Việt tra theo mã hay câu thô của máy chủ (chưa cấp mã lỗi).
- Chưa quyết định `DELETE /admin/users/{id}` ở v2 nghĩa là gì: vô hiệu hoá tài khoản, xoá mềm, hay xoá thật. Mô hình dữ liệu hiện không có trạng thái xoá cho người. Đây là quyết định sản phẩm.
- Chưa quyết định v2 có giữ hình dạng `{success, data, total, page, limit, totalPages}` của danh sách hay đổi sang một hình dạng khác. Nếu đổi, mọi màn hình danh sách của cả hai cổng phải sửa thêm một lần nữa ngoài việc đổi đường dẫn.
- Chưa rõ ai chịu trách nhiệm chạy công tắc và theo quy trình nào. Một thay đổi cấu hình có sức phá hoại bằng cả một lần deploy hỏng thì nên có cùng mức kiểm soát như một lần deploy.

Đối chiếu với SourceCode/nacentech và ba repo frontend, bản chụp ngày 2026-09-04.
