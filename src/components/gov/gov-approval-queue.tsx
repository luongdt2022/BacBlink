"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
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
} from "lucide-react";

import { reviewOffer } from "@/services/api/technology-offer";
import { TechnologyOffer } from "@/types/technology-offer";
import { GovPageHeader } from "@/components/gov/gov-page-header";
import {
  resolveSectorName,
  resolveProvinceName,
  resolveTrlInfo,
  resolveIpStatusInfo,
  resolveGovRequestType,
  formatGovRecordCode,
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

export interface GovApprovalItem {
  id: string;
  submitterName: string;
  submitterEmail: string;
  type: "EXPERT" | "SHOP" | "DEMAND" | "ACCOUNT" | "FACILITY" | "TECHNOLOGY_OFFER";
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
}

function GovDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab")?.toUpperCase();
  const activeTab: "ALL" | "EXPERT" | "SHOP" | "DEMAND" | "ACCOUNT" = useMemo(() => {
    if (
      tabParam === "EXPERT" ||
      tabParam === "SHOP" ||
      tabParam === "DEMAND" ||
      tabParam === "ACCOUNT" ||
      tabParam === "ALL"
    ) {
      return tabParam;
    }
    return "ALL";
  }, [tabParam]);

  const handleTabChange = (newTab: "ALL" | "EXPERT" | "SHOP" | "DEMAND" | "ACCOUNT") => {
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
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT" | "REQUEST_CHANGES" | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

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
      const res = await fetch(`/api/v1/approvals?scopeType=PROVINCE&scopeId=${scopeId}`, {
        headers: authClient.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const dataList = json.data?.items || json.data || json;
        if (Array.isArray(dataList)) {
          mapped = dataList.map((x: any) => ({
            id: x.id,
            submitterName: x.user?.fullName || "Chuyên gia địa phương",
            submitterEmail: x.user?.email || "chuyengia@haiphong.gov.vn",
            type: x.requestType || "EXPERT",
            titleOrOrg: x.payloadJson ? JSON.parse(x.payloadJson).organizationName || "Sở KH&CN" : "Sở KH&CN",
            scopeType: x.scopeType || "PROVINCE",
            scopeId: x.scopeId || scopeId,
            provinceName: resolveProvinceName(x.scopeId) || resolveProvinceName(scopeId),
            sector: x.payloadJson ? JSON.parse(x.payloadJson).expertiseSectors?.[0] || "" : "",
            submittedAt: new Date(x.createdAt).toLocaleDateString("vi-VN"),
            status: x.status || "PENDING_APPROVAL",
            degree: x.payloadJson ? JSON.parse(x.payloadJson).degree : "Tiến sĩ (TS)",
            summary: x.payloadJson ? JSON.parse(x.payloadJson).consultingSummary : "",
            version: x.version || 1,
          }));
        }
      }

      // Nạp hồ sơ công nghệ chào bán cần thẩm định Cấp 2 của Sở KH&CN
      try {
        const techRes = await fetch(`/api/v1/portal/seller/technologies?status=PENDING`);
        if (techRes.ok) {
          const techJson = await techRes.json();
          const techList = techJson.data || [];
          const techMapped: GovApprovalItem[] = techList
            .filter((t: any) => t.status === "PENDING")
            .map((t: any) => ({
              id: t.id,
              submitterName: t.developerOrigin || t.enterpriseName || "Doanh nghiệp KH&CN",
              submitterEmail: t.contactEmail || "seller@nacentwin.gov.vn",
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
    };
  }, [items]);

  const handleReviewSubmit = async () => {
    if (!selectedItem || !reviewAction) return;

    if (reviewAction === "REJECT" || reviewAction === "REQUEST_CHANGES") {
      const trimmedNote = reviewNote.trim();
      if (!trimmedNote || trimmedNote.length < 10) {
        setReviewError("Lý do xử lý bắt buộc phải có ít nhất 10 ký tự hợp lệ theo Quy tắc BR-ADM-004.");
        return;
      }
    }

    setProcessing(true);
    setReviewError("");

    try {
      if (selectedItem.type === "TECHNOLOGY_OFFER") {
        await reviewOffer(
          selectedItem.id,
          reviewAction,
          reviewNote.trim() || (reviewAction === "APPROVE" ? "Hồ sơ công nghệ hợp lệ, Sở KH&CN phê duyệt cấp cơ sở." : "Cần bổ sung hồ sơ.")
        );
      } else {
        const res = await fetch(`/api/v1/approvals/${selectedItem.id}/review`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authClient.getAuthHeaders(),
          },
          body: JSON.stringify({
            action: reviewAction,
            expectedVersion: selectedItem.version,
            reviewNote: reviewNote.trim() || (reviewAction === "APPROVE" ? "Hồ sơ hợp lệ, Lãnh đạo Sở KH&CN phê duyệt cấp cơ sở." : ""),
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
      let successMessage = `Đã chuyển trạng thái hồ sơ sang ${nextStatus}.`;
      if (reviewAction === "APPROVE") {
        successMessage = isOffer
          ? `Đã phê duyệt sản phẩm "${selectedItem.titleOrOrg}"! Công nghệ đã sẵn sàng niêm yết trên Sàn.`
          : `Đã phê duyệt hồ sơ chuyên gia ${selectedItem.submitterName}! Cấp role VERIFIED_EXPERT thành công.`;
      } else if (reviewAction === "REQUEST_CHANGES") {
        successMessage = isOffer
          ? `Đã gửi yêu cầu hoàn thiện hồ sơ cho sản phẩm "${selectedItem.titleOrOrg}".`
          : `Đã gửi yêu cầu bổ sung hồ sơ cho chuyên gia ${selectedItem.submitterName}.`;
      } else if (reviewAction === "REJECT") {
        successMessage = isOffer
          ? `Đã từ chối niêm yết sản phẩm "${selectedItem.titleOrOrg}".`
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
    <div className="space-y-6">
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
          { label: "Quản Lý Thẩm Định", href: "/gov" },
          { label: "Hàng Đợi Kiểm Duyệt Địa Bàn" },
        ]}
        title="Hàng Đợi Kiểm Duyệt Địa Bàn"
        subtitle="Thẩm định hồ sơ theo cơ chế 3D Scoped RBAC dành cho 34 Sở KH&CN tỉnh thành trọng điểm và Ban Điều Phối Lĩnh Vực TT17."
        icon={ShieldCheck}
        scopeCode={currentScopeId}
        slaText="SLA ≤ 48h"
        makerCheckerText="Maker-Checker 2 Cấp"
        actions={
          <AppButton
            variant="outline"
            onClick={() => loadApprovals()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control text-label font-semibold text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm mới danh sách</span>
          </AppButton>
        }
      />

      {/* Scope Info Card Banner */}
      <div className="bg-gradient-to-r from-brand-500/10 via-brand-50 to-white dark:from-brand-950/40 dark:via-slate-900 dark:to-slate-900 border border-brand-200 dark:border-brand-900/60 rounded-surface p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-700 text-white flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-card-title">
              Cán bộ phụ trách: {user?.fullName || "Lãnh đạo Sở KH&CN"}
            </h4>
            <p className="text-caption text-slate-600 dark:text-slate-400">
              Quyền hạn: <strong>{user?.role || "PROVINCIAL_ADMIN"}</strong> &bull; Phạm vi kiểm duyệt:{" "}
              <strong>Sở KH&CN {currentProvinceName}</strong> &bull; Hậu kiểm: NacenTech Trung Ương.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-label font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <Clock className="w-4 h-4" />
            <span>SLA Cam Kết: &le; 48 Giờ</span>
          </div>
          <div className="flex items-center gap-1.5 text-brand-700 dark:text-brand-300">
            <CheckCircle2 className="w-4 h-4" />
            <span>Maker-Checker 2 Cấp</span>
          </div>
        </div>
      </div>

      {/* 5 Tabs Navigation with Badges */}
      <div role="tablist" aria-label="Bộ lọc hồ sơ kiểm duyệt" className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "EXPERT", label: "Chuyên Gia KH&CN", count: stats.expert, icon: GraduationCap },
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
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-label transition cursor-pointer ${
                  isActive
                    ? "border-brand-700 text-brand-700 dark:border-brand-400 dark:text-brand-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-caption font-bold ${
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
        <div className="relative min-w-[18rem] pb-2 sm:pb-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên chuyên gia, đơn vị, mã..."
            className="form-control w-full pl-9 pr-3 text-sm"
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
              <table className="w-full min-w-[58rem] text-left text-label">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 uppercase tracking-wider font-semibold dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    {/* CỘT 1: MÃ HỒ SƠ */}
                    <th className="py-3 px-4">
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
                    <th className="py-3 px-4">
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
                    <th className="py-3 px-4">
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
                    <th className="py-3 px-4 relative">
                      <div className="flex items-center justify-between gap-1">
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
                                <span>Lọc theo ngành TT17</span>
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
                    <th className="py-3 px-4">
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
                    <th className="py-3 px-4 relative">
                      <div className="flex items-center justify-between gap-1">
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
                    <th className="py-3 px-4 text-right">Thao Tác</th>
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
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-700 dark:text-brand-300">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-800 dark:bg-brand-950/70 dark:text-brand-200 border border-brand-200 dark:border-brand-800 text-caption font-bold tracking-wide"
                              title={`Mã định danh công vụ: ${codeInfo.code} (UUID: ${item.id})`}
                            >
                              {codeInfo.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(codeInfo.code, item.id)}
                              className="p-1 rounded text-slate-400 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
                              className={`inline-block text-xs font-bold px-1.5 py-0.5 rounded mt-1 border ${
                                resolveGovRequestType(item.type).badgeClass
                              }`}
                            >
                              {resolveGovRequestType(item.type).label}
                            </span>
                          )}
                        </td>

                        {/* Cột 2: Đơn vị chào bán / Sở hữu */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {item.submitterName}
                          </div>
                          <div className="text-xs text-slate-400">{item.submitterEmail}</div>
                        </td>

                        {/* Cột 3: Tên sản phẩm / công nghệ (Clickable để xem chi tiết đầy đủ) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedItem(item)}
                              className="text-left font-bold text-slate-900 dark:text-white hover:text-brand-700 dark:hover:text-brand-300 hover:underline transition leading-snug cursor-pointer group"
                              title="Click để xem chi tiết đầy đủ hồ sơ trước khi ký duyệt"
                            >
                              <span>{item.titleOrOrg}</span>
                              <Eye className="w-3.5 h-3.5 inline-block ml-1 opacity-0 group-hover:opacity-100 text-brand-600 transition-opacity" />
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
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-caption font-semibold">
                            {resolveSectorName(item.sector, sectorNames)}
                          </span>
                        </td>

                        {/* Cột 5: Ngày nộp */}
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                          {item.submittedAt}
                        </td>

                        {/* Cột 6: Trạng thái */}
                        <td className="py-3.5 px-4">
                          {item.status === "PENDING_APPROVAL" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-caption font-bold dark:bg-amber-950/60 dark:text-amber-300">
                              <Clock className="w-3 h-3" />
                              <span>Chờ Lãnh Đạo Duyệt</span>
                            </span>
                          )}
                          {item.status === "APPROVED" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-caption font-bold dark:bg-emerald-950/60 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Đã Duyệt (Cấp Tỉnh)</span>
                            </span>
                          )}
                          {item.status === "REJECTED" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-caption font-bold dark:bg-rose-950/60 dark:text-rose-300">
                              <XCircle className="w-3 h-3" />
                              <span>Đã Từ Chối</span>
                            </span>
                          )}
                          {item.status === "CHANGES_REQUESTED" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-caption font-bold dark:bg-cyan-950/60 dark:text-cyan-300">
                              <AlertCircle className="w-3 h-3" />
                              <span>Yêu Cầu Bổ Sung</span>
                            </span>
                          )}
                        </td>

                        {/* Cột 7: Thao tác Thẩm Định */}
                        <td className="py-3.5 px-4 text-right">
                          <AppButton
                            variant="primary"
                            onClick={() => setSelectedItem(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control font-semibold text-caption whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem Chi Tiết &amp; Duyệt</span>
                          </AppButton>
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
                          : `Thẩm Định Hồ Sơ Chuyên Gia: ${selectedItem.submitterName}`}
                      </span>
                    </h3>
                    {(() => {
                      const codeInfo = formatGovRecordCode(selectedItem.id, selectedItem.type, selectedItem.scopeId);
                      const authorityDisplay = selectedItem.provinceName.startsWith("Sở")
                        ? selectedItem.provinceName
                        : `Sở KH&CN ${selectedItem.provinceName}`;
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
                  {isOffer && (
                    <a
                      href={`/chao-ban-cong-nghe/${selectedItem.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800 text-caption font-bold transition shadow-xs"
                      title="Xem trước giao diện niêm yết của sản phẩm (Chế độ xem trước nội bộ, chưa công khai)"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span className="hidden sm:inline">Xem Trước Niêm Yết (Preview)</span>
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
                      <strong>Trạng Thái: Chờ Lãnh Đạo Sở Phê Duyệt</strong> &mdash; Sản phẩm này <strong>CHƯA ĐƯỢC CÔNG KHAI</strong> trên Sàn Quốc Gia. Khách hàng bên ngoài không thể tìm kiếm hay giao dịch cho tới khi được ký duyệt.
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
                        <span className="text-caption text-slate-400 block">Lĩnh vực công nghệ (TT17):</span>
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

                    {/* DataRoom & Tài Liệu Pháp Lý SHTT */}
                    {selectedItem.cvOrDocName && (
                      <div className="p-3.5 rounded-control bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-medium">
                          <FileText className="w-4 h-4" />
                          <span>Hồ sơ minh chứng / DataRoom: {selectedItem.cvOrDocName}</span>
                        </div>
                        <span className="text-caption text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Đã xác thực chữ ký số
                        </span>
                      </div>
                    )}
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
                          {selectedItem.degree || "Tiến sĩ (TS)"}
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
                    </div>

                    {selectedItem.summary && (
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1.5">
                          Tóm Tắt Năng Lực &amp; Hoạt Động Nghiên Cứu
                        </h4>
                        <div className="p-3.5 rounded-control bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed text-body">
                          {selectedItem.summary}
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

                {/* Review Actions Form */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Quyết Định Phê Duyệt Của Lãnh Đạo Sở KH&CN
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setReviewAction("APPROVE");
                        setReviewError("");
                      }}
                      className={`p-3 rounded-control border text-left font-bold transition flex items-center gap-2 cursor-pointer ${
                        reviewAction === "APPROVE"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 ring-2 ring-emerald-500"
                          : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
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
                      }}
                      className={`p-3 rounded-control border text-left font-bold transition flex items-center gap-2 cursor-pointer ${
                        reviewAction === "REQUEST_CHANGES"
                          ? "border-cyan-500 bg-cyan-50 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 ring-2 ring-cyan-500"
                          : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
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
                      }}
                      className={`p-3 rounded-control border text-left font-bold transition flex items-center gap-2 cursor-pointer ${
                        reviewAction === "REJECT"
                          ? "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 ring-2 ring-rose-500"
                          : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <X className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{isOffer ? "Từ Chối Niêm Yết" : "Từ Chối Hồ Sơ"}</span>
                    </button>
                  </div>

                  {reviewAction && (
                    <div className="space-y-2 pt-2">
                      <label className="block text-caption font-bold text-slate-700 dark:text-slate-300">
                        Ghi chú thẩm định / Lý do quyết định{" "}
                        {reviewAction !== "APPROVE" && (
                          <span className="text-rose-500">* (Bắt buộc &ge; 10 ký tự theo BR-ADM-004)</span>
                        )}
                      </label>
                      <textarea
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
                              : "Ghi chú phê duyệt: Hồ sơ đáp ứng đầy đủ tiêu chí theo Thông tư 17..."
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
