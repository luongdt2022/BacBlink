# Technical Plan: TASK-00 Platform Foundation & Common Architecture

**Feature**: `TASK-00_PLATFORM_FOUNDATION_VA_COMMON`  
**Spec Reference**: [`spec.md`](./spec.md)  
**Status**: Ready for Implementation  

---

## 1. Kiến Trúc Kỹ Thuật (Architecture Design)

Hệ thống Backend được tổ chức theo mô hình **Modular Monolith** với Clean Architecture:

```text
SourceCode/
├── backend/
│   ├── apps/
│   │   └── api/                     # Host Web API, Program.cs, Middleware, Swagger
│   ├── config/                      # appsettings.json, logging, cors
│   ├── modules/                     # Các module nghiệp vụ độc lập
│   │   ├── identity/                # Ánh xạ TASK-07 (Admin, IAM, Auth)
│   │   ├── technology/              # Ánh xạ TASK-04 (Seller & Bộ lọc)
│   │   ├── demand/                  # Ánh xạ TASK-03 (Buyer nhu cầu)
│   │   ├── expert/                  # Ánh xạ TASK-05 (Chuyên gia KH&CN)
│   │   └── master-data/             # Ánh xạ TASK-06 (Ngành TT17 & Ma trận)
│   ├── packages/                    # Thư viện dùng chung nội bộ
│   │   ├── kernel/                  # Domain primitives: Result, Error, Entity
│   │   ├── persistence/             # EF Core base DbContext, Interceptors
│   │   ├── contracts/               # Shared DTOs, Event interfaces
│   │   └── test-kit/                # Fixtures, test doubles, mock helpers
│   ├── infra/                       # Docker compose, DB scripts
│   └── NacenTech.slnx               # Solution file
└── frontend/                        # Dành cho UI Web / App (gắn Submodule sau)
```

---

## 2. API Contract & Response Wrapper Standard

Mọi response API trả về client đều tuân thủ hợp đồng chung (Contract-First):

### Thành công:
```json
{
  "isSuccess": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-09-25T09:50:00Z"
}
```

### Thất bại (RFC 7807 ProblemDetails):
```json
{
  "isSuccess": false,
  "data": null,
  "error": {
    "code": "ENTITY_NOT_FOUND",
    "message": "Không tìm thấy bản ghi yêu cầu.",
    "details": [
      { "field": "id", "issue": "Giá trị ID không hợp lệ." }
    ]
  },
  "timestamp": "2026-09-25T09:50:00Z"
}
```

---

## 3. Database Schema & Infrastructure Configuration

### Cấu hình Docker Compose (`backend/docker-compose.yml`):
- Service `postgres`: Image `postgres:16-alpine`, port `5432:5432`, volume persist `pgdata`.
- Service `redis`: Image `redis:7-alpine`, port `6379:6379` (caching & distributed lock).

### Audit Interceptor trong `packages/persistence`:
- Tự động bắt sự kiện `SavingChanges` để điền:
  - `CreatedAtUtc = DateTime.UtcNow`
  - `UpdatedAtUtc = DateTime.UtcNow`
  - `CreatedBy = currentUser.Id`
  - `UpdatedBy = currentUser.Id`

---

## 4. Chiến Lược Kiểm Thử (Testing Strategy)

1. **Unit Test (xUnit / FluentAssertions)**:
   - Test `Result<T>`: Success state, Failure state, null safety, error aggregation.
   - Test `AuditableEntity`: Kiểm tra gán Id, so sánh equality dựa trên Id.
2. **Integration Test**:
   - Khởi chạy Test Container PostgreSQL để kiểm chứng migration và `DbContextBase`.

---

## Plan Delta v2: Thiết Kế Kỹ Thuật 3D Scoped RBAC Foundation

### 1. Database Schema Delta (Non-destructive Migration)
Mở rộng bảng `identity.persons` trong PostgreSQL:
- Bổ sung cột:
  - `scope_type`: `VARCHAR(20) NOT NULL DEFAULT 'GLOBAL'`
  - `scope_id`: `VARCHAR(50) NULL`
- Tạo index hỗ trợ tìm kiếm theo phạm vi:
  `CREATE INDEX idx_persons_scope ON identity.persons (scope_type, scope_id);`
- Chiến lược tương thích ngược (Backward Compatibility): Mọi bản ghi hiện có tự động mang `scope_type = 'GLOBAL'` và `scope_id = NULL`.

### 2. Domain & Application Contracts
- Trong `packages/kernel/Application/ICurrentActor.cs`:
  - Mở rộng hằng số `PlatformRoles` với 10 vai trò hạt nhân (`SuperAdmin`, `OperatorAdmin`, `ProvincialAdmin`, `SectorAdmin`, `ClusterAdmin`, `Seller`, `Buyer`, `InnovationEntity`, `VerifiedExpert`, `PublicUser`).
  - Thêm class hằng số `ScopeTypes` (`Global`, `Province`, `Sector`, `OrgUnit`).
  - Mở rộng interface `ICurrentActor` với `string ScopeType { get; }` và `string? ScopeId { get; }`.
- Trong `modules/identity/Domain/Person.cs`:
  - Thêm property `ScopeType` và `ScopeId`.
  - Bổ sung phương thức `AssignRoleAndScope(string platformRole, string scopeType, string? scopeId)`.

### 3. JWT Token Issuer & Claims Extraction
- Trong `modules/identity/Infrastructure/JwtTokenIssuer.cs`:
  - Thêm claim `"scope_type"` và `"scope_id"` vào token payload.
- Trong `apps/api/Infrastructure/HttpCurrentActor.cs`:
  - Trích xuất claim `scope_type` và `scope_id` để cung cấp cho `ICurrentActor`.

### 4. Policy Engine Decision Table Rule Update
- Trong `config/policies/authorization-rules.v1.json`:
  - Đăng ký nhận diện các role mới, đảm bảo `SUPER_ADMIN` và `OPERATOR_ADMIN` có toàn quyền điều phối tương đương `ADMIN` hiện hữu.

### 5. Hợp đồng vòng đời account cần hội tụ

`platform_role` lưu đúng 10 role hạt nhân theo `spec.md`; `GUEST` chỉ là trạng thái anonymous, còn `USER`/`ADMIN` chỉ phục vụ tương thích dữ liệu cũ. Luồng kỹ thuật bắt buộc gồm: public registration → `PUBLIC_USER` active → request/approval profile nếu cần → atomic assign role + scope → audit → login trả role/scope thật. Tầng 0–1 chỉ được provision qua API quản trị có authorization/audit; không thêm role vào public register request. API/DTO provision, validation scope-role và migration dữ liệu legacy là phần mở, phải được contract-first trước khi code.

---

## Plan Delta v3: Kiến Trúc Chi Tiết Frontend Common Kit (`SourceCode/frontend/`)

### 1. Cấu Trúc Thư Mục Thành Phần Dùng Chung
```text
SourceCode/frontend/src/
├── components/
│   ├── common/
│   │   ├── dialog.tsx             # Modal popup đa năng có backdrop & animation
│   │   ├── confirm-modal.tsx      # Modal xác nhận hành vi nguy hiểm / gửi duyệt
│   │   ├── toast.tsx              # Toast Notification Provider & useToast() hook
│   │   ├── theme-provider.tsx     # Context Dark/Light Theme & useTheme()
│   │   ├── theme-toggle.tsx       # Nút chuyển đổi Theme kèm icon Mặt trời/Mặt trăng
│   │   ├── fontsize-control.tsx   # Bộ nút chỉnh cỡ chữ (A- / A / A+)
│   │   ├── i18n-provider.tsx      # Context Đa ngôn ngữ (VI / EN) & useI18n()
│   │   ├── navbar.tsx             # Header điều hướng cố định + Auth + Tiện ích
│   │   └── footer.tsx             # Footer thông tin cơ quan Bộ KH&CN
│   └── ui/
│       └── async.tsx              # 5 trạng thái UX (Loading, Empty, Error, Success, Partial)
├── app/
│   ├── layout.tsx                 # Bọc ThemeProvider, I18nProvider, ToastProvider, Navbar, Footer
│   ├── error.tsx                  # Global Next.js Error Boundary bắt lỗi runtime
│   └── globals.css                # Biến màu CSS variables hỗ trợ .dark class & font scale
```

### 2. Thiết Kế Kỹ Thuật Từng Thành Phần

- **`toast.tsx`**:
  - `ToastType = 'success' | 'error' | 'warning' | 'info'`
  - Function: `toast.success(message, title?)`, `toast.error(message, title?)`, v.v.
  - Vị trí: `fixed bottom-5 right-5 z-50` kèm animation trượt `translate-y-0` và tự động tắt sau 3500ms.

- **`theme-provider.tsx`**:
  - State: `theme = 'light' | 'dark'`.
  - Effect: Đồng bộ class `dark` trên `document.documentElement` và lưu `localStorage.setItem('nacentwin_theme', theme)`.

- **`fontsize-control.tsx`**:
  - Scale: `sm` (87.5%), `base` (100%), `lg` (112.5%).
  - Effect: Đồng bộ style `fontSize` trên thẻ `<html>` hoặc gán dataset `data-font-scale`.

- **`i18n-provider.tsx`**:
  - Ngôn ngữ: `vi` (Tiếng Việt - Mặc định), `en` (Tiếng Anh).
  - Cung cấp hàm dịch: `t(key)` lấy chuỗi theo key từ từ điển dùng chung.

- **`dialog.tsx` & `confirm-modal.tsx`**:
  - Nhận props: `isOpen: boolean`, `onClose: () => void`, `title: string`, `children: ReactNode`.
  - Hỗ trợ ESC key listener, focus trap và animation `fade-in-scale`.

---

## Plan Delta v4: Thiết Kế Kỹ Thuật 4 Cổng Trỏ Đường Dẫn (Path-Based Role Portals)

### 1. Kiến Trúc Thư Mục Next.js 15 App Router
```text
SourceCode/frontend/src/
├── lib/
│   ├── auth-client.ts             # Bổ sung getRedirectPathByRole(role) & hasPermission(user, requiredTiers)
│   └── route-guard.ts             # Danh sách whitelist quyền hạn theo từng path prefix
├── components/
│   ├── auth/
│   │   └── role-guard.tsx         # Component bọc bảo vệ Route theo Role Tier
│   └── portal/
│       ├── portal-sidebar.tsx     # Sidebar cho Cổng Doanh nghiệp & Chuyên gia
│       ├── gov-header.tsx         # Header chứa ScopeBadge cho Cổng Quản lý 63 tỉnh
│       └── admin-sidebar.tsx      # Sidebar Quản trị Tối cao cho Super Admin
├── app/
│   ├── page.tsx                   # [Cổng 1: Đại Chúng /] - Marketplace tra cứu công khai
│   ├── (auth)/
│   │   ├── login/page.tsx         # Trang Login tự động redirect theo Role
│   │   └── register/page.tsx
│   ├── portal/                    # [Cổng 2: /portal/*] - Dành cho Seller, Buyer, Expert
│   │   ├── layout.tsx             # Portal Layout có Sidebar & Navigation B2B
│   │   └── page.tsx               # Hub không gian làm việc thị trường
│   ├── gov/                       # [Cổng 3: /gov/*] - Dành cho 63 Sở KH&CN & 18 Ngành TT17
│   │   ├── layout.tsx             # Gov Layout có Scope Badge & SLA Tracker
│   │   └── page.tsx               # Hàng đợi thẩm định phân cấp
│   └── admin/                     # [Cổng 4: /admin/*] - Dành cho Super Admin & Operator
│       ├── layout.tsx             # Admin Layout bảo mật cấp cao
│       └── page.tsx               # Tổng hành dinh điều phối toàn quốc
```

### 2. Thuật Toán Phân Giải Đường Dẫn Theo Vai Trò (`getRedirectPathByRole`)
```typescript
export function getRedirectPathByRole(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "OPERATOR_ADMIN":
    case "ADMIN":
      return "/admin";
    case "PROVINCIAL_ADMIN":
    case "SECTOR_ADMIN":
    case "CLUSTER_ADMIN":
      return "/gov";
    case "SELLER":
    case "BUYER":
    case "INNOVATION_ENTITY":
    case "VERIFIED_EXPERT":
    case "EXPERT":
      return "/portal";
    case "PUBLIC_USER":
    case "GUEST":
    default:
      return "/";
  }
}
```

### 3. Cơ Chế Role-Based Route Guarding
- Component `<RoleGuard allowedTiers={["TIER_0", "TIER_1"]} fallbackPath="/login">` bảo vệ từng Layout.
- Nếu không có token $\rightarrow$ Chuyển về `/login`.
- Nếu có token nhưng role không thuộc `allowedTiers` $\rightarrow$ Hiển thị màn hình 403 Forbidden kèm nút quay về Cổng được phân quyền.

---

## Plan Delta v5: Identity lifecycle contract-first

```text
Public Web register ──POST /api/v1/auth/register──► PUBLIC_USER/active/GLOBAL
                                                          │
                                                          ▼
                                                     POST /login ──► JWT(role, scope_type, scope_id) ──► portal route

Authorized admin ──POST /api/v2/identity/provisioned-accounts──► Person(role, scope)
Authorized admin ──PUT /api/v2/identity/persons/{id}/role-scope──► atomic assignment + audit SUCCESS
```

**Files/ownership:** Kernel owns canonical role/scope validation; Identity application owns lifecycle and re-checks policy; API v2 only maps DTO/HTTP; v1 registration/login remains compatible facade; frontend never submits privileged role/scope on public registration. Existing migration `ScopedMultiTierRbac` is sufficient; no schema change is introduced.

**API contracts:** provision request requires `email`, `password`, `firstName`, `platformRole`, `scopeType`; optional profile fields, scopeId and `isActive` (default true). Assignment request requires exactly `platformRole`, `scopeType`, optional `scopeId`. Both return `PersonDto` with real role/scope and v2 Problem Details on validation/authorization error.

**Test plan:** authorization unit tests cover canonical pairs; PostgreSQL integration creates fresh identities, tests public register/login and all 10 provision/login/JWT/audit paths; Vitest parameterizes all 10 frontend redirect routes and checks public registration payload excludes role/scope.

---

## Plan Delta v6: Menu tài khoản và đăng xuất Web Portal

**Phạm vi:** Frontend-only. Không thay đổi schema, migration, API hay policy. `authClient.clearSession()` là điểm dùng chung để xóa access token và user context cục bộ sau xác nhận.

**Thành phần và trách nhiệm:**

- `src/components/common/navbar.tsx`: quản lý trạng thái mở/đóng menu tài khoản, điều hướng Settings và yêu cầu logout; hỗ trợ click ngoài, `Escape`, `aria-expanded` và cùng hành vi trong menu hẹp.
- `src/app/settings/page.tsx`: tái sử dụng `ConfirmModal`, `useToast` và `authClient.clearSession()` cho hành động logout tại Settings.
- `src/components/common/navbar.test.tsx` và `src/app/settings/page.test.tsx`: xác minh menu, hủy/xác nhận logout, xóa session và điều hướng.

**Tương thích ngược:** LocalStorage key và redirect đích `/` không đổi; không có dữ liệu CSDL để migrate. Header chỉ đổi trình bày cho người dùng đã đăng nhập; người dùng chưa đăng nhập giữ nguyên đường đi hiện tại.

**UX 5 trạng thái:** Không có gọi API. Normal là menu đóng/mở; Cancel là giữ phiên; Success là toast + redirect; Error/Partial không áp dụng vì clear session là thao tác local đồng bộ.

---

## Plan Delta v9: Cổng Đăng Ký Nâng Cấp Vai Trò (Upgrade Hub `/profile/upgrade` 4 Lộ Trình)

**Phạm vi:** Frontend Web Portal (`TASK-00` / `TASK-07`), kết nối API thẩm định `approval_requests` (`TASK-07`), khảo sát nhu cầu (`TASK-03`), wizard chuyên gia (`TASK-05`).

### 1. Kiến Trúc Trang `src/app/profile/upgrade/page.tsx`
- Xóa bỏ hoàn toàn lệnh `redirect("/profile/upgrade/expert")`.
- Triển khai Component Client `ProfileUpgradeHubPage` tích hợp:
  - Header Hero Banner giới thiệu Hệ Thống Phân Cấp & Thẩm Quyền 3D Scoped RBAC.
  - Lưới 4 Thẻ Lộ Trình (Upgrade Cards):
    1. **Chuyên Gia KH&CN**: Liên kết `/profile/upgrade/expert` (SLA 48h).
    2. **Doanh Nghiệp ĐMST**: Trigger Modal Kê khai MST, tra cứu tự động, tệp ĐKKD, chọn Sở KH&CN tiếp nhận, gửi `approval_requests` loại `INSTITUTION`.
    3. **Bên Mua (Buyer)**: Liên kết trực tiếp vào Phiếu Khảo Sát Sâu DNNVV 7 Bước `/khao-sat-nhu-cau`.
    4. **Bên Bán (Seller)**: Trigger Modal Đăng ký Mở Gian Hàng Seller, chọn ngành TT17 và Sở KH&CN quản lý địa bàn, gửi `approval_requests` loại `SHOP` (SLA 24h).
  - Bảng ma trận đối soát tiêu chuẩn hồ sơ & SLA giữa 4 vai trò.
- Cập nhật Sidebar trong `src/app/portal/layout.tsx`: Chuyển liên kết của `PUBLIC_USER` sang `/profile/upgrade`.

### 2. Thiết Kế 5 Trạng Thái UX (<Async>)
- **Loading**: Skeleton placeholder khi tải thông tin tài khoản người dùng (`authClient.getStoredSession()`).
- **Empty / Ready**: 4 thẻ hiển thị đầy đủ thông tin, điều kiện, quyền lợi và nút CTA hành động.
- **Submitting (Updating)**: Spinner và disable nút submit khi đang gửi hồ sơ thẩm định hoặc tra cứu MST.
- **Success**: Modal feedback / Toast thông báo nộp hồ sơ thành công kèm mã phiếu thẩm định (ví dụ `REQ-INST-*`, `REQ-SHOP-*`).
- **Error**: Hiển thị thông báo lỗi rõ ràng nếu thiếu trường bắt buộc hoặc vi phạm định dạng MST/tệp đính kèm.



---

## Plan Delta v10 (CR-2026-TYPO): Kiến Trúc Typography Cổng DVCQG (Nunito Sans & Lora) [PO-DEC-20261015-01]

### 1. Bối Cảnh & Mục Tiêu Kỹ Thuật (Architecture Context & Objectives)
- Căn cứ Quyết định PO: **`PO-DEC-20261015-01`** và Mục 10 Spec Delta v2 tại `spec.md`.
- Thay thế hoàn toàn cơ chế nạp font local `be-vietnam-pro` đơn điệu bằng **Kiến Trúc Font Song Hành (Dual Font Architecture)** chuẩn Cổng DVCQG và Cổng Đổi Mới Sáng Tạo Quốc Gia:
  1. **Nunito Sans** (`--font-sans`): Dành cho toàn bộ thân văn bản (Body), điều khiển tương tác (Controls), bảng số liệu (Data Grid), thẻ (Cards), biểu mẫu (Forms). Tiết kiệm 8% - 12% bề ngang ký tự, chống tràn dòng trên màn hình laptop 1024px - 1366px.
  2. **Lora** (`--font-heading`, `--font-serif`): Dành riêng cho Quốc hiệu, Tiêu ngữ, Header Viện/Bộ, Banner quốc gia, Khẩu hiệu Slogan Hero và Tiêu đề phân hệ lớn. Đảm bảo tính uy nghiêm, hàn lâm của cơ quan nhà nước.

---

### 2. Kiến Trúc Tải Font Tối Ưu (Next.js 15 `next/font/google` Zero CLS)

#### 2.1. Cấu hình Nạp Font trong `src/app/layout.tsx`
Khởi tạo 2 font instances từ gói tích hợp `next/font/google`:

```typescript
import { Nunito_Sans, Lora } from "next/font/google";

export const nunitoSans = Nunito_Sans({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
  adjustFontFallback: true,
});

export const lora = Lora({
  subsets: ["vietnamese", "latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-heading",
  adjustFontFallback: true,
});
```

#### 2.2. Cơ chế Zero CLS (Cumulative Layout Shift = 0)
- **Tự động Preload & Tự lưu trữ tĩnh (Build-time Self-hosting)**: Next.js 15 tự động tải file font WOFF2 về thư mục static build tại thời điểm biên dịch (`next build`). Khi runtime phục vụ người dùng, font được nạp trực tiếp từ domain nội bộ, không phụ thuộc kết nối ngoài tới máy chủ Google, triệt tiêu nguy cơ nghẽn mạng hay rủi ro bảo mật dữ liệu công quyền.
- **Tự động Override Font Metrics**: Thuộc tính `adjustFontFallback: true` tự động tính toán `size-adjust`, `ascent-override`, `descent-override`, `line-gap-override` cho font fallback hệ thống (`ui-sans-serif, system-ui` và `ui-serif, Georgia, serif`), triệt tiêu 100% hiện tượng nhảy giật layout (layout shift) khi font đang tải.

#### 2.3. Tích Hợp Thẻ Gốc HTML
```tsx
<html
  lang="vi"
  className={`${nunitoSans.variable} ${lora.variable}`}
  suppressHydrationWarning
>
  <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
    ...
  </body>
</html>
```

---

### 3. Ánh Xạ Design Tokens Trong Tailwind v4 `@theme` (`src/app/globals.css`)

#### 3.1. Cấu hình Tokens Typography
```css
@theme {
  --font-sans: var(--font-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-heading: var(--font-heading), ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-serif: var(--font-heading), ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  
  /* Backward-compatibility fallback */
  --font-be-vietnam-pro: var(--font-sans);
}
```

#### 3.2. Quy Tắc Ánh Xạ Phân Bổ 10 Thành Phần UI Cốt Lõi
1. **Quốc Hiệu, Tiêu Ngữ & Header Viện/Bộ**: `font-heading font-bold` (`Lora`, 20px - 24px, line-height 1.3).
2. **Banner Quốc Gia, Slogan Hero & Display Title**: `font-heading font-bold` (`Lora`, 36px - 44px / 28px - 32px mobile, line-height 1.2).
3. **Menu Điều Hướng Cấp 1 & Dropdown Menu**: `font-sans font-semibold` (`Nunito Sans`, 14px - 15px, line-height 1.4).
4. **Buttons & CTA Controls**: `font-sans font-semibold` (`Nunito Sans`, 14px - 15px, min-height 44px).
5. **Form Inputs, Labels & Helpers**: `font-sans` (`Nunito Sans`, 14px, Label: Medium 500, Input: Regular 400).
6. **Data Grid & Bảng Dữ Liệu Số Liệu**: `font-sans` (`Nunito Sans`, 13px - 14px, Header: SemiBold 600, Cell: Regular 400).
7. **Cards & Sub-Headings**: `font-sans font-semibold` (`Nunito Sans`, 16px - 18px).
8. **Modals & Dialogs**: `font-sans` (`Nunito Sans`, Header: 18px - 20px 600, Body: 14px - 15px 400).
9. **Status Badges, Chips & Micro-Copy**: `font-sans font-semibold` (`Nunito Sans`, 11px - 12px, line-height 1.2).
10. **Footer & Thông Tin Pháp Lý**: `font-sans` (`Nunito Sans`, 13px - 14px, Regular 400 / Medium 500).

---

### 4. Cơ Chế Kiểm Soát Text Scaling A-/A/A+ Bảo Vệ Bố Cục (WCAG 2.1 AA)

#### 4.1. Cấu hình Quy Chuẩn Tỉ Lệ Co Giãn
```css
@layer base {
  /* Nấc A- (Thu nhỏ 92.5%): Tăng mật độ dữ liệu bảng/chuyên gia */
  html[data-text-scale="sm"] {
    font-size: 92.5%;
  }

  /* Nấc A (Mặc định 100%): 1rem = 16px */
  html[data-text-scale="base"],
  html[data-text-scale="md"] {
    font-size: 100%;
  }

  /* Nấc A+ (Phóng to 110%): Hỗ trợ cán bộ cao tuổi & tiếp cận dịch vụ công */
  html[data-text-scale="lg"] {
    font-size: 110%;
  }
}
```

#### 4.2. Ràng Buộc Kỹ Thuật Bảo Vệ Bố Cục (Zero Horizontal Overflow)
- **Đơn vị tương đối**: Tuyệt đối sử dụng `rem`, `em`, `%`, `dvw/dvh` cho margin, padding, gap, font-size và container dimensions. Không gán cứng chiều rộng cố định bằng pixel (`width: 1200px`) trên các container chính.
- **Ràng buộc kiểm thử A+ (110%)**:
  1. `window.scrollX === 0` trên mọi dải phân giải viewport từ 320px đến 4K (ngoại trừ các container bảng `overflow-x: auto` được thiết kế có chủ đích).
  2. Không xảy ra hiện tượng chồng chéo ký tự (overlapping text) hay che khuất nội dung.
  3. Header Navigation tự động ngắt dòng hợp lý hoặc co giãn padding thông minh nhờ font `Nunito Sans` gọn hơn 10%.
- **Vùng chạm tối thiểu**: Duy trì kích thước tương tác $\ge 44 \times 44\text{px}$ cho toàn bộ Buttons, Form Controls và Toggles.

---

### 5. Thẩm Định Gate 2: Rủi Ro & Chiến Lược Kiểm Thử (Gate 2 Architecture Review)

| Hạng Mục | Rủi Ro Kỹ Thuật | Giải Pháp Kiểm Soát Kiến Trúc |
|:---|:---|:---|
| **Hồi quy giao diện (UI Regression)** | Thành phần cũ gọi font cũ hoặc biến cũ bị lỗi font hiển thị | Khai báo alias fallback `--font-be-vietnam-pro: var(--font-sans)` song song trong `@theme`. |
| **Ký tự Tiếng Việt đặc biệt** | Thiếu glyphs tiếng Việt có dấu kép (`ẩ`, `ễ`, `ợ`, `Đ`) dẫn đến lỗi chân dấu | Chỉ định rõ `subsets: ['vietnamese', 'latin']` trên cả 2 cấu hình `Nunito_Sans` và `Lora`. |
| **Tràn viền màn hình khi scale A+** | Header menu hoặc Data Grid bị vỡ nát khi phóng to 110% | Quy chuẩn `overflow-x: clip` trên `html`, `body`; bảng dữ liệu bọc trong wrapper `overflow-x: auto`. |
| **Vi phạm Design Rules** | Vô tình sử dụng lại utility classes blue/indigo/purple hoặc font nhỏ < 12px | Giữ vững hàng rào bảo vệ tự động bằng `src/test/design-rules.test.ts`. |
