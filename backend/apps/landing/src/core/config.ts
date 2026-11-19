/**
 * Địa chỉ cổng người dùng — đích đến của mọi nút kêu gọi hành động trên trang giới thiệu.
 *
 * B-21: năm nút này trước đây viết cứng `https://twin.nacentech.vn/` — hệ NacenTwin/NestJS mà bản .NET vừa
 * thay thế **một lần**, không chạy song song. Mọi khách vãng lai bấm nút chính của trang chủ đều bị đưa sang
 * hệ cũ: nếu hệ cũ còn chạy, họ đăng ký ở đó và dữ liệu không bao giờ về hệ mới; nếu đã tắt, họ gặp trang chết.
 *
 * Giá trị mặc định là cổng phát triển. **Bản dựng production bắt buộc đặt `VITE_PORTAL_URL`** — nếu không,
 * trang đã phát hành sẽ trỏ về `localhost`. Đó là một cách hỏng ồn ào, và ồn ào là đúng: cách hỏng cũ im lặng
 * và sống sót qua cả một đợt chuyển stack.
 */
export const PORTAL_URL = import.meta.env.VITE_PORTAL_URL?.trim() || 'http://localhost:5173';
