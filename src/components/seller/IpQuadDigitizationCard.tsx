"use client";

import React, { useState } from "react";
import { Award, FileCheck2, Upload, Calendar, ShieldCheck, BookOpen } from "lucide-react";
import TrlMethodologyModal from "@/components/common/TrlMethodologyModal";
import { IntellectualPropertyStatus, PROVINCIAL_AUTHORITIES_CATALOG } from "@/services/api/technology-offer";

interface IpQuadDigitizationCardProps {
  ipStatus: IntellectualPropertyStatus;
  setIpStatus: (status: IntellectualPropertyStatus) => void;
  ipRegistrationNumber: string;
  setIpRegistrationNumber: (val: string) => void;
  ipIssueDate: string;
  setIpIssueDate: (val: string) => void;
  managingAuthorityId: string;
  setManagingAuthorityId: (val: string) => void;
  managingAuthorityName: string;
  setManagingAuthorityName: (val: string) => void;
  legalCommitmentConfirmed: boolean;
  setLegalCommitmentConfirmed: (val: boolean) => void;
  onUploadPatentScan?: (file: File) => void;
  patentFileName?: string;
}

export function IpQuadDigitizationCard({
  ipStatus,
  setIpStatus,
  ipRegistrationNumber,
  setIpRegistrationNumber,
  ipIssueDate,
  setIpIssueDate,
  managingAuthorityId,
  setManagingAuthorityId,
  managingAuthorityName,
  setManagingAuthorityName,
  legalCommitmentConfirmed,
  setLegalCommitmentConfirmed,
  onUploadPatentScan,
  patentFileName,
}: IpQuadDigitizationCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUploadPatentScan) {
      setIsUploading(true);
      onUploadPatentScan(e.target.files[0]);
      setTimeout(() => setIsUploading(false), 500);
    }
  };

  const handleAuthorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setManagingAuthorityId(id);
    const item = PROVINCIAL_AUTHORITIES_CATALOG.find((a) => a.id === id);
    if (item) {
      setManagingAuthorityName(item.name);
    }
  };

  return (
    <>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Hồ Sơ Sở Hữu Trí Tuệ (IP Quad Digitization) & Pháp Lý
            </h3>
            <p className="text-xs text-slate-500">
              Khai báo bộ tứ văn bằng SHTT số hóa và cơ quan tiếp nhận hồ sơ theo phân cấp
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMethodologyOpen(true)}
            className="inline-flex items-center gap-1 text-xs text-amber-800 hover:text-amber-950 font-bold bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            Minh chứng TRL 7-9 & SHTT
          </button>
          <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800">
            Bước 4 / Pháp Lý
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Tình trạng văn bằng SHTT</label>
          <select
            value={ipStatus}
            onChange={(e) => setIpStatus(e.target.value as IntellectualPropertyStatus)}
            className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-brand-500 transition cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
          >
            <option value="PATENT_GRANTED">Bằng độc quyền sáng chế (Patent Granted)</option>
            <option value="UTILITY_MODEL">Bằng độc quyền giải pháp hữu ích (Utility Model)</option>
            <option value="TRADE_SECRET">Bí quyết công nghệ / Know-how (Trade Secret)</option>
            <option value="PATENT_PENDING">Đang nộp đơn hợp lệ, chờ cấp bằng (Patent Pending)</option>
            <option value="SOFTWARE_COPYRIGHT">Bản quyền phần mềm (Software Copyright)</option>
            <option value="NONE">Chưa đăng ký bảo hộ SHTT</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Số hiệu văn bằng / Đơn nộp</label>
          <input
            type="text"
            value={ipRegistrationNumber}
            onChange={(e) => setIpRegistrationNumber(e.target.value)}
            placeholder="VD: VN 1-0028491 / Cục SHTT"
            className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-brand-500 transition"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Ngày cấp / Ngày nộp đơn</label>
          <div className="relative">
            <input
              type="date"
              value={ipIssueDate}
              onChange={(e) => setIpIssueDate(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-brand-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Upload scan bằng sáng chế */}
      <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">
              {patentFileName ? `Tệp đã đính kèm: ${patentFileName}` : "Tải tệp scan Bằng sáng chế / Chứng nhận SHTT"}
            </div>
            <div className="text-xs text-slate-500">
              Hỗ trợ PDF, JPG, PNG (Dung lượng tối đa 25MB). Tự động lưu vào DataRoom cấp độ ADMIN_ONLY.
            </div>
          </div>
        </div>

        <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-50 shadow-sm transition">
          <Upload className="h-3.5 w-3.5" />
          {isUploading ? "Đang tải..." : patentFileName ? "Đổi tệp scan" : "Chọn tệp scan"}
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
        </label>
      </div>

      {/* Chọn Sở KH&CN tiếp nhận và cam kết pháp lý */}
      <div className="border-t border-slate-100 pt-4 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">
            Sở KH&CN tiếp nhận thẩm định và quản lý địa bàn <span className="text-rose-600">*</span>
          </label>
          <select
            value={managingAuthorityId}
            onChange={handleAuthorityChange}
            className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-brand-500 transition cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
          >
            {PROVINCIAL_AUTHORITIES_CATALOG.map((auth) => (
              <option key={auth.id} value={auth.id}>
                {auth.name} ({auth.scopeType})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Hồ sơ sẽ được chuyển tới Cán bộ chuyên môn của Sở để tiến hành thẩm định trước khi xuất bản lên Sàn Quốc gia.
          </p>
        </div>

        <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={legalCommitmentConfirmed}
            onChange={(e) => setLegalCommitmentConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-xs text-slate-700 font-semibold leading-5">
            Tôi xác nhận và cam kết chịu hoàn toàn trách nhiệm pháp lý về tính trung thực, không vi phạm quyền sở hữu trí tuệ của bên thứ ba đối với toàn bộ dữ liệu chào bán đã khai báo.
          </span>
        </label>
      </div>
    </div>

    <TrlMethodologyModal
      isOpen={isMethodologyOpen}
      onClose={() => setIsMethodologyOpen(false)}
      initialLevel={7}
    />
    </>
  );
}
