"use client";

import { useEffect, useState } from "react";
import { AppButton } from "@/components/ui/design-system";
import Link from "next/link";
import { AlertTriangle, Award, BadgeCheck, BookOpen, BriefcaseBusiness, Building2, CalendarPlus, Check, CheckCircle2, Clock, Copy, FileText, GraduationCap, LockKeyhole, Mail, MapPin, Phone, Share2, ShieldCheck, Sparkles } from "lucide-react";
import { Async } from "@/components/ui/async";
import { Achievement, ExpertApiError, ExpertCompleteness, ExpertPrivateDetail, ExpertPublicDetail, getMyExpertCompleteness, getMyExpertDetail, getPublicExpertDetail, Timeline } from "@/lib/expert-detail";
import { authClient } from "@/lib/auth-client";
import { API_BASE } from "@/lib/api-client";
import { getSectorLabels } from "@/lib/master-data-client";
import { ExpertAvatar } from "./expert-avatar";
import { SectorBannerBackground } from "@/components/enterprise/SectorBannerBackground";

type TabKey = "patents" | "researchProjects" | "publications" | "practicalProjects" | "awards";
const tabs: { key: TabKey; label: string }[] = [
  { key: "patents", label: "Bằng sáng chế & GPHI" }, { key: "researchProjects", label: "Đề tài KH&CN" },
  { key: "publications", label: "Công trình công bố" }, { key: "practicalProjects", label: "Áp dụng thực tiễn" }, { key: "awards", label: "Giải thưởng" },
];

function TimelineCard({ title, items, icon: Icon }: { title: string; items: Timeline[]; icon: typeof GraduationCap }) {
  return <section className="rounded-surface border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-700">
    <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900 text-card-title dark:text-slate-100"><Icon className="h-4 w-4 text-brand-700 dark:text-brand-200" />{title}</h2>
    {items.length === 0 ? <p className="text-body text-slate-500 dark:text-slate-300">Chưa có dữ liệu được công khai.</p> : <div className="space-y-4">{items.map((item, i) => <div className="border-l-2 border-brand-700 pl-3 text-label" key={`${item.title}-${i}`}><p className="font-bold text-slate-900 dark:text-slate-100">{item.title}</p><p className="text-slate-600 dark:text-slate-300">{item.subtitle}</p><p className="font-mono text-caption text-slate-500 dark:text-slate-300">{item.period}</p></div>)}</div>}
  </section>;
}

function AchievementTabs({ detail }: { detail: ExpertPublicDetail }) {
  const [active, setActive] = useState<TabKey>("patents");
  const totalAchievements = tabs.reduce(
    (sum, tab) => sum + ((detail[tab.key] as Achievement[] | undefined)?.length ?? 0),
    0
  );

  if (totalAchievements === 0) {
    return (
      <section
        data-testid="achievements-compact-empty"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800"
      >
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm dark:text-slate-100">
          <Award className="h-4 w-4 text-brand-700 dark:text-teal-300" />
          <span>Thành tựu KH&amp;CN &amp; Công trình nghiên cứu</span>
        </div>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Chuyên gia chưa cập nhật dữ liệu bằng sáng chế, đề tài, công trình công bố hoặc giải thưởng trên hệ thống.
        </p>
      </section>
    );
  }

  const items = detail[active] as Achievement[];
  return <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
    <div className="flex flex-wrap border-b border-slate-200 px-3 pt-2 dark:border-slate-800 gap-1">{tabs.map((tab) => {
      const count = (detail[tab.key] as Achievement[] | undefined)?.length ?? 0;
      return (
        <button key={tab.key} type="button" onClick={() => setActive(tab.key)} className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-bold transition ${active === tab.key ? "border-[#2D9A85] text-[#2D9A85] bg-teal-50/40 dark:bg-teal-950/20" : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}>
          {tab.label} ({count})
        </button>
      );
    })}</div>
    <div className="p-5">{items.length === 0 ? <div className="rounded-xl bg-slate-50 p-6 text-center text-label text-slate-500 dark:text-slate-300 dark:bg-slate-800">Chưa có dữ liệu công khai cho mục này.</div> : <div className="space-y-3">{items.map((item, i) => <article className="rounded-xl border border-slate-200 p-4 dark:border-slate-700 hover:border-teal-500/50 transition" key={`${item.title}-${i}`}><p className="text-body font-bold text-slate-900 dark:text-slate-100">{item.title}</p>{item.meta && <p className="mt-1 text-body font-medium text-brand-700 dark:text-teal-300">{item.meta}</p>}{item.description && <p className="mt-1 text-body text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>}</article>)}</div>}</div>
  </section>;
}

function ConsultationCta({ expertCode }: { expertCode: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isLoggedIn = typeof window !== "undefined" && Boolean(authClient.getToken());

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setErrorMsg(null);
    try {
      const r = await fetch(`${API_BASE}/api/v1/public/experts/${encodeURIComponent(expertCode)}/consultation-requests`, {
        method: "POST",
        headers: authClient.getAuthHeaders(),
        body: JSON.stringify({ contactName: name, message }),
      });
      const result = await r.json().catch(() => null);
      if (!r.ok || result?.success === false) {
        throw new Error(result?.message || "Chưa gửi được yêu cầu. Vui lòng thử lại sau.");
      }
      const code = result?.data?.ticketCode ?? result?.ticketCode ?? null;
      setTicketCode(code);
      setState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Chưa gửi được yêu cầu. Vui lòng thử lại sau.");
      setState("error");
    }
  }

  const handleCopyTicket = () => {
    if (ticketCode && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(ticketCode);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
    }
  };

  return (
    <section id="consultation-cta" className="rounded-2xl bg-brand-700 border border-white/15 p-6 text-white shadow-md">
      <h2 className="font-bold text-base sm:text-lg">Đặt Lịch Kết Nối &amp; Tư Vấn Chuyên Gia R&amp;D</h2>
      <p className="mt-1 text-xs text-slate-300">Yêu cầu tư vấn của bạn sẽ được chuyển trực tiếp tới chuyên gia và bộ phận NacenTech tiếp nhận.</p>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="mt-4 bg-white hover:bg-slate-100 text-brand-700 font-bold px-6 py-3 rounded-xl shadow-sm transition active:scale-[0.98] flex items-center gap-2 text-xs sm:text-sm">
          <CalendarPlus className="h-4 w-4 text-teal-200" />
          <span>Điền phiếu yêu cầu kết nối</span>
        </button>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-xl bg-white/10 p-4 border border-white/10">
          <input required value={name} onChange={e => setName(e.target.value)} placeholder="Họ tên người liên hệ" className="w-full rounded-xl px-3.5 py-2.5 text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400" />
          <textarea required value={message} onChange={e => setMessage(e.target.value)} placeholder="Nội dung bài toán cần chuyên gia tư vấn hoặc đề xuất hợp tác R&D" className="min-h-24 w-full rounded-xl px-3.5 py-2.5 text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400" />
          {state === "success" && (
            <div className="rounded-xl bg-emerald-950/60 border border-emerald-400/40 p-3 space-y-2">
              <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Đã gửi yêu cầu tư vấn thành công tới Viện NacenTech!
              </p>
              {ticketCode && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <div className="text-xs">
                    <span className="text-slate-200">Mã phiếu theo dõi: </span>
                    <strong className="font-mono text-white tracking-wide" data-testid="consultation-ticket-code">{ticketCode}</strong>
                  </div>
                  <button type="button" onClick={handleCopyTicket} className="inline-flex items-center gap-1 rounded-md bg-white/15 hover:bg-white/25 px-2 py-1 text-[11px] font-semibold text-white transition">
                    {copiedTicket ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTicket ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>
              )}
              <p className="text-[11px] text-slate-200">
                {isLoggedIn ? (
                  <>
                    Theo dõi tiến độ phản hồi &amp; lịch hẹn tại{" "}
                    <Link href="/portal/buyer/consultations" className="underline font-bold text-teal-200 hover:text-white">
                      Tư Vấn Chuyên Gia
                    </Link>.
                  </>
                ) : (
                  "Vui lòng lưu lại mã phiếu và kiểm tra email để nhận thông báo phản hồi từ chuyên gia."
                )}
              </p>
            </div>
          )}
          {state === "error" && <p className="text-xs font-bold text-rose-300">{errorMsg || "Chưa gửi được yêu cầu. Vui lòng thử lại sau."}</p>}
          <button type="submit" disabled={state === "sending"} className="bg-white hover:bg-slate-100 text-brand-700 font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-sm disabled:opacity-50">
            {state === "sending" ? "Đang gửi…" : "Gửi phiếu yêu cầu tư vấn"}
          </button>
        </form>
      )}
    </section>
  );
}

function PublicBody({ detail }: { detail: ExpertPublicDetail }) {
  const [sectorNames, setSectorNames] = useState<Record<string, string>>({});
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    if (typeof window !== "undefined" && detail.expertCode) {
      navigator.clipboard.writeText(detail.expertCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  useEffect(() => { getSectorLabels().then((items) => setSectorNames(Object.fromEntries(items.map((item) => [item.code, item.name])))).catch(() => setSectorNames({})); }, []);
  const sectorLabels = detail.expertiseSectors.map((value) => sectorNames[value] ?? value);
  const orgLine = [detail.positionTitle, detail.organizationName]
    .map((v) => v?.trim())
    .filter(Boolean)
    .join(" · ");
  const share = async () => { if (navigator.share) await navigator.share({ title: detail.fullName, url: window.location.href }); else await navigator.clipboard.writeText(window.location.href); };
  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-7">
    {/* Profile Hero Banner Chuẩn BD-04 */}
    <div className="bg-brand-700 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-white/15 relative overflow-hidden">
      <SectorBannerBackground sectorCode={detail.expertiseSectors?.[0]} opacity={0.2} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

      {/* Top badges */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Chuyên Gia Đã Xác Thực (NacenTech)</span>
          </span>
          {detail.isAcceptingConsultation && (
            <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
              Sẵn sàng nhận tư vấn R&amp;D
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={share} className="text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 border border-slate-700 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            <span>Chia sẻ</span>
          </button>
          <Link href="/experts" className="text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 border border-slate-700 px-3.5 py-1.5 rounded-xl transition">
            ← Danh bạ
          </Link>
        </div>
      </div>

      {/* Body Hero */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar chuyên gia 128x128px (w-32 h-32), rounded-full, ring-4 ring-cyan-500/30 */}
          <div className="shrink-0 relative">
            <ExpertAvatar
              fullName={detail.fullName}
              avatarUrl={detail.avatarUrl}
              expertCode={detail.expertCode}
              size="lg"
              isVerified={detail.isVerified}
              className="w-32 h-32 rounded-full ring-4 ring-cyan-500/30 shadow-2xl object-cover"
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {detail.fullName}
              </h1>
            </div>

            {/* Monospace Code with Copy */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-300">
              <div className="inline-flex items-center gap-1.5">
                <span className="text-slate-400">Mã chuyên gia:</span>
                <span className="font-mono font-semibold tracking-wider text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700 select-all">
                  {detail.expertCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title={copiedCode ? "Đã sao chép mã định danh" : "Sao chép mã chuyên gia"}
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {copiedCode && <span className="text-[11px] text-emerald-400 font-semibold animate-pulse">Đã sao chép mã định danh</span>}
              </div>

              {orgLine && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-white font-medium">
                    <Building2 className="h-3.5 w-3.5 text-teal-300" />
                    {orgLine}
                  </span>
                </>
              )}
            </div>

            <p className="max-w-3xl text-xs sm:text-sm leading-relaxed text-slate-300 pt-1">
              {detail.publicBio || "Hồ sơ chuyên môn đang được chuyên gia hoàn thiện và cập nhật trên CSDL Quốc Gia NacenTwin."}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {sectorLabels.map(x => <span className="rounded-md bg-slate-800 text-teal-300 border border-slate-700 px-2.5 py-0.5 text-xs font-semibold" key={x}>{x}</span>)}
              {(detail.specializedKeywords ?? []).map(x => <span className="rounded-md bg-slate-800/60 border border-slate-700 px-2 py-0.5 text-xs text-slate-300" key={`keyword-${x}`}>{x}</span>)}
            </div>
          </div>
        </div>

        {/* CTA Emerald */}
        <div className="shrink-0 pt-2 lg:pt-0">
          <a
            href="#consultation-cta"
            className="bg-white hover:bg-slate-100 text-brand-700 font-bold px-6 py-3 rounded-xl shadow-sm transition active:scale-[0.98] flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <CalendarPlus className="w-4 h-4 text-teal-200" />
            <span>Đăng Ký Tư Vấn Công Nghệ</span>
          </a>
        </div>
      </div>
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      <aside className="space-y-6">
        {detail.training.length === 0 && detail.employment.length === 0 ? (
          <section
            data-testid="timeline-compact-empty"
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800"
          >
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm dark:text-slate-100">
              <GraduationCap className="h-4 w-4 text-brand-700 dark:text-brand-200" />
              <span>Quá trình đào tạo &amp; Công tác</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Chuyên gia chưa bổ sung chi tiết quá trình đào tạo và công tác.
            </p>
          </section>
        ) : (
          <>
            <TimelineCard title="Quá trình đào tạo" items={detail.training} icon={GraduationCap} />
            <TimelineCard title="Quá trình công tác" items={detail.employment} icon={BriefcaseBusiness} />
          </>
        )}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <h2 className="mb-2 font-bold text-sm text-slate-900 dark:text-white">Bảo mật liên hệ PDPD</h2>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Thông tin liên hệ cá nhân của chuyên gia được bảo vệ theo Nghị định 13/2023/NĐ-CP (PDPD). Hãy gửi phiếu yêu cầu để Viện NacenTech làm đầu mối kết nối làm việc.
          </p>
        </section>
      </aside>
      <main className="min-w-0 space-y-6 lg:col-span-2">
        <section
          data-testid="expert-capability-summary"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3"
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="flex items-center gap-2 font-bold text-slate-900 text-card-title dark:text-slate-100">
              <Sparkles className="h-4 w-4 text-brand-700 dark:text-teal-300" />
              <span>Tóm tắt năng lực &amp; Từ khóa chuyên môn</span>
            </h2>
            {detail.organizationAddress && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                <MapPin className="h-3.5 w-3.5 text-brand-700 dark:text-teal-300 shrink-0" />
                <span>{detail.organizationAddress}</span>
              </span>
            )}
          </div>
          <p className="text-body leading-relaxed text-slate-700 dark:text-slate-300">
            {detail.consultingSummary || detail.publicBio || "Hồ sơ chuyên môn đang được chuyên gia hoàn thiện và cập nhật trên CSDL Quốc Gia NacenTwin."}
          </p>
          {((sectorLabels.length > 0) || (detail.specializedKeywords && detail.specializedKeywords.length > 0)) && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {sectorLabels.map((x) => (
                <span className="rounded-md bg-brand-50 text-brand-800 border border-brand-200 px-2.5 py-1 text-xs font-semibold dark:bg-brand-950/70 dark:text-brand-200 dark:border-brand-800" key={`cap-sec-${x}`}>
                  {x}
                </span>
              ))}
              {(detail.specializedKeywords ?? []).map((kw) => (
                <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" key={`cap-kw-${kw}`}>
                  {kw}
                </span>
              ))}
            </div>
          )}
        </section>

        {detail.courses && detail.courses.length > 0 && (
          <section
            data-testid="expert-lms-courses-section"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 text-card-title dark:text-slate-100">
                <BookOpen className="h-4 w-4 text-brand-700 dark:text-teal-300" />
                <span>Khóa học &amp; Tài liệu giảng dạy (LMS)</span>
              </h2>
              <span className="rounded-full bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-0.5 text-xs font-bold dark:bg-brand-950/60 dark:text-brand-200 dark:border-brand-800">
                {detail.courses.length} khóa học
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {detail.courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/elearning/${course.id}`}
                  className="group rounded-xl border border-slate-200 p-4 hover:border-brand-400 hover:shadow-sm transition flex flex-col justify-between gap-2 dark:border-slate-700 dark:hover:border-teal-500/60"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono font-semibold text-brand-700 dark:text-teal-300">{course.materialCode}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                        {course.lessonType}
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-bold text-sm text-slate-900 group-hover:text-brand-700 line-clamp-2 dark:text-slate-100 dark:group-hover:text-teal-300">
                      {course.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {course.durationMinutes} phút
                    </span>
                    {(course.clusterName || course.sectorCode) && (
                      <span className="truncate max-w-[160px]">
                        {course.clusterName || sectorNames[course.sectorCode ?? ""] || course.sectorCode}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <AchievementTabs detail={detail} />
        <div id="consultation-cta">
          <ConsultationCta expertCode={detail.expertCode} />
        </div>
      </main>
    </div>
  </div>;
}

function PrivatePanel({ detail }: { detail: ExpertPrivateDetail }) {
  const [documents, setDocuments] = useState<{ id: string; documentType: string; mimeType: string; downloadName?: string }[]>([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (detail.activeDocumentTypes?.includes("CURRICULUM_VITAE")) {
      const token = authClient.getToken();
      if (token) {
        fetch(`${API_BASE}/api/v1/experts/me/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((json) => {
            if (json?.data) setDocuments(json.data);
          })
          .catch(() => {});
      }
    }
  }, [detail.activeDocumentTypes]);

  const handleDownloadCv = async (docId: string, downloadName?: string) => {
    try {
      setDownloading(true);
      const token = authClient.getToken();
      const res = await fetch(`${API_BASE}/api/v1/experts/me/documents/${docId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error("Tải tệp không thành công");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName ? `${downloadName}.pdf` : "Ly_lich_khoa_hoc_goc.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Không thể tải tài liệu. Vui lòng thử lại sau.");
    } finally {
      setDownloading(false);
    }
  };

  const cvDoc = documents.find((d) => d.documentType === "CURRICULUM_VITAE");

  return (
    <section className="rounded-surface border border-brand-800 bg-brand-700 p-5 text-white">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <LockKeyhole className="h-5 w-5 text-brand-200" />
          <h2 className="font-bold text-card-title">Khu vực dữ liệu riêng tư</h2>
        </div>
        {detail.activeDocumentTypes.includes("CURRICULUM_VITAE") && (
          <AppButton
            variant="cta"
            disabled={downloading || !cvDoc}
            onClick={() => cvDoc && handleDownloadCv(cvDoc.id, cvDoc.downloadName)}
            className="inline-flex items-center gap-2 text-xs py-1.5 px-3 bg-white text-brand-900 hover:bg-brand-50"
            data-testid="btn-download-my-cv"
          >
            <FileText className="w-4 h-4 text-brand-700" />
            <span>{downloading ? "Đang tải tệp..." : "📄 Tải Lý lịch khoa học gốc"}</span>
          </AppButton>
        )}
      </div>
      <p className="mt-1 text-body text-brand-100">Chỉ chủ hồ sơ hoặc quản trị viên được phân quyền mới xem được. Lượt truy cập được ghi nhận.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-body text-brand-200">SĐT</p>
          <p className="text-body font-bold">{detail.phone || "Chưa cập nhật"}</p>
        </div>
        <div>
          <p className="text-body text-brand-200">Email</p>
          <p className="text-body font-bold">{detail.email || "Chưa cập nhật"}</p>
        </div>
        <div>
          <p className="text-body text-brand-200">PDPD / Cam kết</p>
          <p className="text-body font-bold">{detail.pdpdConsent && detail.legalOath ? "Đã xác nhận" : "Chưa đủ"}</p>
        </div>
      </div>
      <div className="mt-4 border-t border-white/20 pt-3 text-label text-brand-100 flex items-center justify-between flex-wrap gap-2">
        <span>Chứng từ: {detail.activeDocumentTypes.length ? detail.activeDocumentTypes.join(", ") : "Chưa có chứng từ đã kích hoạt"}</span>
        {detail.activeDocumentTypes.includes("CURRICULUM_VITAE") && cvDoc && (
          <span className="text-xs text-brand-200">Đã quét an toàn & sẵn sàng tải về</span>
        )}
      </div>
    </section>
  );
}

function CompletenessAlert({ detail, completeness }: { detail: ExpertPrivateDetail; completeness?: ExpertCompleteness | null }) {
  if (completeness && typeof completeness.score === "number" && Array.isArray(completeness.missingCriteria)) {
    const isExcellent = completeness.score >= 90;
    if (isExcellent) {
      return (
        <section className="rounded-surface border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-200" />
              <span>Hồ sơ đạt tiêu chuẩn xuất sắc ({completeness.score}/100 điểm)</span>
            </div>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-caption font-bold px-2.5 py-1">HẠNG {completeness.grade}</span>
          </div>
          <p className="mt-1 text-body">Hồ sơ đã hoàn thiện đầy đủ 5 trụ cột chuẩn hóa Bộ KH&CN.</p>
        </section>
      );
    }
    return (
      <section className="rounded-surface border border-amber-300 bg-amber-50 p-5 dark:bg-amber-950/60 dark:border-amber-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 font-bold text-amber-950 text-card-title dark:text-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-200" />
              <span>Độ hoàn thiện hồ sơ: {completeness.score}/100 điểm ({completeness.grade})</span>
            </h2>
            <div className="w-64 bg-slate-200 h-2 rounded-full overflow-hidden my-1">
              <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${completeness.score}%` }} />
            </div>
            {completeness.missingCriteria.length > 0 && (
              <p className="text-body text-amber-900 dark:text-amber-200">
                Cần bổ sung: {completeness.missingCriteria.join(", ")}.
              </p>
            )}
          </div>
          <Link href="/portal/expert/profile/edit" className="rounded-xl bg-brand-700 hover:bg-brand-800 px-3 py-2 text-label font-semibold text-white focus-ring min-h-11 inline-flex items-center justify-center">
            Bổ sung ngay
          </Link>
        </div>
      </section>
    );
  }

  const missing = [!detail.phone && "Số điện thoại", !detail.email && "Email công tác", !detail.activeDocumentTypes.length && "Chứng từ xác minh", (!detail.publicProfile.publications.length && !detail.publicProfile.patents.length) && "Công trình tiêu biểu"].filter(Boolean) as string[];
  if (!missing.length) return <section className="rounded-surface border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-900"><div className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-200" />Hồ sơ đã đủ thông tin cốt lõi</div><p className="mt-1 text-body">Bạn vẫn có thể cập nhật thành tựu mới trong phần Chỉnh sửa hồ sơ.</p></section>;
  return <section className="rounded-surface border border-amber-300 bg-amber-50 p-5 dark:bg-amber-950/60 dark:border-amber-900"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 font-bold text-amber-950 text-card-title dark:text-amber-200"><AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-200" />Hồ sơ cần bổ sung</h2><p className="mt-1 text-body text-amber-900 dark:text-amber-200">Còn {missing.length} nhóm thông tin: {missing.join(", ")}. Hoàn thiện để tăng chất lượng hồ sơ và sẵn sàng đối soát.</p></div><Link href="/portal/expert/profile/edit" className="rounded-xl bg-brand-700 hover:bg-brand-800 px-3 py-2 text-label font-semibold text-white focus-ring min-h-11 inline-flex items-center justify-center">Bổ sung ngay</Link></div></section>;
}

export function ExpertPublicDetailPage({ expertCode }: { expertCode: string }) { const [state, setState] = useState<"loading" | "error" | "success">("loading"); const [data, setData] = useState<ExpertPublicDetail | null>(null); const load = () => { setState("loading"); getPublicExpertDetail(expertCode).then(x => { setData(x); setState("success"); }).catch(() => setState("error")); }; useEffect(load, [expertCode]); return <Async state={state} onRetry={load} errorMessage="Hồ sơ chưa được công khai hoặc không tồn tại.">{data && <PublicBody detail={data} />}</Async>; }
export function ExpertOwnerDetailPage() {
  const [state, setState] = useState<"loading" | "error" | "success">("loading");
  const [data, setData] = useState<ExpertPrivateDetail | null>(null);
  const [completeness, setCompleteness] = useState<ExpertCompleteness | null>(null);
  const [errorMessage, setErrorMessage] = useState("Bạn cần đăng nhập để xem hồ sơ riêng tư.");
  const load = () => {
    setState("loading");
    getMyExpertDetail()
      .then((detail) => {
        setData(detail);
        setState("success");
        getMyExpertCompleteness().then((res) => {
          if (res && typeof res.score === "number") setCompleteness(res);
        }).catch(() => {});
      })
      .catch((error: unknown) => {
        if (error instanceof ExpertApiError && error.status === 401) {
          authClient.clearSession();
          setErrorMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else if (error instanceof ExpertApiError && error.status === 403) {
          setErrorMessage("Tài khoản này không có quyền xem hồ sơ riêng tư.");
        } else if (error instanceof ExpertApiError && error.status === 404) {
          setErrorMessage("Tài khoản chưa được liên kết với hồ sơ chuyên gia.");
        } else {
          setErrorMessage("Không thể tải hồ sơ riêng tư. Vui lòng thử lại.");
        }
        setState("error");
      });
  };
  useEffect(load, []);
  const isPendingReview = data?.status === "PENDING_REVIEW";
  return (
    <Async state={state} onRetry={load} errorMessage={errorMessage}>
      {data && (
        <div className="space-y-6">
          {isPendingReview && (
            <section
              data-testid="pending-review-banner"
              className="rounded-surface border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-900"
            >
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span>Hồ sơ đang trong quá trình thẩm định (SLA: tối đa 48 giờ làm việc), không thể chỉnh sửa.</span>
              </div>
            </section>
          )}
          <CompletenessAlert detail={data} completeness={completeness} />
          <PrivatePanel detail={data} />
          <PublicBody detail={data.publicProfile} />
          {isPendingReview ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="fixed bottom-5 right-5 rounded-full bg-brand-700 opacity-50 pointer-events-none cursor-not-allowed max-w-[calc(100%-2rem)] px-4 py-3 text-label font-bold text-white shadow-lg min-h-11 inline-flex items-center justify-center"
            >
              Chỉnh sửa hồ sơ
            </button>
          ) : (
            <Link
              className="fixed bottom-5 right-5 rounded-full bg-brand-700 hover:bg-brand-800 max-w-[calc(100%-2rem)] px-4 py-3 text-label font-bold text-white shadow-lg focus-ring min-h-11 inline-flex items-center justify-center"
              href="/portal/expert/profile/edit"
            >
              Chỉnh sửa hồ sơ
            </Link>
          )}
        </div>
      )}
    </Async>
  );
}
