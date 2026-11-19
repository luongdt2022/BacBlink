export type ValuationStatus = 'draft' | 'submitted' | 'reviewing' | 'completed' | 'rejected';

interface ValuationStatusBadgeProps {
  status: ValuationStatus;
}

export function ValuationStatusBadge({ status }: ValuationStatusBadgeProps) {
  const config = {
    draft: {
      label: 'Nháp',
      className: 'bg-[#f3f4f6] text-muted-foreground',
    },
    submitted: {
      label: 'Chờ tiếp nhận',
      className: 'bg-[#dbeafe] text-primary',
    },
    reviewing: {
      label: 'Đang thẩm định',
      className: 'bg-[#fed7aa] text-[#ea580c]',
    },
    completed: {
      label: 'Hoàn tất',
      className: 'bg-[#dcfce7] text-[#16a34a]',
    },
    rejected: {
      label: 'Bị từ chối',
      className: 'bg-[#fee2e2] text-[#dc2626]',
    },
  };

  const { label, className } = config[status];

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
