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

---

### Phase 5: Hợp Đồng & Backend Governance Thẩm Định Cấp Sở [BE][CONTRACT]
- [x] T-04.17 [CONTRACT] Mở rộng `CreateSellerOfferDto` và `SellerOfferDto` bổ sung `managingAuthorityId`, `managingAuthorityName`, `scopeType`, `scopeId`, `legalConsent`.
- [x] T-04.18 [BE] Cập nhật `TechnologyOffersController.cs`: bỏ auto-approve `Status = "APPROVED"`, gán `Status = "PENDING"`, tích hợp gọi `IApprovalService.SubmitRequestAsync` tạo `ApprovalRequest (Type = TECHNOLOGY_OFFER)`.
- [x] T-04.19 [BE] Bổ sung side-effect trong `ApprovalService.cs` & `TechnologyOffersController.cs`: khi duyệt `APPROVE` hồ sơ `TECHNOLOGY_OFFER` thì cập nhật trạng thái Offer thành `APPROVED` và `publishedAt = UtcNow`; khi `REJECT` thì chuyển thành `REJECTED`.
- [x] T-04.20 [BE] Bổ sung logic `REVOKE` hậu kiểm Trung ương theo `BR-SELLER-06` cho Super Admin (`POST /api/v1/portal/seller/technologies/{id}/review`).

---

### Phase 6: Giao Diện Frontend Form Wizard & Workspace Seller [FE]
- [x] T-04.21 [FE] Form Wizard `create/page.tsx`: bổ sung chọn Sở KH&CN tiếp nhận thẩm định (`managingAuthorityId`, `scopeId`) từ danh mục 63 tỉnh/thành và checkbox cam kết pháp lý.
- [x] T-04.22 [FE] Workspace `portal/seller/technologies/page.tsx`: hiển thị tên Sở KH&CN phụ trách thẩm định, huy hiệu `Chờ Sở KH&CN duyệt (PENDING)` thay vì auto-approve, và hiển thị lý do từ chối nếu có.

---

### Phase 7: Cổng Tác Nghiệp Cấp 2 `/gov` & Admin Governance [FE]
- [x] T-04.23 [FE] Cổng `/gov`: hiển thị danh sách hồ sơ công nghệ cần duyệt theo ScopeId địa bàn tỉnh của Cán bộ Sở, xem chi tiết TRL, SHTT và thực hiện ký duyệt (Approve / Reject / Request changes).

---

### Phase 8: Kiểm Thử Toàn Diện & Quality Gate Delta [QC]
- [x] T-04.24 [TEST] Cập nhật Unit test xUnit `SellerOfferRulesValidatorTests.cs` kiểm tra trường Cơ quan quản lý và cam kết pháp lý (18/18 tests pass).
- [x] T-04.25 [TEST] Cập nhật kịch bản Playwright E2E: kiểm thử luồng Doanh nghiệp đăng bán -> hồ sơ chờ duyệt tại Sở KH&CN -> Cán bộ Sở duyệt -> sản phẩm chính thức xuất hiện trên Sàn `/chao-ban-cong-nghe`.

---

### Phase 9: Hoàn Thiện CRUD & Quick Demand Modal (Phương Án 2 PO Approved) [BE][FE][TEST]
- [x] T-04.26 [BE] Bổ sung `UpdateSellerOfferDto` và quy tắc `ValidateUpdate` trong `SellerOfferContracts.cs`.
- [x] T-04.27 [BE] Bổ sung endpoints `PUT /api/v1/portal/seller/technologies/{id}`, `DELETE /api/v1/portal/seller/technologies/{id}`, `POST .../toggle-publish` vào `TechnologyOffersController.cs`.
- [x] T-04.28 [BE] Thực thi quy tắc `BR-SELLER-07`: Tự động chuyển `Status = PENDING` và `PublishedAt = null` khi sửa TRL hoặc SHTT đối với công nghệ có chuyển giao.
- [x] T-04.29 [FE] Xây dựng trang Chỉnh sửa hồ sơ công nghệ `/portal/seller/technologies/[id]/edit` bám sát `wireframe_chinh_sua_ho_so_chao_ban.html`.
- [x] T-04.30 [FE] Liên kết nút Chỉnh sửa tại Workspace Seller `/portal/seller/technologies` sang trang edit.
- [x] T-04.31 [FE] Nâng cấp modal liên hệ tại `/chao-ban-cong-nghe/[id]` thành Quick Demand Modal (1 phút) giải quyết bài toán Cờ 2.
- [x] T-04.32 [TEST] Viết bổ sung Unit test xUnit kiểm chứng `ValidateUpdate` và `BR-SELLER-07` đạt 100% Pass (20/20 tests).

---

### Phase 10: Delta v3 — Chuẩn Hóa Chi Tiết Chào Bán & Loại Bỏ Mock Dữ Liệu [FE][TEST]
- [x] T-04.33 [FE] Loại bỏ bảng thông số sấy thăng hoa tĩnh tại Tab Specs trong `[id]/page.tsx`; chuyển sang kết xuất động thông số kỹ thuật từ `offer` (`offerType`, `unit`, `trlLevel`, `ipStatus`, `ipRegistrationNumber`, `problemSolved`).
- [x] T-04.34 [FE] Sửa lỗi nút Bookmark "Lưu quan tâm" trong `[id]/page.tsx`: toggle state `isBookmarked`, lưu vào localStorage và thông báo Toast.
- [x] T-04.35 [FE] Sửa nút "Chia sẻ": dùng thông báo giao diện (Toast/inline alert) thay cho `window.alert()`.
- [x] T-04.36 [FE] Sửa nút chết "Tải về" trong Tab DataRoom: gắn sự kiện download thật/thông báo tải Teaser thành công; tên tệp DataRoom gắn với mã hồ sơ thật.
- [x] T-04.37 [FE] Hiển thị đúng dữ liệu Đánh giá sàn (`ratingScore`, `reviewCount`) và Đơn vị tính (`unit`) từ PostgreSQL trong Hero Quick Specs.
- [x] T-04.38 [FE] Đấu nối API `POST /api/v1/demands/items` cho Quick Demand Modal khi gửi yêu cầu kết nối, hiển thị mã phiếu nhu cầu khi gửi thành công.
- [x] T-04.39 [TEST] Viết bộ kiểm thử `src/app/chao-ban-cong-nghe/[id]/page.test.tsx` kiểm tra toàn bộ các tương tác: Bookmark, Share, Download DataRoom, Tab Navigation, Modal submit API và hiển thị thông số động.
- [x] T-04.40 [QC] Chạy `tsc --noEmit`, Vitest và `./Agent/scripts/guard-rails.sh` đảm bảo 100% Pass và không có hồi quy.

---

### Phase 11: Delta v4 — Liên Kết Profile Bên Bán (Seller) & Xem Doanh Nghiệp Thường [BE][FE][TEST]
- [x] T-04.41 [BE] Tạo EF Core migration non-destructive bổ sung `EnterpriseTaxCode` và `EnterpriseName` vào entity `SellerTechnologyOffer` và bảng `technology.seller_technology_offers`.
- [x] T-04.42 [BE] Cập nhật `SellerOfferContracts.cs`, `TechnologyService.cs` hỗ trợ `EnterpriseTaxCode`, `EnterpriseName` và bộ lọc query `enterpriseTaxCode`.
- [x] T-04.43 [FE] Cập nhật models `TechnologyOffer` trong `types/technology-offer.ts` và API service `fetchPublicOffers`.
- [x] T-04.44 [FE] Cập nhật `/chao-ban-cong-nghe`: tên đơn vị chào bán trên thẻ công nghệ thành link clickable điều hướng `/enterprises/[taxCode]`.
- [x] T-04.45 [FE] Cập nhật `/chao-ban-cong-nghe/[id]`: bổ sung Card "Đơn vị cung ứng / Doanh nghiệp chào bán" ở sidebar kèm nút CTA "Xem Hồ sơ Năng lực Doanh nghiệp".
- [x] T-04.46 [FE] Cập nhật `/enterprises/[taxCode]`: hỗ trợ hiển thị Doanh nghiệp thường (`SubjectType = 'ENTERPRISE'`) mượt mà, và bổ sung Tab "Sản phẩm & Giải pháp niêm yết" hiển thị các sản phẩm của chính doanh nghiệp.
- [x] T-04.47 [TEST] Cập nhật Unit test backend và kiểm thử tương tác frontend đảm bảo không hồi quy và 100% test suites pass.
