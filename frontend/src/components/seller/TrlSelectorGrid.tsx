"use client";

import React from "react";
import { Info, FlaskConical, Award, Rocket } from "lucide-react";

export interface TrlDefinition {
  level: number;
  name: string;
  band: "RD" | "PILOT" | "COMMERCIAL";
  bandName: string;
  description: string;
  evidenceHint: string;
}

export const TRL_SCALES: TrlDefinition[] = [
  {
    level: 1,
    name: "Quan sát & báo cáo nguyên lý",
    band: "RD",
    bandName: "R&D / Nghiên cứu sớm",
    description: "Quan sát và ghi nhận các nguyên lý khoa học nền tảng.",
    evidenceHint: "Tài liệu nghiên cứu, bài báo khoa học",
  },
  {
    level: 2,
    name: "Hình thành khái niệm/ứng dụng",
    band: "RD",
    bandName: "R&D / Nghiên cứu sớm",
    description: "Hình thành khái niệm công nghệ hoặc ứng dụng dự kiến.",
    evidenceHint: "Thuyết minh đề tài, phân tích tính khả thi",
  },
  {
    level: 3,
    name: "Chứng minh khái niệm (PoC)",
    band: "RD",
    bandName: "R&D / Nghiên cứu sớm",
    description: "Chứng minh tính khả thi qua phân tích và thực nghiệm lab.",
    evidenceHint: "Báo cáo thử nghiệm quy mô nhỏ, dữ liệu đo",
  },
  {
    level: 4,
    name: "Xác nhận phòng lab (Breadboard)",
    band: "PILOT",
    bandName: "Thử nghiệm & Pilot",
    description: "Mô hình thử nghiệm sơ bộ xác nhận trong môi trường lab.",
    evidenceHint: "Biên bản thử nghiệm lab, ảnh/video mô hình",
  },
  {
    level: 5,
    name: "Xác nhận môi trường phù hợp",
    band: "PILOT",
    bandName: "Thử nghiệm & Pilot",
    description: "Mô hình trung gian (brassboard) xác nhận trong môi trường phù hợp.",
    evidenceHint: "Kết quả đo kiểm môi trường liên quan",
  },
  {
    level: 6,
    name: "Trình diễn mô hình/nguyên mẫu",
    band: "PILOT",
    bandName: "Thử nghiệm & Pilot",
    description: "Nguyên mẫu trình diễn trong môi trường vận hành/phù hợp.",
    evidenceHint: "Báo cáo trình diễn nguyên mẫu, biên bản đánh giá",
  },
  {
    level: 7,
    name: "Trình diễn nguyên mẫu thực tế",
    band: "COMMERCIAL",
    bandName: "Vận hành & Thương mại",
    description: "Nguyên mẫu hệ thống trình diễn vận hành tại hiện trường thực tế.",
    evidenceHint: "Biên bản pilot nhà máy, xác nhận từ đối tác",
  },
  {
    level: 8,
    name: "Hệ thống đủ điều kiện vận hành",
    band: "COMMERCIAL",
    bandName: "Vận hành & Thương mại",
    description: "Hệ thống thực tế hoàn thiện và xác nhận đủ điều kiện vận hành.",
    evidenceHint: "Chứng chỉ kiểm định, số bằng SHTT, biên bản nghiệm thu",
  },
  {
    level: 9,
    name: "Chứng minh qua vận hành thực tế",
    band: "COMMERCIAL",
    bandName: "Vận hành & Thương mại",
    description: "Đã chứng minh hiệu quả qua vận hành thực tế trong nhiệm vụ.",
    evidenceHint: "Bằng sáng chế, hợp đồng chuyển giao, hóa đơn thương mại",
  },
];

export interface TrlSelectorGridProps {
  value?: number | null;
  onChange: (level: number) => void;
  disabled?: boolean;
}

export const TrlSelectorGrid: React.FC<TrlSelectorGridProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const selectedDef = TRL_SCALES.find((t) => t.level === value);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
          <FlaskConical className="h-4 w-4 text-amber-600" />
          Mức độ sẵn sàng công nghệ (TRL 1–9) <span className="text-rose-500">*</span>
        </label>
        <span className="text-xs font-semibold text-slate-500">
          Chọn cấp độ phản ánh đúng thực tế trưởng thành kỹ thuật
        </span>
      </div>

      {/* Grid 9 nút */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
        {TRL_SCALES.map((trl) => {
          const isSelected = value === trl.level;

          let colorStyles = "";
          let badgeColor = "";
          if (trl.band === "RD") {
            colorStyles = isSelected
              ? "border-brand-600 bg-brand-600 text-white shadow-md ring-2 ring-brand-200"
              : "border-brand-200 bg-brand-50/60 text-brand-900 hover:border-brand-500 hover:bg-brand-100";
            badgeColor = isSelected ? "bg-brand-700 text-white" : "text-brand-700";
          } else if (trl.band === "PILOT") {
            colorStyles = isSelected
              ? "border-amber-600 bg-amber-600 text-white shadow-md ring-2 ring-amber-300"
              : "border-amber-200 bg-amber-50/60 text-amber-900 hover:border-amber-400 hover:bg-amber-100";
            badgeColor = isSelected ? "bg-amber-700 text-white" : "text-amber-700";
          } else {
            colorStyles = isSelected
              ? "border-emerald-600 bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300"
              : "border-emerald-200 bg-emerald-50/60 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-100";
            badgeColor = isSelected ? "bg-emerald-700 text-white" : "text-emerald-700";
          }

          return (
            <button
              key={trl.level}
              type="button"
              disabled={disabled}
              onClick={() => onChange(trl.level)}
              title={`${trl.level}: ${trl.name} (${trl.bandName})`}
              className={`flex flex-col items-center justify-center rounded-xl border-2 p-2 text-center transition-all ${colorStyles}`}
            >
              <div className="text-lg font-black">{trl.level}</div>
              <div className={`mt-0.5 truncate text-xs font-bold ${badgeColor}`}>
                {trl.band === "RD" ? "R&D" : trl.band === "PILOT" ? "Pilot" : "Live"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Chi tiết nấc đang chọn */}
      {selectedDef ? (
        <div
          className={`flex items-start gap-3 rounded-xl border p-3 text-xs ${
            selectedDef.band === "RD"
              ? "border-brand-200 bg-brand-50/70 text-brand-950"
              : selectedDef.band === "PILOT"
              ? "border-amber-200 bg-amber-50/70 text-amber-950"
              : "border-emerald-200 bg-emerald-50/70 text-emerald-950"
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {selectedDef.band === "RD" ? (
              <FlaskConical className="h-4 w-4 text-brand-700" />
            ) : selectedDef.band === "PILOT" ? (
              <Award className="h-4 w-4 text-amber-700" />
            ) : (
              <Rocket className="h-4 w-4 text-emerald-700" />
            )}
          </div>
          <div className="flex-1">
            <div className="font-extrabold">
              TRL {selectedDef.level} · {selectedDef.name}{" "}
              <span className="font-normal opacity-75">({selectedDef.bandName})</span>
            </div>
            <div className="mt-0.5 text-xs leading-relaxed opacity-90">
              {selectedDef.description}
            </div>
            <div className="mt-1 text-xs font-semibold opacity-80">
              📌 Minh chứng khuyến nghị: {selectedDef.evidenceHint}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-500">
          <Info className="h-4 w-4 shrink-0 text-slate-400" />
          <span>Vui lòng click chọn 1 trong 9 cấp độ TRL bên trên.</span>
        </div>
      )}
    </div>
  );
};
