"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  Users,
  KeyRound,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  UserPlus,
  ArrowRight,
  AlertCircle,
  Building,
  MapPin,
  Tag,
  Info,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { API_BASE } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { Async } from "@/components/ui/async";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { AppButton } from "@/components/ui/design-system";
import { getActiveSectors, SectorOption } from "@/lib/master-data-client";
import { resolveProvinceName, resolveRoleName, resolveSectorName } from "@/lib/label-resolver";

interface RoleMatrixItem {
  code: string;
  name: string;
  tier: string;
  scope: string;
  scopeDescription: string;
  description: string;
  canReview: boolean;
  canApproveFinal: boolean;
  canManageOrg: boolean;
  canManageSectors: boolean;
  canConfigureSystem: boolean;
}

const ROLES_MATRIX: RoleMatrixItem[] = [
  {
    code: "SUPER_ADMIN",
    name: "Quản trị Tối cao (NacenTech)",
    tier: "Tầng 1 (Trung Ương)",
    scope: "GLOBAL",
    scopeDescription: "Phạm vi toàn quốc (GLOBAL): Toàn quyền quản trị tham số, chính sách và override tầng 0",
    description: "Quản trị tối cao hệ sinh thái NacenTech, thiết lập quy tắc vận hành và bảo vệ toàn vẹn dữ liệu.",
    canReview: true,
    canApproveFinal: true,
    canManageOrg: true,
    canManageSectors: true,
    canConfigureSystem: true
  },
  {
    code: "OPERATOR_ADMIN",
    name: "Quản trị Vận hành Sàn Giao dịch",
    tier: "Tầng 1 (Trung Ương)",
    scope: "GLOBAL",
    scopeDescription: "Phạm vi toàn quốc (GLOBAL): Điều hành hoạt động sàn giao dịch công nghệ",
    description: "Kiểm soát dòng giao dịch, duyệt gian hàng và điều phối hoạt động chuyển giao công nghệ.",
    canReview: true,
    canApproveFinal: true,
    canManageOrg: false,
    canManageSectors: true,
    canConfigureSystem: false
  },
  {
    code: "PROVINCIAL_ADMIN",
    name: "Lãnh đạo Sở KH&CN Tỉnh/Thành",
    tier: "Tầng 2 (Sở Tỉnh)",
    scope: "PROVINCE",
    scopeDescription: "Phạm vi tỉnh/thành (PROVINCE): Đại diện Sở KH&CN địa phương quản lý địa bàn",
    description: "Lãnh đạo Sở KH&CN phê duyệt hồ sơ cấp tỉnh, phân công cán bộ và giám sát mạng lưới ĐMST địa bàn.",
    canReview: true,
    canApproveFinal: true,
    canManageOrg: true,
    canManageSectors: false,
    canConfigureSystem: false
  },
  {
    code: "CLUSTER_ADMIN",
    name: "Chuyên viên Thẩm định Sở Tỉnh",
    tier: "Tầng 2 (Sở Tỉnh)",
    scope: "ORG_UNIT",
    scopeDescription: "Phạm vi đơn vị hành chính/tổ chức (ORG_UNIT): Chuyên viên tác nghiệp Sở Tỉnh",
    description: "Chuyên viên thẩm tra hồ sơ, rà soát tính hợp lệ và trình lãnh đạo Sở phê duyệt.",
    canReview: true,
    canApproveFinal: false,
    canManageOrg: false,
    canManageSectors: false,
    canConfigureSystem: false
  },
  {
    code: "SECTOR_ADMIN",
    name: "Trưởng Ban Quản lý Ngành TT17",
    tier: "Tầng 3 (Chuyên Ngành)",
    scope: "SECTOR",
    scopeDescription: "Phạm vi chuyên ngành Thông tư 17 (SECTOR): Trưởng ban quản lý lĩnh vực",
    description: "Thẩm định tính phù hợp công nghệ theo 18 lĩnh vực TT17 và chấm điểm tiêu chuẩn kỹ thuật.",
    canReview: true,
    canApproveFinal: true,
    canManageOrg: false,
    canManageSectors: true,
    canConfigureSystem: false
  },
  {
    code: "INNOVATION_ENTITY",
    name: "Đại diện Viện, Trường, Hiệp hội",
    tier: "Tầng 4 (Cơ Sở)",
    scope: "ORG_UNIT",
    scopeDescription: "Phạm vi cơ sở/viện trường (ORG_UNIT): Đơn vị ĐMST cơ sở",
    description: "Đại diện Viện nghiên cứu, Trường đại học quản lý tài sản trí tuệ và đề xuất giải pháp.",
    canReview: false,
    canApproveFinal: false,
    canManageOrg: false,
    canManageSectors: false,
    canConfigureSystem: false
  },
  {
    code: "VERIFIED_EXPERT",
    name: "Chuyên gia Khoa học & Công nghệ",
    tier: "Tầng 4 (Cá Nhân)",
    scope: "PERSONAL",
    scopeDescription: "Phạm vi cá nhân chuyên gia (PERSONAL): Hội đồng đánh giá chuyên môn",
    description: "Nhà khoa học tham gia phản biện độc lập, đánh giá TRL và tư vấn thương mại hóa công nghệ.",
    canReview: false,
    canApproveFinal: false,
    canManageOrg: false,
    canManageSectors: false,
    canConfigureSystem: false
  },
  {
    code: "SELLER",
    name: "Nhà Cung Ứng Công Nghệ (Shop)",
    tier: "Tầng 4 (Cá Nhân)",
    scope: "PERSONAL",
    scopeDescription: "Phạm vi cá nhân/gian hàng (PERSONAL): Nhà cung ứng công nghệ",
    description: "Doanh nghiệp cung ứng giải pháp kỹ thuật, mở gian hàng và chào bán công nghệ trên sàn.",
    canReview: false,
    canApproveFinal: false,
    canManageOrg: false,
    canManageSectors: false,
    canConfigureSystem: false
  },
  {
    code: "BUYER",
    name: "Bên Mua Công Nghệ / Doanh Nghiệp",
    tier: "Tầng 4 (Cá Nhân)",
    scope: "PERSONAL",
    scopeDescription: "Phạm vi doanh nghiệp đặt hàng (PERSONAL): Bên có nhu cầu công nghệ",
    description: "Doanh nghiệp sản xuất đăng ký bài toán công nghệ cần tìm kiếm lời giải hoặc chuyển giao.",
    canReview: false,
    canApproveFinal: false,
    canManageOrg: false,
    canManageSectors: false,
    canConfigureSystem: false
  },
  {
    code: "PUBLIC_USER",
    name: "Người Dùng Thành Viên Tự Do",
    tier: "Tầng 4 (Cá Nhân)",
    scope: "PERSONAL",
    scopeDescription: "Phạm vi tài khoản cá nhân (PERSONAL): Thành viên tự do",
    description: "Người dùng đại chúng tiếp cận thông tin công nghệ công khai và tài liệu khoa học.",
    canReview: false,
    canApproveFinal: false,
    canManageOrg: false,
    canManageSectors: false,
    canConfigureSystem: false
  }
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
  const [formRole, setFormRole] = useState("PROVINCIAL_ADMIN");
  const [formScopeType, setFormScopeType] = useState("PROVINCE");
  const [formScopeId, setFormScopeId] = useState("");
  const [sectors, setSectors] = useState<SectorOption[]>([]);
  const [sectorsLoading, setSectorsLoading] = useState(true);
  const [sectorsError, setSectorsError] = useState("");
  const [officersLoading, setOfficersLoading] = useState(true);
  const [officersError, setOfficersError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const loadSectors = useCallback(async () => {
    setSectorsLoading(true); setSectorsError("");
    try { setSectors(await getActiveSectors()); }
    catch { setSectorsError("Không tải được danh mục ngành. Vui lòng thử lại."); }
    finally { setSectorsLoading(false); }
  }, []);
  const loadOfficers = useCallback(async () => {
    setOfficersLoading(true); setOfficersError("");
    try {
      const response = await fetch(`${API_BASE}/api/v1/governance/roles/officers`, { headers: authClient.getAuthHeaders(), cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success || !Array.isArray(payload.data)) throw new Error(payload.error || "Không tải được danh sách cán bộ.");
      setOfficers(payload.data);
    } catch (error) { setOfficersError(error instanceof Error ? error.message : "Không tải được danh sách cán bộ."); }
    finally { setOfficersLoading(false); }
  }, []);
  useEffect(() => { void loadSectors(); void loadOfficers(); }, [loadSectors, loadOfficers]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredOfficers = officers.filter((u) => {
    const matchesSearch =
      (u.name || u.email).toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.scopeId || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const matrixTotalPages = Math.ceil(ROLES_MATRIX.length / matrixPageSize) || 1;
  const paginatedMatrix = ROLES_MATRIX.slice((matrixPage - 1) * matrixPageSize, matrixPage * matrixPageSize);

  const officersTotalPages = Math.ceil(filteredOfficers.length / officersPageSize) || 1;
  const paginatedOfficers = filteredOfficers.slice((officersPage - 1) * officersPageSize, officersPage * officersPageSize);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaveError("");
    if (saving) return;
    if (formScopeType === "SECTOR" && !sectors.some((sector) => sector.code === formScopeId)) {
      setSaveError("Vui lòng chọn ngành đang hoạt động."); return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/governance/roles/assign`, {
        method: "POST", headers: { ...authClient.getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ email: formEmail.trim(), role: formRole, scopeType: formScopeType, scopeId: formScopeType === "GLOBAL" ? null : formScopeId.trim() }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || payload.message || "Không thể gán vai trò.");
      setIsModalOpen(false); setToastMessage(payload.message || "Đã lưu phân quyền.");
      setFormEmail(""); await loadOfficers();
    } catch (error) { setSaveError(error instanceof Error ? error.message : "Không thể kết nối máy chủ."); }
    finally { setSaving(false); }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-200">SUPER_ADMIN</span>;
      case "OPERATOR_ADMIN":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">OPERATOR_ADMIN</span>;
      case "PROVINCIAL_ADMIN":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">PROVINCIAL_ADMIN</span>;
      case "CLUSTER_ADMIN":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">CLUSTER_ADMIN</span>;
      case "SECTOR_ADMIN":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">SECTOR_ADMIN</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">{role}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <AdminBreadcrumbs
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Quản Trị Hệ Thống", href: "/admin" },
            { label: "Quản Lý 10 Vai Trò" },
          ]}
        />

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-brand-700" />
              <h1 className="text-2xl font-bold text-gray-900">Quản Lý Vai Trò & Phân Quyền (3D Scoped RBAC)</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Quy chuẩn 10 Roles hạt nhân, ma trận 5 nhóm quyền hạn và phân bổ phạm vi dữ liệu (Global, Province, Sector, OrgUnit).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AppButton
              variant="primary"
              onClick={() => { setSaveError(""); setFormEmail(""); setIsModalOpen(true); }}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Gán Vai Trò Cán Bộ</span>
            </AppButton>
          </div>
        </div>

        {activeTab === "officers" && sectorsError && <Async state="partial" partialWarning="Danh mục ngành chưa tải được; phạm vi ngành đang hiển thị bằng mã."><AppButton variant="outline" onClick={() => void loadSectors()}>Tải lại danh mục ngành</AppButton></Async>}
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
            <div className="text-2xl font-bold text-gray-900 mt-1">10 Roles</div>
            <div className="text-xs text-gray-400 mt-0.5">Không mở rộng persona</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase">Tầng Quản Trị</div>
            <div className="text-2xl font-bold text-brand-700 mt-1">4 Tầng</div>
            <div className="text-xs text-gray-400 mt-0.5">TƯ, Sở Tỉnh, Ngành, Cơ sở</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase">Chiều Phân Quyền</div>
            <div className="text-2xl font-bold text-nacen-green-600 mt-1">3D Scoped</div>
            <div className="text-xs text-gray-400 mt-0.5">Role + ScopeType + ScopeId</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase">Cán Bộ Đã Gán</div>
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
            <span>Danh Sách Cán Bộ & Phân Quyền ({officers.length})</span>
          </button>
        </div>

        {/* TAB 1: PERMISSIONS MATRIX */}
        {activeTab === "matrix" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Ma Trận 10 Vai Trò & Thẩm Quyền Cốt Lõi</h3>
                <p className="text-xs text-gray-500">Được bảo vệ bởi policy engine và Row-Level Security (.NET Authorization Gate)</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="py-3 px-4">Mã Role</th>
                    <th className="py-3 px-4">Tên Nghiệp Vụ</th>
                    <th className="py-3 px-4">Tầng Quản Trị</th>
                    <th className="py-3 px-4">Phạm Vi (Scope)</th>
                    <th className="py-3 px-4 text-center">Cán Bộ Đã Gán</th>
                    <th className="py-3 px-4 text-center">Thẩm Định HS</th>
                    <th className="py-3 px-4 text-center">Ký Duyệt Cuối</th>
                    <th className="py-3 px-4 text-center">Quản Trị Sở Tỉnh</th>
                    <th className="py-3 px-4 text-center">Quản Trị Ngành</th>
                    <th className="py-3 px-4 text-center">Cấu Hình HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedMatrix.map((r) => {
                    const assignedCount = officers.filter((o) => o.role === r.code).length;
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
                            title={`Xem danh sách ${assignedCount} cán bộ giữ vai trò ${r.code}`}
                          >
                            <Users className="w-3 h-3" />
                            <span>{assignedCount} cán bộ</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {r.canReview ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {r.canApproveFinal ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {r.canManageOrg ? <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" /> : <span className="text-gray-300">-</span>}
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
                <span>Hiển thị:</span>
                <div className="inline-flex rounded-md shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMatrixPageSize(5);
                      setMatrixPage(1);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium border rounded-l-md transition ${
                      matrixPageSize === 5
                        ? "bg-brand-700 text-white border-brand-700"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    5
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMatrixPageSize(10);
                      setMatrixPage(1);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium border-t border-b border-r rounded-r-md transition ${
                      matrixPageSize === 10
                        ? "bg-brand-700 text-white border-brand-700"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    10
                  </button>
                </div>
                <span>vai trò / trang</span>
                <span className="text-gray-400">|</span>
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
                  placeholder="Tìm theo email, tên cán bộ, mã tỉnh..."
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
                  <option value="">Tất cả Vai Trò</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="OPERATOR_ADMIN">OPERATOR_ADMIN</option>
                  <option value="PROVINCIAL_ADMIN">PROVINCIAL_ADMIN</option>
                  <option value="CLUSTER_ADMIN">CLUSTER_ADMIN</option>
                  <option value="SECTOR_ADMIN">SECTOR_ADMIN</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="py-3 px-4">Họ & Tên Cán Bộ</th>
                    <th className="py-3 px-4">Email Công Vụ</th>
                    <th className="py-3 px-4">Vai Trò (Role)</th>
                    <th className="py-3 px-4">Phạm Vi (Scope)</th>
                    <th className="py-3 px-4">Mã Định Danh Scope</th>
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
                          {o.scopeType === "GLOBAL" && <Building className="w-3.5 h-3.5 text-red-500" />}
                          {o.scopeType === "PROVINCE" && <MapPin className="w-3.5 h-3.5 text-cyan-600" />}
                          {o.scopeType === "SECTOR" && <Tag className="w-3.5 h-3.5 text-amber-500" />}
                          {o.scopeType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono font-bold text-gray-800">
                          {o.scopeType === "SECTOR"
                            ? sectors.find((sector) => sector.code === o.scopeId)?.name || resolveSectorName(o.scopeId)
                            : o.scopeType === "PROVINCE"
                            ? `${resolveProvinceName(o.scopeId)} (${o.scopeId})`
                            : o.scopeId || "Toàn quốc"}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">{o.assignedAt ? new Date(o.assignedAt).toLocaleDateString("vi-VN") : "Chưa ghi nhận"}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSaveError("");
                            setFormEmail(o.email);
                            setFormRole(o.role);
                            setFormScopeType(o.scopeType);
                            setFormScopeId(o.scopeId || "");
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
                        Không tìm thấy cán bộ nào phù hợp với bộ lọc.
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
                    className="border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                    aria-label="Số cán bộ trên trang"
                  >
                    <option value={5}>5 cán bộ / trang</option>
                    <option value={10}>10 cán bộ / trang</option>
                    <option value={20}>20 cán bộ / trang</option>
                  </select>
                  <span>
                    (Hiển thị {Math.min((officersPage - 1) * officersPageSize + 1, filteredOfficers.length)} - {Math.min(officersPage * officersPageSize, filteredOfficers.length)} / {filteredOfficers.length} cán bộ)
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

        {/* Modal Gán Quyền */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-brand-700" />
                  <h3 className="font-bold text-gray-900 text-lg">Bổ Nhiệm & Gán Vai Trò Cán Bộ</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                {formScopeType === "SECTOR" && <Async state={sectorsLoading ? "loading" : sectorsError ? "error" : !sectors.length ? "empty" : "success"} errorMessage={sectorsError} onRetry={() => void loadSectors()} emptyContent={<p className="text-body">Chưa có ngành đang hoạt động để gán quyền.</p>}><span /></Async>}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Email Tài Khoản:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="VD: so.danang@nacentech.local"
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
                        const r = e.target.value;
                        setFormRole(r);
                        if (r === "PROVINCIAL_ADMIN") {
                           setFormScopeType("PROVINCE"); setFormScopeId("");
                        } else if (r === "CLUSTER_ADMIN") {
                          setFormScopeType("ORG_UNIT"); setFormScopeId("");
                        } else if (r === "SECTOR_ADMIN") {
                          setFormScopeType("SECTOR"); setFormScopeId("");
                        } else if (r === "SUPER_ADMIN" || r === "OPERATOR_ADMIN") {
                          setFormScopeType("GLOBAL");
                          setFormScopeId("");
                        }
                      }}
                      className="form-control"
                    >
                      <option value="PROVINCIAL_ADMIN">PROVINCIAL_ADMIN (Lãnh đạo Sở)</option>
                      <option value="CLUSTER_ADMIN">CLUSTER_ADMIN (Chuyên viên Sở)</option>
                      <option value="SECTOR_ADMIN">SECTOR_ADMIN (Trưởng Ban Ngành)</option>
                      <option value="OPERATOR_ADMIN">OPERATOR_ADMIN (Vận hành Sàn)</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN (Admin Tối Cao)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Phạm Vi (Scope Type):
                    </label>
                    <select
                      value={formScopeType}
                      disabled
                      onChange={(e) => { const next = e.target.value; setFormScopeType(next); setFormScopeId(next === "SECTOR" ? "" : ""); }}
                      className="form-control"
                    >
                      <option value="PROVINCE">PROVINCE (Tỉnh/Thành)</option>
                      <option value="SECTOR">SECTOR (Chuyên Ngành TT17)</option>
                      <option value="GLOBAL">GLOBAL (Toàn Quốc)</option>
                      <option value="ORG_UNIT">ORG_UNIT (Cơ Sở Liên Kết)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Mã Định Danh Scope (Scope Id):
                  </label>
                  {formScopeType === "SECTOR" ? <select required disabled={sectorsLoading || Boolean(sectorsError) || !sectors.length} value={formScopeId} onChange={(e) => setFormScopeId(e.target.value)} className="form-control">
                    <option value="">Chọn ngành đang hoạt động</option>{sectors.map((sector) => <option key={sector.code} value={sector.code}>{sector.code} — {sector.name}</option>)}
                  </select> : <input
                    type="text"
                    required={formScopeType !== "GLOBAL"}
                    disabled={formScopeType === "GLOBAL"}
                    placeholder="Nhập mã scope"
                    value={formScopeId}
                    onChange={(e) => setFormScopeId(e.target.value)}
                    className="form-control font-mono"
                  />}
                  <p className="text-xs text-gray-400 mt-1">
                    {formScopeType === "SECTOR" ? "Chọn ngành đang hoạt động trong danh mục." : "Nhập mã scope theo loại phạm vi đã chọn."}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <AppButton
                    variant="outline"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Hủy Bỏ
                  </AppButton>
                  {saveError && <p role="alert" className="text-body text-rose-700">{saveError}</p>}
                  <AppButton variant="primary" type="submit" disabled={saving || (formScopeType === "SECTOR" && (sectorsLoading || Boolean(sectorsError) || !sectors.length))}>
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
