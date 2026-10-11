"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bot, X, Send, Sparkles, ArrowRight, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { portalClient, AiQuickAssistResponse, AiSuggestionItem } from "@/lib/portal-client";

interface Message {
  sender: "user" | "ai";
  text: string;
  topic?: string;
  redirectUrl?: string;
  suggestions?: AiSuggestionItem[];
}

function renderFormattedMessage(text: string, onLinkClick: () => void): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, lIdx) => {
    const parts: React.ReactNode[] = [];
    const pattern = /\[([^\]]+)\]\(([^)]+)\)|(\*\*([^*]+)\*\*)|(`([^`]+)`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      if (match[1] && match[2]) {
        // [label](url)
        parts.push(
          <Link
            key={`${lIdx}-${match.index}`}
            href={match[2]}
            onClick={onLinkClick}
            className="font-bold text-brand-600 underline hover:text-brand-800 dark:text-teal-400 dark:hover:text-teal-300"
          >
            {match[1]}
          </Link>
        );
      } else if (match[4]) {
        // **bold**
        parts.push(
          <strong key={`${lIdx}-${match.index}`} className="font-bold text-slate-900 dark:text-white">
            {match[4]}
          </strong>
        );
      } else if (match[6]) {
        // `code`
        parts.push(
          <code
            key={`${lIdx}-${match.index}`}
            className="rounded bg-slate-200 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-700 dark:text-slate-200"
          >
            {match[6]}
          </code>
        );
      }
      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return (
      <React.Fragment key={lIdx}>
        {parts.length > 0 ? parts : "\u00A0"}
        {lIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
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
    "Tìm cho tôi chuyên gia Minh An",
    "Lịch sự kiện & phiên chào giá Techmart 2026?",
    "Công nghệ của tôi đạt mức TRL nào theo TT17?",
  ];

  const handleSend = async (promptToSend?: string) => {
    const text = (promptToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setShowQuickPrompts(false); // Thu gọn gợi ý khi người dùng gửi tin
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
        <div className="fixed bottom-24 right-6 z-50 flex w-[94vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all sm:max-w-md dark:border-slate-800 dark:bg-slate-900">
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
          <div className="flex h-[380px] max-h-[60vh] flex-col gap-3 overflow-y-auto p-4 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 ${
                    m.sender === "user"
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  <div className="leading-relaxed whitespace-pre-wrap">
                    {renderFormattedMessage(m.text, () => setIsOpen(false))}
                  </div>

                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-200/80 pt-2 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Gợi ý từ CSDL:
                      </span>
                      {m.suggestions.map((sug, sIdx) => (
                        <Link
                          key={sIdx}
                          href={sug.url}
                          onClick={() => setIsOpen(false)}
                          className="group/card flex flex-col rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-brand-500 hover:bg-brand-50/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-brand-950/40"
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
                    <div className="mt-2.5 border-t border-slate-200/60 pt-2 dark:border-slate-700">
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
                <span className="text-xs">AI đang phân tích & truy xuất CSDL...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Collapsible Header & Content */}
          <div className="border-t border-slate-200 bg-slate-50/90 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/50">
            <button
              type="button"
              onClick={() => setShowQuickPrompts((prev) => !prev)}
              className="flex w-full items-center justify-between text-xs font-bold text-slate-600 transition hover:text-brand-700 dark:text-slate-300 dark:hover:text-teal-300"
              aria-expanded={showQuickPrompts}
              aria-label="Ẩn hiện câu hỏi gợi ý nhanh"
            >
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="size-3.5 text-brand-600 dark:text-teal-400" />
                Câu hỏi gợi ý nhanh ({quickPrompts.length})
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-teal-400">
                {showQuickPrompts ? "Thu gọn" : "Xem gợi ý"}
                {showQuickPrompts ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronUp className="size-4" />
                )}
              </span>
            </button>

            {showQuickPrompts && (
              <div className="mt-2 flex flex-col gap-1.5 transition-all">
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
            )}
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
              className="form-control flex-1 text-xs"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40 shrink-0"
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
