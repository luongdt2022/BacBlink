'use client';

import React from 'react';
import { Flame } from 'lucide-react';

export interface TniValues {
  urgency: number;   // K: 1-5 (35%)
  impact: number;    // L: 1-5 (30%)
  investment: number;// N: 1-5 (20%)
  readiness: number; // O: 1-5 (15%)
}

interface TniRealtimeCalculatorProps {
  values: TniValues;
  onChange: (newValues: TniValues) => void;
  compact?: boolean;
}

export function calculateTni(k: number, l: number, n: number, o: number): number {
  const raw = (k * 35 + l * 30 + n * 20 + o * 15) / 5;
  return Math.round(raw);
}

export function getTniClassification(score: number): {
  label: string;
  badgeClass: string;
  policy: string;
} {
  if (score >= 80) {
    return {
      label: 'Nhu cầu rất cao',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900',
      policy: 'Ưu tiên P0: Đẩy ngay vào hàng chờ Matching tự động; gán chuyên gia tư vấn 1-1 trong 24h.'
    };
  }
  if (score >= 65) {
    return {
      label: 'Nhu cầu cao',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900',
      policy: 'Ưu tiên P1: Ghép nối tự động theo đợt với Seller phù hợp; gửi thông báo đẩy đến các bên chào bán.'
    };
  }
  if (score >= 50) {
    return {
      label: 'Nhu cầu trung bình',
      badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-900',
      policy: 'Tiếp nhận bình thường: Gợi ý danh mục công nghệ trên sàn; hỗ trợ doanh nghiệp làm rõ bài toán.'
    };
  }
  return {
    label: 'Nhu cầu thấp',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    policy: 'Lưu hồ sơ theo dõi; đề xuất tham gia các chương trình đào tạo hoặc hội thảo nâng cao nhận thức.'
  };
}

export default function TniRealtimeCalculator({ values, onChange, compact = false }: TniRealtimeCalculatorProps) {
  const score = calculateTni(values.urgency, values.impact, values.investment, values.readiness);
  const classification = getTniClassification(score);

  const handleSliderChange = (key: keyof TniValues, val: number) => {
    onChange({
      ...values,
      [key]: val
    });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Header & Live Score Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            CHỈ SỐ NHU CẦU ĐỔI MỚI CÔNG NGHỆ
          </span>
          <h4 className="text-base font-extrabold text-text-primary dark:text-white flex items-center gap-2">
            Technology Need Index (TNI)
          </h4>
          <p className="text-xs text-text-secondary dark:text-slate-400 mt-0.5">
            Công thức chuẩn: <code className="font-mono text-brand-700 dark:text-cyan-400">TNI = ROUND((35%K + 30%L + 20%N + 15%O)/5)</code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-3xl font-extrabold text-text-primary dark:text-white leading-none">
              {score}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full text-xs font-extrabold border ${classification.badgeClass}`}>
              <Flame className="w-3 h-3" /> {classification.label}
            </span>
          </div>
        </div>
      </div>

      <div className="text-xs bg-brand-50/70 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-900 text-brand-900 dark:text-brand-200 p-3 rounded-xl flex items-start gap-2">
        <span className="font-bold shrink-0">Chính sách xử lý:</span>
        <span>{classification.policy}</span>
      </div>

      {/* 4 Dimension Controls */}
      <div className={`grid ${compact ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
        {/* K: Tính cấp thiết (35%) */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              K. Tính Cấp Thiết (Trọng số 35%)
            </span>
            <span className="font-mono font-extrabold text-brand-700 dark:text-cyan-400">
              Mức {values.urgency}/5
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={values.urgency}
            onChange={(e) => handleSliderChange('urgency', parseInt(e.target.value))}
            className="w-full accent-brand-700 cursor-pointer"
          />
          <p className="text-xs text-slate-400">
            {values.urgency >= 4 ? 'Sự cố dừng dây chuyền, khẩn cấp' : 'Nâng cấp định kỳ'}
          </p>
        </div>

        {/* L: Tác động doanh thu/chi phí (30%) */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              L. Mức Độ Tác Động (Trọng số 30%)
            </span>
            <span className="font-mono font-extrabold text-brand-700 dark:text-cyan-400">
              Mức {values.impact}/5
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={values.impact}
            onChange={(e) => handleSliderChange('impact', parseInt(e.target.value))}
            className="w-full accent-brand-700 cursor-pointer"
          />
          <p className="text-xs text-slate-400">
            {values.impact >= 4 ? 'Ảnh hưởng > 20% doanh thu toàn năm' : 'Tác động nhỏ lẻ'}
          </p>
        </div>

        {/* N: Năng lực tài chính đầu tư (20%) */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              N. Khả Năng Đầu Tư (Trọng số 20%)
            </span>
            <span className="font-mono font-extrabold text-brand-700 dark:text-cyan-400">
              Mức {values.investment}/5
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={values.investment}
            onChange={(e) => handleSliderChange('investment', parseInt(e.target.value))}
            className="w-full accent-brand-700 cursor-pointer"
          />
          <p className="text-xs text-slate-400">
            {values.investment >= 4 ? 'Đã bố trí sẵn quỹ R&D / Vay ưu đãi' : 'Ngân sách hạn hẹp'}
          </p>
        </div>

        {/* O: Mức độ sẵn sàng tiếp nhận (15%) */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              O. Sẵn Sàng Chuyển Giao (Trọng số 15%)
            </span>
            <span className="font-mono font-extrabold text-brand-700 dark:text-cyan-400">
              Mức {values.readiness}/5
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={values.readiness}
            onChange={(e) => handleSliderChange('readiness', parseInt(e.target.value))}
            className="w-full accent-brand-700 cursor-pointer"
          />
          <p className="text-xs text-slate-400">
            {values.readiness >= 4 ? 'Đội ngũ kỹ sư sẵn sàng làm chủ CN' : 'Cần đào tạo từ đầu'}
          </p>
        </div>
      </div>
    </div>
  );
}
