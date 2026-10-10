# Implementation Tasks: TASK-07 Phân Quyền & Năng Lực Quản Trị Admin

**Feature**: `TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN`  
**Spec Reference**: [`spec.md`](./spec.md) | **Plan Reference**: [`plan.md`](./plan.md)  
**Status**: Converged (100% Hoàn Thành)  

---

## Phase 1: Thực Thể Dữ Liệu & Database Migrations (Backend)

- [x] T001 [BE] Tạo thực thể `ApprovalRequest` với trường `Version` (Optimistic Concurrency), `ScopeType`, `ScopeId`, `PayloadJson` trong `modules/identity/Domain/`.
- [x] T002 [BE] Tạo thực thể `OrganizationUnit` hỗ trợ cấu trúc Cây 3 cấp trong `modules/identity/Domain/`.
- [x] T003 [BE] Tạo thực thể `ApprovalAuditLog` và cấu hình lưu trữ bất biến (Append-only) trong `modules/identity/Domain/`.
- [x] T004 [BE] Khai báo EF Core Configurations trong `modules/identity/Infrastructure/Persistence/Configurations.cs` và thiết lập các chỉ mục `idx_approval_scope`, `idx_approval_sla`.
- [x] T005 [BE] Tạo file EF Core Migration `AddApprovalAndGovernanceTables` và sinh script SQL idempotent tương ứng.

---

## Phase 2: Domain Services & Nghiệp Vụ Kiểm Duyệt Phân Cấp (Backend)

- [x] T006 [BE] Cài đặt `ApprovalService` xử lý 5 luồng duyệt hạt nhân: Tài khoản, Shop Seller, Chuyên gia, Nhu cầu, và Cơ sở liên kết.
- [x] T007 [BE] Cài đặt cơ chế kiểm soát đồng thời Optimistic Locking: kiểm tra `expectedVersion` và ném exception `RecordAlreadyModifiedException` (HTTP 409) khi xảy ra xung đột.
- [x] T008 [BE] Cài đặt cơ chế kiểm tra phạm vi dữ liệu tự động (Row-Level Security) theo `ICurrentActor.ScopeType` và `ScopeId`.
- [x] T009 [BE] Cài đặt `OrganizationTreeService` quản trị cây 63 tỉnh/thành và khởi tạo tài khoản bàn giao cho Lãnh đạo Sở.
- [x] T010 [BE] Tích hợp ghi tự động `ApprovalAuditLog` khi có bất kỳ hành động phê duyệt, từ chối hoặc ủy quyền nào phát sinh.

---

## Phase 3: Web API Controllers & API Contracts (Backend)

- [x] T011 [BE] Tạo `ApprovalController` tại `apps/api/Controllers/` cung cấp endpoints:
  - `GET /api/v1/governance/approvals`: Lấy danh sách hồ sơ phân trang có lọc theo Scope của Actor.
  - `GET /api/v1/governance/approvals/{id}`: Lấy chi tiết hồ sơ thẩm định.
  - `PUT /api/v1/governance/approvals/{id}/review`: Thực hiện duyệt / từ chối hồ sơ kèm `expectedVersion`.
- [x] T012 [BE] Tạo `OrganizationUnitController` cung cấp endpoints:
  - `GET /api/v1/governance/org-tree`: Lấy toàn bộ cây đơn vị 63 tỉnh/thành.
  - `POST /api/v1/governance/org-units`: Khởi tạo đơn vị liên kết mới.
- [x] T013 [BE] Cấu hình chính sách Authorization trong `config/policies/authorization-rules.v1.json` bảo vệ các endpoints theo 10 Roles chuẩn.

---

## Phase 4: Giao Diện Dashboard Admin & 5 Trạng Thái UX (Frontend)

- [x] T014 [FE] Xây dựng màn hình Bảng điều khiển kiểm duyệt phân cấp `UI-ADMIN-APPROVAL-001` với bộ lọc Scope, Tabs loại hồ sơ và danh sách thẩm định.
- [x] T015 [FE] Tích hợp component `<Async>` hiển thị trọn vẹn 5 trạng thái UX (Empty, Loading Skeleton, Error Toast 409, Success, Partial).
- [x] T016 [FE] Xây dựng Modal từ chối phê duyệt yêu cầu nhập lý do chi tiết $\ge 10$ ký tự.
- [x] T017 [FE] Xây dựng giao diện hiển thị Cây tổ chức 3 cấp `UI-ORG-TREE-001` và form cấp tài khoản Sở Tỉnh.

---

## Phase 5: Kiểm Thử Toàn Diện & Quality Gate (Testing)

- [x] T018 [INT] Viết Unit Tests kiểm chứng quy tắc phân quyền Row-Level Security (`BR-ADM-001`): Chuyên viên Sở Hải Phòng không thể duyệt hồ sơ của Hà Nội.
- [x] T019 [INT] Viết Concurrency Integration Tests kiểm chứng Optimistic Locking (`BR-ADM-002`): Giả lập 2 cán bộ duyệt đồng thời 1 hồ sơ, xác nhận 1 người thành công và người thứ hai nhận mã lỗi HTTP 409.
- [x] T020 [INT] Viết Integration Tests kiểm chứng Audit Trail (`BR-ADM-003`): Xác nhận 100% lệnh duyệt đều sinh bản ghi trong `approval_audit_logs`.

---

## Phase 6: Quản Lý Vai Trò & Cây Thư Mục 34 Tỉnh Thành (Delta v3)

- [x] T021 [BE] Triển khai API lấy Ma trận 10 Roles và danh sách nhóm quyền `GET /api/v1/governance/roles/matrix` và `GET /api/v1/governance/roles`.
- [x] T022 [BE] Triển khai API gán vai trò và Scope cho tài khoản cán bộ `POST /api/v1/governance/roles/assign` kèm kiểm tra quyền `SUPER_ADMIN` (`BR-ADM-008`) và ghi Audit Trail.
- [x] T023 [BE] Cập nhật / Seed danh mục Cây thư mục 34 tỉnh thành trọng điểm KH&CN chia 3 miền (Bắc 12, Trung 10, Nam 12) kèm endpoint `GET /api/v1/governance/org-tree/34-provinces`.
- [x] T024 [FE] Xây dựng màn hình Quản lý Vai trò & Phân quyền tài khoản `src/app/admin/roles/page.tsx` (`UI-ADMIN-ROLES-001`) hiển thị Ma trận quyền hạn, danh sách cán bộ và Modal gán quyền.
- [x] T025 [FE] Nâng cấp màn hình Cây thư mục 34 tỉnh thành `src/app/admin/org-tree/page.tsx` (`UI-ORG-TREE-001`) với bộ lọc 3 miền, tìm kiếm tỉnh, drilldown cơ sở liên kết và bổ nhiệm Lãnh đạo Sở.
- [x] T026 [FE] Xây dựng thanh điều hướng Admin Hub chung (Navigation Bar) liên thông giữa: Thẩm định hồ sơ (`/admin/approvals`), Quản lý vai trò (`/admin/roles`), Cây 34 tỉnh thành (`/admin/org-tree`) và Danh mục ngành (`/admin/sectors`).

---

## Phase 7: Phân Cấp Phê Duyệt Chuyên Gia Cho Cấp 2 & Trung Ương Hậu Kiểm (Delta v4)

- [x] T027 [FE] [TASK-05 Wizard]: Thêm trường chọn "Cơ quan / Sở KH&CN tiếp nhận thẩm định" (34 tỉnh thành trọng điểm KH&CN + NacenTech TW) vào Wizard nâng cấp chuyên gia `src/app/profile/upgrade/expert/page.tsx` và gửi `scopeType`, `scopeId` trong payload submit.
- [x] T028 [BE] [TASK-05/07 Backend]: Mở rộng `SubmitExpertUpgradeRequest` với `ScopeType`/`ScopeId`, cập nhật `ExpertService.SubmitUpgradeAsync` đồng bộ tạo `ApprovalRequest` loại `EXPERT` vào hàng đợi duyệt phân cấp với SLA 48h.
- [x] T029 [FE] [Cổng Tác Nghiệp Cấp 2]: Xây dựng Hàng đợi kiểm duyệt phân cấp sống tại `src/app/gov/page.tsx` kết nối `/api/v1/approvals`, lọc theo `ScopeId` của Cán bộ Sở, tích hợp Review Modal, Maker-Checker, nút [Phê duyệt cấp tỉnh] và [Từ chối] $\ge 10$ ký tự.
- [x] T030 [BE/FE] [Trung Ương Hậu Kiểm]: Bổ sung action `REVOKE_EXPERT` (Thu hồi quyền chuyên gia) trong `ApprovalService.cs` và nút [Thu hồi quyền chuyên gia] trên giao diện `src/app/admin/approvals/page.tsx` cho Super Admin.
- [x] T031 [TEST] [Kiểm thử & Hội tụ]: Viết unit tests kiểm chứng phân cấp nộp/duyệt hồ sơ theo Tỉnh và chạy regression test suite 100% pass.



## Delta CR-2026-005 — Dynamic sector scopes
- [x] T032 [FE][RBAC] SECTOR scope assignment selects from active taxonomy; no free-text sector code hint/list.
- [x] T033 [FE] Resolve sector labels in role/review/GOV projections from current master data and remove fixed sector counts.
- [x] T034 [TEST] Verify active/inactive/unknown sector scope behavior and role assignment at API/DB/E2E boundaries.

- [x] T035 [DELTA-12] Đồng bộ quyết định EXPERT qua Kernel port với ExpertProfile, role và audit trong một commit; chặn scope/role không hợp lệ, kiểm chứng hồi quy.
