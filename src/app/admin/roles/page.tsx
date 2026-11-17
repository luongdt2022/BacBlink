"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  Users,
  KeyRound,
  CheckCircle2,
  Search,
  UserPlus,
  Building,
  Info,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { API_BASE } from "@/lib/api-client";
import { authClient, normalizePlatformRole } from "@/lib/auth-client";
import { Async } from "@/components/ui/async";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { AppButton } from "@/components/ui/design-system";
import { resolveRoleName } from "@/lib/label-resolver";

interface RoleMatrixItem {
  code: string;
  name: string;
  tier: string;
  scope: string;
  scopeDescription: string;
  description: string;
  canReview: boolean;
  canApproveFinal: boolean;
  canManageUsers: boolean;
  canManageSectors: boolean;
  canConfigureSystem: boolean;
}

const ROLES_MATRIX: RoleMatrixItem[] = [
  {
    code: "ADMIN",
    name: "Ban Quản Trị Hiệp Hội BACLINK",
    tier: "Cấp 1 (Quản trị Tập trung)",
    scope: "GLOBAL",
    scopeDescription: "Phạm vi toàn hệ thống (GLOBAL): Phê duyệt 1 cấp tập trung, quản trị danh mục ngành & vận hành sàn.",
    description: "Ban Quản trị BACLINK thực hiện thẩm định & phê duyệt trực tiếp 1 cấp cho Doanh nghiệp Hội viên, sản phẩm và nhu cầu.",
    canReview: true,
    canApproveFinal: true,
    canManageUsers: true,
    canManageSectors: true,
    canConfigureSystem: true,
  },
  {
    code: "ENTERPRISE",
    name: "Doanh Nghiệp Hội Viên BACLINK (Dual-Mode)",
    tier: "Cấp 2 (Hội viên Giao thương)",
    scope: "GLOBAL",
    scopeDescription: "Phạm vi toàn sàn (GLOBAL) + Bảo vệ IDOR theo OrganizationId/PersonId; hỗ trợ chuyển đổi Bên Mua ↔ Bên Bán.",
    description: "Doanh nghiệp Hội viên sau khi được ADMIN duyệt sẽ sở hữu đồng thời năng lực Bên Mua & Bên Bán (activeRole: BUYER | SELLER).",
    canReview: false,
    canApproveFinal: false,
    canManageUsers: false,
    canManageSectors: false,
    canConfigureSystem: false,
  },
  {
    code: "PUBLIC_USER",
    name: "Thành Viên / Khách Đã Đăng Nhập",
    tier: "Cấp 3 (Đại chúng)",
    scope: "GLOBAL",
    scopeDescription: "Phạm vi cá nhân (GLOBAL): Tra cứu danh bạ công khai và gửi hồ sơ đăng ký Doanh nghiệp Hội viên BACLINK.",
    description: "Tài khoản thành viên tiêu chuẩn có thể tra cứu danh bạ công nghiệp Bắc Ninh và nộp hồ sơ nâng hạng lên ENTERPRISE.",
    canReview: false,
    canApproveFinal: false,
    canManageUsers: false,
    canManageSectors: false,
    canConfigureSystem: false,
  },
];

interface OfficerUser {
  id: string;
  name: string;
  email: string;
  role: string;
  scopeType: string;
  scopeId: string | null;
  assignedAt: string | null;
}

export default function AdminRolesPage() {
  const [activeTab, setActiveTab] = useState<"matrix" | "officers">("matrix");
  const [officers, setOfficers] = useState<OfficerUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination states
  const [matrixPage, setMatrixPage] = useState(1);
  const [matrixPageSize, setMatrixPageSize] = useState(10);
  const [officersPage, setOfficersPage] = useState(1);
  const [officersPageSize, setOfficersPageSize] = useState(10);

  // Form state
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("ADMIN");
  const [formScopeType, setFormScopeType] = useState("GLOBAL");
  const [officersLoading, setOfficersLoading] = useState(true);
  const [officersError, setOfficersError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const loadOfficers = useCallback(async () => {
    setOfficersLoading(true); setOfficersError("");
    try {
      const response = await fetch(`${API_BASE}/api/v1/governance/roles/officers`, { headers: authClient.getAuthHeaders(), cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success || !Array.isArray(payload.data)) throw new Error(payload.error || "Không tải được danh sách nhân sự.");
      setOfficers(payload.data);
    } catch (error) { setOfficersError(error instanceof Error ? error.message : "Không tải được danh sách nhân sự."); }
    finally { setOfficersLoading(false); }
  }, []);
  useEffect(() => { void loadOfficers(); }, [loadOfficers]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredOfficers = officers.filter((u) => {
    const matchesSearch =
      (u.name || u.email).toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.scopeId || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || normalizePlatformRole(u.role) === filterRole || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const matrixTotalPages = Math.ceil(ROLES_MATRIX.length / matrixPageSize) || 1;
  const paginatedMatrix = ROLES_MATRIX.slice((matrixPage - 1) * matrixPageSize, matrixPage * matrixPageSize);

  const officersTotalPages = Math.ceil(filteredOfficers.length / officersPageSize) || 1;
  const paginatedOfficers = filteredOfficers.slice((officersPage - 1) * officersPageSize, officersPage * officersPageSize);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaveError("");
    if (saving) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/governance/roles/assign`, {
        method: "POST", headers: { ...authClient.getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ email: formEmail.trim(), role: formRole, scopeType: "GLOBAL", scopeId: null }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || payload.message || "Không thể gán vai trò.");
      setIsModalOpen(false); setToastMessage(payload.message || "Đã lưu phân quyền.");
      setFormEmail(""); await loadOfficers();
    } catch (error) { setSaveError(error instanceof Error ? error.message : "Không thể kết nối máy chủ."); }
    finally { setSaving(false); }
  };

  const getRoleBadge = (role: string) => {
    const normalized = normalizePlatformRole(role);
    switch (normalized) {
      case "ADMIN":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-200">{role}</span>;
      case "ENTERPRISE":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">{role}</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">{role}</span>;
    }
  };

  return (
    <div className="w-full">
      <div className="w-full space-y-5">
        {/* Breadcrumbs */}
        <AdminBreadcrumbs
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Quản Trị Hệ Thống", href: "/admin" },
            { label: "Phân Quyền 3 Cấp BACLINK" },
          ]}
        />

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-brand-700" />
              <h1 className="text-2xl font-bold text-gray-900">Quản Lý Vai Trò & Phân Quyền (RBAC 3 Cấp BACLINK)</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Quy chuẩn 3 vai trò hạt nhân (ADMIN, ENTERPRISE, PUBLIC_USER), phạm vi GLOBAL và phân bổ nhân sự quản trị.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AppButton
              variant="primary"
              onClick={() => { setSaveError(""); setFormEmail(""); setFormRole("ADMIN"); setFormScopeType("GLOBAL"); setIsModalOpen(true); }}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Gán Vai Trò Tài Khoản</span>
            </AppButton>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase">Vai Trò Chuẩn</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">3 Cấp</div>
            <div className="text-xs text-gray-400 mt-0.5">ADMIN · ENTERPRISE · PUBLIC_USER</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase">Quy Trình Phê Duyệt</div>
            <div className="text-2xl font-bold text-brand-700 mt-1">1 Cấp</div>
            <div className="text-xs text-gray-400 mt-0.5">Ban Quản trị BACLINK (ADMIN)</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase">Phạm Vi Dữ Liệu</div>
            <div className="text-2xl font-bold text-nacen-green-600 mt-1">GLOBAL + IDOR</div>
            <div className="text-xs text-gray-400 mt-0.5">Tách biệt theo OrganizationId</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase">Tài Khoản Quản Trị</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{officers.length} Nhân Sự</div>
            <div className="text-xs text-gray-400 mt-0.5">Được phân quyền tác nghiệp</div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab("matrix")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "matrix"
                ? "border-brand-700 text-brand-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Ma Trận Quyền Hạn (Permissions Matrix)</span>
          </button>
          <button
            onClick={() => setActiveTab("officers")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "officers"
                ? "border-brand-700 text-brand-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Danh Sách Nhân Sự & Phân Quyền ({officers.length})</span>
          </button>
        </div>

        {/* TAB 1: PERMISSIONS MATRIX */}
        {activeTab === "matrix" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Ma Trận 3 Cấp Vai Trò & Thẩm Quyền Cốt Lõi</h3>
                <p className="text-xs text-gray-500">Được bảo vệ bởi policy engine và Row-Level Security (.NET Authorization Gate)</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="py-3 px-4">Mã Role</th>
                    <th className="py-3 px-4">Tên Nghiệp Vụ</th>
                    <th className="py-3 px-4">Cấp Phân Quyền</th>
                    <th className="py-3 px-4">Phạm Vi (Scope)</th>
                    <th className="py-3 px-4 text-center">Tài Khoản</th>
                    <th className="py-3 px-4 text-center">Thẩm Định HS</th>
                    <th className="py-3 px-4 text-center">Ký Duyệt 1 Cấp</th>
                    <th className="py-3 px-4 text-center">Quản Trị Hội Viên</th>
                    <th className="py-3 px-4 text-center">Quản Trị Danh Mục</th>
                    <th className="py-3 px-4 text-center">Cấu Hình HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedMatrix.map((r) => {
                    const assignedCount = officers.filter((o) => normalizePlatformRole(o.role) === r.code).length;
                    return (
                      <tr key={r.code} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">{getRoleBadge(r.code)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-gray-900">{r.name}</span>
                            <div className="relative group inline-block">
                              <button
                                type="button"
                                className="text-gray-400 hover:text-brand-600 focus:outline-none p-0.5 rounded"
                                title={`${r.scopeDescription} — ${r.description}`}
                                aria-label={`Chi tiết quyền hạn ${r.name}`}
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                              <div className="pointer-events-none absolute left-0 bottom-full mb-2 hidden group-hover:block group-focus-within:block w-72 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-30">
                                <p className="font-semibold text-brand-300 mb-1">{r.name} ({r.code})</p>
                                <p className="text-gray-200 mb-1.5">{r.description}</p>
                                <div className="border-t border-gray-700 pt-1 text-xs text-amber-300">
                                  <span className="font-medium">Phạm vi:</span> {r.scopeDescription}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">{r.tier}</td>
                        <td className="py-3 px-4">
                          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono">{r.scope}</code>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setFilterRole(r.code);
                              setActiveTab("officers");
                              setOfficersPage(1);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 transition"
                            title={`Xem danh sách ${assignedCount} tài khoản giữ vai trò ${r.code}`}
                          >
                            <Users className="w-3 h-3" />
                            <span>{assignedCount} tài khoản</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {r.canReview ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {r.canApproveFinal ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {r.canManageUsers ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {r.canManageSectors ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {r.canConfigureSystem ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <span className="text-gray-300">-</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Matrix Pagination Controls */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span>
                  Hiển thị {Math.min((matrixPage - 1) * matrixPageSize + 1, ROLES_MATRIX.length)} - {Math.min(matrixPage * matrixPageSize, ROLES_MATRIX.length)} trong tổng số {ROLES_MATRIX.length} vai trò
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={matrixPage <= 1}
                  onClick={() => setMatrixPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Trang trước</span>
                </button>
                <span className="px-2 font-medium">Trang {matrixPage} / {matrixTotalPages}</span>
                <button
                  type="button"
                  disabled={matrixPage >= matrixTotalPages}
                  onClick={() => setMatrixPage((p) => Math.min(matrixTotalPages, p + 1))}
                  className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>Trang sau</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OFFICERS & ASSIGNMENTS */}
        {activeTab === "officers" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-between items-start sm:items-center">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo email hoặc tên tài khoản..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setOfficersPage(1);
                  }}
                  className="form-control w-full pl-9 pr-3 text-sm"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setOfficersPage(1);
                  }}
                  className="form-control text-sm font-medium"
                >
                  <option value="">Tất cả Vai Trò (3 Cấp)</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                  <option value="PUBLIC_USER">PUBLIC_USER</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="py-3 px-4">Họ & Tên</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Vai Trò (Role)</th>
                    <th className="py-3 px-4">Phạm Vi (Scope)</th>
                    <th className="py-3 px-4">Đơn Vị / Scope</th>
                    <th className="py-3 px-4">Lần Cập Nhật Quyền</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(officersLoading || officersError) && <tr><td colSpan={7}><Async state={officersLoading ? "loading" : "error"} errorMessage={officersError} onRetry={() => void loadOfficers()}><span /></Async></td></tr>}
                  {!officersLoading && !officersError && paginatedOfficers.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900">{o.name || o.email}</td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-xs">{o.email}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {getRoleBadge(o.role)}
                          <div className="text-xs text-gray-500">{resolveRoleName(o.role)}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                          <Building className="w-3.5 h-3.5 text-brand-600" />
                          {o.scopeType || "GLOBAL"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono font-bold text-gray-800">
                          {o.scopeId || "Toàn hệ thống BACLINK"}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">{o.assignedAt ? new Date(o.assignedAt).toLocaleDateString("vi-VN") : "Chưa ghi nhận"}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSaveError("");
                            setFormEmail(o.email);
                            setFormRole(normalizePlatformRole(o.role));
                            setFormScopeType("GLOBAL");
                            setIsModalOpen(true);
                          }}
                          className="text-xs text-brand-700 hover:text-brand-800 font-semibold"
                        >
                          Sửa Quyền
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!officersLoading && !officersError && filteredOfficers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        Không tìm thấy tài khoản nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Officers Pagination Controls */}
            {!officersLoading && !officersError && filteredOfficers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select
                    value={officersPageSize}
                    onChange={(e) => {
                      setOfficersPageSize(Number(e.target.value));
                      setOfficersPage(1);
                    }}
                    className="appearance-none h-7 pl-2.5 pr-6 border border-gray-300 rounded text-xs bg-white cursor-pointer bg-[url('data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20fill=%27none%27%20viewBox=%270%200%2020%2020%27%3e%3cpath%20stroke=%27%2364748b%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%20stroke-width=%271.5%27%20d=%27M6%208l4%204%204-4%27/%3e%3c/svg%3e')] bg-no-repeat bg-[right_0.35rem_center] bg-[length:0.95rem_0.95rem]"
                    aria-label="Số tài khoản trên trang"
                  >
                    <option value={5}>5 tài khoản / trang</option>
                    <option value={10}>10 tài khoản / trang</option>
                    <option value={20}>20 tài khoản / trang</option>
                  </select>
                  <span>
                    (Hiển thị {Math.min((officersPage - 1) * officersPageSize + 1, filteredOfficers.length)} - {Math.min(officersPage * officersPageSize, filteredOfficers.length)} / {filteredOfficers.length} tài khoản)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={officersPage <= 1}
                    onClick={() => setOfficersPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Trang trước</span>
                  </button>
                  <span className="px-2 font-medium">Trang {officersPage} / {officersTotalPages}</span>
                  <button
                    type="button"
                    disabled={officersPage >= officersTotalPages}
                    onClick={() => setOfficersPage((p) => Math.min(officersTotalPages, p + 1))}
                    className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <span>Trang sau</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Gán Quyền 3 Cấp */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-brand-700" />
                  <h3 className="font-bold text-gray-900 text-lg">Bổ Nhiệm & Gán Vai Trò 3 Cấp</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Email Tài Khoản:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="VD: admin@baclink.vn"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Vai Trò (Role):
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => {
                        setFormRole(e.target.value);
                        setFormScopeType("GLOBAL");
                      }}
                      className="form-control"
                    >
                      <option value="ADMIN">ADMIN (Ban Quản trị BACLINK)</option>
                      <option value="ENTERPRISE">ENTERPRISE (Doanh nghiệp Hội viên)</option>
                      <option value="PUBLIC_USER">PUBLIC_USER (Thành viên đại chúng)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Phạm Vi (Scope Type):
                    </label>
                    <select
                      value={formScopeType}
                      disabled
                      onChange={(e) => setFormScopeType(e.target.value)}
                      className="form-control"
                    >
                      <option value="GLOBAL">GLOBAL (Toàn hệ thống BACLINK)</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Theo ADR-0018, cả 3 vai trò chuẩn sử dụng phạm vi <code>GLOBAL</code> và bảo vệ dữ liệu theo tổ chức/cá nhân sở hữu.
                </p>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <AppButton
                    variant="outline"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Hủy Bỏ
                  </AppButton>
                  {saveError && <p role="alert" className="text-body text-rose-700">{saveError}</p>}
                  <AppButton variant="primary" type="submit" disabled={saving}>
                    {saving ? "Đang lưu…" : "Xác Nhận Bổ Nhiệm"}
                  </AppButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
