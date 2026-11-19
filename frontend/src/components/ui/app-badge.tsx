import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";
export type BadgeSize = "sm" | "md" | "lg";

export interface AppBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  trl?: number;
  dot?: boolean;
  icon?: React.ReactNode;
}

const badgeVariants: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  warning: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  danger: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
  info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
  neutral: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  brand: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800",
};

const badgeDots: Record<BadgeVariant, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-blue-500",
  neutral: "bg-slate-400",
  brand: "bg-brand-600",
};

const badgeSizes: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px] font-semibold gap-1",
  md: "px-2.5 py-1 text-xs font-semibold gap-1.5",
  lg: "px-3 py-1.5 text-sm font-semibold gap-2",
};

export function AppBadge({
  className,
  variant = "neutral",
  size = "md",
  trl,
  dot = false,
  icon,
  children,
  ...props
}: AppBadgeProps) {
  // If TRL is provided, automatically determine variant
  let effectiveVariant = variant;
  if (trl !== undefined) {
    if (trl <= 3) effectiveVariant = "info"; // Xanh dương (Nghiên cứu nguyên lý & Lab) theo BD-04
    else if (trl <= 6) effectiveVariant = "warning"; // Hổ phách (Thử nghiệm Pilot) theo BD-04
    else effectiveVariant = "success"; // Xanh ngọc Emerald (Sẵn sàng thương mại hóa) theo BD-04
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border transition-colors font-sans select-none",
        badgeVariants[effectiveVariant],
        badgeSizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", badgeDots[effectiveVariant])}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {trl !== undefined ? `TRL ${trl}` : children}
    </span>
  );
}
