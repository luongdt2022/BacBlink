"use client";

import React from "react";
import { Check, FileText, Sliders, DollarSign, ShieldCheck } from "lucide-react";

export interface FormStepperProps {
  currentStep: number;
  onStepSelect?: (step: number) => void;
  completedSteps?: number[];
}

export const FORM_STEPS = [
  {
    step: 1,
    title: "Thông tin bắt buộc",
    subtitle: "Tên, loại hình, bài toán, ngành",
    icon: FileText,
  },
  {
    step: 2,
    title: "Thông số & ngành",
    subtitle: "Bảng 18 ngành TT17 động",
    icon: Sliders,
  },
  {
    step: 3,
    title: "Giá & thương mại",
    subtitle: "Hình thức giá, bảo hành, giao nhận",
    icon: DollarSign,
  },
  {
    step: 4,
    title: "Minh chứng & duyệt",
    subtitle: "TRL 1-9, SHTT, Media, Sở KH&CN",
    icon: ShieldCheck,
  },
];

export const FormStepper: React.FC<FormStepperProps> = ({
  currentStep,
  onStepSelect,
  completedSteps = [],
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="px-2 pb-2 text-caption font-extrabold uppercase tracking-widest text-slate-400">
        Tiến trình hồ sơ
      </p>

      <div className="space-y-1.5">
        {FORM_STEPS.map((s) => {
          const isActive = currentStep === s.step;
          const isDone = completedSteps.includes(s.step) && !isActive;
          const Icon = s.icon;

          return (
            <button
              key={s.step}
              type="button"
              onClick={() => onStepSelect && onStepSelect(s.step)}
              className={`group flex w-full items-start gap-3 rounded-xl border p-2.5 text-left transition-all ${
                isActive
                  ? "border-brand-200 bg-brand-50/80 text-brand-900 shadow-sm"
                  : isDone
                  ? "border-transparent bg-slate-50/60 text-slate-800 hover:border-slate-200 hover:bg-slate-100"
                  : "border-transparent text-slate-500 hover:bg-slate-50"
              }`}
            >
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "bg-brand-600 text-white shadow"
                    : isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : s.step}
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className={`text-xs font-bold ${
                    isActive ? "text-brand-900" : isDone ? "text-slate-800" : "text-slate-600"
                  }`}
                >
                  {s.title}
                </div>
                <div className="truncate text-caption text-slate-400">{s.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
