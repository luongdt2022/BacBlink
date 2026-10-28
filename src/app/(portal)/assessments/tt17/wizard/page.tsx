"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppButton } from "@/components/ui/design-system";
import {
  Tt17SurveyData,
  INITIAL_SURVEY_DATA,
  SAMPLE_BENCHMARK_DAIHUNG,
  calculateLocalScore,
  saveAssessmentDraft,
  submitAssessment,
  MachineryItem,
  INDUSTRY_BENCHMARKS,
} from "@/services/api/assessment-tt17";
import { FormattedMoneyInput, formatVietnameseCurrencyText } from "@/components/ui/formatted-money-input";
import { SearchableInputCombobox } from "@/components/ui/searchable-input-combobox";
import { lookupTaxCode, fetchMyEnterpriseProfile } from "@/lib/enterprise-client";
import { getStoredSession } from "@/lib/auth-client";
import { PROVINCES_34 } from "@/app/khao-sat-nhu-cau/types";
import {
  Award,
  Save,
  Send,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Cpu,
  BarChart3,
  Briefcase,
  FlaskConical,
  Lightbulb,
  Search,
  Loader2,
  KeyRound,
  LogIn,
  ArrowRight,
  ShieldCheck,
  Info,
  SlidersHorizontal,
  Coins,
  TrendingUp,
  RotateCcw,
  Sparkles,
  MapPin,
  Factory,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Mục A: Thông Tin Chung", icon: Building2 },
  { id: 2, title: "Mục B: Thiết Bị & Công Nghệ", icon: Cpu },
  { id: 3, title: "Mục C: Sản Xuất & Kinh Doanh", icon: BarChart3 },
  { id: 4, title: "Mục D: Nhân Lực & Quản Trị", icon: Briefcase },
  { id: 5, title: "Mục Đ: Đầu Tư R&D", icon: FlaskConical },
  { id: 6, title: "Mục E: Đổi Mới Sáng Tạo", icon: Lightbulb },
];

export default function AssessmentWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentYear, setAssessmentYear] = useState(2026);
  const [industryCode, setIndustryCode] = useState("C.28");
  const [scopeId, setScopeId] = useState("Hải Phòng");
  const [moneyUnit, setMoneyUnit] = useState<"TY" | "TRIEU" | "VND">("TY");
  const [survey, setSurvey] = useState<Tt17SurveyData>(INITIAL_SURVEY_DATA);
  const [saving, setSaving] = useState(false);
  const [isLookingUpTax, setIsLookingUpTax] = useState(false);
  const [isPrefilledFromSession, setIsPrefilledFromSession] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    id: string;
    surveyCode: string;
    companyName: string;
    autoProvisioned?: boolean;
    credentials?: {
      email: string;
      temporaryPassword?: string;
      enterpriseCode?: string;
    } | null;
  } | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showExtraFacilities, setShowExtraFacilities] = useState(false);
  const [showExtraIndustries, setShowExtraIndustries] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Smart Pre-fill: Tự động lấy hồ sơ Doanh nghiệp từ CSDL nếu đã có phiên đăng nhập
  useEffect(() => {
    const session = getStoredSession();
    if (session?.accessToken) {
      fetchMyEnterpriseProfile()
        .then((profile) => {
          if (profile && (profile.name || profile.taxCode)) {
            setIsPrefilledFromSession(true);
            setSurvey((prev) => ({
              ...prev,
              companyName: prev.companyName || profile.name || "",
              taxCode: prev.taxCode || profile.taxCode || "",
              contactPerson: prev.contactPerson || profile.contactPerson || "",
              companyEmail: prev.companyEmail || profile.contactEmail || "",
              companyPhone: prev.companyPhone || profile.contactPhone || "",
              companyAddress: prev.companyAddress || profile.addressDetail || "",
              totalWorkforce: prev.totalWorkforce || (profile.workforceScale ? parseInt(profile.workforceScale) || 0 : 0),
            }));
            if (profile.provinceCity) {
              setScopeId(profile.provinceCity);
            }
            if (profile.sectorCode && INDUSTRY_BENCHMARKS[profile.sectorCode]) {
              setIndustryCode(profile.sectorCode);
            }
            showToast(`Đã tự động nạp hồ sơ Doanh nghiệp "${profile.name || "Đã đăng ký"}".`);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Hybrid Tax Lookup: Tra cứu tức thời Tên DN, Tỉnh thành và Địa chỉ qua API Cổng Quốc gia
  const handleLookupTaxCode = async () => {
    const rawTax = (survey.taxCode || "").trim();
    if (!rawTax) {
      showToast("Vui lòng nhập Mã số thuế trước khi tra cứu.", "error");
      return;
    }
    setIsLookingUpTax(true);
    try {
      const res = await lookupTaxCode(rawTax);
      if (res && res.found && res.name) {
        setSurvey((prev) => ({
          ...prev,
          companyName: res.name || prev.companyName,
          companyAddress: res.address || prev.companyAddress,
        }));
        if (res.province) {
          setScopeId(res.province);
        }
        showToast(`Đã tìm thấy thông tin: ${res.name}. Đã tự động điền vào phiếu!`);
      } else {
        showToast(res?.message || `Không tìm thấy thông tin cho MST ${rawTax}. Quý DN vui lòng điền thủ công.`, "error");
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi khi tra cứu mã số thuế từ máy chủ.", "error");
    } finally {
      setIsLookingUpTax(false);
    }
  };

  // Realtime instant calculation synchronized with 23 Industry Benchmarks
  const scoreResult = useMemo(() => {
    return calculateLocalScore(survey, industryCode);
  }, [survey, industryCode]);

  const currentBenchmark = INDUSTRY_BENCHMARKS[industryCode] || INDUSTRY_BENCHMARKS["C.28"];

  // Dữ liệu tham chiếu tự động tính toán
  const latestGdt = useMemo(() => {
    const list = survey.financialSeries || [];
    const sorted = [...list].sort((a, b) => b.year - a.year);
    return sorted[0]?.netRevenue || sorted[0]?.industrialOutputValue || 65000000000;
  }, [survey.financialSeries]);

  const latestDirectWorkers = useMemo(() => {
    const list = survey.financialSeries || [];
    const sorted = [...list].sort((a, b) => b.year - a.year);
    return sorted[0]?.directWorkersCount || survey.directWorkers || 110;
  }, [survey.financialSeries, survey.directWorkers]);

  const totalMachineryCost = useMemo(() => {
    return (survey.machineries || []).reduce((acc, m) => acc + (m.originalCost || 0), 0);
  }, [survey.machineries]);

  const updateSurvey = (patch: Partial<Tt17SurveyData>) => {
    setSurvey((prev) => ({ ...prev, ...patch }));
  };

  const handleAddMachinery = () => {
    if ((survey.machineries || []).length >= 3) {
      showToast("Theo Thông tư 17, doanh nghiệp chỉ cần kê khai tối đa 03 dây chuyền/thiết bị chính.", "error");
      return;
    }
    const newItem: MachineryItem = {
      name: "",
      quantity: 1,
      manufactureYear: 2021,
      startUsageYear: 2022,
      productName: "",
      designedCapacityYear: "",
    };
    updateSurvey({ machineries: [...(survey.machineries || []), newItem] });
  };

  const handleRemoveMachinery = (index: number) => {
    const list = survey.machineries.filter((_, i) => i !== index);
    updateSurvey({ machineries: list });
  };

  const handleUpdateMachinery = (index: number, patch: Partial<MachineryItem>) => {
    const list = survey.machineries.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateSurvey({ machineries: list });
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await saveAssessmentDraft({
        assessmentYear,
        industryCode,
        scopeId,
        surveyData: survey,
      });
      showToast("Đã lưu nháp thành công vào hệ thống!");
    } catch {
      showToast("Lỗi khi lưu nháp.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!survey.companyName?.trim()) {
      showToast("Vui lòng nhập Tên Doanh nghiệp trước khi nộp hồ sơ.", "error");
      setCurrentStep(1);
      return;
    }
    if (!survey.taxCode?.trim()) {
      showToast("Vui lòng nhập Mã số thuế trước khi nộp hồ sơ.", "error");
      setCurrentStep(1);
      return;
    }
    if (!survey.companyEmail?.trim()) {
      showToast("Vui lòng nhập Email liên hệ để nhận thông tin tài khoản và kết quả.", "error");
      setCurrentStep(1);
      return;
    }

    setSaving(true);
    try {
      const res = await submitAssessment({
        assessmentYear,
        industryCode,
        scopeId,
        enterpriseName: survey.companyName,
        taxCode: survey.taxCode,
        contactPerson: survey.contactPerson,
        contactEmail: survey.companyEmail,
        contactPhone: survey.companyPhone,
        surveyData: survey,
      });

      const creds =
        res.credentials ||
        (res.account
          ? {
              email: res.account.email,
              temporaryPassword: res.account.temporaryPassword || "NacenTech@2026",
              enterpriseCode: res.account.taxCode,
            }
          : undefined);

      setSubmitResult({
        id: res.id,
        surveyCode: res.id ? `TT17-${res.id.slice(0, 8).toUpperCase()}` : "TT17-SUBMITTED",
        companyName: survey.companyName || "Doanh nghiệp",
        autoProvisioned: !!res.autoProvisioned,
        credentials: creds,
      });

      showToast(res.message || "Đã nộp hồ sơ đánh giá và khởi tạo tài khoản thành công!");
      window.scrollTo({ top: 100, behavior: "smooth" });
    } catch (err: any) {
      showToast(err.message || "Lỗi khi nộp hồ sơ đánh giá.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (submitResult) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="surface-card max-w-3xl mx-auto p-8 sm:p-10 text-center space-y-6 shadow-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-sm">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-400/30">
              HỒ SƠ ĐÁNH GIÁ TRÌNH ĐỘ CÔNG NGHỆ ĐÃ TIẾP NHẬN (TT 17/2019/TT-BKHCN)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
              Nộp Phiếu Đánh Giá Công Nghệ Thành Công!
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-2 max-w-lg mx-auto leading-relaxed">
              Hệ thống NacenTwin đã tiếp nhận đầy đủ dữ liệu kê khai đánh giá trình độ và năng lực công nghệ sản xuất cho <strong>{submitResult.companyName}</strong> theo Thông tư 17/2019/TT-BKHCN.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-left max-w-lg mx-auto space-y-3.5 shadow-inner">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Mã hồ sơ đánh giá:</span>
              <span className="font-mono font-black text-brand-700 dark:text-cyan-400 text-sm">
                {submitResult.surveyCode}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Tổng điểm tính toán:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                {scoreResult.totalScore}/100 điểm ({scoreResult.classificationLabel})
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Dữ liệu đã được lưu trữ an toàn trong CSDL PostgreSQL và sẵn sàng đồng bộ sang Hội đồng Thẩm định Sở KH&CN.</span>
            </div>
          </div>

          {submitResult.autoProvisioned && submitResult.credentials && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-5 text-left max-w-lg mx-auto space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>TÀI KHOẢN DOANH NGHIỆP ĐÃ ĐƯỢC CẤP TỰ ĐỘNG</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Hệ thống đã tự động khởi tạo tài khoản Doanh nghiệp để bạn có thể theo dõi tiến độ thẩm định, tải báo cáo Phụ lục IV và nhận hỗ trợ đổi mới công nghệ:
              </p>
              <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Tên đăng nhập (Email):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{submitResult.credentials.email}</span>
                </div>
                {submitResult.credentials.temporaryPassword && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Mật khẩu tạm thời:</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                      {submitResult.credentials.temporaryPassword}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Vai trò hệ thống:</span>
                  <span className="font-bold text-brand-700 dark:text-cyan-400">Doanh nghiệp Sản xuất (Enterprise)</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                * Vui lòng lưu lại thông tin trên. Quý DN có thể đổi mật khẩu sau lần đăng nhập đầu tiên.
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <Link
              href={`/assessments/tt17/${submitResult.id}/report`}
              className="bg-brand-700 hover:bg-brand-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              Xem Báo Cáo Phụ Lục IV <ArrowRight className="w-4 h-4" />
            </Link>
            {submitResult.autoProvisioned ? (
              <Link
                href="/login"
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Đăng Nhập Ngay Vào Hệ Thống
              </Link>
            ) : (
              <Link
                href="/assessments/tt17"
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-2.5 rounded-xl font-bold text-xs border border-slate-300 dark:border-slate-700 transition flex items-center gap-2"
              >
                Quay Lại Dashboard Lịch Sử
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Background patterns */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[url('/innovation-hero-background.png')] bg-cover bg-bottom bg-no-repeat opacity-[0.08] dark:opacity-15 mix-blend-multiply"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(#3c5999_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-[0.04]"
      />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Toast */}
        {toastMsg && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-xl text-sm font-semibold flex items-center gap-2 animate-bounce transition ${
              toastMsg.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
            }`}
          >
            {toastMsg.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm mb-6">
          {/* Top Utility Bar: Navigation & Action Buttons */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            {/* Left: Breadcrumb & Standard Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/assessments/tt17"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-cyan-400 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Quay lại Dashboard Lịch Sử</span>
              </Link>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold text-xs border border-emerald-200/80 dark:border-emerald-800">
                <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Thông tư 17/2019/TT-BKHCN · 26 Tiêu Chí Đánh Giá</span>
              </div>
            </div>

            {/* Right: Currency Unit Selector & Action Tools */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Unit Selector Toggle */}
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center gap-0.5 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 px-1.5 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-500" /> Đơn vị:
                </span>
                <button
                  type="button"
                  onClick={() => setMoneyUnit("TY")}
                  className={`px-2 py-0.5 text-xs font-bold rounded-md transition ${
                    moneyUnit === "TY"
                      ? "bg-brand-700 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Nhập số tiền theo Tỷ VNĐ (khuyên dùng, ví dụ: 60)"
                >
                  Tỷ VNĐ
                </button>
                <button
                  type="button"
                  onClick={() => setMoneyUnit("TRIEU")}
                  className={`px-2 py-0.5 text-xs font-bold rounded-md transition ${
                    moneyUnit === "TRIEU"
                      ? "bg-brand-700 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Nhập số tiền theo Triệu VNĐ"
                >
                  Triệu VNĐ
                </button>
                <button
                  type="button"
                  onClick={() => setMoneyUnit("VND")}
                  className={`px-2 py-0.5 text-xs font-bold rounded-md transition ${
                    moneyUnit === "VND"
                      ? "bg-brand-700 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Nhập số tiền VNĐ đầy đủ"
                >
                  VNĐ
                </button>
              </div>

              {/* Reset Button */}
              <button
                type="button"
                onClick={() => {
                  setSurvey(INITIAL_SURVEY_DATA);
                  setIndustryCode("C.10");
                  showToast("Đã xóa trắng form về trạng thái ban đầu.", "success");
                }}
                className="h-8 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition"
                title="Xóa trắng mọi trường nhập liệu"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Xóa Trắng</span>
              </button>

              {/* Benchmark Sample Button */}
              <button
                type="button"
                onClick={() => {
                  setSurvey(SAMPLE_BENCHMARK_DAIHUNG);
                  setIndustryCode("C.10");
                  setMoneyUnit("TY");
                  showToast("Đã nạp bộ dữ liệu mẫu chuẩn TT17: CÔNG TY TNHH ĐẠI HƯNG (43 điểm, Kđb=0.42, Trung bình)!", "success");
                }}
                className="h-8 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-bold flex items-center gap-1 transition shadow-xs"
                title="Nạp dữ liệu mẫu benchmark kiểm chuẩn TT17"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Mẫu Đại Hưng (43đ)</span>
              </button>

              {/* Save Draft Button */}
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving}
                className="h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>Lưu Nháp</span>
              </button>
            </div>
          </div>

          {/* Bottom Title & Action Section: Button cùng hàng dịch sang bên phải ngoài cùng */}
          <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Kê Khai Đánh Giá Trình Độ & Năng Lực Công Nghệ Sản Xuất
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                Biểu mẫu thu thập số liệu thực tế từ Báo cáo tài chính & hiện trạng nhà máy. Hệ thống tự động đối soát với định mức ngành (C.10 - C.32), tự động tính toán 26 tiêu chí và cấp tài khoản Doanh nghiệp sau khi hoàn tất.
              </p>
            </div>

            {/* Final Submit Button - dịch bên phải ngoài cùng */}
            <div className="shrink-0 self-start md:self-center">
              <AppButton
                variant="primary"
                onClick={handleSubmit}
                disabled={saving}
                className="h-10 px-5 text-xs sm:text-sm font-bold shadow-sm hover:shadow transition flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                <span>Hoàn Tất & Nộp Hồ Sơ</span>
              </AppButton>
            </div>
          </div>
        </div>

        {/* Step Navigator Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-8">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`p-3 rounded-lg text-left transition border ${
                  isActive
                    ? "bg-brand-50 border-brand-700 text-brand-800 dark:bg-brand-950 dark:border-brand-700 dark:text-brand-300"
                    : isDone
                    ? "bg-slate-50 border-emerald-500 text-emerald-800 dark:bg-slate-800 dark:border-emerald-600 dark:text-emerald-300"
                    : "bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold truncate">{step.title}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form Wizard (2 cols wide) */}
          <div className="lg:col-span-2 space-y-6">
            {/* BƯỚC 1: MỤC A - THÔNG TIN CHUNG */}
            {currentStep === 1 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-700" />
                  <span>Mục A · Thông Tin Định Danh & Chung Của Doanh Nghiệp</span>
                </h2>

                {/* Khối định danh doanh nghiệp */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider">
                      1. Thông tin Định Danh Doanh Nghiệp (Hệ thống tự động cấp tài khoản khi nộp bài)
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Bắt buộc</span>
                  </div>

                  {isPrefilledFromSession && (
                    <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wide">
                          Tự động đồng bộ hồ sơ Doanh nghiệp đã đăng ký
                        </h4>
                        <p className="text-xs text-teal-700 dark:text-teal-300 mt-0.5">
                          Hệ thống đã tự động nhận diện và nạp sẵn thông tin doanh nghiệp từ CSDL. Quý Doanh nghiệp có thể tiến hành đánh giá mà không cần nhập lại từ đầu.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tt17-company-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tên Doanh Nghiệp (Pháp Nhân) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="tt17-company-name"
                        type="text"
                        placeholder="Ví dụ: Công ty Cổ phần Chế tạo Cơ khí Nam Á"
                        value={survey.companyName || ""}
                        onChange={(e) => updateSurvey({ companyName: e.target.value })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="tt17-tax-code" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Mã Số Thuế (MST) <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="tt17-tax-code"
                          type="text"
                          placeholder="Ví dụ: 0109988776"
                          value={survey.taxCode || ""}
                          onChange={(e) => updateSurvey({ taxCode: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleLookupTaxCode();
                            }
                          }}
                          className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-brand-500"
                        />
                        <button
                          type="button"
                          onClick={handleLookupTaxCode}
                          disabled={isLookingUpTax || !survey.taxCode?.trim()}
                          className="px-3.5 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-cyan-300 dark:hover:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-lg transition shadow-sm disabled:opacity-50 h-[42px]"
                          title="Tự động tra cứu Tên DN, Tỉnh thành và Địa chỉ theo MST"
                        >
                          {isLookingUpTax ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                          Tra cứu MST
                        </button>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                        Nhập MST và bấm Tra cứu để tự động nạp Tên DN, Tỉnh thành và Địa chỉ từ API Quốc gia.
                      </span>
                    </div>

                    <div>
                      <label htmlFor="tt17-contact-person" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Họ Tên Người Đại Diện / Liên Hệ Khảo Sát <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="tt17-contact-person"
                        type="text"
                        placeholder="Ví dụ: Trần Quốc Tuấn (Phó Giám đốc Kỹ thuật)"
                        value={survey.contactPerson || ""}
                        onChange={(e) => updateSurvey({ contactPerson: e.target.value })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="tt17-contact-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Email Liên Hệ (Nhận Báo Cáo & Tài Khoản) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="tt17-contact-email"
                        type="email"
                        placeholder="tuan.tq@nama-tech.vn"
                        value={survey.companyEmail || ""}
                        onChange={(e) => updateSurvey({ companyEmail: e.target.value })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="tt17-contact-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Số Điện Thoại Liên Hệ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="tt17-contact-phone"
                        type="tel"
                        placeholder="0988 776 655"
                        value={survey.companyPhone || ""}
                        onChange={(e) => updateSurvey({ companyPhone: e.target.value })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="tt17-scope-id" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tỉnh / Thành Phố Trụ Sở Chính (34 Tỉnh Trọng Điểm ĐMST)
                      </label>
                      {/* Searchable Combobox dạng Input: gõ để filter 34 tỉnh thành trọng điểm, chiều cao chuẩn h-[42px] */}
                      <SearchableInputCombobox
                        id="tt17-scope-id"
                        value={scopeId}
                        onChange={(val) => setScopeId(val)}
                        options={PROVINCES_34}
                        placeholder="Gõ để tìm kiếm trong 34 Tỉnh/Thành..."
                      />
                    </div>

                    <div>
                      <label htmlFor="tt17-company-type" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Loại Hình Doanh Nghiệp (Mục A.7 TT17)
                      </label>
                      <select
                        id="tt17-company-type"
                        value={survey.companyType || "Công ty TNHH"}
                        onChange={(e) => updateSurvey({ companyType: e.target.value })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 leading-normal"
                      >
                        <option value="Công ty TNHH">Công ty TNHH</option>
                        <option value="Công ty Cổ phần">Công ty Cổ phần</option>
                        <option value="Doanh nghiệp tư nhân">Doanh nghiệp tư nhân (DNTN)</option>
                        <option value="Doanh nghiệp nước ngoài (FDI)">Doanh nghiệp có vốn đầu tư nước ngoài (FDI)</option>
                        <option value="Doanh nghiệp nhà nước">Doanh nghiệp Nhà nước</option>
                        <option value="Công ty Liên doanh / Hợp danh">Công ty Liên doanh / Hợp danh</option>
                        <option value="Hợp tác xã">Hợp tác xã / Liên hiệp HTX</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="tt17-company-address" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Địa Chỉ Trụ Sở Chính Chi Tiết
                      </label>
                      <input
                        id="tt17-company-address"
                        type="text"
                        placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                        value={survey.companyAddress || ""}
                        onChange={(e) => updateSurvey({ companyAddress: e.target.value })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="tt17-facility-address-1" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Địa Chỉ Cơ Sở Sản Xuất 1 (Nhà Xưởng Chính - Mục A.10 TT17)
                      </label>
                      <div className="relative">
                        <input
                          id="tt17-facility-address-1"
                          type="text"
                          placeholder="Địa chỉ nhà xưởng/nhà máy chính sản xuất..."
                          value={survey.productionFacilityAddress1 ?? (survey.companyAddress || "")}
                          onChange={(e) => updateSurvey({ productionFacilityAddress1: e.target.value })}
                          className="w-full h-[42px] pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                        />
                        <Factory className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Mục A.10: Accordion mở rộng thêm Cơ sở 2 & Cơ sở 3 */}
                  <div className="pt-1">
                    <button
                      type="button"
                      id="tt17-btn-toggle-facilities"
                      onClick={() => setShowExtraFacilities(!showExtraFacilities)}
                      className="text-xs font-bold text-brand-700 hover:text-brand-800 dark:text-cyan-400 flex items-center gap-1.5 transition py-1"
                    >
                      <Factory className="w-3.5 h-3.5" />
                      <span>{showExtraFacilities ? "Thu gọn danh sách cơ sở sản xuất phụ" : "+ Thêm Địa Chỉ Cơ Sở Sản Xuất 2 & 3 (Theo Mục A.10 Phụ Lục I TT17)"}</span>
                      {showExtraFacilities ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {showExtraFacilities && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Địa Chỉ Cơ Sở Sản Xuất 2 (Nhà xưởng / Chi nhánh phụ)
                          </label>
                          <input
                            type="text"
                            placeholder="Địa chỉ nhà xưởng 2..."
                            value={survey.productionFacilityAddress2 || ""}
                            onChange={(e) => updateSurvey({ productionFacilityAddress2: e.target.value })}
                            className="w-full h-[40px] px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Địa Chỉ Cơ Sở Sản Xuất 3 (Nhà xưởng / Chi nhánh phụ)
                          </label>
                          <input
                            type="text"
                            placeholder="Địa chỉ nhà xưởng 3..."
                            value={survey.productionFacilityAddress3 || ""}
                            onChange={(e) => updateSurvey({ productionFacilityAddress3: e.target.value })}
                            className="w-full h-[40px] px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 md:col-span-2">
                          * Kê khai các nhà xưởng, cơ sở sản xuất trực tiếp phục vụ công tác thẩm định thực địa của Hội đồng chuyên gia theo Mục A.10 Phụ lục I TT17.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-3">
                    2. Lựa Chọn Nhóm Ngành & Định Mức Kỹ Thuật (Mục A.9 TT17)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Năm Đánh Giá
                    </label>
                    <input
                      type="number"
                      value={assessmentYear}
                      onChange={(e) => setAssessmentYear(parseInt(e.target.value) || 2026)}
                      className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="tt17-industry-code" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mã Ngành Chế Biến, Chế Tạo (Ngành 1 Chính - Quyết Định K_chuẩn) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="tt17-industry-code"
                      value={industryCode}
                      onChange={(e) => setIndustryCode(e.target.value)}
                      className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-brand-500 leading-normal"
                    >
                      {Object.values(INDUSTRY_BENCHMARKS).map((bench) => (
                        <option key={bench.industryCode} value={bench.industryCode}>
                          {bench.industryCode} - {bench.industryName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mục A.9: Accordion mở rộng thêm Ngành phụ 2 & Ngành phụ 3 */}
                <div className="pt-1">
                  <button
                    type="button"
                    id="tt17-btn-toggle-industries"
                    onClick={() => setShowExtraIndustries(!showExtraIndustries)}
                    className="text-xs font-bold text-brand-700 hover:text-brand-800 dark:text-cyan-400 flex items-center gap-1.5 transition py-1"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{showExtraIndustries ? "Thu gọn danh sách ngành phụ" : "+ Thêm Ngành Hoạt Động SXKD 2 & 3 (Theo Mục A.9 Phụ Lục I TT17)"}</span>
                    {showExtraIndustries ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {showExtraIndustries && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Ngành 2 (Tạo doanh thu / Lao động lớn thứ 2)
                        </label>
                        <select
                          value={survey.secondaryIndustry2 || ""}
                          onChange={(e) => updateSurvey({ secondaryIndustry2: e.target.value })}
                          className="w-full h-[40px] px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                        >
                          <option value="">-- Chưa chọn / Không có ngành 2 --</option>
                          {Object.values(INDUSTRY_BENCHMARKS).map((bench) => (
                            <option key={bench.industryCode} value={bench.industryCode}>
                              {bench.industryCode} - {bench.industryName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Ngành 3 (Tạo doanh thu / Lao động lớn thứ 3)
                        </label>
                        <select
                          value={survey.secondaryIndustry3 || ""}
                          onChange={(e) => updateSurvey({ secondaryIndustry3: e.target.value })}
                          className="w-full h-[40px] px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                        >
                          <option value="">-- Chưa chọn / Không có ngành 3 --</option>
                          {Object.values(INDUSTRY_BENCHMARKS).map((bench) => (
                            <option key={bench.industryCode} value={bench.industryCode}>
                              {bench.industryCode} - {bench.industryName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-[11px] text-slate-500 md:col-span-2">
                        * Theo Mục A.9 Phụ lục I TT17: Liệt kê tối đa 03 ngành chế biến chế tạo theo thứ tự giảm dần. Hệ thống chỉ sử dụng <strong>Ngành 1</strong> để đối soát 4 hệ số chuẩn ngành (K_chuẩn 1..4); Ngành 2 &amp; 3 phục vụ thống kê và xuất hồ sơ in nộp Sở KH&CN.
                      </p>
                    </div>
                  )}
                </div>

                {/* Card hiển thị hệ số chuẩn của ngành đang chọn */}
                <div className="p-4 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 space-y-2">
                  <div className="flex items-center gap-2 text-brand-900 dark:text-cyan-300 text-xs font-bold">
                    <SlidersHorizontal className="w-4 h-4 text-brand-700 dark:text-cyan-400" />
                    <span>Bộ Định Mức Tham Chiếu Chuẩn Cho Nhóm Ngành: {currentBenchmark.industryName}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-brand-100 dark:border-brand-900">
                      <span className="text-slate-500 block text-xs">K_chuẩn 1 (Tự động hóa):</span>
                      <span className="font-mono font-bold text-brand-800 dark:text-cyan-300 text-sm">
                        {currentBenchmark.kChuan1} triệu/LĐ
                      </span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-brand-100 dark:border-brand-900">
                      <span className="text-slate-500 block text-xs">K_chuẩn 2 (Năng lượng):</span>
                      <span className="font-mono font-bold text-brand-800 dark:text-cyan-300 text-sm">
                        {(currentBenchmark.kChuan2 * 100).toFixed(0)}% DT
                      </span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-brand-100 dark:border-brand-900">
                      <span className="text-slate-500 block text-xs">K_chuẩn 3 (Nguyên liệu):</span>
                      <span className="font-mono font-bold text-brand-800 dark:text-cyan-300 text-sm">
                        {(currentBenchmark.kChuan3 * 100).toFixed(0)}% DT
                      </span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-brand-100 dark:border-brand-900">
                      <span className="text-slate-500 block text-xs">K_chuẩn 4 (NSLĐ chuẩn):</span>
                      <span className="font-mono font-bold text-brand-800 dark:text-cyan-300 text-sm">
                        {currentBenchmark.kChuan4} triệu/người
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tổng Nguồn Vốn Theo BCTC Cuối Năm
                    </label>
                    <FormattedMoneyInput
                      value={survey.totalCapital}
                      onChange={(val) => updateSurvey({ totalCapital: val })}
                      unit={moneyUnit}
                    />
                    <span className="text-xs text-slate-500 mt-1 block">
                      Lấy tại <strong>Mã số 440 (Tổng cộng nguồn vốn)</strong> trên Bảng CĐKT: <strong>{formatVietnameseCurrencyText(survey.totalCapital)}</strong>.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tổng Số Lao Động Bình Quân (M)
                    </label>
                    <input
                      type="number"
                      value={survey.totalWorkforce}
                      onChange={(e) => updateSurvey({ totalWorkforce: parseInt(e.target.value) || 0 })}
                      className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                    />
                    <span className="text-xs text-slate-500 mt-1 block">
                      Tổng số người làm việc trong năm liền kề (<strong>không tính lao động thời vụ dưới 03 tháng</strong> theo Khoản 8 Điều 2 TT17).
                    </span>
                  </div>
                </div>

                {/* Badge tự động phân loại Quy mô Doanh nghiệp theo Nghị định 39/2018 & Điều 7 TT17 */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Phân loại Quy mô DN (Mục A.8 & Điều 7 TT17):</strong>{" "}
                      {survey.totalCapital >= 1_000_000_000_000 && survey.totalWorkforce >= 3000
                        ? "Doanh nghiệp Lớn Nhóm 1 (Vốn ≥ 1.000 tỷ & LĐ ≥ 3.000 người)"
                        : survey.totalCapital >= 100_000_000_000 && survey.totalWorkforce >= 200
                        ? "Doanh nghiệp Lớn Nhóm 2 (Vốn ≥ 100 tỷ & LĐ ≥ 200 người)"
                        : "Doanh nghiệp Nhỏ và Vừa (SME)"}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full font-bold bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shrink-0">
                    {survey.totalCapital >= 1_000_000_000_000 && survey.totalWorkforce >= 3000
                      ? "Định mức R&D: H5 ≥ 1.0%, K_r&d ≥ 0.1%"
                      : survey.totalCapital >= 100_000_000_000 && survey.totalWorkforce >= 200
                      ? "Định mức R&D: H5 ≥ 2.5%, K_r&d ≥ 0.5%"
                      : "Định mức R&D SME: H5 ≥ 5.0%, K_r&d ≥ 1.0%"}
                  </span>
                </div>
              </div>
            )}

            {/* BƯỚC 2: MỤC B - NHÓM T (THIẾT BỊ & CÔNG NGHỆ) */}
            {/* BƯỚC 2: MỤC B - THÔNG TIN THIẾT BỊ, CÔNG NGHỆ CỦA DOANH NGHIỆP (PHỤ LỤC I TT17) */}
            {currentStep === 2 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-brand-700" />
                    <span>Mục B · Thông Tin Thiết Bị, Công Nghệ Của Doanh Nghiệp (Phụ Lục I TT17)</span>
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-50 text-brand-800 border border-brand-200">
                    Đóng góp Nhóm T: {scoreResult.scoreT} / 30 điểm
                  </span>
                </h2>

                {/* Hướng dẫn kế toán */}
                <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex items-start gap-2.5 text-xs text-teal-900 dark:text-teal-300">
                  <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Hướng dẫn lấy số liệu từ Báo cáo Tài chính:</span> Quý Doanh nghiệp tra cứu trực tiếp trên <strong>Bảng Cân đối Kế toán (Mẫu B01-DN)</strong> tại <strong>Mã số 211</strong> (Nguyên giá TSCĐ hữu hình), <strong>Mã số 212</strong> (Giá trị hao mòn lũy kế) và <strong>Mã số 210</strong> (Giá trị còn lại = Mã 211 trừ Mã 212).
                  </div>
                </div>

                {survey.originalCostEquipment > 0 && survey.currentBookValueEquipment > survey.originalCostEquipment && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Cảnh báo: Giá trị còn lại (G_sx) đang lớn hơn Tổng nguyên giá ban đầu (G_bđ). Vui lòng kiểm tra lại chỉ tiêu Mã 210 và Mã 211 trên BCTC.</span>
                  </div>
                )}

                {/* Khối các chỉ tiêu giá trị thiết bị (Mục B.2 -> B.6) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 min-h-[38px] flex items-end pb-1 leading-snug">
                        Mục B.2 · Tổng Nguyên Giá Máy Móc Thiết Bị Ban Đầu (G_bđ - TC01)
                      </label>
                      <FormattedMoneyInput
                        value={survey.originalCostEquipment}
                        onChange={(val) => updateSurvey({ originalCostEquipment: val })}
                        unit={moneyUnit}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mt-1 min-h-[22px]">
                      <span className="truncate">Mã số 211 trên Bảng CĐKT: <strong>{formatVietnameseCurrencyText(survey.originalCostEquipment)}</strong></span>
                      {totalMachineryCost > 0 && (
                        <button
                          type="button"
                          onClick={() => updateSurvey({ originalCostEquipment: totalMachineryCost })}
                          className="font-bold text-brand-700 hover:underline dark:text-cyan-400 shrink-0"
                          title="Tính tổng nguyên giá từ danh sách máy móc xưởng kê khai bên dưới"
                        >
                          ⚡ Lấy từ máy móc ({formatVietnameseCurrencyText(totalMachineryCost)})
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 min-h-[38px] flex items-end pb-1 leading-snug">
                        Mục B.3 · Giá Trị Còn Lại Của Máy Móc Thiết Bị (G_sx - TC01 &amp; TC02)
                      </label>
                      <FormattedMoneyInput
                        value={survey.currentBookValueEquipment}
                        onChange={(val) => updateSurvey({ currentBookValueEquipment: val })}
                        unit={moneyUnit}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-1 min-h-[22px] flex items-center">
                      <span className="truncate">Mã 210 = Nguyên giá trừ Hao mòn: <strong>{formatVietnameseCurrencyText(survey.currentBookValueEquipment)}</strong> (Khấu hao K_kh: {survey.originalCostEquipment > 0 ? (((survey.originalCostEquipment - survey.currentBookValueEquipment) / survey.originalCostEquipment) * 100).toFixed(1) : 0}%).</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 min-h-[38px] flex items-end pb-1 leading-snug">
                        Mục B.4 · Giá Trị Máy Móc Mua Mới Mở Rộng 3 Năm (G_tbm1 - TC03)
                      </label>
                      <FormattedMoneyInput
                        value={survey.newInvestEquipment3Years}
                        onChange={(val) => updateSurvey({ newInvestEquipment3Years: val })}
                        unit={moneyUnit}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-1 min-h-[22px] flex items-center">
                      <span className="truncate">Thiết bị <strong>mới 100%</strong> lắp đặt mở rộng SX: <strong>{formatVietnameseCurrencyText(survey.newInvestEquipment3Years)}</strong>.</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 min-h-[38px] flex items-end pb-1 leading-snug">
                        Mục B.5 · Giá Trị Máy Móc Mua Thay Thế Nâng Cấp 3 Năm (G_tbm2 - TC03)
                      </label>
                      <FormattedMoneyInput
                        value={survey.replacementEquipment3Years}
                        onChange={(val) => updateSurvey({ replacementEquipment3Years: val })}
                        unit={moneyUnit}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-1 min-h-[22px] flex items-center">
                      <span className="truncate">Thiết bị <strong>mới 100%</strong> thay thế/bảo dưỡng: <strong>{formatVietnameseCurrencyText(survey.replacementEquipment3Years)}</strong>.</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between md:col-span-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 min-h-[38px] flex items-end pb-1 leading-snug">
                        Mục B.6 · Tổng Giá Trị Thiết Bị Liên Quan Số Hóa Quá Trình Sản Xuất (G_sh - TC04/TC10)
                      </label>
                      <FormattedMoneyInput
                        value={survey.digitalEquipmentValue}
                        onChange={(val) => updateSurvey({ digitalEquipmentValue: val })}
                        unit={moneyUnit}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-1 min-h-[22px] flex items-center">
                      <span className="truncate">Tổng giá trị máy công cụ điều khiển CNC, PLC, robot, thiết bị đo lường tự động: <strong>{formatVietnameseCurrencyText(survey.digitalEquipmentValue)}</strong>.</span>
                    </div>
                  </div>
                </div>

                {/* Mục B.I: Bảng Dây chuyền thiết bị, máy móc sản xuất chính chuẩn Phụ lục I TT17 */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                          Mục B.I · Dây Chuyền Thiết Bị, Máy Móc, Công Nghệ Sản Xuất Chính
                        </h3>
                        <span className="whitespace-nowrap text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950/60 dark:text-cyan-300 dark:border-brand-800">
                          Mục B.I Phụ Lục I TT17
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        💡 <strong>Quy định Thông tư 17:</strong> Kê khai <strong>tối đa 03 dây chuyền hoặc máy móc sản xuất chính</strong> tạo ra sản lượng lớn nhất. Cung cấp căn cứ đối soát thực địa và xác định công suất thiết kế P (phục vụ tính chỉ số OEE tại TC15).
                      </p>
                    </div>
                    <button
                      type="button"
                      id="tt17-btn-add-machinery"
                      onClick={handleAddMachinery}
                      disabled={(survey.machineries || []).length >= 3}
                      className="px-3.5 py-2 rounded-lg bg-brand-700 text-white text-xs font-semibold hover:bg-brand-800 disabled:opacity-50 flex items-center gap-1.5 shadow-xs transition shrink-0 self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Thiết Bị Chính ({(survey.machineries || []).length}/3)</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-2.5 w-10 text-center">STT</th>
                          <th className="p-2.5 min-w-[220px]">
                            <div>Tên Thiết Bị, Máy Móc, Công Nghệ <span className="text-rose-500">*</span></div>
                            <span className="text-[11px] font-normal text-slate-500 block">Ví dụ: Dây chuyền dập liên hoàn, Máy tiện CNC...</span>
                          </th>
                          <th className="p-2.5 w-20 text-center">
                            <div>Số Lượng</div>
                            <span className="text-[11px] font-normal text-slate-500 block">Bộ / Cái</span>
                          </th>
                          <th className="p-2.5 w-24 text-center">
                            <div>Năm SX</div>
                            <span className="text-[11px] font-normal text-slate-500 block">Chế tạo</span>
                          </th>
                          <th className="p-2.5 w-24 text-center">
                            <div>Năm Sử Dụng</div>
                            <span className="text-[11px] font-normal text-slate-500 block">Đưa vào xưởng</span>
                          </th>
                          <th className="p-2.5 min-w-[180px]">
                            <div>Tên Sản Phẩm / Bán SP</div>
                            <span className="text-[11px] font-normal text-slate-500 block">Sản phẩm do máy tạo ra</span>
                          </th>
                          <th className="p-2.5 min-w-[160px]">
                            <div>Sản Lượng Thiết Kế (P)</div>
                            <span className="text-[11px] font-normal text-slate-500 block">Tối đa/năm (sp, tấn...)</span>
                          </th>
                          <th className="p-2.5 w-12 text-center">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {(survey.machineries || []).map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                            <td className="p-2.5 text-center font-bold text-slate-500 bg-slate-50/60 dark:bg-slate-800/40">
                              {idx + 1}
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={m.name}
                                onChange={(e) => handleUpdateMachinery(idx, { name: e.target.value })}
                                placeholder="Nhập tên dây chuyền / máy móc chính..."
                                className="w-full h-[38px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-brand-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="1"
                                value={m.quantity || 1}
                                onChange={(e) => handleUpdateMachinery(idx, { quantity: parseInt(e.target.value) || 1 })}
                                className="w-full h-[38px] px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-center font-semibold focus:ring-2 focus:ring-brand-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={m.manufactureYear || 2020}
                                onChange={(e) => handleUpdateMachinery(idx, { manufactureYear: parseInt(e.target.value) || 2020 })}
                                className="w-full h-[38px] px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-center focus:ring-2 focus:ring-brand-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={m.startUsageYear || 2021}
                                onChange={(e) => handleUpdateMachinery(idx, { startUsageYear: parseInt(e.target.value) || 2021 })}
                                className="w-full h-[38px] px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-center focus:ring-2 focus:ring-brand-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={m.productName || ""}
                                onChange={(e) => handleUpdateMachinery(idx, { productName: e.target.value })}
                                placeholder="Ví dụ: Linh kiện dập, Chi tiết đúc..."
                                className="w-full h-[38px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={m.designedCapacityYear || ""}
                                onChange={(e) => handleUpdateMachinery(idx, { designedCapacityYear: e.target.value })}
                                placeholder="Ví dụ: 100.000 sp/năm"
                                className="w-full h-[38px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-brand-500"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveMachinery(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                title="Xóa dòng thiết bị này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(survey.machineries || []).length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 mt-2">
                      Chưa có thiết bị nào trong danh sách. Bấm <strong>"Thêm Thiết Bị"</strong> ở trên để thêm dây chuyền chính.
                    </div>
                  )}
                </div>

                {/* Mục B.7: Công nghệ được chuyển giao và giá trị hợp đồng chuẩn Phụ lục I TT17 & TC11 */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                          Mục B.7 · Công Nghệ Được Chuyển Giao &amp; Giá Trị Hợp Đồng (Trong 3 Năm Gần Nhất)
                        </h3>
                        <span className="text-[11px] font-semibold text-brand-700 dark:text-cyan-400 bg-brand-50 dark:bg-brand-950/80 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800">
                          Phụ Lục I TT17 (Trang 24) · Tiêu Chí TC11 (Tối đa 4.0đ)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Theo quy định Mục B.7 Phụ lục I TT 17/2019/TT-BKHCN: Doanh nghiệp kê khai các loại công nghệ được nhận chuyển giao và tổng giá trị hợp đồng CGCN trong 3 năm gần nhất.
                      </p>
                    </div>
                  </div>

                  {/* 7.1. Loại công nghệ */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      7.1. Loại công nghệ được chuyển giao (chọn các ô tương ứng):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                      {[
                        { key: "dong_bo", label: "Dây chuyền, thiết bị công nghệ đồng bộ (+1.0đ)" },
                        { key: "ban_quyen", label: "Bản quyền hoặc cấp phép (li-xăng) công nghệ (+2.0đ)" },
                        { key: "cai_tien", label: "Thiết bị, công nghệ cụ thể để cải tiến và tích hợp (+3.0đ)" },
                        { key: "sang_che", label: "Phát minh, sáng chế hoặc giải pháp hữu ích (+4.0đ)" },
                      ].map((item) => {
                        const checked = survey.transferredTechTypes.includes(item.key);
                        return (
                          <label
                            key={item.key}
                            className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                              checked
                                ? "bg-brand-50/80 dark:bg-brand-950/50 border-brand-500 text-brand-900 dark:text-cyan-200 font-semibold shadow-xs"
                                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const list = e.target.checked
                                  ? [...survey.transferredTechTypes, item.key]
                                  : survey.transferredTechTypes.filter((x) => x !== item.key);
                                updateSurvey({ transferredTechTypes: list });
                              }}
                              className="mt-0.5 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
                            />
                            <span className="leading-snug">{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* 7.2. Tổng giá trị hợp đồng */}
                  <div className="pt-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      7.2. Tổng giá trị hợp đồng chuyển giao công nghệ trong 3 năm gần nhất (G_cg)
                    </label>
                    <div className="max-w-md">
                      <FormattedMoneyInput
                        value={survey.transferredTechValue}
                        onChange={(val) => updateSurvey({ transferredTechValue: val })}
                        unit={moneyUnit}
                      />
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Tổng giá trị: <strong>{formatVietnameseCurrencyText(survey.transferredTechValue)}</strong>. <em>(Hướng dẫn TT17: Ghi tổng giá trị hợp đồng CGCN trong 3 năm gần nhất đối với hợp đồng trả một lần; hoặc tổng giá trị phải trả trong 3 năm đối với hợp đồng trả theo % doanh thu).</em>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* BƯỚC 3: MỤC C - THÔNG TIN SẢN XUẤT KINH DOANH (PHỤ LỤC I TT17) */}
            {currentStep === 3 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      Mục C · Thông Tin Hoạt Động Sản Xuất &amp; Kinh Doanh 3 Năm (Phụ Lục I TT17)
                    </span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                    Đóng góp Nhóm E: {scoreResult.scoreE} / 20 điểm
                  </span>
                </div>

                {/* Mục C.1: Bảng chuỗi số liệu 3 năm */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                        Mục C.1 · Bảng Số Liệu Sản Xuất &amp; Kinh Doanh 3 Năm Liền Kề (TC07 &amp; TC08)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Trích xuất từ Báo cáo kết quả hoạt động kinh doanh (Mẫu B02-DN) &amp; Báo cáo thống kê sản xuất.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-3 w-16 text-center">Năm</th>
                          <th className="p-3 min-w-[170px]">
                            <div>Giá Trị Sản Xuất (G_tts)</div>
                            <span className="text-xs font-normal text-slate-500 block">Báo cáo thống kê SX</span>
                          </th>
                          <th className="p-3 min-w-[170px]">
                            <div>Doanh Thu Thuần (G_dt)</div>
                            <span className="text-xs font-normal text-slate-500 block">Mã số 10 - KQKD</span>
                          </th>
                          <th className="p-3 min-w-[120px]">
                            <div>LĐ Sản Xuất (M_tt)</div>
                            <span className="text-xs font-normal text-slate-500 block">Công nhân trực tiếp</span>
                          </th>
                          <th className="p-3 min-w-[170px]">
                            <div>Tổng Chi Phí SXKD (G_cp)</div>
                            <span className="text-xs font-normal text-slate-500 block">Mã 11 + 22 + 25 + 26</span>
                          </th>
                          <th className="p-3 min-w-[130px] text-right">
                            <div>NSLĐ Bình Quân</div>
                            <span className="text-xs font-normal text-slate-500 block">G_tts / M_tt</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {survey.financialSeries.map((item, idx) => {
                          const outputVal = item.industrialOutputValue > 0 ? item.industrialOutputValue : item.netRevenue;
                          const nslđ = item.directWorkersCount > 0 ? outputVal / item.directWorkersCount : 0;
                          return (
                            <tr key={item.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                              <td className="p-3 font-bold text-center text-slate-900 dark:text-white bg-slate-50/80 dark:bg-slate-800/40">
                                {item.year}
                              </td>
                              <td className="p-2.5">
                                <FormattedMoneyInput
                                  value={item.industrialOutputValue}
                                  onChange={(val) => {
                                    const list = [...survey.financialSeries];
                                    list[idx].industrialOutputValue = val;
                                    updateSurvey({ financialSeries: list });
                                  }}
                                  unit={moneyUnit}
                                />
                              </td>
                              <td className="p-2.5">
                                <FormattedMoneyInput
                                  value={item.netRevenue}
                                  onChange={(val) => {
                                    const list = [...survey.financialSeries];
                                    list[idx].netRevenue = val;
                                    updateSurvey({ financialSeries: list });
                                  }}
                                  unit={moneyUnit}
                                />
                              </td>
                              <td className="p-2.5">
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.directWorkersCount}
                                    onChange={(e) => {
                                      const list = [...survey.financialSeries];
                                      list[idx].directWorkersCount = parseInt(e.target.value) || 0;
                                      updateSurvey({ financialSeries: list });
                                    }}
                                    className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold text-right pr-12 focus:ring-2 focus:ring-brand-500"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                                    người
                                  </span>
                                </div>
                              </td>
                              <td className="p-2.5">
                                <FormattedMoneyInput
                                  value={item.totalCosts || 0}
                                  onChange={(val) => {
                                    const list = [...survey.financialSeries];
                                    list[idx].totalCosts = val;
                                    updateSurvey({ financialSeries: list });
                                  }}
                                  unit={moneyUnit}
                                />
                              </td>
                              <td className="p-3 text-right">
                                <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-md text-xs">
                                  <TrendingUp className="w-3 h-3" />
                                  {formatVietnameseCurrencyText(Math.round(nslđ))}/người
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Tỷ lệ sử dụng công suất thiết kế / OEE (Mục C.1 R053-R054 Phụ lục I TT17 & TC15 Điều 6 Khoản 3) */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 mt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Mục C.1 · Tỷ Lệ Khai Thác Công Suất Thiết Kế / OEE (P_tt / P - TC15 / Điều 6 Khoản 3 TT17)
                      </label>
                      <span className="text-xs text-brand-700 dark:text-cyan-400 font-semibold">Chọn nhanh theo mức OEE:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "≥ 85% (5.0đ)", val: 90 },
                        { label: "70 - 85% (4.0đ)", val: 75 },
                        { label: "60 - 70% (3.0đ)", val: 65 },
                        { label: "45 - 60% (2.0đ)", val: 50 },
                        { label: "< 45% (1.0đ)", val: 40 },
                      ].map((preset) => {
                        const currentP = survey.financialSeries?.[survey.financialSeries.length - 1]?.designedCapacity || 100;
                        const currentPtt = survey.financialSeries?.[survey.financialSeries.length - 1]?.actualOutput || 85;
                        const currentOee = currentP > 0 ? (currentPtt / currentP) * 100 : 75;
                        const isSelected = Math.abs(currentOee - preset.val) <= 5;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              const list = [...survey.financialSeries];
                              const lastIdx = list.length - 1;
                              if (lastIdx >= 0) {
                                list[lastIdx].designedCapacity = 100;
                                list[lastIdx].actualOutput = preset.val;
                                updateSurvey({ financialSeries: list });
                              }
                            }}
                            className={`px-2.5 py-1 text-xs rounded-md font-medium border transition ${
                              isSelected
                                ? "bg-brand-700 text-white border-brand-700 shadow-sm"
                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-400"
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs text-slate-500 block">
                      Tỷ lệ sản lượng thực tế bình quân 3 năm so với công suất thiết kế: <strong>{(((survey.financialSeries?.[survey.financialSeries.length - 1]?.actualOutput || 85) / (survey.financialSeries?.[survey.financialSeries.length - 1]?.designedCapacity || 100)) * 100).toFixed(0)}%</strong> (&ge; 85% đạt 5.0đ tối đa theo Điều 6 Khoản 3 TT17).
                    </span>
                  </div>
                </div>

                {/* Mục C.2: Danh mục sản phẩm chủ lực & Tiêu chuẩn chất lượng */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-emerald-600" />
                        Mục C.2 · Danh Mục Sản Phẩm Chủ Lực (Tối Đa 03 Sản Phẩm Tạo Doanh Thu Cao Nhất)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Theo quy định Mục C.2 Phụ lục I TT 17/2019/TT-BKHCN: Doanh nghiệp kê khai tối đa 03 sản phẩm chủ lực tạo doanh thu cao nhất và tiêu chuẩn chất lượng đáp ứng.
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 self-start sm:self-auto">
                      Phụ Lục I TT17 (Trang 24–25)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Sản phẩm 1 */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          1. Sản phẩm chủ lực 1 (Cao nhất)
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Bắt buộc
                        </span>
                      </div>
                      <input
                        type="text"
                        value={survey.mainProduct1Name || ""}
                        onChange={(e) => updateSurvey({ mainProduct1Name: e.target.value })}
                        placeholder="Ví dụ: Gạo thơm xuất khẩu ST25..."
                        className="w-full h-[38px] px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 whitespace-nowrap">Tỷ trọng DT:</span>
                        <div className="relative flex-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={survey.mainProduct1Share ?? ""}
                            onChange={(e) => updateSurvey({ mainProduct1Share: parseFloat(e.target.value) || 0 })}
                            placeholder="60"
                            className="w-full h-[32px] px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-right pr-6"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Sản phẩm 2 */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          2. Sản phẩm chủ lực 2
                        </span>
                        <span className="text-[10px] text-slate-400">Tùy chọn</span>
                      </div>
                      <input
                        type="text"
                        value={survey.mainProduct2Name || ""}
                        onChange={(e) => updateSurvey({ mainProduct2Name: e.target.value })}
                        placeholder="Ví dụ: Gạo tấm chất lượng cao..."
                        className="w-full h-[38px] px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 whitespace-nowrap">Tỷ trọng DT:</span>
                        <div className="relative flex-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={survey.mainProduct2Share ?? ""}
                            onChange={(e) => updateSurvey({ mainProduct2Share: parseFloat(e.target.value) || 0 })}
                            placeholder="25"
                            className="w-full h-[32px] px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-right pr-6"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Sản phẩm 3 */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          3. Sản phẩm chủ lực 3
                        </span>
                        <span className="text-[10px] text-slate-400">Tùy chọn</span>
                      </div>
                      <input
                        type="text"
                        value={survey.mainProduct3Name || ""}
                        onChange={(e) => updateSurvey({ mainProduct3Name: e.target.value })}
                        placeholder="Ví dụ: Cám gạo trích ly..."
                        className="w-full h-[38px] px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 whitespace-nowrap">Tỷ trọng DT:</span>
                        <div className="relative flex-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={survey.mainProduct3Share ?? ""}
                            onChange={(e) => updateSurvey({ mainProduct3Share: parseFloat(e.target.value) || 0 })}
                            placeholder="15"
                            className="w-full h-[32px] px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-right pr-6"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tiêu chuẩn chất lượng sản phẩm đạt được (TC07) */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 min-h-[30px] flex items-end pb-1 leading-snug">
                      Tiêu chuẩn chất lượng sản phẩm đạt được (TC07 - Tối đa 4.0 điểm)
                    </label>
                    <select
                      value={survey.mainProductStandard}
                      onChange={(e) => updateSurvey({ mainProductStandard: e.target.value as any })}
                      className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 leading-normal"
                    >
                      <option value="co_so_vuot_quoc_te">Tiêu chuẩn cơ sở vượt Tiêu chuẩn Quốc tế / CE / FDA / JIS (4.0đ)</option>
                      <option value="quoc_te">Đạt tiêu chuẩn Quốc tế ISO / IEC / Quy chuẩn khu vực (3.0đ)</option>
                      <option value="quoc_gia">Đạt Tiêu chuẩn Quốc gia TCVN / QCVN (2.0đ)</option>
                      <option value="co_so">Tiêu chuẩn cơ sở (TCCS) tự công bố (1.0đ)</option>
                    </select>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Mức tiêu chuẩn chất lượng cao nhất mà sản phẩm chủ lực của doanh nghiệp đáp ứng theo Mục C.2 Phụ lục I TT17.
                    </span>
                  </div>
                </div>

                {/* Mục C.3: Khả năng bảo dưỡng, sửa chữa máy móc thiết bị */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                    Mục C.3 · Khả Năng Bảo Dưỡng, Sửa Chữa Máy Móc, Trang Thiết Bị (TC10 - 3.0 điểm)
                  </label>
                  <select
                    value={survey.maintenanceLevel}
                    onChange={(e) => updateSurvey({ maintenanceLevel: (parseInt(e.target.value) || 2) as any })}
                    className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 leading-normal"
                  >
                    <option value={1}>Cấp 1: Chỉ sửa chữa khi phát sinh sự cố hư hỏng (0.0đ)</option>
                    <option value={2}>Cấp 2: Bảo dưỡng định kỳ theo lịch khuyến cáo của nhà sản xuất (1.0đ)</option>
                    <option value={3}>Cấp 3: Bảo dưỡng chủ động (Preventive), có sẵn kho linh kiện dự phòng (2.0đ)</option>
                    <option value={4}>Cấp 4: Bảo dưỡng dự đoán (Predictive Maintenance / Cảm biến chẩn đoán) (3.0đ)</option>
                  </select>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Đánh giá khả năng chủ động bảo dưỡng, sửa chữa máy móc thiết bị theo Mục C.3 Phụ lục I TT17 &amp; Điều 5 Khoản 4 TT17.
                  </span>
                </div>

                {/* Mục C.4 & Mục C.5: Nguyên vật liệu & Tiêu thụ năng lượng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mục C.4: Nguyên vật liệu đầu vào */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <label className="block text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                          Mục C.4 · Nguyên Vật Liệu Đầu Vào (G_nvl - TC06)
                        </label>
                        <span className="text-[10px] font-semibold text-slate-500">TK 621 BCTC</span>
                      </div>
                      <FormattedMoneyInput
                        value={survey.materialCostYear}
                        onChange={(val) => updateSurvey({ materialCostYear: val })}
                        unit={moneyUnit}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mt-2 min-h-[26px]">
                      <span className="truncate" title="Tài khoản 621 trên Thuyết minh BCTC">
                        TK 621: <strong>{formatVietnameseCurrencyText(survey.materialCostYear)}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => updateSurvey({ materialCostYear: Math.round(latestGdt * currentBenchmark.kChuan3) })}
                        className="px-2 py-0.5 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-cyan-300 font-semibold text-[11px] border border-brand-200 dark:border-brand-800 shrink-0 transition"
                        title="Tự động tính theo định mức % doanh thu của nhóm ngành"
                      >
                        ⚡ Nạp chuẩn ({(currentBenchmark.kChuan3 * 100).toFixed(0)}% DT)
                      </button>
                    </div>
                  </div>

                  {/* Mục C.5: Tiêu thụ điện và nhiên liệu */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <label className="block text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                          Mục C.5 · Tiêu Thụ Điện &amp; Nhiên Liệu (G_nl - TC05)
                        </label>
                        <span className="text-[10px] font-semibold text-slate-500">Điện, than, dầu, khí</span>
                      </div>
                      <FormattedMoneyInput
                        value={survey.energyCostYear}
                        onChange={(val) => updateSurvey({ energyCostYear: val })}
                        unit={moneyUnit}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mt-2 min-h-[26px]">
                      <span className="truncate" title="Tiền điện SX, than, xăng dầu, khí đốt">
                        Điện, than, dầu, khí: <strong>{formatVietnameseCurrencyText(survey.energyCostYear)}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => updateSurvey({ energyCostYear: Math.round(latestGdt * currentBenchmark.kChuan2) })}
                        className="px-2 py-0.5 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-cyan-300 font-semibold text-[11px] border border-brand-200 dark:border-brand-800 shrink-0 transition"
                        title="Tự động tính theo định mức % doanh thu của nhóm ngành"
                      >
                        ⚡ Nạp chuẩn ({(currentBenchmark.kChuan2 * 100).toFixed(0)}% DT)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mục C.6: Áp dụng sáng kiến, cải tiến kỹ thuật, hợp lý hóa sản xuất */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <label className="block text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                    Mục C.6 · Sáng Kiến Cải Tiến Kỹ Thuật, Hợp Lý Hóa Sản Xuất (TC09 - 3.0 điểm)
                  </label>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={survey.hasKaizenPolicy}
                        onChange={(e) => updateSurvey({ hasKaizenPolicy: e.target.checked })}
                        className="rounded border-slate-300 text-brand-700"
                      />
                      <span>Có quy chế / phong trào thi đua sáng kiến cải tiến (+1.0đ)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={survey.kaizenCount3Years >= 3}
                        onChange={(e) => updateSurvey({ kaizenCount3Years: e.target.checked ? 3 : 1 })}
                        className="rounded border-slate-300 text-brand-700"
                      />
                      <span>Có từ 3 sáng kiến cải tiến được nghiệm thu trong 3 năm (+1.0đ)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={survey.hasHighImpactKaizen}
                        onChange={(e) => updateSurvey({ hasHighImpactKaizen: e.target.checked })}
                        className="rounded border-slate-300 text-brand-700"
                      />
                      <span>Có sáng kiến đem lại giá trị làm lợi kinh tế lớn (+1.0đ)</span>
                    </label>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Kể tên 1–3 sáng kiến cải tiến tiêu biểu (tùy chọn - Mục C.6 Phụ lục I TT17):
                      </label>
                      <input
                        type="text"
                        value={survey.kaizenHighlights || ""}
                        onChange={(e) => updateSurvey({ kaizenHighlights: e.target.value })}
                        placeholder="VD: Cải tiến đồ gá gá lắp tự động giảm 20% thời gian gia công..."
                        className="w-full h-9 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BƯỚC 4: MỤC D - THÔNG TIN NHÂN LỰC, QUẢN TRỊ, DỮ LIỆU & MÔI TRƯỜNG (PHỤ LỤC I TT17) */}
            {currentStep === 4 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-amber-600" />
                    <span>Mục D · Thông Tin Nhân Lực, Quản Trị, Dữ Liệu &amp; Môi Trường (Phụ Lục I TT17)</span>
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Đóng góp Nhóm O: {scoreResult.scoreO} / 19 điểm
                  </span>
                </h2>

                <div className="space-y-5">
                  {/* Mục D.1: Thông tin lao động & chất lượng nguồn nhân lực sản xuất (TC12) */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                          Mục D.1 · Thông Tin Lao Động Của Doanh Nghiệp (TC12 - 4.0 điểm - Điều 5 Khoản 6 TT17)
                        </span>
                        <span className="text-xs text-slate-500 block">
                          Chấm điểm 4 tiêu chí thành phần (mỗi tiêu chí đạt ngưỡng được +1.0 điểm): M_cn (&ge;80% M_tt), M_bc (&ge;20% M_tt), M_ql (&ge;50% M_gt), M_nv (&ge;60% M_gt).
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const total = Math.max(survey.totalWorkforce || 100, 10);
                          const mTt = latestDirectWorkers > 0 ? latestDirectWorkers : Math.round(total * 0.75);
                          const mGt = Math.max(total - mTt, 5);
                          updateSurvey({
                            directWorkers: mTt,
                            trainedWorkers: Math.round(mTt * 0.85),
                            highSkilledWorkers: Math.round(mTt * 0.22),
                            qualifiedManagers: Math.round(mGt * 0.55),
                            qualifiedProfessionals: Math.round(mGt * 0.65),
                          });
                        }}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition self-start sm:self-auto"
                      >
                        ⚡ Ước tính nhanh theo cơ cấu chuẩn
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            1. LĐ Trực Tiếp (M_tt)
                          </label>
                          <button
                            type="button"
                            onClick={() => updateSurvey({ directWorkers: latestDirectWorkers })}
                            className="text-[11px] font-bold text-brand-700 hover:underline dark:text-cyan-400"
                            title="Đồng bộ số lượng công nhân từ Bảng 3 năm"
                          >
                            Đồng bộ ({latestDirectWorkers})
                          </button>
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={survey.directWorkers}
                          onChange={(e) => updateSurvey({ directWorkers: parseInt(e.target.value) || 0 })}
                          className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          LĐ gián tiếp (M_gt = M - M_tt): <strong>{Math.max((survey.totalWorkforce || 0) - (survey.directWorkers || 0), 0)}</strong> người.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          2. CN Qua Đào Tạo Nghề (M_cn)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={survey.trainedWorkers}
                          onChange={(e) => updateSurvey({ trainedWorkers: parseInt(e.target.value) || 0 })}
                          className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Tỷ lệ M_cn/M_tt: <strong>{survey.directWorkers > 0 ? ((survey.trainedWorkers / survey.directWorkers) * 100).toFixed(1) : "0.0"}%</strong> (&ge; 80% đạt +1.0đ).
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          3. CN Bậc Cao / Nghệ Nhân (M_bc)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={survey.highSkilledWorkers}
                          onChange={(e) => updateSurvey({ highSkilledWorkers: parseInt(e.target.value) || 0 })}
                          className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Tỷ lệ M_bc/M_tt: <strong>{survey.directWorkers > 0 ? ((survey.highSkilledWorkers / survey.directWorkers) * 100).toFixed(1) : "0.0"}%</strong> (&ge; 20% đạt +1.0đ).
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          4. CB Quản Lý Đạt Chuẩn (M_ql)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={survey.qualifiedManagers}
                          onChange={(e) => updateSurvey({ qualifiedManagers: parseInt(e.target.value) || 0 })}
                          className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Trình độ ĐH & &ge;3 năm KN: <strong>{Math.max((survey.totalWorkforce || 0) - (survey.directWorkers || 0), 1) > 0 ? (((survey.qualifiedManagers || 0) / Math.max((survey.totalWorkforce || 0) - (survey.directWorkers || 0), 1)) * 100).toFixed(1) : "0.0"}%</strong> M_gt (&ge; 50% đạt +1.0đ).
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          5. CB Nghiệp Vụ CĐ/ĐH+ (M_nv)
                        </label>
                        <input
                          id="tt17-qualified-professionals"
                          type="number"
                          min="0"
                          value={survey.qualifiedProfessionals ?? 0}
                          onChange={(e) => updateSurvey({ qualifiedProfessionals: parseInt(e.target.value) || 0 })}
                          className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Kỹ sư / Chuyên viên CĐ-ĐH+: <strong>{Math.max((survey.totalWorkforce || 0) - (survey.directWorkers || 0), 1) > 0 ? (((survey.qualifiedProfessionals || 0) / Math.max((survey.totalWorkforce || 0) - (survey.directWorkers || 0), 1)) * 100).toFixed(1) : "0.0"}%</strong> M_gt (&ge; 60% đạt +1.0đ).
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mục D.2: Chi phí đào tạo & huấn luyện (TC13) */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-2">
                      Mục D.2 · Thông Tin Về Đào Tạo Nhân Lực (G_dthl - TC13 - 3.0 điểm - Điều 6 Khoản 1 TT17)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Tổng Chi Phí Đào Tạo &amp; Huấn Luyện 3 Năm (G_dthl)
                        </label>
                        <FormattedMoneyInput
                          value={survey.trainingCost3Years}
                          onChange={(val) => updateSurvey({ trainingCost3Years: val })}
                          unit={moneyUnit}
                        />
                        <span className="text-xs text-slate-500 mt-1 block">
                          Tổng chi đào tạo: <strong>{formatVietnameseCurrencyText(survey.trainingCost3Years)}</strong> (Tỷ lệ K_dthl = G_dthl / Tổng G_cp = <strong>{(survey.financialSeries.reduce((s, r) => s + (r.totalCosts || r.netRevenue * 0.85), 0) > 0 ? (survey.trainingCost3Years / survey.financialSeries.reduce((s, r) => s + (r.totalCosts || r.netRevenue * 0.85), 0)) * 100 : 0).toFixed(2)}%</strong>; &ge; 5% đạt 3.0đ, 2%&ndash;&lt;5% đạt 2.0đ, &lt;2% đạt 1.0đ).
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-slate-600 dark:text-slate-300">
                        <strong className="text-amber-900 dark:text-amber-300 block mb-1">💡 Hướng dẫn lấy số liệu kế toán:</strong>
                        Cộng tổng chi phí đào tạo nghề, huấn luyện an toàn lao động, bồi dưỡng nâng bậc thợ và đào tạo quản trị trong 3 năm (trích từ <strong>Tài khoản 642 / 627</strong> hoặc Báo cáo quyết toán kinh phí đào tạo nội bộ).
                      </div>
                    </div>
                  </div>

                  {/* Mục D.3: Phần mềm quản trị & sản xuất (TC14) */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
                      Mục D.3 · Hệ Thống Thông Tin Phục Vụ Sản Xuất, Quản Lý (TC14 - 5.0 điểm - Điều 6 Khoản 2 TT17)
                    </label>
                    <span className="text-xs text-slate-500 block mb-2.5">
                      Chọn các hệ thống phần mềm chuyên dụng doanh nghiệp đang vận hành thực tế (có từ 1 hệ thống đạt 4.0đ, tích hợp đồng bộ từ 3 hệ thống trở lên đạt 5.0đ):
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                      {[
                        { code: "ERP", desc: "Hoạch định nguồn lực doanh nghiệp tổng thể (Kế toán, Mua hàng, Kho, Nhân sự)" },
                        { code: "MES", desc: "Hệ thống điều hành và giám sát thực thi sản xuất trực tiếp tại nhà xưởng" },
                        { code: "SCM", desc: "Quản trị chuỗi cung ứng, nhà cung cấp, kho vận và hậu cần" },
                        { code: "PPS", desc: "Lập kế hoạch và điều độ tiến độ sản xuất tự động" },
                        { code: "PDM", desc: "Quản lý dữ liệu kỹ thuật sản phẩm, định mức BOM và bản vẽ thiết kế" },
                        { code: "PLM", desc: "Quản lý toàn bộ vòng đời sản phẩm từ ý tưởng R&D đến sản xuất" },
                      ].map((sw) => {
                        const checked = survey.softwareApplications.includes(sw.code);
                        return (
                          <label key={sw.code} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const list = e.target.checked
                                  ? [...survey.softwareApplications, sw.code]
                                  : survey.softwareApplications.filter((x) => x !== sw.code);
                                updateSurvey({ softwareApplications: list });
                              }}
                              className="mt-0.5 rounded border-slate-300 text-brand-700"
                            />
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200">Hệ thống {sw.code}</span>
                              <span className="block text-[11px] text-slate-500">{sw.desc}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mục D.4: Hệ thống thu thập dữ liệu phục vụ số hóa quá trình sản xuất (TC04/TC10) */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
                      Mục D.4 · Hệ Thống Thu Thập Dữ Liệu Phục Vụ Số Hóa Quá Trình Sản Xuất (TC04/TC10 - Tối đa 4.0 điểm)
                    </label>
                    <span className="text-xs text-slate-500 block mb-2.5">
                      Liệt kê mức độ tích hợp sản xuất của doanh nghiệp thông qua việc áp dụng các hệ thống theo Mục D.4 Phụ lục I TT17:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {[
                        {
                          code: "SCADA",
                          title: "Hệ thống SCADA hoặc PDA (+1.0đ)",
                          desc: "Giám sát, điều khiển và thu thập dữ liệu sản xuất tự động tại xưởng",
                        },
                        {
                          code: "MDC",
                          title: "Hệ thống MDC (+1.0đ)",
                          desc: "Kết nối và thu thập dữ liệu trạng thái hoạt động trực tiếp từ máy móc (Machine Data Collection)",
                        },
                        {
                          code: "FMS",
                          title: "Hệ thống FMS hoặc DCS (+1.0đ)",
                          desc: "Hệ thống sản xuất linh hoạt (FMS) hoặc hệ thống điều khiển phân tán tự động (DCS)",
                        },
                        {
                          code: "CIM",
                          title: "Hệ thống CIM (+1.0đ)",
                          desc: "Sản xuất tích hợp toàn diện bằng máy tính (kết nối từ thiết kế CAD/CAM xuống máy CNC và quản trị)",
                        },
                      ].map((sys) => {
                        const checked = survey.dataCollectionSystems.includes(sys.code);
                        return (
                          <label
                            key={sys.code}
                            className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                              checked
                                ? "bg-brand-50/80 dark:bg-brand-950/50 border-brand-500 text-brand-900 dark:text-cyan-200 shadow-xs"
                                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const list = e.target.checked
                                  ? [...survey.dataCollectionSystems, sys.code]
                                  : survey.dataCollectionSystems.filter((x) => x !== sys.code);
                                updateSurvey({ dataCollectionSystems: list });
                              }}
                              className="rounded border-slate-300 mt-0.5 text-brand-700"
                            />
                            <div>
                              <span className="font-bold block">{sys.title}</span>
                              <span className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug block mt-0.5">
                                {sys.desc}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mục D.5: Hệ thống quản lý chất lượng & Công cụ cải tiến năng suất (TC16) */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
                        Mục D.5 · Áp Dụng Hệ Thống Quản Lý Sản Xuất &amp; Chất Lượng (TC16 - 3.0 điểm - Điều 6 Khoản 4 TT17)
                      </label>
                      <span className="text-xs text-slate-500 block mb-2">
                        1. Chứng nhận Hệ thống quản lý chất lượng đang còn hiệu lực (ISO 9001 được 1.0đ; có thêm chứng nhận chuyên ngành HACCP/GMP/IATF 16949/ISO 22000... được 2.0đ):
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                        {["ISO 9001", "ISO 22000", "HACCP", "GMP", "IATF 16949", "ISO 45001"].map((iso) => {
                          const checked = survey.isoCertifications.includes(iso);
                          return (
                            <label key={iso} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const list = e.target.checked
                                    ? [...survey.isoCertifications, iso]
                                    : survey.isoCertifications.filter((x) => x !== iso);
                                  updateSurvey({ isoCertifications: list });
                                }}
                                className="rounded border-slate-300 text-brand-700"
                              />
                              <span>Chứng nhận {iso}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 block mb-2">
                        2. Các công cụ cải tiến năng suất chất lượng đang áp dụng tại xưởng (Áp dụng ít nhất 1 công cụ được cộng thêm +1.0 điểm):
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                        {[
                          { key: "5S", label: "5S (Sàng lọc - Sắp xếp...)" },
                          { key: "Kaizen", label: "Kaizen (Cải tiến liên tục)" },
                          { key: "Lean", label: "Lean (Sản xuất tinh gọn)" },
                          { key: "Six Sigma", label: "Six Sigma (Kiểm soát sai lỗi)" },
                          { key: "TPM", label: "TPM (Bảo trì năng suất toàn diện)" },
                        ].map((tool) => {
                          const tools = survey.productivityTools || [];
                          const checked = tools.includes(tool.key);
                          return (
                            <label key={tool.key} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const current = survey.productivityTools || [];
                                  const list = e.target.checked
                                    ? [...current, tool.key]
                                    : current.filter((x) => x !== tool.key);
                                  updateSurvey({ productivityTools: list });
                                }}
                                className="rounded border-slate-300 text-brand-700"
                              />
                              <span>{tool.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Mục D.6: Thông tin chung về bảo vệ môi trường (TC17) */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
                      Mục D.6 · Thông Tin Chung Về Bảo Vệ Môi Trường (TC17 - 3.0 điểm - Điều 6 Khoản 5 TT17)
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={survey.environmentalCompliant}
                        onChange={(e) => updateSurvey({ environmentalCompliant: e.target.checked })}
                        className="rounded border-slate-300 text-brand-700"
                      />
                      <span>1. Có báo cáo ĐTM / Kế hoạch bảo vệ môi trường và hệ thống xử lý chất thải đạt quy chuẩn (+1.0 điểm)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        id="tt17-has-iso14001"
                        type="checkbox"
                        checked={Boolean(survey.hasIso14001)}
                        onChange={(e) => updateSurvey({ hasIso14001: e.target.checked })}
                        className="rounded border-slate-300 text-brand-700"
                      />
                      <span>2. Đã được cấp chứng nhận Hệ thống quản lý môi trường ISO 14001 (hoặc tương đương) (+1.0 điểm)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={survey.hasWasteRecycling}
                        onChange={(e) => updateSurvey({ hasWasteRecycling: e.target.checked })}
                        className="rounded border-slate-300 text-brand-700"
                      />
                      <span>3. Có giải pháp thu gom, tái chế, tái sử dụng chất thải hoặc sản xuất sạch hơn (+1.0 điểm)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* BƯỚC 5: MỤC Đ - HOẠT ĐỘNG R&D (PHỤ LỤC I TT17) */}
            {currentStep === 5 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-rose-600" />
                    <span>Mục Đ · Hoạt Động Nghiên Cứu &amp; Phát Triển (R&amp;D) (Phụ Lục I TT17)</span>
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                    Đóng góp Nhóm R: {scoreResult.scoreR} / 17 điểm
                  </span>
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* TC18: Đã điều chỉnh chiều cao chuẩn h-[42px] px-3.5 py-2.5 */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC18 · Mức Độ Đầu Tư Hạ Tầng Công Nghệ Thông Tin (3.0 điểm)
                      </label>
                      <select
                        value={survey.itInfrastructureLevel}
                        onChange={(e) => updateSurvey({ itInfrastructureLevel: (parseInt(e.target.value) || 1) as any })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 leading-normal"
                      >
                        <option value={1}>Mức 1: Máy tính văn phòng, mạng LAN, Internet cơ bản (1.0đ)</option>
                        <option value={2}>Mức 2: Có Website thương mại, máy chủ nội bộ, phần mềm nghiệp vụ (2.0đ)</option>
                        <option value={3}>Mức 3: Hệ thống Cloud/Data Center đồng bộ, bảo mật an toàn thông tin (3.0đ)</option>
                      </select>
                      <span className="text-xs text-slate-500 mt-1 block">
                        Đánh giá mức độ trang bị phần cứng, mạng và hạ tầng số theo Điều 7 Khoản 1 TT17.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC19 · Tổng Chi Phí Đầu Tư Cho CNTT Trong 3 Năm (G_tt - 3.0 điểm)
                      </label>
                      <FormattedMoneyInput
                        value={survey.itExpenses3Years}
                        onChange={(val) => updateSurvey({ itExpenses3Years: val })}
                        unit={moneyUnit}
                      />
                      <span className="text-xs text-slate-500 mt-1 block">
                        Đầu tư CNTT (Phần cứng + Bản quyền phần mềm + Thuê Cloud): <strong>{formatVietnameseCurrencyText(survey.itExpenses3Years)}</strong> (&ge; 2% Tổng chi phí SXKD đạt 3.0đ tối đa).
                      </span>
                    </div>

                    {/* TC21: Đã điều chỉnh chiều cao chuẩn h-[42px] px-3.5 py-2.5 */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC21 · Cơ Sở Vật Chất Phục Vụ Nghiên Cứu & Thiết Kế (3.0 điểm)
                      </label>
                      <select
                        value={survey.rdFacilityLevel}
                        onChange={(e) => updateSurvey({ rdFacilityLevel: (parseInt(e.target.value) || 1) as any })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 leading-normal"
                      >
                        <option value={1}>Mức 1: Bộ phận kỹ thuật kiêm nhiệm nghiên cứu (1.0đ)</option>
                        <option value={2}>Mức 2: Có phòng thí nghiệm / phòng thiết kế CAD/CAM/CAE chuyên trách (2.0đ)</option>
                        <option value={3}>Mức 3: Có Viện hoặc Trung tâm R&D độc lập đủ trang thiết bị thử nghiệm (3.0đ)</option>
                      </select>
                      <span className="text-xs text-slate-500 mt-1 block">
                        Đánh giá tổ chức bộ phận R&D và trang thiết bị đo lường, mô phỏng theo Điều 7 Khoản 4 TT17.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC20 · Số Lượng Nhân Lực R&D Trình Độ Đại Học Trở Lên (M_r&d - 3.0 điểm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={survey.rdWorkforceCount}
                        onChange={(e) => updateSurvey({ rdWorkforceCount: parseInt(e.target.value) || 0 })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
                      />
                      <span className="text-xs text-slate-500 mt-1 block">
                        Quy đổi nhân lực R&D (nhân sự kiêm nhiệm tính 0.5 người): <strong>{((survey.rdWorkforceCount / (survey.totalWorkforce || 1)) * 100).toFixed(1)}%</strong> tổng lao động.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC22 · Tổng Kinh Phí Chi Cho Nghiên Cứu & Phát Triển 3 Năm (G_rd - 5.0 điểm)
                      </label>
                      <FormattedMoneyInput
                        value={survey.rdExpenses3Years}
                        onChange={(val) => updateSurvey({ rdExpenses3Years: val })}
                        unit={moneyUnit}
                      />
                      <span className="text-xs text-slate-500 mt-1 block">
                        Chi R&D 3 năm: <strong>{formatVietnameseCurrencyText(survey.rdExpenses3Years)}</strong> (Tỷ lệ K_rd = <strong>{(survey.financialSeries.reduce((s, r) => s + r.netRevenue, 0) > 0 ? (survey.rdExpenses3Years / survey.financialSeries.reduce((s, r) => s + r.netRevenue, 0)) * 100 : 0).toFixed(2)}%</strong> tổng doanh thu 3 năm; chấm theo quy mô DN tại Bước 1).
                      </span>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                        <input
                          type="checkbox"
                          checked={survey.hasSciTechFund}
                          onChange={(e) => updateSurvey({ hasSciTechFund: e.target.checked })}
                          className="rounded border-slate-300"
                        />
                        <span>TC22 · Doanh nghiệp có trích lập và sử dụng Quỹ Phát triển KH&CN từ lợi nhuận trước thuế (+1.0 điểm)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BƯỚC 6: MỤC E - HOẠT ĐỘNG ĐỔI MỚI SÁNG TẠO (PHỤ LỤC I TT17) */}
            {currentStep === 6 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-teal-600" />
                    <span>Mục E · Hoạt Động Đổi Mới Sáng Tạo &amp; Đổi Mới Công Nghệ (Phụ Lục I TT17)</span>
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    Đóng góp Nhóm I: {scoreResult.scoreI} / 14 điểm
                  </span>
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* TC23: Đã điều chỉnh chiều cao chuẩn h-[42px] px-3.5 py-2.5 */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC23 · Loại Sản Phẩm Mới Tạo Ra Trong 3 Năm Qua (4.0 điểm)
                      </label>
                      <select
                        value={survey.newProductType}
                        onChange={(e) => updateSurvey({ newProductType: e.target.value as any })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 leading-normal"
                      >
                        <option value="none">Không có sản phẩm mới (0.0đ)</option>
                        <option value="kieu_dang">Sản phẩm cải tiến kiểu dáng, mẫu mã (1.0đ)</option>
                        <option value="tinh_nang">Sản phẩm cải tiến tính năng kỹ thuật vượt trội (2.0đ)</option>
                        <option value="hoan_toan_moi">Sản phẩm hoàn toàn mới trên thị trường (3.0đ)</option>
                      </select>
                      <span className="text-xs text-slate-500 mt-1 block">
                        Đánh giá mức độ đổi mới sản phẩm thương mại hóa theo Điều 8 Khoản 1 TT17.
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          TC23 · Tỷ Lệ Doanh Thu Từ Sản Phẩm Mới K_spm (%)
                        </label>
                        <span className="text-xs text-brand-700 dark:text-cyan-400 font-semibold">Chọn nhanh:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {[
                          { label: "0%", val: 0 },
                          { label: "3%", val: 3 },
                          { label: "5% (+1.0đ chuẩn TT17)", val: 5 },
                          { label: "10%", val: 10 },
                          { label: "20%", val: 20 },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => updateSurvey({ newProductRevenueRatio: preset.val })}
                            className={`px-2 py-1 text-xs rounded-md font-medium border transition ${
                              survey.newProductRevenueRatio === preset.val
                                ? "bg-brand-700 text-white border-brand-700 shadow-sm"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-400"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={survey.newProductRevenueRatio}
                        onChange={(e) => updateSurvey({ newProductRevenueRatio: parseFloat(e.target.value) || 0 })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
                      />
                      <span className="text-xs text-slate-500 mt-1 block">
                        Theo Điều 8 Khoản 1 TT17: Nếu tỷ lệ doanh thu sản phẩm mới (G_spm / G_dt) đạt <strong>&ge; 5%</strong> tổng doanh thu thì được cộng thêm <strong>+1.0 điểm</strong>.
                      </span>
                    </div>

                    {/* Mục E.1: Kê khai tên sản phẩm mới tiêu biểu (Phụ lục I TT17 Trang 29–30) */}
                    <div className="md:col-span-2 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className="block text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                          Mục E.1 · Tên 1–3 Sản Phẩm Mới Tiêu Biểu Tạo Ra Trong 03 Năm Qua (Phụ Lục I TT17)
                        </label>
                        <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/80 px-2 py-0.5 rounded border border-teal-200 self-start sm:self-auto">
                          Trang 29–30 Phụ Lục I TT17
                        </span>
                      </div>
                      <input
                        type="text"
                        value={survey.newProductNames || ""}
                        onChange={(e) => updateSurvey({ newProductNames: e.target.value })}
                        placeholder="Ví dụ: Gạo hữu cơ hút chân không đóng túi zip 1kg, Nước tăng lực thảo mộc..."
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                      />
                      <span className="text-xs text-slate-500 block">
                        * Kê khai tên thương mại hoặc tên kỹ thuật của sản phẩm mới tiêu biểu tạo ra trong 3 năm qua tương ứng với phân loại đã chọn tại TC23.
                      </span>
                    </div>

                    {/* TC24: Đã điều chỉnh chiều cao chuẩn h-[42px] px-3.5 py-2.5 */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC24 · Kết Quả Nghiên Cứu KH&CN Áp Dụng Vào Sản Xuất (4.0 điểm)
                      </label>
                      <select
                        value={survey.rdTechnologyResult}
                        onChange={(e) => updateSurvey({ rdTechnologyResult: e.target.value as any })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 leading-normal"
                      >
                        <option value="none">Chưa ứng dụng kết quả nghiên cứu (0.0đ)</option>
                        <option value="dang_nghien_cuu">Đang trong giai đoạn nghiên cứu thử nghiệm (1.0đ)</option>
                        <option value="thu_nghiem_lab">Đã thử nghiệm thành công quy mô phòng lab / xưởng pilot (2.0đ)</option>
                        <option value="giai_phap_huu_ich">Đã được cấp văn bằng Giải pháp hữu ích hoặc giải thưởng KH&CN (3.0đ)</option>
                        <option value="bang_sang_che">Đã được cấp Bằng độc quyền Sáng chế bảo hộ (4.0đ)</option>
                      </select>
                      <span className="text-xs text-slate-500 mt-1 block">
                        Căn cứ các đề tài R&D nghiệm thu, Giải thưởng KH&CN hoặc Bằng độc quyền sáng chế/GPHI theo Điều 8 Khoản 2 TT17.
                      </span>
                    </div>

                    {/* TC25: Đã điều chỉnh chiều cao chuẩn h-[42px] px-3.5 py-2.5 */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC25 · Hợp Tác Với Viện Nghiên Cứu, Trường Đại Học (2.0 điểm)
                      </label>
                      <select
                        value={survey.academyPartnershipType}
                        onChange={(e) => updateSurvey({ academyPartnershipType: e.target.value as any })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 leading-normal"
                      >
                        <option value="none">Không có hoạt động hợp tác (0.0đ)</option>
                        <option value="chuyen_gia_dao_tao">Mời chuyên gia tư vấn kỹ thuật, đào tạo nhân lực (1.0đ)</option>
                        <option value="du_an_rd">Cùng ký hợp đồng thực hiện đề tài / dự án R&D chuyển giao công nghệ (2.0đ)</option>
                      </select>
                      <span className="text-xs text-slate-500 mt-1 block">
                        Đánh giá mức độ gắn kết Viện - Trường - Doanh nghiệp theo Điều 8 Khoản 3 TT17.
                      </span>
                    </div>

                    {/* TC26 Chiến lược: Đã điều chỉnh chiều cao chuẩn h-[42px] px-3.5 py-2.5 */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC26 · Chiến Lược Chuyển Đổi Số / Công Nghệ 4.0
                      </label>
                      <select
                        value={survey.digitalStrategyLevel}
                        onChange={(e) => updateSurvey({ digitalStrategyLevel: e.target.value as any })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 leading-normal"
                      >
                        <option value="chua_biet">Chưa tìm hiểu / chưa có định hướng (0.0đ)</option>
                        <option value="chuan_bi">Đang chuẩn bị lập kế hoạch (0.5đ)</option>
                        <option value="dang_thuc_hien">Đang triển khai theo kế hoạch từng bước (0.8đ)</option>
                        <option value="da_xay_dung">Đã ban hành và thực thi Chiến lược số chính thức (1.0đ)</option>
                      </select>
                    </div>

                    {/* TC26 Phạm vi: Đã điều chỉnh chiều cao chuẩn h-[42px] px-3.5 py-2.5 */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC26 · Phạm Vi Ứng Dụng Công Nghệ 4.0 Trong Nhà Máy
                      </label>
                      <select
                        value={survey.digitalAdoptionScope}
                        onChange={(e) => updateSurvey({ digitalAdoptionScope: e.target.value as any })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 leading-normal"
                      >
                        <option value="nghien_cuu">Đang nghiên cứu thử nghiệm 1 khâu (1.0đ)</option>
                        <option value="mot_so_bo_phan">Triển khai ở một số phân xưởng sản xuất (2.0đ)</option>
                        <option value="toan_nha_may">Áp dụng toàn diện nhà máy thông minh Smart Factory (3.0đ)</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      TC26 · Danh Mục Các Công Nghệ 4.0 Doanh Nghiệp Đang Triển Khai (Bấm để chọn)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {[
                        { key: "Cloud", label: "Điện toán đám mây (Cloud)" },
                        { key: "Robot", label: "Robot công nghiệp & AGV" },
                        { key: "BigData", label: "Dữ liệu lớn (Big Data)" },
                        { key: "IoT", label: "Internet vạn vật (IoT)" },
                        { key: "MoHinhHoa", label: "Bản sao số (Digital Twin)" },
                        { key: "AnNinhMang", label: "An toàn TT & An ninh mạng" },
                        { key: "TichHop", label: "Tích hợp hệ thống SCADA/MES" },
                        { key: "In3D", label: "Sản xuất bồi đắp (In 3D)" },
                        { key: "VatLieuMoi", label: "Vật liệu mới & Nano" },
                        { key: "Blockchain", label: "Chuỗi khối (Blockchain)" },
                        { key: "AR", label: "Thực tế tăng cường (AR)" },
                        { key: "VR", label: "Thực tế ảo (VR)" },
                      ].map((tech) => {
                        const checked = survey.digitalTechnologies.includes(tech.key);
                        return (
                          <label
                            key={tech.key}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                              checked
                                ? "bg-brand-50 dark:bg-brand-950/60 border-brand-500 text-brand-900 dark:text-cyan-300 font-semibold shadow-sm"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const list = e.target.checked
                                  ? [...survey.digitalTechnologies, tech.key]
                                  : survey.digitalTechnologies.filter((x) => x !== tech.key);
                                updateSurvey({ digitalTechnologies: list });
                              }}
                              className="rounded border-slate-300 text-brand-700 focus:ring-brand-500"
                            />
                            <span className="truncate">{tech.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Pagination Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
                className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Bước Trước
              </button>

              {currentStep < 6 ? (
                <AppButton variant="primary" onClick={() => setCurrentStep((p) => Math.min(6, p + 1))}>
                  Bước Tiếp Theo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </AppButton>
              ) : (
                <AppButton variant="primary" onClick={handleSubmit} disabled={saving}>
                  <Send className="w-4 h-4 mr-2" />
                  Hoàn Tất & Nộp Hồ Sơ
                </AppButton>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Realtime Scorecard */}
          <div className="space-y-6">
            <div className="sticky top-6 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500 mb-2">
                  <span>Tính Điểm Tức Thời (Real-Time)</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-2">
                  <span>{scoreResult.totalScore}</span>
                  <span className="text-base font-normal text-slate-500">/ 100 điểm</span>
                </div>
              </div>

              {/* Xếp loại badge */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 mb-1">Dự báo xếp loại Điều 9 TT17:</div>
                <div className="text-sm font-bold text-brand-800 dark:text-cyan-300">
                  {scoreResult.classificationLabel}
                </div>
                <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                  <span>Hệ số đồng bộ T_ĐB:</span>
                  <span className="font-bold text-emerald-600">{scoreResult.syncCoefficient}</span>
                </div>
              </div>

              {/* 5 Nhóm thanh đo */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Nhóm T (Thiết bị & Công nghệ)</span>
                    <span>{scoreResult.scoreT}/30</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-700 h-full rounded-full" style={{ width: `${(scoreResult.scoreT / 30) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Nhóm E (Hiệu quả khai thác)</span>
                    <span>{scoreResult.scoreE}/20</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(scoreResult.scoreE / 20) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Nhóm O (Năng lực quản trị)</span>
                    <span>{scoreResult.scoreO}/19</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: `${(scoreResult.scoreO / 19) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Nhóm R (Năng lực R&D)</span>
                    <span>{scoreResult.scoreR}/17</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-600 h-full rounded-full" style={{ width: `${(scoreResult.scoreR / 17) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Nhóm I (Đổi mới sáng tạo)</span>
                    <span>{scoreResult.scoreI}/14</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full" style={{ width: `${(scoreResult.scoreI / 14) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Cảnh báo Điểm nghẽn */}
              {scoreResult.bottlenecks.length > 0 && (
                <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300 mb-1">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Phát hiện {scoreResult.bottlenecks.length} điểm nghẽn (&lt;40% định mức):</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {scoreResult.bottlenecks.join(", ")}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
