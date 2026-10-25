"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  Lock,
  LayoutDashboard,
  Inbox,
  AlarmClock,
  Zap,
  Users,
  Network,
  Database,
  History,
  Sliders,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

function AdminSidebarNav() {
  const pathname = usePathname();
  const currentTab = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tab") || "all" : "all";

  // 4 nhóm Accordion: mở mặc định
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    group1: true,
    group2: true,
    group3: true,
    group4: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isLinkActive = (href: string, tabValue?: string) => {
    if (tabValue) {
      return pathname === "/admin/approvals" && currentTab === tabValue;
    }
    if (href === "/admin") {
      return pathname === "/admin";
    }
    if (href === "/admin/approvals") {
      return (
        pathname === "/admin/approvals" &&
        (currentTab === "all" || currentTab === "")
      );
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="w-full shrink-0 border-r border-brand-800 bg-brand-700 p-4 text-white lg:w-72 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header Tầng 0 */}
        <div className="pb-3 border-b border-white/20">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-caption font-bold uppercase tracking-wider border border-white/20">
            <Lock className="w-3.5 h-3.5 text-white" />
            <span>Tầng 0: Quản Trị Tối Cao</span>
          </div>
          <h3 className="text-sm font-black text-white mt-2">Trung Tâm Quản Trị Hệ Thống</h3>
          <p className="text-caption text-white/80 mt-0.5">Phân hệ quản trị 34 tỉnh/thành trọng điểm</p>
        </div>

        {/* 4 NHÓM ACCORDION */}
        <nav className="space-y-3">
          {/* NHÓM 1: TRUNG TÂM ĐIỀU HÀNH */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleGroup("group1")}
              className="w-full flex items-center justify-between px-2 text-caption font-extrabold uppercase tracking-wider text-white/80 hover:text-white transition"
            >
              <div className="flex items-center gap-1">
                {openGroups.group1 ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span>1. Trung Tâm Điều Hành</span>
              </div>
              <span className="text-caption bg-white/10 px-1.5 py-0.5 rounded text-white/90 border border-white/20 font-bold">BI 360°</span>
            </button>
            {openGroups.group1 && (
              <div className="space-y-0.5">
                <Link
                  href="/admin"
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/admin")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className={`w-4 h-4 ${isLinkActive("/admin") ? "text-brand-700" : "text-white"}`} />
                    <span>Tổng quan Dashboard 360° & BI Toàn quốc</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </Link>
              </div>
            )}
          </div>

          {/* NHÓM 2: TRUNG TÂM PHÊ DUYỆT TOÀN QUỐC */}
          <div className="space-y-1 pt-1">
            <button
              type="button"
              onClick={() => toggleGroup("group2")}
              className="w-full flex items-center justify-between px-2 text-caption font-extrabold uppercase tracking-wider text-amber-200 hover:text-white transition"
            >
              <div className="flex items-center gap-1">
                {openGroups.group2 ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span>2. Trung Tâm Phê Duyệt Toàn Quốc</span>
              </div>
              <span className="text-caption bg-white/20 text-white px-1.5 py-0.5 rounded border border-white/30 font-bold">
                Hub
              </span>
            </button>
            {openGroups.group2 && (
              <div className="space-y-0.5">
                <Link
                  href="/admin/approvals"
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/admin/approvals")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Inbox className={`w-4 h-4 ${isLinkActive("/admin/approvals") ? "text-brand-700" : "text-white"}`} />
                    <span>Tất cả Hàng đợi Phê duyệt</span>
                  </div>
                  <span className={`text-caption px-1.5 py-0.5 rounded-full font-bold ${
                    isLinkActive("/admin/approvals")
                      ? "bg-brand-100 text-brand-800"
                      : "bg-white/15 text-white border border-white/20"
                  }`}>
                    34 Tỉnh
                  </span>
                </Link>
                <Link
                  href="/admin/approvals?tab=sla"
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/admin/approvals", "sla")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <AlarmClock className={`w-4 h-4 ${isLinkActive("/admin/approvals", "sla") ? "text-brand-700" : "text-rose-300"}`} />
                    <span>Cảnh báo Quá hạn SLA Sở Tỉnh</span>
                  </div>
                  <span className="text-caption bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold shadow-xs">
                    SLA 72h
                  </span>
                </Link>
                <Link
                  href="/admin/approvals?tab=override"
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/admin/approvals", "override")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className={`w-4 h-4 ${isLinkActive("/admin/approvals", "override") ? "text-brand-700" : "text-amber-300"}`} />
                    <span>Phê duyệt Vượt cấp / Can thiệp</span>
                  </div>
                  <span className="text-caption bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded font-extrabold">
                    Tầng 0
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* NHÓM 3: QUẢN TRỊ DANH MỤC & CƠ CẤU */}
          <div className="space-y-1 pt-1">
            <button
              type="button"
              onClick={() => toggleGroup("group3")}
              className="w-full flex items-center justify-between px-2 text-caption font-extrabold uppercase tracking-wider text-white/80 hover:text-white transition"
            >
              <div className="flex items-center gap-1">
                {openGroups.group3 ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span>3. Quản Trị Danh Mục & Cơ Cấu</span>
              </div>
            </button>
            {openGroups.group3 && (
              <div className="space-y-0.5">
                <Link
                  href="/admin/roles"
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/admin/roles") || isLinkActive("/admin/users")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <Users className={`w-4 h-4 ${isLinkActive("/admin/roles") || isLinkActive("/admin/users") ? "text-brand-700" : "text-white"}`} />
                  <span>Quản lý 10 Vai trò (RBAC)</span>
                </Link>
                <Link
                  href="/admin/org-tree"
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/admin/org-tree")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <Network className={`w-4 h-4 ${isLinkActive("/admin/org-tree") ? "text-brand-700" : "text-white"}`} />
                  <span>Cây Thư mục 34 Tỉnh/Thành</span>
                </Link>
                <Link
                  href="/admin/sectors"
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/admin/sectors")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <Database className={`w-4 h-4 ${isLinkActive("/admin/sectors") ? "text-brand-700" : "text-white"}`} />
                  <span>Danh mục 18 Ngành TT17 & TRL</span>
                </Link>
              </div>
            )}
          </div>

          {/* NHÓM 4: GIÁM SÁT & VẬN HÀNH */}
          <div className="space-y-1 pt-1">
            <button
              type="button"
              onClick={() => toggleGroup("group4")}
              className="w-full flex items-center justify-between px-2 text-caption font-extrabold uppercase tracking-wider text-white/80 hover:text-white transition"
            >
              <div className="flex items-center gap-1">
                {openGroups.group4 ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span>4. Giám Sát & Vận Hành</span>
              </div>
            </button>
            {openGroups.group4 && (
              <div className="space-y-0.5">
                <Link
                  href="/admin/audit-logs"
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/admin/audit-logs")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <History className={`w-4 h-4 ${isLinkActive("/admin/audit-logs") ? "text-brand-700" : "text-white"}`} />
                  <span>Nhật ký Kiểm toán Toàn quốc (Audit Logs)</span>
                </Link>
                <Link
                  href="/admin/system-config"
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/admin/system-config")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <Sliders className={`w-4 h-4 ${isLinkActive("/admin/system-config") ? "text-brand-700" : "text-white"}`} />
                  <span>Cấu hình Tham số & SLA Hệ thống</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-white/20 space-y-2">
        <div className="p-3 rounded-xl bg-brand-800/80 border border-white/20 text-caption text-white space-y-1">
          <div className="font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>An Toàn TT: Cấp 3</span>
            </span>
            <span className="text-caption bg-white/20 px-1 rounded text-white border border-white/20">NĐ 85/2016</span>
          </div>
          <p className="text-caption leading-tight text-white/80">
            Mã hóa đường truyền TLS 1.3 · Lưu vết 100% nhật ký bất biến
          </p>
        </div>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN", "OPERATOR_ADMIN", "ADMIN"]}
      portalName="Cổng Quản Trị Hệ Thống Tối Cao (Bộ KH&CN / NacenTech)"
    >
      <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-100 dark:bg-slate-950 lg:flex-row">
        <AdminSidebarNav />

        {/* Admin Main Workspace */}
        <div className="min-w-0 flex-1 p-4 sm:p-8 overflow-y-auto">{children}</div>
      </div>
    </RoleGuard>
  );
}
