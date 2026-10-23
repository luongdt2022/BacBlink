"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Kanban,
  Search,
  Filter,
  Download,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building2,
  Lock,
  Clock,
  Layers,
  SearchX,
  RefreshCw,
  FolderGit2,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { AppButton } from "@/components/ui/design-system";
import { Async, UXState } from "@/components/ui/async";
import { authClient, UserContext } from "@/lib/auth-client";
import {
  ExpertProject,
  KanbanStageKey,
  KANBAN_TRL_STAGES,
} from "@/lib/expert-projects";
import { expertProjectsApi } from "@/services/api/expert-projects";

export default function ExpertProjectsPage() {
  return (
    <RoleGuard
      allowedRoles={["VERIFIED_EXPERT", "EXPERT"]}
      portalName="Dự Án Đồng Hành & Hợp Tác"
    >
      <ExpertProjectsContent />
    </RoleGuard>
  );
}

function ExpertProjectsContent() {
  const [currentUser, setCurrentUser] = useState<UserContext | null>(null);
  const [uxState, setUxState] = useState<UXState>("loading");
  const [projects, setProjects] = useState<ExpertProject[]>([]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [selectedTrlRange, setSelectedTrlRange] = useState<"ALL" | "1-3" | "4-6" | "7-9">("ALL");

  const [notification, setNotification] = useState<string | null>(null);

  const loadProjects = async () => {
    setUxState("loading");
    try {
      const user = authClient.getUser();
      setCurrentUser(user);
      const data = await expertProjectsApi.getMyProjects();
      setProjects(data);
      setUxState("idle");
    } catch {
      setUxState("error");
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const isPendingApprovalRole = currentUser?.role?.toUpperCase() === "EXPERT";

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Sector filter
      if (selectedSector !== "ALL" && p.sectorCode !== selectedSector) {
        return false;
      }
      // TRL range filter
      if (selectedTrlRange === "1-3" && !(p.currentTrl >= 1 && p.currentTrl <= 3)) {
        return false;
      }
      if (selectedTrlRange === "4-6" && !(p.currentTrl >= 4 && p.currentTrl <= 6)) {
        return false;
      }
      if (selectedTrlRange === "7-9" && !(p.currentTrl >= 7 && p.currentTrl <= 9)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = p.projectCode.toLowerCase().includes(q);
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesPartner = p.partnerOrgName.toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle && !matchesPartner) {
          return false;
        }
      }
      return true;
    });
  }, [projects, selectedSector, selectedTrlRange, searchQuery]);

  const hasActiveFilters = searchQuery.trim() !== "" || selectedSector !== "ALL" || selectedTrlRange !== "ALL";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSector("ALL");
    setSelectedTrlRange("ALL");
  };

  const handleStageMove = (projectId: string, currentStage: KanbanStageKey, direction: "NEXT" | "PREV") => {
    const stageKeys = KANBAN_TRL_STAGES.map((s) => s.key);
    const currentIndex = stageKeys.indexOf(currentStage);
    const targetIndex = direction === "NEXT" ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex < 0 || targetIndex >= stageKeys.length) return;
    const targetStage = stageKeys[targetIndex];

    setProjects((prev) =>
      prev.map((item) => (item.id === projectId ? { ...item, stage: targetStage } : item))
    );

    const targetLabel = KANBAN_TRL_STAGES.find((s) => s.key === targetStage)?.label;
    setNotification(`Đã chuyển dự án sang giai đoạn "${targetLabel}"`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExportReport = () => {
    alert("Đang tạo và tải về Báo Cáo Tiến Độ Đồng Hành R&D (Định dạng PDF/Excel)...");
  };

  return (
    <div className="space-y-6">
      {/* Banner cảnh báo màu hổ phách nếu tài khoản EXPERT đang chờ duyệt */}
      {isPendingApprovalRole && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 shadow-xs dark:bg-amber-950/40 dark:border-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-body text-amber-900 dark:text-amber-200 space-y-1">
            <h4 className="font-bold text-label">
              Tài Khoản Đang Chờ Phê Duyệt Cấp Sở (EXPERT)
            </h4>
            <p className="text-caption">
              Bạn đang ở chế độ xem trước dự án. Các tính năng tham gia phòng đàm phán độc quyền Deal Room và ký kết Thỏa thuận Ghi nhớ MOU có giá trị pháp lý sẽ được kích hoạt ngay sau khi hồ sơ Chuyên gia được Sở KH&CN phê duyệt.
            </p>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-label flex items-center justify-between shadow-sm animate-in fade-in dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* TOP HEADER & EXPERT TOOLSET */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption text-slate-500 mb-1">
              <Link href="/portal/matching/radar" className="hover:text-brand-700 transition">
                Radar Cơ Hội AI
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-brand-700 font-bold dark:text-brand-400">
                Bàn Làm Việc Chuyên Gia
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Kanban className="w-6 h-6 text-brand-700 dark:text-brand-400" />
              <span>Dự Án Đồng Hành & Hợp Tác (Thang Đo TRL 1-9)</span>
            </h1>
            <p className="text-caption text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Không gian điều hành tiến trình đồng hành chuyển giao công nghệ, đàm phán bảo mật Deal Room và nghiệm thu các mốc sẵn sàng công nghệ (TRL).
            </p>
          </div>

          {/* Expert Toolset Action: Export Report (Tuyệt đối không có nút Giám sát Sở KH&CN) */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/portal/matching/radar"
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-caption font-bold flex items-center gap-2 transition dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 min-h-11"
            >
              <Sparkles className="w-4 h-4 text-brand-700" />
              <span>Khám Phá Radar AI</span>
            </Link>
            <button
              type="button"
              onClick={handleExportReport}
              className="px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-caption font-bold flex items-center gap-2 transition shadow-xs min-h-11"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Báo Cáo Tiến Độ Đồng Hành</span>
            </button>
          </div>
        </div>

        {/* TOOLSET CONTROLS STRIP: Search & Filters */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã dự án PRJ-EXP-..., tên đề tài hoặc đối tác..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white min-h-11"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sector TT17 Filter */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="sector-filter-select" className="text-caption font-bold text-slate-500 whitespace-nowrap">
                Lĩnh vực TT17:
              </label>
              <select
                id="sector-filter-select"
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white min-h-11"
              >
                <option value="ALL">Tất Cả Lĩnh Vực</option>
                <option value="01">01 - Nông nghiệp công nghệ cao</option>
                <option value="03">03 - Cơ khí - Tự động hóa</option>
                <option value="05">05 - Y - Dược & Thiết bị y tế</option>
                <option value="07">07 - CNTT & Trí tuệ nhân tạo</option>
              </select>
            </div>

            {/* TRL Range Filter */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="trl-filter-select" className="text-caption font-bold text-slate-500 whitespace-nowrap">
                Thang đo TRL:
              </label>
              <select
                id="trl-filter-select"
                value={selectedTrlRange}
                onChange={(e) => setSelectedTrlRange(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white min-h-11"
              >
                <option value="ALL">Toàn bộ TRL (1-9)</option>
                <option value="1-3">TRL 1-3 (Nghiên cứu cơ bản & PoC)</option>
                <option value="4-6">TRL 4-6 (Phòng Lab & Thử nghiệm)</option>
                <option value="7-9">TRL 7-9 (Pilot & Thương mại hóa)</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {hasActiveFilters && (
              <button
                type="button"
                data-testid="reset-filters-btn"
                onClick={resetFilters}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition min-h-11 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Đặt Lại Bộ Lọc
              </button>
            )}

            <button
              type="button"
              onClick={loadProjects}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition dark:border-slate-700 dark:text-slate-400 min-h-11 min-w-11 flex items-center justify-center"
              title="Tải lại danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${uxState === "loading" ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 5 KANBAN COLUMNS (TRL 1-9) */}
      <Async
        state={uxState}
        loadingText="Đang tải dữ liệu bảng Kanban dự án TRL..."
        onRetry={loadProjects}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {KANBAN_TRL_STAGES.map((col, colIdx) => {
            const colProjects = filteredProjects.filter((p) => p.stage === col.key);

            return (
              <div
                key={col.key}
                data-testid={`kanban-col-${col.key}`}
                className="bg-slate-100/80 dark:bg-slate-900/60 backdrop-blur-xs rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 flex flex-col space-y-3 min-h-[580px]"
              >
                {/* Column Header */}
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                      {col.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-caption font-bold bg-white text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                      {colProjects.length}
                    </span>
                  </div>
                  <p className="text-caption text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {col.description}
                  </p>
                </div>

                {/* Cards Container & 5 UX States */}
                <div className="space-y-3 flex-1 flex flex-col">
                  {colProjects.length === 0 ? (
                    hasActiveFilters ? (
                      /* Filtered Empty State */
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl space-y-2.5">
                        <SearchX className="w-8 h-8 text-slate-400" />
                        <p className="text-caption text-slate-500 font-medium">
                          Không tìm thấy dự án nào phù hợp với bộ lọc hiện tại.
                        </p>
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-caption font-bold hover:bg-slate-300 transition dark:bg-slate-800 dark:text-slate-300"
                        >
                          Đặt Lại Bộ Lọc
                        </button>
                      </div>
                    ) : (
                      /* Natural Empty State (Tuyệt đối không để chữ 'Trống' thô sơ) */
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-3 bg-white/50 dark:bg-slate-900/40">
                        <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 flex items-center justify-center mx-auto">
                          <FolderGit2 className="w-5 h-5" />
                        </div>
                        <p className="text-caption text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">
                          Chưa có dự án nào ở giai đoạn này. Các đề xuất hợp tác mới từ Radar AI sẽ xuất hiện tại đây khi DN gửi lời mời.
                        </p>
                        <Link
                          href="/portal/matching/radar"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-700 text-white text-caption font-bold hover:bg-brand-800 transition shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Khám Phá Radar Cơ Hội AI</span>
                        </Link>
                      </div>
                    )
                  ) : (
                    /* Ideal State: List of Expert Project Cards */
                    colProjects.map((project) => (
                      <div
                        key={project.id}
                        data-testid={`project-card-${project.id}`}
                        className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-750 p-4 shadow-xs hover:border-brand-500/50 hover:shadow-md transition-all space-y-3"
                      >
                        {/* Header: Project Code & Security Status */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-900">
                            {project.projectCode}
                          </span>
                          <span
                            className={`text-caption font-bold px-2 py-0.5 rounded-full border ${
                              project.securityStatus === "NDA ĐÃ KÝ"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : project.securityStatus === "CHỜ KÝ NDA"
                                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
                                : "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/60 dark:text-brand-300"
                            }`}
                          >
                            {project.securityStatus}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                          {project.title}
                        </h4>

                        {/* Partner & Sector */}
                        <div className="space-y-1 text-caption text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-1.5 truncate">
                            <Building2 className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                            <span className="truncate font-medium">{project.partnerOrgName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-caption text-slate-400">
                            <span>[{project.sectorCode} - {project.sectorName}]</span>
                          </div>
                        </div>

                        {/* Dual TRL Scale Bar ([TRL 4: Lab] -> [TRL 6: Thử nghiệm]) */}
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800">
                          <span className="text-caption font-bold text-slate-500 uppercase tracking-wider block">
                            Thang đo TRL kép:
                          </span>
                          <div className="flex items-center justify-between gap-1 text-caption font-bold">
                            <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                              TRL {project.currentTrl}: {project.currentTrlLabel}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              TRL {project.targetTrl}: {project.targetTrlLabel}
                            </span>
                          </div>
                        </div>

                        {/* Value & SLA */}
                        <div className="flex items-center justify-between text-caption pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">
                            ~{(project.estimatedValueVnd / 1000000).toLocaleString("vi-VN")} Triệu
                          </span>
                          <span className="text-caption text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{project.deadlineSlaText}</span>
                          </span>
                        </div>

                        {/* Action buttons: Deal Room & Move stage */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <Link
                            href={project.dealRoomUrl}
                            className="text-xs font-bold text-brand-700 hover:text-brand-800 hover:underline flex items-center gap-1 dark:text-brand-300"
                          >
                            <span>Vào Deal Room 1-1</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          {/* Navigation stage arrows */}
                          <div className="flex items-center gap-1">
                            {colIdx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleStageMove(project.id, col.key, "PREV")}
                                title="Lùi lại giai đoạn trước"
                                className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition dark:border-slate-700 dark:hover:bg-slate-800"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {colIdx < KANBAN_TRL_STAGES.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleStageMove(project.id, col.key, "NEXT")}
                                title="Chuyển tiếp giai đoạn kế tiếp"
                                className="p-1 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-700 hover:text-white transition dark:bg-brand-950 dark:text-brand-300"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Async>
    </div>
  );
}
