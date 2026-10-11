"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Building2,
  ShieldCheck,
  Award,
  Layers,
  MapPin,
  Sparkles,
  Send,
  X,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  FileCheck2,
  Cpu
} from "lucide-react";
import {
  fetchEnterprises,
  type EnterpriseDirectoryItem,
  type EnterpriseDirectoryResponse
} from "@/lib/enterprise-client";

const SECTORS_TT17 = [
  { code: "", label: "Tất cả lĩnh vực" },
  { code: "LV01", label: "Cơ khí, Chế tạo máy & Tự động hóa" },
  { code: "LV05", label: "Nông nghiệp công nghệ cao, nông nghiệp số" },
  { code: "LV07", label: "Y - Dược, Sinh học & Thiết bị y tế" },
  { code: "LV08", label: "Công nghệ thông tin, chuyển đổi số" },
  { code: "LV11", label: "Vật liệu mới, nano & hóa chất tiên tiến" },
  { code: "LV12", label: "Năng lượng tái tạo & Công nghệ môi trường" },
  { code: "LV14", label: "Điện - Điện tử & Viễn thông" },
  { code: "LV15", label: "Chế biến thực phẩm & Đồ uống công nghệ cao" },
  { code: "LV16", label: "Dệt may, da giày & thời trang kỹ thuật" },
  { code: "LV17", label: "Logistics, Chuỗi cung ứng & Đô thị thông minh" },
];

const PROVINCES = [
  { code: "", label: "Toàn quốc (34 Tỉnh/Thành Trọng Điểm)" },
  { code: "Hà Nội", label: "Hà Nội" },
  { code: "Hồ Chí Minh", label: "TP. Hồ Chí Minh" },
  { code: "Hải Phòng", label: "Hải Phòng" },
  { code: "Đà Nẵng", label: "Đà Nẵng" },
  { code: "Cần Thơ", label: "Cần Thơ" },
  { code: "Lạng Sơn", label: "Lạng Sơn" },
  { code: "Bình Dương", label: "Bình Dương" },
  { code: "Đồng Nai", label: "Đồng Nai" },
  { code: "Bắc Ninh", label: "Bắc Ninh" },
];

const SUBJECT_TYPES = [
  { code: "", label: "Tất cả loại hình" },
  { code: "ENTERPRISE", label: "Doanh nghiệp thường" },
  { code: "INNOVATIVE_ENTERPRISE", label: "Doanh nghiệp ĐMST" },
  { code: "COOPERATIVE", label: "Hợp tác xã" },
  { code: "INSTITUTE_UNIVERSITY", label: "Viện nghiên cứu / Trường ĐH" },
  { code: "HOUSEHOLD_BUSINESS", label: "Hộ kinh doanh cá thể" },
];

const TNI_LEVELS = [
  { code: "", label: "Tất cả mức TNI" },
  { code: "HIGH", label: "TNI Cao (≥ 80 điểm)" },
  { code: "MEDIUM", label: "TNI Khá / TB (50 - 79 điểm)" },
  { code: "LOW", label: "TNI Thấp (< 50 điểm)" },
];

export default function EnterprisesDirectoryPage() {
  const [data, setData] = useState<EnterpriseDirectoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("");
  const [sectorCode, setSectorCode] = useState("");
  const [subjectType, setSubjectType] = useState("");
  const [tniClassification, setTniClassification] = useState("");
  const [page, setPage] = useState(1);

  // Modal đề xuất kết nối
  const [connectModalEnt, setConnectModalEnt] = useState<EnterpriseDirectoryItem | null>(null);
  const [connectNote, setConnectNote] = useState("");
  const [connectSubmitted, setConnectSubmitted] = useState(false);

  const loadData = async (pageTarget = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchEnterprises({
        q: q || undefined,
        province: province || undefined,
        sectorCode: sectorCode || undefined,
        subjectType: subjectType || undefined,
        tniClassification: tniClassification || undefined,
        page: pageTarget,
        pageSize: 9,
      });
      setData(res);
      setPage(pageTarget);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách doanh nghiệp.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [province, sectorCode, subjectType, tniClassification]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(1);
  };

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConnectSubmitted(true);
    setTimeout(() => {
      setConnectSubmitted(false);
      setConnectModalEnt(null);
      setConnectNote("");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-surface-page dark:bg-slate-950 text-text-primary dark:text-slate-100 pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-brand-700 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-brand-800 shadow-md">
        <div aria-hidden="true" className="innovation-hero-art pointer-events-none absolute inset-0" />
        <div className="relative max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-200 border border-brand-400/30 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            CSDL Quốc Gia 304 Doanh Nghiệp ĐMST & Đổi Mới Công Nghệ
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Danh Bạ Doanh Nghiệp & Chủ Thể Đổi Mới Sáng Tạo
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            Tra cứu năng lực khoa học công nghệ, bản quyền sở hữu trí tuệ, giải pháp sản xuất và chỉ số đổi mới sáng tạo (TNI) của hơn 300+ doanh nghiệp thực tế trên 34 tỉnh/thành trọng điểm.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-3xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên doanh nghiệp, mã số thuế (MST), tỉnh thành, ngành nghề..."
                className="w-full h-11 pl-11 pr-4 rounded-control bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-sm"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-6 bg-brand-700 hover:bg-brand-800 text-white rounded-control font-bold flex items-center justify-center gap-2 transition shadow-md text-sm shrink-0"
            >
              <Search className="w-4 h-4" /> Tra Cứu
            </button>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Bộ Lọc */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="surface-card p-5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border-default dark:border-slate-800">
                <span className="font-bold text-text-primary dark:text-white text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-700" /> Bộ Lọc Đa Chiều
                </span>
                {(province || sectorCode || subjectType || tniClassification || q) && (
                  <button
                    onClick={() => {
                      setQ("");
                      setProvince("");
                      setSectorCode("");
                      setSubjectType("");
                      setTniClassification("");
                    }}
                    className="text-xs text-brand-700 hover:underline font-semibold"
                  >
                    Xóa lọc
                  </button>
                )}
              </div>

              {/* Lọc Tỉnh Thành */}
              <div>
                <label className="block text-label font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Địa Bàn Hoạt Động
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="form-control w-full"
                >
                  {PROVINCES.map((p) => (
                    <option key={p.code} value={p.code}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Lọc Lĩnh Vực TT17 */}
              <div>
                <label className="block text-label font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Lĩnh Vực Công Nghệ TT17
                </label>
                <select
                  value={sectorCode}
                  onChange={(e) => setSectorCode(e.target.value)}
                  className="form-control w-full"
                >
                  {SECTORS_TT17.map((s) => (
                    <option key={s.code} value={s.code}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Lọc Loại Hình Chủ Thể */}
              <div>
                <label className="block text-label font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Loại Hình Chủ Thể
                </label>
                <select
                  value={subjectType}
                  onChange={(e) => setSubjectType(e.target.value)}
                  className="form-control w-full"
                >
                  {SUBJECT_TYPES.map((t) => (
                    <option key={t.code} value={t.code}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Lọc Phân Tầng TNI */}
              <div>
                <label className="block text-label font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Chỉ Số Nhu Cầu ĐMST (TNI)
                </label>
                <select
                  value={tniClassification}
                  onChange={(e) => setTniClassification(e.target.value)}
                  className="form-control w-full"
                >
                  {TNI_LEVELS.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Box Dashboard Link */}
            <div className="bg-gradient-to-br from-brand-50 to-brand-50 rounded-2xl border border-brand-200/80 p-5 space-y-3">
              <div className="flex items-center gap-2 text-brand-900 font-bold text-sm">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                Thống Kê 304 Doanh Nghiệp
              </div>
              <p className="text-xs text-brand-700 leading-relaxed">
                Xem báo cáo phân tích biểu đồ chuyên sâu về phân bố địa bàn, cơ cấu ngành nghề và rào cản công nghệ.
              </p>
              <Link
                href="/admin/enterprises/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800"
              >
                Mở Analytics Dashboard <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>

          {/* Grid Thẻ Doanh Nghiệp */}
          <section className="lg:col-span-3 space-y-6">
            {/* Thanh Tiêu Đề & Tổng Số */}
            <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-sm font-bold text-slate-800">
                Kết quả tra cứu:{" "}
                <span className="text-brand-600 font-extrabold">{data?.totalCount ?? 0}</span> doanh nghiệp
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Hiển thị trang {data?.page ?? 1} / {data?.totalPages ?? 1}</span>
              </div>
            </div>

            {/* UX STATE: LOADING */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 animate-pulse">
                    <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                    <div className="space-y-2 pt-2">
                      <div className="h-3.5 bg-slate-100 rounded"></div>
                      <div className="h-3.5 bg-slate-100 rounded w-5/6"></div>
                    </div>
                    <div className="h-9 bg-slate-200 rounded-xl mt-4"></div>
                  </div>
                ))}
              </div>
            )}

            {/* UX STATE: ERROR */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                <h3 className="font-bold text-red-900 text-base">Đã xảy ra lỗi khi tải dữ liệu</h3>
                <p className="text-xs text-red-600 max-w-md mx-auto">{error}</p>
                <button
                  onClick={() => loadData(page)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500 inline-flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Thử lại
                </button>
              </div>
            )}

            {/* UX STATE: EMPTY */}
            {!loading && !error && data && data.items.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">Không tìm thấy doanh nghiệp phù hợp</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Hãy thử điều chỉnh bộ lọc địa bàn, ngành nghề hoặc xóa từ khóa tìm kiếm để khám phá thêm doanh nghiệp khác.
                </p>
                <button
                  onClick={() => {
                    setQ("");
                    setProvince("");
                    setSectorCode("");
                    setSubjectType("");
                    setTniClassification("");
                  }}
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-500 transition"
                >
                  Xem toàn bộ 304 doanh nghiệp
                </button>
              </div>
            )}

            {/* UX STATE: SUCCESS (Cards Grid) */}
            {!loading && !error && data && data.items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.items.map((ent) => (
                  <div
                    key={ent.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-lg transition flex flex-col justify-between p-5 relative group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                          MST: {ent.taxCode}
                        </span>
                        {ent.isVerified && (
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                        )}
                      </div>

                      {/* Enterprise Name */}
                      <Link
                        href={`/enterprises/${ent.taxCode}`}
                        className="font-bold text-slate-900 group-hover:text-brand-600 line-clamp-2 text-sm leading-snug transition mb-3"
                      >
                        {ent.name}
                      </Link>

                      {/* Metadata Items */}
                      <div className="space-y-2 text-xs text-slate-600 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{ent.provinceCity || "Chưa xác định"}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-tight">{ent.mainSectorName || "Chưa phân ngành"}</span>
                        </div>
                        {ent.workforceScale && (
                          <div className="flex items-center gap-2 text-slate-500">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Quy mô: {ent.workforceScale}</span>
                          </div>
                        )}
                      </div>

                      {/* TNI & IP Highlights */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 mb-4">
                        <div className="bg-slate-50 p-2 rounded-xl text-center">
                          <div className="text-xs text-slate-500 font-semibold">Điểm TNI</div>
                          <div className="text-xs font-extrabold text-brand-700">
                            {ent.tniScore ? `${ent.tniScore.toFixed(1)}/100` : "Chưa chấm"}
                          </div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl text-center">
                          <div className="text-xs text-slate-500 font-semibold">Bằng SHTT</div>
                          <div className="text-xs font-extrabold text-brand-700 flex items-center justify-center gap-1">
                            <Award className="w-3 h-3" />
                            {ent.ipCount} sáng chế
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Link
                        href={`/enterprises/${ent.taxCode}`}
                        className="flex-1 py-2 px-3 text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                      >
                        Hồ Sơ
                      </Link>
                      <button
                        onClick={() => setConnectModalEnt(ent)}
                        className="py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                      >
                        <Send className="w-3 h-3" /> Kết Nối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => loadData(page - 1)}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Trước
                </button>
                {Array.from({ length: Math.min(data.totalPages, 7) }, (_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => loadData(pNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                        pNum === page
                          ? "bg-brand-600 text-white"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  disabled={page >= data.totalPages}
                  onClick={() => loadData(page + 1)}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Sau
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MODAL KẾT NỐI HỢP TÁC */}
      {connectModalEnt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setConnectModalEnt(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full mb-2">
                <Send className="w-3.5 h-3.5" /> Gửi Đề Xuất Hợp Tác
              </div>
              <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                {connectModalEnt.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Mã số thuế: {connectModalEnt.taxCode} • Địa bàn: {connectModalEnt.provinceCity}
              </p>
            </div>

            {connectSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
                <FileCheck2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Gửi Yêu Cầu Thành Công!</h4>
                <p className="text-xs text-emerald-700">
                  Nền tảng Nacentwin đã tiếp nhận đề xuất kết nối của bạn và chuyển tiếp tới đại diện doanh nghiệp.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConnectSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nội dung đề xuất hợp tác / Nhu cầu liên kết công nghệ
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={connectNote}
                    onChange={(e) => setConnectNote(e.target.value)}
                    placeholder="Mô tả tóm tắt nhu cầu cung ứng, tìm kiếm công nghệ hoặc đặt hàng tư vấn..."
                    className="w-full text-xs font-medium rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  * Theo quy định bảo mật dữ liệu NĐ 13/2023/NĐ-CP, thông tin liên hệ trực tiếp của doanh nghiệp sẽ được mở sau khi hai bên xác nhận chấp thuận kết nối.
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConnectModalEnt(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Gửi Đề Xuất
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
