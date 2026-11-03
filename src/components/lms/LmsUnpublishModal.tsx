"use client";

import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { unpublishLmsMaterial } from "@/lib/api/lms";

interface LmsUnpublishModalProps {
  materialId: string;
  materialTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LmsUnpublishModal({
  materialId,
  materialTitle,
  isOpen,
  onClose,
  onSuccess,
}: LmsUnpublishModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Vui lòng nhập lý do gỡ bài học.");
      return;
    }
    if (trimmed.length > 250) {
      setError("Lý do gỡ bài không được vượt quá 250 ký tự.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await unpublishLmsMaterial(materialId, trimmed);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể gỡ bài học.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <span>Gỡ bài học khỏi Cổng công khai</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Bạn đang yêu cầu gỡ bài giảng:{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              &ldquo;{materialTitle}&rdquo;
            </span>
            . Bài học sẽ chuyển sang trạng thái <strong className="text-rose-600">Đã gỡ</strong> và tri thức vector RAG sẽ được tự động xóa khỏi trợ lý AI.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
              Lý do gỡ bài <span className="text-rose-500">* (Bắt buộc, tối đa 250 ký tự)</span>
            </label>
            <textarea
              rows={4}
              maxLength={250}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do gỡ bài để lưu vết kiểm toán (ví dụ: Cập nhật bài giảng mới, Thông tin chuyên môn cần hiệu chỉnh...)"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
            />
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Yêu cầu tính trung thực để phục vụ kiểm toán</span>
              <span className={reason.length > 250 ? "text-rose-500 font-bold" : ""}>
                {reason.length} / 250 ký tự
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting || !reason.trim() || reason.length > 250}
              className="px-5 py-2 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Đang xử lý..." : "Xác nhận gỡ bài"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
