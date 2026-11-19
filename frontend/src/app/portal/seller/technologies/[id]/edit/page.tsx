"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Award,
  Building2,
  FileText,
  AlertCircle,
  AlertOctagon,
  PauseCircle,
  PlayCircle,
  Trash2,
  Save,
  Send,
  Check,
  Settings2,
  Package,
  Cpu,
  Clock,
  Sparkles,
  X,
  Wand2,
  Image as ImageIcon,
} from "lucide-react";
import {
  fetchOfferById,
  updateSellerOffer,
  deleteSellerOffer,
  togglePublishOffer,
  FIXED_BACLINK_AUTHORITY,
} from "@/services/api/technology-offer";
import { getStoredSession } from "@/lib/auth-client";
import {
  TechnologyOffer,
  OfferType,
  IntellectualPropertyStatus,
  TransferMethod,
  CommercializationStatus,
  PricingType,
  OfferSpecValue,
  OfferDocument,
  TT17_SECTORS,
  LEGACY_SECTOR_MAP,
  UpdateSellerOfferPayload,
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

export default function ChinhSuaHoSoChaoBanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [needsReauditAlert, setNeedsReauditAlert] = useState<boolean>(false);

  const [offer, setOffer] = useState<TechnologyOffer | null>(null);

  // Wizard Step State (1..4)
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1, 2, 3, 4]);

  // Form Fields - Step 1
  const [offerType, setOfferType] = useState<OfferType>("DEVICE");
  const [hasTechTransfer, setHasTechTransfer] = useState(true);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [problemSolved, setProblemSolved] = useState("");
  const [sectorCode, setSectorCode] = useState("IND_MECH");

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

  // TRL & IP Quad (Step 1 & Step 4)
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
  const [managingAuthorityId, setManagingAuthorityId] = useState<string>(FIXED_BACLINK_AUTHORITY.id);
  const [managingAuthorityName, setManagingAuthorityName] = useState<string>(FIXED_BACLINK_AUTHORITY.name);
  const [isAutoDetectedAuthority, setIsAutoDetectedAuthority] = useState(false);
  const [legalCommitmentConfirmed, setLegalCommitmentConfirmed] = useState(false);

  // Doanh nghiệp liên kết (TASK-02)
  const [enterpriseName, setEnterpriseName] = useState("");
  const [enterpriseTaxCode, setEnterpriseTaxCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFastTrackModalOpen, setIsFastTrackModalOpen] = useState(false);

  // 1. Tải chi tiết hồ sơ từ API
  useEffect(() => {
    if (!id) return;

    let mounted = true;
    setLoading(true);

    fetchOfferById(id)
      .then((data) => {
        if (!mounted || !data) return;
        setOffer(data);

        // Load fields
        setOfferType(data.offerType || "DEVICE");
        setHasTechTransfer(data.hasTechTransfer ?? true);
        setTitle(data.title || "");
        setSummary(data.summary || "");
        setProblemSolved(data.problemSolved || "");

        // Sector resolution
        let sCode = data.sectorCode || "LV07";
        if (LEGACY_SECTOR_MAP[sCode]) {
          sCode = LEGACY_SECTOR_MAP[sCode];
        }
        setSectorCode(sCode);

        // Pricing
        setPricingType(data.pricingType || "CONTACT");
        setPriceAmount(data.priceAmount ?? undefined);
        setPriceMin(data.priceMin ?? undefined);
        setPriceMax(data.priceMax ?? undefined);
        setCurrency(data.currency || "VND");
        setUnit(data.unit || "");

        // Media Showcase
        if (data.mainImageUrl) setMainImageUrl(data.mainImageUrl);
        if (data.galleryImageUrls) setGalleryImageUrls(data.galleryImageUrls);
        if (data.videoDemoUrl) setVideoDemoUrl(data.videoDemoUrl);

        // TRL & IP
        setTrlLevel(data.trlLevel || 7);
        setDeveloperOrigin(data.developerOrigin || "");
        setIpStatus(data.ipStatus || "PATENT_GRANTED");
        setIpRegistrationNumber(data.ipRegistrationNumber || "");
        if (data.ipIssueDate) setIpIssueDate(data.ipIssueDate);
        setTransferMethod(data.transferMethod || "NON_EXCLUSIVE_LICENSE");
        setCommercialStatus(data.commercialStatus || "PILOT_TESTING");

        // Lớp 2
        setModelCode(data.modelCode || "");
        setManufacturer(data.manufacturer || "");
        setOriginCountry(data.originCountry || "Việt Nam");
        setEquipmentStatus(data.equipmentStatus || "NEW");
        setManufacturingYear(data.manufacturingYear ?? 2026);
        setCapacityScale(data.capacityScale || "");
        setEnergyConsumption(data.energyConsumption || "");
        setAutomationLevel(data.automationLevel || "FULLY_AUTOMATIC");
        setOperatingPrinciple(data.operatingPrinciple || "");
        setDeploymentConditions(data.deploymentConditions || "");

        // Lớp 3 specs
        if (data.specValues && data.specValues.length > 0) {
          setSpecValues(data.specValues);
        }

        // Lớp 4
        setTransferPriorityMethod(data.transferPriorityMethod || "PURCHASE_ORDER");
        if (data.priceIncludes) setPriceIncludes(data.priceIncludes);
        if (data.taxAndExtraCosts) setTaxAndExtraCosts(data.taxAndExtraCosts);
        if (data.supplyScope) setSupplyScope(data.supplyScope);
        if (data.deliveryTimeline) setDeliveryTimeline(data.deliveryTimeline);
        if (data.paymentTerms) setPaymentTerms(data.paymentTerms);
        if (data.warrantyTerms) setWarrantyTerms(data.warrantyTerms);
        if (data.technicalSupportMethod) setTechnicalSupportMethod(data.technicalSupportMethod);
        if (typeof data.installationSupport === "boolean") setInstallationSupport(data.installationSupport);

        // Lớp 4 DataRoom & Governance
        if (data.documents) setDocuments(data.documents);
        setManagingAuthorityId(FIXED_BACLINK_AUTHORITY.id);
        setManagingAuthorityName(FIXED_BACLINK_AUTHORITY.name);
        setIsAutoDetectedAuthority(false);
        if (typeof data.legalCommitmentConfirmed === "boolean") setLegalCommitmentConfirmed(data.legalCommitmentConfirmed);

        // Doanh nghiệp
        if (data.enterpriseName) setEnterpriseName(data.enterpriseName);
        if (data.enterpriseTaxCode) setEnterpriseTaxCode(data.enterpriseTaxCode);
        if (data.contactName) setContactName(data.contactName);
        if (data.contactPhone) setContactPhone(data.contactPhone);
        if (data.contactEmail) setContactEmail(data.contactEmail);
      })
      .catch((err) => {
        console.error("Lỗi tải chi tiết offer:", err);
        setStatusFeedback({ type: "error", message: "Không thể tải chi tiết hồ sơ công nghệ." });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  // Đếm tiến trình Bước 1
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

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) errs.title = "Tên sản phẩm/công nghệ tối thiểu 3 ký tự.";
    if (!summary.trim()) errs.summary = "Mô tả ngắn không được để trống.";
    if (!problemSolved.trim()) errs.problemSolved = "Công dụng / bài toán giải quyết không được để trống.";
    if (!sectorCode) errs.sectorCode = "Vui lòng chọn ngành công nghiệp.";
    if (hasTechTransfer && (!trlLevel || trlLevel < 1 || trlLevel > 9)) {
      errs.trlLevel = "Khi có chuyển giao công nghệ, bắt buộc chọn mức TRL từ 1 đến 9.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSave = async (isDraftMode: boolean = false) => {
    if (!isDraftMode && !validateStep1()) {
      setStatusFeedback({ type: "error", message: "Vui lòng hoàn thiện các trường bắt buộc ở Bước 1." });
      return;
    }

    if (isDraftMode) setIsSavingDraft(true);
    else setSaving(true);
    setStatusFeedback(null);
    setNeedsReauditAlert(false);

    try {
      const payload: UpdateSellerOfferPayload = {
        action: isDraftMode ? "SAVE_DRAFT" : "SUBMIT_FOR_REVIEW",
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
        legalConsent: legalCommitmentConfirmed,
        legalCommitmentConfirmed,
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
        specValues,
        documents,
      };

      const res = await updateSellerOffer(id, payload);
      if (res.needsReaudit) {
        setNeedsReauditAlert(true);
      }
      setStatusFeedback({ type: "success", message: res.message || "Lưu cập nhật thành công!" });
      setIsFastTrackModalOpen(false);
    } catch (err: any) {
      setStatusFeedback({ type: "error", message: err.message || "Lỗi lưu cập nhật hồ sơ." });
    } finally {
      setSaving(false);
      setIsSavingDraft(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!offer) return;
    setToggling(true);
    try {
      const willPublish = offer.status !== "APPROVED";
      const res = await togglePublishOffer(id, willPublish);
      setStatusFeedback({ type: "success", message: res.message || "Thao tác thành công." });
      setOffer((prev) => prev ? { ...prev, status: res.data?.status || (willPublish ? "APPROVED" : "DRAFT") } : null);
    } catch (err: any) {
      setStatusFeedback({ type: "error", message: err.message || "Lỗi đổi trạng thái xuất bản." });
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa hồ sơ công nghệ này khỏi kho lưu trữ? Thao tác không thể hoàn tác.")) {
      return;
    }
    setDeleting(true);
    try {
      await deleteSellerOffer(id);
      router.push("/portal/seller/technologies?deleted=1");
    } catch (err: any) {
      setStatusFeedback({ type: "error", message: err.message || "Lỗi xóa hồ sơ." });
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
          <Clock className="h-5 w-5 animate-spin text-brand-600" />
          <span>Đang tải thông tin hồ sơ chào bán...</span>
        </div>
      </div>
    );
  }

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
                CHỈNH SỬA HỒ SƠ CHÀO BÁN #{offer?.offerCode || id.slice(0, 8)}
              </div>
              <div className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Phân Hệ Seller Hồ Sơ Chào Bán · TASK-04 Delta v6
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isSavingDraft}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              {isSavingDraft ? "Đang lưu..." : "Lưu nháp"}
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="rounded-lg bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white px-3.5 py-2 text-xs font-extrabold shadow-sm transition flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {saving ? "Đang lưu..." : "Cập nhật & Gửi duyệt"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-2 text-xs font-bold transition flex items-center gap-1.5"
              title="Xóa hồ sơ"
            >
              <Trash2 className="h-3.5 w-3.5" />
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
              <span className="font-semibold text-slate-700">Chỉnh sửa hồ sơ</span>
            </nav>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Chỉnh sửa hồ sơ: {title || "Chưa đặt tên"}
            </h1>
            <p className="mt-0.5 text-xs text-slate-600">
              Mã hồ sơ: <span className="font-mono font-bold text-brand-700">{offer?.offerCode}</span> &bull; Trạng thái hiện tại:{" "}
              <span className="rounded bg-slate-200 px-2 py-0.5 font-bold text-slate-800 uppercase text-xs">
                {offer?.status}
              </span>
            </p>
          </div>
        </div>

        {/* BR-SELLER-07 Alert */}
        {needsReauditAlert && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertOctagon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Cảnh báo tái thẩm định theo Quy tắc BR-SELLER-07:</p>
              <p className="mt-1 leading-relaxed">
                Do bạn vừa thay đổi các trường cốt lõi liên quan tới Cấp độ TRL / Tình trạng Sở hữu Trí tuệ / Phương thức chuyển giao, hồ sơ này đã được hệ thống tự động chuyển về trạng thái <b>CHỜ THẨM ĐỊNH (PENDING)</b> để Ban Thẩm định Kỹ thuật — Hiệp hội BACLINK rà soát lại trước khi tái xuất bản.
              </p>
            </div>
          </div>
        )}

        {/* Status feedback */}
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

        {/* KPI Banner 3 Cột */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-xs font-bold text-emerald-700">Bước chỉnh sửa</div>
            <div className="mt-1 text-sm font-extrabold text-emerald-900">
              0{currentStep} ·{" "}
              {currentStep === 1
                ? "Thông tin bắt buộc"
                : currentStep === 2
                ? "Thông số kỹ thuật"
                : currentStep === 3
                ? "Giá & thương mại"
                : "Pháp lý & DataRoom"}
            </div>
          </div>

          <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
            <div className="text-xs font-bold text-brand-700">Tiêu chuẩn đồng bộ</div>
            <div className="mt-1 text-sm font-extrabold text-brand-900">
              Đồng bộ 100% 4 Lớp Excel Master
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-bold text-slate-500">Bộ quy tắc áp dụng</div>
            <div className="mt-1 text-sm font-extrabold text-slate-900 truncate">
              {currentSectorObj.name} · {offerType === "DEVICE" ? "Thiết bị" : offerType === "PRODUCT" ? "Sản phẩm" : "Giải pháp"}
            </div>
          </div>
        </div>

        {/* Main Grid: Sidebar vs Content */}
        <div className="grid grid-cols-1 gap-4 lg:gap-5 lg:grid-cols-[296px_minmax(0,1fr)]">
          {/* Left Column */}
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
          </aside>

          {/* Right Column */}
          <section className="min-w-0 space-y-6">
            {currentStep === 1 && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5 space-y-5">
                {/* Doanh nghiệp liên kết & Ban Thẩm định Kỹ thuật BACLINK */}
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

                <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSave(true)}
                      className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Lưu nháp
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave(false)}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-extrabold shadow-sm"
                    >
                      Cập nhật ngay
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="rounded-lg bg-brand-700 bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    Tiếp tục: Thông số ngành &rarr;
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Bước 2: Thông số kỹ thuật &amp; Đặc thù ngành công nghiệp
                    </h2>
                    <p className="text-xs text-slate-500">
                      Lớp 2 (Kỹ thuật chung) &amp; Lớp 3 (Đặc thù 8 ngành công nghiệp mũi nhọn BACLINK).
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
                      onClick={() => handleSave(false)}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-extrabold shadow-sm"
                    >
                      Lưu cập nhật
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
                      onClick={() => handleSave(false)}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-extrabold shadow-sm"
                    >
                      Lưu cập nhật
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
                      Khai báo bộ tứ SHTT, phòng dữ liệu bảo mật 3 cấp và gửi Ban Quản trị Hiệp hội BACLINK thẩm định niêm yết.
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

                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    &larr; Quay lại Bước 3
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave(false)}
                    disabled={saving}
                    className="rounded-lg bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white px-5 py-2 text-xs font-extrabold shadow flex items-center gap-1.5"
                  >
                    <Send className="h-4 w-4" />
                    {saving ? "Đang lưu..." : "Hoàn tất & Cập nhật hồ sơ"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
