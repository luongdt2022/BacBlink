# Change Request: CR-BACLINK-001 Chuẩn Hóa RBAC 3 Cấp, Dual-Mode RoleSwitcher, Thương Hiệu BACLINK & Upgrade Hub 1 Bước

**CR-ID**: `CR-BACLINK-001`  
**Epic**: `TASK-00_PLATFORM_FOUNDATION_VA_COMMON`  
**Status**: `APPROVED` (Batch `P0-B3` — 2026-11-17)  
**Target Version**: `1.23.0`  
**Author**: Senior BA (`nacen-ba`) / Phê duyệt: PO (`nacen-po-pm`)  
**Date**: `2026-11-17`  
**Căn cứ pháp lý & Kiến trúc**:
- `Specification/BASIC_DESIGN_BACLINK.md` (Mục 1, 2, 9.2: `PO-DEC-BACLINK-01`, `PO-DEC-BACLINK-02`, `PO-DEC-BACLINK-03`).
- `SourceCode/backend/docs/decisions/ADR-0018-BACLINK-3-TIER-RBAC-AND-CONTENT-REFACTOR.md` (Mục 2.1, 2.2, 2.3).
- `SourceCode/docs/open-questions.md` (Q1 — Giữ nghiêm ngặt 3 cấp trong JWT, không tạo role thứ 4 cho Ban Cố vấn).
- `SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md`.

---

### 1. Bối Cảnh & Lý Do Thay Đổi (As-Is vs To-Be)

- **Hiện trạng cũ (As-Is)**:
  1. `PlatformRoles` (`ICurrentActor.cs`), `authorization-rules.v1.json` và `auth-client.ts` đang vận hành theo mô hình **10 roles / 4 cấp** kèm `ScopeTypes` (`GLOBAL`, `PROVINCE`, `SECTOR`, `ORG_UNIT`), ép buộc tài khoản quản trị/duyệt gắn Sở KH&CN 34 tỉnh.
  2. `RoleSwitcher` (`src/components/common/role-switcher.tsx:86`) ghi đè `user.role = targetRole` (`'BUYER'` hoặc `'SELLER'`) vào `localStorage`, làm mất vai trò gốc chuẩn hóa và gây rủi ro xung đột với `RoleGuard`.
  3. `Navbar` (`navbar.tsx`), `Footer` (`footer.tsx`) và `i18n-provider.tsx` đang mang thương hiệu `NacenTech` / `NacenTwin` / `Bộ KH&CN` cùng địa chỉ Hà Nội.
  4. Upgrade Hub (`src/app/profile/upgrade/page.tsx`) chia 4 lộ trình nâng cấp tách biệt (`VERIFIED_BUYER`, `VERIFIED_SELLER`, `INNOVATION_ENTITY`, `EXPERT`) và bắt buộc chọn Sở KH&CN (`enterpriseAuthority = "HN"`).

- **Đề xuất mới (To-Be)**:
  1. Thu gọn RBAC hệ thống về đúng **3 cấp duy nhất**: `ADMIN` (Ban Quản trị Hiệp hội BACLINK), `ENTERPRISE` (Doanh nghiệp Hội viên Dual-Mode `BUYER` + `SELLER`), `PUBLIC_USER` (Khách / Đối tác đã đăng nhập); thống nhất `ScopeTypes.Global` (`scopeId = null`). Giữ adapter `PlatformRoles.NormalizeTier` và đánh dấu `[Obsolete]` các role legacy để tương thích ngược token đang lưu hành.
  2. Tài khoản `PUBLIC_USER` / `ENTERPRISE` có hồ sơ Ban Cố vấn Kỹ thuật (`ExpertProfile Status = APPROVED`) truy cập không gian cố vấn qua kiểm tra `ExpertProfile`, **tuyệt đối không** tạo role JWT thứ 4 (`open-questions.md` Q1).
  3. Sửa `RoleSwitcher`: giữ nguyên `user.role = 'ENTERPRISE'`, chỉ cập nhật `activeRole` (`'BUYER' | 'SELLER'`) trong `nacentwin_active_role` và API `switchEnterpriseActiveRole`.
  4. Chuyển đổi toàn diện Navbar, Footer, i18n sang thương hiệu **Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)** (QĐ 1652/QĐ-UBND, trụ sở Số 7 đường Lý Thái Tổ, P. Suối Hoa, TP. Bắc Ninh, 7 menu công nghiệp Bắc Ninh).
  5. Rút gọn Upgrade Hub (`/profile/upgrade`) thành **1 luồng Đăng ký Doanh nghiệp Hội viên BACLINK** gửi thẳng hàng đợi duyệt 1 cấp của `ADMIN` (tự động cấp `ENTERPRISE` + `CapabilityTier = "DUAL"` khi được duyệt).

---

### 2. Ma Trận Tác Động Đa Bề Mặt & Liên Epic (Cross-Surface & Cross-Epic Impact Matrix)

| Bề mặt / Thành phần | Tệp Nguồn Chính | Hiện Trạng (As-Is) | Thay Đổi Cần Làm (To-Be) |
| :--- | :--- | :--- | :--- |
| **Backend Kernel & Policies** | `packages/kernel/Application/ICurrentActor.cs`, `config/policies/authorization-rules.v1.json` | 10 roles + ép `ScopeTypes` theo role | Chuẩn hóa 3 role `ADMIN`, `ENTERPRISE`, `PUBLIC_USER`; `NormalizeTier()`; `ScopeTypes.Global` mặc định; giữ alias legacy `[Obsolete]`. |
| **Backend Identity / Auth / Enterprise** | `modules/identity/*`, `modules/enterprise/Application/EnterpriseService.cs`, `V1Compat/AuthController.cs` | `ApproveEnterpriseAsync` kiểm tra `MatchProvinceScope`; `DUAL` chỉ cho `INNOVATION_ENTITY` | Bỏ `MatchProvinceScope` theo `Actor.ScopeId`; `ADMIN` duyệt 1 bước cấp `ENTERPRISE` + `DUAL` (`IsBuyer = true, IsSeller = true`). |
| **Frontend Auth & RoleSwitcher** | `src/lib/auth-client.ts`, `src/components/auth/role-guard.tsx`, `src/components/common/role-switcher.tsx` | `ROLES` 10 cấp, route `/gov`; `RoleSwitcher` ghi đè `user.role` | Chuẩn hóa `ROLES` 3 cấp + normalize helper; bỏ route `/gov` khỏi `getRedirectPathByRole`; `RoleSwitcher` giữ nguyên `user.role = 'ENTERPRISE'`, chỉ đổi `activeRole`. |
| **Frontend Branding & Navigation** | `src/components/common/navbar.tsx`, `footer.tsx`, `i18n-provider.tsx`, `src/app/layout.tsx` | Thương hiệu `NacenTwin`/`NacenTech`/`Bộ KH&CN` | Chuyển 100% sang **BACLINK** (QĐ 1652/QĐ-UBND, TP. Bắc Ninh), cấu trúc 7 menu công nghiệp Bắc Ninh, 0 chữ thương hiệu cũ. |
| **Frontend Upgrade Hub** | `src/app/profile/upgrade/page.tsx`, `src/app/profile/upgrade/page.test.tsx` | 4 lộ trình tách rời Buyer/Seller/DN ĐMST/Chuyên gia + chọn Sở KH&CN | Gộp còn 1 luồng **Đăng ký Doanh nghiệp Hội viên BACLINK** (gửi `ADMIN` duyệt 1 cấp, chọn Địa bàn/KCN Bắc Ninh); giữ đầu vào phụ trợ đăng ký Ban Cố vấn nếu cần nhưng không tạo role JWT thứ 4. |
| **Consuming Epics** | `TASK-01`, `TASK-02`, `TASK-03`, `TASK-04`, `TASK-05`, `TASK-07`, `TASK-08`, `TASK-09`, `TASK-10`, `TASK-11` | Tham chiếu 10 roles & branding cũ | Đồng bộ tiêu thụ `ADMIN`/`ENTERPRISE`/`PUBLIC_USER`, `ScopeTypes.Global` và nhãn BACLINK. |

---

### 3. Chi Tiết Thay Đổi Quy Chuẩn (Immutable Anchors)

- **[ADD] `REQ-BACLINK-RBAC-001` (Chuẩn Hóa RBAC 3 Cấp & `ScopeTypes.Global`)**:
  - Hệ thống định danh chỉ sử dụng 3 cấp `PlatformRoles` chính thức: `ADMIN`, `ENTERPRISE`, `PUBLIC_USER` (cùng khách vãng lai chưa đăng nhập).
  - Toàn bộ tài khoản ở cả 3 cấp sử dụng `ScopeType = ScopeTypes.Global` và `ScopeId = null`.
  - Cung cấp `PlatformRoles.NormalizeTier(role)` ở Backend và helper tương ứng ở `auth-client.ts` để ánh xạ tương thích ngược token/DB cũ mà không làm gián đoạn phiên hợp lệ.
- **[ADD] `REQ-BACLINK-RBAC-002` (Tách Bạch `user.role` và `activeRole` Tại `RoleSwitcher`)**:
  - `RoleSwitcher` (`src/components/common/role-switcher.tsx`) MUST giữ nguyên `user.role === "ENTERPRISE"` trong `localStorage` và `UserContext` khi chuyển đổi chế độ Bên Mua (`BUYER`) ↔ Bên Bán (`SELLER`).
  - Trạng thái Dual-Mode chỉ lưu tại `activeRole` (`nacentwin_active_role` + `EnterpriseProfile.ActiveRole`) và phát sự kiện `nacentwin_role_switched`.
- **[ADD] `REQ-BACLINK-NAV-001` (Thương Hiệu, Navbar 7 Menu, Footer & i18n BACLINK)**:
  - `Navbar`, `Footer` và `i18n-provider.tsx` (VI/EN) MUST hiển thị nhận diện **BACLINK — Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh** (QĐ 1652/QĐ-UBND, Số 7 Lý Thái Tổ, P. Suối Hoa, TP. Bắc Ninh), cấu trúc 7 Menu công nghiệp Bắc Ninh (Trang chủ, Giới thiệu, Sự kiện, Sản phẩm & Năng lực, Nhu cầu Mua & Đặt hàng, Doanh nghiệp Hội viên, Cố vấn – Đào tạo – Dịch vụ).
- **[ADD] `REQ-BACLINK-UPG-001` (Upgrade Hub 1 Bước Gia Nhập Hội Viên BACLINK)**:
  - `/profile/upgrade` cung cấp 1 luồng nâng hạng cốt lõi **Đăng ký Doanh nghiệp Hội viên BACLINK** (MST, tên DN, Địa bàn/KCN Bắc Ninh, tệp ĐKKD, cam kết), gửi thẳng hàng đợi duyệt 1 cấp của `ADMIN`. Khi được duyệt, tài khoản chuyển sang `ENTERPRISE` với `CapabilityTier = "DUAL"` (`IsBuyer = true`, `IsSeller = true`).
- **[ADD] `BR-BACLINK-RBAC-001` (Không Tạo Role JWT Thứ 4 Cho Ban Cố Vấn)**:
  - Theo quyết định Q1 (`open-questions.md`), cố vấn kỹ thuật sử dụng `PUBLIC_USER` hoặc `ENTERPRISE` gắn bản ghi `ExpertProfile (Status = APPROVED)`; không thêm role mới vào `PlatformRoles` hay JWT claim.
- **[ADD] `BR-BACLINK-RBAC-002` (Bảo Toàn IDOR Isolation Giữa Các `ENTERPRISE`)**:
  - Mọi `ENTERPRISE` có quyền thao tác cả Bên Mua và Bên Bán trên tài nguyên thuộc `PersonId` / `OrganizationId` của chính mình; tuyệt đối chặn truy cập/sửa tài nguyên của `ENTERPRISE` khác (`403 Forbidden`).
- **[ADD] `BR-BACLINK-BRAND-001` (Zero Brand Leakage)**:
  - Không còn chuỗi hiển thị `NacenTech`, `NacenTwin`, `Bộ KH&CN`, `34 Sở KH&CN` trên UI `Navbar`, `Footer`, `i18n` và metadata HTML.
- **[ADD] `TEST-BACLINK-001` (Kiểm Chứng RBAC 3 Cấp, RoleSwitcher & Branding)**:
  - Unit & Integration tests cho `PlatformRoles.NormalizeTier`, `ScopeTypes.IsValidForRole`, `RoleSwitcher` (không ghi đè `user.role`), `Navbar`/`Footer` BACLINK, và `/profile/upgrade` 1 bước.

---

### 4. Tiêu Chuẩn Chấp Thuận (Acceptance Criteria)

- **`AC-CR-BACLINK-001.1`**: Đăng nhập bằng tài khoản `ADMIN`, `ENTERPRISE`, `PUBLIC_USER` trả về `scopeType = "GLOBAL"` và điều hướng lần lượt về `/admin`, `/portal`, `/` (không còn điều hướng sang `/gov`).
- **`AC-CR-BACLINK-001.2`**: Bấm chuyển `BUYER` ↔ `SELLER` trên `RoleSwitcher` cập nhật `activeRole` và sidebar Portal ngay lập tức, nhưng `authClient.getUser().role` vẫn giữ nguyên `"ENTERPRISE"`.
- **`AC-CR-BACLINK-001.3`**: `Navbar`, `Footer`, `i18n-provider.tsx` hiển thị đầy đủ nhận diện BACLINK (VI/EN), không còn chuỗi `NacenTech` / `NacenTwin` / `Bộ KH&CN`.
- **`AC-CR-BACLINK-001.4`**: `PUBLIC_USER` nộp hồ sơ tại `/profile/upgrade` không cần chọn Sở KH&CN; khi `ADMIN` duyệt, DN nhận đồng thời `ENTERPRISE` + `DUAL` (`BUYER` + `SELLER`).
- **`AC-CR-BACLINK-001.5`**: Token cũ mang `SUPER_ADMIN` / `OPERATOR_ADMIN` được normalize an toàn sang `ADMIN`; `dotnet test` và `vitest` đạt PASS 100%.
