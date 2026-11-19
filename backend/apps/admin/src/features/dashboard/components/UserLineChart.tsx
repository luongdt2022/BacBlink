import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/shared/ui/chart'
import { formatMonthlyData } from '../utils/chartUtils'
import { MonthlyStat } from '@/services/statsService'

const chartConfig = {
  count: { label: 'Số User', color: '#10b981' },
} as const

interface UserLineChartProps {
  data: MonthlyStat[]
}

export function UserLineChart({ data }: UserLineChartProps) {
  const formatted = formatMonthlyData(data)

  return (
    <ChartContainer config={chartConfig}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ChartContainer>
  )
}
