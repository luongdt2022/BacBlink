"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Hash,
  Layers,
  Key,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  fetchEntityAnchorStatus,
  verifyEntityLive,
  type VerificationVerdictResult,
} from "@/lib/api/blockchain";
import { AppButton } from "@/components/ui/design-system";

export interface BlockchainZkpBadgeProps {
  entityType: string;
  entityId: string;
  entityCode?: string;
  className?: string;
}

export function BlockchainZkpBadge({
  entityType,
  entityId,
  entityCode,
  className = "",
}: BlockchainZkpBadgeProps) {
  const [status, setStatus] = useState<VerificationVerdictResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  // Live Verification inside modal
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [liveVerdict, setLiveVerdict] = useState<VerificationVerdictResult | null>(null);

  const checkStatus = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const res = await fetchEntityAnchorStatus(entityType, entityId);
      setStatus(res);
    } catch {
      // Bỏ qua lỗi ngầm nếu chưa có kết nối, không làm crash trang cha
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleOpenModal = () => {
    setIsOpenModal(true);
    setLiveVerdict(null);
  };

  const handleRunVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyEntityLive({
        entityType,
        entityId,
      });
      setLiveVerdict(res);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Kiểm chứng thời gian thực thất bại.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs animate-pulse ${className}`}>
        <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        <span>Kiểm tra bảo chứng Chuỗi khối...</span>
      </div>
    );
  }

  // Nếu thực thể chưa được neo lên chuỗi khối
  if (!status || status.verdict === "NOT_ANCHORED") {
    return null; // Không hiển thị huy hiệu nếu chưa được neo
  }

  const isVerified = status.verdict === "VERIFIED" || status.isSuccess;
  const isTampered = status.verdict === "TAMPERED";

  return (
    <>
      {/* Clickable Badge */}
      <button
        type="button"
        onClick={handleOpenModal}
        className={`group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all duration-200 border cursor-pointer hover:shadow-md ${
          isVerified
            ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 hover:border-emerald-400"
            : isTampered
            ? "bg-rose-50 text-rose-800 border-rose-300 hover:border-rose-400"
            : "bg-indigo-50 text-indigo-800 border-indigo-200 hover:border-indigo-300"
        } ${className}`}
        title="Bấm để kiểm chứng mật mã học ZKP & Chuỗi khối thời gian thực"
      >
        <span className="flex items-center gap-1.5">
          <ShieldCheck className={`w-4 h-4 ${isVerified ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`} />
          <span className="font-bold">
            {isVerified ? "Bảo Chứng Mật Mã ZKP & Chuỗi Khối" : "Cảnh Báo Giả Mạo Chuỗi Khối"}
          </span>
        </span>

        {status.blockNumber && (
          <span className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-black/30 font-mono text-[10px] text-slate-600 dark:text-slate-300 border border-black/5">
            Block #{status.blockNumber}
          </span>
        )}

        <Sparkles className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Modal Kiểm Chứng Độc Lập Toàn Trình */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Biên Bản Bảo Chứng Mật Mã Học ZKP & Chuỗi Khối
                  </h3>
                  <div className="text-xs text-slate-400">
                    Bảo chứng tính bất biến theo Nghị định 13/2023/NĐ-CP & Chuỗi Khối Quốc Gia NDAChain
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpenModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Target Entity Overview */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Hồ Sơ Bảo Chứng:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {entityCode || entityId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Loại Thực Thể:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {entityType}
                </span>
              </div>
            </div>

            {/* Cryptographic Artifacts Grid */}
            <div className="space-y-2.5 font-mono text-[11px]">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg space-y-1">
                <span className="text-slate-400 font-sans text-xs flex items-center gap-1.5 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Sổ Cái Khối Nội Bộ:</span>
                </span>
                <div className="text-slate-800 dark:text-slate-200 font-bold truncate">
                  Block #{status.blockNumber} • Hash: {status.blockHash || "Chưa cấp"}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg space-y-1">
                <span className="text-slate-400 font-sans text-xs flex items-center gap-1.5 font-semibold">
                  <Hash className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Merkle Tree Root:</span>
                </span>
                <div className="text-emerald-700 dark:text-emerald-300 font-bold truncate">
                  {status.merkleRoot || "N/A"}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg space-y-1">
                <span className="text-slate-400 font-sans text-xs flex items-center gap-1.5 font-semibold">
                  <Key className="w-3.5 h-3.5 text-cyan-500" />
                  <span>ZKP Salted Commitment (AES-256-GCM Vault):</span>
                </span>
                <div className="text-cyan-700 dark:text-cyan-300 font-bold truncate">
                  {status.commitmentHash || "N/A"}
                </div>
              </div>

              {status.ndaChainTxHash && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg space-y-1">
                  <span className="text-slate-400 font-sans text-xs flex items-center gap-1.5 font-semibold">
                    <ExternalLink className="w-3.5 h-3.5 text-purple-500" />
                    <span>NDAChain National Transaction Hash:</span>
                  </span>
                  <div className="text-purple-700 dark:text-purple-300 font-bold truncate">
                    {status.ndaChainTxHash}
                  </div>
                </div>
              )}
            </div>

            {/* Action Verify Live Button */}
            <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-indigo-900 dark:text-indigo-200">
                    Xác Thực Toán Học Thời Gian Thực (Live Verification)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Đối soát lại tức thì toàn bộ 4 bước bảo chứng không qua cache.
                  </div>
                </div>

                <AppButton
                  variant="primary"
                  onClick={handleRunVerify}
                  disabled={isVerifying}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 shadow-sm shrink-0 flex items-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang Thẩm Định...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Xác Thực Ngay</span>
                    </>
                  )}
                </AppButton>
              </div>

              {/* Live Verdict Render */}
              {liveVerdict && (
                <div
                  className={`p-3.5 rounded-lg border space-y-2 animate-fade-in text-xs ${
                    liveVerdict.verdict === "VERIFIED"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100"
                      : "bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/60 dark:text-rose-100"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {liveVerdict.verdict === "VERIFIED" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>KẾT LUẬN: {liveVerdict.verdict} — {liveVerdict.summary}</span>
                  </div>

                  <div className="space-y-1 pt-1.5 border-t border-black/10 dark:border-white/10">
                    {liveVerdict.steps.map((st, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px]">
                        <span>{st.passed ? "✅" : "❌"}</span>
                        <span className="font-semibold">{st.stepName}:</span>
                        <span className="opacity-80 truncate">{st.details}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <AppButton
                variant="outline"
                onClick={() => setIsOpenModal(false)}
                className="text-xs min-h-8 min-w-8 py-1 px-3"
              >
                Đóng
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
