export interface RadarXaiBreakdown {
  semanticScore: number;
  semanticEngine: string; // 'BGE-M3_RERANK' | 'POSTGRES_FTS_FALLBACK'
  trlScore: number;
  trlLevel: number;
  trlStage: string;
  tniScore: number;
  tniBand: string;
  ipScore: number;
  ipStatus: string;
  ipDescription: string;
}

export interface RecomputeRadarResult {
  computedMatchesCount: number;
  tookMs: number;
  isDegraded: boolean;
  engineVersion: string;
  timestamp: string;
}

export interface MatchCandidate {
  id: string;
  demandId: string;
  demandCode: string;
  demandTitle: string;
  buyerOrganizationId: string | null;
  buyerOrganizationName: string;
  offerId: string;
  offerCode: string;
  offerTitle: string;
  sellerOrganizationId: string | null;
  sellerOrganizationName: string;
  sectorCode: string;
  matchScore: number;
  tniScore: number;
  trlLevel: number;
  ipStatus: string;
  isActive: boolean;
  createdAt: string;
  xaiBreakdown?: RadarXaiBreakdown;
  isDegraded?: boolean;
  computedAt?: string;
}

export interface TargetOfferSummary {
  offerId: string;
  offerCode: string;
  offerTitle: string;
  trlLevel: number;
  trlStage: string;
  ipStatus: string;
  sectorCode?: string | null;
  sectorName?: string | null;
  priceMillionVnd?: number | null;
}

export type BuyerType = "INDIVIDUAL" | "EXPERT" | "ENTERPRISE";

export interface BuyerEnterpriseProfile {
  enterpriseId?: string | null;
  buyerOrganizationId?: string;
  companyName: string;
  taxCode?: string | null;
  industry?: string | null;
  provinceCode?: string | null;
  provinceName?: string | null;
  address?: string | null;
  scaleCategory?: string | null;
  employeeCountRange?: number | null;
  buyerType?: BuyerType;
  academicTitle?: string | null;
  specializedField?: string | null;
  expertProfileId?: string | null;
}

export interface PdpdContactInfo {
  contactPersonName: string;
  phoneNumber: string;
  email: string;
  identityNumber?: string | null;
  isMasked: boolean;
  pdpdNotice: string;
}

export interface ConnectionRequest {
  id: string;
  requestCode: string;
  senderUserId: string;
  buyerOrganizationId?: string | null;
  senderOrgName: string;
  senderRole: string;
  receiverUserId: string | null;
  sellerOrganizationId?: string | null;
  receiverOrgName: string;
  demandId: string | null;
  demandCode?: string | null;
  demandTitle?: string | null;
  targetOfferId?: string | null;
  offerId?: string | null;
  offerCode?: string | null;
  offerTitle?: string | null;
  offerTrlLevel?: number | null;
  offerIpStatus?: string | null;
  senderTaxCode?: string | null;
  senderIndustry?: string | null;
  senderProvince?: string | null;
  message: string;
  proposedBudgetRange: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  responseNote?: string | null;
  rejectionReason?: string | null;
  slaDeadline?: string | null;
  isSlaWarning?: boolean;
  respondedAt: string | null;
  createdAt: string;
  buyerType?: BuyerType;
  academicTitle?: string | null;
  specializedField?: string | null;
  expertProfileId?: string | null;
}

export interface ConnectionRequestDetail {
  id: string;
  requestCode: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  rejectionReason?: string | null;
  message: string;
  proposedBudgetRange: string | null;
  createdAt: string;
  respondedAt: string | null;
  slaDeadline: string | null;
  isSlaWarning: boolean;
  createdOpportunityId?: string | null;
  createdOpportunityCode?: string | null;
  targetOffer?: TargetOfferSummary | null;
  buyerProfile: BuyerEnterpriseProfile;
  contactInfo: PdpdContactInfo;
  buyerType?: BuyerType;
  academicTitle?: string | null;
  specializedField?: string | null;
  expertProfileId?: string | null;
}

export interface Opportunity {
  id: string;
  opportunityCode: string;
  connectionRequestId: string | null;
  title: string;
  buyerOrgName: string;
  buyerContactName: string;
  buyerContactPhone: string;
  buyerContactEmail: string;
  sellerOrgName: string;
  sellerContactName: string;
  sellerContactPhone: string;
  sellerContactEmail: string;
  assignedExpertName: string | null;
  managingAuthorityId: string | null;
  stage: "SUGGESTED" | "INITIATED" | "NEGOTIATING" | "MOU_SIGNED" | "COMPLETED" | "CLOSED_LOST" | string;
  estimatedValueMillionVnd: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DealDiscussion {
  id: string;
  senderName: string;
  senderRole: "BUYER" | "SELLER" | "EXPERT" | string;
  message: string;
  attachmentUrl: string | null;
  createdAt: string;
}

export interface MouAgreement {
  id: string;
  mouCode: string;
  scopeOfWork: string;
  pilotDurationMonths: number;
  commercialTerms: string;
  intellectualPropertyTerms: string;
  status: "DRAFT" | "SIGNED" | string;
  signedDate: string | null;
  createdAt: string;
}

export interface DealRoomData {
  opportunity: Opportunity;
  discussions: DealDiscussion[];
  mou: MouAgreement | null;
}

export interface GovOpportunitiesOverview {
  statistics: {
    total: number;
    suggested: number;
    initiated: number;
    negotiating: number;
    mouSigned: number;
    completed: number;
    closedLost: number;
    totalEstimatedValueMillionVnd: number;
  };
  opportunities: (Opportunity & { isSlaWarning: boolean })[];
}
