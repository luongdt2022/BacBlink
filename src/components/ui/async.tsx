"use client";

import React from "react";
import { AppButton } from "@/components/ui/design-system";
import { AlertCircle, RefreshCw, Inbox, AlertTriangle } from "lucide-react";

export type AsyncState = "idle" | "loading" | "error" | "empty" | "success" | "partial";
export type UXState = AsyncState;

interface AsyncProps {
  state: AsyncState;
  children: React.ReactNode;
  loadingSkeleton?: React.ReactNode;
  loadingText?: string;
  emptyContent?: React.ReactNode;
  errorMessage?: string;
  errorContent?: React.ReactNode;
  successContent?: React.ReactNode;
  partialContent?: React.ReactNode;
  onRetry?: () => void;
  partialWarning?: string;
}

export function Async({
  state,
  children,
  loadingSkeleton,
  loadingText,
  emptyContent,
  errorMessage,
  errorContent,
  successContent,
  partialContent,
  onRetry,
  partialWarning,
}: AsyncProps) {
  if (state === "loading") {
    return (
      loadingSkeleton || (
        <div className="w-full space-y-4 p-8 bg-white rounded-surface border border-slate-200 animate-pulse text-center dark:bg-slate-900 dark:border-slate-700">
          <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-body text-slate-500 font-medium dark:text-slate-300">{loadingText || "Đang tải dữ liệu..."}</p>
        </div>
      )
    );
  }

  if (state === "success" && successContent) {
    return <>{successContent}</>;
  }

  if (state === "empty" && emptyContent) {
    return <>{emptyContent}</>;
  }

  if (state === "error") {
    if (errorContent) return <>{errorContent}</>;
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-surface text-center space-y-3 dark:bg-rose-950/60 dark:border-rose-900">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h4 className="font-bold text-rose-900 text-card-title dark:text-rose-200">Đã xảy ra lỗi khi tải dữ liệu</h4>
        <p className="text-body text-rose-700 max-w-md mx-auto dark:text-rose-200">{errorMessage || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."}</p>
        {onRetry && (
          <AppButton variant="primary"
            type="button"
            onClick={onRetry}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-label font-bold rounded-control shadow transition focus-ring"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </AppButton>
        )}
      </div>
    );
  }

  return (
    <>
      {state === "partial" && (
        partialContent || (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-label text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{partialWarning || "Một số dữ liệu chi tiết chưa tải xong hoặc đang được xử lý ở chế độ nền."}</span>
          </div>
        )
      )}
      {children}
    </>
  );
}
