import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { ChartContainer } from '@/shared/ui/chart'

const COLORS = {
  admin: '#6366f1',
  user: '#10b981',
} as const

interface UserRoleChartProps {
  data: { user: number; admin: number }
}

export function UserRoleChart({ data }: UserRoleChartProps) {
  const chartData = [
    { name: 'Admin', value: data.admin },
    { name: 'User', value: data.user },
  ]

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
          <Cell fill={COLORS.admin} />
          <Cell fill={COLORS.user} />
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ChartContainer>
  )
}
