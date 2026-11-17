"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Edit2,
  AlertTriangle,
  MapPin
} from "lucide-react";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { AppButton } from "@/components/ui/design-system";
import { API_BASE } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import {
  getBacNinhLocations,
  invalidateLocationsCache,
  invalidateSectorsCache,
  type LocationOption
} from "@/lib/master-data-client";
import { portalClient, TechmartEvent } from "@/lib/portal-client";

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

interface TaxonomyTreeNode {
  id: string;
  code: string;
  name: string;
  level: number;
  category: string;
  childCount: number;
  children: TaxonomyTreeNode[];
}

export default function AdminSectorsPage() {
  const [activeTab, setActiveTab] = useState<"sectors" | "locations" | "tt17" | "matrix" | "tree" | "exhibitions">("sectors");
  const [matrixView, setMatrixView] = useState<"table" | "grid">("table");
  const [sectors, setSectors] = useState<SectorItem[]>([]);
  const [sectorsLoading, setSectorsLoading] = useState(true);
  const [sectorsError, setSectorsError] = useState("");
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState("");
  const [locationTypeFilter, setLocationTypeFilter] = useState<"ALL" | "AREA" | "KCN">("ALL");
  const [tt17Error, setTt17Error] = useState("");
  const [matrixError, setMatrixError] = useState("");
  const [treeError, setTreeError] = useState("");
  const [tt17Loading, setTt17Loading] = useState(true);
  const [matrixLoading, setMatrixLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(true);
  const [loadVersion, setLoadVersion] = useState(0);
  const [tt17Subsectors, setTt17Subsectors] = useState<Array<{code:string;name:string; electricityNorm?:string; profitMargin?:number | null; valueAddedRatio?:number | null; investmentRateBillionVnd?:number | null}>>([]);
  const [matrixPairs, setMatrixPairs] = useState<MatrixPair[]>([]);
  const [taxonomyTree, setTaxonomyTree] = useState<TaxonomyTreeNode[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Matrix pair editing modal
  const [editingPair, setEditingPair] = useState<MatrixPair | null>(null);
  const [pairRatingStars, setPairRatingStars] = useState(5);
  const [pairWeight, setPairWeight] = useState(1.0);
  const [isPairSaving, setIsPairSaving] = useState(false);
  const [pairSaveError, setPairSaveError] = useState("");

  // Sector form
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formTt17, setFormTt17] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 4000);
  };
  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editingSector, setEditingSector] = useState<SectorItem | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [confirmSector, setConfirmSector] = useState<SectorItem | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const readRows = async (path: string, authenticated = false) => {
      const response = await fetch(`${API_BASE}${path}`, { headers: authenticated ? authClient.getAuthHeaders() : undefined, cache: "no-store" });
      if (!response.ok) throw new Error("Không tải được danh mục.");
      const payload = await response.json();
      if (payload.success !== true || !Array.isArray(payload.data)) throw new Error("Dữ liệu danh mục không hợp lệ.");
      return payload.data;
    };
    setSectorsLoading(true); setLocationsLoading(true); setTt17Loading(true); setMatrixLoading(true); setTreeLoading(true);
    setSectorsError(""); setLocationsError(""); setTt17Error(""); setMatrixError(""); setTreeError("");
    readRows("/api/v1/master-data/sectors?activeOnly=false", true)
      .then((rows) => {
        if (cancelled) return;
        setSectors(rows.map((item: SectorItem) => ({ ...item, tt17Code: item.tt17Code || "", description: item.description || "", filterRuleCount: item.filterRuleCount ?? 0, isActive: item.isActive !== false })));
      })
      .catch(() => { if (!cancelled) setSectorsError("Không tải được danh mục ngành công nghiệp."); })
      .finally(() => { if (!cancelled) setSectorsLoading(false); });
    getBacNinhLocations({ forceRefresh: loadVersion > 0 })
      .then((rows) => { if (!cancelled) setLocations(rows); })
      .catch(() => { if (!cancelled) setLocationsError("Không tải được danh mục Địa bàn & KCN Bắc Ninh."); })
      .finally(() => { if (!cancelled) setLocationsLoading(false); });
    readRows("/api/v1/master-data/tt17")
      .then((rows) => { if (!cancelled) setTt17Subsectors(rows); })
      .catch(() => { if (!cancelled) setTt17Error("Không tải được danh mục phân ngành."); })
      .finally(() => { if (!cancelled) setTt17Loading(false); });
    readRows("/api/v1/master-data/matrix")
      .then((rows) => { if (!cancelled) setMatrixPairs(rows); })
      .catch(() => { if (!cancelled) setMatrixError("Không tải được ma trận ngành-công nghệ."); })
      .finally(() => { if (!cancelled) setMatrixLoading(false); });
    readRows("/api/v1/master-data/taxonomy-tree")
      .then((rows) => { if (!cancelled) setTaxonomyTree(rows); })
      .catch(() => { if (!cancelled) setTreeError("Không tải được cây phân cấp taxonomy."); })
      .finally(() => { if (!cancelled) setTreeLoading(false); });
    return () => { cancelled = true; };
  }, [loadVersion]);

  const [exhibitions, setExhibitions] = useState<TechmartEvent[]>([]);
  const [exhibitionsLoading, setExhibitionsLoading] = useState(false);
  const [exhibitionsLoaded, setExhibitionsLoaded] = useState(false);

  useEffect(() => {
    if (activeTab === "exhibitions" && !exhibitionsLoaded) {
      setExhibitionsLoading(true);
      portalClient.listEvents(undefined, 1, 50)
        .then((res) => {
          setExhibitions(res.data);
          setExhibitionsLoaded(true);
        })
        .catch(() => {
          setExhibitions([]);
          setExhibitionsLoaded(true);
        })
        .finally(() => setExhibitionsLoading(false));
    }
  }, [activeTab, exhibitionsLoaded]);

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
    if (!/^IND_[A-Z0-9_]+$/.test(normalizedCode)) {
      setSaveError("Mã ngành phải theo định dạng chuẩn 'IND_*' (VD: IND_ELEC, IND_SEMI)!");
      return;
    }

    if (!editingSector && sectors.some((s) => s.code?.toUpperCase() === normalizedCode)) {
      setSaveError(`Mã ngành '${normalizedCode}' đã tồn tại trong danh mục! Không thể tạo trùng lặp.`);
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
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        throw new Error(result.error || result.message || "Không lưu được lĩnh vực. Vui lòng thử lại.");
      }
      const created = editingSector ? { ...editingSector, ...result.data } : result.data;
      if (!created || typeof created.code !== "string" || typeof created.name !== "string") {
        throw new Error("Máy chủ chưa xác nhận lưu lĩnh vực. Vui lòng tải lại danh mục trước khi thử lại.");
      }
      setSectors((current) => [{ id: created.id, code: created.code, name: created.name, tt17Code: created.tt17Code ?? "", description: created.description ?? "", filterRuleCount: created.filterRuleCount ?? 0, isActive: created.isActive !== false }, ...current.filter((sector) => sector.code !== created.code)]);
      invalidateSectorsCache();
      setIsModalOpen(false);
      showToast(`Đã lưu lĩnh vực [${created.code}] ${created.name}`);
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

  const handleSavePairSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPair || isPairSaving) return;

    if (pairRatingStars < 1 || pairRatingStars > 5) {
      setPairSaveError("Mức độ tương thích phải nằm trong khoảng từ 1 đến 5 sao.");
      return;
    }

    if (isNaN(pairWeight) || pairWeight < 0.1 || pairWeight > 1.0) {
      setPairSaveError("Trọng số thuật toán (Weight) phải nằm trong khoảng từ 0.1 đến 1.0.");
      return;
    }

    setIsPairSaving(true);
    setPairSaveError("");
    try {
      const response = await fetch(`${API_BASE}/api/v1/master-data/matrix`, {
        method: "PUT",
        headers: { ...authClient.getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldCode: editingPair.fieldCode,
          techCode: editingPair.techCode,
          ratingStars: pairRatingStars,
          weight: pairWeight
        })
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        throw new Error(result.error || result.message || "Không cập nhật được trọng số ma trận.");
      }

      setMatrixPairs((current) => {
        const existingIdx = current.findIndex(
          (p) => p.fieldCode === editingPair.fieldCode && p.techCode === editingPair.techCode
        );
        if (existingIdx >= 0) {
          const next = [...current];
          next[existingIdx] = { ...next[existingIdx], ratingStars: pairRatingStars, weight: pairWeight };
          return next;
        } else {
          return [...current, { ...editingPair, ratingStars: pairRatingStars, weight: pairWeight }];
        }
      });
      showToast(`Đã cập nhật trọng số [${editingPair.fieldCode} - ${editingPair.techCode}] thành ${pairRatingStars} sao (${pairWeight.toFixed(1)})`);
      setEditingPair(null);
    } catch (err: any) {
      setPairSaveError(err instanceof Error ? err.message : "Không kết nối được máy chủ.");
    } finally {
      setIsPairSaving(false);
    }
  };

  const deactivateSector = async (sector: SectorItem) => {
    if (!sector.id || deactivatingId) return;
    setDeactivatingId(sector.id); setSectorsError("");
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/sectors/${sector.id}`, { method: "DELETE", headers: authClient.getAuthHeaders() });
      const payload = await response.json();
      if (!response.ok || payload.success !== true) throw new Error("Không ngừng hoạt động được lĩnh vực.");
      invalidateSectorsCache();
      showToast(`Đã ngừng hoạt động lĩnh vực [${sector.code}] ${sector.name}`);
      setLoadVersion((value) => value + 1);
    } catch {
      setSectorsError("Không ngừng hoạt động được lĩnh vực. Vui lòng thử lại.");
    } finally { setDeactivatingId(null); }
  };

  return (
    <div className="w-full">
      <div className="w-full space-y-5">
        {/* Breadcrumbs */}
        <AdminBreadcrumbs
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Quản Trị Hệ Thống", href: "/admin" },
            { label: "Ngành Công Nghiệp & Địa Bàn Bắc Ninh" },
          ]}
        />

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">Quản Trị Ngành Công Nghiệp BACLINK &amp; KCN Bắc Ninh</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý 8 ngành công nghiệp chuẩn IND_*, Địa bàn/KCN Bắc Ninh và ma trận công nghệ.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AppButton
              variant="outline"
              onClick={() => {
                invalidateSectorsCache();
                invalidateLocationsCache();
                setLoadVersion((value) => value + 1);
              }}
            >
              Tải lại
            </AppButton>
            <AppButton
              variant="primary"
              onClick={() => { setEditingSector(null); setFormCode(""); setFormName(""); setFormTt17(""); setFormDesc(""); setSaveError(""); setIsModalOpen(true); }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Ngành Công Nghiệp</span>
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
            <div className="text-xs font-semibold text-gray-500 uppercase">Ngành Công Nghiệp</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{sectorsLoading ? "Đang tải…" : `${activeSectorCount} Ngành`}</div>
            <div className="text-xs text-gray-400 mt-0.5">Chuẩn BACLINK (IND_*)</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase">Địa Bàn &amp; KCN Bắc Ninh</div>
            <div className="text-2xl font-bold text-brand-700 mt-1">{locationsLoading ? "Đang tải…" : `${locations.length} Địa Bàn/KCN`}</div>
            <div className="text-xs text-gray-400 mt-0.5">8+1 Địa bàn &amp; KCN</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase">Phân Ngành TT17</div>
            <div className="text-2xl font-bold text-cyan-700 mt-1">{tt17Subsectors.length} Phân Ngành</div>
            <div className="text-xs text-gray-400 mt-0.5">Tham chiếu kỹ thuật</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 uppercase">Cặp Quan Hệ Ngành-CN</div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{matrixPairs.length} Cặp</div>
            <div className="text-xs text-gray-400 mt-0.5">Trọng số 1-5 sao</div>
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
            <span>🏭 {activeSectorCount} Ngành hoạt động</span>
          </button>
          <button
            onClick={() => setActiveTab("locations")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "locations"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>📍 Địa Bàn &amp; KCN Bắc Ninh</span>
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
            <span>🔗 Ma Trận Ngành-CN</span>
          </button>
          <button
            onClick={() => setActiveTab("tree")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "tree"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>🌳 Cây Taxonomy 3 Tầng</span>
          </button>
          <button
            onClick={() => setActiveTab("exhibitions")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === "exhibitions"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>🎪 Sự Kiện Kết Nối</span>
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
                  placeholder="Tìm theo tên ngành, mã IND_..."
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
                    <th className="py-3 px-4">Mã Ngành</th>
                    <th className="py-3 px-4">Tên Ngành Công Nghiệp</th>
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
                        {s.isActive && (
                          <button
                            type="button"
                            disabled={!s.id || !!deactivatingId}
                            onClick={() => {
                              setConfirmSector(s);
                              setIsConfirmModalOpen(true);
                            }}
                            className="focus-ring ml-3 min-h-11 text-label text-status-danger hover:underline disabled:opacity-50"
                          >
                            {deactivatingId === s.id ? "Đang lưu..." : "Ngừng hoạt động"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!sectorsError && !sectorsLoading && filteredSectors.length === 0 && <tr><td colSpan={6} className="p-4 text-gray-500">Không có ngành công nghiệp phù hợp.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: BAC NINH LOCATIONS & KCNS */}
        {activeTab === "locations" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-between items-start sm:items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Danh Mục 8+1 Địa Bàn &amp; Khu Công Nghiệp Trọng Điểm Bắc Ninh</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Dữ liệu runtime từ /api/v1/master-data/locations phục vụ bộ lọc doanh nghiệp, chuyên gia và radar kết nối.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {(["ALL", "AREA", "KCN"] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setLocationTypeFilter(filterKey)}
                    className={`px-3 py-1.5 rounded-lg font-semibold border transition ${
                      locationTypeFilter === filterKey
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {filterKey === "ALL" ? "Tất cả" : filterKey === "AREA" ? "8+1 Địa bàn" : "KCN trọng điểm"}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                    <th className="py-3 px-4">Mã Địa Bàn / KCN</th>
                    <th className="py-3 px-4">Tên Địa Bàn / KCN</th>
                    <th className="py-3 px-4">Phân Loại</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {locationsError ? (
                    <tr><td colSpan={4} className="p-4 text-status-danger" role="alert">{locationsError}</td></tr>
                  ) : locationsLoading ? (
                    <tr><td colSpan={4} className="p-4">Đang tải danh mục Địa bàn &amp; KCN Bắc Ninh…</td></tr>
                  ) : (() => {
                    const visibleLocations = locations.filter((loc) => {
                      if (locationTypeFilter === "ALL") return true;
                      const resolvedType = String(loc.locationType || loc.type || loc.metadata?.type || (loc.code.startsWith("KCN_") ? "KCN" : "AREA")).toUpperCase();
                      return resolvedType === locationTypeFilter;
                    });
                    if (visibleLocations.length === 0) {
                      return <tr><td colSpan={4} className="p-4 text-gray-500">Chưa có dữ liệu Địa bàn &amp; KCN Bắc Ninh.</td></tr>;
                    }
                    return visibleLocations.map((loc) => {
                      const resolvedType = String(loc.locationType || loc.type || loc.metadata?.type || (loc.code.startsWith("KCN_") ? "KCN" : "AREA")).toUpperCase();
                      return (
                        <tr key={loc.code} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono font-bold text-gray-800">
                              {loc.code}
                            </code>
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900">{loc.name}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${resolvedType === "KCN" ? "bg-cyan-100 text-cyan-800" : "bg-amber-100 text-amber-800"}`}>
                              {resolvedType === "KCN" ? "KCN trọng điểm" : "Địa bàn hành chính"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              Đang hoạt động
                            </span>
                          </td>
                        </tr>
                      );
                    });
                  })()}
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

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center h-10 bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setMatrixView("table")}
                    className={`h-8 px-3 rounded-md font-semibold transition flex items-center ${
                      matrixView === "table" ? "bg-white text-emerald-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    📋 Danh Sách
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatrixView("grid")}
                    className={`h-8 px-3 rounded-md font-semibold transition flex items-center ${
                      matrixView === "grid" ? "bg-white text-emerald-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    🗺️ Lưới 2D Heatmap
                  </button>
                </div>

                {matrixView === "table" && (
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className="form-control-sm text-sm font-medium bg-white rounded-lg"
                  >
                    <option value="">Tất cả Lĩnh Vực</option>
                    {sectors.filter((sector) => sector.isActive).map((sector) => (
                      <option key={sector.code} value={sector.code}>{sector.code} - {sector.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {matrixView === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                      <th className="py-3 px-4">Mã Ngành</th>
                      <th className="py-3 px-4">Ngành Công Nghiệp</th>
                      <th className="py-3 px-4">Mã CN</th>
                      <th className="py-3 px-4">Nhóm Công Nghệ</th>
                      <th className="py-3 px-4 text-center">Mức Phù Hợp</th>
                      <th className="py-3 px-4 text-right">Trọng Số</th>
                      <th className="py-3 px-4 text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {matrixError ? (
                      <tr><td colSpan={7} className="p-4 text-status-danger" role="alert">{matrixError}</td></tr>
                    ) : matrixLoading ? (
                      <tr><td colSpan={7} className="p-4">Đang tải ma trận…</td></tr>
                    ) : filteredMatrix.map((m, idx) => (
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
                            {Array.from({ length: Math.max(0, Math.min(5, Math.floor(m.ratingStars || 0))) }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-gray-800">
                          {typeof m.weight === "number" && !isNaN(m.weight) ? m.weight.toFixed(1) : "0.0"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPair(m);
                              setPairRatingStars(m.ratingStars);
                              setPairWeight(m.weight);
                              setPairSaveError("");
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition"
                          >
                            Sửa Trọng Số
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!matrixError && !matrixLoading && filteredMatrix.length === 0 && (
                      <tr><td colSpan={7} className="p-4 text-gray-500">Không có quan hệ ngành-công nghệ phù hợp.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  💡 Nhấp chuột vào bất kỳ ô giao điểm nào để điều chỉnh trọng số (1–5 sao) hoặc kích hoạt cặp quan hệ mới.
                </p>
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  {(() => {
                    const distinctTechs: { code: string; name: string }[] = [];
                    const seen = new Set<string>();
                    for (const p of matrixPairs) {
                      if (!seen.has(p.techCode)) {
                        seen.add(p.techCode);
                        distinctTechs.push({ code: p.techCode, name: p.techName });
                      }
                    }
                    distinctTechs.sort((a, b) => a.code.localeCompare(b.code));
                    const activeSectors = sectors.filter(s => s.isActive);

                    return (
                      <table className="w-full text-xs text-center border-collapse">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 font-semibold">
                            <th className="py-2.5 px-3 text-left sticky left-0 bg-gray-100 z-10 min-w-[180px]">
                              Lĩnh Vực \ Nhóm CN
                            </th>
                            {distinctTechs.slice(0, 15).map((t) => (
                              <th key={t.code} className="py-2.5 px-2 font-mono whitespace-nowrap min-w-[90px]" title={t.name}>
                                {t.code}
                                <div className="text-xs text-gray-400 font-normal truncate max-w-[80px]">{t.name}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {activeSectors.map((sector) => (
                            <tr key={sector.code} className="hover:bg-gray-50/70">
                              <td className="py-2 px-3 text-left font-semibold text-gray-900 sticky left-0 bg-white hover:bg-gray-50 z-10 border-r border-gray-100">
                                <span className="font-mono text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded text-xs mr-1.5">{sector.code}</span>
                                <span className="truncate">{sector.name}</span>
                              </td>
                              {distinctTechs.slice(0, 15).map((t) => {
                                const pair = matrixPairs.find(p => p.fieldCode === sector.code && p.techCode === t.code);
                                return (
                                  <td
                                    key={t.code}
                                    onClick={() => {
                                      setEditingPair({
                                        fieldCode: sector.code,
                                        fieldName: sector.name,
                                        techCode: t.code,
                                        techName: t.name,
                                        ratingStars: pair?.ratingStars ?? 5,
                                        weight: pair?.weight ?? 1.0
                                      });
                                      setPairRatingStars(pair?.ratingStars ?? 5);
                                      setPairWeight(pair?.weight ?? 1.0);
                                      setPairSaveError("");
                                    }}
                                    className={`py-2 px-1 text-center cursor-pointer transition ${
                                      pair
                                        ? pair.ratingStars >= 5
                                          ? "bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100"
                                          : "bg-amber-50 text-amber-800 font-bold hover:bg-amber-100"
                                        : "text-gray-300 hover:bg-gray-100"
                                    }`}
                                    title={pair ? `[${sector.code} - ${t.code}] ${pair.ratingStars} sao (${pair.weight}) - Click để sửa` : `Chưa ghép cặp [${sector.code} - ${t.code}] - Click để gán`}
                                  >
                                    {pair
                                      ? `${"★".repeat(Math.max(0, Math.min(5, Math.floor(pair.ratingStars || 0))))} ${(typeof pair.weight === "number" && !isNaN(pair.weight) ? pair.weight : 0).toFixed(1)}`
                                      : "—"}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TAXONOMY TREE */}
        {activeTab === "tree" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-between items-start sm:items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Cây Phân Cấp Taxonomy Công Nghệ 3 Tầng</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Mô hình phân cấp 3 tầng liên thông: Tầng 1 (Ngành công nghiệp IND_*) &rarr; Tầng 2 (Nhóm công nghệ CN) &rarr; Tầng 3 (Công nghệ cụ thể NC).
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {taxonomyTree.length} Lĩnh vực gốc
              </span>
            </div>

            {treeError ? (
              <div role="alert" className="p-4 text-status-danger">{treeError}</div>
            ) : treeLoading ? (
              <div className="p-4 text-gray-500 text-sm">Đang tải cây taxonomy…</div>
            ) : taxonomyTree.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">Chưa có dữ liệu cây taxonomy.</div>
            ) : (
              <div className="space-y-4">
                {taxonomyTree.map((rootNode) => (
                  <div key={rootNode.code} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                          {rootNode.code}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">{rootNode.name}</h4>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {rootNode.children?.length ?? 0} nhóm công nghệ
                      </span>
                    </div>

                    {rootNode.children && rootNode.children.length > 0 && (
                      <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200 space-y-3">
                        {rootNode.children.map((techGroup) => (
                          <div key={techGroup.code} className="bg-white p-3 rounded-lg border border-gray-100 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                  {techGroup.code}
                                </span>
                                <span className="text-xs font-semibold text-gray-800">{techGroup.name}</span>
                              </div>
                              <span className="text-xs text-gray-400">
                                {techGroup.children?.length ?? 0} giải pháp
                              </span>
                            </div>

                            {techGroup.children && techGroup.children.length > 0 && (
                              <div className="mt-2 ml-4 space-y-1">
                                {techGroup.children.map((techItem) => (
                                  <div key={techItem.code} className="text-xs text-gray-600 flex items-center justify-between py-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-gray-400">└─</span>
                                      <span className="font-mono text-gray-500">[{techItem.code}]</span>
                                      <span>{techItem.name}</span>
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                                      TRL 7-8
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: EXHIBITIONS */}
        {activeTab === "exhibitions" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6">
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 text-base">Danh Mục Triển Lãm & Phiên Chào Giá Công Nghệ</h3>
              <p className="text-xs text-gray-500 mt-1">Sự kiện xúc tiến thương mại và kết nối cung cầu công nghệ theo thời gian thực từ CSDL Sàn</p>
            </div>
            {exhibitionsLoading ? (
              <div className="py-12 text-center text-sm text-gray-500">Đang tải danh sách sự kiện triển lãm...</div>
            ) : exhibitions.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Chưa có sự kiện triển lãm nào được cấu hình trong hệ thống.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exhibitions.map((e, idx) => (
                  <div key={e.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:border-emerald-300 transition-all shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        EXPO #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <span className="text-xs text-gray-400">
                        {e.startDate ? new Date(e.startDate).toLocaleDateString("vi-VN") : "Sắp diễn ra"}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mt-2">{e.title}</h4>
                    <div className="mt-3 text-xs text-gray-600 space-y-1">
                      <div>Mô tả: <strong className="text-gray-800">{e.description || "Chưa cập nhật"}</strong></div>
                      <div>Địa điểm: <strong className="text-gray-800">{e.location || "Chưa cập nhật"}</strong></div>
                      <div>Số công nghệ: <strong className="text-gray-800">{e.technologiesCount ?? 0} giải pháp</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Thêm Ngành */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-gray-900 text-lg">
                    {editingSector ? "Cập Nhật Ngành Công Nghiệp" : "Thêm Ngành Công Nghiệp Mới"}
                  </h3>
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
                    Mã Ngành Công Nghiệp (Chuẩn &apos;IND_*&apos;):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: IND_SEMI, IND_ROBOT..."
                    disabled={!!editingSector}
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="form-control w-full text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Tên Ngành Công Nghiệp:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Công nghiệp Bán dẫn & Vi mạch"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="form-control w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="form-control w-full text-sm"
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
                    {isSaving ? "Đang lưu…" : "Lưu Ngành"}
                  </AppButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Chỉnh Sửa Trọng Số Cặp LV-CN */}
        {editingPair && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="font-bold text-gray-900 text-base">Điều Chỉnh Trọng Số Ma Trận</h3>
                <button
                  type="button"
                  onClick={() => setEditingPair(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  ✕
                </button>
              </div>

              <form noValidate onSubmit={handleSavePairSubmit} className="space-y-4 text-xs">
                {pairSaveError && (
                  <p role="alert" className="text-status-danger">{pairSaveError}</p>
                )}

                <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                  <div>Lĩnh vực: <strong className="text-gray-900 font-mono">[{editingPair.fieldCode}]</strong> {editingPair.fieldName || sectors.find(s => s.code === editingPair.fieldCode)?.name}</div>
                  <div>Công nghệ: <strong className="text-gray-900 font-mono">[{editingPair.techCode}]</strong> {editingPair.techName}</div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">
                    Mức Độ Tương Thích (1 - 5 Sao):
                  </label>
                  <select
                    value={pairRatingStars}
                    onChange={(e) => {
                      const stars = Number(e.target.value);
                      setPairRatingStars(stars);
                      setPairWeight(Number((stars / 5).toFixed(1)));
                    }}
                    className="form-control w-full text-sm font-semibold"
                  >
                    <option value={5}>★★★★★ (5 Sao - Rất phù hợp / Trọng tâm)</option>
                    <option value={4}>★★★★☆ (4 Sao - Phù hợp cao)</option>
                    <option value={3}>★★★☆☆ (3 Sao - Phù hợp trung bình)</option>
                    <option value={2}>★★☆☆☆ (2 Sao - Phù hợp thấp)</option>
                    <option value={1}>★☆☆☆☆ (1 Sao - Ít tương thích)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">
                    Trọng Số Thuật Toán Matching (0.1 - 1.0):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1.0"
                    value={pairWeight}
                    onChange={(e) => setPairWeight(Number(e.target.value))}
                    className="form-control w-full text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <AppButton variant="outline" type="button" onClick={() => setEditingPair(null)}>
                    Hủy Bỏ
                  </AppButton>
                  <AppButton variant="primary" type="submit" disabled={isPairSaving}>
                    {isPairSaving ? "Đang lưu…" : "Lưu Trọng Số"}
                  </AppButton>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal Xác Nhận Ngừng Hoạt Động Lĩnh Vực (T079 Safe Confirmation) */}
        {isConfirmModalOpen && confirmSector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-slate-800 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Xác Nhận Ngừng Hoạt Động Lĩnh Vực
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Thao tác này sẽ chuyển trạng thái lĩnh vực sang vô hiệu hóa an toàn.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800 space-y-1.5 border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-slate-400 text-xs">Mã lĩnh vực:</span>
                    <code className="font-mono font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs">
                      {confirmSector.code}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-slate-400 text-xs">Tên lĩnh vực:</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-right">
                      {confirmSector.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-slate-400 text-xs">Phân nhóm TT17:</span>
                    <span className="font-mono text-brand-700 dark:text-brand-400 text-xs">
                      {confirmSector.tt17Code || "Chưa phân nhóm"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-slate-400 text-xs">Quy tắc lọc / Hồ sơ liên kết:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                      {confirmSector.filterRuleCount} quy tắc lọc
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs">
                  <p className="font-semibold">⚠️ Cảnh báo tác động hệ thống:</p>
                  <p className="mt-1">
                    Lĩnh vực này đang có <strong>{confirmSector.filterRuleCount} quy tắc lọc</strong>. Khi ngừng hoạt động, lĩnh vực sẽ không còn khả dụng để gán hồ sơ mới hoặc hiển thị trên cổng công khai.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800 mt-5">
                <AppButton
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    setConfirmSector(null);
                  }}
                  disabled={Boolean(deactivatingId)}
                >
                  Hủy Bỏ
                </AppButton>
                <AppButton
                  variant="primary"
                  type="button"
                  onClick={async () => {
                    if (confirmSector) {
                      await deactivateSector(confirmSector);
                      setIsConfirmModalOpen(false);
                      setConfirmSector(null);
                    }
                  }}
                  disabled={Boolean(deactivatingId)}
                  className="bg-rose-600 hover:bg-rose-700 text-white border-rose-600"
                >
                  {deactivatingId ? "Đang xử lý..." : "Xác Nhận Ngừng Hoạt Động"}
                </AppButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
