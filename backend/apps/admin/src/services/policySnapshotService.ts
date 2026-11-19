import { apiClientV2 } from '@/lib/api/client'

/**
 * Ảnh chụp chính sách — `GET /api/v2/policy-snapshots/{id}`. Chỉ có đường đọc, và cố ý không có đường tạo:
 * việc chốt luật ở lại bên trong lệnh chuyển giai đoạn của hồ sơ (`moi/anh-chup-chinh-sach.md`).
 */
export interface PolicySnapshot {
  id: string
  caseId: string
  resolvedAt: string
  platformPolicyVersion: string
  trackPolicyVersion: string
  /** Bản **chuẩn hoá** (JCS) đúng nguyên văn — chính là chuỗi đã tính hash. Chép ra là chép được thứ để kiểm. */
  documentJson: string
  documentHash: string
  /** Ảnh chụp mà bản này thay thế, nếu có. Chiều ngược lại ("bị thay bởi") không có trên endpoint này. */
  supersedesId: string | null
}

/** Cấu trúc của `documentJson`. Máy chủ dựng nó ở `PolicySnapshotService.BuildDocument`. */
export interface PolicyDocument {
  track: string
  platformPolicyVersion: string
  trackPolicyVersion: string
  resolvedAt: string
  gates: Record<string, string[]>
  conflictOfInterest: Record<string, boolean>
  retentionClass: string
  canonicalizationVersion: string
}

/** Thứ tự chín giai đoạn chính. Năm giai đoạn không có cổng vẫn phải hiện — "không đặt cổng" khác "chưa tải xong". */
export const STAGES_IN_ORDER = [
  'DISCOVERY',
  'QUALIFICATION',
  'MATCHING',
  'DUE_DILIGENCE',
  'DEAL_DESIGN',
  'EXECUTION',
  'OUTCOME_VERIFICATION',
  'COMMERCIALIZATION_MONITORING',
  'CLOSED',
  'REJECTED',
  'WITHDRAWN',
  'CANCELLED',
] as const

export const GATE_LABELS: Record<string, string> = {
  PROBLEM_OWNER: 'Có chủ bài toán',
  LEAD_BROKER: 'Có môi giới chính',
  ACTIVE_DEMAND_VERSION: 'Phiên bản đề bài đang hiệu lực',
  BUDGET_PATH: 'Đã xác định đường ngân sách',
  HARD_FILTER: 'Đã lọc cứng',
  REASON_PER_CANDIDATE: 'Có lý do cho từng ứng viên',
  MANDATORY_EVALUATION: 'Bắt buộc có đánh giá',
  TERMS_FROZEN: 'Điều khoản đã đóng băng',
  OUTCOME_DEFINITION_FROZEN: 'Định nghĩa kết quả đã đóng băng',
  FEE_AGREEMENT_FROZEN: 'Thoả thuận phí đã đóng băng',
  AGREEMENT_EFFECTIVE: 'Thoả thuận có hiệu lực',
  EXECUTION_PLAN_FROZEN: 'Kế hoạch thi công đã đóng băng',
  INDEPENDENT_VERIFIER: 'Có người xác minh độc lập',
  NO_OPEN_OBLIGATION: 'Không còn nghĩa vụ mở',
}

export const COI_LABELS: Record<string, string> = {
  verifierCannotBeProvider: 'Người xác minh không được đồng thời là bên cung',
  verifierCannotBeLeadBroker: 'Người xác minh không được là môi giới chính',
  verifierCannotBeBeneficiary: 'Người xác minh không được là bên hưởng lợi',
}

/**
 * `null` khi chuỗi không phải JSON hợp lệ. Màn hình vẫn phải hiện được hash và bản thô trong trường hợp đó —
 * một tài liệu không đọc được vẫn là tài liệu đã áp.
 */
export function parsePolicyDocument(json: string): PolicyDocument | null {
  try {
    const value = JSON.parse(json) as Partial<PolicyDocument>
    if (!value || typeof value !== 'object' || typeof value.gates !== 'object') return null
    return {
      track: String(value.track ?? ''),
      platformPolicyVersion: String(value.platformPolicyVersion ?? ''),
      trackPolicyVersion: String(value.trackPolicyVersion ?? ''),
      resolvedAt: String(value.resolvedAt ?? ''),
      gates: (value.gates ?? {}) as Record<string, string[]>,
      conflictOfInterest: (value.conflictOfInterest ?? {}) as Record<string, boolean>,
      retentionClass: String(value.retentionClass ?? ''),
      canonicalizationVersion: String(value.canonicalizationVersion ?? ''),
    }
  } catch {
    return null
  }
}

export async function getPolicySnapshot(id: string): Promise<PolicySnapshot> {
  const { data } = await apiClientV2.get<PolicySnapshot>(`/policy-snapshots/${id}`)
  return data
}
