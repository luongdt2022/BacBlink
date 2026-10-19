"use client";

import React from "react";
import { Building2, User, Phone, Mail, ShieldCheck } from "lucide-react";

interface SellerIdentityCardProps {
  enterpriseName?: string | null;
  enterpriseTaxCode?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
}

export function SellerIdentityCard({
  enterpriseName = "Công ty TNHH Giải Pháp Công Nghệ NacenTwin",
  enterpriseTaxCode = "0109887766",
  contactName = "Nguyễn Văn Hùng",
  contactPhone = "0987 654 321",
  contactEmail = "seller.contact@nacentech.vn",
}: SellerIdentityCardProps) {
  // Mặt nạ che thông tin bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP (PDPD)
  const maskPhone = (phone?: string | null) => {
    if (!phone) return "09xx xxx xxx";
    const clean = phone.replace(/\s+/g, "");
    if (clean.length >= 7) {
      return clean.slice(0, 3) + " ••• •" + clean.slice(-3);
    }
    return "09xx xxx xxx";
  };

  const maskEmail = (email?: string | null) => {
    if (!email) return "s•••••@nacentech.vn";
    const parts = email.split("@");
    if (parts.length === 2) {
      const name = parts[0];
      const domain = parts[1];
      const visible = name.length > 2 ? name.slice(0, 2) : name.slice(0, 1);
      return `${visible}•••••@${domain}`;
    }
    return "s•••••@nacentech.vn";
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-700" />
          <span className="text-xs font-extrabold text-slate-900">
            {enterpriseName || "Doanh nghiệp chào bán liên kết"}
          </span>
          {enterpriseTaxCode && (
            <span className="rounded bg-slate-200/80 px-2 py-0.5 text-xs font-mono font-bold text-slate-700">
              MST: {enterpriseTaxCode}
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <ShieldCheck className="h-3 w-3" />
          Đã xác thực định danh
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

      <div className="border-t border-slate-200/60 pt-2 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 inline" />
          Tuân thủ Nghị định 13/2023/NĐ-CP (PDPD): SĐT và Email được che tự động, chỉ cấp quyền truy cập cho Bên Mua sau khi gửi Yêu cầu kết nối hợp lệ.
        </span>
      </div>
    </div>
  );
}
