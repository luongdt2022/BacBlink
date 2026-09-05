import { useEffect, useState } from 'react';
import { Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
  acceptCollaborationRequest,
  getReceivedCollaborationRequests,
  rejectCollaborationRequest,
  type CollaborationRequest,
} from '../api/collaborationRequest';
import { CollaborationRequestCard } from './CollaborationRequestCard';
import { MatchedIntakesInfo } from './MatchedIntakesInfo';

export function ReceivedRequestsTab() {
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadRequests = async (targetPage: number) => {
    setIsLoading(true);
    try {
      const res = await getReceivedCollaborationRequests(targetPage);
      setRequests(res.data);
      setTotalPages(res.totalPages);
    } catch {
      toast.error('Không thể tải danh sách yêu cầu nhận được');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests(page);
  }, [page]);

  const handleAccept = async (id: string) => {
    setActioningId(id);
    try {
      const updated = await acceptCollaborationRequest(id);
      // Replace the request in list with the updated one (includes intake relations)
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast.success('Đã chấp nhận yêu cầu hợp tác');
    } catch {
      toast.error('Không thể chấp nhận yêu cầu. Vui lòng thử lại.');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActioningId(id);
    // Optimistic update
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as const } : r)),
    );
    try {
      await rejectCollaborationRequest(id);
      toast.success('Đã từ chối yêu cầu hợp tác');
    } catch {
      // Revert
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'pending' as const } : r)),
      );
      toast.error('Không thể từ chối yêu cầu. Vui lòng thử lại.');
    } finally {
      setActioningId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Inbox className="size-7" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-slate-900">Chưa có yêu cầu nào</p>
          <p className="text-sm text-slate-500">Bạn chưa nhận được yêu cầu hợp tác nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request.id}>
            <CollaborationRequestCard
              request={request}
              mode="received"
              onAccept={handleAccept}
              onReject={handleReject}
              isActioning={actioningId === request.id}
            />
            {/* Show matched intakes info when accepted and data is available */}
            {request.status === 'accepted' &&
              request.requesterIntake &&
              request.targetIntake && (
                <MatchedIntakesInfo
                  requesterIntake={request.requesterIntake}
                  targetIntake={request.targetIntake}
                />
              )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-8 gap-1 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Trước
          </Button>
          <span className="text-xs text-gray-500">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="h-8 gap-1 text-xs"
          >
            Sau
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
