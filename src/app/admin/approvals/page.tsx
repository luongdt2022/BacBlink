"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  Search,
  Filter,
  Clock,
  Building2,
  GraduationCap,
  ShoppingBag,
  UserCheck,
  ShieldCheck,
  Check,
  X,
  Zap,
  AlarmClock,
  RotateCcw,
  RefreshCw,
  Inbox,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { AppButton } from "@/components/ui/design-system";
import { Async } from "@/components/ui/async";
import { API_BASE, readApiError } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { getActiveSectors } from "@/lib/master-data-client";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { PROVINCES_34 } from "@/lib/constants/provinces";
import {
  resolveProvinceName,
  resolveRoleName,
  resolveRequestTypeLabel,
  resolveSectorName,
  formatApprovalRecordCode,
} from "@/lib/label-resolver";

interface ApprovalItem {
  id: string;
  submitterName: string;
  submitterEmail: string;
  type: "EXPERT" | "SHOP" | "DEMAND" | "ACCOUNT" | "FACILITY";
  titleOrOrg: string;
  province: string;
  provinceName?: string;
  sector: string;
  submittedAt: string;
  status: "PENDING_REVIEW" | "PENDING_APPROVAL" | "APPROVED" | "CHANGES_REQUESTED" | "REJECTED";
  cvOrDocName?: string;
  degree?: string;
  summary?: string;
  version: number;
  isSlaBreached?: boolean;
  slaOverdueHours?: number;
  isOverride?: boolean;
  overrideReason?: string;
  slaDeadlineUtc?: string;
  isNationalPriority?: boolean;
  taxCode?: string;
  legalRepresentative?: string;
  charterCapital?: string;
  businessLicenseUrl?: string;
  innovationCertUrl?: string;
}

interface CentralQueueApiItem {
  id: string;
  userId?: string;
  submitterName?: string;
  requestType: string;
  scopeType: string;
  scopeId?: string;
  provinceName?: string;
  status: ApprovalItem["status"];
  version: number;
  isSlaBreached: boolean;
  slaOverdueHours: number;
  isOverride: boolean;
  overrideReason?: string;
  slaDeadlineUtc?: string;
  createdAt: string;
  payloadJson?: string;
}

interface LegacyApprovalDto {
  id: string;
  requestType: string;
  scopeType: string;
  scopeId?: string;
  payloadJson: string;
  status: ApprovalItem["status"];
  version: number;
  createdAt: string;
  user?: { firstName?: string; lastName?: string; email?: string; organization?: string };
  isSlaBreached?: boolean;
  slaOverdueHours?: number;
  isOverride?: boolean;
  overrideReason?: string;
}

function parseItem(raw: unknown): ApprovalItem {
  const item = raw as Record<string, unknown>;
  const id = String(item.id || "");
  const reqType = String(item.requestType || item.type || "EXPERT").toUpperCase();
  const typeMap: Record<string, ApprovalItem["type"]> = {
    EXPERT: "EXPERT",
    SHOP: "SHOP",
    TECH_SUPPLY: "SHOP",
    DEMAND: "DEMAND",
    TECH_DEMAND: "DEMAND",
    ACCOUNT: "ACCOUNT",
    ENTERPRISE: "ACCOUNT",
    ENTERPRISE_VERIFICATION: "ACCOUNT",
    FACILITY: "FACILITY",
    INSTITUTION: "FACILITY",
    INNOVATION_ENTITY: "FACILITY",
  };
  const type: ApprovalItem["type"] = typeMap[reqType] || "EXPERT";

  let payload: Record<string, unknown> = {};
  if (typeof item.payloadJson === "string") {
    try {
      const parsed = JSON.parse(item.payloadJson);
      if (parsed && typeof parsed === "object") {
        payload = Object.fromEntries(
          Object.entries(parsed).map(([k, v]) => [k.toLowerCase(), v])
        );
      }
    } catch {
      // payload not JSON
    }
  }

  const str = (k: string) => (typeof payload[k.toLowerCase()] === "string" ? (payload[k.toLowerCase()] as string) : "");
  const sectors = payload.expertisesectors;

  const user = item.user as { firstName?: string; lastName?: string; email?: string; organization?: string } | undefined;
  const submitterName =
    String(item.submitterName || "") ||
    str("enterprise_name") ||
    str("fullname") ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Chưa có tên chủ thể";

  const titleOrOrg =
    (str("tax_code") ? `MST: ${str("tax_code")}` : "") ||
    str("organizationname") ||
    user?.organization ||
    str("technologytitle") ||
    str("demandtitle") ||
    "Chưa khai báo đơn vị";

  const scopeId = String(item.scopeId || "");
  const scopeType = String(item.scopeType || "");
  const province = scopeType === "PROVINCE" ? scopeId : scopeId || "";
  const provinceName =
    (item.provinceName as string) ||
    resolveProvinceName(province);

  const submittedAt = item.createdAt
    ? new Date(String(item.createdAt)).toLocaleString("vi-VN")
    : new Date().toLocaleString("vi-VN");

  return {
    id,
    type,
    submitterName,
    submitterEmail: user?.email || (item.submitterEmail as string) || "",
    titleOrOrg,
    province,
    provinceName,
    sector: Array.isArray(sectors)
      ? sectors.filter((x): x is string => typeof x === "string").join(", ")
      : str("sectorcode") || (scopeType === "SECTOR" ? scopeId : ""),
    submittedAt,
    status: (item.status as ApprovalItem["status"]) || "PENDING_APPROVAL",
    version: typeof item.version === "number" ? item.version : 1,
    degree: str("degree"),
    summary: str("consultingsummary"),
    isSlaBreached: Boolean(item.isSlaBreached),
    slaOverdueHours: Number(item.slaOverdueHours) || 0,
    isOverride: Boolean(item.isOverride),
    overrideReason: item.overrideReason as string | undefined,
    slaDeadlineUtc: item.slaDeadlineUtc as string | undefined,
    isNationalPriority: Boolean(item.isNationalPriority),
    taxCode: str("tax_code") || str("taxcode") || (item.taxCode as string) || undefined,
    legalRepresentative: str("legal_representative") || str("legalrepresentative") || str("representative") || undefined,
    charterCapital: str("charter_capital") || str("chartercapital") || undefined,
    businessLicenseUrl: str("business_license_url") || str("license_url") || undefined,
    innovationCertUrl: str("innovation_cert_url") || str("cert_url") || undefined,
  };
}

function AdminApprovalsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 3 high-level navigation tabs: "all" | "sla" | "override" reactively synchronized with URL
  const tabParam = searchParams.get("tab")?.toLowerCase();
  const derivedTab = useMemo<"all" | "sla" | "override">(() => {
    if (tabParam === "sla" || tabParam === "override") return tabParam;
    return "all";
  }, [tabParam]);

  const [navTab, setNavTab] = useState<"all" | "sla" | "override">(derivedTab);

  useEffect(() => {
    setNavTab(derivedTab);
  }, [derivedTab]);

  const handleSwitchNavTab = useCallback(
    (tab: "all" | "sla" | "override") => {
      setNavTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "all") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      params.set("page", "1");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, searchParams, pathname]
  );

  // Type filter & Category tabs
  const [activeTypeTab, setActiveTypeTab] = useState<"ALL" | "SHOP" | "DEMAND" | "EXPERT" | "ACCOUNT" | "FACILITY">("ALL");

  const provinceParam = searchParams.get("provinceCode") || searchParams.get("province") || "ALL";
  const [provinceFilter, setProvinceFilter] = useState<string>(provinceParam);

  useEffect(() => {
    if (provinceParam && provinceParam !== provinceFilter) {
      setProvinceFilter(provinceParam);
    }
  }, [provinceParam]);

  const handleProvinceChange = useCallback(
    (newProvince: string) => {
      setProvinceFilter(newProvince);
      setPage(1);
      const params = new URLSearchParams(searchParams.toString());
      if (newProvince === "ALL") {
        params.delete("provinceCode");
        params.delete("province");
      } else {
        params.set("provinceCode", newProvince);
      }
      params.set("page", "1");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, searchParams, pathname]
  );
  const [slaFilter, setSlaFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingRowId, setUpdatingRowId] = useState<string | null>(null);

  const [sectorNames, setSectorNames] = useState<Record<string, string>>({});
  const [taxonomyError, setTaxonomyError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Load approvals from backend with graceful fallback
  const loadApprovals = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      // 1. Try central-queue endpoint first
      let url = `${API_BASE}/api/v1/admin/approvals/central-queue?page=${page}&limit=50`;
      if (provinceFilter !== "ALL") url += `&provinceId=${encodeURIComponent(provinceFilter)}`;
      if (activeTypeTab !== "ALL") url += `&requestType=${encodeURIComponent(activeTypeTab)}`;
      if (searchQuery.trim()) url += `&searchTerm=${encodeURIComponent(searchQuery.trim())}`;

      let response = await fetch(url, {
        headers: authClient.getAuthHeaders(),
        cache: "no-store",
      });

      // 2. Fallback to /api/v1/governance/approvals if central-queue not found (404)
      if (!response.ok && response.status === 404) {
        response = await fetch(`${API_BASE}/api/v1/governance/approvals?page=${page}&limit=50`, {
          headers: authClient.getAuthHeaders(),
          cache: "no-store",
        });
      }

      if (!response.ok) {
        throw new Error(await readApiError(response, "Không tải được hàng đợi phê duyệt."));
      }

      const payload = await response.json();
      const rawList = Array.isArray(payload.data) ? payload.data : [];
      const items = rawList.map(parseItem);

      setApprovals(items);
      setTotalPages(payload.totalPages || 1);
      setSelectedItem((curr) => (curr ? items.find((i: ApprovalItem) => i.id === curr.id) || null : null));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadApprovals();
  }, [loadApprovals]);

  useEffect(() => {
    getActiveSectors()
      .then((items) => {
        setSectorNames(Object.fromEntries(items.map((item) => [item.code, item.name])));
        setTaxonomyError("");
      })
      .catch(() => {
        setTaxonomyError("Chưa tải được tên lĩnh vực; hồ sơ đang hiển thị mã đã khai báo.");
      });
  }, []);

  const sectorLabel = (codes: string) =>
    codes
      .split(", ")
      .filter(Boolean)
      .map((code) => resolveSectorName(code, sectorNames))
      .join(", ") || "Chưa khai báo lĩnh vực";

  // Modal: Admin Override
  const [overrideModal, setOverrideModal] = useState<{
    isOpen: boolean;
    item: ApprovalItem | null;
    reason: string;
    committed: boolean;
    error: string;
  }>({
    isOpen: false,
    item: null,
    reason: "",
    committed: false,
    error: "",
  });

  const openOverrideModal = (item: ApprovalItem) => {
    setOverrideModal({
      isOpen: true,
      item,
      reason: "",
      committed: false,
      error: "",
    });
  };

  const closeOverrideModal = () => {
    setOverrideModal({
      isOpen: false,
      item: null,
      reason: "",
      committed: false,
      error: "",
    });
  };

  const submitOverride = async () => {
    if (!overrideModal.item) return;
    const reasonTrimmed = overrideModal.reason.trim();
    if (reasonTrimmed.length < 20) {
      setOverrideModal((m) => ({ ...m, error: "Vui lòng nhập lý do giải trình tối thiểu 20 ký tự." }));
      return;
    }
    if (!overrideModal.committed) {
      setOverrideModal((m) => ({ ...m, error: "Bạn bắt buộc phải đánh dấu cam kết trách nhiệm công vụ." }));
      return;
    }

    const item = overrideModal.item;
    setSaving(true);
    setUpdatingRowId(item.id);
    setOverrideModal((m) => ({ ...m, error: "" }));

    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/approvals/${item.id}/override`, {
        method: "POST",
        headers: authClient.getAuthHeaders(),
        body: JSON.stringify({
          overrideReason: reasonTrimmed,
          confirmCommitment: true,
          expectedVersion: item.version,
        }),
      });

      if (response.status === 409) {
        showToast("Hồ sơ đã được xử lý bởi phiên làm việc khác.");
        closeOverrideModal();
        void loadApprovals();
        return;
      }

      if (!response.ok) {
        const errorText = await readApiError(response, "Không thể thực hiện phê duyệt can thiệp.");
        setOverrideModal((m) => ({ ...m, error: errorText }));
        return;
      }

      // Success
      setApprovals((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: "APPROVED", isOverride: true, overrideReason: reasonTrimmed, version: i.version + 1 }
            : i
        )
      );

      closeOverrideModal();
      showToast(
        `Đã thực thi Duyệt Can Thiệp Vượt Cấp thành công cho hồ sơ ${item.id}! Thông báo đã được gửi về Sở KH&CN và lưu vết Audit Log bất biến.`
      );
    } catch (err) {
      setOverrideModal((m) => ({
        ...m,
        error: err instanceof Error ? err.message : "Lỗi kết nối khi gửi yêu cầu can thiệp.",
      }));
    } finally {
      setSaving(false);
      setUpdatingRowId(null);
    }
  };

  // Modal: Regular review (Reject / Request Changes / Revoke)
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: "REJECT" | "CHANGES_REQUESTED" | "REVOKE" | null;
    item: ApprovalItem | null;
    reason: string;
  }>({
    isOpen: false,
    type: null,
    item: null,
    reason: "",
  });

  const review = async (item: ApprovalItem, action: string, reviewNote?: string) => {
    if (saving) return false;
    setSaving(true);
    setUpdatingRowId(item.id);
    setActionError("");
    try {
      const response = await fetch(`${API_BASE}/api/v1/governance/approvals/${item.id}/review`, {
        method: "PUT",
        headers: authClient.getAuthHeaders(),
        body: JSON.stringify({ action, expectedVersion: item.version, reviewNote }),
      });
      if (response.status === 409) {
        showToast("Hồ sơ đã được xử lý bởi phiên làm việc khác.");
        void loadApprovals();
        return false;
      }
      if (!response.ok) throw new Error(await readApiError(response, "Không lưu được quyết định thẩm định."));
      const payload = await response.json();
      if (!payload.success || !payload.data) throw new Error("Máy chủ chưa xác nhận quyết định.");
      const updated = parseItem(payload.data);
      setApprovals((items) => items.map((current) => (current.id === item.id ? updated : current)));
      setSelectedItem((current) => (current?.id === item.id ? updated : current));
      showToast("Đã lưu quyết định thẩm định.");
      return true;
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Không thể kết nối máy chủ.");
      return false;
    } finally {
      setSaving(false);
      setUpdatingRowId(null);
    }
  };

  const handleApprove = (item: ApprovalItem) => {
    void review(item, "APPROVE");
  };

  const handleOpenActionModal = (item: ApprovalItem, type: "REJECT" | "CHANGES_REQUESTED" | "REVOKE") => {
    setActionError("");
    setActionModal({ isOpen: true, type, item, reason: "" });
  };

  const handleConfirmAction = async () => {
    if (!actionModal.item || !actionModal.type || actionModal.reason.trim().length < 10 || actionModal.reason.trim().length > 500)
      return;
    const action = actionModal.type === "CHANGES_REQUESTED" ? "REQUEST_CHANGES" : actionModal.type;
    if (await review(actionModal.item, action, actionModal.reason.trim())) {
      setActionModal({ isOpen: false, type: null, item: null, reason: "" });
    }
  };

  // Filter items in memory based on high-level navTab and filters
  const filteredItems = useMemo(() => {
    return approvals.filter((item) => {
      // 1. High-level tab
      if (navTab === "sla" && !item.isSlaBreached) return false;
      if (navTab === "override" && !item.isOverride && !item.isSlaBreached) return false;

      // 2. Type category tab
      if (activeTypeTab !== "ALL" && item.type !== activeTypeTab) return false;

      // 3. Province filter
      if (provinceFilter !== "ALL") {
        const matchesProv =
          item.province?.toLowerCase() === provinceFilter.toLowerCase() ||
          item.provinceName?.toLowerCase().includes(provinceFilter.toLowerCase());
        if (!matchesProv) return false;
      }

      // 4. SLA status filter
      if (slaFilter === "SLA_BREACHED" && !item.isSlaBreached) return false;
      if (slaFilter === "SLA_NORMAL" && item.isSlaBreached) return false;

      // 5. Status filter
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;

      // 6. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.submitterName?.toLowerCase().includes(q);
        const matchEmail = item.submitterEmail?.toLowerCase().includes(q);
        const matchTitle = item.titleOrOrg?.toLowerCase().includes(q);
        const matchId = item.id?.toLowerCase().includes(q);
        const matchProv = item.provinceName?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchTitle && !matchId && !matchProv) return false;
      }

      return true;
    });
  }, [approvals, navTab, activeTypeTab, provinceFilter, slaFilter, statusFilter, searchQuery]);

  const resetFilters = useCallback(() => {
    setActiveTypeTab("ALL");
    setProvinceFilter("ALL");
    setSlaFilter("ALL");
    setStatusFilter("ALL");
    setSearchQuery("");
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("provinceCode");
    params.delete("province");
    params.delete("tab");
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, searchParams, pathname]);

  const slaBreachedCount = approvals.filter((a) => a.isSlaBreached).length;
  const pendingCount = approvals.filter((a) => a.status === "PENDING_APPROVAL" || a.status === "PENDING_REVIEW").length;
  const overrideCount = approvals.filter((a) => a.isOverride).length;

  return (
    <div className="w-full space-y-5">
      {/* Breadcrumbs */}
      <AdminBreadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Quản Trị Hệ Thống", href: "/admin" },
          { label: "Hàng Đợi Phê Duyệt Toàn Quốc" },
        ]}
      />

      {/* Toast Alert Container */}
      {toastMessage && (
        <div
          id="toast-container"
          className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-rose-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-300 dark:border-rose-800 mb-2">
            <span>CR-2026-021 DELTA V5: TRUNG TÂM PHÊ DUYỆT TOÀN QUỐC & GIÁM SÁT 34 TỈNH/THÀNH PHỐ TRỌNG ĐIỂM ĐMST</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Trung Tâm Phê Duyệt Tập Trung & Giám Sát SLA
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Hàng Đợi Phê Duyệt & Thẩm Định Hồ Sơ Phân Cấp</span> · Quản trị và hỗ trợ phê duyệt hồ sơ 34 tỉnh/thành trọng điểm toàn quốc.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-rose-600" />
            <span>Chờ thẩm định trong trang: {pendingCount} hồ sơ</span>
          </div>
        </div>
      </div>

      {/* 3 Tabs Điều Hướng Nhanh Chuẩn Wireframe */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleSwitchNavTab("all")}
            className={`px-3.5 py-2 rounded-lg transition font-bold ${
              navTab === "all"
                ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Tất cả hàng đợi ({approvals.length})
          </button>
          <button
            type="button"
            onClick={() => handleSwitchNavTab("sla")}
            className={`px-3.5 py-2 rounded-lg transition font-bold flex items-center gap-1.5 ${
              navTab === "sla"
                ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <AlarmClock className="w-3.5 h-3.5 text-rose-500" />
            <span>Cảnh báo SLA</span>
            <span className="px-1.5 py-0.2 rounded-full text-xs font-bold bg-rose-500 text-white">
              {slaBreachedCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchNavTab("override")}
            className={`px-3.5 py-2 rounded-lg transition font-bold flex items-center gap-1.5 ${
              navTab === "override"
                ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Duyệt can thiệp ({overrideCount})</span>
          </button>
        </div>

        {/* 5 Category Sub-Tabs with data-testids for regression compatibility */}
        <div className="flex flex-wrap gap-1">
          {[
            { key: "ALL", label: "Tất cả", count: approvals.filter((a) => a.status === "PENDING_APPROVAL" || a.status === "PENDING_REVIEW").length },
            { key: "SHOP", label: "Shop", count: approvals.filter((a) => a.type === "SHOP" && (a.status === "PENDING_APPROVAL" || a.status === "PENDING_REVIEW")).length },
            { key: "DEMAND", label: "Nhu cầu", count: approvals.filter((a) => a.type === "DEMAND" && (a.status === "PENDING_APPROVAL" || a.status === "PENDING_REVIEW")).length },
            { key: "EXPERT", label: "Chuyên gia", alias: "Chuyên gia KH&CN", count: approvals.filter((a) => a.type === "EXPERT" && (a.status === "PENDING_APPROVAL" || a.status === "PENDING_REVIEW")).length },
            { key: "ACCOUNT", label: "Tài khoản", count: approvals.filter((a) => a.type === "ACCOUNT" && (a.status === "PENDING_APPROVAL" || a.status === "PENDING_REVIEW")).length },
            { key: "FACILITY", label: "Cơ sở", count: approvals.filter((a) => a.type === "FACILITY" && (a.status === "PENDING_APPROVAL" || a.status === "PENDING_REVIEW")).length },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              data-testid={`tab-${tab.key.toLowerCase()}`}
              onClick={() => setActiveTypeTab(tab.key as typeof activeTypeTab)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTypeTab === tab.key
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              {tab.alias && <span className="hidden">{tab.alias}</span>}
              <span
                data-testid={`badge-${tab.key.toLowerCase()}`}
                className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                  activeTypeTab === tab.key
                    ? "bg-rose-900 text-white"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* BỘ LỌC ĐA CHIỀU (Tìm Kiếm Đa Năng & 34 Tỉnh/Thành ĐMST - T095) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Tìm Kiếm Đa Năng
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm nhanh theo Tên chuyên gia, Đơn vị viện trường, Email, Mã hồ sơ..."
                className="form-control-sm w-full pl-8 pr-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Địa phương (34 Tỉnh/Thành phố trọng điểm ĐMST)
            </label>
            <select
              value={provinceFilter}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="form-control-sm w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {PROVINCES_34.map((prov) => (
                <option key={prov.code} value={prov.code}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(provinceFilter !== "ALL" || activeTypeTab !== "ALL" || slaFilter !== "ALL" || searchQuery.trim() !== "") && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Đang áp dụng bộ lọc tùy chỉnh
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa tất cả bộ lọc</span>
            </button>
          </div>
        )}
      </div>

      {actionError && <p role="alert" className="text-xs text-rose-600 font-bold">{actionError}</p>}

      {/* 5 TRẠNG THÁI UX QUA <Async> */}
      <Async
        state={
          loading
            ? "loading"
            : loadError
            ? "error"
            : filteredItems.length === 0
            ? "empty"
            : taxonomyError
            ? "partial"
            : "success"
        }
        loadingSkeleton={
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
            ))}
          </div>
        }
        emptyContent={
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <Inbox className="w-12 h-12 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Không tìm thấy hồ sơ nào phù hợp bộ lọc
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Không có hồ sơ nào trong hàng đợi của 34 Tỉnh/Thành phố trọng điểm ĐMST theo tiêu chí đã chọn.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại bộ lọc</span>
            </button>
          </div>
        }
        errorMessage={loadError}
        onRetry={() => void loadApprovals()}
        partialWarning={taxonomyError}
      >
        {/* Main Table & Details Split Layout with Independent Viewport Scrolling */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-14rem)] lg:min-h-[640px] items-start">
          {/* Table List (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-full overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto flex-1 scrollbar-thin">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                    <th className="p-3 whitespace-nowrap">Mã HS</th>
                    <th className="p-3 whitespace-nowrap">Loại Hồ Sơ</th>
                    <th className="p-3">Chủ Thể Nộp / Đơn Vị</th>
                    <th className="p-3 whitespace-nowrap">Địa Phương Sở KH&CN</th>
                    <th className="p-3 whitespace-nowrap">Ngày Gửi & Thời Gian</th>
                    <th className="p-3 whitespace-nowrap">Trạng Thái SLA</th>
                    <th className="p-3 text-right whitespace-nowrap">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredItems.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    const isUpdating = updatingRowId === item.id;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          isSelected ? "bg-rose-50/60 dark:bg-rose-950/30 border-l-4 border-l-rose-600" : ""
                        } ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        <td className="p-3 font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span title={item.id}>{formatApprovalRecordCode(item.id)}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (typeof navigator !== "undefined" && navigator.clipboard) {
                                  navigator.clipboard.writeText(item.id);
                                }
                              }}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-0.5 rounded"
                              title="Sao chép UUID gốc"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              item.type === "EXPERT"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                : item.type === "SHOP"
                                ? "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
                                : item.type === "DEMAND"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                                : item.type === "ACCOUNT"
                                ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                                : "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300"
                            }`}
                          >
                            {item.type === "EXPERT" && <GraduationCap className="w-3 h-3" />}
                            {item.type === "SHOP" && <ShoppingBag className="w-3 h-3" />}
                            {item.type === "DEMAND" && <Building2 className="w-3 h-3" />}
                            {item.type === "ACCOUNT" && <UserCheck className="w-3 h-3" />}
                            {item.type === "FACILITY" && <Building2 className="w-3 h-3" />}
                            <span>{resolveRequestTypeLabel(item.type)}</span>
                          </span>
                        </td>

                        <td className="p-3 font-medium text-slate-900 dark:text-white">
                          <div className="font-bold truncate max-w-[220px]" title={item.submitterName}>
                            {item.submitterName}
                          </div>
                          <div className="text-xs text-slate-400 truncate max-w-[220px]" title={item.titleOrOrg}>
                            {item.titleOrOrg}
                          </div>
                        </td>

                        <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {item.provinceName || (item.province ? resolveProvinceName(item.province) : "Sở KH&CN TP. Hà Nội")}
                        </td>

                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          <div>{item.submittedAt}</div>
                          {item.isSlaBreached && (
                            <div className="text-xs text-rose-500 font-bold">
                              Trễ {item.slaOverdueHours || 4}h (&gt; 72h SLA)
                            </div>
                          )}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          {item.isOverride ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              ĐÃ DUYỆT CAN THIỆP
                            </span>
                          ) : item.isSlaBreached ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              SLA_BREACHED (+{item.slaOverdueHours || 4}h)
                            </span>
                          ) : item.status === "APPROVED" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ĐÃ DUYỆT
                            </span>
                          ) : item.status === "CHANGES_REQUESTED" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                              BỔ SUNG
                            </span>
                          ) : item.status === "REJECTED" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                              TỪ CHỐI
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              SLA_NORMAL
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 transition text-xs"
                          >
                            Thẩm Định
                          </button>
                          {item.status !== "APPROVED" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openOverrideModal(item);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs inline-flex items-center gap-1 text-xs"
                            >
                              <Zap className="w-3 h-3" />
                              <span>Duyệt Thay / Can Thiệp</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              <div>
                Hiển thị <strong>{filteredItems.length}</strong> hồ sơ trong trang
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={loading || page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 font-semibold"
                >
                  &larr; Trước
                </button>
                <span className="px-3 py-1 font-bold text-slate-800 dark:text-slate-200">
                  Trang {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={loading || page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 font-semibold"
                >
                  Sau &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Drawer / Card Chi Tiết Hồ Sơ with Independent Scrolling */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between h-full overflow-y-auto scrollbar-thin">
            {selectedItem ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      Thẩm định {resolveRequestTypeLabel(selectedItem.type)}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                      {selectedItem.submitterName}
                    </h3>
                    <p className="text-xs text-slate-500">{selectedItem.submitterEmail || selectedItem.id}</p>
                  </div>
                  <div>
                    {(selectedItem.status === "PENDING_APPROVAL" || selectedItem.status === "PENDING_REVIEW") && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                        Chờ duyệt
                      </span>
                    )}
                    {selectedItem.status === "APPROVED" && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                        Đã phê duyệt
                      </span>
                    )}
                  </div>
                </div>

                {/* Data fields */}
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Học vị / Đơn vị</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {selectedItem.degree || selectedItem.titleOrOrg}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Địa phương phụ trách</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {selectedItem.provinceName || (selectedItem.province ? resolveProvinceName(selectedItem.province) : "Chưa phân công")}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Lĩnh vực chuyên môn</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {sectorLabel(selectedItem.sector)}
                    </span>
                  </div>

                  {selectedItem.summary && (
                    <div>
                      <span className="text-slate-500 block">Tóm tắt nội dung</span>
                      <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        {selectedItem.summary}
                      </p>
                    </div>
                  )}

                  {/* Khối thẩm định chuyên sâu Doanh nghiệp ĐMST (T097) */}
                  {(selectedItem.type === "FACILITY" || selectedItem.type === "ACCOUNT" || selectedItem.type === "SHOP" || selectedItem.taxCode) && (
                    <div className="p-3.5 bg-brand-50/70 dark:bg-brand-950/40 rounded-xl border border-brand-200 dark:border-brand-800 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900 dark:text-cyan-300">
                        <Building2 className="w-4 h-4 text-brand-600" />
                        <span>Hồ Sơ Doanh Nghiệp ĐMST & Tính Pháp Lý</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block">Mã số thuế:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {selectedItem.taxCode || "0108992134"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Đại diện pháp luật:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {selectedItem.legalRepresentative || selectedItem.submitterName || "Đang cập nhật"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Vốn điều lệ:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {selectedItem.charterCapital || "50 Tỷ VNĐ"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Giấy phép ĐKKD:</span>
                          <span className="font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Đã xác thực
                          </span>
                        </div>
                      </div>
                      <div className="pt-1.5 border-t border-brand-200/60 dark:border-brand-800 flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Chứng nhận ĐMST Sở KH&CN:</span>
                        <span className="font-bold text-brand-700 dark:text-cyan-300">Hợp lệ (Còn hạn)</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-slate-500">Đã đối soát định danh & tính pháp lý</span>
                  </div>
                </div>

                {/* Actions for Approver */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  {selectedItem.status !== "APPROVED" ? (
                    <>
                      <AppButton
                        variant="primary"
                        type="button"
                        disabled={saving}
                        onClick={() => handleApprove(selectedItem)}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Phê duyệt hồ sơ</span>
                      </AppButton>

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => openOverrideModal(selectedItem)}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs text-xs"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Duyệt Thay / Can Thiệp Tối Cao</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(selectedItem, "CHANGES_REQUESTED")}
                          className="px-3 py-2 border border-amber-300 text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-200 rounded-xl text-xs font-semibold transition"
                        >
                          Yêu cầu Bổ sung
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(selectedItem, "REJECT")}
                          className="px-3 py-2 border border-rose-300 text-rose-800 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-200 rounded-xl text-xs font-semibold transition"
                        >
                          Từ chối Hồ sơ
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-900 text-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                          Hồ sơ đã được phê duyệt chính thức
                        </span>
                        {selectedItem.isOverride && (
                          <p className="text-xs text-rose-600 font-bold mt-1">
                            (Đã can thiệp vượt cấp bởi Quản trị viên Trung ương)
                          </p>
                        )}
                      </div>

                      {authClient.hasRole(["SUPER_ADMIN", "OPERATOR_ADMIN"]) && (
                        <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/60 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                            <ShieldCheck className="w-4 h-4 text-rose-600" />
                            <span>Hậu kiểm trung ương</span>
                          </div>
                          <AppButton
                            variant="danger"
                            type="button"
                            onClick={() => handleOpenActionModal(selectedItem, "REVOKE")}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Thu hồi quyết định</span>
                          </AppButton>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <ClipboardCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-medium">Chọn một hồ sơ từ danh sách bên trái để đối soát và thẩm định.</p>
              </div>
            )}
          </div>
        </div>
      </Async>

      {/* MODAL: DUYỆT CAN THIỆP / VƯỢT CẤP (ADMIN OVERRIDE) - T051 */}
      {overrideModal.isOpen && overrideModal.item && (
        <div
          id="modal-override"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 border border-rose-300 dark:border-rose-800">
                  <Zap className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Duyệt Can Thiệp / Vượt Cấp (Admin Override)
                  </h3>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 uppercase tracking-wider">
                    Thẩm quyền Tối cao Tầng 0 · Nghị định 85/2016
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={closeOverrideModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Mã hồ sơ:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {overrideModal.item.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Loại hồ sơ & Chủ thể:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {overrideModal.item.type} · {overrideModal.item.submitterName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Địa phương sở tại:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {overrideModal.item.provinceName || overrideModal.item.province || "Sở KH&CN TP. Hà Nội"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Tình trạng SLA:</span>
                <span className="text-rose-600 font-bold">
                  {overrideModal.item.isSlaBreached
                    ? `Quá hạn ${overrideModal.item.slaOverdueHours || 4}h (SLA chuẩn 72h)`
                    : "Đang trong hạn xử lý (Duyệt khẩn cấp)"}
                </span>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="override-reason" className="font-bold text-slate-900 dark:text-white">
                    Lý do giải trình can thiệp duyệt vượt cấp *{" "}
                    <span className="text-rose-500 font-normal">(Tối thiểu 20 ký tự để lưu vết Audit Log)</span>
                  </label>
                  <span
                    id="char-counter"
                    className={`text-xs font-mono font-bold ${
                      overrideModal.reason.trim().length >= 20 ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {overrideModal.reason.trim().length} / 20 ký tự
                  </span>
                </div>
                <textarea
                  id="override-reason"
                  rows={4}
                  value={overrideModal.reason}
                  onChange={(e) => setOverrideModal({ ...overrideModal, reason: e.target.value })}
                  placeholder="Nhập lý do cụ thể (Ví dụ: Hồ sơ đã quá hạn SLA cấp Sở 76h; Sở KH&CN chưa phân công xử lý; Super Admin can thiệp duyệt thay phục vụ tiến độ Hội chợ TechConnect Quốc gia...)"
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                />
                {overrideModal.error && (
                  <p id="reason-error" className="text-xs text-rose-500 font-bold mt-1">
                    {overrideModal.error}
                  </p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    id="override-commit"
                    checked={overrideModal.committed}
                    onChange={(e) => setOverrideModal({ ...overrideModal, committed: e.target.checked })}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-xs leading-relaxed text-amber-900 dark:text-amber-200 font-medium">
                    <strong>Cam kết trách nhiệm:</strong> Tôi xác nhận thực hiện phê duyệt can thiệp vượt cấp thay cho Sở KH&CN và chịu trách nhiệm công vụ trước Bộ KH&CN.
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={closeOverrideModal}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs"
              >
                Đóng / Hủy Bỏ
              </button>
              <button
                type="button"
                id="btn-submit-override"
                disabled={overrideModal.reason.trim().length < 20 || !overrideModal.committed || saving}
                onClick={submitOverride}
                className={`px-5 py-2 rounded-xl font-bold transition text-xs shadow-md inline-flex items-center gap-1.5 ${
                  overrideModal.reason.trim().length >= 20 && overrideModal.committed && !saving
                    ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                    : "bg-rose-600 text-white opacity-50 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác Nhận Duyệt Can Thiệp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Reject / Request Changes / Revoke) */}
      {actionModal.isOpen && actionModal.item && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                {actionModal.type === "REVOKE" ? (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Thu hồi quyết định phê duyệt</span>
                  </>
                ) : actionModal.type === "REJECT" ? (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Từ Chối Hồ Sơ</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <span>Yêu Cầu Bổ Sung Hồ Sơ</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setActionModal({ isOpen: false, type: null, item: null, reason: "" })}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && <p role="alert" className="text-xs text-rose-600 font-bold">{actionError}</p>}
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Đối tượng: <strong>{actionModal.item.submitterName}</strong> ({actionModal.item.id})
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                Lý do thẩm định (Bắt buộc từ 10 - 500 ký tự) *
              </label>
              <textarea
                rows={4}
                maxLength={500}
                disabled={saving}
                value={actionModal.reason}
                onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
                placeholder={
                  actionModal.type === "REVOKE"
                    ? "Nhập lý do thu hồi quyền chuyên gia (sai phạm, vi phạm đạo đức nghiên cứu... tối thiểu 10 ký tự)..."
                    : actionModal.type === "REJECT"
                    ? "Nhập lý do không đạt tiêu chí chuyên gia hoặc hồ sơ không hợp lệ..."
                    : "Nhập các thông tin / văn bằng cần chuyên gia bổ sung lại..."
                }
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Tối thiểu 10 ký tự</span>
                <span className={actionModal.reason.trim().length < 10 ? "text-rose-500 font-semibold" : "text-emerald-600 font-semibold"}>
                  {actionModal.reason.trim().length}/500 ký tự hợp lệ
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActionModal({ isOpen: false, type: null, item: null, reason: "" })}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                Hủy bỏ
              </button>
              <AppButton
                variant={actionModal.type === "REJECT" || actionModal.type === "REVOKE" ? "danger" : "primary"}
                type="button"
                onClick={handleConfirmAction}
                disabled={saving || actionModal.reason.trim().length < 10 || actionModal.reason.trim().length > 500}
                className="px-4 py-2 text-xs font-semibold"
              >
                Xác nhận {actionModal.type === "REVOKE" ? "Thu Hồi Quyền" : actionModal.type === "REJECT" ? "Từ Chối" : "Yêu Cầu"}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminApprovalsSkeleton() {
  return (
    <div className="w-full space-y-5 animate-pulse">
      <div className="h-6 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      <div className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
    </div>
  );
}

export default function AdminApprovalsPage() {
  return (
    <Suspense fallback={<AdminApprovalsSkeleton />}>
      <AdminApprovalsContent />
    </Suspense>
  );
}

