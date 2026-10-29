"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  fetchEnterpriseDetail,
  getInnovationRating,
  type EnterprisePublicDetail,
  type InnovationEvaluation,
} from "../../../lib/enterprise-client";
import { fetchPublicOffers } from "@/services/api/technology-offer";
import { type TechnologyOffer } from "@/types/technology-offer";
import { brokerageApi } from "@/services/api/brokerage";
import { CommercialProfile } from "@/components/enterprise/CommercialProfile";
import { InnovativeProfile } from "@/components/enterprise/InnovativeProfile";
import {
  AlertCircle,
  Building2,
  CheckCircle,
  ChevronRight,
  FlaskConical,
  RefreshCw,
  Send,
  Share2,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";

export default function EnterpriseDetailPage() {
  const params = useParams();
  const taxCode = Array.isArray(params?.taxCode)
    ? params.taxCode[0]
    : (params?.taxCode as string) || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EnterprisePublicDetail | null>(null);
  const [enterpriseOffers, setEnterpriseOffers] = useState<TechnologyOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [innovationRating, setInnovationRating] = useState<InnovationEvaluation | null>(null);
  const [innovationLoading, setInnovationLoading] = useState(false);

  // View mode switcher: AUTO (default by subjectType), COMMERCIAL, or INNOVATIVE
  const [viewMode, setViewMode] = useState<"AUTO" | "COMMERCIAL" | "INNOVATIVE">("AUTO");

  // RFQ Modal State
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [rfqTargetProduct, setRfqTargetProduct] = useState("");
  const [rfqQuantity, setRfqQuantity] = useState("");
  const [rfqDeliveryDate, setRfqDeliveryDate] = useState("");
  const [rfqCompanyName, setRfqCompanyName] = useState("");
  const [rfqContactName, setRfqContactName] = useState("");
  const [rfqContactPhone, setRfqContactPhone] = useState("");
  const [rfqNotes, setRfqNotes] = useState("");

  // Chat / Connect Modal State
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatPurpose, setChatPurpose] = useState("Đề xuất hợp tác giao thương / Chào hàng cung ứng");
  const [chatMessage, setChatMessage] = useState("");
  const [chatSuccess, setChatSuccess] = useState(false);

  // Bookmark & Toast State
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const showToast = (msg: string) => {
    startTransition(() => {
      setToastMessage(msg);
    });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadEnterpriseData = () => {
    if (!taxCode) return;
    setLoading(true);
    setError(null);

    fetchEnterpriseDetail(taxCode)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err.message || "Không thể tải thông tin doanh nghiệp");
      })
      .finally(() => {
        setLoading(false);
      });

    // Load innovation rating (Radar Chart & TNI metrics)
    setInnovationLoading(true);
    getInnovationRating(taxCode)
      .then((res) => {
        setInnovationRating(res);
      })
      .catch(() => {
        setInnovationRating(null);
      })
      .finally(() => {
        setInnovationLoading(false);
      });

    // Load enterprise offers / products catalog
    setOffersLoading(true);
    fetchPublicOffers({ enterpriseTaxCode: taxCode, limit: 12 })
      .then((res) => {
        setEnterpriseOffers(res.data || []);
      })
      .catch(() => {
        setEnterpriseOffers([]);
      })
      .finally(() => {
        setOffersLoading(false);
      });
  };

  useEffect(() => {
    loadEnterpriseData();
  }, [taxCode]);

  // Determine active layout
  const isInnovativeLayout =
    viewMode === "INNOVATIVE" ||
    (viewMode === "AUTO" &&
      (data?.subjectType === "INNOVATIVE_ENTERPRISE" ||
       data?.tniScore != null ||
       data?.tniClassification != null ||
       data?.hasRdUnit === true));

  // RFQ Modal open helper
  const handleOpenRfqModal = (targetProduct = "Yêu cầu báo giá chung") => {
    setRfqTargetProduct(targetProduct);
    setRfqQuantity("");
    setRfqDeliveryDate("");
    setRfqCompanyName("");
    setRfqContactName("");
    setRfqContactPhone("");
    setRfqNotes("");
    setRfqModalOpen(true);
  };

  const handleCloseRfqModal = () => {
    setRfqModalOpen(false);
  };

  const [isSubmittingRfq, setIsSubmittingRfq] = useState(false);
  const [isSubmittingChat, setIsSubmittingChat] = useState(false);

  const handleSubmitRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRfq(true);
    try {
      const fullMessage = `[Yêu cầu báo giá RFQ - ${rfqTargetProduct}] Số lượng: ${rfqQuantity}. Ngày cần giao: ${rfqDeliveryDate || "Thỏa thuận"}. Ghi chú: ${rfqNotes || "Không có"}. Người liên hệ: ${rfqContactName} (${rfqContactPhone})`;
      const res = await brokerageApi.createConnectionRequest({
        senderOrgName: rfqCompanyName.trim(),
        senderRole: "BUYER",
        receiverOrgName: data?.name || "Doanh nghiệp",
        message: fullMessage,
        proposedBudgetRange: "Thỏa thuận",
      });
      setRfqModalOpen(false);
      showToast(`Đã gửi yêu cầu báo giá thành công! Mã yêu cầu: ${res.requestCode}`);
    } catch (err: any) {
      showToast(err.message || "Không thể gửi yêu cầu báo giá. Vui lòng thử lại.");
    } finally {
      setIsSubmittingRfq(false);
    }
  };

  // Chat Modal open helper
  const handleOpenChatModal = () => {
    setChatSuccess(false);
    setChatMessage("");
    setChatModalOpen(true);
  };

  const handleCloseChatModal = () => {
    setChatModalOpen(false);
  };

  const handleSubmitChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingChat(true);
    try {
      const fullMessage = `[Giao thương - Mục đích: ${chatPurpose}] ${chatMessage}`;
      const res = await brokerageApi.createConnectionRequest({
        senderOrgName: "Đối tác giao thương",
        senderRole: "BUYER",
        receiverOrgName: data?.name || "Doanh nghiệp",
        message: fullMessage,
        proposedBudgetRange: "Thỏa thuận",
      });
      setChatSuccess(true);
      showToast(`Đã gửi thông điệp giao thương thành công! Mã yêu cầu: ${res.requestCode}`);
    } catch (err: any) {
      showToast(err.message || "Không thể gửi thông điệp. Vui lòng thử lại.");
    } finally {
      setIsSubmittingChat(false);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = () => {
    setIsBookmarked((prev) => {
      const next = !prev;
      showToast(next ? "Đã lưu doanh nghiệp vào danh bạ đối tác!" : "Đã xóa doanh nghiệp khỏi danh bạ đối tác");
      return next;
    });
  };

  // Share profile
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("Đã sao chép liên kết hồ sơ doanh nghiệp vào bộ nhớ tạm!");
    }
  };

  // 1. Loading State (Skeleton shimmer)
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-4 w-48 bg-slate-200 rounded"></div>
          <div className="h-52 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between">
            <div className="h-8 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          </div>
          <div className="h-12 bg-white rounded-2xl border border-slate-200"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-slate-200"></div>
            <div className="h-96 bg-white rounded-2xl border border-slate-200"></div>
          </div>
        </div>
      </main>
    );
  }

  // 2. Error / Not Found State
  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Không tìm thấy thông tin doanh nghiệp</h2>
          <p className="text-sm text-slate-600">
            {error || `Mã số thuế ${taxCode} chưa có trên hệ thống hoặc hồ sơ chưa được công khai.`}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={loadEnterpriseData}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Thử lại</span>
            </button>
            <Link
              href="/enterprises"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
            >
              <span>← Quay lại danh bạ</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* ========================================================================= */}
      {/* TOP BAR / BREADCRUMB & QUICK SWITCHER */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          {/* Breadcrumb */}
          <nav className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-emerald-700">
              Trang Chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <Link href="/enterprises" className="hover:text-emerald-700">
              Danh Bạ Doanh Nghiệp
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">
              {data.name}
            </span>
          </nav>

          {/* Quick Switcher & Utilities */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center text-xs bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-slate-500 px-2 py-0.5 hidden sm:inline">Chế độ xem:</span>
              <button
                type="button"
                onClick={() => setViewMode("COMMERCIAL")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  !isInnovativeLayout
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Hồ sơ Doanh nghiệp Thương mại & Sản xuất"
              >
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                <span>DN Thương Mại</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("INNOVATIVE")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  isInnovativeLayout
                    ? "bg-white text-teal-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Hồ sơ Doanh nghiệp Đổi mới sáng tạo (TT17 & TNI)"
              >
                <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
                <span>DN ĐMST (TT17)</span>
              </button>

              {viewMode !== "AUTO" && (
                <button
                  type="button"
                  onClick={() => setViewMode("AUTO")}
                  className="text-xs text-slate-400 hover:text-slate-700 px-1.5 py-1"
                  title="Đặt lại chế độ tự động theo CSDL"
                >
                  (Tự động)
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Chia Sẻ</span>
            </button>

            <Link
              href="/enterprises"
              className="text-xs font-bold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Danh Bạ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* CONDITIONAL LAYOUT BRANCHING */}
        {isInnovativeLayout ? (
          <InnovativeProfile
            data={data}
            enterpriseOffers={enterpriseOffers}
            offersLoading={offersLoading}
            innovationRating={innovationRating}
            innovationLoading={innovationLoading}
            onOpenConnectModal={handleOpenChatModal}
          />
        ) : (
          <CommercialProfile
            data={data}
            offers={enterpriseOffers}
            offersLoading={offersLoading}
            onOpenRfqModal={handleOpenRfqModal}
            onOpenChatModal={handleOpenChatModal}
            onShare={handleShare}
            isBookmarked={isBookmarked}
            onToggleBookmark={handleToggleBookmark}
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: GỬI YÊU CẦU BÁO GIÁ (RFQ) */}
      {/* ========================================================================= */}
      {rfqModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">Gửi Yêu Cầu Báo Giá / Đề Xuất Giao Thương</h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Kết nối trực tiếp tới Bộ Phận Kinh Doanh của {data.name}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseRfqModal}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitRfq} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Mặt hàng / Nội dung quan tâm:</label>
                <input
                  type="text"
                  readOnly
                  value={rfqTargetProduct}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Sản lượng dự kiến mua: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={rfqQuantity}
                    onChange={(e) => setRfqQuantity(e.target.value)}
                    placeholder="Vd: 500 kg hoặc 2 tấn"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Thời gian cần giao hàng:</label>
                  <input
                    type="date"
                    value={rfqDeliveryDate}
                    onChange={(e) => setRfqDeliveryDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Tên Đơn vị / Doanh nghiệp của bạn: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={rfqCompanyName}
                  onChange={(e) => setRfqCompanyName(e.target.value)}
                  placeholder="Vd: Chuỗi siêu thị hoặc Công ty TNHH Xuất Nhập Khẩu..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Họ tên người liên hệ: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={rfqContactName}
                    onChange={(e) => setRfqContactName(e.target.value)}
                    placeholder="Vd: Nguyễn Văn A"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Số điện thoại liên hệ: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={rfqContactPhone}
                    onChange={(e) => setRfqContactPhone(e.target.value)}
                    placeholder="Vd: 0912 345 678"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Ghi chú yêu cầu kỹ thuật &amp; đóng gói:</label>
                <textarea
                  rows={3}
                  value={rfqNotes}
                  onChange={(e) => setRfqNotes(e.target.value)}
                  placeholder="Ghi chú quy cách bao bì, điều kiện thanh toán hoặc yêu cầu chứng chỉ kiểm nghiệm..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                ></textarea>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Yêu cầu báo giá của bạn sẽ được chuyển thẳng tới Zalo OA &amp; Email của doanh nghiệp kèm mã đối soát bảo mật theo Nghị định 13/2023/NĐ-CP.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseRfqModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRfq}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingRfq ? "Đang gửi..." : "Gửi Yêu Cầu Báo Giá"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LIÊN HỆ GIAO THƯƠNG / CHAT */}
      {/* ========================================================================= */}
      {chatModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 space-y-4">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">Liên Hệ Giao Thương Trực Tiếp</h3>
                <p className="text-xs text-slate-300 mt-0.5">Kênh trung gian an toàn NacenTwin</p>
              </div>
              <button
                type="button"
                onClick={handleCloseChatModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {chatSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h4 className="font-bold text-base text-slate-900">Yêu cầu đã được gửi thành công!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Đại diện kinh doanh của <strong>{data.name}</strong> sẽ phản hồi quý đơn vị qua thông báo trên sàn hoặc email tiếp nhận trong thời gian sớm nhất.
                </p>
                <button
                  type="button"
                  onClick={handleCloseChatModal}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Đóng lại
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitChat} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Mục đích kết nối:</label>
                  <select
                    value={chatPurpose}
                    onChange={(e) => setChatPurpose(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Đề xuất hợp tác giao thương / Chào hàng cung ứng">
                      Đề xuất hợp tác giao thương / Chào hàng cung ứng
                    </option>
                    <option value="Đặt hàng sản xuất theo tiêu chuẩn OEM">
                      Đặt hàng sản xuất theo tiêu chuẩn OEM
                    </option>
                    <option value="Hỏi thêm về chứng chỉ tiêu chuẩn chất lượng (ISO/HACCP)">
                      Hỏi thêm về chứng chỉ tiêu chuẩn chất lượng (ISO/HACCP)
                    </option>
                    <option value="Đề xuất hợp tác R&D / Chuyển giao công nghệ">
                      Đề xuất hợp tác R&amp;D / Chuyển giao công nghệ
                    </option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Nội dung trao đổi:</label>
                  <textarea
                    rows={4}
                    required
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Mô tả tóm tắt nhu cầu hợp tác hoặc thông tin cần trao đổi với doanh nghiệp..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  ></textarea>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                  🛡️ <strong>Bảo mật thông tin:</strong> Toàn bộ luồng trao đổi được mã hóa và đối soát qua cổng giao tiếp Nacentwin, đảm bảo bảo vệ dữ liệu cá nhân (PDPD NĐ 13/2023).
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseChatModal}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingChat}
                    className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl transition shadow-sm"
                  >
                    {isSubmittingChat ? "Đang gửi..." : "Gửi đề xuất"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOAST NOTIFICATION */}
      {/* ========================================================================= */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
