# Feature Specification: TASK-00 Platform Foundation & Common Architecture

**Feature Branch**: `foundation-platform-common`  
**Feature Directory**: `specs/TASK-00_PLATFORM_FOUNDATION_VA_COMMON`  
**Created**: 25/09/2026  
**Version**: 1.22.0 (Delta v20 - CR-2026-031 Portal & Gov Route Loading Skeleton + Enterprise Profile Cache)  
**Status**: Completed (Shipped Gate 5 - CR-2026-031)  
**Last Updated**: 11/11/2026  
**Ánh Xạ Kỹ Thuật**: Nền tảng hạ tầng, Modular Monolith Clean Architecture, Shared Kernel & Docker Compose  
**Phạm Vi**: Backend .NET Core (`backend/`), Frontend Next.js (`frontend/`), JWT Auth Session, Role Gateway Routing  

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

## Spec Delta v10 (CR-2026-TYPO): Chuẩn Hóa Typography Cổng DVCQG (Nunito Sans & Lora) [PO-DEC-20261015-01]

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

---

## Spec Delta v11 (CR-2026-014): Chuẩn Hóa Dynamic Profile Labeling, Dual Mode Switcher & Bổ Sung Đánh Giá TT17 Cho Seller Workspace

**Căn cứ thay đổi:** Quyết định PO trực tiếp tại phiên làm việc ngày 23/10/2026; Khắc phục lỗi hiển thị nhãn menu cứng "Hồ sơ Đơn vị / Viện Trường" cho tài khoản Doanh nghiệp Seller và hiện tượng tràn text cắt cụt dấu ba chấm `(...)` tại cụm Chuyển Đổi Chế Độ Kép (Dual Mode).

### 1. Bối Cảnh & Vấn Đề (Context & Problem Statement)
1. **Lệch danh xưng pháp nhân (Label Mismatch)**: Trong `PortalLayout` (`src/app/portal/layout.tsx`), mục menu quản trị hồ sơ của nhóm vai trò `SELLER` bị hardcode là `"Hồ sơ Đơn vị / Viện Trường"`. Khi một Doanh nghiệp (Enterprise Seller) đăng nhập vào gian hàng, họ nhìn thấy danh xưng này gây tâm lý hoang mang và hiểu lầm hệ thống nhận diện sai loại hình pháp nhân của doanh nghiệp.
2. **Tràn chữ tại Chế độ kép (Dual Mode Truncation)**: Tại component `RoleSwitcher` (`src/components/common/role-switcher.tsx`), nhãn nút đang dùng chuỗi dài `Bên Mua (Buyer)` và `Bên Bán (Seller)`. Khi đặt trong lưới `grid-cols-2` của thanh Sidebar có độ rộng giới hạn (w-72), nhãn bị bộ lọc CSS `truncate` cắt cụt thành `Bên Mua (...` và `Bên Bá... ✓`, gây mất mỹ quan và suy giảm trải nghiệm người dùng.
3. **Thiếu liên kết Đánh giá Năng lực TT17**: Doanh nghiệp cung ứng công nghệ (Seller) cần có lối tắt truy cập vào tính năng Tự Đánh giá Trình độ & Năng lực Công nghệ theo Thông tư 17/2019/TT-BKHCN (`/assessments/tt17`) để định vị mức độ sẵn sàng công nghệ (TRL) và gia tăng điểm uy tín trên sàn giao dịch.

### 2. Yêu Cầu Chức Năng Bổ Sung (Requirements Delta)

- **REQ-NAV-004 (Dynamic Adaptive Profile Labeling - Không Hardcode)**:
  - Hệ thống MUST tự động phân giải nhãn hiển thị cho tuyến đường `/portal/enterprise/profile` tương thích động theo loại hình chủ thể thực tế thông qua hàm `resolveProfileLabel`:
    1. Nếu chủ thể có `subjectType` chứa *"viện"*, *"trường"*, *"đại học"*, *"học viện"* hoặc tên đơn vị `orgName` thuộc khối viện trường $\rightarrow$ hiển thị **`Hồ sơ Viện / Trường`**.
    2. Nếu chủ thể có `subjectType` chứa *"htx"*, *"hợp tác xã"* $\rightarrow$ hiển thị **`Hồ sơ Hợp tác xã`**.
    3. Nếu chủ thể có `subjectType` chứa *"đmst"*, *"đổi mới sáng tạo"* hoặc vai trò `INNOVATION_ENTITY` $\rightarrow$ hiển thị **`Hồ sơ Doanh nghiệp ĐMST`**.
    4. Nếu vai trò là `CLUSTER_ADMIN` $\rightarrow$ hiển thị **`Hồ sơ Viện / Trường`**.
    5. Mặc định cho Doanh nghiệp thương mại / Doanh nghiệp công nghệ (`BUYER`, `SELLER`) $\rightarrow$ hiển thị **`Hồ sơ Doanh nghiệp`**.
  - Tuyệt đối cấm gán cứng tĩnh một chuỗi duy nhất trên cấu hình menu.

- **REQ-NAV-005 (Seller Workspace TT17 Integration)**:
  - Danh mục điều hướng của Nhà Cung Ứng (`SELLER`) trong `sellerNavItems` MUST bổ sung mục **`Đánh giá Năng lực TT17`** dẫn về tuyến `/assessments/tt17` với icon `FileCheck`.

- **REQ-NAV-006 (Crisp & Responsive Dual Mode Switcher)**:
  - Component `RoleSwitcher` MUST rút gọn nhãn hiển thị thành **`Bên Mua`** và **`Bên Bán`**.
  - Đảm bảo hiển thị trọn vẹn 100% nội dung chữ kèm icon trên mọi kích thước màn hình Sidebar mà không bị cắt cụt ba chấm.

### 3. Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)

- **AC-DELTA-17 (Dynamic Profile Label)**: Đăng nhập với tài khoản Doanh nghiệp (kể cả khi ở chế độ `SELLER` hay `BUYER`), nhãn menu hiển thị chính xác là `Hồ sơ Doanh nghiệp`. Khi đăng nhập bằng tài khoản Viện/Trường, nhãn tự động đổi thành `Hồ sơ Viện / Trường`.
- **AC-DELTA-18 (Seller TT17 Presence)**: Trong thanh Sidebar Workspace Nhà Cung Ứng (`SELLER`), mục `Đánh giá Năng lực TT17` xuất hiện rõ ràng và nhấp chọn dẫn đúng về `/assessments/tt17`.
- **AC-DELTA-19 (Dual Mode Zero-Truncation)**: Cụm chuyển đổi Chế Độ Kép hiển thị sắc nét hai nút `Bên Mua` và `Bên Bán`, không còn xuất hiện dấu ba chấm `(...)` hay tràn giao diện.
- **AC-DELTA-20 (Zero Regression)**: 100% các bài test điều hướng trong `src/app/portal/layout.test.tsx` và test suite chuyên biệt `src/app/portal/portal-navigation-delta.test.tsx` đạt trạng thái PASS.

---

## Spec Delta v12 (CR-2026-015): Tối Ưu Hóa Toàn Diện 7 Mục Chức Năng Workspace Nhà Cung Ứng (Seller)

**Căn cứ phê duyệt:** Quyết định PO trực tiếp sau phiên kiểm toán đối kháng Party Mode ngày 23/10/2026; Triển khai bằng phương pháp `speckit-delta` theo 3 làn sóng (Wave 1: P0 Lõi trải nghiệm & Bảo mật; Wave 2: P1 Dọn rác kỹ thuật & Bộ lọc TRL; Wave 3: P2 Trải nghiệm tương tác & Modal hóa).

### 1. Bối Cảnh & Vấn Đề (Problem Statement)
Sau khi đối soát toàn bộ 7 mục menu trong Workspace Nhà Cung Ứng (`SELLER`), Hội nghị Party Mode đã phát hiện các bất cập cần xử lý:
1. **Item 1 (`Tổng quan Gian hàng` - `/portal`)**: Đang hiển thị trung tâm điều hướng 4 thẻ của Buyer (Nhu cầu công nghệ, Cung cầu, v.v.) gây vòng lặp điều hướng vô nghĩa thay vì hiển thị Dashboard thực sự của Seller.
2. **Item 2 (`Kho Công nghệ (TRL)` - `/portal/seller/technologies`)**: Bị lồng 2 thẻ `<header>` dập khuôn, lộ badge rác kỹ thuật (`TASK-04`, `SELLER WORKSPACE`), thiếu bộ lọc nhanh dải TRL (1-3, 4-6, 7-9).
3. **Item 3 (`Yêu cầu Kết nối Nhận được` - `/portal/opportunities/pipeline?tab=inbound`)**: Rò rỉ nút điều hướng sang `/gov/opportunities` ("Giám Sát Sở KH&CN") trên thanh công cụ của doanh nghiệp B2B.
4. **Item 4 (`Radar Tìm Kiếm Nhu Cầu (AI)` - `/portal/matching/radar`)**: Rò rỉ nút điều hướng sang `/gov/opportunities`.
5. **Item 5 (`Tiến trình Chuyển giao & MOU` - `/portal/opportunities/pipeline`)**: Khẳng định quy trình 5 bước Kanban chuyển giao công nghệ minh bạch.
6. **Item 6 (`Đánh giá Năng lực TT17` - `/assessments/tt17`)**: Lỗi hiển thị thô ký tự TeX `$T_{"ĐB"}$` trong văn bản hướng dẫn thay vì hiển thị chuỗi format chuẩn.
7. **Item 7 (`Hồ sơ Doanh nghiệp` - `/portal/enterprise/profile`)**: Gán cứng tỷ lệ nhân sự 40% trong state khởi tạo, và sử dụng lệnh trình duyệt thô `window.confirm()` khi nộp hồ sơ thẩm định.

### 2. Yêu Cầu Kỹ Thuật Chi Tiết (Technical Requirements)

- **REQ-SELLER-001 (Dedicated Seller Dashboard)**:
  - Khi người dùng ở chế độ `SELLER`, trang `/portal` MUST render component `<SellerDashboard />` chuyên biệt chứa 4 KPI doanh nghiệp (Giải pháp chào bán, Tiếp cận mới, Deal đang đàm phán, Doanh số kỳ vọng), Quick Actions và danh sách Inbound Leads mới nhất.
- **REQ-SELLER-002 (Clean Tech Warehouse & TRL Filter)**:
  - Xóa bỏ toàn bộ `<header>` dập khuôn và badge phát triển `TASK-04`, `SELLER WORKSPACE`.
  - Tích hợp bộ lọc dropdown `trlFilter` phân nhóm 3 dải: TRL 1–3 (Nghiên cứu Lab), TRL 4–6 (Thử nghiệm Pilot), TRL 7–9 (Thương mại hóa).
- **REQ-SELLER-003 & REQ-SELLER-004 (Zero Gov Route Leakage)**:
  - Loại bỏ triệt để các liên kết `/gov/*` khỏi header của các trang `/portal/opportunities/pipeline` và `/portal/matching/radar`.
- **REQ-SELLER-005 (Kanban Stage Integrity)**:
  - Duy trì 5 giai đoạn Kanban chuyển giao công nghệ: Gợi Ý AI $\rightarrow$ Đã Tiếp Cận $\rightarrow$ Đang Đàm Phán $\rightarrow$ Đã Ký MOU $\rightarrow$ Hoàn Thành.
- **REQ-SELLER-006 (TT17 Math String Polish)**:
  - Chuẩn hóa chuỗi hiển thị hệ số đồng bộ thành `T_ĐB` không chứa ký tự escape `$`.
- **REQ-SELLER-007 (Enterprise Profile Clean State & ConfirmModal)**:
  - Khởi tạo `highQualificationRatio` là chuỗi rỗng `""`.
  - Thay thế `window.confirm()` bằng `<ConfirmModal />` tuân thủ Design System chuẩn NacenTech.

### 3. Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)

- **AC-DELTA-21 (Seller Dashboard)**: Đăng nhập vai trò SELLER vào `/portal`, hệ thống hiển thị chuyên biệt `<SellerDashboard />` với 4 KPI và danh sách Inbound Leads thực tế.
- **AC-DELTA-22 (TRL Filter Dropdown)**: Tại `/portal/seller/technologies`, bộ lọc dải TRL hoạt động chính xác khi chọn từng phân khúc (1-3, 4-6, 7-9).
- **AC-DELTA-23 (Zero Dev Badges)**: Tuyệt đối không còn xuất hiện các chuỗi `TASK-04` hay `SELLER WORKSPACE` trên giao diện người dùng.

---

## Spec Delta v13 (CR-2026-016): Chuẩn Hóa Cấu Trúc Thông Tin & Navigation Workspace Bên Mua (Buyer Journey Alignment)

**Căn cứ phê duyệt:** Quyết định phê duyệt của PO sau phiên họp Bàn Tròn Đa Tác Tử (Party Mode) ngày 23/10/2026; Khắc phục tính phẳng lì của menu Bên Mua, chuẩn hóa thuật ngữ BKHCN/ĐMST và thiết lập luồng trải nghiệm người mua (Buyer Value Stream).

### 1. Bối Cảnh & Vấn Đề (Context & Problem Statement)
1. **Menu phẳng lì thiếu phân nhóm logic**: Trong `PortalLayout` (`src/app/portal/layout.tsx`), mảng `buyerNavItems` hiển thị một danh sách 7 mục phẳng lì, không có phân định section như luồng Chuyên gia (`expertNavItems`), gây khó khăn cho Doanh nghiệp Bên Mua trong việc định vị chức năng.
2. **Lệch chuẩn thuật ngữ BKHCN**: Nhãn `Bài toán Tìm mua` mang âm hưởng thương mại bán lẻ tiêu dùng, không phản ánh đúng bản chất ĐMST và đặt hàng R&D theo chuẩn Bộ KH&CN. Cần chuẩn hóa thành **`Bài toán Đổi mới Công nghệ`**.
3. **Thiếu tín hiệu động (Count Badges)**: Các mục quan trọng như `Bài toán Đổi mới Công nghệ`, `Tiến trình Hợp tác & MOU`, `Radar Ghép Nối AI` không có badge số lượng hoặc huy hiệu `"Mới"`, khiến Bên Mua thiếu động lực tương tác và bỏ lỡ các cơ hội ghép nối.

### 2. Yêu Cầu Kỹ Thuật Chi Tiết (Technical Requirements)

- **REQ-BUYER-NAV-001 (3-Tier Buyer Navigation Grouping)**:
  - Cấu trúc `buyerNavItems` trong `src/app/portal/layout.tsx` MUST được phân thành 3 khối Section rõ rệt:
    1. **Khối 1: `Tác nghiệp Mua sắm`**:
       - `Tổng quan Mua sắm` (`/portal`, icon `LayoutDashboard`).
       - `Bài toán Đổi mới Công nghệ` (`/portal/buyer/demands`, icon `ShoppingBag`, badge số lượng đếm `3`, badgeType `count`).
       - `Tiến trình Hợp tác & MOU` (`/portal/opportunities/pipeline`, icon `Kanban`, badge số lượng đếm `1`, badgeType `count`).
    2. **Khối 2: `Khám phá & Ghép nối`**:
       - `Radar Ghép Nối AI` (`/portal/matching/radar`, icon `Sparkles`, badge `"Mới"`, badgeType `new`).
    3. **Khối 3: `Chẩn đoán & Hồ sơ`**:
       - `Khảo sát Nhu cầu (TNI)` (`/khao-sat-nhu-cau`, icon `ClipboardList`).
       - `Đánh giá Năng lực TT17` (`/assessments/tt17`, icon `FileCheck`).
       - `Hồ sơ Doanh nghiệp` (`/portal/enterprise/profile`, icon `Building2`, nhãn thích ứng động theo `dynamicProfileLabel`).

- **REQ-BUYER-NAV-002 (Portal Home Consistency)**:
  - Đồng bộ tiêu đề thẻ module tại `src/app/portal/page.tsx` từ `Bài toán Tìm mua` thành `Bài toán Đổi mới Công nghệ`.

- **REQ-BUYER-NAV-003 (Basic Design Wireframe Alignment)**:
  - Cập nhật Wireframe HTML `Specification/02_BASIC_DESIGN/TASK-00_PLATFORM_FOUNDATION_VA_COMMON/wireframe_workspace_seller_dual_mode.html` phản ánh 1:1 cấu trúc 3 Section, badges và nhãn chuẩn hóa.

### 3. Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)

- **AC-DELTA-24 (Buyer 3-Section Navigation)**: Đăng nhập vai trò `BUYER` vào `/portal`, thanh Sidebar hiển thị đủ 3 tiêu đề Section: `Tác nghiệp Mua sắm`, `Khám phá & Ghép nối`, `Chẩn đoán & Hồ sơ`.
- **AC-DELTA-25 (Buyer Label & Badges)**: Mục `Bài toán Đổi mới Công nghệ` xuất hiện thay thế cho `Bài toán Tìm mua`; xuất hiện badge đếm tại mục Bài toán và Tiến trình MOU; xuất hiện badge `"Mới"` tại Radar Ghép Nối AI.
- **AC-DELTA-26 (Zero Navigation Regression)**: Toàn bộ test suite trong `layout.test.tsx` và `portal-navigation-delta.test.tsx` đạt 100% PASS mà không có bất kỳ xung đột nào.

- **AC-DELTA-24 (Zero Gov Leakage)**: Không tồn tại liên kết `/gov/opportunities` trong Workspace Doanh nghiệp tại Pipeline và Radar.
- **AC-DELTA-25 (TT17 Clean Text)**: Toàn bộ text trên trang `/assessments/tt17` hiển thị `T_ĐB` sắc nét, không có lỗi TeX syntax.
- **AC-DELTA-26 (Profile ConfirmModal)**: Khi nhấp "Nộp hồ sơ thẩm định", hệ thống mở Modal hiện đại `ConfirmModal` với đầy đủ nút xác nhận/hủy bỏ.
- **AC-DELTA-27 (100% Test Green)**: 100% các bài test trong `seller-workspace-delta-qc.test.tsx`, `seller-dashboard.test.tsx`, `portal-navigation-delta.test.tsx`, và `layout.test.tsx` đạt trạng thái PASS.

---

## Spec Delta v14 (CR-2026-019): Bàn Làm Việc Tổng Quan Mua Sắm (Executive Buyer Dashboard)

### 1. Bối Cảnh & Mục Tiêu (Context & Objectives)
- Cung cấp giao diện tổng quan chiến lược (Executive Dashboard) cho vai trò Bên Mua (`BUYER` và `INNOVATION_ENTITY`) khi truy cập `/portal`.
- Tích hợp 4 KPI Cards tương tác sống:
  1. Bài toán đang mở -> điều hướng `/portal/buyer/demands`
  2. Ứng viên AI -> điều hướng `/portal/matching/radar`
  3. Deals đang trao đổi -> điều hướng `/portal/opportunities/pipeline`
  4. Thỏa thuận đã ký MOU -> điều hướng `/portal/opportunities/pipeline`
- Banner chào mừng với 3 nút tác vụ nhanh (Quick Actions): `+ Khai Báo Bài Toán Nhanh`, `Khảo Sát Nhu Cầu (TNI 4 Bước)`, `Radar Ghép Nối AI`.
- 2 Widgets chuyên sâu: Tiến Trình Hợp Tác Deal Room và Danh sách Bài toán mới nhất.

### 2. Yêu Cầu Chức Năng (Functional Requirements)
- **REQ-BUYER-DASH-001**: Render component `<BuyerDashboard />` tại `/portal` khi `currentRole === "BUYER" || currentRole === "INNOVATION_ENTITY"`.
- **REQ-BUYER-DASH-002**: Lắng nghe sự kiện `storage` cập nhật `activeRole` khi chuyển đổi Dual Mode.
- **REQ-BUYER-DASH-003**: 4 KPI cards hiển thị dữ liệu thật và hoạt động như các router links.

### 3. Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)
- **AC-DELTA-28**: Truy cập `/portal` với vai trò `BUYER` hiển thị đầy đủ 4 KPI cards, Quick Action banner và 2 widgets.
- **AC-DELTA-29**: Nhấp vào từng KPI card chuyển trang chính xác đến route đích tương ứng.
- **AC-DELTA-30**: Unit & Component tests trong `buyer-dashboard.test.tsx` và `page.test.tsx` đạt 100% PASS.

---

## Spec Delta v15 (CR-2026-10-30): Chuẩn Hóa Thuật Ngữ B2B, Onboarding Tinh Gọn & Tái Cấu Trúc Không Gian Cá Nhân Cho Thành Viên Đại Chúng (PUBLIC_USER)

> **Căn cứ phê duyệt:** Quyết định phê duyệt của Product Owner (`nacen-po-pm`) và Senior BA (`nacen-ba`) theo Quyết định `PO-DEC-20261030-01` (CR-2026-006 / Delta v10); Kế hoạch Đợt 1 chuẩn hóa thuật ngữ B2B toàn hệ thống và định vị Thành viên Đại chúng (`PUBLIC_USER`) là "Bên Mua tiềm năng (Buyer-leaning explorer)".

### 1. Bối Cảnh & Lý Do Thay Đổi (Background & Problem Statement)

1. **Chuẩn hóa thuật ngữ B2B**: Thuật ngữ "Bàn làm việc" mang tính hành chính/công vụ cũ, chưa phản ánh đúng bản chất sản phẩm sàn thương mại công nghệ B2B hiện đại. Cần chuẩn hóa toàn diện thành **"Trang tổng quan / Không gian cá nhân"** trên thanh điều hướng, tiêu đề trang và breadcrumb.
2. **Rào cản Onboarding không cần thiết**: Form đăng ký tài khoản công khai (`/register`) thu thập trường Cơ quan / Đơn vị (`organization`). Đối với người dùng cá nhân, kỹ sư, nhà khoa học độc lập hoặc người tìm hiểu thị trường, việc yêu cầu đơn vị tạo rào cản tâm lý e ngại, làm giảm sút tỷ lệ chuyển đổi đăng ký.
3. **Lệch pha không gian tác nghiệp**: Sau khi đăng ký thành công, tài khoản `PUBLIC_USER` (Tầng 3 Công chúng) truy cập `/portal` thì giao diện cũ lại hiển thị các module của pháp nhân (Gian hàng chào bán công nghệ, Tự đánh giá TT17, Hồ sơ Doanh nghiệp ĐMST). Người dùng cá nhân chưa xác minh MST/ĐKKD không có tư cách pháp lý để thực hiện các chức năng này.
4. **Định vị nghiệp vụ chuẩn hóa**: Thành viên đại chúng (`PUBLIC_USER` / `USER`) được định vị là **"Bên Mua tiềm năng (Buyer-leaning explorer)"** – nhóm người dùng khám phá thị trường công nghệ, khảo sát nhu cầu công nghệ và nhận diện cơ hội trước khi nâng hạng.

### 2. Yêu Cầu Kỹ Thuật Chi Tiết (Technical Requirements)

- **REQ-DEL-00-01 (Chuẩn Hóa Thuật Ngữ B2B: Trang Tổng Quan / Không Gian Cá Nhân)**:
  - Toàn bộ giao diện Portal, Sidebar Navigation, Breadcrumb, Header Title và thông báo hệ thống MUST thay thế dứt điểm cụm từ `"Bàn làm việc"` thành `"Trang tổng quan / Không gian cá nhân"`.
  - Giữ nguyên cấu trúc định tuyến URL hạt nhân `/portal`, chỉ chuẩn hóa nhãn hiển thị người dùng (UI Labels).

- **REQ-DEL-00-02 (Onboarding Tinh Gọn Cho PUBLIC_USER)**:
  - Form đăng ký tại `src/app/(auth)/register/page.tsx` MUST loại bỏ hoàn toàn trường Cơ quan / Đơn vị / Viện trường (`organization`).
  - Giao diện đăng ký chỉ thu thập các trường danh tính cá nhân cốt lõi:
    1. Họ và tên đệm (`lastName`, bắt buộc)
    2. Tên (`firstName`, bắt buộc)
    3. Địa chỉ Email (`email`, bắt buộc, đúng chuẩn RFC)
    4. Số điện thoại liên hệ (`phoneNumber`, bắt buộc/tuỳ chọn theo chuẩn di động VN)
    5. Mật khẩu (`password`, tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số, ký tự đặc biệt) & Xác nhận mật khẩu (`confirmPassword`)
    6. Checkbox cam kết tuân thủ chính sách bảo vệ dữ liệu cá nhân (`agreePdpd`, bắt buộc, tuân thủ Nghị định số 13/2023/NĐ-CP).
  - Tự động gán role `PUBLIC_USER`, trạng thái `isActive = true`, phạm vi `scopeType = GLOBAL`, `scopeId = null` ngay khi đăng ký thành công.
  - Sau khi đăng ký hoàn tất, hiển thị thông báo thành công và chuyển hướng trực tiếp vào Trang tổng quan / Không gian cá nhân `/portal`.

- **REQ-DEL-00-03 (Ranh Giới Vai Trò & Cô Lập Tính Năng Cho PUBLIC_USER/USER)**:
  - **Không sở hữu gian hàng chào bán (Seller Shop)**: Người dùng thuộc vai trò `PUBLIC_USER` / `USER` tuyệt đối không có quyền tạo hoặc quản trị gian hàng chào bán công nghệ. Khi người dùng muốn bán giải pháp/thiết bị, hệ thống yêu cầu nâng hạng lên Bên Bán (`SELLER`) qua Upgrade Hub (`/profile/upgrade`).
  - **Chỉ khám phá Sàn công khai & gửi nhu cầu**: Tài khoản đại chúng chỉ được phép duyệt, tìm kiếm sản phẩm trên Sàn Chào bán công khai (`/chao-ban-cong-nghe`), lưu giải pháp vào danh sách quan tâm (`/portal/saved`), và gửi nhu cầu công nghệ cá nhân qua biểu mẫu nhanh (`QuickDemandModal`).
  - **Ẩn module chuyên sâu**: Ẩn hoàn toàn các module tác nghiệp của pháp nhân: Gian hàng Bên Bán (`/portal/seller/*`), Tự đánh giá năng lực TT17 (`/assessments/tt17`), và Hồ sơ Doanh nghiệp ĐMST (`/portal/enterprise/*`).

- **REQ-DEL-00-04 (Sidebar Navigation 5 Menu Chuẩn Cho PUBLIC_USER)**:
  - Trong `src/app/portal/layout.tsx`, danh mục `publicNavItems` dành cho người dùng vai trò `PUBLIC_USER` MUST được chuẩn hóa thành đúng 5 mục may đo:
    1. **Trang tổng quan / Không gian cá nhân** (`/portal`, icon `LayoutDashboard`): Trung tâm tác nghiệp cá nhân và khám phá.
    2. **Nhu cầu & Sản phẩm quan tâm** (`/portal/saved`, icon `ShoppingBag` hoặc `Bookmark`): Quản lý giải pháp công nghệ, nhu cầu công nghệ đã đánh dấu theo dõi.
    3. **Radar Ghép Nối AI** (`/portal/matching/radar`, icon `Sparkles`, badge `"Mới"`, badgeType `"new"`): Công cụ gợi ý ghép nối cung–cầu thông minh (yêu cầu điều kiện kích hoạt $\ge 1$ nhu cầu công nghệ).
    4. **Đăng ký Nâng hạng Vai trò** (`/profile/upgrade`, icon `Rocket`): Cửa ngõ nâng hạng đa tuyến 4 lộ trình (Chuyên gia KH&CN, Doanh nghiệp ĐMST, Bên Mua, Bên Bán).
    5. **Cài đặt Tài khoản** (`/settings`, icon `Settings` hoặc `FileCheck`): Quản trị thông tin cá nhân, mật khẩu và phiên đăng nhập.
  - Tuyệt đối KHÔNG hiển thị các mục của Bên Bán, Đánh giá TT17, hoặc Hồ sơ Doanh nghiệp ĐMST trên sidebar của `PUBLIC_USER`.

- **REQ-DEL-00-05 (Trang Tổng Quan /portal 3 Khối Tác Nghiệp Cho PUBLIC_USER)**:
  - Khi người dùng đăng nhập có vai trò `PUBLIC_USER` (hoặc tài khoản đại chúng chưa nâng hạng), trang `/portal` (`src/app/portal/page.tsx`) MUST hiển thị giao diện chuyên biệt gồm 3 khối chức năng:
    1. **Khối 1: Banner Hành Động Nhanh (Quick Action Hero Banner)**:
       - Lời chào cá nhân hóa theo tên người dùng: *"Xin chào, [Họ và Tên]!"*.
       - Định vị vai trò: *"Thành viên Khám phá / Bên Mua tiềm năng"*.
       - Lối tắt hành động nhanh dẫn tới Sàn Chào Bán (`/san-pham`) hoặc Hub Nâng Hạng (`/profile/upgrade`).
    2. **Khối 2: Lưới 3 Thẻ Mua Sắm & Khám Phá AI (3-Card Explorer Grid)**:
       - *Thẻ 1: Khám phá Sàn Công nghệ* (`/san-pham` hoặc `/chao-ban-cong-nghe`): Tra cứu công nghệ TRL 1–9, thiết bị, giải pháp sáng chế đã được kiểm định.
       - *Thẻ 2: Nhu cầu công nghệ* (`/nhu-cau-cong-nghe` hoặc `/portal/buyer/demands`): Khảo sát nhu cầu doanh nghiệp, cơ hội R&D mở từ thị trường.
       - *Thẻ 3: Radar Ghép Nối AI* (`/portal/matching/radar`): Khám phá gợi ý ghép nối tự động cung–cầu công nghệ bằng thuật toán thông minh (kèm điều kiện kích hoạt $\ge 1$ nhu cầu).
    3. **Khối 3: Banner Kêu Gọi Nâng Hạng Vai Trò (Upgrade CTA Banner)**:
       - Hộp thông báo nổi bật giới thiệu quyền lợi và động lực nâng cấp tài khoản:
         * *Bên Mua (Buyer)*: Đăng nhu cầu chính thức, tính điểm TNI, mở Deal Room đàm phán.
         * *Nhà Cung Ứng (Seller)*: Mở gian hàng công nghệ, chào bán giải pháp trên Sàn Quốc gia.
         * *Chuyên gia KH&CN*: Tham gia tư vấn, phản biện đề tài, nhận thù lao chuyên gia.
         * *Doanh nghiệp ĐMST*: Sở hữu Hồ sơ năng lực 10 tab, nhận hỗ trợ từ Sở KH&CN.
       - Nút hành động CTA nổi bật trỏ trực tiếp đến Cổng Nâng Cấp Vai Trò (`/profile/upgrade`).
  - Tuyệt đối loại bỏ component 4 thẻ pháp nhân cũ (`generalModules` gồm Gian hàng, TT17, Hồ sơ DN) đối với vai trò `PUBLIC_USER`.

### 3. Quy Tắc Nghiệp Vụ (Business Rules)

- **BR-DEL-00-01 (Bảo Toàn Tuyệt Đối 100% Không Gian Tác Nghiệp Các Role Khác - Zero Cross-Role Impact)**:
  - Mọi thay đổi trong `DELTA-CR-2026-10-30` chỉ áp dụng riêng cho vai trò `PUBLIC_USER`.
  - Giữ nguyên vẹn 100% không gian tác nghiệp, cấu trúc thanh điều hướng và giao diện dashboard của:
    1. `BUYER` (Đã liên kết MST/Pháp nhân): Giữ nguyên 3 Section (`Tác nghiệp Mua sắm`, `Khám phá & Ghép nối`, `Chẩn đoán & Hồ sơ`) theo Spec Delta v13.
    2. `SELLER`: Giữ nguyên 7 mục chức năng chuyên biệt và `<SellerDashboard />` theo Spec Delta v12.
    3. `VERIFIED_EXPERT` / `EXPERT`: Giữ nguyên 6 mục chức năng và `<ExpertDashboard />` theo Spec Delta v8 & v10.
    4. `GOV` (`PROVINCE_OFFICER`, `PROVINCE_LEADER`): Giữ nguyên Cổng Công vụ 7 màn hình theo PO-DEC-20261026-GOV.
    5. `ADMIN` (`SUPER_ADMIN`, `OPERATOR_ADMIN`, `SECTOR_ADMIN`): Giữ nguyên cổng quản trị hệ thống.

### 4. Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)

- **AC-DEL-00-01 (B2B Terminology Standardization)**:
  - Toàn bộ các vị trí hiển thị text trên Sidebar, Header, Breadcrumbs và trang chủ `/portal` hiển thị nhãn `"Trang tổng quan / Không gian cá nhân"` (hoặc `"Trang tổng quan"` tùy độ rộng màn hình), không còn sót từ `"Bàn làm việc"`.
- **AC-DEL-00-02 (Lean Registration Form)**:
  - Khi người dùng truy cập trang `/register`, biểu mẫu chỉ hiển thị các trường: Họ và tên đệm, Tên, Email, Số điện thoại, Mật khẩu, Xác nhận mật khẩu, và Checkbox PDPD.
  - Tuyệt đối không còn hiển thị trường nhập liệu hoặc nhãn liên quan đến Cơ quan / Đơn vị / Viện trường (`organization`).
  - Đăng ký thành công tạo tài khoản `PUBLIC_USER`, tự kích hoạt và chuyển hướng về `/portal`.
- **AC-DEL-00-03 (PUBLIC_USER Scope & Feature Isolation)**:
  - Tài khoản `PUBLIC_USER` không thấy nút tạo gian hàng và không truy cập được các route quản trị gian hàng Bên Bán (`/portal/seller/*`).
  - Chuyển hướng hoặc chặn cảnh báo an toàn nếu người dùng đại chúng nhập URL trực tiếp vào các module pháp nhân chưa được cấp quyền.
- **AC-DEL-00-04 (PUBLIC_USER 5-Item Navigation)**:
  - Khi đăng nhập với tài khoản vai trò `PUBLIC_USER`, thanh Sidebar của Portal hiển thị chính xác 5 mục: `Trang tổng quan / Không gian cá nhân`, `Nhu cầu & Sản phẩm quan tâm`, `Radar Ghép Nối AI`, `Đăng ký Nâng hạng Vai trò`, `Cài đặt Tài khoản`.
  - Tuyệt đối không xuất hiện các mục chức năng của vai trò khác như Gian hàng chào bán, Tự đánh giá TT17, hoặc Hồ sơ Doanh nghiệp ĐMST.
- **AC-DEL-00-05 (PUBLIC_USER Lean Dashboard with 3 Cards & Upgrade Banner)**:
  - Khi đăng nhập vai trò `PUBLIC_USER` vào `/portal`, màn hình hiển thị:
    1. Hero Banner chào mừng cá nhân hóa.
    2. Lưới 3 thẻ mua sắm & khám phá AI: `Khám phá Sàn Công nghệ`, `Nhu cầu công nghệ`, `Radar Ghép Nối AI`.
    3. Banner Nâng hạng Vai trò với nút chuyển hướng trỏ đến `/profile/upgrade`.
    4. Tuyệt đối không hiển thị 4 thẻ chức năng pháp nhân cũ (`generalModules`).

### 5. Ma Trận Truy Vết Khép Kín (Traceability Matrix)

| Yêu Cầu Chức Năng (REQ) | Quy Tắc Nghiệp Vụ (BR) | Tiêu Chí Chấp Thuận (AC) | Tệp Nguồn Triển Khai (Source Code) | Kiểm Thử Kiểm Chứng (Automated Tests) |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-DEL-00-01** | `BR-DEL-00-01` | `AC-DEL-00-01` | `src/app/portal/layout.tsx`, `src/components/layout/*` | `portal-navigation-delta.test.tsx` |
| **REQ-DEL-00-02** | `BR-DEL-00-01` | `AC-DEL-00-02` | `src/app/(auth)/register/page.tsx` | `src/app/(auth)/register/page.test.tsx` |
| **REQ-DEL-00-03** | `BR-DEL-00-01` | `AC-DEL-00-03` | `src/app/portal/layout.tsx`, `src/app/portal/page.tsx` | `portal-dashboard.test.tsx` |
| **REQ-DEL-00-04** | `BR-DEL-00-01` | `AC-DEL-00-04` | `src/app/portal/layout.tsx` | `src/app/portal/layout.test.tsx`, `portal-navigation-delta.test.tsx` |
| **REQ-DEL-00-05** | `BR-DEL-00-01` | `AC-DEL-00-05` | `src/app/portal/page.tsx` | `src/app/portal/page.test.tsx`, `portal-dashboard.test.tsx` |




---

## Spec Delta v16 (CR-2026-020): Tự Động Thiết Lập Phiên Đăng Nhập Sau Khi Đăng Ký Thành Công (Auto-Login On Register)

> **Căn cứ phê duyệt:** Quyết định phê duyệt của Product Owner (`nacen-po-pm`) và Senior BA (`nacen-ba`) theo Quyết định `PO-DEC-20261102-01` (CR-2026-020) tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 18; Chuẩn hóa Onboarding Gov-Tech không gián đoạn (Zero Friction).

### 1. Bối Cảnh & Lý Do Thay Đổi (Background & Problem Statement)

1. **Loại bỏ quy trình gián đoạn (Broken Flow)**: Ở phiên bản trước, sau khi đăng ký tài khoản thành công tại `/register`, hệ thống bắt người dùng phải chuyển sang `/login` rồi nhập lại thủ công Email và Mật khẩu vừa tạo. Điều này gây ma sát lớn (UX Friction) và giảm tỷ lệ Onboarding thành công.
2. **Kỳ vọng trải nghiệm chuẩn hóa**: Ngay khi tài khoản được tạo thành công trên hệ thống, phiên làm việc (JWT Session) phải được tự động thiết lập và chuyển hướng người dùng thẳng về trang chủ hoặc không gian làm việc mà không cần nhập lại mật khẩu.

### 2. Yêu Cầu Kỹ Thuật Chi Tiết (Technical Requirements)

- **REQ-AUTH-008 (Tự Động Thiết Lập Phiên Đăng Nhập Sau Khi Đăng Ký)**:
  - Khi form đăng ký tại `src/app/(auth)/register/page.tsx` nhận được phản hồi HTTP 201 (Created) từ `POST /api/v1/auth/register`, hệ thống MUST tự động thực thi chuỗi đăng nhập tiếp theo bằng thông tin Email và Password người dùng vừa cung cấp.
  - Lưu trữ an toàn JWT Bearer Token vào LocalStorage (`nacentwin_access_token`) và ngữ cảnh người dùng (`nacentwin_user_context`) với role `PUBLIC_USER`.
  - Hiển thị Toast thông báo thành công: *"Đăng ký thành công! Chào mừng bạn gia nhập NacenTech."*
  - Tự động điều hướng an toàn qua `router.push("/")` (hoặc đường dẫn theo `getRedirectPathByRole(user.role)`).
  - Không xóa trắng form trước khi phiên đăng nhập được thiết lập thành công.

- **BR-AUTH-009 (Quy Tắc Xử Lý Trạng Thái Nút Bấm, Chống Double-Submit & Fallback Mạng)**:
  - **Trạng thái xử lý (5 UX States)**: Nút "Đăng ký thành viên" MUST bị vô hiệu hóa (disabled) và hiển thị Spinner trong suốt chu trình 2 giai đoạn:
    * Giai đoạn 1: *"Đang tạo tài khoản..."*
    * Giai đoạn 2: *"Đang khởi tạo phiên làm việc..."*
  - **Chống spam / Click đúp**: Ngăn chặn người dùng bấm nhiều lần gây trùng lặp request hoặc rate-limit.
  - **Graceful Fallback**: Trong trường hợp tạo tài khoản thành công nhưng cuộc gọi đăng nhập tiếp theo thất bại do gián đoạn mạng đột xuất:
    * Giữ nguyên dữ liệu form.
    * Hiển thị thông báo hướng dẫn người dùng: *"Tài khoản của bạn đã được khởi tạo thành công! Vui lòng bấm để đăng nhập"* kèm nút chuyển hướng sang `/login?registered=true&email=...`.

- **UI-AUTH-003 (Phản Hồi Giao Diện Người Dùng)**:
  - Loại bỏ hoàn toàn khối banner tĩnh màu xanh lá bắt người dùng bấm link đăng nhập khi luồng auto-login hoạt động bình thường.
  - Tích hợp Toast notification thông báo chào mừng từ Design System.

- **TEST-AUTH-004 (Tiêu Chuẩn Kiểm Thử Khép Kín)**:
  - `src/app/(auth)/register/page.test.tsx` cập nhật kiểm thử xác nhận:
    1. Cuộc gọi register thành công kích hoạt tiếp cuộc gọi login.
    2. LocalStorage được ghi nhận token và user context.
    3. `router.push` được gọi để chuyển hướng.
    4. Xử lý fallback an toàn khi mock login thất bại.

### 3. Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)

- **AC-CR-020.1 (Seamless Auto-Login)**: Người dùng sau khi đăng ký thành công không còn phải nhập lại mật khẩu tại `/login`.
- **AC-CR-020.2 (Session Persistence)**: Sau khi tự động đăng nhập, `localStorage` chứa đầy đủ `nacentwin_access_token` và `nacentwin_user_context` với vai trò `PUBLIC_USER`.
- **AC-CR-020.3 (Header Sync)**: Header của trang web tự động nhận diện danh tính và hiển thị menu tài khoản ngay khi chuyển trang.
- **AC-CR-020.4 (Double-submit Prevention)**: Nút submit bị khóa trong toàn bộ quá trình register & auto-login.
- **AC-CR-020.5 (Network Fallback)**: Nếu auto-login gặp sự cố mạng, hiển thị thông báo chuyển hướng sang trang login rõ ràng.

### 4. Ma Trận Truy Vết Khép Kín (Traceability Matrix)

| Yêu Cầu Chức Năng (REQ) | Quy Tắc Nghiệp Vụ (BR) | Tiêu Chí Chấp Thuận (AC) | Tệp Nguồn Triển Khai (Source Code) | Kiểm Thử Kiểm Chứng (Automated Tests) |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-AUTH-008** | `BR-AUTH-009` | `AC-CR-020.1`, `AC-CR-020.2` | `src/app/(auth)/register/page.tsx` | `src/app/(auth)/register/page.test.tsx` |
| **BR-AUTH-009** | `BR-AUTH-009` | `AC-CR-020.4`, `AC-CR-020.5` | `src/app/(auth)/register/page.tsx` | `src/app/(auth)/register/page.test.tsx` |
| **UI-AUTH-003** | `BR-AUTH-009` | `AC-CR-020.3` | `src/app/(auth)/register/page.tsx`, Header | `page.test.tsx`, Playwright E2E |

---

## Spec Delta v17 (CR-2026-021): Nâng Cấp Bắt Buộc Định Danh Pháp Nhân Khi Mở Gian Hàng Seller [PO-DEC-20261103-01]

> **Căn cứ phê duyệt:** Quyết định điều hành của Product Owner (`nacen-po-pm`) và Senior BA (`nacen-ba`) theo Quyết định `PO-DEC-20261103-01` (CR-2026-021) tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 26; Chuẩn hóa định danh pháp nhân, bảo vệ quyền SHTT và ngăn chặn triệt để rủi ro mạo danh viện trường/doanh nghiệp trên sàn giao dịch quốc gia.

### 1. Bối Cảnh & Lý Do Thay Đổi (Background & Problem Statement)

1. **Rủi ro mạo danh nghiêm trọng**: Form đăng ký gian hàng Seller cũ trên Web Portal (`#sellerModal`) chỉ cho phép nhập chuỗi văn bản tự do tên đơn vị cung ứng, không có Mã số thuế, không có tra cứu pháp nhân và không yêu cầu bất kỳ tài liệu chứng minh nào. Bất kỳ tài khoản cá nhân nào cũng có thể tự xưng là Viện Hàn lâm KH&CN, Đại học Quốc gia hoặc Tập đoàn lớn để mở gian hàng và chào bán giải pháp.
2. **Lỗ hổng pháp lý & Bản quyền SHTT**: Nền tảng thiếu cơ sở pháp lý để xác minh quyền sở hữu hoặc quyền đại diện thương mại đối với các sáng chế, giải pháp hữu ích niêm yết lên Sàn Chào Bán Quốc Gia (`/san-pham`).
3. **Yêu cầu chuẩn hóa**: Phải bắt buộc phân định 2 nhóm chủ thể pháp nhân (Doanh nghiệp có MST và Giấy ĐKKD PDF vs Viện/Trường/Tổ chức R&D có Số QĐ thành lập và File QĐ PDF) mới được tiếp nhận thẩm định quyền `SELLER` với cam kết SLA 24 giờ.

### 2. Yêu Cầu Kỹ Thuật Chi Tiết (Technical Requirements)

- **REQ-UPG-05 (Bắt Buộc Định Danh Pháp Nhân Khi Mở Gian Hàng Seller)**:
  - Khi người dùng gửi yêu cầu mở gian hàng Bên Bán (`SELLER`) tại `/profile/upgrade`, hệ thống MUST cưỡng chế người dùng chọn chính xác một trong 2 loại hình pháp nhân:
    1. `ENTERPRISE` (Doanh nghiệp, Doanh nghiệp KH&CN).
    2. `INSTITUTION_RND` (Viện Nghiên cứu, Trường Đại học, Trung tâm R&D).
  - Khóa nút gửi đơn nếu chưa chọn loại pháp nhân hoặc để trống các trường định danh bắt buộc tương ứng.

- **REQ-UPG-06 (Thu Thập & Kiểm Chứng Tài Liệu Minh Chứng Pháp Lý)**:
  - Nhánh `ENTERPRISE`:
    * Thu thập Mã số thuế (MST) hợp lệ và cung cấp nút *"Tra cứu MST"* tự động điền Tên Doanh nghiệp từ CSDL Quốc gia.
    * Thu thập tệp Giấy chứng nhận ĐKKD định dạng PDF, dung lượng tối đa 10MB.
  - Nhánh `INSTITUTION_RND`:
    * Thu thập Số Quyết định thành lập hoặc Mã Giấy phép hoạt động KH&CN chính thức.
    * Thu thập tệp Quyết định thành lập / Giấy phép hoạt động KH&CN định dạng PDF, dung lượng tối đa 10MB.

- **BR-UPG-03 (Quy Tắc Xác Thực Mã Định Danh Pháp Nhân)**:
  - `taxCode`: Chuẩn regex `^\d{10}(\d{3})?$`. Khi bấm tra cứu MST thành công, tự động khóa hoặc điền Tên doanh nghiệp.
  - `establishmentDecisionNo`: Chuỗi ký tự độ dài tối thiểu 5 ký tự, không chứa chuỗi rỗng hoặc ký tự đặc biệt vô nghĩa.
  - `orgName`: Tên đơn vị có độ dài từ 5 đến 255 ký tự, thể hiện đúng tên pháp nhân đã đăng ký.

- **BR-UPG-04 (Ràng Buộc Tệp Văn Bản Pháp Lý PDF & Cam Kết Bản Quyền SHTT)**:
  - Tệp tải lên MUST có MIME type `application/pdf`, dung lượng $> 0$ và $\le 10$MB ($10 \times 1024 \times 1024$ bytes).
  - Tệp được lưu trữ an toàn, URL/Key được nhúng vào `payload_json` của yêu cầu thẩm định.
  - Checkbox cam kết tuân thủ quy chế sàn, chịu trách nhiệm pháp lý và bảo đảm quyền sở hữu trí tuệ hợp pháp (`pledgeAgreed = true`) là trường bắt buộc.

- **UI-UPG-002 (Giao Diện Modal Seller 2 Tabs & Upload File Drag-and-Drop)**:
  - Cập nhật modal `#sellerModal` tại `src/app/profile/upgrade/page.tsx` chuẩn 1:1 theo Wireframe SSOT.
  - Bộ chuyển đổi 2 tabs: Tab Doanh nghiệp (icon `Building2`) và Tab Viện/Trường R&D (icon `Landmark`).
  - Khu vực tải file trực quan, hiển thị tên tệp và dung lượng MB sau khi chọn, hỗ trợ nút xóa/chọn lại tệp.

- **TEST-UPG-003 (Tiêu Chuẩn Kiểm Thử Khép Kín)**:
  - Unit tests backend: Xác nhận FluentValidation bắt lỗi khi thiếu MST, thiếu QĐ thành lập, thiếu file URL hoặc file không phải PDF.
  - Component tests frontend: Kiểm thử chuyển đổi tab, tra cứu MST, upload file PDF và client-side validation.
  - E2E tests: Kiểm thử luồng toàn trình nộp đơn Seller thành công và ghi nhận bản ghi vào CSDL PostgreSQL.

### 3. Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)

- **AC-CR-021.1 (Entity Type Mandate)**: Bắt buộc chọn loại hình pháp nhân (Doanh nghiệp hoặc Viện/Trường R&D). Form không cho phép submit khi chưa chọn.
- **AC-CR-021.2 (Tax Code & Lookup for Enterprise)**: Nhánh Doanh nghiệp bắt buộc nhập MST 10 hoặc 13 số. Nút "Tra cứu MST" phản hồi tên doanh nghiệp và hiển thị thông báo đối soát thành công.
- **AC-CR-021.3 (Decision Number for Institution)**: Nhánh Viện/Trường bắt buộc nhập Số QĐ thành lập hoặc Mã GP KH&CN hợp lệ.
- **AC-CR-021.4 (Mandatory PDF Upload)**: Cả 2 nhánh đều bắt buộc phải đính kèm tệp PDF minh chứng ($\le 10$MB). Hệ thống từ chối ngay lập tức các tệp không phải PDF hoặc vượt quá 10MB.
- **AC-CR-021.5 (Zero-Mock Payload Persistence)**: Bản ghi yêu cầu thẩm định được lưu thành công vào bảng `identity.approval_requests` với `request_type = 'SHOP'`, `payload_json` chứa đầy đủ cấu trúc pháp nhân và SLA thời hạn 24 giờ.

### 4. Ma Trận Truy Vết Khép Kín (Traceability Matrix)

| Yêu Cầu Chức Năng (REQ) | Quy Tắc Nghiệp Vụ (BR) | Tiêu Chí Chấp Thuận (AC) | Tệp Nguồn Triển Khai (Source Code) | Kiểm Thử Kiểm Chứng (Automated Tests) |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-UPG-05** | `BR-UPG-03` | `AC-CR-021.1`, `AC-CR-021.2`, `AC-CR-021.3` | `src/app/profile/upgrade/page.tsx`, `ApprovalService.cs` | `profile/upgrade/page.test.tsx`, `Task07DeltaV4ApprovalQcTests.cs` |
| **REQ-UPG-06** | `BR-UPG-04` | `AC-CR-021.4` | `src/app/profile/upgrade/page.tsx`, `SubmitApprovalRequestValidator.cs` | `profile/upgrade/page.test.tsx`, Unit Tests C# |
| **UI-UPG-002** | `BR-UPG-03`, `BR-UPG-04` | `AC-CR-021.1`, `AC-CR-021.4` | `src/app/profile/upgrade/page.tsx`, Wireframe SSOT | `page.test.tsx`, Playwright E2E |
| **BR-UPG-03** | `BR-UPG-03` | `AC-CR-021.2`, `AC-CR-021.3` | `src/app/profile/upgrade/page.tsx`, Backend Validator | FluentValidation Unit Tests |
| **BR-UPG-04** | `BR-UPG-04` | `AC-CR-021.4`, `AC-CR-021.5` | `src/app/profile/upgrade/page.tsx`, `ApprovalService.cs` | Vitest, Backend Integration Tests |

---

## Spec Delta v18 (CR-2026-022): Chuyển Đổi Typography Toàn Hệ Thống Sang Be Vietnam Pro Đồng Bộ 100% sti.gov.vn và trace.nacencheck.com

**Căn cứ pháp lý & Thiết kế cơ sở:** Quyết định PO-DEC-20261103-03 tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 7.3 & Mục 10; Hệ sinh thái Cục Thông tin KH&CN Quốc gia (`sti.gov.vn`) và Nền tảng Truy xuất Nguồn gốc Quốc gia (`trace.nacencheck.com`).

### 1. Bối Cảnh & Lý Do Thay Đổi (Context & Problem Statement)

1. **Yêu cầu Đồng Bộ 100% Nhận Diện Hệ Sinh Thái KH&CN**: Cổng Dữ liệu số Quốc gia NacenTwin (Viện Ứng Dụng Công Nghệ NacenTech - Bộ KH&CN) là nền tảng số cốt lõi kết nối các dịch vụ trong hệ sinh thái Bộ KH&CN. Để đảm bảo nhận diện thương hiệu số đồng nhất với Cục Thông tin KH&CN Quốc gia (`sti.gov.vn`) và nền tảng số liên kết `trace.nacencheck.com`, toàn bộ hệ thống chuyển đổi thống nhất sang sử dụng **Be Vietnam Pro** cho toàn bộ UI và Headings.
2. **Font Dữ Liệu Kỹ Thuật JetBrains Mono**: Bổ sung font monospaced **JetBrains Mono** cho các khối số liệu, mã định danh `REQ-`, `DMD-`, MST, Hash blockchain/ZK-proofs để chống nhầm lẫn số và ký tự.
3. **Bảo toàn Kỷ Luật Hiển Thị Bất Biến**: Bảo toàn tuyệt đối cơ chế Zero CLS (`display: 'swap'`), Zero Horizontal Overflow ở nấc co giãn chữ A+ 110% (`overflow-x: clip`), và Touch Target tối thiểu $\ge 44 \times 44\text{px}$.

### 2. Yêu Cầu Kỹ Thuật & Điểm Neo Nghiệp Vụ Bất Biến (Invariant Invariants)

- **REQ-UI-FONT-01 (Chuẩn Hóa Font Be Vietnam Pro Toàn Hệ Thống)**:
  - Hệ thống Frontend MUST sử dụng font chữ **`Be Vietnam Pro`** làm font chữ chính thức duy nhất cho toàn bộ giao diện người dùng (body text, inputs, buttons, tables, badges, cards, dialogs) và toàn bộ các cấp tiêu đề (headings `h1` đến `h6`, display banners, quốc hiệu, tiêu ngữ), nạp trực tiếp qua `next/font/google` với đầy đủ subset `vietnamese` và `latin`.
  - Hỗ trợ các weights: `400 (Regular)`, `500 (Medium)`, `600 (SemiBold)`, `700 (Bold)`, `800 (ExtraBold)`.

- **REQ-UI-FONT-02 (Chuẩn Hóa Font JetBrains Mono Cho Dữ Liệu Kỹ Thuật)**:
  - Hệ thống Frontend MUST sử dụng font chữ **`JetBrains Mono`** cho các khối dữ liệu kỹ thuật, mã định danh, số liệu blockchain/zk-proof, mã số thuế (MST), mã hồ sơ và mã hash bảo mật, đảm bảo độ rộng ký tự đồng đều (monospace) và phân biệt tuyệt đối giữa số 0 và chữ O, số 1 và chữ l.
  - Hỗ trợ các weights: `400 (Regular)`, `500 (Medium)`, `600 (SemiBold)`.

- **BR-UI-01 (Kỷ Luật Zero Cumulative Layout Shift - Zero CLS)**:
  - Nạp font thông qua `next/font/google` với `display: 'swap'` và định nghĩa CSS variables tĩnh trên thẻ `<html>` gốc để triệt tiêu hoàn toàn hiện tượng giật khung hình tải trang ban đầu (Cumulative Layout Shift = 0).

- **BR-UI-02 (Kỷ Luật Zero Horizontal Overflow Khi Co Giãn Chữ A+ 110%)**:
  - Tại mọi độ phân giải màn hình từ di động (320px) đến 4K, khi người dùng kích hoạt nấc phóng to cỡ chữ toàn cục A+ (110% qua `html[data-text-scale="lg"]`), hệ thống MUST bảo đảm không xuất hiện thanh cuộn ngang ngoài ý muốn (`overflow-x: clip` trên `html`, `body`), không vỡ khối điều hướng và không đè chữ lẫn nhau.

- **UI-FONT-01 (Cấu Hình Token CSS Variables Nền Tảng)**:
  - Cấu hình các biến CSS design tokens toàn cục tại `src/app/globals.css`:
    * `--font-sans`: trỏ về `var(--font-be-vietnam-pro), ui-sans-serif, system-ui, sans-serif;`
    * `--font-heading`: trỏ về `var(--font-be-vietnam-pro), ui-sans-serif, system-ui, sans-serif;`
    * `--font-mono`: trỏ về `var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, monospace;`
    * `--font-be-vietnam-pro`: biến kế thừa tương thích ngược.

- **TEST-FONT-01 (Bộ Kiểm Thử Đơn Vị QC Gate 4 Typography Đạt 100% Pass)**:
  - Tích hợp kiểm chứng trong `src/test/qc-gate4-typography.test.ts` và bắt buộc phải đạt kết quả 100% PASS (Green) cho toàn bộ các tiêu chí: nạp Google fonts Be Vietnam Pro + JetBrains Mono, CSS variables, scale 3 nấc A-/A/A+, Touch Target $\ge 44\text{px}$, chống tràn menu `xl:flex` và `overflow-x: clip`.

### 3. Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)

- **AC-CR-022.1**: Tệp `src/app/layout.tsx` nạp đúng `Be_Vietnam_Pro` và `JetBrains_Mono` từ `next/font/google` với `display: 'swap'` và `subsets: ['vietnamese', 'latin']`.
- **AC-CR-022.2**: Tệp `src/app/globals.css` ánh xạ `--font-sans` và `--font-heading` về `var(--font-be-vietnam-pro)`, `--font-mono` về `var(--font-jetbrains-mono)`.
- **AC-CR-022.3**: Giao diện người dùng trên toàn hệ thống áp dụng font Be Vietnam Pro đồng bộ, không còn class hoặc khai báo rác trỏ tới Nunito Sans hoặc Lora.
- **AC-CR-022.4 (Zero Horizontal Overflow)**: Kích hoạt nút cỡ chữ A+ (110%) không xuất hiện cuộn ngang (`window.scrollX === 0`) trên các độ phân giải từ 320px đến 4K.
- **AC-CR-022.5 (Touch Targets $\ge 44\text{px}$)**: Các nút điều khiển cỡ chữ và các nút tương tác đạt diện tích chạm tối thiểu $44 \times 44\text{px}$.
- **AC-CR-022.6 (QC Verification)**: Bộ kiểm thử `qc-gate4-typography.test.ts` đạt kết quả 100% Green (PASS).
- **AC-CR-022.7 (Build Success)**: Lệnh `pnpm build` tại `SourceCode/frontend` kết thúc thành công với mã lỗi 0.

### 4. Ma Trận Truy Vết Khép Kín (Traceability Matrix)

| Yêu Cầu Chức Năng (REQ) | Quy Tắc Nghiệp Vụ (BR) | Tiêu Chí Chấp Thuận (AC) | Tệp Nguồn Triển Khai (Source Code) | Kiểm Thử Kiểm Chứng (Automated Tests) |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-UI-FONT-01** | `BR-UI-01`, `BR-UI-02` | `AC-CR-022.1`, `AC-CR-022.2`, `AC-CR-022.3` | `src/app/layout.tsx`, `src/app/globals.css` | `src/test/qc-gate4-typography.test.ts` |
| **REQ-UI-FONT-02** | `BR-UI-01` | `AC-CR-022.1`, `AC-CR-022.2` | `src/app/layout.tsx`, `src/app/globals.css` | `src/test/qc-gate4-typography.test.ts` |
| **UI-FONT-01** | `BR-UI-01` | `AC-CR-022.2` | `src/app/globals.css` | `src/test/qc-gate4-typography.test.ts` |
| **TEST-FONT-01** | `BR-UI-01`, `BR-UI-02` | `AC-CR-022.4`, `AC-CR-022.5`, `AC-CR-022.6` | `src/test/qc-gate4-typography.test.ts` | Vitest Test Suite |



---

## Spec Delta v19 (CR-2026-UIUX-005): Tối Ưu Tốc Độ Chuyển Route Toàn Trang, Đóng Gói Next.js & Client Cache Danh Mục [PO-DEC-20261111-01]

> **Căn cứ phê duyệt:** Quyết định điều hành `PO-DEC-20261111-01` (11/11/2026) tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 33 và `Specification/02_BASIC_DESIGN/TASK-00_PLATFORM_FOUNDATION_VA_COMMON/BD-02-global-shell-navigation.md` Mục 7; Hồ sơ Delta Ledger [`CR-2026-UIUX-005`](./deltas/CR-2026-UIUX-005_route_transition_and_client_perf.md) (Target Version: `1.21.0`, Status: `APPROVED`).

### 1. Bối Cảnh & Lý Do Thay Đổi (Background & Problem Statement)

1. **Đo đạc thực tế trên môi trường vận hành**: Backend `.NET` (`localhost:5080`) phản hồi nhanh (`0.011s – 0.294s`), không phải điểm nghẽn chính. Điểm nghẽn nằm ở Frontend `next dev -p 3000` chạy Webpack on-demand compile trên Google Drive CloudStorage, thiếu `optimizePackageImports: ["lucide-react"]`, khiến lần truy cập đầu (cold) các trang quản trị mất `3.00s – 7.38s`.
2. **Độ trễ phản hồi `NavigationProgress`**: `src/components/common/navigation-progress.tsx` đang bọc `setVisible(true)` trong `startTransition`, làm thanh tiến trình bị trì hoãn hiển thị khi chuyển route chậm.
3. **Nạp lặp danh mục tĩnh**: `src/lib/master-data-client.ts` gọi `getActiveSectors()` với `{ cache: "no-store" }` ở mỗi lần mount trang mà chưa có TTL cache và deduplication.

### 2. Yêu Cầu Kỹ Thuật & Điểm Neo Bất Biến (Immutable Requirements & Rules)

- **`REQ-UI-040` (Global Route Transition Progress Phản Hồi Tức Thì)**:
  - `NavigationProgress` (`src/components/common/navigation-progress.tsx`) MUST kích hoạt `visible = true` và `progress > 0` ngay tại thời điểm click liên kết nội bộ (`<50ms`), **tuyệt đối không** trì hoãn qua `startTransition`.
  - Hiển thị thanh tiến trình rõ ràng trên đỉnh viewport (`fixed top-0 left-0 right-0 z-[9999]`), không gây dịch chuyển bố cục (`CLS = 0`), và tự hoàn tất lên `100%` rồi ẩn khi `pathname`/`searchParams` cập nhật.

- **`REQ-UI-041` (Next.js Dev/Build Optimization)**:
  - `SourceCode/frontend/next.config.ts`: Bổ sung `experimental: { optimizePackageImports: ["lucide-react"] }`.
  - `SourceCode/frontend/package.json`: Cập nhật dev script sử dụng Turbopack (`next dev --turbopack -p 3000`).

- **`REQ-UI-042` (Client In-Memory Master-Data Cache & Deduplication)**:
  - `SourceCode/frontend/src/lib/master-data-client.ts`: Triển khai in-memory TTL cache + in-flight request deduplication cho `getActiveSectors(options?: { forceRefresh?: boolean })`, kèm hàm `invalidateSectorsCache()`.
  - Gọi `invalidateSectorsCache()` ngay khi Admin thực hiện các thao tác CRUD danh mục lĩnh vực tại `SourceCode/frontend/src/app/admin/sectors/page.tsx`.

- **`BR-UI-030` (Zero Logic Regression & Freshness Guarantee)**:
  - Bảo toàn 100% route links (`href`), logic bỏ qua external/hash/`_blank`, API contract `/api/v1/sectors` và chuẩn xử lý lỗi không mock fallback của `master-data-client.ts`.
  - Đảm bảo tính tươi mới dữ liệu (`Freshness Guarantee`): Dữ liệu danh mục luôn được làm mới ngay sau khi Admin CRUD tại `/admin/sectors` (qua `invalidateSectorsCache()`) hoặc khi truyền `forceRefresh: true`.

- **`TEST-UI-030` (Vitest + Benchmark Kiểm Chứng)**:
  - `src/components/common/navigation-progress.test.tsx`: Kiểm chứng kích hoạt thanh progress tức thì khi click link nội bộ (không bị hoãn bởi transition), bỏ qua link ngoại tuyến/hash/`_blank`, và ẩn sau khi route đổi.
  - `src/lib/master-data-client.test.ts`: Kiểm chứng cache hit trong TTL, in-flight deduplication, `forceRefresh`, `invalidateSectorsCache()`, và reject lỗi API không fallback.
  - Benchmark & Build Gate: Đo đạc thời gian phản hồi trước/sau và xác nhận `next build` sạch 100% (`0` lỗi).

### 3. Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)

- **`AC-CR-UIUX-005.1`**: Click liên kết nội bộ kích hoạt `NavigationProgress` (`role="progressbar"`) ngay tức thì (`<50ms`), hiển thị rõ ràng và `CLS = 0`.
- **`AC-CR-UIUX-005.2`**: `next.config.ts` cấu hình `optimizePackageImports: ["lucide-react"]`; `package.json` bật Turbopack cho `dev`; `next build` thành công 100%.
- **`AC-CR-UIUX-005.3`**: Nhiều lời gọi `getActiveSectors()` đồng thời hoặc trong thời hạn TTL chỉ phát sinh 1 HTTP request `/api/v1/sectors`.
- **`AC-CR-UIUX-005.4`**: Thao tác CRUD tại `/admin/sectors` kích hoạt `invalidateSectorsCache()` (hoặc gọi `forceRefresh: true`), đảm bảo lần đọc kế tiếp nhận dữ liệu mới nhất từ PostgreSQL qua API.
- **`AC-CR-UIUX-005.5`**: 100% Vitest suites (`navigation-progress.test.tsx`, `master-data-client.test.ts` và regression suite) đạt PASS, không suy giảm chức năng cũ.

### 4. Ma Trận Truy Vết Khép Kín (Traceability Matrix)

| Yêu Cầu Chức Năng (REQ) | Quy Tắc Nghiệp Vụ (BR) | Tiêu Chí Chấp Thuận (AC) | Tệp Nguồn Triển Khai (Source Code) | Kiểm Thử Kiểm Chứng (Automated Tests) |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-UI-040** | `BR-UI-030` | `AC-CR-UIUX-005.1`, `AC-CR-UIUX-005.5` | `src/components/common/navigation-progress.tsx` | `src/components/common/navigation-progress.test.tsx` |
| **REQ-UI-041** | `BR-UI-030` | `AC-CR-UIUX-005.2` | `next.config.ts`, `package.json` | `next build` + Benchmark đo compile/route |
| **REQ-UI-042** | `BR-UI-030` | `AC-CR-UIUX-005.3`, `AC-CR-UIUX-005.4`, `AC-CR-UIUX-005.5` | `src/lib/master-data-client.ts`, `src/app/admin/sectors/page.tsx` | `src/lib/master-data-client.test.ts` |
| **TEST-UI-030** | `BR-UI-030` | `AC-CR-UIUX-005.1`..`AC-CR-UIUX-005.5` | `navigation-progress.test.tsx`, `master-data-client.test.ts` | Vitest + `next build` + Benchmark |

---

## Spec Delta v20 (CR-2026-031): Phản Hồi Chuyển Route Tức Thì Cho `/portal/*`, `(portal)` & `/gov/*` Và Cache Hồ Sơ Doanh Nghiệp [PO-DEC-20261111-03]

> **Căn cứ phê duyệt:** Quyết định điều hành `PO-DEC-20261111-03` (11/11/2026) tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 35; Hồ sơ Delta Ledger [`CR-2026-031`](./deltas/CR-2026-031_portal_gov_route_loading_and_profile_cache.md).

### 1. Yêu Cầu Kỹ Thuật & Điểm Neo Bất Biến
- **`REQ-UI-043`**: Trích xuất `WorkspaceRouteSkeleton` dùng chung (`src/components/common/workspace-route-skeleton.tsx`); thêm `src/app/portal/loading.tsx`, `src/app/(portal)/loading.tsx`, `src/app/gov/loading.tsx`; tích hợp `pendingHref` skeleton tức thì `<50ms` + `<React.Suspense>` vào `PortalLayout` và `GovLayout`.
- **`REQ-UI-044`**: Triển khai in-memory TTL cache (`30s` theo `accessToken`) và in-flight deduplication cho `fetchMyEnterpriseProfile()`, tự động invalidate khi cập nhật hồ sơ hoặc chuyển Dual Mode, và bỏ re-fetch thừa theo `[pathname]` trong `PortalLayout`.
- **`BR-UI-031`**: Bảo toàn tuyệt đối `RoleGuard`, `RoleSwitcher` và cô lập cache theo token phiên đăng nhập.
- **`TEST-UI-031`**: Unit tests kiểm chứng pending skeleton trên `PortalLayout`, `GovLayout` và cache/dedup/token-isolation/invalidation tại `src/lib/enterprise-client.test.ts`.

| Yêu Cầu Chức Năng (REQ) | Quy Tắc Nghiệp Vụ (BR) | Tiêu Chí Chấp Thuận | Tệp Nguồn Triển Khai | Kiểm Thử Kiểm Chứng |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-UI-043** | `BR-UI-031` | `WorkspaceRouteSkeleton`, `loading.tsx`, `pendingHref` tại Portal & Gov | `workspace-route-skeleton.tsx`, `portal/loading.tsx`, `(portal)/loading.tsx`, `gov/loading.tsx`, `portal/layout.tsx`, `gov/layout.tsx` | `portal/layout.test.tsx`, `gov/layout.test.tsx` |
| **REQ-UI-044** | `BR-UI-031` | Cache 30s, dedup, token isolation, invalidate on write | `src/lib/enterprise-client.ts`, `src/app/portal/layout.tsx` | `src/lib/enterprise-client.test.ts`, `portal/layout.test.tsx` |
