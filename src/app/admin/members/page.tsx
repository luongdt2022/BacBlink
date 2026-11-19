"use client";

import React, { useCallback, useEffect, useState } from "react";
import { BadgeCheck, RefreshCw, Save, Star } from "lucide-react";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { Async, type AsyncState } from "@/components/ui/async";
import { useToast } from "@/components/common/toast";
import {
  formatDate,
  formatVnd,
  membershipClient,
  MEMBERSHIP_STATUS_LABEL,
  type FeaturedMember,
  type Membership,
  type MembershipTier,
} from "@/lib/membership-client";

const FILTERS = [
  { key: "", label: "Tất cả" },
  { key: "ACTIVE", label: "Đang hiệu lực" },
  { key: "EXPIRING", label: "Sắp hết hạn (30 ngày)" },
  { key: "EXPIRED", label: "Hết hạn" },
  { key: "SUSPENDED", label: "Tạm ngưng" },
];

/** CR-BACLINK-008 · T-00.BL08.18 · REQ-BL08-MEMBER-ADMIN-008 */
export default function AdminMembersPage() {
  const toast = useToast();
  const [filter, setFilter] = useState("");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Membership[]>([]);
  const [candidates, setCandidates] = useState<FeaturedMember[]>([]);
  const [state, setState] = useState<AsyncState>("loading");
  const [error, setError] = useState<string>();
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [tab, setTab] = useState<"members" | "tiers">("members");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const r = await membershipClient.adminList({
        status: filter === "EXPIRING" ? "ACTIVE" : filter || undefined,
        expiringDays: filter === "EXPIRING" ? 30 : undefined,
        q: q.trim() || undefined,
      });
      setItems(r.items);
      setCandidates(r.verifiedWithoutMembership);
      setState(r.items.length ? "success" : "empty");
    } catch (e) {
      setError(e instanceof Error ? e.message : undefined);
      setState("error");
    }
  }, [filter, q]);

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    membershipClient.tiers().then(setTiers).catch(() => setTiers([]));
  }, []);

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Thao tác thất bại");
    }
  };

  const recordFee = (m: Membership) => {
    const raw = window.prompt(`Số tiền hội phí đã nhận của ${m.enterpriseName} (đồng):`, String(m.feeAmount ?? 0));
    if (raw === null) return;
    const amount = Number(raw.replace(/[^\d]/g, ""));
    if (!Number.isFinite(amount)) return toast.error("Số tiền không hợp lệ");
    const note = window.prompt("Ghi chú (số chứng từ, hình thức chuyển khoản...):", "") ?? undefined;
    void act(() => membershipClient.recordFee(m.id, amount, note), "Đã ghi nhận hội phí");
  };

  const suspend = (m: Membership) => {
    const reason = window.prompt(`Lý do tạm ngưng ${m.enterpriseName} (tối thiểu 5 ký tự):`);
    if (!reason || reason.trim().length < 5) return;
    void act(() => membershipClient.suspend(m.id, reason.trim()), "Đã tạm ngưng tư cách hội viên");
  };

  const btn = "rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800";

  return (
    <div className="space-y-5">
      <AdminBreadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: "Quản Trị Hệ Thống", href: "/admin" }, { label: "Quản lý hội viên" }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white">
          <BadgeCheck className="size-6 text-brand-600" aria-hidden="true" /> Quản lý hội viên
        </h1>
        <div role="tablist" className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(["members", "tiers"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)} className={`rounded-lg px-4 py-1.5 text-sm font-bold ${tab === t ? "bg-white shadow-sm dark:bg-slate-900" : "text-slate-500"}`}>
              {t === "members" ? "Hội viên" : "Hạng & hội phí"}
            </button>
          ))}
        </div>
      </div>

      {tab === "members" ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button key={f.key} type="button" onClick={() => setFilter(f.key)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter === f.key ? "bg-brand-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"}`}>
                {f.label}
              </button>
            ))}
            <form onSubmit={(e) => { e.preventDefault(); void load(); }} className="ml-auto flex gap-2">
              <input aria-label="Tìm hội viên" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên, MST, số chứng nhận" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
              <button type="submit" className="rounded-lg border border-slate-300 p-2 dark:border-slate-700" aria-label="Tìm"><RefreshCw className="size-4" aria-hidden="true" /></button>
            </form>
          </div>

          {candidates.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/40">
              <p className="font-bold text-amber-900 dark:text-amber-200">{candidates.length} doanh nghiệp đã xác thực nhưng chưa có tư cách hội viên</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {candidates.map((c) => (
                  <li key={c.enterpriseId}>
                    <button type="button" className={btn} onClick={() => void act(() => membershipClient.activate(c.enterpriseId), `Đã cấp tư cách hội viên cho ${c.name}`)}>
                      Kích hoạt: {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Async state={state} onRetry={() => void load()} errorMessage={error} emptyTitle="Không có hội viên phù hợp bộ lọc">
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full min-w-[960px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-3 py-2.5">Doanh nghiệp</th>
                    <th className="px-3 py-2.5">Số CN · Hạng</th>
                    <th className="px-3 py-2.5">Hiệu lực</th>
                    <th className="px-3 py-2.5">Hội phí</th>
                    <th className="px-3 py-2.5">Trạng thái</th>
                    <th className="px-3 py-2.5">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((m) => (
                    <tr key={m.id} className="align-top">
                      <td className="px-3 py-2.5">
                        <p className="font-bold">{m.enterpriseName}</p>
                        <p className="text-xs text-slate-500">MST {m.taxCode ?? "—"}</p>
                        {m.renewalRequestedAt && <p className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-800">Yêu cầu gia hạn {formatDate(m.renewalRequestedAt)}</p>}
                      </td>
                      <td className="px-3 py-2.5"><p className="font-mono font-bold">{m.certificateNo}</p><p className="text-xs text-slate-500">{m.tierName}</p></td>
                      <td className="px-3 py-2.5">
                        <p>{formatDate(m.validFrom)} – {formatDate(m.validTo)}</p>
                        {typeof m.daysLeft === "number" && <p className={`text-xs ${m.daysLeft < 0 ? "text-rose-600" : m.daysLeft <= 30 ? "text-amber-600" : "text-slate-500"}`}>{m.daysLeft < 0 ? `Quá hạn ${-m.daysLeft} ngày` : `Còn ${m.daysLeft} ngày`}</p>}
                      </td>
                      <td className="px-3 py-2.5"><p>{formatVnd(m.feeAmount)}</p><p className={`text-xs ${m.feePaid ? "text-emerald-700" : "text-amber-700"}`}>{m.feePaid ? "Đã thu" : "Chưa thu"}</p></td>
                      <td className="px-3 py-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${MEMBERSHIP_STATUS_LABEL[m.status].cls}`}>{MEMBERSHIP_STATUS_LABEL[m.status].label}</span>
                        {m.isFeatured && <p className="mt-1 flex items-center gap-1 text-xs font-bold text-amber-600"><Star className="size-3" aria-hidden="true" /> Tiêu biểu</p>}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          <button type="button" className={btn} onClick={() => recordFee(m)}>Ghi nhận phí</button>
                          <button type="button" className={btn} onClick={() => void act(() => membershipClient.renew(m.id), "Đã gia hạn thêm 1 năm")}>Gia hạn</button>
                          {m.status === "SUSPENDED"
                            ? <button type="button" className={btn} onClick={() => void act(() => membershipClient.restore(m.id), "Đã khôi phục")}>Khôi phục</button>
                            : <button type="button" className={btn} onClick={() => suspend(m)}>Tạm ngưng</button>}
                          {m.status === "ACTIVE" && (
                            <button type="button" className={btn} onClick={() => void act(() => membershipClient.setFeatured(m.id, !m.isFeatured), m.isFeatured ? "Đã bỏ tiêu biểu" : "Đã đánh dấu tiêu biểu")}>
                              {m.isFeatured ? "Bỏ tiêu biểu" : "Đặt tiêu biểu"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Async>
        </>
      ) : (
        <TierEditor tiers={tiers} onSaved={() => membershipClient.tiers().then(setTiers)} />
      )}
    </div>
  );
}

function TierEditor({ tiers, onSaved }: { tiers: MembershipTier[]; onSaved: () => void }) {
  const toast = useToast();
  const [draft, setDraft] = useState<Record<string, MembershipTier>>({});
  useEffect(() => setDraft(Object.fromEntries(tiers.map((t) => [t.code, { ...t }]))), [tiers]);

  const save = async (code: string) => {
    const t = draft[code];
    try {
      await membershipClient.updateTier(code, { name: t.name, audience: t.audience ?? "", annualFee: Number(t.annualFee), joiningFee: Number(t.joiningFee), isActive: t.isActive });
      toast.success(`Đã lưu ${t.name}`);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lưu thất bại");
    }
  };
  const upd = (code: string, k: keyof MembershipTier, v: string | number | boolean) => setDraft((d) => ({ ...d, [code]: { ...d[code], [k]: v } }));
  const inp = "w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900";

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">Hạng và mức phí hiển thị công khai tại trang Hội viên và trong wizard gia nhập. Thay đổi không ảnh hưởng hội viên đã cấp.</p>
      {Object.values(draft).map((t) => (
        <div key={t.code} className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-12 dark:border-slate-800 dark:bg-slate-900">
          <label className="sm:col-span-4 text-xs font-semibold">Tên hạng ({t.code})<input className={inp} value={t.name} onChange={(e) => upd(t.code, "name", e.target.value)} /></label>
          <label className="sm:col-span-4 text-xs font-semibold">Đối tượng<input className={inp} value={t.audience ?? ""} onChange={(e) => upd(t.code, "audience", e.target.value)} /></label>
          <label className="sm:col-span-2 text-xs font-semibold">Hội phí/năm<input inputMode="numeric" className={inp} value={t.annualFee} onChange={(e) => upd(t.code, "annualFee", Number(e.target.value.replace(/\D/g, "")))} /></label>
          <label className="sm:col-span-1 text-xs font-semibold">Lệ phí<input inputMode="numeric" className={inp} value={t.joiningFee} onChange={(e) => upd(t.code, "joiningFee", Number(e.target.value.replace(/\D/g, "")))} /></label>
          <div className="sm:col-span-1 flex items-end">
            <button type="button" onClick={() => void save(t.code)} aria-label={`Lưu ${t.name}`} className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-brand-700 px-2 py-1.5 text-xs font-bold text-white"><Save className="size-3.5" aria-hidden="true" /> Lưu</button>
          </div>
        </div>
      ))}
    </div>
  );
}
