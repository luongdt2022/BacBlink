"use client";

import React from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AdminBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function AdminBreadcrumbs({ items, className = "" }: AdminBreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`mb-6 flex items-center text-sm text-slate-500 dark:text-slate-400 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

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
                    className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[280px] sm:max-w-md"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className="inline-flex items-center gap-1.5 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium"
                  >
                    {isFirst && <Home className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />}
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
