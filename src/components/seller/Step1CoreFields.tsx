"use client";

import React from "react";
import { Settings2, Package, Cpu } from "lucide-react";
import { OfferType, BACLINK_SECTORS, TT17_SECTORS } from "@/types/technology-offer";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";

interface Step1CoreFieldsProps {
  offerType: OfferType;
  setOfferType: (type: OfferType) => void;
  sectorCode: string;
  setSectorCode: (code: string) => void;
  hasTechTransfer: boolean;
  setHasTechTransfer: (val: boolean) => void;
  title: string;
  setTitle: (val: string) => void;
  summary: string;
  setSummary: (val: string) => void;
  problemSolved: string;
  setProblemSolved: (val: string) => void;
  errors: Record<string, string>;
  filledCount: number;
}

export function Step1CoreFields({
  offerType,
  setOfferType,
  sectorCode,
  setSectorCode,
  hasTechTransfer,
  setHasTechTransfer,
  title,
  setTitle,
  summary,
  setSummary,
  problemSolved,
  setProblemSolved,
  errors,
  filledCount,
}: Step1CoreFieldsProps) {
  const baseSectors = [...BACLINK_SECTORS];
  if (sectorCode && !baseSectors.some((s) => s.code === sectorCode)) {
    const legacyMatch = TT17_SECTORS.find((s) => s.code === sectorCode);
    if (legacyMatch) baseSectors.push(legacyMatch);
  }
  const sectorOptions = baseSectors.map((s) => ({
    value: s.code,
    label: s.name,
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              1. Thông tin để đăng và tra cứu
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Các trường có dấu <span className="font-bold text-rose-600">*</span> là đề xuất tối giản trong Basic Design; thông tin tài khoản được tự điền khi đăng nhập.
            </p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
            Đã điền {filledCount} / 6
          </span>
        </div>
      </div>

      {/* 1. Loại chào bán */}
      <div>
        <label className="mb-2 block text-xs font-extrabold text-slate-700">
          Loại chào bán <span className="text-rose-600">*</span>
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setOfferType("DEVICE")}
            className={`rounded-xl border-2 p-3.5 text-left transition ${
              offerType === "DEVICE"
                ? "border-brand-600 bg-brand-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <Settings2 className="mb-2 h-5 w-5 text-brand-600" />
            <div className="text-sm font-extrabold text-slate-900">Thiết bị</div>
            <div className="mt-0.5 text-xs text-slate-500">Máy móc, dây chuyền, tổ hợp</div>
          </button>

          <button
            type="button"
            onClick={() => setOfferType("PRODUCT")}
            className={`rounded-xl border-2 p-3.5 text-left transition ${
              offerType === "PRODUCT"
                ? "border-emerald-600 bg-emerald-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <Package className="mb-2 h-5 w-5 text-emerald-600" />
            <div className="text-sm font-extrabold text-slate-900">Sản phẩm</div>
            <div className="mt-0.5 text-xs text-slate-500">Hàng hóa, vật liệu, chế phẩm</div>
          </button>

          <button
            type="button"
            onClick={() => setOfferType("SOLUTION")}
            className={`rounded-xl border-2 p-3.5 text-left transition ${
              offerType === "SOLUTION"
                ? "border-cyan-600 bg-cyan-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <Cpu className="mb-2 h-5 w-5 text-cyan-600" />
            <div className="text-sm font-extrabold text-slate-900">Giải pháp công nghệ</div>
            <div className="mt-0.5 text-xs text-slate-500">Quy trình, phần mềm, giải pháp số</div>
          </button>
        </div>
        {errors.offerType && (
          <p className="mt-1 text-xs text-rose-600">{errors.offerType}</p>
        )}
      </div>

      {/* 2. Tên sản phẩm / thiết bị / công nghệ (Order: xuất hiện trước Ngành) */}
      <div>
        <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
          Tên sản phẩm / thiết bị / công nghệ <span className="text-rose-600">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ví dụ: Máy sấy thăng hoa chân không thông minh hoặc Robot hàn laser 6 trục"
          className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-rose-600">{errors.title}</p>
        )}
      </div>

      {/* 3 & 4. Mô tả ngắn giải pháp & Công dụng bài toán kỹ thuật */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
            Mô tả ngắn giải pháp <span className="text-rose-600">*</span>
          </label>
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Nêu ngắn gọn đặc điểm chính của đối tượng chào bán"
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          {errors.summary && (
            <p className="mt-1 text-xs text-rose-600">{errors.summary}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
            Công dụng / Bài toán kỹ thuật giải quyết <span className="text-rose-600">*</span>
          </label>
          <textarea
            rows={3}
            value={problemSolved}
            onChange={(e) => setProblemSolved(e.target.value)}
            placeholder="Sản phẩm giải quyết nỗi đau, nhu cầu nào cho bên mua?"
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          {errors.problemSolved && (
            <p className="mt-1 text-xs text-rose-600">{errors.problemSolved}</p>
          )}
        </div>
      </div>

      {/* 5 & 6. Ngành công nghiệp & Có chuyển giao công nghệ? */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
            Ngành công nghiệp (BACLINK) <span className="text-rose-600">*</span>
          </label>
          <SearchableCombobox
            ariaLabel="Ngành công nghiệp (BACLINK)"
            placeholder="Tìm và chọn ngành..."
            searchPlaceholder="Tìm ngành công nghiệp..."
            options={sectorOptions}
            value={sectorCode}
            onChange={setSectorCode}
          />
          <p className="mt-1 text-xs text-slate-500">
            Ngành quyết định bộ thông số kỹ thuật chuẩn ở Bước 2.
          </p>
          {errors.sectorCode && (
            <p className="mt-1 text-xs text-rose-600">{errors.sectorCode}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
            Có chuyển giao công nghệ? <span className="text-rose-600">*</span>
          </label>
          <div className="flex rounded-lg border border-slate-300 p-1 bg-slate-50">
            <button
              type="button"
              onClick={() => setHasTechTransfer(false)}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-bold transition ${
                !hasTechTransfer
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Không
            </button>
            <button
              type="button"
              onClick={() => setHasTechTransfer(true)}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-bold transition ${
                hasTechTransfer
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Có
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Chọn Có sẽ kích hoạt khung khai báo mức TRL và bảo hộ SHTT.
          </p>
        </div>
      </div>
    </div>
  );
}
