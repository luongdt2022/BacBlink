"use client";

import React, { useEffect } from "react";
import { AppButton } from "@/components/ui/design-system";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime Exception:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-surface bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-bold text-slate-900 dark:text-white text-card-title">
          Đã xảy ra sự cố không mong muốn
        </h2>
        <p className="text-body text-slate-600 dark:text-slate-400 leading-relaxed">
          Hệ thống gặp lỗi trong quá trình xử lý yêu cầu. Vui lòng bấm thử lại hoặc quay về Trang chủ.
        </p>
        {error?.digest && (
          <div className="text-caption font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 py-1 px-2 rounded dark:text-slate-300">
            Error Digest: {error.digest}
          </div>
        )}
        <div className="pt-2 flex justify-center gap-3">
          <AppButton variant="primary"
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-control text-label font-semibold shadow transition focus-ring"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </AppButton>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-control border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-label font-medium transition focus-ring min-h-11 inline-flex items-center justify-center dark:bg-slate-800"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
