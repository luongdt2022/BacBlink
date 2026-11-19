import { apiClient, API_BASE_PATH } from '@/services/api/client';

export interface UserSettings {
  matchingAuto: boolean;
}

export interface UpdateSettingsRequest {
  matchingAuto: boolean;
}

export async function getMySettings(): Promise<UserSettings> {
  const res = await apiClient.get<UserSettings>(`${API_BASE_PATH}/my/settings`);
  return res.data;
}

export async function updateMySettings(payload: UpdateSettingsRequest): Promise<UserSettings> {
  const res = await apiClient.patch<UserSettings>(`${API_BASE_PATH}/my/settings`, payload);
  return res.data;
}
