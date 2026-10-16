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
