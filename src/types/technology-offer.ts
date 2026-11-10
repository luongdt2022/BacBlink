export type OfferType =
  | "PRODUCT"
  | "DEVICE"
  | "SOLUTION"
  | "SOFTWARE"
  | "EQUIPMENT"
  | "PROCESS";

export type IntellectualPropertyStatus =
  | "PATENT_GRANTED"
  | "UTILITY_MODEL"
  | "TRADE_SECRET"
  | "PATENT_PENDING"
  | "PATENT_APPLICATION"
  | "SOFTWARE_COPYRIGHT"
  | "COPYRIGHT_REGISTERED"
  | "NONE";

export type TransferMethod =
  | "EXCLUSIVE_LICENSE"
  | "NON_EXCLUSIVE_LICENSE"
  | "ASSIGNMENT_SALE"
  | "JOINT_RD"
  | "CAPITAL_CONTRIBUTION";

export type CommercializationStatus =
  | "LAB_PROTOTYPE"
  | "PILOT_TESTING"
  | "COMMERCIALLY_READY"
  | "SEEKING_MANUFACTURER";

export type PricingType = "FIXED" | "RANGE" | "CONTACT";

export type OfferDocumentType =
  | "CATALOGUE"
  | "PATENT_CERT"
  | "TRL_EVIDENCE"
  | "VIDEO"
  | "OTHER";

export type AccessScope = "PUBLIC" | "AFTER_CONNECTION" | "ADMIN_ONLY";

export interface OfferSpecValue {
  id?: string;
  specCode?: string | null;
  specName: string;
  specValue: string;
  unit?: string | null;
  specCategory?: "TIER_2_COMMON" | "TIER_3_SECTOR" | "TIER_3_CUSTOM";
}

export interface OfferDocument {
  id?: string;
  documentType: OfferDocumentType;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  accessScope: AccessScope;
}

export interface TechnologyOffer {
  id: string;
  offerCode: string;
  offerType: OfferType;
  hasTechTransfer: boolean;
  title: string;
  summary: string;
  problemSolved: string;
  sectorCode: string;
  sectorName: string;
  pricingType: PricingType;
  priceAmount?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  currency: string;
  unit?: string | null;
  developerOrigin?: string | null;
  trlLevel?: number | null;
  ipStatus?: IntellectualPropertyStatus | null;
  ipRegistrationNumber?: string | null;
  transferMethod?: TransferMethod | null;
  commercialStatus?: CommercializationStatus | null;
  contactPointRole?: string | null;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CHANGES_REQUESTED" | "HIDDEN";
  successfulConnections: number;
  ratingScore: number;
  reviewCount: number;
  createdAt: string;
  publishedAt?: string | null;
  managingAuthorityId?: string | null;
  managingAuthorityName?: string | null;
  scopeType?: string | null;
  scopeId?: string | null;
  legalConsent?: boolean;
  enterpriseTaxCode?: string | null;
  enterpriseName?: string | null;
  // Delta v5 extensions
  mainImageUrl?: string | null;
  galleryImageUrls?: string[] | null;
  videoDemoUrl?: string | null;
  deliveryTimeline?: string | null;
  warrantyTerms?: string | null;
  supplyScope?: string | null;
  paymentTerms?: string | null;
  installationSupport?: boolean;
  specValues?: OfferSpecValue[] | null;
  documents?: OfferDocument[] | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  // Delta v6 extensions
  modelCode?: string | null;
  manufacturer?: string | null;
  originCountry?: string | null;
  equipmentStatus?: string | null;
  manufacturingYear?: number | null;
  capacityScale?: string | null;
  energyConsumption?: string | null;
  automationLevel?: string | null;
  operatingPrinciple?: string | null;
  // Two-Tier Verification extensions (CR-2026-TRL-TNI-VERIFY)
  trlVerificationStatus?: string | null;
  ipVerificationStatus?: string | null;
  verifiedAuthorityName?: string | null;
  trlVerifiedBy?: string | null;
  trlVerifiedAt?: string | null;
  trlReviewNote?: string | null;
  deploymentConditions?: string | null;
  transferPriorityMethod?: string | null;
  priceIncludes?: string | null;
  taxAndExtraCosts?: string | null;
  technicalSupportMethod?: string | null;
  ipIssueDate?: string | null;
  legalCommitmentConfirmed?: boolean;
}

export interface CreateSellerOfferPayload {
  offerType: OfferType;
  hasTechTransfer: boolean;
  title: string;
  summary: string;
  shortDescription?: string;
  problemSolved: string;
  sectorCode: string;
  pricingType: PricingType;
  priceAmount?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  currency: string;
  unit?: string | null;
  developerOrigin?: string | null;
  trlLevel?: number | null;
  ipStatus?: IntellectualPropertyStatus | null;
  ipRegistrationNumber?: string | null;
  transferMethod?: TransferMethod | null;
  commercialStatus?: CommercializationStatus | null;
  contactPointRole?: string | null;
  managingAuthorityId?: string;
  managingAuthorityName?: string;
  scopeType?: string;
  scopeId?: string;
  legalConsent?: boolean;
  enterpriseTaxCode?: string;
  enterpriseName?: string;
  // Delta v5 extensions
  mainImageUrl?: string | null;
  galleryImageUrls?: string[] | null;
  videoDemoUrl?: string | null;
  deliveryTimeline?: string | null;
  warrantyTerms?: string | null;
  supplyScope?: string | null;
  paymentTerms?: string | null;
  installationSupport?: boolean;
  specValues?: OfferSpecValue[] | null;
  documents?: OfferDocument[] | null;
  action?: "SAVE_DRAFT" | "SUBMIT_FOR_REVIEW";
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  // Delta v6 extensions
  currentStep?: number;
  modelCode?: string | null;
  manufacturer?: string | null;
  originCountry?: string | null;
  equipmentStatus?: string | null;
  manufacturingYear?: number | null;
  capacityScale?: string | null;
  energyConsumption?: string | null;
  automationLevel?: string | null;
  operatingPrinciple?: string | null;
  deploymentConditions?: string | null;
  transferPriorityMethod?: string | null;
  priceIncludes?: string | null;
  taxAndExtraCosts?: string | null;
  technicalSupportMethod?: string | null;
  ipIssueDate?: string | null;
  legalCommitmentConfirmed?: boolean;
}

export interface UpdateSellerOfferPayload extends CreateSellerOfferPayload {}

export interface SellerKpi {
  totalOffers: number;
  publishedOffers: number;
  pendingOffers: number;
  draftOffers?: number;
  successfulConnections: number;
}

export interface SectorItem {
  code: string;
  name: string;
  count: number;
  iconName?: string;
}

// AI Extractor DTOs (DD-02 & PO-DEC-20261008-07)
export interface TechTransferDraftData {
  title?: string;
  technicalSummary?: string;
  problemSolved?: string;
  targetSectorCode?: string;
  techGroupCode?: string;
  ipQuad?: {
    trlLevel?: number;
    trlEvidenceSummary?: string;
    ipStatus?: IntellectualPropertyStatus;
    patentNumber?: string;
    patentOwner?: string;
    transferMethod?: TransferMethod;
    commercialReadiness?: CommercializationStatus;
  };
  originDeveloper?: string;
  suggestedPriceRange?: string;
  suggestedSpecs?: OfferSpecValue[];
}

export interface TechTransferDraftDto {
  success: boolean;
  extractionId: string;
  confidenceScore: number;
  data: TechTransferDraftData;
  extractionMetadata?: {
    modelUsed?: string;
    processingTimeMs?: number;
    highlightFields?: string[];
  };
}

export interface IndustryDefinition {
  code: string;
  name: string;
  defaultSpecs: Array<{ specName: string; unit?: string; placeholder?: string }>;
}

export const TT17_SECTORS: IndustryDefinition[] = [
  {
    code: "LV01",
    name: "Nông nghiệp",
    defaultSpecs: [
      { specName: "Công suất canh tác / thu hoạch", unit: "ha/ngày", placeholder: "Ví dụ: 5 - 10" },
      { specName: "Tỷ lệ tiết kiệm nước tưới", unit: "%", placeholder: "Ví dụ: 35" },
      { specName: "Năng suất tăng thêm ước tính", unit: "%", placeholder: "Ví dụ: 20 - 25" },
      { specName: "Diện tích canh tác tối thiểu phù hợp", unit: "ha", placeholder: "Ví dụ: 1" }
    ]
  },
  {
    code: "LV05",
    name: "Chế biến thực phẩm – đồ uống",
    defaultSpecs: [
      { specName: "Công suất chế biến định mức", unit: "tấn/ngày", placeholder: "Ví dụ: 20" },
      { specName: "Nhiệt độ cấp đông sâu / bảo quản", unit: "°C", placeholder: "Ví dụ: -45" },
      { specName: "Tỷ lệ thất thoát nguyên liệu", unit: "%", placeholder: "Ví dụ: < 0.5" },
      { specName: "Tiêu chuẩn vệ sinh an toàn", unit: "", placeholder: "HACCP, ISO 22000" },
      { specName: "Độ ẩm sản phẩm sau chế biến", unit: "%", placeholder: "Ví dụ: < 3" }
    ]
  },
  {
    code: "LV07",
    name: "Cơ khí – chế tạo – công nghiệp hỗ trợ",
    defaultSpecs: [
      { specName: "Độ chính xác gia công lặp lại", unit: "mm", placeholder: "Ví dụ: ± 0.005" },
      { specName: "Bán kính với tới / hành trình làm việc", unit: "mm", placeholder: "Ví dụ: 1850" },
      { specName: "Công suất nguồn gia công / cắt hàn", unit: "kW", placeholder: "Ví dụ: 15" },
      { specName: "Tải trọng nâng / kẹp định mức", unit: "kg", placeholder: "Ví dụ: 50" }
    ]
  },
  {
    code: "LV08",
    name: "Điện – điện tử – tự động hóa",
    defaultSpecs: [
      { specName: "Điện áp hoạt động định mức", unit: "V", placeholder: "Ví dụ: 220VAC / 24VDC" },
      { specName: "Dải tần số hoạt động", unit: "GHz", placeholder: "Ví dụ: 2.4 - 5.8" },
      { specName: "Công suất tiêu thụ tối đa", unit: "W", placeholder: "Ví dụ: 45" },
      { specName: "Chuẩn giao tiếp tích hợp", unit: "", placeholder: "Ethernet, RS485, CANbus" }
    ]
  },
  {
    code: "LV11",
    name: "Nước – môi trường – chất thải",
    defaultSpecs: [
      { specName: "Hiệu suất khử màu / xử lý ô nhiễm", unit: "%", placeholder: "Ví dụ: > 95" },
      { specName: "Tỷ lệ giảm phát thải COD / BOD", unit: "%", placeholder: "Ví dụ: 80 - 88" },
      { specName: "Công suất xử lý nước / chất thải", unit: "m³/ngày", placeholder: "Ví dụ: 500" },
      { specName: "Quy chuẩn môi trường đạt được", unit: "", placeholder: "QCVN 40:2011/BTNMT Cột A" }
    ]
  },
  {
    code: "LV12",
    name: "Xây dựng – vật liệu – hạ tầng",
    defaultSpecs: [
      { specName: "Cường độ chịu nén", unit: "MPa", placeholder: "Ví dụ: 40" },
      { specName: "Độ hút nước của vật liệu", unit: "%", placeholder: "Ví dụ: < 5" },
      { specName: "Khối lượng thể tích", unit: "kg/m³", placeholder: "Ví dụ: 1800" },
      { specName: "Cấp độ chống cháy", unit: "", placeholder: "Chống cháy lan nhóm A" }
    ]
  },
  {
    code: "LV14",
    name: "Logistics – vận tải – kho bãi",
    defaultSpecs: [
      { specName: "Tốc độ phân loại kiện hàng", unit: "kiện/giờ", placeholder: "Ví dụ: 4000" },
      { specName: "Độ chính xác nhận diện mã vạch/RFID", unit: "%", placeholder: "Ví dụ: 99.9" },
      { specName: "Tải trọng kiện hàng tối đa", unit: "kg", placeholder: "Ví dụ: 30" },
      { specName: "Tỷ lệ tối ưu hóa tuyến đường", unit: "%", placeholder: "Ví dụ: 25" }
    ]
  },
  {
    code: "LV15",
    name: "Du lịch – khách sạn – nhà hàng",
    defaultSpecs: [
      { specName: "Công suất phục vụ khách / lượt", unit: "khách/ngày", placeholder: "Ví dụ: 1000" },
      { specName: "Tỷ lệ tự động hóa check-in / check-out", unit: "%", placeholder: "Ví dụ: 80" },
      { specName: "Thời gian xử lý giao dịch đặt chỗ", unit: "giây", placeholder: "Ví dụ: < 2" }
    ]
  },
  {
    code: "LV16",
    name: "CNTT – viễn thông – chuyển đổi số",
    defaultSpecs: [
      { specName: "Giao thức truyền thông hỗ trợ", unit: "", placeholder: "MQTT, HTTP/REST, Modbus TCP" },
      { specName: "Thời gian phản hồi bình quân (Latency)", unit: "ms", placeholder: "Ví dụ: < 50" },
      { specName: "Số thiết bị kết nối đồng thời", unit: "nodes", placeholder: "Ví dụ: 10.000" },
      { specName: "Nền tảng hạ tầng triển khai", unit: "", placeholder: "Cloud Docker / On-Premise" }
    ]
  },
  {
    code: "LV17",
    name: "Khoa học – công nghệ – đổi mới sáng tạo",
    defaultSpecs: [
      { specName: "Cấp độ hoàn thiện công nghệ (TRL)", unit: "TRL", placeholder: "Ví dụ: TRL 6 - 9" },
      { specName: "Tình trạng xác lập quyền SHTT", unit: "", placeholder: "Bằng sáng chế / GPHI" },
      { specName: "Hiệu quả kinh tế - kỹ thuật dự kiến", unit: "%", placeholder: "Ví dụ: Tiết kiệm chi phí 30%" }
    ]
  }
];

// Helper ánh xạ an toàn cho các mã cũ nếu còn tồn tại
export const LEGACY_SECTOR_MAP: Record<string, string> = {
  AG: "LV01",
  FOOD: "LV05",
  DRINK: "LV02",
  MECH: "LV07",
  ELEC: "LV08",
  ENV: "LV11",
  BUILD: "LV12",
  LOG: "LV14",
  HOSP: "LV15",
  IT: "LV16",
  SCI: "LV17",
  TEXT: "LV03",
  WOOD: "LV04",
  CHEM: "LV06",
  PHARMA: "LV09",
  OPT: "LV10",
  FURN: "LV13",
  OTHER: "LV18"
};
