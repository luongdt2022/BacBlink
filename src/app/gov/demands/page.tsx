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
  ExternalLink,
  AlertCircle,
  Building2,
  FileQuestion,
  Search,
  X,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { Async, AsyncState } from '@/components/ui/async';
import { useToast } from '@/components/common/toast';
import { getTniClassification } from '@/components/demand/TniRealtimeCalculator';

export default function GovDemandsPage() {
  const toast = useToast();
  const [demands, setDemands] = useState<any[]>([]);
  const [asyncState, setAsyncState] = useState<AsyncState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'VERIFIED'>('ALL');
  const [sortBy, setSortBy] = useState<'latest' | 'tni'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

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
        setErrorMessage('Không thể tải danh sách bài toán cần thẩm định.');
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

  const handleVerify = async (id: string, itemCode: string) => {
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

  const handleAssignExpert = async (id: string, itemCode: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/v1/gov/demands/${id}/assign-expert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expertId: '01a125a3-19cc-7e39-92c4-4bda036e8583' })
      });
      if (res.ok) {
        toast.success(`Đã chỉ định chuyên gia tư vấn 1-1 cho bài toán ${itemCode} theo SLA 24h.`, 'Gán Chuyên Gia');
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
  }, [demands, filterTab, searchQuery, sortBy]);

  const pendingCount = demands.filter(d => d.status === 'PENDING').length;
  const verifiedCount = demands.filter(d => d.status === 'VERIFIED').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-20">
      {/* GOV CONSOLE SUB-HEADER */}
      <section className="relative overflow-hidden bg-brand-700 text-white border-b border-brand-800 py-6 px-4 sm:px-6 shadow-md">
        <div aria-hidden="true" className="innovation-hero-art pointer-events-none absolute inset-0" />
        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center font-extrabold text-xl text-white shadow-md">
              Sở
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold tracking-tight text-xl">
                  Cổng Tác Nghiệp Quản Lý Nhà Nước (Sở KH&CN)
                </h1>
                <span className="bg-brand-500/20 text-brand-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-brand-400/30">
                  GOV CONSOLE • TASK-03
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Thẩm định tính xác thực bài toán kỹ thuật của doanh nghiệp, tính toán TNI và điều phối chuyên gia tư vấn.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Đơn vị quản lý:</span>
            <span className="font-bold text-white bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              Sở Khoa học & Công nghệ Hà Nội
            </span>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* KPI OVERVIEW CARDS */}
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
              <span className="text-xs font-bold">Mạng lưới Chuyên gia sẵn sàng</span>
              <UserCheck className="w-4 h-4 text-brand-500" />
            </div>
            <p className="text-2xl font-extrabold text-brand-700 dark:text-brand-400">
              512
            </p>
            <p className="text-xs text-text-secondary dark:text-slate-400">
              Theo danh bạ KH&CN chuẩn TT17
            </p>
          </div>
        </div>

        {/* FILTER & SEARCH BAR */}
        <div className="surface-card p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Filter Tabs */}
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
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
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

            {/* Sort Switcher */}
            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary dark:text-slate-400 shrink-0">
              <span className="text-[11px] shrink-0">Sắp xếp:</span>
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setSortBy('latest')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition ${
                    sortBy === 'latest'
                      ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Mới gửi nhất
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('tni')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition ${
                    sortBy === 'tni'
                      ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Điểm TNI cao nhất
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs text-text-secondary dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>
              Hiển thị <strong>{filteredDemands.length}</strong> bài toán {searchQuery ? `khớp với từ khóa "${searchQuery}"` : 'thuộc thẩm quyền quản lý'}
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-brand-600 dark:text-brand-400 hover:underline font-medium text-[11px]"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            )}
          </div>
        </div>

        {/* TABLE WITH 5 UX STATES */}
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
                    <th className="px-6 py-4 text-center">Chỉ Số TNI</th>
                    <th className="px-6 py-4 text-center">Trạng Thái</th>
                    <th className="px-6 py-4 text-right">Tác Nghiệp Sở</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDemands.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Không có bài toán nào tồn đọng trong danh sách.</p>
                        <p className="text-xs text-slate-400 mt-1">Toàn bộ các bài toán kỹ thuật từ doanh nghiệp đã được phân loại và xử lý.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDemands.map((item) => {
                    const tniMeta = getTniClassification(item.tniScore || 70);
                    const isProcessing = processingId === item.id;
                    const isRecent = item.createdAt && (Date.now() - new Date(item.createdAt).getTime() < 24 * 3600 * 1000);

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                          isRecent ? 'bg-brand-50/30 dark:bg-brand-950/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{item.itemCode}</span>
                            {isRecent && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-extrabold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-cyan-300 border border-brand-200 dark:border-brand-800">
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
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold text-xs border ${tniMeta.badgeClass}`}
                          >
                            <Flame className="w-3 h-3" /> {item.tniScore || 70}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.status === 'VERIFIED' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Đã Niêm Yết Sàn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-200 dark:border-amber-800">
                              <Clock className="w-3 h-3" /> Chờ Thẩm Định
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {item.status === 'PENDING' && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleVerify(item.id, item.itemCode)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs transition shadow-sm disabled:opacity-50"
                            >
                              {isProcessing ? 'Đang duyệt...' : 'Phê Duyệt Niêm Yết'}
                            </button>
                          )}

                          <button
                            disabled={isProcessing}
                            onClick={() => handleAssignExpert(item.id, item.itemCode)}
                            className="bg-brand-700 hover:bg-brand-800 text-white px-3 py-1.5 rounded-xl font-bold text-xs transition shadow-sm disabled:opacity-50"
                          >
                            {isProcessing ? 'Đang gán...' : 'Gán Chuyên Gia'}
                          </button>
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
      </main>
    </div>
  );
}
