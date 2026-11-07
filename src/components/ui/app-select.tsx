"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, AlertCircle } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface AppSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  startIcon?: React.ReactNode;
  containerClassName?: string;
}

export const AppSelect = React.forwardRef<HTMLSelectElement, AppSelectProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      options,
      placeholder,
      startIcon,
      containerClassName,
      id: customId,
      required,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={id}
            className="block text-label font-medium text-text-primary dark:text-slate-200"
          >
            {label}
            {required && <span className="ml-1 text-rose-500 font-bold">*</span>}
          </label>
        )}

        <div
          className={cn(
            "relative flex min-h-11 items-center w-full rounded-control border bg-white px-3 transition-colors dark:bg-slate-900",
            error
              ? "border-rose-500 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20"
              : "border-slate-300 focus-within:border-brand-700 focus-within:ring-2 focus-within:ring-brand-500/20 dark:border-slate-700",
            disabled && "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800"
          )}
        >
          {startIcon && (
            <div className="mr-2.5 flex items-center shrink-0 text-slate-400 dark:text-slate-500">
              {startIcon}
            </div>
          )}

          <select
            ref={ref}
            id={id}
            required={required}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              "w-full min-h-11 bg-transparent py-2 pr-7 text-label text-text-primary focus:outline-none dark:text-white appearance-none cursor-pointer font-sans disabled:cursor-not-allowed",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="dark:bg-slate-900 dark:text-white"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {error ? (
              <AlertCircle className="w-4 h-4 text-rose-500" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>

        {error ? (
          <p id={errorId} className="flex items-center space-x-1 text-xs text-rose-600 font-medium dark:text-rose-400" role="alert">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-text-secondary dark:text-slate-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

AppSelect.displayName = "AppSelect";
