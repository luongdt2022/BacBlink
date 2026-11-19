import { apiClient } from '@/services/api/client';

const BASE = '/api/v1/my/collaboration-requests';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CollaborationRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface CollaborationIntakeInfo {
  id: string;
  title: string;
  aiProcessTitle?: string | null;
  type: 'ip' | 'challenge';
  status: string;
  content?: string;
  aiProcessedContent?: string;
  intakeSectors?: Array<{ sectorId: string; sector: { id: string; name: string } }>;
}

export interface CollaborationUserInfo {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface CollaborationRequest {
  id: string;
  requesterIntakeId: string;
  targetIntakeId: string;
  requesterUserId: string;
  targetUserId: string;
  status: CollaborationRequestStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  requesterIntake?: CollaborationIntakeInfo;
  targetIntake?: CollaborationIntakeInfo;
  requesterUser?: CollaborationUserInfo;
  targetUser?: CollaborationUserInfo;
}

export interface CollaborationRequestListResponse {
  data: CollaborationRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCollaborationRequestBody {
  requesterIntakeId: string;
  targetIntakeId: string;
  message?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function createCollaborationRequest(
  body: CreateCollaborationRequestBody,
): Promise<CollaborationRequest> {
  const res = await apiClient.post<{ success: boolean; data: CollaborationRequest }>(BASE, body);
  return res.data.data;
}

export async function getSentCollaborationRequests(
  page = 1,
  limit = 20,
): Promise<CollaborationRequestListResponse> {
  const res = await apiClient.get<{
    success: boolean;
    data: CollaborationRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`${BASE}/sent`, { params: { page, limit } });
  return {
    data: res.data.data ?? [],
    total: res.data.total ?? 0,
    page: res.data.page ?? page,
    limit: res.data.limit ?? limit,
    totalPages: res.data.totalPages ?? 1,
  };
}

export async function getReceivedCollaborationRequests(
  page = 1,
  limit = 20,
): Promise<CollaborationRequestListResponse> {
  const res = await apiClient.get<{
    success: boolean;
    data: CollaborationRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`${BASE}/received`, { params: { page, limit } });
  return {
    data: res.data.data ?? [],
    total: res.data.total ?? 0,
    page: res.data.page ?? page,
    limit: res.data.limit ?? limit,
    totalPages: res.data.totalPages ?? 1,
  };
}

export async function acceptCollaborationRequest(id: string): Promise<CollaborationRequest> {
  const res = await apiClient.post<{ success: boolean; data: CollaborationRequest }>(
    `${BASE}/${id}/accept`,
  );
  return res.data.data;
}

export async function rejectCollaborationRequest(id: string): Promise<CollaborationRequest> {
  const res = await apiClient.post<{ success: boolean; data: CollaborationRequest }>(
    `${BASE}/${id}/reject`,
  );
  return res.data.data;
}

export async function cancelCollaborationRequest(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}
