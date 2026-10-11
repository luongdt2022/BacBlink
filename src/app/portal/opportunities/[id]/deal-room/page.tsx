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
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DealRoomData, DealDiscussion, MouAgreement } from '@/types/brokerage';
import { brokerageApi } from '@/services/api/brokerage';
import MouModal from './MouModal';

export default function DealRoomPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<DealRoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Discussion Form
  const [senderName, setSenderName] = useState('Kỹ sư Vũ Quang Hải');
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
      await fetchDealRoom();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi tin nhắn.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-subtle p-6 space-y-6">
        <div className="h-20 bg-surface-card rounded-2xl animate-pulse" />
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
        <div className="bg-surface-card p-8 rounded-2xl border border-border text-center space-y-4 max-w-md">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h2 className="text-lg font-bold text-text-primary">Không thể truy cập Deal Room</h2>
          <p className="text-caption text-text-muted">{error || 'Không tìm thấy dữ liệu.'}</p>
          <Link
            href="/portal/opportunities/pipeline"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-caption font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Pipeline
          </Link>
        </div>
      </div>
    );
  }

  const { opportunity, discussions, mou } = data;

  return (
    <div className="min-h-screen bg-surface-subtle p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-surface-card p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-caption text-text-muted mb-1">
            <Link href="/portal/opportunities/pipeline" className="hover:text-text-primary">
              Pipeline Cơ Hội
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-primary font-medium">{opportunity.opportunityCode}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Phòng Đàm Phán & Chuyển Giao 1-1 (Secure Deal Room)
          </h1>
          <p className="text-caption text-text-muted mt-1">
            Mã cơ hội: <strong className="text-text-primary">{opportunity.opportunityCode}</strong> • Giai đoạn:{' '}
            <span className="px-2 py-0.5 rounded-full font-bold bg-brand-primary/10 text-brand-primary text-caption">
              {opportunity.stage}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMouOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 text-caption font-medium flex items-center gap-2 shadow-sm transition-colors"
          >
            <FileSignature className="w-4 h-4" />
            {mou ? 'Xem & Cập Nhật MOU' : 'Soạn Thảo Biên Bản MOU'}
          </button>
          <Link
            href="/portal/opportunities/pipeline"
            className="px-4 py-2.5 rounded-xl border border-border bg-surface-card hover:bg-surface-elevated text-text-secondary text-caption font-medium flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Pipeline
          </Link>
        </div>
      </div>

      {/* Main Layout 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Stakeholders Info & MOU Summary */}
        <div className="space-y-6">
          {/* Card: Parties Details (PDPD Unmasked in Room) */}
          <div className="bg-surface-card rounded-2xl border border-border p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-text-primary text-caption uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Các Bên Tham Gia Đàm Phán
            </h3>

            {/* Bên Mua */}
            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-2">
              <div className="flex items-center justify-between text-caption font-bold text-brand-primary">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> BÊN MUA (DOANH NGHIỆP)
                </span>
              </div>
              <p className="text-caption font-semibold text-text-primary">{opportunity.buyerOrgName}</p>
              <div className="text-caption text-text-secondary space-y-1 pt-1 border-t border-border/60">
                <p className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-text-muted" /> Đại diện: {opportunity.buyerContactName}
                </p>
                <p className="flex items-center gap-2 text-brand-primary">
                  <Phone className="w-3.5 h-3.5 text-text-muted" /> {opportunity.buyerContactPhone}
                </p>
                <p className="flex items-center gap-2 text-brand-primary">
                  <Mail className="w-3.5 h-3.5 text-text-muted" /> {opportunity.buyerContactEmail}
                </p>
              </div>
            </div>

            {/* Bên Bán */}
            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-2">
              <div className="flex items-center justify-between text-caption font-bold text-emerald-600">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> BÊN BÁN (ĐƠN VỊ CÔNG NGHỆ)
                </span>
              </div>
              <p className="text-caption font-semibold text-text-primary">{opportunity.sellerOrgName}</p>
              <div className="text-caption text-text-secondary space-y-1 pt-1 border-t border-border/60">
                <p className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-text-muted" /> Đại diện: {opportunity.sellerContactName}
                </p>
                <p className="flex items-center gap-2 text-emerald-700">
                  <Phone className="w-3.5 h-3.5 text-text-muted" /> {opportunity.sellerContactPhone}
                </p>
                <p className="flex items-center gap-2 text-emerald-700">
                  <Mail className="w-3.5 h-3.5 text-text-muted" /> {opportunity.sellerContactEmail}
                </p>
              </div>
            </div>

            {/* Chuyên gia cố vấn */}
            {opportunity.assignedExpertName && (
              <div className="p-3.5 rounded-xl bg-brand-primary/5 border border-brand-primary/20 space-y-1 text-caption">
                <span className="font-bold text-brand-primary flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" /> CHUYÊN GIA CỐ VẤN ĐỘC LẬP
                </span>
                <p className="font-semibold text-text-primary">{opportunity.assignedExpertName}</p>
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
                  className={`px-2 py-0.5 rounded-full text-caption font-bold ${
                    mou.status === 'SIGNED'
                      ? 'bg-emerald-500/10 text-emerald-700'
                      : 'bg-amber-500/10 text-amber-700'
                  }`}
                >
                  {mou.status === 'SIGNED' ? 'ĐÃ KÝ KẾT' : 'DỰ THẢO'}
                </span>
              )}
            </div>

            {mou ? (
              <div className="space-y-3 text-caption">
                <div className="p-3 rounded-xl bg-surface-subtle border border-border space-y-1">
                  <p className="font-semibold text-text-primary">Mã văn bản: {mou.mouCode}</p>
                  <p className="text-text-muted">Thời gian thử nghiệm: {mou.pilotDurationMonths} tháng</p>
                  {mou.signedDate && (
                    <p className="text-emerald-700 font-medium">
                      Ngày ký: {new Date(mou.signedDate).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-text-muted font-medium">Phạm vi công việc:</span>
                  <p className="text-text-secondary line-clamp-3 bg-surface-subtle p-2.5 rounded-lg border border-border">
                    {mou.scopeOfWork}
                  </p>
                </div>

                <button
                  onClick={() => setIsMouOpen(true)}
                  className="w-full py-2 rounded-xl border border-border text-brand-primary font-medium hover:bg-surface-elevated text-caption transition-colors"
                >
                  Xem Toàn Văn Thỏa Thuận
                </button>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-border rounded-xl space-y-2">
                <FileText className="w-8 h-8 text-text-muted mx-auto" />
                <p className="text-caption text-text-muted">Chưa có biên bản ghi nhớ nào được lập.</p>
                <button
                  onClick={() => setIsMouOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-primary text-white text-caption font-medium hover:bg-brand-primary/90"
                >
                  Soạn thảo ngay
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Discussion Thread 1-1 */}
        <div className="lg:col-span-2 bg-surface-card rounded-2xl border border-border p-6 shadow-sm flex flex-col space-y-4 min-h-[600px]">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="font-bold text-text-primary text-base">
                Nhật Ký Đàm Phán & Thảo Luận 3 Bên
              </h3>
              <p className="text-caption text-text-muted">
                Kênh bảo mật kết nối trực tiếp Bên Mua, Bên Bán và Chuyên gia đồng hành.
              </p>
            </div>
            <span className="text-caption text-text-muted">{discussions.length} tin nhắn</span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[460px] pr-2">
            {discussions.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-caption text-text-muted">
                Chưa có trao đổi nào. Hãy gửi lời chào hoặc đặt câu hỏi đầu tiên.
              </div>
            ) : (
              discussions.map((msg) => {
                const isBuyer = msg.senderRole === 'BUYER';
                const isSeller = msg.senderRole === 'SELLER';
                const isExpert = msg.senderRole === 'EXPERT';

                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border space-y-1.5 ${
                      isBuyer
                        ? 'bg-brand-primary/5 border-brand-primary/20'
                        : isSeller
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-amber-500/5 border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-caption">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">{msg.senderName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-caption font-bold ${
                            isBuyer
                              ? 'bg-brand-primary/10 text-brand-primary'
                              : isSeller
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isBuyer ? 'BÊN MUA' : isSeller ? 'BÊN BÁN' : 'CHUYÊN GIA'}
                        </span>
                      </div>
                      <span className="text-text-muted text-caption">
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-caption text-text-secondary leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="pt-4 border-t border-border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-caption font-medium text-text-muted mb-1">
                  Đại diện phát biểu
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-surface-subtle border border-border text-caption text-text-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-caption font-medium text-text-muted mb-1">
                  Vai trò
                </label>
                <select
                  value={senderRole}
                  onChange={(e) => setSenderRole(e.target.value as any)}
                  className="form-control w-full text-sm font-medium"
                >
                  <option value="BUYER">Bên Mua (Doanh nghiệp)</option>
                  <option value="SELLER">Bên Bán (Đơn vị công nghệ)</option>
                  <option value="EXPERT">Chuyên gia cố vấn</option>
                </select>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <textarea
                required
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập nội dung trao đổi, câu hỏi kỹ thuật hoặc phản hồi về kế hoạch..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-surface-subtle border border-border text-caption text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
              />
              <button
                type="submit"
                disabled={isSending || !message.trim()}
                className="px-4 py-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 text-caption font-medium flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 shrink-0 h-[46px]"
              >
                <Send className="w-4 h-4" /> Gửi
              </button>
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
