import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router'
import {
  getUserProfile,
  getUserCollaborationHistory,
  resetUserPassword,
  updateUser,
  type UserProfileResponse,
  type CollaborationRequest,
} from '@/services/userService'

export type TabType = 'info' | 'activity' | 'history'

interface FullProfileData extends UserProfileResponse {
  collaborationHistory: CollaborationRequest[]
}

export function useUserProfile() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<FullProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    Promise.all([
      getUserProfile(id),
      getUserCollaborationHistory(id).catch(() => ({ data: [], total: 0 })),
    ])
      .then(([profile, collab]) => {
        setData({ ...profile, collaborationHistory: collab.data })
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Tải dữ liệu thất bại'))
      .finally(() => setIsLoading(false))
  }, [id])

  const resetPassword = useCallback(async (newPassword: string) => {
    if (!id) return
    await resetUserPassword(id, newPassword)
  }, [id])

  const lockAccount = useCallback(async () => {
    if (!id) return
    await updateUser(id, { isActive: false })
    setData((prev) => prev ? { ...prev, user: { ...prev.user, isActive: false } } : prev)
  }, [id])

  return { id, data, isLoading, error, resetPassword, lockAccount }
}
