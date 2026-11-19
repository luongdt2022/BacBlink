"use client";

import React, { useState } from "react";
import { ShieldCheck, Clock, Info, AlertCircle, HelpCircle, Award, Zap } from "lucide-react";
import TrlMethodologyModal from "./TrlMethodologyModal";
import TniMethodologyModal from "./TniMethodologyModal";

export type VerificationType = "TRL" | "TNI" | "IP";

export type VerificationStatus =
  | "VERIFIED_BY_GOV"
  | "SELF_DECLARED"
  | "PENDING_VERIFICATION"
  | "REJECTED_TRL"
  | "REJECTED_IP"
  | "NOT_APPLICABLE"
  | string;

export type BadgeVariant = "compact" | "full" | "text";

export interface IndexVerificationBadgeProps {
  type: VerificationType;
  status?: VerificationStatus | null;
  value?: number | string | null;
  authorityName?: string | null;
  variant?: BadgeVariant;
  concise?: boolean;
  translucent?: boolean;
  showMethodologyTrigger?: boolean;
  onOpenMethodology?: () => void;
  className?: string;
}

export function IndexVerificationBadge({
  type,
  status = "SELF_DECLARED",
  value,
  authorityName,
  variant = "compact",
  concise = false,
  translucent = false,
  showMethodologyTrigger = true,
  onOpenMethodology,
  className = ""
}: IndexVerificationBadgeProps) {
  const [internalModalOpen, setInternalModalOpen] = useState(false);

  const effectiveStatus = status || "SELF_DECLARED";
  const isVerified = effectiveStatus === "VERIFIED_BY_GOV";
  const isRejected = effectiveStatus === "REJECTED_TRL" || effectiveStatus === "REJECTED_IP";
  const isNotApplicable = effectiveStatus === "NOT_APPLICABLE";
  const isSelfDeclared = effectiveStatus === "SELF_DECLARED" || effectiveStatus === "PENDING_VERIFICATION";

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onOpenMethodology) {
      onOpenMethodology();
    } else {
      setInternalModalOpen(true);
    }
  };

  const isTextOnly = variant === "text";
  const useConciseTrl = isTextOnly || concise;

  // Xác định text hiển thị chính
  const getBadgeText = () => {
    if (type === "TRL") {
      const levelText = value ? `TRL ${value}/9` : "TRL";
      if (useConciseTrl) {
        if (isVerified) return levelText;
        if (isRejected) return `${levelText} (Không đạt)`;
        if (isNotApplicable) return levelText;
        return `${levelText} (Chưa kiểm định)`;
      }
      if (isVerified) return `✓ ${levelText} · Đã thẩm định`;
      if (isRejected) return `${levelText} · Không đạt kiểm định`;
      if (isNotApplicable) return `${levelText} · Không áp dụng`;
      return `${levelText} · Tự kê khai (Chưa kiểm định)`;
    }
    if (type === "TNI") {
      const numVal = typeof value === "number" ? value : (value !== undefined && value !== null && !isNaN(Number(value)) ? Number(value) : undefined);
      const scoreText = numVal !== undefined ? `TNI ${numVal}/100` : "TNI";
      
      // Phân mức ưu tiên đặt hàng TNI theo chuẩn Hiệp hội BACLINK
      let urgencyText = "Cấp thiết";
      if (numVal !== undefined) {
        if (numVal >= 80) urgencyText = "Rất cấp thiết";
        else if (numVal >= 60) urgencyText = "Cấp thiết";
        else urgencyText = "Tiềm năng";
      }

      if (isVerified) return `✓ ${scoreText} · Đã thẩm định`;
      if (isRejected) return `${scoreText} · Cần thẩm định lại`;
      return `${scoreText} · ${urgencyText}`;
    }
    if (type === "IP") {
      if (isVerified) return "✓ SHTT · Đã xác thực bảo hộ";
      if (isRejected) return "SHTT · Chưa đạt điều kiện";
      if (isNotApplicable) return "SHTT · Không chuyển giao";
      return "SHTT · Tự kê khai (Chưa đối soát)";
    }
    return `${type}: ${status}`;
  };

  const useDarkGlass = translucent;
  const useLightText = isTextOnly || useDarkGlass;

  // Màu sắc theo chuẩn PO & Design System
  let colorClasses = useDarkGlass
    ? "bg-slate-900/75 backdrop-blur-md text-white border-white/20 shadow-sm"
    : "bg-amber-50/90 text-amber-800 border-amber-300 border-dashed dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700";
  let textColors = "text-amber-300 dark:text-amber-300";

  if (type === "TNI") {
    // Với TNI, điểm số thể hiện mức độ cấp thiết thực tế của DN: viền liền thanh lịch, không đứt nét
    const numVal = typeof value === "number" ? value : (value !== undefined && value !== null && !isNaN(Number(value)) ? Number(value) : undefined);
    if (isVerified) {
      colorClasses = useDarkGlass
        ? "bg-slate-900/75 backdrop-blur-md text-white border-white/20 shadow-sm"
        : "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs";
      textColors = "text-emerald-300 dark:text-emerald-400";
    } else if (numVal !== undefined && numVal >= 80) {
      colorClasses = useDarkGlass
        ? "bg-slate-900/75 backdrop-blur-md text-white border-white/20 shadow-sm"
        : "bg-rose-50/95 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 shadow-2xs";
      textColors = "text-rose-300 dark:text-rose-300";
    } else if (numVal !== undefined && numVal >= 60) {
      colorClasses = useDarkGlass
        ? "bg-slate-900/75 backdrop-blur-md text-white border-white/20 shadow-sm"
        : "bg-amber-50/95 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 shadow-2xs";
      textColors = "text-amber-300 dark:text-amber-300";
    } else {
      colorClasses = useDarkGlass
        ? "bg-slate-900/75 backdrop-blur-md text-white border-white/20 shadow-sm"
        : "bg-sky-50/95 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800 shadow-2xs";
      textColors = "text-sky-300 dark:text-sky-300";
    }
  } else if (isVerified) {
    colorClasses = useDarkGlass
      ? "bg-slate-900/75 backdrop-blur-md text-white border-white/20 shadow-sm"
      : "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-xs";
    textColors = "text-emerald-300 dark:text-emerald-400";
  } else if (isRejected) {
    colorClasses = useDarkGlass
      ? "bg-slate-900/75 backdrop-blur-md text-white border-white/20 shadow-sm"
      : "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900";
    textColors = "text-rose-400 dark:text-rose-400";
  } else if (isNotApplicable) {
    colorClasses = useDarkGlass
      ? "bg-slate-900/75 backdrop-blur-md text-white border-white/20 shadow-sm"
      : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    textColors = "text-slate-400 dark:text-slate-400";
  }

  const renderIcon = () => {
    if (type === "TNI") {
      if (isVerified) return <ShieldCheck className={`w-3.5 h-3.5 ${useLightText ? "text-emerald-400" : "text-emerald-600 dark:text-emerald-400"} shrink-0`} />;
      const numVal = typeof value === "number" ? value : (value !== undefined && value !== null && !isNaN(Number(value)) ? Number(value) : undefined);
      if (numVal !== undefined && numVal >= 80) {
        return <Zap className={`w-3.5 h-3.5 ${useLightText ? "text-rose-400" : "text-rose-600 dark:text-rose-400"} shrink-0`} />;
      }
      return <Zap className={`w-3.5 h-3.5 ${useLightText ? "text-amber-300" : "text-amber-600 dark:text-amber-400"} shrink-0`} />;
    }
    if (isVerified) return <ShieldCheck className={`w-3.5 h-3.5 ${useLightText ? "text-emerald-400" : "text-emerald-600 dark:text-emerald-400"} shrink-0`} />;
    if (isRejected) return <AlertCircle className={`w-3.5 h-3.5 ${useLightText ? "text-rose-400" : "text-rose-600 dark:text-rose-400"} shrink-0`} />;
    if (isNotApplicable) return <Info className={`w-3.5 h-3.5 ${useLightText ? "text-slate-300" : "text-slate-400"} shrink-0`} />;
    return <Clock className={`w-3.5 h-3.5 ${useLightText ? "text-amber-300" : "text-amber-600 dark:text-amber-400"} shrink-0`} />;
  };

  return (
    <>
      <span
        className={
          isTextOnly
            ? `inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold drop-shadow-sm ${textColors} ${className}`
            : `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold ${useConciseTrl ? "whitespace-nowrap" : ""} ${colorClasses} ${className}`
        }
        title={
          type === "TNI"
            ? `Chỉ số cấp thiết công nghệ: ${value !== undefined && value !== null ? value : "N/A"}/100 theo 4 trục K-L-N-O`
            : isVerified
            ? authorityName
              ? `Đã được thẩm định bởi: ${authorityName}`
              : "Đã được Ban Thẩm định BACLINK Bắc Ninh thẩm định"
            : "Thông tin do chủ thể tự kê khai, chưa qua thẩm định độc lập"
        }
      >
        {renderIcon()}
        <span>{getBadgeText()}</span>

        {/* Biến thể Full hiển thị thêm đơn vị thẩm định nếu có */}
        {variant === "full" && isVerified && authorityName && (
          <span className="text-[11px] font-normal text-emerald-700 dark:text-emerald-300/90 pl-1 border-l border-emerald-300 dark:border-emerald-700/80">
            ({authorityName})
          </span>
        )}

        {/* Nút bấm (?) mở modal phương pháp luận */}
        {showMethodologyTrigger && (
          <button
            type="button"
            onClick={handleOpenModal}
            aria-label={`Xem phương pháp luận ${type}`}
            className={
              useLightText
                ? "ml-0.5 p-0.5 rounded-full hover:bg-white/20 text-white/75 hover:text-white transition focus:outline-hidden"
                : "ml-0.5 p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition focus:outline-hidden"
            }
          >
            <HelpCircle className="w-3 h-3" />
          </button>
        )}
      </span>

      {/* Internal Modals (khi không dùng onOpenMethodology ngoài) */}
      {!onOpenMethodology && internalModalOpen && (
        <>
          {type === "TRL" && (
            <TrlMethodologyModal
              isOpen={internalModalOpen}
              onClose={() => setInternalModalOpen(false)}
              initialLevel={typeof value === "number" ? value : undefined}
            />
          )}
          {type === "TNI" && (
            <TniMethodologyModal
              isOpen={internalModalOpen}
              onClose={() => setInternalModalOpen(false)}
            />
          )}
          {type === "IP" && (
            <TrlMethodologyModal
              isOpen={internalModalOpen}
              onClose={() => setInternalModalOpen(false)}
              initialLevel={7}
            />
          )}
        </>
      )}
    </>
  );
}

export default IndexVerificationBadge;
