'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Pen, RotateCcw, Check, X, Trash2, AlertCircle, ShieldCheck } from 'lucide-react';

export interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dataUrl: string) => void;
  title?: string;
  initialDataUrl?: string;
}

/**
 * SignaturePadModal: Modal ký tay cảm ứng điện tử thuần HTML5 Canvas 2D API.
 * Hỗ trợ Retina High-DPI, chuột (mouse) & cảm ứng (touch) với touch-action: none.
 * Tích hợp cơ chế Anti-Blank Signature check.
 */
export function SignaturePadModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Ký Tên Xác Nhận Điện Tử',
  initialDataUrl
}: SignaturePadModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [blankError, setBlankError] = useState<string>('');

  // Lấy tọa độ tương đối của chuột hoặc ngón tay so với kích thước CSS của Canvas
  const getCoordinates = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0] || (e as TouchEvent).changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
    return {
      x: (e as MouseEvent).clientX - rect.left,
      y: (e as MouseEvent).clientY - rect.top
    };
  };

  // Khởi tạo Canvas và căn chỉnh Retina DPI
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Chiều rộng theo container, chiều cao cố định 220px
    const cssWidth = Math.min(container.clientWidth - 4, 570);
    const cssHeight = 220;
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0F172A'; // Xanh than đậm mực ký chuẩn
    ctx.lineWidth = 2.5;

    // Làm sạch
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // Nếu có ảnh ban đầu, vẽ lại
    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, cssWidth, cssHeight);
        setHasDrawn(true);
      };
      img.src = initialDataUrl;
    } else {
      setHasDrawn(false);
    }
    setBlankError('');
  }, [initialDataUrl]);

  useEffect(() => {
    if (isOpen) {
      // Cho modal render xong DOM rồi mới init canvas
      const timer = setTimeout(() => {
        initCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initCanvas]);

  // Xóa nét canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
    setBlankError('');
  };

  // Bắt đầu vẽ
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e) {
      // Tránh scroll trên mobile
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e.nativeEvent, canvas);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setBlankError('');
  };

  // Di chuyển nét vẽ
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ('touches' in e) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e.nativeEvent, canvas);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  // Kết thúc nét vẽ
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.closePath();
    }
  };

  // Xác nhận sử dụng chữ ký (BR-SIG-02 Anti-Blank Signature)
  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!hasDrawn) {
      setBlankError('Vui lòng ký tên vào khung trước khi xác nhận!');
      return;
    }

    try {
      const dataUrl = canvas.toDataURL('image/png');
      // Kiểm tra dataUrl có hợp lệ
      if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 50) {
        setBlankError('Vui lòng ký tên vào khung trước khi xác nhận!');
        return;
      }
      onConfirm(dataUrl);
      onClose();
    } catch {
      setBlankError('Lỗi khi xuất ảnh chữ ký. Vui lòng thử lại.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signature-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-brand-700 dark:text-cyan-400">
            <Pen className="w-5 h-5 shrink-0" />
            <h3 id="signature-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            aria-label="Đóng bảng ký"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hướng dẫn thao tác */}
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Dùng ngón tay / bút cảm ứng (trên điện thoại/tablet) hoặc chuột (trên PC) để ký.</span>
          <span className="font-semibold text-brand-600 dark:text-cyan-400 hidden sm:inline">Nét mực: Xanh đen</span>
        </div>

        {/* Canvas Drawing Container */}
        <div
          ref={containerRef}
          className="relative w-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white overflow-hidden flex items-center justify-center shadow-inner"
          style={{ minHeight: '220px' }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
            className="cursor-crosshair block select-none"
            style={{
              touchAction: 'none',
              background: '#FFFFFF'
            }}
          />

          {!hasDrawn && !isDrawing && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 select-none">
              <Pen className="w-8 h-8 opacity-30 mb-1" />
              <span className="text-xs font-medium opacity-60">Ký tên vào khung này</span>
            </div>
          )}
        </div>

        {/* Cảnh báo Anti-Blank */}
        {blankError && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{blankError}</span>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClear}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Xóa nét / Ký lại
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Xác nhận &amp; Sử dụng chữ ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface TouchSignatureFieldProps {
  id?: string;
  value?: string;
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  helperText?: string;
}

/**
 * TouchSignatureField (hoặc SignatureBoxPreview):
 * Component xem trước và kích hoạt ký điện tử cảm ứng chuẩn hóa.
 * Tái sử dụng độc lập cho /khao-sat-nhu-cau, /khao-sat-dmst và Deal Room.
 */
export function TouchSignatureField({
  id = 'signature-trigger-box',
  value,
  onChange,
  label = 'Chữ ký điện tử của người đại diện xác nhận',
  required = true,
  errorMessage,
  disabled = false,
  helperText = '(Hỗ trợ ngón tay/bút cảm ứng trên điện thoại, tablet hoặc chuột trên máy tính)'
}: TouchSignatureFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (disabled) return;
    setIsModalOpen(true);
  };

  const handleClearSignature = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange('');
  };

  return (
    <div id={id} className="space-y-2">
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {!value ? (
        // STATE 1 & STATE 4: CHƯA KÝ / ĐÃ XÓA
        <div
          onClick={handleOpenModal}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenModal();
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center gap-2 select-none cursor-pointer ${
            errorMessage
              ? 'border-red-400 bg-red-50/40 dark:bg-red-950/20'
              : 'border-sky-300 dark:border-sky-700/80 bg-sky-50/50 dark:bg-sky-950/20 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-cyan-300 flex items-center justify-center shadow-sm">
            <Pen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Bấm vào đây để ký tay / Chữ ký điện tử
            </div>
            {helperText && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {helperText}
              </div>
            )}
          </div>
        </div>
      ) : (
        // STATE 3: ĐÃ KÝ (SIGNED PREVIEW BOX)
        <div className="surface-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="bg-white rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center max-w-[240px] w-full sm:w-auto h-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Chữ ký điện tử người đại diện"
                className="max-h-20 max-w-full object-contain"
              />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-400/40">
                <ShieldCheck className="w-3.5 h-3.5" /> ✓ Đã ký điện tử
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nét ký cảm ứng đã được mã hóa Base64 PNG an toàn
              </p>
            </div>
          </div>

          {!disabled && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleOpenModal}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-700 dark:text-cyan-400 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 border border-brand-200 dark:border-brand-800 transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Ký lại
              </button>
              <button
                type="button"
                onClick={handleClearSignature}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa chữ ký
              </button>
            </div>
          )}
        </div>
      )}

      {/* Thông báo lỗi validation */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Modal vẽ chữ ký */}
      <SignaturePadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={(dataUrl) => {
          onChange(dataUrl);
        }}
        initialDataUrl={value}
      />
    </div>
  );
}

// Export alias để tương thích các tên gọi trong spec và tasks.md
export const SignatureBoxPreview = TouchSignatureField;
