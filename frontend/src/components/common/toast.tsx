"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AppButton } from "@/components/ui/design-system";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toasts: ToastItem[];
  show: (type: ToastType, message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type: ToastType, message: string, title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, type, message, title };

      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 3.8s
      setTimeout(() => {
        dismiss(id);
      }, 3800);
    },
    [dismiss]
  );

  const success = useCallback((msg: string, title?: string) => show("success", msg, title), [show]);
  const error = useCallback((msg: string, title?: string) => show("error", msg, title), [show]);
  const warning = useCallback((msg: string, title?: string) => show("warning", msg, title), [show]);
  const info = useCallback((msg: string, title?: string) => show("info", msg, title), [show]);

  return (
    <ToastContext.Provider value={{ toasts, show, success, error, warning, info, dismiss }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-4 left-4 z-50 flex flex-col gap-2.5 sm:left-auto sm:w-96 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all transform animate-in slide-in-from-bottom-3 duration-200",
              toast.type === "success" && "bg-white/95 dark:bg-slate-900/95 border-emerald-300 dark:border-emerald-700/60 text-slate-900 dark:text-white shadow-emerald-500/10",
              toast.type === "error" && "bg-white/95 dark:bg-slate-900/95 border-rose-300 dark:border-rose-700/60 text-slate-900 dark:text-white shadow-rose-500/10",
              toast.type === "warning" && "bg-white/95 dark:bg-slate-900/95 border-amber-300 dark:border-amber-700/60 text-slate-900 dark:text-white shadow-amber-500/10",
              toast.type === "info" && "bg-white/95 dark:bg-slate-900/95 border-brand-200 dark:border-brand-700/60 text-slate-900 dark:text-white shadow-brand-700/10"
            )}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
              {toast.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              {toast.type === "info" && <Info className="w-5 h-5 text-brand-700 dark:text-brand-200" />}
            </div>

            <div className="flex-1 min-w-0">
              {toast.title && <h5 className="text-label font-bold leading-tight mb-0.5">{toast.title}</h5>}
              <p className="text-body text-slate-600 dark:text-slate-300 leading-relaxed break-words">{toast.message}</p>
            </div>

            <AppButton variant="ghost"
              onClick={() => dismiss(toast.id)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition shrink-0 focus-ring dark:text-slate-300"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </AppButton>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toasts: [],
      show: () => {},
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
      dismiss: () => {},
    };
  }
  return context;
}
