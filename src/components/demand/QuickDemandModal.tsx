'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  PlusCircle,
  FileText,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import TniRealtimeCalculator, { TniValues } from '@/components/demand/TniRealtimeCalculator';
import TniMethodologyModal from '@/components/common/TniMethodologyModal';
import SearchableCombobox from '@/components/ui/searchable-combobox';
import { useToast } from '@/components/common/toast';
import { authClient } from '@/lib/auth-client';
import { getActiveSectors, SectorOption } from '@/lib/master-data-client';
import { SECTORS_18_CATALOG } from '@/services/api/technology-offer';
import {
  TECH_GROUP_OPTIONS,
  getTechGroupsBySector,
  DEMAND_TYPE_OPTIONS,
  BUDGET_RANGES_7
} from '@/app/khao-sat-nhu-cau/types';

interface QuickDemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDemand: any) => void;
}

export default function QuickDemandModal({ isOpen, onClose, onSuccess }: QuickDemandModalProps) {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
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

  const initialFormData = {
    // 1. Tên công nghệ/ thiết bị
    technologyName: '',
    // 2. Mô tả chi tiết thêm về nhu cầu
    solutionDetail: '',
    // 3. Ngân sách
    budgetRange: BUDGET_RANGES_7[3] || '500 triệu–1 tỷ đồng',
    // 4. Lĩnh vực
    sectorCode: 'LV01',
    // 5. Nhóm công nghệ
    techGroupCode: 'CN01',
    // 6. Công đoạn sản xuất có sự cố
    stageName: '',
    // 7. Mô tả cụ thể vấn đề kỹ thuật / điểm nghẽn *
    technicalProblem: '',
    // 8. Mục tiêu kỹ thuật và kinh tế kỳ vọng sau khi có công nghệ/ thiết bị
    expectedGoal: '',
    // 9. Cần chuyên gia tư vấn
    needConsulting: false,
    // 10. Loại hình tiếp nhận
    demandTypeCode: 'NC01',
    // 11. Dải TRL mong muốn tiếp nhận
    targetTrlRange: 'TRL_4_6',
    // 12. Chế độ bảo mật danh tính
    isConfidential: false,
    // 13. Thời hạn nhận đề xuất
    deadlineDate: '',
    // 14. File đính kèm RFP
    rfpFileName: '',
  };

  const initialTniValues: TniValues = {
    urgency: 3,
    impact: 3,
    investment: 3,
    readiness: 3,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [tniValues, setTniValues] = useState<TniValues>(initialTniValues);

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

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const desiredSolutionCombined = formData.solutionDetail
        ? `${formData.technologyName} — ${formData.solutionDetail}`
        : formData.technologyName;

      const payload = {
        stageName: formData.stageName,
        technicalProblem: formData.technicalProblem,
        desiredSolution: desiredSolutionCombined,
        needConsulting: formData.needConsulting,
        expectedGoal: formData.expectedGoal,
        applicationScale: formData.solutionDetail || '',
        sectorCode: formData.sectorCode,
        techGroupCode: formData.techGroupCode,
        demandTypeCode: formData.demandTypeCode,
        budgetRange: formData.budgetRange,
        targetTrlRange: formData.targetTrlRange,
        isConfidential: formData.isConfidential,
        deadlineDate: formData.deadlineDate || null,
        rfpFileName: formData.rfpFileName || null,
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
        setFormData(initialFormData);
        setTniValues(initialTniValues);
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

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
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
      <div className="relative w-full max-w-5xl xl:max-w-6xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-auto">
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
              <div className="lg:col-span-6 space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      1. Chi Tiết Bài Toán Kỹ Thuật
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      B. Khảo sát nhu cầu công nghệ / Vấn đề cần giải quyết (10 tiêu chí)
                    </p>
                  </div>
                </div>

                {/* 1. Tên công nghệ/ thiết bị */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    1. Tên công nghệ / thiết bị <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.technologyName}
                    onChange={(e) => setFormData({ ...formData, technologyName: e.target.value })}
                    placeholder="Ví dụ: Ứng dụng KH&CN xây dựng mô hình thâm canh cây na rải vụ..."
                    className="form-control w-full text-xs font-medium"
                  />
                </div>

                {/* 2. Mô tả chi tiết thêm về nhu cầu */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    2. Mô tả chi tiết thêm về nhu cầu
                  </label>
                  <textarea
                    rows={2}
                    value={formData.solutionDetail}
                    onChange={(e) => setFormData({ ...formData, solutionDetail: e.target.value })}
                    placeholder="Mô tả cụ thể các yêu cầu kỹ thuật, giải pháp mong muốn tiếp nhận..."
                    className="form-control w-full p-2.5 text-xs leading-relaxed"
                  />
                </div>

                {/* Hàng 3 trường: 3. Ngân sách - 4. Lĩnh vực - 5. Nhóm công nghệ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* 3. Ngân sách */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      3. Ngân sách
                    </label>
                    <select
                      value={formData.budgetRange}
                      onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                      className="form-control w-full text-xs font-medium"
                    >
                      {BUDGET_RANGES_7.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4. Lĩnh vực */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 truncate" title="Lĩnh vực">
                      4. Lĩnh vực <span className="text-rose-500">*</span>
                    </label>
                    <SearchableCombobox
                      value={formData.sectorCode}
                      onChange={(newSector) => {
                        const { recommended } = getTechGroupsBySector(newSector);
                        const isCurrentStillRecommended = recommended.some(
                          (tg) => tg.code === formData.techGroupCode
                        );
                        const nextTechGroup = isCurrentStillRecommended
                          ? formData.techGroupCode
                          : recommended[0]?.code || formData.techGroupCode;
                        setFormData({
                          ...formData,
                          sectorCode: newSector,
                          techGroupCode: nextTechGroup
                        });
                      }}
                      ariaLabel="4. Lĩnh vực"
                      searchPlaceholder="Tìm lĩnh vực (VD: Cơ khí, Công nghệ thông tin...)"
                      options={sectors.map((sec) => ({
                        value: sec.code,
                        code: sec.code,
                        label: sec.name
                      }))}
                    />
                  </div>

                  {/* 5. Nhóm công nghệ */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 truncate" title="Nhóm công nghệ">
                      5. Nhóm công nghệ
                    </label>
                    <SearchableCombobox
                      value={formData.techGroupCode}
                      onChange={(val) => setFormData({ ...formData, techGroupCode: val })}
                      ariaLabel="5. Nhóm công nghệ"
                      searchPlaceholder="Tìm nhóm công nghệ (VD: Robot, AI, Tự động hóa...)"
                      options={getTechGroupsBySector(formData.sectorCode).allSorted.map((tg) => ({
                        value: tg.code,
                        code: tg.code,
                        label: tg.name,
                        group: tg.groupLabel,
                        recommended: tg.isRecommended,
                        badge: tg.isRecommended ? '★ Phù hợp cao với lĩnh vực đã chọn' : undefined
                      }))}
                    />
                  </div>
                </div>

                {/* 6. Công đoạn sản xuất có sự cố */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    6. Công đoạn sản xuất có sự cố <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.stageName}
                    onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
                    placeholder="Ví dụ: Đúc và Nhiệt luyện kim loại, Dập nguội, Thu hoạch & Đóng gói..."
                    className="form-control w-full text-xs font-medium"
                  />
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chỉ rõ phân xưởng hoặc quy trình sản xuất đang gặp khó khăn.
                  </p>
                </div>

                {/* 7. Mô tả cụ thể vấn đề kỹ thuật / điểm nghẽn * */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    7. Mô tả cụ thể vấn đề kỹ thuật / điểm nghẽn <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.technicalProblem}
                    onChange={(e) => setFormData({ ...formData, technicalProblem: e.target.value })}
                    placeholder="Mô tả cụ thể sự cố, tỷ lệ phế phẩm hoặc thông số kỹ thuật chưa đạt cần khắc phục..."
                    className="form-control w-full p-2.5 text-xs leading-relaxed"
                  />
                </div>

                {/* 8. Mục tiêu kỹ thuật và kinh tế kỳ vọng sau khi có công nghệ/ thiết bị */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    8. Mục tiêu kỹ thuật và kinh tế kỳ vọng sau khi có công nghệ/ thiết bị
                  </label>
                  <input
                    type="text"
                    value={formData.expectedGoal}
                    onChange={(e) => setFormData({ ...formData, expectedGoal: e.target.value })}
                    placeholder="Ví dụ: Giảm tỷ lệ phế phẩm đúc từ 7.5% xuống dưới 1.2%, tiết kiệm 800 triệu/năm..."
                    className="form-control w-full text-xs font-medium"
                  />
                </div>

                {/* Hàng 2 trường: 9. Cần chuyên gia tư vấn & 10. Loại hình tiếp nhận */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  {/* 9. Cần chuyên gia tư vấn */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      9. Cần chuyên gia tư vấn
                    </label>
                    <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition h-11">
                      <input
                        type="checkbox"
                        checked={formData.needConsulting}
                        onChange={(e) => setFormData({ ...formData, needConsulting: e.target.checked })}
                        className="w-4 h-4 rounded accent-brand-700 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Có nhu cầu tư vấn 1-1 từ chuyên gia
                      </span>
                    </label>
                  </div>

                  {/* 10. Loại hình tiếp nhận */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      10. Loại hình tiếp nhận
                    </label>
                    <SearchableCombobox
                      value={formData.demandTypeCode}
                      onChange={(val) => setFormData({ ...formData, demandTypeCode: val })}
                      ariaLabel="10. Loại hình tiếp nhận"
                      searchPlaceholder="Tìm loại hình tiếp nhận..."
                      options={DEMAND_TYPE_OPTIONS.map((dt) => ({
                        value: dt.code,
                        code: dt.code,
                        label: dt.name
                      }))}
                    />
                  </div>
                </div>

                {/* Hàng: 11. Target TRL & 12. Thời hạn (Deadline) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end pt-1">
                  {/* 11. Target TRL */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      11. Mức TRL mong muốn tiếp nhận
                    </label>
                    <select
                      value={formData.targetTrlRange}
                      onChange={(e) => setFormData({ ...formData, targetTrlRange: e.target.value })}
                      className="form-control w-full text-xs font-medium"
                    >
                      <option value="TRL_1_3">TRL 1–3: Nghiên cứu Lab / Thử nghiệm</option>
                      <option value="TRL_4_6">TRL 4–6: Thử nghiệm Pilot / Mô hình thực tế</option>
                      <option value="TRL_7_9">TRL 7–9: Công nghệ hoàn thiện / Thương mại hóa</option>
                    </select>
                  </div>

                  {/* 12. Thời hạn (Deadline) */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      12. Hạn chót nhận chào giải pháp
                    </label>
                    <input
                      type="date"
                      value={formData.deadlineDate}
                      onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                      className="form-control w-full text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Hàng: 13. Bảo mật ẩn danh & 14. File RFP đính kèm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end pt-1">
                  {/* 13. Chế độ bảo mật ẩn danh */}
                  <div>
                    <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition h-11">
                      <input
                        type="checkbox"
                        checked={formData.isConfidential}
                        onChange={(e) => setFormData({ ...formData, isConfidential: e.target.checked })}
                        className="w-4 h-4 rounded accent-brand-700 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Đăng ẩn danh tên công ty
                      </span>
                    </label>
                  </div>

                  {/* 14. Đính kèm RFP */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      13. Tài liệu yêu cầu kỹ thuật (RFP)
                    </label>
                    <input
                      type="text"
                      value={formData.rfpFileName}
                      onChange={(e) => setFormData({ ...formData, rfpFileName: e.target.value })}
                      placeholder="Tên tệp đính kèm (VD: RFP_HeThongHan.pdf)"
                      className="form-control w-full text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: TNI Realtime Calculator (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      2. Chỉ Số Nhu Cầu Đổi Mới (TNI)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMethodologyOpen(true)}
                    className="inline-flex items-center gap-1 text-xs text-rose-700 dark:text-rose-400 hover:text-rose-800 font-bold bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 px-2.5 py-1 rounded-full transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Phương pháp luận K-L-N-O
                  </button>
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
              <span>Dữ liệu được bảo mật & kiểm soát theo cơ chế phân quyền sàn BACLINK.</span>
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

      <TniMethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>,
    document.body
  );
}
