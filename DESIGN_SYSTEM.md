# NacenTech UI Design System

Áp dụng bắt buộc khi tạo mới hoặc sửa giao diện trong `src/`. Không dùng mã màu tùy ý hoặc lớp màu Tailwind ngữ nghĩa chung (`bg-blue-*`, `bg-indigo-*`, `bg-slate-*`) cho hành động thương hiệu nếu đã có token tương ứng dưới đây.

## 1. Nền tảng màu

| Vai trò | Token | Màu | Được dùng cho |
| --- | --- | --- | --- |
| Navy thương hiệu | `brand-700` | `#3C5999` | Header, hero, điều hướng active, sidebar, hành động hệ thống chính |
| Navy hover | `brand-800` | `#30477A` | Hover/pressed của hành động Navy |
| Emerald NacenTech | `nacen-green-500` | `#2D9A85` | CTA chuyển đổi: đăng ký, gửi yêu cầu, tư vấn, tìm kiếm nổi bật |
| Emerald hover | `nacen-green-600` | `#258B78` | Hover/pressed của CTA Emerald |
| Cyan công nghệ | `innovation-500` | `#06B6D4` | Icon, badge, nhãn AI/công nghệ, focus ring; không dùng làm primary button đại trà |
| Nền trang | `surface-page` | `#F8FAFC` | Nền mặc định của ứng dụng |
| Nền section phụ | `surface-subtle` | `#F7F9FC` | Section xen kẽ, footer sáng |
| Card | `white` | `#FFFFFF` | Card, form, modal ở light mode |
| Chữ chính/phụ | `text-primary` / `text-secondary` | `#0F172A` / `#64748B` | Nội dung, label và mô tả |
| Border | `border-default` | `#E2E8F0` | Border card, input, bảng |

Màu trạng thái chỉ biểu đạt trạng thái, không dùng trang trí: `status-success` (xong/thành công), `status-warning` (cảnh báo/chờ xử lý), `status-danger` (lỗi/xóa), `status-info` (thông tin).

## 2. Quy tắc nền và bề mặt

Navy cập nhật theo ảnh màu PO gửi ngày 29/09/2026: ảnh có profile Display P3, chuyển sang sRGB cho CSS được `#3C5999`. Hero giữ nền gốc này; theo yêu cầu tiếp theo của PO, được phủ minh họa khoa học tương phản thấp ở hai bên và phía dưới, chừa khoảng thoáng cho chữ. Màu hover là bậc tối cùng tông, không lấy từ ảnh.

Asset hero: `public/innovation-hero-background.png`, tạo bằng công cụ image generation tích hợp. Brief: nền Navy #3C5999, mạng lưới nghiên cứu, vi mạch, bóng đèn đổi mới, nguyên tử và DNA bằng nét xanh nhạt; khoảng giữa trống, không chữ/logo/UI. Lớp trang trí `aria-hidden`, không nhận tương tác, giảm độ đậm trên mobile.

- Toàn trang dùng `surface-page`; section xen kẽ dùng `surface-subtle`; card/form/modal light mode dùng trắng.
- Hero và khu điều hướng chính dùng Navy. CTA marketing lớn dùng Emerald hoặc gradient Emerald cùng tông.
- Không dùng gradient nhiều màu ngoài trường hợp Hero/CTA đã được thiết kế; không dùng Indigo/Purple như màu thương hiệu.
- Dark mode: nền `slate-950`, card `slate-900`, border `slate-800`; Navy/Emerald vẫn giữ vai trò semantic như light mode.

## 3. Button và trạng thái tương tác

Luôn ưu tiên `AppButton` từ `src/components/ui/design-system.tsx`:

| Variant | Khi dùng | Default → hover |
| --- | --- | --- |
| `primary` | Lưu, tiếp tục, mở màn hệ thống, hành động chính trong nghiệp vụ | `brand-700` → `brand-800` |
| `cta` | Đăng ký, gửi yêu cầu, tư vấn, tìm kiếm hoặc chuyển đổi | `nacen-green-500` → `nacen-green-600` |
| `outline` | Hành động phụ | white/border slate → `brand-50`, viền brand |
| `ghost` | Toolbar, thao tác ít ưu tiên | trong suốt → `slate-100` |
| `danger` | Xóa, hủy không thể hoàn tác | `status-danger` → đỏ đậm |

- Mỗi vùng chỉ có một primary action rõ ràng. Không đặt Navy và Emerald cùng là primary trong một cụm.
- Disabled: `opacity-50`, không tương tác, không đổi sang màu thương hiệu khác.
- Hover phải tối hơn hoặc có nền rõ hơn default; focus dùng vòng Cyan để đảm bảo truy cập bằng bàn phím.
- Link văn bản: Navy, hover underline hoặc Navy đậm hơn. Không dùng Emerald cho link điều hướng thường.

## 4. Typography và khoảng cách

Hệ thống áp dụng **Kiến Trúc Font Song Hành (Dual Font Architecture)** chuẩn Cổng Dịch Vụ Công Quốc Gia và Cổng Đổi Mới Sáng Tạo Quốc Gia (theo Quyết định PO `PO-DEC-20261015-01`):
1. **Nunito Sans** (`--font-sans`): Tải qua `next/font/google` (weights: 400/500/600/700/800, `subsets: ['vietnamese', 'latin']`, `display: swap`). Sử dụng cho toàn bộ nội dung thân văn bản (Body), điều khiển tương tác (Buttons, Controls), bảng số liệu (Data Grid), biểu mẫu (Forms), thẻ (Cards) và footer. Cắt giảm 8%–12% bề ngang ký tự, chống tràn dòng trên laptop 1024px–1366px.
2. **Lora** (`--font-heading`, `--font-serif`): Tải qua `next/font/google` (weights: 600/700, `subsets: ['vietnamese', 'latin']`, `display: swap`). Dành riêng cho Quốc hiệu, Tiêu ngữ, Header Viện/Bộ, Banner quốc gia, Khẩu hiệu Slogan Hero và Tiêu đề phân hệ lớn (`type-hero`, `type-page-title`, `type-section-title`).
3. **Tương thích ngược**: CSS token `--font-be-vietnam-pro: var(--font-sans)` được duy trì để đảm bảo các component hiện có không bị lỗi font.

### Bảng Ánh Xạ 10 Nhóm Thành Phần UI Cốt Lõi

| STT | Nhóm Thành Phần UI | Token / Class | Font Family | Kích Thước (Desktop / Mobile) | Weight & Line Height | Mục Đích Sử Dụng |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **Quốc Hiệu, Tiêu Ngữ & Header Viện/Bộ** | `font-heading` | Lora | 20px–24px / 18px–20px | 700 / 1.3 | Header Quốc gia, tên cơ quan chủ quản |
| 2 | **Banner Quốc Gia, Slogan Hero & Display Title** | `type-hero font-heading` | Lora | 44px–48px / 32px | 700 / 1.15–1.2 | Khẩu hiệu Hero Banner Cổng Quốc Gia, Tiêu đề lớn Trang Chủ |
| 3 | **Tiêu Đề Trang Chính & Phân Hệ** | `type-page-title` / `type-section-title` | Lora | 30px–36px / 24px–28px | 700 / 1.25–1.33 | Tiêu đề trang chính, Tiêu đề Section |
| 4 | **Menu Điều Hướng & Dropdown** | `text-label font-sans` | Nunito Sans | 14px–15px / 14px | 600 / 1.4 | Menu Header cấp 1, Dropdown links, Nav links |
| 5 | **Buttons & CTA Controls (`AppButton`, `AppLink`)** | `text-label font-sans min-h-11` | Nunito Sans | 14px–15px / 14px | 600 / min-height 44px | Nút bấm thao tác, CTA chuyển đổi |
| 6 | **Form Inputs, Labels & Helpers** | `form-control font-sans` | Nunito Sans | 14px / 14px (Input: 16px mobile) | Label: 500, Input: 400 | Trường nhập liệu biểu mẫu, Select, Textarea |
| 7 | **Data Grid & Bảng Dữ Liệu Số Liệu** | `text-xs / text-sm font-sans` | Nunito Sans | 13px–14px / 12px | Header: 600, Cell: 400 | Danh bạ công nghệ, chuyên gia, giao dịch |
| 8 | **Cards & Sub-Headings** | `text-card-title font-sans` | Nunito Sans | 16px–18px / 16px | 600–700 / 1.35 | Tiêu đề Card giải pháp, Nhu cầu, Bước wizard |
| 9 | **Status Badges, Chips & Micro-Copy** | `text-caption font-sans` | Nunito Sans | 11px–12px / 11px | 600 / 1.2 | Huy hiệu trạng thái, Tag lĩnh vực TT17, TRL |
| 10 | **Footer & Thông Tin Pháp Lý** | `text-caption / text-label font-sans` | Nunito Sans | 13px–14px / 12px | 400–500 / 1.5 | Thông tin bản quyền, liên hệ, chính sách |

### Quy Chuẩn Cỡ Chữ và Text Scaling (WCAG 2.1 AA)

- Cụm điều khiển tiếp cận tại Header kích hoạt thuộc tính `data-text-scale` trên thẻ `<html>`:
  - **Nấc A- (Thu nhỏ 92.5%)**: `html[data-text-scale="sm"] { font-size: 92.5%; }` — Phục vụ chuyên gia phân tích và quản trị viên tăng mật độ thông tin.
  - **Nấc A (Chuẩn 100%)**: `html[data-text-scale="base"]`, `html[data-text-scale="md"] { font-size: 100%; }` — Cỡ chữ chuẩn mực ($1\text{rem} = 16\text{px}$).
  - **Nấc A+ (Phóng to 110%)**: `html[data-text-scale="lg"] { font-size: 110%; }` — Hỗ trợ cán bộ cao tuổi, nhà khoa học theo chuẩn tiếp cận công vụ.
- **Ràng buộc Zero Horizontal Overflow**: Tuyệt đối không xuất hiện cuộn ngang (`window.scrollX === 0` từ 320px đến 4K) khi scale A+. Dùng `rem`, `%`, `dvw` cho kích thước container.
- **Vùng chạm tối thiểu**: Tối thiểu $44 \times 44\text{px}$ cho toàn bộ các nút bấm và phần tử tương tác (`min-h-11 min-w-11`).
- **Hỗ trợ Tiếng Việt trọn vẹn**: Cả hai font nhúng tập ký tự `vietnamese`, bảo toàn các dấu tầng kép (`ẩ`, `ẫ`, `ệ`, `ỗ`, `ợ`, `Đ`).

## 5. Common components bắt buộc

- Dùng `AppButton` và `SectionHeading` thay vì tự đặt màu button/heading mới.
- Dùng `AppLink` cho link có hình thức button; chia sẻ cùng variants, kích thước, hover và focus với `AppButton`.
- Dùng `form-control` cho input/select/textarea (trừ checkbox/radio): chữ 16px, tối thiểu 44px, viền và focus thống nhất, có dark/disabled. Checkbox/radio dùng `accent-brand-700 focus-ring`.
- Banner workspace dùng `workspace-banner`: Navy và họa tiết khoa học cùng trang chủ. Không đưa họa tiết vào nền bảng/form để tránh gây nhiễu.
- `cn()` phải nhận biết `text-caption/label/body/body-lg/card-title` là font-size, không phải text-color. Test bảo vệ tại `src/components/ui/design-system.test.tsx`.
- `src/test/design-rules.test.ts` chặn các utility blue/indigo/purple cũ và chữ 9–11px trong UI, áp dụng cả màn mới.
- Dùng `surface-card`, `page-container`, `focus-ring` từ `globals.css`.
- Header dùng hàng thương hiệu/công cụ và hàng menu riêng ở desktop ≥1024px, menu được wrap. Dưới 1024px dùng menu thu gọn; dưới 640px đưa đăng nhập/đăng ký vào menu. Không che tràn bằng overflow-x-hidden.
- Màn gọi API phải dùng `<Async>` với đủ Loading, Empty, Error, Success và Partial theo `speckit-uiux`.
- `TRLBadge` và `SectorTag` khi được dùng phải theo semantic state; không gán màu tùy ý.

## 6. Checklist trước khi merge

### Áp dụng trên trang chủ

- Hero và Trợ lý AI dùng cùng `brand-700`; không khai báo màu hex riêng trong trang.
- Tìm kiếm, đăng ký và tư vấn dùng Emerald; link footer và tab chọn dùng Navy.
- Icon ngành chỉ dùng Navy/Emerald. Vàng/đỏ dành cho trạng thái thực tế.
- Nội dung chính nền trắng; danh sách và footer dùng `surface-subtle`.
- Chữ Emerald trên trắng dùng `nacen-green-700`; dark mode dùng `nacen-green-200`. Navy trên nền tối dùng `brand-200`.
- Phạm vi ban đầu: trang chủ và header/footer chung; focus ring dùng chung. Đợt rollout tiếp theo đã áp dụng tới các màn hiện có (xem `UI_ROLLOUT.md`). API/DTO, domain, DB, nội dung và dữ liệu không đổi.

- Không còn màu hard-code hoặc `blue/indigo` làm button thương hiệu mới.
- Navy/Emerald/Cyan đúng vai trò; màu trạng thái không bị dùng làm màu thương hiệu.
- Có default, hover, focus, disabled cho mọi action.
- Typography, line-height, button height và spacing đúng bảng trên.
- Kiểm tra Light/Dark, desktop 1440px và mobile 390px.
- Typography còn phải kiểm tra 1280px và cả A−/A/A+: font thực sự tải, không có cuộn ngang, nội dung không bị cắt.

### Phạm vi áp dụng typography 29/09/2026

| Bề mặt | Tác động |
| --- | --- |
| Trang chủ | Áp dụng scale heading/body, ngắt dòng responsive và input 16px |
| Common/root layout | Tải font local, root scale, navbar responsive, AppButton và SectionHeading |
| Các trang public/owner/admin/gov khác | Đã rollout giao diện cho tất cả route hiện có; xem UI_ROLLOUT.md về phạm vi và bằng chứng kiểm thử |
| Design rule | Tài liệu này và frontend AGENTS.md bắt buộc cho màn mới |
| API/DTO, domain, DB, mobile/Zalo | Không thay đổi trong đợt typography web này |
