import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { ConfirmModal } from '@/shared/ui/confirm-modal'
import { ImplementationsTable, ImplementationsFilters } from '../components'
import { useImplementationsList } from '../hooks'

export function ImplementationsPage() {
  const navigate = useNavigate()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const {
    implementations,
    total,
    isLoading,
    search,
    status,
    field,
    successCount,
    partialCount,
    failedCount,
    setSearch,
    setStatus,
    setField,
  } = useImplementationsList()

  const handleView = (id: string) => {
    navigate(`/implementations/detail?id=${id}`)
  }

  const handleEdit = (_id: string) => {
    // Edit handler
  }

  const handleDelete = (id: string) => {
    setPendingDeleteId(id)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      // call API with pendingDeleteId
    }
    setPendingDeleteId(null)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Danh sách Hồ sơ triển khai</h1>
          <p className="text-sm text-gray-600 mt-1">
            Tổng hợp các bài toán đã triển khai cùng giải pháp công nghệ và kết quả thực tế.
          </p>
        </div>
        <button
          onClick={() => navigate('/implementations/create')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Tạo mới Hồ sơ triển khai
        </button>
      </div>

      {/* Filters */}
      <ImplementationsFilters
        search={search}
        status={status}
        field={field}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onFieldChange={setField}
      />

      {/* Table */}
      <ImplementationsTable
        implementations={implementations}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Stats Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Hiển thị <span className="font-medium text-gray-900">{total}</span> hồ sơ
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Thành công: {successCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Một phần: {partialCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Không thành công: {failedCount}</span>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Xóa hồ sơ triển khai"
        description="Bạn có chắc chắn muốn xóa hồ sơ triển khai này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </div>
  )
}
