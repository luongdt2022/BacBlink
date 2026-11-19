# Change Request: CR-2026-031 Phản Hồi Chuyển Route Tức Thì (`loading.tsx` + Pending Skeleton) Cho `/portal/*`, `(portal)` & `/gov/*` Và Cache Hồ Sơ Doanh Nghiệp

**CR-ID**: `CR-2026-031`  
**Epics**: `TASK-00_PLATFORM_FOUNDATION_VA_COMMON`, `TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN`  
**Status**: `SHIPPED` (Verified — 2026-11-11)  
**Target Version**: `TASK-00 v1.22.0` / `TASK-07 v1.17.0`  
**Author**: PO (`nacen-po-pm`)  
**Date**: `2026-11-11`  
**Căn cứ pháp lý & Thiết kế cơ sở**:
- Quyết định điều hành `PO-DEC-20261111-03` tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 35.
- Hiến pháp Quản trị Đặc tả: `SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md`.

---

### 1. Bối Cảnh & Lý Do Thay Đổi (As-Is vs To-Be)

- **Hiện trạng cũ (As-Is)**:
  1. Mới chỉ có `src/app/admin/loading.tsx` và pending route skeleton tại `AdminLayout`. Hai không gian có Sidebar điều hướng còn lại là `/portal/*` (`PortalLayout`) và `/gov/*` (`GovLayout`) đều chưa có `loading.tsx` và chưa có `pendingHref` workspace skeleton, khiến vùng nội dung cũ đứng im khi người dùng click chuyển mục.
  2. Tuyến `/assessments/tt17` nằm trong route group `(portal)` ngoài nhánh `/portal/*`, nên cần cả `pendingHref` từ `PortalLayout` và `(portal)/loading.tsx`.
  3. `PortalLayout` có `useEffect(..., [pathname])` gọi lại `fetchMyEnterpriseProfile()` ở mỗi lần đổi route, trong khi `fetchMyEnterpriseProfile()` chưa có TTL cache và request deduplication (đồng thời `RoleSwitcher` cũng gọi song song khi mount).

- **Đề xuất mới (To-Be)**:
  1. Tạo component dùng chung `WorkspaceRouteSkeleton` (`src/components/common/workspace-route-skeleton.tsx`) phục vụ đồng nhất cho Admin, Portal, và Gov (bảo toàn `testId` riêng từng phân hệ).
  2. Bổ sung `src/app/portal/loading.tsx`, `src/app/(portal)/loading.tsx`, và `src/app/gov/loading.tsx`; tích hợp `pendingHref` skeleton tức thì `<50ms` + `<React.Suspense>` vào `PortalLayout` và `GovLayout` (kèm fail-safe timeout `12000ms`).
  3. Bổ sung in-memory TTL cache (`30_000ms`) theo `accessToken` và in-flight deduplication cho `fetchMyEnterpriseProfile(options?: { forceRefresh?: boolean })`, kèm `invalidateMyEnterpriseProfileCache()` gọi tại các hàm ghi (`updateMyEnterpriseProfile`, `submitEnterpriseVerification`, `activateEnterpriseCapability`, `switchEnterpriseActiveRole`) và bỏ gọi lặp theo `[pathname]` trong `PortalLayout`.

---

### 2. Các Điểm Neo Nghiệp Vụ & Kỹ Thuật Bất Biến (Immutable Anchors)

#### [ADD] `REQ-UI-043`: Pending Route Transition Skeleton Dùng Chung Cho `/portal/*`, `(portal)` & `/gov/*`
1. Trích xuất `WorkspaceRouteSkeleton` tại `src/components/common/workspace-route-skeleton.tsx`; `AdminWorkspaceSkeleton` tái sử dụng component này (giữ nguyên `data-testid="admin-route-skeleton"`).
2. Tạo `src/app/portal/loading.tsx`, `src/app/(portal)/loading.tsx`, và `src/app/gov/loading.tsx`.
3. `PortalLayout` (`src/app/portal/layout.tsx`) và `GovLayout` (`src/app/gov/layout.tsx`) MUST hiển thị `WorkspaceRouteSkeleton` ngay trong vùng workspace chính và highlight ngay item đích khi click sang route/tab khác, tự xóa khi route mới mount hoặc quá fail-safe `12000ms`.

#### [ADD] `REQ-UI-044`: Client Cache & Request Deduplication Cho `fetchMyEnterpriseProfile()`
1. `fetchMyEnterpriseProfile(options?: { forceRefresh?: boolean })` tại `src/lib/enterprise-client.ts` MUST triển khai in-memory TTL cache (`30s`, cô lập theo `session.accessToken`) và in-flight Promise deduplication trên trình duyệt (`typeof window !== "undefined"`).
2. Cung cấp `invalidateMyEnterpriseProfileCache()` và tự động gọi tại `updateMyEnterpriseProfile`, `submitEnterpriseVerification`, `activateEnterpriseCapability`, `switchEnterpriseActiveRole`.
3. `PortalLayout` không gọi lại `fetchMyEnterpriseProfile()` mỗi lần `pathname` đổi mà đồng bộ qua cache và custom events (`nacentwin_role_switched`, `nacentwin_enterprise_profile_updated`).

#### [ADD] `BR-UI-031`: Bảo Toàn `RoleGuard`, `RoleSwitcher` & Không Rò Rỉ Cache Giữa Các Phiên Đăng Nhập
1. Bảo toàn tuyệt đối `RoleGuard` tại `PortalLayout`, `GovLayout`, `AdminLayout`.
2. Cache của `fetchMyEnterpriseProfile()` MUST gắn với `accessToken` hiện tại; đổi token/tài khoản khác tự động bỏ qua cache cũ. Khi API lỗi không lưu cache lỗi.
3. Không giữ mock hay dữ liệu giả; giữ nguyên 100% tương thích ngược với các unit test hiện hữu.

#### [ADD] `TEST-UI-031`: Unit Tests Cho Pending Skeleton (`/portal`, `/gov`) & Enterprise Profile Cache
1. `src/app/portal/layout.test.tsx`: Kiểm chứng click chuyển mục bật `portal-route-skeleton`, tắt khi route đổi, bỏ qua click lại cùng route / `ctrlKey`, và không re-fetch lặp `fetchMyEnterpriseProfile` khi đổi `pathname`.
2. `src/app/gov/layout.test.tsx`: Kiểm chứng click chuyển mục bật `gov-route-skeleton`, tắt khi route đổi, bỏ qua click lại cùng route / `ctrlKey`.
3. `src/lib/enterprise-client.test.ts`: Kiểm chứng cache hit trong TTL 30s, in-flight deduplication, cô lập theo `accessToken`, `forceRefresh: true`, `invalidateMyEnterpriseProfileCache()` khi cập nhật/chuyển vai trò, và không cache lỗi API.
