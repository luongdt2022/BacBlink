# UI Design System Tokens: NACENTECH Minimalist

Tài liệu này định nghĩa các thực thể và cấu trúc dữ liệu cho hệ thống giao diện (Design System).

## 1. Tokens Màu sắc (Color Tokens)

Hệ thống sử dụng các biến CSS làm "Single Source of Truth".

### Primary (Màu thương hiệu)
- `primary`: `#00A388` (Teal Green) - Dùng cho các hành động chính, nhận diện thương hiệu.
- `primary-foreground`: `#FFFFFF` - Màu chữ trên nền primary.

### Secondary (Màu bổ trợ)
- `secondary`: `#9DCE77` (Light Olive Green) - Dùng cho các khu vực ít quan trọng hơn, badge, hoặc nền section.
- `secondary-foreground`: `#0F172A` - Màu chữ trên nền secondary.

### Accents & UI (Nhấn và Tiện ích)
- `accent`: `#15BCD4` (Bright Cyan) - Dùng cho trạng thái hover, highlight, hoặc nút phụ.
- `muted`: `#F1F5F9` (Slate 100) - Dùng cho nền các thành phần bị vô hiệu hóa hoặc background nhạt.
- `destructive`: `#EF4444` - Màu thông báo lỗi hoặc hành động xóa.

## 2. Tokens Kiểu chữ (Typography Tokens)

- `font-family-sans`: `"Inter", sans-serif` - Font chữ chính.
- `font-size-base`: `16px` - Kích thước chữ cơ bản.
- `line-height-relaxed`: `1.6` - Khoảng cách dòng cho nội dung văn bản.

## 3. Quy chuẩn Khoảng cách & Hình khối (Spacing & Radius)

- `radius`: `0.75rem` (12px) - Độ bo góc đồng nhất cho card, button, modal.
- `spacing-unit`: `4px` - Đơn vị cơ sở cho grid (2, 4, 8, 16, 24, 32, ...).
- `surface-shadow`: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` - Shadow nhẹ cho các page sections.
