import { useState } from 'react';
import { Info } from 'lucide-react';

interface StatusBadgeProps {
  status: 'draft' | 'pending' | 'listed' | 'rejected';
  rejectionReason?: string;
}

export function StatusBadge({ status, rejectionReason }: StatusBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const statusConfig = {
    draft: {
      label: 'Nháp',
      bgColor: 'bg-[#f3f4f6]',
      textColor: 'text-muted-foreground',
    },
    pending: {
      label: 'Chờ thẩm định',
      bgColor: 'bg-[#fff7ed]',
      textColor: 'text-[#ea580c]',
    },
    listed: {
      label: 'Đã niêm yết',
      bgColor: 'bg-[#dcfce7]',
      textColor: 'text-[#16a34a]',
    },
    rejected: {
      label: 'Bị từ chối',
      bgColor: 'bg-[#fee2e2]',
      textColor: 'text-[#dc2626]',
    },
  };

  const config = statusConfig[status];

  // Default rejection reason if not provided
  const reason = rejectionReason || 'Thiếu video demo sản phẩm, vui lòng bổ sung.';

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex rounded-full px-3 py-1 ${config.bgColor} ${config.textColor}`}
      >
        {config.label}
      </span>
      
      {/* Info Icon for Rejected Status */}
      {status === 'rejected' && (
        <div className="relative inline-block">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(!showTooltip);
            }}
            className="flex items-center justify-center text-[#dc2626] transition-colors hover:text-[#b91c1c]"
            aria-label="Xem lý do từ chối"
          >
            <Info className="size-4" />
          </button>
          
          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-lg border border-[#e5e7eb] bg-white p-3 shadow-lg">
              <div className="mb-1 text-xs font-medium text-foreground">Lý do từ chối:</div>
              <div className="text-xs text-muted-foreground">{reason}</div>
              {/* Arrow */}
              <div className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border-l border-t border-[#e5e7eb] bg-white"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}