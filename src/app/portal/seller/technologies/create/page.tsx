"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Award,
  Building2,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import {
  createSellerOffer,
  SECTORS_18_CATALOG,
  PROVINCIAL_AUTHORITIES_CATALOG,
} from "@/services/api/technology-offer";
import {
  OfferType,
  IntellectualPropertyStatus,
  TransferMethod,
  CommercializationStatus,
  PricingType,
} from "@/types/technology-offer";

export default function TaoHoSoChaoBanPage() {
  const router = useRouter();

  // Form State
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
  const [unit, setUnit] = useState("");

  // Bộ Tứ SHTT
  const [developerOrigin, setDeveloperOrigin] = useState("");
  const [trlLevel, setTrlLevel] = useState<number>(5);
  const [ipStatus, setIpStatus] = useState<IntellectualPropertyStatus>("NONE");
  const [ipRegistrationNumber, setIpRegistrationNumber] = useState("");
  const [transferMethod, setTransferMethod] = useState<TransferMethod>("NON_EXCLUSIVE_LICENSE");
  const [commercialStatus, setCommercialStatus] =
    useState<CommercializationStatus>("PILOT_TESTING");
  const [contactPointRole, setContactPointRole] = useState("");

  // Cơ Quan Quản Lý & Cam Kết Pháp Lý (Commercial Grade Governance - Delta CR-2026-006)
  const [managingAuthorityId, setManagingAuthorityId] = useState("VN-HN");
  const [managingAuthorityName, setManagingAuthorityName] = useState(
    "Sở Khoa học và Công nghệ TP. Hà Nội"
  );
  const [legalConsent, setLegalConsent] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Tên công nghệ không được để trống.";
    if (!summary.trim()) newErrors.summary = "Mô tả tóm tắt không được để trống.";
    if (!problemSolved.trim())
      newErrors.problemSolved = "Công dụng / bài toán giải quyết không được để trống.";

    if (pricingType === "FIXED" && (!priceAmount || priceAmount <= 0)) {
      newErrors.priceAmount = "Giá cố định phải lớn hơn 0.";
    }
    if (pricingType === "RANGE") {
      if (!priceMin || priceMin <= 0) newErrors.priceMin = "Giá tối thiểu phải lớn hơn 0.";
      if (!priceMax || (priceMin && priceMax < priceMin))
        newErrors.priceMax = "Giá tối đa phải lớn hơn hoặc bằng giá tối thiểu.";
    }

    if (hasTechTransfer) {
      if (!developerOrigin.trim())
        newErrors.developerOrigin = "Bắt buộc khai báo đơn vị nghiên cứu phát triển.";
      if (!trlLevel || trlLevel < 1 || trlLevel > 9)
        newErrors.trlLevel = "Mức TRL phải từ 1 đến 9.";
    }

    if (!legalConsent) {
      newErrors.legalConsent =
        "Doanh nghiệp bắt buộc cam kết trách nhiệm pháp lý trước khi nộp hồ sơ thẩm định.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const res = await createSellerOffer({
      offerType,
      hasTechTransfer,
      title,
      summary,
      problemSolved,
      sectorCode,
      pricingType,
      priceAmount: priceAmount || null,
      priceMin: priceMin || null,
      priceMax: priceMax || null,
      currency: "VND",
      unit: unit || null,
      developerOrigin: hasTechTransfer ? developerOrigin : null,
      trlLevel: hasTechTransfer ? trlLevel : null,
      ipStatus: hasTechTransfer ? ipStatus : null,
      ipRegistrationNumber: hasTechTransfer ? ipRegistrationNumber : null,
      transferMethod: hasTechTransfer ? transferMethod : null,
      commercialStatus: hasTechTransfer ? commercialStatus : null,
      contactPointRole: hasTechTransfer ? contactPointRole : null,
      managingAuthorityId,
      managingAuthorityName,
      scopeType: "PROVINCE",
      scopeId: managingAuthorityId,
      legalConsent,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(true);
      setTimeout(() => {
        router.push("/portal/seller/technologies");
      }, 1500);
    } else {
      setErrors({ form: res.message || "Đăng tin thất bại." });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/portal/seller/technologies"
            className="text-xs font-bold text-slate-600 hover:text-emerald-600 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Về kho giải pháp của đơn vị
          </Link>
          <span className="text-xs font-extrabold text-slate-900">
            Biểu Mẫu Chào Bán & Chuyển Giao SHTT (TASK-04)
          </span>
        </div>
      </header>

      {/* FORM CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {successMessage ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
            <h2 className="text-xl font-extrabold text-emerald-950">
              Đăng Hồ Sơ Chào Bán Thành Công!
            </h2>
            <p className="text-xs text-emerald-800">
              Hồ sơ đã được lưu trữ vào kho của bạn và niêm yết trên sàn giao dịch. Đang chuyển
              hướng về Workspace...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Banner */}
            {errors.form && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs font-bold text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                {errors.form}
              </div>
            )}

            {/* SECTION 1: THÔNG TIN CHUNG */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b pb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                1. Thông Tin Cơ Bản & Phân Loại
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Loại hình sản phẩm / giải pháp:
                  </label>
                  <select
                    value={offerType}
                    onChange={(e) => setOfferType(e.target.value as OfferType)}
                    className="form-control w-full font-medium"
                  >
                    <option value="SOLUTION">Giải pháp công nghệ / Quy trình</option>
                    <option value="DEVICE">Máy móc / Thiết bị công nghiệp</option>
                    <option value="PRODUCT">Sản phẩm vật lý / Hàng hóa</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Lĩnh vực công nghệ trọng điểm (10 Lĩnh vực TT17):
                  </label>
                  <select
                    value={sectorCode}
                    onChange={(e) => setSectorCode(e.target.value)}
                    className="form-control w-full font-medium"
                  >
                    {SECTORS_18_CATALOG.filter((s) => s.code !== "ALL").map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-xs">
                <label className="font-bold text-slate-700 block mb-1">
                  Tên công nghệ / sáng chế chào bán: *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Hệ thống sấy thăng hoa chân không tích hợp AI tối ưu năng lượng"
                  className="form-control w-full font-medium"
                />
                {errors.title && <p className="text-rose-600 text-xs mt-1">{errors.title}</p>}
              </div>

              <div className="text-xs">
                <label className="font-bold text-slate-700 block mb-1">Mô tả tóm tắt giải pháp: *</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Tóm tắt tính năng, thông số kỹ thuật cốt lõi..."
                  className="form-control w-full font-medium"
                />
                {errors.summary && (
                  <p className="text-rose-600 text-xs mt-1">{errors.summary}</p>
                )}
              </div>

              <div className="text-xs">
                <label className="font-bold text-slate-700 block mb-1">
                  Bài toán kỹ thuật giải quyết cho bên mua: *
                </label>
                <textarea
                  rows={2}
                  value={problemSolved}
                  onChange={(e) => setProblemSolved(e.target.value)}
                  placeholder="Tiết kiệm bao nhiêu % chi phí, giải quyết vấn đề gì của nhà máy..."
                  className="form-control w-full font-medium"
                />
                {errors.problemSolved && (
                  <p className="text-rose-600 text-xs mt-1">{errors.problemSolved}</p>
                )}
              </div>
            </div>

            {/* SECTION 2: BỘ TỨ SHTT & CHUYỂN GIAO */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  2. Chuyển Giao Công Nghệ & Bộ Tứ SHTT (IP Quad)
                </h3>

                {/* Toggle SHTT */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-700">Có chuyển giao SHTT</span>
                  <input
                    type="checkbox"
                    checked={hasTechTransfer}
                    onChange={(e) => setHasTechTransfer(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                </label>
              </div>

              {hasTechTransfer ? (
                <div className="space-y-4 pt-1">
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 leading-relaxed">
                    Theo quy định Sàn Giao Dịch Quốc Gia: Khi bật cờ chuyển giao công nghệ, bạn bắt
                    buộc phải hoàn thiện 5 thuộc tính của Bộ Tứ SHTT để bảo đảm tính minh bạch trước
                    khi niêm yết.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Đơn vị nghiên cứu / Viện / Trường: *
                      </label>
                      <input
                        type="text"
                        value={developerOrigin}
                        onChange={(e) => setDeveloperOrigin(e.target.value)}
                        placeholder="VD: Viện Hàn lâm KH&CN Việt Nam"
                        className="form-control w-full font-medium"
                      />
                      {errors.developerOrigin && (
                        <p className="text-rose-600 text-xs mt-1">{errors.developerOrigin}</p>
                      )}
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Thang đo mức sẵn sàng công nghệ TRL (1 - 9): *
                      </label>
                      <select
                        value={trlLevel}
                        onChange={(e) => setTrlLevel(Number(e.target.value))}
                        className="form-control w-full font-bold text-emerald-800 dark:text-emerald-400"
                      >
                        <option value={9}>TRL 9 - Hoàn thiện thương mại quy mô công nghiệp</option>
                        <option value={8}>TRL 8 - Hệ thống hoàn chỉnh & đạt kiểm định</option>
                        <option value={7}>TRL 7 - Thử nghiệm hiện trường bán công nghiệp</option>
                        <option value={6}>TRL 6 - Mô hình Pilot kiểm chứng mô phỏng</option>
                        <option value={5}>TRL 5 - Kiểm nghiệm trong môi trường phù hợp</option>
                        <option value={4}>TRL 4 - Đánh giá phòng thí nghiệm</option>
                      </select>
                      {errors.trlLevel && (
                        <p className="text-rose-600 text-xs mt-1">{errors.trlLevel}</p>
                      )}
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tình trạng SHTT: *</label>
                      <select
                        value={ipStatus}
                        onChange={(e) =>
                          setIpStatus(e.target.value as IntellectualPropertyStatus)
                        }
                        className="form-control w-full font-medium"
                      >
                        <option value="PATENT_GRANTED">Bằng Độc Quyền Sáng Chế</option>
                        <option value="UTILITY_MODEL">Bằng Giải Pháp Hữu Ích</option>
                        <option value="TRADE_SECRET">Bí Quyết Công Nghệ (Know-how)</option>
                        <option value="SOFTWARE_COPYRIGHT">Bản Quyền Phần Mềm</option>
                        <option value="PATENT_PENDING">Đang Nộp Đơn Thẩm Định</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Số văn bằng / Số đơn SHTT:
                      </label>
                      <input
                        type="text"
                        value={ipRegistrationNumber}
                        onChange={(e) => setIpRegistrationNumber(e.target.value)}
                        placeholder="VD: VN-1-0028491"
                        className="form-control w-full font-medium font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Hình thức chuyển giao mong muốn: *
                      </label>
                      <select
                        value={transferMethod}
                        onChange={(e) => setTransferMethod(e.target.value as TransferMethod)}
                        className="form-control w-full font-medium"
                      >
                        <option value="EXCLUSIVE_LICENSE">Li-xăng độc quyền</option>
                        <option value="NON_EXCLUSIVE_LICENSE">Li-xăng không độc quyền</option>
                        <option value="ASSIGNMENT_SALE">Chuyển nhượng toàn bộ quyền sở hữu</option>
                        <option value="JOINT_RD">Hợp tác R&D đồng phát triển</option>
                        <option value="CAPITAL_CONTRIBUTION">Góp vốn bằng tài sản SHTT</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Trạng thái thương mại hóa: *
                      </label>
                      <select
                        value={commercialStatus}
                        onChange={(e) =>
                          setCommercialStatus(e.target.value as CommercializationStatus)
                        }
                        className="form-control w-full font-medium"
                      >
                        <option value="COMMERCIALLY_READY">Sẵn sàng thương mại hóa quy mô lớn</option>
                        <option value="PILOT_TESTING">Vận hành thử nghiệm hiện trường</option>
                        <option value="LAB_PROTOTYPE">Nguyên mẫu phòng thí nghiệm</option>
                        <option value="SEEKING_MANUFACTURER">Tìm đối tác hợp tác sản xuất</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Không áp dụng Bộ Tứ SHTT (bán thiết bị/sản phẩm thương mại thông thường).
                </p>
              )}
            </div>

            {/* SECTION 3: CHÍNH SÁCH GIÁ & THƯƠNG MẠI */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b pb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                3. Chính Sách Giá & Chuyển Giao
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phương thức giá:</label>
                  <select
                    value={pricingType}
                    onChange={(e) => setPricingType(e.target.value as PricingType)}
                    className="form-control w-full font-medium"
                  >
                    <option value="RANGE">Khoảng giá từ - đến</option>
                    <option value="FIXED">Giá cố định cụ thể</option>
                    <option value="CONTACT">Thỏa thuận / Liên hệ</option>
                  </select>
                </div>

                {pricingType === "FIXED" && (
                  <div className="md:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Mức giá (VND): *</label>
                    <input
                      type="number"
                      value={priceAmount || ""}
                      onChange={(e) => setPriceAmount(Number(e.target.value))}
                      placeholder="VD: 500000000"
                      className="form-control w-full font-medium"
                    />
                    {errors.priceAmount && (
                      <p className="text-rose-600 text-xs mt-1">{errors.priceAmount}</p>
                    )}
                  </div>
                )}

                {pricingType === "RANGE" && (
                  <>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Giá từ (VND): *</label>
                      <input
                        type="number"
                        value={priceMin || ""}
                        onChange={(e) => setPriceMin(Number(e.target.value))}
                        placeholder="VD: 800000000"
                        className="form-control w-full font-medium"
                      />
                      {errors.priceMin && (
                        <p className="text-rose-600 text-xs mt-1">{errors.priceMin}</p>
                      )}
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Giá đến (VND): *</label>
                      <input
                        type="number"
                        value={priceMax || ""}
                        onChange={(e) => setPriceMax(Number(e.target.value))}
                        placeholder="VD: 1500000000"
                        className="form-control w-full font-medium"
                      />
                      {errors.priceMax && (
                        <p className="text-rose-600 text-xs mt-1">{errors.priceMax}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SECTION 4: CƠ QUAN QUẢN LÝ TIẾP NHẬN THẨM ĐỊNH (COMMERCIAL GRADE GOVERNANCE) */}
            <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-sm space-y-4 bg-gradient-to-br from-white to-slate-50">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    4. Cơ Quan Quản Lý Nhà Nước Tiếp Nhận Thẩm Định
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Hồ sơ sau khi gửi sẽ chuyển về Cổng Tác Nghiệp Cấp 2 (/gov) của Sở KH&CN để thẩm định văn bằng SHTT & mức TRL trước khi niêm yết công khai.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-extrabold rounded-full">
                  Phân Cấp Cấp 2
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Sở KH&CN tiếp nhận thẩm định: *
                  </label>
                  <select
                    value={managingAuthorityId}
                    onChange={(e) => {
                      const selected = PROVINCIAL_AUTHORITIES_CATALOG.find(
                        (a) => a.id === e.target.value
                      );
                      setManagingAuthorityId(e.target.value);
                      if (selected) setManagingAuthorityName(selected.name);
                    }}
                    className="form-control w-full font-medium"
                  >
                    {PROVINCIAL_AUTHORITIES_CATALOG.map((auth) => (
                      <option key={auth.id} value={auth.id}>
                        {auth.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    Hệ thống đề xuất theo địa bàn đặt trụ sở chính của Doanh nghiệp.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Cam kết pháp lý & Quyền sở hữu trí tuệ: *
                  </label>
                  <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      id="legal-consent-check"
                      checked={legalConsent}
                      onChange={(e) => setLegalConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-navy"
                    />
                    <label htmlFor="legal-consent-check" className="text-slate-600 leading-relaxed cursor-pointer">
                      Doanh nghiệp cam kết chịu trách nhiệm hoàn toàn trước pháp luật về tính xác thực của văn bằng SHTT, giải pháp công nghệ và sẵn sàng tiếp nhận thẩm định của Sở KH&CN.
                    </label>
                  </div>
                  {errors.legalConsent && (
                    <p className="text-rose-600 text-xs mt-1 font-bold">{errors.legalConsent}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Link
                href="/portal/seller/technologies"
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-extrabold transition shadow-lg shadow-emerald-950/20 disabled:opacity-50"
              >
                {isSubmitting ? "Đang xử lý..." : "Xác Nhận Đăng Hồ Sơ Chào Bán"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
