'use client';

import React, { useState, useEffect } from 'react';
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
  FileQuestion
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
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchDemands = async () => {
    setAsyncState('loading');
    setErrorMessage('');
    try {
      const res = await fetch('/api/v1/gov/demands');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setDemands(list);
        if (list.length === 0) {
          setAsyncState('empty');
        } else {
          setAsyncState('success');
        }
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
  }, []);

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

  const filteredDemands = demands.filter((d) => {
    if (filterTab === 'ALL') return true;
    return d.status === filterTab;
  });

  const pendingCount = demands.filter(d => d.status === 'PENDING').length;
  const verifiedCount = demands.filter(d => d.status === 'VERIFIED').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-20">
      {/* GOV CONSOLE SUB-HEADER */}
      <section className="bg-slate-900 text-white border-b border-slate-800 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

        {/* FILTER TABS */}
        <div className="surface-card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterTab === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-white shadow-sm'
                  : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'
              }`}
            >
              Tất cả hồ sơ ({demands.length})
            </button>
            <button
              onClick={() => setFilterTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterTab === 'PENDING'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm'
                  : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'
              }`}
            >
              Chờ thẩm định ({pendingCount})
            </button>
            <button
              onClick={() => setFilterTab('VERIFIED')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterTab === 'VERIFIED'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'
              }`}
            >
              Đã niêm yết ({verifiedCount})
            </button>
          </div>

          <div className="text-xs text-text-secondary dark:text-slate-400">
            Hiển thị <strong>{filteredDemands.length}</strong> bài toán thuộc thẩm quyền quản lý
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
                  {filteredDemands.map((item) => {
                    const tniMeta = getTniClassification(item.tniScore || 70);
                    const isProcessing = processingId === item.id;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition"
                      >
                        <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {item.itemCode}
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
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Async>
      </main>
    </div>
  );
}
