# BMAD-Live · Pha SOI · Vòng 1 · 2026-09-04

Bề mặt rà: ba frontend của NacenTech ĐMST (`dmst-admin-main`, `dmst-user-main`, `dmst-landing-page-main`) đối chiếu với backend .NET `nacentech` vừa thay thế NacenTwin/NestJS.

Câu hỏi của vòng này: **sau khi backend đổi từ NestJS sang .NET, cái gì ở frontend đã hỏng, cái gì backend làm được mà frontend chưa chạm tới, và cái gì frontend đang vẽ ra mà backend không có?**

Mọi phát hiện dưới đây đều kèm bằng chứng đo trong phiên hôm nay: lệnh chạy thật trên máy, `file:line` đọc trong phiên, hoặc phản hồi HTTP từ API đang chạy. Không có dòng nào lấy từ tài liệu kiến trúc mà chưa kiểm lại.

## Bản chạy dùng để đo

| Thành phần | Cách dựng | Kết quả |
|---|---|---|
| PostgreSQL | `docker compose up -d postgres` trong `SourceCode/nacentech` | `nacentech-postgres-1 Up (healthy)`, cổng 55440 |
| Solution .NET | `dotnet build NacenTech.slnx` (dotnet 10.0.400) | exit code 0 |
| API | `dotnet run` trong `apps/api`, `ASPNETCORE_URLS=http://127.0.0.1:5199`, `Api__MigrateOnStartup=true` | `GET /health` → `200 {"status":"ok"}` |

Ba frontend không được dựng trong vòng này; phần frontend đọc từ mã nguồn. Xem [§ Chưa đo được](#chưa-đo-được).

## Phát hiện

Trạng thái lỗi được ghi ở [`../bug-triage.md`](../bug-triage.md); snapshot này chỉ trỏ mã lỗi, không chép lại danh sách.

### S-01 — `/api/v2` chưa tồn tại. Toàn bộ năng lực mới của backend chưa có cửa ra HTTP

Đây là phát hiện gốc, mọi thứ còn lại là hệ quả của nó.

Tài liệu `SourceCode/nacentech/README.md:34` nói `apps/api` phục vụ `/api/v2` (mới) **và** `/api/v1` (facade tương thích). Đo thật thì chỉ có nửa sau.

Bằng chứng:

```
GET /openapi/v2.json                → 200
  info.title = "NacenTech.Api | v2"
  tổng số path = 76
  path bắt đầu bằng /api/v2 = 0
  path bắt đầu bằng /api/v1 = 74
  còn lại = 2  (/health, /health/ready)

GET /api/v2/cases                   → 404
GET /api/v2/audit-events            → 404
GET /api/v2/brokers                 → 404
GET /api/v2/data-room/documents     → 404
GET /api/v2/policy-snapshots        → 404
```

Đối chiếu mã nguồn: grep `ApiController|MapPost\(|MapGroup\(|IEndpointRouteBuilder` trên toàn bộ `modules/**/*.cs` trả về **0 file**. Toàn bộ controller nằm ở `apps/api/V1Compat/` (13 file). Chuỗi `/api/v2` chỉ xuất hiện ở ba chỗ hạ tầng, không ở chỗ nào định tuyến:

- `apps/api/Infrastructure/IdempotencyMiddleware.cs:20` — chặn đường dẫn `/api/v2` để bắt buộc `Idempotency-Key`
- `apps/api/Infrastructure/V1SunsetMiddleware.cs:23` — trả header `Link: </api/v2>; rel="successor-version"`
- `apps/api/Infrastructure/ErrorHandling.cs:10` — quy định `/api/v2/*` dùng RFC 9457

Nghĩa là ba middleware đã sẵn sàng cho một API chưa được viết. `IdempotencyMiddleware` hiện không bao giờ kích hoạt; `V1SunsetMiddleware` đang quảng cáo một successor 404.

Hệ quả cho công việc frontend: **không thể viết spec màn hình mới rồi code ngay**. Mỗi màn hình mới cần một hợp đồng API chưa tồn tại. Đó là lý do bộ tài liệu này có thư mục [`../api-v2/`](../api-v2/) đứng trước [`../moi/`](../moi/).

→ [B-01](../bug-triage.md#b-01-apiv2-được-quảng-cáo-nhưng-chưa-có-endpoint-nào)

### S-02 — Admin gọi `DELETE /admin/users/{id}`; backend .NET trả 405

Đo trên bản chạy:

```
DELETE /api/v1/admin/users/00000000-0000-0000-0000-000000000001  → 405 Method Not Allowed
```

Phía frontend, lời gọi này có thật và đã nối vào UI:

- `src/services/userService.ts:90-92` — `deleteUser()` gọi `apiClient.delete('/admin/users/' + id)`
- `src/features/users/hooks/useUsersList.ts:98` — `await deleteUser(id)`

Phía backend, `apps/api/V1Compat/UsersController.cs` khai báo `AdminUsersController` ở dòng 73 với `POST`, `GET`, `GET {id}/profile`, `GET {id}/collaboration-history`, `GET {id}`, `PATCH {id}`, `POST {id}/reset-password`. Không có `HttpDelete` nào trong file.

Đây là hồi quy do đợt refactor: NestJS có endpoint này, facade v1 không port sang. 405 chứ không phải 404 vì route `admin/users/{id}` tồn tại cho `GET`/`PATCH`.

→ [B-02](../bug-triage.md#b-02-xóa-người-dùng-trong-admin-trả-405)

### S-03 — Backend có 12 module; admin dashboard chạm tới 5

Bảng đối chiếu năng lực. Cột "cửa HTTP" đo từ `openapi/v2.json`; cột "màn hình admin" đọc từ `src/app/router-config.tsx`.

| Module backend | Service layer có gì | Cửa HTTP | Màn hình admin |
|---|---|---|---|
| `identity` | `IAuthenticationService`, `IPersonService` (+ admin CRUD, reset password) | v1 đầy đủ trừ delete | có — `/users`, `/user-profile/:id` |
| `demand` | `IDemandService`: version hoá, soft delete, đếm theo status, trạng thái AI | v1 qua facade `intakes` | có — `/challenges` |
| `technology` | `ITechnologyService`: thêm `QualityLevel` (UNREVIEWED → TRANSACTION_READY) | v1 qua facade `intakes`; **không có endpoint đổi QualityLevel** | một phần — `/ips`, không thấy quality level |
| `content` | `IStoryService` + `SetHiddenAsync` | v1 đầy đủ | có — `/stories` |
| `policy` | `ITaxonomyService` + `IPolicySnapshotService` | taxonomy có v1; **snapshot không có endpoint** | một phần — `/categories` |
| `communication` | `IInvitationService`, `INotificationService` | v1 đầy đủ | chỉ đọc — `/admin/collaboration-requests`, `/admin/notifications` |
| `matching` | `IMatchingService`: `MatchRound` có version, hai chế độ scoring, `search_query_log` | v1 chỉ trả danh sách match phẳng | không có màn hình quản trị ghép cặp |
| `case` | `ICaseService`: 12 stage, ma trận transition, `DecisionRecord`, hold, If-Match | **không có endpoint** | **không có** |
| `brokerage` | `IBrokerService`: hồ sơ môi giới, capacity, assignment | **không có endpoint** | **không có** |
| `dataroom` | `IDataRoomService`: phân loại mật, `AccessGrant` cấp/thu hồi | file đi qua `/api/v1/files/*`; **không có endpoint cho grant** | **không có** |
| `audit` | `IAuditQuery.ListAsync` lọc theo actor/object/outcome | **không có endpoint** | **không có** |
| `integration` | mail, object storage, AI provider | gián tiếp | không áp dụng |

Bảy năng lực có mã chạy được nhưng không ai gọi tới được: case stage-gate, brokerage, access grant, audit trail, policy snapshot, match round có version, quality gate của công nghệ.

→ [B-03](../bug-triage.md#b-03-bảy-năng-lực-backend-không-có-đường-tới-người-dùng)

### S-04 — Cổng người dùng có năm khu vực vỏ, và một biểu mẫu nói dối

> **Đã sửa sau khi rà lại.** Bản đầu của phát hiện này nói sáu khu vực, và xếp `marketplace` vào nhóm vỏ. Sai. Phép đếm ban đầu tìm lời gọi API **trong thư mục của từng khu vực**, mà ba trang của `marketplace` nhập hàm gọi từ `features/intakes/api/intake.ts` — thư mục khác. Chúng đọc dữ liệu thật. Bài học cho các vòng sau: đếm "có nối API không" theo thư mục là một phép đo sai.

`dmst-user-main/src/features` có 12 khu vực. Năm khu vực không có đường nào chạm tới API, và bốn trong năm đã bị gỡ khỏi định tuyến:

| Khu vực | Số trang | Nối API | Có route đang chạy? |
|---|---|---|---|
| `marketplace` | 6 trang | **có** — `GET /api/v1/marketplace`, `/marketplace/{id}` | có — 3 route |
| `contact` | 1 trang | không | **có** — `/contact` |
| `deal-room` | 1 trang + 8 component (chat, mời thành viên, đổi bước, kết quả PoC) | không | không — route bị comment |
| `infrastructure` | 7 trang | không | không — 7 route bị comment |
| `services` | 12 trang | không | không — 12 route bị comment |
| `valuation` | 3 trang + 3 bước wizard | không | không — 4 route bị comment |

Khối 23 route bị comment mang chú thích `Hidden until these sections are ready for use`. Đó là một quyết định có ý thức và đúng: không phát hành cái chưa có backend.

Cái còn lại thì không ổn. **`/contact` báo gửi thành công cho một tin nhắn bị vứt**: `ContactPage.tsx:95` mang chú thích `// Simulate API call`, chờ 1500 mili giây, rồi hiện dải xanh và toast *"Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24h."* Không có lời gọi mạng nào; nó chạy được cả khi ngắt mạng. Route sống nhưng không có mục thanh bên nào dẫn tới.

Ngoài ra, hai hộp thoại gắn ở gốc ứng dụng (`SubmitProposalModal`, `OpenDealModal`) luôn được nạp và chứa dữ liệu bịa, trong đó `routes.tsx:583` chọn giữa `'Tập đoàn Dệt May Việt Nam'` và `'VinCommerce'` theo `id === '1'` — vì định danh là GUID nên **mọi** đề bài đều thành "VinCommerce". Hàm mở hộp thoại hiện được khai báo nhưng không được lấy ra dùng, nên nó cách người dùng đúng một dòng mã.

Ba khu vực bị comment cũng chứa tên tổ chức có thật (*Viettel*, *Vingroup*, *FPT*, bốn viện và trường) và một luồng thanh toán bịa nêu đích danh Momo, ZaloPay, VNPay, Visa, Mastercard. Chúng không nằm trong gói phát hành, nhưng phải được gỡ trước khi mở lại bất kỳ route nào.

Điều này đổi ý nghĩa của câu "frontend chưa bổ sung tính năng mới": ở cổng người dùng, vấn đề ngược lại — **UI chạy trước backend rất xa**, và `deal-room` chính là thứ mà module `case` trong backend .NET đang mô hình hoá đàng hoàng.

Đây là cơ hội đáng giá nhất của đợt này: `deal-room` (vỏ có thiết kế xong) + `case` (lõi không có cửa) ghép lại thành một tính năng thật.

→ [B-04](../bug-triage.md#b-04-năm-khu-vực-cổng-người-dùng-là-vỏ-không-có-backend), [B-15](../bug-triage.md#b-15-marketplace-và-contact-đang-chạy-với-dữ-liệu-bịa)

### S-05 — Bốn thay đổi hành vi có chủ đích chưa được phản ánh ở frontend

`SourceCode/nacentech/README.md:54-65` liệt kê bảy thay đổi `KEEP_WITH_CHANGE`. Bốn trong số đó đổi cái người dùng nhìn thấy, và không frontend nào biết:

1. **`/ai/*` giờ yêu cầu đăng nhập** (`README.md:58`). Trước đây mở. Frontend nào gọi beautify/chat khi chưa đăng nhập sẽ nhận 401 thay vì kết quả.
2. **Chấp nhận lời mời hợp tác không còn tự loại lời mời khác** (AC 24, `README.md:59`). UI cũ có thể vẫn ngầm giả định tính loại trừ khi hiển thị danh sách lời mời đã gửi.
3. **Admin tạo user bắt buộc đặt mật khẩu**; legacy mặc định `12345678` (`README.md:60`). `CreateUserModal.tsx` cần kiểm lại có bắt buộc trường mật khẩu không.
4. **Sửa nội dung tạo version mới** thay vì ghi đè (`README.md:61`, `IDemandService.UpdateAsync`). Không màn hình nào cho xem lịch sử version, nên người dùng không thấy được thứ vừa được tạo ra.

→ [B-05](../bug-triage.md#b-05-bốn-thay-đổi-hành-vi-chưa-tới-được-frontend)

### S-06 — Ba cơ chế giao thức của v2 chưa có chỗ nào ở frontend

`IdempotencyMiddleware.cs:12-13` bắt buộc `Idempotency-Key` cho mọi command ghi trên `/api/v2`; cùng key khác body → 422. `ICaseService.TransitionAsync` nhận `ExpectedVersion` và trả 409 khi lệch (`case/Application/Contracts.cs:183-185`). `ErrorHandling.cs:10` quy định v2 trả RFC 9457 problem details, khác hẳn shape `{statusCode, message, error}` của v1.

Ba client hiện tại đều dựng quanh shape v1. Không có interceptor nào sinh `Idempotency-Key`, không có chỗ nào giữ `version` để gửi `If-Match`, không có bộ dịch lỗi RFC 9457.

→ [B-06](../bug-triage.md#b-06-client-chưa-có-idempotency-key-if-match-và-rfc-9457)

### S-07 — `docker compose up postgres` fail vì biến môi trường của service khác

```
$ docker compose up -d postgres
error while interpolating services.api.environment.Auth__SigningKey:
required variable AUTH_SIGNING_KEY is missing a value
```

Compose nội suy toàn bộ file trước khi chọn service, nên `${AUTH_SIGNING_KEY:?...}` ở service `api` (`docker-compose.yml:52`) chặn cả lệnh chỉ khởi động `postgres`. Bước 1 trong `README.md:9-10` của backend vì thế không chạy được như viết. Đặt `AUTH_SIGNING_KEY` rồi chạy lại thì qua.

→ [B-07](../bug-triage.md#b-07-docker-compose-up-postgres-fail-vì-biến-của-service-api)

### S-08 — Cả ba frontend vẫn cấu hình trỏ về cổng của NestJS cũ

`.env.example` của cả ba repo:

```
dmst-admin-main/.env.example         VITE_API_BASE_URL=http://localhost:3001
dmst-user-main/.env.example          VITE_API_BASE_URL=http://localhost:3001
dmst-landing-page-main/.env.example  VITE_API_URL=https://api.example.com
```

Cổng 3001 là cổng NacenTwin/NestJS. Backend .NET chạy ở **5000** (docker compose) hoặc **5199** (chạy tay theo `nacentech/README.md:20`). Landing page thì để nguyên chuỗi mẫu `api.example.com`.

Với cổng người dùng, giá trị này không chỉ nằm trong tệp mẫu mà còn là mặc định trong mã: `src/services/api/client.ts:11` dùng `import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'`. Thiếu biến môi trường thì nó nói chuyện với một máy chủ không tồn tại, im lặng.

Bảng quản trị rơi về đường dẫn tương đối `'/api/v1'` khi thiếu biến (`src/lib/api/client.ts:21`), tức là cần một proxy đứng trước — một hành vi mặc định khác hẳn.

→ [B-14](../bug-triage.md#b-14-ba-envexample-vẫn-trỏ-cổng-nestjs-cũ)

### S-09 — Hai client xử lý phiên hết hạn theo hai cách, một trong hai không xử lý gì

Bảng quản trị bắt 401 tập trung ở bộ chặn phản hồi: xoá cookie, phát sự kiện, lớp phiên dọn tài khoản, lớp bảo vệ đẩy về `/login` (`src/lib/api/client.ts:72-75`).

Cổng người dùng **không có nhánh 401 nào** (`src/services/api/client.ts:22-29`): bộ chặn chỉ đổi lỗi thành `Error` mang thông điệp rồi ném tiếp. Token hết hạn biểu hiện thành một lỗi lạ ở màn hình bất kỳ, cookie vẫn còn, và lần tải trang sau vẫn tưởng còn đăng nhập.

Khoảng lệch còn lớn hơn vì tuổi cookie không khớp tuổi token:

| Bề mặt | Cookie | Token | Lệch |
|---|---|---|---|
| Bảng quản trị | `admin_token`, 7 ngày | 24 giờ | 6 ngày |
| Cổng người dùng | `dmst_access_token`, **365 ngày** | 24 giờ | 364 ngày |

→ [B-09](../bug-triage.md#b-09-cookie-sống-7-ngày-token-sống-24-giờ), [B-12](../bug-triage.md#b-12-cổng-người-dùng-không-xử-lý-401)

### S-10 — Ba đường đọc để lộ dữ liệu, và một đường ghi xoá dữ liệu

Bốn phát hiện này không nằm trong câu hỏi mở đầu của vòng rà. Chúng lộ ra khi đối chiếu từng phương thức của tầng dịch vụ với facade gọi nó, và chúng khẩn hơn mọi thứ còn lại trong snapshot này vì chúng đang chạy trên bản phát hành.

| Đường | Chuyện gì | Bằng chứng |
|---|---|---|
| `GET /api/v1/public/stories` | Không cần đăng nhập, nhưng trả **email và số điện thoại** của tác giả | `StoriesControllers.cs:147` không có `[Authorize]`; `V1Mappers.cs:114` đổ tác giả qua `UserBrief`, cùng hàm mà khu vực quản trị dùng (`V1Mappers.cs:35-47`, có `email` và `phone`) |
| `GET /api/v1/stories/{id}` | Bất kỳ tài khoản nào đọc được bản nháp và câu chuyện bị ẩn của người khác | `StoriesControllers.cs:80-81` gọi `Stories.GetAsync(id, ct)` không truyền người gọi |
| `GET /api/v1/intakes/{id}` | Cho phép **ẩn danh**, không kiểm trạng thái xuất bản, và tra cả bản ghi **đã xoá mềm** | `IntakesControllers.cs:217-225`: `[AllowAnonymous]` + `FindViewAsync(id, true, ct)` |
| `POST /api/v1/search` | Trả cả bản nháp của người khác | `MiscControllers.cs:28-29`: tham số cuối của `SearchQuery` là `false`, tức "chỉ lấy bản đã xuất bản" bị **tắt** |

Và một đường ghi làm mất dữ liệu:

`IntakeFacade.cs:211-217` ghi lại **cả bốn** đoạn nội dung mật ở **mọi** lần cập nhật, lấy giá trị thẳng từ thân request. Bốn trường đó cho phép rỗng, và tầng dịch vụ hiểu rỗng là *gỡ đoạn*. Nghĩa là sửa mỗi cái tiêu đề bằng một biểu mẫu không gửi kèm phần mật sẽ **xoá sạch nội dung mật mức 2 và mức 3** — im lặng, với một phản hồi 2xx.

Cả năm đều là nợ mang sang từ facade v1 chứ không phải hệ quả của cuộc chuyển stack. Nhưng vòng rà này là lần đầu chúng được nhìn, và chúng đổi thứ tự ưu tiên của Pha XÂY.

→ [B-19](../bug-triage.md#b-19-apiv1publicstories-trả-email-và-số-điện-thoại-của-tác-giả-cho-người-chưa-đăng-nhập), [B-20](../bug-triage.md#b-20-đọc-một-bản-ghi-theo-định-danh-không-kiểm-quyền), [B-27](../bug-triage.md#b-27-tìm-kiếm-trả-cả-bản-nháp-của-người-khác), [B-31](../bug-triage.md#b-31-sửa-một-đề-bài-mà-không-gửi-kèm-nội-dung-mật-sẽ-xoá-sạch-nội-dung-mật-đó)

### S-11 — Không sửa được nội dung của bất kỳ đề bài hay tài sản công nghệ nào

Phát hiện này không đến từ đọc mã. Nó lộ ra ở bước cuối của vòng rà, khi bản chạy đã có tài khoản và dữ liệu thật để thao tác — và nó là mục nặng nhất của cả vòng.

Mọi lệnh sửa **tạo phiên bản nội dung mới** đều trả **409** trên một bản ghi không ai khác đụng vào. Tải lại và thử lại không giúp gì; nó hỏng vĩnh viễn.

Đo trên cùng một bản ghi, bốn thao tác liên tiếp:

```
PATCH chỉ đổi trạng thái xuất bản   → 200
PATCH gửi lại đúng tiêu đề cũ       → 200
PATCH đổi tiêu đề                   → 409
PATCH đổi phần mô tả                → 409
PATCH đổi một đoạn nội dung mật     → 409
```

Ranh giới trùng khít với việc tạo phiên bản: sửa nhãn, danh mục và trạng thái thì chạy vì chúng không tạo phiên bản. Đã đo trên cả hai loại (đề bài và tài sản công nghệ), có và không có nội dung mật, với worker nền bật và tắt — kết quả không đổi, nên đây **không phải một cuộc đua** với việc chạy nền.

Câu lệnh thật, chụp từ nhật ký PostgreSQL với `log_statement='all'`:

```sql
UPDATE technology.technology_package_versions
   SET created_at=$1, created_by_actor_ref=$2, description=$3,
       technology_asset_id=$4, title=$5, version_no=$6
 WHERE id = $7
-- $7 = '01a06b62-3ccf-7c60-a3ad-c0be1e64c493'  ← định danh MỚI, chưa hàng nào mang nó
```

Hàng phiên bản mới được phát ra dưới dạng `UPDATE` chứ không phải `INSERT`. Không hàng nào khớp, EF ném lỗi lệch phiên bản, và `EfUnitOfWork` đổi nó thành câu "Bản ghi đã bị thay đổi bởi một yêu cầu khác" — **chỉ vào một nguyên nhân sai**. Câu lệnh cập nhật aggregate ngay trước đó (`SET current_version_no=2, version=5 WHERE id=… AND version=4`) đúng và lẽ ra sẽ khớp; cả giao dịch bị cuộn ngược vì hàng con.

Hai hệ quả cho kế hoạch:

1. **Cơ chế phiên bản — một trong bảy thay đổi có chủ đích của đợt refactor — chưa từng chạy được lần nào.** Số phiên bản của mọi bản ghi trong hệ thống đứng yên ở 1.
2. **Nó đang che một lỗi mất dữ liệu.** [B-31](../bug-triage.md#b-31-sửa-một-đề-bài-mà-không-gửi-kèm-nội-dung-mật-sẽ-xoá-sạch-nội-dung-mật-đó) không nổ được vì giao dịch luôn cuộn ngược — đo thật: gửi lệnh sửa chỉ có tiêu đề lên bản ghi có nội dung mật mức 2 và mức 3, nhận 409, và cả hai đoạn còn nguyên. Ngày lỗi này được chữa, lỗi kia nổ, và nổ im lặng với một phản hồi 2xx. **Hai mục phải đi cùng một lần sửa.**

→ [B-32](../bug-triage.md#b-32-mọi-sửa-đổi-tạo-phiên-bản-nội-dung-mới-đều-thất-bại-với-409), [B-31](../bug-triage.md#b-31-sửa-một-đề-bài-mà-không-gửi-kèm-nội-dung-mật-sẽ-xoá-sạch-nội-dung-mật-đó)

### S-12 — Hai phát hiện được nâng từ "đọc mã" lên "đo thật"

Cuối vòng rà, một tài khoản và một bộ dữ liệu mẫu được tạo qua chính API, nên hai tuyên bố trước đó chỉ đọc từ mã nay đã đo được:

**Đường công khai trả thông tin cá nhân.** `GET /api/v1/public/stories`, **không kèm token**, trả về trường `author` gồm:

```json
{ "email": "tacgia@example.com", "phone": "0912345678",
  "organization": "Vien Cong nghe X", "role": "user", "isActive": true, … }
```

**Đồng hồ dừng v1 đã chạy.** `GET /api/v1/sectors` trả `Sunset: Wed, 31 Mar 2027 00:00:00 GMT`, cùng `Deprecation: true` và `Link: </api/v2>; rel="successor-version"`. Ngày dừng nằm trong `apps/api/appsettings.json:23` và không bị ghi đè ở đâu. Ba client không đọc header nào trong ba header đó.

→ [B-19](../bug-triage.md#b-19-apiv1publicstories-trả-email-và-số-điện-thoại-của-tác-giả-cho-người-chưa-đăng-nhập), [B-06](../bug-triage.md#b-06-client-chưa-có-idempotency-key-if-match-và-rfc-9457)

### S-13 — 44 test đều xanh, và không test nào chạm tới lỗi nặng nhất

Chạy tuần tự trên máy, ngày 2026-09-04:

| Bộ test | Kết quả |
|---|---|
| `tests/architecture` | 7/7 pass |
| `tests/invariants` | 16/16 pass |
| `tests/authorization` | 10/10 pass |
| `tests/contracts` | 7/7 pass |
| `tests/integration` (PostgreSQL thật) | 4/4 pass |
| **Tổng** | **44/44 pass** |

Bộ test này tốt ở chỗ nó phủ: ma trận chuyển 12 giai đoạn và mọi ô bị cấm, ranh giới module, ma trận phân quyền, và băm chuẩn hoá. Nó xác nhận [S-03](#s-03--backend-có-12-module-admin-dashboard-chạm-tới-5) — tầng dịch vụ thật sự đúng như thiết kế.

Nhưng **không test nào ghi một lần sửa nội dung xuống cơ sở dữ liệu rồi đọc lại**. Đó chính xác là chỗ [S-11](#s-11--không-sửa-được-nội-dung-của-bất-kỳ-đề-bài-hay-tài-sản-công-nghệ-nào) nằm: lỗi không ở tầng domain (nơi test phủ dày) mà ở đường từ domain xuống kho dữ liệu, nơi một hàng con mới bị phát ra dưới dạng `UPDATE` thay vì `INSERT`. Bốn test tích hợp có chạm PostgreSQL nhưng chỉ kiểm kiểm toán và chống trùng việc nền.

Bài học cho Pha XÂY: **cổng done của sprint 0 phải gồm một test tích hợp sửa-rồi-đọc-lại cho cả đề bài và tài sản công nghệ**, chứ không chỉ một bản vá. Không có nó, cùng loại lỗi sẽ quay lại ở lần đổi ánh xạ tiếp theo và lại không ai biết.

Phụ: quá trình chạy test cũng nêu cảnh báo phụ thuộc — sáu khuyến cáo mức cao cho `System.Security.Cryptography.Xml` 9.0.0 và hai mức trung bình cho `MailKit`/`MimeKit` 4.14.0. → [B-34](../bug-triage.md#b-34-phụ-thuộc-có-khuyến-cáo-bảo-mật-mức-cao)

### S-14 — Ba frontend đều dựng được, và bản dựng xác nhận ba mục lỗi

`npm install` và `npm run build` chạy thành công trên cả ba repo:

| Repo | Kết quả |
|---|---|
| `dmst-admin-main` | build xong 48,7 s |
| `dmst-user-main` | 2507 mô-đun, build xong 32,7 s |
| `dmst-landing-page-main` | 2785 mô-đun, build xong 12,3 s |

Không repo nào lỗi biên dịch. Cả ba cần một tệp `.env` viết tay trỏ về `http://127.0.0.1:5199`, vì tệp mẫu trỏ cổng NestJS cũ ([S-08](#s-08--cả-ba-frontend-vẫn-cấu-hình-trỏ-về-cổng-của-nestjs-cũ)). Với bảng quản trị, kiểm lại bản dựng cho thấy địa chỉ đã được nhúng đúng và tên cookie `admin_token` có mặt — nên cơ chế dựng địa chỉ gốc hoạt động như mô tả.

Quan trọng hơn: **tìm trong `dist/` xác nhận ba mục lỗi có mặt trong thứ được phát hành**, không chỉ trong mã nguồn.

- `twin.nacentech.vn` xuất hiện **5 lần** trong bản dựng của trang giới thiệu — đúng năm nút kêu gọi trỏ về hệ cũ. → [B-21](../bug-triage.md#b-21-năm-nút-kêu-gọi-trên-trang-giới-thiệu-trỏ-về-hệ-nacentwin-cũ)
- Hai bộ thông tin liên hệ khác nhau cùng được phát hành, gồm cả chuỗi giữ chỗ `1900 xxxx`. → [B-23](../bug-triage.md#b-23-hai-bề-mặt-công-bố-hai-bộ-thông-tin-liên-hệ-khác-nhau)
- `VinCommerce`, `Tập đoàn Dệt May Việt Nam` và `Đơn vị đăng tải trên DMST` đều nằm trong bản dựng của cổng người dùng. → [B-15](../bug-triage.md#b-15-marketplace-và-contact-đang-chạy-với-dữ-liệu-bịa)

Một quan sát phụ: bản dựng của bảng quản trị có một khối mã **2,6 MB** (837 KB sau nén) trong một tệp duy nhất. Với một bảng quản trị nội bộ thì chấp nhận được, nhưng nó là lần tải đầu tiên của mọi phiên làm việc.

## Chưa đo được

Nói rõ để vòng sau biết chỗ tiếp tục, không để người đọc tưởng đã kiểm:

- **Chưa mở màn hình nào trên trình duyệt.** Cả ba frontend đã cài phụ thuộc và dựng thành công ([S-14](#s-14--ba-frontend-đều-dựng-được-và-bản-dựng-xác-nhận-ba-mục-lỗi)), và tìm trong bản dựng xác nhận được ba mục lỗi. Nhưng **không màn hình nào được mở và không nút nào được bấm** — phiên này không có công cụ điều khiển trình duyệt. Mọi mô tả về cái hiện ra trên màn hình vẫn là đọc từ mã. Điều này quan trọng nhất với ba chỗ: S-02 (người dùng thấy gì khi nút Xoá trả 405), S-05, và S-11 (câu "Bản ghi đã bị thay đổi bởi một yêu cầu khác" hiện ra thế nào với người vừa gõ xong một bài mô tả dài — họ có mất bài không).
- **Elasticsearch và sidecar RAG chưa dựng.** Toàn bộ đường ghép cặp (`compute-matches`, `search`, chunk/embed) chưa đo. Hai chế độ scoring `LEGACY_SCORING` / `CORRECTED_SCORING` chưa so sánh.
- **Worker chưa chạy.** Outbox dispatcher, job queue và scheduled obligation chưa quan sát. `Api:RunWorkersInProcess` để mặc định.
- **Dữ liệu mẫu chỉ đủ cho vài đường.** Đã tạo một tài khoản (`tacgia@example.com`, sau đó nâng lên `ADMIN` bằng SQL vì **không có đường tự đăng ký thành quản trị viên**), một câu chuyện đã xuất bản, một danh mục, và ba bản ghi đề bài/công nghệ trong đó hai bản có nội dung mật. Đủ để đo S-11 và S-12; **không** đủ để đo phân trang, bộ lọc, hay hành vi của danh sách dài.
- **Chưa chạy được bộ test.** Lần chạy `tests/invariants` thất bại vì máy hết bộ nhớ khi chạy song song với việc cài phụ thuộc frontend — lỗi môi trường, không phải lỗi mã. Cần chạy lại tuần tự. `tests/architecture`, `tests/authorization`, `tests/contracts`, `tests/integration` chưa chạy lần nào.
- **Không repo nào là git repo.** `git rev-parse` fail ở cả bốn thư mục mã nguồn. Footer của tài liệu vì thế trích ngày chụp thư mục thay vì SHA — xem [`../README.md`](../README.md#quy-ước).

## Đề xuất Pha XÂY

Chờ duyệt trước khi code. Sprint xếp theo thứ tự phụ thuộc, mỗi sprint đóng trọn một lát cắt.

| Sprint | Lát cắt | Vì sao không tách nhỏ hơn |
|---|---|---|
| **0** | **Cầm máu.** Sửa nội dung hỏng (B-32) **cùng lúc** với cái bẫy sau nó (B-31); ba đường lộ dữ liệu (B-19, B-20, B-27) | Không cái nào chờ v2, không cái nào chờ thiết kế. Chúng đang chạy trên bản phát hành. B-32 làm hỏng thao tác trung tâm của sản phẩm và phải đi cùng B-31, nếu không việc chữa nó sẽ mở ra một lỗi mất dữ liệu. Để cụm này lại trong lúc xây v2 nghĩa là chấp nhận rủi ro suốt nhiều tháng để đổi lấy đúng không gì. |
| 1 | Vá hồi quy admin: B-26 **trước** B-02, rồi B-25, rồi rà bốn thay đổi hành vi S-05 vào ba client | Thứ tự trong sprint này là bắt buộc: sửa B-02 trước B-26 biến một nút khoá tài khoản thành một nút xoá. Và B-25 là đường duy nhất tạo tài khoản quản trị. |
| 2 | Nền v2: `Idempotency-Key`, `If-Match`/ETag, bộ dịch RFC 9457 ở cả client và server; cộng nhánh xử lý 410 và đọc header `Sunset` | Ba cơ chế đi cùng nhau; wire lẻ một cái thì hai cái kia vẫn chặn màn hình đầu tiên. Nhánh 410 gộp vào đây vì nó cùng chỗ trong bộ chặn HTTP và vì đồng hồ đã chạy tới **31/03/2027**. |
| 3 | `/api/v2/cases/*` + console hồ sơ vụ việc trong admin | Stage-gate không dùng được nếu chỉ có API mà không có chỗ bấm, và ngược lại. Đối chiếu với `deal-room` (vỏ đã thiết kế xong) trước khi vẽ lại từ đầu. |
| 4 | `/api/v2/audit-events` + `/api/v2/data-room/grants` + màn hình nhật ký và cấp quyền, kèm ba khoảng trống của nhật ký (B-29, B-30, và việc hành động thành công không được ghi) | Kiểm toán và cấp quyền là một cặp: cấp quyền mà không xem được ai đã đọc gì thì không ai dám bật. Và một màn hình nhật ký dựng trên một nhật ký có lỗ thì tệ hơn không có, vì nó tạo cảm giác an toàn sai. |
| 5 | Brokerage + phân công vào case, hợp nhất hai đường gán môi giới | Phụ thuộc sprint 3. Hai đường gán hiện lệch nhau hai chiều: một đường không kiểm capacity, đường kia không cho người nhận quyền đọc hồ sơ. |
| 6 | Vòng ghép cặp có phiên bản + cổng chất lượng công nghệ | Độc lập với 3–5, làm sau vì cần Elasticsearch dựng xong. Cổng chất lượng cần **cả thao tác nghiệp vụ lẫn endpoint** — tầng domain hiện không có đường nào đổi mức. |

Sprint 0 là thay đổi lớn nhất so với bản đầu của kế hoạch này. Vòng rà bắt đầu bằng câu hỏi "frontend thiếu gì so với backend mới", và câu trả lời hoá ra có ba nửa.

Nửa đầu đúng như dự đoán: năng lực mới không có cửa ra HTTP. Nửa thứ hai không nằm trong dự đoán nào — bốn đường đọc/ghi đang lộ hoặc doạ mất dữ liệu. Nửa thứ ba chỉ lộ ra ở bước cuối, khi bản chạy có dữ liệu thật để thao tác: **thao tác trung tâm của sản phẩm không hoạt động**.

Điều đó cũng là bài học phương pháp của vòng này. Ba nửa được tìm ra bằng ba cách khác nhau, theo đúng thứ tự tăng dần về giá trị: đọc cấu trúc mã tìm ra nửa đầu; đối chiếu từng phương thức dịch vụ với facade gọi nó tìm ra nửa hai; **chỉ có việc dựng bản chạy và bấm thật mới tìm ra nửa ba**. Vòng sau nên rút ngắn quãng đường tới bước thứ ba.

Mỗi sprint theo cổng done của BMAD: build → review đối kháng → đo lại trên bản chạy thật đúng bề mặt người dùng. Không tự chứng nhận.

## Vòng sau

Vòng 2 chạy lại Pha SOI trên bề mặt vừa sửa, sau khi ba frontend đã dựng được. Snapshot vòng 2 chỉ bổ sung góc nhìn mới; không chép lại vòng này.

---

Đo ngày 2026-09-04 trên `SourceCode/nacentech` (không phải git repo — chụp thư mục), API chạy tại `127.0.0.1:5199`.
