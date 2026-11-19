import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useUsersList } from '../hooks'
import { UsersFilters, UsersTable, CreateUserModal } from '../components'
import { Pagination } from '@/shared/components/Pagination'

export function UserManagementPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  const {
    users,
    total,
    page,
    totalPages,
    isLoading,
    error,
    search,
    status,
    setPage,
    setSearch,
    setStatus,
    resetFilters,
    refetch,
    activateUser,
    deactivateUser,
  } = useUsersList()

  const handleDeactivate = async (userId: string) => {
    try {
      await deactivateUser(userId)
      toast.success('Account has been locked')
    } catch {
      toast.error('Failed to lock account')
    }
  }

  const handleActivate = async (userId: string) => {
    try {
      await activateUser(userId)
      toast.success('Account has been activated')
    } catch {
      toast.error('Failed to activate account')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Danh sách Người dùng</h1>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý người dùng trong hệ thống
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Tạo mới người dùng
        </button>
      </div>

      <UsersFilters
        search={search}
        status={status}
        totalFiltered={total}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onResetFilters={resetFilters}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <UsersTable
          users={users}
          isLoading={isLoading}
          onDeactivate={handleDeactivate}
          onActivate={handleActivate}
        />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={refetch}
      />
    </div>
  )
}
