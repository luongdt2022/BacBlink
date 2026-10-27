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
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Mục A: Thông Tin Chung", icon: Building2 },
  { id: 2, title: "Mục B: Nhóm T - Thiết Bị", icon: Cpu },
  { id: 3, title: "Mục C: Nhóm E - Khai Thác", icon: BarChart3 },
  { id: 4, title: "Mục D: Nhóm O - Quản Trị", icon: Briefcase },
  { id: 5, title: "Mục Đ: Nhóm R - R&D", icon: FlaskConical },
  { id: 6, title: "Mục E: Nhóm I - Đổi Mới ST", icon: Lightbulb },
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
    const newItem: MachineryItem = {
      name: "Máy móc thiết bị mới",
      originCountry: "Việt Nam",
      manufactureYear: 2023,
      startUsageYear: 2024,
      originalCost: 500000000,
      currentBookValue: 450000000,
      isAutomated: false,
      isAdvancedCountry: false,
    };
    updateSurvey({ machineries: [...survey.machineries, newItem] });
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
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm mb-6">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link
                href="/assessments/tt17"
                className="text-xs font-semibold text-brand-700 hover:underline flex items-center gap-1 mb-2"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Quay lại Dashboard Lịch Sử
              </Link>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold text-xs border border-emerald-200/90 dark:border-emerald-800 mb-2">
                <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Phiếu Thu Thập Số Liệu & Tự Đánh Giá Doanh Nghiệp (Thông tư 17/2019/TT-BKHCN)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Kê Khai Đánh Giá Trình Độ & Năng Lực Công Nghệ Sản Xuất
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Biểu mẫu thu thập số liệu thực tế từ Báo cáo tài chính & hiện trạng nhà máy. Hệ thống tự động đối soát với định mức ngành (C.10 - C.32), tự động tính toán 26 tiêu chí và cấp tài khoản Doanh nghiệp sau khi hoàn tất.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
              {/* Unit Selector Toggle */}
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-inner">
                <span className="text-xs font-bold text-slate-500 px-2 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-500" /> Đơn vị:
                </span>
                <button
                  type="button"
                  onClick={() => setMoneyUnit("TY")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    moneyUnit === "TY"
                      ? "bg-brand-700 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                  title="Nhập số tiền theo Tỷ VNĐ (khuyên dùng, ví dụ: 60)"
                >
                  Tỷ VNĐ
                </button>
                <button
                  type="button"
                  onClick={() => setMoneyUnit("TRIEU")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    moneyUnit === "TRIEU"
                      ? "bg-brand-700 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                  title="Nhập số tiền theo Triệu VNĐ"
                >
                  Triệu VNĐ
                </button>
                <button
                  type="button"
                  onClick={() => setMoneyUnit("VND")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    moneyUnit === "VND"
                      ? "bg-brand-700 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                  title="Nhập số tiền VNĐ đầy đủ"
                >
                  VNĐ
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSurvey(INITIAL_SURVEY_DATA);
                    setIndustryCode("C.10");
                    showToast("Đã xóa trắng form về trạng thái ban đầu.", "success");
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Xóa trắng mọi trường nhập liệu"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Xóa Trắng
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSurvey(SAMPLE_BENCHMARK_DAIHUNG);
                    setIndustryCode("C.10");
                    setMoneyUnit("TY");
                    showToast("Đã nạp bộ dữ liệu mẫu chuẩn TT17: CÔNG TY TNHH ĐẠI HƯNG (43 điểm, Kđb=0.42, Trung bình)!", "success");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  title="Nạp dữ liệu mẫu benchmark kiểm chuẩn TT17"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Mẫu DN Đại Hưng (43đ)
                </button>

                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-2 shadow-sm transition"
                >
                  <Save className="w-4 h-4" />
                  Lưu Nháp
                </button>
                <AppButton variant="primary" onClick={handleSubmit} disabled={saving} className="px-5 py-2.5 text-xs font-bold shadow-md">
                  <Send className="w-4 h-4 mr-2" />
                  Hoàn Tất & Nộp Hồ Sơ
                </AppButton>
              </div>
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

                    <div className="md:col-span-2">
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
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-3">
                    2. Lựa Chọn Nhóm Ngành & Định Mức Kỹ Thuật (23 Ngành Theo TT17)
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
                      Mã Ngành Chế Biến, Chế Tạo (VSIC C.10 - C.32) <span className="text-rose-500">*</span>
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
                      Tương đương: <strong>{formatVietnameseCurrencyText(survey.totalCapital)}</strong> (dùng phân loại quy mô DN cho TC20).
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
                    <span className="text-xs text-slate-500 mt-1 block">Tổng số người lao động ký hợp đồng từ 1 năm trở lên.</span>
                  </div>
                </div>
              </div>
            )}

            {/* BƯỚC 2: MỤC B - NHÓM T (THIẾT BỊ & CÔNG NGHỆ) */}
            {currentStep === 2 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-brand-700" />
                    <span>Mục B · Nhóm T: Hiện Trạng Công Nghệ & Thiết Bị (30 điểm)</span>
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-50 text-brand-800 border border-brand-200">
                    {scoreResult.scoreT} / 30 điểm
                  </span>
                </h2>

                {/* Hướng dẫn kế toán */}
                <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex items-start gap-2.5 text-xs text-teal-900 dark:text-teal-300">
                  <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Hướng dẫn lấy số liệu từ Báo cáo Tài chính:</span> Quý Doanh nghiệp tra cứu trực tiếp trên <strong>Bảng Cân đối Kế toán</strong> (Chỉ tiêu 211: Nguyên giá TSCĐ hữu hình, Chỉ tiêu 212: Giá trị hao mòn lũy kế).
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      TC01 · Tổng Nguyên Giá Máy Móc Thiết Bị Ban Đầu (G_bđ)
                    </label>
                    <FormattedMoneyInput
                      value={survey.originalCostEquipment}
                      onChange={(val) => updateSurvey({ originalCostEquipment: val })}
                      unit={moneyUnit}
                    />
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <span>Mã số 211 trên BCTC: <strong>{formatVietnameseCurrencyText(survey.originalCostEquipment)}</strong></span>
                      {totalMachineryCost > 0 && (
                        <button
                          type="button"
                          onClick={() => updateSurvey({ originalCostEquipment: totalMachineryCost })}
                          className="font-bold text-brand-700 hover:underline dark:text-cyan-400"
                          title="Tính tổng nguyên giá từ danh sách máy móc xưởng kê khai bên dưới"
                        >
                          ⚡ Lấy từ máy móc ({formatVietnameseCurrencyText(totalMachineryCost)})
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      TC01 · Giá Trị Còn Lại Của Máy Móc Thiết Bị (G_sx)
                    </label>
                    <FormattedMoneyInput
                      value={survey.currentBookValueEquipment}
                      onChange={(val) => updateSurvey({ currentBookValueEquipment: val })}
                      unit={moneyUnit}
                    />
                    <span className="text-xs text-slate-500 mt-1 block">
                      Mã 210 = Nguyên giá trừ Hao mòn: <strong>{formatVietnameseCurrencyText(survey.currentBookValueEquipment)}</strong> (Khấu hao: {survey.originalCostEquipment > 0 ? (((survey.originalCostEquipment - survey.currentBookValueEquipment) / survey.originalCostEquipment) * 100).toFixed(1) : 0}%).
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      TC03 · Giá Trị Máy Móc Mua Mới Mở Rộng 3 Năm (G_tbm1)
                    </label>
                    <FormattedMoneyInput
                      value={survey.newInvestEquipment3Years}
                      onChange={(val) => updateSurvey({ newInvestEquipment3Years: val })}
                      unit={moneyUnit}
                    />
                    <span className="text-xs text-slate-500 mt-1 block">
                      Mua sắm mở rộng: <strong>{formatVietnameseCurrencyText(survey.newInvestEquipment3Years)}</strong>
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      TC03 · Giá Trị Máy Móc Mua Thay Thế Nâng Cấp 3 Năm (G_tbm2)
                    </label>
                    <FormattedMoneyInput
                      value={survey.replacementEquipment3Years}
                      onChange={(val) => updateSurvey({ replacementEquipment3Years: val })}
                      unit={moneyUnit}
                    />
                    <span className="text-xs text-slate-500 mt-1 block">
                      Thay thế/bảo dưỡng: <strong>{formatVietnameseCurrencyText(survey.replacementEquipment3Years)}</strong> (Đổi mới: {survey.originalCostEquipment > 0 ? (((survey.newInvestEquipment3Years + survey.replacementEquipment3Years) / survey.originalCostEquipment) * 100).toFixed(1) : 0}%).
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      TC04 · Giá Trị Thiết Bị Số Hóa, Tự Động Hóa (G_sh)
                    </label>
                    <FormattedMoneyInput
                      value={survey.digitalEquipmentValue}
                      onChange={(val) => updateSurvey({ digitalEquipmentValue: val })}
                      unit={moneyUnit}
                    />
                    <span className="text-xs text-slate-500 mt-1 block">
                      Thiết bị CNC, PLC, IoT, robot: <strong>{formatVietnameseCurrencyText(survey.digitalEquipmentValue)}</strong> (Định mức ngành: {currentBenchmark.kChuan1} triệu/LĐ).
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      TC07 · Tiêu Chuẩn Sản Phẩm Của Dây Chuyền Công Nghệ
                    </label>
                    <select
                      value={survey.mainProductStandard}
                      onChange={(e) => updateSurvey({ mainProductStandard: e.target.value as any })}
                      className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 leading-normal"
                    >
                      <option value="co_so_vuot_quoc_te">Tiêu chuẩn quốc tế cao cấp / CE / FDA / JIS (4.0đ)</option>
                      <option value="quoc_te">Đạt tiêu chuẩn Quốc tế ISO / Quy chuẩn khu vực (3.0đ)</option>
                      <option value="quoc_gia">Đạt Tiêu chuẩn Quốc gia TCVN / QCVN (2.0đ)</option>
                      <option value="co_so">Tiêu chuẩn cơ sở TCCS tự công bố (1.0đ)</option>
                    </select>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Tiêu chuẩn xuất xưởng của sản phẩm dây chuyền chính.
                    </span>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      TC04 · Hệ Thống Thu Thập Dữ Liệu & Điều Khiển Tích Hợp Đang Sử Dụng
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {["SCADA", "MDC", "FMS", "CIM"].map((sys) => {
                        const checked = survey.dataCollectionSystems.includes(sys);
                        return (
                          <label key={sys} className="flex items-center gap-1.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const list = e.target.checked
                                  ? [...survey.dataCollectionSystems, sys]
                                  : survey.dataCollectionSystems.filter((x) => x !== sys);
                                updateSurvey({ dataCollectionSystems: list });
                              }}
                              className="rounded border-slate-300"
                            />
                            <span>Hệ thống {sys}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* TC05: Năng Lượng */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      TC05 · Chi Phí Tiêu Hao Năng Lượng Năm Gần Nhất (G_nl)
                    </label>
                    <FormattedMoneyInput
                      value={survey.energyCostYear}
                      onChange={(val) => updateSurvey({ energyCostYear: val })}
                      unit={moneyUnit}
                    />
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <span>Điện, than, dầu: <strong>{formatVietnameseCurrencyText(survey.energyCostYear)}</strong></span>
                      <button
                        type="button"
                        onClick={() => updateSurvey({ energyCostYear: Math.round(latestGdt * currentBenchmark.kChuan2) })}
                        className="font-bold text-brand-700 hover:underline dark:text-cyan-400"
                        title="Tự động tính theo định mức % doanh thu của nhóm ngành"
                      >
                        ⚡ Nạp chuẩn ({(currentBenchmark.kChuan2 * 100).toFixed(0)}% DT = {formatVietnameseCurrencyText(Math.round(latestGdt * currentBenchmark.kChuan2))})
                      </button>
                    </div>
                  </div>

                  {/* TC06: Nguyên Vật Liệu */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      TC06 · Chi Phí Nguyên Vật Liệu Trực Tiếp Năm Gần Nhất (G_nvl)
                    </label>
                    <FormattedMoneyInput
                      value={survey.materialCostYear}
                      onChange={(val) => updateSurvey({ materialCostYear: val })}
                      unit={moneyUnit}
                    />
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <span>Mã 621 BCTC: <strong>{formatVietnameseCurrencyText(survey.materialCostYear)}</strong></span>
                      <button
                        type="button"
                        onClick={() => updateSurvey({ materialCostYear: Math.round(latestGdt * currentBenchmark.kChuan3) })}
                        className="font-bold text-brand-700 hover:underline dark:text-cyan-400"
                        title="Tự động tính theo định mức % doanh thu của nhóm ngành"
                      >
                        ⚡ Nạp chuẩn ({(currentBenchmark.kChuan3 * 100).toFixed(0)}% DT = {formatVietnameseCurrencyText(Math.round(latestGdt * currentBenchmark.kChuan3))})
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Tuổi Bình Quân Của Máy Móc, Thiết Bị Chính (Năm)
                      </label>
                      <span className="text-xs text-brand-700 dark:text-cyan-400 font-semibold">Chọn nhanh theo khung:</span>
                    </div>
                    {/* Nút chọn nhanh khung tuổi theo quy chuẩn TT17 */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[
                        { label: "≤ 5 năm (Mới)", val: 4 },
                        { label: "6 - 10 năm", val: 7.5 },
                        { label: "11 - 15 năm", val: 12 },
                        { label: "> 15 năm", val: 16 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => updateSurvey({ averageEquipmentAge: preset.val })}
                          className={`px-2 py-1 text-xs rounded-md font-medium border transition ${
                            survey.averageEquipmentAge === preset.val
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
                      step="0.5"
                      value={survey.averageEquipmentAge || 7.5}
                      onChange={(e) => updateSurvey({ averageEquipmentAge: parseFloat(e.target.value) || 0 })}
                      className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
                    />
                    <span className="text-xs text-slate-500 mt-1 block">Tuổi trung bình của dây chuyền máy móc phục vụ sản xuất.</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Tỷ Lệ Tiêu Hao Nguyên Vật Liệu Trong Định Mức (%)
                      </label>
                      <span className="text-xs text-brand-700 dark:text-cyan-400 font-semibold">Chọn nhanh:</span>
                    </div>
                    {/* Nút chọn nhanh tỷ lệ */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[
                        { label: "90%", val: 90 },
                        { label: "95% (Chuẩn)", val: 95 },
                        { label: "98%", val: 98 },
                        { label: "100% (Tối ưu)", val: 100 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => updateSurvey({ materialConsumptionRatio: preset.val })}
                          className={`px-2 py-1 text-xs rounded-md font-medium border transition ${
                            survey.materialConsumptionRatio === preset.val
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
                      value={survey.materialConsumptionRatio || 95}
                      onChange={(e) => updateSurvey({ materialConsumptionRatio: parseFloat(e.target.value) || 0 })}
                      className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
                    />
                    <span className="text-xs text-slate-500 mt-1 block">Hiệu suất sử dụng nguyên vật liệu so với định mức kỹ thuật.</span>
                  </div>
                </div>

                {/* Danh sách máy móc động */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                      Danh Sách Máy Móc, Thiết Bị Sản Xuất Chính Trong Xưởng
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddMachinery}
                      className="px-3 py-1.5 rounded-lg bg-brand-700 text-white text-xs font-semibold hover:bg-brand-800 flex items-center gap-1 shadow-sm transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm Thiết Bị
                    </button>
                  </div>

                  <div className="space-y-3">
                    {survey.machineries.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 space-y-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              Thiết Bị #{idx + 1}: Tên Máy Móc / Dây Chuyền Sản Xuất
                            </span>
                            <input
                              type="text"
                              value={m.name}
                              onChange={(e) => handleUpdateMachinery(idx, { name: e.target.value })}
                              className="w-full h-[40px] px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-brand-500"
                              placeholder="Ví dụ: Máy tiện CNC 5 trục Doosan Puma"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMachinery(idx)}
                            className="text-rose-600 hover:text-rose-800 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition mt-4"
                            title="Xóa thiết bị này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Xuất Xứ:</span>
                            <input
                              type="text"
                              value={m.originCountry || "Việt Nam"}
                              onChange={(e) => handleUpdateMachinery(idx, { originCountry: e.target.value })}
                              className="w-full h-[40px] px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500"
                              placeholder="Nhập hoặc bấm chọn..."
                            />
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {["Việt Nam", "Nhật Bản", "Đức", "Hàn Quốc", "Trung Quốc"].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => handleUpdateMachinery(idx, { originCountry: c })}
                                  className="text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-brand-100 dark:hover:bg-brand-900 text-slate-700 dark:text-slate-200"
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Năm Chế Tạo:</span>
                            <input
                              type="number"
                              value={m.manufactureYear}
                              onChange={(e) => handleUpdateMachinery(idx, { manufactureYear: parseInt(e.target.value) || 2020 })}
                              className="w-full h-[40px] px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500"
                            />
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block mb-1">Nguyên Giá:</span>
                            <FormattedMoneyInput
                              value={m.originalCost || 0}
                              onChange={(val) => handleUpdateMachinery(idx, { originalCost: val })}
                              unit={moneyUnit}
                              className="h-[40px] py-1.5 text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-3 pt-5 sm:pt-6">
                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                              <input
                                type="checkbox"
                                checked={m.isAutomated || false}
                                onChange={(e) => handleUpdateMachinery(idx, { isAutomated: e.target.checked })}
                                className="rounded border-slate-300"
                              />
                              <span>Tự động hóa / CNC</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BƯỚC 3: MỤC C - NHÓM E (HIỆU QUẢ KHAI THÁC) */}
            {currentStep === 3 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      Mục C · Nhóm E: Hiệu Quả Khai Thác Công Nghệ (20 điểm)
                    </span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                    {scoreResult.scoreE} / 20 điểm
                  </span>
                </div>

                {/* Bảng chuỗi số liệu 3 năm */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                        Bảng Số Liệu Sản Xuất & Kinh Doanh 3 Năm Liền Kề
                      </h3>
                      <p className="text-xs text-slate-500">
                        Trích xuất từ Báo cáo kết quả hoạt động kinh doanh (KQKD) & Báo cáo thống kê sản xuất.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-3 w-16 text-center">Năm</th>
                          <th className="p-3 min-w-[170px]">
                            <div>Giá Trị Sản Xuất</div>
                            <span className="text-xs font-normal text-slate-500 block">Báo cáo thống kê</span>
                          </th>
                          <th className="p-3 min-w-[170px]">
                            <div>Doanh Thu Thuần</div>
                            <span className="text-xs font-normal text-slate-500 block">Mã số 01 - KQKD</span>
                          </th>
                          <th className="p-3 min-w-[120px]">
                            <div>Lao Động Sản Xuất</div>
                            <span className="text-xs font-normal text-slate-500 block">Công nhân trực tiếp</span>
                          </th>
                          <th className="p-3 min-w-[170px]">
                            <div>Tổng Chi Phí SXKD</div>
                            <span className="text-xs font-normal text-slate-500 block">Mã 11 + 22 + 25</span>
                          </th>
                          <th className="p-3 min-w-[130px] text-right">
                            <div>Năng Suất LĐ</div>
                            <span className="text-xs font-normal text-slate-500 block">Doanh thu / Người</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {survey.financialSeries.map((item, idx) => {
                          const nslđ = item.directWorkersCount > 0 ? item.netRevenue / item.directWorkersCount : 0;
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
                  <span className="text-xs text-slate-500 mt-1 block">
                    * Hệ thống tự động tính toán tốc độ tăng trưởng năng suất lao động bình quân (TC08) từ chuỗi số liệu trên.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                  {/* TC09: Sáng kiến Kaizen */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      TC09 · Áp Dụng Sáng Kiến Cải Tiến Kỹ Thuật (Kaizen / 5S / Lean)
                    </label>
                    <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
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
                    </div>
                  </div>

                  {/* TC10: Năng Lực Bảo Dưỡng */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      TC10 · Cấp Độ Bảo Dưỡng, Sửa Chữa Máy Móc Thiết Bị
                    </label>
                    <select
                      value={survey.maintenanceLevel}
                      onChange={(e) => updateSurvey({ maintenanceLevel: (parseInt(e.target.value) || 2) as any })}
                      className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 leading-normal"
                    >
                      <option value={1}>Cấp 1: Chỉ sửa chữa khi phát sinh sự cố hư hỏng (1.0đ)</option>
                      <option value={2}>Cấp 2: Bảo dưỡng định kỳ theo lịch khuyến cáo của nhà sản xuất (2.0đ)</option>
                      <option value={3}>Cấp 3: Bảo dưỡng chuyên sâu, có sẵn danh mục linh kiện dự phòng (3.0đ)</option>
                      <option value={4}>Cấp 4: Bảo dưỡng dự đoán (Predictive Maintenance / Chẩn đoán cảm biến rung động) (4.0đ)</option>
                    </select>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Đánh giá khả năng chủ động phòng ngừa sự cố máy móc tại xưởng.
                    </span>
                  </div>

                  {/* TC11: Chuyển Giao Công Nghệ */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      TC11 · Hình Thức Tiếp Nhận Chuyển Giao Công Nghệ Trong 3 Năm
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-3">
                      {[
                        { key: "dong_bo", label: "Chuyển giao đồng bộ dây chuyền (1.0đ)" },
                        { key: "ban_quyen", label: "Mua bản quyền, li-xăng công nghệ (2.0đ)" },
                        { key: "cai_tien", label: "Cải tiến, giải mã công nghệ (3.0đ)" },
                        { key: "sang_che", label: "Bằng độc quyền sáng chế (4.0đ)" },
                      ].map((item) => {
                        const checked = survey.transferredTechTypes.includes(item.key);
                        return (
                          <label key={item.key} className="flex items-center gap-1.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const list = e.target.checked
                                  ? [...survey.transferredTechTypes, item.key]
                                  : survey.transferredTechTypes.filter((x) => x !== item.key);
                                updateSurvey({ transferredTechTypes: list });
                              }}
                              className="rounded border-slate-300 text-brand-700"
                            />
                            <span>{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tổng Giá Trị Hợp Đồng Chuyển Giao Công Nghệ
                      </span>
                      <FormattedMoneyInput
                        value={survey.transferredTechValue}
                        onChange={(val) => updateSurvey({ transferredTechValue: val })}
                        unit={moneyUnit}
                      />
                      <span className="text-xs text-slate-500 mt-1 block">
                        Tổng giá trị hợp đồng: <strong>{formatVietnameseCurrencyText(survey.transferredTechValue)}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BƯỚC 4: MỤC D - NHÓM O (QUẢN TRỊ & TỔ CHỨC) */}
            {currentStep === 4 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-amber-600" />
                    <span>Mục D · Nhóm O: Năng Lực Tổ Chức, Quản Lý (19 điểm)</span>
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {scoreResult.scoreO} / 19 điểm
                  </span>
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      TC13 · Hệ Thống Quản Lý Chất Lượng Đã Được Chứng Nhận
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
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
                            />
                            <span>Chứng nhận {iso}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      TC14 · Phần Mềm Ứng Dụng Trong Quản Trị & Sản Xuất
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      {["ERP", "MES", "PLM", "PDM", "PPS", "SCM"].map((sw) => {
                        const checked = survey.softwareApplications.includes(sw);
                        return (
                          <label key={sw} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const list = e.target.checked
                                  ? [...survey.softwareApplications, sw]
                                  : survey.softwareApplications.filter((x) => x !== sw);
                                updateSurvey({ softwareApplications: list });
                              }}
                            />
                            <span>Hệ thống {sw}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* TC13: Chi phí đào tạo */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-3">
                      TC13 · Chi Phí Đào Tạo & Bồi Dưỡng Nhân Lực
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Tổng Chi Phí Đào Tạo Huấn Luyện 3 Năm (G_dthl)
                        </label>
                        <FormattedMoneyInput
                          value={survey.trainingCost3Years}
                          onChange={(val) => updateSurvey({ trainingCost3Years: val })}
                          unit={moneyUnit}
                        />
                        <span className="text-xs text-slate-500 mt-1 block">
                          Mã BCTC: <strong>{formatVietnameseCurrencyText(survey.trainingCost3Years)}</strong> (Tỷ lệ: {latestGdt > 0 ? ((survey.trainingCost3Years / latestGdt) * 100).toFixed(2) : 0}% DT, ≥ 1% đạt 2.0đ, ≥ 2% đạt 3.0đ).
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Số Lao Động Qua Đào Tạo Nghề (Người)
                        </label>
                        <input
                          type="number"
                          value={survey.trainedWorkers}
                          onChange={(e) => updateSurvey({ trainedWorkers: parseInt(e.target.value) || 0 })}
                          className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="text-xs text-slate-500 mt-1 block">
                          Tỷ lệ qua đào tạo: <strong>{survey.totalWorkforce > 0 ? ((survey.trainedWorkers / survey.totalWorkforce) * 100).toFixed(1) : "0.0"}%</strong> (≥ 50% đạt tối đa cho TC12).
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* TC15: Hiệu suất thiết bị tổng thể OEE */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        TC15 · Hiệu Suất Thiết Bị Tổng Thể OEE / Tỷ Lệ Khai Thác Công Suất (P_tt / P)
                      </label>
                      <span className="text-xs text-brand-700 dark:text-cyan-400 font-semibold">Chọn nhanh theo mức OEE:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
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
                            className={`px-2 py-1 text-xs rounded-md font-medium border transition ${
                              isSelected
                                ? "bg-brand-700 text-white border-brand-700 shadow-sm"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-400"
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs text-slate-500 block">
                      Tỷ lệ sản lượng thực tế so với công suất thiết kế: <strong>{(((survey.financialSeries?.[survey.financialSeries.length - 1]?.actualOutput || 85) / (survey.financialSeries?.[survey.financialSeries.length - 1]?.designedCapacity || 100)) * 100).toFixed(0)}%</strong> (≥ 85% đạt 5.0đ tối đa).
                    </span>
                  </div>

                  {/* TC12: Cơ cấu nhân lực sản xuất */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-3">
                      TC12 · Trình Độ Chuyên Môn & Cơ Cấu Lao Động
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Lao Động Trực Tiếp (M_tt)
                          </label>
                          <button
                            type="button"
                            onClick={() => updateSurvey({ directWorkers: latestDirectWorkers })}
                            className="text-xs font-bold text-brand-700 hover:underline dark:text-cyan-400"
                            title="Đồng bộ số lượng công nhân từ Báo cáo tài chính 3 năm"
                          >
                            ⚡ Đồng bộ ({latestDirectWorkers})
                          </button>
                        </div>
                        <input
                          type="number"
                          value={survey.directWorkers}
                          onChange={(e) => updateSurvey({ directWorkers: parseInt(e.target.value) || 0 })}
                          className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="text-xs text-slate-500 mt-1 block">Công nhân trực tiếp đứng máy/dây chuyền.</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Công Nhân Bậc Cao / Nghệ Nhân (M_bc)
                        </label>
                        <input
                          type="number"
                          value={survey.highSkilledWorkers}
                          onChange={(e) => updateSurvey({ highSkilledWorkers: parseInt(e.target.value) || 0 })}
                          className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="text-xs text-slate-500 mt-1 block">
                          Tỷ lệ: <strong>{survey.directWorkers > 0 ? ((survey.highSkilledWorkers / survey.directWorkers) * 100).toFixed(1) : "0.0"}%</strong> (≥ 15% đạt 3.0đ tối đa).
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Cán Bộ Quản Lý Đạt Chuẩn (M_ql)
                        </label>
                        <input
                          type="number"
                          value={survey.qualifiedManagers}
                          onChange={(e) => updateSurvey({ qualifiedManagers: parseInt(e.target.value) || 0 })}
                          className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="text-xs text-slate-500 mt-1 block">
                          Tỷ lệ: <strong>{survey.totalWorkforce > 0 ? ((survey.qualifiedManagers / survey.totalWorkforce) * 100).toFixed(1) : "0.0"}%</strong> (≥ 80% đạt 2.0đ tối đa).
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={survey.environmentalCompliant}
                        onChange={(e) => updateSurvey({ environmentalCompliant: e.target.checked })}
                        className="rounded border-slate-300"
                      />
                      <span>TC17 · Doanh nghiệp tuân thủ 100% quy định pháp luật về bảo vệ môi trường, có hệ thống xử lý chất thải đạt chuẩn</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={survey.hasWasteRecycling}
                        onChange={(e) => updateSurvey({ hasWasteRecycling: e.target.checked })}
                        className="rounded border-slate-300"
                      />
                      <span>TC17 · Có giải pháp thu gom, tái chế và tái sử dụng chất thải trong tuần hoàn sản xuất (+1.0 điểm)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* BƯỚC 5: MỤC Đ - NHÓM R (R&D) */}
            {currentStep === 5 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-rose-600" />
                    <span>Mục Đ · Nhóm R: Năng Lực Nghiên Cứu & Phát Triển (17 điểm)</span>
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                    {scoreResult.scoreR} / 17 điểm
                  </span>
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* TC18: Đã điều chỉnh chiều cao chuẩn h-[42px] px-3.5 py-2.5 */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC18 · Mức Độ Đầu Tư Hạ Tầng Công Nghệ Thông Tin
                      </label>
                      <select
                        value={survey.itInfrastructureLevel}
                        onChange={(e) => updateSurvey({ itInfrastructureLevel: (parseInt(e.target.value) || 1) as any })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 leading-normal"
                      >
                        <option value={1}>Mức 1: Mạng LAN, Internet cơ bản (1.0đ)</option>
                        <option value={2}>Mức 2: Tự động hóa quy trình nghiệp vụ, máy chủ nội bộ (2.0đ)</option>
                        <option value={3}>Mức 3: Tích hợp toàn diện Cloud/Trung tâm dữ liệu đạt chuẩn ISO 27001 (3.0đ)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC19 · Tổng Chi Phí Đầu Tư CNTT 3 Năm (G_tt)
                      </label>
                      <FormattedMoneyInput
                        value={survey.itExpenses3Years}
                        onChange={(val) => updateSurvey({ itExpenses3Years: val })}
                        unit={moneyUnit}
                      />
                      <span className="text-xs text-slate-500 mt-1 block">
                        Đầu tư CNTT: <strong>{formatVietnameseCurrencyText(survey.itExpenses3Years)}</strong>
                      </span>
                    </div>

                    {/* TC21: Đã điều chỉnh chiều cao chuẩn h-[42px] px-3.5 py-2.5 */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC21 · Cơ Sở Vật Chất Phục Vụ Nghiên Cứu & Thiết Kế
                      </label>
                      <select
                        value={survey.rdFacilityLevel}
                        onChange={(e) => updateSurvey({ rdFacilityLevel: (parseInt(e.target.value) || 1) as any })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 leading-normal"
                      >
                        <option value={1}>Mức 1: Bộ phận kiêm nhiệm (1.0đ)</option>
                        <option value={2}>Mức 2: Có phòng thí nghiệm / phòng thiết kế CAD/CAM chuyên trách (2.0đ)</option>
                        <option value={3}>Mức 3: Viện hoặc Trung tâm R&D chuyên biệt hiện đại (3.0đ)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC20 · Số Lượng Nhân Lực R&D Chuyên Trách (M_r&d)
                      </label>
                      <input
                        type="number"
                        value={survey.rdWorkforceCount}
                        onChange={(e) => updateSurvey({ rdWorkforceCount: parseInt(e.target.value) || 0 })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
                      />
                      <span className="text-xs text-slate-500 mt-1 block">
                        Tỷ lệ nhân lực R&D: {((survey.rdWorkforceCount / (survey.totalWorkforce || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC22 · Tổng Kinh Phí Chi Cho R&D Trong 3 Năm (G_rd)
                      </label>
                      <FormattedMoneyInput
                        value={survey.rdExpenses3Years}
                        onChange={(val) => updateSurvey({ rdExpenses3Years: val })}
                        unit={moneyUnit}
                      />
                      <span className="text-xs text-slate-500 mt-1 block">
                        Chi R&D: <strong>{formatVietnameseCurrencyText(survey.rdExpenses3Years)}</strong>
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
                        <span>TC22 · Doanh nghiệp có trích lập và sử dụng Quỹ Phát triển KH&CN theo quy định (Nghị định 95/2014) (+1.0 điểm)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BƯỚC 6: MỤC E - NHÓM I (ĐỔI MỚI SÁNG TẠO & 4.0) */}
            {currentStep === 6 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-teal-600" />
                    <span>Mục E · Nhóm I: Năng Lực Đổi Mới Sáng Tạo (14 điểm)</span>
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    {scoreResult.scoreI} / 14 điểm
                  </span>
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* TC23: Đã điều chỉnh chiều cao chuẩn h-[42px] px-3.5 py-2.5 */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC23 · Loại Sản Phẩm Mới Tạo Ra Trong 3 Năm Qua
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
                          { label: "10%", val: 10 },
                          { label: "20% (+1.0đ)", val: 20 },
                          { label: "30%", val: 30 },
                          { label: "50%", val: 50 },
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
                      <span className="text-xs text-slate-500 mt-1 block">Nếu &ge; 20% doanh thu thuần được cộng thêm +1.0 điểm.</span>
                    </div>

                    {/* TC24: Đã điều chỉnh chiều cao chuẩn h-[42px] px-3.5 py-2.5 */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC24 · Kết Quả Nghiên Cứu KH&CN Áp Dụng
                      </label>
                      <select
                        value={survey.rdTechnologyResult}
                        onChange={(e) => updateSurvey({ rdTechnologyResult: e.target.value as any })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 leading-normal"
                      >
                        <option value="none">Chưa ứng dụng kết quả nghiên cứu (0.0đ)</option>
                        <option value="dang_nghien_cuu">Đang trong giai đoạn nghiên cứu thử nghiệm (1.0đ)</option>
                        <option value="thu_nghiem_lab">Đã thử nghiệm thành công quy mô phòng lab (2.0đ)</option>
                        <option value="giai_phap_huu_ich">Đã được cấp văn bằng Giải pháp hữu ích (3.0đ)</option>
                        <option value="bang_sang_che">Đã được cấp Bằng độc quyền Sáng chế bảo hộ (4.0đ)</option>
                      </select>
                    </div>

                    {/* TC25: Đã điều chỉnh chiều cao chuẩn h-[42px] px-3.5 py-2.5 */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        TC25 · Hợp Tác Với Viện Nghiên Cứu, Trường Đại Học
                      </label>
                      <select
                        value={survey.academyPartnershipType}
                        onChange={(e) => updateSurvey({ academyPartnershipType: e.target.value as any })}
                        className="w-full h-[42px] px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 leading-normal"
                      >
                        <option value="none">Không có hoạt động hợp tác (0.0đ)</option>
                        <option value="chuyen_gia_dao_tao">Mời chuyên gia tư vấn, đào tạo kỹ thuật (1.0đ)</option>
                        <option value="du_an_rd">Cùng thực hiện đề tài / dự án R&D chuyển giao công nghệ (2.0đ)</option>
                      </select>
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
