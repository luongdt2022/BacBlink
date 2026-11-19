import { ArrowRight, Building2, FolderKanban } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { ImageWithFallback } from '@/shared/components/figma/ImageWithFallback';

export interface IPCardData {
  id: string;
  title: string;
  owner: string;
  imageUrl: string;
  sectors: string[];
  publishedLabel: string;
}

interface IPCardProps {
  data: IPCardData;
  onClick: (id: string) => void;
  onActionClick?: (id: string, action: string) => void;
}

export function IPCard({ data, onClick, onActionClick }: IPCardProps) {
  return (
    <div
      onClick={() => onClick(data.id)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-sm"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={data.imageUrl}
          alt={data.title}
          className="size-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col p-4 pt-3">
        <div className="mb-2.5 flex flex-wrap gap-2">
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

        <h3 className="line-clamp-2 text-base font-semibold leading-6 text-slate-950 transition-colors group-hover:text-primary">
          {data.title}
        </h3>

        <div className="mt-4 mb-4 space-y-1.5 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 shrink-0 text-slate-400" />
            <span className="truncate">{data.owner}</span>
          </div>
          <div className="flex items-center gap-2">
            <FolderKanban className="size-4 shrink-0 text-slate-400" />
            <span>{data.publishedLabel}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-medium text-slate-500">Chi tiết giải pháp</span>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onActionClick?.(data.id, 'view-detail');
              onClick(data.id);
            }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Xem chi tiết
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
