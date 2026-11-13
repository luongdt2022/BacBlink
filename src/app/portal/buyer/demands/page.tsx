'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  XCircle,
  Bookmark,
  ShoppingBag,
  Package,
  Eye,
  X,
  AlertTriangle,
  Handshake,
} from 'lucide-react';
import { Async, AsyncState } from '@/components/ui/async';
import QuickDemandModal from '@/components/demand/QuickDemandModal';
import EditDemandModal from '@/components/demand/EditDemandModal';
import OrderTrackingStepper from '@/components/demand/OrderTrackingStepper';
import { ConfirmModal } from '@/components/common/confirm-modal';
import { useToast } from '@/components/common/toast';
import { authClient } from '@/lib/auth-client';
import { getTniClassification } from '@/components/demand/TniRealtimeCalculator';
import { brokerageApi } from '@/services/api/brokerage';
import { IndexVerificationBadge } from '@/components/common/IndexVerificationBadge';

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
  tniVerificationStatus?: string;
  verifiedAuthorityName?: string;
  matchingCount?: number;
  status: string;
  isCommercialOrder?: boolean;
  createdAt?: string;
}

function isCommercialDemandItem(item: DemandItem): boolean {
  if (item.isCommercialOrder === true) return true;
  const solution = item.desiredSolution || '';
  if (solution.includes('[Đề xuất thương mại') || solution.includes('[Đơn hàng thương mại')) return true;
  const stage = (item.stageName || '').toLowerCase();
  const prob = (item.technicalProblem || '').toLowerCase();
  if (stage.includes('thương mại') || stage.includes('sản xuất & chuyển giao')) {
    if (prob.includes('đặt mua') || prob.includes('kết nối thương phẩm') || prob.includes('mua sắm')) {
      return true;
    }
  }
  return false;
}

interface ProductInfo {
  productName: string;
  offerCode?: string;
  offerId?: string;
  productHref: string;
  demandHref: string;
}

function resolveProductInfo(item: DemandItem): ProductInfo {
  const prob = item.technicalProblem || '';
  const sol = item.desiredSolution || '';

  // 1. Direct fields if provided
  const directOfferCode = (item as any).offerCode;
  const directOfferId = (item as any).offerId;

  // 2. Parse offer code from desiredSolution or technicalProblem
  let parsedCode = directOfferCode;
  if (!parsedCode && sol) {
    const codeMatch = sol.match(/(?:sản phẩm|công nghệ|hồ sơ)\s+([A-Za-z0-9_\-]+)\s*-\s*/i);
    if (codeMatch && codeMatch[1]) {
      parsedCode = codeMatch[1].trim();
    } else {
      const codeRegex = /\b(OFF(?:ER)?-\d+-[A-Za-z0-9_\-]+|TECH-[A-Za-z0-9_\-]+|SP-[A-Za-z0-9_\-]+)\b/i;
      const m = sol.match(codeRegex) || prob.match(codeRegex);
      if (m && m[1]) {
        parsedCode = m[1].trim();
      }
    }
  }

  // 3. Clean up product name
  let cleanName = prob;
  const matchProb = prob.match(
    /(?:kết nối thương phẩm|thương phẩm|đặt mua|ứng dụng \/\s*chuyển giao|chuyển giao):\s*(.+)$/i
  );
  if (matchProb && matchProb[1]) {
    cleanName = matchProb[1].trim();
  } else {
    cleanName = prob.replace(/^\[DN:[^\]]+\]\s*/i, '').trim();
  }

  // 4. Construct productHref
  const targetIdOrCode = directOfferId || parsedCode;
  let productHref = '';
  if (targetIdOrCode) {
    productHref = `/chao-ban-cong-nghe/${encodeURIComponent(targetIdOrCode)}`;
  } else if (cleanName) {
    productHref = `/chao-ban-cong-nghe?search=${encodeURIComponent(cleanName)}`;
  } else {
    productHref = `/chao-ban-cong-nghe`;
  }

  // 5. Construct demandHref
  const demandHref = item.id
    ? `/nhu-cau-cong-nghe/${item.id}`
    : (item.itemCode ? `/nhu-cau-cong-nghe/${item.itemCode}` : '/nhu-cau-cong-nghe');

  return {
    productName: cleanName || 'Sản phẩm công nghệ',
    offerCode: parsedCode,
    offerId: directOfferId,
    productHref,
    demandHref,
  };
}

function extractProductName(item: DemandItem): string {
  return resolveProductInfo(item).productName;
}

function getInitialTab(): 'commercial' | 'demands' {
  if (typeof window === 'undefined') return 'demands';
  try {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'commercial') return 'commercial';
    if (tab === 'demands') return 'demands';
  } catch {
    // ignore
  }
  return 'demands';
}

export default function BuyerDemandsPage() {
  const toast = useToast();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [demands, setDemands] = useState<DemandItem[]>([]);
  const [bookmarkedDemands, setBookmarkedDemands] = useState<DemandItem[]>([]);
  const [isBookmarkedLoading, setIsBookmarkedLoading] = useState(false);
  const [asyncState, setAsyncState] = useState<AsyncState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDemand, setEditingDemand] = useState<DemandItem | null>(null);
  const [closingDemandId, setClosingDemandId] = useState<string | null>(null);
  const [isClosingSubmitting, setIsClosingSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  // 2 Tabs cấp cao: 'commercial' | 'demands'
  const [activeTab, setActiveTab] = useState<'commercial' | 'demands'>(getInitialTab);
  const [isTabUserSelected, setIsTabUserSelected] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return Boolean(new URLSearchParams(window.location.search).get('tab'));
    } catch {
      return false;
    }
  });

  // State cho Đơn hàng Thương Mại
  const [selectedOrder, setSelectedOrder] = useState<DemandItem | null>(null);
  const [activeDealRoomUrl, setActiveDealRoomUrl] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  useEffect(() => {
    if (selectedOrder?.id && ['PROCESSING', 'NEGOTIATING', 'COMPLETED'].includes(selectedOrder.status?.toUpperCase() || '')) {
      brokerageApi.getOpportunityByDemand(selectedOrder.id).then((res) => {
        if (res?.dealRoomUrl) {
          setActiveDealRoomUrl(res.dealRoomUrl);
        } else {
          setActiveDealRoomUrl('/portal/opportunities/pipeline');
        }
      });
    } else {
      setActiveDealRoomUrl(null);
    }
  }, [selectedOrder?.id, selectedOrder?.status]);

  const fetchDemands = async () => {
    setAsyncState('loading');
    setErrorMessage('');
    try {
      const token = authClient.getToken();
      if (!token) {
        setDemands([]);
        setAsyncState('empty');
        return;
      }

      const res = await fetch('/api/v1/buyer/demands', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const list: DemandItem[] = Array.isArray(data) ? data : [];
        setDemands(list);
        if (list.length === 0) {
          setAsyncState('empty');
        } else {
          setAsyncState('success');
          // Mặc định: nếu query param tab=commercial HOẶC có đơn mua thì Tab 1, ngược lại Tab 2
          if (!isTabUserSelected) {
            const hasCommercial = list.some(isCommercialDemandItem);
            if (hasCommercial) {
              setActiveTab('commercial');
            } else {
              setActiveTab('demands');
            }
          }
        }
      } else if (res.status === 401) {
        setDemands([]);
        setAsyncState('empty');
      } else {
        setErrorMessage('Không thể tải danh sách bài toán của doanh nghiệp.');
        setAsyncState('error');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Lỗi kết nối máy chủ API.');
      setAsyncState('error');
    }
  };

  const fetchBookmarkedDemands = async () => {
    const token = authClient.getToken();
    if (!token) return;
    setIsBookmarkedLoading(true);
    try {
      const res = await fetch('/api/v1/demands/bookmarked?limit=50', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
        setBookmarkedDemands(list);
      }
    } catch {
      // Bỏ qua lỗi ngầm
    } finally {
      setIsBookmarkedLoading(false);
    }
  };

  useEffect(() => {
    setUserRole(authClient.getUser()?.role ?? null);
    fetchDemands();
    fetchBookmarkedDemands();
  }, []);

  const handleTabChange = (tab: 'commercial' | 'demands') => {
    setActiveTab(tab);
    setIsTabUserSelected(true);
    setCurrentPage(1);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.pushState({}, '', url.toString());
      } catch {
        // ignore
      }
    }
  };

  // Phân loại 2 nhóm dữ liệu
  const commercialOrders = useMemo(() => {
    return demands.filter(isCommercialDemandItem);
  }, [demands]);

  const rdDemands = useMemo(() => {
    return demands.filter((d) => !isCommercialDemandItem(d));
  }, [demands]);

  const handleRemoveBookmark = async (id?: string) => {
    if (!id) return;
    const token = authClient.getToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/v1/demands/${id}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setBookmarkedDemands((prev) => prev.filter((d) => d.id !== id));
        toast.info('Đã hủy theo dõi bài toán khỏi danh sách.', 'Thông báo');
      } else {
        toast.error('Không thể hủy theo dõi bài toán.', 'Lỗi');
      }
    } catch {
      toast.error('Lỗi kết nối khi hủy theo dõi bài toán.', 'Lỗi');
    }
  };

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
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/v1/buyer/demands/${closingDemandId}/close`, {
        method: 'POST',
        headers,
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

  // Xử lý Hủy đơn đặt mua thương mại (khi ở trạng thái SUBMITTED / PENDING)
  const handleCancelOrderConfirm = async () => {
    if (!cancellingOrderId) return;
    setIsCancellingOrder(true);
    try {
      const token = authClient.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await fetch(`/api/v1/buyer/demands/${cancellingOrderId}/close`, {
        method: 'POST',
        headers,
      });

      // Đồng bộ status thành CANCELLED
      setDemands((prev) =>
        prev.map((d) => (d.id === cancellingOrderId ? { ...d, status: 'CANCELLED' } : d))
      );
      if (selectedOrder && selectedOrder.id === cancellingOrderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
      }
      toast.success('Đã hủy đơn đặt mua sản phẩm thành công.', 'Thông báo');
    } catch {
      setDemands((prev) =>
        prev.map((d) => (d.id === cancellingOrderId ? { ...d, status: 'CANCELLED' } : d))
      );
      toast.success('Đã hủy đơn đặt mua.', 'Thông báo');
    } finally {
      setIsCancellingOrder(false);
      setCancellingOrderId(null);
    }
  };

  // Logic lọc và phân trang cho Tab 2 (R&D Demands)
  const filteredRdList = rdDemands.filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  const isBookmarkedTab = filterStatus === 'BOOKMARKED';
  const displayRdList = isBookmarkedTab ? bookmarkedDemands : filteredRdList;
  const totalRdItems = displayRdList.length;
  const totalRdPages = Math.max(1, Math.ceil(totalRdItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalRdPages);
  const paginatedRdList = displayRdList.slice(
    (validCurrentPage - 1) * pageSize,
    validCurrentPage * pageSize
  );

  const verifiedCount = rdDemands.filter((d) => d.status === 'VERIFIED').length;
  const pendingCount = rdDemands.filter((d) => d.status === 'PENDING').length;
  const closedCount = rdDemands.filter((d) => d.status === 'CLOSED').length;
  const avgTni =
    rdDemands.length > 0
      ? Math.round(rdDemands.reduce((sum, d) => sum + (d.tniScore || 0), 0) / rdDemands.length)
      : null;
  const avgTniMeta = avgTni !== null ? getTniClassification(avgTni) : null;
  const totalMatchingCount = rdDemands.reduce((sum, d) => sum + (d.matchingCount || 0), 0);
  const consultingDemandsCount = rdDemands.filter((d) => d.needConsulting).length;

  const upperRole = (userRole ?? "").toUpperCase();
  const isExpert = upperRole === "VERIFIED_EXPERT" || upperRole === "EXPERT";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-20">
      {/* WORKSPACE SUB-HEADER */}
      <section className="bg-white dark:bg-slate-900 border-b border-border-default dark:border-slate-800 py-6 px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
              {isExpert ? "E" : "B"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold tracking-tight text-text-primary dark:text-white text-xl">
                  {isExpert ? "Quản lý Đơn hàng & Nhu cầu Đặt mua" : "Quản lý Nhu cầu Công nghệ"}
                </h1>
                <span className="rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 text-xs font-bold px-2.5 py-0.5 border border-brand-200 dark:border-brand-800">
                  {isExpert ? "CHUYÊN GIA KH&CN" : "BÊN MUA CÔNG NGHỆ"}
                </span>
              </div>
              <p className="text-xs text-text-secondary dark:text-slate-400 mt-0.5">
                {isExpert
                  ? "Quản lý các đơn đặt mua sản phẩm thương mại, mẫu thử nghiệm và bài toán nhu cầu nghiên cứu R&D."
                  : "Quản lý các nhu cầu công nghệ, chỉ số cấp thiết TNI và theo dõi nguồn cung công nghệ ghép nối."}
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
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-700 hover:bg-brand-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> + Gửi Nhu cầu Công nghệ mới
            </button>
          </div>
        </div>
      </section>

      {/* 2 TABS CẤP CAO (High-Level Tabs) */}
      <section className="bg-white dark:bg-slate-900 border-b border-border-default dark:border-slate-800 px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto flex items-center gap-6">
          <button
            type="button"
            onClick={() => handleTabChange('commercial')}
            className={`py-4 text-sm font-extrabold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'commercial'
                ? 'border-brand-600 text-brand-700 dark:text-cyan-400'
                : 'border-transparent text-text-secondary dark:text-slate-400 hover:text-text-primary'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Đơn mua sản phẩm thương mại</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-800">
              {commercialOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('demands')}
            className={`py-4 text-sm font-extrabold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'demands'
                ? 'border-brand-600 text-brand-700 dark:text-cyan-400'
                : 'border-transparent text-text-secondary dark:text-slate-400 hover:text-text-primary'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            <span>Nhu cầu R&D / Bài toán công nghệ</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
              {rdDemands.length}
            </span>
          </button>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-[1440px] mx-auto px-3 sm:px-5 py-4 flex-1 w-full space-y-5">
        {/* ========================================================================= */}
        {/* TAB 1: ĐƠN MUA SẢN PHẨM THƯƠNG MẠI                                        */}
        {/* ========================================================================= */}
        {activeTab === 'commercial' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border-default dark:border-slate-800 shadow-sm">
              <div>
                <h2 className="text-base font-extrabold text-text-primary dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-600 dark:text-cyan-400" />
                  Danh Sách Đơn Đặt Mua & Tiến Trình Giao Dịch
                </h2>
                <p className="text-xs text-text-secondary dark:text-slate-400 mt-0.5">
                  Theo dõi trực quan trạng thái 4 bước: Tiếp nhận &rarr; Xử lý & Báo giá &rarr; Thỏa thuận &rarr; Hoàn tất.
                </p>
              </div>
              <Link
                href="/chao-ban-cong-nghe"
                className="bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-400 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Search className="w-4 h-4" /> Khám phá Gian hàng Công nghệ
              </Link>
            </div>

            <Async
              state={asyncState === 'loading' ? 'loading' : commercialOrders.length === 0 ? 'empty' : 'success'}
              onRetry={fetchDemands}
              errorMessage={errorMessage}
              loadingSkeleton={
                <div className="surface-card p-6 space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                  ))}
                </div>
              }
              emptyContent={
                <div className="surface-card p-12 text-center max-w-md mx-auto space-y-4 my-6">
                  <div className="w-14 h-14 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 rounded-2xl flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-extrabold text-text-primary dark:text-white">
                    Chưa có đơn đặt mua sản phẩm nào
                  </h3>
                  <p className="text-xs text-text-secondary dark:text-slate-400 leading-relaxed">
                    Bạn chưa có đơn đặt mua sản phẩm thương mại hoặc thiết bị máy móc nào. Hãy ghé thăm Gian hàng Công nghệ để kết nối với các sản phẩm sẵn sàng chuyển giao.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/chao-ban-cong-nghe"
                      className="bg-brand-700 hover:bg-brand-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-2 shadow-sm"
                    >
                      <ShoppingBag className="w-4 h-4" /> Khám Phá Sản Phẩm Ngay
                    </Link>
                  </div>
                </div>
              }
            >
              <div className="surface-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-border-default dark:border-slate-800 text-text-secondary dark:text-slate-400 font-bold uppercase tracking-wider text-xs">
                      <tr>
                        <th className="px-6 py-4">Mã Đơn Hàng</th>
                        <th className="px-6 py-4">Sản Phẩm & Thông Tin Đặt Mua</th>
                        <th className="px-6 py-4">Ngân Sách / Đơn Giá</th>
                        <th className="px-6 py-4">Tiến Trình Giao Dịch</th>
                        <th className="px-6 py-4 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {commercialOrders.map((order) => {
                        const prodInfo = resolveProductInfo(order);
                        const canCancel =
                          order.status === 'SUBMITTED' ||
                          order.status === 'PENDING' ||
                          !order.status;

                        return (
                          <tr
                            key={order.id || order.itemCode}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition"
                          >
                            <td className="px-6 py-4 font-mono font-bold text-brand-700 dark:text-cyan-400">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="hover:underline text-left cursor-pointer focus-ring rounded"
                                title="Xem tiến trình & chi tiết đơn đặt mua"
                              >
                                {order.itemCode}
                              </button>
                            </td>
                            <td className="px-6 py-4 max-w-sm">
                              <div className="flex items-start gap-2.5">
                                <Link
                                  href={prodInfo.productHref}
                                  className="w-8 h-8 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900 text-brand-700 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 border border-brand-200 dark:border-brand-800 transition"
                                  title="Xem trang chi tiết sản phẩm chào bán"
                                >
                                  <Package className="w-4 h-4" />
                                </Link>
                                <div className="space-y-0.5 min-w-0">
                                  <Link
                                    href={prodInfo.productHref}
                                    className="font-bold text-text-primary dark:text-white hover:text-brand-700 dark:hover:text-cyan-400 hover:underline line-clamp-1 transition flex items-center gap-1 group"
                                    title="Mở trang chi tiết sản phẩm chào bán"
                                  >
                                    <span className="truncate">{prodInfo.productName}</span>
                                    <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover:opacity-100 text-brand-600 dark:text-cyan-400" />
                                  </Link>
                                  <p className="text-xs text-text-secondary dark:text-slate-400 line-clamp-1">
                                    {order.applicationScale ? `Đơn vị: ${order.applicationScale}` : 'Yêu cầu đặt mua thương mại'}
                                  </p>
                                  <div className="pt-0.5 flex items-center gap-2 text-xs">
                                    <span className="font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                      Đơn mua hàng
                                    </span>
                                    {prodInfo.offerCode && (
                                      <>
                                        <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                                        <Link
                                          href={prodInfo.productHref}
                                          className="font-mono text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-cyan-400 hover:underline"
                                          title="Xem trang chi tiết sản phẩm chào bán"
                                        >
                                          Mã SP: {prodInfo.offerCode}
                                        </Link>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-text-primary dark:text-slate-200 whitespace-nowrap">
                              {order.budgetRange || 'Thỏa thuận'}
                            </td>
                            <td className="px-6 py-4">
                              <OrderTrackingStepper
                                status={order.status}
                                compact={true}
                              />
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={prodInfo.productHref}
                                  className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-700 dark:text-slate-300 dark:hover:text-cyan-400 hover:underline font-semibold text-xs"
                                  title="Mở trang chi tiết sản phẩm"
                                >
                                  <Package className="w-3.5 h-3.5" /> Sản phẩm
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(order)}
                                  className="inline-flex items-center gap-1 text-brand-700 dark:text-cyan-400 hover:underline font-bold text-xs"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Chi tiết
                                </button>

                                {canCancel && (
                                  <button
                                    type="button"
                                    onClick={() => setCancellingOrderId(order.id || null)}
                                    className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-bold text-xs ml-2"
                                  >
                                    <XCircle className="w-3.5 h-3.5" /> Hủy đơn
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: NHU CẦU R&D / BÀI TOÁN CÔNG NGHỆ                                     */}
        {/* ========================================================================= */}
        {activeTab === 'demands' && (
          <div className="space-y-6">
            {/* KPI SUMMARY CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="surface-card p-5 space-y-1">
                <div className="flex items-center justify-between text-text-secondary dark:text-slate-400">
                  <span className="text-xs font-bold">Tổng nhu cầu đã gửi</span>
                  <FileQuestion className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
                </div>
                <p className="text-2xl font-extrabold text-text-primary dark:text-white">
                  {rdDemands.length}
                </p>
                <p className="text-xs text-text-secondary dark:text-slate-400">
                  {verifiedCount} nhu cầu đã duyệt niêm yết
                </p>
              </div>

              <div className="surface-card p-5 space-y-1">
                <div className="flex items-center justify-between text-text-secondary dark:text-slate-400">
                  <span className="text-xs font-bold">Điểm TNI trung bình</span>
                  <Flame className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                  {avgTni !== null ? avgTni : '--'}
                </p>
                <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold">
                  {avgTni !== null ? avgTniMeta?.label : 'Chưa có dữ liệu đánh giá'}
                </p>
              </div>

              <div className="surface-card p-5 space-y-1">
                <div className="flex items-center justify-between text-text-secondary dark:text-slate-400">
                  <span className="text-xs font-bold">Nguồn cung tiềm năng</span>
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {totalMatchingCount}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                  {rdDemands.length > 0 ? 'Tự động gợi ý từ Radar' : 'Chưa kích hoạt ghép nối'}
                </p>
              </div>

              <div className="surface-card p-5 space-y-1">
                <div className="flex items-center justify-between text-text-secondary dark:text-slate-400">
                  <span className="text-xs font-bold">Chuyên gia Sở KH&CN</span>
                  <Award className="w-4 h-4 text-brand-500" />
                </div>
                <p className="text-2xl font-extrabold text-brand-700 dark:text-brand-400">
                  {consultingDemandsCount}
                </p>
                <p className="text-xs text-brand-600 dark:text-brand-300 font-semibold">
                  {rdDemands.length > 0 ? 'Nhu cầu đăng ký tư vấn 1-1' : 'Chưa đăng ký tư vấn'}
                </p>
              </div>
            </div>

            {/* FILTER TABS */}
            <div className="surface-card p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setFilterStatus('ALL');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterStatus === 'ALL'
                      ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-white shadow-sm'
                      : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'
                  }`}
                >
                  Tất cả ({rdDemands.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterStatus('VERIFIED');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterStatus === 'VERIFIED'
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'
                  }`}
                >
                  Đang mở tìm cung ({verifiedCount})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterStatus('PENDING');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterStatus === 'PENDING'
                      ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm'
                      : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'
                  }`}
                >
                  Chờ thẩm định ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterStatus('CLOSED');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterStatus === 'CLOSED'
                      ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm'
                      : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'
                  }`}
                >
                  Đã đóng ({closedCount})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterStatus('BOOKMARKED');
                    setCurrentPage(1);
                    fetchBookmarkedDemands();
                  }}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    filterStatus === 'BOOKMARKED'
                      ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm'
                      : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Đang theo dõi ({bookmarkedDemands.length})
                </button>
              </div>

              <div className="text-xs text-text-secondary dark:text-slate-400">
                Hiển thị <strong>{isBookmarkedTab ? bookmarkedDemands.length : filteredRdList.length}</strong> bài toán {isBookmarkedTab ? 'đang theo dõi' : 'kỹ thuật'}
              </div>
            </div>

            {/* TABLE LIST WITH ASYNC 5 UX STATES */}
            <Async
              state={isBookmarkedTab ? (isBookmarkedLoading ? 'loading' : (bookmarkedDemands.length === 0 ? 'empty' : 'success')) : asyncState}
              onRetry={isBookmarkedTab ? fetchBookmarkedDemands : fetchDemands}
              errorMessage={errorMessage}
              loadingSkeleton={
                <div className="surface-card p-6 space-y-4 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                  ))}
                </div>
              }
              emptyContent={
                isBookmarkedTab ? (
                  <div className="surface-card p-12 text-center max-w-md mx-auto space-y-4 my-6">
                    <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-2xl flex items-center justify-center mx-auto">
                      <Bookmark className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-extrabold text-text-primary dark:text-white">
                      Chưa có bài toán nào đang theo dõi
                    </h3>
                    <p className="text-xs text-text-secondary dark:text-slate-400">
                      Quý đơn vị có thể ghé thăm Sàn Giao Dịch Nhu Cầu để lưu các bài toán kỹ thuật quan tâm vào danh sách theo dõi.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/nhu-cau-cong-nghe"
                        className="bg-brand-700 hover:bg-brand-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-2"
                      >
                        <Search className="w-4 h-4" /> Khám Phá Nhu Cầu Công Nghệ
                      </Link>
                    </div>
                  </div>
                ) : !authClient.getToken() ? (
                  <div className="surface-card p-12 text-center max-w-md mx-auto space-y-4 my-6">
                    <div className="w-14 h-14 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 rounded-2xl flex items-center justify-center mx-auto">
                      <FileQuestion className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-extrabold text-text-primary dark:text-white">
                      Yêu cầu đăng nhập Doanh nghiệp
                    </h3>
                    <p className="text-xs text-text-secondary dark:text-slate-400">
                      Vui lòng đăng nhập tài khoản Doanh nghiệp hoặc Khảo sát để quản lý danh sách bài toán kỹ thuật.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/login"
                        className="bg-brand-700 hover:bg-brand-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-2"
                      >
                        Đăng Nhập Ngay
                      </Link>
                    </div>
                  </div>
                ) : (
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
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="bg-brand-700 hover:bg-brand-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-2"
                      >
                        <PlusCircle className="w-4 h-4" /> Đăng Bài Toán Ngay
                      </button>
                    </div>
                  </div>
                )
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
                      {paginatedRdList.map((item) => {
                        const rdProdInfo = resolveProductInfo(item);
                        const demandDetailUrl = item.id ? `/nhu-cau-cong-nghe/${item.id}` : '/nhu-cau-cong-nghe';

                        return (
                          <tr
                            key={item.id || item.itemCode}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition"
                          >
                            <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                              <Link
                                href={demandDetailUrl}
                                className="hover:underline hover:text-brand-700 dark:hover:text-cyan-400"
                                title="Xem chi tiết bài toán nhu cầu"
                              >
                                {item.itemCode}
                              </Link>
                            </td>
                            <td className="px-6 py-4 max-w-md">
                              <Link
                                href={demandDetailUrl}
                                className="font-bold text-text-primary dark:text-white hover:text-brand-700 dark:hover:text-cyan-400 hover:underline line-clamp-1 block transition group"
                                title="Xem chi tiết bài toán nhu cầu"
                              >
                                <span className="truncate">{item.technicalProblem}</span>
                              </Link>
                              <span className="text-xs text-text-secondary dark:text-slate-400 block mt-0.5">
                                Công đoạn: {item.stageName} • Lĩnh vực: {item.sectorCode}
                              </span>
                              {rdProdInfo.offerCode && (
                                <Link
                                  href={rdProdInfo.productHref}
                                  className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-cyan-400 hover:underline mt-1 font-medium"
                                  title="Xem sản phẩm công nghệ chào bán"
                                >
                                  <Package className="w-3 h-3" /> Sản phẩm liên kết: {rdProdInfo.offerCode}
                                </Link>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <IndexVerificationBadge
                                type="TNI"
                                value={item.tniScore}
                                status={item.tniVerificationStatus || (item.status === 'VERIFIED' ? 'VERIFIED_BY_GOV' : 'SELF_DECLARED')}
                                authorityName={item.verifiedAuthorityName}
                                variant="compact"
                              />
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

                                {isBookmarkedTab ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBookmark(item.id)}
                                    className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline font-bold text-xs"
                                    title="Hủy theo dõi bài toán này"
                                  >
                                    <Bookmark className="w-3.5 h-3.5" /> Bỏ theo dõi
                                  </button>
                                ) : (
                                  <>
                                    {item.status === 'PENDING' && (
                                      <button
                                        type="button"
                                        onClick={() => setEditingDemand(item)}
                                        className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline font-bold text-xs"
                                        title="Chỉnh sửa bài toán"
                                      >
                                        <Edit className="w-3.5 h-3.5" /> Sửa
                                      </button>
                                    )}

                                    {item.status !== 'CLOSED' && (
                                      <button
                                        type="button"
                                        onClick={() => setClosingDemandId(item.id || null)}
                                        className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-bold text-xs"
                                        title="Đóng bài toán"
                                      >
                                        <XCircle className="w-3.5 h-3.5" /> Đóng
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION CONTROLS */}
                {totalRdPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <p className="text-xs text-text-secondary dark:text-slate-400">
                      Hiển thị <strong>{(validCurrentPage - 1) * pageSize + 1}</strong> – <strong>{Math.min(validCurrentPage * pageSize, totalRdItems)}</strong> trong tổng số <strong>{totalRdItems}</strong> bài toán
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={validCurrentPage === 1}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition text-text-primary dark:text-white"
                      >
                        Trang trước
                      </button>
                      {Array.from({ length: totalRdPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                            validCurrentPage === page
                              ? 'bg-brand-700 text-white shadow-sm'
                              : 'border border-slate-200 dark:border-slate-700 text-text-secondary dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalRdPages, p + 1))}
                        disabled={validCurrentPage === totalRdPages}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition text-text-primary dark:text-white"
                      >
                        Trang sau
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Async>
          </div>
        )}
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

      {/* CONFIRM CLOSE RD DEMAND MODAL */}
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

      {/* CONFIRM CANCEL COMMERCIAL ORDER MODAL */}
      <ConfirmModal
        isOpen={Boolean(cancellingOrderId)}
        title="Xác nhận hủy đơn đặt mua"
        message="Bạn có chắc chắn muốn hủy đơn đặt mua sản phẩm này? Sau khi hủy, đơn hàng sẽ chuyển sang trạng thái Đã hủy và dừng quy trình xử lý giao dịch."
        confirmText="Xác nhận hủy đơn"
        cancelText="Quay lại"
        loading={isCancellingOrder}
        variant="danger"
        onConfirm={handleCancelOrderConfirm}
        onClose={() => setCancellingOrderId(null)}
      />

      {/* MODAL CHI TIẾT ĐƠN HÀNG THƯƠNG MẠI */}
      {selectedOrder && (() => {
        const selectedProdInfo = resolveProductInfo(selectedOrder);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
              {/* Header Modal */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-brand-700 dark:text-cyan-400 uppercase tracking-wider">
                    Đơn hàng: {selectedOrder.itemCode}
                  </span>
                  <div className="mt-1">
                    <Link
                      href={selectedProdInfo.productHref}
                      className="inline-flex items-center gap-1.5 text-lg font-extrabold text-slate-900 dark:text-white hover:text-brand-700 dark:hover:text-cyan-400 hover:underline transition group"
                      title="Mở trang chi tiết sản phẩm chào bán"
                    >
                      <span>{selectedProdInfo.productName}</span>
                      <ExternalLink className="w-4 h-4 text-brand-600 dark:text-cyan-400 shrink-0" />
                    </Link>
                    {selectedProdInfo.offerCode && (
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        Mã sản phẩm / công nghệ: {selectedProdInfo.offerCode}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stepper Toàn Diện */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Tiến trình đơn đặt mua
                </h4>
                <OrderTrackingStepper
                  status={selectedOrder.status}
                  compact={false}
                />
              </div>

              {/* Thông tin đơn hàng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold uppercase">Ngân sách / Mức giá</span>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {selectedOrder.budgetRange || 'Thỏa thuận trực tiếp'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold uppercase">Công đoạn & Lĩnh vực</span>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {selectedOrder.stageName} • {selectedOrder.sectorCode}
                  </p>
                </div>
              </div>

              {/* Chi tiết yêu cầu */}
              <div className="space-y-2 text-xs">
                <span className="text-slate-400 font-bold uppercase block">
                  Nội dung yêu cầu & Ghi chú liên hệ
                </span>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedOrder.desiredSolution || selectedOrder.technicalProblem}
                </div>
              </div>

              {/* Footer Modal */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={selectedProdInfo.productHref}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-400 text-xs font-bold transition border border-brand-200 dark:border-slate-700"
                    title="Mở trang chi tiết sản phẩm chào bán"
                  >
                    <Package className="w-4 h-4" />
                    <span>Xem Chi Tiết Sản Phẩm</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  {/* Nút CTA Vào Deal Room Thảo Luận (T050 / CR-TASK-08-DELTA-02) */}
                  {isCommercialDemandItem(selectedOrder) &&
                    ['PROCESSING', 'NEGOTIATING', 'COMPLETED'].includes(selectedOrder.status?.toUpperCase() || '') && (
                      <Link
                        href={activeDealRoomUrl || '/portal/opportunities/pipeline'}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                        title="Vào Deal Room đàm phán hợp đồng thương mại"
                      >
                        <Handshake className="w-4 h-4" />
                        <span>Vào Deal Room Thảo Luận &rarr;</span>
                      </Link>
                    )}

                  {(selectedOrder.status === 'SUBMITTED' || selectedOrder.status === 'PENDING' || !selectedOrder.status) ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCancellingOrderId(selectedOrder.id || null);
                      }}
                      className="text-rose-600 dark:text-rose-400 hover:underline font-bold text-xs flex items-center gap-1 ml-2"
                    >
                      <XCircle className="w-4 h-4" /> Hủy đơn
                    </button>
                  ) : selectedOrder.status === 'COMPLETED' ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold ml-2 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Đơn hàng đã hoàn tất thành công (Đã ký kết MOU).
                    </span>
                  ) : selectedOrder.status === 'NEGOTIATING' ? (
                    <span className="text-xs text-amber-600 dark:text-amber-400 italic ml-2">
                      Đang thỏa thuận điều khoản. Giao dịch chuyển sang Bước 4 khi ký MOU trong Deal Room.
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 italic ml-2">
                      Đơn hàng đã được bên bán tiếp nhận và đang xử lý.
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="bg-brand-700 hover:bg-brand-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
