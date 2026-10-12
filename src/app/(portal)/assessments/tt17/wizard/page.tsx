"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppButton } from "@/components/ui/design-system";
import {
  Tt17SurveyData,
  INITIAL_SURVEY_DATA,
  calculateLocalScore,
  saveAssessmentDraft,
  submitAssessment,
  MachineryItem,
} from "@/services/api/assessment-tt17";
import { lookupTaxCode, fetchMyEnterpriseProfile } from "@/lib/enterprise-client";
import { getStoredSession } from "@/lib/auth-client";
import { PROVINCES_63 } from "@/app/khao-sat-nhu-cau/types";
import {
  Award,
  Layers,
  Save,
  Send,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
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
  const [scopeId, setScopeId] = useState("HP");
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
            if (profile.sectorCode) {
              setIndustryCode(profile.sectorCode);
            }
            showToast(`Đã tự động nạp hồ sơ Doanh nghiệp "${profile.name || 'Đã đăng ký'}".`);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Hybrid Tax Lookup: Tra cứu tức thời Tên DN, Tỉnh thành và Địa chỉ qua API Cổng Quốc gia / VietQR
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

  // Realtime instant calculation
  const scoreResult = useMemo(() => {
    return calculateLocalScore(survey);
  }, [survey]);

  const updateSurvey = (patch: Partial<Tt17SurveyData>) => {
    setSurvey((prev) => ({ ...prev, ...patch }));
  };

  const handleAddMachinery = () => {
    const newItem: MachineryItem = {
      name: "Thiết bị mới...",
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
    // Validate tối thiểu các trường định danh bắt buộc
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

      const creds = res.credentials || (res.account ? {
        email: res.account.email,
        temporaryPassword: res.account.temporaryPassword || "NacenTech@2026",
        enterpriseCode: res.account.taxCode,
      } : undefined);

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
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Tổng điểm dự báo:</span>
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
      {/* HOA VĂN BÊN DƯỚI: HỌA TIẾT NACENTECH INNOVATION & TECH GRID */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[url('/innovation-hero-background.png')] bg-cover bg-bottom bg-no-repeat opacity-[0.08] dark:opacity-15 mix-blend-multiply"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(#3c5999_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-[0.04]"
      />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Toast Notification */}
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

        {/* Top Header Card với màu sáng và hoa văn đồng bộ */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm mb-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[url('/innovation-hero-background.png')] bg-cover bg-bottom bg-no-repeat opacity-[0.10] dark:opacity-20 mix-blend-multiply"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(#3c5999_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-[0.04]"
          />

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
                <span>Khảo Sát Thực Địa & Tự Đánh Giá Doanh Nghiệp (TT 17/2019/TT-BKHCN)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Kê Khai Đánh Giá Trình Độ & Năng Lực Công Nghệ Sản Xuất
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Điền đầy đủ thông tin theo 26 tiêu chí Phụ lục I. Hệ thống tự động tính điểm real-time, đồng bộ hồ sơ từ CSDL và tự động cấp tài khoản khi hoàn tất.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-2 shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                Lưu Nháp (Auto-Save)
              </button>
              <AppButton variant="primary" onClick={handleSubmit} disabled={saving} className="px-5 py-2.5 text-xs font-bold shadow-md">
                <Send className="w-4 h-4 mr-2" />
                Hoàn Tất & Nộp Hồ Sơ
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

              {/* Khối định danh doanh nghiệp phục vụ khảo sát & cấp tài khoản */}
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
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
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
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleLookupTaxCode}
                        disabled={isLookingUpTax || !survey.taxCode?.trim()}
                        className="px-3 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-cyan-300 dark:hover:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-lg transition shadow-sm disabled:opacity-50"
                        title="Tự động tra cứu Tên DN, Tỉnh thành và Địa chỉ theo MST"
                      >
                        {isLookingUpTax ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Search className="w-3.5 h-3.5" />
                        )}
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
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
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
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
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
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="tt17-scope-id" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tỉnh / Thành Phố Trụ Sở Chính
                    </label>
                    <select
                      id="tt17-scope-id"
                      value={scopeId}
                      onChange={(e) => setScopeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    >
                      <option value="">-- Chọn Tỉnh / Thành phố --</option>
                      {PROVINCES_63.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
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
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-3">
                  2. Thông tin Quy Mô & Ngành Nghề Sản Xuất
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
                    className="form-control w-full text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mã Ngành Chế Biến, Chế Tạo (VSIC C.10 - C.32)
                  </label>
                  <select
                    value={industryCode}
                    onChange={(e) => setIndustryCode(e.target.value)}
                    className="form-control w-full text-sm font-medium"
                  >
                    <option value="C.10">C.10 - Sản xuất chế biến thực phẩm</option>
                    <option value="C.20">C.20 - Sản xuất hoá chất và sản phẩm hoá chất</option>
                    <option value="C.26">C.26 - Sản xuất sản phẩm điện tử, máy vi tính</option>
                    <option value="C.28">C.28 - Sản xuất máy móc, thiết bị chưa phân vào đâu</option>
                    <option value="C.29">C.29 - Sản xuất ô tô và xe có động cơ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tổng Nguồn Vốn Theo BCTC (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={survey.totalCapital}
                    onChange={(e) => updateSurvey({ totalCapital: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                  <span className="text-xs text-slate-500 mt-1 block">Dùng phân nhánh tiêu chí TC20.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tổng Số Lao Động Bình Quân (M)
                  </label>
                  <input
                    type="number"
                    value={survey.totalWorkforce}
                    onChange={(e) => updateSurvey({ totalWorkforce: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                  <span className="text-xs text-slate-500 mt-1 block">Theo định nghĩa Điều 2.8 TT17.</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Địa Chỉ Nhà Máy / Phân Xưởng Chính
                </label>
                <input
                  type="text"
                  value={survey.companyAddress}
                  onChange={(e) => updateSurvey({ companyAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>
          )}

          {/* BƯỚC 2: MỤC B - NHÓM T (THIẾT BỊ & CÔNG NGHỆ) */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-brand-700" />
                  <span>Mục B · Nhóm T: Hiện Trạng Công Nghệ & Thiết Bị (30đ)</span>
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700">
                  {scoreResult.scoreT} / 30 điểm
                </span>
              </h2>

              {/* Danh sách máy móc động */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Danh Sách Máy Móc, Thiết Bị Sản Xuất Chính
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddMachinery}
                    className="px-3 py-1 rounded bg-brand-700 text-white text-xs font-semibold hover:bg-brand-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm Thiết Bị
                  </button>
                </div>

                <div className="space-y-3">
                  {survey.machineries.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => handleUpdateMachinery(idx, { name: e.target.value })}
                          className="flex-1 px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold"
                          placeholder="Tên máy móc/dây chuyền..."
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMachinery(idx)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 block">Xuất Xứ:</span>
                          <input
                            type="text"
                            value={m.originCountry}
                            onChange={(e) => handleUpdateMachinery(idx, { originCountry: e.target.value })}
                            className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500 block">Năm Chế Tạo:</span>
                          <input
                            type="number"
                            value={m.manufactureYear}
                            onChange={(e) => handleUpdateMachinery(idx, { manufactureYear: parseInt(e.target.value) || 2020 })}
                            className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500 block">Nguyên Giá (VNĐ):</span>
                          <input
                            type="number"
                            value={m.originalCost}
                            onChange={(e) => handleUpdateMachinery(idx, { originalCost: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={m.isAutomated}
                              onChange={(e) => handleUpdateMachinery(idx, { isAutomated: e.target.checked })}
                            />
                            <span>Tự động/CNC</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tỷ lệ tham số TC01 - TC07 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    TC01 · Hệ Số Hao Mòn K_kh (0.0 - 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={survey.depreciationCoefficient}
                    onChange={(e) => updateSurvey({ depreciationCoefficient: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                  <span className="text-xs text-slate-500 mt-1 block">Tỷ lệ hao mòn lũy kế/nguyên giá.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    TC02 · Tỷ Lệ Thiết Bị Thế Hệ Mới (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={survey.modernEquipmentRatio}
                    onChange={(e) => updateSurvey({ modernEquipmentRatio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    TC04 · Tỷ Lệ Máy Móc Tự Động Hóa CNC/Robot (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={survey.automationRatio}
                    onChange={(e) => updateSurvey({ automationRatio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    TC05 · Tuổi Bình Quân Máy Móc Chính (Năm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={survey.averageEquipmentAge}
                    onChange={(e) => updateSurvey({ averageEquipmentAge: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BƯỚC 3: MỤC C - NHÓM E (HIỆU QUẢ KHAI THÁC) */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <span>Mục C · Nhóm E: Hiệu Quả Khai Thác Công Nghệ (20đ)</span>
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  {scoreResult.scoreE} / 20 điểm
                </span>
              </h2>

              {/* Bảng chuỗi số liệu 3 năm */}
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-2">
                  Chuỗi Số Liệu 3 Năm Liền Kề Trước Năm Đánh Giá (BR-09-001)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 font-bold uppercase">
                      <tr>
                        <th className="p-3">Năm</th>
                        <th className="p-3">Giá Trị Sản Xuất G_sp (VNĐ)</th>
                        <th className="p-3">Doanh Thu Thuần G_dt (VNĐ)</th>
                        <th className="p-3">Lao Động Trực Tiếp M_tt (Người)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {survey.financialSeries.map((item, idx) => (
                        <tr key={item.year}>
                          <td className="p-3 font-bold">{item.year}</td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={item.industrialOutputValue}
                              onChange={(e) => {
                                const list = [...survey.financialSeries];
                                list[idx].industrialOutputValue = parseFloat(e.target.value) || 0;
                                updateSurvey({ financialSeries: list });
                              }}
                              className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={item.netRevenue}
                              onChange={(e) => {
                                const list = [...survey.financialSeries];
                                list[idx].netRevenue = parseFloat(e.target.value) || 0;
                                updateSurvey({ financialSeries: list });
                              }}
                              className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={item.directWorkersCount}
                              onChange={(e) => {
                                const list = [...survey.financialSeries];
                                list[idx].directWorkersCount = parseInt(e.target.value) || 0;
                                updateSurvey({ financialSeries: list });
                              }}
                              className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    TC09 · Tỷ Lệ Sản Phẩm Hỏng/Lỗi (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={survey.defectProductRatio}
                    onChange={(e) => updateSurvey({ defectProductRatio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    TC10 · Mức Sử Dụng Công Suất Thiết Kế (%)
                  </label>
                  <input
                    type="number"
                    value={survey.capacityUtilizationRatio}
                    onChange={(e) => updateSurvey({ capacityUtilizationRatio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
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
                  <span>Mục D · Nhóm O: Năng Lực Tổ Chức, Quản Lý (19đ)</span>
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                  {scoreResult.scoreO} / 19 điểm
                </span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    TC13 · Hệ Thống Quản Lý Chất Lượng (ISO...) Đã Đạt Chứng Nhận
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    {["ISO 9001:2015", "ISO 14001:2015", "ISO 22000 / HACCP", "ISO 45001", "IATF 16949"].map((iso) => {
                      const checked = survey.isoCertifications.includes(iso);
                      return (
                        <label key={iso} className="flex items-center gap-2 p-2 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">
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
                          <span>{iso}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    TC14 · Ứng Dụng Phần Mềm Quản Trị ERP / MES
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    {["ERP SAP / Oracle", "Hệ Thống MES", "Phần Mềm CRM/SCM", "CAD / CAM / CAE"].map((sw) => {
                      const checked = survey.softwareApplications.includes(sw);
                      return (
                        <label key={sw} className="flex items-center gap-2 p-2 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">
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
                          <span>{sw}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={survey.environmentalCompliant}
                      onChange={(e) => updateSurvey({ environmentalCompliant: e.target.checked })}
                    />
                    <span>TC17 · Doanh nghiệp tuân thủ 100% quy định pháp luật về bảo vệ môi trường & xử lý chất thải</span>
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
                  <span>Mục Đ · Nhóm R: Năng Lực Nghiên Cứu & Phát Triển (17đ)</span>
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700">
                  {scoreResult.scoreR} / 17 điểm
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    TC18 · Số Lượng Kỹ Sư / Nhân Sự R&D Chuyên Trách
                  </label>
                  <input
                    type="number"
                    value={survey.rdWorkforceCount}
                    onChange={(e) => updateSurvey({ rdWorkforceCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                  <span className="text-xs text-slate-500 mt-1 block">Tỷ lệ: {((survey.rdWorkforceCount / (survey.totalWorkforce || 1)) * 100).toFixed(1)}%</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    TC20 · Tỷ Lệ Kinh Phí Dành Cho R&D Trên Tổng Doanh Thu (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={survey.rdExpenseRatio}
                    onChange={(e) => updateSurvey({ rdExpenseRatio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={survey.hasLabOrTestingFacility}
                    onChange={(e) => updateSurvey({ hasLabOrTestingFacility: e.target.checked })}
                  />
                  <span>TC19 · Có phòng thí nghiệm, trạm kiểm thử hoặc xưởng thiết kế mô phỏng CAD/CAM nội bộ</span>
                </label>
              </div>
            </div>
          )}

          {/* BƯỚC 6: MỤC E - NHÓM I (ĐỔI MỚI SÁNG TẠO & SHTT) */}
          {currentStep === 6 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-teal-600" />
                  <span>Mục E · Nhóm I: Năng Lực Đổi Mới Sáng Tạo (14đ)</span>
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700">
                  {scoreResult.scoreI} / 14 điểm
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    TC23 · Số Bằng Sáng Chế / Giải Pháp Hữu Ích Đã Cấp
                  </label>
                  <input
                    type="number"
                    value={survey.grantedPatentsCount}
                    onChange={(e) => updateSurvey({ grantedPatentsCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    TC24 · Tỷ Lệ Doanh Thu Từ Sản Phẩm Mới Trong 3 Năm (%)
                  </label>
                  <input
                    type="number"
                    value={survey.newProductRevenueRatio}
                    onChange={(e) => updateSurvey({ newProductRevenueRatio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={survey.hasInternalInnovationPolicy}
                    onChange={(e) => updateSurvey({ hasInternalInnovationPolicy: e.target.checked })}
                  />
                  <span>TC26 · Có quy chế khen thưởng và quỹ hỗ trợ sáng kiến cải tiến kỹ thuật nội bộ</span>
                </label>
              </div>
            </div>
          )}

          {/* Wizard Pagination Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 flex items-center gap-1"
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

        {/* Right Column: Sticky Realtime Scorecard & Radar Chart (1 col wide) */}
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
              <div className="text-sm font-bold text-brand-800 dark:text-brand-300">
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
                  <span>Nhóm T (Thiết bị)</span>
                  <span>{scoreResult.scoreT}/30</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-700 h-full rounded-full" style={{ width: `${(scoreResult.scoreT / 30) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Nhóm E (Hiệu quả)</span>
                  <span>{scoreResult.scoreE}/20</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(scoreResult.scoreE / 20) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Nhóm O (Quản trị)</span>
                  <span>{scoreResult.scoreO}/19</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: `${(scoreResult.scoreO / 19) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Nhóm R (Nghiên cứu)</span>
                  <span>{scoreResult.scoreR}/17</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-full" style={{ width: `${(scoreResult.scoreR / 17) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Nhóm I (Đổi mới ST)</span>
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
                  <span>Phát hiện {scoreResult.bottlenecks.length} điểm nghẽn (&lt;40%):</span>
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
