"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Star,
  Building2,
  Calendar,
  ExternalLink,
  Edit2
} from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { AppButton } from "@/components/ui/design-system";
import { API_BASE } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

interface SectorItem {
  id?: string;
  code: string;
  name: string;
  tt17Code: string;
  description: string;
  filterRuleCount: number;
  isActive: boolean;
}

interface MatrixPair { fieldCode: string; fieldName: string; techCode: string; techName: string; ratingStars: number; weight: number; }

const EXHIBITIONS = [
  { id: 1, name: "Triển lãm Viễn thông, CNTT & Truyền thông (Vietnam Telecomp)", focus: "Viễn thông, CNTT, Phần mềm", location: "Hà Nội & TP.HCM", frequency: "Thường niên 2026" },
  { id: 2, name: "Triển lãm Công nghiệp In ấn & Bao bì tại Hà Nội (HanoiPrintPack)", focus: "In ấn, Đóng gói bao bì", location: "Hà Nội", frequency: "2026" },
  { id: 3, name: "Triển lãm Quốc tế Ngành nhựa và Cao su (HanoiPlas)", focus: "Vật liệu polymer, khuôn đúc", location: "Hà Nội", frequency: "2026" },
  { id: 4, name: "Triển lãm Quốc tế Logistics Việt Nam (VILOG)", focus: "Chuỗi cung ứng, kho bãi thông minh", location: "TP.HCM", frequency: "2026" },
  { id: 5, name: "Triển lãm Quốc tế Thủy sản Việt Nam (Vietfish)", focus: "Thủy sản, Công nghệ chế biến lạnh", location: "TP.HCM", frequency: "2026" },
  { id: 6, name: "Triển lãm Công nghệ Chế biến Thực phẩm (Foodtech)", focus: "Thực phẩm đóng hộp, đồ uống", location: "Hà Nội", frequency: "2026" },
  { id: 7, name: "Triển lãm Quốc tế Công nghiệp Hóa chất lần thứ 22 (Vinachem)", focus: "Hóa chất công nghiệp, phân bón", location: "TP.HCM", frequency: "2026" },
  { id: 8, name: "Triển lãm Quốc tế Thực phẩm và Đồ uống 2026 (Vietfood & Beverage)", focus: "Thực phẩm, Đồ uống đóng chai", location: "Hà Nội", frequency: "2026" },
  { id: 9, name: "Triển lãm Máy móc, Thiết bị, Nguyên phụ liệu Dệt may (VTG)", focus: "Dệt may, Máy may công nghiệp", location: "TP.HCM", frequency: "2026" },
  { id: 10, name: "Triển lãm Nội thất & Xây dựng Việt Nam (Vietbuild)", focus: "Vật liệu xây dựng, Kiến trúc", location: "Hà Nội & TP.HCM", frequency: "2026" },
  { id: 11, name: "Triển lãm Quốc tế PCCC & Cứu nạn (Fire Safety & Rescue)", focus: "Phòng cháy chữa cháy, Cứu hộ", location: "Hà Nội", frequency: "2026" },
  { id: 12, name: "Triển lãm Công nghệ Dệt may Quốc tế (Textile Expo)", focus: "Dệt may, Phụ liệu kỹ thuật", location: "Hà Nội", frequency: "2026" },
  { id: 13, name: "Triển lãm Nông nghiệp Công nghệ cao (Growtech Vietnam)", focus: "Cơ giới hóa nông nghiệp, Smart Farm", location: "Hà Nội", frequency: "2026" },
  { id: 14, name: "Triển lãm Thang máy & Tòa nhà Thông minh (Vietnam Elevator Expo)", focus: "Thang máy, Tự động hóa", location: "TP.HCM", frequency: "2026" },
  { id: 15, name: "Triển lãm Quốc tế Năng lượng Tái tạo & Tiết kiệm Điện (Entech Vietnam)", focus: "Năng lượng mặt trời, Pin lưu trữ", location: "Hà Nội", frequency: "2026" }
];

export default function AdminSectorsPage() {
  const [activeTab, setActiveTab] = useState<"sectors" | "tt17" | "matrix" | "exhibitions">("sectors");
  const [sectors, setSectors] = useState<SectorItem[]>([]);
  const [sectorsLoading, setSectorsLoading] = useState(true);
  const [sectorsError, setSectorsError] = useState("");
  const [tt17Error, setTt17Error] = useState("");
  const [matrixError, setMatrixError] = useState("");
  const [tt17Loading, setTt17Loading] = useState(true);
  const [matrixLoading, setMatrixLoading] = useState(true);
  const [loadVersion, setLoadVersion] = useState(0);
  const [tt17Subsectors, setTt17Subsectors] = useState<Array<{code:string;name:string; electricityNorm?:string; profitMargin?:number | null; valueAddedRatio?:number | null; investmentRateBillionVnd?:number | null}>>([]);
  const [matrixPairs, setMatrixPairs] = useState<MatrixPair[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sector form
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formTt17, setFormTt17] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editingSector, setEditingSector] = useState<SectorItem | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const readRows = async (path: string, authenticated = false) => {
      const response = await fetch(`${API_BASE}${path}`, { headers: authenticated ? authClient.getAuthHeaders() : undefined, cache: "no-store" });
      if (!response.ok) throw new Error("Không tải được danh mục.");
      const payload = await response.json();
      if (payload.success !== true || !Array.isArray(payload.data)) throw new Error("Dữ liệu danh mục không hợp lệ.");
      return payload.data;
    };
    setSectorsLoading(true); setTt17Loading(true); setMatrixLoading(true);
    setSectorsError(""); setTt17Error(""); setMatrixError("");
    readRows("/api/v1/master-data/sectors?activeOnly=false", true)
      .then((rows) => {
        if (cancelled) return;
        setSectors(rows.map((item: SectorItem) => ({ ...item, tt17Code: item.tt17Code || "", description: item.description || "", filterRuleCount: item.filterRuleCount ?? 0, isActive: item.isActive !== false })));
      })
      .catch(() => { if (!cancelled) setSectorsError("Không tải được danh mục lĩnh vực."); })
      .finally(() => { if (!cancelled) setSectorsLoading(false); });
    readRows("/api/v1/master-data/tt17")
      .then((rows) => { if (!cancelled) setTt17Subsectors(rows); })
      .catch(() => { if (!cancelled) setTt17Error("Không tải được danh mục phân ngành."); })
      .finally(() => { if (!cancelled) setTt17Loading(false); });
    readRows("/api/v1/master-data/matrix")
      .then((rows) => { if (!cancelled) setMatrixPairs(rows); })
      .catch(() => { if (!cancelled) setMatrixError("Không tải được ma trận ngành-công nghệ."); })
      .finally(() => { if (!cancelled) setMatrixLoading(false); });
    return () => { cancelled = true; };
  }, [loadVersion]);

  const filteredSectors = sectors.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tt17Code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const activeSectorCount = sectors.filter((sector) => sector.isActive).length;

  const filteredMatrix = selectedField
    ? matrixPairs.filter((m) => m.fieldCode === selectedField)
    : matrixPairs;

  const handleAddSectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedCode = formCode.trim().toUpperCase();
    if (!normalizedCode.startsWith("LV")) {
      alert("Mã lĩnh vực phải bắt đầu bằng tiền tố 'LV' (VD: LV19, LV20...)!");
      return;
    }

    if (isSaving) return;
    setIsSaving(true);
    setSaveError("");
    try {
      const response = await fetch(editingSector ? `${API_BASE}/api/v1/admin/sectors/${editingSector.id}` : `${API_BASE}/api/v1/master-data/sectors`, {
        method: editingSector ? "PATCH" : "POST",
        headers: { ...authClient.getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(editingSector ? { name: formName.trim() } : { code: normalizedCode, name: formName.trim(), tt17Code: formTt17, description: formDesc.trim(), isActive: true }),
      });
      if (!response.ok) throw new Error("Không lưu được lĩnh vực. Vui lòng thử lại.");
      const result = await response.json();
      const created = editingSector ? { ...editingSector, ...result.data } : result.data;
      if (result.success !== true || !created || typeof created.code !== "string" || typeof created.name !== "string") {
        throw new Error("Máy chủ chưa xác nhận lưu lĩnh vực. Vui lòng tải lại danh mục trước khi thử lại.");
      }
      setSectors((current) => [{ id: created.id, code: created.code, name: created.name, tt17Code: created.tt17Code ?? "", description: created.description ?? "", filterRuleCount: created.filterRuleCount ?? 0, isActive: created.isActive !== false }, ...current.filter((sector) => sector.code !== created.code)]);
      setIsModalOpen(false);
      setToastMessage(`Đã lưu lĩnh vực [${created.code}] ${created.name}`);
      setTimeout(() => setToastMessage(null), 4000);
      setFormCode("");
      setFormName("");
      setFormDesc("");
      setFormTt17("");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const deactivateSector = async (sector: SectorItem) => {
    if (!sector.id || deactivatingId) return;
    setDeactivatingId(sector.id); setSectorsError("");
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/sectors/${sector.id}`, { method: "DELETE", headers: authClient.getAuthHeaders() });
      const payload = await response.json();
      if (!response.ok || payload.success !== true) throw new Error("Không ngừng hoạt động được lĩnh vực.");
      setLoadVersion((value) => value + 1);
    } catch {
      setSectorsError("Không ngừng hoạt động được lĩnh vực. Vui lòng thử lại.");
    } finally { setDeactivatingId(null); }
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
              <Layers className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">Quản Trị Danh Mục Ngành & Ma Trận TT17</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý danh mục lĩnh vực hiện hành.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AppButton variant="outline" onClick={() => setLoadVersion((value) => value + 1)}>Tải lại</AppButton>
            <AppButton
              variant="primary"
              onClick={() => { setEditingSector(null); setFormCode(""); setFormName(""); setFormTt17(""); setFormDesc(""); setSaveError(""); setIsModalOpen(true); }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Lĩnh Vực Mới</span>
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
            <div className="text-xs font-semibold text-gray-500 uppercase">Lĩnh Vực Trọng Điểm</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{sectorsLoading ? "Đang tải…" : `${activeSectorCount} Lĩnh Vực`}</div>
            <div className="text-xs text-gray-400 mt-0.5">Đang hoạt động</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase">Phân Ngành TT17</div>
            <div className="text-2xl font-bold text-brand-700 mt-1">{tt17Subsectors.length} Phân Ngành</div>
            <div className="text-xs text-gray-400 mt-0.5">Danh mục phân ngành</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase">Cặp Quan Hệ LV-CN</div>
            <div className="text-2xl font-bold text-cyan-700 mt-1">{matrixPairs.length} Cặp</div>
            <div className="text-xs text-gray-400 mt-0.5">Trọng số 1-5 sao</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase">Triển Lãm Quốc Tế</div>
            <div className="text-2xl font-bold text-amber-700 mt-1">15 Triển Lãm</div>
            <div className="text-xs text-gray-400 mt-0.5">Sự kiện tham chiếu</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("sectors")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "sectors"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>🏭 {activeSectorCount} Lĩnh Vực hoạt động</span>
          </button>
          <button
            onClick={() => setActiveTab("tt17")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "tt17"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>📜 Phân Ngành TT17</span>
          </button>
          <button
            onClick={() => setActiveTab("matrix")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "matrix"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>🔗 Ma Trận LV-CN</span>
          </button>
          <button
            onClick={() => setActiveTab("exhibitions")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "exhibitions"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>🎪 Triển Lãm Quốc Tế</span>
          </button>
        </div>

        {/* TAB 1: SECTORS */}
        {activeTab === "sectors" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-between items-start sm:items-center">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên lĩnh vực, mã LV..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="py-3 px-4">Mã LV</th>
                    <th className="py-3 px-4">Tên Lĩnh Vực</th>
                    <th className="py-3 px-4">Phân Nhóm TT17</th>
                    <th className="py-3 px-4">Số Quy Tắc Lọc</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sectorsError ? <tr><td colSpan={6} className="p-4 text-red-700">{sectorsError}</td></tr> : sectorsLoading ? <tr><td colSpan={6} className="p-4">Đang tải danh mục…</td></tr> : filteredSectors.map((s) => (
                    <tr key={s.code} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono font-bold text-gray-800">
                          {s.code}
                        </code>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {s.name}
                        <div className="text-xs text-gray-500 font-normal mt-0.5">{s.description}</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-brand-700">{s.tt17Code}</td>
                      <td className="py-3 px-4 text-xs text-gray-600">{s.filterRuleCount} rules</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                          {s.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setEditingSector(s);
                            setSaveError("");
                            setFormTt17(s.tt17Code);
                            setFormCode(s.code);
                            setFormName(s.name);
                            setFormDesc(s.description);
                            setIsModalOpen(true);
                          }}
                          disabled={!s.id}
                          className="text-label text-brand-700 hover:text-brand-800 font-semibold disabled:opacity-50"
                        >
                          Sửa tên
                        </button>
                        {s.isActive && <button disabled={!s.id || !!deactivatingId} onClick={() => deactivateSector(s)} className="focus-ring ml-3 min-h-11 text-label text-status-danger disabled:opacity-50">{deactivatingId === s.id ? "Đang lưu..." : "Ngừng hoạt động"}</button>}
                      </td>
                    </tr>
                  ))}
                  {!sectorsError && !sectorsLoading && filteredSectors.length === 0 && <tr><td colSpan={6} className="p-4 text-gray-500">Không có lĩnh vực phù hợp.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TT17 */}
        {activeTab === "tt17" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6">
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 text-base">Bảng Chuẩn Hóa Nhóm C Công Nghiệp Chế Biến Chế Tạo</h3>
              <p className="text-xs text-gray-500 mt-1">Trích xuất từ Phụ lục II Thông tư 17/2019/TT-BKHCN phục vụ đánh giá năng lực công nghệ và tính điểm TĐB</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="py-3 px-4">Mã TT17</th>
                    <th className="py-3 px-4">Tên Phân Ngành Chế Biến Chế Tạo</th>
                    <th className="py-3 px-4">Định Mức Tiêu Thụ Điện</th>
                    <th className="py-3 px-4 text-center">Tỷ Suất LN</th>
                    <th className="py-3 px-4 text-center">Hệ Số GTGT</th>
                    <th className="py-3 px-4 text-right">Suất Đầu Tư (Tỷ VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tt17Subsectors.map((t) => (
                    <tr key={t.code} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <code className="text-xs bg-brand-100 text-brand-800 px-2 py-0.5 rounded font-mono font-bold">
                          {t.code}
                        </code>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{t.name}</td>
                      <td className="py-3 px-4 text-xs font-mono text-gray-600">{(t as any).electricityNorm || "—"}</td>
                      <td className="py-3 px-4 text-center text-xs font-semibold text-emerald-700">{typeof t.profitMargin === "number" ? `${t.profitMargin * 100}%` : "—"}</td>
                      <td className="py-3 px-4 text-center text-xs font-semibold text-brand-700">{typeof t.valueAddedRatio === "number" ? t.valueAddedRatio : "—"}</td>
                      <td className="py-3 px-4 text-right font-mono text-sm font-bold text-gray-900">{(t as any).investmentRateBillionVnd ? `${(t as any).investmentRateBillionVnd} tỷ` : "—"}</td>
                    </tr>
                  ))}
                  {tt17Error ? <tr><td colSpan={6} className="p-4 text-status-danger" role="alert">{tt17Error}</td></tr> : tt17Loading ? <tr><td colSpan={6} className="p-4">Đang tải phân ngành…</td></tr> : tt17Subsectors.length === 0 && <tr><td colSpan={6} className="p-4 text-gray-500">Chưa có phân ngành.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MATRIX 109 PAIRS */}
        {activeTab === "matrix" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-between items-start sm:items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Ma Trận Tương Thích Lĩnh Vực - Công Nghệ ({matrixPairs.length} Cặp)</h3>
                <p className="text-xs text-gray-500 mt-1">Dữ liệu gốc làm trọng số cho AI Matching Engine ghép cặp Cung - Cầu</p>
              </div>

              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Tất cả Lĩnh Vực</option>
                {sectors.filter((sector) => sector.isActive).map((sector) => <option key={sector.code} value={sector.code}>{sector.code} - {sector.name}</option>)}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="py-3 px-4">Mã LV</th>
                    <th className="py-3 px-4">Lĩnh Vực Ứng Dụng</th>
                    <th className="py-3 px-4">Mã CN</th>
                    <th className="py-3 px-4">Nhóm Công Nghệ</th>
                    <th className="py-3 px-4 text-center">Mức Phù Hợp</th>
                    <th className="py-3 px-4 text-right">Trọng Số</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {matrixError ? <tr><td colSpan={6} className="p-4 text-status-danger" role="alert">{matrixError}</td></tr> : matrixLoading ? <tr><td colSpan={6} className="p-4">Đang tải ma trận…</td></tr> : filteredMatrix.map((m, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <code className="text-xs bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-mono font-bold">
                          {m.fieldCode}
                        </code>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{sectors.find((sector) => sector.code === m.fieldCode)?.name ?? m.fieldCode}</td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                          {m.techCode}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-gray-800">{m.techName}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-0.5 text-amber-500">
                          {Array.from({ length: m.ratingStars }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-800">{m.weight.toFixed(1)}</td>
                    </tr>
                  ))}
                  {!matrixError && !matrixLoading && filteredMatrix.length === 0 && <tr><td colSpan={6} className="p-4 text-gray-500">Không có quan hệ ngành-công nghệ phù hợp.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: EXHIBITIONS */}
        {activeTab === "exhibitions" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6">
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 text-base">Danh Mục 15 Triển Lãm Quốc Tế Chuyên Ngành</h3>
              <p className="text-xs text-gray-500 mt-1">Sự kiện xúc tiến thương mại và kết nối cung cầu công nghệ tham chiếu</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EXHIBITIONS.map((e) => (
                <div key={e.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:border-emerald-300 transition-all shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      EXPO #{e.id < 10 ? `0${e.id}` : e.id}
                    </span>
                    <span className="text-xs text-gray-400">{e.frequency}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mt-2">{e.name}</h4>
                  <div className="mt-3 text-xs text-gray-600 space-y-1">
                    <div>Lĩnh vực: <strong className="text-gray-800">{e.focus}</strong></div>
                    <div>Địa điểm: <strong className="text-gray-800">{e.location}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Thêm Ngành */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-gray-900 text-lg">Thêm Lĩnh Vực Mới</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSectorSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Mã Lĩnh Vực (Bắt buộc bắt đầu bằng &apos;LV&apos;):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: LV19, LV20..."
                    disabled={!!editingSector}
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Tên Lĩnh Vực:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Năng Lượng Tái Tạo & Pin Lưu Trữ"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Ánh Xạ Phân Nhóm Thông Tư 17 (Nhóm C):
                  </label>
                  <select
                    disabled={!!editingSector}
                    value={formTt17}
                    onChange={(e) => setFormTt17(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Chưa ánh xạ phân ngành</option>
                    {tt17Subsectors.map((item) => <option key={item.code} value={item.code}>{item.code} - {item.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Mô Tả Công Nghệ / Ứng Dụng:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả phạm vi giải pháp và công nghệ..."
                    disabled={!!editingSector}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {saveError && <p role="alert" className="text-body text-status-danger">{saveError}</p>}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <AppButton
                    variant="outline"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Hủy Bỏ
                  </AppButton>
                  <AppButton variant="primary" type="submit" disabled={isSaving}>
                    {isSaving ? "Đang lưu…" : "Lưu Lĩnh Vực"}
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
