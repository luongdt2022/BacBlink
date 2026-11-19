# Tài Liệu Thiết Kế Kỹ Thuật Hiện Hành (Living Doc) — TASK-02: Phân Hệ Hồ Sơ Chủ Thể & 304 Doanh Nghiệp ĐMST

> **Trạng thái**: Hoạt động (Shipped 2026-10-09)  
> **Mã phân hệ**: `TASK-02`  
> **Mã thiết kế**: `DD-02-TASK-02`  
> **Căn cứ**: Sheet `DN ĐMST` (225 cột dữ liệu), CSDL 304 Doanh nghiệp thực tế có MST (`Khảo sát 304 DN-final-2408.xlsx`), Nghị định 13/2023/NĐ-CP (PDPD), ADR-0012 Hybrid Relational + JSONB.

---

## 1. TỔNG QUAN PHÂN HỆ & HIỆN TRẠNG TRIỂN KHAI

Phân hệ Hồ Sơ Chủ Thể & 304 Doanh Nghiệp ĐMST phục vụ quản lý "Căn cước số" của các tổ chức, doanh nghiệp, viện/trường trong hệ sinh thái Nacentwin. Phân hệ đã hoàn thành toàn bộ chu trình phát triển và kiểm định hộp đen 4 tầng:

- **CSDL Thực nghiệm**: Nạp 304 Doanh nghiệp khảo sát thực tế có MST vào PostgreSQL (`enterprise.enterprises: 304`, `demand.demand_surveys: 304`).
- **Kiến trúc dữ liệu Hybrid**: Kết hợp quan hệ chuẩn hóa 3NF (`enterprises`, `enterprise_projects`, `enterprise_ip_assets`) với trường mở rộng `JSONB` (`raw_survey_payload`, `address_info_json`, `metadata`) theo quyết định ADR-0012.
- **Bảo mật dữ liệu cá nhân (PDPD)**: Tuân thủ Nghị định 13/2023/NĐ-CP, tự động che giấu (`[BẢO MẬT]`) trường doanh thu, ngân sách R&D và số điện thoại liên hệ cá nhân đối với người dùng công cộng.
- **Phân quyền 3D Scoped RBAC**: Hỗ trợ phân cấp quản lý theo vai trò (`INNOVATION_ENTITY`, `ADMIN`, `PROVINCIAL_ADMIN`). Cán bộ Sở KH&CN chỉ thẩm định các doanh nghiệp thuộc tỉnh/thành phụ trách.
- **Trọn bộ 5 Màn hình Web**: 
  1. `/enterprises`: Danh bạ công khai với bộ lọc 5 trục (tỉnh/thành, ngành TT17, quy mô, TNI, badge).
  2. `/enterprises/[taxCode]`: Chi tiết doanh nghiệp với 4 tabs (Tổng quan, R&D, SHTT, Nhu cầu) và PDPD Masking.
  3. `/portal/enterprise/profile`: Workspace quản trị chủ sở hữu, kê khai 10 nhóm trường (225 chỉ số) và nộp thẩm định.
  4. `/admin/enterprises/dashboard`: Bảng điều khiển phân tích 304 DN theo địa bàn, cơ cấu ngành TT17, phân tầng TNI và rào cản công nghệ.
  5. `/gov/approvals/enterprises`: Cổng thẩm định cấp Sở Maker-Checker.

---

## 2. KIẾN TRÚC BACKEND (.NET CORE & CLEAN ARCHITECTURE)

### 2.1. Domain Entities & Invariants
- `Enterprise`: Entity hạt nhân quản lý MST duy nhất (`tax_code`), tên pháp lý, địa bàn, ngành TT17 (`sector_code`), trạng thái thẩm định (`PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`), chỉ số TNI (`Urgency`, `Impact`, `Capacity`, `Readiness`).
- `EnterpriseProject`: Danh mục dự án ĐMST / R&D quan hệ 1-N.
- `EnterpriseIpAsset`: Danh mục tài sản Sở hữu Trí tuệ (Sáng chế, GPHI, nhãn hiệu, kiểu dáng công nghiệp).
- `EnterpriseInvariants`: Bộ kiểm tra bất biến logic nghiệp vụ (`EnsureTaxCodeValid`, `MaskPdpdData`, `ValidateSubmissionReadiness`, `EnsureProvincialScope`).

### 2.2. RESTful API Endpoints (`/api/v1/enterprises`)
| Method | Endpoint | Quyền hạn (RBAC) | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/enterprises` | Công khai (`PUBLIC_USER`) | Tra cứu danh bạ, phân trang, lọc 5 trục. Tự động PDPD Masking. |
| `GET` | `/api/v1/enterprises/{taxCode}` | Công khai (`PUBLIC_USER`) | Xem chi tiết hồ sơ công khai theo MST. Áp dụng PDPD Masking. |
| `GET` | `/api/v1/enterprises/profile/me` | `INNOVATION_ENTITY` | Chủ doanh nghiệp xem toàn bộ 10 nhóm trường (không bị che giấu). |
| `PUT` | `/api/v1/enterprises/profile` | `INNOVATION_ENTITY` | Cập nhật hồ sơ 10 nhóm trường (Auto-save hoặc Lưu chính thức). |
| `POST`| `/api/v1/enterprises/submit` | `INNOVATION_ENTITY` | Nộp hồ sơ chờ thẩm định cấp tỉnh (Maker-Checker). |
| `GET` | `/api/v1/admin/enterprises/dashboard` | `ADMIN`, `SUPER_ADMIN` | Thống kê KPI 304 DN, biểu đồ ngành TT17, bản đồ nhiệt địa bàn. |
| `POST`| `/api/v1/gov/enterprises/approve` | `PROVINCIAL_ADMIN` | Thẩm định và cấp Verified Badge cho DN thuộc địa bàn Sở. |
| `POST`| `/api/v1/gov/enterprises/reject` | `PROVINCIAL_ADMIN` | Từ chối hồ sơ kèm lý do cần bổ sung. |

---

## 3. KIẾN TRÚC FRONTEND (NEXT.JS 15 & APP ROUTER)

- **UI SDK**: `enterpriseApi.ts` đóng gói toàn bộ các hàm gọi API REST v1.
- **UX States**: 100% màn hình sử dụng component chuẩn `<Async>` xử lý 5 trạng thái UX (Loading, Empty, Error, Success, Updating).
- **Responsive & Design System**: Đồng bộ Tailwind CSS, Lucide Icons, chuẩn hóa giao diện bảng biểu theo Wireframe Basic Design.

---

## 4. BẰNG CHỨNG KIỂM ĐỊNH CHẤT LƯỢNG (GATE 4 SIGN-OFF)

- **Unit Invariants**: `dotnet test tests/invariants/ --filter "FullyQualifiedName~Enterprise"` -> **Pass 6/6 (100%)**.
- **API Contract Tests**: Khớp 100% schema phản hồi JSON trên các endpoint công khai và bảo mật.
- **Database Integration**: Nạp thành công và duy trì tính toàn vẹn 304 DN thật trong CSDL PostgreSQL.
- **Playwright Black-box Test**: File kiểm thử tự động `SourceCode/frontend/tests/e2e/test_task02_enterprises_blackbox.py` chạy qua 5 màn hình thật đạt **100% Green**.
- **Static Guardrails**: Script `./Agent/scripts/guard-rails.sh` xác nhận không có lỗi biên dịch, không có file rác thư mục gốc.
