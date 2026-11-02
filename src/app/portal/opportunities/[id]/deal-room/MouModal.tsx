'use client';

import React, { useState } from 'react';
import {
  X,
  FileSignature,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import { Opportunity, MouAgreement } from '@/types/brokerage';
import { brokerageApi } from '@/services/api/brokerage';
import { formatCurrencyMillionVnd } from '@/lib/currency';

interface MouModalProps {
  isOpen: boolean;
  opportunity: Opportunity;
  existingMou: MouAgreement | null;
  onClose: () => void;
  onSuccess: (savedMou: MouAgreement) => void;
}

export default function MouModal({
  isOpen,
  opportunity,
  existingMou,
  onClose,
  onSuccess,
}: MouModalProps) {
  const formattedEstimatedValue = opportunity.estimatedValueMillionVnd
    ? formatCurrencyMillionVnd(opportunity.estimatedValueMillionVnd)
    : 'thỏa thuận theo phụ lục hợp đồng';

  const [scopeOfWork, setScopeOfWork] = useState(
    existingMou?.scopeOfWork ||
      `Hai bên thống nhất triển khai dự án thử nghiệm thực tế (Pilot Testing) giải pháp tại nhà máy trong giai đoạn mùa vụ tới.\n1. Bên Bán cung cấp 01 tổ hợp thiết bị mẫu và cử chuyên gia kỹ thuật hướng dẫn vận hành.\n2. Bên Mua chuẩn bị hạ tầng kết nối điện, mặt bằng lắp đặt và bố trí nhân sự kỹ thuật tiếp nhận.`
  );
  const [pilotDuration, setPilotDuration] = useState(existingMou?.pilotDurationMonths || 6);
  const [commercialTerms, setCommercialTerms] = useState(
    existingMou?.commercialTerms ||
      `Chi phí thử nghiệm thực địa do hai bên đồng tài trợ. Nếu đạt chỉ số KPI sau thời gian thử nghiệm, hai bên sẽ tiến hành đàm phán hợp đồng chuyển giao công nghệ trọn gói trị giá dự kiến ${formattedEstimatedValue}.`
  );
  const [ipTerms, setIpTerms] = useState(
    existingMou?.intellectualPropertyTerms ||
      `Quyền sở hữu trí tuệ gốc đối với công nghệ thuộc về Bên Bán. Dữ liệu vận hành thực tế thu thập trong thời gian thử nghiệm tại hiện trường thuộc quyền khai thác chung của hai bên.`
  );
  const [status, setStatus] = useState<'DRAFT' | 'SIGNED'>(
    (existingMou?.status as any) === 'SIGNED' ? 'SIGNED' : 'DRAFT'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const doSubmit = async (targetStatus: 'DRAFT' | 'SIGNED') => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await brokerageApi.saveMouAgreement(opportunity.id, {
        scopeOfWork: scopeOfWork.trim(),
        pilotDurationMonths: Number(pilotDuration),
        commercialTerms: commercialTerms.trim(),
        intellectualPropertyTerms: ipTerms.trim(),
        status: targetStatus,
      });
      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu thỏa thuận MOU.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSubmit(status);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-surface-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-subtle/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
                Biên Bản Ghi Nhớ Hợp Tác & Ký Kết Chuyển Giao (MOU)
                {existingMou?.status === 'SIGNED' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                    Đã Ký Kết
                  </span>
                )}
              </h3>
              <p className="text-caption text-text-muted">
                Deal: <strong className="text-text-primary">{opportunity.opportunityCode}</strong> • {opportunity.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-surface-elevated text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-caption flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Parties Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-subtle border border-border text-caption">
            <div className="space-y-1">
              <span className="font-bold text-brand-primary uppercase flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Bên Mua (Bên A):
              </span>
              <p className="font-semibold text-text-primary text-sm">{opportunity.buyerOrgName}</p>
              <p className="text-text-muted">Đại diện: {opportunity.buyerContactName}</p>
            </div>
            <div className="space-y-1 md:border-l md:border-border md:pl-4">
              <span className="font-bold text-emerald-600 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Bên Bán (Bên B):
              </span>
              <p className="font-semibold text-text-primary text-sm">{opportunity.sellerOrgName}</p>
              <p className="text-text-muted">Đại diện: {opportunity.sellerContactName}</p>
            </div>
          </div>

          {/* Scope of Work */}
          <div>
            <label className="block text-caption font-bold text-text-secondary mb-1.5">
              1. Phạm vi hợp tác & Kế hoạch thử nghiệm thực địa (Scope of Work)
            </label>
            <textarea
              required
              rows={4}
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border text-text-primary text-caption focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>

          {/* Pilot Duration & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-bold text-text-secondary mb-1.5">
                Thời gian thử nghiệm Pilot (tháng)
              </label>
              <input
                type="number"
                min={1}
                max={36}
                required
                value={pilotDuration}
                onChange={(e) => setPilotDuration(Number(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-surface-card border border-border text-text-primary text-caption focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-caption font-bold text-text-secondary mb-1.5">
                Quy trình & Trạng thái văn bản
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-10 px-3.5 rounded-xl bg-surface-card border border-border text-text-primary text-caption font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all cursor-pointer"
              >
                <option value="DRAFT">Lưu Bản Thảo (Bước 3: Đang thảo luận)</option>
                <option value="SIGNED">Ký Kết Chính Thức (Bước 4: Hoàn tất đơn hàng)</option>
              </select>
            </div>
          </div>

          {/* Commercial Terms */}
          <div>
            <label className="block text-caption font-bold text-text-secondary mb-1.5">
              2. Điều khoản tài chính & Giá trị dự kiến (Commercial Terms)
            </label>
            <textarea
              required
              rows={3}
              value={commercialTerms}
              onChange={(e) => setCommercialTerms(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border text-text-primary text-caption focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>

          {/* Intellectual Property Terms */}
          <div>
            <label className="block text-caption font-bold text-text-secondary mb-1.5">
              3. Quyền Sở hữu trí tuệ & Bảo mật thông tin (IP & NDA)
            </label>
            <textarea
              required
              rows={3}
              value={ipTerms}
              onChange={(e) => setIpTerms(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border text-text-primary text-caption focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>

          {/* Note hướng dẫn chuyển bước 4 */}
          <div className="p-3.5 rounded-xl bg-brand-primary/5 border border-brand-primary/20 text-xs text-text-secondary flex items-start gap-2.5">
            <Award className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
            <div>
              <strong className="text-brand-primary">Lưu ý về quy trình hoàn tất:</strong>
              <p className="mt-0.5 text-text-muted">
                Khi chọn <strong>&quot;Ký Kết Chính Thức (Bước 4: Hoàn Tất)&quot;</strong>, hệ thống sẽ tự động cập nhật thương vụ sang giai đoạn <strong>MOU_SIGNED</strong> và đánh dấu đơn hàng của Bên Mua thành <strong>COMPLETED (Hoàn tất 4 bước)</strong>.
              </p>
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl border border-border text-text-secondary hover:bg-surface-elevated text-caption font-medium transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => doSubmit('DRAFT')}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl border border-brand-primary/40 text-brand-primary hover:bg-brand-primary/5 text-caption font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <FileSignature className="w-4 h-4" />
              Lưu Bản Thảo (Bước 3: Đàm Phán)
            </button>
            <button
              type="button"
              onClick={() => doSubmit('SIGNED')}
              disabled={isSubmitting}
              className="h-10 px-5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 text-caption font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Ký Kết Chính Thức (Bước 4: Hoàn Tất)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
