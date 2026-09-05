import { apiClientV2, normalizeError } from '@/lib/api/client'
import type { Operation } from '@/lib/api/client'

/**
 * Hồ sơ vụ việc — `/api/v2/cases`. Đặc tả `docs-v2/api-v2/case-va-quyet-dinh.md`, màn hình
 * `docs-v2/moi/console-ho-so-vu-viec.md`.
 *
 * Ma trận chuyển và luật chọn loại quyết định được **chép lại** ở đây từ `TransitionMatrix` và
 * `Decisions.RequiredForStage` phía máy chủ. Đó là dữ liệu cố định, không đổi theo hồ sơ, và giao diện cần nó
 * để chỉ hiện đích đi tới được và chọn sẵn loại quyết định. Hai bản phải khớp; bốn mã 422 về ma trận
 * (`TRANSITION_NOT_ALLOWED`, `*_DECISION_REQUIRED`) là tín hiệu chúng đã lệch.
 */
export const MAIN_STAGES = [
  'DISCOVERY',
  'QUALIFICATION',
  'MATCHING',
  'DUE_DILIGENCE',
  'DEAL_DESIGN',
  'EXECUTION',
  'OUTCOME_VERIFICATION',
  'COMMERCIALIZATION_MONITORING',
  'CLOSED',
] as const

export const TERMINAL_OUTLETS = ['REJECTED', 'WITHDRAWN', 'CANCELLED'] as const

export const STAGES = [...MAIN_STAGES, ...TERMINAL_OUTLETS] as const

export type CaseStage = (typeof STAGES)[number]

export const TERMINAL_STAGES: ReadonlySet<CaseStage> = new Set<CaseStage>(['CLOSED', 'REJECTED', 'WITHDRAWN', 'CANCELLED'])

export const STAGE_LABELS: Record<string, string> = {
  DISCOVERY: 'Khám phá',
  QUALIFICATION: 'Thẩm định',
  MATCHING: 'Ghép cặp',
  DUE_DILIGENCE: 'Thẩm tra',
  DEAL_DESIGN: 'Thiết kế thương vụ',
  EXECUTION: 'Thi công',
  OUTCOME_VERIFICATION: 'Xác minh kết quả',
  COMMERCIALIZATION_MONITORING: 'Theo dõi thương mại hoá',
  CLOSED: 'Đã đóng',
  REJECTED: 'Bị từ chối',
  WITHDRAWN: 'Đã rút lui',
  CANCELLED: 'Đã huỷ',
}

export const TRACK_LABELS: Record<string, string> = {
  CHALLENGE_PILOT: 'Thí điểm theo bài toán',
  TECHNOLOGY_TRANSFER: 'Chuyển giao công nghệ',
  SHARED_INFRASTRUCTURE: 'Hạ tầng dùng chung',
}

export type Decision = 'APPROVE' | 'REJECT' | 'RETURN_FOR_REWORK' | 'WAIVE' | 'WITHDRAW' | 'CANCEL'

export const DECISION_LABELS: Record<string, string> = {
  APPROVE: 'Chấp thuận',
  REJECT: 'Từ chối',
  RETURN_FOR_REWORK: 'Trả về làm lại',
  WAIVE: 'Miễn điều kiện',
  WITHDRAW: 'Rút lui',
  CANCEL: 'Huỷ',
}

export const ROLE_LABELS: Record<string, string> = {
  PROBLEM_OWNER: 'Chủ bài toán',
  LEAD_BROKER: 'Môi giới chính',
  CO_BROKER: 'Đồng môi giới',
  PROVIDER: 'Bên cung',
  EVALUATOR: 'Bên đánh giá',
  VERIFIER: 'Người xác minh',
  SPONSOR: 'Nhà tài trợ',
}

/** Ma trận §7.4, chép từ `TransitionMatrix.Allowed`. */
const TRANSITIONS: Record<CaseStage, readonly CaseStage[]> = {
  DISCOVERY: ['QUALIFICATION', 'REJECTED', 'WITHDRAWN'],
  QUALIFICATION: ['MATCHING', 'DISCOVERY', 'REJECTED', 'WITHDRAWN'],
  MATCHING: ['DUE_DILIGENCE', 'QUALIFICATION', 'REJECTED', 'WITHDRAWN'],
  DUE_DILIGENCE: ['DEAL_DESIGN', 'MATCHING', 'REJECTED', 'WITHDRAWN'],
  DEAL_DESIGN: ['EXECUTION', 'DUE_DILIGENCE', 'WITHDRAWN', 'CANCELLED'],
  EXECUTION: ['OUTCOME_VERIFICATION', 'CANCELLED'],
  OUTCOME_VERIFICATION: ['COMMERCIALIZATION_MONITORING', 'EXECUTION', 'CLOSED'],
  COMMERCIALIZATION_MONITORING: ['CLOSED'],
  CLOSED: [],
  REJECTED: [],
  WITHDRAWN: [],
  CANCELLED: [],
}

/** Giai đoạn kết thúc nào đòi loại quyết định nào — chép từ `Decisions.RequiredForStage` (ADR-0008). */
const REQUIRED_DECISION: Partial<Record<CaseStage, Decision>> = {
  REJECTED: 'REJECT',
  WITHDRAWN: 'WITHDRAW',
  CANCELLED: 'CANCEL',
}

export function isTerminal(stage: string): boolean {
  return TERMINAL_STAGES.has(stage as CaseStage)
}

export function reachableStages(from: string): CaseStage[] {
  return [...(TRANSITIONS[from as CaseStage] ?? [])]
}

/** Lùi = đích đứng trước nguồn trong thứ tự chín giai đoạn chính. Đường ra kết thúc không phải lùi. */
export function isBackward(from: string, to: string): boolean {
  const f = MAIN_STAGES.indexOf(from as (typeof MAIN_STAGES)[number])
  const t = MAIN_STAGES.indexOf(to as (typeof MAIN_STAGES)[number])
  return f >= 0 && t >= 0 && t < f
}

/**
 * Loại quyết định hợp lệ cho một hướng chuyển. Hai lựa chọn khi tiến; **một** khi lùi hoặc ra giai đoạn kết
 * thúc — và một lựa chọn thì ô chọn không nên tồn tại.
 */
export function decisionOptionsFor(from: string, to: string): Decision[] {
  const required = REQUIRED_DECISION[to as CaseStage]
  if (required) return [required]
  if (isBackward(from, to)) return ['RETURN_FOR_REWORK']
  return ['APPROVE', 'WAIVE']
}

/** Chữ trên nút theo giai đoạn: "Từ chối" chỉ tới hết thẩm tra; sau đó là "Rút lui" hoặc "Huỷ". */
export function transitionVerb(from: string, to: string): string {
  switch (to) {
    case 'REJECTED': return 'Từ chối'
    case 'WITHDRAWN': return 'Rút lui'
    case 'CANCELLED': return 'Huỷ'
    case 'CLOSED': return 'Đóng hồ sơ'
    default:
      return isBackward(from, to) ? `Trả về ${STAGE_LABELS[to] ?? to}` : `Chuyển sang ${STAGE_LABELS[to] ?? to}`
  }
}

export interface CaseParty {
  personId: string
  role: string
  since: string
  until: string | null
}

export interface CaseHold {
  id: string
  reason: string
  openedByActorRef: string | null
  openedAt: string
  releasedAt: string | null
  releaseDecisionRecordId: string | null
}

export interface CaseRecord {
  id: string
  caseCode: string
  track: string
  stage: CaseStage
  title: string
  problemOwnerPersonId: string
  leadBrokerPersonId: string | null
  demandBriefId: string
  demandBriefVersionNo: number
  policySnapshotId: string | null
  confidentialityLevel: string
  budgetPathStatus: string
  targetDecisionAt: string | null
  hasOpenHold: boolean
  /** Số phiên bản. **Giao diện phải giữ nó** — mọi lệnh ghi đều cần, và không được tự đoán số mới. */
  version: number
  createdAt: string
  updatedAt: string
  parties: CaseParty[]
  holds: CaseHold[]
}

export interface DecisionRecord {
  id: string
  caseId: string
  fromStage: string
  toStage: string
  decision: string
  reasonCodes: string[]
  rationale: string
  decidedByActorRef: string
  mandateRef: string | null
  policySnapshotId: string | null
  decidedAt: string
  supersedesId: string | null
}

export interface CaseFilters {
  brokerPersonId?: string
  problemOwnerPersonId?: string
  stage?: string
  page?: number
}

export interface CasePage {
  data: CaseRecord[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TransitionBody {
  toStage: CaseStage
  decision: Decision
  reasonCodes: string[]
  rationale: string
  mandateRef: string | null
  expectedVersion: number
}

/**
 * Ba đường thất bại của một lệnh ghi, và chúng cần ba cách xử lý khác nhau ở màn hình: 409 tải lại và giữ
 * diễn giải; 422 hiện câu nói phải làm gì tiếp; 403 nói vai trò nào mới làm được và tắt nút gửi.
 */
export interface WriteFailure {
  kind: 'conflict' | 'rule' | 'forbidden' | 'other'
  code: string | null
  message: string
  previousStage?: CaseStage
  currentStage?: CaseStage
}

export function classifyWriteError(err: unknown): WriteFailure {
  const n = normalizeError(err)
  const code = n.code ?? null
  if (n.status === 409) return { kind: 'conflict', code, message: n.message }
  if (n.status === 422) return { kind: 'rule', code, message: n.message }
  if (n.status === 403) return { kind: 'forbidden', code, message: n.message }
  return { kind: 'other', code, message: n.message }
}

export async function listCases(filters: CaseFilters): Promise<CasePage> {
  const { data } = await apiClientV2.get<CasePage>('/cases', {
    params: {
      brokerPersonId: filters.brokerPersonId || undefined,
      problemOwnerPersonId: filters.problemOwnerPersonId || undefined,
      stage: filters.stage || undefined,
      page: filters.page ?? 1,
      limit: 20,
    },
  })
  return data
}

export async function getCase(id: string): Promise<CaseRecord> {
  const { data } = await apiClientV2.get<CaseRecord>(`/cases/${id}`)
  return data
}

/** Chỉ phần console cần của một đề bài: phiên bản hiện hành, để so với phiên bản hồ sơ đang ghim. */
export interface DemandBriefHead {
  id: string
  title: string
  status: string
  currentVersionNo: number
  version: number
}

/**
 * `GET /api/v2/demand-briefs/{id}` — quyền đọc là luật của đề bài (chủ sở hữu / đã xuất bản / quyền đọc bất
 * kỳ), không phải của hồ sơ. Người đọc được hồ sơ nhưng không đọc được đề bài là một tình huống có thật, và
 * console phải nói "không so được" thay vì im lặng.
 */
export async function getDemandBriefHead(id: string): Promise<DemandBriefHead> {
  const { data } = await apiClientV2.get<DemandBriefHead>(`/demand-briefs/${id}`)
  return data
}

export async function getTimeline(id: string): Promise<DecisionRecord[]> {
  const { data } = await apiClientV2.get<DecisionRecord[]>(`/cases/${id}/timeline`)
  return data
}

/**
 * Số phiên bản đi **cả hai đường**: `expectedVersion` trong thân và `If-Match` do bộ chặn gắn từ
 * `config.expectedVersion`. Máy chủ từ chối khi hai giá trị lệch nhau; ở đây chúng luôn là một số.
 */
export async function transitionCase(id: string, body: TransitionBody, op: Operation): Promise<CaseRecord> {
  const { data } = await apiClientV2.post<CaseRecord>(`/cases/${id}/transition`, body, {
    idempotencyKey: op.key,
    expectedVersion: body.expectedVersion,
  })
  return data
}

export async function assignLeadBroker(id: string, brokerPersonId: string, expectedVersion: number, op: Operation): Promise<CaseRecord> {
  const { data } = await apiClientV2.post<CaseRecord>(`/cases/${id}/lead-broker`, { brokerPersonId, expectedVersion }, {
    idempotencyKey: op.key,
    expectedVersion,
  })
  return data
}

export async function openHold(id: string, reason: string, op: Operation): Promise<CaseRecord> {
  const { data } = await apiClientV2.post<CaseRecord>(`/cases/${id}/holds`, { reason }, { idempotencyKey: op.key })
  return data
}

export async function releaseHold(id: string, holdId: string, rationale: string, op: Operation): Promise<CaseRecord> {
  const { data } = await apiClientV2.post<CaseRecord>(`/cases/${id}/holds/${holdId}/release`, { rationale }, { idempotencyKey: op.key })
  return data
}
