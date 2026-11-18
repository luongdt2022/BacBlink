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
  ownershipType?: string | null;
  operatingZone?: string | null;
  hasRdUnit?: boolean;
  isExporting?: boolean;
  inValueChain?: boolean;
  topBottlenecks?: string[];
  supportNeeds?: string[];
  innovationScore?: number;
  innovationTier?: string;
  innovationBadge?: string;
  website?: string;
  tt17Score?: number;
  tt17Classification?: string;
  tt17SyncCoefficient?: number;
}

export interface InnovationCriteriaDetail {
  criteriaCode: string;
  criteriaName: string;
  maxScore: number;
  score: number;
  sourceQuestion?: string;
  reviewerComment?: string;
}

export interface InnovationGroupScore {
  groupCode: string;
  groupName: string;
  maxScore: number;
  score: number;
  percentage: number;
  criteriaList?: InnovationCriteriaDetail[];
}

export interface RadarAxis {
  axis: string;
  value: number;
  maxValue: number;
  fullMark?: number;
}

export interface InnovationEvaluation {
  id: string;
  enterpriseId: string;
  taxCode: string;
  evaluationYear: number;
  criteriaVersion: string;
  totalScore: number;
  classification: 'LEADING' | 'DEVELOPING' | 'POTENTIAL' | 'UNRATED';
  classificationLabel: string;
  badgeName: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  groupScores: InnovationGroupScore[];
  radarChartData: RadarAxis[];
  criteriaDetails?: InnovationCriteriaDetail[];
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
  innovationTier?: string;
  tt17Classification?: string;
  sortBy?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}): Promise<EnterpriseDirectoryResponse> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.province) query.set("province", params.province);
  if (params.sectorCode) query.set("sectorCode", params.sectorCode);
  if (params.subjectType) query.set("subjectType", params.subjectType);
  if (params.tniClassification) query.set("tniClassification", params.tniClassification);
  if (params.innovationTier) query.set("innovationTier", params.innovationTier);
  if (params.tt17Classification) query.set("tt17Classification", params.tt17Classification);
  const sortVal = params.sortBy || params.sort;
  if (sortVal) query.set("sortBy", sortVal);
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

const MY_PROFILE_CACHE_TTL_MS = 30_000;

export interface FetchMyEnterpriseProfileOptions {
  forceRefresh?: boolean;
}

let myProfileCache: {
  token: string;
  data: any;
  expiresAt: number;
} | null = null;
let myProfileInFlight: {
  token: string;
  promise: Promise<any>;
} | null = null;
let myProfileCacheGeneration = 0;

/** Clears the cached enterprise profile so the next read fetches fresh state. */
export function invalidateMyEnterpriseProfileCache(): void {
  myProfileCacheGeneration += 1;
  myProfileCache = null;
  myProfileInFlight = null;
}

export async function fetchMyEnterpriseProfile(
  options?: FetchMyEnterpriseProfileOptions
): Promise<any> {
  const session = getStoredSession();
  if (!session?.accessToken) throw new Error("Chưa đăng nhập.");

  const token = session.accessToken;
  const fetchDirect = async () => {
    const res = await fetch(`${API_BASE}/api/v1/portal/enterprise/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      throw new Error(await readApiError(res, "Không thể tải hồ sơ doanh nghiệp."));
    }
    const body = await res.json();
    return body.data || body;
  };

  if (typeof window === "undefined") {
    return fetchDirect();
  }

  if (options?.forceRefresh === true) {
    invalidateMyEnterpriseProfileCache();
  }

  if (
    myProfileCache !== null &&
    myProfileCache.token === token &&
    Date.now() < myProfileCache.expiresAt
  ) {
    return myProfileCache.data;
  }

  if (myProfileInFlight !== null && myProfileInFlight.token === token) {
    return myProfileInFlight.promise;
  }

  const requestGeneration = myProfileCacheGeneration;
  const currentPromise = fetchDirect()
    .then((data) => {
      if (requestGeneration === myProfileCacheGeneration) {
        myProfileCache = {
          token,
          data,
          expiresAt: Date.now() + MY_PROFILE_CACHE_TTL_MS,
        };
      }
      return data;
    })
    .finally(() => {
      if (myProfileInFlight?.promise === currentPromise) {
        myProfileInFlight = null;
      }
    });

  myProfileInFlight = { token, promise: currentPromise };
  return currentPromise;
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
  invalidateMyEnterpriseProfileCache();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("nacentwin_enterprise_profile_updated"));
  }
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
  invalidateMyEnterpriseProfileCache();
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

export async function lookupTaxCode(taxCode: string): Promise<{
  found: boolean;
  source?: 'INTERNAL' | 'VIETQR';
  taxCode?: string;
  name?: string;
  province?: string;
  address?: string;
  contactPerson?: string;
  sectorName?: string;
  message?: string;
}> {
  const clean = taxCode.trim();
  if (!clean) throw new Error("Mã số thuế không được để trống.");

  const res = await fetch(`${API_BASE}/api/v1/enterprises/lookup-tax/${encodeURIComponent(clean)}`);
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể tra cứu mã số thuế."));
  }
  const body = await res.json();
  return body.data || body;
}

export async function fetchInnovationRating(taxCode: string): Promise<InnovationEvaluation> {
  const session = getStoredSession();
  const headers: HeadersInit = {};
  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  const res = await fetch(`${API_BASE}/api/v1/enterprises/${encodeURIComponent(taxCode)}/innovation-rating`, { headers });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Không thể tải kết quả đánh giá năng lực doanh nghiệp."));
  }
  const body = await res.json();
  return body.data || body;
}

export const getInnovationRating = fetchInnovationRating;

export async function activateEnterpriseCapability(capability: string): Promise<any> {
  const session = getStoredSession();
  if (!session?.accessToken) throw new Error("Chưa đăng nhập.");

  const res = await fetch(`${API_BASE}/api/v1/portal/enterprise/capabilities/activate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ capability })
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Kích hoạt năng lực thất bại."));
  }
  const body = await res.json();
  invalidateMyEnterpriseProfileCache();
  return body.data || body;
}

export async function switchEnterpriseActiveRole(targetRole: string): Promise<any> {
  const session = getStoredSession();
  if (!session?.accessToken) throw new Error("Chưa đăng nhập.");

  const res = await fetch(`${API_BASE}/api/v1/portal/enterprise/capabilities/switch-role`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ targetRole })
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Chuyển vai trò thất bại."));
  }
  const body = await res.json();
  invalidateMyEnterpriseProfileCache();
  return body.data || body;
}
