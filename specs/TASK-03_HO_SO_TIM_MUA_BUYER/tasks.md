# Danh sách Công việc (tasks.md) - TASK-03

### Phase 1: API Contract & Mocking [CONTRACT]
- [ ] T-03.1 [CONTRACT] Cập nhật OpenAPI Swagger Docs với DTOs của SurveySubmission.

### Phase 2: Triển Khai Backend [BE]
- [x] T-03.2 [BE] Khởi tạo entity `SurveySubmission` trong module `NacenTech.Modules.Demand` hỗ trợ Hybrid JSONB cho `need_items` và `bottlenecks`.
- [x] T-03.3 [BE] Chạy EF Core Migration `CreateDemandSurveySchema` và Update Database.
- [x] T-03.4 [BE] Viết logic UseCase Create/Update/Submit Survey (Yearly Snapshot).
- [x] T-03.5 [BE] Viết Unit Tests.

### Phase 3: Triển Khai Frontend [FE]
- [ ] T-03.6 [FE] Xây dựng màn hình nhập Form Khảo Sát Nhu Cầu.
- [ ] T-03.7 [FE] Màn hình Admin duyệt bài toán thành Demand Brief.

### Phase 4: Tích Hợp & Nghiệm Thu [INT]
- [ ] T-03.8 [INT] E2E test cho luồng khảo sát và sinh Demand Brief.
