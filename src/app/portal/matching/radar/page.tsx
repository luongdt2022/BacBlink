'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Cpu,
  RefreshCw,
  Award,
  Layers,
  ChevronRight,
  Send,
  Kanban,
} from 'lucide-react';
import Link from 'next/link';
import { MatchCandidate, ConnectionRequest } from '@/types/brokerage';
import { brokerageApi } from '@/services/api/brokerage';
import ConnectionRequestModal from './ConnectionRequestModal';

export default function MatchingRadarPage() {
  const [activeTab, setActiveTab] = useState<'RADAR' | 'REQUESTS'>('RADAR');
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [sector, setSector] = useState('ALL');
  const [minScore, setMinScore] = useState<number>(0);
  const [search, setSearch] = useState('');

  // Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<MatchCandidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

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
    fetchRadarData();
  }, [activeTab, sector, minScore]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRadarData();
  };

  const handleRespondRequest = async (id: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      const res = await brokerageApi.respondConnectionRequest(id, action);
      setActionSuccessMsg(
        action === 'ACCEPT'
          ? `Đã chấp thuận kết nối! Đã khởi tạo Cơ hội đàm phán trong Pipeline.`
          : 'Đã từ chối yêu cầu kết nối.'
      );
      fetchRadarData();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi phản hồi yêu cầu.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-subtle p-6 space-y-6">
      {/* Top Breadcrumb & Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-caption text-text-muted mb-1">
            <span>Sàn Giao dịch & Kết nối</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-primary font-medium">Radar Ghép Nối Cung–Cầu</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-brand-primary" />
            Radar Ghép Nối Cung–Cầu & Điểm Tương Thích
          </h1>
          <p className="text-caption text-text-muted mt-1 max-w-2xl">
            Hệ thống định lượng tương thích tự động dựa trên ma trận 10 lĩnh vực trọng điểm (TT 17/2019), độ sẵn sàng TRL, chỉ số cấp thiết TNI và xác thực Sở hữu trí tuệ.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portal/opportunities/pipeline"
            className="px-4 py-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 text-caption font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Kanban className="w-4 h-4" /> Pipeline Cơ Hội (Kanban)
          </Link>
          <Link
            href="/gov/opportunities"
            className="px-4 py-2.5 rounded-xl border border-border bg-surface-card hover:bg-surface-elevated text-text-secondary text-caption font-medium flex items-center gap-2 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Cổng Giám Sát Sở KH&CN
          </Link>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('RADAR')}
          className={`pb-3 px-4 text-caption font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'RADAR'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Ứng Viên Ghép Đôi AI ({candidates.length})
        </button>
        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`pb-3 px-4 text-caption font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'REQUESTS'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Clock className="w-4 h-4" />
          Yêu Cầu Kết Nối Đã Gửi / Nhận ({requests.length})
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-caption flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <Link
            href="/portal/opportunities/pipeline"
            className="font-semibold underline hover:text-emerald-800"
          >
            Xem Pipeline ngay &rarr;
          </Link>
        </div>
      )}

      {/* TAB 1: RADAR CANDIDATES */}
      {activeTab === 'RADAR' && (
        <>
          {/* Filter Bar */}
          <div className="bg-surface-card p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên nhu cầu, công nghệ hoặc doanh nghiệp..."
                className="form-control w-full pl-10 pr-4 text-sm"
              />
            </form>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-label text-text-muted">Ngành:</span>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="form-control text-sm font-medium"
                >
                  <option value="ALL">Tất cả ngành</option>
                  <option value="LV01">Nông nghiệp công nghệ cao</option>
                  <option value="LV11">Chế tạo máy & Tự động hóa</option>
                  <option value="LV07">Công nghệ môi trường & Xử lý rác</option>
                  <option value="LV14">Y Dược & Thiết bị y tế</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-label text-text-muted">Điểm khớp:</span>
                <select
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="form-control text-sm font-medium"
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
                className="h-11 w-11 flex items-center justify-center rounded-control border border-border text-text-muted hover:text-text-primary hover:bg-surface-subtle shrink-0"
                title="Làm mới"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Candidates Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl bg-surface-card border border-border animate-pulse p-6"
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-surface-card rounded-2xl border border-border">
              <p className="text-caption text-rose-600 mb-3">{error}</p>
              <button
                onClick={fetchRadarData}
                className="px-4 py-2 rounded-xl bg-brand-primary text-white text-caption font-medium"
              >
                Thử lại
              </button>
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-12 text-center bg-surface-card rounded-2xl border border-border space-y-3">
              <Sparkles className="w-10 h-10 text-text-muted mx-auto" />
              <h3 className="font-semibold text-text-primary">Không tìm thấy ứng viên ghép đôi phù hợp</h3>
              <p className="text-caption text-text-muted max-w-md mx-auto">
                Hãy thử giảm tiêu chí lọc điểm khớp hoặc mở rộng ngành kỹ thuật để phát hiện thêm cơ hội mới.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidates.map((c) => (
                <div
                  key={c.id}
                  className="bg-surface-card rounded-2xl border border-border p-6 shadow-sm hover:border-brand-primary/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header Card: Match Score Ring & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-surface-subtle border border-border text-caption font-medium text-text-secondary">
                          {c.sectorCode}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 text-caption font-medium flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5" /> TRL {c.trlLevel}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-brand-primary/10 text-brand-primary text-caption font-medium flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> TNI {c.tniScore}/100
                        </span>
                        {c.ipStatus === 'PATENT_GRANTED' && (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 text-caption font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Có bằng SHTT
                          </span>
                        )}
                      </div>

                      {/* Match Score Badge */}
                      <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
                        <span className="text-base font-bold leading-none">{c.matchScore}%</span>
                        <span className="text-caption uppercase font-semibold mt-0.5 tracking-tight">Khớp</span>
                      </div>
                    </div>

                    {/* Pair Comparison */}
                    <div className="space-y-3 pt-2">
                      {/* Buyer side */}
                      <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-1">
                        <div className="flex items-center justify-between text-caption text-brand-primary font-medium">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" /> BÊN MUA: {c.buyerOrganizationName}
                          </span>
                          <span className="text-text-muted font-normal">{c.demandCode}</span>
                        </div>
                        <p className="text-caption font-semibold text-text-primary line-clamp-2">
                          {c.demandTitle}
                        </p>
                      </div>

                      {/* Seller side */}
                      <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-1">
                        <div className="flex items-center justify-between text-caption text-emerald-600 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> BÊN BÁN: {c.sellerOrganizationName}
                          </span>
                          <span className="text-text-muted font-normal">{c.offerCode}</span>
                        </div>
                        <p className="text-caption font-semibold text-text-primary line-clamp-2">
                          {c.offerTitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-5 mt-4 border-t border-border flex items-center justify-between">
                    <span className="text-caption text-text-muted flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-text-muted" /> Bảo vệ PDPD (Ẩn danh)
                    </span>
                    <button
                      onClick={() => {
                        setSelectedCandidate(c);
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 text-caption font-medium flex items-center gap-2 shadow-sm transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" /> Gửi Yêu Cầu Kết Nối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: CONNECTION REQUESTS */}
      {activeTab === 'REQUESTS' && (
        <div className="bg-surface-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">
              Danh sách Yêu Cầu Kết Nối Hai Chiều
            </h3>
            <button
              onClick={fetchRadarData}
              className="p-2 rounded-xl border border-border text-text-muted hover:text-text-primary"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-surface-subtle animate-pulse" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Clock className="w-8 h-8 text-text-muted mx-auto" />
              <p className="text-caption text-text-muted">Chưa có yêu cầu kết nối nào được tạo.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-text-primary text-caption">
                        {r.requestCode}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-caption font-medium ${
                          r.status === 'ACCEPTED'
                            ? 'bg-emerald-500/10 text-emerald-700'
                            : r.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-700'
                            : 'bg-amber-500/10 text-amber-700'
                        }`}
                      >
                        {r.status === 'ACCEPTED'
                          ? 'ĐÃ CHẤP THUẬN'
                          : r.status === 'REJECTED'
                          ? 'ĐÃ TỪ CHỐI'
                          : 'CHỜ PHẢN HỒI'}
                      </span>
                      <span className="text-caption text-text-muted">
                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <p className="text-caption text-text-secondary">
                      <strong className="text-text-primary">{r.senderOrgName}</strong> ({r.senderRole}) &rarr; <strong className="text-text-primary">{r.receiverOrgName}</strong>
                    </p>
                    <p className="text-caption text-text-muted italic">"{r.message}"</p>
                    {r.proposedBudgetRange && (
                      <p className="text-caption text-brand-primary">
                        Ngân sách đề xuất: {r.proposedBudgetRange}
                      </p>
                    )}
                  </div>

                  {/* Actions for Pending Requests */}
                  {r.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespondRequest(r.id, 'ACCEPT')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-caption font-medium flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Chấp nhận
                      </button>
                      <button
                        onClick={() => handleRespondRequest(r.id, 'REJECT')}
                        className="px-3.5 py-2 rounded-xl border border-border text-rose-600 hover:bg-rose-50 text-caption font-medium flex items-center gap-1.5 transition-colors"
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
