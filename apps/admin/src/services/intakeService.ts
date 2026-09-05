import apiClient, { getErrorMessage } from '@/lib/api/client'

export type IntakeStatus = 'draft' | 'published'
export type IntakeType = 'ip' | 'challenge'
export type AiProcessingStatus = 'processing' | 'completed' | 'failed' | null

export interface IntakeAttachment {
  id: string
  intakeId: string
  fileName: string
  filePath: string
  fileType: string
  mimeType: string
  fileSize: string
  confidentialLevel?: string | null
  createdAt: string
}

export interface Sector {
  id: string
  name: string
  isActive?: boolean
}

export interface IntakeSector {
  intakeId: string
  sectorId: string
  sector: Sector
}

export interface Category {
  id: string
  name: string
  isActive?: boolean
}

export interface Intake {
  id: string
  title: string
  content: string
  aiProcessedContent?: string
  aiProcessingStatus?: AiProcessingStatus
  confidentialLevel2Content?: string
  confidentialLevel2AiProcessedContent?: string
  confidentialLevel2Attachments?: IntakeAttachment[]
  confidentialLevel3Content?: string
  confidentialLevel3AiProcessedContent?: string
  confidentialLevel3Attachments?: IntakeAttachment[]
  type: IntakeType
  status: IntakeStatus
  profilePicUrl?: string | null
  sectorIds: string[]
  intakeSectors?: IntakeSector[]
  categoryId?: string | null
  category?: Category | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  attachments: IntakeAttachment[]
}

export interface IntakeListItem {
  id: string
  title: string
  type: IntakeType
  status: IntakeStatus
  aiProcessingStatus?: AiProcessingStatus
  aiProcessedContent?: string | null
  profilePicUrl?: string | null
  createdAt: string
  attachments?: IntakeAttachment[]
}

export interface IntakeListParams {
  search?: string
  type?: IntakeType | 'all'
  status?: IntakeStatus | 'all'
  page?: number
  limit?: number
}

export interface IntakeListResponse {
  data: IntakeListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  totalByStatus: {
    draft: number
    published: number
  }
}

export interface CreateIntakeRequest {
  title: string
  content: string
  aiProcessedContent?: string
  confidentialLevel2Content?: string
  confidentialLevel2AiProcessedContent?: string
  confidentialLevel2Attachments?: File[]
  confidentialLevel3Content?: string
  confidentialLevel3AiProcessedContent?: string
  confidentialLevel3Attachments?: File[]
  type: IntakeType
  status?: IntakeStatus
  sectorIds?: string[]
  categoryId?: string | null
  avatar?: File | null
  attachments?: File[]
}

export interface CreateIntakeResponse {
  success: boolean
  data: Intake
}

/**
 * Get paginated Intake list
 * GET /api/v1/admin/intakes
 */
export async function getIntakes(params: IntakeListParams = {}): Promise<IntakeListResponse> {
  try {
    const response = await apiClient.get<IntakeListResponse>('/admin/intakes', {
      params: {
        ...params,
        status: params.status === 'all' ? undefined : params.status,
      },
    })
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Get single Intake details
 * GET /api/v1/admin/intakes/:id
 */
export async function getIntakeById(id: string): Promise<Intake> {
  try {
    const response = await apiClient.get<{ data: Intake }>(`/admin/intakes/${id}`)
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Build a FormData payload for intake create/update operations.
 * Consolidates all shared field-append logic to avoid duplication.
 */
function buildIntakeFormData(request: CreateIntakeRequest): FormData {
  const formData = new FormData()

  formData.append('title', request.title)
  formData.append('content', request.content)
  if (request.aiProcessedContent) {
    formData.append('aiProcessedContent', request.aiProcessedContent)
  }

  // Confidential level 2
  if (request.confidentialLevel2Content) {
    formData.append('confidentialLevel2Content', request.confidentialLevel2Content)
  }
  if (request.confidentialLevel2AiProcessedContent) {
    formData.append(
      'confidentialLevel2AiProcessedContent',
      request.confidentialLevel2AiProcessedContent
    )
  }
  request.confidentialLevel2Attachments?.forEach((file) => {
    formData.append('confidentialLevel2Attachments', file)
  })

  // Confidential level 3
  if (request.confidentialLevel3Content) {
    formData.append('confidentialLevel3Content', request.confidentialLevel3Content)
  }
  if (request.confidentialLevel3AiProcessedContent) {
    formData.append(
      'confidentialLevel3AiProcessedContent',
      request.confidentialLevel3AiProcessedContent
    )
  }
  request.confidentialLevel3Attachments?.forEach((file) => {
    formData.append('confidentialLevel3Attachments', file)
  })

  formData.append('type', request.type)
  if (request.status) {
    formData.append('status', request.status)
  } else {
    formData.append('status', 'draft')
  }

  if (request.sectorIds && request.sectorIds.length > 0) {
    request.sectorIds.forEach((id) => {
      formData.append('sectorIds[]', id)
    })
  }

  if (request.categoryId) {
    formData.append('categoryId', request.categoryId)
  }

  if (request.avatar) {
    formData.append('profilePicture', request.avatar)
  }

  if (request.attachments && request.attachments.length > 0) {
    request.attachments.forEach((file) => {
      formData.append('attachments', file)
    })
  }

  return formData
}

/**
 * Create a new Intake via admin API (multipart/form-data)
 * POST /api/v1/admin/intakes
 */
export async function createIntake(request: CreateIntakeRequest): Promise<Intake> {
  try {
    const formData = buildIntakeFormData(request)

    const response = await apiClient.post<CreateIntakeResponse>('/admin/intakes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Delete an Intake
 * DELETE /api/v1/admin/intakes/:id
 */
export async function deleteIntake(id: string): Promise<void> {
  try {
    await apiClient.delete(`/admin/intakes/${id}`)
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Delete an attachment from an Intake
 * DELETE /api/v1/admin/intakes/:intakeId/attachments/:attachmentId
 */
export async function deleteAttachment(intakeId: string, attachmentId: string): Promise<void> {
  try {
    await apiClient.delete(`/admin/intakes/${intakeId}/attachments/${attachmentId}`)
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Update an Intake via admin API (multipart/form-data)
 * PATCH /api/v1/admin/intakes/:id
 */
export async function updateIntake(id: string, request: CreateIntakeRequest): Promise<Intake> {
  try {
    const formData = buildIntakeFormData(request)

    const response = await apiClient.patch<{ data: Intake }>(`/admin/intakes/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Get all sectors
 * GET /api/v1/admin/sectors
 */
export async function getSectors(): Promise<Sector[]> {
  try {
    const response = await apiClient.get<{ data: Sector[] } | Sector[]>('/admin/sectors')
    const result = response.data
    return Array.isArray(result) ? result : result.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await apiClient.get<Category[]>('/admin/categories')
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function createCategory(name: string): Promise<Category> {
  try {
    const response = await apiClient.post<{ success: boolean; data: Category }>('/admin/categories', { name })
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  try {
    const response = await apiClient.patch<{ success: boolean; data: Category }>(`/admin/categories/${id}`, { name })
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await apiClient.delete(`/admin/categories/${id}`)
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
