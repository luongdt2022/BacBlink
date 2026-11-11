# Change Request: CR-2026-UIUX-005 Tối Ưu Tốc Độ Chuyển Route Toàn Trang, Đóng Gói Next.js & Client Cache Danh Mục (PO-DEC-20261111-01)

**CR-ID**: `CR-2026-UIUX-005`  
**Epic**: `TASK-00_PLATFORM_FOUNDATION_VA_COMMON`  
**Status**: `SHIPPED` (Gate 4 & Gate 5 Verified — 2026-11-11)  
**Target Version**: `1.21.0`  
**Author**: Senior BA (`nacen-ba`) / PO (`nacen-po-pm`)  
**Date**: `2026-11-11`  
**Căn cứ pháp lý & Thiết kế cơ sở**:
- Quyết định điều hành `PO-DEC-20261111-01` tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 33.
- Tài liệu Thiết Kế Cơ Sở: `Specification/02_BASIC_DESIGN/TASK-00_PLATFORM_FOUNDATION_VA_COMMON/BD-02-global-shell-navigation.md` Mục 7.
- Hiến pháp Quản trị Đặc tả: `SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md`.

---

### 1. Bối Cảnh & Lý Do Thay Đổi (As-Is vs To-Be)

- **Hiện trạng cũ (As-Is — Đã đối chiếu mã nguồn & đo đạc thực tế)**:
  1. `SourceCode/frontend/src/components/common/navigation-progress.tsx` đang bọc `setVisible(true)` và `setProgress(25)` bên trong `startTransition(() => ...)` với độ cao thanh tiến trình `h-[2px]`. Khi Next.js thực hiện compile/nạp route chậm (`3.00s – 7.38s` lần đầu trên môi trường CloudStorage), trạng thái `visible` bị trì hoãn bởi transition khiến người dùng không nhận được phản hồi tức thì khi click liên kết.
  2. `SourceCode/frontend/next.config.ts` chưa khai báo `experimental.optimizePackageImports` cho thư viện biểu tượng lớn `lucide-react`, và `SourceCode/frontend/package.json` chạy `"dev": "next dev -p 3000"` qua Webpack on-demand compile.
  3. `SourceCode/frontend/src/lib/master-data-client.ts` gọi `getOptions("/api/v1/sectors")` với `{ cache: "no-store" }` mỗi lần các trang/component mount, chưa có bộ nhớ đệm ngắn hạn phía Client (TTL cache) và chưa gộp các cuộc gọi đồng thời (in-flight deduplication).
- **Đề xuất mới (To-Be)**:
  1. Kích hoạt `NavigationProgress` ngay tại thời điểm click liên kết nội bộ (`<50ms`), loại bỏ trì hoãn qua `startTransition`, nâng độ rõ nét hiển thị và bảo đảm `CLS = 0`.
  2. Cấu hình `experimental.optimizePackageImports: ["lucide-react"]` trong `next.config.ts` và bật Turbopack trong dev script (`package.json`).
  3. Triển khai in-memory TTL cache + in-flight request deduplication cho `getActiveSectors()` trong `src/lib/master-data-client.ts`, kèm cơ chế `forceRefresh` và hàm `invalidateSectorsCache()` gọi ngay khi Admin CRUD danh mục tại `/admin/sectors`.
  4. Khóa chặt **Zero Logic Regression & Freshness Guarantee (`BR-UI-030`)**: Bảo toàn 100% route links, API contract `/api/v1/sectors`, và đảm bảo dữ liệu danh mục luôn tươi mới ngay sau khi Admin chỉnh sửa.

---

### 2. Các Điểm Neo Nghiệp Vụ & Kỹ Thuật Bất Biến (Immutable Anchors)

#### [ADD] `REQ-UI-040`: Global Route Transition Progress Phản Hồi Tức Thì
Hệ thống Frontend MUST nâng cấp `NavigationProgress` tại `SourceCode/frontend/src/components/common/navigation-progress.tsx`:
1. Khi người dùng click vào liên kết nội bộ hợp lệ (khác `pathname` hoặc `search` hiện tại, không phải `#hash`, `mailto:`, `tel:`, `_blank` hay modifier key), thanh tiến trình MUST chuyển `visible = true` và `progress > 0` ngay lập tức (`<50ms`), **tuyệt đối không** trì hoãn cập nhật trạng thái hiển thị qua `startTransition`.
2. Thanh tiến trình hiển thị rõ ràng, độ tương phản tốt trên đỉnh viewport (`fixed top-0 left-0 right-0 z-[9999]`), không làm dịch chuyển bố cục (`CLS = 0`).
3. Tự động hoàn tất lên `100%` và ẩn đi mượt mà khi `pathname` hoặc `searchParams` cập nhật xong.

#### [ADD] `REQ-UI-041`: Tối Ưu Đóng Gói & Môi Trường Phát Triển Next.js (Dev/Build Optimization)
Hệ thống Frontend MUST tối ưu cấu hình build và dev server:
1. Tại `SourceCode/frontend/next.config.ts`: Bổ sung `experimental: { optimizePackageImports: ["lucide-react"] }` nhằm giảm chi phí biên dịch và kích thước bundle của thư viện icon trên mọi route.
2. Tại `SourceCode/frontend/package.json`: Cập nhật script `"dev"` sử dụng Turbopack (`next dev --turbopack -p 3000`) để rút ngắn thời gian compile từng route khi điều hướng menu.

#### [ADD] `REQ-UI-042`: Client In-Memory Master-Data Cache & Deduplication
Hệ thống Frontend MUST nâng cấp `SourceCode/frontend/src/lib/master-data-client.ts`:
1. Áp dụng **In-memory TTL cache** và **in-flight request deduplication** cho `getActiveSectors(options?: { forceRefresh?: boolean })`: nhiều component cùng mount đồng thời chỉ phát sinh tối đa 1 HTTP `GET /api/v1/sectors`, và các lần gọi kế tiếp trong khoảng TTL được phục vụ từ cache RAM mà không gọi mạng dư thừa.
2. Cung cấp hàm `invalidateSectorsCache()` để xóa ngay cache in-memory hiện tại.
3. Kết nối gọi `invalidateSectorsCache()` tại các thao tác CRUD danh mục lĩnh vực (Tạo mới, Cập nhật, Kích hoạt/Vô hiệu hóa, Xóa) trong `SourceCode/frontend/src/app/admin/sectors/page.tsx`.

#### [ADD] `BR-UI-030`: Zero Logic Regression & Freshness Guarantee
1. **Bảo toàn 100% Route Links & Navigation**: Giữ nguyên toàn bộ đường dẫn `href` công khai và nội bộ hiện hữu, không làm gãy liên kết hay hành vi bỏ qua link ngoại tuyến/tab mới của `NavigationProgress`.
2. **Bảo toàn Hợp Đồng API**: Giữ nguyên endpoint `GET /api/v1/sectors`, cấu trúc `ApiEnvelope<MasterDataOption[]>` và chuẩn lọc dữ liệu hợp lệ; không trả về dữ liệu giả khi API lỗi (`rejects.toThrow()`).
3. **Đảm bảo Tính Tươi Mới Dữ Liệu (Freshness Guarantee)**: Khi `forceRefresh: true` được truyền hoặc ngay sau khi `invalidateSectorsCache()` được kích hoạt bởi Admin CRUD tại `/admin/sectors`, lần gọi `getActiveSectors()` tiếp theo MUST truy vấn dữ liệu mới nhất từ Backend API thay vì trả về bản cache cũ.

#### [ADD] `TEST-UI-030`: Kiểm Thử Unit, Cache Invalidation & Benchmark Build
Hệ thống MUST bổ sung và pass 100% các kiểm thử chứng minh:
1. **Vitest Component & SDK Tests**:
   - `src/components/common/navigation-progress.test.tsx`: Xác nhận hiển thị `role="progressbar"` tức thì ngay trong frame click (không bị trễ transition), bỏ qua external/hash/`_blank`, và ẩn sau khi route đổi.
   - `src/lib/master-data-client.test.ts`: Kiểm chứng cache hit trong TTL, in-flight deduplication (nhiều lời gọi song song chỉ `fetch` 1 lần), `forceRefresh` bỏ qua cache, `invalidateSectorsCache()` xóa sạch cache, và vẫn reject khi API lỗi.
2. **Build & Benchmark Verification**:
   - `npm run build` (`next build`) thành công 100% với `0` lỗi TypeScript/Next.js.
   - Ghi nhận benchmark đối chiếu thời gian phản hồi/compile route trước và sau tối ưu.

---

### 3. Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)

- **`AC-CR-UIUX-005.1` (Immediate Progress Feedback)**: Click liên kết nội bộ kích hoạt thanh `NavigationProgress` (`role="progressbar"`) ngay lập tức (`<50ms`, không qua `startTransition`) và không gây dịch chuyển giao diện (`CLS = 0`).
- **`AC-CR-UIUX-005.2` (Next.js Optimization)**: `next.config.ts` có `optimizePackageImports: ["lucide-react"]`; `package.json` có script dev dùng Turbopack; `next build` hoàn tất sạch 100%.
- **`AC-CR-UIUX-005.3` (TTL Cache & Deduplication)**: Gọi `getActiveSectors()` nhiều lần đồng thời hoặc liên tiếp trong TTL chỉ gửi 1 request `/api/v1/sectors`.
- **`AC-CR-UIUX-005.4` (Cache Invalidation & Force Refresh)**: Sau khi Admin tạo/sửa/xóa lĩnh vực tại `/admin/sectors` (hoặc gọi với `forceRefresh: true`), cache được làm mới và trả về dữ liệu cập nhật từ API.
- **`AC-CR-UIUX-005.5` (Zero Regression)**: 100% test suite hiện hữu của `navigation-progress.test.tsx`, `master-data-client.test.ts` và các màn hình tiêu thụ `getActiveSectors()` đều PASS.

---

### 4. Ma Trận Tác Động Đa Bề Mặt (Cross-Surface Impact Matrix)

| STT | Bề Mặt / Tệp Tin | Bản Chất Thay Đổi Kỹ Thuật | Trách Nhiệm |
| :---: | :--- | :--- | :---: |
| **1** | `Specification/02_BASIC_DESIGN/TASK-00_.../BD-02-global-shell-navigation.md` | Bổ sung Mục 7 (`PO-DEC-20261111-01`) về Global Route Progress và tối ưu hiệu năng Client. | **ĐÃ HOÀN TẤT (PO/BA)** |
| **2** | `SourceCode/specs/TASK-00_.../deltas/CR-2026-UIUX-005_route_transition_and_client_perf.md` & `spec.md` | Khởi tạo Delta Ledger và append `Spec Delta v19` với các mã neo `REQ-UI-040..042`, `BR-UI-030`, `TEST-UI-030`. | **ĐÃ HOÀN TẤT (BA)** |
| **3** | `SourceCode/frontend/src/components/common/navigation-progress.tsx` | Kích hoạt `NavigationProgress` tức thì tại click, loại bỏ `startTransition`, cải thiện độ rõ nét hiển thị, `CLS = 0`. | **ĐÃ HOÀN TẤT (Đợt 2 — Gate 3/4/5 PASS)** |
| **4** | `SourceCode/frontend/next.config.ts` & `SourceCode/frontend/package.json` | Thêm `experimental.optimizePackageImports: ["lucide-react"]` và bật `--turbopack` cho dev script. | **ĐÃ HOÀN TẤT (Đợt 3 — Gate 3/4/5 PASS)** |
| **5** | `SourceCode/frontend/src/lib/master-data-client.ts` | Bổ sung TTL cache, in-flight deduplication, `forceRefresh` và `invalidateSectorsCache()`. | **ĐÃ HOÀN TẤT (Đợt 3 — Gate 3/4/5 PASS)** |
| **6** | `SourceCode/frontend/src/app/admin/sectors/page.tsx` | Gọi `invalidateSectorsCache()` sau các thao tác CRUD danh mục lĩnh vực. | **ĐÃ HOÀN TẤT (Đợt 3 — Gate 3/4/5 PASS)** |
| **7** | `SourceCode/frontend/src/components/common/navigation-progress.test.tsx`, `src/lib/master-data-client.test.ts` & `src/test/setup.ts` | Cập nhật và chạy Vitest + benchmark chứng minh phản hồi tức thì, cache hit/invalidate và `next build` sạch. | **ĐÃ HOÀN TẤT (Đợt 2-4 — Gate 4/5 PASS)** |
| **8** | Backend .NET & CSDL PostgreSQL (`SourceCode/backend/`) | **NGOÀI PHẠM VI** (Backend đã phản hồi `11ms–294ms`, không đổi API/DB). | **N/A** |

---

### 5. Tiêu Chuẩn Nghiệm Thu Cổng Chất Lượng (Quality Gate Criteria)

1. **Gate 1 (BA & Scope Sign-off)**: Đã đồng bộ Basic Design Mục 33 / `BD-02` Mục 7, hoàn tất Delta Ledger `CR-2026-UIUX-005` và `Spec Delta v19` với mã neo duy nhất toàn cục.
2. **Gate 2 (SA Architecture Alignment)**: SA thẩm định cơ chế cache TTL/dedup không gây rò rỉ dữ liệu cũ giữa các phiên CRUD và cấu hình `next.config.ts` an toàn khi production build.
3. **Gate 3 (Dev Pre-flight & Code Review)**: Code TypeScript sạch `0` lỗi (`tsc --noEmit`), bảo toàn 100% API contracts và các route links hiện hữu.
4. **Gate 4 (QC Verification & Zero-Mock)**: Vitest pass 100%, `next build` pass 100%, đo benchmark thực tế xác nhận phản hồi chuyển trang tức thì và cache hoạt động chính xác.
5. **Gate 5 (PO DoD Sign-off)**: PO nghiệm thu thực tế trên trình duyệt sống (`localhost:3000` + `5080`) trước khi đóng Delta.
