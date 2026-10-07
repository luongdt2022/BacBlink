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

        {/* Main Content Area */}
        <div className="page-container flex-1 py-5 sm:py-8">{children}</div>
      </div>
    </RoleGuard>
  );
}
