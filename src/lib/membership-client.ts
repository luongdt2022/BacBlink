import { API_BASE, readApiError } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

/** CR-BACLINK-008 · API-BL08-TIERS-001 / -FEATURED-002 / -MY-004 / -ADMIN-005 */

export interface MembershipTier {
  code: string;
  name: string;
  memberType: "OFFICIAL" | "ASSOCIATE" | "HONORARY";
  audience?: string | null;
  annualFee: number;
  joiningFee: number;
  sortOrder: number;
  isActive: boolean;
}

export type MembershipStatus = "ACTIVE" | "EXPIRED" | "SUSPENDED";

export interface Membership {
  id: string;
  enterpriseId: string;
  enterpriseName: string;
  taxCode?: string | null;
  sectorName?: string | null;
  provinceCity?: string | null;
  tierCode: string;
  tierName: string;
  status: MembershipStatus;
  certificateNo?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
  feeAmount?: number | null;
  feePaidAt?: string | null;
  feeNote?: string | null;
  isFeatured: boolean;
  featuredOrder?: number | null;
  renewalRequestedAt?: string | null;
  statusNote?: string | null;
  daysLeft?: number | null;
  feePaid: boolean;
  expiringSoon: boolean;
}

export interface FeaturedMember {
  enterpriseId: string;
  name: string;
  taxCode?: string | null;
  sectorName?: string | null;
  provinceCity?: string | null;
  tierName: string;
}

export interface CertificateVerification {
  certificateNo: string;
  enterpriseName: string;
  taxCode?: string | null;
  tierName: string;
  status: MembershipStatus;
  validFrom?: string | null;
  validTo?: string | null;
}

export const MEMBERSHIP_STATUS_LABEL: Record<MembershipStatus, { label: string; cls: string }> = {
  ACTIVE: { label: "Đang hiệu lực", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" },
  EXPIRED: { label: "Hết hạn – chờ gia hạn", cls: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  SUSPENDED: { label: "Tạm ngưng", cls: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" },
};

export const formatVnd = (n?: number | null) =>
  n === null || n === undefined ? "—" : n === 0 ? "Miễn phí" : `${n.toLocaleString("vi-VN")} đ`;

export const formatDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("vi-VN") : "—");

function auth(): HeadersInit {
  const t = authClient.getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function getJson<T>(path: string, init?: RequestInit, fallback = "Không tải được dữ liệu hội viên."): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) throw new Error(await readApiError(res, fallback));
  const json = await res.json();
  return json.data as T;
}

const jsonInit = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json", ...auth() },
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const membershipClient = {
  tiers: () => getJson<MembershipTier[]>("/api/v1/public/membership/tiers"),
  featured: (limit = 8) => getJson<FeaturedMember[]>(`/api/v1/public/members/featured?limit=${limit}`),
  verify: (certNo: string) =>
    getJson<CertificateVerification>(`/api/v1/public/memberships/verify/${encodeURIComponent(certNo.trim())}`, undefined, "Không tìm thấy chứng nhận hội viên với số này."),
  mine: () => getJson<Membership | null>("/api/v1/my/membership", { headers: auth() }),
  requestRenewal: () => getJson<{ requested: boolean }>("/api/v1/my/membership/renewal-requests", jsonInit("POST")),

  adminList: (params: { status?: string; q?: string; expiringDays?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set("status", params.status);
    if (params.q) qs.set("q", params.q);
    if (params.expiringDays) qs.set("expiringDays", String(params.expiringDays));
    return getJson<{ items: Membership[]; verifiedWithoutMembership: FeaturedMember[] }>(`/api/v1/admin/memberships?${qs}`, { headers: auth() });
  },
  activate: (enterpriseId: string, tierCode?: string) => getJson<{ certificateNo: string }>("/api/v1/admin/memberships/activate", jsonInit("POST", { enterpriseId, tierCode })),
  recordFee: (id: string, amount: number, note?: string) => getJson(`/api/v1/admin/memberships/${id}/record-fee`, jsonInit("POST", { amount, note })),
  renew: (id: string) => getJson(`/api/v1/admin/memberships/${id}/renew`, jsonInit("POST")),
  suspend: (id: string, reason: string) => getJson(`/api/v1/admin/memberships/${id}/suspend`, jsonInit("POST", { reason })),
  restore: (id: string) => getJson(`/api/v1/admin/memberships/${id}/restore`, jsonInit("POST")),
  setFeatured: (id: string, isFeatured: boolean, order?: number) => getJson(`/api/v1/admin/memberships/${id}/featured`, jsonInit("PUT", { isFeatured, order })),
  updateTier: (code: string, t: Pick<MembershipTier, "name" | "audience" | "annualFee" | "joiningFee" | "isActive">) =>
    getJson(`/api/v1/admin/membership/tiers/${code}`, jsonInit("PUT", t)),
};

/** Payload hồ sơ gia nhập (gửi qua POST /api/v1/governance/approvals, requestType = ENTERPRISE). */
export interface JoinApplication {
  taxCode: string;
  companyName: string;
  district: string;
  industrialZone: string;
  sectorCode: string;
  workforceScale: string;
  tierCode: string;
  description: string;
  highlightProducts: string;
  website: string;
  representativeSalutation: "Ông" | "Bà";
  representativeName: string;
  representativeTitle: string;
  representativePhone: string;
  representativeEmail: string;
  assistantName: string;
  assistantPhone: string;
  assistantEmail: string;
  legalDocUrl?: string;
  legalDocFileName?: string;
  acceptedCharterAt?: string;
}

export async function submitJoinApplication(app: JoinApplication): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/v1/governance/approvals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth() },
    body: JSON.stringify({
      requestType: "ENTERPRISE",
      scopeType: "GLOBAL",
      scopeId: null,
      payloadJson: JSON.stringify({ ...app, capabilityTier: "DUAL", approvalTier: "ADMIN_SINGLE_TIER", submittedAt: new Date().toISOString() }),
    }),
  });
  if (!res.ok) throw new Error(await readApiError(res, "Không gửi được hồ sơ gia nhập. Vui lòng thử lại."));
  const json = await res.json();
  return { id: json?.data?.id };
}

export async function uploadLegalDoc(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/api/v1/files/upload`, { method: "POST", headers: auth(), body: fd });
  if (!res.ok) throw new Error(await readApiError(res, "Không tải được tệp giấy phép lên."));
  const json = await res.json();
  return json.url as string;
}
