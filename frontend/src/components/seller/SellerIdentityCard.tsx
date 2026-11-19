"use client";

import React from "react";
import { Building2, User, Phone, Mail, ShieldCheck } from "lucide-react";
import { FIXED_BACLINK_AUTHORITY } from "@/services/api/technology-offer";

interface SellerIdentityCardProps {
  enterpriseName?: string | null;
  enterpriseTaxCode?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  managingAuthorityId?: string;
  managingAuthorityName?: string;
  onAuthorityChange?: (id: string, name: string) => void;
  isAutoDetected?: boolean;
}

export function SellerIdentityCard({
  enterpriseName,
  enterpriseTaxCode,
  contactName,
  contactPhone,
  contactEmail,
  managingAuthorityId,
  managingAuthorityName,
  onAuthorityChange,
  isAutoDetected,
}: SellerIdentityCardProps) {
  // Mặt nạ che thông tin bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP (PDPD)
  const maskPhone = (phone?: string | null) => {
    if (!phone) return "Chưa cập nhật";
    const clean = phone.replace(/\s+/g, "");
    if (clean.length >= 7) {
      return clean.slice(0, 3) + " ••• •" + clean.slice(-3);
    }
    return phone;
  };

  const maskEmail = (email?: string | null) => {
    if (!email) return "Chưa cập nhật";
    const parts = email.split("@");
    if (parts.length === 2) {
      const name = parts[0];
      const domain = parts[1];
      const visible = name.length > 2 ? name.slice(0, 2) : name.slice(0, 1);
      return `${visible}•••••@${domain}`;
    }
    return email;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-700" />
          <span className="text-xs font-extrabold text-slate-900">
            {enterpriseName || "Doanh nghiệp chào bán liên kết"}
          </span>
          {enterpriseTaxCode ? (
            <span className="rounded bg-slate-200/80 px-2 py-0.5 text-xs font-mono font-bold text-slate-700">
              MST: {enterpriseTaxCode}
            </span>
          ) : (
            <span className="text-xs text-slate-400 italic">(Chưa có MST)</span>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <ShieldCheck className="h-3 w-3" />
          {enterpriseName ? "Đã liên kết hồ sơ" : "Chờ đồng bộ"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-3">
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-slate-400" />
          <span>Người phụ trách: <b className="text-slate-800">{contactName || "Chưa cập nhật"}</b></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-slate-400" />
          <span>SĐT: <b className="text-slate-800 font-mono">{maskPhone(contactPhone)}</b></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 text-slate-400" />
          <span>Email: <b className="text-slate-800 font-mono">{maskEmail(contactEmail)}</b></span>
        </div>
      </div>

      {/* Cơ quan tiếp nhận cố định của Hiệp hội BACLINK */}
      <div className="border-t border-slate-200/80 pt-3 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <span className="text-xs font-bold text-slate-800">
            Cơ quan tiếp nhận thẩm định hồ sơ:
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            {FIXED_BACLINK_AUTHORITY.name}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Hồ sơ chào bán được chuyển trực tiếp tới Ban Thẩm định Kỹ thuật — Hiệp hội BACLINK để rà soát trước khi niêm yết công khai.
        </p>
      </div>

      <div className="border-t border-slate-200/60 pt-2 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 inline" />
          Tuân thủ Nghị định 13/2023/NĐ-CP (PDPD): SĐT và Email được che tự động, chỉ cấp quyền truy cập cho Bên Mua sau khi gửi Yêu cầu kết nối hợp lệ.
        </span>
      </div>
    </div>
  );
}
