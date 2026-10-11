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
}

export interface ConnectionRequest {
  id: string;
  requestCode: string;
  senderUserId: string;
  senderOrgName: string;
  senderRole: string;
  receiverUserId: string | null;
  receiverOrgName: string;
  demandId: string;
  offerId: string;
  message: string;
  proposedBudgetRange: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  responseNote: string | null;
  respondedAt: string | null;
  createdAt: string;
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
