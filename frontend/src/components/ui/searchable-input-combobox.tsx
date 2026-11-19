"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, X, Check } from "lucide-react";

/**
 * Hàm chuẩn hóa chuỗi tiếng Việt: loại bỏ dấu để so khớp không dấu
 */
function removeVietnameseDiacritics(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export interface SearchableInputComboboxProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchableInputCombobox({
  id,
  value,
  onChange,
  options,
  placeholder = "-- Chọn hoặc gõ để tìm kiếm --",
  className = "",
  disabled = false,
}: SearchableInputComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Đồng bộ giá trị khi value từ bên ngoài thay đổi (ví dụ khi prefill từ MST hoặc profile)
  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Nếu searchTerm không khớp chính xác với option nào và value có giá trị, khôi phục lại value
        if (value && options.includes(value)) {
          setSearchTerm(value);
        } else if (!value) {
          setSearchTerm("");
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [value, options]);

  // Lọc options theo searchTerm
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return options;
    }
    const normalizedTerm = removeVietnameseDiacritics(searchTerm);
    return options.filter((opt) => {
      const normalizedOpt = removeVietnameseDiacritics(opt);
      return normalizedOpt.includes(normalizedTerm) || opt.toLowerCase().includes(searchTerm.toLowerCase().trim());
    });
  }, [searchTerm, options]);

  const handleSelect = (selectedVal: string) => {
    onChange(selectedVal);
    setSearchTerm(selectedVal);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex]);
      } else if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          id={id}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          disabled={disabled}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full h-[42px] px-3.5 py-2.5 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition pr-16 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
            isOpen ? "border-brand-600 ring-2 ring-brand-500/20" : "border-slate-300 dark:border-slate-700 hover:border-slate-400"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-100" : ""} ${className}`}
        />

        {/* Action icons bên phải: Clear & Dropdown */}
        <div className="absolute right-2.5 flex items-center gap-1 text-slate-400">
          {searchTerm && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Xóa lựa chọn"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (!disabled) {
                setIsOpen((prev) => !prev);
                inputRef.current?.focus();
              }
            }}
            className="p-1 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition"
            tabIndex={-1}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-100">
          <ul ref={listRef} role="listbox" className="p-1.5 space-y-0.5 text-xs sm:text-sm">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-3 text-center text-slate-400 text-xs italic">
                Không tìm thấy tỉnh thành phù hợp với "{searchTerm}"
              </li>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt === value;
                const isHighlighted = idx === highlightedIndex;
                return (
                  <li
                    key={opt}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelect(opt)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition ${
                      isHighlighted
                        ? "bg-brand-50 dark:bg-brand-950/60 text-brand-800 dark:text-cyan-300 font-semibold"
                        : isSelected
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
