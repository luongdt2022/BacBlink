"use client";

import React from "react";
import { AppButton } from "@/components/ui/design-system";
import { AlertCircle, RefreshCw, Inbox, SearchX, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type AsyncState = "idle" | "loading" | "error" | "empty" | "success" | "partial";
export type UXState = AsyncState;

export interface AsyncProps {
  state: AsyncState;
  children: React.ReactNode;
  loadingSkeleton?: React.ReactNode;
  loadingText?: string;
  emptyContent?: React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: { label: string; onClick: () => void };
  emptyIcon?: "inbox" | "search";
  errorMessage?: string;
  errorContent?: React.ReactNode;
  successContent?: React.ReactNode;
  partialContent?: React.ReactNode;
  onRetry?: () => void;
  partialWarning?: string;
  className?: string;
}

export function Async({
  state,
  children,
  loadingSkeleton,
  loadingText,
  emptyContent,
  emptyTitle,
  emptyMessage,
  emptyAction,
  emptyIcon = "inbox",
  errorMessage,
  errorContent,
  successContent,
  partialContent,
  onRetry,
  partialWarning,
  className,
}: AsyncProps) {
  if (state === "loading") {
    if (loadingSkeleton) return <>{loadingSkeleton}</>;

    return (
      <div
        className={cn(
          "w-full rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800",
          className
        )}
        aria-busy="true"
        aria-live="polite"
      >
        {/* Shimmer Skeleton Cards with Zero Layout Shift (CLS = 0) */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full animate-shimmer shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-1/3 rounded-md animate-shimmer" />
              <div className="h-3 w-1/2 rounded-md animate-shimmer" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="h-28 rounded-xl animate-shimmer p-4 flex flex-col justify-between" />
            <div className="h-28 rounded-xl animate-shimmer p-4 flex flex-col justify-between" />
            <div className="h-28 rounded-xl animate-shimmer p-4 flex flex-col justify-between" />
          </div>
          <div className="space-y-3 pt-2">
            <div className="h-4 w-full rounded-md animate-shimmer" />
            <div className="h-4 w-5/6 rounded-md animate-shimmer" />
            <div className="h-4 w-2/3 rounded-md animate-shimmer" />
          </div>
          <div className="flex items-center justify-center pt-2 text-center">
            <p className="text-body text-slate-500 font-medium dark:text-slate-400">
              {loadingText || "Đang tải dữ liệu..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === "empty") {
    if (emptyContent) return <>{emptyContent}</>;

    const IconComponent = emptyIcon === "search" ? SearchX : Inbox;

    return (
      <div
        className={cn(
          "w-full p-8 md:p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-4 dark:bg-slate-900 dark:border-slate-700",
          className
        )}
      >
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
          <IconComponent className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h4 className="font-bold text-text-primary text-card-title dark:text-white">
            {emptyTitle || "Không có dữ liệu"}
          </h4>
          <p className="text-label text-text-secondary dark:text-slate-300">
            {emptyMessage || "Hiện tại chưa có bản ghi nào để hiển thị."}
          </p>
        </div>
        {emptyAction && (
          <div className="pt-2">
            <AppButton
              variant="cta"
              size="md"
              type="button"
              onClick={emptyAction.onClick}
              className="inline-flex items-center space-x-2"
            >
              <span>{emptyAction.label}</span>
            </AppButton>
          </div>
        )}
      </div>
    );
  }

  if (state === "error") {
    if (errorContent) return <>{errorContent}</>;

    return (
      <div
        className={cn(
          "p-6 md:p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4 dark:bg-rose-950/60 dark:border-rose-900",
          className
        )}
        role="alert"
      >
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" aria-hidden="true" />
        <div className="space-y-1">
          <h4 className="font-bold text-rose-900 text-card-title dark:text-rose-200">
            Đã xảy ra lỗi khi tải dữ liệu
          </h4>
          <p className="text-body text-rose-700 max-w-md mx-auto dark:text-rose-200">
            {errorMessage || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."}
          </p>
        </div>
        {onRetry && (
          <div className="pt-1">
            <AppButton
              variant="primary"
              size="md"
              type="button"
              onClick={onRetry}
              className="inline-flex items-center space-x-2 shadow"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Thử lại</span>
            </AppButton>
          </div>
        )}
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className={cn("animate-fade-in w-full", className)}>
        {successContent || children}
      </div>
    );
  }

  if (state === "partial") {
    return (
      <div className={cn("w-full space-y-4", className)}>
        {partialContent || (
          <div
            className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2.5 text-label text-amber-800 shadow-sm dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-900 animate-fade-in"
            role="status"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
            <span className="font-medium">
              {partialWarning || "Dữ liệu đang được đồng bộ ở chế độ nền. Một số thông tin chi tiết có thể đang được cập nhật."}
            </span>
          </div>
        )}
        <div className="opacity-70 pointer-events-none transition-opacity">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
