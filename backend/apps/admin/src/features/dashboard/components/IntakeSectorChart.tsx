import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/shared/ui/chart'

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#a855f7',
]

interface IntakeSectorChartProps {
  data: { sector: string; count: number }[]
}

export function IntakeSectorChart({ data }: IntakeSectorChartProps) {
  // Top 10 sectors, sorted desc by count
  const top10 = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return (
    <ChartContainer config={{}}>
      <BarChart data={top10} layout="vertical" margin={{ left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="sector"
          width={120}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltipContent
          formatter={(value) => [String(value), 'Số Cung & Cầu']}
          labelFormatter={(label) => String(label)}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={26}>
          {top10.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
