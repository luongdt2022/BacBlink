# Change Request: CR-BACLINK-002 Tinh Gọn Admin 1 Cấp BACLINK, Gỡ `/gov/*` & `/admin/org-tree`, Khóa Endpoint Legacy

**CR-ID**: `CR-BACLINK-002`  
**Epic**: `TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN`  
**Status**: `APPROVED` (Batch `P0-B3` — 2026-11-17)  
**Target Version**: `1.17.0`  
**Author**: Senior BA (`nacen-ba`) / Phê duyệt: PO (`nacen-po-pm`)  
**Date**: `2026-11-17`  
**Căn cứ pháp lý & Kiến trúc**:
- `Specification/BASIC_DESIGN_BACLINK.md` (Mục 1.3, 6, 9.2: `PO-DEC-BACLINK-02`).
- `SourceCode/backend/docs/decisions/ADR-0018-BACLINK-3-TIER-RBAC-AND-CONTENT-REFACTOR.md` (Mục 2.1, 2.2, 2.4, 4).
- `SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md`.

---

### 1. Bối Cảnh & Lý Do Thay Đổi (As-Is vs To-Be)

- **Hiện trạng cũ (As-Is)**:
  1. Hệ thống tồn tại cổng quản trị nhà nước phân cấp `/gov/*` (`src/app/gov/**`, `src/components/gov/**`) cho 34 Sở KH&CN và màn hình cây tổ chức 34 tỉnh `/admin/org-tree`.
  2. Ma trận phân quyền `/admin/roles/page.tsx` đang hiển thị 10 vai trò (`SUPER_ADMIN`, `PROVINCIAL_ADMIN`, `SECTOR_ADMIN`, `CLUSTER_ADMIN`...) và gọi endpoint `/api/v1/governance/roles/*`; `AdminLayout` và `AdminNav` còn các mục `Cơ cấu 34 tỉnh/thành`, `Cảnh báo quá hạn SLA 34 sở`, `Phê duyệt vượt cấp`.
  3. Một số endpoint `/api/v1|v2/gov/*` đang gắn `[AllowAnonymous]` (`DemandController.GetGovPendingDemands`, `GetGovDemandSurveys`, `BrokerageControllers.GetGovOpportunities`, `AssessmentsController.GetGovAssessmentQueue/Dashboard`), gây nguy cơ lộ dữ liệu quản trị khi không đăng nhập.
  4. `GovernanceControllers` (`RequireGlobalAdmin`) đang kiểm tra cứng `SUPER_ADMIN` / `OPERATOR_ADMIN` mà bỏ sót role chuẩn `ADMIN`.

- **Đề xuất mới (To-Be)**:
  1. Gỡ bỏ hoàn toàn cổng `/gov/*` và `/admin/org-tree` khỏi thanh điều hướng (`AdminLayout`, `AdminNav`, `Navbar`, `quick-portal-switcher.tsx`, `guide-data.ts`) và xóa bỏ luồng thẩm định 2 cấp Sở KH&CN (`src/components/gov/*`).
  2. Xử lý an toàn khi người dùng truy cập trực tiếp URL cũ `/gov/*` hoặc `/admin/org-tree`: điều hướng thông minh về Workspace hợp lệ (`/admin` cho `ADMIN`, `/portal` cho `ENTERPRISE`, `/` cho `PUBLIC_USER`/khách) hoặc trả trang thông báo ngừng phục vụ (`410 Gone`) kèm nút điều hướng, tuyệt đối không render dữ liệu quản trị cũ.
  3. Khóa toàn bộ endpoint `/api/v1|v2/gov/*` đang gắn `[AllowAnonymous]` tại `DemandController`, `BrokerageControllers`, `AssessmentsController` và các route quản trị `GovernanceControllers`: gỡ `[AllowAnonymous]`, trả `410 Gone` hoặc yêu cầu `[Authorize(Roles = "ADMIN")]` trước khi chuyển hẳn sang `/api/v1/admin/*`. (Riêng endpoint tra cứu địa bàn công khai `public-provinces` được tách sang `MasterDataControllers` theo `CR-BACLINK-003`).
  4. Tinh gọn Admin Console (`/admin/*`) thành **Bàn Quản trị Hiệp hội BACLINK 1 cấp** (`ADMIN` duy nhất duyệt trực tiếp Hội viên, Sản phẩm, Nhu cầu, Đánh giá nhà máy, LMS, Ban Cố vấn, Chứng thực ZKP), tinh gọn `/admin/roles` còn ma trận 3 cấp (`ADMIN`, `ENTERPRISE`, `PUBLIC_USER`).

---

### 2. Ma Trận Tác Động Đa Bề Mặt & Liên Epic (Cross-Surface & Cross-Epic Impact Matrix)

| Bề mặt / Thành phần | Tệp Nguồn Chính | Hiện Trạng (As-Is) | Thay Đổi Cần Làm (To-Be) |
| :--- | :--- | :--- | :--- |
| **Backend Gov Endpoints (`AllowAnonymous`)** | `V1Compat/DemandController.cs`, `V1Compat/BrokerageControllers.cs`, `V2/AssessmentsController.cs`, `V1Compat/GovernanceControllers.cs` | Mở `[AllowAnonymous]` cho `gov/demands`, `gov/demands/surveys`, `gov/opportunities`, `gov/assessments/tt17*`; `RequireGlobalAdmin` sót `ADMIN` | Gỡ `[AllowAnonymous]` khỏi 100% route `gov/*`; trả `410 Gone` (hoặc chặn `[Authorize(Roles = "ADMIN")]`); chuẩn hóa `RequireGlobalAdmin` nhận `ADMIN` (và alias legacy `[Obsolete]`). |
| **Backend Approval & Scope** | `modules/identity/Application/ApprovalService.cs`, `OrganizationTreeService.cs`, `modules/technology/TechnologyOffersController.cs` | Chặn `ClusterAdmin` approve trực tiếp; ép `MatchProvinceScope` theo `Actor.ScopeId` | Gộp quy trình về **1 cấp `ADMIN` duyệt trực tiếp**; gỡ ràng buộc `MatchProvinceScope` theo `PROVINCIAL_ADMIN` / 34 Sở. |
| **Frontend `/gov/*` & `/admin/org-tree`** | `src/app/gov/**`, `src/components/gov/**`, `src/app/admin/org-tree/**` | Màn hình & component thẩm định Sở KH&CN, cây 34 tỉnh | Gỡ link khỏi toàn bộ nav/switcher; chuyển route `/gov/*` và `/admin/org-tree` thành redirect/410 an toàn; dọn/ngừng sử dụng `components/gov/*`. |
| **Frontend Admin Console** | `src/app/admin/layout.tsx`, `src/components/admin/admin-nav.tsx`, `src/app/admin/roles/page.tsx`, `src/app/admin/approvals/*` | 4 nhóm menu có `/admin/org-tree`, `SLA 34 sở`, `Vượt cấp tầng 0`, `10 Roles` | Tinh gọn sidebar/nav về **1 cấp Hiệp hội BACLINK**: bỏ `/admin/org-tree`, bỏ tab `Vượt cấp 2 tầng` & `SLA 34 Sở`; `/admin/roles` hiển thị ma trận 3 cấp (`ADMIN`, `ENTERPRISE`, `PUBLIC_USER`). |
| **Frontend RoleGuard & Switcher** | `src/components/auth/role-guard.tsx`, `src/components/common/quick-portal-switcher.tsx` | Cho phép `PROVINCIAL_ADMIN` vào `/gov` | `AdminLayout` `RoleGuard` chuẩn hóa `allowedRoles={['ADMIN', 'SUPER_ADMIN', 'OPERATOR_ADMIN']}` (giữ tương thích token chuyển tiếp); bỏ nút `/gov` trên `quick-portal-switcher.tsx`. |
| **Consuming Epics** | `TASK-00`, `TASK-06`, `TASK-03`, `TASK-04`, `TASK-08`, `TASK-09` | Gửi/nhận trạng thái duyệt qua `/gov/*` và `PROVINCIAL_ADMIN` | Đồng bộ duyệt 1 cấp bởi `ADMIN` BACLINK. |

---

### 3. Chi Tiết Thay Đổi Quy Chuẩn (Immutable Anchors)

- **[ADD] `REQ-BACLINK-ADM-001` (Phê Duyệt Tập Trung 1 Cấp Bởi `ADMIN` Hiệp Hội BACLINK)**:
  - Loại bỏ cơ chế duyệt 2 cấp (Sở KH&CN đề xuất → Trung ương phê duyệt vượt cấp). `ADMIN` BACLINK có toàn quyền phê duyệt/từ chối trực tiếp hồ sơ Đăng ký Hội viên (`ENTERPRISE`), Sản phẩm/Năng lực, Nhu cầu đặt hàng, Cố vấn kỹ thuật và Đánh giá Năng lực Nhà máy tại `/admin/approvals`.
  - Mọi kiểm tra phạm vi hành chính tỉnh/sở (`MatchProvinceScope` theo `Actor.ScopeId`) được gỡ bỏ ở tầng duyệt.
- **[ADD] `REQ-BACLINK-ADM-002` (Gỡ Bỏ `/gov/*` & `/admin/org-tree` Trên UI Và Route Guard)**:
  - Gỡ bỏ hoàn toàn liên kết tới `/gov/*` và `/admin/org-tree` khỏi `AdminLayout`, `AdminNav`, `Navbar`, `quick-portal-switcher.tsx` và tài liệu hướng dẫn trong app.
  - Truy cập trực tiếp `/gov/*` hoặc `/admin/org-tree` MUST thực hiện điều hướng an toàn về Workspace hợp lệ (`/admin`, `/portal`, hoặc `/`) hoặc hiển thị thông báo `410 Gone`, tuyệt đối không lộ dữ liệu hoặc form thẩm định Sở KH&CN.
  - Tinh gọn `/admin/roles` còn ma trận **3 cấp (`ADMIN`, `ENTERPRISE`, `PUBLIC_USER`)**.
- **[ADD] `REQ-BACLINK-ADM-003` (Khóa Toàn Bộ Endpoint `/api/v*/gov/*` Từng Mở `[AllowAnonymous]`)**:
  - Xóa `[AllowAnonymous]` trên toàn bộ endpoint `/api/v1|v2/gov/*` tại `DemandController`, `BrokerageControllers`, `AssessmentsController`, và `GovernanceControllers` (trừ endpoint public locations sau khi tách sang `/api/v1/master-data/locations` theo `CR-BACLINK-003`).
  - Các route `/api/v*/gov/*` bị vô hiệu hóa trả về `410 Gone` (hoặc yêu cầu xác thực `[Authorize(Roles = "ADMIN")]` nếu giữ alias tạm thời), đảm bảo người dùng ẩn danh hoặc `PUBLIC_USER`/`ENTERPRISE` nhận `401`/`403`/`410`.
- **[ADD] `BR-BACLINK-ADM-001` (Đồng Nhất `RequireGlobalAdmin` Với Role `ADMIN`)**:
  - Hàm kiểm tra quyền Admin tối cao ở Backend (`RequireGlobalAdmin` và các policy `ADMIN_MANAGE`) MUST chấp nhận `PlatformRoles.Admin` (`"ADMIN"`), đồng thời hỗ trợ alias chuyển tiếp `SUPER_ADMIN` / `OPERATOR_ADMIN` đã được `NormalizeTier`.
- **[ADD] `BR-BACLINK-ADM-002` (Bảo Toàn Nhật Ký Kiểm Toán & Optimistic Locking)**:
  - Mọi hành động duyệt/từ chối của `ADMIN` 1 cấp vẫn phải ghi Audit Log bất biến (`AuditLog`) và kiểm tra `RowVersion` / trạng thái hiện tại để chống duyệt đè.
- **[ADD] `TEST-BACLINK-002` (Kiểm Chứng Security & RBAC Fuzzing Cho Admin 1 Cấp)**:
  - Kiểm thử API khẳng định 0 endpoint `/api/v*/gov/*` trả `200 OK` cho request không có JWT hoặc token `PUBLIC_USER`/`ENTERPRISE`.
  - Kiểm thử FE (Vitest + Playwright) xác nhận `/admin` không còn link `/admin/org-tree` hay `/gov/*`, `/admin/roles` hiển thị 3 cấp, và truy cập `/gov` hoặc `/admin/org-tree` được điều hướng an toàn.

---

### 4. Tiêu Chuẩn Chấp Thuận (Acceptance Criteria)

- **`AC-CR-BACLINK-002.1`**: Request ẩn danh hoặc mang JWT `PUBLIC_USER` / `ENTERPRISE` gọi bất kỳ route `/api/v1|v2/gov/*` nào đều bị chặn (`401`, `403`, hoặc `410`), tuyệt đối không trả dữ liệu (`200 OK`).
- **`AC-CR-BACLINK-002.2`**: Tài khoản `ADMIN` duyệt hồ sơ Đăng ký Hội viên tại `/admin/approvals` thành công trong 1 bước mà không gặp lỗi `MatchProvinceScope` hay yêu cầu phê duyệt vượt cấp.
- **`AC-CR-BACLINK-002.3`**: `AdminLayout` và `AdminNav` không còn mục `/admin/org-tree`, không còn nhãn `34 Tỉnh/Thành`, `SLA 34 Sở`, `Phê duyệt vượt cấp tầng 0`; `quick-portal-switcher.tsx` không còn mục `/gov`.
- **`AC-CR-BACLINK-002.4`**: Trang `/admin/roles` hiển thị ma trận phân quyền 3 cấp (`ADMIN`, `ENTERPRISE`, `PUBLIC_USER`) thay cho ma trận 10 vai trò cũ.
- **`AC-CR-BACLINK-002.5`**: Truy cập `/gov` hoặc `/admin/org-tree` trên trình duyệt không hiển thị dữ liệu nội bộ và điều hướng an toàn; bộ test RBAC/Admin đạt PASS 100%.
