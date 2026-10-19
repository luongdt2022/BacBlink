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
    name: "Nông nghiệp, Lâm nghiệp & Thủy sản",
    defaultSpecs: [
      { specName: "Công suất canh tác / thu hoạch", unit: "ha/ngày", placeholder: "Ví dụ: 5 - 10" },
      { specName: "Tỷ lệ tiết kiệm nước tưới", unit: "%", placeholder: "Ví dụ: 35" },
      { specName: "Năng suất tăng thêm ước tính", unit: "%", placeholder: "Ví dụ: 20 - 25" },
      { specName: "Diện tích canh tác tối thiểu phù hợp", unit: "ha", placeholder: "Ví dụ: 1" }
    ]
  },
  {
    code: "LV05",
    name: "Chế biến thực phẩm – đồ uống (Công nghệ chế biến nông sản - thực phẩm)",
    defaultSpecs: [
      { specName: "Công suất tách ẩm định mức", unit: "kg/mẻ", placeholder: "Ví dụ: 120" },
      { specName: "Nhiệt độ cấp đông sâu buồng sấy", unit: "°C", placeholder: "Ví dụ: -45" },
      { specName: "Độ chân không tối đa", unit: "mbar", placeholder: "Ví dụ: 0.02" },
      { specName: "Điện năng tiêu thụ bình quân", unit: "kW/h", placeholder: "Ví dụ: 7.5" },
      { specName: "Độ ẩm sản phẩm sau chế biến", unit: "%", placeholder: "Ví dụ: < 3" }
    ]
  },
  {
    code: "LV02",
    name: "Sản xuất đồ uống & Nước giải khát",
    defaultSpecs: [
      { specName: "Công suất chiết rót định mức", unit: "chai/giờ", placeholder: "Ví dụ: 3000" },
      { specName: "Áp suất tiệt trùng chuẩn", unit: "bar", placeholder: "Ví dụ: 2.5" },
      { specName: "Tỷ lệ thất thoát nguyên liệu", unit: "%", placeholder: "Ví dụ: < 0.5" },
      { specName: "Tiêu chuẩn vệ sinh an toàn", unit: "", placeholder: "HACCP, ISO 22000" }
    ]
  },
  {
    code: "LV07",
    name: "Cơ khí chế tạo & Tự động hóa",
    defaultSpecs: [
      { specName: "Độ chính xác lặp lại", unit: "mm", placeholder: "Ví dụ: 0.02" },
      { specName: "Bán kính với tới làm việc", unit: "mm", placeholder: "Ví dụ: 1850" },
      { specName: "Công suất nguồn hàn / gia công", unit: "W", placeholder: "Ví dụ: 3000" },
      { specName: "Tải trọng nâng định mức", unit: "kg", placeholder: "Ví dụ: 50" }
    ]
  },
  {
    code: "LV08",
    name: "Điện tử, Bán dẫn & Viễn thông",
    defaultSpecs: [
      { specName: "Điện áp hoạt động định mức", unit: "V", placeholder: "Ví dụ: 220VAC / 24VDC" },
      { specName: "Dải tần số hoạt động", unit: "GHz", placeholder: "Ví dụ: 2.4 - 5.8" },
      { specName: "Công suất tiêu thụ tối đa", unit: "W", placeholder: "Ví dụ: 45" },
      { specName: "Chuẩn giao tiếp tích hợp", unit: "", placeholder: "Ethernet, RS485, CANbus" }
    ]
  },
  {
    code: "LV11",
    name: "Công nghệ môi trường & Kinh tế tuần hoàn",
    defaultSpecs: [
      { specName: "Hiệu suất khử màu hợp chất", unit: "%", placeholder: "Ví dụ: > 95" },
      { specName: "Tỷ lệ giảm phát thải COD/BOD", unit: "%", placeholder: "Ví dụ: 80 - 88" },
      { specName: "Công suất xử lý nước thải", unit: "m³/ngày", placeholder: "Ví dụ: 500" },
      { specName: "Mật độ vi sinh hoạt tính", unit: "CFU/ml", placeholder: "Ví dụ: 10^9" }
    ]
  },
  {
    code: "LV12",
    name: "Vật liệu xây dựng & Kỹ thuật công trình",
    defaultSpecs: [
      { specName: "Cường độ chịu nén", unit: "MPa", placeholder: "Ví dụ: 40" },
      { specName: "Độ hút nước của vật liệu", unit: "%", placeholder: "Ví dụ: < 5" },
      { specName: "Khối lượng thể tích", unit: "kg/m³", placeholder: "Ví dụ: 1800" },
      { specName: "Cấp độ chống cháy", unit: "", placeholder: "Chống cháy lan nhóm A" }
    ]
  },
  {
    code: "LV14",
    name: "Logistics, Vận tải & Chuỗi cung ứng",
    defaultSpecs: [
      { specName: "Tốc độ phân loại kiện hàng", unit: "kiện/giờ", placeholder: "Ví dụ: 4000" },
      { specName: "Độ chính xác nhận diện mã vạch/RFID", unit: "%", placeholder: "Ví dụ: 99.9" },
      { specName: "Tải trọng kiện hàng tối đa", unit: "kg", placeholder: "Ví dụ: 30" }
    ]
  },
  {
    code: "LV15",
    name: "Y tế, Dược phẩm & Thiết bị chăm sóc sức khỏe",
    defaultSpecs: [
      { specName: "Độ nhạy phát hiện chẩn đoán", unit: "%", placeholder: "Ví dụ: 98.5" },
      { specName: "Độ đặc hiệu lâm sàng", unit: "%", placeholder: "Ví dụ: 99.1" },
      { specName: "Thời gian cho kết quả", unit: "phút", placeholder: "Ví dụ: 15" },
      { specName: "Cấp độ phân loại trang thiết bị y tế", unit: "", placeholder: "Loại B theo Nghị định 98" }
    ]
  },
  {
    code: "LV16",
    name: "Công nghệ thông tin, Phần mềm & IoT",
    defaultSpecs: [
      { specName: "Giao thức truyền thông hỗ trợ", unit: "", placeholder: "MQTT, HTTP/REST, Modbus TCP" },
      { specName: "Thời gian phản hồi bình quân (Latency)", unit: "ms", placeholder: "Ví dụ: < 50" },
      { specName: "Số thiết bị kết nối đồng thời", unit: "nodes", placeholder: "Ví dụ: 10.000" },
      { specName: "Nền tảng hạ tầng triển khai", unit: "", placeholder: "Cloud Docker / On-Premise" }
    ]
  },
  {
    code: "LV17",
    name: "Khoa học vật liệu & Công nghệ đo lường",
    defaultSpecs: [
      { specName: "Dải đo lường tiêu chuẩn", unit: "", placeholder: "0.001 - 1000 mm" },
      { specName: "Sai số phép đo cho phép", unit: "%", placeholder: "Ví dụ: ± 0.1" },
      { specName: "Nhiệt độ môi trường hoạt động", unit: "°C", placeholder: "Ví dụ: -10 đến +55" }
    ]
  },
  {
    code: "LV03",
    name: "Dệt may, Da giày & Thời trang kỹ thuật",
    defaultSpecs: [
      { specName: "Độ bền kéo đứt sợi/vải", unit: "N", placeholder: "Ví dụ: 450" },
      { specName: "Độ bền màu khi giặt", unit: "cấp", placeholder: "Ví dụ: Cấp 4-5" },
      { specName: "Khả năng chống thấm nước", unit: "mm H2O", placeholder: "Ví dụ: > 10.000" }
    ]
  },
  {
    code: "LV04",
    name: "Chế biến gỗ & Lâm sản công nghệ cao",
    defaultSpecs: [
      { specName: "Độ ẩm gỗ thành phẩm", unit: "%", placeholder: "Ví dụ: 8 - 12" },
      { specName: "Tốc độ đưa phôi tự động", unit: "m/phút", placeholder: "Ví dụ: 25" },
      { specName: "Tiêu chuẩn phát thải Formaldehyde", unit: "", placeholder: "Chuẩn E0 / CARB P2" }
    ]
  },
  {
    code: "LV06",
    name: "Hóa chất, Phân bón & Vật liệu mới",
    defaultSpecs: [
      { specName: "Hàm lượng hoạt chất chính", unit: "%", placeholder: "Ví dụ: ≥ 98.5" },
      { specName: "Độ pH dung dịch 1%", unit: "pH", placeholder: "Ví dụ: 6.5 - 7.5" },
      { specName: "Độ hòa tan trong nước", unit: "g/L", placeholder: "Ví dụ: Hoàn toàn" }
    ]
  },
  {
    code: "LV09",
    name: "Dược phẩm, Mỹ phẩm & Công nghệ sinh học",
    defaultSpecs: [
      { specName: "Hàm lượng dược chất chiết xuất", unit: "%", placeholder: "Ví dụ: ≥ 95" },
      { specName: "Thời hạn ổn định hoạt tính", unit: "tháng", placeholder: "Ví dụ: 36" },
      { specName: "Tiêu chuẩn xưởng sản xuất", unit: "", placeholder: "GMP-WHO, ISO 22716" }
    ]
  },
  {
    code: "LV10",
    name: "Quang học & Thiết bị phân tích chính xác",
    defaultSpecs: [
      { specName: "Dải bước sóng quang phổ", unit: "nm", placeholder: "Ví dụ: 190 - 1100" },
      { specName: "Độ phân giải cảm biến quang", unit: "Megapixel", placeholder: "Ví dụ: 20" },
      { specName: "Độ chính xác bước sóng", unit: "nm", placeholder: "Ví dụ: ± 0.3" }
    ]
  },
  {
    code: "LV13",
    name: "Sản phẩm nội thất & Gia dụng thông minh",
    defaultSpecs: [
      { specName: "Tải trọng chịu lực tĩnh", unit: "kg", placeholder: "Ví dụ: 250" },
      { specName: "Độ bền chu kỳ đóng mở", unit: "lần", placeholder: "Ví dụ: 100.000" },
      { specName: "Tiêu chuẩn kết nối điều khiển", unit: "", placeholder: "Zigbee 3.0 / Bluetooth Mesh" }
    ]
  },
  {
    code: "LV18",
    name: "Lĩnh vực công nghệ tổng hợp khác",
    defaultSpecs: [
      { specName: "Công suất thiết kế định mức", unit: "", placeholder: "Theo tài liệu kỹ thuật" },
      { specName: "Hiệu suất vận hành", unit: "%", placeholder: "Ví dụ: > 92" },
      { specName: "Tiêu chuẩn kỹ thuật áp dụng", unit: "", placeholder: "TCVN, IEC, ISO" }
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
