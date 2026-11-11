"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, ShieldCheck, CheckCircle2, AlertCircle, FileText, Award } from "lucide-react";
import {
  fetchEnterprises,
  approveEnterpriseGov,
  rejectEnterpriseGov,
  EnterpriseDirectoryItem,
} from "../../../../lib/enterprise-client";
import { GovPageHeader } from "@/components/gov/gov-page-header";
import { resolveProvinceName, resolveSectorName } from "@/lib/gov-label-resolver";
import { authClient } from "@/lib/auth-client";

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
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const currentUser = authClient.getUser();
  const currentScope = filterProvince || currentUser?.scopeId || "HN";

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
    const trimmedNotes = actionNotes.trim();

    if (actionType === "reject") {
      if (!trimmedNotes || trimmedNotes.length < 10) {
        setModalError("Lý do từ chối hoặc yêu cầu bổ sung bắt buộc phải có ít nhất 10 ký tự hợp lệ theo Quy tắc BR-ADM-004.");
        return;
      }
    }

    try {
      setSubmitting(true);
      setModalError(null);
      setError(null);
      if (actionType === "approve") {
        await approveEnterpriseGov(selectedItem.id, trimmedNotes);
        setActionSuccessMsg(`Đã phê duyệt thành công doanh nghiệp ${selectedItem.name}!`);
      } else {
        await rejectEnterpriseGov(selectedItem.id, trimmedNotes);
        setActionSuccessMsg(`Đã gửi yêu cầu bổ sung hồ sơ tới doanh nghiệp ${selectedItem.name}!`);
      }
      setSelectedItem(null);
      setActionType(null);
      setActionNotes("");
      await loadData();
    } catch (err: any) {
      setModalError(err.message || "Xử lý hồ sơ thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* GovPageHeader */}
      <GovPageHeader
        breadcrumbs={[
          { label: "Cổng Công Vụ", href: "/gov" },
          { label: "Tổng Quan & Phê Duyệt", href: "/gov" },
          { label: "Thẩm Định Doanh Nghiệp ĐMST" },
        ]}
        title="Thẩm Định & Xác Nhận Doanh Nghiệp ĐMST"
        subtitle="Dành cho Cán bộ Quản lý Sở Khoa học & Công nghệ — Thẩm định dữ liệu theo Quyết định số 844/QĐ-TTg và Luật Hỗ trợ DNNVV."
        icon={Building2}
        scopeCode={currentScope}
        slaText="SLA ≤ 48h"
        makerCheckerText="Maker-Checker 2 Cấp"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/enterprises/dashboard"
              className="px-3.5 py-2 rounded-control text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs"
            >
              📊 Báo cáo Thống kê
            </Link>
            <Link
              href="/enterprises"
              className="px-3.5 py-2 rounded-control text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs"
            >
              📖 Danh bạ Công khai
            </Link>
          </div>
        }
      />

      {/* Action Alert */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-control flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            {actionSuccessMsg}
          </span>
          <button onClick={() => setActionSuccessMsg(null)} className="font-bold cursor-pointer">✕</button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-control flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold">
            <AlertCircle className="w-4 h-4" />
            {error}
          </span>
          <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="surface-card p-4 flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo Tên DN hoặc Mã số thuế..."
            className="form-control flex-1 text-sm"
          />
          <button
            type="submit"
            className="h-11 px-5 bg-brand-700 hover:bg-brand-800 text-white rounded-control text-sm font-semibold shrink-0 transition"
          >
            Tìm kiếm
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-control text-sm"
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
            className="form-control w-44 text-sm"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-slate-900 rounded-surface border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Đang tải danh sách hồ sơ...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Không tìm thấy hồ sơ doanh nghiệp nào phù hợp điều kiện lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-4">Doanh nghiệp / MST</th>
                  <th className="p-4">Địa bàn & Ngành</th>
                  <th className="p-4">Tiêu Chí Xác Thực ĐMST</th>
                  <th className="p-4">Chỉ số TNI</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác thẩm định</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <Link
                        href={`/enterprises/${item.taxCode}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 block"
                      >
                        {item.name}
                      </Link>
                      <span className="font-mono text-slate-400 text-xs block mt-0.5">
                        Mã số thuế: <strong>{item.taxCode}</strong>
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {resolveProvinceName(item.provinceCity)}
                      </div>
                      <div className="text-slate-400 text-xs truncate max-w-xs mt-0.5">
                        {resolveSectorName(item.sectorCode || item.mainSectorName)}
                      </div>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <FileText className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>Vốn điều lệ / Quy mô: <strong>{item.workforceScale || item.ownershipType || "Doanh nghiệp KH&CN"}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Bằng độc quyền sáng chế: <strong>{item.ipCount > 0 ? `${item.ipCount} Bằng sáng chế` : "Chưa bảo hộ SHTT"}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Giấy chứng nhận DN KH&CN: <strong>{item.hasRdUnit ? "Đạt chuẩn (Có đơn vị R&D)" : "Đang thẩm tra"}</strong></span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 font-semibold text-xs inline-block">
                        {item.tniClassification || "Đang tính"} {item.tniScore ? `(${item.tniScore.toFixed(1)})` : ""}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.isVerified ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs inline-block">
                          ✓ Đã phê duyệt
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold text-xs inline-block">
                          ⏳ Chờ thẩm định
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/enterprises/${item.taxCode}`}
                        className="px-2.5 py-1 rounded-control bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium inline-block"
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
                              setModalError(null);
                            }}
                            className="px-2.5 py-1 rounded-control bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                          >
                            Phê duyệt
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setActionType("reject");
                              setActionNotes("Vui lòng bổ sung giấy chứng nhận SHTT hoặc làm rõ cơ cấu ngân sách R&D.");
                              setModalError(null);
                            }}
                            className="px-2.5 py-1 rounded-control bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
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

      {/* Action Dialog */}
      {selectedItem && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-surface p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {actionType === "approve" ? "Phê duyệt hồ sơ doanh nghiệp ĐMST" : "Yêu cầu bổ sung / Từ chối hồ sơ"}
            </h3>

            {/* Khối tiêu chí xác thực ĐMST trong Modal */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-control border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div>
                Doanh nghiệp: <strong className="text-slate-900 dark:text-white">{selectedItem.name}</strong>
              </div>
              <div>
                Mã số thuế: <strong className="font-mono text-slate-800 dark:text-slate-200">{selectedItem.taxCode}</strong>
              </div>
              <div>
                Vốn điều lệ / Quy mô: <strong>{selectedItem.workforceScale || selectedItem.ownershipType || "Doanh nghiệp KH&CN"}</strong>
              </div>
              <div>
                Bằng độc quyền sáng chế: <strong>{selectedItem.ipCount > 0 ? `${selectedItem.ipCount} Bằng độc quyền sáng chế` : "Chưa có bằng độc quyền"}</strong>
              </div>
              <div>
                Giấy chứng nhận DN KH&CN: <strong>{selectedItem.hasRdUnit ? "Có đơn vị R&D hợp lệ" : "Đang thẩm tra năng lực"}</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ý kiến thẩm định / Ghi chú của Sở KH&CN *{" "}
                {actionType === "reject" && (
                  <span className="text-rose-500 font-bold">(Bắt buộc ≥ 10 ký tự)</span>
                )}
              </label>
              <textarea
                rows={3}
                value={actionNotes}
                onChange={(e) => {
                  setActionNotes(e.target.value);
                  if (modalError) setModalError(null);
                }}
                placeholder="Nhập nhận xét hoặc lý do yêu cầu bổ sung (tối thiểu 10 ký tự)..."
                className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-control text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              {modalError && (
                <p className="text-caption text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{modalError}</span>
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  setActionType(null);
                  setModalError(null);
                }}
                disabled={submitting}
                className="px-4 py-2 rounded-control text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={submitting}
                className={`px-4 py-2 rounded-control text-xs font-semibold text-white cursor-pointer ${
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
    </div>
  );
}
