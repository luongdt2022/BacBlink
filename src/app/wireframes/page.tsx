"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useToast } from "@/components/common/toast";
import {
  Share2,
  ExternalLink,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  Info,
} from "lucide-react";

export default function WireframesPage() {
  const toast = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isZenMode, setIsZenMode] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Lắng nghe hash từ URL cha và truyền vào iframe
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentHash(hash);
      if (iframeRef.current && hash) {
        try {
          const currentSrc = iframeRef.current.src.split("#")[0];
          iframeRef.current.src = `${currentSrc}${hash}`;
        } catch {
          // ignore cross-origin if any
        }
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Lắng nghe hash từ iframe truyền ra URL cha
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === "object" && event.data.type === "WIREFRAME_SCREEN_CHANGED") {
        if (event.data.id) {
          const newHash = `#${event.data.id}`;
          setCurrentHash(newHash);
          window.history.replaceState(null, "", newHash);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.info(
          `Đã sao chép liên kết vào bộ nhớ tạm: ${shareUrl}`,
          "Chia sẻ liên kết với Team"
        );
      }).catch(() => {
        toast.info("Vui lòng sao chép thủ công từ thanh địa chỉ trình duyệt.", "Thông báo");
      });
    }
  };

  const handleOpenNewTab = () => {
    if (typeof window !== "undefined") {
      const targetUrl = `/wireframes/index.html${currentHash}`;
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className={`transition-all duration-300 ${isZenMode ? "fixed inset-0 z-50 bg-slate-900 flex flex-col" : "page-container py-4 space-y-3"}`}>
      {/* THANH ĐIỀU KHIỂN & CHIA SẺ VỚI TEAM */}
      <div className={`flex flex-wrap items-center justify-between gap-3 rounded-surface border border-border-default/90 bg-white/95 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 transition-all ${isZenMode ? "rounded-none border-x-0 border-t-0 px-6 py-2.5" : ""}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300">
            <Layers className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm font-bold text-text-primary dark:text-white truncate">
                Thư Viện Wireframe Basic Design (NacenTwin)
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                <Sparkles className="size-3" />
                48 Màn Hình Sống
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                <ShieldCheck className="size-3" />
                7 Vai Trò Tác Nhân
              </span>
            </div>
            <p className="hidden sm:block text-caption text-text-secondary dark:text-slate-400 truncate">
              Phân cấp 2 tầng theo 10 Task Modules · Bộ lọc vai trò (Roles) · Liên thông đối soát với mã nguồn thật.
            </p>
          </div>
        </div>

        {/* CÁC NÚT THAO TÁC */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Nút Sao Chép Link gửi cho Team */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="focus-ring inline-flex items-center gap-1.5 rounded-control bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/70 dark:hover:bg-brand-900 dark:text-brand-200 border border-brand-200/80 dark:border-brand-800 px-3 py-1.5 text-xs font-bold transition shadow-2xs"
            title="Sao chép đường dẫn trang web wireframe hiện tại để gửi cho đồng nghiệp"
          >
            <Share2 className="size-3.5" />
            <span>Sao chép Link gửi Team</span>
          </button>

          {/* Nút Mở Tab Riêng Không Khung */}
          <button
            type="button"
            onClick={handleOpenNewTab}
            className="focus-ring inline-flex items-center gap-1.5 rounded-control border border-border-default bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 text-xs font-semibold transition"
            title="Mở thư viện wireframe trong tab mới toàn trang"
          >
            <ExternalLink className="size-3.5" />
            <span className="hidden sm:inline">Mở Tab Mới</span>
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

      {/* KHUNG IFRAME HIỂN THỊ THƯ VIỆN WIREFRAME */}
      <div className={`relative overflow-hidden rounded-surface border border-border-default/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${isZenMode ? "flex-1 rounded-none border-none" : "h-[calc(100vh-175px)] min-h-[780px]"}`}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90 backdrop-blur-xs dark:bg-slate-950/90">
            <div className="size-8 animate-spin rounded-full border-3 border-brand-200 border-t-brand-600 dark:border-slate-800 dark:border-t-brand-400" />
            <p className="text-xs font-bold text-text-secondary dark:text-slate-400">
              Đang tải thư viện 48 Wireframes NacenTwin...
            </p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={`/wireframes/index.html${currentHash}`}
          title="Thư viện Wireframe Basic Design NacenTwin"
          className="size-full border-0"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* FOOTNOTE THÔNG TIN HƯỚNG DẪN DÀNH CHO TEAM */}
      {!isZenMode && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-tertiary dark:text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <Info className="size-3.5 text-brand-600 dark:text-brand-400" />
            <span>
              Mẹo dành cho Team: Khi chọn bất kỳ màn hình nào, bạn có thể click nút <b>"Sao chép Link gửi Team"</b> để gửi đúng màn hình đó qua Slack, Zalo hoặc Jira.
            </span>
          </div>
          <div className="flex items-center gap-3 font-semibold">
            <Link href="/" className="hover:underline text-brand-600 dark:text-brand-400">Trang chủ NacenTwin</Link>
            <span>•</span>
            <Link href="/portal" className="hover:underline text-brand-600 dark:text-brand-400">Bàn làm việc Portal</Link>
            <span>•</span>
            <Link href="/admin" className="hover:underline text-brand-600 dark:text-brand-400">Admin HQ</Link>
          </div>
        </div>
      )}
    </div>
  );
}
