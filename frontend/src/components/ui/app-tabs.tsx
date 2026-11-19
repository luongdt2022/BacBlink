"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface AppTabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  variant?: "line" | "pill";
  className?: string;
}

export function AppTabs({
  items,
  activeKey,
  onChange,
  variant = "line",
  className,
}: AppTabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center overflow-x-auto scrollbar-none font-sans",
        variant === "line" && "border-b border-slate-200 dark:border-slate-800 gap-6",
        variant === "pill" && "p-1 bg-slate-100 rounded-xl dark:bg-slate-800 gap-1",
        className
      )}
    >
      {items.map((tab) => {
        const isActive = tab.key === activeKey;

        if (variant === "pill") {
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              id={`tab-${tab.key}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.key}`}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.key)}
              className={cn(
                "btn-press inline-flex items-center justify-center gap-2 px-4 py-2 text-label font-medium rounded-lg transition-all whitespace-nowrap focus-ring",
                isActive
                  ? "bg-white text-brand-700 shadow-sm font-semibold dark:bg-slate-900 dark:text-brand-300"
                  : "text-text-secondary hover:text-text-primary dark:text-slate-400 dark:hover:text-white",
                tab.disabled && "opacity-40 cursor-not-allowed pointer-events-none"
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full",
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  )}
                >
                  {tab.count}
                </span>
              )}
              {tab.badge}
            </button>
          );
        }

        // Line variant (default)
        return (
          <button
            key={tab.key}
            role="tab"
            type="button"
            id={`tab-${tab.key}`}
            aria-selected={isActive}
            aria-controls={`panel-${tab.key}`}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.key)}
            className={cn(
              "group relative inline-flex items-center gap-2 py-3 text-label font-medium transition-colors whitespace-nowrap focus-ring rounded-t",
              isActive
                ? "text-brand-700 font-bold dark:text-brand-400"
                : "text-text-secondary hover:text-text-primary dark:text-slate-400 dark:hover:text-white",
              tab.disabled && "opacity-40 cursor-not-allowed pointer-events-none"
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                )}
              >
                {tab.count}
              </span>
            )}
            {tab.badge}

            {/* Active underline indicator */}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-700 rounded-full dark:bg-brand-400"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
