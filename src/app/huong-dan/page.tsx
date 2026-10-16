"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useToast } from "@/components/common/toast";
import {
  BookOpen,
  Share2,
  ExternalLink,
  Maximize2,
  Minimize2,
  FileDown,
  Sparkles,
  ShieldCheck,
  Users,
  Compass,
  ArrowRight,
  Info,
} from "lucide-react";

const ROLES = [
  { id: "ALL", label: "Tất cả (48)" },
  { id: "PUBLIC_USER", label: "Khách đại chúng (4)" },
  { id: "ENTERPRISE", label: "Doanh nghiệp ĐMST (12)" },
  { id: "BUYER", label: "Bên mua công nghệ (6)" },
  { id: "SELLER", label: "Bên chào bán (8)" },
  { id: "EXPERT", label: "Chuyên gia KH&CN (7)" },
  { id: "GOV", label: "Sở KH&CN tỉnh (12)" },
  { id: "ADMIN", label: "Quản trị viên (6)" },
];

export default function UserGuidePage() {
  const toast = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isZenMode, setIsZenMode] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const [activeRole, setActiveRole] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Đồng bộ hash từ URL cha vào iframe
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentHash(hash);
      
      // Parse active role từ hash
      if (hash) {
        const params = new URLSearchParams(hash.replace("#", ""));
        const role = params.get("role");
        if (role) {
          setActiveRole(role);
        } else {
          setActiveRole("ALL");
        }
      } else {
        setActiveRole("ALL");
      }

      if (iframeRef.current && hash) {
        try {
          const currentSrc = iframeRef.current.src.split("#")[0];
          iframeRef.current.src = `${currentSrc}${hash}`;
        } catch {
          // ignore
        }
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Lắng nghe hash thông báo từ iframe truyền ra URL cha
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data &&
        typeof event.data === "object" &&
        event.data.type === "USER_GUIDE_HASH_CHANGED"
      ) {
        const newHash = event.data.hash || "";
        setCurrentHash(newHash);
        window.history.replaceState(
          null,
          "",
          window.location.pathname + newHash
        );

        if (newHash) {
          const params = new URLSearchParams(newHash.replace("#", ""));
          const role = params.get("role");
          setActiveRole(role || "ALL");
        } else {
          setActiveRole("ALL");
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleSelectRole = (roleId: string) => {
    setActiveRole(roleId);
    let newHash = "";
    if (roleId !== "ALL") {
      newHash = `#role=${roleId}`;
    }
    setCurrentHash(newHash);
    window.history.replaceState(null, "", window.location.pathname + newHash);

    if (iframeRef.current) {
      try {
        const currentSrc = iframeRef.current.src.split("#")[0];
        iframeRef.current.src = `${currentSrc}${newHash}`;
      } catch {
        // ignore
      }
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const shareUrl = window.location.href;
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          toast.info(
            `Đã sao chép liên kết vào bộ nhớ tạm: ${shareUrl}`,
            "Chia sẻ Hướng dẫn Sử dụng"
          );
        })
        .catch(() => {
          toast.info(
            "Vui lòng sao chép thủ công từ thanh địa chỉ trình duyệt.",
            "Thông báo"
          );
        });
    }
  };

  const handleOpenNewTab = () => {
    if (typeof window !== "undefined") {
      const targetUrl = `/huong-dan-su-dung.html${currentHash}`;
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className={`transition-all duration-300 ${
        isZenMode
          ? "fixed inset-0 z-50 flex flex-col bg-slate-900"
          : "page-container py-4 space-y-3"
      }`}
    >
      {/* THANH ĐIỀU KHIỂN & CHỨC NĂNG HƯỚNG DẪN */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-surface border border-border-default/90 bg-white/95 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 transition-all ${
          isZenMode ? "rounded-none border-x-0 border-t-0 px-6 py-2.5" : ""
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-nacen-green-50 text-nacen-green-700 dark:bg-emerald-950/80 dark:text-emerald-300">
            <BookOpen className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm font-bold text-text-primary dark:text-white truncate">
                Cẩm Nang Hướng Dẫn Sử Dụng Chi Tiết Hệ Thống NacenTwin
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                <Sparkles className="size-3" />
                11 Phân Hệ · 48 Màn Hình
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700 border border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800">
                <Users className="size-3" />
                7 Vai Trò Tác Nhân
              </span>
            </div>
            <p className="hidden sm:block text-caption text-text-secondary dark:text-slate-400 truncate">
              Tài liệu trực quan kèm ảnh chụp màn hình chi tiết, quy trình thực hiện &amp; bộ lọc phân quyền từng bước.
            </p>
          </div>
        </div>

        {/* CÁC NÚT THAO TÁC */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Nút Tải PDF */}
          <a
            href="/huong-dan-su-dung.pdf"
            download="Huong_Dan_Su_Dung_NacenTwin.pdf"
            className="focus-ring inline-flex items-center gap-1.5 rounded-control bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:hover:bg-emerald-900 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-800 px-3 py-1.5 text-xs font-bold transition shadow-2xs"
            title="Tải toàn bộ cẩm nang hướng dẫn sử dụng định dạng PDF (2.4 MB)"
          >
            <FileDown className="size-3.5" />
            <span className="hidden sm:inline">Tải PDF</span>
            <span className="sm:hidden">PDF</span>
          </a>

          {/* Nút Sao Chép Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="focus-ring inline-flex items-center gap-1.5 rounded-control bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/70 dark:hover:bg-brand-900 dark:text-brand-200 border border-brand-200/80 dark:border-brand-800 px-3 py-1.5 text-xs font-bold transition shadow-2xs"
            title="Sao chép đường dẫn hướng dẫn sử dụng kèm bộ lọc hiện tại"
          >
            <Share2 className="size-3.5" />
            <span className="hidden sm:inline">Chia sẻ Link</span>
          </button>

          {/* Nút Mở Tab Mới */}
          <button
            type="button"
            onClick={handleOpenNewTab}
            className="focus-ring inline-flex items-center gap-1.5 rounded-control border border-border-default bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 text-xs font-semibold transition"
            title="Mở tài liệu hướng dẫn trong tab mới toàn trang"
          >
            <ExternalLink className="size-3.5" />
            <span className="hidden sm:inline">Mở Tab Mới</span>
          </button>

          {/* Nút Toggle Zen Mode Toàn Màn Hình */}
          <button
            type="button"
            onClick={() => setIsZenMode((prev) => !prev)}
            className="focus-ring inline-flex items-center gap-1 rounded-control border border-border-default bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 text-xs font-semibold transition"
            title={
              isZenMode
                ? "Thu nhỏ chế độ tiêu chuẩn"
                : "Mở rộng tràn màn hình (Zen Mode)"
            }
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

      {/* THANH BỘ LỌC VAI TRÒ NHANH TRÊN HEADER */}
      {!isZenMode && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1 shrink-0 px-1">
            <Compass className="size-3.5" /> Lọc nhanh vai trò:
          </span>
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleSelectRole(r.id)}
              className={`rounded-full px-2.5 py-1 font-semibold whitespace-nowrap transition cursor-pointer ${
                activeRole === r.id
                  ? "bg-brand-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {/* KHUNG IFRAME HIỂN THỊ HƯỚNG DẪN SỬ DỤNG */}
      <div
        className={`relative overflow-hidden rounded-surface border border-border-default/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${
          isZenMode
            ? "flex-1 rounded-none border-none"
            : "h-[calc(100vh-215px)] min-h-[750px]"
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90 backdrop-blur-xs dark:bg-slate-950/90">
            <div className="size-8 animate-spin rounded-full border-3 border-emerald-200 border-t-emerald-600 dark:border-slate-800 dark:border-t-emerald-400" />
            <p className="text-xs font-bold text-text-secondary dark:text-slate-400">
              Đang tải Cẩm Nang Hướng Dẫn Sử Dụng NacenTwin...
            </p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={`/huong-dan-su-dung.html${currentHash}`}
          title="Hướng Dẫn Sử Dụng Chi Tiết Hệ Thống NacenTwin"
          className="size-full border-0"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* FOOTNOTE THÔNG TIN HƯỚNG DẪN DÀNH CHO NGƯỜI DÙNG */}
      {!isZenMode && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-caption text-text-tertiary dark:text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <Info className="size-3.5 text-brand-600 dark:text-brand-400" />
            <span>
              Mẹo: Chọn một vai trò tác nhân phía trên để lọc ngay các màn hình thuộc quyền của bạn, hoặc dùng ô tìm kiếm trong tài liệu.
            </span>
          </div>
          <div className="flex items-center gap-3 font-semibold">
            <Link
              href="/"
              className="hover:underline text-brand-600 dark:text-brand-400"
            >
              Trang chủ
            </Link>
            <span>•</span>
            <Link
              href="/chao-ban-cong-nghe"
              className="hover:underline text-brand-600 dark:text-brand-400"
            >
              Sàn chào bán
            </Link>
            <span>•</span>
            <Link
              href="/nhu-cau-cong-nghe"
              className="hover:underline text-brand-600 dark:text-brand-400"
            >
              Sàn nhu cầu
            </Link>
            <span>•</span>
            <Link
              href="/wireframes"
              className="hover:underline text-brand-600 dark:text-brand-400"
            >
              Thư viện Wireframe
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
