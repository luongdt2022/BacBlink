"use client";

import React from "react";
import { History, ShieldCheck } from "lucide-react";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";

export default function AdminAuditLogsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminBreadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Quản Trị Hệ Thống", href: "/admin" },
          { label: "Nhật Ký Kiểm Toán Cấp Độ 3" },
        ]}
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Giám sát & Vận hành</span>
          </div>
          <h1 className="font-bold text-slate-900 dark:text-white tracking-tight text-2xl">
            Nhật Ký Kiểm Toán Toàn Quốc (Audit Logs)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Lưu vết bất biến &ge; 365 ngày theo tiêu chuẩn An toàn thông tin Cấp 3 (Nghị định 85/2016).
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
        <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="font-bold text-slate-900 dark:text-white text-lg">
          Hệ Thống Ghi Nhận Kiểm Toán Tự Động Đang Hoạt Động
        </h3>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Mọi thao tác phê duyệt, từ chối, can thiệp vượt cấp từ 34 Sở KH&CN và Quản trị viên Trung ương đều được tự động lưu vết vào bảng <code>approval_audit_logs</code>.
        </p>
      </div>
    </div>
  );
}
