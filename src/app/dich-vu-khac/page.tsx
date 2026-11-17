"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  ShieldCheck,
  Calculator,
  Building2,
  Briefcase,
  Check,
  CheckCircle2,
  ArrowRight,
  FileText,
  Clock,
  Send,
  HelpCircle,
  Target,
  Flame,
  Award,
  Sparkles,
  ClipboardCheck,
  Cpu
} from "lucide-react";
import { useToast } from "@/components/common/toast";
import { brokerageApi } from "@/services/api/brokerage";

export default function DichVuKhacPage() {
  const toast = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    serviceType: "VALUATION",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error("Vui lòng điền đầy đủ họ tên, email và số điện thoại liên hệ.", "Thiếu thông tin");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullMessage = `[Dịch vụ tư vấn - Loại: ${formData.serviceType}] Người liên hệ: ${formData.fullName.trim()} (${formData.phone.trim()}, ${formData.email.trim()}). Nội dung: ${formData.description.trim() || "Không có"}`;
      const res = await brokerageApi.createConnectionRequest({
        senderOrgName: formData.organization.trim() || formData.fullName.trim(),
        senderRole: "BUYER",
        receiverOrgName: "Ban Cố Vấn Kỹ Thuật & Pháp Lý BACLINK",
        message: fullMessage,
        proposedBudgetRange: "Thỏa thuận",
      });
      setSubmittedCode(res.requestCode);
      toast.success(`Yêu cầu tư vấn đã được tiếp nhận với mã phiếu ${res.requestCode}!`, "Đăng ký thành công");
    } catch (err: any) {
      toast.error(err.message || "Không thể gửi yêu cầu tư vấn. Vui lòng thử lại.", "Lỗi gửi yêu cầu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* HERO BANNER SECTION (ĐỒNG BỘ CHUẨN DESIGN SYSTEM NACENTWIN) */}
      <section className="relative overflow-hidden bg-brand-700 text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-brand-800 shadow-md">
        <div aria-hidden="true" className="innovation-hero-art pointer-events-none absolute inset-0 opacity-80" />
        <div className="relative z-10 max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-100 text-xs font-semibold backdrop-blur-sm border border-white/20">
            <Scale className="w-3.5 h-3.5 text-brand-200" />
            <span>Dịch Vụ Hỗ Trợ Hội Viên (BACLINK)</span>
          </div>

          <h1 className="type-page-title text-white">
            Dịch Vụ Hỗ Trợ Hội Viên & Tư Vấn Kỹ Thuật Công Nghiệp
          </h1>

          <p className="text-white/85 type-body max-w-2xl">
            Đồng hành cùng các doanh nghiệp hội viên bảo vệ tài sản trí tuệ, định giá công nghệ, chuẩn bị hồ sơ audit chuỗi cung ứng FDI và tiếp cận chính sách hỗ trợ phát triển công nghiệp tỉnh Bắc Ninh.
          </p>
        </div>
      </section>

      {/* KHẢO SÁT NHU CẦU & ĐÁNH GIÁ NĂNG LỰC CÔNG NGHỆ (TASK-01-CR68) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="type-section-title text-slate-900 dark:text-white">
            Khảo Sát Nhu Cầu & Đánh Giá Năng Lực Công Nghệ
          </h2>
          <p className="type-body text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Hệ thống công cụ đo lường và định vị chuẩn hóa theo quy chuẩn Bộ Khoa học & Công nghệ, giúp doanh nghiệp, viện nghiên cứu và nhà khoa học đánh giá trình độ công nghệ, bắt mạch nhu cầu và kết nối chuyển giao trực tiếp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CARD 1: CHỈ SỐ TNI */}
          <div className="bg-amber-50/30 border border-amber-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition dark:bg-amber-950/20 dark:border-amber-800/60">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                  <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Chỉ số TNI
                </span>
                <span className="text-sm font-bold text-amber-400">01</span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center my-3 dark:bg-amber-900/40 dark:text-amber-300">
                <Target className="w-6 h-6" />
              </div>

              <h3 className="type-card-title text-slate-900 dark:text-white">
                Khảo Sát Nhu Cầu (TNI)
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-3">
                Technology Needs Index
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Bắt mạch nhu cầu doanh nghiệp, tự động tính toán chỉ số nhu cầu công nghệ (TNI) và kết nối nguồn cung chuyển giao phù hợp.
              </p>

              <div className="space-y-2 border-t border-amber-100 dark:border-amber-900/40 pt-3 mb-6 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>Form 4 bước tinh gọn & Auto-lookup MST</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>Đo lường mức độ cấp thiết đổi mới</span>
                </div>
              </div>
            </div>

            <Link
              href="/khao-sat-nhu-cau"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              Làm Khảo Sát TNI Ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* CARD 2: THÔNG TƯ 17/2019 */}
          <div id="danh-gia-tt17" className="bg-indigo-50/30 border border-indigo-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition dark:bg-indigo-950/20 dark:border-indigo-800/60 scroll-mt-24">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                  <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Thông tư 17/2019
                </span>
                <span className="text-sm font-bold text-indigo-400">02</span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center my-3 dark:bg-indigo-900/40 dark:text-indigo-300">
                <Award className="w-6 h-6" />
              </div>

              <h3 className="type-card-title text-slate-900 dark:text-white">
                Đánh Giá Năng Lực TT17
              </h3>
              <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium mb-3">
                26 Tiêu Chí • 5 Nhóm THIOC
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Đánh giá trình độ và năng lực công nghệ doanh nghiệp theo Thông tư 17/2019/TT-BKHCN, xếp hạng Tiên tiến, Trung bình hoặc Lạc hậu.
              </p>

              <div className="space-y-2 border-t border-indigo-100 dark:border-indigo-900/40 pt-3 mb-6 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span>Tính điểm tự động 26 chỉ tiêu định lượng</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span>Cấp báo cáo thẩm định hồ sơ chính thức</span>
                </div>
              </div>
            </div>

            <Link
              href="/assessments/tt17/wizard"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              Tự Đánh Giá TT17 Ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* CARD 3: 43 TIÊU CHUẨN ĐMST */}
          <div className="bg-teal-50/30 border border-teal-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition dark:bg-teal-950/20 dark:border-teal-800/60">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  43 Tiêu Chuẩn ĐMST
                </span>
                <span className="text-sm font-bold text-teal-400">03</span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center my-3 dark:bg-teal-900/40 dark:text-teal-300">
                <ClipboardCheck className="w-6 h-6" />
              </div>

              <h3 className="type-card-title text-slate-900 dark:text-white">
                Khảo Sát ĐMST (43 Câu)
              </h3>
              <p className="text-xs text-teal-700 dark:text-teal-400 font-medium mb-3">
                8 Nhóm Năng Lực • Chỉ Số TNI
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Tự động chấm điểm 8 nhóm năng lực, tính toán chỉ số TNI tức thời và xuất hồ sơ Radar Chart trong 1-click.
              </p>

              <div className="space-y-2 border-t border-teal-100 dark:border-teal-900/40 pt-3 mb-6 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>Autofill hồ sơ pháp nhân SSOT & Khóa MST an toàn</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>Biểu đồ Radar Chart 8 trục & Huy hiệu ĐMST</span>
                </div>
              </div>
            </div>

            <Link
              href="/khao-sat-dmst"
              className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              Làm Khảo Sát ĐMST Ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* CARD 4: THANG ĐO TRL 1-9 */}
          <div className="bg-emerald-50/30 border border-emerald-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition dark:bg-emerald-950/20 dark:border-emerald-800/60">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                  <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Thang Đo TRL 1–9
                </span>
                <span className="text-sm font-bold text-emerald-400">04</span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center my-3 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Cpu className="w-6 h-6" />
              </div>

              <h3 className="type-card-title text-slate-900 dark:text-white">
                Thẩm Định Thang Đo TRL
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-3">
                Technology Readiness Level
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Chuẩn hóa 9 cấp độ hoàn thiện công nghệ từ phòng lab (TRL 1-3), thử nghiệm (TRL 4-6) đến sẵn sàng thương mại hóa (TRL 7-9).
              </p>

              <div className="space-y-2 border-t border-emerald-100 dark:border-emerald-900/40 pt-3 mb-6 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Thẩm định độc lập bởi Hội đồng Viện</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Gắn nhãn TRL và bảo hộ sở hữu trí tuệ</span>
                </div>
              </div>
            </div>

            <Link
              href="/chao-ban-cong-nghe"
              className="w-full py-2.5 px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              Khám Phá Công Nghệ TRL <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4 GÓI DỊCH VỤ CỐT LÕI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DỊCH VỤ 1 */}
          <div id="bao-ho-shtt" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-brand-300 hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 scroll-mt-24">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center dark:bg-brand-950 dark:text-cyan-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="type-card-title text-slate-900 dark:text-white">
              1. Đăng Ký Bảo Hộ SHTT & Sáng Chế
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Tư vấn tra cứu khả năng bảo hộ, soạn thảo bản mô tả sáng chế, giải pháp hữu ích, kiểu dáng công nghiệp và nộp đơn tại Cục Sở hữu Trí tuệ.
            </p>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Tra cứu đối chứng sáng chế toàn cầu
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Viết bộ tứ IP Quad chuẩn quốc tế
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Theo dõi tiến trình thẩm định nội dung
              </li>
            </ul>
          </div>

          {/* DỊCH VỤ 2 */}
          <div id="dinh-gia-cong-nghe" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-brand-300 hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 scroll-mt-24">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center dark:bg-cyan-950 dark:text-cyan-300">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="type-card-title text-slate-900 dark:text-white">
              2. Thẩm Định & Định Giá Công Nghệ
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Áp dụng các phương pháp chi phí, thị trường và thu nhập chiết khấu (DCF) để xác định giá trị chuyển giao công nghệ làm cơ sở góp vốn hoặc giao dịch.
            </p>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Đánh giá thang đo sẵn sàng TRL 1-9
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Hội đồng chuyên gia độc lập thẩm định
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Cấp chứng thư định giá hợp pháp
              </li>
            </ul>
          </div>

          {/* DỊCH VỤ 3 */}
          <div id="doanh-nghiep-khcn" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-brand-300 hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 scroll-mt-24">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950 dark:text-emerald-300">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="type-card-title text-slate-900 dark:text-white">
              3. Hồ Sơ Doanh Nghiệp KH&CN
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Hỗ trợ doanh nghiệp hoàn thiện phương án sản xuất kinh doanh từ kết quả KH&CN, chứng minh tỷ lệ doanh thu 30% để hưởng ưu đãi thuế TNDN.
            </p>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Thẩm định quyền sở hữu/sử dụng kết quả KH&CN
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Hoàn thiện hồ sơ nộp Sở KH&CN địa phương
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Miễn giảm thuế TNDN 4 năm, giảm 50% 9 năm
              </li>
            </ul>
          </div>

          {/* DỊCH VỤ 4 */}
          <div id="chuyen-giao-cong-nghe" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-brand-300 hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 scroll-mt-24">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center dark:bg-amber-950 dark:text-amber-300">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="type-card-title text-slate-900 dark:text-white">
              4. Môi Giới & Hợp Đồng Chuyển Giao
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Đại diện đàm phán, soạn thảo hợp đồng li-xăng (Licensing), chuyển nhượng quyền sở hữu công nghiệp và đăng ký hợp đồng chuyển giao theo Luật Chuyển giao công nghệ.
            </p>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Soạn thảo hợp đồng chuẩn hóa pháp lý
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Mở phòng đàm phán Deal Room 1-1
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Đăng ký giao dịch chuyển giao công nghệ
              </li>
            </ul>
          </div>
        </div>

        {/* QUY TRÌNH 5 BƯỚC */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="type-section-title text-slate-900 dark:text-white">Quy Trình Tiếp Nhận & Triển Khai 5 Bước</h3>
            <p className="text-xs text-slate-500">Minh bạch, bảo mật và được giám sát bởi Ban Cố vấn Kỹ thuật BACLINK.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4">
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-full bg-brand-700 text-white font-bold text-xs flex items-center justify-center mx-auto">1</div>
              <div className="font-bold text-xs">Gửi Yêu Cầu</div>
              <p className="text-xs text-slate-500">Kê khai thông tin ban đầu qua form trực tuyến.</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-full bg-brand-700 text-white font-bold text-xs flex items-center justify-center mx-auto">2</div>
              <div className="font-bold text-xs">Sơ Kiểm Hồ Sơ</div>
              <p className="text-xs text-slate-500">Chuyên viên liên hệ trong 24h để làm rõ chi tiết.</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-full bg-brand-700 text-white font-bold text-xs flex items-center justify-center mx-auto">3</div>
              <div className="font-bold text-xs">Ký Thỏa Thuận</div>
              <p className="text-xs text-slate-500">Ký cam kết bảo mật NDA và hợp đồng tư vấn.</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-full bg-brand-700 text-white font-bold text-xs flex items-center justify-center mx-auto">4</div>
              <div className="font-bold text-xs">Thực Thi Nghiệp Vụ</div>
              <p className="text-xs text-slate-500">Hội đồng chuyên môn lập hồ sơ & thẩm định.</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mx-auto">5</div>
              <div className="font-bold text-xs">Bàn Giao & Hỗ Trợ</div>
              <p className="text-xs text-slate-500">Cấp chứng thư, văn bằng và hỗ trợ sau chuyển giao.</p>
            </div>
          </div>
        </div>

        {/* FORM TIẾP NHẬN YÊU CẦU TRỰC TUYẾN */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div>
            <h3 className="type-card-title text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-brand-700 dark:text-cyan-400" />
              Đăng Ký Tiếp Nhận Yêu Cầu Tư Vấn Trực Tuyến
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Để lại thông tin để Ban Cố vấn Kỹ thuật BACLINK hỗ trợ trực tiếp.
            </p>
          </div>

          {submittedCode ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 space-y-3 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                Yêu Cầu Của Bạn Đã Được Gửi Thành Công!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Mã phiếu tiếp nhận: <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{submittedCode}</span>
              </p>
              <p className="text-xs text-slate-500">
                Ban Cố vấn Kỹ thuật BACLINK sẽ liên hệ lại qua email hoặc số điện thoại trong vòng 24 giờ làm việc.
              </p>
              <button
                type="button"
                onClick={() => setSubmittedCode(null)}
                className="focus-ring inline-flex items-center justify-center gap-2 mt-2 px-5 py-2.5 rounded-control bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Gửi Yêu Cầu Khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và tên người liên hệ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="focus-ring w-full px-3.5 py-2.5 text-xs rounded-control border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email làm việc <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nguyenvana@gmail.com"
                  className="focus-ring w-full px-3.5 py-2.5 text-xs rounded-control border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0912 345 678"
                  className="focus-ring w-full px-3.5 py-2.5 text-xs rounded-control border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cơ quan / Doanh nghiệp
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Công ty Cổ phần / Viện nghiên cứu..."
                  className="focus-ring w-full px-3.5 py-2.5 text-xs rounded-control border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Gói dịch vụ quan tâm
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="focus-ring w-full px-3.5 py-2.5 text-xs rounded-control border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800 dark:text-white cursor-pointer"
                >
                  <option value="VALUATION">Định giá công nghệ & Tài sản trí tuệ</option>
                  <option value="PATENT">Đăng ký sáng chế / Giải pháp hữu ích / SHTT</option>
                  <option value="SME_CERT">Thành lập & Chứng nhận Doanh nghiệp KH&CN</option>
                  <option value="TRANSFER">Môi giới & Ký kết hợp đồng chuyển giao công nghệ</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mô tả vắn tắt nhu cầu
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tóm tắt công nghệ hoặc nhu cầu của quý đơn vị..."
                  className="focus-ring w-full px-3.5 py-2.5 text-xs rounded-control border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="md:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="focus-ring px-6 py-2.5 rounded-control bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi Phiếu Yêu Cầu Hỗ Trợ"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
