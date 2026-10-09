"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchDashboardStats,
  EnterpriseDashboardStats,
} from "../../../../lib/enterprise-client";

export default function EnterpriseAdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EnterpriseDashboardStats | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchDashboardStats()
      .then((res) => setStats(res))
      .catch((err) => setError(err.message || "Không thể tải báo cáo thống kê."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-6xl mx-auto animate-pulse space-y-6">
          <div className="h-8 w-64 bg-slate-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 p-6"></div>
            ))}
          </div>
          <div className="h-96 bg-white rounded-2xl border border-slate-200"></div>
        </div>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl shadow border border-slate-200">
          <div className="text-rose-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Lỗi tải dữ liệu Dashboard</h2>
          <p className="text-sm text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700"
          >
            Thử lại
          </button>
        </div>
      </main>
    );
  }

  const verifiedPercent = stats.totalEnterprises > 0
    ? Math.round((stats.verifiedCount / stats.totalEnterprises) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Bảng Điều Khiển & Giám Sát 304 Doanh Nghiệp ĐMST
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Trung tâm Dữ liệu Đổi mới sáng tạo Quốc gia — Phân tích theo Thông tư 17/2019/TT-BKHCN
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/enterprises"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              📖 Xem Danh bạ
            </Link>
            <Link
              href="/gov/approvals/enterprises"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
            >
              🏛️ Cổng Thẩm định Sở
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">Tổng số DN trong kho</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalEnterprises}</div>
            <div className="text-xs text-slate-500 mt-1">304 DN mục tiêu khảo sát</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Đã xác thực (Sở KH&CN)</div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2">{stats.verifiedCount}</div>
            <div className="text-xs text-slate-500 mt-1">Tỷ lệ đạt chuẩn: <strong>{verifiedPercent}%</strong></div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-brand-600 tracking-wider">Địa bàn Tỉnh/Thành</div>
            <div className="text-3xl font-extrabold text-brand-600 mt-2">{stats.byProvince?.length || 0}</div>
            <div className="text-xs text-slate-500 mt-1">Tỉnh/TP có DN ĐMST ghi nhận</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-amber-600 tracking-wider">Lĩnh vực công nghệ</div>
            <div className="text-3xl font-extrabold text-amber-600 mt-2">{stats.bySector?.length || 0}</div>
            <div className="text-xs text-slate-500 mt-1">Ngành mũi nhọn theo TT17</div>
          </div>
        </div>

        {/* Charts & Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Province */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              📍 Phân bổ theo Địa bàn Trọng điểm
            </h3>
            <div className="space-y-3">
              {stats.byProvince && stats.byProvince.length > 0 ? (
                stats.byProvince.slice(0, 7).map((item, idx) => {
                  const pct = Math.round((item.count / stats.totalEnterprises) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.province || "Chưa xác định"}</span>
                        <span className="text-slate-900">{item.count} DN ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-600 rounded-full"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400">Chưa có dữ liệu phân bổ.</div>
              )}
            </div>
          </div>

          {/* By TNI Classification */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              ⚡ Phân hạng Chỉ số TNI (Chỉ số ĐMST)
            </h3>
            <div className="space-y-3">
              {stats.byTniClassification && stats.byTniClassification.length > 0 ? (
                stats.byTniClassification.map((item, idx) => {
                  const pct = Math.round((item.count / stats.totalEnterprises) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.classification || "Chưa phân loại"}</span>
                        <span className="text-slate-900">{item.count} DN ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400">Chưa có dữ liệu phân hạng.</div>
              )}
            </div>
          </div>

          {/* By Sector TT17 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              🏭 Cơ cấu theo Ngành Lĩnh Vực (TT17)
            </h3>
            <div className="space-y-3">
              {stats.bySector && stats.bySector.length > 0 ? (
                stats.bySector.slice(0, 6).map((item, idx) => {
                  const pct = Math.round((item.count / stats.totalEnterprises) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 truncate max-w-xs">{item.sector || "Ngành khác"}</span>
                        <span className="text-slate-900">{item.count} DN ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400">Chưa có dữ liệu cơ cấu.</div>
              )}
            </div>
          </div>

          {/* Top Bottlenecks */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-rose-700">
              ⚠️ Điểm nghẽn bức thiết nhất phản ánh từ Doanh nghiệp
            </h3>
            <div className="space-y-3">
              {stats.topBottlenecks && stats.topBottlenecks.length > 0 ? (
                stats.topBottlenecks.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 flex items-center justify-between text-xs">
                    <span className="font-medium text-rose-950">{item.name}</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-800">
                      {item.count} DN
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">Chưa ghi nhận điểm nghẽn.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
