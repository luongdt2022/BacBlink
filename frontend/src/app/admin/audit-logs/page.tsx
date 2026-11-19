"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { AppButton } from "@/components/ui/design-system";
import { Async } from "@/components/ui/async";
import { API_BASE } from "@/lib/api-client";
import { authClient, normalizePlatformRole } from "@/lib/auth-client";
import {
  resolveProvinceName,
  resolveActionBadge,
  resolveRequestTypeLabel,
} from "@/lib/label-resolver";

function formatAuditRoleLabel(role?: string | null): string {
  const tier = normalizePlatformRole(role);
  if (tier === "ADMIN") return "Ban Quản trị Hiệp hội";
  if (tier === "ENTERPRISE") return "Doanh nghiệp Hội viên";
  return "Thành viên công chúng";
}

function formatAuditActionBadge(action?: string | null): { label: string; badgeClass: string } {
  const act = (action || "").trim().toUpperCase();
  if (act === "OVERRIDE_APPROVE" || act === "OVERRIDE") {
    return {
      label: "Phê Duyệt Đặc Cách",
      badgeClass:
        "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-extrabold",
    };
  }
  return resolveActionBadge(action);
}

function formatAuditTargetType(type?: string | null): string {
  return resolveRequestTypeLabel(type)
    .replace(/Doanh Nghiệp ĐMST/gi, "Doanh Nghiệp Hội Viên")
    .replace(/ĐMST/gi, "Hội Viên");
}

function formatAuditLocation(code?: string | null): string {
  if (!code) return "Bắc Ninh";
  return resolveProvinceName(code).replace(/^(Sở Khoa học và Công nghệ|Sở KH&CN)\s*/i, "").trim();
}

export interface AuditLogRecord {
  id: string;
  createdAt: string;
  actorName: string;
  actorRole: string;
  provinceCode: string;
  action: string;
  targetTitle: string;
  targetType: string;
  reason: string;
  ipAddress: string;
}

// CWE-1236 Sanitization: Prevents CSV Formula Injection in spreadsheet tools
const sanitizeCsvCell = (val: string | null | undefined): string => {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  const safeStr = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${safeStr.replace(/"/g, '""')}"`;
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Selected Log Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

  // Load audit logs from API (Zero-Mock: strict backend integration, no fake seed fallback)
  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/governance/audit-logs`, {
        headers: authClient.getAuthHeaders(),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Máy chủ phản hồi mã lỗi ${response.status}`);
      }

      const payload = await response.json();
      if (payload.success && Array.isArray(payload.data)) {
        setLogs(payload.data);
      } else {
        setLogs([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tải nhật ký kiểm toán hệ thống.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  // Filtering logic
  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = new Date();

    return logs.filter((item) => {
      // Keyword filter
      const matchesSearch =
        !q ||
        item.actorName.toLowerCase().includes(q) ||
        item.targetTitle.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.ipAddress.includes(q);

      // Action filter
      const matchesAction =
        actionFilter === "ALL" ||
        item.action.toUpperCase() === actionFilter.toUpperCase();

      // Date filter
      let matchesDate = true;
      if (dateFilter !== "ALL") {
        const itemDate = new Date(item.createdAt);
        const diffMs = now.getTime() - itemDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (dateFilter === "TODAY") {
          matchesDate = diffDays <= 1;
        } else if (dateFilter === "7DAYS") {
          matchesDate = diffDays <= 7;
        } else if (dateFilter === "30DAYS") {
          matchesDate = diffDays <= 30;
        }
      }

      return matchesSearch && matchesAction && matchesDate;
    });
  }, [logs, searchQuery, actionFilter, dateFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page, pageSize]);

  // Export CSV with UTF-8 BOM
  const handleExportCsv = () => {
    const headers = [
      "Mã Nhật Ký",
      "Thời Gian",
      "Tác Nhân",
      "Vai Trò",
      "Địa Bàn",
      "Hành Vi",
      "Hồ Sơ Liên Quan",
      "Lý Do Giải Trình",
      "Địa Chỉ IP",
    ];

    const rows = filteredLogs.map((l) => [
      sanitizeCsvCell(l.id),
      sanitizeCsvCell(new Date(l.createdAt).toLocaleString("vi-VN")),
      sanitizeCsvCell(l.actorName),
      sanitizeCsvCell(formatAuditRoleLabel(l.actorRole)),
      sanitizeCsvCell(formatAuditLocation(l.provinceCode)),
      sanitizeCsvCell(formatAuditActionBadge(l.action).label),
      sanitizeCsvCell(l.targetTitle),
      sanitizeCsvCell(l.reason),
      sanitizeCsvCell(l.ipAddress),
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `baclink_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setActionFilter("ALL");
    setDateFilter("ALL");
    setPage(1);
  };

  return (
    <div className="w-full space-y-5">
      {/* WAI-ARIA Standard Breadcrumbs */}
      <AdminBreadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Quản Trị Hệ Thống", href: "/admin" },
          { label: "Nhật Ký Kiểm Toán Cấp Độ 3" },
        ]}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold mb-2 border border-brand-200 dark:border-brand-900">
            <History className="w-3.5 h-3.5" />
            <span>Giám Sát & Vận Hành Bất Biến</span>
          </div>
          <h1 className="font-bold text-slate-900 dark:text-white tracking-tight text-2xl">
            Nhật Ký Kiểm Toán Hệ Thống BACLINK (Audit Logs)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Lưu vết bất biến &ge; 365 ngày theo tiêu chuẩn An toàn thông tin Cấp 3 (Nghị định 85/2016/NĐ-CP) tại Hiệp hội BACLINK Bắc Ninh.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Xuất File CSV / Excel</span>
          </button>
          <button
            type="button"
            onClick={loadLogs}
            className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            title="Tải lại nhật ký"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          {/* Keyword Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên quản trị viên, hồ sơ, lý do giải trình, IP..."
              className="form-control-sm w-full pl-9 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="form-control-sm w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">Tất cả hành vi</option>
              <option value="APPROVED">Phê Duyệt</option>
              <option value="OVERRIDE_APPROVE">Phê Duyệt Đặc Cách</option>
              <option value="CHANGES_REQUESTED">Yêu Cầu Bổ Sung</option>
              <option value="REJECTED">Từ Chối</option>
              <option value="REVOKE">Thu Hồi Quyền</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="form-control-sm w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">Toàn bộ thời gian</option>
              <option value="TODAY">Hôm nay</option>
              <option value="7DAYS">7 ngày qua</option>
              <option value="30DAYS">30 ngày qua</option>
            </select>
          </div>
        </div>

        {/* Filter Stats */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>
            Tìm thấy <strong>{filteredLogs.length}</strong> bản ghi nhật ký kiểm toán bất biến
          </span>
          {(searchQuery || actionFilter !== "ALL" || dateFilter !== "ALL") && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Data Table with 5 UX States */}
      <Async
        state={loading ? "loading" : error ? "error" : filteredLogs.length === 0 ? "empty" : "success"}
        errorMessage={error || undefined}
        onRetry={loadLogs}
        emptyContent={
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Không tìm thấy nhật ký kiểm toán phù hợp</h4>
            <p className="text-xs text-slate-500 mt-1">Không có thao tác nào khớp với tiêu chí tìm kiếm hoặc bộ lọc thời gian đã chọn.</p>
          </div>
        }
      >
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-xs">
                  <th className="py-3 px-4">Thời Gian</th>
                  <th className="py-3 px-4">Tác Nhân Thực Thi</th>
                  <th className="py-3 px-4">Địa Bàn</th>
                  <th className="py-3 px-4">Hành Vi Thao Tác</th>
                  <th className="py-3 px-4">Hồ Sơ / Chủ Thể</th>
                  <th className="py-3 px-4">Lý Do / Giải Trình</th>
                  <th className="py-3 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedLogs.map((item) => {
                  const badge = formatAuditActionBadge(item.action);
                  const formattedDate = new Date(item.createdAt).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Thời gian */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-400">
                        {formattedDate}
                      </td>

                      {/* Tác nhân */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.actorName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {formatAuditRoleLabel(item.actorRole)}
                        </div>
                      </td>

                      {/* Địa bàn */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {formatAuditLocation(item.provinceCode)}
                        </span>
                      </td>

                      {/* Hành vi */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold leading-none ${badge.badgeClass}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Hồ sơ */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {item.targetTitle}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {formatAuditTargetType(item.targetType)}
                        </div>
                      </td>

                      {/* Lý do giải trình */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {item.reason}
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">
                          IP: {item.ipAddress}
                        </div>
                      </td>

                      {/* Nút Xem Chi Tiết */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
                          title="Xem chi tiết vết kiểm toán"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div>
                Trang <strong>{page}</strong> / <strong>{totalPages}</strong> (Hiển thị{" "}
                {paginatedLogs.length} trên tổng số {filteredLogs.length})
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </Async>

      {/* Modal Xem Chi Tiết Vết Kiểm Toán */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Chi Tiết Vết Kiểm Toán #{selectedLog.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Thời gian ghi nhận:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {new Date(selectedLog.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Quản trị viên thực thi:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedLog.actorName} ({formatAuditRoleLabel(selectedLog.actorRole)})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Địa bàn / KCN:</span>
                <span className="font-bold text-brand-700 dark:text-brand-300">
                  {formatAuditLocation(selectedLog.provinceCode)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Hành vi tác động:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatAuditActionBadge(selectedLog.action).label}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Đối tượng mục tiêu:</span>
                <span className="font-bold text-slate-900 dark:text-white text-right max-w-xs">
                  {selectedLog.targetTitle}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Địa chỉ IP truy cập:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {selectedLog.ipAddress}
                </span>
              </div>

              <div className="pt-2">
                <span className="text-slate-500 block mb-1">Văn bản giải trình kiểm toán:</span>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {selectedLog.reason}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
