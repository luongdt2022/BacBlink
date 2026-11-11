import { API_BASE, readApiError, userFacingRequestError } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { getCachedOrFetch, invalidateCachePrefix } from "@/lib/client-cache";

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
  sectorCode?: string | null;
  durationMinutes: number;
  thumbnailUrl?: string | null;
  status: LmsStatus;
  updatedAt: string;
  leadInstructorName?: string | null;
  leadInstructorAvatar?: string | null;
  leadInstructorOrg?: string | null;
  hasAiKnowledge?: boolean;
  totalViews?: number;
  totalCompletions?: number;
  averageRating?: number;
  videoStorageKey?: string | null;
  clusterCode?: string | null;
  clusterName?: string | null;
  stepNumber?: number | null;
  microVideosCount?: number;
  inVideoQuizzesCount?: number;
  practiceRubricsCount?: number;
  faqsCount?: number;
  learningRoadmapJson?: string | null;
}

export interface MicroVideoScene {
  sceneCode: string;
  layout: string;
  sceneName: string;
  slideContent: string;
  handwriting?: string;
  lectureScript: string;
  popupQuiz?: string;
}

export interface MicroVideoDto {
  id?: string | null;
  videoOrder: number;
  videoCode: string;
  title: string;
  durationSeconds: number;
  videoStorageKey?: string | null;
  videoFileName?: string | null;
  thumbnailUrl?: string | null;
  callSheetJson?: string | null;
  scenes?: MicroVideoScene[];
}

export interface InVideoQuizDto {
  id?: string | null;
  microVideoId?: string | null;
  quizCode: string;
  triggerSeconds: number;
  afterScene?: string | null;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption?: string | null;
  explanation?: string | null;
  displayOrder: number;
}

export interface PracticeRubricDto {
  id?: string | null;
  criterionNumber: number;
  criterionName: string;
  descriptionScore0: string;
  descriptionScore1: string;
  descriptionScore2: string;
  weightMultiplier: number;
}

export interface FaqDto {
  id?: string | null;
  questionNumber: number;
  questionText: string;
  answerText: string;
  displayOrder: number;
}

export interface SubmitPracticeEvaluationRequest {
  scores: Record<number, number>; // criterionNumber (1..7) -> 0 | 1 | 2
  notes?: string;
}

export interface PracticeEvaluationResultDto {
  evaluationId: string;
  totalScore: number;
  maxScore: number;
  isPassed: boolean;
  unlockedExpertReviewCta: boolean;
  unlockedDemandCreateCta: boolean;
  evaluatedAt: string;
}

export interface LearningRoadmapMetadata {
  moduleCode?: string;
  moduleName?: string;
  pathways?: string[];
  videoFormat?: "CG" | "ĐH" | string;
  videoFunction?: string;
  templateCodes?: string[];
  expertRoles?: string[];
  level?: "CB" | "TC" | "NC" | string;
  durationText?: string;
}

export interface KnowledgeSummaryItem {
  topic: string;
  content: string;
  example?: string;
}

export interface PracticeWorkbookPartAItem {
  item: string;
  desc?: string;
  example?: string;
}

export interface PracticeWorkbookPartBSolution {
  solution: string;
  issue?: string;
  impact?: string;
  feasibility?: string;
  evidence?: string;
}

export interface PracticeWorkbookPartCStep {
  step: number | string;
  question: string;
  example?: string;
}

export interface PracticeWorkbookData {
  partA?: PracticeWorkbookPartAItem[];
  partB?: PracticeWorkbookPartBSolution[];
  partC?: PracticeWorkbookPartCStep[];
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
  sectorCode?: string | null;
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
  clusterCode?: string | null;
  clusterName?: string | null;
  stepNumber?: number | null;
  targetAudience?: string | null;
  preparationNotes?: string | null;
  expectedOutcome?: string | null;
  passScorePercent?: number;
  learningObjectivesJson?: string | null;
  learningRoadmapJson?: string | null;
  knowledgeSummaryJson?: string | null;
  practiceWorkbookJson?: string | null;
  microVideos?: MicroVideoDto[];
  inVideoQuizzes?: InVideoQuizDto[];
  practiceRubrics?: PracticeRubricDto[];
  faqs?: FaqDto[];
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
  clusterCode?: string;
  stepNumber?: number;
  page?: number;
  pageSize?: number;
}): Promise<LmsCatalogResponse> {
  const query = new URLSearchParams();
  if (params?.keyword) query.set("keyword", params.keyword);
  if (params?.lessonType) query.set("lessonType", params.lessonType);
  if (params?.sectorCode) query.set("sectorCode", params.sectorCode);
  if (params?.clusterCode) query.set("clusterCode", params.clusterCode);
  if (params?.stepNumber !== undefined && params?.stepNumber !== null) query.set("stepNumber", params.stepNumber.toString());
  if (params?.page) query.set("page", params.page.toString());
  if (params?.pageSize) query.set("pageSize", params.pageSize.toString());

  const qs = query.toString();
  const authTag = authClient.getToken() ? "auth" : "anon";
  return getCachedOrFetch(`lms:catalog:${authTag}:${qs}`, 30_000, async () => {
    const res = await fetch(`${API_BASE}/api/v1/lms/catalog?${qs}`, {
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
  });
}

function normalizeStorageUrl(url: string | null | undefined, storageKey: string | null | undefined): string | null {
  if (url) {
    return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):(5000|5080)/i, API_BASE);
  }
  return storageKey ? `${API_BASE}/files/${storageKey}` : null;
}

function normalizeMaterialDetail(raw: any): LmsMaterialDetailDto {
  if (!raw) return raw;
  const data = raw.data ?? raw;
  const videoDownloadUrl = normalizeStorageUrl(data.videoDownloadUrl, data.videoStorageKey);

  const attachments = Array.isArray(data.attachments)
    ? data.attachments.map((att: any) => ({
        ...att,
        fileSize: typeof att.fileSize === "number" ? att.fileSize : (att.fileSizeBytes ?? 0),
        sortOrder: typeof att.sortOrder === "number" ? att.sortOrder : (att.displayOrder ?? 1),
        downloadUrl: normalizeStorageUrl(att.downloadUrl, att.storageKey),
      }))
    : [];

  const quizQuestions = Array.isArray(data.quizQuestions)
    ? data.quizQuestions.map((q: any) => ({
        ...q,
        question: q.question || q.questionText || "",
        sortOrder: typeof q.sortOrder === "number" ? q.sortOrder : (q.displayOrder ?? 1),
      }))
    : [];

  const instructors = Array.isArray(data.instructors)
    ? data.instructors.map((inst: any) => ({
        ...inst,
        degree: inst.degree || inst.titleDegree || null,
        organization: inst.organization || inst.orgName || null,
        sortOrder: typeof inst.sortOrder === "number" ? inst.sortOrder : (inst.displayOrder ?? 1),
      }))
    : [];

  const microVideos = Array.isArray(data.microVideos)
    ? data.microVideos.map((mv: any) => {
        let scenes: MicroVideoScene[] = [];
        if (mv.callSheetJson) {
          try {
            const parsed = typeof mv.callSheetJson === "string" ? JSON.parse(mv.callSheetJson) : mv.callSheetJson;
            scenes = Array.isArray(parsed)
              ? parsed.map((sc: any) => ({
                  sceneCode: sc.sceneCode || sc.scene || "",
                  layout: sc.layout || "SPLIT",
                  sceneName: sc.sceneName || sc.title || "",
                  slideContent: sc.slideContent || sc.slide || "",
                  handwriting: sc.handwriting || "",
                  lectureScript: sc.lectureScript || sc.script || "",
                  popupQuiz: sc.popupQuiz || sc.quiz || "",
                }))
              : [];
          } catch {
            scenes = [];
          }
        }
        return {
          ...mv,
          scenes,
        };
      })
    : [];

  return {
    ...data,
    videoDownloadUrl,
    instructors,
    quizQuestions,
    attachments,
    microVideos,
    inVideoQuizzes: Array.isArray(data.inVideoQuizzes) ? data.inVideoQuizzes : [],
    practiceRubrics: Array.isArray(data.practiceRubrics) ? data.practiceRubrics : [],
    faqs: Array.isArray(data.faqs) ? data.faqs : [],
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
  const raw = await res.json();
  return raw?.data ?? raw;
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
  const raw = await res.json();
  return raw?.data ?? raw;
}

export async function submitPracticeEvaluation(
  materialId: string,
  payload: SubmitPracticeEvaluationRequest
): Promise<PracticeEvaluationResultDto> {
  const res = await fetch(`${API_BASE}/api/v1/lms/catalog/${materialId}/practice-evaluations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      rubricScores: payload.scores,
      scores: payload.scores,
      notes: payload.notes,
      requestExpertConsultation: true,
      createDemandProfile: true,
    }),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể lưu kết quả tự chấm điểm thực hành."));
  }
  const raw = await res.json();
  const data = raw?.data ?? raw;
  return {
    ...data,
    isPassed: typeof data.isPassed === "boolean" ? data.isPassed : Boolean(data.isUnlockedCta),
  };
}

export function parseLearningRoadmap(jsonStr?: string | null): LearningRoadmapMetadata | null {
  if (!jsonStr) return null;
  try {
    return typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
  } catch {
    return null;
  }
}

export function parseKnowledgeSummary(jsonStr?: string | null): KnowledgeSummaryItem[] {
  if (!jsonStr) return [];
  try {
    const parsed = typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parsePracticeWorkbook(jsonStr?: string | null): PracticeWorkbookData | null {
  if (!jsonStr) return null;
  try {
    return typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
  } catch {
    return null;
  }
}

export function parseLearningObjectives(jsonStr?: string | null): string[] {
  if (!jsonStr) return [];
  try {
    const parsed = typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
  invalidateCachePrefix("lms:");
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
  invalidateCachePrefix("lms:");
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
  invalidateCachePrefix("lms:");
}

export async function deleteLmsMaterial(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/lms/materials/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể xóa học liệu số."));
  }
  invalidateCachePrefix("lms:");
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
