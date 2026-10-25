"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Network,
  Building2,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Search,
  Check,
  X,
  Edit2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  Building,
} from "lucide-react";
import { AppButton } from "@/components/ui/design-system";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { Async } from "@/components/ui/async";
import {
  orgTreeApi,
  OrganizationUnitItem,
  CreateOrganizationUnitPayload,
  UpdateOrganizationUnitPayload,
  ProvisionProvinceLeaderPayload,
} from "@/services/api/org-tree";

interface NestedOrgNode extends OrganizationUnitItem {
  children?: NestedOrgNode[];
}

// Chuyển danh sách phẳng (flat) từ backend thành cây 3 cấp
function buildTree(flatUnits: OrganizationUnitItem[]): NestedOrgNode[] {
  const map = new Map<string, NestedOrgNode>();
  const roots: NestedOrgNode[] = [];

  flatUnits.forEach((u) => {
    map.set(u.id, { ...u, children: [] });
  });

  flatUnits.forEach((u) => {
    const node = map.get(u.id)!;
    if (u.parentId && map.has(u.parentId)) {
      map.get(u.parentId)!.children!.push(node);
    } else if (u.unitType === "NATIONAL") {
      roots.push(node);
    } else {
      // Nếu không có parent và không phải NATIONAL, đưa vào làm top-level hoặc con của root
      if (roots.length > 0) {
        roots[0].children!.push(node);
      } else {
        roots.push(node);
      }
    }
  });

  return roots.length > 0 ? roots : flatUnits.map((u) => ({ ...u, children: [] }));
}

export default function OrgTreePage() {
  const [flatUnits, setFlatUnits] = useState<OrganizationUnitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedNode, setSelectedNode] = useState<NestedOrgNode | null>(null);

  // Modals state
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Action loading / error
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form states
  const [provForm, setProvForm] = useState<ProvisionProvinceLeaderPayload>({
    email: "",
    password: "TempPassword-2026!",
    firstName: "Lãnh đạo",
    lastName: "",
    phone: "0901234567",
    provinceId: "HN",
  });

  const [unitForm, setUnitForm] = useState<{
    code: string;
    name: string;
    unitType: "NATIONAL" | "PROVINCIAL" | "INSTITUTION";
    parentId: string;
    provinceId: string;
  }>({
    code: "",
    name: "",
    unitType: "INSTITUTION",
    parentId: "",
    provinceId: "",
  });

  const [editForm, setEditForm] = useState<{
    id: string;
    code: string;
    name: string;
    provinceId: string;
  }>({
    id: "",
    code: "",
    name: "",
    provinceId: "",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadTreeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orgTreeApi.getTree();
      setFlatUnits(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tải cây cơ cấu tổ chức.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTreeData();
  }, [loadTreeData]);

  // Tree nodes sau khi lồng nhau
  const treeNodes = buildTree(flatUnits);

  // Danh sách các Sở Tỉnh để làm parent trong dropdown
  const provincialOptions = flatUnits.filter(
    (u) => u.unitType === "PROVINCIAL" && u.status === "ACTIVE"
  );
  const nationalUnit = flatUnits.find((u) => u.unitType === "NATIONAL");

  // Handler mở Modal Thêm đơn vị
  const handleOpenAddModal = (defaultParentId?: string) => {
    setModalError(null);
    setUnitForm({
      code: "",
      name: "",
      unitType: defaultParentId ? "INSTITUTION" : "PROVINCIAL",
      parentId: defaultParentId || (nationalUnit ? nationalUnit.id : ""),
      provinceId: "",
    });
    setIsAddUnitModalOpen(true);
  };

  // Handler Thêm đơn vị
  const handleConfirmAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitForm.code || !unitForm.name) {
      setModalError("Vui lòng điền đầy đủ Mã đơn vị và Tên đơn vị.");
      return;
    }

    setActionLoading(true);
    setModalError(null);
    try {
      await orgTreeApi.createUnit({
        code: unitForm.code.trim().toUpperCase(),
        name: unitForm.name.trim(),
        unitType: unitForm.unitType,
        parentId: unitForm.parentId || null,
        provinceId: unitForm.provinceId.trim().toUpperCase() || null,
      });
      setIsAddUnitModalOpen(false);
      showToast(`Đã thêm thành công đơn vị: ${unitForm.name}`);
      await loadTreeData();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Lỗi khi tạo đơn vị.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handler mở Modal Sửa
  const handleOpenEditModal = (node: NestedOrgNode) => {
    setSelectedNode(node);
    setModalError(null);
    setEditForm({
      id: node.id,
      code: node.code,
      name: node.name,
      provinceId: node.provinceId || "",
    });
    setIsEditModalOpen(true);
  };

  // Handler Sửa đơn vị
  const handleConfirmEditUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      setModalError("Tên đơn vị không được để trống.");
      return;
    }

    setActionLoading(true);
    setModalError(null);
    try {
      await orgTreeApi.updateUnit(editForm.id, {
        name: editForm.name.trim(),
        provinceId: editForm.provinceId.trim().toUpperCase() || null,
      });
      setIsEditModalOpen(false);
      showToast(`Đã cập nhật thành công đơn vị: ${editForm.name}`);
      await loadTreeData();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Lỗi khi cập nhật đơn vị.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handler mở Modal Vô hiệu hóa / Xóa
  const handleOpenDeleteModal = (node: NestedOrgNode) => {
    setSelectedNode(node);
    setModalError(null);
    setIsDeleteModalOpen(true);
  };

  // Handler Xác nhận Xóa / Vô hiệu hóa
  const handleConfirmDeactivate = async () => {
    if (!selectedNode) return;
    setActionLoading(true);
    setModalError(null);
    try {
      await orgTreeApi.deactivateUnit(selectedNode.id);
      setIsDeleteModalOpen(false);
      showToast(`Đã vô hiệu hóa thành công đơn vị: ${selectedNode.name}`);
      await loadTreeData();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Lỗi khi vô hiệu hóa đơn vị.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handler mở Modal Cấp quyền Lãnh đạo Sở
  const handleOpenProvision = (node: NestedOrgNode) => {
    setSelectedNode(node);
    setModalError(null);
    setProvForm({
      email: node.leaderEmail || `lanhdao.${node.provinceId?.toLowerCase() || "tinh"}@nacentech.gov.vn`,
      password: "TempPassword-2026!",
      firstName: "Lãnh đạo",
      lastName: node.name.replace("Sở Khoa học và Công nghệ ", ""),
      phone: "0901234567",
      provinceId: node.provinceId || "HN",
    });
    setIsProvisionModalOpen(true);
  };

  // Handler Xác nhận Cấp quyền Lãnh đạo Sở
  const handleConfirmProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provForm.email || !provForm.password) {
      setModalError("Vui lòng điền đủ email và mật khẩu.");
      return;
    }

    setActionLoading(true);
    setModalError(null);
    try {
      await orgTreeApi.provisionLeader(provForm);
      setIsProvisionModalOpen(false);
      showToast(`Đã cấp thành công tài khoản quản trị Sở [${provForm.provinceId}] cho ${provForm.email}`);
      await loadTreeData();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Lỗi khi cấp tài khoản.");
    } finally {
      setActionLoading(false);
    }
  };

  // Thống kê nhanh
  const nationalCount = flatUnits.filter((u) => u.unitType === "NATIONAL").length;
  const provincialCount = flatUnits.filter((u) => u.unitType === "PROVINCIAL").length;
  const institutionCount = flatUnits.filter((u) => u.unitType === "INSTITUTION").length;
  const activeCount = flatUnits.filter((u) => u.status === "ACTIVE").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Breadcrumbs */}
      <AdminBreadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Quản Trị Hệ Thống", href: "/admin" },
          { label: "Cây Thư Mục 34 Tỉnh/Thành" },
        ]}
      />

      {/* Toast Thông Báo */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-card bg-emerald-600 text-white shadow-xl animate-fade-in border border-emerald-500">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-body font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-hero font-extrabold tracking-tight text-slate-900 dark:text-white">
            Cây Tổ Chức Mạng Lưới Đổi Mới Sáng Tạo (34 Tỉnh/Thành Trọng Điểm)
          </h1>
          <p className="text-body text-slate-600 dark:text-slate-300 mt-1">
            Quản Trị Cây Thư Mục & Phân Cấp Hành Chính 34 Tỉnh/Thành kết nối trực tiếp PostgreSQL: Trung ương → Sở KH&CN Tỉnh → Viện/Trường Cơ sở.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <AppButton
            variant="outline"
            onClick={() => void loadTreeData()}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Làm Mới Dữ Liệu</span>
          </AppButton>
          <AppButton
            variant="primary"
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Đơn Vị Mới</span>
          </AppButton>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-caption font-medium text-slate-500 dark:text-slate-400">Cơ quan Trung ương</p>
          <p className="text-section-title font-black text-brand-600 mt-1">
            {String(nationalCount).padStart(2, "0")}
          </p>
          <p className="text-caption text-slate-500 mt-1">Bộ KH&CN / NacenTech</p>
        </div>
        <div className="p-4 rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-caption font-medium text-slate-500 dark:text-slate-400">Sở KH&CN Tỉnh/Thành</p>
          <p className="text-section-title font-black text-slate-900 dark:text-white mt-1">
            {provincialCount}
          </p>
          <p className="text-caption text-emerald-600 font-semibold mt-1">Cấp 2 liên thông cơ sở dữ liệu</p>
        </div>
        <div className="p-4 rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-caption font-medium text-slate-500 dark:text-slate-400">Viện / Trường Đại học</p>
          <p className="text-section-title font-black text-amber-600 mt-1">
            {institutionCount}
          </p>
          <p className="text-caption text-slate-500 mt-1">Cơ sở NCKH & Đào tạo trực thuộc</p>
        </div>
        <div className="p-4 rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-caption font-medium text-slate-500 dark:text-slate-400">Đơn vị đang Hoạt Động</p>
          <p className="text-section-title font-black text-emerald-600 mt-1">
            {activeCount} / {flatUnits.length}
          </p>
          <p className="text-caption text-slate-500 mt-1">Đồng bộ PostgreSQL Online</p>
        </div>
      </div>

      {/* Main Tree Card */}
      <div className="rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-brand-600" />
            <h2 className="text-card-title font-bold text-slate-900 dark:text-white">
              Cơ Cấu Cây Hành Chính 3 Cấp (Trung ương → Sở Tỉnh → Cơ sở)
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm Sở Tỉnh hoặc Viện/Trường..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-control text-label border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Async Container: 5 UX States */}
        <div className="p-4">
          <Async
            state={
              loading
                ? "loading"
                : error
                ? "error"
                : flatUnits.length === 0
                ? "empty"
                : "success"
            }
            errorMessage={error || undefined}
            emptyContent={
              <div className="text-center py-12 space-y-3">
                <Building className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-body font-medium text-slate-600 dark:text-slate-300">
                  Chưa có dữ liệu đơn vị hành chính nào trong cơ sở dữ liệu.
                </p>
                <AppButton variant="primary" onClick={() => handleOpenAddModal()}>
                  Khởi Tạo Đơn Vị Đầu Tiên
                </AppButton>
              </div>
            }
            onRetry={loadTreeData}
          >
            <div className="space-y-4">
              {treeNodes.map((root) => {
                const filteredChildren = root.children?.filter(
                  (c) =>
                    !search ||
                    c.name.toLowerCase().includes(search.toLowerCase()) ||
                    c.code.toLowerCase().includes(search.toLowerCase()) ||
                    (c.provinceId && c.provinceId.toLowerCase().includes(search.toLowerCase())) ||
                    c.children?.some(
                      (sub) =>
                        sub.name.toLowerCase().includes(search.toLowerCase()) ||
                        sub.code.toLowerCase().includes(search.toLowerCase())
                    )
                );

                return (
                  <div key={root.id} className="space-y-3">
                    {/* Level 1: Root Central */}
                    <div className="p-4 rounded-control border-2 border-brand-500 bg-brand-50 dark:bg-brand-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">
                          TW
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-label font-bold text-slate-900 dark:text-white">
                              {root.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-caption font-semibold bg-brand-200 text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                              Cấp 1: Toàn quốc
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-caption font-semibold ${
                                root.status === "ACTIVE"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                              }`}
                            >
                              {root.status === "ACTIVE" ? "Đang hoạt động" : "Đã vô hiệu hóa"}
                            </span>
                          </div>
                          <p className="text-caption text-slate-500 mt-0.5">
                            Mã: <code className="font-mono">{root.code}</code> | ID: {root.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <AppButton
                          variant="outline"
                          onClick={() => handleOpenEditModal(root)}
                          className="flex items-center gap-1 min-h-9 px-3 py-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Chỉnh Sửa</span>
                        </AppButton>
                        <AppButton
                          variant="primary"
                          onClick={() => handleOpenAddModal(root.id)}
                          className="flex items-center gap-1 min-h-9 px-3 py-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm Sở Tỉnh</span>
                        </AppButton>
                      </div>
                    </div>

                    {/* Level 2 & 3: Provincial & Institutions */}
                    <div className="pl-4 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-4 mt-3">
                      {filteredChildren && filteredChildren.length === 0 ? (
                        <p className="text-caption text-slate-500 italic py-2">
                          Không tìm thấy đơn vị nào khớp với từ khóa tìm kiếm &quot;{search}&quot;.
                        </p>
                      ) : (
                        filteredChildren?.map((prov) => {
                          const hasLeader = Boolean(prov.leaderEmail);
                          const isProvActive = prov.status === "ACTIVE";

                          return (
                            <div
                              key={prov.id}
                              className={`p-3.5 rounded-control border transition ${
                                isProvActive
                                  ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-300"
                                  : "border-rose-200 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20 opacity-75"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <Building2 className="w-5 h-5 text-slate-500 mt-0.5" />
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-label font-bold text-slate-900 dark:text-white">
                                        {prov.name}
                                      </span>
                                      {prov.provinceId && (
                                        <span className="px-2 py-0.5 rounded-full text-caption font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                          Scope: {prov.provinceId}
                                        </span>
                                      )}
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-caption font-semibold ${
                                          isProvActive
                                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                                        }`}
                                      >
                                        {isProvActive ? "Hoạt động" : "Vô hiệu hóa"}
                                      </span>
                                    </div>
                                    <p className="text-caption text-slate-500 mt-0.5">
                                      Mã: <code className="font-mono">{prov.code}</code>
                                      {hasLeader ? (
                                        <span> • Cán bộ phụ trách: <strong className="text-slate-700 dark:text-slate-200">{prov.leaderName}</strong> ({prov.leaderEmail})</span>
                                      ) : (
                                        <span className="text-amber-600 font-semibold"> • Chưa bàn giao tài khoản quản trị Sở</span>
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Cấp tài khoản quản trị Sở */}
                                  {!hasLeader && isProvActive && (
                                    <AppButton
                                      variant="primary"
                                      onClick={() => handleOpenProvision(prov)}
                                      className="flex items-center gap-1.5 min-h-9 px-3 py-1.5"
                                    >
                                      <UserPlus className="w-3.5 h-3.5" />
                                      <span>Cấp Quyền Sở</span>
                                    </AppButton>
                                  )}

                                  {/* Thêm cơ sở con trực thuộc */}
                                  {isProvActive && (
                                    <AppButton
                                      variant="outline"
                                      onClick={() => handleOpenAddModal(prov.id)}
                                      className="flex items-center gap-1 min-h-9 px-3 py-1.5"
                                      title="Thêm Viện/Trường trực thuộc Sở này"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Thêm Cơ Sở</span>
                                    </AppButton>
                                  )}

                                  {/* Sửa */}
                                  <AppButton
                                    variant="outline"
                                    onClick={() => handleOpenEditModal(prov)}
                                    className="flex items-center gap-1 min-h-9 px-2.5 py-1.5"
                                    title="Chỉnh sửa thông tin"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </AppButton>

                                  {/* Xóa / Vô hiệu hóa */}
                                  {isProvActive && (
                                    <AppButton
                                      variant="outline"
                                      onClick={() => handleOpenDeleteModal(prov)}
                                      className="flex items-center gap-1 min-h-9 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 border-rose-200"
                                      title="Vô hiệu hóa đơn vị (BR-TREE-003)"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </AppButton>
                                  )}
                                </div>
                              </div>

                              {/* Level 3: Institutions */}
                              {prov.children && prov.children.length > 0 && (
                                <div className="mt-3 pl-4 sm:pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-2">
                                  <p className="text-caption font-semibold text-slate-400 uppercase tracking-wider">
                                    Cơ sở trực thuộc / Viện / Trường liên kết ({prov.children.length})
                                  </p>
                                  {prov.children.map((inst) => {
                                    const isInstActive = inst.status === "ACTIVE";
                                    return (
                                      <div
                                        key={inst.id}
                                        className={`p-2.5 rounded-control border flex items-center justify-between gap-2 ${
                                          isInstActive
                                            ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60"
                                            : "bg-rose-50/20 border-rose-200/60 opacity-70"
                                        }`}
                                      >
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-label font-semibold text-slate-800 dark:text-slate-200">
                                              {inst.name}
                                            </span>
                                            <span
                                              className={`px-1.5 py-0.5 rounded text-caption font-medium ${
                                                isInstActive
                                                  ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                                  : "bg-rose-100 text-rose-700"
                                              }`}
                                            >
                                              {isInstActive ? "Cấp 3: Cơ sở" : "Đã vô hiệu hóa"}
                                            </span>
                                          </div>
                                          <p className="text-caption text-slate-500">
                                            Mã: <code className="font-mono">{inst.code}</code>
                                          </p>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <AppButton
                                            variant="outline"
                                            onClick={() => handleOpenEditModal(inst)}
                                            className="p-1.5 min-h-8 min-w-8 h-8 w-8"
                                            title="Chỉnh sửa"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </AppButton>
                                          {isInstActive && (
                                            <AppButton
                                              variant="outline"
                                              onClick={() => handleOpenDeleteModal(inst)}
                                              className="p-1.5 min-h-8 min-w-8 h-8 w-8 text-rose-600 hover:bg-rose-50 border-rose-200"
                                              title="Vô hiệu hóa cơ sở"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </AppButton>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Async>
        </div>
      </div>

      {/* Modal Cấp tài khoản quản trị Sở */}
      {isProvisionModalOpen && selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-brand-600">
                <UserPlus className="w-5 h-5" />
                <h3 className="text-card-title font-bold text-slate-900 dark:text-white">
                  Khởi Tạo Tài Khoản Quản Trị Sở Tỉnh
                </h3>
              </div>
              <button
                onClick={() => setIsProvisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-control bg-rose-50 border border-rose-200 text-rose-700 text-label flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <p className="text-label text-slate-600 dark:text-slate-300">
              Đơn vị tiếp nhận: <strong>{selectedNode.name}</strong> (Scope: {selectedNode.provinceId})
            </p>

            <form onSubmit={handleConfirmProvision} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label font-semibold text-slate-700 dark:text-slate-300">Họ và tên đệm</label>
                  <input
                    type="text"
                    required
                    value={provForm.firstName}
                    onChange={(e) => setProvForm({ ...provForm, firstName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-control text-label border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-label font-semibold text-slate-700 dark:text-slate-300">Tên</label>
                  <input
                    type="text"
                    required
                    value={provForm.lastName}
                    onChange={(e) => setProvForm({ ...provForm, lastName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-control text-label border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-label font-semibold text-slate-700 dark:text-slate-300">Email công vụ</label>
                <input
                  type="email"
                  required
                  value={provForm.email}
                  onChange={(e) => setProvForm({ ...provForm, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-control text-label border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-label font-semibold text-slate-700 dark:text-slate-300">Mật khẩu khởi tạo</label>
                <input
                  type="text"
                  required
                  value={provForm.password}
                  onChange={(e) => setProvForm({ ...provForm, password: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-control text-label border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <AppButton
                  type="button"
                  variant="outline"
                  onClick={() => setIsProvisionModalOpen(false)}
                  disabled={actionLoading}
                >
                  Hủy
                </AppButton>
                <AppButton type="submit" variant="primary" disabled={actionLoading}>
                  {actionLoading ? "Đang xử lý..." : "Xác Nhận Cấp Quyền"}
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm đơn vị mới */}
      {isAddUnitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-brand-600">
                <Plus className="w-5 h-5" />
                <h3 className="text-card-title font-bold text-slate-900 dark:text-white">
                  Thêm Đơn Vị Hành Chính Mới
                </h3>
              </div>
              <button
                onClick={() => setIsAddUnitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-control bg-rose-50 border border-rose-200 text-rose-700 text-label flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmAddUnit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label font-semibold text-slate-700 dark:text-slate-300">Cấp bậc đơn vị</label>
                  <select
                    value={unitForm.unitType}
                    onChange={(e) =>
                      setUnitForm({
                        ...unitForm,
                        unitType: e.target.value as "PROVINCIAL" | "INSTITUTION",
                        parentId: e.target.value === "PROVINCIAL" ? (nationalUnit?.id || "") : (provincialOptions[0]?.id || ""),
                      })
                    }
                    className="form-control w-full mt-1 text-sm"
                  >
                    <option value="PROVINCIAL">Cấp 2: Sở KH&CN Tỉnh</option>
                    <option value="INSTITUTION">Cấp 3: Viện/Trường/Cơ sở</option>
                  </select>
                </div>

                <div>
                  <label className="text-label font-semibold text-slate-700 dark:text-slate-300">Mã tỉnh (Province ID)</label>
                  <input
                    type="text"
                    placeholder="VD: HN, HP, SG"
                    value={unitForm.provinceId}
                    onChange={(e) => setUnitForm({ ...unitForm, provinceId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-control text-label border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-label font-semibold text-slate-700 dark:text-slate-300">Mã đơn vị (Code)</label>
                <input
                  type="text"
                  required
                  placeholder="SO-KHCN-BN hoặc DH-BACHKHOA-HN"
                  value={unitForm.code}
                  onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-control text-label border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-label font-semibold text-slate-700 dark:text-slate-300">Tên đơn vị</label>
                <input
                  type="text"
                  required
                  placeholder="Sở Khoa học và Công nghệ Tỉnh... hoặc Viện Nghiên cứu..."
                  value={unitForm.name}
                  onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-control text-label border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {unitForm.unitType === "INSTITUTION" && (
                <div>
                  <label className="text-label font-semibold text-slate-700 dark:text-slate-300">Trực thuộc Sở Tỉnh (Parent)</label>
                  <select
                    value={unitForm.parentId}
                    onChange={(e) => setUnitForm({ ...unitForm, parentId: e.target.value })}
                    className="form-control w-full mt-1 text-sm"
                  >
                    {provincialOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.provinceId || p.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <AppButton
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddUnitModalOpen(false)}
                  disabled={actionLoading}
                >
                  Hủy
                </AppButton>
                <AppButton type="submit" variant="primary" disabled={actionLoading}>
                  {actionLoading ? "Đang lưu..." : "Xác Nhận Thêm Đơn Vị"}
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa đơn vị (PUT) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-brand-600">
                <Edit2 className="w-5 h-5" />
                <h3 className="text-card-title font-bold text-slate-900 dark:text-white">
                  Chỉnh Sửa Thông Tin Đơn Vị
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-control bg-rose-50 border border-rose-200 text-rose-700 text-label flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmEditUnit} className="space-y-4">
              <div>
                <label className="text-label font-semibold text-slate-700 dark:text-slate-300">Mã đơn vị (Chỉ xem)</label>
                <input
                  type="text"
                  disabled
                  value={editForm.code}
                  className="w-full mt-1 px-3 py-2 rounded-control text-label border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="text-label font-semibold text-slate-700 dark:text-slate-300">Tên đơn vị</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-control text-label border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-label font-semibold text-slate-700 dark:text-slate-300">Mã tỉnh (Province ID)</label>
                <input
                  type="text"
                  placeholder="VD: HN, HP, SG"
                  value={editForm.provinceId}
                  onChange={(e) => setEditForm({ ...editForm, provinceId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-control text-label border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <AppButton
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={actionLoading}
                >
                  Hủy
                </AppButton>
                <AppButton type="submit" variant="primary" disabled={actionLoading}>
                  {actionLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Vô hiệu hóa (DELETE / BR-TREE-003) */}
      {isDeleteModalOpen && selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-card-title font-bold text-slate-900 dark:text-white">
                  Xác Nhận Vô Hiệu Hóa Đơn Vị
                </h3>
                <p className="text-caption text-slate-500">Ràng buộc nghiệp vụ BR-TREE-003</p>
              </div>
            </div>

            {modalError && (
              <div className="p-3 rounded-control bg-rose-50 border border-rose-200 text-rose-700 text-label flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{modalError}</span>
              </div>
            )}

            <p className="text-body text-slate-600 dark:text-slate-300">
              Bạn có chắc chắn muốn vô hiệu hóa đơn vị <strong>{selectedNode.name}</strong> (Mã: <code>{selectedNode.code}</code>)?
            </p>
            <p className="text-caption text-amber-700 bg-amber-50 p-2.5 rounded-control border border-amber-200">
              <strong>Lưu ý quy tắc BR-TREE-003:</strong> Hệ thống sẽ chặn hành động nếu đơn vị này vẫn còn các cơ sở con trực thuộc đang hoạt động.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <AppButton
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={actionLoading}
              >
                Hủy
              </AppButton>
              <AppButton
                type="button"
                variant="primary"
                onClick={handleConfirmDeactivate}
                disabled={actionLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {actionLoading ? "Đang xử lý..." : "Xác Nhận Vô Hiệu Hóa"}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
