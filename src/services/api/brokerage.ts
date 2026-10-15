import {
  MatchCandidate,
  ConnectionRequest,
  Opportunity,
  DealRoomData,
  GovOpportunitiesOverview,
  MouAgreement,
  DealDiscussion,
} from "@/types/brokerage";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "" : "http://localhost:5080");

export const brokerageApi = {
  async getRadarCandidates(params?: {
    sector?: string;
    minScore?: number;
    search?: string;
  }): Promise<MatchCandidate[]> {
    const q = new URLSearchParams();
    if (params?.sector && params.sector !== "ALL") q.append("sector", params.sector);
    if (params?.minScore) q.append("minScore", params.minScore.toString());
    if (params?.search) q.append("search", params.search);

    const res = await fetch(`${API_BASE}/api/v1/brokerage/radar?${q.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể tải danh sách gợi ý ghép nối.");
    const body = await res.json();
    return body.data || [];
  },

  async getConnectionRequests(status?: string): Promise<ConnectionRequest[]> {
    const q = status ? `?status=${encodeURIComponent(status)}` : "";
    const res = await fetch(`${API_BASE}/api/v1/brokerage/requests${q}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể tải danh sách yêu cầu kết nối.");
    const body = await res.json();
    return body.data || [];
  },

  async createConnectionRequest(payload: {
    demandId: string;
    offerId: string;
    senderOrgName: string;
    senderRole: string;
    receiverOrgName: string;
    message: string;
    proposedBudgetRange?: string;
  }): Promise<{ id: string; requestCode: string; status: string }> {
    const res = await fetch(`${API_BASE}/api/v1/brokerage/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể gửi yêu cầu kết nối.");
    }
    const body = await res.json();
    return body.data;
  },

  async respondConnectionRequest(
    id: string,
    action: "ACCEPT" | "REJECT",
    note?: string
  ): Promise<{ requestId: string; status: string; createdOpportunityId?: string }> {
    const res = await fetch(`${API_BASE}/api/v1/brokerage/requests/${id}/respond`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể phản hồi yêu cầu kết nối.");
    }
    const body = await res.json();
    return body.data;
  },

  async getOpportunities(stage?: string, search?: string): Promise<Opportunity[]> {
    const q = new URLSearchParams();
    if (stage && stage !== "ALL") q.append("stage", stage);
    if (search) q.append("search", search);

    const res = await fetch(`${API_BASE}/api/v1/brokerage/opportunities?${q.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể tải danh sách cơ hội hợp tác.");
    const body = await res.json();
    return body.data || [];
  },

  async updateOpportunityStage(id: string, newStage: string): Promise<Opportunity> {
    const res = await fetch(`${API_BASE}/api/v1/brokerage/opportunities/${id}/stage`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newStage }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể chuyển giai đoạn cơ hội.");
    }
    const body = await res.json();
    return body.data;
  },

  async getDealRoomDetails(id: string): Promise<DealRoomData> {
    const res = await fetch(`${API_BASE}/api/v1/brokerage/opportunities/${id}/deal-room`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể tải thông tin Deal Room.");
    const body = await res.json();
    return body.data;
  },

  async postDealDiscussion(
    id: string,
    payload: {
      senderName: string;
      senderRole: string;
      message: string;
      attachmentUrl?: string;
    }
  ): Promise<DealDiscussion> {
    const res = await fetch(`${API_BASE}/api/v1/brokerage/opportunities/${id}/discussions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể gửi ý kiến trao đổi.");
    }
    const body = await res.json();
    return body.data;
  },

  async saveMouAgreement(
    id: string,
    payload: {
      scopeOfWork: string;
      pilotDurationMonths: number;
      commercialTerms: string;
      intellectualPropertyTerms: string;
      status?: "DRAFT" | "SIGNED";
    }
  ): Promise<MouAgreement> {
    const res = await fetch(`${API_BASE}/api/v1/brokerage/opportunities/${id}/mou`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể lưu văn bản ghi nhớ MOU.");
    }
    const body = await res.json();
    return body.data;
  },

  async getGovOpportunities(authorityId?: string): Promise<GovOpportunitiesOverview> {
    const q = authorityId ? `?authorityId=${encodeURIComponent(authorityId)}` : "";
    const res = await fetch(`${API_BASE}/api/v1/gov/opportunities${q}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể tải dữ liệu giám sát cơ hội.");
    const body = await res.json();
    return body.data;
  },
};
