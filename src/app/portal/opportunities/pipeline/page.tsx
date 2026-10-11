'use client';

import React, { useState, useEffect } from 'react';
import {
  Kanban,
  Search,
  RefreshCw,
  Plus,
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
} from 'lucide-react';
import Link from 'next/link';
import { Opportunity } from '@/types/brokerage';
import { brokerageApi } from '@/services/api/brokerage';

const KANBAN_STAGES = [
  { key: 'SUGGESTED', label: 'Gợi Ý AI', color: 'border-brand-primary/30 bg-brand-primary/5 text-brand-primary' },
  { key: 'INITIATED', label: 'Đã Tiếp Cận', color: 'border-amber-500/30 bg-amber-500/5 text-amber-700' },
  { key: 'NEGOTIATING', label: 'Đang Đàm Phán', color: 'border-amber-500/30 bg-amber-500/5 text-amber-700' },
  { key: 'MOU_SIGNED', label: 'Đã Ký MOU', color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700' },
  { key: 'COMPLETED', label: 'Hoàn Thành', color: 'border-brand-primary/30 bg-brand-primary/5 text-brand-primary' },
];

export default function OpportunitiesPipelinePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await brokerageApi.getOpportunities(undefined, search.trim() || undefined);
      setOpportunities(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải pipeline cơ hội.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpportunities();
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
      await fetchOpportunities();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật giai đoạn cơ hội.');
    } finally {
      setUpdatingId(null);
    }
  };

  // KPIs
  const totalValue = opportunities.reduce((sum, o) => sum + (o.estimatedValueMillionVnd || 0), 0);
  const mouCount = opportunities.filter((o) => o.stage === 'MOU_SIGNED' || o.stage === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-surface-subtle p-6 space-y-6">
      {/* Breadcrumb & Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-caption text-text-muted mb-1">
            <Link href="/portal/matching/radar" className="hover:text-text-primary">
              Radar Ghép Nối
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-primary font-medium">Pipeline Quản Lý Cơ Hội</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <Kanban className="w-6 h-6 text-brand-primary" />
            Pipeline Vòng Đời Cơ Hội Hợp Tác (Kanban)
          </h1>
          <p className="text-caption text-text-muted mt-1 max-w-2xl">
            Theo dõi dòng chảy hợp tác từ gợi ý AI, kết nối thành công, thương thảo Deal Room đến ký kết Biên bản ghi nhớ MOU.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portal/matching/radar"
            className="px-4 py-2.5 rounded-xl border border-border bg-surface-card hover:bg-surface-elevated text-text-secondary text-caption font-medium flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-brand-primary" /> Quay lại Radar AI
          </Link>
          <Link
            href="/gov/opportunities"
            className="px-4 py-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 text-caption font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" /> Giám Sát Sở KH&CN
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-card p-4 rounded-xl border border-border flex items-center gap-3">
          <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-caption text-text-muted block">Tổng cơ hội trong phễu</span>
            <span className="text-lg font-bold text-text-primary">{opportunities.length} Deal</span>
          </div>
        </div>

        <div className="bg-surface-card p-4 rounded-xl border border-border flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-700">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-caption text-text-muted block">Tổng giá trị dự kiến</span>
            <span className="text-lg font-bold text-text-primary">
              {totalValue.toLocaleString('vi-VN')} Triệu VNĐ
            </span>
          </div>
        </div>

        <div className="bg-surface-card p-4 rounded-xl border border-border flex items-center gap-3">
          <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary">
            <FileSignature className="w-5 h-5" />
          </div>
          <div>
            <span className="text-caption text-text-muted block">Đã ký MOU / Hoàn thành</span>
            <span className="text-lg font-bold text-text-primary">{mouCount} Thỏa thuận</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface-card p-4 rounded-2xl border border-border flex items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã deal, tiêu đề, bên mua hoặc bên bán..."
            className="form-control w-full pl-10 pr-4 text-sm"
          />
        </form>

        <button
          type="button"
          onClick={fetchOpportunities}
          className="h-11 w-11 flex items-center justify-center rounded-control border border-border text-text-muted hover:text-text-primary hover:bg-surface-subtle shrink-0"
          title="Tải lại"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KANBAN BOARD (5 Columns) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {KANBAN_STAGES.map((s) => (
            <div key={s.key} className="h-96 rounded-2xl bg-surface-card border border-border animate-pulse p-4" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-surface-card rounded-2xl border border-border">
          <p className="text-caption text-rose-600 mb-3">{error}</p>
          <button
            onClick={fetchOpportunities}
            className="px-4 py-2 rounded-xl bg-brand-primary text-white text-caption font-medium"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          {KANBAN_STAGES.map((col, colIdx) => {
            const colOpps = opportunities.filter((o) => {
              // Map legacy stages to 5 standard columns
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
                className="bg-surface-card/60 backdrop-blur-sm rounded-2xl border border-border p-4 flex flex-col space-y-3 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary text-caption">{col.label}</span>
                    <span className="px-2 py-0.5 rounded-full text-caption font-bold bg-surface-elevated text-text-secondary border border-border">
                      {colOpps.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1">
                  {colOpps.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border border-dashed border-border rounded-xl text-caption text-text-muted">
                      Trống
                    </div>
                  ) : (
                    colOpps.map((opp) => (
                      <div
                        key={opp.id}
                        className="bg-surface-card rounded-xl border border-border p-4 shadow-sm hover:border-brand-primary/40 transition-all space-y-3"
                      >
                        {/* Card Header: Code & Value */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-caption font-bold font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">
                            {opp.opportunityCode}
                          </span>
                          {opp.estimatedValueMillionVnd && (
                            <span className="text-caption font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              ~{opp.estimatedValueMillionVnd} Tr
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-caption font-semibold text-text-primary line-clamp-2 leading-snug">
                          {opp.title}
                        </h4>

                        {/* Actors */}
                        <div className="space-y-1 text-caption text-text-secondary pt-1 border-t border-border">
                          <div className="flex items-center gap-1.5 truncate">
                            <Building2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                            <span className="truncate">{opp.buyerOrgName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{opp.sellerOrgName}</span>
                          </div>
                          {opp.assignedExpertName && (
                            <div className="flex items-center gap-1.5 text-brand-primary truncate">
                              <UserCheck className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{opp.assignedExpertName}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-border flex items-center justify-between">
                          <Link
                            href={`/portal/opportunities/${opp.id}/deal-room`}
                            className="text-caption font-semibold text-brand-primary hover:underline flex items-center gap-1"
                          >
                            Vào Deal Room &rarr;
                          </Link>

                          {/* Move arrows */}
                          <div className="flex items-center gap-1">
                            {colIdx > 0 && (
                              <button
                                disabled={updatingId === opp.id}
                                onClick={() => handleStageMove(opp.id, col.key, 'PREV')}
                                title="Lùi lại 1 giai đoạn"
                                className="p-1.5 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {colIdx < KANBAN_STAGES.length - 1 && (
                              <button
                                disabled={updatingId === opp.id}
                                onClick={() => handleStageMove(opp.id, col.key, 'NEXT')}
                                title="Chuyển tiếp giai đoạn"
                                className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
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
    </div>
  );
}
