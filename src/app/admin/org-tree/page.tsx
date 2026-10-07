"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Network,
  Building2,
  ChevronRight,
  ChevronDown,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Search,
  Check,
  X,
  Lock,
} from "lucide-react";
import { AppButton } from "@/components/ui/design-system";
import { AdminNav } from "@/components/admin/admin-nav";

interface OrgNode {
  id: string;
  code: string;
  name: string;
  type: "NATIONAL" | "PROVINCIAL" | "INSTITUTION";
  provinceId?: string;
  leaderEmail?: string;
  leaderName?: string;
  status: "ACTIVE" | "INACTIVE";
  children?: OrgNode[];
}

const INITIAL_ORG_TREE: OrgNode[] = [
  {
    id: "ORG-ROOT",
    code: "NACENTECH-CENTRAL",
    name: "Cơ quan Đầu mối Trung ương NacenTech (Bộ KH&CN)",
    type: "NATIONAL",
    status: "ACTIVE",
    leaderEmail: "admin.super@nacentech.local",
    leaderName: "Ban Quản trị Quốc gia NacenTech",
    children: [
      {
        id: "ORG-HN",
        code: "SO-KHCN-HN",
        name: "Sở Khoa học và Công nghệ TP. Hà Nội",
        type: "PROVINCIAL",
        provinceId: "HN",
        status: "ACTIVE",
        leaderEmail: "lanhdao.hn@nacentech.gov.vn",
        leaderName: "Nguyễn Hoàng Long",
        children: [
          {
            id: "ORG-DHBKHN",
            code: "DH-BACHKHOA-HN",
            name: "Đại học Bách Khoa Hà Nội",
            type: "INSTITUTION",
            status: "ACTIVE",
            leaderEmail: "vien.khcn@hust.edu.vn",
            leaderName: "Viện KH&CN Nhiệt - Lạnh",
          },
          {
            id: "ORG-VIEN-UDCN",
            code: "VIEN-NACENTECH",
            name: "Viện Ứng Dụng Công Nghệ (NacenTech)",
            type: "INSTITUTION",
            status: "ACTIVE",
            leaderEmail: "contact@nacentech.vn",
            leaderName: "Phòng Thí nghiệm Tự động hóa",
          },
        ],
      },
      {
        id: "ORG-HCM",
        code: "SO-KHCN-HCM",
        name: "Sở Khoa học và Công nghệ TP. Hồ Chí Minh",
        type: "PROVINCIAL",
        provinceId: "SG",
        status: "ACTIVE",
        leaderEmail: "lanhdao.hcm@nacentech.gov.vn",
        leaderName: "Trần Anh Tuấn",
        children: [
          {
            id: "ORG-DHQG-HCM",
            code: "DHQG-HCM",
            name: "Đại học Quốc gia TP. Hồ Chí Minh",
            type: "INSTITUTION",
            status: "ACTIVE",
            leaderEmail: "rd@vnuhcm.edu.vn",
            leaderName: "Trung tâm ĐMST & Khởi nghiệp",
          },
        ],
      },
      {
        id: "ORG-HP",
        code: "SO-KHCN-HP",
        name: "Sở Khoa học và Công nghệ TP. Hải Phòng",
        type: "PROVINCIAL",
        provinceId: "HP",
        status: "ACTIVE",
        leaderEmail: "lanhdao.hp@nacentech.gov.vn",
        leaderName: "Phạm Quốc Hùng",
        children: [],
      },
      {
        id: "ORG-DN",
        code: "SO-KHCN-DN",
        name: "Sở Khoa học và Công nghệ TP. Đà Nẵng",
        type: "PROVINCIAL",
        provinceId: "DN",
        status: "ACTIVE",
        leaderEmail: "lanhdao.dn@nacentech.gov.vn",
        leaderName: "Lê Minh Trí",
        children: [],
      },
      {
        id: "ORG-BN",
        code: "SO-KHCN-BN",
        name: "Sở Khoa học và Công nghệ Tỉnh Bắc Ninh",
        type: "PROVINCIAL",
        provinceId: "BN",
        status: "ACTIVE",
        leaderEmail: "",
        leaderName: "",
        children: [],
      },
    ],
  },
];

export default function OrgTreePage() {
  const [nodes, setNodes] = useState<OrgNode[]>(INITIAL_ORG_TREE);
  const [search, setSearch] = useState("");
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);

  // Form provision
  const [provForm, setProvForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    provinceId: "",
  });

  // Form unit
  const [unitForm, setUnitForm] = useState({
    code: "",
    name: "",
    unitType: "INSTITUTION",
    parentId: "",
    provinceId: "",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenProvision = (node: OrgNode) => {
    setSelectedNode(node);
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

  const handleConfirmProvision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provForm.email || !provForm.password) {
      alert("Vui lòng điền đủ email và mật khẩu.");
      return;
    }

    if (selectedNode) {
      const updateNode = (tree: OrgNode[]): OrgNode[] => {
        return tree.map((n) => {
          if (n.id === selectedNode.id) {
            return {
              ...n,
              leaderEmail: provForm.email,
              leaderName: `${provForm.firstName} ${provForm.lastName}`.trim(),
            };
          }
          if (n.children) {
            return { ...n, children: updateNode(n.children) };
          }
          return n;
        });
      };
      setNodes(updateNode(nodes));
    }

    setIsProvisionModalOpen(false);
    showToast(`Đã cấp thành công tài khoản quản trị Sở [${provForm.provinceId}] cho ${provForm.email}`);
  };

  const handleConfirmAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitForm.code || !unitForm.name) {
      alert("Vui lòng nhập mã và tên đơn vị.");
      return;
    }

    const newUnit: OrgNode = {
      id: `ORG-CUSTOM-${Date.now()}`,
      code: unitForm.code.toUpperCase(),
      name: unitForm.name,
      type: unitForm.unitType as "INSTITUTION",
      status: "ACTIVE",
      children: [],
    };

    setNodes((prev) => {
      const clone = JSON.parse(JSON.stringify(prev)) as OrgNode[];
      const hn = clone[0]?.children?.find((c) => c.code === "SO-KHCN-HN");
      if (hn) {
        hn.children = hn.children || [];
        hn.children.push(newUnit);
      }
      return clone;
    });

    setIsAddUnitModalOpen(false);
    showToast(`Đã thêm thành công cơ sở liên kết: ${unitForm.name}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Navigation Hub */}
      <AdminNav />

      {/* Toast */}
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
            Cây Thư Mục 34 Tỉnh Thành Trọng Điểm & Cơ Sở Liên Kết
          </h1>
          <p className="text-body text-slate-600 dark:text-slate-300 mt-1">
            Mạng lưới hành chính phân cấp 3 tầng (3D Scoped RBAC) tập trung vào 34 tỉnh/thành trọng điểm Đổi mới sáng tạo toàn quốc.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <AppButton
            variant="outline"
            onClick={() => setIsAddUnitModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Cơ sở Liên kết</span>
          </AppButton>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-caption font-medium text-slate-500 dark:text-slate-400">Cơ quan Trung ương</p>
          <p className="text-section-title font-black text-brand-600 mt-1">01</p>
          <p className="text-caption text-slate-500 mt-1">Bộ KH&CN / NacenTech</p>
        </div>
        <div className="p-4 rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-caption font-medium text-slate-500 dark:text-slate-400">Sở KH&CN Tỉnh/Thành</p>
          <p className="text-section-title font-black text-slate-900 dark:text-white mt-1">63</p>
          <p className="text-caption text-emerald-600 font-semibold mt-1">100% địa phương liên thông</p>
        </div>
        <div className="p-4 rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-caption font-medium text-slate-500 dark:text-slate-400">Viện / Trường Đại học</p>
          <p className="text-section-title font-black text-amber-600 mt-1">182</p>
          <p className="text-caption text-slate-500 mt-1">Cơ sở NCKH & Đào tạo</p>
        </div>
        <div className="p-4 rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-caption font-medium text-slate-500 dark:text-slate-400">Tài khoản Quản trị Sở đã cấp</p>
          <p className="text-section-title font-black text-emerald-600 mt-1">58 / 63</p>
          <p className="text-caption text-slate-500 mt-1">5 địa phương đang chờ bàn giao</p>
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

        {/* Tree Content */}
        <div className="p-4 space-y-4">
          {nodes.map((root) => (
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
                    </div>
                    <p className="text-caption text-slate-500 mt-0.5">
                      Mã: <code className="font-mono">{root.code}</code> | Quản trị: {root.leaderEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Đang hoạt động</span>
                  </span>
                </div>
              </div>

              {/* Level 2 & 3: Children */}
              <div className="pl-4 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-4 mt-3">
                {root.children?.map((prov) => {
                  const hasLeader = Boolean(prov.leaderEmail);
                  return (
                    <div
                      key={prov.id}
                      className="p-3.5 rounded-control border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-300 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Building2 className="w-5 h-5 text-slate-500 mt-0.5" />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-label font-bold text-slate-900 dark:text-white">
                                {prov.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-caption font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                Scope: {prov.provinceId}
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
                          {!hasLeader ? (
                            <AppButton
                              variant="primary"
                              onClick={() => handleOpenProvision(prov)}
                              className="flex items-center gap-1.5"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Cấp Tài Khoản Sở</span>
                            </AppButton>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <Check className="w-3 h-3" />
                              <span>Đã bàn giao</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Level 3: Institutions */}
                      {prov.children && prov.children.length > 0 && (
                        <div className="mt-3 pl-4 sm:pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-2">
                          <p className="text-caption font-semibold text-slate-400 uppercase tracking-wider">
                            Cơ sở trực thuộc / Viện / Trường liên kết ({prov.children.length})
                          </p>
                          {prov.children.map((inst) => (
                            <div
                              key={inst.id}
                              className="p-2.5 rounded-control bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2"
                            >
                              <div>
                                <span className="text-label font-semibold text-slate-800 dark:text-slate-200">
                                  {inst.name}
                                </span>
                                <p className="text-caption text-slate-500">
                                  Mã: <code className="font-mono">{inst.code}</code> • Phụ trách: {inst.leaderName}
                                </p>
                              </div>
                              <span className="px-2 py-0.5 rounded text-caption font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                Cấp 3: Cơ sở
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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

            <p className="text-label text-slate-600 dark:text-slate-300">
              Đơn vị: <strong>{selectedNode.name}</strong> (Scope: {selectedNode.provinceId})
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
                >
                  Hủy
                </AppButton>
                <AppButton type="submit" variant="primary">
                  Xác Nhận Cấp Quyền
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm cơ sở liên kết */}
      {isAddUnitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-brand-600">
                <Plus className="w-5 h-5" />
                <h3 className="text-card-title font-bold text-slate-900 dark:text-white">
                  Thêm Cơ Sở Liên Kết (Viện/Trường)
                </h3>
              </div>
              <button
                onClick={() => setIsAddUnitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAddUnit} className="space-y-4">
              <div>
                <label className="text-label font-semibold text-slate-700 dark:text-slate-300">Mã cơ sở (Code)</label>
                <input
                  type="text"
                  required
                  placeholder="VIEN-NCKH-01"
                  value={unitForm.code}
                  onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-control text-label border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-label font-semibold text-slate-700 dark:text-slate-300">Tên cơ sở liên kết</label>
                <input
                  type="text"
                  required
                  placeholder="Viện Công Nghệ Môi Trường và Năng Lượng Mới"
                  value={unitForm.name}
                  onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-control text-label border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-label font-semibold text-slate-700 dark:text-slate-300">Trực thuộc Sở Tỉnh</label>
                <select
                  value={unitForm.parentId}
                  onChange={(e) => setUnitForm({ ...unitForm, parentId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-control text-label border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="ORG-HN">Sở Khoa học và Công nghệ TP. Hà Nội</option>
                  <option value="ORG-HCM">Sở Khoa học và Công nghệ TP. Hồ Chí Minh</option>
                  <option value="ORG-HP">Sở Khoa học và Công nghệ TP. Hải Phòng</option>
                  <option value="ORG-DN">Sở Khoa học và Công nghệ TP. Đà Nẵng</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <AppButton
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddUnitModalOpen(false)}
                >
                  Hủy
                </AppButton>
                <AppButton type="submit" variant="primary">
                  Thêm Cơ Sở
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
