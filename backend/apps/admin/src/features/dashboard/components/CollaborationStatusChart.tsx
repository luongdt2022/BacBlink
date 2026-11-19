import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/shared/ui/chart'
import { NotificationStats } from '@/services/statsService'

const chartConfig = {
  received: { label: 'Nhận được', color: '#2563eb' },
  accepted: { label: 'Chấp nhận', color: '#10b981' },
  rejected: { label: 'Từ chối', color: '#ef4444' },
} as const

interface CollaborationStatusChartProps {
  data: NotificationStats['byType']
}

export function CollaborationStatusChart({ data }: CollaborationStatusChartProps) {
  const chartData = [
    {
      label: 'Yêu cầu hợp tác',
      received: data.collaborationRequestReceived,
      accepted: data.collaborationRequestAccepted,
      rejected: data.collaborationRequestRejected,
    },
  ]

  return (
    <ChartContainer config={chartConfig}>
      <BarChart data={chartData} barCategoryGap="40%">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="received" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
        <Bar dataKey="accepted" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
        <Bar dataKey="rejected" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
      </BarChart>
    </ChartContainer>
  )
}
