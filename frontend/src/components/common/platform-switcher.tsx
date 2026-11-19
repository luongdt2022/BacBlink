"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const platforms = [
  { href: "/", label: "Web công khai" },
  { href: "/portal", label: "Portal doanh nghiệp" },
  { href: "/admin", label: "Admin quản trị" },
] as const;

/** Common switcher for the web modules that are currently implemented. */
export function PlatformSwitcher() {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  if (!isVisible) {
    return (
      <button
        type="button"
        onClick={() => setIsVisible(true)}
        className="fixed left-3 top-3 z-50 inline-flex items-center gap-1.5 rounded-control border border-slate-500/70 bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-slate-800"
        aria-label="Hiển thị thanh chọn phân hệ"
      >
        <Menu className="size-4" /> Phân hệ
      </button>
    );
  }

  return (
    <div className="relative z-50 border-b border-slate-700 bg-slate-900 text-slate-100">
      <div className="page-container flex min-h-11 items-center gap-3">
        <span className="hidden text-caption font-extrabold uppercase tracking-wider text-slate-300 xl:inline">Chọn phân hệ</span>
        <nav className="flex flex-1 min-w-0 items-center gap-1 overflow-x-auto py-1.5" aria-label="Chọn phân hệ">
          {platforms.map((platform) => (
            <Link
              key={platform.href}
              href={platform.href}
              className={`focus-ring shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                platform.href === "/"
                  ? pathname === "/"
                    ? "bg-nacen-green-500 text-white"
                    : "text-slate-200 hover:bg-slate-700 hover:text-white"
                  : pathname === platform.href || pathname.startsWith(`${platform.href}/`)
                    ? "bg-nacen-green-500 text-white"
                    : "text-slate-200 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {platform.label}
            </Link>
          ))}
          <span
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-400"
            title="Phân hệ Mobile / Zalo Mini App chưa có màn hình chức năng trong source hiện tại"
            aria-disabled="true"
          >
            Mobile / Zalo Mini App
          </span>
        </nav>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="focus-ring inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-600 px-2.5 py-1.5 text-xs font-bold text-slate-100 transition hover:bg-slate-700"
          aria-label="Ẩn thanh chọn phân hệ"
        >
          <X className="size-3.5" /> <span className="hidden sm:inline">Ẩn</span>
        </button>
      </div>
    </div>
  );
}
