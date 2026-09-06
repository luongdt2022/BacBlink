# Sổ lỗi

Danh sách gộp các khiếm khuyết và bất nhất mà các tài liệu tính năng nêu ra trong mục "Câu hỏi mở và kiểm chứng" và trong thân bài, cộng với những gì lộ ra khi thao tác trên bản chạy thật.

Mười bảy mục mang dòng **Trạng thái**. Trong đó **bảy mục được xác nhận bằng đo trên bản chạy** ngày 2026-09-04 — có bản ghi thật, có phản hồi HTTP thật, và với [B-32](#b-32-mọi-sửa-đổi-tạo-phiên-bản-nội-dung-mới-đều-thất-bại-với-409) là cả câu lệnh SQL chụp từ nhật ký PostgreSQL. Số còn lại xác nhận bằng đọc mã ở cả hai phía. Dòng Trạng thái luôn nói rõ đó là đo hay đọc.

Đây là **sổ lỗi duy nhất**. Snapshot BMAD và các tài liệu tính năng chỉ trỏ mã lỗi ở đây; không tài liệu nào được chép lại danh sách này thành bản thứ hai.

Danh sách tồn tại để đội sản phẩm quyết từng mục: sửa, ghi nhận là cố ý, hay để lại.

## Tóm tắt

Bốn mươi ba mục sau khi gộp: **15 mức cao, 18 mức trung bình, 10 mức thấp**. Mười hai mục cao đầu tiên chia làm bốn cụm; mục thứ mười ba ([B-35](#b-35-danh-sách-intake-ẩn-danh-trả-bản-nháp-của-mọi-người)) tìm ra trong lúc đo lại bản vá sprint 0 và thuộc cụm hai.

**Năm mục đã sửa trong sprint 0** (2026-09-04): [B-32](#b-32-mọi-sửa-đổi-tạo-phiên-bản-nội-dung-mới-đều-thất-bại-với-409) + [B-31](#b-31-sửa-một-đề-bài-mà-không-gửi-kèm-nội-dung-mật-sẽ-xoá-sạch-nội-dung-mật-đó) (cùng một lần sửa, đúng ràng buộc thứ tự), [B-19](#b-19-apiv1publicstories-trả-email-và-số-điện-thoại-của-tác-giả-cho-người-chưa-đăng-nhập), [B-20](#b-20-đọc-một-bản-ghi-theo-định-danh-không-kiểm-quyền), [B-27](#b-27-tìm-kiếm-trả-cả-bản-nháp-của-người-khác). Bốn trong năm đã **đo lại trên bản chạy** sau khi sửa; B-27 sửa xong nhưng vẫn chưa đo được vì thiếu sidecar nhúng ở cổng 8003. Bộ test đi từ **44 lên 51**, tất cả xanh, và bảy bài mới gồm ba bài *sửa-rồi-đọc-lại* chạm PostgreSQL thật — thứ mà 44 bài cũ không có bài nào làm.

Mục nặng nhất là [B-32](#b-32-mọi-sửa-đổi-tạo-phiên-bản-nội-dung-mới-đều-thất-bại-với-409), và nó không đến từ việc đọc mã: nó lộ ra khi bản chạy được dựng và có dữ liệu thật để thao tác. **Không sửa được nội dung của bất kỳ đề bài hay tài sản công nghệ nào** — thao tác trung tâm của sản phẩm — và thông điệp lỗi chỉ vào một nguyên nhân sai.

**Cụm một — cuộc chuyển đổi dừng lại trước tầng HTTP** (B-01, B-02, B-03, B-25, B-26). Tầng dịch vụ .NET hoàn chỉnh, nhưng chỉ có facade v1; năng lực mới không có cửa ra, và một số cửa cũ mất hoặc lệch. Hai mục trong cụm này **khoá lẫn nhau**: sửa B-02 trước B-26 sẽ biến một nút khoá tài khoản thành một nút xoá.

**Cụm hai — dữ liệu đọc được bởi người không có quyền** (B-19, B-20, B-27, và [B-35](#b-35-danh-sách-intake-ẩn-danh-trả-bản-nháp-của-mọi-người) tìm ra sau). Ba đường khác nhau, cùng một kiểu thiếu sót: bản nháp, bản đã xoá và thông tin cá nhân của tác giả đi ra ngoài qua các đường đọc thông thường, một trong đó không cần cả tài khoản. Cụm này không phải hệ quả của cuộc chuyển đổi — nó là nợ mang sang từ facade.

**Cụm ba — giao diện nói dối về việc đã làm** (B-12, B-15). Một biểu mẫu liên hệ báo gửi thành công cho tin nhắn bị vứt; một cổng để người dùng mắc kẹt sau khi phiên hết hạn.

**Cụm bốn — sửa nội dung hỏng, và cái bẫy phía sau nó** (B-32, B-31). Không sửa được nội dung nào; và ngày lỗi đó được chữa, lỗi mất dữ liệu ngay sau nó sẽ nổ. Hai mục phải đi cùng một lần sửa.

Ba cặp mục **khoá thứ tự lẫn nhau**, và đây là thứ dễ hỏng nhất khi chia việc:

| Sửa trước | Sửa sau | Nếu làm ngược |
|---|---|---|
| B-26 | B-02 | Nút "Khoá tài khoản" biến thành nút xoá |
| B-32 | (cùng lúc) B-31 | Chữa xong lệnh sửa thì nó bắt đầu xoá nội dung mật — **đã làm cùng nhau 2026-09-04** |
| B-30 + B-29 | Màn hình nhật ký kiểm toán | Một màn hình nhật ký dựng trên nhật ký có lỗ, tạo cảm giác an toàn sai |

Cụm lớn nhất theo số lượng vẫn là tám mục quanh việc di trú API (B-01, B-02, B-03, B-05, B-06, B-14, B-17, B-21). Cụm thứ hai là bốn mục quanh phiên đăng nhập và token (B-09, B-10, B-12, B-18). Cụm thứ ba là bốn khoảng trống trong nhật ký kiểm toán (B-24, B-29, B-30, và phần ghi chú của B-29).

| Mã | Tiêu đề | Mức | Khu vực | Cần quyết |
| --- | --- | --- | --- | --- |
| B-01 | `/api/v2` được quảng cáo nhưng chưa có endpoint nào | cao | backend | sửa |
| B-02 | Xóa người dùng trong admin trả 405 | cao | backend + admin | **đóng — không xây** (ADR-0005) |
| B-03 | Bảy năng lực backend không có đường tới người dùng | cao | backend | sửa |
| B-12 | Cổng người dùng không xử lý 401 | cao | cổng người dùng | **đã sửa** |
| B-15 | Marketplace và Contact đang chạy với dữ liệu bịa | cao | cổng người dùng | quyết định sản phẩm |
| B-19 | `/api/v1/public/stories` trả email và điện thoại của tác giả | cao | backend | **đã sửa** |
| B-20 | Đọc một bản ghi theo định danh không kiểm quyền | cao | backend | **đã sửa** |
| B-25 | Tạo người dùng trong admin luôn thất bại | cao | admin | **đã sửa** |
| B-26 | Nút "Khoá tài khoản" gọi lệnh xoá | cao | admin | **đã sửa** (trước B-02, đúng thứ tự) |
| B-27 | Tìm kiếm trả cả bản nháp của người khác | cao | backend | **đã sửa**, chưa đo được |
| B-37 | Mọi thông điệp lỗi kiểm tra dữ liệu là chuỗi rỗng, trên cả hai bề mặt | cao | backend | **đã sửa** |
| B-39 | Không đường nào trong hệ thống tạo được tài khoản quản trị | cao | backend | **chấp nhận có ý thức** (2026-09-04) |
| B-35 | Danh sách intake ẩn danh trả bản nháp của mọi người | cao | backend | gỡ đường (b) — đã làm |
| B-32 | Mọi sửa đổi tạo phiên bản nội dung mới đều thất bại với 409 | cao | backend | **đã sửa** |
| B-31 | Sửa bản ghi mà không gửi nội dung mật sẽ xoá sạch nội dung đó | cao | backend | **đã sửa** (cùng B-32) |
| B-04 | Năm khu vực cổng người dùng là vỏ không có backend | trung bình | cổng người dùng | quyết định sản phẩm |
| B-22 | Trang giới thiệu có thể trắng khi tác giả không tra được | trung bình | landing + backend | **đã sửa** |
| B-21 | Năm nút kêu gọi trên landing trỏ về hệ NacenTwin cũ | trung bình | landing | **đã sửa** |
| B-28 | Tài liệu mức `Internal` hiện cho mọi người | trung bình | backend | **đã sửa** (bỏ mức) |
| B-43 | Từ vựng kết quả kiểm toán lệch giữa cửa phân quyền, đặc tả và endpoint | trung bình | backend | **đã sửa** |
| B-42 | Người giữ hai vai trò trong một hồ sơ bị chấm theo vai trò đầu tiên | trung bình | backend | sửa |
| B-40 | `If-Match` và `ETag` được quảng cáo nhưng máy chủ không đọc, không phát | trung bình | backend | **đã sửa** |
| B-36 | Cổng chất lượng được liệt kê là đã có tầng dịch vụ nhưng không có mã nâng mức | trung bình | backend + tài liệu | sửa |
| B-29 | Tài liệu bị loại khỏi danh sách không sinh dòng từ chối | trung bình | backend | **đã sửa** |
| B-30 | Việc cắt dữ liệu thiết bị hết hạn chưa bao giờ chạy | trung bình | backend | **đã sửa** |
| B-23 | Hai bề mặt công bố hai bộ thông tin liên hệ khác nhau | thấp | cổng + landing | sửa |
| B-24 | Chú thích trong mã nói kiểm toán ghi cùng giao dịch | thấp | backend | **đã sửa** |
| B-05 | Bốn thay đổi hành vi chưa tới được frontend | trung bình | ba frontend | **đã rà; 3/4 xong** |
| B-06 | Client chưa có Idempotency-Key, If-Match và RFC 9457 | trung bình | ba frontend | **đã sửa** |
| B-08 | Thông điệp lỗi nhiều trường là mảng, client đối xử như chuỗi | trung bình | admin | **đã sửa** |
| B-09 | Cookie sống 7 ngày, token sống 24 giờ | trung bình | admin + cổng | **đã sửa** |
| B-10 | Token nằm trong cookie không HttpOnly, không Secure | trung bình | admin + cổng | **đã làm (a)**; (b) cần quyết |
| B-14 | Ba `.env.example` vẫn trỏ cổng NestJS cũ | trung bình | ba frontend | **đã sửa** |
| B-16 | Xoá mềm nhưng không có đường khôi phục | trung bình | backend | quyết định sản phẩm |
| B-17 | Route chi tiết không có định danh trong đường dẫn | trung bình | admin | sửa |
| B-07 | `docker compose up postgres` fail vì biến của service api | thấp | backend | sửa |
| B-11 | Đích đến sau đăng nhập bị ghi lại nhưng không được dùng | thấp | admin | **đã sửa** |
| B-13 | Gửi lại thư kích hoạt tiết lộ tài khoản đã kích hoạt | thấp | backend | quyết định sản phẩm |
| B-18 | Lớp bảo vệ của admin không kiểm vai trò | thấp | admin | **đã sửa** |
| B-41 | `Cors:Origins` khai `localhost` nên mở bằng `127.0.0.1` là hỏng im lặng | thấp | backend | sửa |
| B-38 | Bộ lọc trạng thái và trạng thái hiển thị dùng chung một kiểu | thấp | admin | sửa |
| B-44 | Sửa intake v1 bằng thân JSON trả 200 mà không đổi gì | thấp | backend | sửa |
| B-45 | Ngưỡng điểm ghép cặp đặt theo thang cũ loại mọi kết quả ở chế độ đã sửa | trung bình | backend | sửa — đã làm |
| B-46 | Vòng mới nhất báo 0 ứng viên dù có 10 | thấp | backend | sửa — đã làm |
| B-33 | Bốn danh sách cho phép lấy 1000 dòng một lần | thấp | backend | quyết định sản phẩm |
| B-34 | Phụ thuộc có khuyến cáo bảo mật mức cao | thấp | backend | sửa |

## Cao

### B-01: `/api/v2` được quảng cáo nhưng chưa có endpoint nào

- **Người dùng gặp ở đâu:** Chưa gặp trực tiếp. Họ gặp hệ quả của nó: mọi năng lực mới của backend không có màn hình nào.
- **Xảy ra gì / lẽ ra là gì:** Tài liệu OpenAPI mang tên "NacenTech.Api | v2" chứa 74 đường dẫn `/api/v1` và 2 đường dẫn health, **không có đường dẫn `/api/v2` nào**. Ba middleware (`IdempotencyMiddleware`, `V1SunsetMiddleware`, `ErrorHandling`) đã cắm sẵn cho `/api/v2`; `V1SunsetMiddleware` đang trả header `Link: </api/v2>; rel="successor-version"` trỏ tới một bộ đường dẫn 404. `README.md:34` của backend nói `apps/api` phục vụ cả v2 và v1.
- **Tái hiện:** Chạy API, gọi `GET /openapi/v2.json` và đếm đường dẫn theo tiền tố; gọi `GET /api/v2/cases`.
- **Vì sao (từ mã):** Toàn bộ controller nằm ở `apps/api/V1Compat/` (13 tệp). Grep `ApiController|MapPost\(|MapGroup\(|IEndpointRouteBuilder` trên `modules/**/*.cs` trả về 0 tệp.
- **Mức:** `cao` — nó chặn mọi công việc frontend của đợt này.
- **Cần quyết:** `sửa`. Đặc tả ở [`api-v2/`](api-v2/). Việc nhỏ nên làm ngay bất kể lịch xây v2: đổi tên tài liệu OpenAPI hiện tại thành "v1" để không ai đọc nhầm.
- **Nêu bởi:** [BMAD S-01](bmad/BMAD_SOI_Vong1_2026-09-04.md#s-01--apiv2-chưa-tồn-tại-toàn-bộ-năng-lực-mới-của-backend-chưa-có-cửa-ra-http), [nen-tang/hop-dong-api.md](nen-tang/hop-dong-api.md#cái-đang-có)
- **Trạng thái:** **Đã sửa một phần** 2026-09-04, sprint 1 theo [ADR-0009](../../04-technical/adr/0009-noi-dat-endpoint-v2.md) (nay `ACCEPTED`). `apps/api/V2/` ra đời với `V2ControllerBase` riêng và **sáu endpoint đầu tiên**. Tài liệu OpenAPI đã tách đôi — mục nhỏ mà chính mục lỗi này đề nghị làm ngay. Đo lại: `openapi/v2.json` có **6 đường, tất cả `/api/v2`, 0 đường v1**; `openapi/v1.json` có 76 đường (74 v1 + health + `/files`). Trước đó: tài liệu tên "v2" chứa 74 đường v1 và 0 đường v2.
  Còn lại: 12 trong 18 nhóm endpoint chưa viết — xem [B-03](#b-03-bảy-năng-lực-backend-không-có-đường-tới-người-dùng).
- **Trạng thái trước khi sửa:** Xác nhận 2026-09-04 bằng đo trên bản chạy tại `127.0.0.1:5199`. Đếm được 0/76 đường dẫn v2; năm probe `/api/v2/*` đều trả 404.

### B-02: Xóa người dùng trong admin trả 405

- **Người dùng gặp ở đâu:** Bảng quản trị, `/users`, nút xoá một người dùng.
- **Xảy ra gì / lẽ ra là gì:** Máy chủ trả **405 Method Not Allowed**. Người dùng không bị xoá. Vì hàm trích thông điệp lỗi đọc trường `message` mà thân 405 không có, người dùng nhiều khả năng thấy một thông điệp chung không giải thích gì.
- **Tái hiện:** `DELETE /api/v1/admin/users/{bất kỳ guid nào}` → 405. Trên giao diện: mở `/users`, bấm xoá một người dùng.
- **Vì sao (từ mã):** `apps/api/V1Compat/UsersController.cs` khai báo `AdminUsersController` (dòng 73) với `POST`, `GET`, `GET {id}/profile`, `GET {id}/collaboration-history`, `GET {id}`, `PATCH {id}`, `POST {id}/reset-password`. Không có `HttpDelete` nào trong tệp. Phía gọi: `src/services/userService.ts:90-92`, nối từ `src/features/users/hooks/useUsersList.ts:98`. Sâu hơn: `IPersonService` ở `modules/identity/Application/Contracts.cs` **cũng không có** phương thức xoá — thiếu ở cả hai tầng, không chỉ ở facade.
- **Mức:** `cao` — một chức năng quản trị đang hiển thị và không hoạt động.
- **Cần quyết:** `sửa`, nhưng cần một quyết định sản phẩm đi kèm: "xoá người dùng" nghĩa là gì? Vô hiệu hoá vĩnh viễn, ẩn danh hoá, hay xoá thật? Hệ thống chỉ có cờ *đang hoạt động*, không có trạng thái đã xoá. Cách rẻ nhất và nhất quán với phần còn lại là **bỏ nút xoá, thay bằng nút vô hiệu hoá** — vốn đã chạy được qua `PATCH`.
- **Nêu bởi:** [BMAD S-02](bmad/BMAD_SOI_Vong1_2026-09-04.md#s-02--admin-gọi-delete-adminusersid-backend-net-trả-405), [nen-tang/xac-thuc-va-vai-tro.md](nen-tang/xac-thuc-va-vai-tro.md#vòng-đời-một-tài-khoản)
- **Trạng thái:** **Đóng 2026-09-05 với lý do "không xây"** theo [ADR-0005](../../04-technical/adr/0005-xoa-nguoi-dung-nghia-la-gi.md) (nay `ACCEPTED`): hệ thống không có thao tác "xoá người dùng"; vô hiệu hoá là thao tác cuối trong vòng đời tài khoản và nó đã chạy được qua `PATCH`. Đường `DELETE` tiếp tục trả 405 — câu trả lời đúng cho một phương thức không tồn tại. `deleteUser` ở client bị **xoá hẳn**, không đánh dấu.
  Bằng chứng nghiêng quyết định, đo lược đồ 2026-09-05: **24 cột** trên 11 schema trỏ tới người dùng, **0 khoá ngoại** (chủ ý MOD-02) — xoá thật sẽ để lại bản ghi quyết định và sự kiện kiểm toán trỏ vào hư không mà cơ sở dữ liệu không ngăn.
- **Trạng thái trước khi quyết:** Xác nhận 2026-09-04 bằng đo trên bản chạy. 405, không phải 404 — route tồn tại cho `GET`/`PATCH`.

### B-03: Bảy năng lực backend không có đường tới người dùng

- **Người dùng gặp ở đâu:** Không gặp. Đó chính là vấn đề.
- **Xảy ra gì / lẽ ra là gì:** Bảy năng lực được liệt kê là có tầng dịch vụ hoàn chỉnh, có bất biến, có kiểm quyền, và không có endpoint. Đo lại ngày 2026-09-04 thì **sáu** đúng như vậy; cái thứ bảy — cổng chất lượng — không có mã nào nâng được mức, xem [B-36](#b-36-cổng-chất-lượng-được-liệt-kê-là-đã-có-tầng-dịch-vụ-nhưng-không-có-mã-nào-nâng-được-mức). Bảy năng lực đó: hồ sơ vụ việc và ma trận chuyển 12 giai đoạn; hồ sơ môi giới và phân công theo capacity; cấp và thu hồi quyền đọc dữ liệu mật; tra cứu nhật ký kiểm toán; ảnh chụp chính sách; vòng ghép cặp có phiên bản; cổng chất lượng của tài sản công nghệ.
- **Tái hiện:** Đối chiếu `modules/*/Application/Contracts.cs` với danh sách 74 đường dẫn trong `openapi/v2.json`.
- **Vì sao (từ mã):** Hệ quả trực tiếp của [B-01](#b-01-apiv2-được-quảng-cáo-nhưng-chưa-có-endpoint-nào). Facade v1 theo thiết kế chỉ tái tạo bề mặt NestJS cũ, và chú thích ở `V1ControllerBase.cs:11` nói rõ nó "không nhận endpoint mới" — nên bảy năng lực này không thể đi qua đó.
- **Mức:** `cao` — công sức xây tầng dịch vụ không sinh ra giá trị nào cho tới khi có cửa.
- **Cần quyết:** `sửa`. Thứ tự ở [`api-v2/README.md`](api-v2/README.md#thứ-tự-xây); màn hình tương ứng ở [`moi/`](moi/).
- **Nêu bởi:** [BMAD S-03](bmad/BMAD_SOI_Vong1_2026-09-04.md#s-03--backend-có-12-module-admin-dashboard-chạm-tới-5), [nen-tang/mo-hinh-du-lieu.md](nen-tang/mo-hinh-du-lieu.md#hai-lớp-bản-ghi)
- **Trạng thái:** **Đã sửa một phần** 2026-09-04. Ba năng lực đọc thuần nay có cửa: tra cứu kiểm toán (`GET /api/v2/audit-events`, `GET /api/v2/audit-events/{id}`), ảnh chụp chính sách (`GET /api/v2/policy-snapshots/{id}`), vòng ghép cặp (`GET /api/v2/subjects/{kind}/{id}/match-rounds/latest`, `/match-candidates`, `/match-candidates/top`). Chúng đi trước được vì `IdempotencyMiddleware` chỉ chặn lệnh ghi, nên endpoint `GET` không phụ thuộc ADR-0004.
  Đường đọc một dòng kiểm toán cần một phương thức mới ở tầng dịch vụ (`IAuditQuery.FindAsync`) — đúng như đặc tả `api-v2/audit.md` đã nêu trước.
  **Hồ sơ vụ việc đã có đủ cửa** (2026-09-05, sau ADR-0008): 8 endpoint, cả đọc lẫn ghi, vòng đời đo qua HTTP — tạo → gán môi giới → chuyển giai đoạn → khoá tạm → gỡ khoá → chuyển tiếp, kèm 409 không tạo bản ghi quyết định và 422 đúng mã theo ADR-0008.
  **Còn lại hai năng lực**: môi giới, cấp quyền đọc (chờ ADR-0007). Cộng cổng chất lượng, vốn chưa có mã — xem [B-36](#b-36-cổng-chất-lượng-được-liệt-kê-là-đã-có-tầng-dịch-vụ-nhưng-không-có-mã-nào-nâng-được-mức).
- **Trạng thái trước khi sửa:** Xác nhận 2026-09-04. Grep endpoint trên `modules/**` trả 0 tệp.

### B-12: Cổng người dùng không xử lý 401

- **Người dùng gặp ở đâu:** Cổng người dùng, ở bất kỳ màn hình nào, sau khi token hết hạn (24 giờ kể từ lần đăng nhập).
- **Xảy ra gì / lẽ ra là gì:** Lời gọi thất bại với một thông điệp lỗi lạ ở giữa màn hình họ đang làm. Cookie vẫn còn, nên lần tải trang sau ứng dụng vẫn tưởng là đã đăng nhập và lặp lại đúng vòng đó. Không có gì nói rằng cần đăng nhập lại. Lẽ ra: xoá token, đưa về trang đăng nhập, nói rõ phiên đã hết hạn.
- **Tái hiện:** Đăng nhập cổng người dùng, chờ quá 24 giờ (hoặc sửa thời hạn token xuống vài phút), rồi thao tác bất kỳ.
- **Vì sao (từ mã):** `dmst-user-main/src/services/api/client.ts:22-29` — bộ chặn phản hồi chỉ đổi lỗi thành `Error` mang thông điệp rồi ném tiếp. Không có nhánh nào kiểm `status === 401`. So sánh: bảng quản trị xử lý tập trung ở `dmst-admin-main/src/lib/api/client.ts:72-75`. Nghiêm trọng hơn vì cookie `dmst_access_token` sống **365 ngày** (`src/shared/utils/authCookie.ts`) — xem [B-09](#b-09-cookie-sống-7-ngày-token-sống-24-giờ).
- **Mức:** `cao` — người dùng bị mắc kẹt và không có đường tự thoát ngoài việc tự xoá cookie.
- **Cần quyết:** `sửa`. Chép cơ chế đã có của bảng quản trị: bắt 401 ở bộ chặn, xoá token, đẩy về đăng nhập kèm câu giải thích.
- **Nêu bởi:** [BMAD S-09](bmad/BMAD_SOI_Vong1_2026-09-04.md#s-09--hai-client-xử-lý-phiên-hết-hạn-theo-hai-cách-một-trong-hai-không-xử-lý-gì), [nen-tang/xac-thuc-va-vai-tro.md](nen-tang/xac-thuc-va-vai-tro.md#phiên-hết-hạn)
- **Trạng thái:** **Đã sửa** 2026-09-04. Bộ chặn nay ném `ApiError` mang `status`, `code`, `ruleId`, `currentVersion` và `correlationId` thay cho một `Error` chỉ có thông điệp; 401 thì xoá token và phát sự kiện, `AuthProvider` nghe rồi dọn trạng thái phiên để `RequireAuth` đưa về đăng nhập. Giữ nguyên một lớp `Error` là **chủ ý**: hàng chục chỗ `catch` đang đọc `err.message`, và trả về lỗi gốc của axios sẽ biến mọi câu thành *"Request failed with status code 400"*.
  **Phát hiện kèm theo:** cùng bộ chặn đó làm phép kiểm `axios.isAxiosError(err)` trong `apiFetch` **không bao giờ đúng**, nên nhánh trả `{ data, status }` cho phản hồi lỗi là **mã chết** — nó chưa từng chạy. Sửa bộ chặn cũng sửa luôn chỗ đó.
  **Đo trên trình duyệt** 2026-09-05 (Chromium): đăng nhập, thay cookie bằng token hỏng, mở `/ips` → về **`/login`**; cookie hỏng **đã bị xoá**; tải lại `/ips` → vẫn ở `/login`, **không lặp vòng**. Đây là mục chỉ đo được qua giao diện — máy chủ trả 401 đúng từ đầu, cái sai nằm ở chỗ client làm gì với nó.

### B-15: Marketplace và Contact đang chạy với dữ liệu bịa

- **Người dùng gặp ở đâu:** Cổng người dùng, `/contact`, và các hộp thoại gắn ở gốc ứng dụng mà chợ giao dịch mở ra.
- **Xảy ra gì / lẽ ra là gì:**
  - **`/contact` báo gửi thành công cho một tin nhắn bị vứt.** Biểu mẫu chờ 1500 mili giây rồi hiện dải xanh và toast *"Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24h."* Không có lời gọi mạng nào; nó chạy được cả khi ngắt mạng. Đây là phần nặng nhất của mục này: người dùng tin rằng đã liên hệ được, và không ai nhận được gì.
  - **`SubmitProposalModal` và `OpenDealModal` gắn ở gốc `App.tsx`**, luôn được nạp, chứa danh sách công nghệ bịa giới thiệu là "công nghệ của bạn đã niêm yết". Xác nhận đề xuất cho ra toast xanh *"Đề xuất đã được gửi thành công."* không kèm request nào.
  - **Tên doanh nghiệp viết cứng:** `src/app/router/routes.tsx:583` chọn giữa `'Tập đoàn Dệt May Việt Nam'` và `'VinCommerce'` theo `id === '1'`. Vì định danh là GUID, nhánh đó không bao giờ trúng và **mọi** đề bài đều thành "VinCommerce". Hiện hàm mở hộp thoại được khai báo nhưng không được lấy ra dùng, nên chưa nút nào kích hoạt được — nó cách người dùng đúng một dòng mã.
  - **Chuỗi cứng trên mọi thẻ chợ:** `owner: 'Đơn vị đăng tải trên DMST'`. Nhãn "Cập nhật" trên thẻ in ngày tạo trong khi trang chi tiết in ngày cập nhật.
- **Tái hiện:** Đăng nhập cổng người dùng, mở `/contact`, ngắt mạng, điền và gửi biểu mẫu.
- **Vì sao (từ mã):** `src/features/contact/pages/ContactPage.tsx:93-114` — chú thích `// Simulate API call` rồi `setTimeout`. Hộp thoại: `src/app/App.tsx` gắn chúng ở gốc.
- **Mức:** `cao` — biểu mẫu liên hệ nói dối về việc đã gửi.
- **Cần quyết:** `quyết định sản phẩm`. Với `/contact`: nối vào một endpoint thật, hoặc thay bằng một địa chỉ thư điện tử tĩnh. Không lựa chọn nào chấp nhận được là giữ nguyên. Với hai hộp thoại: gỡ khỏi gốc ứng dụng cho tới khi có backend.
- **Đã sửa so với bản đầu:** `marketplace` **không** thuộc mục này. Ba route đang chạy của nó đọc dữ liệu thật qua `GET /api/v1/marketplace` và `/marketplace/{id}` — xem [B-04](#b-04-năm-khu-vực-cổng-người-dùng-là-vỏ-không-có-backend).
- **Nêu bởi:** [BMAD S-04](bmad/BMAD_SOI_Vong1_2026-09-04.md#s-04--cổng-người-dùng-có-năm-khu-vực-vỏ-và-một-biểu-mẫu-nói-dối), [portal/khu-vuc-chua-co-backend.md](portal/khu-vuc-chua-co-backend.md)
- **Trạng thái:** **Xác nhận trong gói phát hành** 2026-09-04. `ContactPage.tsx:95` mang đúng chú thích `// Simulate API call`; và bản dựng `npm run build` của cổng người dùng chứa cả ba chuỗi bịa `VinCommerce`, `Tập đoàn Dệt May Việt Nam`, `Đơn vị đăng tải trên DMST`. Chúng không chỉ nằm trong mã nguồn — chúng nằm trong thứ được phát hành.

### B-32: Mọi sửa đổi tạo phiên bản nội dung mới đều thất bại với 409

- **Người dùng gặp ở đâu:** Cổng người dùng và bảng quản trị, mỗi lần sửa tiêu đề, phần mô tả, hoặc bất kỳ đoạn nội dung mật nào của một đề bài hay một tài sản công nghệ.
- **Xảy ra gì / lẽ ra là gì:** Máy chủ trả **409** với câu *"Bản ghi đã bị thay đổi bởi một yêu cầu khác. Tải lại và thử lại."* trên một bản ghi **không ai khác đụng vào**. Tải lại và thử lại không giúp gì — nó hỏng vĩnh viễn, không phải ngẫu nhiên. Nghĩa là **không sửa được nội dung của bất kỳ đề bài hay tài sản công nghệ nào**, trên cả hai bề mặt.
- **Ranh giới, đo được rất rõ:**

  | Thao tác | Kết quả |
  |---|---|
  | Đổi trạng thái xuất bản | **200** |
  | Gửi lại đúng tiêu đề cũ (không đổi gì) | **200** |
  | Đổi tiêu đề | **409** |
  | Đổi phần mô tả | **409** |
  | Đổi một đoạn nội dung mật | **409** |

  Đúng ranh giới của việc **tạo phiên bản nội dung mới**: sửa nhãn, danh mục và trạng thái thì chạy, vì chúng không tạo phiên bản. Xem [`nen-tang/luu-va-phien-ban.md`](nen-tang/luu-va-phien-ban.md#sửa-nội-dung-tạo-phiên-bản-mới).

- **Tái hiện:** Tạo một tài sản công nghệ. `PATCH /api/v1/my/intakes/{id}` (hoặc đường admin) dạng multipart, chỉ gửi trường `title` với một giá trị khác giá trị hiện tại.
- **Vì sao (từ mã và từ SQL đo được):** Hàng phiên bản nội dung mới được phát ra dưới dạng **`UPDATE` chứ không phải `INSERT`**. Câu lệnh thật bắt được từ nhật ký PostgreSQL:

  ```sql
  UPDATE technology.technology_package_versions
     SET created_at=$1, created_by_actor_ref=$2, description=$3,
         technology_asset_id=$4, title=$5, version_no=$6
   WHERE id = $7
  -- $7 = '01a06b62-3ccf-7c60-a3ad-c0be1e64c493'  ← định danh MỚI, chưa có hàng nào mang nó
  ```

  Không hàng nào khớp, số hàng bị ảnh hưởng là 0, EF ném `DbUpdateConcurrencyException`, và `EfUnitOfWork.CommitAsync` bắt đúng ngoại lệ đó rồi đổi thành `ConcurrencyException` — nên lỗi hiện ra dưới dạng "bản ghi đã bị người khác đổi", che mất nguyên nhân thật. Câu lệnh cập nhật aggregate ngay trước đó (`... SET current_version_no=2, version=5 WHERE id=… AND version=4`) là đúng và lẽ ra sẽ khớp; cả giao dịch bị cuộn ngược vì hàng con.

  Đây là hệ quả kinh điển của khoá chính **sinh ở phía ứng dụng**: hàng con ra đời với một định danh khác giá trị mặc định, và bộ theo dõi thay đổi xếp nó vào nhóm "đã tồn tại" thay vì "mới thêm".

- **Mức:** `cao` — và có lẽ là mục nặng nhất trong danh sách. Nó làm hỏng thao tác trung tâm của toàn sản phẩm: sửa nội dung mình đã đăng. Nó cũng **im lặng về nguyên nhân thật**: thông điệp bảo người dùng tải lại và thử lại, việc mà họ sẽ làm nhiều lần trước khi bỏ cuộc.
- **Cần quyết:** `sửa`. Bảo bộ ánh xạ rằng khoá của hàng phiên bản không do kho dữ liệu sinh, hoặc thêm hàng mới qua tập thực thể thay vì qua tập hợp con của aggregate. Kèm theo: `EfUnitOfWork` nên phân biệt "0 hàng vì lệch phiên bản" với "0 hàng vì hàng không tồn tại" — hai chuyện rất khác nhau đang cho ra cùng một câu.
- **Ràng buộc thứ tự:** sửa mục này **mở đường cho** [B-31](#b-31-sửa-một-đề-bài-mà-không-gửi-kèm-nội-dung-mật-sẽ-xoá-sạch-nội-dung-mật-đó), vốn đang bị chính lỗi này che. Hai mục phải đi cùng một lần sửa, nếu không việc chữa lỗi này sẽ mở ra một lỗi mất dữ liệu.
- **Nêu bởi:** đo trực tiếp trong lượt kiểm ngày 2026-09-04; không tài liệu nào dự đoán được nó từ mã.
- **Trạng thái:** **Đã sửa** 2026-09-04, cùng một lần sửa với [B-31](#b-31-sửa-một-đề-bài-mà-không-gửi-kèm-nội-dung-mật-sẽ-xoá-sạch-nội-dung-mật-đó) theo [ADR-0003](../../04-technical/adr/0003-khoa-do-ung-dung-sinh.md) (nay `ACCEPTED`).
  - Quy ước toàn cục `ApplyEntityKeyConventions` trong `packages/persistence/NacenTechDbContext.cs` đặt `ValueGeneratedNever()` cho khoá của **mọi** kiểu kế thừa `Entity`, không chỉ `AggregateRoot`. Không cần migration — đây là thay đổi ánh xạ.
  - `EfUnitOfWork.TranslateConcurrencyAsync` phân biệt hai nguyên nhân của "0 hàng bị ảnh hưởng": lệch phiên bản thật vẫn thành `ConcurrencyException` kèm `version` **đọc lại từ cơ sở dữ liệu**; hàng không tồn tại nay nổi lên thành `InvalidOperationException` nêu đích danh entity và trỏ về ADR-0003, thay vì nguỵ trang thành xung đột đồng thời.
  - Cổng done: `tests/integration/ContentVersioningTests.cs` — ba bài **sửa-rồi-đọc-lại** chạm PostgreSQL thật. Đã chứng minh chúng bắt được lỗi: tắt quy ước thì cả ba đỏ với đúng `DbUpdateConcurrencyException`, bật lại thì xanh. Bộ test: **44 → 51, tất cả xanh**.
  - Đo lại `LP-01` trên bản chạy sau khi sửa: năm bước lần lượt **200 / 200 / 200 / 200 / 200** (trước đó 200 / 200 / 409 / 409 / 409), và bảng `technology_package_versions` có đúng ba hàng nối tiếp nhau.
- **Trạng thái trước khi sửa:** **Xác nhận bằng đo trên bản chạy** 2026-09-04. Bốn lần thử trên hai bản ghi, cả hai loại (đề bài và tài sản công nghệ), có và không có nội dung mật, với worker nền bật và tắt — 409 ở mọi lần có đổi nội dung. Câu lệnh SQL ở trên chụp từ `docker logs` với `log_statement='all'`.

### B-31: Sửa một đề bài mà không gửi kèm nội dung mật sẽ xoá sạch nội dung mật đó

- **Người dùng gặp ở đâu:** Cổng người dùng và bảng quản trị, mỗi lần sửa một đề bài hoặc một tài sản công nghệ.
- **Xảy ra gì / lẽ ra là gì:** Facade ghi lại **cả bốn** đoạn nội dung mật ở **mọi** lần cập nhật, lấy giá trị thẳng từ thân request. Bốn trường đó cho phép rỗng, nên một biểu mẫu chỉ gửi tiêu đề sẽ gửi chúng dưới dạng rỗng. Tầng dịch vụ hiểu rỗng là **gỡ đoạn** — nó tạo một phiên bản mới rỗng cho từng đoạn. Kết quả: sửa mỗi cái tiêu đề cũng xoá sạch nội dung mức 2 và mức 3, kèm bản do AI xử lý của chúng.
- **Tái hiện:** Tạo một đề bài có nội dung mật mức 2. Gửi một lệnh cập nhật chỉ chứa tiêu đề. Đọc lại bản ghi.
- **Vì sao (từ mã):** `apps/api/V1Compat/IntakeFacade.cs:211-217` gọi bốn lần liên tiếp với các trường của thân request, không kiểm trường nào có mặt. `IDataRoomService.UpsertTextSectionAsync` có chú thích nói rõ "Text null/rỗng = gỡ section".
- **Mức:** `cao` — mất dữ liệu im lặng, ở chính loại dữ liệu mà cả kiến trúc mới được dựng lên để bảo vệ.
- **Hiện đang bị che, và đó là tin xấu.** Lỗi này **không xảy ra được hôm nay**, vì [B-32](#b-32-mọi-sửa-đổi-tạo-phiên-bản-nội-dung-mới-đều-thất-bại-với-409) làm mọi lệnh sửa nội dung cuộn ngược trước khi kịp ghi gì. Đo thật ngày 2026-09-04: gửi một lệnh sửa chỉ có tiêu đề lên một bản ghi có nội dung mật mức 2 và mức 3 → 409, và **cả hai đoạn mật còn nguyên**. Nghĩa là mục này là một cái bẫy đã lên cò: **ngày B-32 được sửa, đây là thứ tiếp theo nổ**, và khi đó nó sẽ nổ im lặng với một phản hồi 2xx.
- **Cần quyết:** `sửa`, **cùng một lần sửa với B-32**. Phân biệt "trường vắng mặt" với "trường được gửi rỗng" — chỉ gỡ đoạn khi người dùng thực sự gửi một giá trị rỗng. Với multipart, phải kiểm tên trường có trong biểu mẫu hay không, chứ không đọc giá trị đã liên kết.
- **Ghi chú kèm theo:** vì mỗi lần gỡ tạo một phiên bản rỗng, lịch sử phiên bản của một bản ghi bị sửa nhiều lần sẽ đầy các mục rỗng liền nhau. Màn hình lịch sử phải phân biệt "đã gỡ" với "chưa nhập" — xem [`moi/lich-su-phien-ban.md`](moi/lich-su-phien-ban.md).
- **Hai bề mặt có thể không giống nhau.** Biểu mẫu của bảng quản trị gửi lại **cả ba tab nội dung mật** ở mỗi lần lưu, nên nó có thể không kích hoạt lỗi này; cổng người dùng và mọi lời gọi API trực tiếp thì có. Mục kiểm phải chạy **hai đường** — qua `curl` và qua giao diện — chứ không chỉ một. Xem `DEBAI-29` trong [`verification/admin.md`](verification/admin.md).
- **Nêu bởi:** [moi/lich-su-phien-ban.md](moi/lich-su-phien-ban.md), [admin/de-bai-va-cong-nghe.md](admin/de-bai-va-cong-nghe.md)
- **Trạng thái:** **Đã sửa** 2026-09-04, trong cùng một lần sửa với [B-32](#b-32-mọi-sửa-đổi-tạo-phiên-bản-nội-dung-mới-đều-thất-bại-với-409) — bẫy không bao giờ được lên cò.
  - `IntakeWriteDto` nay mang danh sách **tên trường thực sự có trong form**; `IntakesControllerBase.MarkProvidedFields` đọc nó từ `Request.Form.Keys` ở cả đường tạo lẫn đường sửa, và `IntakeFacade.ApplyConfidentialSectionsAsync` chỉ chạm tới đoạn nào người gọi thực sự gửi. Đúng như mục này yêu cầu: kiểm **tên trường trong biểu mẫu**, không đọc giá trị đã bind — giá trị đã bind không phân biệt được "không gửi" với "gửi rỗng".
  - Mặc định khi chưa ai khai báo là **không đụng vào**: hướng sai của phép đoán này là mất dữ liệu.
  - Test: `tests/contracts/IntakeConfidentialSectionsTests.cs` — bốn bài, gồm cả mặt còn lại của ranh giới (gửi rỗng **vẫn** phải gỡ được đúng đoạn đó và chỉ đoạn đó).
  - **`LP-06` đã chạy sau khi sửa B-32 và trước khi phát hành**, đúng ràng buộc thứ tự: `PATCH` chỉ gửi `title` → 200, và cả bốn đoạn mật **còn nguyên**. Gửi `confidentialLevel2Content` rỗng một cách có chủ đích → đoạn đó bị gỡ, mức 3 không suy suyển.
- **Trạng thái trước khi sửa:** Cơ chế xác nhận 2026-09-04 bằng đọc mã ở cả hai tầng. **Chưa quan sát được hậu quả**, vì B-32 chặn trước.

### B-25: Tạo người dùng trong admin luôn thất bại, và đó là đường duy nhất tạo tài khoản quản trị

- **Người dùng gặp ở đâu:** Bảng quản trị, `/users`, nút **Tạo mới người dùng**.
- **Xảy ra gì / lẽ ra là gì:** Hộp thoại **không có ô mật khẩu**. Máy chủ bắt buộc mật khẩu và từ chối với `"password is required"`. Mọi lần bấm Tạo đều hỏng, không có cách nào chữa từ giao diện.
- **Tái hiện:** Mở `/users`, bấm Tạo mới người dùng, điền đủ các ô có sẵn, bấm Tạo.
- **Vì sao (từ mã):** `modules/identity/Application/PersonService.cs:74-76` — chú thích ngay trên đó ghi rõ đây là thay đổi có chủ đích, bỏ mật khẩu mặc định `12345678` của hệ cũ. `src/features/users/components/CreateUserModal.tsx` không có trường mật khẩu nào; grep `password` trong tệp trả 0 kết quả. Đây là ví dụ cụ thể nhất của [B-05](#b-05-bốn-thay-đổi-hành-vi-chưa-tới-được-frontend).
- **Mức:** `cao` — và cao hơn vẻ ngoài của nó: **không có đường tự đăng ký thành `ADMIN`**, nên đây là đường duy nhất tạo tài khoản quản trị. Một hệ thống mới triển khai không tạo được quản trị viên thứ hai từ giao diện.
- **Cần quyết:** `sửa`. Thêm ô mật khẩu vào hộp thoại, kèm luật hiển thị rõ. Nếu muốn giữ trải nghiệm cũ, thay bằng một đường "gửi thư đặt mật khẩu" — nhưng đường đó chưa tồn tại ở máy chủ.
- **Nêu bởi:** [admin/nguoi-dung.md](admin/nguoi-dung.md)
- **Trạng thái:** **Đã sửa** 2026-09-04. `CreateUserForm` có trường `password`, hộp thoại có ô mật khẩu kèm nút hiện/ẩn, luật tối thiểu 8 ký tự (khớp đường tự đăng ký; máy chủ chỉ đòi không rỗng), và thông điệp lỗi nay lấy từ máy chủ thay vì câu đoán mò "Email có thể đã được sử dụng". Đo lại: thiếu mật khẩu → **400 `password is required`** (câu này chỉ đọc được sau khi sửa [B-37](#b-37-mọi-thông-điệp-lỗi-kiểm-tra-dữ-liệu-là-chuỗi-rỗng-trên-cả-hai-bề-mặt)); có mật khẩu → **201**.
  **Sửa một mô tả sai của chính mục này:** đây **không** phải "đường duy nhất tạo tài khoản quản trị" — nó không tạo được tài khoản quản trị nào cả. Xem [B-39](#b-39-không-đường-nào-trong-hệ-thống-tạo-được-tài-khoản-quản-trị).
- **Trạng thái trước khi sửa:** Xác nhận 2026-09-04 bằng đọc mã ở cả hai phía.

### B-26: Nút "Khoá tài khoản" gọi lệnh xoá

- **Người dùng gặp ở đâu:** Bảng quản trị, `/users`, nút khoá trên mỗi dòng.
- **Xảy ra gì / lẽ ra là gì:** Nút mang nhãn khoá tài khoản nhưng gọi lệnh **xoá** người dùng. Hôm nay nó vô hại vì lệnh đó trả 405 — nhưng chỉ vì [B-02](#b-02-xóa-người-dùng-trong-admin-trả-405) đang che cho nó. **Sửa B-02 mà không sửa mục này sẽ biến một nút khoá thành một nút xoá.**
- **Vì sao (từ mã):** `src/features/users/hooks/useUsersList.ts:98` gọi `deleteUser(id)`; `src/services/userService.ts:90-92` gửi `DELETE`. Đường đúng là `PATCH` đặt cờ hoạt động, vốn đã tồn tại và đang được nút mở khoá dùng.
- **Mức:** `cao` — không phải vì hậu quả hôm nay, mà vì hai mục lỗi khoá lẫn nhau: sửa mục kia trước mục này là phá dữ liệu.
- **Cần quyết:** `sửa`, và **sửa trước** [B-02](#b-02-xóa-người-dùng-trong-admin-trả-405). Ghi rõ thứ tự đó vào kế hoạch sprint.
- **Nêu bởi:** [admin/nguoi-dung.md](admin/nguoi-dung.md)
- **Trạng thái:** **Đã sửa** 2026-09-04, **trước** B-02 đúng ràng buộc thứ tự. `useUsersList.deactivateUser` gọi `updateUser(id, { isActive: false })` thay cho `deleteUser(id)`; `deleteUser` không còn chỗ gọi nào và mang chú thích cấm nối lại cho tới khi ADR-0005 được chốt. Đo lại trên bản chạy: `PATCH isActive=false` → **200**, đọc lại `isActive=false`, bản ghi **vẫn còn** trong cơ sở dữ liệu; mở khoá lại → 200. Đường `DELETE` vẫn trả **405** — B-02 chưa sửa, đúng như kỳ vọng.

### B-27: Tìm kiếm trả cả bản nháp của người khác

- **Người dùng gặp ở đâu:** Cổng người dùng, ô tìm kiếm.
- **Xảy ra gì / lẽ ra là gì:** `POST /api/v1/search` gọi xuống tầng dịch vụ với cờ "chỉ lấy bản đã xuất bản" **tắt** và không loại trừ chủ sở hữu nào. Kết quả trả về gồm cả đề bài và công nghệ đang ở trạng thái nháp của người dùng khác, kèm tiêu đề và đoạn văn bản khớp.
- **Tái hiện:** Tạo một đề bài ở trạng thái nháp bằng tài khoản A. Bằng tài khoản B, gọi `POST /api/v1/search` với một cụm từ trong nội dung đó.
- **Vì sao (từ mã):** `apps/api/V1Compat/MiscControllers.cs:28-29` — tham số cuối của `SearchQuery` là `false`, tức `PublishedOnly: false`. Chỉ mục tìm kiếm có chứa bản nháp vì việc cắt đoạn chạy khi nội dung đổi, không chỉ khi xuất bản.
- **Mức:** `cao` — nội dung chưa công bố của người khác đọc được qua một đường tìm kiếm bình thường. Cùng họ với [B-20](#b-20-đọc-một-bản-ghi-theo-định-danh-không-kiểm-quyền).
- **Cần quyết:** `sửa`. Bật cờ chỉ-lấy-bản-đã-xuất-bản cho đường tìm kiếm của người dùng. Nếu quản trị viên cần tìm cả bản nháp, đó là một đường riêng có kiểm quyền.
- **Nêu bởi:** [api-v2/matching.md](api-v2/matching.md), [portal/ket-qua-ghep-cap.md](portal/ket-qua-ghep-cap.md)
- **Trạng thái:** **Đã sửa** 2026-09-04 — `MiscControllers.cs` truyền `PublishedOnly: true` cho `SearchQuery` của đường tìm kiếm người dùng. **Vẫn chưa đo được**, và đây là mục P1 còn nợ duy nhất của sprint 0: `POST /api/v1/search` trả 500 vì sidecar nhúng ở cổng 8003 không chạy (Elasticsearch **có** chạy ở 59200; nhật ký cho thấy lỗi là `Connection refused` tới `http://localhost:8003/embed/text`). Chạy `QUYEN-16` ngay khi dựng được sidecar.
  **2026-09-05:** Elasticsearch đã gỡ ([ADR-0010](../../04-technical/adr/0010-bo-elasticsearch-chi-muc-trong-postgresql.md)); chỉ mục nay trong PostgreSQL và có test tích hợp riêng (`PostgresSearchIndexTests`: chế độ đã sửa lọc bản nháp và bản của chính mình **trước** thu hồi). Chỗ chặn phép đo trên bản chạy **chỉ còn sidecar nhúng 8003** — `POST /api/v1/search` cần vector truy vấn.
  **Đã đo trên bản chạy 2026-09-05** (`verification/anh-chup/verify-b27.sh`, 9/9) với sidecar BGE-M3 thật và chỉ mục PostgreSQL: hai bản ghi cùng nội dung — bản nháp của A, bản đã xuất bản của B — cả hai vào bản chiếu; C tìm kiếm → **chỉ bản đã xuất bản**, bản nháp không có. Mục P1 còn nợ cuối cùng của sprint 0 đã đóng.

### B-19: `/api/v1/public/stories` trả email và số điện thoại của tác giả cho người chưa đăng nhập

- **Người dùng gặp ở đâu:** Không nhìn thấy trên giao diện. Trang giới thiệu công khai gọi đường này và nhận dữ liệu đó về trình duyệt của mọi khách vãng lai.
- **Xảy ra gì / lẽ ra là gì:** Endpoint không yêu cầu đăng nhập, nhưng đối tượng tác giả trong mỗi câu chuyện gồm `email`, `phone`, `organization`, `role` và `isActive`. Lẽ ra một trang công khai chỉ cần tên và tổ chức.
- **Tái hiện:** `GET /api/v1/public/stories` **không kèm token**, đọc trường `author` của một mục bất kỳ.
- **Vì sao (từ mã):** `apps/api/V1Compat/StoriesControllers.cs:147-148` — `PublicStoriesController` **không có** thuộc tính yêu cầu đăng nhập. Nó dùng chung lớp cơ sở với hai controller kia, và lớp đó gọi `V1Mappers.Story(...)` (`V1Mappers.cs:104-117`), vốn đổ tác giả qua `UserBrief` (`V1Mappers.cs:35-47`) — cùng một hàm mà khu vực quản trị dùng, gồm đủ `email` và `phone`.
- **Mức:** `cao` — lộ thông tin cá nhân của mọi tác giả có câu chuyện đã xuất bản, cho bất kỳ ai trên Internet, không cần tài khoản.
- **Cần quyết:** `sửa`. Cần một hàm ánh xạ tác giả riêng cho đường công khai, chỉ gồm định danh, tên và tổ chức. Đây là bài học chung: dùng lại một hàm ánh xạ giữa đường quản trị và đường công khai là cách rò rỉ dữ liệu mà không ai thấy trong diff.
- **Nêu bởi:** [landing/trang-chu-va-cau-chuyen.md](landing/trang-chu-va-cau-chuyen.md), [api-v2/content-va-communication.md](api-v2/content-va-communication.md)
- **Trạng thái:** **Đã sửa** 2026-09-04. `V1Mappers.PublicAuthor` là hàm ánh xạ **riêng cho đường công khai** — chỉ `id`, `firstName`, `lastName`, `organization`. `V1Mappers.Story` nay bắt buộc nêu rõ `publicView` ở chỗ gọi, và chỉ `PublicStoriesController` bật cờ đó. Đo lại `API-14` / `LANDING-03` không kèm token: trường `author` còn đúng bốn khoá `{id, firstName, lastName, organization}`. Kiểm không hồi quy: `/api/v1/stories` và đường quản trị **vẫn** trả đủ mười khoá của `UserBrief`.
- **Trạng thái trước khi sửa:** **Xác nhận bằng đo trên bản chạy** 2026-09-04. Tạo một tài khoản và một câu chuyện đã xuất bản, rồi gọi `GET /api/v1/public/stories` **không kèm token**. Trường `author` trả về:

  ```json
  { "id": "01a06b5c-…", "email": "tacgia@example.com", "firstName": "Nguyen",
    "lastName": "Van A", "phone": "0912345678", "organization": "Vien Cong nghe X",
    "role": "user", "isActive": true, "createdAt": "…", "updatedAt": "…" }
  ```

  Email và số điện thoại đi ra ngoài đúng như dự đoán, cho một request không có danh tính nào.

### B-20: Đọc một bản ghi theo định danh không kiểm quyền

- **Người dùng gặp ở đâu:** Không nhìn thấy trên giao diện. Ai biết một định danh đều đọc được bản ghi đó.
- **Xảy ra gì / lẽ ra là gì:** Hai đường, cùng một kiểu thiếu sót:
  - **`GET /api/v1/stories/{id}`** trả câu chuyện cho **bất kỳ tài khoản nào**, không kiểm tác giả, không kiểm trạng thái xuất bản, không kiểm cờ bị ẩn. Bản nháp của người khác và câu chuyện đã bị quản trị viên ẩn đều đọc được.
  - **`GET /api/v1/intakes/{id}`** cho phép **truy cập ẩn danh**, không kiểm trạng thái xuất bản, và tra cả bản ghi **đã xoá mềm**. Nội dung mật thì vẫn được chặn — chỉ chủ sở hữu thấy — nhưng tiêu đề, mô tả và nội dung công khai của một bản nháp hoặc một bản ghi đã xoá thì hiện ra.
- **Tái hiện:** Với đường thứ hai, gọi `GET /api/v1/intakes/{id}` **không kèm token**, dùng định danh của một bản ghi đang ở trạng thái nháp.
- **Vì sao (từ mã):** `StoriesControllers.cs:80-81` gọi thẳng `Stories.GetAsync(id, ct)` mà không truyền người gọi. `IntakesControllers.cs:217-225` khai báo cho phép ẩn danh và gọi `Facade.FindViewAsync(id, true, ct)` — tham số `true` nghĩa là lấy cả bản đã xoá; cờ chủ sở hữu chỉ dùng để lọc phần mật.
- **Mức:** `cao` — nội dung chưa công bố và nội dung đã xoá đọc được bởi người không có quyền, trong đó một đường không cần cả tài khoản.
- **Cần quyết:** `sửa`. Đường câu chuyện: chỉ trả khi người gọi là tác giả, hoặc là quản trị viên, hoặc câu chuyện đã xuất bản và không bị ẩn. Đường bản ghi: bỏ cho phép ẩn danh, không tra bản đã xoá, và chỉ trả bản nháp cho chủ sở hữu.
- **Nêu bởi:** [portal/cau-chuyen.md](portal/cau-chuyen.md), [portal/de-bai-va-cong-nghe-cua-toi.md](portal/de-bai-va-cong-nghe-cua-toi.md), [api-v2/content-va-communication.md](api-v2/content-va-communication.md)
- **Trạng thái:** **Đã sửa** 2026-09-04, cả hai đường, và cả hai đã đo lại trên bản chạy.
  - Đường bản ghi (`UserIntakesController.Get`): bỏ `[AllowAnonymous]`, đổi `includeDeleted` thành `false`, và bản nháp chỉ chủ sở hữu thấy. Đo `MH-07` / `DBCN-01`: không token → **401**; bản nháp của A đọc bằng token của B → **404**; bản đã xoá mềm → **404**; bản đã xuất bản → **200**. Quản trị viên vẫn đọc được bản nháp và bản đã xoá qua `/api/v1/admin/intakes/{id}`.
  - Đường câu chuyện (`UserStoriesController.Get`): trả về chỉ khi người gọi là tác giả, hoặc là quản trị viên, hoặc câu chuyện đã xuất bản và không bị ẩn. Trả **404** chứ không phải 403, để không xác nhận rằng định danh đó tồn tại. Đo `CCHUYEN2-01`: B đọc bản nháp của A → **404**; B đọc câu chuyện đã bị ẩn → **404**; B đọc câu chuyện đã xuất bản → **200**; A đọc chính câu chuyện bị ẩn của mình → **200**.
- **Trạng thái trước khi sửa:** **Xác nhận bằng đo trên bản chạy** 2026-09-04 cho đường bản ghi. `GET /api/v1/intakes/{id}` **không kèm token**, trên một tài sản công nghệ đang ở trạng thái `draft` → **200**, trả về đầy đủ định danh, tiêu đề, trạng thái và loại. Sau đó đánh dấu bản ghi là đã xoá mềm trong cơ sở dữ liệu rồi gọi lại → **vẫn 200**, vẫn đầy đủ. Đường câu chuyện xác nhận bằng đọc mã, chưa đo.

### B-35: Danh sách intake ẩn danh trả bản nháp của mọi người

- **Người dùng gặp ở đâu:** Không nhìn thấy trên giao diện — không frontend nào gọi đường này. Bất kỳ ai trên Internet gọi thẳng thì gặp.
- **Xảy ra gì / lẽ ra là gì:** `GET /api/v1/intakes` **không yêu cầu đăng nhập** và gọi xuống tầng dịch vụ với cờ "chỉ lấy bản đã xuất bản" **tắt**. Kết quả gồm cả đề bài và tài sản công nghệ đang ở trạng thái nháp của người khác, kèm tiêu đề và nội dung công khai. Đây là **đường danh sách** của đúng lỗ hổng mà [B-20](#b-20-đọc-một-bản-ghi-theo-định-danh-không-kiểm-quyền) mô tả ở đường đọc một bản ghi — và nó tệ hơn, vì không cần biết trước định danh nào cả.
- **Tái hiện:** `GET /api/v1/intakes?limit=100` **không kèm token**, đếm số mục có `status: "draft"`.
- **Vì sao (từ mã):** `apps/api/V1Compat/IntakesControllers.cs` — `UserIntakesController` không mang thuộc tính `[Authorize]` ở mức lớp, và `List` gọi `ListAsync(publishedOnly: false, …)`. So sánh: `MarketplaceController` cùng tệp có `[Authorize]` **và** `publishedOnly: true`; `MyIntakesController.Discover` cũng vậy. Chỉ đường này lệch.
- **Mức:** `cao` — nội dung chưa công bố của mọi người đọc được bởi người không có tài khoản, qua một lời gọi duy nhất, không cần biết định danh.
- **Cần quyết:** `quyết định sản phẩm` trước khi sửa, vì có hai cách và chúng khác nhau về ý định: (a) bật cờ chỉ-lấy-bản-đã-xuất-bản và giữ đường này công khai — nhưng khi đó nó trùng chức năng với `/api/v1/marketplace`; (b) **gỡ hẳn đường này**, vì rà ba frontend cho thấy **không cái nào gọi nó** — bảng quản trị dùng `/admin/intakes`, cổng người dùng dùng `/my/intakes` và `/marketplace`, trang giới thiệu không dùng. Lựa chọn (b) có vẻ đúng hơn: một bề mặt công khai không ai dùng thì không nên tồn tại.
- **Nêu bởi:** phát hiện ngày 2026-09-04 trong lúc đo lại [B-20](#b-20-đọc-một-bản-ghi-theo-định-danh-không-kiểm-quyền) sau khi sửa; không tài liệu nào trước đó nêu nó.
- **Trạng thái:** **Xác nhận bằng đo trên bản chạy** 2026-09-04, sau bản vá sprint 0. `GET /api/v1/intakes?limit=100` không kèm token trả 4 mục, **3 trong đó ở trạng thái `draft`** và thuộc hai tài khoản khác nhau.
  **Đã sửa** 2026-09-05 theo **(b)**: gỡ hẳn `UserIntakesController.List`. Bề mặt v1 còn **73** đường. Hai đường còn lại của lớp đó (`GET /intakes/{id}` đã vá B-20, và `POST /intakes/{id}/provided-fields`) giữ nguyên. Đo lại: `GET /api/v1/intakes` → 404. Quyết định ghi trong chú thích tại chỗ trong mã, để người sau không thêm lại nó vì tưởng là thiếu.

### B-37: Mọi thông điệp lỗi kiểm tra dữ liệu là chuỗi rỗng, trên cả hai bề mặt

- **Người dùng gặp ở đâu:** Bất kỳ biểu mẫu nào bị máy chủ từ chối vì dữ liệu không hợp lệ — tạo đề bài thiếu tiêu đề, chọn sai loại, và 39 chỗ khác. Họ thấy một hộp thoại lỗi **trống**, hoặc câu mặc định của thư viện HTTP.
- **Xảy ra gì / lẽ ra là gì:** `POST /api/v1/my/intakes` thiếu tiêu đề trả `{"statusCode":400,"message":"","error":"Bad Request"}`. Trường `message` — đúng trường mà cả ba client đọc để hiển thị — là chuỗi rỗng. Trên `/api/v2` thì `detail` rỗng. Câu giải thích *"title should not be empty"* có tồn tại trong mã, và chưa bao giờ tới được người dùng.
- **Tái hiện:** `POST /api/v1/my/intakes` dạng multipart chỉ gửi `type=ip`, không gửi `title`. Đọc trường `message`.
- **Vì sao (từ mã):** `packages/kernel/Domain/Exceptions.cs` — `ValidationException` có **hai** hàm dựng: `(params string[] errors)` và `(string code, params string[] errors)`. Với **một** đối số chuỗi duy nhất, phân giải nạp chồng của C# chọn hàm thứ hai với `errors` rỗng. Câu lỗi trở thành **mã**, và `Message = string.Join("; ", [])` = **chuỗi rỗng**. Dạng gọi một đối số là dạng của **41 trong 46** chỗ gọi trong toàn bộ mã nguồn.
- **Mức:** `cao` — nó làm hỏng mọi thông báo lỗi kiểm tra dữ liệu của sản phẩm, trên cả hai bề mặt, trên bản đang phát hành. Nó cũng khiến các mục lỗi khác khó chẩn đoán hơn: [B-02](#b-02-xóa-người-dùng-trong-admin-trả-405) mô tả người dùng "nhiều khả năng thấy một thông điệp chung không giải thích gì" — một phần lý do là đây.
- **Vì sao không ai thấy:** lỗi im lặng theo nghĩa xấu nhất. Mã biên dịch sạch, không ngoại lệ nào bị nuốt, đúng mã trạng thái được trả về; chỉ có câu chữ biến mất. 44 test ban đầu không bài nào chạm tới nó, và chính bộ tài liệu này còn trích dẫn những câu lỗi chưa bao giờ tới được người dùng.
- **Cần quyết:** `sửa`.
- **Nêu bởi:** phát hiện ngày 2026-09-04 khi đo endpoint `/api/v2` đầu tiên — `detail` rỗng ở lỗi 400 của chính endpoint vừa viết, rồi truy ngược ra thấy v1 hỏng y hệt và đã hỏng từ trước.
- **Trạng thái:** **Đã sửa** 2026-09-04. Bỏ hàm dựng thứ hai; mã nghiệp vụ nay đi qua `ValidationException.WithCode(code, errors)` — một đường có tên, không phải một hàm dựng dễ trúng nhầm. Một chỗ sửa, 41 chỗ gọi khỏi đụng tới. Năm chỗ dùng dạng có mã ở `AuthenticationService.cs` chuyển sang `WithCode`. Đo lại trên bản chạy: v1 trả `"title should not be empty"` và `"type must be one of the following values: ip, challenge"`; v2 trả `detail` đầy đủ kèm mảng `errors`; mã `CONFIRM_PASSWORD_MISMATCH` vẫn giữ nguyên **và** nay kèm câu giải thích. Test canh: `tests/contracts/ValidationExceptionShapeTests.cs`.

### B-39: Không đường nào trong hệ thống tạo được tài khoản quản trị

- **Người dùng gặp ở đâu:** Lần triển khai đầu tiên ở một môi trường mới. Không ai tạo được quản trị viên.
- **Xảy ra gì / lẽ ra là gì:** `Person.Register` **cứng hoá** `PlatformRoles.User` (`modules/identity/Domain/Person.cs:45`), và `AdminCreatePersonCommand` **không có trường vai trò**. Nghĩa là `POST /api/v1/admin/users` — đường mà [B-25](#b-25-tạo-người-dùng-trong-admin-luôn-thất-bại-và-đó-là-đường-duy-nhất-tạo-tài-khoản-quản-trị) mô tả là "đường duy nhất tạo tài khoản quản trị" — tạo ra một tài khoản `USER`, không phải `ADMIN`. Cũng không có endpoint nào đổi vai trò của một tài khoản đã có.
- **Tái hiện:** Bằng token quản trị, `POST /api/v1/admin/users` với đủ trường, rồi đọc `platform_role` của hàng vừa tạo trong cơ sở dữ liệu.
- **Vì sao (từ mã):** `Person.Register(...)` truyền `PlatformRoles.User` cố định. Đường duy nhất khác đặt được vai trò là hàm dựng dùng cho ETL (`Person.cs:116`), vốn chỉ gọi từ công cụ di trú dữ liệu legacy.
- **Mức:** `cao` — một hệ thống mới triển khai không có cách nào có quản trị viên đầu tiên ngoài việc sửa thẳng cơ sở dữ liệu. Đó chính là việc phải làm trong lượt nghiệm thu này: `UPDATE identity.persons SET platform_role='ADMIN' …`.
- **Cần quyết:** `quyết định sản phẩm` trước khi sửa. Ba lựa chọn, và chúng khác nhau về rủi ro: (a) thêm trường vai trò vào đường quản trị tạo tài khoản — đơn giản, nhưng biến "chiếm một tài khoản quản trị" thành "chiếm toàn bộ hệ thống"; (b) một lệnh khởi tạo chạy một lần lúc triển khai, tạo quản trị viên đầu tiên từ biến môi trường; (c) giữ nguyên, và ghi rõ trong tài liệu vận hành rằng nâng quyền là thao tác cơ sở dữ liệu có kiểm soát. Lựa chọn (b) là thứ hầu hết hệ thống chọn, và nó không mở thêm bề mặt tấn công nào lúc chạy.
- **Nêu bởi:** phát hiện ngày 2026-09-04 khi sửa B-25 và đọc kỹ đường tạo tài khoản. Bản đầu của B-25 mô tả sai chiều — nó nói đường này là cách duy nhất tạo quản trị viên, trong khi đường này **không tạo được** quản trị viên.
- **Trạng thái:** **Xác nhận bằng đo trên bản chạy** 2026-09-04, sau khi sửa B-25. `POST /api/v1/admin/users` trả **201**, và `platform_role` của hàng vừa tạo là `USER`.
- **Quyết định 2026-09-04:** đội xác nhận **đã có tài khoản quản trị**, nên mục này **không chặn triển khai** và không sửa trong đợt này. Ghi nhận là chấp nhận có ý thức.
  Rủi ro còn lại, nói rõ để không ai tưởng nó đã biến mất: **vẫn không có đường nào tạo tài khoản quản trị thứ hai** ngoài sửa thẳng cơ sở dữ liệu. Ngày mất quyền truy cập vào tài khoản đang có — người giữ nghỉ việc, mật khẩu thất lạc, tài khoản bị khoá nhầm — hệ thống không có đường tự phục hồi từ bề mặt sản phẩm. Mục này nên mở lại trước khi bàn giao vận hành cho một đội khác.

## Trung bình

### B-04: Năm khu vực cổng người dùng là vỏ không có backend

- **Người dùng gặp ở đâu:** Bốn trong năm khu vực không gặp được — route đã bị gỡ. Khu vực thứ năm là `/contact`, xem [B-15](#b-15-marketplace-và-contact-đang-chạy-với-dữ-liệu-bịa).
- **Xảy ra gì / lẽ ra là gì:** `deal-room` (1 trang + 8 thành phần), `infrastructure` (7 trang), `services` (12 trang), `valuation` (3 trang + wizard 3 bước) có đủ giao diện và đủ hàm bọc route, nhưng không có API và 23 route bị comment.
- **Vì sao (từ mã):** `dmst-user-main/src/app/router/routes.tsx` — khối route bị comment, kèm chú thích `Hidden until these sections are ready for use`. Backend .NET cố ý chưa mở các năng lực này: `nacentech/README.md:94-99` liệt kê chúng là ngoài phạm vi bản phát hành.
- **Mức:** `trung bình` — không hại ai, nhưng là công sức thiết kế đang nằm không, và `deal-room` chính là tiền thân UI của module `case` đã có tầng dịch vụ hoàn chỉnh.
- **Cần quyết:** `quyết định sản phẩm`. Đề xuất: ghép `deal-room` với module `case` trong sprint 3 thay vì thiết kế console từ đầu. Ba khu vực còn lại chờ các module tương ứng. Trước khi mở lại bất kỳ route nào, phải gỡ dữ liệu bịa mang tên tổ chức có thật nằm trong chúng — `deal-room` có *Tập đoàn Viettel*, *Vingroup*, *FPT Corporation*; `infrastructure` gán 8 thiết bị bịa cho bốn viện và trường có thật; `services` có luồng thanh toán bịa nêu đích danh Momo, ZaloPay, VNPay, Visa, Mastercard.
- **Đã sửa so với bản đầu:** con số là **năm**, không phải sáu. `marketplace` bị đếm nhầm vì phép grep chỉ tìm lời gọi API *trong thư mục của khu vực*, mà ba trang của nó nhập hàm gọi từ `features/intakes/api/intake.ts`. Chúng đọc dữ liệu thật qua `GET /api/v1/marketplace` và `GET /api/v1/marketplace/{id}`.
- **Nêu bởi:** [BMAD S-04](bmad/BMAD_SOI_Vong1_2026-09-04.md#s-04--cổng-người-dùng-có-năm-khu-vực-vỏ-và-một-biểu-mẫu-nói-dối), [portal/khu-vuc-chua-co-backend.md](portal/khu-vuc-chua-co-backend.md), [portal/phong-thuong-thao.md](portal/phong-thuong-thao.md)

### B-05: Bốn thay đổi hành vi chưa tới được frontend

- **Người dùng gặp ở đâu:** Bốn chỗ khác nhau, mỗi chỗ một cách.
- **Xảy ra gì / lẽ ra là gì:** Backend đổi hành vi có chủ đích ở bảy chỗ; bốn trong số đó đổi cái người dùng nhìn thấy và không frontend nào biết:
  1. `/api/v1/ai/*` nay yêu cầu đăng nhập. Chỗ nào gọi beautify khi chưa đăng nhập nhận 401.
  2. Chấp nhận lời mời hợp tác không còn tự loại các lời mời đang chờ khác. Giao diện có thể vẫn ngầm giả định tính loại trừ.
  3. Admin tạo người dùng bắt buộc đặt mật khẩu; hệ cũ mặc định `12345678`.
  4. Sửa nội dung tạo phiên bản mới. Không màn hình nào hiển thị phiên bản, nên người dùng không thấy thứ vừa được tạo ra.
- **Vì sao (từ mã):** `nacentech/README.md:54-65` liệt kê đủ bảy thay đổi. Không repo frontend nào có commit hay chú thích tương ứng.
- **Mức:** `trung bình` — mỗi cái nhỏ, cộng lại là một lớp bất nhất giữa cái giao diện hứa và cái máy chủ làm.
- **Cần quyết:** `sửa`. Rà từng cái trên ba client. Rẻ, và nên làm trong sprint 1 trước khi mọi đo đạc sau bị nhiễu.
- **Nêu bởi:** [BMAD S-05](bmad/BMAD_SOI_Vong1_2026-09-04.md#s-05--bốn-thay-đổi-hành-vi-có-chủ-đích-chưa-được-phản-ánh-ở-frontend)
- **Trạng thái:** **Đã rà cả bốn** 2026-09-04. Hai mục hoá ra **không phải vấn đề**: không client nào gọi `/api/v1/ai/*` khi chưa đăng nhập — đường beautify duy nhất của cổng người dùng đi qua `/my/intakes/{id}/beautify`, vốn nằm sau `[Authorize]`; và giao diện chấp nhận lời mời hợp tác **không** giả định tính loại trừ — `handleAccept` chỉ thay đúng lời mời vừa chấp nhận, không đụng các lời mời đang chờ khác. Mục thứ ba (bắt buộc đặt mật khẩu) đã sửa qua [B-25](#b-25-tạo-người-dùng-trong-admin-luôn-thất-bại-và-đó-là-đường-duy-nhất-tạo-tài-khoản-quản-trị). Mục thứ tư — **không màn hình nào hiển thị số phiên bản** — vẫn còn, và nó là một màn hình chứ không phải một dòng sửa: [`moi/lich-su-phien-ban.md`](moi/lich-su-phien-ban.md), sprint 4.

### B-06: Client chưa có Idempotency-Key, If-Match và RFC 9457

- **Người dùng gặp ở đâu:** Chưa gặp — không endpoint v2 nào tồn tại. Họ sẽ gặp ngay khi cái đầu tiên ra đời.
- **Xảy ra gì / lẽ ra là gì:** Ba client dựng quanh hình dạng của v1. Không có bộ chặn nào sinh `Idempotency-Key`, không chỗ nào giữ số phiên bản để gửi `If-Match`, không bộ dịch nào cho problem details. Gọi v2 mà không sửa: mọi lệnh ghi trả **428**, và mọi thông điệp lỗi rơi về câu mặc định của thư viện HTTP vì trường hiển thị đổi từ `message` sang `detail`.
- **Vì sao (từ mã):** `IdempotencyMiddleware.cs:26-33` (thiếu khoá → 428); `ErrorHandling.cs:47-62` (problem details dùng `detail`); `dmst-admin-main/src/lib/api/client.ts:83-92` (`getErrorMessage` đọc `response.data.message`).
- **Mức:** `trung bình` hôm nay, `cao` vào ngày endpoint v2 đầu tiên xuất hiện.
- **Cần quyết:** `sửa`. Đây là sprint 2 trong [đề xuất Pha XÂY](bmad/BMAD_SOI_Vong1_2026-09-04.md#đề-xuất-pha-xây). Ba cơ chế phải đi cùng nhau; wire lẻ một cái thì hai cái kia vẫn chặn màn hình đầu tiên. Quyết định phải chốt trước khi viết màn hình: **quy tắc sinh khoá chống lặp** — một khoá cho mỗi lần bấm nút, dùng lại cho mọi lần thử lại của cùng lần bấm.
- **Nêu bởi:** [BMAD S-06](bmad/BMAD_SOI_Vong1_2026-09-04.md#s-06--ba-cơ-chế-giao-thức-của-v2-chưa-có-chỗ-nào-ở-frontend), [nen-tang/hop-dong-api.md](nen-tang/hop-dong-api.md#ba-cơ-chế-của-v2)
- **Trạng thái:** **Đã sửa** 2026-09-04 ở cả hai client có lệnh ghi, theo [ADR-0004](../../04-technical/adr/0004-sinh-khoa-chong-lap-o-client.md) (nay `ACCEPTED`). Ba cơ chế đi cùng nhau đúng như mục này yêu cầu, và cả ba nằm trong **bộ chặn HTTP**, không ở màn hình:
  - Khoá chống lặp: `beginOperation()` sinh một khoá cho mỗi lần bấm nút; bộ chặn gắn `Idempotency-Key` cho mọi lệnh ghi.
  - Giữ số phiên bản: `expectedVersion` trong config lời gọi → header `If-Match`. **Nhưng máy chủ không đọc header đó** — xem [B-40](#b-40-if-match-và-etag-được-quảng-cáo-nhưng-máy-chủ-không-đọc-không-phát).
  - Bộ dịch problem details: `normalizeError` xử lý cả ba hình dạng — `detail` của v2, `message` chuỗi của v1, `message` mảng của v1 — và giữ `code`, `ruleId`, `currentVersion`, `correlationId`.
  - Cộng hai nhánh mà mục này nêu thêm: **410** phát sự kiện riêng, và header **`Sunset`** được đọc rồi cảnh báo khi còn dưới 90 ngày.
  Đo lại trên bản chạy: `/api/v1` trả `Deprecation: true`, `Sunset: Wed, 31 Mar 2027 00:00:00 GMT`, `Link: </api/v2>; rel="successor-version"`; `/api/v2` không gửi header nào trong ba cái đó. Bật `Api:V1CompatEnabled=false` để mô phỏng ngày dừng: `/api/v1` trả **410**, `/api/v2` vẫn phục vụ.
  Hai repo trước đó **không có framework test nào**; đã thêm `vitest` và **19 bài mỗi repo**, tất cả xanh.

### B-08: Thông điệp lỗi nhiều trường là mảng, client đối xử như chuỗi

- **Người dùng gặp ở đâu:** Bảng quản trị, bất kỳ biểu mẫu nào bị máy chủ từ chối vì sai nhiều trường cùng lúc. Dễ gặp nhất ở trang đăng nhập với email sai định dạng.
- **Xảy ra gì / lẽ ra là gì:** Máy chủ trả `{"statusCode":400,"message":["email must be a valid email"],"error":"Bad Request"}`. Hàm trích thông điệp lấy thẳng `message` — một mảng — rồi đưa vào chỗ chờ một chuỗi.
- **Tái hiện:** Mở `/login` của bảng quản trị, gõ `abc` vào ô email và một mật khẩu bất kỳ, bấm Đăng nhập.
- **Vì sao (từ mã):** `V1ControllerBase.cs:54` trả `message` là danh sách khi kiểm tra model thất bại; `ErrorHandling.cs:41-42` cũng vậy khi có nhiều lỗi. Phía nhận: `dmst-admin-main/src/lib/api/client.ts:85-86`.
- **Mức:** `trung bình` — người dùng gặp ở màn hình đầu tiên và không đọc được lỗi.
- **Cần quyết:** `sửa`. `getErrorMessage` phải xử lý cả hai hình dạng, và nên xử lý luôn `detail` của problem details cùng lúc — xem [B-06](#b-06-client-chưa-có-idempotency-key-if-match-và-rfc-9457).
- **Nêu bởi:** [admin/dang-nhap.md](admin/dang-nhap.md#trường-hợp-biên), [nen-tang/hop-dong-api.md](nen-tang/hop-dong-api.md#thân-lỗi-của-v1)
- **Trạng thái:** **Đã sửa** 2026-09-04, cùng lượt với [B-06](#b-06-client-chưa-có-idempotency-key-if-match-và-rfc-9457) đúng như mục này đề nghị. `getErrorMessage` nay dựng trên `normalizeError`, xử lý cả ba hình dạng. Đo lại đúng bước tái hiện của mục này: `POST /api/v1/auth/login` với `{"email":"abc","password":""}` trả `message` là **mảng hai phần tử**, và bộ dịch nối chúng thành một câu thay vì đưa mảng vào chỗ chờ chuỗi.

### B-09: Cookie sống 7 ngày, token sống 24 giờ

- **Người dùng gặp ở đâu:** Cả hai cổng, khi quay lại sau hơn một ngày.
- **Xảy ra gì / lẽ ra là gì:** Trình duyệt tin rằng còn đăng nhập trong khi máy chủ đã hết công nhận. Bảng quản trị: màn "Đang tải…" chớp qua rồi rơi về trang đăng nhập, không câu nào nói phiên đã hết hạn. Cổng người dùng: xem [B-12](#b-12-cổng-người-dùng-không-xử-lý-401).

  | Bề mặt | Cookie | Token | Lệch |
  |---|---|---|---|
  | Bảng quản trị | `admin_token`, 7 ngày | 24 giờ | 6 ngày |
  | Cổng người dùng | `dmst_access_token`, 365 ngày | 24 giờ | 364 ngày |

- **Vì sao (từ mã):** `dmst-admin-main/src/lib/cookies.ts` — `DEFAULT_COOKIE_MAX_AGE_DAYS = 7`. `dmst-user-main/src/shared/utils/authCookie.ts` — `max-age=31536000`. Thời hạn token: `AuthOptions.AccessTokenMinutes = 1440` ở `modules/identity/Application/Contracts.cs`.
- **Mức:** `trung bình` — không mất dữ liệu, nhưng gây bối rối và ở cổng người dùng thì thành B-12.
- **Cần quyết:** `sửa`. Đặt tuổi cookie bằng tuổi token, và hiện một câu khi phiên hết hạn.
- **Nêu bởi:** [admin/dang-nhap.md](admin/dang-nhap.md#huỷ-và-gián-đoạn), [nen-tang/xac-thuc-va-vai-tro.md](nen-tang/xac-thuc-va-vai-tro.md#nơi-ba-client-cất-token)
- **Trạng thái:** **Đã sửa** 2026-09-04 ở cả hai client; đo trên trình duyệt 2026-09-05: cookie của cổng người dùng sống **1,00 ngày**. Bảng quản trị: `DEFAULT_COOKIE_MAX_AGE_DAYS = 7` → `ACCESS_TOKEN_MAX_AGE_DAYS = 1`. Cổng người dùng: `max-age=31536000` (365 ngày) → 24 giờ. Cả hai con số nay mang chú thích trỏ về `AuthOptions.AccessTokenMinutes`, để lần đổi tuổi token sau không dựng lại khoảng lệch. Phần "hiện một câu khi phiên hết hạn" thuộc bộ chặn HTTP và đi cùng [B-12](#b-12-cổng-người-dùng-không-xử-lý-401) ở sprint 3.

### B-10: Token nằm trong cookie không HttpOnly, không Secure

- **Người dùng gặp ở đâu:** Không nhìn thấy được.
- **Xảy ra gì / lẽ ra là gì:** Cả hai cổng cất token trong cookie mà JavaScript đọc được, đặt `path=/; SameSite=Lax`, **không** `HttpOnly`, **không** `Secure`. Trên HTTP nó đi qua mạng ở dạng rõ. Bất kỳ script nào chạy trên trang đọc được nó.
- **Vì sao (từ mã):** `dmst-admin-main/src/lib/cookies.ts`; `dmst-user-main/src/shared/utils/authCookie.ts`.
- **Mức:** `trung bình` — không phải lỗ hổng tự khai thác được, nhưng nó biến mọi lỗ hổng chèn script thành chiếm phiên.
- **Cần quyết:** `quyết định sản phẩm`. `HttpOnly` không dùng được với kiến trúc hiện tại vì bộ chặn HTTP đọc token từ JavaScript. Hai lựa chọn: (a) thêm cờ `Secure` và bắt buộc HTTPS — rẻ, làm được ngay; (b) chuyển sang cookie phiên do máy chủ đặt — sạch hơn nhiều nhưng đổi cả cơ chế xác thực. Ít nhất phải làm (a).
- **Nêu bởi:** [admin/dang-nhap.md](admin/dang-nhap.md#trường-hợp-biên), [nen-tang/xac-thuc-va-vai-tro.md](nen-tang/xac-thuc-va-vai-tro.md#nơi-ba-client-cất-token)
- **Trạng thái:** **Đã làm lựa chọn (a)** 2026-09-04 — mức tối thiểu mà mục này nói "ít nhất phải làm": cả hai client gắn cờ `Secure` khi trang chạy trên HTTPS. Không đặt vô điều kiện vì môi trường phát triển chạy HTTP và cookie `Secure` sẽ bị trình duyệt bỏ im lặng. **Lựa chọn (b) vẫn cần quyết** — `HttpOnly` không dùng được chừng nào bộ chặn HTTP còn đọc token từ JavaScript, và đổi điều đó là đổi cả cơ chế xác thực.

### B-14: Ba `.env.example` vẫn trỏ cổng NestJS cũ

- **Người dùng gặp ở đâu:** Không phải người dùng cuối — người mới dựng môi trường phát triển gặp.
- **Xảy ra gì / lẽ ra là gì:** Cả ba tệp mẫu trỏ về cổng của hệ cũ: hai repo dùng `VITE_API_BASE_URL=http://localhost:3001`, landing page dùng `VITE_API_URL=https://api.example.com`. Backend .NET chạy ở **5000** (docker compose) hoặc **5199** (chạy tay theo `nacentech/README.md:20`).
- **Vì sao (từ mã):** Ba tệp `.env.example` không được cập nhật trong đợt chuyển stack. Nghiêm trọng hơn ở cổng người dùng: `src/services/api/client.ts:11` dùng `import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'` — giá trị này nằm trong **mã**, không chỉ trong tệp mẫu. Bảng quản trị thì rơi về đường dẫn tương đối `'/api/v1'` (`src/lib/api/client.ts:21`), tức là cần một proxy đứng trước — hành vi mặc định khác hẳn.
- **Mức:** `trung bình` — mỗi người mới vào dự án mất một buổi để phát hiện.
- **Cần quyết:** `sửa`. Cập nhật ba tệp mẫu, sửa giá trị mặc định trong mã của cổng người dùng, và thống nhất hành vi khi thiếu biến giữa hai client.
- **Nêu bởi:** [BMAD S-08](bmad/BMAD_SOI_Vong1_2026-09-04.md#s-08--cả-ba-frontend-vẫn-cấu-hình-trỏ-về-cổng-của-nestjs-cũ), [nen-tang/xac-thuc-va-vai-tro.md](nen-tang/xac-thuc-va-vai-tro.md#trường-hợp-biên)
- **Trạng thái:** **Đã sửa** 2026-09-04. Ba tệp `.env.example` trỏ `http://localhost:5199` và mang chú thích nói rõ cổng 5000 khi chạy docker. Quan trọng hơn: giá trị mặc định **trong mã** của cổng người dùng (`src/services/api/client.ts`) đổi từ `http://localhost:3001` sang chuỗi rỗng — tức dùng chính origin đang phục vụ trang, **cùng hành vi với bảng quản trị**. Hai client cùng một sản phẩm nay hỏng theo cùng một kiểu khi thiếu cùng một biến. Tệp mẫu của trang giới thiệu thêm cảnh báo về `Cors:Origins` mặc định chỉ cho 5173 và 5174.
- **Trạng thái trước khi sửa:** Xác nhận 2026-09-04 bằng đọc ba tệp `.env.example`.

### B-16: Xoá mềm nhưng không có đường khôi phục

- **Người dùng gặp ở đâu:** Bất kỳ ai xoá nhầm một đề bài hoặc một tài sản công nghệ.
- **Xảy ra gì / lẽ ra là gì:** Xoá chỉ đánh dấu thời điểm; dữ liệu và tệp đính kèm đều ở lại. Nhưng không có thùng rác, không nút khôi phục, không endpoint khôi phục. Truy vấn phía máy chủ **có** tham số lấy cả bản đã xoá, nhưng không màn hình nào dùng. Dữ liệu đã được giữ lại rồi; chỉ thiếu một nút.
- **Vì sao (từ mã):** `IDemandService.DeleteAsync` và `ITechnologyService.DeleteAsync` đặt mốc xoá; `DemandQuery`/`TechnologyQuery` có cờ lấy cả bản đã xoá. Không phương thức nào bỏ mốc đó.
- **Mức:** `trung bình` — mất dữ liệu về mặt trải nghiệm dù không mất về mặt lưu trữ.
- **Cần quyết:** `quyết định sản phẩm`. Chi phí thấp bất thường vì dữ liệu đã ở đó. Cần quyết: ai khôi phục được, và có thời hạn không.
- **Nêu bởi:** [nen-tang/luu-va-phien-ban.md](nen-tang/luu-va-phien-ban.md#câu-hỏi-mở-và-kiểm-chứng)

### B-17: Route chi tiết không có định danh trong đường dẫn

- **Người dùng gặp ở đâu:** Bảng quản trị, mọi màn chi tiết và sửa của đề bài, tài sản công nghệ và hồ sơ triển khai.
- **Xảy ra gì / lẽ ra là gì:** Đường dẫn là `/ips/detail`, `/challenges/edit`, `/implementations/detail` — không có định danh. Bản ghi đang xem đi qua trạng thái điều hướng hoặc query string. Hệ quả: URL không chia sẻ được, và tải lại trang nhiều khả năng mất bản ghi. Câu chuyện thì làm đúng (`/stories/:id`), và cổng người dùng làm đúng ở mọi màn.
- **Vì sao (từ mã):** `dmst-admin-main/src/app/router-config.tsx` — các route ở dòng 71–117 dùng đường dẫn tĩnh; route câu chuyện ở dòng 123–142 dùng tham số.
- **Mức:** `trung bình` — cản trở công việc hằng ngày (không gửi được liên kết cho đồng nghiệp) và làm hỏng nút Tải lại.
- **Cần quyết:** `sửa`. Chuyển sang tham số đường dẫn, theo đúng kiểu mà route câu chuyện và cổng người dùng đã dùng.
- **Nêu bởi:** [nen-tang/dieu-huong-va-url.md](nen-tang/dieu-huong-va-url.md#bảng-quản-trị)

### B-28: Tài liệu mức `Internal` hiện cho mọi người, kể cả khách chưa đăng nhập

- **Người dùng gặp ở đâu:** Bất kỳ chỗ nào liệt kê tài liệu của một bản ghi.
- **Xảy ra gì / lẽ ra là gì:** Bốn mức mật là `Public`, `Internal`, `Confidential`, `HighlyConfidential`, nhưng phép kiểm "có phải mật không" chỉ tính từ `Confidential` trở lên. `Internal` vì thế đi thẳng vào nhóm ai cũng đọc được, cùng với `Public`. Cái tên gợi ý ngược lại.
- **Vì sao (từ mã):** `packages/kernel/Domain/DataClassification.cs` — `IsConfidential()` trả đúng khi mức `>= Confidential`. `modules/dataroom/Application/DataRoomService.cs:132` dùng phép kiểm đó làm cửa đầu tiên và thêm thẳng tài liệu vào danh sách đọc được, trước cả khi biết người xem là ai.
- **Mức:** `trung bình` — hôm nay chưa có đường nào tạo tài liệu mức `Internal` (ánh xạ từ hệ cũ chỉ sinh ba mức còn lại), nên chưa lộ gì. Nó trở thành `cao` vào ngày đầu tiên ai đó dùng mức này và tin rằng nó nội bộ.
- **Cần quyết:** `quyết định sản phẩm`. Hai lựa chọn: đưa `Internal` vào nhóm cần kiểm quyền, hoặc bỏ nó khỏi mô hình. Một mức mật mà tên nói một đằng và hành vi nói một nẻo là thứ tệ hơn cả hai.
- **Nêu bởi:** [api-v2/dataroom-va-cap-quyen.md](api-v2/dataroom-va-cap-quyen.md), [moi/phong-du-lieu-va-cap-quyen.md](moi/phong-du-lieu-va-cap-quyen.md)
- **Trạng thái:** **Đã sửa** 2026-09-05 theo [ADR-0007](../../04-technical/adr/0007-muc-mat-internal.md) (nay `ACCEPTED`), lựa chọn **bỏ khỏi mô hình**. `DataClassification` còn ba thành viên; ánh xạ mức → mã dời về kernel và **không còn nhánh mặc định** `_ => "PUBLIC"` — một mức chưa ánh xạ nay là lỗi biên dịch chứ không âm thầm thành công khai.
  **Phát hiện làm nghiêng quyết định**, bản đề xuất chưa nêu: bảng quyết định **không có luật nào cho `INTERNAL`**, nên đường liệt kê hiện nó cho mọi người còn đường mở từ chối nó bằng `DEFAULT_DENY`. Hai tầng nói hai nẻo về cùng một mức.
  Không cần migration: cột lưu dạng chuỗi, và bảng `dataroom.documents` không có hàng nào mang `Internal`. Ba frontend không tham chiếu tên mức mật nào.
  Test canh: `tests/authorization/ClassificationCoverageTests.cs` — trong đó có bài vét cạn **mọi** giá trị của kiểu liệt kê phải kết thúc ở một quy tắc có tên, không bao giờ ở `DEFAULT_DENY`. Đó là bài lẽ ra đã bắt được mục này từ đầu; bài vét cạn cũ dùng danh sách mức viết tay nên không thấy mức nằm giữa.
- **Trạng thái trước khi sửa:** Xác nhận 2026-09-04 bằng đọc mã.

### B-42: Người giữ hai vai trò trong một hồ sơ bị chấm theo vai trò đầu tiên, không theo vai trò cho phép

- **Người dùng gặp ở đâu:** Console hồ sơ vụ việc, khi một người vừa là chủ bài toán vừa là môi giới chính (hoặc bất kỳ cặp vai trò nào) — họ bị **403 khi chuyển giai đoạn chính hồ sơ mình phụ trách**.
- **Xảy ra gì / lẽ ra là gì:** `CommercializationCase.RoleOf(personId)` trả `FirstOrDefault()` trên danh sách bên tham gia — tức **vai trò đầu tiên theo thứ tự chèn**. Chủ bài toán được thêm lúc tạo hồ sơ; môi giới chính thêm sau. Nên người giữ cả hai luôn được chấm là `PROBLEM_OWNER`, vốn chỉ được `case.read`, và `case.transition` bị từ chối với `DEFAULT_DENY` dù họ đang là `LEAD_BROKER`. Bảng quyết định nhận **một** `CaseRole`, nên mô hình hiện không diễn đạt được "bất kỳ vai trò nào của tôi cho phép".
- **Tái hiện:** Tạo hồ sơ với `problemOwnerPersonId = P`. Gán `P` làm môi giới chính (`POST /cases/{id}/lead-broker`). Bằng token của `P`, `POST /cases/{id}/transition` → **403**, `ruleId: DEFAULT_DENY`.
- **Vì sao (từ mã):** `modules/case/Domain/CommercializationCase.cs` — `RoleOf` dùng `.Select(p => p.Role).FirstOrDefault()`. `CaseService.RequireCaseAction` đưa đúng một vai trò vào `AuthorizationRequest.CaseRole`.
- **Mức:** `trung bình` — kịch bản một người nhiều vai trò là thật (môi giới kiêm nhà tài trợ, bên đánh giá kiêm đồng môi giới), và cách hỏng là **im lặng và sai chiều**: từ chối thứ lẽ ra được phép, kèm một dòng kiểm toán ghi **vai trò sai**. Nó cũng làm phép đo của chính lượt này sai một vòng — tôi dùng một tài khoản cho cả hai vai và tưởng luật phân quyền hỏng.
- **Cần quyết:** `sửa`, kèm một quyết định mô hình: (a) `RoleOf` trả **tập** vai trò và cửa phân quyền chấm theo "bất kỳ vai trò nào cho phép" — đúng nghĩa nhất, nhưng đổi hình dạng `AuthorizationRequest`; (b) `RoleOf` trả vai trò **mạnh nhất** theo một thứ tự ưu tiên cố định — rẻ, nhưng "mạnh nhất" là một thứ tự phải có người quyết và có thể sai theo hành động; (c) chấm từng vai trò một, cho qua khi có ít nhất một `Permit` — không đổi hình dạng, thêm một vòng lặp ở `RequireCaseAction`. Lựa chọn (c) là bước đi ít xâm lấn nhất và giữ được ngữ nghĩa của (a).
- **Nêu bởi:** phát hiện ngày 2026-09-05 khi đo vòng đời hồ sơ vụ việc qua HTTP lần đầu.
- **Trạng thái:** **Xác nhận bằng đo trên bản chạy** 2026-09-05. Cùng một người: vừa chủ bài toán vừa môi giới chính → 403. Hai người riêng biệt → mọi lệnh chạy đúng.
  **Đã sửa** 2026-09-05 theo **(c)**: `CommercializationCase.RolesOf(personId)` trả mọi vai trò đang hoạt động; `CaseService.RequireCaseAction` chấm từng vai bằng `gate.Evaluate`, qua khi có một `Permit`, không vai nào qua thì gọi `Require` với vai đầu — nên đường từ chối vẫn để lại đúng một dòng kiểm toán `DENY` như trước (kèm `details: roles=…` khi có nhiều vai). `RoleOf` giữ lại cho hiển thị, có chú thích cấm dùng để kiểm quyền. Test canh `tests/integration/MultiRoleAuthorizationTests.cs`: người hai vai chuyển được (**đỏ** khi tạm chấm chỉ vai đầu — 403 `case.transition`; **xanh** sau vá), và người chỉ là chủ bài toán **vẫn** bị từ chối kèm dòng `DENY`. Đo trên trình duyệt: `ui-cases.mjs`, cùng một tài khoản là chủ + môi giới chuyển Khám phá → Thẩm định thành công.

### B-43: Từ vựng kết quả kiểm toán lệch giữa cửa phân quyền, đặc tả và endpoint

- **Người dùng gặp ở đâu:** Màn hình nhật ký kiểm toán, ô lọc "Cho phép" — luôn ra 0 dòng.
- **Xảy ra gì / lẽ ra là gì:** Cửa phân quyền ghi **`PERMIT`**; đặc tả `api-v2/audit.md` nói **`ALLOW`**; endpoint `GET /api/v2/audit-events` theo đặc tả và chỉ nhận `ALLOW|DENY`. Ba tầng, ba từ, không test nào so chúng với nhau. Lọc theo `ALLOW` vì thế **không bao giờ khớp dòng nào** — và lượt đo sprint 1 ghi "ALLOW = 0 dòng" rồi hiểu nhầm đó là *chưa có dòng nào được phép*.
- **Vì sao (từ mã):** `packages/policy-engine/IAuthorizationGate.cs` viết chuỗi `"PERMIT"` tại chỗ; `AuditEventsController.NormalizeOutcome` viết `"ALLOW"` tại chỗ; không hằng số chung.
- **Mức:** `trung bình` — dữ liệu không mất, nhưng một bộ lọc im lặng trả rỗng là đúng cách một cuộc điều tra đi sai hướng, và chính lượt đo của đợt này đã đi sai một bước vì nó.
- **Nêu bởi:** phát hiện ngày 2026-09-05 khi đọc `Entry()` của cửa phân quyền để viết [ADR-0006](../../04-technical/adr/0006-kiem-toan-o-duong-thanh-cong.md).
- **Trạng thái:** **Đã sửa** 2026-09-05 trong cùng ADR. Ba từ khai một chỗ (`AuditOutcomes` ở kernel: `ALLOW`, `DENY`, `SUCCESS`); cửa phân quyền, tầng lệnh, endpoint và client cùng đọc từ đó. Không cần di trú: bảng có 18 dòng, toàn `DENY`, 0 dòng `PERMIT`. Test canh: `The_gate_writes_allow_not_permit_for_a_confidential_read`.

### B-40: `If-Match` và `ETag` được quảng cáo nhưng máy chủ không đọc, không phát

- **Người dùng gặp ở đâu:** Chưa gặp — chưa endpoint ghi nào của v2 tồn tại. Họ sẽ gặp dưới dạng **mất dữ liệu do ghi đè**, ở đúng loại bản ghi mà cơ chế phiên bản sinh ra để bảo vệ.
- **Xảy ra gì / lẽ ra là gì:** Hợp đồng API nói *"Bản ghi có tranh chấp trả `version` trong thân và `ETag` trong header. Lệnh ghi gửi lại số đó — trong thân request với tên `expectedVersion`, hoặc trong header `If-Match`."* Đo lại thì **một nửa câu đó không có thật**: không dòng mã nào đọc header `If-Match`, và không dòng nào đặt header `ETag`. Cấu hình CORS **có** mở `ETag` cho trình duyệt đọc — một header không bao giờ được gửi.
- **Tái hiện:** `grep -rn "If-Match\|IfMatch\|ETag" --include=*.cs` trên toàn bộ solution. Bốn kết quả: một dòng cấu hình CORS, và ba **chú thích** nhắc tới `If-Match` như một khái niệm. Không chỗ nào đọc hay ghi header.
- **Vì sao (từ mã):** Cơ chế thật đi qua tham số `expectedVersion` trong thân lệnh — ví dụ `ICaseService.AssignLeadBrokerAsync(id, brokerPersonId, int expectedVersion)`. Đó là đường **đang chạy được**. Header chỉ tồn tại trong đặc tả và trong chú thích.
- **Mức:** `trung bình` hôm nay, `cao` vào ngày endpoint ghi v2 đầu tiên ra đời. Đây là loại khiếm khuyết nguy hiểm hơn một tính năng thiếu: một client gửi `If-Match` đúng luật sẽ **tin rằng mình được bảo vệ**, trong khi máy chủ bỏ qua header và ghi đè. Thiếu hẳn thì lộ ngay; có một nửa thì im lặng.
- **Cần quyết:** `sửa`, và chốt **một** đường thay vì hai. Hai lựa chọn: (a) cài đặt `If-Match`/`ETag` cho đủ hợp đồng đã đặc tả — đúng chuẩn HTTP, và hoạt động được với bộ nhớ đệm; (b) bỏ `If-Match` khỏi đặc tả và chỉ giữ `expectedVersion` trong thân — ít mã hơn, nhưng lệch chuẩn và mất khả năng dùng cho lệnh `DELETE` vốn không có thân. Việc phải tránh bằng mọi giá là giữ nguyên tình trạng hiện nay: đặc tả hứa hai đường, mã chỉ có một, và không gì nói cho ai biết.
- **Ghi chú kèm theo:** cho tới khi mục này đóng, **cả hai client vẫn gắn header `If-Match`** — theo đúng hợp đồng, để ngày máy chủ cài đặt thì client đã sẵn sàng. Chỗ gắn mang chú thích cảnh báo rõ rằng máy chủ đang bỏ qua nó. Chỗ gọi phải đặt `expectedVersion` vào **thân** request; đó mới là thứ bảo vệ dữ liệu.
- **Nêu bởi:** phát hiện ngày 2026-09-04 khi dựng nền client v2 của sprint 3 và đi tìm phía máy chủ đọc header ở đâu.
- **Trạng thái:** **Đã sửa** 2026-09-04 theo **lựa chọn (a)** — cài đặt cho đủ hợp đồng đã đặc tả, thay vì bỏ header khỏi đặc tả.
  - `ETag` nay được phát ở mọi đường đọc một bản ghi có tranh chấp (`ConditionalWrite.ETagFor`, `V2ControllerBase.SetETag`). Đây là nửa mà không ai để ý là đang thiếu: client **không giữ được** số phiên bản nếu máy chủ không đưa nó ra, và khi đó `If-Match` ở lệnh ghi không có gì để gửi.
  - `If-Match` nay được đọc và gộp với `expectedVersion` của thân request theo một luật rõ: khớp nhau thì lấy, **lệch nhau thì từ chối** chứ không ưu tiên đường nào. Hai giá trị mâu thuẫn nghĩa là client đang nhầm về chính bản ghi nó định ghi, và im lặng chọn một trong hai là chọn hộ người gọi cái họ không yêu cầu.
  - Ba trường hợp bị **từ chối chứ không chấp nhận im lặng**, vì cả ba đều ngầm hứa một mức bảo vệ mà chúng không cho: etag yếu (`W/"5"` — RFC 9110 §13.1.1 đòi so sánh mạnh), danh sách nhiều etag, và giá trị sai định dạng. `*` được nhận và hiểu là *bỏ kiểm tranh chấp có chủ ý*.
  - Đo trên bản chạy: `GET /api/v2/cases/{id}` trả `ETag: "0"` khớp `version` trong thân.
  - Test: `tests/contracts/ConditionalWriteTests.cs`, 18 bài.
- **Trạng thái trước khi sửa:** Xác nhận 2026-09-04 bằng grep toàn bộ solution — bốn kết quả, gồm một dòng cấu hình CORS và ba chú thích, không dòng nào đọc hay ghi header.

### B-36: Cổng chất lượng được liệt kê là "đã có tầng dịch vụ" nhưng không có mã nào nâng được mức

- **Người dùng gặp ở đâu:** Không gặp. Người lập kế hoạch gặp — dưới dạng một ước lượng sai.
- **Xảy ra gì / lẽ ra là gì:** `TechnologyAsset.QualityLevel` có bốn giá trị khai trong `QualityLevels`, trong đó `TRANSACTION_READY` là mức mà cổng chất lượng tồn tại để cấp. Nhưng **không có phương thức nào đổi được mức**, ở bất kỳ tầng nào: không ở domain, không ở `ITechnologyService`, không ở đâu. Trường này được gán đúng ba chỗ — khởi tạo, khai báo, và `ApplyImportFields` — cả ba đều gán `UNREVIEWED`. Hằng số `TRANSACTION_READY` được khai rồi **không dòng nào tham chiếu tới**.
- **Tái hiện:** `grep -rn "QualityLevel" --include=*.cs modules packages apps tools` và tìm một phép gán khác `UNREVIEWED`. Không có. Rồi `grep -rn "TransactionReady"` — chỉ trúng đúng dòng khai hằng số.
- **Vì sao (tài liệu nói gì):** [`BAN-GIAO.md`](BAN-GIAO.md) và [B-03](#b-03-bảy-năng-lực-backend-không-có-đường-tới-người-dùng) đều xếp cổng chất lượng vào nhóm **bảy** năng lực "có tầng dịch vụ hoàn chỉnh, có bất biến, có kiểm quyền, và không có endpoint". Sáu năng lực kia đúng như mô tả. Cái thứ bảy thì không: nó không thiếu cửa, nó thiếu phòng.
- **Mức:** `trung bình` — không hỏng gì đang chạy, nhưng nó làm sai lệch ước lượng ở đúng chỗ tốn kém nhất. Sáu năng lực kia là viết controller trên tầng dịch vụ đã có; cái này là thiết kế ma trận chuyển mức chất lượng, viết domain, viết bất biến, viết test, rồi mới tới controller. Ai lập kế hoạch dựa trên con số bảy sẽ hụt đúng phần khó nhất.
- **Cần quyết:** `sửa` — nhưng sửa **tài liệu** trước, và ngay. Sửa mã là một việc riêng thuộc sprint 6, cần quyết định sản phẩm về việc ai được nâng mức và điều kiện nào cho phép nâng. Trong lúc chưa quyết, nên cân nhắc bỏ `TRANSACTION_READY` khỏi bộ hằng số: một giá trị liệt kê không đường nào tạo ra được thì cùng loại với vấn đề mà [B-28](#b-28-tài-liệu-mức-internal-hiện-cho-mọi-người-kể-cả-khách-chưa-đăng-nhập) mô tả ở `Internal`, và cửa sổ rẻ nhất để đổi bộ giá trị là lúc chưa có dữ liệu nào mang nó.
- **Nêu bởi:** phát hiện ngày 2026-09-04 khi kiểm kê năng lực để lập kế hoạch sprint 3–6; không tài liệu nào trước đó nêu.
- **Trạng thái:** Xác nhận 2026-09-04 bằng grep toàn bộ solution. Con số đúng là **6 năng lực chờ cửa + 1 năng lực chờ xây từ đầu**, không phải 7 năng lực chờ cửa.

### B-29: Tài liệu bị loại khỏi danh sách không sinh dòng kiểm toán từ chối

- **Người dùng gặp ở đâu:** Không nhìn thấy. Người đọc nhật ký kiểm toán gặp — dưới dạng một khoảng trống.
- **Xảy ra gì / lẽ ra là gì:** Khi lọc danh sách tài liệu, tầng dịch vụ chỉ **hỏi** bảng quyết định chứ không đi qua cửa ghi, nên lượt bị loại **không để lại dòng `DENY`** nào. Chú thích ngay trên phương thức đó viện dẫn các điều khoản yêu cầu ghi lại lượt từ chối. Đường mở một tài liệu thì đi qua cửa ghi và có ghi lại; đường liệt kê thì không.
- **Vì sao (từ mã):** `modules/dataroom/Application/DataRoomService.cs:139` gọi `gate.Evaluate(...)` thay vì `gate.Require(...)`. Chỉ `Require` mới ghi kiểm toán.
- **Mức:** `trung bình` — cách phổ biến nhất mà một người chạm vào tài liệu mật họ không được đọc lại là cách duy nhất không để lại vết.
- **Cần quyết:** `sửa`, nhưng cần một cách ghi phù hợp với việc lọc hàng loạt: gọi cửa ghi cho từng tài liệu bị loại sẽ sinh rất nhiều dòng. Một dòng tổng hợp cho mỗi lần liệt kê, ghi số tài liệu bị loại, có lẽ đúng hơn.
- **Ghi chú kèm theo:** cùng nhóm với hai khoảng trống khác trong nhật ký — **mọi hành động ghi thành công** (tạo hồ sơ, chuyển giai đoạn, giao việc, cấp và thu hồi quyền đọc) hiện **không** sinh dòng nào, vì chỉ cửa phân quyền mới ghi; và lượt đọc tài liệu mật được ghi nhưng **không mang mục đích**, đúng ô mà thiết kế nói nó phải có.
- **Nêu bởi:** [api-v2/dataroom-va-cap-quyen.md](api-v2/dataroom-va-cap-quyen.md), [api-v2/audit.md](api-v2/audit.md), [moi/nhat-ky-kiem-toan.md](moi/nhat-ky-kiem-toan.md)
- **Trạng thái:** **Đã sửa** 2026-09-04, đúng cách mà mục này đề nghị: **một dòng tổng hợp cho mỗi lượt liệt kê**, mang số tài liệu bị loại và phân bố theo mức mật (`excludedCount=1; byClassification=HIGHLY_CONFIDENTIAL=1`).
  Không dùng `Require` cho từng tài liệu vì hai lý do: nó **ném exception** nên không lọc được, và nó sẽ đẻ một dòng cho mỗi tài liệu — một bản ghi 40 tài liệu mật sẽ sinh 40 dòng mỗi lần ai đó mở trang.
  Không có gì bị loại thì **không ghi gì** — nhật ký không được tự làm dày mình.
  Test: `tests/integration/AuditGapTests.cs`. Đã chứng minh test bắt được lỗi: gỡ dòng ghi thì bài đỏ với đúng `denial should not be null`.
- **Trạng thái trước khi sửa:** Xác nhận 2026-09-04 bằng đọc mã.

### B-30: Việc cắt dữ liệu thiết bị hết hạn chưa bao giờ chạy

- **Người dùng gặp ở đâu:** Không nhìn thấy. Nó là một cam kết về lưu trữ dữ liệu cá nhân đang không được giữ.
- **Xảy ra gì / lẽ ra là gì:** Địa chỉ IP và trình duyệt được lưu kèm mỗi sự kiện kiểm toán và có thời hạn lưu riêng, ngắn hơn bản thân sự kiện. Phương thức cắt chúng tồn tại, nhưng **không xử lý nào được đăng ký** cho loại nghĩa vụ định kỳ tương ứng, và **không thời hạn nào được cấu hình**. Nghĩa là dữ liệu thiết bị được giữ vô thời hạn.
- **Vì sao (từ mã):** `IAuditQuery.PurgeDeviceDataAsync` tồn tại và có chú thích nói nó chạy từ một nghĩa vụ định kỳ; không tìm thấy nơi đăng ký nghĩa vụ đó, và không khoá cấu hình nào đặt thời hạn.
- **Mức:** `trung bình` — không hỏng gì, nhưng nó là khoảng cách giữa cái tài liệu kiến trúc hứa và cái hệ thống làm, đúng ở chỗ nhạy cảm nhất.
- **Cần quyết:** `sửa`, kèm một quyết định sản phẩm: thời hạn lưu dấu vết thiết bị là bao lâu, và thời hạn lưu bản thân sự kiện là bao lâu. Cả hai con số hiện chưa tồn tại ở đâu.
- **Nêu bởi:** [api-v2/audit.md](api-v2/audit.md), [moi/nhat-ky-kiem-toan.md](moi/nhat-ky-kiem-toan.md)
- **Trạng thái:** **Đã sửa** 2026-09-04. Ba mảnh phải đủ thì một nghĩa vụ định kỳ mới chạy, và trước sprint 4 hệ thống chỉ có mảnh thứ nhất:
  1. Bộ chạy nền quét mục quá hạn — **đã có sẵn**.
  2. Một xử lý đăng ký cho loại nghĩa vụ — `RetentionReviewHandler` (`RETENTION_REVIEW`). Trước đó `IScheduledObligationHandler` có **0 bản cài đặt** trong toàn bộ mã.
  3. Một thứ tạo ra mục lịch đầu tiên — `RecurringObligationSeeder` xếp lịch cho **mọi** loại nghĩa vụ đã đăng ký xử lý. Không có mảnh này thì dù có xử lý, bảng lịch vẫn rỗng.
  Mỗi lượt chạy xong tự xếp lượt kế tiếp, vì bảng nghĩa vụ là một-lần theo thiết kế.
  **Hai con số nay đã tồn tại**, trong `appsettings.json` chứ không trong mã: `Audit:Retention:DeviceDataRetentionDays = 90` và `ReviewIntervalHours = 24`. Con số 90 là **đề xuất, cần đội chốt** — đổi nó là đổi một cam kết về dữ liệu cá nhân. Thời hạn lưu của **bản thân sự kiện** vẫn chưa được quyết và cố ý chưa có ở đây: một cơ chế xoá sự kiện khỏi nhật ký chỉ-ghi-thêm cần quyết định riêng.
  Đo lại: dòng cũ hơn mốc mất `ipAddress`/`userAgent` nhưng giữ nguyên `action`, `outcome`, `ruleId`, `correlationId`; dòng còn trong hạn không bị đụng.
- **Con số đã chốt** 2026-09-04: `DeviceDataRetentionDays = 90`. Đội xác nhận. **Chỉ một trong hai con số được trả lời** — thời hạn lưu của *bản thân sự kiện kiểm toán* vẫn chưa quyết, và cố ý chưa có trong cấu hình: xoá sự kiện khỏi một nhật ký chỉ-ghi-thêm là quyết định khác hẳn về bản chất.
- **Lỗi thứ hai, tìm ra khi quan sát cả vòng chạy** (2026-09-04): việc rà **không tự nối lượt kế tiếp**, nên nó chạy đúng một lần mỗi lần khởi động rồi im lặng dừng.
  Nguyên nhân: bộ chạy nền chỉ đánh dấu mục lịch là `FIRED` **sau khi** xử lý trả về, nên trong lúc xử lý chạy, mục của chính nó vẫn ở trạng thái chờ. Phép chống trùng thấy chính nó, bỏ qua, và không xếp lượt sau.
  **Không test đơn vị nào bắt được**: từng mảnh đều đúng, chỉ thứ tự giữa chúng là sai. Nó chỉ lộ ra khi cả vòng chạy trên máy chủ thật — và nếu không đo, bản vá đã được báo là xong.
  Đã sửa: `EnsureScheduledAsync` nhận `excludeObligationId`. Đo lại: mục đầu `FIRED`, và **lượt kế tiếp đã được xếp cho hôm sau**; không còn dòng quá hạn nào giữ dấu vết. Test canh: `A_recurring_obligation_schedules_its_next_run_without_seeing_itself`.

### B-21: Năm nút kêu gọi trên trang giới thiệu trỏ về hệ NacenTwin cũ

- **Người dùng gặp ở đâu:** Trang giới thiệu công khai, các nút kêu gọi hành động chính.
- **Xảy ra gì / lẽ ra là gì:** Năm nút trỏ tới `https://twin.nacentech.vn/` — hệ NacenTwin/NestJS mà bản .NET vừa thay thế. Lẽ ra chúng trỏ tới cổng người dùng hiện tại.
- **Vì sao (từ mã):** Địa chỉ viết cứng trong các thành phần của trang giới thiệu, không được cập nhật trong đợt chuyển stack.
- **Mức:** `trung bình` — mọi khách vãng lai bấm nút chính của trang chủ đều bị đưa sang hệ cũ. Nếu hệ cũ còn chạy, họ đăng ký ở đó và dữ liệu không về hệ mới; nếu đã tắt, họ gặp trang chết.
- **Cần quyết:** `sửa`. Cùng nhóm với [B-14](#b-14-ba-envexample-vẫn-trỏ-cổng-nestjs-cũ): mọi địa chỉ trỏ về hệ cũ phải được rà một lượt.
- **Nêu bởi:** [landing/trang-chu-va-cau-chuyen.md](landing/trang-chu-va-cau-chuyen.md)
- **Trạng thái:** **Xác nhận trong gói phát hành** 2026-09-04. `npm run build` trên trang giới thiệu, rồi tìm trong `dist/`: chuỗi `twin.nacentech.vn` xuất hiện **5 lần** — đúng năm nút kêu gọi.
- **Đã sửa** 2026-09-04. Năm liên kết đọc `PORTAL_URL` từ `src/core/config.ts`, lấy từ biến `VITE_PORTAL_URL`. Grep lại `src/`: **0 tham chiếu** tới hệ cũ. Mặc định là cổng phát triển `localhost:5173`, và tệp mẫu ghi rõ bản dựng production **bắt buộc** đặt biến này — hỏng ồn ào, thay cho cách hỏng im lặng đã sống sót qua cả đợt chuyển stack.

### B-22: Trang giới thiệu có thể trắng khi tác giả câu chuyện không tra được

- **Người dùng gặp ở đâu:** Trang giới thiệu công khai, mục câu chuyện thành công.
- **Xảy ra gì / lẽ ra là gì:** Máy chủ trả `author: null` khi tra danh bạ người dùng trượt. Kiểu dữ liệu phía trang giới thiệu khai báo trường đó luôn có, và thẻ câu chuyện đọc thẳng vào nó. Không có lớp bắt lỗi bao quanh, nên một câu chuyện có tác giả không tra được sẽ làm **trắng cả trang công khai**, không chỉ hỏng một thẻ.
- **Vì sao (từ mã):** `apps/api/V1Compat/V1Mappers.cs:114` — `author = author is null ? null : UserBrief(author)`. Phía trang giới thiệu, kiểu khai báo không cho phép `null`.
- **Mức:** `trung bình` — xác suất thấp nhưng hậu quả là toàn bộ trang công khai, và nó phụ thuộc vào dữ liệu chứ không vào thao tác của người dùng.
- **Cần quyết:** `sửa`. Cho phép tác giả rỗng trong kiểu dữ liệu, và bọc mục câu chuyện bằng một lớp bắt lỗi để một thẻ hỏng không kéo cả trang.
- **Nêu bởi:** [landing/trang-chu-va-cau-chuyen.md](landing/trang-chu-va-cau-chuyen.md)
- **Trạng thái:** **Đã sửa** 2026-09-04. Kiểu `Story.author` nay cho phép `null`; hai chỗ đọc `story.author.firstName` chuyển sang một hàm chịu được `null`; và mỗi thẻ câu chuyện được bọc trong một `ErrorBoundary` riêng, nên một thẻ hỏng chỉ mất một thẻ.
  **Phát hiện kèm theo, và nó đổi cách đọc mọi lỗi kiểu ở repo này:** `tsconfig.json` của trang giới thiệu đặt `"strict": false`, nên `strictNullChecks` tắt. Sửa kiểu ở đó **không** khiến trình biên dịch bắt được gì — đó chính là lý do lỗi này tồn tại được, và là lý do bản vá phải sửa thẳng chỗ đọc dữ liệu chứ không chỉ sửa khai báo. Một lượt bật `strict` cho repo này là việc riêng, đáng làm, và sẽ lộ ra thêm.
- **Trạng thái trước khi sửa:** Nửa phía máy chủ xác nhận 2026-09-04 bằng đọc mã; nửa phía trang giới thiệu chưa dựng để đo.

## Thấp

### B-38: Bộ lọc trạng thái và trạng thái hiển thị dùng chung một kiểu, và ô chọn phát ra giá trị ngoài kiểu đó

- **Người dùng gặp ở đâu:** Bảng quản trị, `/users`, ô lọc theo trạng thái. Không gặp hậu quả hôm nay.
- **Xảy ra gì / lẽ ra là gì:** `UserStatus` (`pending | active | locked`) là trạng thái **hiển thị của một dòng**, nhưng nó bị dùng luôn làm kiểu của **bộ lọc**, vốn chỉ có ba giá trị của máy chủ: `all | active | inactive`. Ô chọn thực tế phát ra `'inactive'` — một giá trị **không nằm trong** kiểu đã khai — và lọt qua nhờ một phép ép kiểu. `'pending'` thì không đường nào phát ra được, mà nếu phát ra thì máy chủ rơi vào nhánh mặc định và trả về **không lọc gì**, tức là ô lọc im lặng không làm gì.
- **Vì sao (từ mã):** `src/features/users/hooks/useUsersList.ts` — `toBackendStatus` không xử lý `'pending'`; `src/features/users/components/UsersFilters.tsx:82` ép `v as 'all' | UserStatus`. Phía máy chủ: `PersonService.AdminListAsync` dùng `_ => q` cho mọi giá trị lạ.
- **Mức:** `thấp` — hôm nay vô hại vì ô chọn chỉ phát ra ba giá trị máy chủ hiểu. Nó trở thành lỗi thật vào ngày ai đó thêm mục "Chờ kích hoạt" vào ô lọc, và mục đó sẽ im lặng trả về toàn bộ danh sách.
- **Cần quyết:** `sửa`. Tách hai bộ từ vựng: bộ lọc dùng kiểu riêng của máy chủ, trạng thái dòng giữ `UserStatus`. Bỏ luôn phép ép kiểu ở ô chọn — chính nó che lỗi.
- **Ghi chú kèm theo:** lỗi biên dịch của `toBackendStatus` từng làm `npm run typecheck` của bảng quản trị **fail**, tức là cổng chất lượng của repo đó không xanh trước sprint 2. Đã vá tạm để giữ hành vi nguyên vẹn và làm typecheck sạch; phần tách từ vựng vẫn còn.
- **Nêu bởi:** phát hiện ngày 2026-09-04 khi chạy `npm run typecheck` trong lúc sửa B-26.
- **Trạng thái:** Xác nhận 2026-09-04 bằng đọc mã ở cả hai phía. `typecheck` nay sạch.
  **Đã sửa** 2026-09-05: kiểu mới `UserStatusFilter = 'all' | 'active' | 'inactive'` trong `features/users/types.ts`; ô chọn, hook và trang dùng kiểu đó; `toBackendStatus` và phép ép `as 'all' | UserStatus` bị xoá — `UserStatus` chỉ còn là trạng thái dòng. Đo trên trình duyệt (`ui-cases.mjs`): đổi ô chọn phát ra `status=active`, không có `locked`/`pending` trong bất kỳ lời gọi nào.

### B-41: `Cors:Origins` khai `localhost` nên mở bằng `127.0.0.1` là hỏng im lặng

- **Người dùng gặp ở đâu:** Không phải người dùng cuối — người dựng môi trường phát triển gặp, và gặp dưới dạng "đăng nhập không làm gì cả".
- **Xảy ra gì / lẽ ra là gì:** `Cors:Origins` mặc định là `http://localhost:5173` và `http://localhost:5174`. Trình duyệt coi `localhost` và `127.0.0.1` là **hai origin khác nhau**, nên mở bảng quản trị bằng `http://127.0.0.1:5174` làm mọi lời gọi API fail với `net::ERR_FAILED`. Không có mã trạng thái, không có thân lỗi, và trên màn hình chỉ hiện một câu lỗi chung — người dựng sẽ đi tìm ở phía máy chủ, nơi không có gì sai cả.
- **Tái hiện:** Chạy backend và bảng quản trị, mở `http://127.0.0.1:5174/login`, đăng nhập bằng tài khoản đúng. Đọc tab Network.
- **Vì sao (từ mã):** `apps/api/Program.cs` — danh sách origin mặc định chỉ có dạng `localhost`. Vite thì in **cả hai** dạng địa chỉ ra terminal khi khởi động, nên chọn nhầm là chuyện bình thường chứ không phải bất cẩn.
- **Mức:** `thấp` — không ảnh hưởng bản phát hành, nhưng nó tốn của mỗi người mới một vòng gỡ rối đi sai hướng, và triệu chứng trông hệt như "backend chết". Cùng họ với [B-14](#b-14-ba-envexample-vẫn-trỏ-cổng-nestjs-cũ) và với cái bẫy CORS mà bộ tài liệu đã cảnh báo cho trang giới thiệu.
- **Cần quyết:** `sửa`. Rẻ nhất: thêm cả dạng `127.0.0.1` vào danh sách mặc định của môi trường phát triển. Kèm theo, nên ghi vào hướng dẫn dựng rằng địa chỉ phải khớp **đúng từng ký tự** với `Cors:Origins`.
- **Nêu bởi:** phát hiện ngày 2026-09-04 trong lượt nghiệm thu trên trình duyệt đầu tiên — lượt đó mất một vòng chẩn đoán vì đúng cái bẫy này.
- **Trạng thái:** **Xác nhận bằng đo trên trình duyệt** 2026-09-04. Qua `127.0.0.1:5174`: `POST /api/v1/admin/auth/login` → `net::ERR_FAILED`, không có phản hồi. Qua `localhost:5174`: đăng nhập thành công.
  **Đã sửa** 2026-09-05: mặc định phát triển (cả `Program.cs` lẫn `appsettings.json`) nay là **sáu** origin — `localhost` và `127.0.0.1` cho `5173`, `5174`, `5175`. Cổng thứ ba là trang giới thiệu, nay ghim `5175` với `strictPort` trong `vite.config.ts` của nó (trước không ghim, nên nó trôi theo thứ tự khởi động và rơi ra ngoài danh sách). Đo: trang giới thiệu ở `localhost:5175` gọi được `/public/stories` → 200, mục câu chuyện hiện (`ui-landing.mjs`, LANDING-01).

### B-44: Sửa intake v1 bằng thân JSON trả 200 mà không đổi gì

- **Người dùng gặp ở đâu:** Không trên giao diện — hai client gửi multipart đúng như máy chủ đòi. Người gọi API thẳng (script, tích hợp) gặp.
- **Xảy ra gì / lẽ ra là gì:** `PATCH /api/v1/my/intakes/{id}` và `PATCH /api/v1/admin/intakes/{id}` khai `[FromForm]`. Gửi thân `application/json` hợp lệ → **200** kèm bản ghi, nhưng **không trường nào đổi** và không có phiên bản nội dung mới: model binding không tìm thấy form, DTO toàn `null`, và lệnh sửa coi `null` là "không đổi". Lẽ ra là **415** (kiểu nội dung không hỗ trợ) hoặc **400**. Một lệnh ghi trả 200 mà không ghi là loại lỗi im lặng đúng nghĩa.
- **Tái hiện:** `PATCH /api/v1/my/intakes/{id}` với `Content-Type: application/json` và `{"title":"x"}`. Đọc lại bản ghi.
- **Vì sao (từ mã):** `apps/api/V1Compat/IntakesControllers.cs` — hai action `Update(Guid id, [FromForm] IntakeFormDto dto, …)`; không có `[Consumes("multipart/form-data")]`, nên ASP.NET Core không từ chối kiểu nội dung khác mà chỉ bind rỗng.
- **Mức:** `thấp` — hai client gửi đúng; hỏng chỉ với người gọi thẳng, và họ nhận 200 nên có thể tin là đã lưu.
- **Cần quyết:** `sửa`. Rẻ nhất: thêm `[Consumes("multipart/form-data")]` cho hai action → 415 khi gửi sai kiểu. Không đụng client.
- **Nêu bởi:** phát hiện ngày 2026-09-05 khi dàn dựng `ui-rounds.mjs` — gửi JSON, nhận 200, `currentVersionNo` vẫn là 1.
- **Trạng thái:** **Xác nhận bằng đo trên bản chạy** 2026-09-05, và **đã sửa cùng ngày**: `[Consumes("multipart/form-data")]` trên hai action `Update`. Đo lại: `PATCH` thân JSON → **415**; multipart → 200 như cũ. Hai client không đổi gì vì vẫn gửi multipart.

### B-45: Ngưỡng điểm ghép cặp đặt theo thang cũ loại mọi kết quả ở chế độ đã sửa

- **Người dùng gặp ở đâu:** Kết quả ghép cặp và tìm kiếm khi máy chủ chạy `Matching:ScoringMode = CORRECTED_SCORING` — luôn **rỗng**.
- **Xảy ra gì / lẽ ra là gì:** `MatchingOptions.MatchMinScore = 1.0` được đặt cho thang điểm chế độ cũ (cosine cộng điểm từ khoá, thường 1–10). Chế độ đã sửa trả điểm RRF: tổng các `1/(60+hạng)`, tối đa `2/61 ≈ 0,033`. `ExecuteSearchAsync` lọc `Score >= MinScore` sau khi hợp nhất, nên ở chế độ đã sửa **không kết quả nào qua ngưỡng**. Lẽ ra ngưỡng phải theo chế độ, hoặc chế độ đã sửa không dùng ngưỡng tuyệt đối mà dùng số kết quả.
- **Tái hiện:** Chạy với `CORRECTED_SCORING`, có ít nhất một cặp đề bài–công nghệ đã xuất bản, tính vòng → 0 ứng viên; đọc `search_query_logs.result_subject_ids` rỗng.
- **Vì sao (từ mã):** `modules/matching/Application/MatchingService.cs`, `ExecuteSearchAsync`: `candidates.Where(h => h.Score >= query.MinScore)`; `ComputeMatchesAsync` truyền `_options.MatchMinScore`. Lỗi có từ trước, độc lập với công cụ tìm kiếm — với Elasticsearch RRF cũng cho điểm ≤ 0,033.
- **Mức:** `trung bình` — chế độ đã sửa là chế độ đích; bật lên là mất toàn bộ kết quả, im lặng.
- **Cần quyết:** `quyết định sản phẩm` — ngưỡng có ý nghĩa gì ở chế độ RRF? Đề xuất: bỏ ngưỡng tuyệt đối ở chế độ đã sửa (chỉ giữ `MatchLimit`), hoặc đặt `MatchMinScore` riêng cho từng chế độ với mặc định 0 cho RRF.
- **Nêu bởi:** phát hiện ngày 2026-09-05 khi viết ADR-0010 và đọc lại đường lọc điểm.
- **Trạng thái:** Xác nhận bằng đọc mã. **Đã sửa** 2026-09-05: `MatchMinScoreCorrected` (mặc định 0) áp cho chế độ đã sửa bất kể người gọi gửi số nào — hai thang không quy đổi được, giả vờ quy đổi còn tệ hơn bỏ qua; chế độ cũ giữ nguyên luật. Nhật ký truy vấn ghi ngưỡng thật đã áp. Test canh `MatchingPipelineTests.Corrected_mode_ignores_legacy_scale_threshold…` (cùng ngưỡng 2.0: chế độ cũ rỗng, chế độ đã sửa có kết quả). **Đo trên bản chạy** với sidecar thật: `POST /api/v1/search` ở chế độ đã sửa, ngưỡng mặc định 2.0, trả kết quả (`verify-b27.sh`).

### B-46: Vòng mới nhất báo 0 ứng viên dù có 10

- **Người dùng gặp ở đâu:** Bảng quản trị, phần đầu trang vòng ghép cặp (`GET .../match-rounds/latest`): ô "Số ứng viên" hiện **0** trong khi bảng ứng viên dưới có 10 dòng.
- **Xảy ra gì / lẽ ra là gì:** `GetLatestRoundAsync` đọc `round.Candidates.Count` trên một entity tải **không `Include`** navigation → luôn 0. Các đường khác (`ListRoundsAsync`, `GetRoundAsync`) đếm bằng truy vấn nên đúng — cùng một con số, hai đường, hai giá trị.
- **Vì sao (từ mã):** `MatchingService.GetLatestRoundAsync` gọi `ToDto(round)` (đếm navigation) thay vì `ToDto(round, count)`.
- **Mức:** `thấp` — sai số hiển thị, không mất dữ liệu; nhưng nó nói "đã tính và không tìm thấy ai" — đúng thông điệp mà đặc tả bảo phải phân biệt cẩn thận.
- **Nêu bởi:** phát hiện ngày 2026-09-05 ở vòng thật đầu tiên tính bằng `POST /api/v2/.../match-rounds` (`ui-rounds-real.mjs`): latest báo 0, candidates trả 10.
- **Trạng thái:** **Đã sửa** cùng ngày: đếm bằng truy vấn. Test canh trong `MatchRoundHistoryTests`; kịch bản trực tiếp khẳng định `candidateCount > 0`.

### B-33: Bốn danh sách cho phép lấy 1000 dòng một lần

- **Người dùng gặp ở đâu:** Không nhìn thấy trên giao diện.
- **Xảy ra gì / lẽ ra là gì:** Nền tảng đặt trần phân trang là 100, nhưng bốn nhóm endpoint nâng lên **1000**: danh sách người dùng, thông báo, lời mời hợp tác, và một chỗ trong mã gọi thẳng với mặc định *và* trần đều bằng 1000. Nghĩa là một lời gọi duy nhất kéo về một nghìn hồ sơ người dùng, mỗi hồ sơ kèm email, số điện thoại và tổ chức.
- **Tái hiện:** `GET /api/v1/admin/users?limit=1000` với token quản trị.
- **Vì sao (từ mã):** `UsersController.cs` — `PageRequest.Of(page, limit, defaultLimit: 10, maxLimit: 1000)` và `PageRequest.Of(1, 1000, 1000, 1000)`; `NotificationsControllers.cs` và `CollaborationControllers.cs` — trần 1000.
- **Mức:** `thấp` với ba nhóm đầu; đáng bàn hơn với danh sách người dùng, vì nó biến một tài khoản quản trị bị chiếm thành một lần xuất toàn bộ danh bạ trong một request.
- **Cần quyết:** `quyết định sản phẩm`. Nếu có màn hình nào thật sự cần 1000 dòng một lần, đó nên là một đường xuất dữ liệu riêng, có ghi kiểm toán, chứ không phải một tham số của danh sách thường.
- **Ghi chú kèm theo:** cùng chỗ này còn một bất nhất nhỏ — **mặc định và trần khác nhau ở từng endpoint** mà không có bảng nào ở phía máy chủ nói ra. Câu chuyện công khai dùng 10/50 trong khi câu chuyện ở đường quản trị dùng 20/100. Giao diện không suy được trần từ một chỗ; nó phải luôn đọc `limit` trong phản hồi.
- **Nêu bởi:** [nen-tang/hop-dong-api.md](nen-tang/hop-dong-api.md#danh-sách-và-phân-trang)
- **Trạng thái:** **Xác nhận bằng đo trên bản chạy** 2026-09-04. `GET /api/v1/public/stories?limit=500` trả `limit: 50`; không tham số trả `page: 1, limit: 10` — cả hai khác con số 20/100 mà bản đầu của tài liệu nền tảng ghi. Bảng trần đầy đủ đọc từ bảy chỗ gọi trong `V1Compat/`.

### B-34: Phụ thuộc có khuyến cáo bảo mật mức cao

- **Người dùng gặp ở đâu:** Không nhìn thấy.
- **Xảy ra gì / lẽ ra là gì:** Bản dựng phát ra tám cảnh báo khuyến cáo bảo mật: **sáu mức cao** cho `System.Security.Cryptography.Xml` 9.0.0 (qua `packages/persistence`), và hai mức trung bình cho `MailKit` và `MimeKit` 4.14.0 (qua `modules/integration`). Bản dựng vẫn thành công — cảnh báo không chặn gì.
- **Tái hiện:** `dotnet build NacenTech.slnx` hoặc `dotnet test`, đọc các dòng `NU1903` và `NU1902`.
- **Mức:** `thấp` cho tới khi biết đường nào thực sự dùng tới chúng. `System.Security.Cryptography.Xml` đến gián tiếp và có thể không nằm trên đường chạy nào; `MailKit` thì có — nó là thư viện gửi thư.
- **Cần quyết:** `sửa`. Nâng phiên bản, hoặc ghi lại lý do giữ. Kèm theo: nên bật cảnh báo phụ thuộc thành lỗi trong bản dựng kiểm tra, nếu không tám dòng này sẽ trôi qua mọi lần dựng mà không ai đọc.
- **Nêu bởi:** [BMAD S-13](bmad/BMAD_SOI_Vong1_2026-09-04.md#s-13--44-test-đều-xanh-và-không-test-nào-chạm-tới-lỗi-nặng-nhất)
- **Trạng thái:** **Xác nhận bằng đo** 2026-09-04, đọc từ đầu ra của `dotnet test`.

### B-23: Hai bề mặt công bố hai bộ thông tin liên hệ khác nhau

- **Người dùng gặp ở đâu:** Trang liên hệ của cổng người dùng, và chân trang giới thiệu.
- **Xảy ra gì / lẽ ra là gì:** Hai bề mặt công bố hai địa chỉ, hai số điện thoại và hai hộp thư khác nhau. Một trong hai sai. Số điện thoại ở cổng người dùng còn là chuỗi giữ chỗ dạng `1900 xxxx` và đang hiển thị nguyên trạng.
- **Vì sao (từ mã):** Cả hai bộ viết cứng trong hai repo khác nhau, không có nguồn chung.
- **Mức:** `thấp` — không hại kỹ thuật, nhưng là thông tin sai của một cổng thuộc cơ quan nhà nước.
- **Cần quyết:** `sửa`. Chốt bộ đúng, sửa cả hai, và bỏ chuỗi giữ chỗ.
- **Nêu bởi:** [portal/khu-vuc-chua-co-backend.md](portal/khu-vuc-chua-co-backend.md), [landing/trang-chu-va-cau-chuyen.md](landing/trang-chu-va-cau-chuyen.md)
- **Trạng thái:** **Xác nhận trong gói phát hành** 2026-09-04. Bản dựng của cổng người dùng chứa `support@dmst.gov.vn` và chuỗi giữ chỗ `1900 xxxx`; bản dựng của trang giới thiệu chứa `nacentech@mst.gov.vn` và `(024) 39330313`. Cả hai bộ đều đang được phát hành.

### B-24: Chú thích trong mã nói kiểm toán ghi cùng giao dịch, thực tế thì không

- **Người dùng gặp ở đâu:** Không gặp. Người đọc mã gặp.
- **Xảy ra gì / lẽ ra là gì:** Hai chú thích nói dòng kiểm toán được ghi trong cùng đơn vị công việc của lệnh: `packages/kernel/Application/IAuditWriter.cs` ("Ghi trong cùng UnitOfWork của command để audit và dữ liệu không thể lệch nhau") và `packages/policy-engine/IAuthorizationGate.cs:14` ("ghi audit trong cùng UnitOfWork"). Bản cài đặt thực tế làm ngược lại: `IsolatedAuditWriter` dùng một kết nối ngắn hạn riêng, và lý do được ghi rõ ngay trong tệp đó — để dòng `DENY` không bị cuộn ngược cùng ngoại lệ đã sinh ra nó.
- **Vì sao (từ mã):** `packages/persistence/AuditWriter.cs:7-17` và `packages/persistence/PersistenceServiceCollectionExtensions.cs:36-38`.
- **Mức:** `thấp` — không đổi hành vi, nhưng nó đã làm bộ tài liệu này viết sai ở bốn chỗ trước khi được phát hiện, và nó sẽ làm người tiếp theo viết sai y hệt.
- **Cần quyết:** `sửa`. Sửa hai chú thích cho khớp bản cài đặt, và nói luôn hệ quả: một lệnh thất bại vẫn để lại dòng kiểm toán.
- **Nêu bởi:** [nen-tang/mo-hinh-du-lieu.md](nen-tang/mo-hinh-du-lieu.md#sự-kiện-kiểm-toán), [xuyen-suot/quyen-va-vai-tro.md](xuyen-suot/quyen-va-vai-tro.md)
- **Trạng thái:** **Đã sửa** 2026-09-04. Hai chú thích ở `IAuditWriter.cs` và `IAuthorizationGate.cs` nay nói đúng bản cài đặt — ghi bằng **transaction riêng** — và nói luôn hệ quả mà mục này yêu cầu: *một lệnh ghi thất bại ở bước sau vẫn để lại dòng kiểm toán nói rằng nó được phép*, nên một dòng `PERMIT` nghĩa là "cửa phân quyền đã cho qua", không phải "việc đã xong". Chú thích của `Evaluate` cũng được bổ sung cảnh báo rằng nó **không ghi audit**, và chỗ gọi phải tự ghi phần bị lọc (B-29).
- **Trạng thái trước khi sửa:** Xác nhận 2026-09-04 bằng đọc cả ba tệp.

### B-07: `docker compose up postgres` fail vì biến của service api

- **Người dùng gặp ở đâu:** Bước 1 trong hướng dẫn chạy nhanh của backend.
- **Xảy ra gì / lẽ ra là gì:** Lệnh chỉ khởi động PostgreSQL nhưng fail với `required variable AUTH_SIGNING_KEY is missing a value`. Compose nội suy toàn bộ tệp trước khi chọn service, nên `${AUTH_SIGNING_KEY:?...}` ở service `api` chặn cả lệnh không liên quan.
- **Tái hiện:** Trong `SourceCode/nacentech`, chạy `docker compose up -d postgres` với môi trường sạch.
- **Vì sao (từ mã):** `docker-compose.yml:52`. `README.md:9-10` hướng dẫn chạy lệnh đó như bước đầu tiên.
- **Mức:** `thấp` — chỉ tốn vài phút của mỗi người mới.
- **Cần quyết:** `sửa`. Thêm một `.env` mẫu cho môi trường phát triển, hoặc ghi rõ trong README rằng phải đặt biến trước cả bước 1.
- **Nêu bởi:** [BMAD S-07](bmad/BMAD_SOI_Vong1_2026-09-04.md#s-07--docker-compose-up-postgres-fail-vì-biến-môi-trường-của-service-khác)
- **Trạng thái:** Xác nhận 2026-09-04. Đặt biến rồi chạy lại thì qua.

### B-11: Đích đến sau đăng nhập bị ghi lại nhưng không được dùng

- **Người dùng gặp ở đâu:** Bảng quản trị, khi bấm một liên kết sâu lúc phiên đã hết hạn.
- **Xảy ra gì / lẽ ra là gì:** Lớp bảo vệ ghi lại vị trí họ định tới khi đẩy về `/login`, nhưng trang đăng nhập không đọc nó và luôn chuyển sang `/dashboard`. Người dùng hạ cánh sai chỗ và phải tự tìm đường về.
- **Vì sao (từ mã):** `src/features/auth/components/ProtectedRoute.tsx` truyền vị trí trong trạng thái điều hướng; `src/features/auth/pages/LoginPage.tsx:15,36` dùng một hằng số `defaultRedirectPath` và không đọc trạng thái đó.
- **Mức:** `thấp` — phiền, không hại.
- **Cần quyết:** `sửa`. Trang đăng nhập đọc vị trí đã ghi và chuyển tới đó, rơi về `/dashboard` khi không có.
- **Nêu bởi:** [admin/dang-nhap.md](admin/dang-nhap.md#câu-hỏi-mở-và-kiểm-chứng), [nen-tang/dieu-huong-va-url.md](nen-tang/dieu-huong-va-url.md#bảng-quản-trị)
- **Trạng thái:** **Đã sửa** 2026-09-04. `LoginPage` đọc `location.state.from` mà `ProtectedRoute` đã ghi, dựng lại đường dẫn kèm cả query string và hash, và rơi về `/dashboard` khi không có. Áp cho cả hai đường: đăng nhập thành công, và trường hợp đã đăng nhập sẵn.

### B-13: Gửi lại thư kích hoạt phân biệt được ba trạng thái tài khoản

- **Người dùng gặp ở đâu:** Cổng người dùng, chức năng gửi lại thư kích hoạt. Kẻ dò email gặp là chính.
- **Xảy ra gì / lẽ ra là gì:** Endpoint được viết như thể nó mơ hồ — câu trả lời cho tài khoản chưa kích hoạt là `"If the account exists and is not active, …"` — nhưng nó phân biệt được **ba** trường hợp: email không tồn tại trả **404** `ACCOUNT_NOT_FOUND`; email tồn tại chưa kích hoạt trả 200 câu chung; email tồn tại đã kích hoạt trả 200 câu riêng `"Account is already active. Please sign in."`. Bất kỳ ai cũng dò được một email có tài khoản hay không và đã kích hoạt hay chưa, chỉ bằng mã trạng thái.
- **Tái hiện:** `POST /api/v1/auth/resend-activation` lần lượt với ba email thuộc ba trường hợp; so mã trạng thái và câu trả lời.
- **Vì sao (từ mã):** `modules/identity/Application/AuthenticationService.cs:106-107` ném `NotFoundException` khi không tìm thấy, **trước** khi tới nhánh trả lời mơ hồ. Câu chung ở `apps/api/V1Compat/AuthController.cs:90-92` vì thế chỉ che được một nửa.
- **Mức:** `thấp` — rò rỉ hẹp, và kẻ dò vẫn phải đoán từng email. Nhưng giới hạn tần suất của đường này là 3 lần / 600 giây theo cặp IP và email, tức là **không giới hạn theo IP**: đổi email thì bộ đếm mới.
- **Cần quyết:** `quyết định sản phẩm`. Trả 200 với câu chung cho cả ba trường hợp là kín hơn nhưng làm người dùng hợp lệ bối rối khi họ đã kích hoạt rồi mà không được nhắc đi đăng nhập. Cân nhắc có ý thức, không phải sửa máy móc. Nếu quyết định giữ, hãy sửa **câu chữ** để nó không tỏ ra mơ hồ trong khi không mơ hồ.
- **Ghi chú kèm theo:** quên mật khẩu **không có giới hạn tần suất nào** — mã `FORGOT_PASSWORD_RATE_LIMITED` tồn tại ở cả hai phía nhưng không đường nào gọi bộ đếm. Đường đó mơ hồ đúng nhưng dò được không giới hạn.
- **Nêu bởi:** [nen-tang/xac-thuc-va-vai-tro.md](nen-tang/xac-thuc-va-vai-tro.md#những-câu-trả-lời-cố-ý-mơ-hồ), [portal/dang-ky-va-kich-hoat.md](portal/dang-ky-va-kich-hoat.md), [api-v2/identity-va-nguoi-dung.md](api-v2/identity-va-nguoi-dung.md)
- **Trạng thái:** Xác nhận 2026-09-04 bằng đọc mã. Bản đầu của mục này mô tả sai rằng endpoint luôn trả thành công; đó là lỗi của tài liệu, đã sửa ở `nen-tang/xac-thuc-va-vai-tro.md`.

### B-18: Lớp bảo vệ của admin không kiểm vai trò

- **Người dùng gặp ở đâu:** Không gặp trong sử dụng bình thường.
- **Xảy ra gì / lẽ ra là gì:** Lớp bảo vệ route chỉ kiểm "đã đăng nhập chưa", không kiểm vai trò. Việc chỉ `ADMIN` vào được bảng quản trị được đảm bảo ở tầng đăng nhập — nó không cấp token cho vai trò khác — chứ không ở tầng định tuyến. Một token `USER` hợp lệ nhét thủ công vào cookie `admin_token` sẽ qua được lớp bảo vệ và dựng toàn bộ giao diện quản trị; chỉ từng lời gọi API mới bị chặn.
- **Vì sao (từ mã):** `src/features/auth/components/ProtectedRoute.tsx` chỉ đọc cờ đã xác thực. `AuthContext` lấy tài khoản từ `/admin/auth/me`, mà endpoint đó **có** gọi `RequireAdmin()` — nên đường thường không lọt. Rủi ro thực tế thấp; vấn đề là phòng thủ chỉ có một lớp.
- **Mức:** `thấp` — không lộ dữ liệu, vì mọi lời gọi API vẫn bị chặn riêng.
- **Cần quyết:** `sửa`. Lớp bảo vệ kiểm luôn vai trò trong tài khoản đã tải.
- **Nêu bởi:** [nen-tang/dieu-huong-va-url.md](nen-tang/dieu-huong-va-url.md#tương-tác-với-hệ-thống-khác)
- **Trạng thái:** **Đã sửa** 2026-09-04. `ProtectedRoute` kiểm luôn vai trò trong tài khoản đã tải; vai trò đó đến từ `/admin/auth/me`, endpoint **có** gọi `RequireAdmin()`, nên nó là thứ máy chủ đã công nhận chứ không phải thứ trình duyệt tự khai. Người không phải quản trị viên bị đẩy về trang đăng nhập kèm lý do riêng, và trang đó nói rõ "không có quyền truy cập bảng quản trị" thay vì để họ tưởng mình gõ sai mật khẩu.

### B-47: Bộ test tích hợp về tìm kiếm chỉ xanh trên cơ sở dữ liệu sạch

- **Người dùng gặp ở đâu:** Không gặp. Đây là lỗi của bộ kiểm thử, nhưng nó che được lỗi thật.
- **Xảy ra gì / lẽ ra là gì:** Chạy `dotnet test tests/integration` **lần thứ hai trên cùng một cơ sở dữ liệu** làm đỏ `MatchingPipelineTests.Rerank_reorders_top_candidates_and_changes_the_engine_label` và `PostgresSearchIndexTests.Corrected_mode_hard_filters_before_recall_and_legacy_mode_does_not`. Lần đầu 62/62 xanh.
- **Tái hiện:** `NACENTECH_TEST_PG="…;Database=<db mới>;…" dotnet test tests/integration/NacenTech.Tests.Integration.csproj` hai lần liên tiếp. Lần 1: 62/62. Lần 2: 60/62.
- **Vì sao (từ mã):** Các bài này khẳng định trên top-K của bản chiếu `matching.search_chunks`, mà bản chiếu dùng chung cho cả bộ test và **không được dọn giữa các lần chạy**. Tài liệu của lần chạy trước vẫn nằm trong chỉ mục và chen vào top-K. Mặc định của repo là Testcontainers — mỗi lần một container mới — nên CI không bao giờ thấy; chỉ người đặt `NACENTECH_TEST_PG` trỏ vào PostgreSQL cục bộ mới gặp.
- **Mức:** `trung bình` — không hại người dùng, nhưng một bộ test chỉ xanh ở một điều kiện cụ thể sẽ dạy người ta bỏ qua màu đỏ, và đó là lúc lỗi thật lọt qua.
- **Cần quyết:** `sửa`. Hai hướng: bài test tự dọn thứ mình nạp vào chỉ mục, hoặc fixture cắt sạch bản chiếu trước mỗi lần chạy.
- **Nêu bởi:** Đo 2026-09-06 khi thêm `SearchFeedbackTests` (ADR-0011/0012). Đã kiểm chứng là lỗi **có sẵn**: loại hẳn hai lớp test mới ra khỏi bộ lọc thì lần chạy thứ hai vẫn đỏ đúng hai bài đó.
- **Trạng thái:** **Đã sửa** 2026-09-06. Làm cả hai hướng, vì chúng giải quyết hai chuyện khác nhau: `SearchFeedbackTests` gọi `RemoveSubjectAsync` sau khi đã ghi log nên không để lại dư lượng (bài test tự dọn thứ mình tạo ra), và `PostgresFixture.InitializeAsync` `TRUNCATE matching.search_chunks, matching.content_chunks` ở **đầu** lần chạy (lần chạy trước có thể đã bị ngắt giữa chừng, nên hứa dọn sau là không đủ). Chỉ cắt bản chiếu tìm kiếm, **không** `TRUNCATE` toàn lược đồ: xoá sạch mọi thứ sẽ che mất đúng loại lỗi mà cơ sở dữ liệu tồn tại lâu ngày mới lộ — khoá duy nhất bị đụng, dữ liệu cũ làm sai phép đếm — và những bài test đó nên phải chịu được dữ liệu cũ. Đo: ba lần chạy liên tiếp trên cùng một cơ sở dữ liệu, 71/71 cả ba lần.

## Nộp lên kho mã nguồn

Chưa nộp mục nào thành issue. Bốn thư mục mã nguồn không phải git repo (`git rev-parse` fail ở cả bốn, đo 2026-09-04), nên chưa có kho nào để nộp. Khi có, việc nộp là một bước riêng và cần xác nhận kho đích cùng định dạng trước.
