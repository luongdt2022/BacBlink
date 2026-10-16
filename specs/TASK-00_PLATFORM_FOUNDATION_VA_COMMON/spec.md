# Feature Specification: TASK-00 Platform Foundation & Common Architecture

**Feature Branch**: `foundation-platform-common`  
**Feature Directory**: `specs/TASK-00_PLATFORM_FOUNDATION_VA_COMMON`  
**Created**: 25/09/2026  
**Status**: In Planning  
**Ánh Xạ Kỹ Thuật**: Nền tảng hạ tầng, Modular Monolith Clean Architecture, Shared Kernel & Docker Compose  
**Phạm Vi**: Backend .NET Core (`backend/`), Docker Dev Environment, Shared Contracts & Base Entities  

---

## 1. Mục Đích & Bối Cảnh (Context & Objectives)

Để các Epic nghiệp vụ từ `TASK-01` đến `TASK-07` có thể phát triển nhanh chóng và đồng bộ, dự án cần một nền tảng kỹ thuật vững chắc:
1. **Kiến trúc Modular Monolith & Clean Architecture**: Tách biệt rõ ràng giữa Domain, Application, Infrastructure và Presentation.
2. **Shared Kernel / Common Packages**: Chuẩn hóa mẫu kết quả trả về `Result<T>`, xử lý lỗi tập trung `ProblemDetails`, Base Entities có audit (`CreatedAt`, `UpdatedAt`, `CreatedBy`).
3. **Môi trường Phát triển Chuẩn hóa (Docker Compose)**: Khởi chạy CSDL PostgreSQL, Redis cache chỉ bằng 1 lệnh `docker compose up -d`.
4. **Hệ thống Bảo Mật & RBAC Cốt lõi**: Cấu hình JWT Bearer Authentication, trích xuất ClaimsPrincipal, middleware kiểm tra quyền hạn.
5. **API Documentation & Health Check**: OpenAPI / Swagger tự động phân tách theo từng module và endpoint `/health`.

---

## 2. User Scenarios & Testing (Developer Journeys)

### Story 1 - Khởi Động Môi Trường CSDL Local (Priority: P1)
**Developer Journey**: Lập trình viên mới tham gia dự án có thể clone source code về, chạy lệnh Docker compose và có ngay hệ thống PostgreSQL hoạt động chuẩn UTF-8, sẵn sàng cho Entity Framework Core kết nối.

**Acceptance Scenarios**:
1. **Given** Docker Desktop đang chạy, **When** chạy `docker compose -f backend/docker-compose.yml up -d`, **Then** container PostgreSQL khởi động thành công trên cổng `5432` với database `nacentech_dev`.
2. **Given** CSDL đã khởi chạy, **When** kiểm tra kết nối từ ứng dụng backend, **Then** kết nối thành công và xác thực được connection string.

---

### Story 2 - Chuẩn Hóa Kết Quả & Mã Lỗi API (Result Pattern) (Priority: P1)
**Developer Journey**: Mọi API endpoint trong hệ thống (dù thuộc module nào) đều trả về định dạng phản hồi đồng nhất: thành công dạng `Result<T>` và thất bại dạng `Result.Failure(Error)` chuẩn RFC 7807 (ProblemDetails).

**Acceptance Scenarios**:
1. **Given** một UseCase xử lý thành công, **When** trả về `Result.Success(data)`, **Then** HTTP response có status `200 OK` với body `{ isSuccess: true, data: {...}, error: null }`.
2. **Given** một UseCase gặp lỗi nghiệp vụ (ví dụ `NotFoundError` hoặc `ValidationError`), **When** trả về `Result.Failure(...)`, **Then** Global Exception / Result Filter tự động map thành mã lỗi HTTP tương ứng (`404` hoặc `400`) kèm chi tiết lỗi chuẩn hóa.

---

### Story 3 - Thực Thể Dữ Liệu Cơ Sở & Tự Động Ghi Audit (Priority: P1)
**Developer Journey**: Mọi bảng dữ liệu nghiệp vụ kế thừa từ `AuditableEntity` đều được tự động lưu dấu thời gian tạo, cập nhật và người thực hiện mà không cần viết thủ công trong từng handler.

**Acceptance Scenarios**:
1. **Given** một Entity mới kế thừa `AuditableEntity`, **When** gọi `DbContext.SaveChangesAsync()`, **Then** các trường `CreatedAtUtc` và `CreatedBy` được tự động điền giá trị.
2. **Given** một Entity được chỉnh sửa, **When** gọi `SaveChangesAsync()`, **Then** trường `UpdatedAtUtc` được cập nhật thời gian hiện tại.

---

### Story 4 - Xác Thực JWT & Trích Xuất Phân Quyền Cơ Bản (Priority: P2)
**Developer Journey**: Backend cung cấp middleware xác thực JWT và Extension Methods trên `ClaimsPrincipal` để dễ dàng lấy `UserId`, `TenantId`, `Roles`, `Permissions` trong bất kỳ Controller hoặc Endpoint nào.

**Acceptance Scenarios**:
1. **Given** một request có Header `Authorization: Bearer <valid_token>`, **When** đi qua Auth Middleware, **Then** `HttpContext.User` được giải mã đầy đủ claims.
2. **Given** một request không có token hoặc token hết hạn, **When** truy cập endpoint có `[Authorize]`, **Then** hệ thống trả về mã `401 Unauthorized` ngay lập tức.

---

## 3. Requirements (Yêu Cầu Kỹ Thuật)

### Functional & Architectural Requirements
- **ARCH-001**: Hệ thống Backend MUST tổ chức theo mô hình Modular Monolith, chia tách thành `apps/` (API host) và `modules/` (từng domain độc lập: identity, technology, demand, v.v.).
- **ARCH-002**: Tầng dùng chung `packages/kernel` MUST cung cấp:
  - `Result<T>` và `Error` types.
  - `Entity<TId>` và `AuditableEntity`.
  - `PagedList<T>` phục vụ phân trang chuẩn cho các bảng dữ liệu.
- **ARCH-003**: Tầng `packages/persistence` MUST cấu hình `DbContextBase` hỗ trợ PostgreSQL, interceptor tự động điền audit fields, và hỗ trợ migration phân tách theo từng module.
- **ARCH-004**: Hệ thống MUST có endpoint `/health` kiểm tra trạng thái sống (liveness) và trạng thái sẵn sàng (readiness: DB connection).
- **ARCH-005**: Hệ thống MUST cấu hình Swagger / OpenAPI documentation hiển thị đầy đủ các endpoints và hỗ trợ thử nghiệm trực tiếp Bearer Auth.

### Key Entities
- **Result / Error**: Mô hình đóng gói kết quả giao tiếp giữa các tầng và trả về cho client.
- **AuditableEntity**: Lớp cơ sở chứa `Id`, `CreatedAtUtc`, `CreatedBy`, `UpdatedAtUtc`, `UpdatedBy`, `IsDeleted`.

---

## 4. Success Criteria (Tiêu Chí Nghiệm Thu)

- **SC-001**: Docker Compose khởi chạy PostgreSQL thành công, kiểm tra log không có lỗi.
- **SC-002**: Toàn bộ dự án `backend/packages/kernel` và `backend/packages/persistence` được cấu hình đầy đủ các lớp cơ sở.
- **SC-003**: 100% các Use Case sau này có thể kế thừa trực tiếp từ `Result<T>` và `AuditableEntity` mà không cần cấu hình lại.
- **SC-004**: Endpoint kiểm tra sức khỏe hệ thống `/health` trả về `200 OK` khi CSDL sẵn sàng.

---

## Spec Delta v2: Bổ sung Phân Quyền Đa Tầng 3 Chiều (3D Scoped RBAC) & 10 Vai Trò Hạt Nhân

> **Nguồn chân lý Identity/RBAC — PO chốt 29/09/2026:** mục này được ưu tiên hơn các mô tả legacy chỉ có `ANONYMOUS | USER | ADMIN | SYSTEM` tại `backend/docs/02-requirements/san-pham-v2/`. Basic Design đối chiếu: [`TASK-07`](../../Specification/02_BASIC_DESIGN/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN/README.md), [ma trận role](../../Specification/02_BASIC_DESIGN/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN/BANG_PHAN_QUYEN_VA_ROLE_HE_THONG.html). `USER`, `ADMIN` chỉ là giá trị tương thích ngược; `GUEST` là persona chưa xác thực (`ANONYMOUS`), không phải `platform_role` được lưu hay cấp JWT.

### 1. Bối Cảnh & Lý Do Thay Đổi (Change Request Context)
Hệ thống NacenTech/Nacentwin phát triển theo mô hình phân cấp quản trị đa tầng ("Quản trị công - Vận hành tư"), kết nối Bộ KH&CN, Sở KH&CN 63 tỉnh/thành, Ban điều phối 18 ngành công nghệ trọng điểm, và các cơ sở nghiên cứu liên kết (Viện - Trường).
Trước Delta v2, Backend (`SourceCode/backend`) chỉ có 2 role tĩnh (`USER` và `ADMIN`), chưa có cơ chế cô lập dữ liệu theo địa bàn (Row-Level Security) và chưa hỗ trợ phân cấp quản trị. Delta này đã thay thế giới hạn đó bằng mô hình 10 role/4 tầng dưới đây.

### 2. Yêu Cầu Chức Năng Bổ Sung (Functional Requirements Delta)
- **FR-RBAC-001 (10 Platform Roles)**: Hệ thống MUST hỗ trợ danh mục 10 vai trò hạt nhân:
  - Tầng 0: `SUPER_ADMIN` (Admin Bộ/Viện NacenTech), `OPERATOR_ADMIN` (Admin Vận hành NacenX).
  - Tầng 1 (Ủy quyền phân nhánh): `PROVINCIAL_ADMIN` (Sở KH&CN tỉnh), `SECTOR_ADMIN` (Ban ngành/Hiệp hội), `CLUSTER_ADMIN` (Viện/Trường liên kết).
  - Tầng 2 (Chủ thể thị trường & Chuyên gia): `SELLER` (Bên Bán/Shop), `BUYER` (Bên Mua/Nhu cầu), `INNOVATION_ENTITY` (Chủ thể ĐMST), `VERIFIED_EXPERT` (Chuyên gia KH&CN).
  - Tầng 3 (Công chúng): `PUBLIC_USER` / `GUEST` (Khách vãng lai, Học viên E-Learning).
- **FR-RBAC-002 (3D Scope Separation)**: Hệ thống MUST lưu trữ và xác thực phạm vi thẩm quyền của người dùng theo 4 loại:
  - `ScopeType`: `GLOBAL` (Toàn quốc/Mặc định), `PROVINCE` (Địa bàn tỉnh), `SECTOR` (Ngành công nghệ), `ORG_UNIT` (Cơ sở/Tổ chức liên kết).
  - `ScopeId`: Mã định danh tương ứng (`province_id`, `sector_id`, `org_unit_id`).
- **FR-RBAC-003 (JWT Scoped Claims)**: Khi phát hành Token JWT, hệ thống MUST nhúng các Claims: `sub` (UserId), `role` (PlatformRole), `scope_type`, `scope_id`.
- **FR-RBAC-004 (Actor Context Extraction)**: `ICurrentActor` và `HttpCurrentActor` MUST giải mã và cung cấp `ScopeType` và `ScopeId` cho mọi request context.
- **FR-RBAC-005 (Backward Compatibility)**: Người dùng cũ chưa có scope mặc định nhận `ScopeType = 'GLOBAL'` và `ScopeId = null`.

### 3. Tiêu Chuẩn Chấp Thuận (Acceptance Criteria)
- **AC-DELTA-01**: Khởi tạo tài khoản mới với role bất kỳ trong 10 role và gán scope tương ứng thành công.
- **AC-DELTA-02**: Token JWT sau khi đăng nhập giải mã chứa đúng `scope_type` và `scope_id`.
- **AC-DELTA-03**: Endpoint `/api/v2/users/me` trả về thông tin đầy đủ gồm `platformRole`, `scopeType`, `scopeId`.
- **AC-DELTA-04**: 100% tests cũ của `SourceCode/backend` không bị gãy (Zero regression).

### 4. Vòng đời tài khoản và ranh giới cấp role (PO chốt)

- Đăng ký công khai tạo tài khoản **tự kích hoạt** ở Tầng 3 với `PUBLIC_USER`, scope mặc định `GLOBAL`/`null`; không được tự chọn role đặc quyền.
- Các role Tầng 2 (`SELLER`, `BUYER`, `INNOVATION_ENTITY`, `VERIFIED_EXPERT`) được gán sau hồ sơ nghiệp vụ và luồng phê duyệt tương ứng; các profile không đồng nghĩa role được cấp trước khi duyệt.
- Các role Tầng 0–1 (`SUPER_ADMIN`, `OPERATOR_ADMIN`, `PROVINCIAL_ADMIN`, `SECTOR_ADMIN`, `CLUSTER_ADMIN`) được provision/gán scope qua bề mặt quản trị có kiểm quyền và audit; không có đường đăng ký công khai.
- Mọi đăng nhập thành công của 10 role phải phát JWT có `role`, `scope_type`, `scope_id` và điều hướng về cổng theo `FR-PORTAL-001`.

### 5. Hiện trạng triển khai và phần chưa hoàn tất

Migration, domain constants, `Person.ScopeType/ScopeId`, JWT claims, actor extraction, policy recognition và redirect FE đã có. Tuy nhiên use case/API để đăng ký ra `PUBLIC_USER`, tự kích hoạt, provision/gán role+scope, và E2E đăng ký → đăng nhập đủ 10 role chưa hội tụ. Các phần này là công việc mở, không được suy diễn là hoàn thành chỉ vì DB/migration đã có.

---

## Spec Delta v3: Hệ Thống Thành Phần Dùng Chung & Phi Chức Năng Frontend (Frontend Common Foundations)

### 1. Bối Cảnh & Lý Do Thay Đổi (Frontend Common Context)
Để phục vụ giao diện người dùng đồng bộ cho toàn bộ các phân hệ từ `TASK-01` đến `TASK-07`, tầng Frontend (`SourceCode/frontend/`) bắt buộc phải có một bộ Design System và các thành phần dùng chung (Common Primitives / NFRs) chuẩn hóa, thay vì mỗi màn hình tự phát triển lặp lại.

### 2. Yêu Cầu Chức Năng & Phi Chức Năng Chi Tiết (Requirements Delta)

- **FR-COMM-001 (Dialog & Popup Modals)**:
  - Hệ thống MUST cung cấp component `Dialog` đa năng hỗ trợ backdrop mờ, đóng khi click outside / phím ESC, animation trượt nhẹ.
  - Cung cấp component `ConfirmModal` chuyên dụng phục vụ các hành vi quan trọng: xác nhận hủy, xác nhận xóa, xác nhận nộp hồ sơ xét duyệt với 2 nút hành động rõ ràng (Hủy / Đồng ý).

- **FR-COMM-002 (Toast Notification System)**:
  - Cung cấp hook `useToast()` và `ToastProvider` quản lý thông báo nổi góc màn hình không gây chặn tương tác (Non-blocking).
  - Hỗ trợ 4 kiểu thông báo: `success` (xanh), `error` (đỏ), `warning` (vàng), `info` (xanh dương) tự động biến mất sau 3.5 giây.

- **FR-COMM-003 (Theme Sáng / Tối - Dark / Light Mode)**:
  - Cung cấp component `ThemeToggle` và `ThemeProvider` chuyển đổi giữa chế độ Sáng (`light`) và Tối (`dark`).
  - Trạng thái theme MUST được lưu vào `localStorage` và tự động áp dụng class `dark` lên thẻ `<html>`.

- **FR-COMM-004 (Bộ Điều Khiển Cỡ Chữ Tiếp Cận - Fontsize Scaler)**:
  - Cung cấp bộ nút điều chỉnh cỡ chữ `A-` (Nhỏ 14px), `A` (Mặc định 16px), `A+` (Lớn 18px).
  - Phục vụ người cao tuổi, nhà khoa học lớn tuổi và tiêu chuẩn tiếp cận dịch vụ công trực tuyến (Accessibility Standard).

- **FR-COMM-005 (Đa Ngôn Ngữ Song Ngữ - i18n Context vi/en)**:
  - Cung cấp context `I18nProvider` và hook `useI18n()` hỗ trợ chuyển đổi tức thì giữa Tiếng Việt (`vi`) và Tiếng Anh (`en`).
  - Hỗ trợ từ điển nhãn dùng chung (Trang chủ, Đăng nhập, Đăng ký, Chuyên gia, Doanh nghiệp, Tìm kiếm, Đổi theme, Ngôn ngữ, Đăng xuất).

- **FR-COMM-006 (Navigation Shell Dùng Chung: Navbar & Footer)**:
  - Cung cấp Header Navigation Bar cố định trên đỉnh trang:
    - Logo NacenTech & Brand Title.
    - Menu điều hướng liên kết nhanh đến các phân hệ (`TASK-01` $\rightarrow$ `TASK-07`).
    - Khối tiện ích góc phải: Bộ đổi Font chữ, Bộ đổi Ngôn ngữ (VI/EN), Bộ đổi Theme Sáng/Tối.
    - Khối người dùng: Hiển thị nút Đăng nhập / Đăng ký nếu chưa login; hiển thị Avatar, Tên người dùng, Badge Role và nút Đăng xuất nếu đã login.
  - Cung cấp Footer chuẩn hóa thông tin cơ quan chủ quản (Bộ KH&CN, Viện Ứng dụng Công nghệ NacenTech).

- **NFR-COMM-007 (Global Error Boundary)**:
  - Bổ sung `error.tsx` chặn lỗi crash runtime toàn trang, hiển thị giao diện báo lỗi thân thiện kèm nút "Thử tải lại trang" thay vì màn hình trắng.

### 3. Tiêu Chuẩn Nghiệm Thu Frontend Common (Acceptance Criteria)
- **AC-COMM-01**: Bật tắt Theme Sáng / Tối đổi màu toàn bộ nền và chữ mượt mà, reload trang vẫn giữ nguyên theme đã chọn.
- **AC-COMM-02**: Bấm nút tăng cỡ chữ `A+` phóng to văn bản đọc dễ dàng, bấm `A` quay về chuẩn.
- **AC-COMM-03**: Bấm chuyển sang `EN` toàn bộ Navbar và các nhãn tiện ích tự động đổi sang Tiếng Anh.
- **AC-COMM-04**: Mọi trang có thể gọi `toast.success(...)` hoặc `toast.error(...)` hiển thị thông báo góc phải màn hình.
- **AC-COMM-05**: Lệnh `pnpm build` tại `SourceCode/frontend` đạt 0 lỗi biên dịch.

---

## Spec Delta v4: Quy Hoạch 4 Cổng Đăng Nhập & Không Gian Làm Việc (Path-Based Role Portals — Phương Án B)

### 1. Bối Cảnh & Mục Tiêu (Context & Objectives)
Thay vì xây dựng 10 domain độc lập gây phân mảnh phiên làm việc và tốn kém tài nguyên hạ tầng, hệ thống chốt **Phương án B: Hợp nhất Single Domain với Cấu trúc Phân nhánh Đường dẫn (Path-Based Role Portals)** trên Next.js 15 App Router.
Mỗi nhóm vai trò trong 10 Roles hạt nhân sẽ được cấp một Cổng giao diện chuyên biệt với bố cục Layout, quyền hạn truy cập và quy trình nghiệp vụ độc lập.

### 2. Yêu Cầu Chức Năng Chi Tiết (Functional Requirements Delta)

- **FR-PORTAL-001 (Role-Based Gateway Routing & Điều Hướng Sau Đăng Nhập)**:
  - Khi người dùng đăng nhập thành công tại `/login`, hệ thống MUST trích xuất `role` và `scope` từ JWT payload để điều hướng tức thì về đúng cổng thẩm quyền:
    - **Tầng 0** (`SUPER_ADMIN`, `OPERATOR_ADMIN`): Điều hướng về `/admin`.
    - **Tầng 1** (`PROVINCIAL_ADMIN`, `SECTOR_ADMIN`, `CLUSTER_ADMIN`): Điều hướng về `/gov`.
    - **Tầng 2** (`SELLER`, `BUYER`, `INNOVATION_ENTITY`, `VERIFIED_EXPERT`): Điều hướng về `/portal`.
    - **Tầng 3** (`PUBLIC_USER`, `GUEST`): Điều hướng về `/`.

- **FR-PORTAL-002 (Cổng 1: Đại Chúng & Tra Cứu — Path: `/`)**:
  - Dành cho: Khách vãng lai, Doanh nghiệp tìm hiểu chung, Nhà nghiên cứu tra cứu bài báo/sáng chế công khai.
  - Chức năng: Tìm kiếm đa lĩnh vực, khám phá 18 ngành công nghệ TT17, xem danh bạ chuyên gia công khai, giới thiệu cơ chế chính sách KH&CN.

- **FR-PORTAL-003 (Cổng 2: Không Gian Thị Trường & Đổi Mới Sáng Tạo — Path: `/portal/*`)**:
  - Dành cho: `SELLER`, `BUYER`, `INNOVATION_ENTITY`, `VERIFIED_EXPERT`.
  - Layout: `PortalLayout` có thanh Sidebar bên trái quản lý các nghiệp vụ thị trường:
    - `/portal`: Dashboard tổng quan chỉ số giao dịch và yêu cầu kết nối.
    - `/portal/technologies`: Quản lý gian hàng chào bán công nghệ (TRL 1-9).
    - `/portal/demands`: Đăng bài toán tìm mua công nghệ & xem AI Matching.
    - `/portal/expert`: Hồ sơ Lý lịch khoa học cá nhân & lịch tư vấn chuyển giao.

- **FR-PORTAL-004 (Cổng 3: Quản Trị Phân Cấp & Thẩm Định Nhà Nước — Path: `/gov/*`)**:
  - Dành cho: `PROVINCIAL_ADMIN` (63 Sở KH&CN), `SECTOR_ADMIN` (18 Ban Ngành TT17), `CLUSTER_ADMIN` (Viện - Trường).
  - Layout: `GovLayout` có Header hiển thị rõ huy hiệu địa bàn/ngành thẩm quyền (`ScopeBadge: Tỉnh/Ngành`) và cảnh báo SLA.
    - `/gov`: Dashboard kiểm duyệt Maker-Checker (Hàng đợi cấp tỉnh & cấp ngành).
    - `/gov/approvals`: Danh sách duyệt tài khoản, Shop bán, Nhu cầu mua, Chuyên gia địa bàn.
    - `/gov/reports`: Báo cáo thống kê chỉ đạo điều hành chuyển giao công nghệ.

- **FR-PORTAL-005 (Cổng 4: Quản Trị Hệ Thống Tối Cao — Path: `/admin/*`)**:
  - Dành cho: `SUPER_ADMIN` (Bộ KH&CN, Viện NacenTech), `OPERATOR_ADMIN` (Đội vận hành NacenX).
  - Layout: `AdminLayout` chuyên dụng dành cho Quản trị Trung ương:
    - `/admin`: Dashboard sức khỏe hệ thống toàn quốc & phân bố 63 tỉnh.
    - `/admin/users`: Quản lý người dùng, gán 10 roles và phân bổ Scope 3 chiều.
    - `/admin/audit-logs`: Bảng nhật ký kiểm toán bất biến (Immutable Audit Trail) Cấp độ 3.
    - `/admin/master-data`: Cấu hình danh mục 18 ngành TT17 và ma trận liên kết.

- **FR-PORTAL-006 (Role-Based Route Guarding & Phòng Vệ Truy Cập)**:
  - Nếu tài khoản Tầng 2 hoặc Tầng 3 cố tình truy cập vào `/gov` hoặc `/admin`, hệ thống MUST chặn hiển thị và chuyển hướng về trang cảnh báo 403 Forbidden hoặc Cổng `/portal` của họ.

### 3. Tiêu Chuẩn Nghiệm Thu (Acceptance Criteria)
- **AC-PORTAL-01**: Đăng nhập với role `ADMIN` tự động chuyển thẳng vào `/admin`; đăng nhập với role `PROVINCIAL_ADMIN` chuyển vào `/gov`; đăng nhập với role `EXPERT` hoặc `SELLER` chuyển vào `/portal`.
- **AC-PORTAL-02**: Cả 4 cổng đều sở hữu Layout riêng biệt, nhận diện rõ thương hiệu và vai trò của người dùng.
- **AC-PORTAL-03**: Truy cập trái quyền hiển thị cảnh báo phân quyền hoặc tự động redirect an toàn.
- **AC-PORTAL-04**: Build Next.js 15 đạt 100% không lỗi (`pnpm build` Exit code 0).

---

## Spec Delta v5: Hoàn tất đăng ký, provision và đăng nhập 10 role

**Quyết định nguồn:** Basic Design `TASK-07` (PO chốt 29/09/2026) và ma trận 10 role/4 tầng. Phần này thay thế mọi diễn giải mới tạo `USER`, `ADMIN`, `EXPERT`, `SHOP_OWNER` hoặc `GUEST` như một `platform_role`; các giá trị đó chỉ còn tương thích dữ liệu/route cũ. `GUEST` tương ứng actor anonymous, không lưu DB và không có JWT.

### FR-RBAC-006 — Public registration

`POST /api/v1/auth/register` không nhận role/scope. Khi hợp lệ, hệ thống tạo ngay account `PUBLIC_USER`, `isActive=true`, `scopeType=GLOBAL`, `scopeId=null`; response trả `REGISTER_SUCCESS`. Endpoint activate/resend-activation vẫn tồn tại chỉ để xử lý account legacy inactive, không được gọi cho account mới.

### FR-RBAC-007 — Provision và gán role/scope có kiểm quyền

- `POST /api/v2/identity/provisioned-accounts` tạo account active với một trong đúng 10 role hạt nhân và scope hợp lệ.
- `PUT /api/v2/identity/persons/{id}/role-scope` đổi role/scope cho account đã tồn tại (đường nâng hạng sau approval profile).
- Cả hai endpoint yêu cầu actor thỏa policy `person.provision_role` (`ADMIN` legacy, `SUPER_ADMIN`, `OPERATOR_ADMIN`); application service lặp lại kiểm quyền, vì controller không là trust boundary.
- Sau `CommitAsync`, hệ thống ghi Audit `SUCCESS`, action `person.provision_role`, không bao gồm password/PII ngoài role và scope.

### BR-RBAC-006 — Cặp role/scope canonical

| Role | Scope được chấp nhận |
| --- | --- |
| `SUPER_ADMIN`, `OPERATOR_ADMIN`, `PUBLIC_USER` | `GLOBAL` + `scopeId=null` |
| `PROVINCIAL_ADMIN` | `PROVINCE` + scopeId |
| `SECTOR_ADMIN` | `SECTOR` + scopeId |
| `CLUSTER_ADMIN` | `ORG_UNIT` + scopeId |
| `SELLER`, `BUYER`, `INNOVATION_ENTITY`, `VERIFIED_EXPERT` | Một trong `GLOBAL` (id null), `PROVINCE`, `SECTOR`, `ORG_UNIT` (id bắt buộc); scope do luồng profile đã duyệt quyết định |

Scope type khác danh mục, scopeId thiếu khi không-global, scopeId có ở global, hoặc role legacy/ngoài 10 đều là validation error. API không có đường tự cấp role đặc quyền.

### AC-DELTA-05 — Nghiệm thu end-to-end

1. Public registration → login thành công ngay và JWT có `PUBLIC_USER`/`GLOBAL`.
2. Với từng role trong 10 role: provision hoặc assignment hợp lệ → login thành công → JWT giữ `role`, `scope_type`, `scope_id` → frontend đi `/admin`, `/gov`, `/portal` hoặc `/` đúng tier.
3. Provision/assignment không hợp lệ hoặc actor không đủ quyền bị từ chối; thay đổi hợp lệ có audit `SUCCESS`.

---

## Spec Delta v6: Menu tài khoản và đăng xuất Web Portal

**Căn cứ thay đổi:** Decision Record “Điều hướng tài khoản và kết thúc phiên” tại `Specification/BASIC_DESIGN_NACENTECH.md` và `TASK-01` Basic Design, ngày 30/09/2026.

### REQ-SESSION-001 — Menu tài khoản tại Header

Khi có phiên đã xác thực, Header MUST thay vùng thao tác tài khoản rời rạc bằng một điều khiển danh tính mở menu tài khoản. Menu hiển thị tên, vai trò và đúng hai lối chính: **Cài đặt tài khoản** (`/settings`) và **Đăng xuất**. Người dùng chưa đăng nhập vẫn thấy các lối Đăng nhập/Đăng ký hiện có.

### REQ-SESSION-002 — Đăng xuất từ Settings

Trang `/settings` MUST cung cấp hành động Đăng xuất tương đương Header, để người dùng có thể kết thúc phiên mà không cần quay lại trang chủ.

### BR-SESSION-001 — Xác nhận và kết thúc phiên cục bộ

Chọn Đăng xuất chỉ mở hộp xác nhận; chỉ sau khi người dùng xác nhận, Web Portal mới xóa thông tin phiên đã lưu trên thiết bị hiện tại, thông báo kết quả và điều hướng về `/`. Hủy hoặc đóng hộp xác nhận không được thay đổi phiên. Delta này không tạo cơ chế thu hồi phiên phía máy chủ, đăng xuất từ xa hoặc quản lý thiết bị.

### UI-SESSION-001 — Trạng thái UX bắt buộc

- Menu đóng khi người dùng chọn điều hướng, bấm ngoài menu hoặc nhấn `Escape`; điều khiển danh tính cập nhật `aria-expanded`.
- Khi xác nhận logout, UI dùng ConfirmModal hiện có; Success là toast và về `/`; Cancel giữ nguyên phiên và màn hiện tại.
- Trên màn hình hẹp, menu điều hướng vẫn phải cho phép vào Settings và yêu cầu logout, không làm mất một trong hai hành động.

### AC-DELTA-06 — Tiêu chuẩn chấp thuận

1. Với phiên hợp lệ, mở menu Header thấy Cài đặt tài khoản và Đăng xuất; chọn Settings điều hướng tới `/settings`.
2. Chọn Đăng xuất rồi hủy giữ token và user context; xác nhận xóa cả hai, điều hướng `/` và lần tải lại không còn nhận diện phiên.
3. Hành động Đăng xuất ở `/settings` có cùng quy tắc xác nhận/kết thúc phiên.
4. Vitest component và `pnpm build` đều pass; menu dùng được bằng bàn phím và không làm hồi quy Header ở desktop/mobile.

---

## Spec Delta v7 (CR-2026-006): Phân Nhánh Menu Tác Nghiệp Động Theo Vai Trò (Dynamic Role-Tailored Workspace Navigation)

**Căn cứ thay đổi:** Quyết định PO về Tối ưu hóa Trải nghiệm Tác nghiệp Đa vai trò (Role-Tailored Workspaces) & Ma trận 30 Màn hình Basic Design (`Specification/02_BASIC_DESIGN/MA_TRAN_KICH_BAN_VA_TRANG_THAI_30_MAN_HINH.md`).

### 1. Bối Cảnh & Vấn Đề (Context & Problem Statement)
Trước Delta v7, `PortalLayout` (`src/app/portal/layout.tsx`) hiển thị một danh sách menu tĩnh cố định 7 mục chung cho mọi đối tượng. Điều này dẫn đến sự chồng chéo và nhiễu loạn giao diện: Bên Mua (Buyer) nhìn thấy menu của Nhà Cung Ứng (Seller) và Chuyên gia; Chuyên gia nhìn thấy menu quản lý gian hàng và bài toán tìm mua; Admin và Cán bộ Nhà nước không có lối tắt quay lại Console chuyên trách.

### 2. Yêu Cầu Chức Năng Bổ Sung (Requirements Delta)

- **REQ-NAV-001 (Dynamic Role-Tailored Sidebar Menu - PO Approved)**:
  - Sidebar tác nghiệp `/portal` MUST render danh sách menu động được "may đo" riêng cho từng nhóm vai trò, loại bỏ hoàn toàn các nhãn kỹ thuật dev, nút trùng lặp và các liên kết rỗng:
    - **Bên Mua (`BUYER`)**: Tổng quan Mua sắm (`/portal`), Bài toán Tìm mua (`/portal/buyer/demands`), Radar Ghép Nối AI (`/portal/matching/radar`), Tiến trình Hợp tác & MOU (`/portal/opportunities/pipeline`), Khảo sát Nhu cầu (TNI) (`/khao-sat-nhu-cau`), Đánh giá Năng lực TT17 (`/assessments/tt17`), Hồ sơ Doanh nghiệp (`/portal/enterprise/profile`).
    - **Nhà Cung Ứng (`SELLER`)**: Tổng quan Gian hàng (`/portal`), Kho Công nghệ TRL 1-9 (`/portal/seller/technologies`), Yêu cầu Kết nối Nhận được (`/portal/opportunities/pipeline?tab=inbound`), Radar Tìm Kiếm Nhu Cầu AI (`/portal/matching/radar`), Tiến trình Chuyển giao & MOU (`/portal/opportunities/pipeline`), Hồ sơ Đơn vị / Viện Trường (`/portal/enterprise/profile`).
    - **Chuyên Gia KH&CN (`VERIFIED_EXPERT`, `EXPERT`)**: Tổng quan chuyên gia (`/portal`), Hồ sơ LLKH của tôi (`/portal/expert/profile`), Lời mời Tư vấn Doanh nghiệp (`/portal/opportunities/pipeline?type=consulting`), Radar Cơ hội Phù hợp AI (`/portal/matching/radar`), Dự án Đồng hành & Hợp tác (`/portal/opportunities/pipeline`).
    - **Chủ Thể ĐMST (`INNOVATION_ENTITY`)**: Phân 2 khối trực quan: Khối Cung–Cầu (Tổng quan ĐMST, Bài toán Cần Mua, Công nghệ Chào Bán, Radar AI, Tiến trình Hợp tác); Khối Năng lực & Hồ sơ (Tự Đánh giá TT17, Hồ sơ Doanh nghiệp ĐMST).
    - **Công Chúng / Mới Đăng Ký (`PUBLIC_USER`, `USER`)**: Bàn làm việc Cá nhân (`/portal`), Radar Khám Phá AI (`/portal/matching/radar`), Đăng ký Nâng hạng Vai trò (`/profile/upgrade/expert`), Cài đặt Tài khoản (`/settings`). (Triệt tiêu Kanban rỗng).
    - **Quản Trị Viên (`SUPER_ADMIN`, `OPERATOR_ADMIN`, `ADMIN`, `PROVINCIAL_ADMIN`, `CLUSTER_ADMIN`)**: Góc nhìn Giám sát Thực địa sàn B2B kèm card điều hướng nhanh 1-click quay về `/admin` hoặc `/gov`.

- **REQ-NAV-002 (Dynamic Workspace Identity Badge)**:
  - Header Sidebar MUST hiển thị nhãn và tiêu đề phân định rõ không gian tác nghiệp của vai trò hiện tại (ví dụ: *Bên Mua Công Nghệ - Workspace Bên Mua*, *Nhà Cung Ứng Công Nghệ - Workspace Nhà Cung Ứng*, *Chuyên Gia KH&CN - Workspace Chuyên Gia*, *Thành Viên Đại Chúng - Bàn Làm Việc Cá Nhân*, *Quản Trị Viên Hệ Thống - Góc Nhìn Giám Sát Thực Địa*).

- **REQ-NAV-003 (Accurate Sub-route Mapping)**:
  - Tất cả các liên kết trong Sidebar MUST trỏ chính xác về route thực tế (ví dụ: `/portal/buyer/demands`, `/portal/seller/technologies`, `/portal/enterprise/profile`), triệt tiêu hoàn toàn các route giả định chưa tồn tại.

### 3. Tiêu Chuẩn Chấp Thuận (Acceptance Criteria)
- **AC-DELTA-07**: Đăng nhập với role `BUYER` không nhìn thấy menu chào bán công nghệ hoặc hồ sơ chuyên gia; đăng nhập với `SELLER` không nhìn thấy bài toán mua; đăng nhập với `VERIFIED_EXPERT` chỉ thấy LLKH và lời mời tư vấn; `PUBLIC_USER` không thấy bảng Kanban rỗng.
- **AC-DELTA-08**: Quản trị viên (`ADMIN`/`GOV`) có card chuyển nhanh về `/admin` hoặc `/gov`.
---

## Spec Delta v8 (CR-2026-011): Hồ Sơ Cá Nhân & Hub Nâng Hạng Vai Trò Thành Viên (/profile) [GAP-01]

**Căn cứ thay đổi:** Quyết định PO `PO-DEC-20261013-10` & HTML Wireframe SSOT (`Specification/02_BASIC_DESIGN/TASK-00_PLATFORM_FOUNDATION_VA_COMMON/wireframe_ho_so_ca_nhan.html`).

### 1. Bối Cảnh & Vấn Đề (Context & Problem Statement)
Trước Delta v8, tuyến `/profile` đang bị `redirect("/settings")` cưỡng bức, dẫn đến việc thiếu một màn hình Hồ sơ cá nhân độc lập hiển thị thông tin Avatar/Bio, thẻ định danh tài khoản, và quan trọng nhất là Hub hành trình nâng cấp vai trò thành viên (từ Member đại chúng lên Bên Mua, Nhà Cung Ứng, hoặc Chuyên gia KH&CN).

### 2. Yêu Cầu Chức Năng Bổ Sung (Requirements Delta)
- **REQ-PROFILE-001 (Standalone Profile Screen 3 Tabs)**:
  - Tuyến `/profile` MUST render trang Hồ sơ cá nhân độc lập với 3 tab:
    - **Tab 1: Thông tin cá nhân & Định danh**: Hiển thị Avatar (Monogram), Họ tên, Email, Số điện thoại, Mã định danh người dùng (`USR-XXXX`), Vai trò hiện tại (`Role Badge`), và Trạng thái xác thực PDPD.
    - **Tab 2: Nâng hạng vai trò (Role Upgrade Hub)**: Hiển thị các khối tùy chọn nâng hạng:
      1. *Nâng hạng Chuyên gia KH&CN*: Dẫn hướng sang `/profile/upgrade/expert`.
      2. *Định danh Doanh nghiệp ĐMST (Bên Mua/Bên Bán)*: Dẫn hướng sang `/portal/enterprise/profile/edit` hoặc `/portal/buyer/demands`.
    - **Tab 3: Lịch sử & Không gian làm việc**: Hiển thị các lối tắt nhanh đến Workspace tương ứng với vai trò đã kích hoạt (`/portal`).
- **REQ-PROFILE-002 (Auth Guard & State Handling)**:
  - Khi chưa đăng nhập, tự động điều hướng về `/login?redirect=/profile`.
  - Hiển thị đầy đủ 5 UX States (Loading spinner, Success view, Error toast).

### 3. Tiêu Chuẩn Chấp Thuận (Acceptance Criteria)
- **AC-DELTA-10**: Truy cập `/profile` khi đã đăng nhập hiển thị đầy đủ thông tin định danh và không bị redirect sang `/settings`.
- **AC-DELTA-11**: Các nút "Bắt đầu Đăng ký Nâng hạng" Chuyên gia và Doanh nghiệp điều hướng chính xác 1:1 sang Wizard tương ứng.

---

## Spec Delta v9 (CR-2026-012): Cổng Đăng Ký Nâng Cấp Vai Trò Đa Tuyến (Upgrade Hub `/profile/upgrade` 4 Lộ Trình)

**Căn cứ thay đổi:** Quyết định PO `PO-DEC-20261013-11`, Mục 1.5 [`Specification/HUONG_DAN_SU_DUNG_CHI_TIET_NACENTWIN.md`](file:///Users/luongdt/Library/CloudStorage/GoogleDrive-luongdt.wi@gmail.com/My%20Drive/NacenTechProject/Specification/HUONG_DAN_SU_DUNG_CHI_TIET_NACENTWIN.md) và HTML Wireframe SSOT [`wireframe_nang_cap_tai_khoan_hub.html`](file:///Users/luongdt/Library/CloudStorage/GoogleDrive-luongdt.wi@gmail.com/My%20Drive/NacenTechProject/Specification/02_BASIC_DESIGN/TASK-00_PLATFORM_FOUNDATION_VA_COMMON/wireframe_nang_cap_tai_khoan_hub.html).

### 1. Bối Cảnh & Vấn Đề (Context & Problem Statement)
Tuyến `/profile/upgrade` trước đây chỉ chứa lệnh chuyển hướng cứng `redirect("/profile/upgrade/expert")`. Điều này khiến tài khoản đại chúng (`PUBLIC_USER`) bị tước quyền lựa chọn nâng hạng lên Bên Mua (`BUYER`), Bên Bán (`SELLER`), hoặc Doanh nghiệp ĐMST (`INNOVATION_ENTITY`), gây mâu thuẫn trực tiếp với tài liệu Hướng Dẫn Sử Dụng và Thiết Kế Cơ Sở.

### 2. Yêu Cầu Chức Năng Bổ Sung (Requirements Delta)
- **REQ-UPGRADE-HUB-001 (4 Upgrade Route Cards Display)**:
  - Tuyến `/profile/upgrade` MUST render giao diện Hub hoàn chỉnh bao gồm 4 Thẻ Lộ Trình (4 Cards):
    1. **Chuyên gia KH&CN (`VERIFIED_EXPERT`)**: Dẫn sang `/profile/upgrade/expert` (Wizard 3 bước).
    2. **Doanh nghiệp ĐMST (`INNOVATION_ENTITY`)**: Mở Modal/Form Kê khai Mã số thuế, Tra cứu MST tự động, Tên doanh nghiệp, Tỉnh/thành, Tệp Giấy phép ĐKKD (PDF $\le$ 10MB), Cam kết pháp lý theo chuẩn `ui-profile-upgrade-001.svg`.
    3. **Bên Mua (Buyer) (`BUYER`)**: Cung cấp tùy chọn dẫn trực tiếp vào Phiếu Khảo Sát Sâu DNNVV 7 Phần (`/khao-sat-nhu-cau`) để đăng bài toán tìm mua và tự động kích hoạt vai trò Buyer.
    4. **Bên Bán (Seller) (`SELLER`)**: Mở Modal/Form Đăng ký Mở Gian Hàng Công Nghệ (Tên đơn vị R&D/viện trường, Lĩnh vực TT17, Sở KH&CN tiếp nhận quản lý địa bàn, Mô tả năng lực cung ứng) với SLA 24h.
- **REQ-UPGRADE-HUB-002 (Comparison Matrix)**:
  - Hiển thị Bảng đối soát ma trận phân cấp và điều kiện hồ sơ giữa 4 vai trò (Hồ sơ bắt buộc, Cơ quan thẩm định, Cam kết SLA, Mã Role).
- **REQ-UPGRADE-HUB-003 (Role-Tailored Sidebar Link Update)**:
  - Cập nhật mục "Đăng ký Nâng hạng Vai trò" trong Sidebar của `PUBLIC_USER` tại `src/app/portal/layout.tsx` trỏ chính xác về `/profile/upgrade` (Hub tổng quan) thay vì `/profile/upgrade/expert`.

### 3. Tiêu Chuẩn Chấp Thuận (Acceptance Criteria)
- **AC-DELTA-12**: Truy cập `/profile/upgrade` khi đã đăng nhập hiển thị đầy đủ 4 Thẻ Lộ Trình và không bị chuyển hướng sang `/profile/upgrade/expert`.
- **AC-DELTA-13**: Thẻ Chuyên gia dẫn đến `/profile/upgrade/expert`; Thẻ Bên Mua dẫn đến `/khao-sat-nhu-cau`.
- **AC-DELTA-14**: Modal Doanh nghiệp ĐMST hỗ trợ tra cứu MST và nộp hồ sơ có thông báo mã tiếp nhận thành công.
- **AC-DELTA-15**: Modal Gian hàng Seller tiếp nhận thông tin và nộp đơn thành công với SLA 24h.
- **AC-DELTA-16**: Sidebar của `PUBLIC_USER` trong Portal liên kết đến `/profile/upgrade`.




---

## 10. Spec Delta v2: Chuẩn Hóa Typography Cổng DVCQG (Nunito Sans & Lora) [PO-DEC-20261015-01]

> **Căn cứ pháp lý & Thiết kế cơ sở:**
> - Quyết định PO: **`PO-DEC-20261015-01`** (Phê duyệt chuẩn hóa Typography Cổng DVCQG cho Hệ sinh thái Gov-Tech NacenTwin).
> - Nguồn chân lý kiến trúc: Mục 7.3 [`Specification/BASIC_DESIGN_NACENTECH.md`](file:///Users/luongdt/Library/CloudStorage/GoogleDrive-luongdt.wi@gmail.com/My%20Drive/NacenTechProject/Specification/BASIC_DESIGN_NACENTECH.md) v0.12.
> - Kế thừa tiêu chuẩn Cổng Dịch vụ công Quốc gia (DVCQG) kết hợp đặc thù Nền tảng Đổi mới sáng tạo & Chuyển giao công nghệ Quốc gia (Bộ Khoa học & Công nghệ).

---

### 1. Bối Cảnh & Lý Do Thay Đổi (Context & Problem Statement)

Trong các phiên bản trước đây, hệ thống giao diện Frontend sử dụng font `Be Vietnam Pro` cho toàn bộ UI và tiêu đề. Qua khảo sát thực tế và đánh giá công thái học Gov-Tech:
1. **Thiếu tính trang nghiêm hành chính**: Việc sử dụng hoàn toàn một font Sans-serif khiến các tiêu đề Quốc hiệu, Tiêu ngữ, Banners và Header cơ quan cấp Bộ thiếu đi sự uy nghiêm, hàn lâm đặc trưng của cơ quan công quyền nhà nước.
2. **Chiếm dụng không gian ngang (Horizontal Spacing Issue)**: Font `Be Vietnam Pro` có bề ngang ký tự (letter-width) tương đối rộng, dẫn đến nguy cơ gãy dòng hoặc tràn viền thanh Navigation Menu 7 mục trên các màn hình làm việc phổ biến của cán bộ nhà nước (laptop 1024px – 1366px).
3. **Mật độ thông tin Data Grid hạn chế**: Đối với các bảng biểu dày đặc số liệu (Danh bạ 304 DN, 18 ngành VSIC, bảng tiêu chí điểm số TNI/TT17), các nét chữ cần độ mở (aperture) cao và x-height tối ưu hơn để chống mỏi mắt khi cán bộ thẩm định thao tác liên tục.

Quyết định **PO-DEC-20261015-01** chính thức xác lập kiến trúc **Dual Font Architecture** chuẩn Cổng DVCQG: kết hợp hài hòa giữa **Nunito Sans** (hiện đại, thân thiện, tiết kiệm không gian) và **Lora** (trang trọng, uy nghiêm, chuẩn mực hành chính).

---

### 2. Yêu Cầu Kỹ Thuật & Kiến Trúc Typography (Typography Requirements)

#### UI-REQ-TYPO-01: Kiến Trúc Font Song Hành (Dual Font Architecture)

Hệ thống Frontend MUST tích hợp và quản lý 2 bộ font chuẩn thông qua `next/font/google` với cấu hình subset `vietnamese` chuẩn UTF-8 Unicode dựng sẵn:

1. **Font UI / Body / Controls / Data Grid / Cards / Forms (`--font-sans`) — `Nunito Sans`**:
   - **Weights hỗ trợ**: `400 (Regular)`, `500 (Medium)`, `600 (SemiBold)`, `700 (Bold)`.
   - **Phạm vi áp dụng**: 100% nội dung thân văn bản (Body text), menu điều hướng, nút bấm CTA, nhãn form, bảng dữ liệu số liệu (Data Grid), thẻ thông tin (Cards), hộp thoại (Modals/Dialogs) và huy hiệu trạng thái (Badges).
   - **Ưu thế kỹ thuật**:
     - *Tỷ lệ x-height tối ưu & bo góc vi mô (micro-rounded)*: Giảm áp lực thị giác khi người dùng phải đọc và nhập liệu các biểu mẫu dài (Khảo sát TT17 26 tiêu chí, Form thu thập nhu cầu 7 bước).
     - *Tiết kiệm 8% - 12% diện tích ngang* so với `Be Vietnam Pro`, triệt tiêu hoàn toàn lỗi vỡ layout hoặc tràn hàng ngang trên thanh Header Navigation.
     - *Độ đọc sắc nét ở kích thước nhỏ (12px - 14px)*: Phù hợp tối đa cho Data Grid và Micro-copy.

2. **Font Tiêu Đề Trang Trọng / Quốc Hiệu / Heading Quốc Gia / Banners (`--font-heading`, `--font-serif`) — `Lora`**:
   - **Weights hỗ trợ**: `600 (SemiBold)`, `700 (Bold)`.
   - **Phạm vi áp dụng**: Quốc hiệu, Tiêu ngữ, Tên Viện / Bộ trên Header, Banner quốc gia, Khẩu hiệu Slogan Hero Banner trang chủ, Tiêu đề phân hệ cấp 1 (Section Titles lớn), Giấy chứng nhận và Văn bằng bảo hộ SHTT.
   - **Ưu thế kỹ thuật**:
     - *Kiểu chữ Serif có chân truyền thống*: Tạo điểm nhấn uy nghiêm, chuẩn mực công quyền nhà nước của Cổng Khoa học & Công nghệ Quốc gia.
     - *Tương phản thẩm mỹ Gov-Tech*: Tạo cấu trúc phân cấp thị giác (visual hierarchy) rõ rệt, kết nối giữa tính trang trọng của thể chế và tính tiện dụng của công nghệ số.

---

### 3. Quy Tắc Phân Bổ Typography Cho 10 Thành Phần UI Cốt Lõi

| STT | Thành Phần UI (UI Component) | Token & Font Family | Font Weight | Kích Thước (Desktop / Mobile) | Line Height | Quy Định Nghiệp Vụ & Ràng Buộc Hiển Thị |
|:---:|:---|:---|:---:|:---:|:---:|:---|
| **1** | **Quốc Hiệu, Tiêu Ngữ & Header Viện/Bộ** | `--font-heading` (`Lora`) | `Bold (700)` | 20px - 24px / 18px | 1.3 | Thể hiện trang trọng thể thức hành chính công vụ trên Header Cổng Quốc gia. |
| **2** | **Banner Quốc Gia, Slogan Hero & Display Title** | `--font-heading` (`Lora`) | `Bold (700)` | 36px - 44px / 28px - 32px | 1.2 | Khẳng định vị thế nền tảng ĐMST quốc gia, tạo điểm nhấn quyền uy ngay khi truy cập. |
| **3** | **Menu Điều Hướng Cấp 1 & Dropdown Menu** | `--font-sans` (`Nunito Sans`) | `SemiBold (600)` | 14px - 15px / 14px | 1.4 | Gọn gàng, tiết kiệm chiều ngang, chống tràn dòng trên màn hình độ phân giải 1024px–1280px. |
| **4** | **Buttons & CTA Controls** | `--font-sans` (`Nunito Sans`) | `SemiBold (600)` | 14px - 15px / 14px | 1.4 | Nhận diện rõ ràng hành động, căn giữa chuẩn xác, chiều cao nút $\ge 44\text{px}$. |
| **5** | **Form Inputs, Labels, Placeholders & Helpers** | `--font-sans` (`Nunito Sans`) | `Medium (500)` (Label) / `Regular (400)` (Input) | 14px / 14px | 1.4 | Nhập liệu chính xác số liệu MST, CCCD, điện thoại; không nhầm lẫn ký tự số và chữ. |
| **6** | **Data Grid, Table Headers & Data Density Rows** | `--font-sans` (`Nunito Sans`) | `SemiBold (600)` (Header) / `Regular (400)` (Cell) | 13px - 14px / 12px - 13px | 1.35 | Mật độ thông tin cao, hỗ trợ hiển thị hàng nghìn dòng danh bạ DN, công nghệ TRL và ngành VSIC. |
| **7** | **Cards & Sub-Headings** | `--font-sans` (`Nunito Sans`) | `SemiBold (600)` | 16px - 18px / 15px - 16px | 1.35 | Làm nổi bật tiêu đề giải pháp, tên doanh nghiệp, hồ sơ chuyên gia trên giao diện thẻ. |
| **8** | **Modals & Dialogs (Header & Content)** | `--font-sans` (`Nunito Sans`) | `SemiBold (600)` (Header) / `Regular (400)` (Body) | 18px - 20px (Header) / 14px - 15px (Body) | 1.35 - 1.5 | Rõ ràng, dễ tiếp thu thông điệp xác nhận quan trọng (Xác nhận nộp đơn, duyệt hồ sơ). |
| **9** | **Status Badges, Chips, Tags & Micro-Copy** | `--font-sans` (`Nunito Sans`) | `SemiBold (600)` / `Bold (700)` | 11px - 12px / 11px | 1.2 | Hiển thị trạng thái (`Dẫn đầu`, `Tiên tiến`, `Đã duyệt`); chữ in hoa có dấu không méo gãy. |
| **10** | **Footer & Thông Tin Pháp Lý Bản Quyền** | `--font-sans` (`Nunito Sans`) | `Regular (400)` / `Medium (500)` | 13px - 14px / 12px - 13px | 1.5 | Trình bày rõ ràng cơ quan chủ quản (Bộ KH&CN, Viện NacenTech), địa chỉ và bản quyền. |

---

### 4. Bảng Ánh Xạ Type Scale & Design Tokens Hệ Thống

| Type Scale Level | Tailwind CSS Class | CSS Variable Token | Font Family | Kích Thước (Desktop / Mobile) | Weight | Line Height | Trường Hợp Sử Dụng Điển Hình |
|:---|:---|:---|:---|:---:|:---:|:---:|:---|
| **Display 2XL** | `text-4xl lg:text-5xl font-heading` | `--font-heading` | Lora | 44px - 48px / 32px | 700 (Bold) | 1.15 | Khẩu hiệu Hero Banner Cổng Quốc Gia, Tiêu đề lớn Trang Chủ |
| **Display XL** | `text-3xl lg:text-4xl font-heading` | `--font-heading` | Lora | 36px / 28px | 700 (Bold) | 1.2 | Tiêu đề Trang chính (Page Title), Quốc hiệu - Tiêu ngữ |
| **Heading LG** | `text-2xl lg:text-3xl font-heading` | `--font-heading` | Lora | 28px - 30px / 24px | 600 (SemiBold) | 1.25 | Tiêu đề Phân hệ cấp 1 (Section Title), Tên giải pháp chi tiết |
| **Heading MD** | `text-xl lg:text-2xl font-sans` | `--font-sans` | Nunito Sans | 22px - 24px / 18px | 600 (SemiBold) | 1.3 | Tiêu đề nhóm tiêu chí (TT17, Nhu cầu), Tên Doanh nghiệp nổi bật |
| **Heading SM** | `text-lg lg:text-xl font-sans` | `--font-sans` | Nunito Sans | 18px - 20px / 16px | 600 (SemiBold) | 1.35 | Thẻ Card Title, Dialog/Modal Header, Bước Wizard cấp 1 |
| **Body Regular** | `text-base font-sans` | `--font-sans` | Nunito Sans | 15px - 16px / 14px | 400 (Regular) | 1.5 - 1.6 | Văn bản nội dung chính, bài viết tin tức, mô tả năng lực công nghệ |
| **Body Medium** | `text-base font-medium font-sans` | `--font-sans` | Nunito Sans | 15px - 16px / 14px | 500 (Medium) | 1.5 | Đoạn văn nhấn mạnh, tóm tắt pháp lý, lead paragraph |
| **UI Control** | `text-sm font-medium font-sans` | `--font-sans` | Nunito Sans | 14px / 14px | 500 (Medium) | 1.4 | Label trường nhập liệu, Button CTA, Menu Items, Dropdown |
| **Data Dense** | `text-xs lg:text-sm font-sans` | `--font-sans` | Nunito Sans | 13px - 14px / 12px | 400 (Regular) | 1.35 | Hàng dữ liệu Data Grid, Metadata phụ trợ, MST, Mã hồ sơ |
| **Micro Badge** | `text-xs font-semibold font-sans` | `--font-sans` | Nunito Sans | 11px - 12px / 11px | 600 (SemiBold) | 1.2 | Huy hiệu trạng thái hồ sơ, Tag danh mục, Counter số lượng |

---

### 5. Quy Chuẩn Tiếp Cận WCAG 2.1 AA & Accessibility (UI-REQ-TYPO-02)

#### 5.1. Hệ Thống Điều Chỉnh Cỡ Chữ 3 Nấc (Tri-state Text Scaling)
- Cụm điều khiển tiếp cận tại Header/Topbar kích hoạt thuộc tính toàn cục trên thẻ gốc `<html>`:
  - **Nấc A- (Thu nhỏ - 92.5%)**: `html[data-text-scale="sm"] { font-size: 92.5%; }` — Phục vụ chuyên gia phân tích và cán bộ quản trị viên cần tăng mật độ thông tin hiển thị trên màn hình lớn.
  - **Nấc A (Chuẩn mặc định - 100%)**: `html[data-text-scale="md"] { font-size: 100%; }` — Cỡ chữ cơ sở chuẩn mực ($1\text{rem} = 16\text{px}$).
  - **Nấc A+ (Phóng to - 110%)**: `html[data-text-scale="lg"] { font-size: 110%; }` — Hỗ trợ tối đa cán bộ cao tuổi, nhà khoa học lớn tuổi, người khiếm thị nhẹ hoặc người dùng cần kích thước chữ lớn theo chuẩn WCAG 2.1 AA.
- Trạng thái lựa chọn cỡ chữ MUST được lưu trữ trong `localStorage` với key `nacentech_text_scale` và đồng bộ qua sự kiện tùy biến để tránh giật giao diện (Flash of unstyled content).

#### 5.2. Nguyên Tắc Không Tràn Ngang (Zero Horizontal Overflow)
- 100% kích thước vùng chứa, lề trong (padding), lề ngoài (margin), khoảng cách ô (gap) và cỡ chữ MUST được định nghĩa bằng các đơn vị tương đối (`rem`, `em`, `%`, `dvh/dvw`).
- Tuyệt đối cấm gán cứng chiều rộng cố định bằng pixel (`width: 1200px`) trên các container chứa text hoặc component layout chính.
- **Ràng buộc kiểm thử ở nấc A+ (110%)**:
  1. Không được gây gãy vỡ bố cục, không gây chồng lấn chữ (text overlapping).
  2. Tuyệt đối không xuất hiện thanh cuộn ngang ngoài ý muốn trên toàn trang (`window.scrollX === 0` trên viewport từ 320px đến 4K), ngoại trừ các bảng dữ liệu Data Grid có vùng chứa cuộn ngang chủ động (`overflow-x: auto`).
  3. Thanh Header Navigation Menu tự động co giãn khoảng cách hoặc chuyển đổi sang Drawer Hamburger trên màn hình tablet/laptop hẹp mà không làm rớt chữ xuống dòng thứ hai.

#### 5.3. Quy Chuẩn Vùng Chạm Tối Thiểu (Touch Targets)
- Toàn bộ các phần tử tương tác gồm Nút bấm (Buttons), Điều khiển (Controls), Ô nhập liệu (Inputs), Checkbox, Radio, Tab triggers và Icon buttons MUST đảm bảo vùng chạm tối thiểu **$44 \times 44\text{px}$** theo tiêu chuẩn WCAG 2.1 Success Criterion 2.5.5 Target Size.

#### 5.4. Bảo Toàn Hiển Thị Ký Tự Tiếng Việt Dựng Sẵn (Vietnamese Typography Integrity)
- Cả hai font `Nunito Sans` và `Lora` MUST được nhúng kèm tập ký tự con `vietnamese`.
- Không bị lỗi rớt chân dấu, không lệch hàng (vertical misalignment) khi hiển thị các ký tự có dấu tầng kép (`ẩ`, `ẫ`, `ế`, `ệ`, `ổ`, `ỗ`, `ợ`, `ự`) và ký tự viết hoa có dấu (`Đ`, `Ư`, `Ơ`, `Ậ`, `Ổ`, `Ễ`).

---

### 6. Ma Trận Tác Động Đa Bề Mặt (Cross-Surface Impact Matrix)

| Bề Mặt / Thành Phần Tác Động | Tệp Tin / Tài Liệu Cụ Thể | Chi Tiết Tác Động & Trách Nhiệm Thực Thi |
|:---|:---|:---|
| **Cấu Hình Font Nền Tảng (Frontend Core)** | `src/app/layout.tsx`<br>`src/app/globals.css`<br>`tailwind.config.ts` | - Nhúng `Nunito_Sans` (`--font-sans`) và `Lora` (`--font-heading`, `--font-serif`) qua `next/font/google`.<br>- Khai báo biến CSS `--font-sans` và `--font-heading` trên thẻ `<html>` / `<body>`.<br>- Bổ sung CSS rules cho `html[data-text-scale="sm\|md\|lg"]`. |
| **Thành Phần Dùng Chung (Common UI Primitives)** | `src/components/ui/Button.tsx`<br>`src/components/ui/Input.tsx`<br>`src/components/ui/Modal.tsx`<br>`src/components/ui/Badge.tsx`<br>`src/components/common/Header.tsx`<br>`src/components/common/Footer.tsx`<br>`src/components/common/FontsizeScaler.tsx` | - Cập nhật `Header.tsx`: Áp dụng `Lora` cho Quốc hiệu / Tiêu ngữ và Tên Viện; `Nunito Sans` cho 7 Menu cấp 1.<br>- Cập nhật `FontsizeScaler.tsx`: Chuyển đổi logic scale 3 nấc qua thuộc tính `data-text-scale` trên thẻ `<html>`.<br>- Chuẩn hóa Buttons, Inputs, Modals, Badges tuân thủ Touch target $\ge 44\text{px}$ và font `Nunito Sans`. |
| **Cổng 1: Đại Chúng & Tra Cứu (`/`)** | `src/app/(public)/*`<br>`src/components/home/*` | - Hero Banner, Slogan Quốc gia chuyển sang font `Lora` (`font-heading font-bold`).<br>- Thẻ Card Chào bán công nghệ, Nhu cầu, Chuyên gia và Doanh nghiệp sử dụng `Nunito Sans`. |
| **Cổng 2: Không Gian Thị Trường (`/portal/*`)** | `src/app/portal/*`<br>`src/components/portal/*` | - Sidebar Menu, Bảng Data Grid, Hồ sơ Doanh nghiệp, Khảo sát Nhu cầu 7 bước, Form Đăng ký Chào bán chuẩn hóa sang `Nunito Sans`. |
| **Cổng 3: Quản Trị Nhà Nước (`/gov/*`)** | `src/app/gov/*`<br>`src/components/gov/*` | - Hàng đợi phê duyệt Maker-Checker, Scope Badges Tỉnh/Ngành, Thống kê SLA áp dụng `Nunito Sans` tối ưu mật độ hiển thị. |
| **Cổng 4: Quản Trị Hệ Thống (`/admin/*`)** | `src/app/admin/*`<br>`src/components/admin/*` | - Bảng người dùng 10 roles, Bảng Audit Trail cấp 3, Cấu hình danh mục áp dụng `Nunito Sans`. |
| **Tài Liệu Đặc Tả & Wireframes (SSOT)** | `Specification/BASIC_DESIGN_NACENTECH.md`<br>`wireframe_home.html`<br>`wireframe_tong_the_nacentwin.html` | - Đồng bộ mục 7.3 Basic Design lên v0.12 (Đã hoàn tất theo `PO-DEC-20261015-01`).<br>- Đồng bộ liên kết font Google trong các bản Wireframe HTML chuẩn. |
| **Kiểm Thử Tự Động (Automated Testing)** | `tests/unit/components/FontsizeScaler.test.tsx`<br>`tests/e2e/accessibility.spec.ts` | - Test case kiểm tra chuyển đổi `data-text-scale` thành công khi click `A-`, `A`, `A+`.<br>- Test case kiểm tra `window.scrollX === 0` khi phóng to 110% ở nấc A+ trên viewport chuẩn. |

---

### 7. Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)

- **AC-DELTA-TYPO-01**: Cả hai font Google `Nunito_Sans` và `Lora` được tích hợp thành công qua `next/font/google` trong `src/app/layout.tsx`, gán chính xác các CSS variables `--font-sans` và `--font-heading` lên thẻ gốc HTML.
- **AC-DELTA-TYPO-02**: 100% các thành phần thuộc 10 nhóm UI cốt lõi hiển thị đúng phân bổ font: `Lora` cho Quốc hiệu, Tiêu ngữ, Slogan Hero, Tiêu đề phân hệ lớn; `Nunito Sans` cho Menu, Buttons, Inputs, Data Grid, Cards, Modals, Badges và Footer.
- **AC-DELTA-TYPO-03**: Nhấp chọn cụm nút điều chỉnh cỡ chữ `A-`, `A`, `A+` thay đổi ngay lập tức thuộc tính `data-text-scale` trên thẻ `<html>` thành `"sm"`, `"md"`, `"lg"`, tương ứng với tỷ lệ font-size `92.5%`, `100%`, `110%`; trạng thái được lưu bền vững vào `localStorage`.
- **AC-DELTA-TYPO-04 (Zero Horizontal Overflow)**: Khi kích hoạt nấc phóng to `A+` (110%), hệ thống không xuất hiện thanh cuộn ngang ngoài ý muốn (`window.scrollX === 0`) trên các độ phân giải từ 320px đến 4K.
- **AC-DELTA-TYPO-05 (Touch Target $\ge 44\text{px}$)**: 100% nút bấm, controls, input fields và icon action đáp ứng diện tích tương tác tối thiểu $44 \times 44\text{px}$.
- **AC-DELTA-TYPO-06 (Vietnamese Integrity)**: Toàn bộ các chuỗi văn bản Tiếng Việt chứa ký tự đặc biệt có dấu kép (`ẩ`, `ẫ`, `ệ`, `ỗ`, `ợ`, `Đ`, `Ư`) hiển thị chính xác, sắc nét, không bị lỗi font fallback chân dấu.
- **AC-DELTA-TYPO-07 (Zero Build Regression)**: Lệnh `pnpm build` và kiểm thử tự động tại `SourceCode/frontend` đạt 0 lỗi biên dịch (Exit code 0).
