import { describe, expect, it } from 'vitest'
import { LEGACY_IMPORTED_ENGINE, compareRounds, mergeCandidates } from '../matchRoundService'
import type { MatchCandidate, MatchRound } from '../matchRoundService'

/**
 * Hai luật của trang so sánh (`moi/vong-ghep-cap.md`, "Cái màn hình so sánh phải nói"), kiểm ở tầng thuần:
 * kết luận suy từ ba trục siêu dữ liệu — không từ điểm — và điểm chỉ trừ cho nhau khi cùng chế độ.
 */
const round = (over: Partial<MatchRound>): MatchRound => ({
  id: over.id ?? 'r',
  subject: { kind: 'DEMAND_BRIEF', id: 's' },
  searchEngineVersion: 'elasticsearch-8.17/legacy-scoring',
  embeddingModelVersion: 'bge-m3',
  scoringMode: 'LEGACY_SCORING',
  candidateCount: 0,
  createdAt: '2026-09-05T00:00:00Z',
  queryText: 'q',
  isAuthoritative: true,
  ...over,
})

const cand = (id: string, rank: number, rawScore: number, matchedChunk = 'đoạn'): MatchCandidate => ({
  id: `${id}-${rank}`,
  roundId: 'r',
  subject: { kind: 'DEMAND_BRIEF', id: 's' },
  candidate: { kind: 'TECHNOLOGY_ASSET', id },
  rawScore,
  matchedChunk,
  chunkIndex: 0,
  rank,
  reason: null,
  // Bộ này kiểm luật so sánh hai vòng, không kiểm phần giải trình — mảng rỗng đúng nghĩa "vòng này không ghi
  // lý do", đúng như vòng nhập từ hệ cũ.
  reasonCodes: [],
  computedAt: '2026-09-05T00:00:00Z',
  updatedAt: '2026-09-05T00:00:00Z',
})

describe('kết luận từ ba trục siêu dữ liệu', () => {
  it('giống hết ba trục → khác biệt đến từ dữ liệu', () => {
    const c = compareRounds(round({ id: 'a' }), round({ id: 'b' }))
    expect(c.verdict).toBe('data')
    expect(c.axes.every((x) => x.same)).toBe(true)
    expect(c.scoresComparable).toBe(true)
  })

  it('khác một trục → có phần từ thuật toán, và điểm KHÔNG so được khi khác chế độ', () => {
    const c = compareRounds(round({}), round({ scoringMode: 'CORRECTED_SCORING', searchEngineVersion: 'elasticsearch-8.17/corrected-rrf' }))
    expect(c.verdict).toBe('algorithm')
    expect(c.axes.filter((x) => !x.same).map((x) => x.key)).toEqual(['scoringMode', 'searchEngineVersion'])
    expect(c.scoresComparable).toBe(false)
  })

  it('đổi mô hình nhúng, cùng chế độ → thuật toán, nhưng điểm vẫn cùng đơn vị', () => {
    const c = compareRounds(round({}), round({ embeddingModelVersion: 'bge-m3-v2' }))
    expect(c.verdict).toBe('algorithm')
    expect(c.scoresComparable).toBe(true)
  })

  it('một bên nhập từ hệ cũ → không kết luận được, dù nhãn chế độ giống nhau', () => {
    const c = compareRounds(round({}), round({ searchEngineVersion: LEGACY_IMPORTED_ENGINE, queryText: null }))
    expect(c.verdict).toBe('incomparable')
    expect(c.importedSide).toBe('b')
    expect(c.scoresComparable).toBe(false)
  })
})

describe('hợp nhất hai danh sách ứng viên', () => {
  it('mỗi bản ghi một dòng với hạng ở A, hạng ở B, và có ở đâu', () => {
    const rows = mergeCandidates([cand('x', 1, 9), cand('y', 2, 3)], [cand('y', 1, 0.03), cand('z', 2, 0.01)], { scoresComparable: false })
    expect(rows.map((r) => [r.candidate.id, r.rankA, r.rankB, r.presence])).toEqual([
      ['x', 1, null, 'a-only'],
      ['y', 2, 1, 'both'],
      ['z', null, 2, 'b-only'],
    ])
    expect(rows.every((r) => r.scoreDelta === null)).toBe(true)
  })

  it('hiệu số điểm chỉ khi cùng chế độ, và chỉ ở dòng có cả hai bên', () => {
    const rows = mergeCandidates([cand('x', 1, 9), cand('y', 2, 3)], [cand('y', 1, 5)], { scoresComparable: true })
    const y = rows.find((r) => r.candidate.id === 'y')!
    expect(y.scoreDelta).toBe(2)
    expect(rows.find((r) => r.candidate.id === 'x')!.scoreDelta).toBeNull()
  })

  it('giữ cả hai đoạn khớp — đoạn đổi thường là lý do thật khiến một bản ghi rơi hạng', () => {
    const rows = mergeCandidates([cand('y', 1, 9, 'đoạn cũ')], [cand('y', 3, 1, 'đoạn mới')], { scoresComparable: true })
    expect(rows[0].chunkA).toBe('đoạn cũ')
    expect(rows[0].chunkB).toBe('đoạn mới')
  })
})
