'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  HelpCircle,
  Edit3
} from 'lucide-react';
import TniRealtimeCalculator, { TniValues } from '@/components/demand/TniRealtimeCalculator';
import SearchableCombobox from '@/components/ui/searchable-combobox';
import { useToast } from '@/components/common/toast';
import { authClient } from '@/lib/auth-client';
import { getActiveSectors, SectorOption } from '@/lib/master-data-client';
import { SECTORS_18_CATALOG } from '@/services/api/technology-offer';
import { getTechGroupsBySector } from '@/components/demand/demand-taxonomy';

export interface DemandItemData {
  id?: string;
  itemCode: string;
  stageName: string;
  technicalProblem: string;
  desiredSolution?: string;
  needConsulting?: boolean;
  expectedGoal?: string;
  applicationScale?: string;
  sectorCode: string;
  techGroupCode?: string;
  demandTypeCode?: string;
  budgetRange: string;
  urgencyScore?: number;
  impactScore?: number;
  investmentCapacity?: number;
  adoptionReadiness?: number;
  tniScore: number;
  tniClassification: string;
  matchingCount?: number;
  status: string;
}

interface EditDemandModalProps {
  isOpen: boolean;
  demand: DemandItemData | null;
  onClose: () => void;
  onSuccess: (updatedDemand: DemandItemData) => void;
}

export default function EditDemandModal({ isOpen, demand, onClose, onSuccess }: EditDemandModalProps) {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectors, setSectors] = useState<SectorOption[]>(
    SECTORS_18_CATALOG.filter((s) => s.code !== 'ALL')
  );

  useEffect(() => {
    setMounted(true);
  }, []);

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
    stageName: '',
    technicalProblem: '',
    desiredSolution: '',
    needConsulting: true,
    expectedGoal: '',
    sectorCode: 'IND_ELEC',
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

  useEffect(() => {
    if (demand) {
      setFormData({
        stageName: demand.stageName || '',
        technicalProblem: demand.technicalProblem || '',
        desiredSolution: demand.desiredSolution || '',
        needConsulting: demand.needConsulting ?? true,
        expectedGoal: demand.expectedGoal || '',
        sectorCode: demand.sectorCode || 'IND_ELEC',
        techGroupCode: demand.techGroupCode || 'CN01',
        demandTypeCode: demand.demandTypeCode || 'NC01',
        budgetRange: demand.budgetRange || '500 triệu – 1 tỷ VNĐ'
      });
      setTniValues({
        urgency: demand.urgencyScore || 4,
        impact: demand.impactScore || 4,
        investment: demand.investmentCapacity || 3,
        readiness: demand.adoptionReadiness || 4
      });
    }
  }, [demand]);

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

  if (!isOpen || !demand || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demand.id) {
      toast.error('Không tìm thấy mã định danh bài toán.', 'Lỗi');
      return;
    }

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

      const token = authClient.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/v1/buyer/demands/${demand.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể cập nhật bài toán nhu cầu.');
      }

      const result = await res.json();
      toast.success('Đã cập nhật bài toán kỹ thuật thành công!', 'Thành công');
      onSuccess(result);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra khi lưu bài toán.', 'Thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-border-default dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-default dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-text-primary dark:text-white">
                  Chỉnh Sửa Bài Toán Kỹ Thuật
                </h2>
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {demand.itemCode}
                </span>
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  {demand.status}
                </span>
              </div>
              <p className="text-xs text-text-secondary dark:text-slate-400 mt-0.5">
                Cập nhật thông số bài toán, khoảng ngân sách và tính toán lại điểm cấp thiết TNI.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY / FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* SECTION 1: NỘI DUNG BÀI TOÁN */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-brand-700 dark:text-cyan-400">
              <Wrench className="w-4 h-4" /> 1. Thông Tin Chi Tiết Bài Toán Kỹ Thuật
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-primary dark:text-slate-200 mb-1.5">
                  Lĩnh Vực Công Nghệ <span className="text-rose-500">*</span>
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
                  ariaLabel="Lĩnh Vực Công Nghệ"
                  searchPlaceholder="Tìm lĩnh vực (VD: Cơ khí, Công nghệ thông tin...)"
                  options={sectors.map((sec) => ({
                    value: sec.code,
                    code: sec.code,
                    label: sec.name
                  }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary dark:text-slate-200 mb-1.5">
                  Nhóm Công Nghệ
                </label>
                <SearchableCombobox
                  value={formData.techGroupCode}
                  onChange={(val) => setFormData({ ...formData, techGroupCode: val })}
                  ariaLabel="Nhóm Công Nghệ"
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

              <div>
                <label className="block text-xs font-bold text-text-primary dark:text-slate-200 mb-1.5">
                  Công Đoạn Cần Cải Tiến / Tự Động Hóa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.stageName}
                  onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
                  placeholder="Ví dụ: Đóng gói tự động, Luyện kim, Sơn tĩnh điện..."
                  className="w-full text-xs font-medium rounded-xl border border-border-default dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary dark:text-slate-200 mb-1.5">
                Mô Tả Bài Toán Kỹ Thuật & Điểm Nghẽn Hiện Tại <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={formData.technicalProblem}
                onChange={(e) => setFormData({ ...formData, technicalProblem: e.target.value })}
                rows={3}
                placeholder="Mô tả chi tiết sự cố kỹ thuật, phế phẩm, hoặc rào cản năng suất..."
                className="w-full text-xs font-medium rounded-xl border border-border-default dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary dark:text-slate-200 mb-1.5">
                Mục Tiêu & Chỉ Tiêu Kỳ Vọng Đạt Được <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={formData.expectedGoal}
                onChange={(e) => setFormData({ ...formData, expectedGoal: e.target.value })}
                rows={2}
                placeholder="Ví dụ: Giảm tỷ lệ lỗi phế phẩm từ 5% xuống dưới 1%, tăng năng suất 30%..."
                className="w-full text-xs font-medium rounded-xl border border-border-default dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-primary dark:text-slate-200 mb-1.5">
                  Dự Kiến Ngân Sách Đầu Tư
                </label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                  className="w-full text-xs font-medium rounded-xl border border-border-default dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Dưới 100 triệu VNĐ">Dưới 100 triệu VNĐ</option>
                  <option value="100 – 300 triệu VNĐ">100 – 300 triệu VNĐ</option>
                  <option value="300 – 500 triệu VNĐ">300 – 500 triệu VNĐ</option>
                  <option value="500 triệu – 1 tỷ VNĐ">500 triệu – 1 tỷ VNĐ</option>
                  <option value="1 – 3 tỷ VNĐ">1 – 3 tỷ VNĐ</option>
                  <option value="3 – 5 tỷ VNĐ">3 – 5 tỷ VNĐ</option>
                  <option value="Trên 5 tỷ VNĐ">Trên 5 tỷ VNĐ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary dark:text-slate-200 mb-1.5">
                  Định Hướng Giải Pháp Mong Muốn
                </label>
                <input
                  type="text"
                  value={formData.desiredSolution}
                  onChange={(e) => setFormData({ ...formData, desiredSolution: e.target.value })}
                  placeholder="Ví dụ: Nhập khẩu máy chuyên dụng, Đặt hàng Viện/Trường R&D..."
                  className="w-full text-xs font-medium rounded-xl border border-border-default dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="needConsultingEdit"
                checked={formData.needConsulting}
                onChange={(e) => setFormData({ ...formData, needConsulting: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700"
              />
              <label htmlFor="needConsultingEdit" className="text-xs font-semibold text-text-primary dark:text-slate-300 cursor-pointer">
                Cần Ban Cố vấn BACLINK chỉ định chuyên gia tư vấn công nghệ 1-1 hỗ trợ thẩm định giải pháp
              </label>
            </div>
          </div>

          {/* SECTION 2: ĐÁNH GIÁ CHỈ SỐ CẤP THIẾT TNI */}
          <div className="pt-2 border-t border-border-default dark:border-slate-800">
            <TniRealtimeCalculator
              values={tniValues}
              onChange={(newVals) => setTniValues(newVals)}
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-border-default dark:border-slate-700 text-xs font-bold text-text-secondary dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu thay đổi...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Lưu Thay Đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
