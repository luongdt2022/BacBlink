# Mục tiêu: hoàn thành bộ mô tả sản phẩm NacenTech ĐMST V2

Bạn đang làm việc trong repo `docs-v2`. Đọc trước: [`README.md`](README.md), [`glossary.md`](glossary.md), [`nen-tang/hop-dong-api.md`](nen-tang/hop-dong-api.md) và bản mẫu [`admin/dang-nhap.md`](admin/dang-nhap.md). README định nghĩa mục đích, khung tài liệu, phương pháp, cấu trúc và bảng phủ. Ba tệp còn lại là mẫu: bám đúng độ sâu, giọng văn và cấu trúc của chúng.

Việc của bạn là viết mọi tài liệu trong cấu trúc của README cho tới khi bảng phủ không còn dòng `chưa bắt đầu`, rồi chạy một lượt rà tính nhất quán.

## Nguồn đúng

Mã nguồn nằm ngay trong repo này (root = solution .NET):

| Thư mục | Là gì |
|---|---|
| `apps/api`, `apps/worker`, `modules/`, `packages/` | Backend ASP.NET Core .NET 10, đã thay NacenTwin/NestJS **một lần**, không chạy song song |
| `apps/admin` | Bảng quản trị (React + Vite + Tailwind + shadcn/ui) |
| `apps/portal` | Cổng người dùng |
| `apps/landing` | Trang giới thiệu công khai |

Mô tả cấu hình mặc định, không tuỳ biến gì. `legacy/dmst-rag-python` và `tools/search-bench` nằm ngoài phạm vi.

Với mỗi tài liệu, đọc theo thứ tự này trước khi viết:

1. `modules/{module}/Application/Contracts.cs` — interface service của module. **Chú thích XML trong đó là nguồn dày nhất**: nó nói rõ điều kiện từ chối, mã lỗi, và chỗ nào cố ý khác NestJS.
2. `modules/{module}/Application/*Service.cs` — thứ tự thao tác và sự kiện phát ra.
3. `apps/api/V1Compat/` — facade. **Đây là thứ frontend gọi được hôm nay.** Nếu một năng lực ở tầng service không xuất hiện ở đây, nó không có đường tới người dùng, và tài liệu phải nói rõ điều đó.
4. `tests/invariants/` và `tests/authorization/` — gần với đặc tả chạy được của trường hợp biên.
5. UI: `src/features/{khu vực}/` của repo frontend tương ứng; `src/services/` (admin) hoặc `src/features/*/api/` (cổng) cho lời gọi API thật.
6. Mặc định và ngưỡng: `modules/identity/Application/Contracts.cs` (`AuthOptions`), `modules/matching/Application/Contracts.cs` (`MatchingOptions`), `packages/kernel/Application/Paged.cs`.

Không mô tả mã. Mô tả cái người dùng thấy và làm. Chi tiết kỹ thuật chỉ đi trong block quote `> Ghi chú kỹ thuật:` và chỉ khi cơ chế tạo ra kết quả người dùng không đoán được.

## Hai loại tài liệu

Bộ này có hai loại, khác nhau ở chân trang và ở thì của động từ:

- **Mô tả** (`nen-tang/`, `admin/`, `portal/`, `landing/`, `xuyen-suot/`): mô tả cái đang chạy. Mọi câu là một *quan sát*. Chân trang: `Đối chiếu với SourceCode/{repo}, bản chụp ngày {ngày}.`
- **Đặc tả** (`api-v2/`, `moi/`): mô tả cái sẽ được xây. Mọi câu là một *yêu cầu*. Chân trang: `Đặc tả — chưa có mã. Dựa trên SourceCode/nacentech, bản chụp ngày {ngày}.`

Đặc tả dùng đúng khung tám mục và đúng độ sâu như mô tả. Người viết mã cần cùng một mức chi tiết cho cái sắp xây như cho cái đã có. Chỗ nào là quyết định sản phẩm còn bỏ ngỏ thì viết thẳng vào "Câu hỏi mở", không tự chọn hộ.

## Luật viết

- Theo khung tám mục trong README cho mọi tài liệu tính năng. Tài liệu nền tảng và xuyên suốt được bỏ mục không áp dụng (một trang tĩnh không có pha "trong khi sửa") nhưng vẫn phải phủ hành vi huỷ/gián đoạn ở chỗ nào có tương tác.
- Bảng biến thể và bảng huỷ/gián đoạn có **đúng những dòng đã liệt kê trong README, đúng thứ tự đó**, ở mọi tài liệu. Không thêm, không bớt, không đổi thứ tự trong một tài liệu lẻ. Ô nào không có gì xảy ra thì ghi "Không ảnh hưởng."
- Dùng từ trong glossary. Cần một từ glossary chưa có thì thêm vào đúng mục của nó, một đoạn đầy đủ, rồi mới dùng. Không đặt từ đồng nghĩa mới.
- Tiêu đề viết thường sau chữ đầu. Câu văn trực tiếp, cụ thể. Không rào đón, không quảng cáo.
- Hành vi gây bất ngờ thì nói thẳng và nói lý do nếu mã hoặc chú thích có. Nếu nghi là lỗi thì viết vào "Câu hỏi mở" rằng nó đáng bị coi là lỗi, chứ đừng làm mượt đi.
- Tham chiếu chéo bằng liên kết tương đối thay vì chép lại. `nen-tang/` sở hữu các con số và định nghĩa; đừng nhắc lại chúng, hãy liên kết.
- Mỗi tài liệu kết thúc bằng `## Câu hỏi mở và kiểm chứng` rồi chân trang đúng loại.
- Một sơ đồ Mermaid `stateDiagram-v2` cho mỗi tương tác, chỉ gồm trạng thái người dùng đi qua. Bỏ trạng thái nội bộ.

## Những gì đã chốt (không suy lại, không mâu thuẫn)

Đo hoặc đọc trong phiên 2026-09-04. Đây là các sự kiện chịu lực; tài liệu nào cần chúng thì liên kết tới tài liệu nền tảng sở hữu chúng, không chép lại con số.

**Cửa HTTP**

- Chỉ tồn tại `/api/v1/*` (74 đường dẫn) và `/health`, `/health/ready`. **`/api/v2` có 0 endpoint** — đo bằng `openapi/v2.json` và bằng probe 404. `nen-tang/hop-dong-api.md` sở hữu sự kiện này.
- `DELETE /api/v1/admin/users/{id}` trả **405**. Admin đang gọi nó ở `src/services/userService.ts:90`.
- Không có `ApiController` / `MapGroup` / `MapPost` nào trong `modules/**`. Mọi controller ở `apps/api/V1Compat/`.

**Xác thực**

> **Identity/RBAC đã được thay thế (29/09/2026):** không dùng danh sách role legacy ở mục này cho thiết kế mới. Nguồn chốt: [`../../../../specs/TASK-00_PLATFORM_FOUNDATION_VA_COMMON/spec.md`](../../../../specs/TASK-00_PLATFORM_FOUNDATION_VA_COMMON/spec.md) và Basic Design `TASK-07`.

- Vai trò nền tảng legacy: `ANONYMOUS`, `USER`, `ADMIN`, `SYSTEM`. Mô hình hiện hành là 10 role/4 tầng có 3D scope; `GUEST` là anonymous persona, không phải role lưu trong DB/JWT.
- Token sống 24 giờ (`AccessTokenMinutes = 1440`). Token kích hoạt và token đặt lại mật khẩu sống 60 phút.
- Giới hạn tần suất: đăng ký 5 lần / 300 giây; gửi lại thư kích hoạt 3 lần / 600 giây; đăng nhập 10 lần / 300 giây. Đếm theo cặp `ip:email`.
- Đăng nhập sai vai trò trả `INVALID_CREDENTIALS`, **không** trả 403. Đây là hành vi legacy được giữ có chủ đích.
- `Auth:SigningKey` không có giá trị mặc định và phải ≥ 32 byte; thiếu thì API không khởi động được. Token do NestJS phát hành **không còn hợp lệ** vì khác khoá.
- Token hợp lệ nhưng tài khoản đã bị vô hiệu hoá thì vẫn bị từ chối — kiểm tại thời điểm mỗi request, không chỉ lúc đăng nhập.

**Trang và phân trang**

- Danh sách trả `{data, total, page, limit}`. Trang bắt đầu từ 1. `limit` vượt trần bị **cắt im lặng**.
- **Mặc định và trần khác nhau ở từng endpoint**, không có một con số dùng chung. Nền tảng đặt 20/100, nhưng năm trong bảy chỗ gọi ghi đè: câu chuyện công khai 10/50; thông báo 10/1000; lời mời 20/1000; danh sách người dùng 10/1000. Bảng đầy đủ ở [`nen-tang/hop-dong-api.md`](nen-tang/hop-dong-api.md#danh-sách-và-phân-trang) — **đừng viết một con số phân trang nào mà không tra bảng đó**.

**Hình dạng lỗi**

- v1: `{code, message}` cho 12 mã xác thực legacy; `{statusCode, message, error}` cho phần còn lại; `message` là **mảng** khi có nhiều lỗi kiểm tra dữ liệu.
- v2: `application/problem+json` theo RFC 9457, luôn có `correlationId`; thêm `code` khi là lỗi nghiệp vụ, `ruleId` khi bị chính sách chặn, `currentVersion` khi lệch phiên bản, `errors` khi kiểm tra dữ liệu thất bại.
- Ánh xạ ngoại lệ → mã trạng thái: kiểm tra dữ liệu 400, chưa xác thực 401, bị cấm 403, không tìm thấy 404, xung đột 409, lệch phiên bản 409, không xử lý được 422, quá tần suất 429, còn lại 500. Thân lỗi 500 **không lộ chi tiết**, chỉ có mã tương quan.

**Cơ chế của v2 (đã có middleware, chưa có endpoint để dùng)**

- `Idempotency-Key` bắt buộc cho `POST`/`PUT`/`PATCH`/`DELETE` trên `/api/v2`. Thiếu → **428**. Cùng khoá khác thân → **422**. Cùng khoá cùng thân → phát lại phản hồi cũ, header `Idempotent-Replayed: true`, không thực thi lại. Khoá bị cắt còn 200 ký tự và có phạm vi theo người dùng. Phản hồi 5xx **không** được ghi lại, nên thử lại sau lỗi máy chủ là thật sự thử lại.
- Lệch phiên bản trả 409 kèm `currentVersion`.
- Mọi phản hồi `/api/v1/*` mang `Deprecation: true` và `Link: </api/v2>; rel="successor-version"`; có `Sunset` nếu cấu hình đặt ngày. Quá ngày, hoặc tắt cờ tương thích, thì **mọi** đường v1 trả 410 Gone — không có giai đoạn nửa vời.

**Bảy thay đổi hành vi có chủ đích so với NestJS** (`nacentech/README.md:54-65`)

1. `/ai/*` yêu cầu đăng nhập (trước đây mở cho tất cả).
2. Chấp nhận lời mời hợp tác **không** tự loại các lời mời đang chờ khác.
3. Admin tạo người dùng **bắt buộc** đặt mật khẩu (legacy mặc định `12345678`).
4. Sửa nội dung **tạo phiên bản mới** thay vì ghi đè.
5. Tài liệu mật đi qua phòng dữ liệu và cần cấp quyền đọc.
6. Hàng đợi nằm trong PostgreSQL thay BullMQ/Redis; đưa vào hàng đợi nằm trong cùng giao dịch với ghi dữ liệu.
7. Xoá đề bài / công nghệ là **xoá mềm**; hệ cũ xoá cứng cả tệp đính kèm.

**Dữ liệu**

- Bốn kiểu subject: `DEMAND_BRIEF`, `TECHNOLOGY_ASSET`, `COMMERCIALIZATION_CASE`, `PERSON`.
- Mức mật: `Public` < `Confidential` < `HighlyConfidential` — **ba** mức từ 2026-09-05 ([ADR-0007](../../04-technical/adr/0007-muc-mat-internal.md) bỏ `Internal`). Từ `Confidential` trở lên là mật. Legacy `level2` → `Confidential`, `level3` → `HighlyConfidential`.
- Hồ sơ vụ việc có 12 giai đoạn; 4 giai đoạn cuối là kết thúc (`CLOSED`, `REJECTED`, `WITHDRAWN`, `CANCELLED`) và không đi tiếp được. Ma trận chuyển do `nen-tang/mo-hinh-du-lieu.md` và `api-v2/case-va-quyet-dinh.md` sở hữu; tài liệu khác liên kết tới.
- Tài sản công nghệ tạo mới luôn ở `UNREVIEWED`; không đường nào tự gán `TRANSACTION_READY`.
- Xoá một nhãn lĩnh vực/danh mục là vô hiệu hoá, không xoá thật.

**Frontend**

- Admin có 20 route, 7 khu vực; gọi API qua 5 tệp trong `src/services/`.
- Cổng người dùng có 12 khu vực nhưng chỉ **6 tệp** chạm tới client HTTP. Sáu khu vực là vỏ: `deal-room`, `infrastructure`, `services`, `valuation`, `marketplace`, `contact`.
- Trang giới thiệu có đúng một tệp API, đọc `GET /api/v1/public/stories`.

**Tài liệu nào sở hữu cái gì**

| Sự kiện | Tài liệu sở hữu |
|---|---|
| Hình dạng lỗi, phân trang, Idempotency-Key, If-Match, header sunset | [`nen-tang/hop-dong-api.md`](nen-tang/hop-dong-api.md) |
| Vai trò, token, kích hoạt, giới hạn tần suất, phiên hết hạn | [`nen-tang/xac-thuc-va-vai-tro.md`](nen-tang/xac-thuc-va-vai-tro.md) |
| Bản ghi là gì, subject, mức mật, 12 giai đoạn và ma trận chuyển | [`nen-tang/mo-hinh-du-lieu.md`](nen-tang/mo-hinh-du-lieu.md) |
| Route của ba bề mặt, cái gì nằm trong URL | [`nen-tang/dieu-huong-va-url.md`](nen-tang/dieu-huong-va-url.md) |
| Đã bẩn / đã lưu, phiên bản, xoá mềm, hold | [`nen-tang/luu-va-phien-ban.md`](nen-tang/luu-va-phien-ban.md) |
| Các giai đoạn của hồ sơ vụ việc thuộc màn hình nào | [`moi/console-ho-so-vu-viec.md`](moi/console-ho-so-vu-viec.md) |

## Thứ tự làm

1. `nen-tang/` trước, theo thứ tự: `hop-dong-api.md`, `xac-thuc-va-vai-tro.md`, `mo-hinh-du-lieu.md`, `luu-va-phien-ban.md`, `dieu-huong-va-url.md`. Mọi thứ khác liên kết về đây.
2. `api-v2/` tiếp theo, bắt đầu bằng `README.md` (quy ước chung) rồi `case-va-quyet-dinh.md` (khó nhất). Đọc hết `modules/case/` trước khi viết bất kỳ tài liệu nào của nhóm này, vì các giai đoạn bàn giao cho nhau và các tài liệu phải thống nhất chỗ nào một giai đoạn kết thúc.
3. `moi/`, dựa trên hợp đồng ở bước 2.
4. `admin/`, `portal/`, `landing/`, `xuyen-suot/`. Các nhóm này độc lập với nhau và soạn song song được sau khi nền tảng và bản mẫu đã có. Nếu chia việc cho nhiều agent, đưa mỗi agent tệp này, README, glossary, bản mẫu và tài liệu nền tảng mà tính năng đó phụ thuộc; rồi **tự tay rà lại từng kết quả** theo glossary và các sự kiện đã chốt ở trên trước khi nhận.
5. Lượt rà nhất quán trên cả bộ: cùng một từ cho cùng một thứ, không hai tài liệu mô tả cùng một hành vi theo hai kiểu, mọi liên kết tương đối phân giải được, mọi tài liệu có chân trang, mọi từ chuyên môn đã định nghĩa.
6. Cập nhật bảng phủ trong README khi làm: `đã soạn` khi viết xong. **Không bao giờ tự đặt `đã kiểm`** — đó là kết quả của một lượt kiểm bằng tay, không phải của việc soạn.

## Luật làm việc

- Commit sau mỗi tài liệu hoặc mỗi nhóm mạch lạc, thông điệp dạng `docs: add {đường dẫn}` hoặc `docs: revise {đường dẫn}`.
- **Không sửa gì trong bốn thư mục mã nguồn.** Chúng là tài liệu tham chiếu chỉ đọc.
- Không thêm tệp ngoài cấu trúc của README mà không cập nhật cấu trúc và bảng phủ cho khớp.
- Khi một hành vi không xác định được từ mã và test: viết cái xác định được, đẩy phần còn lại vào "Câu hỏi mở", đi tiếp. Không đoán, không dừng lại.
- Ngưỡng độ sâu: `admin/dang-nhap.md` khoảng 150–200 dòng cho một tính năng nhỏ. Tài liệu của `api-v2/case-va-quyet-dinh.md` và `moi/console-ho-so-vu-viec.md` sẽ dài 250–300. Đầy đủ quan trọng hơn dài: mọi trạng thái, mọi biến thể, mọi dòng huỷ/gián đoạn phải có câu trả lời, kể cả khi câu trả lời là "không ảnh hưởng".
- Trạng thái lỗi chỉ ghi vào [`bug-triage.md`](bug-triage.md). Tài liệu tính năng nêu nghi ngờ trong "Câu hỏi mở" và trỏ mã lỗi; **không** chép danh sách lỗi thành bản thứ hai.
- Nếu phát hiện cấu trúc README sai với thực tế (một tài liệu nên tách, hai tài liệu nên gộp), cứ đổi, cập nhật cấu trúc và bảng phủ, và ghi lý do trong commit message.

Bạn xong khi bảng phủ không còn dòng `chưa bắt đầu`, lượt rà nhất quán đã chạy, và mọi thứ đã commit.
