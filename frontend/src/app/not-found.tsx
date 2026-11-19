"use client";

import Link from "next/link";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-surface bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-bold text-slate-900 dark:text-white text-card-title">
          404 — Không tìm thấy trang
        </h2>
        <p className="text-body text-slate-600 dark:text-slate-400 leading-relaxed">
          Đường dẫn bạn yêu cầu không tồn tại hoặc đã được chuyển sang địa chỉ mới.
        </p>
        <div className="pt-2 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-control bg-brand-700 hover:bg-brand-800 text-white text-label font-bold transition focus-ring min-h-11 justify-center"
          >
            <Home className="w-4 h-4" />
            <span>Về Trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
