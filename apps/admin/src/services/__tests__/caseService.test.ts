import { describe, expect, it } from 'vitest'
import {
  DECISIONS_REQUIRING_MANDATE_REF,
  DECISION_LABELS,
  MAIN_STAGES,
  STAGES,
  STAGE_LABELS,
  SUCCESSFUL_TERMINAL_STAGES,
  classifyWriteError,
  decisionOptionsFor,
  isBackward,
  isTerminal,
  reachableStages,
  transitionVerb,
} from '../caseService'

/**
 * Ba việc hộp thoại quyết định làm mà máy chủ không làm hộ, kiểm ở tầng luật thuần: chỉ hiện đích đi tới
 * được, chọn sẵn loại quyết định, đổi chữ trên nút theo giai đoạn. Bản ma trận ở client phải khớp
 * `TransitionMatrix` phía máy chủ; các số ở đây (2 đường ra từ EXECUTION, 0 từ giai đoạn kết thúc) chép từ đó.
 */
describe('ma trận chuyển (chép từ TransitionMatrix)', () => {
  it('EXECUTION có đúng hai đường ra', () => {
    expect(reachableStages('EXECUTION')).toEqual(['OUTCOME_VERIFICATION', 'CANCELLED'])
  })

  it('năm giai đoạn kết thúc không đi đâu được', () => {
    for (const s of ['CLOSED', 'HANDED_OVER', 'REJECTED', 'WITHDRAWN', 'CANCELLED']) {
      expect(reachableStages(s)).toEqual([])
      expect(isTerminal(s)).toBe(true)
    }
  })

  it('giai đoạn lạ không có đường ra và không làm hỏng thanh giai đoạn', () => {
    expect(reachableStages('KHONG_TON_TAI')).toEqual([])
  })

  it('mọi đích trong ma trận đều là giai đoạn có thật', () => {
    for (const from of STAGES) for (const to of reachableStages(from)) expect(STAGES).toContain(to)
  })
})

describe('chọn sẵn loại quyết định (ADR-0008)', () => {
  it('tiến, không phải giai đoạn kết thúc: hai lựa chọn', () => {
    expect(decisionOptionsFor('DISCOVERY', 'QUALIFICATION')).toEqual(['APPROVE', 'WAIVE'])
  })

  it('lùi: đúng một lựa chọn, không cần hỏi', () => {
    expect(isBackward('QUALIFICATION', 'DISCOVERY')).toBe(true)
    expect(decisionOptionsFor('QUALIFICATION', 'DISCOVERY')).toEqual(['RETURN_FOR_REWORK'])
  })

  it('mỗi giai đoạn kết thúc đòi đúng loại quyết định của nó', () => {
    expect(decisionOptionsFor('DISCOVERY', 'REJECTED')).toEqual(['REJECT'])
    expect(decisionOptionsFor('DEAL_DESIGN', 'WITHDRAWN')).toEqual(['WITHDRAW'])
    expect(decisionOptionsFor('EXECUTION', 'CANCELLED')).toEqual(['CANCEL'])
  })

  it('đường ra kết thúc không bị coi là lùi', () => {
    expect(isBackward('DEAL_DESIGN', 'WITHDRAWN')).toBe(false)
  })

  it('CLOSED là bước tiến thường: chấp thuận hoặc miễn', () => {
    expect(decisionOptionsFor('COMMERCIALIZATION_MONITORING', 'CLOSED')).toEqual(['APPROVE', 'WAIVE'])
  })
})

/**
 * ADR-0013. Với người trả tiền dùng vốn nhà nước, việc chọn nhà thầu bắt buộc chạy trên Hệ thống mạng đấu thầu
 * quốc gia (Điều 50 Luật Đấu thầu 2023), nên NacenTwin dừng ở phần thượng nguồn. Trước ADR-0013 không có lối ra
 * thành công nào trước khi thi công: bàn giao phải ghi thành `WITHDRAWN`/`CANCELLED`, tức là ghi sai sự thật.
 */
describe('bàn giao ra quy trình có thẩm quyền (ADR-0013)', () => {
  it('tới được từ bốn giai đoạn có chọn bên cung ứng, và chỉ bốn', () => {
    for (const from of ['MATCHING', 'DUE_DILIGENCE', 'DEAL_DESIGN', 'OUTCOME_VERIFICATION']) {
      expect(reachableStages(from)).toContain('HANDED_OVER')
    }
    // Chưa tìm giải pháp nào thì không có gì để bàn giao — ở đó `WITHDRAWN` mới là lối ra đúng.
    for (const from of ['DISCOVERY', 'QUALIFICATION', 'EXECUTION', 'COMMERCIALIZATION_MONITORING']) {
      expect(reachableStages(from)).not.toContain('HANDED_OVER')
    }
  })

  it('đòi đúng loại quyết định của nó, không nhận chấp thuận chung chung', () => {
    expect(decisionOptionsFor('MATCHING', 'HANDED_OVER')).toEqual(['HANDOVER_TO_AUTHORITY'])
    expect(decisionOptionsFor('OUTCOME_VERIFICATION', 'HANDED_OVER')).toEqual(['HANDOVER_TO_AUTHORITY'])
  })

  it('là kết thúc thành công, không phải biến thể của bỏ cuộc', () => {
    expect(SUCCESSFUL_TERMINAL_STAGES.has('HANDED_OVER')).toBe(true)
    expect(SUCCESSFUL_TERMINAL_STAGES.has('CLOSED')).toBe(true)
    for (const s of ['REJECTED', 'WITHDRAWN', 'CANCELLED'] as const) {
      expect(SUCCESSFUL_TERMINAL_STAGES.has(s)).toBe(false)
    }
  })

  it('là loại quyết định duy nhất đòi tham chiếu', () => {
    expect(DECISIONS_REQUIRING_MANDATE_REF.has('HANDOVER_TO_AUTHORITY')).toBe(true)
    expect(DECISIONS_REQUIRING_MANDATE_REF.size).toBe(1)
  })

  it('chữ trên nút nói ra chỗ đi, không nói "đóng"', () => {
    expect(transitionVerb('MATCHING', 'HANDED_OVER')).toBe('Bàn giao ra ngoài')
    expect(transitionVerb('COMMERCIALIZATION_MONITORING', 'CLOSED')).toBe('Đóng hồ sơ')
  })

  it('mọi giai đoạn kết thúc đều có nhãn tiếng Việt', () => {
    for (const s of ['CLOSED', 'HANDED_OVER', 'REJECTED', 'WITHDRAWN', 'CANCELLED']) {
      expect(STAGE_LABELS[s]).toBeTruthy()
    }
    expect(DECISION_LABELS.HANDOVER_TO_AUTHORITY).toBeTruthy()
  })
})

describe('chữ trên nút đổi theo giai đoạn', () => {
  it('từ chối chỉ có tới hết thẩm tra; từ thiết kế thương vụ trở đi là rút lui hoặc huỷ', () => {
    const upTo = MAIN_STAGES.slice(0, MAIN_STAGES.indexOf('DUE_DILIGENCE') + 1)
    for (const s of upTo) expect(reachableStages(s)).toContain('REJECTED')
    for (const s of ['DEAL_DESIGN', 'EXECUTION']) expect(reachableStages(s)).not.toContain('REJECTED')
    expect(transitionVerb('DEAL_DESIGN', 'CANCELLED')).toBe('Huỷ')
    expect(transitionVerb('DISCOVERY', 'WITHDRAWN')).toBe('Rút lui')
    expect(transitionVerb('DISCOVERY', 'REJECTED')).toBe('Từ chối')
  })

  it('lùi nói "trả về", tiến nói "chuyển sang"', () => {
    expect(transitionVerb('MATCHING', 'QUALIFICATION')).toMatch(/^Trả về/)
    expect(transitionVerb('MATCHING', 'DUE_DILIGENCE')).toMatch(/^Chuyển sang/)
  })
})

describe('ba đường thất bại của lệnh ghi', () => {
  const axiosLike = (status: number, body: Record<string, unknown>) => ({
    isAxiosError: true,
    response: { status, data: body, headers: {} },
    message: `Request failed with status code ${status}`,
  })

  it('409 là lệch phiên bản — màn hình tải lại và giữ diễn giải', () => {
    expect(classifyWriteError(axiosLike(409, { detail: 'lệch', code: 'VERSION_CONFLICT' })).kind).toBe('conflict')
  })

  it('422 mang mã luật để chọn câu nói phải làm gì tiếp', () => {
    const f = classifyWriteError(axiosLike(422, { detail: 'hold', code: 'CASE_ON_HOLD' }))
    expect(f.kind).toBe('rule')
    expect(f.code).toBe('CASE_ON_HOLD')
  })

  it('403 tắt nút gửi — thử lại sẽ hỏng y hệt', () => {
    expect(classifyWriteError(axiosLike(403, { detail: 'no' })).kind).toBe('forbidden')
  })
})
