"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

export interface AppBreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
  homeLabel?: string;
  hideOnHome?: boolean;
  enableJsonLd?: boolean;
}

const ROUTE_LABELS: Record<string, string> = {
  "gioi-thieu": "Giới thiệu",
  "huong-dan": "Trung tâm Hướng dẫn",
  "wireframes": "Sơ đồ Kiến trúc",
  "matrix": "Khung Pháp lý & Chuẩn mực",
  "trien-lam": "Triển lãm Techmart",
  "dang-ky-tham-quan": "Đăng ký tham quan",
  "chao-ban-cong-nghe": "Chào bán công nghệ",
  "nhu-cau-cong-nghe": "Nhu cầu công nghệ",
  "khao-sat-nhu-cau": "Khảo sát Nhu cầu (TNI)",
  "khao-sat-cong-nghe": "Khảo sát Năng lực Cung",
  "khao-sat-doanh-nghiep": "Đăng nhanh Nhu cầu",
  "khao-sat-dmst": "Khảo sát Năng lực ĐMST",
  "doanh-nghiep-dmst": "Doanh nghiệp ĐMST",
  "dieu-tra-trinh-do-nang-luc": "Đánh giá Trình độ DN (TT17)",
  "chuyen-gia": "Mạng lưới Chuyên gia",
  "elearning": "E-Learning & Đào tạo",
  "dich-vu-khac": "Dịch vụ & Tiện ích",
  "assessments": "Thẩm định & Đánh giá",
  "buyer": "Bên mua",
  "seller": "Bên bán",
  "matching": "Ghép nối Cung - Cầu",
  "radar": "Radar Ghép nối",
  "dashboard": "Dashboard & CR",
  "portal": "Không gian làm việc",
  "settings": "Cài đặt tài khoản",
  "profile": "Hồ sơ cá nhân",
  "upgrade": "Đăng ký Chuyên gia",
  "technologies": "Danh mục Công nghệ",
  "create": "Đăng ký mới",
  "edit": "Chỉnh sửa",
  "login": "Đăng nhập",
  "register": "Đăng ký",
};

export function AppBreadcrumb({
  items,
  separator,
  homeLabel = "Trang chủ",
  hideOnHome = true,
  enableJsonLd = true,
  className,
  ...props
}: AppBreadcrumbProps) {
  const pathname = usePathname();

  // Determine items: custom or auto-derived from pathname
  let breadcrumbItems: BreadcrumbItem[] = [];

  if (items && items.length > 0) {
    breadcrumbItems = items;
  } else {
    if (!pathname || pathname === "/") {
      if (hideOnHome) return null;
      breadcrumbItems = [{ label: homeLabel, href: "/", icon: Home, current: true }];
    } else {
      const segments = pathname.split("/").filter(Boolean);
      breadcrumbItems = [{ label: homeLabel, href: "/", icon: Home }];

      let accumulatedPath = "";
      segments.forEach((seg, index) => {
        accumulatedPath += `/${seg}`;
        const isLast = index === segments.length - 1;
        const mappedLabel =
          ROUTE_LABELS[seg] ||
          decodeURIComponent(seg)
            .replace(/[-_]/g, " ")
            .replace(/^\w/, (c) => c.toUpperCase());

        breadcrumbItems.push({
          label: mappedLabel,
          href: isLast ? undefined : accumulatedPath,
          current: isLast,
        });
      });
    }
  }

  // Generate Schema.org BreadcrumbList JSON-LD
  const jsonLd = enableJsonLd && breadcrumbItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.label,
      ...(item.href ? { "item": item.href.startsWith("http") ? item.href : `https://nacentech.gov.vn${item.href}` } : {}),
    })),
  } : null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 py-2.5 px-1",
        className
      )}
      {...props}
    >
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1 || Boolean(item.current);
          const Icon = item.icon;

          return (
            <li key={index} className="inline-flex items-center gap-1.5 sm:gap-2">
              {index > 0 && (
                <span className="text-slate-400 dark:text-slate-600 select-none" aria-hidden="true">
                  {separator || <ChevronRight className="size-3.5 shrink-0" />}
                </span>
              )}

              {isLast || !item.href ? (
                <span
                  className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs"
                  aria-current="page"
                >
                  {Icon && <Icon className="size-3.5 inline mr-1 -mt-0.5" aria-hidden="true" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="focus-ring inline-flex items-center gap-1 rounded-sm text-slate-600 hover:text-brand-700 dark:text-slate-300 dark:hover:text-cyan-400 transition-colors truncate max-w-[150px] sm:max-w-xs"
                >
                  {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
