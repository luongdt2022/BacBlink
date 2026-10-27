"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Clock, FileCheck2, MapPin } from "lucide-react";
import { resolveProvinceName } from "@/lib/gov-label-resolver";

export interface GovBreadcrumbItem {
  label: string;
  href?: string;
}

export interface GovPageHeaderProps {
  breadcrumbs: GovBreadcrumbItem[];
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  scopeCode?: string;
  slaText?: string; // Mặc định: "SLA ≤ 48h"
  makerCheckerText?: string; // Mặc định: "Maker-Checker 2 Cấp"
  actions?: React.ReactNode;
  className?: string;
}

export function GovPageHeader({
  breadcrumbs,
  title,
  subtitle,
  icon: Icon,
  scopeCode,
  slaText = "SLA ≤ 48h",
  makerCheckerText = "Maker-Checker 2 Cấp",
  actions,
  className = "",
}: GovPageHeaderProps) {
  const cleanScope = scopeCode?.trim();
  const provinceLabel = cleanScope ? resolveProvinceName(cleanScope) : "";

  return (
    <header className={`space-y-3.5 pb-5 border-b border-slate-200 dark:border-slate-800 ${className}`}>
      {/* 1. Breadcrumbs 3 Cấp chuẩn WAI-ARIA */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={`${item.label}-${index}`}>
                  {index > 0 && (
                    <li aria-hidden="true" className="flex items-center text-slate-300 dark:text-slate-600 select-none">
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    </li>
                  )}
                  <li className="inline-flex items-center">
                    {isLast ? (
                      <span
                        aria-current="page"
                        className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[240px] sm:max-w-md"
                      >
                        {item.label}
                      </span>
                    ) : item.href ? (
                      <Link
                        href={item.href}
                        className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium truncate max-w-[200px]"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                    )}
                  </li>
                </React.Fragment>
              );
            })}
          </ol>
        </nav>
      )}

      {/* 2. Status Chips Row */}
      {(slaText || makerCheckerText) && (
        <div className="flex flex-wrap items-center gap-2">
          {slaText && (
            <span
              data-testid="gov-sla-chip"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
            >
              <Clock className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{slaText}</span>
            </span>
          )}
          {makerCheckerText && (
            <span
              data-testid="gov-maker-checker-chip"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
            >
              <FileCheck2 className="w-3.5 h-3.5 shrink-0 text-brand-600 dark:text-brand-400" />
              <span>{makerCheckerText}</span>
            </span>
          )}
        </div>
      )}

      {/* 3. Main Header Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/80 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="min-w-0 space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center gap-2 sm:gap-2.5">
              <span>{title}</span>
              {cleanScope && (
                <span
                  data-testid="gov-scope-badge"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-700 text-white text-xs font-bold shadow-xs shrink-0"
                >
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>
                    {provinceLabel} ({cleanScope.toUpperCase()})
                  </span>
                </span>
              )}
            </h1>

            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* 4. Slot Actions */}
        {actions && (
          <div data-testid="gov-header-actions" className="flex items-center gap-2 sm:gap-3 shrink-0 self-start md:self-center mt-2 md:mt-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
