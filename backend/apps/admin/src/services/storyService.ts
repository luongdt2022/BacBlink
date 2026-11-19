import apiClient from '@/lib/api/client'

export type StoryType = 'success' | 'failure'
export type StoryStatus = 'draft' | 'published'

export interface Story {
  id: string
  title: string
  type: StoryType
  content: string
  lesson: string | null
  status: StoryStatus
  isHidden: boolean
  authorId: string
  author?: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

export interface StoryListItem {
  id: string
  title: string
  type: StoryType
  status: StoryStatus
  isHidden: boolean
  authorId: string
  author?: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

export interface StoryListResponse {
  data: StoryListItem[]
  total: number
  page: number
  limit: number
}

export interface StoryListParams {
  page?: number
  limit?: number
  type?: StoryType
  status?: StoryStatus
}

export interface CreateStoryPayload {
  title: string
  type: StoryType
  content: string
  lesson?: string | null
  status: StoryStatus
}

export async function getStories(params: StoryListParams = {}): Promise<StoryListResponse> {
  const res = await apiClient.get<StoryListResponse>('/admin/stories', { params })
  return res.data
}

export async function getStoryById(id: string): Promise<Story> {
  const res = await apiClient.get<Story>(`/admin/stories/${id}`)
  return res.data
}

export async function createStory(payload: CreateStoryPayload): Promise<Story> {
  const res = await apiClient.post<Story>('/admin/stories', payload)
  return res.data
}

export async function updateStory(id: string, payload: Partial<CreateStoryPayload>): Promise<Story> {
  const res = await apiClient.put<Story>(`/admin/stories/${id}`, payload)
  return res.data
}

export async function deleteStory(id: string): Promise<void> {
  await apiClient.delete(`/admin/stories/${id}`)
}

export async function toggleStoryVisibility(id: string, isHidden: boolean): Promise<Story> {
  const res = await apiClient.patch<Story>(`/admin/stories/${id}/visibility`, { isHidden })
  return res.data
}
