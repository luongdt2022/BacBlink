export type OfferType = "PRODUCT" | "DEVICE" | "SOLUTION";

export type IntellectualPropertyStatus =
  | "PATENT_GRANTED"
  | "UTILITY_MODEL"
  | "TRADE_SECRET"
  | "PATENT_PENDING"
  | "SOFTWARE_COPYRIGHT"
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
}

export interface CreateSellerOfferPayload {
  offerType: OfferType;
  hasTechTransfer: boolean;
  title: string;
  summary: string;
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
}

export interface SellerKpi {
  totalOffers: number;
  publishedOffers: number;
  pendingOffers: number;
  successfulConnections: number;
}

export interface SectorItem {
  code: string;
  name: string;
  count: number;
  iconName?: string;
}
