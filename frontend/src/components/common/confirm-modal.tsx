"use client";

import React from "react";
import { AppButton } from "@/components/ui/design-system";
import { Dialog } from "./dialog";
import { AlertTriangle, Info, CheckCircle2, AlertOctagon } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "warning",
  loading = false,
}: ConfirmModalProps) {
  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <AlertOctagon className="w-6 h-6 text-rose-600 dark:text-rose-400" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      case "success":
        return <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case "info":
      default:
        return <Info className="w-6 h-6 text-brand-700 dark:text-brand-200" />;
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 dark:text-white text-card-title">{title}</h4>
          <p className="text-body text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <AppButton variant="outline"
          type="button"
          disabled={loading}
          onClick={onClose}
        >
          {cancelText}
        </AppButton>

        <AppButton variant={variant === "danger" ? "danger" : "primary"}
          type="button"
          disabled={loading}
          onClick={onConfirm}
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          <span>{confirmText}</span>
        </AppButton>
      </div>
    </Dialog>
  );
}
