"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  ShieldCheck,
  Building2,
  Tag,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Kanban,
  ArrowRight
} from "lucide-react";
import { Async, AsyncState } from "@/components/ui/async";
import { getTniClassification } from "@/components/demand/TniRealtimeCalculator";
import { useToast } from "@/components/common/toast";
import { authClient, UserContext } from "@/lib/auth-client";
import { SECTORS_18_CATALOG } from "@/services/api/technology-offer";

export default function PublicDemandDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const toast = useToast();

  const [item, setItem] = useState<any>(null);
  const [asyncState, setAsyncState] = useState<AsyncState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [offerSent, setOfferSent] = useState(false);
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  const getSectorName = (code?: string) => {
    if (!code) return "Lĩnh vực chung";
    const found = SECTORS_18_CATALOG.find((s) => s.code.toUpperCase() === code.toUpperCase());
    return found?.name || code;
  };

  // Form chào bán giải pháp
  const [solutionTitle, setSolutionTitle] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [createdOppCode, setCreatedOppCode] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserContext | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);

  const loadItem = async () => {
    if (!id) return;
    setAsyncState("loading");
    setErrorMessage("");
    try {
      const res = await fetch(`/api/v1/public/demands/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setItem(data);
          setAsyncState("success");
          return;
        }
      }
      setErrorMessage("Không tìm thấy bài toán nhu cầu hoặc hồ sơ đã đóng.");
      setAsyncState("error");
    } catch (err: any) {
      setErrorMessage(err?.message || "Lỗi kết nối máy chủ API.");
      setAsyncState("error");
    }
  };

  useEffect(() => {
    loadItem();
    const user = authClient.getUser();
    if (user) {
      setCurrentUser(user);
    }
  }, [id]);

  // Tự động điền thông tin người chào bán khi người dùng bắt đầu gõ tên công nghệ / giải pháp
  const handleSolutionTitleChange = (val: string) => {
    setSolutionTitle(val);
    if (val.trim().length > 0) {
      const user = currentUser || authClient.getUser();
      if (user) {
        let changed = false;
        if (!sellerName) {
          setSellerName(user.organizationName || user.fullName || "Đơn vị Đổi mới sáng tạo");
          changed = true;
        }
        if (!sellerEmail) {
          setSellerEmail(user.email || "");
          changed = true;
        }
        if (!sellerPhone) {
          setSellerPhone(user.phone || user.phoneNumber || "0912345678");
          changed = true;
        }
        if (changed) {
          setAutoFilled(true);
        }
      }
    }
  };

  const handleManualAutoFill = () => {
    const user = currentUser || authClient.getUser();
    if (!user) {
      toast.warning("Bạn chưa đăng nhập tài khoản.", "Chưa đăng nhập");
      return;
    }
    setSellerName(user.organizationName || user.fullName || "Đơn vị Đổi mới sáng tạo");
    setSellerEmail(user.email || "");
    setSellerPhone(user.phone || user.phoneNumber || "0912345678");
    setAutoFilled(true);
    toast.info("Đã điền thông tin tài khoản vào form.", "Tự động điền");
  };

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item?.id) return;
    if (!solutionTitle.trim()) {
      toast.warning("Vui lòng nhập tên công nghệ hoặc giải pháp đề xuất.", "Thiếu thông tin");
      return;
    }

    setIsSubmittingOffer(true);
    try {
      const res = await fetch(`/api/v1/public/demands/${item.id}/offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solutionTitle,
          sellerName,
          sellerEmail,
          sellerPhone,
        }),
      });

      if (res.ok) {
        const resData = await res.json().catch(() => ({}));
        setCreatedOppCode(resData.opportunityCode || null);
        setOfferSent(true);
        toast.success(
          "Đề xuất giải pháp của Quý đơn vị đã được gửi tới Ban thẩm định NacenTwin.",
          "Gửi Chào Bán Thành Công"
        );
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Lỗi khi gửi đề xuất.", "Thao tác thất bại");
      }
    } catch (err: any) {
      toast.error(err.message || "Không thể kết nối máy chủ.", "Lỗi kết nối");
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-20">
      {/* Sub Header / Breadcrumb Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-border-default dark:border-slate-800 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <Link
            href="/nhu-cau-cong-nghe"
            className="inline-flex items-center gap-1.5 font-bold text-brand-700 dark:text-cyan-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Sàn Nhu Cầu
          </Link>
          <span className="text-slate-400 font-mono">
            Mã hồ sơ: {item?.itemCode || id}
          </span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <Async
          state={asyncState}
          onRetry={loadItem}
          errorMessage={errorMessage}
          loadingSkeleton={
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 h-64" />
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 h-48" />
              </div>
              <div className="lg:col-span-4">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 h-96" />
              </div>
            </div>
          }
        >
          {item && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* CỘT TRÁI (8 CỘT): CHI TIẾT BÀI TOÁN KỸ THUẬT */}
              <div className="lg:col-span-8 space-y-6">
                <article className="surface-card p-6 sm:p-8 space-y-6">
                  {/* Meta badges */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg">
                        {item.itemCode}
                      </span>
                      {(() => {
                        const meta = getTniClassification(item.tniScore || 75);
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${meta.badgeClass}`}
                          >
                            <Flame className="w-3.5 h-3.5" /> TNI: {item.tniScore} — {meta.label}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Thông tin DN bảo vệ theo Nghị định 13 (PDPD)</span>
                    </div>
                  </div>

                  {/* Title & Stage */}
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary dark:text-white leading-tight">
                      {item.technicalProblem}
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-secondary dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-brand-500" />
                        Công đoạn: <strong className="text-text-primary dark:text-slate-200">{item.stageName}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-brand-500" />
                        Lĩnh vực: <strong className="text-text-primary dark:text-slate-200">{getSectorName(item.sectorCode)}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-500" />
                        Khu vực: <strong className="text-text-primary dark:text-slate-200">{item.province || "Toàn quốc"}</strong>
                      </span>
                    </div>
                  </div>

                  {/* 2 Blocks: Goal & Desired Solution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                        🎯 MỤC TIÊU KỲ VỌNG ĐẠT ĐƯỢC
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-text-primary dark:text-slate-200 leading-relaxed">
                        {item.expectedGoal || "Cải tiến chất lượng sản phẩm và giảm thiểu chi phí vận hành."}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                        💡 GIẢI PHÁP KỸ THUẬT MONG MUỐN
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-text-primary dark:text-slate-200 leading-relaxed">
                        {item.desiredSolution || "Cần giải pháp tự động hóa hoặc chuyển giao công nghệ từ Viện/Trường."}
                      </p>
                    </div>
                  </div>

                  {/* Budget & Terms */}
                  <div className="bg-brand-50/60 dark:bg-brand-950/40 p-5 rounded-2xl border border-brand-100 dark:border-brand-900 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-brand-700 dark:text-brand-300 font-bold block">
                        Khung ngân sách dự kiến của Bên Mua:
                      </span>
                      <span className="text-xl font-extrabold text-brand-900 dark:text-white">
                        {item.budgetRange || "Thương lượng trực tiếp"}
                      </span>
                    </div>
                    <div className="text-right text-xs text-text-secondary dark:text-slate-400">
                      <p>Trạng thái: <strong className="text-emerald-600 dark:text-emerald-400">ĐANG MỞ TÌM CUNG</strong></p>
                      <p className="text-xs mt-0.5">Ưu tiên kết nối chuyển giao trong 15 ngày</p>
                    </div>
                  </div>
                </article>

                {/* PDPD Privacy Notice Box */}
                <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-text-secondary dark:text-slate-400">
                  <ShieldCheck className="w-5 h-5 text-nacen-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-text-primary dark:text-slate-200 block mb-1">
                      Chính Sách Bảo Vệ Dữ Liệu Cá Nhân & Bí Mật Kinh Doanh
                    </strong>
                    Nền tảng NacenTwin tuân thủ nghiêm ngặt Nghị định 13/2023/NĐ-CP (PDPD). Danh tính, địa chỉ nhà xưởng và số điện thoại người đại diện của Bên Mua chỉ được mở khóa cho Bên Chào Bán khi giải pháp kỹ thuật vượt qua thẩm định sơ bộ của Hội đồng Chuyên gia Sở KH&CN.
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI (4 CỘT): FORM NỘP ĐỀ XUẤT CHÀO BÁN / GIẢI PHÁP */}
              <div className="lg:col-span-4 sticky top-24">
                <div className="surface-card p-6 space-y-5">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-nacen-green-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                      DÀNH CHO BÊN CHÀO BÁN
                    </span>
                    <h3 className="text-lg font-extrabold text-text-primary dark:text-white mt-1">
                      Nộp Đề Xuất Giải Pháp
                    </h3>
                    <p className="text-xs text-text-secondary dark:text-slate-400 mt-0.5">
                      Gửi công nghệ, thiết bị hoặc giải pháp tư vấn phù hợp với bài toán của doanh nghiệp.
                    </p>
                  </div>

                  {offerSent ? (
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-4">
                      <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-emerald-900 dark:text-emerald-200 text-base">
                          Đã Gửi Đề Xuất Thành Công!
                        </h4>
                        {createdOppCode && (
                          <div className="inline-block bg-white dark:bg-slate-900 px-3 py-1 rounded-full text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700">
                            Mã cơ hội: {createdOppCode}
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed text-left bg-white/80 dark:bg-slate-900/70 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                        <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <span>📌</span> Nơi kiểm tra thông báo & tiến trình xử lý:
                        </p>
                        <p>
                          1. <strong>Tiến trình Hợp tác (Pipeline)</strong>: Đề xuất đã được ghi nhận tự động vào quy trình kết nối. Quý đơn vị có thể theo dõi trạng thái thẩm định sơ bộ, kết nối 3 bên và tiến độ ký kết MOU tại mục <strong>Tiến trình Chuyển giao & MOU</strong> trong Bàn làm việc (Portal).
                        </p>
                        <p>
                          2. <strong>Cán bộ Sở KH&CN phụ trách</strong>: Sau khi đối soát năng lực kỹ thuật phù hợp với bài toán của doanh nghiệp, chuyên viên quản lý sẽ liên hệ trực tiếp qua Email hoặc SĐT mà Quý đơn vị đã đăng ký.
                        </p>
                      </div>

                      <div className="pt-2 space-y-2">
                        <Link
                          href="/portal/opportunities/pipeline"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition text-xs"
                        >
                          <Kanban className="w-4 h-4" />
                          Xem Tiến Trình Hợp Tác Trong Pipeline
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => {
                            setOfferSent(false);
                            setSolutionTitle("");
                            setAutoFilled(false);
                          }}
                          className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold py-1.5 block mx-auto transition"
                        >
                          Gửi thêm đề xuất giải pháp khác
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSendOffer} className="space-y-4 text-xs">
                      {/* Trạng thái tài khoản & Hỗ trợ tự động điền */}
                      {currentUser ? (
                        <div className="flex items-center justify-between bg-brand-50/70 dark:bg-brand-950/40 p-2.5 rounded-xl border border-brand-200/60 dark:border-brand-800 text-[11px] text-brand-800 dark:text-cyan-300">
                          <div className="flex items-center gap-1.5 font-medium truncate mr-2">
                            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-cyan-400 shrink-0" />
                            <span className="truncate">Đang đăng nhập: <strong>{currentUser.fullName}</strong></span>
                          </div>
                          <button
                            type="button"
                            onClick={handleManualAutoFill}
                            className="text-xs font-bold text-brand-700 dark:text-cyan-400 hover:underline shrink-0"
                          >
                            Tự động điền
                          </button>
                        </div>
                      ) : null}

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Tên công nghệ / giải pháp đề xuất *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={solutionTitle}
                          onChange={(e) => handleSolutionTitleChange(e.target.value)}
                          placeholder="Ví dụ: Thiết bị kiểm định thị giác AI tích hợp thuật toán xử lý ảnh tốc độ cao..."
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition"
                        />
                      </div>

                      {autoFilled && (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Đã tự động điền đơn vị, email và SĐT từ tài khoản đăng nhập. Bạn có thể chỉnh sửa nếu cần.</span>
                        </div>
                      )}

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Đơn vị chào bán / Nhà khoa học
                        </label>
                        <input
                          type="text"
                          value={sellerName}
                          onChange={(e) => setSellerName(e.target.value)}
                          placeholder="Viện / Trường / Doanh nghiệp công nghệ"
                          className="form-control w-full text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Email liên hệ
                          </label>
                          <input
                            type="email"
                            value={sellerEmail}
                            onChange={(e) => setSellerEmail(e.target.value)}
                            placeholder="seller@domain.vn"
                            className="form-control w-full text-sm"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            value={sellerPhone}
                            onChange={(e) => setSellerPhone(e.target.value)}
                            placeholder="0912xxxxxx"
                            className="form-control w-full text-sm font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingOffer}
                        className="w-full h-11 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmittingOffer ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Đang gửi đề xuất...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" /> Gửi Chào Bán Giải Pháp
                          </>
                        )}
                      </button>

                      <p className="text-xs text-slate-400 text-center leading-tight">
                        Miễn phí nộp hồ sơ. Đề xuất sẽ được chuyển tới Cán bộ Sở KH&CN thẩm định điều kiện khớp nối.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </Async>
      </main>
    </div>
  );
}
