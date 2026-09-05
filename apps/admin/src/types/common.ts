/**
 * Common types used across the application
 */

// Pagination
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Common status types
export type Status = 'pending' | 'approved' | 'rejected' | 'completed' | 'draft' | 'published'

export type EntityStatus = 'active' | 'inactive' | 'archived'

// File attachments
export interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize?: string | number
  mimeType?: string
  createdAt?: string
}

// User/Expert related
export interface Expert {
  id: string
  name: string
  avatar?: string
  email?: string
  isAuto?: boolean
  isRejected?: boolean
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
}

// Review related
export interface ReviewResult {
  score: number
  comment: string
  date: string
}

// System log
export interface SystemLog {
  id: string
  action: string
  timestamp: string
  type: 'auto' | 'manual' | 'system'
}

