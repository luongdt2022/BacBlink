import { apiClientV2 } from '@/lib/api/client'

/**
 * Ba kết quả, và chúng đến từ hai tầng khác nhau (ADR-0006): `ALLOW`/`DENY` là quyết định của cửa phân quyền —
 * được phép hay không; `SUCCESS` là của tầng lệnh, ghi sau khi giao dịch xong — việc đã xảy ra. Một lệnh được
 * phép nhưng thất bại ở bước sau để lại `ALLOW` mà không có `SUCCESS`; người đọc phân biệt bằng hai dòng.
 */
export type AuditOutcome = 'ALLOW' | 'DENY' | 'SUCCESS'

export const OUTCOME_LABELS: Record<AuditOutcome, string> = {
  ALLOW: 'Cho phép',
  DENY: 'Từ chối',
  SUCCESS: 'Đã thực hiện',
}

export interface AuditEvent {
  id: string
  /** **Mã** người thao tác, không phải tên. Nhật ký sống lâu hơn dữ liệu nhân sự, nên nó không mang PII. */
  actorRef: string | null
  actorRole: string
  action: string
  objectKind: string
  objectId: string | null
  /** Trống ở gần như mọi dòng — bảng quyết định không ghi số phiên bản. Đừng dành chỗ cố định cho nó. */
  objectVersion: number | null
  purpose: string | null
  outcome: AuditOutcome
  /** Dạng ghép `phiên-bản-bộ-quy-tắc:mã-quy-tắc`. Xem {@link splitRuleId}. */
  ruleId: string | null
  correlationId: string
  occurredAt: string
  details: string | null
}

export interface AuditEventDetail extends AuditEvent {
  ipAddress: string | null
  userAgent: string | null
  /**
   * Mốc mà từ đó dấu vết thiết bị còn được giữ. Máy chủ tính từ cấu hình thời hạn lưu; giao diện **không được
   * tự suy** trạng thái thiết bị từ giá trị rỗng.
   */
  deviceDataRetainedFrom: string
}

export interface AuditPage {
  data: AuditEvent[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AuditFilters {
  actorRef?: string
  objectKind?: string
  objectId?: string
  outcome?: AuditOutcome
  from?: string
  to?: string
  page?: number
  limit?: number
}

/**
 * Mã quy tắc lưu dưới dạng ghép, ví dụ `authz-v1:DENY_CONFIDENTIAL_WITHOUT_GRANT`.
 *
 * Hai phần trả lời hai câu hỏi khác nhau: **phiên bản bộ quy tắc** trả lời *"lúc đó luật là gì"*, **mã quy tắc**
 * trả lời *"quy tắc nào đã quyết"*. Hiện thẳng chuỗi ghép cho ra một cột khó đọc; gộp hai dòng cùng mã nhưng
 * khác phiên bản là gộp hai quyết định khác nhau.
 */
export function splitRuleId(ruleId: string | null): { ruleSetVersion: string | null; rule: string | null } {
  if (!ruleId) return { ruleSetVersion: null, rule: null }
  const idx = ruleId.indexOf(':')
  if (idx <= 0) return { ruleSetVersion: null, rule: ruleId }
  return { ruleSetVersion: ruleId.slice(0, idx), rule: ruleId.slice(idx + 1) }
}

/**
 * Ba trạng thái mà một ô IP rỗng đang gộp làm một. Người đọc kết luận "không có thiết bị nào" trong khi sự
 * thật có thể là "đã có, đã bị cắt theo chính sách" — và đó là chỗ một cuộc điều tra đi sai hướng.
 */
export type DeviceTraceState = 'present' | 'purged' | 'never-recorded'

export function deviceTraceState(detail: AuditEventDetail): DeviceTraceState {
  if (detail.ipAddress || detail.userAgent) return 'present'
  return detail.occurredAt < detail.deviceDataRetainedFrom ? 'purged' : 'never-recorded'
}

export async function listAuditEvents(filters: AuditFilters): Promise<AuditPage> {
  const { data } = await apiClientV2.get<AuditPage>('/audit-events', {
    params: {
      actorRef: filters.actorRef || undefined,
      objectKind: filters.objectKind || undefined,
      objectId: filters.objectId || undefined,
      outcome: filters.outcome || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    },
  })
  return data
}

export async function getAuditEvent(id: string): Promise<AuditEventDetail> {
  const { data } = await apiClientV2.get<AuditEventDetail>(`/audit-events/${id}`)
  return data
}

/**
 * Danh sách loại đối tượng cho ô chọn.
 *
 * Máy chủ **không** trả danh sách này, nên giao diện phải tự dựng từ một danh mục cố định. Ô gõ tự do không
 * dùng được: người dùng không đoán được `CommercializationCase` viết thế nào.
 */
export const OBJECT_KINDS = [
  'AuditEvent',
  'CommercializationCase',
  'DemandBrief',
  'Document',
  'DocumentList',
  'MatchRound',
  'Person',
  'Search',
  'Story',
  'TechnologyAsset',
] as const
