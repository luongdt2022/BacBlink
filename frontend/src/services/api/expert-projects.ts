import { authClient } from "@/lib/auth-client";
import { ExpertProject } from "@/lib/expert-projects";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "" : "http://localhost:5080");

export interface ExpertProjectsQueryParams {
  sector?: string;
  search?: string;
}

export const expertProjectsApi = {
  async getMyProjects(params?: ExpertProjectsQueryParams): Promise<ExpertProject[]> {
    const q = new URLSearchParams();
    if (params?.sector && params.sector !== "ALL") {
      q.append("sector", params.sector);
    }
    if (params?.search && params.search.trim()) {
      q.append("search", params.search.trim());
    }

    const queryStr = q.toString() ? `?${q.toString()}` : "";
    const res = await fetch(`${API_BASE}/api/v1/experts/me/projects${queryStr}`, {
      headers: authClient.getAuthHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể tải danh sách dự án hợp tác.");
    }

    const body = await res.json();
    return body.data || [];
  },
};
