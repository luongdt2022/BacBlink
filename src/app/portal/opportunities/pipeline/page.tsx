'use client';

import React, { useState, useEffect } from 'react';
import {
  Kanban,
  Search,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  ChevronRight,
  UserCheck,
  DollarSign,
  Layers,
  FileSignature,
  CheckCircle2,
  ArrowLeft,
  XCircle,
  Inbox,
  Clock,
  RotateCcw,
  ExternalLink,
  Handshake,
  TrendingUp,
  Eye,
  Info,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Opportunity, ConnectionRequest } from '@/types/brokerage';
import { brokerageApi } from '@/services/api/brokerage';
import { useToast } from '@/components/common/toast';
import { formatCurrencyMillionVnd } from '@/lib/currency';
import { authClient } from '@/lib/auth-client';
import ConnectionRequestDetailModal from './ConnectionRequestDetailModal';

const KANBAN_STAGES = [
  {
    key: 'SUGGESTED',
    label: 'Gợi Ý AI',
    theme: {
      dot: 'bg-cyan-500',
      badge: 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      border: 'border-cyan-100 dark:border-cyan-900/60',
    },
  },
  {
    key: 'INITIATED',
    label: 'Đã Tiếp Cận',
    theme: {
      dot: 'bg-brand-500',
      badge: 'bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800',
      border: 'border-brand-100 dark:border-brand-900/60',
    },
  },
  {
    key: 'NEGOTIATING',
    label: 'Đang Đàm Phán',
    theme: {
      dot: 'bg-amber-500',
      badge: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      border: 'border-amber-100 dark:border-amber-900/60',
    },
  },
  {
    key: 'MOU_SIGNED',
    label: 'Đã Ký MOU',
    theme: {
      dot: 'bg-teal-500',
      badge: 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      border: 'border-teal-100 dark:border-teal-900/60',
    },
  },
  {
    key: 'COMPLETED',
    label: 'Hoàn Thành',
    theme: {
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      border: 'border-emerald-100 dark:border-emerald-900/60',
    },
  },
];

export default function OpportunitiesPipelinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const tabParam = searchParams.get('tab');
  const activeTab = tabParam === 'inbound' ? 'inbound' : 'pipeline';

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [inboundStatus, setInboundStatus] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
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

      const [opps, reqs] = await Promise.all([
        brokerageApi.getOpportunities(
          undefined,
          search.trim() || undefined,
          isPlatformAdmin ? undefined : 'my',
          isPlatformAdmin ? undefined : sellerOrg
        ),
        brokerageApi.getConnectionRequests({
          search: search.trim() || undefined,
          scope: isPlatformAdmin ? undefined : 'my',
          organizationName: isPlatformAdmin ? undefined : sellerOrg,
        }),
      ]);
      setOpportunities(opps);
      setConnectionRequests(reqs);
    } catch (err: any) {
      setError(err.message || 'Không thể tải pipeline cơ hội.');
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

  const handleTabChange = (newTab: 'pipeline' | 'inbound') => {
    if (newTab === 'inbound') {
      router.push('/portal/opportunities/pipeline?tab=inbound');
    } else {
      router.push('/portal/opportunities/pipeline');
    }
  };

  const handleStageMove = async (id: string, currentStage: string, direction: 'NEXT' | 'PREV') => {
    const stageKeys = KANBAN_STAGES.map((s) => s.key);
    const currentIndex = stageKeys.indexOf(currentStage);
    const targetIndex = direction === 'NEXT' ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex < 0 || targetIndex >= stageKeys.length) return;
    const targetStage = stageKeys[targetIndex];

    setUpdatingId(id);
    try {
      await brokerageApi.updateOpportunityStage(id, targetStage);
      toast.success(
        `Đã chuyển giai đoạn deal sang "${KANBAN_STAGES[targetIndex]?.label}".`,
        'Cập Nhật Giai Đoạn'
      );
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật giai đoạn cơ hội.', 'Thất bại');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRespondRequest = async (requestId: string, action: 'ACCEPT' | 'REJECT') => {
    setProcessingRequestId(requestId);
    try {
      await brokerageApi.respondConnectionRequest(requestId, action);
      if (action === 'ACCEPT') {
        toast.success(
          'Đã chấp thuận yêu cầu kết nối! Deal Room đã được tự động khởi tạo trong Pipeline.',
          'Kết Nối Thành Công'
        );
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

  // KPIs
  const totalValue = opportunities.reduce((sum, o) => sum + (o.estimatedValueMillionVnd || 0), 0);
  const mouCount = opportunities.filter((o) => o.stage === 'MOU_SIGNED' || o.stage === 'COMPLETED').length;
  const pendingRequestsCount = connectionRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* 1. HERO WORKSPACE HEADER (ĐỒNG BỘ MÀU BLUE VÀ HỌA TIẾT LOGO NACENTWIN NHƯ CÁC MÀN HÌNH KHÁC) */}
      <section className="relative overflow-hidden rounded-3xl workspace-banner bg-brand-700 text-white p-6 sm:p-8 shadow-xl shadow-brand-950/15 border border-brand-800/40">
        {/* Lớp nghệ thuật vi mạch & nền innovation hero art đồng bộ */}
        <div
          aria-hidden="true"
          className="innovation-hero-art pointer-events-none absolute inset-0 opacity-80"
        />

        {/* Logo NacenTech in mờ sang trọng phía sau */}
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
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                Sàn Giao Dịch & Môi Giới Công Nghệ NacenTwin
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-white/50" />
              <span className="text-white/80">Quản Lý Vòng Đời Cơ Hội</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Kanban className="w-7 h-7 text-teal-300" />
              Pipeline Vòng Đời Cơ Hội Hợp Tác
            </h1>

            <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Theo dõi dòng chảy hợp tác từ gợi ý AI, kết nối thành công, thương thảo Deal Room đến ký kết Biên bản ghi nhớ (MOU) và chuyển giao công nghệ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/portal/matching/radar"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-sm transition-all shadow-sm hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              Radar Ghép Nối AI
            </Link>
          </div>
        </div>
      </section>

      {/* 2. KPI METRICS STRIP (RICH GRADIENT CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Tổng deal */}
        <div className="bg-gradient-to-br from-brand-50 to-cyan-50/70 dark:from-slate-900 dark:to-cyan-950/40 border border-brand-200/80 dark:border-cyan-900/60 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-600/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Tổng cơ hội trong phễu
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {opportunities.length} <span className="text-sm font-semibold text-slate-500">Deal</span>
            </div>
            <span className="text-caption text-brand-700 dark:text-cyan-300 font-medium">
              Đang tương tác trong Deal Room
            </span>
          </div>
        </div>

        {/* Card 2: Tổng giá trị */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/70 dark:from-slate-900 dark:to-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Tổng giá trị dự kiến
            </span>
            <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-0.5">
              {formatCurrencyMillionVnd(totalValue)}
            </div>
            <span className="text-caption text-emerald-700 dark:text-emerald-400 font-medium">
              Quy mô ngân sách chuyển giao
            </span>
          </div>
        </div>

        {/* Card 3: Thỏa thuận đã ký */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 dark:from-slate-900 dark:to-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-600/30">
            <FileSignature className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Đã ký MOU / Hoàn thành
            </span>
            <div className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-0.5">
              {mouCount} <span className="text-sm font-semibold text-amber-600">Thỏa thuận</span>
            </div>
            <span className="text-caption text-amber-700 dark:text-amber-400 font-medium">
              Sẵn sàng bàn giao kỹ thuật
            </span>
          </div>
        </div>
      </div>

      {/* 3. TABS SWITCHER & SEARCH TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* 2 Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-full md:w-auto">
          <button
            type="button"
            onClick={() => handleTabChange('pipeline')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'pipeline'
                ? 'bg-brand-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Tiến Trình Chuyển Giao & MOU</span>
            <span
              className={`px-2 py-0.5 rounded-full text-caption font-black ${
                activeTab === 'pipeline'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {opportunities.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('inbound')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'inbound'
                ? 'bg-brand-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Yêu Cầu Kết Nối Nhận Được</span>
            {pendingRequestsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-caption font-black bg-rose-500 text-white animate-pulse">
                {pendingRequestsCount} mới
              </span>
            )}
          </button>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="flex-1 md:w-80 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã deal, tiêu đề, bên mua hoặc bên bán..."
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

      {/* 4. MAIN WORKSPACE VIEW (SWITCH ACCORDING TO ACTIVE TAB) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-[520px] rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse p-4 space-y-3"
            >
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-2/3" />
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 space-y-3">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Không thể tải dữ liệu pipeline</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 transition"
          >
            Thử lại ngay
          </button>
        </div>
      ) : activeTab === 'inbound' ? (
        /* TAB 2: YÊU CẦU KẾT NỐI NHẬN ĐƯỢC (INBOUND REQUESTS) */
        <div className="space-y-4">
          {/* Sub-tabs bộ lọc trạng thái */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-full sm:w-auto">
            {[
              { key: 'ALL', label: 'Tất cả', count: connectionRequests.length },
              {
                key: 'PENDING',
                label: 'Chờ phản hồi',
                count: connectionRequests.filter((r) => r.status === 'PENDING').length,
                badgeColor: 'bg-amber-500 text-white',
              },
              {
                key: 'ACCEPTED',
                label: 'Đã chấp thuận',
                count: connectionRequests.filter((r) => r.status === 'ACCEPTED').length,
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  inboundStatus === subTab.key
                    ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-cyan-300 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{subTab.label}</span>
                <span
                  className={`px-2 py-0.2 rounded-full text-caption font-black ${
                    subTab.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {subTab.count}
                </span>
              </button>
            ))}
          </div>

          {(() => {
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
                    Khi các doanh nghiệp tìm thấy công nghệ của bạn hoặc gửi đề xuất cho bài toán của bạn, yêu cầu sẽ hiển thị ở đây để bạn phản hồi và mở Deal Room.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 gap-4">
                {displayedRequests.map((req) => {
                  const isPending = req.status === 'PENDING';
                  const isAccepted = req.status === 'ACCEPTED';

                  return (
                    <div
                      key={req.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition space-y-4"
                    >
                      {/* Request Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-brand-700 dark:text-cyan-300 bg-brand-50 dark:bg-brand-950 px-2.5 py-1 rounded-lg border border-brand-200 dark:border-brand-800">
                            {req.requestCode}
                          </span>
                          <span className="text-caption text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                          </span>
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

                      {/* Công Nghệ Mục Tiêu (Enriched Target Offer) */}
                      {req.offerTitle && (
                        <div className="p-3 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/70 dark:border-brand-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-caption font-bold text-brand-700 dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> Khách hàng quan tâm công nghệ:
                            </span>
                            <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{req.offerTitle}</span>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5">
                          <div className="text-slate-500 font-medium">Bên gửi kết nối (Bên mua):</div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-brand-600 shrink-0" />
                            <span>{req.senderOrgName}</span>
                            <span className="text-caption px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-normal">
                              {req.senderRole}
                            </span>
                          </div>
                          {(req.senderIndustry || req.senderProvince) && (
                            <div className="text-caption text-slate-400 pl-5.5">
                              {req.senderIndustry && <span>{req.senderIndustry}</span>}
                              {req.senderIndustry && req.senderProvince && <span> • </span>}
                              {req.senderProvince && <span>{req.senderProvince}</span>}
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

                      {/* Message */}
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-slate-500 block mb-1 uppercase tracking-wider text-caption">
                          Nội dung trao đổi ban đầu:
                        </span>
                        <p className="leading-relaxed">{req.message}</p>
                      </div>

                      {/* Actions Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        {/* Nút Xem Chi Tiết luôn có mặt */}
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
                            <button
                              type="button"
                              onClick={() => handleTabChange('pipeline')}
                              className="text-xs font-bold text-brand-700 dark:text-cyan-400 hover:underline flex items-center gap-1"
                            >
                              Xem Deal trong Kanban Pipeline &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      ) : (
        /* TAB 1: KANBAN 5 COLUMNS BOARD */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          {KANBAN_STAGES.map((col, colIdx) => {
            const colOpps = opportunities.filter((o) => {
              if (col.key === 'NEGOTIATING') {
                return o.stage === 'NEGOTIATING' || o.stage === 'NEGOTIATION';
              }
              if (col.key === 'INITIATED') {
                return o.stage === 'INITIATED' || o.stage === 'REQUESTED';
              }
              return o.stage === col.key;
            });

            return (
              <div
                key={col.key}
                className="bg-slate-100/70 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 flex flex-col space-y-3 min-h-[560px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.theme.dot}`} />
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">
                      {col.label}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-caption font-black border ${col.theme.badge}`}
                  >
                    {colOpps.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1">
                  {colOpps.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-center p-4 space-y-1.5 text-slate-400">
                      <Inbox className="w-6 h-6 opacity-40" />
                      <span className="text-caption font-medium">Chưa có deal ở giai đoạn này</span>
                    </div>
                  ) : (
                    colOpps.map((opp) => (
                      <div
                        key={opp.id}
                        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 p-4 shadow-xs hover:shadow-md hover:border-brand-500/60 transition-all duration-200 space-y-3 group"
                      >
                        {/* Card Header: Code & Value */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-caption font-black font-mono text-brand-700 dark:text-cyan-300 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-md border border-brand-200/70 dark:border-brand-800">
                            {opp.opportunityCode}
                          </span>
                          {opp.estimatedValueMillionVnd && (
                            <span className="text-caption font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              ~{formatCurrencyMillionVnd(opp.estimatedValueMillionVnd, { compact: true })}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-brand-700 dark:group-hover:text-cyan-400 transition-colors">
                          {opp.title}
                        </h4>

                        {/* Actors */}
                        <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5 truncate">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate font-semibold text-slate-700 dark:text-slate-200">
                              {opp.buyerOrgName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate font-semibold text-brand-700 dark:text-cyan-400">
                              {opp.sellerOrgName}
                            </span>
                          </div>
                          {opp.assignedExpertName && (
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate pt-0.5 border-t border-slate-200/60 dark:border-slate-800">
                              <UserCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                              <span className="truncate font-medium">{opp.assignedExpertName}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <Link
                            href={`/portal/opportunities/${opp.id}/deal-room`}
                            className="text-xs font-bold text-brand-700 dark:text-cyan-400 hover:text-brand-900 hover:underline flex items-center gap-1 group-hover:translate-x-0.5 transition"
                          >
                            <span>Vào Deal Room</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          {/* Move arrows */}
                          <div className="flex items-center gap-1">
                            {colIdx > 0 && (
                              <button
                                disabled={updatingId === opp.id}
                                onClick={() => handleStageMove(opp.id, col.key, 'PREV')}
                                title="Lùi lại 1 giai đoạn"
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {colIdx < KANBAN_STAGES.length - 1 && (
                              <button
                                disabled={updatingId === opp.id}
                                onClick={() => handleStageMove(opp.id, col.key, 'NEXT')}
                                title="Chuyển tiếp giai đoạn kế tiếp"
                                className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-cyan-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-700 hover:text-white transition"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL XEM CHI TIẾT YÊU CẦU KẾT NỐI (UI-CONN-REQ-DETAIL-001) */}
      <ConnectionRequestDetailModal
        isOpen={isDetailModalOpen}
        requestId={selectedRequestId}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRequestId(null);
        }}
        onResponded={async () => {
          await fetchData();
        }}
      />
    </div>
  );
}
