"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Box,
  ShieldCheck,
  Ticket,
  LayoutGrid,
  Video,
  Users,
  Flame,
  Sparkles,
  Search,
  CheckCircle2,
  X,
  PlusCircle,
  Archive,
  Monitor,
  ArrowRight,
  FileText,
  FileSignature,
  Info,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/common/toast";
import { Async, AsyncState } from "@/components/ui/async";
import {
  portalClient,
  TechmartEvent,
  EventRegistrationRequest,
} from "@/lib/portal-client";

export default function TechmartEventsPage() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [events, setEvents] = useState<TechmartEvent[]>([]);
  const [eventsState, setEventsState] = useState<AsyncState>("loading");
  const [loadVersion, setLoadVersion] = useState(0);

  // Modal Đăng ký
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TechmartEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regForm, setRegForm] = useState({
    organizationName: "",
    contactName: "",
    phoneNumber: "",
    email: "",
    roleType: "VISITOR" as "VISITOR" | "BUYER" | "SELLER_BOOTH",
    notes: "",
  });

  const loadData = useCallback(async () => {
    setEventsState("loading");
    try {
      const statusParam = activeTab === "upcoming" ? "UPCOMING" : "CLOSED";
      const result = await portalClient.listEvents(statusParam, 1, 20);
      setEvents(result.data);
      if (result.data.length === 0) {
        setEventsState("empty");
      } else {
        setEventsState("success");
      }
    } catch (err) {
      console.error("Lỗi nạp danh sách sự kiện Techmart:", err);
      setEventsState("error");
    }
  }, [activeTab]);

  useEffect(() => {
    void loadData();
  }, [loadData, loadVersion]);

  // Lọc phía client theo từ khóa & địa điểm
  const filteredEvents = events.filter((ev) => {
    const matchQuery =
      !searchQuery.trim() ||
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchLocation =
      !selectedLocation ||
      ev.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchQuery && matchLocation;
  });

  const handleOpenRegister = (eventItem?: TechmartEvent) => {
    setSelectedEvent(eventItem || events[0] || null);
    setIsModalOpen(true);
  };

  const handleCloseRegister = () => {
    setIsModalOpen(false);
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (!regForm.contactName.trim() || !regForm.phoneNumber.trim()) {
      toast.error("Vui lòng điền họ tên người liên hệ và số điện thoại.");
      return;
    }

    setIsSubmitting(true);
    try {
      const req: EventRegistrationRequest = {
        eventId: selectedEvent.id,
        organizationName: regForm.organizationName.trim() || "Cá nhân / Doanh nghiệp",
        contactName: regForm.contactName.trim(),
        phoneNumber: regForm.phoneNumber.trim(),
        email: regForm.email.trim(),
        roleType: regForm.roleType,
        notes: regForm.notes.trim() || undefined,
      };

      const res = await portalClient.registerEvent(req);
      toast.success(
        `Đã tiếp nhận đơn đăng ký thành công! Mã hồ sơ: ${res.registrationCode}`,
        "Đăng Ký Thành Công"
      );
      setIsModalOpen(false);
      setRegForm({
        organizationName: "",
        contactName: "",
        phoneNumber: "",
        email: "",
        roleType: "VISITOR",
        notes: "",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể gửi đơn đăng ký.";
      toast.error(msg, "Thao Tác Thất Bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-brand-700 text-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-b border-brand-800 shadow-md">
        <div aria-hidden="true" className="innovation-hero-art pointer-events-none absolute inset-0" />
        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-100 text-xs font-semibold backdrop-blur-sm border border-white/20">
              <Sparkles className="size-3.5 text-brand-200" />
              <span>Lịch Sự Kiện &amp; Phiên Chào Giá Công Nghệ Techmart Quốc Gia</span>
            </div>
            <h1 className="type-page-title text-white">
              Sàn Trưng Bày &amp; Các Phiên Chào Giá Công Nghệ Trực Tuyến
            </h1>
            <p className="text-white/85 type-body">
              Nơi hội tụ các sự kiện Techmart, Techfest, Diễn đàn chuyển giao công nghệ và các phiên kết nối 1-1 giữa Viện, Trường, Doanh nghiệp ĐMST với cộng đồng người mua.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleOpenRegister()}
                className="bg-white/15 hover:bg-white/25 border border-white/25 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 backdrop-blur-sm shadow-xs"
              >
                <PlusCircle className="size-4" />
                <span>Đăng Ký Tham Gia Sự Kiện</span>
              </button>
              <Link
                href="/trien-lam/dang-ky-tham-quan"
                className="bg-white text-brand-800 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
              >
                <Ticket className="size-4" />
                <span>Đăng Ký Vé Tham Quan</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0">
            <div className="text-center px-3">
              <div className="text-2xl font-black text-teal-300">15</div>
              <div className="text-xs text-slate-300 font-semibold uppercase mt-0.5">Triển Lãm TT17</div>
            </div>
            <div className="text-center px-3 border-x border-white/20">
              <div className="text-2xl font-black text-emerald-300">84</div>
              <div className="text-xs text-slate-300 font-semibold uppercase mt-0.5">Công Nghệ Tham Gia</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-black text-amber-300">320+</div>
              <div className="text-xs text-slate-300 font-semibold uppercase mt-0.5">Doanh Nghiệp Đăng Ký</div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH & FILTER BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 z-20 w-full">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="size-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên sự kiện, đơn vị chủ trì, từ khóa..."
              className="form-control w-full pl-10 pr-3.5 text-sm font-medium"
            />
          </div>
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="form-control w-full text-sm font-semibold"
            >
              <option value="">Địa bàn tổ chức (Tất cả)</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Trực Tuyến">Phiên Trực Tuyến (Virtual)</option>
            </select>
          </div>
          <div className="flex items-center justify-end">
            <Link
              href="/trien-lam/dang-ky-tham-quan"
              className="w-full h-11 px-4 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-sm text-center"
            >
              <Ticket className="size-4" />
              <span>Đăng Ký Vé Tham Quan Trực Tiếp</span>
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span
              className={`size-2.5 rounded-full shrink-0 ${
                activeTab === "upcoming" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            <span>
              {activeTab === "upcoming"
                ? `Các Phiên Chào Giá & Triển Lãm Đang Mở Đăng Ký (${filteredEvents.length} Sự Kiện)`
                : `Các Sự Kiện Techmart Đã Khép Lại (${filteredEvents.length} Sự Kiện)`}
            </span>
          </h2>

          {/* Navigation Tabs */}
          <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("upcoming")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "upcoming"
                  ? "bg-brand-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <Calendar className="size-3.5" />
              <span>Phiên Đang/Sắp Mở</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("past")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "past"
                  ? "bg-brand-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <Archive className="size-3.5" />
              <span>Sự Kiện Đã Khép Lại</span>
            </button>
          </div>
        </div>

        <Async
          state={eventsState}
          loadingSkeleton={
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4"
                >
                  <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          }
          emptyContent={
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <Archive className="size-12 text-slate-400 mx-auto mb-3" />
              <h3 className="type-card-title text-slate-800 dark:text-slate-200">
                Không tìm thấy sự kiện phù hợp
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Thử thay đổi bộ lọc tìm kiếm hoặc quay lại danh sách đầy đủ.
              </p>
            </div>
          }
          errorMessage="Không thể kết nối đến máy chủ lấy dữ liệu sự kiện Techmart."
          onRetry={() => setLoadVersion((v) => v + 1)}
        >
          {activeTab === "upcoming" ? (
            <div className="space-y-6">
              {filteredEvents.map((ev, idx) => (
                <article
                  key={ev.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm hover:shadow-md transition relative overflow-hidden border ${
                    idx === 0
                      ? "border-2 border-brand-500/40"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-red-600 to-amber-500 text-white text-xs font-black uppercase px-4 py-1 rounded-bl-xl tracking-wider flex items-center gap-1 shadow">
                      <Flame className="size-3.5" />
                      <span>Sự Kiện Trọng Điểm</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Event Banner Image */}
                    {ev.bannerUrl && (
                      <div className="lg:col-span-4 relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-xs shrink-0">
                        <img
                          src={ev.bannerUrl}
                          alt={ev.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className={`${ev.bannerUrl ? "lg:col-span-5" : "lg:col-span-8"} space-y-3`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 text-xs font-extrabold font-mono">
                          {ev.id.substring(0, 8).toUpperCase()}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" /> Đang Tiếp Nhận Hồ Sơ
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 text-xs font-semibold">
                          {ev.technologiesCount} Công nghệ tham gia
                        </span>
                      </div>

                      <h3 className="type-card-title text-slate-900 dark:text-white hover:text-brand-600 cursor-pointer">
                        {ev.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {ev.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="size-4 text-brand-600 shrink-0" />
                          <span>
                            {new Date(ev.startDate).toLocaleDateString("vi-VN")} -{" "}
                            {new Date(ev.endDate).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <MapPin className="size-4 text-red-600 shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`${ev.bannerUrl ? "lg:col-span-3" : "lg:col-span-4"} flex flex-col justify-center items-center lg:items-end gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6`}>
                      <div className="text-right w-full">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
                          Trạng thái tiếp nhận:
                        </span>
                        <span className="text-sm font-black text-emerald-600">
                          Mở đăng ký gian hàng &amp; B2B
                        </span>
                      </div>
                      <div className="flex gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => handleOpenRegister(ev)}
                          className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Ticket className="size-4" />
                          <span>Đăng Ký Tham Gia</span>
                        </button>
                        {ev.pdfBrochureUrl && (
                          <a
                            href={ev.pdfBrochureUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center"
                            title="Tải thể lệ sự kiện"
                          >
                            <FileText className="size-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 text-center lg:text-right">
                        Hỗ trợ doanh nghiệp ĐMST &amp; chuyên gia kết nối trực tiếp
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">
                Các Kỳ Techmart Đã Kết Thúc &amp; Thống Kê Chuyển Giao
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-xs border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Mã Sự Kiện</th>
                      <th className="p-3">Tên Triển Lãm / Sự Kiện</th>
                      <th className="p-3">Địa Điểm &amp; Thời Gian</th>
                      <th className="p-3">Số Công Nghệ</th>
                      <th className="p-3">Trạng Thái</th>
                      <th className="p-3 text-right">Kỷ Yếu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredEvents.map((ev) => (
                      <tr key={ev.id}>
                        <td className="p-3 font-mono font-bold text-brand-600">
                          {ev.id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">
                          {ev.title}
                        </td>
                        <td className="p-3">
                          {ev.location} · {new Date(ev.startDate).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="p-3">{ev.technologiesCount} Công nghệ</td>
                        <td className="p-3 font-bold text-slate-500">Đã khép lại</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              toast.info("Kỷ yếu sự kiện đang được lưu trữ tại Thư viện số BACLINK.")
                            }
                            className="text-brand-600 hover:underline font-bold"
                          >
                            Xem kết quả
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Async>
      </main>

      {/* MODAL: ĐĂNG KÝ THAM GIA PHIÊN CHÀO GIÁ TECHMART */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative">
            <button
              type="button"
              onClick={handleCloseRegister}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center font-bold">
                <FileSignature className="size-4" />
              </div>
              <h3 className="type-card-title text-slate-900 dark:text-white">
                Đăng Ký Tham Gia Phiên Chào Giá Techmart
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Dành cho Doanh nghiệp, Viện, Trường hoặc Cá nhân muốn mở gian hàng chào bán công nghệ hoặc tham dự phiên kết nối B2B.
            </p>

            <form onSubmit={handleSubmitRegistration} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phiên Chào Giá / Sự Kiện:
                </label>
                <input
                  type="text"
                  value={selectedEvent?.title ?? "Chưa chọn sự kiện"}
                  readOnly
                  className="form-control w-full bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Đơn Vị / Doanh Nghiệp / Viện Trường:
                </label>
                <input
                  type="text"
                  required
                  value={regForm.organizationName}
                  onChange={(e) =>
                    setRegForm((prev) => ({ ...prev, organizationName: e.target.value }))
                  }
                  placeholder="Công ty CP Công nghệ Cơ khí Chính xác..."
                  className="form-control w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Họ Tên Người Đại Diện:
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.contactName}
                    onChange={(e) =>
                      setRegForm((prev) => ({ ...prev, contactName: e.target.value }))
                    }
                    placeholder="Nguyễn Văn A"
                    className="form-control w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vai Trò Tham Gia:
                  </label>
                  <select
                    value={regForm.roleType}
                    onChange={(e) =>
                      setRegForm((prev) => ({
                        ...prev,
                        roleType: e.target.value as "VISITOR" | "BUYER" | "SELLER_BOOTH",
                      }))
                    }
                    className="form-control w-full font-semibold"
                  >
                    <option value="SELLER_BOOTH">Bên Bán (Trưng bày gian hàng)</option>
                    <option value="BUYER">Bên Mua (Tìm kiếm giải pháp B2B)</option>
                    <option value="VISITOR">Khách Tham Quan Đại Chúng</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số Điện Thoại:
                  </label>
                  <input
                    type="tel"
                    required
                    value={regForm.phoneNumber}
                    onChange={(e) =>
                      setRegForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
                    }
                    placeholder="0912345678"
                    className="form-control w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Liên Hệ:
                  </label>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) =>
                      setRegForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="contact@doanhnghiep.vn"
                    className="form-control w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nhu Cầu / Sản Phẩm Đăng Ký Trưng Bày:
                </label>
                <textarea
                  rows={2}
                  value={regForm.notes}
                  onChange={(e) =>
                    setRegForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Mô tả tóm tắt giải pháp công nghệ, cấp độ TRL hoặc bài toán cần kết nối..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-600 focus:outline-none dark:text-white"
                />
              </div>

              <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl border border-brand-200 dark:border-brand-900 text-xs text-brand-900 dark:text-brand-200 flex items-start gap-2">
                <Info className="size-4 text-brand-600 shrink-0 mt-0.5" />
                <span>
                  Hồ sơ đăng ký sẽ được Ban Cố vấn Kỹ thuật BACLINK rà soát năng lực trong 24h trước khi cấp thư mời và vị trí gian hàng chính thức.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseRegister}
                  className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Đang gửi đơn...</span>
                    </>
                  ) : (
                    <span>Gửi Đơn Đăng Ký</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
