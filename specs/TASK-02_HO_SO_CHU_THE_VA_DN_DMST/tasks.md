# Danh sách Công việc (tasks.md) - TASK-02

### Phase 1: API Contract & Mocking [CONTRACT]
- [ ] T-02.1 [CONTRACT] Cập nhật OpenAPI Swagger Docs với DTOs của Enterprise.

### Phase 2: Triển Khai Backend [BE]
- [x] T-02.2 [BE] Khởi tạo module `NacenTech.Modules.Enterprise` trong Clean Architecture.
- [x] T-02.3 [BE] Cài đặt các Domain Entities (`Enterprise`, `EnterpriseIdentifier`, `EnterpriseInnovationProject`...) và mapping EF Core.
- [x] T-02.4 [BE] Chạy EF Core Migration `CreateEnterpriseSchema` và Update Database.
- [x] T-02.5 [BE] Viết `SaveChangesInterceptor` để tự động ghi log vào bảng `SystemAuditLogs` khi có thay đổi.
- [x] T-02.6 [BE] Triển khai UseCases Create, Update cơ bản của Enterprise.
- [x] T-02.7 [BE] Viết Unit Tests bao phủ quy tắc `BR-02-001` và `BR-02-002`.

### Phase 3: Triển Khai Frontend [FE]
- [ ] T-02.8 [FE] Xây dựng UI Screen Hồ sơ (Dashboard và Form nhập liệu 10 nhóm).
- [ ] T-02.9 [FE] Tích hợp gọi API bằng component `<Async>` (Loading, Error, Success).

### Phase 4: Tích Hợp & Nghiệm Thu [INT]
- [ ] T-02.10 [INT] Chạy tích hợp E2E test tạo doanh nghiệp mới và check audit logs.
