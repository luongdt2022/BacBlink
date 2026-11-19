"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, Send } from "lucide-react";
import { CONTACT_TOPICS, submitContactRequest, type ContactTopic } from "@/lib/contact-client";
import { userFacingRequestError } from "@/lib/api-client";
import { ORG } from "@/lib/constants/organization";

/** Form liên hệ dùng chung cho trang /lien-he và popup — CR-BACLINK-008 · REQ-BL08-CONTACT-009 */
export function ContactForm({
  defaultTopic = "GENERAL",
  defaultMessage = "",
  onSubmitted,
}: {
  defaultTopic?: ContactTopic;
  defaultMessage?: string;
  onSubmitted?: (id: string) => void;
}) {
  const pathname = usePathname();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    organization: "",
    topic: defaultTopic as ContactTopic,
    message: defaultMessage,
    website: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Vui lòng nhập họ và tên";
    if (!form.phone.trim() && !form.email.trim()) e.phone = "Cần số điện thoại hoặc email để Hiệp hội liên hệ lại";
    if (form.phone.trim() && !/^[0-9+ .()-]{8,20}$/.test(form.phone.trim())) e.phone = "Số điện thoại không hợp lệ";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Email không hợp lệ";
    if (form.message.trim().length < 10) e.message = "Nội dung tối thiểu 10 ký tự";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { id } = await submitContactRequest({
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        organization: form.organization.trim() || undefined,
        topic: form.topic,
        message: form.message.trim(),
        sourcePath: pathname ?? undefined,
        website: form.website,
      });
      setDoneId(id);
      onSubmitted?.(id);
    } catch (err) {
      setServerError(userFacingRequestError(err, "Không gửi được yêu cầu. Vui lòng thử lại."));
    } finally {
      setSubmitting(false);
    }
  };

  if (doneId) {
    return (
      <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-2 dark:border-emerald-900 dark:bg-emerald-950/40">
        <CheckCircle2 className="mx-auto size-10 text-emerald-600" aria-hidden="true" />
        <p className="font-bold text-emerald-900 dark:text-emerald-200">Đã gửi yêu cầu thành công</p>
        <p className="text-sm text-emerald-800 dark:text-emerald-300">
          Văn phòng {ORG.shortName} sẽ liên hệ lại trong giờ hành chính.
        </p>
      </div>
    );
  }

  const field = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900";
  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-rose-600">{errors[k]}</p>;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3" aria-label="Biểu mẫu gửi yêu cầu">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Họ và tên *
          <input className={`${field} mt-1`} value={form.fullName} onChange={set("fullName")} autoComplete="name" />
          {err("fullName")}
        </label>
        <label className="block text-sm font-semibold">
          Doanh nghiệp / Tổ chức
          <input className={`${field} mt-1`} value={form.organization} onChange={set("organization")} autoComplete="organization" />
        </label>
        <label className="block text-sm font-semibold">
          Số điện thoại
          <input className={`${field} mt-1`} value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" />
          {err("phone")}
        </label>
        <label className="block text-sm font-semibold">
          Email
          <input className={`${field} mt-1`} value={form.email} onChange={set("email")} inputMode="email" autoComplete="email" />
          {err("email")}
        </label>
      </div>
      <label className="block text-sm font-semibold">
        Bạn cần hỗ trợ về
        <select className={`${field} mt-1`} value={form.topic} onChange={set("topic")}>
          {CONTACT_TOPICS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold">
        Nội dung *
        <textarea className={`${field} mt-1 min-h-28`} value={form.message} onChange={set("message")} maxLength={4000} />
        {err("message")}
      </label>
      {/* Honeypot: ẩn với người dùng thật */}
      <input type="text" name="website" value={form.website} onChange={set("website")} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {serverError && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{serverError}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-800 disabled:opacity-60"
      >
        <Send className="size-4" aria-hidden="true" /> {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
      </button>
    </form>
  );
}
