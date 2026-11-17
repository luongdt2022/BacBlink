"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { authClient, normalizePlatformRole, UserContext } from "@/lib/auth-client";
import { API_BASE, readApiError } from "@/lib/api-client";
import {
  Building2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  UploadCloud,
  Send,
  ShieldCheck,
  X,
  AlertCircle,
  MapPin,
  Factory,
  ShoppingBag,
  Store,
} from "lucide-react";

const BACNINH_DISTRICTS = [
  { code: "TP_BN", name: "TP. Bắc Ninh" },
  { code: "TU_SON", name: "TP. Từ Sơn" },
  { code: "QUE_VO", name: "TX. Quế Võ" },
  { code: "THUAN_THANH", name: "TX. Thuận Thành" },
  { code: "YEN_PHONG", name: "Huyện Yên Phong" },
  { code: "TIEN_DU", name: "Huyện Tiên Du" },
  { code: "GIA_BINH", name: "Huyện Gia Bình" },
  { code: "LUONG_TAI", name: "Huyện Lương Tài" },
  { code: "NGOAI_TINH", name: "Ngoài tỉnh Bắc Ninh (Đối tác liên kết)" },
] as const;

const BACNINH_INDUSTRIAL_ZONES = [
  "KCN Yên Phong I",
  "KCN Yên Phong II",
  "KCN Quế Võ I",
  "KCN Quế Võ II",
  "KCN Quế Võ III",
  "KCN VSIP Bắc Ninh",
  "KCN Tiên Sơn",
  "KCN Đại Đồng - Hoàn Sơn",
  "KCN Hanaka",
  "KCN Thuận Thành",
  "KCN Gia Bình",
  "Ngoài KCN / Cụm công nghiệp",
] as const;

const BACLINK_SECTORS = [
  { code: "IND_ELEC", name: "Điện tử, Bán dẫn & Thiết bị chính xác" },
  { code: "IND_MECH", name: "Cơ khí chế tạo, Khuôn mẫu & Gia công CNC" },
  { code: "IND_AUTO", name: "Tự động hóa, Robot & Thiết bị thông minh" },
  { code: "IND_PLAS", name: "Nhựa kỹ thuật, Bao bì & Đóng gói" },
  { code: "IND_MAT", name: "Vật liệu mới, Hóa chất & Xử lý bề mặt" },
  { code: "IND_IT", name: "CNTT, Phần mềm quản trị & Chuyển đổi số" },
  { code: "IND_GREEN", name: "Năng lượng sạch & Môi trường công nghiệp" },
  { code: "IND_LOG", name: "Logistics, Kho vận & Chuỗi cung ứng" },
] as const;

function ProfileUpgradeHubContent() {
  const [session, setSession] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);

  const [taxCode, setTaxCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [district, setDistrict] = useState<string>("YEN_PHONG");
  const [industrialZone, setIndustrialZone] = useState<string>("KCN Yên Phong I");
  const [sectorCode, setSectorCode] = useState<string>("IND_ELEC");
  const [description, setDescription] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [pledgeAgreed, setPledgeAgreed] = useState(false);

  const [isLookingUpTax, setIsLookingUpTax] = useState(false);
  const [taxLookupMessage, setTaxLookupMessage] = useState<string | null>(null);
  const [taxLookupError, setTaxLookupError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<{
    title: string;
    message: string;
    code: string;
  } | null>(null);

  useEffect(() => {
    const user = authClient.getUser();
    setSession(user);
    setLoading(false);
  }, []);

  const normalizedRole = normalizePlatformRole(session?.role);

  const handleTaxLookup = async () => {
    const cleanTax = taxCode.trim();
    setTaxLookupMessage(null);
    setTaxLookupError(null);

    if (!cleanTax) {
      setTaxLookupError("Vui lòng nhập Mã số thuế để tra cứu.");
      return;
    }
    if (!/^\d{10}(\d{3})?$/.test(cleanTax)) {
      setTaxLookupError("Mã số thuế không hợp lệ. Bắt buộc gồm 10 hoặc 13 chữ số.");
      return;
    }

    setIsLookingUpTax(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/enterprises/lookup-tax/${encodeURIComponent(cleanTax)}`);
      if (!res.ok) {
        setTaxLookupError(await readApiError(res, "Không thể tra cứu thông tin mã số thuế lúc này."));
        return;
      }
      const json = await res.json();
      const data = json.data ?? json;
      if (data && data.found) {
        setCompanyName(data.name || "");
        const sourceLabel =
          data.source === "INTERNAL"
            ? "CSDL Doanh nghiệp Hội viên BACLINK"
            : "Hệ thống ĐKKD Quốc gia";
        setTaxLookupMessage(
          `✓ Đã tìm thấy dữ liệu: ${data.name}${data.province ? ` (${data.province})` : ""} — Nguồn: ${sourceLabel}`
        );

        const addrText = `${data.province || ""} ${data.address || ""}`.toLowerCase();
        if (addrText.includes("từ sơn")) setDistrict("TU_SON");
        else if (addrText.includes("quế võ")) setDistrict("QUE_VO");
        else if (addrText.includes("thuận thành")) setDistrict("THUAN_THANH");
        else if (addrText.includes("yên phong")) setDistrict("YEN_PHONG");
        else if (addrText.includes("tiên du")) setDistrict("TIEN_DU");
        else if (addrText.includes("gia bình")) setDistrict("GIA_BINH");
        else if (addrText.includes("lương tài")) setDistrict("LUONG_TAI");
        else if (addrText.includes("bắc ninh")) setDistrict("TP_BN");
      } else {
        setTaxLookupError(data?.message || `Không tìm thấy thông tin doanh nghiệp với mã số thuế ${cleanTax}.`);
      }
    } catch {
      setTaxLookupError("Lỗi kết nối khi tra cứu mã số thuế.");
    } finally {
      setIsLookingUpTax(false);
    }
  };

  const handleFileChange = (file: File | null) => {
    setFileError(null);
    if (!file) {
      setLicenseFile(null);
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setFileError("Tệp Giấy chứng nhận ĐKKD bắt buộc phải là định dạng PDF.");
      setLicenseFile(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError("Dung lượng tệp vượt quá giới hạn 10MB cho phép.");
      setLicenseFile(null);
      return;
    }
    setLicenseFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setFileError(null);

    const cleanTax = taxCode.trim();
    if (!/^\d{10}(\d{3})?$/.test(cleanTax)) {
      setSubmitError("Mã số thuế doanh nghiệp bắt buộc gồm 10 hoặc 13 chữ số.");
      return;
    }
    if (companyName.trim().length < 3) {
      setSubmitError("Tên doanh nghiệp bắt buộc và phải có ít nhất 3 ký tự.");
      return;
    }
    if (!licenseFile) {
      setFileError("Vui lòng đính kèm tệp Giấy chứng nhận ĐKKD định dạng PDF.");
      return;
    }
    if (!pledgeAgreed) {
      setSubmitError("Doanh nghiệp bắt buộc phải xác nhận cam kết tính hợp pháp của hồ sơ.");
      return;
    }

    const token = authClient.getToken();
    if (!token) {
      setSubmitError("Vui lòng đăng nhập tài khoản trước khi gửi hồ sơ đăng ký hội viên BACLINK.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        taxCode: cleanTax,
        companyName: companyName.trim(),
        district,
        industrialZone,
        sectorCode,
        description: description.trim(),
        legalDocFileName: licenseFile.name,
        capabilityTier: "DUAL",
        approvalTier: "ADMIN_SINGLE_TIER",
        submittedAt: new Date().toISOString(),
      };

      const res = await fetch(`${API_BASE}/api/v1/governance/approvals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestType: "ENTERPRISE",
          scopeType: "GLOBAL",
          scopeId: null,
          payloadJson: JSON.stringify(payload),
        }),
      });

      if (!res.ok) {
        setSubmitError(await readApiError(res, "Không thể gửi hồ sơ đăng ký hội viên. Vui lòng thử lại."));
        return;
      }

      const json = await res.json();
      const recordId = json?.data?.id || json?.id || `BL-${Date.now().toString().slice(-6)}`;
      setSuccessNotice({
        title: "Đăng Ký Doanh Nghiệp Hội Viên BACLINK Thành Công",
        message:
          "Hồ sơ đã được chuyển thẳng tới Ban Quản trị Hiệp hội BACLINK (ADMIN) xét duyệt 1 cấp. Sau khi phê duyệt, tài khoản tự động kích hoạt quyền ENTERPRISE (Dual-Mode: Bên Mua & Bên Bán).",
        code: String(recordId),
      });
    } catch {
      setSubmitError("Không thể kết nối tới máy chủ BACLINK. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div className="w-full max-w-[1200px] mx-auto space-y-6">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-brand-600">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/portal" className="hover:text-brand-600">
            Không gian tác nghiệp
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-semibold">
            Đăng ký Doanh nghiệp Hội viên BACLINK
          </span>
        </div>

        {/* HERO BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-800 to-slate-900 p-8 sm:p-10 text-white shadow-xl shadow-brand-900/10">
          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-brand-100 border border-white/20 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-200" />
              Hội Viên Doanh Nghiệp BACLINK · Phê Duyệt 1 Cấp
            </div>
            <h1 className="type-page-title">Đăng Ký Doanh Nghiệp Hội Viên BACLINK</h1>
            <p className="text-sm leading-relaxed text-brand-100">
              Hoàn tất một biểu mẫu duy nhất để gia nhập hệ sinh thái công nghiệp tỉnh Bắc Ninh. Hồ sơ được gửi trực tiếp tới Ban Quản trị BACLINK (ADMIN) phê duyệt 1 cấp, tự động mở khóa quyền <strong>ENTERPRISE (Dual-Mode)</strong> cho cả Bên Mua và Bên Bán.
            </p>
          </div>
        </div>

        {/* ALREADY ENTERPRISE NOTICE */}
        {normalizedRole === "ENTERPRISE" && (
          <div className="p-5 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-brand-700 dark:text-brand-300 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tài khoản đã ở cấp Doanh nghiệp Hội viên (ENTERPRISE)
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Bạn đã sở hữu đầy đủ năng lực kép Bên Mua & Bên Bán. Sử dụng bộ chuyển đổi Dual-Mode ngay trong Workspace.
                </p>
              </div>
            </div>
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition shrink-0"
            >
              <span>Vào Workspace Doanh nghiệp</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* SUCCESS NOTIFICATION */}
        {successNotice && (
          <div
            role="status"
            className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  {successNotice.title}
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  {successNotice.message}
                </p>
                <div className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 mt-1">
                  Mã tiếp nhận hồ sơ:{" "}
                  <span className="bg-emerald-200/70 dark:bg-emerald-900 px-2 py-0.5 rounded-md">
                    {successNotice.code}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSuccessNotice(null)}
              aria-label="Đóng thông báo"
              className="text-emerald-500 hover:text-emerald-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LEFT: BENEFITS & 3-TIER OVERVIEW */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-200 text-xs font-extrabold uppercase tracking-wide">
                  Quyền Hạn ENTERPRISE (DUAL)
                </span>
                <h2 className="type-card-title text-slate-900 dark:text-white mt-2">
                  Một Tài Khoản — Hai Năng Lực
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Không cần nộp đơn tách rời Bên Mua và Bên Bán. Hội viên được cấp đồng thời cả hai chế độ tác nghiệp.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <ShoppingBag className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Chế độ Bên Mua:</strong> Đăng nhu cầu gia công, tìm nhà cung ứng FDI/Tier-1/Tier-2, theo dõi MOU & đánh giá năng lực TT17.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Store className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Chế độ Bên Bán:</strong> Mở gian hàng năng lực sản xuất, chào bán sản phẩm/linh kiện, nhận yêu cầu báo giá trực tiếp.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Phê duyệt 1 cấp tập trung:</strong> Gửi thẳng Ban Quản trị BACLINK (ADMIN), không qua khâu trung gian.
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-700" />
                <span>Cấu Trúc Phân Quyền 3 Cấp BACLINK</span>
              </div>
              <ul className="space-y-1.5 pl-1">
                <li>
                  <strong>1. ADMIN:</strong> Ban Quản trị Hiệp hội duyệt hồ sơ 1 cấp.
                </li>
                <li>
                  <strong>2. ENTERPRISE:</strong> Doanh nghiệp Hội viên (Dual-Mode Mua/Bán).
                </li>
                <li>
                  <strong>3. PUBLIC_USER:</strong> Thành viên tra cứu & đăng ký nâng hạng.
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT: UNIFIED REGISTRATION FORM */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
            <div className="pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="type-card-title text-slate-900 dark:text-white">
                Hồ Sơ Đăng Ký Doanh Nghiệp Hội Viên BACLINK
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Thông tin pháp nhân và địa bàn hoạt động tại tỉnh Bắc Ninh gửi trực tiếp ADMIN xét duyệt.
              </p>
            </div>

            {submitError && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-medium flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div>
                <label
                  htmlFor="baclink-tax-code"
                  className="block font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Mã Số Thuế (MST) *
                </label>
                <div className="flex gap-2">
                  <input
                    id="baclink-tax-code"
                    type="text"
                    required
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    placeholder="2300123456"
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleTaxLookup}
                    disabled={isLookingUpTax}
                    className="px-4 py-2 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 hover:bg-brand-100 font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {isLookingUpTax ? "Đang tra cứu..." : "Tra Cứu MST"}
                  </button>
                </div>
                {taxLookupMessage && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    {taxLookupMessage}
                  </p>
                )}
                {taxLookupError && (
                  <p role="alert" className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                    {taxLookupError}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="baclink-company-name"
                  className="block font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Tên Doanh Nghiệp / Tổ Chức *
                </label>
                <input
                  id="baclink-company-name"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Công ty TNHH Công nghiệp Chính xác Bắc Ninh"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="baclink-district"
                    className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    <span>Địa Bàn Hoạt Động (Bắc Ninh) *</span>
                  </label>
                  <select
                    id="baclink-district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    {BACNINH_DISTRICTS.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="baclink-kcn"
                    className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    <Factory className="w-3.5 h-3.5 text-brand-600" />
                    <span>Khu Công Nghiệp / Cụm CN *</span>
                  </label>
                  <select
                    id="baclink-kcn"
                    value={industrialZone}
                    onChange={(e) => setIndustrialZone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    {BACNINH_INDUSTRIAL_ZONES.map((kcn) => (
                      <option key={kcn} value={kcn}>
                        {kcn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="baclink-sector"
                  className="block font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Ngành Công Nghiệp Trọng Tâm *
                </label>
                <select
                  id="baclink-sector"
                  value={sectorCode}
                  onChange={(e) => setSectorCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {BACLINK_SECTORS.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="baclink-description"
                  className="block font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Mô Tả Năng Lực Sản Xuất / Nhu Cầu Hợp Tác
                </label>
                <textarea
                  id="baclink-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tóm tắt sản phẩm, dây chuyền công nghệ hoặc nhu cầu tìm nhà cung ứng tại Bắc Ninh..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="baclink-license-file"
                  className="block font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Tệp Giấy Chứng Nhận ĐKKD (PDF, tối đa 10MB) *
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-brand-500 transition relative">
                  <input
                    id="baclink-license-file"
                    data-testid="enterprise-file-input"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">
                    {licenseFile
                      ? licenseFile.name
                      : "Kéo thả tệp PDF ĐKKD hoặc bấm vào đây để chọn"}
                  </span>
                  <div className="text-xs text-slate-400 mt-1">
                    Định dạng hỗ trợ: .pdf (Dưới 10MB)
                  </div>
                </div>
                {fileError && (
                  <p role="alert" className="text-xs text-rose-500 font-medium mt-1">
                    {fileError}
                  </p>
                )}
              </div>

              <div className="p-3 bg-brand-50/50 dark:bg-brand-950/30 rounded-xl border border-brand-100 dark:border-brand-900 flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  id="baclinkLegalPledge"
                  checked={pledgeAgreed}
                  onChange={(e) => setPledgeAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                />
                <label
                  htmlFor="baclinkLegalPledge"
                  className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs"
                >
                  Doanh nghiệp cam kết chịu trách nhiệm hoàn toàn trước pháp luật về tính chính xác của thông tin kê khai, tính hợp pháp của Giấy phép ĐKKD đính kèm và tuân thủ quy chế Hội viên BACLINK.
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/portal"
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl transition"
                >
                  Quay lại Portal
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting ? "Đang gửi hồ sơ..." : "Gửi Hồ Sơ Đăng Ký Hội Viên"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileUpgradeHubPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8 text-slate-500">
          Đang tải cổng đăng ký hội viên BACLINK...
        </div>
      }
    >
      <ProfileUpgradeHubContent />
    </Suspense>
  );
}
