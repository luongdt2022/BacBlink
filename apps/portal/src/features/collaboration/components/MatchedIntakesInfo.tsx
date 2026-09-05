import { FileText, Lightbulb, Tag, Handshake } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import type { CollaborationIntakeInfo } from '../api/collaborationRequest';

interface MatchedIntakesInfoProps {
  requesterIntake: CollaborationIntakeInfo;
  targetIntake: CollaborationIntakeInfo;
}

function IntakeInfoCard({ intake, role }: { intake: CollaborationIntakeInfo; role: string }) {
  const displayTitle = intake.aiProcessTitle ?? intake.title;
  const displayContent = intake.aiProcessedContent ?? intake.content ?? '';
  const isIp = intake.type === 'ip';
  const sectors = intake.intakeSectors ?? [];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
      {/* Role label */}
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{role}</p>

      {/* Title */}
      <div className="flex items-start gap-2">
        {isIp ? (
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
        ) : (
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{displayTitle}</p>
          <Badge
            variant="outline"
            className={`pointer-events-none mt-1 text-[10px] ${
              isIp
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            {isIp ? 'IP' : 'Challenge'}
          </Badge>
        </div>
      </div>

      {/* Sectors */}
      {sectors.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <Tag className="h-3 w-3 shrink-0 text-gray-400" />
          {sectors.map((item) => (
            <Badge key={item.sectorId} variant="secondary" className="h-5 px-1.5 text-[10px]">
              {item.sector.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Content preview */}
      {displayContent && (
        <p className="line-clamp-4 text-xs leading-relaxed text-gray-500">{displayContent}</p>
      )}
    </div>
  );
}

export function MatchedIntakesInfo({ requesterIntake, targetIntake }: MatchedIntakesInfoProps) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-green-100 bg-green-50/50">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-green-100 px-4 py-3">
        <Handshake className="h-4 w-4 text-green-600" />
        <p className="text-sm font-semibold text-green-800">Thông tin hợp tác đã khớp</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        <IntakeInfoCard intake={requesterIntake} role="Intake đề xuất" />
        <IntakeInfoCard intake={targetIntake} role="Intake mục tiêu" />
      </div>
    </div>
  );
}
