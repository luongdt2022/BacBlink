import { X } from 'lucide-react'

interface DynamicListFieldProps {
  label: string
  items: string[]
  onAdd: () => void
  onRemove: (index: number) => void
  onChange: (index: number, value: string) => void
  placeholder?: string
  addButtonText?: string
}

export function DynamicListField({
  label,
  items,
  onAdd,
  onRemove,
  onChange,
  placeholder = 'Nhập nội dung',
  addButtonText = '+ Thêm',
}: DynamicListFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-brand hover:underline"
        >
          {addButtonText}
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => onChange(index, e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder={placeholder}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
