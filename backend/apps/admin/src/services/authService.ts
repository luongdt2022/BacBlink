/**
 * Auth service - handles authentication API calls
 */

import apiClient from '@/lib/api/client'
import { setCookie, getCookie, deleteCookie } from '@/lib/cookies'
import { COOKIE_TOKEN_NAME } from '@/lib/auth/constants'
import type { AuthUser, LoginSuccessResponse, LoginCredentials } from '@/types/auth'

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<LoginSuccessResponse> {
  const response = await apiClient.post<LoginSuccessResponse>('/admin/auth/login', {
    email: credentials.email.trim(),
    password: credentials.password,
  })
  return response.data
}

/**
 * Get current user info using the token from cookie
 */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const response = await apiClient.get<{ user: AuthUser } | AuthUser>('/admin/auth/me')
  const data = response.data
  const user = 'user' in data ? data.user : data
  return user?.id && user?.email ? (user as AuthUser) : null
}

/**
 * Store token in cookie
 */
export function storeToken(token: string): void {
  setCookie(COOKIE_TOKEN_NAME, token)
}

/**
 * Get token from cookie
 */
export function getToken(): string | null {
  return getCookie(COOKIE_TOKEN_NAME)
}

/**
 * Remove token from cookie
 */
export function clearToken(): void {
  deleteCookie(COOKIE_TOKEN_NAME)
}

/**
 * Check if user is authenticated (has valid token)
 */
export async function checkAuth(): Promise<AuthUser | null> {
  const token = getToken()
  if (!token) {
    return null
  }
  try {
    const user = await fetchCurrentUser()
    if (!user) {
      clearToken()
      return null
    }
    return user
  } catch {
    clearToken()
    return null
  }
}

