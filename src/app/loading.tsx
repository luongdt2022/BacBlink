import React from "react";

/**
 * Global Loading State cho Next.js App Router (Streaming Fallback)
 * Render tức thì khi Server Components đang fetch dữ liệu, giữ nguyên vị trí Layout (Navbar/Footer)
 * giúp người dùng không cảm thấy màn hình bị giật trắng.
 */
export default function GlobalLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
      {/* Khối hiệu ứng trung tâm với Logo NacenTech */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Vòng quay nhẹ nhàng phong cách radar */}
        <div className="absolute w-20 h-20 rounded-full border-2 border-brand-200 dark:border-slate-800 border-t-nacen-green-500 animate-spin" />
        <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md flex items-center justify-center p-2.5">
          <div className="size-9 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 text-white font-black text-lg flex items-center justify-center shadow-inner">
            B
          </div>
        </div>
      </div>

      {/* Thông tin tải dữ liệu */}
      <div className="text-center space-y-2 max-w-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Đang nạp dữ liệu...
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Hệ thống đang kết nối dữ liệu chuỗi cung ứng BACLINK. Vui lòng chờ trong giây lát.
        </p>
      </div>

      {/* Khối mô phỏng Skeleton Card nhạt phía dưới */}
      <div className="w-full max-w-3xl mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-40 pointer-events-none">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 space-y-3 animate-pulse"
          >
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
            <div className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
