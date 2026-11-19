"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Async, type AsyncState } from "@/components/ui/async";
import { cmsClient, type CmsDocument } from "@/lib/cms-client";
import { openContactModal } from "@/lib/contact-client";
import { DocumentList, sortByIssuedDesc } from "@/components/cms/cms-document-list";

/** Thành tựu & báo cáo thường niên: loại BAO_CAO_THUONG_NIEN, mới nhất trước. */
export default function BaoCaoThuongNienPage() {
  const [items, setItems] = useState<CmsDocument[]>([]);
  const [state, setState] = useState<AsyncState>("loading");

  const load = useCallback(() => {
    setState("loading");
    cmsClient
      .documents({ type: "BAO_CAO_THUONG_NIEN" })
      .then((docs) => {
        const sorted = sortByIssuedDesc(docs);
        setItems(sorted);
        setState(sorted.length ? "success" : "empty");
      })
      .catch(() => setState("error"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="workspace-banner px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-3">
          <nav aria-label="Breadcrumb" className="text-xs text-white/70">
            <Link href="/" className="hover:text-white">Trang chủ</Link> /{" "}
            <Link href="/gioi-thieu" className="hover:text-white">Về BACLINK</Link> /{" "}
            <span className="text-white" aria-current="page">Thành tựu & báo cáo thường niên</span>
          </nav>
          <h1 className="type-page-title text-white">Thành tựu & báo cáo thường niên</h1>
          <p className="text-sm text-white/85">Báo cáo hoạt động thường niên và các thành tựu tiêu biểu của Hiệp hội.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Async
          state={state}
          onRetry={load}
          emptyTitle="Báo cáo thường niên đang được cập nhật"
          emptyMessage="Vui lòng quay lại sau hoặc liên hệ Văn phòng Hiệp hội để nhận báo cáo."
          emptyAction={{
            label: "Liên hệ Văn phòng",
            onClick: () => openContactModal("GENERAL", "Tôi cần báo cáo thường niên của Hiệp hội: "),
          }}
        >
          <h2 className="type-section-title mb-4 text-slate-900 dark:text-white">Báo cáo thường niên</h2>
          <DocumentList docs={items} showType={false} />
        </Async>
      </div>
    </main>
  );
}
