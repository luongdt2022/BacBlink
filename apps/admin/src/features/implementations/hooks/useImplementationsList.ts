import { useState, useEffect, useCallback } from 'react'
import type { Implementation, ImplementationResultStatus } from '../types'

// ============================================================================
// Types
// ============================================================================

type StatusFilter = 'all' | ImplementationResultStatus

interface UseImplementationsListOptions {
  initialSearch?: string
  initialStatus?: StatusFilter
  initialField?: string
}

interface UseImplementationsListReturn {
  // Data
  implementations: Implementation[]
  total: number
  isLoading: boolean
  error: string | null

  // Filter state
  search: string
  status: StatusFilter
  field: string

  // Counts
  successCount: number
  partialCount: number
  failedCount: number

  // Setters (auto-reset page)
  setSearch: (value: string) => void
  setStatus: (value: StatusFilter) => void
  setField: (value: string) => void

  // Refresh
  refresh: () => void
}

// ============================================================================
// Mock data (replace with actual API call)
// ============================================================================

const mockImplementations: Implementation[] = [
  {
    id: '1',
    challengeName: 'Robot phẫu thuật vi phẫu thần kinh tự động',
    company: 'Bệnh viện Đa khoa Trung ương',
    solution: 'Hệ thống robot phẫu thuật AI',
    provider: 'Viện Robot & AI Y tế',
    implementationPeriod: '01/2025 - 06/2025',
    result: 'success',
    field: 'Y tế',
  },
  {
    id: '2',
    challengeName: 'Hệ thống tưới tiêu thông minh IoT',
    company: 'Tập đoàn Nông nghiệp DEF',
    solution: 'IoT Smart Agriculture Platform',
    provider: 'Viện Công nghệ Sinh học',
    implementationPeriod: '03/2025 - 08/2025',
    result: 'success',
    field: 'Nông nghiệp',
  },
  {
    id: '3',
    challengeName: 'Robot phân loại hàng hóa tự động',
    company: 'Công ty Logistics XYZ',
    solution: 'Robotic Warehouse Automation',
    provider: 'Trường ĐH Bách khoa',
    implementationPeriod: '02/2025 - 05/2025',
    result: 'partial',
    field: 'Logistics',
  },
  {
    id: '4',
    challengeName: 'Công nghệ lọc khí thải công nghiệp',
    company: 'Nhà máy Thép ABC',
    solution: 'Smart Air Filtration System',
    provider: 'Viện Môi trường & Tài nguyên',
    implementationPeriod: '04/2025 - 09/2025',
    result: 'success',
    field: 'Môi trường',
  },
  {
    id: '5',
    challengeName: 'Nền tảng học tập cá nhân hóa AI',
    company: 'Trường ĐH Công nghệ',
    solution: 'AI-Powered Learning Platform',
    provider: 'Công ty EdTech Innovation',
    implementationPeriod: '01/2025 - 04/2025',
    result: 'partial',
    field: 'Giáo dục',
  },
  {
    id: '6',
    challengeName: 'Hệ thống quản lý năng lượng thông minh',
    company: 'Tập đoàn Điện lực ABC',
    solution: 'IoT Energy Management System',
    provider: 'Viện Năng lượng Mặt trời',
    implementationPeriod: '05/2024 - 12/2024',
    result: 'failed',
    field: 'Năng lượng',
  },
]

export const RESEARCH_FIELDS = [
  'Tất cả',
  'Y tế',
  'Nông nghiệp',
  'Logistics',
  'Môi trường',
  'Giáo dục',
  'Năng lượng',
  'CNTT',
  'Cơ khí',
]

// ============================================================================
// Hook
// ============================================================================

export function useImplementationsList(
  options: UseImplementationsListOptions = {}
): UseImplementationsListReturn {
  const { initialSearch = '', initialStatus = 'all', initialField = 'Tất cả' } = options

  // Filter state
  const [search, setSearchState] = useState(initialSearch)
  const [status, setStatusState] = useState<StatusFilter>(initialStatus)
  const [field, setFieldState] = useState(initialField)

  // Data state
  const [implementations, setImplementations] = useState<Implementation[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Setters that auto-reset to page 1
  const setSearch = useCallback((value: string) => {
    setSearchState(value)
  }, [])

  const setStatus = useCallback((value: StatusFilter) => {
    setStatusState(value)
  }, [])

  const setField = useCallback((value: string) => {
    setFieldState(value)
  }, [])

  // Fetch data
  const fetchImplementations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))

      const filtered = mockImplementations.filter((impl) => {
        const matchesSearch =
          impl.challengeName.toLowerCase().includes(search.toLowerCase()) ||
          impl.solution.toLowerCase().includes(search.toLowerCase()) ||
          impl.company.toLowerCase().includes(search.toLowerCase())

        const matchesStatus = status === 'all' || impl.result === status
        const matchesField = field === 'Tất cả' || impl.field === field

        return matchesSearch && matchesStatus && matchesField
      })

      setImplementations(filtered)
      setTotal(filtered.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu')
    } finally {
      setIsLoading(false)
    }
  }, [search, status, field])

  // Auto-fetch when filters change
  useEffect(() => {
    fetchImplementations()
  }, [fetchImplementations])

  const refresh = useCallback(() => {
    fetchImplementations()
  }, [fetchImplementations])

  // Derived counts
  const successCount = mockImplementations.filter((i) => i.result === 'success').length
  const partialCount = mockImplementations.filter((i) => i.result === 'partial').length
  const failedCount = mockImplementations.filter((i) => i.result === 'failed').length

  return {
    implementations,
    total,
    isLoading,
    error,
    search,
    status,
    field,
    successCount,
    partialCount,
    failedCount,
    setSearch,
    setStatus,
    setField,
    refresh,
  }
}
