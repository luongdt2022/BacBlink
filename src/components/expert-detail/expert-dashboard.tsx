"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Bell, CheckCircle2, ClipboardList, FileCheck2, GraduationCap, ShieldCheck } from "lucide-react";
import { Async } from "@/components/ui/async";
import { ExpertPrivateDetail, getMyExpertDetail } from "@/lib/expert-detail";

type Todo = { title: string; description: string; href: string };

export function expertDashboardTodos(detail: ExpertPrivateDetail): Todo[] {
  const todos: Todo[] = [];
  if (!detail.phone || !detail.email) todos.push({ title: "Bổ sung thông tin liên hệ", description: "Cập nhật số điện thoại và email công tác để Ban Thư ký & Cố vấn Kỹ thuật BACLINK có thể liên hệ.", href: "/portal/expert/profile/edit" });
  if (!detail.activeDocumentTypes.length) todos.push({ title: "Tải chứng từ xác minh", description: "Hồ sơ chưa có chứng từ đang hiệu lực để đối soát.", href: "/portal/expert/profile/edit" });
  if (!detail.publicProfile.publications.length && !detail.publicProfile.patents.length) todos.push({ title: "Rà soát công trình tiêu biểu", description: "Bổ sung công bố hoặc sáng chế để làm rõ năng lực chuyên môn.", href: "/portal/expert/profile/edit" });
  return todos;
}

function statusLabel(status: string) {
  if (status === "PENDING_REVIEW") return "Đang thẩm định";
  if (status === "CHANGES_REQUESTED") return "Cần bổ sung theo yêu cầu thẩm định";
  if (status === "APPROVED") return "Đã xác thực";
  return "Đang hoàn thiện";
}

function DashboardContent({ detail }: { detail: ExpertPrivateDetail }) {
  const todos = expertDashboardTodos(detail);
  const percentage = Math.round(((3 - todos.length) / 3) * 100);
  const profile = detail.publicProfile;
  return <div className="mx-auto max-w-6xl space-y-6">
    <section className="overflow-hidden rounded-3xl workspace-banner p-6 text-white shadow-xl shadow-brand-950/10 sm:p-8">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-label font-semibold text-brand-100 border border-white/20"><GraduationCap className="h-3.5 w-3.5 text-brand-200" />Dashboard chuyên gia</div>
      <h1 className="mt-3 font-bold type-page-title">Xin chào, {profile.fullName}!</h1>
      <p className="mt-2 max-w-2xl text-body leading-relaxed text-brand-100">Theo dõi tình trạng hồ sơ, việc cần làm và thông báo thẩm định tại một nơi.</p>
    </section>
    <div className="grid gap-6 xl:grid-cols-3">
      <section className="rounded-surface border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 dark:bg-slate-900 dark:border-slate-700">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-body font-bold tracking-wide text-slate-500 dark:text-slate-300">TRẠNG THÁI HỒ SƠ</p><h2 className="mt-1 flex items-center gap-2 font-bold text-slate-950 text-card-title dark:text-slate-100">{todos.length ? <AlertTriangle className="h-5 w-5 text-amber-600" /> : <CheckCircle2 className="h-5 w-5 text-emerald-600" />}{todos.length ? "Hồ sơ cần bổ sung" : "Hồ sơ đã đủ thông tin cốt lõi"}</h2><p className="mt-1 text-body text-slate-600 dark:text-slate-300">{statusLabel(detail.status)}</p></div><span className={`rounded-full px-3 py-1.5 text-label font-bold ${todos.length ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200" : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"}`}>{percentage}% hoàn thiện</span></div>
        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={todos.length ? "h-full rounded-full bg-amber-500" : "h-full rounded-full bg-emerald-500"} style={{ width: `${percentage}%` }} /></div>
        <h3 className="mt-7 flex items-center gap-2 font-bold text-slate-900 text-card-title dark:text-slate-100"><ClipboardList className="h-4 w-4 text-brand-700 dark:text-brand-200" />Việc cần làm</h3>
        {todos.length ? <div className="mt-2 divide-y divide-slate-100">{todos.map(todo => <div key={todo.title} className="flex flex-wrap items-center gap-3 py-4"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /><div className="min-w-48 flex-1"><p className="text-body font-bold text-slate-900 dark:text-slate-100">{todo.title}</p><p className="mt-1 text-body text-slate-600 dark:text-slate-300">{todo.description}</p></div><Link href={todo.href} className="rounded-control bg-brand-50 px-3 py-2 text-label font-semibold text-brand-700 hover:bg-brand-100 focus-ring min-h-11 inline-flex items-center justify-center dark:bg-brand-950 dark:text-brand-200">Bổ sung</Link></div>)}</div> : <div className="mt-3 rounded-xl bg-emerald-50 p-4 text-label text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">Không có việc cần làm ngay. Anh/chị vẫn có thể cập nhật thành tựu mới trong hồ sơ.</div>}
      </section>
      <aside className="space-y-6"><section className="rounded-surface border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-700"><p className="text-body font-bold tracking-wide text-slate-500 dark:text-slate-300">THAO TÁC HỒ SƠ</p><div className="mt-4 space-y-3"><Link href={profile.expertCode ? `/experts/${profile.expertCode}` : "/portal/expert/profile/edit"} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-slate-200 p-4 hover:border-brand-800 focus-ring min-h-11 dark:border-slate-700"><ShieldCheck className="h-5 w-5 text-brand-700 dark:text-brand-200" /><p className="mt-2 text-body font-bold">Xem hồ sơ của tôi</p><p className="mt-1 text-body text-slate-600 dark:text-slate-300">Xem giao diện công khai thực tế của chuyên gia.</p></Link><Link href="/portal/expert/profile/edit" className="block rounded-xl border border-slate-200 p-4 hover:border-brand-800 focus-ring min-h-11 dark:border-slate-700"><FileCheck2 className="h-5 w-5 text-brand-700 dark:text-brand-200" /><p className="mt-2 text-body font-bold">Chỉnh sửa / Bổ sung</p><p className="mt-1 text-body text-slate-600 dark:text-slate-300">Cập nhật thông tin, lưu nháp và nộp lại.</p></Link></div></section><section className="rounded-surface border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-700"><p className="flex items-center gap-2 text-body font-bold tracking-wide text-slate-500 dark:text-slate-300"><Bell className="h-4 w-4 text-brand-700 dark:text-brand-200" />THÔNG BÁO</p>{detail.status === "CHANGES_REQUESTED" ? <div className="mt-4 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-3 text-label text-amber-950 dark:bg-amber-950/60 dark:text-amber-200">Hồ sơ có yêu cầu bổ sung. Hãy xem các việc cần làm và cập nhật lại hồ sơ.</div> : <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-5 text-center text-label text-slate-500 dark:text-slate-300 dark:border-slate-700">Chưa có thông báo thẩm định mới.</div>}</section></aside>
    </div>
  </div>;
}

export function ExpertDashboard() {
  const [state, setState] = useState<"loading" | "error" | "success">("loading");
  const [detail, setDetail] = useState<ExpertPrivateDetail | null>(null);
  const load = () => { setState("loading"); getMyExpertDetail().then(data => { setDetail(data); setState("success"); }).catch(() => setState("error")); };
  useEffect(load, []);
  return <Async state={state} onRetry={load} loadingText="Đang tải dashboard chuyên gia..." errorMessage="Không thể tải dashboard chuyên gia. Vui lòng thử lại.">{detail && <DashboardContent detail={detail} />}</Async>;
}
