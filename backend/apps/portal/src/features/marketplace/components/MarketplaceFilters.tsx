import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

export interface MarketplaceSectorOption {
  id: string;
  label: string;
}

interface SharedFiltersProps {
  sectors: MarketplaceSectorOption[];
  selectedSectorId: string | null;
  onSectorChange: (sectorId: string | null) => void;
}

function SectorFilters({ sectors, selectedSectorId, onSectorChange }: SharedFiltersProps) {
  const selectValue = selectedSectorId ?? 'all';

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-500">Lĩnh vực</label>
      <Select
        value={selectValue}
        onValueChange={(value) => onSectorChange(value === 'all' ? null : value)}
        disabled={sectors.length === 0}
      >
        <SelectTrigger className="h-11 rounded-lg border-slate-300 bg-white">
          <SelectValue placeholder="Tất cả lĩnh vực" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả lĩnh vực</SelectItem>
          {sectors.map((sector) => (
            <SelectItem key={sector.id} value={sector.id}>
              {sector.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

type IPFiltersProps = SharedFiltersProps;

export function IPFilters(props: IPFiltersProps) {
  return <SectorFilters {...props} />;
}

type ChallengeFiltersProps = SharedFiltersProps;

export function ChallengeFilters(props: ChallengeFiltersProps) {
  return <SectorFilters {...props} />;
}
