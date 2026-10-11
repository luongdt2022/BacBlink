'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Sparkles,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  Layers,
  Search,
  RefreshCw,
  Eye,
  Kanban,
  FileSignature,
} from 'lucide-react';
import Link from 'next/link';
import { GovOpportunitiesOverview } from '@/types/brokerage';
import { brokerageApi } from '@/services/api/brokerage';

export default function GovOpportunitiesPage() {
  const [data, setData] = useState<GovOpportunitiesOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSlaOnly, setFilterSlaOnly] = useState(false);

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
  const list = data?.opportunities.filter((o) => (filterSlaOnly ? o.isSlaWarning : true)) || [];

  return (
    <div className="min-h-screen bg-surface-subtle p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-surface-card p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-caption text-text-muted mb-1">
            <span>Cổng Quản Lý Nhà Nước</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-emerald-700 font-medium">Giám Sát Cơ Hội & Cung–Cầu</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Cổng Giám Sát Cung–Cầu Công Nghệ (Sở KH&CN)
          </h1>
          <p className="text-caption text-text-muted mt-1 max-w-2xl">
            Giám sát thời gian thực các dòng kết nối công nghệ trên địa bàn, phát hiện cơ hội ách tắc quá hạn SLA 48h và điều phối chuyên gia hỗ trợ.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portal/opportunities/pipeline"
            className="px-4 py-2.5 rounded-xl border border-border bg-surface-card hover:bg-surface-elevated text-text-secondary text-caption font-medium flex items-center gap-2 transition-colors"
          >
            <Kanban className="w-4 h-4 text-brand-primary" /> Xem Pipeline Doanh Nghiệp
          </Link>
          <Link
            href="/portal/matching/radar"
            className="px-4 py-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 text-caption font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" /> Radar AI
          </Link>
        </div>
      </div>

      {/* KPI Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-surface-card p-4 rounded-xl border border-border">
            <span className="text-caption text-text-muted block">Tổng cơ hội</span>
            <span className="text-xl font-bold text-text-primary">{stats.total}</span>
          </div>
          <div className="bg-surface-card p-4 rounded-xl border border-border">
            <span className="text-caption text-text-muted block">Gợi ý AI</span>
            <span className="text-xl font-bold text-brand-primary">{stats.suggested}</span>
          </div>
          <div className="bg-surface-card p-4 rounded-xl border border-border">
            <span className="text-caption text-text-muted block">Đang tiếp cận</span>
            <span className="text-xl font-bold text-amber-700">{stats.initiated}</span>
          </div>
          <div className="bg-surface-card p-4 rounded-xl border border-border">
            <span className="text-caption text-text-muted block">Đang đàm phán</span>
            <span className="text-xl font-bold text-amber-700">{stats.negotiating}</span>
          </div>
          <div className="bg-surface-card p-4 rounded-xl border border-border">
            <span className="text-caption text-text-muted block">Đã ký MOU</span>
            <span className="text-xl font-bold text-emerald-700">{stats.mouSigned}</span>
          </div>
          <div className="bg-surface-card p-4 rounded-xl border border-border">
            <span className="text-caption text-text-muted block">Tổng GT dự kiến</span>
            <span className="text-xl font-bold text-brand-primary">
              {stats.totalEstimatedValueMillionVnd.toLocaleString('vi-VN')} Tr
            </span>
          </div>
        </div>
      )}

      {/* Table & Controls */}
      <div className="bg-surface-card rounded-2xl border border-border shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-semibold text-text-primary text-base flex items-center gap-2">
            Danh Sách Cơ Hội Chuyển Giao Công Nghệ
          </h3>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-caption text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={filterSlaOnly}
                onChange={(e) => setFilterSlaOnly(e.target.checked)}
                className="rounded text-brand-primary focus:ring-brand-primary"
              />
              <span className="font-medium text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Chỉ hiện cảnh báo SLA 48h
              </span>
            </label>

            <button
              onClick={fetchGovData}
              className="p-2 rounded-xl border border-border text-text-muted hover:text-text-primary"
              title="Tải lại"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
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
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-caption bg-surface-subtle/40 rounded-xl border border-dashed border-border">
            Chưa có cơ hội hợp tác nào phát sinh trong địa bàn.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-caption text-left">
              <thead className="bg-surface-subtle border-y border-border text-text-muted font-medium">
                <tr>
                  <th className="py-3 px-4">Mã Deal</th>
                  <th className="py-3 px-4">Tiêu Đề & Cặp Đối Tác</th>
                  <th className="py-3 px-4">Địa Bàn</th>
                  <th className="py-3 px-4">Chuyên Gia Giám Sát</th>
                  <th className="py-3 px-4">Giai Đoạn</th>
                  <th className="py-3 px-4">Giá Trị Dự Kiến</th>
                  <th className="py-3 px-4">Cảnh Báo SLA</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((opp) => (
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
                      {opp.managingAuthorityId || 'HN'}
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
                      {opp.estimatedValueMillionVnd
                        ? `${opp.estimatedValueMillionVnd.toLocaleString('vi-VN')} Tr`
                        : '---'}
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
                      <Link
                        href={`/portal/opportunities/${opp.id}/deal-room`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-brand-primary hover:bg-surface-elevated font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Giám sát Deal Room
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
