"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Search, ShieldCheck, Upload } from "lucide-react";
import { API_BASE, readApiError, userFacingRequestError } from "@/lib/api-client";
import { authClient, type UserContext } from "@/lib/auth-client";
import { getActiveSectors, getBacNinhLocations, type LocationOption, type SectorOption } from "@/lib/master-data-client";
import {
  formatVnd,
  membershipClient,
  submitJoinApplication,
  uploadLegalDoc,
  type JoinApplication,
  type Membership,
  type MembershipTier,
} from "@/lib/membership-client";
import { ORG } from "@/lib/constants/organization";
import { WORKFORCE, suggestTier } from "@/lib/constants/membership";

const DRAFT_KEY = "baclink_join_draft_v1";

const EMPTY: JoinApplication = {
  taxCode: "", companyName: "", district: "", industrialZone: "", sectorCode: "", workforceScale: WORKFORCE[1],
  tierCode: "OFFICIAL_S", description: "", highlightProducts: "", website: "",
  representativeSalutation: "Ông", representativeName: "", representativeTitle: "", representativePhone: "", representativeEmail: "",
  assistantName: "", assistantPhone: "", assistantEmail: "",
};

type Account = { email: string; password: string; confirmPassword: string; firstName: string; lastName: string; phone: string; acceptPdpd: boolean };

const field = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900";

function Field({ label, error, children, hint }: { label: string; error?: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      {children}
      {hint && !error && <span className="mt-1 block text-xs font-normal text-slate-500">{hint}</span>}
      {error && <span role="alert" className="mt-1 block text-xs font-normal text-rose-600">{error}</span>}
    </label>
  );
}

/** CR-BACLINK-008 · T-00.BL08.16 · REQ-BL08-JOIN-005 / UI-BL08-WIZARD-003 */
export default function JoinWizardPage() {
  const [user, setUser] = useState<UserContext | null>(null);
  const [existing, setExisting] = useState<Membership | null | undefined>(undefined);
  const [step, setStep] = useState(1);
  const [acc, setAcc] = useState<Account>({ email: "", password: "", confirmPassword: "", firstName: "", lastName: "", phone: "", acceptPdpd: false });
  const [app, setApp] = useState<JoinApplication>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [agreeCharter, setAgreeCharter] = useState(false);
  const [agreeLegal, setAgreeLegal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [lookupMsg, setLookupMsg] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);

  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [sectors, setSectors] = useState<SectorOption[]>([]);
  const [areas, setAreas] = useState<LocationOption[]>([]);
  const [kcns, setKcns] = useState<LocationOption[]>([]);

  useEffect(() => {
    const u = authClient.getUser();
    setUser(u);
    if (u) {
      setStep(2);
      setApp((a) => ({ ...a, representativeEmail: a.representativeEmail || u.email || "", representativeName: a.representativeName || u.fullName || "" }));
      membershipClient.mine().then(setExisting).catch(() => setExisting(null));
    } else {
      setExisting(null);
    }
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) setApp((a) => ({ ...a, ...JSON.parse(raw) }));
    } catch {
      /* sessionStorage không khả dụng: bỏ qua nháp */
    }
    membershipClient.tiers().then(setTiers).catch(() => setTiers([]));
    getActiveSectors().then(setSectors).catch(() => setSectors([]));
    getBacNinhLocations({ type: "AREA" }).then(setAreas).catch(() => setAreas([]));
    getBacNinhLocations({ type: "KCN" }).then(setKcns).catch(() => setKcns([]));
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(app));
    } catch {
      /* ignore */
    }
  }, [app]);

  const set = (k: keyof JoinApplication) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setApp((a) => ({ ...a, [k]: e.target.value }));
  const setA = (k: keyof Account) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAcc((a) => ({ ...a, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const areaCodeOf = (loc: LocationOption) => (loc as LocationOption & { areaCode?: string | null }).areaCode;
  const kcnOptions = useMemo(() => {
    const areaCode = areas.find((a) => a.name === app.district)?.code;
    return areaCode ? kcns.filter((k) => areaCodeOf(k) === areaCode) : kcns;
  }, [areas, kcns, app.district]);
  const tier = tiers.find((t) => t.code === app.tierCode);

  // ---------------------------------------------------------------- Bước 1
  const submitAccount = async () => {
    const e: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(acc.email.trim())) e.email = "Email không hợp lệ";
    if (acc.password.length < 8) e.password = "Mật khẩu tối thiểu 8 ký tự";
    if (acc.password !== acc.confirmPassword) e.confirmPassword = "Mật khẩu xác nhận không khớp";
    if (!acc.firstName.trim()) e.firstName = "Vui lòng nhập tên";
    if (!acc.acceptPdpd) e.acceptPdpd = "Cần đồng ý chính sách bảo vệ dữ liệu cá nhân";
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy("Đang tạo tài khoản...");
    setServerError(null);
    try {
      const reg = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: acc.email.trim(), password: acc.password, confirmPassword: acc.confirmPassword,
          firstName: acc.firstName.trim(), lastName: acc.lastName.trim() || null, phone: acc.phone.trim() || null, acceptPdpd: true,
        }),
      });
      if (!reg.ok) throw new Error(await readApiError(reg, "Không tạo được tài khoản."));
      const login = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: acc.email.trim(), password: acc.password }),
      });
      if (!login.ok) throw new Error(await readApiError(login, "Tạo tài khoản thành công nhưng chưa đăng nhập được. Vui lòng đăng nhập rồi quay lại."));
      const data = await login.json();
      authClient.setSession(data.accessToken, data.user);
      setUser(data.user);
      setApp((a) => ({
        ...a,
        representativeEmail: a.representativeEmail || acc.email.trim(),
        representativePhone: a.representativePhone || acc.phone.trim(),
        representativeName: a.representativeName || `${acc.lastName} ${acc.firstName}`.trim(),
      }));
      setStep(2);
    } catch (err) {
      setServerError(userFacingRequestError(err, "Không tạo được tài khoản."));
    } finally {
      setBusy(null);
    }
  };

  // ---------------------------------------------------------------- Bước 2
  const lookupTax = async () => {
    const tax = app.taxCode.trim();
    if (!/^\d{10}(\d{3})?$/.test(tax)) {
      setErrors((e) => ({ ...e, taxCode: "Mã số thuế gồm 10 hoặc 13 chữ số" }));
      return;
    }
    setBusy("Đang tra cứu mã số thuế...");
    setLookupMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/enterprises/lookup-tax/${encodeURIComponent(tax)}`);
      const json = res.ok ? await res.json() : null;
      const d = json?.data ?? json;
      if (d?.found) {
        setApp((a) => ({ ...a, companyName: d.name || a.companyName }));
        setLookupMsg(`Đã tìm thấy: ${d.name}${d.province ? ` (${d.province})` : ""}`);
      } else {
        setLookupMsg("Không tìm thấy dữ liệu tự động — vui lòng nhập tên doanh nghiệp.");
      }
    } catch {
      setLookupMsg("Chưa tra cứu được lúc này — vui lòng nhập tay.");
    } finally {
      setBusy(null);
    }
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!/^\d{10}(\d{3})?$/.test(app.taxCode.trim())) e.taxCode = "Mã số thuế gồm 10 hoặc 13 chữ số";
    if (app.companyName.trim().length < 5) e.companyName = "Tên doanh nghiệp tối thiểu 5 ký tự";
    if (!app.district) e.district = "Chọn địa bàn";
    if (!app.sectorCode) e.sectorCode = "Chọn ngành";
    if (!app.tierCode) e.tierCode = "Chọn loại hội viên";
    if (app.description.trim().length < 20) e.description = "Giới thiệu tối thiểu 20 ký tự";
    if (!app.representativeName.trim()) e.representativeName = "Nhập tên người đại diện";
    if (!app.representativeTitle.trim()) e.representativeTitle = "Nhập chức danh";
    if (!/^[0-9+ .()-]{8,20}$/.test(app.representativePhone.trim())) e.representativePhone = "Số điện thoại không hợp lệ";
    if (app.representativeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(app.representativeEmail)) e.representativeEmail = "Email không hợp lệ";
    if (app.assistantPhone && !/^[0-9+ .()-]{8,20}$/.test(app.assistantPhone.trim())) e.assistantPhone = "Số điện thoại không hợp lệ";
    if (!file) e.file = "Tải giấy chứng nhận đăng ký doanh nghiệp (PDF)";
    else if (!file.name.toLowerCase().endsWith(".pdf")) e.file = "Chỉ nhận tệp PDF";
    else if (file.size > 10 * 1024 * 1024) e.file = "Tệp tối đa 10MB";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---------------------------------------------------------------- Bước 3
  const submitAll = async () => {
    if (!agreeCharter || !agreeLegal) {
      setErrors({ agree: "Vui lòng xác nhận cả hai cam kết" });
      return;
    }
    setServerError(null);
    try {
      setBusy("Đang tải giấy phép lên...");
      const legalDocUrl = await uploadLegalDoc(file!);
      setBusy("Đang gửi hồ sơ...");
      const { id } = await submitJoinApplication({
        ...app,
        legalDocUrl,
        legalDocFileName: file!.name,
        acceptedCharterAt: new Date().toISOString(),
      });
      setDoneId(id);
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
    } catch (err) {
      setServerError(userFacingRequestError(err, "Không gửi được hồ sơ."));
    } finally {
      setBusy(null);
    }
  };

  // ---------------------------------------------------------------- Render
  if (doneId) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-14 dark:bg-slate-950">
        <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-emerald-200 bg-white p-8 text-center dark:border-emerald-900 dark:bg-slate-900">
          <CheckCircle2 className="mx-auto size-14 text-emerald-600" aria-hidden="true" />
          <h1 className="text-xl font-extrabold">Đã gửi hồ sơ gia nhập</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Mã hồ sơ: <code className="font-bold">{doneId.slice(0, 8).toUpperCase()}</code>. Ban Quản trị {ORG.shortName} sẽ xét duyệt và liên hệ theo số {app.representativePhone}.
            Khi được duyệt, bạn nhận số chứng nhận hội viên tại Cổng hội viên.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/portal/membership" className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white">Theo dõi tại Cổng hội viên</Link>
            <Link href="/" className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold dark:border-slate-700">Về trang chủ</Link>
          </div>
        </div>
      </main>
    );
  }

  if (user && existing && existing.status !== "SUSPENDED") {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-14 dark:bg-slate-950">
        <div className="mx-auto max-w-xl space-y-3 rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <ShieldCheck className="mx-auto size-12 text-emerald-600" aria-hidden="true" />
          <h1 className="text-xl font-extrabold">{existing.enterpriseName} đã là hội viên {ORG.shortName}</h1>
          <p className="text-sm text-slate-600">Số chứng nhận {existing.certificateNo}.</p>
          <Link href="/portal/membership" className="inline-flex rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white">Xem tư cách hội viên</Link>
        </div>
      </main>
    );
  }

  const steps = ["Tài khoản", "Doanh nghiệp & người đại diện", "Xác nhận & gửi"];

  return (
    <main className="min-h-screen bg-slate-50 pb-16 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <section className="workspace-banner px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-2">
          <Link href="/hoi-vien" className="text-xs text-white/75 hover:text-white">← Quyền lợi & hội phí</Link>
          <h1 className="type-page-title text-white">Đăng ký hội viên {ORG.shortName}</h1>
          <ol className="flex flex-wrap gap-2 pt-2" aria-label="Các bước">
            {steps.map((s, i) => (
              <li key={s} aria-current={step === i + 1 ? "step" : undefined} className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${step === i + 1 ? "bg-white text-[#042142]" : step > i + 1 ? "bg-white/25" : "bg-white/10 text-white/70"}`}>
                <span>{i + 1}</span> {s}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="mx-auto mt-6 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          {step === 1 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-extrabold">Bước 1 · Tạo tài khoản</h2>
                <Link href="/login?redirect=/hoi-vien/gia-nhap" className="text-sm font-bold text-brand-700 hover:underline dark:text-cyan-300">Đã có tài khoản? Đăng nhập</Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Họ và tên đệm"><input className={field} value={acc.lastName} onChange={setA("lastName")} autoComplete="family-name" /></Field>
                <Field label="Tên *" error={errors.firstName}><input className={field} value={acc.firstName} onChange={setA("firstName")} autoComplete="given-name" /></Field>
                <Field label="Email *" error={errors.email}><input className={field} value={acc.email} onChange={setA("email")} inputMode="email" autoComplete="email" /></Field>
                <Field label="Số điện thoại"><input className={field} value={acc.phone} onChange={setA("phone")} inputMode="tel" autoComplete="tel" /></Field>
                <Field label="Mật khẩu *" error={errors.password}><input type="password" className={field} value={acc.password} onChange={setA("password")} autoComplete="new-password" /></Field>
                <Field label="Xác nhận mật khẩu *" error={errors.confirmPassword}><input type="password" className={field} value={acc.confirmPassword} onChange={setA("confirmPassword")} autoComplete="new-password" /></Field>
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={acc.acceptPdpd} onChange={setA("acceptPdpd")} className="mt-1" />
                <span>Tôi đồng ý để {ORG.shortName} xử lý dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP.</span>
              </label>
              {errors.acceptPdpd && <p role="alert" className="text-xs text-rose-600">{errors.acceptPdpd}</p>}
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-extrabold">Bước 2 · Doanh nghiệp & người đại diện</h2>
              <fieldset className="space-y-4">
                <legend className="text-sm font-bold text-brand-700 dark:text-cyan-300">Thông tin doanh nghiệp</legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Mã số thuế *" error={errors.taxCode} hint={lookupMsg ?? undefined}>
                    <div className="mt-1 flex gap-2">
                      <input className={`${field} mt-0`} value={app.taxCode} onChange={set("taxCode")} inputMode="numeric" />
                      <button type="button" onClick={lookupTax} className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-300 px-3 text-xs font-bold dark:border-slate-700">
                        <Search className="size-4" aria-hidden="true" /> Tra cứu
                      </button>
                    </div>
                  </Field>
                  <Field label="Tên doanh nghiệp *" error={errors.companyName}><input className={field} value={app.companyName} onChange={set("companyName")} /></Field>
                  <Field label="Địa bàn *" error={errors.district}>
                    <select className={field} value={app.district} onChange={(e) => setApp((a) => ({ ...a, district: e.target.value, industrialZone: "" }))}>
                      <option value="">— Chọn địa bàn —</option>
                      {areas.map((a) => <option key={a.code} value={a.name}>{a.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Khu / cụm công nghiệp">
                    <select className={field} value={app.industrialZone} onChange={set("industrialZone")}>
                      <option value="">— Ngoài KCN / chưa xác định —</option>
                      {kcnOptions.map((k) => <option key={k.code} value={k.name}>{k.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Nhóm ngành sản xuất *" error={errors.sectorCode}>
                    <select className={field} value={app.sectorCode} onChange={set("sectorCode")}>
                      <option value="">— Chọn ngành —</option>
                      {sectors.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Quy mô lao động">
                    <select className={field} value={app.workforceScale} onChange={(e) => setApp((a) => ({ ...a, workforceScale: e.target.value, tierCode: suggestTier(e.target.value) }))}>
                      {WORKFORCE.map((w) => <option key={w}>{w}</option>)}
                    </select>
                  </Field>
                  <Field label="Loại hội viên đăng ký *" error={errors.tierCode} hint={tier ? `Hội phí: ${formatVnd(tier.annualFee)}/năm · ${tier.audience ?? ""}` : undefined}>
                    <select className={field} value={app.tierCode} onChange={set("tierCode")}>
                      {tiers.map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Website"><input className={field} value={app.website} onChange={set("website")} inputMode="url" /></Field>
                </div>
                <Field label="Giới thiệu doanh nghiệp *" error={errors.description}>
                  <textarea className={`${field} min-h-24`} value={app.description} onChange={set("description")} maxLength={2000} />
                </Field>
                <Field label="Sản phẩm / năng lực nổi bật"><input className={field} value={app.highlightProducts} onChange={set("highlightProducts")} /></Field>
              </fieldset>

              <fieldset className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                <legend className="text-sm font-bold text-brand-700 dark:text-cyan-300">Người đại diện</legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Danh xưng">
                    <select className={field} value={app.representativeSalutation} onChange={set("representativeSalutation")}>
                      <option>Ông</option>
                      <option>Bà</option>
                    </select>
                  </Field>
                  <Field label="Họ và tên *" error={errors.representativeName}><input className={field} value={app.representativeName} onChange={set("representativeName")} /></Field>
                  <Field label="Chức danh *" error={errors.representativeTitle}><input className={field} value={app.representativeTitle} onChange={set("representativeTitle")} placeholder="Giám đốc, Chủ tịch HĐQT..." /></Field>
                  <Field label="Số điện thoại *" error={errors.representativePhone}><input className={field} value={app.representativePhone} onChange={set("representativePhone")} inputMode="tel" /></Field>
                  <Field label="Email" error={errors.representativeEmail}><input className={field} value={app.representativeEmail} onChange={set("representativeEmail")} inputMode="email" /></Field>
                </div>
              </fieldset>

              <fieldset className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                <legend className="text-sm font-bold text-brand-700 dark:text-cyan-300">Trợ lý / thư ký làm đầu mối (không bắt buộc)</legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Họ và tên"><input className={field} value={app.assistantName} onChange={set("assistantName")} /></Field>
                  <Field label="Số điện thoại" error={errors.assistantPhone}><input className={field} value={app.assistantPhone} onChange={set("assistantPhone")} inputMode="tel" /></Field>
                  <Field label="Email"><input className={field} value={app.assistantEmail} onChange={set("assistantEmail")} inputMode="email" /></Field>
                </div>
              </fieldset>

              <Field label="Giấy chứng nhận đăng ký doanh nghiệp (PDF, ≤ 10MB) *" error={errors.file}>
                <span className="mt-1 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700">
                  <Upload className="size-5 text-slate-400" aria-hidden="true" />
                  <input type="file" accept="application/pdf,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" aria-label="Chọn tệp giấy phép" />
                </span>
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-lg font-extrabold">Bước 3 · Xác nhận & gửi hồ sơ</h2>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2 dark:bg-slate-800/50">
                {[
                  ["Doanh nghiệp", `${app.companyName} (MST ${app.taxCode})`],
                  ["Địa bàn", [app.district, app.industrialZone].filter(Boolean).join(" · ")],
                  ["Ngành", sectors.find((s) => s.code === app.sectorCode)?.name ?? app.sectorCode],
                  ["Loại hội viên", tier ? `${tier.name} — ${formatVnd(tier.annualFee)}/năm` : app.tierCode],
                  ["Người đại diện", `${app.representativeSalutation} ${app.representativeName} — ${app.representativeTitle}`],
                  ["Liên hệ", [app.representativePhone, app.representativeEmail].filter(Boolean).join(" · ")],
                  ["Trợ lý / thư ký", [app.assistantName, app.assistantPhone].filter(Boolean).join(" · ") || "—"],
                  ["Giấy phép", file?.name ?? "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-slate-500">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={agreeCharter} onChange={(e) => setAgreeCharter(e.target.checked)} className="mt-1" />
                <span>Tôi đã đọc và tán thành Điều lệ Hiệp hội, quyền và nghĩa vụ hội viên; đồng ý đóng hội phí theo quy định.</span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={agreeLegal} onChange={(e) => setAgreeLegal(e.target.checked)} className="mt-1" />
                <span>Tôi cam kết thông tin và tài liệu cung cấp là trung thực, hợp pháp.</span>
              </label>
              {errors.agree && <p role="alert" className="text-xs text-rose-600">{errors.agree}</p>}
            </>
          )}

          {serverError && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{serverError}</p>}

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            {step > (user ? 2 : 1) ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold dark:border-slate-700">
                <ChevronLeft className="size-4" aria-hidden="true" /> Quay lại
              </button>
            ) : <span />}
            <button
              type="button"
              disabled={!!busy || existing === undefined}
              onClick={() => (step === 1 ? submitAccount() : step === 2 ? validateStep2() && setStep(3) : submitAll())}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-800 disabled:opacity-60"
            >
              {busy ? <><Loader2 className="size-4 animate-spin" aria-hidden="true" /> {busy}</> : step === 3 ? "Gửi hồ sơ gia nhập" : <>Tiếp tục <ChevronRight className="size-4" aria-hidden="true" /></>}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
