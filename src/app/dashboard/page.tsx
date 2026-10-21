"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useToast } from "@/components/common/toast";
import {
  Share2,
  ExternalLink,
  Maximize2,
  Minimize2,
  Workflow,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  Activity,
  Info,
} from "lucide-react";

export default function DashboardOrchestratorPage() {
  const toast = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const shareUrl = window.location.href;
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          toast.info(
            `Đã sao chép liên kết vào bộ nhớ tạm: ${shareUrl}`,
            "Chia sẻ Dashboard với Team"
          );
        })
        .catch(() => {
          toast.info("Vui lòng sao chép thủ công từ thanh địa chỉ trình duyệt.", "Thông báo");
        });
    }
  };

  const handleOpenNewTab = () => {
    if (typeof window !== "undefined") {
      window.open("/orchestrator-app", "_blank", "noopener,noreferrer");
    }
  };

  const handleTriggerCreateCR = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({ type: "OPEN_CREATE_CR" }, "*");
      } catch {
        // Fallback
      }
    }
    toast.info("Đang mở biểu mẫu thêm Change Request (CR) mới trên Dashboard.", "Hỗ trợ tác vụ");
  };

  return (
    <div
      className={`transition-all duration-300 ${
        isZenMode
          ? "fixed inset-0 z-50 flex flex-col bg-slate-950"
          : "page-container py-4 space-y-3"
      }`}
    >
      {/* THANH ĐIỀU KHIỂN & ĐIỀU PHỐI ORCHESTRATOR */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-surface border border-border-default/90 bg-white/95 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 transition-all ${
          isZenMode ? "rounded-none border-x-0 border-t-0 px-6 py-2.5" : ""
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300">
            <Workflow className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm font-bold text-text-primary dark:text-white truncate">
                Trung Tâm Điều Phối Agent Orchestrator & Quản Lý Change Request (CR)
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-bold text-cyan-700 border border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800">
                <Activity className="size-3 animate-pulse text-cyan-600" />
                Live Telemetry
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="size-3" />
                3 Human Gates
              </span>
            </div>
            <p className="hidden sm:block text-caption text-text-secondary dark:text-slate-400 truncate">
              Không gian cộng tác PO · BA · SA · Dev · QC · Stakeholders · Theo dõi đồ thị Wave DAG và gửi Change Request trực tiếp.
            </p>
          </div>
        </div>

        {/* CÁC NÚT THAO TÁC */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Nút Thêm Yêu Cầu / CR Mới */}
          <button
            type="button"
            onClick={handleTriggerCreateCR}
            className="focus-ring inline-flex items-center gap-1.5 rounded-control bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 text-xs font-bold transition shadow-2xs"
            title="Mở biểu mẫu gửi yêu cầu thay đổi (CR) hoặc task mới"
          >
            <PlusCircle className="size-3.5" />
            <span>Thêm Yêu Cầu / CR</span>
          </button>

          {/* Nút Sao Chép Link gửi cho Team */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="focus-ring inline-flex items-center gap-1.5 rounded-control bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/70 dark:hover:bg-brand-900 dark:text-brand-200 border border-brand-200/80 dark:border-brand-800 px-3 py-1.5 text-xs font-bold transition shadow-2xs"
            title="Sao chép đường dẫn trang Dashboard để gửi qua Slack, Zalo, Teams"
          >
            <Share2 className="size-3.5" />
            <span className="hidden sm:inline">Sao chép Link</span>
          </button>

          {/* Nút Mở Tab Riêng */}
          <button
            type="button"
            onClick={handleOpenNewTab}
            className="focus-ring inline-flex items-center gap-1.5 rounded-control border border-border-default bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 text-xs font-semibold transition"
            title="Mở trang Orchestrator trong tab mới toàn trang"
          >
            <ExternalLink className="size-3.5" />
            <span className="hidden sm:inline">Tab Mới</span>
          </button>

          {/* Nút Toggle Zen Mode Toàn Màn Hình */}
          <button
            type="button"
            onClick={() => setIsZenMode((prev) => !prev)}
            className="focus-ring inline-flex items-center gap-1 rounded-control border border-border-default bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 text-xs font-semibold transition"
            title={isZenMode ? "Thu nhỏ chế độ tiêu chuẩn" : "Mở rộng tràn màn hình (Zen Mode)"}
          >
            {isZenMode ? (
              <>
                <Minimize2 className="size-3.5" />
                <span className="hidden sm:inline">Thu nhỏ</span>
              </>
            ) : (
              <>
                <Maximize2 className="size-3.5" />
                <span className="hidden sm:inline">Tràn viền</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KHUNG IFRAME HIỂN THỊ ORCHESTRATOR DASHBOARD */}
      <div
        className={`relative overflow-hidden rounded-surface border border-border-default/90 bg-[#080d1a] shadow-sm dark:border-slate-800 ${
          isZenMode ? "flex-1 rounded-none border-none" : "h-[calc(100vh-175px)] min-h-[820px]"
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#080d1a]/90 backdrop-blur-xs text-white">
            <div className="size-8 animate-spin rounded-full border-3 border-cyan-200 border-t-cyan-500" />
            <p className="text-xs font-bold text-slate-300">
              Đang kết nối Realtime Orchestrator Engine...
            </p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src="/orchestrator-app"
          title="NacenTech Agent Orchestrator Dashboard"
          className="size-full border-0"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* FOOTNOTE THÔNG TIN HƯỚNG DẪN DÀNH CHO TEAM */}
      {!isZenMode && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-caption text-text-tertiary dark:text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <Info className="size-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>
              Mọi thành viên ngoài internet có thể nhấn nút <b>"Thêm Yêu Cầu / CR"</b> hoặc thao tác trực tiếp trên giao diện để bổ sung Change Request. Hệ thống sẽ tự động cập nhật vào Backlog dự án.
            </span>
          </div>
          <div className="flex items-center gap-3 font-semibold">
            <Link href="/" className="hover:underline text-cyan-600 dark:text-cyan-400">
              Trang chủ NacenTwin
            </Link>
            <span>•</span>
            <Link href="/wireframes" className="hover:underline text-cyan-600 dark:text-cyan-400">
              Thư viện Wireframes
            </Link>
            <span>•</span>
            <Link href="/admin" className="hover:underline text-cyan-600 dark:text-cyan-400">
              Admin HQ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
