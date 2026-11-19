"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, BadgeCheck, CalendarClock, FileBadge, RefreshCw, Wallet } from "lucide-react";
import { Async, type AsyncState } from "@/components/ui/async";
import { useToast } from "@/components/common/toast";
import { membershipClient, formatDate, formatVnd, MEMBERSHIP_STATUS_LABEL, type Membership } from "@/lib/membership-client";
import { ORG } from "@/lib/constants/organization";

/** CR-BACLINK-008 · T-00.BL08.17 · REQ-BL08-MEMBER-PORTAL-007 */
export default function PortalMembershipPage() {
  const toast = useToast();
  const [m, setM] = useState<Membership | null>(null);
  const [state, setState] = useState<AsyncState>("loading");
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    setState("loading");
    membershipClient
      .mine()
      .then((r) => { setM(r); setState(r ? "success" : "empty"); })
      .catch((e) => { setError(e instanceof Error ? e.message : undefined); setState("error"); });
  }, []);
  useEffect(load, [load]);

  const renew = async () => {
    setSending(true);
    try {
      await membershipClient.requestRenewal();
      toast.success("Đã gửi yêu cầu gia hạn. Văn phòng Hiệp hội sẽ liên hệ hướng dẫn đóng hội phí.");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không gửi được yêu cầu");
    } finally {
      setSending(false);
    }
  };

  const needsRenewal = m && (m.status !== "ACTIVE" || m.expiringSoon);

  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white">
        <BadgeCheck className="size-6 text-brand-600" aria-hidden="true" /> Tư cách hội viên {ORG.shortName}
      </h1>

      <Async
        state={state}
        onRetry={load}
        errorMessage={error}
        emptyContent={
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="font-bold text-slate-800 dark:text-slate-100">Tài khoản chưa có tư cách hội viên</p>
            <p className="mt-1 text-sm text-slate-500">Nếu đã gửi hồ sơ gia nhập, Ban Quản trị sẽ xét duyệt và liên hệ. Chưa gửi? Đăng ký ngay.</p>
            <Link href="/hoi-vien/gia-nhap" className="mt-4 inline-flex rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white">Đăng ký hội viên</Link>
          </div>
        }
      >
        {m && (
          <>
            {needsRenewal && (
              <div role="status" className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 text-sm ${m.status === "SUSPENDED" ? "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"}`}>
                <span className="flex items-center gap-2">
                  <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
                  {m.status === "SUSPENDED"
                    ? `Tư cách hội viên đang tạm ngưng${m.statusNote ? `: ${m.statusNote}` : ""}.`
                    : m.status === "EXPIRED"
                      ? `Tư cách hội viên đã hết hạn ngày ${formatDate(m.validTo)}.`
                      : `Tư cách hội viên sẽ hết hạn sau ${m.daysLeft} ngày (${formatDate(m.validTo)}).`}
                </span>
                {m.renewalRequestedAt ? (
                  <span className="font-semibold">Đã gửi yêu cầu gia hạn ngày {formatDate(m.renewalRequestedAt)}</span>
                ) : (
                  <button type="button" disabled={sending} onClick={renew} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 disabled:opacity-60">
                    <RefreshCw className="size-4" aria-hidden="true" /> Gửi yêu cầu gia hạn
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-500">Doanh nghiệp hội viên</p>
                    <p className="text-lg font-extrabold">{m.enterpriseName}</p>
                    <p className="text-xs text-slate-500">MST {m.taxCode ?? "—"} · {m.sectorName}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${MEMBERSHIP_STATUS_LABEL[m.status].cls}`}>{MEMBERSHIP_STATUS_LABEL[m.status].label}</span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  <div><dt className="text-xs text-slate-500">Số chứng nhận</dt><dd className="font-mono font-bold">{m.certificateNo ?? "—"}</dd></div>
                  <div><dt className="text-xs text-slate-500">Loại hội viên</dt><dd className="font-semibold">{m.tierName}</dd></div>
                  <div><dt className="text-xs text-slate-500">Hiệu lực</dt><dd className="font-semibold">{formatDate(m.validFrom)} – {formatDate(m.validTo)}</dd></div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href="/portal/membership/chung-nhan" className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-800">
                    <FileBadge className="size-4" aria-hidden="true" /> Xem / in chứng nhận
                  </Link>
                  {m.certificateNo && (
                    <Link href={`/hoi-vien/xac-thuc?so=${m.certificateNo}`} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold dark:border-slate-700">Trang xác thực công khai</Link>
                  )}
                </div>
              </section>

              <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="flex items-center gap-2 font-bold"><Wallet className="size-5 text-brand-600" aria-hidden="true" /> Hội phí</h2>
                <p className="text-2xl font-black">{formatVnd(m.feeAmount)}</p>
                <p className={`text-sm font-semibold ${m.feePaid ? "text-emerald-700" : "text-amber-700"}`}>
                  {m.feePaid ? `Đã ghi nhận ${m.feePaidAt ? `ngày ${formatDate(m.feePaidAt)}` : ""}` : "Chưa ghi nhận đóng phí"}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-slate-500"><CalendarClock className="size-4" aria-hidden="true" /> Liên hệ Văn phòng Hiệp hội để được hướng dẫn đóng hội phí.</p>
              </section>
            </div>
          </>
        )}
      </Async>
    </div>
  );
}
