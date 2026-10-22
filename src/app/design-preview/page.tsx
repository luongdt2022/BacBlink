"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Sliders, Layers, Sparkles, CheckCircle2 } from "lucide-react";

export default function SectorBannerDesignPreviewPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/enterprises"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-2 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Danh Bạ</span>
          </Link>
          <div className="h-4 w-px bg-slate-700"></div>
          <div>
            <h1 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>NacenTech UI/UX Showcase: Họa Tiết Watermark Background 10 Nhóm Ngành</span>
            </h1>
            <p className="text-xs text-slate-400">
              Giữ nguyên nền xanh Navy thương hiệu — Tùy biến logo chìm đặc thù cho từng ngành nghề
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/design-preview/sector-banners.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Mở Trang Toàn Màn Hình</span>
          </a>
        </div>
      </div>

      {/* Embedded Live Viewer Frame */}
      <div className="flex-1 w-full bg-slate-950">
        <iframe
          src="/design-preview/sector-banners.html"
          title="Sector Watermark Banner Showcase"
          className="w-full h-full min-h-[calc(100vh-70px)] border-0"
        />
      </div>
    </div>
  );
}
