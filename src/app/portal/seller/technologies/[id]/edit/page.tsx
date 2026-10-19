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
} from "lucide-react";
import {
  fetchOfferById,
  updateSellerOffer,
  deleteSellerOffer,
  togglePublishOffer,
  PROVINCIAL_AUTHORITIES_CATALOG,
} from "@/services/api/technology-offer";
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
  CreateSellerOfferPayload,
  TechTransferDraftData,
} from "@/types/technology-offer";
import { FormStepper } from "@/components/seller/FormStepper";
import { DynamicSpecTable } from "@/components/seller/DynamicSpecTable";
import { TrlSelectorGrid } from "@/components/seller/TrlSelectorGrid";
import { MediaUploadSection } from "@/components/seller/MediaUploadSection";
import { EvidenceDocumentSection } from "@/components/seller/EvidenceDocumentSection";
import { AiScanAssistantCard } from "@/components/seller/AiScanAssistantCard";

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
  const [offerType, setOfferType] = useState<OfferType>("SOLUTION");
  const [hasTechTransfer, setHasTechTransfer] = useState(true);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [problemSolved, setProblemSolved] = useState("");
  const [sectorCode, setSectorCode] = useState("MECH");

  // Form Fields - Step 2 (Specs)
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        setStatusFeedback(null);
        const data = await fetchOfferById(id);
        if (!data) {
          setStatusFeedback({ type: "error", message: "Không tìm thấy hồ sơ chào bán công nghệ." });
          return;
        }

        setOffer(data);
        setOfferType(data.offerType);
        setHasTechTransfer(data.hasTechTransfer);
        setTitle(data.title);
        setSummary(data.summary);
        setProblemSolved(data.problemSolved);
        setSectorCode(data.sectorCode);
        setPricingType(data.pricingType);
        setPriceAmount(data.priceAmount || undefined);
        setPriceMin(data.priceMin || undefined);
        setPriceMax(data.priceMax || undefined);
        setCurrency(data.currency || "VND");
        setUnit(data.unit || "hệ thống");
        setDeliveryTimeline(data.deliveryTimeline || "30 ngày kể từ ngày ký hợp đồng");
        setWarrantyTerms(data.warrantyTerms || "24 tháng bảo hành chính hãng");
        setSupplyScope(data.supplyScope || "Toàn quốc");
        setPaymentTerms(data.paymentTerms || "Tạm ứng 30%, 50% khi giao hàng, 20% sau nghiệm thu");
        setInstallationSupport(data.installationSupport !== undefined ? data.installationSupport : true);

        setDeveloperOrigin(data.developerOrigin || "");
        setTrlLevel(data.trlLevel || 7);
        setIpStatus(data.ipStatus || "PATENT_GRANTED");
        setIpRegistrationNumber(data.ipRegistrationNumber || "");
        setTransferMethod(data.transferMethod || "NON_EXCLUSIVE_LICENSE");
        setCommercialStatus(data.commercialStatus || "PILOT_TESTING");

        setMainImageUrl(data.mainImageUrl || null);
        setGalleryImageUrls(data.galleryImageUrls ? [...data.galleryImageUrls] : []);
        setVideoDemoUrl(data.videoDemoUrl || null);
        setDocuments(data.documents ? [...data.documents] : []);
        setSpecValues(data.specValues ? [...data.specValues] : []);

        setContactName(data.contactName || "");
        setContactPointRole(data.contactPointRole || "Chuyên viên TTO");
        setContactPhone(data.contactPhone || "");
        setContactEmail(data.contactEmail || "");

        setManagingAuthorityId(data.managingAuthorityId || "VN-HN");
        setManagingAuthorityName(data.managingAuthorityName || "Sở Khoa học và Công nghệ TP. Hà Nội");
        setLegalConsent(data.legalConsent !== undefined ? data.legalConsent : true);
      } catch (err: any) {
        setStatusFeedback({ type: "error", message: "Lỗi kết nối khi tải hồ sơ." });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleApplyAiDraft = (draft: TechTransferDraftData) => {
    if (draft.title) setTitle(draft.title);
    if (draft.technicalSummary) setSummary(draft.technicalSummary);
    if (draft.problemSolved) setProblemSolved(draft.problemSolved);
    if (draft.targetSectorCode) setSectorCode(draft.targetSectorCode);
    if (draft.originDeveloper) setDeveloperOrigin(draft.originDeveloper);
    if (draft.ipQuad?.trlLevel) setTrlLevel(draft.ipQuad.trlLevel);
    if (draft.ipQuad?.ipStatus) setIpStatus(draft.ipQuad.ipStatus);
    if (draft.ipQuad?.patentNumber) setIpRegistrationNumber(draft.ipQuad.patentNumber);
    if (draft.suggestedSpecs && draft.suggestedSpecs.length > 0) setSpecValues(draft.suggestedSpecs);

    setStatusFeedback({
      type: "success",
      message: "✨ Đã nạp gợi ý từ AI vào hồ sơ chỉnh sửa!",
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!title.trim() || title.trim().length < 3)
        newErrors.title = "Tên sản phẩm/công nghệ phải có tối thiểu 3 ký tự.";
      if (!summary.trim()) newErrors.summary = "Mô tả ngắn không được để trống.";
      if (!problemSolved.trim())
        newErrors.problemSolved = "Công dụng / bài toán giải quyết không được để trống.";
    }

    if (step === 3) {
      if (pricingType === "FIXED" && (!priceAmount || priceAmount <= 0)) {
        newErrors.priceAmount = "Giá cố định phải lớn hơn 0.";
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
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

  const handleSaveDraft = async () => {
    if (!title.trim() || title.trim().length < 3) {
      setErrors({ title: "Vui lòng nhập tiêu đề tối thiểu 3 ký tự để lưu nháp." });
      setCurrentStep(1);
      return;
    }

    setIsSavingDraft(true);
    setStatusFeedback(null);

    try {
      const payload = buildPayload("SAVE_DRAFT");
      const res = await updateSellerOffer(id, payload);

      if (res.success && res.data) {
        setOffer(res.data);
        setStatusFeedback({ type: "success", message: "Đã lưu nháp hồ sơ thành công." });
      } else {
        setStatusFeedback({ type: "error", message: res.message || "Lỗi khi lưu nháp." });
      }
    } catch (e: any) {
      setStatusFeedback({ type: "error", message: e.message || "Lỗi kết nối khi lưu nháp." });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmitUpdate = async () => {
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
        message: "Vui lòng hoàn thành các thông tin bắt buộc trước khi lưu hồ sơ.",
      });
      return;
    }

    setSaving(true);
    setStatusFeedback(null);
    setNeedsReauditAlert(false);

    try {
      const payload = buildPayload("SUBMIT_FOR_REVIEW");
      const res = await updateSellerOffer(id, payload);

      if (res.success && res.data) {
        setOffer(res.data);
        if (res.needsReaudit) {
          setNeedsReauditAlert(true);
        }
        setStatusFeedback({
          type: "success",
          message: res.message || "Cập nhật hồ sơ chào bán thành công!",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setStatusFeedback({
          type: "error",
          message: res.message || "Cập nhật hồ sơ thất bại.",
        });
      }
    } catch (err: any) {
      setStatusFeedback({
        type: "error",
        message: err.message || "Lỗi kết nối máy chủ khi cập nhật.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!offer) return;
    const isCurrentlyApproved = offer.status === "APPROVED";
    const actionLabel = isCurrentlyApproved ? "tạm ẩn hồ sơ" : "niêm yết công khai";
    if (!confirm(`Bạn có chắc chắn muốn ${actionLabel} này?`)) return;

    try {
      setToggling(true);
      const res = await togglePublishOffer(id, !isCurrentlyApproved);
      if (res.success) {
        const nextStatus = !isCurrentlyApproved ? "APPROVED" : "HIDDEN";
        setOffer({ ...offer, status: nextStatus as any });
        setStatusFeedback({ type: "success", message: res.message || "Thao tác thành công." });
      } else {
        setStatusFeedback({ type: "error", message: res.message || "Thao tác thất bại." });
      }
    } catch (err: any) {
      setStatusFeedback({ type: "error", message: "Lỗi kết nối máy chủ." });
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ chào bán công nghệ này?")) return;
    try {
      setDeleting(true);
      const res = await deleteSellerOffer(id);
      if (res.success) {
        alert("Đã xóa hồ sơ công nghệ thành công.");
        router.push("/portal/seller/technologies");
      } else {
        setStatusFeedback({ type: "error", message: res.message || "Không thể xóa hồ sơ." });
      }
    } catch (err: any) {
      setStatusFeedback({ type: "error", message: "Lỗi kết nối máy chủ khi xóa." });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-xs font-semibold text-slate-500">Đang tải hồ sơ chào bán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Header bar */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <nav className="mb-1 text-xs text-slate-500">
              <Link href="/portal/seller/technologies" className="hover:text-blue-600">
                Kho công nghệ Seller
              </Link>{" "}
              / <span className="font-semibold text-slate-700">Chỉnh sửa hồ sơ</span>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Chỉnh sửa: {offer?.title || "Hồ sơ công nghệ"}
              </h1>
              <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-700">
                {offer?.offerCode}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  offer?.status === "APPROVED"
                    ? "bg-emerald-100 text-emerald-800"
                    : offer?.status === "PENDING"
                    ? "bg-amber-100 text-amber-800"
                    : offer?.status === "DRAFT"
                    ? "bg-slate-200 text-slate-700"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {offer?.status === "APPROVED"
                  ? "Đã niêm yết"
                  : offer?.status === "PENDING"
                  ? "Chờ thẩm định"
                  : offer?.status === "DRAFT"
                  ? "Bản nháp DRAFT"
                  : "Từ chối"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={toggling || saving}
              onClick={handleTogglePublish}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                offer?.status === "APPROVED"
                  ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              {offer?.status === "APPROVED" ? (
                <>
                  <PauseCircle className="h-4 w-4" /> Tạm ẩn khỏi sàn
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" /> Niêm yết sàn
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isSavingDraft || saving}
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Save className="h-4 w-4" />
              {isSavingDraft ? "Đang lưu..." : "Lưu nháp"}
            </button>

            <button
              type="button"
              disabled={saving || isSavingDraft}
              onClick={handleSubmitUpdate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Send className="h-4 w-4" />
              {saving ? "Đang lưu..." : "Lưu & Cập nhật"}
            </button>

            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
              title="Xóa hồ sơ"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        {needsReauditAlert && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
            <AlertOctagon className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h4 className="text-xs font-extrabold text-amber-950">
                Quy tắc BR-SELLER-07: Hồ sơ đã được chuyển về trạng thái CHỜ THẨM ĐỊNH (PENDING)
              </h4>
              <p className="mt-0.5 text-xs text-amber-800">
                Do bạn vừa thay đổi các thông số cốt lõi (Mức TRL, Tình trạng SHTT hoặc Hình thức chuyển giao), hồ sơ cần được Sở KH&CN tái thẩm định trước khi xuất bản lại trên Sàn.
              </p>
            </div>
          </div>
        )}

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

        {/* Bố cục 2 cột: Cột trái 260px (Stepper + AI Card), Cột phải Form Wizard */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <FormStepper
              currentStep={currentStep}
              onStepSelect={(step) => {
                setCurrentStep(step);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              completedSteps={completedSteps}
            />

            <AiScanAssistantCard onApplyDraft={handleApplyAiDraft} />
          </aside>

          <section className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                      Cập nhật thông tin chi tiết để tối ưu độ tương thích khi matching với Bên Mua.
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    Nấc {currentStep} / 4
                  </span>
                </div>
              </div>

              <div className="space-y-6 p-5 sm:p-7">
                {/* --- BƯỚC 1 --- */}
                {currentStep === 1 && (
                  <div className="space-y-6">
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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                          Ngành công nghiệp (18 nhóm ngành TT17) <span className="text-rose-600">*</span>
                        </label>
                        <select
                          value={sectorCode}
                          onChange={(e) => setSectorCode(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-blue-500"
                        >
                          {TT17_SECTORS.map((s) => (
                            <option key={s.code} value={s.code}>
                              {s.code} — {s.name}
                            </option>
                          ))}
                        </select>
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
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                        Tên sản phẩm / thiết bị / công nghệ <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full rounded-lg border p-2.5 text-xs font-medium outline-none ${
                          errors.title ? "border-rose-500 bg-rose-50" : "border-slate-300 focus:border-blue-500"
                        }`}
                      />
                      {errors.title && <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.title}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                          Mô tả ngắn giải pháp <span className="text-rose-600">*</span>
                        </label>
                        <textarea
                          rows={4}
                          value={summary}
                          onChange={(e) => setSummary(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-500"
                        />
                        {errors.summary && <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.summary}</p>}
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                          Công dụng / Bài toán giải quyết <span className="text-rose-600">*</span>
                        </label>
                        <textarea
                          rows={4}
                          value={problemSolved}
                          onChange={(e) => setProblemSolved(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-500"
                        />
                        {errors.problemSolved && (
                          <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.problemSolved}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- BƯỚC 2 --- */}
                {currentStep === 2 && (
                  <div>
                    <DynamicSpecTable
                      sectorCode={sectorCode}
                      specs={specValues}
                      onChange={setSpecValues}
                    />
                  </div>
                )}

                {/* --- BƯỚC 3 --- */}
                {currentStep === 3 && (
                  <div className="space-y-6">
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
                                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold outline-none focus:border-blue-500"
                              />
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
                                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold outline-none focus:border-blue-500"
                                />
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
                                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold outline-none focus:border-blue-500"
                                />
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
                              className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700">
                          Thời gian giao hàng / Triển khai
                        </label>
                        <input
                          type="text"
                          value={deliveryTimeline}
                          onChange={(e) => setDeliveryTimeline(e.target.value)}
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
                            Có hỗ trợ chuyên gia kỹ thuật lắp đặt & hướng dẫn vận hành chuyển giao
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- BƯỚC 4 --- */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {hasTechTransfer && (
                      <div className="space-y-6 rounded-2xl border border-blue-200 bg-blue-50/30 p-5">
                        <div className="border-b border-blue-100 pb-3">
                          <h3 className="text-sm font-extrabold text-blue-950">
                            Bộ Tứ Sở Hữu Trí Tuệ & Thang Đo TRL
                          </h3>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                            Đơn vị nghiên cứu phát triển / Viện / Trường <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={developerOrigin}
                            onChange={(e) => setDeveloperOrigin(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-500"
                          />
                          {errors.developerOrigin && (
                            <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.developerOrigin}</p>
                          )}
                        </div>

                        <TrlSelectorGrid value={trlLevel} onChange={setTrlLevel} />

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
                              <option value="TRADE_SECRET">Bí quyết công nghệ</option>
                              <option value="SOFTWARE_COPYRIGHT">Bản quyền phần mềm</option>
                              <option value="NONE">Chưa đăng ký bảo hộ</option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                              Số văn bằng SHTT / Đơn hợp lệ
                            </label>
                            <input
                              type="text"
                              value={ipRegistrationNumber}
                              onChange={(e) => setIpRegistrationNumber(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

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
                    )}

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

                    <div className="border-t border-slate-100 pt-6">
                      <EvidenceDocumentSection
                        documents={documents}
                        onChange={setDocuments}
                      />
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <h3 className="mb-1 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        Đầu mối TTO / Người phụ trách chuyển giao
                      </h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs font-bold text-slate-700">
                            Họ và tên người phụ trách
                          </label>
                          <input
                            type="text"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
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
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
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
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Navigation Actions */}
              <div className="border-t border-slate-100 bg-white px-5 py-4 sm:px-7">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="text-xs text-slate-500">
                    <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />
                    Chỉnh sửa an toàn · Mọi thay đổi đều được lưu vết trên CSDL NacenTwin.
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
                      disabled={isSavingDraft || saving}
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
                        disabled={saving || isSavingDraft}
                        onClick={handleSubmitUpdate}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-slate-800"
                      >
                        <Send className="h-3.5 w-3.5" /> Lưu & Gửi cập nhật
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
