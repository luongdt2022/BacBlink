"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bot, X, Send, Sparkles, ArrowRight, CornerDownLeft, Loader2 } from "lucide-react";
import { portalClient, AiQuickAssistResponse, AiSuggestionItem } from "@/lib/portal-client";

interface Message {
  sender: "user" | "ai";
  text: string;
  topic?: string;
  redirectUrl?: string;
  suggestions?: AiSuggestionItem[];
}

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Xin chào! Tôi là Trợ lý Ảo AI NacentTwin — kết nối trực tiếp với CSDL Sàn Giao dịch Công nghệ Quốc Gia.\n\nTôi có thể hỗ trợ bạn:\n• 🔍 Tra cứu danh bạ Chuyên gia KH&CN thực tế theo ngành\n• 🎪 Lịch các phiên chào giá & đăng ký tham quan Techmart 2026\n• 🎯 Đánh giá cấp độ sẵn sàng công nghệ TRL 1-9 theo TT17\n• 💰 Hướng dẫn phương pháp định giá công nghệ & hợp đồng li-xăng\n• 🤝 Đăng ký chào bán hoặc gửi bài toán nhu cầu doanh nghiệp\n\nBạn cần hỗ trợ tra cứu nội dung nào hôm nay?",
      suggestions: [
        {
          title: "Tìm chuyên gia IT / AI",
          subtitle: "Tra cứu danh bạ chuyên gia CNTT & Trí tuệ nhân tạo",
          url: "/experts?q=IT",
          tag: "CHUYÊN GIA",
        },
        {
          title: "Sàn Triển lãm Techmart 2026",
          subtitle: "Lịch các phiên chào giá & đăng ký vé tham quan",
          url: "/trien-lam",
          tag: "SỰ KIỆN",
        },
      ],
    },
  ]);

  React.useEffect(() => {
    const handleCustomOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.prompt) {
        void handleSend(customEvent.detail.prompt);
      }
    };
    window.addEventListener("nacen:open-ai-assistant", handleCustomOpen);
    return () => window.removeEventListener("nacen:open-ai-assistant", handleCustomOpen);
  }, []);

  const quickPrompts = [
    "Tìm cho tôi 1 chuyên gia IT",
    "Lịch sự kiện & phiên chào giá Techmart 2026?",
    "Công nghệ của tôi đạt mức TRL nào theo TT17?",
    "Tư vấn định giá chuyển nhượng sáng chế sinh học?",
  ];

  const handleSend = async (promptToSend?: string) => {
    const text = (promptToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res: AiQuickAssistResponse = await portalClient.quickAiAssist(text);
      const aiMsg: Message = {
        sender: "ai",
        text: res.reply,
        topic: res.suggestedTopic,
        redirectUrl: res.redirectUrl,
        suggestions: res.suggestions,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Xin lỗi, hiện tại hệ thống AI đang bận. Bạn có thể tra cứu trực tiếp tại danh mục Chào bán hoặc Nhu cầu.",
          redirectUrl: "/chao-ban-cong-nghe",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="group relative flex size-14 items-center justify-center rounded-full bg-gradient-to-tr from-brand-700 to-brand-900 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-brand-300 dark:focus:ring-brand-900"
          aria-label="Mở Trợ lý Ảo AI NacentTwin"
        >
          {isOpen ? (
            <X className="size-6 transition-transform group-hover:rotate-90" />
          ) : (
            <>
              <Bot className="size-7" />
              <span className="absolute -top-1 -right-1 flex size-4">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-4 rounded-full bg-emerald-500" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* Slide-over Chat Box Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all sm:max-w-md dark:border-slate-800 dark:bg-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-brand-800 via-brand-700 to-brand-900 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-xl bg-white/15">
                <Bot className="size-5 text-teal-200" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">Trợ Lý Ảo AI NacentTwin</h3>
                <p className="flex items-center gap-1.5 text-xs text-teal-200/90 font-medium">
                  <Sparkles className="size-3" />
                  Định hướng TRL & Ghép cặp Cung–Cầu
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
              aria-label="Đóng trợ lý"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Conversation Area */}
          <div className="flex h-80 flex-col gap-3 overflow-y-auto p-4 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                    m.sender === "user"
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-2.5 flex flex-col gap-1.5 pt-2 border-t border-slate-200/80 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Gợi ý truy xuất từ CSDL:
                      </span>
                      {m.suggestions.map((sug, sIdx) => (
                        <Link
                          key={sIdx}
                          href={sug.url}
                          onClick={() => setIsOpen(false)}
                          className="group/card flex flex-col rounded-xl border border-slate-200 bg-white p-2 text-left transition hover:border-brand-500 hover:bg-brand-50/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-brand-950/40"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-slate-900 group-hover/card:text-brand-700 dark:text-white dark:group-hover/card:text-brand-300">
                              {sug.title}
                            </span>
                            {sug.tag && (
                              <span className="rounded bg-brand-100 px-1.5 py-0.5 text-xs font-semibold text-brand-800 dark:bg-brand-900/60 dark:text-brand-200">
                                {sug.tag}
                              </span>
                            )}
                          </div>
                          <span className="mt-0.5 text-xs text-slate-600 line-clamp-2 dark:text-slate-400">
                            {sug.subtitle}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {m.redirectUrl && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                      <Link
                        href={m.redirectUrl}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-800 dark:text-teal-400 dark:hover:text-teal-300"
                      >
                        Khám phá ngay <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="size-4 animate-spin text-brand-600" />
                <span className="text-xs">AI đang phân tích câu hỏi...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="border-t border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Câu hỏi gợi ý nhanh:
            </p>
            <div className="flex flex-col gap-1.5">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi hoặc nhu cầu công nghệ..."
              className="form-control flex-1 text-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-11 w-11 grid place-items-center rounded-control bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40 shrink-0"
              aria-label="Gửi tin nhắn"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
