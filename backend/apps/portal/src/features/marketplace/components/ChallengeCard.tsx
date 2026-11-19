import { ArrowRight, Building2, CalendarDays } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';

export interface ChallengeCardData {
  id: string;
  title: string;
  enterprise: string;
  sectors: string[];
  publishedLabel: string;
  statusLabel: string;
}

interface ChallengeCardProps {
  data: ChallengeCardData;
  onClick: (id: string) => void;
}

export function ChallengeCard({ data, onClick }: ChallengeCardProps) {
  return (
    <div
      onClick={() => onClick(data.id)}
      className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100">
              {data.statusLabel}
            </Badge>
            {data.sectors.length > 0 ? (
              data.sectors.map((sector) => (
                <Badge
                  key={sector}
                  variant="secondary"
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {sector}
                </Badge>
              ))
            ) : (
              <Badge
                variant="secondary"
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
              >
                Chưa phân loại lĩnh vực
              </Badge>
            )}
          </div>

          <h3 className="text-xl font-semibold leading-8 text-slate-950 transition-colors group-hover:text-primary">
            {data.title}
          </h3>

          <div className="mt-4 space-y-2 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-slate-400" />
              <span>{data.enterprise}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-slate-400" />
              <span>{data.publishedLabel}</span>
            </div>
          </div>
        </div>

        <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90">
          Xem chi tiết
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
