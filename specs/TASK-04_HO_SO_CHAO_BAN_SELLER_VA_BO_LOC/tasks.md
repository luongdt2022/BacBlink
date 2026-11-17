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


---

## Giai đoạn 7: Delta v5 — Chuẩn Hóa 10 Điểm Form Chào Bán Seller (T-04.48 đến T-04.65)

### Phase 12: Backend Database Schema & Non-Destructive Migrations [BE]
- [x] T-04.48 [BE] Mở rộng Domain Entity `SellerTechnologyOffer` (Media, Commercial terms) và tạo 2 Entity con `OfferSpecValue`, `OfferDocument` trong `NacenTech.Modules.Technology.Domain`.
- [x] T-04.49 [BE] Cấu hình EF Core `Configurations.cs` và tạo Migration non-destructive `AddDeltaV5SellerOfferSpecsAndDocuments` cho 2 bảng `technology.offer_spec_values`, `technology.offer_documents` và các cột mở rộng trong `technology.seller_technology_offers`.

### Phase 13: Backend Contracts, DTOs & Two-Tier Validation [BE]
- [x] T-04.50 [BE] Mở rộng bộ DTOs trong `SellerOfferContracts.cs`: `OfferSpecValueDto`, `OfferDocumentDto`, cập nhật `CreateSellerOfferDto`, `UpdateSellerOfferDto`, `SellerOfferDto` hỗ trợ mảng specs, documents, media và commercial terms.
- [x] T-04.51 [BE] Tách biệt logic thẩm định trong `SellerOfferRulesValidator`: phương thức `ValidateDraft` (khi status = DRAFT chỉ yêu cầu Title $\ge 3$ ký tự theo `BR-SELLER-08`) và `ValidatePublish` (kiểm tra đầy đủ `BR-SELLER-01` $\rightarrow$ `BR-SELLER-11`, TRL 1-9, tài liệu an toàn, spec tối đa 50 dòng, cam kết pháp lý).
- [x] T-04.52 [BE] Nâng cấp `TechnologyOffersController.cs` tiếp nhận action `SAVE_DRAFT` và `SUBMIT_FOR_REVIEW`, đồng bộ `OffersStore` và PostgreSQL, cascade lưu trữ `OfferSpecValues` và `OfferDocuments`.
- [x] T-04.53 [BE] Xây dựng AI Extractor endpoint `POST /api/v1/ai/extract-patent-specs` theo `DD-02-ai-extractor-contracts.md` và `PO-DEC-20261008-07` (Human-in-the-Loop, Zero-dependency Fallback).

### Phase 14: Frontend Core Components & UI Sub-modules [FE]
- [x] T-04.54 [FE] Cập nhật TypeScript models trong `src/types/technology-offer.ts` và API service `src/services/api/technology-offer.ts` hỗ trợ DTOs Delta v5 và endpoint AI Extractor.
- [x] T-04.55 [FE] Xây dựng component `FormStepper.tsx` hiển thị tiến trình 4 bước chuyên sâu (Bước 1: Cơ bản, Bước 2: Specs 18 ngành, Bước 3: Giá & Thương mại, Bước 4: Minh chứng SHTT/TRL & Quản trị duyệt).
- [x] T-04.56 [FE] Xây dựng component `DynamicSpecTable.tsx` nạp bộ mẫu theo 18 ngành TT17, thêm/xóa dòng, sửa spec_name, spec_value, unit, chống trùng lặp.
- [x] T-04.57 [FE] Xây dựng component `TrlSelectorGrid.tsx` với dải 9 nút TRL 1-9 chuẩn hóa, 3 dải màu trực quan (R&D, Thử nghiệm, Thương mại) kèm tooltip nghiệp vụ.
- [x] T-04.58 [FE] Xây dựng component `MediaUploadSection.tsx` hỗ trợ tải ảnh đại diện 16:9, album ảnh chi tiết, brochure PDF, video demo kèm xem trước trực quan.
- [x] T-04.59 [FE] Xây dựng component `EvidenceDocumentSection.tsx` quản lý tệp minh chứng DataRoom, phân quyền `access_scope` (PUBLIC, AFTER_CONNECTION, ADMIN_ONLY).
- [x] T-04.60 [FE] Xây dựng component `AiScanAssistantCard.tsx` (Widget Trợ lý AI Khảo sát & Gợi ý) kết nối API AI, tự động đổ bản nháp vào Form Wizard kèm nhãn `✨ AI Gợi ý`.

### Phase 15: Frontend Form Wizard Pages & Surface Integration [FE]
- [x] T-04.61 [FE] Tái cấu trúc toàn diện trang Đăng mới `/portal/seller/technologies/create/page.tsx` thành Form Wizard 4 bước tích hợp 10 điểm cải tiến, nút "Lưu nháp" và LocalStorage auto-save.
- [x] T-04.62 [FE] Tái cấu trúc trang Chỉnh sửa `/portal/seller/technologies/[id]/edit/page.tsx` đồng bộ Form Wizard 4 bước và nạp dữ liệu cũ đầy đủ.
- [x] T-04.63 [FE] Cập nhật trang Chi tiết `/chao-ban-cong-nghe/[id]/page.tsx` kết xuất thông số kỹ thuật động từ `offer_spec_values`, tệp DataRoom kèm khóa bảo mật từ `offer_documents`, điều kiện thương mại và đầu mối TTO có PDPD masking.

### Phase 16: Automated Quality Assurance & Gate 2/3 Verification [TEST][INT]
- [x] T-04.64 [TEST] Cập nhật và bổ sung Unit Test Backend xUnit `SellerOfferRulesValidatorTests.cs` kiểm tra 100% kịch bản `ValidateDraft`, `ValidatePublish`, TRL 1-9, specs max 50 dòng, duplicate specs, documents an toàn.
- [x] T-04.65 [INT] Thực hiện kiểm thử tích hợp, kiểm tra hồi quy toàn diện qua `Agent/scripts/guard-rails.sh` và đối soát tính nhất quán 3 chiều Gate 2 (speckit-analyze).

---

## Giai đoạn 8: Delta v6 — Tái Cấu Trúc Form Chào Bán Seller 4 Bước Chuẩn Wireframe Gốc & 18 Ngành Excel Master (T-04.66 đến T-04.86)

### Phase 17: Backend Database Migration, Entities & Fast-Track Contracts [BE]
- [x] T-04.66 [BE] Tạo EF Core Migration `AddDeltaV6SellerOfferTier2Tier4AndSpecCategory` bổ sung các cột Lớp 2 (`model_code`, `manufacturer`, `origin_country`, `equipment_status`, `manufacturing_year`, `capacity_scale`, `energy_consumption`, `automation_level`, `operating_principle`, `deployment_conditions`), Lớp 4 (`transfer_priority_method`, `price_includes`, `tax_and_extra_costs`, `technical_support_method`), Pháp lý (`ip_issue_date`, `legal_commitment_confirmed`) vào `technology.seller_technology_offers`; cột `spec_category` vào `technology.offer_spec_values`; và cột `access_scope` vào `technology.offer_documents`.
- [x] T-04.67 [BE] Mở rộng Domain Entity `SellerTechnologyOffer.cs`, `OfferSpecValue.cs`, `OfferDocument.cs` với các trường Lớp 2, Lớp 4, phương thức `UpdateTier2Details`, `UpdateTier4Commercial`, và các Value Objects liên quan.
- [x] T-04.68 [BE] Cập nhật Contracts & DTOs trong `SellerOfferContracts.cs`: Chuẩn hóa `CreateUpdateTechnologyOfferDto`, `OfferSpecValueDto` (bổ sung `specCategory`), `OfferDocumentDto` (bổ sung `accessScope`), `SellerOfferDetailDto`.
- [x] T-04.69 [BE] Nâng cấp `SellerOfferRulesValidator.cs` với 3 chế độ thẩm định tách biệt:
  * `ValidateDraft`: Nới lỏng, chỉ yêu cầu Title $\ge 3$ ký tự (`BR-SELLER-08`).
  * `ValidateFastTrackStep1`: Kiểm tra nghiêm ngặt 6 trường lõi + Cụm giá + Bắt buộc TRL 1-9 khi `has_tech_transfer = true` (`BR-SELLER-08`, `BR-SELLER-09`), cho phép Bước 2, 3, 4 rỗng.
  * `ValidateFull4Steps`: Kiểm tra toàn diện khi nộp từ Bước 4, rà soát cam kết pháp lý, định dạng tài liệu DataRoom và chống trùng lặp tên thông số kỹ thuật.
- [x] T-04.70 [BE] Nâng cấp `TechnologyOffersController.cs` tiếp nhận action `SAVE_DRAFT` và `SUBMIT_FOR_REVIEW`. Khi nộp nhanh từ Bước 1, tự động kế thừa `scope_id` từ Doanh nghiệp liên kết (`TASK-02`) nếu chưa chọn ở Bước 4, chuyển trạng thái `PENDING` và tạo `ApprovalRequest` gửi Sở KH&CN.

### Phase 18: Frontend Bước 1 Chuẩn Wireframe Gốc & Fast-Track Submission [FE]
- [x] T-04.71 [FE] Xây dựng component `Step1CoreFields.tsx`: 6 trường lõi (`offerType`, `sectorCode`, `hasTechTransfer`, `title`, `shortDescription`, `problemSolved`) kèm `SearchableCombobox` 18 ngành tiếng Việt trực quan, ẩn tiền tố mã `LV..` (`REQ-04-011`, `UI-04-021`, `AC-04-022`).
- [x] T-04.72 [FE] Xây dựng component `SellerIdentityCard.tsx`: Tự động nạp thông tin Doanh nghiệp liên kết từ phiên làm việc (`TASK-02`) gồm Tên DN, Người liên hệ, SĐT, Email; hiển thị ghi chú bảo vệ dữ liệu PDPD NĐ 13/2023 (`REQ-04-012`, `BR-SELLER-14`, `AC-04-023`).
- [x] T-04.73 [FE] Xây dựng component `InlinePricingCard.tsx`: Nhúng trực tiếp vào Bước 1 theo Wireframe gốc (`REQ-04-013`, `UI-04-023`), hỗ trợ 3 hình thức (Giá cụ thể, Khoảng giá, Liên hệ báo giá) kèm dropdown VND/USD và đơn vị tính gợi ý.
- [x] T-04.74 [FE] Xây dựng component `ReactiveYellowTrlPanel.tsx`: Khung TRL màu vàng reactive bo góc viền vàng hổ phách `border-amber-300 bg-amber-50`, bung mở mượt mà khi `has_tech_transfer = true`, grid 9 nấc TRL kèm tooltip giải nghĩa (`REQ-04-014`, `BR-SELLER-09`, `UI-04-022`, `AC-04-021`).
- [x] T-04.75 [FE] Cập nhật `FormStepper.tsx` & Action Bar: Hiển thị bộ đếm tiến trình `Đã điền X / 6` tại Bước 1, nhãn *(Tùy chọn)* tại Bước 2, 3, 4; nút "Gửi chờ duyệt" lập tức khả dụng khi Bước 1 hợp lệ; tích hợp `FastTrackSubmitModal.tsx` xác nhận cam kết pháp lý trong 1 click (`REQ-04-010`, `BR-SELLER-08`, `UI-04-020`, `AC-04-020`).

### Phase 19: Frontend Bước 2 & Bước 3 Lớp 2, Lớp 3, Lớp 4 [FE]
- [x] T-04.76 [FE] Xây dựng component `Tier2CommonTechnicalForm.tsx`: Render nhóm trường Lớp 2 kỹ thuật chung dựa theo `offerType` (8 trường vật lý thiết bị nếu là TB/SP vs 3 trường giải pháp số nếu là Giải pháp) (`REQ-04-015`, `BR-SELLER-10`, `UI-04-024`, `AC-04-024`).
- [x] T-04.77 [FE] Xây dựng component `Tier3SectorDynamicForm.tsx`: Tự động đọc và kết xuất danh mục trường thông số kỹ thuật chuẩn của 18 ngành từ Sheet `Bo_loc_Cban` theo ngành đã chọn; hiển thị modal xác nhận chuyển đổi ngành (`REQ-04-016`, `BR-SELLER-11`, `UI-04-024`, `AC-04-025`).
- [x] T-04.78 [FE] Xây dựng component `DynamicSpecKeyValueTable.tsx`: Bảng thông số tự do (+ Thêm mới, tên, giá trị, đơn vị, nút xóa); gán `specCategory = 'TIER_3_CUSTOM'`, giới hạn tối đa 50 dòng, chống trùng tên (`REQ-04-017`, `UI-04-024`, `AC-04-026`).
- [x] T-04.79 [FE] Xây dựng component `Tier4CommercialForm.tsx`: Bố cục 2 cột hiển thị đầy đủ các điều kiện thương mại và chuyển giao Lớp 4 Excel Master (KT-66, GIA-74, GIA-75, GIA-76, GIA-77, GIA-78, GIA-80, GIA-81) (`REQ-04-018`, `BR-SELLER-12`, `UI-04-025`, `AC-04-027`).

### Phase 20: Frontend Bước 4 Pháp Lý SHTT, DataRoom 3 Cấp & Tích Hợp Wizard [FE]
- [x] T-04.80 [FE] Xây dựng component `IpQuadDigitizationCard.tsx`: Khai báo hồ sơ bộ tứ SHTT số hóa (Tình trạng văn bằng, Số hiệu văn bằng/đơn, Ngày cấp/nộp, Tải tệp scan bằng sáng chế) (`REQ-04-019`, `BR-SELLER-13`, `UI-04-026`).
- [x] T-04.81 [FE] Xây dựng component `DataRoomFileManager.tsx`: Quản lý tài liệu minh chứng đa phương tiện (Catalogue, Báo cáo kiểm định, Hợp đồng, Video) kèm cấu hình quyền DataRoom 3 cấp độ (PUBLIC, AFTER_CONNECTION, ADMIN_ONLY) (`REQ-04-020`, `BR-SELLER-13`, `AC-04-028`).
- [x] T-04.82 [FE] Tích hợp toàn diện trang Đăng mới `/portal/seller/technologies/create/page.tsx` và Chỉnh sửa `/portal/seller/technologies/[id]/edit/page.tsx` khớp 100% Wireframe gốc.
- [x] T-04.83 [FE] Nâng cấp Widget Trợ lý AI `AiAssistantCard.tsx` (OCR/Voice) và Quản lý nháp `DraftManager.tsx` (LocalStorage resilience tự động lưu 30s) (`REQ-04-022`, `AC-04-029`).

### Phase 21: Kiểm Thử Toàn Diện & Verification Code [TEST][QC]
- [x] T-04.84 [TEST] Unit tests xUnit `SellerOfferRulesValidatorTests.cs`: Kiểm thử toàn diện 3 chế độ validation (`ValidateDraft`, `ValidateFastTrackStep1`, `ValidateFull4Steps`), kiểm tra tính ràng buộc của TRL, ngăn chặn trùng lặp thông số, giới hạn 50 spec, PDPD mask (37 test cases đạt 100% Pass).
- [x] T-04.85 [TEST] API & Integration tests: Kiểm thử endpoint `POST /api/v1/portal/seller/technologies` với Fast-Track payload (chỉ có Bước 1) trả về `200 OK`, tự gán `scope_id`, lưu DB trạng thái `PENDING`; và kiểm thử Full 4-step payload lưu đầy đủ Lớp 2, Lớp 3, Lớp 4.
- [x] T-04.86 [TEST] E2E Playwright tests & Direct DB Verification (`tests/qc_gate4_delta_v6_verification.py` - 15/15 Pass):
  * Kịch bản 1: Luồng Fast-track nộp ngay từ Bước 1 hoàn thành dưới 60 giây, nạp Seller TÂN TIẾN, PDPD mask, tự gán scope VN-HN, trạng thái PENDING.
  * Kịch bản 2: Luồng tương tác reactive Khung TRL màu vàng (mở/đóng theo switch chuyển giao), kiểm tra BR-SELLER-09 chặn 400 Bad Request.
  * Kịch bản 3: Luồng hoàn thiện tuần tự 4 bước nạp đúng thông số ngành Cơ khí (TIER_3_SECTOR), custom spec (TIER_3_CUSTOM), thương mại Lớp 4 và DataRoom 3 cấp quyền.

---

## Giai đoạn 9: Delta v7 — Nâng Cấp Trực Quan Thị Giác & Ngữ Nghĩa Card Chào Bán Công Nghệ (T-04.87 đến T-04.91)

### Phase 22: Refactor Layout & Trực Quan Hóa Card Chào Bán [FE]
- [x] T-04.87 [FE] Tái cấu trúc DOM Layout và Thumbnail Overlay của Card chào bán trong `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.tsx` (`REQ-DELTA-01`, `BR-OFFER-CARD-01`, `UI-CARD-01`, `AC-04-031`, `AC-04-032`):
  * Dời mã hồ sơ `offerCode` khỏi góc trên thumbnail.
  * Thêm nhãn caption định danh `Mã: {offer.offerCode}` ngay phía trên tiêu đề bài viết với font monospace và icon Tag.
  * Góc trên bên trái thumbnail: Hiển thị badge Giá trị Thương mại (`"Sẵn sàng chuyển giao"` màu xanh ngọc Emerald kèm icon Sparkles khi `hasTechTransfer = true`, hoặc `"Thương phẩm sẵn có"` màu Slate khi `hasTechTransfer = false`).
  * Góc trên bên phải thumbnail: Hiển thị badge Loại hình chào bán (`offerTypeLabel`).

- [x] T-04.88 [FE] Nâng cấp Khối Pháp Lý SHTT & Ngữ Nghĩa Xác Thực Cục SHTT trong `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.tsx` (`REQ-DELTA-02`, `BR-OFFER-CARD-01`, `UI-CARD-01`, `AC-04-033`):
  * Bổ sung nhãn ngữ nghĩa `"Số bằng SHTT:"` đứng trước mã số văn bằng `ipRegistrationNumber`.
  * Bổ sung Huy hiệu bảo chứng `"Xác thực Cục SHTT"` (`CheckCircle2` icon, tone xanh ngọc `bg-emerald-100 text-emerald-800 border-emerald-300`) khi hồ sơ có văn bằng SHTT hoặc `ipStatus = 'PATENT_GRANTED'` / `'UTILITY_MODEL'`.

### Phase 23: Kiểm Thử Đơn Vị, Tương Tác & Quality Gate [TEST][GATE]
- [x] T-04.89 [TEST] Cập nhật và bổ sung bộ kiểm thử Unit/Component trong `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.test.tsx` (`AC-04-031`, `AC-04-032`, `AC-04-033`):
  * Kiểm tra hiển thị caption `Mã: OFF-202610-LV16-08`.
  * Kiểm tra badge `"Sẵn sàng chuyển giao"` và `"Thương phẩm sẵn có"`.
  * Kiểm tra nhãn `"Số bằng SHTT:"` và Huy hiệu `"Xác thực Cục SHTT"`.
- [x] T-04.90 [GATE] Kiểm tra tính nhất quán đối kháng Gate 2 (`speckit-analyze` / cross-artifact consistency) giữa `spec.md`, `plan.md`, `tasks.md`, đảm bảo 100% khớp các mã `REQ-DELTA-*`, `BR-OFFER-CARD-01`, `UI-CARD-01`, `AC-04-031..034` và không phát sinh mã mồ côi.
- [x] T-04.91 [GATE] Kiểm tra TypeScript compiler (`tsc --noEmit`), chạy toàn bộ test suite (`npm test`) và kiểm tra visual responsive không vỡ khung (`AC-04-034`).

---

## Giai đoạn 10: Delta v8 — Tinh Gọn Diện Mạo Trực Quan & Tối Ưu Hóa Chiều Cao Card Chào Bán Công Nghệ (T-04.92 đến T-04.95)

### Phase 24: Refactor Ultra-compact Card & Trực Quan Hóa Tinh Gọn [FE]
- [x] T-04.92 [FE] Tái cấu trúc Thumbnail Overlay & Thu nhỏ Mã hồ sơ trong `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.tsx` (`REQ-DELTA-03`, `REQ-DELTA-06`, `BR-OFFER-CARD-02`, `UI-CARD-02`, `AC-04-035`, `AC-04-037`):
  * Xóa bỏ hoàn toàn badge góc trên bên trái ảnh Thumbnail ("Sẵn sàng chuyển giao" và "Thương phẩm sẵn có").
  * Giữ duy nhất 01 badge góc trên bên phải hiển thị loại hình chào bán (`offerTypeLabel`).
  * Thu nhỏ mã hồ sơ `offerCode` (`text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase`), loại bỏ icon Tag, nén khoảng cách lề `mb-0.5`.

- [x] T-04.93 [FE] Tối ưu hóa Khối SHTT Đơn Dòng & Thu Gọn Padding Thẻ trong `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.tsx` (`REQ-DELTA-04`, `REQ-DELTA-05`, `BR-OFFER-CARD-02`, `UI-CARD-02`, `AC-04-035`, `AC-04-036`):
  * Xóa bỏ hoàn toàn huy hiệu "Xác thực Cục SHTT".
  * Gom khối SHTT thành đúng 1 dòng duy nhất: `[ShieldCheck]` + Tên trạng thái bảo hộ + `• Số: {ipRegistrationNumber}` kèm thuộc tính `truncate` bảo vệ layout.
  * Tinh gọn Đơn vị chào bán thành 1 dòng thanh mảnh với MST / Tên đơn vị.
  * Rút bớt padding thân thẻ từ `p-4 sm:p-5` xuống `p-3.5 sm:p-4`, khoảng cách `space-y-2` đến `space-y-2.5`, giảm chiều cao thẻ ~40-50px.

### Phase 25: Kiểm Thử Đơn Vị, Tương Tác & Quality Gate [TEST][GATE]
- [x] T-04.94 [TEST] Cập nhật bộ kiểm thử Unit/Component trong `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.test.tsx` (`AC-04-035`, `AC-04-036`, `AC-04-037`):
  * Thẩm định phủ định (Negative Assertion): `queryByText("Sẵn sàng chuyển giao")`, `queryByText("Thương phẩm sẵn có")`, `queryByText("Xác thực Cục SHTT")` đều trả về `null`.
  * Thẩm định cấu trúc đơn dòng: Kiểm tra số văn bằng kèm tiền tố `• Số:` trong cùng khối SHTT.
  * Thẩm định mã hồ sơ: Kiểm tra hiển thị mã hồ sơ tinh gọn.
- [x] T-04.95 [GATE] Thẩm định chất lượng toán học tĩnh & Hội tụ:
  * TypeScript compiler (`tsc --noEmit`) đạt 0 lỗi type.
  * Chạy test suite `npm test` đạt 100% Pass.
  * Đối soát đối kháng `speckit-analyze` Gate 2 đảm bảo 100% nhất quán `REQ-DELTA-03..06` $\leftrightarrow$ `BR-OFFER-CARD-02` $\leftrightarrow$ `UI-CARD-02` $\leftrightarrow$ `AC-04-035..037` $\leftrightarrow$ `T-04.92..95`.




- [x] `TASK-04-CR96` **[CR]** [P1] (Người gửi: Lượng) Mở thông tin chi tiết doanh nghiệp — Khi vào chi tiết 1 sản phẩm cháo bán, nhìn thấy thông tin DN bán sản phẩm, click vào doanh nghiệp thì mở ra trang chi tiết DN



---

## Giai đoạn 11: Delta v9 — Chuẩn Hóa Hiển Thị Trung Thực Theo CSDL (Zero-Mock DataRoom & Dynamic Specs) (T-04.97 đến T-04.102)

### Phase 26: Xây Dựng Component DataRoomEmptyState & Triệt Phá Mock DataRoom [FE]
- [x] T-04.97 [FE] Triệt phá mảng mock 3 file PDF ảo trong Tab DataRoom của `SourceCode/frontend/src/app/chao-ban-cong-nghe/[id]/page.tsx` và xây dựng component/khối hiển thị `DataRoomEmptyState` (`REQ-DELTA-07`, `BR-OFFER-DATAROOM-01`, `UI-DELTA-04-03`, `AC-04-038`):
  * Xóa bỏ hoàn toàn mảng tĩnh chứa 3 file PDF giả lập (`${offerCode}_Teaser_Tom_Tat_Giai_Phap.pdf`, `${offerCode}_Ho_So_SHTT_...pdf`, `${offerCode}_Ket_Qua_Kiem_Dinh_TRL...pdf`).
  * Xây dựng giao diện Empty State chuẩn UX khi `offer.documents` rỗng (`[]`) hoặc `null`: Icon `FolderSearch`, tiêu đề *"Chưa có tài liệu công khai trong DataRoom"*, mô tả hướng dẫn và nút CTA *"Yêu cầu tài liệu qua Kết nối chuyển giao"* kích hoạt mở `ConnectOfferModal`.
  * Đảm bảo khi có tài liệu thật từ CSDL, danh sách tệp đính kèm được hiển thị trung thực 1:1 theo `accessScope` (PUBLIC, AFTER_CONNECTION, ADMIN_ONLY).

### Phase 27: Chuẩn Hóa Hiển Thị TRL, SHTT & Quy Cách Đơn Vị Động Theo CSDL [FE]
- [x] T-04.98 [FE] Xóa bỏ toàn bộ fallback TRL tĩnh (`offer.trlLevel || 7`, `offer.trlLevel || 8`), chuẩn hóa hiển thị TRL theo CSDL tại Header Badges, IP Quad và Bảng Thông số kỹ thuật (`REQ-DELTA-08`, `BR-OFFER-SPECS-01`, `UI-DELTA-04-04`, `AC-04-039`):
  * Tại Header Badges (dòng 400–404): Chỉ hiển thị badge TRL khi `offer.hasTechTransfer === true` VÀ có `offer.trlLevel > 0`. Nếu không có chuyển giao hoặc không có TRL, ẩn hoàn toàn badge TRL.
  * Tại Khối IP Quad (dòng 570): Bỏ fallback `TRL {offer.trlLevel || 8}/9`, hiển thị `TRL {offer.trlLevel}/9` khi có chỉ số, hoặc `"Không áp dụng TRL"` khi không có.
  * Tại Bảng Thông số kỹ thuật (dòng 766): Kiểm tra điều kiện: Nếu `offer.hasTechTransfer && offer.trlLevel` hiển thị `TRL {offer.trlLevel}/9 — {getTrlDescription(offer.trlLevel)}`; ngược lại hiển thị rõ *"Hàng hóa thương mại / Không áp dụng TRL"*.

- [x] T-04.99 [FE] Chuẩn hóa hiển thị Pháp lý SHTT trung thực, xóa bỏ tự xưng "Đã thẩm định" khống trên Quick Specs và Bảng Thông số kỹ thuật (`REQ-DELTA-09`, `BR-OFFER-IP-01`, `UI-DELTA-04-04`, `AC-04-040`):
  * Tại Quick Specs Metadata Bar (dòng 475): Xóa bỏ fallback `"Đã thẩm định"`. Nếu có số văn bằng hiển thị `offer.ipRegistrationNumber`; nếu không có số văn bằng hiển thị `"Chưa đăng ký"` (hoặc `"Bí quyết KD"` khi `ipStatus === 'TRADE_SECRET'`).
  * Tại Header Badges SHTT (dòng 405–416): Xóa bỏ nhãn `"Bản quyền & SHTT hợp pháp"` khi `ipStatus` là `NONE` hoặc chưa đăng ký, thay bằng `"Chưa đăng ký SHTT"`.
  * Tại Bảng Thông số kỹ thuật (dòng 778–786): Nếu không có `offer.ipRegistrationNumber`, xóa bỏ dòng chữ `"Đã thẩm định hồ sơ SHTT hợp pháp"`, thay bằng thông điệp trung thực: *"Chưa đăng ký bảo hộ SHTT hoặc là bí quyết kinh doanh"*.

- [x] T-04.100 [FE] Chuẩn hóa trường Quy cách & Đơn vị: Hiển thị nguyên văn `offer.unit`, fallback trung tính "Đang cập nhật quy cách", xóa bỏ chuỗi sai ngữ cảnh gói giải pháp (`REQ-DELTA-10`, `BR-OFFER-SPECS-01`, `UI-DELTA-04-04`, `AC-04-041`):
  * Tại Bảng Thông số kỹ thuật (dòng 772): Xóa bỏ chuỗi fallback `"Theo gói giải pháp chuyển giao và đào tạo tích hợp"`.
  * Hiển thị nguyên văn `offer.unit` do Seller nhập (ví dụ: *"Hộp 500g"*, *"Kg"*, *"Bộ"*).
  * Nếu `offer.unit` là null hoặc rỗng: Hiển thị chuỗi trung tính chuẩn hóa: *"Đang cập nhật quy cách"*.

### Phase 28: Kiểm Thử Toàn Diện Zero-Mock & Quality Gate 2 Thẩm Định [TEST][GATE]
- [x] T-04.101 [TEST] Bổ sung Unit & Integration tests trong `SourceCode/frontend/src/app/chao-ban-cong-nghe/[id]/page.test.tsx` cho 4 kịch bản kiểm thử độc lập ứng với `AC-04-038` đến `AC-04-041`:
  * Kịch bản 1 (AC-04-038): Test render hồ sơ không có documents $\rightarrow$ Khẳng định không có 3 file PDF mock (`queryByText` trả về null), khẳng định render `DataRoomEmptyState` với text *"Chưa có tài liệu công khai trong DataRoom"*.
  * Kịch bản 2 (AC-04-039): Test render hồ sơ nông sản (`hasTechTransfer = false`, `trlLevel = null`) $\rightarrow$ Khẳng định không có chuỗi `"TRL 7/9"` hay `"TRL 8/9"`, khẳng định có text *"Hàng hóa thương mại / Không áp dụng TRL"*.
  * Kịch bản 3 (AC-04-040): Test render hồ sơ không có số văn bằng SHTT $\rightarrow$ Khẳng định không có chữ `"Đã thẩm định"`, khẳng định có text *"Chưa đăng ký bảo hộ SHTT hoặc là bí quyết kinh doanh"*.
  * Kịch bản 4 (AC-04-041): Test render hồ sơ có `unit = null` $\rightarrow$ Khẳng định không có chuỗi *"Theo gói giải pháp chuyển giao và đào tạo tích hợp"*, khẳng định có text *"Đang cập nhật quy cách"*.
- [x] T-04.102 [GATE] Thẩm định chất lượng toán học tĩnh & Hội tụ Gate 2:
  * TypeScript compiler (`tsc --noEmit`) đạt 0 lỗi type.
  * Toàn bộ test suite `npm test` đạt 100% Pass.
  * Đối soát ma trận truy vết khép kín: Đảm bảo 100% các yêu cầu `REQ-DELTA-07` $\rightarrow$ `REQ-DELTA-10`, `BR-OFFER-DATAROOM-01`, `BR-OFFER-SPECS-01`, `BR-OFFER-IP-01`, `UI-DELTA-04-03` $\rightarrow$ `UI-DELTA-04-04`, `AC-04-038` $\rightarrow$ `AC-04-041` được ánh xạ đầy đủ sang các tasks `T-04.97` đến `T-04.102`, không phát sinh nợ kỹ thuật và không có task mồ côi.

---

## Giai đoạn 12: Delta v9 — Định Tuyến Thẩm Định Cấp Tỉnh Thông Minh & Lựa Chọn Đơn Vị Tiếp Nhận Bước 1 (T-04.103 đến T-04.108)

### Phase 29: Mở Rộng Danh Mục Sở KH&CN & Helper Nhận Diện Địa Bàn Thông Minh [FE]
- [x] T-04.103 [FE-01] Mở rộng `PROVINCIAL_AUTHORITIES_CATALOG` trong `SourceCode/frontend/src/services/api/technology-offer.ts` bổ sung `VN-TN` (Sở Khoa học và Công nghệ tỉnh Thái Nguyên) và danh mục 34 tỉnh thành trọng điểm ĐMST (`REQ-DELTA-04-04`, `AC-DELTA-04-04`).
- [x] T-04.104 [FE-02] Xây dựng helper tự động nhận diện địa bàn `resolveDefaultAuthority(userContext, enterpriseProfile)` theo quy tắc ưu tiên 3 cấp `BR-DELTA-04-01` (`REQ-DELTA-04-03`, `AC-DELTA-04-03`).

### Phase 30: Tích Hợp UI Bước 1, FastTrack Modal & Cơ Chế Đồng Bộ 2 Chiều [FE]
- [x] T-04.105 [FE-03] Đưa Searchable Combobox chọn Sở KH&CN tiếp nhận lên Bước 1 (`SellerIdentityCard` / `create/page.tsx` và `[id]/edit/page.tsx`), kèm hiển thị Smart Badge khi tự động nhận diện thành công từ địa chỉ DN (`REQ-DELTA-04-01`, `UI-DELTA-04-01`, `AC-DELTA-04-01`).
- [x] T-04.106 [FE-04] Tích hợp Dropdown/Combobox chọn Sở KH&CN trực tiếp vào `FastTrackSubmitModal.tsx` và binding 2 chiều state giữa Modal, Bước 1 và Bước 4 (`IpQuadDigitizationCard`) (`REQ-DELTA-04-02`, `UI-DELTA-04-02`, `AC-DELTA-04-02`).

### Phase 31: Kiểm Thử Đơn Vị, E2E Black-Box & Quality Gate [TEST][GATE]
- [x] T-04.107 [TEST-01] Cập nhật và bổ sung Unit Test cho FastTrackSubmitModal & logic nhận diện địa bàn Thái Nguyên trong `create/page.test.tsx` (`AC-DELTA-04-01`, `AC-DELTA-04-02`, `AC-DELTA-04-03`).
- [x] T-04.108 [E2E-01] Cập nhật kịch bản E2E Playwright `test_task04_seller_tech_offer_blackbox.py` xác thực chọn Sở KH&CN Thái Nguyên (`VN-TN`) và kiểm tra CSDL PostgreSQL lưu đúng `managing_authority_id = 'VN-TN'` (`AC-DELTA-04-05`).



---

## Giai đoạn 13: Delta v10 — Phân Nhánh Nghiệp Vụ Tường Minh Giữa Sản Phẩm Thương Mại & Công Nghệ Chuyển Giao (T-04.109 đến T-04.114)
*(Ghi chú kiến trúc: Đánh số tuần tự tiếp nối từ T-04.108 của Giai đoạn 12 để bảo đảm tính duy nhất và không gây xung đột định danh trong Ma trận Truy vết TRACEABILITY.md)*

### Phase 32: Khởi Tạo Helper State & Phân Nhánh Header, Badges & Hero CTA [FE]
- [x] T-04.109 [FE] Khởi tạo cờ logic `isCommercialProduct` và phân nhánh Header Badges, Hero CTA Button, Hero Security Note trong `SourceCode/frontend/src/app/chao-ban-cong-nghe/[id]/page.tsx` (`REQ-DELTA-11`, `BR-OFFER-COMMERCIAL-01`, `UI-DELTA-04-05`, `AC-04-042`):
  * Định nghĩa biến logic chuẩn hóa: `const isCommercialProduct = !offer.hasTechTransfer || offer.offerType === 'PRODUCT';`.
  * Phân nhánh Header Badges: Với sản phẩm thương mại hiển thị `"Sản phẩm thương mại"` (hoặc `"Máy móc / Thiết bị thương phẩm"` nếu là `DEVICE`), không dùng nhãn chung chung gây hiểu nhầm.
  * Phân nhánh Hero CTA Button: Khi `isCommercialProduct = true`, hiển thị icon `ShoppingBag` kèm văn bản `"Đặt mua sản phẩm / Kết nối thương mại"`; khi `isCommercialProduct = false`, giữ nguyên `"Đăng ký nhận chuyển giao công nghệ"`.
  * Phân nhánh Hero Security Note: Chuyển đổi thành `"Mở báo giá sỉ, mẫu thử & hợp đồng thương mại trực tiếp từ nhà sản xuất"` đối với sản phẩm thương phẩm.

### Phase 33: Phân Nhánh Toàn Bộ Khu Vực Sidebar & Khối Thông Tin Đầu Mối [FE]
- [x] T-04.110 [FE] Phân nhánh Thẻ Giá Sidebar, Nút CTA Sidebar, Nút Xem Hồ Sơ Chất Lượng & ATTP, và Khối Đầu Mối Kinh Doanh trong `SourceCode/frontend/src/app/chao-ban-cong-nghe/[id]/page.tsx` (`REQ-DELTA-11`, `BR-OFFER-COMMERCIAL-01`, `BR-OFFER-COMMERCIAL-02`, `UI-DELTA-04-05`, `AC-04-043`):
  * Thẻ Giá Sidebar: Đổi tiêu đề thành `"GIÁ BÁN NIÊM YẾT / THƯƠNG MẠI"`, đổi ghi chú dưới giá thành `"Đơn giá tiêu chuẩn theo quy cách sản phẩm / Số lượng đặt hàng"`.
  * Nút CTA Sidebar: Đổi thành `"Đặt Mua Hàng / Yêu Cầu Báo Giá Sỉ"` kèm icon `ShoppingBag`.
  * Nút phụ tài liệu: Đổi từ *"Yêu Cầu Truy Cập DataRoom"* thành `"Xem Hồ Sơ Chất Lượng & ATTP"` kèm icon `ShieldCheck` cho hàng hóa thương mại.
  * Khối Đầu Mối Liên Hệ: Đổi tiêu đề thành `"Đầu Mối Kinh Doanh & Phân Phối"`, vai trò người liên hệ hiển thị `"Phụ trách kinh doanh / Đại lý"`.

### Phase 34: Phân Nhánh Nội Dung Tab 1 & Bảng Thông Số Tab 2 [FE]
- [x] T-04.111 [FE] Phân nhánh Tiêu đề khối mô tả Tab 1 và Tab 2 Thông số kỹ thuật trong `SourceCode/frontend/src/app/chao-ban-cong-nghe/[id]/page.tsx` (`REQ-DELTA-12`, `BR-OFFER-COMMERCIAL-01`, `AC-04-044`):
  * Tab 1 (Tổng quan): Tiêu đề khối mô tả đổi thành `"Công Dụng & Giá Trị Mang Lại Cho Khách Hàng"` đối với sản phẩm thương mại (thay vì *"Bài toán kỹ thuật & Giải pháp"*).
  * Tab 2 (Thông số kỹ thuật):
    - Hàng "Loại hình": Hiển thị `"Sản phẩm thương mại hoàn chỉnh"`.
    - Hàng "Hình thức giao dịch": Hiển thị `"Bán hàng thương phẩm / Hợp đồng cung ứng đại lý"` thay cho các thuật ngữ li-xăng/chuyển nhượng sáng chế.

### Phase 35: Tái Cấu Trúc Modal Kết Nối Cung Cầu Thương Mại & Mở Rộng Bậc Ngân Sách [FE]
- [x] T-04.112 [FE] Tái cấu trúc Modal `ConnectOfferModal`: Phân nhánh tiêu đề, mô tả, danh mục 4 hình thức hợp tác thương mại và các bậc ngân sách nhỏ linh hoạt (`REQ-DELTA-13`, `REQ-DELTA-14`, `BR-OFFER-COMMERCIAL-03`, `UI-DELTA-04-06`, `AC-04-045`):
  * Tiêu đề modal: `"Gửi Đề Xuất Mua Hàng & Kết Nối Cung Ứng (Commercial Order & Supply Request)"`, mô tả: `"Đăng ký nhu cầu mua hàng, yêu cầu mẫu thử hoặc hợp tác phân phối"`.
  * Nhãn trường bài toán: Đổi thành `"Mục đích đặt hàng / Nhu cầu thu mua thương mại"`, placeholder và giá trị khởi tạo phù hợp sản phẩm thương mại.
  * Dropdown "Hình thức hợp tác mong muốn" (`demandMethod`): Phân nhánh 4 tùy chọn thương mại (`PURCHASE_COMMERCIAL`, `SUPPLY_CONTRACT`, `DISTRIBUTION_AGENT`, `SAMPLE_ORDER`) khi `isCommercialProduct = true`.
  * Dropdown "Ngân sách dự kiến" (`demandBudget`): Bổ sung các bậc quy mô thực tế (`UNDER_20M`, `20M_100M`, `100M_500M`, `500M_1B`, `1B_3B`, `OVER_3B`, `CONTACT`), tự động khởi tạo mức phù hợp (`UNDER_20M` hoặc `20M_100M`).
  * Đóng gói payload tương thích ngược: Gắn tiền tố `[Đề xuất thương mại: {Tên hình thức}]` vào `desiredSolution` khi gửi `submitQuickDemand`.

### Phase 36: Kiểm Thử Toàn Diện & Quality Gate 2 Thẩm Định [TEST][GATE]
- [x] T-04.113 [TEST] Bổ sung trọn bộ 5 test cases trong `SourceCode/frontend/src/app/chao-ban-cong-nghe/[id]/page.test.tsx` bao phủ toàn diện `AC-04-042` đến `AC-04-046`:
  * Test Case 1 (AC-04-042): Xác thực Badge loại hình, nút CTA Hero, và cam kết thương mại của sản phẩm thương mại; khẳng định không còn chuỗi *"chuyển giao công nghệ"* trên Hero.
  * Test Case 2 (AC-04-043): Xác thực Sidebar Thẻ Giá, Nút CTA Sidebar, Nút Xem Hồ Sơ Chất Lượng & ATTP, và Khối Đầu Mối Kinh Doanh.
  * Test Case 3 (AC-04-044): Xác thực Tab 1 và Tab 2 hiển thị đúng ngữ cảnh hàng hóa tiêu dùng.
  * Test Case 4 (AC-04-045): Xác thực Modal Kết Nối hiển thị đúng tiêu đề thương mại, danh mục 4 hình thức giao thương và các bậc ngân sách nhỏ.
  * Test Case 5 (AC-04-046 - Zero Regression): Khẳng định hồ sơ công nghệ cao R&D (`hasTechTransfer = true`, `offerType = 'SOLUTION'`) giữ nguyên vẹn 100% ngữ cảnh chuyển giao tri thức chuyên sâu.
- [x] T-04.114 [GATE] Thẩm định chất lượng toán học tĩnh & Hội tụ Gate 2:
  * TypeScript compiler (`tsc --noEmit`) đạt 0 lỗi type.
  * Toàn bộ test suite `npm test` đạt 100% Pass.
  * Đối soát ma trận truy vết khép kín: Đảm bảo 100% các yêu cầu `REQ-DELTA-11` $\rightarrow$ `REQ-DELTA-14`, `BR-OFFER-COMMERCIAL-01` $\rightarrow$ `BR-OFFER-COMMERCIAL-03`, `UI-DELTA-04-05` $\rightarrow$ `UI-DELTA-04-06`, `AC-04-042` $\rightarrow$ `AC-04-046` được ánh xạ đầy đủ sang các tasks `T-04.109` đến `T-04.114`, không phát sinh nợ kỹ thuật và không có task mồ côi.

- [x] `TASK-04-CR115` **[CR]** [P1] (Người gửi: Lượng) Làm rõ 2 button mua hoặc nhận chuyển giao công nghệ — Phân tích ý nghĩa: Hero CTA (Quick Action lướt nhanh) và Sidebar CTA (chốt sau khối báo giá). Đã cải tiến: tự động truyền tham số `defaultMethod` (PURCHASE_COMMERCIAL hoặc TRANSFER), tự động pre-select hình thức giao dịch tương ứng và chuẩn hóa tiêu đề/placeholder modal; 18/18 vitest tests pass 100%. [Đính kèm: ![screenshot_21h22m01_1.png](/static/uploads/TASK-04-CR115_1792678959_1_screenshot_21h22m01_1.png)]


---

## Giai đoạn 14: Delta v11 (CR-2026-010) — Xóa Bỏ Fallback Tĩnh Sàn Chào Bán & Khai Tử Mảng TT17_SECTORS 18 Ngành

- [x] **T-04.115** `[FE]` Khai tử mảng `TT17_SECTORS` 18 ngành tự chế trong `SourceCode/frontend/src/types/technology-offer.ts` và loại bỏ `SECTORS_18_CATALOG` tĩnh trong `services/api/technology-offer.ts`:
  - Chuyển sang dùng hàm/hook `getActiveSectors()` từ `lib/master-data-client.ts` (kết nối `GET /api/v1/master-data/sectors?activeOnly=true`).
  - Cập nhật các component liên quan (`Tier3SectorDynamicForm.tsx`, `DynamicSpecTable.tsx`, `Step1CoreFields.tsx`) dùng danh mục chuẩn TT17 10 Lĩnh vực `LV01..LV17`.
  - Tiêu chí kiểm chứng:
    - [x] Không còn định nghĩa `TT17_SECTORS` 18 ngành tự chế với các mã tiền tố lạ (`AG, FOOD, MECH...`).
    - [x] Type check `tsc --noEmit` đạt 0 lỗi type.
- [x] **T-04.116** `[FE]` Refactor Hero Stats Strip trên Sàn Chào Bán (`SourceCode/frontend/src/app/chao-ban-cong-nghe/page.tsx`):
  - Xóa bỏ hoàn toàn fallback ảo `"1.200+"`, `"680+" bằng sáng chế` và chuỗi cứng `"10 Ngành"`.
  - Hiển thị trung thực:
    * Khối 1: `globalTotal` thật (khi = 0 hiển thị `0`).
    * Khối 2: Số ngành động tính từ dữ liệu hoặc `sectors.length`.
    * Khối 3: `patentCount` thật (khi = 0 hiển thị `0`).
  - Bọc khối qua component chuẩn `<Async>` đủ 5 UX States.
  - Đồng bộ danh sách tab ngành sang nạp động từ CSDL thật.
  - Tiêu chí kiểm chứng:
    - [x] Không còn chuỗi `"1.200+"` hay `"680+"` trong file.
    - [x] Khi API chưa có dữ liệu, hiển thị `0` trung thực (Zero-Mock).
    - [x] Khi API lỗi, hiển thị thông báo lỗi và nút Retry.
- [x] **T-04.117** `[TEST]` Bổ sung Unit Tests Vitest trong `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.test.tsx`:
  - Tiêu chí kiểm chứng:
    - [x] Kiểm chứng Hero Stats hiển thị số đếm thật và không fallback về chuỗi dummy.
    - [x] Kiểm chứng bộ lọc ngành lấy dữ liệu từ `getActiveSectors()`.
    - [x] 100% Vitest suites pass.

---

## Giai đoạn 15: Delta v13 (CR-2026-024) — Khắc Phục Lỗi Phê Duyệt Chào Bán Cấp Sở & Xuất Bản Sàn Chào Bán

- [x] **T-04.118** `[BE]` Mở rộng phân quyền Scoped RBAC tại endpoint `ReviewOffer` (`TechnologyOffersController.cs`):
  - Bổ sung `PROVINCIAL_ADMIN`, `CLUSTER_ADMIN`, `SUPER_ADMIN`, `OPERATOR_ADMIN` vào thuộc tính `[Authorize(Roles = "...")]`.
  - Cưỡng chế quy tắc địa bàn hành chính: `PROVINCIAL_ADMIN` / `CLUSTER_ADMIN` chỉ phê duyệt các hồ sơ thuộc địa bàn quản lý (`Offer.ScopeId == CurrentUser.ScopeId`).
  - Tiêu chí kiểm chứng:
    - [x] Tài khoản `PROVINCIAL_ADMIN` gọi `POST /api/v1/portal/seller/technologies/{id}/review` không còn nhận 403 Forbidden.
    - [x] `APPROVE` cập nhật `status = 'APPROVED'` và `published_at = UtcNow`.
- [x] **T-04.119** `[FE]` Cưỡng chế Bearer Token Authentication trong SDK `reviewOffer` (`technology-offer.ts`):
  - Tự động lấy JWT token từ `authClient.getAccessToken()` (hoặc `nacentwin_access_token`) và inject vào header `Authorization: Bearer ${token}`.
  - Xử lý mượt mà trên UI Hàng đợi kiểm duyệt (`GovApprovalQueue` tại `/gov/approvals`): Toast thành công, xóa hàng, cập nhật badge.
  - Tiêu chí kiểm chứng:
    - [x] Mọi cuộc gọi `reviewOffer` từ client đều đính kèm Bearer token hợp lệ.
    - [x] Cổng công vụ `/gov/approvals` phê duyệt thành công không phát sinh lỗi 401 hay 403.
- [x] **T-04.120** `[FE/E2E]` Đồng bộ hiển thị tức thời trên Sàn Chào Bán (`/san-pham`, `/chao-ban-cong-nghe`):
  - Đảm bảo hồ sơ sau khi được `PROVINCIAL_ADMIN` duyệt xuất hiện ngay lập tức trên sàn giao dịch công khai.
- [x] **T-04.121** `[TEST]` Bổ sung kịch bản kiểm thử Scoped RBAC và Bearer Token cho `ReviewOffer`:
  - Unit/Integration tests kiểm tra `PROVINCIAL_ADMIN` phê duyệt thành công (HTTP 200).
  - Kiểm tra 401 Unauthorized khi thiếu header `Authorization`.
  - Kiểm tra 403 Forbidden khi vai trò không phải Admin/Cán bộ Sở (ví dụ `SELLER`, `BUYER`).



---

## Phase 16: BACLINK Refactor Delta (CR-BACLINK-005)

- [x] `T-04.BL.01` **[BE]** Refactor `TechnologyOffersController`, `SellerOfferContracts` và `TechnologyService`: gỡ bắt buộc `ManagingAuthorityId` 34 Sở KH&CN và bỏ kiểm tra `Actor.ScopeId` theo tỉnh; thu gọn quyền duyệt niêm yết 1 cấp về `[Authorize(Roles = "ADMIN")]` (Hiệp hội BACLINK); cho phép mọi `ENTERPRISE` đăng bán & quản lý sản phẩm/năng lực của đơn vị mình kèm IDOR isolation theo `OrganizationId`/`OwnerPersonId` (`BR-04-BL-01`, `BR-04-BL-02`):
  - [x] Tệp: `SourceCode/backend/apps/api/V2/TechnologyOffersController.cs`, `SourceCode/backend/modules/technology/Application/SellerOfferContracts.cs`, `SourceCode/backend/modules/technology/Application/TechnologyService.cs`.
  - [x] Kiểm chứng: `dotnet test SourceCode/backend/tests/NacenTech.Modules.Technology.Tests/NacenTech.Modules.Technology.Tests.csproj` và `dotnet test SourceCode/backend/tests/integration/NacenTech.Tests.Integration.csproj --filter "FullyQualifiedName~ShopAndDemandRoleMutationTests"`.
- [x] `T-04.BL.02` **[FE]** Chuyển đổi Sàn Sản Phẩm & Năng Lực Sản Xuất công khai (`/chao-ban-cong-nghe`, `/chao-ban-cong-nghe/[id]`) sang ngữ cảnh công nghiệp Bắc Ninh (CNC, điện tử, nhựa kỹ thuật, tự động hóa, Smart Factory): bộ lọc 8 ngành `IND_*`, Địa bàn/KCN Bắc Ninh, TRL 1–9 & chứng chỉ (`ISO 9001`, `IATF 16949`, `ESG`), nhãn bảo chứng mặc định `Hiệp hội BACLINK` trên `<IndexVerificationBadge />`, Zero-Mock `<Async>` (`REQ-04-BL-01`, `BR-04-BL-01`):
  - [x] Tệp: `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.tsx`, `SourceCode/frontend/src/app/chao-ban-cong-nghe/[id]/page.tsx`, `SourceCode/frontend/src/components/common/IndexVerificationBadge.tsx`.
  - [x] Kiểm chứng: `cd SourceCode/frontend && npx vitest run src/app/chao-ban-cong-nghe/page.test.tsx src/app/chao-ban-cong-nghe/[id]/page.test.tsx && npx tsc --noEmit`.
- [x] `T-04.BL.03` **[FE]** Cập nhật Workspace Seller (`/portal/seller/technologies/page.tsx`, `create/page.tsx`): gỡ trường bắt buộc chọn Sở KH&CN quản lý (`ManagingAuthorityId`), dùng danh mục `IND_*` & Địa bàn/KCN Bắc Ninh, vận hành thông suốt dưới `user.role = 'ENTERPRISE'` khi `activeRole = 'SELLER'` (`REQ-04-BL-02`, `BR-04-BL-01`, `BR-04-BL-02`):
  - [x] Tệp: `SourceCode/frontend/src/app/portal/seller/technologies/page.tsx`, `SourceCode/frontend/src/app/portal/seller/technologies/create/page.tsx`.
  - [x] Kiểm chứng: `cd SourceCode/frontend && npx vitest run src/app/portal/seller/technologies/page.test.tsx && npx tsc --noEmit`.
- [x] `T-04.BL.04` **[TEST]** Cập nhật & bổ sung kiểm thử xUnit + Vitest xác thực: bỏ `ManagingAuthorityId` 34 Sở, `ADMIN` duyệt 1 cấp, `ENTERPRISE` Dual-Mode (`activeRole = SELLER`) đăng/sửa sản phẩm thành công & IDOR cross-org bị chặn 403, bộ lọc `IND_*`/KCN/chứng chỉ (`AC-04-059`..`AC-04-061`):
  - [x] Tệp: `SourceCode/backend/tests/NacenTech.Modules.Technology.Tests/SellerOfferRulesValidatorTests.cs`, `SourceCode/backend/tests/integration/ShopAndDemandRoleMutationTests.cs`, `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.test.tsx`, `SourceCode/frontend/src/app/chao-ban-cong-nghe/[id]/page.test.tsx`, `SourceCode/frontend/src/app/portal/seller/technologies/page.test.tsx`.
  - [x] Kiểm chứng: `dotnet test SourceCode/backend/NacenTech.slnx --filter "FullyQualifiedName~SellerOfferRulesValidatorTests|ShopAndDemandRoleMutationTests"` và `cd SourceCode/frontend && npx vitest run src/app/chao-ban-cong-nghe/page.test.tsx src/app/chao-ban-cong-nghe/[id]/page.test.tsx src/app/portal/seller/technologies/page.test.tsx && npx tsc --noEmit`.
