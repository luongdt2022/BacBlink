'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Sparkles,
  ShieldCheck,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Layers,
  Award,
  ArrowRight,
  Handshake,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConnectionRequestDetail } from '@/types/brokerage';
import { brokerageApi } from '@/services/api/brokerage';
import { useToast } from '@/components/common/toast';
import { formatCurrencyMillionVnd } from '@/lib/currency';
import BuyerProfileCard from '@/components/brokerage/BuyerProfileCard';

interface ConnectionRequestDetailModalProps {
  isOpen: boolean;
  requestId: string | null;
  onClose: () => void;
  onResponded: (data: { requestId: string; status: string; createdOpportunityId?: string }) => void;
}

export default function ConnectionRequestDetailModal({
  isOpen,
  requestId,
  onClose,
  onResponded,
}: ConnectionRequestDetailModalProps) {
  const router = useRouter();
  const toast = useToast();

  const [detail, setDetail] = useState<ConnectionRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && requestId) {
      loadDetail(requestId);
      setShowRejectForm(false);
      setRejectionReason('');
      setRejectError(null);
    } else {
      setDetail(null);
    }
  }, [isOpen, requestId]);

  const loadDetail = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await brokerageApi.getConnectionRequestDetail(id);
      setDetail(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết yêu cầu kết nối.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleAccept = async () => {
    if (!detail) return;
    setIsSubmitting(true);
    try {
      const res = await brokerageApi.respondConnectionRequest(detail.id, 'ACCEPT');
      toast.success(
        'Đã chấp thuận kết nối! Deal Room đã được khởi tạo trong Pipeline.',
        'Kết Nối Thành Công'
      );
      onResponded(res);
      // Tải lại chi tiết để hiển thị thông tin unmasked và link Deal Room
      await loadDetail(detail.id);
    } catch (err: any) {
      toast.error(err.message || 'Không thể chấp thuận yêu cầu.', 'Thất Bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;

    const trimmed = rejectionReason.trim();
    if (trimmed.length < 10) {
      setRejectError('Vui lòng cung cấp lý do từ chối với tối thiểu 10 ký tự.');
      return;
    }

    setIsSubmitting(true);
    setRejectError(null);
    try {
      const res = await brokerageApi.respondConnectionRequest(
        detail.id,
        'REJECT',
        undefined,
        trimmed
      );
      toast.info('Đã từ chối yêu cầu kết nối.', 'Đã Từ Chối');
      onResponded(res);
      await loadDetail(detail.id);
      setShowRejectForm(false);
    } catch (err: any) {
      setRejectError(err.message || 'Không thể gửi lý do từ chối.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTrlBadgeColor = (level: number) => {
    if (level >= 7) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800';
    }
    if (level >= 4) {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-cyan-300 flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Chi Tiết Yêu Cầu Kết Nối Cung–Cầu
                </h3>
                {detail && (
                  <span className="font-mono text-xs font-bold text-brand-700 dark:text-cyan-300 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-800">
                    {detail.requestCode}
                  </span>
                )}
              </div>
              <p className="text-caption text-slate-500">
                Thẩm định nhu cầu của bên mua trước khi quyết định mở Deal Room bảo mật
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4 py-8">
              <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 space-y-3">
              <XCircle className="w-10 h-10 mx-auto" />
              <p className="font-bold text-sm">{error}</p>
              <button
                onClick={() => requestId && loadDetail(requestId)}
                className="px-4 py-2 bg-brand-700 text-white rounded-xl text-xs font-bold hover:bg-brand-800"
              >
                Thử lại
              </button>
            </div>
          ) : detail ? (
            <>
              {/* KHỐI 1: SẢN PHẨM / CÔNG NGHỆ CHÀO BÁN MỤC TIÊU */}
              <div className="bg-gradient-to-br from-brand-50/60 to-cyan-50/40 dark:from-slate-800/80 dark:to-cyan-950/20 rounded-2xl border border-brand-200/80 dark:border-cyan-900/60 p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-caption font-black text-brand-700 dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Công Nghệ Mục Tiêu Của Gian Hàng
                  </span>
                  {detail.targetOffer && (
                    <span
                      className={`text-caption font-extrabold px-2.5 py-0.5 rounded-full border ${getTrlBadgeColor(
                        detail.targetOffer.trlLevel
                      )}`}
                    >
                      TRL {detail.targetOffer.trlLevel} • {detail.targetOffer.trlStage}
                    </span>
                  )}
                </div>

                {detail.targetOffer ? (
                  <div className="space-y-2">
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                      {detail.targetOffer.offerTitle}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-mono text-caption bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold">
                        {detail.targetOffer.offerCode}
                      </span>
                      {detail.targetOffer.sectorName && (
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          {detail.targetOffer.sectorName}
                        </span>
                      )}
                      {detail.targetOffer.ipStatus && (
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          SHTT: {detail.targetOffer.ipStatus}
                        </span>
                      )}
                      {detail.targetOffer.priceMillionVnd && (
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                          Giá tham chiếu: {formatCurrencyMillionVnd(detail.targetOffer.priceMillionVnd)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Yêu cầu kết nối này không chỉ định công nghệ cụ thể (Đề xuất hợp tác giao thương toàn diện).
                  </p>
                )}
              </div>

              {/* KHỐI 2: HỒ SƠ PHÁP NHÂN / CÁ NHÂN / CHUYÊN GIA BÊN MUA (POLYMORPHIC PROFILE CARD) */}
              <BuyerProfileCard
                profile={detail.buyerProfile}
                buyerType={detail.buyerType || detail.buyerProfile.buyerType}
              />

              {/* KHỐI 3: ĐỀ XUẤT HỢP TÁC & THÔNG TIN LIÊN HỆ PDPD */}
              <div className="bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                <span className="text-caption font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Handshake className="w-4 h-4 text-emerald-600" /> Đề Xuất Hợp Tác & Kênh Liên Hệ
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Khoảng ngân sách đề xuất:
                    </span>
                    <div className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                      {detail.proposedBudgetRange || 'Thỏa thuận trực tiếp'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-600" /> Thời hạn SLA phản hồi:
                    </span>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {detail.slaDeadline
                        ? new Date(detail.slaDeadline).toLocaleString('vi-VN')
                        : 'Trong vòng 48h làm việc'}
                    </div>
                  </div>
                </div>

                {/* Nội dung trao đổi */}
                <div className="space-y-1.5">
                  <span className="text-caption font-bold text-slate-400 uppercase">
                    Nội dung đề xuất từ bên mua:
                  </span>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {detail.message}
                  </div>
                </div>

                {/* Hộp thoại Bảo vệ dữ liệu cá nhân (PDPD) */}
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-3 ${
                    detail.contactInfo.isMasked
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                      : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div className="space-y-1">
                      <span className="font-extrabold text-xs block">
                        {detail.contactInfo.isMasked
                          ? 'Bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP (PDPD)'
                          : 'Đã mở khóa thông tin liên hệ chính thức (Deal Room Active)'}
                      </span>
                      <p className="text-caption opacity-90 leading-relaxed">
                        {detail.contactInfo.pdpdNotice}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-bold truncate">Họ tên: {detail.contactInfo.contactPersonName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-bold">SĐT: {detail.contactInfo.phoneNumber}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-bold truncate">Email: {detail.contactInfo.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* KHỐI TÁC VỤ PHẢN HỒI (ACTION BARS) */}
              {detail.status === 'PENDING' && (
                <div className="space-y-4 pt-2">
                  {showRejectForm ? (
                    <form
                      onSubmit={handleReject}
                      className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-rose-700 dark:text-rose-300">
                          Nhập lý do từ chối kết nối (Tối thiểu 10 ký tự):
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowRejectForm(false)}
                          className="text-caption text-slate-400 hover:text-slate-600"
                        >
                          Hủy bỏ
                        </button>
                      </div>

                      <textarea
                        value={rejectionReason}
                        onChange={(e) => {
                          setRejectionReason(e.target.value);
                          if (e.target.value.trim().length >= 10) setRejectError(null);
                        }}
                        placeholder="Ví dụ: Công nghệ hiện tại chưa phù hợp với dây chuyền của doanh nghiệp hoặc đã hết công suất tiếp nhận..."
                        rows={3}
                        className="w-full text-xs p-3 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                      />

                      {rejectError && (
                        <p className="text-caption font-bold text-rose-600 dark:text-rose-400">
                          {rejectError}
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowRejectForm(false)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Quay lại
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || rejectionReason.trim().length < 10}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50 transition shadow-sm"
                        >
                          {isSubmitting ? 'Đang gửi...' : 'Xác Nhận Từ Chối'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(true)}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/40 transition"
                      >
                        Từ chối yêu cầu
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleAccept}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 hover:scale-[1.02]"
                      >
                        <Handshake className="w-4 h-4" />
                        {isSubmitting ? 'Đang xử lý...' : 'Chấp Thuận & Mở Deal Room'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {detail.status === 'ACCEPTED' && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200 block">
                        Yêu cầu đã được chấp thuận và Deal Room đã được kích hoạt!
                      </span>
                      <span className="text-caption text-emerald-700 dark:text-emerald-400">
                        Mã Deal: {detail.createdOpportunityCode || 'DEAL-Room Sẵn Sàng'}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/portal/opportunities/${detail.createdOpportunityId || detail.id}/deal-room`}
                    className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition shrink-0"
                  >
                    <span>Truy Cập Deal Room 1-1</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {detail.status === 'REJECTED' && (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>Yêu cầu kết nối này đã bị từ chối</span>
                  </div>
                  {detail.rejectionReason && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic pl-6">
                      Lý do: &ldquo;{detail.rejectionReason}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between">
          <span className="text-caption text-slate-400">
            NacenTwin Sàn Giao Dịch & Môi Giới Công Nghệ
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
