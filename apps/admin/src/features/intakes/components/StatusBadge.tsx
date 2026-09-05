import { Globe, FileEdit } from 'lucide-react'
import type { IntakeStatus } from '@/services/intakeService'

interface StatusBadgeProps {
  status: IntakeStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        status === 'published'
          ? 'bg-green-100 text-green-700'
          : 'bg-yellow-100 text-yellow-700'
      }`}
    >
      {status === 'published' ? (
        <>
          <Globe className="w-3 h-3" />
          Đã công bố
        </>
      ) : (
        <>
          <FileEdit className="w-3 h-3" />
          Nháp
        </>
      )}
    </span>
  )
}
