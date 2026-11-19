import { apiClient, API_BASE_PATH } from '@/services/api/client';

export interface MatchFoundPayload {
  message: string;
  navigationPath: string;
  intakeId: string;
  intakeType?: 'ip' | 'challenge';
  intakeTitle: string;
  matchCount: number;
}

export interface CollaborationRequestPayload {
  message: string;
  navigationPath: string;
  requestId: string;
  requesterIntakeTitle: string;
  targetIntakeTitle: string;
}

export type NotificationType =
  | 'match_found'
  | 'collaboration_request_received'
  | 'collaboration_request_accepted'
  | 'collaboration_request_rejected';

export interface Notification {
  id: string;
  type: NotificationType;
  payload: MatchFoundPayload | CollaborationRequestPayload;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiClient.get(`${API_BASE_PATH}/my/notifications/unread-count`);
  const payload = res.data?.success !== undefined ? res.data.data : res.data;
  return payload?.unreadCount ?? payload?.count ?? 0;
}

export async function getNotifications(page = 1, limit = 15): Promise<NotificationListResponse> {
  const res = await apiClient.get(`${API_BASE_PATH}/my/notifications`, { params: { page, limit } });
  const payload = res.data?.success !== undefined ? res.data.data : res.data;
  return {
    data: Array.isArray(payload?.data) ? payload.data : [],
    total: payload?.total ?? 0,
    page: payload?.page ?? page,
    limit: payload?.limit ?? limit,
    totalPages: payload?.totalPages ?? 1,
    unreadCount: payload?.unreadCount ?? 0,
  };
}

export async function markRead(id: string): Promise<void> {
  await apiClient.patch(`${API_BASE_PATH}/my/notifications/${id}/read`);
}

export async function markAllRead(): Promise<void> {
  await apiClient.patch(`${API_BASE_PATH}/my/notifications/read-all`);
}

export async function deleteNotification(id: string): Promise<void> {
  await apiClient.delete(`${API_BASE_PATH}/my/notifications/${id}`);
}

export async function deleteAllNotifications(): Promise<void> {
  await apiClient.delete(`${API_BASE_PATH}/my/notifications/all`);
}
