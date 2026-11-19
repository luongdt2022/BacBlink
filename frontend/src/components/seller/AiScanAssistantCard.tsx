"use client";

import React, { useState, useRef } from "react";
import { Sparkles, Loader2, CheckCircle, AlertTriangle, ArrowRight, Upload } from "lucide-react";
import { TechTransferDraftData } from "@/types/technology-offer";
import { extractPatentSpecs } from "@/services/api/technology-offer";

export interface AiScanAssistantCardProps {
  onApplyDraft: (data: TechTransferDraftData) => void;
  disabled?: boolean;
}

export const AiScanAssistantCard: React.FC<AiScanAssistantCardProps> = ({
  onApplyDraft,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<TechTransferDraftData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setExtractedData(null);

    try {
      const res = await extractPatentSpecs(file);
      if (res.success && res.data) {
        setExtractedData(res.data);
      } else {
        setError("AI không thể bóc tách dữ liệu từ tài liệu này.");
      }
    } catch (err: any) {
      console.warn("Lỗi AI extractor:", err);
      // Fallback graceful degradation (PO-DEC-20261008-07)
      setError("Dịch vụ AI tạm thời gián đoạn. Bạn vẫn có thể tiếp tục nhập tay bình thường.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (extractedData) {
      onApplyDraft(extractedData);
      setExtractedData(null);
    }
  };

  return (
    <div className="rounded-2xl border border-cyan-200 bg-gradient-to-b from-cyan-50/90 to-teal-50/50 p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-cyan-600 p-1.5 text-white shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-cyan-950">Trợ lý AI bóc tách tài liệu</h4>
          <span className="text-caption font-semibold text-cyan-700">Human-in-the-Loop</span>
        </div>
      </div>

      <p className="mt-2.5 text-xs leading-relaxed text-cyan-900/90">
        Tải catalogue PDF, bản chụp Bằng SHTT hoặc bản mô tả kỹ thuật để AI tự động trích xuất thông số và điền gợi ý.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />

      {loading && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-white/80 p-3 text-xs font-bold text-cyan-800 shadow-inner">
          <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
          <span>Đang phân tích tài liệu bằng AI...</span>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-caption text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {extractedData && (
        <div className="mt-3 space-y-2 rounded-xl border border-emerald-200 bg-white p-3 text-xs shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>AI đã phân tích thành công!</span>
          </div>

          <div className="space-y-1 text-caption text-slate-600">
            {extractedData.title && (
              <div className="truncate">
                <b>Tên:</b> {extractedData.title}
              </div>
            )}
            {extractedData.ipQuad?.trlLevel && (
              <div>
                <b>TRL đề xuất:</b> Cấp {extractedData.ipQuad.trlLevel}
              </div>
            )}
            {extractedData.suggestedSpecs && extractedData.suggestedSpecs.length > 0 && (
              <div>
                <b>Thông số:</b> {extractedData.suggestedSpecs.length} chỉ tiêu kỹ thuật
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={handleApply}
            className="flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <span>Áp dụng gợi ý vào Form</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {!loading && !extractedData && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-900 hover:underline"
        >
          <Upload className="h-3.5 w-3.5" /> Thử tải tài liệu →
        </button>
      )}
    </div>
  );
};
