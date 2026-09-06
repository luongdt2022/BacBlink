import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/api/client'
import { createOperationKey } from '@/lib/api/idempotency'
import { listSignals, markSignalConverted, rejectSignal } from '@/services/signalService'
import type { DemandSignal } from '@/services/signalService'

export interface UseSignalsListReturn {
  signals: DemandSignal[]
  total: number
  page: number
  totalPages: number
  isLoading: boolean
  error: string | null
  status: string
  signalClass: string

  setPage: (page: number) => void
  setStatus: (status: string) => void
  setSignalClass: (signalClass: string) => void
  refetch: () => void
  reject: (signal: DemandSignal, reason: string) => Promise<void>
  markConverted: (signal: DemandSignal, demandBriefId: string) => Promise<void>
}

/**
 * Mặc định lọc `NEW`, và đó là chủ đích: bàn này là hàng đợi việc phải xử, không phải kho lưu trữ. Tín hiệu đã
 * xử vẫn xem được bằng bộ lọc — chúng là dữ liệu về chất lượng nguồn, không phải rác.
 */
export function useSignalsList(): UseSignalsListReturn {
  const [status, setStatusFilter] = useState('NEW')
  const [signalClass, setSignalClassFilter] = useState('')
  const [page, setPage] = useState(1)

  const [signals, setSignals] = useState<DemandSignal[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSignals = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await listSignals({ status, signalClass, page })
      setSignals(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(getErrorMessage(err))
      setSignals([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }, [status, signalClass, page])

  useEffect(() => {
    void fetchSignals()
  }, [fetchSignals])

  const setStatus = useCallback((next: string) => {
    setStatusFilter(next)
    setPage(1)
  }, [])

  const setSignalClass = useCallback((next: string) => {
    setSignalClassFilter(next)
    setPage(1)
  }, [])

  // Một khoá cho mỗi lần bấm nút (ADR-0004). Sinh ở đây chứ không ở tầng HTTP, vì tầng HTTP không biết
  // đâu là "một thao tác" — nó chỉ thấy từng lần gọi.
  const reject = useCallback(async (signal: DemandSignal, reason: string) => {
    await rejectSignal(signal.id, reason, signal.version, createOperationKey())
    await fetchSignals()
  }, [fetchSignals])

  const markConverted = useCallback(async (signal: DemandSignal, demandBriefId: string) => {
    await markSignalConverted(signal.id, demandBriefId, signal.version, createOperationKey())
    await fetchSignals()
  }, [fetchSignals])

  return {
    signals, total, page, totalPages, isLoading, error, status, signalClass,
    setPage, setStatus, setSignalClass, refetch: fetchSignals, reject, markConverted,
  }
}
