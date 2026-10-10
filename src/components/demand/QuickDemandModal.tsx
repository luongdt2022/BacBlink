'use client';

import React, { useState } from 'react';
import { X, Flame, PlusCircle, CheckCircle2 } from 'lucide-react';
import TniRealtimeCalculator, { TniValues } from '@/components/demand/TniRealtimeCalculator';
import { useToast } from '@/components/common/toast';

interface QuickDemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDemand: any) => void;
}

export default function QuickDemandModal({ isOpen, onClose, onSuccess }: QuickDemandModalProps) {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        headers: { 'Content-Type': 'application/json' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="surface-card max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 shadow-2xl relative">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-extrabold text-brand-700 dark:text-cyan-400 uppercase tracking-widest bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-full">
              TẠO NHANH BÀI TOÁN
            </span>
            <h3 className="text-lg font-extrabold text-text-primary dark:text-white mt-1">
              Đăng Bài Toán Kỹ Thuật Cần Tìm Cung
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Công đoạn sản xuất có sự cố *
            </label>
            <input
              type="text"
              required
              value={formData.stageName}
              onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
              className="form-control w-full px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Mô tả bài toán kỹ thuật / Điểm nghẽn sản xuất *
            </label>
            <textarea
              required
              rows={3}
              value={formData.technicalProblem}
              onChange={(e) => setFormData({ ...formData, technicalProblem: e.target.value })}
              className="form-control w-full p-3 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <option value="500 triệu – 1 tỷ VNĐ">500 triệu – 1 tỷ VNĐ</option>
                <option value="1 – 2 tỷ VNĐ">1 – 2 tỷ VNĐ</option>
                <option value="2 – 5 tỷ VNĐ">2 – 5 tỷ VNĐ</option>
              </select>
            </div>
          </div>

          {/* TNI Calculator Compact */}
          <div className="pt-2">
            <TniRealtimeCalculator
              values={tniValues}
              onChange={setTniValues}
              compact={true}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-700 hover:bg-brand-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang ghi nhận...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" /> Đăng Bài Toán Lên Sàn
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
