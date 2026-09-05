import { useState, useEffect, useCallback } from 'react'
import { getIntakes } from '@/services/intakeService'
import type { IntakeListItem, IntakeStatus, IntakeType } from '@/services/intakeService'

const PAGE_SIZE = 10

interface UseIntakesListOptions {
  initialPage?: number
  initialType?: IntakeType | 'all'
  initialStatus?: IntakeStatus | 'all'
  initialSearch?: string
}

interface UseIntakesListReturn {
  // State
  intakes: IntakeListItem[]
  total: number
  page: number
  totalPages: number
  isLoading: boolean
  error: string | null
  search: string
  type: IntakeType | 'all'
  status: IntakeStatus | 'all'
  totalByStatus: { draft: number; published: number }
  hasProcessingItem: boolean

  // Actions
  setPage: (page: number) => void
  setType: (type: string) => void
  setStatus: (status: string) => void
  setSearch: (search: string) => void
  refresh: () => void
}

export function useIntakesList(options: UseIntakesListOptions = {}): UseIntakesListReturn {
  const {
    initialPage = 1,
    initialType = 'all',
    initialStatus = 'all',
    initialSearch = '',
  } = options

  // Filter state
  const [search, setSearch] = useState(initialSearch)
  const [type, setType] = useState<IntakeType | 'all'>(initialType)
  const [status, setStatus] = useState<IntakeStatus | 'all'>(initialStatus)
  const [page, setPage] = useState(initialPage)

  // Data state
  const [intakes, setIntakes] = useState<IntakeListItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalByStatus, setTotalByStatus] = useState({ draft: 0, published: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasProcessingItem, setHasProcessingItem] = useState(false)

  const getAiStatusValue = useCallback((value: unknown) => {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object' && 'status' in value) {
      return (value as { status: string }).status
    }
    return null
  }, [])

  // Reset page when filters change
  const handleSetSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleSetType = useCallback((value: string) => {
    setType(value as IntakeType | 'all')
    setPage(1)
  }, [])

  const handleSetStatus = useCallback((value: string) => {
    setStatus(value as IntakeStatus | 'all')
    setPage(1)
  }, [])

  // Fetch data
  const fetchIntakes = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await getIntakes({
        search: search || undefined,
        type: type === 'all' ? undefined : type,
        status: status === 'all' ? undefined : status,
        page,
        limit: PAGE_SIZE,
      })

      setIntakes(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
      setTotalByStatus(res.totalByStatus)
      setHasProcessingItem(
        res.data.some((item) => {
          const aiStatus = getAiStatusValue(item.aiProcessingStatus)
          return aiStatus === 'processing' || aiStatus === 'PROCESSING'
        })
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu')
    } finally {
      setIsLoading(false)
    }
  }, [getAiStatusValue, search, type, status, page])

  // Auto-fetch when filters change
  useEffect(() => {
    fetchIntakes()
  }, [fetchIntakes])

  useEffect(() => {
    if (!hasProcessingItem) return

    const intervalId = window.setInterval(() => {
      fetchIntakes()
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [fetchIntakes, hasProcessingItem])

  const refresh = useCallback(() => {
    fetchIntakes()
  }, [fetchIntakes])

  return {
    intakes,
    total,
    page,
    totalPages,
    isLoading,
    error,
    search,
    type,
    status,
    totalByStatus,
    hasProcessingItem,
    setPage,
    setType: handleSetType,
    setStatus: handleSetStatus,
    setSearch: handleSetSearch,
    refresh,
  }
}
