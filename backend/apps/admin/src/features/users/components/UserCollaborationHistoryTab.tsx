import { useState } from 'react'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { Pagination } from '@/shared/components/Pagination'
import type { CollaborationRequest } from '@/services/userService'

interface UserCollaborationHistoryTabProps {
  collaborationHistory: CollaborationRequest[]
}

export function UserCollaborationHistoryTab({ collaborationHistory }: UserCollaborationHistoryTabProps) {
  const [page, setPage] = useState(1)
  const perPage = 10
  const total = Math.ceil(collaborationHistory.length / perPage) || 1
  const paged = collaborationHistory.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Lịch sử cung cầu</h2>
        <p className="text-sm text-gray-600 mt-1">Tổng số: {collaborationHistory.length} yêu cầu</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">STT</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Loại</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Chiều</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Tiêu đề liên quan</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Đối tác</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Trạng thái</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Ngày gửi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">Chưa có dữ liệu</td>
              </tr>
            ) : paged.map((item, i) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">{(page - 1) * perPage + i + 1}</td>
                <td className="px-6 py-4">
                  {item.intakeType === 'ip' ? (
                    <span className="inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">Cung</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">Cầu</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {item.direction === 'sent' ? (
                    <span className="inline-flex items-center px-2.5 py-1 bg-secondary/15 text-secondary text-xs font-semibold rounded-full border border-secondary/20">Đã gửi</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">Đã nhận</span>
                  )}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 max-w-xs truncate">{item.intakeTitle}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <div>{item.counterpartName}</div>
                  <div className="text-xs text-gray-400">{item.counterpartEmail}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <StatusBadge status={item.status} />
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

function StatusBadge({ status }: { status: CollaborationRequest['status'] }) {
  if (status === 'accepted') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
        <CheckCircle className="w-3 h-3" /> Đã chấp nhận
      </span>
    )
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
        <XCircle className="w-3 h-3" /> Đã từ chối
      </span>
    )
  }
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
        <XCircle className="w-3 h-3" /> Đã hủy
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
      <Clock className="w-3 h-3" /> Chờ phản hồi
    </span>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}
