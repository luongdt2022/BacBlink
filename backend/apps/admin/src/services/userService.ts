import apiClient from '@/lib/api/client'

export interface BackendUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  organization: string | null
  role: 'user' | 'admin'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PaginatedMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ListUsersResponse {
  data: BackendUser[]
  meta: PaginatedMeta
}

export interface CreateUserForm {
  email: string
  /**
   * B-25: bắt buộc. Máy chủ từ chối với `"password is required"` nếu thiếu, và đó là thay đổi **có chủ đích**
   * so với hệ cũ — NacenTwin đặt mật khẩu mặc định `12345678` cho mọi tài khoản do quản trị viên tạo, và đó là
   * một khoản nợ an toàn không được mang sang. Hộp thoại trước đây không có ô này, nên mọi lần bấm Tạo đều hỏng.
   */
  password: string
  firstName: string
  lastName: string
  phone: string
  organization: string
}

/**
 * Máy chủ chỉ yêu cầu mật khẩu **không rỗng** ở đường quản trị tạo tài khoản — không có luật độ dài nào.
 * Con số 8 là luật của **client**, đặt cho khớp với đường tự đăng ký (`MinLength(8)`): hai đường cùng tạo ra
 * một tài khoản đăng nhập được thì không nên có hai ngưỡng mật khẩu khác nhau.
 */
export const ADMIN_CREATE_PASSWORD_MIN_LENGTH = 8

export interface UpdateUserForm {
  firstName?: string
  lastName?: string
  phone?: string
  organization?: string
  isActive?: boolean
}

export interface ListUsersParams {
  page?: number
  limit?: number
  search?: string
  status?: 'all' | 'active' | 'inactive'
}

export async function listUsers(params: ListUsersParams = {}): Promise<ListUsersResponse> {
  const { data } = await apiClient.get<ListUsersResponse>('/admin/users', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search ?? '',
      status: params.status ?? 'all',
    },
  })
  return data
}

export async function getUser(id: string): Promise<BackendUser> {
  const { data } = await apiClient.get<BackendUser>(`/admin/users/${id}`)
  return data
}

export async function createUser(form: CreateUserForm): Promise<BackendUser> {
  const { data } = await apiClient.post<BackendUser>('/admin/users', {
    email: form.email.trim(),
    password: form.password,
    firstName: form.firstName.trim() || undefined,
    lastName: form.lastName.trim() || undefined,
    phone: form.phone.trim() || undefined,
    organization: form.organization.trim() || undefined,
  })
  return data
}

export async function updateUser(id: string, form: UpdateUserForm): Promise<BackendUser> {
  const { data } = await apiClient.patch<BackendUser>(`/admin/users/${id}`, {
    firstName: form.firstName?.trim() || undefined,
    lastName: form.lastName?.trim() || undefined,
    phone: form.phone?.trim() || undefined,
    organization: form.organization?.trim() || undefined,
    isActive: form.isActive,
  })
  return data
}

// Không có hàm xoá người dùng, và đó là chủ ý (ADR-0005): hệ thống không có thao tác "xoá" — vô hiệu hoá là
// thao tác cuối trong vòng đời tài khoản, và nó là `updateUser(id, { isActive: false })` ở trên. Hàm `deleteUser`
// từng ở đây, từng được nối nhầm vào nút "Khóa tài khoản" (B-26), và chỉ vô hại nhờ máy chủ trả 405. Một hàm
// gửi DELETE mà không có nút nào gọi là một khẩu súng đã lên đạn trong ngăn kéo — nên nó bị xoá hẳn, không
// đánh dấu.

export async function resetUserPassword(id: string, newPassword: string): Promise<void> {
  await apiClient.post(`/admin/users/${id}/reset-password`, { newPassword })
}

export interface IntakeSummary {
  id: string
  title: string
  status: 'draft' | 'published'
  category: string | null
  createdAt: string
}

export type CollaborationRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'
export type CollaborationRequestDirection = 'sent' | 'received'

export interface CollaborationRequest {
  id: string
  direction: CollaborationRequestDirection
  status: CollaborationRequestStatus
  counterpartName: string
  counterpartEmail: string
  intakeTitle: string
  intakeType: 'ip' | 'challenge'
  createdAt: string
  updatedAt: string
}

export interface CollaborationHistoryResponse {
  data: CollaborationRequest[]
  total: number
}

export interface UserProfileResponse {
  user: BackendUser
  ipIntakes: IntakeSummary[]
  challengeIntakes: IntakeSummary[]
}

export async function getUserProfile(id: string): Promise<UserProfileResponse> {
  const { data } = await apiClient.get<UserProfileResponse>(`/admin/users/${id}/profile`)
  return data
}

export async function getUserCollaborationHistory(id: string): Promise<CollaborationHistoryResponse> {
  const { data } = await apiClient.get<CollaborationHistoryResponse>(`/admin/users/${id}/collaboration-history`)
  return data
}
