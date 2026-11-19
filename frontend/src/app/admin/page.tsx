"use client";

import React, { useEffect, useState } from "react";
import { authClient, UserContext } from "@/lib/auth-client";
import Link from "next/link";
import { getActiveSectors } from "@/lib/master-data-client";
import { portalClient, PortalOverviewStats } from "@/lib/portal-client";
import {
  ShieldAlert,
  Users,
  Network,
  Activity,
  Database,
  History,
  Server,
  ArrowUpRight,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboard() {
  const [user, setUser] = useState<UserContext | null>(null);
  const [sectorCount, setSectorCount] = useState<number | null>(null);
  const [stats, setStats] = useState<PortalOverviewStats | null>(null);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(authClient.getUser());
    let disposed = false;

    Promise.allSettled([
      getActiveSectors().then((rows) => { if (!disposed) setSectorCount(rows.length); }),
      portalClient.getStats().then((data) => { if (!disposed) setStats(data); }),
      (async () => {
        try {
          const token = authClient.getToken();
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (token) headers["Authorization"] = `Bearer ${token}`;
          const res = await fetch("/api/v1/governance/approvals?status=PENDING_APPROVAL", { headers });
          if (res.ok) {
            const json = await res.json();
            if (!disposed) setPendingApprovalsCount(json.total ?? json.data?.length ?? 0);
          }
        } catch {
          // Silent fallback to 0
        }
      })()
    ]).finally(() => {
      if (!disposed) setLoading(false);
    });

    return () => { disposed = true; };
  }, []);

  const totalUsersCount = stats ? (stats.totalEnterprises + stats.totalExperts) : 0;

  const systemMetrics = [
    {
      title: "Tổng Doanh Nghiệp & Cố Vấn",
      value: totalUsersCount > 0 ? totalUsersCount.toLocaleString("vi-VN") : "0",
      sub: totalUsersCount > 0 ? "Đã đăng ký tài khoản" : "Chưa có dữ liệu",
      icon: Users,
      color: "text-brand-700 dark:text-brand-200",
    },
    {
      title: "Địa Bàn KCN Bắc Ninh",
      value: "6 / 6 KCN",
      sub: "KCN Yên Phong, VSIP, Quế Võ, Tiên Sơn...",
      icon: Network,
      color: "text-emerald-700 dark:text-emerald-200",
    },
    {
      title: "Ngành Công Nghiệp BACLINK",
      value: String(sectorCount ?? 8),
      sub: sectorCount === 0 ? "Chưa có danh mục" : "Cơ khí, Bán dẫn, Tự động hóa...",
      icon: Database,
      color: "text-brand-700 dark:text-brand-200",
    },
    {
      title: "Hàng Đợi Thẩm Định",
      value: String(pendingApprovalsCount),
      sub: pendingApprovalsCount > 0 ? "Hồ sơ cần xử lý" : "Không có hồ sơ chờ",
      icon: History,
      color: "text-brand-700 dark:text-brand-200",
    },
  ];

  return (
    <div className="w-full space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-slate-900 dark:text-white tracking-tight type-page-title">
            Trung Tâm Điều Hành & Giám Sát Cấp Cao (Cổng Admin)
          </h1>
          <p className="text-body text-slate-500 dark:text-slate-400 mt-1">
            Quyền hạn tối cao: Quản trị hệ thống BACLINK Bắc Ninh (3 cấp vai trò ADMIN, ENTERPRISE, PUBLIC_USER), quản lý hội viên và nhật ký kiểm toán.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-control bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-label font-bold border border-emerald-300 dark:border-emerald-900">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Hệ thống: Trạng thái Ổn định</span>
        </div>
      </div>

      {/* Approval Queue Quick Action Card */}
      <div
        className="p-5 rounded-surface bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        aria-busy={loading ? "true" : undefined}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-control bg-brand-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ClipboardCheck className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-card-title">
                Hàng Đợi Phê Duyệt & Thẩm Định Hồ Sơ
              </h3>
              {loading ? (
                <span
                  data-testid="admin-queue-badge-skeleton"
                  aria-busy="true"
                  className="inline-block h-5 w-36 rounded-full animate-shimmer"
                />
              ) : (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  pendingApprovalsCount > 0
                    ? "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}>
                  {pendingApprovalsCount > 0 ? `${pendingApprovalsCount} hồ sơ chờ xét duyệt` : "Không có hồ sơ chờ"}
                </span>
              )}
            </div>
            {loading ? (
              <div
                data-testid="admin-queue-desc-skeleton"
                aria-busy="true"
                className="h-4 w-72 max-w-full rounded animate-shimmer mt-1.5"
              />
            ) : (
              <p className="text-body text-slate-600 dark:text-slate-300 mt-0.5">
                {pendingApprovalsCount > 0
                  ? "Bao gồm các hồ sơ đăng ký Doanh nghiệp Hội viên, Cố vấn kỹ thuật và Sản phẩm công nghiệp mới gửi cần xét duyệt."
                  : "Tất cả hồ sơ đăng ký và chào bán công nghệ đã được xử lý xong."}
              </p>
            )}
          </div>
        </div>

        <Link
          href="/admin/approvals"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-control shadow-sm transition shrink-0"
        >
          <span>Vào Hàng Đợi Thẩm Định</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        data-testid={loading ? "admin-kpi-skeleton" : "admin-kpi-grid"}
        aria-busy={loading ? "true" : undefined}
      >
        {systemMetrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={i}
              aria-busy={loading ? "true" : undefined}
              className="p-5 rounded-surface bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-300">
                <span className="text-label font-bold">{metric.title}</span>
                <Icon className={`w-4 h-4 ${metric.color}`} />
              </div>
              {loading ? (
                <>
                  <div className="h-8 w-24 rounded-md animate-shimmer" />
                  <div className="h-4 w-36 rounded animate-shimmer" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {metric.value}
                  </div>
                  <div className="text-caption text-slate-400 dark:text-slate-300">{metric.sub}</div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* 3 Cấp Vai Trò & Scoped RBAC BACLINK */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center justify-between text-card-title">
          <span>Cấu Trúc Phân Tầng Vai Trò & Scoped RBAC (Hệ Thống Rút Gọn BACLINK Bắc Ninh)</span>
          <Link
            href="/admin/roles"
            className="text-label text-brand-700 hover:text-brand-900 font-semibold flex items-center gap-1 dark:text-brand-200 hover:underline transition"
          >
            <span>Chi tiết chính sách</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-label">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-700 text-caption font-semibold dark:bg-brand-950 dark:text-brand-200">CẤP 1 (QUẢN TRỊ TẬP TRUNG)</span>
            <p className="font-bold text-slate-900 dark:text-white">Ban Quản Trị Hiệp Hội BACLINK</p>
            <p className="font-mono text-xs text-brand-700 dark:text-brand-300 font-bold">ADMIN</p>
            <p className="text-slate-500 text-caption dark:text-slate-400">
              Phê duyệt 1 cấp tập trung cho Doanh nghiệp Hội viên, thẩm định hồ sơ năng lực và quản trị hệ thống.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-700 text-caption font-bold dark:bg-brand-950 dark:text-brand-200">CẤP 2 (HỘI VIÊN GIAO THƯƠNG)</span>
            <p className="font-bold text-slate-900 dark:text-white">Doanh Nghiệp Hội Viên (Dual-Mode)</p>
            <p className="font-mono text-xs text-brand-700 dark:text-brand-300 font-bold">ENTERPRISE (Dual-Mode: Bên Mua &amp; Bên Bán)</p>
            <p className="text-slate-500 text-caption dark:text-slate-400">
              Sở hữu đồng thời năng lực Bên Mua &amp; Bên Bán, đăng nhu cầu tìm nhà cung ứng và niêm yết năng lực sản xuất.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-caption font-semibold dark:bg-slate-800 dark:text-slate-100">CẤP 3 (ĐẠI CHÚNG)</span>
            <p className="font-bold text-slate-900 dark:text-white">Thành Viên Công Chúng &amp; Khách</p>
            <p className="font-mono text-xs text-slate-700 dark:text-slate-300 font-bold">PUBLIC_USER</p>
            <p className="text-slate-500 text-caption dark:text-slate-400">
              Cá nhân, tổ chức tra cứu danh bạ công khai, học liệu số và gửi hồ sơ đăng ký tham gia Hiệp hội BACLINK.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
