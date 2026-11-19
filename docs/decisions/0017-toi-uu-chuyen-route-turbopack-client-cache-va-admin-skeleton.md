# 0017. Dùng Turbopack Dev, Client In-Memory TTL Cache Danh Mục & Skeleton Chuyển Route cho Admin

- **Trạng thái**: Chấp nhận
- **Ngày**: 2026-11-11
- **Vùng**: `SourceCode/frontend/` (`TASK-00_PLATFORM_FOUNDATION_VA_COMMON` & `TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN`)
- **Một chiều?**: Không — có thể hoàn tác qua cấu hình `next.config.ts` / `package.json` và xóa bỏ lớp cache in-memory ở `master-data-client.ts` mà không cần migration DB hay sửa API Backend.

## Bối cảnh
Đo đạc thực tế trên môi trường vận hành cho thấy Backend `.NET` (`localhost:5080`) phản hồi nhanh (`11ms – 294ms`), không phải điểm nghẽn chính. Độ trễ `3.00s – 7.38s` khi mở lần đầu các màn hình quản trị xuất phát từ 3 nguyên nhân phía Frontend:
1. `next dev -p 3000` dùng Webpack compile on-demand trên CloudStorage và `next.config.ts` chưa khai báo `experimental.optimizePackageImports` cho `lucide-react`.
2. `NavigationProgress` bọc `setVisible(true)` trong `startTransition`, còn `AdminLayout` thiếu `admin/loading.tsx` và pending workspace skeleton khi click menu, đồng thời `AdminSidebarNav` đọc `window.location.search` thủ công.
3. `master-data-client.ts` gọi `GET /api/v1/sectors` với `cache: "no-store"` ở mọi lần mount trang mà không có TTL cache hay gộp request đồng thời; một số màn hình Admin KPI hiển thị số `0` giả lúc `loading === true`.

## Quyết định
Áp dụng đồng bộ 3 quyết định kiến trúc Frontend (Căn cứ `PO-DEC-20261111-01`, `CR-2026-UIUX-005` và `CR-2026-029`):
1. **Build & Dev Toolchain (`REQ-UI-041`)**: Bật `experimental: { optimizePackageImports: ["lucide-react"] }` trong `SourceCode/frontend/next.config.ts` và sử dụng `next dev --turbopack -p 3000` trong `SourceCode/frontend/package.json` (tương thích Next.js `15.2.1` + `@tailwindcss/postcss` v4).
2. **Client In-Memory TTL Cache + Explicit Invalidation (`REQ-UI-042`, `BR-UI-030`)**: Triển khai cache RAM theo ngữ cảnh trình duyệt (`typeof window !== "undefined"`) với `TTL = 60_000ms` và in-flight Promise deduplication cho `getActiveSectors(options?: { forceRefresh?: boolean })`, kết hợp `invalidateSectorsCache()` được gọi bắt buộc sau mọi thao tác CRUD danh mục tại `/admin/sectors`. Khi API lỗi, tuyệt đối không ghi cache và không trả fallback giả.
3. **Immediate Route Feedback & Zero Fake Zeroes (`REQ-UI-040`, `REQ-ADM-LOAD-01..03`, `BR-ADM-LOAD-01..02`)**: Loại bỏ `startTransition` trong `NavigationProgress`; chuyển `AdminSidebarNav` sang `useSearchParams()` bọc `<React.Suspense>` bên trong `RoleGuard`; thêm `admin/loading.tsx` và pending route transition skeleton dùng chung (`AdminWorkspaceSkeleton`); thay toàn bộ số `0` giả lúc đang tải KPI bằng Shimmer Skeleton (`animate-shimmer`).

## Phương án đã loại
- **Dùng `localStorage` hoặc Cache dài hạn không TTL cho danh mục**: Bị loại do nguy cơ giữ dữ liệu cũ qua nhiều phiên làm việc khi Admin cập nhật danh mục lĩnh vực từ máy khác.
- **Giữ nguyên Webpack dev + không cache phía client**: Bị loại vì không giải quyết được độ trễ compile `3.00s – 7.38s` và lặp request `/api/v1/sectors` khi chuyển qua lại giữa các trang.
- **Đọc `window.location.search` trong `AdminSidebarNav` và bọc `RoleGuard` bên trong skeleton**: Bị loại vì dễ lệch active tab khi client navigation và có nguy cơ lộ khung admin trước khi `RoleGuard` xác thực xong.

## Hệ quả
- **Tích cực**: Phản hồi click chuyển trang đạt tức thì (`<50ms`), giảm tải request trùng lặp tới `/api/v1/sectors`, triệt tiêu nháy số `0` giả trên Admin KPI.
- **Cần theo dõi**: Mọi màn hình mới thực hiện mutation danh mục `sectors` trong tương lai đều phải gọi `invalidateSectorsCache()` hoặc `getActiveSectors({ forceRefresh: true })`; cần xác nhận `next build` và `next dev --turbopack` sạch lỗi ở Đợt 3.
