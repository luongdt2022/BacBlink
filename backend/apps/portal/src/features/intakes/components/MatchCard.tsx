import { useNavigate } from 'react-router-dom';
import {
  Tag,
  Clock,
  Zap,
  FileText,
  Lightbulb,
  Send,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { IntakeMatch, IntakeType } from '../api/intake';
import { buildDetailPathByType } from '../utils/intakeRoutes';

interface MatchCardProps {
  match: IntakeMatch;
  parentType: IntakeType;
  rank: number;
  // Collaboration props (optional — only shown when parentIntakeId is provided)
  parentIntakeId?: string;
  parentIntakeStatus?: string;
  isSendingRequest?: boolean;
  isRequestSent?: boolean;
  isDisabled?: boolean;
  onSendRequest?: (targetIntakeId: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function truncate(text: string, maxLength = 150): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

const RANK_COLORS = [
  'bg-yellow-100 text-yellow-700 border-yellow-200',
  'bg-gray-100 text-gray-600 border-gray-200',
  'bg-orange-100 text-orange-600 border-orange-200',
  'bg-blue-50 text-blue-600 border-blue-200',
  'bg-blue-50 text-blue-600 border-blue-200',
];

export function MatchCard({
  match,
  parentType,
  rank,
  parentIntakeId,
  parentIntakeStatus,
  isSendingRequest = false,
  isRequestSent = false,
  isDisabled = false,
  onSendRequest,
}: MatchCardProps) {
  const navigate = useNavigate();

  // For a challenge intake, matches show IP solutions; for IP, matches show challenges
  const matchedIntake = parentType === 'challenge' ? match.ipIntake : match.challengeIntake;

  if (!matchedIntake) return null;

  const displayTitle = matchedIntake.aiProcessTitle || matchedIntake.title;
  const sectors = matchedIntake.intakeSectors ?? [];
  const rankColor = RANK_COLORS[rank - 1] ?? RANK_COLORS[4];
  const isIp = matchedIntake.type === 'ip';

  const showCollaborationButton =
    !!parentIntakeId && parentIntakeStatus === 'published' && !!onSendRequest;

  return (
    <Card
      className="group cursor-pointer border-gray-200 transition-all hover:border-blue-300 hover:shadow-md"
      onClick={() => navigate(buildDetailPathByType(matchedIntake.type, matchedIntake.id))}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Rank badge */}
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${rankColor}`}
          >
            {rank}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            {/* Title row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {isIp ? (
                  <FileText className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                ) : (
                  <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                )}
                <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                  {displayTitle}
                </p>
              </div>
              {/* Score */}
              <div className="flex shrink-0 items-center gap-1 text-xs text-gray-500">
                <Zap className="h-3 w-3 text-amber-400" />
                <span className="font-mono font-medium">{match.score.toFixed(1)}</span>
              </div>
            </div>

            {/* Sector badges */}
            {sectors.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <Tag className="h-3 w-3 shrink-0 text-gray-400" />
                {sectors.map((item) => (
                  <Badge
                    key={item.sectorId}
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px]"
                  >
                    {item.sector.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Matched chunk snippet */}
            {match.matchedChunk && (
              <p className="line-clamp-2 text-xs text-gray-500 leading-relaxed">
                {truncate(match.matchedChunk, 160)}
              </p>
            )}

            {/* Computed at */}
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock className="h-3 w-3" />
              <span>Khớp ngày {formatDate(match.computedAt)}</span>
            </div>

            {/* Collaboration Request Button */}
            {showCollaborationButton && (
              <div
                className="mt-1 flex justify-end border-t border-gray-100 pt-3"
                onClick={(e) => e.stopPropagation()}
              >
                {isRequestSent ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Đã gửi yêu cầu
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isDisabled || isSendingRequest}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendRequest(matchedIntake.id);
                    }}
                    className="h-8 gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 disabled:opacity-40"
                  >
                    {isSendingRequest ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    {isSendingRequest ? 'Đang gửi...' : 'Gửi yêu cầu hợp tác'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
