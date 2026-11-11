# Change Request: CR-2026-030 Đồng Bộ "Thẩm Định DN ĐMST" & "Hội Đồng Chấm Điểm TT17" Về Chung Nhóm 1 Và Thu Gọn Sidebar Cổng Quản Trị Nhà Nước (/gov) Thành 3 Nhóm

**CR-ID**: `CR-2026-030`  
**Epic**: `TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN`  
**Status**: `SHIPPED` (Verified — 2026-11-11)  
**Target Version**: `1.16.0`  
**Author**: PO (`nacen-po-pm`)  
**Date**: `2026-11-11`  
**Căn cứ pháp lý & Thiết kế cơ sở**:
- Quyết định điều hành `PO-DEC-20261111-02` tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 34.
- Tài liệu Thiết Kế Cơ Sở: `Specification/02_BASIC_DESIGN/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN/README.md` Mục 8.4.
- Hiến pháp Quản trị Đặc tả: `SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md`.

---

### 1. Bối Cảnh & Lý Do Thay Đổi (As-Is vs To-Be)

- **Hiện trạng cũ (As-Is)**:
  1. Trong `SourceCode/frontend/src/app/gov/layout.tsx` (`GOV_MENU_GROUPS`), thanh điều hướng Sidebar của tài khoản Quản trị Nhà nước (`/gov/*`) đang tách làm 4 nhóm Accordion:
     - Nhóm 1 (`1. Tổng Quan & Phê Duyệt`) chứa `Tổng quan địa bàn`, `Hàng đợi kiểm duyệt`, và `Thẩm định DN ĐMST` (`/gov/approvals/enterprises`).
     - Nhóm 2 (`2. Thẩm Định Công Nghệ TT17`) chỉ chứa duy nhất 1 mục `Hội đồng Chấm điểm TT17` (`/gov/assessments/tt17`).
  2. Việc tách hai nghiệp vụ thẩm định doanh nghiệp (`Thẩm định DN ĐMST` và `Hội đồng Chấm điểm TT17`) sang 2 nhóm menu riêng gây phân mảnh thao tác điều hướng.
  3. Breadcrumb cấp 2 của `/gov/assessments/tt17` đang ghi `"Đánh Giá Công Nghệ TT17"`, trong khi `/gov/approvals` và `/gov/approvals/enterprises` ghi `"Quản Lý Thẩm Định"`, chưa đồng bộ với tên nhóm `Tổng Quan & Phê Duyệt`.

- **Đề xuất mới (To-Be)**:
  1. Đưa `Hội đồng Chấm điểm TT17` (`/gov/assessments/tt17`) lên chung **Nhóm 1 (`1. Tổng Quan & Phê Duyệt`)** cùng `Thẩm định DN ĐMST` (`/gov/approvals/enterprises`).
  2. Thu gọn `GOV_MENU_GROUPS` từ 4 nhóm xuống còn **3 nhóm Accordion**:
     - `group1`: **`1. Tổng Quan & Phê Duyệt`** (4 mục: `/gov`, `/gov/approvals`, `/gov/approvals/enterprises`, `/gov/assessments/tt17`).
     - `group2`: **`2. Giám Sát Cung–Cầu & Địa Bàn`** (2 mục: `/gov/opportunities`, `/gov/demands`).
     - `group3`: **`3. Quản Trị Công Vụ & Nhân Sự`** (1 mục: `/gov/settings/staff`).
  3. Đồng bộ Breadcrumbs cấp 2 của `/gov/approvals`, `/gov/approvals/enterprises` và `/gov/assessments/tt17` thành `{ label: "Tổng Quan & Phê Duyệt", href: "/gov" }`.

---

### 2. Các Điểm Neo Nghiệp Vụ & Kỹ Thuật Bất Biến (Immutable Anchors)

#### [ADD] `REQ-GOV-NAV-01`: Thu Gọn Sidebar `/gov` Thành 3 Nhóm & Gom Thẩm Định ĐMST + TT17 Vào Nhóm 1
`GovSidebarNav` tại `SourceCode/frontend/src/app/gov/layout.tsx` MUST cấu trúc `GOV_MENU_GROUPS` gồm đúng **3 nhóm Accordion**:
1. `group1` (`1. Tổng Quan & Phê Duyệt`): `Tổng quan địa bàn` (`/gov`), `Hàng đợi kiểm duyệt` (`/gov/approvals`), `Thẩm định DN ĐMST` (`/gov/approvals/enterprises`), `Hội đồng Chấm điểm TT17` (`/gov/assessments/tt17`).
2. `group2` (`2. Giám Sát Cung–Cầu & Địa Bàn`): `Tiến trình Đàm phán & SLA` (`/gov/opportunities`), `Bài toán Nhu cầu DNNVV` (`/gov/demands`).
3. `group3` (`3. Quản Trị Công Vụ & Nhân Sự`): `Phân công Cán bộ & Chuyên viên` (`/gov/settings/staff`).

#### [ADD] `REQ-GOV-NAV-02`: Đồng Bộ Breadcrumbs Nhóm 1 Trên Các Màn Hình Thẩm Định
Các màn hình thuộc Nhóm 1 gồm `src/app/gov/assessments/tt17/page.tsx`, `src/app/gov/approvals/enterprises/page.tsx`, và `src/components/gov/gov-approval-queue.tsx` MUST dùng thống nhất breadcrumb cấp 2 `{ label: "Tổng Quan & Phê Duyệt", href: "/gov" }`.

#### [ADD] `BR-GOV-NAV-01`: Bảo Toàn 7 Tuyến URL, 3D Scoped RBAC & Accordion State
1. Không loại bỏ hay đổi URL bất kỳ tuyến nào trong 7 màn hình `/gov/*`.
2. Trạng thái mặc định `openGroups` mở toàn bộ 3 nhóm (`group1: true, group2: true, group3: true`), bảo toàn chức năng tìm kiếm nhanh và nút Thu gọn / Mở rộng tất cả.
3. Bảo toàn tuyệt đối `RoleGuard` (`PROVINCIAL_ADMIN`, `SECTOR_ADMIN`, `CLUSTER_ADMIN`, `PROVINCE_OFFICER`, `PROVINCE_LEADER`, `SUPER_ADMIN`, `ADMIN`).

---

### 3. Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)

- **`AC-CR-030.1`**: Sidebar `/gov` hiển thị đúng 3 nhóm Accordion (`1. Tổng Quan & Phê Duyệt`, `2. Giám Sát Cung–Cầu & Địa Bàn`, `3. Quản Trị Công Vụ & Nhân Sự`); không còn nhóm tách riêng `2. Thẩm Định Công Nghệ TT17`.
- **`AC-CR-030.2`**: Cả `Thẩm định DN ĐMST` (`/gov/approvals/enterprises`) và `Hội đồng Chấm điểm TT17` (`/gov/assessments/tt17`) nằm chung trong `1. Tổng Quan & Phê Duyệt`; thu gọn Nhóm 1 ẩn cả 2 mục này.
- **`AC-CR-030.3`**: Breadcrumbs cấp 2 trên `/gov/approvals`, `/gov/approvals/enterprises` và `/gov/assessments/tt17` hiển thị đồng nhất `Tổng Quan & Phê Duyệt`.
- **`AC-CR-030.4`**: `npx vitest run src/app/gov/layout.test.tsx` và các kiểm thử liên quan pass 100%, `npx tsc --noEmit` sạch 0 lỗi.
