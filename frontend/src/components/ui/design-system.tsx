import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "cta" | "outline" | "ghost" | "danger" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

export const buttonClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-700 text-white shadow-sm hover:bg-brand-800",
  cta: "bg-nacen-green-500 text-white shadow-sm hover:bg-nacen-green-600",
  outline: "border border-slate-300 bg-white text-slate-700 hover:border-brand-500 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
  ghost: "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
  danger: "bg-status-danger text-white shadow-sm hover:bg-rose-700",
  secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
};

export const buttonSizes: Record<ButtonSize, string> = {
  sm: "min-h-9 min-w-9 h-9 px-3 py-1.5 text-xs",
  md: "min-h-11 min-w-11 px-4 py-2 text-label",
  lg: "min-h-12 min-w-12 px-6 py-3 text-body",
};

const buttonBase = "btn-press focus-ring inline-flex items-center justify-center gap-2 rounded-control font-semibold font-sans transition disabled:pointer-events-none disabled:opacity-50";

export interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export function AppButton({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  children,
  ...props
}: AppButtonProps) {
  return (
    <button
      className={cn(
        buttonBase,
        buttonSizes[size],
        buttonClasses[variant],
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? "true" : undefined}
      {...props}
    >
      {isLoading && (
        <svg
          className="h-4 w-4 animate-spin shrink-0 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          role="status"
          aria-label="Đang xử lý..."
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export interface AppLinkProps extends React.ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function AppLink({
  className,
  variant = "primary",
  size = "md",
  ...props
}: AppLinkProps) {
  return (
    <Link
      className={cn(
        buttonBase,
        buttonSizes[size],
        buttonClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  font = "heading",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  font?: "heading" | "sans";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.14em] text-innovation-600">{eyebrow}</p>}
      <h2 className={cn("mt-2 type-section-title font-heading font-bold text-text-primary dark:text-white", font === "sans" && "font-sans")}>
        {title}
      </h2>
      {description && <p className="mt-3 text-body text-text-secondary dark:text-slate-300">{description}</p>}
    </div>
  );
}
