import { ArrowRight, Clock, FileText, Lightbulb, Loader2, X, Check } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { formatRelativeTime } from '@/features/notifications/utils/formatRelativeTime';
import type { CollaborationRequest, CollaborationRequestStatus } from '../api/collaborationRequest';

interface CollaborationRequestCardProps {
  request: CollaborationRequest;
  mode: 'sent' | 'received';
  onCancel?: (id: string) => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  isActioning?: boolean;
}

const STATUS_BADGE: Record<
  CollaborationRequestStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Đang chờ',
    className: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  },
  accepted: {
    label: 'Đã chấp nhận',
    className: 'border-green-200 bg-green-50 text-green-700',
  },
  rejected: {
    label: 'Đã từ chối',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  cancelled: {
    label: 'Đã hủy',
    className: 'border-gray-200 bg-gray-50 text-gray-500',
  },
};

function IntakeLabel({
  intake,
  label,
}: {
  intake?: { title: string; aiProcessTitle?: string | null; type: 'ip' | 'challenge' } | null;
  label: string;
}) {
  if (!intake) return null;
  const displayTitle = intake.aiProcessTitle ?? intake.title;
  const isIp = intake.type === 'ip';

  return (
    <div className="min-w-0 flex-1">
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <div className="flex items-center gap-1.5">
        {isIp ? (
          <FileText className="h-3.5 w-3.5 shrink-0 text-blue-500" />
        ) : (
          <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-500" />
        )}
        <p className="truncate text-sm font-medium text-gray-900" title={displayTitle}>
          {displayTitle}
        </p>
      </div>
    </div>
  );
}

export function CollaborationRequestCard({
  request,
  mode,
  onCancel,
  onAccept,
  onReject,
  isActioning = false,
}: CollaborationRequestCardProps) {
  const statusBadge = STATUS_BADGE[request.status];

  return (
    <Card className="border-gray-200 transition-colors hover:border-gray-300">
      <CardContent className="p-4">
        {/* Intake info row */}
        <div className="flex items-start gap-3">
          <IntakeLabel intake={request.requesterIntake} label="Intake đề xuất" />
          <div className="mt-4 shrink-0 text-gray-300">
            <ArrowRight className="h-4 w-4" />
          </div>
          <IntakeLabel intake={request.targetIntake} label="Intake mục tiêu" />
        </div>

        {/* Status + time row */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`pointer-events-none text-[11px] font-semibold ${statusBadge.className}`}
            >
              {statusBadge.label}
            </Badge>
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{formatRelativeTime(request.createdAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {mode === 'sent' && request.status === 'pending' && onCancel && (
              <Button
                size="sm"
                variant="outline"
                disabled={isActioning}
                onClick={() => onCancel(request.id)}
                className="h-7 gap-1 text-xs text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                {isActioning ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
                Hủy yêu cầu
              </Button>
            )}

            {mode === 'received' && request.status === 'pending' && (
              <>
                {onReject && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isActioning}
                    onClick={() => onReject(request.id)}
                    className="h-7 gap-1 text-xs text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    {isActioning ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    Từ chối
                  </Button>
                )}
                {onAccept && (
                  <Button
                    size="sm"
                    disabled={isActioning}
                    onClick={() => onAccept(request.id)}
                    className="h-7 gap-1 text-xs bg-primary text-white hover:bg-primary/90"
                  >
                    {isActioning ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    Chấp nhận
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Hint for rejected sent requests */}
        {mode === 'sent' && request.status === 'rejected' && (
          <p className="mt-2 text-xs text-gray-400">
            Yêu cầu đã bị từ chối. Bạn có thể quay lại trang intake để chọn đối tác khác.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
