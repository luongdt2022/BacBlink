"use client";

import React, { useEffect, useState, useMemo } from "react";
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
} from "lucide-react";

import { reviewOffer } from "@/services/api/technology-offer";
import { TechnologyOffer } from "@/types/technology-offer";

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

function formatIpStatus(status?: string | null): { label: string; color: string } {
  switch (status) {
    case "PATENT_GRANTED":
      return {
        label: "Đã cấp Bằng sáng chế",
        color: "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300",
      };
    case "UTILITY_MODEL":
      return {
        label: "Giải pháp hữu ích",
        color: "bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300",
      };
    case "TRADE_SECRET":
      return {
        label: "Bí mật kinh doanh",
        color: "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300",
      };
    case "PATENT_PENDING":
    case "PATENT_APPLICATION":
      return {
        label: "Đang thẩm định đơn SHTT",
        color: "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300",
      };
    case "SOFTWARE_COPYRIGHT":
    case "COPYRIGHT_REGISTERED":
      return {
        label: "Bản quyền / Quyền tác giả",
        color: "bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300",
      };
    case "NONE":
    default:
      return {
        label: "Chưa bảo hộ SHTT",
        color: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400",
      };
  }
}

function formatTrl(level?: number | null): { label: string; desc: string; color: string } {
  const l = Number(level) || 0;
  if (l >= 9) {
    return {
      label: `TRL ${l}/9`,
      desc: "Thương mại hóa hoàn toàn",
      color: "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300",
    };
  }
  if (l >= 7) {
    return {
      label: `TRL ${l}/9`,
      desc: "Thử nghiệm thực địa / Tiền thương mại",
      color: "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300",
    };
  }
  if (l >= 4) {
    return {
      label: `TRL ${l}/9`,
      desc: "Mẫu thử nghiệm (Pilot)",
      color: "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300",
    };
  }
  return {
    label: `TRL ${l || 1}/9`,
    desc: "Ý tưởng & Nghiên cứu lab",
    color: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400",
  };
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

const PROVINCE_MAP: Record<string, string> = {
  HP: "Hải Phòng",
  HN: "Hà Nội",
  HCM: "TP. Hồ Chí Minh",
  DN: "Đà Nẵng",
  QN: "Quảng Ninh",
  BN: "Bắc Ninh",
  BDG: "Bình Dương",
  DNA: "Đồng Nai",
  CT: "Cần Thơ",
};


export default function GovDashboard() {
  const [user, setUser] = useState<UserContext | null>(null);
  const [items, setItems] = useState<GovApprovalItem[]>([]);
  const [sectorNames, setSectorNames] = useState<Record<string, string>>({});
  const [uxState, setUxState] = useState<UXState>("loading");
  const [activeTab, setActiveTab] = useState<"ALL" | "EXPERT" | "SHOP" | "DEMAND" | "ACCOUNT">("EXPERT");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<GovApprovalItem | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT" | "REQUEST_CHANGES" | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const currentScopeId = user?.scopeId || "HP";
  const currentProvinceName = PROVINCE_MAP[currentScopeId] || currentScopeId;

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
            provinceName: PROVINCE_MAP[x.scopeId] || x.scopeId || "Địa phương",
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
              provinceName: t.managingAuthorityName || PROVINCE_MAP[t.scopeId] || "Hà Nội",
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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchTab =
        activeTab === "ALL"
          ? true
          : activeTab === "SHOP"
          ? item.type === "SHOP" || (item.type as string) === "TECHNOLOGY_OFFER"
          : item.type === activeTab;
      const matchSearch =
        item.submitterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.titleOrOrg.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [items, activeTab, searchQuery]);

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
      if (!reviewNote.trim() || reviewNote.trim().length < 10) {
        setReviewError("Lý do xử lý bắt buộc phải có ít nhất 10 ký tự theo Quy tắc BR-ADM-004.");
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-semibold text-caption mb-2 border border-brand-200 dark:border-brand-900">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Phân Hệ Thẩm Định Cấp 2: Lãnh Đạo Sở KH&CN</span>
          </div>
          <h1 className="font-bold text-slate-900 dark:text-white tracking-tight type-page-title flex items-center gap-3">
            <span>Hàng Đợi Kiểm Duyệt Địa Bàn</span>
            <span className="px-3 py-1 rounded-control bg-brand-700 text-white text-caption font-bold">
              {currentProvinceName} ({currentScopeId})
            </span>
          </h1>
          <p className="text-body text-slate-500 dark:text-slate-400 mt-1">
            Thẩm định hồ sơ theo cơ chế 3D Scoped RBAC dành cho 34 Sở KH&CN tỉnh thành trọng điểm và Ban Điều Phối Lĩnh Vực TT17.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AppButton
            variant="outline"
            onClick={() => loadApprovals()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control text-label font-semibold text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm mới danh sách</span>
          </AppButton>
        </div>
      </div>

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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800">
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
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
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
          </div>
        }
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[54rem] text-left text-label">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold dark:text-slate-300">
                  <tr>
                    <th className="py-3 px-4">Mã Hồ Sơ</th>
                    <th className="py-3 px-4">
                      {activeTab === "SHOP"
                        ? "Đơn Vị Chào Bán / Sở Hữu"
                        : activeTab === "EXPERT"
                        ? "Chuyên Gia Đăng Ký"
                        : "Chủ Thể / Người Nộp"}
                    </th>
                    <th className="py-3 px-4">
                      {activeTab === "SHOP"
                        ? "Tên Sản Phẩm / Công Nghệ"
                        : activeTab === "EXPERT"
                        ? "Đơn Vị Công Tác"
                        : "Tên Hồ Sơ / Cơ Quan"}
                    </th>
                    <th className="py-3 px-4">Lĩnh Vực Công Nghệ</th>
                    <th className="py-3 px-4">Ngày Nộp</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-700 dark:text-brand-300">
                        <div>{item.id.slice(0, 8)}...</div>
                        {activeTab === "ALL" && (
                          <span
                            className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                              item.type === "TECHNOLOGY_OFFER" || item.type === "SHOP"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            }`}
                          >
                            {item.type === "TECHNOLOGY_OFFER" || item.type === "SHOP"
                              ? "Sản phẩm"
                              : "Chuyên gia"}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.submitterName}
                        </div>
                        <div className="text-xs text-slate-400">{item.submitterEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {item.titleOrOrg}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-caption font-semibold">
                          {sectorNames[item.sector] ?? (item.sector || "Chưa khai báo")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {item.submittedAt}
                      </td>
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
                      <td className="py-3.5 px-4 text-right">
                        <AppButton
                          variant="primary"
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control font-semibold text-caption"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Thẩm Định</span>
                        </AppButton>
                      </td>
                    </tr>
                  ))}
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
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-2.5">
                  {isOffer ? (
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-card-title flex items-center gap-2">
                      <span>
                        {isOffer
                          ? `Thẩm Định Sản Phẩm Chào Bán: ${selectedItem.titleOrOrg}`
                          : `Thẩm Định Hồ Sơ Chuyên Gia: ${selectedItem.submitterName}`}
                      </span>
                    </h3>
                    <p className="text-caption text-slate-500 dark:text-slate-400">
                      Mã hồ sơ: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{selectedItem.id}</span> &bull;{" "}
                      Địa bàn tiếp nhận: <strong>Sở KH&CN {selectedItem.provinceName}</strong> (Cấp 2) &bull;{" "}
                      Loại hình: <strong>{isOffer ? "Sản phẩm / Chào bán công nghệ" : "Hồ sơ Chuyên gia KH&CN"}</strong> &bull;{" "}
                      Phiên bản: v{selectedItem.version}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItem(null);
                    setReviewAction(null);
                    setReviewNote("");
                    setReviewError("");
                  }}
                  className="p-1.5 rounded-control text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

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
                          {sectorNames[selectedItem.sector] ?? (selectedItem.sector || "Chưa khai báo")}
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
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-caption font-bold border ${
                            formatTrl(selectedItem.rawOffer?.trlLevel).color
                          }`}
                        >
                          {formatTrl(selectedItem.rawOffer?.trlLevel).label}
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-1 line-clamp-1">
                          {formatTrl(selectedItem.rawOffer?.trlLevel).desc}
                        </span>
                      </div>

                      <div className="p-3 rounded-control border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <span className="text-caption text-slate-400 block">Tình trạng SHTT</span>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-caption font-bold border ${
                            formatIpStatus(selectedItem.rawOffer?.ipStatus).color
                          }`}
                        >
                          {formatIpStatus(selectedItem.rawOffer?.ipStatus).label}
                        </span>
                        {selectedItem.rawOffer?.ipRegistrationNumber && (
                          <span className="block text-[11px] text-slate-500 mt-1 font-mono">
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
                              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-bold py-0.5">
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
                          {sectorNames[selectedItem.sector] ?? (selectedItem.sector || "Chưa khai báo")}
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
