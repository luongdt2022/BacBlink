import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { getErrorMessage } from '@/lib/api/client'
import { listAuditEvents } from '@/services/auditService'
import type { AuditEvent, AuditFilters, AuditOutcome } from '@/services/auditService'

/**
 * Bộ lọc sống **trong URL**, không trong state của component.
 *
 * Đây là màn hình mà việc gửi một liên kết cho đồng nghiệp là thao tác chính, không phải tiện ích: một cuộc
 * điều tra thường bắt đầu bằng "xem cái này giúp tôi". Bộ lọc nằm ngoài URL thì Back/Forward hỏng, tải lại
 * trang mất bộ lọc, và không có gì để gửi đi.
 */
export interface AuditLogState {
  filters: AuditFilters
  events: AuditEvent[]
  total: number
  page: number
  totalPages: number
  isLoading: boolean
  /** `true` trước lượt tra đầu tiên — khác hẳn "đã tra và không có kết quả". */
  isPristine: boolean
  error: string | null
  setFilters: (next: Partial<AuditFilters>) => void
  setPage: (page: number) => void
  reset: () => void
  refetch: () => void
}

/** Mặc định của ô kết quả là **Từ chối**: lọc DENY là cách duy nhất thấy được những gì hệ thống đã chặn. */
export const DEFAULT_OUTCOME: AuditOutcome = 'DENY'

/** Khoảng thời gian mặc định. Một truy vấn không giới hạn thời gian trên bảng lớn nhất hệ thống không nên chạy. */
export const DEFAULT_RANGE_DAYS = 7

const FILTER_KEYS = ['actorRef', 'objectKind', 'objectId', 'outcome', 'from', 'to'] as const

function readFilters(params: URLSearchParams): AuditFilters {
  const filters: AuditFilters = {}
  for (const key of FILTER_KEYS) {
    const value = params.get(key)?.trim()
    if (value) (filters as Record<string, string>)[key] = value
  }
  const page = Number(params.get('page'))
  if (Number.isFinite(page) && page > 0) filters.page = page
  return filters
}

function hasAnyFilter(filters: AuditFilters): boolean {
  return FILTER_KEYS.some((key) => Boolean(filters[key]))
}

export function defaultRange(now: Date = new Date()): { from: string; to: string } {
  const to = new Date(now)
  const from = new Date(now)
  from.setDate(from.getDate() - DEFAULT_RANGE_DAYS)
  return { from: from.toISOString(), to: to.toISOString() }
}

export function useAuditLog(): AuditLogState {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => readFilters(params), [params])

  const [events, setEvents] = useState<AuditEvent[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Màn hình mở ra với **bộ lọc rỗng và không có kết quả**; nó không tự tải trang đầu của toàn bộ nhật ký.
   * Nhật ký là bảng lớn nhất trong hệ thống và mọi dòng đều là dữ liệu nhạy cảm — đổ 20 dòng gần nhất ra cho
   * bất kỳ ai mở route là biến một công cụ điều tra thành một bảng tin.
   *
   * Ngoại lệ: tới đây từ một liên kết sâu thì bộ lọc điền sẵn từ URL và truy vấn chạy ngay.
   */
  const isPristine = !hasAnyFilter(filters)

  const fetchEvents = useCallback(async () => {
    if (!hasAnyFilter(filters)) {
      setEvents([])
      setTotal(0)
      setTotalPages(0)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const result = await listAuditEvents(filters)
      setEvents(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(getErrorMessage(err))
      setEvents([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents])

  const setFilters = useCallback(
    (next: Partial<AuditFilters>) => {
      const merged = new URLSearchParams(params)
      for (const [key, value] of Object.entries(next)) {
        if (value === undefined || value === '' || value === null) merged.delete(key)
        else merged.set(key, String(value))
      }
      // Đổi bộ lọc luôn quay về trang 1: giữ số trang cũ trên một tập kết quả khác cho ra một trang trống khó hiểu.
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

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: false }), [setParams])

  return {
    filters,
    events,
    total,
    page: filters.page ?? 1,
    totalPages,
    isLoading,
    isPristine,
    error,
    setFilters,
    setPage,
    reset,
    refetch: () => void fetchEvents(),
  }
}
