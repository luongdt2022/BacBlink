import { apiClient, API_BASE_PATH } from '@/services/api/client';

export type StoryType = 'success' | 'failure';
export type StoryStatus = 'draft' | 'published';

export interface Story {
  id: string;
  title: string;
  type: StoryType;
  content: string;
  lesson: string | null;
  status: StoryStatus;
  isHidden: boolean;
  authorId: string;
  author?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface StoryListItem {
  id: string;
  title: string;
  type: StoryType;
  status: StoryStatus;
  isHidden: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoryListResponse {
  data: StoryListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateStoryRequest {
  title: string;
  type: StoryType;
  content: string;
  lesson?: string | null;
  status: StoryStatus;
}

export type UpdateStoryRequest = Partial<CreateStoryRequest>;

export interface StoryListParams {
  page?: number;
  limit?: number;
  type?: StoryType;
  status?: StoryStatus;
}

const BASE = `${API_BASE_PATH}/stories`;

export async function getMyStories(params: StoryListParams = {}): Promise<StoryListResponse> {
  const res = await apiClient.get<StoryListResponse>(`${BASE}/my`, { params });
  return res.data;
}

export async function getStories(params: StoryListParams = {}): Promise<StoryListResponse> {
  const res = await apiClient.get<StoryListResponse>(BASE, { params });
  return res.data;
}

export async function getStoryById(id: string): Promise<Story> {
  const res = await apiClient.get<Story>(`${BASE}/${id}`);
  return res.data;
}

export async function createStory(request: CreateStoryRequest): Promise<Story> {
  const res = await apiClient.post<Story>(BASE, request);
  return res.data;
}

export async function updateStory(id: string, request: UpdateStoryRequest): Promise<Story> {
  const res = await apiClient.put<Story>(`${BASE}/${id}`, request);
  return res.data;
}

export async function deleteStory(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}

export async function toggleStoryVisibility(id: string, isHidden: boolean): Promise<Story> {
  const res = await apiClient.patch<Story>(`${BASE}/${id}/visibility`, { isHidden });
  return res.data;
}
