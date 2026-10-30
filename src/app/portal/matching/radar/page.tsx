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
} from 'lucide-react';
import Link from 'next/link';
import { MatchCandidate, ConnectionRequest } from '@/types/brokerage';
import { brokerageApi } from '@/services/api/brokerage';
import ConnectionRequestModal from './ConnectionRequestModal';
import { SectorBannerBackground } from "@/components/enterprise/SectorBannerBackground";
import { useToast } from "@/components/common/toast";
import { authClient } from '@/lib/auth-client';

export default function MatchingRadarPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'RADAR' | 'REQUESTS'>('RADAR');
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User Demands Guard (REQ-DEL-08-01, REQ-DEL-08-02, BR-DEL-08-01)
  const [userDemandsCount, setUserDemandsCount] = useState<number>(0);
  const [isCheckingDemands, setIsCheckingDemands] = useState<boolean>(true);

  // Filters
  const [sector, setSector] = useState('ALL');
  const [minScore, setMinScore] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [selectedDemandCode, setSelectedDemandCode] = useState<string>('ALL');

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
    'PROVINCIAL_ADMIN',
    'SECTOR_ADMIN',
    'CLUSTER_ADMIN',
    'PROVINCE_OFFICER',
    'PROVINCE_LEADER',
  ].includes(effectiveRole);

  const isBuyerOrPublic =
    !isAdminOrGov &&
    (!user || ['PUBLIC_USER', 'USER', 'BUYER', 'GUEST'].includes(effectiveRole));

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
          if (isMounted) setUserDemandsCount(list.length);
        } else {
          if (isMounted) setUserDemandsCount(0);
        }
      } catch {
        if (isMounted) setUserDemandsCount(0);
      } finally {
        if (isMounted) setIsCheckingDemands(false);
      }
    };

    checkUserDemands();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchRadarData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === 'RADAR') {
        const data = await brokerageApi.getRadarCandidates({
          sector: sector !== 'ALL' ? sector : undefined,
          minScore: minScore > 0 ? minScore : undefined,
          search: search.trim() || undefined,
        });
        setCandidates(data);
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
      setIsLoading(false);
      return;
    }

    fetchRadarData();
  }, [activeTab, sector, minScore, isCheckingDemands, isRadarInactive]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'RADAR' && isRadarInactive) return;
    fetchRadarData();
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

  return (
    <div className="min-h-screen bg-surface-subtle p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-700 p-6 sm:p-8 text-white shadow-xl shadow-brand-950/10 border border-brand-800/20">
        <SectorBannerBackground sectorCode="LV17" opacity={0.4} />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-100 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-brand-200" />
              <span>AI MATCHING ENGINE 4.0 · TT 17/2019/TT-BKHCN</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Radar Ghép Nối Cung–Cầu & Điểm Tương Thích
            </h1>
            <p className="text-xs sm:text-sm text-brand-100 leading-relaxed max-w-2xl">
              Hệ thống định lượng tương thích tự động dựa trên ma trận 10 lĩnh vực trọng điểm, độ sẵn sàng TRL 1–9, chỉ số cấp thiết TNI và xác thực Sở hữu trí tuệ độc quyền.
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
            <span>Ứng Viên Ghép Đôi AI</span>
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
              {requests.length}
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
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Radar Ghép Nối AI Chưa Kích Hoạt
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Thuật toán Radar AI cần ít nhất 01 Nhu cầu công nghệ làm tâm đối sánh để phân tích điểm TRL, TNI và đề xuất các giải pháp công nghệ phù hợp nhất.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/khao-sat-nhu-cau"
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
                  <option value="ALL">Tất cả bài toán ({candidates.length})</option>
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
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Ngành TT17:</span>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="h-11 px-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="ALL">Tất cả ngành</option>
                  <option value="LV01">Nông nghiệp công nghệ cao</option>
                  <option value="LV11">Chế tạo máy & Tự động hóa</option>
                  <option value="LV07">Công nghệ môi trường & Xử lý rác</option>
                  <option value="LV14">Y Dược & Thiết bị y tế</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Điểm khớp:</span>
                <select
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
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
                onClick={fetchRadarData}
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
                onClick={fetchRadarData}
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
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Không tìm thấy ứng viên ghép đôi phù hợp</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Hãy thử giảm tiêu chí lọc điểm khớp hoặc mở rộng ngành kỹ thuật để phát hiện thêm các cơ hội chuyển giao công nghệ mới.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {candidates
                .filter((c) => selectedDemandCode === 'ALL' || c.demandCode === selectedDemandCode)
                .map((c) => {
                const isHighMatch = c.matchScore >= 90;
                const isMediumMatch = c.matchScore >= 80;

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
                            <Cpu className="w-3.5 h-3.5 text-emerald-600" /> TRL {c.trlLevel}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-black flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-brand-600" /> TNI {c.tniScore}/100
                          </span>
                          {c.ipStatus === 'PATENT_GRANTED' && (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-black flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Có bằng SHTT
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
                          <span className="text-xl font-black leading-none">{c.matchScore}%</span>
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
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold">
                          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                            <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Giải trình độ tương thích AI:
                          </span>
                          <span className="text-brand-700 dark:text-cyan-400 font-extrabold">{c.matchScore}% Tổng Hợp</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-semibold text-slate-600 dark:text-slate-300">
                          <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700">
                            <span className="block text-xs text-slate-400">Lĩnh vực:</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% Khớp</span>
                          </div>
                          <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700">
                            <span className="block text-xs text-slate-400">Mức TRL:</span>
                            <span className="text-brand-700 dark:text-cyan-400 font-bold">TRL {c.trlLevel}</span>
                          </div>
                          <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700">
                            <span className="block text-xs text-slate-400">Cấp thiết TNI:</span>
                            <span className="text-rose-600 dark:text-rose-400 font-bold">{c.tniScore}/100</span>
                          </div>
                          <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700">
                            <span className="block text-xs text-slate-400">Bảo hộ SHTT:</span>
                            <span className="text-amber-700 dark:text-amber-400 font-bold">{c.ipStatus === 'PATENT_GRANTED' ? 'Đã cấp bằng' : 'Đang xét'}</span>
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
        </div>
        )
      )}

      {/* TAB 2: CONNECTION REQUESTS */}
      {activeTab === 'REQUESTS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Danh sách Yêu Cầu Kết Nối Hai Chiều
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Theo dõi tiến trình đàm phán bước đầu trước khi kích hoạt Deal Room bảo mật.
              </p>
            </div>
            <button
              onClick={fetchRadarData}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950 transition"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
            </button>
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
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {requests.map((r) => (
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
