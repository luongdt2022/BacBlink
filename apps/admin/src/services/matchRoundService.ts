import { apiClientV2 } from '@/lib/api/client'

/**
 * Vòng ghép cặp — `GET /api/v2/subjects/{kind}/{id}/match-rounds[/latest]`, `.../match-candidates`, và từ
 * 2026-09-05 `GET /api/v2/match-rounds/{roundId}[/candidates]`. Mục đích chính của việc giữ vòng cũ là **so
 * được hai vòng** (`moi/vong-ghep-cap.md`), và hai luật so sánh nằm ở đây dưới dạng hàm thuần để test được.
 */
export type SubjectKindPath = 'demand-briefs' | 'technology-assets' | 'commercialization-cases'

export const SUBJECT_KIND_PATHS: ReadonlyArray<{ path: SubjectKindPath; label: string }> = [
  { path: 'demand-briefs', label: 'Đề bài (nhu cầu)' },
  { path: 'technology-assets', label: 'Tài sản công nghệ' },
  { path: 'commercialization-cases', label: 'Hồ sơ vụ việc' },
]

export interface SubjectRef {
  kind: string
  id: string
}

export interface MatchRound {
  id: string
  subject: SubjectRef
  searchEngineVersion: string
  embeddingModelVersion: string
  scoringMode: string
  candidateCount: number
  createdAt: string
  /** `null` ở vòng nhập từ hệ cũ — không dựng lại được nó đã hỏi gì. */
  queryText: string | null
  isAuthoritative: boolean
}

export interface MatchCandidate {
  id: string
  roundId: string
  subject: SubjectRef
  candidate: SubjectRef
  rawScore: number
  matchedChunk: string
  chunkIndex: number
  rank: number
  /** Nhãn thuật toán — **giống nhau cho cả vòng**, nên nó chưa bao giờ là một lý do theo nghĩa nguyên tắc 11. */
  reason: string | null
  /** Lý do của riêng ứng viên này. Rỗng ở vòng nhập từ hệ cũ: hệ cũ không ghi lý do, và rỗng nghĩa là *không biết*. */
  reasonCodes: string[]
  computedAt: string
  updatedAt: string
}

/**
 * Ứng viên đã được thu hồi nhưng bị loại — vế thứ hai của nguyên tắc 11, trước 2026-09-06 không tồn tại ở đâu.
 * Không có nó thì câu "vì sao không phải công ty B" chỉ trả lời được bằng cách dựng lại shortlist bằng tay.
 */
export interface MatchExclusion {
  id: string
  roundId: string
  candidate: SubjectRef
  /** `null` khi ứng viên bị loại **trước** bước chấm điểm. */
  rawScore: number | null
  reasonCode: string
  detail: string | null
  computedAt: string
}

export type ExclusionPage = Page<MatchExclusion>

export const REASON_CODE_LABELS: Record<string, string> = {
  SEMANTIC_MATCH: 'Khớp ngữ nghĩa',
  SECTOR_OVERLAP: 'Trùng lĩnh vực',
  RERANKED_TOP: 'Trụ lại sau xếp lại',
  PROVEN_DELIVERY: 'Đã từng giao hàng',
  VERIFIED_OUTCOME: 'Có outcome đã xác minh',
  NO_DELIVERY_HISTORY: 'Chưa có lịch sử giao hàng',
}

export const EXCLUSION_CODE_LABELS: Record<string, string> = {
  BELOW_THRESHOLD: 'Dưới ngưỡng điểm',
  BEYOND_LIMIT: 'Vượt số lượng tối đa',
  OWNER_EXCLUDED: 'Cùng chủ sở hữu',
  NOT_PUBLISHED: 'Chưa xuất bản',
  UNRESOLVABLE: 'Không phân giải được nội dung',
}

/**
 * `NO_DELIVERY_HISTORY` **không phải điểm trừ** — bên mới luôn bắt đầu ở đó, và nguyên tắc 5 cấm biến việc
 * thiếu bằng chứng thành tín hiệu tiêu cực. Giao diện vì thế tô nó trung tính, không tô đỏ.
 */
export const NEUTRAL_REASON_CODES: ReadonlySet<string> = new Set(['NO_DELIVERY_HISTORY'])

export interface Page<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type CandidatePage = Page<MatchCandidate>

export interface RoundFilters {
  scoringMode?: string
  searchEngineVersion?: string
  page?: number
}

export const SCORING_MODE_LABELS: Record<string, string> = {
  LEGACY_SCORING: 'Chấm điểm kiểu cũ',
  CORRECTED_SCORING: 'Chấm điểm đã sửa',
}

/**
 * Ba phiên bản công cụ, và loại thứ ba **không phải một lần tính**: vòng được di trú từ bảng ghép cặp của hệ
 * NestJS, điểm chép nguyên, không có câu truy vấn. Nó phải được đánh dấu ở mọi chỗ xuất hiện.
 */
export const LEGACY_IMPORTED_ENGINE = 'nestjs-intake_matches/imported'

/**
 * Từ 2026-09-05 (ADR-0010) mọi vòng mới tính bằng PostgreSQL (pgvector + FTS). Hai nhãn Elasticsearch giữ lại
 * để vòng nào từng tính bằng chúng vẫn đọc được — chúng là **lịch sử**, không phải lựa chọn.
 */
export const ENGINE_LABELS: Record<string, string> = {
  'postgres-16/pgvector-legacy': 'PostgreSQL (pgvector), chấm điểm kiểu cũ',
  'postgres-16/pgvector-rrf': 'PostgreSQL (pgvector), chấm điểm đã sửa',
  'postgres-16/pgvector-rrf-rerank': 'PostgreSQL (pgvector), đã sửa + cross-encoder rerank',
  'postgres-16/pgvector-rrf3-rerank': 'PostgreSQL (pgvector + sparse), đã sửa + cross-encoder rerank',
  'elasticsearch-8.17/legacy-scoring': 'Elasticsearch (đã gỡ), chấm điểm kiểu cũ',
  'elasticsearch-8.17/corrected-rrf': 'Elasticsearch (đã gỡ), chấm điểm đã sửa',
  [LEGACY_IMPORTED_ENGINE]: 'Nhập từ hệ cũ (không tính lại)',
}

export const ENGINE_OPTIONS = Object.keys(ENGINE_LABELS)

export function isImportedRound(round: Pick<MatchRound, 'searchEngineVersion'>): boolean {
  return round.searchEngineVersion === LEGACY_IMPORTED_ENGINE
}

/**
 * Điểm thô của hai chế độ **không cùng đơn vị** — chế độ cũ cộng hai thang khác nhau, không trần; chế độ đã
 * sửa là tổng các phân số nghịch đảo thứ hạng, gần như luôn rất nhỏ. Màn hình hiện số nhưng không vẽ trục,
 * không tính hiệu số giữa hai chế độ. Hàm này chỉ định dạng cho dễ đọc theo từng chế độ.
 */
export function formatRawScore(score: number, scoringMode: string): string {
  if (scoringMode === 'CORRECTED_SCORING') return score.toFixed(4)
  return score.toFixed(2)
}

// ─── So sánh hai vòng ─────────────────────────────────────────────────────────────────────────

export type CompareVerdict = 'data' | 'algorithm' | 'incomparable'

export interface CompareAxis {
  key: 'scoringMode' | 'searchEngineVersion' | 'embeddingModelVersion'
  label: string
  a: string
  b: string
  same: boolean
}

export interface Comparison {
  verdict: CompareVerdict
  axes: CompareAxis[]
  /** Chỉ khi cùng chế độ VÀ không bên nào là vòng nhập từ hệ cũ thì hiệu số điểm mới có nghĩa. */
  scoresComparable: boolean
  importedSide: 'a' | 'b' | 'both' | null
}

/**
 * Phần đầu của trang so sánh — kết luận suy từ **siêu dữ liệu**, không từ điểm:
 * giống hết ba trục → khác biệt đến từ dữ liệu; khác ít nhất một trục → có phần đến từ thuật toán, và không
 * tách được hai nguồn; một bên nhập từ hệ cũ → **không kết luận được**, vì một bên là kết quả đo, một bên là
 * dữ liệu chép sang.
 */
export function compareRounds(a: MatchRound, b: MatchRound): Comparison {
  const axes: CompareAxis[] = [
    { key: 'scoringMode', label: 'Chế độ chấm điểm', a: a.scoringMode, b: b.scoringMode, same: a.scoringMode === b.scoringMode },
    { key: 'searchEngineVersion', label: 'Phiên bản công cụ', a: a.searchEngineVersion, b: b.searchEngineVersion, same: a.searchEngineVersion === b.searchEngineVersion },
    { key: 'embeddingModelVersion', label: 'Mô hình nhúng', a: a.embeddingModelVersion, b: b.embeddingModelVersion, same: a.embeddingModelVersion === b.embeddingModelVersion },
  ]
  const ia = isImportedRound(a)
  const ib = isImportedRound(b)
  const importedSide = ia && ib ? 'both' : ia ? 'a' : ib ? 'b' : null
  const verdict: CompareVerdict = importedSide ? 'incomparable' : axes.every((x) => x.same) ? 'data' : 'algorithm'
  return {
    verdict,
    axes,
    scoresComparable: importedSide === null && a.scoringMode === b.scoringMode,
    importedSide,
  }
}

export type Presence = 'both' | 'a-only' | 'b-only'

export interface MergedCandidate {
  key: string
  candidate: SubjectRef
  rankA: number | null
  rankB: number | null
  scoreA: number | null
  scoreB: number | null
  chunkA: string | null
  chunkB: string | null
  presence: Presence
  /** `null` khi hiệu số không có nghĩa (khác chế độ, hoặc thiếu một bên). */
  scoreDelta: number | null
}

/**
 * Phần sau — hợp nhất hai danh sách ứng viên: mỗi dòng một bản ghi, xếp hạng ở A và ở B, có ở đâu. Sắp theo
 * hạng tốt nhất ở bất kỳ bên nào, rồi theo bên A. Điểm **chỉ trừ cho nhau khi hai vòng cùng chế độ** — và
 * kể cả khi đó, đoạn khớp đổi thường là lý do thật khiến một bản ghi rơi hạng, nên cả hai đoạn được giữ.
 */
export function mergeCandidates(a: MatchCandidate[], b: MatchCandidate[], comparison: Pick<Comparison, 'scoresComparable'>): MergedCandidate[] {
  const keyOf = (c: MatchCandidate) => `${c.candidate.kind}:${c.candidate.id}`
  const rows = new Map<string, MergedCandidate>()
  for (const c of a) {
    rows.set(keyOf(c), { key: keyOf(c), candidate: c.candidate, rankA: c.rank, rankB: null, scoreA: c.rawScore, scoreB: null, chunkA: c.matchedChunk, chunkB: null, presence: 'a-only', scoreDelta: null })
  }
  for (const c of b) {
    const existing = rows.get(keyOf(c))
    if (existing) {
      existing.rankB = c.rank
      existing.scoreB = c.rawScore
      existing.chunkB = c.matchedChunk
      existing.presence = 'both'
      existing.scoreDelta = comparison.scoresComparable && existing.scoreA !== null ? c.rawScore - existing.scoreA : null
    } else {
      rows.set(keyOf(c), { key: keyOf(c), candidate: c.candidate, rankA: null, rankB: c.rank, scoreA: null, scoreB: c.rawScore, chunkA: null, chunkB: c.matchedChunk, presence: 'b-only', scoreDelta: null })
    }
  }
  const best = (r: MergedCandidate) => Math.min(r.rankA ?? Number.MAX_SAFE_INTEGER, r.rankB ?? Number.MAX_SAFE_INTEGER)
  return [...rows.values()].sort((x, y) => best(x) - best(y) || (x.rankA ?? Number.MAX_SAFE_INTEGER) - (y.rankA ?? Number.MAX_SAFE_INTEGER))
}

// ─── Lời gọi ─────────────────────────────────────────────────────────────────────────────────

/** `null` = subject **chưa từng được tính** (máy chủ trả 204). Khác với vòng có 0 ứng viên. */
export async function getLatestRound(kind: SubjectKindPath, id: string): Promise<MatchRound | null> {
  const res = await apiClientV2.get<MatchRound | ''>(`/subjects/${kind}/${id}/match-rounds/latest`)
  if (res.status === 204 || !res.data) return null
  return res.data
}

export async function listCandidates(kind: SubjectKindPath, id: string, page: number, limit = 20): Promise<CandidatePage> {
  const { data } = await apiClientV2.get<CandidatePage>(`/subjects/${kind}/${id}/match-candidates`, {
    params: { page, limit },
  })
  return data
}

export async function listRounds(kind: SubjectKindPath, id: string, filters: RoundFilters): Promise<Page<MatchRound>> {
  const { data } = await apiClientV2.get<Page<MatchRound>>(`/subjects/${kind}/${id}/match-rounds`, {
    params: {
      scoringMode: filters.scoringMode || undefined,
      searchEngineVersion: filters.searchEngineVersion || undefined,
      page: filters.page ?? 1,
      limit: 20,
    },
  })
  return data
}

export async function getRound(roundId: string): Promise<MatchRound> {
  const { data } = await apiClientV2.get<MatchRound>(`/match-rounds/${roundId}`)
  return data
}

/** Trang so sánh cần **toàn bộ** ứng viên của một vòng; trần phân trang của máy chủ là 100. */
export async function listRoundCandidates(roundId: string, page = 1, limit = 100): Promise<CandidatePage> {
  const { data } = await apiClientV2.get<CandidatePage>(`/match-rounds/${roundId}/candidates`, { params: { page, limit } })
  return data
}

/**
 * Ứng viên **bị loại** của một vòng, máy chủ xếp theo điểm giảm dần — người trượt sát ngưỡng nhất đứng đầu,
 * vì đó là chỗ quyết định dễ sai nhất. Giao diện giữ nguyên thứ tự đó, không sắp lại.
 */
export async function listRoundExclusions(roundId: string, page = 1, limit = 100): Promise<ExclusionPage> {
  const { data } = await apiClientV2.get<ExclusionPage>(`/match-rounds/${roundId}/exclusions`, { params: { page, limit } })
  return data
}
