import React, { useState, useEffect } from "react";

interface FormattedMoneyInputProps {
  id?: string;
  value: number; // Giá trị gốc luôn là VNĐ
  onChange: (val: number) => void;
  unit: "VND" | "TRIEU" | "TY";
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function formatVietnameseCurrencyText(vnd: number): string {
  if (!vnd || isNaN(vnd) || vnd <= 0) return "0 đ";
  if (vnd >= 1_000_000_000_000) {
    const ty = vnd / 1_000_000_000_000;
    return `${ty.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} nghìn tỷ đ`;
  }
  if (vnd >= 1_000_000_000) {
    const ty = vnd / 1_000_000_000;
    return `${ty.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ đ`;
  }
  if (vnd >= 1_000_000) {
    const tr = vnd / 1_000_000;
    return `${tr.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} triệu đ`;
  }
  return `${vnd.toLocaleString("vi-VN")} đ`;
}

export function FormattedMoneyInput({
  id,
  value,
  onChange,
  unit,
  placeholder,
  className = "",
  disabled = false,
}: FormattedMoneyInputProps) {
  // Chuyển đổi từ VNĐ sang giá trị hiển thị theo đơn vị đang chọn
  const getDisplayValue = (vnd: number): string => {
    if (vnd === undefined || vnd === null || isNaN(vnd)) return "";
    let val = vnd;
    if (unit === "TRIEU") val = vnd / 1_000_000;
    else if (unit === "TY") val = vnd / 1_000_000_000;

    // Làm tròn tránh lỗi floating point như 59999999995
    val = Math.round(val * 100) / 100;
    if (val === 0) return "0";
    return val.toLocaleString("en-US");
  };

  const [text, setText] = useState<string>(() => getDisplayValue(value));

  useEffect(() => {
    setText(getDisplayValue(value));
  }, [value, unit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "").trim();
    if (raw === "" || raw === "-") {
      setText(raw);
      onChange(0);
      return;
    }

    const num = parseFloat(raw);
    if (isNaN(num)) return;

    let vnd = num;
    if (unit === "TRIEU") vnd = num * 1_000_000;
    else if (unit === "TY") vnd = num * 1_000_000_000;

    vnd = Math.round(vnd);
    setText(num.toLocaleString("en-US"));
    onChange(vnd);
  };

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        disabled={disabled}
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold text-right pr-14 focus:ring-2 focus:ring-brand-500 transition ${className}`}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none uppercase">
        {unit === "TY" ? "Tỷ" : unit === "TRIEU" ? "Triệu" : "VNĐ"}
      </span>
    </div>
  );
}
