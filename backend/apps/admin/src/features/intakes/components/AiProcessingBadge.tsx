import { Loader2 } from 'lucide-react'
import { AiIcon } from './AiIcon'

interface AiProcessingBadgeProps {
  status: string | null
  hasContent?: boolean
}

function getStatusValue(status: string | null): string | null {
  return typeof status === 'string' ? status : null
}

export function AiProcessingBadge({ status, hasContent }: AiProcessingBadgeProps) {
  const value = getStatusValue(status)

  if (value === 'processing' || value === 'PROCESSING') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
        <Loader2 className="h-3 w-3 animate-spin" />
        Đang xử lý AI
      </span>
    )
  }
  if ((value === 'completed' || value === 'COMPLETED') && hasContent) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        <AiIcon className="h-3 w-3" />
        Đã xử lý AI
      </span>
    )
  }
  if (value === 'failed' || value === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        <AiIcon className="h-3 w-3" />
        Xử lý AI thất bại
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
      <AiIcon className="h-3 w-3" />
      Chưa xử lý AI
    </span>
  )
}
