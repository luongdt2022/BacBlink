"use client";

import React, { useMemo } from "react";
import { Plus, Trash2, Sparkles, AlertCircle } from "lucide-react";
import { OfferSpecValue, TT17_SECTORS } from "@/types/technology-offer";

export interface DynamicSpecTableProps {
  sectorCode: string;
  specs: OfferSpecValue[];
  onChange: (specs: OfferSpecValue[]) => void;
  disabled?: boolean;
}

export const DynamicSpecTable: React.FC<DynamicSpecTableProps> = ({
  sectorCode,
  specs,
  onChange,
  disabled = false,
}) => {
  // Tìm thông số mẫu theo ngành
  const activeIndustry = useMemo(() => {
    return TT17_SECTORS.find((s) => s.code.toUpperCase() === sectorCode?.toUpperCase());
  }, [sectorCode]);

  // Kiểm tra trùng lặp tên thông số (BR-SELLER-11)
  const duplicateIndices = useMemo(() => {
    const counts: Record<string, number[]> = {};
    specs.forEach((s, idx) => {
      const clean = (s.specName || "").trim().toLowerCase();
      if (!clean) return;
      if (!counts[clean]) counts[clean] = [];
      counts[clean].push(idx);
    });

    const dupes = new Set<number>();
    Object.values(counts).forEach((indices) => {
      if (indices.length > 1) {
        indices.forEach((i) => dupes.add(i));
      }
    });
    return dupes;
  }, [specs]);

  const handleAddRow = () => {
    if (specs.length >= 50) return;
    onChange([
      ...specs,
      {
        specCode: `SPEC-${specs.length + 1}`,
        specName: "",
        specValue: "",
        unit: "",
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    const next = specs.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleUpdateRow = (
    index: number,
    field: keyof OfferSpecValue,
    value: string
  ) => {
    const next = specs.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(next);
  };

  const handleLoadIndustryDefaults = () => {
    if (!activeIndustry) return;
    const defaults: OfferSpecValue[] = activeIndustry.defaultSpecs.map((ds, i) => ({
      specCode: `SPEC-${i + 1}`,
      specName: ds.specName,
      specValue: "",
      unit: ds.unit || "",
    }));
    onChange(defaults);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold text-slate-800">
              Bảng thông số kỹ thuật ({specs.length} / 50)
            </h4>
            {duplicateIndices.size > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-caption font-bold text-rose-600">
                <AlertCircle className="h-3 w-3" /> Trùng tên thông số
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Khai báo các thông số vận hành then chốt để phục vụ tìm kiếm & so sánh đa tầng.
          </p>
        </div>

        {activeIndustry && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleLoadIndustryDefaults}
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1.5 text-xs font-bold text-cyan-800 transition hover:bg-cyan-100"
            title="Tải bộ thông số mẫu theo ngành đã chọn"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
            Nạp mẫu ngành ({activeIndustry.name.split(",")[0]})
          </button>
        )}
      </div>

      {specs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
          <p className="text-xs font-medium text-slate-500">
            Chưa có thông số kỹ thuật nào được thêm.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            {activeIndustry && (
              <button
                type="button"
                disabled={disabled}
                onClick={handleLoadIndustryDefaults}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm border border-slate-300 hover:bg-slate-50"
              >
                <Sparkles className="h-3.5 w-3.5 text-brand-600" /> Nạp bộ mẫu chuẩn ngành
              </button>
            )}
            <button
              type="button"
              disabled={disabled}
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm thông số mới
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-600">
              <tr>
                <th className="w-10 px-3 py-2.5 text-center">#</th>
                <th className="w-2/5 px-3 py-2.5">
                  Tên thông số <span className="text-rose-500">*</span>
                </th>
                <th className="w-2/5 px-3 py-2.5">
                  Giá trị / Chỉ số <span className="text-rose-500">*</span>
                </th>
                <th className="w-1/5 px-3 py-2.5">Đơn vị đo</th>
                <th className="w-12 px-3 py-2.5 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {specs.map((spec, index) => {
                const isDupe = duplicateIndices.has(index);

                return (
                  <tr
                    key={spec.id || index}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isDupe ? "bg-rose-50/50" : ""
                    }`}
                  >
                    <td className="px-3 py-2 text-center font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        disabled={disabled}
                        value={spec.specName}
                        onChange={(e) =>
                          handleUpdateRow(index, "specName", e.target.value)
                        }
                        placeholder="Ví dụ: Công suất tách ẩm, Độ chính xác..."
                        className={`w-full rounded-lg border px-2.5 py-1.5 text-xs transition ${
                          isDupe
                            ? "border-rose-400 bg-rose-50 text-rose-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                            : "border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                        }`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        disabled={disabled}
                        value={spec.specValue}
                        onChange={(e) =>
                          handleUpdateRow(index, "specValue", e.target.value)
                        }
                        placeholder="Ví dụ: 120, -45 đến +120, Tự động..."
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        disabled={disabled}
                        value={spec.unit || ""}
                        onChange={(e) =>
                          handleUpdateRow(index, "unit", e.target.value)
                        }
                        placeholder="kg/mẻ, kW, %, °C..."
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleRemoveRow(index)}
                        className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Xóa thông số này"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {specs.length < 50 && (
        <button
          type="button"
          disabled={disabled}
          onClick={handleAddRow}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-700"
        >
          <Plus className="h-4 w-4 text-brand-600" /> Thêm dòng thông số kỹ thuật mới
        </button>
      )}
    </div>
  );
};
