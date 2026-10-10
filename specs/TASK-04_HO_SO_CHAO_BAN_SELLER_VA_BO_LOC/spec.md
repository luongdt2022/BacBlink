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
| :--- | :--- | :--- | :---: |
| **REQ-04-001** | Quản lý kho công nghệ Seller | Hiển thị bảng danh sách công nghệ do Seller sở hữu, lọc theo trạng thái (Bản nháp, Chờ duyệt, Đã niêm yết, Đã ẩn), thống kê KPI (Tổng công nghệ, Kết nối thành công, Lượt xem). | P1 |
| **REQ-04-002** | Đăng mới hồ sơ chào bán (Form Wizard) | Cung cấp form nhập liệu chia bước: Thông tin chung, Phân loại loại hình (Sản phẩm/Thiết bị/Giải pháp), Toggle chuyển giao công nghệ & Bộ tứ SHTT, Giá bán & Thương mại, Tài liệu minh chứng. | P1 |
| **REQ-04-003** | Ràng buộc điều kiện Bộ Tứ SHTT | Nếu `has_tech_transfer = true`, bắt buộc nhập đầy đủ 5 trường: Nguồn gốc nghiên cứu, Mức TRL (1-9), Tình trạng SHTT, Hình thức chuyển giao, Trạng thái thương mại hóa. | P1 |
| **REQ-04-004** | Danh sách & Bộ lọc 18 ngành công khai | Trang chủ tab `/chao-ban-cong-nghe` hỗ trợ tìm kiếm từ khóa, bộ lọc phân loại (Tất cả, Thiết bị thương mại, Công nghệ chuyển giao SHTT), lọc theo 18 ngành kinh tế TT17, lọc TRL và Tình trạng SHTT. | P1 |
| **REQ-04-005** | Chi tiết hồ sơ chào bán công nghệ | Trang `/chao-ban-cong-nghe/[id]` hiển thị trực quan thông số kỹ thuật, huy hiệu mức TRL, chứng nhận SHTT (IP Trust Badge), thông tin đơn vị nghiên cứu/sở hữu, nút Gửi yêu cầu chuyển giao và Yêu cầu DataRoom. | P1 |
| **REQ-04-006** | Hỗ trợ 5 UX States | Mọi màn hình đáp ứng đầy đủ 5 trạng thái UX qua chuẩn `<Async>`: Loading, Empty, Error, Success, Partial. | P1 |
| **REQ-04-007** | Chọn Cơ quan quản lý & Phân cấp thẩm định Cấp 2 | Form đăng ký bắt buộc chọn Sở KH&CN tiếp nhận thẩm định (`managing_authority_id`, `scope_id` 63 tỉnh/thành) và tích chọn cam kết pháp lý. Hệ thống tự động tạo phiếu duyệt `ApprovalRequest` đẩy về Cổng Tác Nghiệp Cấp 2 `/gov`. | P1 |

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
