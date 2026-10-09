"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchEnterprises,
  approveEnterpriseGov,
  rejectEnterpriseGov,
  EnterpriseDirectoryItem,
} from "../../../../lib/enterprise-client";

export default function GovEnterpriseApprovalPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enterprises, setEnterprises] = useState<EnterpriseDirectoryItem[]>([]);
  const [filterProvince, setFilterProvince] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Action
  const [selectedItem, setSelectedItem] = useState<EnterpriseDirectoryItem | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchEnterprises({
        q: searchQuery,
        province: filterProvince,
        pageSize: 50,
      });
      setEnterprises(res.items || []);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterProvince]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const filteredItems = enterprises.filter((item) => {
    if (filterStatus === "pending") return !item.isVerified;
    if (filterStatus === "verified") return item.isVerified;
    return true;
  });

  const handleConfirmAction = async () => {
    if (!selectedItem || !actionType) return;
    try {
      setSubmitting(true);
      setError(null);
      if (actionType === "approve") {
        await approveEnterpriseGov(selectedItem.id, actionNotes);
        setActionSuccessMsg(`Đã phê duyệt thành công doanh nghiệp ${selectedItem.name}!`);
      } else {
        await rejectEnterpriseGov(selectedItem.id, actionNotes);
        setActionSuccessMsg(`Đã gửi yêu cầu bổ sung hồ sơ tới doanh nghiệp ${selectedItem.name}!`);
      }
      setSelectedItem(null);
      setActionType(null);
      setActionNotes("");
      await loadData();
    } catch (err: any) {
      setError(err.message || "Xử lý hồ sơ thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Cổng Thẩm Định & Xác Nhận Hồ Sơ ĐMST Cấp Sở
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Dành cho Cán bộ Quản lý Sở Khoa học & Công nghệ — Thẩm định dữ liệu theo Quyết định số 844/QĐ-TTg
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/enterprises/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              📊 Báo cáo Thống kê
            </Link>
            <Link
              href="/enterprises"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              📖 Danh bạ Công khai
            </Link>
          </div>
        </div>

        {/* Action Alert */}
        {actionSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center justify-between">
            <span>✓ {actionSuccessMsg}</span>
            <button onClick={() => setActionSuccessMsg(null)} className="font-bold">✕</button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="font-bold">✕</button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo Tên DN hoặc Mã số thuế..."
              className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shrink-0"
            >
              Tìm kiếm
            </button>
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ thẩm định / Chưa duyệt</option>
              <option value="verified">Đã kiểm chứng (Verified)</option>
            </select>

            <input
              type="text"
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
              placeholder="Lọc theo Tỉnh/TP..."
              className="p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 w-36"
            />
          </div>
        </div>

        {/* Table List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Đang tải danh sách hồ sơ...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              Không tìm thấy hồ sơ doanh nghiệp nào phù hợp điều kiện lọc.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Doanh nghiệp / MST</th>
                    <th className="p-4">Địa bàn & Ngành</th>
                    <th className="p-4">Chỉ số TNI</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác thẩm định</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4">
                        <Link
                          href={`/enterprises/${item.taxCode}`}
                          className="font-bold text-slate-900 hover:text-brand-600 block"
                        >
                          {item.name}
                        </Link>
                        <span className="font-mono text-slate-400 text-xs">MST: {item.taxCode}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{item.provinceCity || "---"}</div>
                        <div className="text-slate-400 text-xs truncate max-w-xs">{item.mainSectorName || "---"}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 font-semibold text-xs">
                          {item.tniClassification || "Đang tính"} {item.tniScore ? `(${item.tniScore.toFixed(1)})` : ""}
                        </span>
                      </td>
                      <td className="p-4">
                        {item.isVerified ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs">
                            ✓ Đã phê duyệt
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs">
                            ⏳ Chờ thẩm định
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Link
                          href={`/enterprises/${item.taxCode}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium inline-block"
                        >
                          Xem hồ sơ
                        </Link>
                        {!item.isVerified && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setActionType("approve");
                                setActionNotes("Hồ sơ đầy đủ tính pháp lý và tiêu chuẩn ĐMST theo quy định.");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            >
                              Phê duyệt
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setActionType("reject");
                                setActionNotes("Vui lòng bổ sung giấy chứng nhận SHTT hoặc làm rõ cơ cấu ngân sách R&D.");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                            >
                              Yêu cầu bổ sung
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Action Dialog */}
      {selectedItem && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800">
              {actionType === "approve" ? "Phê duyệt hồ sơ doanh nghiệp" : "Yêu cầu bổ sung hồ sơ"}
            </h3>
            <p className="text-xs text-slate-600">
              Doanh nghiệp: <strong>{selectedItem.name}</strong> (MST: {selectedItem.taxCode})
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ý kiến thẩm định / Ghi chú của Sở KH&CN *
              </label>
              <textarea
                rows={3}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Nhập nhận xét hoặc lý do yêu cầu bổ sung..."
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setActionType(null);
                }}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={submitting || !actionNotes.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white ${
                  actionType === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                } disabled:opacity-50`}
              >
                {submitting ? "Đang xử lý..." : actionType === "approve" ? "Xác nhận duyệt" : "Gửi yêu cầu bổ sung"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
