# Đặc Tả Yêu Cầu Kỹ Thuật (Feature Specification)
# TASK-04: HỒ SƠ CHÀO BÁN SELLER & BỘ LỌC ĐA TẦNG 18 NGÀNH SHTT

> **Mã Epic**: `TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC`  
> **Căn cứ**: Quyết định PO `PO-DEC-20261008-01` & `PO-DEC-20261008-04`, Basic Design `TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC/README.md`  
> **Trạng thái**: ✅ **Shipped (2026-10-10)** — Quality Gate 5 Final Accepted  
> **Độ ưu tiên**: P1 (Core Business Capability - Trọng tâm Sàn Giao Dịch Công Nghệ)

---

## 1. TỔNG QUAN VÀ MỤC TIÊU NGHIỆP VỤ (EXECUTIVE SUMMARY)

### 1.1. Bối Cảnh & Động Lực
Thị trường KH&CN Việt Nam đang thiếu cơ chế chuẩn hóa để bên bán (Seller - Viện nghiên cứu, Trường đại học, Doanh nghiệp ĐMST) công bố các giải pháp công nghệ, sáng chế và thiết bị thương mại. TASK-04 giải quyết nút thắt này bằng cách xây dựng:
1. **Bộ Tứ SHTT (IP Quad)**: Chuẩn hóa hồ sơ chuyển giao công nghệ gồm:
   - Thang đo mức độ sẵn sàng công nghệ TRL (1 – 9).
   - Tình trạng sở hữu trí tuệ (Bằng độc quyền sáng chế, Giải pháp hữu ích, Bí quyết công nghệ...).
   - Hình thức chuyển giao công nghệ (Li-xăng độc quyền/không độc quyền, Chuyển nhượng toàn bộ, Hợp tác R&D, Góp vốn).
   - Trạng thái thương mại hóa (Phòng thí nghiệm, Thử nghiệm hiện trường, Sẵn sàng thương mại hóa).
2. **Bộ Lọc Đa Tầng 18 Nhóm Ngành**: Tra cứu công nghệ chuẩn hóa theo Thông tư 17/2019/TT-BKHCN, hỗ trợ phân loại Sản phẩm/Thiết bị/Giải pháp, lọc theo mức TRL và tình trạng SHTT.
3. **Workspace Quản Lý Cho Seller**: Cho phép Seller theo dõi vòng đời hồ sơ chào bán, thống kê số kết nối Buyer, quản lý tài liệu DataRoom và trạng thái hiển thị.

---

## 2. TÁC NHÂN VÀ PHÂN QUYỀN (ACTORS & PERMISSIONS)

Tuân thủ ma trận phân quyền 3D Scoped RBAC của hệ sinh thái NacenTech:
- **Seller (Doanh nghiệp ĐMST, Viện, Trường)**: Tạo mới, cập nhật, gửi duyệt, ẩn/hiện hồ sơ chào bán thuộc quyền quản lý của đơn vị mình.
- **Buyer (Doanh nghiệp tìm mua, Nhà đầu tư)**: Tra cứu công khai, lọc đa tầng theo 18 ngành, xem chi tiết hồ sơ công nghệ, gửi yêu cầu kết nối chuyển giao hoặc đặt mua.
- **Public Guest**: Xem danh sách chào bán công khai, tra cứu bộ lọc 18 ngành, xem tóm tắt hồ sơ công nghệ (yêu cầu đăng nhập để liên hệ hoặc tải tài liệu DataRoom).
- **Admin / Sàn Giao Dịch (Validator)**: Duyệt hồ sơ chào bán từ trạng thái PENDING sang APPROVED, kiểm định tính hợp lệ của văn bằng SHTT.

---

## 3. DANH SÁCH YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

| Mã Yêu Cầu | Tên Yêu Cầu Chức Năng | Mô Tả Chi Tiết | Độ Ưu Tiên |
| :
---
 | :
---
 | :
---
 | :
---
: |
| **REQ-04-001** | Quản lý kho công nghệ Seller | Hiển thị bảng danh sách công nghệ do Seller sở hữu, lọc theo trạng thái (Bản nháp, Chờ duyệt, Đã niêm yết, Đã ẩn), thống kê KPI (Tổng công nghệ, Kết nối thành công, Lượt xem). | P1 |
| **REQ-04-002** | Đăng mới hồ sơ chào bán (Form Wizard) | Cung cấp form nhập liệu chia bước: Thông tin chung, Phân loại loại hình (Sản phẩm/Thiết bị/Giải pháp), Toggle chuyển giao công nghệ & Bộ tứ SHTT, Giá bán & Thương mại, Tài liệu minh chứng. | P1 |
| **REQ-04-003** | Ràng buộc điều kiện Bộ Tứ SHTT | Nếu `has_tech_transfer = true`, bắt buộc nhập đầy đủ 5 trường: Nguồn gốc nghiên cứu, Mức TRL (1-9), Tình trạng SHTT, Hình thức chuyển giao, Trạng thái thương mại hóa. | P1 |
| **REQ-04-004** | Danh sách & Bộ lọc 18 ngành công khai | Trang chủ tab `/chao-ban-cong-nghe` hỗ trợ tìm kiếm từ khóa, bộ lọc phân loại (Tất cả, Thiết bị thương mại, Công nghệ chuyển giao SHTT), lọc theo 18 ngành kinh tế TT17, lọc TRL và Tình trạng SHTT. | P1 |
| **REQ-04-005** | Chi tiết hồ sơ chào bán công nghệ | Trang `/chao-ban-cong-nghe/[id]` hiển thị trực quan thông số kỹ thuật, huy hiệu mức TRL, chứng nhận SHTT (IP Trust Badge), thông tin đơn vị nghiên cứu/sở hữu, nút Gửi yêu cầu chuyển giao và Yêu cầu DataRoom. | P1 |
| **REQ-04-006** | Hỗ trợ 5 UX States | Mọi màn hình đáp ứng đầy đủ 5 trạng thái UX qua chuẩn `<Async>`: Loading, Empty, Error, Success, Partial. | P1 |
| **REQ-04-007** | Chọn Cơ quan quản lý & Phân cấp thẩm định Cấp 2 | Form đăng ký bắt buộc chọn Sở KH&CN tiếp nhận thẩm định (`managing_authority_id`, `scope_id` 63 tỉnh/thành) và tích chọn cam kết pháp lý. Hệ thống tự động tạo phiếu duyệt `ApprovalRequest` đẩy về Cổng Tác Nghiệp Cấp 2 `/gov`. | P1 |
| **REQ-04-008** | Chỉnh sửa hồ sơ chào bán Seller (`[id]/edit`) | Màn hình `/portal/seller/technologies/[id]/edit` theo wireframe chuẩn, cho phép Seller chỉnh sửa thông tin công nghệ, Bộ tứ SHTT, điều kiện giá, tạm ẩn/mở lại niêm yết hoặc xóa hồ sơ. | P1 |
| **REQ-04-009** | Quick Demand Modal (1 phút) kết nối 2 chiều | Modal tại `/chao-ban-cong-nghe/[id]` cho phép Bên mua nhập nhanh nhu cầu công nghệ (tiêu đề bài toán, ngân sách, tiến độ, hình thức hợp tác) để tạo liên kết tự động với hồ sơ chào bán. | P1 |

---

## 4. QUY TẮC NGHIỆP VỤ BẮT BUỘC (BUSINESS RULES)

- **`BR-SELLER-01`**: **Quy tắc phân loại loại hình chào bán (Offer Type)**:
  - Chỉ chấp nhận 1 trong 3 loại hình: `PRODUCT` (Sản phẩm), `DEVICE` (Thiết bị), `SOLUTION` (Giải pháp).
- **`BR-SELLER-02`**: **Ràng buộc điều kiện Bộ Tứ SHTT (Conditional IP Quad)**:
  - Khi `has_tech_transfer = true`: Các trường `developer_origin`, `trl_level`, `ip_status`, `transfer_method`, `commercial_status` **bắt buộc không được null**.
  - Khi `has_tech_transfer = false`: Các trường thuộc Bộ tứ SHTT được phép null (bán thương phẩm thông thường).
- **`BR-SELLER-03`**: **Khoảng giá trị thang đo TRL (TRL Range)**:
  - `trl_level` phải là số nguyên nằm trong đoạn từ 1 đến 9:
    - 1–3: Nghiên cứu cơ bản & ý tưởng phòng thí nghiệm.
    - 4–6: Trình diễn nguyên mẫu & kiểm nghiệm môi trường mô phỏng.
    - 7–8: Vận hành thử nghiệm hiện trường quy mô bán công nghiệp.
    - 9: Hệ thống hoàn thiện, chứng minh vận hành thương mại thành công.
- **`BR-SELLER-04`**: **Quy tắc định dạng giá bán (Pricing Model)**:
  - `pricing_type` thuộc tập: `FIXED` (Giá cố định), `RANGE` (Khoảng giá), `CONTACT` (Thỏa thuận / Liên hệ báo giá).
  - Nếu `FIXED`: `price_amount > 0`.
  - Nếu `RANGE`: `price_min > 0`, `price_max >= price_min`.
- **`BR-SELLER-05`**: **Quy tắc xuất bản & Cổng kiểm duyệt 2 Cấp (Multi-Level Governance & Publication Gate)**:
  - Khi Seller gửi hồ sơ: Hồ sơ khởi tạo với trạng thái **`PENDING` (Chờ thẩm định)**. Hệ thống tạo liên kết `ApprovalRequest (Type = TECHNOLOGY_OFFER, ScopeType = PROVINCE, ScopeId = scope_id)`.
  - Nghiêm cấm Auto-approve trong môi trường Production thương mại.
  - Cán bộ/Lãnh đạo Sở KH&CN phụ trách địa bàn (Roles `PROVINCIAL_ADMIN`, `CLUSTER_ADMIN`) tại Cổng Tác Nghiệp Cấp 2 (`/gov/approvals`) thực hiện thẩm định:
    * `APPROVE`: Hồ sơ chuyển sang `APPROVED`, cập nhật `published_at`, chính thức niêm yết trên sàn công khai `/chao-ban-cong-nghe`.
    * `REJECT`: Hồ sơ chuyển sang `REJECTED`, ghi nhận lý do thẩm định của Sở, gửi thông báo cho Seller.
    * `REQUEST_CHANGES`: Hồ sơ chuyển sang `CHANGES_REQUESTED` để Seller cập nhật và nộp lại.
- **`BR-SELLER-06`**: **Quyền Hậu Kiểm & Thu Hồi Trung Ương (Super Admin Oversight - BR-ADM-007)**:
  - Chỉ Quản trị viên Tối cao (`SUPER_ADMIN` / `OPERATOR_ADMIN`) mới có thẩm quyền can thiệp thu hồi (`REVOKE`) một hồ sơ công nghệ đã được Sở KH&CN duyệt, nếu phát hiện tranh chấp văn bằng SHTT hoặc vi phạm quy chế sàn. Yêu cầu nhập `ReviewNote` tối thiểu 10 ký tự lưu vào `ApprovalAuditLog`.
- **`BR-SELLER-07`**: **Kiểm Soát Vòng Đời & Tự Động Tái Thẩm Định (Life-Cycle Re-Audit Trigger)**:
  - Khi cập nhật hồ sơ chào bán (`PUT`), nếu công nghệ có chuyển giao (`has_tech_transfer = true`) và có sự thay đổi giữa giá trị cũ và mới của: `trl_level`, `ip_status`, `ip_registration_number`, hoặc `transfer_method`:
    1. Hệ thống tự động chuyển trạng thái hồ sơ về `PENDING` (Chờ thẩm định lại).
    2. Reset `published_at = null` (tạm ẩn khỏi Sàn giao dịch công khai cho đến khi được duyệt lại).
    3. Cập nhật lý do thay đổi và gửi thông báo cảnh báo rõ ràng cho Seller trong response API.
    4. Các chỉnh sửa về mô tả tóm tắt, văn phong hoặc khoảng giá thông thường được cập nhật ngay mà không kích hoạt tái thẩm định.

---

## 5. MÔ HÌNH DỮ LIỆU & SCHEMA CSDL (DATA MODEL)

Bảng chính `tech_transfer_offers`, kết hợp với `offer_documents` và `offer_spec_values`:
- Khóa chính: `id` (UUID).
- Khóa ngoại liên kết: `organization_id`, `created_by`, `sector_code`.
- Khóa duy nhất: `offer_code` (`OFF-YYYYMMDD-XXXXX`).
- Trường định vị SHTT: `developer_origin`, `trl_level`, `ip_status`, `ip_registration_number`, `transfer_method`, `commercial_status`.
- Ràng buộc CSDL: `chk_tech_transfer_quad`, `chk_trl_range`, `chk_offer_type`, `chk_pricing_type`.

---

## 6. ĐẶC TẢ GIAO DIỆN 4 MÀN HÌNH (UI/UX SPECIFICATION)

1. **Màn 1: Quản lý Kho Công nghệ Seller (`/portal/seller/technologies`)**:
   - Khối KPI thống kê: Tổng hồ sơ, Đã niêm yết, Chờ duyệt, Kết nối thành công.
   - Bảng danh sách công nghệ kèm bộ lọc trạng thái và ô tìm kiếm nhanh.
   - Thao tác: Nút Đăng mới công nghệ, Xem chi tiết, Chỉnh sửa, Ẩn/Hiện, Xóa.
2. **Màn 2: Form Wizard Đăng Bán Công Nghệ (`/portal/seller/technologies/create`)**:
   - Bước 1: Thông tin cơ bản & Ngành kinh tế (18 ngành).
   - Bước 2: Toggle "Chuyển giao công nghệ / SHTT" -> Mở rộng khối Bộ Tứ SHTT (TRL 1-9, Bằng sáng chế, Hình thức chuyển giao, Đơn vị R&D).
   - Bước 3: Chính sách giá & Tài liệu minh chứng (DataRoom).
3. **Màn 3: Danh sách & Bộ Lọc 18 Ngành Công Khai (`/chao-ban-cong-nghe` - Tab Chính Web)**:
   - Thanh tìm kiếm từ khóa với gợi ý ngành nổi bật.
   - Tabs chuyển đổi: Tất cả, Thiết bị thương mại, Công nghệ chuyển giao SHTT.
   - Sidebar bộ lọc đa tầng: Chọn ngành (18 ngành TT17), Mức TRL (1-9), Trạng thái SHTT, Khoảng giá.
   - Grid thẻ công nghệ (Technology Cards) kèm huy hiệu TRL và IP Trust Badge.
4. **Màn 4: Chi tiết Hồ sơ Chào bán Công nghệ (`/chao-ban-cong-nghe/[id]`)**:
   - Header: Tên công nghệ, Mã hồ sơ, Ngành, Huy hiệu TRL và Bản quyền SHTT.
   - Tab nội dung: Tổng quan & Bài toán giải quyết, Thông số kỹ thuật theo ngành, Đơn vị nghiên cứu & Sở hữu, Danh mục tài liệu DataRoom.
   - Sidebar hành động: Nút "Gửi yêu cầu chuyển giao", "Đặt mua giải pháp", "Tải hồ sơ tóm tắt (Teaser PDF)".

---

## 7. TIÊU CHÍ NGHIỆM THU ĐỘC LẬP (ACCEPTANCE CRITERIA)

- **AC-04-1**: Seller có thể truy cập `/portal/seller/technologies`, xem danh sách công nghệ hiện có và thống kê KPI.
- **AC-04-2**: Seller có thể tạo mới công nghệ qua form `/portal/seller/technologies/create`; nếu bật chuyển giao công nghệ mà không chọn TRL hoặc SHTT, hệ thống hiển thị thông báo lỗi validate chính xác.
- **AC-04-3**: Người dùng công khai truy cập `/chao-ban-cong-nghe` (tab chính của web), thấy danh sách công nghệ niêm yết, lọc theo ngành và TRL hoạt động mượt mà.
- **AC-04-4**: Bấm vào một công nghệ chuyển sang `/chao-ban-cong-nghe/[id]`, hiển thị đầy đủ thông tin Bộ Tứ SHTT và nút gửi yêu cầu kết nối.
- **AC-04-5**: 100% test suites (Unit test BR-*, Contract test, Integration test, Playwright E2E) đạt trạng thái Passed.

---

## 9. ĐẶC TẢ DELTA V4: LIÊN KẾT PROFILE BÊN BÁN (SELLER) & XEM DOANH NGHIỆP THƯỜNG TRÊN TOÀN HỆ THỐNG
### 9.1. Bối Cảnh & Mục Tiêu Nghiệp Vụ
- **Căn cứ**: Quyết định PO/PM ngày 2026-10-13, tài liệu Thiết kế Cơ sở `BASIC_DESIGN_DELTA_ENT_SELLER_LINK.md`.
- **Nghiệp vụ**:
1. Trên màn hình danh sách chào bán `/chao-ban-cong-nghe` và chi tiết `/chao-ban-cong-nghe/[id]`, tên đơn vị chào bán phải chuyển thành Hyperlink có thể click dẫn trực tiếp đến Hồ sơ Doanh nghiệp `/enterprises/{taxCode}`.
2. Màn hình chi tiết `/chao-ban-cong-nghe/[id]` bổ sung Card / Widget "Đơn vị cung ứng / Doanh nghiệp chào bán" với thông tin: Tên DN, MST, Địa bàn, Loại hình chủ thể, Huy hiệu xác thực, và nút "Xem Hồ sơ Năng lực Doanh nghiệp".
3. Kế thừa hạt nhân `TASK-02`: Hệ thống hỗ trợ xem Doanh nghiệp thường (`SubjectType = 'ENTERPRISE'`) bên cạnh DN ĐMST (`INNOVATIVE_ENTERPRISE`). Nếu là DN thường chưa kê khai R&D/TNI, giao diện ẩn gracefully các tab này, tập trung vào Pháp lý, Địa bàn, Ngành nghề, Thông tin liên hệ.
4. Màn hình `/enterprises/[taxCode]` bổ sung Tab "Sản phẩm & Giải pháp đang chào bán" hiển thị các sản phẩm của chính doanh nghiệp đó đang niêm yết trên sàn.
5. Đảm bảo bảo vệ dữ liệu PII/Tài chính (`BR-02-002`): Doanh thu, Kinh phí R&D và SĐT người liên hệ của bên bán mặc định được che `[BẢO MẬT]` đối với khách công khai.

---

## 10. ĐẶC TẢ DELTA V5: CHUẨN HÓA TOÀN DIỆN FORM CHÀO BÁN SELLER 4 BƯỚC, BỘ THÔNG SỐ 18 NGÀNH & TRỢ LÝ AI (SPEC KIT DELTA V5)
### 10.1. Bối Cảnh & Mục Tiêu Nghiệp Vụ (Executive Summary)
- **Căn cứ pháp lý & kỹ thuật**:
- Quyết định PO `PO-DEC-20261008-01`, `PO-DEC-20261008-04`, `PO-DEC-20261008-07` (Kiến Trúc Phân Tầng Trợ Lý AI Nhập Liệu Human-in-the-Loop & DTO Mở).
- Basic Design Wireframes: `wireframe_tao_ho_so_chao_ban.html`, `wireframe_chinh_sua_ho_so_chao_ban.html`, `DANH_MUC_TRUONG_CHAO_BAN_VA_BO_LOC_18_NGANH.html`.
- Sheet nguồn Master: `C.bán SP` (89 dòng, 33 cột) và `Bo_loc_Cban` (1,483 dòng, 21 cột) trong `Nacentwin_20260924_bo_loc_da_sua.xlsx`.
- Hợp đồng DTO mở: `DD-02-ai-extractor-contracts.md` (`POST /api/v1/ai/extract-patent-specs`).
- **Mục tiêu cốt lõi**:
Khắc phục toàn diện các khoảng trống giữa mã nguồn nguyên mẫu ban đầu và Thiết kế Cơ sở, nâng cấp Form tạo mới (`/portal/seller/technologies/create`) và Form chỉnh sửa (`/portal/seller/technologies/[id]/edit`) thành Biểu mẫu Chào bán Chuyên sâu 4 Bước chuẩn quốc tế, tích hợp trọn vẹn 10 điểm chức năng trọng yếu phục vụ bên bán (Seller), đồng bộ CSDL `offer_spec_values`, `offer_documents` và trợ lý AI gợi ý nhập liệu.
### 10.2. Danh Sách 10 Yêu Cầu Chức Năng Bổ Sung (Functional Requirements REQ-04-010 Đến REQ-04-019)
| Mã Yêu Cầu | Tên Yêu Cầu Chức Năng | Mô Tả Chi Tiết Kỹ Thuật & Nghiệp Vụ | Trọng Tâm Giao Diện / API |
| :--- | :--- | :--- | :--- |
| **`REQ-04-010`** | Form Wizard 4 Bước Kèm Stepper Tiến Trình | Chuyển đổi form cuộn đơn lẻ thành Biểu mẫu Wizard 4 bước: **Bước 1: Thông tin bắt buộc & Tra cứu** (Loại chào bán Sản phẩm/Thiết bị/Giải pháp; Toggle Chuyển giao SHTT; Tên; Mô tả ngắn; Bài toán giải quyết; Ngành công nghiệp); **Bước 2: Thông số kỹ thuật & 18 Ngành** (Bộ mẫu ngành, bảng Key-Value động thêm/xóa dòng); **Bước 3: Giá & Điều kiện thương mại** (Hình thức giá, Giá cụ thể/khoảng giá, Tiền tệ VND/USD, Đơn vị tính, Thời gian bàn giao, Bảo hành, Lắp đặt, Phạm vi cung cấp, Điều kiện thanh toán); **Bước 4: Minh chứng SHTT, TRL & Quản trị** (TRL 1-9, Tình trạng SHTT, Upload Scan bằng SHTT/TRL/Brochure/Video demo, Phân quyền xem, Đầu mối TTO, Cơ quan quản lý Sở KH&CN Cấp 2 và Cam kết pháp lý). Stepper bên trái hiển thị trực quan tiến trình và trạng thái hoàn thành. | UI Stepper, Wizard Form State |
| **`REQ-04-011`** | Cụm Upload Media Đa Phương Tiện | Bổ sung khu vực tải lên media: (1) **Ảnh đại diện** (`main_image` / `CHUNG-40` - 1 ảnh chính crop tỷ lệ 16:9/4:3, JPG/PNG $\le 5\text{MB}$); (2) **Thư viện ảnh bổ sung** (`gallery_images` / `CHUNG-41` - tối đa 6 ảnh chi tiết cấu tạo, dây chuyền, ứng dụng thực tế); (3) **Tài liệu Catalogue / Brochure** (`catalogue_pdf` / `TL-104` - PDF tài liệu kỹ thuật $\le 25\text{MB}$); (4) **Video giới thiệu / Demo** (`video_demo` / `CHUNG-42` - nhúng URL YouTube/Vimeo hoặc tệp MP4 $\le 50\text{MB}$). Kèm Drag & Drop và xem trước trực tiếp. | Media Upload Component, Preview Modal |
| **`REQ-04-012`** | Bảng Thông Số Kỹ Thuật 18 Ngành Động | Tại Bước 2, tự động tải danh sách thông số kỹ thuật gợi ý theo `sector_code` của 18 nhóm ngành công nghiệp TT17 (`AG`, `FOOD`, `DRINK`, `MECH`, `ELEC`, `ENV`, `BUILD`, `LOG`, `HOSP`, `IT`, `SCI`, `TEXT`, `WOOD`, `CHEM`, `PHARMA`, `OPT`, `FURN`, `OTHER`). Giao diện bảng Key-Value cho phép: Sửa Tên thông số (`spec_name`), Giá trị (`spec_value`), Đơn vị đo (`unit`), Nút xóa dòng và Nút `+ Thêm thông số mới`. Ngăn chặn trùng lặp thông số trong cùng hồ sơ. | Dynamic Key-Value Table, `offer_spec_values` |
| **`REQ-04-013`** | Minh Chứng SHTT & TRL Kèm Quyền DataRoom | Cung cấp cụm tải tệp minh chứng: Tải bản scan Bằng Độc quyền Sáng chế / GPHI / Quyết định chấp nhận đơn hợp lệ (`PATENT_CERT` / `TL-106`) và Báo cáo kiểm định / Thử nghiệm lab / Biên bản nghiệm thu thực tế (`TRL_EVIDENCE` / `TL-108`). Cấu hình quyền xem riêng (`access_scope`): `PUBLIC` (Công khai cho toàn bộ khách thăm sàn), `AFTER_CONNECTION` (Chỉ mở tải cho Bên Mua sau khi gửi yêu cầu kết nối thành công), hoặc `ADMIN_ONLY` (Chỉ Cán bộ Sở KH&CN thẩm định). | DataRoom File Manager, `offer_documents` |
| **`REQ-04-014`** | Dải Thang Đo TRL 9 Cấp Độ Chuẩn Hóa | Thay thế dải chọn khuyết (TRL 4-9) thành đầy đủ 9 cấp độ TRL chuẩn quốc tế: **Nhóm R&D** (TRL 1: Quan sát nguyên lý; TRL 2: Khái niệm ứng dụng; TRL 3: Bằng chứng thực nghiệm PoC); **Nhóm Thử nghiệm** (TRL 4: Kiểm chứng lab; TRL 5: Kiểm chứng môi trường mô phỏng; TRL 6: Nguyên mẫu kiểm nghiệm môi trường tương đương); **Nhóm Thương mại** (TRL 7: Mô hình Pilot bán công nghiệp; TRL 8: Hệ thống hoàn chỉnh kiểm định đạt chuẩn; TRL 9: Vận hành thương mại thành công trên thị trường). Giao diện Radio Grid 9 nút trực quan kèm màu sắc phân cấp chuyên nghiệp. | Radio Grid 9 Nấc, TRL Tooltip, `trl_level` |
| **`REQ-04-015`** | Bổ Sung Ô Nhập Đơn Vị Tính & Loại Tiền Tệ | Tại Bước 3 (Chính sách giá), hiển thị rõ ràng: (1) Dropdown chọn loại tiền tệ `currency`: `VND` (Mặc định - Đồng Việt Nam), `USD` (Đô la Mỹ), `EUR` (Euro); (2) Ô nhập / Combobox có gợi ý đơn vị tính `unit`: `chiếc`, `bộ`, `hệ thống`, `dây chuyền`, `gói chuyển giao`, `quy trình`, `li-xăng/năm`... Bắt buộc đồng bộ khi chọn giá cố định (`FIXED`) hoặc khoảng giá (`RANGE`). | Price Form Inputs, Currency Selector |
| **`REQ-04-016`** | Khai Báo Đầu Mối TTO & Cán Bộ Chuyển Giao | Hiển thị cụm trường thông tin người phụ trách giao dịch công nghệ: Họ tên người phụ trách (`contact_name` / `NCC-98`); Chức vụ / Bộ phận / Phòng TTO (`contact_point_role` / `NCC-99`, ví dụ: *Chuyên viên TTO*, *Trưởng phòng R&D*, *Giám đốc Trung tâm Chuyển giao*); Điện thoại & Email liên hệ. Áp dụng bảo vệ PDPD NĐ 13/2023: Ẩn điện thoại/email với khách công khai, tự động mở cho Bên Mua sau khi gửi yêu cầu kết nối. | TTO Contact Fields, PDPD Masking |
| **`REQ-04-017`** | Điều Kiện Thương Mại Chi Tiết | Tại Bước 3, bổ sung các trường thông tin điều kiện thương mại: (1) Thời gian bàn giao & triển khai (`delivery_timeline` / `GIA-77`, ví dụ: *30 ngày kể từ khi ký hợp đồng*); (2) Thời hạn & điều kiện bảo hành (`warranty_terms`, ví dụ: *12 tháng bảo hành thiết bị, hỗ trợ kỹ thuật 24/7*); (3) Lắp đặt & vận hành thử (`installation_support` - Có/Không hỗ trợ chuyên gia hướng dẫn vận hành); (4) Phạm vi cung cấp (`supply_scope` / `GIA-76` - Toàn quốc, Tỉnh/thành, Xuất khẩu); (5) Điều kiện thanh toán (`payment_terms` / `GIA-78`). | Commercial Terms Card, Structured Fields |
| **`REQ-04-018`** | Cơ Chế Lưu Nháp Trạng Thái DRAFT | Bổ sung nút "Lưu nháp" tại thanh tiêu đề và chân trang của Form Wizard. Cho phép Seller lưu tạm dữ liệu bất kỳ lúc nào với trạng thái `DRAFT`: Backend chỉ kiểm tra tiêu đề `title` ($\ge 3$ ký tự), nới lỏng toàn bộ các điều kiện bắt buộc của Bộ Tứ SHTT và Cam kết pháp lý. Tích hợp `localStorage` tự động sao lưu dữ liệu mỗi 30 giây để phục hồi form nếu vô tình đóng trình duyệt. Hồ sơ nháp không hiển thị trên sàn và không gửi thẩm định Sở. | Draft Save Action, LocalStorage Persistence |
| **`REQ-04-019`** | Widget Trợ Lý AI Gợi Ý Điền Form Tự Động | Nhúng Card Widget Trợ lý AI tại thanh điều hướng bên trái Form Wizard: Cho phép Seller tải lên file Catalogue PDF, bản chụp Bằng SHTT hoặc tài liệu thuyết minh. Kết nối API `POST /api/v1/ai/extract-patent-specs` theo `PO-DEC-20261008-07` để tự động bóc tách các trường: Tên công nghệ, Mô tả, Bài toán giải quyết, TRL đề xuất, Tình trạng SHTT, Đơn vị R&D, Thông số kỹ thuật chính. Tự động điền gợi ý vào Form Wizard kèm badge `✨ AI Gợi ý`. Tuân thủ nguyên tắc Human-in-the-Loop: AI không ghi trực tiếp vào DB, Seller kiểm tra và bấm nộp; Zero-Dependency Fallback nếu AI lỗi. | AI Extractor Widget, Human-in-the-Loop |

---

### 10.3. Quy Tắc Nghiệp Vụ Bổ Sung (Business Rules BR-SELLER-08 Đến BR-SELLER-12)
- **`BR-SELLER-08`**: **Quy Tắc Lưu Nháp & Nới Lỏng Kiểm Tra Dữ Liệu (Loose Draft Validation Rule)**:
- Khi Seller thực hiện hành động "Lưu nháp" (`action = 'SAVE_DRAFT'` hoặc payload gửi trạng thái `status = 'DRAFT'`):
1. Điều kiện bắt buộc duy nhất: `title` không được null hoặc rỗng, độ dài tối thiểu 3 ký tự.
2. Cho phép bỏ qua hoàn toàn các ràng buộc nghiêm ngặt: `BR-SELLER-02` (Ràng buộc Bộ Tứ SHTT), `BR-SELLER-04` (Quy định giá cụ thể/khoảng giá), và `BR-SELLER-05` (Cam kết pháp lý & chọn Sở KH&CN tiếp nhận).
3. Trạng thái hồ sơ được gán là `DRAFT`.
4. Hồ sơ trạng thái `DRAFT` tuyệt đối **không** được niêm yết trên Sàn giao dịch công khai `/chao-ban-cong-nghe` và **không** sinh phiếu `ApprovalRequest` gửi đến Cổng Tác Nghiệp Cấp 2 `/gov`.
5. Chỉ khi Seller bấm "Gửi chờ duyệt" (`action = 'SUBMIT_FOR_REVIEW'`), hệ thống mới kích hoạt toàn bộ bộ kiểm tra nghiêm ngặt `BR-SELLER-01` đến `BR-SELLER-07`.
- **`BR-SELLER-09`**: **Quy Tắc Toàn Vẹn Thang Đo 9 Cấp Độ TRL (Full 9-Scale TRL Integrity)**:
- Khi `has_tech_transfer = true`, giá trị `trl_level` bắt buộc là một số nguyên thuộc tập hợp hợp lệ $\{1, 2, 3, 4, 5, 6, 7, 8, 9\}$.
- Quy định phân tầng và yêu cầu minh chứng tương ứng:
* **Cấp độ $1 \le \text{TRL} \le 3$ (Nghiên cứu sớm / Lab R&D)**: Bắt buộc khai báo đơn vị nghiên cứu phát triển (`developer_origin`), khuyến khích đính kèm tài liệu thuyết minh đề tài hoặc bài báo khoa học.
* **Cấp độ $4 \le \text{TRL} \le 6$ (Thử nghiệm & Pilot)**: Khuyến nghị đính kèm biên bản thử nghiệm phòng thí nghiệm hoặc báo cáo trình diễn nguyên mẫu mô phỏng.
* **Cấp độ $7 \le \text{TRL} \le 9$ (Vận hành & Thương mại)**: Bắt buộc khai báo Số văn bằng SHTT (`ip_registration_number`) hoặc đính kèm biên bản nghiệm thu hiện trường / bằng chứng vận hành thực tế tại nhà máy/doanh nghiệp.
- **`BR-SELLER-10`**: **Phân Định Quyền Truy Cập Minh Chứng & Bảo Mật DataRoom (Evidence Confidentiality Rule)**:
- Mọi tệp tài liệu tải lên thuộc danh mục `offer_documents` bắt buộc phải được gắn một trong ba cấp độ truy cập (`access_scope`):
* `PUBLIC`: Tài liệu công khai, người dùng vãng lai và Bên Mua được phép tải trực tiếp từ Sàn công nghệ.
* `AFTER_CONNECTION`: Tài liệu bảo mật thương mại (bí quyết công nghệ, sơ đồ thiết kế chi tiết); hệ thống chỉ hiển thị tên tệp và loại tài liệu, link tải chỉ được cấp cho Bên Mua sau khi gửi Yêu cầu kết nối (`ConnectionRequest`) thành công và được xác thực.
* `ADMIN_ONLY`: Tài liệu mật phục vụ kiểm định tính hợp pháp; chỉ Cán bộ Sở KH&CN phụ trách địa bàn tại Cổng Tác Nghiệp Cấp 2 `/gov` và Quản trị viên tối cao sàn có quyền truy cập.
- Hệ thống kiểm tra an toàn tệp: Chặn các file thực thi nguy hại, chỉ cho phép các đuôi mở rộng `.pdf`, `.jpg`, `.jpeg`, `.png`, `.docx`, `.xlsx`, `.mp4`. Dung lượng tối đa: 25MB đối với tài liệu văn bản, 50MB đối với video.
- **`BR-SELLER-11`**: **Quy Chuẩn Toàn Vẹn Thông Số Kỹ Thuật Động (Dynamic Specifications Constraint)**:
- Đối với bảng thông số kỹ thuật `offer_spec_values`:
1. Số lượng dòng thông số kỹ thuật tối đa cho mỗi hồ sơ chào bán là 50 dòng.
2. Không cho phép trùng lặp tên thông số (`spec_name`) trong cùng một hồ sơ (so sánh không phân biệt chữ hoa/thường sau khi chuẩn hóa khoảng trắng).
3. Mỗi dòng thông số hợp lệ bắt buộc có `spec_name` (độ dài 2–255 ký tự) và `spec_value` (độ dài 1–2000 ký tự). Đơn vị đo `unit` là trường tùy chọn.
- **`BR-SELLER-12`**: **Cơ Chế An Toàn Cho Trợ Lý AI Gợi Ý Human-in-the-Loop (PO-DEC-20261008-07)**:
- Dịch vụ AI Extractor (`POST /api/v1/ai/extract-patent-specs`) chỉ hoạt động như một công cụ hỗ trợ gợi ý (Suggester).
- Tuyệt đối nghiêm cấm việc Provider AI tự động ghi trực tiếp (`Direct DB Write`) vào CSDL. Mọi thông tin do AI bóc tách chỉ được trả về Frontend dưới dạng bản nháp DTO (`TechTransferDraftDto`).
- Giao diện Form Wizard phải đánh dấu trực quan (Badge hoặc viền sáng `✨ AI Gợi ý`) tại các trường dữ liệu do AI điền tự động. Seller là chủ thể duy nhất có quyền kiểm tra, chỉnh sửa, chấp nhận hoặc xóa bỏ các giá trị này trước khi lưu.
- Cơ chế Zero-Dependency Fallback: Nếu dịch vụ AI gặp sự cố (quá tải quota, mất mạng, file không nhận dạng được), hệ thống hiển thị thông báo nhẹ nhàng và duy trì Form Wizard hoạt động 100% bằng chế độ nhập tay, không được làm gián đoạn quy trình của người dùng.

---

### 10.4. Đặc Tả Giao Diện & Trải Nghiệm Người Dùng (UI/UX Specifications)
- **`UI-04-010`**: **Thanh Điều Hướng Stepper Tiến Trình (`FormStepper`)**:
- Đặt tại cột bên trái (desktop, độ rộng 260px) hoặc thanh ngang (mobile) gồm 4 nấc:
* Nấc 1: *1. Thông tin bắt buộc* (Icon FileText / Check).
* Nấc 2: *2. Thông số & ngành* (Icon Sliders / Layers).
* Nấc 3: *3. Giá & thương mại* (Icon DollarSign / Award).
* Nấc 4: *4. Minh chứng & gửi duyệt* (Icon ShieldCheck / Send).
- Cho phép click chuyển đổi nhanh giữa các bước đã đi qua hợp lệ.
- **`UI-04-011`**: **Widget Trợ Lý AI Khảo Sát & Gợi Ý (`AiScanAssistantCard`)**:
- Đặt tại cột sidebar bên trái bên dưới thanh Stepper. Thiết kế tone màu cyan-50 viền cyan-200.
- Có nút upload file "Thử tải tài liệu / Catalogue →", hiển thị spinner khi AI đang phân tích, và nút "Áp dụng toàn bộ gợi ý".
- **`UI-04-012`**: **Bảng Nhập Thông Số Động (`DynamicSpecTable`)**:
- Đặt tại Bước 2. Bố cục bảng 4 cột: Tên thông số (w-2/5), Giá trị (w-2/5), Đơn vị (w-1/5), Thao tác (icon Trash2).
- Nút `+ Thêm thông số kỹ thuật` nổi bật với nét viền đứt nét (dashed border).
- **`UI-04-013`**: **Dải Nút Bấm Thang Đo TRL 9 Cấp (`TrlSelectorGrid`)**:
- Đặt tại Bước 4. Giao diện Grid 9 nút (3x3 trên màn hình nhỏ hoặc 9 cột trên desktop). Mỗi nút có số cấp độ to đậm (1 đến 9), viền đổi màu theo 3 dải (Lam R&D $\rightarrow$ Vàng Pilot $\rightarrow$ Ngọc Thương mại), kèm tooltip giải thích chi tiết khi hover.
- **`UI-04-014`**: **Cụm Quản Trị Tệp Minh Chứng & DataRoom (`EvidenceUploadList`)**:
- Danh sách tệp minh chứng hiển thị dạng card nhỏ: Tên file, kích thước, dropdown chọn quyền xem (`Công khai`, `Chỉ sau kết nối`, `Chỉ Sở KH&CN duyệt`), và nút Xóa file.

---

### 10.5. Thiết Kế Mở Rộng CSDL & Hợp Đồng DTO (Data Model & API Contracts)
#### Mô Hình Dữ Liệu PostgreSQL Mở Rộng:
1. **Bảng `technology.offer_spec_values`**:
- `id` (UUID PK, default `gen_random_uuid()`).
- `offer_id` (UUID FK $\rightarrow$ `technology.seller_technology_offers(id)` ON DELETE CASCADE).
- `spec_code` (VARCHAR(50), nullable).
- `spec_name` (VARCHAR(255) NOT NULL).
- `spec_value` (TEXT NOT NULL).
- `unit` (VARCHAR(50), nullable).
- `created_at` (TIMESTAMPTZ DEFAULT clock_timestamp()).
2. **Bảng `technology.offer_documents`**:
- `id` (UUID PK, default `gen_random_uuid()`).
- `offer_id` (UUID FK $\rightarrow$ `technology.seller_technology_offers(id)` ON DELETE CASCADE).
- `document_type` (VARCHAR(50) NOT NULL: `CATALOGUE`, `PATENT_CERT`, `TRL_EVIDENCE`, `VIDEO`, `OTHER`).
- `file_name` (VARCHAR(255) NOT NULL).
- `file_url` (TEXT NOT NULL).
- `file_size_bytes` (BIGINT NOT NULL).
- `access_scope` (VARCHAR(30) NOT NULL DEFAULT 'AFTER_CONNECTION': `PUBLIC`, `AFTER_CONNECTION`, `ADMIN_ONLY`).
- `created_at` (TIMESTAMPTZ DEFAULT clock_timestamp()).
3. **Mở rộng bảng `technology.seller_technology_offers`**:
- `main_image_url` (TEXT, nullable).
- `gallery_image_urls` (TEXT[], nullable).
- `delivery_timeline` (VARCHAR(255), nullable).
- `warranty_terms` (VARCHAR(255), nullable).
- `supply_scope` (VARCHAR(255), nullable).
- `payment_terms` (TEXT, nullable).
- `installation_support` (BOOLEAN DEFAULT TRUE).
#### Mở Rộng Hợp Đồng API:
- `POST /api/v1/portal/seller/technologies` & `PUT /api/v1/portal/seller/technologies/{id}`:
- Tiếp nhận mở rộng: `specValues[]`, `documents[]`, `mainImageUrl`, `galleryImageUrls[]`, `deliveryTimeline`, `warrantyTerms`, `supplyScope`, `paymentTerms`, `installationSupport`, `action` (`SAVE_DRAFT` hoặc `SUBMIT_FOR_REVIEW`).
- `POST /api/v1/ai/extract-patent-specs` (PO-DEC-20261008-07):
- Request: `multipart/form-data` chứa `file` (PDF/JPG/PNG).
- Response: `TechTransferDraftDto` trả về các trường trích xuất để frontend điền gợi ý vào Form Wizard.

---

### 10.6. Tiêu Chí Nghiệm Thu Mở Rộng Delta v5 (Acceptance Criteria AC-04-010 Đến AC-04-019)
- **`AC-04-010`**: Seller truy cập `/portal/seller/technologies/create`, giao diện hiển thị chuẩn Stepper 4 bước; người dùng chuyển qua lại các bước mượt mà kèm validate dữ liệu từng bước.
- **`AC-04-011`**: Seller có thể tải ảnh đại diện, album ảnh bổ sung, brochure PDF và link video; hiển thị xem trước thumbnail chính xác.
- **`AC-04-012`**: Khi chọn một trong 18 ngành TT17, hệ thống gợi ý đúng các thông số mẫu ngành tương ứng; Seller thêm, sửa, xóa dòng thông số kỹ thuật hoạt động hoàn hảo và lưu trữ đúng vào CSDL.
- **`AC-04-013`**: Seller tải tệp scan bằng SHTT hoặc báo cáo TRL và cấu hình quyền xem `Chỉ sau kết nối`; khách vãng lai trên Sàn công khai `/chao-ban-cong-nghe/[id]` thấy file bị khóa và được yêu cầu kết nối để mở tải.
- **`AC-04-014`**: Bảng chọn TRL hiển thị đầy đủ 9 nấc (TRL 1 đến TRL 9) kèm diễn giải nghiệp vụ chuẩn hóa; Seller có thể chọn bất kỳ cấp độ nào từ 1 đến 9.
- **`AC-04-015`**: Ô nhập Đơn vị tính (`unit`) và Loại tiền tệ (`currency`: VND/USD) hiển thị rõ ràng và lưu trữ chính xác.
- **`AC-04-016`**: Trường Đầu mối TTO / Phụ trách chuyển giao được điền và che chắn PDPD thành công.
- **`AC-04-017`**: Các điều kiện thương mại chi tiết (bàn giao, bảo hành, lắp đặt, phạm vi) được lưu và hiển thị chi tiết trên trang hồ sơ công nghệ.
- **`AC-04-018`**: Seller bấm nút "Lưu nháp" khi mới chỉ điền tiêu đề công nghệ; hồ sơ được lưu thành công với status `DRAFT`, không sinh phiếu duyệt Sở KH&CN và không lộ trên sàn công khai. LocalStorage tự động khôi phục dữ liệu nếu reload trang.
- **`AC-04-019`**: Khi tải tài liệu vào Widget Trợ lý AI, hệ thống bóc tách và đổ gợi ý vào Form Wizard kèm nhãn `✨ AI Gợi ý`; Seller xác nhận và nộp thành công; nếu dịch vụ AI ngoại tuyến, form nhập tay vẫn hoạt động 100%.

---

## 11. ĐẶC TẢ DELTA V6: TÁI CẤU TRÚC FORM TẠO/SỬA HỒ SƠ CHÀO BÁN SELLER ĐỒNG BỘ 100% WIREFRAME GỐC & 4 LỚP TRƯỜNG EXCEL MASTER (SPEC KIT DELTA V6)

### 11.1. Bối Cảnh Chiến Lược & Triết Lý Thiết Kế Kết Hợp (Phương Án 1 + 2)

#### 11.1.1. Bối Cảnh Kỹ Thuật & Nghiệp Vụ
- **Căn cứ**: Quyết định PO ngày 2026-10-19; Wireframe Basic Design gốc `wireframe_tao_ho_so_chao_ban.html` (Màn hình 20 trong bộ thiết kế cơ sở); Báo cáo chuẩn hóa 4 lớp trường `BAO_CAO_DANH_MUC_TRUONG_PHAN_CUNG_SELLER.html` trích xuất từ 2 sheet nguồn Master `C.bán SP` (89 dòng, 33 cột) và `Bo_loc_Cban` (1,483 dòng, 21 cột).
- **Vấn đề tồn tại**:
  1. *Friction cao trong tiếp nhận hồ sơ*: Quy trình tạo hồ sơ cũ buộc người dùng phải đi qua lần lượt cả 4 bước để có thể nộp duyệt, tạo rào cản lớn đối với các Viện/Trường/Doanh nghiệp chỉ muốn niêm yết nhanh công nghệ (Fast-track Onboarding).
  2. *Thiếu đồng bộ với Wireframe gốc*: Wireframe gốc đã bố trí cụm **Hình thức công bố giá** và **Khung chọn TRL (1–9) màu vàng** ngay tại Bước 1, nhưng các phiên bản trước đây lại tách rời hoặc đẩy sang bước sau.
  3. *Thông số kỹ thuật tự chế*: Bước 2 hiện đang sử dụng 4 dòng thông số preset cứng tự chế, chưa gắn kết với cấu trúc Lớp 2 (Kỹ thuật chung theo loại) và Lớp 3 (Đặc thù 18 nhóm ngành công nghiệp) của Sheet Master `Bo_loc_Cban`.
  4. *Thiếu hụt trường thương mại & minh chứng chuẩn*: Các trường nghiệp vụ cốt lõi của Lớp 4 (Hình thức chuyển giao ưu tiên KT-66, Nội dung bao gồm trong giá GIA-74, Thuế & chi phí phát sinh GIA-75, Phạm vi cung cấp GIA-76, Điều kiện thanh toán GIA-78, Bảo hành GIA-80, Hỗ trợ kỹ thuật GIA-81) chưa được chuẩn hóa thành các trường input chuyên biệt.

#### 11.1.2. Triết Lý Thiết Kế Kết Hợp (Hybrid Model: Phương Án 1 + Phương Án 2)
Áp dụng nguyên lý Chuỗi Giá Trị Chiến Lược của Michael Porter (Inbound Value Chain Optimization) và Kim Tự Tháp Barbara Minto (Kim chỉ nam: Kết luận/Hành động đi trước, Chi tiết bổ sung theo sau):
- **Trục 1: Tối Giản MVP Theo Wireframe Gốc (Phương Án 1 - Fast Track)**:
  - Giữ đúng 100% bố cục và hành vi của Wireframe Basic Design gốc tại Bước 1.
  - Gom toàn bộ các trường cốt lõi tối thiểu để hình thành một hồ sơ chào bán có nghĩa vào Bước 1: 6 trường định danh cơ bản + Cụm hình thức công bố giá + Khung chọn TRL 9 cấp độ (tự động bung ra khi chọn Có chuyển giao).
  - Tự động nạp thông tin chủ thể từ hồ sơ DN liên kết (`TASK-02`).
  - **QUY TẮC ĐỘT PHÁ UX**: Hoàn tất Bước 1 là ĐỦ ĐIỀU KIỆN bấm nút **"Gửi chờ duyệt hồ sơ" (Submit for Review)** ngay lập tức. Hệ thống tuyệt đối KHÔNG CHẶN người dùng nếu họ chưa hoàn thành các Bước 2, 3, 4.
- **Trục 2: Hành Lang Bổ Sung Chuyên Sâu 4 Lớp Trường Excel Master (Phương Án 2 - Optional Deep Enrichment)**:
  - Các Bước 2, 3, 4 đóng vai trò là "Thông tin bổ sung sau (không chặn đăng hồ sơ)" giúp gia tăng điểm tin cậy và khả năng khớp nối (Matching Accuracy) với Bên Mua.
  - Cung cấp nút chuyển tiếp: *"Tiếp tục: Thông số kỹ thuật (Tùy chọn) →"* cho phép Seller sang Bước 2 nếu muốn bổ sung chi tiết.
  - Tái cấu trúc toàn diện Bước 2 (Lớp 2 + Lớp 3 + Key-Value tự do), Bước 3 (Lớp 4 Điều kiện thương mại & Chuyển giao), Bước 4 (Pháp lý SHTT, Minh chứng DataRoom & Cổng tiếp nhận Sở KH&CN).

```mermaid
flowchart TD
    subgraph Step1 ["BƯỚC 1: THÔNG TIN BẮT BUỘC & TRA CỨU (MVP)"]
        S1_Core["6 Trường Lõi Bắt Buộc<br/>(Loại, Ngành, Chuyển giao, Tên, Mô tả, Bài toán)"]
        S1_Org["Thông Tin Chủ Thể Cung Cấp<br/>(Tự động nạp từ Hồ sơ DN)"]
        S1_Price["Cụm Hình Thức Công Bố Giá<br/>(Giá cụ thể / Khoảng giá / Liên hệ; ĐVT; Tiền tệ)"]
        S1_TRL{"Có Chuyển Giao Công Nghệ?"}
        S1_TRL_Box["Khung TRL 9 Nấc Màu Vàng (Bắt buộc chọn 1-9)"]
        S1_Core --> S1_Org --> S1_Price --> S1_TRL
        S1_TRL -- Có --> S1_TRL_Box
        S1_TRL -- Không --> S1_Ready["ĐỦ ĐIỀU KIỆN NỘP BƯỚC 1"]
        S1_TRL_Box --> S1_Ready
    end

    subgraph FastAction ["LỐI THOÁT NHANH (FAST-TRACK)"]
        SubmitBtn["NÚT: GỬI CHỜ DUYỆT HỒ SƠ<br/>(Tạo ApprovalRequest gửi Sở KH&CN)"]
        S1_Ready ==>|Đột phá UX: Không bị chặn| SubmitBtn
    end

    subgraph OptionalSteps ["HÀNH LANG LÀM GIÀU DỮ LIỆU TÙY CHỌN (OPTIONAL)"]
        Step2["BƯỚC 2: THÔNG SỐ KỸ THUẬT & 18 NGÀNH<br/>- Lớp 2: Kỹ thuật chung theo loại (TB/SP/GP)<br/>- Lớp 3: Thông số chuẩn 18 ngành (Bo_loc_Cban)<br/>- Bảng Key-Value tự do"]
        Step3["BƯỚC 3: ĐIỀU KIỆN THƯƠNG MẠI & CHUYỂN GIAO<br/>- Lớp 4 Excel: KT-66, GIA-74..78, GIA-80..81"]
        Step4["BƯỚC 4: PHÁP LÝ SHTT, MINH CHỨNG & DATAROOM<br/>- Bộ tứ SHTT (Số, Ngày, File Scan)<br/>- Minh chứng: TL-104, TL-105, TL-109, CHUNG-42<br/>- Quyền DataRoom 3 cấp & Cổng Sở KH&CN"]
    end

    S1_Ready -->|Nút: Tiếp tục Thông số (Tùy chọn) →| Step2
    Step2 --> Step3
    Step3 --> Step4
    Step4 --> SubmitBtn
```

---

### 11.2. Danh Sách 13 Yêu Cầu Chức Năng Chuẩn Hóa (REQ-04-010 Đến REQ-04-022)

| Mã Yêu Cầu | Tên Yêu Cầu Chức Năng | Phân Tầng Dữ Liệu & Mô Tả Chi Tiết Kỹ Thuật | Thành Phần Giao Diện / API |
| :--- | :--- | :--- | :--- |
| **`REQ-04-010`** | Triết Lý Form 4 Bước Kết Hợp & Cổng Gửi Duyệt Bước 1 | Cung cấp Form Wizard 4 bước kết hợp, trong đó Bước 1 là điều kiện tiên quyết duy nhất để kích hoạt trạng thái "Đủ điều kiện nộp" (`isSubmissionReady = true`). Cho phép Seller bấm "Gửi chờ duyệt" ngay tại Bước 1 mà không bị bắt buộc hoàn thành các bước sau. Nút "Tiếp tục: Thông số kỹ thuật (Tùy chọn) →" cho phép chuyển bước tuần tự hoặc click trực tiếp trên Stepper để làm giàu dữ liệu. | `TechnologyCreateWizard`, `TechnologyEditWizard`, `FormStepper` |
| **`REQ-04-011`** | Bước 1 - Cụm 6 Trường Lõi Bắt Buộc & SearchableCombobox Ngành | Cung cấp 6 trường nhập bắt buộc tại Bước 1: (1) Loại chào bán `offer_type` (`PRODUCT` / `DEVICE` / `SOLUTION`); (2) Ngành công nghiệp `sector_code` (SearchableCombobox 18 ngành, hiển thị tên ngành trực quan, ẩn tiền tố mã `LV..`); (3) Có chuyển giao công nghệ `has_tech_transfer` (Nút chuyển trạng thái Không/Có); (4) Tên sản phẩm/công nghệ `title` (Tối thiểu 5 ký tự); (5) Mô tả ngắn `short_description` (Tối thiểu 20 ký tự); (6) Công dụng / Bài toán giải quyết `problem_solved` (Tối thiểu 20 ký tự). | `Step1CoreFields`, `SearchableCombobox` (18 Sectors) |
| **`REQ-04-012`** | Bước 1 - Tự Động Nạp Chủ Thể Doanh Nghiệp (SSOT Enterprise Identity) | Tại Bước 1, hệ thống tự động trích xuất thông tin đơn vị chào bán từ tài khoản phiên làm việc (`TASK-02`): Tên doanh nghiệp/tổ chức, Người đại diện, Số điện thoại, Email liên hệ, Địa bàn tỉnh/thành. Áp dụng PDPD NĐ 13/2023: Hiển thị minh bạch cho Seller xem trước, thông báo rõ SĐT/Email sẽ được bảo mật và chỉ mở cho Buyer sau khi kết nối. | `SellerIdentityCard`, PDPD Privacy Note |
| **`REQ-04-013`** | Bước 1 - Nhúng Cụm Hình Thức Công Bố Giá Sẵn Sàng | Nhúng trực tiếp cụm khai báo giá vào Bước 1 theo Wireframe gốc: 3 lựa chọn hình thức giá `pricing_type`: `FIXED` (Giá cụ thể), `RANGE` (Khoảng giá), `CONTACT` (Liên hệ báo giá). Khi chọn `FIXED` hoặc `RANGE`: Hiển thị input giá tiền, dropdown loại tiền tệ `currency` (`VND`, `USD`), ô nhập đơn vị tính `unit` (gợi ý: *bộ, chiếc, hệ thống, dây chuyền, gói chuyển giao, quy trình, li-xăng/năm*). | `InlinePricingCard`, `PricingTypeRadioGroup` |
| **`REQ-04-014`** | Bước 1 - Khung Tương Tác Chọn TRL Màu Vàng Bung Tự Động | Khi `has_tech_transfer = true`, giao diện ngay lập tức bung mở Khung TRL màu vàng (`trl-panel` viền `border-amber-200`, nền `bg-amber-50`). Khung hiển thị dải 9 nấc TRL (1–9) chuẩn quốc tế; Seller bắt buộc phải chọn 1 cấp độ TRL thì Bước 1 mới đạt trạng thái hợp lệ. Khi `has_tech_transfer = false`, khung tự động thu gọn và reset giá trị. | `ReactiveYellowTrlPanel`, `TrlRadioGrid` |
| **`REQ-04-015`** | Bước 2 - Thông Số Kỹ Thuật Lớp 2 Kỹ Thuật Chung Theo Loại | Tại Bước 2 (Thông số kỹ thuật), hiển thị nhóm trường Lớp 2 tương ứng với `offer_type`: (A) Nếu là **Thiết bị / Sản phẩm**: Model (`model_code`), Hãng sản xuất (`manufacturer`), Xuất xứ (`origin_country`), Tình trạng thiết bị (`equipment_status`: *Mới 100%, Đã qua sử dụng, Refurbished*), Năm sản xuất (`manufacturing_year`), Công suất / Quy mô (`capacity_scale`), Mức tiêu hao năng lượng (`energy_consumption`), Mức độ tự động hóa (`automation_level`); (B) Nếu là **Giải pháp công nghệ**: Nguyên lý hoạt động (`operating_principle`), Trạng thái thương mại hóa (`commercial_status`), Điều kiện triển khai/hạ tầng yêu cầu (`deployment_conditions`). | `Tier2CommonTechnicalForm` |
| **`REQ-04-016`** | Bước 2 - Danh Mục Thông Số Đặc Thù 18 Nhóm Ngành Lớp 3 (`Bo_loc_Cban`) | Tự động tải và hiển thị danh mục các trường thông số kỹ thuật chuẩn của ngành đã chọn từ Sheet `Bo_loc_Cban` (ví dụ: Cơ khí có *Hành trình trục X/Y/Z, Tốc độ trục chính, Độ chính xác lặp lại*; Nông nghiệp có *Năng suất thu hoạch, Tỷ lệ hao hụt, Tiêu chuẩn VietGAP/GlobalGAP*...). Các trường được hiển thị dưới dạng form nhập có sẵn nhãn, đơn vị đo tiêu chuẩn và gợi ý giá trị. | `Tier3SectorDynamicForm`, Taxonomy Loader |
| **`REQ-04-017`** | Bước 2 - Bảng Thêm Thông Số Động Tự Do (Key-Value Dynamic Table) | Phía dưới các thông số chuẩn, cung cấp Bảng thông số kỹ thuật tự do: Cho phép Seller bấm `+ Thêm thông số mới` để nhập các chỉ tiêu kỹ thuật chuyên biệt chưa có trong danh mục mẫu. Hỗ trợ 4 cột: Tên thông số (`spec_name`), Giá trị (`spec_value`), Đơn vị đo (`unit`), Nút xóa dòng. Tối đa 50 dòng thông số, không cho phép trùng lặp tên. | `DynamicSpecKeyValueTable` |
| **`REQ-04-018`** | Bước 3 - Điều Kiện Thương Mại & Chuyển Giao Lớp 4 Excel Master | Tại Bước 3, hiển thị đầy đủ các trường thương mại chuyên sâu kế thừa từ Sheet `C.bán SP`: (1) Hình thức chuyển giao ưu tiên (`transfer_priority_method` / `KT-66`: *Chuyển giao quyền sở hữu, Chuyển quyền sử dụng li-xăng, Hợp tác R&D tiếp tục, Góp vốn bằng công nghệ*); (2) Nội dung bao gồm trong giá (`price_includes` / `GIA-74`); (3) Thuế và chi phí phát sinh (`tax_and_extra_costs` / `GIA-75`); (4) Phạm vi cung cấp (`supply_scope` / `GIA-76`: *Toàn quốc, Miền Bắc/Trung/Nam, Xuất khẩu*); (5) Thời gian giao hàng / triển khai (`delivery_timeline` / `GIA-77`); (6) Điều kiện thanh toán (`payment_terms` / `GIA-78`); (7) Thời gian bảo hành (`warranty_terms` / `GIA-80`); (8) Hình thức hỗ trợ kỹ thuật (`technical_support_method` / `GIA-81`). | `Tier4CommercialForm`, `CommercialFieldsGroup` |
| **`REQ-04-019`** | Bước 4 - Số Hóa Hồ Sơ Bộ Tứ SHTT (IP Quad Digitization) | Tại Bước 4, cung cấp cụm khai báo pháp lý SHTT: (1) Tình trạng văn bằng SHTT (`ip_status`: *Đã cấp bằng độc quyền, Đã có quyết định chấp nhận đơn hợp lệ, Đang thẩm định nội dung, Bí quyết công nghệ chưa nộp đơn*); (2) Số văn bằng / Số đơn (`ip_registration_number`); (3) Ngày cấp / Ngày nộp đơn (`ip_issue_date`); (4) Tải tệp scan văn bằng (`ip_certificate_file` / `TL-106`). | `IpQuadDigitizationCard`, File Upload |
| **`REQ-04-020`** | Bước 4 - Minh Chứng Đa Phương Tiện & Phân Quyền DataRoom 3 Cấp Độ | Cung cấp khu vực tải lên các minh chứng: Chứng nhận / kiểm định (`TL-105`), Hồ sơ ứng dụng thực tế / Hợp đồng tương tự (`TL-109`), Brochure / Catalogue kỹ thuật (`TL-104`), Video demo giải pháp (`CHUNG-42`). Mỗi tài liệu cho phép thiết lập quyền DataRoom `access_scope`: `PUBLIC` (Công khai), `AFTER_CONNECTION` (Chỉ mở tải cho Bên Mua sau khi kết nối hợp lệ), `ADMIN_ONLY` (Chỉ dành cho Cán bộ Sở KH&CN thẩm định). | `DataRoomFileManager`, `AccessScopeBadge` |
| **`REQ-04-021`** | Bước 4 - Chọn Cơ Quan Tiếp Nhận Thẩm Định Cấp 2 & Cam Kết Pháp Lý | Form yêu cầu Seller chọn Sở KH&CN phụ trách tiếp nhận thẩm định (`managing_authority_id`, `scope_id` theo 63 tỉnh/thành) và tích chọn ô Cam kết tính xác thực, chịu hoàn toàn trách nhiệm pháp lý về quyền sở hữu trí tuệ (`legal_commitment_confirmed = true`). Hệ thống kiểm tra điều kiện này khi Seller nộp hồ sơ từ Bước 4. | `ProvincialGovAuthoritySelect`, `LegalCommitmentCheckbox` |
| **`REQ-04-022`** | Lưu Nháp DRAFT, Tự Động Lưu LocalStorage & Widget Trợ Lý AI | (1) Nút "Lưu nháp" luôn hiển thị tại header và action bar cho phép lưu tạm ở mọi bước chỉ với điều kiện `title >= 3 ký tự`; (2) Cơ chế LocalStorage tự động lưu bản nháp mỗi 30 giây giúp phục hồi form khi refresh; (3) Widget Trợ lý AI kết nối `POST /api/v1/ai/extract-patent-specs` hỗ trợ đọc Catalogue/Bằng sáng chế để điền gợi ý tự động (Human-in-the-Loop, Zero-Dependency Fallback). | `DraftManager`, `LocalStorageSync`, `AiAssistantCard` |

---

### 11.3. Quy Tắc Nghiệp Vụ Bắt Buộc (Business Rules BR-SELLER-08 Đến BR-SELLER-14)

- **`BR-SELLER-08`**: **Quy Tắc Đột Phá UX - Đủ Điều Kiện Nộp Ngay Tại Bước 1 (Step 1 Minimum Viable Submission Gate)**:
  1. *Nguyên tắc thẩm quyền nộp*: Hồ sơ chào bán được xem là **Hợp lệ tối thiểu để gửi thẩm định** (`IsMinimumViableForReview`) ngay khi và chỉ khi hoàn thành đầy đủ các trường tại Bước 1:
     - `offer_type` thuộc `{ 'PRODUCT', 'DEVICE', 'SOLUTION' }`.
     - `sector_code` không rỗng và thuộc 18 ngành TT17.
     - `has_tech_transfer` đã được xác định (`true` hoặc `false`).
     - `title` có độ dài từ 5 đến 255 ký tự.
     - `short_description` có độ dài tối thiểu 20 ký tự.
     - `problem_solved` có độ dài tối thiểu 20 ký tự.
     - `pricing_type` thuộc `{ 'FIXED', 'RANGE', 'CONTACT' }` và thỏa mãn các ràng buộc giá tương ứng theo `BR-SELLER-04`.
     - Nếu `has_tech_transfer = true`: Bắt buộc phải chọn `trl_level` thuộc $\{1..9\}$ theo `BR-SELLER-09`.
  2. *Hành vi giao diện*: Nút "Gửi chờ duyệt" trên thanh công cụ và chân trang lập tức chuyển sang trạng thái khả dụng (Enabled). Seller có thể bấm gửi duyệt ngay mà không bắt buộc phải bấm sang Bước 2, 3, hoặc 4.
  3. *Hành lang tùy chọn (Non-blocking Optional)*: Toàn bộ dữ liệu tại Bước 2 (Thông số kỹ thuật), Bước 3 (Điều kiện thương mại), và Bước 4 (Minh chứng chi tiết) được xử lý là trường tùy chọn làm giàu (`Optional Enrichment`). Nếu Seller không nhập, hệ thống tự động gán giá trị mặc định an toàn hoặc danh sách rỗng (`[]`).
  4. *Chọn Sở KH&CN khi nộp nhanh*: Nếu Seller bấm "Gửi chờ duyệt" ngay từ Bước 1 mà chưa qua Bước 4 để chọn Sở KH&CN, hệ thống tự động kế thừa `scope_id` (Tỉnh/Thành phố) từ Hồ sơ Doanh nghiệp liên kết (`TASK-02`) và hiển thị Modal xác nhận nhanh kèm cam kết pháp lý trong 1 click.

- **`BR-SELLER-09`**: **Quy Tắc Bắt Buộc Khai Mức TRL Khi Có Chuyển Giao Công Nghệ (Mandatory Reactive TRL on Tech Transfer)**:
  1. Khi người dùng thiết lập `has_tech_transfer = true`:
     - Khung chọn mức TRL màu vàng (`trl-panel`) bắt buộc phải bung mở ngay lập tức (Reactive Expansion).
     - Trường `trl_level` chuyển từ tùy chọn thành **Bắt buộc (Required)**. Giá trị bắt buộc là một số nguyên thuộc tập hợp $\{1, 2, 3, 4, 5, 6, 7, 8, 9\}$.
     - Hệ thống chặn việc nộp hồ sơ (cả nộp nhanh Bước 1 lẫn nộp cuối Bước 4) nếu chưa chọn mức TRL.
  2. Khi người dùng thiết lập `has_tech_transfer = false`:
     - Khung chọn mức TRL màu vàng tự động đóng lại (Collapsed).
     - Giá trị `trl_level` được đặt về `null`.
     - Hồ sơ được định danh là Hàng hóa / Thiết bị thương mại thông thường.

- **`BR-SELLER-10`**: **Quy Tắc Phân Tách Schema Kỹ Thuật Lớp 2 Theo Đối Tượng Chào Bán (Offer Type Dynamic Technical Fields)**:
  1. Giao diện Bước 2 tự động điều chỉnh các trường Lớp 2 dựa trên giá trị `offer_type` đã chọn ở Bước 1:
     - Nếu `offer_type IN ('PRODUCT', 'DEVICE')`: Hiển thị 8 trường vật lý thiết bị: Model (`model_code`), Hãng sản xuất (`manufacturer`), Xuất xứ (`origin_country`), Tình trạng thiết bị (`equipment_status`: Mới 100% / Đã qua sử dụng / Refurbished), Năm sản xuất (`manufacturing_year`), Công suất / Quy mô (`capacity_scale`), Mức tiêu hao năng lượng (`energy_consumption`), Mức độ tự động hóa (`automation_level`).
     - Nếu `offer_type = 'SOLUTION'`: Hiển thị 3 trường giải pháp số / quy trình: Nguyên lý hoạt động (`operating_principle`), Trạng thái thương mại hóa (`commercial_status`), Điều kiện triển khai (`deployment_conditions`).
  2. Toàn bộ các trường Lớp 2 đều là trường tùy chọn (Optional), không làm gián đoạn tiến trình nộp hồ sơ.

- **`BR-SELLER-11`**: **Quy Tắc Kế Thừa Danh Mục Thông Số Đặc Thù 18 Ngành Lớp 3 từ Excel Master (`Bo_loc_Cban`)**:
  1. Khi người dùng chọn mã ngành `sector_code`, hệ thống tự động ánh xạ và nạp tập hợp các trường thông số kỹ thuật tương ứng từ danh mục chuẩn `Bo_loc_Cban`.
  2. Mỗi trường kỹ thuật chuẩn có cấu trúc: `{ spec_code, spec_name, data_type, default_unit, is_filter_key }`.
  3. Khi Seller nhập giá trị vào các trường này, hệ thống sẽ lưu trữ vào bảng `technology.offer_spec_values` với cờ phân loại `spec_category = 'TIER_3_SECTOR'`.
  4. Nếu Seller chuyển đổi sang ngành khác ở Bước 1: Hệ thống hiển thị cảnh báo xác nhận trước khi làm mới danh mục thông số Bước 2.

- **`BR-SELLER-12`**: **Quy Chuẩn Điều Kiện Thương Mại & Cấu Trúc Báo Giá Lớp 4 Excel Master**:
  1. Các trường Lớp 4 (Bước 3) đại diện cho các điều khoản giao dịch chuẩn của Sàn KH&CN:
     - `transfer_priority_method` (KT-66): Hình thức chuyển giao ưu tiên (Bắt buộc nếu `has_tech_transfer = true` và Seller muốn tối ưu điểm kết nối).
     - `price_includes` (GIA-74): Nội dung cấu thành giá (ví dụ: *Đã bao gồm chi phí chuyển giao tài liệu, đào tạo 3 ngày, vận chuyển nội địa*).
     - `tax_and_extra_costs` (GIA-75): Thuế và chi phí phát sinh (ví dụ: *Giá chưa bao gồm VAT 10%, chưa gồm thuế nhập khẩu linh kiện*).
     - `supply_scope` (GIA-76): Phạm vi cung cấp (Toàn quốc, Khu vực cụ thể, Xuất khẩu).
     - `delivery_timeline` (GIA-77): Thời gian hoàn thành giao hàng / chuyển giao công nghệ.
     - `payment_terms` (GIA-78): Tiến độ thanh toán (ví dụ: *Tạm ứng 30% khi ký hợp đồng, 40% khi giao hàng, 30% sau nghiệm thu*).
     - `warranty_terms` (GIA-80): Thời hạn bảo hành và cam kết hỗ trợ sửa chữa.
     - `technical_support_method` (GIA-81): Hình thức hỗ trợ kỹ thuật (Trực tiếp tại hiện trường, Hỗ trợ từ xa 24/7 qua video call/hotline).
  2. Mọi trường Lớp 4 đều là tùy chọn bổ sung, Seller có thể cập nhật sau khi hồ sơ đã được duyệt niêm yết.

- **`BR-SELLER-13`**: **Quy Tắc Toàn Vẹn Hồ Sơ SHTT & Phân Quyền DataRoom 3 Cấp Độ (IP Evidence & DataRoom Confidentiality)**:
  1. *Quy tắc minh chứng SHTT*: Nếu Seller khai báo tình trạng SHTT là `GRANTED` (Đã được cấp bằng), khuyến nghị đính kèm file scan văn bằng (`PATENT_CERT` / `TL-106`).
  2. *Quy tắc bảo mật DataRoom 3 Phân cấp*:
     - Mọi tệp tải lên (`offer_documents`) phải được gán `access_scope`:
       * `PUBLIC`: Hiển thị công khai, mọi đối tượng xem sàn đều được tải trực tiếp (áp dụng cho Brochure TL-104, Ảnh CHUNG-40/41, Video CHUNG-42).
       * `AFTER_CONNECTION`: Mặc định cho tài liệu kỹ thuật chuyên sâu (TL-109, Thuyết minh sáng chế). Chỉ mở quyền tải sau khi Yêu cầu kết nối (`ConnectionRequest`) giữa Buyer và Seller được chấp thuận.
       * `ADMIN_ONLY`: Tài liệu bảo mật pháp lý hoặc bí mật công nghệ chỉ dành riêng cho Cán bộ Sở KH&CN thẩm định tại Cổng Cấp 2 `/gov/approvals`.
  3. Định dạng tệp cho phép: `.pdf`, `.jpg`, `.jpeg`, `.png`, `.docx`, `.xlsx`, `.mp4`. Kích thước tệp: $\le 25\text{MB}$ (Văn bản/Hình ảnh), $\le 50\text{MB}$ (Video).

- **`BR-SELLER-14`**: **Quy Tắc Nạp Tự Động Chủ Thể Doanh Nghiệp & Bảo Mật Dữ Liệu PDPD (Auto-Fill & Privacy Shield)**:
  1. Khi người dùng có vai trò `SELLER` hoặc `ENTERPRISE` tạo hồ sơ chào bán, hệ thống tự động truy vấn thông tin định danh pháp nhân từ module `TASK-02`:
     - Tên tổ chức / Viện / Trường / Doanh nghiệp (`organization_name`).
     - Mã số thuế / Mã định danh (`tax_code`).
     - Họ tên cán bộ đầu mối liên hệ (`contact_name`).
     - Số điện thoại (`contact_phone`) và Email (`contact_email`).
  2. Áp dụng Nghị định 13/2023/NĐ-CP (PDPD) về bảo vệ dữ liệu cá nhân:
     - Trên màn hình công khai (`/chao-ban-cong-nghe/[id]`), `contact_phone` và `contact_email` mặc định được ẩn dưới dạng `[BẢO MẬT - KẾT NỐI ĐỂ XEM]`.
     - Chỉ khi Bên Mua gửi yêu cầu kết nối chính thức và được Seller chấp thuận hoặc hệ thống môi giới xác nhận, thông tin liên lạc mới được giải mã hiển thị.

---

### 11.4. Đặc Tả Giao Diện & Trải Nghiệm Người Dùng 4 Bước (UI-04-020 Đến UI-04-026)

- **`UI-04-020`**: **Thanh Stepper Tiến Trình & Action Bar Không Chặn (Non-Blocking Stepper & Action Bar)**:
  - Cột điều hướng bên trái (Desktop: 260px; Mobile: Header stepper) hiển thị trực quan 4 bước:
    * `1. Thông tin bắt buộc`: Badge xanh lá báo số trường đã điền `Đã điền X / 6`.
    * `2. Thông số & ngành`: Nhãn phụ *(Tùy chọn)*.
    * `3. Giá & thương mại`: Nhãn phụ *(Tùy chọn)*.
    * `4. Minh chứng & gửi duyệt`: Nhãn phụ *(Tùy chọn)*.
  - Action Bar luôn hiển thị 2 nút chính tại góc trên bên phải và chân trang:
    * Nút **"Lưu nháp"** (`variant="outline"`, icon `Save`): Luôn kích hoạt.
    * Nút **"Gửi chờ duyệt"** (`variant="primary"`, icon `Send`): Tự động đổi màu từ xám mờ sang xanh đậm Navy và kích hoạt ngay khi Bước 1 hợp lệ, bất kể người dùng đang đứng ở bước nào.

- **`UI-04-021`**: **SearchableCombobox Chọn 18 Nhóm Ngành (Ẩn Mã Nội Bộ LV)**:
  - Trường Ngành công nghiệp hiển thị dạng ô tìm kiếm kết hợp thả xuống (Combobox).
  - Danh sách hiển thị trực quan 18 ngành bằng Tên tiếng Việt rõ nghĩa (ví dụ: *Cơ khí chế tạo, Chế biến thực phẩm, Công nghệ thông tin & Giải pháp số...*).
  - Tuyệt đối ẩn các tiền tố mã nội bộ như `LV01`, `LV04` để mang lại trải nghiệm chuyên nghiệp, trực quan theo wireframe.

- **`UI-04-022`**: **Khung Chọn TRL Màu Vàng Tương Tác Phản Hồi (Reactive Yellow TRL Container)**:
  - Vị trí: Đặt ngay bên dưới nút chọn "Có chuyển giao công nghệ?" tại Bước 1.
  - Kiểu dáng: Khung bo góc `rounded-xl`, viền vàng hổ phách `border-amber-200`, nền `bg-amber-50`, tiêu đề có icon `FlaskConical` màu `amber-700` kèm dòng phụ chú: *"Bắt buộc vì hồ sơ có chuyển giao công nghệ; minh chứng có thể bổ sung sau."*
  - Bố cục 9 nút bấm: Grid 9 cột trên desktop (hoặc 3x3 trên mobile), mỗi nút hiển thị số TRL to đậm kèm tooltip giải nghĩa khi hover hoặc focus. Nút được chọn có viền `border-amber-600`, nền trắng và bóng đổ nổi bật.

- **`UI-04-023`**: **Cụm Hình Thức Công Bố Giá Nhúng Tại Bước 1**:
  - Khối xám nhạt `bg-slate-50 border-slate-200` nhúng ngay trong Bước 1.
  - Nhóm 3 Radio Button bo tròn: *Giá cụ thể*, *Khoảng giá*, *Liên hệ báo giá*.
  - Khi chọn *Giá cụ thể*: Hiển thị ô nhập số tiền, dropdown loại tiền `VND / USD`, ô nhập đơn vị tính `Đơn vị: bộ, chiếc...`.
  - Khi chọn *Khoảng giá*: Hiển thị 2 ô nhập *Giá từ* - *Giá đến*, loại tiền, đơn vị tính.
  - Khi chọn *Liên hệ báo giá*: Tự động ẩn các ô nhập số tiền, hiển thị thông điệp *"Giá sẽ được thương lượng theo yêu cầu kỹ thuật cụ thể của bên mua"*.

- **`UI-04-024`**: **Màn Hình Bước 2: Thông Số Kỹ Thuật Lớp 2 & Lớp 3 18 Ngành**:
  - Phần trên: Thẻ nhóm trường Lớp 2 Kỹ thuật chung theo loại (Thiết bị/Sản phẩm hoặc Giải pháp).
  - Phần giữa: Thẻ nhóm trường Lớp 3 Thông số chuẩn của 18 ngành kế thừa từ `Bo_loc_Cban`.
  - Phần dưới: Bảng Key-Value thêm dòng tự do với nút `+ Thêm thông số mới` (viền đứt nét `border-dashed`).

- **`UI-04-025`**: **Màn Hình Bước 3: Điều Kiện Thương Mại & Chuyển Giao Lớp 4**:
  - Bố cục lưới 2 cột trực quan:
    * Cột 1 (Chính sách giá & Thanh toán): Hình thức chuyển giao ưu tiên (Dropdown), Nội dung bao gồm trong giá (Textarea), Thuế và chi phí phát sinh (Textarea), Điều kiện thanh toán (Textarea).
    * Cột 2 (Vận hành & Hỗ trợ): Phạm vi cung cấp (Dropdown), Thời gian giao hàng / triển khai (Input), Thời hạn bảo hành (Input), Hình thức hỗ trợ kỹ thuật (Input).

- **`UI-04-026`**: **Màn Hình Bước 4: Pháp Lý SHTT, Minh Chứng DataRoom & Cổng Thẩm Định Sở**:
  - Khối 1: Bộ tứ SHTT (Tình trạng, Số bằng, Ngày cấp, Tải scan bằng SHTT).
  - Khối 2: Danh mục Media & Minh chứng DataRoom (Ảnh đại diện, Catalogue PDF, Video demo, Báo cáo kiểm định) kèm dropdown chọn quyền xem 3 cấp độ (Công khai / Sau kết nối / Chỉ Sở KH&CN).
  - Khối 3: Cổng Sở KH&CN tiếp nhận (Dropdown 63 tỉnh/thành) và Checkbox Cam kết pháp lý.

---

### 11.5. Thiết Kế Mở Rộng CSDL & Hợp Đồng DTO (Data Model & API Contracts)

#### 11.5.1. Bổ Sung Schema CSDL PostgreSQL (DB-04-002)

```sql
-- 1. Bổ sung các cột Lớp 2 và Lớp 4 vào bảng chính
ALTER TABLE technology.seller_technology_offers
    -- Lớp 2: Kỹ thuật chung theo loại
    ADD COLUMN IF NOT EXISTS model_code VARCHAR(100),
    ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(255),
    ADD COLUMN IF NOT EXISTS origin_country VARCHAR(100),
    ADD COLUMN IF NOT EXISTS equipment_status VARCHAR(50) DEFAULT 'NEW', -- NEW, USED, REFURBISHED
    ADD COLUMN IF NOT EXISTS manufacturing_year INTEGER,
    ADD COLUMN IF NOT EXISTS capacity_scale VARCHAR(255),
    ADD COLUMN IF NOT EXISTS energy_consumption VARCHAR(255),
    ADD COLUMN IF NOT EXISTS automation_level VARCHAR(100),
    ADD COLUMN IF NOT EXISTS operating_principle TEXT,
    ADD COLUMN IF NOT EXISTS deployment_conditions TEXT,

    -- Lớp 4: Điều kiện thương mại & Chuyển giao Excel Master
    ADD COLUMN IF NOT EXISTS transfer_priority_method VARCHAR(100), -- KT-66
    ADD COLUMN IF NOT EXISTS price_includes TEXT,                    -- GIA-74
    ADD COLUMN IF NOT EXISTS tax_and_extra_costs TEXT,              -- GIA-75
    ADD COLUMN IF NOT EXISTS technical_support_method VARCHAR(255), -- GIA-81
    
    -- Pháp lý SHTT & Cơ quan quản lý
    ADD COLUMN IF NOT EXISTS ip_issue_date DATE,
    ADD COLUMN IF NOT EXISTS legal_commitment_confirmed BOOLEAN DEFAULT FALSE;

-- 2. Bổ sung phân loại danh mục thông số vào bảng offer_spec_values
ALTER TABLE technology.offer_spec_values
    ADD COLUMN IF NOT EXISTS spec_category VARCHAR(50) DEFAULT 'TIER_3_CUSTOM'; 
    -- 'TIER_2_COMMON', 'TIER_3_SECTOR', 'TIER_3_CUSTOM'
```

#### 11.5.2. Mở Rộng Hợp Đồng DTO & API Endpoints (API-04-002)

- **`POST /api/v1/portal/seller/technologies`** (Tạo mới hồ sơ chào bán):
- **`PUT /api/v1/portal/seller/technologies/{id}`** (Cập nhật hồ sơ chào bán):
  - Request Payload (`CreateUpdateTechnologyOfferDto`):
    ```json
    {
      "action": "SUBMIT_FOR_REVIEW", // hoặc "SAVE_DRAFT"
      "currentStep": 1,
      // Bước 1: 6 trường lõi + Giá + TRL
      "offerType": "DEVICE",
      "sectorCode": "MECH",
      "hasTechTransfer": true,
      "title": "Máy phay CNC 5 trục tích hợp robot nạp phôi tự động",
      "shortDescription": "Hệ thống gia công cơ khí chính xác độ cứng cao...",
      "problemSolved": "Tự động hóa hoàn toàn khâu nạp phôi và gia công chi tiết phức tạp",
      "pricingType": "FIXED",
      "priceAmount": 850000000,
      "priceMin": null,
      "priceMax": null,
      "currency": "VND",
      "unit": "bộ",
      "trlLevel": 8,

      // Bước 2: Lớp 2 & Lớp 3 (Tùy chọn)
      "modelCode": "CNC-5X-PRO",
      "manufacturer": "Nacen Precision",
      "originCountry": "Việt Nam",
      "equipmentStatus": "NEW",
      "manufacturingYear": 2026,
      "capacityScale": "15 kW, tốc độ trục 24,000 rpm",
      "energyConsumption": "12 kWh/giờ",
      "automationLevel": "Bán tự động / Tự động hóa tích hợp Robot",
      "operatingPrinciple": null,
      "deploymentConditions": "Điện 3 pha 380V, nền xưởng bê tông chịu tải 5 tấn/m2",
      "specValues": [
        { "specCode": "MECH_AXIS_TRAVEL", "specName": "Hành trình trục X/Y/Z", "specValue": "800 x 600 x 500 mm", "unit": "mm", "specCategory": "TIER_3_SECTOR" },
        { "specCode": "CUSTOM_ACCURACY", "specName": "Độ chính xác lặp lại", "specValue": "±0.003 mm", "unit": "mm", "specCategory": "TIER_3_CUSTOM" }
      ],

      // Bước 3: Lớp 4 Thương mại & Chuyển giao (Tùy chọn)
      "transferPriorityMethod": "CHUYEN_GIAO_TOAN_BO",
      "priceIncludes": "Bao gồm chi phí lắp đặt, căn chỉnh và chuyển giao tài liệu kỹ thuật",
      "taxAndExtraCosts": "Giá chưa bao gồm VAT 10%",
      "supplyScope": "Toàn quốc",
      "deliveryTimeline": "45 ngày làm việc",
      "paymentTerms": "Tạm ứng 30%, 40% khi nhận máy, 30% sau nghiệm thu",
      "warrantyTerms": "24 tháng bảo hành chính hãng",
      "technicalSupportMethod": "Kỹ sư hỗ trợ trực tiếp tại nhà máy trong 7 ngày đầu",
      "installationSupport": true,

      // Bước 4: SHTT & Minh chứng (Tùy chọn khi nộp nhanh Bước 1)
      "ipStatus": "GRANTED",
      "ipRegistrationNumber": "VN-1-0023456",
      "ipIssueDate": "2025-06-15",
      "managingAuthorityId": "01", // Tỉnh/thành Sở KH&CN
      "legalCommitmentConfirmed": true,
      "documents": [
        { "documentType": "PATENT_CERT", "fileName": "bang_doc_quyen_sang_che.pdf", "fileUrl": "https://...", "fileSizeBytes": 2048576, "accessScope": "AFTER_CONNECTION" },
        { "documentType": "CATALOGUE", "fileName": "brochure_cnc_5x.pdf", "fileUrl": "https://...", "fileSizeBytes": 4512000, "accessScope": "PUBLIC" }
      ]
    }
    ```

---

### 11.6. Tiêu Chí Nghiệm Thu Mở Rộng Delta v6 (Acceptance Criteria AC-04-020 Đến AC-04-030)

- **`AC-04-020`**: **Kiểm thử Cổng Nộp Nhanh Bước 1 (Fast-Track Submission)**:
  - Seller đăng nhập, mở form `/portal/seller/technologies/create`.
  - Seller chỉ điền đầy đủ các trường tại Bước 1 (Loại chào bán, Ngành, Có chuyển giao = Có, Tên, Mô tả, Bài toán, Giá cụ thể, TRL = 7).
  - Nút "Gửi chờ duyệt" lập tức chuyển sang trạng thái khả dụng.
  - Bấm "Gửi chờ duyệt": Hệ thống mở Modal xác nhận nhanh điều khoản pháp lý và gửi duyệt thành công với trạng thái `PENDING`, tự động kế thừa `scope_id` của Doanh nghiệp liên kết mà không hề bị chặn bởi việc chưa điền Bước 2, 3, 4.

- **`AC-04-021`**: **Kiểm thử Hành Vi Khung Chọn TRL Màu Vàng**:
  - Khi `has_tech_transfer = false`: Khung TRL màu vàng ẩn hoàn toàn, không yêu cầu chọn TRL.
  - Khi chuyển `has_tech_transfer = true`: Khung TRL màu vàng bung mở mượt mà; nếu chưa chọn nấc TRL nào, nút "Gửi chờ duyệt" vẫn ở trạng thái vô hiệu hóa (Disabled) và hiển thị tooltip cảnh báo *"Vui lòng chọn mức TRL"*.
  - Bấm chọn 1 nấc TRL (ví dụ TRL 8): Khung TRL hiển thị viền nổi bật, nút "Gửi chờ duyệt" được kích hoạt ngay.

- **`AC-04-022`**: **Kiểm thử SearchableCombobox 18 Ngành Công Nghiệp**:
  - Ô chọn Ngành hỗ trợ gõ tìm kiếm từ khóa (ví dụ gõ "Cơ khí" hoặc "Thực phẩm").
  - Danh sách hiển thị tên ngành trực quan tiếng Việt, tuyệt đối không xuất hiện các mã nội bộ như `LV01`, `LV04` trên nhãn hiển thị.

- **`AC-04-023`**: **Kiểm thử Nạp Thông Tin Chủ Thể Doanh Nghiệp Tự Động**:
  - Mở Bước 1, thẻ "Bên cung cấp công nghệ" hiển thị chính xác Tên DN, Người liên hệ, SĐT, Email từ hồ sơ DN liên kết (`TASK-02`).
  - Dòng thông báo PDPD hiển thị rõ ràng giải thích số điện thoại/email sẽ được bảo mật với khách vãng lai.

- **`AC-04-024`**: **Kiểm thử Nhóm Trường Lớp 2 Kỹ Thuật Chung Theo Loại**:
  - Chọn Loại chào bán là "Thiết bị" hoặc "Sản phẩm": Sang Bước 2 hiển thị đúng 8 trường vật lý thiết bị (Model, Hãng SX, Xuất xứ, Tình trạng thiết bị, Năm SX, Công suất, Tiêu hao năng lượng, Mức tự động hóa).
  - Chọn Loại chào bán là "Giải pháp": Sang Bước 2 hiển thị đúng 3 trường giải pháp (Nguyên lý hoạt động, Trạng thái thương mại hóa, Điều kiện triển khai).

- **`AC-04-025`**: **Kiểm thử Đọc Danh Mục Thông Số Chuẩn 18 Ngành Lớp 3 (`Bo_loc_Cban`)**:
  - Chọn ngành "Cơ khí chế tạo" (MECH): Bước 2 nạp đúng danh mục thông số chuyên môn của ngành cơ khí từ `Bo_loc_Cban`.
  - Thay đổi ngành sang "Nông nghiệp" (AG): Hệ thống hiển thị modal xác nhận chuyển đổi ngành và làm mới danh mục thông số theo ngành Nông nghiệp.

- **`AC-04-026`**: **Kiểm thử Bảng Key-Value Thêm Thông Số Kỹ Thuật Tự Do**:
  - Tại Bước 2, Seller bấm `+ Thêm thông số mới`: Bảng bổ sung 1 dòng mới.
  - Seller nhập tên thông số, giá trị, đơn vị đo; lưu hồ sơ và kiểm tra trong DB `technology.offer_spec_values` lưu trữ đúng với `spec_category = 'TIER_3_CUSTOM'`.
  - Kiểm tra chặn trùng lặp tên thông số kỹ thuật.

- **`AC-04-027`**: **Kiểm thử Điều Kiện Thương Mại & Chuyển Giao Lớp 4**:
  - Tại Bước 3, Seller điền các trường KT-66, GIA-74, GIA-75, GIA-76, GIA-77, GIA-78, GIA-80, GIA-81.
  - Dữ liệu lưu thành công vào các cột tương ứng trong bảng `seller_technology_offers` và hiển thị đầy đủ trên trang chi tiết công nghệ `/chao-ban-cong-nghe/[id]`.

- **`AC-04-028`**: **Kiểm thử Phân Quyền Minh Chứng DataRoom 3 Phân Cấp**:
  - Tại Bước 4, Seller tải lên tài liệu và chọn `access_scope = 'AFTER_CONNECTION'`.
  - Khách vãng lai xem trang chi tiết: File hiển thị trạng thái khóa kèm nút *"Kết nối để xem tài liệu"*.
  - Cán bộ Sở KH&CN đăng nhập Cổng Cấp 2 `/gov`: Được phép tải file trực tiếp để thẩm định.

- **`AC-04-029`**: **Kiểm thử Năng Lực Lưu Nháp & Tự Động Phục Hồi Dữ Liệu**:
  - Seller mới chỉ nhập tên sản phẩm $\ge 3$ ký tự ở Bước 1, bấm "Lưu nháp".
  - Hồ sơ được lưu với trạng thái `DRAFT` thành công, không tạo phiếu duyệt gửi Sở.
  - Mở lại form hoặc reload trang: LocalStorage tự động khôi phục toàn bộ các trường đã nhập.

- **`AC-04-030`**: **Kiểm thử Màn Hình Chỉnh Sửa Hồ Sơ (`[id]/edit`)**:
  - Seller vào màn hình chỉnh sửa một hồ sơ đã có: Toàn bộ dữ liệu 4 lớp trường (Bước 1, 2, 3, 4) được nạp đầy đủ vào form.
  - Các quy tắc kích hoạt tái thẩm định (`BR-SELLER-07`) hoạt động chính xác khi thay đổi các trường SHTT cốt lõi.



---

## 12. ĐẶC TẢ DELTA V7: NÂNG CẤP TRỰC QUAN THỊ GIÁC & NGỮ NGHĨA CARD CHÀO BÁN CÔNG NGHỆ (SPEC KIT DELTA V7)

### 12.1. Bối Cảnh & Căn Cứ Nghiệp Vụ (Context & Rationale)

- **Căn cứ phê duyệt**: Quyết định PO/PM ngày 2026-10-21 đối với Đề xuất cải tiến giao diện Sàn Giao Dịch Công Nghệ (`/chao-ban-cong-nghe`).
- **Vấn đề nhận diện từ thực tế vận hành**:
  1. *Xung đột thị giác trên ảnh Thumbnail*: Mã hồ sơ `offerCode` (ví dụ `OFF-202610-LV16-08`) hiển thị đè ở góc trên ảnh làm phân tán sự chú ý vào hình ảnh công nghệ/thiết bị, trong khi mã hồ sơ là thông tin định danh tra cứu chứ không phản ánh giá trị thương mại hay cấp độ chuyển giao.
  2. *Thiếu hụt nhãn giá trị thương mại nổi bật*: Khách thăm sàn (Buyer, Nhà đầu tư) khi duyệt nhanh qua danh mục cần nhận diện ngay lập tức công nghệ nào "Sẵn sàng chuyển giao" (có Bộ tứ SHTT và TRL) so với các thiết bị thương mại thông thường.
  3. *Ngữ nghĩa số bằng SHTT chưa minh bạch*: Số bằng bảo hộ (ví dụ `VN-1-0028812`) hiện hiển thị dưới dạng chuỗi mã trần trong khung nhỏ mà không có nhãn chỉ dẫn ngữ nghĩa ("Số bằng SHTT:") và chưa có nhãn bảo chứng xác thực của cơ quan quản lý chuyên ngành (Cục Sở hữu trí tuệ - Bộ KH&CN), làm giảm mức độ tin cậy pháp lý (IP Trust Index) đối với Bên mua.

---

### 12.2. Cross-Surface Impact Matrix (Ma Trận Đánh Giá Tác Động Đa Bề Mặt)

Tuân thủ nguyên tắc Lan truyền quyết định bắt buộc (Decision Propagation Rule):

| Bề Mặt Hệ Thống | Mức Độ Tác Động | Phạm Vi & Chi Tiết Ảnh Hưởng | Biện Pháp Kiểm Soát & Đồng Bộ |
| :--- | :---: | :--- | :--- |
| **1. Basic Design / Wireframe** | Thấp | Cập nhật layout Card công nghệ tại wireframe catalog `/chao-ban-cong-nghe`. | Đồng bộ phân vị badge trên Thumbnail và bổ sung nhãn caption mã hồ sơ. |
| **2. Detail Spec (`spec.md`)** | Cao | Bổ sung Mục 12 (Delta V7) theo nguyên tắc Append-only. | Bổ sung `REQ-DELTA-01`, `REQ-DELTA-02`, `UI-CARD-01`, `BR-OFFER-CARD-01`, `AC-04-031`..`034`. |
| **3. API & DTO Contracts** | Không | Giữ nguyên 100% hợp đồng API và DTO (`TechnologyOfferDto`). | Các trường `offerCode`, `hasTechTransfer`, `offerType`, `ipRegistrationNumber`, `ipStatus` đã sẵn có trong DTO hiện tại. |
| **4. Domain & Business Rules** | Vừa | Bổ sung quy tắc trình bày `BR-OFFER-CARD-01`. | Xác định ánh xạ badge trạng thái thương mại và logic format nhãn SHTT. |
| **5. Database & Migrations** | Không | Không thay đổi schema CSDL PostgreSQL. | Dữ liệu lưu trữ không đổi, thay đổi hoàn toàn thuộc tầng Presentation / Semantic UI. |
| **6. Web Frontend** | Cao | Cập nhật component Card tại `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.tsx`. | Thay đổi cấu trúc DOM Card, styling TailwindCSS cho badge và caption metadata. |
| **7. Test Suites & Verification** | Vừa | Cập nhật Unit/Component test tại `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.test.tsx`. | Điều chỉnh matcher test kiểm tra chuỗi `Số bằng SHTT:` và `Xác thực Cục SHTT`, chạy Playwright E2E Visual QA. |

---

### 12.3. Danh Sách Yêu Cầu Chức Năng Bổ Sung (Functional Requirements)

| Mã Yêu Cầu | Tên Yêu Cầu Chức Năng | Mô Tả Kỹ Thuật & Chi Tiết Nghiệp Vụ | Thành Phần Giao Diện / Code |
| :--- | :--- | :--- | :--- |
| **`REQ-DELTA-01`** | Tái Cấu Trúc Trực Quan Định Danh Hồ Sơ & Trạng Thái Thương Mại | 1. Dời mã hồ sơ `offerCode` khỏi góc trên ảnh Thumbnail.<br>2. Chuyển mã hồ sơ xuống dạng nhãn caption nhỏ gọn phía trên tiêu đề bài viết trong Card Body (`Mã: OFF-...`) với font monospace tinh gọn.<br>3. Chuyển góc trên ảnh Thumbnail thành vị trí ưu tiên cho Badge trạng thái giá trị thương mại: hiển thị `"Sẵn sàng chuyển giao"` (khi `hasTechTransfer = true`) hoặc `"Thương phẩm sẵn có"` (khi `hasTechTransfer = false`), đi kèm Badge loại hình chào bán (`offerType`: Sản phẩm / Thiết bị / Giải pháp). | `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.tsx`, `TechnologyCard` |
| **`REQ-DELTA-02`** | Chuẩn Hóa Nhãn Ngữ Nghĩa Số Bằng SHTT & Nhãn Xác Thực Cục SHTT | 1. Bổ sung nhãn ngữ nghĩa minh bạch `"Số bằng SHTT: "` đứng trước mã số đăng ký văn bằng (`ipRegistrationNumber`).<br>2. Đối với hồ sơ công nghệ đã có văn bằng bảo hộ được duyệt (`ipStatus = 'PATENT_GRANTED'` hoặc `'UTILITY_MODEL'`), hiển thị kèm Huy hiệu bảo chứng: `"Xác thực Cục SHTT"` với icon `ShieldCheck` hoặc `CheckCircle2` để gia tăng chỉ số tin cậy pháp lý cho Bên mua. | `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.tsx`, SHTT Info Badge |

---

### 12.4. Quy Tắc Nghiệp Vụ Bắt Buộc (Business Rules)

- **`BR-OFFER-CARD-01`**: **Quy Tắc Kết Xuất Trực Quan Card Chào Bán Công Nghệ (Card Presentation Logic)**:
  1. **Huy hiệu Giá trị Thương mại (Top-Left Thumbnail Overlay)**:
     - Nếu `offer.hasTechTransfer === true`: Bắt buộc kết xuất badge nổi bật với nội dung `"Sẵn sàng chuyển giao"`, sử dụng tone xanh ngọc Emerald (`bg-emerald-600/90 text-white font-bold backdrop-blur-md shadow-sm`), kết hợp icon `Sparkles` hoặc `ShieldCheck`.
     - Nếu `offer.hasTechTransfer === false`: Kết xuất badge trung tính `"Thương phẩm sẵn có"`, sử dụng tone xanh Navy hoặc Slate (`bg-slate-900/80 text-slate-100 font-bold backdrop-blur-md shadow-sm`).
  2. **Huy hiệu Loại hình Chào bán (Top-Right Thumbnail Overlay)**:
     - Ánh xạ từ `offer.offerType`:
       * `PRODUCT`: `"Sản phẩm"`
       * `DEVICE` / `EQUIPMENT`: `"Thiết bị"`
       * `SOLUTION`: `"Giải pháp"`
       * `SOFTWARE`: `"Phần mềm"`
       * Khác: `"Dịch vụ KH&CN"`
     - Định dạng: `bg-slate-900/85 backdrop-blur-md text-white px-2 py-0.5 rounded font-bold shadow-sm`.
  3. **Nhãn Caption Mã Hồ Sơ (Card Body Metadata)**:
     - Đặt ngay phía trên tiêu đề `title` của công nghệ.
     - Cấu trúc hiển thị: `Mã: {offer.offerCode}`.
     - Quy chuẩn kiểu chữ: `font-mono text-caption text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase`.
  4. **Khối Pháp Lý SHTT & Nhãn Xác Thực (IP Semantic Representation)**:
     - Khi `offer.hasTechTransfer === true`:
       * Dòng 1: Icon `ShieldCheck` kèm nhãn trạng thái SHTT `getIpStatusLabel(offer.ipStatus)`.
       * Dòng 2 (khi có `offer.ipRegistrationNumber`):
         + Nhãn số văn bằng rõ nghĩa: `Số bằng SHTT: ` kèm mã `{offer.ipRegistrationNumber}` trong khung monospace (`font-mono text-caption font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800`).
         + Nhãn bảo chứng cơ quan thẩm định: Huy hiệu `"Xác thực Cục SHTT"` (`inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-700`).

---

### 12.5. Đặc Tả Giao Diện Chi Tiết (UI/UX Specification)

- **`UI-CARD-01`**: **Cấu Trúc Lớp & Bố Cục Thẻ Công Nghệ Chuẩn Hóa (`TechnologyCard`)**:
  - **Khu vực Media Thumbnail (Tỷ lệ 16:9 / 16:10)**:
    * Lớp phủ góc trên (`Top Overlay`):
      - Trái: Badge Giá trị Thương mại (`"Sẵn sàng chuyển giao"` / `"Thương phẩm sẵn có"`).
      - Phải: Badge Loại hình chào bán (`offerTypeLabel`).
    * Lớp phủ góc dưới (`Bottom Overlay`):
      - Trái: Tên ngành kinh tế 18 nhóm ngành TT17 (`offer.sectorName`).
      - Phải: Huy hiệu mức độ hoàn thiện công nghệ TRL (`TRL X/9` khi `hasTechTransfer = true`).
  - **Khu vực Nội dung Thân Thẻ (`Card Content Body`)**:
    * Dòng định danh: Nhãn caption monospace `Mã: {offer.offerCode}` kèm icon `Tag` hoặc dot chỉ dấu.
    * Tiêu đề công nghệ: `offer.title`, font `text-sm sm:text-base font-extrabold`, giới hạn 2 dòng (`line-clamp-2`), hover chuyển màu `text-emerald-600`.
    * Tóm tắt giải pháp: `offer.summary`, font `text-xs text-slate-600 dark:text-slate-300`, giới hạn 2 dòng (`line-clamp-2`).
    * Khối bảo chứng SHTT & Bên bán (`Trust & Credibility Box`):
      - Hàng 1 (SHTT): Trạng thái bảo hộ + Nhãn `Số bằng SHTT: {ipRegistrationNumber}` + Badge `Xác thực Cục SHTT`.
      - Hàng 2 (Chủ thể): Tên Đơn vị nghiên cứu / Doanh nghiệp chào bán kèm MST và hyperlink dẫn tới `/enterprises/{taxCode}`.
  - **Khu vực Chân Thẻ (`Card Footer`)**:
    * Bên trái: Nhãn "Hình thức thương mại" và Giá niêm yết format chuẩn tiền tệ VND/USD (`formatPrice(offer)`).
    * Bên phải: Nút CTA `Chi tiết hồ sơ →` dẫn tới `/chao-ban-cong-nghe/{id}`.

---

### 12.6. Tiêu Chí Nghiệm Thu Mở Rộng Delta v7 (Acceptance Criteria)

- **`AC-04-031`**: **Kiểm thử Dời Vị Trí Mã Hồ Sơ Sang Caption**:
  - Truy cập `/chao-ban-cong-nghe`, kiểm tra toàn bộ các Card công nghệ.
  - Mã hồ sơ (ví dụ `OFF-202610-LV16-08`) tuyệt đối không còn nằm ở góc trên của ảnh thumbnail.
  - Mã hồ sơ hiển thị dạng caption `Mã: OFF-...` ngay phía trên tiêu đề bài viết với font monospace và căn lề hài hòa.

- **`AC-04-032`**: **Kiểm thử Badge Trạng Thái Giá Trị Thương Mại Trên Thumbnail**:
  - Với công nghệ có `hasTechTransfer = true`: Góc trên bên trái ảnh thumbnail hiển thị badge `"Sẵn sàng chuyển giao"` màu xanh ngọc Emerald nổi bật.
  - Với công nghệ có `hasTechTransfer = false`: Góc trên bên trái hiển thị badge `"Thương phẩm sẵn có"`.
  - Góc trên bên phải hiển thị rõ ràng loại hình chào bán (Sản phẩm / Thiết bị / Giải pháp).

- **`AC-04-033`**: **Kiểm thử Nhãn Ngữ Nghĩa Số Bằng SHTT & Xác Thực Cục SHTT**:
  - Với công nghệ có `ipRegistrationNumber` (ví dụ `VN-1-0028812`): Hiển thị đầy đủ nhãn `"Số bằng SHTT: VN-1-0028812"`.
  - Hiển thị badge bảo chứng `"Xác thực Cục SHTT"` kèm icon nhận diện bên cạnh số bằng, mang lại độ tin cậy trực quan cao.

- **`AC-04-034`**: **Kiểm thử Tương Thích & Responsive Visual QA**:
  - Kiểm tra hiển thị trên 3 kích thước màn hình: Mobile (375px), Tablet (768px), Desktop (1280px).
  - Khối thumbnail, badge và nhãn caption không bị tràn viền (overflow), không bị che khuất văn bản và đảm bảo tính tương phản màu sắc theo chuẩn WCAG 2.1 AA.


---

## 13. ĐẶC TẢ DELTA V8: TINH GỌN DIỆN MẠO TRỰC QUAN & TỐI ƯU HÓA CHIỀU CAO CARD CHÀO BÁN CÔNG NGHỆ (SPEC KIT DELTA V8)

### 13.1. Bối Cảnh & Căn Cứ Nghiệp Vụ (Context & Rationale)

- **Căn cứ tiếp thu**: Phản hồi trực tiếp từ Product Owner (PO) / Người dùng ngày 2026-10-21 sau khi đánh giá trực quan bản thử nghiệm Delta V7:
  > *"như hiện tại thì k ok lắm, card của mỗi chào bán lại thành to hơn, phần mã thu nhỏ lại, dòng chữ Sẵn sàng chuyển giao có cần k? giờ item nào cũng có, xác thực Cục SHTT nhìn cũng hơi vô duyên, bỏ đi"*
- **Phân tích nguyên nhân gốc rễ (Root Cause Analysis)**:
  1. *Thẻ công nghệ bị phình to (Card Bloating)*: Việc tách mã hồ sơ `offerCode` thành một hàng riêng biệt phía trên tiêu đề, cộng với khối bảo chứng SHTT phân bổ thành 2 dòng (dòng tên trạng thái + dòng số bằng & huy hiệu xác thực) khiến chiều cao thẻ tăng đáng kể (~40-60px), làm giảm mật độ hiển thị thông tin (Information Density) trên màn hình máy tính và thiết bị bảng.
  2. *Nhiễu thị giác do nhãn lặp lại (Visual Noise & Redundancy)*: Badge "Sẵn sàng chuyển giao" / "Thương phẩm sẵn có" phủ góc trên ảnh thumbnail xuất hiện trên 100% các thẻ, gây cảm giác trùng lặp nhàm chán (banner blindness) và che khuất một phần lớn góc ảnh công nghệ.
  3. *Huy hiệu "Xác thực Cục SHTT" thiếu tự nhiên (Cluttered Endorsement Badge)*: Nhãn xác thực màu xanh lá đậm bên cạnh số văn bằng tạo cảm giác gượng ép, chiếm diện tích và làm phân tán sự tập trung vào thông tin cốt lõi (Tên sáng chế và Số văn bằng bảo hộ).
- **Mục tiêu cải tiến Delta V8**:
  - Triệt để tinh gọn (Ultra-compact Card Design): Giữ nguyên thông tin pháp lý quan trọng nhưng nén bố cục, tối ưu chiều cao thẻ.
  - Loại bỏ các thành phần gây nhiễu, đưa card về diện mạo thanh lịch, chuyên nghiệp, tập trung vào hình ảnh, tên công nghệ, thông tin SHTT súc tích và giá trị giao dịch.

---

### 13.2. Cross-Surface Impact Matrix (Ma Trận Đánh Giá Tác Động Đa Bề Mặt)

Tuân thủ nguyên tắc Lan truyền quyết định bắt buộc (Decision Propagation Rule):

| Bề Mặt Hệ Thống | Mức Độ Tác Động | Phạm Vi & Chi Tiết Ảnh Hưởng | Biện Pháp Kiểm Soát & Đồng Bộ |
| :--- | :---: | :--- | :--- |
| **1. Basic Design / Wireframe** | Thấp | Cập nhật cấu trúc hiển thị Card công nghệ tại catalog `/chao-ban-cong-nghe`. | Tinh gọn thẻ, bỏ badge góc trên thumbnail, gộp dòng SHTT. |
| **2. Detail Spec (`spec.md`)** | Cao | Bổ sung Mục 13 (Delta V8) theo nguyên tắc Append-only. | Bổ sung `REQ-DELTA-03` $\rightarrow$ `REQ-DELTA-06`, `BR-OFFER-CARD-02`, `UI-CARD-02`, `AC-04-035` $\rightarrow$ `AC-04-037`. |
| **3. API & DTO Contracts** | Không | Không thay đổi API hay cấu trúc DTO (`TechnologyOfferDto`). | Các trường dữ liệu `offerCode`, `ipStatus`, `ipRegistrationNumber` được tái cấu trúc hiển thị ở tầng Presentation. |
| **4. Domain & Business Rules** | Vừa | Thay thế quy tắc trình bày `BR-OFFER-CARD-01` bằng `BR-OFFER-CARD-02`. | Chuẩn hóa quy tắc kết xuất 1 dòng SHTT và vị trí mã hồ sơ thu nhỏ. |
| **5. Database & Migrations** | Không | Không tác động đến CSDL PostgreSQL. | Dữ liệu gốc giữ nguyên toàn vẹn 100%. |
| **6. Web Frontend** | Cao | Cập nhật component Card tại `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.tsx`. | Tinh chỉnh DOM: xóa badge thumbnail góc trái, xóa huy hiệu xác thực, gộp SHTT 1 dòng, thu nhỏ `offerCode`. |
| **7. Test Suites & Verification** | Vừa | Cập nhật bộ test tại `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.test.tsx`. | Điều chỉnh assert kiểm tra loại bỏ badge thumbnail/xác thực, xác minh cấu trúc 1 dòng SHTT và mã thu nhỏ. |

---

### 13.3. Danh Sách Yêu Cầu Chức Năng Bổ Sung (Functional Requirements)

| Mã Yêu Cầu | Tên Yêu Cầu Chức Năng | Mô Tả Kỹ Thuật & Chi Tiết Nghiệp Vụ | Thành Phần Giao Diện / Code |
| :--- | :--- | :--- | :--- |
| **`REQ-DELTA-03`** | Loại Bỏ Hoàn Toàn Badge Trạng Thái Thương Mại Trên Thumbnail | 1. Xóa bỏ hoàn toàn việc kết xuất badge `"Sẵn sàng chuyển giao"` và `"Thương phẩm sẵn có"` ở góc trên bên trái ảnh Thumbnail.<br>2. Giữ lại duy nhất Badge phân loại hình thức chào bán (`offerType`: Sản phẩm / Thiết bị / Giải pháp / Phần mềm...) ở góc trên bên phải để khách hàng dễ dàng phân biệt tính chất công nghệ mà không bị nhiễu thị giác. | `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.tsx`, Media Thumbnail Overlay |
| **`REQ-DELTA-04`** | Loại Bỏ Huy Hiệu "Xác Thực Cục SHTT" | 1. Xóa bỏ hoàn toàn badge/huy hiệu `"Xác thực Cục SHTT"` bên trong khối thông tin Sở hữu trí tuệ.<br>2. Giữ lại giá trị cốt lõi là Số bằng đăng ký hợp lệ (`ipRegistrationNumber`) để đảm bảo tính ngắn gọn, trực diện và chuyên nghiệp. | `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.tsx`, SHTT Info Badge |
| **`REQ-DELTA-05`** | Tối Ưu Hóa Khối SHTT Thành 1 Dòng Duy Nhất Gọn Gàng | 1. Tái cấu trúc toàn bộ khối thông tin SHTT (`hasTechTransfer = true`) về hiển thị trên **đúng 1 dòng duy nhất** dạng inline flex: `[Icon Shield] [Tên bảo hộ SHTT] [• Số: VN-1-...]`.<br>2. Cấu trúc hiển thị chuẩn hóa: Khi có số văn bằng `ipRegistrationNumber`, ghép trực tiếp vào sau tên trạng thái SHTT (ví dụ: `Bằng Độc Quyền Sáng Chế • Số: VN-1-0028812` hoặc trong ngoặc đơn), dùng dấu cách hoặc dot phân tách thanh mảnh, thu nhỏ padding bao ngoài khối, giảm chiều cao tối đa. | `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.tsx`, SHTT Single-line Container |
| **`REQ-DELTA-06`** | Thu Nhỏ & Tích Hợp Gọn Gàng Mã Hồ Sơ (`offerCode`) | 1. Tuyệt đối không tách mã hồ sơ `offerCode` thành một khối dòng riêng biệt có margin/padding lớn gây lãng phí chiều cao thẻ.<br>2. Thu nhỏ font size (`text-[11px]` hoặc `text-xs`), sử dụng font monospace mờ nhẹ (`text-slate-400 dark:text-slate-500`), tích hợp liền mạch vào đầu thẻ (hoặc đặt inline cùng metadata một cách tinh gọn), giúp tổng thể Card vừa vặn, chuẩn compact design. | `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.tsx`, Card Header / Title Row |

---

### 13.4. Quy Tắc Nghiệp Vụ Bắt Buộc (Business Rules)

- **`BR-OFFER-CARD-02`**: **Quy Chuẩn Bố Cục Tinh Gọn Thẻ Công Nghệ (Compact Card Presentation Rules)**:
  1. **Khu vực Thumbnail Overlay (Media Layer)**:
     - **Góc trên (Top Overlay)**:
       * KHÔNG kết xuất bất kỳ badge thương mại nào ("Sẵn sàng chuyển giao" / "Thương phẩm sẵn có") ở góc trên bên trái.
       * Chỉ kết xuất 01 badge duy nhất ở góc trên bên phải: Nhãn loại hình công nghệ `getOfferTypeLabel(offer.offerType)` (`bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm`).
     - **Góc dưới (Bottom Overlay)**:
       * Góc trái: Tên ngành kinh tế 18 nhóm ngành TT17 (`offer.sectorName`) dạng viên thuốc tối giản (`bg-black/50 backdrop-blur-md text-white text-[11px] px-2 py-0.5 rounded border border-white/20 line-clamp-1 max-w-[65%]`).
       * Góc phải: Mức độ sẵn sàng TRL (`TRL X/9` khi `hasTechTransfer = true` và có `trlLevel`).
  2. **Định danh Mã Hồ Sơ Tinh Gọn (Inline / Compact Identifier)**:
     - Mã hồ sơ `offer.offerCode` được hiển thị ở kích thước nhỏ (`text-[11px] font-mono text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase`), không dùng icon rườm rà, không chiếm khoảng cách dọc lớn (margin tối thiểu `mb-1`).
  3. **Khối Pháp Lý SHTT Đơn Dòng (Single-line IP Representation)**:
     - Chỉ hiển thị khi `offer.hasTechTransfer === true`.
     - Toàn bộ khối SHTT bắt buộc gói gọn trong **1 dòng duy nhất** (`flex items-center gap-1.5 text-xs truncate py-1.5 px-2.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-lg border border-emerald-100 dark:border-emerald-800/60`):
       * Icon: `ShieldCheck` kích thước `w-3.5 h-3.5 text-emerald-600 shrink-0`.
       * Nội dung: Nhãn trạng thái SHTT `getIpStatusLabel(offer.ipStatus)` kết hợp số văn bằng `{offer.ipRegistrationNumber ? `• Số: ${offer.ipRegistrationNumber}` : ''}`.
       * TUYỆT ĐỐI KHÔNG hiển thị huy hiệu `"Xác thực Cục SHTT"`.
  4. **Khối Chủ Thể Chào Bán**:
     - Nằm ngay dưới khối SHTT, hiển thị 1 dòng gọn gàng: Icon `Building2` + Tên doanh nghiệp/đơn vị chào bán (kèm liên kết MST nếu có).

---

### 13.5. Đặc Tả Giao Diện Chi Tiết (UI/UX Specification)

- **`UI-CARD-02`**: **Cấu Trúc Khối & Kích Thước Thẻ Tinh Gọn (`CompactTechnologyCard`)**:
  - **Tỷ lệ Thumbnail**: Giữ tỷ lệ `aspect-[16/10]` trên mobile và `aspect-[16/9]` trên desktop để giữ nét thẩm mỹ ảnh thiết bị.
  - **Khoảng cách đệm (Card Body Spacing)**:
    * Padding thân thẻ: Giảm từ `p-5` xuống `p-4` để tiết kiệm không gian.
    * Khoảng cách giữa các thành phần (`space-y-2` hoặc `space-y-2.5`), loại bỏ khoảng hở thừa.
  - **Tiêu đề & Tóm tắt**:
    * Tiêu đề `offer.title`: `text-sm sm:text-base font-extrabold line-clamp-2 leading-snug`.
    * Tóm tắt `offer.summary`: `text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed`.
  - **Khối Thông Tin Bổ Trợ (Credibility Compact Box)**:
    * Hàng SHTT (1 dòng): `[Shield] Bằng Độc Quyền Sáng Chế • Số: VN-1-0028812`.
    * Hàng Đơn vị (1 dòng): `[Building] Viện Hàn lâm KH&CN Việt Nam • MST: 0100107...`.
  - **Chân Thẻ (Card Footer)**:
    * Giá niêm yết: Căn trái, font chữ đậm màu ngọc (`text-emerald-700 dark:text-emerald-400 font-extrabold text-sm`).
    * Nút CTA `Chi tiết hồ sơ →`: Căn phải, thiết kế dạng ghost/subtle button tinh tế.

---

### 13.6. Tiêu Chí Nghiệm Thu Mở Rộng Delta V8 (Acceptance Criteria)

- **`AC-04-035`**: **Kiểm Thử Loại Bỏ Badge Lặp Lại Trên Thumbnail & Huy Hiệu Xác Thực Cục SHTT**:
  - Truy cập `/chao-ban-cong-nghe`, duyệt qua toàn bộ danh sách các thẻ công nghệ.
  - Xác nhận trên toàn bộ các thumbnail: KHÔNG CÒN xuất hiện dòng chữ `"Sẵn sàng chuyển giao"` hay `"Thương phẩm sẵn có"`.
  - Góc trên bên phải thumbnail chỉ hiển thị nhãn loại hình chào bán (`Sản phẩm`, `Thiết bị`, `Giải pháp`...).
  - Xác nhận trong khối thông tin SHTT: KHÔNG CÒN xuất hiện huy hiệu `"Xác thực Cục SHTT"`.

- **`AC-04-036`**: **Kiểm Thử Khối Thông Tin SHTT Rút Gọn Đúng 1 Dòng Duy Nhất**:
  - Với các hồ sơ có chuyển giao công nghệ (`hasTechTransfer = true`) và có số văn bằng `ipRegistrationNumber`:
    * Thông tin SHTT hiển thị liền mạch trên đúng **1 dòng duy nhất**: Icon `ShieldCheck` + Tên trạng thái bảo hộ + `• Số: {ipRegistrationNumber}` (ví dụ: `[Shield] Bằng Độc Quyền Sáng Chế • Số: VN-1-0028812`).
    * Chuỗi hiển thị không bị ngắt xuống dòng thứ 2 gây phình thẻ (có thuộc tính `truncate` bảo vệ khi co giãn màn hình hẹp).

- **`AC-04-037`**: **Kiểm Thử Thu Nhỏ Mã Hồ Sơ & Chiều Cao Thẻ Compact**:
  - Mã hồ sơ `offerCode` hiển thị với kích thước nhỏ gọn (`text-[11px]`), font monospace tinh tế, không chiếm một dòng riêng biệt với khoảng đệm lớn.
  - Tổng thể chiều cao của mỗi thẻ công nghệ giảm rõ rệt so với phiên bản Delta V7 (tiết kiệm ít nhất 40px chiều cao).
  - Bố cục lưới (Grid) 2 cột trên Desktop (1280px) và 1 cột trên Mobile (375px) hiển thị đồng đều, cân đối, sạch sẽ, không bị lệch chiều cao giữa các thẻ.
