import { useState } from 'react'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import {
  HIGH_VALUE_SIGNAL_CLASS,
  SIGNAL_CLASS_LABELS,
  SIGNAL_STATUS_LABELS,
  formatBudget,
} from '@/services/signalService'
import type { DemandSignal } from '@/services/signalService'
import { useSignalsList } from '../hooks/useSignalsList'
import { SignalActionDialog } from '../components/SignalActionDialog'
import type { SignalAction } from '../components/SignalActionDialog'

/**
 * Bàn tín hiệu nhu cầu (ADR-0011).
 *
 * Trang này cố ý **không** trông giống danh sách đề bài. Tín hiệu chưa có chủ đã xác nhận, chưa có đường ngân
 * sách đã kiểm, chưa qua §11 — gộp hai thứ vào một hình dạng là cách nhanh nhất để một dòng chưa ai xác minh
 * được đối xử như một nhu cầu có thật.
 *
 * Ba việc làm được ở đây, và chỉ ba: xem, loại kèm lý do, và ghi nhận đã chuyển thành đề bài. Việc **tạo** đề
 * bài không ở đây — nguyên tắc 1 và D2-87: chỉ người có thẩm quyền xác nhận chủ bài toán, mục tiêu, baseline và
 * đường ngân sách mới tạo được nhu cầu đủ điều kiện.
 */
export function SignalsPage() {
  const list = useSignalsList()
  const [pending, setPending] = useState<{ signal: DemandSignal; action: SignalAction } | null>(null)

  // Hộp thoại tự giữ lỗi và nội dung đang gõ; trang chỉ đóng nó khi lệnh **đã** thành công. Nếu đóng trước thì
  // người dùng mất phần đã viết đúng lúc cần sửa nó nhất.
  const confirmAction = async (value: string) => {
    if (!pending) return
    if (pending.action === 'reject') await list.reject(pending.signal, value)
    else await list.markConverted(pending.signal, value)
    setPending(null)
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tín hiệu nhu cầu</h1>
        <p className="text-sm text-gray-600 mt-1">
          Nhu cầu quan sát được từ nguồn công khai. <strong>Chưa phải đề bài</strong>: chưa có chủ đã xác nhận,
          chưa có đường ngân sách đã kiểm, chưa qua bước đủ điều kiện.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-xs text-gray-600 mb-1">Trạng thái</span>
          <select
            value={list.status}
            onChange={(e) => list.setStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm"
          >
            <option value="">Tất cả</option>
            {Object.entries(SIGNAL_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs text-gray-600 mb-1">Loại tín hiệu</span>
          <select
            value={list.signalClass}
            onChange={(e) => list.setSignalClass(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm"
          >
            <option value="">Tất cả</option>
            {Object.entries(SIGNAL_CLASS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <span className="text-sm text-gray-600 pb-1.5">{list.total} tín hiệu</span>
      </div>

      {list.error && (
        <p role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{list.error}</p>
      )}

      {list.isLoading && <p className="text-sm text-gray-600">Đang tải…</p>}

      {!list.isLoading && list.signals.length === 0 && !list.error && (
        <p className="p-4 rounded-lg border border-dashed border-gray-300 text-sm text-gray-700">
          Không có tín hiệu nào khớp bộ lọc.
        </p>
      )}

      {list.signals.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-600">
              <tr>
                <th className="px-3 py-2">Nội dung</th>
                <th className="px-3 py-2">Loại</th>
                <th className="px-3 py-2">Bên mua</th>
                <th className="px-3 py-2">Ngân sách</th>
                <th className="px-3 py-2">Quan sát</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {list.signals.map((s) => (
                <tr key={s.id} className="border-t border-gray-100 align-top">
                  <td className="px-3 py-2 max-w-md">
                    <p className="font-medium text-gray-900">{s.title}</p>
                    {s.summary && <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{s.summary}</p>}
                    <p className="text-[11px] text-gray-400 mt-0.5 font-mono">nguồn: {s.source || '(mất bản ghi nguồn)'}</p>
                  </td>
                  <td className="px-3 py-2">
                    {s.signalClass === HIGH_VALUE_SIGNAL_CLASS ? (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] border bg-amber-50 border-amber-300 text-amber-900"
                        title="Có chủ, có ngân sách đã duyệt, có thời hạn — và thị trường không đáp ứng được"
                      >
                        <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                        {SIGNAL_CLASS_LABELS[s.signalClass]}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-700">{SIGNAL_CLASS_LABELS[s.signalClass] ?? s.signalClass}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700">{s.buyerName ?? '—'}</td>
                  <td className="px-3 py-2 text-xs font-mono">{formatBudget(s.budgetAmount, s.budgetCurrency)}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">
                    {s.observedAt ? new Date(s.observedAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-xs text-gray-700">{SIGNAL_STATUS_LABELS[s.status] ?? s.status}</span>
                    {s.status === 'CONVERTED' && s.convertedDemandBriefId && (
                      <a
                        href={`/intakes/${s.convertedDemandBriefId}`}
                        className="mt-0.5 flex items-center gap-1 text-[11px] text-brand hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" aria-hidden="true" /> Đề bài
                      </a>
                    )}
                    {s.status === 'REJECTED' && s.decisionReason && (
                      <p className="text-[11px] text-gray-500 mt-0.5 max-w-[16rem]">{s.decisionReason}</p>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {s.status === 'NEW' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPending({ signal: s, action: 'convert' })}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          Đã thành đề bài
                        </button>
                        <button
                          type="button"
                          onClick={() => setPending({ signal: s, action: 'reject' })}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          Loại
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {list.totalPages > 1 && (
        <nav aria-label="Phân trang" className="flex items-center gap-3">
          <button
            disabled={list.page <= 1}
            onClick={() => list.setPage(list.page - 1)}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600">Trang {list.page} / {list.totalPages}</span>
          <button
            disabled={list.page >= list.totalPages}
            onClick={() => list.setPage(list.page + 1)}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50"
          >
            Sau
          </button>
        </nav>
      )}

      {pending && (
        <SignalActionDialog
          signal={pending.signal}
          action={pending.action}
          onConfirm={confirmAction}
          onClose={() => setPending(null)}
        />
      )}
    </div>
  )
}
