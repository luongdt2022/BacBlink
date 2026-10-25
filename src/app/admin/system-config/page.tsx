"use client";

import React from "react";
import { Sliders, Clock, ShieldCheck } from "lucide-react";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";

export default function AdminSystemConfigPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminBreadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Quản Trị Hệ Thống", href: "/admin" },
          { label: "Cấu Hình Hệ Thống & Tham Số SLA" },
        ]}
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 text-xs font-bold mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Cấu hình Tham số</span>
          </div>
          <h1 className="font-bold text-slate-900 dark:text-white tracking-tight text-2xl">
            Cấu Hình Tham Số & SLA Hệ Thống
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Thiết lập ngưỡng SLA 72h làm việc, giờ hành chính và quy chuẩn thông báo cảnh báo trễ hạn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <Clock className="w-5 h-5 text-rose-500" />
            <span>Tham Số SLA Thẩm Định Cấp Sở</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Thời hạn SLA cơ sở:</span>
              <span className="font-bold text-slate-900 dark:text-white">72 giờ làm việc (3 ngày)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Giờ hành chính:</span>
              <span className="font-bold text-slate-900 dark:text-white">08:00 - 17:00 (Thứ 2 - Thứ 6)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Chu kỳ quét SLA Monitor:</span>
              <span className="font-bold text-slate-900 dark:text-white">15 phút / lần</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Chính Sách Admin Override</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Thẩm quyền thực thi:</span>
              <span className="font-bold text-rose-600">SUPER_ADMIN, OPERATOR_ADMIN</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Độ dài lý do giải trình:</span>
              <span className="font-bold text-slate-900 dark:text-white">&ge; 20 ký tự (Bắt buộc)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Khóa lạc quan (Concurrency):</span>
              <span className="font-bold text-emerald-600">Bật (Optimistic Concurrency 409)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
