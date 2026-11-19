"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  ShieldCheck,
  Layers,
  ArrowLeft,
  Workflow,
  Users,
  Inbox,
  BadgeCheck,
  Newspaper
} from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    {
      href: "/admin/approvals",
      label: "Hàng Đợi Phê Duyệt",
      icon: ClipboardCheck,
      badge: "1 Cấp",
    },
    {
      href: "/admin/users",
      label: "Quản Lý Người Dùng",
      icon: Users,
      badge: "BACLINK",
    },
    {
      href: "/admin/roles",
      label: "Quản Lý Vai Trò",
      icon: ShieldCheck,
      badge: "3 Cấp RBAC",
    },
    {
      href: "/admin/cms",
      label: "Nội Dung",
      icon: Newspaper,
      badge: "CMS",
    },
    {
      href: "/admin/members",
      label: "Hội Viên",
      icon: BadgeCheck,
      badge: "Hội phí",
    },
    {
      href: "/admin/contact-requests",
      label: "Hộp Thư Liên Hệ",
      icon: Inbox,
      badge: "Mới",
    },
    {
      href: "/admin/sectors",
      label: "Ngành Công Nghiệp & Địa Bàn",
      icon: Layers,
      badge: "8 Ngành",
    },
    {
      href: "/dashboard",
      label: "Agent Orchestrator & CR",
      icon: Workflow,
      badge: "Realtime",
    },
  ];

  return (
    <nav className="mb-6 bg-white border border-gray-200 rounded-xl p-2 shadow-sm flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? "bg-brand-50 text-brand-700 border border-brand-200 shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-brand-600" : "text-slate-400"}`} />
              <span>{link.label}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  isActive
                    ? "bg-brand-100 text-brand-800"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {link.badge}
              </span>
            </Link>
          );
        })}
      </div>

      <Link
        href="/portal"
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Về Portal</span>
      </Link>
    </nav>
  );
}
