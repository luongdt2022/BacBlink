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
- [x] **T-02.23** `[GATE]` Nghiệm thu Definition of Done (DoD), đồng bộ `ROADMAP.md` và `TRACEABILITY.md`, xuất xưởng qua Gate 5.

---

### Phase 5: Hoàn Thiện Đồng Bộ Danh Bạ & Trang Edit Profile (Phương Án 2 PO Approved) [FE][INT]
- [x] **T-02.24** `[FE]` Tạo route chuyên biệt `/portal/enterprise/profile/edit` phục vụ Bàn làm việc Tự quản trị & Chỉnh sửa hồ sơ theo `wireframe_chinh_sua_ho_so_dn.html`.
- [x] **T-02.25** `[FE]` Tạo route alias `/doanh-nghiep-dmst` đồng bộ hiển thị Danh bạ tra cứu quốc gia 304 Doanh nghiệp ĐMST theo `wireframe_danh_ba_dn_dmst.html`.
- [x] **T-02.26** `[FE]` Cập nhật module router tại `/[module]` tự động điều hướng slug `doanh-nghiep-dmst` sang `/enterprises` thay vì hiển thị trang tĩnh giữ chỗ.
- [x] **T-02.27** `[INT]` Xác thực kiểm thử build Next.js 15 và đối soát đồng bộ dữ liệu hồ sơ Doanh nghiệp với backend REST API V1.

---

### Phase 6: Delta CR-2026-010 — Nâng Cấp Toàn Diện Danh Bạ 34 Tỉnh Thành Trọng Điểm, Icon Nhận Diện & Thông Tin Cốt Lõi [BE][FE][INT][TEST]
- [x] **T-02.28** `[CONTRACT]` Mở rộng `EnterprisePublicDirectoryItemDto` bổ sung `OwnershipType`, `OperatingZone`, `HasRdUnit`, `IsExporting`, `InValueChain`, `TopBottlenecks`, `SupportNeeds`.
- [x] **T-02.29** `[BE]` Cập nhật `EnterpriseService.GetPublicDirectoryAsync` trích xuất các trường cốt lõi từ bảng `enterprises` và parse JSONB `demand_surveys`.
- [x] **T-02.30** `[BE]` Nâng cấp `EfEnterpriseRepository.SearchAsync`: Sửa lỗi alias địa bàn `Hồ Chí Minh`/`TPHCM`, `Huế`, `Đắk Lắk`, chuẩn hóa Unicode `Hà Nội`, mapping thông minh `SectorCode` sang từ khóa ngành TT17, hỗ trợ `VERY_HIGH` trong TNI, và hỗ trợ tham số sắp xếp `SortBy`.
- [x] **T-02.31** `[FE]` Cập nhật SDK `enterprise-client.ts`: Mở rộng interface `EnterpriseDirectoryItem` và hàm `fetchEnterprises` hỗ trợ tham số `sort`.
- [x] **T-02.32** `[FE]` Tích hợp danh mục chuẩn **34 Tỉnh/Thành phố Trọng Điểm** (`PROVINCES_34`) thay thế mảng hardcoded cũ trong `enterprises/page.tsx`.
- [x] **T-02.33** `[FE]` Xây dựng Control Sắp xếp (Sorting dropdown) và sửa triệt để nút "Đặt lại bộ lọc" đồng bộ `q` trong `enterprises/page.tsx`.
- [x] **T-02.34** `[FE]` Viết lại thuật toán phân trang động (Dynamic Pagination) hỗ trợ trang đầu, trang cuối, window $\pm 1$ và dấu chấm lửng `...`.
- [x] **T-02.35** `[FE]` Xây dựng component `EnterpriseAvatar`: Tự động render Logo hoặc Tech Avatar Badge bo góc (chữ cái đầu + icon ngành công nghệ trên nền gradient).
- [x] **T-02.36** `[FE]` Thiết kế lại Card Doanh nghiệp chuẩn 5 tầng Thông tin cốt lõi (Identity, Geo/Sector, R&D/IP/Chuỗi giá trị, TNI Tag nhu cầu, Action CTAs).
- [x] **T-02.37** `[FE]` Triệt tiêu Zero-Mock tại Modal "Kết Nối Hợp Tác": Lưu trữ yêu cầu kết nối thật sự với phản hồi minh bạch thay thế `setTimeout 2000ms`.
- [x] **T-02.38** `[TEST]` Kiểm thử hồi quy 100% Backend & Frontend, kiểm thử thực tế các bộ lọc 34 tỉnh và ngành TT17 qua `curl` và browser.

---

## Giai đoạn 5: Delta v3 — Triển Khai Bộ Tiêu Chí ĐMST 8 Nhóm & Radar Chart

- [x] **T-02.39** `[CONTRACT]` Định nghĩa bộ DTOs Đánh giá ĐMST (`InnovationEvaluationDto`, `InnovationGroupScoreDto`, `InnovationCriteriaDetailDto`, `RadarAxisDto`) trong `modules/enterprise/Application/Contracts.cs`.
- [x] **T-02.40** `[BE]` Xây dựng Domain Entity `EnterpriseInnovationEvaluation` và cấu hình Fluent API mapping trong `EnterpriseConfiguration.cs` (Schema `enterprise.innovation_evaluations`, non-destructive).
- [x] **T-02.41** `[BE]` Tạo EF Core Migration phi phá hủy bổ sung bảng `enterprise.innovation_evaluations` và các indexes B-Tree / GIN.
- [x] **T-02.42** `[BE]` Xây dựng service `InnovationRatingEngine`: Hiện thực hóa thuật toán chấm điểm 8 nhóm / 37 tiêu chí từ mảng dữ liệu `survey_answers` JSONB (C11–C36) và hồ sơ doanh nghiệp.
- [x] **T-02.43** `[BE]` Cập nhật `IEnterpriseRepository` & `EfEnterpriseRepository`: Bổ sung phương thức truy vấn và lưu trữ lịch sử đánh giá ĐMST theo `tax_code` và `evaluation_year`.
- [x] **T-02.44** `[BE]` Xây dựng API Endpoint `GET /api/v1/enterprises/{taxCode}/innovation-rating` trong `EnterpriseController` và xử lý tại `EnterpriseService`, tích hợp bảo vệ dữ liệu nhạy cảm PDPD Masking (`BR-02-011`) và Scoped RBAC.
- [x] **T-02.45** `[BE]` Xây dựng Data Seeder / API tính toán tự động nạp điểm ĐMST kỳ 2024 cho 304 Doanh nghiệp thực tế có trong CSDL từ dữ liệu khảo sát C11–C36.
- [x] **T-02.46** `[FE]` Cập nhật client SDK `enterprise-client.ts`: Bổ sung interface `InnovationEvaluation` và hàm gọi API `fetchInnovationRating(taxCode)`.
- [x] **T-02.47** `[FE]` Xây dựng Component `RadarChart` 8 trục độc lập bằng SVG Canvas thuần (không phụ thuộc thư viện nặng ngoài, hỗ trợ responsive, grid đa giác đều, polygon điểm số, và hover tooltip).
- [x] **T-02.48** `[FE]` Tích hợp Tab "Năng Lực ĐMST" tại trang Hồ sơ chi tiết `/enterprises/[taxCode]`: Hiển thị Biểu đồ Radar Chart 8 trục, Thẻ Tổng điểm & Huy hiệu phân tầng (Vàng/Bạc/Đồng), Bảng ma trận 8 nhóm tiêu chí.
- [x] **T-02.49** `[FE]` Nâng cấp trang Danh bạ `/doanh-nghiep-dmst` và `/enterprises`: Bổ sung Dropdown bộ lọc mức ĐMST (Dẫn đầu / Đang phát triển / Tiềm năng / Chưa đánh giá) và hiển thị nhãn Huy hiệu ĐMST trên từng thẻ Card doanh nghiệp.
- [x] **T-02.50** `[TEST]` Viết bộ Unit Invariant Tests cho `InnovationRatingEngine`: Kiểm thử độc lập công thức quy đổi điểm 8 nhóm (QT1..QT4, CN1..CN5, SP1..SP5, IP1..IP3, S1..S5, TT1..TT6, NL1..NL3, LK1..LK6), phân tầng điểm (ngưỡng 75, 50), và trường hợp `UNRATED`.
- [ ] **T-02.51** `[TEST]` Viết kịch bản kiểm thử E2E Playwright: Xác thực hiển thị Tab Năng Lực ĐMST, Biểu đồ Radar Chart 8 trục và tương tác lọc danh bạ theo mức ĐMST tại `/doanh-nghiep-dmst`.


