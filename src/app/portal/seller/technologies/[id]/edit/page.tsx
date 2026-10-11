"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Award,
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  AlertOctagon,
  PauseCircle,
  PlayCircle,
  Trash2,
  Save,
  Check,
} from "lucide-react";
import {
  fetchOfferById,
  updateSellerOffer,
  deleteSellerOffer,
  togglePublishOffer,
  SECTORS_18_CATALOG,
  PROVINCIAL_AUTHORITIES_CATALOG,
} from "@/services/api/technology-offer";
import {
  TechnologyOffer,
  OfferType,
  IntellectualPropertyStatus,
  TransferMethod,
  CommercializationStatus,
  PricingType,
} from "@/types/technology-offer";

export default function ChinhSuaHoSoChaoBanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [needsReauditAlert, setNeedsReauditAlert] = useState<boolean>(false);

  const [offer, setOffer] = useState<TechnologyOffer | null>(null);

  // Form states
  const [offerType, setOfferType] = useState<OfferType>("SOLUTION");
  const [hasTechTransfer, setHasTechTransfer] = useState(true);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [problemSolved, setProblemSolved] = useState("");
  const [sectorCode, setSectorCode] = useState("FOOD");
  const [pricingType, setPricingType] = useState<PricingType>("RANGE");
  const [priceAmount, setPriceAmount] = useState<number | undefined>(undefined);
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);
  const [unit, setUnit] = useState("dây chuyền");

  // IP Quad & TRL
  const [developerOrigin, setDeveloperOrigin] = useState("");
  const [trlLevel, setTrlLevel] = useState<number>(8);
  const [ipStatus, setIpStatus] = useState<IntellectualPropertyStatus>("PATENT_GRANTED");
  const [ipRegistrationNumber, setIpRegistrationNumber] = useState("");
  const [transferMethod, setTransferMethod] = useState<TransferMethod>("EXCLUSIVE_LICENSE");
  const [commercialStatus, setCommercialStatus] = useState<CommercializationStatus>("COMMERCIALLY_READY");
  const [contactPointRole, setContactPointRole] = useState("");

  // Managing Authority
  const [managingAuthorityId, setManagingAuthorityId] = useState("VN-HN");
  const [managingAuthorityName, setManagingAuthorityName] = useState("Sở Khoa học và Công nghệ TP. Hà Nội");

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        setErrorMsg(null);
        const data = await fetchOfferById(id);
        if (!data) {
          setErrorMsg("Không tìm thấy hồ sơ chào bán công nghệ.");
          return;
        }
        setOffer(data);
        setOfferType(data.offerType);
        setHasTechTransfer(data.hasTechTransfer);
        setTitle(data.title);
        setSummary(data.summary);
        setProblemSolved(data.problemSolved);
        setSectorCode(data.sectorCode);
        setPricingType(data.pricingType);
        setPriceAmount(data.priceAmount || undefined);
        setPriceMin(data.priceMin || undefined);
        setPriceMax(data.priceMax || undefined);
        setUnit(data.unit || "dây chuyền");
        setDeveloperOrigin(data.developerOrigin || "");
        setTrlLevel(data.trlLevel || 8);
        setIpStatus(data.ipStatus || "PATENT_GRANTED");
        setIpRegistrationNumber(data.ipRegistrationNumber || "");
        setTransferMethod(data.transferMethod || "EXCLUSIVE_LICENSE");
        setCommercialStatus(data.commercialStatus || "COMMERCIALLY_READY");
        setContactPointRole(data.contactPointRole || "");
        setManagingAuthorityId(data.managingAuthorityId || "VN-HN");
        setManagingAuthorityName(data.managingAuthorityName || "Sở Khoa học và Công nghệ TP. Hà Nội");
      } catch (err: any) {
        setErrorMsg(err.message || "Lỗi khi tải dữ liệu hồ sơ.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleAuthorityChange = (authId: string) => {
    setManagingAuthorityId(authId);
    const found = PROVINCIAL_AUTHORITIES_CATALOG.find((a) => a.id === authId);
    if (found) setManagingAuthorityName(found.name);
  };

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Vui lòng nhập tên công nghệ/giải pháp.");
      return;
    }
    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      setNeedsReauditAlert(false);

      const payload = {
        offerType,
        hasTechTransfer,
        title,
        summary,
        problemSolved,
        sectorCode,
        pricingType,
        priceAmount: pricingType === "FIXED" ? priceAmount : undefined,
        priceMin: pricingType === "RANGE" ? priceMin : undefined,
        priceMax: pricingType === "RANGE" ? priceMax : undefined,
        currency: "VND",
        unit,
        developerOrigin: hasTechTransfer ? developerOrigin : undefined,
        trlLevel: hasTechTransfer ? trlLevel : undefined,
        ipStatus: hasTechTransfer ? ipStatus : undefined,
        ipRegistrationNumber: hasTechTransfer ? ipRegistrationNumber : undefined,
        transferMethod: hasTechTransfer ? transferMethod : undefined,
        commercialStatus: hasTechTransfer ? commercialStatus : undefined,
        contactPointRole: hasTechTransfer ? contactPointRole : undefined,
        managingAuthorityId,
        managingAuthorityName,
      };

      const res = await updateSellerOffer(id, payload);
      if (res.success && res.data) {
        setOffer(res.data);
        setSuccessMsg(res.message || "Cập nhật hồ sơ thành công.");
        if (res.needsReaudit) {
          setNeedsReauditAlert(true);
        }
      } else {
        setErrorMsg(res.message || "Không thể cập nhật hồ sơ.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi hệ thống khi cập nhật hồ sơ.");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!offer) return;
    try {
      setToggling(true);
      setErrorMsg(null);
      const isCurrentlyApproved = offer.status === "APPROVED";
      const res = await togglePublishOffer(id, !isCurrentlyApproved);
      if (res.success && res.data) {
        setOffer(res.data);
        setSuccessMsg(res.message || null);
      } else {
        setErrorMsg(res.message || "Không thể thay đổi trạng thái niêm yết.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi chuyển đổi trạng thái.");
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("CẢNH BÁO: Bạn có chắc chắn muốn XÓA vĩnh viễn hồ sơ công nghệ này khỏi kho lưu trữ?")) {
      return;
    }
    try {
      setDeleting(true);
      const res = await deleteSellerOffer(id);
      if (res.success) {
        alert(res.message || "Đã xóa hồ sơ thành công.");
        router.push("/portal/seller/technologies");
      } else {
        setErrorMsg(res.message || "Không thể xóa hồ sơ.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi xóa hồ sơ.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-700">Đang tải hồ sơ công nghệ...</p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-base font-extrabold text-slate-900">Không tìm thấy hồ sơ</h2>
          <p className="text-xs text-slate-600">{errorMsg || "Hồ sơ công nghệ không tồn tại hoặc đã bị xóa."}</p>
          <Link
            href="/portal/seller/technologies"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Kho công nghệ
          </Link>
        </div>
      </div>
    );
  }

  const isApproved = offer.status === "APPROVED";
  const isPending = offer.status === "PENDING";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* TOP HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/portal/seller/technologies"
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
              title="Quay lại Kho công nghệ"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 text-base">
                  CHỈNH SỬA CÔNG NGHỆ CHÀO BÁN
                </span>
                {isApproved && (
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-caption font-bold px-2 py-0.5 border border-emerald-200">
                    TRẠNG THÁI: ĐANG NIÊM YẾT
                  </span>
                )}
                {isPending && (
                  <span className="rounded-full bg-amber-100 text-amber-800 text-caption font-bold px-2 py-0.5 border border-amber-200">
                    TRẠNG THÁI: CHỜ THẨM ĐỊNH
                  </span>
                )}
                {!isApproved && !isPending && (
                  <span className="rounded-full bg-slate-100 text-slate-700 text-caption font-bold px-2 py-0.5 border border-slate-200">
                    TRẠNG THÁI: {offer.status}
                  </span>
                )}
              </div>
              <p className="text-caption text-slate-500 font-semibold uppercase tracking-wider">
                Mã Hồ Sơ: {offer.offerCode} · {offer.managingAuthorityName || "Sở KH&CN TP. Hà Nội"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={toggling}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
                isApproved
                  ? "border-slate-200 text-amber-700 hover:bg-amber-50"
                  : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              {isApproved ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
              <span>{toggling ? "Đang xử lý..." : isApproved ? "Tạm Ẩn Khỏi Sàn" : "Mở Niêm Yết Lại"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleUpdate()}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 transition flex items-center gap-1.5 shadow-sm disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Đang lưu..." : "Lưu & Cập Nhật"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* FEEDBACK NOTICES */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 w-full space-y-3">
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-900 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-center gap-2 text-xs text-red-900 font-bold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* WARNING NOTICE ACCORDING TO CR-2026-006 & BR-SELLER-07 */}
        <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-amber-900 shadow-sm">
          <AlertOctagon className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-black text-amber-900 text-sm">
              Quy Tắc Quản Trị Vòng Đời & Phân Cấp Thẩm Định (CR-2026-006 / BR-SELLER-07):
            </h4>
            <p className="leading-relaxed">
              Nếu bạn thay đổi <b>Cấp độ TRL</b>, <b>Số Bằng Sáng Chế / Tình trạng SHTT</b>, hoặc{" "}
              <b>Hình thức chuyển giao</b>, hệ thống sẽ tự động chuyển hồ sơ về trạng thái{" "}
              <span className="bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono font-black">
                PENDING
              </span>{" "}
              để Sở KH&CN phụ trách địa bàn thẩm định lại tính pháp lý trước khi cập nhật lên sàn công khai. Các chỉnh
              sửa về mô tả, tóm tắt giải pháp, mức giá ưu đãi sẽ có hiệu lực ngay lập tức.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN EDITING FORM */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        <form onSubmit={handleUpdate} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
          {/* SECTION 1: THÔNG TIN CƠ BẢN */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-black">
                  1
                </span>
                <span>Thông Tin Nhận Diện Công Nghệ & Phân Loại 18 Ngành</span>
              </h3>
              <span className="text-xs text-slate-400">
                Các trường có dấu <span className="text-red-500">*</span> là bắt buộc
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Tên Đầy Đủ Của Công Nghệ / Thiết Bị / Giải Pháp: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control w-full font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Loại Hình Chào Bán: <span className="text-red-500">*</span>
                </label>
                <select
                  value={offerType}
                  onChange={(e) => setOfferType(e.target.value as OfferType)}
                  className="form-control w-full font-semibold text-slate-700 bg-white"
                >
                  <option value="PRODUCT">Sản phẩm / Hàng hóa công nghệ cao (PRODUCT)</option>
                  <option value="DEVICE">Thiết bị, máy móc công nghiệp (DEVICE)</option>
                  <option value="SOLUTION">Giải pháp / Quy trình công nghệ (SOLUTION)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nhóm Ngành Công Nghiệp (18 Ngành TT17): <span className="text-red-500">*</span>
                </label>
                <select
                  value={sectorCode}
                  onChange={(e) => setSectorCode(e.target.value)}
                  className="form-control w-full font-semibold text-slate-700 bg-white"
                >
                  {SECTORS_18_CATALOG.filter((s) => s.code !== "ALL").map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sở KH&CN Tiếp Nhận Thẩm Định Địa Bàn: <span className="text-red-500">*</span>
                </label>
                <select
                  value={managingAuthorityId}
                  onChange={(e) => handleAuthorityChange(e.target.value)}
                  className="form-control w-full font-semibold text-brand-700 bg-brand-50/50"
                >
                  {PROVINCIAL_AUTHORITIES_CATALOG.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Có Chuyển Giao Quyền SHTT Không?
                </label>
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="radio"
                      name="tech_transfer"
                      checked={hasTechTransfer}
                      onChange={() => setHasTechTransfer(true)}
                      className="text-brand-600"
                    />
                    <span>Có chuyển giao công nghệ (Áp dụng Bộ Tứ SHTT)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="radio"
                      name="tech_transfer"
                      checked={!hasTechTransfer}
                      onChange={() => setHasTechTransfer(false)}
                      className="text-brand-600"
                    />
                    <span>Chỉ bán sản phẩm / thiết bị hoàn chỉnh</span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Tóm Tắt Giải Pháp & Điểm Đột Phá Kỹ Thuật (Executive Summary): <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-700 focus:ring-2 focus:ring-brand-600 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Công Dụng / Bài Toán Doanh Nghiệp Giải Quyết (Problem Solved): <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={problemSolved}
                  onChange={(e) => setProblemSolved(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-700 focus:ring-2 focus:ring-brand-600 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: BỘ TỨ SHTT & TRL */}
          {hasTechTransfer && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  <span>Bộ Tứ Sở Hữu Trí Tuệ & Cấp Độ Sẵn Sàng (IP Quad & TRL)</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cấp Độ Sẵn Sàng Công Nghệ (TRL 1-9): <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={trlLevel}
                    onChange={(e) => setTrlLevel(Number(e.target.value))}
                    className="form-control w-full font-bold text-emerald-800 bg-emerald-50/50"
                  >
                    <option value={1}>TRL 1: Nguyên lý cơ bản được quan sát và báo cáo</option>
                    <option value={2}>TRL 2: Khái niệm công nghệ hoặc ứng dụng được hình thành</option>
                    <option value={3}>TRL 3: Kiểm chứng thực nghiệm các đặc tính then chốt</option>
                    <option value={4}>TRL 4: Xác thực linh kiện cơ bản trong phòng lab</option>
                    <option value={5}>TRL 5: Thử nghiệm trong môi trường tương đồng</option>
                    <option value={6}>TRL 6: Thử nghiệm mô hình quy mô Pilot</option>
                    <option value={7}>TRL 7: Mô hình trình diễn hoạt động trong môi trường thực tế</option>
                    <option value={8}>TRL 8: Hệ thống đã hoàn thiện và được kiểm chứng</option>
                    <option value={9}>TRL 9: Đã thương mại hóa hàng loạt trên thị trường</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tình Trạng Văn Bằng SHTT: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={ipStatus}
                    onChange={(e) => setIpStatus(e.target.value as IntellectualPropertyStatus)}
                    className="form-control w-full font-bold text-brand-800 bg-brand-50/50"
                  >
                    <option value="PATENT_GRANTED">Đã được cấp Bằng Độc Quyền Sáng Chế (PATENT_GRANTED)</option>
                    <option value="UTILITY_MODEL">Đã được cấp Bằng Giải Pháp Hữu Ích (UTILITY_MODEL)</option>
                    <option value="TRADE_SECRET">Bí Quyết Công Nghệ (TRADE_SECRET)</option>
                    <option value="PATENT_PENDING">Đang Thẩm Định Nội Dung (Có số đơn hợp lệ - PATENT_PENDING)</option>
                    <option value="SOFTWARE_COPYRIGHT">Bản Quyền Tác Giả Phần Mềm (SOFTWARE_COPYRIGHT)</option>
                    <option value="NONE">Chưa đăng ký văn bằng SHTT (NONE)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số Văn Bằng SHTT / Số Đơn Cục SHTT:
                  </label>
                  <input
                    type="text"
                    value={ipRegistrationNumber}
                    onChange={(e) => setIpRegistrationNumber(e.target.value)}
                    placeholder="VD: VN 1-0031892"
                    className="form-control w-full font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Đơn Vị Nghiên Cứu / Sở Hữu Công Nghệ: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={developerOrigin}
                    onChange={(e) => setDeveloperOrigin(e.target.value)}
                    placeholder="VD: Viện Cơ học & Tin học Ứng dụng"
                    className="form-control w-full font-bold text-slate-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Bộ Phận / Đầu Mối Chuyển Giao:
                  </label>
                  <input
                    type="text"
                    value={contactPointRole}
                    onChange={(e) => setContactPointRole(e.target.value)}
                    placeholder="VD: Phòng Sở hữu Trí tuệ & Chuyển giao Công nghệ"
                    className="form-control w-full text-slate-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: ĐIỀU KIỆN THƯƠNG MẠI & CHUYỂN GIAO */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">
                  3
                </span>
                <span>Điều Kiện Thương Mại, Mức Giá & Phương Thức Chuyển Giao</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phương Thức Chuyển Giao Ưu Tiên:</label>
                <select
                  value={transferMethod}
                  onChange={(e) => setTransferMethod(e.target.value as TransferMethod)}
                  className="form-control w-full font-semibold text-slate-700 bg-white"
                >
                  <option value="EXCLUSIVE_LICENSE">Cấp Li-xăng Độc Quyền (EXCLUSIVE_LICENSE)</option>
                  <option value="NON_EXCLUSIVE_LICENSE">Cấp Li-xăng Không Độc Quyền (NON_EXCLUSIVE)</option>
                  <option value="ASSIGNMENT_SALE">Chuyển Nhượng Quyền Sở Hữu (ASSIGNMENT_SALE)</option>
                  <option value="JOINT_RD">Hợp Tác R&D Cùng Phát Triển (JOINT_RD)</option>
                  <option value="CAPITAL_CONTRIBUTION">Góp Vốn Bằng Công Nghệ (CAPITAL_CONTRIBUTION)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô Hình Giá:</label>
                <select
                  value={pricingType}
                  onChange={(e) => setPricingType(e.target.value as PricingType)}
                  className="form-control w-full font-semibold text-slate-700 bg-white"
                >
                  <option value="FIXED">Giá Cố Định (FIXED)</option>
                  <option value="RANGE">Khoảng Giá Ước Tính (RANGE)</option>
                  <option value="CONTACT">Thỏa Thuận Trực Tiếp (CONTACT)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đơn Vị Tính / Quy Cách:</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="dây chuyền, hệ thống, hợp đồng..."
                  className="form-control w-full font-medium"
                />
              </div>

              {pricingType === "FIXED" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức Giá Cố Định (VNĐ):</label>
                  <input
                    type="number"
                    value={priceAmount || ""}
                    onChange={(e) => setPriceAmount(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="VD: 1500000000"
                    className="form-control w-full font-mono font-bold text-emerald-700"
                  />
                </div>
              )}

              {pricingType === "RANGE" && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Khoảng Giá Từ (VNĐ):</label>
                    <input
                      type="number"
                      value={priceMin || ""}
                      onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="VD: 800000000"
                      className="form-control w-full font-mono font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Khoảng Giá Đến (VNĐ):</label>
                    <input
                      type="number"
                      value={priceMax || ""}
                      onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="VD: 1500000000"
                      className="form-control w-full font-mono font-bold text-emerald-700"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Trạng Thái Thương Mại Hóa:</label>
                <select
                  value={commercialStatus}
                  onChange={(e) => setCommercialStatus(e.target.value as CommercializationStatus)}
                  className="form-control w-full font-semibold text-slate-700 bg-white"
                >
                  <option value="COMMERCIALLY_READY">Sẵn sàng thương mại hóa (COMMERCIALLY_READY)</option>
                  <option value="PILOT_TESTING">Đang thử nghiệm Pilot (PILOT_TESTING)</option>
                  <option value="LAB_PROTOTYPE">Mô hình phòng thí nghiệm (LAB_PROTOTYPE)</option>
                  <option value="SEEKING_MANUFACTURER">Đang tìm đối tác gia công (SEEKING_MANUFACTURER)</option>
                </select>
              </div>
            </div>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 text-xs flex items-center gap-1.5 transition disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4" />
              <span>{deleting ? "Đang xóa..." : "Xóa Hồ Sơ Này"}</span>
            </button>

            <div className="flex items-center gap-2">
              <Link
                href="/portal/seller/technologies"
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-xs transition"
              >
                Hủy & Bỏ Qua
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-60"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? "Đang cập nhật..." : "Cập Nhật Thông Tin Lên Sàn"}</span>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
