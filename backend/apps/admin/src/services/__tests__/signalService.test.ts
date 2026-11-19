import { describe, expect, it } from 'vitest'
import {
  HIGH_VALUE_SIGNAL_CLASS,
  SIGNAL_CLASS_LABELS,
  SIGNAL_STATUS_LABELS,
  formatBudget,
} from '../signalService'
import {
  EXCLUSION_CODE_LABELS,
  NEUTRAL_REASON_CODES,
  REASON_CODE_LABELS,
} from '../matchRoundService'

/**
 * Kiểm ở tầng thuần: bảng nhãn và hàm định dạng. Không kiểm lời gọi HTTP — cái đó thuộc test tích hợp của
 * máy chủ, và dựng lại nó ở đây chỉ kiểm được cái giả lập.
 */
describe('signalService', () => {
  it('phủ nhãn cho mọi loại tín hiệu và mọi trạng thái mà máy chủ phát ra', () => {
    // Ba trạng thái ở `DemandSignalStatuses` và hai loại ở `DemandSignalClasses` phía máy chủ. Thiếu một nhãn
    // thì giao diện hiện mã thô — không hỏng, nhưng đọc như lỗi.
    expect(Object.keys(SIGNAL_STATUS_LABELS).sort()).toEqual(['CONVERTED', 'NEW', 'REJECTED'])
    expect(Object.keys(SIGNAL_CLASS_LABELS).sort()).toEqual(['TENDER_TECH_SIGNAL', 'UNMET_TENDER'])
  })

  it('loại tín hiệu đáng chú ý nhất là loại thị trường không đáp ứng được', () => {
    expect(HIGH_VALUE_SIGNAL_CLASS).toBe('UNMET_TENDER')
    expect(SIGNAL_CLASS_LABELS[HIGH_VALUE_SIGNAL_CLASS]).toBeDefined()
  })

  it('ngân sách trống hiện gạch ngang, không hiện số 0', () => {
    // `0` và "không biết" là hai chuyện khác nhau; hiện 0 cho cái thứ hai là nói dối một cách im lặng.
    expect(formatBudget(null, 'VND')).toBe('—')
    expect(formatBudget(null, null)).toBe('—')
    expect(formatBudget(0, 'VND')).not.toBe('—')
  })

  it('ngân sách có tiền tệ thì hiện kèm, không có thì hiện số trần', () => {
    expect(formatBudget(4200000000, 'VND')).toContain('VND')
    expect(formatBudget(4200000000, null)).not.toContain('VND')
  })
})

describe('nhãn lý do ghép cặp', () => {
  it('phủ mọi mã lý do và mã loại mà máy chủ phát ra', () => {
    expect(Object.keys(REASON_CODE_LABELS).sort()).toEqual([
      'NO_DELIVERY_HISTORY', 'PROVEN_DELIVERY', 'RERANKED_TOP', 'SECTOR_OVERLAP', 'SEMANTIC_MATCH', 'VERIFIED_OUTCOME',
    ])
    expect(Object.keys(EXCLUSION_CODE_LABELS).sort()).toEqual([
      'BELOW_THRESHOLD', 'BEYOND_LIMIT', 'NOT_PUBLISHED', 'OWNER_EXCLUDED', 'UNRESOLVABLE',
    ])
  })

  /**
   * Nguyên tắc 5: không có bằng chứng **không phải** tín hiệu tiêu cực. Bên mới luôn bắt đầu ở
   * `NO_DELIVERY_HISTORY`, nên tô nó như một cảnh báo là hệ thống tự đẩy bên mới xuống dưới bằng màu sắc.
   */
  it('chỉ mã "chưa có lịch sử" là trung tính; các mã còn lại là dữ kiện dương', () => {
    expect(NEUTRAL_REASON_CODES.has('NO_DELIVERY_HISTORY')).toBe(true)
    expect(NEUTRAL_REASON_CODES.has('PROVEN_DELIVERY')).toBe(false)
    expect(NEUTRAL_REASON_CODES.has('VERIFIED_OUTCOME')).toBe(false)
    expect(NEUTRAL_REASON_CODES.size).toBe(1)
  })
})
