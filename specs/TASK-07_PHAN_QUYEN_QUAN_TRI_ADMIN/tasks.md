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

---

## Delta CR-2026-006 — Vận Hành Cây Hành Chính 3 Cấp Online & Full CRUD
- [x] T036 [BE] Thêm `UpdateOrganizationUnitCommand`, `UpdateUnitAsync` và `DeactivateUnitAsync` vào `Contracts.cs` & `OrganizationTreeService.cs`; cưỡng chế kiểm tra ràng buộc `BR-TREE-003` (chặn vô hiệu hóa khi còn cơ sở con đang ACTIVE).
- [x] T037 [BE] Tự động nạp dữ liệu gốc (Auto-Seed Baseline) trong `GetOrgTreeAsync` khi DB chưa có node, hỗ trợ hiển thị ngay cây 3 cấp và endpoint `PUT`, `DELETE` trong `OrganizationUnitController`.
- [x] T038 [FE] Xây dựng module API client và Refactor `src/app/admin/org-tree/page.tsx`: Loại bỏ 100% mock tĩnh `INITIAL_ORG_TREE`, kết nối trực tiếp API online `GET /api/v1/governance/org-units/tree`, chuẩn hóa 5 trạng thái UX qua `<Async>`.
- [x] T039 [FE] Tích hợp bộ công cụ CRUD trên giao diện: Modal Thêm đơn vị (POST), Modal Chỉnh sửa đơn vị (PUT), Modal Vô hiệu hóa đơn vị (DELETE) kèm xử lý lỗi vi phạm `BR-TREE-003` (409 Conflict) và toast phản hồi.
- [x] T040 [TEST] Bổ sung Unit Invariant Test cho `OrganizationUnit` & `BR-TREE-003`, kiểm tra biên dịch .NET & Next.js frontend, đảm bảo 100% kiểm thử hồi quy pass.

---

## Phase 10: Delta v6 (CR-2026-012) — Xây Dựng Bàn Quản Trị Người Dùng & 10 Roles (/admin/users) [GAP-02]

- [x] `T041` **[SPEC]** Ghi nhận Spec Delta v6 bổ sung REQ-ADM-015..016 và AC-DELTA-12..13 vào `specs/TASK-07_.../spec.md`.
- [x] `T042` **[FE]** Thay thế redirect trong `src/app/admin/users/page.tsx` bằng Data Table quản lý người dùng kết nối trực tiếp `GET /api/v1/admin/users`, thanh tìm kiếm, bộ lọc 10 Roles & trạng thái ACTIVE/LOCKED, phân trang, các nút thao tác Khóa/Mở tài khoản (`PATCH /api/v1/admin/users/{id}`) và Reset mật khẩu (`POST /api/v1/admin/users/{id}/reset-password`).
- [x] `T043` **[TEST]** Kiểm thử biên dịch Frontend và Backend, kiểm chứng trang `/admin/users` tải dữ liệu và hoạt động không lỗi.

---

## Phase 11: Delta v7 (CR-2026-020) — Trung Tâm Phê Duyệt Toàn Quốc & Phê Duyệt Vượt Cấp (Admin Override)

- [x] `T044` **[BE-DB]** Tạo EF Core Migration phi phá hủy `Add_Approval_Override_And_Sla_Fields` bổ sung các cột `is_override`, `override_reason`, `overridden_by_user_id`, `overridden_at_utc`, `is_sla_breached`, `sla_overdue_hours`, `is_national_priority` (toàn bộ nullable hoặc default an toàn); cấu hình Concurrency Token qua `xmin` / `RowVersion` và tạo chỉ mục `idx_approval_sla_breach` và `idx_approval_central_queue`.
- [x] `T045` **[BE-Domain]** Mở rộng Entity `ApprovalRequest` bảo vệ tính bất biến: phương thức `ExecuteAdminOverride(...)`, `MarkSlaBreached(...)`, phát sinh Domain Event `ApprovalOverriddenDomainEvent`, tuân thủ state machine chuyển trạng thái sang `APPROVED`.
- [x] `T046` **[BE-Logic]** Cập nhật `ApprovalService`: triển khai các phương thức `GetCentralApprovalQueueAsync` (truy vấn toàn quốc theo 63 tỉnh & SLA) và `OverrideApproveAsync` (kiểm tra quyền Tầng 0 `SUPER_ADMIN`/`OPERATOR_ADMIN`, validate giải trình $\ge 20$ ký tự, cam kết trách nhiệm, kiểm soát Optimistic Lock ném 409 Conflict và ghi Audit Log Cấp độ 3).
- [x] `T047` **[BE-Worker]** Phát triển Background Worker `ApprovalSlaMonitorWorker` chạy định kỳ mỗi 15 phút: tính toán 72 giờ làm việc (Working Hours: loại trừ T7/CN/ngày lễ theo quy định Bộ LĐTBXH), tự động đánh dấu cờ `is_sla_breached = true`, tính `sla_overdue_hours` và gửi notification cảnh báo.
- [x] `T048` **[BE-API]** Cung cấp 2 Endpoints API mới tại `ApprovalController`: `GET /api/v1/admin/approvals/central-queue` và `POST /api/v1/admin/approvals/{id}/override`, áp dụng chính sách phân quyền RBAC `RequireGlobalAdmin`, rate limiting và audit trail.
- [x] `T049` **[FE-Nav]** Nâng cấp Sidebar Layout Admin theo cấu trúc Accordion 4 nhóm 8 mục menu chuẩn wireframe SSOT (`wireframe_admin_tong_hanh_dinh.html`), đồng bộ định tuyến liên kết các phân hệ quản trị.
- [x] `T050` **[FE-Hub]** Xây dựng giao diện Trung tâm Phê duyệt Toàn quốc tại `/admin/approvals` với bộ lọc 63 Tỉnh/Thành, loại hồ sơ, tìm kiếm toàn văn và 3 tabs điều hướng (Hàng đợi toàn quốc, Cảnh báo SLA, Phê duyệt Vượt cấp).
- [x] `T051` **[FE-Modal]** Xây dựng Modal "Duyệt Thay / Can Thiệp Tối Cao" (Admin Override Modal) với trường giải trình bắt buộc validate realtime $\ge 20$ ký tự, checkbox cam kết trách nhiệm pháp lý và xử lý vô hiệu hóa nút submit an toàn.
- [x] `T052` **[FE-UX]** Chuẩn hóa trọn vẹn 5 trạng thái UX (Loading Skeleton, Empty State hình chiếc hộp rỗng có nút reset filter, Error Alert có nút retry, Success Table với badge nhấp nháy SLA_BREACHED, Partial Updating làm mờ 50% dòng đang thao tác) qua component chuẩn `<Async>`.
- [x] `T053` **[QC-Blackbox]** **[THIẾT QUÂN LUẬT QC]** Kiểm thử Blackbox 4 tầng (Unit, Contract, DB Postgres thật, Playwright) chạy trên PostgreSQL thật 100% Zero-Mock; kiểm chứng toàn trình luồng duyệt thay từ Sở đến Admin, cập nhật trạng thái `APPROVED` và đối soát dòng dữ liệu CSDL cùng Audit Log bất biến.
- [x] `T054` **[QC-Chaos]** **[THIẾT QUÂN LUẬT QC]** Kiểm thử phá hoại Stress & Chaos Concurrency (giả lập Cán bộ Sở và Super Admin cùng bấm duyệt 1 hồ sơ tại cùng 1 mili-giây $\rightarrow$ xác nhận chính xác 1 transaction thành công và transaction thứ 2 nhận `409 Conflict`), Boundary test giải trình 19 ký tự (FAIL 422) vs 20 ký tự (PASS), và giả lập tài khoản Sở gọi API Override (FAIL 403 `ERR_PRIVILEGE_ESCALATION`). Bắt buộc tìm và ghi nhận lỗi/ngoại lệ biên; báo cáo 0 bug mà không có chứng cứ phá hoại sẽ bị bác bỏ.
- [x] `T055` **[QC-VisualQA]** **[THIẾT QUÂN LUẬT QC]** Chạy Playwright E2E Visual QA chấm điểm giao diện Trung tâm phê duyệt trên 3 viewports (Desktop 1920x1080, Laptop 1366x768, Tablet 1024x768) đạt điểm thẩm mỹ $\ge 8.5/10$, đối soát 1:1 với HTML Wireframe Basic Design gốc, triệt tiêu hoàn toàn nút chết và AI-slop.

---

## Phase 12: Delta v8 (CR-2026-021) — Tinh Gọn Điều Hướng Breadcrumbs & Sửa Lỗi Routing Sidebar

- [x] `T056` **[FE-Breadcrumbs]** Tạo component `AdminBreadcrumbs` tái sử dụng tại `SourceCode/frontend/src/components/admin/admin-breadcrumbs.tsx`:
  - Khai báo interface `BreadcrumbItem { label: string; href?: string }` và `AdminBreadcrumbsProps { items: BreadcrumbItem[]; className?: string }`.
  - Hiển thị theo chuẩn tiếp cận WAI-ARIA breadcrumb (`<nav aria-label="Breadcrumb">`, `<ol>`, `<li>`).
  - Node gốc hiển thị icon `Home` liên kết về `/`, phân cách giữa các cấp bằng icon `ChevronRight`.
  - Node cuối cùng hiển thị `aria-current="page"`, chữ in đậm không có link click.
  - Tiêu chí kiểm chứng: Component render đúng cấu trúc DOM, TypeScript compile 0 warning, styling tương thích Tailwind.

- [x] `T057` **[FE-CleanNav]** Gỡ bỏ `<AdminNav />` và tích hợp `AdminBreadcrumbs` trên 6 trang con Cổng Quản Trị:
  - Thay thế `<AdminNav />` tại `src/app/admin/approvals/page.tsx` bằng `AdminBreadcrumbs` (`Trang chủ` $\rightarrow$ `Quản Trị Hệ Thống` $\rightarrow$ `Hàng Đợi Phê Duyệt Toàn Quốc`).
  - Thay thế `<AdminNav />` tại `src/app/admin/roles/page.tsx` bằng `AdminBreadcrumbs` (`Trang chủ` $\rightarrow$ `Quản Trị Hệ Thống` $\rightarrow$ `Quản Lý 10 Vai Trò`).
  - Thay thế `<AdminNav />` tại `src/app/admin/org-tree/page.tsx` bằng `AdminBreadcrumbs` (`Trang chủ` $\rightarrow$ `Quản Trị Hệ Thống` $\rightarrow$ `Cây Thư Mục 34 Tỉnh/Thành`).
  - Thay thế `<AdminNav />` tại `src/app/admin/sectors/page.tsx` bằng `AdminBreadcrumbs` (`Trang chủ` $\rightarrow$ `Quản Trị Hệ Thống` $\rightarrow$ `Danh Mục Lĩnh Vực & TT17`).
  - Thay thế `<AdminNav />` tại `src/app/admin/audit-logs/page.tsx` bằng `AdminBreadcrumbs` (`Trang chủ` $\rightarrow$ `Quản Trị Hệ Thống` $\rightarrow$ `Nhật Ký Kiểm Toán Cấp Độ 3`).
  - Thay thế `<AdminNav />` tại `src/app/admin/system-config/page.tsx` bằng `AdminBreadcrumbs` (`Trang chủ` $\rightarrow$ `Quản Trị Hệ Thống` $\rightarrow$ `Cấu Hình Hệ Thống & Tham Số SLA`).
  - Xóa bỏ hoàn toàn liên kết dev `/dashboard` ("Agent Orchestrator & CR") khỏi giao diện người dùng.
  - Tiêu chí kiểm chứng: Truy cập 6 trang không còn thanh ngang `<AdminNav />`, diện tích hiển thị tăng 15%, breadcrumbs hiển thị chính xác.

- [x] `T058` **[FE-Provinces]** Chuẩn hóa danh mục 34 Tỉnh/Thành phố trọng điểm ĐMST `PROVINCES_34` dùng chung:
  - Tạo tệp `SourceCode/frontend/src/lib/constants/provinces.ts` khai báo interface `ProvinceItem` và mảng `PROVINCES_34`.
  - Chứa chuẩn xác 34 tỉnh/thành theo `BR-ADMIN-34PROV` (Bắc 12, Trung & Tây Nguyên 10, Nam 12) + tùy chọn `ALL`.
  - Import và thay thế toàn bộ hardcode `PROVINCES_63` trong `src/app/admin/approvals/page.tsx` và `src/app/admin/org-tree/page.tsx`.
  - Dropdown Địa phương chuẩn hóa nhãn: `"Địa phương (34 Tỉnh/Thành phố trọng điểm ĐMST)"` với tùy chọn mặc định `"Toàn quốc (34 Tỉnh/Thành phố trọng điểm ĐMST)"`.
  - Tiêu chí kiểm chứng: Dropdown hiển thị đúng 34 tỉnh, chọn tỉnh lọc dữ liệu API chính xác, không còn tàn dư danh sách 63 tỉnh chung chung.

- [x] `T059` **[FE-ReactiveURL]** Tích hợp `useSearchParams()` và `<Suspense>` cho `approvals/page.tsx` đồng bộ click 2 chiều:
  - Loại bỏ `getInitialNavTab()`, `window.history.pushState` và event listener `popstate` thủ công.
  - Sử dụng `useSearchParams()` và `useRouter()` từ `next/navigation`: `tabParam = searchParams.get("tab")`, suy diễn state `navTab`.
  - Hàm `handleSwitchNavTab` cập nhật URL qua `router.push('/admin/approvals?...', { scroll: false })` giữ nguyên các params khác và reset `page=1`.
  - Tách `AdminApprovalsContent` và bọc trong `<Suspense fallback={<AdminApprovalsSkeleton />}>` tại root export để bảo vệ SSR / tránh deopt client.
  - Tiêu chí kiểm chứng: Nhấp vào menu Sidebar (`?tab=sla`, `?tab=override`), state tab chuyển đổi tức thời 0ms mà không reload trang. Nhấp tab trên UI cập nhật URL ngay lập tức.

- [x] `T060` **[FE-TextSync]** Đính chính tiêu đề, nhãn mác, triệt tiêu thuật ngữ lệch chuẩn:
  - Đổi tiêu đề Banner `approvals/page.tsx` thành badge: `CR-2026-021 DELTA V5: TRUNG TÂM PHÊ DUYỆT TOÀN QUỐC & GIÁM SÁT 34 TỈNH/THÀNH PHỐ TRỌNG ĐIỂM ĐMST`.
  - Xóa bỏ chữ "Online CRUD" tại `org-tree/page.tsx`, thay bằng "Quản Trị Cây Thư Mục & Phân Cấp Hành Chính 34 Tỉnh/Thành".
  - Xóa bỏ triệt để từ khóa "Tổng hành dinh" trên giao diện Admin $\rightarrow$ thống nhất gọi là "Trung Tâm Quản Trị Hệ Thống".
  - Đổi placeholder/empty text: *"Không có hồ sơ nào trong hàng đợi của 34 Tỉnh/Thành phố trọng điểm ĐMST theo tiêu chí đã chọn."*
  - Tiêu chí kiểm chứng: Rà soát toàn bộ UI không còn từ ngữ cũ, text chuẩn hóa 100% theo SSOT.

- [x] `T061` **[QC-Routing]** **[THIẾT QUÂN LUẬT QC]** Viết test / kiểm thử chuyển tab và reactive search params:
  - Viết kịch bản kiểm thử điều hướng (Navigation & URL State Test): giả lập click từ Sidebar vào `/admin/approvals?tab=sla`, xác minh tab SLA kích hoạt ngay và danh sách hồ sơ lọc đúng `isSlaBreached = true`.
  - Kiểm chứng click `/admin/approvals?tab=override`: tab Phê duyệt vượt cấp kích hoạt ngay, nút [Duyệt Can Thiệp] sẵn sàng.
  - Kiểm chứng chuyển tab trên UI: URL query params thay đổi đúng `?tab=...` và không reload trang (Zero Page Reload).
  - Kiểm thử tải trang trực tiếp bằng URL copy (Deep Linking Hydration): truy cập `/admin/approvals?tab=sla&provinceCode=HN` hiển thị chính xác tab SLA và tỉnh Hà Nội.
  - Tiêu chí kiểm chứng: 100% test routing & URL state pass.

- [x] `T062` **[QC-VisualQA]** **[THIẾT QUÂN LUẬT QC]** Kiểm định Visual QA 1:1 theo Wireframe mới, thang điểm $\ge 8.5/10$:
  - Chạy Playwright E2E Visual QA chụp ảnh màn hình trên 3 viewports: Desktop 1920x1080, Laptop 1366x768, Tablet 1024x768.
  - Đối soát 1:1 với wireframe: Breadcrumbs hiển thị đúng phân cấp, không còn thanh ngang `<AdminNav />`, không còn nút chết/liên kết gãy (`/dashboard`).
  - Chấm điểm theo 4 trục (Design Consistency 0.3, 5 UX States 0.3, Responsive 0.2, Interactive Polish 0.2) đạt $\ge 8.5/10$.
  - Tiêu chí kiểm chứng: Không phát hiện lỗi layout shift (CLS = 0) và xác nhận 100% controls phản hồi mượt mà.

---

## Phase 13: Delta v9 (CR-2026-022) — Chuẩn Hóa Cổng Công Vụ Cấp Sở KH&CN (`/gov`) Với Sidebar Accordion 4 Nhóm & 3D Scoped RBAC

- [x] `T063` **[SPEC]** Ghi nhận Spec Delta v9 bổ sung `BR-GOV-SIDEBAR-01..05` và `AC-DELTA-V5-01..05` vào `specs/TASK-07_.../spec.md` và Mục 12 trong `Specification/BASIC_DESIGN_NACENTECH.md`.
- [x] `T064` **[FE-Nav]** Xây dựng component `GovSidebarNav` tại `SourceCode/frontend/src/app/gov/layout.tsx` với cấu trúc Accordion 4 nhóm (Kiểm duyệt hồ sơ địa bàn, Thẩm định công nghệ TT17, Giám sát cung-cầu & SLA, Quản trị công vụ & nhân sự Sở) tích hợp thông tin Scoped Token địa phương (`user.scopeId` $\rightarrow$ Tên Sở KH&CN, SLA $\le 48\text{h}$, Maker-Checker 2 cấp).
- [x] `T065` **[FE-Routes]** Nối thông suốt toàn bộ 9 tuyến URL trên Sidebar: tab filter `/gov?tab=...`, `/gov/assessments/tt17`, `/gov/opportunities`, `/gov/demands` (nối tính năng giám sát nhu cầu địa bàn bị sót trước đây), `/gov/approvals/enterprises` và `/gov/settings/staff`.
- [x] `T066` **[FE-UX]** Cập nhật Header & Breadcrumb trên `src/app/gov/page.tsx`: sửa badge Maker-Checker chuẩn hóa ("Quy trình Kiểm duyệt 2 cấp • Phê duyệt Cấp 2: Lãnh đạo Sở KH&CN"), hiển thị đúng địa bàn thẩm quyền và bảo đảm responsive mobile/tablet drawer.
- [x] `T067` **[QC-E2E]** **[THIẾT QUÂN LUẬT QC]** Kiểm thử Playwright E2E chạy trên PostgreSQL thật Zero-Mock (`test_task07_delta_v8_gov_sidebar_e2e.py`): đăng nhập tài khoản Cán bộ Sở Hà Nội (`hanoi.admin@demo.nacentech.vn`), kiểm chứng Sidebar Menu hiển thị đầy đủ 4 nhóm 9 items, click chuyển các tab và trang `/gov/*` thông suốt, đối soát dữ liệu hiển thị đúng phạm vi Hà Nội và bị cô lập hoàn toàn với Hải Phòng.

---

## Phase 14: Delta v6 Wave 1 (CR-2026-022) — Hồi Sinh Audit Logs, Cấu Hình System Config & Dashboard 360°

- [x] `T068` **[FE-LabelResolver]** Xây dựng module Universal Label Resolver Engine (`src/lib/label-resolver.ts`):
  - Viết hàm `resolveProvinceName(code)` ánh xạ chuẩn 34 tỉnh/thành.
  - Viết hàm `resolveSectorName(code)` ánh xạ mã ngành sang tên tiếng Việt.
  - Viết hàm `resolveRequestTypeLabel(type)` ánh xạ `EXPERT`, `SHOP`, `DEMAND`, `ACCOUNT` sang tên tiếng Việt.
  - Viết hàm `resolveRoleName(role)` ánh xạ 10 vai trò.
  - Viết hàm `resolveActionBadge(action)` trả về label tiếng Việt và màu sắc badge.
  - Tiêu chí kiểm chứng: Unit test resolver pass 100%, không còn trả về mã thô nếu có tên hợp lệ.

- [x] `T069` **[FE-AuditLogs]** Xây dựng Bảng Nhật Ký Kiểm Toán Tương Tác Sống (`src/app/admin/audit-logs/page.tsx`):
  - Xóa bỏ khối placeholder tĩnh 43 dòng.
  - Triển khai Data Table hiển thị các cột: Thời gian, Tác nhân (Tên + Role), Địa bàn (Tên tỉnh), Hành vi (Badge), Hồ sơ/Chủ thể, Lý do, IP.
  - Tích hợp bộ lọc từ khóa, lọc hành vi (`Tất cả`, `Phê duyệt`, `Từ chối`, `Vượt cấp`), lọc thời gian.
  - Tích hợp phân trang 10 dòng/trang, đầy đủ 5 UX States qua `<Async>`.
  - Tích hợp nút `[Xuất file CSV / Excel]` với UTF-8 BOM chuẩn tiếng Việt.
  - Tiêu chí kiểm chứng: Giao diện sống động, tìm kiếm/lọc mượt mà, xuất CSV tải về được file thật.

- [x] `T070` **[FE-SystemConfig]** Xây dựng Form Cấu Hình Tham Số & SLA Tương Tác (`src/app/admin/system-config/page.tsx`):
  - Xóa bỏ card text hardcode tĩnh 77 dòng.
  - Triển khai Form tương tác: Dropdown chọn ngưỡng SLA (48h/72h/96h), Input giờ hành chính (08:00 - 17:00), Dropdown chu kỳ quét SLA, Switch toggle cảnh báo Email/SMS.
  - Khối chính sách Admin Override hiển thị rõ ràng quy định $\ge 20$ ký tự và Optimistic Locking.
  - Nút `[Lưu Cấu Hình Tham Số]` có feedback Toast, error handling và persistence.
  - Tiêu chí kiểm chứng: Cho phép sửa tham số, bấm lưu cập nhật thành công, tải lại trang giữ nguyên cấu hình.

- [x] `T071` **[FE-DashboardSync]** Sửa nút chết và đồng bộ thuật ngữ tại Dashboard (`src/app/admin/page.tsx`):
  - Thay thẻ `<span>Chi tiết chính sách</span>` thành `<Link href="/admin/roles">` có icon `ArrowUpRight`.
  - Sửa nhãn khối 10 Roles thành `TẦNG 0: Quản Trị Tối Cao (SUPER_ADMIN, OPERATOR_ADMIN)` đồng nhất 100% với Sidebar và Ma trận phân quyền.
  - Tiêu chí kiểm chứng: Click 'Chi tiết chính sách' điều hướng mượt về `/admin/roles`, không còn mâu thuẫn thuật ngữ Tầng 0 vs Tầng 1.

- [x] `T072` **[QC-Wave1]** **[THIẾT QUÂN LUẬT QC]** Viết trọn bộ kiểm thử tự động cho Wave 1:
  - Tạo `src/app/admin/audit-logs/page.test.tsx` kiểm thử filter, pagination, export CSV, 5 UX states.
  - Tạo `src/app/admin/system-config/page.test.tsx` kiểm thử form validation, submit lưu cấu hình, optimistic concurrency.
  - Bổ sung test kiểm tra liên kết 'Chi tiết chính sách' và thuật ngữ Tầng 0 trên Dashboard.
  - Tiêu chí kiểm chứng: 100% test pass, kiểm thử các ca biên (empty search, validation, network error).

---

## Phase 15: Delta v6 Wave 2 (CR-2026-022) — Giải Bài Toán "Hiển Thị Tên Thay Vì Mã" & Tối Ưu Bảng Phê Duyệt (`/admin/approvals`)

- [x] `T073` **[FE-LabelApprovals]** Áp dụng Universal Label Resolver vào toàn bộ Hàng đợi Phê duyệt (`src/app/admin/approvals/page.tsx`):
  - Phân giải mã Tỉnh sang Tên Tỉnh tiếng Việt chính thức (`resolveProvinceName(item.province)`).
  - Phân giải mã Loại Hồ Sơ sang Tên tiếng Việt thân thiện (`resolveRequestTypeLabel(item.type)`).
  - Phân giải mã Ngành sang Tên 18 Lĩnh vực TT17 (`resolveSectorName(item.sector, sectorNames)`).
  - Phân giải vai trò thẩm quyền duyệt sang Tên tiếng Việt (`resolveRoleName`).
  - Tiêu chí kiểm chứng: Không còn hiển thị mã thô `HN`, `SG`, `01`, `EXPERT` trên danh sách và panel chi tiết.

- [x] `T074` **[FE-ViewportScroll]** Tối ưu bố cục Master-Detail với 2 cột cuộn độc lập (`src/app/admin/approvals/page.tsx`):
  - Thiết lập container chính cố định chiều cao viewport `lg:h-[calc(100vh-12rem)] lg:min-h-[620px]`.
  - Cột trái (Danh sách hồ sơ) có `overflow-y-auto pr-1.5 scrollbar-thin`.
  - Cột phải (Chi tiết hồ sơ đang chọn) có `overflow-y-auto pl-1.5 scrollbar-thin`.
  - Tiêu chí kiểm chứng: Đọc tài liệu dài không gây cuộn cả trang web, danh sách bên trái giữ nguyên vị trí khi chuyển trạng thái.

- [x] `T075` **[FE-ValidationWhitespace]** Chuẩn hóa validation chống khoảng trắng thừa:
  - Áp dụng `.trim().length >= 10` cho lý do Từ chối và Yêu cầu bổ sung.
  - Áp dụng `.trim().length >= 20` cho lý do Can thiệp Vượt cấp Tầng 0.
  - Tiêu chí kiểm chứng: Nhập chuỗi chỉ có dấu cách (spaces) bị chặn ngay tại client với thông báo lỗi rõ ràng.

- [x] `T076` **[QC-Wave2]** **[THIẾT QUÂN LUẬT QC]** Cập nhật bộ test `src/app/admin/approvals/page.test.tsx`:
  - Thêm test case xác thực hiển thị Tên Tỉnh tiếng Việt, Tên Ngành tiếng Việt, Tên Loại Hồ Sơ.
  - Thêm test case chặn chuỗi toàn khoảng trắng khi từ chối hồ sơ.
  - Tiêu chí kiểm chứng: 100% test case trong `approvals/page.test.tsx` pass.

---

## Phase 16: Delta v6 Wave 3 (CR-2026-022) — Nâng Cấp Trải Nghiệm Quản Trị Hệ Thống (`/admin/roles`, `/admin/org-tree`, `/admin/sectors`)

- [x] `T077` **[FE-Roles]** Nâng cấp `/admin/roles`:
  - Bổ sung phân trang (Pagination 5 roles/trang hoặc 10 roles) cho cả tab Ma trận vai trò và tab Danh sách cán bộ.
  - Tích hợp tooltip mô tả chi tiết phạm vi quyền hạn của từng vai trò 3D Scoped RBAC.
  - Hiển thị số lượng người dùng đang gán (Assigned Users Count) tương ứng cho từng vai trò trong ma trận 10 roles.
  - Sử dụng `@/lib/label-resolver` để hiển thị nhãn tiếng Việt rõ nghĩa, không lộ mã trần.
  - Tiêu chí kiểm chứng: Có bộ điều khiển phân trang, tooltip hiển thị mô tả quyền hạn, đếm đúng số cán bộ gán cho từng role.

- [x] `T078` **[FE-OrgTree]** Nâng cấp `/admin/org-tree`:
  - Bổ sung thanh tìm kiếm nhanh đơn vị hành chính theo tên, mã, hoặc địa bàn tỉnh/thành.
  - Bổ sung nút Thu gọn / Mở rộng tất cả (Expand / Collapse All) cho cây cơ cấu tổ chức 3 cấp.
  - Hiển thị badge số lượng đơn vị trực thuộc (child units count) ở mỗi cấp đơn vị.
  - Sử dụng `@/lib/label-resolver` để phân giải mã tỉnh/thành (`resolveProvinceName`) chuẩn tiếng Việt.
  - Tiêu chí kiểm chứng: Thao tác mở rộng/thu gọn hoạt động mượt mà, tìm kiếm nhanh tức thì, đếm đúng số đơn vị trực thuộc.

- [x] `T079` **[FE-Sectors]** Nâng cấp `/admin/sectors`:
  - Bổ sung Dialog xác nhận an toàn (Safe Confirmation Dialog) khi chuyển trạng thái (Kích hoạt / Vô hiệu hóa) mã ngành TT17.
  - Hiển thị rõ số lượng hồ sơ / quy tắc đang liên kết (`filterRuleCount`) trong dialog cảnh báo tác động trước khi xác nhận.
  - Hỗ trợ cả kích hoạt lại (Reactivate) khi ngành đang ở trạng thái ngừng hoạt động.
  - Tích hợp thông báo Toast và cập nhật UI tức thời, đồng bộ với API.
  - Tiêu chí kiểm chứng: Dialog hiển thị chi tiết mã, tên ngành và số hồ sơ liên kết; thao tác hủy bỏ không đổi trạng thái; xác nhận gọi API thành công.

- [x] `T080` **[QC-Wave3]** **[THIẾT QUÂN LUẬT QC]** Viết và cập nhật trọn bộ Unit Test cho các màn hình `/admin/roles`, `/admin/org-tree`, `/admin/sectors`:
  - Test case xác thực phân trang, tooltip và số lượng gán của `/admin/roles`.
  - Test case xác thực tìm kiếm nhanh, nút Expand/Collapse All và badge đơn vị trực thuộc của `/admin/org-tree`.
  - Test case xác thực Dialog xác nhận an toàn khi chuyển trạng thái của `/admin/sectors`.
  - Tiêu chí kiểm chứng: Chạy `npx vitest run src/app/admin/` đạt 100% Green (10 test files, 68/68 passed).

---

## Phase 17: Delta v11 — Chuẩn Hóa Toàn Diện 7 Màn Hình Cổng Công Vụ Cấp Sở (`/gov/*`) [Delta v11]

### Đợt 1: Hạ Tầng Shared & Bộ Giải Nghĩa Nhãn (Universal Label Resolvers)
- [x] `T080` **[FE-LabelResolver]** Xây dựng module `src/lib/gov-label-resolver.ts`:
  - Giải nghĩa 100% mã ngành sang tên tiếng Việt (18 ngành TT17 & 23 phân ngành chế biến chế tạo).
  - Giải nghĩa mã tỉnh sang tên đầy đủ theo 34 tỉnh ĐMST (`PROVINCES_34`).
  - Giải nghĩa mức độ TRL (`TRL 1-9`), tình trạng SHTT, phân loại TT17 và tính cấp bách TNI.
  - Tiêu chí kiểm chứng: Viết unit test `src/lib/gov-label-resolver.test.ts` đạt 100% Pass.

- [x] `T081` **[FE-GovPageHeader]** Xây dựng component `src/components/gov/gov-page-header.tsx`:
  - Tích hợp Breadcrumbs 3 cấp chuẩn WAI-ARIA, Icon, Tiêu đề, Badge địa bàn, SLA $\le 48\text{h}$ và Maker-Checker 2 Cấp.
  - Hỗ trợ slot `actions` cho nút tìm kiếm, bộ lọc hoặc xuất báo cáo.
  - Tiêu chí kiểm chứng: Viết unit test `src/components/gov/gov-page-header.test.tsx` đạt 100% Pass.

### Đợt 2: Nâng Cấp Nhóm Thẩm Định & Cấp Phép (Màn hình 1, 2, 3)
- [x] `T082` **[FE-Gov-Screen1]** Cải tạo Màn hình 1 `/gov` (Hàng đợi kiểm duyệt 5 tab):
  - Tích hợp `GovPageHeader` và `GovLabelResolver`.
  - Hiển thị đầy đủ tên ngành tiếng Việt, tên tỉnh, mức độ TRL tiếng Việt, tình trạng SHTT tiếng Việt.
  - Bắt buộc kiểm tra độ dài lý do Từ chối/Yêu cầu bổ sung `.trim().length >= 10`.
  - Tiêu chí kiểm chứng: Không còn mã thô, test unit trong `src/app/gov/page.test.tsx` pass.

- [x] `T083` **[FE-Gov-Screen2]** Cải tạo Màn hình 2 `/gov/approvals/enterprises` (Thẩm định DN ĐMST):
  - Gỡ bỏ bọc thẻ `<main min-h-screen py-10 px-4 md:px-8>` gây padding kép; tích hợp `GovPageHeader`.
  - Hiển thị các tiêu chí xác thực ĐMST (Mã số thuế, vốn điều lệ, sáng chế, DN KH&CN).
  - Ràng buộc lý do từ chối $\ge 10$ ký tự thực sau `.trim()`.
  - Tiêu chí kiểm chứng: Giao diện căn chỉnh hoàn hảo với Sidebar, test unit pass.

- [x] `T084` **[FE-Gov-Screen3]** Cải tạo Màn hình 3 `/gov/assessments/tt17` (Hội đồng Chấm điểm TT17):
  - **Xóa bỏ triệt để hardcode `scopeId = "HP"`**, đọc trực tiếp từ `user.scopeId`.
  - Nạp danh mục 23 ngành chế biến chế tạo hiển thị tên ngành đầy đủ (thay vì chỉ mã C.10).
  - Bổ sung bộ lọc phân loại công nghệ (Tiên tiến, Trung bình...) và tối ưu Drawer 26 tiêu chí.
  - Tiêu chí kiểm chứng: Không còn hardcode scope, dữ liệu cô lập đúng địa bàn user.

### Đợt 3: Nâng Cấp Nhóm Giám Sát, Nhân Sự & Kiểm Thử Toàn Trình (Màn hình 4, 5, 6, 7)
- [x] `T085` **[FE-Gov-Screen4]** Cải tạo Màn hình 4 `/gov/opportunities` (Giám sát Tiến trình Cung - Cầu & SLA 48h):
  - Tích hợp `GovPageHeader`, giữ cán bộ trong không gian công vụ.
  - Bổ sung bảng lọc cơ hội ách tắc quá hạn SLA 48h.
  - Tiêu chí kiểm chứng: Không nhảy sang không gian Portal Doanh nghiệp, hiển thị đúng dữ liệu giám sát địa bàn.

- [x] `T086` **[FE-Gov-Screen5]** Cải tạo Màn hình 5 `/gov/demands` (Giám sát Bài toán Nhu cầu DNNVV):
  - **Triệt tiêu mock ngầm**: Xóa bỏ UUID chuyên gia tĩnh `01a125a3-...`.
  - Xây dựng Modal chọn chuyên gia từ CSDL danh bạ chuyên gia thật của địa bàn.
  - Bổ sung bộ lọc theo chỉ số TNI (Cấp bách / Chiến lược) và debounce nút bấm.
  - Tiêu chí kiểm chứng: Không còn UUID giả định, chọn chuyên gia thật và gửi API thành công.

- [x] `T087` **[FE-Gov-Screen6]** Cải tạo Màn hình 6 `/gov/settings/staff` (Phân công Cán bộ Sở):
  - Bổ sung vai trò `PROVINCE_OFFICER` (Chuyên viên Thẩm tra - Maker) bên cạnh `PROVINCIAL_ADMIN` (Checker).
  - Validate email công vụ trước khi gửi lên API.
  - Tiêu chí kiểm chứng: Bổ nhiệm được chuyên viên thẩm tra Cấp 1; hoàn thiện chu trình Maker-Checker.

- [x] `T088` **[FE-Gov-Screen7]** Cải tạo Màn hình 7 `/gov/approvals` (Hub Điều hướng Phê duyệt):
  - Đồng bộ chuyển hướng và trạng thái với `/gov`.
  - Tiêu chí kiểm chứng: Truy cập `/gov/approvals` hiển thị giao diện kiểm duyệt mượt mà.

- [x] `T089` **[QC-FullRegression]** **[THIẾT QUÂN LUẬT QC]** Kiểm thử toàn trình 4 tầng cho phân hệ Cổng Công Vụ:
  - Unit tests cho cả 7 màn hình đạt 100% Green.
  - Đối soát ranh giới dữ liệu không bị rò rỉ giữa các tỉnh (Scoped RBAC).
  - Chạy `npm run build` xác nhận toàn bộ 66 routes thành công.

---

## Phase 18: Delta v11b — Tối Ưu Bảng Thẩm Định Địa Bàn (PO-DEC-20261026-GOV-TABLE-UX)

- [x] `T090` **[FE-Gov-CodeFormat]** Chuẩn hóa Mã Hồ Sơ Công Vụ:
  - Bổ sung hàm `formatGovRecordCode` trong `src/lib/gov-label-resolver.ts` sinh mã định danh công vụ chuẩn: `CB-HN-C25347`, `CG-HN-A109F2`, `NC-HN-88E29E`, `DN-HN-825CDC`.
  - Tích hợp nút Copy mã kèm tooltip hiển thị UUID gốc để đối soát kỹ thuật.
  - Viết unit test xác thực tại `src/lib/gov-label-resolver.test.ts`.

- [x] `T091` **[FE-Gov-ProductDetail]** Cơ Chế Xem Chi Tiết Trước Khi Phê Duyệt:
  - Biến cột "Tên Sản Phẩm / Công Nghệ" thành liên kết/nút bấm mở modal chi tiết sản phẩm.
  - Thêm nút liên kết mở trang chi tiết sản phẩm trên sàn giao dịch quốc gia (`/chao-ban-cong-nghe/[id]`) trong tab mới.
  - Đổi nút thao tác tại bảng thành "Xem Chi Tiết & Duyệt" kèm icon `Eye`.

- [x] `T092` **[FE-Gov-HeaderSortFilter]** Sắp Xếp & Lọc Trực Tiếp Trên Header Bảng:
  - Click vào Header cột: Mã hồ sơ, Đơn vị nộp, Tên sản phẩm, Ngày nộp để chuyển đổi sort Tăng/Giảm dần.
  - Dropdown Filter popover trực tiếp trên Header cột "Lĩnh Vực Công Nghệ" và cột "Trạng Thái".
  - Thanh thông báo trạng thái lọc (Active Filter Chips) với nút "Xóa bộ lọc (Reset)".

- [x] `T093` **[QC-Verification]** Kiểm thử Hồi quy & Nghiệm thu:
  - Cập nhật unit test `src/app/gov/page.test.tsx` bao phủ mã hồ sơ chuẩn hóa, click xem chi tiết, và sort/filter headers.
  - Đảm bảo 100% test suites pass (8/8 files, 34/34 tests GREEN).

---

## Phase 19: Delta v12 (CR-2026-023) — Tái Thiết Kế Toàn Diện Màn Hình Phê Duyệt Tập Trung & Giám Sát SLA (`/admin/approvals`)

### Wave 1: Chuẩn Hóa Nhãn & Format Mã Hồ Sơ Rút Gọn
- [x] `T094` **[FE-LabelResolver-V7]** Cập nhật `src/lib/label-resolver.ts`:
  - Đổi nhãn sang chuẩn hành chính công: `SHOP` -> "Chào Bán Công Nghệ", `DEMAND` -> "Nhu Cầu Công Nghệ", `EXPERT` -> "Chuyên Gia KH&CN", `FACILITY`/`ENTERPRISE` -> "Doanh Nghiệp ĐMST", `ACCOUNT` -> "Tài Khoản Tổ Chức".
  - Bổ sung hàm `formatApprovalRecordCode(id, type, scope)` trả về mã rút gọn thân thiện `#058915` (hoặc `#HS-058915`).
  - Viết unit test xác thực tại `src/lib/label-resolver.test.ts` (6/6 tests pass).

### Wave 2: Tái Cấu Trúc UI Layout & Enterprise Approval Slide-over Drawer
- [x] `T095` **[FE-UnifiedToolbar]** Tái cấu trúc thanh điều khiển tại `src/app/admin/approvals/page.tsx`:
  - Gộp thành 1 thanh Segmented Filter duy nhất (Nhóm tính chất: Tất cả, SLA, Can thiệp + Nhóm phân loại: Chào bán CN, Nhu cầu CN, Chuyên gia, Doanh nghiệp ĐMST, Tài khoản).
  - Thanh tìm kiếm đa năng kết hợp dropdown 34 Tỉnh/Thành phố. Xóa bỏ hoàn toàn combobox trùng lặp.
- [x] `T096` **[FE-FullwidthTable]** Chuyển đổi bảng sang Full-width Master Grid:
  - Mã hồ sơ rút gọn kèm nút copy UUID gốc.
  - Capsule Badge ngang 1 dòng (`whitespace-nowrap`).
  - Tên chủ thể và đơn vị rõ ràng có fallback thông minh, không bị méo chữ.
  - Cột thời gian và số giờ trễ SLA hiển thị đầy đủ, không bị cắt xén.
  - Cột thao tác hiển thị nút "Thẩm định" mở Drawer trực tiếp.
- [x] `T097` **[FE-EnterpriseDrawer]** Xây dựng Slide-over Drawer chuyên sâu:
  - Thiết kế trượt từ phải ra màn hình (`fixed inset-y-0 right-0 max-w-xl shadow-2xl`).
  - Tích hợp luồng thẩm định Doanh nghiệp ĐMST (Mã số thuế, đại diện pháp luật, vốn điều lệ, giấy phép ĐKKD, giấy chứng nhận ĐMST).
  - Giữ nguyên vị trí cuộn của bảng danh sách.
  - Kiểm tra validation lý do `.trim().length >= 10`.

### Wave 3: Kiểm Thử Độc Lập & Nghiệm Thu Toàn Trình
- [x] `T098` **[QC-Verification-V7]** Cập nhật và bổ sung bài test trong `src/app/admin/approvals/page.test.tsx` & `qc-edge-cases.test.tsx`:
  - Test case xác thực thanh lọc Segmented Filter mới.
  - Test case xác thực hiển thị mã rút gọn `#HS-...` và badge Capsule 1 dòng.
  - Test case xác thực luồng thẩm định Doanh nghiệp ĐMST (MST, người đại diện).
  - Test case xác thực Slide-over Drawer mở/đóng và kiểm tra validation khoảng trắng.
- [x] `T099` **[QC-FullRegression-V7]** Chạy toàn bộ test suites (`npx vitest run src/app/admin/`) và build Next.js 66 routes đảm bảo 100% Green.







