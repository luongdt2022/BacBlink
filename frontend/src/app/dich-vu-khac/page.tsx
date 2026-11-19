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
      {/* HERO BANNER SECTION (ĐỒNG BỘ CHUẨN DESIGN SYSTEM BACLINK) */}
      <section className="relative overflow-hidden workspace-banner text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-brand-800 shadow-md">
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
          <div id="chuoi-cung-ung-fdi" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-brand-300 hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 scroll-mt-24">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950 dark:text-emerald-300">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="type-card-title text-slate-900 dark:text-white">
              3. Tư Vấn Chuẩn Hóa Chuỗi Cung Ứng FDI (ISO / IATF / ESG)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Đồng hành cùng nhà máy hội viên đánh giá hiện trạng sản xuất, chuẩn hóa hệ thống quản lý chất lượng và môi trường đáp ứng yêu cầu vendor cấp 1, cấp 2 của các tập đoàn FDI tại Bắc Ninh.
            </p>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Chuẩn hóa quy trình ISO 9001, ISO 14001 &amp; IATF 16949
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Tư vấn kiểm soát ESD, Lean/5S &amp; truy xuất sản xuất MES
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Kiểm kê phát thải ESG &amp; chuẩn bị hồ sơ audit nhà máy FDI
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
                  placeholder="Công ty Cổ phần / Nhà máy sản xuất..."
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
                  <option value="VALUATION">Định giá công nghệ &amp; Tài sản trí tuệ</option>
                  <option value="PATENT">Đăng ký sáng chế / Giải pháp hữu ích / SHTT</option>
                  <option value="FDI_CHAIN">Tư vấn chuẩn hóa chuỗi cung ứng FDI (ISO / IATF / ESG)</option>
                  <option value="TRANSFER">Môi giới &amp; Ký kết hợp đồng chuyển giao công nghệ</option>
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
