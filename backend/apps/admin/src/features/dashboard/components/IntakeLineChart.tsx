import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/shared/ui/chart'
import { formatIntakeMonthlyData } from '../utils/chartUtils'
import { IntakeMonthlyStat } from '@/services/statsService'

const chartConfig = {
  ipCount: { label: 'Cung', color: '#2563eb' },
  challengeCount: { label: 'Cầu', color: '#10b981' },
} as const

interface IntakeLineChartProps {
  data: IntakeMonthlyStat[]
}

export function IntakeLineChart({ data }: IntakeLineChartProps) {
  const formatted = formatIntakeMonthlyData(data)

  return (
    <ChartContainer config={chartConfig}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="ipCount" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
        <Line
          type="monotone"
          dataKey="challengeCount"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
