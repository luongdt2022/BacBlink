# Change Request: CR-BACLINK-007 Rà Soát & Gỡ Bỏ Toàn Diện Tàn Dư Phiếu Khảo Sát, TT17, ĐMST, Role Cấp Sở/Đa Tỉnh & Thương Hiệu Cũ (Bản Rút Gọn BACLINK Bắc Ninh)

**CR-ID**: `CR-BACLINK-007`  
**Epic**: `TASK-00_PLATFORM_FOUNDATION_VA_COMMON` (Lan truyền chéo toàn bộ `TASK-01` .. `TASK-11`)  
**Status**: `SHIPPED` (`PO-DEC-BACLINK-06` — Gate 5 Sign-off 2026-11-18)  
**Target Version**: `1.24.0`  
**Author**: Product Owner (`nacen-po-pm`) & Senior BA (`nacen-ba`)  
**Date**: `2026-11-18`  
**Căn cứ pháp lý & Kiến trúc**:
- `Specification/BASIC_DESIGN_BACLINK.md` (`v1.1.0` — Mục 1.3, 6, 9.2: `PO-DEC-BACLINK-06`).
- `SourceCode/backend/docs/decisions/ADR-0018-BACLINK-3-TIER-RBAC-AND-CONTENT-REFACTOR.md`.
- `SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md`.

---

### 1. Bối Cảnh & Lý Do Thay Đổi (As-Is vs To-Be)

- **Hiện trạng tồn đọng (As-Is)**:
  1. **Tàn dư Các Phiếu & Đánh giá TT17/ĐMST**: Một số tuyến đường, menu con, bộ lọc, thẻ hiển thị, modal và trang cẩm nang vẫn còn tham chiếu đến *Phiếu khảo sát nhu cầu DNNVV*, *Phiếu đánh giá DN ĐMST 43 câu*, *Phiếu đánh giá trình độ năng lực công nghệ theo Thông tư 17 (TT17)* (`/assessments/buyer` trên Navbar, bộ lọc `TT17_LEVELS` trên Danh bạ DN, `"Phân Loại TT17"` / `"Chuẩn TT17"` trên Sàn chào bán, `TT17_ASSESSMENT` trong Blockchain, mục `"Các Loại Phiếu Yêu Cầu & Khảo Sát"` tại `/huong-dan`, các tab `"tt17"`/`"tree"`/`"exhibitions"` tại `/admin/sectors`, câu chữ `"kê khai phiếu khảo sát"` tại Nhu cầu & Workspace).
  2. **Tàn dư Role Cấp Sở / Ban ngành / Trung gian / Đa tỉnh**: Trang `/login` vẫn hiển thị 6 nút tài khoản `@demo.nacentech.vn` (`Super Admin (Toàn quốc)`, `Doanh Nghiệp ĐMST`, `Chuyên Gia KH&CN`...); trang `/register` vẫn dùng logo & câu chữ `NacenTech`; trang `/admin/users`, `/admin/system-config`, `/admin/approvals`, `/portal/seller/technologies/*`, `/portal/expert/*`, `/huong-dan` vẫn còn tàn dư `PROVINCIAL_ADMIN`, `CLUSTER_ADMIN`, `SECTOR_ADMIN`, `"Tham Số SLA Thẩm Định Cấp Sở"`, `"Sở Khoa học và Công nghệ TP. Hà Nội"`, `"Tài Khoản Đang Chờ Phê Duyệt Cấp Sở"`, `"Bộ KH&CN"`.
  3. **Tàn dư Thương hiệu cũ & Nhãn ĐMST**: Còn xuất hiện `"Doanh nghiệp ĐMST"` / `"DN ĐMST"`, `"Viện NacenTech"`, `"NacenTwin"` trên trang chi tiết DN, chuyên gia, e-learning, cài đặt, hồ sơ cá nhân và trang `/wireframes` (được gắn vào link `"Sơ đồ cổng (Sitemap)"` dưới Footer).
  4. **Tàn dư Dữ liệu CSDL & API Backend**:
     - `enterprise.enterprises` còn 3 dòng email rác `@demo.nacentech.vn` (làm tổng thành 10 thay vì 7 DN Bắc Ninh chuẩn); API trả `"Huy hiệu Đồng ĐMST"`.
     - `brokerage.expert_profiles` còn 2 chuyên gia NacenTwin (`CG-NACEN-DEMO001`, `CG-NACEN-DEMOIT01`), và API `/api/v1/public/experts` trả mã thô `IND_*` thay vì tên ngành tiếng Việt.
     - `/api/v1/master-data/sectors` trả cả 10 mã `LV*` đã vô hiệu hóa (`isActive = false`) cùng 8 ngành `IND_*`.
     - `identity.persons`, `identity.approval_requests`, `content.techmart_events`, `technology.seller_technology_offers`, `demand.demand_items`, `demand.demand_surveys`, `assessment.tt17_assessments` còn bản ghi lịch sử NacenTwin/Sở/TT17.

- **Mục tiêu chuẩn hóa (To-Be — Bản rút gọn BACLINK Bắc Ninh)**:
  1. **Gỡ bỏ 100% chức năng & tham chiếu về Các Phiếu / TT17 / ĐMST**: Chuyển hướng toàn bộ `/assessments/*`, `/khao-sat-*`, `/dieu-tra-trinh-do-nang-luc`, `/admin/assessments/*`; gỡ sạch bộ lọc/nhãn/tab `TT17` và `Phiếu khảo sát` trên mọi màn hình Public, Portal các vai trò và Admin.
  2. **Chuẩn hóa 100% mô hình 3 Cấp BACLINK (`ADMIN` – `ENTERPRISE` – `PUBLIC_USER`)**: Xóa sạch các vai trò cấp Sở/Tỉnh/Viện trung gian, `"Địa phương phụ trách"`, `"Sở KH&CN"`, `"Bộ KH&CN"`, `"34 tỉnh"`; cập nhật Quick-Fill Login dùng đúng bộ tài khoản `@baclink.org.vn` 3 cấp; đồng bộ `/register` và Sitemap `/wireframes` sang thương hiệu BACLINK.
  3. **Làm sạch 100% Thương hiệu & Chủ sở hữu**: Khẳng định chủ sở hữu duy nhất là **Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)**; xóa sạch `"NacenTech"`, `"NacenTwin"`, `"Viện NacenTech"`, `"Doanh nghiệp ĐMST"` khỏi toàn bộ giao diện người dùng.
  4. **Làm sạch CSDL PostgreSQL & API Contract**: Giữ đúng **7 Doanh nghiệp Hội viên Bắc Ninh**, **5 Cố vấn Kỹ thuật BACLINK**, **10 Sản phẩm/Năng lực**, **8 Nhu cầu đặt hàng**, **6 Khóa học LMS công nghiệp**, sự kiện thực tế BACLINK; `/api/v1/master-data/sectors` mặc định chỉ trả 8 ngành active `IND_*`; `/api/v1/public/experts` trả tên ngành tiếng Việt; `/api/v1/enterprises` không trả nhãn `"ĐMST"`.

---

### 2. Ma Trận Tác Động Đa Bề Mặt (Cross-Surface Impact Matrix)

| Bề mặt | Phạm vi Tệp Chính | Hành động Thực thi |
| :--- | :--- | :--- |
| **1. PostgreSQL & Seed SQL** | `SourceCode/backend/scripts/clean_baclink_slim_edition.sql`, `seed_baclink_demo_data.sql` | Giữ đúng 7 DN Bắc Ninh, 5 Cố vấn BACLINK, 10 sản phẩm `IND_*`, 8 nhu cầu `IND_*`, 6 khóa học `LMS-BL-*`, sự kiện BACLINK; dọn sạch dòng rác NacenTwin, TT17, khảo sát, Sở tỉnh. |
| **2. Backend .NET 10 API** | `MasterDataControllers.cs`, `EnterpriseController.cs` / `EnterpriseService.cs`, `ExpertPublicService` / `ExpertController`, `AssessmentControllers` | Mặc định lọc `is_active = true` cho `/api/v1/master-data/sectors`; giải nghĩa tên ngành `IND_*` cho chuyên gia; bỏ `"Huy hiệu ... ĐMST"`; khóa các API TT17/Surveys cũ. |
| **3. Frontend Shell, Auth & Public** | `next.config.ts`, `navbar.tsx`, `footer.tsx`, `(auth)/login`, `(auth)/register`, `huong-dan/*`, `matrix`, `wireframes`, `elearning/*`, `dich-vu-khac`, `gioi-thieu`, `page.tsx`, `lib/*` | Redirect toàn bộ URL phiếu/TT17/gov; sửa link Dịch vụ trên Navbar; chuẩn hóa Login 3 cấp `@baclink.org.vn` & Register BACLINK; rút gọn Cẩm nang hướng dẫn (bỏ Phiếu & TT17 & GOV); biến `/wireframes` thành Sơ đồ cổng BACLINK sạch. |
| **4. Frontend Marketplace & Portal** | `enterprises/*`, `doanh-nghiep-dmst`, `chao-ban-cong-nghe/*`, `nhu-cau-cong-nghe/*`, `experts/*`, `portal/**`, `profile/**`, `settings`, `components/{enterprise,seller,demand,portal,expert-detail}/*` | Gỡ bộ lọc/sắp xếp/nhãn `TT17` & `ĐMST`; gỡ câu chữ khảo sát/Sở KH&CN/Viện NacenTech trên toàn bộ Sàn, Danh bạ, Hồ sơ cá nhân, Upgrade Hub và Workspace Buyer/Seller/Expert. |
| **5. Frontend Admin Console** | `src/app/admin/**`, `src/components/admin/**`, `src/components/lms/**` | Gỡ tab `tt17`/`tree`/`exhibitions` ở `/admin/sectors`; gỡ `TT17_ASSESSMENT` ở `/admin/blockchain`; gỡ `Sở/ĐMST/NacenTwin` ở `/admin`, `/admin/approvals`, `/admin/users`, `/admin/enterprises/dashboard`, `/admin/system-config`, `/admin/audit-logs`, `/admin/elearning`. |
| **6. Kiểm thử 4 Tầng (QC Gate 4)** | Vitest + .NET xUnit + `psql` + Playwright E2E Live Sweep | Kiểm chứng toàn bộ test suites xanh, đối soát PostgreSQL thật và quét DOM thực tế trên tất cả routes port `3001` đạt 0 từ cấm lộ UI. |

---

### 3. Mỏ Neo Quy Chuẩn Bất Biến (Immutable Anchors)

- **[ADD] `REQ-BL07-NO-SURVEY-001`**: Bản rút gọn BACLINK Bắc Ninh KHÔNG cung cấp các phiếu khảo sát nhu cầu DNNVV, phiếu đánh giá ĐMST 43 câu và phiếu đánh giá trình độ công nghệ TT17 trên bất kỳ giao diện Public, Portal hay Admin nào.
- **[ADD] `BR-BL07-3TIER-ONLY-001`**: Chỉ tồn tại 3 vai trò nền tảng (`ADMIN`, `ENTERPRISE`, `PUBLIC_USER`) với `ScopeType = GLOBAL`; nghiêm cấm hiển thị vai trò cấp Sở/Tỉnh/Ngành trung gian hoặc bộ chọn Sở KH&CN / Địa phương phụ trách trên UI.
- **[ADD] `BR-BL07-BRAND-PURITY-002`**: Đơn vị chủ quản duy nhất trên toàn cổng là **Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)**; 0 chuỗi `NacenTech`, `NacenTwin`, `Bộ KH&CN`, `Sở KH&CN`, `34 tỉnh`, `Thông tư 17`, `TT17`, `Doanh nghiệp ĐMST` xuất hiện trên giao diện hiển thị người dùng.
- **[ADD] `DB-BL07-CLEAN-SEED-001`**: CSDL PostgreSQL `nacentech` chỉ duy trì dữ liệu chuẩn BACLINK: 7 Doanh nghiệp Hội viên Bắc Ninh (`bac10000-...-8002-*`), 5 Cố vấn Kỹ thuật BACLINK (`CG-BL-001..005`), 8 ngành `IND_*` active, ≤ 30 tài khoản sạch không chứa tên đơn vị `Viện NacenTech` / `Demo ĐMST`.
- **[ADD] `API-BL07-CLEAN-CONTRACT-001`**: `GET /api/v1/master-data/sectors` mặc định chỉ trả các ngành `isActive = true` (8 ngành `IND_*`); `GET /api/v1/public/experts` trả tên ngành tiếng Việt chuẩn cho `IND_*`; `GET /api/v1/enterprises` không sinh nhãn `"ĐMST"`.
- **[ADD] `UI-BL07-CLEAN-WEB-001`**: Toàn bộ routes trên cổng Web (Public, Auth, Portal, Profile, Admin) render sạch 100% không còn nút chết, không còn link trỏ về phiếu khảo sát/TT17/`/gov/*`, Sitemap `/wireframes` hiển thị sơ đồ điều hướng BACLINK thật.
- **[ADD] `TEST-BL07-FULL-SWEEP-001`**: Kiểm thử 4 tầng (Unit, API Contract, PostgreSQL State, Playwright Live Browser DOM Audit qua cả 3 cấp tài khoản) đạt 100% PASS.
