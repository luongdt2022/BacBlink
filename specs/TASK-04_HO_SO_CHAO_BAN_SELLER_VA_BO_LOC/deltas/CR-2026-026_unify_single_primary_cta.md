# CR-2026-026: Hợp Nhất Nút CTA Chính Duy Nhất Trên Màn Hình Chi Tiết Chào Bán (Phương án 1)

- **Trạng thái**: `MERGED`
- **Ngày phê duyệt**: 2026-11-13
- **Người phê duyệt**: PO (`nacen-po-pm`) & User
- **Phạm vi Epic**: `TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC`

## 1. Bối cảnh & Vấn đề
Trên trang chi tiết chào bán (`/chao-ban-cong-nghe/[id]`), giao diện trước đây hiển thị đồng thời 2 nút CTA chính ở Hero (`Đăng ký nhận chuyển giao công nghệ` / `Đặt mua sản phẩm / Kết nối thương mại`) và ở Sidebar (`Gửi Yêu Cầu Chuyển Giao Công Nghệ` / `Đặt Mua Hàng / Yêu Cầu Báo Giá Sỉ`). Cả hai nút đều gọi cùng một hàm `handleOpenConnectModal` với cùng tham số, gây trùng lặp nhận thức và phân tán chuyển đổi.

## 2. Quyết định thay đổi (Phương án 1)
1. **Hero Action Bar**: Gỡ bỏ nút CTA chính trùng lặp; chỉ giữ các nút tiện ích (`Lưu quan tâm`, `Chia sẻ hồ sơ`) và dòng ghi chú bảo mật/tiếp cận.
2. **Sticky Sidebar**: Giữ duy nhất 1 nút CTA chính trong Sidebar Card bên phải (`lg:sticky lg:top-24 lg:self-start`) với màu Primary Brand thống nhất (`bg-brand-700`):
   - Luồng Công nghệ (`!isCommercialProduct`): `Gửi Yêu Cầu Chuyển Giao Công Nghệ`
   - Luồng Thương mại (`isCommercialProduct`): `Đặt Mua Hàng / Yêu Cầu Báo Giá Sỉ`
3. **Đồng bộ Spec & Test**: Cập nhật Living Spec (`spec.md` Mục 16) và bộ unit test `page.test.tsx`.
