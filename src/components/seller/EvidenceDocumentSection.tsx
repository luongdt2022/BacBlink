"use client";

import React, { useRef } from "react";
import {
  FileText,
  Lock,
  Globe,
  Shield,
  Trash2,
  Upload,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import {
  OfferDocument,
  OfferDocumentType,
  AccessScope,
} from "@/types/technology-offer";

export interface EvidenceDocumentSectionProps {
  documents: OfferDocument[];
  onChange: (docs: OfferDocument[]) => void;
  disabled?: boolean;
}

export const EvidenceDocumentSection: React.FC<EvidenceDocumentSectionProps> = ({
  documents,
  onChange,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs: OfferDocument[] = [];
    Array.from(files).forEach((file) => {
      // Validate file extension
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      const validExts = [".pdf", ".jpg", ".jpeg", ".png", ".docx", ".xlsx", ".mp4"];
      if (!validExts.includes(ext)) {
        alert(`Định dạng tệp ${file.name} không được hỗ trợ. Vui lòng tải .pdf, .docx, .xlsx, .jpg, .png hoặc .mp4.`);
        return;
      }

      // Max 25MB
      if (file.size > 26214400) {
        alert(`Tệp ${file.name} vượt quá dung lượng tối đa 25MB.`);
        return;
      }

      // Guess document type
      let docType: OfferDocumentType = "OTHER";
      const lower = file.name.toLowerCase();
      if (lower.includes("catalogue") || lower.includes("brochure") || lower.includes("gioi-thieu")) {
        docType = "CATALOGUE";
      } else if (lower.includes("sang-che") || lower.includes("gphi") || lower.includes("patent") || lower.includes("shtt")) {
        docType = "PATENT_CERT";
      } else if (lower.includes("trl") || lower.includes("kiem-dinh") || lower.includes("thu-nghiem") || lower.includes("nghiem-thu")) {
        docType = "TRL_EVIDENCE";
      }

      newDocs.push({
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        documentType: docType,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileSizeBytes: file.size,
        accessScope: docType === "CATALOGUE" ? "PUBLIC" : "AFTER_CONNECTION",
      });
    });

    if (newDocs.length > 0) {
      onChange([...documents, ...newDocs]);
    }
  };

  const handleRemove = (index: number) => {
    const next = documents.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleUpdate = (
    index: number,
    field: "documentType" | "accessScope",
    val: string
  ) => {
    const next = documents.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: val };
      }
      return item;
    });
    onChange(next);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
            <FileCheck className="h-4 w-4 text-emerald-600" />
            Tài liệu minh chứng & Hồ sơ DataRoom ({documents.length} tệp)
          </h4>
          <p className="mt-0.5 text-xs text-slate-500">
            Đính kèm bản scan Bằng SHTT, Báo cáo thử nghiệm TRL hoặc Catalogue kỹ thuật. Cấu hình quyền xem riêng cho từng tệp.
          </p>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand-800"
        >
          <Upload className="h-3.5 w-3.5" /> Tải tài liệu lên
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png,.mp4"
        className="hidden"
        onChange={handleFileUpload}
      />

      {documents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
          <FileText className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-xs font-medium text-slate-600">
            Chưa có tài liệu minh chứng nào được đính kèm.
          </p>
          <p className="mt-1 text-caption text-slate-400">
            Hỗ trợ PDF, Word, Excel, Hình ảnh scan, Video MP4 (Dung lượng tối đa 25MB/tệp).
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Upload className="h-3.5 w-3.5 text-brand-600" /> Chọn tệp từ máy tính
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {documents.map((doc, idx) => (
            <div
              key={doc.id || idx}
              className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-brand-50 p-2 text-brand-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-slate-900">
                    {doc.fileName}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-caption text-slate-500">
                    <span>{formatFileSize(doc.fileSizeBytes)}</span>
                    <span>·</span>
                    <span className="font-semibold text-slate-700">
                      {doc.documentType === "CATALOGUE"
                        ? "Catalogue / Brochure"
                        : doc.documentType === "PATENT_CERT"
                        ? "Bằng SHTT / Quyết định cấp"
                        : doc.documentType === "TRL_EVIDENCE"
                        ? "Báo cáo thử nghiệm TRL"
                        : "Tài liệu kỹ thuật"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                {/* Chọn loại tài liệu */}
                <select
                  disabled={disabled}
                  value={doc.documentType}
                  onChange={(e) => handleUpdate(idx, "documentType", e.target.value)}
                  className="h-8 rounded-lg border border-slate-300 bg-white px-2.5 text-caption font-semibold text-slate-700 outline-none focus:border-brand-500 transition"
                >
                  <option value="CATALOGUE">Catalogue / Brochure</option>
                  <option value="PATENT_CERT">Bằng SHTT</option>
                  <option value="TRL_EVIDENCE">Minh chứng TRL</option>
                  <option value="OTHER">Tài liệu khác</option>
                </select>

                {/* Chọn quyền truy cập DataRoom */}
                <select
                  disabled={disabled}
                  value={doc.accessScope}
                  onChange={(e) => handleUpdate(idx, "accessScope", e.target.value)}
                  className={`h-8 rounded-lg border px-2.5 text-caption font-bold outline-none transition ${
                    doc.accessScope === "PUBLIC"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : doc.accessScope === "AFTER_CONNECTION"
                      ? "border-amber-300 bg-amber-50 text-amber-800"
                      : "border-teal-300 bg-teal-50 text-teal-800"
                  }`}
                >
                  <option value="PUBLIC">🌐 Công khai trên sàn</option>
                  <option value="AFTER_CONNECTION">🔒 Mở sau kết nối (Khuyến nghị)</option>
                  <option value="ADMIN_ONLY">🛡️ Chỉ Admin BACLINK thẩm định</option>
                </select>

                {/* Nút xóa */}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRemove(idx)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  title="Xóa tệp"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
