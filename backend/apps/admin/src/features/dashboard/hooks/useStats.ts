import { useState, useEffect } from 'react'
import { getIntakeStats, getUserStats, getNotificationStats, IntakeStats, UserStats, NotificationStats, TimeRange } from '@/services/statsService'

export interface DashboardStats {
  intakes: IntakeStats
  users: UserStats
  notifications: NotificationStats
}

export interface UseStatsResult {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
}

export function useStats(days: TimeRange): UseStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    Promise.all([getIntakeStats(days), getUserStats(days), getNotificationStats(days)])
      .then(([intakes, users, notifications]) => {
        setStats({ intakes, users, notifications })
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false))
  }, [days])

  return { stats, loading, error }
}
