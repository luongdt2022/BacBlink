import {
  TechnologyOffer,
  CreateSellerOfferPayload,
  SellerKpi,
  SectorItem,
} from "@/types/technology-offer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080";

// Dữ liệu mẫu 18 ngành theo Thông tư 17/2019/TT-BKHCN
export const SECTORS_18_CATALOG: SectorItem[] = [
  { code: "ALL", name: "Tất cả 18 ngành", count: 128 },
  { code: "FOOD", name: "Công nghệ chế biến nông sản - thực phẩm", count: 24 },
  { code: "MECH", name: "Cơ khí chế tạo & Tự động hóa", count: 19 },
  { code: "IT", name: "Công nghệ thông tin, Viễn thông & IoT", count: 32 },
  { code: "ENV", name: "Công nghệ môi trường & Kinh tế tuần hoàn", count: 15 },
  { code: "BIO", name: "Công nghệ sinh học & Dược liệu", count: 11 },
  { code: "ENERGY", name: "Năng lượng mới & Năng lượng tái tạo", count: 9 },
  { code: "CHEM", name: "Hóa chất, Phân bón & Vật liệu mới", count: 8 },
  { code: "HEALTH", name: "Y tế, Dược phẩm & Thiết bị y tế", count: 10 },
];

export const MOCK_OFFERS_DATABASE: TechnologyOffer[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    offerCode: "OFF-20261008-00001",
    offerType: "SOLUTION",
    hasTechTransfer: true,
    title: "Hệ thống sấy thăng hoa chân không tích hợp AI tối ưu năng lượng",
    summary:
      "Công nghệ sấy nhiệt độ thấp bảo toàn 98% hoạt tính sinh học của nông sản và dược liệu xuất khẩu.",
    problemSolved:
      "Giảm 42% tiêu hao điện năng và rút ngắn 30% thời gian sấy so với công nghệ truyền thống.",
    sectorCode: "FOOD",
    sectorName: "Công nghệ chế biến nông sản - thực phẩm",
    pricingType: "RANGE",
    priceAmount: null,
    priceMin: 850000000,
    priceMax: 1200000000,
    currency: "VND",
    unit: "dây chuyền",
    developerOrigin: "Viện Cơ điện Nông nghiệp và Công nghệ sau thu hoạch (VIAEP)",
    trlLevel: 8,
    ipStatus: "PATENT_GRANTED",
    ipRegistrationNumber: "VN-1-0028491",
    transferMethod: "EXCLUSIVE_LICENSE",
    commercialStatus: "COMMERCIALLY_READY",
    contactPointRole: "Phòng Sở hữu Trí tuệ & Chuyển giao Công nghệ",
    status: "APPROVED",
    successfulConnections: 12,
    ratingScore: 4.85,
    reviewCount: 15,
    createdAt: "2026-09-19T08:10:21.647Z",
    publishedAt: "2026-09-21T08:10:21.647Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    offerCode: "OFF-20261008-00002",
    offerType: "DEVICE",
    hasTechTransfer: true,
    title: "Robot hàn laser 6 trục siêu chính xác cho công nghiệp ô tô & đóng tàu",
    summary:
      "Thiết bị robot công nghiệp độ chính xác 0.02mm, tích hợp thị giác máy tính và cảm biến bù nhiệt tự động.",
    problemSolved:
      "Thay thế thợ hàn bậc cao trong môi trường độc hại, tốc độ hàn tăng 3.5 lần.",
    sectorCode: "MECH",
    sectorName: "Cơ khí chế tạo & Tự động hóa",
    pricingType: "FIXED",
    priceAmount: 2400000000,
    priceMin: null,
    priceMax: null,
    currency: "VND",
    unit: "hệ thống",
    developerOrigin: "Đại học Bách Khoa Hà Nội - Phòng Lab Robotics Quốc Gia",
    trlLevel: 7,
    ipStatus: "UTILITY_MODEL",
    ipRegistrationNumber: "VN-2-0005124",
    transferMethod: "NON_EXCLUSIVE_LICENSE",
    commercialStatus: "PILOT_TESTING",
    contactPointRole: "Trung tâm Đổi mới Sáng tạo Bách Khoa",
    status: "APPROVED",
    successfulConnections: 8,
    ratingScore: 4.9,
    reviewCount: 9,
    createdAt: "2026-09-24T08:10:21.647Z",
    publishedAt: "2026-09-25T08:10:21.647Z",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    offerCode: "OFF-20261008-00003",
    offerType: "PRODUCT",
    hasTechTransfer: false,
    title: "Bộ điều khiển IoT Gateway công nghiệp chuẩn RS485/Modbus RTU",
    summary:
      "Gateway công nghiệp giám sát năng lượng và tự động hóa nhà máy chuẩn DIN-rail, truyền thông 4G/LTE.",
    problemSolved:
      "Thu thập dữ liệu cảm biến đa điểm, chống nhiễu công nghiệp cấp độ 4.",
    sectorCode: "IT",
    sectorName: "Công nghệ thông tin, Viễn thông & IoT",
    pricingType: "FIXED",
    priceAmount: 4500000,
    priceMin: null,
    priceMax: null,
    currency: "VND",
    unit: "bộ",
    developerOrigin: null,
    trlLevel: null,
    ipStatus: null,
    ipRegistrationNumber: null,
    transferMethod: null,
    commercialStatus: null,
    contactPointRole: null,
    status: "APPROVED",
    successfulConnections: 45,
    ratingScore: 4.7,
    reviewCount: 38,
    createdAt: "2026-09-29T08:10:21.647Z",
    publishedAt: "2026-09-30T08:10:21.647Z",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    offerCode: "OFF-20261008-00004",
    offerType: "SOLUTION",
    hasTechTransfer: true,
    title: "Chế phẩm sinh học xử lý nước thải dệt nhuộm và phân hủy hợp chất azo",
    summary:
      "Quần thể vi sinh vật bản địa thích nghi nồng độ muối cao, hiệu suất khử màu đạt trên 95%.",
    problemSolved:
      "Giảm 60% bùn thải nguy hại và chi phí hóa chất keo tụ PAC/Polymer.",
    sectorCode: "ENV",
    sectorName: "Công nghệ môi trường & Kinh tế tuần hoàn",
    pricingType: "CONTACT",
    priceAmount: null,
    priceMin: null,
    priceMax: null,
    currency: "VND",
    unit: "quy trình",
    developerOrigin: "Viện Hàn lâm Khoa học và Công nghệ Việt Nam (VAST)",
    trlLevel: 9,
    ipStatus: "PATENT_GRANTED",
    ipRegistrationNumber: "VN-1-0019283",
    transferMethod: "ASSIGNMENT_SALE",
    commercialStatus: "COMMERCIALLY_READY",
    contactPointRole: "Ban Quản lý Ứng dụng & Triển khai Công nghệ",
    status: "APPROVED",
    successfulConnections: 19,
    ratingScore: 5.0,
    reviewCount: 22,
    createdAt: "2026-10-04T08:10:21.647Z",
    publishedAt: "2026-10-05T08:10:21.647Z",
  },
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
      if (json.data && Array.isArray(json.data)) {
        return { total: json.total || json.data.length, data: json.data };
      }
    }
  } catch (err) {
    console.warn("Backend API not reachable, falling back to local dataset", err);
  }

  // Fallback client-side filter
  let result = [...MOCK_OFFERS_DATABASE];
  if (params?.search) {
    const s = params.search.toLowerCase();
    result = result.filter(
      (x) =>
        x.title.toLowerCase().includes(s) ||
        x.summary.toLowerCase().includes(s) ||
        (x.developerOrigin && x.developerOrigin.toLowerCase().includes(s))
    );
  }
  if (params?.sectorCode && params.sectorCode !== "ALL") {
    result = result.filter((x) => x.sectorCode === params.sectorCode);
  }
  if (params?.offerType && params.offerType !== "ALL") {
    result = result.filter((x) => x.offerType === params.offerType);
  }
  if (params?.hasTechTransfer !== undefined) {
    result = result.filter((x) => x.hasTechTransfer === params.hasTechTransfer);
  }
  if (params?.minTrl) {
    result = result.filter((x) => (x.trlLevel || 0) >= params.minTrl!);
  }
  if (params?.ipStatus && params.ipStatus !== "ALL") {
    result = result.filter((x) => x.ipStatus === params.ipStatus);
  }

  return { total: result.length, data: result };
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
    console.warn("API error fetching detail, checking local dataset", err);
  }

  return MOCK_OFFERS_DATABASE.find((x) => x.id === id) || null;
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
      if (json.data && json.kpi) {
        return { kpi: json.kpi, data: json.data };
      }
    }
  } catch (err) {
    console.warn("API error fetching seller workspace, fallback", err);
  }

  return {
    kpi: {
      totalOffers: MOCK_OFFERS_DATABASE.length,
      publishedOffers: MOCK_OFFERS_DATABASE.filter((x) => x.status === "APPROVED").length,
      pendingOffers: 0,
      successfulConnections: MOCK_OFFERS_DATABASE.reduce(
        (acc, cur) => acc + cur.successfulConnections,
        0
      ),
    },
    data: MOCK_OFFERS_DATABASE,
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
    // Local creation fallback
    const newOffer: TechnologyOffer = {
      id: "local-" + Date.now(),
      offerCode: `OFF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
        Math.random() * 90000 + 10000
      )}`,
      offerType: payload.offerType,
      hasTechTransfer: payload.hasTechTransfer,
      title: payload.title,
      summary: payload.summary,
      problemSolved: payload.problemSolved,
      sectorCode: payload.sectorCode,
      sectorName:
        SECTORS_18_CATALOG.find((s) => s.code === payload.sectorCode)?.name ||
        "Lĩnh vực công nghệ tổng hợp",
      pricingType: payload.pricingType,
      priceAmount: payload.priceAmount,
      priceMin: payload.priceMin,
      priceMax: payload.priceMax,
      currency: payload.currency || "VND",
      unit: payload.unit,
      developerOrigin: payload.developerOrigin,
      trlLevel: payload.trlLevel,
      ipStatus: payload.ipStatus,
      ipRegistrationNumber: payload.ipRegistrationNumber,
      transferMethod: payload.transferMethod,
      commercialStatus: payload.commercialStatus,
      contactPointRole: payload.contactPointRole,
      status: "APPROVED",
      successfulConnections: 0,
      ratingScore: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };
    MOCK_OFFERS_DATABASE.unshift(newOffer);
    return { success: true, data: newOffer };
  }
}
