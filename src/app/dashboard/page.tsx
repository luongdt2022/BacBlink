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
  Activity,
} from "lucide-react";

export default function DashboardOrchestratorPage() {
  const toast = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Đảm bảo loading spinner tắt ngay khi dashboard sẵn sàng, không bị kẹt
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "DASHBOARD_READY") {
        setIsLoading(false);
      }
    };
    window.addEventListener("message", handleMessage);

    // Timeout dự phòng an toàn: tối đa 600ms tự động giải phóng giao diện
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(safetyTimer);
    };
  }, []);

  // Đồng bộ theme sáng/tối sang iframe dashboard
  useEffect(() => {
    const syncTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            { type: "SET_THEME", theme: isDark ? "dark" : "light" },
            "*"
          );
        } catch {}
      }
    };

    const timer = setTimeout(syncTheme, 500);

    const observer = new MutationObserver(() => {
      syncTheme();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const shareUrl = window.location.href;
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          toast.info(
            `Đã sao chép liên kết vào bộ nhớ tạm: ${shareUrl}`,
            "Chia sẻ Dashboard"
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

  return (
    <div
      className={`transition-all duration-300 ${
        isZenMode
          ? "fixed inset-0 z-50 flex flex-col bg-slate-950 w-screen h-screen p-0"
          : "w-full h-[calc(100vh-68px)] flex flex-col px-3 md:px-6 py-2.5 space-y-2 bg-slate-50 dark:bg-slate-950"
      }`}
    >
      {/* THANH ĐIỀU HƯỚNG TINH GỌN TRÀN VIỀN (FULL-WIDTH TOOLBAR) */}
      <div
        className={`flex items-center justify-between gap-3 rounded-lg border border-border-default/90 bg-white/95 px-3.5 py-1.5 shadow-2xs backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 shrink-0 ${
          isZenMode ? "rounded-none border-x-0 border-t-0 px-4 py-1.5 bg-slate-900" : ""
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300">
            <Workflow className="size-4" />
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="text-xs font-semibold text-text-secondary dark:text-slate-400">
              <Link href="/" className="hover:underline">Trang chủ</Link> / Bảng Điều Khiển
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <h1 className="text-xs font-bold text-text-primary dark:text-white truncate">
              Bảng Điều Khiển &amp; Quản Lý Tiến Độ BACLINK
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-caption font-bold text-cyan-700 border border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800">
              <Activity className="size-3 animate-pulse text-cyan-600" />
              Live Telemetry
            </span>
          </div>
        </div>

        {/* NÚT THAO TÁC GỌN GÀNG */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="focus-ring inline-flex items-center gap-1 rounded-control border border-border-default bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold transition"
            title="Sao chép đường dẫn Dashboard"
          >
            <Share2 className="size-3" />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewTab}
            className="focus-ring inline-flex items-center gap-1 rounded-control border border-border-default bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold transition"
            title="Mở tab riêng"
          >
            <ExternalLink className="size-3" />
            <span className="hidden sm:inline">Tab Mới</span>
          </button>

          <button
            type="button"
            onClick={() => setIsZenMode((prev) => !prev)}
            className="focus-ring inline-flex items-center gap-1 rounded-control border border-border-default bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold transition"
            title={isZenMode ? "Thu nhỏ chế độ tiêu chuẩn" : "Chế độ toàn màn hình (Zen Mode)"}
          >
            {isZenMode ? (
              <>
                <Minimize2 className="size-3" />
                <span className="hidden sm:inline">Thu nhỏ</span>
              </>
            ) : (
              <>
                <Maximize2 className="size-3" />
                <span className="hidden sm:inline">Toàn màn hình</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KHUNG IFRAME CHIẾM TRỌN 100% CHIỀU CAO VÀ CHIỀU RỘNG MÀN HÌNH */}
      <div
        className={`relative overflow-hidden rounded-lg border border-border-default/90 bg-[#080d1a] shadow-xs dark:border-slate-800 flex-1 w-full h-full min-h-0 ${
          isZenMode ? "rounded-none border-none" : ""
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
          title="BACLINK Orchestrator Dashboard"
          className="size-full border-0 block"
          onLoad={() => {
            setIsLoading(false);
            const isDark = document.documentElement.classList.contains("dark");
            if (iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage(
                { type: "SET_THEME", theme: isDark ? "dark" : "light" },
                "*"
              );
            }
          }}
        />
      </div>
    </div>
  );
}
