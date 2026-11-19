"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { deleteLmsMaterial } from "@/lib/api/lms";

interface LmsDeleteModalProps {
  materialId: string;
  materialTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LmsDeleteModal({
  materialId,
  materialTitle,
  isOpen,
  onClose,
  onSuccess,
}: LmsDeleteModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await deleteLmsMaterial(materialId);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể xóa học liệu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
            <Trash2 className="w-5 h-5" />
            <span>Xác nhận xóa mềm học liệu</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Bạn có chắc chắn muốn xóa học liệu:{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              &ldquo;{materialTitle}&rdquo;
            </span>
            ?
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 dark:bg-amber-950/60 dark:border-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Học liệu sẽ bị đánh dấu xóa mềm (soft-delete), ẩn hoàn toàn khỏi danh mục quản lý và dọn dẹp các liên kết chỉ mục tìm kiếm.
            </span>
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
              type="button"
              disabled={submitting}
              onClick={handleDelete}
              className="px-5 py-2 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow transition disabled:opacity-50"
            >
              {submitting ? "Đang xóa..." : "Xác nhận xóa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
