import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { getErrorMessage } from '@/lib/api/client'
import { listCases } from '@/services/caseService'
import type { CaseFilters, CaseRecord } from '@/services/caseService'

/**
 * Ba bộ lọc — môi giới, chủ bài toán, giai đoạn — sống **trong URL**. Đây là màn hình đầu tiên của hệ thống
 * làm đúng chuyện đó (`nen-tang/dieu-huong-va-url.md`): một liên kết kèm bộ lọc là thứ người ta gửi cho nhau.
 *
 * Máy chủ đã lọc theo quyền; hook không lọc lại và không hiện con số nào gợi ý còn hồ sơ khác người này không thấy.
 */
const FILTER_KEYS = ['brokerPersonId', 'problemOwnerPersonId', 'stage'] as const

function readFilters(params: URLSearchParams): CaseFilters {
  const filters: CaseFilters = {}
  for (const key of FILTER_KEYS) {
    const value = params.get(key)?.trim()
    if (value) filters[key] = value
  }
  const page = Number(params.get('page'))
  if (Number.isFinite(page) && page > 0) filters.page = page
  return filters
}

export function useCaseList() {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => readFilters(params), [params])
  const [cases, setCases] = useState<CaseRecord[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCases = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await listCases(filters)
      setCases(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(getErrorMessage(err))
      setCases([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void fetchCases()
  }, [fetchCases])

  const setFilters = useCallback(
    (next: Partial<CaseFilters>) => {
      const merged = new URLSearchParams(params)
      for (const [key, value] of Object.entries(next)) {
        if (value === undefined || value === '' || value === null) merged.delete(key)
        else merged.set(key, String(value))
      }
      merged.delete('page')
      setParams(merged, { replace: false })
    },
    [params, setParams]
  )

  const setPage = useCallback(
    (page: number) => {
      const merged = new URLSearchParams(params)
      if (page <= 1) merged.delete('page')
      else merged.set('page', String(page))
      setParams(merged, { replace: false })
    },
    [params, setParams]
  )

  const hasAnyFilter = FILTER_KEYS.some((k) => Boolean(filters[k]))

  return {
    filters,
    hasAnyFilter,
    cases,
    total,
    page: filters.page ?? 1,
    totalPages,
    isLoading,
    error,
    setFilters,
    setPage,
    reset: () => setParams(new URLSearchParams(), { replace: false }),
    refetch: () => void fetchCases(),
  }
}
