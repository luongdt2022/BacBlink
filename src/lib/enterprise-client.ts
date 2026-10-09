import { API_BASE, readApiError, userFacingRequestError } from "./api-client";
import { getStoredSession } from "./auth-client";

export interface EnterpriseDirectoryItem {
  id: string;
  name: string;
  taxCode: string;
  subjectType: string;
  provinceCity: string;
  mainSectorName: string;
  sectorCode?: string;
  workforceScale?: string;
  isVerified: boolean;
  tniScore?: number;
  tniClassification?: string;
  ipCount: number;
  status: string;
}

export interface EnterpriseDirectoryResponse {
  items: EnterpriseDirectoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EnterpriseProject {
  id: string;
  title: string;
  description: string;
  status?: string;
  partners?: string;
}

export interface EnterpriseIp {
  id: string;
  type: string;
  title: string;
  registrationNumber?: string;
}

export interface EnterprisePublicDetail {
  id: string;
  name: string;
  taxCode: string;
  subjectType: string;
  establishedDate?: string;
  provinceCity: string;
  addressDetail?: string;
  website?: string;
  isVerified: boolean;
  mainSectorName?: string;
  sectorCode?: string;
  ownershipType?: string;
  workforceScale?: string;
  revenueRange?: string; // "[BẢO MẬT]"
  operatingZone?: string;
  highQualificationRatio?: string;
  tniScore?: number;
  tniClassification?: string;
  hasRdUnit: boolean;
  hasRdBudget: boolean;
  isExporting: boolean;
  inValueChain: boolean;
  topBottlenecks: string[];
  supportNeeds: string[];
  projects: EnterpriseProject[];
  intellectualProperties: EnterpriseIp[];
}

export interface EnterpriseDashboardStats {
  totalEnterprises: number;
  verifiedCount: number;
  byProvince: { province: string; count: number }[];
  bySector: { sector: string; count: number }[];
  byTniClassification: { classification: string; count: number }[];
  topBottlenecks: { name: string; count: number }[];
}

export interface UpsertEnterpriseRequest {
  name?: string;
  subjectType?: string;
  establishedDate?: string;
  provinceCity?: string;
  addressDetail?: string;
  website?: string;
  description?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  isContactPublic?: boolean;
  mainSectorName?: string;
  sectorCode?: string;
  ownershipType?: string;
  workforceScale?: string;
  revenueRange?: string;
  operatingZone?: string;
  highQualificationRatio?: string;
  hasRdUnit?: boolean;
  hasRdBudget?: boolean;
  rdBudgetAmount?: number;
  rdPersonnelCount?: number;
  isExporting?: boolean;
  inValueChain?: boolean;
  topBottlenecks?: string[];
  supportNeeds?: string[];
  profileDetailsJson?: string;
}

export async function fetchEnterprises(params: {
  q?: string;
  province?: string;
  sectorCode?: string;
  subjectType?: string;
  tniClassification?: string;
  page?: number;
  pageSize?: number;
}): Promise<EnterpriseDirectoryResponse> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.province) query.set("province", params.province);
  if (params.sectorCode) query.set("sectorCode", params.sectorCode);
  if (params.subjectType) query.set("subjectType", params.subjectType);
  if (params.tniClassification) query.set("tniClassification", params.tniClassification);
  query.set("page", String(params.page || 1));
  query.set("pageSize", String(params.pageSize || 9));

  const res = await fetch(`${API_BASE}/api/v1/enterprises?${query.toString()}`);
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể tải danh bạ doanh nghiệp."));
  }
  return res.json();
}

export async function fetchEnterpriseDetail(taxCode: string): Promise<EnterprisePublicDetail> {
  const session = getStoredSession();
  const headers: HeadersInit = {};
  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  const res = await fetch(`${API_BASE}/api/v1/enterprises/${encodeURIComponent(taxCode)}`, { headers });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể tải thông tin doanh nghiệp."));
  }
  const body = await res.json();
  return body.data || body;
}

export async function fetchDashboardStats(): Promise<EnterpriseDashboardStats> {
  const res = await fetch(`${API_BASE}/api/v1/admin/enterprises/dashboard`);
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể tải số liệu thống kê doanh nghiệp."));
  }
  const body = await res.json();
  return body.data || body;
}

export async function fetchMyEnterpriseProfile(): Promise<any> {
  const session = getStoredSession();
  if (!session?.accessToken) throw new Error("Chưa đăng nhập.");

  const res = await fetch(`${API_BASE}/api/v1/portal/enterprise/profile`, {
    headers: { Authorization: `Bearer ${session.accessToken}` }
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể tải hồ sơ doanh nghiệp."));
  }
  const body = await res.json();
  return body.data || body;
}

export async function updateMyEnterpriseProfile(payload: UpsertEnterpriseRequest): Promise<any> {
  const session = getStoredSession();
  if (!session?.accessToken) throw new Error("Chưa đăng nhập.");

  const res = await fetch(`${API_BASE}/api/v1/portal/enterprise/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể cập nhật hồ sơ doanh nghiệp."));
  }
  const body = await res.json();
  return body.data || body;
}

export async function submitEnterpriseVerification(): Promise<any> {
  const session = getStoredSession();
  if (!session?.accessToken) throw new Error("Chưa đăng nhập.");

  const res = await fetch(`${API_BASE}/api/v1/portal/enterprise/submit-verification`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.accessToken}` }
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể gửi thẩm định hồ sơ."));
  }
  const body = await res.json();
  return body.data || body;
}

export async function approveEnterpriseGov(enterpriseId: string, notes?: string): Promise<any> {
  const session = getStoredSession();
  if (!session?.accessToken) throw new Error("Chưa đăng nhập.");

  const res = await fetch(`${API_BASE}/api/v1/gov/enterprises/${enterpriseId}/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ notes })
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Phê duyệt hồ sơ thất bại."));
  }
  return res.json();
}

export async function rejectEnterpriseGov(enterpriseId: string, notes?: string): Promise<any> {
  const session = getStoredSession();
  if (!session?.accessToken) throw new Error("Chưa đăng nhập.");

  const res = await fetch(`${API_BASE}/api/v1/gov/enterprises/${enterpriseId}/reject`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ notes })
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Cập nhật yêu cầu bổ sung thất bại."));
  }
  return res.json();
}
