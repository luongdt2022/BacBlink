import { API_BASE, readApiError } from "./api-client";
import { getCachedOrFetch } from "./client-cache";

export interface PortalOverviewStats {
  totalOffers: number;
  totalDemands: number;
  totalEnterprises: number;
  totalExperts: number;
  totalProvinces: number;
  updatedAt: string;
  totalSuccessfulConnections?: number;
  totalEstimatedValueMillionVnd?: number;
}

export interface TechmartEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: "UPCOMING" | "HAPPENING" | "CLOSED";
  technologiesCount: number;
  pdfBrochureUrl?: string;
  bannerUrl?: string;
}

export interface EventRegistrationRequest {
  eventId: string;
  organizationName: string;
  contactName: string;
  phoneNumber: string;
  email: string;
  roleType: "VISITOR" | "BUYER" | "SELLER_BOOTH";
  notes?: string;
}

export interface EventRegistrationResponse {
  registrationCode: string;
  status: string;
  registeredAt: string;
}

export interface AiSuggestionItem {
  title: string;
  subtitle: string;
  url: string;
  tag?: string;
}

export interface AiQuickAssistResponse {
  reply: string;
  suggestedTopic?: string;
  redirectUrl?: string;
  suggestions?: AiSuggestionItem[];
}

export const portalClient = {
  async getStats(): Promise<PortalOverviewStats> {
    return getCachedOrFetch("portal:stats", 30_000, async () => {
      const res = await fetch(`${API_BASE}/api/v1/portal/stats`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, "Không thể tải thống kê cổng thông tin."));
      }
      const json = await res.json();
      return json.data;
    });
  },

  async getPublicDemands(params?: {
    q?: string;
    sectorCode?: string;
    tniClassification?: string;
    rotate?: boolean;
    limit?: number;
  }): Promise<any[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.q) searchParams.set("q", params.q);
      if (params?.sectorCode) searchParams.set("sectorCode", params.sectorCode);
      if (params?.tniClassification) searchParams.set("tniClassification", params.tniClassification);
      if (params?.rotate !== undefined) searchParams.set("rotate", String(params.rotate));
      if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));

      const queryStr = searchParams.toString();
      const url = queryStr ? `${API_BASE}/api/v1/public/demands?${queryStr}` : `${API_BASE}/api/v1/public/demands`;

      return await getCachedOrFetch(`portal:demands:${queryStr}`, 20_000, async () => {
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        return Array.isArray(json) ? json : (json.data ?? []);
      });
    } catch {
      return [];
    }
  },

  async listEvents(status?: string, page = 1, pageSize = 10): Promise<{ data: TechmartEvent[]; total: number }> {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    const qs = params.toString();

    return getCachedOrFetch(`portal:events:${qs}`, 30_000, async () => {
      const res = await fetch(`${API_BASE}/api/v1/events/techmart?${qs}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, "Không thể tải danh sách sự kiện Techmart."));
      }
      const json = await res.json();
      return {
        data: json.data?.data ?? json.data?.items ?? [],
        total: json.data?.total ?? 0,
      };
    });
  },

  async registerEvent(request: EventRegistrationRequest): Promise<EventRegistrationResponse> {
    const res = await fetch(`${API_BASE}/api/v1/events/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      throw new Error(await readApiError(res, "Không thể đăng ký tham gia sự kiện."));
    }
    const json = await res.json();
    return json.data;
  },

  async quickAiAssist(prompt: string): Promise<AiQuickAssistResponse> {
    const res = await fetch(`${API_BASE}/api/v1/ai/quick-assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      throw new Error(await readApiError(res, "Không thể kết nối trợ lý AI."));
    }
    const json = await res.json();
    return json.data;
  },
};
