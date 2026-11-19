/**
 * Đọc header dừng dịch vụ của `/api/v1`, và nhận biết khi nó đã dừng hẳn.
 *
 * Máy chủ **đang gửi** `Deprecation`, `Sunset` và `Link` trên mọi phản hồi `/api/v1`, và CORS đã mở ba header
 * đó cho trình duyệt đọc. Chưa client nào đọc chúng. Ngày dừng là **31/03/2027** và đã nằm trong cấu hình, nên
 * đồng hồ đã chạy; đọc `Sunset` rồi cảnh báo khi gần tới hạn là cách rẻ nhất để không ai quên.
 *
 * Sau ngày đó — hoặc bất cứ lúc nào cờ tương thích bị tắt — mọi đường `/api/v1` trả **410 Gone**. Không client
 * nào có nhánh cho mã đó, nên nó sẽ hiện ra như một lỗi lạ không giải thích được.
 */

/** Phát khi máy chủ trả 410: `/api/v1` đã ngừng phục vụ. */
export const API_GONE_EVENT = 'api:gone'

/** Phát khi hạn dừng dịch vụ còn dưới ngưỡng cảnh báo. */
export const API_SUNSET_EVENT = 'api:sunset-approaching'

/** Bắt đầu cảnh báo khi còn dưới 90 ngày — đủ sớm để kịp làm việc gì đó, đủ muộn để không thành tiếng ồn. */
export const SUNSET_WARNING_DAYS = 90

export interface SunsetInfo {
  /** Ngày dừng dịch vụ đọc từ header `Sunset` (định dạng HTTP-date). */
  date: Date
  /** Số ngày còn lại, làm tròn xuống. Âm nghĩa là đã quá hạn. */
  daysRemaining: number
  /** `true` khi đã dưới ngưỡng cảnh báo. */
  isApproaching: boolean
}

type HeaderBag = { get?: (name: string) => unknown } | Record<string, unknown> | undefined | null

function headerValue(headers: HeaderBag, name: string): string | null {
  if (!headers) return null
  const bag = headers as { get?: (n: string) => unknown }
  if (typeof bag.get === 'function') {
    const viaGet = bag.get(name)
    if (typeof viaGet === 'string') return viaGet
  }
  const record = headers as Record<string, unknown>
  const direct = record[name] ?? record[name.toLowerCase()]
  return typeof direct === 'string' ? direct : null
}

/**
 * Đọc header `Sunset`. Trả `null` khi không có header, hoặc khi giá trị không phân tích được — một header hỏng
 * không được làm hỏng lời gọi.
 */
export function readSunset(headers: HeaderBag, now: Date = new Date()): SunsetInfo | null {
  const raw = headerValue(headers, 'sunset')
  if (!raw) return null

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return null

  const daysRemaining = Math.floor((date.getTime() - now.getTime()) / 86_400_000)
  return { date, daysRemaining, isApproaching: daysRemaining <= SUNSET_WARNING_DAYS }
}
