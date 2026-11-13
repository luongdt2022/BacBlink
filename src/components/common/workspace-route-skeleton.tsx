import React from "react";
import { cn } from "@/lib/utils";

export interface WorkspaceRouteSkeletonProps {
  testId?: string;
  srText?: string;
  className?: string;
}

/** Shared shimmer skeleton for Admin, Portal, and Gov workspace route transitions. */
export function WorkspaceRouteSkeleton({
  testId = "workspace-route-skeleton",
  srText = "Đang tải nội dung...",
  className,
}: WorkspaceRouteSkeletonProps) {
  return (
    <div
      data-testid={testId}
      aria-busy="true"
      aria-live="polite"
      className={cn("w-full space-y-5", className)}
    >
      <span className="sr-only">{srText}</span>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-7 w-72 max-w-full rounded-lg animate-shimmer" />
          <div className="h-4 w-96 max-w-full rounded-md animate-shimmer" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-28 rounded-lg animate-shimmer" />
          <div className="h-9 w-36 rounded-lg animate-shimmer" />
        </div>
      </div>

      {/* 4 KPI Skeleton Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            aria-busy="true"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="h-3.5 w-28 rounded animate-shimmer" />
              <div className="h-8 w-8 rounded-lg animate-shimmer shrink-0" />
            </div>
            <div className="h-8 w-20 rounded-md animate-shimmer mt-2" />
            <div className="h-3.5 w-32 rounded animate-shimmer mt-1.5" />
          </div>
        ))}
      </div>

      {/* Filter Bar + Table Skeleton (5 rows) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="h-9 w-full md:w-80 rounded-lg animate-shimmer" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 rounded-lg animate-shimmer" />
            <div className="h-9 w-28 rounded-lg animate-shimmer" />
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {[0, 1, 2, 3, 4].map((row) => (
            <div
              key={row}
              className="grid grid-cols-12 items-center gap-3 py-2 border-b last:border-b-0 border-slate-100 dark:border-slate-800/70"
            >
              <div className="col-span-4 h-4 rounded animate-shimmer" />
              <div className="col-span-3 h-4 rounded animate-shimmer" />
              <div className="col-span-3 h-4 rounded animate-shimmer" />
              <div className="col-span-2 h-6 rounded-md animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
