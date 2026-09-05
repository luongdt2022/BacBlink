interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

interface TableEmptyProps {
  columns: number
  message: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function TableEmpty({ columns, message, icon, action }: TableEmptyProps) {
  return (
    <tbody>
      <tr>
        <td colSpan={columns} className="px-6 py-12 text-center">
          <div className="flex flex-col items-center justify-center">
            {icon && <div className="mb-3">{icon}</div>}
            <p className="text-gray-500 font-medium">{message}</p>
            {action && <div className="mt-2">{action}</div>}
          </div>
        </td>
      </tr>
    </tbody>
  )
}
