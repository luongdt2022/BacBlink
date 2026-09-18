---
name: "speckit-uiux"
description: "Senior Product Designer & Visual QA Specialist: Thiết kế layout wireframe, chuẩn hóa trải nghiệm 5 trạng thái UX, mapping UI Core E0.2 và tự động chụp ảnh Visual QA bằng Playwright."
compatibility: "Requires Next.js with Tailwind CSS v4, Playwright, and E0.2 UI Core Foundation"
metadata:
  author: "github-spec-kit"
  source: "custom/speckit-uiux"
---

# Kỹ Năng Thiết Kế Giao Diện & Kiểm Thử Trực Quan (`speckit-uiux`)

## 1. Mục Đích & Vai Trò
Khi dự án không có Designer chuyên trách, skill này đóng vai trò là **Senior Product Designer & Visual QA Specialist**:
- **Bảo toàn tính nhất quán**: Đối soát với Wireframe ban đầu (W1..W8 desktop, M1..M8 mobile trong file `Data/Bao_Cao_Giai_Phap_SIM_KT_M4U_PA1.html`) và biểu mẫu thực tế (`Data/a1.jpg`, `Data/a2.jpg`).
- **Tái sử dụng tài nguyên**: Bắt buộc sử dụng các primitives đã xây dựng ở **Epic E0.2 UI Core Foundation** (Màu KT Red, Theme Sáng/Tối, 3 thứ tiếng VN/KR/EN, `<FormField>`, `<LoadingButton>`, `<Toast>`, `<ImageLightbox>`).
- **Chuẩn hóa trải nghiệm người dùng (UX)**: Đảm bảo mọi màn hình đều có đủ 5 trạng thái tương tác vi mô.
- **Duyệt giao diện thực tế (Visual QA)**: Tự động dùng Playwright chụp ảnh màn hình (Screenshots Desktop + Mobile) để người dùng xem và duyệt trực quan trước khi chốt nghiệm thu.

---

## 2. Quy Trình Thiết Kế UI/UX 4 Bước

### Bước 1: Khảo Sát Wireframe & Lập Bố Cục (Layout Spec)
1. **Đối soát căn cứ thiết kế**:
   - Màn hình thuộc phân hệ nào (Storefront, eKYC, VietQR, Admin CMS, hay Cổng ARC)?
   - Màn hình tương ứng với Wireframe nào trong PA1 (`W1`..`W8` / `M1`..`M8`)?
2. **Quy hoạch bố cục (Grid/Flex)**:
   - **Desktop (>= 1024px)**: Thường bố trí 2 cột (Cột trái 65-70% là Form nhập liệu hoặc bảng dữ liệu; Cột phải 30-35% là Sticky Card tóm tắt đơn hàng/hướng dẫn/QR code).
   - **Mobile (< 768px)**: Dồn về 1 cột dọc (Single column), nút bấm hành động chính (Primary CTA) dính cố định ở đáy màn hình (Sticky Bottom Bar) để dễ thao tác bằng ngón tay cái.

### Bước 2: Ánh Xạ UI Components (Component Mapping với E0.2)
Tuyệt đối không tự ý viết các thẻ HTML/CSS tự do (ad-hoc). Bắt buộc sử dụng:
- **Form Controls**: `<FormField>` có sẵn nhãn (Label), chỉ báo bắt buộc (`*`), thông báo lỗi inline màu đỏ, và icon hỗ trợ.
- **Hành động (Actions)**: `<LoadingButton>` tự động hiển thị spinner quay và vô hiệu hóa (`disabled`) khi đang gửi yêu cầu để chống click đúp.
- **Phản hồi (Feedback)**: Sonner `<Toast>` góc trên/dưới thông báo thành công hoặc cảnh báo.
- **Xem ảnh nhạy cảm**: `<ImageLightbox>` phóng to ảnh Hộ chiếu/Visa/ARC khi chuyên viên CMS kiểm duyệt eKYC.
- **Đa ngôn ngữ**: Mọi nhãn chữ, placeholder, và thông báo lỗi phải gọi qua từ điển i18n (`src/prototype/lib/i18n.ts`) hỗ trợ 3 ngôn ngữ: Tiếng Việt (vi), Tiếng Hàn (ko), Tiếng Anh (en).

### Bước 3: Hoàn Thiện 5 Trạng Thái Tương Tác UX (Micro-interactions)
Mỗi màn hình bắt buộc phải khai báo xử lý trọn vẹn 5 trạng thái:
1. **Default State**: Trạng thái sạch khi tải trang lần đầu, các giá trị mặc định được điền hợp lý.
2. **Active / Typing State**: Input được focus có viền nổi bật (KT Red focus ring), nhãn nổi hoặc helper text hướng dẫn.
3. **Loading / Submitting State**: Hiển thị Skeleton loading khi tải dữ liệu hoặc Spinner quay trên nút bấm khi submit form.
4. **Error / Validation State**: Lỗi hiển thị ngay dưới trường vi phạm (Inline error), cuộn trang tự động đến trường lỗi đầu tiên nếu form dài.
5. **Success / Empty State**: Hiển thị icon trạng thái, thông điệp rõ ràng và nút điều hướng tiếp theo khi thành công hoặc khi bảng không có dữ liệu.

### Bước 4: Chạy Visual QA & Chụp Ảnh Giao Diện Thực Tế (Playwright)
1. **Khởi chạy kịch bản chụp ảnh**:
   - Sử dụng Playwright headless truy cập trang tương ứng ở 2 viewport:
     + **Desktop**: 1280 × 800
     + **Mobile**: 390 × 844 (iPhone 14)
   - Lưu ảnh vào thư mục: `docs/screenshots/<mã-epic>/<tên-màn-hình>-desktop.png` và `...-mobile.png`.
2. **Báo cáo trực quan**:
   - Đính kèm link mở ảnh hoặc hiển thị tóm tắt trực quan để người dùng kiểm chứng giao diện thực tế.

---

## 3. Tiêu Chí Nghiệm Thu UI/UX (Definition of Done for UI/UX)
- [ ] Bố cục đáp ứng hoàn hảo cả Desktop và Mobile (không bị tràn ngang, không vỡ layout).
- [ ] Tuân thủ bảng màu thương hiệu KT Telecom (Red `#dc2626`) và hỗ trợ mượt mà cả Light/Dark Mode.
- [ ] 100% văn bản giao diện có hỗ trợ chuyển đổi 3 ngôn ngữ (VN / KR / EN).
- [ ] Đã có ảnh chụp giao diện thực tế trong `docs/screenshots/<epic>/` và được người dùng thẩm duyệt đạt yêu cầu.
