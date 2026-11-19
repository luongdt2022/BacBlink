/** Cookie name lưu accessToken */
const ACCESS_TOKEN_COOKIE = 'dmst_access_token';

/**
 * B-09: phải bằng tuổi của access token, không hơn. Máy chủ phát token sống **24 giờ**
 * (`AuthOptions.AccessTokenMinutes = 1440`); cookie này trước đây sống **365 ngày** — lệch 364 ngày. Đó là
 * quãng thời gian trình duyệt tin rằng còn đăng nhập trong khi máy chủ đã hết công nhận, và ở cổng người dùng
 * nó nặng hơn ở bảng quản trị vì chưa có nhánh xử lý 401 (B-12): người dùng mắc kẹt không có đường tự thoát
 * ngoài việc tự xoá cookie.
 */
const ACCESS_TOKEN_MAX_AGE_SECONDS = 24 * 60 * 60;

/**
 * B-10 lựa chọn (a), mức tối thiểu: gắn `Secure` khi trang chạy trên HTTPS. Không đặt vô điều kiện vì môi
 * trường phát triển chạy HTTP và cookie `Secure` sẽ bị trình duyệt bỏ im lặng.
 */
function cookieOptions(): string {
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  return `path=/; max-age=${ACCESS_TOKEN_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + encodeURIComponent(ACCESS_TOKEN_COOKIE) + '=([^;]*)')
  );
  const value = match ? decodeURIComponent(match[1]) : null;
  return value || null;
}

export function setAccessToken(token: string): void {
  if (typeof document === 'undefined') return;
  document.cookie =
    encodeURIComponent(ACCESS_TOKEN_COOKIE) +
    '=' +
    encodeURIComponent(token) +
    '; ' +
    cookieOptions();
}

export function removeAccessToken(): void {
  if (typeof document === 'undefined') return;
  document.cookie =
    encodeURIComponent(ACCESS_TOKEN_COOKIE) + '=; path=/; max-age=0';
}
