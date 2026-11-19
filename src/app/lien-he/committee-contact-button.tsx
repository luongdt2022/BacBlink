"use client";

import React from "react";
import { openContactModal, type ContactTopic } from "@/lib/contact-client";

export function CommitteeContactButton({ committeeName }: { committeeName: string }) {
  return (
    <button
      type="button"
      onClick={() => openContactModal("GENERAL", `Tôi muốn liên hệ ${committeeName}: `)}
      className="shrink-0 rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-50 dark:border-slate-700 dark:text-cyan-300 dark:hover:bg-slate-800"
      aria-label={`Liên hệ ${committeeName}`}
    >
      Liên hệ
    </button>
  );
}

/** Nút mở popup liên hệ với chủ đề + lời nhắn gợi ý (trang /lien-he). */
export function TopicButton({ topic, note, label }: { topic: ContactTopic; note: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => openContactModal(topic, note)}
      className="inline-flex rounded-xl bg-brand-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-800"
    >
      {label}
    </button>
  );
}
