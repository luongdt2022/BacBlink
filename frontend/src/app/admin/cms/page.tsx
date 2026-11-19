"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FilePlus2, Newspaper, Pencil, Trash2, Upload } from "lucide-react";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { Async, type AsyncState } from "@/components/ui/async";
import { useToast } from "@/components/common/toast";
import { uploadLegalDoc } from "@/lib/membership-client";
import { BACLINK_COMMITTEES } from "@/lib/constants/organization";
import { CMS_CATEGORIES, DOC_TYPE_LABEL, cmsClient } from "@/lib/cms-client";

type Kind = "articles" | "documents" | "media" | "faqs" | "partners";
const TABS: { key: Kind; label: string }[] = [
  { key: "articles", label: "Bài viết" },
  { key: "documents", label: "Tài liệu" },
  { key: "media", label: "Thư viện" },
  { key: "faqs", label: "Câu hỏi thường gặp" },
  { key: "partners", label: "Đối tác" },
];

const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900";
const label = "block text-xs font-semibold text-slate-600 dark:text-slate-300";

/** Tải tệp lên kho tệp của cổng; trả về URL (dùng chung endpoint upload hiện có). */
function FileField({ value, onChange, accept, caption }: { value: string; onChange: (url: string) => void; accept: string; caption: string }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-1">
      <span className={label}>{caption}</span>
      <div className="flex gap-2">
        <input className={input} value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… hoặc tải tệp lên" aria-label={caption} />
        <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-bold dark:border-slate-700">
          <Upload className="size-4" aria-hidden="true" /> {busy ? "Đang tải…" : "Tải lên"}
          <input
            type="file"
            accept={accept}
            className="hidden"
            aria-label={`Tải tệp: ${caption}`}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setBusy(true);
              try { onChange(await uploadLegalDoc(f)); } catch (err) { toast.error(err instanceof Error ? err.message : "Tải lên thất bại"); } finally { setBusy(false); }
            }}
          />
        </label>
      </div>
    </div>
  );
}

function ArticleForm({ initial, onDone }: { initial: Partial<ArticleDraft> & { id?: string }; onDone: () => void }) {
  const toast = useToast();
  const [d, setD] = useState<ArticleDraft>({ title: "", categorySlug: "hoat-dong", committeeCode: "", excerpt: "", body: "", thumbnailUrl: "", author: "", location: "", sourceUrl: "", tags: "", isFeatured: false, publish: false, ...initial });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof ArticleDraft>(k: K, v: ArticleDraft[K]) => setD((p) => ({ ...p, [k]: v }));

  const save = async (publish: boolean) => {
    if (!d.title.trim()) return toast.error("Vui lòng nhập tiêu đề");
    setSaving(true);
    try {
      await cmsClient.admin.save("articles", initial.id ?? null, {
        title: d.title.trim(), categorySlug: d.categorySlug, committeeCode: d.committeeCode || null, excerpt: d.excerpt || null, body: d.body,
        thumbnailUrl: d.thumbnailUrl || null, author: d.author || null, location: d.location || null, sourceUrl: d.sourceUrl || null,
        tags: d.tags.split(",").map((t) => t.trim()).filter(Boolean), isFeatured: d.isFeatured, publish,
      });
      toast.success(publish ? "Đã xuất bản bài viết" : "Đã lưu nháp");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-brand-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="font-extrabold">{initial.id ? "Sửa bài viết" : "Bài viết mới"}</h2>
      <label className={label}>Tiêu đề *<input className={input} value={d.title} onChange={(e) => set("title", e.target.value)} /></label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={label}>Danh mục
          <select className={input} value={d.categorySlug} onChange={(e) => set("categorySlug", e.target.value)}>
            {CMS_CATEGORIES.filter((c) => c.slug !== "all").map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
        </label>
        <label className={label}>Ban liên quan
          <select className={input} value={d.committeeCode} onChange={(e) => set("committeeCode", e.target.value)}>
            <option value="">— Không gắn ban —</option>
            {BACLINK_COMMITTEES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </label>
      </div>
      <label className={label}>Tóm tắt<textarea className={`${input} min-h-16`} value={d.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></label>
      <label className={label}>Nội dung (mỗi đoạn cách nhau một dòng trống)<textarea className={`${input} min-h-48`} value={d.body} onChange={(e) => set("body", e.target.value)} /></label>
      <FileField value={d.thumbnailUrl} onChange={(v) => set("thumbnailUrl", v)} accept="image/*" caption="Ảnh bìa" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className={label}>Tác giả / nguồn<input className={input} value={d.author} onChange={(e) => set("author", e.target.value)} /></label>
        <label className={label}>Địa điểm<input className={input} value={d.location} onChange={(e) => set("location", e.target.value)} /></label>
        <label className={label}>Liên kết gốc<input className={input} value={d.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} /></label>
      </div>
      <label className={label}>Thẻ (cách nhau bởi dấu phẩy)<input className={input} value={d.tags} onChange={(e) => set("tags", e.target.value)} /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} /> Bài nổi bật (hiện đầu trang Tin tức)</label>
      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" disabled={saving} onClick={() => void save(true)} className="rounded-xl bg-brand-700 px-5 py-2 text-sm font-bold text-white disabled:opacity-60">Xuất bản</button>
        <button type="button" disabled={saving} onClick={() => void save(false)} className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-bold dark:border-slate-700">Lưu nháp</button>
        <button type="button" onClick={onDone} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500">Hủy</button>
      </div>
    </div>
  );
}

interface ArticleDraft { title: string; categorySlug: string; committeeCode: string; excerpt: string; body: string; thumbnailUrl: string; author: string; location: string; sourceUrl: string; tags: string; isFeatured: boolean; publish: boolean }

type Generic = Record<string, string | number | boolean | null | undefined>;

/** Form đơn giản dùng chung cho tài liệu / thư viện / FAQ / đối tác. */
function SimpleForm({ kind, initial, onDone }: { kind: Exclude<Kind, "articles">; initial: Generic; onDone: () => void }) {
  const toast = useToast();
  const [d, setD] = useState<Generic>(initial);
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string | number | boolean) => setD((p) => ({ ...p, [k]: v }));
  const str = (k: string) => String(d[k] ?? "");

  const save = async () => {
    setSaving(true);
    try {
      // Chuỗi rỗng → null (ngày ban hành, ban, mô tả... để trống); máy chủ kiểm tra trường bắt buộc.
      const payload = Object.fromEntries(Object.entries(d).filter(([k]) => k !== "id").map(([k, v]) => [k, v === "" ? null : v]));
      await cmsClient.admin.save(kind, (initial.id as string) ?? null, payload);
      toast.success("Đã lưu");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-brand-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      {kind === "documents" && (
        <>
          <label className={label}>Loại tài liệu
            <select className={input} value={str("docType")} onChange={(e) => set("docType", e.target.value)}>
              {Object.entries(DOC_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className={label}>Tiêu đề *<input className={input} value={str("title")} onChange={(e) => set("title", e.target.value)} /></label>
          <label className={label}>Mô tả<textarea className={`${input} min-h-16`} value={str("description")} onChange={(e) => set("description", e.target.value)} /></label>
          <FileField value={str("fileUrl")} onChange={(v) => set("fileUrl", v)} accept="application/pdf,.doc,.docx,.xls,.xlsx" caption="Tệp tài liệu" />
          <div className="grid grid-cols-2 gap-3">
            <label className={label}>Ngày ban hành<input type="date" className={input} value={str("issuedOn")} onChange={(e) => set("issuedOn", e.target.value || "")} /></label>
            <label className={label}>Ban liên quan
              <select className={input} value={str("committeeCode")} onChange={(e) => set("committeeCode", e.target.value)}>
                <option value="">— Không —</option>
                {BACLINK_COMMITTEES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </label>
          </div>
        </>
      )}
      {kind === "media" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <label className={label}>Loại
              <select className={input} value={str("kind")} onChange={(e) => set("kind", e.target.value)}><option value="IMAGE">Ảnh</option><option value="VIDEO">Video</option></select>
            </label>
            <label className={label}>Album<input className={input} value={str("album")} onChange={(e) => set("album", e.target.value)} placeholder="Tên sự kiện / album" /></label>
          </div>
          <label className={label}>Chú thích<input className={input} value={str("title")} onChange={(e) => set("title", e.target.value)} /></label>
          <FileField value={str("url")} onChange={(v) => set("url", v)} accept="image/*" caption={str("kind") === "VIDEO" ? "Liên kết video (YouTube/…)" : "Ảnh"} />
        </>
      )}
      {kind === "faqs" && (
        <>
          <label className={label}>Câu hỏi *<input className={input} value={str("question")} onChange={(e) => set("question", e.target.value)} /></label>
          <label className={label}>Trả lời *<textarea className={`${input} min-h-24`} value={str("answer")} onChange={(e) => set("answer", e.target.value)} /></label>
        </>
      )}
      {kind === "partners" && (
        <>
          <label className={label}>Tên đối tác *<input className={input} value={str("name")} onChange={(e) => set("name", e.target.value)} /></label>
          <FileField value={str("logoUrl")} onChange={(v) => set("logoUrl", v)} accept="image/*" caption="Logo" />
          <label className={label}>Website<input className={input} value={str("website")} onChange={(e) => set("website", e.target.value)} /></label>
        </>
      )}
      <div className="grid grid-cols-2 gap-3">
        <label className={label}>Thứ tự<input type="number" className={input} value={Number(d.sortOrder ?? 0)} onChange={(e) => set("sortOrder", Number(e.target.value))} /></label>
        <label className="mt-6 flex items-center gap-2 text-sm"><input type="checkbox" checked={d.isPublic !== false} onChange={(e) => set("isPublic", e.target.checked)} /> Hiển thị công khai</label>
      </div>
      <div className="flex gap-2">
        <button type="button" disabled={saving} onClick={() => void save()} className="rounded-xl bg-brand-700 px-5 py-2 text-sm font-bold text-white disabled:opacity-60">Lưu</button>
        <button type="button" onClick={onDone} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500">Hủy</button>
      </div>
    </div>
  );
}

/** CR-BACLINK-009 · T-01.BL09.11 — Quản trị CMS: bài viết, tài liệu, thư viện, FAQ, đối tác. */
export default function AdminCmsPage() {
  const toast = useToast();
  const [tab, setTab] = useState<Kind>("articles");
  const [rows, setRows] = useState<unknown[]>([]);
  const [state, setState] = useState<AsyncState>("loading");
  const [editing, setEditing] = useState<null | { id?: string; data: Generic }>(null);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const r = await cmsClient.admin.list(tab);
      setRows(r);
      setState(r.length ? "success" : "empty");
    } catch {
      setState("error");
    }
  }, [tab]);
  useEffect(() => { setEditing(null); void load(); }, [load]);

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Xóa “${name}”? Thao tác không hoàn tác được.`)) return;
    try { await cmsClient.admin.remove(tab, id); toast.success("Đã xóa"); void load(); } catch (e) { toast.error(e instanceof Error ? e.message : "Xóa thất bại"); }
  };

  const edit = async (row: Generic) => {
    if (tab === "articles") {
      try {
        const a = await cmsClient.admin.article(String(row.id));
        setEditing({
          id: a.id,
          data: { title: a.title, categorySlug: a.categorySlug, committeeCode: a.committeeCode ?? "", excerpt: a.excerpt ?? "",
            body: a.body.markdown ?? [a.body.lead, ...(a.body.paragraphs ?? [])].filter(Boolean).join("\n\n"),
            thumbnailUrl: a.thumbnailUrl ?? "", author: a.author ?? "", location: a.location ?? "", sourceUrl: a.sourceUrl ?? "", tags: a.tags.join(", "), isFeatured: a.isFeatured },
        });
      } catch (e) { toast.error(e instanceof Error ? e.message : "Không mở được bài viết"); }
      return;
    }
    setEditing({ id: String(row.id), data: row });
  };

  const title = (r: Generic) => String(r.title ?? r.question ?? r.name ?? "");
  const sub = useMemo(() => (r: Generic) =>
    tab === "articles" ? `${r.status === "PUBLISHED" ? "Đã xuất bản" : "Nháp"} · ${r.categorySlug}`
    : tab === "documents" ? DOC_TYPE_LABEL[String(r.docType)] ?? String(r.docType)
    : tab === "media" ? `${r.kind === "VIDEO" ? "Video" : "Ảnh"} · ${r.album}`
    : r.isPublic === false ? "Đang ẩn" : "Công khai", [tab]);

  return (
    <div className="space-y-5">
      <AdminBreadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: "Quản Trị Hệ Thống", href: "/admin" }, { label: "Quản lý nội dung" }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white"><Newspaper className="size-6 text-brand-600" aria-hidden="true" /> Quản lý nội dung</h1>
        <button type="button" onClick={() => setEditing({ data: tab === "media" ? { kind: "IMAGE", album: "" } : tab === "documents" ? { docType: "BAO_CAO_NGANH" } : {} })} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-sm font-bold text-white">
          <FilePlus2 className="size-4" aria-hidden="true" /> Thêm mới
        </button>
      </div>
      <div role="tablist" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} type="button" onClick={() => setTab(t.key)} className={`rounded-full px-4 py-1.5 text-sm font-bold ${tab === t.key ? "bg-brand-700 text-white" : "bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"}`}>{t.label}</button>
        ))}
      </div>

      {editing && (tab === "articles"
        ? <ArticleForm initial={{ ...(editing.data as Partial<ArticleDraft>), id: editing.id }} onDone={() => { setEditing(null); void load(); }} />
        : <SimpleForm kind={tab} initial={{ ...editing.data, id: editing.id }} onDone={() => { setEditing(null); void load(); }} />)}

      <Async state={state} onRetry={() => void load()} emptyTitle="Chưa có nội dung" emptyMessage="Bấm “Thêm mới” để tạo mục đầu tiên.">
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {(rows as Generic[]).map((r) => (
            <li key={String(r.id)} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{title(r)}</p>
                <p className="text-xs text-slate-500">{sub(r)}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button type="button" aria-label={`Sửa ${title(r)}`} onClick={() => void edit(r)} className="rounded-lg border border-slate-300 p-2 dark:border-slate-700"><Pencil className="size-4" aria-hidden="true" /></button>
                <button type="button" aria-label={`Xóa ${title(r)}`} onClick={() => void remove(String(r.id), title(r))} className="rounded-lg border border-rose-300 p-2 text-rose-600"><Trash2 className="size-4" aria-hidden="true" /></button>
              </div>
            </li>
          ))}
        </ul>
      </Async>
    </div>
  );
}
