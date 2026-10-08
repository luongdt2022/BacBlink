"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  ShieldCheck,
  Network,
  Layers,
  ArrowLeft
} from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    {
      href: "/admin/approvals",
      label: "Hàng Đợi Thẩm Định",
      icon: ClipboardCheck,
      badge: "5 Luồng",
    },
    {
      href: "/admin/roles",
      label: "Quản Lý Vai Trò",
      icon: ShieldCheck,
      badge: "10 Roles",
    },
    {
      href: "/admin/org-tree",
      label: "Cây 34 Tỉnh Thành",
      icon: Network,
      badge: "3 Miền",
    },
    {
      href: "/admin/sectors",
      label: "Danh Mục Lĩnh Vực & TT17",
      icon: Layers,
      badge: "Danh mục ngành",
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
