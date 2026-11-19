import { cn } from '@/lib/utils'

interface StatusOption {
  value: string
  label: string
}

interface StatusFilterProps {
  value: string
  onChange: (value: string) => void
  options: StatusOption[]
  label?: string
  className?: string
}

export function StatusFilter({
  value,
  onChange,
  options,
  label = 'Trạng thái',
  className,
}: StatusFilterProps) {
  return (
    <div className={cn('flex-1', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-2 block">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
