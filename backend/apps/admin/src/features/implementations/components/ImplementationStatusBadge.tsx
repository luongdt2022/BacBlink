import { Badge } from '@/shared/ui/badge'
import type { ImplementationResultStatus } from '../types'

interface ImplementationStatusBadgeProps {
  status: ImplementationResultStatus
  className?: string
}

const STATUS_CONFIG: Record<
  ImplementationResultStatus,
  { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }
> = {
  success: { variant: 'success', label: 'Thành công' },
  partial: { variant: 'warning', label: 'Thành công một phần' },
  failed: { variant: 'danger', label: 'Không thành công' },
}

export function ImplementationStatusBadge({
  status,
  className,
}: ImplementationStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { variant: 'default', label: status }
  return <Badge variant={config.variant} className={className}>{config.label}</Badge>
}
