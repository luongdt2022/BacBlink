# Change Request: CR-2026-029 Phản Hồi Chuyển Route Quản Trị, Đồng Bộ Sidebar SearchParams & Chuẩn Hóa KPI Skeleton (/admin/*)

**CR-ID**: `CR-2026-029`  
**Epic**: `TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN`  
**Status**: `SHIPPED` (Gate 4 & Gate 5 Verified — 2026-11-11)  
**Target Version**: `1.15.0`  
**Author**: Senior BA (`nacen-ba`) / PO (`nacen-po-pm`)  
**Date**: `2026-11-11`  
**Căn cứ pháp lý & Thiết kế cơ sở**:
- Quyết định điều hành `PO-DEC-20261111-01` tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 33.
- Tài liệu Thiết Kế Cơ Sở: `Specification/02_BASIC_DESIGN/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN/README.md` Mục 8.3.
- Hiến pháp Quản trị Đặc tả: `SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md`.

---

### 1. Bối Cảnh & Lý Do Thay Đổi (As-Is vs To-Be)

- **Hiện trạng cũ (As-Is — Đã đối chiếu mã nguồn & đo đạc thực tế)**:
  1. Thư mục `SourceCode/frontend/src/app/admin/` chưa có tệp `loading.tsx`, và `AdminLayout` tại `SourceCode/frontend/src/app/admin/layout.tsx` chưa hiển thị pending route transition skeleton trong vùng main workspace khi người dùng click chuyển chức năng trên `AdminSidebarNav`. Hệ quả là màn hình cũ đứng im `3.00s – 7.38s` trong lần truy cập đầu (cold compile).
  2. `AdminSidebarNav` trong `src/app/admin/layout.tsx` đọc `tab` từ `window.location.search` thay vì `useSearchParams()`, dẫn tới rủi ro không đồng bộ trạng thái active giữa `/admin/approvals`, `?tab=sla` và `?tab=override` khi điều hướng client-side.
  3. Các trang quản trị hiển thị giá trị `0` giả hoặc text rời rạc trên các thẻ KPI trong lúc `loading === true` lần đầu trước khi API trả về:
     - `src/app/admin/users/page.tsx`: Hiển thị `{total}`, `{activeCount}`, `{lockedCount}`, `{officersCount}` (khởi tạo `0`) trên 4 KPI Cards khi `loading === true`.
     - `src/app/admin/page.tsx`: Hiển thị chuỗi text `"Đang tải..."` trên các thẻ KPI và `"Không có hồ sơ chờ"` trên banner hàng đợi khi `loading === true`.
     - `src/app/admin/assessments/tt17/page.tsx`: Hiển thị `dashboard?.totalAssessments ?? 0`, `dashboard?.avgTotalScore ?? 0`, `dashboard?.avgSyncCoefficient ?? 0`, `pct = "0.0"` trên 4 KPI Cards khi `loading === true`.
- **Đề xuất mới (To-Be)**:
  1. Bổ sung `src/app/admin/loading.tsx` và trạng thái pending route transition skeleton tại `AdminLayout` khi click điều hướng trên `AdminSidebarNav`.
  2. Chuẩn hóa `AdminSidebarNav` sử dụng `useSearchParams()` bọc trong `<Suspense>` thay cho `window.location.search`.
  3. Chuẩn hóa Shimmer Skeleton (`animate-shimmer` đồng bộ `<Async>`) trên các thẻ KPI của `/admin/users`, `/admin` và `/admin/assessments/tt17` khi `loading === true`, nghiêm cấm hiển thị số `0` giả.
  4. Bảo toàn 100% `RoleGuard` (`SUPER_ADMIN`, `OPERATOR_ADMIN`, `ADMIN`) và 5 UX States `<Async>`.

---

### 2. Các Điểm Neo Nghiệp Vụ & Kỹ Thuật Bất Biến (Immutable Anchors)

#### [ADD] `REQ-ADM-LOAD-01`: Admin Route Transition Loading & Pending Workspace Skeleton
Hệ thống Frontend Admin MUST cung cấp phản hồi chuyển route tức thì tại vùng workspace chính:
1. Tạo mới `SourceCode/frontend/src/app/admin/loading.tsx` hiển thị bố cục Shimmer Skeleton (`animate-shimmer`) chuẩn Design System (Header + 4 KPI Skeleton Cards + Content Skeleton) cho Next.js App Router Suspense boundary dưới `/admin/*`.
2. Cập nhật `AdminLayout` tại `SourceCode/frontend/src/app/admin/layout.tsx` để khi người dùng click vào một item khác trên `AdminSidebarNav`, vùng main workspace lập tức hiển thị pending route transition skeleton (kèm trạng thái active tức thì trên mục được chọn) cho đến khi route mới render hoàn tất.

#### [ADD] `REQ-ADM-LOAD-02`: Sidebar Active Tab Synchronization qua `useSearchParams()`
`AdminSidebarNav` trong `SourceCode/frontend/src/app/admin/layout.tsx` MUST:
1. Thay thế việc đọc `window.location.search` bằng hook `useSearchParams()` của `next/navigation`, được bọc trong `<React.Suspense>` an toàn cho Next.js build/SSR.
2. Đồng bộ tức thì trạng thái active giữa 3 mục thuộc nhóm Phê Duyệt Toàn Quốc:
   - `/admin/approvals` (khi không có `tab` hoặc `tab=all`).
   - `/admin/approvals?tab=sla` (khi `tab=sla`).
   - `/admin/approvals?tab=override` (khi `tab=override`).

#### [ADD] `REQ-ADM-LOAD-03`: Admin KPI Loading Skeleton Đồng Bộ Chuẩn `<Async>`
Các màn hình quản trị gồm `src/app/admin/users/page.tsx`, `src/app/admin/page.tsx`, và `src/app/admin/assessments/tt17/page.tsx` MUST:
1. Khi `loading === true` (trong lần tải dữ liệu đầu tiên trước khi có phản hồi từ API), toàn bộ các thẻ KPI (và vùng tóm tắt số liệu phụ thuộc API như badge hàng đợi tại `/admin`) MUST hiển thị Shimmer Skeleton (`animate-shimmer`, `aria-busy="true"`).
2. Giữ nguyên kích thước khung thẻ KPI tương ứng giữa trạng thái skeleton và trạng thái dữ liệu thật nhằm bảo đảm `CLS = 0`.

#### [ADD] `BR-ADM-LOAD-01`: Zero Fake Zeroes (Cấm Hiển Thị Số `0` Giả Khi Đang Tải)
1. Trong trạng thái `loading === true` của lần tải dữ liệu đầu tiên trước khi API phản hồi, **NGHIÊM CẤM** hiển thị con số `0`, `"0.0%"`, `"0 / 34"` hoặc thông điệp mang tính kết luận rỗng như `"Không có hồ sơ chờ"` trên các KPI Cards / Quick Action Banner của `/admin/users`, `/admin`, `/admin/assessments/tt17`.
2. Số `0` chỉ được phép hiển thị sau khi API đã phản hồi hoàn tất (`loading === false`) và dữ liệu thực tế từ PostgreSQL bằng `0`.

#### [ADD] `BR-ADM-LOAD-02`: Zero Regression Trên `RoleGuard` & 5 UX States `<Async>`
1. Bảo toàn tuyệt đối cơ chế bảo vệ phân quyền `RoleGuard` với `allowedRoles={["SUPER_ADMIN", "OPERATOR_ADMIN", "ADMIN"]}` trong `AdminLayout` — trạng thái pending transition hoặc `admin/loading.tsx` tuyệt đối không làm rò rỉ nội dung admin khi chưa qua `RoleGuard`.
2. Bảo toàn trọn vẹn 5 UX States (`loading`, `empty`, `error`, `success`, `submitting`/`partial`) qua `<Async>` trên toàn bộ các trang `/admin/*`, cùng các bộ lọc, phân trang và hành động CRUD hiện hữu.

#### [ADD] `TEST-ADM-LOAD-01`: Bộ Kiểm Thử Vitest & Playwright E2E Thật Cho Admin Loading & KPI Skeleton
Hệ thống MUST xây dựng và thực thi kiểm thử đa tầng đạt 100% PASS:
1. **Vitest Component & Integration Tests**:
   - `src/app/admin/layout.test.tsx`: Kiểm chứng pending route transition skeleton khi click menu trên `AdminSidebarNav`, kiểm chứng đồng bộ active tab `/admin/approvals`, `?tab=sla`, `?tab=override` qua `useSearchParams()`, và kiểm chứng giữ nguyên `RoleGuard`.
   - `src/app/admin/users/page.test.tsx` và test tương ứng cho `/admin` & `/admin/assessments/tt17`: Kiểm chứng khi `loading === true` thì hiển thị Shimmer Skeleton và **không** render số `0` giả trên KPI Cards; sau khi API resolve thì hiển thị số liệu thật.
2. **Playwright E2E (Live Server `localhost:3000` + `5080`)**:
   - Kiểm chứng điều hướng qua các mục trên `AdminSidebarNav` hiển thị phản hồi chuyển route tức thì, active tab đồng bộ đúng, không xuất hiện số `0` giả lúc đang nạp dữ liệu, và Visual QA sạch layout trên Desktop/Mobile.

---

### 3. Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)

- **`AC-CR-029.1` (`admin/loading.tsx` & Pending Transition)**: Tồn tại `src/app/admin/loading.tsx` với Shimmer Skeleton; khi click chuyển mục trên `AdminSidebarNav`, vùng workspace của `AdminLayout` hiển thị ngay trạng thái skeleton chuyển trang mà không giữ màn hình cũ đứng im.
- **`AC-CR-029.2` (Sidebar Tab Sync)**: Click chuyển giữa `/admin/approvals`, `/admin/approvals?tab=sla`, `/admin/approvals?tab=override` làm nổi bật chính xác duy nhất 1 mục đang chọn thông qua `useSearchParams()` bọc `<Suspense>`.
- **`AC-CR-029.3` (KPI Shimmer Skeleton)**: Trên `/admin/users`, `/admin`, `/admin/assessments/tt17`, khi API chưa trả về (`loading === true`), các thẻ KPI hiển thị `animate-shimmer` skeleton ổn định chiều cao (`CLS = 0`).
- **`AC-CR-029.4` (Zero Fake Zeroes)**: Trong lúc `loading === true`, không hiển thị giá trị `0`, `0 / 34`, `0.0%` hay `"Không có hồ sơ chờ"` trên các thẻ KPI; chỉ hiển thị số liệu thật sau khi fetch hoàn tất.
- **`AC-CR-029.5` (RoleGuard & Async Integrity)**: `RoleGuard` (`SUPER_ADMIN`, `OPERATOR_ADMIN`, `ADMIN`) và 5 UX States `<Async>` hoạt động nguyên vẹn, không suy giảm test cũ.
- **`AC-CR-029.6` (Vitest & Playwright E2E Pass)**: 100% Vitest tests liên quan và Playwright E2E trên server sống đạt PASS, `next build` thành công `0` lỗi.

---

### 4. Ma Trận Tác Động Đa Bề Mặt (Cross-Surface Impact Matrix)

| STT | Bề Mặt / Tệp Tin | Bản Chất Thay Đổi Kỹ Thuật | Trách Nhiệm |
| :---: | :--- | :--- | :---: |
| **1** | `Specification/02_BASIC_DESIGN/TASK-07_.../README.md` | Bổ sung Mục 8.3 (`PO-DEC-20261111-01`) về Admin Route Transition Loading, `useSearchParams()` và KPI Skeleton. | **ĐÃ HOÀN TẤT (PO/BA)** |
| **2** | `SourceCode/specs/TASK-07_.../deltas/CR-2026-029_admin_route_loading_and_kpi_skeleton.md` & `spec.md` | Khởi tạo Delta Ledger và append `Spec Delta v16` với mã neo `REQ-ADM-LOAD-01..03`, `BR-ADM-LOAD-01..02`, `TEST-ADM-LOAD-01`. | **ĐÃ HOÀN TẤT (BA)** |
| **3** | `SourceCode/frontend/src/app/admin/loading.tsx` & `src/components/admin/admin-workspace-skeleton.tsx` | Tạo mới App Router Loading Skeleton cho phân hệ `/admin/*`. | **ĐÃ HOÀN TẤT (Đợt 2 — Gate 3/4/5 PASS)** |
| **4** | `SourceCode/frontend/src/app/admin/layout.tsx` | Bổ sung pending route transition skeleton khi chuyển menu và chuyển `AdminSidebarNav` sang `useSearchParams()` bọc `Suspense`. | **ĐÃ HOÀN TẤT (Đợt 2 — Gate 3/4/5 PASS)** |
| **5** | `SourceCode/frontend/src/app/admin/users/page.tsx` | Thay thế KPI `0` lúc `loading === true` bằng Shimmer Skeleton chuẩn `<Async>`. | **ĐÃ HOÀN TẤT (Đợt 4 — Gate 3/4/5 PASS)** |
| **6** | `SourceCode/frontend/src/app/admin/page.tsx` | Thay thế text `"Đang tải..."` / `"Không có hồ sơ chờ"` lúc `loading === true` bằng Shimmer Skeleton. | **ĐÃ HOÀN TẤT (Đợt 4 — Gate 3/4/5 PASS)** |
| **7** | `SourceCode/frontend/src/app/admin/assessments/tt17/page.tsx` | Thay thế KPI `?? 0` / `"0.0%"` lúc `loading === true` bằng Shimmer Skeleton. | **ĐÃ HOÀN TẤT (Đợt 4 — Gate 3/4/5 PASS)** |
| **8** | `SourceCode/frontend/src/app/admin/layout.test.tsx`, `users/page.test.tsx`, `page.test.tsx`, `assessments/tt17/page.test.tsx`, `e2e/admin-cr2026-029-loading-kpi.spec.ts` | Bổ sung và thực thi kiểm thử Vitest + Playwright E2E thật xác nhận Zero Fake Zeroes, Sidebar tab sync & pending loading. | **ĐÃ HOÀN TẤT (Đợt 2 & 4 — Gate 4/5 PASS)** |
| **9** | Backend .NET & CSDL PostgreSQL (`SourceCode/backend/`) | **NGOÀI PHẠM VI** (Không thay đổi API, DTO hay Migration). | **N/A** |

---

### 5. Tiêu Chuẩn Nghiệm Thu Cổng Chất Lượng (Quality Gate Criteria)

1. **Gate 1 (BA & Scope Sign-off)**: Đã đồng bộ Basic Design Mục 33 / `TASK-07/README.md` Mục 8.3, hoàn tất Delta Ledger `CR-2026-029` và `Spec Delta v16` với mã neo duy nhất toàn cục.
2. **Gate 2 (SA Architecture Alignment)**: SA thẩm định `Suspense` boundary quanh `useSearchParams()`, cơ chế clear pending state khi route đổi (kể cả khi click lại hoặc route lỗi/redirect), và bảo toàn `RoleGuard`.
3. **Gate 3 (Dev Pre-flight & Code Review)**: TypeScript `0` lỗi, không chứa mock ngầm, tuân thủ Design System `animate-shimmer`.
4. **Gate 4 (QC Verification & Zero-Mock)**: Vitest 100% Pass, Playwright E2E trên trình duyệt sống + backend PostgreSQL thật xác nhận KPI skeleton, không nháy số `0` giả, sidebar tab sync tức thì và Visual QA $\ge 8.0/10$.
5. **Gate 5 (PO DoD Sign-off)**: PO nghiệm thu thực tế trên trình duyệt sống trước khi đóng Delta.
