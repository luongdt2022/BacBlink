'use client';

import React, { useState } from 'react';
import { X, Send, ShieldCheck, Sparkles, Building2, AlertCircle } from 'lucide-react';
import { MatchCandidate } from '@/types/brokerage';
import { brokerageApi } from '@/services/api/brokerage';
import { authClient } from '@/lib/auth-client';

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
  const [senderOrgName, setSenderOrgName] = useState(
    () => authClient.getUser()?.organizationName || ''
  );
  const [senderRole, setSenderRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [proposedBudget, setProposedBudget] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !candidate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedOrgName = senderOrgName.trim();
    if (trimmedOrgName.length < 3) {
      setError('Tên tổ chức gửi yêu cầu phải có ít nhất 3 ký tự.');
      return;
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 10) {
      setError('Nội dung đề xuất hợp tác phải có ít nhất 10 ký tự.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await brokerageApi.createConnectionRequest({
        demandId: candidate.demandId,
        offerId: candidate.offerId,
        senderOrgName: trimmedOrgName,
        senderRole,
        receiverOrgName:
          senderRole === 'BUYER' ? candidate.sellerOrganizationName : candidate.buyerOrganizationName,
        message: trimmedMessage,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Khởi tạo Yêu cầu Kết nối Cung–Cầu
              </h3>
              <p className="text-caption text-slate-500 dark:text-slate-400">
                Mã ghép nối: {candidate.id.slice(0, 8)} • Điểm khớp: {candidate.matchScore}%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 bg-white dark:bg-slate-900">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-caption flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Cặp Cung - Cầu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="space-y-1">
              <span className="text-caption font-medium text-brand-700 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Bên Mua (Nhu cầu)
              </span>
              <p className="text-caption font-semibold text-slate-900 dark:text-white line-clamp-1">
                {candidate.buyerOrganizationName}
              </p>
              <p className="text-caption text-slate-500 dark:text-slate-400 line-clamp-2">
                {candidate.demandTitle}
              </p>
            </div>

            <div className="space-y-1 md:border-l md:border-slate-200 dark:md:border-slate-700 md:pl-4">
              <span className="text-caption font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Bên Bán (Giải pháp)
              </span>
              <p className="text-caption font-semibold text-slate-900 dark:text-white line-clamp-1">
                {candidate.sellerOrganizationName}
              </p>
              <p className="text-caption text-slate-500 dark:text-slate-400 line-clamp-2">
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
                Tổ chức gửi yêu cầu <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={senderOrgName}
                onChange={(e) => setSenderOrgName(e.target.value)}
                placeholder="Nhập tên doanh nghiệp hoặc viện/trường..."
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
              placeholder="Ví dụ: 500 triệu - 1 tỷ VNĐ hoặc Thỏa thuận"
              className="form-control w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-caption font-medium text-text-secondary mb-1.5">
              Nội dung đề xuất hợp tác / Câu hỏi ban đầu <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mô tả mục tiêu kết nối, nhu cầu thử nghiệm hoặc đề xuất hợp tác..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-caption focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-700 resize-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 px-5 rounded-control border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-6 rounded-control bg-brand-700 text-white hover:bg-brand-800 text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
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
