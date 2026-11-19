import { useEffect, useState } from 'react';
import { Sparkles, SearchX, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { MatchCard } from './MatchCard';
import type { IntakeMatch, IntakeType } from '../api/intake';
import {
  createCollaborationRequest,
  getSentCollaborationRequests,
} from '@/features/collaboration/api/collaborationRequest';

interface MatchesSectionProps {
  matches: IntakeMatch[];
  intakeType: IntakeType;
  // Collaboration props (optional)
  parentIntakeId?: string;
  parentIntakeStatus?: string;
  title?: string;
  countLabel?: string;
  emptyHint?: string;
  actionHint?: string;
}

export function MatchesSection({
  matches,
  intakeType,
  parentIntakeId,
  parentIntakeStatus,
  title,
  countLabel,
  emptyHint,
  actionHint,
}: MatchesSectionProps) {
  const heading =
    title ??
    (intakeType === 'challenge'
      ? 'Giải pháp phù hợp'
      : 'Nhu cầu phù hợp');

  const subheading =
    intakeType === 'challenge'
      ? 'Các IP/giải pháp công nghệ có thể đáp ứng nhu cầu này'
      : 'Các bài toán/nhu cầu phù hợp với giải pháp này';

  // ─── Collaboration state ──────────────────────────────────────────────────
  // ID of the target intake that already has a sent request
  const [sentToIntakeId, setSentToIntakeId] = useState<string | null>(null);
  // ID of the target intake currently being sent (loading)
  const [sendingToIntakeId, setSendingToIntakeId] = useState<string | null>(null);
  // Whether there is any pending request from this intake (disables all buttons)
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  // On mount, check if there is already a pending request from this intake
  useEffect(() => {
    if (!parentIntakeId) return;

    let cancelled = false;
    getSentCollaborationRequests(1, 50)
      .then((res) => {
        if (cancelled) return;
        const pending = res.data.find(
          (r) => r.requesterIntakeId === parentIntakeId && r.status === 'pending',
        );
        if (pending) {
          setHasPendingRequest(true);
          setSentToIntakeId(pending.targetIntakeId);
        }
      })
      .catch(() => {
        // Silently ignore — collaboration state is non-critical
      });

    return () => {
      cancelled = true;
    };
  }, [parentIntakeId]);

  const handleSendRequest = async (targetIntakeId: string) => {
    if (!parentIntakeId || hasPendingRequest) return;

    setSendingToIntakeId(targetIntakeId);
    try {
      await createCollaborationRequest({ requesterIntakeId: parentIntakeId, targetIntakeId });
      setSentToIntakeId(targetIntakeId);
      setHasPendingRequest(true);
      toast.success('Đã gửi yêu cầu hợp tác thành công');
    } catch (err: unknown) {
      // axios wraps the response error — check status from response
      const status = axios.isAxiosError(err)
        ? err.response?.status
        : (err as { status?: number }).status;
      if (status === 400) {
        toast.error('Bạn đã có một yêu cầu hợp tác đang chờ xử lý');
        setHasPendingRequest(true);
      } else if (status === 403) {
        toast.error('Bạn không có quyền thực hiện thao tác này');
      } else if (status === 404) {
        toast.error('Không tìm thấy intake');
      } else {
        toast.error('Không thể gửi yêu cầu hợp tác. Vui lòng thử lại.');
      }
    } finally {
      setSendingToIntakeId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      {/* Section header */}
      <div className="border-b border-primary/10 bg-primary/[0.03] px-5 py-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            <Sparkles className="size-3.5" />
            AI Matching
          </div>
          <span className="rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            {countLabel ?? `${matches.length} kết quả`}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">{heading}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{subheading}</p>
          </div>
          {matches.length > 0 && (
            <div className="hidden items-center gap-1 rounded-full border border-primary/10 bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm md:inline-flex">
              <RefreshCw className="size-3.5" />
              Được hệ thống đề xuất
            </div>
          )}
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <SearchX className="size-7" />
          </div>
          <div className="space-y-1.5">
            <p className="text-base font-semibold text-slate-900">Chưa tìm thấy kết quả phù hợp nào</p>
            <p className="text-sm leading-6 text-slate-500">
              {emptyHint ?? 'Hãy bắt đầu tìm kiếm để hệ thống đề xuất các đối tượng phù hợp nhất cho hồ sơ này.'}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
            <ArrowRight className="size-3.5" />
            {actionHint ?? 'Dùng hành động ở cột phải để bắt đầu tìm kiếm'}
          </div>
        </div>
      ) : (
        <div className="space-y-3 px-5 py-5">
          {matches.map((match, index) => {
            const targetIntakeId =
              intakeType === 'ip'
                ? (match.challengeIntake?.id ?? '')
                : (match.ipIntake?.id ?? '');

            return (
              <MatchCard
                key={match.id}
                match={match}
                parentType={intakeType}
                rank={index + 1}
                parentIntakeId={parentIntakeId}
                parentIntakeStatus={parentIntakeStatus}
                isSendingRequest={sendingToIntakeId === targetIntakeId}
                isRequestSent={sentToIntakeId === targetIntakeId}
                isDisabled={hasPendingRequest && sentToIntakeId !== targetIntakeId}
                onSendRequest={parentIntakeId ? handleSendRequest : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
