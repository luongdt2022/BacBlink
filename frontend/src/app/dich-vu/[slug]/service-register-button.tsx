"use client";

import React from "react";
import { openContactModal } from "@/lib/contact-client";

/** Mở popup liên hệ với chủ đề "Đăng ký dịch vụ" và lời nhắn gợi ý — yêu cầu vào hộp thư xử lý của Admin. */
export function ServiceRegisterButton({ title }: { title: string }) {
  return (
    <button
      type="button"
      onClick={() => openContactModal("SERVICE", `Tôi muốn đăng ký dịch vụ: ${title}. Nhu cầu cụ thể: `)}
      className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-800"
    >
      Gửi yêu cầu đăng ký
    </button>
  );
}
