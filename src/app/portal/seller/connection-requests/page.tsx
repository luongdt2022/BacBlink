'use client';

import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Search,
  RefreshCw,
  Building2,
  Sparkles,
  ChevronRight,
  Clock,
  RotateCcw,
  ExternalLink,
  Handshake,
  TrendingUp,
  Eye,
  CheckCircle2,
  XCircle,
  DollarSign,
  ArrowRight,
  Kanban,
  User,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConnectionRequest } from '@/types/brokerage';
import { brokerageApi } from '@/services/api/brokerage';
import { useToast } from '@/components/common/toast';
import { authClient } from '@/lib/auth-client';
import ConnectionRequestDetailModal from '@/app/portal/opportunities/pipeline/ConnectionRequestDetailModal';

export default function SellerConnectionRequestsPage() {
  const router = useRouter();
  const toast = useToast();

  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [inboundStatus, setInboundStatus] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentUser = authClient.getUser();
      const sellerOrg = currentUser?.organizationName;
      const isPlatformAdmin =
        currentUser?.role === 'ADMIN' ||
        currentUser?.role === 'SUPER_ADMIN' ||
        currentUser?.role === 'OPERATOR_ADMIN';

      const reqs = await brokerageApi.getConnectionRequests({
        search: search.trim() || undefined,
        scope: isPlatformAdmin ? undefined : 'my',
        organizationName: isPlatformAdmin ? undefined : sellerOrg,
      });
      setConnectionRequests(reqs);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách yêu cầu kết nối.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleRespondRequest = async (requestId: string, action: 'ACCEPT' | 'REJECT') => {
    setProcessingRequestId(requestId);
    try {
      const res = await brokerageApi.respondConnectionRequest(requestId, action);
      if (action === 'ACCEPT') {
        const dealRoomUrl = res.createdOpportunityId
          ? `/portal/opportunities/${res.createdOpportunityId}/deal-room`
          : '/portal/opportunities/pipeline';

        toast.success(
          'Đã chấp thuận yêu cầu kết nối! Deal Room đã được tự động khởi tạo.',
          'Kết Nối Thành Công'
        );

        if (res.createdOpportunityId) {
          router.push(dealRoomUrl);
          return;
        }
      } else {
        toast.info('Đã từ chối yêu cầu kết nối.', 'Đã Từ Chối');
      }
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Không thể phản hồi yêu cầu kết nối.', 'Lỗi');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const pendingRequestsCount = connectionRequests.filter((r) => r.status === 'PENDING').length;
  const acceptedRequestsCount = connectionRequests.filter((r) => r.status === 'ACCEPTED').length;

  return (
    <div className="space-y-6">
      {/* 1. HERO WORKSPACE HEADER CHUYÊN BIỆT */}
      <section className="relative overflow-hidden rounded-3xl workspace-banner bg-brand-700 text-white p-6 sm:p-8 shadow-xl shadow-brand-950/15 border border-brand-800/40">
        <div
          aria-hidden="true"
          className="innovation-hero-art pointer-events-none absolute inset-0 opacity-80"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -bottom-10 w-80 h-80 opacity-15 select-none"
        >
          <img
            src="/NACENTECH_Main-Logo-G.png"
            alt=""
            className="w-full h-full object-contain brightness-0 invert"
          />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-100">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-brand-100">
                <Sparkles className="w-3.5 h-3.5 text-brand-200" />
                Sàn Giao Dịch & Môi Giới Công Nghệ NacenTwin
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-white/50" />
              <span className="text-white/80">Phễu Tiếp Nhận Đề Nghị (Inbound Leads)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Inbox className="w-7 h-7 text-brand-200" />
              Hộp Thư Tiếp Nhận Yêu Cầu Kết Nối
            </h1>

            <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Đón nhận và xử lý các đề nghị tiếp cận công nghệ, đặt mua giải pháp từ các Doanh nghiệp Bên Mua. Chấp thuận kết nối để mở phòng đàm phán Deal Room bảo mật 1-1.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/portal/matching/radar"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-sm transition-all shadow-sm hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-brand-200" />
              <span>Radar Tìm Nhu Cầu</span>
            </Link>

            <Link
              href="/portal/opportunities/pipeline"
              className="px-4 py-2.5 rounded-xl bg-white text-brand-800 hover:bg-slate-50 text-xs font-extrabold flex items-center gap-2 shadow-lg transition-all hover:scale-[1.02]"
            >
              <Kanban className="w-4 h-4 text-brand-700" />
              <span>Tiến Trình Chuyển Giao</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Tổng yêu cầu nhận được */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/70 dark:from-slate-900 dark:to-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-brand-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-700/30">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Tổng Yêu Cầu Kết Nối Đến
            </span>
            <div className="text-2xl font-black text-brand-900 dark:text-white mt-0.5">
              {connectionRequests.length} <span className="text-sm font-semibold text-brand-700 dark:text-teal-400">Yêu cầu</span>
            </div>
            <span className="text-caption text-brand-700 dark:text-teal-300 font-medium">
              Đề nghị từ các doanh nghiệp mua
            </span>
          </div>
        </div>

        {/* Card 2: Chờ phản hồi */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 dark:from-slate-900 dark:to-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-600/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Đang Chờ Phản Hồi
            </span>
            <div className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-0.5">
              {pendingRequestsCount} <span className="text-sm font-semibold text-amber-600">Cần xử lý</span>
            </div>
            <span className="text-caption text-amber-700 dark:text-amber-400 font-medium">
              Thời hạn phản hồi cam kết SLA 48h
            </span>
          </div>
        </div>

        {/* Card 3: Đã chấp thuận */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/70 dark:from-slate-900 dark:to-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Đã Chấp Thuận Kết Nối
            </span>
            <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-0.5">
              {acceptedRequestsCount} <span className="text-sm font-semibold text-emerald-600">Thương vụ</span>
            </div>
            <span className="text-caption text-emerald-700 dark:text-emerald-400 font-medium">
              Đã chuyển thành công sang Pipeline Deal
            </span>
          </div>
        </div>
      </div>

      {/* 3. TABS SWITCHER & SEARCH TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* 4 Tabs Bộ Lọc Trạng Thái */}
        <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-full md:w-auto">
          {[
            { key: 'ALL', label: 'Tất cả', count: connectionRequests.length },
            {
              key: 'PENDING',
              label: 'Chờ phản hồi',
              count: pendingRequestsCount,
              badgeColor: 'bg-amber-500 text-white',
            },
            {
              key: 'ACCEPTED',
              label: 'Đã chấp thuận',
              count: acceptedRequestsCount,
              badgeColor: 'bg-emerald-600 text-white',
            },
            {
              key: 'REJECTED',
              label: 'Đã từ chối',
              count: connectionRequests.filter((r) => r.status === 'REJECTED').length,
              badgeColor: 'bg-slate-400 text-white',
            },
          ].map((subTab) => (
            <button
              key={subTab.key}
              type="button"
              onClick={() => setInboundStatus(subTab.key as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                inboundStatus === subTab.key
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{subTab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-caption font-black ${
                  inboundStatus === subTab.key
                    ? 'bg-white/20 text-white'
                    : subTab.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {subTab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="flex-1 md:w-80 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã yêu cầu, tiêu đề, bên mua..."
              className="w-full h-10 pl-10 pr-8 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  fetchData();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <button
            type="button"
            onClick={fetchData}
            className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 transition"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4. MAIN WORKSPACE VIEW (5 UX STATES) */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse p-5 space-y-3"
            >
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 space-y-3">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Không thể tải danh sách yêu cầu</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 transition"
          >
            Thử lại ngay
          </button>
        </div>
      ) : (() => {
        const displayedRequests =
          inboundStatus === 'ALL'
            ? connectionRequests
            : connectionRequests.filter((r) => r.status === inboundStatus);

        if (displayedRequests.length === 0) {
          return (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {inboundStatus === 'ALL'
                  ? 'Chưa có yêu cầu kết nối nào gửi đến bạn'
                  : `Không có yêu cầu kết nối nào ở trạng thái "${
                      inboundStatus === 'PENDING'
                        ? 'Chờ phản hồi'
                        : inboundStatus === 'ACCEPTED'
                        ? 'Đã chấp thuận'
                        : 'Đã từ chối'
                    }"`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Khi các doanh nghiệp tìm thấy công nghệ của bạn hoặc gửi đơn đặt mua giải pháp, yêu cầu sẽ hiển thị tại đây để bạn phản hồi và mở phòng đàm phán Deal Room.
              </p>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 gap-4">
            {displayedRequests.map((req) => {
              const isPending = req.status === 'PENDING';
              const isAccepted = req.status === 'ACCEPTED';
              const offerTargetId = req.targetOfferId || req.offerId;
              const isCommercialOrder = Boolean(
                req.message?.includes('[Đơn hàng thương mại]') ||
                req.message?.includes('[Đề xuất thương mại') ||
                offerTargetId
              );

              return (
                <div
                  key={req.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition space-y-4"
                >
                  {/* Request Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-brand-700 dark:text-cyan-300 bg-brand-50 dark:bg-brand-950 px-2.5 py-1 rounded-lg border border-brand-200 dark:border-brand-800">
                        {req.requestCode}
                      </span>
                      {isCommercialOrder && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-caption font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          [Đơn Mua Hàng Thương Mại]
                        </span>
                      )}
                      <span className="text-caption text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      {req.slaDeadline && isPending && (
                        <span className="text-caption font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3 text-amber-600" /> Hạn SLA: {new Date(req.slaDeadline).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Chờ phản hồi
                        </span>
                      ) : isAccepted ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã chấp thuận & Tạo Deal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Đã từ chối
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Công Nghệ Mục Tiêu */}
                  {req.offerTitle && (
                    <div className="p-3 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/70 dark:border-brand-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-caption font-bold text-brand-700 dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Khách hàng quan tâm công nghệ:
                        </span>
                        <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                          {offerTargetId ? (
                            <Link
                              href={`/chao-ban-cong-nghe/${offerTargetId}`}
                              target="_blank"
                              className="hover:underline hover:text-brand-600 dark:hover:text-cyan-300 flex items-center gap-1.5"
                            >
                              <span>{req.offerTitle}</span>
                              <ExternalLink className="w-3.5 h-3.5 inline-block text-brand-500 shrink-0" />
                            </Link>
                          ) : (
                            <span>{req.offerTitle}</span>
                          )}
                          {req.offerCode && (
                            <span className="font-mono text-caption text-slate-500 font-bold">
                              ({req.offerCode})
                            </span>
                          )}
                        </div>
                      </div>
                      {req.offerTrlLevel && (
                        <span className="text-caption font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 self-start sm:self-auto">
                          TRL {req.offerTrlLevel}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Thông tin đối tác & Ngân sách */}
                  {(() => {
                    const resolvedBuyerType =
                      req.buyerType ||
                      (req.expertProfileId || req.academicTitle
                        ? 'EXPERT'
                        : req.senderRole === 'PUBLIC_USER'
                        ? 'INDIVIDUAL'
                        : 'ENTERPRISE');

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5">
                          <div className="text-slate-500 font-medium">Bên gửi kết nối (Bên mua):</div>
                          <div className="font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-1.5">
                            {resolvedBuyerType === 'INDIVIDUAL' ? (
                              <User className="w-4 h-4 text-blue-600 shrink-0" />
                            ) : resolvedBuyerType === 'EXPERT' ? (
                              <GraduationCap className="w-4 h-4 text-purple-600 shrink-0" />
                            ) : (
                              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            <span className="text-sm font-extrabold">{req.senderOrgName}</span>

                            {/* Badge nhận diện 3 nhóm chủ thể */}
                            {resolvedBuyerType === 'INDIVIDUAL' ? (
                              <span className="text-caption font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                                [Khách Hàng Cá Nhân]
                              </span>
                            ) : resolvedBuyerType === 'EXPERT' ? (
                              <span className="text-caption font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800">
                                [Chuyên Gia KH&CN]
                              </span>
                            ) : (
                              <span className="text-caption font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                                [Doanh Nghiệp / Tổ Chức]
                              </span>
                            )}
                          </div>

                          {resolvedBuyerType === 'EXPERT' && (req.academicTitle || req.specializedField) && (
                            <div className="text-caption text-purple-700 dark:text-purple-300 font-medium pl-5.5">
                              {req.academicTitle && <span>{req.academicTitle}</span>}
                              {req.academicTitle && req.specializedField && <span> • </span>}
                              {req.specializedField && <span>{req.specializedField}</span>}
                            </div>
                          )}

                          {resolvedBuyerType !== 'INDIVIDUAL' && (req.senderIndustry || req.senderProvince) && (
                            <div className="text-caption text-slate-400 pl-5.5">
                              {req.senderIndustry && <span>{req.senderIndustry}</span>}
                              {req.senderIndustry && req.senderProvince && <span> • </span>}
                              {req.senderProvince && <span>{req.senderProvince}</span>}
                            </div>
                          )}

                          {resolvedBuyerType === 'INDIVIDUAL' && req.senderProvince && (
                            <div className="text-caption text-slate-500 pl-5.5">
                              Địa bàn: {req.senderProvince}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-slate-500 font-medium">Khoảng ngân sách đề xuất:</div>
                          <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 shrink-0" />
                            <span>{req.proposedBudgetRange || 'Thỏa thuận trực tiếp'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Message */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-500 block mb-1 uppercase tracking-wider text-caption">
                      Nội dung trao đổi ban đầu:
                    </span>
                    <p className="leading-relaxed">{req.message}</p>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRequestId(req.id);
                        setIsDetailModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-cyan-300 text-xs font-bold flex items-center gap-1.5 border border-brand-200 dark:border-brand-800 transition shadow-sm hover:scale-[1.02]"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Xem chi tiết hồ sơ</span>
                    </button>

                    <div className="flex items-center gap-3">
                      {isPending && (
                        <>
                          <button
                            type="button"
                            disabled={processingRequestId === req.id}
                            onClick={() => handleRespondRequest(req.id, 'REJECT')}
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                          >
                            Từ chối
                          </button>

                          <button
                            type="button"
                            disabled={processingRequestId === req.id}
                            onClick={() => handleRespondRequest(req.id, 'ACCEPT')}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
                          >
                            <Handshake className="w-4 h-4" />
                            Chấp Thuận & Mở Deal Room
                          </button>
                        </>
                      )}

                      {isAccepted && (
                        <Link
                          href="/portal/opportunities/pipeline"
                          className="text-xs font-bold text-brand-700 dark:text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <span>Xem Deal trong Pipeline</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* 5. MODAL CHI TIẾT YÊU CẦU KẾT NỐI */}
      <ConnectionRequestDetailModal
        isOpen={isDetailModalOpen}
        requestId={selectedRequestId}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRequestId(null);
        }}
        onResponded={(data) => {
          fetchData();
          if (data.status === 'ACCEPTED' && data.createdOpportunityId) {
            router.push(`/portal/opportunities/${data.createdOpportunityId}/deal-room`);
          }
        }}
      />
    </div>
  );
}
