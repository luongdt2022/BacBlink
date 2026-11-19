import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Pagination } from '@/shared/components/Pagination'
import { Button } from '@/shared/ui/button'
import { ConfirmModal } from '@/shared/ui/confirm-modal'
import { deleteIntake as deleteIntakeApi } from '@/services/intakeService'
import type { IntakeListItem, IntakeStatus, IntakeType } from '@/services/intakeService'
import { IntakesTable } from '@/features/intakes/components/IntakesTable'
import { IntakesFilters } from '@/features/intakes/components/IntakesFilters'
import { useIntakesList } from '@/features/intakes/hooks/useIntakesList'

type StatusFilter = 'all' | IntakeStatus
type TypeFilter = 'all' | IntakeType

interface IntakesPageProps {
  forcedType?: IntakeType
  basePath?: string
}

export function IntakesPage({ forcedType, basePath = '/intakes' }: IntakesPageProps) {
  const navigate = useNavigate()
  const [deleteIntake, setDeleteIntake] = useState<IntakeListItem | null>(null)
  const deleteTargetLabel = deleteIntake?.type === 'ip' ? 'IP' : 'Challenge'

  const {
    intakes,
    page,
    totalPages,
    isLoading,
    search,
    type,
    status,
    totalByStatus,
    setPage,
    setSearch,
    setType,
    setStatus,
    refresh,
  } = useIntakesList({ initialType: forcedType ?? 'all' })

  const handleAddNew = useCallback(() => {
    navigate(`${basePath}/create`)
  }, [navigate, basePath])

  const handleRowClick = useCallback(
    (intake: IntakeListItem) => {
      navigate(`${basePath}/detail?id=${intake.id}`)
    },
    [navigate, basePath]
  )

  const handleEdit = useCallback(
    (intake: IntakeListItem) => {
      navigate(`${basePath}/edit?id=${intake.id}`)
    },
    [navigate, basePath]
  )

  const handleDelete = useCallback((intake: IntakeListItem) => {
    setDeleteIntake(intake)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteIntake) return

    try {
      await deleteIntakeApi(deleteIntake.id)
      const deletedTypeLabel = deleteIntake.type === 'ip' ? 'IP' : 'Challenge'
      toast.success(`Đã xóa ${deletedTypeLabel} thành công`)
      refresh()
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setDeleteIntake(null)
    }
  }, [deleteIntake, refresh])

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {forcedType === 'ip'
                ? 'Quản lý Cung'
                : forcedType === 'challenge'
                  ? 'Quản lý Cầu'
                  : 'Quản lý Cung & Cầu'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {forcedType === 'ip'
                ? 'Quản lý danh sách Cung do người dùng gửi lên'
                : forcedType === 'challenge'
                  ? 'Quản lý danh sách Cầu do người dùng gửi lên'
                  : 'Quản lý danh sách Cung và Cầu do người dùng gửi lên'}
            </p>
          </div>

          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo mới
          </Button>
        </div>

        <IntakesFilters
          searchInput={search}
          typeFilter={type as TypeFilter}
          statusFilter={status as StatusFilter}
          totalByStatus={totalByStatus}
          onSearchInputChange={setSearch}
          onTypeFilterChange={(t) => setType(t)}
          onStatusFilterChange={(s) => setStatus(s)}
          hideTypeFilter={!!forcedType}
        />

        <div className="mt-4">
          <IntakesTable
            intakes={intakes}
            isLoading={isLoading}
            currentPage={page}
            pageSize={10}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {totalPages > 1 && (
          <div className="py-4">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteIntake}
        onOpenChange={(open) => !open && setDeleteIntake(null)}
        title={`Xóa ${deleteTargetLabel}`}
        description={`Bạn có chắc chắn muốn xóa ${deleteTargetLabel.toLowerCase()} "${deleteIntake?.title}" không? Hành động này không thể hoàn tác và sẽ xóa tất cả các tệp đính kèm liên quan.`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </div>
  )
}
