import { FileText, BookOpenCheck, Users, UserCheck } from 'lucide-react'
import { StatsCard } from '@/shared/ui/StatsCard'
import { DashboardStats } from '../hooks/useStats'

interface StatsGridProps {
  stats: DashboardStats
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatsCard
        title="Tổng Cung"
        value={stats.intakes.byType.ip}
        icon={FileText}
        iconBgColor="bg-primary/8"
        iconColor="text-primary"
      />
      <StatsCard
        title="Tổng Cầu"
        value={stats.intakes.byType.challenge}
        icon={BookOpenCheck}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
      />
      <StatsCard
        title="Đã công bố"
        value={stats.intakes.byStatus.published.ipCount + stats.intakes.byStatus.published.challengeCount}
        icon={BookOpenCheck}
        iconBgColor="bg-green-50"
        iconColor="text-green-600"
      />
      <StatsCard
        title="Tổng User"
        value={stats.users.total}
        icon={Users}
        iconBgColor="bg-accent/10"
        iconColor="text-accent"
      />
      <StatsCard
        title="User đang hoạt động"
        value={stats.users.byStatus.active}
        icon={UserCheck}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-600"
      />
    </div>
  )
}
