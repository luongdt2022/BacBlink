"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Inbox,
  Calendar,
  CheckCheck,
  Shield,
  Building2,
  Clock,
  MapPin,
  CalendarCheck,
  X,
  AlertTriangle,
  ArrowLeft,
  Video,
  FileText,
  Download,
  Star,
  DollarSign,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { AppButton } from "@/components/ui/design-system";
import { Async, UXState } from "@/components/ui/async";
import { authClient, UserContext } from "@/lib/auth-client";
import { useToast } from "@/components/common/toast";
import { ConsultationTicket } from "@/lib/consultations";
import { expertConsultationsApi } from "@/services/api/expert-consultations";

export default function ExpertConsultationsPage() {
  return (
    <RoleGuard
      allowedRoles={["VERIFIED_EXPERT", "EXPERT"]}
      portalName="Hộp Thư Tư Vấn & Kết Nối"
    >
      <ExpertConsultationsContent />
    </RoleGuard>
  );
}

function ExpertConsultationsContent() {
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState<UserContext | null>(null);
  const [uxState, setUxState] = useState<UXState>("loading");
  const [activeTab, setActiveTab] = useState<"pending" | "scheduled" | "completed">("pending");

  // Tickets state
  const [pendingList, setPendingList] = useState<ConsultationTicket[]>([]);
  const [scheduledList, setScheduledList] = useState<ConsultationTicket[]>([]);
  const [completedList, setCompletedList] = useState<ConsultationTicket[]>([]);

  // Modal states
  const [acceptingTicket, setAcceptingTicket] = useState<ConsultationTicket | null>(null);
  const [scheduledDate, setScheduledDate] = useState("2026-10-16");
  const [scheduledTime, setScheduledTime] = useState("14:00 - 16:00");
  const [meetingType, setMeetingType] = useState("Trực tuyến qua Zoom");
  const [meetingUrl, setMeetingUrl] = useState("https://zoom.us/j/982348271");
  const [expertNote, setExpertNote] = useState("");

  const [rejectingTicket, setRejectingTicket] = useState<ConsultationTicket | null>(null);
  const [rejectionReasonCategory, setRejectionReasonCategory] = useState("Trùng lịch công tác");
  const [rejectionNote, setRejectionNote] = useState("");
  const [rejectionError, setRejectionError] = useState("");

  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    setUxState("loading");
    try {
      const user = authClient.getUser();
      setCurrentUser(user);
      const tickets = await expertConsultationsApi.getMyConsultations();
      setPendingList(tickets.filter((t) => t.status === "PENDING"));
      setScheduledList(tickets.filter((t) => t.status === "SCHEDULED"));
      setCompletedList(tickets.filter((t) => t.status === "COMPLETED"));
      setUxState("idle");
    } catch {
      setUxState("error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isPendingApprovalRole = currentUser?.role?.toUpperCase() === "EXPERT";

  // Handlers
  const handleOpenAcceptModal = (ticket: ConsultationTicket) => {
    if (isPendingApprovalRole && ticket.source === "DEPT_ASSIGNED") {
      toast.warning(
        "Hồ sơ Chuyên gia đang chờ Sở KH&CN phê duyệt. Chưa thể tiếp nhận yêu cầu ủy thác có thù lao Quỹ ĐMST.",
        "Chờ Duyệt Hồ Sơ"
      );
      return;
    }
    setAcceptingTicket(ticket);
    setExpertNote("");
  };

  const handleConfirmAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptingTicket) return;

    try {
      await expertConsultationsApi.respondConsultation(acceptingTicket.id, {
        action: "ACCEPT",
        meetingDate: scheduledDate,
        meetingTime: scheduledTime,
        meetingType,
        meetingUrl,
        expertNote,
      });

      const newScheduledTicket: ConsultationTicket = {
        ...acceptingTicket,
        status: "SCHEDULED",
        meetingDate: scheduledDate,
        meetingTime: scheduledTime,
        meetingType,
        meetingUrl,
        canJoinMeeting: false,
        meetingCountdownText: "Sẽ mở trước giờ họp 15 phút",
        preReadMaterials: acceptingTicket.preReadMaterials || [
          { name: "Phieu_khao_sat_nhu_cau_TNI.pdf", size: "1.2 MB", url: "#" },
        ],
      };

      setScheduledList((prev) => [newScheduledTicket, ...prev]);
      setPendingList((prev) => prev.filter((item) => item.id !== acceptingTicket.id));
      setAcceptingTicket(null);
      toast.success(
        `Đã chấp thuận lời mời từ ${newScheduledTicket.enterpriseName} và chuyển vào lịch hẹn!`,
        "Tiếp Nhận Thành Công"
      );
      setNotification(`Đã chấp thuận lời mời từ ${newScheduledTicket.enterpriseName} và chuyển vào lịch hẹn!`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi chấp thuận lời mời tư vấn.");
    }
  };

  const handleOpenRejectModal = (ticket: ConsultationTicket) => {
    setRejectingTicket(ticket);
    setRejectionNote("");
    setRejectionError("");
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTicket) return;

    if (rejectionNote.trim().length < 10) {
      setRejectionError("Vui lòng nhập lý do từ chối cụ thể tối thiểu 10 ký tự để phản hồi cho đối tác.");
      return;
    }

    try {
      await expertConsultationsApi.respondConsultation(rejectingTicket.id, {
        action: "REJECT",
        rejectionReasonCategory,
        rejectionNote,
      });

      setPendingList((prev) => prev.filter((item) => item.id !== rejectingTicket.id));
      setRejectingTicket(null);
      setRejectionNote("");
      setRejectionError("");
      toast.info(
        `Đã từ chối lời mời tư vấn mã ${rejectingTicket.id}. Thông báo đã được gửi tới đối tác.`,
        "Đã Từ Chối"
      );
      setNotification(`Đã từ chối lời mời tư vấn mã ${rejectingTicket.id}. Thông báo đã được gửi tới đối tác.`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi từ chối lời mời tư vấn.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner cảnh báo màu hổ phách nếu tài khoản EXPERT đang chờ duyệt */}
      {isPendingApprovalRole && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 shadow-xs dark:bg-amber-950/40 dark:border-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-body text-amber-900 dark:text-amber-200 space-y-1">
            <h4 className="font-bold text-label">
              Tài Khoản Đang Chờ Phê Duyệt Cấp Sở (EXPERT)
            </h4>
            <p className="text-caption">
              Hồ sơ Chuyên gia KH&CN của bạn đang trong tiến trình thẩm định tại Sở KH&CN. Bạn có thể xem danh sách lời mời tư vấn nhưng các chức năng ký biên bản nghiệm thu (MoA) và nhận ủy thác tư vấn có thù lao Quỹ ĐMST tạm thời bị khóa cho đến khi được cấp chứng nhận chính thức.
            </p>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-label flex items-center justify-between shadow-sm animate-in fade-in dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/portal/expert/profile"
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition dark:hover:bg-slate-800 dark:text-slate-300"
              title="Quay lại Tổng quan"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold tracking-tight text-slate-900 text-lg md:text-xl dark:text-white">
                  HỘP THƯ TƯ VẤN & KẾT NỐI
                </h1>
                <span className="rounded-full bg-brand-50 text-brand-800 text-caption font-bold px-2.5 py-0.5 border border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800">
                  EXPERT INBOX
                </span>
              </div>
              <p className="text-caption text-slate-500 font-semibold uppercase tracking-wider dark:text-slate-400 mt-0.5">
                {currentUser?.fullName || "GS.TS. Nguyễn Văn Tuấn"} · Chuyên gia Cơ khí Tự động hóa
              </p>
            </div>
          </div>

          {/* 3 Tab Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab("pending")}
              data-testid="tab-btn-pending"
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap min-h-11 ${
                activeTab === "pending"
                  ? "bg-brand-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Lời Mời Chờ Xử Lý ({String(pendingList.length).padStart(2, "0")})</span>
            </button>

            <button
              onClick={() => setActiveTab("scheduled")}
              data-testid="tab-btn-scheduled"
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap min-h-11 ${
                activeTab === "scheduled"
                  ? "bg-brand-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Lịch Hẹn Sắp Tới ({String(scheduledList.length).padStart(2, "0")})</span>
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              data-testid="tab-btn-completed"
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap min-h-11 ${
                activeTab === "completed"
                  ? "bg-brand-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <CheckCheck className="w-4 h-4" />
              <span>Đã Hoàn Thành ({String(completedList.length).padStart(2, "0")})</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPED IN ASYNC */}
      <Async
        state={uxState}
        loadingText="Đang tải danh sách hộp thư tư vấn..."
        onRetry={loadData}
      >
        {/* TAB 1: LỜI MỜI CHỜ XỬ LÝ */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-700 animate-pulse"></span>
                <span>
                  Yêu Cầu Tư Vấn Mới Từ Doanh Nghiệp & Sở KH&CN ({pendingList.length} Lời Mời)
                </span>
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                SLA phản hồi: Tối đa 48 giờ
              </span>
            </div>

            {pendingList.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <Inbox className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                  Hộp thư chờ xử lý hiện đang trống
                </h4>
                <p className="text-body text-slate-500 text-xs max-w-md mx-auto">
                  Khi có doanh nghiệp đặt lịch hoặc Sở KH&CN chỉ định tư vấn, các yêu cầu mới kèm thời gian đếm ngược SLA 48h sẽ xuất hiện tại đây.
                </p>
                <div className="pt-2">
                  <Link
                    href="/portal/matching/radar"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 transition"
                  >
                    <span>Khám Phá Radar Cơ Hội AI</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingList.map((ticket) => {
                  const isUrgentSla = ticket.remainingHours <= 24;
                  const isDept = ticket.source === "DEPT_ASSIGNED";

                  return (
                    <div
                      key={ticket.id}
                      className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 shadow-xs space-y-4 transition ${
                        isUrgentSla
                          ? "border-red-300 dark:border-red-900/60"
                          : isDept
                          ? "border-brand-300/40 dark:border-brand-800/50"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      {/* Top Header of Ticket */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            {isDept ? (
                              <span className="px-2.5 py-0.5 rounded bg-brand-50 text-brand-800 text-caption font-black uppercase flex items-center gap-1 dark:bg-brand-950/60 dark:text-brand-300">
                                <Shield className="w-3 h-3" /> {ticket.assignedByDepartment || "Sở KH&CN"} Chỉ Định Kết Nối 1-1
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-caption font-black uppercase flex items-center gap-1 dark:bg-emerald-950/60 dark:text-emerald-300">
                                <Building2 className="w-3 h-3" /> Doanh Nghiệp Đặt Lịch Trực Tiếp Qua Portal
                              </span>
                            )}
                            <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                              Mã Đơn: {ticket.id}
                            </span>
                            {/* SLA Countdown Badge */}
                            <span
                              className={`text-caption font-bold px-2 py-0.5 rounded border ${
                                isUrgentSla
                                  ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800"
                                  : "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/50 dark:text-brand-300 dark:border-brand-800"
                              }`}
                            >
                              Còn {ticket.remainingHours} giờ để phản hồi
                            </span>
                          </div>

                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                            {ticket.title}
                          </h3>

                          <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                            <span>
                              Đơn vị mời: <b className="text-slate-700 dark:text-slate-200">{ticket.enterpriseName}</b>
                            </span>
                            <span>·</span>
                            <span>
                              Người đại diện: <b>{ticket.enterpriseContactName}</b> ({ticket.enterpriseContactPhoneMasked})
                            </span>
                            <span>·</span>
                            <span>
                              Điểm TNI: <b className="text-amber-600 font-mono">{ticket.enterpriseTniScore} điểm</b>
                            </span>
                          </div>
                        </div>

                        {/* Thù lao / Hình thức Badge */}
                        <div className="text-right shrink-0 bg-brand-50/70 dark:bg-slate-800 p-3 rounded-xl border border-brand-100 dark:border-slate-700">
                          {isDept ? (
                            <>
                              <span className="text-caption text-slate-500 dark:text-slate-400 font-semibold block">
                                Kinh phí thù lao tư vấn:
                              </span>
                              <span className="text-base font-black text-brand-700 dark:text-brand-400">
                                {ticket.advisoryFeeVnd?.toLocaleString("vi-VN")} VNĐ
                              </span>
                              <span className="text-caption text-emerald-700 dark:text-emerald-400 font-bold block">
                                ({ticket.feePayer || "Quỹ ĐMST chi trả"})
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-caption text-slate-500 dark:text-slate-400 font-semibold block">
                                Hình thức tư vấn:
                              </span>
                              <span className="text-sm font-black text-slate-900 dark:text-white">
                                Trực tuyến qua Zoom
                              </span>
                              <span className="text-caption text-slate-500 font-bold block">
                                (Thương lượng theo phiên)
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300 space-y-2">
                        <div>
                          <b>Nội dung yêu cầu từ DN:</b> {ticket.description}
                        </div>
                        <div className="flex flex-wrap gap-4 text-caption text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>Địa điểm: {ticket.location}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Thời lượng dự kiến: {ticket.duration}</span>
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenRejectModal(ticket)}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition min-h-11 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Từ Chối & Nêu Lý Do
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAcceptModal(ticket)}
                          className="px-5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 min-h-11"
                        >
                          <CalendarCheck className="w-4 h-4" />
                          <span>Đồng Ý Tư Vấn & Chọn Lịch Hẹn</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LỊCH HẸN SẮP TỚI */}
        {activeTab === "scheduled" && (
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Phiên Tư Vấn Đã Chốt Lịch Trực Tuyến ({scheduledList.length} Phiên)</span>
            </h2>

            {scheduledList.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                  Chưa có lịch hẹn tư vấn nào sắp tới
                </h4>
                <p className="text-body text-slate-500 text-xs max-w-md mx-auto">
                  Khi bạn chấp thuận các lời mời ở Tab 1, phiên họp trực tuyến sẽ được hiển thị tại đây kèm link phòng họp Zoom/Meet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledList.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                  >
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{ticket.meetingDate} · {ticket.meetingTime}</span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {ticket.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Đối tác: <b>{ticket.enterpriseName}</b> (Người đại diện: {ticket.enterpriseContactName} · {ticket.enterpriseContactPhoneMasked})
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-0.5">
                          <Video className="w-3.5 h-3.5 text-brand-700" />
                          <span>Phòng họp:</span>
                          <a
                            href={ticket.meetingUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-700 hover:underline font-mono font-bold"
                          >
                            {ticket.meetingUrl}
                          </a>
                        </p>
                      </div>

                      {/* Join meeting button with 15-minute countdown condition */}
                      <div className="text-right shrink-0">
                        {ticket.canJoinMeeting ? (
                          <a
                            href={ticket.meetingUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition min-h-11"
                          >
                            <Video className="w-4 h-4" />
                            <span>Vào Phòng Họp</span>
                          </a>
                        ) : (
                          <div className="space-y-1">
                            <button
                              disabled
                              className="px-5 py-2.5 bg-slate-200 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed min-h-11 dark:bg-slate-800 dark:text-slate-500"
                            >
                              Vào Phòng Họp
                            </button>
                            <span className="block text-caption text-slate-500 font-medium">
                              {ticket.meetingCountdownText || "Sẽ mở trước giờ họp 15 phút"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pre-read materials */}
                    {ticket.preReadMaterials && ticket.preReadMaterials.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                          Tài liệu nghiên cứu trước do doanh nghiệp cung cấp (Pre-read Materials):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {ticket.preReadMaterials.map((mat, idx) => (
                            <a
                              key={idx}
                              href={mat.url}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-caption font-medium hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 min-h-9"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-500" />
                              <span>{mat.name}</span>
                              <span className="text-caption text-slate-400">({mat.size})</span>
                              <Download className="w-3.5 h-3.5 ml-1 text-slate-500" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ĐÃ HOÀN THÀNH */}
        {activeTab === "completed" && (
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Lịch Sử Tư Vấn Đã Nghiệm Thu Biên Bản ({completedList.length} Phiên)</span>
            </h2>

            {completedList.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <CheckCheck className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                  Chưa có phiên tư vấn nào hoàn thành
                </h4>
                <p className="text-body text-slate-500 text-xs max-w-md mx-auto">
                  Các phiên tư vấn sau khi ký biên bản MoA và đối soát thù lao sẽ được lưu trữ tại đây.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedList.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            Mã: {ticket.id}
                          </span>
                          <span className="text-caption text-slate-400">
                            · Hoàn thành ngày: {ticket.completedAt}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {ticket.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          Doanh nghiệp: <b>{ticket.enterpriseName}</b> (Người liên hệ: {ticket.enterpriseContactName} · {ticket.enterpriseContactPhoneMasked})
                        </p>
                      </div>

                      {/* Quyết toán thù lao Badge */}
                      <div className="text-right shrink-0 space-y-1">
                        {ticket.disbursementStatus === "DISBURSED" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-caption font-bold border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ĐÃ QUYẾT TOÁN THÙ LAO ({(ticket.disbursementAmountVnd || ticket.advisoryFeeVnd || 0).toLocaleString("vi-VN")} VNĐ)</span>
                          </span>
                        ) : ticket.disbursementStatus === "AUDITING" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-caption font-bold border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300">
                            <Clock className="w-3.5 h-3.5" />
                            <span>ĐANG ĐỐI SOÁT HỒ SƠ QUỸ ĐMST</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-caption font-bold border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5" />
                            <span>CHƯA CÓ YÊU CẦU GIẢI NGÂN</span>
                          </span>
                        )}
                        {ticket.feePayer && (
                          <span className="block text-caption text-slate-500 font-medium">
                            Nguồn chi trả: {ticket.feePayer}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bi-directional feedback & MoA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                      {/* Enterprise Review */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < (ticket.enterpriseRating || 5)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 ml-1">
                            Đánh giá từ Doanh nghiệp:
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 italic">
                          "{ticket.enterpriseReview}"
                        </p>
                      </div>

                      {/* Expert Evaluation */}
                      <div className="space-y-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Nhận xét khả năng hấp thụ công nghệ của DN:
                        </span>
                        <p className="text-slate-600 dark:text-slate-300">
                          {ticket.expertEvaluation}
                        </p>
                      </div>
                    </div>

                    {/* MoA document download */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-500">
                        Biên bản tư vấn kỹ thuật (MoA) có chữ ký số 2 chiều đã lưu trữ trên kho NacenTwin.
                      </span>
                      <a
                        href={ticket.moaDocumentUrl || "#"}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition min-h-11 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải Biên Bản Tư Vấn (MoA)</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Async>

      {/* MODAL 1: ĐỒNG Ý TƯ VẤN & CHỌN LỊCH HẸN */}
      {acceptingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-brand-700" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Đồng Ý Tư Vấn & Chọn Lịch Hẹn
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAcceptingTicket(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-caption text-slate-600 dark:text-slate-400">
              Bạn đang chấp thuận yêu cầu tư vấn cho <b>{acceptingTicket.enterpriseName}</b>. Vui lòng thiết lập khung giờ và phòng họp trực tuyến để hệ thống gửi giấy báo lịch hẹn:
            </p>

            <form onSubmit={handleConfirmAccept} className="space-y-3.5">
              <div>
                <label
                  htmlFor="scheduled-date-input"
                  className="block text-caption font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Ngày làm việc dự kiến *
                </label>
                <input
                  id="scheduled-date-input"
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white min-h-11"
                />
              </div>

              <div>
                <label
                  htmlFor="scheduled-time-input"
                  className="block text-caption font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Khung giờ họp *
                </label>
                <select
                  id="scheduled-time-input"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white min-h-11"
                >
                  <option value="09:00 - 11:00">09:00 - 11:00 (Buổi Sáng)</option>
                  <option value="14:00 - 16:00">14:00 - 16:00 (Buổi Chiều)</option>
                  <option value="16:00 - 17:30">16:00 - 17:30 (Cuối Chiều)</option>
                  <option value="19:30 - 21:00">19:30 - 21:00 (Buổi Tối)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="meeting-url-input"
                  className="block text-caption font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Hình thức hội nghị & Đường link phòng họp *
                </label>
                <input
                  id="meeting-url-input"
                  type="url"
                  required
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://zoom.us/j/... hoặc https://meet.google.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white min-h-11 font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="expert-note-input"
                  className="block text-caption font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Ghi chú chuẩn bị gửi cho Doanh nghiệp (tùy chọn)
                </label>
                <textarea
                  id="expert-note-input"
                  rows={2}
                  value={expertNote}
                  onChange={(e) => setExpertNote(e.target.value)}
                  placeholder="Ví dụ: Đề nghị doanh nghiệp chuẩn bị trước sơ đồ mặt bằng xưởng và thông số động cơ..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAcceptingTicket(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 min-h-11 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-xs min-h-11"
                >
                  Xác Nhận & Mở Lịch Hẹn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TỪ CHỐI & NÊU LÝ DO BẮT BUỘC (>= 10 KÝ TỰ) */}
      {rejectingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Từ Chối Lời Mời Tư Vấn & Nêu Lý Do
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingTicket(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-caption text-slate-600 dark:text-slate-400">
              Theo Quy chế Hệ sinh thái NacenTech, Chuyên gia từ chối lời mời cần nêu rõ lý do để hệ sinh thái điều phối chuyên gia khác phù hợp hơn:
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3.5">
              <div>
                <label
                  htmlFor="rejection-category-input"
                  className="block text-caption font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Nhóm lý do từ chối *
                </label>
                <select
                  id="rejection-category-input"
                  value={rejectionReasonCategory}
                  onChange={(e) => setRejectionReasonCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white min-h-11"
                >
                  <option value="Trùng lịch công tác">Trùng lịch công tác / Hội đồng thẩm định</option>
                  <option value="Lệch chuyên môn">Khác lĩnh vực chuyên sâu hẹp của chuyên gia</option>
                  <option value="Xung đột lợi ích">Có xung đột lợi ích thương mại hoặc nghiên cứu</option>
                  <option value="Lý do cá nhân khác">Lý do cá nhân khác</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="rejection-note-input"
                  className="block text-caption font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Chi tiết lý do từ chối (bắt buộc $\ge 10$ ký tự) *
                </label>
                <textarea
                  id="rejection-note-input"
                  rows={3}
                  required
                  value={rejectionNote}
                  onChange={(e) => {
                    setRejectionNote(e.target.value);
                    if (e.target.value.trim().length >= 10) setRejectionError("");
                  }}
                  placeholder="Vui lòng nhập tối thiểu 10 ký tự giải thích lý do..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
                {rejectionError && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">
                    {rejectionError}
                  </p>
                )}
                <span className="text-caption text-slate-400 block mt-1">
                  Đã nhập: {rejectionNote.trim().length} / 10 ký tự tối thiểu
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRejectingTicket(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 min-h-11 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs min-h-11"
                >
                  Xác Nhận Từ Chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
