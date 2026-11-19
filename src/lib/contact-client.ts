import { API_BASE, readApiError } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

/** CR-BACLINK-008 · API-BL08-CONTACT-006 */
export const CONTACT_TOPICS = [
  { value: "GENERAL", label: "Thông tin chung" },
  { value: "MEMBERSHIP", label: "Gia nhập / quyền lợi hội viên" },
  { value: "SERVICE", label: "Đăng ký dịch vụ hỗ trợ" },
  { value: "POLICY", label: "Kiến nghị, vướng mắc chính sách" },
  { value: "EVENT", label: "Sự kiện & đào tạo" },
  { value: "PARTNERSHIP", label: "Hợp tác & tài trợ" },
  { value: "PRESS", label: "Truyền thông & báo chí" },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["value"];

export interface ContactRequestInput {
  fullName: string;
  phone?: string;
  email?: string;
  organization?: string;
  topic: ContactTopic;
  message: string;
  sourcePath?: string;
  /** honeypot — luôn để trống */
  website?: string;
}

export interface ContactRequestRecord {
  id: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  organization?: string | null;
  topic: ContactTopic;
  message: string;
  sourcePath?: string | null;
  status: "NEW" | "IN_PROGRESS" | "DONE" | "SPAM";
  createdAt: string;
  handledNote?: string | null;
  handledAt?: string | null;
}

export const CONTACT_STATUS_LABEL: Record<ContactRequestRecord["status"], { label: string; cls: string; hint: string }> = {
  NEW: { label: "Đã tiếp nhận", cls: "bg-amber-100 text-amber-800", hint: "Văn phòng đã nhận, đang chờ phân công." },
  IN_PROGRESS: { label: "Đang xử lý", cls: "bg-blue-100 text-blue-800", hint: "Văn phòng đang xử lý yêu cầu của bạn." },
  DONE: { label: "Đã xử lý", cls: "bg-emerald-100 text-emerald-800", hint: "Yêu cầu đã được xử lý." },
  SPAM: { label: "Không hợp lệ", cls: "bg-slate-200 text-slate-600", hint: "Yêu cầu bị đánh dấu không hợp lệ." },
};

export const contactTopicLabel = (v: string) => CONTACT_TOPICS.find((t) => t.value === v)?.label ?? v;

export async function submitContactRequest(input: ContactRequestInput): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/v1/public/contact-requests`, {
    method: "POST",
    // Có token thì gắn yêu cầu với tài khoản để người gửi theo dõi được trạng thái (/portal/requests).
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  });
  if (res.status === 429) {
    throw new Error("Bạn đã gửi quá nhiều yêu cầu trong 1 giờ. Vui lòng thử lại sau hoặc gọi hotline.");
  }
  if (!res.ok) throw new Error(await readApiError(res, "Không gửi được yêu cầu. Vui lòng thử lại."));
  const json = await res.json();
  return { id: json?.data?.id };
}

function authHeaders(): HeadersInit {
  const token = authClient.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listContactRequests(status?: string, page = 1, limit = 20) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) qs.set("status", status);
  const res = await fetch(`${API_BASE}/api/v1/admin/contact-requests?${qs}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await readApiError(res, "Không tải được hộp thư liên hệ."));
  const json = await res.json();
  return { data: (json.data ?? []) as ContactRequestRecord[], total: (json.total ?? 0) as number };
}

export async function listMyContactRequests(): Promise<ContactRequestRecord[]> {
  const res = await fetch(`${API_BASE}/api/v1/my/contact-requests`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(await readApiError(res, "Không tải được yêu cầu của bạn."));
  const json = await res.json();
  return Array.isArray(json.data) ? (json.data as ContactRequestRecord[]) : [];
}

export async function updateContactStatus(id: string, status: ContactRequestRecord["status"], note?: string) {
  const res = await fetch(`${API_BASE}/api/v1/admin/contact-requests/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status, note: note || undefined }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Không cập nhật được trạng thái."));
}

/** Mở popup liên hệ dùng chung từ bất kỳ đâu (ContactModalHost lắng nghe sự kiện này). */
export const OPEN_CONTACT_EVENT = "baclink:open-contact";
export function openContactModal(topic: ContactTopic = "GENERAL", note?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_CONTACT_EVENT, { detail: { topic, note } }));
}
