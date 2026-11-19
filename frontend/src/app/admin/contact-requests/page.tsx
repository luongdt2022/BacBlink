"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Inbox, RefreshCw } from "lucide-react";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { Async, type AsyncState } from "@/components/ui/async";
import { useToast } from "@/components/common/toast";
import {
  contactTopicLabel,
  listContactRequests,
  updateContactStatus,
  type ContactRequestRecord,
} from "@/lib/contact-client";

const STATUS: Record<ContactRequestRecord["status"], { label: string; cls: string }> = {
  NEW: { label: "Mới", cls: "bg-amber-100 text-amber-800" },
  IN_PROGRESS: { label: "Đang xử lý", cls: "bg-blue-100 text-blue-800" },
  DONE: { label: "Đã xử lý", cls: "bg-emerald-100 text-emerald-800" },
  SPAM: { label: "Rác", cls: "bg-slate-200 text-slate-600" },
};

/** CR-BACLINK-008 · API-BL08-CONTACT-006 — Hộp thư liên hệ của Ban Quản trị. */
export default function AdminContactRequestsPage() {
  const toast = useToast();
  const [filter, setFilter] = useState<string>("NEW");
  const [rows, setRows] = useState<ContactRequestRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<AsyncState>("loading");
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setState("loading");
    try {
      const res = await listContactRequests(filter || undefined, 1, 50);
      setRows(res.data);
      setTotal(res.total);
      setState(res.data.length ? "success" : "empty");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được dữ liệu");
      setState("error");
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeStatus = async (id: string, status: ContactRequestRecord["status"]) => {
    // Ghi chú phản hồi hiển thị cho người gửi tại "Yêu cầu của tôi" (bỏ trống nếu không cần).
    const note = status === "IN_PROGRESS" || status === "DONE" ? window.prompt("Ghi chú phản hồi cho người gửi (không bắt buộc):", "") ?? undefined : undefined;
    try {
      await updateContactStatus(id, status, note?.trim());
      toast.success(`Đã chuyển sang "${STATUS[status].label}"`);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cập nhật thất bại");
    }
  };

  return (
    <div className="space-y-5">
      <AdminBreadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: "Quản Trị Hệ Thống", href: "/admin" }, { label: "Hộp thư liên hệ" }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white">
          <Inbox className="size-6 text-brand-600" aria-hidden="true" /> Hộp thư liên hệ
          {state === "success" && <span className="text-sm font-semibold text-slate-500">({total})</span>}
        </h1>
        <div className="flex items-center gap-2">
          <select
            aria-label="Lọc trạng thái"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">Tất cả</option>
            {Object.entries(STATUS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button type="button" onClick={() => void load()} className="rounded-lg border border-slate-300 p-2 dark:border-slate-700" aria-label="Tải lại">
            <RefreshCw className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Async state={state} onRetry={() => void load()} errorMessage={error} emptyTitle="Không có yêu cầu nào" emptyMessage="Yêu cầu gửi từ trang Liên hệ và popup sẽ hiển thị tại đây.">
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {r.fullName}
                    {r.organization && <span className="font-normal text-slate-500"> · {r.organization}</span>}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(r.createdAt).toLocaleString("vi-VN")} · {contactTopicLabel(r.topic)}
                    {r.sourcePath && <> · từ trang <code>{r.sourcePath}</code></>}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">{r.message}</p>
              {r.handledNote && <p className="mt-1 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">Phản hồi: {r.handledNote}</p>}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex flex-wrap gap-3">
                  {r.phone && <a href={`tel:${r.phone}`} className="font-semibold text-brand-700 hover:underline">{r.phone}</a>}
                  {r.email && <a href={`mailto:${r.email}`} className="font-semibold text-brand-700 hover:underline">{r.email}</a>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(STATUS) as ContactRequestRecord["status"][])
                    .filter((s) => s !== r.status)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => void changeStatus(r.id, s)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        {STATUS[s].label}
                      </button>
                    ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Async>
    </div>
  );
}
