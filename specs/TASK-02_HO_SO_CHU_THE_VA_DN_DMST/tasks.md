# Danh Sách Công Việc Kỹ Thuật (tasks.md) — TASK-02: Hồ Sơ Chủ Thể & 304 Doanh Nghiệp ĐMST

> **Mã phân hệ**: `TASK-02`  
> **Ánh xạ Spec Kit**: [`spec.md`](spec.md) | [`plan.md`](plan.md)  
> **Quy chuẩn**: Phân rã tuần tự, gắn tag `[CONTRACT]`, `[BE]`, `[FE]`, `[INT]`, `[TEST]`, cập nhật tiến độ `[x]`.

---

### Phase 1: Contracts & Database Seed 304 DN [CONTRACT] & [BE]
- [x] **T-02.01** `[CONTRACT]` Định nghĩa bộ DTOs Contracts (`EnterprisePublicDirectoryDto`, `EnterprisePublicDetailDto`, `EnterpriseProfileFullDto`, `EnterpriseDashboardStatsDto`, `EnterpriseApprovalDto`) trong `modules/enterprise`.
- [x] **T-02.02** `[BE]` Cập nhật EF Core Entities `Enterprise`, `EnterpriseProject`, `EnterpriseIpAsset`, `DemandSurvey` hỗ trợ đầy đủ 10 nhóm trường và Hybrid JSONB.
- [x] **T-02.03** `[BE]` Tạo EF Core Migration nạp schema `enterprise` và `demand` cho PostgreSQL.
- [x] **T-02.04** `[BE]` Tích hợp script `seed_304_dn_real_data.sql` (1.2 MB) nạp tự động 304 Doanh nghiệp thực tế có MST vào CSDL.
- [x] **T-02.05** `[BE]` Cài đặt SaveChangesInterceptor tự động ghi nhật ký Before/After vào `system_audit_logs`.

### Phase 2: Triển Khai Backend REST APIs & Unit Invariants [BE] & [TEST]
- [x] **T-02.06** `[BE]` Triển khai `GetPublicEnterprisesQuery`: Tìm kiếm từ khóa, lọc theo 63 tỉnh, 10 ngành TT17, quy mô, TNI, phân trang server-side.
- [x] **T-02.07** `[BE]` Triển khai `GetEnterpriseDetailQuery`: Xem hồ sơ chi tiết theo `taxCode`, áp dụng PDPD Masking (che giấu doanh thu & SĐT).
- [x] **T-02.08** `[BE]` Triển khai `GetOwnerProfileQuery` và `UpsertEnterpriseProfileCommand`: Cho phép chủ sở hữu cập nhật 10 nhóm trường.
- [x] **T-02.09** `[BE]` Triển khai `SubmitVerificationCommand`: Kiểm tra điều kiện bắt buộc `BR-02-003` trước khi chuyển sang chờ thẩm định.
- [x] **T-02.10** `[BE]` Triển khai `GetEnterpriseDashboardStatsQuery`: Tổng hợp số liệu 304 DN theo tỉnh, ngành, phân tầng TNI, top khó khăn.
- [x] **T-02.11** `[BE]` Triển khai `ApproveEnterpriseCommand` & `RejectEnterpriseCommand`: Cán bộ Sở KH&CN thẩm định cấp tỉnh (3D Scoped RBAC `PROVINCIAL_ADMIN`).
- [x] **T-02.12** `[BE]` Đăng ký RESTful Endpoints V1 trong `EnterpriseController`.
- [x] **T-02.13** `[TEST]` Viết Unit Invariant Tests cho 100% Business Rules (`BR-02-001` MST unique, `BR-02-002` PDPD mask, `BR-02-003` submit criteria, `BR-02-005` Scoped RBAC).

### Phase 3: Triển Khai Frontend Next.js 15 (5 Màn Hình) [FE]
- [x] **T-02.14** `[FE]` Tạo client API SDK `enterpriseApi` giao tiếp với Backend Endpoints V1.
- [x] **T-02.15** `[FE]` **MÀN HÌNH 1**: Xây dựng trang Danh bạ tra cứu công khai `/enterprises` (Bộ lọc 5 trục, Grid thẻ, phân trang, 5 UX states `<Async>`).
- [x] **T-02.16** `[FE]` **MÀN HÌNH 2**: Xây dựng trang Chi tiết công khai `/enterprises/[taxCode]` (Hero banner, 4 Tabs năng lực KH&CN, che giấu dữ liệu PII).
- [x] **T-02.17** `[FE]` **MÀN HÌNH 3**: Xây dựng Biểu mẫu kê khai 10 nhóm trường `/portal/enterprise/profile` (Tabs điều hướng, Form validation, nộp thẩm định).
- [x] **T-02.18** `[FE]` **MÀN HÌNH 4**: Xây dựng Dashboard phân tích 304 DN `/admin/enterprises/dashboard` (Thống kê tỉnh, ngành, biểu đồ TNI, danh sách tra cứu).
- [x] **T-02.19** `[FE]` **MÀN HÌNH 5**: Xây dựng Cổng thẩm định cấp tỉnh `/gov/approvals/enterprises` (Maker-Checker duyệt/từ chối hồ sơ).

### Phase 4: Tích Hợp Toàn Trình, Bàn Giao QC & Nghiệm Thu [INT] & [QC]
- [x] **T-02.20** `[INT]` Kiểm tra tích hợp End-to-End: Nạp CSDL 304 DN -> API tra cứu -> Frontend render danh bạ trơn tru.
- [x] **T-02.21** `[TEST]` Chạy bộ kiểm thử tự động Vitest cho các UI components của doanh nghiệp.
- [x] **T-02.22** `[QC]` Bàn giao QC thực thi kịch bản kiểm thử 4 tầng: Unit Test, API Contract Test, DB Integration Test, Playwright Black-box Test.
- [ ] **T-02.23** `[GATE]` Nghiệm thu Definition of Done (DoD), đồng bộ `ROADMAP.md` và `TRACEABILITY.md`, xuất xưởng qua Gate 5.
