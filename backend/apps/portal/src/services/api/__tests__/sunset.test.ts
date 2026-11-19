import { describe, expect, it } from 'vitest'
import { SUNSET_WARNING_DAYS, readSunset } from '../sunset'

/**
 * Máy chủ **đang gửi** header `Sunset` trên mọi phản hồi `/api/v1`, và CORS đã mở nó cho trình duyệt đọc.
 * Chưa client nào đọc. Ngày dừng là 31/03/2027 và đã nằm trong cấu hình — đồng hồ đã chạy.
 */
describe('header dừng dịch vụ', () => {
  const SUNSET = 'Wed, 31 Mar 2027 00:00:00 GMT'

  it('đọc được ngày dừng dịch vụ đã cấu hình', () => {
    const info = readSunset({ sunset: SUNSET }, new Date('2026-09-04T00:00:00Z'))
    expect(info).not.toBeNull()
    expect(info!.date.toISOString()).toBe('2027-03-31T00:00:00.000Z')
    // Từ ngày chụp bộ tài liệu tới ngày dừng dịch vụ: 208 ngày.
    expect(info!.daysRemaining).toBe(208)
    expect(info!.isApproaching).toBe(false)
  })

  it('cảnh báo khi vào ngưỡng', () => {
    const info = readSunset({ sunset: SUNSET }, new Date('2027-03-01T00:00:00Z'))
    expect(info!.daysRemaining).toBeLessThanOrEqual(SUNSET_WARNING_DAYS)
    expect(info!.isApproaching).toBe(true)
  })

  it('quá hạn thì số ngày còn lại là số âm', () => {
    const info = readSunset({ sunset: SUNSET }, new Date('2027-04-15T00:00:00Z'))
    expect(info!.daysRemaining).toBeLessThan(0)
    expect(info!.isApproaching).toBe(true)
  })

  it('đọc được qua Headers của fetch, không chỉ qua object thuần', () => {
    const headers = new Headers({ Sunset: SUNSET })
    const info = readSunset(headers, new Date('2026-09-04T00:00:00Z'))
    expect(info).not.toBeNull()
  })

  /** Một header hỏng hoặc vắng mặt không được làm hỏng lời gọi — nó chỉ là thông tin phụ. */
  it('không có header, hoặc header hỏng, thì im lặng bỏ qua', () => {
    expect(readSunset({})).toBeNull()
    expect(readSunset(undefined)).toBeNull()
    expect(readSunset({ sunset: 'không phải một ngày' })).toBeNull()
  })
})
