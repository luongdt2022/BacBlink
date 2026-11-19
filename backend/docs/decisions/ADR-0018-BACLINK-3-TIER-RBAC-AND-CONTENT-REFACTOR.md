# ADR-0018: Kiến Trúc Refactor Phân Quyền 3 Cấp, Master Data Bắc Ninh & Chuyển Đổi Nội Dung BACLINK (3-Tier RBAC & Non-Destructive Content Refactor)

- **Số ADR**: ADR-0018
- **Trạng thái**: Chấp thuận (Accepted)
- **Ngày quyết định**: 2026-11-17
- **Supersedes**: `ADR-0014` (Phân cấp thẩm định hồ sơ chào bán công nghệ cho 63/34 Sở KH&CN)
- **Người đề xuất & Thẩm định**: Software Architect kiêm TechLead SA (`nacen-techlead-sa`)
- **Phê duyệt**: Product Owner kiêm Project Manager (`nacen-po-pm`)
- **Vùng ảnh hưởng**: `packages/kernel`, `config/policies`, `modules/identity`, `modules/enterprise`, `modules/technology`, `modules/demand`, `modules/brokerage`, `modules/assessment`, `modules/lms`, `modules/blockchain`, `modules/policy`, `apps/api`, `SourceCode/frontend/src/`
- **Một chiều?**: Có phần (Migration gộp role trong `identity.persons` và chuẩn hóa taxonomy `policy.taxonomy_terms`; giữ tương thích ngược bằng hàm normalize & `is_active = false` nên có thể rollback an toàn trước khi khóa schema).
- **Căn cứ**: `Specification/KE_HOACH_REFACTOR_BACLINK_3_CAP.md` (`PO-BACLINK-01`..`05`), `Specification/KE_HOACH_THUC_THI_CHI_TIET_BACLINK.md` (Batch `P0-B2`).

---

## 1. Bối Cảnh & Hiện Trạng Phụ Thuộc (As-Is Dependency Scan)

Quá trình quét chỉ đọc (`sa-refactor`) trên `SourceCode/backend/` và `SourceCode/frontend/src/` xác định các điểm neo phụ thuộc đa tầng hiện hữu:

1. **Tầng Kernel & Policy Engine**:
   - `SourceCode/backend/packages/kernel/Application/ICurrentActor.cs`: Định nghĩa 10 role cốt lõi (`SUPER_ADMIN`, `OPERATOR_ADMIN`, `PROVINCIAL_ADMIN`, `SECTOR_ADMIN`, `CLUSTER_ADMIN`, `SELLER`, `BUYER`, `INNOVATION_ENTITY`, `VERIFIED_EXPERT`, `PUBLIC_USER`) cùng 4 `ScopeTypes` (`GLOBAL`, `PROVINCE`, `SECTOR`, `ORG_UNIT`) với hàm `ScopeTypes.IsValidForRole` ép `PROVINCIAL_ADMIN` $\rightarrow$ `PROVINCE`, `SECTOR_ADMIN` $\rightarrow$ `SECTOR`, `CLUSTER_ADMIN` $\rightarrow$ `ORG_UNIT`.
   - `SourceCode/backend/config/policies/authorization-rules.v1.json`: Chứa 10+ rule gán danh sách role phân tầng (`GOVERNANCE_REVIEW`, `ADMIN_MANAGE`, `OWNER_LMS_MANAGE`, `LMS_CREATE`...).
   - `JwtTokenIssuer.cs` & `HttpCurrentActor.cs`: Phát hành và đọc claim `role`, `scope_type`, `scope_id`.
2. **Các Module Backend chịu tác động**:
   - **`identity`**: `ApprovalService.cs` (kiểm tra `ClusterAdmin` cấm `APPROVE` trực tiếp, `ApplyScopeFilter`, `ValidateActorScopeAccess`, `ApplyApprovalSideEffectsAsync` gán `VerifiedExpert`/`Seller`/`InnovationEntity` + `ScopeTypes.Province`); `OrganizationTreeService.cs` (seed cây Trung ương $\rightarrow$ 34 Sở KH&CN $\rightarrow$ Viện/Trường); `PersonService.cs` (`ValidateRoleScope`); `AuthenticationService.cs`; `ExpertProvinceScopeLookup.cs`.
   - **`enterprise`**: `EnterpriseService.cs` (hàm `ApproveEnterpriseAsync` / `RejectEnterpriseAsync` kiểm tra `MatchProvinceScope` theo `ScopeTypes.Province`; `CanViewRevenueAndFunding` kiểm tra `PROVINCIAL_ADMIN`; tự động `DUAL` chỉ cho `INNOVATION_ENTITY`).
   - **`technology`**: `TechnologyOffersController.cs` (`ReviewOffer` dùng `[Authorize(Roles = "PROVINCIAL_ADMIN,CLUSTER_ADMIN,SUPER_ADMIN,OPERATOR_ADMIN,ADMIN,DEPT_ADMIN,DEPT_OFFICER")]` và kiểm tra `Actor.ScopeId`) và `SellerOfferContracts.cs` (bắt buộc `ManagingAuthorityId` là Sở KH&CN).
   - **`demand`**: `DemandController.cs` (các route `gov/demands`, `gov/demands/surveys` đang mở `[AllowAnonymous]`; `gov/demands/{id}/verify` và `assign-expert` kiểm tra `ProvincialAdmin` và chặn `Buyer`).
   - **`brokerage`**: `BrokerageMatchingEngineService.cs` (phân nhánh SQL isolation cứng theo `PlatformRoles.Buyer`, `PlatformRoles.Seller`, `PlatformRoles.ProvincialAdmin`); `BrokerageControllers.cs` (mở `[AllowAnonymous]` cho `gov/opportunities`); `ExpertController.cs` (kiểm tra `VerifiedExpert`, `ProvincialAdmin`, `ScopeTypes.Province`).
   - **`assessment`**: `AssessmentsController.cs` (các endpoint `api/v1|v2/gov/assessments/tt17` và `dashboard` đang `[AllowAnonymous]`; `review` dùng `[Authorize(Roles = "DEPT_ADMIN,DEPT_OFFICER,ADMIN")]`; `NormalizeScopeId` mặc định `"HN"` và `IndustryCode` mặc định `"C.10"`).
   - **`lms` & `blockchain`**: `LmsController.cs` và `BlockchainAdminController.cs` đã dùng `Admin or SuperAdmin or OperatorAdmin` (ít phụ thuộc tầng tỉnh/sở, chỉ cần đồng bộ nội dung và `authorization-rules.v1.json`).
   - **`policy`**: `TaxonomyService.cs`, `TaxonomyTerm.cs` và `MasterDataControllers.cs` (`POST /api/v1/master-data/sectors` đang chặn cứng `if (!normalizedCode.StartsWith("LV"))`, xung đột với 8 mã ngành `IND_*` của BACLINK).
3. **Frontend (`SourceCode/frontend/src/`)**:
   - Nhóm `/gov/*` (`src/app/gov/**`, `src/components/gov/**`): Layout, Dashboard, Approvals, Enterprises, TT17 Assessments, Demands, Opportunities, Settings/Staff.
   - Nhóm `/admin/*`: `admin/layout.tsx`, `components/admin/admin-nav.tsx` (chứa `/admin/org-tree`, cảnh báo SLA 34 Sở, phê duyệt vượt cấp), `admin/roles/page.tsx` (`ROLES_MATRIX` 10 vai trò), `admin/users/page.tsx`, `admin/sectors/`.
   - Auth & Portal: `src/lib/auth-client.ts` (`ROLES`, `getRedirectPathByRole`, `getWorkspacePath`), `src/components/auth/role-guard.tsx`, `src/components/common/role-switcher.tsx` (dòng 86 ghi đè `user.role = targetRole` thành `BUYER`/`SELLER`), `src/app/portal/layout.tsx`, `src/app/profile/upgrade/page.tsx`.
   - Master Data FE: `src/lib/constants/provinces.ts` (`PROVINCES_34`), `src/lib/master-data-client.ts` (gọi `/api/v1/governance/org-units/public-provinces`), `src/lib/label-resolver.ts`, `src/lib/gov-label-resolver.ts`.

---

## 2. Quyết Định Kiến Trúc (Architectural Decisions)

### 2.1. Thu gọn RBAC về 3 Cấp Chuẩn Hóa & Tương Thích Ngược Token/DB
1. **3 Vai Trò Chuẩn Hóa (`PlatformRoles`)**:
   - **`ADMIN`**: Ban Quản trị Hiệp hội BACLINK (1 cấp phê duyệt duy nhất, không còn Maker-Checker giữa Sở Tỉnh và Trung ương).
   - **`ENTERPRISE`**: Doanh nghiệp Hội viên BACLINK (tự động sở hữu năng lực kép `CapabilityTier = "DUAL"`, `IsBuyer = true`, `IsSeller = true` sau khi được `ADMIN` phê duyệt).
   - **`PUBLIC_USER`**: Khách / Đối tác đã đăng nhập (cùng khách vãng lai `ANONYMOUS` trên các endpoint công khai).
2. **Bảo Toàn Tương Thích Ngược Token & DB Cũ (Non-Destructive Bridge)**:
   - Không xóa ngay các hằng số legacy trong `PlatformRoles` (`SuperAdmin`, `OperatorAdmin`, `ProvincialAdmin`, `SectorAdmin`, `ClusterAdmin`, `Seller`, `Buyer`, `InnovationEntity`, `VerifiedExpert`) mà đánh dấu `[Obsolete]` và bổ sung hàm chuẩn hóa tập trung `PlatformRoles.NormalizeTier(string? role)`:
     - `ADMIN | SUPER_ADMIN | OPERATOR_ADMIN` $\rightarrow$ `ADMIN`
     - `ENTERPRISE | SELLER | BUYER | INNOVATION_ENTITY | VERIFIED_EXPERT` $\rightarrow$ `ENTERPRISE`
     - `PUBLIC_USER | USER | PROVINCIAL_ADMIN | SECTOR_ADMIN | CLUSTER_ADMIN | ...` $\rightarrow$ `PUBLIC_USER` *(trừ trường hợp DB migration gán cụ thể tài khoản quản trị mới)*.
   - `authorization-rules.v1.json` bổ sung `ENTERPRISE` và `ADMIN` vào mọi rule tương ứng, giữ các alias legacy trong giai đoạn chuyển tiếp để không làm gãy JWT đang còn hạn trong phiên kiểm thử.
   - Bổ sung script SQL migration phi phá hủy trên `identity.persons` (cập nhật `platform_role` và `scope_type = 'GLOBAL'`, `scope_id = NULL`, kèm bảng ánh xạ hoặc audit log) và cấp `DUAL` capability cho toàn bộ `enterprise.enterprises` hội viên.

### 2.2. Thống Nhất `ScopeTypes.Global` Mặc Định
- Toàn bộ tài khoản mới và tài khoản sau chuẩn hóa ở cả 3 cấp (`ADMIN`, `ENTERPRISE`, `PUBLIC_USER`) đều mang `ScopeType = ScopeTypes.Global` và `ScopeId = null`.
- Nới lỏng `ScopeTypes.IsValidForRole`: cho phép `ScopeTypes.Global` (`scopeId == null`) với cả 3 role chuẩn (`ADMIN`, `ENTERPRISE`, `PUBLIC_USER`). Không yêu cầu `PROVINCE`, `SECTOR`, `ORG_UNIT` ở tầng Identity; thông tin địa bàn Bắc Ninh / KCN được lưu tại hồ sơ nghiệp vụ (`enterprise.enterprises`, `demand`, `technology`) dưới dạng thuộc tính lọc thay vì rào cản RBAC.
- Bãi bỏ kiểm tra `MatchProvinceScope` theo `Actor.ScopeId` trong `EnterpriseService`, `ApprovalService`, `TechnologyOffersController`, `BrokerageMatchingEngineService` và `AssessmentsController`.

### 2.3. Tách Bạch `user.role` (`ENTERPRISE`) và `activeRole` (`BUYER` | `SELLER`)
- Khắc phục lỗi tiềm ẩn tại `RoleSwitcher` (`src/components/common/role-switcher.tsx:86`): khi người dùng chuyển chế độ Bên Mua ↔ Bên Bán, **TUYỆT ĐỐI KHÔNG** ghi đè `user.role` trong `localStorage` thành `'BUYER'` hoặc `'SELLER'`.
- `user.role` giữ nguyên là `'ENTERPRISE'` để `RoleGuard` (`allowedRoles={['ENTERPRISE', 'ADMIN']}`) hoạt động ổn định; trạng thái làm việc Dual-Mode được lưu ở `activeRole` (`nacentwin_active_role` + `EnterpriseProfile.ActiveRole`).
- Tại Backend (`BrokerageMatchingEngineService`, `DemandController`, `TechnologyOffersController`), mọi tài khoản `ENTERPRISE` có quyền thao tác cả nghiệp vụ Bên Mua và Bên Bán theo sở hữu `PersonId` / `OrganizationId` (IDOR isolation giữ nguyên 100%).

### 2.4. Vô Hiệu Hóa An Toàn Nhóm `/gov/*` & `/admin/org-tree`
- **Frontend**:
  - Gỡ bỏ liên kết tới `/gov/*` và `/admin/org-tree` khỏi Navigation (`navbar.tsx`, `admin-nav.tsx`, `admin/layout.tsx`, `quick-portal-switcher.tsx`, `guide-data.ts`).
  - Xử lý an toàn route `/gov/*` và `/admin/org-tree`: thay thế bằng route chuyển hướng thông minh (redirect `/admin` nếu là `ADMIN`, `/portal` nếu là `ENTERPRISE`, `/` nếu là `PUBLIC_USER`/khách — hoặc trang thông báo `410 Gone` kèm nút điều hướng về Workspace hợp lệ), xóa bỏ hoàn toàn logic thẩm định 2 cấp Sở KH&CN (`src/components/gov/*`).
  - Tinh gọn `/admin/roles` còn ma trận 3 cấp (`ADMIN`, `ENTERPRISE`, `PUBLIC_USER`) và `/profile/upgrade` còn 1 luồng **Đăng ký Doanh nghiệp Hội viên BACLINK** (gửi thẳng hàng đợi duyệt 1 cấp của `ADMIN`).
- **Backend**:
  - Khóa ngay các endpoint `/api/v1|v2/gov/*` đang gắn `[AllowAnonymous]` (`DemandController.GetGovPendingDemands`, `BrokerageControllers.GetGovOpportunities`, `AssessmentsController.GetGovAssessmentQueue/Dashboard`): xóa `[AllowAnonymous]`, trả `410 Gone` (hoặc yêu cầu `[Authorize(Roles = "ADMIN")]` nếu chuyển hẳn sang `/api/v1/admin/*` trước khi gỡ).
  - Tách các API tra cứu công khai hiện đang nằm ké dưới `GovernanceControllers` (cụ thể `GET /api/v1/governance/org-units/public-provinces` dùng bởi `master-data-client.ts`) sang endpoint Master Data chuẩn (`/api/v1/master-data/locations` trả Địa bàn & KCN Bắc Ninh) trước khi vô hiệu hóa `/api/v1/governance/org-units/*`.

### 2.5. Master Data 8 Ngành BACLINK, KCN Bắc Ninh & Nguyên Tắc Zero-Mock SQL Seeding
1. **Bảo Toàn Lịch Sử Taxonomy (`policy.taxonomy_terms`)**:
   - Không `DELETE` các bản ghi ngành `LV01..LV18` cũ để `ITaxonomyNameResolver` vẫn giải mã được tên cho dữ liệu lịch sử (nếu còn). Thực hiện `UPDATE policy.taxonomy_terms SET is_active = false WHERE kind = 'SECTOR' AND code LIKE 'LV%'`.
   - Sửa validation trong `MasterDataControllers.cs` (bỏ ràng buộc cứng `StartsWith("LV")`), cho phép mã chuẩn `IND_*` (`IND_ELEC`, `IND_MECH`, `IND_AUTO`, `IND_PLAS`, `IND_MAT`, `IND_IT`, `IND_GREEN`, `IND_LOG`).
   - Thay thế `PROVINCES_34` (`src/lib/constants/provinces.ts`) bằng danh mục **Địa bàn trọng điểm & KCN tỉnh Bắc Ninh** (`TP_BN`, `TU_SON`, `QUE_VO`, `THUAN_THANH`, `YEN_PHONG`, `TIEN_DU`, `GIA_BINH`, `LUONG_TAI`, `NGOAI_TINH` và danh sách KCN: Yên Phong I/II, Quế Võ I/II/III, VSIP Bắc Ninh, Tiên Sơn, Đại Đồng - Hoàn Sơn, Hanaka, Thuận Thành, Gia Bình).
2. **Nguyên Tắc Zero-Mock SQL Seeding**:
   - Nghiêm cấm tuyệt đối mảng dữ liệu giả trong `catch` block hoặc in-memory fallback (như `AssessmentsStore` tĩnh hay mock fallback trên FE).
   - Toàn bộ dữ liệu demo BACLINK (5 tài khoản 3 cấp, 10 DN Hội viên Bắc Ninh tiêu biểu như Hanel PT, INTECH Group, Viqualita + 7 DN mẫu đa KCN, 10 sản phẩm/năng lực, 8 nhu cầu đặt hàng, 3 sự kiện, 6 khóa học LMS, 5 cố vấn kỹ thuật) bắt buộc được nạp qua script idempotent `SourceCode/backend/scripts/seed_baclink_demo_data.sql` trực tiếp vào PostgreSQL thật (`ON CONFLICT DO NOTHING / DO UPDATE`).

---

## 3. Phương Án Đã Loại (Alternatives Considered)

1. **Xóa cứng toàn bộ hằng số role cũ và xóa bảng `organization_units` ngay lập tức**:
   - *Lý do loại*: Gây gãy compile hàng loạt test/controller cũ cùng lúc và làm hỏng rollback nếu cần đối chiếu lịch sử audit. Chọn phương án Strangler/Adapter (normalize + đánh dấu `[Obsolete]` + migration phi phá hủy).
2. **Tạo 2 role riêng `ENTERPRISE_BUYER` và `ENTERPRISE_SELLER` thay vì 1 role `ENTERPRISE` Dual-Mode**:
   - *Lý do loại*: Vi phạm `PO-BACLINK-03`, gây phức tạp vòng đời phát hành lại JWT mỗi khi người dùng bấm `RoleSwitcher`.
3. **Hardcode danh sách 10 DN Bắc Ninh mẫu ở Frontend (`catch` fallback) để demo nhanh**:
   - *Lý do loại*: Vi phạm nghiêm trọng **Kỷ luật Zero-Mock** của Hiến pháp NacenTech (`AGENTS.md`).

---

## 4. Hệ Quả & Rủi Ro Cần Kiểm Soát Ở Gate 2 (`plan.md` / `tasks.md`)

- **Tích cực**: Loại bỏ hoàn toàn độ phức tạp phân cấp 34 Sở/Ngành, thống nhất 1 luồng duyệt tập trung bởi `ADMIN`, bảo vệ tuyệt đối Isolation giữa các `ENTERPRISE` theo `OrganizationId`/`PersonId`.
- **Rủi ro cần đưa thành task kiểm thử bắt buộc trong `plan.md`/`tasks.md`**:
  1. `AuthenticationService.LoginAsync` & `GovernanceControllers` (`RequireGlobalAdmin` hiện bỏ sót `PlatformRoles.Admin`) phải thống nhất nhận `ADMIN`.
  2. Test suite cũ (xUnit + Vitest) có hàng chục assertion kiểm tra `PROVINCIAL_ADMIN`, `/gov/*`, `PROVINCES_34`, `LV01` — phải cập nhật đồng bộ theo Spec Delta `CR-BACLINK-*` để không gây false-negative.
  3. Mọi endpoint `/gov/*` từng mở `[AllowAnonymous]` phải được kiểm thử trả `401/403/410` trong `rbac-permission-fuzzer`.
  4. Kiểm tra độ dài cột DB (`platform_role` varchar(50), `industry_code` varchar(20) ở `assessment.tt17_assessments` — đủ chứa `IND_GREEN` 9 ký tự, an toàn không cần ALTER phá hủy).
