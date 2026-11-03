# Tasks: TASK-00 Platform Foundation & Common Architecture

**Feature**: `TASK-00_PLATFORM_FOUNDATION_VA_COMMON`  
**Spec Reference**: [`spec.md`](./spec.md)  
**Plan Reference**: [`plan.md`](./plan.md)  
**Status**: Completed (Shipped Gate 5)  

---

## Giai đoạn 1: Thiết Lập Hạ Tầng Docker Local (`[INFRA]`)

- [x] `T-00.1` **[INFRA]** Rà soát và chuẩn hóa `backend/docker-compose.yml` với PostgreSQL 16 và Redis 7.
- [x] `T-00.2` **[INFRA]** Cấu hình script khởi chạy `backend/scripts/start-local-infra.sh` và kiểm tra port mapping 5432.
- [x] `T-00.3` **[INFRA]** Viết tài liệu hướng dẫn khởi chạy local DB tại `backend/docs/getting-started.md`.

---

## Giai đoạn 2: Tầng Thư Viện Dùng Chung Shared Kernel (`[KERNEL]`)

- [x] `T-00.4` **[KERNEL]** Chuẩn hóa `Result<T>` và `Error` types tại `backend/packages/kernel/Results/`.
- [x] `T-00.5` **[KERNEL]** Xây dựng `Entity<TId>` và `AuditableEntity` tại `backend/packages/kernel/Primitives/`.
- [x] `T-00.6` **[KERNEL]** Xây dựng `PagedList<T>` hỗ trợ query phân trang cho danh sách nghiệp vụ.
- [x] `T-00.7` **[KERNEL]** Viết Unit Test kiểm chứng 100% các trạng thái của `Result<T>` và `AuditableEntity`.

---

## Giai đoạn 3: Tầng Dữ Liệu Cơ Sở Persistence (`[PERSISTENCE]`)

- [x] `T-00.8` **[PERSISTENCE]** Cấu hình `DbContextBase` tích hợp Npgsql PostgreSQL tại `backend/packages/persistence/`.
- [x] `T-00.9` **[PERSISTENCE]** Triển khai `AuditInterceptor` tự động ghi nhận `CreatedAtUtc`, `UpdatedAtUtc`.
- [x] `T-00.10` **[PERSISTENCE]** Thiết lập cơ chế đăng ký và cấu hình Entity Mapping tự động theo từng module.

---

## Giai đoạn 4: Cấu Hình API Host & Middleware (`[API]`)

- [x] `T-00.11` **[API]** Cấu hình `GlobalExceptionHandlerMiddleware` trả về ProblemDetails chuẩn RFC 7807.
- [x] `T-00.12` **[API]** Cấu hình JWT Bearer Authentication và Extension Methods trên `ClaimsPrincipal`.
- [x] `T-00.13` **[API]** Kích hoạt Swagger UI hỗ trợ authorize Bearer Token trực tiếp trên giao diện trình duyệt.
- [x] `T-00.14` **[API]** Cấu hình endpoint `/health` kiểm tra kết nối DB và Redis.

---

## Giai đoạn 5: Nghiệm Thu Hội Tụ (Quality Gate Verification)

- [x] `T-00.15` **[TEST]** Chạy toàn bộ test suites trong `backend/tests/` và xác nhận kết quả pass.
- [x] `T-00.16` **[SPEC]** Cập nhật trạng thái `TASK-00` trong `specs/ROADMAP.md` và `specs/TRACEABILITY.md`.

---

## Giai đoạn 6: Delta v2 — Triển Khai Phân Quyền Đa Tầng 3D Scoped RBAC (`[DELTA]`)

- [x] `T-00.17` **[KERNEL]** Mở rộng `PlatformRoles` với 10 vai trò hạt nhân và thêm `ScopeTypes` trong `backend/packages/kernel/Application/ICurrentActor.cs`.
- [x] `T-00.18` **[KERNEL]** Mở rộng `ICurrentActor` và `SystemActor` để hỗ trợ `ScopeType` và `ScopeId`.
- [x] `T-00.19` **[IDENTITY]** Cập nhật Entity `Person.cs` trong `backend/modules/identity/Domain/Person.cs` để quản lý `ScopeType` và `ScopeId`.
- [x] `T-00.20` **[IDENTITY]** Cập nhật `Configurations.cs` (EF Core mapping) để map 2 cột mới trong schema `identity.persons`.
- [x] `T-00.21` **[IDENTITY]** Cập nhật `JwtTokenIssuer.cs` để nhúng các Claim `scope_type` và `scope_id` vào JWT.
- [x] `T-00.22` **[API]** Cập nhật `HttpCurrentActor.cs` trong `backend/apps/api/Infrastructure/` để đọc `scope_type` và `scope_id` từ `HttpContext.User`.
- [x] `T-00.23` **[POLICY]** Cập nhật `backend/config/policies/authorization-rules.v1.json` để nhận diện 10 role mới.
- [x] `T-00.24` **[MIGRATION]** Tạo file migration SQL / EF Core non-destructive cho bảng `identity.persons`.
- [x] `T-00.25` **[TEST]** Viết Integration/Authorization Tests kiểm chứng việc đăng nhập, cấp token, giải mã claim và kiểm tra quyền theo scope.

---

## Giai đoạn 7: Delta v3 — Hệ Thống Thành Phần Dùng Chung & Phi Chức Năng Frontend (`[FE-COMMON]`)

- [x] `T-00.26` **[FE-COMMON]** Xây dựng component `Dialog` đa năng và `ConfirmModal` popup tại `src/components/common/dialog.tsx` và `confirm-modal.tsx`.
- [x] `T-00.27` **[FE-COMMON]** Xây dựng hệ thống `ToastProvider` và hook `useToast()` hỗ trợ 4 trạng thái tại `src/components/common/toast.tsx`.
- [x] `T-00.28` **[FE-COMMON]** Xây dựng bộ điều khiển Theme Sáng/Tối (`theme-provider.tsx` + `theme-toggle.tsx`) lưu trữ vào `localStorage`.
- [x] `T-00.29` **[FE-COMMON]** Xây dựng bộ điều khiển cỡ chữ tiếp cận `fontsize-control.tsx` (Scale A- / A / A+).
- [x] `T-00.30` **[FE-COMMON]** Xây dựng bộ chuyển đổi song ngữ `i18n-provider.tsx` và hook `useI18n()` hỗ trợ Tiếng Việt & Tiếng Anh.
- [x] `T-00.31` **[FE-COMMON]** Xây dựng Khung giao diện Header `navbar.tsx` và `footer.tsx` dùng chung tích hợp đầy đủ Theme, i18n, Fontsize, Auth session.
- [x] `T-00.32` **[FE-COMMON]** Xây dựng Global Error Boundary tại `src/app/error.tsx` ngăn chặn crash ứng dụng.
- [x] `T-00.33` **[FE-COMMON]** Tích hợp trọn bộ các Providers vào `src/app/layout.tsx` và chạy `pnpm build` xác nhận đạt 0 lỗi biên dịch.

---

## Giai đoạn 8: Delta v4 — Hệ Thống 4 Cổng Trỏ Đường Dẫn & Role Gateway Router (`[FE-PORTALS]`)

- [x] `T-00.34` **[FE-PORTALS]** Bổ sung hàm `getRedirectPathByRole()` và helper phân tầng quyền hạn trong `src/lib/auth-client.ts`.
- [x] `T-00.35` **[FE-PORTALS]** Cập nhật trang Đăng nhập `src/app/(auth)/login/page.tsx` tự động điều hướng thông minh về đúng Cổng dựa theo `role` của người dùng.
- [x] `T-00.36` **[FE-PORTALS]** Xây dựng component bảo vệ phân quyền `<RoleGuard>` tại `src/components/auth/role-guard.tsx`.
- [x] `T-00.37` **[FE-PORTALS]** Khởi tạo **Cổng 2: Không Gian Thị Trường** tại `src/app/portal/` (`layout.tsx`, `page.tsx`).
- [x] `T-00.38` **[FE-PORTALS]** Khởi tạo **Cổng 3: Quản Trị Nhà Nước & 63 Tỉnh** tại `src/app/gov/` (`layout.tsx`, `page.tsx`).
- [x] `T-00.39` **[FE-PORTALS]** Khởi tạo **Cổng 4: Quản Trị Hệ Thống Tối Cao** tại `src/app/admin/` (`layout.tsx`, `page.tsx`).
- [x] `T-00.40` **[FE-PORTALS]** Cập nhật Navbar liên kết trực tiếp đến 4 Cổng và chạy `pnpm build` xác nhận nghiệm thu 0 lỗi.

---

## Giai đoạn 9: Delta v5 — Hội tụ vòng đời Account cho 10 Role / 4 Tầng (`[IDENTITY-RBAC]`)

- [x] `T-00.41` **[SPEC][FR-RBAC-006..007, BR-RBAC-006]** Chốt OpenAPI/DTO cho public registration `PUBLIC_USER`, provision role/scope, approval upgrade và lỗi xác thực; loại `GUEST`, `USER`, `ADMIN`, `EXPERT`, `SHOP_OWNER` khỏi payload role mới trừ nhánh tương thích có tài liệu.
- [x] `T-00.42` **[BE][FR-RBAC-006..007]** Triển khai use case public register tự kích hoạt `PUBLIC_USER`; provision role+scope atomic, validate cặp role/scope và ghi audit cho Tầng 0–1/Tầng 2 sau duyệt.
- [x] `T-00.43` **[FE][FR-PORTAL-001]** Nối form đăng ký/login vào hợp đồng mới, hiển thị trạng thái account đúng và giữ điều hướng 4 cổng theo JWT role/scope thật.
- [x] `T-00.44` **[TEST][AC-DELTA-05]** Viết integration/API E2E: đăng ký `PUBLIC_USER`; provision và đăng nhập thành công từng role trong 10 role; xác minh JWT claims, route đích, scope và audit. Test tạo dữ liệu riêng, không dùng secret hay fixture production.

---

## Giai đoạn 10: Delta v6 — Menu tài khoản và đăng xuất Web Portal (`[SESSION-UX]`)

- [x] `T-00.45` **[SPEC][REQ-SESSION-001..002, BR-SESSION-001]** Ghi Delta v6, ma trận tác động và truy vết từ Basic Design.
- [x] `T-00.46` **[FE][REQ-SESSION-001, UI-SESSION-001]** Thay vùng user Header bằng menu tài khoản truy cập được, gồm Settings và yêu cầu logout ở desktop/mobile.
- [x] `T-00.47` **[FE][REQ-SESSION-002, BR-SESSION-001]** Thêm hành động logout có xác nhận ở Settings, tái sử dụng clearSession/toast/redirect chung.
- [x] `T-00.48` **[TEST][AC-DELTA-06]** Viết component tests menu/logout và chạy regression Vitest; `pnpm build` đã pass compile và type-check trong môi trường local.

## Delta CR-2026-005 — Common/Home taxonomy sync
- [x] T-00.49 [FE][REQ-MD-SECTOR-001] Home uses active sector taxonomy for dynamic sector cards/count and opens directory with selected sector code.
- [x] T-00.50 [FE][INT] Remove static industry-count copy from login/common admin surfaces; render DB count only where runtime-loaded, otherwise count-free copy.

---

## Giai đoạn 11: Delta v7 (CR-2026-006) — Phân Nhánh Menu Tác Nghiệp Động Theo Vai Trò (`[ROLE-NAV-UX]`)

- [x] `T-00.51` **[SPEC][REQ-NAV-001..003]** Ghi nhận Spec Delta v7, phân rã ma trận menu đa vai trò từ Basic Design (`MA_TRAN_KICH_BAN_VA_TRANG_THAI_30_MAN_HINH.md`).
- [x] `T-00.52` **[FE][REQ-NAV-001, UI-NAV-001]** Tái cấu trúc `src/app/portal/layout.tsx`: xây dựng 6 bộ menu động may đo riêng cho `BUYER`, `SELLER`, `VERIFIED_EXPERT`, `INNOVATION_ENTITY`, `ADMIN`, `PUBLIC_USER`.
- [x] `T-00.53` **[FE][REQ-NAV-002..003]** Bổ sung Badge định danh không gian làm việc tương ứng và thẻ chuyển hướng nhanh về `/admin` và `/gov` cho tài khoản có quyền quản trị; chuẩn hóa toàn bộ sub-routes thực tế (`buyer/demands`, `seller/technologies`, `enterprise/profile`).
- [x] `T-00.54` **[TEST][AC-DELTA-07..09]** Viết Unit Test `src/app/portal/layout.test.tsx` kiểm chứng 100% logic phân nhánh vai trò và chạy Vitest hồi quy đạt 100% pass (112/112 tests).
 
---

## Giai đoạn 12: Delta v8 (CR-2026-011) — Xây Dựng Màn Hình Hồ Sơ Cá Nhân & Hub Nâng Hạng (/profile) [GAP-01]

- [x] `T-00.55` **[SPEC]** Ghi nhận Spec Delta v8 bổ sung REQ-PROFILE-001..002 và AC-DELTA-10..11 vào `specs/TASK-00_.../spec.md`.
- [x] `T-00.56` **[FE]** Thay thế redirect trong `src/app/profile/page.tsx` bằng UI Hồ sơ cá nhân 3 Tab chuẩn 1:1 theo `wireframe_ho_so_ca_nhan.html`: Card Avatar Monogram, Vai trò hiện tại, 2 Khối CTA nâng hạng Chuyên gia (`/profile/upgrade/expert`) & Doanh nghiệp ĐMST (`/portal/enterprise/profile/edit`), Tab Lịch sử không gian làm việc.
- [x] `T-00.57` **[TEST]** Viết kiểm thử component cho `/profile` và chạy build Next.js 15 xác nhận 0 lỗi biên dịch.

---

## Giai đoạn 13: Delta v9 (CR-2026-012) — Xây Dựng Cổng Đăng Ký Nâng Cấp Vai Trò (Upgrade Hub 4 Lộ Trình - /profile/upgrade)

- [x] `T-00.58` **[SPEC]** Ghi nhận Spec Delta v9 bổ sung REQ-UPGRADE-HUB-001..003 và AC-DELTA-12..16 vào `specs/TASK-00_.../spec.md` và `plan.md`.
- [x] `T-00.59` **[FE]** Thay thế redirect trong `src/app/profile/upgrade/page.tsx` bằng UI Upgrade Hub 4 Lộ Trình chuẩn 1:1 theo `wireframe_nang_cap_tai_khoan_hub.html`:
  - Hero banner phân cấp quyền hạn 3D Scoped RBAC.
  - 4 Cards: Chuyên gia KH&CN, Doanh nghiệp ĐMST, Bên Mua Buyer, Bên Bán Seller.
  - Modal Kê khai Doanh nghiệp ĐMST (tra cứu MST, tải file ĐKKD, chọn Sở KH&CN tiếp nhận).
  - Modal Đăng ký Gian hàng Seller (Lĩnh vực TT17, Sở KH&CN quản lý, cam kết pháp lý SLA 24h).
  - Bảng ma trận so sánh quyền hạn và tiêu chuẩn hồ sơ 4 vai trò.
- [x] `T-00.60` **[FE]** Cập nhật liên kết mục "Đăng ký Nâng hạng Vai trò" trong Sidebar `src/app/portal/layout.tsx` của `PUBLIC_USER` trỏ về `/profile/upgrade` (Hub tổng thể).
- [x] `T-00.61` **[TEST]** Viết kiểm thử Unit/Integration cho trang `/profile/upgrade` và chạy Vitest hồi quy xác nhận 100% pass, Next.js build sạch 0 lỗi.





---

## Giai đoạn 14: Delta v10 (CR-2026-TYPO) — Chuẩn Hóa Typography Cổng DVCQG (Nunito Sans & Lora) [`[FE-TYPO]`]

- [x] `FE-DELTA-01` **[FE][TYPOGRAPHY]** Cấu hình nạp Google Fonts `Nunito_Sans` & `Lora` trong `src/app/layout.tsx`:
  - [x] Nhập `Nunito_Sans` và `Lora` từ `next/font/google` với subsets `['vietnamese', 'latin']`, display `'swap'`, zero CLS (`adjustFontFallback: true`).
  - [x] Khai báo biến CSS `--font-sans` cho `Nunito_Sans` (weights: `400, 500, 600, 700`) và `--font-heading` cho `Lora` (weights: `600, 700`).
  - [x] Nhúng các biến font vào `className` của thẻ `<html>` và loại bỏ cấu hình font local `beVietnamPro`.
  - [x] Đảm bảo thẻ `<body>` kế thừa `font-sans antialiased`.

- [x] `FE-DELTA-02` **[FE][DESIGN-TOKENS]** Cập nhật Design Tokens typography trong `src/app/globals.css`:
  - [x] Cập nhật `@theme`: gán `--font-sans` trỏ `var(--font-sans)` kèm system fallbacks; thêm `--font-heading` và `--font-serif` trỏ `var(--font-heading)` kèm serif system fallbacks.
  - [x] Khai báo fallback `--font-be-vietnam-pro: var(--font-sans)` bảo đảm tương thích ngược cho các component hiện có.
  - [x] Đồng bộ hóa các rules Text Scaling trong `@layer base`:
    - [x] `html[data-text-scale="sm"] { font-size: 92.5%; }`
    - [x] `html[data-text-scale="base"]`, `html[data-text-scale="md"] { font-size: 100%; }`
    - [x] `html[data-text-scale="lg"] { font-size: 110%; }`
  - [x] Cập nhật các class tiện ích tiêu đề: `.type-hero`, `.type-section-title`, `.type-page-title` kế thừa font trang trọng `var(--font-heading)`.

- [x] `FE-DELTA-03` **[FE][DESIGN-SYSTEM]** Cập nhật `DESIGN_SYSTEM.md` và `src/components/ui/design-system.tsx`:
  - [x] Cập nhật tài liệu `DESIGN_SYSTEM.md` Mục 4 phản ánh kiến trúc Dual Font (Nunito Sans cho UI/Body/Data Grid và Lora cho Quốc hiệu/Banner/Tiêu đề trang trọng) cùng bảng ánh xạ 10 nhóm thành phần UI.
  - [x] Cập nhật component `SectionHeading` trong `src/components/ui/design-system.tsx` sử dụng `font-heading font-bold` cho tiêu đề `title`.
  - [x] Rà soát `AppButton`, `AppLink` đảm bảo tuân thủ vùng tương tác tối thiểu $\ge 44\text{px}$ và font `Nunito Sans`.

- [x] `TEST-DELTA-01` **[TEST][QUALITY-GATE]** Chạy kiểm thử tự động `src/test/design-rules.test.ts` và test suite:
  - [x] Chạy `pnpm vitest run src/test/design-rules.test.ts` kiểm tra và khắc phục triệt để các vi phạm bảng màu retired (blue/indigo/purple) hoặc font cỡ nhỏ < 12px.
  - [x] Kiểm tra tính toàn vẹn của logic điều khiển cỡ chữ tại `src/components/common/fontsize-control.tsx`.
  - [x] Chạy `pnpm build` tại `SourceCode/frontend` xác nhận biên dịch Next.js 15 đạt 100% thành công (Exit code 0, 0 linter/type errors).

---

## Giai đoạn 15: Delta v11 (CR-2026-014) — Chuẩn Hóa Dynamic Navigation, Dual Mode & Seller TT17 [`[FE-NAV]`]

- [x] `T-00.62` **[FE][NAV]** Tối ưu hóa component `RoleSwitcher` (`src/components/common/role-switcher.tsx`):
  - [x] Rút gọn nhãn nút `Bên Mua (Buyer)` $\rightarrow$ `Bên Mua` và `Bên Bán (Seller)` $\rightarrow$ `Bên Bán`.
  - [x] Triệt tiêu hoàn toàn lỗi CSS truncate gây cắt cụt text thành `(...)`.
  - [x] Bảo toàn logic chuyển đổi vai trò nhanh <300ms, đồng bộ `localStorage` và `switchEnterpriseActiveRole`.

- [x] `T-00.63` **[FE][NAV]** Bổ sung mục Đánh giá Năng lực TT17 vào Seller Workspace (`src/app/portal/layout.tsx`):
  - [x] Thêm `{ href: "/assessments/tt17", label: "Đánh giá Năng lực TT17", icon: FileCheck }` vào `sellerNavItems`.
  - [x] Xác thực liên kết điều hướng chính xác về module đánh giá TT17.

- [x] `T-00.64` **[FE][NAV]** Triển khai cơ chế phân giải nhãn động `resolveProfileLabel` (`src/app/portal/layout.tsx`):
  - [x] Nạp `fetchMyEnterpriseProfile()` trong `useEffect` để trích xuất `subjectType`.
  - [x] Tự động hiển thị `Hồ sơ Viện / Trường` cho Viện/Trường/Học viện hoặc `CLUSTER_ADMIN`.
  - [x] Tự động hiển thị `Hồ sơ Hợp tác xã` cho HTX.
  - [x] Tự động hiển thị `Hồ sơ Doanh nghiệp ĐMST` cho `INNOVATION_ENTITY`.
  - [x] Tự động hiển thị `Hồ sơ Doanh nghiệp` cho Doanh nghiệp `BUYER` và `SELLER`.

- [x] `T-00.65` **[TEST][QC]** Xây dựng test suite chuyên biệt và hồi quy:
  - [x] Cập nhật test cases hiện có trong `src/app/portal/layout.test.tsx` kiểm chứng sự hiện diện của `Đánh giá Năng lực TT17` và `Hồ sơ Doanh nghiệp`.
  - [x] Xây dựng test suite riêng `src/app/portal/portal-navigation-delta.test.tsx` bao phủ toàn bộ nhánh phân giải nhãn động và trạng thái nút RoleSwitcher.
  - [x] Chạy Vitest đạt 100% PASS (100% Green).

---

## Giai đoạn 16: Delta v12 (CR-2026-015) — Tối Ưu Hóa 7 Mục Chức Năng Seller Workspace [`[FE-SELLER]`]

- [x] `T-00.66` **[FE][WAVE-1]** Chuyên biệt hóa Dashboard Seller và triệt tiêu rò rỉ phân quyền (`src/app/portal/page.tsx`, `seller-dashboard.tsx`):
  - [x] Xây dựng `<SellerDashboard />` tại `src/components/portal/seller-dashboard.tsx` với 4 KPI, Quick Actions và Inbound Leads.
  - [x] Tích hợp rẽ nhánh tại `src/app/portal/page.tsx` khi `currentRole === "SELLER"`.
  - [x] Loại bỏ nút `/gov/opportunities` tại `src/app/portal/opportunities/pipeline/page.tsx`.
  - [x] Loại bỏ nút `/gov/opportunities` tại `src/app/portal/matching/radar/page.tsx`.
  - [x] Viết unit test `src/app/portal/seller-dashboard.test.tsx` đạt 100% PASS.

- [x] `T-00.67` **[FE][WAVE-2]** Chuẩn hóa Kho Công Nghệ (TRL) và làm sạch text Đánh giá TT17:
  - [x] Xóa bỏ `<header>` trùng lặp và badge dev `TASK-04`, `SELLER WORKSPACE` trong `src/app/portal/seller/technologies/page.tsx`.
  - [x] Tích hợp bộ lọc dropdown dải TRL (`TRL_1_3`, `TRL_4_6`, `TRL_7_9`).
  - [x] Chuẩn hóa ký tự `$T_{"ĐB"}$` thành `T_ĐB` trong `src/app/(portal)/assessments/tt17/page.tsx`.

- [x] `T-00.68` **[FE][WAVE-3]** Nâng cấp Hồ Sơ Doanh Nghiệp sang ConfirmModal và làm sạch State:
  - [x] Xóa bỏ giá trị gán cứng 40% trong `formData.highQualificationRatio` tại `src/app/portal/enterprise/profile/page.tsx`.
  - [x] Thay thế lệnh `window.confirm()` bằng `<ConfirmModal />` chuẩn Design System NacenTech.

- [x] `T-00.69` **[TEST][QC]** Xây dựng test suite toàn diện và nghiệm thu Wave 1-3:
  - [x] Tạo `src/app/portal/seller-workspace-delta-qc.test.tsx` kiểm thử Item 2 (TRL filter & zero dev badges) và Item 7 (ConfirmModal & clean state).
  - [x] Chạy toàn bộ 4 test suites (`seller-workspace-delta-qc.test.tsx`, `seller-dashboard.test.tsx`, `portal-navigation-delta.test.tsx`, `layout.test.tsx`): 23/23 tests PASS (100% Green).

---

## Giai đoạn 17: Delta v13 (CR-2026-016) — Chuẩn Hóa Cấu Trúc Thông Tin & Navigation Workspace Bên Mua [`[FE-BUYER]`]

- [x] `T-00.70` **[FE][NAV]** Tái cấu trúc mảng `buyerNavItems` trong `src/app/portal/layout.tsx`:
  - [x] Phân định 3 Section: `Tác nghiệp Mua sắm`, `Khám phá & Ghép nối`, `Chẩn đoán & Hồ sơ`.
  - [x] Đổi nhãn `Bài toán Tìm mua` $\rightarrow$ `Bài toán Đổi mới Công nghệ`.
  - [x] Gắn count badge cho Bài toán (`3`), Tiến trình MOU (`1`), và badge `"Mới"` cho Radar Ghép Nối AI.
  - [x] Đồng bộ nhãn module trong `src/app/portal/page.tsx` sang `Bài toán Đổi mới Công nghệ`.

- [x] `T-00.71` **[DOC][WIREFRAME]** Đồng bộ Wireframe Basic Design HTML:
  - [x] Cập nhật `Specification/02_BASIC_DESIGN/TASK-00_PLATFORM_FOUNDATION_VA_COMMON/wireframe_workspace_seller_dual_mode.html` phản ánh đúng 3 Section, badges và nhãn chuẩn hóa.

- [x] `T-00.72` **[TEST][QC]** Cập nhật test suite và kiểm thử hồi quy:
  - [x] Cập nhật `src/app/portal/layout.test.tsx` với các assertions mới về Section headers và nhãn chuẩn hóa.
  - [x] Bổ sung test cases chuyên biệt trong `src/app/portal/portal-navigation-delta.test.tsx` kiểm chứng 3 Section và badges của Bên Mua.
  - [x] Chạy Vitest xác nhận 100% PASS (100% Green, 74/74 portal tests pass).

---

## Giai đoạn 18: Delta v14 (CR-2026-019) — Xây Dựng Bàn Làm Việc Tổng Quan Mua Sắm (Executive Buyer Dashboard) [`[FE-BUYER-DASHBOARD]`]

- [x] `T-00.73` **[FE][DASHBOARD]** Xây dựng component `<BuyerDashboard />` tại `src/components/portal/buyer-dashboard.tsx`:
  - [x] Executive Banner chào mừng Bên Mua kèm 3 nút Quick Actions: `+ Khai Báo Bài Toán Nhanh` (mở QuickDemandModal), `Khảo Sát Nhu Cầu (TNI 4 Bước)`, `Radar Ghép Nối AI`.
  - [x] 4 KPI Cards hoạt động như đường link điều hướng sống (Bài toán đang mở $\rightarrow$ `/portal/buyer/demands`, Ứng viên AI $\rightarrow$ `/portal/matching/radar`, Deals đang trao đổi $\rightarrow$ `/portal/opportunities/pipeline`, Thỏa thuận đã ký MOU $\rightarrow$ `/portal/opportunities/pipeline`).
  - [x] Widget 1: Tiến Trình Hợp Tác & Deal Room (liệt kê các thương vụ đang đàm phán kèm nút Vào Deal Room).
  - [x] Widget 2: Danh sách Bài toán Đổi mới Công nghệ mới nhất kèm điểm cấp thiết TNI và nút mở Radar.
- [x] `T-00.74` **[FE][ROUTING]** Tích hợp rẽ nhánh tại `src/app/portal/page.tsx`:
  - [x] Render `<BuyerDashboard />` khi `currentRole === "BUYER" || currentRole === "INNOVATION_ENTITY"`.
  - [x] Lắng nghe sự kiện `storage` cập nhật `activeRole` khi người dùng chuyển đổi chế độ kép trên Sidebar.
- [x] `T-00.75` **[TEST][QC]** Viết test suite chuyên biệt và kiểm thử hồi quy:
  - [x] Xây dựng `src/app/portal/buyer-dashboard.test.tsx` kiểm thử 4 trục chức năng đạt 4/4 PASS.
  - [x] Xây dựng `src/app/portal/page.test.tsx` kiểm thử role-based routing đạt 2/2 PASS.
  - [x] Toàn bộ portal test suites đạt 100% Green (85/85 tests).

---

## Giai đoạn 19: Delta v15 (CR-2026-10-30) — Tinh Gọn Onboarding & Bàn Làm Việc Public User [`[FE-PUBLIC-USER]`]

- [x] `T-00.76` **[FE-DELTA-10-01]** Form Đăng ký: Xác nhận gỡ bỏ trường Organization, giữ vững PDPD và validation (`src/app/(auth)/register/page.tsx`):
  - [x] Gỡ bỏ hoàn toàn trường nhập liệu Cơ quan / Đơn vị (`organization`) khỏi `initialFormData`, UI form và validation state.
  - [x] Bảo toàn 100% các trường định danh cá nhân cốt lõi (`lastName`, `firstName`, `email`, `phone`, `password`, `confirmPassword`).
  - [x] Giữ vững checkbox đồng thuận bảo vệ dữ liệu cá nhân (`acceptPdpd` theo Nghị định 13/2023/NĐ-CP).
  - [x] Kiểm chứng endpoint tiếp nhận payload tinh gọn và kích hoạt tài khoản `PUBLIC_USER`.

- [x] `T-00.77` **[FE-DELTA-10-02]** Sidebar Navigation: Cập nhật publicNavItems thành 5 mục chuẩn trong layout.tsx (`src/app/portal/layout.tsx`):
  - [x] Chuẩn hóa danh mục `publicNavItems` thành đúng 5 mục:
    1. Bàn làm việc (`/portal`, icon `LayoutDashboard`)
    2. Nhu cầu & Sản phẩm quan tâm (`/portal/buyer/demands`, icon `ShoppingBag`)
    3. Radar Ghép Nối AI (`/portal/matching/radar`, icon `Sparkles`, `badge: "Mới"`, `badgeType: "new"`)
    4. Đăng ký Nâng hạng Vai trò (`/profile/upgrade`, icon `Rocket`)
    5. Cài đặt Tài khoản (`/settings`, icon `FileCheck` hoặc `Settings`)
  - [x] Triệt tiêu 100% các liên kết pháp nhân không phù hợp (Gian hàng `/portal/seller/technologies`, Đánh giá TT17 `/assessments/tt17`, Hồ sơ Doanh nghiệp `/portal/enterprise/profile`) khỏi menu của `PUBLIC_USER`.

- [x] `T-00.78` **[FE-DELTA-10-03]** Dashboard Public User: Tái cấu trúc GeneralPortalDashboard trong page.tsx gồm 3 khối (`src/app/portal/page.tsx`):
  - [x] Khối 1: Quick Action Hero Banner với lời chào cá nhân hóa (`user?.fullName`), nhãn định vị `"Thành viên Khám phá / Bên Mua tiềm năng"`, và 2 nút tắt dẫn tới `/khao-sat-nhu-cau` và `/portal/seller/technologies`.
  - [x] Khối 2: Lưới 3 Thẻ Mua Sắm & Khám Phá AI (3-Card Explorer Grid):
    * Thẻ 1: Khám phá Sàn Công nghệ & Gian hàng (`/portal/seller/technologies`, icon `Cpu`)
    * Thẻ 2: Bài toán Đổi mới của Bạn (`/portal/buyer/demands`, icon `ShoppingBag`)
    * Thẻ 3: Radar Ghép Nối AI (`/portal/matching/radar`, icon `Sparkles`, badge `"Mới"`)
  - [x] Khối 3: Banner Nâng Hạng CTA nổi bật giới thiệu 4 lộ trình chuyển đổi (Bên Mua, Bên Bán, Chuyên gia, Doanh nghiệp ĐMST) kèm nút CTA dẫn tới `/profile/upgrade`.
  - [x] Loại bỏ hoàn toàn mảng `generalModules` cũ 4 thẻ pháp nhân.

- [x] `T-00.79` **[TEST-DELTA-10-01]** Cập nhật portal-navigation-delta.test.tsx và layout.test.tsx bao phủ 100% 5 menu và 3 thẻ mới:
  - [x] Bổ sung test cases trong `src/app/portal/layout.test.tsx` kiểm chứng vai trò `PUBLIC_USER` hiển thị chính xác 5 mục sidebar và 0 rò rỉ module pháp nhân.
  - [x] Bổ sung test cases trong `src/app/portal/portal-navigation-delta.test.tsx` kiểm thử nhãn, icon và badge mới của `publicNavItems`.
  - [x] Bổ sung/Cập nhật test cases cho `GeneralPortalDashboard` trong `src/app/portal/page.test.tsx` kiểm chứng render 3 khối chức năng mới.

- [x] `T-00.80` **[VERIFY-DELTA-10-01]** Chạy npm test kiểm chứng Zero Regression cho toàn bộ 70+ test cases cũ:
  - [x] Chạy vitest trên toàn bộ test suites (`layout.test.tsx`, `portal-navigation-delta.test.tsx`, `buyer-dashboard.test.tsx`, `seller-dashboard.test.tsx`, `page.test.tsx`, `register/page.test.tsx`).
  - [x] Đạt 100% Green, 0 regression cho các workspace BUYER, SELLER, EXPERT, ADMIN.





---

## Giai đoạn 20: Delta v16 (CR-2026-020) — Tự Động Thiết Lập Phiên Đăng Nhập Sau Khi Đăng Ký (Seamless Auto-Login) [`[FE-AUTO-LOGIN]`]

- [x] `T-00.81` **[FE-AUTO-LOGIN-01]** Xử lý chuỗi liên hoàn Auto-login tại `src/app/(auth)/register/page.tsx`:
  - [x] Khi `POST /api/v1/auth/register` trả về HTTP 201 Created, không xóa trắng form ngay mà gọi tiếp `POST /api/v1/auth/login` với email và password vừa nhập.
  - [x] Khi login thành công, gọi `authClient.setSession(data.accessToken, data.user)`.
  - [x] Kích hoạt Toast notification thông báo: *"Đăng ký thành công! Chào mừng bạn gia nhập NacenTech."*
  - [x] Điều hướng an toàn bằng `router.push("/")` (hoặc theo `getRedirectPathByRole(data.user.role)`).

- [x] `T-00.82` **[FE-AUTO-LOGIN-02]** Chuẩn hóa 5 UX states cho nút Đăng ký & Chống Double-Submit:
  - [x] Nút submit hiển thị trạng thái động 2 giai đoạn: Giai đoạn 1 *"Đang tạo tài khoản..."* $\rightarrow$ Giai đoạn 2 *"Đang khởi tạo phiên làm việc..."*.
  - [x] Vô hiệu hóa nút (disabled) và hiển thị Spinner trong suốt quá trình xử lý, chống spam click đúp.
  - [x] Loại bỏ khối banner tĩnh màu xanh lá bắt người dùng bấm link đăng nhập khi luồng auto-login hoạt động bình thường.

- [x] `T-00.83` **[FE-AUTO-LOGIN-03]** Cơ chế Fallback an toàn khi Login gặp sự cố mạng:
  - [x] Nếu Register thành công nhưng Login gặp lỗi kết nối mạng (Network Error / Timeout), giữ nguyên form dữ liệu.
  - [x] Hiển thị thông báo hướng dẫn rõ ràng: *"Tài khoản của bạn đã được khởi tạo thành công! Vui lòng bấm để đăng nhập"* kèm nút điều hướng sang `/login?registered=true&email=...`.

- [x] `T-00.84` **[TEST-QC-01]** Cập nhật Unit & Component tests trong `src/app/(auth)/register/page.test.tsx`:
  - [x] Cập nhật test case happy path: Kiểm chứng `fetch` được gọi 2 lần (register $\rightarrow$ login), `authClient.setSession` được gọi, và `router.push` được gọi với `/`.
  - [x] Bổ sung test case fallback: Register thành công nhưng Login ném lỗi mạng $\rightarrow$ Kiểm chứng hiển thị thông báo fallback chuyển sang login.
  - [x] Kiểm chứng các validation client-side cũ (Họ tên, Email regex, Password < 8, Checkbox PDPD) tiếp tục pass 100%.

- [x] `T-00.84B` **[VERIFY-E2E-01]** Chạy kiểm thử toàn diện và đối soát Zero Regression:
  - [x] Chạy Vitest trên toàn bộ frontend test suites xác nhận 100% Green.
  - [x] Kiểm tra build Next.js (`pnpm build` hoặc `npm run build`) đạt exit code 0.

---

## Giai đoạn 21 (Phase 18): Delta v17 (CR-2026-021) — Chuẩn Hóa Bắt Buộc Định Danh Pháp Nhân Khi Mở Gian Hàng Seller (Legal Entity Mandate for Seller Onboarding) [`[SELLER-ONBOARDING]`]

- [x] `T-00.85` **[BE] Mở rộng SubmitApprovalRequestDto và FluentValidation cho requestType SHOP**:
  - [x] Khởi tạo DTO `SubmitShopApprovalPayload` trong `NacenTech.Modules.Identity.Application`.
  - [x] Xây dựng bộ quy tắc validation cho payload `SHOP`:
    * Validate `entityType` thuộc `ENTERPRISE` hoặc `INSTITUTION_RND`.
    * Validate `orgName` (5–255 ký tự), `mainSector` (TT17), `province`, `description` ($\ge 10$ ký tự), `pledgeAgreed == true`.
    * Validate có điều kiện: Nếu `ENTERPRISE` $\rightarrow$ `taxCode` regex 10 hoặc 13 chữ số; Nếu `INSTITUTION_RND` $\rightarrow$ `establishmentDecisionNo` $\ge 5$ ký tự.
    * Validate `legalDocUrl` bắt buộc có đuôi `.pdf`.
  - [x] Tích hợp validator vào pipeline xử lý của `ApprovalService.SubmitRequestAsync` cho `requestType == "SHOP"`.

- [x] `T-00.86` **[BE] Unit tests cho validation payload SHOP có pháp nhân hợp lệ**:
  - [x] Viết bộ Unit test C# cho validation payload SHOP (`Task00DeltaV17ShopApprovalValidationTests.cs`):
    * Case 1 (Happy Path - Doanh nghiệp): Payload `ENTERPRISE` có MST hợp lệ và tệp PDF $\rightarrow$ Submit thành công, SLA deadline 24h.
    * Case 2 (Happy Path - Viện/Trường R&D): Payload `INSTITUTION_RND` có Số QĐ và tệp PDF $\rightarrow$ Submit thành công, SLA deadline 24h.
    * Case 3 (Boundary): `taxCode` sai định dạng (chứa chữ cái hoặc ít hơn 10 số) $\rightarrow$ Ném ValidationException.
    * Case 4 (Boundary): `establishmentDecisionNo` để trống hoặc $< 5$ ký tự $\rightarrow$ Ném ValidationException.
    * Case 5 (Security): `legalDocUrl` không phải đuôi `.pdf` (ví dụ: `.exe`, `.png`) $\rightarrow$ Ném ValidationException.
    * Case 6: Chưa tích cam kết `pledgeAgreed` $\rightarrow$ Ném ValidationException.
  - [x] Chạy kiểm thử hồi quy `Task07DeltaV4ApprovalQcTests.cs` đạt 7/7 passed (100% Green).

- [x] `T-00.87` **[FE] Nâng cấp UI Modal Seller trong `src/app/profile/upgrade/page.tsx` chuẩn 1:1 theo Wireframe mới (2 tab pháp nhân, tra cứu MST, upload file PDF)**:
  - [x] Thiết kế lại modal `#sellerModal` tại `src/app/profile/upgrade/page.tsx` bám sát 1:1 Wireframe SSOT:
    * Thêm bộ chuyển đổi 2 tabs: Tab 1 "Doanh Nghiệp / DN KH&CN" (icon `Building2`), Tab 2 "Viện / Trường / R&D" (icon `Landmark`).
    * Nhánh Doanh nghiệp: Ô nhập MST, nút "Tra cứu MST", ô Tên Doanh nghiệp (auto-fill), khối upload tệp ĐKKD PDF max 10MB.
    * Nhánh Viện/Trường R&D: Ô nhập Số QĐ thành lập / Mã GP KH&CN, ô Tên Viện/Trường, khối upload tệp Quyết định PDF max 10MB.
    * Khối thông tin chung: Lĩnh vực TT17, Sở KH&CN tiếp nhận, Mô tả năng lực TRL 1-9, Checkbox cam kết pháp lý & SHTT.
    * Nút "Hủy Bỏ" và "Nộp Đơn Đăng Ký (SLA 24h)".

- [x] `T-00.88` **[FE] Client-side validation chặn submit khi thiếu MST/QĐ thành lập hoặc file PDF**:
  - [x] Xây dựng logic kiểm tra chặt chẽ phía Client trước khi gửi request:
    * Nếu chọn Doanh nghiệp: Chặn submit khi MST rỗng, sai định dạng 10/13 số, hoặc chưa chọn tệp ĐKKD PDF.
    * Nếu chọn Viện/Trường: Chặn submit khi Số QĐ rỗng, Tên Viện/Trường rỗng, hoặc chưa chọn tệp Quyết định PDF.
    * Kiểm tra dung lượng tệp: Chặn và cảnh báo ngay nếu tệp $> 10$MB hoặc không phải MIME type `application/pdf`.
    * Chặn submit nếu chưa tích cam kết pháp lý & SHTT.
  - [x] Hiển thị trạng thái loading, khóa nút submit và hiển thị spinner trong khi gửi request.

- [x] `T-00.89` **[Test] Vitest + Playwright E2E kiểm thử form nâng cấp Seller mới**:
  - [x] Cập nhật/Bổ sung Unit tests trong `src/app/profile/upgrade/page.test.tsx`:
    * Kiểm chứng chuyển tab Doanh nghiệp $\leftrightarrow$ Viện/Trường hiển thị đúng các trường tương ứng.
    * Kiểm chứng nút Tra cứu MST tự động điền Tên doanh nghiệp.
    * Kiểm chứng validation lỗi khi chọn file $> 10$MB hoặc sai định dạng.
    * Kiểm chứng mock submit gửi đúng cấu trúc `payloadJson` chuẩn `SHOP` mới.
  - [x] Viết kịch bản Playwright E2E mô phỏng hành trình người dùng nộp đơn Seller thành công và nhận mã tracking `REQ-SHOP-...`.

- [x] `T-00.90` **[Gate] Kiểm toán đối soát PostgreSQL thật, xác minh Zero-Mock và nghiệm thu Gate 5**:
  - [x] Đối soát dữ liệu ghi nhận trực tiếp trong bảng `identity.approval_requests` trên CSDL PostgreSQL thật:
    * `request_type = 'SHOP'`.
    * `status = 'PENDING'`.
    * `sla_deadline` đúng mốc thời gian $+24$ giờ.
    * `payload_json` chứa đầy đủ `entityType`, mã định danh pháp nhân, `legalDocUrl`, `legalDocFileName` và không có mock ngầm.
  - [x] Ký biên bản nghiệm thu Quality Gate 5 theo chuẩn hiến pháp NacenTech.

