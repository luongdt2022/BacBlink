'use client';

import React, { useState } from 'react';
import { X, Send, ShieldCheck, Lock, Sparkles, Building2, AlertCircle } from 'lucide-react';
import { MatchCandidate } from '@/types/brokerage';
import { brokerageApi } from '@/services/api/brokerage';

interface ConnectionRequestModalProps {
  isOpen: boolean;
  candidate: MatchCandidate | null;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export default function ConnectionRequestModal({
  isOpen,
  candidate,
  onClose,
  onSuccess,
}: ConnectionRequestModalProps) {
  const [senderOrgName, setSenderOrgName] = useState('Công ty CP Nông Nghiệp Xanh Hà Nội');
  const [senderRole, setSenderRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [proposedBudget, setProposedBudget] = useState('800 triệu - 1.2 tỷ VNĐ');
  const [message, setMessage] = useState(
    'Chúng tôi quan tâm sâu sắc tới công nghệ này và muốn kết nối để thảo luận thử nghiệm pilot trong quý tới.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !candidate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await brokerageApi.createConnectionRequest({
        demandId: candidate.demandId,
        offerId: candidate.offerId,
        senderOrgName: senderOrgName.trim(),
        senderRole,
        receiverOrgName:
          senderRole === 'BUYER' ? candidate.sellerOrganizationName : candidate.buyerOrganizationName,
        message: message.trim(),
        proposedBudgetRange: proposedBudget.trim(),
      });
      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gửi yêu cầu kết nối.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-surface-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-base">
                Khởi tạo Yêu cầu Kết nối Cung–Cầu
              </h3>
              <p className="text-caption text-text-muted">
                Mã ghép nối: {candidate.id.slice(0, 8)} • Điểm khớp: {candidate.matchScore}%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-caption flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Cặp Cung - Cầu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-subtle border border-border">
            <div className="space-y-1">
              <span className="text-caption font-medium text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Bên Mua (Nhu cầu)
              </span>
              <p className="text-caption font-semibold text-text-primary line-clamp-1">
                {candidate.buyerOrganizationName}
              </p>
              <p className="text-caption text-text-muted line-clamp-2">
                {candidate.demandTitle}
              </p>
            </div>

            <div className="space-y-1 md:border-l md:border-border md:pl-4">
              <span className="text-caption font-medium text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Bên Bán (Giải pháp)
              </span>
              <p className="text-caption font-semibold text-text-primary line-clamp-1">
                {candidate.sellerOrganizationName}
              </p>
              <p className="text-caption text-text-muted line-clamp-2">
                {candidate.offerTitle}
              </p>
            </div>
          </div>

          {/* Cảnh báo bảo mật PDPD */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-caption flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Tuân thủ Nghị định 13/2023/NĐ-CP (PDPD):</span>
              <p className="mt-0.5 text-text-muted">
                Số điện thoại và Email trực tiếp của hai bên sẽ được ẩn danh (09****1234, a***@company.vn) cho đến khi đối tác phê duyệt chấp thuận kết nối hoặc bước vào Deal Room bảo mật.
              </p>
            </div>
          </div>

          {/* Thông tin bên gửi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-medium text-text-secondary mb-1.5">
                Tổ chức gửi yêu cầu
              </label>
              <input
                type="text"
                required
                value={senderOrgName}
                onChange={(e) => setSenderOrgName(e.target.value)}
                className="form-control w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-caption font-medium text-text-secondary mb-1.5">
                Vai trò của bạn
              </label>
              <select
                value={senderRole}
                onChange={(e) => setSenderRole(e.target.value as any)}
                className="form-control w-full text-sm font-medium"
              >
                <option value="BUYER">Bên Mua (Doanh nghiệp cần giải pháp)</option>
                <option value="SELLER">Bên Bán (Đơn vị cung cấp công nghệ)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-caption font-medium text-text-secondary mb-1.5">
              Khoảng ngân sách dự kiến đề xuất
            </label>
            <input
              type="text"
              value={proposedBudget}
              onChange={(e) => setProposedBudget(e.target.value)}
              placeholder="VD: 500 triệu - 1 tỷ VNĐ"
              className="form-control w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-caption font-medium text-text-secondary mb-1.5">
              Nội dung đề xuất hợp tác / Câu hỏi ban đầu
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mô tả mục tiêu thử nghiệm, bối cảnh bài toán và mong muốn phối hợp..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border text-text-primary text-caption focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 px-5 rounded-control border border-border text-text-secondary hover:bg-surface-elevated text-sm font-medium transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-6 rounded-control bg-brand-primary text-white hover:bg-brand-primary/90 text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Đang gửi yêu cầu...</>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Gửi Yêu Cầu Kết Nối
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
