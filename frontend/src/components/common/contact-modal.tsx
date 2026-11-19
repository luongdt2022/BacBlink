"use client";

import React, { useEffect, useState } from "react";
import { AppModal } from "@/components/ui/app-modal";
import { ContactForm } from "./contact-form";
import { OPEN_CONTACT_EVENT, type ContactTopic } from "@/lib/contact-client";

/** Popup liên hệ dùng chung toàn site — mở bằng `openContactModal()` (CR-BACLINK-008). */
export function ContactModalHost() {
  const [state, setState] = useState<{ open: boolean; topic: ContactTopic; note: string; key: number }>({
    open: false,
    topic: "GENERAL",
    note: "",
    key: 0,
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ topic?: ContactTopic; note?: string }>).detail ?? {};
      setState((s) => ({ open: true, topic: detail.topic ?? "GENERAL", note: detail.note ?? "", key: s.key + 1 }));
    };
    window.addEventListener(OPEN_CONTACT_EVENT, handler);
    return () => window.removeEventListener(OPEN_CONTACT_EVENT, handler);
  }, []);

  return (
    <AppModal
      isOpen={state.open}
      onClose={() => setState((s) => ({ ...s, open: false }))}
      title="Gửi yêu cầu tới Hiệp hội BACLINK"
      description="Để lại thông tin, Văn phòng Hiệp hội sẽ liên hệ lại với bạn."
      size="md"
    >
      <ContactForm key={state.key} defaultTopic={state.topic} defaultMessage={state.note} />
    </AppModal>
  );
}
