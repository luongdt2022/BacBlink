'use client';

import React, { useState } from 'react';
import { Flame, Sparkles, TrendingUp, ShieldAlert, Cpu, BookOpen, BarChart2 } from 'lucide-react';
import TniMethodologyModal from '@/components/common/TniMethodologyModal';

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

const DIMENSION_DESCRIPTIONS = {
  urgency: [
    'Thăm dò ý tưởng, chưa ảnh hưởng sản xuất',
    'Nâng cấp định kỳ theo kế hoạch năm',
    'Giảm hiệu suất dây chuyền, có thể khắc phục tạm thời',
    'Sự cố dừng dây chuyền, khẩn cấp cần xử lý ngay',
    'Đình trệ toàn bộ nhà máy, rủi ro đứt gãy cung ứng'
  ],
  impact: [
    'Tác động không đáng kể đến chi phí vận hành',
    'Ảnh hưởng nhỏ lẻ (< 5% doanh thu hàng năm)',
    'Ảnh hưởng 5% - 20% doanh thu hoặc chi phí',
    'Ảnh hưởng > 20% doanh thu toàn năm',
    'Tác động sống còn đến sự tồn tại của doanh nghiệp'
  ],
  investment: [
    'Chưa bố trí ngân sách, trông chờ tài trợ 100%',
    'Ngân sách hạn hẹp (< 100 triệu VNĐ)',
    'Có thể cân đối kinh phí (100 – 500 triệu VNĐ)',
    'Đã bố trí sẵn quỹ R&D / Vay ưu đãi (500 triệu – 2 tỷ VNĐ)',
    'Nguồn lực dồi dào, cam kết giải ngân tức thì (> 2 tỷ VNĐ)'
  ],
  readiness: [
    'Chưa có nhân sự kỹ thuật tiếp nhận',
    'Cần chuyển giao và đào tạo toàn diện từ đầu',
    'Có kỹ sư vận hành cơ bản nhưng thiếu kinh nghiệm chuyên sâu',
    'Đội ngũ kỹ sư sẵn sàng làm chủ công nghệ ngay',
    'Bộ phận R&D chuyên trách, sẵn sàng cải tiến & mở rộng'
  ]
};

export default function TniRealtimeCalculator({ values, onChange, compact = false }: TniRealtimeCalculatorProps) {
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const score = calculateTni(values.urgency, values.impact, values.investment, values.readiness);
  const classification = getTniClassification(score);

  const handleSliderChange = (key: keyof TniValues, val: number) => {
    onChange({
      ...values,
      [key]: val
    });
  };

  const dimensions: Array<{
    key: keyof TniValues;
    code: string;
    title: string;
    weight: string;
    value: number;
    descriptions: string[];
  }> = [
    {
      key: 'urgency',
      code: 'K',
      title: 'Tính Cấp Thiết',
      weight: '35%',
      value: values.urgency,
      descriptions: DIMENSION_DESCRIPTIONS.urgency
    },
    {
      key: 'impact',
      code: 'L',
      title: 'Mức Độ Tác Động',
      weight: '30%',
      value: values.impact,
      descriptions: DIMENSION_DESCRIPTIONS.impact
    },
    {
      key: 'investment',
      code: 'N',
      title: 'Khả Năng Đầu Tư',
      weight: '20%',
      value: values.investment,
      descriptions: DIMENSION_DESCRIPTIONS.investment
    },
    {
      key: 'readiness',
      code: 'O',
      title: 'Sẵn Sàng Chuyển Giao',
      weight: '15%',
      value: values.readiness,
      descriptions: DIMENSION_DESCRIPTIONS.readiness
    }
  ];

  return (
    <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Live Score Display Card */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-brand-700 dark:text-cyan-400 uppercase tracking-wider bg-brand-50 dark:bg-brand-950/70 px-2 py-0.5 rounded-md border border-brand-200/60 dark:border-cyan-800/50">
                CHỈ SỐ ĐỔI MỚI
              </span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                Chuẩn hóa 0–100
              </span>
            </div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
              <span>Technology Need Index</span>
              <span className="text-brand-700 dark:text-cyan-400 font-mono">(TNI)</span>
            </h4>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight leading-none">
                  {score}
                </span>
                <span className="text-xs font-semibold text-slate-400">/100</span>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full text-xs font-bold border ${classification.badgeClass}`}>
                <Flame className="w-3 h-3" /> {classification.label}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                score >= 80
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                  : score >= 65
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                  : score >= 50
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                  : 'bg-gradient-to-r from-slate-400 to-slate-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>0</span>
            <span>50 (Trung bình)</span>
            <span>65 (Cao)</span>
            <span>80 (Rất cao)</span>
            <span>100</span>
          </div>
        </div>

        {/* Formula & Modal Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Công thức: <code className="text-brand-700 dark:text-cyan-400 font-bold">TNI = ROUND((35K + 30L + 20N + 15O)/5)</code>
          </p>
          <button
            type="button"
            onClick={() => setIsMethodologyOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 underline"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Giải thích công thức tính chỉ số cấp thiết TNI
          </button>
        </div>
      </div>

      {/* Matching Policy Box & BACLINK Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="text-xs bg-brand-50/80 dark:bg-brand-950/60 border border-brand-200/70 dark:border-brand-900 text-brand-900 dark:text-brand-200 p-3 rounded-xl flex items-start gap-2.5">
          <TrendingUp className="w-4 h-4 text-brand-700 dark:text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Chính sách xử lý tự động:</span>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {classification.policy}
            </p>
          </div>
        </div>

        <div className="text-xs bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200 p-3 rounded-xl flex items-start gap-2.5">
          <BarChart2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="font-bold block">Điều phối ưu tiên BACLINK:</span>
              <button
                type="button"
                onClick={() => setIsMethodologyOpen(true)}
                className="text-[11px] text-emerald-800 dark:text-emerald-300 underline font-bold"
              >
                Chi tiết
              </button>
            </div>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              Hồ sơ có TNI cao được Ban Cố vấn Kỹ thuật BACLINK ưu tiên ghép nối trực tiếp với các nhà cung ứng trong KCN Bắc Ninh.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Dimension Slider Cards */}
      <div className={`grid ${compact ? 'grid-cols-1 gap-3' : 'grid-cols-1 sm:grid-cols-2 gap-3.5'}`}>
        {dimensions.map((dim) => {
          const currentDesc = dim.descriptions[dim.value - 1] || '';
          return (
            <div
              key={dim.key}
              className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 space-y-2 transition-all hover:border-brand-300 dark:hover:border-slate-700 shadow-2xs"
            >
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-brand-700 dark:text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">
                    {dim.code}
                  </span>
                  <span>{dim.title}</span>
                  <span className="text-xs text-slate-400 font-normal">({dim.weight})</span>
                </div>
                <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-cyan-400 border border-brand-200/60 dark:border-cyan-800/50">
                  {dim.value}/5
                </span>
              </div>

              {/* Slider Controls */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={dim.value}
                  onChange={(e) => handleSliderChange(dim.key, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-700 dark:accent-cyan-400"
                />

                {/* Quick Step Buttons for precision desktop clicking */}
                <div className="flex justify-between gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleSliderChange(dim.key, lvl)}
                      className={`flex-1 py-1 text-xs font-mono font-bold rounded transition-colors ${
                        dim.value === lvl
                          ? 'bg-brand-700 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context Description */}
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight pt-0.5 line-clamp-2">
                {currentDesc}
              </p>
            </div>
          );
        })}
      </div>

      <TniMethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
}
