import {
  TechnologyOffer,
  CreateSellerOfferPayload,
  SellerKpi,
  SectorItem,
} from "@/types/technology-offer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080";

// Danh mục 10 Lĩnh vực công nghệ trọng điểm chuẩn hóa theo Thông tư 17/2019/TT-BKHCN
export const SECTORS_18_CATALOG: SectorItem[] = [
  { code: "ALL", name: "Tất cả 10 lĩnh vực", count: 0 },
  { code: "LV01", name: "Nông nghiệp & Chế biến nông sản", count: 0 },
  { code: "LV05", name: "Y tế & Dược phẩm", count: 0 },
  { code: "LV07", name: "Cơ khí, Chế tạo máy & Tự động hóa", count: 0 },
  { code: "LV08", name: "Điện tử, Viễn thông & CNTT", count: 0 },
  { code: "LV11", name: "Năng lượng mới & Tái tạo", count: 0 },
  { code: "LV12", name: "Vật liệu mới & Nanotech", count: 0 },
  { code: "LV14", name: "Hóa chất & Công nghệ sinh học", count: 0 },
  { code: "LV15", name: "Môi trường & Xử lý rác thải", count: 0 },
  { code: "LV16", name: "Xây dựng & Giao thông", count: 0 },
  { code: "LV17", name: "Dịch vụ KH&CN & Khác", count: 0 },
];

export async function fetchPublicOffers(params?: {
  search?: string;
  sectorCode?: string;
  offerType?: string;
  hasTechTransfer?: boolean;
  minTrl?: number;
  ipStatus?: string;
}): Promise<{ total: number; data: TechnologyOffer[] }> {
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
      return { total, data: items };
    }
  } catch (err) {
    console.error("Lỗi khi tải danh sách công nghệ:", err);
  }

  return { total: 0, data: [] };
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

export async function fetchSellerWorkspace(): Promise<{
  kpi: SellerKpi;
  data: TechnologyOffer[];
}> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/portal/seller/technologies`, {
      cache: "no-store",
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
          successfulConnections: items.reduce(
            (acc: number, cur: TechnologyOffer) => acc + (cur.successfulConnections || 0),
            0
          ),
        };
        return { kpi, data: items };
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
      successfulConnections: 0,
    },
    data: [],
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
      return { success: true, data: json.data };
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

export const PROVINCIAL_AUTHORITIES_CATALOG = [
  { id: "VN-HN", name: "Sở Khoa học và Công nghệ TP. Hà Nội" },
  { id: "VN-SG", name: "Sở Khoa học và Công nghệ TP. Hồ Chí Minh" },
  { id: "VN-DN", name: "Sở Khoa học và Công nghệ TP. Đà Nẵng" },
  { id: "VN-HP", name: "Sở Khoa học và Công nghệ TP. Hải Phòng" },
  { id: "VN-CT", name: "Sở Khoa học và Công nghệ TP. Cần Thơ" },
  { id: "VN-BD", name: "Sở Khoa học và Công nghệ tỉnh Bình Dương" },
  { id: "VN-DNA", name: "Sở Khoa học và Công nghệ tỉnh Đồng Nai" },
  { id: "VN-BN", name: "Sở Khoa học và Công nghệ tỉnh Bắc Ninh" },
  { id: "VN-QN", name: "Sở Khoa học và Công nghệ tỉnh Quảng Ninh" },
  { id: "VN-KH", name: "Sở Khoa học và Công nghệ tỉnh Khánh Hòa" },
  { id: "VN-LD", name: "Sở Khoa học và Công nghệ tỉnh Lâm Đồng" },
  { id: "VN-TG", name: "Sở Khoa học và Công nghệ tỉnh Tiền Giang" },
  { id: "VN-34", name: "Các Sở KH&CN khác thuộc 34 tỉnh thành trọng điểm..." },
];

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
