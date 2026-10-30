import {
  TechnologyOffer,
  CreateSellerOfferPayload,
  SellerKpi,
  SectorItem,
  TechTransferDraftDto,
  TT17_SECTORS,
  IntellectualPropertyStatus,
} from "@/types/technology-offer";
import { authClient } from "@/lib/auth-client";

export type { IntellectualPropertyStatus };

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "" : "http://localhost:5080");

// Danh mục 18 Lĩnh vực công nghệ TT17 chuẩn hóa đồng bộ
export const SECTORS_18_CATALOG: SectorItem[] = [
  { code: "ALL", name: "Tất cả lĩnh vực", count: 0 },
  ...TT17_SECTORS.map((s) => ({
    code: s.code,
    name: s.name,
    count: 0,
  })),
];

export async function fetchPublicOffers(params?: {
  search?: string;
  sectorCode?: string;
  offerType?: string;
  hasTechTransfer?: boolean;
  minTrl?: number;
  ipStatus?: string;
  enterpriseTaxCode?: string;
  rotate?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
}): Promise<{ total: number; data: TechnologyOffer[]; page?: number; limit?: number; totalPages?: number }> {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.sectorCode && params.sectorCode !== "ALL")
      query.set("sectorCode", params.sectorCode);
    if (params?.offerType && params.offerType !== "ALL")
      query.set("offerType", params.offerType);
    if (params?.hasTechTransfer !== undefined)
      query.set("hasTechTransfer", String(params.hasTechTransfer));
    if (params?.minTrl) query.set("minTrl", String(params.minTrl));
    if (params?.ipStatus && params.ipStatus !== "ALL")
      query.set("ipStatus", params.ipStatus);
    if (params?.enterpriseTaxCode)
      query.set("enterpriseTaxCode", params.enterpriseTaxCode);
    if (params?.rotate !== undefined)
      query.set("rotate", String(params.rotate));
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const res = await fetch(`${API_BASE}/api/v1/technologies?${query.toString()}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      const items: TechnologyOffer[] = Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.data?.items)
        ? json.data.items
        : [];
      const total = json.total ?? json.data?.total ?? items.length;
      const page = json.page ?? params?.page ?? 1;
      const limit = json.limit ?? params?.limit ?? 12;
      const totalPages = json.totalPages ?? (Math.ceil(total / limit) || 1);
      return { total, data: items, page, limit, totalPages };
    }
  } catch (err) {
    console.error("Lỗi khi tải danh sách công nghệ:", err);
  }

  return { total: 0, data: [], page: 1, limit: 12, totalPages: 1 };
}

export async function fetchOfferById(id: string): Promise<TechnologyOffer | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/technologies/${id}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (err) {
    console.error("Lỗi khi tải chi tiết công nghệ:", err);
  }

  return null;
}

export async function fetchSellerWorkspace(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  trl?: string;
  enterpriseTaxCode?: string;
}): Promise<{
  kpi: SellerKpi;
  data: TechnologyOffer[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.status && params.status !== "ALL") query.set("status", params.status);
    if (params?.trl && params.trl !== "ALL") query.set("trl", params.trl);
    if (params?.enterpriseTaxCode) query.set("enterpriseTaxCode", params.enterpriseTaxCode);

    const queryString = query.toString();
    const url = `${API_BASE}/api/v1/portal/seller/technologies${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: authClient.getAuthHeaders(),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        const items: TechnologyOffer[] = Array.isArray(json.data)
          ? json.data
          : json.data.items || [];
        const kpi: SellerKpi = json.kpi || {
          totalOffers: items.length,
          publishedOffers: items.filter((x: TechnologyOffer) => x.status === "APPROVED").length,
          pendingOffers: items.filter((x: TechnologyOffer) => x.status === "PENDING").length,
          draftOffers: items.filter((x: TechnologyOffer) => x.status === "DRAFT").length,
          successfulConnections: items.reduce(
            (acc: number, cur: TechnologyOffer) => acc + (cur.successfulConnections || 0),
            0
          ),
        };
        return {
          kpi,
          data: items,
          total: json.total ?? items.length,
          page: json.page ?? params?.page ?? 1,
          limit: json.limit ?? params?.limit ?? 10,
          totalPages: json.totalPages ?? 1,
        };
      }
    }
  } catch (err) {
    console.error("Lỗi khi tải không gian nhà cung ứng:", err);
  }

  return {
    kpi: {
      totalOffers: 0,
      publishedOffers: 0,
      pendingOffers: 0,
      draftOffers: 0,
      successfulConnections: 0,
    },
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };
}

export async function createSellerOffer(
  payload: CreateSellerOfferPayload
): Promise<{ success: boolean; data?: TechnologyOffer; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/portal/seller/technologies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      return { success: true, data: json.data, message: json.message };
    }
    const errJson = await res.json().catch(() => null);
    return {
      success: false,
      message: errJson?.message || "Đăng tin không thành công.",
    };
  } catch (err: any) {
    console.error("Lỗi khi tạo hồ sơ chào bán:", err);
    return {
      success: false,
      message: err?.message || "Không thể kết nối máy chủ để tạo hồ sơ.",
    };
  }
}

export interface ProvincialAuthority {
  id: string;
  name: string;
  scopeType: "Sở Tỉnh";
}

export const PROVINCIAL_AUTHORITIES_CATALOG: ProvincialAuthority[] = [
  // Tỉnh trọng điểm ĐMST & Vùng Đông Bắc (Ưu tiên Case Thái Nguyên - Chè Thịnh An)
  { id: "VN-TN", name: "Sở Khoa học và Công nghệ tỉnh Thái Nguyên", scopeType: "Sở Tỉnh" },
  { id: "VN-HN", name: "Sở Khoa học và Công nghệ TP. Hà Nội", scopeType: "Sở Tỉnh" },
  { id: "VN-SG", name: "Sở Khoa học và Công nghệ TP. Hồ Chí Minh", scopeType: "Sở Tỉnh" },
  { id: "VN-DN", name: "Sở Khoa học và Công nghệ TP. Đà Nẵng", scopeType: "Sở Tỉnh" },
  { id: "VN-HP", name: "Sở Khoa học và Công nghệ TP. Hải Phòng", scopeType: "Sở Tỉnh" },
  { id: "VN-CT", name: "Sở Khoa học và Công nghệ TP. Cần Thơ", scopeType: "Sở Tỉnh" },

  // Vùng Đồng bằng sông Hồng & Lân cận Hà Nội
  { id: "VN-BN", name: "Sở Khoa học và Công nghệ tỉnh Bắc Ninh", scopeType: "Sở Tỉnh" },
  { id: "VN-BG", name: "Sở Khoa học và Công nghệ tỉnh Bắc Giang", scopeType: "Sở Tỉnh" },
  { id: "VN-VP", name: "Sở Khoa học và Công nghệ tỉnh Vĩnh Phúc", scopeType: "Sở Tỉnh" },
  { id: "VN-QN", name: "Sở Khoa học và Công nghệ tỉnh Quảng Ninh", scopeType: "Sở Tỉnh" },
  { id: "VN-HD", name: "Sở Khoa học và Công nghệ tỉnh Hải Dương", scopeType: "Sở Tỉnh" },
  { id: "VN-HY", name: "Sở Khoa học và Công nghệ tỉnh Hưng Yên", scopeType: "Sở Tỉnh" },
  { id: "VN-ND", name: "Sở Khoa học và Công nghệ tỉnh Nam Định", scopeType: "Sở Tỉnh" },
  { id: "VN-TB", name: "Sở Khoa học và Công nghệ tỉnh Thái Bình", scopeType: "Sở Tỉnh" },
  { id: "VN-NB", name: "Sở Khoa học và Công nghệ tỉnh Ninh Bình", scopeType: "Sở Tỉnh" },
  { id: "VN-PT", name: "Sở Khoa học và Công nghệ tỉnh Phú Thọ", scopeType: "Sở Tỉnh" },

  // Vùng Đông Nam Bộ & Nam Bộ
  { id: "VN-BD", name: "Sở Khoa học và Công nghệ tỉnh Bình Dương", scopeType: "Sở Tỉnh" },
  { id: "VN-DNA", name: "Sở Khoa học và Công nghệ tỉnh Đồng Nai", scopeType: "Sở Tỉnh" },
  { id: "VN-BRVT", name: "Sở Khoa học và Công nghệ tỉnh Bà Rịa - Vũng Tàu", scopeType: "Sở Tỉnh" },
  { id: "VN-LA", name: "Sở Khoa học và Công nghệ tỉnh Long An", scopeType: "Sở Tỉnh" },
  { id: "VN-TG", name: "Sở Khoa học và Công nghệ tỉnh Tiền Giang", scopeType: "Sở Tỉnh" },

  // Vùng Miền Trung & Tây Nguyên
  { id: "VN-TTH", name: "Sở Khoa học và Công nghệ tỉnh Thừa Thiên Huế", scopeType: "Sở Tỉnh" },
  { id: "VN-QNA", name: "Sở Khoa học và Công nghệ tỉnh Quảng Nam", scopeType: "Sở Tỉnh" },
  { id: "VN-KH", name: "Sở Khoa học và Công nghệ tỉnh Khánh Hòa", scopeType: "Sở Tỉnh" },
  { id: "VN-LD", name: "Sở Khoa học và Công nghệ tỉnh Lâm Đồng", scopeType: "Sở Tỉnh" },
  { id: "VN-NA", name: "Sở Khoa học và Công nghệ tỉnh Nghệ An", scopeType: "Sở Tỉnh" },
  { id: "VN-TH", name: "Sở Khoa học và Công nghệ tỉnh Thanh Hóa", scopeType: "Sở Tỉnh" },

  // Danh mục đại diện các tỉnh thành khác
  { id: "VN-34", name: "Các Sở KH&CN khác thuộc 34 tỉnh thành trọng điểm...", scopeType: "Sở Tỉnh" },
];

export interface AuthorityResolutionContext {
  userScopeId?: string | null;
  profileProvince?: string | null;
  profileAddress?: string | null;
}

export interface ResolvedAuthority {
  id: string;
  name: string;
  isAutoDetected: boolean;
  detectedFrom?: "user_scope" | "profile_province" | "profile_address" | "fallback";
}

/**
 * Chuẩn hóa chuỗi tiếng Việt (loại bỏ dấu và chuyển chữ thường)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .trim();
}

/**
 * Trích xuất từ khóa tên tỉnh/thành từ tên cơ quan Sở KH&CN
 * VD: "Sở Khoa học và Công nghệ tỉnh Thái Nguyên" -> "Thái Nguyên"
 */
function extractProvinceName(authorityName: string): string {
  return authorityName
    .replace(/^Sở Khoa học và Công nghệ\s+(tỉnh|TP\.|thành phố)\s+/i, "")
    .trim();
}

/**
 * Phân giải Cơ quan Quản lý Sở KH&CN tiếp nhận theo thứ tự 3 cấp ưu tiên (BR-DELTA-04-01)
 * Hỗ trợ nhận context dạng AuthorityResolutionContext object hoặc (userContext, profileContext)
 */
export function resolveDefaultAuthority(
  userOrContext?: any,
  profile?: any
): ResolvedAuthority {
  const fallbackResult: ResolvedAuthority = {
    id: "VN-HN",
    name: "Sở Khoa học và Công nghệ TP. Hà Nội",
    isAutoDetected: false,
    detectedFrom: "fallback",
  };

  if (!userOrContext && !profile) {
    return fallbackResult;
  }

  // Chuẩn hóa input parameters
  let userScopeId: string | null | undefined = undefined;
  let profileProvince: string | null | undefined = undefined;
  let profileAddress: string | null | undefined = undefined;

  if (userOrContext && ("userScopeId" in userOrContext || "profileProvince" in userOrContext || "profileAddress" in userOrContext)) {
    // Gọi dạng object: resolveDefaultAuthority({ userScopeId, profileProvince, profileAddress })
    userScopeId = userOrContext.userScopeId;
    profileProvince = userOrContext.profileProvince;
    profileAddress = userOrContext.profileAddress;
  } else {
    // Gọi dạng 2 tham số: resolveDefaultAuthority(user, profile)
    userScopeId = userOrContext?.scopeId || profile?.scopeId;
    profileProvince = profile?.province || profile?.provinceCity;
    profileAddress = profile?.address || profile?.addressDetail;
  }

  // Cấp 1: Kiểm tra scopeId (khớp mã Sở, ví dụ: "VN-TN", "TN", "Thái Nguyên", "VN-HN", "HN", "Hà Nội", "SG", "HCM"...)
  if (userScopeId && userScopeId !== "ALL" && userScopeId !== "GLOBAL") {
    const rawScope = userScopeId.trim();
    const normScope = normalizeText(rawScope);

    // So khớp trực tiếp id (VD: VN-TN)
    const directMatch = PROVINCIAL_AUTHORITIES_CATALOG.find(
      (a) => a.id.toLowerCase() === rawScope.toLowerCase()
    );
    if (directMatch) {
      return { id: directMatch.id, name: directMatch.name, isAutoDetected: true, detectedFrom: "user_scope" };
    }

    // So khớp mã rút gọn không có "VN-" (VD: TN -> VN-TN)
    const shortCodeMatch = PROVINCIAL_AUTHORITIES_CATALOG.find(
      (a) => a.id.replace(/^VN-/, "").toLowerCase() === rawScope.toLowerCase()
    );
    if (shortCodeMatch) {
      return { id: shortCodeMatch.id, name: shortCodeMatch.name, isAutoDetected: true, detectedFrom: "user_scope" };
    }

    // So khớp alias phổ biến (VD: HCM, SG -> VN-SG; DN -> VN-DN)
    if (normScope === "hcm" || normScope === "tp hcm" || normScope === "sai gon") {
      const sg = PROVINCIAL_AUTHORITIES_CATALOG.find((a) => a.id === "VN-SG");
      if (sg) return { id: sg.id, name: sg.name, isAutoDetected: true, detectedFrom: "user_scope" };
    }

    // So khớp tên tỉnh trong tên Sở
    const nameMatch = PROVINCIAL_AUTHORITIES_CATALOG.find((a) => {
      const pName = extractProvinceName(a.name);
      return normalizeText(pName) === normScope || normalizeText(a.name).includes(normScope);
    });
    if (nameMatch) {
      return { id: nameMatch.id, name: nameMatch.name, isAutoDetected: true, detectedFrom: "user_scope" };
    }
  }

  // Cấp 2: Kiểm tra profileProvince từ hồ sơ doanh nghiệp
  if (profileProvince) {
    const normProvince = normalizeText(profileProvince);
    const match = PROVINCIAL_AUTHORITIES_CATALOG.find((a) => {
      const pName = extractProvinceName(a.name);
      const normPName = normalizeText(pName);
      return (
        normProvince.includes(normPName) ||
        normPName.includes(normProvince) ||
        normalizeText(a.name).includes(normProvince)
      );
    });
    if (match) {
      return { id: match.id, name: match.name, isAutoDetected: true, detectedFrom: "profile_province" };
    }
  }

  // Cấp 3: Trích xuất từ profileAddress (tìm kiếm tên tỉnh/thành phố trong chuỗi địa chỉ)
  if (profileAddress) {
    const normAddress = normalizeText(profileAddress);
    for (const auth of PROVINCIAL_AUTHORITIES_CATALOG) {
      if (auth.id === "VN-34") continue;
      const provinceKeyword = extractProvinceName(auth.name);
      const normKeyword = normalizeText(provinceKeyword);
      if (normKeyword && normAddress.includes(normKeyword)) {
        return { id: auth.id, name: auth.name, isAutoDetected: true, detectedFrom: "profile_address" };
      }
    }
  }

  // Fallback mặc định Hà Nội
  return fallbackResult;
}

export async function reviewOffer(
  id: string,
  action: "APPROVE" | "REJECT" | "REQUEST_CHANGES",
  reviewNote?: string
): Promise<{ success: boolean; message?: string; data?: TechnologyOffer }> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/portal/seller/technologies/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reviewNote }),
    });
    if (res.ok) {
      const json = await res.json();
      return { success: true, data: json.data };
    }
    const errJson = await res.json().catch(() => null);
    return { success: false, message: errJson?.message || "Không thể xử lý yêu cầu." };
  } catch (err: any) {
    return { success: false, message: err?.message || "Lỗi kết nối máy chủ." };
  }
}

export async function updateSellerOffer(
  id: string,
  payload: Partial<CreateSellerOfferPayload>
): Promise<{ success: boolean; data?: TechnologyOffer; message?: string; needsReaudit?: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/v2/portal/seller/technologies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      return { success: true, data: json.data, message: json.message, needsReaudit: json.needsReaudit };
    }
    const errJson = await res.json().catch(() => null);
    return {
      success: false,
      message: errJson?.message || "Cập nhật hồ sơ không thành công.",
    };
  } catch (err: any) {
    return { success: false, message: err?.message || "Lỗi kết nối máy chủ khi cập nhật." };
  }
}

export async function deleteSellerOffer(
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/v2/portal/seller/technologies/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const json = await res.json();
      return { success: true, message: json.message };
    }
    const errJson = await res.json().catch(() => null);
    return { success: false, message: errJson?.message || "Xóa không thành công." };
  } catch (err: any) {
    return { success: false, message: err?.message || "Lỗi kết nối máy chủ." };
  }
}

export async function togglePublishOffer(
  id: string,
  publish?: boolean
): Promise<{ success: boolean; message?: string; data?: TechnologyOffer }> {
  try {
    const query = publish !== undefined ? `?publish=${publish}` : "";
    const res = await fetch(`${API_BASE}/api/v2/portal/seller/technologies/${id}/toggle-publish${query}`, {
      method: "POST",
    });
    if (res.ok) {
      const json = await res.json();
      return { success: true, message: json.message, data: json.data };
    }
    const errJson = await res.json().catch(() => null);
    return { success: false, message: errJson?.message || "Thao tác không thành công." };
  } catch (err: any) {
    return { success: false, message: err?.message || "Lỗi kết nối máy chủ." };
  }
}

export async function extractPatentSpecs(file: File): Promise<TechTransferDraftDto> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/v1/ai/extract-patent-specs`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Lỗi AI trích xuất (Status ${res.status})`);
  }

  return await res.json();
}

export interface CreateQuickDemandPayload {
  stageName?: string;
  technicalProblem: string;
  desiredSolution?: string;
  needConsulting: boolean;
  expectedGoal: string;
  applicationScale?: string;
  sectorCode?: string;
  techGroupCode?: string;
  demandTypeCode?: string;
  budgetRange?: string;
  urgencyScore: number;
  impactScore: number;
  investmentCapacity: number;
  adoptionReadiness: number;
  offerId?: string;
  offerTitle?: string;
  offerCode?: string;
  isCommercialOrder?: boolean;
}

export async function submitQuickDemand(payload: CreateQuickDemandPayload): Promise<{
  success: boolean;
  itemId?: string;
  itemCode?: string;
  message?: string;
}> {
  try {
    const token = authClient.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/v1/demands/items`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      return {
        success: true,
        itemId: json.itemId,
        itemCode: json.itemCode,
        message: json.message || "Đăng bài toán nhu cầu công nghệ thành công.",
      };
    }
    const errJson = await res.json().catch(() => null);
    return {
      success: false,
      message: errJson?.message || "Không thể tạo nhu cầu kết nối.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Lỗi kết nối khi gửi nhu cầu.",
    };
  }
}
