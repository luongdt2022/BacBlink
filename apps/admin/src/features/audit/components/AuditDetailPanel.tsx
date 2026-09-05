import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { getErrorMessage } from '@/lib/api/client'
import { OUTCOME_LABELS, deviceTraceState, getAuditEvent, splitRuleId } from '@/services/auditService'
import type { AuditEventDetail } from '@/services/auditService'

interface AuditDetailPanelProps {
  eventId: string
  onClose: () => void
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 break-all">{children}</dd>
    </div>
  )
}

/**
 * Dấu vết thiết bị: **ba** trạng thái, không phải hai.
 *
 * Một ô trống không nhãn gộp cả ba lại, và người đọc kết luận "không có thiết bị nào" trong khi sự thật có thể
 * là "đã có, đã hết hạn lưu, đã bị cắt theo chính sách". Trạng thái được suy từ mốc do **máy chủ** trả về,
 * không phải từ một con số viết cứng ở đây — đổi thời hạn lưu ở cấu hình thì màn hình đi theo.
 */
function DeviceTrace({ detail }: { detail: AuditEventDetail }) {
  const state = deviceTraceState(detail)
  const retainedFrom = new Date(detail.deviceDataRetainedFrom).toLocaleDateString('vi-VN')

  if (state === 'present') {
    return (
      <>
        <Row label="Địa chỉ IP">{detail.ipAddress ?? '—'}</Row>
        <Row label="Trình duyệt">{detail.userAgent ?? '—'}</Row>
      </>
    )
  }

  if (state === 'purged') {
    return (
      <Row label="Dấu vết thiết bị">
        <span className="text-amber-700">
          Đã hết hạn lưu và bị cắt theo chính sách. Hệ thống chỉ giữ dấu vết thiết bị từ {retainedFrom}.
        </span>
      </Row>
    )
  }

  return (
    <Row label="Dấu vết thiết bị">
      <span className="text-gray-500">
        Không áp dụng — hành động không đến từ một trình duyệt (tác vụ nền hoặc tiến trình hệ thống).
      </span>
    </Row>
  )
}

export function AuditDetailPanel({ eventId, onClose }: AuditDetailPanelProps) {
  const [detail, setDetail] = useState<AuditEventDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setDetail(null)
    setError(null)
    getAuditEvent(eventId)
      .then((d) => { if (!cancelled) setDetail(d) })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err)) })
    return () => { cancelled = true }
  }, [eventId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const { ruleSetVersion, rule } = splitRuleId(detail?.ruleId ?? null)

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/30" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết dòng kiểm toán"
        className="w-full max-w-lg h-full bg-white shadow-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Chi tiết dòng kiểm toán</h2>
          <button onClick={onClose} aria-label="Đóng" className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!detail && !error && <p className="text-sm text-gray-500">Đang tải…</p>}

          {detail && (
            <dl>
              <Row label="Thời điểm">{new Date(detail.occurredAt).toLocaleString('vi-VN', { hour12: false })}</Row>
              <Row label="Kết quả">{OUTCOME_LABELS[detail.outcome] ?? detail.outcome}</Row>
              <Row label="Hành động">{detail.action}</Row>
              <Row label="Đối tượng">{detail.objectKind}{detail.objectId ? ` · ${detail.objectId}` : ''}</Row>
              {/* Trống ở gần như mọi dòng vì bảng quyết định không ghi số phiên bản — chỉ hiện khi thực sự có. */}
              {detail.objectVersion !== null && <Row label="Phiên bản đối tượng">{detail.objectVersion}</Row>}
              <Row label="Người thao tác">
                <span className="font-mono">{detail.actorRef ?? '—'}</span>
                <span className="ml-2 text-gray-500">{detail.actorRole}</span>
              </Row>
              {detail.purpose && <Row label="Mục đích">{detail.purpose}</Row>}
              <Row label="Mã quy tắc">{rule ?? '—'}</Row>
              {/* Phiên bản bộ quy tắc trả lời "lúc đó luật là gì" — nó thuộc ngăn chi tiết, không lên cột. */}
              {ruleSetVersion && <Row label="Phiên bản bộ quy tắc">{ruleSetVersion}</Row>}
              <Row label="Mã tương quan">{detail.correlationId}</Row>
              {detail.details && <Row label="Chi tiết">{detail.details}</Row>}
              <DeviceTrace detail={detail} />
            </dl>
          )}
        </div>
      </aside>
    </div>
  )
}
