"use client";

import React from "react";
import { useTheme } from "./theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`focus-ring inline-flex min-h-11 min-w-11 items-center justify-center p-2 rounded-control text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-white hover:bg-brand-50 dark:hover:bg-slate-800 transition ${className}`}
      aria-label={theme === "light" ? "Chuyển sang chế độ tối" : "Chuyển sang chế độ sáng"}
      title={theme === "light" ? "Chế độ Tối" : "Chế độ Sáng"}
      aria-pressed={theme === "dark"}
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400" />
      )}
    </button>
  );
}
