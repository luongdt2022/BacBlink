# Change Request: CR-2026-021 Chuẩn Hóa Bắt Buộc Định Danh Pháp Nhân Khi Mở Gian Hàng Seller (Legal Entity Mandate for Seller Onboarding)

**CR-ID**: CR-2026-021  
**Epic**: TASK-00_PLATFORM_FOUNDATION_VA_COMMON  
**Status**: APPROVED  
**Target Version**: 1.17.0  
**Author**: PO kiêm Senior BA (`nacen-po-pm` & `nacen-ba`)  
**Date**: 2026-11-03  
**Căn cứ pháp lý & Thiết kế cơ sở**: Quyết định `PO-DEC-20261103-01` tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 26; Luật Doanh nghiệp 2020; Luật Khoa học và Công nghệ 2013; Nghị định 76/2018/NĐ-CP; Nghị định 13/2023/NĐ-CP (PDPD).  

---

### 1. Bối Cảnh & Lý Do Thay Đổi (Why)

- **Hiện trạng cũ (Current State / As-Is)**:
  - Trên Cổng Nâng Cấp Vai Trò (`/profile/upgrade`), biểu mẫu Đăng ký Gian hàng Bên Bán (`#sellerModal`) chỉ cho phép nhập một trường text tự do duy nhất: *"Tên Đơn Vị Cung Ứng / Viện Trường / Trung Tâm R&D"* cùng các dropdown chọn lĩnh vực TT17, Sở KH&CN và ô mô tả năng lực.
  - Không thu thập Mã số thuế (MST), không có cơ chế tra cứu/đối soát pháp nhân và không yêu cầu bất kỳ tài liệu chứng minh tư cách pháp nhân nào (như Giấy phép ĐKKD hoặc Quyết định thành lập tổ chức KH&CN).
- **Vấn đề / Nỗi đau & Rủi ro Vận hành (Friction & Serious Risks)**:
  1. **Rủi ro mạo danh (Impersonation Fraud)**: Bất kỳ người dùng nào cũng có thể nhập tên của Viện Hàn lâm KH&CN Việt Nam, Đại học Quốc gia, Viện Nghiên cứu trọng điểm hoặc các Doanh nghiệp công nghệ lớn để mở gian hàng Seller.
  2. **Lỗ hổng Sở hữu Trí tuệ (IP Infringement Risk)**: Người bán không thể chứng minh tư cách sở hữu hợp pháp hoặc quyền phân phối công nghệ, dẫn đến rủi ro tranh chấp tài sản trí tuệ khi niêm yết lên Sàn Chào Bán Quốc Gia.
  3. **Tắc nghẽn Thẩm định Cấp Sở (Reviewer Bottleneck)**: Cán bộ Sở KH&CN tại Cổng Công vụ (`/gov/approvals`, Tab SHOP) không có tài liệu pháp lý căn cứ để xét duyệt hồ sơ, làm đổ vỡ cam kết thời gian thẩm định (SLA 24 giờ).
- **Đề xuất mới (Proposed State / To-Be)**:
  - Cưỡng chế phân định 2 loại hình pháp nhân thông qua bộ chuyển đổi trực quan (Tabs / Radio):
    * **Nhánh 1: Doanh Nghiệp Cung Ứng / DN KH&CN (`ENTERPRISE`)**: Bắt buộc nhập MST, tích hợp nút *"Tra cứu MST"* tự động điền tên doanh nghiệp từ CSDL Quốc gia, và bắt buộc tải lên tệp Giấy phép ĐKKD (PDF $\le$ 10MB).
    * **Nhánh 2: Viện Nghiên Cứu / Trường Đại Học / Tổ Chức R&D (`INSTITUTION_RND`)**: Bắt buộc nhập Số Quyết định thành lập / Mã Giấy phép KH&CN, Tên Viện/Trường chính thức, và bắt buộc tải lên tệp Quyết định/Giấy phép (PDF $\le$ 10MB).
  - Khối thông tin dùng chung: Lĩnh vực TT17, Sở KH&CN địa bàn quản lý, Mô tả năng lực cung ứng (TRL 1-9) và Cam kết pháp lý & quyền SHTT.
  - Chuẩn hóa payload `SHOP` lưu vào `identity.approval_requests` và kích hoạt SLA thẩm định 24h.

---

### 2. Chi Tiết Thay Đổi Quy Chuẩn (Standardized Changes)

#### [ADD] REQ-UPG-05: Bắt Buộc Định Danh Pháp Nhân Khi Mở Gian Hàng Seller
Khi người dùng thuộc vai trò `PUBLIC_USER` hoặc `BUYER` gửi yêu cầu mở gian hàng Bên Bán (`SELLER`) tại `/profile/upgrade`, hệ thống MUST cưỡng chế người dùng lựa chọn chính xác một trong 2 loại hình chủ thể pháp nhân:
1. `ENTERPRISE` (Doanh nghiệp, Hợp tác xã, Doanh nghiệp Khoa học & Công nghệ).
2. `INSTITUTION_RND` (Viện Nghiên cứu, Trường Đại học, Học viện, Trung tâm R&D trực thuộc).
Hệ thống KHÔNG CHO PHÉP người dùng gửi đơn khi chưa chọn loại pháp nhân hoặc để trống các trường định danh pháp lý tương ứng.

#### [ADD] REQ-UPG-06: Thu Thập & Kiểm Chứng Tài Liệu Minh Chứng Pháp Lý
1. Đối với loại hình `ENTERPRISE`:
   - Bắt buộc nhập Mã số thuế (MST) và cung cấp chức năng *"Tra cứu MST"* kết nối Cổng CSDL Doanh nghiệp Quốc gia.
   - Bắt buộc tải lên tệp Giấy chứng nhận Đăng ký Doanh nghiệp (ĐKKD) định dạng PDF, kích thước tối đa 10MB.
2. Đối với loại hình `INSTITUTION_RND`:
   - Bắt buộc nhập Số Quyết định thành lập hoặc Mã Giấy phép hoạt động KH&CN do Bộ KH&CN/UBND Tỉnh/Cơ quan có thẩm quyền cấp.
   - Bắt buộc tải lên tệp Quyết định thành lập hoặc Giấy phép hoạt động KH&CN định dạng PDF, kích thước tối đa 10MB.

#### [ADD] BR-UPG-03: Quy Tắc Xác Thực Mã Định Danh Pháp Nhân (Tax Code & Decision Invariants)
1. **Quy tắc Mã số thuế (`taxCode`)**:
   - Độ dài: Đúng 10 chữ số (doanh nghiệp độc lập) hoặc 13 chữ số (chi nhánh, phụ thuộc), chỉ chứa ký tự số (regex: `^\d{10}(\d{3})?$`).
   - Kiểm chứng tự động: Khi bấm *"Tra cứu MST"*, hệ thống gọi API tra cứu dữ liệu doanh nghiệp; nếu hợp lệ, tự động gán tên doanh nghiệp vào ô tên đơn vị.
2. **Quy tắc Quyết định thành lập (`establishmentDecisionNo`)**:
   - Chuỗi ký tự độ dài tối thiểu 5 ký tự, không được chỉ chứa khoảng trắng hoặc ký tự đặc biệt vô nghĩa.
3. **Quy tắc Tên đơn vị (`orgName`)**:
   - Độ dài từ 5 đến 255 ký tự, thể hiện đúng tên pháp nhân đã đăng ký.

#### [ADD] BR-UPG-04: Ràng Buộc Tệp Văn Bản Pháp Lý PDF & Cam Kết Bản Quyền SHTT
1. **Kiểm tra tệp tin (File Invariants)**:
   - MIME Type: Bắt buộc `application/pdf`. Các tệp `.png`, `.jpg`, `.doc`, `.exe`... đều bị chặn ngay từ Client và Backend.
   - Kích thước tệp: Không được rỗng ($> 0$ bytes) và tối đa 10MB ($10 \times 1024 \times 1024$ bytes).
   - Tên tệp an toàn: Khử khuẩn (sanitize) ký tự đặc biệt, lưu trữ tệp lên Storage an toàn và sinh URL/Key đính kèm vào payload.
2. **Cam kết pháp lý & SHTT (`pledgeAgreed`)**:
   - Checkbox cam kết tuân thủ quy chế sàn, chịu trách nhiệm pháp lý về tính xác thực của tài liệu và quyền sở hữu công nghệ là trường bắt buộc (`true`).

#### [ADD] UI-UPG-002: Thiết Kế Modal Seller 2 Tabs & Khối Tải Lên Minh Chứng
- Giao diện Modal `#sellerModal` may đo theo bản vẽ SSOT tại `Specification/02_BASIC_DESIGN/TASK-00_PLATFORM_FOUNDATION_VA_COMMON/wireframe_nang_cap_tai_khoan_hub.html`.
- Bộ chuyển đổi 2 tabs pháp nhân mượt mà kèm icon nhận diện (`Building2` cho Doanh nghiệp, `Landmark` cho Viện/Trường R&D).
- Khu vực Upload tệp drag-and-drop có phản hồi tức thời tên tệp và dung lượng (MB).

#### [ADD] TEST-UPG-003: Bộ Kiểm Thử Đa Tầng Cho Hồ Sơ Seller Mới
1. **Unit Test Backend (C#)**: Kiểm thử FluentValidation chặn payload SHOP khi thiếu MST, thiếu QĐ thành lập, thiếu file URL hoặc file không phải PDF.
2. **Component Test Frontend (Vitest)**: Kiểm thử chuyển tab Doanh nghiệp $\leftrightarrow$ Viện Trường, nút Tra cứu MST, validate file size $> 10$MB, và chặn submit form khi thiếu thông tin.
3. **Playwright E2E**: Luồng người dùng từ `/profile/upgrade` $\rightarrow$ Mở Modal Seller $\rightarrow$ Chọn Viện/Trường $\rightarrow$ Điền QĐ và upload PDF $\rightarrow$ Nộp đơn $\rightarrow$ Nhận mã `REQ-SHOP-...` $\rightarrow$ CSDL PostgreSQL lưu trữ đúng `payload_json`.

---

### 3. CSDL & Hợp Đồng API Contracts Delta

#### 3.1. Cấu Trúc Bảng Dữ Liệu PostgreSQL
- Bảng: `identity.approval_requests` (Không thay đổi cấu trúc cột vật lý, tương thích ngược 100%).
- Cột `request_type`: `'SHOP'`.
- Cột `sla_deadline`: Tự động tính toán `NOW() + INTERVAL '24 hours'`.
- Cột `payload_json`: Mở rộng định dạng JSON chuẩn hóa:
```json
{
  "entityType": "ENTERPRISE",
  "taxCode": "0101234567",
  "establishmentDecisionNo": null,
  "orgName": "CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ & ĐMST QUỐC GIA",
  "legalDocUrl": "https://storage.nacentech.vn/legal-docs/2026/11/dkkd-0101234567.pdf",
  "legalDocFileName": "Giay_Phep_DKKD_Cong_Ty.pdf",
  "mainSector": "LV01",
  "province": "HN",
  "description": "Cung cấp nền tảng số và hệ sinh thái IoT công nghiệp đạt TRL 8.",
  "pledgeAgreed": true,
  "submittedAt": "2026-11-03T08:30:00.000Z"
}
```
*Đối với Viện / Trường R&D:*
```json
{
  "entityType": "INSTITUTION_RND",
  "taxCode": null,
  "establishmentDecisionNo": "128/QĐ-BKHCN",
  "orgName": "VIỆN NGHIÊN CỨU & ỨNG DỤNG CÔNG NGHỆ TIÊN TIẾN",
  "legalDocUrl": "https://storage.nacentech.vn/legal-docs/2026/11/qd-thanh-lap-128.pdf",
  "legalDocFileName": "Quyet_Dinh_Thanh_Lap_Vien.pdf",
  "mainSector": "LV07",
  "province": "HN",
  "description": "Sở hữu 05 Bằng độc quyền sáng chế về vật liệu Graphene TRL 6-7 sẵn sàng thương mại hóa.",
  "pledgeAgreed": true,
  "submittedAt": "2026-11-03T08:30:00.000Z"
}
```

#### 3.2. Endpoint Backend Tiếp Nhận
- **Route**: `POST /api/v1/governance/approvals`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "requestType": "SHOP",
  "scopeType": "PROVINCE",
  "scopeId": "HN",
  "payloadJson": "{ ... Chuỗi JSON theo cấu trúc trên ... }"
}
```

---

### 4. Ma Trận Tác Động (Cross-Surface & Cross-Epic Impact)

| Bề Mặt Tác Động | Hiện Trạng Cũ | Quyết Định Mới (CR-2026-021) | Trạng Thái Bàn Giao |
| :--- | :--- | :--- | :---: |
| **Basic Design (`Specification`)** | Form Seller chỉ có text tự do tên đơn vị | Cập nhật Mục 26, chuẩn hóa 2 nhánh pháp nhân (Doanh nghiệp vs Viện/Trường) | `BASIC_DESIGN_NACENTECH.md` Mục 26 |
| **Wireframe SSOT** | `wireframe_nang_cap_tai_khoan_hub.html` modal Seller 1 cột text đơn giản | Nâng cấp modal Seller 2 tabs pháp nhân, tra cứu MST, upload PDF $\le$ 10MB | `Specification/02_BASIC_DESIGN/` |
| **Living Spec (`TASK-00`)** | Chưa có đặc tả `REQ-UPG-05`, `REQ-UPG-06`, `BR-UPG-03`, `BR-UPG-04` | Bump version lên 1.17.0, tích hợp Spec Delta v17 | `SourceCode/specs/TASK-00_.../spec.md` |
| **Technical Plan (`TASK-00`)** | Chưa có thiết kế DTO validation cho payload `SHOP` | Thêm kiến trúc `SubmitShopApprovalPayloadDto` và FluentValidation | `SourceCode/specs/TASK-00_.../plan.md` |
| **Backend Identity Module** | Nhận `payloadJson` thô của `SHOP` không kiểm tra pháp nhân | Thêm validator kiểm tra MST/QĐ và tệp PDF bắt buộc | `SourceCode/backend/modules/identity/` |
| **Frontend Web Portal** | `src/app/profile/upgrade/page.tsx` `#sellerModal` form cũ không có upload file | Dựng UI 2 tabs chuẩn Wireframe, client-side validation và upload file | `SourceCode/frontend/src/app/profile/upgrade/page.tsx` |
| **Cổng Công Vụ (`/gov`)** | Tab SHOP chưa hiển thị tệp PDF minh chứng | Hiển thị link xem/tải tệp ĐKKD/QĐ thành lập để Lãnh đạo Sở thẩm định | `SourceCode/frontend/src/app/gov/approvals/` |

---

### 5. Tiêu Chuẩn Nghiệm Thu (Acceptance Criteria)

- [ ] **AC-CR-021.1 (Entity Type Selection)**: Người dùng bắt buộc phải chọn loại pháp nhân (Doanh nghiệp hoặc Viện/Trường/R&D). Không thể submit nếu chưa chọn.
- [ ] **AC-CR-021.2 (Tax Code & Lookup for Enterprise)**: Nhánh Doanh nghiệp bắt buộc nhập MST hợp lệ (10 hoặc 13 số). Nút "Tra cứu MST" hoạt động trơn tru và tự động điền Tên doanh nghiệp.
- [ ] **AC-CR-021.3 (Decision No for Institution)**: Nhánh Viện/Trường bắt buộc nhập Số QĐ thành lập hoặc Mã GP hoạt động KH&CN ($\ge 5$ ký tự).
- [ ] **AC-CR-021.4 (Mandatory Legal PDF Document)**: Cả 2 nhánh đều bắt buộc phải đính kèm tệp PDF minh chứng. Chặn ngay lập tức nếu tệp không phải PDF hoặc dung lượng $> 10$MB.
- [ ] **AC-CR-021.5 (Zero-Mock Payload Persistence)**: Payload gửi lên backend và lưu vào CSDL PostgreSQL bảng `identity.approval_requests` chứa đầy đủ các trường `entityType`, mã định danh, `legalDocUrl`, `legalDocFileName` và SLA 24 giờ.

---

### 6. Danh Mục Công Việc Phân Rã (Tasks Breakdown)

- `T-00.85` **[BE]** Mở rộng `SubmitApprovalRequestDto` và FluentValidation cho `requestType == "SHOP"`, kiểm tra có điều kiện theo `entityType`.
- `T-00.86` **[BE]** Unit tests cho validation payload `SHOP` có pháp nhân hợp lệ (Pass) và thiếu trường bắt buộc (Fail 400).
- `T-00.87` **[FE]** Nâng cấp UI Modal Seller trong `src/app/profile/upgrade/page.tsx` chuẩn 1:1 theo Wireframe mới (2 tab pháp nhân, tra cứu MST, upload file PDF).
- `T-00.88` **[FE]** Client-side validation chặn submit khi thiếu MST/QĐ thành lập hoặc file PDF.
- `T-00.89` **[Test]** Vitest + Playwright E2E kiểm thử form nâng cấp Seller mới.
- `T-00.90` **[Gate]** Kiểm toán đối soát PostgreSQL thật, xác minh Zero-Mock và nghiệm thu Gate 5.
