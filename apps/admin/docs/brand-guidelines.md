# NACENTECH Brand Guidelines

Tài liệu này tổng hợp các quy chuẩn về nhận diện thương hiệu NACENTECH (Viện Đổi mới sáng tạo Quốc gia) dựa trên Sổ tay thương hiệu phiên bản 2.0 (2026).

## 1. Hệ thống màu sắc (Color System)

Bảng màu chính của NACENTECH bao gồm 5 màu phối hợp để tạo nên cảm giác công nghệ, hiện đại và tin cậy.

### Bảng màu chi tiết

| Tên màu | HEX | RGB | CMYK | Vai trò |
| :--- | :--- | :--- | :--- | :--- |
| **Deep Teal** | `#137F79` | `19, 127, 121` | `C85 M31 Y54 K10` | **Màu chính (Primary)** |
| **Teal Green** | `#00A388` | `0, 163, 136` | `C80 M11 Y58 K0` | **Màu phụ (Secondary)** |
| **Light Olive Green** | `#9DCE77` | `157, 206, 119` | `C42 M0 Y71 K0` | Màu bổ trợ |
| **Bright Cyan** | `#15BCD4` | `21, 188, 212` | `C70 M1 Y16 K0` | Màu nhấn (Accent) |
| **Royal Blue** | `#0D64B0` | `13, 100, 176` | `C91 M63 Y0 K0` | Màu nhấn (Accent) |

### Quy tắc sử dụng màu sắc (Tỷ lệ 60-30-10)

Để đảm bảo tính cân bằng và chuyên nghiệp cho giao diện:

- **60% – Deep Teal (`#137F79`):** Sử dụng làm màu chủ đạo cho các mảng khối lớn, hình nền chính. Đại diện cho yếu tố công nghệ và sự ổn định.
- **30% – Teal Green (`#00A388`):** Sử dụng cho các section phụ, giúp tổng thể giao diện hài hòa.
- **10% – Bright Cyan (`#15BCD4`) & Royal Blue (`#0D64B0`):** Sử dụng làm màu nhấn cho các nút bấm (Buttons), trạng thái khi di chuột (Hover).

### Dải màu chuyển (Gradient)

Dải màu chuyển 5 màu theo thứ tự: **Deep Teal → Teal → Olive → Royal Blue → Bright Cyan**.
- **Ứng dụng:** Chỉ dùng cho phần Hero, Banner hoặc các yếu tố đồ họa chủ đạo (Key Visual).
- **Lưu ý:** Không dùng đại trà cho nền nội dung dài để đảm bảo khả năng đọc.

---

## 2. Hệ thống kiểu chữ (Typography)

Sử dụng các font chữ không chân (Sans-serif) để mang lại cảm giác hiện đại và kỹ thuật.

- **Kiểu chữ chính: Inter 4.0**
  - Đặc điểm: Độ tương phản thấp, đường nét đồng đều, linh hoạt cao.
  - Sử dụng: Cho cả Headline (Tiêu đề) và Body (Nội dung).
- **Kiểu chữ phụ: Roboto**
  - Đặc điểm: Hiển thị rõ ràng ở mọi kích thước, hệ thống ký tự phong phú.
- **Kiểu chữ thay thế: Arial**
  - Sử dụng: Trong các trường hợp bất khả kháng khi font chính không hiển thị tốt.

---

## 4. Hướng dẫn triển khai (Implementation Details)

Hệ thống giao diện mới đã được triển khai sử dụng **Tailwind CSS v4** và các biến CSS semantic.

### Cấu hình Theme (`src/styles/theme.css`)
Các biến màu sắc chính đã được ánh xạ:
- `--primary`: `#137F79` (Deep Teal) - Dùng cho hành động chính, sidebar active state.
- `--secondary`: `#00A388` (Teal Green) - Dùng cho các section bổ trợ, nút phụ.
- `--accent`: `#15BCD4` (Bright Cyan) - Dùng cho các thành phần nhấn mạnh.

### Typography
- Phông chữ **Inter** được tải từ Google Fonts trong `index.html`.
- Áp dụng toàn cục thông qua biến `--font-sans`.

### Quy chuẩn Minimalism
1. **Khoảng cách**: Sử dụng đơn vị 4px làm cơ sở. Table row và Card được tăng padding để tạo độ thoáng.
2. **Bo góc**: Đồng nhất `radius-xl` (12px) cho các thành phần chính (Card, Button, Input).
3. **Shadow**: Ưu tiên sử dụng `shadow-sm` thay vì các đường kẻ (border) đậm màu để phân tách khối.
4. **Interactive**: Hiệu ứng `active:scale-95` được áp dụng cho Button để tăng phản hồi xúc giác (tactile feedback).

