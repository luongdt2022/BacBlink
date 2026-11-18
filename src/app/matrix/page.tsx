"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Star,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  Building2,
  Cpu,
  ArrowRight,
  Shield,
  Zap,
  Filter,
  MapPin
} from "lucide-react";
import { API_BASE } from "@/lib/api-client";
import { getBacNinhLocations, type LocationOption } from "@/lib/master-data-client";
import { AppButton } from "@/components/ui/design-system";

interface SectorItem {
  id?: string;
  code: string;
  name: string;
  tt17Code: string;
  description: string;
  isActive: boolean;
}

interface MatrixPair {
  fieldCode: string;
  fieldName: string;
  techCode: string;
  techName: string;
  ratingStars: number;
  weight: number;
}

export default function PublicMatrixExplorerPage() {
  const [sectors, setSectors] = useState<SectorItem[]>([]);
  const [matrixPairs, setMatrixPairs] = useState<MatrixPair[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFieldCode, setSelectedFieldCode] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setLocationsLoading(true);
      setError("");
      setLocationsError("");
      try {
        const [resSectors, resMatrix] = await Promise.all([
          fetch(`${API_BASE}/api/v1/master-data/sectors?activeOnly=true`, { cache: "no-store" }),
          fetch(`${API_BASE}/api/v1/master-data/matrix`, { cache: "no-store" })
        ]);

        if (!resSectors.ok || !resMatrix.ok) {
          throw new Error("Không thể tải dữ liệu danh mục ma trận.");
        }

        const dataSectors = await resSectors.json();
        const dataMatrix = await resMatrix.json();

        if (!cancelled) {
          if (Array.isArray(dataSectors.data)) {
            const activeSectors = dataSectors.data.filter((s: SectorItem) => s.isActive !== false);
            setSectors(activeSectors);
            if (activeSectors.length > 0) {
              setSelectedFieldCode(activeSectors[0].code);
            }
          }
          if (Array.isArray(dataMatrix.data)) {
            setMatrixPairs(dataMatrix.data);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Lỗi kết nối máy chủ");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const fetchLocations = async () => {
      try {
        const rows = await getBacNinhLocations();
        if (!cancelled) setLocations(rows);
      } catch (err: any) {
        if (!cancelled) setLocationsError(err?.message || "Không tải được danh mục Địa bàn & KCN Bắc Ninh.");
      } finally {
        if (!cancelled) setLocationsLoading(false);
      }
    };

    fetchData();
    fetchLocations();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeSector = sectors.find((s) => s.code === selectedFieldCode);

  const filteredPairs = matrixPairs.filter((p) => {
    const matchSector = selectedFieldCode ? p.fieldCode === selectedFieldCode : true;
    const q = (searchQuery || "").trim().toLowerCase();
    const matchSearch = !q ||
      (p.techName || "").toLowerCase().includes(q) ||
      (p.techCode || "").toLowerCase().includes(q) ||
      (p.fieldName || "").toLowerCase().includes(q);
    return matchSector && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white font-extrabold text-lg shadow-xs">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 text-base">BACLINK</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 border border-emerald-200">
                  INDUSTRIAL MATRIX EXPLORER
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Bản Đồ 8 Ngành Công Nghiệp BACLINK &amp; KCN Bắc Ninh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/sectors"
              className="text-xs font-bold text-slate-600 hover:text-emerald-700 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chế Độ Quản Trị</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden workspace-banner text-white py-10 px-4 border-b border-brand-800 shadow-md">
        <div className="relative z-10 max-w-7xl mx-auto space-y-4">
          <div className="max-w-3xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-brand-100 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-200" />
              Ma Trận Ngành Công Nghiệp &amp; Năng Lực Sản Xuất Bắc Ninh
            </span>
            <h1 className="type-page-title">
              Tra Cứu Ma Trận 8 Ngành Công Nghiệp &amp; Địa Bàn KCN Bắc Ninh
            </h1>
            <p className="text-xs sm:text-sm text-white/85">
              Hệ thống 8 ngành công nghiệp chuẩn BACLINK (IND_*) liên thông cùng mạng lưới Khu công nghiệp trọng điểm tỉnh Bắc Ninh (Yên Phong, Quế Võ, VSIP, Tiên Sơn...), giúp Doanh nghiệp nội địa và FDI kết nối chuỗi cung ứng hiệu quả.
            </p>
          </div>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 max-w-2xl">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên công nghệ (AI, Robot, IoT, Nông nghiệp...), mã CN..."
                className="w-full h-10 pl-10 pr-4 rounded-control bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-sm"
              />
            </div>
            <button
              type="button"
              className="w-full sm:w-auto h-10 px-5 bg-brand-800 hover:bg-brand-900 text-white rounded-control font-bold flex items-center justify-center gap-2 transition shadow-md text-sm shrink-0 border border-brand-600/40"
            >
              <Search className="w-4 h-4" /> Tra Cứu
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {error && (
          <div role="alert" className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {/* SECTION 1: SECTOR CARDS SELECTOR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="type-section-title text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                Lĩnh Vực Công Nghiệp Trọng Điểm
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chọn một lĩnh vực để xem ma trận công nghệ liên kết và các nguồn cung/nhu cầu thực tế.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-bold">
              {sectors.length} Lĩnh Vực Chuẩn Hóa
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {loading ? (
              <div className="col-span-full p-6 text-center text-xs text-slate-400">
                Đang tải danh mục lĩnh vực…
              </div>
            ) : sectors.map((sector) => {
              const isSelected = sector.code === selectedFieldCode;
              return (
                <div
                  key={sector.code}
                  onClick={() => setSelectedFieldCode(sector.code)}
                  className={`cursor-pointer p-3.5 rounded-2xl border transition hover:shadow-md space-y-2 ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
                      {sector.code}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">{sector.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {sector.code.startsWith("IND_") ? `Ngành công nghiệp (${sector.code})` : `Mã phân ngành: ${sector.code}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: MATRIX PAIRS TABLE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="type-card-title text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                <span>
                  Ma Trận Công Nghệ Cho:{" "}
                  <strong className="text-emerald-700">
                    [{selectedFieldCode}] {activeSector?.name}
                  </strong>
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Các giải pháp công nghệ có độ tương thích cao, làm trọng số ghép cặp cung - cầu
              </p>
            </div>
            <div className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-xl">
              {filteredPairs.length} Cặp Tương Thích
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Mã CN</th>
                  <th className="py-3 px-4">Nhóm Công Nghệ</th>
                  <th className="py-3 px-4 text-center">Mức Độ Phù Hợp</th>
                  <th className="py-3 px-4 text-right">Trọng Số Matching</th>
                  <th className="py-3 px-4 text-center">Độ Chín (TRL)</th>
                  <th className="py-3 px-4 text-center">Kết Nối Thực Tế</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-400">
                      Đang tải ma trận…
                    </td>
                  </tr>
                ) : filteredPairs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-400">
                      Chưa có cặp công nghệ tương thích cho lĩnh vực này.
                    </td>
                  </tr>
                ) : (
                  filteredPairs.map((pair, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <code className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                          {pair.techCode}
                        </code>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {pair.techName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-0.5 text-amber-500">
                          {Array.from({ length: Math.max(0, Math.min(5, Math.floor(pair.ratingStars || 0))) }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        {typeof pair.weight === "number" && !isNaN(pair.weight) ? pair.weight.toFixed(1) : "0.0"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 text-xs">
                          TRL 7 - TRL 9
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          href={`/experts?sector=${pair.fieldCode}`}
                          className="text-xs font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
                        >
                          <span>Tìm nguồn cung</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: BAC NINH LOCATIONS & KCNS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="type-card-title text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Mạng Lưới Địa Bàn &amp; Khu Công Nghiệp Trọng Điểm Bắc Ninh</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Danh mục 8+1 địa bàn và các KCN trọng điểm BACLINK phục vụ kết nối chuỗi cung ứng FDI – Nội địa
              </p>
            </div>
            <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-xl">
              {locationsLoading ? "Đang tải…" : `${locations.length} Địa bàn / KCN`}
            </span>
          </div>

          {locationsError ? (
            <div role="alert" className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
              {locationsError}
            </div>
          ) : locationsLoading ? (
            <div className="p-4 text-center text-xs text-slate-400">
              Đang tải danh mục Địa bàn &amp; KCN Bắc Ninh…
            </div>
          ) : locations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              Chưa có dữ liệu Địa bàn &amp; KCN Bắc Ninh.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {locations.map((loc) => {
                const locType = String(loc.locationType || loc.type || loc.metadata?.type || (loc.code.startsWith("KCN_") ? "KCN" : "AREA")).toUpperCase();
                return (
                  <div
                    key={loc.code}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{loc.name}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">{loc.code}</div>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold ${locType === "KCN" ? "bg-cyan-100 text-cyan-800" : "bg-amber-100 text-amber-800"}`}>
                      {locType === "KCN" ? "KCN" : "Địa bàn"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 4: CALL TO ACTION */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="type-card-title">Doanh Nghiệp Bắc Ninh Cần Kết Nối Chuỗi Cung Ứng?</h3>
            <p className="text-xs text-emerald-100">
              Gửi yêu cầu tìm kiếm nhà cung ứng hoặc công bố năng lực sản xuất trên Cổng Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK).
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/portal"
              className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition shadow-xs"
            >
              Vào Cổng Dịch Vụ
            </Link>
            <Link
              href="/experts"
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white border border-emerald-400 font-bold text-xs hover:bg-emerald-500 transition"
            >
              Tra Cứu Chuyên Gia
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
