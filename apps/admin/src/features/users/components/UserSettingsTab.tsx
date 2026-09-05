import { useState } from 'react'
import { CheckCircle, Clock } from 'lucide-react'
import { Pagination } from '@/shared/components/Pagination'
import type { IntakeSummary } from '@/services/userService'

interface UserSettingsTabProps {
  challengeIntakes: IntakeSummary[]
}

function statusLabel(status: 'draft' | 'published') {
  return status === 'published' ? 'Đã niêm yết' : 'Chờ duyệt'
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

export function UserSettingsTab({ challengeIntakes }: UserSettingsTabProps) {
  const [page, setPage] = useState(1)
  const perPage = 5
  const total = Math.ceil(challengeIntakes.length / perPage) || 1
  const paged = challengeIntakes.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Bài toán / Thách thức (Cầu)</h2>
        <p className="text-sm text-gray-600 mt-1">Tổng số: {challengeIntakes.length} nhu cầu</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">STT</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Tiêu đề</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Lĩnh vực</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Trạng thái</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Chưa có dữ liệu</td>
              </tr>
            ) : paged.map((item, i) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">{(page - 1) * perPage + i + 1}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">{item.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.category ?? '—'}</td>
                <td className="px-6 py-4 text-center">
                  {item.status === 'published' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      <CheckCircle className="w-3 h-3" /> {statusLabel(item.status)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                      <Clock className="w-3 h-3" /> {statusLabel(item.status)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-600">{formatDate(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={total} onPageChange={setPage} />
    </div>
  )
}
