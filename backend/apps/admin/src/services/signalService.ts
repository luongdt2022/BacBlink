import { apiClientV2 } from '@/lib/api/client'

/**
 * Tín hiệu nhu cầu từ nguồn ngoài — `GET|POST /api/v2/demand-signals` (ADR-0011).
 *
 * **Tín hiệu không phải nhu cầu đã đủ điều kiện.** Nó không có giai đoạn, không có môi giới, không nằm trong ma
 * trận §7.4, và không có đường nào biến nó thành đề bài mà không có người quyết định. Giao diện phải giữ đúng
 * khoảng cách đó: gộp hai thứ vào một danh sách là cách nhanh nhất để một tín hiệu chưa ai xác minh được đối xử
 * như một nhu cầu có chủ và có ngân sách.
 */

export interface DemandSignal {
  id: string
  sourceRecordId: string
  /** Mã hệ nguồn. Rỗng nghĩa là bản ghi nguồn đã mất — đó là lỗi dữ liệu, không phải trạng thái bình thường. */
  source: string
  signalClass: string
  title: string
  summary: string | null
  buyerName: string | null
  sectorIds: string[]
  budgetAmount: number | null
  budgetCurrency: string | null
  observedAt: string | null
  status: string
  convertedDemandBriefId: string | null
  decisionReason: string | null
  version: number
  createdAt: string
}

export interface Page<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const SIGNAL_CLASS_LABELS: Record<string, string> = {
  TENDER_TECH_SIGNAL: 'Nhu cầu có yếu tố công nghệ',
  UNMET_TENDER: 'Không ai đáp ứng được',
}

/**
 * `UNMET_TENDER` là loại đáng chú ý nhất: có chủ, có ngân sách đã duyệt, có thời hạn, và thị trường không giải
 * được. Giao diện làm nổi nó lên chứ không xếp ngang với loại còn lại.
 */
export const HIGH_VALUE_SIGNAL_CLASS = 'UNMET_TENDER'

export const SIGNAL_STATUS_LABELS: Record<string, string> = {
  NEW: 'Chưa xử lý',
  CONVERTED: 'Đã thành đề bài',
  REJECTED: 'Đã loại',
}

export interface SignalFilters {
  status?: string
  signalClass?: string
  page?: number
}

export function formatBudget(amount: number | null, currency: string | null): string {
  if (amount === null) return '—'
  const formatted = new Intl.NumberFormat('vi-VN').format(amount)
  return currency ? `${formatted} ${currency}` : formatted
}

// ─── Lời gọi ─────────────────────────────────────────────────────────────────────────────────

export async function listSignals(filters: SignalFilters): Promise<Page<DemandSignal>> {
  const { data } = await apiClientV2.get<Page<DemandSignal>>('/demand-signals', {
    params: {
      status: filters.status || undefined,
      signalClass: filters.signalClass || undefined,
      page: filters.page ?? 1,
      limit: 20,
    },
  })
  return data
}

export async function getSignal(id: string): Promise<DemandSignal> {
  const { data } = await apiClientV2.get<DemandSignal>(`/demand-signals/${id}`)
  return data
}

export interface IngestSignalInput {
  source: string
  externalId: string
  license: string
  authorityLevel: string
  signalClass: string
  title: string
  summary?: string
  buyerName?: string
  sourceUrl?: string
  budgetAmount?: number
  budgetCurrency?: string
  observedAt?: string
}

/**
 * Nạp một tín hiệu. `contentHash` cố ý **không** có trong input: với bản ghi nhập tay, máy chủ băm chính nội dung
 * đã nộp, vì nội dung đã nộp chính là ảnh chụp nguồn. Client tự bịa một hash sẽ làm hỏng phép phát hiện
 * "nguồn đã sửa bản ghi".
 */
export async function ingestSignal(input: IngestSignalInput, idempotencyKey: string): Promise<DemandSignal> {
  const { data } = await apiClientV2.post<DemandSignal>('/demand-signals', input, { idempotencyKey })
  return data
}

export async function markSignalConverted(
  id: string,
  demandBriefId: string,
  expectedVersion: number,
  idempotencyKey: string,
): Promise<DemandSignal> {
  const { data } = await apiClientV2.post<DemandSignal>(
    `/demand-signals/${id}/converted`,
    { demandBriefId, expectedVersion },
    { idempotencyKey, expectedVersion },
  )
  return data
}

export async function rejectSignal(
  id: string,
  reason: string,
  expectedVersion: number,
  idempotencyKey: string,
): Promise<DemandSignal> {
  const { data } = await apiClientV2.post<DemandSignal>(
    `/demand-signals/${id}/reject`,
    { reason, expectedVersion },
    { idempotencyKey, expectedVersion },
  )
  return data
}
