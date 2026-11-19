import { Check, Ban, CircleCheckBig } from 'lucide-react'
import { OUTCOME_LABELS, splitRuleId } from '@/services/auditService'
import type { AuditEvent, AuditOutcome } from '@/services/auditService'

interface AuditTableProps {
  events: AuditEvent[]
  onOpen: (event: AuditEvent) => void
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('vi-VN', { hour12: false })
}

/** Mã người thao tác là một mã, không phải tên. Rút gọn để đọc được mà vẫn so sánh được giữa các dòng. */
function shortId(id: string | null): string {
  if (!id) return '—'
  return id.length > 13 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id
}

/**
 * Kết quả **không được phân biệt chỉ bằng màu** — mỗi dòng cần một nhãn chữ. Người đọc màn hình này thường
 * quét bảng trong những phiên dài, và một phần trong số họ không phân biệt được màu.
 */
/**
 * Ba kết quả từ hai tầng (ADR-0006): `ALLOW`/`DENY` là cửa phân quyền nói *được phép hay không*; `SUCCESS` là
 * tầng lệnh nói *việc đã xảy ra*. Một lệnh được phép nhưng hỏng ở bước sau để lại `ALLOW` không có `SUCCESS`.
 */
const OUTCOME_STYLE: Record<AuditOutcome, { icon: typeof Check; cls: string }> = {
  DENY: { icon: Ban, cls: 'bg-red-50 text-red-700 border border-red-200' },
  ALLOW: { icon: Check, cls: 'bg-green-50 text-green-700 border border-green-200' },
  SUCCESS: { icon: CircleCheckBig, cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
}

function OutcomeBadge({ outcome }: { outcome: AuditOutcome }) {
  const { icon: Icon, cls } = OUTCOME_STYLE[outcome] ?? OUTCOME_STYLE.ALLOW
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      {OUTCOME_LABELS[outcome] ?? outcome}
    </span>
  )
}

export function AuditTable({ events, onOpen }: AuditTableProps) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Nhật ký kiểm toán — mỗi dòng là một quyết định phân quyền, mới nhất trước
        </caption>
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <th scope="col" className="text-left font-semibold px-4 py-3">Thời điểm</th>
            <th scope="col" className="text-left font-semibold px-4 py-3">Kết quả</th>
            <th scope="col" className="text-left font-semibold px-4 py-3">Hành động</th>
            <th scope="col" className="text-left font-semibold px-4 py-3">Đối tượng</th>
            <th scope="col" className="text-left font-semibold px-4 py-3">Người thao tác</th>
            {/* Cột hạng nhất, không phải một trường giấu trong ngăn chi tiết: đây là thứ trả lời "vì sao bị chặn". */}
            <th scope="col" className="text-left font-semibold px-4 py-3">Mã quy tắc</th>
            <th scope="col" className="text-left font-semibold px-4 py-3">Mã tương quan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {events.map((event) => {
            const { rule } = splitRuleId(event.ruleId)
            return (
              <tr
                key={event.id}
                tabIndex={0}
                onClick={() => onOpen(event)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onOpen(event)
                  }
                }}
                className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
              >
                <td className="px-4 py-3 whitespace-nowrap text-gray-700 tabular-nums">{formatTime(event.occurredAt)}</td>
                <td className="px-4 py-3"><OutcomeBadge outcome={event.outcome} /></td>
                <td className="px-4 py-3 font-medium text-gray-900">{event.action}</td>
                <td className="px-4 py-3 text-gray-700">
                  <div>{event.objectKind}</div>
                  <div className="text-xs text-gray-500 font-mono">{shortId(event.objectId)}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-700" title={event.actorRef ?? undefined}>
                  {shortId(event.actorRef)}
                  <div className="text-xs text-gray-500 font-sans">{event.actorRole}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{rule ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{event.correlationId}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
