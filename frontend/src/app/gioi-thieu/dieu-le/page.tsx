"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Async, type AsyncState } from "@/components/ui/async";
import { cmsClient, type CmsDocument } from "@/lib/cms-client";
import { openContactModal } from "@/lib/contact-client";
import { DocumentList } from "@/components/cms/cms-document-list";

/** Điều lệ & quy chế: danh sách tệp tải về lấy từ CMS (loại DIEU_LE). */
export default function DieuLePage() {
  const [items, setItems] = useState<CmsDocument[]>([]);
  const [state, setState] = useState<AsyncState>("loading");

  const load = useCallback(() => {
    setState("loading");
    cmsClient
      .documents({ type: "DIEU_LE" })
      .then((docs) => {
        setItems(docs);
        setState(docs.length ? "success" : "empty");
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
            <span className="text-white" aria-current="page">Điều lệ & quy chế</span>
          </nav>
          <h1 className="type-page-title text-white">Điều lệ & quy chế</h1>
          <p className="text-sm text-white/85">Điều lệ và quy chế hoạt động của Hiệp hội, tải về ở định dạng tệp gốc.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Async
          state={state}
          onRetry={load}
          emptyTitle="Điều lệ Hiệp hội đang được cập nhật"
          emptyMessage="Vui lòng liên hệ Văn phòng Hiệp hội để nhận bản điều lệ hiện hành."
          emptyAction={{
            label: "Liên hệ Văn phòng",
            onClick: () => openContactModal("GENERAL", "Tôi cần bản điều lệ và quy chế hiện hành: "),
          }}
        >
          <h2 className="type-section-title mb-4 text-slate-900 dark:text-white">Văn bản tải về</h2>
          <DocumentList docs={items} showType={false} />
        </Async>
      </div>
    </main>
  );
}
