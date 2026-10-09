# Danh Sách Nhiệm Vụ Triển Khai (Implementation Tasks)
# TASK-04: HỒ SƠ CHÀO BÁN SELLER & BỘ LỌC ĐA TẦNG 18 NGÀNH SHTT

> **Mã Epic**: `TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC`  
> **Trạng thái**: ✅ 100% ĐÃ HOÀN THÀNH & QUALITY GATE 4 VERIFIED

---

### Phase 1: Hợp Đồng Giao Tiếp DTO & Contracts [CONTRACT]
- [x] T-04.1 [CONTRACT] Định nghĩa cấu trúc DTOs (`SellerOfferDto`, `CreateSellerOfferDto`) dùng chung cho cả BE và FE.
- [x] T-04.2 [CONTRACT] Chuẩn hóa danh mục 18 nhóm ngành TT17 và thang TRL 1–9.

### Phase 2: Triển Khai Backend .NET Core [BE]
- [x] T-04.3 [BE] Cập nhật / mở rộng Domain Entity & Value Object `IntellectualPropertyInfo` trong `NacenTech.Modules.Technology`.
- [x] T-04.4 [BE] Viết `SellerOfferRulesValidator` thực thi 5 quy tắc nghiệp vụ `BR-SELLER-01` $\rightarrow$ `BR-SELLER-05`.
- [x] T-04.5 [BE] Xây dựng các Endpoint API `/api/v1/technologies` (danh sách công khai, chi tiết, kho seller, đăng mới).
- [x] T-04.6 [BE] Viết bộ Unit Test kiểm thử 100% các quy tắc nghiệp vụ `BR-SELLER-*` đạt 100% Pass (16/16 tests).

### Phase 3: Triển Khai Frontend 4 Màn Hình [FE]
- [x] T-04.7 [FE] Xây dựng Màn 1: Workspace Quản lý Kho Công nghệ Seller (`/portal/seller/technologies`) với KPI và Data Table.
- [x] T-04.8 [FE] Xây dựng Màn 2: Form Wizard Đăng bán Công nghệ (`/portal/seller/technologies/create`) có toggle Bộ tứ SHTT và validation client.
- [x] T-04.9 [FE] Xây dựng Màn 3: Danh sách & Bộ lọc 18 Ngành Công khai (`/chao-ban-cong-nghe`) làm tab chính trên web.
- [x] T-04.10 [FE] Xây dựng Màn 4: Chi tiết Hồ sơ Chào bán Công nghệ (`/chao-ban-cong-nghe/[id]`) hiển thị huy hiệu TRL và IP Quad.
- [x] T-04.11 [FE] Chuẩn hóa 5 UX states (`Loading`, `Empty`, `Error`, `Success`, `Partial`) cho cả 4 màn hình.

### Phase 4: Kiểm Thử Toàn Diện & Nghiệm Thu QC 4 Tầng [QC]
- [x] T-04.12 [QC] **Tầng 1 (Unit Test)**: Kiểm thử bộ quy tắc nghiệp vụ `BR-SELLER-01` $\rightarrow$ `BR-SELLER-05` (16 test cases xUnit Pass).
- [x] T-04.13 [QC] **Tầng 2 (Contract Test)**: Kiểm tra cấu trúc dữ liệu API phản hồi khớp DTO (Pass).
- [x] T-04.14 [QC] **Tầng 3 (Integration Test)**: Kiểm tra luồng tích hợp ghi và đọc dữ liệu công nghệ (Pass).
- [x] T-04.15 [QC] **Tầng 4 (Playwright E2E Visual QA)**: Chạy kịch bản Black-box E2E tự động duyệt qua 4 màn hình trên `http://localhost:3000` (Pass).
- [x] T-04.16 [INT] Cập nhật `specs/ROADMAP.md` và `specs/TRACEABILITY.md` đồng bộ trạng thái Epic.
