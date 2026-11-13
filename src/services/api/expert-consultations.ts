import { authClient } from "@/lib/auth-client";
import { ConsultationTicket } from "@/lib/consultations";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "" : "http://localhost:5080");

export interface RespondConsultationPayload {
  action: "ACCEPT" | "REJECT" | "COMPLETE";
  meetingDate?: string;
  meetingTime?: string;
  meetingType?: string;
  meetingUrl?: string;
  scheduledAt?: string;
  meetingLink?: string;
  expertNote?: string;
  rejectionReasonCategory?: string;
  rejectionNote?: string;
  rejectionReason?: string;
}

export interface RespondConsultationResult {
  id: string;
  status: string;
  message: string;
}

export const expertConsultationsApi = {
  async getMyConsultations(): Promise<ConsultationTicket[]> {
    const res = await fetch(`${API_BASE}/api/v1/portal/expert/consultations`, {
      headers: authClient.getAuthHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      // Fallback to legacy endpoint if portal route not found
      const fallback = await fetch(`${API_BASE}/api/v1/experts/me/consultations`, {
        headers: authClient.getAuthHeaders(),
        cache: "no-store",
      });
      if (!fallback.ok) {
        const err = await fallback.json().catch(() => ({}));
        throw new Error(err.message || "Không thể tải danh sách yêu cầu tư vấn.");
      }
      const fbBody = await fallback.json();
      return fbBody.data || [];
    }

    const body = await res.json();
    return body.data || [];
  },

  async respondConsultation(
    ticketId: string,
    payload: RespondConsultationPayload
  ): Promise<RespondConsultationResult> {
    const res = await fetch(
      `${API_BASE}/api/v1/portal/expert/consultations/${encodeURIComponent(ticketId)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authClient.getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      // Fallback to legacy POST endpoint
      const fallback = await fetch(
        `${API_BASE}/api/v1/experts/me/consultations/${encodeURIComponent(ticketId)}/respond`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authClient.getAuthHeaders(),
          },
          body: JSON.stringify(payload),
        }
      );
      if (!fallback.ok) {
        const err = await fallback.json().catch(() => ({}));
        throw new Error(err.message || "Lỗi khi phản hồi yêu cầu tư vấn.");
      }
      const fbBody = await fallback.json();
      return fbBody.data;
    }

    const body = await res.json();
    return body.data;
  },
};
