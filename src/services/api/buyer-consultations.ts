import { authClient } from "@/lib/auth-client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "" : "http://localhost:5080");

export interface BuyerConsultationTicket {
  id: string;
  ticketCode: string;
  expertCode?: string | null;
  expertName?: string | null;
  demandTitle: string;
  description?: string | null;
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "REJECTED" | string;
  scheduledAt?: string | null;
  meetingDate?: string | null;
  meetingTime?: string | null;
  meetingType?: string | null;
  meetingLink?: string | null;
  meetingUrl?: string | null;
  expertNote?: string | null;
  rejectionReason?: string | null;
  rating?: number | null;
  reviewComment?: string | null;
  reviewedAt?: string | null;
  completedAt?: string | null;
  requestedAt?: string;
}

export interface ReviewConsultationPayload {
  rating: number;
  comment?: string;
  reviewComment?: string;
}

export interface ReviewConsultationResult {
  id: string;
  ticketCode: string;
  rating: number;
  reviewComment?: string;
  reviewedAt?: string;
  message: string;
}

export const buyerConsultationsApi = {
  async getMyConsultations(): Promise<BuyerConsultationTicket[]> {
    const res = await fetch(`${API_BASE}/api/v1/portal/buyer/consultations`, {
      headers: authClient.getAuthHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể tải danh sách yêu cầu tư vấn.");
    }

    const body = await res.json();
    return body.data || [];
  },

  async reviewConsultation(
    ticketId: string,
    payload: ReviewConsultationPayload
  ): Promise<ReviewConsultationResult> {
    const res = await fetch(
      `${API_BASE}/api/v1/portal/buyer/consultations/${encodeURIComponent(ticketId)}/review`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authClient.getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Lỗi khi gửi đánh giá tư vấn.");
    }

    const body = await res.json();
    return body.data;
  },
};
