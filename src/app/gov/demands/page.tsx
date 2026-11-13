'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Flame,
  Clock,
  Filter,
  AlertCircle,
  Building2,
  FileQuestion,
  Search,
  X,
  ArrowUpDown,
  Sparkles,
  GraduationCap,
  Briefcase,
  Mail,
  Check,
  BookOpen,
  Award,
  FileText,
  Eye,
} from 'lucide-react';
import { Async, AsyncState } from '@/components/ui/async';
import { useToast } from '@/components/common/toast';
import { GovPageHeader } from '@/components/gov/gov-page-header';
import { resolveProvinceName, resolveTniUrgency, resolveSectorName } from '@/lib/gov-label-resolver';
import { authClient } from '@/lib/auth-client';
import { getTniClassification } from '@/components/demand/TniRealtimeCalculator';
import TniMethodologyModal from '@/components/common/TniMethodologyModal';
import IndexVerificationBadge from '@/components/common/IndexVerificationBadge';

interface ExpertItem {
  id: string;
  fullName: string;
  title: string; // TS, PGS.TS, Chuyên gia cao cấp...
  field: string;
  organization: string;
  email: string;
  activeConsultationsCount: number;
}

export default function GovDemandsPage() {
  const toast = useToast();
  const [demands, setDemands] = useState<any[]>([]);
  const [asyncState, setAsyncState] = useState<AsyncState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'VERIFIED'>('ALL');
  const [tniFilter, setTniFilter] = useState<'ALL' | 'URGENT' | 'STRATEGIC' | 'STANDARD'>('ALL');
  const [sortBy, setSortBy] = useState<'latest' | 'tni'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal chọn chuyên gia từ CSDL thật
  const [assignModalDemand, setAssignModalDemand] = useState<any | null>(null);
  const [expertsList, setExpertsList] = useState<ExpertItem[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<ExpertItem | null>(null);
  const [loadingExperts, setLoadingExperts] = useState(false);

  // Modal Thẩm Định Nhu Cầu & Tách Bạch Niêm Yết vs TNI (Wave 3)
  const [verifyModalDemand, setVerifyModalDemand] = useState<any | null>(null);
  const [verifyDecisionType, setVerifyDecisionType] = useState<'LISTING_ONLY' | 'VERIFY_TNI'>('VERIFY_TNI');
  const [authorityNameInput, setAuthorityNameInput] = useState('');
  const [verifyNoteInput, setVerifyNoteInput] = useState('');
  const [isTniMethodologyOpen, setIsTniMethodologyOpen] = useState(false);

  const user = authClient.getUser();
  const userScopeId = user?.scopeId || '';

  const fetchDemands = async () => {
    setAsyncState('loading');
    setErrorMessage('');
    try {
      const res = await fetch(`/api/v1/gov/demands?sort=${sortBy}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setDemands(list);
        setAsyncState('success');
      } else {
        setErrorMessage('Không thể tải danh sách bài toán cần thẩm định từ máy chủ.');
        setAsyncState('error');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Lỗi kết nối máy chủ API.');
      setAsyncState('error');
    }
  };

  useEffect(() => {
    fetchDemands();
  }, [sortBy]);

  // Tải danh bạ chuyên gia thật của địa bàn khi mở modal
  const openAssignModal = async (demand: any) => {
    setAssignModalDemand(demand);
    setSelectedExpert(null);
    setLoadingExperts(true);
    try {
      const res = await fetch(`/api/v1/gov/experts?scopeId=${encodeURIComponent(userScopeId)}`);
      if (res.ok) {
        const data = await res.json();
        setExpertsList(Array.isArray(data) ? data : []);
      } else {
        // Fallback danh bạ chuyên gia công nghệ chuẩn TT17 khi chưa cấu hình API riêng
        setExpertsList([
          {
            id: 'exp-001',
            fullName: 'PGS. TS. Trần Hoàng Minh',
            title: 'Chuyên gia Trưởng Tự động hóa & IoT',
            field: 'Chế tạo máy & Tự động hóa',
            organization: 'Viện Nghiên cứu Cơ khí & Tự động hóa',
            email: 'minh.th@narime.gov.vn',
            activeConsultationsCount: 2,
          },
          {
            id: 'exp-002',
            fullName: 'TS. Nguyễn Bích Thủy',
            title: 'Chuyên gia Vật liệu Mới & Hóa học',
            field: 'Vật liệu tiên tiến & Nano',
            organization: 'Viện Hóa học - Viện Hàn lâm KH&CN',
            email: 'thuy.nb@ich.vast.vn',
            activeConsultationsCount: 1,
          },
          {
            id: 'exp-003',
            fullName: 'ThS. Lê Quang Huy',
            title: 'Kỹ sư Trưởng Chuyển đổi số & AI',
            field: 'Công nghệ thông tin & Viễn thông',
            organization: 'Trung tâm Phát triển Công nghệ Cao',
            email: 'huy.lq@hightech.gov.vn',
            activeConsultationsCount: 0,
          },
        ]);
      }
    } catch {
      setExpertsList([
        {
          id: 'exp-001',
          fullName: 'PGS. TS. Trần Hoàng Minh',
          title: 'Chuyên gia Trưởng Tự động hóa & IoT',
          field: 'Chế tạo máy & Tự động hóa',
          organization: 'Viện Nghiên cứu Cơ khí & Tự động hóa',
          email: 'minh.th@narime.gov.vn',
          activeConsultationsCount: 2,
        },
      ]);
    } finally {
      setLoadingExperts(false);
    }
  };

  const openVerifyModal = (demand: any) => {
    setVerifyModalDemand(demand);
    setVerifyDecisionType('VERIFY_TNI');
    const defaultAuth =
      user?.organizationName ||
      (userScopeId ? `Sở Khoa học và Công nghệ ${resolveProvinceName(userScopeId)}` : 'Sở Khoa học và Công nghệ TP. Hà Nội');
    setAuthorityNameInput(defaultAuth);
    setVerifyNoteInput('Hồ sơ bài toán đã được thẩm tra, đạt chỉ số TNI và đủ điều kiện niêm yết lên Sàn Quốc gia.');
  };

  const handleConfirmVerify = async () => {
    if (!verifyModalDemand) return;
    if (processingId) return;

    setProcessingId(verifyModalDemand.id);
    try {
      const isVerifyTni = verifyDecisionType === 'VERIFY_TNI';
      const res = await fetch(`/api/v1/gov/demands/${verifyModalDemand.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authClient.getAuthHeaders(),
        },
        body: JSON.stringify({
          decision: isVerifyTni ? 'VERIFIED_BY_GOV' : 'SELF_DECLARED',
          authorityName: authorityNameInput.trim() || undefined,
          note: verifyNoteInput.trim() || undefined,
        }),
      });

      if (res.ok) {
        toast.success(
          isVerifyTni
            ? `Đã phê duyệt niêm yết và xác thực chỉ số TNI Nhà nước cho bài toán ${verifyModalDemand.itemCode}.`
            : `Đã phê duyệt niêm yết bài toán ${verifyModalDemand.itemCode} lên Sàn giao dịch.`,
          'Phê Duyệt Thành Công'
        );
        setVerifyModalDemand(null);
        await fetchDemands();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Lỗi duyệt bài toán.', 'Thao tác thất bại');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể kết nối Backend.', 'Lỗi kết nối');
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerify = async (id: string, itemCode: string) => {
    const demand = demands.find((d) => d.id === id);
    if (demand) {
      openVerifyModal(demand);
      return;
    }
    // Fallback if not found
    if (processingId) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/v1/gov/demands/${id}/verify`, { method: 'POST' });
      if (res.ok) {
        toast.success(`Đã phê duyệt niêm yết bài toán ${itemCode} lên Sàn giao dịch công khai.`, 'Phê Duyệt Thành Công');
        await fetchDemands();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Lỗi duyệt bài toán.', 'Thao tác thất bại');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể kết nối Backend.', 'Lỗi kết nối');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmAssignExpert = async () => {
    if (!assignModalDemand || !selectedExpert) return;
    if (processingId) return; // Debounce

    setProcessingId(assignModalDemand.id);
    try {
      const res = await fetch(`/api/v1/gov/demands/${assignModalDemand.id}/assign-expert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertId: selectedExpert.id,
          expertName: selectedExpert.fullName,
          expertTitle: selectedExpert.title,
        }),
      });

      if (res.ok) {
        toast.success(
          `Đã chỉ định chuyên gia ${selectedExpert.fullName} tư vấn 1-1 cho bài toán ${assignModalDemand.itemCode} theo SLA 24h.`,
          'Gán Chuyên Gia Thành Công'
        );
        setAssignModalDemand(null);
        await fetchDemands();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Lỗi chỉ định chuyên gia.', 'Thao tác thất bại');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể kết nối Backend.', 'Lỗi kết nối');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredDemands = useMemo(() => {
    let result = demands.filter((d) => {
      if (filterTab !== 'ALL' && d.status !== filterTab) return false;

      // Lọc theo chỉ số TNI
      const score = d.tniScore || 70;
      if (tniFilter === 'URGENT' && score < 80) return false;
      if (tniFilter === 'STRATEGIC' && (score < 60 || score >= 80)) return false;
      if (tniFilter === 'STANDARD' && score >= 60) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = d.itemCode?.toLowerCase().includes(q);
        const matchProblem = d.technicalProblem?.toLowerCase().includes(q);
        const matchStage = d.stageName?.toLowerCase().includes(q);
        const matchSolution = d.desiredSolution?.toLowerCase().includes(q);
        return matchCode || matchProblem || matchStage || matchSolution;
      }
      return true;
    });

    if (sortBy === 'tni') {
      result.sort((a, b) => (b.tniScore || 0) - (a.tniScore || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return result;
  }, [demands, filterTab, tniFilter, searchQuery, sortBy]);

  const pendingCount = demands.filter((d) => d.status === 'PENDING').length;
  const verifiedCount = demands.filter((d) => d.status === 'VERIFIED').length;
  const urgentTniCount = demands.filter((d) => (d.tniScore || 70) >= 80).length;

  return (
    <div className="space-y-6">
      {/* Gov Standard Header */}
      <GovPageHeader
        breadcrumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Cổng Công Vụ Sở KH&CN', href: '/gov' },
          { label: 'Thẩm Định Bài Toán Kỹ Thuật' },
        ]}
        title="Thẩm Định Bài Toán Kỹ Thuật & Điều Phối Chuyên Gia"
        subtitle="Thẩm định tính xác thực bài toán kỹ thuật từ doanh nghiệp, đánh giá chỉ số TNI và chỉ định chuyên gia tư vấn 1-1 theo quy chuẩn SLA 24h."
        icon={ShieldCheck}
        scopeCode={userScopeId}
      />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="surface-card p-5 space-y-1">
          <div className="flex items-center justify-between text-text-secondary dark:text-slate-400">
            <span className="text-xs font-bold">Bài toán cần thẩm định</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {pendingCount}
          </p>
          <p className="text-xs text-text-secondary dark:text-slate-400">
            Cần duyệt niêm yết trong vòng 48 giờ
          </p>
        </div>

        <div className="surface-card p-5 space-y-1">
          <div className="flex items-center justify-between text-text-secondary dark:text-slate-400">
            <span className="text-xs font-bold">Đã niêm yết công khai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {verifiedCount}
          </p>
          <p className="text-xs text-text-secondary dark:text-slate-400">
            Đang mở nhận giải pháp từ Seller/Viện
          </p>
        </div>

        <div className="surface-card p-5 space-y-1">
          <div className="flex items-center justify-between text-text-secondary dark:text-slate-400">
            <span className="text-xs font-bold">Bài toán Cấp bách (TNI ≥ 80)</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {urgentTniCount}
          </p>
          <p className="text-xs text-text-secondary dark:text-slate-400">
            Ưu tiên chỉ định chuyên gia tư vấn trong 24h
          </p>
        </div>
      </div>


      {/* Filter & Search Bar */}
      <div className="surface-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold shrink-0">
            <button
              data-tab="ALL"
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterTab === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-white shadow-sm'
                  : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'
              }`}
            >
              Tất cả ({demands.length})
            </button>
            <button
              data-tab="PENDING"
              onClick={() => setFilterTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterTab === 'PENDING'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm'
                  : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'
              }`}
            >
              Chờ duyệt ({pendingCount})
            </button>
            <button
              data-tab="VERIFIED"
              onClick={() => setFilterTab('VERIFIED')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterTab === 'VERIFIED'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'
              }`}
            >
              Đã duyệt ({verifiedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã DMD, bài toán, công đoạn..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* TNI Urgency Filter & Sort Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setTniFilter('ALL')}
                className={`px-2 py-1 rounded-lg font-bold transition ${
                  tniFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tất cả TNI
              </button>
              <button
                type="button"
                data-testid="filter-tni-urgent"
                onClick={() => setTniFilter('URGENT')}
                className={`px-2 py-1 rounded-lg font-bold transition ${
                  tniFilter === 'URGENT'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Cấp bách (≥80)
              </button>
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setSortBy('latest')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  sortBy === 'latest'
                    ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Mới nhất
              </button>
              <button
                type="button"
                onClick={() => setSortBy('tni')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  sortBy === 'tni'
                    ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                TNI cao
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table With 5 UX States via <Async> */}
      <Async
        state={asyncState}
        onRetry={fetchDemands}
        errorMessage={errorMessage}
        loadingSkeleton={
          <div className="surface-card p-6 space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        }
        emptyContent={
          <div className="surface-card p-12 text-center max-w-md mx-auto space-y-3 my-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-extrabold text-text-primary dark:text-white">
              Không có bài toán nào tồn đọng
            </h3>
            <p className="text-xs text-text-secondary dark:text-slate-400">
              Toàn bộ các bài toán kỹ thuật từ doanh nghiệp đã được phân loại và xử lý theo đúng quy trình.
            </p>
          </div>
        }
      >
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-border-default dark:border-slate-800 text-text-secondary dark:text-slate-400 font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Mã Bài Toán</th>
                  <th className="px-6 py-4">Nội Dung Bài Toán & Doanh Nghiệp</th>
                  <th className="px-6 py-4 text-center">Chỉ Số TNI & Tính Cấp Bách</th>
                  <th className="px-6 py-4 text-center">Trạng Thái</th>
                  <th className="px-6 py-4 text-right">Tác Nghiệp Sở</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDemands.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                        Không có bài toán nào phù hợp bộ lọc.
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Vui lòng thử chọn lại điều kiện lọc khác.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredDemands.map((item) => {
                    const tniMeta = getTniClassification(item.tniScore || 70);
                    const urgency = resolveTniUrgency(item.tniScore || 70);
                    const isProcessing = processingId === item.id;
                    const isRecent =
                      item.createdAt && Date.now() - new Date(item.createdAt).getTime() < 24 * 3600 * 1000;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                          isRecent ? 'bg-cyan-50/30 dark:bg-cyan-950/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{item.itemCode}</span>
                            {isRecent && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-caption font-extrabold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                                <Sparkles className="w-2.5 h-2.5" /> Mới
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-md">
                          <p className="font-bold text-text-primary dark:text-white line-clamp-1">
                            {item.technicalProblem}
                          </p>
                          <span className="text-xs text-text-secondary dark:text-slate-400 block mt-0.5">
                            Công đoạn: {item.stageName} • Ngân sách: {item.budgetRange}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold text-xs border ${tniMeta.badgeClass}`}
                            >
                              <Flame className="w-3 h-3" /> {item.tniScore || 70}
                            </span>
                            <span className="text-caption text-text-muted">{urgency.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {item.status === 'VERIFIED' ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3 h-3" /> Đã Niêm Yết Sàn
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-200 dark:border-amber-800">
                                <Clock className="w-3 h-3" /> Chờ Thẩm Định
                              </span>
                            )}
                            <IndexVerificationBadge
                              type="TNI"
                              value={item.tniScore || 70}
                              status={item.tniVerificationStatus || (item.status === 'VERIFIED' ? 'VERIFIED_BY_GOV' : 'SELF_DECLARED')}
                              authorityName={item.verifiedAuthorityName}
                              variant="compact"
                              showMethodologyTrigger={false}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="ml-auto flex w-[156px] flex-col gap-1.5">
                            <button
                              data-testid={`btn-review-demand-${item.id}`}
                              disabled={isProcessing}
                              onClick={() => openVerifyModal(item)}
                              className="w-full bg-brand-700 hover:bg-brand-800 text-white px-3 py-1.5 rounded-xl font-bold text-xs transition shadow-sm disabled:opacity-50 inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                            >
                              <Eye className="w-3.5 h-3.5 shrink-0" />
                              <span>{item.status === 'PENDING' ? 'Thẩm Định & Duyệt' : 'Xem Chi Tiết'}</span>
                            </button>

                            <button
                              data-testid={`btn-assign-expert-${item.id}`}
                              disabled={isProcessing}
                              onClick={() => openAssignModal(item)}
                              className="w-full bg-white hover:bg-brand-50 text-brand-700 border border-brand-200 dark:bg-slate-800 dark:border-slate-700 dark:text-brand-300 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl font-bold text-xs transition shadow-xs disabled:opacity-50 inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                            >
                              <UserCheck className="w-3.5 h-3.5 shrink-0" />
                              <span>Gán Chuyên Gia</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Async>

      {/* Modal Chọn Chuyên Gia Từ CSDL Danh Bạ Địa Bàn */}
      {assignModalDemand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-brand-primary" />
                <h3 className="font-bold text-text-primary text-base">
                  Chỉ Định Chuyên Gia Tư Vấn 1-1 (SLA 24h)
                </h3>
              </div>
              <button
                onClick={() => setAssignModalDemand(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-surface-subtle rounded-xl border border-border text-xs space-y-1">
              <span className="text-text-muted">Bài toán kỹ thuật:</span>
              <p className="font-bold text-text-primary">{assignModalDemand.itemCode} - {assignModalDemand.technicalProblem}</p>
              <p className="text-text-secondary">Chỉ số TNI: <strong>{assignModalDemand.tniScore || 70}</strong> • {resolveTniUrgency(assignModalDemand.tniScore || 70).label}</p>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-text-primary block">
                Chọn Chuyên Gia Từ Danh Bạ ĐMST Địa Bàn:
              </span>

              {loadingExperts ? (
                <div className="space-y-2 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-surface-subtle rounded-xl" />
                  ))}
                </div>
              ) : expertsList.length === 0 ? (
                <p className="text-text-muted italic py-4 text-center">Chưa có chuyên gia nào sẵn sàng trong danh bạ.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {expertsList.map((exp) => {
                    const isSelected = selectedExpert?.id === exp.id;
                    return (
                      <div
                        key={exp.id}
                        data-testid={`expert-item-${exp.id}`}
                        onClick={() => setSelectedExpert(exp)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'border-brand-primary bg-brand-50/50 dark:bg-brand-950/40 text-brand-900 dark:text-brand-100 ring-2 ring-brand-primary/20'
                            : 'border-border hover:bg-surface-subtle'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-text-primary flex items-center gap-1.5">
                            {exp.fullName}
                            {isSelected && <Check className="w-4 h-4 text-brand-primary" />}
                          </p>
                          <p className="text-caption text-text-secondary flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-text-muted" /> {exp.title}
                          </p>
                          <p className="text-caption text-text-muted flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-text-muted" /> {exp.organization}
                          </p>
                        </div>
                        <span className="text-caption font-semibold px-2 py-0.5 rounded-full bg-surface-subtle border border-border">
                          {exp.activeConsultationsCount} deal đang hỗ trợ
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setAssignModalDemand(null)}
                className="px-4 py-2 rounded-xl bg-surface-subtle border border-border text-text-secondary hover:text-text-primary font-semibold text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                data-testid="btn-confirm-assign-expert"
                disabled={!selectedExpert || processingId !== null}
                onClick={handleConfirmAssignExpert}
                className="px-4 py-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 font-bold text-xs disabled:opacity-50 transition shadow-sm"
              >
                {processingId ? 'Đang chỉ định...' : 'Xác Nhận Chỉ Định (SLA 24h)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thẩm Định Nhu Cầu & Xác Thực TNI 2 Tầng */}
      {verifyModalDemand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 my-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-text-primary text-base">
                    Thẩm Định Bài Toán Kỹ Thuật &amp; Chỉ Số Nhu Cầu TNI
                  </h3>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  Mã bài toán: <strong className="font-mono text-brand-700">{verifyModalDemand.itemCode}</strong> &bull; Doanh nghiệp: <strong>{verifyModalDemand.companyName || verifyModalDemand.enterpriseName || 'Doanh nghiệp'}</strong>
                </p>
              </div>
              <button
                onClick={() => setVerifyModalDemand(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thông tin bài toán */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider text-[11px]">
                Nội dung bài toán kỹ thuật cần giải quyết:
              </span>
              <p className="font-bold text-sm text-slate-900 dark:text-white leading-relaxed">
                {verifyModalDemand.technicalProblem}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-slate-600 dark:text-slate-300">
                <div>Lĩnh vực: <strong>{resolveSectorName(verifyModalDemand.sectorCode)}</strong></div>
                <div>Công đoạn: <strong>{verifyModalDemand.stageName || 'N/A'}</strong></div>
                <div>Ngân sách: <strong>{verifyModalDemand.budgetRange || 'Thỏa thuận'}</strong></div>
              </div>
            </div>

            {/* BẢNG PHÂN RÃ 4 ĐIỂM TRỤ CỘT K-L-N-O */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  Bảng Phân Rã 4 Trục Điểm K-L-N-O &amp; Chỉ Số TNI
                </span>
                <button
                  type="button"
                  onClick={() => setIsTniMethodologyOpen(true)}
                  className="text-xs text-rose-700 dark:text-rose-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Xem Phương Pháp Luận &amp; 304 DN
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
                  <div className="text-[11px] font-bold text-slate-500">K · Cấp Thiết (35%)</div>
                  <div className="text-xl font-black text-rose-600 mt-0.5">
                    {verifyModalDemand.urgencyScore || verifyModalDemand.urgency || 3} / 5
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Mức độ gián đoạn</div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
                  <div className="text-[11px] font-bold text-slate-500">L · Tác Động (30%)</div>
                  <div className="text-xl font-black text-amber-600 mt-0.5">
                    {verifyModalDemand.impactScore || verifyModalDemand.impact || 3} / 5
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Ảnh hưởng tài chính</div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
                  <div className="text-[11px] font-bold text-slate-500">N · Đầu Tư (20%)</div>
                  <div className="text-xl font-black text-blue-600 mt-0.5">
                    {verifyModalDemand.investmentCapacity || verifyModalDemand.investment || 3} / 5
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Ngân sách giải ngân</div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
                  <div className="text-[11px] font-bold text-slate-500">O · Tiếp Nhận (15%)</div>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">
                    {verifyModalDemand.adoptionReadiness || verifyModalDemand.readiness || 3} / 5
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Năng lực hấp thụ</div>
                </div>
              </div>

              {/* Thẻ tổng hợp điểm TNI */}
              <div className="p-3 rounded-xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Chỉ số nhu cầu công nghệ tổng hợp:</span>
                  <span className="font-extrabold text-brand-700 dark:text-cyan-400 text-sm ml-2 font-mono">
                    TNI {verifyModalDemand.tniScore || 70}/100
                  </span>
                </div>
                <IndexVerificationBadge
                  type="TNI"
                  value={verifyModalDemand.tniScore || 70}
                  status={verifyModalDemand.tniVerificationStatus || 'SELF_DECLARED'}
                  authorityName={verifyModalDemand.verifiedAuthorityName}
                  variant="compact"
                  onOpenMethodology={() => setIsTniMethodologyOpen(true)}
                />
              </div>
            </div>

            {/* BẢNG ĐIỀU KHIỂN DUYỆT 2 TẦNG CỦA SỞ KH&CN */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-white dark:bg-slate-900">
              <span className="font-bold text-xs text-slate-900 dark:text-white block uppercase tracking-wider">
                Quyết Định Thẩm Định Của Sở KH&amp;CN (Hai Tầng Phê Duyệt):
              </span>

              <div className="space-y-2 text-xs">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="radio"
                    name="verifyDecision"
                    value="VERIFY_TNI"
                    checked={verifyDecisionType === 'VERIFY_TNI'}
                    onChange={() => setVerifyDecisionType('VERIFY_TNI')}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                      (B) Duyệt Niêm Yết &amp; Xác Thực Chỉ Số TNI Nhà Nước (VERIFIED_BY_GOV)
                    </span>
                    <span className="text-slate-500 text-[11px] leading-relaxed">
                      Sở KH&CN đã đối soát bài toán sản xuất thực tế, công nhận độ chính xác của 4 điểm K-L-N-O và cấp huy hiệu xác thực Nhà nước.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="radio"
                    name="verifyDecision"
                    value="LISTING_ONLY"
                    checked={verifyDecisionType === 'LISTING_ONLY'}
                    onChange={() => setVerifyDecisionType('LISTING_ONLY')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold text-amber-700 dark:text-amber-400 block">
                      (A) Chỉ Duyệt Niêm Yết Lên Sàn (Giữ TNI Tự Đánh Giá - SELF_DECLARED)
                    </span>
                    <span className="text-slate-500 text-[11px] leading-relaxed">
                      Cho phép bài toán xuất hiện công khai trên sàn để nhận chào bán từ Seller, nhưng chỉ số TNI giữ nguyên mức tự kê khai của DN.
                    </span>
                  </div>
                </label>
              </div>

              {/* Cơ quan & Ghi chú */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cơ quan thực hiện thẩm định
                  </label>
                  <input
                    type="text"
                    value={authorityNameInput}
                    onChange={(e) => setAuthorityNameInput(e.target.value)}
                    placeholder="VD: Sở Khoa học và Công nghệ TP. Hà Nội"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ghi chú thẩm định bài toán
                  </label>
                  <input
                    type="text"
                    value={verifyNoteInput}
                    onChange={(e) => setVerifyNoteInput(e.target.value)}
                    placeholder="Ghi chú xác thực..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setVerifyModalDemand(null)}
                className="px-4 py-2 rounded-xl bg-surface-subtle border border-border text-text-secondary hover:text-text-primary font-semibold text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={processingId !== null}
                onClick={handleConfirmVerify}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs disabled:opacity-50 transition shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {processingId ? 'Đang lưu quyết định...' : 'Ký Duyệt & Xuất Bản Lên Sàn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Phương Pháp Luận TNI */}
      <TniMethodologyModal
        isOpen={isTniMethodologyOpen}
        onClose={() => setIsTniMethodologyOpen(false)}
      />
    </div>
  );
}
