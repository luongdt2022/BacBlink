import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/shared/ui/chart'

const chartConfig = {
  ipCount: { label: 'Cung', color: '#2563eb' },
  challengeCount: { label: 'Cầu', color: '#10b981' },
} as const

interface IntakeStatusChartProps {
  data: {
    draft: { ipCount: number; challengeCount: number }
    published: { ipCount: number; challengeCount: number }
  }
}

export function IntakeStatusChart({ data }: IntakeStatusChartProps) {
  const chartData = [
    { status: 'draft', label: 'Bản nháp', ipCount: data.draft.ipCount, challengeCount: data.draft.challengeCount },
    {
      status: 'published',
      label: 'Đã công bố',
      ipCount: data.published.ipCount,
      challengeCount: data.published.challengeCount,
    },
  ]

  return (
    <ChartContainer config={chartConfig}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="ipCount" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={24} />
        <Bar dataKey="challengeCount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
      </BarChart>
    </ChartContainer>
  )
}
