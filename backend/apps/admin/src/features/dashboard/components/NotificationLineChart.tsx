import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/shared/ui/chart'
import { formatNotificationMonthlyData } from '../utils/chartUtils'
import { NotificationMonthlyStat } from '@/services/statsService'

const chartConfig = {
  matchFound: { label: 'Tìm thấy match', color: '#2563eb' },
  collaborationRequestReceived: { label: 'Yêu cầu nhận', color: '#10b981' },
  collaborationRequestAccepted: { label: 'Được chấp nhận', color: '#f59e0b' },
  collaborationRequestRejected: { label: 'Bị từ chối', color: '#ef4444' },
} as const

interface NotificationLineChartProps {
  data: NotificationMonthlyStat[]
}

export function NotificationLineChart({ data }: NotificationLineChartProps) {
  const formatted = formatNotificationMonthlyData(data)

  return (
    <ChartContainer config={chartConfig}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="matchFound" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="collaborationRequestReceived" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="collaborationRequestAccepted" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="collaborationRequestRejected" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ChartContainer>
  )
}
