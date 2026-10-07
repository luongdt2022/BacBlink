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
  Tag
} from "lucide-react";
import { API_BASE } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { Async } from "@/components/ui/async";
import { AdminNav } from "@/components/admin/admin-nav";
import { AppButton } from "@/components/ui/design-system";
import { getActiveSectors, SectorOption } from "@/lib/master-data-client";

interface RoleMatrixItem {
  code: string;
  name: string;
  tier: string;
  scope: string;
  canReview: boolean;
  canApproveFinal: boolean;
  canManageOrg: boolean;
  canManageSectors: boolean;
  canConfigureSystem: boolean;
}

const ROLES_MATRIX: RoleMatrixItem[] = [
  { code: "SUPER_ADMIN", name: "Quản trị Tối cao (NacenTech)", tier: "Tầng 1 (Trung Ương)", scope: "GLOBAL", canReview: true, canApproveFinal: true, canManageOrg: true, canManageSectors: true, canConfigureSystem: true },
  { code: "OPERATOR_ADMIN", name: "Quản trị Vận hành Sàn Giao dịch", tier: "Tầng 1 (Trung Ương)", scope: "GLOBAL", canReview: true, canApproveFinal: true, canManageOrg: false, canManageSectors: true, canConfigureSystem: false },
  { code: "PROVINCIAL_ADMIN", name: "Lãnh đạo Sở KH&CN Tỉnh/Thành", tier: "Tầng 2 (Sở Tỉnh)", scope: "PROVINCE", canReview: true, canApproveFinal: true, canManageOrg: true, canManageSectors: false, canConfigureSystem: false },
  { code: "CLUSTER_ADMIN", name: "Chuyên viên Thẩm định Sở Tỉnh", tier: "Tầng 2 (Sở Tỉnh)", scope: "ORG_UNIT", canReview: true, canApproveFinal: false, canManageOrg: false, canManageSectors: false, canConfigureSystem: false },
  { code: "SECTOR_ADMIN", name: "Trưởng Ban Quản lý Ngành TT17", tier: "Tầng 3 (Chuyên Ngành)", scope: "SECTOR", canReview: true, canApproveFinal: true, canManageOrg: false, canManageSectors: true, canConfigureSystem: false },
  { code: "INNOVATION_ENTITY", name: "Đại diện Viện, Trường, Hiệp hội", tier: "Tầng 4 (Cơ Sở)", scope: "ORG_UNIT", canReview: false, canApproveFinal: false, canManageOrg: false, canManageSectors: false, canConfigureSystem: false },
  { code: "VERIFIED_EXPERT", name: "Chuyên gia Khoa học & Công nghệ", tier: "Tầng 4 (Cá Nhân)", scope: "PERSONAL", canReview: false, canApproveFinal: false, canManageOrg: false, canManageSectors: false, canConfigureSystem: false },
  { code: "SELLER", name: "Nhà Cung Ứng Công Nghệ (Shop)", tier: "Tầng 4 (Cá Nhân)", scope: "PERSONAL", canReview: false, canApproveFinal: false, canManageOrg: false, canManageSectors: false, canConfigureSystem: false },
  { code: "BUYER", name: "Bên Mua Công Nghệ / Doanh Nghiệp", tier: "Tầng 4 (Cá Nhân)", scope: "PERSONAL", canReview: false, canApproveFinal: false, canManageOrg: false, canManageSectors: false, canConfigureSystem: false },
  { code: "PUBLIC_USER", name: "Người Dùng Thành Viên Tự Do", tier: "Tầng 4 (Cá Nhân)", scope: "PERSONAL", canReview: false, canApproveFinal: false, canManageOrg: false, canManageSectors: false, canConfigureSystem: false }
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
        {/* Navigation Bar */}
        <AdminNav />

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
                    <th className="py-3 px-4 text-center">Thẩm Định HS</th>
                    <th className="py-3 px-4 text-center">Ký Duyệt Cuối</th>
                    <th className="py-3 px-4 text-center">Quản Trị Sở Tỉnh</th>
                    <th className="py-3 px-4 text-center">Quản Trị Ngành</th>
                    <th className="py-3 px-4 text-center">Cấu Hình HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ROLES_MATRIX.map((r) => (
                    <tr key={r.code} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">{getRoleBadge(r.code)}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{r.name}</td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{r.tier}</td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono">{r.scope}</code>
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
                  ))}
                </tbody>
              </table>
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                  {!officersLoading && !officersError && filteredOfficers.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900">{o.name || o.email}</td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-xs">{o.email}</td>
                      <td className="py-3 px-4">{getRoleBadge(o.role)}</td>
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
                          {o.scopeType === "SECTOR" ? sectors.find((sector) => sector.code === o.scopeId)?.name || o.scopeId : o.scopeId || "Toàn quốc"}
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
