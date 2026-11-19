# Quickstart: UI Refactor NACENTECH

Hướng dẫn nhanh cho nhà phát triển để áp dụng giao diện mới.

## 1. Cập nhật Theme

Chỉnh sửa file `src/styles/theme.css` với các giá trị màu mới từ bộ nhận diện NACENTECH.

## 2. Tải Font Inter

Đảm bảo font Inter được tải trong `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## 3. Refactor Component

Khi sửa một component (ví dụ: `Button` hoặc `Card`):
1. Đảm bảo sử dụng `var(--primary)` cho các hành động chính.
2. Tăng `padding` nếu cảm thấy quá chật chội.
3. Thay thế các đường kẻ đậm bằng `shadow-sm` hoặc border mờ (`border-slate-200/50`).

## 4. Kiểm tra

Chạy lệnh build để đảm bảo không có lỗi CSS:
```bash
npm run build
```
Kiểm tra giao diện thủ công trên trình duyệt để đảm bảo tính tối giản và hiện đại.
