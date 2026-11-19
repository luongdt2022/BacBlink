import { MoreVertical, Pencil, Trash2, FileText, Lightbulb } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { TableSkeleton } from '@/shared/components/TableSkeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import type { IntakeListItem } from '@/services/intakeService'
import { StatusBadge } from './StatusBadge'
import { AiProcessingBadge } from './AiProcessingBadge'
import { formatDateTime } from '@/lib/utils'

const PLACEHOLDER_IMAGE_SRC = '/placeholder-image.png'

function getAiStatusValue(
  status: IntakeListItem['aiProcessingStatus'] | { status: string } | string | null | undefined
): string | null {
  if (typeof status === 'string') return status
  if (status && typeof status === 'object' && 'status' in status) {
    return status.status
  }
  return null
}

interface IntakesTableProps {
  intakes: IntakeListItem[]
  isLoading: boolean
  currentPage?: number
  pageSize?: number
  onRowClick: (intake: IntakeListItem) => void
  onEdit: (intake: IntakeListItem) => void
  onDelete: (intake: IntakeListItem) => void
}

export function IntakesTable({
  intakes,
  isLoading,
  currentPage = 1,
  pageSize = 10,
  onRowClick,
  onEdit,
  onDelete,
}: IntakesTableProps) {
  const getSTT = (index: number) => {
    return (currentPage - 1) * pageSize + index + 1
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                STT
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                Avatar
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái AI
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <TableSkeleton rows={5} columns={8} />
          </tbody>
        </table>
      </div>
    )
  }

  if (intakes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                STT
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                Avatar
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái AI
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                Chưa có thông tin tiếp nhận nào
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              STT
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              Avatar
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tiêu đề
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loại
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái AI
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày tạo
            </th>
            <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {intakes.map((intake, index) => {
            const aiStatusValue = getAiStatusValue(intake.aiProcessingStatus)
            const isProcessing = aiStatusValue === 'processing' || aiStatusValue === 'PROCESSING'

            return (
              <tr
                key={intake.id}
                className={
                  isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'
                }
                onClick={() => {
                  if (!isProcessing) onRowClick(intake)
                }}
              >
                {/* STT */}
                <td className="px-4 py-4 text-sm text-gray-500">{getSTT(index)}</td>

                {/* Avatar */}
                <td className="px-4 py-4">
                  <img
                    src={intake.profilePicUrl || PLACEHOLDER_IMAGE_SRC}
                    alt={intake.title}
                    className="h-10 w-10 rounded-md border border-gray-200 object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = PLACEHOLDER_IMAGE_SRC
                    }}
                  />
                </td>

                {/* Title */}
                <td className="px-4 py-4">
                  <span className="text-sm font-medium text-gray-900 max-w-xs truncate block">
                    {intake.title}
                  </span>
                </td>

                {/* Type */}
                <td className="px-4 py-4">
                  <Badge
                    variant="default"
                    className={`inline-flex items-center gap-1 ${
                      intake.type === 'ip'
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-purple-100 text-purple-700 border-purple-200'
                    }`}
                  >
                    {intake.type === 'ip' ? (
                      <FileText className="w-3 h-3" />
                    ) : (
                      <Lightbulb className="w-3 h-3" />
                    )}
                    {intake.type === 'ip' ? 'IP' : 'Challenge'}
                  </Badge>
                </td>

                {/* AI Status */}
                <td className="px-4 py-4">
                  <AiProcessingBadge
                    status={aiStatusValue}
                    hasContent={!!intake.aiProcessedContent}
                  />
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <StatusBadge status={intake.status} />
                </td>

                {/* Date */}
                <td className="px-4 py-4 text-sm text-gray-600">
                  {formatDateTime(intake.createdAt)}
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(intake)
                        }}
                        className="cursor-pointer"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(intake)
                        }}
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
