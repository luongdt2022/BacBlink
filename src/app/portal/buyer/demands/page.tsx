'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileQuestion,
  Flame,
  Sparkles,
  Award,
  PlusCircle,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Search,
  ExternalLink,
  Edit,
  Archive,
  XCircle
} from 'lucide-react';
import { Async, AsyncState } from '@/components/ui/async';
import QuickDemandModal from '@/components/demand/QuickDemandModal';
import EditDemandModal from '@/components/demand/EditDemandModal';
import { ConfirmModal } from '@/components/common/confirm-modal';
import { useToast } from '@/components/common/toast';
import { authClient } from '@/lib/auth-client';
import { getTniClassification } from '@/components/demand/TniRealtimeCalculator';

interface DemandItem {
  id?: string;
  itemCode: string;
  stageName: string;
  technicalProblem: string;
  desiredSolution?: string;
  needConsulting?: boolean;
  expectedGoal?: string;
  applicationScale?: string;
  sectorCode: string;
  techGroupCode?: string;
  demandTypeCode?: string;
  budgetRange: string;
  urgencyScore?: number;
  impactScore?: number;
  investmentCapacity?: number;
  adoptionReadiness?: number;
  tniScore: number;
  tniClassification: string;
  matchingCount?: number;
  status: string;
}

export default function BuyerDemandsPage() {
  const toast = useToast();
  const [demands, setDemands] = useState<DemandItem[]>([]);
  const [asyncState, setAsyncState] = useState<AsyncState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDemand, setEditingDemand] = useState<DemandItem | null>(null);
  const [closingDemandId, setClosingDemandId] = useState<string | null>(null);
  const [isClosingSubmitting, setIsClosingSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchDemands = async () => {
    setAsyncState('loading');
    setErrorMessage('');
    try {
      const res = await fetch('/api/v1/buyer/demands');
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
        setErrorMessage('Không thể tải danh sách bài toán của doanh nghiệp.');
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

  const handleCreateSuccess = (newItem: any) => {
    setDemands((prev) => [newItem, ...prev]);
    setAsyncState('success');
  };

  const handleEditSuccess = (updatedItem: any) => {
    setDemands((prev) =>
      prev.map((d) => (d.id === updatedItem.id ? { ...d, ...updatedItem } : d))
    );
  };

  const handleCloseConfirm = async () => {
    if (!closingDemandId) return;
    setIsClosingSubmitting(true);
    try {
      const token = authClient.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/v1/buyer/demands/${closingDemandId}/close`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        setDemands((prev) =>
          prev.map((d) => (d.id === closingDemandId ? { ...d, status: 'CLOSED' } : d))
        );
        toast.success('Đã đóng bài toán kỹ thuật thành công.', 'Thông báo');
      } else {
        toast.error('Không thể đóng bài toán kỹ thuật.', 'Lỗi');
      }
    } catch {
      toast.error('Lỗi kết nối khi đóng bài toán.', 'Lỗi');
    } finally {
      setIsClosingSubmitting(false);
      setClosingDemandId(null);
    }
  };

  const filteredList = demands.filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  const verifiedCount = demands.filter(d => d.status === 'VERIFIED').length;
  const pendingCount = demands.filter(d => d.status === 'PENDING').length;
  const closedCount = demands.filter(d => d.status === 'CLOSED').length;
  const avgTni = demands.length > 0
    ? Math.round(demands.reduce((sum, d) => sum + (d.tniScore || 70), 0) / demands.length)
    : 80;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-20">
      {/* WORKSPACE SUB-HEADER (Chuẩn theo Wireframe Basic Design) */}
      <section className="bg-white dark:bg-slate-900 border-b border-border-default dark:border-slate-800 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold tracking-tight text-text-primary dark:text-white text-xl">
                  Bàn Làm Việc Doanh Nghiệp (Buyer Workspace)
                </h1>
                <span className="rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 text-xs font-bold px-2.5 py-0.5 border border-brand-200 dark:border-brand-800">
                  TASK-03
                </span>
              </div>
              <p className="text-xs text-text-secondary dark:text-slate-400 mt-0.5">
                Quản lý các bài toán kỹ thuật, chỉ số cấp thiết TNI và theo dõi nguồn cung công nghệ ghép nối.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/khao-sat-nhu-cau"
              className="border border-brand-200 dark:border-slate-700 hover:bg-brand-50 dark:hover:bg-slate-800 text-brand-700 dark:text-cyan-400 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <ClipboardCheck className="w-4 h-4" /> Khảo Sát Nhu Cầu (TNI)
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-700 hover:bg-brand-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> Đăng Bài Toán Mới
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* KPI SUMMARY CARDS (Đối soát 100% wireframe Basic Design) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="surface-card p-5 space-y-1">
            <div className="flex items-center justify-between text-text-secondary dark:text-slate-400">
              <span className="text-xs font-bold">Tổng bài toán đã đăng</span>
              <FileQuestion className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
            </div>
            <p className="text-2xl font-extrabold text-text-primary dark:text-white">
              {demands.length}
            </p>
            <p className="text-xs text-text-secondary dark:text-slate-400">
              {verifiedCount} bài toán đã duyệt niêm yết
            </p>
          </div>

          <div className="surface-card p-5 space-y-1">
            <div className="flex items-center justify-between text-text-secondary dark:text-slate-400">
              <span className="text-xs font-bold">Điểm TNI trung bình</span>
              <Flame className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              {avgTni}
            </p>
            <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold">
              Mức Rất Cao (Ưu tiên P0)
            </p>
          </div>

          <div className="surface-card p-5 space-y-1">
            <div className="flex items-center justify-between text-text-secondary dark:text-slate-400">
              <span className="text-xs font-bold">Nguồn cung tiềm năng</span>
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              14
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
              Tự động gợi ý từ Radar
            </p>
          </div>

          <div className="surface-card p-5 space-y-1">
            <div className="flex items-center justify-between text-text-secondary dark:text-slate-400">
              <span className="text-xs font-bold">Chuyên gia Sở KH&CN</span>
              <Award className="w-4 h-4 text-brand-500" />
            </div>
            <p className="text-2xl font-extrabold text-brand-700 dark:text-brand-400">
              1
            </p>
            <p className="text-xs text-brand-600 dark:text-brand-300 font-semibold">
              Đã gán tư vấn 1-1
            </p>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="surface-card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-white shadow-sm'
                  : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'
              }`}
            >
              Tất cả ({demands.length})
            </button>
            <button
              onClick={() => setFilterStatus('VERIFIED')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === 'VERIFIED'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'
              }`}
            >
              Đang mở tìm cung ({verifiedCount})
            </button>
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === 'PENDING'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm'
                  : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'
              }`}
            >
              Chờ thẩm định ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('CLOSED')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === 'CLOSED'
                  ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm'
                  : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'
              }`}
            >
              Đã đóng ({closedCount})
            </button>
          </div>

          <div className="text-xs text-text-secondary dark:text-slate-400">
            Hiển thị <strong>{filteredList.length}</strong> bài toán kỹ thuật
          </div>
        </div>

        {/* TABLE LIST WITH ASYNC 5 UX STATES */}
        <Async
          state={asyncState}
          onRetry={fetchDemands}
          errorMessage={errorMessage}
          loadingSkeleton={
            <div className="surface-card p-6 space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              ))}
            </div>
          }
          emptyContent={
            <div className="surface-card p-12 text-center max-w-md mx-auto space-y-4 my-6">
              <div className="w-14 h-14 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 rounded-2xl flex items-center justify-center mx-auto">
                <FileQuestion className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-text-primary dark:text-white">
                Chưa có bài toán kỹ thuật nào
              </h3>
              <p className="text-xs text-text-secondary dark:text-slate-400">
                Doanh nghiệp có thể bắt đầu bằng việc kê khai phiếu khảo sát hoặc đăng nhanh bài toán mới.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-brand-700 hover:bg-brand-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Đăng Bài Toán Ngay
                </button>
              </div>
            </div>
          }
        >
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-border-default dark:border-slate-800 text-text-secondary dark:text-slate-400 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Mã Bài Toán</th>
                    <th className="px-6 py-4">Công Đoạn & Vấn Đề Kỹ Thuật</th>
                    <th className="px-6 py-4 text-center">Chỉ Số TNI</th>
                    <th className="px-6 py-4">Ngân Sách</th>
                    <th className="px-6 py-4 text-center">Trạng Thái</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredList.map((item) => {
                    const tniMeta = getTniClassification(item.tniScore || 70);
                    return (
                      <tr
                        key={item.itemCode}
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
                            Công đoạn: {item.stageName} • Lĩnh vực: {item.sectorCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold text-xs border ${tniMeta.badgeClass}`}
                          >
                            <Flame className="w-3 h-3" /> {item.tniScore || 75}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-text-primary dark:text-slate-300">
                          {item.budgetRange}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.status === 'VERIFIED' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Đang Mở Tìm Cung
                            </span>
                          ) : item.status === 'CLOSED' ? (
                            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-bold border border-slate-200 dark:border-slate-700">
                              <Archive className="w-3 h-3" /> Đã Đóng
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-200 dark:border-amber-800">
                              <Clock className="w-3 h-3" /> Chờ Thẩm Định
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <Link
                              href={item.id ? `/nhu-cau-cong-nghe/${item.id}` : '/nhu-cau-cong-nghe'}
                              className="inline-flex items-center gap-1 text-brand-700 dark:text-cyan-400 hover:underline font-bold text-xs"
                            >
                              Chi tiết <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            {item.status === 'PENDING' && (
                              <button
                                onClick={() => setEditingDemand(item)}
                                className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline font-bold text-xs"
                                title="Chỉnh sửa bài toán"
                              >
                                <Edit className="w-3.5 h-3.5" /> Sửa
                              </button>
                            )}

                            {item.status !== 'CLOSED' && (
                              <button
                                onClick={() => setClosingDemandId(item.id || null)}
                                className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-bold text-xs"
                                title="Đóng bài toán"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Đóng
                              </button>
                            )}
                          </div>
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

      {/* QUICK DEMAND MODAL */}
      <QuickDemandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* EDIT DEMAND MODAL */}
      <EditDemandModal
        isOpen={Boolean(editingDemand)}
        demand={editingDemand}
        onClose={() => setEditingDemand(null)}
        onSuccess={handleEditSuccess}
      />

      {/* CONFIRM CLOSE MODAL */}
      <ConfirmModal
        isOpen={Boolean(closingDemandId)}
        title="Xác nhận đóng bài toán"
        message="Bạn có chắc chắn muốn đóng bài toán này? Bài toán sẽ được chuyển sang trạng thái Đã đóng và rút khỏi sàn nhu cầu công khai."
        confirmText="Đồng ý đóng"
        cancelText="Hủy bỏ"
        loading={isClosingSubmitting}
        variant="warning"
        onConfirm={handleCloseConfirm}
        onClose={() => setClosingDemandId(null)}
      />
    </div>
  );
}
