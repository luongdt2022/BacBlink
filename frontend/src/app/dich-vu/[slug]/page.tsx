import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, HelpCircle, Target, Users } from "lucide-react";
import { BUSINESS_SERVICES, getService } from "@/lib/constants/services";
import { BACLINK_COMMITTEES, ORG } from "@/lib/constants/organization";
import { ServiceRegisterButton } from "./service-register-button";

/** Slug ngoài danh sách 8 dịch vụ → 404 thật (không phải soft-404). */
export const dynamicParams = false;

export function generateStaticParams() {
  return BUSINESS_SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const s = getService((await params).slug);
  return s ? { title: `${s.title} | ${ORG.shortName}`, description: s.summary } : {};
}

function Block({ icon: Icon, title, items }: { icon: React.ComponentType<{ className?: string }>; title: string; items: readonly string[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white"><Icon className="size-5 text-brand-600" aria-hidden="true" /> {title}</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">{items.map((i) => <li key={i}>{i}</li>)}</ul>
    </section>
  );
}

/** CR-BACLINK-010 · REQ-BL10-SERVICE-001 — mẫu 4 câu hỏi theo góp ý khách hàng. */
export default async function DichVuDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const service = getService((await params).slug);
  if (!service) notFound();
  const committee = BACLINK_COMMITTEES.find((c) => c.code === service.committeeCode);

  return (
    <main className="min-h-screen bg-slate-50 pb-14 dark:bg-slate-950">
      <section className="workspace-banner px-4 py-9 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-2">
          <nav aria-label="Breadcrumb" className="text-xs text-white/70">
            <Link href="/" className="hover:text-white">Trang chủ</Link> / <Link href="/dich-vu" className="hover:text-white">Dịch vụ</Link> / <span className="text-white">{service.title}</span>
          </nav>
          <h1 className="type-page-title text-white">{service.title}</h1>
          <p className="max-w-3xl text-sm text-white/85">{service.summary}</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Block icon={Users} title="Dành cho ai?" items={service.forWhom} />
          <Block icon={HelpCircle} title="Giải quyết vấn đề gì?" items={service.problems} />
        </div>
        <Block icon={Target} title={`${ORG.shortName} hỗ trợ như thế nào?`} items={service.support} />

        <section aria-labelledby="dang-ky" className="rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-900 dark:bg-slate-900">
          <h2 id="dang-ky" className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white"><CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" /> Đăng ký ở đâu?</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <ServiceRegisterButton title={service.title} />
            {service.selfService.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">{l.label}</Link>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
            Yêu cầu được chuyển tới{" "}
            {committee ? <Link href={`/gioi-thieu/co-cau-to-chuc/${committee.code.toLowerCase()}`} className="font-bold underline">{committee.name}</Link> : "Văn phòng Hiệp hội"}.
          </p>
        </section>

        <nav aria-label="Dịch vụ khác" className="flex flex-wrap gap-2 pt-2">
          {BUSINESS_SERVICES.filter((s) => s.slug !== service.slug).map((s) => (
            <Link key={s.slug} href={`/dich-vu/${s.slug}`} className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{s.title}</Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
