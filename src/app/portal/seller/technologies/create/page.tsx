"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Sparkles,
  Settings2,
  Package,
  Cpu,
  ShieldCheck,
  Check,
  AlertCircle,
  FileText,
  Clock,
  RotateCcw,
  Wand2,
  X,
  UploadCloud,
  FileUp,
  Mic,
  Image as ImageIcon,
} from "lucide-react";
import {
  createSellerOffer,
  PROVINCIAL_AUTHORITIES_CATALOG,
  resolveDefaultAuthority,
} from "@/services/api/technology-offer";
import { fetchMyEnterpriseProfile } from "@/lib/enterprise-client";
import { getStoredSession } from "@/lib/auth-client";
import {
  OfferType,
  IntellectualPropertyStatus,
  TransferMethod,
  CommercializationStatus,
  PricingType,
  OfferSpecValue,
  OfferDocument,
  TechTransferDraftData,
  TT17_SECTORS,
  LEGACY_SECTOR_MAP,
  CreateSellerOfferPayload,
} from "@/types/technology-offer";
import { FormStepper } from "@/components/seller/FormStepper";
import { Step1CoreFields } from "@/components/seller/Step1CoreFields";
import { SellerIdentityCard } from "@/components/seller/SellerIdentityCard";
import { InlinePricingCard } from "@/components/seller/InlinePricingCard";
import { ReactiveYellowTrlPanel } from "@/components/seller/ReactiveYellowTrlPanel";
import { FastTrackSubmitModal } from "@/components/seller/FastTrackSubmitModal";
import { Tier2CommonTechnicalForm } from "@/components/seller/Tier2CommonTechnicalForm";
import { Tier3SectorDynamicForm } from "@/components/seller/Tier3SectorDynamicForm";
import { DynamicSpecKeyValueTable } from "@/components/seller/DynamicSpecKeyValueTable";
import { Tier4CommercialForm } from "@/components/seller/Tier4CommercialForm";
import { IpQuadDigitizationCard } from "@/components/seller/IpQuadDigitizationCard";
import { DataRoomFileManager } from "@/components/seller/DataRoomFileManager";
import { MediaUploadSection } from "@/components/seller/MediaUploadSection";

const LOCAL_STORAGE_DRAFT_KEY = "nacentech_seller_offer_draft_v7";

export default function TaoHoSoChaoBanPage() {
  const router = useRouter();

  // Wizard Step State (1..4)
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Form Fields - Step 1
  const [offerType, setOfferType] = useState<OfferType>("DEVICE");
  const [hasTechTransfer, setHasTechTransfer] = useState(true);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [problemSolved, setProblemSolved] = useState("");
  const [sectorCode, setSectorCode] = useState("LV01");

  // Pricing (Inline Step 1)
  const [pricingType, setPricingType] = useState<PricingType>("CONTACT");
  const [priceAmount, setPriceAmount] = useState<number | undefined>(undefined);
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState("VND");
  const [unit, setUnit] = useState("");

  // Media Showcase (Ảnh đại diện, Thư viện ảnh & Video Demo)
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);
  const [videoDemoUrl, setVideoDemoUrl] = useState<string>("");

  // TRL & IP Quad (Reactive Step 1 & Step 4)
  const [trlLevel, setTrlLevel] = useState<number>(7);
  const [developerOrigin, setDeveloperOrigin] = useState("");
  const [ipStatus, setIpStatus] = useState<IntellectualPropertyStatus>("PATENT_GRANTED");
  const [ipRegistrationNumber, setIpRegistrationNumber] = useState("");
  const [ipIssueDate, setIpIssueDate] = useState("");
  const [transferMethod, setTransferMethod] = useState<TransferMethod>("NON_EXCLUSIVE_LICENSE");
  const [commercialStatus, setCommercialStatus] = useState<CommercializationStatus>("PILOT_TESTING");

  // Step 2: Lớp 2 (Kỹ thuật chung)
  const [modelCode, setModelCode] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [originCountry, setOriginCountry] = useState("");
  const [equipmentStatus, setEquipmentStatus] = useState("NEW");
  const [manufacturingYear, setManufacturingYear] = useState<number | undefined>(undefined);
  const [capacityScale, setCapacityScale] = useState("");
  const [energyConsumption, setEnergyConsumption] = useState("");
  const [automationLevel, setAutomationLevel] = useState("FULLY_AUTOMATIC");
  const [operatingPrinciple, setOperatingPrinciple] = useState("");
  const [deploymentConditions, setDeploymentConditions] = useState("");

  // Step 2: Lớp 3 (Thông số kỹ thuật động & Tự do)
  const [specValues, setSpecValues] = useState<OfferSpecValue[]>([]);

  // Step 3: Lớp 4 (Thương mại chi tiết)
  const [transferPriorityMethod, setTransferPriorityMethod] = useState("PURCHASE_ORDER");
  const [priceIncludes, setPriceIncludes] = useState("");
  const [taxAndExtraCosts, setTaxAndExtraCosts] = useState("");
  const [supplyScope, setSupplyScope] = useState("");
  const [deliveryTimeline, setDeliveryTimeline] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [warrantyTerms, setWarrantyTerms] = useState("");
  const [technicalSupportMethod, setTechnicalSupportMethod] = useState("");
  const [installationSupport, setInstallationSupport] = useState(false);

  // Step 4: SHTT, DataRoom & Pháp lý
  const [documents, setDocuments] = useState<OfferDocument[]>([]);
  const [managingAuthorityId, setManagingAuthorityId] = useState("BACLINK");
  const [managingAuthorityName, setManagingAuthorityName] = useState("Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)");
  const [isAutoDetectedAuthority, setIsAutoDetectedAuthority] = useState(false);
  const [legalCommitmentConfirmed, setLegalCommitmentConfirmed] = useState(false);

  // Doanh nghiệp liên kết (TASK-02)
  const [enterpriseName, setEnterpriseName] = useState("");
  const [enterpriseTaxCode, setEnterpriseTaxCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusFeedback, setStatusFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isFastTrackModalOpen, setIsFastTrackModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  // Đếm tiến trình Bước 1: 6 trường lõi
  const getFilledStep1Count = () => {
    let count = 0;
    if (offerType) count++;
    if (title.trim().length >= 3) count++;
    if (summary.trim().length > 0) count++;
    if (problemSolved.trim().length > 0) count++;
    if (sectorCode) count++;
    if (pricingType === "CONTACT" || (pricingType === "FIXED" && (priceAmount ?? 0) > 0) || (pricingType === "RANGE" && (priceMin ?? 0) > 0)) count++;
    return count;
  };
  const filledCount = getFilledStep1Count();

  // Khôi phục bản nháp từ localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.title) {
          setTitle(parsed.title || "");
          setSummary(parsed.summary || "");
          setProblemSolved(parsed.problemSolved || "");
          if (parsed.offerType) setOfferType(parsed.offerType);
          if (parsed.sectorCode) setSectorCode(parsed.sectorCode);
          if (typeof parsed.hasTechTransfer === "boolean") setHasTechTransfer(parsed.hasTechTransfer);
          if (parsed.pricingType) setPricingType(parsed.pricingType);
          if (parsed.priceAmount) setPriceAmount(parsed.priceAmount);
          if (parsed.priceMin) setPriceMin(parsed.priceMin);
          if (parsed.priceMax) setPriceMax(parsed.priceMax);
          if (parsed.unit) setUnit(parsed.unit);
          if (parsed.trlLevel) setTrlLevel(parsed.trlLevel);
          if (parsed.mainImageUrl) setMainImageUrl(parsed.mainImageUrl);
          if (parsed.galleryImageUrls) setGalleryImageUrls(parsed.galleryImageUrls);
          if (parsed.videoDemoUrl) setVideoDemoUrl(parsed.videoDemoUrl);
        }
      }
    } catch (e) {
      console.warn("Could not parse draft:", e);
    }
  }, []);

  // Nạp thông tin Doanh nghiệp liên kết (TASK-02 SSOT) & Tự động nhận diện Sở KH&CN tiếp nhận (BR-DELTA-04-01)
  useEffect(() => {
    let isMounted = true;
    const session = getStoredSession();
    const user = session?.user;

    fetchMyEnterpriseProfile()
      .then((profile) => {
        if (!isMounted || !profile) return;
        if (profile.name) setEnterpriseName(profile.name);
        if (profile.taxCode) setEnterpriseTaxCode(profile.taxCode);
        if (profile.contactPerson) setContactName(profile.contactPerson);
        if (profile.contactPhone) setContactPhone(profile.contactPhone);
        if (profile.contactEmail) setContactEmail(profile.contactEmail);

        // Tự động nhận diện Sở KH&CN tiếp nhận theo 3 cấp ưu tiên
        const resolved = resolveDefaultAuthority(user, profile);
        if (resolved) {
          setManagingAuthorityId(resolved.id);
          setManagingAuthorityName(resolved.name);
          setIsAutoDetectedAuthority(resolved.isAutoDetected);
        }
      })
      .catch((err) => {
        console.warn("Could not load enterprise profile for seller create:", err);
        // Fallback nhận diện theo user session nếu không load được profile
        if (user) {
          const resolved = resolveDefaultAuthority(user, null);
          if (resolved) {
            setManagingAuthorityId(resolved.id);
            setManagingAuthorityName(resolved.name);
            setIsAutoDetectedAuthority(resolved.isAutoDetected);
          }
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Tự động lưu nháp 30s (loại bỏ Base64 nặng để tránh lag serialization UI)
  useEffect(() => {
    const timer = setInterval(() => {
      if (title.trim()) {
        const sanitizeUrl = (u?: string | null) => (u && u.startsWith("data:") ? undefined : (u || undefined));
        const draftObj = {
          title,
          summary,
          problemSolved,
          offerType,
          sectorCode,
          hasTechTransfer,
          pricingType,
          priceAmount,
          priceMin,
          priceMax,
          unit,
          trlLevel,
          mainImageUrl: sanitizeUrl(mainImageUrl),
          galleryImageUrls: galleryImageUrls.filter((u) => !u.startsWith("data:")),
          videoDemoUrl,
          savedAt: new Date().toLocaleTimeString("vi-VN"),
        };
        try {
          localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, JSON.stringify(draftObj));
          setDraftSavedAt(draftObj.savedAt);
        } catch (e) {
          console.warn("Failed to auto-save draft", e);
        }
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [title, summary, problemSolved, offerType, sectorCode, hasTechTransfer, pricingType, priceAmount, priceMin, priceMax, unit, trlLevel, videoDemoUrl]);

  // Kiểm tra tính hợp lệ Bước 1
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) errs.title = "Tên sản phẩm/công nghệ tối thiểu 3 ký tự.";
    if (!summary.trim()) errs.summary = "Mô tả ngắn không được để trống.";
    if (!problemSolved.trim()) errs.problemSolved = "Công dụng / bài toán giải quyết không được để trống.";
    if (!sectorCode) errs.sectorCode = "Vui lòng chọn ngành công nghiệp.";
    if (pricingType === "FIXED" && (!priceAmount || priceAmount <= 0)) errs.priceAmount = "Giá cụ thể phải lớn hơn 0.";
    if (pricingType === "RANGE") {
      if (!priceMin || priceMin <= 0) errs.priceMin = "Giá tối thiểu phải lớn hơn 0.";
      if (priceMax && priceMin && priceMax < priceMin) errs.priceMax = "Giá đến phải lớn hơn hoặc bằng giá từ.";
    }
    if (hasTechTransfer && (!trlLevel || trlLevel < 1 || trlLevel > 9)) {
      errs.trlLevel = "Khi có chuyển giao công nghệ, bắt buộc chọn mức TRL từ 1 đến 9.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      if (!completedSteps.includes(1)) setCompletedSteps((prev) => [...prev, 1]);
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep < 4) {
      if (!completedSteps.includes(currentStep)) setCompletedSteps((prev) => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Lưu nháp thủ công
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setStatusFeedback(null);
    try {
      const cleanSpecValues = specValues
        .filter((s) => s.specName.trim() && s.specValue.trim())
        .map((s) => ({
          ...s,
          specName: s.specName.trim(),
          specValue: s.specValue.trim(),
          unit: s.unit?.trim() || null,
        }));

      const payload: CreateSellerOfferPayload = {
        action: "SAVE_DRAFT",
        currentStep,
        offerType,
        hasTechTransfer,
        title: title.trim() || "Bản nháp hồ sơ chưa đặt tên",
        summary,
        problemSolved,
        sectorCode,
        pricingType,
        priceAmount,
        priceMin,
        priceMax,
        currency,
        unit,
        trlLevel,
        mainImageUrl,
        galleryImageUrls,
        videoDemoUrl,
        specValues: cleanSpecValues,
        documents,
      };
      await createSellerOffer(payload);
      setStatusFeedback({ type: "success", message: "Đã lưu nháp hồ sơ thành công vào kho của bạn." });
    } catch (err: any) {
      setStatusFeedback({ type: "error", message: err.message || "Lỗi lưu nháp hồ sơ." });
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Mở modal Fast-Track: Bắt buộc kiểm tra tính hợp lệ của Bước 1 trước khi mở
  const handleOpenFastTrackModal = () => {
    if (!validateStep1()) {
      setStatusFeedback({
        type: "error",
        message: "Vui lòng hoàn thiện các trường bắt buộc ở Bước 1 trước khi gửi hồ sơ Fast-Track.",
      });
      if (currentStep !== 1) {
        setCurrentStep(1);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStatusFeedback(null);
    setIsFastTrackModalOpen(true);
  };

  // Nộp hồ sơ chờ duyệt (Fast-Track từ Bước 1 hoặc Hoàn tất 4 bước)
  const handleSubmitReview = async () => {
    if (!validateStep1()) {
      setStatusFeedback({ type: "error", message: "Vui lòng hoàn thiện các trường bắt buộc ở Bước 1." });
      return;
    }

    setIsSubmitting(true);
    setStatusFeedback(null);
    try {
      // Lọc bỏ các dòng thông số kỹ thuật rỗng trước khi gửi API (BR-SELLER-11)
      const cleanSpecValues = specValues
        .filter((s) => s.specName.trim() && s.specValue.trim())
        .map((s) => ({
          ...s,
          specName: s.specName.trim(),
          specValue: s.specValue.trim(),
          unit: s.unit?.trim() || null,
        }));

      const payload: CreateSellerOfferPayload = {
        action: "SUBMIT_FOR_REVIEW",
        currentStep,
        offerType,
        hasTechTransfer,
        title: title.trim(),
        summary,
        problemSolved,
        sectorCode,
        pricingType,
        priceAmount,
        priceMin,
        priceMax,
        currency,
        unit,
        mainImageUrl,
        galleryImageUrls,
        videoDemoUrl,
        developerOrigin,
        trlLevel: hasTechTransfer ? trlLevel : undefined,
        ipStatus,
        ipRegistrationNumber,
        transferMethod,
        commercialStatus,
        managingAuthorityId,
        managingAuthorityName,
        legalConsent: true,
        legalCommitmentConfirmed: true,
        modelCode,
        manufacturer,
        originCountry,
        equipmentStatus,
        manufacturingYear,
        capacityScale,
        energyConsumption,
        automationLevel,
        operatingPrinciple,
        deploymentConditions,
        transferPriorityMethod,
        priceIncludes,
        taxAndExtraCosts,
        technicalSupportMethod,
        supplyScope,
        deliveryTimeline,
        paymentTerms,
        warrantyTerms,
        installationSupport,
        specValues: cleanSpecValues,
        documents,
        enterpriseTaxCode,
        enterpriseName,
        contactName,
        contactPhone,
        contactEmail,
      };

      const res = await createSellerOffer(payload);
      if (!res.success) {
        throw new Error(res.message || "Lỗi nộp hồ sơ.");
      }

      setIsFastTrackModalOpen(false);
      localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
      router.push("/portal/seller/technologies?status=pending&success=1");
    } catch (err: any) {
      setStatusFeedback({ type: "error", message: err.message || "Lỗi nộp hồ sơ." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trợ lý AI nạp dữ liệu mẫu
  const handleApplyAiData = () => {
    setTitle("Hệ thống robot hàn laser sợi quang 6 bậc tự do tích hợp thị giác máy");
    setSummary("Công nghệ hàn laser fiber thông minh với thuật toán AI bù sai số quỹ đạo hàn thời gian thực dưới 0.05mm.");
    setProblemSolved("Giải quyết triệt để vấn đề biến dạng nhiệt trong chế tạo vỏ xe điện và bồn áp lực công nghiệp.");
    setOfferType("DEVICE");
    setSectorCode("LV07");
    setHasTechTransfer(true);
    setTrlLevel(7);
    setDeveloperOrigin("The Industrial Technology Research Institute (ITRI)");
    setIpStatus("PATENT_GRANTED");
    setIpRegistrationNumber("VN 1-0028491");
    setPricingType("RANGE");
    setPriceMin(1500000000);
    setPriceMax(2200000000);
    setUnit("hệ thống");
    setIsAiModalOpen(false);
    setStatusFeedback({ type: "success", message: "Đã áp dụng thành công dữ liệu bóc tách AI vào Form!" });
  };

  const currentSectorObj = TT17_SECTORS.find((s) => s.code === sectorCode) || TT17_SECTORS[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-3 sm:px-5">
          <div className="flex items-center gap-3">
            <Link
              href="/portal/seller/technologies"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              title="Quay lại danh sách"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="font-extrabold tracking-tight text-slate-900 text-sm">
                BACLINK · CỔNG KẾT NỐI CHUỖI CUNG ỨNG BẮC NINH
              </div>
              <div className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Phân Hệ Seller Hồ Sơ Chào Bán · TASK-04 Delta v6
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              {isSavingDraft ? "Đang lưu..." : "Lưu nháp"}
            </button>

            {/* QUY TẮC ĐỘT PHÁ UX: Nút Gửi chờ duyệt trên Topbar luôn khả dụng khi Bước 1 hợp lệ */}
            <button
              type="button"
              onClick={handleOpenFastTrackModal}
              className="rounded-lg bg-brand-700 hover:bg-brand-800 text-white px-3.5 py-2 text-xs font-extrabold shadow-sm transition flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              Gửi chờ duyệt
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-3 py-4 sm:px-5 space-y-4">
        {/* Title & Description */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <nav className="mb-1 text-xs text-slate-500">
              Trang chủ / Hồ sơ của tôi /{" "}
              <span className="font-semibold text-slate-700">Tạo hồ sơ chào bán</span>
            </nav>
            <h1 className="type-page-title text-slate-900">
              Tạo hồ sơ chào bán
            </h1>
            <p className="mt-0.5 text-xs text-slate-600">
              Biểu Mẫu Chào Bán & Chuyển Giao SHTT — Đăng sản phẩm, thiết bị hoặc giải pháp công nghệ để kết nối nhu cầu phù hợp.
            </p>
          </div>

          {draftSavedAt && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-lg">
              <Clock className="h-3 w-3 text-slate-400" />
              Tự động lưu nháp lúc {draftSavedAt}
            </div>
          )}
        </div>

        {/* Feedback alert */}
        {statusFeedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold border flex items-center justify-between ${
              statusFeedback.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-rose-50 border-rose-300 text-rose-800"
            }`}
          >
            <span>{statusFeedback.message}</span>
            <button type="button" onClick={() => setStatusFeedback(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main Grid: Sidebar vs Content */}
        <div className="grid grid-cols-1 gap-4 lg:gap-5 lg:grid-cols-[296px_minmax(0,1fr)]">
          {/* Left Column: Side Nav & AI Assistant */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <FormStepper
              currentStep={currentStep}
              onStepSelect={(step) => {
                setCurrentStep(step);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              completedSteps={completedSteps}
              filledStep1Count={filledCount}
            />

            {/* Card Trợ Lý AI Nhập Liệu (PO-DEC-07) */}
            <div className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-brand-50 p-3.5 shadow-sm">
              <div className="flex items-center justify-between gap-2 text-sm font-extrabold text-cyan-950">
                <span className="flex items-center gap-1.5 truncate">
                  <Sparkles className="h-4 w-4 shrink-0 text-cyan-600" />
                  <span className="truncate">Trợ Lý AI Nhập Liệu</span>
                </span>
                <span className="shrink-0 whitespace-nowrap rounded bg-cyan-200/80 text-cyan-900 text-xs px-1.5 py-0.5 font-bold">
                  PO-DEC-07
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-cyan-800">
                Tải catalogue, tài liệu thuyết minh hoặc ghi âm giọng nói để AI tự động trích xuất thông số, TRL và bảo hộ SHTT.
              </p>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="mt-3 w-full rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-2 px-3 shadow transition flex items-center justify-center gap-1.5"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Kích hoạt Trợ lý AI (OCR/Voice) &rarr;
              </button>
            </div>
          </aside>

          {/* Right Column: Active Form Step */}
          <section className="min-w-0 space-y-6">
            {currentStep === 1 && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5 space-y-5">
                {/* Doanh nghiệp liên kết (TASK-02) & Chọn Sở KH&CN tiếp nhận (Delta v9) */}
                <SellerIdentityCard
                  enterpriseName={enterpriseName}
                  enterpriseTaxCode={enterpriseTaxCode}
                  contactName={contactName}
                  contactPhone={contactPhone}
                  contactEmail={contactEmail}
                  managingAuthorityId={managingAuthorityId}
                  managingAuthorityName={managingAuthorityName}
                  onAuthorityChange={(id, name) => {
                    setManagingAuthorityId(id);
                    setManagingAuthorityName(name);
                    setIsAutoDetectedAuthority(false);
                  }}
                  isAutoDetected={isAutoDetectedAuthority}
                />

                {/* 6 trường lõi Bước 1 */}
                <Step1CoreFields
                  offerType={offerType}
                  setOfferType={setOfferType}
                  sectorCode={sectorCode}
                  setSectorCode={setSectorCode}
                  hasTechTransfer={hasTechTransfer}
                  setHasTechTransfer={setHasTechTransfer}
                  title={title}
                  setTitle={setTitle}
                  summary={summary}
                  setSummary={setSummary}
                  problemSolved={problemSolved}
                  setProblemSolved={setProblemSolved}
                  errors={errors}
                  filledCount={filledCount}
                />

                {/* Cụm giá nhúng tại Bước 1 */}
                <InlinePricingCard
                  pricingType={pricingType}
                  setPricingType={setPricingType}
                  priceAmount={priceAmount}
                  setPriceAmount={setPriceAmount}
                  priceMin={priceMin}
                  setPriceMin={setPriceMin}
                  priceMax={priceMax}
                  setPriceMax={setPriceMax}
                  currency={currency}
                  setCurrency={setCurrency}
                  unit={unit}
                  setUnit={setUnit}
                  errors={errors}
                />

                {/* Khối Hình ảnh & Video trình diễn (Media Showcase) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">
                          Hình Ảnh & Video Trình Diễn (Media Showcase)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Tải ảnh đại diện, thư viện ảnh chi tiết (tối đa 6 ảnh) và liên kết video demo vận hành thực tế
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                      Media Showcase
                    </span>
                  </div>

                  <MediaUploadSection
                    mainImageUrl={mainImageUrl}
                    galleryImageUrls={galleryImageUrls}
                    videoDemoUrl={videoDemoUrl}
                    onMainImageChange={setMainImageUrl}
                    onGalleryImagesChange={setGalleryImageUrls}
                    onVideoDemoChange={(url) => setVideoDemoUrl(url || "")}
                  />
                </div>

                {/* Khung TRL màu vàng reactive */}
                <ReactiveYellowTrlPanel
                  hasTechTransfer={hasTechTransfer}
                  trlLevel={trlLevel}
                  setTrlLevel={setTrlLevel}
                  developerOrigin={developerOrigin}
                  setDeveloperOrigin={setDeveloperOrigin}
                  ipStatus={ipStatus}
                  setIpStatus={setIpStatus}
                  ipRegistrationNumber={ipRegistrationNumber}
                  setIpRegistrationNumber={setIpRegistrationNumber}
                  transferMethod={transferMethod}
                  setTransferMethod={setTransferMethod}
                  commercialStatus={commercialStatus}
                  setCommercialStatus={setCommercialStatus}
                  errors={errors}
                />

                {/* Action Footer Bước 1 */}
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Chỉ cần hoàn thành Bước 1, bạn có thể nộp ngay hồ sơ chờ thẩm định.</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={isSavingDraft}
                      className="w-full sm:w-auto rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition text-center"
                    >
                      Lưu nháp
                    </button>

                    <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleOpenFastTrackModal}
                        className="w-full sm:w-auto rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Gửi chờ duyệt ngay (Fast-Track)
                      </button>

                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full sm:w-auto rounded-lg bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        Tiếp tục: Thông số ngành &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Bước 2: Thông số kỹ thuật & 10 Lĩnh Vực TT17
                    </h2>
                    <p className="text-xs text-slate-500">
                      Lớp 2 (Kỹ thuật chung) & Lớp 3 (Đặc thù ngành) theo ma trận 1.479 quy tắc Excel Master.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    Bước 2 / 4 (Tùy chọn)
                  </span>
                </div>

                <Tier2CommonTechnicalForm
                  offerType={offerType}
                  modelCode={modelCode}
                  setModelCode={setModelCode}
                  manufacturer={manufacturer}
                  setManufacturer={setManufacturer}
                  originCountry={originCountry}
                  setOriginCountry={setOriginCountry}
                  equipmentStatus={equipmentStatus}
                  setEquipmentStatus={setEquipmentStatus}
                  manufacturingYear={manufacturingYear}
                  setManufacturingYear={setManufacturingYear}
                  capacityScale={capacityScale}
                  setCapacityScale={setCapacityScale}
                  energyConsumption={energyConsumption}
                  setEnergyConsumption={setEnergyConsumption}
                  automationLevel={automationLevel}
                  setAutomationLevel={setAutomationLevel}
                  operatingPrinciple={operatingPrinciple}
                  setOperatingPrinciple={setOperatingPrinciple}
                  deploymentConditions={deploymentConditions}
                  setDeploymentConditions={setDeploymentConditions}
                />

                <Tier3SectorDynamicForm
                  sectorCode={sectorCode}
                  specValues={specValues}
                  setSpecValues={setSpecValues}
                />

                <DynamicSpecKeyValueTable
                  specValues={specValues}
                  setSpecValues={setSpecValues}
                />

                {/* Footer Step 2 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    &larr; Quay lại Bước 1
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleOpenFastTrackModal}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-extrabold shadow-sm"
                    >
                      Gửi chờ duyệt ngay
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="rounded-lg bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                    >
                      Tiếp tục: Giá & thương mại &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Bước 3: Điều Kiện Thương Mại Chi Tiết
                    </h2>
                    <p className="text-xs text-slate-500">
                      Lớp 4: Khai báo đầy đủ các điều kiện thương mại và chuyển giao theo 8 quy tắc Excel Master.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    Bước 3 / 4 (Tùy chọn)
                  </span>
                </div>

                <Tier4CommercialForm
                  transferPriorityMethod={transferPriorityMethod}
                  setTransferPriorityMethod={setTransferPriorityMethod}
                  priceIncludes={priceIncludes}
                  setPriceIncludes={setPriceIncludes}
                  taxAndExtraCosts={taxAndExtraCosts}
                  setTaxAndExtraCosts={setTaxAndExtraCosts}
                  supplyScope={supplyScope}
                  setSupplyScope={setSupplyScope}
                  deliveryTimeline={deliveryTimeline}
                  setDeliveryTimeline={setDeliveryTimeline}
                  paymentTerms={paymentTerms}
                  setPaymentTerms={setPaymentTerms}
                  warrantyTerms={warrantyTerms}
                  setWarrantyTerms={setWarrantyTerms}
                  technicalSupportMethod={technicalSupportMethod}
                  setTechnicalSupportMethod={setTechnicalSupportMethod}
                  installationSupport={installationSupport}
                  setInstallationSupport={setInstallationSupport}
                />

                {/* Footer Step 3 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    &larr; Quay lại Bước 2
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleOpenFastTrackModal}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-extrabold shadow-sm"
                    >
                      Gửi chờ duyệt ngay
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="rounded-lg bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                    >
                      Tiếp tục: Pháp lý & DataRoom &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Bước 4: Pháp Lý Sở Hữu Trí Tuệ & DataRoom
                    </h2>
                    <p className="text-xs text-slate-500">
                      Khai báo bộ tứ SHTT, phòng dữ liệu bảo mật 3 cấp và gửi Hiệp hội BACLINK thẩm định.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    Bước 4 / 4
                  </span>
                </div>

                <IpQuadDigitizationCard
                  ipStatus={ipStatus}
                  setIpStatus={setIpStatus}
                  ipRegistrationNumber={ipRegistrationNumber}
                  setIpRegistrationNumber={setIpRegistrationNumber}
                  ipIssueDate={ipIssueDate}
                  setIpIssueDate={setIpIssueDate}
                  managingAuthorityId={managingAuthorityId}
                  setManagingAuthorityId={setManagingAuthorityId}
                  managingAuthorityName={managingAuthorityName}
                  setManagingAuthorityName={setManagingAuthorityName}
                  legalCommitmentConfirmed={legalCommitmentConfirmed}
                  setLegalCommitmentConfirmed={setLegalCommitmentConfirmed}
                />

                <DataRoomFileManager
                  documents={documents}
                  setDocuments={setDocuments}
                />

                {/* Footer Step 4 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    &larr; Quay lại Bước 3
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Lưu nháp
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitReview}
                      disabled={isSubmitting}
                      className="rounded-lg bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white px-5 py-2 text-xs font-extrabold shadow flex items-center gap-1.5"
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? "Đang gửi hồ sơ..." : "Hoàn tất & Gửi chờ duyệt"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Fast-Track Modal */}
      <FastTrackSubmitModal
        isOpen={isFastTrackModalOpen}
        onClose={() => setIsFastTrackModalOpen(false)}
        onConfirm={handleSubmitReview}
        title={title || "Chưa đặt tên"}
        offerType={offerType === "DEVICE" ? "Thiết bị" : offerType === "PRODUCT" ? "Sản phẩm" : "Giải pháp công nghệ"}
        sectorName={currentSectorObj.name}
        pricingDisplay={
          pricingType === "CONTACT"
            ? "Liên hệ báo giá"
            : pricingType === "FIXED"
            ? `${priceAmount?.toLocaleString() || 0} ${currency} / ${unit}`
            : `${priceMin?.toLocaleString() || 0} - ${priceMax?.toLocaleString() || 0} ${currency} / ${unit}`
        }
        isSubmitting={isSubmitting}
        errorMessage={statusFeedback?.type === "error" ? statusFeedback.message : null}
        managingAuthorityId={managingAuthorityId}
        managingAuthorityName={managingAuthorityName}
        onAuthorityChange={(id, name) => {
          setManagingAuthorityId(id);
          setManagingAuthorityName(name);
          setIsAutoDetectedAuthority(false);
        }}
      />

      {/* AI Modal (PO-DEC-07) */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
            <div className="bg-gradient-to-r from-brand-900 via-brand-900 to-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-lg font-bold">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="type-card-title text-white">Trợ Lý AI Nhập Liệu & Bóc Tách Công Nghệ</h3>
                  <p className="text-xs text-brand-200">Chuẩn hóa theo Quyết định PO-DEC-20261008-07 · Human-in-the-Loop</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="border-2 border-dashed border-cyan-300 bg-cyan-50/30 rounded-xl p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Kéo thả Catalogue, Bản thuyết minh kỹ thuật hoặc Đơn đăng ký SHTT</p>
                  <p className="text-xs text-slate-500 mt-0.5">Hỗ trợ PDF, DOCX, JPG, PNG (Tối đa 25MB) hoặc ghi âm giọng nói thuyết minh</p>
                </div>
                <div className="flex justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleApplyAiData}
                    className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                  >
                    <FileUp className="w-4 h-4 text-cyan-600" /> Chọn Tệp PDF / Ảnh mẫu
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyAiData}
                    className="px-3.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                  >
                    <Mic className="w-4 h-4 text-rose-600" /> Ghi Âm Giọng Nói
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Bản xem trước dữ liệu trích xuất mẫu (Gemini Multimodal OCR):
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-xs font-extrabold">
                    Độ tin cậy 96%
                  </span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-700">
                  <p>&bull; <span className="font-bold text-slate-900">Tên công nghệ:</span> Hệ thống robot hàn laser sợi quang 6 bậc tự do tích hợp thị giác máy</p>
                  <p>&bull; <span className="font-bold text-slate-900">Ngành:</span> Cơ khí chế tạo & Tự động hóa (MECH)</p>
                  <p>&bull; <span className="font-bold text-slate-900">Mức hoàn thiện TRL:</span> TRL 7 (Nguyên mẫu trình diễn trong môi trường thực tế)</p>
                  <p>&bull; <span className="font-bold text-slate-900">Sở hữu trí tuệ:</span> Bằng Độc quyền Sáng chế số VN 1-0028491 (Cục SHTT)</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 border border-slate-300 bg-white text-xs font-bold rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleApplyAiData}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg shadow flex items-center gap-1.5 transition"
              >
                <Check className="w-4 h-4" /> Áp Dụng Dữ Liệu Vào Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
