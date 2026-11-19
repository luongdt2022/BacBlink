"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import { membershipClient, formatDate, MEMBERSHIP_STATUS_LABEL, type Membership } from "@/lib/membership-client";
import { ORG, ORG_DECISION_TEXT } from "@/lib/constants/organization";

/**
 * CR-BACLINK-008 · T-00.BL08.14 — Chứng nhận hội viên dạng trang in (In / Lưu PDF bằng trình duyệt).
 * Đối chiếu tính xác thực qua /hoi-vien/xac-thuc?so=...
 */
export default function CertificatePage() {
  const [m, setM] = useState<Membership | null | undefined>(undefined);
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
    membershipClient.mine().then(setM).catch(() => setM(null));
  }, []);

  if (m === undefined) return <p className="p-8 text-sm text-slate-500">Đang tải chứng nhận...</p>;
  if (!m || !m.certificateNo) {
    return (
      <div className="p-8 text-sm">
        Chưa có chứng nhận hội viên. <Link href="/portal/membership" className="font-bold text-brand-700 underline">Quay lại</Link>
      </div>
    );
  }
  const verifyUrl = `${origin}/hoi-vien/xac-thuc?so=${m.certificateNo}`;

  return (
    <div className="space-y-4">
      <style>{`@media print { header, footer, nav, aside, [aria-label="Liên hệ nhanh"], .no-print { display: none !important; } body { background: #fff !important; } .cert { box-shadow: none !important; margin: 0 !important; } @page { size: A4 landscape; margin: 12mm; } }`}</style>
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <Link href="/portal/membership" className="text-sm font-bold text-brand-700 hover:underline">← Tư cách hội viên</Link>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-sm font-bold text-white">
          <Printer className="size-4" aria-hidden="true" /> In / Lưu PDF
        </button>
      </div>

      <article className="cert mx-auto max-w-4xl rounded-lg border-[10px] border-double border-amber-500 bg-white p-10 text-center text-slate-900 shadow-xl">
        <img src="/baclink-logo-256.png" alt="" className="mx-auto size-20 rounded-full" />
        <p className="mt-3 text-sm font-bold tracking-wide">{ORG.fullNameUpper} ({ORG.shortName})</p>
        <p className="text-xs text-slate-500">{ORG_DECISION_TEXT}</p>
        <h1 className="mt-6 text-3xl font-black uppercase tracking-wider text-[#053567]">Chứng nhận hội viên</h1>
        <p className="mt-6 text-sm">Chứng nhận</p>
        <p className="mt-1 text-2xl font-extrabold">{m.enterpriseName}</p>
        <p className="text-sm text-slate-600">Mã số thuế: {m.taxCode ?? "—"}</p>
        <p className="mt-4 text-sm">là <strong>{m.tierName}</strong> của {ORG.fullName}</p>
        <div className="mx-auto mt-6 grid max-w-xl grid-cols-3 gap-4 text-sm">
          <div><p className="text-xs text-slate-500">Số chứng nhận</p><p className="font-mono font-bold">{m.certificateNo}</p></div>
          <div><p className="text-xs text-slate-500">Hiệu lực từ</p><p className="font-bold">{formatDate(m.validFrom)}</p></div>
          <div><p className="text-xs text-slate-500">Đến ngày</p><p className="font-bold">{formatDate(m.validTo)}</p></div>
        </div>
        {m.status !== "ACTIVE" && (
          <p className="mt-4 inline-block rounded-full px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-300">
            Trạng thái hiện tại: {MEMBERSHIP_STATUS_LABEL[m.status].label}
          </p>
        )}
        <p className="mt-8 text-[11px] text-slate-500">Xác thực trực tuyến: {verifyUrl}</p>
      </article>
    </div>
  );
}
