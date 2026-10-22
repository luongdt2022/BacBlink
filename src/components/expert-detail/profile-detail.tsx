"use client";

import { useEffect, useState } from "react";
import { AppButton } from "@/components/ui/design-system";
import Link from "next/link";
import { AlertTriangle, Award, BadgeCheck, BriefcaseBusiness, Building2, CalendarPlus, CheckCircle2, FileText, GraduationCap, LockKeyhole, Mail, Phone, Share2 } from "lucide-react";
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
  const items = detail[active] as Achievement[];
  return <section className="rounded-surface border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700">
    <div className="flex overflow-x-auto border-b border-slate-200 px-3 pt-2 dark:border-slate-700">{tabs.map((tab) => <AppButton variant="ghost" key={tab.key} onClick={() => setActive(tab.key)} className={`whitespace-nowrap border-b-2 px-3 py-3 text-label font-bold ${active === tab.key ? "border-brand-700 text-brand-700 dark:text-brand-200" : "border-transparent text-slate-500 dark:text-slate-300"}`}>{tab.label}</AppButton>)}</div>
    <div className="p-5">{items.length === 0 ? <div className="rounded-xl bg-slate-50 p-6 text-center text-label text-slate-500 dark:text-slate-300 dark:bg-slate-800">Chưa có dữ liệu công khai cho mục này.</div> : <div className="space-y-3">{items.map((item, i) => <article className="rounded-xl border border-slate-200 p-4 dark:border-slate-700" key={`${item.title}-${i}`}><p className="text-body font-bold text-slate-900 dark:text-slate-100">{item.title}</p>{item.meta && <p className="mt-1 text-body font-medium text-brand-700 dark:text-brand-200">{item.meta}</p>}{item.description && <p className="mt-1 text-body text-slate-600 dark:text-slate-300">{item.description}</p>}</article>)}</div>}</div>
  </section>;
}

function ConsultationCta({ expertCode }: { expertCode: string }) {
  const [open, setOpen] = useState(false); const [name, setName] = useState(""); const [message, setMessage] = useState(""); const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  async function submit(e: React.FormEvent) { e.preventDefault(); setState("sending"); try { const r = await fetch(`${API_BASE}/api/v1/public/experts/${encodeURIComponent(expertCode)}/consultation-requests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contactName: name, message }) }); if (!r.ok) throw new Error(); setState("success"); } catch { setState("error"); } }
  return <section className="rounded-3xl workspace-banner p-6 text-white"><h2 className="font-bold text-card-title">Đặt lịch kết nối & làm việc</h2><p className="mt-1 text-body text-brand-100">Yêu cầu sẽ được chuyển tới bộ phận NacenTech tiếp nhận.</p>{!open ? <AppButton variant="cta" onClick={() => setOpen(true)} className="mt-4"><CalendarPlus className="h-4 w-4 text-brand-700 dark:text-brand-200" />Điền phiếu yêu cầu kết nối</AppButton> : <form onSubmit={submit} className="mt-4 space-y-2 rounded-surface bg-white/10 p-4"><input required value={name} onChange={e => setName(e.target.value)} placeholder="Họ tên người liên hệ" className="w-full rounded-control px-3 py-2 text-body text-slate-900 form-control dark:text-slate-100" /><textarea required value={message} onChange={e => setMessage(e.target.value)} placeholder="Nội dung cần tư vấn" className="min-h-20 w-full rounded-control px-3 py-2 text-body text-slate-900 form-control dark:text-slate-100" />{state === "success" && <p className="text-body text-emerald-200">Đã chuyển yêu cầu tới NacenTech.</p>}{state === "error" && <p className="text-body text-rose-200">Chưa gửi được yêu cầu. Vui lòng thử lại.</p>}<AppButton variant="cta" disabled={state === "sending"}>{state === "sending" ? "Đang gửi…" : "Gửi yêu cầu"}</AppButton></form>}</section>;
}

function PublicBody({ detail }: { detail: ExpertPublicDetail }) {
  const [sectorNames, setSectorNames] = useState<Record<string, string>>({});
  useEffect(() => { getSectorLabels().then((items) => setSectorNames(Object.fromEntries(items.map((item) => [item.code, item.name])))).catch(() => setSectorNames({})); }, []);
  const sectorLabels = detail.expertiseSectors.map((value) => sectorNames[value] ?? value);
  const share = async () => { if (navigator.share) await navigator.share({ title: detail.fullName, url: window.location.href }); else await navigator.clipboard.writeText(window.location.href); };
  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-7">
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700">
      <div className="relative overflow-hidden flex min-h-36 items-start justify-between gap-3 bg-brand-700 p-5 text-white">
        <SectorBannerBackground sectorCode={detail.expertiseSectors?.[0]} opacity={0.45} />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-label font-bold backdrop-blur-sm">
            <BadgeCheck className="mr-1 inline h-3.5 w-3.5 text-cyan-300" />Chuyên gia đã xác thực
          </span>
          {detail.isAcceptingConsultation && (
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-label font-bold text-emerald-200 backdrop-blur-sm">
              Sẵn sàng nhận tư vấn
            </span>
          )}
        </div>
        <div className="relative z-10">
          <AppButton variant="ghost" onClick={share} className="bg-white/10 p-3 text-white hover:bg-white/20 dark:text-white dark:hover:bg-white/20" aria-label="Chia sẻ">
            <Share2 className="h-4 w-4" />
          </AppButton>
        </div>
      </div>
      <div className="p-4 sm:p-6"><div className="flex flex-col gap-5 md:flex-row"><ExpertAvatar fullName={detail.fullName} avatarUrl={detail.avatarUrl} expertCode={detail.expertCode} size="lg" isVerified={detail.isVerified} className="border-4 border-white rounded-2xl shadow dark:border-slate-800" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="font-bold text-slate-950 type-page-title dark:text-slate-100">{detail.fullName}</h1><span className="rounded-full bg-brand-50 px-2 py-1 text-label font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-200">{detail.expertCode}</span></div><p className="mt-2 flex items-center gap-1 text-body font-semibold text-slate-700 dark:text-slate-100"><Building2 className="h-4 w-4 text-brand-700 dark:text-brand-200" />{detail.positionTitle} · {detail.organizationName}</p><p className="mt-3 max-w-3xl text-body leading-relaxed text-slate-600 dark:text-slate-300">{detail.publicBio || "Hồ sơ chuyên môn đang được chuyên gia hoàn thiện."}</p><div className="mt-3 flex flex-wrap gap-2">{sectorLabels.map(x => <span className="rounded-control bg-brand-50 px-2.5 py-1 text-label font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-200" key={x}>{x}</span>)}{(detail.specializedKeywords ?? []).map(x => <span className="rounded-control border border-slate-200 px-2.5 py-1 text-label text-slate-700 dark:text-slate-200" key={`keyword-${x}`}>{x}</span>)}{detail.masteredTechCodes.map(x => <span className="rounded-control bg-nacen-green-50 px-2.5 py-1 text-label font-semibold text-nacen-green-700 dark:bg-slate-800 dark:text-nacen-green-200" key={x}>{x}</span>)}</div></div></div></div></section>
    <div className="grid gap-6 lg:grid-cols-3"><aside className="space-y-6"><TimelineCard title="Quá trình đào tạo" items={detail.training} icon={GraduationCap} /><TimelineCard title="Quá trình công tác" items={detail.employment} icon={BriefcaseBusiness} /><section className="rounded-surface border border-slate-200 bg-white p-5 dark:bg-slate-900 dark:border-slate-700"><h2 className="mb-2 font-bold text-card-title">Kết nối chuyên gia</h2><p className="text-body leading-relaxed text-slate-600 dark:text-slate-300">Thông tin liên hệ cá nhân được bảo vệ theo PDPD. Hãy gửi phiếu yêu cầu để Viện NacenTech kết nối.</p></section></aside><main className="min-w-0 space-y-6 lg:col-span-2"><AchievementTabs detail={detail} /><ConsultationCta expertCode={detail.expertCode} /></main></div>
  </div>;
}

function PrivatePanel({ detail }: { detail: ExpertPrivateDetail }) { return <section className="rounded-surface border border-brand-800 bg-brand-700 p-5 text-white"><div className="flex items-center gap-2"><LockKeyhole className="h-5 w-5 text-brand-200" /><h2 className="font-bold text-card-title">Khu vực dữ liệu riêng tư</h2></div><p className="mt-1 text-body text-brand-100">Chỉ chủ hồ sơ hoặc quản trị viên được phân quyền mới xem được. Lượt truy cập được ghi nhận.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><div><p className="text-body text-brand-200">SĐT</p><p className="text-body font-bold">{detail.phone || "Chưa cập nhật"}</p></div><div><p className="text-body text-brand-200">Email</p><p className="text-body font-bold">{detail.email || "Chưa cập nhật"}</p></div><div><p className="text-body text-brand-200">PDPD / Cam kết</p><p className="text-body font-bold">{detail.pdpdConsent && detail.legalOath ? "Đã xác nhận" : "Chưa đủ"}</p></div></div><div className="mt-4 border-t border-white/20 pt-3 text-label text-brand-100">Chứng từ: {detail.activeDocumentTypes.length ? detail.activeDocumentTypes.join(", ") : "Chưa có chứng từ đã kích hoạt"}</div></section>; }

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
