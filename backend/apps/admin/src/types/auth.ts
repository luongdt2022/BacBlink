/**
 * Auth types
 */

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  createdAt: string
}

export interface LoginSuccessResponse {
  accessToken: string
  user: AuthUser
}

export interface LoginResult {
  success: boolean
  error?: string
}

export interface LoginCredentials {
  email: string
  password: string
}
