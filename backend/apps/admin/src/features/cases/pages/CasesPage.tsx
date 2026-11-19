import { Link } from 'react-router'
import { Lock, X } from 'lucide-react'
import { STAGES, STAGE_LABELS, TRACK_LABELS } from '@/services/caseService'
import { useCaseList } from '../hooks/useCaseList'

/**
 * Danh sách hồ sơ vụ việc (`moi/console-ho-so-vu-viec.md`, "Vào màn").
 *
 * Trạng thái rỗng có hai nghĩa và câu chữ phải khác: không có hồ sơ nào khớp bộ lọc, và không có hồ sơ nào cả.
 * Không nói "còn N hồ sơ bạn không thấy" — máy chủ lọc theo quyền, và con số đó không tồn tại ở phía này.
 */
export function CasesPage() {
  const { filters, hasAnyFilter, cases, total, page, totalPages, isLoading, error, setFilters, setPage, reset } = useCaseList()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Hồ sơ vụ việc</h1>
        <p className="text-sm text-gray-600 mt-1">Hồ sơ bạn đang là bên tham gia. Quản trị viên thấy tất cả.</p>
      </div>

      <section aria-label="Bộ lọc" className="p-4 rounded-lg border border-gray-200 bg-white space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="c-broker" className="block text-sm font-medium text-gray-700 mb-1">Môi giới chính (mã)</label>
            <input id="c-broker" autoFocus value={filters.brokerPersonId ?? ''} onChange={(e) => setFilters({ brokerPersonId: e.target.value })} placeholder="Dán mã người" className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>
          <div>
            <label htmlFor="c-owner" className="block text-sm font-medium text-gray-700 mb-1">Chủ bài toán (mã)</label>
            <input id="c-owner" value={filters.problemOwnerPersonId ?? ''} onChange={(e) => setFilters({ problemOwnerPersonId: e.target.value })} placeholder="Dán mã người" className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>
          <div>
            <label htmlFor="c-stage" className="block text-sm font-medium text-gray-700 mb-1">Giai đoạn</label>
            <select id="c-stage" value={filters.stage ?? ''} onChange={(e) => setFilters({ stage: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand">
              <option value="">Tất cả</option>
              {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
            </select>
          </div>
        </div>
        {hasAnyFilter && (
          <button onClick={reset} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50">
            <X className="w-4 h-4" aria-hidden="true" /> Xoá bộ lọc
          </button>
        )}
      </section>

      {error && <p role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</p>}

      {!error && (
        <>
          <p className="text-sm text-gray-600" aria-live="polite">{isLoading ? 'Đang tải…' : `${total} hồ sơ.`}</p>

          {!isLoading && cases.length === 0 && (
            <div className="p-6 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600">
              {hasAnyFilter ? (
                <p>Không có hồ sơ nào khớp bộ lọc đang áp. Xoá bộ lọc để xem mọi hồ sơ bạn tham gia.</p>
              ) : (
                <p>Bạn không tham gia hồ sơ nào, hoặc hệ thống chưa có hồ sơ nào. Hồ sơ được tạo qua API v2 (<code className="font-mono">POST /api/v2/cases</code>).</p>
              )}
            </div>
          )}

          {cases.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs text-gray-600">
                  <tr>
                    <th className="px-3 py-2">Mã</th>
                    <th className="px-3 py-2">Tiêu đề</th>
                    <th className="px-3 py-2">Tuyến</th>
                    <th className="px-3 py-2">Giai đoạn</th>
                    <th className="px-3 py-2">Phiên bản</th>
                    <th className="px-3 py-2">Cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-xs"><Link to={`/cases/${c.id}`} className="underline">{c.caseCode}</Link></td>
                      <td className="px-3 py-2"><Link to={`/cases/${c.id}`} className="text-gray-900 hover:underline">{c.title}</Link></td>
                      <td className="px-3 py-2 text-gray-700">{TRACK_LABELS[c.track] ?? c.track}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1">
                          {STAGE_LABELS[c.stage] ?? c.stage}
                          {c.hasOpenHold && <Lock className="w-3 h-3 text-amber-700" aria-label="đang bị khoá" />}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{c.version}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{new Date(c.updatedAt).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <nav aria-label="Phân trang" className="flex items-center gap-3">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50">Trước</button>
              <span className="text-sm text-gray-600">Trang {page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50">Sau</button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
