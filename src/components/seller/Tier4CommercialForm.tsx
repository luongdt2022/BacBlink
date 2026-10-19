"use client";

import React from "react";
import { Handshake, Truck, CreditCard, ShieldAlert } from "lucide-react";

interface Tier4CommercialFormProps {
  transferPriorityMethod: string;
  setTransferPriorityMethod: (val: string) => void;
  priceIncludes: string;
  setPriceIncludes: (val: string) => void;
  taxAndExtraCosts: string;
  setTaxAndExtraCosts: (val: string) => void;
  supplyScope: string;
  setSupplyScope: (val: string) => void;
  deliveryTimeline: string;
  setDeliveryTimeline: (val: string) => void;
  paymentTerms: string;
  setPaymentTerms: (val: string) => void;
  warrantyTerms: string;
  setWarrantyTerms: (val: string) => void;
  technicalSupportMethod: string;
  setTechnicalSupportMethod: (val: string) => void;
  installationSupport: boolean;
  setInstallationSupport: (val: boolean) => void;
}

export function Tier4CommercialForm({
  transferPriorityMethod,
  setTransferPriorityMethod,
  priceIncludes,
  setPriceIncludes,
  taxAndExtraCosts,
  setTaxAndExtraCosts,
  supplyScope,
  setSupplyScope,
  deliveryTimeline,
  setDeliveryTimeline,
  paymentTerms,
  setPaymentTerms,
  warrantyTerms,
  setWarrantyTerms,
  technicalSupportMethod,
  setTechnicalSupportMethod,
  installationSupport,
  setInstallationSupport,
}: Tier4CommercialFormProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Handshake className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Lớp 4: Điều Kiện Thương Mại & Chuyển Giao Chi Tiết
            </h3>
            <p className="text-xs text-slate-500">
              Chuẩn hóa theo 8 quy tắc Excel Master (KT-66, GIA-74, GIA-75, GIA-76, GIA-77, GIA-78, GIA-80, GIA-81)
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
          Lớp 4 / Thương Mại
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Cột 1: Chuyển giao & Giá */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              KT-66: Hình thức chuyển giao ưu tiên
            </label>
            <select
              value={transferPriorityMethod}
              onChange={(e) => setTransferPriorityMethod(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs outline-none focus:border-brand-500"
            >
              <option value="PURCHASE_ORDER">Mua bán thương mại thông thường (Hợp đồng cung cấp thiết bị)</option>
              <option value="EXCLUSIVE_LICENSE">Chuyển giao quyền sử dụng độc quyền (Exclusive License)</option>
              <option value="NON_EXCLUSIVE_LICENSE">Chuyển giao quyền sử dụng không độc quyền</option>
              <option value="FULL_TRANSFER">Chuyển nhượng toàn bộ quyền sở hữu công nghệ</option>
              <option value="OEM_MANUFACTURING">Gia công sản xuất theo đơn đặt hàng (OEM/ODM)</option>
              <option value="JOINT_VENTURE">Liên doanh hợp tác sản xuất kinh doanh</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              GIA-74: Nội dung bao gồm trong giá
            </label>
            <textarea
              rows={2}
              value={priceIncludes}
              onChange={(e) => setPriceIncludes(e.target.value)}
              placeholder="VD: Đã bao gồm thiết bị chính, phụ kiện lắp đặt, chi phí vận chuyển nội địa và đào tạo vận hành 3 ngày."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              GIA-75: Thuế & chi phí phát sinh
            </label>
            <textarea
              rows={2}
              value={taxAndExtraCosts}
              onChange={(e) => setTaxAndExtraCosts(e.target.value)}
              placeholder="VD: Đã bao gồm VAT 8%; chi phí kiểm định chuyên ngành tại hiện trường do bên mua chi trả."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              GIA-76: Phạm vi cung cấp
            </label>
            <input
              type="text"
              value={supplyScope}
              onChange={(e) => setSupplyScope(e.target.value)}
              placeholder="VD: Toàn quốc / Miền Bắc / Quốc tế"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Cột 2: Giao hàng, Thanh toán & Hỗ trợ kỹ thuật */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              GIA-77: Thời gian giao hàng / Triển khai
            </label>
            <input
              type="text"
              value={deliveryTimeline}
              onChange={(e) => setDeliveryTimeline(e.target.value)}
              placeholder="VD: 30-45 ngày kể từ ngày tạm ứng hợp đồng"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              GIA-78: Điều kiện thanh toán
            </label>
            <textarea
              rows={2}
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="VD: Đợt 1 tạm ứng 30%, Đợt 2 thanh toán 50% khi giao hàng, Đợt 3 thanh toán 20% sau nghiệm thu."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              GIA-80: Thời hạn & điều kiện bảo hành
            </label>
            <input
              type="text"
              value={warrantyTerms}
              onChange={(e) => setWarrantyTerms(e.target.value)}
              placeholder="VD: 24 tháng bảo hành chính hãng, 1 đổi 1 trong 30 ngày"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              GIA-81: Hình thức hỗ trợ kỹ thuật
            </label>
            <input
              type="text"
              value={technicalSupportMethod}
              onChange={(e) => setTechnicalSupportMethod(e.target.value)}
              placeholder="VD: Cán bộ kỹ thuật trực tiếp tại hiện trường 24/7 & Hỗ trợ online"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={installationSupport}
                onChange={(e) => setInstallationSupport(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-700">
                Bao gồm hỗ trợ lắp đặt, cài đặt và chạy thử nghiệm tại nhà máy của Bên Mua
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
