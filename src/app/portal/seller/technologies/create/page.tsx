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
} from "lucide-react";
import {
  createSellerOffer,
  PROVINCIAL_AUTHORITIES_CATALOG,
} from "@/services/api/technology-offer";
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
  CreateSellerOfferPayload,
} from "@/types/technology-offer";
import { FormStepper } from "@/components/seller/FormStepper";
import { DynamicSpecTable } from "@/components/seller/DynamicSpecTable";
import { TrlSelectorGrid } from "@/components/seller/TrlSelectorGrid";
import { MediaUploadSection } from "@/components/seller/MediaUploadSection";
import { EvidenceDocumentSection } from "@/components/seller/EvidenceDocumentSection";
import { AiScanAssistantCard } from "@/components/seller/AiScanAssistantCard";

const LOCAL_STORAGE_DRAFT_KEY = "nacentech_seller_offer_draft_new";

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
  const [sectorCode, setSectorCode] = useState("MECH");

  // Form Fields - Step 2 (Dynamic Specs)
  const [specValues, setSpecValues] = useState<OfferSpecValue[]>([]);

  // Form Fields - Step 3 (Pricing & Commercial Terms)
  const [pricingType, setPricingType] = useState<PricingType>("RANGE");
  const [priceAmount, setPriceAmount] = useState<number | undefined>(undefined);
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState("VND");
  const [unit, setUnit] = useState("hệ thống");
  const [deliveryTimeline, setDeliveryTimeline] = useState("30 ngày kể từ ngày ký hợp đồng");
  const [warrantyTerms, setWarrantyTerms] = useState("24 tháng bảo hành chính hãng");
  const [supplyScope, setSupplyScope] = useState("Toàn quốc");
  const [paymentTerms, setPaymentTerms] = useState("Tạm ứng 30%, 50% khi giao hàng, 20% sau nghiệm thu");
  const [installationSupport, setInstallationSupport] = useState(true);

  // Form Fields - Step 4 (Evidence, TRL & Governance)
  const [developerOrigin, setDeveloperOrigin] = useState("");
  const [trlLevel, setTrlLevel] = useState<number>(7);
  const [ipStatus, setIpStatus] = useState<IntellectualPropertyStatus>("PATENT_GRANTED");
  const [ipRegistrationNumber, setIpRegistrationNumber] = useState("");
  const [transferMethod, setTransferMethod] = useState<TransferMethod>("NON_EXCLUSIVE_LICENSE");
  const [commercialStatus, setCommercialStatus] = useState<CommercializationStatus>("PILOT_TESTING");
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);
  const [videoDemoUrl, setVideoDemoUrl] = useState<string | null>(null);
  const [documents, setDocuments] = useState<OfferDocument[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactPointRole, setContactPointRole] = useState("Chuyên viên TTO");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [managingAuthorityId, setManagingAuthorityId] = useState("VN-HN");
  const [managingAuthorityName, setManagingAuthorityName] = useState("Sở Khoa học và Công nghệ TP. Hà Nội");
  const [legalConsent, setLegalConsent] = useState(true);

  // AI Field Highlights tracker
  const [aiHighlightedFields, setAiHighlightedFields] = useState<Set<string>>(new Set());

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusFeedback, setStatusFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  // 1. Kiểm tra khôi phục bản nháp từ localStorage khi mở trang
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.title) {
          setHasRestoredDraft(true);
        }
      }
    } catch (e) {
      console.warn("Không đọc được bản nháp từ localStorage:", e);
    }
  }, []);

  // 2. Auto-save vào localStorage mỗi 30 giây
  useEffect(() => {
    if (typeof window === "undefined") return;
    const interval = setInterval(() => {
      if (!title.trim()) return;
      try {
        const draftPayload = {
          offerType,
          hasTechTransfer,
          title,
          summary,
          problemSolved,
          sectorCode,
          specValues,
          pricingType,
          priceAmount,
          priceMin,
          priceMax,
          currency,
          unit,
          deliveryTimeline,
          warrantyTerms,
          supplyScope,
          paymentTerms,
          installationSupport,
          developerOrigin,
          trlLevel,
          ipStatus,
          ipRegistrationNumber,
          transferMethod,
          commercialStatus,
          mainImageUrl,
          galleryImageUrls,
          videoDemoUrl,
          contactName,
          contactPointRole,
          contactPhone,
          contactEmail,
          managingAuthorityId,
          managingAuthorityName,
          legalConsent,
          savedAt: new Date().toLocaleTimeString("vi-VN"),
        };
        localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, JSON.stringify(draftPayload));
        setDraftSavedAt(new Date().toLocaleTimeString("vi-VN"));
      } catch (e) {
        console.warn("Lỗi auto-save localStorage:", e);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [
    offerType,
    hasTechTransfer,
    title,
    summary,
    problemSolved,
    sectorCode,
    specValues,
    pricingType,
    priceAmount,
    priceMin,
    priceMax,
    currency,
    unit,
    deliveryTimeline,
    warrantyTerms,
    supplyScope,
    paymentTerms,
    installationSupport,
    developerOrigin,
    trlLevel,
    ipStatus,
    ipRegistrationNumber,
    transferMethod,
    commercialStatus,
    mainImageUrl,
    galleryImageUrls,
    videoDemoUrl,
    contactName,
    contactPointRole,
    contactPhone,
    contactEmail,
    managingAuthorityId,
    managingAuthorityName,
    legalConsent,
  ]);

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
      if (!saved) return;
      const d = JSON.parse(saved);
      if (d.offerType) setOfferType(d.offerType);
      if (d.hasTechTransfer !== undefined) setHasTechTransfer(d.hasTechTransfer);
      if (d.title) setTitle(d.title);
      if (d.summary) setSummary(d.summary);
      if (d.problemSolved) setProblemSolved(d.problemSolved);
      if (d.sectorCode) setSectorCode(d.sectorCode);
      if (d.specValues) setSpecValues(d.specValues);
      if (d.pricingType) setPricingType(d.pricingType);
      if (d.priceAmount !== undefined) setPriceAmount(d.priceAmount);
      if (d.priceMin !== undefined) setPriceMin(d.priceMin);
      if (d.priceMax !== undefined) setPriceMax(d.priceMax);
      if (d.currency) setCurrency(d.currency);
      if (d.unit) setUnit(d.unit);
      if (d.deliveryTimeline) setDeliveryTimeline(d.deliveryTimeline);
      if (d.warrantyTerms) setWarrantyTerms(d.warrantyTerms);
      if (d.supplyScope) setSupplyScope(d.supplyScope);
      if (d.paymentTerms) setPaymentTerms(d.paymentTerms);
      if (d.installationSupport !== undefined) setInstallationSupport(d.installationSupport);
      if (d.developerOrigin) setDeveloperOrigin(d.developerOrigin);
      if (d.trlLevel) setTrlLevel(d.trlLevel);
      if (d.ipStatus) setIpStatus(d.ipStatus);
      if (d.ipRegistrationNumber) setIpRegistrationNumber(d.ipRegistrationNumber);
      if (d.transferMethod) setTransferMethod(d.transferMethod);
      if (d.commercialStatus) setCommercialStatus(d.commercialStatus);
      if (d.mainImageUrl) setMainImageUrl(d.mainImageUrl);
      if (d.galleryImageUrls) setGalleryImageUrls(d.galleryImageUrls);
      if (d.videoDemoUrl) setVideoDemoUrl(d.videoDemoUrl);
      if (d.contactName) setContactName(d.contactName);
      if (d.contactPointRole) setContactPointRole(d.contactPointRole);
      if (d.contactPhone) setContactPhone(d.contactPhone);
      if (d.contactEmail) setContactEmail(d.contactEmail);
      if (d.managingAuthorityId) setManagingAuthorityId(d.managingAuthorityId);
      if (d.managingAuthorityName) setManagingAuthorityName(d.managingAuthorityName);
      if (d.legalConsent !== undefined) setLegalConsent(d.legalConsent);

      setHasRestoredDraft(false);
      setStatusFeedback({ type: "success", message: "Đã khôi phục dữ liệu bản nháp thành công!" });
    } catch (e) {
      console.error("Lỗi khôi phục:", e);
    }
  };

  const dismissDraftBanner = () => {
    setHasRestoredDraft(false);
  };

  // 3. Tự động nạp mẫu thông số khi đổi ngành nếu bảng specs đang rỗng
  useEffect(() => {
    if (specValues.length === 0) {
      const ind = TT17_SECTORS.find((s) => s.code.toUpperCase() === sectorCode.toUpperCase());
      if (ind && ind.defaultSpecs.length > 0) {
        setSpecValues(
          ind.defaultSpecs.map((ds, i) => ({
            specCode: `SPEC-${i + 1}`,
            specName: ds.specName,
            specValue: "",
            unit: ds.unit || "",
          }))
        );
      }
    }
  }, [sectorCode]);

  // 4. Áp dụng gợi ý từ AI Scan Extractor
  const handleApplyAiDraft = (draft: TechTransferDraftData) => {
    const highlights = new Set<string>();

    if (draft.title) {
      setTitle(draft.title);
      highlights.add("title");
    }
    if (draft.technicalSummary) {
      setSummary(draft.technicalSummary);
      highlights.add("summary");
    }
    if (draft.problemSolved) {
      setProblemSolved(draft.problemSolved);
      highlights.add("problemSolved");
    }
    if (draft.targetSectorCode) {
      setSectorCode(draft.targetSectorCode);
      highlights.add("sectorCode");
    }
    if (draft.originDeveloper) {
      setDeveloperOrigin(draft.originDeveloper);
      highlights.add("developerOrigin");
    }
    if (draft.ipQuad?.trlLevel) {
      setTrlLevel(draft.ipQuad.trlLevel);
      highlights.add("trlLevel");
    }
    if (draft.ipQuad?.ipStatus) {
      setIpStatus(draft.ipQuad.ipStatus);
      highlights.add("ipStatus");
    }
    if (draft.ipQuad?.patentNumber) {
      setIpRegistrationNumber(draft.ipQuad.patentNumber);
      highlights.add("ipRegistrationNumber");
    }
    if (draft.ipQuad?.transferMethod) {
      setTransferMethod(draft.ipQuad.transferMethod);
      highlights.add("transferMethod");
    }
    if (draft.suggestedSpecs && draft.suggestedSpecs.length > 0) {
      setSpecValues(draft.suggestedSpecs);
      highlights.add("specValues");
    }

    setAiHighlightedFields(highlights);
    setStatusFeedback({
      type: "success",
      message: "✨ Đã điền các trường gợi ý từ AI vào Form! Vui lòng kiểm tra lại trước khi gửi duyệt.",
    });
  };

  // Validate theo từng bước
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!title.trim() || title.trim().length < 3)
        newErrors.title = "Tên sản phẩm/công nghệ phải có tối thiểu 3 ký tự.";
      if (!summary.trim()) newErrors.summary = "Mô tả ngắn không được để trống.";
      if (!problemSolved.trim())
        newErrors.problemSolved = "Công dụng / bài toán giải quyết không được để trống.";
      if (!sectorCode) newErrors.sectorCode = "Vui lòng chọn ngành công nghiệp.";
    }

    if (step === 3) {
      if (pricingType === "FIXED" && (!priceAmount || priceAmount <= 0)) {
        newErrors.priceAmount = "Khi chọn giá cố định, số tiền phải lớn hơn 0.";
      }
      if (pricingType === "RANGE") {
        if (!priceMin || priceMin <= 0) newErrors.priceMin = "Giá từ phải lớn hơn 0.";
        if (!priceMax || (priceMin && priceMax < priceMin))
          newErrors.priceMax = "Giá đến phải lớn hơn hoặc bằng giá từ.";
      }
    }

    if (step === 4) {
      if (hasTechTransfer) {
        if (!developerOrigin.trim())
          newErrors.developerOrigin = "Bắt buộc khai báo đơn vị nghiên cứu phát triển.";
        if (!trlLevel || trlLevel < 1 || trlLevel > 9)
          newErrors.trlLevel = "Mức TRL phải từ 1 đến 9.";
      }
      if (!managingAuthorityId) {
        newErrors.managingAuthorityId = "Bắt buộc chọn Sở KH&CN tiếp nhận thẩm định.";
      }
      if (!legalConsent) {
        newErrors.legalConsent = "Doanh nghiệp bắt buộc cam kết trách nhiệm pháp lý.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepSelect = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayload = (action: "SAVE_DRAFT" | "SUBMIT_FOR_REVIEW"): CreateSellerOfferPayload => {
    return {
      offerType,
      hasTechTransfer,
      title: title.trim(),
      summary: summary.trim(),
      problemSolved: problemSolved.trim(),
      sectorCode,
      pricingType,
      priceAmount: pricingType === "FIXED" ? priceAmount : null,
      priceMin: pricingType === "RANGE" ? priceMin : null,
      priceMax: pricingType === "RANGE" ? priceMax : null,
      currency,
      unit,
      deliveryTimeline,
      warrantyTerms,
      supplyScope,
      paymentTerms,
      installationSupport,
      developerOrigin: hasTechTransfer ? developerOrigin : null,
      trlLevel: hasTechTransfer ? trlLevel : null,
      ipStatus: hasTechTransfer ? ipStatus : null,
      ipRegistrationNumber: hasTechTransfer ? ipRegistrationNumber : null,
      transferMethod: hasTechTransfer ? transferMethod : null,
      commercialStatus: hasTechTransfer ? commercialStatus : null,
      mainImageUrl,
      galleryImageUrls,
      videoDemoUrl,
      specValues,
      documents,
      contactName,
      contactPointRole,
      contactPhone,
      contactEmail,
      managingAuthorityId,
      managingAuthorityName,
      scopeType: "PROVINCE",
      scopeId: managingAuthorityId,
      legalConsent,
      action,
    };
  };

  // Nút "Lưu nháp" (DRAFT)
  const handleSaveDraft = async () => {
    if (!title.trim() || title.trim().length < 3) {
      setErrors({ title: "Vui lòng nhập ít nhất 3 ký tự tiêu đề để lưu nháp." });
      setCurrentStep(1);
      return;
    }

    setIsSavingDraft(true);
    setStatusFeedback(null);

    try {
      const payload = buildPayload("SAVE_DRAFT");
      const res = await createSellerOffer(payload);

      if (res.success) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
        }
        setStatusFeedback({
          type: "success",
          message: "Đã lưu nháp hồ sơ thành công vào kho của bạn (Trạng thái DRAFT).",
        });
        setTimeout(() => {
          router.push("/portal/seller/technologies");
        }, 1200);
      } else {
        setStatusFeedback({
          type: "error",
          message: res.message || "Lỗi khi lưu nháp hồ sơ.",
        });
      }
    } catch (e: any) {
      setStatusFeedback({
        type: "error",
        message: e.message || "Lỗi kết nối khi lưu nháp.",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Nút "Gửi thẩm định" (PENDING)
  const handleSubmitForReview = async () => {
    // Validate toàn bộ 4 bước
    let allValid = true;
    for (let s = 1; s <= 4; s++) {
      if (!validateStep(s)) {
        allValid = false;
        setCurrentStep(s);
        break;
      }
    }

    if (!allValid) {
      setStatusFeedback({
        type: "error",
        message: "Vui lòng hoàn thành đầy đủ các thông tin bắt buộc trước khi gửi thẩm định.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatusFeedback(null);

    try {
      const payload = buildPayload("SUBMIT_FOR_REVIEW");
      const res = await createSellerOffer(payload);

      if (res.success) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
        }
        setStatusFeedback({
          type: "success",
          message: "Đăng hồ sơ chào bán thành công! Hồ sơ đang chờ Sở KH&CN thẩm định.",
        });
        setTimeout(() => {
          router.push("/portal/seller/technologies");
        }, 1500);
      } else {
        setStatusFeedback({
          type: "error",
          message: res.message || "Đăng hồ sơ không thành công.",
        });
      }
    } catch (e: any) {
      setStatusFeedback({
        type: "error",
        message: e.message || "Lỗi kết nối máy chủ.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Banner khôi phục bản nháp */}
        {hasRestoredDraft && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="text-xs font-extrabold text-blue-900">
                  Phát hiện bản lưu nháp chưa nộp từ phiên trước
                </h4>
                <p className="text-[11px] text-blue-700">
                  Bạn có muốn khôi phục lại các nội dung đã soạn thảo gần nhất không?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={restoreDraft}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-blue-700"
              >
                Khôi phục bản nháp
              </button>
              <button
                type="button"
                onClick={dismissDraftBanner}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Bỏ qua
              </button>
            </div>
          </div>
        )}

        {/* Header bar */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <nav className="mb-1 text-xs text-slate-500">
              <Link href="/portal/seller/technologies" className="hover:text-blue-600">
                Kho công nghệ Seller
              </Link>{" "}
              / <span className="font-semibold text-slate-700">Tạo hồ sơ chào bán</span>
            </nav>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Tạo hồ sơ chào bán công nghệ
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              Biểu mẫu chào bán 4 bước chuyên sâu theo Tiêu chuẩn Cơ sở NacenTwin & 18 ngành SHTT.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {draftSavedAt && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Clock className="h-3.5 w-3.5" /> Đã tự động sao lưu lúc {draftSavedAt}
              </span>
            )}
            <button
              type="button"
              disabled={isSavingDraft || isSubmitting}
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Save className="h-4 w-4" />
              {isSavingDraft ? "Đang lưu nháp..." : "Lưu nháp"}
            </button>
            <button
              type="button"
              disabled={isSubmitting || isSavingDraft}
              onClick={handleSubmitForReview}
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Đang gửi..." : "Gửi thẩm định Sở"}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusFeedback && (
          <div
            className={`mb-5 flex items-center gap-2 rounded-xl border p-3 text-xs font-bold ${
              statusFeedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {statusFeedback.type === "success" ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            <span>{statusFeedback.message}</span>
          </div>
        )}

        {/* Bố cục 2 Cột chuẩn Wireframe: Cột trái 260px (Stepper + AI Card), Cột phải Form Wizard */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* CỘT TRÁI (260px): FormStepper + AiScanAssistantCard */}
          <aside className="space-y-4">
            <FormStepper
              currentStep={currentStep}
              onStepSelect={handleStepSelect}
              completedSteps={completedSteps}
            />

            <AiScanAssistantCard onApplyDraft={handleApplyAiDraft} />
          </aside>

          {/* CỘT PHẢI: Wizard Content Form */}
          <section className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Step Title Header */}
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-7">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      {currentStep === 1 && "Bước 1: Thông tin bắt buộc & Tra cứu"}
                      {currentStep === 2 && "Bước 2: Thông số kỹ thuật & 18 Ngành TT17"}
                      {currentStep === 3 && "Bước 3: Giá & Điều kiện thương mại"}
                      {currentStep === 4 && "Bước 4: Minh chứng SHTT, TRL & Quản trị"}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {currentStep === 1 && "Các trường có dấu (*) là thông tin cốt lõi ban đầu."}
                      {currentStep === 2 && "Bộ thông số chuyên môn giúp Bên Mua tìm kiếm và lọc chính xác."}
                      {currentStep === 3 && "Hình thức giá, đơn vị tính, bảo hành và tiến độ thanh toán."}
                      {currentStep === 4 && "Độ chín công nghệ (TRL), hồ sơ sở hữu trí tuệ và cơ quan quản lý."}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    Nấc {currentStep} / 4
                  </span>
                </div>
              </div>

              {/* Step Body */}
              <div className="space-y-6 p-5 sm:p-7">
                {/* --- BƯỚC 1: THÔNG TIN BẮT BUỘC & TRA CỨU --- */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {/* Loại chào bán */}
                    <div>
                      <label className="mb-2 block text-xs font-extrabold text-slate-700">
                        Loại chào bán <span className="text-rose-600">*</span>
                      </label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <button
                          type="button"
                          onClick={() => setOfferType("DEVICE")}
                          className={`rounded-xl border-2 p-3 text-left transition-all ${
                            offerType === "DEVICE"
                              ? "border-blue-600 bg-blue-50/80 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <Settings2 className="mb-2 h-5 w-5 text-blue-600" />
                          <div className="text-sm font-extrabold text-slate-900">Thiết bị</div>
                          <div className="mt-0.5 text-[11px] text-slate-500">Máy móc, dây chuyền kỹ thuật</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setOfferType("PRODUCT")}
                          className={`rounded-xl border-2 p-3 text-left transition-all ${
                            offerType === "PRODUCT"
                              ? "border-emerald-600 bg-emerald-50/80 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <Package className="mb-2 h-5 w-5 text-emerald-600" />
                          <div className="text-sm font-extrabold text-slate-900">Sản phẩm</div>
                          <div className="mt-0.5 text-[11px] text-slate-500">Hàng hóa, vật liệu công nghệ cao</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setOfferType("SOLUTION")}
                          className={`rounded-xl border-2 p-3 text-left transition-all ${
                            offerType === "SOLUTION"
                              ? "border-cyan-600 bg-cyan-50/80 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <Cpu className="mb-2 h-5 w-5 text-cyan-600" />
                          <div className="text-sm font-extrabold text-slate-900">Giải pháp công nghệ</div>
                          <div className="mt-0.5 text-[11px] text-slate-500">Quy trình, phần mềm, sáng chế</div>
                        </button>
                      </div>
                    </div>

                    {/* Ngành công nghiệp & Toggle Chuyển giao */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                          Ngành công nghiệp (18 nhóm ngành TT17) <span className="text-rose-600">*</span>
                        </label>
                        <select
                          value={sectorCode}
                          onChange={(e) => setSectorCode(e.target.value)}
                          className={`w-full rounded-lg border p-2.5 text-xs font-semibold outline-none transition focus:border-blue-500 ${
                            aiHighlightedFields.has("sectorCode") ? "border-cyan-400 bg-cyan-50/50" : "border-slate-300"
                          }`}
                        >
                          {TT17_SECTORS.map((s) => (
                            <option key={s.code} value={s.code}>
                              {s.code} — {s.name}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Ngành quyết định bộ thông số kỹ thuật gợi ý ở Bước 2.
                        </p>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                          Có chuyển giao công nghệ / SHTT? <span className="text-rose-600">*</span>
                        </label>
                        <div className="flex rounded-lg border border-slate-300 p-1">
                          <button
                            type="button"
                            onClick={() => setHasTechTransfer(false)}
                            className={`flex-1 rounded-md py-1.5 text-xs font-bold transition ${
                              !hasTechTransfer ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            Không
                          </button>
                          <button
                            type="button"
                            onClick={() => setHasTechTransfer(true)}
                            className={`flex-1 rounded-md py-1.5 text-xs font-bold transition ${
                              hasTechTransfer ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            Có (Yêu cầu TRL)
                          </button>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Chọn &quot;Có&quot; sẽ yêu cầu khai mức TRL và thông tin văn bằng SHTT.
                        </p>
                      </div>
                    </div>

                    {/* Tên giải pháp */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                          Tên sản phẩm / thiết bị / công nghệ <span className="text-rose-600">*</span>
                        </label>
                        {aiHighlightedFields.has("title") && (
                          <span className="text-[10px] font-bold text-cyan-700">✨ AI gợi ý</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ví dụ: Máy sấy thăng hoa chân không tích hợp AI tối ưu năng lượng"
                        className={`w-full rounded-lg border p-2.5 text-xs font-medium outline-none transition ${
                          errors.title
                            ? "border-rose-500 bg-rose-50"
                            : aiHighlightedFields.has("title")
                            ? "border-cyan-400 bg-cyan-50/30"
                            : "border-slate-300 focus:border-blue-500"
                        }`}
                      />
                      {errors.title && <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.title}</p>}
                    </div>

                    {/* Mô tả ngắn & Bài toán giải quyết */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                            Mô tả ngắn giải pháp <span className="text-rose-600">*</span>
                          </label>
                          {aiHighlightedFields.has("summary") && (
                            <span className="text-[10px] font-bold text-cyan-700">✨ AI gợi ý</span>
                          )}
                        </div>
                        <textarea
                          rows={4}
                          value={summary}
                          onChange={(e) => setSummary(e.target.value)}
                          placeholder="Nêu ngắn gọn đặc điểm chính, công nghệ cốt lõi và thế mạnh..."
                          className={`w-full rounded-lg border p-2.5 text-xs outline-none transition ${
                            errors.summary
                              ? "border-rose-500 bg-rose-50"
                              : aiHighlightedFields.has("summary")
                              ? "border-cyan-400 bg-cyan-50/30"
                              : "border-slate-300 focus:border-blue-500"
                          }`}
                        />
                        {errors.summary && <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.summary}</p>}
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                            Công dụng / Bài toán kỹ thuật giải quyết <span className="text-rose-600">*</span>
                          </label>
                          {aiHighlightedFields.has("problemSolved") && (
                            <span className="text-[10px] font-bold text-cyan-700">✨ AI gợi ý</span>
                          )}
                        </div>
                        <textarea
                          rows={4}
                          value={problemSolved}
                          onChange={(e) => setProblemSolved(e.target.value)}
                          placeholder="Sản phẩm giải quyết nỗi đau hoặc nhu cầu cụ thể nào cho bên mua?"
                          className={`w-full rounded-lg border p-2.5 text-xs outline-none transition ${
                            errors.problemSolved
                              ? "border-rose-500 bg-rose-50"
                              : aiHighlightedFields.has("problemSolved")
                              ? "border-cyan-400 bg-cyan-50/30"
                              : "border-slate-300 focus:border-blue-500"
                          }`}
                        />
                        {errors.problemSolved && (
                          <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.problemSolved}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- BƯỚC 2: THÔNG SỐ KỸ THUẬT & 18 NGÀNH --- */}
                {currentStep === 2 && (
                  <div>
                    <DynamicSpecTable
                      sectorCode={sectorCode}
                      specs={specValues}
                      onChange={setSpecValues}
                    />
                  </div>
                )}

                {/* --- BƯỚC 3: GIÁ & ĐIỀU KIỆN THƯƠNG MẠI --- */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {/* Hình thức công bố giá */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                      <label className="mb-3 block text-xs font-extrabold text-slate-800">
                        Hình thức công bố giá <span className="text-rose-600">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <label
                          className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-bold transition ${
                            pricingType === "FIXED"
                              ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="pricingType"
                            checked={pricingType === "FIXED"}
                            onChange={() => setPricingType("FIXED")}
                            className="mr-1.5"
                          />
                          Giá cụ thể
                        </label>

                        <label
                          className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-bold transition ${
                            pricingType === "RANGE"
                              ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="pricingType"
                            checked={pricingType === "RANGE"}
                            onChange={() => setPricingType("RANGE")}
                            className="mr-1.5"
                          />
                          Khoảng giá (Từ – Đến)
                        </label>

                        <label
                          className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-bold transition ${
                            pricingType === "CONTACT"
                              ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="pricingType"
                            checked={pricingType === "CONTACT"}
                            onChange={() => setPricingType("CONTACT")}
                            className="mr-1.5"
                          />
                          Thỏa thuận / Liên hệ báo giá
                        </label>
                      </div>

                      {/* Các ô nhập giá & tiền tệ */}
                      {pricingType !== "CONTACT" && (
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
                          {pricingType === "FIXED" && (
                            <div className="sm:col-span-2">
                              <label className="mb-1 block text-[11px] font-bold text-slate-600">
                                Mức giá chào bán <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={priceAmount !== undefined ? priceAmount : ""}
                                onChange={(e) =>
                                  setPriceAmount(e.target.value ? Number(e.target.value) : undefined)
                                }
                                placeholder="Ví dụ: 850000000"
                                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold outline-none focus:border-blue-500"
                              />
                              {errors.priceAmount && (
                                <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.priceAmount}</p>
                              )}
                            </div>
                          )}

                          {pricingType === "RANGE" && (
                            <>
                              <div>
                                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                                  Khoảng giá từ <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={priceMin !== undefined ? priceMin : ""}
                                  onChange={(e) =>
                                    setPriceMin(e.target.value ? Number(e.target.value) : undefined)
                                  }
                                  placeholder="Ví dụ: 500000000"
                                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold outline-none focus:border-blue-500"
                                />
                                {errors.priceMin && (
                                  <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.priceMin}</p>
                                )}
                              </div>
                              <div>
                                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                                  Đến <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={priceMax !== undefined ? priceMax : ""}
                                  onChange={(e) =>
                                    setPriceMax(e.target.value ? Number(e.target.value) : undefined)
                                  }
                                  placeholder="Ví dụ: 1200000000"
                                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold outline-none focus:border-blue-500"
                                />
                                {errors.priceMax && (
                                  <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.priceMax}</p>
                                )}
                              </div>
                            </>
                          )}

                          <div>
                            <label className="mb-1 block text-[11px] font-bold text-slate-600">Loại tiền tệ</label>
                            <select
                              value={currency}
                              onChange={(e) => setCurrency(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold outline-none focus:border-blue-500"
                            >
                              <option value="VND">VND (Việt Nam Đồng)</option>
                              <option value="USD">USD (Đô la Mỹ)</option>
                              <option value="EUR">EUR (Euro)</option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-1 block text-[11px] font-bold text-slate-600">Đơn vị tính</label>
                            <input
                              type="text"
                              value={unit}
                              onChange={(e) => setUnit(e.target.value)}
                              placeholder="hệ thống, dây chuyền, bộ..."
                              className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Điều kiện thương mại chi tiết (REQ-04-017) */}
                    <div>
                      <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        Điều kiện thương mại & Giao nhận
                      </h3>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-700">
                            Thời gian giao hàng / Triển khai
                          </label>
                          <input
                            type="text"
                            value={deliveryTimeline}
                            onChange={(e) => setDeliveryTimeline(e.target.value)}
                            placeholder="Ví dụ: 30 ngày kể từ khi ký hợp đồng"
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-700">
                            Thời hạn & Điều kiện bảo hành
                          </label>
                          <input
                            type="text"
                            value={warrantyTerms}
                            onChange={(e) => setWarrantyTerms(e.target.value)}
                            placeholder="Ví dụ: 24 tháng bảo hành chính hãng, hỗ trợ 24/7"
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-700">
                            Phạm vi cung cấp & chuyển giao
                          </label>
                          <input
                            type="text"
                            value={supplyScope}
                            onChange={(e) => setSupplyScope(e.target.value)}
                            placeholder="Toàn quốc, 63 tỉnh/thành, Xuất khẩu ASEAN..."
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-700">
                            Điều kiện thanh toán
                          </label>
                          <input
                            type="text"
                            value={paymentTerms}
                            onChange={(e) => setPaymentTerms(e.target.value)}
                            placeholder="Tạm ứng 30%, 50% khi giao hàng, 20% sau nghiệm thu"
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={installationSupport}
                              onChange={(e) => setInstallationSupport(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-bold text-slate-800">
                              Có hỗ trợ chuyên gia kỹ thuật lắp đặt & hướng dẫn vận hành chuyển giao tận nơi
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- BƯỚC 4: MINH CHỨNG SHTT, TRL & QUẢN TRỊ DUYỆT --- */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {/* Khối SHTT & TRL (Nếu có chuyển giao công nghệ) */}
                    {hasTechTransfer ? (
                      <div className="space-y-6 rounded-2xl border border-blue-200 bg-blue-50/30 p-5">
                        <div className="border-b border-blue-100 pb-3">
                          <h3 className="text-sm font-extrabold text-blue-950">
                            Bộ Tứ Sở Hữu Trí Tuệ & Thang Đo TRL
                          </h3>
                          <p className="mt-0.5 text-xs text-blue-800">
                            Yêu cầu pháp lý bắt buộc đối với hồ sơ có yếu tố chuyển giao công nghệ.
                          </p>
                        </div>

                        {/* Đơn vị R&D */}
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                              Đơn vị nghiên cứu phát triển / Viện / Trường <span className="text-rose-600">*</span>
                            </label>
                            {aiHighlightedFields.has("developerOrigin") && (
                              <span className="text-[10px] font-bold text-cyan-700">✨ AI gợi ý</span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={developerOrigin}
                            onChange={(e) => setDeveloperOrigin(e.target.value)}
                            placeholder="Ví dụ: Viện Cơ điện Nông nghiệp và Công nghệ sau thu hoạch (VIAEP)"
                            className={`w-full rounded-lg border p-2.5 text-xs outline-none transition ${
                              errors.developerOrigin
                                ? "border-rose-500 bg-rose-50"
                                : aiHighlightedFields.has("developerOrigin")
                                ? "border-cyan-400 bg-cyan-50/30"
                                : "border-slate-300 focus:border-blue-500"
                            }`}
                          />
                          {errors.developerOrigin && (
                            <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.developerOrigin}</p>
                          )}
                        </div>

                        {/* Dải Thang Đo TRL 9 Cấp */}
                        <TrlSelectorGrid value={trlLevel} onChange={setTrlLevel} />
                        {errors.trlLevel && (
                          <p className="text-[11px] font-bold text-rose-600">{errors.trlLevel}</p>
                        )}

                        {/* Tình trạng SHTT & Số văn bằng */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                              Tình trạng Sở hữu Trí tuệ <span className="text-rose-600">*</span>
                            </label>
                            <select
                              value={ipStatus}
                              onChange={(e) => setIpStatus(e.target.value as IntellectualPropertyStatus)}
                              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-bold outline-none focus:border-blue-500"
                            >
                              <option value="PATENT_GRANTED">Bằng Độc quyền Sáng chế</option>
                              <option value="UTILITY_MODEL">Giải pháp hữu ích (GPHI)</option>
                              <option value="PATENT_PENDING">Đang nộp đơn hợp lệ</option>
                              <option value="TRADE_SECRET">Bí quyết công nghệ / Trade Secret</option>
                              <option value="SOFTWARE_COPYRIGHT">Bản quyền phần mềm</option>
                              <option value="NONE">Chưa đăng ký bảo hộ</option>
                            </select>
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                                Số văn bằng SHTT / Đơn hợp lệ
                              </label>
                              {aiHighlightedFields.has("ipRegistrationNumber") && (
                                <span className="text-[10px] font-bold text-cyan-700">✨ AI gợi ý</span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={ipRegistrationNumber}
                              onChange={(e) => setIpRegistrationNumber(e.target.value)}
                              placeholder="Ví dụ: VN-1-0028491 hoặc số đơn chấp nhận"
                              className={`w-full rounded-lg border p-2.5 text-xs outline-none transition ${
                                errors.ipRegistrationNumber
                                  ? "border-rose-500 bg-rose-50"
                                  : aiHighlightedFields.has("ipRegistrationNumber")
                                  ? "border-cyan-400 bg-cyan-50/30"
                                  : "border-slate-300 focus:border-blue-500"
                              }`}
                            />
                            {errors.ipRegistrationNumber && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600">
                                {errors.ipRegistrationNumber}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Hình thức chuyển giao & Trạng thái thương mại */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                              Hình thức chuyển giao mong muốn <span className="text-rose-600">*</span>
                            </label>
                            <select
                              value={transferMethod}
                              onChange={(e) => setTransferMethod(e.target.value as TransferMethod)}
                              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-bold outline-none focus:border-blue-500"
                            >
                              <option value="EXCLUSIVE_LICENSE">Li-xăng độc quyền</option>
                              <option value="NON_EXCLUSIVE_LICENSE">Li-xăng không độc quyền</option>
                              <option value="ASSIGNMENT_SALE">Chuyển nhượng quyền sở hữu</option>
                              <option value="JOINT_RD">Hợp tác R&D hoàn thiện công nghệ</option>
                              <option value="CAPITAL_CONTRIBUTION">Góp vốn bằng quyền SHTT</option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                              Trạng thái thương mại hóa <span className="text-rose-600">*</span>
                            </label>
                            <select
                              value={commercialStatus}
                              onChange={(e) => setCommercialStatus(e.target.value as CommercializationStatus)}
                              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-bold outline-none focus:border-blue-500"
                            >
                              <option value="COMMERCIALLY_READY">Sẵn sàng thương mại hóa quy mô lớn</option>
                              <option value="PILOT_TESTING">Đang thử nghiệm Pilot hiện trường</option>
                              <option value="LAB_PROTOTYPE">Mẫu thử nghiệm phòng lab</option>
                              <option value="SEEKING_MANUFACTURER">Đang tìm nhà sản xuất / gia công</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                        Hồ sơ này không đăng ký chuyển giao công nghệ / SHTT nên các trường Bộ Tứ SHTT được miễn khai báo.
                      </div>
                    )}

                    {/* Cụm Media Tải lên (REQ-04-011) */}
                    <div className="border-t border-slate-100 pt-6">
                      <h3 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        Hình ảnh & Media đa phương tiện
                      </h3>
                      <MediaUploadSection
                        mainImageUrl={mainImageUrl}
                        galleryImageUrls={galleryImageUrls}
                        videoDemoUrl={videoDemoUrl}
                        onMainImageChange={setMainImageUrl}
                        onGalleryImagesChange={setGalleryImageUrls}
                        onVideoDemoChange={setVideoDemoUrl}
                      />
                    </div>

                    {/* Cụm Minh chứng DataRoom (REQ-04-013) */}
                    <div className="border-t border-slate-100 pt-6">
                      <EvidenceDocumentSection
                        documents={documents}
                        onChange={setDocuments}
                      />
                    </div>

                    {/* Khai báo Đầu Mối TTO & Cán bộ chuyển giao (REQ-04-016) */}
                    <div className="border-t border-slate-100 pt-6">
                      <h3 className="mb-1 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        Đầu mối TTO / Người phụ trách chuyển giao
                      </h3>
                      <p className="mb-3 text-[11px] text-slate-500">
                        Tuân thủ Nghị định 13/2023/NĐ-CP: Số điện thoại và Email được bảo vệ PDPD, chỉ tự động mở cho Bên Mua sau khi gửi yêu cầu kết nối thành công.
                      </p>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs font-bold text-slate-700">
                            Họ và tên người phụ trách
                          </label>
                          <input
                            type="text"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Ví dụ: ThS. Hoàng Anh Tuấn"
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs font-bold text-slate-700">
                            Chức danh / Bộ phận TTO
                          </label>
                          <input
                            type="text"
                            value={contactPointRole}
                            onChange={(e) => setContactPointRole(e.target.value)}
                            placeholder="Ví dụ: Trưởng phòng Chuyển giao Công nghệ"
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs font-bold text-slate-700">
                            Số điện thoại liên hệ
                          </label>
                          <input
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="0912******"
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs font-bold text-slate-700">
                            Email liên hệ
                          </label>
                          <input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="tuan.ha@viaep.gov.vn"
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cơ quan quản lý Sở KH&CN tiếp nhận & Cam kết pháp lý */}
                    <div className="border-t border-slate-100 pt-6">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                        <div className="mb-4">
                          <label className="mb-1.5 block text-xs font-extrabold text-slate-800">
                            Sở Khoa học và Công nghệ tiếp nhận thẩm định <span className="text-rose-600">*</span>
                          </label>
                          <select
                            value={managingAuthorityId}
                            onChange={(e) => {
                              setManagingAuthorityId(e.target.value);
                              const match = PROVINCIAL_AUTHORITIES_CATALOG.find((x) => x.id === e.target.value);
                              if (match) setManagingAuthorityName(match.name);
                            }}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs font-bold outline-none focus:border-blue-500"
                          >
                            {PROVINCIAL_AUTHORITIES_CATALOG.map((auth) => (
                              <option key={auth.id} value={auth.id}>
                                {auth.name}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-[11px] text-slate-500">
                            Hồ sơ sau khi nộp sẽ được chuyển đến Cổng Tác Nghiệp Cấp 2 (/gov) của Sở KH&CN để cán bộ chuyên trách kiểm tra hồ sơ và ký số duyệt.
                          </p>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={legalConsent}
                            onChange={(e) => setLegalConsent(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs leading-relaxed text-slate-700">
                            <b>Cam kết tính chính xác & Trách nhiệm pháp lý:</b> Tôi/Doanh nghiệp cam kết chịu trách nhiệm hoàn toàn trước pháp luật về tính xác thực, tính hợp pháp của thông tin chào bán, các văn bằng Sở hữu Trí tuệ và tài liệu đính kèm trên Sàn NacenTwin theo quy định hiện hành.
                          </span>
                        </label>
                        {errors.legalConsent && (
                          <p className="mt-2 text-[11px] font-bold text-rose-600">{errors.legalConsent}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Footer Actions */}
              <div className="border-t border-slate-100 bg-white px-5 py-4 sm:px-7">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="text-xs text-slate-500">
                    <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />
                    Bảo mật dữ liệu thương mại theo Tiêu chuẩn CSDL Đổi mới sáng tạo Quốc gia.
                  </p>

                  <div className="flex items-center gap-2">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" /> Quay lại
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isSavingDraft || isSubmitting}
                      onClick={handleSaveDraft}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Save className="h-3.5 w-3.5" /> Lưu nháp
                    </button>

                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="inline-flex items-center gap-1 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
                      >
                        Tiếp tục: {currentStep === 1 ? "Thông số ngành" : currentStep === 2 ? "Giá & Thương mại" : "Minh chứng & Duyệt"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isSubmitting || isSavingDraft}
                        onClick={handleSubmitForReview}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        <Send className="h-3.5 w-3.5" /> Gửi thẩm định Sở KH&CN
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
