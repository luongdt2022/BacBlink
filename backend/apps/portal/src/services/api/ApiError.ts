import { normalizeError } from './problem';
import type { NormalizedError } from './problem';

/**
 * Lỗi HTTP mang đủ thông tin để màn hình phân nhánh được.
 *
 * B-12: bộ chặn của cổng người dùng trước đây thay mọi lỗi bằng `new Error(message)`. Thông điệp còn, nhưng
 * **mã trạng thái bị vứt trước khi màn hình nhìn thấy nó** — nên không màn hình nào phân biệt được phiên hết
 * hạn với mất mạng, và không có nhánh nào đưa người dùng về đăng nhập. Cookie thì vẫn còn (365 ngày trước khi
 * sửa B-09), nên lần tải trang sau ứng dụng vẫn tưởng đã đăng nhập và lặp lại đúng vòng đó. Người dùng mắc kẹt
 * và không có đường tự thoát ngoài việc tự xoá cookie.
 *
 * Hệ quả thứ hai, ít ai để ý: phép kiểm `axios.isAxiosError(err)` trong `apiFetch` **không bao giờ đúng** sau
 * bộ chặn đó, nên nhánh trả `{ data, status }` cho phản hồi lỗi là mã chết. Giữ nguyên một lớp `Error` — thay
 * vì trả về lỗi gốc của axios — là chủ ý: hàng chục chỗ `catch` đang đọc `err.message`, và đổi sang lỗi gốc sẽ
 * biến mọi câu thành *"Request failed with status code 400"*.
 */
export class ApiError extends Error {
  readonly status: number | null;
  readonly code?: string;
  readonly ruleId?: string;
  readonly currentVersion?: number;
  readonly errors: string[];
  readonly correlationId?: string;
  readonly isGone: boolean;

  /** Lỗi gốc của thư viện HTTP, giữ lại để gỡ rối. Không dùng `Error.cause` vì lib mục tiêu của repo chưa có nó. */
  readonly cause?: unknown;

  constructor(normalized: NormalizedError, cause?: unknown) {
    super(normalized.message);
    this.name = 'ApiError';
    this.cause = cause;
    this.status = normalized.status;
    this.code = normalized.code;
    this.ruleId = normalized.ruleId;
    this.currentVersion = normalized.currentVersion;
    this.errors = normalized.errors;
    this.correlationId = normalized.correlationId;
    this.isGone = normalized.isGone;
  }

  static from(error: unknown): ApiError {
    return error instanceof ApiError ? error : new ApiError(normalizeError(error), error);
  }

  /** Phiên hết hạn hoặc chưa đăng nhập. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}
