"use client";

import React, { useCallback, useEffect, useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { Async, type AsyncState } from "@/components/ui/async";
import { CONTACT_STATUS_LABEL, contactTopicLabel, listMyContactRequests, openContactModal, type ContactRequestRecord } from "@/lib/contact-client";

/** CR-BACLINK-010 · REQ-BL10-MYREQ-003 — "Yêu cầu & kiến nghị của tôi": theo dõi tình trạng xử lý. */
export default function MyRequestsPage() {
  const [rows, setRows] = useState<ContactRequestRecord[]>([]);
  const [state, setState] = useState<AsyncState>("loading");
  const load = useCallback(() => {
    setState("loading");
    listMyContactRequests().then((r) => { setRows(r); setState(r.length ? "success" : "empty"); }).catch(() => setState("error"));
  }, []);
  useEffect(load, [load]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white">
          <MessageSquare className="size-6 text-brand-600" aria-hidden="true" /> Yêu cầu & kiến nghị của tôi
        </h1>
        <button type="button" onClick={() => openContactModal("POLICY")} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-sm font-bold text-white">
          <Plus className="size-4" aria-hidden="true" /> Gửi yêu cầu mới
        </button>
      </div>
      <Async
        state={state}
        onRetry={load}
        errorMessage="Không tải được danh sách yêu cầu."
        emptyTitle="Bạn chưa gửi yêu cầu nào"
        emptyMessage="Câu hỏi, vướng mắc chính sách, đăng ký dịch vụ bạn gửi khi đã đăng nhập sẽ hiển thị tại đây cùng tình trạng xử lý."
      >
        <ul className="space-y-3">
          {rows.map((r) => {
            const st = CONTACT_STATUS_LABEL[r.status];
            return (
              <li key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold">{contactTopicLabel(r.topic)}</p>
                    <p className="text-xs text-slate-500">Gửi ngày {new Date(r.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${st.cls}`}>{st.label}</span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">{r.message}</p>
                <p className="mt-2 text-xs text-slate-500">{st.hint}</p>
                {r.handledNote && (
                  <p className="mt-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-900 dark:bg-slate-800 dark:text-slate-100">
                    <span className="font-bold">Phản hồi của Văn phòng:</span> {r.handledNote}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Async>
    </div>
  );
}
