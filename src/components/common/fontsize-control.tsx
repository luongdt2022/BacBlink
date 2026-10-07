"use client";

import React, { useState, useEffect } from "react";

type FontSize = "sm" | "base" | "lg";

const STORAGE_KEY = "nacentwin_font_size";

export function FontsizeControl({ className = "" }: { className?: string }) {
  const [size, setSize] = useState<FontSize>("base");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as FontSize | null;
    if (saved && (saved === "sm" || saved === "base" || saved === "lg")) {
      applySize(saved);
    }
    const syncSize = () => {
      const current = document.documentElement.dataset.textScale;
      if (current === "sm" || current === "base" || current === "lg") setSize(current);
    };
    window.addEventListener("nacentwin-font-size", syncSize);
    return () => window.removeEventListener("nacentwin-font-size", syncSize);
  }, []);

  const applySize = (s: FontSize) => {
    setSize(s);
    localStorage.setItem(STORAGE_KEY, s);
    document.documentElement.dataset.textScale = s;
    window.dispatchEvent(new Event("nacentwin-font-size"));
  };

  return (
    <div
      className={`inline-flex items-center rounded-control p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold ${className}`}
      title="Cỡ chữ tiếp cận"
    >
      <button
        type="button"
        onClick={() => applySize("sm")}
        className={`focus-ring min-h-11 min-w-11 px-1.5 py-0.5 rounded-md transition ${
          size === "sm"
            ? "bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-200 shadow-xs"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
        aria-label="Cỡ chữ nhỏ"
        aria-pressed={size === "sm"}
      >
        A-
      </button>
      <button
        type="button"
        onClick={() => applySize("base")}
        className={`focus-ring min-h-11 min-w-11 px-1.5 py-0.5 rounded-md transition ${
          size === "base"
            ? "bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-200 shadow-xs"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
        aria-label="Cỡ chữ chuẩn"
        aria-pressed={size === "base"}
      >
        A
      </button>
      <button
        type="button"
        onClick={() => applySize("lg")}
        className={`focus-ring min-h-11 min-w-11 px-1.5 py-0.5 rounded-md transition ${
          size === "lg"
            ? "bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-200 shadow-xs"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
        aria-label="Cỡ chữ lớn"
        aria-pressed={size === "lg"}
      >
        A+
      </button>
    </div>
  );
}
