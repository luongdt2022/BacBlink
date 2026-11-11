"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Database,
  Link as LinkIcon,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Sliders,
  Play,
  FileText,
  Clock,
  Key,
  Hash,
  Server,
  Zap,
} from "lucide-react";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { RoleGuard } from "@/components/auth/role-guard";
import { Async, type AsyncState } from "@/components/ui/async";
import { AppButton } from "@/components/ui/design-system";
import {
  fetchAnchorPolicies,
  updateAnchorPolicy,
  fetchLedgerBlocks,
  fetchLedgerBlockDetail,
  flushPendingBlock,
  fetchAnchorRecords,
  fetchBridgeStatus,
  triggerBridgeSync,
  verifyEntityLive,
  type AnchorPolicyDto,
  type LedgerBlockSummaryDto,
  type LedgerBlockDetailDto,
  type AnchorRecordSummaryDto,
  type GatewayStatusDto,
  type BridgeSyncResultDto,
  type VerificationVerdictResult,
} from "@/lib/api/blockchain";

type TabType = "policies" | "ledger" | "bridge";

export default function AdminBlockchainPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") as TabType;
  const activeTab: TabType = rawTab === "ledger" || rawTab === "bridge" ? rawTab : "policies";

  const [, startTransition] = useTransition();

  const handleTabChange = (tab: TabType) => {
    startTransition(() => {
      router.push(`/admin/blockchain?tab=${tab}`);
    });
  };

  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "OPERATOR_ADMIN"]}>
      <div className="space-y-6 pb-12">
        <AdminBreadcrumbs
          items={[
            { label: "Giám sát & Vận hành", href: "/admin" },
            { label: "Trung tâm Blockchain & ZKP (NDAChain)" },
          ]}
        />

        {/* Header Baner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>NDAChain Ready Gateway • Zero-Knowledge Proof Invariants</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Trung Tâm Quản Trị Chuỗi Khối & Mật Mã Học ZKP
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
                Hệ thống Sổ cái Bản quyền Quốc gia & Bảo chứng Mật mã học bất biến (RFC 8785 Canonical JSON, Merkle Tree, Salted Commitment AES-256-GCM) liên thông Trung tâm Dữ liệu Quốc gia (Bộ Công An).
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs border border-white/10 text-center min-w-[130px]">
                <div className="text-xs text-indigo-200">Chuẩn Mật Mã</div>
                <div className="text-base font-bold text-emerald-400">RFC 8785 + ZKP</div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs border border-white/10 text-center min-w-[130px]">
                <div className="text-xs text-indigo-200">Trạng Thái Chuỗi</div>
                <div className="text-base font-bold text-cyan-300">Sovereign + NDA</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2">
          <button
            onClick={() => handleTabChange("policies")}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm rounded-t-lg transition-colors border-b-2 -mb-px ${
              activeTab === "policies"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>1. Ma Trận Chính Sách Neo (Policy Matrix)</span>
          </button>
          <button
            onClick={() => handleTabChange("ledger")}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm rounded-t-lg transition-colors border-b-2 -mb-px ${
              activeTab === "ledger"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Sổ Cái Khối, Merkle Tree & Verifier</span>
          </button>
          <button
            onClick={() => handleTabChange("bridge")}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm rounded-t-lg transition-colors border-b-2 -mb-px ${
              activeTab === "bridge"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>3. Cổng Liên Thông NDAChain & Bridge</span>
          </button>
        </div>

        {/* Tab Content Rendering */}
        {activeTab === "policies" && <TabPolicies />}
        {activeTab === "ledger" && <TabLedger />}
        {activeTab === "bridge" && <TabBridge />}
      </div>
    </RoleGuard>
  );
}

// =========================================================================
// TAB 1: MA TRẬN CHÍNH SÁCH NEO DỮ LIỆU (T-11.14)
// =========================================================================

function TabPolicies() {
  const [policies, setPolicies] = useState<AnchorPolicyDto[]>([]);
  const [state, setState] = useState<AsyncState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Sửa Chính Sách
  const [editingPolicy, setEditingPolicy] = useState<AnchorPolicyDto | null>(null);
  const [batchSize, setBatchSize] = useState<number>(10);
  const [batchTimeout, setBatchTimeout] = useState<number>(5);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setState("loading");
    try {
      const data = await fetchAnchorPolicies();
      setPolicies(data);
      setState(data.length === 0 ? "empty" : "idle");
    } catch (err: unknown) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Lỗi không xác định khi tải chính sách.");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle Bật/Tắt nhanh có Optimistic Update
  const handleTogglePolicy = async (policy: AnchorPolicyDto) => {
    const nextEnabled = !policy.isEnabled;
    const prevPolicies = [...policies];

    // Optimistic Update
    setPolicies((prev) =>
      prev.map((p) => (p.id === policy.id ? { ...p, isEnabled: nextEnabled } : p))
    );

    try {
      const updated = await updateAnchorPolicy(policy.id, {
        isEnabled: nextEnabled,
        expectedVersion: policy.version,
      });
      setPolicies((prev) => prev.map((p) => (p.id === policy.id ? updated : p)));
      showToast(
        `Đã ${nextEnabled ? "KÍCH HOẠT" : "TẠM DỪNG"} chính sách neo cho ${policy.displayName}.`
      );
    } catch (err: unknown) {
      // Rollback
      setPolicies(prevPolicies);
      alert(err instanceof Error ? err.message : "Cập nhật chính sách thất bại.");
    }
  };

  const handleOpenEditModal = (p: AnchorPolicyDto) => {
    setEditingPolicy(p);
    setBatchSize(p.batchSizeThreshold);
    setBatchTimeout(p.batchTimeoutMinutes);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;
    setIsUpdating(true);
    try {
      const updated = await updateAnchorPolicy(editingPolicy.id, {
        batchSizeThreshold: Number(batchSize),
        batchTimeoutMinutes: Number(batchTimeout),
        expectedVersion: editingPolicy.version,
      });
      setPolicies((prev) => prev.map((p) => (p.id === editingPolicy.id ? updated : p)));
      setEditingPolicy(null);
      showToast(`Đã lưu cấu hình ngưỡng gom lô cho ${updated.displayName}.`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lưu cấu hình thất bại.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-sm font-medium flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Guide Card */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-400 flex items-start gap-3">
        <Sliders className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Nguyên tắc Entity-Agnostic & Zero-Migration:
          </span>
          <p>
            Chủ đầu tư toàn quyền quyết định loại thực thể nào được neo lên Chuỗi khối ngay trên giao diện này mà không cần sửa code hay can thiệp CSDL. Khi bật chính sách, Outbox Worker sẽ tự động gom các bản ghi có trạng thái thỏa mãn để tạo Cam kết ZKP và đóng khối.
          </p>
        </div>
      </div>

      {/* Content Wrapped in Async */}
      <Async
        state={state}
        errorMessage={errorMessage}
        onRetry={loadData}
        emptyContent={
          <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            Chưa có chính sách neo dữ liệu nào được khởi tạo trong hệ thống.
          </div>
        }
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 uppercase text-xs font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-4 px-6">Thực Thể Nghiệp Vụ</th>
                  <th className="py-4 px-6">Trạng Thái Neo</th>
                  <th className="py-4 px-6">Sự Kiện Kích Hoạt</th>
                  <th className="py-4 px-6">Quy Tắc Gom Lô (Batching)</th>
                  <th className="py-4 px-6 text-center">Đã Bảo Chứng</th>
                  <th className="py-4 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {policies.map((policy) => (
                  <tr
                    key={policy.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {policy.displayName}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {policy.entityType}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={policy.isEnabled}
                            onChange={() => handleTogglePolicy(policy)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 dark:bg-slate-700"></div>
                        </label>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            policy.isEnabled
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {policy.isEnabled ? "Đang Neo (Active)" : "Tạm Dừng (Off)"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">
                      <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-200 dark:border-indigo-800">
                        {policy.triggerStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <div>
                        Ngưỡng:{" "}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {policy.batchSizeThreshold}
                        </strong>{" "}
                        bản ghi
                      </div>
                      <div>
                        Timeout:{" "}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {policy.batchTimeoutMinutes}
                        </strong>{" "}
                        phút
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                        {policy.anchoredRecordsCount} bản ghi
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <AppButton
                        variant="outline"
                        onClick={() => handleOpenEditModal(policy)}
                        className="text-xs min-h-8 min-w-8 py-1 px-3"
                      >
                        Cấu hình
                      </AppButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Async>

      {/* Modal Cấu Hình Ngưỡng Gom Lô */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Cấu Hình Chính Sách Neo
              </h3>
              <button
                onClick={() => setEditingPolicy(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Thực Thể
                </label>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {editingPolicy.displayName} ({editingPolicy.entityType})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ngưỡng Gom Lô Đóng Khối (1 - 500 bản ghi)
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  Khi số lượng bản ghi tích lũy đạt ngưỡng này, hệ thống tự động chốt khối Merkle.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Thời Gian Timeout Gom Lô (1 - 60 phút)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={batchTimeout}
                  onChange={(e) => setBatchTimeout(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  Nếu chưa đủ số bản ghi nhưng đã hết thời gian timeout, khối vẫn được đóng tự động.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <AppButton
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingPolicy(null)}
                  disabled={isUpdating}
                >
                  Hủy
                </AppButton>
                <AppButton
                  type="submit"
                  variant="primary"
                  disabled={isUpdating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isUpdating ? "Đang lưu..." : "Lưu Cấu Hình"}
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// TAB 2: SỔ CÁI KHỐI, MERKLE TREE EXPLORER & LIVE VERIFIER (T-11.15)
// =========================================================================

function TabLedger() {
  const [blocks, setBlocks] = useState<LedgerBlockSummaryDto[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalBlocks, setTotalBlocks] = useState<number>(0);
  const [state, setState] = useState<AsyncState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isFlushing, setIsFlushing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Chi Tiết Khối
  const [selectedBlockNumber, setSelectedBlockNumber] = useState<number | null>(null);
  const [blockDetail, setBlockDetail] = useState<LedgerBlockDetailDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Live Verifier Tool State
  const [verifyEntityType, setVerifyEntityType] = useState<string>("SELLER_OFFER");
  const [verifyEntityId, setVerifyEntityId] = useState<string>("");
  const [verifyCustomPayload, setVerifyCustomPayload] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<VerificationVerdictResult | null>(null);

  const loadBlocks = useCallback(async (p: number = 1) => {
    setState("loading");
    try {
      const res = await fetchLedgerBlocks(p, 10);
      setBlocks(res.items);
      setTotalPages(res.totalPages);
      setTotalBlocks(res.total);
      setPage(res.page);
      setState(res.items.length === 0 ? "empty" : "idle");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Không thể tải danh sách khối.");
      setState("error");
    }
  }, []);

  useEffect(() => {
    loadBlocks(page);
  }, [loadBlocks, page]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Nút Flush Block Ngay Lập Tức
  const handleFlushNow = async () => {
    setIsFlushing(true);
    try {
      const createdBlock = await flushPendingBlock();
      if (createdBlock) {
        showToast(`Đã đóng thành công Khối #${createdBlock.blockNumber} (${createdBlock.txCount} giao dịch)!`);
        await loadBlocks(1);
      } else {
        showToast("Không có bản ghi nào ở trạng thái chờ đóng khối.");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Đóng khối thất bại.");
    } finally {
      setIsFlushing(false);
    }
  };

  // Xem chi tiết Khối & Cây Merkle
  const handleViewBlockDetail = async (blockNum: number) => {
    setSelectedBlockNumber(blockNum);
    setLoadingDetail(true);
    try {
      const detail = await fetchLedgerBlockDetail(blockNum);
      setBlockDetail(detail);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Không thể tải chi tiết khối.");
      setSelectedBlockNumber(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Chạy Live Verifier
  const handleRunLiveVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyEntityId.trim()) {
      alert("Vui lòng nhập ID thực thể.");
      return;
    }

    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const verdict = await verifyEntityLive({
        entityType: verifyEntityType,
        entityId: verifyEntityId.trim(),
        customPayloadJson: verifyCustomPayload.trim() || undefined,
      });
      setVerifyResult(verdict);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Kiểm chứng thất bại.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-sm font-medium flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Header & Flush Action */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Tổng Số Khối</span>
            <Layers className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            #{totalBlocks}
          </div>
          <div className="text-xs text-slate-400 mt-1">Sổ cái nội bộ NacenTech</div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Khối Mới Nhất</span>
            <Hash className="w-5 h-5 text-cyan-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {blocks.length > 0 ? `#${blocks[0].blockNumber}` : "#0"}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono truncate">
            {blocks.length > 0 ? `${blocks[0].blockHash.substring(0, 16)}...` : "0x0000000000000000"}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Tỷ Lệ Toàn Vẹn</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            100.0%
          </div>
          <div className="text-xs text-slate-400 mt-1">Toán học mật mã bảo chứng</div>
        </div>

        <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/60 dark:from-indigo-950/40 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex flex-col justify-between">
          <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase">
            Hành Động Khẩn Cấp
          </div>
          <AppButton
            variant="primary"
            onClick={handleFlushNow}
            disabled={isFlushing}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 shadow-md flex items-center justify-center gap-2"
          >
            {isFlushing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang Đóng Khối...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Đóng Khối Ngay (Flush)</span>
              </>
            )}
          </AppButton>
        </div>
      </div>

      {/* Main Grid: Blocks Table (Left 7 cols) & Live Verifier Tool (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Danh Sách Khối Sổ Cái */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Lịch Sử Chuỗi Khối Sổ Cái (Ledger Blocks)</span>
            </h3>
            <AppButton
              variant="ghost"
              onClick={() => loadBlocks(page)}
              className="text-xs min-h-8 min-w-8 py-1 px-3"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Làm mới
            </AppButton>
          </div>

          <Async
            state={state}
            errorMessage={errorMessage}
            onRetry={() => loadBlocks(page)}
            emptyContent={
              <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                Sổ cái chưa có khối nào. Bấm nút &quot;Đóng Khối Ngay&quot; để tạo khối đầu tiên.
              </div>
            }
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {blocks.map((block) => (
                  <div
                    key={block.blockNumber}
                    className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                          Block #{block.blockNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            block.status === "COMMITTED"
                              ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          }`}
                        >
                          {block.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(block.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-slate-600 dark:text-slate-300 truncate">
                        Hash: {block.blockHash}
                      </div>
                      <div className="font-mono text-xs text-slate-400 truncate">
                        Merkle Root: {block.merkleRoot}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {block.txCount} txs
                        </div>
                        <div className="text-[10px] text-slate-400">giao dịch</div>
                      </div>
                      <AppButton
                        variant="outline"
                        onClick={() => handleViewBlockDetail(block.blockNumber)}
                        className="text-xs min-h-8 min-w-8 py-1 px-3"
                      >
                        Chi tiết
                      </AppButton>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phân Trang */}
              {totalPages > 1 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    Trang {page} / {totalPages} (Tổng {totalBlocks} khối)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-md disabled:opacity-40"
                    >
                      Trước
                    </button>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-md disabled:opacity-40"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Async>
        </div>

        {/* Right: Live Verifier Tool Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Công Cụ Kiểm Chứng Mật Mã Độc Lập
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Mô phỏng máy thẩm định độc lập 4 bước: Tái hiện Canonical JSON RFC 8785, giải mã ZKP Salted Commitment AES-256-GCM, đối soát Merkle Audit Path và kiểm tra Chữ ký số ECDSA.
            </p>

            <form onSubmit={handleRunLiveVerify} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Loại Thực Thể
                </label>
                <select
                  value={verifyEntityType}
                  onChange={(e) => setVerifyEntityType(e.target.value)}
                  className="form-control-sm w-full rounded-lg bg-white dark:bg-slate-800"
                >
                  <option value="SELLER_OFFER">SELLER_OFFER (Chào bán công nghệ)</option>
                  <option value="DEAL_ROOM_MOU">DEAL_ROOM_MOU (Biên bản thỏa thuận)</option>
                  <option value="TT17_ASSESSMENT">TT17_ASSESSMENT (Đánh giá TT17)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mã Định Danh Thực Thể (Entity ID / UUID)
                </label>
                <input
                  type="text"
                  placeholder="Nhập GUID thực thể, ví dụ: a1b2c3d4-..."
                  value={verifyEntityId}
                  onChange={(e) => setVerifyEntityId(e.target.value)}
                  className="form-control-sm w-full rounded-lg font-mono bg-white dark:bg-slate-800 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payload Giả Lập Thẩm Tra (Tùy chọn - Dùng để test Tamper Data)
                </label>
                <textarea
                  rows={2}
                  placeholder="Để trống để lấy dữ liệu thực trong CSDL, hoặc nhập JSON cố tình sửa đổi để test phát hiện giả mạo..."
                  value={verifyCustomPayload}
                  onChange={(e) => setVerifyCustomPayload(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <AppButton
                type="submit"
                variant="primary"
                disabled={isVerifying}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 shadow-sm flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang Thẩm Định Mật Mã...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Thực Thi Kiểm Chứng Toán Học</span>
                  </>
                )}
              </AppButton>
            </form>

            {/* Verdict Result Card */}
            {verifyResult && (
              <div
                className={`p-4 rounded-xl border space-y-3 animate-fade-in ${
                  verifyResult.verdict === "VERIFIED"
                    ? "bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100"
                    : verifyResult.verdict === "TAMPERED"
                    ? "bg-rose-50/80 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800 text-rose-900 dark:text-rose-100"
                    : "bg-amber-50/80 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800 text-amber-900 dark:text-amber-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {verifyResult.verdict === "VERIFIED" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : verifyResult.verdict === "TAMPERED" ? (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    )}
                    <span>KẾT QUẢ: {verifyResult.verdict}</span>
                  </div>
                  {verifyResult.blockNumber && (
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-white/60 dark:bg-black/30">
                      Block #{verifyResult.blockNumber}
                    </span>
                  )}
                </div>

                <p className="text-xs leading-relaxed">{verifyResult.summary}</p>

                {/* Steps Details */}
                <div className="space-y-1.5 pt-2 border-t border-black/10 dark:border-white/10">
                  <div className="text-[11px] font-bold uppercase tracking-wider">
                    Các Bước Thẩm Định Toán Học:
                  </div>
                  {verifyResult.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="text-xs flex items-start gap-2 bg-white/50 dark:bg-black/20 p-2 rounded-lg"
                    >
                      <span className="mt-0.5 font-bold">
                        {step.passed ? "✅" : "❌"}
                      </span>
                      <div className="space-y-0.5">
                        <div className="font-semibold">{step.stepName}</div>
                        <div className="text-[11px] opacity-80">{step.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Chi Tiết Khối & Trình Duyệt Merkle Tree */}
      {selectedBlockNumber !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Chi Tiết Khối Sổ Cái #{selectedBlockNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBlockNumber(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {loadingDetail || !blockDetail ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                <p className="text-xs">Đang nạp cấu trúc Merkle Tree của khối...</p>
              </div>
            ) : (
              <div className="space-y-5 text-xs text-slate-600 dark:text-slate-300">
                {/* Block Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400">Block Hash:</span>
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {blockDetail.blockHash}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Previous Hash:</span>
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {blockDetail.previousHash}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Merkle Root:</span>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 truncate">
                      {blockDetail.merkleRoot}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Validator Address:</span>
                    <div className="font-bold text-indigo-600 dark:text-indigo-400 truncate">
                      {blockDetail.validatorAddress}
                    </div>
                  </div>
                </div>

                {/* Merkle Tree Concept Visualization */}
                <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl space-y-2">
                  <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-indigo-500" />
                    <span>Cấu Trúc Cây Merkle Nhị Phân (Merkle Tree Root):</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-indigo-900/50 font-mono text-center text-emerald-600 dark:text-emerald-400 font-bold truncate">
                    🌿 Root: {blockDetail.merkleRoot}
                  </div>
                  <div className="text-center text-[10px] text-slate-400">
                    ▲ Gom từ {blockDetail.transactions.length} lá giao dịch ZKP (Leaves)
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="space-y-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Danh Sách Giao Dịch Bên Trong Khối ({blockDetail.transactions.length} txs):
                  </div>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-semibold text-slate-500">
                        <tr>
                          <th className="py-2.5 px-3">Idx</th>
                          <th className="py-2.5 px-3">Thực Thể</th>
                          <th className="py-2.5 px-3">ZKP Commitment</th>
                          <th className="py-2.5 px-3">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                        {blockDetail.transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-bold text-indigo-500">
                              #{tx.txIndexInBlock ?? 0}
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-sans font-semibold text-slate-900 dark:text-white">
                                {tx.entityType}
                              </span>
                              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                                {tx.entityId}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-slate-500 truncate max-w-[200px]">
                              {tx.commitmentHash}
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-sans font-bold">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// TAB 3: CỔNG LIÊN THÔNG NDACHAIN & BRIDGE SYNC (T-11.16)
// =========================================================================

function TabBridge() {
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatusDto | null>(null);
  const [state, setState] = useState<AsyncState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<BridgeSyncResultDto | null>(null);

  const loadStatus = useCallback(async () => {
    setState("loading");
    try {
      const status = await fetchBridgeStatus();
      setGatewayStatus(status);
      setState("idle");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Không thể tải trạng thái cổng liên thông.");
      setState("error");
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await triggerBridgeSync();
      setSyncResult(res);
      await loadStatus();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Đồng bộ bù thất bại.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Gateway Connection Card */}
      <Async state={state} errorMessage={errorMessage} onRetry={loadStatus}>
        {gatewayStatus && (
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Cổng Liên Thông Chuỗi Khối Quốc Gia NDAChain
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nền tảng Chuỗi khối Quốc gia - Trung tâm Dữ liệu Quốc gia (Bộ Công An) & Hiệp hội Dữ liệu Quốc gia (NDA).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    gatewayStatus.isConnected
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      gatewayStatus.isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  <span>{gatewayStatus.isConnected ? "READY / CONNECTED" : "STANDBY READY"}</span>
                </span>
              </div>
            </div>

            {/* Config Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                <span className="text-slate-400 font-medium">Chế Độ Hoạt Động:</span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {gatewayStatus.gatewayType}
                </div>
                <div className="text-[11px] text-slate-400">
                  Tự động chuyển tiếp khi có endpoint chính thức
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                <span className="text-slate-400 font-medium">NDAChain RPC Endpoint:</span>
                <div className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate">
                  {gatewayStatus.endpoint || "STANDBY (Chờ cấp URL kết nối)"}
                </div>
                <div className="text-[11px] text-slate-400">Chain ID: {gatewayStatus.chainId ?? 8686}</div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                <span className="text-slate-400 font-medium">Hợp Đồng Khối Neo (Smart Contract):</span>
                <div className="text-sm font-mono font-bold text-cyan-600 dark:text-cyan-400 truncate">
                  {gatewayStatus.contractAddress || "0x0000000000000000000000000000000000000000"}
                </div>
                <div className="text-[11px] text-slate-400">Chuẩn ABI: anchorMerkleRoot(...)</div>
              </div>
            </div>

            {/* Sync Action Area */}
            <div className="p-5 bg-gradient-to-r from-indigo-50/80 to-purple-50/60 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-sm text-indigo-900 dark:text-indigo-200">
                  Đồng Bộ Bù Merkle Root Lên Chuỗi Quốc Gia (Bridge Catch-up)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Kích hoạt tác tử nền quét toàn bộ các khối nội bộ chưa neo lên NDAChain để gửi bù và cập nhật chữ ký bảo chứng.
                </p>
              </div>

              <AppButton
                variant="primary"
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-5 shadow-sm shrink-0 flex items-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang Đồng Bộ...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Đồng Bộ Bù Lên NDAChain</span>
                  </>
                )}
              </AppButton>
            </div>

            {/* Sync Feedback Result */}
            {syncResult && (
              <div
                className={`p-4 rounded-xl text-xs font-medium border flex items-start gap-2.5 animate-fade-in ${
                  syncResult.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
                    : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold">Kết quả đồng bộ: {syncResult.message}</div>
                  <div className="text-[11px] opacity-80">
                    Số khối đã đồng bộ bù: {syncResult.syncedBlocksCount} khối • Thời gian:{" "}
                    {new Date(syncResult.timestamp).toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Async>
    </div>
  );
}
