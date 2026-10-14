"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  QrCode,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Share2,
  GraduationCap,
  FileUp,
  Send,
  Building,
  Phone,
  Mail
} from "lucide-react";
import { useToast } from "@/components/common/toast";

export default function ZaloPreviewPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"simulator" | "qr">("simulator");
  const [formData, setFormData] = useState({
    fullName: "TS. Nguyễn Văn Hùng",
    email: "hung.nv@hust.edu.vn",
    phone: "0912 345 678",
    organization: "Đại học Bách Khoa Hà Nội",
    sector: "C.26",
    degree: "TS",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast.success("Giả lập gửi hồ sơ thành công vào hàng đợi AI Extractor!", "Zalo Mini App Simulator");
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* TOP CONTROLS */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/experts"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-700 transition mb-1"
            >
              <ArrowLeft className="w-4 h-4" /> Về Danh Bạ Chuyên Gia
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-brand-600" />
              Giả Lập Kênh Zalo Mini App (Mobile Input Form) [GAP-06]
            </h1>
            <p className="text-xs text-slate-500">
              Kênh thu thập hồ sơ chuyên gia di động siêu tốc dưới 2 phút dành cho sự kiện và hội thảo KH&CN.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("simulator")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "simulator"
                  ? "bg-brand-600 text-white shadow"
                  : "bg-white text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200"
              }`}
            >
              Mô Phỏng Giao Diện Mobile
            </button>
            <button
              onClick={() => setActiveTab("qr")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "qr"
                  ? "bg-brand-600 text-white shadow"
                  : "bg-white text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200"
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Mã QR Quét Thật</span>
            </button>
          </div>
        </div>

        {/* CONTENT TABS */}
        {activeTab === "simulator" ? (
          <div className="flex justify-center pt-2">
            {/* MOBILE FRAME MOCKUP */}
            <div className="w-full max-w-sm bg-white rounded-[32px] border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col dark:bg-slate-900">
              {/* ZALO HEADER BAR */}
              <div className="bg-[#0068ff] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    NT
                  </div>
                  <div className="text-xs font-bold leading-tight">
                    Viện Ứng Dụng Công Nghệ
                    <span className="block text-xs font-normal text-brand-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Zalo Mini App
                    </span>
                  </div>
                </div>
                <Share2 className="w-4 h-4 text-white" />
              </div>

              {/* BANNER */}
              <div className="bg-gradient-to-r from-brand-900 to-brand-900 text-white p-4 space-y-1">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-white/10 text-cyan-300">
                  <Sparkles className="w-3 h-3" /> Thu thập Sổ tay Chuyên gia
                </div>
                <h3 className="text-xs font-bold leading-snug">
                  Đăng Ký & Số Hóa Lý Lịch Khoa Học
                </h3>
                <p className="text-xs text-brand-100">
                  Nhập nhanh thông tin dưới 2 phút. Trợ lý AI sẽ tự động phân tích và trích xuất hồ sơ.
                </p>
              </div>

              {/* FORM */}
              {isSubmitted ? (
                <div className="p-6 text-center space-y-3 my-auto">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Nộp Hồ Sơ Thành Công!
                  </h4>
                  <p className="text-xs text-slate-500">
                    Cảm ơn Quý Thầy/Cô. Hệ thống đã tiếp nhận và đang tiến hành quét AI trích xuất LLKH.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                  >
                    Gửi Lại Bản Khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs flex-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                      Họ và tên chuyên gia <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                        Số điện thoại <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                        Học vị cao nhất
                      </label>
                      <select
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                      >
                        <option value="GS">Giáo sư (GS)</option>
                        <option value="PGS">Phó Giáo sư (PGS)</option>
                        <option value="TS">Tiến sĩ (TS)</option>
                        <option value="ThS">Thạc sĩ (ThS)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                      Email làm việc <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                      Cơ quan / Viện / Trường công tác
                    </label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#0068ff] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi Hồ Sơ Nhanh (Zalo Submit)</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* TAB QR CODE */
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 max-w-md mx-auto shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div className="w-48 h-48 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center border-2 border-dashed border-slate-300 dark:bg-slate-800 dark:border-slate-700">
              <QrCode className="w-32 h-32 text-brand-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Quét Mã QR Zalo Mini App
              </h3>
              <p className="text-xs text-slate-500">
                Sử dụng camera hoặc ứng dụng Zalo trên điện thoại di động để mở trực tiếp biểu mẫu thu thập hồ sơ chuyên gia.
              </p>
            </div>
            <div className="inline-block p-2 rounded-xl bg-brand-50 text-brand-800 text-xs font-semibold border border-brand-200">
              Tích hợp Zalo SDK: Tự động điền Tên & SĐT đã đăng ký
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
