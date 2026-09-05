import { MonthlyStat, IntakeMonthlyStat, NotificationMonthlyStat } from '@/services/statsService'

export function formatMonthlyData(data: MonthlyStat[]): { month: string; count: number }[] {
  return data.map(({ year, month, count }) => ({
    month: new Date(year, month - 1).toLocaleString('vi-VN', { month: 'short', year: '2-digit' }),
    count,
  }))
}

export function formatIntakeMonthlyData(
  data: IntakeMonthlyStat[],
): { month: string; ipCount: number; challengeCount: number }[] {
  return data.map(({ year, month, ipCount, challengeCount }) => ({
    month: new Date(year, month - 1).toLocaleString('vi-VN', { month: 'short', year: '2-digit' }),
    ipCount,
    challengeCount,
  }))
}

export function formatNotificationMonthlyData(data: NotificationMonthlyStat[]) {
  return data.map(({ year, month, matchFound, collaborationRequestReceived, collaborationRequestAccepted, collaborationRequestRejected }) => ({
    month: new Date(year, month - 1).toLocaleString('vi-VN', { month: 'short', year: '2-digit' }),
    matchFound,
    collaborationRequestReceived,
    collaborationRequestAccepted,
    collaborationRequestRejected,
  }))
}
