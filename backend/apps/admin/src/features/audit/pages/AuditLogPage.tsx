import { useState } from 'react'
import { Ban, Info, Search, X } from 'lucide-react'
import { OBJECT_KINDS } from '@/services/auditService'
import type { AuditEvent, AuditOutcome } from '@/services/auditService'
import { DEFAULT_RANGE_DAYS, defaultRange, useAuditLog } from '../hooks/useAuditLog'
import { AuditTable } from '../components/AuditTable'
import { AuditDetailPanel } from '../components/AuditDetailPanel'

function toLocalInput(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInput(value: string): string | undefined {
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

export function AuditLogPage() {
  const { filters, events, total, page, totalPages, isLoading, isPristine, error, setFilters, setPage, reset } =
    useAuditLog()
  const [openEvent, setOpenEvent] = useState<AuditEvent | null>(null)

  const showDenied = () => setFilters({ outcome: 'DENY', ...defaultRange() })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Nhật ký kiểm toán</h1>
        <p className="text-sm text-gray-600 mt-1">Ai đã làm gì, trên cái gì, và có được phép không.</p>
      </div>

      {/*
        Dải thường trực, không giấu sau một biểu tượng trợ giúp. Nó nói hai điều mà người đọc nhật ký buộc phải
        biết trước khi kết luận bất cứ gì — nhất là điều thứ hai, vì kết luận sai từ một dòng trống là cách một
        cuộc điều tra đi chệch hướng.
      */}
      <div className="flex gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-900">
        <Info className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p>
            <strong>Nhật ký chỉ ghi thêm.</strong> Không có nút sửa và không có nút xoá, ở màn hình này, ở API,
            hay ở tầng dữ liệu. Thứ duy nhất từng bị đổi sau khi ghi là dấu vết thiết bị, và nó bị <em>cắt</em>
            theo thời hạn lưu chứ không bị sửa.
          </p>
          <p>
            <strong>Nhật ký không ghi mọi thứ.</strong> Nó ghi ba loại dòng: mọi lượt <em>bị từ chối</em>, lượt
            <em>được phép</em> đọc tài liệu mật, và việc <em>đã thực hiện</em> trên hồ sơ vụ việc và phiếu đọc.
            &ldquo;Được phép&rdquo; và &ldquo;đã thực hiện&rdquo; là hai dòng khác nhau — một lệnh được phép
            nhưng hỏng ở bước sau chỉ có dòng thứ nhất. Một dòng không có ở đây <em>không</em> có nghĩa là việc đó đã không xảy ra.
          </p>
        </div>
      </div>

      <section aria-label="Bộ lọc" className="p-4 rounded-lg border border-gray-200 bg-white space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="f-actor" className="block text-sm font-medium text-gray-700 mb-1">Người thao tác</label>
            <input
              id="f-actor"
              autoFocus
              value={filters.actorRef ?? ''}
              onChange={(e) => setFilters({ actorRef: e.target.value })}
              placeholder="Dán mã người thao tác"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label htmlFor="f-kind" className="block text-sm font-medium text-gray-700 mb-1">Loại đối tượng</label>
            <select
              id="f-kind"
              value={filters.objectKind ?? ''}
              onChange={(e) => setFilters({ objectKind: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">Tất cả</option>
              {OBJECT_KINDS.map((kind) => <option key={kind} value={kind}>{kind}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="f-object" className="block text-sm font-medium text-gray-700 mb-1">Định danh đối tượng</label>
            <input
              id="f-object"
              value={filters.objectId ?? ''}
              onChange={(e) => setFilters({ objectId: e.target.value })}
              placeholder="Dán định danh"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label htmlFor="f-outcome" className="block text-sm font-medium text-gray-700 mb-1">Kết quả</label>
            <select
              id="f-outcome"
              value={filters.outcome ?? ''}
              onChange={(e) => setFilters({ outcome: (e.target.value || undefined) as AuditOutcome | undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">Tất cả</option>
              <option value="DENY">Từ chối</option>
              <option value="ALLOW">Cho phép</option>
              <option value="SUCCESS">Đã thực hiện</option>
            </select>
          </div>

          <div>
            <label htmlFor="f-from" className="block text-sm font-medium text-gray-700 mb-1">Từ</label>
            <input
              id="f-from" type="datetime-local"
              value={toLocalInput(filters.from)}
              onChange={(e) => setFilters({ from: fromLocalInput(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label htmlFor="f-to" className="block text-sm font-medium text-gray-700 mb-1">Đến</label>
            <input
              id="f-to" type="datetime-local"
              value={toLocalInput(filters.to)}
              onChange={(e) => setFilters({ to: fromLocalInput(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/*
            Nút riêng, không chôn trong ô chọn: lọc Từ chối là cách DUY NHẤT thấy được những gì hệ thống đã
            chặn, và đó là thông tin không có ở bất kỳ chỗ nào khác trong sản phẩm.
          */}
          <button
            onClick={showDenied}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
          >
            <Ban className="w-4 h-4" aria-hidden="true" />
            Xem các lượt bị từ chối ({DEFAULT_RANGE_DAYS} ngày gần nhất)
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            Xoá bộ lọc
          </button>
        </div>
      </section>

      {error && (
        <p role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</p>
      )}

      {isPristine && !error && (
        <div className="p-8 text-center border border-dashed border-gray-300 rounded-lg">
          <Search className="w-8 h-8 mx-auto text-gray-400" aria-hidden="true" />
          <p className="mt-3 text-sm text-gray-600">
            Đặt ít nhất một bộ lọc để bắt đầu tra cứu. Màn hình không tự tải toàn bộ nhật ký — đây là bảng lớn
            nhất hệ thống và mọi dòng đều là dữ liệu nhạy cảm.
          </p>
        </div>
      )}

      {!isPristine && !error && (
        <>
          <p className="text-sm text-gray-600" aria-live="polite">
            {isLoading ? 'Đang tra cứu…' : `${total} dòng khớp bộ lọc đang áp.`}
          </p>

          {!isLoading && events.length === 0 && (
            /* Kết quả rỗng phải nói rõ bộ lọc nào đang áp: người dùng lọc ra 0 dòng không biết là "không có gì
               xảy ra" hay "tôi lọc sai", và hai kết luận đó dẫn đi hai hướng rất khác nhau. */
            <div className="p-6 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600">
              <p className="font-medium text-gray-900">Không có dòng nào khớp.</p>
              <p className="mt-2">Bộ lọc đang áp:</p>
              <ul className="mt-1 list-disc list-inside font-mono text-xs">
                {filters.actorRef && <li>Người thao tác: {filters.actorRef}</li>}
                {filters.objectKind && <li>Loại đối tượng: {filters.objectKind}</li>}
                {filters.objectId && <li>Định danh: {filters.objectId}</li>}
                {filters.outcome && <li>Kết quả: {filters.outcome}</li>}
                {filters.from && <li>Từ: {new Date(filters.from).toLocaleString('vi-VN')}</li>}
                {filters.to && <li>Đến: {new Date(filters.to).toLocaleString('vi-VN')}</li>}
              </ul>
            </div>
          )}

          {events.length > 0 && <AuditTable events={events} onOpen={setOpenEvent} />}

          {totalPages > 1 && (
            <nav aria-label="Phân trang" className="flex items-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-sm text-gray-600">Trang {page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Sau
              </button>
            </nav>
          )}
        </>
      )}

      <p className="text-xs text-gray-500">
        Lượt tra cứu này đã được ghi lại. Nhật ký ghi lại chính việc đọc nhật ký — kể cả của bạn.
      </p>

      {openEvent && <AuditDetailPanel eventId={openEvent.id} onClose={() => setOpenEvent(null)} />}
    </div>
  )
}
