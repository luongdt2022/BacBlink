import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { ChartContainer } from '@/shared/ui/chart'
import { NotificationStats } from '@/services/statsService'

const ITEMS = [
  { key: 'matchFound', label: 'Tìm thấy match', color: '#2563eb' },
  { key: 'collaborationRequestReceived', label: 'Yêu cầu nhận được', color: '#10b981' },
  { key: 'collaborationRequestAccepted', label: 'Yêu cầu được chấp nhận', color: '#f59e0b' },
  { key: 'collaborationRequestRejected', label: 'Yêu cầu bị từ chối', color: '#ef4444' },
] as const

interface NotificationTypeChartProps {
  data: NotificationStats['byType']
}

export function NotificationTypeChart({ data }: NotificationTypeChartProps) {
  const chartData = ITEMS.map(({ key, label }) => ({ name: label, value: data[key] })).filter(
    (d) => d.value > 0,
  )

  if (chartData.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
  }

  return (
    <ChartContainer config={{}}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={ITEMS[index]?.color ?? '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ChartContainer>
  )
}
