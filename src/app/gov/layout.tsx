"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { authClient, UserContext } from "@/lib/auth-client";
import {
  ShieldCheck,
  FileCheck2,
  MapPin,
  Layers,
  BarChart3,
  Clock,
  AlertTriangle,
  Building,
  Users,
} from "lucide-react";

export default function GovLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserContext | null>(null);

  useEffect(() => {
    setUser(authClient.getUser());
  }, []);

  return (
    <RoleGuard
      allowedRoles={[
        "PROVINCIAL_ADMIN",
        "SECTOR_ADMIN",
        "CLUSTER_ADMIN",
        "PROVINCE_OFFICER",
        "PROVINCE_LEADER",
        "SUPER_ADMIN",
        "ADMIN",
      ]}
      portalName="Cổng Thẩm Định & Quản Trị Nhà Nước (Sở Tỉnh & Ban Ngành)"
    >
      <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-slate-950">
        {/* Gov Scope Header Bar */}
        <div className="border-b border-brand-100 bg-brand-50 px-4 py-4 dark:border-slate-800 dark:bg-brand-950 sm:px-8">
          <div className="page-container flex flex-col justify-between gap-3 px-0 text-label xl:flex-row xl:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-1 rounded-control bg-brand-700 text-white font-semibold text-label tracking-wide uppercase">
                Tầng 1: Quản Trị Nhà Nước
              </span>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                <MapPin className="w-4 h-4 shrink-0 text-brand-700 dark:text-brand-200" />
                <span>
                  Địa bàn thẩm quyền: <strong>{user?.scopeId || "TOÀN QUỐC (GLOBAL)"}</strong> (
                  {user?.scopeType || "PROVINCE"})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Quy chuẩn SLA duyệt: &le; 48 giờ</span>
              </div>
              <div className="flex items-center gap-1.5 text-brand-700 dark:text-brand-200 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Maker-Checker 2 cấp</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gov Sub-Navigation Bar */}
        <div className="border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-8">
          <div className="page-container flex items-center gap-2 px-0 py-2">
            <Link
              href="/gov"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/gov" || pathname === "/gov/approvals"
                  ? "bg-brand-50 text-brand-700 font-semibold dark:bg-brand-950/60 dark:text-brand-300"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Hàng đợi kiểm duyệt hồ sơ</span>
            </Link>

            <Link
              href="/gov/assessments/tt17"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/gov/assessments/tt17")
                  ? "bg-brand-50 text-brand-700 font-semibold dark:bg-brand-950/60 dark:text-brand-300"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Thẩm định công nghệ TT17</span>
            </Link>

            <Link
              href="/gov/opportunities"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/gov/opportunities")
                  ? "bg-brand-50 text-brand-700 font-semibold dark:bg-brand-950/60 dark:text-brand-300"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Giám sát Cung–Cầu & SLA</span>
            </Link>

            <Link
              href="/gov/settings/staff"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/gov/settings/staff")
                  ? "bg-brand-50 text-brand-700 font-semibold dark:bg-brand-950/60 dark:text-brand-300"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Cán bộ & Chuyên viên Sở</span>
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="page-container flex-1 py-5 sm:py-8">{children}</div>
      </div>
    </RoleGuard>
  );
}
