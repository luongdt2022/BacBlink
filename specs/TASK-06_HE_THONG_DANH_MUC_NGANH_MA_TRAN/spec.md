# Feature Specification: TASK-06 Hệ Thống Danh Mục Ngành & Ma Trận TT17

**Feature Branch**: `master-data-sectors-tt17`  
**Feature Directory**: `specs/TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN`  
**Created**: 02/10/2026  
**Status**: Shipped 2026-10-11 (Quality Gate 5 Approved)  
**Ánh Xạ Basic Design**: [`Specification/02_BASIC_DESIGN/TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN/README.md`](../../Specification/02_BASIC_DESIGN/TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN/README.md)  
**Wireframe Tham Chiếu**: [`Specification/02_BASIC_DESIGN/TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN/wireframe_quan_tri_danh_muc_nganh.html`](../../Specification/02_BASIC_DESIGN/TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN/wireframe_quan_tri_danh_muc_nganh.html)  
**Nguồn Dữ Liệu Gốc**: Sheet `Ngành` (29 dòng) và `Ma trận Lĩnh vực-Công nghệ` (132 dòng) trong `Nacentwin_20260924_bo_loc_da_sua.xlsx`

---

## 1. Mục Đích & Bối Cảnh (Context & Objectives)

Phân hệ quản trị Dữ liệu danh mục nền tảng (Master / Reference Data) đóng vai trò là "Nguồn chân lý" (Single Source of Truth) định danh ngành nghề và chuẩn hóa dữ liệu cho toàn bộ hệ sinh thái Nacentwin:
1. **10 Lĩnh Vực Trọng Điểm Chuẩn `LV` (Xác thực 100% trong Excel)**: Nông nghiệp (`LV01`), Chế biến thực phẩm – đồ uống (`LV05`), Cơ khí – chế tạo – CN hỗ trợ (`LV07`), Điện – điện tử – tự động hóa (`LV08`), Nước – môi trường – chất thải (`LV11`), Xây dựng – vật liệu – hạ tầng (`LV12`), Logistics – vận tải – kho bãi (`LV14`), Du lịch – khách sạn – nhà hàng (`LV15`), CNTT – viễn thông – chuyển đổi số (`LV16`), Khoa học – công nghệ – ĐMST (`LV17`).
   > *Lưu ý*: 8 mã khuyết (`LV02, LV03, LV04, LV06, LV09, LV10, LV13, LV18`) chưa có nguồn trong Excel được tạm hoãn loại bỏ theo chỉ đạo của User. Triệt tiêu hoàn toàn các mã tự chế `SEC-*`.
2. **10 Phân Ngành Chế Biến Chế Tạo Thông Tư 17/2019/TT-BKHCN**: Chuẩn hóa nhóm C (C.10 $\rightarrow$ C.32), tỷ lệ giá trị gia tăng, định mức tiêu thụ năng lượng và suất đầu tư phục vụ phân hệ đánh giá năng lực công nghệ TT17 (TASK-09).
3. **59 Cặp Quan Hệ Lĩnh Vực - Công Nghệ Cốt Lõi (1-5 Sao)**: Bảng trọng số tương thích giữa 10 lĩnh vực ứng dụng và các nhóm công nghệ, làm dữ liệu đầu vào cho AI Recommendation Engine ghép cặp Cung - Cầu (TASK-08).
4. **15 Triển Lãm Quốc Tế Chuyên Ngành**: Cung cấp danh mục sự kiện xúc tiến thương mại tham chiếu cho Doanh nghiệp đăng ký tham gia (TASK-03).
5. **Giao Diện Quản Trị Admin**: Cho phép Quản trị viên (`SUPER_ADMIN`, `OPERATOR_ADMIN`, `SECTOR_ADMIN`) tra cứu, thêm mới, kích hoạt / tạm ngưng ngành nghề và tra cứu ma trận LV-CN.

---

## 2. User Scenarios & Acceptance Criteria

### Story 1 - Tra Cứu & Quản Lý 10 Lĩnh Vực Trọng Điểm Chuẩn `LV` (`UI-MASTER-SECTOR-001`)
**User Persona**: `SUPER_ADMIN` & `SECTOR_ADMIN`.  
**Bối cảnh**: Quản trị viên cần xem danh mục 10 Lĩnh vực chuẩn đã xác thực và cập nhật trạng thái hoạt động.

**Acceptance Criteria**:
1. **Given** màn hình Quản trị Danh mục Ngành (`/admin/sectors`), **When** mở Tab "10 Lĩnh Vực Trọng Điểm", **Then** hệ thống hiển thị danh sách 10 lĩnh vực chuẩn `LV01, LV05, LV07, LV08, LV11, LV12, LV14, LV15, LV16, LV17` kèm mã code, phân nhóm TT17 tương ứng, số quy tắc lọc và trạng thái hoạt động.
2. **Given** Admin bấm [Thêm Ngành Mới], **When** nhập mã ngành chuẩn `LV*`, tên ngành và chọn ánh xạ nhóm C TT17, **Then** hệ thống lưu bản ghi mới và hiển thị trạng thái `Active`.
3. **Given** người dùng vãng lai hoặc không có quyền Admin, **When** gọi API chỉnh sửa ngành, **Then** hệ thống chặn với mã `403 Forbidden`.

---

### Story 2 - Tra Cứu 10 Phân Ngành Chuẩn Thông Tư 17 (Nhóm C)
**User Persona**: `SECTOR_ADMIN` & Chuyên viên Đánh giá Công nghệ.  
**Bối cảnh**: Tra cứu chỉ số tham chiếu kỹ thuật và kinh tế của 10 phân ngành chế biến chế tạo.

**Acceptance Criteria**:
1. **Given** Tab "10 Phân Ngành TT17", **When** truy cập, **Then** hiển thị đầy đủ bảng dữ liệu 10 nhóm C (C.10, C.11, C.13, C.16, C.20, C.21, C.26, C.27, C.31, C.32) với các cột: Mức tiêu thụ điện tham chiếu, Tỷ suất lợi nhuận, Hệ số giá trị gia tăng, Suất đầu tư.
2. **Given** hệ thống tính toán điểm TT17 tại TASK-09, **When** cần lấy định mức tham chiếu, **Then** dữ liệu được đọc trực tiếp từ Master Data này mà không bị sai lệch.

---

### Story 3 - Tra Cứu Ma Trận Các Cặp Lĩnh Vực - Công Nghệ (1-5 Sao)
**User Persona**: `OPERATOR_ADMIN` & Engine AI Ghép Cặp.  
**Bối cảnh**: Tra cứu trọng số tương thích giữa bài toán công nghệ và giải pháp chào bán.

**Acceptance Criteria**:
1. **Given** Tab "Ma Trận LV-CN", **When** Admin chọn bộ lọc "Lĩnh vực: Nông nghiệp (LV01)", **Then** hiển thị danh sách các công nghệ tương thích (IoT, AI, GIS, UAV, Sau thu hoạch...) kèm số sao (5 sao = Trọng tâm, 4 sao = Phù hợp cao).
2. **Given** API `GET /api/v1/master-data/matrix`, **When** client gửi request, **Then** trả về danh sách các cặp quan hệ chuẩn JSON để phục vụ thuật toán matching.

---

## 3. Business Rules (Quy Tắc Nghiệp Vụ)

| Mã Rule | Tên Quy Tắc | Điều Kiện & Logic Xử Lý | Mã Lỗi |
| :--- | :--- | :--- | :--- |
| **BR-SEC-001** | **Bảo Toàn Khóa Ngoại Ngành** | Không cho phép xóa cứng một ngành nếu ngành đó đang có Shop, Hồ sơ chào bán hoặc Nhu cầu liên kết. Chỉ cho phép đổi trạng thái sang `Inactive`. | `400 Bad Request` (`ERR_SECTOR_IN_USE`) |
| **BR-SEC-002** | **Định Dạng Mã Ngành Chuẩn SSOT** | Mã Lĩnh vực phải thuộc tập 10 mã `LV` chuẩn đã xác thực (`LV01, LV05, LV07, LV08, LV11, LV12, LV14, LV15, LV16, LV17`). Triệt tiêu hoàn toàn mã tự chế `SEC-*` và từ chối các mã khuyết chưa có dữ liệu. | `422 Unprocessable` (`ERR_INVALID_SECTOR_CODE`) |
| **BR-SEC-003** | **Thang Điểm Ma Trận Bất Biến** | Điểm tương thích ma trận Lĩnh vực - Công nghệ nằm trong thang đo số nguyên từ 1 đến 5 sao. | `422 Unprocessable` (`ERR_INVALID_RATING`) |
| **BR-SEC-004** | **Phân Quyền Master Data** | Chỉ `SUPER_ADMIN`, `OPERATOR_ADMIN` hoặc `SECTOR_ADMIN` mới có quyền thay đổi danh mục ngành. | `403 Forbidden` (`ERR_UNAUTHORIZED_SECTOR_EDIT`) |

---

## 4. API Endpoints Đặc Tả

1. `GET /api/v1/master-data/sectors`: Lấy danh sách 10 Lĩnh vực chuẩn (hỗ trợ lọc active/inactive).
2. `POST /api/v1/master-data/sectors`: Thêm mới hoặc cập nhật Lĩnh vực (Admin only).
3. `GET /api/v1/master-data/tt17`: Lấy danh mục 10 phân ngành chế biến chế tạo TT17.
4. `GET /api/v1/master-data/matrix`: Lấy ma trận các cặp quan hệ LV-CN (hỗ trợ lọc theo `fieldCode`, `minRating`).
5. `GET /api/v1/master-data/exhibitions`: Lấy danh mục 15 triển lãm quốc tế chuyên ngành.

## CR-2026-005 Delta: Dynamic taxonomy constraint

`SECTOR` and `CATEGORY` are runtime DB taxonomies. All screens and API projections that display sector counts, names, options, filters, role scopes or expert profile labels MUST source them from active taxonomy. Hardcoded sector lists/counts and fallback lists are prohibited. Empty/error DB/API results are represented honestly. Matrix compatibility relations may remain separately governed configuration data, but the displayed sector label and active eligibility must resolve through taxonomy; unknown or inactive codes cannot be presented as active sectors.
