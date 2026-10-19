"use client";

import React from "react";
import { BadgeDollarSign } from "lucide-react";
import { PricingType } from "@/types/technology-offer";

interface InlinePricingCardProps {
  pricingType: PricingType;
  setPricingType: (type: PricingType) => void;
  priceAmount?: number;
  setPriceAmount: (val?: number) => void;
  priceMin?: number;
  setPriceMin: (val?: number) => void;
  priceMax?: number;
  setPriceMax: (val?: number) => void;
  currency: string;
  setCurrency: (val: string) => void;
  unit: string;
  setUnit: (val: string) => void;
  errors: Record<string, string>;
}

export function InlinePricingCard({
  pricingType,
  setPricingType,
  priceAmount,
  setPriceAmount,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  currency,
  setCurrency,
  unit,
  setUnit,
  errors,
}: InlinePricingCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <BadgeDollarSign className="h-4 w-4 text-brand-700" />
        <h3 className="text-sm font-extrabold text-slate-900">
          Hình thức công bố giá <span className="text-rose-600">*</span>
        </h3>
      </div>

      {/* Radio options */}
      <div className="flex flex-wrap gap-2.5">
        <label
          className={`cursor-pointer rounded-lg border px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
            pricingType === "FIXED"
              ? "border-brand-600 bg-brand-50 text-brand-700 shadow-sm"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          <input
            type="radio"
            name="pricingType"
            checked={pricingType === "FIXED"}
            onChange={() => setPricingType("FIXED")}
            className="text-brand-600 focus:ring-brand-500"
          />
          Giá cụ thể
        </label>

        <label
          className={`cursor-pointer rounded-lg border px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
            pricingType === "RANGE"
              ? "border-brand-600 bg-brand-50 text-brand-700 shadow-sm"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          <input
            type="radio"
            name="pricingType"
            checked={pricingType === "RANGE"}
            onChange={() => setPricingType("RANGE")}
            className="text-brand-600 focus:ring-brand-500"
          />
          Khoảng giá
        </label>

        <label
          className={`cursor-pointer rounded-lg border px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
            pricingType === "CONTACT"
              ? "border-brand-600 bg-brand-50 text-brand-700 shadow-sm"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          <input
            type="radio"
            name="pricingType"
            checked={pricingType === "CONTACT"}
            onChange={() => setPricingType("CONTACT")}
            className="text-brand-600 focus:ring-brand-500"
          />
          Liên hệ báo giá
        </label>
      </div>

      {/* Dynamic input fields based on pricingType */}
      {pricingType === "FIXED" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-1">
          <div>
            <input
              type="number"
              value={priceAmount ?? ""}
              onChange={(e) =>
                setPriceAmount(e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="Giá chào bán cụ thể (VD: 150000000)"
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-brand-500"
            />
            {errors.priceAmount && (
              <p className="mt-1 text-xs text-rose-600">{errors.priceAmount}</p>
            )}
          </div>

          <div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-brand-500"
            >
              <option value="VND">VND (Việt Nam Đồng)</option>
              <option value="USD">USD (Đô la Mỹ)</option>
            </select>
          </div>

          <div>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Đơn vị tính: bộ, chiếc, hệ thống, gói..."
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-brand-500"
            />
          </div>
        </div>
      )}

      {pricingType === "RANGE" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 pt-1">
          <div>
            <input
              type="number"
              value={priceMin ?? ""}
              onChange={(e) =>
                setPriceMin(e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="Giá từ (VD: 50000000)"
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-brand-500"
            />
            {errors.priceMin && (
              <p className="mt-1 text-xs text-rose-600">{errors.priceMin}</p>
            )}
          </div>

          <div>
            <input
              type="number"
              value={priceMax ?? ""}
              onChange={(e) =>
                setPriceMax(e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="Giá đến (VD: 200000000)"
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-brand-500"
            />
            {errors.priceMax && (
              <p className="mt-1 text-xs text-rose-600">{errors.priceMax}</p>
            )}
          </div>

          <div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-brand-500"
            >
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Đơn vị tính: bộ, chiếc..."
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-brand-500"
            />
          </div>
        </div>
      )}

      {pricingType === "CONTACT" && (
        <p className="text-xs text-slate-500 italic bg-white p-2.5 rounded-lg border border-slate-200">
          Mức giá sẽ được thỏa thuận trực tiếp với Bên Mua dựa theo quy mô yêu cầu cụ thể qua Yêu cầu kết nối.
        </p>
      )}
    </div>
  );
}
