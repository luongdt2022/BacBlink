import { SearchInput } from '@/shared/components/SearchInput'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import type { IntakeType } from '@/services/intakeService'

type StatusFilter = 'all' | 'draft' | 'published'
type TypeFilter = 'all' | IntakeType

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'draft', label: 'Nháp' },
  { id: 'published', label: 'Đã công bố' },
]

interface IntakesFiltersProps {
  searchInput: string
  statusFilter: StatusFilter
  typeFilter: TypeFilter
  totalByStatus: { draft: number; published: number }
  onSearchInputChange: (value: string) => void
  onStatusFilterChange: (status: StatusFilter) => void
  onTypeFilterChange: (type: TypeFilter) => void
  hideTypeFilter?: boolean
}

export function IntakesFilters({
  searchInput,
  statusFilter,
  typeFilter,
  totalByStatus,
  onSearchInputChange,
  onStatusFilterChange,
  onTypeFilterChange,
  hideTypeFilter = false,
}: IntakesFiltersProps) {
  const totalCount = totalByStatus.draft + totalByStatus.published

  const getCount = (tabId: StatusFilter) => {
    if (tabId === 'all') return totalCount
    if (tabId === 'draft') return totalByStatus.draft
    return totalByStatus.published
  }

  const typeFilterLabel =
    typeFilter === 'ip' ? 'IP' : typeFilter === 'challenge' ? 'Challenge' : 'Tất cả loại'

  const typeFilterDotClass =
    typeFilter === 'ip'
      ? 'bg-blue-500'
      : typeFilter === 'challenge'
        ? 'bg-purple-500'
        : 'bg-gray-400'

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {STATUS_TABS.map((tab) => {
          const count = getCount(tab.id)

          return (
            <button
              key={tab.id}
              onClick={() => onStatusFilterChange(tab.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                statusFilter === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span
                className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                  statusFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <SearchInput
          value={searchInput}
          onChange={onSearchInputChange}
          placeholder="Tìm kiếm theo tiêu đề..."
          debounceMs={500}
          className="w-full md:flex-1"
        />

        {!hideTypeFilter && (
          <Select value={typeFilter} onValueChange={(value) => onTypeFilterChange(value as TypeFilter)}>
            <SelectTrigger className="h-10 w-full border-gray-300 bg-white text-gray-900 data-[size=default]:h-10 data-[placeholder]:text-gray-900 md:w-[210px] [&_svg]:opacity-100">
              <SelectValue>
                <span className="inline-flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${typeFilterDotClass}`} />
                  <span>{typeFilterLabel}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                  <span>Tất cả loại</span>
                </span>
              </SelectItem>
              <SelectItem value="ip">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span>IP</span>
                </span>
              </SelectItem>
              <SelectItem value="challenge">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                  <span>Challenge</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
