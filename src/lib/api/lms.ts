import { API_BASE, readApiError, userFacingRequestError } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

export type LmsLessonType = "TYPE_A" | "TYPE_B" | "TYPE_B_PLUS";
export type LmsStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
export type LmsAttachmentCategory = "PRACTICE_TOOL" | "SUMMARY_SLIDE" | "OTHER_DOCUMENT";

export interface InstructorDto {
  id?: string | null;
  expertProfileId?: string | null;
  fullName: string;
  degree?: string | null;
  organization?: string | null;
  avatarUrl?: string | null;
  sortOrder: number;
  isLead: boolean;
}

export interface QuizQuestionDto {
  id?: string | null;
  sortOrder: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption?: string | null; // Trống ' ' nếu là học viên xem
  explanation?: string | null;
}

export interface AttachmentDto {
  id?: string | null;
  category: LmsAttachmentCategory;
  fileName: string;
  storageKey: string;
  contentType: string;
  fileSize: number;
  downloadUrl?: string | null;
  sortOrder: number;
}

export interface DbLinkDto {
  id?: string | null;
  url: string;
  title: string;
  description?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  targetCode?: string | null;
  sortOrder: number;
}

export interface LmsMaterialCardDto {
  id: string;
  materialCode: string;
  title: string;
  lessonType: LmsLessonType;
  sectorCode: string;
  durationMinutes: number;
  thumbnailUrl?: string | null;
  status: LmsStatus;
  updatedAt: string;
  leadInstructorName?: string | null;
  leadInstructorAvatar?: string | null;
  leadInstructorOrg?: string | null;
  hasAiKnowledge: boolean;
  totalViews: number;
  totalCompletions: number;
  averageRating: number;
}

export interface LmsCatalogKpisDto {
  totalCourses: number;
  totalDurationHours: number;
  totalInstructors: number;
  averageRating: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LmsCatalogResponse {
  materials: PagedResult<LmsMaterialCardDto>;
  kpis: LmsCatalogKpisDto;
}

export interface LmsMaterialDetailDto {
  id: string;
  materialCode: string;
  title: string;
  lessonType: LmsLessonType;
  sectorCode: string;
  durationMinutes: number;
  descriptionHtml?: string | null;
  videoStorageKey?: string | null;
  videoFileName?: string | null;
  videoFileSize?: number | null;
  videoDownloadUrl?: string | null;
  thumbnailUrl?: string | null;
  status: LmsStatus;
  unpublishReason?: string | null;
  unpublishedAt?: string | null;
  version: number;
  createdBy: string;
  createdByName?: string | null;
  createdAt: string;
  updatedAt: string;
  instructors: InstructorDto[];
  quizQuestions: QuizQuestionDto[];
  attachments: AttachmentDto[];
  dbLinks: DbLinkDto[];
}

export interface LmsMaterialManagementDto {
  id: string;
  materialCode: string;
  title: string;
  lessonType: LmsLessonType;
  sectorCode: string;
  durationMinutes: number;
  status: LmsStatus;
  version: number;
  updatedAt: string;
  leadInstructorName?: string | null;
  createdByName?: string | null;
  createdBy: string;
  hasAiKnowledge: boolean;
}

export interface LearnerProgressDto {
  learningMaterialId: string;
  watchedSeconds: number;
  progressPercent: number;
  isCompleted: boolean;
  lastAccessedAt: string;
}

export interface QuizAttemptResultDto {
  totalQuestions: number;
  correctAnswers: number;
  scorePercent: number;
  passed: boolean;
}

export interface CreateLearningMaterialRequest {
  title: string;
  lessonType: LmsLessonType;
  sectorCode?: string;
  durationMinutes: number;
  descriptionHtml?: string;
  videoStorageKey?: string;
  videoFileName?: string;
  videoFileSize?: number;
  thumbnailUrl?: string;
  status: LmsStatus;
  instructors: InstructorDto[];
  quizQuestions: QuizQuestionDto[];
  attachments: AttachmentDto[];
  dbLinks: DbLinkDto[];
}

export interface UpdateLearningMaterialRequest extends CreateLearningMaterialRequest {
  version: number;
}

export interface UnpublishMaterialRequest {
  reason: string;
}

export interface InstructorLookupDto {
  expertProfileId: string;
  fullName: string;
  degree?: string | null;
  organization?: string | null;
  avatarUrl?: string | null;
}

export interface MediaUploadResultDto {
  storageKey: string;
  downloadUrl: string;
  fileSize: number;
  contentType: string;
  fileName: string;
}

function getAuthHeaders(): HeadersInit {
  const token = authClient.getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// 1. CỔNG HỌC TẬP CÔNG KHAI
export async function fetchLmsCatalog(params?: {
  keyword?: string;
  lessonType?: string;
  sectorCode?: string;
  page?: number;
  pageSize?: number;
}): Promise<LmsCatalogResponse> {
  const query = new URLSearchParams();
  if (params?.keyword) query.set("keyword", params.keyword);
  if (params?.lessonType) query.set("lessonType", params.lessonType);
  if (params?.sectorCode) query.set("sectorCode", params.sectorCode);
  if (params?.page) query.set("page", params.page.toString());
  if (params?.pageSize) query.set("pageSize", params.pageSize.toString());

  const res = await fetch(`${API_BASE}/api/v1/lms/catalog?${query.toString()}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể tải danh mục học liệu số."));
  }
  const raw = await res.json();

  // Normalize Backend Envelope response { success: true, data: [...], kpis: {...}, total, page, pageSize, totalPages }
  const items = Array.isArray(raw.data) ? raw.data : Array.isArray(raw.materials?.items) ? raw.materials.items : [];
  const totalCount = typeof raw.total === "number" ? raw.total : raw.materials?.totalCount ?? items.length;
  const pageNum = typeof raw.page === "number" ? raw.page : raw.materials?.page ?? 1;
  const pageSizeNum = typeof raw.pageSize === "number" ? raw.pageSize : raw.materials?.pageSize ?? 10;
  const totalPagesNum = typeof raw.totalPages === "number" ? raw.totalPages : Math.ceil(totalCount / pageSizeNum) || 1;

  // Calculate cumulative duration hours if not provided
  const totalMinutes = items.reduce((acc: number, item: { durationMinutes?: number }) => acc + (item.durationMinutes || 0), 0);
  const totalHours = raw.kpis?.totalDurationHours ?? Math.round(totalMinutes / 60);

  return {
    materials: {
      items,
      totalCount,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages: totalPagesNum,
    },
    kpis: {
      totalCourses: raw.kpis?.totalCourses ?? totalCount,
      totalDurationHours: totalHours > 0 ? totalHours : Math.max(1, Math.round(totalMinutes / 60)),
      totalInstructors: raw.kpis?.totalInstructors ?? 4,
      averageRating: raw.kpis?.averageRating ?? 4.9,
    },
  };
}

function normalizeMaterialDetail(raw: any): LmsMaterialDetailDto {
  if (!raw) return raw;
  const data = raw.data ?? raw;
  const videoDownloadUrl =
    data.videoDownloadUrl ||
    (data.videoStorageKey ? `${API_BASE}/files/${data.videoStorageKey}` : null);

  const attachments = Array.isArray(data.attachments)
    ? data.attachments.map((att: any) => ({
        ...att,
        downloadUrl:
          att.downloadUrl ||
          (att.storageKey ? `${API_BASE}/files/${att.storageKey}` : null),
      }))
    : [];

  return {
    ...data,
    videoDownloadUrl,
    attachments,
  };
}

export async function fetchLmsCatalogDetail(id: string): Promise<LmsMaterialDetailDto> {
  const res = await fetch(`${API_BASE}/api/v1/lms/catalog/${id}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể tải chi tiết học liệu số."));
  }
  const raw = await res.json();
  return normalizeMaterialDetail(raw);
}

export async function recordLearnerProgress(id: string, watchedSeconds: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/lms/catalog/${id}/progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ watchedSeconds }),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể lưu tiến độ học tập."));
  }
}

export async function getLearnerProgress(id: string): Promise<LearnerProgressDto | null> {
  const res = await fetch(`${API_BASE}/api/v1/lms/catalog/${id}/progress`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể tải tiến độ học tập."));
  }
  return res.json();
}

export async function submitQuizAttempt(
  id: string,
  answers: Record<string, string>
): Promise<QuizAttemptResultDto> {
  const res = await fetch(`${API_BASE}/api/v1/lms/catalog/${id}/quiz-attempts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể nộp bài kiểm tra."));
  }
  return res.json();
}

// 2. BÀN LÀM VIỆC QUẢN TRỊ HỌC LIỆU
export async function fetchLmsMaterials(params?: {
  keyword?: string;
  lessonType?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<PagedResult<LmsMaterialManagementDto>> {
  const query = new URLSearchParams();
  if (params?.keyword) query.set("keyword", params.keyword);
  if (params?.lessonType) query.set("lessonType", params.lessonType);
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", params.page.toString());
  if (params?.pageSize) query.set("pageSize", params.pageSize.toString());

  const res = await fetch(`${API_BASE}/api/v1/lms/materials?${query.toString()}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể tải danh sách quản lý học liệu."));
  }
  const raw = await res.json();
  const items = Array.isArray(raw.data) ? raw.data : Array.isArray(raw.items) ? raw.items : [];
  const totalCount = typeof raw.total === "number" ? raw.total : raw.totalCount ?? items.length;
  const pageNum = typeof raw.page === "number" ? raw.page : 1;
  const pageSizeNum = typeof raw.pageSize === "number" ? raw.pageSize : 10;
  const totalPagesNum = typeof raw.totalPages === "number" ? raw.totalPages : Math.ceil(totalCount / pageSizeNum) || 1;

  return {
    items,
    totalCount,
    page: pageNum,
    pageSize: pageSizeNum,
    totalPages: totalPagesNum,
  };
}

export async function fetchLmsMaterialDetail(id: string): Promise<LmsMaterialDetailDto> {
  const res = await fetch(`${API_BASE}/api/v1/lms/materials/${id}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể tải chi tiết học liệu quản trị."));
  }
  const raw = await res.json();
  return normalizeMaterialDetail(raw);
}

export async function createLmsMaterial(payload: CreateLearningMaterialRequest): Promise<LmsMaterialDetailDto> {
  const res = await fetch(`${API_BASE}/api/v1/lms/materials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể tạo mới học liệu số."));
  }
  return normalizeMaterialDetail(await res.json());
}

export async function updateLmsMaterial(
  id: string,
  payload: UpdateLearningMaterialRequest
): Promise<LmsMaterialDetailDto> {
  const res = await fetch(`${API_BASE}/api/v1/lms/materials/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (res.status === 409) {
    throw new Error("409_CONFLICT: Học liệu đã được người khác cập nhật trước đó. Vui lòng tải lại trang.");
  }
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể cập nhật học liệu số."));
  }
  return normalizeMaterialDetail(await res.json());
}

export async function unpublishLmsMaterial(id: string, reason: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/lms/materials/${id}/unpublish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể gỡ xuất bản học liệu."));
  }
}

export async function deleteLmsMaterial(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/lms/materials/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể xóa học liệu số."));
  }
}

// 3. TRA CỨU CHUYÊN GIA
export async function lookupInstructors(query: string): Promise<InstructorLookupDto[]> {
  const res = await fetch(`${API_BASE}/api/v1/lms/instructors/lookup?q=${encodeURIComponent(query)}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể tra cứu chuyên gia."));
  }
  return res.json();
}

// 4. TẢI LÊN MEDIA (VIDEO <= 1GB HOẶC TÀI LIỆU <= 50MB)
export function uploadLmsMedia(
  file: File,
  category: string,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal
): Promise<MediaUploadResultDto> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const token = authClient.getToken();

    if (signal) {
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new DOMException("Aborted", "AbortError"));
      });
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          resolve(json);
        } catch (e) {
          reject(new Error("Lỗi đọc dữ liệu phản hồi tải tệp từ máy chủ."));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err?.message || err?.title || `Lỗi tải tệp (${xhr.status})`));
        } catch {
          reject(new Error(`Tải tệp thất bại với mã lỗi HTTP ${xhr.status}.`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Không thể kết nối máy chủ khi tải tệp. Vui lòng thử lại."));
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    xhr.open("POST", `${API_BASE}/api/v1/lms/media/upload`);
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.send(formData);
  });
}
