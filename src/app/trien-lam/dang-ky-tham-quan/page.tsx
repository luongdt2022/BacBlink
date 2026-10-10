'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Ticket,
  CheckCircle2,
  Building2,
  Send,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/components/common/toast';

export default function ExpoRegistrationPage() {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: 'Trần Đình Trọng',
    jobTitle: 'Giám đốc Kỹ thuật',
    companyName: 'Công ty CP Thiết bị Công nghiệp Tân Phát',
    businessSector: 'Công nghiệp hỗ trợ & Cơ khí',
    phone: '0987654321',
    email: 'trong.td@tanphatequip.vn',
    website: 'https://tanphatequip.vn',
    expoChoice: 'VIMEXPO & VIETNAM AUTOEXPO 2026',
    productCategory: 'Máy móc & thiết bị công nghiệp',
    purpose: 'Tìm kiếm nhà cung cấp/đối tác'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        companyName: formData.companyName,
        purpose: formData.purpose,
        sectorOfInterest: formData.productCategory
      };

      const res = await fetch('/api/v1/trien-lam/dang-ky', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessCode(data.registrationCode);
        toast.success(`Đã phát hành vé điện tử ${data.registrationCode} thành công!`, 'Đăng Ký Thành Công');
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.message || 'Lỗi đăng ký tham quan triển lãm.', 'Thao tác thất bại');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể kết nối máy chủ.', 'Lỗi kết nối');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successCode) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="surface-card max-w-xl mx-auto p-8 sm:p-10 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl font-extrabold shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-full">
              VÉ ĐIỆN TỬ CHÍNH THỨC
            </span>
            <h2 className="text-2xl font-extrabold text-text-primary dark:text-white mt-2">
              Đăng Ký Tham Quan Triển Lãm Thành Công!
            </h2>
            <p className="text-text-secondary dark:text-slate-300 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              Cảm ơn Quý khách đã đăng ký tham quan tại VIMEXPO & VIETNAM AUTOEXPO 2026. Ban tổ chức đã phát hành mã vé của Quý khách.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-left max-w-sm mx-auto space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary dark:text-slate-400 font-medium">Mã vé tham quan:</span>
              <span className="font-mono font-extrabold text-brand-700 dark:text-cyan-400 text-base">
                {successCode}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary dark:text-slate-400 font-medium">Thời gian:</span>
              <span className="font-bold text-text-primary dark:text-slate-200">9:00 - 17:00, 11-13/06/2026</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary dark:text-slate-400 font-medium">Địa điểm:</span>
              <span className="font-bold text-text-primary dark:text-slate-200">Cung VHLĐ Hữu Nghị Việt Xô</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/khao-sat-nhu-cau"
              className="bg-brand-700 hover:bg-brand-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              Đăng Ký Khảo Sát Đổi Mới Công Nghệ (TNI) <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setSuccessCode(null)}
              className="border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold text-xs transition"
            >
              Đăng ký thêm người khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-20">
      {/* HERO BANNER SECTION (NacenTwin Theme) */}
      <section className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-brand-700 shadow-md">
        <div className="max-w-3xl mx-auto space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold backdrop-blur-sm border border-white/20">
            <Ticket className="w-3.5 h-3.5 text-cyan-300" />
            CỔNG ĐĂNG KÝ VÉ THAM QUAN KẾT NỐI CUNG CẦU
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Triển Lãm Quốc Tế VIMEXPO & VIETNAM AUTOEXPO 2026
          </h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Quy tụ hơn 300+ Gian hàng Công nghiệp hỗ trợ, Cơ khí chế tạo và Doanh nghiệp Đổi mới sáng tạo.
            Đăng ký vé điện tử miễn phí trước ngày 10/06/2026 để nhận mã QR Check-in nhanh tại quầy VIP.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-cyan-300" /> Ngày 11-13/06/2026</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-cyan-300" /> Cung VHLĐ Hữu Nghị Việt Xô (I.C.E Hà Nội)</span>
          </div>
        </div>
      </section>

      {/* FORM CONTAINER */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-8 space-y-6 shadow-md">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                THÔNG TIN ĐẠI DIỆN
              </span>
              <h3 className="text-lg font-extrabold text-text-primary dark:text-white">
                Đăng Ký Nhận Vé Điện Tử
              </h3>
            </div>
            <span className="text-xs text-text-secondary dark:text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Miễn Phí Vé Vào Cửa
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Họ và tên người đăng ký *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="form-control w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Chức vụ / Phòng ban
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="form-control w-full px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tên Công ty / Đơn vị công tác *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="form-control w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Lĩnh vực hoạt động chính
                </label>
                <input
                  type="text"
                  value={formData.businessSector}
                  onChange={(e) => setFormData({ ...formData, businessSector: e.target.value })}
                  className="form-control w-full px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Số điện thoại di động *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-control w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email nhận vé điện tử *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-control w-full px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nhóm sản phẩm / công nghệ quan tâm
                </label>
                <select
                  value={formData.productCategory}
                  onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
                  className="form-control w-full px-3 py-2 text-xs"
                >
                  <option value="Máy móc & thiết bị công nghiệp">Máy móc & thiết bị công nghiệp</option>
                  <option value="Tự động hóa & Thị giác AI">Tự động hóa & Thị giác AI</option>
                  <option value="Công nghiệp ô tô xe máy">Công nghiệp ô tô xe máy</option>
                  <option value="Vật liệu & Nhiệt luyện kim loại">Vật liệu & Nhiệt luyện kim loại</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mục đích chính khi tham quan
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="form-control w-full px-3 py-2 text-xs"
                >
                  <option value="Tìm kiếm nhà cung cấp/đối tác">Tìm kiếm nhà cung cấp / đối tác</option>
                  <option value="Khảo sát công nghệ mới">Khảo sát công nghệ mới</option>
                  <option value="Tìm cơ hội hợp tác chuyển giao">Tìm cơ hội hợp tác chuyển giao</option>
                  <option value="Tham dự hội thảo chuyên đề">Tham dự hội thảo chuyên đề</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Vé sẽ được gửi ngay qua email và SMS sau khi xác nhận.
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-nacen-green-500 hover:bg-nacen-green-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang phát hành vé...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Xác Nhận & Nhận Vé Ngay
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
