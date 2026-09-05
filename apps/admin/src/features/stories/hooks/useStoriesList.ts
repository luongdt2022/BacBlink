import { useState, useEffect, useCallback } from 'react'
import { getStories } from '@/services/storyService'
import type { StoryListItem, StoryStatus, StoryType } from '@/services/storyService'

const PAGE_SIZE = 20

export function useStoriesList() {
  const [stories, setStories] = useState<StoryListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [type, setTypeState] = useState<StoryType | 'all'>('all')
  const [status, setStatusState] = useState<StoryStatus | 'all'>('all')

  const fetchStories = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getStories({
        page,
        limit: PAGE_SIZE,
        type: type === 'all' ? undefined : type,
        status: status === 'all' ? undefined : status,
      })
      setStories(res.data)
      setTotal(res.total)
      setTotalPages(Math.ceil(res.total / PAGE_SIZE))
    } catch {
      // error handled by caller
    } finally {
      setIsLoading(false)
    }
  }, [page, type, status])

  useEffect(() => { void fetchStories() }, [fetchStories])

  const setType = (val: string) => { setTypeState(val as StoryType | 'all'); setPage(1) }
  const setStatus = (val: string) => { setStatusState(val as StoryStatus | 'all'); setPage(1) }
  const refresh = () => { void fetchStories() }

  return { stories, total, page, totalPages, isLoading, type, status, setPage, setType, setStatus, refresh }
}
