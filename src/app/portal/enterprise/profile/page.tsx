"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchMyEnterpriseProfile,
  updateMyEnterpriseProfile,
  submitEnterpriseVerification,
  UpsertEnterpriseRequest,
} from "../../../../lib/enterprise-client";

const TABS = [
  { id: "legal", label: "1. Pháp lý & Định danh" },
  { id: "sector", label: "2. Lĩnh vực (TT17) & Sở hữu" },
  { id: "hr", label: "3. Lao động & Trình độ" },
  { id: "finance", label: "4. Doanh thu & Tài chính" },
  { id: "tech", label: "5. Cơ sở & Công nghệ" },
  { id: "rd", label: "6. Hoạt động R&D" },
  { id: "ip", label: "7. Sở hữu trí tuệ" },
  { id: "market", label: "8. Xuất khẩu & Chuỗi giá trị" },
  { id: "bottlenecks", label: "9. Điểm nghẽn thực tế" },
  { id: "needs", label: "10. Nhu cầu hỗ trợ" },
];

export default function EnterpriseOwnerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("legal");
  const [profile, setProfile] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState<UpsertEnterpriseRequest>({
    name: "",
    subjectType: "DN ĐMST",
    establishedDate: "",
    provinceCity: "",
    addressDetail: "",
    website: "",
    description: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    isContactPublic: true,
    mainSectorName: "",
    sectorCode: "",
    ownershipType: "Tư nhân",
    workforceScale: "10-50 người",
    revenueRange: "10 - 50 tỷ VNĐ",
    operatingZone: "",
    highQualificationRatio: "40%",
    hasRdUnit: false,
    hasRdBudget: false,
    rdBudgetAmount: 0,
    rdPersonnelCount: 0,
    isExporting: false,
    inValueChain: false,
    topBottlenecks: [],
    supportNeeds: [],
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchMyEnterpriseProfile();
      setProfile(res);
      setFormData({
        name: res.name || "",
        subjectType: res.subjectType || "DN ĐMST",
        establishedDate: res.establishedDate ? res.establishedDate.substring(0, 10) : "",
        provinceCity: res.provinceCity || "",
        addressDetail: res.addressDetail || "",
        website: res.website || "",
        description: res.description || "",
        contactPerson: res.contactPerson || "",
        contactPhone: res.contactPhone || "",
        contactEmail: res.contactEmail || "",
        isContactPublic: res.isContactPublic ?? true,
        mainSectorName: res.mainSectorName || "",
        sectorCode: res.sectorCode || "",
        ownershipType: res.ownershipType || "Tư nhân",
        workforceScale: res.workforceScale || "10-50 người",
        revenueRange: res.revenueRange || "10 - 50 tỷ VNĐ",
        operatingZone: res.operatingZone || "",
        highQualificationRatio: res.highQualificationRatio || "40%",
        hasRdUnit: !!res.hasRdUnit,
        hasRdBudget: !!res.hasRdBudget,
        rdBudgetAmount: res.rdBudgetAmount || 0,
        rdPersonnelCount: res.rdPersonnelCount || 0,
        isExporting: !!res.isExporting,
        inValueChain: !!res.inValueChain,
        topBottlenecks: res.topBottlenecks || [],
        supportNeeds: res.supportNeeds || [],
      });
    } catch (err: any) {
      setError(err.message || "Không thể tải thông tin hồ sơ doanh nghiệp.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setSuccessMsg(null);
      setError(null);
      await updateMyEnterpriseProfile(formData);
      setSuccessMsg("Lưu nháp hồ sơ thành công!");
      await loadProfile();
    } catch (err: any) {
      setError(err.message || "Lỗi lưu hồ sơ.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!confirm("Bạn có chắc chắn muốn nộp hồ sơ này đến Sở KH&CN để thẩm định không?")) {
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);
      // Save latest edits first
      await updateMyEnterpriseProfile(formData);
      const res = await submitEnterpriseVerification();
      setSuccessMsg(res.message || "Đã nộp hồ sơ thẩm định thành công!");
      await loadProfile();
    } catch (err: any) {
      setError(err.message || "Không thể gửi hồ sơ thẩm định.");
    } finally {
      setSubmitting(false);
    }
  };

  // Tính tỷ lệ hoàn thiện hồ sơ
  const calculateCompleteness = () => {
    const fields = [
      formData.name,
      formData.provinceCity,
      formData.mainSectorName,
      formData.contactPerson,
      formData.contactEmail,
      formData.workforceScale,
      formData.operatingZone,
      formData.description,
      formData.website,
      (formData.topBottlenecks?.length || 0) > 0,
      (formData.supportNeeds?.length || 0) > 0,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completeness = calculateCompleteness();

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-5xl mx-auto animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-200 rounded"></div>
          <div className="h-28 bg-white rounded-2xl border border-slate-200 p-6"></div>
          <div className="h-96 bg-white rounded-2xl border border-slate-200"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Kê Khai Hồ Sơ Chủ Thể & Năng Lực Đổi Mới Sáng Tạo
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Hệ thống 10 nhóm trường (225 tiêu chí) theo chuẩn Thông tư 17/2019/TT-BKHCN và Đề án 844
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving || submitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm transition disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "💾 Lưu nháp"}
            </button>
            <button
              onClick={handleSubmitVerification}
              disabled={saving || submitting || profile?.status === "Verified"}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition disabled:opacity-50"
            >
              {submitting ? "Đang gửi..." : "🚀 Nộp hồ sơ thẩm định"}
            </button>
          </div>
        </div>

        {/* Status & Completeness Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-800">
                {profile?.name || "Doanh nghiệp của bạn"}
              </span>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                MST: {profile?.taxCode || "---"}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  profile?.status === "Verified"
                    ? "bg-emerald-100 text-emerald-800"
                    : profile?.status === "PendingVerification"
                    ? "bg-amber-100 text-amber-800"
                    : profile?.status === "Rejected"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                Trạng thái: {profile?.status || "Draft"}
              </span>
            </div>
            {profile?.verificationNotes && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                Ý kiến cơ quan thẩm định: {profile.verificationNotes}
              </p>
            )}
          </div>

          {/* Completeness Bar */}
          <div className="w-full md:w-64 space-y-1">
            <div className="flex justify-between text-xs text-slate-600 font-semibold">
              <span>Độ hoàn thiện hồ sơ:</span>
              <span className="text-brand-600">{completeness}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-300"
                style={{ width: `${completeness}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Notification alerts */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="font-bold">✕</button>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center justify-between">
            <span>✓ {successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-bold">✕</button>
          </div>
        )}

        {/* 10-Tab Content Frame */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          {/* Vertical Tabs Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/60 p-2 space-y-1 shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Body */}
          <div className="flex-1 p-6 md:p-8 space-y-6">
            {/* TAB 1: Pháp lý */}
            {activeTab === "legal" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Nhóm 1: Thông tin pháp lý & Định danh doanh nghiệp</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tên đầy đủ của doanh nghiệp *</label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Loại hình chủ thể ĐMST</label>
                    <select
                      value={formData.subjectType || "DN ĐMST"}
                      onChange={(e) => setFormData({ ...formData, subjectType: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 bg-white"
                    >
                      <option value="DN ĐMST">Doanh nghiệp Đổi mới sáng tạo (DN ĐMST)</option>
                      <option value="DN Khoa học công nghệ">Doanh nghiệp KH&CN (DN KH&CN)</option>
                      <option value="Startup ĐMST">Startup ĐMST / Khởi nghiệp sáng tạo</option>
                      <option value="Viện - Trường">Tổ chức R&D / Viện - Trường</option>
                      <option value="Tổ chức hỗ trợ">Tổ chức trung gian / Hỗ trợ ĐMST</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tỉnh / Thành phố *</label>
                    <input
                      type="text"
                      value={formData.provinceCity || ""}
                      onChange={(e) => setFormData({ ...formData, provinceCity: e.target.value })}
                      placeholder="VD: Hà Nội, TP Hồ Chí Minh, Đà Nẵng..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Ngày thành lập / Cấp phép</label>
                    <input
                      type="date"
                      value={formData.establishedDate || ""}
                      onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">Địa chỉ trụ sở chính</label>
                    <input
                      type="text"
                      value={formData.addressDetail || ""}
                      onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Website công ty</label>
                    <input
                      type="text"
                      value={formData.website || ""}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Người đại diện / Đầu mối liên hệ *</label>
                    <input
                      type="text"
                      value={formData.contactPerson || ""}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Số điện thoại liên hệ</label>
                    <input
                      type="text"
                      value={formData.contactPhone || ""}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Email liên hệ *</label>
                    <input
                      type="email"
                      value={formData.contactEmail || ""}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">Mô tả tổng quát hoạt động doanh nghiệp</label>
                    <textarea
                      rows={3}
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Giới thiệu sứ mệnh, tầm nhìn, năng lực cốt lõi..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Lĩnh vực TT17 */}
            {activeTab === "sector" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Nhóm 2: Lĩnh vực theo Thông tư 17/2019/TT-BKHCN & Hình thức sở hữu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Ngành lĩnh vực chính (TT17) *</label>
                    <input
                      type="text"
                      value={formData.mainSectorName || ""}
                      onChange={(e) => setFormData({ ...formData, mainSectorName: e.target.value })}
                      placeholder="VD: Công nghệ thông tin, Tự động hóa, Nông nghiệp CNC..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Mã ngành cấp 4 / TT17</label>
                    <input
                      type="text"
                      value={formData.sectorCode || ""}
                      onChange={(e) => setFormData({ ...formData, sectorCode: e.target.value })}
                      placeholder="VD: 6201, 7210..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Hình thức sở hữu</label>
                    <select
                      value={formData.ownershipType || "Tư nhân"}
                      onChange={(e) => setFormData({ ...formData, ownershipType: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 bg-white"
                    >
                      <option value="Tư nhân">Doanh nghiệp 100% vốn tư nhân trong nước</option>
                      <option value="Nhà nước">Doanh nghiệp Nhà nước nắm giữ cổ phần chi phối</option>
                      <option value="FDI">Doanh nghiệp có vốn đầu tư nước ngoài (FDI)</option>
                      <option value="Hợp tác xã">Hợp tác xã / Liên minh HTX</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Khu vực / Địa bàn kinh doanh</label>
                    <input
                      type="text"
                      value={formData.operatingZone || ""}
                      onChange={(e) => setFormData({ ...formData, operatingZone: e.target.value })}
                      placeholder="VD: Khu CNC Hòa Lạc, KCN Sài Đồng, Khu vực Miền Trung..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Lao động */}
            {activeTab === "hr" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Nhóm 3: Lao động, Quy mô & Chất lượng nguồn nhân lực</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Quy mô tổng lao động</label>
                    <select
                      value={formData.workforceScale || "10-50 người"}
                      onChange={(e) => setFormData({ ...formData, workforceScale: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 bg-white"
                    >
                      <option value="Dưới 10 người">Dưới 10 người (Siêu nhỏ)</option>
                      <option value="10-50 người">Từ 10 đến 50 người (Nhỏ)</option>
                      <option value="50-200 người">Từ 50 đến 200 người (Vừa)</option>
                      <option value="Trên 200 người">Trên 200 người (Lớn)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tỷ lệ nhân sự ĐH và Sau Đại học</label>
                    <input
                      type="text"
                      value={formData.highQualificationRatio || ""}
                      onChange={(e) => setFormData({ ...formData, highQualificationRatio: e.target.value })}
                      placeholder="VD: 45%, 70%..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Số lượng cán bộ R&D chuyên trách</label>
                    <input
                      type="number"
                      value={formData.rdPersonnelCount || 0}
                      onChange={(e) => setFormData({ ...formData, rdPersonnelCount: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Tài chính */}
            {activeTab === "finance" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Nhóm 4: Năng lực tài chính & Tuân thủ Nghị định 13/2023/NĐ-CP</h3>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
                  🔒 Căn cứ nguyên tắc bảo vệ bí mật kinh doanh và dữ liệu cá nhân, doanh thu được lưu trữ dưới dạng khoảng ước tính và không công khai số tuyệt đối ra ngoài.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Doanh thu bình quân hàng năm</label>
                    <select
                      value={formData.revenueRange || "10 - 50 tỷ VNĐ"}
                      onChange={(e) => setFormData({ ...formData, revenueRange: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 bg-white"
                    >
                      <option value="Dưới 3 tỷ VNĐ">Dưới 3 tỷ VNĐ</option>
                      <option value="3 - 10 tỷ VNĐ">Từ 3 tỷ đến 10 tỷ VNĐ</option>
                      <option value="10 - 50 tỷ VNĐ">Từ 10 tỷ đến 50 tỷ VNĐ</option>
                      <option value="50 - 200 tỷ VNĐ">Từ 50 tỷ đến 200 tỷ VNĐ</option>
                      <option value="Trên 200 tỷ VNĐ">Trên 200 tỷ VNĐ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Có ngân sách dành riêng cho R&D không?</label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.hasRdBudget || false}
                          onChange={(e) => setFormData({ ...formData, hasRdBudget: e.target.checked })}
                          className="rounded text-brand-600"
                        />
                        <span>Có quỹ / ngân sách R&D</span>
                      </label>
                    </div>
                  </div>
                  {formData.hasRdBudget && (
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Ngân sách R&D năm gần nhất (Triệu VNĐ)</label>
                      <input
                        type="number"
                        value={formData.rdBudgetAmount || 0}
                        onChange={(e) => setFormData({ ...formData, rdBudgetAmount: Number(e.target.value) })}
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: Cơ sở & Công nghệ */}
            {activeTab === "tech" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Nhóm 5: Cơ sở vật chất, Máy móc & Trình độ công nghệ</h3>
                <p className="text-xs text-slate-500">
                  Ghi nhận năng lực trang thiết bị phòng thí nghiệm, dây chuyền sản xuất tự động hóa, chuyển đổi số.
                </p>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Trang thiết bị / Dây chuyền công nghệ tiêu biểu</label>
                    <textarea
                      rows={3}
                      placeholder="Mô tả các máy móc, dây chuyền hoặc giải pháp công nghệ trọng yếu..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: Hoạt động R&D */}
            {activeTab === "rd" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Nhóm 6: Hoạt động Nghiên cứu & Phát triển (R&D)</h3>
                <div className="space-y-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasRdUnit || false}
                      onChange={(e) => setFormData({ ...formData, hasRdUnit: e.target.checked })}
                      className="rounded text-brand-600"
                    />
                    <span className="font-semibold text-slate-800">Doanh nghiệp đã thành lập Bộ phận / Phòng R&D chuyên trách</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 7: Sở hữu trí tuệ */}
            {activeTab === "ip" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Nhóm 7: Tài sản Sở hữu trí tuệ</h3>
                <p className="text-xs text-slate-500">
                  Đã đồng bộ từ Cục Sở hữu trí tuệ hoặc bổ sung tự khai: Sáng chế, Giải pháp hữu ích, Kiểu dáng công nghiệp, Nhãn hiệu.
                </p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  Tổng số tài sản SHTT đã ghi nhận: <strong>{profile?.intellectualProperties?.length || 0}</strong> tài sản.
                </div>
              </div>
            )}

            {/* TAB 8: Xuất khẩu & Chuỗi giá trị */}
            {activeTab === "market" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Nhóm 8: Thị trường xuất khẩu & Tham gia chuỗi giá trị</h3>
                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isExporting || false}
                      onChange={(e) => setFormData({ ...formData, isExporting: e.target.checked })}
                      className="rounded text-brand-600"
                    />
                    <span className="font-semibold text-slate-800">Doanh nghiệp có sản phẩm / dịch vụ xuất khẩu ra thị trường quốc tế</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inValueChain || false}
                      onChange={(e) => setFormData({ ...formData, inValueChain: e.target.checked })}
                      className="rounded text-brand-600"
                    />
                    <span className="font-semibold text-slate-800">Doanh nghiệp là nhà cung ứng / tham gia chuỗi giá trị của tập đoàn / DN lớn</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 9: Điểm nghẽn */}
            {activeTab === "bottlenecks" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Nhóm 9: Điểm nghẽn lớn nhất trong hoạt động đổi mới sáng tạo</h3>
                <div className="space-y-2 text-xs">
                  {[
                    "Thiếu vốn và khó tiếp cận nguồn vốn ưu đãi ĐMST",
                    "Thiếu nhân sự chất lượng cao và chuyên gia R&D",
                    "Khó khăn trong thủ tục đăng ký quyền Sở hữu trí tuệ",
                    "Khó tiếp cận công nghệ mới và thị trường tiêu thụ",
                    "Chính sách thử nghiệm (Sandbox) chưa rõ ràng",
                  ].map((bn) => {
                    const isChecked = formData.topBottlenecks?.includes(bn);
                    return (
                      <label key={bn} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const cur = formData.topBottlenecks || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, topBottlenecks: [...cur, bn] });
                            } else {
                              setFormData({ ...formData, topBottlenecks: cur.filter((x) => x !== bn) });
                            }
                          }}
                          className="rounded text-brand-600"
                        />
                        <span className="text-slate-800">{bn}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 10: Nhu cầu hỗ trợ */}
            {activeTab === "needs" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Nhóm 10: Nhu cầu hỗ trợ từ cơ quan Nhà nước & Hệ sinh thái</h3>
                <div className="space-y-2 text-xs">
                  {[
                    "Hỗ trợ kết nối Chuyên gia tư vấn ĐMST và Viện - Trường",
                    "Hỗ trợ kinh phí thực hiện đề tài / dự án thử nghiệm",
                    "Đào tạo nâng cao năng lực quản trị ĐMST cho đội ngũ",
                    "Hỗ trợ đăng ký và thương mại hóa tài sản trí tuệ",
                    "Xúc tiến thương mại và tham gia chuỗi cung ứng toàn cầu",
                  ].map((need) => {
                    const isChecked = formData.supportNeeds?.includes(need);
                    return (
                      <label key={need} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const cur = formData.supportNeeds || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, supportNeeds: [...cur, need] });
                            } else {
                              setFormData({ ...formData, supportNeeds: cur.filter((x) => x !== need) });
                            }
                          }}
                          className="rounded text-brand-600"
                        />
                        <span className="text-slate-800">{need}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
