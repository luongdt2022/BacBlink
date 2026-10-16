# Kế Hoạch Kỹ Thuật (Architecture & Implementation Plan)
# TASK-04: HỒ SƠ CHÀO BÁN SELLER & BỘ LỌC ĐA TẦNG 18 NGÀNH SHTT

> **Mã Epic**: `TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC`  
> **Kiến trúc**: Clean Architecture (.NET 10 / Next.js 15 App Router)  
> **Trạng thái**: 🟢 Planned & Ready for Implementation

---

## 1. BẢN HỢP ĐỒNG GIAO TIẾP (CONTRACT-FIRST SPECIFICATION)

### 1.1. Danh Sách API Endpoints

| Mã API | Giao Thức & Đường Dẫn | Phân Quyền | Mục Đích |
| :--- | :--- | :--- | :--- |
| **API-04-001** | `GET /api/v1/technologies` | Public | Danh sách công nghệ niêm yết (Bộ lọc 18 ngành, từ khóa, TRL, type, phân trang). |
| **API-04-002** | `GET /api/v1/technologies/{id}` | Public | Chi tiết hồ sơ chào bán công nghệ và thông số kỹ thuật SHTT. |
| **API-04-003** | `GET /api/v1/portal/seller/technologies` | Seller / Admin | Danh sách công nghệ trong kho của Seller (kèm thống kê KPI). |
| **API-04-004** | `POST /api/v1/portal/seller/technologies` | Seller / Admin | Đăng mới hồ sơ chào bán (kiểm tra `BR-SELLER-01` $\rightarrow$ `05`). |
| **API-04-005** | `PUT /api/v1/portal/seller/technologies/{id}` | Seller / Admin | Cập nhật hồ sơ chào bán. |
| **API-04-006** | `DELETE /api/v1/portal/seller/technologies/{id}` | Seller / Admin | Xóa mềm hoặc ẩn hồ sơ chào bán. |

### 1.2. Hợp Đồng DTO (Request / Response)

```json
// POST /api/v1/portal/seller/technologies - Request DTO
{
  "offerType": "SOLUTION", // PRODUCT | DEVICE | SOLUTION
  "hasTechTransfer": true,
  "title": "Hệ thống sấy thăng hoa chân không tích hợp AI tối ưu năng lượng",
  "summary": "Công nghệ sấy nhiệt độ thấp bảo toàn 98% hoạt chất sinh học",
  "problemSolved": "Giảm 40% tiêu hao điện năng trong chế biến nông sản xuất khẩu",
  "sectorCode": "FOOD",
  "pricingType": "RANGE", // FIXED | RANGE | CONTACT
  "priceMin": 850000000,
  "priceMax": 1200000000,
  "currency": "VND",
  "unit": "dây chuyền",
  // Thuộc tính Bộ Tứ SHTT
  "developerOrigin": "Viện Cơ điện Nông nghiệp và Công nghệ sau thu hoạch",
  "trlLevel": 8, // 1 - 9
  "ipStatus": "PATENT_GRANTED",
  "ipRegistrationNumber": "VN-1-0028491",
  "transferMethod": "EXCLUSIVE_LICENSE",
  "commercialStatus": "COMMERCIALLY_READY",
  "contactPointRole": "Phòng Chuyển giao Công nghệ & Sở hữu Trí tuệ"
}
```

---

## 2. KIẾN TRÚC BACKEND (.NET CORE CLEAN ARCHITECTURE)

- **Domain Entity**:
  - `TechnologyOffer` hoặc mở rộng `TechnologyAsset` trong `NacenTech.Modules.Technology`.
  - Hỗ trợ đầy đủ các trường: `OfferType`, `HasTechTransfer`, `DeveloperOrigin`, `TrlLevel`, `IpStatus`, `TransferMethod`, `CommercialStatus`.
- **Application Services / Handlers**:
  - `CreateSellerOfferCommand` & Validator kiểm tra điều kiện `BR-SELLER-02` (Conditional IP Quad).
  - `GetTechnologiesQuery` hỗ trợ lọc theo 18 ngành, keyword, TRL, IP status.
  - `GetSellerTechnologiesQuery` lấy danh sách theo Seller hiện tại.
- **Unit Tests**:
  - Kiểm thử `CreateSellerOfferValidator` với 100% kịch bản hợp lệ và vi phạm.

---

## 3. KIẾN TRÚC FRONTEND (NEXT.JS 15 & 5 UX STATES)

- **Định tuyến 4 màn hình**:
  1. `src/app/chao-ban-cong-nghe/page.tsx`:
     - Trang chính niêm yết giải pháp (Tab chính của website).
     - Gồm Hero Banner, Search Bar, Tab chọn loại hình, Sidebar lọc 18 ngành, Grid sản phẩm, Phân trang.
  2. `src/app/chao-ban-cong-nghe/[id]/page.tsx`:
     - Chi tiết hồ sơ giải pháp / sáng chế.
     - Badge TRL 8, Thẻ chứng nhận SHTT, Bảng thông số, Tab nội dung, Modal gửi liên hệ kết nối.
  3. `src/app/portal/seller/technologies/page.tsx`:
     - Workspace của Seller: Bảng KPI (Tổng số, Đang hiển thị, Chờ duyệt, Kết nối), Bộ lọc, Nút Tạo mới, Bảng danh sách hành động.
  4. `src/app/portal/seller/technologies/create/page.tsx`:
     - Form Wizard đăng mới công nghệ với toggle Bộ tứ SHTT tương tác động.
- **Component dùng chung**:
  - Tích hợp chuẩn `<Async>` (Loading skeleton, Empty state khi không có kết quả, Error banner, Success card grid).
  - Khởi tạo Mock Data chuẩn hóa sẵn sàng cho cả chế độ Online (Backend API) lẫn Offline/Stand-alone nếu API gián đoạn.

---

## 4. CHIẾN LƯỢC KIỂM THỬ BLACK-BOX 4 TẦNG (QC STRATEGY)

1. **Tầng 1 - Unit Test Domain & Validation**:
   - Kiểm thử `BR-SELLER-01` (Offer Type).
   - Kiểm thử `BR-SELLER-02` & `BR-SELLER-03` (Bắt buộc TRL 1-9 & SHTT khi có chuyển giao).
   - Kiểm thử `BR-SELLER-04` (Quy tắc giá bán).
2. **Tầng 2 - Contract & API Test**:
   - Xác thực schema phản hồi của `GET /api/v1/technologies` và `GET /api/v1/technologies/{id}`.
3. **Tầng 3 - Integration / Store Service Test**:
   - Kiểm tra luồng thêm mới công nghệ và kiểm tra dữ liệu xuất hiện trong kho Seller.
4. **Tầng 4 - Playwright E2E UI Black-box Test**:
   - Kịch bản 1: Mở `http://localhost:3000/chao-ban-cong-nghe`, kiểm tra render đầy đủ, lọc ngành và tìm kiếm.
   - Kịch bản 2: Bấm vào một sản phẩm để vào `http://localhost:3000/chao-ban-cong-nghe/[id]`, kiểm tra badge TRL và thông số SHTT.
   - Kịch bản 3: Vào `http://localhost:3000/portal/seller/technologies`, kiểm tra KPI và bảng danh sách.
   - Kịch bản 4: Vào `http://localhost:3000/portal/seller/technologies/create`, thử validate lỗi khi bật chuyển giao mà bỏ trống TRL/SHTT, sau đó điền hợp lệ và submit thành công.

---

## 5. KIẾN TRÚC DELTA CR-2026-006: THẨM ĐỊNH CẤP SỞ KH&CN & GOVERNANCE APPROVAL

### 5.1. Mở Rộng Hợp Đồng API & DTO
- **Request `CreateSellerOfferDto`** bổ sung:
  - `managingAuthorityId` (string, e.g. `"VN-HN"`): Mã Sở KH&CN tiếp nhận thẩm định.
  - `managingAuthorityName` (string): Tên Sở KH&CN (e.g. `"Sở Khoa học và Công nghệ TP. Hà Nội"`).
  - `scopeType` (string = `"PROVINCE"`).
  - `scopeId` (string = `managingAuthorityId`).
  - `legalConsent` (boolean, bắt buộc `true`).
- **Response `SellerOfferDto`** bổ sung:
  - `managingAuthorityName`, `scopeType`, `scopeId`.
  - `status`: Khởi tạo mặc định `PENDING` (không còn auto-approved).
  - `approvalRequestId` (UUID): Liên kết với bản ghi `approval_requests`.

### 5.2. Luồng Xử Lý Backend & Side-Effects
1. Khi Seller gửi hồ sơ:
   - Lưu vào kho với trạng thái `PENDING`.
   - Gọi `IApprovalService.SubmitRequestAsync` với:
     * `RequestType = "TECHNOLOGY_OFFER"`
     * `ScopeType = ScopeTypes.Province`
     * `ScopeId = dto.ScopeId`
     * `PayloadJson` chứa tóm tắt hồ sơ công nghệ, TRL, SHTT và `OfferId`.
2. Khi Cán bộ/Lãnh đạo Sở KH&CN tại Cổng Tác Nghiệp Cấp 2 (`/gov/approvals`) review:
   - Thẩm định tính pháp lý của hồ sơ, văn bằng SHTT.
   - Khi hành động là `APPROVE`:
     * Chuyển trạng thái Offer từ `PENDING` sang `APPROVED`.
     * Cập nhật `PublishedAt = UtcNow`.
     * Lúc này Offer mới xuất hiện trên sàn `/chao-ban-cong-nghe`.
   - Khi hành động là `REJECT`:
     * Chuyển trạng thái Offer sang `REJECTED`, ghi nhận `ReviewNote`.
   - Khi hành động là `REQUEST_CHANGES`:
     * Chuyển trạng thái sang `CHANGES_REQUESTED`.
3. Khi Quản trị viên Trung ương hậu kiểm:
   - Action `REVOKE` theo `BR-ADM-007` thu hồi quyền niêm yết, chuyển Offer sang `REVOKED`.

---

---

## 7. KẾ HOẠCH KỸ THUẬT DELTA V4: LIÊN KẾT BÊN BÁN (SELLER) VỚI HỒ SƠ DOANH NGHIỆP THƯỜNG

### 7.1. Database Schema & Migration (PostgreSQL)
- Bảng `technology.seller_technology_offers`:
  * Bổ sung cột `enterprise_tax_code VARCHAR(50) NULL`.
  * Bổ sung cột `enterprise_name VARCHAR(255) NULL`.
  * Index: `CREATE INDEX idx_seller_technology_offers_tax_code ON technology.seller_technology_offers(enterprise_tax_code);`
- Tạo file migration non-destructive: `AddEnterpriseLinkToSellerOffers`.

### 7.2. Backend Contracts & Mapping
- Mở rộng `CreateSellerOfferDto`, `UpdateSellerOfferDto`, `SellerOfferDto`:
  * Thêm `string? EnterpriseTaxCode = null` và `string? EnterpriseName = null`.
- Trong `TechnologyService.cs`:
  * Khi lấy chi tiết `GetByIdAsync`: nếu `EnterpriseTaxCode` có giá trị nhưng `EnterpriseName` trống, query bổ sung tên từ bảng `enterprises`.
  * Cung cấp endpoint tra cứu sản phẩm theo DN: `GET /api/v1/technologies?enterpriseTaxCode={taxCode}`.

### 7.3. Frontend Implementation
- Cập nhật TypeScript models trong `src/types/technology-offer.ts`.
- Màn hình `/chao-ban-cong-nghe`:
  * Trên thẻ sản phẩm: hiển thị tên đơn vị chào bán kèm Link bọc ngoài dẫn đến `/enterprises/[taxCode]` (hoặc fallback nếu chưa gắn MST).
- Màn hình `/chao-ban-cong-nghe/[id]`:
  * Khối "Cơ quan quản lý & Đơn vị chào bán" ở sidebar: bổ sung Card Doanh nghiệp chào bán (Tên DN, MST, Logo/Avatar, Badge Verified) kèm nút CTA `Xem Hồ sơ Doanh nghiệp →`.
- Màn hình `/enterprises/[taxCode]`:
  * Xử lý trường hợp `SubjectType = 'ENTERPRISE'` (Doanh nghiệp thường): ẩn các tab R&D/TNI nâng cao nếu dữ liệu trống.
  * Thêm Tab mới: `"Sản phẩm & Giải pháp chào bán"` gọi API `fetchPublicOffers({ enterpriseTaxCode: taxCode })` và render danh sách card sản phẩm.


---

## 8. KẾ HOẠCH THIẾT KẾ KỸ THUẬT DELTA V5: CHUẨN HÓA TOÀN DIỆN FORM CHÀO BÁN SELLER 4 BƯỚC, BỘ THÔNG SỐ 18 NGÀNH & TRỢ LÝ AI (GATE 2)

### 8.1. Bối Cảnh & Mục Tiêu Kiến Trúc
- **Căn cứ kỹ thuật**: Quyết định PO `PO-DEC-20261008-01`, `PO-DEC-20261008-04`, `PO-DEC-20261008-07`; Bản đặc tả Spec Delta v5 (Mục 10 `spec.md`); Wireframes `DANH_MUC_TRUONG_CHAO_BAN_VA_BO_LOC_18_NGANH.html`, `wireframe_tao_ho_so_chao_ban.html`, `wireframe_chinh_sua_ho_so_chao_ban.html`; Sheet chuẩn `C.bán SP` và `Bo_loc_Cban` trong `Nacentwin_20260924_bo_loc_da_sua.xlsx`.
- **Mục tiêu thiết kế**:
  1. **Non-destructive Migration**: Mở rộng bảng `technology.seller_technology_offers` với các trường Media và Điều kiện thương mại; tạo 2 bảng quan hệ con `technology.offer_spec_values` (thông số 18 ngành động) và `technology.offer_documents` (DataRoom & minh chứng SHTT/TRL) kèm khóa ngoại `ON DELETE CASCADE`. Đảm bảo không downtime, không mất dữ liệu cũ.
  2. **Tương thích ngược Hợp đồng DTO & API**: Nâng cấp DTOs `CreateSellerOfferDto`, `UpdateSellerOfferDto`, `SellerOfferDto` với trường bổ sung dạng optional; hỗ trợ cả phương thức gửi dữ liệu kiểu cũ lẫn cấu trúc mở rộng mới.
  3. **Phân tách Ràng buộc Validation (Draft vs. Publish)**: Thiết kế 2 phương thức thẩm định độc lập: `ValidateDraft` (khi `Status == "DRAFT"` chỉ bắt buộc `Title` $\ge 3$ ký tự) và `ValidatePublish` (khi `Status == "PENDING"` kiểm tra toàn diện `BR-SELLER-01` $\rightarrow$ `BR-SELLER-11`).
  4. **Human-in-the-Loop AI Extractor Adapter**: Thiết kế endpoint `POST /api/v1/ai/extract-patent-specs` theo `DD-02-ai-extractor-contracts.md` và `PO-DEC-20261008-07`. AI chỉ đóng vai trò phân tích và đề xuất bản nháp `TechTransferDraftDto`, giao diện đánh dấu `✨ AI Gợi ý` để người dùng xác nhận trước khi lưu; tích hợp cơ chế Zero-Dependency Fallback.
  5. **Frontend Architecture Stepper 4 Bước**: Thiết kế lại toàn bộ luồng tạo mới và chỉnh sửa thành Wizard 4 bước trực quan, tích hợp `FormStepper`, `DynamicSpecTable`, `TrlSelectorGrid` (9 cấp), `MediaUploadSection`, `EvidenceDocumentSection`, `AiScanAssistantCard` và lưu nháp tự động `localStorage`.

---

### 8.2. Thiết Kế Cơ Sở Dữ Liệu & EF Core (Non-Destructive Schema)

#### 8.2.1. Bảng Mở Rộng: `technology.seller_technology_offers`
Bổ sung các cột mới dạng `NULL` hoặc có giá trị mặc định, đảm bảo tính non-destructive:
- `main_image_url TEXT NULL`: Ảnh đại diện công nghệ (chuẩn tỷ lệ 16:9 / 4:3, JPG/PNG $\le 5\text{MB}$).
- `gallery_image_urls TEXT[] NULL`: Mảng URL thư viện ảnh bổ sung chi tiết máy móc/dây chuyền (tối đa 6 ảnh).
- `delivery_timeline VARCHAR(255) NULL`: Thời gian bàn giao & tiến độ triển khai (ví dụ: "30 ngày kể từ ngày ký hợp đồng").
- `warranty_terms VARCHAR(255) NULL`: Thời hạn và điều kiện bảo hành (ví dụ: "24 tháng bảo hành chính hãng, hỗ trợ 24/7").
- `supply_scope VARCHAR(255) NULL`: Phạm vi cung ứng giải pháp (ví dụ: "Toàn quốc", "63 tỉnh/thành", "Xuất khẩu ASEAN").
- `payment_terms TEXT NULL`: Điều kiện và tiến độ thanh toán (ví dụ: "Tạm ứng 30%, 50% khi giao hàng, 20% sau nghiệm thu").
- `installation_support BOOLEAN NOT NULL DEFAULT TRUE`: Hỗ trợ chuyên gia kỹ thuật lắp đặt & chuyển giao vận hành.

#### 8.2.2. Bảng Mới: `technology.offer_spec_values` (Thông số kỹ thuật 18 ngành động)
Lưu trữ thông số kỹ thuật động theo nhóm ngành kinh tế TT17:
```sql
CREATE TABLE technology.offer_spec_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES technology.seller_technology_offers(id) ON DELETE CASCADE,
    spec_code VARCHAR(50) NULL,
    spec_name VARCHAR(255) NOT NULL,
    spec_value TEXT NOT NULL,
    unit VARCHAR(50) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX ix_offer_spec_values_offer_id ON technology.offer_spec_values(offer_id);
CREATE INDEX ix_offer_spec_values_spec_code ON technology.offer_spec_values(spec_code);
```

#### 8.2.3. Bảng Mới: `technology.offer_documents` (Minh chứng SHTT, TRL & DataRoom)
Lưu trữ tệp tài liệu số hóa, chứng nhận văn bằng, báo cáo kiểm định và phân quyền truy cập:
```sql
CREATE TABLE technology.offer_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES technology.seller_technology_offers(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- CATALOGUE | PATENT_CERT | TRL_EVIDENCE | VIDEO | OTHER
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    access_scope VARCHAR(30) NOT NULL DEFAULT 'AFTER_CONNECTION', -- PUBLIC | AFTER_CONNECTION | ADMIN_ONLY
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX ix_offer_documents_offer_id ON technology.offer_documents(offer_id);
CREATE INDEX ix_offer_documents_document_type ON technology.offer_documents(document_type);
CREATE INDEX ix_offer_documents_access_scope ON technology.offer_documents(access_scope);
```

#### 8.2.4. EF Core Entities & Configurations
- **Domain Entities**:
  * `OfferSpecValue`: Kế thừa `Entity<Guid>`, gồm các thuộc tính `OfferId`, `SpecCode`, `SpecName`, `SpecValue`, `Unit`, `CreatedAt`.
  * `OfferDocument`: Kế thừa `Entity<Guid>`, gồm `OfferId`, `DocumentType`, `FileName`, `FileUrl`, `FileSizeBytes`, `AccessScope`, `CreatedAt`.
  * `SellerTechnologyOffer`: Mở rộng thuộc tính Media, Commercial Terms và 2 Navigation Collections:
    ```csharp
    public IReadOnlyCollection<OfferSpecValue> SpecValues => _specValues.AsReadOnly();
    public IReadOnlyCollection<OfferDocument> Documents => _documents.AsReadOnly();
    ```
- **Configuration (Clean Architecture)**:
  * Khai báo trong `NacenTech.Modules.Technology.Infrastructure.Persistence.Configurations`:
    - `OfferSpecValueConfiguration`: Cấu hình schema `technology`, bảng `offer_spec_values`, FK `OfferId` với `OnDelete(DeleteBehavior.Cascade)`.
    - `OfferDocumentConfiguration`: Cấu hình schema `technology`, bảng `offer_documents`, FK `OfferId` với `OnDelete(DeleteBehavior.Cascade)`.
    - `SellerTechnologyOfferConfiguration`: Bổ sung mappings cho `MainImageUrl`, `GalleryImageUrls`, `DeliveryTimeline`, `WarrantyTerms`, `SupplyScope`, `PaymentTerms`, `InstallationSupport`.
- **Migration Plan**:
  * Tạo tệp `20261016160000_AddDeltaV5SellerOfferSpecsAndDocuments.cs` trong `NacenTech.Persistence.Migrations`.

---

### 8.3. Thiết Kế Hợp Đồng API & DTOs (Backend Contracts)

#### 8.3.1. DTOs Khai Báo Con
```csharp
public sealed record OfferSpecValueDto(
    Guid? Id,
    string? SpecCode,
    string SpecName,
    string SpecValue,
    string? Unit
);

public sealed record OfferDocumentDto(
    Guid? Id,
    string DocumentType, // CATALOGUE | PATENT_CERT | TRL_EVIDENCE | VIDEO | OTHER
    string FileName,
    string FileUrl,
    long FileSizeBytes,
    string AccessScope // PUBLIC | AFTER_CONNECTION | ADMIN_ONLY
);
```

#### 8.3.2. Mở Rộng `CreateSellerOfferDto` & `UpdateSellerOfferDto`
```csharp
public sealed record CreateSellerOfferDto(
    string OfferType,
    bool HasTechTransfer,
    string Title,
    string Summary,
    string ProblemSolved,
    string SectorCode,
    string PricingType,
    decimal? PriceAmount,
    decimal? PriceMin,
    decimal? PriceMax,
    string Currency,
    string? Unit,
    string? DeveloperOrigin,
    int? TrlLevel,
    string? IpStatus,
    string? IpRegistrationNumber,
    string? TransferMethod,
    string? CommercialStatus,
    string? ContactPointRole,
    string? ManagingAuthorityId = "VN-HN",
    string? ManagingAuthorityName = "Sở Khoa học và Công nghệ TP. Hà Nội",
    string? ScopeType = "PROVINCE",
    string? ScopeId = "VN-HN",
    bool LegalConsent = true,
    string? EnterpriseTaxCode = null,
    string? EnterpriseName = null,
    // Mở rộng Delta v5:
    string? MainImageUrl = null,
    IReadOnlyList<string>? GalleryImageUrls = null,
    string? DeliveryTimeline = null,
    string? WarrantyTerms = null,
    string? SupplyScope = null,
    string? PaymentTerms = null,
    bool InstallationSupport = true,
    IReadOnlyList<OfferSpecValueDto>? SpecValues = null,
    IReadOnlyList<OfferDocumentDto>? Documents = null,
    string? Action = "SUBMIT_FOR_REVIEW" // SAVE_DRAFT | SUBMIT_FOR_REVIEW
);
```

#### 8.3.3. Cơ Chế Thẩm Định Dữ Liệu 2 Tầng (`SellerOfferRulesValidator`)
1. **Luồng Lưu Nháp (`ValidateDraft`)** theo `BR-SELLER-08`:
   - Kích hoạt khi `dto.Action == "SAVE_DRAFT"` hoặc `status == "DRAFT"`.
   - Tiêu chí duy nhất: `!string.IsNullOrWhiteSpace(dto.Title) && dto.Title.Trim().Length >= 3`.
   - Bỏ qua hoàn toàn: `OfferType`, `SectorCode`, `PricingType`, `BR-SELLER-02` (Bộ tứ SHTT), `LegalConsent`, và chọn Sở KH&CN.
   - Trạng thái bản ghi lưu vào DB là `DRAFT`.
   - Không sinh phiếu `ApprovalRequest` và không hiển thị trên sàn công khai.
2. **Luồng Xuất Bản Thẩm Định (`ValidatePublish`)**:
   - Kích hoạt khi `dto.Action == "SUBMIT_FOR_REVIEW"` hoặc cập nhật để gửi duyệt.
   - Bắt buộc kiểm tra toàn diện `BR-SELLER-01` $\rightarrow$ `BR-SELLER-05`, `BR-SELLER-09` (TRL 1-9), `BR-SELLER-10` (Định dạng & dung lượng file tài liệu), `BR-SELLER-11` (Bảng thông số tối đa 50 dòng, không trùng lặp tên thông số).
   - Kiểm tra `LegalConsent == true` và `ManagingAuthorityId != null`.
   - Trạng thái bản ghi khởi tạo là `PENDING`.

#### 8.3.4. Dịch Vụ AI Extractor (`POST /api/v1/ai/extract-patent-specs`)
- Tuân thủ `PO-DEC-20261008-07` và `DD-02-ai-extractor-contracts.md`:
  * Tuyệt đối không ghi trực tiếp vào DB.
  * Tiếp nhận file tài liệu thuyết minh / bản chụp bằng SHTT / catalogue qua `multipart/form-data`.
  * Bóc tách các trường: `title`, `technical_summary`, `target_sector_code`, `ip_quad` (`trl_level`, `ip_status`, `patent_number`, `patent_owner`, `transfer_method`), `origin_developer`, `suggested_specs`.
  * Trả về `TechTransferDraftDto` cho client; frontend đổ vào Form Wizard và gắn nhãn `✨ AI Gợi ý`.
  * Tích hợp Fallback: Trả về mã lỗi thân thiện nếu file không đọc được, client hiển thị thông báo và cho phép người dùng tiếp tục nhập tay bình thường.

---

### 8.4. Thiết Kế Kiến Trúc Frontend (Form Wizard 4 Bước Chuyên Sâu)

#### 8.4.1. Phân Tầng Component Form Wizard
Cấu trúc cây component module hóa trong `src/app/portal/seller/technologies/create` và `[id]/edit`:
```text
TechnologiesWizard/
├── FormStepper.tsx                # Thanh điều hướng Stepper tiến trình (4 nấc, chỉ báo hoàn thành)
├── AiScanAssistantCard.tsx        # Widget Trợ lý AI bóc tách tài liệu (Human-in-the-Loop)
├── Step1BasicInfo.tsx             # Bước 1: Phân loại, Toggle SHTT, Tên, Mô tả, Bài toán, Ngành kinh tế
├── Step2SpecsAndSector.tsx        # Bước 2: Bảng DynamicSpecTable (18 ngành, thêm/xóa dòng, chống trùng)
│   └── DynamicSpecTable.tsx       # Bảng Key-Value động kèm danh mục thông số gợi ý theo ngành
├── Step3CommercialTerms.tsx       # Bước 3: Giá, Tiền tệ VND/USD, Đơn vị tính, Bàn giao, Bảo hành, Thanh toán
├── Step4EvidenceAndReview.tsx     # Bước 4: TRL 9 nấc, SHTT, Media, DataRoom, Đầu mối TTO, Sở KH&CN, Cam kết
│   ├── TrlSelectorGrid.tsx        # Grid 9 nấc TRL (3 dải màu: R&D, Thử nghiệm, Thương mại)
│   ├── MediaUploadSection.tsx     # Cụm tải ảnh đại diện (16:9), album ảnh, brochure PDF, video demo
│   └── EvidenceDocumentSection.tsx# Quản lý tài liệu DataRoom, thiết lập quyền xem access_scope
└── DraftPersistenceBar.tsx       # Thanh lưu nháp DRAFT trên header/footer kèm LocalStorage Auto-save
```

#### 8.4.2. Chi Tiết Các Bước Nghiệp Vụ Wizard
1. **Bước 1: Thông tin bắt buộc & Tra cứu (`Step1BasicInfo`)**:
   - Chọn loại hình: `PRODUCT` (Sản phẩm), `DEVICE` (Thiết bị), `SOLUTION` (Giải pháp).
   - Toggle "Có chuyển giao công nghệ / SHTT": điều khiển việc hiển thị các khối chuyên sâu ở Bước 4.
   - Tên công nghệ / sáng chế chào bán (`title`).
   - Mô tả tóm tắt giải pháp (`summary`).
   - Bài toán kỹ thuật giải quyết cho bên mua (`problemSolved`).
   - Lĩnh vực công nghệ trọng điểm (`sectorCode` - 18 nhóm ngành TT17).
2. **Bước 2: Thông số kỹ thuật & 18 Ngành (`Step2SpecsAndSector`)**:
   - Tự động nạp bộ gợi ý thông số kỹ thuật chuẩn khi người dùng chọn ngành tại Bước 1 (ví dụ: Ngành `FOOD` gợi ý: Công suất tách ẩm, Nhiệt độ sấy thăng hoa, Độ chân không buồng sấy, Tiêu hao điện năng).
   - Bảng `DynamicSpecTable`:
     * Cột 1: Tên thông số (`spec_name` - w-2/5) kèm autocomplete/dropdown gợi ý.
     * Cột 2: Giá trị (`spec_value` - w-2/5).
     * Cột 3: Đơn vị tính (`unit` - w-1/5, ví dụ: `kg/mẻ`, `kW/h`, `bar`, `%`).
     * Cột 4: Nút Xóa dòng.
     * Nút "+ Thêm thông số kỹ thuật": Thêm dòng mới, tự động kiểm tra chống trùng lặp tên thông số (tối đa 50 dòng theo `BR-SELLER-11`).
3. **Bước 3: Giá & Điều kiện thương mại (`Step3CommercialTerms`)**:
   - Phương thức giá: `FIXED` (Giá cố định), `RANGE` (Khoảng giá), `CONTACT` (Thỏa thuận / Liên hệ báo giá).
   - Ô nhập số tiền `priceAmount` hoặc khoảng `priceMin` - `priceMax`.
   - Dropdown chọn loại tiền tệ `currency`: `VND` (Mặc định), `USD`, `EUR`.
   - Ô nhập / combobox gợi ý Đơn vị tính `unit`: `dây chuyền`, `hệ thống`, `bộ`, `chiếc`, `gói chuyển giao`, `quy trình`, `li-xăng/năm`...
   - Cụm điều kiện thương mại chi tiết (`REQ-04-017`):
     * Thời gian bàn giao & triển khai (`deliveryTimeline`).
     * Thời hạn & điều kiện bảo hành (`warrantyTerms`).
     * Hỗ trợ lắp đặt & vận hành thử (`installationSupport` - Checkbox/Toggle).
     * Phạm vi cung ứng (`supplyScope`: Toàn quốc / Tỉnh thành / Xuất khẩu).
     * Điều kiện thanh toán (`paymentTerms`).
4. **Bước 4: Minh chứng SHTT, TRL & Quản trị duyệt (`Step4EvidenceAndReview`)**:
   - Nếu `hasTechTransfer = true`:
     * Đơn vị nghiên cứu phát triển / Viện / Trường (`developerOrigin`).
     * Dải thang đo TRL 9 cấp độ (`TrlSelectorGrid`): Grid 9 nút (TRL 1 đến TRL 9) phân theo 3 dải màu:
       - Xanh lam (TRL 1–3: Nghiên cứu Lab R&D).
       - Vàng hổ phách (TRL 4–6: Thử nghiệm mô phỏng & Pilot).
       - Xanh ngọc lục bảo (TRL 7–9: Vận hành & Thương mại hóa).
       - Tooltip giải thích chi tiết ý nghĩa kỹ thuật từng cấp độ.
     * Tình trạng SHTT: Bằng sáng chế, GPHI, Bí quyết công nghệ, Bản quyền phần mềm, Đang nộp đơn.
     * Số văn bằng SHTT (`ipRegistrationNumber`).
     * Hình thức chuyển giao mong muốn: Li-xăng độc quyền, Li-xăng không độc quyền, Chuyển nhượng toàn bộ, Hợp tác R&D, Góp vốn bằng SHTT.
     * Trạng thái thương mại hóa: Sẵn sàng quy mô lớn, Thử nghiệm hiện trường, Lab prototype, Tìm đối tác sản xuất.
   - Cụm Media tải lên (`MediaUploadSection`): Ảnh đại diện 16:9 (`main_image`), Album ảnh chi tiết (`gallery_images`), Catalogue kỹ thuật PDF (`catalogue_pdf`), Video demo (`video_demo`).
   - Cụm Tệp Minh Chứng & DataRoom (`EvidenceDocumentSection`): Tải bản scan bằng SHTT, báo cáo kiểm định TRL, biên bản nghiệm thu; gắn quyền truy cập `access_scope`: `PUBLIC`, `AFTER_CONNECTION`, `ADMIN_ONLY`.
   - Khai báo Đầu mối TTO (`REQ-04-016`): Họ tên người phụ trách (`contact_name`), Chức vụ/Phòng ban (`contact_point_role`), Số điện thoại, Email. Áp dụng che mờ PDPD đối với khách vãng lai.
   - Cơ quan quản lý Sở KH&CN tiếp nhận thẩm định (`managingAuthorityId`) & Checkbox cam kết trách nhiệm pháp lý (`legalConsent`).

#### 8.4.3. Widget Trợ Lý AI Khảo Sát & Gợi Ý (`AiScanAssistantCard`)
- Đặt tại cột bên trái bên dưới `FormStepper`.
- Cho phép kéo thả tệp Catalogue PDF, bản chụp Bằng SHTT hoặc tài liệu thuyết minh giải pháp.
- Gửi yêu cầu phân tích tới API `/api/v1/ai/extract-patent-specs`.
- Hiển thị thanh tiến trình xử lý trực quan.
- Khi nhận được dữ liệu, hiển thị danh sách các trường được AI phát hiện kèm nút "Áp dụng vào Form".
- Form Wizard tự động điền các trường tương ứng và hiển thị badge viền sáng `✨ AI Gợi ý` để người dùng dễ nhận biết và rà soát lại.

#### 8.4.4. Cơ Chế Lưu Nháp Trạng Thái DRAFT & LocalStorage Resilience
- **Lưu nháp CSDL**: Người dùng có thể nhấn nút "Lưu nháp" bất kỳ lúc nào tại Bước 1, 2, 3, 4. Hệ thống gửi payload với `action: "SAVE_DRAFT"`, Backend chỉ kiểm tra `title >= 3` ký tự và lưu trạng thái `DRAFT`.
- **LocalStorage Resilience**: Tự động lưu bản sao trạng thái form vào `localStorage` mỗi 30 giây (key `nacentech_seller_offer_draft_{id|new}`). Khi tải lại trang nếu phát hiện bản lưu nháp chưa nộp, giao diện hiển thị thông báo "Bạn có một bản nháp chưa nộp từ [thời gian], bạn có muốn khôi phục không?".

---

### 8.5. Kế Hoạch Đồng Bộ Sang Trang Chi Tiết & Bộ Lọc Sàn
1. **Trang Chi Tiết `/chao-ban-cong-nghe/[id]/page.tsx`**:
   - Thay thế các thông số tĩnh bằng dữ liệu thực lấy từ bảng `offer_spec_values` (kết xuất động theo Key-Value và Unit).
   - Hiển thị cụm Media: Ảnh banner chính, Gallery ảnh chi tiết dạng carousel/lightbox, nhúng video demo hoặc brochure PDF nếu có.
   - Hiển thị danh mục DataRoom từ `offer_documents`: Đối với tài liệu `AFTER_CONNECTION`, hiển thị biểu tượng ổ khóa bảo mật kèm thông báo "Yêu cầu kết nối chuyển giao để mở khóa tài liệu này".
   - Hiển thị chi tiết các Điều kiện thương mại: Thời gian giao hàng, Thời hạn bảo hành, Hỗ trợ lắp đặt, Phạm vi cung cấp, Điều kiện thanh toán.
   - Hiển thị Card Đầu mối TTO / Chuyên viên chuyển giao kèm che số điện thoại và email theo quy định PDPD.
2. **Bộ Lọc Đa Tầng 18 Ngành `/chao-ban-cong-nghe`**:
   - Đồng bộ hoàn hảo bộ lọc TRL 1-9 (cho phép lọc từ TRL 1 đến 9 theo dải nút trực quan).
   - Hiển thị đầy đủ thông tin đơn vị tính `unit` và loại tiền tệ trên từng thẻ giải pháp.

---

### 8.6. Kế Hoạch Kiểm Thử Toàn Diện & Quality Gate Delta v5
1. **Unit Test Backend (.NET Core / xUnit)**:
   - `SellerOfferRulesValidatorTests.cs`:
     * Test `ValidateDraft`: Chỉ cần title $\ge 3$ ký tự, các trường khác null vẫn Pass.
     * Test `ValidatePublish`: Bắt buộc đầy đủ quy tắc `BR-SELLER-01` $\rightarrow$ `BR-SELLER-05`, `BR-SELLER-09` (TRL 1-9), `BR-SELLER-10` (Documents), `BR-SELLER-11` (Specs max 50 dòng, unique spec_name), `LegalConsent`.
     * Test `BR-SELLER-07`: Tự động tái thẩm định khi thay đổi TRL hoặc SHTT.
     * Test `OfferSpecValues` & `OfferDocuments` CRUD mapping.
2. **Integration Test (DB & EF Core)**:
   - Kiểm thử tạo mới bản ghi với mảng SpecValues và Documents, kiểm tra quan hệ khóa ngoại và tính năng xóa tầng cascade.
3. **Frontend Component & E2E Testing**:
   - Kiểm thử chuyển bước Stepper 4 bước và validate từng bước.
   - Kiểm thử thêm, sửa, xóa dòng `DynamicSpecTable` và kiểm tra trùng tên thông số.
   - Kiểm thử tương tác dải nút `TrlSelectorGrid` 9 cấp độ.
   - Kiểm thử luồng upload file minh chứng và chọn quyền `access_scope`.
   - Kiểm thử gọi API Trợ lý AI và tự động điền form (Human-in-the-Loop).
   - Kiểm thử cơ chế khôi phục từ `localStorage`.
