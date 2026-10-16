import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "cta" | "outline" | "ghost" | "danger";

const buttonClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-700 text-white shadow-sm hover:bg-brand-800",
  cta: "bg-nacen-green-500 text-white shadow-sm hover:bg-nacen-green-600",
  outline: "border border-slate-300 bg-white text-slate-700 hover:border-brand-500 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
  ghost: "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
  danger: "bg-status-danger text-white shadow-sm hover:bg-rose-700",
};

const buttonBase = "focus-ring inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-control px-4 py-2 text-label font-semibold font-sans transition disabled:pointer-events-none disabled:opacity-50";

export function AppLink({ className, variant = "primary", ...props }: React.ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={cn(buttonBase, buttonClasses[variant], className)} {...props} />;
}

export function AppButton({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        buttonBase,
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
