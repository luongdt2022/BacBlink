"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

export interface ExpertAvatarProps {
  fullName: string;
  avatarUrl?: string | null;
  expertCode?: string | null;
  size?: "sm" | "md" | "lg";
  isVerified?: boolean;
  className?: string;
  priority?: boolean;
}

/**
 * Trích xuất chữ cái viết tắt (monogram) từ họ tên chuyên gia sau khi lược bỏ học hàm/học vị
 * Ví dụ: "GS.TS. Trần Đình Thắng" -> "ĐT"
 */
export function getExpertInitials(name: string): string {
  if (!name) return "CG";
  const cleanName = name.replace(/^(GS\.|PGS\.|TS\.|ThS\.|KS\.|CN\.)+\s*/gi, "").trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const p1 = parts[parts.length - 2][0] || "";
    const p2 = parts[parts.length - 1][0] || "";
    return `${p1}${p2}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return cleanName.slice(0, 2).toUpperCase() || "CG";
}

/**
 * Ánh xạ ảnh avatar chân dung cho các chuyên gia KH&CN tiêu biểu của hệ thống
 */
export function resolveExpertAvatarUrl(
  fullName: string,
  expertCode?: string | null,
  explicitUrl?: string | null
): string | null {
  if (explicitUrl && explicitUrl.trim()) {
    return explicitUrl.trim();
  }

  const name = fullName.toLowerCase();
  const code = (expertCode || "").toUpperCase().trim();

  if (code === "CG-NACEN-DEMO001" || name.includes("trần đình thắng")) {
    return "/images/experts/tran-dinh-thang.jpg";
  }
  if (code === "CG-NACEN-0004" || name.includes("đỗ thị thu hà")) {
    return "/images/experts/do-thi-thu-ha.jpg";
  }
  if (code === "CG-NACEN-0002" || name.includes("lê quốc hùng")) {
    return "/images/experts/le-quoc-hung.jpg";
  }
  if (code === "CG-NACEN-DEMOIT01" || name.includes("nguyễn minh an")) {
    return "/images/experts/nguyen-minh-an.jpg";
  }
  if (code === "CG-NACEN-0005" || name.includes("vũ mạnh cường")) {
    return "/images/experts/vu-manh-cuong.jpg";
  }
  if (code === "CG-NACEN-0003" || name.includes("hoàng minh trí")) {
    return "/images/experts/hoang-minh-tri.jpg";
  }

  return null;
}

/**
 * Component hiển thị Avatar Chuyên gia KH&CN thân thiện, chuyên nghiệp
 * Tự động tải ảnh avatar chân dung với cơ chế fallback monogram an toàn, không vỡ layout khi offline/lỗi mạng.
 */
export function ExpertAvatar({
  fullName,
  avatarUrl,
  expertCode,
  size = "md",
  isVerified = false,
  className = "",
}: ExpertAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const resolvedUrl = resolveExpertAvatarUrl(fullName, expertCode, avatarUrl);
  const initials = getExpertInitials(fullName);

  const containerSizes = {
    sm: "w-10 h-10 rounded-lg text-caption",
    md: "w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-body",
    lg: "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-2xl sm:text-3xl",
  }[size];

  const badgePositionSizes = {
    sm: "-bottom-1 -right-1 w-4 h-4",
    md: "-bottom-1 -right-1 w-4.5 h-4.5",
    lg: "-bottom-1.5 -right-1.5 w-6 h-6",
  }[size];

  const checkIconSizes = {
    sm: "w-2.5 h-2.5 stroke-[3]",
    md: "w-2.5 h-2.5 stroke-[3]",
    lg: "w-3.5 h-3.5 stroke-[3]",
  }[size];

  const hasImage = Boolean(resolvedUrl) && !imgError;

  return (
    <div
      className={`relative shrink-0 select-none ${className}`}
      data-testid="expert-avatar-container"
    >
      <div
        className={`${containerSizes} overflow-hidden border border-slate-200 dark:border-slate-700 bg-brand-700 shadow-2xs flex items-center justify-center`}
      >
        {hasImage ? (
          <img
            src={resolvedUrl!}
            alt={`Ảnh chân dung ${fullName}`}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
            data-testid="expert-avatar-image"
          />
        ) : (
          <span
            className="font-extrabold text-white tracking-wide"
            data-testid="expert-avatar-initials"
          >
            {initials}
          </span>
        )}
      </div>

      {isVerified && (
        <span
          className={`absolute ${badgePositionSizes} rounded-full bg-emerald-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-xs`}
          title="Đã xác thực"
          data-testid="expert-avatar-verified-badge"
        >
          <Check className={checkIconSizes} />
        </span>
      )}
    </div>
  );
}
