"use client";

import React, { useState } from "react";
import {
  Building2,
  Cpu,
  Wrench,
  Sprout,
  FlaskConical,
  Zap,
} from "lucide-react";

export function extractDomain(url?: string): string {
  if (!url) return "";
  let clean = url.trim().toLowerCase();
  clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
  clean = clean.split("/")[0].split("?")[0].split("#")[0].trim();
  return clean;
}

export function getEnterpriseInitial(name: string): string {
  if (!name) return "DN";
  const clean = name
    .replace(/^(công ty|cty|chi nhánh|doanh nghiệp|hợp tác xã)\s+(tnhh|cp|cổ phần|mtv|tư nhân)?\s*/i, "")
    .trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return name.charAt(0).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

export function getSectorTheme(sectorName?: string, sectorCode?: string) {
  const s = (sectorName || "").toLowerCase();
  const c = sectorCode || "";
  if (c === "LV01" || s.includes("chế biến") || s.includes("chế tạo") || s.includes("cơ khí")) {
    return {
      gradient: "from-amber-500 to-orange-600",
      icon: Wrench,
      label: "Cơ khí & Chế tạo",
    };
  }
  if (c === "LV05" || s.includes("nông nghiệp") || s.includes("thực phẩm") || s.includes("sinh học")) {
    return {
      gradient: "from-emerald-500 to-teal-600",
      icon: Sprout,
      label: "Nông nghiệp & Sinh học",
    };
  }
  if (c === "LV07" || s.includes("y tế") || s.includes("dược") || s.includes("hóa chất")) {
    return {
      gradient: "from-rose-500 to-pink-600",
      icon: FlaskConical,
      label: "Y Dược & Hóa chất",
    };
  }
  if (c === "LV08" || c === "LV14" || s.includes("thông tin") || s.includes("điện tử") || s.includes("số")) {
    return {
      gradient: "from-brand-600 to-teal-700",
      icon: Cpu,
      label: "CNTT & Điện tử",
    };
  }
  if (c === "LV12" || s.includes("năng lượng") || s.includes("môi trường")) {
    return {
      gradient: "from-cyan-600 to-teal-600",
      icon: Zap,
      label: "Năng lượng & Môi trường",
    };
  }
  return {
    gradient: "from-slate-700 to-slate-900",
    icon: Building2,
    label: "Doanh nghiệp",
  };
}

export interface EnterpriseAvatarProps {
  name: string;
  sectorName?: string;
  sectorCode?: string;
  website?: string;
  size?: "md" | "lg";
}

export function EnterpriseAvatar({
  name,
  sectorName,
  sectorCode,
  website,
  size = "md",
}: EnterpriseAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const domain = extractDomain(website);
  const monogram = getEnterpriseInitial(name);
  const theme = getSectorTheme(sectorName, sectorCode);
  const IconComp = theme.icon;

  const showLogo = Boolean(domain) && !imgError;
  const logoUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : "";

  const containerSizeClass = size === "lg" ? "w-16 h-16 sm:w-20 sm:h-20" : "w-13 h-13 sm:w-14 sm:h-14";
  const badgeSizeClass = size === "lg" ? "w-6 h-6 -bottom-1 -right-1" : "w-5 h-5 -bottom-1 -right-1";
  const badgeIconSizeClass = size === "lg" ? "w-3.5 h-3.5" : "w-3 h-3";
  const monogramTextClass = size === "lg" ? "text-xl font-extrabold" : "font-extrabold text-base";

  return (
    <div className="relative shrink-0">
      {showLogo ? (
        <div
          className={`${containerSizeClass} rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1.5 flex items-center justify-center shadow-md shadow-slate-200/50 dark:shadow-none select-none overflow-hidden`}
        >
          <img
            src={logoUrl}
            alt={name}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className={`${containerSizeClass} rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white ${monogramTextClass} tracking-wider shadow-md shadow-slate-200/50 dark:shadow-none border border-white/20 select-none`}
        >
          {monogram}
        </div>
      )}
      <div
        className={`absolute ${badgeSizeClass} rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center z-10`}
        title={theme.label}
      >
        <IconComp className={`${badgeIconSizeClass} text-slate-700 dark:text-slate-300`} />
      </div>
    </div>
  );
}

export default EnterpriseAvatar;
