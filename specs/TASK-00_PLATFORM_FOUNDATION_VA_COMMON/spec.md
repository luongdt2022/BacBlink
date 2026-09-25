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
