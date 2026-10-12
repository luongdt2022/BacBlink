'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  FileText,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  HelpCircle
} from 'lucide-react';
import TniRealtimeCalculator, { TniValues } from '@/components/demand/TniRealtimeCalculator';
import { useToast } from '@/components/common/toast';
import { authClient } from '@/lib/auth-client';
import { getActiveSectors, SectorOption } from '@/lib/master-data-client';
import { SECTORS_18_CATALOG } from '@/services/api/technology-offer';

interface QuickDemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDemand: any) => void;
}

export default function QuickDemandModal({ isOpen, onClose, onSuccess }: QuickDemandModalProps) {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectors, setSectors] = useState<SectorOption[]>(
    SECTORS_18_CATALOG.filter((s) => s.code !== 'ALL')
  );

  useEffect(() => {
    getActiveSectors()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSectors(data);
        }
      })
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    stageName: 'Đúc và Nhiệt luyện kim loại',
    technicalProblem: 'Khắc phục hiện tượng nứt chân chim và co ngót khi đúc phôi hợp kim chịu nhiệt',
    desiredSolution: 'Giải pháp biến tính hạt kim loại và công nghệ làm nguội tuần hoàn',
    needConsulting: true,
    expectedGoal: 'Giảm tỷ lệ phế phẩm đúc từ 7.5% xuống dưới 1.2%, tiết kiệm 800 triệu/năm.',
    sectorCode: 'LV01',
    techGroupCode: 'CN01',
    demandTypeCode: 'NC01',
    budgetRange: '500 triệu – 1 tỷ VNĐ'
  });

  const [tniValues, setTniValues] = useState<TniValues>({
    urgency: 4,
    impact: 4,
    investment: 3,
    readiness: 4
  });

  // Handle ESC key and backdrop scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
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
      };

      const res = await fetch('/api/v1/demands/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authClient.getAuthHeaders(),
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Đã đăng ký bài toán kỹ thuật ${data.itemCode} thành công!`, 'Tạo Thành Công');
        onSuccess(data);
        onClose();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.message || 'Lỗi lưu bài toán từ máy chủ Backend.', 'Thao tác thất bại');
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể kết nối tới máy chủ Backend API.', 'Lỗi kết nối');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop overlay - click to close */}
      <div
        className="fixed inset-0 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Surface Card - Desktop-first layout */}
      <div className="relative w-full max-w-5xl xl:max-w-6xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Sticky Header Bar - Never scrolls out of view */}
        <div className="shrink-0 px-6 py-4 sm:px-8 sm:py-5 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white flex items-center justify-center shadow-md shadow-brand-900/20 shrink-0">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="text-xs font-extrabold uppercase tracking-widest text-brand-700 dark:text-cyan-400 bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-cyan-800/60 px-2.5 py-0.5 rounded-full">
                  TẠO NHANH BÀI TOÁN KỸ THUẬT
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full hidden sm:inline-block">
                  Chuẩn TT17/2019/TT-BKHCN
                </span>
              </div>
              <h3 id="modal-title" className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug truncate">
                Đăng Bài Toán Kỹ Thuật Cần Tìm Cung
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block truncate">
                Khảo sát điểm nghẽn sản xuất, tính toán chỉ số cấp thiết TNI và tự động ghép nối với bên chào bán công nghệ.
              </p>
            </div>
          </div>

          {/* Prominent Close Button X */}
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-all duration-150 focus-ring border border-slate-200/70 dark:border-slate-700 shadow-xs group shrink-0"
            aria-label="Đóng hộp thoại"
            title="Đóng hộp thoại (Phím Esc)"
          >
            <X className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>
        </div>

        {/* Scrollable Form Body with Desktop 2-Column Grid */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left Column: Form Info (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    1. Chi Tiết Bài Toán Kỹ Thuật
                  </h4>
                </div>

                {/* Field 1: Stage Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Công đoạn sản xuất có sự cố <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.stageName}
                    onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
                    placeholder="Ví dụ: Đúc và Nhiệt luyện kim loại, Dập nguội..."
                    className="form-control w-full text-xs sm:text-sm font-medium"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Chỉ rõ phân xưởng hoặc công đoạn gặp điểm nghẽn kỹ thuật.
                  </p>
                </div>

                {/* Field 2: Problem Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Mô tả bài toán kỹ thuật / Điểm nghẽn sản xuất <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.technicalProblem}
                    onChange={(e) => setFormData({ ...formData, technicalProblem: e.target.value })}
                    placeholder="Mô tả chi tiết triệu chứng lỗi, tỷ lệ phế phẩm hoặc thông số kỹ thuật chưa đạt..."
                    className="form-control w-full p-3 text-xs sm:text-sm leading-relaxed"
                  />
                </div>

                {/* Field 3 & 4: 2 Columns for Sector & Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Lĩnh vực theo TT17/2019/TT-BKHCN <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.sectorCode}
                      onChange={(e) => setFormData({ ...formData, sectorCode: e.target.value })}
                      className="form-control w-full text-xs sm:text-sm font-medium"
                    >
                      {sectors.map((sec) => (
                        <option key={sec.code} value={sec.code}>
                          {sec.code} — {sec.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Khung ngân sách dự kiến
                    </label>
                    <select
                      value={formData.budgetRange}
                      onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                      className="form-control w-full text-xs sm:text-sm font-medium"
                    >
                      <option value="Dưới 500 triệu VNĐ">Dưới 500 triệu VNĐ</option>
                      <option value="500 triệu – 1 tỷ VNĐ">500 triệu – 1 tỷ VNĐ</option>
                      <option value="1 – 2 tỷ VNĐ">1 – 2 tỷ VNĐ</option>
                      <option value="2 – 5 tỷ VNĐ">2 – 5 tỷ VNĐ</option>
                      <option value="Trên 5 tỷ VNĐ">Trên 5 tỷ VNĐ</option>
                    </select>
                  </div>
                </div>

                {/* Field 5: Desired Solution */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Giải pháp công nghệ mong muốn
                  </label>
                  <input
                    type="text"
                    value={formData.desiredSolution}
                    onChange={(e) => setFormData({ ...formData, desiredSolution: e.target.value })}
                    placeholder="Ví dụ: Công nghệ biến tính hạt kim loại, tự động hóa cấp phôi..."
                    className="form-control w-full text-xs sm:text-sm"
                  />
                </div>

                {/* Field 6: Expected Goal */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Mục tiêu kinh tế / kỹ thuật kỳ vọng
                  </label>
                  <input
                    type="text"
                    value={formData.expectedGoal}
                    onChange={(e) => setFormData({ ...formData, expectedGoal: e.target.value })}
                    placeholder="Ví dụ: Giảm tỷ lệ phế phẩm đúc từ 7.5% xuống dưới 1.2%..."
                    className="form-control w-full text-xs sm:text-sm"
                  />
                </div>

                {/* Checkbox: Need Consulting */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition">
                    <input
                      type="checkbox"
                      checked={formData.needConsulting}
                      onChange={(e) => setFormData({ ...formData, needConsulting: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded accent-brand-700 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        Yêu cầu Chuyên gia tư vấn 1-1
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Được chuyên gia trong Mạng lưới ĐMST NacenTwin hỗ trợ làm rõ đề bài và kết nối giải pháp.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Right Column: TNI Realtime Calculator (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    2. Chỉ Số Nhu Cầu Đổi Mới (TNI)
                  </h4>
                </div>

                {/* TNI Realtime Calculator */}
                <TniRealtimeCalculator
                  values={tniValues}
                  onChange={setTniValues}
                  compact={false}
                />
              </div>
            </div>
          </div>

          {/* Sticky Footer Bar - Never scrolls out of view */}
          <div className="shrink-0 px-6 py-4 sm:px-8 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800 backdrop-blur-xs flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Dữ liệu được bảo mật & kiểm soát theo cơ chế phân quyền sàn NacenTwin.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-10 sm:h-11 px-5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition focus-ring"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 sm:h-11 bg-brand-700 hover:bg-brand-800 active:bg-brand-900 text-white px-6 rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 focus-ring min-w-[180px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang ghi nhận...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Đăng Bài Toán Lên Sàn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
