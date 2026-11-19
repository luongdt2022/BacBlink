"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { BAC_NINH_LOCATIONS } from "@/lib/constants/provinces";

const DEFAULT_BAC_NINH_LOCATIONS = BAC_NINH_LOCATIONS.filter((l) => l.code !== "ALL").map(
  (l) => l.name
);

/**
 * Hàm chuẩn hóa chuỗi tiếng Việt: loại bỏ dấu và ký tự đặc biệt để so khớp không dấu
 */
export function removeVietnameseDiacritics(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export interface SearchableProvinceComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  provinces?: string[];
  locations?: string[];
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  allowClear?: boolean;
}

export const SearchableProvinceCombobox: React.FC<SearchableProvinceComboboxProps> = ({
  value = "",
  onChange,
  placeholder = "Tất cả Địa bàn / KCN Bắc Ninh",
  provinces,
  locations,
  disabled = false,
  className = "",
  id,
  name,
  allowClear = true,
}) => {
  const optionsList = locations ?? provinces ?? DEFAULT_BAC_NINH_LOCATIONS;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Lọc danh sách địa bàn & KCN theo từ khóa tìm kiếm (hỗ trợ cả có dấu và không dấu)
  const filteredProvinces = useMemo(() => {
    if (!searchTerm.trim()) {
      return optionsList;
    }
    const normalizedTerm = removeVietnameseDiacritics(searchTerm);
    return optionsList.filter((p) => {
      const normalizedProvince = removeVietnameseDiacritics(p);
      return (
        normalizedProvince.includes(normalizedTerm) ||
        p.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    });
  }, [searchTerm, optionsList]);

  // Click outside listener để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Tự động focus vào ô tìm kiếm khi mở popover
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setHighlightedIndex(-1);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Điều khiển bàn phím (Arrow Up, Down, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredProvinces.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredProvinces.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredProvinces.length) {
        selectProvince(filteredProvinces[highlightedIndex]);
      } else if (filteredProvinces.length > 0) {
        selectProvince(filteredProvinces[0]);
      }
    }
  };

  const selectProvince = (provinceName: string) => {
    onChange(provinceName);
    setIsOpen(false);
    setSearchTerm("");
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left font-sans ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Nút Trigger hiển thị giá trị hiện tại */}
      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border ${
          isOpen
            ? "border-cyan-500 ring-2 ring-cyan-500/20"
            : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
        } rounded-lg shadow-sm text-slate-800 dark:text-slate-100 transition-all duration-150 focus:outline-none ${
          disabled ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800" : "cursor-pointer"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`block truncate ${!value ? "text-slate-400 dark:text-slate-500 font-normal" : "font-medium"}`}>
          {value || placeholder}
        </span>

        <div className="flex items-center space-x-1 pl-2">
          {allowClear && value && !disabled && (
            <span
              onClick={clearSelection}
              title="Xóa lựa chọn"
              className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          )}

          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-cyan-600" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Popover Dropdown Danh sách Tìm kiếm */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-2 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Ô Input Tìm kiếm */}
          <div className="px-3 pb-2 pt-1 border-b border-slate-100 dark:border-slate-800 relative">
            <div className="relative flex items-center">
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder="Gõ tên địa bàn, KCN (VD: Yen Phong, VSIP, Tu Son)..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Danh sách Địa bàn & KCN Bắc Ninh */}
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-60 overflow-y-auto px-1.5 py-1 text-xs space-y-0.5 focus:outline-none"
          >
            {/* Lựa chọn "Tất cả" nếu có */}
            {allowClear && (
              <li
                role="option"
                aria-selected={!value}
                onClick={() => selectProvince("")}
                className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                  !value
                    ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>{placeholder}</span>
                {!value && (
                  <svg className="w-3.5 h-3.5 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </li>
            )}

            {filteredProvinces.length > 0 ? (
              filteredProvinces.map((prov, index) => {
                const isSelected = value === prov;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={prov}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => selectProvince(prov)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 font-bold"
                        : isHighlighted
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span>{prov}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-4 text-center text-slate-400 dark:text-slate-500 italic text-caption">
                Không tìm thấy địa bàn hoặc KCN nào khớp với &quot;{searchTerm}&quot;
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableProvinceCombobox;
