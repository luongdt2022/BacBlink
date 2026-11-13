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
    <header className={`space-y-2 pb-3 border-b border-slate-200 dark:border-slate-800 ${className}`}>
      {/* 1. Breadcrumbs & Status Chips trên cùng 1 hàng */}
      {((breadcrumbs && breadcrumbs.length > 0) || slaText || makerCheckerText) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 dark:text-slate-400">
              <ol className="flex items-center flex-wrap gap-1.5">
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
          ) : (
            <div />
          )}

          {(slaText || makerCheckerText) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {slaText && (
                <span
                  data-testid="gov-sla-chip"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                >
                  <Clock className="w-3 h-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{slaText}</span>
                </span>
              )}
              {makerCheckerText && (
                <span
                  data-testid="gov-maker-checker-chip"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                >
                  <FileCheck2 className="w-3 h-3 shrink-0 text-brand-600 dark:text-brand-400" />
                  <span>{makerCheckerText}</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. Main Header Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/80 flex items-center justify-center shrink-0 shadow-xs">
            <Icon className="w-5 h-5" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center gap-2">
              <span>{title}</span>
              {cleanScope && (
                <span
                  data-testid="gov-scope-badge"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-700 text-white text-[11px] font-bold shadow-xs shrink-0"
                >
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>
                    {provinceLabel} ({cleanScope.toUpperCase()})
                  </span>
                </span>
              )}
            </h1>

            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* 3. Slot Actions */}
        {actions && (
          <div data-testid="gov-header-actions" className="flex items-center gap-2 shrink-0 self-start md:self-center">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
