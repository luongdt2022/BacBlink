import { describe, expect, it } from 'vitest'
import {
  MAIN_STAGES,
  STAGES,
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

  it('bốn giai đoạn kết thúc không đi đâu được', () => {
    for (const s of ['CLOSED', 'REJECTED', 'WITHDRAWN', 'CANCELLED']) {
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
