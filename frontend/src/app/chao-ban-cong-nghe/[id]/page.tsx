"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  Award,
  Building2,
  FileText,
  Lock,
  Download,
  Share2,
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Bookmark,
  Check,
  Loader2,
  Video,
  FolderSearch,
  Send,
  ShoppingBag,
} from "lucide-react";
import { useToast } from "@/components/common/toast";
import { fetchOfferById, submitQuickDemand } from "@/services/api/technology-offer";
import { TechnologyOffer } from "@/types/technology-offer";
import { getTechnologyGallery } from "@/lib/technology-media";
import { authClient, UserContext } from "@/lib/auth-client";
import { BlockchainZkpBadge } from "@/components/blockchain/BlockchainZkpBadge";
import { IndexVerificationBadge } from "@/components/common/IndexVerificationBadge";

function formatDocSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "1.2 MB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getDocumentTypeBadge(type: string): { label: string; color: string } {
  switch (type) {
    case "PATENT":
      return { label: "Văn bằng SHTT", color: "bg-brand-50 text-brand-700 border-brand-200" };
    case "TESTING_REPORT":
      return { label: "Kiểm định / Thử nghiệm", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "TECH_SPEC":
      return { label: "Thuyết minh kỹ thuật", color: "bg-brand-50 text-brand-700 border-brand-200" };
    case "FINANCIAL_PROJECTION":
      return { label: "Tài chính / Thị trường", color: "bg-amber-50 text-amber-700 border-amber-200" };
    default:
      return { label: "Hồ sơ đính kèm", color: "bg-slate-50 text-slate-700 border-slate-200" };
  }
}

export default function ChiTietChaoBanPage() {
  const params = useParams();
  const id = params?.id as string;
  const toast = useToast();

  const [offer, setOffer] = useState<TechnologyOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "dataroom">("overview");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Trạng thái Bookmark & Share
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Trạng thái & Dữ liệu Form Quick Demand Modal
  const [isSubmittingDemand, setIsSubmittingDemand] = useState(false);
  const [createdDemandCode, setCreatedDemandCode] = useState<string | null>(null);
  const [createdRequestCode, setCreatedRequestCode] = useState<string | null>(null);
  const [demandProblem, setDemandProblem] = useState("");
  const [demandCompany, setDemandCompany] = useState("");
  const [demandContact, setDemandContact] = useState("");
  const [demandPhone, setDemandPhone] = useState("");
  const [demandEmail, setDemandEmail] = useState("");
  const [demandBudget, setDemandBudget] = useState("500M_1B");
  const [demandTimeline, setDemandTimeline] = useState("1_3M");
  const [demandMethod, setDemandMethod] = useState("TRANSFER");
  const [demandNotes, setDemandNotes] = useState("");
  const [currentUser, setCurrentUser] = useState<UserContext | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);

  useEffect(() => {
    const user = authClient.getUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleOpenConnectModal = (defaultMethod?: string) => {
    const user = authClient.getUser();
    if (user) {
      setCurrentUser(user);
      const isPublic = user.role === "PUBLIC_USER" || user.role === "GUEST";
      let changed = false;
      if (!demandCompany) {
        if (!isPublic) {
          setDemandCompany(user.organizationName || user.fullName || "Doanh nghiệp Hội viên");
          changed = true;
        } else if (user.organizationName) {
          setDemandCompany(user.organizationName);
          changed = true;
        }
      }
      if (!demandContact) {
        setDemandContact(user.fullName || "");
        changed = true;
      }
      if (!demandPhone) {
        setDemandPhone(user.phone || user.phoneNumber || "0912345678");
        changed = true;
      }
      if (!demandEmail) {
        setDemandEmail(user.email || "");
        changed = true;
      }
      if (changed) setAutoFilled(true);
    }
    if (defaultMethod) {
      setDemandMethod(defaultMethod);
      if (defaultMethod === "PURCHASE_COMMERCIAL" && demandBudget === "500M_1B") {
        setDemandBudget("20M_100M");
      }
    } else if (offer && (!offer.hasTechTransfer || offer.offerType === "PRODUCT")) {
      if (demandMethod === "TRANSFER") {
        setDemandMethod("PURCHASE_COMMERCIAL");
      }
      if (demandBudget === "500M_1B") {
        setDemandBudget("20M_100M");
      }
    }
    setShowConnectModal(true);
  };

  const handleAutoFillUser = () => {
    const user = currentUser || authClient.getUser();
    if (!user) {
      toast.warning("Bạn chưa đăng nhập tài khoản.", "Chưa đăng nhập");
      return;
    }
    const isPublic = user.role === "PUBLIC_USER" || user.role === "GUEST";
    if (!isPublic) {
      setDemandCompany(user.organizationName || user.fullName || "Doanh nghiệp Hội viên");
    } else {
      setDemandCompany(user.organizationName || "");
    }
    setDemandContact(user.fullName || "");
    setDemandPhone(user.phone || user.phoneNumber || "0912345678");
    setDemandEmail(user.email || "");
    setAutoFilled(true);
    toast.info("Đã điền thông tin tài khoản vào form.", "Tự động điền");
  };

  const handleProblemChange = (val: string) => {
    setDemandProblem(val);
    if (val.trim().length > 0) {
      const user = currentUser || authClient.getUser();
      if (user) {
        const isPublic = user.role === "PUBLIC_USER" || user.role === "GUEST";
        let changed = false;
        if (!demandCompany) {
          if (!isPublic) {
            setDemandCompany(user.organizationName || user.fullName || "Doanh nghiệp Hội viên");
            changed = true;
          } else if (user.organizationName) {
            setDemandCompany(user.organizationName);
            changed = true;
          }
        }
        if (!demandContact) {
          setDemandContact(user.fullName || "");
          changed = true;
        }
        if (!demandPhone) {
          setDemandPhone(user.phone || user.phoneNumber || "0912345678");
          changed = true;
        }
        if (!demandEmail) {
          setDemandEmail(user.email || "");
          changed = true;
        }
        if (changed) setAutoFilled(true);
      }
    }
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetchOfferById(id).then((data) => {
        setOffer(data);
        setIsLoading(false);
        if (data) {
          const isComm = !data.hasTechTransfer || data.offerType === "PRODUCT";
          setDemandProblem(
            isComm
              ? `[Đơn đặt mua] Sản phẩm: ${data.title}`
              : `Nhu cầu ứng dụng / chuyển giao: ${data.title}`
          );
        }
      });
    }
  }, [id]);

  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      try {
        const saved = localStorage.getItem("nacentwin_bookmarked_offers");
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list) && list.includes(id)) {
            setIsBookmarked(true);
          }
        }
      } catch {
        // fallback
      }
    }
  }, [id]);

  const handleToggleBookmark = () => {
    if (!id) return;
    const next = !isBookmarked;
    setIsBookmarked(next);
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("nacentwin_bookmarked_offers");
        let list: string[] = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(list)) list = [];
        if (next) {
          if (!list.includes(id)) list.push(id);
          toast.success("Đã lưu hồ sơ vào danh sách quan tâm!");
        } else {
          list = list.filter((item) => item !== id);
          toast.info("Đã bỏ lưu hồ sơ khỏi danh sách quan tâm.");
        }
        localStorage.setItem("nacentwin_bookmarked_offers", JSON.stringify(list));
      } catch {
        // fallback
      }
    }
  };

  const handleShareOffer = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Đã sao chép liên kết hồ sơ vào bộ nhớ tạm!");
      } catch {
        toast.error("Không thể tự động sao chép liên kết.");
      }
    }
  };

  const handleDownloadDoc = (docName: string) => {
    toast.success(`Đang tải xuống tài liệu: ${docName}`);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4 max-w-md w-full animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          <div className="h-24 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="type-section-title text-slate-900">Không tìm thấy hồ sơ công nghệ</h2>
          <p className="text-xs text-slate-500">Hồ sơ này không tồn tại hoặc đã được chuyển vào kho lưu trữ.</p>
          <Link
            href="/chao-ban-cong-nghe"
            className="inline-flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại sàn giao dịch
          </Link>
        </div>
      </div>
    );
  }

  const isCommercialProduct = !offer.hasTechTransfer || offer.offerType === "PRODUCT";

  const getTrlDescription = (level?: number | null) => {
    switch (level) {
      case 9:
        return "Hệ thống đã hoàn thiện và vận hành thương mại thành công trên quy mô công nghiệp.";
      case 8:
        return "Hệ thống hoàn chỉnh và đạt đầy đủ các tiêu chuẩn kiểm định thực tế.";
      case 7:
        return "Nguyên mẫu quy mô bán công nghiệp đã được thử nghiệm vận hành tại hiện trường.";
      case 6:
        return "Mô hình thử nghiệm quy mô pilot đã kiểm chứng trong môi trường mô phỏng.";
      default:
        return "Công nghệ đang trong giai đoạn phát triển và hoàn thiện các bước R&D tiếp theo.";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* BANNER CẢNH BÁO TRẠNG THÁI KIỂM DUYỆT (CHẾ ĐỘ PREVIEW NỘI BỘ) */}
      {offer.status !== "APPROVED" && (
        <aside aria-label="Cảnh báo kiểm duyệt" className="bg-amber-500 text-slate-950 px-4 py-3 border-b border-amber-600 shadow-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping shrink-0" />
              <span>
                <strong>CHẾ ĐỘ XEM TRƯỚC NỘI BỘ (PREVIEW):</strong> Hồ sơ công nghệ này đang ở trạng thái{" "}
                <span className="font-mono uppercase font-bold bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded">
                  {offer.status || "PENDING"}
                </span>
                . Sản phẩm <strong>CHƯA ĐƯỢC NIÊM YẾT CÔNG KHAI</strong> trên Cổng Giao Thương BACLINK. Khách hàng bên ngoài không thể tìm kiếm hay giao dịch cho đến khi được Ban Quản trị Hiệp hội BACLINK phê duyệt.
              </span>
            </div>
            <span className="text-xs font-extrabold uppercase bg-slate-950 text-amber-300 px-2.5 py-1 rounded-md tracking-wider shrink-0">
              Chưa Công Khai
            </span>
          </div>
        </aside>
      )}

      {/* BREADCRUMB HEADER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/chao-ban-cong-nghe"
            className="text-xs font-bold text-slate-600 hover:text-emerald-600 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Về danh sách chào bán
          </Link>

          <div className="flex items-center gap-2">
            <span className="mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {offer.offerCode}
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {offer.status === "APPROVED" ? "Đã xác thực & Niêm yết" : "Đang xử lý"}
            </span>
          </div>
        </div>
      </div>

      {/* HERO SECTION - WIREFRAME BASIC DESIGN 2-COLUMN SHOWCASE (42% MEDIA - 58% INFO) */}
      <section className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {(() => {
            const customGallery = [
              ...(offer.mainImageUrl ? [offer.mainImageUrl] : []),
              ...(offer.galleryImageUrls || []),
            ].filter(Boolean);
            const gallery = customGallery.length > 0 ? customGallery : getTechnologyGallery(offer.sectorCode, offer.title);
            const activeImageUrl = gallery[selectedImage] || gallery[0];

            return (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-[42%_58%]">
                  {/* CỘT TRÁI (42%): MEDIA SHOWCASE & GALLERY THUMBNAILS */}
                  <div className="relative bg-gradient-to-br from-slate-100 to-teal-50/40 p-5 sm:p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
                    <div>
                      {/* Main Big Image Preview */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900/5 shadow-inner">
                        <Image
                          src={activeImageUrl}
                          alt={offer.title}
                          fill
                          unoptimized={activeImageUrl.startsWith("data:") || activeImageUrl.startsWith("http")}
                          sizes="(max-width: 1024px) 100vw, 42vw"
                          className="object-cover transition-all duration-300"
                        />

                        {/* Verified Seller Badge */}
                        <div className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-extrabold text-emerald-700 shadow-sm flex items-center gap-1.5 border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã xác minh cơ bản</span>
                        </div>

                        {/* TRL Verification Badge Pill */}
                        {offer.trlLevel && offer.trlLevel > 0 && (
                          <div className="absolute bottom-3 right-3 shadow-md">
                            <IndexVerificationBadge
                              type="TRL"
                              value={offer.trlLevel}
                              status={offer.trlVerificationStatus}
                              authorityName={offer.verifiedAuthorityName}
                              variant="compact"
                              concise
                              translucent
                            />
                          </div>
                        )}
                      </div>

                      {/* 4 Gallery Thumbnails */}
                      <div className="mt-4 grid grid-cols-4 gap-2.5">
                        {gallery.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedImage(idx)}
                            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImage === idx
                                ? "border-brand-600 ring-2 ring-brand-400/40 shadow-sm scale-[1.02]"
                                : "border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100"
                            }`}
                          >
                            <Image
                              src={img}
                              alt={`Thumbnail ${idx + 1}`}
                              fill
                              sizes="120px"
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {offer.videoDemoUrl && (
                      <div className="mt-3 text-center">
                        <a
                          href={offer.videoDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition"
                        >
                          <Video className="w-3.5 h-3.5" /> Xem Video Demo Thực Tế ↗
                        </a>
                      </div>
                    )}

                    <p className="mt-4 text-xs text-slate-500 text-center flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400 inline" />
                      Hình ảnh & mô hình sản phẩm được kiểm chứng bởi Hiệp hội BACLINK
                    </p>
                  </div>

                  {/* CỘT PHẢI (58%): THÔNG TIN CHÍNH, METRICS & CTAS */}
                  <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      {/* Tags Bar */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-brand-50 border border-brand-200/80 px-2.5 py-1 text-xs font-bold text-brand-700 uppercase tracking-wide">
                          {isCommercialProduct
                            ? offer.offerType === "DEVICE" || offer.offerType === "EQUIPMENT"
                              ? "Máy móc / Thiết bị công nghiệp"
                              : "Sản phẩm thương mại"
                            : offer.offerType === "SOLUTION"
                            ? "Giải pháp công nghệ"
                            : offer.offerType === "SOFTWARE"
                            ? "Phần mềm số hóa"
                            : offer.offerType === "PROCESS"
                            ? "Quy trình công nghệ"
                            : "Thiết bị công nghiệp"}
                        </span>
                        <span className="rounded-full bg-cyan-50 border border-cyan-200/80 px-2.5 py-1 text-xs font-bold text-cyan-800">
                          {offer.sectorName}
                        </span>
                        {offer.trlLevel && offer.trlLevel > 0 && (
                          <IndexVerificationBadge
                            type="TRL"
                            value={offer.trlLevel}
                            status={offer.trlVerificationStatus}
                            authorityName={offer.verifiedAuthorityName}
                            variant="full"
                          />
                        )}
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          {offer.ipStatus === "PATENT_GRANTED"
                            ? "Bằng độc quyền sáng chế"
                            : offer.ipStatus === "UTILITY_MODEL"
                            ? "Giải pháp hữu ích"
                            : offer.ipStatus === "COPYRIGHT_REGISTERED" || offer.ipStatus === "SOFTWARE_COPYRIGHT"
                            ? "Đã đăng ký bản quyền"
                            : offer.ipStatus === "PATENT_APPLICATION" || offer.ipStatus === "PATENT_PENDING"
                            ? "Đang thẩm định sáng chế"
                            : offer.ipStatus === "TRADE_SECRET"
                            ? "Bí quyết kinh doanh"
                            : offer.ipRegistrationNumber
                            ? `SHTT: ${offer.ipRegistrationNumber}`
                            : "Chưa đăng ký SHTT"}
                        </span>

                        {/* Bảo chứng Mật mã học ZKP & Chuỗi khối NDAChain */}
                        <BlockchainZkpBadge
                          entityType="SELLER_OFFER"
                          entityId={offer.id}
                          entityCode={offer.offerCode}
                        />
                      </div>

                      {/* Main Title */}
                      <h1 className="type-page-title text-slate-900">
                        {offer.title}
                      </h1>

                      {/* Developer / Origin / Doanh nghiệp chào bán */}
                      {(offer.enterpriseName || offer.developerOrigin) && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 flex-wrap">
                          <Building2 className="w-4 h-4 text-brand-600 shrink-0" />
                          <span>Đơn vị chào bán / Sở hữu:</span>
                          {offer.enterpriseTaxCode ? (
                            <Link
                              href={`/enterprises/${offer.enterpriseTaxCode}`}
                              className="text-brand-700 hover:text-brand-900 hover:underline font-bold inline-flex items-center gap-1.5 bg-brand-50/80 hover:bg-brand-100/90 px-2.5 py-1 rounded-lg border border-brand-200 transition"
                              title="Bấm để xem hồ sơ năng lực & chi tiết doanh nghiệp"
                            >
                              <span>{offer.enterpriseName || offer.developerOrigin}</span>
                              <span className="text-xs font-mono">↗</span>
                            </Link>
                          ) : (
                            <span
                              className="text-slate-700 font-bold inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200"
                              title="Đơn vị chưa liên kết hồ sơ doanh nghiệp"
                            >
                              <span>{offer.enterpriseName || offer.developerOrigin}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Short Description */}
                      <p className="text-sm leading-relaxed text-slate-600">
                        {offer.summary}
                      </p>

                      {/* 5 Wireframe Quick Specs Grid - Match Basic Design 1:1 */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-y border-slate-100 py-4">
                        <div>
                          <div className="text-xs font-bold uppercase text-slate-400">Giá công bố</div>
                          <div className="mt-1 text-sm font-extrabold text-slate-900">
                            {offer.pricingType === "CONTACT" && "Liên hệ báo giá"}
                            {offer.pricingType === "FIXED" &&
                              offer.priceAmount &&
                              `${(offer.priceAmount / 1_000_000).toLocaleString("vi-VN")} Tr ${
                                offer.unit ? `(${offer.unit})` : ""
                              }`}
                            {offer.pricingType === "RANGE" &&
                              offer.priceMin &&
                              offer.priceMax &&
                              `${(offer.priceMin / 1_000_000).toLocaleString("vi-VN")} - ${(
                                offer.priceMax / 1_000_000
                              ).toLocaleString("vi-VN")} Tr ${offer.unit ? `(${offer.unit})` : ""}`}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-bold uppercase text-slate-400">Phạm vi</div>
                          <div className="mt-1 text-sm font-extrabold text-slate-900">
                            {offer.managingAuthorityName && !/Sở KH/i.test(offer.managingAuthorityName)
                              ? offer.managingAuthorityName
                              : "Bắc Ninh & Vùng công nghiệp"}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-bold uppercase text-slate-400">Sở Hữu Trí Tuệ (SHTT)</div>
                          <div className="mt-1 text-sm font-extrabold text-emerald-700 truncate">
                            {offer.ipRegistrationNumber ||
                              (offer.ipStatus === "TRADE_SECRET"
                                ? "Bí quyết KD"
                                : offer.ipStatus === "PATENT_GRANTED"
                                ? "Bằng sáng chế"
                                : offer.ipStatus === "UTILITY_MODEL"
                                ? "Giải pháp hữu ích"
                                : offer.ipStatus === "COPYRIGHT_REGISTERED" || offer.ipStatus === "SOFTWARE_COPYRIGHT"
                                ? "Bản quyền ĐK"
                                : offer.ipStatus === "PATENT_APPLICATION" || offer.ipStatus === "PATENT_PENDING"
                                ? "Đang nộp đơn"
                                : "Chưa đăng ký")}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-bold uppercase text-slate-400">Kết nối thành công</div>
                          <div className="mt-1 text-sm font-extrabold text-slate-900">
                            {offer.successfulConnections || 0} lượt
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-bold uppercase text-slate-400">Đánh giá sàn</div>
                          <div className="mt-1 text-sm font-extrabold text-slate-900">
                            {offer.reviewCount && offer.reviewCount > 0 ? (
                              <>
                                {(offer.ratingScore ?? 5).toFixed(1)}/5 · {offer.reviewCount} review
                              </>
                            ) : (
                              <span className="text-slate-500 font-semibold">Chưa có đánh giá</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Utility Actions (Primary CTA unified into Sticky Sidebar - CR-2026-026) */}
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleToggleBookmark}
                          className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition flex items-center justify-center gap-2 ${
                            isBookmarked
                              ? "bg-amber-50 border-amber-300 text-amber-800 shadow-sm"
                              : "border-slate-300 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              isBookmarked ? "text-amber-600 fill-amber-500" : "text-slate-500"
                            }`}
                          />
                          {isBookmarked ? "Đã lưu quan tâm" : "Lưu quan tâm"}
                        </button>
                        <button
                          type="button"
                          onClick={handleShareOffer}
                          className="rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 px-3.5 py-3 transition flex items-center justify-center"
                          title="Chia sẻ hồ sơ"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {isCommercialProduct
                          ? "Thông tin báo giá sỉ, chính sách đại lý và đầu mối cung ứng mở sau khi gửi yêu cầu kết nối."
                          : "Thông tin liên hệ kỹ thuật và tài liệu bí quyết chỉ mở sau khi Buyer gửi yêu cầu kết nối được duyệt."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* BODY CONTENT & SIDEBAR */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT NỘI DUNG CHÍNH (2 CỘT) */}
        <div className="lg:col-span-2 space-y-6">
          {/* KHỐI BỘ TỨ SHTT & TRL NỔI BẬT */}
          {offer.hasTechTransfer && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                <h3 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Bộ Tứ Sở Hữu Trí Tuệ & Mức Độ Sẵn Sàng Công Nghệ (IP Quad)
                </h3>
                <span className="text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  Chuẩn hóa BACLINK
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Thang TRL */}
                <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    1. Mức Độ Sẵn Sàng (TRL)
                  </span>
                  {offer.trlLevel && offer.trlLevel > 0 ? (
                    <div className="space-y-1.5">
                      <IndexVerificationBadge
                        type="TRL"
                        value={offer.trlLevel}
                        status={offer.trlVerificationStatus}
                        authorityName={offer.verifiedAuthorityName}
                        variant="full"
                      />
                      <p className="text-xs text-slate-600 leading-snug pt-1">
                        {getTrlDescription(offer.trlLevel)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Hồ sơ thương phẩm hoặc chưa công bố thang đo mức độ hoàn thiện công nghệ.
                    </p>
                  )}
                </div>

                {/* 2. Tình trạng SHTT */}
                <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    2. Sở Hữu Trí Tuệ & Bản Quyền
                  </span>
                  <p className="text-xs font-extrabold text-slate-900">
                    {offer.ipStatus === "PATENT_GRANTED" && "Bằng Độc Quyền Sáng Chế"}
                    {offer.ipStatus === "UTILITY_MODEL" && "Giải Pháp Hữu Ích Đã Cấp"}
                    {offer.ipStatus === "TRADE_SECRET" && "Bí Quyết Công Nghệ (Know-how)"}
                    {(offer.ipStatus === "COPYRIGHT_REGISTERED" || offer.ipStatus === "SOFTWARE_COPYRIGHT") && "Bản Quyền Đã Đăng Ký"}
                    {(offer.ipStatus === "PATENT_APPLICATION" || offer.ipStatus === "PATENT_PENDING") && "Đơn Đăng Ký Sáng Chế Hợp Lệ"}
                    {offer.ipStatus === "NONE" && "Chưa Đăng Ký Sở Hữu Trí Tuệ"}
                    {!offer.ipStatus && "Chưa xác định"}
                  </p>
                  {offer.ipRegistrationNumber && (
                    <div className="mono text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded inline-block border border-emerald-200">
                      Số văn bằng: {offer.ipRegistrationNumber}
                    </div>
                  )}
                </div>

                {/* 3. Hình thức chuyển giao */}
                <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    3. Hình Thức Chuyển Giao
                  </span>
                  <p className="text-xs font-extrabold text-slate-900">
                    {offer.transferMethod === "EXCLUSIVE_LICENSE" && "Li-xăng độc quyền"}
                    {offer.transferMethod === "NON_EXCLUSIVE_LICENSE" && "Li-xăng không độc quyền"}
                    {offer.transferMethod === "ASSIGNMENT_SALE" && "Chuyển nhượng toàn bộ quyền"}
                    {offer.transferMethod === "JOINT_RD" && "Hợp tác R&D đồng phát triển"}
                    {!offer.transferMethod && "Thỏa thuận song phương"}
                  </p>
                  <p className="text-xs text-slate-500">Kèm đào tạo chuyển giao công nghệ</p>
                </div>

                {/* 4. Trạng thái thương mại */}
                <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    4. Trạng Thái Thương Mại
                  </span>
                  <p className="text-xs font-extrabold text-slate-900">
                    {offer.commercialStatus === "COMMERCIALLY_READY" && "Sẵn sàng thương mại hóa"}
                    {offer.commercialStatus === "PILOT_TESTING" && "Vận hành thử nghiệm hiện trường"}
                    {offer.commercialStatus === "LAB_PROTOTYPE" && "Nguyên mẫu phòng thí nghiệm"}
                    {!offer.commercialStatus && "Đang cập nhật"}
                  </p>
                  <p className="text-xs text-slate-500">Có dây chuyền mẫu để thẩm định</p>
                </div>
              </div>
            </div>
          )}

          {/* TABS NỘI DUNG CHI TIẾT */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 text-xs font-bold">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-3 border-b-2 transition ${
                  activeTab === "overview"
                    ? "border-emerald-600 text-emerald-800"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Tổng Quan & Bài Toán Giải Quyết
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={`pb-3 border-b-2 transition ${
                  activeTab === "specs"
                    ? "border-emerald-600 text-emerald-800"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Thông Số Kỹ Thuật &amp; Tiêu Chuẩn
              </button>
              <button
                onClick={() => setActiveTab("dataroom")}
                className={`pb-3 border-b-2 transition ${
                  activeTab === "dataroom"
                    ? "border-emerald-600 text-emerald-800"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {isCommercialProduct ? "Hồ Sơ Chất Lượng & Tài Liệu" : "Hồ Sơ DataRoom & Tài Liệu"}
              </button>
            </div>

            <div className="p-6 space-y-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                      {isCommercialProduct ? "Mô Tả Sản Phẩm" : "Mô Tả Tóm Tắt Giải Pháp"}
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{offer.summary}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                      {isCommercialProduct
                        ? "Công Dụng & Giá Trị Mang Lại Cho Khách Hàng"
                        : "Bài Toán Kỹ Thuật Giải Quyết Cho Bên Mua"}
                    </h4>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm text-slate-700 leading-relaxed">
                      {offer.problemSolved}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "specs" && (
                <div className="space-y-6">
                  {/* BẢNG CHỈ TIÊU KỸ THUẬT ĐỘNG (NẾU CÓ SPEC VALUES) */}
                  {offer.specValues && offer.specValues.length > 0 && (
                    <div className="space-y-3">
                      <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                            Chỉ Tiêu & Thông Số Kỹ Thuật Chi Tiết ({offer.specValues.length} chỉ tiêu)
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Dữ liệu đo kiểm chuẩn hóa theo danh mục nhóm ngành {offer.sectorCode} - {offer.sectorName}
                          </p>
                        </div>
                        <span className="text-xs font-bold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full border border-brand-200">
                          Chuẩn Kỹ Thuật
                        </span>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3 w-1/4">Mã chỉ tiêu</th>
                              <th className="py-2.5 px-3 w-2/5">Tên chỉ tiêu / Thông số</th>
                              <th className="py-2.5 px-3">Giá trị kỹ thuật</th>
                              <th className="py-2.5 px-3">Đơn vị</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {offer.specValues.map((spec, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60 transition">
                                <td className="py-2.5 px-3 font-mono font-semibold text-slate-500">{spec.specCode || `SPEC-${idx + 1}`}</td>
                                <td className="py-2.5 px-3 font-bold text-slate-800">{spec.specName}</td>
                                <td className="py-2.5 px-3 text-emerald-800 font-bold">{spec.specValue}</td>
                                <td className="py-2.5 px-3 text-slate-600 font-medium">{spec.unit || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* THÔNG TIN CHUNG VÀ PHÁP LÝ SHTT */}
                  <div className="space-y-3">
                    <div className="border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        Bảng Thông Số Kỹ Thuật & Chỉ Tiêu Hiệu Quả
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Đặc tính kỹ thuật và năng lực sản xuất theo chuẩn hóa Hiệp hội BACLINK
                      </p>
                    </div>
                    <table className="w-full text-xs text-left">
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-2.5 font-bold text-slate-600 w-1/3">
                            {isCommercialProduct ? "Loại hình sản phẩm:" : "Loại hình giải pháp:"}
                          </td>
                          <td className="py-2.5 text-slate-900 font-medium">
                            {offer.offerType === "PRODUCT"
                              ? "Sản phẩm thương phẩm thương mại (Không bao gồm chuyển giao công nghệ/quy trình sản xuất)"
                              : isCommercialProduct && (offer.offerType === "DEVICE" || offer.offerType === "EQUIPMENT")
                              ? "Máy móc / Thiết bị công nghiệp"
                              : offer.offerType === "SOFTWARE"
                              ? "Phần mềm số hóa & Nền tảng điều khiển"
                              : offer.offerType === "SOLUTION"
                              ? "Giải pháp công nghệ tích hợp"
                              : offer.offerType === "PROCESS"
                              ? "Quy trình công nghệ chế tạo"
                              : "Thiết bị / Máy móc công nghiệp"}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold text-slate-600">Lĩnh vực ứng dụng:</td>
                          <td className="py-2.5 text-slate-900 font-medium">
                            {offer.sectorName} ({offer.sectorCode})
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold text-slate-600">Mức độ sẵn sàng công nghệ:</td>
                          <td className="py-2.5 text-slate-900 font-medium">
                            {offer.trlLevel && offer.trlLevel > 0 ? (
                              <div className="space-y-1.5">
                                <IndexVerificationBadge
                                  type="TRL"
                                  value={offer.trlLevel}
                                  status={offer.trlVerificationStatus}
                                  authorityName={offer.verifiedAuthorityName}
                                  variant="full"
                                />
                                <p className="text-xs text-slate-500 pt-0.5">
                                  {getTrlDescription(offer.trlLevel)}
                                </p>
                              </div>
                            ) : (
                              "Hàng hóa thương mại / Không áp dụng TRL"
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold text-slate-600">
                            {isCommercialProduct ? "Quy cách & Đơn vị đóng gói:" : "Quy cách & Đơn vị chuyển giao:"}
                          </td>
                          <td className="py-2.5 text-slate-900 font-medium">
                            {offer.unit && offer.unit.trim() ? offer.unit : "Đang cập nhật quy cách"}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold text-slate-600">Bảo hộ Sở hữu trí tuệ:</td>
                          <td className="py-2.5 text-slate-900 font-medium">
                            {offer.ipRegistrationNumber
                              ? `Số văn bằng: ${offer.ipRegistrationNumber} (${
                                  offer.ipStatus === "COPYRIGHT_REGISTERED" || offer.ipStatus === "SOFTWARE_COPYRIGHT"
                                    ? "Đăng ký bản quyền phần mềm"
                                    : offer.ipStatus === "PATENT_GRANTED"
                                    ? "Bằng độc quyền sáng chế"
                                    : offer.ipStatus === "UTILITY_MODEL"
                                    ? "Giải pháp hữu ích"
                                    : "Chứng nhận bảo hộ SHTT"
                                })`
                              : offer.ipStatus === "TRADE_SECRET"
                              ? "Bí quyết công nghệ / Bí mật kinh doanh (Không đăng ký văn bằng)"
                              : "Chưa đăng ký bảo hộ SHTT hoặc là bí quyết kinh doanh"}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold text-slate-600">
                            {isCommercialProduct ? "Hình thức giao dịch:" : "Hình thức chuyển giao:"}
                          </td>
                          <td className="py-2.5 text-slate-900 font-medium">
                            {isCommercialProduct
                              ? "Bán hàng thương phẩm / Hợp đồng cung ứng đại lý"
                              : offer.transferMethod === "EXCLUSIVE_LICENSE"
                              ? "Li-xăng độc quyền (Exclusive License)"
                              : offer.transferMethod === "NON_EXCLUSIVE_LICENSE"
                              ? "Li-xăng không độc quyền (Non-exclusive License)"
                              : offer.transferMethod === "ASSIGNMENT_SALE"
                              ? "Chuyển nhượng toàn bộ quyền sở hữu"
                              : "Thỏa thuận chuyển giao song phương"}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold text-slate-600">Chỉ tiêu kỹ thuật đạt được:</td>
                          <td className="py-2.5 text-emerald-800 font-semibold bg-emerald-50/60 p-2.5 rounded-lg">
                            {offer.problemSolved}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold text-slate-600">
                            {isCommercialProduct ? "Đơn vị sản xuất / Chế biến:" : "Đơn vị chủ trì nghiên cứu:"}
                          </td>
                          <td className="py-2.5 text-slate-900 font-medium">
                            {offer.developerOrigin || "Đang cập nhật"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* KHỐI ĐIỀU KIỆN THƯƠNG MẠI & PHẠM VI HỖ TRỢ */}
                  {(offer.deliveryTimeline || offer.warrantyTerms || offer.supplyScope || offer.paymentTerms || offer.installationSupport) && (
                    <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4 space-y-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-brand-600" />
                        {isCommercialProduct
                          ? "Điều Kiện Thương Mại & Chính Sách Giao Hàng"
                          : "Điều Kiện Thương Mại & Phạm Vi Hỗ Trợ Chuyển Giao"}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {offer.deliveryTimeline && (
                          <div className="bg-white p-3 rounded-lg border border-brand-100">
                            <span className="text-slate-400 font-bold block mb-0.5">Thời gian bàn giao / triển khai:</span>
                            <span className="text-slate-800 font-semibold">{offer.deliveryTimeline}</span>
                          </div>
                        )}
                        {offer.warrantyTerms && (
                          <div className="bg-white p-3 rounded-lg border border-brand-100">
                            <span className="text-slate-400 font-bold block mb-0.5">Bảo hành & bảo trì:</span>
                            <span className="text-slate-800 font-semibold">{offer.warrantyTerms}</span>
                          </div>
                        )}
                        {offer.paymentTerms && (
                          <div className="bg-white p-3 rounded-lg border border-brand-100">
                            <span className="text-slate-400 font-bold block mb-0.5">Phương thức thanh toán:</span>
                            <span className="text-slate-800 font-semibold">{offer.paymentTerms}</span>
                          </div>
                        )}
                        {offer.installationSupport && (
                          <div className="bg-white p-3 rounded-lg border border-brand-100">
                            <span className="text-slate-400 font-bold block mb-0.5">Hỗ trợ lắp đặt & chuyển giao:</span>
                            <span className="text-slate-800 font-semibold">
                              {typeof offer.installationSupport === "string"
                                ? offer.installationSupport
                                : "Có hỗ trợ chuyên gia lắp đặt & đào tạo trực tiếp"}
                            </span>
                          </div>
                        )}
                        {offer.supplyScope && (
                          <div className="bg-white p-3 rounded-lg border border-brand-100 sm:col-span-2">
                            <span className="text-slate-400 font-bold block mb-0.5">Phạm vi cung cấp:</span>
                            <span className="text-slate-800 font-medium">{offer.supplyScope}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "dataroom" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        Danh Mục Tài Liệu Thẩm Định (DataRoom)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tài liệu gắn liền với hồ sơ công nghệ {offer.offerCode}
                      </p>
                    </div>
                    <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Yêu cầu ký NDA
                    </span>
                  </div>

                  <div className="space-y-2">
                    {offer.documents && offer.documents.length > 0 ? (
                      offer.documents.map((doc, idx) => {
                        const typeBadge = getDocumentTypeBadge(doc.documentType);
                        return (
                          <div
                            key={doc.id || idx}
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-slate-500 shrink-0" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-bold text-slate-800">{doc.fileName}</p>
                                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${typeBadge.color}`}>
                                    {typeBadge.label}
                                  </span>
                                </div>
                                <span className="mono text-xs text-slate-400 font-semibold">{formatDocSize(doc.fileSizeBytes)}</span>
                              </div>
                            </div>

                            {doc.accessScope === "PUBLIC" ? (
                              <button
                                type="button"
                                onClick={() => handleDownloadDoc(doc.fileName)}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-white hover:bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg transition shadow-sm"
                              >
                                <Download className="w-3.5 h-3.5" /> Tải về
                              </button>
                            ) : doc.accessScope === "AFTER_CONNECTION" ? (
                              <button
                                type="button"
                                onClick={() => handleOpenConnectModal()}
                                className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition"
                              >
                                <Lock className="w-3 h-3 text-amber-600" /> Cần cấp quyền (Ký NDA)
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                                <Lock className="w-3 h-3" /> Bảo mật nội bộ
                              </span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 px-6 rounded-2xl bg-slate-50/60 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <FolderSearch className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-sm font-bold text-slate-700">
                            Chưa có tài liệu công khai trong DataRoom
                          </h5>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">
                            Chủ sở hữu công nghệ chưa tải lên tài liệu minh chứng công khai cho hồ sơ này. Quý khách có thể gửi yêu cầu kết nối để đề nghị cung cấp hồ sơ chuyên sâu.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenConnectModal()}
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5 text-brand-600" />
                          <span>
                            {isCommercialProduct
                              ? "Yêu cầu tài liệu qua Kết nối thương mại"
                              : "Yêu cầu tài liệu qua Kết nối chuyển giao"}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CỘT SIDEBAR HÀNH ĐỘNG (1 CỘT - STICKY) */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Card Giá & Kết nối */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isCommercialProduct ? "GIÁ BÁN NIÊM YẾT / THƯƠNG MẠI" : "MỨC GIÁ ĐỀ XUẤT CHUYỂN GIAO"}
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {offer.pricingType === "CONTACT" && "Thỏa Thuận Trực Tiếp"}
                {offer.pricingType === "FIXED" &&
                  offer.priceAmount &&
                  `${(offer.priceAmount / 1_000_000).toLocaleString("vi-VN")} Triệu VND ${
                    offer.unit ? "/" + offer.unit : ""
                  }`}
                {offer.pricingType === "RANGE" &&
                  offer.priceMin &&
                  offer.priceMax &&
                  `${(offer.priceMin / 1_000_000).toLocaleString("vi-VN")} - ${(
                    offer.priceMax / 1_000_000
                  ).toLocaleString("vi-VN")} Triệu VND`}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {isCommercialProduct
                  ? "Đơn giá tiêu chuẩn theo quy cách niêm yết (Chưa gồm VAT & vận chuyển)"
                  : "Đã bao gồm hướng dẫn chuyển giao kỹ thuật"}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleOpenConnectModal(isCommercialProduct ? "PURCHASE_COMMERCIAL" : "TRANSFER")}
                className="w-full bg-brand-700 hover:bg-brand-800 text-white py-3 rounded-xl text-xs font-extrabold transition shadow-md shadow-brand-900/15 flex items-center justify-center gap-2"
              >
                {isCommercialProduct ? (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Đặt Mua Hàng / Yêu Cầu Báo Giá Sỉ
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Gửi Yêu Cầu Chuyển Giao Công Nghệ
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveTab("dataroom")}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                {isCommercialProduct ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                )}
                {isCommercialProduct ? "Xem Hồ Sơ Chất Lượng & ATTP" : "Yêu Cầu Truy Cập DataRoom"}
              </button>
            </div>

            {/* KHỐI ĐƠN VỊ CUNG ỨNG / DOANH NGHIỆP CHÀO BÁN */}
            <div className="bg-gradient-to-br from-brand-50/60 to-brand-50/40 rounded-xl p-4 border border-brand-200/80 space-y-3">
              <div className="flex items-center justify-between border-b border-brand-200/60 pb-2">
                <span className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-brand-600" /> Đơn Vị Chào Bán
                </span>
                <span className="text-xs font-extrabold bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full border border-brand-300">
                  Đối tác xác thực
                </span>
              </div>

              <div>
                {offer.enterpriseTaxCode ? (
                  <Link
                    href={`/enterprises/${offer.enterpriseTaxCode}`}
                    className="group block"
                    title="Bấm để xem hồ sơ doanh nghiệp"
                  >
                    <p className="text-xs font-extrabold text-slate-900 group-hover:text-brand-600 group-hover:underline leading-snug line-clamp-2 flex items-center justify-between gap-1 transition">
                      <span>{offer.enterpriseName || offer.developerOrigin || "Đang cập nhật tên đơn vị"}</span>
                      <span className="text-brand-500 opacity-0 group-hover:opacity-100 transition text-sm">↗</span>
                    </p>
                  </Link>
                ) : (
                  <div className="block">
                    <p className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-2">
                      <span>{offer.enterpriseName || offer.developerOrigin || "Đang cập nhật tên đơn vị"}</span>
                    </p>
                  </div>
                )}
                {offer.enterpriseTaxCode ? (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span>Mã số thuế:</span>
                    <span className="mono font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {offer.enterpriseTaxCode}
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span>Mã số thuế:</span>
                    <span className="mono text-slate-500 italic bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      Đang cập nhật MST
                    </span>
                  </p>
                )}
                {offer.contactPointRole && (
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="text-slate-400">Đầu mối:</span> {offer.contactPointRole}
                  </p>
                )}
              </div>

              {offer.enterpriseTaxCode ? (
                <Link
                  href={`/enterprises/${offer.enterpriseTaxCode}`}
                  className="w-full bg-white hover:bg-brand-50 text-brand-700 border border-brand-300 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm hover:border-brand-400"
                >
                  <Building2 className="w-3.5 h-3.5 text-brand-600" />
                  <span>Xem Hồ Sơ Doanh Nghiệp →</span>
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full bg-slate-100 text-slate-400 border border-slate-200 py-2.5 rounded-xl text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1.5 shadow-none"
                  title="Chưa liên kết hồ sơ doanh nghiệp"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Chưa liên kết hồ sơ DN</span>
                </button>
              )}
            </div>

            {/* KHỐI ĐẦU MỐI KINH DOANH HOẶC TTO & BẢO VỆ DỮ LIỆU CÁ NHÂN (PDPD NĐ 13/2023) */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {isCommercialProduct ? "Đầu Mối Kinh Doanh & Phân Phối" : "Đầu Mối TTO Chuyển Giao"}
                </span>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> NĐ 13/2023 (PDPD)
                </span>
              </div>

              <div className="text-xs space-y-1.5 bg-white p-3 rounded-lg border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">
                    {isCommercialProduct ? "Đại diện bán hàng / CSKH:" : "Đại diện TTO:"}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {offer.contactPointRole || (isCommercialProduct ? "Bộ phận Kinh doanh / CSKH" : "Ban Chuyển giao KH&CN")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">
                    {isCommercialProduct ? "Hotline bán hàng:" : "Hotline TTO:"}
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {offer.enterpriseTaxCode ? "098***" + offer.enterpriseTaxCode.slice(-4) : "0912***678"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email tiếp nhận:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {isCommercialProduct ? "sales-co******@baclink.org.vn" : "tto-co******@baclink.org.vn"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 italic leading-tight">
                * Số điện thoại và email cá nhân được ẩn để bảo vệ quyền riêng tư theo NĐ 13/2023/NĐ-CP. Gửi yêu cầu kết nối để nhận thông tin liên hệ trực tiếp.
              </p>
            </div>

            {/* Thông tin hỗ trợ sàn & Đơn vị quản lý */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1 text-center">
              <p className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Đơn Vị Thẩm Định Kỹ Thuật
              </p>
              <p className="text-xs font-extrabold text-slate-900">
                {offer.managingAuthorityName && !/Sở KH/i.test(offer.managingAuthorityName)
                  ? offer.managingAuthorityName
                  : "Ban Thẩm định Kỹ thuật — Hiệp hội BACLINK"}
              </p>
              <p className="text-xs text-slate-500">Đã kiểm định văn bằng SHTT & mức TRL</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1 text-center">
              <p className="text-xs font-bold text-slate-700">Đầu Mối Hỗ Trợ Giao Dịch</p>
              <p className="text-xs font-extrabold text-emerald-800">Hotline Sàn: 0222 3888 686</p>
              <p className="text-xs text-slate-500">Hiệp hội BACLINK bảo chứng quy trình</p>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL GỬI KẾT NỐI */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {isCommercialProduct
                    ? "Gửi Yêu Cầu Đặt Mua / Kết Nối Thương Mại"
                    : "Tạo Nhanh Nhu Cầu & Kết Nối Chuyển Giao (Quick Demand)"}
                </h3>
                <p className="text-caption text-slate-500 font-medium mt-0.5">
                  {isCommercialProduct
                    ? "Gửi yêu cầu mua sỉ, phân phối hoặc báo giá trực tiếp tới Bên bán"
                    : "Đăng ký bài toán công nghệ trong 1 phút để liên kết trực tiếp với Bên bán"}
                </p>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {connectSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isCommercialProduct
                    ? "Đã Gửi Đơn Đặt Mua & Yêu Cầu Kết Nối Tới Bên Bán Thành Công!"
                    : "Đã Tạo Nhu Cầu & Gửi Đề Xuất Kết Nối Thành Công!"}
                </h4>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {createdDemandCode && (
                    <div className="mono text-xs font-bold text-emerald-800 bg-emerald-50 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-lg inline-block">
                      Mã đơn mua: <strong>{createdDemandCode}</strong>
                    </div>
                  )}
                  {createdRequestCode && (
                    <div className="mono text-xs font-bold text-cyan-800 bg-cyan-50 dark:bg-cyan-950/80 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 px-3 py-1.5 rounded-lg inline-block">
                      Mã tiếp nhận Bên Bán: <strong>{createdRequestCode}</strong>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                  {isCommercialProduct
                    ? `Đơn đặt mua sản phẩm của bạn đã được gửi trực tiếp đến gian hàng tiếp nhận của ${offer.enterpriseName || "Nhà Cung Ứng"}${createdRequestCode ? ` (Mã tiếp nhận: ${createdRequestCode})` : ""}. Bên bán sẽ tiếp nhận xử lý và phản hồi trong 24 - 48 giờ làm việc.`
                    : `Hồ sơ nhu cầu của bạn đã được gửi trực tiếp đến đơn vị ${offer.enterpriseName || "Nhà Cung Ứng"}${createdRequestCode ? ` (Mã tiếp nhận: ${createdRequestCode})` : ""}. Ban Thẩm định Kỹ thuật — Hiệp hội BACLINK và Bên bán sẽ tiếp nhận thẩm định và phản hồi trong 24 - 48 giờ làm việc.`
                  }
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <Link
                    href="/portal/buyer/demands?tab=commercial"
                    className="bg-brand-700 hover:bg-brand-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
                  >
                    Theo dõi đơn hàng trong Workspace &rarr;
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConnectModal(false);
                      setConnectSuccess(false);
                      setCreatedDemandCode(null);
                      setCreatedRequestCode(null);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl text-xs font-bold transition"
                  >
                    Hoàn tất & Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmittingDemand(true);
                  const isPublic = Boolean(
                    currentUser && (currentUser.role === 'PUBLIC_USER' || currentUser.role === 'GUEST')
                  );
                  const effectiveCompany =
                    demandCompany?.trim() ||
                    (isPublic ? currentUser?.fullName || 'Khách hàng cá nhân' : 'Doanh nghiệp');

                  const technicalProblem = demandProblem || (
                    isCommercialProduct
                      ? `[Đơn đặt mua] Sản phẩm: ${offer.title}`
                      : `Nhu cầu ứng dụng / chuyển giao: ${offer.title}`
                  );
                  const expectedGoal = isCommercialProduct
                    ? `Cung cấp và tiêu thụ sản phẩm tại cơ sở của ${effectiveCompany}`
                    : `Triển khai ứng dụng công nghệ tại cơ sở của ${effectiveCompany}`;
                  const desiredSolution = isCommercialProduct
                    ? `[Đề xuất thương mại: ${demandMethod}] Khách hàng ${effectiveCompany} đăng ký mua sản phẩm ${offer.offerCode} - ${offer.title}. Người liên hệ: ${demandContact} (${demandPhone}, ${demandEmail || 'N/A'}). Hình thức: ${demandMethod}. Ghi chú: ${demandNotes || 'Không có'}`
                    : `Đăng ký chuyển giao / nhận quyền khai thác công nghệ ${offer.offerCode} - ${offer.title}. Người liên hệ: ${demandContact} (${demandPhone}, ${demandEmail || 'N/A'}). Hình thức: ${demandMethod}. Ghi chú: ${demandNotes || 'Không có'}`;
                  const res = await submitQuickDemand({
                    stageName: isCommercialProduct ? 'Thương mại & Tiêu thụ' : 'Sản xuất & Chuyển giao',
                    technicalProblem: isCommercialProduct
                      ? `[Đơn hàng - ${effectiveCompany}] ${technicalProblem}`
                      : `[DN: ${effectiveCompany}] ${technicalProblem}`,
                    desiredSolution: desiredSolution,
                    needConsulting: true,
                    expectedGoal: expectedGoal,
                    applicationScale: effectiveCompany,
                    sectorCode: offer.sectorCode || 'IND_ELEC',
                    budgetRange: demandBudget,
                    urgencyScore: 4,
                    impactScore: 4,
                    investmentCapacity: 4,
                    adoptionReadiness: 4,
                    offerId: offer.id,
                    offerTitle: offer.title,
                    offerCode: offer.offerCode,
                    isCommercialOrder: isCommercialProduct,
                  });
                  setIsSubmittingDemand(false);
                  if (res.success) {
                    setCreatedDemandCode(res.itemCode || null);
                    setCreatedRequestCode(res.requestCode || null);
                    setConnectSuccess(true);
                    toast.success(
                      isCommercialProduct
                        ? 'Đã gửi đơn đặt mua sản phẩm tới Bên Bán thành công!'
                        : (res.message || 'Đã gửi yêu cầu đặt hàng & kết nối thành công!')
                    );
                  } else {
                    toast.error(res.message || 'Gửi kết nối không thành công, vui lòng thử lại.');
                  }
                }}
                className="space-y-3.5 text-xs max-h-[75vh] overflow-y-auto pr-1"
              >
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-2.5 text-caption text-brand-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Kết nối trực tiếp tới: <b>{offer.title}</b> ({offer.offerCode})</span>
                </div>

                {/* Banner tài khoản & Nút tự động điền */}
                {currentUser && (
                  <div className="flex items-center justify-between bg-brand-50/80 dark:bg-brand-950/40 p-2.5 rounded-xl border border-brand-200/80 dark:border-brand-800 text-xs text-brand-900 dark:text-cyan-300">
                    <div className="flex items-center gap-1.5 font-medium truncate mr-2">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-cyan-400 shrink-0" />
                      <span className="truncate">
                        Đang đăng nhập: <strong>{currentUser.fullName}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillUser}
                      className="text-xs font-bold text-brand-700 dark:text-cyan-400 hover:underline shrink-0"
                    >
                      Tự động điền
                    </button>
                  </div>
                )}

                {autoFilled && (
                  <div className="text-caption text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Đã tự động điền đơn vị, người liên hệ, email và SĐT từ tài khoản đăng nhập. Bạn có thể chỉnh sửa nếu cần.</span>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isCommercialProduct ? "Nhu cầu mua sắm / Đơn hàng mong muốn:" : "Tiêu đề bài toán / Yêu cầu công nghệ:"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={demandProblem}
                    onChange={(e) => handleProblemChange(e.target.value)}
                    placeholder={
                      isCommercialProduct
                        ? "VD: Cần đặt mua 100kg Chè Thịnh AN làm quà tặng doanh nghiệp hoặc đại lý bán lẻ"
                        : "VD: Cần chuyển giao dây chuyền sấy thăng hoa cho nhà máy chế biến nông sản"
                    }
                    className="form-control w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(() => {
                    const isPublicOrGuest = Boolean(
                      currentUser && (currentUser.role === 'PUBLIC_USER' || currentUser.role === 'GUEST')
                    );
                    return (
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          {isPublicOrGuest ? (
                            'Đơn vị công tác (Không bắt buộc với cá nhân):'
                          ) : (
                            <>
                              Doanh nghiệp / Tổ chức của bạn: <span className="text-red-500">*</span>
                            </>
                          )}
                        </label>
                        <input
                          type="text"
                          required={!isPublicOrGuest}
                          value={demandCompany}
                          onChange={(e) => setDemandCompany(e.target.value)}
                          placeholder={
                            isPublicOrGuest
                              ? 'VD: Cá nhân / Viện / Doanh nghiệp (nếu có)'
                              : 'VD: Công ty CP Nông Sản Sạch'
                          }
                          className="form-control w-full"
                        />
                      </div>
                    );
                  })()}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Người liên hệ: <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={demandContact}
                      onChange={(e) => setDemandContact(e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className="form-control w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Số điện thoại liên hệ: <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      value={demandPhone}
                      onChange={(e) => setDemandPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="form-control w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email công vụ:</label>
                    <input
                      type="email"
                      value={demandEmail}
                      onChange={(e) => setDemandEmail(e.target.value)}
                      placeholder="contact@doanhnghiep.vn"
                      className="form-control w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ngân sách dự kiến:</label>
                    <select
                      value={demandBudget}
                      onChange={(e) => setDemandBudget(e.target.value)}
                      className="form-control w-full font-medium"
                    >
                      <option value="UNDER_20M">Dưới 20 triệu VNĐ</option>
                      <option value="20M_100M">20 triệu - 100 triệu VNĐ</option>
                      <option value="100M_500M">100 triệu - 500 triệu VNĐ</option>
                      <option value="500M_1B">500 triệu - 1 tỷ VNĐ</option>
                      <option value="1B_3B">1 tỷ - 3 tỷ VNĐ</option>
                      <option value="OVER_3B">Trên 3 tỷ VNĐ</option>
                      <option value="CONTACT">Thỏa thuận trực tiếp</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tiến độ triển khai mong muốn:</label>
                    <select
                      value={demandTimeline}
                      onChange={(e) => setDemandTimeline(e.target.value)}
                      className="form-control w-full font-medium"
                    >
                      <option value="IMMEDIATE">Triển khai ngay (dưới 1 tháng)</option>
                      <option value="1_3M">Trong vòng 1 - 3 tháng</option>
                      <option value="3_6M">Trong vòng 3 - 6 tháng</option>
                      <option value="RESEARCH">Đánh giá kỹ thuật tiền khả thi</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hình thức hợp tác mong muốn:</label>
                  <select
                    value={demandMethod}
                    onChange={(e) => setDemandMethod(e.target.value)}
                    className="form-control w-full font-medium"
                  >
                    {isCommercialProduct ? (
                      <>
                        <option value="PURCHASE_COMMERCIAL">Đặt mua sản phẩm theo đơn hàng (Mua buôn / Mua lẻ)</option>
                        <option value="SUPPLY_CONTRACT">Ký hợp đồng cung ứng định kỳ theo tháng/quý</option>
                        <option value="DISTRIBUTION_AGENT">Đăng ký làm đại lý phân phối / Đại diện bán hàng</option>
                        <option value="SAMPLE_ORDER">Đặt mua mẫu kiểm tra chất lượng</option>
                      </>
                    ) : (
                      <>
                        <option value="TRANSFER">Chuyển giao trọn gói (Mua đứt quyền sở hữu công nghệ)</option>
                        <option value="LICENSE">Thuê / Mua bản quyền khai thác có thời hạn (Licensing)</option>
                        <option value="DEVICE">Mua thiết bị máy móc hoàn chỉnh</option>
                        <option value="JOINT_RD">Hợp tác R&D điều chỉnh theo đặc thù nhà máy</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isCommercialProduct ? "Chi tiết đơn hàng & Yêu cầu quy cách riêng:" : "Chi tiết bài toán & Yêu cầu kỹ thuật riêng:"}
                  </label>
                  <textarea
                    rows={3}
                    value={demandNotes}
                    onChange={(e) => setDemandNotes(e.target.value)}
                    placeholder={
                      isCommercialProduct
                        ? "Mô tả số lượng dự kiến, quy cách đóng gói, địa điểm giao hàng..."
                        : "Mô tả công suất mong muốn, điều kiện nhà xưởng hiện có, quy chuẩn sản phẩm đầu ra..."
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  ></textarea>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    className="h-11 px-5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition text-sm"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingDemand}
                    className="h-11 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white px-6 rounded-xl font-bold shadow-sm transition flex items-center gap-1.5 text-sm"
                  >
                    {isSubmittingDemand ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{isCommercialProduct ? "Gửi Đề Xuất Đặt Mua & Kết Nối" : "Tạo Nhu Cầu & Gửi Yêu Cầu Kết Nối"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
