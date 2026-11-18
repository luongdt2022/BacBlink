'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Cpu,
  RefreshCw,
  Award,
  ChevronRight,
  Send,
  Kanban,
  Zap,
  ArrowDownUp,
  Layers,
  SlidersHorizontal,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { MatchCandidate, ConnectionRequest } from '@/types/brokerage';
import { brokerageApi } from '@/services/api/brokerage';
import ConnectionRequestModal from './ConnectionRequestModal';
import { SectorBannerBackground } from "@/components/enterprise/SectorBannerBackground";
import { useToast } from "@/components/common/toast";
import { authClient } from '@/lib/auth-client';
import { BACLINK_SECTOR_LABELS } from '@/lib/label-resolver';

export default function MatchingRadarPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'RADAR' | 'REQUESTS'>('RADAR');
  const [requestStatusFilter, setRequestStatusFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [radarPage, setRadarPage] = useState(1);
  const [radarTotal, setRadarTotal] = useState(0);
  const [radarTotalPages, setRadarTotalPages] = useState(1);
  const RADAR_PAGE_SIZE = 24;
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User Demands Guard (REQ-DEL-08-01, REQ-DEL-08-02, BR-DEL-08-01, T062)
  const [userDemandsCount, setUserDemandsCount] = useState<number>(0);
  const [userDemands, setUserDemands] = useState<Array<{ id: string; itemCode: string; title: string }>>([]);
  const [isCheckingDemands, setIsCheckingDemands] = useState<boolean>(true);

  // Filters
  const [sector, setSector] = useState('ALL');
  const [minScore, setMinScore] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [selectedDemandCode, setSelectedDemandCode] = useState<string>('ALL');
  const [isRecomputing, setIsRecomputing] = useState(false);

  // Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<MatchCandidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const user = authClient.getUser();
  const effectiveRole =
    (typeof window !== 'undefined' ? localStorage.getItem('nacentwin_active_role') : null) ||
    user?.role ||
    'PUBLIC_USER';

  const isAdminOrGov = [
    'SUPER_ADMIN',
    'OPERATOR_ADMIN',
    'ADMIN',
  ].includes(effectiveRole);

  const isBuyerOrPublic =
    !isAdminOrGov &&
    (!user || ['PUBLIC_USER', 'USER', 'BUYER', 'GUEST'].includes(effectiveRole));

  const isBuyer = effectiveRole === 'BUYER';
  const isRadarInactive = isBuyerOrPublic && userDemandsCount === 0;

  useEffect(() => {
    let isMounted = true;
    const checkUserDemands = async () => {
      setIsCheckingDemands(true);
      try {
        const token = authClient.getToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch('/api/v1/buyer/demands', { headers });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : [];
          if (isMounted) {
            setUserDemandsCount(list.length);
            const mapped = list.map((d: any) => ({
              id: d.id,
              itemCode: d.itemCode || d.item_code || d.code || d.demandCode || d.id,
              title: d.title || d.technicalProblem || d.expectedGoal || d.name || d.itemCode || "Bài toán công nghệ",
            }));
            setUserDemands(mapped);
            if (isBuyer && mapped.length > 0) {
              setSelectedDemandCode((prev) => (prev === 'ALL' ? mapped[0].itemCode : prev));
            }
          }
        } else {
          if (isMounted) {
            setUserDemandsCount(0);
            setUserDemands([]);
          }
        }
      } catch {
        if (isMounted) {
          setUserDemandsCount(0);
          setUserDemands([]);
        }
      } finally {
        if (isMounted) setIsCheckingDemands(false);
      }
    };

    checkUserDemands();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isBuyer && userDemands.length > 0) {
      const validCodes = new Set(userDemands.flatMap((d) => [d.itemCode, d.id]));
      if (selectedDemandCode === 'ALL' || !validCodes.has(selectedDemandCode)) {
        setSelectedDemandCode(userDemands[0].itemCode);
      }
    }
  }, [isBuyer, userDemands, selectedDemandCode]);

  const fetchRadarData = async (pageOverride?: number) => {
    const targetPage = pageOverride ?? radarPage;
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === 'RADAR') {
        const [data, reqs] = await Promise.all([
          brokerageApi.getRadarCandidates({
            sector: sector !== 'ALL' ? sector : undefined,
            minScore: minScore > 0 ? minScore : undefined,
            search: search.trim() || undefined,
            page: targetPage,
            pageSize: RADAR_PAGE_SIZE,
          }),
          brokerageApi.getConnectionRequests().catch(() => []),
        ]);
        const safeItems = Array.isArray(data) ? data : [];
        setCandidates(safeItems);
        setRadarTotal(safeItems.length);
        setRadarTotalPages(Math.max(1, Math.ceil(safeItems.length / RADAR_PAGE_SIZE)));
        setRequests(Array.isArray(reqs) ? reqs : []);
      } else {
        const data = await brokerageApi.getConnectionRequests();
        setRequests(data);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isCheckingDemands) return;

    if (activeTab === 'RADAR' && isRadarInactive) {
      setCandidates([]);
      setRadarTotal(0);
      setRadarTotalPages(1);
      setIsLoading(false);
      return;
    }

    fetchRadarData();
  }, [activeTab, sector, minScore, radarPage, isCheckingDemands, isRadarInactive]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'RADAR' && isRadarInactive) return;
    if (radarPage !== 1) {
      setRadarPage(1);
    } else {
      fetchRadarData(1);
    }
  };

  const handleRecompute = async () => {
    setIsRecomputing(true);
    try {
      const demandCodeParam =
        selectedDemandCode !== 'ALL' && selectedDemandCode !== 'ALL_MINE'
          ? selectedDemandCode
          : isBuyer && userDemands.length > 0
          ? userDemands[0].itemCode
          : undefined;
      const result = await brokerageApi.recomputeRadar(demandCodeParam);
      toast.success(
        `Đã hoàn tất tính toán đối soát AI (${result.computedMatchesCount} cặp khớp trong ${result.tookMs}ms)!`,
        "Đối Soát Thành Công"
      );
      await fetchRadarData();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi kích hoạt tính toán đối soát AI.", "Thao Tác Thất Bại");
    } finally {
      setIsRecomputing(false);
    }
  };

  const handleRespondRequest = async (id: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      await brokerageApi.respondConnectionRequest(id, action);
      setActionSuccessMsg(
        action === 'ACCEPT'
          ? 'Đã chấp thuận kết nối! Đã khởi tạo Cơ hội đàm phán trong Pipeline.'
          : 'Đã từ chối yêu cầu kết nối.'
      );
      fetchRadarData();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi phản hồi yêu cầu kết nối.", "Thao Tác Thất Bại");
    }
  };

  const isPendingConnectionRequest = (status?: string | null) => {
    const normalized = (status || '').toUpperCase();
    return normalized !== 'ACCEPTED' && normalized !== 'REJECTED';
  };

  const pendingRequestsCount = requests.filter((r) => isPendingConnectionRequest(r.status)).length;
  const acceptedRequestsCount = requests.filter((r) => (r.status || '').toUpperCase() === 'ACCEPTED').length;
  const rejectedRequestsCount = requests.filter((r) => (r.status || '').toUpperCase() === 'REJECTED').length;

  const sortedRequests = [...requests].sort((a, b) => {
    const aPending = isPendingConnectionRequest(a.status) ? 0 : 1;
    const bPending = isPendingConnectionRequest(b.status) ? 0 : 1;
    if (aPending !== bPending) return aPending - bPending;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredSortedRequests = sortedRequests.filter((r) => {
    if (requestStatusFilter === 'PENDING') return isPendingConnectionRequest(r.status);
    if (requestStatusFilter === 'ACCEPTED') return (r.status || '').toUpperCase() === 'ACCEPTED';
    if (requestStatusFilter === 'REJECTED') return (r.status || '').toUpperCase() === 'REJECTED';
    return true;
  });

  return (
    <div className="min-h-screen bg-surface-subtle p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-700 p-6 sm:p-8 text-white shadow-xl shadow-brand-950/10 border border-brand-800/20">
        <SectorBannerBackground sectorCode="IND_ELEC" opacity={0.4} />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-100 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-brand-200" />
              <span>AI MATCHING ENGINE 4.0 · HIỆP HỘI BACLINK</span>
            </div>
            <h1 className="type-page-title text-white flex items-center gap-3">
              Radar Ghép Nối Cung–Cầu & Điểm Tương Thích
            </h1>
            <p className="text-xs sm:text-sm text-brand-100 leading-relaxed max-w-2xl">
              Hệ thống định lượng tương thích tự động dựa trên 8 ngành công nghiệp mũi nhọn & các KCN Bắc Ninh, độ sẵn sàng TRL 1–9, chỉ số cấp thiết TNI và xác thực Sở hữu trí tuệ độc quyền.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/portal/opportunities/pipeline"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm backdrop-blur-sm hover:scale-[1.02]"
            >
              <Kanban className="w-4 h-4 text-brand-200" /> Pipeline Cơ Hội (Kanban)
            </Link>
          </div>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex p-1.5 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl border border-slate-300/60 dark:border-slate-700/80 gap-1.5 shadow-inner">
          <button
            onClick={() => setActiveTab('RADAR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'RADAR'
                ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-white shadow-sm shadow-slate-950/10'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-brand-700 dark:text-brand-400" />
            <span>{effectiveRole === 'SELLER' ? 'Nhu Cầu AI Gợi Ý' : 'Giải Pháp AI Gợi Ý'}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === 'RADAR'
                  ? 'bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300'
                  : 'bg-slate-300/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {candidates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('REQUESTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'REQUESTS'
                ? 'bg-white dark:bg-slate-900 text-brand-900 dark:text-white shadow-sm shadow-slate-950/10'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Yêu Cầu Kết Nối Đã Gửi / Nhận</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === 'REQUESTS'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                  : 'bg-slate-300/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {pendingRequestsCount}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Thuật toán tích hợp TNI ≥ 80 + SHTT TRL 7–9</span>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300/80 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-sm animate-page-enter">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <Link
            href="/portal/opportunities/pipeline"
            className="font-bold underline text-emerald-700 dark:text-emerald-300 hover:text-emerald-900"
          >
            Xem Pipeline ngay &rarr;
          </Link>
        </div>
      )}

      {/* TAB 1: RADAR CANDIDATES */}
      {activeTab === 'RADAR' && (
        isCheckingDemands ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse p-6 space-y-4"
              >
                <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
                <div className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : isRadarInactive ? (
          <div className="p-8 sm:p-14 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm max-w-3xl mx-auto space-y-6 animate-page-enter">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-700 dark:text-brand-300 ring-8 ring-brand-50/50 dark:ring-brand-950/50">
              <Sparkles className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            </div>

            <div className="space-y-3 max-w-xl mx-auto">
              <h2 className="type-section-title text-slate-900 dark:text-white">
                Radar Ghép Nối AI Chưa Kích Hoạt
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Thuật toán Radar AI cần ít nhất 01 Nhu cầu công nghệ làm tâm đối sánh để phân tích điểm TRL, TNI và đề xuất các giải pháp công nghệ phù hợp nhất.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/portal/buyer/demands"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-700/20 hover:shadow-lg transition-all"
              >
                <span>+ Gửi Nhu Cầu Công Nghệ Đầu Tiên</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/chao-ban-cong-nghe"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
              >
                <Cpu className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Khám phá Sàn Công nghệ</span>
              </Link>
            </div>
          </div>
        ) : (
        <div className="space-y-6">
          {/* Polished Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên nhu cầu, công nghệ hoặc doanh nghiệp..."
                className="w-full h-11 pl-10 pr-4 text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-slate-900 dark:text-white"
              />
            </form>

            <div className="flex flex-wrap items-center gap-3">
              {/* My Demand Context Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Bài toán nguồn:</span>
                <select
                  value={selectedDemandCode}
                  onChange={(e) => setSelectedDemandCode(e.target.value)}
                  className="h-11 px-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer max-w-[200px] truncate"
                  title="Chọn bài toán nguồn để lọc kết quả Radar"
                >
                  {isBuyer ? (
                    <>
                      {userDemands.length > 1 && (
                        <option value="ALL_MINE">Tất cả bài toán của tôi ({userDemands.length})</option>
                      )}
                      {userDemands.map((d) => (
                        <option key={d.id} value={d.itemCode}>
                          {d.itemCode}: {d.title}
                        </option>
                      ))}
                    </>
                  ) : (
                    <>
                      <option value="ALL">Tất cả bài toán ({radarTotal || candidates.length})</option>
                      {Array.from(
                        new Map(
                          candidates
                            .filter((c) => c.demandCode)
                            .map((c) => [c.demandCode, c.demandTitle || c.demandCode])
                        ).entries()
                      ).map(([code, title]) => (
                        <option key={code} value={code}>
                          {code}: {title}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Ngành công nghiệp:</span>
                <select
                  value={sector}
                  onChange={(e) => {
                    setSector(e.target.value);
                    setRadarPage(1);
                  }}
                  className="h-11 px-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="ALL">Tất cả ngành BACLINK</option>
                  {Object.entries(BACLINK_SECTOR_LABELS).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Điểm khớp:</span>
                <select
                  value={minScore}
                  onChange={(e) => {
                    setMinScore(Number(e.target.value));
                    setRadarPage(1);
                  }}
                  className="h-11 px-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value={0}>Tất cả điểm</option>
                  <option value={70}>&ge; 70% Khá</option>
                  <option value={80}>&ge; 80% Cao</option>
                  <option value={90}>&ge; 90% Rất cao</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleRecompute}
                disabled={isRecomputing}
                className="h-11 px-4 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/80 dark:hover:bg-brand-900 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-cyan-400 text-xs font-bold flex items-center gap-2 transition shadow-xs disabled:opacity-50 shrink-0"
                title="Kích hoạt công cụ AI quét lại toàn bộ dữ liệu Cung - Cầu mới nhất"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRecomputing ? 'animate-spin text-brand-600' : ''}`} />
                <span>{isRecomputing ? 'Đang tính toán...' : 'Tính toán lại đối soát'}</span>
              </button>

              <button
                type="button"
                onClick={() => fetchRadarData()}
                className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-700 dark:hover:text-white hover:bg-brand-50 dark:hover:bg-brand-950 transition-all shrink-0"
                title="Làm mới dữ liệu"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Candidates Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse p-6 space-y-4"
                >
                  <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
                  <div className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-sm space-y-3">
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
              <button
                onClick={() => fetchRadarData()}
                className="px-5 py-2.5 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 shadow-sm transition"
              >
                Thử lại
              </button>
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-700 dark:text-brand-300">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="type-card-title text-slate-900 dark:text-white">Không tìm thấy giải pháp ghép nối phù hợp</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Hãy thử giảm tiêu chí lọc điểm khớp hoặc mở rộng ngành kỹ thuật để phát hiện thêm các cơ hội chuyển giao công nghệ mới.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {candidates
                .filter((c) => {
                  if (isBuyer) {
                    const buyerCodes = new Set(userDemands.flatMap((d) => [d.itemCode, d.id]));
                    const isOwned =
                      (c.demandCode && buyerCodes.has(c.demandCode)) ||
                      (c.demandId && buyerCodes.has(c.demandId));
                    if (!isOwned) return false;

                    if (selectedDemandCode !== 'ALL' && selectedDemandCode !== 'ALL_MINE') {
                      return c.demandCode === selectedDemandCode || c.demandId === selectedDemandCode;
                    }
                    return true;
                  }

                  return selectedDemandCode === 'ALL' || c.demandCode === selectedDemandCode || c.demandId === selectedDemandCode;
                })
                .map((c) => {
                  const resolvedScore = c.matchScore ?? c.overallMatchScore ?? 0;
                  const resolvedTrl = c.trlLevel ?? c.xaiBreakdown?.trlLevel ?? 0;
                  const resolvedTni = c.tniScore ?? c.xaiBreakdown?.tniScore ?? 0;
                  const resolvedIp = c.ipStatus ?? c.xaiBreakdown?.ipStatus;
                  const isHighMatch = resolvedScore >= 90;
                  const isMediumMatch = resolvedScore >= 80;

                  return (
                  <div
                    key={c.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-brand-500/60 dark:hover:border-brand-500/60 transition-all duration-300 flex flex-col justify-between relative group"
                  >
                    {/* Top Highlight Ribbon for High Score */}
                    {isHighMatch && (
                      <div className="absolute top-0 left-6 -translate-y-1/2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase px-3.5 py-1 rounded-full shadow-md shadow-emerald-600/20 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>KHỚP NỐI ƯU TIÊN CAO (TOP RECOMMENDATION)</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Header Card: Badges Strip & High-Tech Score Ring */}
                      <div className="flex items-start justify-between gap-3 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
                            {c.sectorCode}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black flex items-center gap-1">
                            <Cpu className="w-3.5 h-3.5 text-emerald-600" /> TRL {resolvedTrl}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-black flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-brand-600" /> TNI {resolvedTni}/100
                          </span>
                          {(resolvedIp === 'PATENT_GRANTED' || resolvedIp === 'Đã cấp bằng sáng chế') && (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-black flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Có bằng SHTT
                            </span>
                          )}
                          {(c.isDegraded || c.xaiBreakdown?.semanticEngine === 'POSTGRES_FTS_FALLBACK') && (
                            <span
                              data-testid="fts-fallback-badge"
                              className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-black flex items-center gap-1"
                              title="Sidecar AI offline - đang chạy chế độ đối soát dự phòng FTS"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>[Chế độ dự phòng FTS]</span>
                            </span>
                          )}
                        </div>

                        {/* High-Impact AI Match Score Badge */}
                        <div
                          className={`shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl shadow-md text-white transition-transform group-hover:scale-105 ${
                            isHighMatch
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25'
                              : isMediumMatch
                              ? 'bg-gradient-to-br from-brand-600 to-brand-800 shadow-brand-600/25'
                              : 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-amber-500/25'
                          }`}
                        >
                          <span className="text-xl font-black leading-none">{resolvedScore}%</span>
                          <span className="text-xs uppercase font-extrabold tracking-tight mt-1 opacity-90">
                            {isHighMatch ? 'Rất Cao' : isMediumMatch ? 'Khớp Cao' : 'Khá'}
                          </span>
                        </div>
                      </div>

                      {/* Matching Pair Comparison (Bên Mua <-> Bên Bán) */}
                      <div className="space-y-2.5 pt-1">
                        {/* Buyer Demand Box */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-50/70 to-slate-50 dark:from-slate-800/80 dark:to-slate-900 border border-brand-200/70 dark:border-brand-900/40 space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between text-xs font-bold text-brand-800 dark:text-brand-300">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                              <span>BÊN MUA · {c.buyerOrganizationName}</span>
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                              {c.demandCode}
                            </span>
                          </div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-2 leading-relaxed">
                            {c.demandTitle}
                          </p>
                        </div>

                        {/* Central Visual Connector */}
                        <div className="flex items-center justify-center -my-1 relative z-10">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs text-xs font-black text-slate-600 dark:text-slate-300">
                            <ArrowDownUp className="w-3.5 h-3.5 text-brand-700 dark:text-brand-400" />
                            <span>AI ĐỐI SOÁT CUNG – CẦU TỰ ĐỘNG</span>
                          </span>
                        </div>

                        {/* Seller Solution Box */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-slate-50 dark:from-slate-800/80 dark:to-slate-900 border border-emerald-200/70 dark:border-emerald-900/40 space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                            <span className="flex items-center gap-1.5">
                              <Cpu className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                              <span>BÊN BÁN · {c.sellerOrganizationName}</span>
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                              {c.offerCode}
                            </span>
                          </div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-2 leading-relaxed">
                            {c.offerTitle}
                          </p>
                        </div>
                      </div>

                      {/* Explainable AI Breakdown (XAI) */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold">
                          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                            <span>Giải trình độ tương thích AI (XAI 4 trục):</span>
                          </span>
                          <span className="text-brand-700 dark:text-cyan-400 font-black">{resolvedScore}% Tổng Hợp</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 font-semibold text-slate-600 dark:text-slate-300">
                          {/* Trục 1: Ngữ nghĩa AI (40%) */}
                          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="block text-xs text-slate-400 font-medium">Ngữ nghĩa AI:</span>
                              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">
                                {c.xaiBreakdown ? `${c.xaiBreakdown.semanticScore}%` : '100% Khớp'}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(0, c.xaiBreakdown?.semanticScore ?? 100))}%` }}
                              />
                            </div>
                            <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
                              {c.xaiBreakdown?.semanticEngine === 'POSTGRES_FTS_FALLBACK' ? 'FTS Lexical' : 'AI BGE-M3'}
                            </span>
                          </div>

                          {/* Trục 2: Mức TRL (30%) */}
                          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="block text-xs text-slate-400 font-medium">Mức TRL:</span>
                              <span className="text-brand-700 dark:text-cyan-400 font-extrabold">
                                {c.xaiBreakdown ? `TRL ${c.xaiBreakdown.trlLevel}` : `TRL ${resolvedTrl}`}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-brand-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(0, c.xaiBreakdown?.trlScore ?? ((resolvedTrl / 9) * 100)))}%` }}
                              />
                            </div>
                            <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
                              {c.xaiBreakdown?.trlStage ?? (resolvedTrl >= 7 ? 'Thương mại hóa' : 'Thử nghiệm')}
                            </span>
                          </div>

                          {/* Trục 3: Cấp thiết TNI (15%) */}
                          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="block text-xs text-slate-400 font-medium">Cấp thiết TNI:</span>
                              <span className="text-rose-600 dark:text-rose-400 font-extrabold">
                                {c.xaiBreakdown ? `${c.xaiBreakdown.tniScore}/100` : `${resolvedTni}/100`}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(0, c.xaiBreakdown?.tniScore ?? resolvedTni))}%` }}
                              />
                            </div>
                            <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
                              {c.xaiBreakdown?.tniBand ?? (resolvedTni >= 80 ? 'Cấp thiết rất cao' : 'Cấp thiết cao')}
                            </span>
                          </div>

                          {/* Trục 4: Bảo hộ SHTT (15%) */}
                          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="block text-xs text-slate-400 font-medium">Bảo hộ SHTT:</span>
                              <span className="text-amber-700 dark:text-amber-400 font-extrabold">
                                {c.xaiBreakdown
                                  ? `${c.xaiBreakdown.ipScore}%`
                                  : (resolvedIp === 'PATENT_GRANTED' || resolvedIp === 'Đã cấp bằng sáng chế' ? 'Đã cấp bằng' : 'Đang xét')}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(0, c.xaiBreakdown?.ipScore ?? (resolvedIp === 'PATENT_GRANTED' ? 100 : 60)))}%` }}
                              />
                            </div>
                            <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
                              {c.xaiBreakdown?.ipDescription ?? (resolvedIp === 'PATENT_GRANTED' || resolvedIp === 'Đã cấp bằng sáng chế' ? 'Đã cấp bằng' : 'Đang xét')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-4 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Bảo vệ PDPD (Ẩn danh trước kết nối)</span>
                      </span>

                      <button
                        onClick={() => {
                          setSelectedCandidate(c);
                          setIsModalOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm shadow-brand-700/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Send className="w-3.5 h-3.5" /> Gửi Yêu Cầu Kết Nối
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!isLoading && !error && radarTotalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Hiển thị trang {radarPage} / {radarTotalPages} (tổng {radarTotal} cặp ghép nối)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={radarPage <= 1}
                  onClick={() => setRadarPage((p) => Math.max(1, p - 1))}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  Trang trước
                </button>
                <button
                  type="button"
                  disabled={radarPage >= radarTotalPages}
                  onClick={() => setRadarPage((p) => Math.min(radarTotalPages, p + 1))}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  Trang sau
                </button>
              </div>
            </div>
          )}
        </div>
        )
      )}

      {/* TAB 2: CONNECTION REQUESTS */}
      {activeTab === 'REQUESTS' && (
        <div className="space-y-5">
          {/* 3 Thẻ Tóm Tắt Trạng Thái: Cần xử lý / Đã chấp thuận / Đã từ chối */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setRequestStatusFilter('PENDING')}
              className={`text-left bg-gradient-to-br from-amber-50 to-orange-50/70 dark:from-slate-900 dark:to-amber-950/40 border rounded-2xl p-5 shadow-sm flex items-center gap-4 transition hover:shadow-md cursor-pointer ${
                requestStatusFilter === 'PENDING'
                  ? 'border-amber-500 ring-2 ring-amber-400/30'
                  : 'border-amber-200/80 dark:border-amber-900/60'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-600/30">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Cần Xử Lý (Chờ Phản Hồi)
                </span>
                <div className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-0.5">
                  {pendingRequestsCount} <span className="text-sm font-semibold text-amber-600">Yêu cầu</span>
                </div>
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  Chưa chấp thuận hay từ chối
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRequestStatusFilter('ACCEPTED')}
              className={`text-left bg-gradient-to-br from-emerald-50 to-teal-50/70 dark:from-slate-900 dark:to-emerald-950/40 border rounded-2xl p-5 shadow-sm flex items-center gap-4 transition hover:shadow-md cursor-pointer ${
                requestStatusFilter === 'ACCEPTED'
                  ? 'border-emerald-500 ring-2 ring-emerald-400/30'
                  : 'border-emerald-200/80 dark:border-emerald-900/60'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Đã Chấp Thuận
                </span>
                <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-0.5">
                  {acceptedRequestsCount} <span className="text-sm font-semibold text-emerald-600">Thương vụ</span>
                </div>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  Đã kích hoạt sang Pipeline Deal
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRequestStatusFilter('REJECTED')}
              className={`text-left bg-gradient-to-br from-rose-50 to-slate-50 dark:from-slate-900 dark:to-rose-950/30 border rounded-2xl p-5 shadow-sm flex items-center gap-4 transition hover:shadow-md cursor-pointer ${
                requestStatusFilter === 'REJECTED'
                  ? 'border-rose-500 ring-2 ring-rose-400/30'
                  : 'border-rose-200/80 dark:border-rose-900/50'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/25">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Đã Từ Chối
                </span>
                <div className="text-2xl font-black text-rose-800 dark:text-rose-300 mt-0.5">
                  {rejectedRequestsCount} <span className="text-sm font-semibold text-rose-600">Yêu cầu</span>
                </div>
                <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">
                  Đã đóng hoặc không phù hợp
                </span>
              </div>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="type-card-title text-slate-900 dark:text-white">
                  Danh sách Yêu Cầu Kết Nối Hai Chiều
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Theo dõi tiến trình đàm phán bước đầu trước khi kích hoạt Deal Room bảo mật.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* 4 Tabs Bộ Lọc Trạng Thái đồng bộ màn Khách hàng liên hệ */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                  {[
                    { key: 'ALL', label: 'Tất cả', count: requests.length },
                    {
                      key: 'PENDING',
                      label: 'Cần xử lý',
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
                      count: rejectedRequestsCount,
                      badgeColor: 'bg-slate-400 text-white',
                    },
                  ].map((subTab) => (
                    <button
                      key={subTab.key}
                      type="button"
                      onClick={() => setRequestStatusFilter(subTab.key as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        requestStatusFilter === subTab.key
                          ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-cyan-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span>{subTab.label}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-xs font-black leading-none ${
                          subTab.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {subTab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => fetchRadarData()}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950 transition cursor-pointer"
                  title="Làm mới danh sách"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Clock className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Chưa có yêu cầu kết nối nào</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Các yêu cầu do bạn gửi đi hoặc đối tác mời sẽ hiển thị tại đây.</p>
              </div>
            ) : filteredSortedRequests.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  Không có yêu cầu nào ở trạng thái đã chọn
                </h4>
                <button
                  type="button"
                  onClick={() => setRequestStatusFilter('ALL')}
                  className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition cursor-pointer"
                >
                  Xem tất cả ({requests.length})
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSortedRequests.map((r) => (
                <div
                  key={r.id}
                  className="py-5 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        {r.requestCode}
                      </span>
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-extrabold ${
                          r.status === 'ACCEPTED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : r.status === 'REJECTED'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {r.status === 'ACCEPTED'
                          ? 'ĐÃ CHẤP THUẬN'
                          : r.status === 'REJECTED'
                          ? 'ĐÃ TỪ CHỐI'
                          : 'CHỜ PHẢN HỒI'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-white font-bold">{r.senderOrgName}</strong> ({r.senderRole}) &rarr;{' '}
                      <strong className="text-slate-900 dark:text-white font-bold">{r.receiverOrgName}</strong>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{r.message}"</p>
                    {r.proposedBudgetRange && (
                      <p className="text-xs text-brand-700 dark:text-brand-300 font-bold">
                        Ngân sách đề xuất: {r.proposedBudgetRange}
                      </p>
                    )}
                  </div>

                  {/* Actions for Pending Requests */}
                  {r.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespondRequest(r.id, 'ACCEPT')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Chấp nhận
                      </button>
                      <button
                        onClick={() => handleRespondRequest(r.id, 'REJECT')}
                        className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <XCircle className="w-4 h-4" /> Từ chối
                      </button>
                    </div>
                  )}
                </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Connection Request */}
      <ConnectionRequestModal
        isOpen={isModalOpen}
        candidate={selectedCandidate}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setActionSuccessMsg('Đã gửi yêu cầu kết nối thành công! Đang chờ đối tác phản hồi.');
          fetchRadarData();
          setTimeout(() => setActionSuccessMsg(null), 4000);
        }}
      />
    </div>
  );
}
