"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  RefreshCw,
  Eye,
  Edit2,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Building,
  MapPin,
  Tag,
  Shield,
  ShieldCheck,
  AlertTriangle,
  X,
  Phone,
  Mail,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX
} from "lucide-react";
import { API_BASE } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { Async } from "@/components/ui/async";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { AppButton } from "@/components/ui/design-system";
import { resolveProvinceName, resolveRoleName, resolveSectorName } from "@/lib/label-resolver";

interface UserItem {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  organization?: string | null;
  role: string;
  platformRole?: string;
  scopeType?: string;
  scopeId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface UserProfileDetail {
  user: UserItem;
  ipIntakes?: Array<{ id: string; title: string; status: string; category?: string; createdAt: string }>;
  challengeIntakes?: Array<{ id: string; title: string; status: string; category?: string; createdAt: string }>;
}

export default function AdminUsersPage() {
  const currentUser = authClient.getUser();
  const currentUserId = currentUser?.id;

  // Data state
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Drawer & Modal state
  const [drawerUser, setDrawerUser] = useState<UserItem | null>(null);
  const [drawerProfile, setDrawerProfile] = useState<UserProfileDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editOrg, setEditOrg] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [resetPwUser, setResetPwUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [lockUser, setLockUser] = useState<UserItem | null>(null);
  const [lockReason, setLockReason] = useState("");
  const [lockSubmitting, setLockSubmitting] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createFirstName, setCreateFirstName] = useState("");
  const [createLastName, setCreateLastName] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createOrg, setCreateOrg] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`${API_BASE}/api/v1/admin/users?${params.toString()}`, {
        headers: {
          ...authClient.getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Máy chủ phản hồi mã lỗi ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const rawData = Array.isArray(json.data) ? json.data : [];
      setUsers(rawData);
      if (json.meta) {
        setTotal(json.meta.total || rawData.length);
        setTotalPages(json.meta.totalPages || Math.ceil((json.meta.total || rawData.length) / limit));
      } else {
        setTotal(rawData.length);
        setTotalPages(Math.ceil(rawData.length / limit) || 1);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tải danh sách tài khoản người dùng";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  // Client-side role filtering if roleFilter != 'all'
  const filteredUsers = useMemo(() => {
    if (roleFilter === "all") return users;
    return users.filter((u) => {
      const role = (u.platformRole || u.role || "").toUpperCase();
      return role === roleFilter.toUpperCase();
    });
  }, [users, roleFilter]);

  // Metrics
  const activeCount = useMemo(() => users.filter((u) => u.isActive).length, [users]);
  const lockedCount = useMemo(() => users.filter((u) => !u.isActive).length, [users]);
  const officersCount = useMemo(
    () =>
      users.filter((u) => {
        const r = (u.platformRole || u.role || "").toUpperCase();
        return ["SUPER_ADMIN", "OPERATOR_ADMIN", "PROVINCIAL_ADMIN", "CLUSTER_ADMIN", "SECTOR_ADMIN"].includes(r);
      }).length,
    [users]
  );

  // Role Badge Styling
  const getRoleBadge = (roleCode?: string) => {
    const r = (roleCode || "USER").toUpperCase();
    switch (r) {
      case "SUPER_ADMIN":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-200">SUPER_ADMIN</span>;
      case "OPERATOR_ADMIN":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200">OPERATOR_ADMIN</span>;
      case "PROVINCIAL_ADMIN":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">PROVINCIAL_ADMIN</span>;
      case "CLUSTER_ADMIN":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-100 text-cyan-800 border border-cyan-200">CLUSTER_ADMIN</span>;
      case "SECTOR_ADMIN":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">SECTOR_ADMIN</span>;
      case "VERIFIED_EXPERT":
      case "EXPERT":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">VERIFIED_EXPERT</span>;
      case "ENTERPRISE":
      case "INNOVATION_ENTITY":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">ENTERPRISE</span>;
      case "BUYER":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">BUYER</span>;
      case "SELLER":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200">SELLER</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">{r}</span>;
    }
  };

  // Open 360 Drawer
  const handleOpenDrawer = async (user: UserItem) => {
    setDrawerUser(user);
    setDrawerLoading(true);
    setDrawerProfile(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/users/${user.id}/profile`, {
        headers: { ...authClient.getAuthHeaders() },
      });
      if (res.ok) {
        const data = await res.json();
        setDrawerProfile(data);
      } else {
        setDrawerProfile({ user });
      }
    } catch {
      setDrawerProfile({ user });
    } finally {
      setDrawerLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (user: UserItem) => {
    setEditUser(user);
    setEditFirstName(user.firstName || "");
    setEditLastName(user.lastName || "");
    setEditPhone(user.phone || "");
    setEditOrg(user.organization || "");
    setEditError(null);
  };

  // Submit Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: {
          ...authClient.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
          phone: editPhone.trim(),
          organization: editOrg.trim(),
        }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Cập nhật thất bại (mã ${res.status})`);
      }
      setEditUser(null);
      void fetchUsers();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật");
    } finally {
      setEditSubmitting(false);
    }
  };

  // Open Reset Password Modal
  const handleOpenResetPassword = (user: UserItem) => {
    setResetPwUser(user);
    setNewPassword("");
    setResetError(null);
    setResetSuccess(false);
  };

  // Submit Reset Password
  const handleSaveResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwUser) return;
    if (!newPassword || newPassword.length < 6) {
      setResetError("Mật khẩu mới phải có tối thiểu 6 ký tự");
      return;
    }
    setResetSubmitting(true);
    setResetError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/users/${resetPwUser.id}/reset-password`, {
        method: "POST",
        headers: {
          ...authClient.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Đặt lại mật khẩu thất bại");
      }
      setResetSuccess(true);
      setTimeout(() => {
        setResetPwUser(null);
      }, 1500);
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi đặt lại mật khẩu");
    } finally {
      setResetSubmitting(false);
    }
  };

  // Open Lock Modal
  const handleOpenLock = (user: UserItem) => {
    setLockUser(user);
    setLockReason("");
    setLockError(null);
  };

  // Submit Lock / Unlock (Soft Delete / Reactivate)
  const handleSaveLock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockUser) return;

    // BR-USER-01 Validation
    if (lockUser.id === currentUserId && lockUser.isActive) {
      setLockError("Quy tắc BR-USER-01: Bạn không thể tự khóa hoặc xóa tài khoản của chính mình");
      return;
    }

    // BR-USER-02 Validation
    if (lockUser.email.toLowerCase() === "admin@nacentech.gov.vn" && lockUser.isActive) {
      setLockError("Quy tắc BR-USER-02: Không thể khóa hoặc vô hiệu hóa tài khoản Quản trị gốc");
      return;
    }

    if (lockUser.isActive && (!lockReason || lockReason.trim().length < 5)) {
      setLockError("Vui lòng nhập lý do khóa tài khoản (tối thiểu 5 ký tự)");
      return;
    }

    setLockSubmitting(true);
    setLockError(null);

    try {
      if (lockUser.isActive) {
        // Soft delete / Deactivate
        const res = await fetch(`${API_BASE}/api/v1/admin/users/${lockUser.id}`, {
          method: "DELETE",
          headers: {
            ...authClient.getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: lockReason.trim() }),
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.message || "Khóa tài khoản thất bại");
        }
      } else {
        // Reactivate
        const res = await fetch(`${API_BASE}/api/v1/admin/users/${lockUser.id}`, {
          method: "PATCH",
          headers: {
            ...authClient.getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: true }),
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.message || "Mở khóa tài khoản thất bại");
        }
      }
      setLockUser(null);
      void fetchUsers();
    } catch (err: unknown) {
      setLockError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật trạng thái");
    } finally {
      setLockSubmitting(false);
    }
  };

  // Create User Submit
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail.trim()) {
      setCreateError("Email là bắt buộc");
      return;
    }
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/users`, {
        method: "POST",
        headers: {
          ...authClient.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: createEmail.trim().toLowerCase(),
          password: createPassword || undefined,
          firstName: createFirstName.trim() || undefined,
          lastName: createLastName.trim() || undefined,
          phone: createPhone.trim() || undefined,
          organization: createOrg.trim() || undefined,
          isActive: true,
        }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Tạo tài khoản thất bại (mã ${res.status})`);
      }
      setIsCreateOpen(false);
      setCreateEmail("");
      setCreatePassword("");
      setCreateFirstName("");
      setCreateLastName("");
      setCreatePhone("");
      setCreateOrg("");
      void fetchUsers();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo tài khoản");
    } finally {
      setCreateSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* BREADCRUMBS */}
      <AdminBreadcrumbs
        items={[
          { label: "Quản Trị Hệ Thống", href: "/admin" },
          { label: "Quản Lý Người Dùng Toàn Hệ Thống" },
        ]}
      />

      {/* HEADER & METRIC CARDS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Trung Tâm Quản Trị Người Dùng Toàn Quốc
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              User 360° Console
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Giám sát, phân quyền Scoped RBAC và quản lý vòng đời tài khoản toàn diện trên 34 Tỉnh/Thành trọng điểm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void fetchUsers()}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1.5"
            title="Làm mới dữ liệu từ PostgreSQL"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm Mới</span>
          </button>
          <AppButton
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Tài Khoản Mới</span>
          </AppButton>
        </div>
      </div>

      {/* 4 KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng Người Dùng</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{total}</div>
          <p className="text-[11px] text-slate-400 mt-1">Dữ liệu kết nối trực tiếp PostgreSQL</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Đang Hoạt Động</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{activeCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Trạng thái ACTIVE hợp lệ</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Đang Bị Khóa</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-red-600">{lockedCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Soft-delete an toàn cấp 3</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cán Bộ Quản Trị</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700">{officersCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Tầng 0 & Tầng 1 Sở Tỉnh</p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo Tên, Email, SĐT, Tổ chức..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="all">Tất cả 10 Vai Trò</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN (Quản trị tối cao)</option>
            <option value="OPERATOR_ADMIN">OPERATOR_ADMIN (Vận hành sàn)</option>
            <option value="PROVINCIAL_ADMIN">PROVINCIAL_ADMIN (Sở Tỉnh)</option>
            <option value="CLUSTER_ADMIN">CLUSTER_ADMIN (Chuyên viên Sở)</option>
            <option value="SECTOR_ADMIN">SECTOR_ADMIN (Trưởng ban ngành)</option>
            <option value="VERIFIED_EXPERT">VERIFIED_EXPERT (Chuyên gia)</option>
            <option value="ENTERPRISE">ENTERPRISE (Doanh nghiệp ĐMST)</option>
            <option value="BUYER">BUYER (Bên Mua công nghệ)</option>
            <option value="SELLER">SELLER (Bên Bán công nghệ)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động (ACTIVE)</option>
            <option value="inactive">Đang bị khóa (INACTIVE)</option>
          </select>

          {/* Limit selector */}
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value={10}>10 dòng/trang</option>
            <option value={20}>20 dòng/trang</option>
            <option value={50}>50 dòng/trang</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE (5 UX STATES VIA ASYNC) */}
      <Async
        state={loading ? "loading" : error ? "error" : filteredUsers.length === 0 ? "empty" : "success"}
        errorMessage={error || undefined}
        onRetry={() => void fetchUsers()}
        emptyContent={
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Không tìm thấy tài khoản người dùng nào phù hợp với bộ lọc.</p>
          </div>
        }
      >
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Họ Tên & Danh Tính</th>
                  <th className="py-3 px-4">Email & SĐT</th>
                  <th className="py-3 px-4">Cơ Quan / Doanh Nghiệp</th>
                  <th className="py-3 px-4">Vai Trò (Role)</th>
                  <th className="py-3 px-4">Phạm Vi (Scope)</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4">Ngày Tạo</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((u) => {
                  const fullName = [u.lastName, u.firstName].filter(Boolean).join(" ") || u.email;
                  const initials = fullName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const isCurrent = u.id === currentUserId;
                  const isRootAdmin = u.email.toLowerCase() === "admin@nacentech.gov.vn";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{fullName}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700">
                                  Bạn
                                </span>
                              )}
                              {isRootAdmin && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                                  Gốc
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {u.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-800">{u.email}</div>
                        <div className="text-[11px] text-slate-400">{u.phone || "—"}</div>
                      </td>

                      {/* Organization */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 line-clamp-1">
                          {u.organization || "—"}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <div>{getRoleBadge(u.platformRole || u.role)}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {resolveRoleName(u.platformRole || u.role)}
                        </div>
                      </td>

                      {/* Scope */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                          {u.scopeType === "GLOBAL" && <Building className="w-3 h-3 text-red-500" />}
                          {u.scopeType === "PROVINCE" && <MapPin className="w-3 h-3 text-cyan-600" />}
                          {u.scopeType === "SECTOR" && <Tag className="w-3 h-3 text-amber-500" />}
                          <span>{u.scopeType || "GLOBAL"}</span>
                        </span>
                        {u.scopeId && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {u.scopeType === "PROVINCE"
                              ? `${resolveProvinceName(u.scopeId)} (${u.scopeId})`
                              : u.scopeId}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3" /> Đã khóa
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Detail */}
                          <button
                            onClick={() => void handleOpenDrawer(u)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Xem chi tiết 360°"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Profile */}
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => handleOpenResetPassword(u)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="Đặt lại mật khẩu"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Lock / Unlock */}
                          <button
                            onClick={() => handleOpenLock(u)}
                            disabled={isCurrent || isRootAdmin}
                            className={`p-1.5 rounded-lg transition ${
                              isCurrent || isRootAdmin
                                ? "text-slate-300 cursor-not-allowed"
                                : u.isActive
                                ? "text-slate-600 hover:text-red-600 hover:bg-red-50"
                                : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={
                              isCurrent
                                ? "Quy tắc BR-USER-01: Không thể tự khóa chính mình"
                                : isRootAdmin
                                ? "Quy tắc BR-USER-02: Không thể khóa tài khoản gốc"
                                : u.isActive
                                ? "Khóa tài khoản"
                                : "Mở khóa tài khoản"
                            }
                          >
                            {u.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION BAR */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Hiển thị <span className="font-bold text-slate-800">{filteredUsers.length}</span> trên tổng số{" "}
              <span className="font-bold text-slate-800">{total}</span> tài khoản
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Trước
              </button>
              <span className="text-xs font-bold text-slate-700 px-2">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Sau <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Async>

      {/* DRAWER: USER 360° PROFILE */}
      {drawerUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Hồ Sơ Chi Tiết 360°</h3>
                <p className="text-xs text-slate-400">Thông tin tài khoản, vai trò và dữ liệu liên kết</p>
              </div>
              <button
                onClick={() => setDrawerUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 space-y-6">
              {drawerLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-xs">Đang tải hồ sơ từ PostgreSQL...</span>
                </div>
              ) : (
                <>
                  {/* Avatar & Basic Info */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold text-base flex items-center justify-center shadow">
                      {[drawerUser.lastName, drawerUser.firstName].filter(Boolean).join(" ")[0] || "U"}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">
                        {[drawerUser.lastName, drawerUser.firstName].filter(Boolean).join(" ") || drawerUser.email}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">{drawerUser.email}</div>
                      <div className="mt-1">{getRoleBadge(drawerUser.platformRole || drawerUser.role)}</div>
                    </div>
                  </div>

                  {/* Attributes Table */}
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Mã Định Danh (ID)</span>
                      <span className="font-mono font-bold text-slate-800">{drawerUser.id}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Số Điện Thoại</span>
                      <span className="font-bold text-slate-800">{drawerUser.phone || "Chưa cập nhật"}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Tổ Chức / Đơn Vị</span>
                      <span className="font-bold text-slate-800">{drawerUser.organization || "Chưa cập nhật"}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Phạm Vi Thẩm Quyền</span>
                      <span className="font-bold text-slate-800">
                        {drawerUser.scopeType || "GLOBAL"} {drawerUser.scopeId ? `(${drawerUser.scopeId})` : ""}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Trạng Thái Tài Khoản</span>
                      <span className="font-bold">
                        {drawerUser.isActive ? (
                          <span className="text-emerald-600 font-bold">Hoạt động bình thường</span>
                        ) : (
                          <span className="text-red-600 font-bold">Đang bị khóa</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Ngày Tạo</span>
                      <span className="text-slate-800 font-medium">
                        {drawerUser.createdAt ? new Date(drawerUser.createdAt).toLocaleString("vi-VN") : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Connected Resources (Demands & Tech Offers) */}
                  {drawerProfile && (
                    <div className="space-y-4 pt-2">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Dữ Liệu Liên Kết (Techmart & ĐMST)
                      </h4>

                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-700 flex justify-between">
                          <span>Bài Toán Tìm Mua (Demands)</span>
                          <span className="font-bold text-blue-600">
                            {drawerProfile.challengeIntakes?.length || 0} bài toán
                          </span>
                        </div>
                        {drawerProfile.challengeIntakes && drawerProfile.challengeIntakes.length > 0 ? (
                          <ul className="space-y-1.5">
                            {drawerProfile.challengeIntakes.slice(0, 3).map((item) => (
                              <li
                                key={item.id}
                                className="p-2 bg-slate-50 rounded-lg text-[11px] border border-slate-100 flex justify-between"
                              >
                                <span className="line-clamp-1 text-slate-800 font-medium">{item.title}</span>
                                <span className="text-slate-400 shrink-0 font-mono ml-2">{item.status}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic">Chưa đăng tải bài toán công nghệ nào.</div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-700 flex justify-between">
                          <span>Giải Pháp Chào Bán (Tech Offers)</span>
                          <span className="font-bold text-emerald-600">
                            {drawerProfile.ipIntakes?.length || 0} giải pháp
                          </span>
                        </div>
                        {drawerProfile.ipIntakes && drawerProfile.ipIntakes.length > 0 ? (
                          <ul className="space-y-1.5">
                            {drawerProfile.ipIntakes.slice(0, 3).map((item) => (
                              <li
                                key={item.id}
                                className="p-2 bg-slate-50 rounded-lg text-[11px] border border-slate-100 flex justify-between"
                              >
                                <span className="line-clamp-1 text-slate-800 font-medium">{item.title}</span>
                                <span className="text-slate-400 shrink-0 font-mono ml-2">{item.status}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic">Chưa chào bán giải pháp công nghệ nào.</div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setDrawerUser(null)}
                className="w-full py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER PROFILE */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Chỉnh Sửa Thông Tin Tài Khoản</h3>
              <button
                onClick={() => setEditUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ & Tên Đệm</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="Nguyễn"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="Văn A"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="0912345678"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tổ Chức / Đơn Vị Công Tác</label>
                <input
                  type="text"
                  value={editOrg}
                  onChange={(e) => setEditOrg(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="Sở KH&CN hoặc Tên Doanh nghiệp"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Hủy
                </button>
                <AppButton
                  type="submit"
                  variant="primary"
                  disabled={editSubmitting}
                  className="text-xs font-bold"
                >
                  Lưu Thay Đổi
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {resetPwUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Đặt Lại Mật Khẩu</h3>
              <button
                onClick={() => setResetPwUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResetPassword} className="p-5 space-y-4">
              {resetError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Mật khẩu đã được đặt lại thành công!</span>
                </div>
              )}

              <div>
                <p className="text-xs text-slate-500 mb-2">
                  Tài khoản: <strong className="text-slate-800">{resetPwUser.email}</strong>
                </p>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mật Khẩu Mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="Nhập tối thiểu 6 ký tự..."
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetPwUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Đóng
                </button>
                <AppButton
                  type="submit"
                  variant="primary"
                  disabled={resetSubmitting}
                  className="text-xs font-bold"
                >
                  Xác Nhận Đổi
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOCK / UNLOCK USER (SOFT DELETE) */}
      {lockUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                {lockUser.isActive ? (
                  <>
                    <Lock className="w-4 h-4 text-red-600" />
                    <span>Khóa Tài Khoản Người Dùng</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 text-emerald-600" />
                    <span>Mở Khóa Tài Khoản</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setLockUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLock} className="p-5 space-y-4">
              {lockError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{lockError}</span>
                </div>
              )}

              <p className="text-xs text-slate-600">
                Bạn có chắc chắn muốn {lockUser.isActive ? "khóa" : "mở khóa"} tài khoản của:{" "}
                <strong className="text-slate-900">{lockUser.email}</strong>?
              </p>

              {lockUser.isActive && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lý Do Khóa Tài Khoản <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={lockReason}
                    onChange={(e) => setLockReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                    placeholder="Nhập lý do khóa tài khoản để lưu vết AuditLog an toàn cấp 3..."
                    required
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLockUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={lockSubmitting}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition ${
                    lockUser.isActive
                      ? "bg-red-600 hover:bg-red-700 disabled:opacity-50"
                      : "bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                  }`}
                >
                  {lockSubmitting ? "Đang xử lý..." : lockUser.isActive ? "Xác Nhận Khóa" : "Mở Khóa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE USER */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Thêm Tài Khoản Người Dùng Mới</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Công Vụ / Tài Khoản <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="canbo@sokhcn.gov.vn hoặc user@dn.vn"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật Khẩu Khởi Tạo
                </label>
                <input
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="Mặc định nếu để trống: Password@123"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ & Tên Đệm</label>
                  <input
                    type="text"
                    value={createLastName}
                    onChange={(e) => setCreateLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="Trần"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên</label>
                  <input
                    type="text"
                    value={createFirstName}
                    onChange={(e) => setCreateFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="Văn Minh"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="0912345678"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tổ Chức / Đơn Vị Công Tác</label>
                <input
                  type="text"
                  value={createOrg}
                  onChange={(e) => setCreateOrg(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="Sở KH&CN TP.HCM"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Hủy
                </button>
                <AppButton
                  type="submit"
                  variant="primary"
                  disabled={createSubmitting}
                  className="text-xs font-bold"
                >
                  Tạo Tài Khoản
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
