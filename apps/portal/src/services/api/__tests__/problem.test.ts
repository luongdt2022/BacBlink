import { describe, expect, it } from 'vitest'
import { getErrorMessage, normalizeError } from '../problem'

/**
 * B-08 và B-06. Hàm cũ đọc `response.data.message` như một chuỗi, nên nó sai ở **hai** chỗ cùng lúc: nối một
 * mảng vào chỗ chờ chuỗi khi v1 trả nhiều lỗi kiểm tra, và rơi về câu mặc định của axios ở mọi lỗi v2 vì v2
 * không có trường `message`.
 *
 * Cả hai đều là lỗi im lặng — không ngoại lệ, không cảnh báo, chỉ một câu vô nghĩa trước mặt người dùng.
 */

const axiosLike = (status: number, data: unknown, message = 'Request failed') => ({
  isAxiosError: true,
  message,
  response: { status, data },
})

describe('bộ dịch lỗi', () => {
  it('đọc `detail` của problem details v2', () => {
    const error = axiosLike(400, {
      title: 'Bad Request',
      status: 400,
      detail: 'kind must be one of the following values: demand-briefs, technology-assets',
      code: 'VALIDATION_FAILED',
      correlationId: '0HNOAEFE9SSCJ:00000001',
    })

    const result = normalizeError(error)
    expect(result.message).toBe('kind must be one of the following values: demand-briefs, technology-assets')
    expect(result.code).toBe('VALIDATION_FAILED')
    expect(result.correlationId).toBe('0HNOAEFE9SSCJ:00000001')
  })

  it('giữ `ruleId` của lỗi phân quyền v2 — giao diện cần nó để nói người dùng thiếu quyền gì', () => {
    const result = normalizeError(
      axiosLike(403, {
        title: 'Forbidden',
        detail: "Không có quyền thực hiện 'stats.read'",
        code: 'FORBIDDEN',
        ruleId: 'DEFAULT_DENY',
      })
    )

    expect(result.message).toBe("Không có quyền thực hiện 'stats.read'")
    expect(result.ruleId).toBe('DEFAULT_DENY')
  })

  it('giữ `currentVersion` của 409 lệch phiên bản', () => {
    const result = normalizeError(
      axiosLike(409, { detail: 'Bản ghi đã bị thay đổi bởi một yêu cầu khác.', currentVersion: 7 })
    )
    expect(result.currentVersion).toBe(7)
  })

  it('đọc `message` chuỗi của v1', () => {
    const result = normalizeError(
      axiosLike(400, { statusCode: 400, message: 'title should not be empty', error: 'Bad Request' })
    )
    expect(result.message).toBe('title should not be empty')
  })

  /** Đây là B-08: máy chủ trả mảng khi nhiều trường sai, và hàm cũ đưa thẳng mảng vào chỗ chờ chuỗi. */
  it('đọc `message` MẢNG của v1 và nối lại thành một câu', () => {
    const result = normalizeError(
      axiosLike(400, {
        statusCode: 400,
        message: ['email must be a valid email', 'password must be longer than or equal to 8 characters'],
        error: 'Bad Request',
      })
    )

    expect(result.message).toBe(
      'email must be a valid email; password must be longer than or equal to 8 characters'
    )
    expect(result.errors).toHaveLength(2)
    expect(typeof result.message).toBe('string')
  })

  it('giữ mã nghiệp vụ của lỗi xác thực v1', () => {
    const result = normalizeError(
      axiosLike(400, { code: 'CONFIRM_PASSWORD_MISMATCH', message: 'Confirm password does not match' })
    )
    expect(result.code).toBe('CONFIRM_PASSWORD_MISMATCH')
    expect(result.message).toBe('Confirm password does not match')
  })

  it('nhận biết 410 — `/api/v1` đã dừng phục vụ', () => {
    const result = normalizeError(
      axiosLike(410, { statusCode: 410, message: 'API v1 đã ngừng (D2-148). Dùng /api/v2.', error: 'Gone' })
    )
    expect(result.isGone).toBe(true)
    expect(result.status).toBe(410)
  })

  it('lỗi mạng: không có phản hồi thì dùng câu của thư viện HTTP', () => {
    const result = normalizeError({ isAxiosError: true, message: 'Network Error' })
    expect(result.status).toBeNull()
    expect(result.message).toBe('Network Error')
    expect(result.isGone).toBe(false)
  })

  /** Không đường nào được trả chuỗi rỗng — một hộp thoại lỗi trống tệ hơn một câu chung chung. */
  it('không bao giờ trả câu rỗng', () => {
    const cases: unknown[] = [
      undefined,
      null,
      {},
      { response: { status: 500, data: {} } },
      { response: { status: 400, data: { message: '' } } },
      { response: { status: 400, data: { detail: '   ' } } },
      'một chuỗi trần',
    ]

    for (const c of cases) {
      expect(getErrorMessage(c).trim().length).toBeGreaterThan(0)
    }
  })
})
