"use client";

import React, { useState } from "react";
import { Plus, Trash2, ListPlus, AlertCircle } from "lucide-react";
import { OfferSpecValue } from "@/types/technology-offer";

interface DynamicSpecKeyValueTableProps {
  specValues: OfferSpecValue[];
  setSpecValues: React.Dispatch<React.SetStateAction<OfferSpecValue[]>>;
}

export function DynamicSpecKeyValueTable({
  specValues,
  setSpecValues,
}: DynamicSpecKeyValueTableProps) {
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Lọc chỉ lấy các thông số tự do
  const customSpecs = specValues.filter((s) => s.specCategory === "TIER_3_CUSTOM");

  const handleAddRow = () => {
    if (specValues.length >= 50) {
      setDuplicateWarning("Hồ sơ đã đạt giới hạn tối đa 50 dòng thông số kỹ thuật (BR-SELLER-11).");
      return;
    }

    const newSpec: OfferSpecValue = {
      specName: "",
      specValue: "",
      unit: "",
      specCategory: "TIER_3_CUSTOM",
    };

    setSpecValues((prev) => [...prev, newSpec]);
    setDuplicateWarning(null);
  };

  const handleUpdate = (originalIndex: number, field: keyof OfferSpecValue, value: string) => {
    setDuplicateWarning(null);

    // Kiểm tra trùng lặp nếu đang sửa specName
    if (field === "specName" && value.trim()) {
      const cleanVal = value.trim().toLowerCase();
      const isDup = specValues.some(
        (s, idx) => idx !== originalIndex && s.specName.trim().toLowerCase() === cleanVal
      );
      if (isDup) {
        setDuplicateWarning(`Tên thông số "${value.trim()}" đã tồn tại trong hồ sơ.`);
      }
    }

    setSpecValues((prev) => {
      const copy = [...prev];
      copy[originalIndex] = { ...copy[originalIndex], [field]: value };
      return copy;
    });
  };

  const handleDelete = (originalIndex: number) => {
    setSpecValues((prev) => prev.filter((_, idx) => idx !== originalIndex));
    setDuplicateWarning(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <ListPlus className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Thông số kỹ thuật bổ sung (Dynamic Key-Value Table)
            </h3>
            <p className="text-xs text-slate-500">
              Khai báo thêm các chỉ tiêu đo lường đặc biệt ngoài danh mục chuẩn (Tối đa 50 dòng, chống trùng tên)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {specValues.length} / 50 dòng
          </span>
          <button
            type="button"
            onClick={handleAddRow}
            disabled={specValues.length >= 50}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm dòng thông số
          </button>
        </div>
      </div>

      {duplicateWarning && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>{duplicateWarning}</span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-extrabold uppercase tracking-wider text-xs">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3 w-1/3">Tên thông số kỹ thuật <span className="text-rose-600">*</span></th>
              <th className="py-2.5 px-3 w-1/3">Giá trị / Định mức <span className="text-rose-600">*</span></th>
              <th className="py-2.5 px-3 w-1/5">Đơn vị đo</th>
              <th className="py-2.5 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {specValues.map((spec, index) => {
              const isSectorSpec = spec.specCategory === "TIER_3_SECTOR";
              return (
                <tr key={index} className="hover:bg-slate-50/50 transition">
                  <td className="py-2 px-3 text-slate-400 font-mono text-xs">{index + 1}</td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={spec.specName}
                      onChange={(e) => handleUpdate(index, "specName", e.target.value)}
                      placeholder="VD: Sai số cho phép"
                      className="h-8 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs outline-none focus:border-brand-500 transition"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={spec.specValue}
                      onChange={(e) => handleUpdate(index, "specValue", e.target.value)}
                      placeholder="VD: &plusmn; 0.05"
                      className="h-8 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs outline-none focus:border-brand-500 transition"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={spec.unit || ""}
                      onChange={(e) => handleUpdate(index, "unit", e.target.value)}
                      placeholder="VD: mm, %, kW"
                      className="h-8 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs outline-none focus:border-brand-500 transition"
                    />
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-rose-600 transition rounded hover:bg-rose-50"
                      title="Xóa dòng này"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {specValues.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-xs text-slate-400 italic">
                  Chưa có thông số nào. Nhấn &ldquo;Thêm dòng thông số&rdquo; để bắt đầu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
