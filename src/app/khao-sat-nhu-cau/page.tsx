'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  CheckCircle2,
  Building2,
  Cpu,
  Flame,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import TniRealtimeCalculator, { TniValues, calculateTni, getTniClassification } from '@/components/demand/TniRealtimeCalculator';
import { useToast } from '@/components/common/toast';

export default function KhaoSatNhuCauPage() {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    surveyCode: string;
    createdTickets: string[];
  } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    companyName: '',
    taxCode: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    businessType: 'CO_PHAN',
    enterpriseSize: 'SMALL',
    employeeScale: '',
    revenueRange3y: '',
    
    // Phần B: Hiện trạng
    machineName: '',
    investmentYear: '',
    techOrigin: '',

    // Phần C: Điểm nghẽn
    bottlenecks: [] as string[],

    // Phần E: Dòng nhu cầu
    stageName: '',
    technicalProblem: '',
    desiredSolution: '',
    needConsulting: true,
    expectedGoal: '',
    sectorCode: 'LV01',
    techGroupCode: 'CN01',
    demandTypeCode: 'NC01',
    budgetRange: ''
  });

  const [tniValues, setTniValues] = useState<TniValues>({
    urgency: 4,
    impact: 4,
    investment: 3,
    readiness: 4
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        companyName: formData.companyName,
        taxCode: formData.taxCode,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        businessType: formData.businessType,
        enterpriseSize: formData.enterpriseSize,
        employeeScale: formData.employeeScale,
        revenueRange3y: formData.revenueRange3y,
        currentEquipments: [
          {
            machineName: formData.machineName,
            investmentYear: parseInt(formData.investmentYear) || 2020,
            techOrigin: formData.techOrigin
          }
        ],
        bottlenecks: formData.bottlenecks,
        demands: [
          {
            stageName: formData.stageName,
            technicalProblem: formData.technicalProblem,
            desiredSolution: formData.desiredSolution,
            needConsulting: formData.needConsulting,
            expectedGoal: formData.expectedGoal,
            sectorCode: formData.sectorCode,
            techGroupCode: formData.techGroupCode,
            demandTypeCode: formData.demandTypeCode,
            budgetRange: formData.budgetRange,
            urgencyScore: tniValues.urgency,
            impactScore: tniValues.impact,
            investmentCapacity: tniValues.investment,
            adoptionReadiness: tniValues.readiness
          }
        ]
      };

      const res = await fetch('/api/v1/demands/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setSubmitResult({
          surveyCode: data.surveyCode,
          createdTickets: data.createdDemandItemCodes || ['DMD-20261010-ACTIVE']
        });
        toast.success('Đã tiếp nhận hồ sơ khảo sát và khởi tạo Demand Ticket thành công!', 'Tiếp nhận thành công');
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.message || 'Lỗi khi gửi phiếu khảo sát tới máy chủ Backend.', 'Gửi phiếu thất bại');
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể kết nối đến máy chủ Backend API.', 'Lỗi kết nối');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitResult) {
    const tniScore = calculateTni(tniValues.urgency, tniValues.impact, tniValues.investment, tniValues.readiness);
    const tniMeta = getTniClassification(tniScore);

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="surface-card max-w-2xl mx-auto p-8 sm:p-10 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl font-extrabold shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-full">
              HỒ SƠ KHẢO SÁT HỢP LỆ
            </span>
            <h2 className="text-2xl font-extrabold text-text-primary dark:text-white mt-2">
              Nộp Phiếu Khảo Sát Nhu Cầu Thành Công!
            </h2>
            <p className="text-text-secondary dark:text-slate-300 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              Hệ thống NacenTwin đã tiếp nhận thông tin khảo sát và bóc tách thành công bài toán kỹ thuật của Quý doanh nghiệp.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-left max-w-md mx-auto space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary dark:text-slate-400 font-medium">Mã hồ sơ khảo sát:</span>
              <span className="font-mono font-extrabold text-brand-700 dark:text-cyan-400 text-sm">
                {submitResult.surveyCode}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary dark:text-slate-400 font-medium">Mã vé nhu cầu (Ticket):</span>
              <span className="font-mono font-extrabold text-brand-700 dark:text-brand-300">
                {submitResult.createdTickets[0] || 'DMD-ACTIVE'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
              <span className="text-text-secondary dark:text-slate-400 font-medium">Chỉ số ưu tiên TNI:</span>
              <span className={`inline-flex items-center gap-1 font-extrabold px-2 py-0.5 rounded text-xs border ${tniMeta.badgeClass}`}>
                <Flame className="w-3.5 h-3.5" /> {tniScore}/100 — {tniMeta.label}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/portal/buyer/demands"
              className="bg-brand-700 hover:bg-brand-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              Đến Bàn Làm Việc Buyer Workspace <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setSubmitResult(null)}
              className="border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold text-xs transition"
            >
              Kê khai phiếu khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-20">
      {/* HERO BANNER SECTION (Đồng bộ NacenTwin) */}
      <section className="relative overflow-hidden bg-brand-700 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-brand-800 shadow-md">
        <div aria-hidden="true" className="innovation-hero-art pointer-events-none absolute inset-0" />
        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold backdrop-blur-sm border border-white/20">
              <ClipboardCheck className="w-3.5 h-3.5 text-cyan-300" />
              Mẫu KS-DNNVV-2026 • Bộ Khoa Học & Công Nghệ
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Khảo Sát Nhu Cầu Đổi Mới Công Nghệ & Điểm Nghẽn Kỹ Thuật
            </h1>
            <p className="text-white/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Hỗ trợ các doanh nghiệp vừa và nhỏ tháo gỡ khó khăn, chuẩn hóa chỉ số nhu cầu TNI và kết nối với hơn 500+ Chuyên gia, Viện nghiên cứu đầu ngành.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-slate-300 block">Tiếp nhận bởi:</span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Viện Đổi Mới Sáng Tạo Quốc Gia</span>
          </div>
        </div>
      </section>

      {/* FORM CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* PHẦN A: THÔNG TIN DOANH NGHIỆP */}
          <section className="surface-card p-6 sm:p-8 space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                  PHẦN A
                </span>
                <h3 className="text-lg font-extrabold text-text-primary dark:text-white">
                  Thông Tin Doanh Nghiệp & Quy Mô Sản Xuất
                </h3>
              </div>
              <span className="text-xs text-text-secondary dark:text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> PDPD Bảo Mật
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tên Doanh nghiệp / Tổ chức *
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
                  Mã số thuế (MST) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.taxCode}
                  onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                  className="form-control w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Người đại diện liên hệ *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="form-control w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Số điện thoại di động *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="form-control w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email liên hệ chính thức *
                </label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="form-control w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Quy mô lao động hiện tại
                </label>
                <select
                  value={formData.employeeScale}
                  onChange={(e) => setFormData({ ...formData, employeeScale: e.target.value })}
                  className="form-control w-full px-3 py-2 text-xs"
                >
                  <option value="UNDER_10">Dưới 10 người (Siêu nhỏ)</option>
                  <option value="10-49">10 – 49 người (Nhỏ)</option>
                  <option value="50-199">50 – 199 người (Vừa)</option>
                  <option value="OVER_200">Từ 200 người trở lên (Lớn)</option>
                </select>
              </div>
            </div>
          </section>

          {/* PHẦN B: HIỆN TRẠNG MÁY MÓC */}
          <section className="surface-card p-6 sm:p-8 space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                PHẦN B
              </span>
              <h3 className="text-lg font-extrabold text-text-primary dark:text-white">
                Hiện Trạng Thiết Bị & Dây Chuyền Sản Xuất
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tên thiết bị / máy móc chủ lực *
                </label>
                <input
                  type="text"
                  required
                  value={formData.machineName}
                  onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
                  className="form-control w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Năm đầu tư vận hành
                </label>
                <input
                  type="number"
                  value={formData.investmentYear}
                  onChange={(e) => setFormData({ ...formData, investmentYear: e.target.value })}
                  className="form-control w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Xuất xứ công nghệ
                </label>
                <input
                  type="text"
                  value={formData.techOrigin}
                  onChange={(e) => setFormData({ ...formData, techOrigin: e.target.value })}
                  className="form-control w-full px-3 py-2 text-xs"
                />
              </div>
            </div>
          </section>

          {/* PHẦN C & E: BÀI TOÁN KỸ THUẬT & TÍNH TOÁN CHỈ SỐ TNI */}
          <section className="surface-card p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                PHẦN C & E
              </span>
              <h3 className="text-lg font-extrabold text-text-primary dark:text-white">
                Mô Tả Bài Toán Kỹ Thuật & Đánh Giá Chỉ Số Cấp Thiết TNI
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Công đoạn sản xuất đang gặp khó khăn *
                </label>
                <input
                  type="text"
                  required
                  value={formData.stageName}
                  onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
                  placeholder="Ví dụ: Kiểm tra chất lượng (QC) và Hàn kết cấu"
                  className="form-control w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mô tả chi tiết bài toán kỹ thuật / điểm nghẽn *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.technicalProblem}
                  onChange={(e) => setFormData({ ...formData, technicalProblem: e.target.value })}
                  placeholder="Mô tả cụ thể sự cố, tỷ lệ khuyết tật hoặc chi phí hao phí hiện tại..."
                  className="form-control w-full p-3 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Giải pháp kỹ thuật mong muốn
                  </label>
                  <input
                    type="text"
                    value={formData.desiredSolution}
                    onChange={(e) => setFormData({ ...formData, desiredSolution: e.target.value })}
                    placeholder="Ví dụ: Hệ thống thị giác máy tính AI kết hợp cảm biến siêu âm"
                    className="form-control w-full px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mục tiêu kỳ vọng sau khi đổi mới
                  </label>
                  <input
                    type="text"
                    value={formData.expectedGoal}
                    onChange={(e) => setFormData({ ...formData, expectedGoal: e.target.value })}
                    placeholder="Ví dụ: Giảm 40% thời gian nghiệm thu sản phẩm"
                    className="form-control w-full px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Lĩnh vực theo TT17/2019/TT-BKHCN
                  </label>
                  <select
                    value={formData.sectorCode}
                    onChange={(e) => setFormData({ ...formData, sectorCode: e.target.value })}
                    className="form-control w-full px-3 py-2 text-xs"
                  >
                    <option value="LV01">LV01 — Cơ khí chế tạo & Tự động hóa</option>
                    <option value="LV07">LV07 — Nông nghiệp công nghệ cao</option>
                    <option value="LV11">LV11 — Năng lượng & Môi trường</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Khung ngân sách dự kiến
                  </label>
                  <select
                    value={formData.budgetRange}
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    className="form-control w-full px-3 py-2 text-xs"
                  >
                    <option value="Dưới 500 triệu VNĐ">Dưới 500 triệu VNĐ</option>
                    <option value="500 triệu – 1 tỷ VNĐ">500 triệu – 1 tỷ VNĐ</option>
                    <option value="1 – 3 tỷ VNĐ">1 – 3 tỷ VNĐ</option>
                    <option value="Trên 3 tỷ VNĐ">Trên 3 tỷ VNĐ</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.needConsulting}
                      onChange={(e) => setFormData({ ...formData, needConsulting: e.target.checked })}
                      className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                    />
                    <span>Yêu cầu Chuyên gia tư vấn 1-1</span>
                  </label>
                </div>
              </div>

              {/* BỘ TÍNH ĐIỂM TNI TỰ ĐỘNG THỜI GIAN THỰC */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <TniRealtimeCalculator
                  values={tniValues}
                  onChange={setTniValues}
                />
              </div>
            </div>
          </section>

          {/* SUBMIT BUTTON BAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md">
            <div className="text-xs text-text-secondary dark:text-slate-400">
              <span className="font-bold text-text-primary dark:text-white block">
                Cam kết dữ liệu xác thực
              </span>
              Hồ sơ sẽ được tự động đồng bộ sang Bàn làm việc Buyer và Cổng thẩm định Sở KH&CN.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-nacen-green-500 hover:bg-nacen-green-600 text-white px-8 py-3 rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang ghi nhận vào CSDL...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Hoàn Tất & Nộp Khảo Sát
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
