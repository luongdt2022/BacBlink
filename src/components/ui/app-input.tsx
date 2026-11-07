"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, X } from "lucide-react";

export interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  containerClassName?: string;
}

export const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      startIcon,
      endIcon,
      clearable = false,
      onClear,
      containerClassName,
      id: customId,
      required,
      disabled,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const hasValue = value !== undefined ? Boolean(value) : false;

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

          <input
            ref={ref}
            id={id}
            required={required}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              "w-full min-h-11 bg-transparent py-2 text-label text-text-primary placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500 font-sans",
              className
            )}
            {...props}
          />

          {clearable && hasValue && !disabled && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Xóa nội dung"
              className="ml-1.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 focus:outline-none focus-ring transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {endIcon && !error && (
            <div className="ml-2 flex items-center shrink-0 text-slate-400 dark:text-slate-500">
              {endIcon}
            </div>
          )}

          {error && (
            <div className="ml-2 flex items-center shrink-0 text-rose-500" aria-hidden="true">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
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

AppInput.displayName = "AppInput";
