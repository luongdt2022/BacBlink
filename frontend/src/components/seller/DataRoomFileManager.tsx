"use client";

import React, { useState } from "react";
import { FolderLock, Upload, Trash2, FileText, Video, Eye, ShieldCheck, Lock } from "lucide-react";
import { OfferDocument, OfferDocumentType, AccessScope } from "@/types/technology-offer";

interface DataRoomFileManagerProps {
  documents: OfferDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<OfferDocument[]>>;
}

export function DataRoomFileManager({
  documents,
  setDocuments,
}: DataRoomFileManagerProps) {
  const [docType, setDocType] = useState<OfferDocumentType>("CATALOGUE");
  const [accessScope, setAccessScope] = useState<AccessScope>("AFTER_CONNECTION");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(1048576); // 1MB mặc định
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddDocument = () => {
    setErrorMsg(null);
    if (!fileName.trim()) {
      setErrorMsg("Vui lòng nhập tên tệp tài liệu.");
      return;
    }

    const finalUrl = fileUrl.trim() || `https://dataroom.baclink.org.vn/docs/${encodeURIComponent(fileName.trim())}`;

    // Kiểm tra dung lượng
    const isVid = docType === "VIDEO" || fileName.endsWith(".mp4");
    const maxBytes = isVid ? 52428800 : 26214400;
    if (fileSizeBytes > maxBytes) {
      setErrorMsg(`Dung lượng tệp vượt quá giới hạn (${isVid ? "50MB" : "25MB"}).`);
      return;
    }

    const newDoc: OfferDocument = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `doc-${Date.now()}`,
      documentType: docType,
      fileName: fileName.trim(),
      fileUrl: finalUrl,
      fileSizeBytes: fileSizeBytes,
      accessScope: accessScope,
    };

    setDocuments((prev) => [...prev, newDoc]);
    setFileName("");
    setFileUrl("");
  };

  const handleRemove = (index: number) => {
    setDocuments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const getScopeBadge = (scope: AccessScope) => {
    switch (scope) {
      case "PUBLIC":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-700">
            <Eye className="h-3 w-3" /> PUBLIC (Công khai)
          </span>
        );
      case "AFTER_CONNECTION":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs font-bold text-brand-700">
            <ShieldCheck className="h-3 w-3" /> AFTER_CONNECTION (Sau kết nối)
          </span>
        );
      case "ADMIN_ONLY":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-xs font-bold text-rose-700">
            <Lock className="h-3 w-3" /> ADMIN_ONLY (Nội bộ Admin BACLINK)
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-800">
            <FolderLock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Phòng Dữ Liệu Bảo Mật (DataRoom 3 Phân Cấp - ADR-04-03)
            </h3>
            <p className="text-xs text-slate-500">
              Quản lý tài liệu kỹ thuật, chứng nhận kiểm định & video demo với 3 cấp độ phân quyền nghiêm ngặt
            </p>
          </div>
        </div>
        <span className="rounded-full bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 text-xs font-bold text-cyan-800">
          Zero-Trust DataRoom
        </span>
      </div>

      {/* Form thêm tài liệu */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
        <div className="text-xs font-bold text-slate-700">Đính kèm tài liệu mới vào DataRoom:</div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">Loại tài liệu</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as OfferDocumentType)}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-brand-500 transition cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
            >
              <option value="CATALOGUE">Catalogue / Brochure</option>
              <option value="PATENT_CERT">Bằng sáng chế / Văn bằng SHTT</option>
              <option value="TRL_EVIDENCE">Báo cáo thử nghiệm / Kiểm định TRL</option>
              <option value="VIDEO">Video vận hành thực tế (.mp4)</option>
              <option value="OTHER">Tài liệu kỹ thuật khác</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-slate-600">Tên tệp hiển thị</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="VD: Bao_cao_thu_nghiem_tai_hien_truong.pdf"
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">Phân quyền DataRoom</label>
            <select
              value={accessScope}
              onChange={(e) => setAccessScope(e.target.value as AccessScope)}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-brand-500 transition cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
            >
              <option value="PUBLIC">PUBLIC — Ai cũng xem được</option>
              <option value="AFTER_CONNECTION">AFTER_CONNECTION — Chỉ sau kết nối</option>
              <option value="ADMIN_ONLY">ADMIN_ONLY — Chỉ Admin BACLINK</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAddDocument}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition"
          >
            <Upload className="h-3.5 w-3.5" />
            Thêm vào DataRoom
          </button>
        </div>
      </div>

      {/* Danh sách tệp trong DataRoom */}
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        {documents.map((doc, idx) => (
          <div key={idx} className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                {doc.documentType === "VIDEO" ? <Video className="h-4 w-4 text-rose-600" /> : <FileText className="h-4 w-4 text-brand-600" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">{doc.fileName}</div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <span>{(doc.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                  <span>&bull;</span>
                  <span>{doc.documentType}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getScopeBadge(doc.accessScope)}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                title="Xóa tệp này"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {documents.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-400 italic">
            Chưa có tài liệu nào trong DataRoom. Hãy đính kèm Catalogue hoặc Báo cáo thử nghiệm để tăng tính thuyết phục.
          </div>
        )}
      </div>
    </div>
  );
}
