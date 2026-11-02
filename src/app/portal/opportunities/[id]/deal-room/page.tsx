'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ChevronRight,
  Building2,
  Sparkles,
  UserCheck,
  Phone,
  Mail,
  Send,
  FileSignature,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  ArrowLeft,
  Lock,
  Handshake,
  CheckCheck,
  Award,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DealRoomData, DealDiscussion, MouAgreement } from '@/types/brokerage';
import { brokerageApi } from '@/services/api/brokerage';
import MouModal from './MouModal';
import { SectorBannerBackground } from "@/components/enterprise/SectorBannerBackground";
import { useToast } from '@/components/common/toast';
import { authClient } from '@/lib/auth-client';
import OrderTrackingStepper, { OrderStepStatus } from '@/components/demand/OrderTrackingStepper';

export default function DealRoomPage() {
  const params = useParams();
  const id = params?.id as string;
  const toast = useToast();

  const [data, setData] = useState<DealRoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Discussion Form
  const [senderName, setSenderName] = useState(() => authClient.getUser()?.fullName || '');
  const [senderRole, setSenderRole] = useState<'BUYER' | 'SELLER' | 'EXPERT'>('BUYER');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Mou Modal
  const [isMouOpen, setIsMouOpen] = useState(false);

  const fetchDealRoom = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await brokerageApi.getDealRoomDetails(id);
      setData(res);
      // Cập nhật tên nếu chưa có
      if (!senderName) {
        const currentUser = authClient.getUser();
        if (currentUser?.fullName) {
          setSenderName(currentUser.fullName);
        } else if (res.opportunity.buyerContactName) {
          setSenderName(res.opportunity.buyerContactName);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải phòng đàm phán.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDealRoom();
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !id) return;

    setIsSending(true);
    try {
      await brokerageApi.postDealDiscussion(id, {
        senderName: senderName.trim(),
        senderRole,
        message: message.trim(),
      });
      setMessage('');
      toast.success('Đã gửi thông điệp đàm phán thành công.', 'Gửi Tin Nhắn');
      await fetchDealRoom();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi gửi tin nhắn.', 'Gửi Tin Nhắn Thất Bại');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-subtle p-6 space-y-6">
        <div className="h-20 bg-surface-card rounded-2xl animate-pulse" />
        <div className="h-32 bg-surface-card rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-surface-card rounded-2xl animate-pulse" />
          <div className="lg:col-span-2 h-96 bg-surface-card rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-surface-subtle p-6 flex items-center justify-center">
        <div className="bg-surface-card p-8 rounded-2xl border border-border text-center space-y-4 max-w-md shadow-lg">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h2 className="text-lg font-bold text-text-primary">Không thể truy cập Deal Room</h2>
          <p className="text-caption text-text-muted">{error || 'Không tìm thấy dữ liệu.'}</p>
          <Link
            href="/portal/opportunities/pipeline"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-caption font-medium hover:bg-brand-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Pipeline
          </Link>
        </div>
      </div>
    );
  }

  const { opportunity, discussions, mou } = data;

  // Ánh xạ trạng thái hiển thị Stepper 4 bước
  const mappedOrderStepStatus: OrderStepStatus = (() => {
    const s = opportunity.stage?.toUpperCase();
    if (s === 'COMPLETED' || s === 'MOU_SIGNED') return 'COMPLETED';
    if (s === 'NEGOTIATING') return 'NEGOTIATING';
    if (s === 'INITIATED') return 'PROCESSING';
    return 'PROCESSING';
  })();

  const isCompleted = mou?.status === 'SIGNED' || opportunity.stage === 'MOU_SIGNED' || opportunity.stage === 'COMPLETED';

  return (
    <div className="min-h-screen bg-surface-subtle p-6 space-y-6">
      {/* 1. Top Banner với Watermark bảo chứng chuyển giao công nghệ */}
      <div className="relative overflow-hidden bg-brand-700 text-white p-6 rounded-2xl border border-brand-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectorBannerBackground sectorCode={(opportunity as any).sectorCode} opacity={0.4} />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/80 via-brand-900/60 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-caption text-teal-200 mb-1">
            <Link href="/portal/opportunities/pipeline" className="hover:text-white transition-colors">
              Pipeline Cơ Hội
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-bold">{opportunity.opportunityCode}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Phòng Đàm Phán & Chuyển Giao 1-1 (Secure Deal Room)
          </h1>
          <p className="text-caption text-slate-200 mt-1">
            Mã cơ hội: <strong className="text-white font-mono">{opportunity.opportunityCode}</strong> • Giai đoạn:{' '}
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-caption backdrop-blur-sm border ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : 'bg-white/20 text-teal-200 border-white/20'
            }`}>
              {opportunity.stage}
            </span>
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMouOpen(true)}
            className={`px-4 py-2.5 rounded-xl text-white text-caption font-bold flex items-center gap-2 shadow-sm transition-all ${
              isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-500 ring-2 ring-emerald-300/30'
                : 'bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02]'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            {isCompleted ? 'Xem Biên Bản MOU Đã Ký' : 'Soạn & Ký Kết MOU (Hoàn Tất)'}
          </button>
          <Link
            href="/portal/opportunities/pipeline"
            className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-caption font-medium flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Pipeline
          </Link>
        </div>
      </div>

      {/* 2. Stepper 4 Bước & Hướng Dẫn Hành Động Chuyển Giao */}
      <div className="bg-surface-card rounded-2xl border border-border p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider flex items-center gap-2">
              <Handshake className="w-4 h-4 text-brand-primary" /> Tiến Trình Giao Dịch & Đàm Phán (4 Bước)
            </h3>
            <p className="text-caption text-text-muted mt-0.5">
              Hệ thống đồng bộ tự động giữa Đơn hàng của Bên Mua, Phiếu xử lý của Bên Bán và Thỏa thuận Deal Room.
            </p>
          </div>

          {/* Badge trạng thái hoàn tất */}
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-caption font-bold">
                <CheckCheck className="w-4 h-4" />
                ĐÃ HOÀN TẤT THƯƠNG VỤ (BƯỚC 4)
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsMouOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-caption font-bold shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Ký Kết MOU Để Hoàn Tất
              </button>
            )}
          </div>
        </div>

        {/* Thanh Stepper chuẩn */}
        <div className="pt-2">
          <OrderTrackingStepper status={mappedOrderStepStatus} compact={false} />
        </div>

        {/* Hướng dẫn khi nào chuyển sang kết thúc */}
        <div className="p-3.5 rounded-xl bg-surface-subtle border border-border text-xs text-text-secondary flex items-start gap-2.5">
          <Award className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="text-text-primary">Quy định kết thúc & hoàn tất giao dịch:</strong>
            <p className="text-text-muted">
              {isCompleted ? (
                <>Giao dịch đã được ghi nhận <strong>hoàn tất thành công (Bước 4: Hoàn tất)</strong>. Cả Bên Mua và Bên Bán đều đã có hiệu lực cam kết triển khai theo Biên bản ghi nhớ MOU.</>
              ) : (
                <>Giao dịch hiện đang ở <strong>Bước 3 (Thương thảo hợp đồng & điều khoản)</strong>. Khi hai bên đã thống nhất các điều khoản, bấm vào nút <strong>&quot;Soạn & Ký Kết MOU&quot;</strong> và chọn <strong>&quot;Ký Kết Chính Thức (Bước 4: Hoàn Tất)&quot;</strong> để kết thúc tiến trình đàm phán.</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Layout 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Stakeholders Info & MOU Summary */}
        <div className="space-y-6">
          {/* Card: Parties Details */}
          <div className="bg-surface-card rounded-2xl border border-border p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-text-primary text-caption uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Các Bên Tham Gia Đàm Phán
            </h3>

            {/* Bên Mua */}
            <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-2.5">
              <div className="flex items-center justify-between text-caption font-bold text-brand-primary">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> BÊN MUA (DOANH NGHIỆP)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary">
                  BUYER
                </span>
              </div>
              <p className="text-sm font-bold text-text-primary">{opportunity.buyerOrgName}</p>
              <div className="text-caption text-text-secondary space-y-1.5 pt-2 border-t border-border">
                <p className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span>Đại diện: <strong>{opportunity.buyerContactName}</strong></span>
                </p>
                <p className="flex items-center gap-2 text-brand-primary font-medium">
                  <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span>{opportunity.buyerContactPhone}</span>
                </p>
                <p className="flex items-center gap-2 text-brand-primary font-medium">
                  <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span>{opportunity.buyerContactEmail}</span>
                </p>
              </div>
            </div>

            {/* Bên Bán */}
            <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-2.5">
              <div className="flex items-center justify-between text-caption font-bold text-emerald-600">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> BÊN BÁN (ĐƠN VỊ CÔNG NGHỆ)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700">
                  SELLER
                </span>
              </div>
              <p className="text-sm font-bold text-text-primary">{opportunity.sellerOrgName}</p>
              <div className="text-caption text-text-secondary space-y-1.5 pt-2 border-t border-border">
                <p className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span>Đại diện: <strong>{opportunity.sellerContactName}</strong></span>
                </p>
                <p className="flex items-center gap-2 text-emerald-700 font-medium">
                  <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span>{opportunity.sellerContactPhone}</span>
                </p>
                <p className="flex items-center gap-2 text-emerald-700 font-medium">
                  <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span>{opportunity.sellerContactEmail}</span>
                </p>
              </div>
            </div>

            {/* Chuyên gia cố vấn */}
            {opportunity.assignedExpertName && (
              <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/20 space-y-1.5 text-caption">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-primary flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" /> CHUYÊN GIA CỐ VẤN ĐỘC LẬP
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700">
                    EXPERT
                  </span>
                </div>
                <p className="font-bold text-text-primary text-sm">{opportunity.assignedExpertName}</p>
                <p className="text-text-muted text-caption">Hỗ trợ thẩm định công nghệ và cố vấn phương án thử nghiệm thực tế.</p>
              </div>
            )}
          </div>

          {/* Card: MOU Agreement Status */}
          <div className="bg-surface-card rounded-2xl border border-border p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary text-caption uppercase tracking-wider flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-brand-primary" /> Biên Bản Ghi Nhớ MOU
              </h3>
              {mou && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-caption font-bold ${
                    mou.status === 'SIGNED'
                      ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                  }`}
                >
                  {mou.status === 'SIGNED' ? 'ĐÃ KÝ KẾT' : 'DỰ THẢO'}
                </span>
              )}
            </div>

            {mou ? (
              <div className="space-y-3 text-caption">
                <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-1.5">
                  <p className="font-bold text-text-primary">Mã văn bản: <span className="font-mono">{mou.mouCode}</span></p>
                  <p className="text-text-secondary">Thời gian thử nghiệm: <strong>{mou.pilotDurationMonths} tháng</strong></p>
                  {mou.signedDate && (
                    <p className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ngày ký: {new Date(mou.signedDate).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-text-muted font-bold text-xs">Phạm vi công việc đã thỏa thuận:</span>
                  <p className="text-text-secondary line-clamp-3 bg-surface-subtle p-3 rounded-xl border border-border text-xs leading-relaxed">
                    {mou.scopeOfWork}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMouOpen(true)}
                  className={`w-full py-2.5 rounded-xl font-bold text-caption transition-colors flex items-center justify-center gap-1.5 ${
                    mou.status === 'SIGNED'
                      ? 'border border-border text-brand-primary hover:bg-surface-elevated'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                  }`}
                >
                  <FileSignature className="w-4 h-4" />
                  {mou.status === 'SIGNED' ? 'Xem Toàn Văn Bản Ký' : 'Ký Kết Chính Thức Ngay'}
                </button>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-border rounded-xl space-y-3">
                <FileText className="w-8 h-8 text-text-muted mx-auto" />
                <p className="text-caption text-text-muted">Chưa có biên bản ghi nhớ nào được lập.</p>
                <button
                  type="button"
                  onClick={() => setIsMouOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-caption font-bold shadow-xs transition-colors"
                >
                  Soạn Thảo & Ký MOU
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Discussion Thread 1-1 */}
        <div className="lg:col-span-2 bg-surface-card rounded-2xl border border-border p-6 shadow-sm flex flex-col space-y-4 min-h-[620px]">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="font-bold text-text-primary text-base">
                {opportunity.assignedExpertName ? 'Nhật Ký Đàm Phán & Thảo Luận 3 Bên' : 'Nhật Ký Đàm Phán & Thảo Luận 1-1'}
              </h3>
              <p className="text-caption text-text-muted mt-0.5">
                {opportunity.assignedExpertName
                  ? 'Kênh bảo mật kết nối trực tiếp Bên Mua, Bên Bán và Chuyên gia đồng hành.'
                  : 'Kênh bảo mật kết nối trực tiếp 1-1 giữa Bên Mua và Bên Bán.'}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-caption font-medium bg-surface-subtle border border-border text-text-muted">
              {discussions.length} tin nhắn
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[460px] pr-2">
            {discussions.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-caption text-text-muted space-y-2">
                <Handshake className="w-10 h-10 text-border" />
                <p className="font-medium">Chưa có trao đổi nào trong phòng đàm phán.</p>
                <p className="text-xs">Hãy gửi lời chào hoặc đặt câu hỏi đầu tiên để bắt đầu thảo luận điều khoản.</p>
              </div>
            ) : (
              discussions.map((msg) => {
                const isBuyer = msg.senderRole === 'BUYER';
                const isSeller = msg.senderRole === 'SELLER';
                const isExpert = msg.senderRole === 'EXPERT';

                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border space-y-2 transition-all ${
                      isBuyer
                        ? 'bg-brand-primary/5 border-brand-primary/20'
                        : isSeller
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-amber-500/5 border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-caption">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                            isBuyer ? 'bg-brand-primary' : isSeller ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}
                        >
                          {isBuyer ? 'BM' : isSeller ? 'BB' : 'CG'}
                        </div>
                        <span className="font-bold text-text-primary text-sm">{msg.senderName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isBuyer
                              ? 'bg-brand-primary/10 text-brand-primary'
                              : isSeller
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {isBuyer ? 'BÊN MUA' : isSeller ? 'BÊN BÁN' : 'CHUYÊN GIA'}
                        </span>
                      </div>
                      <span className="text-text-muted text-xs">
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-caption text-text-secondary leading-relaxed whitespace-pre-wrap pl-9">
                      {msg.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input Box with Synchronized Form Controls */}
          <form onSubmit={handleSendMessage} className="pt-4 border-t border-border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-caption font-bold text-text-secondary mb-1">
                  Đại diện phát biểu
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Họ tên người gửi..."
                  className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border text-caption font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-caption font-bold text-text-secondary mb-1">
                  Tư cách / Vai trò phát biểu
                </label>
                <select
                  value={senderRole}
                  onChange={(e) => setSenderRole(e.target.value as any)}
                  className="w-full h-10 px-3.5 rounded-xl bg-surface-subtle border border-border text-caption font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all cursor-pointer shadow-xs"
                >
                  <option value="BUYER">Bên Mua (Doanh nghiệp)</option>
                  <option value="SELLER">Bên Bán (Đơn vị công nghệ)</option>
                  {opportunity.assignedExpertName && (
                    <option value="EXPERT">Chuyên gia cố vấn</option>
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập nội dung trao đổi, câu hỏi kỹ thuật hoặc phản hồi về hợp đồng... (Ctrl + Enter để gửi)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-subtle border border-border text-caption text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-none transition-all shadow-xs"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-text-muted">
                  Mẹo: Nhấn <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-[10px] font-mono">Ctrl + Enter</kbd> để gửi tin nhắn nhanh.
                </span>
                <button
                  type="submit"
                  disabled={isSending || !message.trim()}
                  className="px-5 py-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 text-caption font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> Gửi Tin Nhắn
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* MOU Modal */}
      <MouModal
        isOpen={isMouOpen}
        opportunity={opportunity}
        existingMou={mou}
        onClose={() => setIsMouOpen(false)}
        onSuccess={() => {
          fetchDealRoom();
        }}
      />
    </div>
  );
}
