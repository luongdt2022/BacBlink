"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, Search, XCircle } from "lucide-react";
import { membershipClient, formatDate, MEMBERSHIP_STATUS_LABEL, type CertificateVerification } from "@/lib/membership-client";
import { ORG } from "@/lib/constants/organization";

function VerifyInner() {
  const params = useSearchParams();
  const router = useRouter();
  const so = (params.get("so") ?? "").trim().toUpperCase();
  const [input, setInput] = useState(so);
  const [result, setResult] = useState<CertificateVerification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInput(so);
    setResult(null);
    setError(null);
    if (!so) return;
    setLoading(true);
    membershipClient.verify(so).then(setResult).catch((e) => setError(e instanceof Error ? e.message : "Không tìm thấy")).finally(() => setLoading(false));
  }, [so]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-xl space-y-5">
        <h1 className="type-page-title text-slate-900 dark:text-white">Xác thực chứng nhận hội viên</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Nhập số chứng nhận (dạng BL-2026-0001) để kiểm tra tư cách hội viên {ORG.shortName}.</p>
        <form role="search" onSubmit={(e) => { e.preventDefault(); if (input.trim()) router.push(`/hoi-vien/xac-thuc?so=${encodeURIComponent(input.trim().toUpperCase())}`); }} className="flex gap-2">
          <label htmlFor="so" className="sr-only">Số chứng nhận</label>
          <input id="so" value={input} onChange={(e) => setInput(e.target.value)} placeholder="BL-2026-0001" className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase dark:border-slate-700 dark:bg-slate-900" />
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-bold text-white"><Search className="size-4" aria-hidden="true" /> Kiểm tra</button>
        </form>
        {loading && <p className="text-sm text-slate-500">Đang kiểm tra...</p>}
        {error && (
          <div role="alert" className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            <XCircle className="size-6 shrink-0" aria-hidden="true" /> {error}
          </div>
        )}
        {result && (
          <div className="space-y-2 rounded-2xl border border-emerald-200 bg-white p-6 dark:border-emerald-900 dark:bg-slate-900">
            <p className="flex items-center gap-2 font-extrabold text-emerald-700"><BadgeCheck className="size-6" aria-hidden="true" /> Chứng nhận hợp lệ</p>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-slate-500">Số chứng nhận</dt><dd className="font-bold">{result.certificateNo}</dd>
              <dt className="text-slate-500">Doanh nghiệp</dt><dd className="font-bold">{result.enterpriseName}</dd>
              <dt className="text-slate-500">Mã số thuế</dt><dd>{result.taxCode ?? "—"}</dd>
              <dt className="text-slate-500">Loại hội viên</dt><dd>{result.tierName}</dd>
              <dt className="text-slate-500">Hiệu lực</dt><dd>{formatDate(result.validFrom)} – {formatDate(result.validTo)}</dd>
              <dt className="text-slate-500">Trạng thái</dt>
              <dd><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${MEMBERSHIP_STATUS_LABEL[result.status].cls}`}>{MEMBERSHIP_STATUS_LABEL[result.status].label}</span></dd>
            </dl>
          </div>
        )}
      </div>
    </main>
  );
}

/** CR-BACLINK-008 · T-00.BL08.14 — trang xác thực công khai số chứng nhận hội viên. */
export default function XacThucPage() {
  return <Suspense fallback={null}><VerifyInner /></Suspense>;
}
