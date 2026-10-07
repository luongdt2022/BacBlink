"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import { AppButton } from "@/components/ui/design-system";
import { Async } from "@/components/ui/async";
import { API_BASE, readApiError } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { getActiveSectors } from "@/lib/master-data-client";
import { AdminNav } from "@/components/admin/admin-nav";

export interface ApprovalItem {
  id: string;
  submitterName: string;
  submitterEmail: string;
  type: "EXPERT" | "SHOP" | "DEMAND" | "ACCOUNT" | "FACILITY";
  titleOrOrg: string;
  province: string;
  sector: string;
  submittedAt: string;
  status: "PENDING_REVIEW" | "PENDING_APPROVAL" | "APPROVED" | "CHANGES_REQUESTED" | "REJECTED";
  cvOrDocName?: string;
  degree?: string;
  summary?: string;
  version: number;
}

interface ApprovalDto {
  id: string; requestType: string; scopeType: string; scopeId?: string;
  payloadJson: string; status: ApprovalItem["status"]; version: number; createdAt: string;
  user?: { firstName?: string; lastName?: string; email?: string; organization?: string };
}
function toItem(dto: ApprovalDto): ApprovalItem {
  let payload: Record<string, unknown> = {};
  try { const parsed = JSON.parse(dto.payloadJson); if (parsed && typeof parsed === "object") payload = Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key.toLowerCase(), value])); } catch { /* The request remains reviewable without optional payload fields. */ }
  const value = (key: string) => typeof payload[key.toLowerCase()] === "string" ? payload[key.toLowerCase()] as string : "";
  const sectors = payload.expertisesectors;
  return { id: dto.id, type: (dto.requestType === "INSTITUTION" ? "FACILITY" : dto.requestType) as ApprovalItem["type"],
    submitterName: value("fullName") || [dto.user?.firstName, dto.user?.lastName].filter(Boolean).join(" ") || "Chưa có tên chủ thể",
    submitterEmail: dto.user?.email || "", titleOrOrg: value("organizationName") || dto.user?.organization || "Chưa khai báo đơn vị",
    province: dto.scopeType === "PROVINCE" ? dto.scopeId || "" : "",
    sector: Array.isArray(sectors) ? sectors.filter((x): x is string => typeof x === "string").join(", ") : value("sectorCode") || (dto.scopeType === "SECTOR" ? dto.scopeId || "" : ""),
    submittedAt: new Date(dto.createdAt).toLocaleString("vi-VN"), status: dto.status, version: dto.version,
    degree: value("degree"), summary: value("consultingSummary") };
}

export default function AdminApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "SHOP" | "DEMAND" | "EXPERT" | "ACCOUNT" | "FACILITY">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [sectorNames, setSectorNames] = useState<Record<string, string>>({});
  const [taxonomyError, setTaxonomyError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const loadApprovals = useCallback(async () => {
    setLoading(true); setLoadError("");
    try {
      const response = await fetch(`${API_BASE}/api/v1/governance/approvals?page=${page}&limit=100`, { headers: authClient.getAuthHeaders(), cache: "no-store" });
      if (!response.ok) throw new Error(await readApiError(response, "Không tải được hồ sơ thẩm định."));
      const payload = await response.json();
      if (!payload.success || !Array.isArray(payload.data)) throw new Error("Dữ liệu hồ sơ không hợp lệ.");
      const items = (payload.data as ApprovalDto[]).map(toItem);
      setApprovals(items); setTotalPages(payload.totalPages || 1);
      setSelectedItem(current => current ? items.find(item => item.id === current.id) || null : null);
    } catch (error) { setLoadError(error instanceof Error ? error.message : "Không thể kết nối máy chủ."); }
    finally { setLoading(false); }
  }, [page]);
  useEffect(() => { void loadApprovals(); }, [loadApprovals]);
  useEffect(() => { getActiveSectors().then(items => { setSectorNames(Object.fromEntries(items.map(item => [item.code, item.name]))); setTaxonomyError(""); }).catch(() => setTaxonomyError("Chưa tải được tên lĩnh vực; hồ sơ đang hiển thị mã đã khai báo.")); }, []);
  const sectorLabel = (codes: string) => codes.split(", ").filter(Boolean).map(code => sectorNames[code] || code).join(", ") || "Chưa khai báo lĩnh vực";

  // Modal states for Action (Reject / Request Changes / Revoke)
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

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter items
  const filteredItems = approvals.filter((item) => {
    if (activeTab !== "ALL" && item.type !== activeTab) return false;
    if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.submitterName.toLowerCase().includes(q);
      const matchEmail = item.submitterEmail.toLowerCase().includes(q);
      const matchTitle = item.titleOrOrg.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchTitle && !matchId) return false;
    }
    return true;
  });

  const review = async (item: ApprovalItem, action: string, reviewNote?: string) => {
    if (saving) return false;
    setSaving(true); setActionError("");
    try {
      const response = await fetch(`${API_BASE}/api/v1/governance/approvals/${item.id}/review`, {
        method: "PUT", headers: authClient.getAuthHeaders(), body: JSON.stringify({ action, expectedVersion: item.version, reviewNote }),
      });
      if (!response.ok) throw new Error(await readApiError(response, "Không lưu được quyết định thẩm định."));
      const payload = await response.json();
      if (!payload.success || !payload.data) throw new Error("Máy chủ chưa xác nhận quyết định.");
      const updated = toItem(payload.data as ApprovalDto);
      setApprovals(items => items.map(current => current.id === item.id ? updated : current));
      setSelectedItem(current => current?.id === item.id ? updated : current);
      showToast("Đã lưu quyết định thẩm định."); return true;
    } catch (error) { setActionError(error instanceof Error ? error.message : "Không thể kết nối máy chủ."); return false; }
    finally { setSaving(false); }
  };
  const handleApprove = (item: ApprovalItem) => { void review(item, "APPROVE"); };

  const handleOpenActionModal = (item: ApprovalItem, type: "REJECT" | "CHANGES_REQUESTED" | "REVOKE") => {
    setActionError("");
    setActionModal({
      isOpen: true,
      type,
      item,
      reason: "",
    });
  };

  const handleConfirmAction = async () => {
    if (!actionModal.item || !actionModal.type || actionModal.reason.trim().length < 10 || actionModal.reason.trim().length > 500) return;
    const action = actionModal.type === "CHANGES_REQUESTED" ? "REQUEST_CHANGES" : actionModal.type;
    if (await review(actionModal.item, action, actionModal.reason.trim())) setActionModal({ isOpen: false, type: null, item: null, reason: "" });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Navigation Hub */}
      <AdminNav />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-brand-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-teal-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" />
          <span className="text-body font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-caption font-bold mb-2">
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Thẩm định hồ sơ</span>
          </div>
          <h1 className="font-bold text-slate-900 dark:text-white tracking-tight type-page-title">
            Hàng Đợi Phê Duyệt & Thẩm Định Hồ Sơ Phân Cấp
          </h1>
          <p className="text-body text-slate-500 dark:text-slate-400 mt-1">
            Quy trình Maker-Checker: Đối soát thông tin định danh, văn bằng khoa học và tính pháp lý hồ sơ trước khi cấp quyền tác nghiệp chính thức.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/60 dark:border-amber-900 dark:text-amber-200 px-3 py-1.5 rounded-control font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Chờ thẩm định trong trang: {approvals.filter((a) => (a.status === "PENDING_APPROVAL" || a.status === "PENDING_REVIEW")).length} hồ sơ</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Tabs & Search Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-surface border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
        {/* Tabs Types */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: "ALL", label: "Tất cả", count: approvals.filter((a) => (a.status === "PENDING_APPROVAL" || a.status === "PENDING_REVIEW")).length },
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
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-3.5 py-1.5 rounded-control text-label font-semibold transition flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-brand-700 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                {tab.alias && <span className="hidden">{tab.alias}</span>}
                <span
                  data-testid={`badge-${tab.key.toLowerCase()}`}
                  className={`text-caption px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.key
                      ? "bg-brand-900 text-teal-200"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-label border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-control px-3 py-1.5 focus:outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING_REVIEW">Chờ sơ kiểm</option>
              <option value="PENDING_APPROVAL">Chờ duyệt (Pending)</option>
              <option value="APPROVED">Đã phê duyệt (Approved)</option>
              <option value="CHANGES_REQUESTED">Yêu cầu bổ sung</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm nhanh theo Tên chuyên gia, Đơn vị viện trường, Email, Mã hồ sơ..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-control text-body text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>
      </div>

      {actionError && <p role="alert" className="text-body text-rose-700">{actionError}</p>}
      <Async state={loading ? "loading" : loadError ? "error" : filteredItems.length === 0 ? "empty" : taxonomyError ? "partial" : "success"} errorMessage={loadError} onRetry={() => void loadApprovals()} partialWarning={taxonomyError} emptyContent={<p className="surface-card p-8 text-body text-center">Không tìm thấy hồ sơ nào phù hợp bộ lọc.</p>}>
      {/* Main Table & Details Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table List (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-surface border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-caption font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Mã / Chủ thể</th>
                  <th className="py-3 px-3">Phân loại</th>
                  <th className="py-3 px-3">Địa bàn / Đơn vị</th>
                  <th className="py-3 px-3">Ngày nộp</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="font-medium">Không tìm thấy hồ sơ nào phù hợp bộ lọc.</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          isSelected ? "bg-brand-50/70 dark:bg-brand-950/40 border-l-4 border-l-brand-700" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{item.submitterName}</span>

                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{item.id}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                              item.type === "EXPERT"
                                ? "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200"
                                : item.type === "SHOP"
                                ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200"
                                : item.type === "DEMAND"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                                : item.type === "ACCOUNT"
                                ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                            }`}
                          >
                            {item.type === "EXPERT" && <GraduationCap className="w-3 h-3" />}
                            {item.type === "SHOP" && <ShoppingBag className="w-3 h-3" />}
                            {item.type === "DEMAND" && <Building2 className="w-3 h-3" />}
                            {item.type === "ACCOUNT" && <UserCheck className="w-3 h-3" />}
                            {item.type === "FACILITY" && <Building2 className="w-3 h-3" />}
                            <span>{item.type}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="text-slate-800 dark:text-slate-200 text-xs font-medium truncate max-w-[140px]" title={item.titleOrOrg}>
                            {item.titleOrOrg}
                          </div>
                          <div className="text-caption text-slate-500">{item.province}</div>
                        </td>

                        <td className="py-3.5 px-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {item.submittedAt}
                        </td>

                        <td className="py-3.5 px-3">
                          {(item.status === "PENDING_APPROVAL" || item.status === "PENDING_REVIEW") && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                              <Clock className="w-3 h-3" />
                              <span>Chờ duyệt</span>
                            </span>
                          )}
                          {item.status === "APPROVED" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Đã duyệt</span>
                            </span>
                          )}
                          {item.status === "CHANGES_REQUESTED" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200">
                              <AlertCircle className="w-3 h-3" />
                              <span>Bổ sung</span>
                            </span>
                          )}
                          {item.status === "REJECTED" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200">
                              <XCircle className="w-3 h-3" />
                              <span>Từ chối</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Xem chi tiết hồ sơ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Item Review Card / Action Drawer */}
        <div className="bg-white dark:bg-slate-900 rounded-surface border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          {selectedItem ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-caption font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider">
                    Thẩm định Hồ sơ {selectedItem.type}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-card-title mt-0.5">
                    {selectedItem.submitterName}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedItem.submitterEmail}</p>
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
              <div className="space-y-3 text-label">
                <div>
                  <span className="text-slate-500 text-xs block">Học vị / Học hàm</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {selectedItem.degree || "Chưa khai báo"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-xs block">Đơn vị Viện / Trường công tác</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {selectedItem.titleOrOrg}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-xs block">Lĩnh vực chuyên môn</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {sectorLabel(selectedItem.sector)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-xs block">Tệp LLKH / CV đính kèm</span>
                  <div className="mt-1 flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate flex-1">
                      {selectedItem.cvOrDocName || "Chưa có thông tin tệp đính kèm"}
                    </span>
                    <span className="text-caption text-brand-700 dark:text-teal-300 font-bold underline ">
                      Chưa có liên kết
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 text-xs block">Tiểu sử tóm tắt</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {selectedItem.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Thông tin cam kết: xem trong hồ sơ gốc</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Approver */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                {selectedItem.status !== "APPROVED" ? (
                  <>
                    <AppButton
                      variant="primary"
                      type="button"
                      disabled={saving || selectedItem.status === "REJECTED"}
                      onClick={() => handleApprove(selectedItem)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-control shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Phê duyệt hồ sơ</span>
                    </AppButton>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(selectedItem, "CHANGES_REQUESTED")}
                        className="px-3 py-2 border border-amber-300 text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-200 rounded-control text-xs font-semibold transition"
                      >
                        Yêu cầu Bổ sung
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(selectedItem, "REJECT")}
                        className="px-3 py-2 border border-rose-300 text-rose-800 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-200 rounded-control text-xs font-semibold transition"
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
                      <p className="text-caption text-slate-500 mt-1">
                        Quyết định phê duyệt đã được lưu.
                      </p>
                    </div>

                    {/* Quyền Can Thiệp Tối Cao BR-ADM-007: Hậu Kiểm & Thu Hồi Quyền */}
                    {authClient.hasRole(["SUPER_ADMIN", "OPERATOR_ADMIN"]) && <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/60 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                        <ShieldCheck className="w-4 h-4 text-rose-600" />
                        <span>Hậu kiểm trung ương</span>
                      </div>
                      <p className="text-caption text-slate-600 dark:text-slate-400">
                        Nếu phát hiện sai phạm hoặc vi phạm đạo đức nghiên cứu, Quản trị viên Trung ương có thẩm quyền thu hồi quyết định phê duyệt cấp dưới.
                      </p>
                      <AppButton
                        variant="danger"
                        type="button"
                        onClick={() => handleOpenActionModal(selectedItem, "REVOKE")}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-control text-xs shadow-xs"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Thu hồi quyết định</span>
                      </AppButton>
                    </div>}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <ClipboardCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-body font-medium">Chọn một hồ sơ từ danh sách bên trái để đối soát và thẩm định.</p>
            </div>
          )}
        </div>
      </div>

      </Async>
      <div className="flex justify-end items-center gap-3 text-label">
        <AppButton variant="outline" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)}>Trang trước</AppButton>
        <span>Trang {page}/{totalPages}</span>
        <AppButton variant="outline" disabled={loading || page >= totalPages} onClick={() => setPage(value => value + 1)}>Trang sau</AppButton>
      </div>
      {/* Action Modal (Reject / Request Changes / Revoke with Reason >= 10 chars) */}
      {actionModal.isOpen && actionModal.item && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-surface p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-card-title flex items-center gap-2">
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

            {actionError && <p role="alert" className="text-body text-rose-700">{actionError}</p>}
            <p className="text-body text-slate-600 dark:text-slate-300">
              Đối tượng: <strong>{actionModal.item.submitterName}</strong> ({actionModal.item.id})
            </p>

            <div>
              <label className="block text-label font-medium text-slate-700 dark:text-slate-200 mb-1">
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
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-control text-body text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
              <div className="flex justify-between text-caption text-slate-400 mt-1">
                <span>Tối thiểu 10 ký tự</span>
                <span className={actionModal.reason.length < 10 ? "text-rose-500 font-semibold" : "text-emerald-600"}>
                  {actionModal.reason.length}/500
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActionModal({ isOpen: false, type: null, item: null, reason: "" })}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-control text-label font-semibold hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                Hủy bỏ
              </button>
              <AppButton
                variant={actionModal.type === "REJECT" || actionModal.type === "REVOKE" ? "danger" : "primary"}
                type="button"
                onClick={handleConfirmAction}
                disabled={saving || actionModal.reason.trim().length < 10 || actionModal.reason.trim().length > 500}
                className="px-4 py-2 text-label font-semibold"
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
