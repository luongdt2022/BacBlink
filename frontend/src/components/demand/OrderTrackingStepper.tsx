'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  FileText,
  Handshake,
  CheckCheck,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export type OrderStepStatus =
  | 'SUBMITTED'
  | 'PROCESSING'
  | 'NEGOTIATING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'PENDING'
  | 'VERIFIED'
  | 'CLOSED'
  | string;

export interface OrderTrackingStep {
  key: string;
  stepNumber: number;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ORDER_STEPS: OrderTrackingStep[] = [
  {
    key: 'SUBMITTED',
    stepNumber: 1,
    label: 'Tiếp nhận đơn',
    description: 'Đã gửi yêu cầu / Chờ tiếp nhận',
    icon: Clock,
  },
  {
    key: 'PROCESSING',
    stepNumber: 2,
    label: 'Xử lý & Báo giá',
    description: 'Bên bán đã tiếp nhận & đang kiểm tra năng lực / lập báo giá',
    icon: FileText,
  },
  {
    key: 'NEGOTIATING',
    stepNumber: 3,
    label: 'Thỏa thuận giao dịch',
    description: 'Thương thảo hợp đồng & điều khoản',
    icon: Handshake,
  },
  {
    key: 'COMPLETED',
    stepNumber: 4,
    label: 'Hoàn tất',
    description: 'Ký kết & Nghiệm thu giao dịch',
    icon: CheckCheck,
  },
];

export function mapStatusToStepIndex(status?: string): {
  stepIndex: number;
  isCancelled: boolean;
  isRejected: boolean;
  statusLabel: string;
} {
  const s = (status || 'SUBMITTED').toUpperCase();

  if (s === 'CANCELLED' || s === 'CLOSED') {
    return { stepIndex: -1, isCancelled: true, isRejected: false, statusLabel: 'Đã hủy đơn' };
  }
  if (s === 'REJECTED') {
    return { stepIndex: -1, isCancelled: false, isRejected: true, statusLabel: 'Đã từ chối' };
  }
  if (s === 'COMPLETED') {
    return { stepIndex: 3, isCancelled: false, isRejected: false, statusLabel: 'Hoàn tất' };
  }
  if (s === 'NEGOTIATING') {
    return { stepIndex: 2, isCancelled: false, isRejected: false, statusLabel: 'Đang thỏa thuận' };
  }
  if (s === 'PROCESSING' || s === 'VERIFIED' || s === 'IN_REVIEW') {
    return { stepIndex: 1, isCancelled: false, isRejected: false, statusLabel: 'Đang xử lý & Báo giá' };
  }

  // Mặc định SUBMITTED hoặc PENDING
  return { stepIndex: 0, isCancelled: false, isRejected: false, statusLabel: 'Chờ tiếp nhận' };
}

interface OrderTrackingStepperProps {
  status: OrderStepStatus;
  compact?: boolean;
  cancelReason?: string;
  className?: string;
}

export default function OrderTrackingStepper({
  status,
  compact = false,
  cancelReason,
  className = '',
}: OrderTrackingStepperProps) {
  const { stepIndex, isCancelled, isRejected, statusLabel } = mapStatusToStepIndex(status);

  // Hiển thị dạng Compact (Dành cho bảng)
  if (compact) {
    if (isCancelled || isRejected) {
      return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
          isCancelled
            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900'
            : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
        } ${className}`}>
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{statusLabel}</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-1.5 text-xs ${className}`}>
        <div className="flex items-center gap-1">
          {ORDER_STEPS.map((step, idx) => {
            const isCompleted = idx < stepIndex;
            const isCurrent = idx === stepIndex;

            return (
              <React.Fragment key={step.key}>
                <div
                  title={`${step.stepNumber}. ${step.label}`}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-brand-600 text-white ring-2 ring-brand-300 dark:ring-brand-700'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.stepNumber}
                </div>
                {idx < ORDER_STEPS.length - 1 && (
                  <div
                    className={`w-3 h-0.5 ${
                      idx < stepIndex
                        ? 'bg-emerald-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <span className="font-semibold text-text-primary dark:text-slate-200 ml-1 text-xs">
          {ORDER_STEPS[stepIndex]?.label || statusLabel}
        </span>
      </div>
    );
  }

  // Hiển thị dạng Chi tiết (Dành cho Card / Modal)
  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Cảnh báo trạng thái ngoại lệ */}
      {(isCancelled || isRejected) && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            isCancelled
              ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300'
              : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300'
          }`}
        >
          {isCancelled ? (
            <XCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          )}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider">
              {isCancelled ? 'Đơn hàng đã được hủy' : 'Đơn hàng bị từ chối'}
            </h4>
            <p className="text-xs mt-0.5">
              {cancelReason ||
                (isCancelled
                  ? 'Đơn đặt mua này đã được hủy theo yêu cầu của bên mua hoặc hệ thống quản lý.'
                  : 'Đơn hàng chưa đáp ứng điều kiện tiếp nhận của bên cung cấp hoặc hết hàng.')}
            </p>
          </div>
        </div>
      )}

      {/* Stepper 4 bước tuyến tính */}
      <div className="relative">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 relative z-10">
          {ORDER_STEPS.map((step, idx) => {
            const isCompleted = !isCancelled && !isRejected && idx < stepIndex;
            const isCurrent = !isCancelled && !isRejected && idx === stepIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className="flex flex-col items-center text-center space-y-2 group"
              >
                {/* Vòng tròn biểu tượng */}
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-900/60 shadow-brand-600/30 animate-pulse'
                      : isCancelled || isRejected
                      ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 opacity-60'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </div>

                {/* Nhãn bước */}
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <span
                      className={`text-xs font-extrabold ${
                        isCompleted
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : isCurrent
                          ? 'text-brand-700 dark:text-cyan-400'
                          : 'text-text-secondary dark:text-slate-400'
                      }`}
                    >
                      {step.stepNumber}. {step.label}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary dark:text-slate-400 hidden sm:block mt-0.5 line-clamp-2">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Thanh đường nối giữa các bước */}
        <div
          className="absolute top-5 sm:top-6 left-[12.5%] right-[12.5%] h-0.5 -z-0 bg-slate-200 dark:bg-slate-800"
          aria-hidden="true"
        >
          <div
            className={`h-full transition-all duration-500 ${
              isCancelled || isRejected
                ? 'bg-slate-300 dark:bg-slate-700'
                : 'bg-emerald-500'
            }`}
            style={{
              width:
                isCancelled || isRejected
                  ? '0%'
                  : `${Math.min(100, Math.max(0, (stepIndex / (ORDER_STEPS.length - 1)) * 100))}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
