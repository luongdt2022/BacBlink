import { authClient } from "@/lib/auth-client";
import { API_BASE } from "@/lib/api-client";

export type Timeline = { title: string; subtitle?: string | null; period?: string | null };
export type Achievement = { type: string; title: string; meta?: string | null; description?: string | null };
export type ExpertLmsCourse = {
  id: string;
  materialCode: string;
  title: string;
  lessonType: string;
  durationMinutes: number;
  clusterName?: string | null;
  sectorCode?: string | null;
};

export type ExpertPublicDetail = {
  expertCode: string; fullName: string; academicRank: string; degree: string; birthYear: number; gender: string;
  organizationName: string; organizationAddress?: string | null; positionTitle?: string | null; publicBio?: string | null; consultingSummary?: string | null; avatarUrl?: string | null;
  expertiseSectors: string[]; specializedKeywords?: string[]; masteredTechCodes: string[]; isVerified: boolean; isAcceptingConsultation: boolean;
  training: Timeline[]; employment: Timeline[]; patents: Achievement[]; researchProjects: Achievement[];
  publications: Achievement[]; practicalProjects: Achievement[]; awards: Achievement[];
  courses?: ExpertLmsCourse[];
};

export type ExpertPrivateDetail = {
  publicProfile: ExpertPublicDetail; phone?: string | null; email?: string | null;
  organizationAddress?: string | null; pdpdConsent: boolean; legalOath: boolean;
  status: string; activeDocumentTypes: string[];
};

export class ExpertApiError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}

async function request<T>(path: string, auth = false): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { headers: auth ? authClient.getAuthHeaders() : undefined, cache: "no-store" });
  if (!response.ok) throw new ExpertApiError(response.status, response.status === 404 ? "Không tìm thấy hồ sơ chuyên gia." : "Không thể tải hồ sơ chuyên gia.");
  const payload = await response.json();
  return payload.data as T;
}

export const getPublicExpertDetail = (expertCode: string) => request<ExpertPublicDetail>(`/api/v1/public/experts/${encodeURIComponent(expertCode)}`);
export const getMyExpertDetail = () => request<ExpertPrivateDetail>("/api/v1/experts/me/detail", true);

export type UpdateExpertProfilePayload = {
  academicRank?: string | null;
  academicRankYear?: number | null;
  degree: string;
  degreeYear: number;
  organizationName: string;
  organizationAddress?: string | null;
  researchTitle?: string | null;
  positionTitle?: string | null;
  expertiseSectors?: string[];
  specializedKeywords?: string[];
  publicBio?: string | null;
  isAcceptingConsultation: boolean;
  trainingHistoryJson?: string | null;
  employmentHistoryJson?: string | null;
  publicationsJson?: string | null;
  consultingSummary?: string | null;
};

export type ExpertCompleteness = {
  score: number;
  grade: string;
  completedCriteria: string[];
  missingCriteria: string[];
  suggestions: string[];
};

export const updateMyExpertProfile = async (payload: UpdateExpertProfilePayload) => {
  const response = await fetch(`${API_BASE}/api/v1/experts/my-profile`, {
    method: "PUT",
    headers: {
      ...authClient.getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new ExpertApiError(response.status, err?.message || "Không thể cập nhật hồ sơ chuyên gia.");
  }
  const data = await response.json();
  return data.data;
};

export const getMyExpertCompleteness = () => request<ExpertCompleteness>("/api/v1/experts/me/completeness", true);
