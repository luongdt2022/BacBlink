"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Inbox,
  Calendar,
  CheckCircle2,
  Clock,
  Video,
  Star,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  X,
  Building2,
  ShieldAlert,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { AppButton } from "@/components/ui/design-system";
import { Async, UXState } from "@/components/ui/async";
import { useToast } from "@/components/common/toast";
import {
  buyerConsultationsApi,
  BuyerConsultationTicket,
} from "@/services/api/buyer-consultations";

export default function BuyerConsultationsPage() {
  return (
    <RoleGuard
      allowedRoles={[
        "BUYER",
        "ENTERPRISE",
        "INNOVATION_ENTITY",
        "PUBLIC_USER",
        "VERIFIED_EXPERT",
        "EXPERT",
        "SELLER",
      ]}
      portalName="Quản Lý Yêu Cầu Tư Vấn Chuyên Gia"
    >
      <BuyerConsultationsContent />
    </RoleGuard>
  );
}

type TabFilter = "ALL" | "PENDING" | "SCHEDULED" | "COMPLETED" | "REJECTED";

function BuyerConsultationsContent() {
  const toast = useToast();
  const [uxState, setUxState] = useState<UXState>("loading");
  const [tickets, setTickets] = useState<BuyerConsultationTicket[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>("ALL");

  // Review modal state
  const [reviewingTicket, setReviewingTicket] = useState<BuyerConsultationTicket | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadData = async () => {
    setUxState("loading");
    try {
      const data = await buyerConsultationsApi.getMyConsultations();
      setTickets(data);
      setUxState(data.length === 0 ? "empty" : "idle");
    } catch {
      setUxState("error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === "ALL") return true;
    return t.status?.toUpperCase() === activeTab;
  });

  const handleOpenReview = (ticket: BuyerConsultationTicket) => {
    setReviewingTicket(ticket);
    setRating(5);
    setComment("");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingTicket) return;

    setIsSubmittingReview(true);
    try {
      const res = await buyerConsultationsApi.reviewConsultation(reviewingTicket.id, {
        rating,
        comment,
      });

      setTickets((prev) =>
        prev.map((t) =>
          t.id === reviewingTicket.id
            ? {
                ...t,
                rating: res.rating ?? rating,
                reviewComment: res.reviewComment ?? comment,
                reviewedAt: res.reviewedAt ?? new Date().toISOString(),
              }
            : t
        )
      );

      toast.success("Cảm ơn bạn đã gửi đánh giá buổi tư vấn!", "Thành Công");
      setReviewingTicket(null);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi gửi đánh giá tư vấn.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="w-3 h-3" />
            <span>Chờ Chuyên Gia Tiếp Nhận</span>
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Calendar className="w-3 h-3" />
            <span>Đã Lên Lịch Hẹn</span>
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300">
            <CheckCircle2 className="w-3 h-3" />
            <span>Đã Hoàn Thành</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300">
            <AlertTriangle className="w-3 h-3" />
            <span>Chuyên Gia Từ Chối</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Inbox className="w-6 h-6 text-brand-700 dark:text-teal-400" />
            <span>Yêu Cầu Tư Vấn &amp; Kết Nối Chuyên Gia</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi tiến trình phản hồi 2 chiều, lịch hẹn trực tuyến và gửi đánh giá nghiệm thu với Chuyên gia R&amp;D.
          </p>
        </div>
        <Link
          href="/experts"
          className="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-xs whitespace-nowrap self-start sm:self-auto"
        >
          <span>Khám phá chuyên gia</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {(
          [
            { key: "ALL", label: `Tất cả (${tickets.length})` },
            {
              key: "PENDING",
              label: `Chờ xử lý (${tickets.filter((t) => t.status === "PENDING").length})`,
            },
            {
              key: "SCHEDULED",
              label: `Đã có lịch (${tickets.filter((t) => t.status === "SCHEDULED").length})`,
            },
            {
              key: "COMPLETED",
              label: `Đã xong (${tickets.filter((t) => t.status === "COMPLETED").length})`,
            },
            {
              key: "REJECTED",
              label: `Từ chối (${tickets.filter((t) => t.status === "REJECTED").length})`,
            },
          ] as { key: TabFilter; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-brand-700 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content with Async 5 UX States */}
      <Async
        state={uxState}
        onRetry={loadData}
        emptyContent={
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-3">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">
              Bạn chưa gửi yêu cầu tư vấn nào
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Hãy duyệt danh bạ chuyên gia KH&CN của Viện NacenTech và gửi phiếu bài toán R&amp;D cần tư vấn giải pháp.
            </p>
            <Link
              href="/experts"
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl transition"
            >
              <span>Xem danh bạ chuyên gia</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        }
      >
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-xs text-slate-500">
            Không có yêu cầu tư vấn nào trong mục này.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                data-testid={`buyer-consultation-card-${ticket.ticketCode}`}
              >
                {/* Header Card */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {ticket.ticketCode}
                    </span>
                    {getStatusBadge(ticket.status)}
                  </div>
                  {ticket.requestedAt && (
                    <span className="text-[11px] text-slate-400">
                      Gửi ngày: {new Date(ticket.requestedAt).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                </div>

                {/* Body Card */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {ticket.demandTitle}
                    </h3>
                    {ticket.expertName && (
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        Chuyên gia:{" "}
                        {ticket.expertCode ? (
                          <Link
                            href={`/experts/${encodeURIComponent(ticket.expertCode)}`}
                            className="font-bold text-brand-700 hover:underline dark:text-teal-400 inline-flex items-center gap-1"
                          >
                            <span>{ticket.expertName}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <strong className="text-slate-800 dark:text-slate-200">{ticket.expertName}</strong>
                        )}
                      </div>
                    )}
                  </div>
                  {ticket.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {ticket.description}
                    </p>
                  )}
                </div>

                {/* SCHEDULED: Lịch hẹn & link phòng họp */}
                {ticket.status === "SCHEDULED" && (
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>
                          Lịch hẹn: {ticket.meetingDate || (ticket.scheduledAt ? new Date(ticket.scheduledAt).toLocaleDateString("vi-VN") : "")}
                          {ticket.meetingTime ? ` · ${ticket.meetingTime}` : ""}
                        </span>
                      </div>
                      {(ticket.meetingLink || ticket.meetingUrl) && (
                        <a
                          href={ticket.meetingLink || ticket.meetingUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Vào Phòng Họp</span>
                        </a>
                      )}
                    </div>
                    {ticket.expertNote && (
                      <p className="text-emerald-800 dark:text-emerald-300 italic pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
                        Lời nhắn từ chuyên gia: "{ticket.expertNote}"
                      </p>
                    )}
                  </div>
                )}

                {/* REJECTED: Lý do từ chối */}
                {ticket.status === "REJECTED" && (
                  <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Chuyên gia phản hồi lý do không thể tiếp nhận:</span>
                    </div>
                    <p className="text-rose-800 dark:text-rose-300 italic">
                      "{ticket.rejectionReason || "Chuyên gia bận công tác hoặc đề tài chưa phù hợp phạm vi chuyên môn."}"
                    </p>
                  </div>
                )}

                {/* COMPLETED: Đánh giá & nhận xét */}
                {ticket.status === "COMPLETED" && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-2">
                    {ticket.rating ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < (ticket.rating || 5)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300 dark:text-slate-600"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 ml-1">
                            Bạn đã đánh giá ({ticket.rating}/5 sao):
                          </span>
                        </div>
                        {ticket.reviewComment && (
                          <p className="text-slate-600 dark:text-slate-300 italic">
                            "{ticket.reviewComment}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-slate-600 dark:text-slate-400">
                          Phiên tư vấn đã kết thúc. Vui lòng gửi đánh giá để giúp nâng cao chất lượng mạng lưới chuyên gia.
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenReview(ticket)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition"
                          data-testid={`btn-review-${ticket.ticketCode}`}
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Đánh giá buổi tư vấn</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Async>

      {/* Review Modal */}
      {reviewingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Đánh Giá Buổi Tư Vấn
              </h3>
              <button
                type="button"
                onClick={() => setReviewingTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Mã phiếu: <strong className="font-mono text-slate-800 dark:text-slate-200">{reviewingTicket.ticketCode}</strong>
              {reviewingTicket.expertName && ` · Chuyên gia: ${reviewingTicket.expertName}`}
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mức độ hài lòng:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition"
                      data-testid={`star-${star}`}
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-600 ml-2">
                    {rating === 5
                      ? "Rất hài lòng"
                      : rating === 4
                      ? "Hài lòng"
                      : rating === 3
                      ? "Bình thường"
                      : rating === 2
                      ? "Chưa hài lòng"
                      : "Không hài lòng"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nhận xét đóng góp ý kiến:
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận về giải pháp kỹ thuật, thái độ tư vấn hoặc đề xuất hợp tác tiếp theo..."
                  className="w-full min-h-24 rounded-xl border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-brand-700 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReviewingTicket(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-700 hover:bg-brand-800 text-white transition disabled:opacity-50"
                  data-testid="btn-submit-review"
                >
                  {isSubmittingReview ? "Đang gửi..." : "Gửi Đánh Giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
