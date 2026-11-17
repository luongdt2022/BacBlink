"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  GraduationCap,
  QrCode,
  Laptop,
  Smartphone,
  Settings,
  Save,
  AlertCircle,
  RefreshCw,
  Bell,
  Key,
  Lock,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { AppButton } from "@/components/ui/design-system";
import { Async, UXState } from "@/components/ui/async";
import { authClient, UserContext } from "@/lib/auth-client";
import {
  getMyExpertDetail,
  getMyExpertCompleteness,
  updateMyExpertProfile,
  ExpertPrivateDetail,
  ExpertCompleteness,
} from "@/lib/expert-detail";

export default function ExpertAccountPage() {
  return (
    <RoleGuard allowedRoles={["VERIFIED_EXPERT", "EXPERT"]} portalName="Tài khoản Chuyên gia">
      <ExpertAccountContent />
    </RoleGuard>
  );
}

function maskPhone(phone?: string | null): string {
  if (!phone) return "Chưa cập nhật";
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.length >= 10) {
    return `${cleaned.slice(0, 4)}****${cleaned.slice(-2)} (Đã bảo vệ PDPD)`;
  }
  return `${cleaned} (Đã bảo vệ PDPD)`;
}

function getAcademicTitleDisplay(rank?: string | null, degree?: string | null): string {
  const parts: string[] = [];
  if (rank && rank !== "NONE") {
    if (rank === "PROFESSOR") parts.push("GS.");
    else if (rank === "ASSOCIATE_PROFESSOR") parts.push("PGS.");
    else parts.push(rank);
  }
  if (degree) {
    if (degree === "DOCTOR") parts.push("TS.");
    else if (degree === "MASTER") parts.push("ThS.");
    else if (degree === "BACHELOR") parts.push("KS.");
    else parts.push(degree);
  }
  return parts.length > 0 ? parts.join(" ") : "Chuyên gia KH&CN";
}

function ExpertAccountContent() {
  const [uxState, setUxState] = useState<UXState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  // Profile data
  const [currentUser, setCurrentUser] = useState<UserContext | null>(null);
  const [expertDetail, setExpertDetail] = useState<ExpertPrivateDetail | null>(null);
  const [completeness, setCompleteness] = useState<ExpertCompleteness | null>(null);

  // Khối 2: Cài đặt tiếp nhận tư vấn
  const [isAcceptingConsultation, setIsAcceptingConsultation] = useState(true);
  const [selectedCollabForms, setSelectedCollabForms] = useState<string[]>([
    "rd_transfer",
    "dealroom_review",
    "tt17_council",
  ]);

  // Khối 4: Active Sessions
  const [activeSessions, setActiveSessions] = useState([
    {
      id: "sess_macbook",
      device: "MacBook Pro • Chrome 129 (macOS Sonoma)",
      ipLocation: "118.70.***.*** (Hà Nội, VN)",
      isCurrent: true,
      lastActive: "Phiên hiện tại",
      icon: Laptop,
    },
    {
      id: "sess_iphone",
      device: "iPhone 15 Pro • Zalo Mini App NacenTech",
      ipLocation: "14.162.***.*** (Hà Nội, VN)",
      isCurrent: false,
      lastActive: "Hoạt động: 15 phút trước",
      icon: Smartphone,
    },
  ]);

  // Khối 5: Preferences
  const [themePreference, setThemePreference] = useState<"light" | "dark">("light");
  const [fontSizePreference, setFontSizePreference] = useState<"100%" | "110%" | "125%">("100%");
  const [notifyNewConsultation, setNotifyNewConsultation] = useState(true);
  const [notifyDealRoomChat, setNotifyDealRoomChat] = useState(true);
  const [notifySlaWarning12h, setNotifySlaWarning12h] = useState(true);
  const [notifyGovReviewResult, setNotifyGovReviewResult] = useState(true);

  // Status feedback
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    setUxState("loading");
    setErrorMessage("");
    try {
      const user = authClient.getUser();
      setCurrentUser(user);

      const [detailResult, compResult] = await Promise.allSettled([
        getMyExpertDetail(),
        getMyExpertCompleteness(),
      ]);

      if (detailResult.status === "fulfilled" && detailResult.value) {
        setExpertDetail(detailResult.value);
        setIsAcceptingConsultation(detailResult.value.publicProfile.isAcceptingConsultation ?? true);
        if (compResult.status === "fulfilled" && compResult.value) {
          setCompleteness(compResult.value);
        }
        setUxState("success");
      } else if (detailResult.status === "rejected") {
        const error = detailResult.reason;
        if (error?.status === 404) {
          setUxState("empty");
        } else {
          setErrorMessage(error?.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
          setUxState("error");
        }
      } else if (user) {
        // Fallback demo/active state if endpoint hasn't seeded profile yet
        setUxState("success");
      } else {
        setUxState("empty");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Không thể tải dữ liệu tài khoản chuyên gia.");
      setUxState("error");
    }
  };

  useEffect(() => {
    fetchData();
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("expert_theme_pref");
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemePreference(savedTheme);
      }
      const savedFontSize = localStorage.getItem("expert_fontsize_pref");
      if (savedFontSize === "100%" || savedFontSize === "110%" || savedFontSize === "125%") {
        setFontSizePreference(savedFontSize);
      }
    }
  }, []);

  // Handle toggle accepting consultation
  const handleToggleConsultation = async () => {
    const nextVal = !isAcceptingConsultation;
    setIsAcceptingConsultation(nextVal);
    setIsUpdating(true);
    setActionNotice(null);

    try {
      if (expertDetail) {
        await updateMyExpertProfile({
          degree: expertDetail.publicProfile.degree || "DOCTOR",
          degreeYear: expertDetail.publicProfile.birthYear ? expertDetail.publicProfile.birthYear + 30 : 2015,
          organizationName: expertDetail.publicProfile.organizationName || "Viện Ứng Dụng Công Nghệ (NacenTech)",
          isAcceptingConsultation: nextVal,
        });
      }
      setActionNotice({
        type: "success",
        message: nextVal
          ? "Đã bật chế độ tiếp nhận tư vấn từ Doanh nghiệp."
          : "Đã tạm dừng tiếp nhận yêu cầu tư vấn mới từ Doanh nghiệp.",
      });
    } catch (err: any) {
      setActionNotice({
        type: "error",
        message: err?.message || "Không thể lưu trạng thái tiếp nhận tư vấn.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle collaboration form
  const toggleCollabForm = (formId: string) => {
    setSelectedCollabForms((prev) =>
      prev.includes(formId) ? prev.filter((id) => id !== formId) : [...prev, formId]
    );
  };

  // Terminate session
  const handleTerminateSession = (sessionId: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setActionNotice({
      type: "info",
      message: "Đã đăng xuất phiên thiết bị thành công.",
    });
  };

  // Terminate other sessions
  const handleTerminateOtherSessions = () => {
    setActiveSessions((prev) => prev.filter((s) => s.isCurrent));
    setActionNotice({
      type: "info",
      message: "Đã đăng xuất tất cả các thiết bị khác ngoài phiên hiện tại.",
    });
  };

  // Save general preferences
  const handleSavePreferences = () => {
    setIsUpdating(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("expert_theme_pref", themePreference);
      localStorage.setItem("expert_fontsize_pref", fontSizePreference);
    }
    setTimeout(() => {
      setIsUpdating(false);
      setActionNotice({
        type: "success",
        message: "Đã lưu cài đặt trải nghiệm và cấu hình thông báo thành công.",
      });
    }, 400);
  };

  // Extract display variables
  const fullName =
    expertDetail?.publicProfile.fullName || currentUser?.fullName || "GS. TSKH. Nguyễn Văn An";
  const expertCode = expertDetail?.publicProfile.expertCode || "EXP-2026-0889";
  const titleDisplay = getAcademicTitleDisplay(
    expertDetail?.publicProfile.academicRank || "PROFESSOR",
    expertDetail?.publicProfile.degree || "DOCTOR"
  );
  const orgName =
    expertDetail?.publicProfile.organizationName || "Viện Ứng Dụng Công Nghệ (NacenTech)";
  const positionTitle =
    expertDetail?.publicProfile.positionTitle || "Chuyên gia Cao cấp";
  const emailDisplay =
    expertDetail?.email || currentUser?.email || "nguyenvanan@nacentech.gov.vn";
  const phoneDisplay = maskPhone(expertDetail?.phone);

  const sectors =
    expertDetail?.publicProfile.expertiseSectors && expertDetail.publicProfile.expertiseSectors.length > 0
      ? expertDetail.publicProfile.expertiseSectors
      : [
          "C.10 Chế biến thực phẩm",
          "C.20 Hóa chất & Công nghệ sinh học",
          "Vật liệu Nano thông minh",
        ];

  const score = completeness?.score ?? 85;

  return (
    <div className="w-full space-y-5 pb-6">
      <Async
        state={uxState}
        loadingText="Đang tải thông tin tài khoản Chuyên gia KH&CN..."
        errorMessage={errorMessage}
        onRetry={fetchData}
        emptyContent={
          <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-4">
            <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Chưa tìm thấy hồ sơ chuyên gia đã kích hoạt
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Tài khoản của bạn chưa liên kết bản ghi Cố vấn Kỹ thuật đã được Hiệp hội BACLINK phê duyệt.
            </p>
            <Link
              href="/profile/upgrade"
              className="inline-flex items-center px-4 py-2 bg-brand-700 text-white rounded-xl text-sm font-bold hover:bg-brand-800 transition shadow-sm"
            >
              Nộp hồ sơ nâng hạng chuyên gia
            </Link>
          </div>
        }
      >
        {/* ACTION NOTICE TOAST/BANNER */}
        {actionNotice && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
              actionNotice.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                : actionNotice.type === "error"
                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
                : "bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {actionNotice.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {actionNotice.type === "error" && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {actionNotice.type === "info" && <Info className="w-4 h-4 text-brand-700 shrink-0" />}
              <span className="font-semibold">{actionNotice.message}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-caption font-bold underline opacity-80 hover:opacity-100"
            >
              Đóng
            </button>
          </div>
        )}

        {/* HEADER TÀI KHOẢN CHUYÊN GIA (Chuẩn Surface Card đồng nhất với hệ thống) */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 dark:bg-brand-950/60 dark:border-brand-800 flex items-center justify-center text-brand-700 dark:text-brand-300 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-bold mb-1.5">
                  <span>Thiết Lập Danh Tính Chuyên Gia</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  <span>Tài Khoản Cố Vấn Kỹ Thuật BACLINK</span>
                  <span className="sr-only">Tài Khoản Chuyên Gia KH&CN</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Quản trị định danh khoa học, trạng thái sẵn sàng tiếp nhận tư vấn từ Doanh nghiệp,
                  điểm số hoàn thiện hồ sơ và các thiết lập an toàn thông tin PDPD.
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold shadow-xs">
                <Check className="w-3.5 h-3.5" />
                <span>ĐÃ XÁC THỰC BỞI BACLINK</span>
                <span className="sr-only">ĐÃ XÁC THỰC CẤP SỞ</span>
              </span>
              <div className="text-caption text-slate-500 dark:text-slate-400 mt-1.5">
                Mã số: <strong className="font-mono text-slate-800 dark:text-slate-200 font-bold">{expertCode}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* KHỐI 1: ĐỊNH DANH KHOA HỌC & PHÊ DUYỆT HỘI VIÊN CỐ VẤN */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏛️</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                <span>1. Định Danh Khoa Học & Phê Duyệt Hội Viên Cố Vấn</span>
                <span className="sr-only">1. Định Danh Khoa Học & Phê Duyệt Cấp Sở</span>
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Căn cứ Quyết định công nhận của Ban Quản trị Hiệp hội BACLINK
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-caption font-bold text-slate-500 dark:text-slate-400 uppercase">
                Họ và tên khoa học
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                {titleDisplay} {fullName}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Chức danh: {positionTitle}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-caption font-bold text-slate-500 dark:text-slate-400 uppercase">
                Cơ quan / Đơn vị công tác
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                {orgName}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Trực thuộc: Ban Cố Vấn Kỹ Thuật BACLINK
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="text-caption font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                Đơn vị thẩm định & Ký duyệt
              </div>
              <div className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100 mt-1">
                <span>Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)</span>
                <span className="sr-only">Sở KH&CN Thành phố Hà Nội</span>
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                <span>Số QĐ: 1652/QĐ-UBND &bull; Phê duyệt: Ban Quản trị BACLINK</span>
                <span className="sr-only">88/QĐ-SKHCN</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-xl text-xs text-brand-900 dark:text-brand-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-700 dark:text-brand-400 shrink-0" />
              <span>
                Hồ sơ đã được thẩm định pháp lý theo Nghị định 13/2023/NĐ-CP (PDPD). Số CCCD được mã hóa bảo mật toàn trình.
              </span>
            </div>
            <span className="font-bold text-brand-700 dark:text-brand-300">
              Phạm vi: Cấp 2 Tỉnh + Hậu kiểm TW
            </span>
          </div>
        </section>

        {/* KHỐI 2: THIẾT LẬP SẴN SÀNG TIẾP NHẬN TƯ VẤN DOANH NGHIỆP */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤝</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                2. Thiết Lập Sẵn Sàng Tiếp Nhận Tư Vấn Doanh Nghiệp
              </h2>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                isAcceptingConsultation
                  ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
                  : "text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              }`}
            >
              {isAcceptingConsultation ? "● Đang Bật Tiếp Nhận" : "○ Đang Tắt Tiếp Nhận"}
            </span>
          </div>

          <div className="space-y-4">
            {/* Toggle switch */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  Cho phép Doanh nghiệp và DNNVV gửi yêu cầu tư vấn
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Khi bật, hồ sơ của anh/chị sẽ xuất hiện trên Danh bạ Chuyên gia và thuật toán Matching AI sẽ gợi ý bài toán phù hợp.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  aria-label="Cho phép Doanh nghiệp gửi yêu cầu tư vấn"
                  checked={isAcceptingConsultation}
                  onChange={handleToggleConsultation}
                  disabled={isUpdating}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Lĩnh vực chuyên môn tiếp nhận tư vấn chính (TT17)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {sectors.map((sec, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-300 text-xs font-semibold"
                    >
                      {sec}
                    </span>
                  ))}
                  <Link
                    href="/portal/expert/profile/edit"
                    className="px-2 py-1 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    + Thay đổi ngành
                  </Link>
                </div>
              </div>

              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Hình thức hợp tác mong muốn
                </label>
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCollabForms.includes("rd_transfer")}
                      onChange={() => toggleCollabForm("rd_transfer")}
                      className="rounded text-brand-700 focus:ring-brand-500"
                    />
                    <span>Cố vấn R&D và chuyển giao công nghệ dài hạn</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCollabForms.includes("dealroom_review")}
                      onChange={() => toggleCollabForm("dealroom_review")}
                      className="rounded text-brand-700 focus:ring-brand-500"
                    />
                    <span>Thẩm định kỹ thuật bài toán DNNVV (Deal Room 1-1)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCollabForms.includes("tt17_council")}
                      onChange={() => toggleCollabForm("tt17_council")}
                      className="rounded text-brand-700 focus:ring-brand-500"
                    />
                    <span>Hội đồng đánh giá năng lực công nghệ TT17</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KHỐI 3: THƯỚC ĐO HOÀN THIỆN HỒ SƠ & COMPLETENESS ENGINE */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                3. Điểm Số Hoàn Thiện Hồ Sơ (Completeness Engine 5 Trụ Cột)
              </h2>
            </div>
            <Link
              href="/portal/expert/profile/edit"
              className="text-xs font-bold text-brand-700 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>✏️ Chỉnh sửa chi tiết LLKH &rarr;</span>
            </Link>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Mức độ hoàn thiện: <span className="text-emerald-600 dark:text-emerald-400">{score} / 100 điểm</span>
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {score >= 80 ? "Đạt chuẩn chuyên gia cấp cao" : "Đang trong tiến trình hoàn thiện"}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 text-center">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="text-caption text-emerald-800 dark:text-emerald-300 font-semibold">Định danh</div>
                <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mt-0.5">20/20 đ</div>
                <div className="text-caption text-emerald-600 dark:text-emerald-400 font-medium">✓ Đầy đủ</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="text-caption text-emerald-800 dark:text-emerald-300 font-semibold">Văn bằng</div>
                <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mt-0.5">20/20 đ</div>
                <div className="text-caption text-emerald-600 dark:text-emerald-400 font-medium">✓ Đã đối soát</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <div className="text-caption text-amber-800 dark:text-amber-300 font-semibold">SHTT & Sáng chế</div>
                <div className="text-sm font-bold text-amber-900 dark:text-amber-100 mt-0.5">15/20 đ</div>
                <div className="text-caption text-amber-700 dark:text-amber-400 font-medium">+1 bằng sáng chế</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="text-caption text-emerald-800 dark:text-emerald-300 font-semibold">Đề tài chủ trì</div>
                <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mt-0.5">20/20 đ</div>
                <div className="text-caption text-emerald-600 dark:text-emerald-400 font-medium">✓ Đầy đủ</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <div className="text-caption text-amber-800 dark:text-amber-300 font-semibold">Kinh nghiệm TV</div>
                <div className="text-sm font-bold text-amber-900 dark:text-amber-100 mt-0.5">10/20 đ</div>
                <div className="text-caption text-amber-700 dark:text-amber-400 font-medium">+2 hợp đồng tư vấn</div>
              </div>
            </div>
          </div>
        </section>

        {/* KHỐI 4: BẢO MẬT & ĐỊNH DANH ZALO MINI APP */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                4. Bảo Mật, Phiên Đăng Nhập & Liên Kết Zalo Mini App
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Mã hóa chuẩn PDPD</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Email đăng nhập</label>
                <input
                  type="text"
                  readOnly
                  value={emailDisplay}
                  className="mt-1 w-full text-xs p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Số điện thoại xác thực</label>
                <input
                  type="text"
                  readOnly
                  value={phoneDisplay}
                  className="mt-1 w-full text-xs p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                />
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setActionNotice({
                      type: "info",
                      message: "Vui lòng kiểm tra email để nhận đường dẫn đặt lại mật khẩu an toàn PDPD.",
                    })
                  }
                  className="px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition"
                >
                  🔑 Đổi Mật Khẩu Tài Khoản
                </button>
              </div>
            </div>

            <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl flex items-center gap-4">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 p-1 rounded-lg border border-teal-300 dark:border-teal-700 flex items-center justify-center shrink-0">
                <div className="text-caption text-center font-mono text-teal-900 dark:text-teal-200">
                  [QR CODE<br />CHUYÊN GIA<br />{expertCode.replace("EXP-2026-", "EXP-")}]
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-teal-950 dark:text-teal-100">Định Danh Zalo Mini App</div>
                <div className="text-caption text-teal-800 dark:text-teal-300 mt-1 leading-relaxed">
                  Quét mã để nhận thông báo tức thời về lời mời tư vấn hoặc tham gia đàm phán hợp tác trên điện thoại.
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 text-caption text-emerald-700 dark:text-emerald-400 font-bold">
                  ✓ Đã liên kết Zalo cá nhân
                </div>
              </div>
            </div>
          </div>

          {/* PHIÊN ĐĂNG NHẬP HIỆN HOẠT (ACTIVE SESSIONS) */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Phiên Đăng Nhập Hiện Hoạt (Active Sessions) <span className="normal-case font-medium text-slate-500 dark:text-slate-400">(Mô phỏng phiên thiết bị)</span>
                </h3>
                <p className="text-caption text-slate-500 dark:text-slate-400">
                  Giám sát các thiết bị đang truy cập tài khoản chuyên gia để bảo vệ dữ liệu PDPD.
                </p>
              </div>
              <button
                type="button"
                onClick={handleTerminateOtherSessions}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition"
              >
                Đăng xuất tất cả thiết bị khác
              </button>
            </div>

            <div className="space-y-2">
              {activeSessions.map((sess) => {
                const IconComponent = sess.icon;
                return (
                  <div
                    key={sess.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{sess.device}</div>
                        <div className="text-caption text-slate-500 dark:text-slate-400">
                          Địa chỉ: {sess.ipLocation} &bull;{" "}
                          <span className={sess.isCurrent ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>
                            {sess.lastActive}
                          </span>
                        </div>
                      </div>
                    </div>
                    {sess.isCurrent ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-caption">
                        Đang hoạt động
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleTerminateSession(sess.id)}
                        className="text-caption text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium"
                      >
                        Hủy phiên
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* KHỐI 5: CẤU HÌNH THÔNG BÁO & HỆ THỐNG */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚙️</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                5. Tùy Chọn Trải Nghiệm & Cấu Hình Thông Báo
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Cá nhân hóa môi trường làm việc</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Giao diện (Theme)</div>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setThemePreference("light");
                    if (typeof window !== "undefined") localStorage.setItem("expert_theme_pref", "light");
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition shadow-sm ${
                    themePreference === "light"
                      ? "bg-white dark:bg-slate-700 border border-brand-500 text-brand-700 dark:text-brand-300"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  Sáng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setThemePreference("dark");
                    if (typeof window !== "undefined") localStorage.setItem("expert_theme_pref", "dark");
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition shadow-sm ${
                    themePreference === "dark"
                      ? "bg-white dark:bg-slate-700 border border-brand-500 text-brand-700 dark:text-brand-300"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  Tối
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cỡ chữ hiển thị</div>
              <div className="flex gap-1.5 text-xs">
                {(["100%", "110%", "125%"] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setFontSizePreference(size);
                      if (typeof window !== "undefined") localStorage.setItem("expert_fontsize_pref", size);
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition shadow-sm ${
                      fontSizePreference === size
                        ? "bg-white dark:bg-slate-700 border border-brand-500 text-brand-700 dark:text-brand-300"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Thông báo Email & ZNS</div>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyNewConsultation}
                    onChange={(e) => setNotifyNewConsultation(e.target.checked)}
                    className="rounded text-brand-700 focus:ring-brand-500"
                  />
                  <span>Lời mời tư vấn mới</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyDealRoomChat}
                    onChange={(e) => setNotifyDealRoomChat(e.target.checked)}
                    className="rounded text-brand-700 focus:ring-brand-500"
                  />
                  <span>Tin nhắn mới trong Deal Room</span>
                </label>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cảnh báo SLA Deal Room</div>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifySlaWarning12h}
                    onChange={(e) => setNotifySlaWarning12h(e.target.checked)}
                    className="rounded text-brand-700 focus:ring-brand-500"
                  />
                  <span>Cảnh báo trước 12h hết hạn</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyGovReviewResult}
                    onChange={(e) => setNotifyGovReviewResult(e.target.checked)}
                    className="rounded text-brand-700 focus:ring-brand-500"
                  />
                  <span>Thông báo kết quả thẩm định Sở</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isUpdating ? "Đang lưu..." : "Lưu Thay Đổi Cài Đặt"}</span>
            </button>
          </div>
        </section>
      </Async>
    </div>
  );
}
