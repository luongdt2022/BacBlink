"use client";

import React, { useEffect, useState } from "react";
import { cmsClient, type CmsFaq } from "@/lib/cms-client";

/** FAQ lấy từ CMS (Admin tự chỉnh) — CR-BACLINK-009. Rỗng/lỗi thì ẩn cả mục, không hiện "0 câu hỏi". */
export function ContactFaq() {
  const [faqs, setFaqs] = useState<CmsFaq[]>([]);
  useEffect(() => {
    cmsClient.faqs().then(setFaqs).catch(() => setFaqs([]));
  }, []);
  if (faqs.length === 0) return null;
  return (
    <section id="cau-hoi-thuong-gap" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 space-y-3 scroll-mt-28">
      <h2 className="type-section-title text-slate-900 dark:text-white">Câu hỏi thường gặp</h2>
      {faqs.map((f) => (
        <details key={f.id} className="group rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <summary className="cursor-pointer list-none font-semibold text-sm flex justify-between gap-3">
            {f.question}
            <span className="text-brand-600 group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
          </summary>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{f.answer}</p>
        </details>
      ))}
    </section>
  );
}
