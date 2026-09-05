import { useNavigate } from 'react-router'
import { Search, Lock, Unlock } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { TableSkeleton } from '@/shared/components/TableSkeleton'
import type { User } from '../types'

interface UsersTableProps {
  users: User[]
  isLoading?: boolean
  onDeactivate: (userId: string) => void
  onActivate: (userId: string) => void
}

function getStatusBadgeVariant(status: 'pending' | 'active' | 'locked'): 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'active':
      return 'success'
    case 'pending':
      return 'warning'
    case 'locked':
      return 'danger'
  }
}

function getStatusLabel(status: 'pending' | 'active' | 'locked'): string {
  switch (status) {
    case 'active':
      return 'Đang hoạt động'
    case 'pending':
      return 'Chờ duyệt'
    case 'locked':
      return 'Đã khóa'
  }
}

export function UsersTable({ users, isLoading, onDeactivate, onActivate }: UsersTableProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <TableSkeleton rows={10} columns={7} />
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Họ và tên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                SĐT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Tổ chức
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">Không tìm thấy kết quả</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => navigate(`/user-profile/${user.id}`)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md bg-brand text-white font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-sm font-bold text-gray-900">{user.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.phone || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" title={user.organization}>
                    {user.organization || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.registeredDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusBadgeVariant(user.status)}>
                      {getStatusLabel(user.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => onDeactivate(user.id)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Khóa tài khoản"
                        >
                          <Lock className="w-4 h-4 text-gray-500" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivate(user.id)}
                          className="p-1.5 hover:bg-green-50 rounded transition-colors"
                          title="Mở khóa tài khoản"
                        >
                          <Unlock className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
