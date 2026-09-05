import { useState, useEffect, useCallback } from 'react'
import { listUsers, updateUser } from '@/services/userService'
import type { User, UserStatus, UserStatusFilter } from '../types'

export type { UserStatus, UserStatusFilter }

export interface UseUsersListOptions {
  initialPage?: number
  initialStatus?: UserStatusFilter
  initialSearch?: string
}

export interface UseUsersListReturn {
  users: User[]
  total: number
  page: number
  totalPages: number
  isLoading: boolean
  error: string | null
  search: string
  status: UserStatusFilter

  setPage: (page: number) => void
  setStatus: (status: UserStatusFilter) => void
  setSearch: (search: string) => void
  resetFilters: () => void
  refetch: () => void
  activateUser: (id: string) => Promise<void>
  deactivateUser: (id: string) => Promise<void>
}

export function useUsersList(options: UseUsersListOptions = {}): UseUsersListReturn {
  const {
    initialPage = 1,
    initialStatus = 'all',
    initialSearch = '',
  } = options

  const [search, setSearch] = useState(initialSearch)
  const [status, setStatus] = useState<UserStatusFilter>(initialStatus)
  const [page, setPage] = useState(initialPage)

  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await listUsers({
        page,
        limit: 10,
        search: search.trim(),
        status,
      })
      setUsers(result.data.map((u) => ({
        id: u.id,
        name: [u.firstName, u.lastName].filter(Boolean).join(' ') || '—',
        email: u.email,
        phone: u.phone ?? '',
        organization: u.organization ?? '',
        registeredDate: new Date(u.createdAt).toLocaleDateString('vi-VN'),
        status: u.isActive ? 'active' : 'locked',
      })))
      setTotal(result.meta.total)
      setTotalPages(result.meta.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [page, search, status])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const resetFilters = useCallback(() => {
    setSearch('')
    setStatus('all')
    setPage(1)
  }, [])

  const activateUser = useCallback(async (id: string) => {
    await updateUser(id, { isActive: true })
    await fetchUsers()
  }, [fetchUsers])

  // B-26: nút mang nhãn "Khóa tài khoản" và toast nói "Account has been locked", nhưng đường gọi là DELETE.
  // Hôm nay vô hại vì máy chủ trả 405 (B-02) — tức là nút này chỉ vô hại nhờ một lỗi khác che cho nó. Ngày
  // B-02 được sửa, cùng dòng này sẽ xoá người dùng thật. Khoá tài khoản là đặt cờ hoạt động, đúng đường mà
  // activateUser ở ngay trên đã dùng.
  const deactivateUser = useCallback(async (id: string) => {
    await updateUser(id, { isActive: false })
    await fetchUsers()
  }, [fetchUsers])

  return {
    users,
    total,
    page,
    totalPages,
    isLoading,
    error,
    search,
    status,
    setPage,
    setStatus: (v: UserStatusFilter) => { setStatus(v); setPage(1) },
    setSearch: (v: string) => { setSearch(v); setPage(1) },
    resetFilters,
    refetch: fetchUsers,
    activateUser,
    deactivateUser,
  }
}
