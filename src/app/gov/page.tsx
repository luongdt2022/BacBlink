"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileCheck2,
  Clock,
  Building2,
  Users,
  GraduationCap,
  ShoppingBag,
  Award,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Eye,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Filter,
  Layers,
  Copy,
  Check,
  Search,
  BadgeCheck,
} from "lucide-react";
import { GovPageHeader } from "@/components/gov/gov-page-header";
import { authClient, UserContext } from "@/lib/auth-client";
import { AppButton } from "@/components/ui/design-system";
import { resolveProvinceName, formatGovRecordCode } from "@/lib/gov-label-resolver";

interface PriorityActionItem {
  id: string;
  code: string;
  type: "SHOP" | "EXPERT" | "DEMAND" | "ENTERPRISE";
  typeLabel: string;
  typeColor: string;
  title: string;
  applicant: string;
  submittedAt: string;
  slaRemaining: string;
  slaUrgency: "NORMAL" | "WARNING" | "NEW";
  actionHref: string;
}

const SAMPLE_PRIORITY_ITEMS: PriorityActionItem[] = [
  {
    id: "appr-shop-001",
    code: "CB-HN-C25347",
    type: "SHOP",
    typeLabel: "Chào Bán Công Nghệ (TRL)",
    typeColor: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300",
    title: "Hệ thống AI IoT Giám sát Chất lượng Nước Nuôi Tôm Công Nghệ Cao",
    applicant: "Viện Công Nghệ Sinh Học & Môi Trường Hà Nội",
    submittedAt: "24/10/2026 09:30",
    slaRemaining: "Còn 14h (Cận hạn)",
    slaUrgency: "WARNING",
    actionHref: "/gov/approvals?tab=SHOP",
  },
  {
    id: "appr-exp-001",
    code: "CG-HN-A109F2",
    type: "EXPERT",
    typeLabel: "Chuyên Gia KH&CN",
    typeColor: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300",
    title: "TS. Nguyễn Minh Triết - Chuyên gia AI & Xử lý Ngôn ngữ Tự nhiên",
    applicant: "Đại học Quốc gia Hà Nội",
    submittedAt: "25/10/2026 14:15",
    slaRemaining: "Còn 36h",
    slaUrgency: "NORMAL",
    actionHref: "/gov/approvals?tab=EXPERT",
  },
  {
    id: "appr-dem-001",
    code: "NC-HN-88E29E",
    type: "DEMAND",
    typeLabel: "Bài Toán Nhu Cầu DNNVV",
    typeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    title: "Cần tìm giải pháp robot hàn tự động 6 trục cho xưởng gia công cơ khí",
    applicant: "Công ty TNHH Cơ Khí Chính Xác Thăng Long",
    submittedAt: "25/10/2026 16:40",
    slaRemaining: "Còn 38h",
    slaUrgency: "NORMAL",
    actionHref: "/gov/approvals?tab=DEMAND",
  },
  {
    id: "appr-ent-001",
    code: "DN-HN-825CDC",
    type: "ENTERPRISE",
    typeLabel: "Thẩm Định DN ĐMST",
    typeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
    title: "Hồ sơ đăng ký cấp huy hiệu Doanh nghiệp Đổi mới Sáng tạo",
    applicant: "Công ty Cổ phần Giải pháp Nông nghiệp Xanh Hà Nội",
    submittedAt: "26/10/2026 08:20",
    slaRemaining: "Mới tiếp nhận (48h)",
    slaUrgency: "NEW",
    actionHref: "/gov/approvals/enterprises",
  },
  {
    id: "appr-shop-002",
    code: "CB-HN-7F3A19",
    type: "SHOP",
    typeLabel: "Chào Bán Công Nghệ (TRL)",
    typeColor: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300",
    title: "Module quang điện mặt trời hiệu suất cao Perovskite - Silicon Tandem",
    applicant: "Viện Vật Lý - Viện Hàn Lâm KH&CN",
    submittedAt: "26/10/2026 09:10",
    slaRemaining: "Còn 45h",
    slaUrgency: "NORMAL",
    actionHref: "/gov/approvals?tab=SHOP",
  },
  {
    id: "appr-exp-002",
    code: "CG-HN-E320B4",
    type: "EXPERT",
    typeLabel: "Chuyên Gia KH&CN",
    typeColor: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300",
    title: "PGS.TS. Trần Thị Mai Lan - Chuyên gia Công nghệ Sinh học Vi sinh",
    applicant: "Học viện Nông nghiệp Việt Nam",
    submittedAt: "26/10/2026 10:05",
    slaRemaining: "Mới tiếp nhận (48h)",
    slaUrgency: "NEW",
    actionHref: "/gov/approvals?tab=EXPERT",
  },
];

export default function GovExecutiveDashboard() {
  const [user, setUser] = useState<UserContext | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setUser(authClient.getUser());
  }, []);

  const scopeCode = (user?.scopeId || "HN").toUpperCase();
  const provinceLabel = resolveProvinceName(scopeCode);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const filteredItems = useMemo(() => {
    if (selectedTypeFilter === "ALL") return SAMPLE_PRIORITY_ITEMS;
    return SAMPLE_PRIORITY_ITEMS.filter((item) => item.type === selectedTypeFilter);
  }, [selectedTypeFilter]);

  // Thống kê nhanh
  const stats = {
    pendingTotal: SAMPLE_PRIORITY_ITEMS.length,
    pendingShop: SAMPLE_PRIORITY_ITEMS.filter((i) => i.type === "SHOP").length,
    pendingExp: SAMPLE_PRIORITY_ITEMS.filter((i) => i.type === "EXPERT").length,
    pendingDem: SAMPLE_PRIORITY_ITEMS.filter((i) => i.type === "DEMAND").length,
    pendingEnt: SAMPLE_PRIORITY_ITEMS.filter((i) => i.type === "ENTERPRISE").length,
  };

  return (
    <div className="space-y-6">
      {/* Gov Standard Header */}
      <GovPageHeader
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Cổng Công Vụ Sở KH&CN", href: "/gov" },
          { label: "Trung Tâm Điều Hành & Giám Sát" },
        ]}
        title={`Trung Tâm Điều Hành & Giám Sát KH&CN ${provinceLabel}`}
        subtitle="Hệ thống Dashboard 360° tổng hợp chỉ số phát triển thị trường công nghệ và hàng đợi công việc ưu tiên cần xử lý của địa bàn"
        icon={LayoutDashboard}
        scopeCode={scopeCode}
        slaText=""
        makerCheckerText=""
        actions={
          <div className="flex items-center gap-2">
            <AppButton
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Đang cập nhật..." : "Làm Mới"}</span>
            </AppButton>
            <Link href="/gov/approvals">
              <AppButton variant="primary" className="flex items-center gap-1.5 px-3 py-1.5 text-xs">
                <FileCheck2 className="w-4 h-4" />
                <span>Vào Hàng Đợi Kiểm Duyệt</span>
              </AppButton>
            </Link>
          </div>
        }
      />

      {/* KHỐI 1: 4 THẺ KPI TỔNG HỢP 360° ĐỊA BÀN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Hồ sơ chờ phê duyệt */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hồ Sơ Chờ Phê Duyệt
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.pendingTotal}
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                việc cần xử lý
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats.pendingShop} chào bán · {stats.pendingExp} chuyên gia · {stats.pendingDem} nhu cầu · {stats.pendingEnt} DN
            </p>
          </div>
          <Link
            href="/gov/approvals"
            className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-brand-primary hover:underline"
          >
            <span>Vào hàng đợi kiểm duyệt</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* KPI 2: Năng lực công nghệ địa bàn */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Công Nghệ & Sáng Chế
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                142
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                TRL 6.8 / 9
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              48 Viện/Trường · 94 Doanh nghiệp ĐMST niêm yết
            </p>
          </div>
          <Link
            href="/gov/approvals?tab=SHOP"
            className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-brand-primary hover:underline"
          >
            <span>Xem danh mục công nghệ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* KPI 3: Bài toán Cung - Cầu */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Nhu Cầu Đặt Hàng & Deal
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                28
              </span>
              <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                14 đang kết nối
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              SLA phản hồi trung bình: 18.5h / 48h
            </p>
          </div>
          <Link
            href="/gov/opportunities"
            className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-brand-primary hover:underline"
          >
            <span>Giám sát tiến trình đàm phán</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* KPI 4: Thẩm định DN ĐMST & TT17 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              DN ĐMST & TT17
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                64
              </span>
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                19 Hội đồng TT17
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Đánh giá 26 tiêu chí năng lực công nghệ
            </p>
          </div>
          <Link
            href="/gov/assessments/tt17"
            className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-brand-primary hover:underline"
          >
            <span>Hội đồng chấm điểm TT17</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KHỐI 2: CÔNG VIỆC CẦN XỬ LÝ NGAY (PRIORITY WORK QUEUE) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        {/* Header Khối */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Công Việc Cần Xử Lý Ngay (Hàng Đợi Ưu Tiên)
              </h2>
              <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                {filteredItems.length} hồ sơ
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Danh sách các hồ sơ công nghệ, chuyên gia, nhu cầu và doanh nghiệp đang chờ Sở phê duyệt
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: "ALL", label: `Tất cả (${stats.pendingTotal})` },
              { key: "SHOP", label: `Chào bán (${stats.pendingShop})` },
              { key: "EXPERT", label: `Chuyên gia (${stats.pendingExp})` },
              { key: "DEMAND", label: `Nhu cầu (${stats.pendingDem})` },
              { key: "ENTERPRISE", label: `DN ĐMST (${stats.pendingEnt})` },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setSelectedTypeFilter(f.key)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedTypeFilter === f.key
                    ? "bg-brand-primary text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Danh Sách Priority Queue */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Mã hồ sơ */}
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    <span>{item.code}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(item.code)}
                      title="Sao chép mã hồ sơ"
                      className="hover:text-brand-primary transition p-0.5"
                    >
                      {copiedCode === item.code ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                      )}
                    </button>
                  </span>

                  {/* Loại hồ sơ */}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${item.typeColor}`}>
                    {item.typeLabel}
                  </span>

                  {/* Thời hạn SLA */}
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.slaUrgency === "WARNING"
                        ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300"
                        : item.slaUrgency === "NEW"
                        ? "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950 dark:text-sky-300"
                        : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{item.slaRemaining}</span>
                  </span>
                </div>

                {/* Tiêu đề & Đơn vị */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-brand-primary transition">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.applicant}
                    </span>
                    <span>·</span>
                    <span>Nộp lúc {item.submittedAt}</span>
                  </p>
                </div>
              </div>

              {/* Thao tác Xử lý */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Link href={item.actionHref}>
                  <AppButton
                    variant="primary"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs shadow-xs"
                  >
                    <span>Xử lý ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </AppButton>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer chuyển sang Hàng Đợi Toàn Màn Hình */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Hiển thị {filteredItems.length} công việc ưu tiên cần xử lý trong ngày
          </span>
          <Link
            href="/gov/approvals"
            className="font-bold text-brand-primary hover:underline flex items-center gap-1"
          >
            <span>Mở toàn bộ hàng đợi kiểm duyệt (5 phân hệ)</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KHỐI 3: PHÂN BỔ THEO 18 NGÀNH CÔNG NGHỆ TT17 & LỐI TẮT ĐIỀU HÀNH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phân bổ ngành TT17 địa phương */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-primary" />
                <span>Cơ Cấu Lĩnh Vực Công Nghệ Trọng Điểm Địa Bàn</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Theo danh mục Thông tư 17/2019/TT-BKHCN
              </p>
            </div>
            <Link
              href="/gov/assessments/tt17"
              className="text-xs font-bold text-brand-primary hover:underline"
            >
              Chi tiết TT17 &rarr;
            </Link>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3.5">
            {[
              { name: "Công nghệ thông tin & Viễn thông", count: 42, pct: 30, color: "bg-sky-600" },
              { name: "Cơ khí chế tạo & Tự động hóa", count: 34, pct: 24, color: "bg-emerald-600" },
              { name: "Công nghệ sinh học & Y tế - Dược phẩm", count: 26, pct: 18, color: "bg-violet-600" },
              { name: "Nông nghiệp công nghệ cao & Chế biến thực phẩm", count: 22, pct: 15, color: "bg-amber-600" },
              { name: "Năng lượng tái tạo & Vật liệu mới", count: 18, pct: 13, color: "bg-cyan-600" },
            ].map((sector) => (
              <div key={sector.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {sector.name}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {sector.count} hồ sơ ({sector.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${sector.color} rounded-full transition-all duration-500`}
                    style={{ width: `${sector.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Lối Tắt Điều Hành Trực Tiếp */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span>Lối Tắt Nghiệp Vụ Điều Hành</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Truy cập nhanh các phân hệ chuyên trách
            </p>
          </div>

          <div className="space-y-2.5">
            <Link
              href="/gov/approvals"
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-brand-primary bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between group transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300 flex items-center justify-center font-bold">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition">
                    Hàng Đợi Kiểm Duyệt
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    5 phân hệ duyệt toàn màn hình
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/gov/approvals/enterprises"
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-brand-primary bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between group transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition">
                    Thẩm Định Doanh Nghiệp ĐMST
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Xác thực 4 tiêu chí pháp lý & MST
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/gov/assessments/tt17"
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-brand-primary bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between group transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition">
                    Hội Đồng Đánh Giá TT17
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Chấm điểm 26 tiêu chí công nghệ
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/gov/settings/staff"
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-brand-primary bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between group transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition">
                    Phân Công Cán Bộ Thẩm Tra
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Maker - Checker và phân quyền Sở
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
