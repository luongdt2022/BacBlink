import { useRef, useEffect, useState } from 'react'
import { Search, RotateCcw } from 'lucide-react'
import type { UserStatusFilter } from '../types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

interface UsersFiltersProps {
  search: string
  status: UserStatusFilter
  totalFiltered: number
  onSearchChange: (value: string) => void
  onStatusChange: (value: UserStatusFilter) => void
  onResetFilters: () => void
}

export function UsersFilters({
  search,
  status,
  totalFiltered,
  onSearchChange,
  onStatusChange,
  onResetFilters,
}: UsersFiltersProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory] = useState<string[]>(['Công ty ABC', 'Viện XYZ', '0123456789'])
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasActiveFilters = search || status !== 'all'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="relative" ref={searchInputRef}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setShowSuggestions(false)
          }}
          placeholder="Tìm kiếm tên, email, tổ chức..."
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-base"
        />

        {showSuggestions && searchHistory.length > 0 && !search && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                Lịch sử tìm kiếm
              </p>
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSearchChange(item)
                    setShowSuggestions(false)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm text-gray-700"
                >
                  <Search className="w-4 h-4 inline mr-2 text-gray-400" />
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-end gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-foreground/70">Trạng thái</label>
          <Select value={status} onValueChange={(v) => onStatusChange(v as UserStatusFilter)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Đã khóa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <button
            onClick={onResetFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 h-[42px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-medium">Xóa bộ lọc</span>
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Hiển thị{' '}
          <span className="font-medium text-gray-900">{totalFiltered}</span> kết quả
          {hasActiveFilters && <span className="text-gray-400"> (đã lọc)</span>}
        </p>
      </div>
    </div>
  )
}
