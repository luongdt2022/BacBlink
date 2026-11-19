/**
 * Bộ dịch lỗi dùng chung cho cả hai bề mặt.
 *
 * Đây là chỗ dễ bỏ sót nhất của cuộc di trú v1 → v2, vì nó **không gây lỗi biên dịch** và chỉ hiện ra như một
 * thông điệp vô nghĩa trước mặt người dùng. Ba hình dạng phải xử lý, và chúng không giống nhau:
 *
 * | | v1 | v2 |
 * |---|---|---|
 * | Kiểu nội dung | `application/json` | `application/problem+json` |
 * | Trường hiển thị | `message` | **`detail`** |
 * | Nhiều lỗi kiểm tra | `message` là **mảng** | `errors` là mảng |
 * | Mã tương quan | không có | `correlationId`, luôn có |
 *
 * Hàm cũ chỉ đọc `message` như một chuỗi, nên nó rơi về câu mặc định của axios ngay khi gọi v2, và nối một
 * mảng vào chỗ chờ chuỗi khi v1 trả nhiều lỗi (B-08).
 */

export interface NormalizedError {
  /** Mã trạng thái HTTP, hoặc `null` khi lỗi xảy ra trước khi có phản hồi (mất mạng, quá hạn). */
  status: number | null
  /** Câu để hiển thị. Luôn là chuỗi, không bao giờ rỗng. */
  message: string
  /** Mã nghiệp vụ ổn định — giao diện phân nhánh theo mã này, không theo câu chữ. */
  code?: string
  /** Quy tắc đã chặn, chỉ có ở lỗi phân quyền của v2. */
  ruleId?: string
  /** Phiên bản hiện tại của bản ghi, chỉ có ở 409 lệch phiên bản của v2. */
  currentVersion?: number
  /** Danh sách lỗi kiểm tra khi có nhiều trường sai. */
  errors: string[]
  /** Mã tương quan để nối với nhật ký máy chủ. Chỉ v2 trả. */
  correlationId?: string
  /** `true` khi `/api/v1` đã dừng phục vụ (410). */
  isGone: boolean
}

const FALLBACK_MESSAGE = 'Đã có lỗi xảy ra. Vui lòng thử lại.'

interface ErrorLikeResponse {
  status: number
  data?: unknown
}

interface ErrorLike {
  response?: ErrorLikeResponse
  message?: string
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
}

/** `message` của v1 là chuỗi khi có một lỗi và **mảng** khi có nhiều — cả hai đều hợp lệ. */
function readV1Message(body: Record<string, unknown>): { message?: string; errors: string[] } {
  const raw = body.message
  if (Array.isArray(raw)) {
    const errors = raw.filter((x): x is string => typeof x === 'string')
    return { message: errors.join('; ') || undefined, errors }
  }
  if (typeof raw === 'string' && raw.trim()) return { message: raw, errors: [raw] }
  return { errors: [] }
}

/** `errors` của v2 là mảng chuỗi; `detail` đã là các câu nối bằng `; `. */
function readV2Errors(body: Record<string, unknown>): string[] {
  const raw = body.errors
  return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []
}

/**
 * Chuẩn hoá bất kỳ lỗi nào — v1, v2, hay lỗi mạng — về một hình dạng duy nhất.
 *
 * Không phụ thuộc axios: nhận vào một đối tượng có `response.status` và `response.data`. Nhờ vậy nó kiểm được
 * mà không cần dựng trình duyệt giả, và dùng lại được ở bất kỳ thư viện HTTP nào.
 */
export function normalizeError(error: unknown): NormalizedError {
  const err = asRecord(error) as ErrorLike | null
  const response = err?.response
  const status = typeof response?.status === 'number' ? response.status : null
  const body = asRecord(response?.data)

  const base: NormalizedError = {
    status,
    message: FALLBACK_MESSAGE,
    errors: [],
    isGone: status === 410,
  }

  if (!body) {
    // Chưa có phản hồi: mất mạng, quá hạn, hoặc CORS chặn. Câu của thư viện HTTP là thứ duy nhất có.
    const raw = typeof err?.message === 'string' ? err.message.trim() : ''
    return { ...base, message: raw || FALLBACK_MESSAGE }
  }

  // v2 — RFC 9457. `detail` là trường hiển thị; `title` chỉ là tên loại lỗi, không phải câu cho người dùng.
  const detail = typeof body.detail === 'string' ? body.detail.trim() : ''
  if (detail) {
    return {
      ...base,
      message: detail,
      code: typeof body.code === 'string' ? body.code : undefined,
      ruleId: typeof body.ruleId === 'string' ? body.ruleId : undefined,
      currentVersion: typeof body.currentVersion === 'number' ? body.currentVersion : undefined,
      errors: readV2Errors(body),
      correlationId: typeof body.correlationId === 'string' ? body.correlationId : undefined,
    }
  }

  // v1 — shape NestJS. Hai biến thể: {code,message} cho lỗi xác thực, {statusCode,message,error} cho phần còn lại.
  const v1 = readV1Message(body)
  const raw = typeof err?.message === 'string' ? err.message.trim() : ''
  return {
    ...base,
    message: v1.message || raw || FALLBACK_MESSAGE,
    code: typeof body.code === 'string' ? body.code : undefined,
    errors: v1.errors,
  }
}

/** Câu để hiển thị. Giữ tên cũ vì nó đang được gọi ở nhiều màn hình. */
export function getErrorMessage(error: unknown): string {
  return normalizeError(error).message
}
