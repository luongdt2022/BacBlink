import apiClient, { getErrorMessage } from '@/lib/api/client'

export type TimeRange = 7 | 30 | 90 | 'all'

export interface MonthlyStat {
  year: number
  month: number
  count: number
}

export interface IntakeMonthlyStat {
  year: number
  month: number
  ipCount: number
  challengeCount: number
}

export interface IntakeStatusBreakdownValue {
  ipCount: number
  challengeCount: number
}

export interface IntakeStats {
  total: number
  byMonth: IntakeMonthlyStat[]
  byStatus: {
    draft: IntakeStatusBreakdownValue
    published: IntakeStatusBreakdownValue
  }
  byType: { ip: number; challenge: number }
  bySector: { sector: string; count: number }[]
}

export interface UserStats {
  total: number
  byMonth: MonthlyStat[]
  byRole: { user: number; admin: number }
  byStatus: { active: number; inactive: number }
}

export async function getIntakeStats(days: TimeRange = 30): Promise<IntakeStats> {
  try {
    const response = await apiClient.get<{ success: true; data: IntakeStats }>('/admin/stats/intakes', {
      params: { days },
    })
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function getUserStats(days: TimeRange = 30): Promise<UserStats> {
  try {
    const response = await apiClient.get<{ success: true; data: UserStats }>('/admin/stats/users', {
      params: { days },
    })
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export interface NotificationMonthlyStat {
  year: number
  month: number
  matchFound: number
  collaborationRequestReceived: number
  collaborationRequestAccepted: number
  collaborationRequestRejected: number
}

export interface NotificationStats {
  total: number
  byType: {
    matchFound: number
    collaborationRequestReceived: number
    collaborationRequestAccepted: number
    collaborationRequestRejected: number
  }
  byMonth: NotificationMonthlyStat[]
  readRate: number
}

export async function getNotificationStats(days: TimeRange = 30): Promise<NotificationStats> {
  try {
    const response = await apiClient.get<{ success: true; data: NotificationStats }>('/admin/stats/notifications', {
      params: { days },
    })
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
