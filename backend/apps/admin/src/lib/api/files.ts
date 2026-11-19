import apiClient from './client'

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await apiClient.post<{ url: string }>('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return res.data.url
}
