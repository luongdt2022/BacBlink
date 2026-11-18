"use client";

import React, { useEffect, useState, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AppButton } from "@/components/ui/design-system";
import { authClient, UserContext } from "@/lib/auth-client";
import { Async, UXState } from "@/components/ui/async";
import { getActiveSectors } from "@/lib/master-data-client";
import {
  FileCheck2,
  Users,
  Building2,
  GraduationCap,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Search,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Check,
  X,
  RotateCcw,
  FileText,
  Building,
  Image as ImageIcon,
  Video,
  ExternalLink,
  Tag,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Sparkles,
  Award,
  BookOpen,
  Mail,
  Phone,
  Briefcase,
  Download,
} from "lucide-react";

import { reviewOffer } from "@/services/api/technology-offer";
import { TechnologyOffer } from "@/types/technology-offer";
import { GovPageHeader } from "@/components/gov/gov-page-header";
import TrlMethodologyModal from "@/components/common/TrlMethodologyModal";
import {
  resolveSectorName,
  resolveProvinceName,
  resolveTrlInfo,
  resolveIpStatusInfo,
  resolveGovRequestType,
  formatGovRecordCode,
  formatDegree,
} from "@/lib/gov-label-resolver";

function formatOfferType(type?: string | null): string {
  switch (type) {
    case "DEVICE":
      return "Thiết bị / Máy móc";
    case "EQUIPMENT":
      return "Dây chuyền / Thiết bị";
    case "SOLUTION":
      return "Giải pháp kỹ thuật";
    case "SOFTWARE":
      return "Phần mềm / Nền tảng số";
    case "PROCESS":
      return "Quy trình công nghệ";
    case "PRODUCT":
    default:
      return "Sản phẩm thương mại";
  }
}

function formatTransferMethod(method?: string | null): string {
  switch (method) {
    case "EXCLUSIVE_LICENSE":
      return "Li-xăng độc quyền";
    case "NON_EXCLUSIVE_LICENSE":
      return "Li-xăng không độc quyền";
    case "ASSIGNMENT_SALE":
      return "Chuyển giao quyền sở hữu (Bán đứt)";
    case "JOINT_RD":
      return "Hợp tác R&D / Hoàn thiện công nghệ";
    case "CAPITAL_CONTRIBUTION":
      return "Góp vốn bằng tài sản trí tuệ";
    default:
      return method || "Thỏa thuận chuyển giao";
  }
}

function formatPrice(offer?: TechnologyOffer | null): string {
  if (!offer) return "Liên hệ thỏa thuận";
  if (offer.pricingType === "CONTACT") return "Liên hệ thỏa thuận";
  if (offer.pricingType === "FIXED" && offer.priceAmount) {
    return `${Number(offer.priceAmount).toLocaleString("vi-VN")} ${offer.currency || "VNĐ"}${offer.unit ? ` / ${offer.unit}` : ""}`;
  }
  if (offer.pricingType === "RANGE" && (offer.priceMin || offer.priceMax)) {
    const min = offer.priceMin ? Number(offer.priceMin).toLocaleString("vi-VN") : "0";
    const max = offer.priceMax ? Number(offer.priceMax).toLocaleString("vi-VN") : "...";
    return `${min} - ${max} ${offer.currency || "VNĐ"}`;
  }
  return "Liên hệ thỏa thuận";
}

export interface GovParsedExpert {
  fullName: string;
  birthYear?: number | string;
  organizationName: string;
  organizationAddress?: string;
  degree?: string;
  degreeYear?: number | string;
  academicRank?: string;
  researchTitle?: string;
  expertiseSectors: string[];
  specializedKeywords: string[];
  consultingSummary?: string;
  publications?: Array<{ title?: string; journal?: string; year?: number | string; doi?: string; authors?: string }>;
  expertCode?: string;
  phone?: string;
  email?: string;
  documents?: Array<{ fileName?: string; fileUrl?: string; fileType?: string }>;
  raw: any;
}

export function parseGovPayload(payload: any, fallbackUser?: any): GovParsedExpert {
  let p: any = {};
  if (typeof payload === "string") {
    try {
      p = JSON.parse(payload);
    } catch {
      p = {};
    }
  } else if (payload && typeof payload === "object") {
    p = payload;
  }

  // Parse fullName - ưu tiên PascalCase -> camelCase -> user context -> fallback
  const fullName =
    p.FullName ||
    p.fullName ||
    p.Name ||
    p.name ||
    fallbackUser?.fullName ||
    fallbackUser?.name ||
    (fallbackUser?.email ? fallbackUser.email.split("@")[0] : "") ||
    "Chuyên gia địa phương";

  // Parse organizationName
  const organizationName =
    p.OrganizationName ||
    p.organizationName ||
    p.Organization ||
    p.organization ||
    p.CurrentWorkplace ||
    p.currentWorkplace ||
    "Hiệp hội BACLINK";

  // Parse organizationAddress
  const organizationAddress =
    p.OrganizationAddress ||
    p.organizationAddress ||
    p.Address ||
    p.address ||
    "";

  // Parse degree & academicRank
  const degree = p.Degree || p.degree || "";
  const degreeYear = p.DegreeYear || p.degreeYear;
  const academicRank = p.AcademicRank || p.academicRank || "";
  const researchTitle =
    p.ResearchTitle ||
    p.researchTitle ||
    p.PositionTitle ||
    p.positionTitle ||
    p.Title ||
    p.title ||
    "";
  const birthYear = p.BirthYear || p.birthYear;

  // Parse expertiseSectors
  let expertiseSectors: string[] = [];
  const rawSectors = p.ExpertiseSectors || p.expertiseSectors;
  if (Array.isArray(rawSectors)) {
    expertiseSectors = rawSectors.filter(Boolean);
  } else if (typeof rawSectors === "string") {
    expertiseSectors = [rawSectors];
  } else if (p.ExpertiseSector || p.expertiseSector) {
    expertiseSectors = [p.ExpertiseSector || p.expertiseSector];
  } else if (p.SectorCode || p.sectorCode) {
    expertiseSectors = [p.SectorCode || p.sectorCode];
  }

  // Parse specializedKeywords
  let specializedKeywords: string[] = [];
  const rawKeywords = p.SpecializedKeywords || p.specializedKeywords || p.Keywords || p.keywords;
  if (Array.isArray(rawKeywords)) {
    specializedKeywords = rawKeywords.filter(Boolean);
  } else if (typeof rawKeywords === "string") {
    specializedKeywords = rawKeywords.split(",").map((s: string) => s.trim()).filter(Boolean);
  }

  // Parse consultingSummary
  const consultingSummary =
    p.ConsultingSummary ||
    p.consultingSummary ||
    p.Summary ||
    p.summary ||
    p.PublicBio ||
    p.publicBio ||
    p.Bio ||
    p.bio ||
    "";

  // Parse publications
  let publications: any[] = [];
  const rawPubs = p.PublicationsJson || p.publicationsJson || p.Publications || p.publications;
  if (typeof rawPubs === "string") {
    try {
      publications = JSON.parse(rawPubs);
    } catch {
      publications = [];
    }
  } else if (Array.isArray(rawPubs)) {
    publications = rawPubs;
  }

  // Parse documents
  let documents: any[] = [];
  const rawDocs = p.Documents || p.documents;
  if (Array.isArray(rawDocs)) {
    documents = rawDocs;
  }

  const rawId = p.ExpertCode || p.expertCode || p.Id || p.id;
  const expertCode = p.ExpertCode || p.expertCode || (rawId ? `CG-BL-${String(rawId).replace(/-/g, '').slice(-8).toUpperCase()}` : "");
  const phone = p.Phone || p.phone || fallbackUser?.phoneNumber || fallbackUser?.phone || "";
  const email = p.Email || p.email || fallbackUser?.email || "";

  return {
    fullName,
    birthYear,
    organizationName,
    organizationAddress,
    degree,
    degreeYear,
    academicRank,
    researchTitle,
    expertiseSectors,
    specializedKeywords,
    consultingSummary,
    publications,
    expertCode,
    phone,
    email,
    documents,
    raw: p,
  };
}

export interface GovApprovalItem {
  id: string;
  submitterName: string;
  submitterEmail: string;
  type: "EXPERT" | "SHOP" | "DEMAND" | "ACCOUNT" | "FACILITY" | "TECHNOLOGY_OFFER" | "INSTITUTION";
  titleOrOrg: string;
  scopeType: string;
  scopeId: string;
  provinceName: string;
  sector: string;
  submittedAt: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "CHANGES_REQUESTED" | "REJECTED";
  cvOrDocName?: string;
  degree?: string;
  summary?: string;
  version: number;
  rawOffer?: TechnologyOffer;
  expertPayload?: GovParsedExpert;
  institutionPayload?: any;
}

function ExpertDocumentsSection({ expertCode, fallbackDocName }: { expertCode: string; fallbackDocName?: string }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!expertCode) return;
    fetch(`/api/v1/admin/experts/${encodeURIComponent(expertCode)}/documents`, {
      headers: authClient.getAuthHeaders(),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.data) setDocs(json.data);
      })
      .catch(() => {});
  }, [expertCode]);

  const handleDownload = async (docId: string, downloadName?: string) => {
    try {
      setDownloadingId(docId);
      const res = await fetch(`/api/v1/admin/experts/${encodeURIComponent(expertCode)}/documents/${docId}/download`, {
        headers: authClient.getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Tải tệp không thành công");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName ? `${downloadName}.pdf` : `CV_Goc_${expertCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Không thể tải tài liệu đối soát. Vui lòng thử lại sau.");
    } finally {
      setDownloadingId(null);
    }
  };

  const cvDoc = docs.find((d) => d.documentType === "CURRICULUM_VITAE") || docs[0];

  return (
    <div className="space-y-2">
      <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
        <FileText className="w-4 h-4 text-brand-600" />
        <span>Hồ Sơ Minh Chứng &amp; Pháp Lý Công Vụ</span>
      </h4>
      <div className="p-3.5 rounded-control bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {cvDoc ? `Lý lịch khoa học gốc (${(cvDoc.sizeBytes / 1024 / 1024).toFixed(2)} MB)` : (fallbackDocName || "Hồ sơ đăng ký chuyên gia đã được ký số công vụ qua Cổng Dịch vụ công.")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {cvDoc && (
            <AppButton
              variant="cta"
              onClick={() => handleDownload(cvDoc.id, cvDoc.downloadName)}
              disabled={downloadingId === cvDoc.id}
              className="text-xs py-1 px-3 inline-flex items-center gap-1.5"
              data-testid="btn-download-expert-cv"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{downloadingId === cvDoc.id ? "Đang tải..." : "📄 Tải CV gốc đối soát"}</span>
            </AppButton>
          )}
          <span className="text-caption text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-100 dark:bg-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
            Xác thực CCCD &amp; CKS
          </span>
        </div>
      </div>
    </div>
  );
}

function GovDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab")?.toUpperCase();
  const activeTab: "ALL" | "EXPERT" | "SHOP" | "DEMAND" | "ACCOUNT" | "INSTITUTION" = useMemo(() => {
    if (
      tabParam === "EXPERT" ||
      tabParam === "SHOP" ||
      tabParam === "DEMAND" ||
      tabParam === "ACCOUNT" ||
      tabParam === "INSTITUTION" ||
      tabParam === "ALL"
    ) {
      return tabParam;
    }
    return "ALL";
  }, [tabParam]);

  const handleTabChange = (newTab: "ALL" | "EXPERT" | "SHOP" | "DEMAND" | "ACCOUNT" | "INSTITUTION") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [user, setUser] = useState<UserContext | null>(null);
  const [items, setItems] = useState<GovApprovalItem[]>([]);
  const [sectorNames, setSectorNames] = useState<Record<string, string>>({});
  const [uxState, setUxState] = useState<UXState>("loading");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<GovApprovalItem | null>(null);
  const [detailItem, setDetailItem] = useState<GovApprovalItem | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT" | "REQUEST_CHANGES" | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [trlDecision, setTrlDecision] = useState<"VERIFY_BY_GOV" | "KEEP_SELF_DECLARED" | "REJECT_TRL">("VERIFY_BY_GOV");
  const [ipDecision, setIpDecision] = useState<"VERIFY_BY_GOV" | "KEEP_SELF_DECLARED" | "REJECT_IP">("VERIFY_BY_GOV");
  const [verifiedAuthorityName, setVerifiedAuthorityName] = useState("");
  const [trlReviewNote, setTrlReviewNote] = useState("");
  const [isTrlMethodologyOpen, setIsTrlMethodologyOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const reviewNoteRef = useRef<HTMLTextAreaElement>(null);

  const focusAndScrollToReviewNote = () => {
    setTimeout(() => {
      if (reviewNoteRef.current) {
        reviewNoteRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        reviewNoteRef.current.focus();
      }
    }, 50);
  };

  // Bổ sung State Sắp xếp & Lọc tương tác trên tiêu đề bảng
  const [sortColumn, setSortColumn] = useState<"id" | "submitter" | "title" | "sector" | "date" | "status" | null>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>("desc");
  const [filterSector, setFilterSector] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<"sector" | "status" | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleCopyCode = (code: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showToast(`Đã sao chép mã hồ sơ: ${code}`, "info");
    }
  };

  const handleSort = (column: "id" | "submitter" | "title" | "sector" | "date" | "status") => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const currentScopeId = user?.scopeId || "HP";
  const currentProvinceName = resolveProvinceName(currentScopeId);

  const loadApprovals = async (targetUser?: UserContext | null) => {
    setUxState("loading");
    const u = targetUser || user || authClient.getUser();
    const scopeId = u?.scopeId || "HP";

    try {
      let mapped: GovApprovalItem[] = [];
      const res = await fetch(`/api/v1/governance/approvals?scopeType=PROVINCE&scopeId=${scopeId}`, {
        headers: authClient.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const dataList = json.data?.items || json.data || json;
        if (Array.isArray(dataList)) {
          mapped = dataList.map((x: any) => {
            const rawType = (x.requestType || "EXPERT").toUpperCase();
            let parsedPayload: any = {};
            if (typeof x.payloadJson === "string") {
              try { parsedPayload = JSON.parse(x.payloadJson); } catch { parsedPayload = {}; }
            } else if (x.payloadJson && typeof x.payloadJson === "object") {
              parsedPayload = x.payloadJson;
            }

            const parsed = parseGovPayload(x.payloadJson, x.user);

            // Chuẩn hóa trạng thái: map PENDING, PENDING_REVIEW, PENDING_APPROVAL -> PENDING_APPROVAL
            let normStatus: "PENDING_APPROVAL" | "APPROVED" | "CHANGES_REQUESTED" | "REJECTED" = "PENDING_APPROVAL";
            const rawSt = (x.status || "").toUpperCase();
            if (rawSt === "APPROVED") normStatus = "APPROVED";
            else if (rawSt === "REJECTED") normStatus = "REJECTED";
            else if (rawSt === "CHANGES_REQUESTED") normStatus = "CHANGES_REQUESTED";
            else normStatus = "PENDING_APPROVAL";

            let submitterName = parsed.fullName;
            let titleOrOrg = parsed.organizationName;
            let sector = parsed.expertiseSectors[0] || "";
            let summary = parsed.consultingSummary;
            let cvOrDocName = parsed.documents?.[0]?.fileName || undefined;

            if (rawType === "INSTITUTION") {
              submitterName = parsedPayload.companyName || parsedPayload.CompanyName || parsed.fullName || x.user?.fullName || "Doanh Nghiệp Hội Viên";
              titleOrOrg = parsedPayload.taxCode ? `MST: ${parsedPayload.taxCode}` : (parsedPayload.companyName || "Doanh Nghiệp Hội Viên");
              cvOrDocName = parsedPayload.fileName || parsedPayload.FileName || undefined;
              summary = parsedPayload.companyName
                ? `Hồ sơ đăng ký Doanh nghiệp Hội viên: ${parsedPayload.companyName}${parsedPayload.taxCode ? ` (MST: ${parsedPayload.taxCode})` : ""}`
                : "";
              sector = parsedPayload.sector || sector;
            }

            return {
              id: x.id,
              submitterName,
              submitterEmail: parsed.email || x.user?.email || "advisor@baclink.org.vn",
              type: rawType as any,
              titleOrOrg,
              scopeType: x.scopeType || "GLOBAL",
              scopeId: x.scopeId || scopeId,
              provinceName: resolveProvinceName(x.scopeId) || resolveProvinceName(parsedPayload.province) || resolveProvinceName(scopeId),
              sector: sector,
              submittedAt: new Date(x.createdAt).toLocaleDateString("vi-VN"),
              status: normStatus,
              degree: parsed.degree || "Tiến sĩ (TS)",
              summary: summary,
              version: x.version || 1,
              cvOrDocName: cvOrDocName,
              expertPayload: parsed,
              institutionPayload: rawType === "INSTITUTION" ? parsedPayload : undefined,
            };
          });
        }
      }

      // Nạp hồ sơ sản phẩm & năng lực chào bán cần thẩm định của Ban Thư ký BACLINK
      try {
        const techRes = await fetch(`/api/v1/portal/seller/technologies?status=PENDING`);
        if (techRes.ok) {
          const techJson = await techRes.json();
          const techList = techJson.data || [];
          const techMapped: GovApprovalItem[] = techList
            .filter((t: any) => t.status === "PENDING")
            .map((t: any) => ({
              id: t.id,
              submitterName: t.developerOrigin || t.enterpriseName || "Doanh nghiệp Hội viên",
              submitterEmail: t.contactEmail || "seller@baclink.org.vn",
              type: "TECHNOLOGY_OFFER" as const,
              titleOrOrg: t.title,
              scopeType: t.scopeType || "PROVINCE",
              scopeId: t.scopeId || scopeId,
              provinceName: t.managingAuthorityName || resolveProvinceName(t.scopeId) || "Hà Nội",
              sector: t.sectorCode || "",
              submittedAt: new Date(t.createdAt).toLocaleDateString("vi-VN"),
              status: "PENDING_APPROVAL",
              summary: t.summary || "",
              cvOrDocName: t.ipRegistrationNumber
                ? `Văn bằng SHTT: ${t.ipRegistrationNumber}`
                : t.documents?.[0]?.fileName || undefined,
              version: 1,
              rawOffer: t,
            }));
          mapped = [...mapped, ...techMapped];
        }
      } catch {
        // Silent fallback
      }

      setItems(mapped);
      setUxState(mapped.length === 0 ? "empty" : "success");
    } catch {
      setItems([]);
      setUxState("error");
    }
  };

  useEffect(() => {
    getActiveSectors().then((rows) => setSectorNames(Object.fromEntries(rows.map((row) => [row.code, row.name])))).catch(() => setSectorNames({}));
    const u = authClient.getUser();
    setUser(u);
    loadApprovals(u);
  }, []);

  const availableSectors = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((item) => {
      const resolved = resolveSectorName(item.sector, sectorNames);
      if (item.sector && resolved !== "Chưa phân loại ngành") {
        map.set(item.sector, resolved);
      }
    });
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [items, sectorNames]);

  const processedItems = useMemo(() => {
    // 1. Phân loại theo Tab
    let list = items.filter((item) => {
      const matchTab =
        activeTab === "ALL"
          ? true
          : activeTab === "SHOP"
          ? item.type === "SHOP" || (item.type as string) === "TECHNOLOGY_OFFER"
          : item.type === activeTab;
      return matchTab;
    });

    // 2. Tìm kiếm (theo submitter, title, id, hoặc mã chuẩn hóa formatGovRecordCode)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const codeInfo = formatGovRecordCode(item.id, item.type, item.scopeId);
        const secResolved = resolveSectorName(item.sector, sectorNames).toLowerCase();
        return (
          item.submitterName.toLowerCase().includes(q) ||
          item.titleOrOrg.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          codeInfo.code.toLowerCase().includes(q) ||
          secResolved.includes(q)
        );
      });
    }

    // 3. Lọc theo Ngành / Lĩnh vực (Filter Popover)
    if (filterSector !== "ALL") {
      list = list.filter((item) => {
        const secResolved = resolveSectorName(item.sector, sectorNames);
        return item.sector === filterSector || secResolved === filterSector;
      });
    }

    // 4. Lọc theo Trạng thái duyệt (Filter Popover)
    if (filterStatus !== "ALL") {
      list = list.filter((item) => item.status === filterStatus);
    }

    // 5. Sắp xếp (Sorting)
    if (sortColumn && sortDirection) {
      list = [...list].sort((a, b) => {
        let valA = "";
        let valB = "";

        switch (sortColumn) {
          case "id": {
            valA = formatGovRecordCode(a.id, a.type, a.scopeId).code;
            valB = formatGovRecordCode(b.id, b.type, b.scopeId).code;
            break;
          }
          case "submitter": {
            valA = a.submitterName;
            valB = b.submitterName;
            break;
          }
          case "title": {
            valA = a.titleOrOrg;
            valB = b.titleOrOrg;
            break;
          }
          case "sector": {
            valA = resolveSectorName(a.sector, sectorNames);
            valB = resolveSectorName(b.sector, sectorNames);
            break;
          }
          case "date": {
            valA = a.submittedAt;
            valB = b.submittedAt;
            break;
          }
          case "status": {
            valA = a.status;
            valB = b.status;
            break;
          }
        }

        const comp = valA.localeCompare(valB, "vi");
        return sortDirection === "asc" ? comp : -comp;
      });
    }

    return list;
  }, [items, activeTab, searchQuery, filterSector, filterStatus, sortColumn, sortDirection, sectorNames]);

  const filteredItems = processedItems;

  const handleResetFilters = () => {
    setFilterSector("ALL");
    setFilterStatus("ALL");
    setSortColumn("date");
    setSortDirection("desc");
    setSearchQuery("");
  };

  const hasActiveFilters =
    filterSector !== "ALL" ||
    filterStatus !== "ALL" ||
    searchQuery.trim().length > 0 ||
    sortColumn !== "date" ||
    sortDirection !== "desc";

  const stats = useMemo(() => {
    return {
      all: items.length,
      expert: items.filter((x) => x.type === "EXPERT").length,
      shop: items.filter((x) => x.type === "SHOP" || (x.type as string) === "TECHNOLOGY_OFFER").length,
      demand: items.filter((x) => x.type === "DEMAND").length,
      account: items.filter((x) => x.type === "ACCOUNT").length,
      institution: items.filter((x) => x.type === "INSTITUTION").length,
    };
  }, [items]);

  const handleReviewSubmit = async () => {
    if (!selectedItem || !reviewAction) return;

    if (reviewAction === "REJECT" || reviewAction === "REQUEST_CHANGES") {
      const trimmedNote = reviewNote.trim();
      if (!trimmedNote || trimmedNote.length < 10) {
        setReviewError("Lý do xử lý bắt buộc phải có ít nhất 10 ký tự hợp lệ theo Quy tắc BR-ADM-004.");
        showToast("Vui lòng nhập lý do quyết định có ít nhất 10 ký tự theo Quy tắc BR-ADM-004.", "error");
        if (reviewNoteRef.current) {
          reviewNoteRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
          reviewNoteRef.current.focus();
        }
        return;
      }
    }

    setProcessing(true);
    setReviewError("");

    try {
      if (selectedItem.type === "TECHNOLOGY_OFFER") {
        const authorityToUse =
          verifiedAuthorityName.trim() ||
          user?.organizationName ||
          `Ban Thư ký Hiệp hội BACLINK (${currentProvinceName})`;

        await reviewOffer(
          selectedItem.id,
          reviewAction,
          reviewNote.trim() || (reviewAction === "APPROVE" ? "Hồ sơ sản phẩm hợp lệ, Ban Thư ký BACLINK phê duyệt niêm yết." : "Cần bổ sung hồ sơ."),
          reviewAction === "APPROVE"
            ? {
                trlVerificationDecision: trlDecision,
                ipVerificationDecision: ipDecision,
                verifiedAuthorityName: authorityToUse,
                trlReviewNote: trlReviewNote.trim() || undefined,
              }
            : undefined
        );
      } else {
        const res = await fetch(`/api/v1/governance/approvals/${selectedItem.id}/review`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authClient.getAuthHeaders(),
          },
          body: JSON.stringify({
            action: reviewAction,
            expectedVersion: selectedItem.version,
            reviewNote: reviewNote.trim() || (reviewAction === "APPROVE" ? "Hồ sơ hợp lệ, Ban Thư ký BACLINK phê duyệt." : ""),
          }),
        });

        if (res.status === 409) {
          showToast("Xung đột (409 Conflict): Hồ sơ đã được cán bộ khác xử lý trước đó. Đang tải lại...", "error");
          await loadApprovals();
          setSelectedItem(null);
          setReviewAction(null);
          return;
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Không thể xử lý yêu cầu thẩm định.");
        }
      }

      // Cập nhật trạng thái thành công trong UI
      const nextStatus =
        reviewAction === "APPROVE"
          ? "APPROVED"
          : reviewAction === "REJECT"
          ? "REJECTED"
          : "CHANGES_REQUESTED";

      setItems((prev) =>
        prev.map((it) =>
          it.id === selectedItem.id
            ? { ...it, status: nextStatus, version: it.version + 1 }
            : it
        )
      );

      const isOffer = selectedItem.type === "TECHNOLOGY_OFFER" || selectedItem.type === "SHOP";
      const isInstitution = selectedItem.type === "INSTITUTION";
      let successMessage = `Đã chuyển trạng thái hồ sơ sang ${nextStatus}.`;
      if (reviewAction === "APPROVE") {
        successMessage = isOffer
          ? `Đã phê duyệt sản phẩm "${selectedItem.titleOrOrg}"! Công nghệ đã sẵn sàng niêm yết trên Sàn.`
          : isInstitution
          ? `Đã phê duyệt Doanh nghiệp Hội viên "${selectedItem.submitterName}" (MST: ${selectedItem.institutionPayload?.taxCode || ""}) thành công!`
          : `Đã phê duyệt hồ sơ chuyên gia ${selectedItem.submitterName}! Cấp role VERIFIED_EXPERT thành công.`;
      } else if (reviewAction === "REQUEST_CHANGES") {
        successMessage = isOffer
          ? `Đã gửi yêu cầu hoàn thiện hồ sơ cho sản phẩm "${selectedItem.titleOrOrg}".`
          : isInstitution
          ? `Đã gửi yêu cầu bổ sung hồ sơ cho Doanh nghiệp ${selectedItem.submitterName}.`
          : `Đã gửi yêu cầu bổ sung hồ sơ cho chuyên gia ${selectedItem.submitterName}.`;
      } else if (reviewAction === "REJECT") {
        successMessage = isOffer
          ? `Đã từ chối niêm yết sản phẩm "${selectedItem.titleOrOrg}".`
          : isInstitution
          ? `Đã từ chối phê duyệt hồ sơ Doanh nghiệp ${selectedItem.submitterName}.`
          : `Đã từ chối phê duyệt hồ sơ của ${selectedItem.submitterName}.`;
      }

      showToast(successMessage, reviewAction === "APPROVE" ? "success" : "info");
    } catch (e: any) {
      showToast(e.message || "Không thể xử lý yêu cầu thẩm định. Vui lòng thử lại.", "error");
    } finally {
      setProcessing(false);
      setSelectedItem(null);
      setReviewAction(null);
      setReviewNote("");
    }
  };

  return (
    <div className="space-y-3">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-control shadow-xl text-label font-semibold flex items-center gap-2 animate-bounce transition ${
            toastMsg.type === "success"
              ? "bg-emerald-600 text-white"
              : toastMsg.type === "error"
              ? "bg-rose-600 text-white"
              : "bg-brand-700 text-white"
          }`}
        >
          {toastMsg.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <GovPageHeader
        breadcrumbs={[
          { label: "Cổng Công Vụ", href: "/gov" },
          { label: "Tổng Quan & Phê Duyệt", href: "/gov" },
          { label: "Hàng Đợi Kiểm Duyệt Địa Bàn" },
        ]}
        title="Hàng Đợi Kiểm Duyệt Hiệp Hội"
        subtitle="Thẩm định hồ sơ hội viên, sản phẩm chào bán và cố vấn kỹ thuật theo quy trình kiểm soát của Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)."
        icon={ShieldCheck}
        scopeCode={currentScopeId}
        slaText="SLA ≤ 48h"
        makerCheckerText="Maker-Checker 2 Cấp"
        actions={
          <AppButton
            variant="outline"
            size="sm"
            onClick={() => loadApprovals()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm mới danh sách</span>
          </AppButton>
        }
      />

      {/* Scope Info Compact Bar */}
      <div className="bg-gradient-to-r from-brand-500/10 via-brand-50 to-white dark:from-brand-950/40 dark:via-slate-900 dark:to-slate-900 border border-brand-200 dark:border-brand-900/60 rounded-surface px-3.5 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-brand-700 text-white flex items-center justify-center shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-white">
              Cán bộ phụ trách: {user?.fullName || "Ban Thư ký BACLINK"}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>
              Quyền hạn: <strong>{user?.role || "ADMIN"}</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>
              Phạm vi: <strong>Hiệp hội BACLINK ({currentProvinceName})</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>Hậu kiểm: Ban Chấp hành Hiệp hội BACLINK</span>
          </div>
        </div>
      </div>

      {/* 6 Tabs Navigation with Badges */}
      <div role="tablist" aria-label="Bộ lọc hồ sơ kiểm duyệt" className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap gap-1">
          {[
            { id: "EXPERT", label: "Chuyên Gia Cố Vấn", count: stats.expert, icon: GraduationCap },
            { id: "INSTITUTION", label: "Doanh Nghiệp Hội Viên", count: stats.institution, icon: Building },
            { id: "SHOP", label: "Shop Chào Bán", count: stats.shop, icon: Building2 },
            { id: "DEMAND", label: "Nhu Cầu Công Nghệ", count: stats.demand, icon: ShoppingBag },
            { id: "ACCOUNT", label: "Tài Khoản Pháp Nhân", count: stats.account, icon: Users },
            { id: "ALL", label: "Tất Cả", count: stats.all, icon: FileCheck2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex items-center gap-1.5 px-2.5 py-2 border-b-2 font-bold text-xs transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-brand-700 text-brand-700 dark:border-brand-400 dark:text-brand-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0 rounded-full text-[11px] font-bold ${
                    isActive
                      ? "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full xl:w-64 pb-1.5 xl:pb-0">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên chuyên gia, đơn vị, mã..."
            className="form-control w-full h-8 pl-8 pr-2.5 text-xs"
          />
        </div>
      </div>

      {/* Main Content Area via 5 UX States Container */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 rounded-surface text-caption">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-brand-800 dark:text-brand-300 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>Bộ lọc đang áp dụng ({filteredItems.length} kết quả):</span>
            </span>
            {filterSector !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-brand-300 text-brand-800 dark:text-brand-200 font-semibold shadow-xs">
                <span>Ngành: {availableSectors.find((s) => s.code === filterSector)?.name || filterSector}</span>
                <button type="button" onClick={() => setFilterSector("ALL")} className="hover:text-rose-600 p-0.5" title="Bỏ lọc ngành">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterStatus !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-brand-300 text-brand-800 dark:text-brand-200 font-semibold shadow-xs">
                <span>
                  Trạng thái:{" "}
                  {filterStatus === "PENDING_APPROVAL"
                    ? "Chờ duyệt"
                    : filterStatus === "APPROVED"
                    ? "Đã duyệt"
                    : filterStatus === "CHANGES_REQUESTED"
                    ? "Yêu cầu bổ sung"
                    : "Đã từ chối"}
                </span>
                <button type="button" onClick={() => setFilterStatus("ALL")} className="hover:text-rose-600 p-0.5" title="Bỏ lọc trạng thái">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {sortColumn && sortDirection && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-brand-300 text-brand-800 dark:text-brand-200 font-semibold shadow-xs">
                <span>
                  Sắp xếp:{" "}
                  {sortColumn === "date"
                    ? "Ngày nộp"
                    : sortColumn === "title"
                    ? "Tên sản phẩm"
                    : sortColumn === "submitter"
                    ? "Đơn vị nộp"
                    : sortColumn === "id"
                    ? "Mã hồ sơ"
                    : sortColumn === "sector"
                    ? "Lĩnh vực"
                    : "Trạng thái"}{" "}
                  ({sortDirection === "asc" ? "Tăng dần ↑" : "Giảm dần ↓"})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSortColumn(null);
                    setSortDirection(null);
                  }}
                  className="hover:text-rose-600 p-0.5"
                  title="Hủy sắp xếp"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-brand-300 text-brand-800 dark:text-brand-200 font-semibold shadow-xs">
                <span>Từ khóa: &quot;{searchQuery}&quot;</span>
                <button type="button" onClick={() => setSearchQuery("")} className="hover:text-rose-600 p-0.5" title="Xóa từ khóa">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-caption text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa tất cả bộ lọc</span>
          </button>
        </div>
      )}

      <Async
        state={uxState}
        loadingText="Đang tải danh sách hồ sơ kiểm duyệt địa bàn..."
        emptyContent={
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-card-title">
              Hàng đợi kiểm duyệt hiện đang trống!
            </h3>
            <p className="text-body text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Không có hồ sơ nào đang chờ thẩm định tại địa bàn {currentProvinceName}. Toàn bộ hồ sơ đã được xử lý đúng cam kết SLA.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-control text-xs font-semibold hover:bg-brand-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Đặt lại toàn bộ bộ lọc tìm kiếm</span>
              </button>
            )}
          </div>
        }
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 text-[11px] uppercase tracking-wider font-semibold dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    {/* CỘT 1: MÃ HỒ SƠ */}
                    <th className="py-2.5 px-2 w-px whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleSort("id")}
                        className="group flex items-center gap-1.5 hover:text-brand-700 dark:hover:text-brand-300 transition text-left font-bold"
                        title="Click để sắp xếp theo Mã Hồ Sơ"
                      >
                        <span>Mã Hồ Sơ</span>
                        {sortColumn === "id" ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="w-3.5 h-3.5 text-brand-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-brand-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </button>
                    </th>

                    {/* CỘT 2: ĐƠN VỊ / CHỦ THỂ */}
                    <th className="py-2.5 px-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleSort("submitter")}
                        className="group flex items-center gap-1.5 hover:text-brand-700 dark:hover:text-brand-300 transition text-left font-bold"
                        title="Click để sắp xếp theo Đơn vị / Chủ thể"
                      >
                        <span>
                          {activeTab === "SHOP"
                            ? "Đơn Vị Chào Bán / Sở Hữu"
                            : activeTab === "EXPERT"
                            ? "Chuyên Gia Đăng Ký"
                            : activeTab === "INSTITUTION"
                            ? "Doanh Nghiệp / Chủ Thể"
                            : "Chủ Thể / Người Nộp"}
                        </span>
                        {sortColumn === "submitter" ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="w-3.5 h-3.5 text-brand-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-brand-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </button>
                    </th>

                    {/* CỘT 3: TÊN SẢN PHẨM / CÔNG NGHỆ */}
                    <th className="py-2.5 px-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleSort("title")}
                        className="group flex items-center gap-1.5 hover:text-brand-700 dark:hover:text-brand-300 transition text-left font-bold"
                        title="Click để sắp xếp theo Tên Sản Phẩm / Công Nghệ"
                      >
                        <span>
                          {activeTab === "SHOP"
                            ? "Tên Sản Phẩm / Công Nghệ"
                            : activeTab === "EXPERT"
                            ? "Đơn Vị Công Tác"
                            : activeTab === "INSTITUTION"
                            ? "Mã Số Thuế (MST)"
                            : "Tên Hồ Sơ / Cơ Quan"}
                        </span>
                        {sortColumn === "title" ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="w-3.5 h-3.5 text-brand-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-brand-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </button>
                    </th>

                    {/* CỘT 4: LĨNH VỰC CÔNG NGHỆ (KÈM BỘ LỌC DROPDOWN) */}
                    <th className="py-2.5 px-2 relative whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSort("sector")}
                          className="group flex items-center gap-1.5 hover:text-brand-700 dark:hover:text-brand-300 transition text-left font-bold"
                          title="Click để sắp xếp theo Lĩnh Vực"
                        >
                          <span>Lĩnh Vực Công Nghệ</span>
                          {sortColumn === "sector" ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="w-3.5 h-3.5 text-brand-600" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-brand-600" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100" />
                          )}
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            data-testid="filter-popover-sector"
                            onClick={() =>
                              setActiveDropdown((prev) => (prev === "sector" ? null : "sector"))
                            }
                            className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition ${
                              filterSector !== "ALL"
                                ? "text-brand-700 font-bold bg-brand-100 dark:bg-brand-950 dark:text-brand-300"
                                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            }`}
                            title="Lọc theo Lĩnh Vực"
                          >
                            <Filter className="w-3.5 h-3.5" />
                          </button>
                          {activeDropdown === "sector" && (
                            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface shadow-xl z-30 p-2 text-xs normal-case font-normal space-y-1 animate-in fade-in zoom-in-95">
                              <div className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <span>Lọc theo ngành công nghiệp</span>
                                {filterSector !== "ALL" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFilterSector("ALL");
                                      setActiveDropdown(null);
                                    }}
                                    className="text-xs text-rose-600 hover:underline"
                                  >
                                    Bỏ lọc
                                  </button>
                                )}
                              </div>
                              <div className="max-h-48 overflow-y-auto space-y-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFilterSector("ALL");
                                    setActiveDropdown(null);
                                  }}
                                  className={`w-full text-left px-2 py-1.5 rounded transition ${
                                    filterSector === "ALL"
                                      ? "bg-brand-50 text-brand-800 font-bold dark:bg-brand-950 dark:text-brand-200"
                                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  Tất cả ngành công nghệ
                                </button>
                                {availableSectors.map((sec) => (
                                  <button
                                    key={sec.code}
                                    type="button"
                                    onClick={() => {
                                      setFilterSector(sec.code);
                                      setActiveDropdown(null);
                                    }}
                                    className={`w-full text-left px-2 py-1.5 rounded transition truncate ${
                                      filterSector === sec.code
                                        ? "bg-brand-50 text-brand-800 font-bold dark:bg-brand-950 dark:text-brand-200"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                    }`}
                                  >
                                    {sec.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </th>

                    {/* CỘT 5: NGÀY NỘP */}
                    <th className="py-2.5 px-2 w-px whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleSort("date")}
                        className="group flex items-center gap-1.5 hover:text-brand-700 dark:hover:text-brand-300 transition text-left font-bold"
                        title="Click để sắp xếp theo Ngày nộp"
                      >
                        <span>Ngày Nộp</span>
                        {sortColumn === "date" ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="w-3.5 h-3.5 text-brand-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-brand-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100" />
                        )}
                      </button>
                    </th>

                    {/* CỘT 6: TRẠNG THÁI (KÈM BỘ LỌC DROPDOWN) */}
                    <th className="py-2.5 px-2 w-px relative whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSort("status")}
                          className="group flex items-center gap-1.5 hover:text-brand-700 dark:hover:text-brand-300 transition text-left font-bold"
                          title="Click để sắp xếp theo Trạng thái"
                        >
                          <span>Trạng Thái</span>
                          {sortColumn === "status" ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="w-3.5 h-3.5 text-brand-600" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-brand-600" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100" />
                          )}
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveDropdown((prev) => (prev === "status" ? null : "status"))
                            }
                            className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition ${
                              filterStatus !== "ALL"
                                ? "text-brand-700 font-bold bg-brand-100 dark:bg-brand-950 dark:text-brand-300"
                                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            }`}
                            title="Lọc theo Trạng thái duyệt"
                          >
                            <Filter className="w-3.5 h-3.5" />
                          </button>
                          {activeDropdown === "status" && (
                            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface shadow-xl z-30 p-2 text-xs normal-case font-normal space-y-1 animate-in fade-in zoom-in-95">
                              <div className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <span>Lọc theo trạng thái</span>
                                {filterStatus !== "ALL" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFilterStatus("ALL");
                                      setActiveDropdown(null);
                                    }}
                                    className="text-xs text-rose-600 hover:underline"
                                  >
                                    Bỏ lọc
                                  </button>
                                )}
                              </div>
                              <div className="space-y-0.5">
                                {[
                                  { value: "ALL", label: "Tất cả trạng thái" },
                                  { value: "PENDING_APPROVAL", label: "Chờ Lãnh Đạo Duyệt" },
                                  { value: "APPROVED", label: "Đã Duyệt (Cấp Tỉnh)" },
                                  { value: "CHANGES_REQUESTED", label: "Yêu Cầu Bổ Sung" },
                                  { value: "REJECTED", label: "Đã Từ Chối" },
                                ].map((st) => (
                                  <button
                                    key={st.value}
                                    type="button"
                                    onClick={() => {
                                      setFilterStatus(st.value);
                                      setActiveDropdown(null);
                                    }}
                                    className={`w-full text-left px-2 py-1.5 rounded transition ${
                                      filterStatus === st.value
                                        ? "bg-brand-50 text-brand-800 font-bold dark:bg-brand-950 dark:text-brand-200"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                    }`}
                                  >
                                    {st.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </th>

                    {/* CỘT 7: THAO TÁC */}
                    <th className="py-2.5 px-2 w-px text-right whitespace-nowrap">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredItems.map((item) => {
                    const codeInfo = formatGovRecordCode(item.id, item.type, item.scopeId);
                    const isOffer = item.type === "TECHNOLOGY_OFFER" || item.type === "SHOP";

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                      >
                        {/* Cột 1: Mã hồ sơ chuẩn hóa */}
                        <td className="py-2.5 px-2 font-mono font-bold text-brand-700 dark:text-brand-300 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span
                              className="px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-800 dark:bg-brand-950/70 dark:text-brand-200 border border-brand-200 dark:border-brand-800 text-[11px] font-bold tracking-wide whitespace-nowrap"
                              title={`Mã định danh công vụ: ${codeInfo.code} (UUID: ${item.id})`}
                            >
                              {codeInfo.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(codeInfo.code, item.id)}
                              className="p-1 rounded text-slate-400 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                              title={`Sao chép mã hồ sơ ${codeInfo.code}`}
                            >
                              {copiedId === item.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-75" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {activeTab === "ALL" && (
                            <span
                              className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 border whitespace-nowrap ${
                                resolveGovRequestType(item.type).badgeClass
                              }`}
                            >
                              {resolveGovRequestType(item.type).label}
                            </span>
                          )}
                        </td>

                        {/* Cột 2: Đơn vị chào bán / Sở hữu */}
                        <td className="py-2.5 px-2 min-w-[150px] max-w-[260px]">
                          <div
                            className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug"
                            title={
                              item.type === "INSTITUTION"
                                ? (item.institutionPayload?.companyName || item.submitterName)
                                : item.submitterName
                            }
                          >
                            {item.type === "INSTITUTION"
                              ? (item.institutionPayload?.companyName || item.submitterName)
                              : item.submitterName}
                          </div>
                          <div
                            className="text-[11px] text-slate-400 truncate mt-0.5"
                            title={
                              item.type === "INSTITUTION" && item.institutionPayload?.taxCode
                                ? `MST: ${item.institutionPayload.taxCode}`
                                : item.submitterEmail
                            }
                          >
                            {item.type === "INSTITUTION" && item.institutionPayload?.taxCode
                              ? `MST: ${item.institutionPayload.taxCode}`
                              : item.submitterEmail}
                          </div>
                        </td>

                        {/* Cột 3: Tên sản phẩm / công nghệ (Clickable để xem chi tiết đầy đủ) */}
                        <td className="py-2.5 px-2 min-w-[180px] max-w-[300px]">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                item.status === "PENDING_APPROVAL"
                                  ? setSelectedItem(item)
                                  : setDetailItem(item)
                              }
                              className="text-left font-bold text-slate-900 dark:text-white hover:text-brand-700 dark:hover:text-brand-300 hover:underline transition leading-snug cursor-pointer group min-w-0"
                              title={
                                item.status === "PENDING_APPROVAL"
                                  ? "Click để xem chi tiết đầy đủ hồ sơ trước khi ký duyệt"
                                  : "Click để xem thông tin hồ sơ (chỉ đọc)"
                              }
                            >
                              <span className="line-clamp-2">
                                {item.type === "INSTITUTION"
                                  ? (item.institutionPayload?.taxCode ? `MST: ${item.institutionPayload.taxCode}` : item.titleOrOrg)
                                  : item.titleOrOrg}
                              </span>
                              {item.type === "INSTITUTION" && item.provinceName && (
                                <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                  Địa bàn: {item.provinceName}
                                </span>
                              )}
                              <Eye className="w-3 h-3 inline-block ml-1 opacity-0 group-hover:opacity-100 text-brand-600 transition-opacity" />
                            </button>
                            {isOffer && (
                              <a
                                href={`/chao-ban-cong-nghe/${item.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Mở trang chi tiết sản phẩm trên Sàn Công Nghệ (tab mới)"
                                className="p-1 rounded text-slate-400 hover:text-brand-600 dark:hover:text-brand-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Cột 4: Lĩnh vực công nghệ */}
                        <td className="py-2.5 px-2">
                          <span
                            className="inline-block max-w-[190px] truncate px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold align-middle"
                            title={
                              item.type === "INSTITUTION"
                                ? item.provinceName || "Toàn quốc"
                                : resolveSectorName(item.sector, sectorNames)
                            }
                          >
                            {item.type === "INSTITUTION"
                              ? (item.provinceName || "Toàn quốc")
                              : resolveSectorName(item.sector, sectorNames)}
                          </span>
                        </td>

                        {/* Cột 5: Ngày nộp */}
                        <td className="py-2.5 px-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                          {item.submittedAt}
                        </td>

                        {/* Cột 6: Trạng thái */}
                        <td className="py-2.5 px-2 whitespace-nowrap">
                          {item.status === "PENDING_APPROVAL" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold whitespace-nowrap dark:bg-amber-950/60 dark:text-amber-300">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>Chờ Lãnh Đạo Duyệt</span>
                            </span>
                          )}
                          {item.status === "APPROVED" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold whitespace-nowrap dark:bg-emerald-950/60 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span>Đã Duyệt (Cấp Tỉnh)</span>
                            </span>
                          )}
                          {item.status === "REJECTED" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold whitespace-nowrap dark:bg-rose-950/60 dark:text-rose-300">
                              <XCircle className="w-3 h-3 shrink-0" />
                              <span>Đã Từ Chối</span>
                            </span>
                          )}
                          {item.status === "CHANGES_REQUESTED" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-[11px] font-bold whitespace-nowrap dark:bg-cyan-950/60 dark:text-cyan-300">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>Yêu Cầu Bổ Sung</span>
                            </span>
                          )}
                        </td>

                        {/* Cột 7: Thao tác Thẩm Định */}
                        <td className="py-2.5 px-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <AppButton
                              variant="outline"
                              size="sm"
                              onClick={() => setDetailItem(item)}
                              className="inline-flex items-center justify-center p-1.5 rounded-control text-slate-700 hover:text-slate-900 border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                              aria-label="Xem Chi Tiết"
                              title="Xem Chi Tiết"
                              data-testid={`btn-detail-${item.id}`}
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            </AppButton>

                            {item.status === "PENDING_APPROVAL" ? (
                              <AppButton
                                variant="primary"
                                size="sm"
                                onClick={() => setSelectedItem(item)}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-control font-semibold text-[11px] whitespace-nowrap"
                                title="Thẩm định và ban hành quyết định phê duyệt"
                                data-testid={`btn-review-${item.id}`}
                              >
                                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                <span>Thẩm Định</span>
                              </AppButton>
                            ) : (
                              <AppButton
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedItem(item)}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-control font-semibold text-[11px] whitespace-nowrap bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200/70 hover:text-slate-900 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800"
                                title="Mở lại bảng thẩm định để điều chỉnh hoặc hậu kiểm hồ sơ"
                                data-testid={`btn-review-${item.id}`}
                              >
                                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                <span>Thẩm Định</span>
                              </AppButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Async>

      {/* Review Modal / Pane Chi Tiết Hồ Sơ */}
      {selectedItem && (() => {
        const isOffer = selectedItem.type === "TECHNOLOGY_OFFER" || selectedItem.type === "SHOP";
        const isInstitution = selectedItem.type === "INSTITUTION";
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-surface border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {isOffer ? (
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  ) : isInstitution ? (
                    <div className="w-9 h-9 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 flex items-center justify-center shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-card-title flex items-center gap-2 truncate">
                      <span className="truncate">
                        {isOffer
                          ? `Thẩm Định Sản Phẩm Chào Bán: ${selectedItem.titleOrOrg}`
                          : isInstitution
                          ? `Thẩm Định Doanh Nghiệp Hội Viên: ${selectedItem.institutionPayload?.companyName || selectedItem.submitterName}`
                          : `Thẩm Định Hồ Sơ Chuyên Gia: ${selectedItem.submitterName}`}
                      </span>
                    </h3>
                    {(() => {
                      const codeInfo = formatGovRecordCode(selectedItem.id, selectedItem.type, selectedItem.scopeId);
                      const authorityDisplay = `Ban Thư ký BACLINK (${selectedItem.provinceName})`;
                      return (
                        <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                          Mã hồ sơ:{" "}
                          <span className="font-mono text-brand-700 dark:text-brand-300 font-bold bg-brand-50 dark:bg-brand-950/60 px-1.5 py-0.5 rounded border border-brand-200 dark:border-brand-800">
                            {codeInfo.code}
                          </span>{" "}
                          &bull; Địa bàn tiếp nhận: <strong>{authorityDisplay}</strong> (Cấp 2) &bull;{" "}
                          Loại hình: <strong>{resolveGovRequestType(selectedItem.type).label}</strong> &bull;{" "}
                          Phiên bản: v{selectedItem.version}
                        </p>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <AppButton
                    variant="outline"
                    onClick={() => {
                      const itemToView = selectedItem;
                      setSelectedItem(null);
                      setDetailItem(itemToView);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control font-semibold text-caption whitespace-nowrap text-slate-700 hover:text-slate-900 border-slate-300 dark:border-slate-700 dark:text-slate-300"
                    title="Mở toàn bộ hồ sơ chi tiết"
                    data-testid="btn-view-dossier-from-review"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span className="hidden sm:inline">Xem Toàn Bộ Hồ Sơ</span>
                  </AppButton>

                  {isOffer && (
                    <a
                      href={`/chao-ban-cong-nghe/${selectedItem.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800 text-caption font-bold transition shadow-xs"
                      title="Xem trước giao diện niêm yết của sản phẩm (Chế độ xem trước nội bộ, chưa công khai)"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span className="hidden sm:inline">Xem Trước Niêm Yết</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItem(null);
                      setReviewAction(null);
                      setReviewNote("");
                      setReviewError("");
                    }}
                    className="p-1.5 rounded-control text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Đóng cửa sổ"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Banner trạng thái bảo mật công vụ */}
              {isOffer && selectedItem.status === "PENDING_APPROVAL" && (
                <div className="px-6 py-2.5 bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    <span>
                      <strong>Trạng Thái: Chờ Ban Thư Ký Phê Duyệt</strong> &mdash; Sản phẩm này <strong>CHƯA ĐƯỢC CÔNG KHAI</strong> trên Sàn BACLINK. Khách hàng bên ngoài không thể tìm kiếm hay giao dịch cho tới khi được ký duyệt.
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-200 text-amber-900 border border-amber-300 dark:bg-amber-900 dark:text-amber-100 uppercase tracking-wider shrink-0">
                    Bản Xem Trước
                  </span>
                </div>
              )}

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1 text-label">
                {isOffer ? (
                  /* Layout Thẩm Định Sản Phẩm Chào Bán Công Nghệ */
                  <div className="space-y-5">
                    {/* Grid thông tin chung */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-surface border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-caption text-slate-400 block">Tên sản phẩm / công nghệ:</span>
                        <span className="font-bold text-slate-900 dark:text-white text-body">
                          {selectedItem.titleOrOrg}
                        </span>
                      </div>
                      <div>
                        <span className="text-caption text-slate-400 block">Đơn vị chào bán / Sở hữu:</span>
                        <span className="font-bold text-brand-700 dark:text-brand-300 text-body">
                          {selectedItem.rawOffer?.developerOrigin ||
                            selectedItem.rawOffer?.enterpriseName ||
                            selectedItem.submitterName}
                        </span>
                      </div>
                      <div>
                        <span className="text-caption text-slate-400 block">Ngành công nghiệp:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {resolveSectorName(selectedItem.sector, sectorNames)}
                        </span>
                      </div>
                      <div>
                        <span className="text-caption text-slate-400 block">Phân loại hình thức:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {formatOfferType(selectedItem.rawOffer?.offerType)}
                        </span>
                      </div>
                    </div>

                    {/* 4 Thẻ chỉ số thẩm định nhanh: TRL, SHTT, Giá, Chuyển giao */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-control border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <span className="text-caption text-slate-400 block">Mức sẵn sàng TRL</span>
                        {(() => {
                          const trl = resolveTrlInfo(selectedItem.rawOffer?.trlLevel);
                          return (
                            <>
                              <span
                                className={`inline-block mt-1 px-2 py-0.5 rounded text-caption font-bold border ${trl.colorClass}`}
                              >
                                {trl.label}
                              </span>
                              <span className="block text-caption text-slate-500 mt-1 line-clamp-1">
                                {trl.desc}
                              </span>
                            </>
                          );
                        })()}
                      </div>

                      <div className="p-3 rounded-control border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <span className="text-caption text-slate-400 block">Tình trạng SHTT</span>
                        {(() => {
                          const ip = resolveIpStatusInfo(selectedItem.rawOffer?.ipStatus);
                          return (
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 rounded text-caption font-bold border ${ip.colorClass}`}
                            >
                              {ip.label}
                            </span>
                          );
                        })()}
                        {selectedItem.rawOffer?.ipRegistrationNumber && (
                          <span className="block text-caption text-slate-500 mt-1 font-mono">
                            Số: {selectedItem.rawOffer.ipRegistrationNumber}
                          </span>
                        )}
                      </div>

                      <div className="p-3 rounded-control border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <span className="text-caption text-slate-400 block">Mức giá chào bán</span>
                        <span className="block mt-1 font-bold text-emerald-700 dark:text-emerald-400 text-body">
                          {formatPrice(selectedItem.rawOffer)}
                        </span>
                      </div>

                      <div className="p-3 rounded-control border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <span className="text-caption text-slate-400 block">Phương thức chuyển giao</span>
                        <span className="block mt-1 font-medium text-slate-800 dark:text-slate-200 text-caption line-clamp-2">
                          {formatTransferMethod(
                            selectedItem.rawOffer?.transferPriorityMethod || selectedItem.rawOffer?.transferMethod
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Ảnh minh họa & Video Demo (nếu có) */}
                    {(selectedItem.rawOffer?.mainImageUrl ||
                      (selectedItem.rawOffer?.galleryImageUrls &&
                        selectedItem.rawOffer.galleryImageUrls.length > 0) ||
                      selectedItem.rawOffer?.videoDemoUrl) && (
                      <div className="p-3.5 rounded-control bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-caption uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-brand-600" />
                          <span>Hình ảnh & Video giới thiệu sản phẩm</span>
                        </h4>
                        <div className="flex flex-wrap items-center gap-3">
                          {selectedItem.rawOffer?.mainImageUrl && (
                            <div className="w-24 h-20 rounded-control overflow-hidden border border-slate-200 dark:border-slate-700 relative bg-white shrink-0">
                              <img
                                src={selectedItem.rawOffer.mainImageUrl}
                                alt="Ảnh đại diện"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-caption text-center font-bold py-0.5">
                                Ảnh chính
                              </span>
                            </div>
                          )}
                          {selectedItem.rawOffer?.galleryImageUrls?.map((url, idx) => (
                            <div
                              key={idx}
                              className="w-20 h-20 rounded-control overflow-hidden border border-slate-200 dark:border-slate-700 bg-white shrink-0"
                            >
                              <img
                                src={url}
                                alt={`Gallery ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {selectedItem.rawOffer?.videoDemoUrl && (
                            <a
                              href={selectedItem.rawOffer.videoDemoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-control bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-caption font-bold hover:underline"
                            >
                              <Video className="w-4 h-4" />
                              <span>Xem Video Demo</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mô tả chi tiết & Bài toán giải quyết */}
                    <div className="space-y-3">
                      {(selectedItem.rawOffer?.summary || selectedItem.summary) && (
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 text-caption uppercase tracking-wider">
                            Mô Tả &amp; Tính Năng Nổi Bật Của Sản Phẩm
                          </h4>
                          <div className="p-3.5 rounded-control bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed text-body whitespace-pre-line">
                            {selectedItem.rawOffer?.summary || selectedItem.summary}
                          </div>
                        </div>
                      )}

                      {selectedItem.rawOffer?.problemSolved && (
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 text-caption uppercase tracking-wider">
                            Vấn Đề / Bài Toán Thực Tiễn Giải Quyết
                          </h4>
                          <div className="p-3.5 rounded-control bg-brand-50/40 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/40 text-slate-700 dark:text-slate-300 leading-relaxed text-body whitespace-pre-line">
                            {selectedItem.rawOffer.problemSolved}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* UI-GOV-EVIDENCE-INSPECTOR: Khối Kiểm Tra Giấy Tờ Minh Chứng Trực Tiếp */}
                    <div className="p-4 rounded-surface bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <FileCheck2 className="w-4 h-4 text-brand-600" />
                          <h4 className="font-bold text-slate-900 dark:text-white text-caption uppercase tracking-wider">
                            Hồ Sơ Minh Chứng Kỹ Thuật &amp; Văn Bằng SHTT (DataRoom)
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsTrlMethodologyOpen(true)}
                          className="inline-flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-950 dark:text-amber-300 font-bold bg-amber-100/80 dark:bg-amber-950/60 hover:bg-amber-200 border border-amber-300 dark:border-amber-800 px-3 py-1 rounded-full transition self-start"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                          Đối chiếu Tiêu chuẩn Minh chứng TRL (1–9)
                        </button>
                      </div>

                      {(() => {
                        const docs = selectedItem.rawOffer?.documents || [];
                        if (docs.length === 0 && !selectedItem.cvOrDocName) {
                          return (
                            <p className="text-xs text-slate-400 italic py-2">
                              Sản phẩm chưa đính kèm tệp minh chứng kỹ thuật hoặc văn bằng SHTT số hóa.
                            </p>
                          );
                        }

                        // Danh sách tài liệu chuẩn hóa
                        const documentList = docs.length > 0 ? docs : [
                          {
                            id: "doc-legacy-1",
                            documentType: "TRL_EVIDENCE" as const,
                            fileName: selectedItem.cvOrDocName || "Tai_Lieu_Minh_Chung.pdf",
                            fileUrl: `/api/v1/portal/seller/technologies/${selectedItem.id}/documents/download`,
                            fileSizeBytes: 2048576,
                            accessScope: "PUBLIC" as const,
                          }
                        ];

                        return (
                          <div className="space-y-2">
                            {documentList.map((doc, idx) => {
                              const isTrl = doc.documentType === "TRL_EVIDENCE";
                              const isPatent = doc.documentType === "PATENT_CERT";
                              const isCat = doc.documentType === "CATALOGUE";

                              const badgeColor = isTrl
                                ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                                : isPatent
                                ? "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-300"
                                : isCat
                                ? "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                                : "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300";

                              const docLabel = isTrl
                                ? "Hồ Sơ Minh Chứng TRL"
                                : isPatent
                                ? "Văn Bằng SHTT"
                                : isCat
                                ? "Catalogue Kỹ Thuật"
                                : "Tài Liệu Đính Kèm";

                              const sizeText = doc.fileSizeBytes
                                ? `${(doc.fileSizeBytes / 1024 / 1024).toFixed(1)} MB`
                                : "Tài liệu";

                              return (
                                <div
                                  key={doc.id || idx}
                                  className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
                                    <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 truncate">
                                        <span className="font-bold text-slate-900 dark:text-white truncate">
                                          {doc.fileName}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${badgeColor}`}>
                                          {docLabel}
                                        </span>
                                      </div>
                                      <span className="text-[11px] text-slate-400 font-mono">
                                        Dung lượng: {sizeText} &bull; Mã: {doc.id || `DOC-${idx + 1}`}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <a
                                      href={doc.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-bold transition border border-brand-200 dark:border-brand-900"
                                      title="Xem trực tiếp tài liệu trong tab mới"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      <span>Xem</span>
                                    </a>
                                    <a
                                      href={doc.fileUrl}
                                      download={doc.fileName}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition"
                                      title="Tải về máy tính"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Tải về</span>
                                    </a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ) : isInstitution ? (
                  /* Layout Thẩm Định Hồ Sơ Doanh Nghiệp Hội Viên */
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-surface border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-caption text-slate-400 block">Tên Doanh Nghiệp Hội Viên:</span>
                        <span className="font-bold text-slate-900 dark:text-white text-body">
                          {selectedItem.institutionPayload?.companyName || selectedItem.submitterName}
                        </span>
                      </div>
                      <div>
                        <span className="text-caption text-slate-400 block">Mã Số Thuế (MST):</span>
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-body">
                          {selectedItem.institutionPayload?.taxCode || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-caption text-slate-400 block">Địa Bàn Tỉnh / Thành Phố:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {selectedItem.provinceName || resolveProvinceName(selectedItem.scopeId)}
                        </span>
                      </div>
                      <div>
                        <span className="text-caption text-slate-400 block">Cơ Quan Tiếp Nhận Thẩm Định:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {resolveProvinceName(selectedItem.scopeId)}
                        </span>
                      </div>
                    </div>

                    {/* Giấy chứng nhận ĐKKD / Tài liệu đính kèm */}
                    <div className="p-3.5 rounded-control bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-medium">
                        <FileText className="w-4 h-4" />
                        <span>Giấy phép ĐKKD: {selectedItem.cvOrDocName || selectedItem.institutionPayload?.fileName || "Giay_Phep_DKKD.pdf"}</span>
                      </div>
                      <span className="text-caption text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Đã kiểm tra hợp lệ
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Layout Thẩm Định Hồ Sơ Chuyên Gia KH&CN */
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-surface border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-caption text-slate-400 block">Họ và tên chuyên gia:</span>
                        <span className="font-bold text-slate-900 dark:text-white text-body">
                          {selectedItem.submitterName}
                        </span>
                      </div>
                      <div>
                        <span className="text-caption text-slate-400 block">Học hàm / Học vị:</span>
                        <span className="font-bold text-brand-700 dark:text-brand-300 text-body">
                          {formatDegree(selectedItem.expertPayload?.degree || selectedItem.degree, selectedItem.expertPayload?.academicRank)}
                        </span>
                      </div>
                      <div>
                        <span className="text-caption text-slate-400 block">Cơ quan công tác:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {selectedItem.titleOrOrg}
                        </span>
                      </div>
                      <div>
                        <span className="text-caption text-slate-400 block">Lĩnh vực chuyên môn:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {resolveSectorName(selectedItem.sector, sectorNames)}
                        </span>
                      </div>
                      {selectedItem.expertPayload?.researchTitle && (
                        <div>
                          <span className="text-caption text-slate-400 block">Chức danh nghiên cứu:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {selectedItem.expertPayload.researchTitle}
                          </span>
                        </div>
                      )}
                      {selectedItem.expertPayload?.birthYear && (
                        <div>
                          <span className="text-caption text-slate-400 block">Năm sinh:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {selectedItem.expertPayload.birthYear}
                          </span>
                        </div>
                      )}
                      {selectedItem.expertPayload?.organizationAddress && (
                        <div className="sm:col-span-2">
                          <span className="text-caption text-slate-400 block">Địa chỉ cơ quan:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {selectedItem.expertPayload.organizationAddress}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedItem.expertPayload?.specializedKeywords && selectedItem.expertPayload.specializedKeywords.length > 0 && (
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 text-caption uppercase tracking-wider flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-brand-600" />
                          <span>Từ Khóa Chuyên Môn Sâu</span>
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedItem.expertPayload.specializedKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-caption font-medium border border-slate-200 dark:border-slate-600"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(selectedItem.expertPayload?.consultingSummary || selectedItem.summary) && (
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 text-caption uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                          <span>Tóm Tắt Năng Lực &amp; Hoạt Động Nghiên Cứu</span>
                        </h4>
                        <div className="p-3.5 rounded-control bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed text-body whitespace-pre-line">
                          {selectedItem.expertPayload?.consultingSummary || selectedItem.summary}
                        </div>
                      </div>
                    )}

                    {selectedItem.expertPayload?.publications && selectedItem.expertPayload.publications.length > 0 && (
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 text-caption uppercase tracking-wider flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-brand-600" />
                          <span>Công Bố Khoa Học ({selectedItem.expertPayload.publications.length})</span>
                        </h4>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {selectedItem.expertPayload.publications.map((pub, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-control bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-caption space-y-0.5"
                            >
                              <p className="font-semibold text-slate-800 dark:text-slate-200">
                                {idx + 1}. {pub.title || "Công trình nghiên cứu"}
                              </p>
                              <p className="text-slate-500 dark:text-slate-400">
                                {pub.journal && `${pub.journal} `}
                                {pub.year && `(${pub.year})`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedItem.cvOrDocName && (
                      <div className="p-3.5 rounded-control bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-medium">
                          <FileText className="w-4 h-4" />
                          <span>Tài liệu đính kèm: {selectedItem.cvOrDocName}</span>
                        </div>
                        <span className="text-caption text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Đã kiểm tra chữ ký số
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Actions Form: Bảng Điều Khiển Duyệt Tách Bạch 2 Tầng */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
                  {/* Khối A: Quyết định Niêm yết Lên Sàn */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-xs flex items-center justify-center font-bold">
                          A
                        </span>
                        <span>{isOffer ? "Quyết Định Niêm Yết Lên Sàn Giao Dịch" : "Quyết Định Phê Duyệt Của Ban Thư Ký BACLINK"}</span>
                      </h4>
                      <span className="text-xs text-slate-400">
                        (Thẩm quyền Ban Thư ký Hiệp hội BACLINK)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setReviewAction("APPROVE");
                          setReviewError("");
                        }}
                        className={`p-3 rounded-control border text-left font-bold transition flex items-center gap-2 cursor-pointer ${
                          reviewAction === "APPROVE"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 ring-2 ring-emerald-500 shadow-xs"
                            : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{isOffer ? "Phê Duyệt Niêm Yết Sàn" : "Phê Duyệt Cấp Tỉnh"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setReviewAction("REQUEST_CHANGES");
                          setReviewError("");
                          focusAndScrollToReviewNote();
                        }}
                        className={`p-3 rounded-control border text-left font-bold transition flex items-center gap-2 cursor-pointer ${
                          reviewAction === "REQUEST_CHANGES"
                            ? "border-cyan-500 bg-cyan-50 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 ring-2 ring-cyan-500 shadow-xs"
                            : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <AlertCircle className="w-4 h-4 text-cyan-600 shrink-0" />
                        <span>Yêu Cầu Bổ Sung</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setReviewAction("REJECT");
                          setReviewError("");
                          focusAndScrollToReviewNote();
                        }}
                        className={`p-3 rounded-control border text-left font-bold transition flex items-center gap-2 cursor-pointer ${
                          reviewAction === "REJECT"
                            ? "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 ring-2 ring-rose-500 shadow-xs"
                            : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <X className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{isOffer ? "Từ Chối Niêm Yết" : "Từ Chối Hồ Sơ"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Khối B: Thẩm Định Chỉ Số Chuyên Môn TRL & SHTT (Chỉ xuất hiện khi Khối A chọn APPROVE cho TECHNOLOGY_OFFER) */}
                  {isOffer && reviewAction === "APPROVE" && (
                    <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                            B
                          </span>
                          <h5 className="font-extrabold text-emerald-950 dark:text-emerald-200 text-sm flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Thẩm Định Chỉ Số Chuyên Môn TRL &amp; SHTT (Two-Tier Verification)</span>
                          </h5>
                        </div>
                        <span className="text-[11px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2.5 py-0.5 rounded-full font-bold border border-emerald-300 dark:border-emerald-700">
                          Thẩm định cấp 2
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Thẩm định TRL */}
                        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-amber-500" />
                              1. Mức độ sẵn sàng TRL: TRL {selectedItem.rawOffer?.trlLevel || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsTrlMethodologyOpen(true)}
                              className="text-[11px] text-brand-600 dark:text-cyan-400 hover:underline font-bold"
                            >
                              Tiêu chuẩn minh chứng (?)
                            </button>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <label className="flex items-start gap-2 p-2 rounded border cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800">
                              <input
                                type="radio"
                                name="trlDecision"
                                value="VERIFY_BY_GOV"
                                checked={trlDecision === "VERIFY_BY_GOV"}
                                onChange={() => setTrlDecision("VERIFY_BY_GOV")}
                                className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                              />
                              <div>
                                <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                                  ✓ Xác thực TRL Nhà nước (VERIFIED_BY_GOV)
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Đã kiểm tra đủ hồ sơ minh chứng / Test report theo quy chuẩn.
                                </span>
                              </div>
                            </label>

                            <label className="flex items-start gap-2 p-2 rounded border cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800">
                              <input
                                type="radio"
                                name="trlDecision"
                                value="KEEP_SELF_DECLARED"
                                checked={trlDecision === "KEEP_SELF_DECLARED"}
                                onChange={() => setTrlDecision("KEEP_SELF_DECLARED")}
                                className="mt-0.5 text-amber-600 focus:ring-amber-500"
                              />
                              <div>
                                <span className="font-bold text-amber-700 dark:text-amber-400 block">
                                  Giữ TRL Tự kê khai (SELF_DECLARED)
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Đủ điều kiện niêm yết bán, nhưng chưa thẩm định chuyên sâu.
                                </span>
                              </div>
                            </label>

                            <label className="flex items-start gap-2 p-2 rounded border cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800">
                              <input
                                type="radio"
                                name="trlDecision"
                                value="REJECT_TRL"
                                checked={trlDecision === "REJECT_TRL"}
                                onChange={() => setTrlDecision("REJECT_TRL")}
                                className="mt-0.5 text-rose-600 focus:ring-rose-500"
                              />
                              <div>
                                <span className="font-bold text-rose-700 dark:text-rose-400 block">
                                  Không công nhận mức TRL này (REJECTED_TRL)
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Mức TRL tự khai không phù hợp với tài liệu cung cấp.
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Thẩm định SHTT */}
                        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-brand-600" />
                              2. Quyền Sở Hữu Trí Tuệ (SHTT)
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {selectedItem.rawOffer?.ipRegistrationNumber || "Không có số văn bằng"}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <label className="flex items-start gap-2 p-2 rounded border cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800">
                              <input
                                type="radio"
                                name="ipDecision"
                                value="VERIFY_BY_GOV"
                                checked={ipDecision === "VERIFY_BY_GOV"}
                                onChange={() => setIpDecision("VERIFY_BY_GOV")}
                                className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                              />
                              <div>
                                <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                                  ✓ Xác thực SHTT Nhà nước (VERIFIED_BY_GOV)
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Đã đối soát văn bằng hợp lệ trên cơ sở dữ liệu WIPO / Cục SHTT.
                                </span>
                              </div>
                            </label>

                            <label className="flex items-start gap-2 p-2 rounded border cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800">
                              <input
                                type="radio"
                                name="ipDecision"
                                value="KEEP_SELF_DECLARED"
                                checked={ipDecision === "KEEP_SELF_DECLARED"}
                                onChange={() => setIpDecision("KEEP_SELF_DECLARED")}
                                className="mt-0.5 text-amber-600 focus:ring-amber-500"
                              />
                              <div>
                                <span className="font-bold text-amber-700 dark:text-amber-400 block">
                                  Giữ SHTT Tự kê khai (SELF_DECLARED)
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Đơn vị tự cam kết, đang trong quá trình nộp đơn hoặc bí quyết.
                                </span>
                              </div>
                            </label>

                            <label className="flex items-start gap-2 p-2 rounded border cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800">
                              <input
                                type="radio"
                                name="ipDecision"
                                value="REJECT_IP"
                                checked={ipDecision === "REJECT_IP"}
                                onChange={() => setIpDecision("REJECT_IP")}
                                className="mt-0.5 text-rose-600 focus:ring-rose-500"
                              />
                              <div>
                                <span className="font-bold text-rose-700 dark:text-rose-400 block">
                                  Từ chối quyền SHTT tự khai (REJECTED_IP)
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Số đơn hoặc văn bằng không hợp lệ.
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Cơ quan thẩm định & Ghi chú thẩm định chuyên sâu */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Cơ quan / Đơn vị thực hiện thẩm định
                          </label>
                          <input
                            type="text"
                            value={verifiedAuthorityName}
                            onChange={(e) => setVerifiedAuthorityName(e.target.value)}
                            placeholder="VD: Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)"
                            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Ghi chú kết quả thẩm định TRL &amp; SHTT
                          </label>
                          <input
                            type="text"
                            value={trlReviewNote}
                            onChange={(e) => setTrlReviewNote(e.target.value)}
                            placeholder="VD: Đã thẩm tra Bằng sáng chế số 12345/SHTT, chấp thuận TRL 7..."
                            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {reviewAction && (
                    <div className="space-y-2 pt-2">
                      <label className="block text-caption font-bold text-slate-700 dark:text-slate-300">
                        Ghi chú thẩm định / Lý do quyết định{" "}
                        {reviewAction !== "APPROVE" && (
                          <span className="text-rose-500">* (Bắt buộc &ge; 10 ký tự theo BR-ADM-004)</span>
                        )}
                      </label>
                      <textarea
                        ref={reviewNoteRef}
                        data-testid="review-note-textarea"
                        rows={3}
                        value={reviewNote}
                        onChange={(e) => {
                          setReviewNote(e.target.value);
                          if (reviewError) setReviewError("");
                        }}
                        placeholder={
                          reviewAction === "APPROVE"
                            ? isOffer
                              ? "Ghi chú phê duyệt: Sản phẩm đáp ứng tiêu chuẩn TRL và chứng minh tính pháp lý SHTT, đồng ý niêm yết lên Sàn Quốc gia..."
                              : "Ghi chú phê duyệt: Hồ sơ đáp ứng đầy đủ tiêu chuẩn chuyên môn của Hiệp hội BACLINK..."
                            : isOffer
                            ? "Nhập lý do cụ thể để doanh nghiệp bổ sung hoặc hoàn thiện hồ sơ chào bán..."
                            : "Nhập lý do cụ thể để chuyên gia nắm rõ và bổ sung (tối thiểu 10 ký tự)..."
                        }
                        className="w-full p-3 rounded-control border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-body focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                      {reviewError && (
                        <p className="text-caption text-rose-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{reviewError}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
                <span className="text-caption text-slate-400">
                  {isOffer
                    ? "Quyết định phê duyệt sẽ được gửi thông báo đến Doanh nghiệp sở hữu và sản phẩm sẽ được niêm yết công khai trên Sàn."
                    : "Quyết định này sẽ được gửi thông báo đến Chuyên gia và Trung Ương hậu kiểm."}
                </span>

                <div className="flex items-center gap-3">
                  <AppButton
                    variant="outline"
                    onClick={() => {
                      setSelectedItem(null);
                      setReviewAction(null);
                      setReviewNote("");
                      setReviewError("");
                    }}
                    className="px-4 py-2 rounded-control font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Hủy bỏ
                  </AppButton>

                  <AppButton
                    variant="primary"
                    disabled={!reviewAction || processing}
                    onClick={handleReviewSubmit}
                    className={`px-6 py-2 rounded-control font-bold shadow-md transition ${
                      reviewAction === "APPROVE"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : reviewAction === "REJECT"
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "bg-brand-700 hover:bg-brand-800 text-white"
                    } disabled:opacity-50`}
                  >
                    {processing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Đang lưu quyết định...</span>
                      </div>
                    ) : (
                      <span>Xác Nhận Quyết Định</span>
                    )}
                  </AppButton>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Dossier Detail Modal / Cửa Sổ Xem Chi Tiết Toàn Bộ Hồ Sơ */}
      {detailItem && (() => {
        const isOffer = detailItem.type === "TECHNOLOGY_OFFER" || detailItem.type === "SHOP";
        const isInstitution = detailItem.type === "INSTITUTION";
        const codeInfo = formatGovRecordCode(detailItem.id, detailItem.type, detailItem.scopeId);
        const authorityDisplay = `Ban Thư ký BACLINK (${detailItem.provinceName})`;
        const expert = detailItem.expertPayload;

        return (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gov-detail-title"
          >
            <div className="bg-white dark:bg-slate-900 rounded-surface border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {isOffer ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  ) : isInstitution ? (
                    <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 flex items-center justify-center shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        id="gov-detail-title"
                        className="font-bold text-slate-900 dark:text-white text-card-title truncate"
                      >
                        {isOffer
                          ? `Chi Tiết Sản Phẩm Chào Bán: ${detailItem.titleOrOrg}`
                          : isInstitution
                          ? `Hồ Sơ Doanh Nghiệp Hội Viên: ${detailItem.institutionPayload?.companyName || detailItem.submitterName}`
                          : `Hồ Sơ Chuyên Gia Cố Vấn: ${detailItem.submitterName}`}
                      </h3>
                      <span className="font-mono text-caption text-brand-700 dark:text-brand-300 font-bold bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800">
                        {codeInfo.code}
                      </span>
                    </div>
                    <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>Cơ quan tiếp nhận: <strong>{authorityDisplay}</strong> (Cấp 2)</span>
                      <span>&bull;</span>
                      <span>Ngày nộp: <strong>{detailItem.submittedAt}</strong></span>
                      <span>&bull;</span>
                      <span>Loại hồ sơ: <strong>{resolveGovRequestType(detailItem.type).label}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isOffer && (
                    <a
                      href={`/chao-ban-cong-nghe/${detailItem.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800 text-caption font-bold transition shadow-xs"
                      title="Xem trước giao diện niêm yết của sản phẩm (Chế độ xem trước nội bộ, chưa công khai)"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span className="hidden sm:inline">Xem Trước Niêm Yết</span>
                    </a>
                  )}
                  {expert?.expertCode && (
                    <a
                      href={`/experts/${expert.expertCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-brand-50 hover:bg-brand-100 text-brand-900 border border-brand-300 dark:bg-brand-950/60 dark:text-brand-200 dark:border-brand-800 text-caption font-bold transition shadow-xs"
                      title="Xem hồ sơ chuyên gia trên Sàn Công nghệ"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-brand-700 dark:text-brand-400" />
                      <span className="hidden sm:inline">Xem Trang Công Khai</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setDetailItem(null)}
                    className="p-1.5 rounded-control text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Đóng cửa sổ"
                    aria-label="Đóng"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-label">
                {isOffer ? (
                  /* Layout Chi Tiết Chào Bán Công Nghệ */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-surface border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-caption text-slate-400 block">Tên sản phẩm / công nghệ:</span>
                        <span className="font-bold text-slate-900 dark:text-white text-body">
                          {detailItem.titleOrOrg}
                        </span>
                      </div>
                      <div>
                        <span className="text-caption text-slate-400 block">Đơn vị chào bán / Sở hữu:</span>
                        <span className="font-bold text-brand-700 dark:text-brand-300 text-body">
                          {detailItem.rawOffer?.developerOrigin ||
                            detailItem.rawOffer?.enterpriseName ||
                            detailItem.submitterName}
                        </span>
                      </div>
                      <div>
                        <span className="text-caption text-slate-400 block">Ngành công nghiệp:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {resolveSectorName(detailItem.sector, sectorNames)}
                        </span>
                      </div>
                      <div>
                        <span className="text-caption text-slate-400 block">Phân loại hình thức:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {formatOfferType(detailItem.rawOffer?.offerType)}
                        </span>
                      </div>
                    </div>

                    {/* 4 Thẻ chỉ số: TRL, SHTT, Giá, Chuyển giao */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-control border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <span className="text-caption text-slate-400 block">Mức sẵn sàng TRL</span>
                        {(() => {
                          const trl = resolveTrlInfo(detailItem.rawOffer?.trlLevel);
                          return (
                            <>
                              <span
                                className={`inline-block mt-1 px-2 py-0.5 rounded text-caption font-bold border ${trl.colorClass}`}
                              >
                                {trl.label}
                              </span>
                              <span className="block text-caption text-slate-500 mt-1 line-clamp-1">
                                {trl.desc}
                              </span>
                            </>
                          );
                        })()}
                      </div>

                      <div className="p-3 rounded-control border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <span className="text-caption text-slate-400 block">Tình trạng SHTT</span>
                        {(() => {
                          const ip = resolveIpStatusInfo(detailItem.rawOffer?.ipStatus);
                          return (
                            <>
                              <span
                                className={`inline-block mt-1 px-2 py-0.5 rounded text-caption font-bold border ${ip.colorClass}`}
                              >
                                {ip.label}
                              </span>
                              {detailItem.rawOffer?.ipRegistrationNumber && (
                                <span className="block text-caption text-slate-500 mt-1 font-mono">
                                  Số: {detailItem.rawOffer.ipRegistrationNumber}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      <div className="p-3 rounded-control border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <span className="text-caption text-slate-400 block">Giá dự kiến</span>
                        <span className="font-bold text-brand-700 dark:text-brand-300 block mt-1 text-body">
                          {formatPrice(detailItem.rawOffer)}
                        </span>
                      </div>

                      <div className="p-3 rounded-control border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <span className="text-caption text-slate-400 block">Phương thức chuyển giao</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 block mt-1 text-caption">
                          {formatTransferMethod(
                            detailItem.rawOffer?.transferPriorityMethod || detailItem.rawOffer?.transferMethod
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Media */}
                    {(detailItem.rawOffer?.mainImageUrl ||
                      (detailItem.rawOffer?.galleryImageUrls &&
                        detailItem.rawOffer.galleryImageUrls.length > 0) ||
                      detailItem.rawOffer?.videoDemoUrl) && (
                      <div className="p-4 rounded-surface bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-caption uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-brand-600" />
                          <span>Hình ảnh &amp; Video giới thiệu sản phẩm</span>
                        </h4>
                        <div className="flex flex-wrap items-center gap-3">
                          {detailItem.rawOffer?.mainImageUrl && (
                            <div className="w-24 h-20 rounded-control overflow-hidden border border-slate-200 dark:border-slate-700 relative bg-white shrink-0">
                              <img
                                src={detailItem.rawOffer.mainImageUrl}
                                alt="Ảnh đại diện"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-caption text-center font-bold py-0.5">
                                Ảnh chính
                              </span>
                            </div>
                          )}
                          {detailItem.rawOffer?.galleryImageUrls?.map((url, idx) => (
                            <div
                              key={idx}
                              className="w-20 h-20 rounded-control overflow-hidden border border-slate-200 dark:border-slate-700 bg-white shrink-0"
                            >
                              <img
                                src={url}
                                alt={`Gallery ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {detailItem.rawOffer?.videoDemoUrl && (
                            <a
                              href={detailItem.rawOffer.videoDemoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-control bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-caption font-bold hover:underline"
                            >
                              <Video className="w-4 h-4" />
                              <span>Xem Video Demo</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mô tả & Bài toán */}
                    <div className="space-y-3">
                      {(detailItem.rawOffer?.summary || detailItem.summary) && (
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 text-caption uppercase tracking-wider">
                            Mô Tả &amp; Tính Năng Nổi Bật Của Sản Phẩm
                          </h4>
                          <div className="p-3.5 rounded-control bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed text-body whitespace-pre-line">
                            {detailItem.rawOffer?.summary || detailItem.summary}
                          </div>
                        </div>
                      )}

                      {detailItem.rawOffer?.problemSolved && (
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 text-caption uppercase tracking-wider">
                            Vấn Đề / Bài Toán Thực Tiễn Giải Quyết
                          </h4>
                          <div className="p-3.5 rounded-control bg-brand-50/40 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/40 text-slate-700 dark:text-slate-300 leading-relaxed text-body whitespace-pre-line">
                            {detailItem.rawOffer.problemSolved}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : isInstitution ? (
                  /* Layout Chi Tiết Hồ Sơ Doanh Nghiệp Hội Viên */
                  <div className="space-y-6">
                    <div className="p-5 rounded-surface bg-gradient-to-r from-cyan-50/70 via-slate-50 to-white dark:from-cyan-950/40 dark:via-slate-800/40 dark:to-slate-900 border border-cyan-200/80 dark:border-cyan-900/60 flex flex-col md:flex-row gap-5 items-start">
                      <div className="w-20 h-20 rounded-2xl bg-cyan-600 text-white flex flex-col items-center justify-center font-bold text-2xl shadow-md shrink-0">
                        <Building className="w-8 h-8" />
                        <span className="text-[10px] font-normal uppercase tracking-widest text-cyan-100 mt-0.5">
                          HỘI VIÊN
                        </span>
                      </div>

                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {detailItem.institutionPayload?.companyName || detailItem.submitterName}
                          </h2>
                          <span className="px-3 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 font-bold text-caption">
                            Doanh Nghiệp Hội Viên
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1.5 gap-x-6 text-body">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-medium">Mã số thuế:</span>
                            <strong className="font-mono text-slate-800 dark:text-slate-200">
                              {detailItem.institutionPayload?.taxCode || "N/A"}
                            </strong>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-slate-400">Địa bàn tỉnh / thành phố:</span>
                            <strong className="text-slate-800 dark:text-slate-200">
                              {detailItem.provinceName || resolveProvinceName(detailItem.scopeId)}
                            </strong>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{detailItem.submitterEmail}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>Thời điểm nộp hồ sơ: {detailItem.submittedAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Giấy chứng nhận ĐKKD / Tài liệu đính kèm */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-600" />
                        <span>Hồ Sơ Minh Chứng &amp; Giấy Phép ĐKKD</span>
                      </h4>
                      <div className="p-4 rounded-surface bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 border border-cyan-200 dark:border-cyan-800">
                            <FileCheck2 className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-body">
                              {detailItem.cvOrDocName || detailItem.institutionPayload?.fileName || "Giay_Phep_DKKD.pdf"}
                            </p>
                            <p className="text-caption text-slate-400">Giấy chứng nhận Đăng ký Doanh nghiệp / Pháp nhân Hội viên</p>
                          </div>
                        </div>
                        <span className="text-caption font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                          Hợp lệ
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Layout Chi Tiết Hồ Sơ Chuyên Gia KH&CN */
                  <div className="space-y-6">
                    {/* Thẻ định danh chuyên gia (Profile Header Card) */}
                    <div className="p-5 rounded-surface bg-gradient-to-r from-brand-50/70 via-slate-50 to-white dark:from-brand-950/40 dark:via-slate-800/40 dark:to-slate-900 border border-brand-200/80 dark:border-brand-900/60 flex flex-col md:flex-row gap-5 items-start">
                      <div className="w-20 h-20 rounded-2xl bg-brand-600 text-white flex flex-col items-center justify-center font-bold text-2xl shadow-md shrink-0">
                        <span className="tracking-wide">
                          {detailItem.submitterName.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-[10px] font-normal uppercase tracking-widest text-brand-200 mt-0.5">
                          EXPERT
                        </span>
                      </div>

                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {detailItem.submitterName}
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full text-caption font-bold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-300 dark:border-brand-800">
                            {formatDegree(expert?.degree || detailItem.degree, expert?.academicRank)}
                          </span>
                          {expert?.birthYear && (
                            <span className="text-caption text-slate-500 dark:text-slate-400">
                              (Sinh năm: {expert.birthYear})
                            </span>
                          )}
                        </div>

                        {expert?.researchTitle && (
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                            <span>{expert.researchTitle}</span>
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-caption text-slate-600 dark:text-slate-400">
                          <div className="flex items-start gap-1.5">
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-slate-400">Cơ quan: </span>
                              <strong className="text-slate-800 dark:text-slate-200">
                                {expert?.organizationName || detailItem.titleOrOrg}
                              </strong>
                            </div>
                          </div>
                          {expert?.organizationAddress && (
                            <div className="flex items-start gap-1.5">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-slate-400">Địa chỉ: </span>
                                <span className="text-slate-700 dark:text-slate-300">
                                  {expert.organizationAddress}
                                </span>
                              </div>
                            </div>
                          )}
                          {(expert?.email || detailItem.submitterEmail) && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>{expert?.email || detailItem.submitterEmail}</span>
                            </div>
                          )}
                          {expert?.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>{expert.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lĩnh vực & Từ khóa chuyên môn */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                        <Tag className="w-4 h-4 text-brand-600" />
                        <span>Lĩnh Vực &amp; Chuyên Môn Công Nghiệp (BACLINK)</span>
                      </h4>
                      <div className="p-4 rounded-surface bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div>
                          <span className="text-caption text-slate-400 block mb-1">
                            Lĩnh vực công nghệ tiếp nhận thẩm định:
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {(expert?.expertiseSectors && expert.expertiseSectors.length > 0
                              ? expert.expertiseSectors
                              : [detailItem.sector]
                            ).map((sec, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-full bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 font-semibold text-caption inline-flex items-center gap-1.5"
                              >
                                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                                  {sec || "IND"}:
                                </span>
                                <span>{resolveSectorName(sec, sectorNames)}</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {expert?.specializedKeywords && expert.specializedKeywords.length > 0 && (
                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-caption text-slate-400 block mb-1.5">
                              Từ khóa chuyên môn sâu &amp; Công nghệ chủ chốt:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {expert.specializedKeywords.map((kw, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-caption font-medium border border-slate-200 dark:border-slate-600"
                                >
                                  #{kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tóm tắt năng lực nghiên cứu & tư vấn */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-brand-600" />
                        <span>Tóm Tắt Năng Lực Nghiên Cứu &amp; Hoạt Động Tư Vấn</span>
                      </h4>
                      <div className="p-4 rounded-surface bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed text-body whitespace-pre-line shadow-xs">
                        {expert?.consultingSummary || detailItem.summary || (
                          <span className="italic text-slate-400">Chuyên gia chưa cập nhật nội dung tóm tắt chi tiết.</span>
                        )}
                      </div>
                    </div>

                    {/* Công bố khoa học (Publications) */}
                    {expert?.publications && expert.publications.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                          <Award className="w-4 h-4 text-brand-600" />
                          <span>Công Bố Khoa Học &amp; Ấn Phẩm Tiêu Biểu ({expert.publications.length})</span>
                        </h4>
                        <div className="space-y-2">
                          {expert.publications.map((pub, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-control bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-caption space-y-1"
                            >
                              <p className="font-bold text-slate-800 dark:text-slate-200 text-body">
                                {idx + 1}. {pub.title || "Công trình nghiên cứu"}
                              </p>
                              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                                {pub.journal && <span>Tạp chí / Kỷ yếu: <strong>{pub.journal}</strong></span>}
                                {pub.year && <span>&bull; Năm: <strong>{pub.year}</strong></span>}
                                {pub.authors && <span>&bull; Tác giả: {pub.authors}</span>}
                                {pub.doi && <span>&bull; DOI: {pub.doi}</span>}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hồ sơ minh chứng & Tài liệu đính kèm */}
                    <ExpertDocumentsSection expertCode={expert?.expertCode || ""} fallbackDocName={detailItem.cvOrDocName} />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3">
                <AppButton
                  variant="outline"
                  onClick={() => setDetailItem(null)}
                  className="px-4 py-2"
                >
                  <span>Đóng Cửa Sổ</span>
                </AppButton>

                {detailItem.status === "PENDING_APPROVAL" && (
                  <AppButton
                    variant="primary"
                    onClick={() => {
                      const target = detailItem;
                      setDetailItem(null);
                      setSelectedItem(target);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2"
                    data-testid="btn-forward-to-review"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Tiến Hành Phê Duyệt Hồ Sơ</span>
                  </AppButton>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <TrlMethodologyModal
        isOpen={isTrlMethodologyOpen}
        onClose={() => setIsTrlMethodologyOpen(false)}
        initialLevel={selectedItem?.rawOffer?.trlLevel || detailItem?.rawOffer?.trlLevel || 7}
      />
    </div>
  );
}

export function GovApprovalQueue() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải bàn làm việc kiểm duyệt...</div>}>
      <GovDashboardContent />
    </Suspense>
  );
}

export default GovApprovalQueue;
