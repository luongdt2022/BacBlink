"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  CheckCircle,
  Clock,
  Handshake,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit,
  ShieldCheck,
  Award,
  MoreVertical,
  Building2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { fetchSellerWorkspace } from "@/services/api/technology-offer";
import { TechnologyOffer, SellerKpi } from "@/types/technology-offer";
import { IndexVerificationBadge } from "@/components/common/IndexVerificationBadge";

export default function SellerTechnologiesPage() {
  const [offers, setOffers] = useState<TechnologyOffer[]>([]);
  const [kpi, setKpi] = useState<SellerKpi>({
    totalOffers: 0,
    publishedOffers: 0,
    pendingOffers: 0,
    successfulConnections: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [trlFilter, setTrlFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadData = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetchSellerWorkspace({ page, limit: 20 });
      setOffers(res.data);
      setKpi(res.kpi);
      setTotalPages(res.totalPages ?? 1);
      setTotalCount(res.total ?? res.data.length);
      setCurrentPage(page);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, []);

  const filteredOffers = offers.filter((item) => {
    const matchSearch =
      searchTerm === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.offerCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "APPROVED" && item.status === "APPROVED") ||
      (statusFilter === "PENDING" && item.status === "PENDING") ||
      (statusFilter === "DRAFT" && item.status === "DRAFT");

    const trl = item.trlLevel || 0;
    const matchTrl =
      trlFilter === "ALL" ||
      (trlFilter === "TRL_1_3" && trl >= 1 && trl <= 3) ||
      (trlFilter === "TRL_4_6" && trl >= 4 && trl <= 6) ||
      (trlFilter === "TRL_7_9" && trl >= 7 && trl <= 9);

    return matchSearch && matchStatus && matchTrl;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/portal" className="hover:text-brand-700">Workspace</Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">Kho Công nghệ (TRL)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Quản Lý Kho Giải Pháp & Công Nghệ Chào Bán
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh mục công nghệ, cấp độ sẵn sàng TRL 1–9 và tình trạng thẩm định của Sở KH&CN.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/chao-ban-cong-nghe"
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-700 transition hidden sm:inline-block"
          >
            Xem sàn công khai →
          </Link>
          <Link
            href="/portal/seller/technologies/create"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Đăng Chào Bán Mới
          </Link>
        </div>
      </div>
        {/* KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Tổng số giải pháp</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{kpi.totalOffers}</p>
            <p className="text-xs text-slate-400">Trong danh mục của đơn vị</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Đang niêm yết công khai</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-600">{kpi.publishedOffers}</p>
            <p className="text-xs text-emerald-700 font-semibold">Đã được Sở KH&CN xác thực</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Chờ Sở duyệt hồ sơ</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-amber-600">{kpi.pendingOffers}</p>
            <p className="text-xs text-slate-400">SLA phản hồi &le; 48 giờ</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Kết nối thành công</span>
              <Handshake className="w-4 h-4 text-brand-500" />
            </div>
            <p className="text-2xl font-extrabold text-brand-700">{kpi.successfulConnections}</p>
            <p className="text-xs text-brand-600 font-semibold">Buyer quan tâm và liên hệ</p>
          </div>
        </div>

        {/* MANAGEMENT TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                Danh Mục Công Nghệ & Sáng Chế Của Đơn Vị
              </h3>
              <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                {filteredOffers.length} mục
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm công nghệ..."
                  className="form-control w-full pl-9 pr-3 text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-control text-sm font-medium"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="APPROVED">Đang hiển thị</option>
                <option value="PENDING">Chờ Sở duyệt</option>
                <option value="DRAFT">Bản nháp</option>
              </select>

              <select
                value={trlFilter}
                onChange={(e) => setTrlFilter(e.target.value)}
                className="form-control text-sm font-medium"
                data-testid="trl-filter-select"
              >
                <option value="ALL">Tất cả dải TRL</option>
                <option value="TRL_1_3">TRL 1–3 (Nghiên cứu Lab)</option>
                <option value="TRL_4_6">TRL 4–6 (Thử nghiệm Pilot)</option>
                <option value="TRL_7_9">TRL 7–9 (Thương mại hóa)</option>
              </select>

              <button
                onClick={() => loadData(1)}
                className="h-11 w-11 flex items-center justify-center text-slate-500 hover:text-slate-800 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-control shrink-0"
                title="Tải lại"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-xs">
                  <th className="py-3 px-3">Mã & Tên Công Nghệ</th>
                  <th className="py-3 px-3">Lĩnh Vực & Loại Hình</th>
                  <th className="py-3 px-3">Bộ Tứ SHTT & TRL</th>
                  <th className="py-3 px-3">Giá Đề Xuất</th>
                  <th className="py-3 px-3">Trạng Thái</th>
                  <th className="py-3 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOffers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5">
                        <span className="mono text-xs text-slate-400 font-bold block">
                          {item.offerCode}
                        </span>
                        <Link
                          href={`/chao-ban-cong-nghe/${item.id}`}
                          className="font-bold text-slate-900 hover:text-emerald-600 transition line-clamp-1 max-w-sm"
                        >
                          {item.title}
                        </Link>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-700 block truncate max-w-xs">
                          {item.sectorName}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                          {item.offerType === "SOLUTION"
                            ? "Giải pháp"
                            : item.offerType === "DEVICE"
                            ? "Thiết bị"
                            : "Sản phẩm"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {item.trlLevel ? (
                        <div className="space-y-1">
                          <IndexVerificationBadge
                            type="TRL"
                            value={item.trlLevel}
                            status={item.trlVerificationStatus}
                            authorityName={item.verifiedAuthorityName}
                            variant="compact"
                          />
                          <span className="text-xs text-slate-500 block truncate max-w-xs">
                            {item.ipRegistrationNumber || "Bằng sáng chế"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Bán thương phẩm</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-900">
                        {item.pricingType === "CONTACT" && "Thỏa thuận"}
                        {item.pricingType === "FIXED" &&
                          (item.priceAmount
                            ? `${(item.priceAmount / 1_000_000).toLocaleString("vi-VN")} Tr`
                            : "Thỏa thuận")}
                        {item.pricingType === "RANGE" &&
                          (item.priceMin
                            ? `${(item.priceMin / 1_000_000).toLocaleString("vi-VN")} - ${(
                                (item.priceMax || 0) / 1_000_000
                              ).toLocaleString("vi-VN")} Tr`
                            : "Thỏa thuận")}
                        {!item.pricingType && "Thỏa thuận"}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        {item.status === "APPROVED" && (
                          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 inline-block">
                            Đang niêm yết
                          </span>
                        )}
                        {item.status === "PENDING" && (
                          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 inline-block">
                            Chờ Sở KH&CN duyệt
                          </span>
                        )}
                        {item.status === "REJECTED" && (
                          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 inline-block">
                            Từ chối duyệt
                          </span>
                        )}
                        {item.status === "CHANGES_REQUESTED" && (
                          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 inline-block">
                            Cần bổ sung
                          </span>
                        )}
                        {item.status === "DRAFT" && (
                          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 inline-block">
                            Bản nháp
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-medium block truncate max-w-[160px]">
                          {item.managingAuthorityName || "Sở KH&CN TP. Hà Nội"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/chao-ban-cong-nghe/${item.id}`}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/portal/seller/technologies/${item.id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">
                Hiển thị {filteredOffers.length} / {totalCount} giải pháp (Trang {currentPage}/{totalPages})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadData(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1 || isLoading}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Trang trước
                </button>
                <div className="flex items-center gap-1 text-xs font-bold">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => loadData(p)}
                      className={`w-7 h-7 rounded-lg transition ${
                        currentPage === p
                          ? "bg-brand-700 text-white"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => loadData(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages || isLoading}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Trang sau
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
