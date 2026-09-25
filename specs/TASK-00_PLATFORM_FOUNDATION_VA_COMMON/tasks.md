# Tasks: TASK-00 Platform Foundation & Common Architecture

**Feature**: `TASK-00_PLATFORM_FOUNDATION_VA_COMMON`  
**Spec Reference**: [`spec.md`](./spec.md)  
**Plan Reference**: [`plan.md`](./plan.md)  
**Status**: Ready to Implement  

---

## Giai đoạn 1: Thiết Lập Hạ Tầng Docker Local (`[INFRA]`)

- [ ] `T-00.1` **[INFRA]** Rà soát và chuẩn hóa `backend/docker-compose.yml` với PostgreSQL 16 và Redis 7.
- [ ] `T-00.2` **[INFRA]** Cấu hình script khởi chạy `backend/scripts/start-local-infra.sh` và kiểm tra port mapping 5432.
- [ ] `T-00.3` **[INFRA]** Viết tài liệu hướng dẫn khởi chạy local DB tại `backend/docs/getting-started.md`.

---

## Giai đoạn 2: Tầng Thư Viện Dùng Chung Shared Kernel (`[KERNEL]`)

- [ ] `T-00.4` **[KERNEL]** Chuẩn hóa `Result<T>` và `Error` types tại `backend/packages/kernel/Results/`.
- [ ] `T-00.5` **[KERNEL]** Xây dựng `Entity<TId>` và `AuditableEntity` tại `backend/packages/kernel/Primitives/`.
- [ ] `T-00.6` **[KERNEL]** Xây dựng `PagedList<T>` hỗ trợ query phân trang cho danh sách nghiệp vụ.
- [ ] `T-00.7` **[KERNEL]** Viết Unit Test kiểm chứng 100% các trạng thái của `Result<T>` và `AuditableEntity`.

---

## Giai đoạn 3: Tầng Dữ Liệu Cơ Sở Persistence (`[PERSISTENCE]`)

- [ ] `T-00.8` **[PERSISTENCE]** Cấu hình `DbContextBase` tích hợp Npgsql PostgreSQL tại `backend/packages/persistence/`.
- [ ] `T-00.9` **[PERSISTENCE]** Triển khai `AuditInterceptor` tự động ghi nhận `CreatedAtUtc`, `UpdatedAtUtc`.
- [ ] `T-00.10` **[PERSISTENCE]** Thiết lập cơ chế đăng ký và cấu hình Entity Mapping tự động theo từng module.

---

## Giai đoạn 4: Cấu Hình API Host & Middleware (`[API]`)

- [ ] `T-00.11` **[API]** Cấu hình `GlobalExceptionHandlerMiddleware` trả về ProblemDetails chuẩn RFC 7807.
- [ ] `T-00.12` **[API]** Cấu hình JWT Bearer Authentication và Extension Methods trên `ClaimsPrincipal`.
- [ ] `T-00.13` **[API]** Kích hoạt Swagger UI hỗ trợ authorize Bearer Token trực tiếp trên giao diện trình duyệt.
- [ ] `T-00.14` **[API]** Cấu hình endpoint `/health` kiểm tra kết nối DB và Redis.

---

## Giai đoạn 5: Nghiệm Thu Hội Tụ (Quality Gate Verification)

- [ ] `T-00.15` **[TEST]** Chạy toàn bộ test suites trong `backend/tests/` và xác nhận kết quả pass.
- [ ] `T-00.16` **[SPEC]** Cập nhật trạng thái `TASK-00` trong `specs/ROADMAP.md` và `specs/TRACEABILITY.md`.
