# Danh sách Công việc (tasks.md) - TASK-09

### Phase 1: API Contract & Mocking [CONTRACT]
- [ ] T-09.1 [CONTRACT] Cập nhật OpenAPI Swagger Docs với DTOs của TT17Assessment.

### Phase 2: Triển Khai Backend [BE]
- [x] T-09.2 [BE] Khởi tạo entity `Tt17Assessment` trong module `NacenTech.Modules.Assessment`.
- [x] T-09.3 [BE] Cấu hình EF Core Mapping hỗ trợ Hybrid JSONB cho 4 trường động lớn.
- [x] T-09.4 [BE] Chạy EF Core Migration `CreateAssessmentSchema` và Update Database.
- [x] T-09.5 [BE] Viết Engine tính điểm `Tt17ScoringService`.
- [x] T-09.6 [BE] Viết UseCases Save Draft và Submit (tạo Yearly Snapshot).
- [x] T-09.7 [BE] Viết Unit Tests bao phủ Engine tính điểm T-E-O-R-I.

### Phase 3: Triển Khai Frontend [FE]
- [ ] T-09.8 [FE] Xây dựng UI 5 Tabs (T-E-O-R-I) bằng React Hook Form.
- [ ] T-09.9 [FE] Tích hợp gọi API bằng component `<Async>`.

### Phase 4: Tích Hợp & Nghiệm Thu [INT]
- [ ] T-09.10 [INT] E2E test cho luồng nhập full dữ liệu TT17 và xác nhận kết quả tính điểm.
