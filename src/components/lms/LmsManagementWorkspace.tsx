"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookOpen,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { Async, type AsyncState } from "@/components/ui/async";
import {
  fetchLmsMaterials,
  type PagedResult,
  type LmsMaterialManagementDto,
  type LmsLessonType,
  type LmsStatus,
} from "@/lib/api/lms";
import { LmsMaterialFormModal } from "./LmsMaterialFormModal";
import { LmsUnpublishModal } from "./LmsUnpublishModal";
import { LmsDeleteModal } from "./LmsDeleteModal";

const STATUS_CONFIG: Record<LmsStatus, { label: string; badgeClass: string }> = {
  DRAFT: {
    label: "Bản nháp",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  PUBLISHED: {
    label: "Công khai",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900",
  },
  UNPUBLISHED: {
    label: "Đã gỡ",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900",
  },
};

const LESSON_TYPE_LABELS: Record<LmsLessonType, string> = {
  TYPE_A: "Loại A (Cơ sở)",
  TYPE_B: "Loại B (Chuyên sâu)",
  TYPE_B_PLUS: "Loại B+ (Nâng cao)",
};

interface LmsManagementWorkspaceProps {
  portalRole: "EXPERT" | "ADMIN";
}

export function LmsManagementWorkspace({ portalRole }: LmsManagementWorkspaceProps) {
  const [data, setData] = useState<PagedResult<LmsMaterialManagementDto> | null>(null);
  const [asyncState, setAsyncState] = useState<AsyncState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Filters
  const [keyword, setKeyword] = useState<string>("");
  const [lessonType, setLessonType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [unpublishTarget, setUnpublishTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const loadData = useCallback(async () => {
    setAsyncState("loading");
    setErrorMessage("");
    try {
      const res = await fetchLmsMaterials({
        keyword: keyword.trim() || undefined,
        lessonType: lessonType || undefined,
        status: status || undefined,
        page,
        pageSize: 10,
      });
      setData(res);
      if (res.items.length === 0) {
        setAsyncState("empty");
      } else {
        setAsyncState("success");
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Không thể tải danh sách quản trị học liệu số."
      );
      setAsyncState("error");
    }
  }, [keyword, lessonType, status, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsFormOpen(true);
  };

  const clearFilters = () => {
    setKeyword("");
    setLessonType("");
    setStatus("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-brand-600" />
            <span>Bàn Làm Việc Quản Trị Học Liệu Số</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {portalRole === "ADMIN"
              ? "Quản trị toàn bộ kho bài giảng số trên toàn quốc, giám sát kiểm toán & xử lý bài học vi phạm"
              : "Biên soạn, cập nhật, xuất bản và quản lý danh mục bài giảng của chuyên gia"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Đăng bài học mới</span>
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, giảng viên..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            />
          </div>

          <div>
            <select
              value={lessonType}
              onChange={(e) => {
                setLessonType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            >
              <option value="">Tất cả loại bài</option>
              <option value="TYPE_A">Loại A - Cơ sở</option>
              <option value="TYPE_B">Loại B - Chuyên sâu</option>
              <option value="TYPE_B_PLUS">Loại B+ - Nâng cao</option>
            </select>
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="DRAFT">Bản nháp</option>
              <option value="PUBLISHED">Công khai</option>
              <option value="UNPUBLISHED">Đã gỡ</option>
            </select>
          </div>
        </form>
      </div>

      {/* TABLE 10 CỘT BỌC TRONG <ASYNC> */}
      <Async
        state={asyncState}
        onRetry={loadData}
        errorMessage={errorMessage}
        loadingSkeleton={
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-40 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
          </div>
        }
        emptyContent={
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Không có học liệu nào
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Danh sách hiện đang trống hoặc không có bản ghi nào khớp với bộ lọc.
            </p>
            {(keyword || lessonType || status) && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-3.5 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 transition"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        }
      >
        {data && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3">STT</th>
                    <th className="px-4 py-3">Mã học liệu</th>
                    <th className="px-4 py-3">Tiêu đề bài giảng</th>
                    <th className="px-4 py-3">Loại bài</th>
                    <th className="px-4 py-3">Lĩnh vực</th>
                    <th className="px-4 py-3">Thời lượng</th>
                    <th className="px-4 py-3">Giảng viên / Người đăng</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ngày cập nhật</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.items.map((item, idx) => {
                    const statusConf = STATUS_CONFIG[item.status] || {
                      label: item.status,
                      badgeClass: "bg-slate-100 text-slate-700",
                    };

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                      >
                        <td className="px-4 py-3 text-slate-400 font-mono">
                          {(page - 1) * 10 + idx + 1}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {item.materialCode}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="truncate">{item.title}</span>
                            {item.hasAiKnowledge && (
                              <span title="Đã nạp tri thức AI RAG">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {LESSON_TYPE_LABELS[item.lessonType] || item.lessonType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                          {item.sectorCode}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {item.durationMinutes}p
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {item.leadInstructorName || item.createdByName || "Chuyên gia"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${statusConf.badgeClass}`}
                          >
                            {statusConf.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                          {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Xem chi tiết */}
                            <Link
                              href={`/elearning/${item.id}`}
                              className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Xem chi tiết trên Cổng công khai"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            {/* Chỉnh sửa */}
                            <button
                              type="button"
                              onClick={() => handleEdit(item.id)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Chỉnh sửa học liệu"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Gỡ bài (Chỉ cho bài PUBLISHED - US-EL-05) */}
                            {item.status === "PUBLISHED" && (
                              <button
                                type="button"
                                onClick={() =>
                                  setUnpublishTarget({ id: item.id, title: item.title })
                                }
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Gỡ bài học kèm lý do kiểm toán"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                              </button>
                            )}

                            {/* Xóa mềm (Chỉ cho bài DRAFT hoặc UNPUBLISHED - US-EL-06) */}
                            {item.status !== "PUBLISHED" && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteTarget({ id: item.id, title: item.title })
                                }
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Xóa mềm học liệu"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PHÂN TRANG 10 BẢN GHI/TRANG */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="text-xs text-slate-500">
                  Trang {data.page} / {data.totalPages} ({data.totalCount} bản ghi)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold disabled:opacity-40 hover:bg-white dark:border-slate-700"
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={page >= data.totalPages}
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold disabled:opacity-40 hover:bg-white dark:border-slate-700"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Async>

      {/* FORM MODAL (TẠO MỚI / SỬA 4 TABS) */}
      <LmsMaterialFormModal
        isOpen={isFormOpen}
        materialId={editingId}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadData}
      />

      {/* MODAL GỠ BÀI (US-EL-05) */}
      {unpublishTarget && (
        <LmsUnpublishModal
          isOpen={true}
          materialId={unpublishTarget.id}
          materialTitle={unpublishTarget.title}
          onClose={() => setUnpublishTarget(null)}
          onSuccess={loadData}
        />
      )}

      {/* MODAL XÓA MỀM (US-EL-06) */}
      {deleteTarget && (
        <LmsDeleteModal
          isOpen={true}
          materialId={deleteTarget.id}
          materialTitle={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
