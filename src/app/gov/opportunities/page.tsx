'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Sparkles,
  UserCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  Layers,
  Search,
  RefreshCw,
  Eye,
  X,
  Phone,
  Mail,
  FileSignature,
} from 'lucide-react';
import { GovOpportunitiesOverview, Opportunity } from '@/types/brokerage';
import { brokerageApi } from '@/services/api/brokerage';
import { GovPageHeader } from '@/components/gov/gov-page-header';
import { resolveProvinceName } from '@/lib/gov-label-resolver';
import { authClient } from '@/lib/auth-client';
import { useToast } from '@/components/common/toast';
import { formatCurrencyMillionVnd } from '@/lib/currency';

export default function GovOpportunitiesPage() {
  const toast = useToast();
  const [data, setData] = useState<GovOpportunitiesOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSlaOnly, setFilterSlaOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<(Opportunity & { isSlaWarning: boolean }) | null>(null);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  const handleUpdateStage = async (newStage: string) => {
    if (!selectedDeal) return;
    setIsUpdatingStage(true);
    try {
      await brokerageApi.updateOpportunityStage(selectedDeal.id, newStage);
      toast.success(
        `Đã chuyển trạng thái cơ hội sang ${newStage} thành công!`,
        'Cập Nhật Tiến Trình'
      );
      setSelectedDeal((prev) => (prev ? { ...prev, stage: newStage } : null));
      await fetchGovData();
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật tiến trình cơ hội.', 'Thất Bại');
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const user = authClient.getUser();
  const userScopeId = user?.scopeId || '';

  const fetchGovData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await brokerageApi.getGovOpportunities();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Không thể tải cổng giám sát.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGovData();
  }, []);

  const stats = data?.statistics;

  const filteredList = useMemo(() => {
    const list = data?.opportunities || [];
    return list.filter((opp) => {
      if (filterSlaOnly && !opp.isSlaWarning) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = opp.opportunityCode?.toLowerCase().includes(q);
        const matchTitle = opp.title?.toLowerCase().includes(q);
        const matchBuyer = opp.buyerOrgName?.toLowerCase().includes(q);
        const matchSeller = opp.sellerOrgName?.toLowerCase().includes(q);
        return matchCode || matchTitle || matchBuyer || matchSeller;
      }
      return true;
    });
  }, [data, filterSlaOnly, searchQuery]);

  const slaBreachedCount = useMemo(() => {
    return (data?.opportunities || []).filter((o) => o.isSlaWarning).length;
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Gov Standard Header */}
      <GovPageHeader
        breadcrumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Cổng Công Vụ Sở KH&CN', href: '/gov' },
          { label: 'Giám Sát Cơ Hội Cung–Cầu' },
        ]}
        title="Cổng Giám Sát Cung–Cầu Công Nghệ Địa Phương"
        subtitle="Giám sát thời gian thực các dòng kết nối công nghệ trên địa bàn, phát hiện cơ hội ách tắc quá hạn SLA 48h và điều phối chuyên gia hỗ trợ."
        icon={ShieldCheck}
        scopeCode={userScopeId}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchGovData}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 transition shadow-sm"
              title="Tải lại dữ liệu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-caption text-text-muted block">Tổng cơ hội</span>
            <span className="text-xl font-bold text-text-primary">{stats.total}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-caption text-text-muted block">Gợi ý AI</span>
            <span className="text-xl font-bold text-brand-700 dark:text-cyan-400">{stats.suggested}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-caption text-text-muted block">Đang tiếp cận</span>
            <span className="text-xl font-bold text-amber-700 dark:text-amber-400">{stats.initiated}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-caption text-text-muted block">Đang đàm phán</span>
            <span className="text-xl font-bold text-amber-700 dark:text-amber-400">{stats.negotiating}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-caption text-text-muted block">Đã ký MOU</span>
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{stats.mouSigned}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-caption text-text-muted block">Tổng GT dự kiến</span>
            <span className="text-xl font-bold text-brand-700 dark:text-cyan-400">
              {formatCurrencyMillionVnd(stats.totalEstimatedValueMillionVnd)}
            </span>
          </div>
        </div>
      )}

      {/* Table & Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterSlaOnly(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                !filterSlaOnly
                  ? 'bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950 dark:text-brand-300'
                  : 'bg-surface-subtle text-text-muted hover:text-text-primary border border-border'
              }`}
            >
              Tất cả ({data?.opportunities.length || 0})
            </button>
            <button
              data-testid="filter-sla-breached"
              onClick={() => setFilterSlaOnly(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                filterSlaOnly
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-surface-subtle text-text-muted hover:text-text-primary border border-border'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Quá hạn SLA 48h ({slaBreachedCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã deal, tiêu đề, đối tác..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-surface-subtle border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-surface-subtle animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-caption text-rose-600 mb-2">{error}</p>
            <button
              onClick={fetchGovData}
              className="px-4 py-2 rounded-xl bg-brand-primary text-white text-caption font-medium"
            >
              Thử lại
            </button>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-caption bg-surface-subtle/40 rounded-xl border border-dashed border-border">
            {filterSlaOnly
              ? 'Không có cơ hội nào đang vi phạm cảnh báo SLA 48h trong địa bàn.'
              : 'Chưa có cơ hội hợp tác nào phát sinh trong địa bàn.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-caption text-left">
              <thead className="bg-surface-subtle border-y border-border text-text-muted font-medium">
                <tr>
                  <th className="py-3 px-4">Mã Deal</th>
                  <th className="py-3 px-4">Tiêu Đề & Cặp Đối Tác</th>
                  <th className="py-3 px-4">Địa Bàn Quản Lý</th>
                  <th className="py-3 px-4">Chuyên Gia Giám Sát</th>
                  <th className="py-3 px-4">Giai Đoạn</th>
                  <th className="py-3 px-4">Giá Trị Dự Kiến</th>
                  <th className="py-3 px-4">Cảnh Báo SLA</th>
                  <th className="py-3 px-4 text-right">Tác Nghiệp Sở</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredList.map((opp) => {
                  const provinceDisplay = resolveProvinceName(opp.managingAuthorityId || userScopeId);
                  return (
                    <tr key={opp.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-primary">
                        {opp.opportunityCode}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-text-primary truncate">{opp.title}</p>
                        <p className="text-caption text-text-muted truncate">
                          {opp.buyerOrgName} &harr; {opp.sellerOrgName}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-text-secondary">
                        <span className="font-semibold">{provinceDisplay}</span>
                        {opp.managingAuthorityId && (
                          <span className="text-xs text-text-muted ml-1">({opp.managingAuthorityId})</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary">
                        {opp.assignedExpertName ? (
                          <span className="flex items-center gap-1 text-brand-primary">
                            <UserCheck className="w-3.5 h-3.5" /> {opp.assignedExpertName}
                          </span>
                        ) : (
                          <span className="text-text-muted italic">Chưa chỉ định</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-caption font-bold bg-surface-subtle border border-border text-text-secondary">
                          {opp.stage}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-text-primary">
                        {formatCurrencyMillionVnd(opp.estimatedValueMillionVnd, { emptyLabel: '---' })}
                      </td>
                      <td className="py-3.5 px-4">
                        {opp.isSlaWarning ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-bold bg-rose-500/10 text-rose-700 border border-rose-500/20">
                            <AlertTriangle className="w-3.5 h-3.5" /> Quá hạn 48h
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-medium bg-emerald-500/10 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đúng hạn
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedDeal(opp)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-brand-primary hover:bg-surface-elevated font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Giám sát Deal
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Giám Sát Deal Room Công Vụ */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-text-primary text-base">
                  Giám Sát Tiến Trình Deal: {selectedDeal.opportunityCode}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDeal(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-surface-subtle rounded-xl border border-border space-y-1">
                <span className="text-caption text-text-muted">Tiêu đề cơ hội hợp tác:</span>
                <p className="font-bold text-text-primary text-sm">{selectedDeal.title}</p>
                <p className="text-text-secondary">
                  Địa bàn: <strong>{resolveProvinceName(selectedDeal.managingAuthorityId || userScopeId)}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-border space-y-1">
                  <span className="font-bold text-text-primary block">Bên Mua (Doanh nghiệp có nhu cầu):</span>
                  <p className="font-semibold text-brand-primary">{selectedDeal.buyerOrgName}</p>
                  <p className="text-text-muted">Đại diện: {selectedDeal.buyerContactName}</p>
                  <p className="text-text-muted flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {selectedDeal.buyerContactPhone}
                  </p>
                  <p className="text-text-muted flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {selectedDeal.buyerContactEmail}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border space-y-1">
                  <span className="font-bold text-text-primary block">Bên Bán (Đơn vị cung cấp giải pháp):</span>
                  <p className="font-semibold text-emerald-700">{selectedDeal.sellerOrgName}</p>
                  <p className="text-text-muted">Đại diện: {selectedDeal.sellerContactName}</p>
                  <p className="text-text-muted flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {selectedDeal.sellerContactPhone}
                  </p>
                  <p className="text-text-muted flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {selectedDeal.sellerContactEmail}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-surface-subtle rounded-xl border border-border flex items-center justify-between">
                <div>
                  <span className="text-text-muted block">Giai đoạn & Giá trị:</span>
                  <span className="font-bold text-text-primary text-sm">
                    {selectedDeal.stage} •{' '}
                    {formatCurrencyMillionVnd(selectedDeal.estimatedValueMillionVnd, { emptyLabel: 'Chưa xác định' })}
                  </span>
                </div>
                <div>
                  {selectedDeal.isSlaWarning ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 border border-rose-500/20">
                      <AlertTriangle className="w-4 h-4" /> Quá hạn SLA 48h
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" /> Tiến trình bình thường
                    </span>
                  )}
                </div>
              </div>
            </div>

              {/* Tác Vụ Cán Bộ Quản Trị Sở KH&CN (ADR-BROKERAGE-01) */}
              <div className="p-3.5 bg-brand-50/80 dark:bg-brand-950/40 rounded-xl border border-brand-200 dark:border-brand-800 space-y-2">
                <span className="text-caption font-bold text-brand-900 dark:text-cyan-300 block">
                  Tác Vụ Quản Trị Sở KH&CN (Cơ Chế Bảo Trợ Nhà Nước):
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedDeal.stage === 'INITIATED' && (
                    <button
                      type="button"
                      disabled={isUpdatingStage}
                      onClick={() => handleUpdateStage('NEGOTIATING')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-700 hover:bg-brand-800 text-white shadow-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isUpdatingStage ? 'Đang xử lý...' : 'Kích Hoạt Đàm Phán (Mở Deal Room)'}
                    </button>
                  )}

                  {(selectedDeal.stage === 'NEGOTIATING' || selectedDeal.stage === 'MOU_SIGNED') && (
                    <Link
                      href={`/portal/opportunities/${selectedDeal.id}/deal-room`}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <FileSignature className="w-3.5 h-3.5" />
                      <span>Vào Phòng Đàm Phán & Xem Thảo Luận (Deal Room)</span>
                    </Link>
                  )}

                  {selectedDeal.stage !== 'CLOSED_LOST' && selectedDeal.stage !== 'COMPLETED' && (
                    <button
                      type="button"
                      disabled={isUpdatingStage}
                      onClick={() => handleUpdateStage('CLOSED_LOST')}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900 transition disabled:opacity-50 cursor-pointer"
                    >
                      Bác Bỏ / Đóng Ca
                    </button>
                  )}
                </div>
              </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                onClick={() => setSelectedDeal(null)}
                className="px-4 py-2 rounded-xl bg-surface-subtle border border-border text-text-secondary hover:text-text-primary font-semibold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
