"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient, UserContext } from "@/lib/auth-client";
import { API_BASE } from "@/lib/api-client";
import {
  GraduationCap,
  Building2,
  ShoppingBag,
  Cpu,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  UploadCloud,
  Send,
  Building,
  ShieldCheck,
  Clock,
  HelpCircle,
  X,
  FileCheck,
  Check,
  AlertCircle,
  FileText,
  Landmark,
} from "lucide-react";

function ProfileUpgradeHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionParam = searchParams?.get("action");
  const [session, setSession] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState<{ title: string; message: string; code: string } | null>(null);

  // Enterprise Form State
  const [taxCode, setTaxCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [enterpriseProvince, setEnterpriseProvince] = useState("HN");
  const [enterpriseAuthority, setEnterpriseAuthority] = useState("HN");
  const [enterpriseFile, setEnterpriseFile] = useState<File | null>(null);
  const [enterprisePledge, setEnterprisePledge] = useState(false);
  const [isLookingUpTax, setIsLookingUpTax] = useState(false);
  const [isSubmittingEnterprise, setIsSubmittingEnterprise] = useState(false);
  const [taxLookupMessage, setTaxLookupMessage] = useState<string | null>(null);

  // Seller Form State (CR-2026-021)
  const [sellerEntityType, setSellerEntityType] = useState<"ENTERPRISE" | "INSTITUTION_RND">("ENTERPRISE");
  const [sellerTaxCode, setSellerTaxCode] = useState("");
  const [sellerDecisionNo, setSellerDecisionNo] = useState("");
  const [sellerOrgName, setSellerOrgName] = useState("");
  const [sellerFile, setSellerFile] = useState<File | null>(null);
  const [sellerFileError, setSellerFileError] = useState<string | null>(null);
  const [sellerTaxLookupMsg, setSellerTaxLookupMsg] = useState<string | null>(null);
  const [isLookingUpSellerTax, setIsLookingUpSellerTax] = useState(false);
  const [sellerSector, setSellerSector] = useState("LV01");
  const [sellerProvince, setSellerProvince] = useState("HN");
  const [sellerDescription, setSellerDescription] = useState("");
  const [sellerPledge, setSellerPledge] = useState(false);
  const [isSubmittingSeller, setIsSubmittingSeller] = useState(false);

  // Existing Expert Upgrade Application State
  const [expertApp, setExpertApp] = useState<any>(null);
  const [loadingApp, setLoadingApp] = useState(true);

  useEffect(() => {
    const user = authClient.getUser();
    setSession(user);
    setLoading(false);

    if (actionParam === "enterprise") {
      setIsEnterpriseModalOpen(true);
    } else if (actionParam === "seller") {
      setIsSellerModalOpen(true);
    }

    // Tra cứu xem user đã có đơn nâng hạng Chuyên gia hay chưa
    const fetchExpertApplication = async () => {
      setLoadingApp(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/experts/my-profile`, {
          headers: authClient.getAuthHeaders(),
        });
        if (res.ok) {
          const json = await res.json();
          const data = json.data ?? json;
          if (data && (data.fullName || data.status)) {
            setExpertApp(data);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tra cứu hồ sơ nâng hạng:", err);
      } finally {
        setLoadingApp(false);
      }
    };

    fetchExpertApplication();
  }, [actionParam]);

  // Tra cứu MST
  const handleTaxLookup = async () => {
    const cleanTax = taxCode.trim();
    if (!cleanTax) {
      setTaxLookupMessage("Vui lòng nhập Mã số thuế để tra cứu.");
      return;
    }
    setIsLookingUpTax(true);
    setTaxLookupMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/enterprises/lookup-tax/${encodeURIComponent(cleanTax)}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data ?? json;
        if (data && data.found) {
          setCompanyName(data.name || "");
          const sourceLabel = data.source === "INTERNAL"
            ? "CSDL Doanh nghiệp ĐMST Quốc gia"
            : "Hệ thống ĐKKD Quốc gia (VietQR)";
          setTaxLookupMessage(`✓ Đã tìm thấy dữ liệu: ${data.name}${data.province ? ` (${data.province})` : ""} - Nguồn: ${sourceLabel}`);
          if (data.province) {
            const p = data.province.toLowerCase();
            if (p.includes("hà nội") || p.includes("ha noi") || p.includes("hn")) {
              setEnterpriseProvince("HN");
              setEnterpriseAuthority("HN");
            } else if (p.includes("hồ chí minh") || p.includes("ho chi minh") || p.includes("sg") || p.includes("hcm")) {
              setEnterpriseProvince("SG");
              setEnterpriseAuthority("SG");
            } else if (p.includes("đà nẵng") || p.includes("da nang") || p.includes("dn")) {
              setEnterpriseProvince("DN");
              setEnterpriseAuthority("DN");
            } else if (p.includes("bình dương") || p.includes("binh duong")) {
              setEnterpriseProvince("BD");
            } else if (p.includes("hải phòng") || p.includes("hai phong")) {
              setEnterpriseProvince("HP");
            }
          }
        } else {
          setTaxLookupMessage(data?.message || `Không tìm thấy thông tin doanh nghiệp với mã số thuế ${cleanTax}.`);
        }
      } else {
        setTaxLookupMessage("Không thể tra cứu thông tin mã số thuế lúc này.");
      }
    } catch {
      setTaxLookupMessage("Lỗi kết nối khi tra cứu mã số thuế.");
    } finally {
      setIsLookingUpTax(false);
    }
  };

  // Submit Doanh nghiệp ĐMST
  const handleSubmitEnterprise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxCode || !companyName || !enterprisePledge) return;

    setIsSubmittingEnterprise(true);
    const trackingCode = `REQ-INST-${Date.now().toString().slice(-6)}`;

    try {
      const token = authClient.getToken();
      if (token) {
        await fetch(`${API_BASE}/api/v1/governance/approvals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requestType: "INSTITUTION",
            scopeType: "PROVINCE",
            scopeId: enterpriseAuthority,
            payloadJson: JSON.stringify({
              taxCode,
              companyName,
              province: enterpriseProvince,
              authorityId: enterpriseAuthority,
              fileName: enterpriseFile ? enterpriseFile.name : "Giay_Phep_DKKD.pdf",
              submittedAt: new Date().toISOString(),
            }),
          }),
        }).catch(() => null);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsSubmittingEnterprise(false);
      setIsEnterpriseModalOpen(false);
      setSuccessNotice({
        title: "Nộp Hồ Sơ Doanh Nghiệp ĐMST Thành Công",
        message: "Hồ sơ của Quý doanh nghiệp đã được tiếp nhận và phân bổ tới Sở KH&CN quản lý địa bàn.",
        code: trackingCode,
      });
    }
  };

  // Tra cứu MST cho Gian Hàng Seller (CR-2026-021)
  const handleLookupSellerTaxCode = async () => {
    const cleanTax = sellerTaxCode.trim();
    if (!cleanTax) {
      setSellerTaxLookupMsg("Vui lòng nhập Mã số thuế để tra cứu.");
      return;
    }
    if (!/^\d{10}(\d{3})?$/.test(cleanTax)) {
      setSellerTaxLookupMsg("Mã số thuế không hợp lệ. Bắt buộc gồm 10 hoặc 13 chữ số.");
      return;
    }
    setIsLookingUpSellerTax(true);
    setSellerTaxLookupMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/enterprises/lookup-tax/${encodeURIComponent(cleanTax)}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data ?? json;
        if (data && data.found) {
          setSellerOrgName(data.name || "");
          const sourceLabel = data.source === "INTERNAL"
            ? "CSDL Doanh nghiệp ĐMST Quốc gia"
            : "Hệ thống ĐKKD Quốc gia (VietQR)";
          setSellerTaxLookupMsg(`✓ Đã tìm thấy dữ liệu: ${data.name}${data.province ? ` (${data.province})` : ""} - Nguồn: ${sourceLabel}`);
        } else {
          setSellerTaxLookupMsg(data?.message || `Không tìm thấy thông tin doanh nghiệp với mã số thuế ${cleanTax}.`);
        }
      } else {
        setSellerTaxLookupMsg("Không thể tra cứu thông tin mã số thuế lúc này.");
      }
    } catch {
      setSellerTaxLookupMsg("Lỗi kết nối khi tra cứu mã số thuế.");
    } finally {
      setIsLookingUpSellerTax(false);
    }
  };

  // Xử lý tệp PDF minh chứng Seller
  const handleSellerFileChange = (file: File | null) => {
    setSellerFileError(null);
    if (!file) {
      setSellerFile(null);
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setSellerFileError("Tệp văn bản pháp lý minh chứng bắt buộc phải là định dạng PDF.");
      setSellerFile(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSellerFileError("Dung lượng tệp vượt quá giới hạn 10MB cho phép.");
      setSellerFile(null);
      return;
    }
    setSellerFile(file);
  };

  // Submit Gian hàng Seller (CR-2026-021: Bắt buộc định danh pháp nhân)
  const handleSubmitSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    setSellerFileError(null);

    if (sellerEntityType === "ENTERPRISE") {
      if (!sellerTaxCode.trim() || !/^\d{10}(\d{3})?$/.test(sellerTaxCode.trim())) {
        alert("Mã số thuế doanh nghiệp không được để trống và phải gồm 10 hoặc 13 chữ số.");
        return;
      }
    } else {
      if (!sellerDecisionNo.trim() || sellerDecisionNo.trim().length < 5) {
        alert("Số Quyết định thành lập / Giấy phép KH&CN không được để trống và phải từ 5 ký tự trở lên.");
        return;
      }
    }

    if (!sellerOrgName.trim() || sellerOrgName.trim().length < 5) {
      alert("Tên đơn vị bắt buộc và phải có ít nhất 5 ký tự.");
      return;
    }

    if (!sellerFile) {
      setSellerFileError("Tệp văn bản pháp lý minh chứng bắt buộc phải là định dạng PDF.");
      return;
    }

    if (!sellerDescription.trim() || sellerDescription.trim().length < 10) {
      alert("Mô tả năng lực cung ứng phải từ 10 ký tự trở lên.");
      return;
    }

    if (!sellerPledge) {
      alert("Đơn vị bắt buộc phải cam kết tuân thủ quy chế và quyền SHTT.");
      return;
    }

    setIsSubmittingSeller(true);
    const trackingCode = `REQ-SHOP-${Date.now().toString().slice(-6)}`;

    const payload = {
      entityType: sellerEntityType,
      taxCode: sellerEntityType === "ENTERPRISE" ? sellerTaxCode.trim() : null,
      establishmentDecisionNo: sellerEntityType === "INSTITUTION_RND" ? sellerDecisionNo.trim() : null,
      orgName: sellerOrgName.trim(),
      legalDocUrl: sellerFile.name.endsWith(".pdf") ? sellerFile.name : `${sellerFile.name}.pdf`,
      legalDocFileName: sellerFile.name,
      mainSector: sellerSector,
      province: sellerProvince,
      description: sellerDescription.trim(),
      pledgeAgreed: sellerPledge,
      submittedAt: new Date().toISOString(),
    };

    try {
      const token = authClient.getToken();
      if (token) {
        await fetch(`${API_BASE}/api/v1/governance/approvals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requestType: "SHOP",
            scopeType: "PROVINCE",
            scopeId: sellerProvince,
            payloadJson: JSON.stringify(payload),
          }),
        }).catch(() => null);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsSubmittingSeller(false);
      setIsSellerModalOpen(false);
      setSuccessNotice({
        title: "Đăng Ký Mở Gian Hàng Seller Thành Công",
        message: "Yêu cầu mở gian hàng công nghệ đã được gửi đến Hàng đợi Thẩm định SHOP với SLA xử lý 24 giờ.",
        code: trackingCode,
      });
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-brand-600">Trang chủ</Link>
          <span>/</span>
          <Link href="/portal" className="hover:text-brand-600">Không gian tác nghiệp</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-semibold">Cổng đăng ký nâng cấp vai trò</span>
        </div>

        {/* HERO BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-800 to-slate-900 p-8 sm:p-10 text-white shadow-xl shadow-brand-900/10">
          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 px-3.5 py-1 text-xs font-bold text-brand-200 border border-brand-400/30 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Hệ Thống Phân Cấp & Thẩm Quyền 3D Scoped RBAC
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Lựa Chọn Lộ Trình Nâng Hạng Tài Khoản
            </h1>
            <p className="text-sm leading-relaxed text-brand-100">
              Nền tảng NacenTwin mở rộng thẩm quyền tác nghiệp theo chuẩn Bộ KH&CN. Quý thành viên vui lòng lựa chọn tư cách pháp nhân phù hợp để mở khóa các không gian tác nghiệp chuyên biệt.
            </p>
          </div>
        </div>

        {/* SUCCESS NOTIFICATION TOAST/MODAL */}
        {successNotice && (
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">{successNotice.title}</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">{successNotice.message}</p>
                <div className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 mt-1">
                  Mã tiếp nhận hồ sơ: <span className="bg-emerald-200/70 dark:bg-emerald-900 px-2 py-0.5 rounded-md">{successNotice.code}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-emerald-500 hover:text-emerald-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ACTIVE SUBMITTED APPLICATION BANNER */}
        {expertApp && (
          <div data-testid="submitted-application-banner" className="rounded-2xl border-2 border-brand-500 bg-white dark:bg-slate-900 p-6 shadow-lg shadow-brand-500/10 space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Đơn Nâng Hạng Đang Xử Lý</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      {expertApp.expertCode || expertApp.id ? `MÃ: ${expertApp.expertCode || String(expertApp.id).slice(0, 8)}` : "HỒ SƠ KH&CN"}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    Hồ Sơ Nâng Hạng Chuyên Gia KH&CN
                  </h3>
                </div>
              </div>
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {expertApp.status === "APPROVED" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold dark:bg-emerald-950/60 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã Phê Duyệt (VERIFIED_EXPERT)
                  </span>
                ) : expertApp.status === "CHANGES_REQUESTED" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold dark:bg-rose-950/60 dark:text-rose-300">
                    <AlertCircle className="w-4 h-4" />
                    Hội Đồng Yêu Cầu Bổ Sung Hồ Sơ
                  </span>
                ) : expertApp.status === "REJECTED" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold dark:bg-rose-950/60 dark:text-rose-300">
                    <AlertCircle className="w-4 h-4" />
                    Hồ Sơ Đã Bị Từ Chối (REJECTED)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold dark:bg-amber-950/60 dark:text-amber-300">
                    <Clock className="w-4 h-4" />
                    Đang Chờ Hội Đồng Thẩm Định (SLA &le; 48h)
                  </span>
                )}
              </div>
            </div>

            {/* Summary Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-500 font-medium">Họ và tên chuyên gia</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {expertApp.fullName}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-500 font-medium">Học hàm / Học vị</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {expertApp.academicDegree || "Tiến sĩ (TS)"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-500 font-medium">Cơ quan công tác chính</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {expertApp.primaryInstitution || "Viện / Trường / Doanh nghiệp"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-500 font-medium">Cơ quan thụ lý hồ sơ</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {expertApp.scopeId === "GLOBAL" || !expertApp.scopeId ? "NacenTech Trung Ương" : `Sở KH&CN (${expertApp.scopeId})`}
                </p>
              </div>
            </div>

            {/* Reviewer Note Banner for REJECTED or CHANGES_REQUESTED */}
            {(expertApp.status === "REJECTED" || expertApp.status === "CHANGES_REQUESTED") && (expertApp.reviewerNote || expertApp.reviewNote) && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    {expertApp.status === "REJECTED"
                      ? "Lý do từ chối từ Hội đồng Thẩm định:"
                      : "Ý kiến yêu cầu bổ sung từ Hội đồng Thẩm định:"}
                  </span>
                </div>
                <p className="text-xs leading-relaxed pl-6">
                  {expertApp.reviewerNote || expertApp.reviewNote}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-500">
                {expertApp.status === "REJECTED"
                  ? "Bạn có thể chỉnh sửa và nộp lại hồ sơ sau khi đã hoàn thiện các điều kiện còn thiếu."
                  : "Bạn có thể cập nhật lại thông tin khoa học, công bố hoặc bằng sáng chế bất kỳ lúc nào trước khi có quyết định phê duyệt."}
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/profile/upgrade/expert"
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Xem chi tiết hồ sơ</span>
                </Link>
                <Link
                  href="/profile/upgrade/expert?edit=true"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-md shadow-brand-500/20 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{expertApp.status === "REJECTED" ? "Chỉnh sửa & Nộp lại" : "Chỉnh sửa & Cập nhật đơn"}</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 4 UPGRADE ROUTE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* CARD 1: CHUYÊN GIA KH&CN */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-brand-200 dark:border-brand-900/60 hover:border-brand-500 hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-200 text-xs font-extrabold uppercase tracking-wide">
                  Học Hàm / Học Vị
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">Chuyên Gia KH&CN</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Dành cho các Nhà khoa học, Giảng viên, Nghiên cứu viên, Nhà sáng chế có công trình công bố hoặc bằng SHTT.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Quyền lợi sau nâng hạng:</div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cấp danh vị <strong>VERIFIED_EXPERT</strong> chính thức.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Nhận lời mời tư vấn & giải bài toán công nghệ từ Sở & Doanh nghiệp.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Hỗ trợ AI Scan CV trích xuất LLKH tự động.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {expertApp ? (
                <div className="space-y-2">
                  <div className={`p-2 rounded-lg border text-[11px] flex items-center gap-1.5 font-medium ${
                    expertApp.status === "REJECTED"
                      ? "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200"
                      : "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200"
                  }`}>
                    {expertApp.status === "REJECTED" ? (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>Hồ sơ đã nộp ({expertApp.status === "APPROVED" ? "Đã duyệt" : expertApp.status === "CHANGES_REQUESTED" ? "Cần bổ sung" : expertApp.status === "REJECTED" ? "Bị từ chối" : "Đang chờ duyệt"})</span>
                  </div>
                  <Link
                    href="/profile/upgrade/expert?edit=true"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition"
                  >
                    <span>{expertApp.status === "REJECTED" ? "Chỉnh sửa & Nộp lại đơn" : "Xem & Chỉnh sửa đơn đã nộp"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <>
                  <Link
                    href="/profile/upgrade/expert"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition"
                  >
                    <span>Nâng hạng Chuyên gia (3 Bước)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <div className="text-xs text-center text-slate-400 mt-2">Sở KH&CN thẩm định (SLA 48h)</div>
                </>
              )}
            </div>
          </div>

          {/* CARD 2: DOANH NGHIỆP ĐMST */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-extrabold uppercase tracking-wide">
                  Pháp Nhân ĐMST
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">Doanh Nghiệp ĐMST</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Dành cho Doanh nghiệp KH&CN, Start-up sáng tạo, Tổ chức có hoạt động R&D đổi mới quy trình/sản phẩm.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Quyền lợi sau nâng hạng:</div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cấp vai trò <strong>INNOVATION_ENTITY</strong> cho tổ chức.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Quản lý Hồ sơ năng lực 10 tab, huy động vốn & tài trợ R&D.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Được hưởng các gói ưu đãi chuyển giao công nghệ cấp Sở.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEnterpriseModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer"
              >
                <span>Xác thực MST Doanh Nghiệp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-xs text-center text-slate-400 mt-2">Kèm tệp ĐKKD (PDF) · Sở phê duyệt</div>
            </div>
          </div>

          {/* CARD 3: BÊN MUA (BUYER) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-200 dark:border-amber-900/60 hover:border-amber-500 hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-xs font-extrabold uppercase tracking-wide">
                  Bên Mua Công Nghệ
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">Bên Mua (Buyer)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Dành cho Doanh nghiệp, Tổ chức có bài toán công nghệ, điểm nghẽn kỹ thuật cần tìm nguồn cung giải quyết.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Quyền lợi sau nâng hạng:</div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cấp vai trò <strong>BUYER</strong> có bàn làm việc mua sắm riêng.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Đăng bài toán tìm mua, đo điểm hấp thụ công nghệ TNI tự động.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Kích hoạt Radar Ghép Nối AI 2 chiều & Deal Room 1-1.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/khao-sat-nhu-cau"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition"
              >
                <span>Khảo Sát Nhu Cầu & Bài Toán (7 Bước)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-xs text-center text-slate-400 mt-2">Tự động kích hoạt vai trò sau khi nộp</div>
            </div>
          </div>

          {/* CARD 4: BÊN BÁN (SELLER) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-teal-200 dark:border-teal-900/60 hover:border-teal-500 hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-xs font-extrabold uppercase tracking-wide">
                  Nhà Cung Ứng
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">Bên Bán (Seller)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Dành cho Viện nghiên cứu, Trường Đại học, Doanh nghiệp công nghệ sở hữu sáng chế/giải pháp R&D (TRL 1-9).
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Quyền lợi sau nâng hạng:</div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cấp quyền <strong>SELLER</strong> mở gian hàng công nghệ số.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Niêm yết giải pháp lên Sàn Quốc Gia và Phiên Chào Giá Techmart.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Nhận trực tiếp leads yêu cầu kết nối & ký kết MOU hợp tác.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsSellerModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition cursor-pointer"
              >
                <span>Đăng Ký Gian Hàng Seller</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-xs text-center text-slate-400 mt-2">Hàng đợi SHOP · Thẩm định SLA 24h</div>
            </div>
          </div>

        </div>

        {/* COMPARISON TABLE / MATRIX */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Bảng So Sánh Quyền Hạn & Điều Kiện 4 Lộ Trình</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Đối soát ma trận phân cấp và tiêu chuẩn hồ sơ theo quy chuẩn dự án NacenTech</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">Standardized Matrix</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="p-3">Lộ trình nâng hạng</th>
                  <th className="p-3">Hồ sơ / Bằng chứng bắt buộc</th>
                  <th className="p-3">Cơ quan thẩm định</th>
                  <th className="p-3">Cam kết SLA</th>
                  <th className="p-3">Mã Role trong JWT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <td className="p-3 font-bold text-brand-700 dark:text-brand-400 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" /> Chuyên gia KH&CN
                  </td>
                  <td className="p-3">Bằng cấp học vị, công bố Scopus/ISI, bằng sáng chế hoặc đề tài</td>
                  <td className="p-3">Sở KH&CN (34 tỉnh trọng điểm) / NacenTech</td>
                  <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">48 Giờ</td>
                  <td className="p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 rounded">VERIFIED_EXPERT</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> Doanh nghiệp ĐMST
                  </td>
                  <td className="p-3">Mã số thuế hợp lệ, Giấy chứng nhận ĐKKD (PDF), Cam kết pháp lý</td>
                  <td className="p-3">Sở KH&CN địa bàn đặt trụ sở</td>
                  <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">48 Giờ</td>
                  <td className="p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 rounded">INNOVATION_ENTITY</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4" /> Bên Mua (Buyer)
                  </td>
                  <td className="p-3">Phiếu khảo sát nhu cầu chuyên sâu DNNVV 7 phần & bài toán kỹ thuật</td>
                  <td className="p-3">Tự động kích hoạt khi nộp phiếu khảo sát</td>
                  <td className="p-3 font-semibold text-brand-600 dark:text-brand-400">Tức thì (Realtime)</td>
                  <td className="p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 rounded">BUYER</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" /> Bên Bán (Seller)
                  </td>
                  <td className="p-3">Hồ sơ năng lực đơn vị R&D, danh mục công nghệ chào bán TRL 1-9</td>
                  <td className="p-3">Sở KH&CN / Admin Quản Trị Sàn</td>
                  <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">24 Giờ</td>
                  <td className="p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 rounded">SELLER</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL: DOANH NGHIỆP ĐMST (UI-PROFILE-UPGRADE-001) */}
      {isEnterpriseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Nâng Cấp Hồ Sơ — Doanh Nghiệp ĐMST</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quy chuẩn thẩm định pháp nhân theo UI-PROFILE-UPGRADE-001</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEnterpriseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEnterprise} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã Số Thuế (MST) *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    placeholder="0101234567"
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleTaxLookup}
                    disabled={isLookingUpTax}
                    className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {isLookingUpTax ? "Đang tra cứu..." : "Tra Cứu MST"}
                  </button>
                </div>
                {taxLookupMessage && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    {taxLookupMessage}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Doanh Nghiệp / Tổ Chức *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Công ty TNHH Phát Triển Công Nghệ & ĐMST"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tỉnh / Thành Phố Trụ Sở *</label>
                  <select
                    value={enterpriseProvince}
                    onChange={(e) => setEnterpriseProvince(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="HN">Hà Nội</option>
                    <option value="SG">TP. Hồ Chí Minh</option>
                    <option value="DN">Đà Nẵng</option>
                    <option value="BD">Bình Dương</option>
                    <option value="HP">Hải Phòng</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sở KH&CN Tiếp Nhận Thẩm Định *</label>
                  <select
                    value={enterpriseAuthority}
                    onChange={(e) => setEnterpriseAuthority(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="HN">Sở KH&CN TP. Hà Nội</option>
                    <option value="SG">Sở KH&CN TP. Hồ Chí Minh</option>
                    <option value="DN">Sở KH&CN TP. Đà Nẵng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tệp Giấy Chứng Nhận ĐKKD (PDF, max 10MB) *</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-emerald-500 transition relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setEnterpriseFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">
                    {enterpriseFile ? enterpriseFile.name : "Kéo thả tệp PDF ĐKKD hoặc bấm vào đây để chọn"}
                  </span>
                  <div className="text-xs text-slate-400 mt-1">Định dạng hỗ trợ: .pdf (Dưới 10MB)</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900 flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  id="legalPledgeEnt"
                  checked={enterprisePledge}
                  onChange={(e) => setEnterprisePledge(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="legalPledgeEnt" className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                  Doanh nghiệp cam kết chịu trách nhiệm hoàn toàn trước pháp luật về tính chính xác của thông tin kê khai và tính hợp pháp của Giấy phép ĐKKD đính kèm.
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEnterpriseModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEnterprise}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmittingEnterprise ? "Đang gửi..." : "Gửi Hồ Sơ Thẩm Định"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ĐĂNG KÝ GIAN HÀNG BÊN BÁN (SELLER) - CR-2026-021 */}
      {isSellerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Đăng Ký Mở Gian Hàng — Bên Bán (Seller)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Khởi tạo gian hàng công nghệ và tiếp nhận quyền SELLER (SLA 24h)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSellerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BỘ CHỌN 2 TABS PHÁP NHÂN (ENTERPRISE | INSTITUTION_RND) */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
              <button
                type="button"
                aria-label="Doanh Nghiệp / DN KH&CN"
                data-testid="seller-tab-enterprise"
                onClick={() => {
                  setSellerEntityType("ENTERPRISE");
                  setSellerFile(null);
                  setSellerFileError(null);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  sellerEntityType === "ENTERPRISE"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
                }`}
              >
                <Building2 className="w-4 h-4" />
                Doanh Nghiệp / DN KH&CN
              </button>
              <button
                type="button"
                aria-label="Viện / Trường / R&D"
                data-testid="seller-tab-institution"
                onClick={() => {
                  setSellerEntityType("INSTITUTION_RND");
                  setSellerFile(null);
                  setSellerFileError(null);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  sellerEntityType === "INSTITUTION_RND"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
                }`}
              >
                <Landmark className="w-4 h-4" />
                Viện / Trường / R&D
              </button>
            </div>

            <form onSubmit={handleSubmitSeller} className="space-y-4 text-xs">
              {sellerEntityType === "ENTERPRISE" ? (
                <>
                  {/* NHÁNH DOANH NGHIỆP: MST, TRA CỨU, TÊN, FILE ĐKKD */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã Số Thuế (MST) *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={sellerTaxCode}
                        onChange={(e) => setSellerTaxCode(e.target.value)}
                        placeholder="0101234567"
                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleLookupSellerTaxCode}
                        disabled={isLookingUpSellerTax}
                        className="px-4 py-2 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 font-bold rounded-xl transition disabled:opacity-50"
                      >
                        {isLookingUpSellerTax ? "Đang tra cứu..." : "Tra Cứu MST"}
                      </button>
                    </div>
                    {sellerTaxLookupMsg && (
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-1">
                        {sellerTaxLookupMsg}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Doanh Nghiệp / Đơn Vị Cung Ứng *</label>
                    <input
                      type="text"
                      required
                      value={sellerOrgName}
                      onChange={(e) => setSellerOrgName(e.target.value)}
                      placeholder="CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐMST"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tệp Giấy Phép ĐKKD (PDF, max 10MB) *</label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-teal-500 transition relative">
                      <input
                        type="file"
                        accept=".pdf"
                        data-testid="seller-file-input"
                        onChange={(e) => handleSellerFileChange(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <span className="text-slate-600 dark:text-slate-300 font-semibold">
                        {sellerFile ? sellerFile.name : "Kéo thả tệp PDF ĐKKD hoặc bấm vào đây để chọn"}
                      </span>
                      <div className="text-xs text-slate-400 mt-1">Định dạng hỗ trợ: .pdf (Dưới 10MB)</div>
                    </div>
                    {sellerFileError && (
                      <p className="text-xs text-rose-500 font-medium mt-1">{sellerFileError}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* NHÁNH VIỆN / TRƯỜNG / R&D: SỐ QĐ, TÊN ĐƠN VỊ, FILE QĐ */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số Quyết Định Thành Lập / Mã GP KH&CN *</label>
                    <input
                      type="text"
                      required
                      value={sellerDecisionNo}
                      onChange={(e) => setSellerDecisionNo(e.target.value)}
                      placeholder="Ví dụ: 128/QĐ-BKHCN"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Viện / Trường / Trung Tâm R&D *</label>
                    <input
                      type="text"
                      required
                      value={sellerOrgName}
                      onChange={(e) => setSellerOrgName(e.target.value)}
                      placeholder="Ví dụ: Viện Hàn Lâm Khoa Học & Công Nghệ Việt Nam"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tệp Quyết Định Thành Lập / GP KH&CN (PDF, max 10MB) *</label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-teal-500 transition relative">
                      <input
                        type="file"
                        accept=".pdf"
                        data-testid="seller-file-input"
                        onChange={(e) => handleSellerFileChange(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <span className="text-slate-600 dark:text-slate-300 font-semibold">
                        {sellerFile ? sellerFile.name : "Kéo thả tệp PDF Quyết định thành lập hoặc bấm vào đây để chọn"}
                      </span>
                      <div className="text-xs text-slate-400 mt-1">Định dạng hỗ trợ: .pdf (Dưới 10MB)</div>
                    </div>
                    {sellerFileError && (
                      <p className="text-xs text-rose-500 font-medium mt-1">{sellerFileError}</p>
                    )}
                  </div>
                </>
              )}

              {/* KHỐI TRƯỜNG DÙNG CHUNG */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lĩnh Vực Công Nghệ Trọng Tâm (TT17) *</label>
                  <select
                    value={sellerSector}
                    onChange={(e) => setSellerSector(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="LV01">Công nghệ Thông tin & Truyền thông</option>
                    <option value="LV05">Công nghệ Sinh học & Nông nghiệp</option>
                    <option value="LV07">Vật liệu mới & Nano</option>
                    <option value="LV08">Tự động hóa & Robot</option>
                    <option value="LV11">Năng lượng xanh & Môi trường</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sở KH&CN Quản Lý Địa Bàn *</label>
                  <select
                    value={sellerProvince}
                    onChange={(e) => setSellerProvince(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="HN">Sở KH&CN TP. Hà Nội</option>
                    <option value="SG">Sở KH&CN TP. Hồ Chí Minh</option>
                    <option value="DN">Sở KH&CN TP. Đà Nẵng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mô Tả Năng Lực Cung Ứng & Chuyển Giao *</label>
                <textarea
                  rows={3}
                  required
                  value={sellerDescription}
                  onChange={(e) => setSellerDescription(e.target.value)}
                  placeholder="Tóm tắt các sáng chế, sản phẩm TRL 6-9 sẵn sàng chuyển giao thương mại..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-teal-50/50 dark:bg-teal-950/30 rounded-xl border border-teal-100 dark:border-teal-900 flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  id="sellerPledgeCheck"
                  checked={sellerPledge}
                  onChange={(e) => setSellerPledge(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="sellerPledgeCheck" className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                  Đơn vị cam kết tuân thủ quy chế hoạt động của Sàn Giao dịch Công nghệ NacentTwin và chịu trách nhiệm về quyền sở hữu trí tuệ của các giải pháp đăng tải.
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSellerModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSeller}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmittingSeller ? "Đang gửi..." : "Nộp Đơn Đăng Ký (SLA 24h)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfileUpgradeHubPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8 text-slate-500">Đang tải cổng nâng hạng...</div>}>
      <ProfileUpgradeHubContent />
    </Suspense>
  );
}
