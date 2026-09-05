import { apiClient, apiFetch, API_BASE_PATH } from '@/services/api/client';

export type IntakeType = 'ip' | 'challenge';

export type IntakeStatus = 'draft' | 'published';

export type AiProcessingStatus = 'processing' | 'completed' | 'failed' | null;

export interface IntakeAttachment {
  id: string;
  intakeId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  mimeType: string;
  fileSize: string;
  confidentialLevel?: string | null;
  createdAt: string;
}

export interface Sector {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface Category {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface IntakeSector {
  intakeId: string;
  sectorId: string;
  sector: Sector;
}

export interface Intake {
  id: string;
  title: string;
  aiProcessTitle?: string | null;
  content: string;
  aiProcessedContent?: string;
  aiProcessingStatus?: AiProcessingStatus;
  type: IntakeType;
  status: IntakeStatus;
  profilePicUrl?: string | null;
  sectorIds: string[];
  intakeSectors?: IntakeSector[];
  categoryId?: string | null;
  category?: Category | null;
  confidentialLevel2Content?: string;
  confidentialLevel2AiProcessedContent?: string;
  confidentialLevel3Content?: string;
  confidentialLevel3AiProcessedContent?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userId?: string | null;
  attachments: IntakeAttachment[];
  matches?: IntakeMatch[];
}

export interface IntakeMatch {
  id: string;
  score: number;
  matchedChunk: string;
  chunkIndex: number;
  computedAt: string;
  ipIntake?: Intake;
  challengeIntake?: Intake;
}

export interface IntakeListItem {
  id: string;
  title: string;
  type: IntakeType;
  status: IntakeStatus;
  aiProcessingStatus: AiProcessingStatus;
  aiProcessedContent?: string | null;
  profilePicUrl?: string | null;
  createdAt: string;
  userId?: string;
  attachments?: IntakeAttachment[];
  intakeSectors?: IntakeSector[];
  categoryId?: string | null;
  category?: Category | null;
}

export interface IntakeListParams {
  search?: string;
  sectorId?: string;
  type?: IntakeType | 'all';
  status?: IntakeStatus | 'all';
  page?: number;
  limit?: number;
}

export interface IntakeListResponse {
  data: IntakeListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalByStatus?: {
    draft: number;
    published: number;
  };
}

export interface CreateIntakeRequest {
  title: string;
  content: string;
  aiProcessedContent?: string;
  type: IntakeType;
  status?: IntakeStatus;
  profilePicture?: File;
  sectorIds?: string[];
  categoryId?: string | null;
  attachments?: File[];
  confidentialLevel2Content?: string;
  confidentialLevel2AiProcessedContent?: string;
  confidentialLevel2Attachments?: File[];
  confidentialLevel3Content?: string;
  confidentialLevel3AiProcessedContent?: string;
  confidentialLevel3Attachments?: File[];
}

function buildIntakeFormData(request: CreateIntakeRequest): FormData {
  const formData = new FormData();
  formData.append('title', request.title);
  formData.append('content', request.content);
  if (request.aiProcessedContent) formData.append('aiProcessedContent', request.aiProcessedContent);
  formData.append('type', request.type);
  formData.append('status', request.status ?? 'draft');

  if (request.profilePicture) formData.append('profilePicture', request.profilePicture);

  request.sectorIds?.forEach((id) => formData.append('sectorIds[]', id));
  if (request.categoryId) formData.append('categoryId', request.categoryId);

  request.attachments?.forEach((file) => formData.append('attachments', file));

  if (request.confidentialLevel2Content)
    formData.append('confidentialLevel2Content', request.confidentialLevel2Content);
  if (request.confidentialLevel2AiProcessedContent)
    formData.append('confidentialLevel2AiProcessedContent', request.confidentialLevel2AiProcessedContent);
  request.confidentialLevel2Attachments?.forEach((file) =>
    formData.append('confidentialLevel2Attachments', file),
  );

  if (request.confidentialLevel3Content)
    formData.append('confidentialLevel3Content', request.confidentialLevel3Content);
  if (request.confidentialLevel3AiProcessedContent)
    formData.append('confidentialLevel3AiProcessedContent', request.confidentialLevel3AiProcessedContent);
  request.confidentialLevel3Attachments?.forEach((file) =>
    formData.append('confidentialLevel3Attachments', file),
  );

  return formData;
}

function buildListQuery(params: IntakeListParams): string {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.sectorId) query.append('sectorId', params.sectorId);
  if (params.type && params.type !== 'all') query.append('type', params.type);
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  return query.size ? `?${query}` : '';
}

export async function getIntakes(params: IntakeListParams = {}): Promise<IntakeListResponse> {
  const { data } = await apiFetch<{
    data: IntakeListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`${API_BASE_PATH}/intakes${buildListQuery(params)}`);

  return {
    data: data.data,
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
  };
}

export async function getDiscoverIntakes(params: IntakeListParams = {}): Promise<IntakeListResponse> {
  const res = await apiClient.get<{
    data: IntakeListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`${API_BASE_PATH}/my/intakes/discover${buildListQuery(params)}`);

  return {
    data: res.data.data ?? [],
    total: res.data.total ?? 0,
    page: Number(res.data.page) || 1,
    limit: Number(res.data.limit) || 10,
    totalPages: res.data.totalPages ?? 0,
  };
}

export async function getIntakeById(id: string): Promise<Intake> {
  const { data } = await apiFetch<{ success: boolean; data: Intake }>(
    `${API_BASE_PATH}/intakes/${id}`,
  );
  return data.data;
}

export async function createIntake(request: CreateIntakeRequest): Promise<Intake> {
  const res = await apiClient.post<{ data: Intake }>(
    `${API_BASE_PATH}/my/intakes`,
    buildIntakeFormData(request),
  );
  return res.data.data;
}

export async function getSectors(): Promise<Sector[]> {
  const { data } = await apiFetch<{ success: boolean; data: Sector[] }>(`${API_BASE_PATH}/sectors`);
  return data.data;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiFetch<{ success: boolean; data: Category[] }>(`${API_BASE_PATH}/categories`);
  return data.data;
}

export async function getMyIntakes(params: IntakeListParams = {}): Promise<IntakeListResponse> {
  const res = await apiClient.get<{
    data: IntakeListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalByStatus?: { draft: number; published: number };
  }>(`${API_BASE_PATH}/my/intakes${buildListQuery(params)}`);

  return {
    data: res.data.data ?? [],
    total: res.data.total ?? 0,
    page: Number(res.data.page) || 1,
    limit: Number(res.data.limit) || 10,
    totalPages: res.data.totalPages ?? 1,
    totalByStatus: res.data.totalByStatus ?? { draft: 0, published: 0 },
  };
}

export async function updateIntake(id: string, request: CreateIntakeRequest): Promise<Intake> {
  const res = await apiClient.patch<{ data: Intake }>(
    `${API_BASE_PATH}/my/intakes/${id}`,
    buildIntakeFormData(request),
  );
  return res.data.data;
}

export async function deleteIntake(id: string): Promise<void> {
  await apiClient.delete(`${API_BASE_PATH}/my/intakes/${id}`);
}

export async function deleteAttachment(intakeId: string, attachmentId: string): Promise<void> {
  await apiClient.delete(
    `${API_BASE_PATH}/my/intakes/${intakeId}/attachments/${attachmentId}`,
  );
}

export async function computeMatches(id: string): Promise<void> {
  await apiClient.post(`${API_BASE_PATH}/my/intakes/${id}/compute-matches`);
}

export interface BeautifyResult {
  id: string;
  aiProcessTitle?: string | null;
  aiProcessedContent?: string;
  aiProcessingStatus: AiProcessingStatus;
}

export async function beautifyIntake(id: string): Promise<BeautifyResult> {
  const res = await apiClient.post<{ data: BeautifyResult }>(
    `${API_BASE_PATH}/my/intakes/${id}/beautify`,
  );
  return res.data.data;
}

export interface MarketplaceAttachment {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  mimeType: string;
  fileSize: string;
}

export interface MarketplaceIntakeDetail {
  id: string;
  title: string;
  aiProcessTitle?: string | null;
  content: string | null;
  aiProcessedContent?: string | null;
  aiProcessingStatus?: AiProcessingStatus;
  type: IntakeType;
  status: IntakeStatus;
  profilePicUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  userId?: string | null;
  intakeSectors?: IntakeSector[];
  attachments: MarketplaceAttachment[];
}

export async function getMarketplaceIntakes(params: IntakeListParams = {}): Promise<{
  data: MarketplaceIntakeDetail[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const res = await apiClient.get<{
    data: MarketplaceIntakeDetail[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`${API_BASE_PATH}/marketplace${buildListQuery(params)}`);

  return {
    data: res.data.data ?? [],
    total: res.data.total ?? 0,
    page: Number(res.data.page) || 1,
    limit: Number(res.data.limit) || 10,
    totalPages: res.data.totalPages ?? 0,
  };
}

export async function getMarketplaceIntakeById(id: string): Promise<MarketplaceIntakeDetail> {
  const res = await apiClient.get<{ success: boolean; data: MarketplaceIntakeDetail }>(
    `${API_BASE_PATH}/marketplace/${id}`,
  );
  return res.data.data;
}
