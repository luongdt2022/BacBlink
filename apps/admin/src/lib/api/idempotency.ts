/**
 * Khoá chống lặp — quy tắc ở ADR-0004.
 *
 * **Một khoá cho mỗi lần bấm nút, không phải mỗi lần gọi.** Khoá sinh khi người dùng khởi động một thao tác và
 * giữ nguyên cho mọi lần thử lại của chính thao tác đó: thử lại tự động khi mất mạng, và thử lại thủ công khi
 * người dùng bấm "Thử lại" của cùng hộp thoại. Sinh khoá mới ở mỗi lần thử lại làm mất hết ý nghĩa của cơ chế,
 * và đó là cái bẫy dễ rơi nhất vì thư viện HTTP thường sinh lại mọi thứ ở lần thử lại.
 *
 * Ba chi tiết của bản cài đặt phía máy chủ, cả ba đã đo được, và cả ba đổi cách viết mã ở đây:
 *
 * - Khoá bị **cắt còn 200 ký tự**. Nên khoá phải là định danh ngẫu nhiên **thuần** — không ghép đường dẫn,
 *   tham số hay dấu thời gian, vì đó là cách tạo ra hai khoá chỉ khác nhau ở phần đuôi và bị cắt thành một.
 * - Khoá có **phạm vi theo người dùng**, nên hai người dùng cùng một chuỗi khoá không đụng nhau.
 * - Phản hồi **4xx được ghi lại để phát lại**. Gửi lại sau một lần bị 403 sẽ nhận lại đúng 403 kể cả khi quyền
 *   đã được cấp trong lúc đó — người dùng phải **bắt đầu lại thao tác** để có khoá mới. Câu chữ ở màn hình
 *   phải nói điều đó.
 */

/** Độ dài tối đa máy chủ giữ lại. Dài hơn bị cắt, và phần bị cắt là phần phân biệt hai khoá. */
export const IDEMPOTENCY_KEY_MAX_LENGTH = 200

/**
 * Sinh khoá cho **một** thao tác. Gọi đúng một lần tại thời điểm người dùng bấm nút, rồi truyền cùng giá trị
 * đó vào mọi lần thử lại.
 */
export function createOperationKey(): string {
  const cryptoObj = globalThis.crypto
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') return cryptoObj.randomUUID()

  // Dự phòng cho môi trường không có Web Crypto (trình duyệt cũ, hoặc trang phục vụ qua HTTP thuần).
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const bytes = cryptoObj.getRandomValues(new Uint8Array(16))
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  }

  // Không có nguồn ngẫu nhiên nào: vẫn phải trả một khoá, vì thiếu header thì lệnh ghi trả 428.
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`
}

/**
 * Giữ một khoá cho suốt vòng đời của một thao tác.
 *
 * Cách dùng ở màn hình: tạo một `Operation` khi người dùng bấm nút, truyền nó vào lời gọi, và **vứt đi** khi
 * thao tác kết thúc — kể cả khi kết thúc bằng lỗi. Người dùng sửa dữ liệu rồi gửi lại là một thao tác **mới**,
 * và nó phải có khoá mới.
 */
export interface Operation {
  readonly key: string
}

export function beginOperation(): Operation {
  return { key: createOperationKey() }
}
