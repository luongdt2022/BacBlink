import { Search } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { RESEARCH_FIELDS } from '../hooks/useImplementationsList'
import type { ImplementationResultStatus } from '../types'

type StatusFilter = 'all' | ImplementationResultStatus

interface ImplementationsFiltersProps {
  search: string
  status: StatusFilter
  field: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: StatusFilter) => void
  onFieldChange: (value: string) => void
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'success', label: 'Thành công' },
  { value: 'partial', label: 'Thành công một phần' },
  { value: 'failed', label: 'Không thành công' },
]

export function ImplementationsFilters({
  search,
  status,
  field,
  onSearchChange,
  onStatusChange,
  onFieldChange,
}: ImplementationsFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên bài toán, công nghệ, doanh nghiệp…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Trạng thái: {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Field Filter */}
        <div>
          <select
            value={field}
            onChange={(e) => onFieldChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          >
            {RESEARCH_FIELDS.map((f) => (
              <option key={f} value={f}>
                Lĩnh vực: {f}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
