import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/components/ui/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];
  const leftSpread = 2;
  const rightSpread = 2;

  pages.push(1);

  if (currentPage - leftSpread > 2) {
    pages.push('...');
  }

  const start = Math.max(2, currentPage - leftSpread);
  const end = Math.min(totalPages - 1, currentPage + rightSpread);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage + rightSpread < totalPages - 1) {
    pages.push('...');
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6',
        className
      )}
    >
      <p className="text-sm text-gray-600">
        Trang <span className="font-medium">{currentPage}</span> /{' '}
        <span className="font-medium">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={cn(
            'cursor-pointer rounded-lg border border-gray-300 p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pageNumbers.map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm text-gray-400 select-none">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={cn(
                'h-9 w-9 cursor-pointer rounded-lg border text-sm font-medium transition-colors',
                page === currentPage
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={cn(
            'cursor-pointer rounded-lg border border-gray-300 p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
