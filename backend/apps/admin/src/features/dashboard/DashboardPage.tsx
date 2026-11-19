import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { TimeRangeFilter } from './components/TimeRangeFilter'
import { StatsGrid } from './components/StatsGrid'
import { ChartSection } from './components/ChartSection'
import { IntakeLineChart } from './components/IntakeLineChart'
import { IntakeStatusChart } from './components/IntakeStatusChart'
import { IntakeSectorChart } from './components/IntakeSectorChart'
import { UserLineChart } from './components/UserLineChart'
import { UserRoleChart } from './components/UserRoleChart'
import { CollaborationStatusChart } from './components/CollaborationStatusChart'
import { useStats } from './hooks/useStats'
import { TimeRange } from '@/services/statsService'
import { Alert, AlertDescription } from '@/shared/ui/alert'

export function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>(30)
  const { stats, loading, error } = useStats(timeRange)

  return (
    <div className="min-h-full px-2 py-6 sm:px-3 lg:px-4">
      <div className="flex w-full flex-col gap-6">
        <section className="flex justify-end px-2 sm:px-3">
          <div className="flex justify-end">
            <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
          </div>
        </section>

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-white/95">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {stats ? (
          <>
            <StatsGrid stats={stats} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartSection
                title="Yêu cầu hợp tác theo trạng thái"
                description="So sánh số lượng yêu cầu hợp tác nhận được, chấp nhận và từ chối."
              >
                <CollaborationStatusChart data={stats.notifications.byType} />
              </ChartSection>
              <ChartSection
                title="Xu hướng Cung & Cầu theo tháng"
                description="Quan sát tốc độ tăng trưởng và nhịp nộp Cung & Cầu theo thời gian."
              >
                <IntakeLineChart data={stats.intakes.byMonth} />
              </ChartSection>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartSection
                title="Cung & Cầu theo trạng thái"
                description="Nắm nhanh số lượng Cung & Cầu đang ở từng giai đoạn xử lý."
              >
                <IntakeStatusChart data={stats.intakes.byStatus} />
              </ChartSection>
              <ChartSection
                title="Xu hướng User theo tháng"
                description="Theo dõi nhịp tăng của tài khoản tham gia hệ thống."
              >
                <UserLineChart data={stats.users.byMonth} />
              </ChartSection>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartSection
                title="User theo vai trò"
                description="So sánh cơ cấu người dùng theo nhóm vai trò quản trị và vận hành."
              >
                <UserRoleChart data={stats.users.byRole} />
              </ChartSection>
              <ChartSection
                title="Cung & Cầu theo lĩnh vực (Top 10)"
                description="Xác định các lĩnh vực nhận nhiều Cung & Cầu nhất để ưu tiên theo dõi."
              >
                <IntakeSectorChart data={stats.intakes.bySector} />
              </ChartSection>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
