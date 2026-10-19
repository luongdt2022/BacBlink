'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X, Sparkles } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
  code?: string;
  group?: string;
  badge?: string;
  recommended?: boolean;
}

interface SearchableComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

function normalizeVietnamese(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

export function SearchableCombobox({
  value,
  onChange,
  options,
  placeholder = '-- Chọn mục --',
  searchPlaceholder = 'Gõ từ khóa hoặc mã để lọc nhanh...',
  emptyMessage = 'Không tìm thấy kết quả phù hợp',
  className = '',
  disabled = false,
  ariaLabel,
}: SearchableComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const qNorm = normalizeVietnamese(searchQuery);
    const qRaw = searchQuery.toLowerCase().trim();
    return options.filter((opt) => {
      const labelNorm = normalizeVietnamese(opt.label);
      const codeNorm = opt.code ? normalizeVietnamese(opt.code) : '';
      const groupNorm = opt.group ? normalizeVietnamese(opt.group) : '';
      return (
        labelNorm.includes(qNorm) ||
        opt.label.toLowerCase().includes(qRaw) ||
        codeNorm.includes(qNorm) ||
        groupNorm.includes(qNorm)
      );
    });
  }, [options, searchQuery]);

  // Group options if any option has a `group` property
  const groupedOptions = useMemo(() => {
    const hasGroups = filteredOptions.some((o) => !!o.group);
    if (!hasGroups) {
      return [{ groupName: '', items: filteredOptions }];
    }
    const groups: { groupName: string; items: ComboboxOption[] }[] = [];
    const map = new Map<string, ComboboxOption[]>();
    for (const opt of filteredOptions) {
      const g = opt.group || 'Danh mục khác';
      if (!map.has(g)) {
        const arr: ComboboxOption[] = [];
        map.set(g, arr);
        groups.push({ groupName: g, items: arr });
      }
      map.get(g)!.push(opt);
    }
    return groups;
  }, [filteredOptions]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      const idx = options.findIndex((o) => o.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 15);
    }
  }, [isOpen, options, value]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        filteredOptions.length > 0 ? (prev + 1) % filteredOptions.length : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        filteredOptions.length > 0
          ? (prev - 1 + filteredOptions.length) % filteredOptions.length
          : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex].value);
      }
    }
  };

  let flatCursor = -1;

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden native select for backward compatibility with form readers & automated tests */}
      <select
        tabIndex={-1}
        aria-hidden="true"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="sr-only pointer-events-none"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        title={selectedOption ? selectedOption.label : placeholder}
        className={`form-control w-full text-xs font-medium flex items-center justify-between gap-1.5 text-left transition-all ${
          isOpen
            ? 'ring-2 ring-cyan-500/40 border-cyan-500 dark:border-cyan-400'
            : ''
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="truncate flex items-center gap-1.5 min-w-0 flex-1">
          {selectedOption ? (
            <span className="truncate text-slate-900 dark:text-slate-100">
              {selectedOption.label}
            </span>
          ) : (
            <span className="truncate text-slate-400 dark:text-slate-500">
              {placeholder}
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-brand-600 dark:text-cyan-400' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown with Search Filter */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 z-50 mt-1.5 w-full min-w-[290px] sm:min-w-[340px] max-w-[92vw] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Sticky Search Input */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand-600 dark:focus:border-cyan-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Xóa từ khóa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            className="max-h-64 overflow-y-auto divide-y divide-slate-100/60 dark:divide-slate-800/60 p-1"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-3 text-center text-xs text-slate-400 dark:text-slate-500">
                {emptyMessage}
              </div>
            ) : (
              groupedOptions.map((grp) => (
                <div key={grp.groupName || 'default'} className="py-0.5">
                  {grp.groupName && (
                    <div className="px-2.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-brand-700 dark:text-cyan-400 bg-brand-50/60 dark:bg-slate-800/80 rounded-md mb-0.5 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 shrink-0" />
                      <span className="truncate">{grp.groupName}</span>
                    </div>
                  )}
                  {grp.items.map((opt) => {
                    flatCursor++;
                    const currentIdx = flatCursor;
                    const isSelected = opt.value === value;
                    const isHighlighted = currentIdx === highlightedIndex;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setHighlightedIndex(currentIdx)}
                        onClick={() => handleSelect(opt.value)}
                        className={`w-full px-2.5 py-2 rounded-lg text-left text-xs flex items-start justify-between gap-2 transition-colors ${
                          isSelected
                            ? 'bg-brand-50 dark:bg-brand-950/80 text-brand-800 dark:text-cyan-300 font-bold'
                            : isHighlighted
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="leading-snug break-words">{opt.label}</div>
                          {opt.badge && (
                            <span className="inline-block mt-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-brand-700 dark:text-cyan-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableCombobox;

