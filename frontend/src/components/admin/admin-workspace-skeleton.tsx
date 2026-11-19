import React from "react";
import { cn } from "@/lib/utils";
import { WorkspaceRouteSkeleton } from "@/components/common/workspace-route-skeleton";

export interface AdminKpiCardSkeletonProps {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  valueClassName?: string;
  subClassName?: string;
  testId?: string;
}

export function AdminKpiCardSkeleton({
  title,
  icon,
  className,
  valueClassName,
  subClassName,
  testId,
}: AdminKpiCardSkeletonProps) {
  return (
    <div
      data-testid={testId}
      aria-busy="true"
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        {title ? (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </span>
        ) : (
          <div className="h-3.5 w-28 rounded animate-shimmer" />
        )}
        {icon ? (
          icon
        ) : (
          <div className="h-8 w-8 rounded-lg animate-shimmer shrink-0" />
        )}
      </div>
      <div className={cn("h-8 w-20 rounded-md animate-shimmer mt-2", valueClassName)} />
      <div className={cn("h-3.5 w-32 rounded animate-shimmer mt-1.5", subClassName)} />
    </div>
  );
}

export function AdminWorkspaceSkeleton({ className }: { className?: string }) {
  return (
    <WorkspaceRouteSkeleton
      testId="admin-route-skeleton"
      srText="Đang tải không gian quản trị..."
      className={className}
    />
  );
}
