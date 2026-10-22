"use client";

import React, { useState } from "react";
import { Send, ShieldAlert, CheckCircle2, X } from "lucide-react";
import { PROVINCIAL_AUTHORITIES_CATALOG } from "@/services/api/technology-offer";

interface FastTrackSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  offerType: string;
  sectorName: string;
  pricingDisplay: string;
  isSubmitting: boolean;
  managingAuthorityId?: string;
  managingAuthorityName?: string;
  onAuthorityChange?: (id: string, name: string) => void;
}

export function FastTrackSubmitModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  offerType,
  sectorName,
  pricingDisplay,
  isSubmitting,
  managingAuthorityId,
  managingAuthorityName,
  onAuthorityChange,
}: FastTrackSubmitModalProps) {
  const [agreed, setAgreed] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-brand-900 via-brand-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-200">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Xác Nhận Nộp Hồ Sơ Nhanh (Fast-Track)</h3>
              <p className="text-xs text-brand-200">Gửi trực tiếp tới Sở KH&CN tiếp nhận thẩm định</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3.5 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Tên công nghệ:</span>
              <span className="font-bold text-slate-900 text-right max-w-[280px] line-clamp-1">{title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Loại hình:</span>
              <span className="font-bold text-slate-900">{offerType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ngành:</span>
              <span className="font-bold text-slate-900">{sectorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Hình thức giá:</span>
              <span className="font-bold text-slate-900">{pricingDisplay}</span>
            </div>

            {/* Khối chọn / thay đổi Sở KH&CN tiếp nhận thẩm định */}
            <div className="flex items-center justify-between pt-2 border-t border-brand-200/50 gap-2">
              <span className="text-slate-500 font-medium shrink-0">Sở KH&CN tiếp nhận:</span>
              {onAuthorityChange ? (
                <div className="flex items-center gap-2">
                  <select
                    value={managingAuthorityId || "VN-HN"}
                    onChange={(e) => {
                      const selected = PROVINCIAL_AUTHORITIES_CATALOG.find((a) => a.id === e.target.value);
                      if (selected) onAuthorityChange(selected.id, selected.name);
                    }}
                    className="text-xs font-bold text-slate-900 bg-white border border-brand-200 rounded px-2 py-1 max-w-[260px] truncate outline-none focus:border-brand-500 transition cursor-pointer"
                  >
                    {PROVINCIAL_AUTHORITIES_CATALOG.map((auth) => (
                      <option key={auth.id} value={auth.id}>
                        {auth.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="font-bold text-slate-900 text-right max-w-[260px] line-clamp-1">
                  {managingAuthorityName || "Sở Khoa học và Công nghệ TP. Hà Nội"}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2.5">
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-5">
                <p className="font-bold">Cơ chế nộp hồ sơ Fast-Track không chặn (ADR-04-01):</p>
                <p className="mt-0.5">
                  Hệ thống cho phép nộp ngay hồ sơ tối giản Bước 1. Cơ quan quản lý Sở KH&CN sẽ tự động tiếp nhận. Bạn có thể quay lại bổ sung thông số kỹ thuật Lớp 2-3 và minh chứng DataRoom bất cứ lúc nào.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs font-semibold text-slate-700 leading-5">
                Tôi cam kết thông tin khai báo là hoàn toàn trung thực, có quyền sở hữu/phân phối hợp pháp và chịu trách nhiệm trước pháp luật.
              </span>
            </label>
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            Xem lại thông tin
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!agreed || isSubmitting}
            className="rounded-lg bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white px-4 py-2 text-xs font-extrabold shadow flex items-center gap-1.5 transition"
          >
            {isSubmitting ? (
              <span>Đang gửi hồ sơ...</span>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Xác nhận & Nộp hồ sơ chờ duyệt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
