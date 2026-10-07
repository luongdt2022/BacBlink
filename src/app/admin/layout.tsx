"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  ShieldAlert,
  Users,
  Network,
  Activity,
  Database,
  Lock,
  History,
  Settings,
  ChevronRight,
  ClipboardCheck,
} from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Tổng quan Quản trị", icon: Activity },
  { href: "/admin/approvals", label: "Hàng đợi Phê duyệt (TASK-07)", icon: ClipboardCheck },
  { href: "/admin/roles", label: "Quản lý 10 Vai trò (RBAC)", icon: Users },
  { href: "/admin/org-tree", label: "Cây Thư mục 34 Tỉnh", icon: Network },
  { href: "/admin/sectors", label: "Danh mục Lĩnh Vực TT17", icon: Database },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN", "OPERATOR_ADMIN", "ADMIN"]}
      portalName="Cổng Quản Trị Hệ Thống Tối Cao (Bộ KH&CN / NacenTech)"
    >
      <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-surface-page dark:bg-slate-950 lg:flex-row">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full shrink-0 border-r border-brand-800 bg-brand-700 p-4 text-white lg:w-72">
          <div className="pb-4 mb-4 border-b border-white/20">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-caption font-semibold uppercase tracking-wider border border-white/20">
              <Lock className="w-3 h-3" />
              <span>Tầng 0: Quản Trị Tối Cao</span>
            </div>
            <h3 className="font-bold text-white mt-2 text-card-title">Tổng Hành Dinh Quản Trị</h3>
          </div>

          <nav className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`focus-ring flex min-h-11 items-center gap-2.5 px-3 py-2 rounded-control text-label font-semibold transition ${
                    isActive
                      ? "bg-white text-brand-700 shadow-sm"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 p-3 rounded-control bg-brand-800 border border-white/20 text-label text-brand-100 space-y-1">
            <div className="font-bold text-white flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Cấp độ An toàn TT: Cấp 3</span>
            </div>
            <p>Mã hóa đường truyền TLS 1.3 và lưu vết 100% nhật ký bất biến.</p>
          </div>
        </aside>

        {/* Admin Main Workspace */}
        <div className="min-w-0 flex-1 p-4 sm:p-8">{children}</div>
      </div>
    </RoleGuard>
  );
}
