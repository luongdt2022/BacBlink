# Research: UI Refactor for Modern Minimalist Look

Tài liệu này tổng hợp kết quả nghiên cứu và các quyết định thiết kế cho giai đoạn triển khai giao diện NACENTECH.

## 1. Tích hợp Phông chữ Inter

- **Quyết định**: Sử dụng Google Fonts để tải font Inter. Đây là cách nhanh nhất và đảm bảo hiệu suất (CDN tối ưu).
- **Cách thực hiện**: Thêm `@import` vào `src/styles/fonts.css` hoặc liên kết trực tiếp trong `index.html`.
- **Lý do**: Inter là font mã nguồn mở, hỗ trợ tiếng Việt tốt và được thiết kế tối ưu cho màn hình máy tính, phù hợp với phong cách công nghệ.

## 2. Ánh xạ Bảng màu (Color Mapping)

Dựa trên bộ nhận diện NACENTECH, chúng ta sẽ ánh xạ vào các biến CSS trong `theme.css`:

| CSS Variable | NACENTECH Color | HEX | Vai trò |
| :--- | :--- | :--- | :--- |
| `--primary` | Teal Green | `#00A388` | Màu thương hiệu chính |
| `--secondary` | Light Olive Green | `#9DCE77` | Màu bổ trợ, section phụ |
| `--accent` | Bright Cyan | `#15BCD4` | Nút nhấn, hover, trạng thái |
| `--background` | Neutral White | `#F8FAFC` | Nền trang (Slate 50) |
| `--foreground` | Slate 900 | `#0F172A` | Chữ chính |
| `--muted` | Slate 100 | `#F1F5F9` | Nền nhạt cho UI |
| `--border` | Slate 200 | `#E2E8F0` | Đường kẻ, phân cách |

## 3. Kiểm định các thành phần "Nhiễu" (UI Noise Audit)

Qua khảo sát mã nguồn, một số điểm cần cải thiện để đạt phong cách minimalism:

- **Borders**: Hiện tại sử dụng nhiều border đơn thuần. Sẽ chuyển sang sử dụng khoảng trắng (space) và shadow cực nhẹ (`shadow-sm`) để phân tách các khối.
- **Gradients**: `body` hiện tại có `radial-gradient` và `linear-gradient` khá phức tạp. Sẽ đơn giản hóa thành nền phẳng hoặc gradient cực kỳ mờ.
- **Bảng (Tables)**: `IntakeTableRow` đang có hover background khá mờ nhạt. Sẽ tinh chỉnh lại padding và border để hàng trông thoáng hơn.
- **Shadows**: Thay vì dùng border 1px cho mọi thứ, sẽ dùng shadow để tạo độ nổi khối (elevation) nhẹ nhàng.

## 4. Chiến lược Kiểm thử (Testing Strategy)

- **Quyết định**: Do dự án hiện chưa có framework test, chúng ta sẽ tập trung vào **Manual Verification** và **Accessibility Check**.
- **Công cụ**: Sử dụng Chrome DevTools (Lighthouse) để kiểm tra độ tương phản màu sắc (A11y) và hiệu năng.
- **Kế hoạch tương lai**: Đề xuất tích hợp Vitest + Storybook nếu dự án mở rộng quy mô UI.

## 5. Kết luận Nghiên cứu

- **Minimalist Approach**: "Less is more". Tập trung vào Typography (Inter) và Spacing (Grid 8px). Màu sắc chỉ dùng làm điểm nhấn, không dùng tràn lan.
- **Modern Look**: Sử dụng các góc bo tròn đồng nhất (`radius-lg` của shadcn/ui), icons mảnh (`lucide-react`) và hiệu ứng chuyển cảnh mượt mà.
