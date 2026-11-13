"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Compass,
  ArrowRight,
  Info,
  Search,
  X,
  Layers,
  CheckCircle2,
  Eye,
  Filter,
  Monitor,
  FileText,
  ChevronRight,
  ShieldCheck,
  Check,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import {
  GUIDE_ROLES,
  GUIDE_MODULES,
  GUIDE_SCREENS,
  GuideScreen,
  GuideRole,
} from "./guide-data";

export default function UserGuidePage() {
  const toast = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isZenMode, setIsZenMode] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const [activeRole, setActiveRole] = useState("ALL");
  const [selectedModule, setSelectedModule] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [specialFilter, setSpecialFilter] = useState<"ALL" | "ASSESSMENT" | "REQUEST_FORMS">("ALL");
  const [viewMode, setViewMode] = useState<"CARDS" | "DOCUMENT">("CARDS");
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  // Normalize role aliases
  const normalizeRole = (roleStr: string): string => {
    const upper = roleStr.toUpperCase();
    if (upper === "EXPERT" || upper === "VERIFIED_EXPERT") return "EXPERT";
    if (upper === "ENTERPRISE" || upper === "INNOVATION_ENTITY") return "ENTERPRISE";
    if (upper === "GOV" || upper === "PROVINCIAL_ADMIN") return "GOV";
    if (upper === "ADMIN" || upper === "SUPER_ADMIN") return "ADMIN";
    if (upper === "BUYER") return "BUYER";
    if (upper === "SELLER") return "SELLER";
    if (upper === "PUBLIC_USER") return "PUBLIC_USER";
    if (upper === "AUDITOR") return "AUDITOR";
    return "ALL";
  };

  // Safe href sanitizer to avoid App Router bracket errors
  const getSafeHref = (route: string) => {
    if (!route) return "/";
    if (route.includes("[")) {
      return route
        .replace(/\[module\]/g, "elearning")
        .replace(/\[taxCode\]/g, "0101234567")
        .replace(/\[expertCode\]/g, "EXP-2026-0889")
        .replace(/\[id\]/g, "DEMAND-001");
    }
    return route;
  };

  // Đồng bộ hash từ URL cha
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash;
      setCurrentHash(hash);

      if (hash) {
        const cleanHash = hash.replace("#", "");
        const params = new URLSearchParams(cleanHash);
        const role = params.get("role");
        if (role) {
          const norm = normalizeRole(role);
          setActiveRole(norm);
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
          // ignore cross-origin error if any
        }
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Lắng nghe message từ iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data &&
        typeof event.data === "object" &&
        event.data.type === "USER_GUIDE_HASH_CHANGED"
      ) {
        const newHash = event.data.hash || "";
        setCurrentHash(newHash);
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", window.location.pathname + newHash);
          if (newHash) {
            const params = new URLSearchParams(newHash.replace("#", ""));
            const role = params.get("role");
            setActiveRole(role ? normalizeRole(role) : "ALL");
          } else {
            setActiveRole("ALL");
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Xử lý chọn vai trò
  const handleSelectRole = (roleId: string) => {
    setActiveRole(roleId);
    let newHash = "";
    if (roleId !== "ALL") {
      newHash = `#role=${roleId}`;
    }
    setCurrentHash(newHash);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname + newHash);
    }

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

  // Tính số lượng màn hình cho từng vai trò
  const roleScreenCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: GUIDE_SCREENS.length };
    GUIDE_ROLES.forEach((r) => {
      if (r.id !== "ALL") {
        counts[r.id] = GUIDE_SCREENS.filter((s) => {
          return (
            s.roles.includes(r.id) ||
            s.roles.includes(r.code) ||
            (r.id === "EXPERT" && s.roles.includes("VERIFIED_EXPERT")) ||
            (r.id === "ENTERPRISE" && s.roles.includes("INNOVATION_ENTITY")) ||
            (r.id === "GOV" && s.roles.includes("PROVINCIAL_ADMIN")) ||
            (r.id === "ADMIN" && s.roles.includes("SUPER_ADMIN"))
          );
        }).length;
      }
    });
    return counts;
  }, []);

  // Đếm số màn hình đánh giá và phiếu yêu cầu
  const assessmentCount = useMemo(() => {
    return GUIDE_SCREENS.filter((s) => s.isAssessment).length;
  }, []);

  const requestFormsCount = useMemo(() => {
    return GUIDE_SCREENS.filter((s) => s.isRequestForm).length;
  }, []);

  // Lọc danh sách màn hình theo Vai trò, Phân hệ, Bộ lọc đặc biệt và Từ khóa tìm kiếm
  const filteredScreens = useMemo(() => {
    return GUIDE_SCREENS.filter((screen) => {
      // 1. Lọc theo Bộ lọc đặc biệt (Đánh giá CN hoặc Phiếu yêu cầu)
      if (specialFilter === "ASSESSMENT" && !screen.isAssessment) {
        return false;
      }
      if (specialFilter === "REQUEST_FORMS" && !screen.isRequestForm) {
        return false;
      }

      // 2. Lọc theo Vai trò
      if (activeRole !== "ALL") {
        const hasRole =
          screen.roles.includes(activeRole) ||
          (activeRole === "EXPERT" && screen.roles.includes("VERIFIED_EXPERT")) ||
          (activeRole === "ENTERPRISE" && screen.roles.includes("INNOVATION_ENTITY")) ||
          (activeRole === "GOV" && screen.roles.includes("PROVINCIAL_ADMIN")) ||
          (activeRole === "ADMIN" && screen.roles.includes("SUPER_ADMIN"));
        if (!hasRole) return false;
      }

      // 3. Lọc theo Phân hệ
      if (selectedModule !== "ALL" && screen.moduleNumber !== selectedModule) {
        return false;
      }

      // 4. Lọc theo Từ khóa tìm kiếm
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = screen.title.toLowerCase().includes(q);
        const matchId = screen.id.toLowerCase().includes(q);
        const matchRoute = screen.route.toLowerCase().includes(q);
        const matchDesc = screen.description.toLowerCase().includes(q);
        const matchModule = screen.moduleName.toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchRoute && !matchDesc && !matchModule) {
          return false;
        }
      }

      return true;
    });
  }, [activeRole, selectedModule, searchQuery, specialFilter]);

  // Gom nhóm màn hình theo Phân hệ
  const groupedScreens = useMemo(() => {
    const groups: {
      moduleNumber: number;
      moduleName: string;
      screens: GuideScreen[];
    }[] = [];

    GUIDE_MODULES.forEach((mod) => {
      const screensInMod = filteredScreens.filter(
        (s) => s.moduleNumber === mod.num
      );
      if (screensInMod.length > 0) {
        groups.push({
          moduleNumber: mod.num,
          moduleName: mod.name,
          screens: screensInMod,
        });
      }
    });

    return groups;
  }, [filteredScreens]);

  const activeRoleConfig = useMemo(() => {
    return GUIDE_ROLES.find((r) => r.id === activeRole) || GUIDE_ROLES[0];
  }, [activeRole]);

  return (
    <div
      className={`min-h-screen bg-surface-page text-text-primary transition-all duration-300 ${
        isZenMode ? "fixed inset-0 z-50 overflow-y-auto bg-surface-page p-4 sm:p-6" : "page-container py-6 space-y-6"
      }`}
    >
      {/* 1. HERO HEADER BANNER ĐỒNG BỘ DESIGN SYSTEM */}
      <div
        className={`relative overflow-hidden rounded-surface border border-border-default bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all ${
          isZenMode ? "shadow-md" : ""
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800">
              <BookOpen className="size-6" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="type-page-title text-text-primary dark:text-white">
                  Cẩm Nang Hướng Dẫn Sử Dụng Chi Tiết Hệ Thống NacenTwin
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                  <Sparkles className="size-3.5" />
                  11 Phân Hệ · {GUIDE_SCREENS.length} Màn Hình &amp; Phiếu Nghiệp Vụ
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-800 border border-brand-300 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800">
                  <ShieldCheck className="size-3.5" />
                  7 Vai Trò Tác Nhân
                </span>
              </div>
              <p className="text-sm text-text-secondary dark:text-slate-400 max-w-4xl">
                Cẩm nang số hóa bàn giao toàn trình hệ thống Nacentwin: bao phủ trọn bộ {GUIDE_SCREENS.length} màn hình, bao gồm toàn bộ các màn hình đánh giá trình độ công nghệ TT17, khảo sát năng lực hấp thụ Buyer, và đầy đủ các loại phiếu yêu cầu kết nối, đề xuất chuyển giao công nghệ.
              </p>
            </div>
          </div>

          {/* CÁC NÚT THAO TÁC CỐT LÕI */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Chuyển chế độ xem */}
            <div className="inline-flex items-center rounded-lg border border-border-default bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setViewMode("CARDS")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  viewMode === "CARDS"
                    ? "bg-white text-brand-700 shadow-2xs dark:bg-slate-800 dark:text-brand-300"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
                title="Xem giao diện thẻ trực quan"
              >
                <Monitor className="size-3.5" />
                <span className="hidden sm:inline">Thẻ UI/UX</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("DOCUMENT")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  viewMode === "DOCUMENT"
                    ? "bg-white text-brand-700 shadow-2xs dark:bg-slate-800 dark:text-brand-300"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
                title="Xem văn bản chi tiết"
              >
                <FileText className="size-3.5" />
                <span className="hidden sm:inline">Văn Bản</span>
              </button>
            </div>

            {/* Nút Tải PDF */}
            <a
              href="/huong-dan-su-dung.pdf"
              download="Huong_Dan_Su_Dung_NacenTwin.pdf"
              className="inline-flex items-center gap-1.5 rounded-control bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold transition shadow-xs"
              title="Tải toàn bộ cẩm nang hướng dẫn sử dụng định dạng PDF (2.4 MB)"
            >
              <FileDown className="size-3.5" />
              <span>Tải PDF</span>
            </a>

            {/* Nút Sao Chép Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-control bg-brand-50 hover:bg-brand-100 text-brand-800 dark:bg-brand-950/70 dark:hover:bg-brand-900 dark:text-brand-200 border border-brand-300 px-3 py-2 text-xs font-bold transition shadow-2xs cursor-pointer"
              title="Sao chép đường dẫn hướng dẫn sử dụng kèm bộ lọc hiện tại"
            >
              <Share2 className="size-3.5" />
              <span className="hidden md:inline">Chia sẻ Link</span>
            </button>

            {/* Nút Mở Tab Mới */}
            <button
              type="button"
              onClick={handleOpenNewTab}
              className="inline-flex items-center gap-1.5 rounded-control border border-border-default bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 px-3 py-2 text-xs font-semibold transition cursor-pointer"
              title="Mở tài liệu hướng dẫn trong tab mới toàn trang"
            >
              <ExternalLink className="size-3.5" />
              <span className="hidden md:inline">Mở Tab Mới</span>
            </button>

            {/* Nút Toggle Zen Mode */}
            <button
              type="button"
              onClick={() => setIsZenMode((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-control border border-border-default bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 px-3 py-2 text-xs font-semibold transition cursor-pointer"
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
      </div>

      {/* 2. KHỐI BỘ LỌC ĐẶC BIỆT: ĐÁNH GIÁ CÔNG NGHỆ & CÁC LOẠI PHIẾU YÊU CẦU */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 px-1">
          Chuyên mục tiêu điểm:
        </span>
        <button
          type="button"
          onClick={() => setSpecialFilter("ALL")}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            specialFilter === "ALL"
              ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-xs"
              : "bg-white text-slate-700 border border-border-default hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
          }`}
        >
          <span>📋</span>
          <span>Tất cả ({GUIDE_SCREENS.length} Màn hình &amp; Phiếu)</span>
        </button>

        <button
          type="button"
          onClick={() => setSpecialFilter("ASSESSMENT")}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            specialFilter === "ASSESSMENT"
              ? "bg-brand-700 text-white shadow-xs ring-2 ring-brand-700/20"
              : "bg-white text-brand-700 border border-brand-300 hover:bg-brand-50 dark:bg-slate-900 dark:text-brand-300 dark:border-brand-800"
          }`}
        >
          <BarChart3 className="size-3.5 text-brand-600 dark:text-brand-300" />
          <span>📊 Đánh Giá Công Nghệ (TT17 &amp; TNI) ({assessmentCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setSpecialFilter("REQUEST_FORMS")}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            specialFilter === "REQUEST_FORMS"
              ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600/20"
              : "bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 dark:bg-slate-900 dark:text-emerald-300 dark:border-emerald-800"
          }`}
        >
          <ClipboardList className="size-3.5 text-emerald-600 dark:text-emerald-300" />
          <span>📝 Các Loại Phiếu Yêu Cầu &amp; Khảo Sát ({requestFormsCount})</span>
        </button>
      </div>

      {/* 3. THANH BỘ LỌC TƯƠNG TÁC THEO VAI TRÒ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="size-4 text-brand-700 dark:text-brand-400" />
            <h2 className="text-sm font-bold text-text-primary dark:text-white uppercase tracking-wider">
              Lọc Nhanh Theo Vai Trò Tác Nghiệp:
            </h2>
          </div>
          {(activeRole !== "ALL" || specialFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                handleSelectRole("ALL");
                setSpecialFilter("ALL");
              }}
              className="text-xs font-semibold text-brand-700 dark:text-brand-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="size-3" /> Xóa bộ lọc vai trò
            </button>
          )}
        </div>

        {/* Cụm Tabs các vai trò */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            type="button"
            aria-label={`Tất cả (${roleScreenCounts["ALL"] || 60})`}
            onClick={() => handleSelectRole("ALL")}
            className={`group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeRole === "ALL"
                ? "bg-brand-700 text-white shadow-xs ring-2 ring-brand-700/20"
                : "bg-white text-slate-700 hover:bg-brand-50 hover:text-brand-700 border border-border-default dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
            }`}
          >
            <span aria-hidden="true">📚</span>
            <span>Tất cả ({roleScreenCounts["ALL"] || 60})</span>
          </button>

          <button
            type="button"
            aria-label={`Bên mua công nghệ (${roleScreenCounts["BUYER"] || 14})`}
            onClick={() => handleSelectRole("BUYER")}
            className={`group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeRole === "BUYER"
                ? "bg-brand-700 text-white shadow-xs ring-2 ring-brand-700/20"
                : "bg-white text-slate-700 hover:bg-brand-50 hover:text-brand-700 border border-border-default dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
            }`}
          >
            <span aria-hidden="true">🛒</span>
            <span>Bên mua công nghệ ({roleScreenCounts["BUYER"] || 14})</span>
          </button>

          <button
            type="button"
            aria-label={`Bên chào bán (${roleScreenCounts["SELLER"] || 16})`}
            onClick={() => handleSelectRole("SELLER")}
            className={`group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeRole === "SELLER"
                ? "bg-brand-700 text-white shadow-xs ring-2 ring-brand-700/20"
                : "bg-white text-slate-700 hover:bg-brand-50 hover:text-brand-700 border border-border-default dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
            }`}
          >
            <span aria-hidden="true">🏭</span>
            <span>Bên chào bán ({roleScreenCounts["SELLER"] || 16})</span>
          </button>

          <button
            type="button"
            aria-label={`Chuyên gia KH&CN (${roleScreenCounts["EXPERT"] || 28})`}
            onClick={() => handleSelectRole("EXPERT")}
            className={`group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeRole === "EXPERT"
                ? "bg-brand-700 text-white shadow-xs ring-2 ring-brand-700/20"
                : "bg-white text-slate-700 hover:bg-brand-50 hover:text-brand-700 border border-border-default dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
            }`}
          >
            <span aria-hidden="true">🎓</span>
            <span>Chuyên gia KH&CN ({roleScreenCounts["EXPERT"] || 28})</span>
          </button>

          <button
            type="button"
            aria-label={`Doanh nghiệp ĐMST (${roleScreenCounts["ENTERPRISE"] || 18})`}
            onClick={() => handleSelectRole("ENTERPRISE")}
            className={`group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeRole === "ENTERPRISE"
                ? "bg-brand-700 text-white shadow-xs ring-2 ring-brand-700/20"
                : "bg-white text-slate-700 hover:bg-brand-50 hover:text-brand-700 border border-border-default dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
            }`}
          >
            <span aria-hidden="true">💡</span>
            <span>Doanh nghiệp ĐMST ({roleScreenCounts["ENTERPRISE"] || 18})</span>
          </button>

          <button
            type="button"
            aria-label={`Sở KH&CN tỉnh (${roleScreenCounts["GOV"] || 22})`}
            onClick={() => handleSelectRole("GOV")}
            className={`group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeRole === "GOV"
                ? "bg-brand-700 text-white shadow-xs ring-2 ring-brand-700/20"
                : "bg-white text-slate-700 hover:bg-brand-50 hover:text-brand-700 border border-border-default dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
            }`}
          >
            <span aria-hidden="true">🏛️</span>
            <span>Sở KH&CN tỉnh ({roleScreenCounts["GOV"] || 22})</span>
          </button>

          <button
            type="button"
            aria-label={`Quản trị viên (${roleScreenCounts["ADMIN"] || 16})`}
            onClick={() => handleSelectRole("ADMIN")}
            className={`group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeRole === "ADMIN"
                ? "bg-brand-700 text-white shadow-xs ring-2 ring-brand-700/20"
                : "bg-white text-slate-700 hover:bg-brand-50 hover:text-brand-700 border border-border-default dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
            }`}
          >
            <span aria-hidden="true">👑</span>
            <span>Quản trị viên ({roleScreenCounts["ADMIN"] || 16})</span>
          </button>

          <button
            type="button"
            aria-label={`Khách đại chúng (${roleScreenCounts["PUBLIC_USER"] || 14})`}
            onClick={() => handleSelectRole("PUBLIC_USER")}
            className={`group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeRole === "PUBLIC_USER"
                ? "bg-brand-700 text-white shadow-xs ring-2 ring-brand-700/20"
                : "bg-white text-slate-700 hover:bg-brand-50 hover:text-brand-700 border border-border-default dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
            }`}
          >
            <span aria-hidden="true">🌐</span>
            <span>Khách đại chúng ({roleScreenCounts["PUBLIC_USER"] || 14})</span>
          </button>
        </div>

        {/* Banner thông tin vai trò đang chọn */}
        {activeRole !== "ALL" && (
          <div className="flex items-start gap-3 rounded-xl border border-brand-200/90 bg-brand-50/80 p-3 text-xs text-brand-900 dark:border-brand-900/60 dark:bg-brand-950/40 dark:text-brand-200">
            <div className="text-base shrink-0">{activeRoleConfig.icon}</div>
            <div className="space-y-0.5">
              <div className="font-bold flex items-center gap-1.5">
                <span>Vai trò: {activeRoleConfig.label} ({activeRoleConfig.code})</span>
                <span className="text-brand-700 dark:text-brand-300">• Đang hiển thị {filteredScreens.length} màn hình được phân quyền</span>
              </div>
              <p className="text-brand-800/90 dark:text-brand-300 leading-relaxed">
                {activeRoleConfig.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. THANH TÌM KIẾM & BỘ LỌC PHÂN HỆ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-surface border border-border-default bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        {/* Ô Tìm Kiếm */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên màn hình, mã số (vd: 9.2, 6.8), URL route (vd: /tt17/wizard, /consultations)..."
            className="w-full rounded-control border border-border-default bg-surface-subtle py-2 pl-9 pr-8 text-xs text-text-primary placeholder:text-slate-400 focus:border-brand-700 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Lọc theo Phân Hệ */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="size-3.5 text-slate-400" />
          <select
            value={selectedModule}
            onChange={(e) =>
              setSelectedModule(
                e.target.value === "ALL" ? "ALL" : Number(e.target.value)
              )
            }
            className="rounded-control border border-border-default bg-surface-subtle py-2 px-3 text-xs font-semibold text-text-primary focus:border-brand-700 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white cursor-pointer"
          >
            <option value="ALL">Tất cả 11 Phân Hệ</option>
            {GUIDE_MODULES.map((m) => (
              <option key={m.num} value={m.num}>
                Phân Hệ {m.num}: {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. KHU VỰC NỘI DUNG CHÍNH (CARDS HOẶC IFRAME DOCUMENT) */}
      {viewMode === "CARDS" ? (
        <div className="space-y-8">
          {groupedScreens.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-surface border-2 border-dashed border-border-default bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Search className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="type-card-title text-text-primary dark:text-white">
                  Không tìm thấy màn hình phù hợp
                </h3>
                <p className="text-xs text-text-secondary dark:text-slate-400 max-w-md">
                  Không có màn hình hoặc phiếu yêu cầu nào thỏa mãn bộ lọc hiện tại. Hãy thử chọn vai trò khác hoặc bấm đặt lại toàn bộ bộ lọc.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveRole("ALL");
                  setSelectedModule("ALL");
                  setSearchQuery("");
                  setSpecialFilter("ALL");
                  if (typeof window !== "undefined") {
                    window.history.replaceState(null, "", window.location.pathname);
                  }
                }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-control bg-brand-700 text-white px-4 py-2 text-xs font-bold hover:bg-brand-800 transition cursor-pointer"
              >
                Đặt lại toàn bộ bộ lọc
              </button>
            </div>
          ) : (
            groupedScreens.map((group) => (
              <section key={group.moduleNumber} className="space-y-4">
                {/* Tiêu đề phân hệ */}
                <div className="flex items-center justify-between border-b-2 border-brand-700/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-brand-700 text-white text-xs font-black">
                      {group.moduleNumber}
                    </span>
                    <h2 className="type-section-title text-text-primary dark:text-white">
                      PHÂN HỆ {group.moduleNumber}: {group.moduleName.toUpperCase()}
                    </h2>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-800 border border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800">
                    {group.screens.length} màn hình &amp; phiếu
                  </span>
                </div>

                {/* Danh sách Thẻ Màn hình */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {group.screens.map((screen) => (
                    <article
                      key={screen.id}
                      id={`screen-${screen.id.replace(".", "-")}`}
                      className="group flex flex-col justify-between rounded-surface border border-border-default bg-white p-5 shadow-2xs hover:shadow-md hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition-all duration-200"
                    >
                      <div className="space-y-3.5">
                        {/* Header của Card */}
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-xs font-extrabold text-brand-800 border border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800">
                              Màn hình {screen.id}
                            </span>
                            {screen.isAssessment && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold text-brand-700 border border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800">
                                <BarChart3 className="size-3" />
                                Đánh giá CN
                              </span>
                            )}
                            {screen.isRequestForm && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                                <ClipboardList className="size-3" />
                                Phiếu nghiệp vụ
                              </span>
                            )}
                            {screen.isNew && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                                <Sparkles className="size-3" />
                                Mới
                              </span>
                            )}
                          </div>

                          <Link
                            href={getSafeHref(screen.route)}
                            className="inline-flex items-center gap-1 rounded-md bg-surface-subtle hover:bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700 hover:text-brand-800 dark:bg-slate-800 dark:text-brand-300 dark:hover:bg-slate-700 transition"
                            title={`Truy cập trực tiếp màn hình ${screen.route}`}
                          >
                            <span>{screen.route}</span>
                            <ExternalLink className="size-3" />
                          </Link>
                        </div>

                        {/* Tiêu đề màn hình */}
                        <div>
                          <h3 className="type-card-title text-text-primary dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-400 transition">
                            {screen.title}
                          </h3>
                          <p className="mt-1 text-xs text-text-secondary dark:text-slate-400 leading-relaxed">
                            {screen.description}
                          </p>
                        </div>

                        {/* Badges các vai trò được phân quyền */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-xs font-semibold text-slate-400">
                            Vai trò:
                          </span>
                          {screen.roles.map((rCode) => {
                            const rInfo = GUIDE_ROLES.find(
                              (r) => r.id === rCode || r.code === rCode
                            );
                            const isCurrentRole =
                              activeRole !== "ALL" &&
                              (activeRole === rCode ||
                                activeRoleConfig.code === rCode);
                            return (
                              <span
                                key={rCode}
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold border ${
                                  isCurrentRole
                                    ? "bg-brand-700 text-white border-brand-700 shadow-2xs font-bold"
                                    : "bg-surface-subtle text-slate-700 border-border-default dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                }`}
                              >
                                <span>{rInfo?.icon || "👤"}</span>
                                <span>{rInfo?.label || rCode}</span>
                              </span>
                            );
                          })}
                        </div>

                        {/* Quy trình thao tác từng bước */}
                        <div className="rounded-xl border border-border-default/80 bg-surface-subtle/80 p-3 space-y-1.5 dark:border-slate-800 dark:bg-slate-950/60">
                          <div className="text-xs font-bold text-text-primary dark:text-slate-300 flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5 text-brand-700 dark:text-brand-400" />
                            Quy trình thao tác chuẩn:
                          </div>
                          <ol className="space-y-1 pl-4 text-xs text-text-secondary dark:text-slate-400 list-decimal">
                            {screen.steps.map((st, sIdx) => (
                              <li key={sIdx} className="leading-relaxed">
                                {st}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Ảnh chụp minh họa màn hình */}
                        {screen.image ? (
                          <div className="relative overflow-hidden rounded-xl border border-border-default bg-slate-50 dark:border-slate-800 dark:bg-slate-950 group/img">
                            <img
                              src={screen.image}
                              alt={`Ảnh chụp màn hình ${screen.title}`}
                              className="w-full h-44 object-cover object-top transition duration-300 group-hover/img:scale-102"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setLightboxImage({
                                    src: screen.image!,
                                    title: `${screen.id}. ${screen.title}`,
                                  })
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-md hover:bg-white transition cursor-pointer"
                              >
                                <Eye className="size-3.5" />
                                Xem ảnh lớn
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between rounded-xl border border-dashed border-border-default bg-surface-subtle p-3 text-xs text-text-tertiary dark:border-slate-800 dark:bg-slate-950/40">
                            <div className="flex items-center gap-2">
                              <Monitor className="size-4 text-slate-400" />
                              <span>Giao diện trực tiếp tại đường dẫn {screen.route}</span>
                            </div>
                            <Link
                              href={getSafeHref(screen.route)}
                              className="font-bold text-brand-700 hover:underline dark:text-brand-400"
                            >
                              Mở màn hình →
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Footer của Card */}
                      <div className="mt-4 pt-3 border-t border-border-default/80 flex items-center justify-between text-xs dark:border-slate-800">
                        <span className="text-text-tertiary dark:text-slate-500">
                          {screen.moduleName}
                        </span>
                        <Link
                          href={getSafeHref(screen.route)}
                          className="font-bold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 inline-flex items-center gap-1"
                        >
                          Truy cập màn hình <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      ) : null}

      {/* 6. KHUNG IFRAME HIỂN THỊ HƯỚNG DẪN SỬ DỤNG VĂN BẢN (HOẶC CHO TEST BẢO TOÀN) */}
      <div
        className={
          viewMode === "DOCUMENT"
            ? "relative overflow-hidden rounded-surface border border-border-default bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 h-[calc(100vh-215px)] min-h-[750px]"
            : "hidden"
        }
      >
        <iframe
          ref={iframeRef}
          src={`/huong-dan-su-dung.html${currentHash}`}
          title="Hướng Dẫn Sử Dụng Chi Tiết Hệ Thống NacenTwin"
          className="size-full border-0"
        />
      </div>

      {/* 7. MODAL LIGHTBOX XEM ẢNH PHÓNG TO */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 sm:p-6"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-default px-4 py-3 dark:border-slate-800">
              <h4 className="font-heading font-serif text-sm font-bold text-text-primary dark:text-white truncate">
                {lightboxImage.title}
              </h4>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="overflow-auto p-4 max-h-[calc(90vh-60px)] flex items-center justify-center bg-slate-950">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* 8. FOOTNOTE ĐIỀU HƯỚNG BỔ SUNG */}
      {!isZenMode && (
        <footer className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border-default text-xs text-text-secondary dark:border-slate-800 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Info className="size-4 text-brand-700 dark:text-brand-400 shrink-0" />
            <span>
              Mẹo: Chọn chuyên mục "Đánh Giá Công Nghệ" hoặc "Các Loại Phiếu Yêu Cầu" phía trên để tra cứu tập trung theo nhu cầu tác nghiệp.
            </span>
          </div>
          <div className="flex items-center gap-3 font-semibold">
            <Link href="/" className="hover:underline text-brand-700 dark:text-brand-400">
              Trang chủ
            </Link>
            <span>•</span>
            <Link
              href="/assessments/tt17"
              className="hover:underline text-brand-700 dark:text-brand-400"
            >
              Đánh giá TT17
            </Link>
            <span>•</span>
            <Link
              href="/chao-ban-cong-nghe"
              className="hover:underline text-brand-700 dark:text-brand-400"
            >
              Sàn chào bán
            </Link>
            <span>•</span>
            <Link
              href="/nhu-cau-cong-nghe"
              className="hover:underline text-brand-700 dark:text-brand-400"
            >
              Sàn nhu cầu
            </Link>
            <span>•</span>
            <Link
              href="/experts"
              className="hover:underline text-brand-700 dark:text-brand-400"
            >
              Mạng lưới chuyên gia
            </Link>
          </div>
        </footer>
      )}
    </div>
  );
}
