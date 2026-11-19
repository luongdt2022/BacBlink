"use client";

import React from "react";
import { Check, FileText, Sliders, DollarSign, ShieldCheck } from "lucide-react";

export interface FormStepperProps {
  currentStep: number;
  onStepSelect?: (step: number) => void;
  completedSteps?: number[];
  filledStep1Count?: number;
}

export const FORM_STEPS = [
  {
    step: 1,
    title: "Thông tin bắt buộc",
    badge: "Bắt buộc",
    subtitle: "6 trường lõi + Cụm giá + TRL",
    icon: FileText,
  },
  {
    step: 2,
    title: "Thông số kỹ thuật",
    badge: "Tùy chọn",
    subtitle: "Lớp 2 (Chung) & Lớp 3 (10 Lĩnh Vực)",
    icon: Sliders,
  },
  {
    step: 3,
    title: "Giá & thương mại",
    badge: "Tùy chọn",
    subtitle: "Lớp 4 điều kiện thương mại chi tiết",
    icon: DollarSign,
  },
  {
    step: 4,
    title: "Pháp lý & DataRoom",
    badge: "Tùy chọn",
    subtitle: "Văn bằng SHTT & Minh chứng 3 cấp",
    icon: ShieldCheck,
  },
];

export const FormStepper: React.FC<FormStepperProps> = ({
  currentStep,
  onStepSelect,
  completedSteps = [],
  filledStep1Count,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between px-1.5 pb-2.5 mb-2 border-b border-slate-100">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
          Tiến trình hồ sơ
        </p>
        {typeof filledStep1Count === "number" && currentStep === 1 && (
          <span className="shrink-0 whitespace-nowrap text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
            {filledStep1Count} / 6
          </span>
        )}
      </div>

      <div className="space-y-1">
        {FORM_STEPS.map((s) => {
          const isActive = currentStep === s.step;
          const isDone = completedSteps.includes(s.step) && !isActive;

          return (
            <button
              key={s.step}
              type="button"
              onClick={() => onStepSelect && onStepSelect(s.step)}
              className={`group flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                isActive
                  ? "border-brand-200 bg-brand-50/80 text-brand-900 shadow-sm"
                  : isDone
                  ? "border-transparent bg-slate-50/60 text-slate-800 hover:border-slate-200 hover:bg-slate-100"
                  : "border-transparent text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                  isActive
                    ? "bg-brand-600 text-white shadow-sm"
                    : isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : s.step}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`truncate text-[13px] font-bold leading-snug ${
                      isActive ? "text-brand-900" : isDone ? "text-slate-800" : "text-slate-700"
                    }`}
                  >
                    {s.title}
                  </span>
                  <span
                    className={`shrink-0 whitespace-nowrap text-[10px] font-bold leading-none px-1.5 py-1 rounded-md ${
                      s.step === 1
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {s.badge}
                  </span>
                </div>
                <div className="truncate text-[11px] text-slate-500 mt-0.5">{s.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
