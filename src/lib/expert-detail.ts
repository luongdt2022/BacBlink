import { authClient } from "@/lib/auth-client";
import { API_BASE } from "@/lib/api-client";

export type Timeline = { title: string; subtitle?: string | null; period?: string | null };
export type Achievement = { type: string; title: string; meta?: string | null; description?: string | null };

export type ExpertPublicDetail = {
  expertCode: string; fullName: string; academicRank: string; degree: string; birthYear: number; gender: string;
  organizationName: string; positionTitle?: string | null; publicBio?: string | null;
  expertiseSectors: string[]; masteredTechCodes: string[]; isVerified: boolean; isAcceptingConsultation: boolean;
  training: Timeline[]; employment: Timeline[]; patents: Achievement[]; researchProjects: Achievement[];
  publications: Achievement[]; practicalProjects: Achievement[]; awards: Achievement[];
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
