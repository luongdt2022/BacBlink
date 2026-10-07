# Visual QA của UI rollout

Nguồn phạm vi và kết quả: [UI_ROLLOUT.md](../../UI_ROLLOUT.md).

Chạy `UI_QA_OUTPUT=/tmp/nacentwin-ui-visual npm test` từ frontend để xuất HTML của component React thật với API/session mock **chỉ trong test**. Không thêm endpoint hay bypass đăng nhập vào ứng dụng. Test không gửi request nghiệp vụ thật.

Mở frontend dev ở cổng 3002, sau đó phục vụ thư mục output bằng HTTP local. Các HTML dùng CSS dev và font local từ cổng 3002. Thanh đầu ghi rõ dữ liệu kiểm thử, có nút Light/Dark và A/A+.

Kiểm tra 390×844, 1280×900, 1440×900; A+; input 16px; control ≥44px; không tràn ngang toàn trang. Bảng rộng và tab thành tựu được cuộn trong vùng riêng. Màn API phải kiểm tra cả nội dung thành công bằng fixture và trạng thái không có quyền/lỗi tải.

Các ảnh đã được xem trong phiên browser QA, chưa lưu thành bộ PNG trong repository. HTML fixture không thay thế nghiệm thu E2E với backend/tài khoản thật.
