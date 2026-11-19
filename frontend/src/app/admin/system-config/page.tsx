"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Clock,
  ShieldCheck,
  Save,
  RotateCcw,
  Bell,
  Mail,
  Smartphone,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { authClient } from "@/lib/auth-client";

export interface SystemConfigSettings {
  slaBaseHours: number;
  officeHoursStart: string;
  officeHoursEnd: string;
  slaMonitorScanMinutes: number;
  emailAlertEnabled: boolean;
  smsAlertEnabled: boolean;
  overrideMinReasonChars: number;
  optimisticLockingEnabled: boolean;
  lastUpdated?: string;
  updatedBy?: string;
}

const DEFAULT_CONFIG: SystemConfigSettings = {
  slaBaseHours: 72,
  officeHoursStart: "08:00",
  officeHoursEnd: "17:00",
  slaMonitorScanMinutes: 15,
  emailAlertEnabled: true,
  smsAlertEnabled: false,
  overrideMinReasonChars: 20,
  optimisticLockingEnabled: true,
};

const STORAGE_KEY = "baclink_system_config";

export default function AdminSystemConfigPage() {
  const [config, setConfig] = useState<SystemConfigSettings>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load config from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // LocalStorage unavailable, use defaults
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (config.overrideMinReasonChars < 10) {
      setErrorMessage("Độ dài tối thiểu lý do giải trình phải từ 10 ký tự trở lên.");
      return;
    }

    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(config.officeHoursStart) || !timeRegex.test(config.officeHoursEnd)) {
      setErrorMessage("Định dạng giờ hành chính không hợp lệ (yêu cầu định dạng HH:mm, ví dụ 08:00 và 17:00).");
      return;
    }

    if (config.officeHoursStart >= config.officeHoursEnd) {
      setErrorMessage("Giờ bắt đầu làm việc phải nhỏ hơn giờ kết thúc làm việc.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      try {
        const updatedConfig = {
          ...config,
          lastUpdated: new Date().toISOString(),
          updatedBy: authClient.getUser()?.fullName || "Ban Quản trị Hiệp hội BACLINK",
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
        setConfig(updatedConfig);
        showToast("Đã lưu thành công cấu hình tham số SLA & quy chuẩn hệ thống!");
      } catch {
        setErrorMessage("Không thể lưu cấu hình vào bộ nhớ cục bộ.");
      } finally {
        setIsSaving(false);
      }
    }, 300);
  };

  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục toàn bộ tham số về mặc định ban đầu?")) {
      setConfig(DEFAULT_CONFIG);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      showToast("Đã khôi phục tham số hệ thống về giá trị chuẩn ban đầu.");
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* WAI-ARIA Standard Breadcrumbs */}
      <AdminBreadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Quản Trị Hệ Thống", href: "/admin" },
          { label: "Cấu Hình Hệ Thống & Tham Số SLA" },
        ]}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 text-xs font-bold mb-2 border border-pink-200 dark:border-pink-900">
            <Sliders className="w-3.5 h-3.5" />
            <span>Cấu Hình Vận Hành Hiệp Hội BACLINK</span>
          </div>
          <h1 className="font-bold text-slate-900 dark:text-white tracking-tight text-2xl">
            Cấu Hình Tham Số &amp; SLA Hệ Thống
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Thiết lập ngưỡng SLA 72h làm việc cho quy trình phê duyệt 1 cấp, giờ hành chính và quy chuẩn thông báo cảnh báo trễ hạn.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Mặc Định</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Đang lưu..." : "Lưu Cấu Hình"}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Interactive Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Khối 1: Tham Số SLA Phê Duyệt Hồ Sơ Hiệp Hội */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <Clock className="w-5 h-5 text-rose-500" />
              <span>Tham Số SLA Phê Duyệt Hồ Sơ Hiệp Hội</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              {config.slaBaseHours}h làm việc
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* SLA Base Hours */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Thời hạn SLA cơ sở phê duyệt hồ sơ 1 cấp:
              </label>
              <select
                value={config.slaBaseHours}
                onChange={(e) => setConfig({ ...config, slaBaseHours: Number(e.target.value) })}
                className="form-control-sm w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              >
                <option value={48}>48 giờ làm việc (2 ngày hành chính - Khẩn cấp)</option>
                <option value={72}>72 giờ làm việc (3 ngày hành chính - Tiêu chuẩn Hiệp hội BACLINK)</option>
                <option value={96}>96 giờ làm việc (4 ngày hành chính - Thẩm định chuyên sâu)</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Thời gian chỉ tính trong khung giờ hành chính (Thứ 2 đến Thứ 6).
              </p>
            </div>

            {/* Office Hours */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Bắt đầu giờ làm việc:
                </label>
                <input
                  type="time"
                  value={config.officeHoursStart}
                  onChange={(e) => setConfig({ ...config, officeHoursStart: e.target.value })}
                  placeholder="08:00"
                  className="form-control-sm w-full rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Kết thúc giờ làm việc:
                </label>
                <input
                  type="time"
                  value={config.officeHoursEnd}
                  onChange={(e) => setConfig({ ...config, officeHoursEnd: e.target.value })}
                  placeholder="17:00"
                  className="form-control-sm w-full rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Scan Cycle */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Chu kỳ quét SLA Monitor tự động:
              </label>
              <select
                value={config.slaMonitorScanMinutes}
                onChange={(e) => setConfig({ ...config, slaMonitorScanMinutes: Number(e.target.value) })}
                className="form-control-sm w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value={15}>15 phút / lần (Khuyến nghị vận hành)</option>
                <option value={30}>30 phút / lần</option>
                <option value={60}>60 phút / lần</option>
              </select>
            </div>
          </div>
        </div>

        {/* Khối 2: Cảnh Báo Khẩn & Chính Sách Admin Override */}
        <div className="space-y-6">
          {/* Cảnh báo tự động */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              <Bell className="w-5 h-5 text-amber-500" />
              <span>Kênh Cảnh Báo Khẩn Cấp Khi Quá Hạn</span>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-brand-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      Cảnh báo qua Email tự động
                    </div>
                    <div className="text-xs text-slate-500">
                      Gửi email thông báo cho Ban Quản trị Hiệp hội BACLINK khi hồ sơ chạm mốc 80% thời hạn SLA
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.emailAlertEnabled}
                  onChange={(e) => setConfig({ ...config, emailAlertEnabled: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      Cảnh báo tin nhắn SMS / OTT
                    </div>
                    <div className="text-xs text-slate-500">
                      Gửi tin nhắn khẩn cấp tới đầu mối Ban Quản trị khi hồ sơ trễ hạn &gt; 72h
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.smsAlertEnabled}
                  onChange={(e) => setConfig({ ...config, smsAlertEnabled: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                />
              </label>
            </div>
          </div>

          {/* Chính sách Giải trình & Kiểm soát Phê duyệt */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>Chính Sách Giải Trình &amp; Kiểm Soát Phê Duyệt</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Độ dài tối thiểu lý do giải trình thẩm định (Ký tự):
                </label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={config.overrideMinReasonChars}
                  onChange={(e) => setConfig({ ...config, overrideMinReasonChars: Number(e.target.value) })}
                  className="form-control-sm w-full rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Quy định tối thiểu 20 ký tự để lưu vết kiểm toán minh bạch tại Hiệp hội BACLINK.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Khóa lạc quan (Optimistic Concurrency 409):
                </span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>BẬT (Bắt buộc)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
