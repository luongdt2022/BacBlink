"use client";

import React from "react";
import { Settings2, Cpu, Wrench } from "lucide-react";
import { OfferType } from "@/types/technology-offer";

interface Tier2CommonTechnicalFormProps {
  offerType: OfferType;
  modelCode: string;
  setModelCode: (val: string) => void;
  manufacturer: string;
  setManufacturer: (val: string) => void;
  originCountry: string;
  setOriginCountry: (val: string) => void;
  equipmentStatus: string;
  setEquipmentStatus: (val: string) => void;
  manufacturingYear?: number;
  setManufacturingYear: (val?: number) => void;
  capacityScale: string;
  setCapacityScale: (val: string) => void;
  energyConsumption: string;
  setEnergyConsumption: (val: string) => void;
  automationLevel: string;
  setAutomationLevel: (val: string) => void;
  operatingPrinciple: string;
  setOperatingPrinciple: (val: string) => void;
  deploymentConditions: string;
  setDeploymentConditions: (val: string) => void;
}

export function Tier2CommonTechnicalForm({
  offerType,
  modelCode,
  setModelCode,
  manufacturer,
  setManufacturer,
  originCountry,
  setOriginCountry,
  equipmentStatus,
  setEquipmentStatus,
  manufacturingYear,
  setManufacturingYear,
  capacityScale,
  setCapacityScale,
  energyConsumption,
  setEnergyConsumption,
  automationLevel,
  setAutomationLevel,
  operatingPrinciple,
  setOperatingPrinciple,
  deploymentConditions,
  setDeploymentConditions,
}: Tier2CommonTechnicalFormProps) {
  const isPhysical = offerType === "DEVICE" || offerType === "PRODUCT";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            {isPhysical ? <Wrench className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Lớp 2: Thông số kỹ thuật chung ({isPhysical ? "8 Thuộc Tính Thiết Bị / Sản Phẩm" : "3 Thuộc Tính Giải Pháp Số"})
            </h3>
            <p className="text-xs text-slate-500">
              Thông số vật lý tiêu chuẩn theo danh mục Excel Master (Tùy chọn bổ sung để tăng điểm tin cậy)
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
          Lớp 2 / Excel Master
        </span>
      </div>

      {isPhysical ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Mã Model / Ký hiệu</label>
            <input
              type="text"
              value={modelCode}
              onChange={(e) => setModelCode(e.target.value)}
              placeholder="VD: BL-CNC-5X-PRO"
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Hãng sản xuất / Thương hiệu</label>
            <input
              type="text"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="VD: Hanel PT / INTECH Group"
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Xuất xứ / Nước sản xuất</label>
            <input
              type="text"
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              placeholder="VD: Việt Nam, Đức, Nhật Bản"
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Tình trạng thiết bị</label>
            <select
              value={equipmentStatus}
              onChange={(e) => setEquipmentStatus(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-brand-500 transition cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
            >
              <option value="NEW">Mới 100% xuất xưởng</option>
              <option value="USED">Đã qua sử dụng (Chất lượng &gt; 85%)</option>
              <option value="REFURBISHED">Tân trang, nâng cấp cải tiến</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Năm sản xuất</label>
            <input
              type="number"
              value={manufacturingYear ?? ""}
              onChange={(e) => setManufacturingYear(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="VD: 2026"
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Công suất / Quy mô</label>
            <input
              type="text"
              value={capacityScale}
              onChange={(e) => setCapacityScale(e.target.value)}
              placeholder="VD: 50 sản phẩm/giờ"
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Tiêu thụ năng lượng</label>
            <input
              type="text"
              value={energyConsumption}
              onChange={(e) => setEnergyConsumption(e.target.value)}
              placeholder="VD: 15 kW/h"
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Mức độ tự động hóa</label>
            <select
              value={automationLevel}
              onChange={(e) => setAutomationLevel(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-brand-500 transition cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
            >
              <option value="FULLY_AUTOMATIC">Tự động hóa hoàn toàn (Full-Auto)</option>
              <option value="SEMI_AUTOMATIC">Bán tự động (Semi-Auto)</option>
              <option value="AI_INTEGRATED">Tích hợp AI & Robot thông minh</option>
              <option value="MANUAL">Thao tác thủ công có hỗ trợ</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Nguyên lý vận hành / Kiến trúc</label>
            <textarea
              rows={3}
              value={operatingPrinciple}
              onChange={(e) => setOperatingPrinciple(e.target.value)}
              placeholder="VD: Kiến trúc Microservices phân tán, thuật toán thị giác AI YOLOv11..."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Điều kiện triển khai / Hạ tầng</label>
            <textarea
              rows={3}
              value={deploymentConditions}
              onChange={(e) => setDeploymentConditions(e.target.value)}
              placeholder="VD: Máy chủ Ubuntu 22.04 LTS, GPU NVIDIA RTX 4090, Docker..."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Quy mô / Tải phục vụ định mức</label>
            <textarea
              rows={3}
              value={capacityScale}
              onChange={(e) => setCapacityScale(e.target.value)}
              placeholder="VD: 50.000 thiết bị kết nối đồng thời, xử lý 10.000 tx/giây..."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-brand-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
