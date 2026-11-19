import { Loader2 } from 'lucide-react';
import { AiIcon } from './AiIcon';

interface AiProcessingBadgeProps {
  status: string | null;
  hasContent?: boolean;
}

function getStatusValue(status: string | null): string | null {
  return typeof status === 'string' ? status : null;
}

export function AiProcessingBadge({ status, hasContent }: AiProcessingBadgeProps) {
  const value = getStatusValue(status);

  if (value === 'processing' || value === 'PROCESSING') {
    return (
      <span className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-full bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary ring-1 ring-inset ring-primary/20">
        <Loader2 className="h-3 w-3 animate-spin" />
        Đang xử lý AI
      </span>
    );
  }
  if ((value === 'completed' || value === 'COMPLETED') && hasContent) {
    return (
      <span className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary ring-1 ring-inset ring-secondary/30">
        <AiIcon className="h-3 w-3" />
        Đã xử lý AI
      </span>
    );
  }
  if (value === 'failed' || value === 'FAILED') {
    return (
      <span className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-full bg-destructive/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive ring-1 ring-inset ring-destructive/20">
        <AiIcon className="h-3 w-3" />
        Xử lý AI thất bại
      </span>
    );
  }
  return (
    <span className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground ring-1 ring-inset ring-border">
      <AiIcon className="h-3 w-3 opacity-50" />
      Chưa xử lý AI
    </span>
  );
}
