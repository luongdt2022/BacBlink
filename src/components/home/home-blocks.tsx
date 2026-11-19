"use client";

/**
 * Các khối trang chủ BACLINK — CR-BACLINK-008 · REQ-BL08-HOME-003 / UI-BL08-HOME-002.
 * Thứ tự theo góp ý khách hàng (260717 §4): Thông điệp → Bạn đang cần gì? → Tìm DN/NCC →
 * Cơ hội KD mới nhất → Dịch vụ → Sự kiện & đào tạo → Chính sách & thông tin ngành → Quyền lợi & Gia nhập.
 * Mọi khối dữ liệu đều lấy từ API/nguồn thật; khối rỗng thì ẩn (không hiện "0").
 */
import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Cpu,
  Globe2,
  GraduationCap,
  Handshake,
  Leaf,
  MapPin,
  Megaphone,
  Scale,
  Search,
  ShoppingCart,
  Ticket,
  UserPlus,
} from "lucide-react";
import { getActiveSectors, type SectorOption } from "@/lib/master-data-client";
import { portalClient, type TechmartEvent } from "@/lib/portal-client";
import { fetchLmsCatalog, type LmsMaterialCardDto } from "@/lib/api/lms";
import { fetchEnterprises } from "@/lib/enterprise-client";
import { cmsClient, categoryLabel, type CmsArticleSummary, type CmsPartner } from "@/lib/cms-client";
import { openContactModal, type ContactTopic } from "@/lib/contact-client";
import { JOIN_HREF } from "@/lib/constants/navigation";
import { ORG } from "@/lib/constants/organization";
import { tr } from "@/lib/constants/i18n-public";
import { useOptionalLang } from "@/components/common/i18n-provider";
import { BUSINESS_SERVICES } from "@/lib/constants/services";
import { MEMBER_BENEFITS } from "@/lib/constants/membership";
import { MEMBER_LOGOS } from "@/lib/constants/member-logos";
import { membershipClient } from "@/lib/membership-client";

type Icon = React.ComponentType<{ className?: string }>;

function SectionHead({ eyebrow, title, desc, moreHref, moreLabel }: { eyebrow: string; title: string; desc?: string; moreHref?: string; moreLabel?: string }) {
  const lang = useOptionalLang();
  title = tr(lang, title);
  moreLabel = moreLabel ? tr(lang, moreLabel) : moreLabel;
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-cyan-400">{eyebrow}</span>
        <h2 className="mt-1 type-section-title text-text-primary dark:text-white">{title}</h2>
        {desc && <p className="mt-1.5 text-sm text-text-secondary dark:text-slate-300 max-w-2xl">{desc}</p>}
      </div>
      {moreHref && (
        <Link href={moreHref} className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline dark:text-cyan-300 shrink-0">
          {moreLabel ?? "Xem tất cả"} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- 2. Bạn đang cần gì? */
type Need = { label: string; desc: string; icon: Icon; href?: string; topic?: ContactTopic };
export const NEEDS: Need[] = [
  { label: "Tìm nhà cung cấp", desc: "Tra cứu doanh nghiệp hội viên theo ngành, địa bàn", icon: Building2, href: "/enterprises" },
  { label: "Đăng nhu cầu mua hàng", desc: "Gửi bài toán đặt hàng tới mạng lưới nhà máy", icon: ShoppingCart, href: "/nhu-cau-cong-nghe" },
  { label: "Tìm đối tác công nghệ", desc: "Sản phẩm, năng lực, giải pháp chuyển giao", icon: Cpu, href: "/chao-ban-cong-nghe" },
  { label: "Đăng ký sự kiện", desc: "Hội thảo, phiên kết nối B2B, xúc tiến thương mại", icon: Ticket, href: "/trien-lam" },
  { label: "Nhận hỗ trợ chính sách", desc: "Gửi vướng mắc, kiến nghị tới Hiệp hội", icon: Scale, topic: "POLICY" },
  { label: "Gia nhập hội viên", desc: "Quyền lợi, thủ tục và đăng ký trực tuyến", icon: UserPlus, href: JOIN_HREF },
];

/* Màu nhấn riêng cho từng thẻ nhu cầu (icon + viền sáng + thanh gradient) */
const NEED_ACCENT: { icon: string; bar: string; ring: string }[] = [
  { icon: "bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/60 dark:text-blue-300", bar: "from-blue-500 to-cyan-400", ring: "hover:border-blue-300 dark:hover:border-blue-700" },
  { icon: "bg-amber-50 text-amber-700 group-hover:bg-amber-500 group-hover:text-white dark:bg-amber-950/50 dark:text-amber-300", bar: "from-amber-400 to-orange-400", ring: "hover:border-amber-300 dark:hover:border-amber-700" },
  { icon: "bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white dark:bg-violet-950/50 dark:text-violet-300", bar: "from-violet-500 to-fuchsia-400", ring: "hover:border-violet-300 dark:hover:border-violet-700" },
  { icon: "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950/50 dark:text-emerald-300", bar: "from-emerald-500 to-teal-400", ring: "hover:border-emerald-300 dark:hover:border-emerald-700" },
  { icon: "bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white dark:bg-rose-950/50 dark:text-rose-300", bar: "from-rose-500 to-pink-400", ring: "hover:border-rose-300 dark:hover:border-rose-700" },
  { icon: "bg-cyan-50 text-cyan-700 group-hover:bg-cyan-600 group-hover:text-white dark:bg-cyan-950/50 dark:text-cyan-300", bar: "from-cyan-500 to-sky-400", ring: "hover:border-cyan-300 dark:hover:border-cyan-700" },
];

export function NeedRouter() {
  const lang = useOptionalLang();
  return (
    <section aria-labelledby="ban-can-gi" className="page-container py-10 sm:py-14">
      <div className="text-center">
        <h2 id="ban-can-gi" className="type-section-title text-text-primary dark:text-white">{tr(lang, "Bạn đang cần gì?")}</h2>
        <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-gradient-to-r from-brand-700 to-brand-gold" aria-hidden="true" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NEEDS.map((n, i) => {
          const Ic = n.icon;
          const ac = NEED_ACCENT[i % NEED_ACCENT.length];
          const inner = (
            <>
              <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${ac.bar} transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100`} />
              <Ic className="pointer-events-none absolute -bottom-4 -right-3 size-24 text-slate-900/[0.04] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 dark:text-white/[0.05]" aria-hidden="true" />
              <div className={`relative grid size-12 shrink-0 place-items-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-lg ${ac.icon}`}>
                <Ic className="size-6" aria-hidden="true" />
              </div>
              <div className="relative min-w-0 flex-1 text-left">
                <span className="block text-lg font-extrabold leading-tight text-text-primary dark:text-white">{tr(lang, n.label)}</span>
                <span className="mt-1 block text-sm text-text-secondary dark:text-slate-400 line-clamp-2">{n.desc}</span>
              </div>
              <ArrowRight className="relative mt-1 size-5 shrink-0 -translate-x-2 text-brand-700 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 dark:text-cyan-300" aria-hidden="true" />
            </>
          );
          const cls = `animate-rise-in group relative flex cursor-pointer items-start gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25 dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-sm ${ac.ring}`;
          const style = { "--rise-delay": `${i * 70}ms` } as React.CSSProperties;
          return n.href ? (
            <Link key={n.label} href={n.href} className={cls} style={style}>{inner}</Link>
          ) : (
            <button key={n.label} type="button" onClick={() => openContactModal(n.topic)} className={cls} style={style}>{inner}</button>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- 3. Tìm doanh nghiệp / NCC */
export function EnterpriseFinder() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sectors, setSectors] = useState<SectorOption[]>([]);

  useEffect(() => {
    getActiveSectors().then(setSectors).catch(() => setSectors([]));
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    router.push(v ? `/enterprises?q=${encodeURIComponent(v)}` : "/enterprises");
  };

  return (
    <section aria-labelledby="tim-dn" className="relative overflow-hidden border-y border-slate-200/60 bg-gradient-to-b from-slate-50 via-brand-50/60 to-white dark:border-slate-800/50 dark:from-slate-900/40 dark:via-slate-900/20 dark:to-transparent">
      <div aria-hidden="true" className="animate-blob-float pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-brand-200/50 blur-3xl dark:bg-brand-600/15" />
      <div aria-hidden="true" className="animate-blob-float pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-amber-200/40 blur-3xl [animation-delay:-6s] dark:bg-amber-500/10" />
      <div className="page-container relative space-y-6 py-10 sm:py-14">
        <div className="space-y-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-cyan-400">
            <Building2 className="size-3.5" aria-hidden="true" /> Danh bạ hội viên
          </span>
          <h2 id="tim-dn" className="type-section-title text-text-primary dark:text-white">Tìm doanh nghiệp hoặc nhà cung cấp</h2>
          <p className="mx-auto max-w-xl text-sm text-text-secondary dark:text-slate-400">Tra cứu năng lực sản xuất, sản phẩm, chứng nhận và thông tin liên hệ của doanh nghiệp hội viên.</p>
        </div>
        <form onSubmit={submit} role="search" className="mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-brand-500/10 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15 dark:border-slate-700 dark:bg-slate-900">
          <Search className="ml-3 size-5 shrink-0 text-slate-400" aria-hidden="true" />
          <input
            id="home-ent-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Tìm doanh nghiệp hoặc nhà cung cấp"
            placeholder="Tên doanh nghiệp, sản phẩm, mã số thuế..."
            className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none placeholder:text-slate-400 sm:text-base dark:text-white"
          />
          <button type="submit" className="btn-press inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:brightness-110">
            <span className="hidden sm:inline">Tìm</span> <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>
        {sectors.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Lọc nhanh theo ngành">
            {sectors.map((s, i) => (
              <Link
                key={s.code}
                href={`/enterprises?sectorCode=${encodeURIComponent(s.code)}`}
                style={{ "--rise-delay": `${i * 45}ms` } as React.CSSProperties}
                className="animate-rise-in rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-700 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-cyan-400 dark:hover:text-slate-900"
              >
                {s.name}
              </Link>
            ))}
          </div>
        )}
        <div className="text-center">
          <Link href="/enterprises" className="group inline-flex items-center gap-1 text-sm font-bold text-brand-700 dark:text-cyan-300">
            Mở danh bạ <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- 5. Dịch vụ (8 dịch vụ — nguồn: lib/constants/services.ts) */
const SERVICE_ICON: Record<string, Icon> = {
  "ho-tro-chinh-sach": Scale,
  "ket-noi-cung-cau": Handshake,
  "dao-tao-nhan-luc": GraduationCap,
  "cong-nghe-chuyen-doi-so": Cpu,
  "nang-suat-chat-luong": BadgeCheck,
  "chuyen-doi-xanh-esg": Leaf,
  "xuc-tien-thuong-mai": Megaphone,
  "hop-tac-quoc-te": Globe2,
};
export const SERVICES = BUSINESS_SERVICES;

export function ServicesGrid() {
  const lang = useOptionalLang();
  return (
    <section aria-labelledby="dich-vu" className="page-container py-10 sm:py-14 space-y-6">
      <SectionHead eyebrow="Dịch vụ hội viên" title="Dịch vụ dành cho doanh nghiệp" desc="Mỗi dịch vụ nêu rõ dành cho ai, giải quyết vấn đề gì, hỗ trợ ra sao và đăng ký ở đâu." moreHref="/dich-vu" moreLabel="Tất cả dịch vụ" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s) => {
          const Ic = SERVICE_ICON[s.slug] ?? BadgeCheck;
          return (
            <article key={s.slug} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Ic className="size-6 text-brand-600 dark:text-cyan-400" aria-hidden="true" />
              <h3 className="mt-3 font-bold text-sm text-text-primary dark:text-white">{tr(lang, s.title)}</h3>
              <p className="mt-1 flex-1 text-xs text-text-secondary dark:text-slate-400"><span className="font-semibold">Dành cho:</span> {s.forWhom[0]}</p>
              <Link href={`/dich-vu/${s.slug}`} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline dark:text-cyan-300">
                {tr(lang, "Tìm hiểu & đăng ký")} <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- 6. Sự kiện & đào tạo sắp tới */
/** Bỏ hậu tố trạng thái nội bộ (vd. "(Xuất bản)") lọt vào tiêu đề — không hiển thị cho khách. */
const cleanTitle = (t: string) => t.replace(/\s*\((xuất bản|nháp|published|draft)\)\s*$/i, "").trim();
/** Tóm tắt dạng URL thô không phải nội dung đọc được → không hiển thị. */
const readableExcerpt = (t?: string | null) => (t && !/^\s*https?:\/\//i.test(t) ? t : "");
const sourceHost = (url?: string | null) => {
  try { return url ? new URL(url).hostname.replace(/^www\./, "") : ""; } catch { return ""; }
};

function ColumnLabel({ icon: Icon, children, href, more }: { icon: Icon; children: React.ReactNode; href?: string; more?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 text-sm font-bold text-text-primary dark:text-white">
        <Icon className="size-4 text-brand-700 dark:text-cyan-300" aria-hidden="true" />
        {children}
      </h3>
      {href && more && (
        <Link href={href} className="text-xs font-semibold text-brand-700 hover:underline dark:text-cyan-300">{more}</Link>
      )}
    </div>
  );
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<TechmartEvent[] | null>(null);
  const [courses, setCourses] = useState<LmsMaterialCardDto[] | null>(null);

  useEffect(() => {
    portalClient.listEvents("UPCOMING", 1, 3).then((r) => setEvents(r.data.slice(0, 3))).catch(() => setEvents([]));
    fetchLmsCatalog({ page: 1, pageSize: 3 }).then((r) => setCourses(r.materials.items.slice(0, 3))).catch(() => setCourses([]));
  }, []);

  if (events === null || courses === null) {
    return (
      <section className="page-container py-10" aria-busy="true">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
      </section>
    );
  }
  if (events.length === 0 && courses.length === 0) return null;

  const card = "animate-rise-in group relative flex gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl before:absolute before:inset-y-0 before:left-0 before:w-1 before:origin-top before:scale-y-0 before:bg-gradient-to-b before:from-brand-500 before:to-brand-gold before:transition-transform before:duration-300 hover:before:scale-y-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-700";
  const delay = (i: number) => ({ "--rise-delay": `${i * 90}ms` }) as React.CSSProperties;
  const daysLeft = (d: Date) => Math.ceil((d.getTime() - Date.now()) / 86400000);

  return (
    <section aria-labelledby="su-kien" className="relative overflow-hidden border-y border-slate-200 bg-gradient-to-b from-slate-50 to-brand-50/40 dark:border-slate-800 dark:from-slate-900/40 dark:to-slate-900/10">
      <div aria-hidden="true" className="animate-blob-float pointer-events-none absolute -right-24 top-10 size-80 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-600/10" />
      <div className="page-container relative py-10 sm:py-14 space-y-8">
        <SectionHead eyebrow="Hoạt động" title="Sự kiện và đào tạo sắp tới" moreHref="/trien-lam" moreLabel="Lịch sự kiện" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {events.length > 0 && (
            <div className={courses.length > 0 ? "lg:col-span-3" : "lg:col-span-5"}>
              <ColumnLabel icon={Calendar}>Sự kiện</ColumnLabel>
              <ul className="space-y-3" aria-label="Sự kiện sắp tới">
                {events.map((e, i) => {
                  const d = new Date(e.startDate);
                  const left = daysLeft(d);
                  return (
                    <li key={e.id} className={card} style={delay(i)}>
                      <time dateTime={d.toISOString()} className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 py-2.5 text-white shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2">
                        <span className="text-2xl font-black leading-none tabular-nums">{String(d.getDate()).padStart(2, "0")}</span>
                        <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide">Tháng {d.getMonth() + 1}</span>
                        <span className="text-[10px] font-medium opacity-80">{d.getFullYear()}</span>
                      </time>
                      <div className="min-w-0 flex-1">
                        {left >= 0 && left <= 60 && (
                          <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800">
                            <span className="size-1.5 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
                            {left === 0 ? "Diễn ra hôm nay" : `Còn ${left} ngày`}
                          </span>
                        )}
                        <p className="line-clamp-2 text-[15px] font-bold leading-snug text-text-primary transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-cyan-300">{cleanTitle(e.title)}</p>
                        {e.location && (
                          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-text-secondary dark:text-slate-300">
                            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /><span className="line-clamp-1">{e.location}</span>
                          </p>
                        )}
                        <Link href="/trien-lam/dang-ky-tham-quan" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline dark:text-cyan-300">
                          Đăng ký tham dự <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {courses.length > 0 && (
            <div className={events.length > 0 ? "lg:col-span-2" : "lg:col-span-5"}>
              <ColumnLabel icon={GraduationCap} href="/elearning" more="Tất cả khóa học">Đào tạo</ColumnLabel>
              <ul className="space-y-3" aria-label="Khóa đào tạo">
                {courses.map((c, i) => (
                  <li key={c.id} className={card} style={delay(i + events.length)}>
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950/50 dark:text-emerald-300">
                      <GraduationCap className="size-6" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link href={`/elearning/${c.id}`} className="line-clamp-2 text-[15px] font-bold leading-snug text-text-primary after:absolute after:inset-0 after:content-[''] hover:text-brand-700 dark:text-white dark:hover:text-cyan-300">
                        {cleanTitle(c.title)}
                      </Link>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-secondary dark:text-slate-300">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">{Math.max(1, Math.round(c.durationMinutes / 60))} giờ</span>
                        {c.leadInstructorName && <span className="truncate">{c.leadInstructorName}</span>}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- 7. Chính sách & thông tin ngành */
/** Danh mục được coi là "chính sách & thông tin ngành" (góp ý khách hàng, khối 7 trang chủ). */
const INSIGHT_CATEGORIES = ["chinh-sach-moi", "giai-thich-chinh-sach", "kien-nghi", "chuoi-cung-ung", "ban-dan", "hop-tac-quoc-te"];
export function PolicyInsights() {
  const [items, setItems] = useState<CmsArticleSummary[] | null>(null);
  useEffect(() => {
    Promise.all(INSIGHT_CATEGORIES.map((c) => cmsClient.articles({ category: c, limit: 3 }).then((r) => r.data).catch(() => [] as CmsArticleSummary[])))
      .then((lists) =>
        setItems(
          lists.flat().sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")).slice(0, 3)
        )
      );
  }, []);
  if (!items || items.length === 0) return null;
  return (
    <section aria-labelledby="chinh-sach" className="page-container py-10 sm:py-14 space-y-8">
      <SectionHead eyebrow="Chính sách & tri thức" title="Chính sách và thông tin ngành mới nhất" moreHref="/chinh-sach" moreLabel="Trung tâm chính sách & tri thức" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {items.map((a, i) => {
          const excerpt = readableExcerpt(a.excerpt);
          const host = excerpt ? "" : sourceHost(a.excerpt);
          return (
            <Link key={a.slug} href={`/tin-tuc/${a.slug}`} style={{ "--rise-delay": `${i * 100}ms` } as React.CSSProperties} className="animate-rise-in group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-700">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-500 via-cyan-400 to-brand-gold transition-transform duration-500 group-hover:scale-x-100" />
              <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-4 select-none text-8xl font-black leading-none text-slate-900/[0.04] transition-transform duration-500 group-hover:scale-110 dark:text-white/[0.05]">{String(i + 1).padStart(2, "0")}</span>
              <span className="relative self-start rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-700 ring-1 ring-brand-100 dark:bg-cyan-950/50 dark:text-cyan-300 dark:ring-cyan-900">{categoryLabel(a.categorySlug)}</span>
              <h3 className="relative mt-3 line-clamp-3 text-base font-bold leading-snug text-text-primary transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-cyan-300">{a.title}</h3>
              {excerpt && <p className="relative mt-2 line-clamp-3 text-sm leading-relaxed text-text-secondary dark:text-slate-300">{excerpt}</p>}
              <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  {a.publishedAt && (<><Calendar className="size-3.5" aria-hidden="true" /><time dateTime={a.publishedAt}>{new Date(a.publishedAt).toLocaleDateString("vi-VN")}</time></>)}
                  {host && <span className="truncate">· {host}</span>}
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-brand-700 dark:text-cyan-300">Đọc tiếp <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Đối tác (chỉ hiện khi Admin đã nhập đối tác thật — BR-BL09-NO-FABRICATION-001) */
export function PartnerStrip() {
  const [partners, setPartners] = useState<CmsPartner[]>([]);
  useEffect(() => {
    cmsClient.partners().then(setPartners).catch(() => setPartners([]));
  }, []);
  if (partners.length === 0) return null;
  return (
    <section aria-labelledby="doi-tac" className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="page-container py-8 space-y-4">
        <h2 id="doi-tac" className="text-center text-sm font-extrabold uppercase tracking-wider text-slate-500">Đối tác của {ORG.shortName}</h2>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {partners.map((p) => {
            const inner = p.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.logoUrl} alt={p.name} loading="lazy" className="h-10 w-auto max-w-[140px] object-contain grayscale transition hover:grayscale-0" />
            ) : (
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{p.name}</span>
            );
            return (
              <li key={p.id}>
                {p.website ? <a href={p.website} target="_blank" rel="noopener noreferrer" aria-label={p.name}>{inner}</a> : inner}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- 8. Quyền lợi & Gia nhập */

export function JoinBenefits() {
  const lang = useOptionalLang();
  return (
    <section aria-labelledby="gia-nhap" className="bg-gradient-to-br from-[#031e3d] via-[#053567] to-[#0a488f] text-white">
      <div className="page-container py-12 sm:py-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Gia nhập {ORG.shortName}</span>
          <h2 id="gia-nhap" className="text-2xl sm:text-3xl font-extrabold">{tr(lang, "Quyền lợi khi trở thành hội viên")}</h2>
          <p className="text-sm text-white/80">{ORG.motto}.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href={JOIN_HREF} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-[#042142] shadow-md hover:bg-slate-100">
              <UserPlus className="size-4" aria-hidden="true" /> {tr(lang, "Gia nhập BACLINK")}
            </Link>
            <button type="button" onClick={() => openContactModal("MEMBERSHIP")} className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-bold hover:bg-white/10">
              {tr(lang, "Cần tư vấn trước khi gia nhập")}
            </button>
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MEMBER_BENEFITS.map((b) => (
            <li key={b} className="flex gap-2.5 rounded-xl bg-white/10 p-3.5 text-sm">
              <CheckCircle2 className="size-5 shrink-0 text-amber-300" aria-hidden="true" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Hội viên (dữ liệu thật) */
export function MemberStrip() {
  const [items, setItems] = useState<{ id: string; name: string; taxCode?: string | null; sector?: string | null }[]>([]);
  const [featured, setFeatured] = useState(false);
  useEffect(() => {
    membershipClient
      .featured(8)
      .then((f) => {
        if (f.length > 0) {
          setFeatured(true);
          setItems(f.map((x) => ({ id: x.enterpriseId, name: x.name, taxCode: x.taxCode, sector: x.sectorName })));
          return;
        }
        return fetchEnterprises({ page: 1, pageSize: 8 }).then((r) =>
          setItems(r.items.filter((e) => e.isVerified).map((e) => ({ id: e.id, name: e.name, taxCode: e.taxCode, sector: e.mainSectorName })))
        );
      })
      .catch(() => setItems([]));
  }, []);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="hoi-vien" className="page-container py-10 sm:py-14 space-y-6">
      <SectionHead
        eyebrow="Cộng đồng"
        title={featured ? "Hội viên tiêu biểu" : "Hội viên BACLINK"}
        desc={featured ? "Do Ban Quản trị Hiệp hội lựa chọn." : "Doanh nghiệp đã được Ban Quản trị Hiệp hội xác thực."}
        moreHref={featured ? "/hoi-vien/tieu-bieu" : "/enterprises"}
        moreLabel={featured ? "Xem tất cả" : "Toàn bộ danh bạ"}
      />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((e, i) => {
          const logo = e.taxCode ? MEMBER_LOGOS[e.taxCode] : undefined;
          return (
            <li key={e.id} className="animate-rise-in" style={{ "--rise-delay": `${i * 60}ms` } as React.CSSProperties}>
              <Link href={e.taxCode ? `/enterprises/${e.taxCode}` : "/enterprises"} className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-700">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-500 via-cyan-400 to-brand-gold transition-transform duration-500 group-hover:scale-x-100" />
                <div className="flex items-center" style={{ height: 44 }}>
                  {logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt={`Logo ${e.name}`} loading="lazy" style={{ height: 44, width: "auto", maxWidth: "100%", objectFit: "contain", objectPosition: "left center" }} />
                  )}
                </div>
                <span className="mt-2 text-sm font-bold leading-snug text-text-primary transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-cyan-300 line-clamp-2">{e.name}</span>
                <span className="mt-1 text-xs text-text-secondary line-clamp-1">{e.sector}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
