"use client";

import React, { useRef } from "react";
import { Image as ImageIcon, Plus, Trash2, Video, FileText, Upload } from "lucide-react";

export interface MediaUploadSectionProps {
  mainImageUrl?: string | null;
  galleryImageUrls?: string[] | null;
  videoDemoUrl?: string | null;
  onMainImageChange: (url: string | null) => void;
  onGalleryImagesChange: (urls: string[]) => void;
  onVideoDemoChange?: (url: string | null) => void;
  disabled?: boolean;
}

export const MediaUploadSection: React.FC<MediaUploadSectionProps> = ({
  mainImageUrl,
  galleryImageUrls = [],
  videoDemoUrl,
  onMainImageChange,
  onGalleryImagesChange,
  onVideoDemoChange,
  disabled = false,
}) => {
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleMainFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh đại diện không được vượt quá 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onMainImageChange(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentList = [...(galleryImageUrls || [])];
    const remainingSlots = 6 - currentList.length;
    if (remainingSlots <= 0) {
      alert("Thư viện ảnh tối đa 6 tấm.");
      return;
    }

    const filesToRead = Array.from(files).slice(0, remainingSlots);
    filesToRead.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          currentList.push(event.target.result as string);
          onGalleryImagesChange([...currentList]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveGalleryImage = (index: number) => {
    const updated = (galleryImageUrls || []).filter((_, i) => i !== index);
    onGalleryImagesChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* 1. Ảnh đại diện 16:9 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-extrabold text-slate-800">
            Ảnh đại diện giải pháp (Tỷ lệ 16:9 hoặc 4:3, JPG/PNG ≤ 5MB)
          </label>
          {mainImageUrl && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onMainImageChange(null)}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Gỡ ảnh đại diện
            </button>
          )}
        </div>

        <input
          ref={mainInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          className="hidden"
          onChange={handleMainFileSelect}
        />

        {mainImageUrl ? (
          <div className="group relative aspect-video max-h-56 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-inner sm:w-80">
            <img
              src={mainImageUrl}
              alt="Ảnh đại diện"
              className="h-full w-full object-cover transition duration-300 group-hover:opacity-85"
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => mainInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100"
            >
              <span className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-800 shadow">
                Thay đổi ảnh khác
              </span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => mainInputRef.current?.click()}
            className="flex aspect-video max-h-56 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-brand-500 hover:bg-brand-50/40 sm:w-80"
          >
            <div className="rounded-full bg-white p-3 shadow-sm">
              <Upload className="h-5 w-5 text-brand-600" />
            </div>
            <span className="mt-2 text-xs font-bold text-slate-700">
              Nhấp để tải ảnh đại diện
            </span>
            <span className="mt-0.5 text-xs text-slate-400">
              Khuyến nghị độ phân giải 1280x720px
            </span>
          </button>
        )}
      </div>

      {/* 2. Thư viện ảnh chi tiết (Tối đa 6 ảnh) */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-extrabold text-slate-800">
            Thư viện ảnh chi tiết (Tối đa 6 ảnh cấu tạo, nguyên mẫu, ứng dụng)
          </label>
          <span className="text-xs font-semibold text-slate-400">
            {(galleryImageUrls || []).length} / 6 ảnh
          </span>
        </div>

        <input
          ref={galleryInputRef}
          type="file"
          multiple
          accept="image/png, image/jpeg, image/jpg"
          className="hidden"
          onChange={handleGalleryFileSelect}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          {(galleryImageUrls || []).map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm"
            >
              <img
                src={url}
                alt={`Ảnh chi tiết ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleRemoveGalleryImage(idx)}
                className="absolute right-1.5 top-1.5 rounded-md bg-rose-600/90 p-1 text-white opacity-0 shadow transition group-hover:opacity-100 hover:bg-rose-700"
                title="Xóa ảnh này"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}

          {(galleryImageUrls || []).length < 6 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => galleryInputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-brand-500 hover:bg-brand-50/50"
            >
              <Plus className="h-4 w-4 text-slate-500" />
              <span className="mt-1 text-xs font-bold text-slate-600">+ Thêm ảnh</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Video Demo / Giới thiệu */}
      {onVideoDemoChange && (
        <div>
          <label className="mb-1.5 block text-xs font-extrabold text-slate-800">
            Liên kết Video Demo / Giới thiệu giải pháp (YouTube, Vimeo hoặc MP4)
          </label>
          <div className="flex rounded-lg border border-slate-300 shadow-sm focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
            <span className="flex items-center px-3 text-slate-400">
              <Video className="h-4 w-4" />
            </span>
            <input
              type="url"
              disabled={disabled}
              value={videoDemoUrl || ""}
              onChange={(e) => onVideoDemoChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-r-lg py-2 pr-3 text-xs outline-none"
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Video trực quan giúp tăng 300% tỷ lệ kết nối thành công từ các doanh nghiệp mua.
          </p>
        </div>
      )}
    </div>
  );
};
