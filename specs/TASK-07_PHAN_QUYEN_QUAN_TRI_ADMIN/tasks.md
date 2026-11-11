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

---

## Phase 20: Delta v13 (CR-2026-025) — Nạp Toàn Diện 34 Sở KH&CN và Kiểm Thử Toàn Trình 4 Thao Tác CRUD Cây Hành Chính

- [x] `T100` **[BE-DB-Seed34]** Soạn thảo và thực thi script SQL `scripts/seed_34_provinces_and_org_units.sql`:
  - Nạp đủ 34 Sở KH&CN 3 miền vào `identity.organization_units` trực thuộc `NACENTECH-CENTRAL` (idempotent `ON CONFLICT DO NOTHING`).
  - Nạp các Viện/Trường trọng điểm cấp cơ sở trực thuộc các Sở.
  - Khởi tạo 34 tài khoản Lãnh đạo Sở (`PROVINCIAL_ADMIN`, `Scope = PROVINCE`) với mật khẩu chuẩn `Password@123`.
  - Thực thi nạp trực tiếp vào Docker PostgreSQL `nacentech-postgres-1`.

- [x] `T101` **[QC-CRUD-Read]** Kiểm thử hiển thị toàn bộ 34 Sở Tỉnh trên giao diện cây 3 cấp (`/admin/org-tree`):
  - Kiểm tra đối soát 1:1 với PostgreSQL: Badge đếm hiển thị đủ 34 Sở Tỉnh trực thuộc Trung ương.
  - Kiểm tra các nhánh 3 miền hiển thị đầy đủ tên, mã Sở, địa bàn và trạng thái.

- [x] `T102` **[QC-CRUD-Create]** Kiểm thử tạo mới đơn vị cơ sở (Create):
  - Mở Modal Thêm Cơ Sở trực thuộc một Sở Tỉnh trên Web UI sống.
  - Điền form, bấm submit và đối soát CSDL thật sinh bản ghi mới và audit log `CREATE_ORG_UNIT`.

- [x] `T103` **[QC-CRUD-Update]** Kiểm thử chỉnh sửa thông tin đơn vị (Update):
  - Bấm nút Sửa trên dòng đơn vị vừa tạo, mở Modal Sửa Đơn Vị.
  - Cập nhật tên đơn vị mới, bấm Xác Nhận và đối soát CSDL thật cập nhật đúng tên mới kèm audit log `UPDATE_ORG_UNIT`.

- [x] `T104` **[QC-CRUD-Deactivate]** Kiểm thử vô hiệu hóa đơn vị (Deactivate):
  - Kiểm chứng ràng buộc `BR-TREE-003`: Thử vô hiệu hóa Sở có cơ sở con, xác nhận hệ thống chặn và trả thông báo lỗi hợp lệ.
  - Vô hiệu hóa đơn vị lá không có con trực thuộc, xác nhận CSDL cập nhật `status = INACTIVE` kèm audit log `DEACTIVATE_ORG_UNIT`.

- [x] `T105` **[QC-CRUD-Provision]** Kiểm thử cấp quyền Lãnh đạo Sở (Provision Leader):
  - Bấm nút "Cấp Quyền Sở" trên Sở chưa có tài khoản, mở Modal Cấp Quyền Lãnh Đạo Sở.
  - Điền thông tin và mật khẩu, bấm Xác Nhận và đối soát CSDL thật sinh tài khoản `PROVINCIAL_ADMIN` đúng scope địa bàn.

- [x] `T106` **[QC-FullPass-DoD]** Chạy trọn bộ kịch bản kiểm thử tự động Playwright E2E, chụp ảnh Evidence và nghiệm thu xuất xưởng Quality Gate 4 & 5.










---

## Phase 21: Delta v14 (CR-2026-025) — Bàn Quản Trị Người Dùng Toàn Hệ Thống (/admin/users)

- [x] `T107` **[BE-API-Deactivate]** Bổ sung endpoint `DELETE /api/v1/admin/users/{id}` (Soft Delete / Deactivate) và kiểm tra quy tắc `BR-USER-01` (Chặn tự khóa), `BR-USER-02` (Bảo vệ root admin `admin@nacentech.gov.vn`) kèm ghi vết `AuditLog`.
- [x] `T108` **[FE-Nav]** Cập nhật menu điều hướng Admin Sidebar tại `SourceCode/frontend/src/app/admin/layout.tsx` và `admin-nav.tsx`: Bổ sung mục "Quản lý Người Dùng Toàn Hệ Thống" (`/admin/users`).
- [x] `T109` **[FE-UsersPage]** Xóa bỏ redirect tại `SourceCode/frontend/src/app/admin/users/page.tsx`, xây dựng toàn diện bảng dữ liệu người dùng theo wireframe SSOT: Header KPI cards, Search debounce 300ms, Filter 10 Roles & Status, Data Table phân trang server-side, 5 UX States qua `<Async>`, Zero-Mock.
- [x] `T110` **[FE-Modals]** Xây dựng cụm Modal/Drawer thao tác:
  - Drawer xem chi tiết hồ sơ 360° (Thông tin, Thẩm quyền, Dữ liệu liên kết).
  - Modal chỉnh sửa thông tin người dùng (`PATCH /api/v1/admin/users/{id}`).
  - Modal đặt lại mật khẩu (`POST /api/v1/admin/users/{id}/reset-password`).
  - Modal Khóa/Mở khóa tài khoản 2 lớp bắt buộc nhập lý do, áp dụng `BR-USER-01` disable nút khóa trên tài khoản của chính Super Admin.
- [x] `T111` **[QC-Test-4Layers]** Thực thi kiểm thử độc lập 4 tầng (Unit tests `BR-USER-*`, Contract test DTO, DB integration test PostgreSQL, Playwright E2E Visual QA), thu thập evidence và nghiệm thu Gate 4 & 5.

---

## Phase 22: Spec Delta v16 (`CR-2026-029`) — Phản Hồi Chuyển Route Quản Trị, Đồng Bộ Sidebar SearchParams & Chuẩn Hóa KPI Skeleton (`/admin/*`) [PO-DEC-20261111-01]

### Đợt 2: Admin Route Loading Boundary & Đồng Bộ Sidebar `useSearchParams()`
- [x] `T112` **[CR-2026-029] [Đợt 2] [FE] Xây dựng Shared Admin Skeletons & App Router `admin/loading.tsx` (`REQ-ADM-LOAD-01`, `REQ-ADM-LOAD-03`)**:
  - Tạo `SourceCode/frontend/src/components/admin/admin-workspace-skeleton.tsx` gồm `AdminWorkspaceSkeleton` (`data-testid="admin-route-skeleton"`, `aria-busy="true"`, `animate-shimmer`, `CLS = 0`) và `AdminKpiCardSkeleton` dùng chung.
  - Tạo `SourceCode/frontend/src/app/admin/loading.tsx` render `<AdminWorkspaceSkeleton />` làm Next.js Suspense loading boundary cho phân hệ `/admin/*`.
- [x] `T113` **[CR-2026-029] [Đợt 2] [FE] Cập nhật `AdminLayout` & `AdminSidebarNav` dùng `useSearchParams()` và Pending Route Skeleton (`REQ-ADM-LOAD-01`, `REQ-ADM-LOAD-02`, `BR-ADM-LOAD-02`)**:
  - Cập nhật `SourceCode/frontend/src/app/admin/layout.tsx`: thay `window.location.search` bằng `useSearchParams()` bọc trong `<React.Suspense>` đồng bộ active state cho `/admin/approvals`, `?tab=sla`, `?tab=override`.
  - Bổ sung state `pendingHref`: khi click link sang route/tab khác (không có modifier key) thì highlight ngay mục đích và hiển thị `<AdminWorkspaceSkeleton />` ở vùng Main Workspace; không bật nếu click lại chính route/tab hiện tại; tự tắt khi `pathname`/`searchParams` thay đổi kèm fail-safe timeout (`12000ms`).
  - Bảo toàn tuyệt đối `RoleGuard` (`SUPER_ADMIN`, `OPERATOR_ADMIN`, `ADMIN`) bao bên ngoài toàn bộ shell và pending workspace.
- [x] `T114` **[CR-2026-029] [Đợt 2] [Test] Cập nhật & chạy Unit Test `AdminLayout` (`TEST-ADM-LOAD-01`, `REQ-ADM-LOAD-01`, `REQ-ADM-LOAD-02`, `BR-ADM-LOAD-02`)**:
  - Cập nhật `SourceCode/frontend/src/app/admin/layout.test.tsx` kiểm chứng: active sync `/admin/approvals`, `?tab=sla`, `?tab=override` qua `useSearchParams()`; click link khác bật `admin-route-skeleton` và tự ẩn khi route/query đổi; click lại cùng route hoặc giữ `ctrlKey` không bật skeleton; fail-safe timeout tự tắt; `RoleGuard` hoạt động nguyên vẹn.
  - Chạy `npx vitest run src/app/admin/layout.test.tsx` đạt 100% PASS.

### Đợt 4: Chuẩn Hóa Admin KPI Shimmer Skeleton (Zero Fake Zeroes) & Playwright E2E
- [x] `T115` **[CR-2026-029] [Đợt 4] [FE] Chuẩn hóa KPI Loading Skeleton tại `/admin/users` (`REQ-ADM-LOAD-03`, `BR-ADM-LOAD-01`, `BR-ADM-LOAD-02`)**:
  - Cập nhật `SourceCode/frontend/src/app/admin/users/page.tsx`: khi `loading === true`, 4 KPI Cards (`Tổng Người Dùng`, `Đang Hoạt Động`, `Đang Bị Khóa`, `Cán Bộ Quản Trị`) hiển thị `AdminKpiCardSkeleton` (`animate-shimmer`, `aria-busy="true"`, `CLS = 0`), tuyệt đối không hiển thị số `0` giả lúc đang tải.
  - Bảo toàn `<Async>` 5 UX States của bảng dữ liệu, bộ lọc và các Modal/Drawer CRUD.
- [x] `T116` **[CR-2026-029] [Đợt 4] [FE] Chuẩn hóa KPI & Hàng Đợi Loading Skeleton tại `/admin` (`REQ-ADM-LOAD-03`, `BR-ADM-LOAD-01`, `BR-ADM-LOAD-02`)**:
  - Cập nhật `SourceCode/frontend/src/app/admin/page.tsx`: khi `loading === true`, 4 thẻ `systemMetrics` và badge/mô tả Quick Action Card hàng đợi phê duyệt hiển thị Shimmer Skeleton (`animate-shimmer`, `aria-busy="true"`), loại bỏ chuỗi `"Đang tải..."` / `"Chưa có dữ liệu"` / `"Không có hồ sơ chờ"` giả trước khi API phản hồi.
- [x] `T117` **[CR-2026-029] [Đợt 4] [FE] Chuẩn hóa KPI Loading Skeleton tại `/admin/assessments/tt17` (`REQ-ADM-LOAD-03`, `BR-ADM-LOAD-01`, `BR-ADM-LOAD-02`)**:
  - Cập nhật `SourceCode/frontend/src/app/admin/assessments/tt17/page.tsx`: khi `loading === true`, 4 KPI Cards hiển thị Shimmer Skeleton (`animate-shimmer`, `aria-busy="true"`) thay cho `?? 0` và `"0.0%"` giả; hiển thị skeleton cho vùng bảng tỉnh / 5 nhóm thành phần khi `loading && !dashboard` và dòng skeleton bảng DN khi đang tải.
- [x] `T118` **[CR-2026-029] [Đợt 4] [Test] Unit Tests Zero Fake Zeroes cho `/admin/users`, `/admin`, `/admin/assessments/tt17` (`TEST-ADM-LOAD-01`, `BR-ADM-LOAD-01`)**:
  - Cập nhật `SourceCode/frontend/src/app/admin/users/page.test.tsx`, tạo `SourceCode/frontend/src/app/admin/page.test.tsx` và `SourceCode/frontend/src/app/admin/assessments/tt17/page.test.tsx`.
  - Kiểm chứng khi API chưa resolve (`loading === true`): render Shimmer Skeleton (`aria-busy="true"`), **không** render `"0"`, `"0 / 34"`, `"0.0%"`, `"Không có hồ sơ chờ"`; sau khi API resolve mới render số liệu thật (kể cả khi dữ liệu thật từ API bằng `0`).
- [x] `T119` **[CR-2026-029] [Đợt 4] [QC/E2E] Playwright E2E Thật, Visual QA & Build Gate (`TEST-ADM-LOAD-01`, `BR-ADM-LOAD-02`)**:
  - Tạo và chạy `SourceCode/frontend/e2e/admin-cr2026-029-loading-kpi.spec.ts` đối đầu trực tiếp `localhost:3000` + `localhost:5080` + PostgreSQL thật (Zero-Mock): xác nhận phản hồi skeleton chuyển route trên `AdminSidebarNav`, đồng bộ tab `/admin/approvals` / `?tab=sla` / `?tab=override`, không nháy số `0` giả trên KPI, Visual QA Desktop (1280px) & Mobile (390px) đạt $\ge 8.0/10$.
  - Chạy `npx tsc --noEmit`, `npx vitest run`, `npm run build` (`next build`) đạt 100% PASS.

---

## Phase 23: Spec Delta v17 (`CR-2026-030`) — Đồng Bộ "Thẩm Định DN ĐMST" & "Hội Đồng Chấm Điểm TT17" Về Chung Nhóm 1 Và Thu Gọn Sidebar `/gov` Thành 3 Nhóm [PO-DEC-20261111-02]

- [x] `T120` **[CR-2026-030] [FE-Nav] Thu gọn `GOV_MENU_GROUPS` tại `SourceCode/frontend/src/app/gov/layout.tsx` thành 3 nhóm (`REQ-GOV-NAV-01`, `BR-GOV-NAV-01`)**:
  - Đưa `Hội đồng Chấm điểm TT17` (`/gov/assessments/tt17`) lên chung `group1` (`1. Tổng Quan & Phê Duyệt`) cùng `Thẩm định DN ĐMST` (`/gov/approvals/enterprises`).
  - Đánh số lại `group2` (`2. Giám Sát Cung–Cầu & Địa Bàn`) và `group3` (`3. Quản Trị Công Vụ & Nhân Sự`), cập nhật state `openGroups` còn 3 khóa.
- [x] `T121` **[CR-2026-030] [FE-Breadcrumbs] Đồng bộ Breadcrumbs Nhóm 1 (`REQ-GOV-NAV-02`)**:
  - Cập nhật `GovPageHeader` breadcrumbs cấp 2 tại `src/app/gov/assessments/tt17/page.tsx`, `src/app/gov/approvals/enterprises/page.tsx`, và `src/components/gov/gov-approval-queue.tsx` về `{ label: "Tổng Quan & Phê Duyệt", href: "/gov" }`.
- [x] `T122` **[CR-2026-030] [Test] Cập nhật & chạy kiểm thử `src/app/gov/layout.test.tsx`, `tests/e2e/test_task07_delta_v8_gov_sidebar_e2e.py`, và `tsc --noEmit`**:
  - Kiểm chứng 3 nhóm Accordion, `Thẩm định DN ĐMST` và `Hội đồng Chấm điểm TT17` nằm chung trong `1. Tổng Quan & Phê Duyệt`. (Vitest 5 files / 24 tests PASS, `tsc --noEmit` exit code 0).

---

## Phase 24: Delta Mở Rộng (`CR-2026-031`) — Pending Route Skeleton Cho Cổng Công Vụ (`/gov/*`) [PO-DEC-20261111-03]

- [x] `T123` **[CR-2026-031] [FE-GovLoading] Tạo `src/app/gov/loading.tsx` và tích hợp `pendingHref` + `<WorkspaceRouteSkeleton testId="gov-route-skeleton" />` + `<React.Suspense>` vào `src/app/gov/layout.tsx` (`REQ-UI-043`)**.
- [x] `T124` **[CR-2026-031] [Test] Bổ sung test pending route skeleton trong `src/app/gov/layout.test.tsx` và chạy Vitest PASS**.

