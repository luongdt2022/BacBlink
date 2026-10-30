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
      <div className="flex items-center justify-between px-2 pb-2">
        <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
          Tiến trình hồ sơ
        </p>
        {typeof filledStep1Count === "number" && currentStep === 1 && (
          <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
            {filledStep1Count} / 6
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {FORM_STEPS.map((s) => {
          const isActive = currentStep === s.step;
          const isDone = completedSteps.includes(s.step) && !isActive;

          return (
            <button
              key={s.step}
              type="button"
              onClick={() => onStepSelect && onStepSelect(s.step)}
              className={`group flex w-full items-start gap-3 rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                isActive
                  ? "border-brand-200 bg-brand-50/80 text-brand-900 shadow-sm"
                  : isDone
                  ? "border-transparent bg-slate-50/60 text-slate-800 hover:border-slate-200 hover:bg-slate-100"
                  : "border-transparent text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
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
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs font-bold ${
                      isActive ? "text-brand-900" : isDone ? "text-slate-800" : "text-slate-600"
                    }`}
                  >
                    {s.title}
                  </span>
                  <span
                    className={`text-xs font-extrabold px-1.5 py-0.2 rounded ${
                      s.step === 1
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {s.badge}
                  </span>
                </div>
                <div className="truncate text-xs text-slate-400 mt-0.5">{s.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
