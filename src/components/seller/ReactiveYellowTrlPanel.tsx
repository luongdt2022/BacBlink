"use client";

import React from "react";
import { Award, Info } from "lucide-react";
import {
  IntellectualPropertyStatus,
  TransferMethod,
  CommercializationStatus,
} from "@/types/technology-offer";

interface ReactiveYellowTrlPanelProps {
  hasTechTransfer: boolean;
  trlLevel: number;
  setTrlLevel: (lvl: number) => void;
  developerOrigin: string;
  setDeveloperOrigin: (val: string) => void;
  ipStatus: IntellectualPropertyStatus;
  setIpStatus: (status: IntellectualPropertyStatus) => void;
  ipRegistrationNumber: string;
  setIpRegistrationNumber: (val: string) => void;
  transferMethod: TransferMethod;
  setTransferMethod: (method: TransferMethod) => void;
  commercialStatus: CommercializationStatus;
  setCommercialStatus: (status: CommercializationStatus) => void;
  errors: Record<string, string>;
}

export const TRL_DESCRIPTIONS: Record<number, string> = {
  1: "TRL 1: Nguyên lý cơ bản được quan sát và báo cáo (Nghiên cứu cơ bản)",
  2: "TRL 2: Khái niệm công nghệ hoặc ứng dụng được hình thành",
  3: "TRL 3: Bằng chứng thực nghiệm về khái niệm (Proof of Concept)",
  4: "TRL 4: Công nghệ được kiểm chứng trong phòng thí nghiệm",
  5: "TRL 5: Công nghệ được kiểm chứng trong môi trường mô phỏng",
  6: "TRL 6: Mô hình thử nghiệm hoàn chỉnh trong môi trường mô phỏng",
  7: "TRL 7: Nguyên mẫu trình diễn trong môi trường vận hành thực tế",
  8: "TRL 8: Hệ thống công nghệ hoàn chỉnh và đạt tiêu chuẩn chất lượng",
  9: "TRL 9: Công nghệ đã được chứng minh trong môi trường sản xuất thực tế",
};

export function ReactiveYellowTrlPanel({
  hasTechTransfer,
  trlLevel,
  setTrlLevel,
  developerOrigin,
  setDeveloperOrigin,
  ipStatus,
  setIpStatus,
  ipRegistrationNumber,
  setIpRegistrationNumber,
  transferMethod,
  setTransferMethod,
  commercialStatus,
  setCommercialStatus,
  errors,
}: ReactiveYellowTrlPanelProps) {
  if (!hasTechTransfer) return null;

  return (
    <div
      id="trl-panel"
      className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-5 shadow-sm space-y-4 animate-in fade-in duration-200"
    >
      <div className="flex items-start justify-between gap-3 border-b border-amber-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-white shadow">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-amber-950">
              Hồ Sơ Chuyển Giao Công Nghệ & SHTT (IP Quad) <span className="text-rose-600">*</span>
            </h3>
            <p className="text-xs text-amber-800">
              Chuẩn hóa theo danh mục công nghệ ITRI (PO-DEC-20261008-04) · Bắt buộc khai báo khi có chuyển giao
            </p>
          </div>
        </div>
        <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-extrabold text-amber-900">
          4 Thuộc Tính Bắt Buộc
        </span>
      </div>

      {/* Thuộc tính 1: TRL 1-9 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
            1. Mức độ hoàn thiện công nghệ TRL (1–9) <span className="text-rose-600">*</span>
          </label>
          <span className="text-xs font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded">
            {TRL_DESCRIPTIONS[trlLevel] || `TRL ${trlLevel}`}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setTrlLevel(lvl)}
              className={`rounded-lg border py-2 text-xs font-bold transition ${
                trlLevel === lvl
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                  : "bg-white text-amber-900 border-amber-200 hover:border-amber-400"
              }`}
              title={TRL_DESCRIPTIONS[lvl]}
            >
              {lvl}
            </button>
          ))}
        </div>
        {errors.trlLevel && (
          <p className="mt-1 text-xs text-rose-600">{errors.trlLevel}</p>
        )}
      </div>

      {/* Thuộc tính 2 & Đơn vị phát triển */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
        <div>
          <label className="mb-1 block text-xs font-extrabold text-slate-800">
            Nguồn gốc / Đơn vị nghiên cứu phát triển (Origin/Developer) <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={developerOrigin}
            onChange={(e) => setDeveloperOrigin(e.target.value)}
            placeholder="VD: The Industrial Technology Research Institute (ITRI), Viện NacenTech..."
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-brand-500"
          />
          {errors.developerOrigin && (
            <p className="mt-1 text-xs text-rose-600">{errors.developerOrigin}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-extrabold text-slate-800">
            2. Tình trạng bảo hộ SHTT (Intellectual Property Status) <span className="text-rose-600">*</span>
          </label>
          <select
            value={ipStatus}
            onChange={(e) => setIpStatus(e.target.value as IntellectualPropertyStatus)}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 transition cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
          >
            <option value="PATENT_GRANTED">Bằng độc quyền sáng chế (Patent Granted)</option>
            <option value="UTILITY_MODEL">Bằng độc quyền giải pháp hữu ích (Utility Model)</option>
            <option value="TRADE_SECRET">Bí quyết công nghệ / Know-how (Trade Secret)</option>
            <option value="PATENT_PENDING">Đang nộp đơn hợp lệ, chờ cấp bằng (Patent Pending)</option>
            <option value="SOFTWARE_COPYRIGHT">Bản quyền phần mềm (Software Copyright)</option>
            <option value="NONE">Chưa đăng ký bảo hộ SHTT</option>
          </select>
          {errors.ipStatus && (
            <p className="mt-1 text-xs text-rose-600">{errors.ipStatus}</p>
          )}
        </div>
      </div>

      {/* Thuộc tính 3 & 4: Hình thức chuyển giao & Trạng thái thương mại hóa */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-1">
        <div>
          <label className="mb-1 block text-xs font-extrabold text-slate-800">
            Số hiệu văn bằng / Đơn SHTT
          </label>
          <input
            type="text"
            value={ipRegistrationNumber}
            onChange={(e) => setIpRegistrationNumber(e.target.value)}
            placeholder="VD: VN-1-0028945 / R&D 100 Awards"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500 transition"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-extrabold text-slate-800">
            3. Hình thức chuyển giao (Transfer Method) <span className="text-rose-600">*</span>
          </label>
          <select
            value={transferMethod}
            onChange={(e) => setTransferMethod(e.target.value as TransferMethod)}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 transition cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
          >
            <option value="NON_EXCLUSIVE_LICENSE">Li-xăng không độc quyền (Non-exclusive)</option>
            <option value="EXCLUSIVE_LICENSE">Li-xăng độc quyền (Exclusive License)</option>
            <option value="ASSIGNMENT_SALE">Chuyển nhượng toàn bộ quyền (Full Assignment)</option>
            <option value="JOINT_RD">Hợp tác R&D / Đồng phát triển</option>
            <option value="CAPITAL_CONTRIBUTION">Góp vốn bằng tài sản SHTT</option>
          </select>
          {errors.transferMethod && (
            <p className="mt-1 text-xs text-rose-600">{errors.transferMethod}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-extrabold text-slate-800">
            4. Trạng thái thương mại hóa <span className="text-rose-600">*</span>
          </label>
          <select
            value={commercialStatus}
            onChange={(e) => setCommercialStatus(e.target.value as CommercializationStatus)}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 transition cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
          >
            <option value="COMMERCIALLY_READY">Sẵn sàng thương mại hóa diện rộng</option>
            <option value="PILOT_TESTING">Đang vận hành thử nghiệm hiện trường (Pilot)</option>
            <option value="LAB_PROTOTYPE">Nguyên mẫu phòng thí nghiệm (Prototype)</option>
            <option value="SEEKING_MANUFACTURER">Tìm đối tác hợp tác sản xuất</option>
          </select>
          {errors.commercialStatus && (
            <p className="mt-1 text-xs text-rose-600">{errors.commercialStatus}</p>
          )}
        </div>
      </div>
    </div>
  );
}
