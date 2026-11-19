import { apiClient, API_BASE_PATH } from './client';

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient.post<{ url: string }>(
    `${API_BASE_PATH}/files/upload`,
    formData,
  );
  return res.data.url;
}
