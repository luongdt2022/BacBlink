"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Ban } from "lucide-react";

export default function OrgTreeRetiredPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div
      data-testid="deprecated-route-410"
      className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950"
    >
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
          <Ban className="w-6 h-6" />
        </div>
        <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold">
          410 Gone
        </div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          Tính năng không thuộc Bản rút gọn BACLINK Bắc Ninh
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Hệ thống Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK) vận hành tập trung theo mô hình 3 cấp vai trò (ADMIN, ENTERPRISE, PUBLIC_USER). Đang chuyển hướng về Trung tâm Quản trị...
        </p>
        <div className="pt-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition shadow-xs"
          >
            <span>Về Trung tâm Quản trị (/admin)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
