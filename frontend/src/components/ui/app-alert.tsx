"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from "lucide-react";

export type AlertVariant = "info" | "success" | "warning" | "danger";

export interface AppAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  onClose?: () => void;
  icon?: React.ReactNode;
}

const alertVariants: Record<
  AlertVariant,
  {
    container: string;
    iconColor: string;
    titleColor: string;
    textColor: string;
    DefaultIcon: React.ElementType;
  }
> = {
  info: {
    container: "bg-blue-50 border-blue-200 dark:bg-blue-950/60 dark:border-blue-900",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-900 dark:text-blue-200",
    textColor: "text-blue-800 dark:text-blue-300",
    DefaultIcon: Info,
  },
  success: {
    container: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-900",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    titleColor: "text-emerald-900 dark:text-emerald-200",
    textColor: "text-emerald-800 dark:text-emerald-300",
    DefaultIcon: CheckCircle2,
  },
  warning: {
    container: "bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:border-amber-900",
    iconColor: "text-amber-600 dark:text-amber-400",
    titleColor: "text-amber-900 dark:text-amber-200",
    textColor: "text-amber-800 dark:text-amber-300",
    DefaultIcon: AlertTriangle,
  },
  danger: {
    container: "bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:border-rose-900",
    iconColor: "text-rose-600 dark:text-rose-400",
    titleColor: "text-rose-900 dark:text-rose-200",
    textColor: "text-rose-800 dark:text-rose-300",
    DefaultIcon: AlertCircle,
  },
};

export function AppAlert({
  className,
  variant = "info",
  title,
  onClose,
  icon,
  children,
  ...props
}: AppAlertProps) {
  const config = alertVariants[variant];
  const IconComponent = config.DefaultIcon;

  return (
    <div
      role="alert"
      className={cn(
        "relative flex w-full gap-3 rounded-2xl border p-4 shadow-sm transition-all font-sans",
        config.container,
        className
      )}
      {...props}
    >
      <div className={cn("shrink-0 pt-0.5", config.iconColor)}>
        {icon || <IconComponent className="h-5 w-5" aria-hidden="true" />}
      </div>

      <div className="flex-1 space-y-1">
        {title && (
          <h5 className={cn("text-label font-bold leading-tight", config.titleColor)}>
            {title}
          </h5>
        )}
        <div className={cn("text-sm leading-relaxed", config.textColor)}>
          {children}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thông báo"
          className={cn(
            "shrink-0 -mr-1 -mt-1 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/5 dark:hover:bg-white/10 focus-ring transition",
            config.iconColor
          )}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
