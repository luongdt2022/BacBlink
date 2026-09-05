# Contract: Theme Variables (CSS)

Hợp đồng này quy định các biến CSS tối thiểu phải có trong `theme.css` để đảm bảo giao diện hiển thị đúng theo thiết kế NACENTECH Minimalist.

## 1. Biến CSS Bắt buộc

Mọi thành phần UI phải sử dụng các biến sau thay vì mã màu HEX trực tiếp.

```css
:root {
  /* Colors */
  --primary: #00A388;
  --primary-foreground: #ffffff;
  --secondary: #9DCE77;
  --secondary-foreground: #0f172a;
  --accent: #15BCD4;
  --accent-foreground: #0f172a;
  
  /* Background & Surface */
  --background: #f8fafc;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  
  /* UI Elements */
  --border: #e2e8f0;
  --input: #e2e8f0;
  --ring: #00A388;
  --radius: 0.75rem;
}
```

## 2. Quy tắc sử dụng

1. **Không dùng màu HEX**: Tuyệt đối không hardcode `#color` trong các file `.tsx`. Sử dụng utility classes của Tailwind (ví dụ: `text-primary`, `bg-background`).
2. **Bo góc (Border Radius)**: Sử dụng biến `--radius` thông qua class `rounded-lg` (mặc định map vào `--radius` trong tailwind config).
3. **Trạng thái Hover**: Các nút bấm khi hover phải có hiệu ứng transition tối thiểu `150ms`.
4. **Phông chữ**: Font `Inter` phải được áp dụng toàn cục cho thẻ `body`.
