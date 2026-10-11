"use client";

import React, { useEffect, useState } from "react";
import { authClient, UserContext } from "@/lib/auth-client";
import { AppButton } from "@/components/ui/design-system";
import { Async, UXState } from "@/components/ui/async";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Building,
  MapPin,
  Mail,
  CheckCircle2,
  XCircle,
  KeyRound,
  Search,
  Filter,
  Check,
  X,
  AlertCircle
} from "lucide-react";

interface GovStaffMember {
  id: string;
  fullName: string;
  email: string;
  role: "CLUSTER_ADMIN" | "PROVINCIAL_ADMIN";
  department: string;
  scopeId: string;
  provinceName: string;
  status: "ACTIVE" | "INACTIVE";
  assignedAt: string;
  tasksReviewedCount: number;
}

const PROVINCE_MAP: Record<string, string> = {
  HP: "Hải Phòng",
  HN: "Hà Nội",
  HCM: "TP. Hồ Chí Minh",
  DN: "Đà Nẵng",
  QN: "Quảng Ninh",
  BN: "Bắc Ninh",
  BDG: "Bình Dương",
  DNA: "Đồng Nai",
  CT: "Cần Thơ",
};

export default function GovStaffSettingsPage() {
  const [user, setUser] = useState<UserContext | null>(null);
  const [staffList, setStaffList] = useState<GovStaffMember[]>([]);
  const [uxState, setUxState] = useState<UXState>("loading");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffDept, setNewStaffDept] = useState("Phòng Quản lý Công nghệ & Thị trường");
  const [formError, setFormError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const currentScopeId = user?.scopeId || "HN";
  const currentProvinceName = PROVINCE_MAP[currentScopeId] || currentScopeId;

  useEffect(() => {
    const u = authClient.getUser();
    setUser(u);
    loadStaff(u);
  }, []);

  const loadStaff = async (currentUser?: UserContext | null) => {
    setUxState("loading");
    const u = currentUser || user || authClient.getUser();
    const scope = u?.scopeId || "HN";
    const provName = PROVINCE_MAP[scope] || scope;

    try {
      const token = authClient.getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/v1/governance/roles/officers", { headers });
      if (res.ok) {
        const json = await res.json();
        const list: GovStaffMember[] = (json.data || []).map((p: any) => ({
          id: p.id,
          fullName: p.name || p.email,
          email: p.email,
          role: p.role,
          department: p.department || "Sở Khoa học và Công nghệ " + (PROVINCE_MAP[p.scopeId] || p.scopeId || provName),
          scopeId: p.scopeId || scope,
          provinceName: PROVINCE_MAP[p.scopeId] || p.scopeId || provName,
          status: p.status || "ACTIVE",
          assignedAt: p.assignedAt ? new Date(p.assignedAt).toLocaleDateString("vi-VN") : "Mới bổ nhiệm",
          tasksReviewedCount: 0,
        }));
        setStaffList(list);
        setUxState(list.length === 0 ? "empty" : "success");
      } else {
        setStaffList([]);
        setUxState("empty");
      }
    } catch {
      setStaffList([]);
      setUxState("empty");
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newStaffName.trim()) {
      setFormError("Vui lòng nhập họ và tên cán bộ.");
      return;
    }
    if (!newStaffEmail.trim() || !newStaffEmail.includes("@")) {
      setFormError("Vui lòng nhập email công vụ hợp lệ.");
      return;
    }

    setProcessing(true);
    try {
      const token = authClient.getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/v1/governance/roles/assign", {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: newStaffEmail.trim(),
          role: "CLUSTER_ADMIN",
          fullName: newStaffName.trim(),
          department: newStaffDept,
          scopeType: "PROVINCE",
          scopeId: currentScopeId,
        }),
      });

      if (res.ok) {
        showToast(`Đã bổ nhiệm thành công chuyên viên sơ kiểm: ${newStaffName.trim()}`);
        setShowAddModal(false);
        setNewStaffName("");
        setNewStaffEmail("");
        await loadStaff();
      } else {
        const errJson = await res.json().catch(() => null);
        setFormError(errJson?.error || "Không thể bổ nhiệm chuyên viên. Vui lòng kiểm tra lại quyền.");
      }
    } catch {
      setFormError("Lỗi kết nối khi gửi yêu cầu bổ nhiệm.");
    } finally {
      setProcessing(false);
    }
  };

  const toggleStaffStatus = async (id: string) => {
    try {
      const token = authClient.getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/v1/governance/roles/officers/${id}/toggle-status`, {
        method: "POST",
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        setStaffList(prev =>
          prev.map(item => {
            if (item.id === id) {
              const nextStatus = data.isActive ? "ACTIVE" : "INACTIVE";
              showToast(`Đã cập nhật trạng thái chuyên viên: ${nextStatus === "ACTIVE" ? "Đang hoạt động" : "Tạm dừng"}`);
              return { ...item, status: nextStatus };
            }
            return item;
          })
        );
      } else {
        showToast("Không thể cập nhật trạng thái chuyên viên.", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi cập nhật trạng thái chuyên viên.", "error");
    }
  };

  const filteredStaff = staffList.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-2 text-sm font-semibold border ${
          toastMsg.type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200"
            : "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200"
        }`}>
          {toastMsg.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                Tầng 2: Địa Phương
              </span>
              <span className="text-xs font-semibold text-slate-500">Quy chế Maker - Checker Cấp 2</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Quản Lý Cán Bộ & Chuyên Viên Thẩm Định Sở
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đơn vị: <strong>Sở Khoa học và Công nghệ {currentProvinceName}</strong> (Mã Scope:{" "}
              <code className="font-mono text-brand-700 dark:text-brand-300 font-bold">{currentScopeId}</code>)
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-800 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Chuyên Viên Sơ Kiểm</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Tổng Số Chuyên Viên</div>
            <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{staffList.length}</div>
            <div className="text-xs text-slate-400">Thuộc Sở {currentProvinceName}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center dark:bg-brand-950 dark:text-brand-300">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Đang Hoạt Động (Active)</div>
            <div className="mt-1 text-2xl font-black text-emerald-600">
              {staffList.filter(s => s.status === "ACTIVE").length}
            </div>
            <div className="text-xs text-emerald-700">Có quyền sơ kiểm Maker</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Phân Quyền Vai Trò</div>
            <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">CLUSTER_ADMIN</div>
            <div className="text-xs text-slate-400">Sơ kiểm cấp 1 & yêu cầu bổ sung</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center dark:bg-teal-950 dark:text-teal-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Staff List Table with Async 5 States */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo họ tên, email công vụ, phòng ban..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-brand-600 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Hiển thị <strong>{filteredStaff.length}</strong> cán bộ
          </span>
        </div>

        <Async
          state={uxState}
          onRetry={() => loadStaff()}
          emptyContent={
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-3">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-800 dark:text-slate-100">Chưa có cán bộ nào</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Chưa có cán bộ nào được phân công cho Sở KH&CN {currentProvinceName}.</p>
            </div>
          }
        >
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Họ và Tên Cán Bộ</th>
                  <th className="p-3.5">Email Công Vụ</th>
                  <th className="p-3.5">Phòng Ban / Đơn Vị</th>
                  <th className="p-3.5">Vai Trò Hệ Thống</th>
                  <th className="p-3.5">Số Hồ Sơ Đã Xử Lý</th>
                  <th className="p-3.5">Trạng Thái</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 dark:divide-slate-800 dark:text-slate-300">
                {filteredStaff.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                        {member.fullName.charAt(0)}
                      </div>
                      <div>
                        <div>{member.fullName}</div>
                        <div className="text-xs text-slate-400 font-normal">Ngày bổ nhiệm: {member.assignedAt}</div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-xs text-brand-700 dark:text-brand-300 font-semibold">
                      {member.email}
                    </td>
                    <td className="p-3.5">{member.department}</td>
                    <td className="p-3.5">
                      <span className="rounded-md bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                        {member.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">
                      {member.tasksReviewedCount} hồ sơ
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                        member.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {member.status === "ACTIVE" ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {member.status === "ACTIVE" ? "Đang hoạt động" : "Tạm dừng"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => toggleStaffStatus(member.id)}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                          member.status === "ACTIVE"
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        {member.status === "ACTIVE" ? "Tạm khóa" : "Kích hoạt"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Async>
      </div>

      {/* Modal Thêm Chuyên Viên */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Thêm Chuyên Viên Thẩm Định Cấp 2</h3>
                  <p className="text-xs text-slate-500">Phân quyền Sơ kiểm hồ sơ chuyên gia thuộc Sở {currentProvinceName}</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="mt-4 space-y-4 text-xs">
              {formError && (
                <div className="rounded-lg bg-rose-50 p-2.5 text-rose-700 border border-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và tên cán bộ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={e => setNewStaffName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Minh Trí"
                  className="form-control w-full text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email công vụ (@skhcn.gov.vn) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={newStaffEmail}
                  onChange={e => setNewStaffEmail(e.target.value)}
                  placeholder={`tri.hm@skhcn.${currentScopeId.toLowerCase()}.gov.vn`}
                  className="form-control w-full text-sm font-mono"
                />
                <p className="text-xs text-slate-400 mt-1">Hệ thống sẽ gửi Magic Link kích hoạt tài khoản vào email này.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phòng ban / Đơn vị công tác
                </label>
                <select
                  value={newStaffDept}
                  onChange={e => setNewStaffDept(e.target.value)}
                  className="form-control w-full text-sm"
                >
                  <option value="Phòng Quản lý Công nghệ & Thị trường">Phòng Quản lý Công nghệ & Thị trường</option>
                  <option value="Phòng Quản lý Khoa học & Đổi mới sáng tạo">Phòng Quản lý Khoa học & Đổi mới sáng tạo</option>
                  <option value="Phòng Tiêu chuẩn & Đo lường chất lượng">Phòng Tiêu chuẩn & Đo lường chất lượng</option>
                  <option value="Trung tâm Ứng dụng Tiến bộ KH&CN">Trung tâm Ứng dụng Tiến bộ KH&CN</option>
                </select>
              </div>

              <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3 dark:border-brand-900/40 dark:bg-brand-950/40 space-y-1.5">
                <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold">
                  <span>Vai trò kỹ thuật:</span>
                  <span className="font-mono text-brand-700 dark:text-brand-300">CLUSTER_ADMIN</span>
                </div>
                <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold">
                  <span>Phạm vi quản lý (ScopeId):</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-300">{currentScopeId} ({currentProvinceName})</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chuyên viên chỉ có quyền sơ kiểm (Maker Check) hồ sơ trong địa bàn {currentProvinceName}, không thể ký duyệt cấp 2.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-11 px-5 rounded-control border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 text-sm transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="h-11 px-5 rounded-control bg-brand-700 font-bold text-white hover:bg-brand-800 disabled:opacity-50 text-sm transition"
                >
                  {processing ? "Đang xử lý..." : "Xác Nhận Bổ Nhiệm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
