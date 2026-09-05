import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import { TimeRange } from '@/services/statsService'

interface TimeRangeFilterProps {
  value: TimeRange
  onChange: (value: TimeRange) => void
}

const OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 7, label: '7 ngày' },
  { value: 30, label: '30 ngày' },
  { value: 90, label: '90 ngày' },
  { value: 'all', label: 'Tất cả' },
]

export function TimeRangeFilter({ value, onChange }: TimeRangeFilterProps) {
  return (
    <div className="flex justify-end">
      <ToggleGroup
        type="single"
        value={String(value)}
        onValueChange={(v) => {
          if (v) onChange(v as TimeRange)
        }}
        className="flex flex-wrap justify-end gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm"
      >
        {OPTIONS.map((opt) => (
          <ToggleGroupItem
            key={opt.value}
            value={String(opt.value)}
            variant="outline"
            className="rounded-xl border-0 px-4 text-slate-600 hover:bg-slate-100 hover:text-slate-800 data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:shadow-sm data-[state=on]:hover:bg-primary"
          >
            {opt.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
