import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = []
  const leftSpread = 2
  const rightSpread = 2

  pages.push(1)

  if (currentPage - leftSpread > 2) {
    pages.push('...')
  }

  const start = Math.max(2, currentPage - leftSpread)
  const end = Math.min(totalPages - 1, currentPage + rightSpread)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (currentPage + rightSpread < totalPages - 1) {
    pages.push('...')
  }

  if (totalPages > 1) {
    pages.push(totalPages)
  }

  return pages
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 py-4 border-t border-gray-200',
        className
      )}
    >
      <p className="text-sm text-gray-600">
        Trang <span className="font-medium">{currentPage}</span> /{' '}
        <span className="font-medium">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={cn(
            'p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm text-gray-400 select-none">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={cn(
                'w-9 h-9 rounded-lg border text-sm font-medium transition-colors cursor-pointer',
                page === currentPage
                  ? 'bg-brand text-white border-brand'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={cn(
            'p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
