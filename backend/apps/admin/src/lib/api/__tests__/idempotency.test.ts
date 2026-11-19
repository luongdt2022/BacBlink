import { describe, expect, it } from 'vitest'
import { IDEMPOTENCY_KEY_MAX_LENGTH, beginOperation, createOperationKey } from '../idempotency'

/**
 * Cổng done của ADR-0004.
 *
 * Luật chỉ có một câu — *một khoá cho mỗi lần bấm nút, dùng lại cho mọi lần thử lại của chính lần bấm đó* — và
 * nó dễ vi phạm đúng ở chỗ không ai nhìn: thư viện HTTP thường dựng lại config ở mỗi lần thử lại, và nếu khoá
 * được sinh trong lúc dựng thì mỗi lần thử lại thành một lệnh mới. Cơ chế trông như vẫn chạy, cho tới ngày một
 * người dùng mất mạng giữa chừng và hệ thống có hai bản ghi.
 */
describe('khoá chống lặp', () => {
  it('giữ nguyên qua mọi lần thử lại của cùng một lần bấm', () => {
    const operation = beginOperation()

    // Ba lần gửi của cùng một thao tác: lần đầu, thử lại tự động, thử lại thủ công.
    const sent = [operation.key, operation.key, operation.key]

    expect(new Set(sent).size).toBe(1)
  })

  it('lần bấm mới sinh khoá khác', () => {
    const first = beginOperation()
    const second = beginOperation()

    expect(second.key).not.toBe(first.key)
  })

  it('không sinh trùng qua nhiều lần bấm liên tiếp', () => {
    const keys = Array.from({ length: 500 }, () => createOperationKey())
    expect(new Set(keys).size).toBe(keys.length)
  })

  /**
   * Máy chủ cắt khoá còn 200 ký tự. Khoá phải phân biệt được **trong** giới hạn đó — hai khoá chỉ khác nhau
   * sau ký tự thứ 200 bị coi là một, và khi đó lệnh thứ hai nhận lại phản hồi của lệnh thứ nhất.
   */
  it('ngắn hơn giới hạn máy chủ cắt, và phân biệt được trong giới hạn đó', () => {
    const keys = Array.from({ length: 200 }, () => createOperationKey())

    for (const key of keys) {
      expect(key.length).toBeLessThanOrEqual(IDEMPOTENCY_KEY_MAX_LENGTH)
      expect(key.length).toBeGreaterThan(0)
    }

    const truncated = keys.map((k) => k.slice(0, IDEMPOTENCY_KEY_MAX_LENGTH))
    expect(new Set(truncated).size).toBe(keys.length)
  })

  /** Khoá là định danh ngẫu nhiên thuần — không ghép từ đường dẫn, tham số hay dấu thời gian (ADR-0004 luật 3). */
  it('không mang dấu vết của nội dung lệnh', () => {
    const key = createOperationKey()
    expect(key).not.toMatch(/\//)
    expect(key).not.toMatch(/api|users|intakes/i)
  })
})
