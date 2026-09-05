/**
 * Cookie utilities for managing tokens in browser cookies
 */

/**
 * B-09: phải bằng tuổi của access token, không hơn. Máy chủ phát token sống **24 giờ**
 * (`AuthOptions.AccessTokenMinutes = 1440`); cookie trước đây sống 7 ngày, nên có sáu ngày trình duyệt tin
 * rằng còn đăng nhập trong khi máy chủ đã hết công nhận. Khoảng lệch đó hiện ra với người dùng dưới dạng màn
 * "Đang tải…" chớp qua rồi rơi về trang đăng nhập, không câu nào nói phiên đã hết hạn.
 *
 * Đổi tuổi token ở máy chủ mà quên con số này sẽ dựng lại đúng khoảng lệch đó.
 */
const ACCESS_TOKEN_MAX_AGE_DAYS = 1

/**
 * Set a cookie with the given name and value
 */
export function setCookie(
  name: string,
  value: string,
  maxAgeDays: number = ACCESS_TOKEN_MAX_AGE_DAYS
): void {
  const maxAge = maxAgeDays * 24 * 60 * 60
  // B-10 lựa chọn (a), mức tối thiểu: gắn `Secure` khi trang chạy trên HTTPS. Không đặt vô điều kiện vì môi
  // trường phát triển chạy HTTP và cookie `Secure` sẽ bị trình duyệt bỏ im lặng. `HttpOnly` **không** dùng được
  // với kiến trúc hiện tại — bộ chặn HTTP đọc token từ JavaScript; đổi điều đó là lựa chọn (b) và cần quyết định.
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0`
}
