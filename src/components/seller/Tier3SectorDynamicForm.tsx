"use client";

import React, { useEffect, useState } from "react";
import { Layers, RefreshCw, AlertCircle } from "lucide-react";
import { TT17_SECTORS, OfferSpecValue } from "@/types/technology-offer";

interface Tier3SectorDynamicFormProps {
  sectorCode: string;
  specValues: OfferSpecValue[];
  setSpecValues: React.Dispatch<React.SetStateAction<OfferSpecValue[]>>;
}

export function Tier3SectorDynamicForm({
  sectorCode,
  specValues,
  setSpecValues,
}: Tier3SectorDynamicFormProps) {
  const currentSector = TT17_SECTORS.find((s) => s.code === sectorCode) || TT17_SECTORS[0];

  // Khởi tạo hoặc cập nhật thông số ngành khi sectorCode thay đổi hoặc khi bấm nút
  const handleLoadSectorDefaults = () => {
    if (!currentSector?.defaultSpecs) return;

    // Giữ lại các thông số tự do (TIER_3_CUSTOM) và thông số chung (TIER_2_COMMON)
    const nonSectorSpecs = specValues.filter((s) => s.specCategory !== "TIER_3_SECTOR");

    const newSectorSpecs: OfferSpecValue[] = currentSector.defaultSpecs.map((ds, idx) => ({
      specCode: `SEC_${sectorCode}_${idx + 1}`,
      specName: ds.specName,
      specValue: "",
      unit: ds.unit || "",
      specCategory: "TIER_3_SECTOR",
    }));

    setSpecValues([...newSectorSpecs, ...nonSectorSpecs]);
  };

  // Tự động nạp mẫu ngành vào Lớp 3 khi chọn hoặc thay đổi ngành nghề ở tab trước
  useEffect(() => {
    if (!currentSector?.defaultSpecs || currentSector.defaultSpecs.length === 0) return;

    setSpecValues((prev) => {
      const sectorSpecs = prev.filter((s) => s.specCategory === "TIER_3_SECTOR");

      // Kiểm tra xem bộ thông số hiện tại có khớp đúng với sectorCode đang chọn hay không
      const isMatchingSector =
        sectorSpecs.length > 0 &&
        (sectorSpecs.some((s) => s.specCode?.startsWith(`SEC_${sectorCode}_`)) ||
          (sectorSpecs.length === currentSector.defaultSpecs!.length &&
            sectorSpecs.every((s, idx) => s.specName === currentSector.defaultSpecs![idx].specName)));

      // Nếu đã đúng mẫu ngành hiện tại thì không ghi đè để bảo lưu dữ liệu người dùng đang nhập
      if (isMatchingSector) {
        return prev;
      }

      // Giữ lại các thông số tự do (TIER_3_CUSTOM) và thông số chung
      const nonSectorSpecs = prev.filter((s) => s.specCategory !== "TIER_3_SECTOR");

      // Tự động nạp bộ trường chuẩn theo ngành mới
      const newSectorSpecs: OfferSpecValue[] = currentSector.defaultSpecs!.map((ds, idx) => {
        // Bảo lưu giá trị nếu người dùng đã từng nhập trường có cùng tên thông số
        const existing = sectorSpecs.find(
          (s) => s.specName.trim().toLowerCase() === ds.specName.trim().toLowerCase()
        );
        return {
          specCode: `SEC_${sectorCode}_${idx + 1}`,
          specName: ds.specName,
          specValue: existing?.specValue || "",
          unit: ds.unit || "",
          specCategory: "TIER_3_SECTOR",
        };
      });

      return [...newSectorSpecs, ...nonSectorSpecs];
    });
  }, [sectorCode, currentSector]);

  const updateSectorSpecValue = (index: number, val: string) => {
    setSpecValues((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], specValue: val };
      return copy;
    });
  };

  const sectorSpecsWithIndex = specValues
    .map((item, originalIndex) => ({ item, originalIndex }))
    .filter(({ item }) => item.specCategory === "TIER_3_SECTOR");

  return (
    <div className="rounded-2xl border border-brand-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Lớp 3: Bộ thông số chuyên môn ngành &ldquo;{currentSector.name}&rdquo;
            </h3>
            <p className="text-xs text-slate-500">
              Tải động từ Sheet Bo_loc_Cban (Excel Master 18 ngành TT17)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLoadSectorDefaults}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Nạp lại mẫu ngành
        </button>
      </div>

      {sectorSpecsWithIndex.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
          <AlertCircle className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-1 text-xs text-slate-600 font-semibold">
            Chưa có thông số mẫu cho ngành này.
          </p>
          <button
            type="button"
            onClick={handleLoadSectorDefaults}
            className="mt-2 text-xs font-bold text-brand-600 underline"
          >
            Nhấn vào đây để nạp bộ trường chuẩn
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {sectorSpecsWithIndex.map(({ item, originalIndex }) => (
            <div key={originalIndex} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 line-clamp-1" title={item.specName}>
                  {item.specName}
                </label>
                {item.unit && (
                  <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-xs font-mono text-slate-600 font-bold">
                    {item.unit}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={item.specValue}
                onChange={(e) => updateSectorSpecValue(originalIndex, e.target.value)}
                placeholder={`Nhập giá trị${item.unit ? ` (${item.unit})` : ""}`}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-brand-500 transition"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
