import { Globe, FileEdit } from 'lucide-react';
import type { IntakeStatus } from '../api/intake';

interface StatusBadgeProps {
  status: IntakeStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex whitespace-nowrap items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
      }`}
    >
      {status === 'published' ? (
        <>
          <Globe className="h-3 w-3" />
          Đã công bố
        </>
      ) : (
        <>
          <FileEdit className="h-3 w-3" />
          Nháp
        </>
      )}
    </span>
  );
}
