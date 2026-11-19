import React from "react";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { ContactForm } from "@/components/common/contact-form";
import { CommitteeContactButton } from "./committee-contact-button";
import { BACLINK_COMMITTEES, ORG } from "@/lib/constants/organization";
import { ContactFaq } from "./contact-faq";
import { TopicButton } from "./committee-contact-button";

export const metadata = {
  title: `Liên hệ & hợp tác | ${ORG.shortName}`,
  description: `Văn phòng ${ORG.fullName}: ${ORG.address}. Gửi yêu cầu hỗ trợ trực tuyến.`,
};

/** CR-BACLINK-008 · T-00.BL08.09 · REQ-BL08-CONTACT-009 */
export default function LienHePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <section className="workspace-banner text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-brand-800">
        <div className="max-w-7xl mx-auto space-y-2">
          <h1 className="type-page-title text-white">Liên hệ & hợp tác</h1>
          <p className="text-white/85 text-sm max-w-3xl">
            Gửi yêu cầu hỗ trợ, đề xuất hợp tác – tài trợ, liên hệ truyền thông hoặc kết nối với các ban chuyên môn của {ORG.shortName}.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Văn phòng */}
        <section aria-labelledby="van-phong" className="lg:col-span-2 space-y-4">
          <h2 id="van-phong" className="type-section-title text-slate-900 dark:text-white">Văn phòng Hiệp hội</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3"><MapPin className="size-5 shrink-0 text-brand-600" aria-hidden="true" /><span>{ORG.address}</span></li>
            <li className="flex items-center gap-3"><Clock className="size-5 shrink-0 text-brand-600" aria-hidden="true" /><span>Giờ hành chính, thứ Hai – thứ Sáu</span></li>
          </ul>
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <iframe
              title={`Bản đồ ${ORG.mapEmbedQuery}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(ORG.mapEmbedQuery)}&z=14&output=embed`}
              className="h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        {/* Biểu mẫu */}
        <section aria-labelledby="gui-yeu-cau" className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 id="gui-yeu-cau" className="type-section-title text-slate-900 dark:text-white">Gửi yêu cầu hỗ trợ</h2>
          <ContactForm />
        </section>
      </div>

      {/* Đầu mối các ban */}
      <section id="dau-moi-cac-ban" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 space-y-4 scroll-mt-28">
        <h2 className="type-section-title text-slate-900 dark:text-white">Đầu mối các ban chuyên môn</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Thông tin trưởng ban đang được cập nhật. Trong thời gian này, Văn phòng Hiệp hội tiếp nhận và chuyển yêu cầu tới ban phụ trách.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BACLINK_COMMITTEES.map((c) => (
            <div key={c.code} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-sm font-semibold">{c.name}</span>
              <CommitteeContactButton committeeName={c.name} />
            </div>
          ))}
        </div>
      </section>

      {/* Hợp tác & tài trợ · Truyền thông & báo chí (góp ý khách hàng, Menu 7) */}
      <section id="hop-tac" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 grid grid-cols-1 gap-4 md:grid-cols-2 scroll-mt-28">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <h2 className="font-extrabold text-slate-900 dark:text-white">Hợp tác & tài trợ</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Doanh nghiệp, tổ chức muốn đồng hành, tài trợ sự kiện hoặc đề xuất chương trình hợp tác với Hiệp hội.</p>
          <TopicButton topic="PARTNERSHIP" note="Tôi muốn trao đổi về hợp tác / tài trợ: " label="Gửi đề xuất hợp tác" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <h2 className="font-extrabold text-slate-900 dark:text-white">Truyền thông & báo chí</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Cơ quan báo chí, đơn vị truyền thông cần thông tin, hình ảnh hoặc phỏng vấn đại diện Hiệp hội.</p>
          <TopicButton topic="PRESS" note="Tôi là đại diện cơ quan báo chí/truyền thông, cần: " label="Liên hệ truyền thông" />
        </div>
      </section>

      <ContactFaq />
    </main>
  );
}
