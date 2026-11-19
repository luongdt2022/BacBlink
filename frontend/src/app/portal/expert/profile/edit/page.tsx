"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertTriangle,
  Building2,
  GraduationCap,
  Award,
  BookOpen,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { AppButton } from "@/components/ui/design-system";
import { Async, UXState } from "@/components/ui/async";
import { authClient } from "@/lib/auth-client";
import {
  getMyExpertDetail,
  getMyExpertCompleteness,
  updateMyExpertProfile,
  ExpertPrivateDetail,
  ExpertCompleteness,
  ExpertApiError,
  UpdateExpertProfilePayload,
} from "@/lib/expert-detail";
import { getActiveSectors, SectorOption } from "@/lib/master-data-client";

interface PublicationItem {
  title: string;
  year: number;
  journalOrConference: string;
  doiOrUrl?: string;
}

export default function ExpertProfileEditPage() {
  const router = useRouter();

  // UX & Auth state
  const [uxState, setUxState] = useState<UXState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");

  // Expert profile & completeness data
  const [expertCode, setExpertCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [isPendingReview, setIsPendingReview] = useState(false);
  const [completeness, setCompleteness] = useState<ExpertCompleteness | null>(null);
  const [reloadSeq, setReloadSeq] = useState(0);

  // Form fields
  const [academicRank, setAcademicRank] = useState("NONE");
  const [academicRankYear, setAcademicRankYear] = useState<number | undefined>();
  const [degree, setDegree] = useState("DOCTOR");
  const [degreeYear, setDegreeYear] = useState<number>(new Date().getFullYear());
  const [organizationName, setOrganizationName] = useState("");
  const [organizationAddress, setOrganizationAddress] = useState("");
  const [researchTitle, setResearchTitle] = useState("");
  const [positionTitle, setPositionTitle] = useState("");

  // Sector & Keywords
  const [sectorOptions, setSectorOptions] = useState<SectorOption[]>([]);
  const [selectedSector, setSelectedSector] = useState("");
  const [specializedKeywordsText, setSpecializedKeywordsText] = useState("");

  // Consultation & Bio
  const [isAcceptingConsultation, setIsAcceptingConsultation] = useState(true);
  const [publicBio, setPublicBio] = useState("");
  const [consultingSummary, setConsultingSummary] = useState("");

  // Publications & Achievements
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [newPubTitle, setNewPubTitle] = useState("");
  const [newPubYear, setNewPubYear] = useState(new Date().getFullYear());
  const [newPubJournal, setNewPubJournal] = useState("");
  const [showAddPub, setShowAddPub] = useState(false);

  // Load sectors and profile on mount
  useEffect(() => {
    const user = authClient.getUser();
    if (!user || (user.role !== "VERIFIED_EXPERT" && user.role !== "EXPERT")) {
      setErrorMessage("Chỉ tài khoản Chuyên gia đã xác thực (VERIFIED_EXPERT) hoặc đang chờ phê duyệt (EXPERT) mới có quyền truy cập trang này.");
      setUxState("error");
      return;
    }

    const loadData = async () => {
      setUxState("loading");
      try {
        const [sectors, detail, comp] = await Promise.all([
          getActiveSectors().catch(() => []),
          getMyExpertDetail(),
          getMyExpertCompleteness().catch(() => null),
        ]);

        setSectorOptions(sectors);
        if (detail) {
          const p = detail.publicProfile;
          setExpertCode(p.expertCode);
          setFullName(p.fullName);
          setIsPendingReview(detail.status === "PENDING_REVIEW");

          // Form fields mapping
          setAcademicRank(p.academicRank || "NONE");
          setDegree(p.degree || "DOCTOR");
          setOrganizationName(p.organizationName || "");
          setOrganizationAddress(detail.organizationAddress || "");
          setPositionTitle(p.positionTitle || "");
          setPublicBio(p.publicBio || "");
          setIsAcceptingConsultation(p.isAcceptingConsultation);

          if (p.expertiseSectors && p.expertiseSectors.length > 0) {
            setSelectedSector(p.expertiseSectors[0]);
          } else if (sectors.length > 0) {
            setSelectedSector(sectors[0].code);
          }

          if (p.specializedKeywords && p.specializedKeywords.length > 0) {
            setSpecializedKeywordsText(p.specializedKeywords.join(", "));
          }

          // Publications
          if (p.publications && p.publications.length > 0) {
            setPublications(
              p.publications.map((pub) => ({
                title: pub.title,
                year: new Date().getFullYear(),
                journalOrConference: pub.meta || "",
                doiOrUrl: pub.description || undefined,
              }))
            );
          }
        }

        if (comp) {
          setCompleteness(comp);
        }

        setUxState("success");
      } catch (err: unknown) {
        if (err instanceof ExpertApiError && err.status === 403) {
          setErrorMessage("Tài khoản không có quyền chỉnh sửa hồ sơ chuyên gia.");
        } else if (err instanceof ExpertApiError && err.status === 404) {
          setErrorMessage("Không tìm thấy hồ sơ chuyên gia liên kết với tài khoản.");
        } else {
          setErrorMessage("Không thể tải thông tin hồ sơ chuyên gia. Vui lòng thử lại.");
        }
        setUxState("error");
      }
    };

    void loadData();
  }, [reloadSeq]);

  const handleAddPublication = () => {
    if (!newPubTitle.trim() || !newPubJournal.trim()) return;
    setPublications((prev) => [
      ...prev,
      {
        title: newPubTitle.trim(),
        year: Number(newPubYear) || new Date().getFullYear(),
        journalOrConference: newPubJournal.trim(),
      },
    ]);
    setNewPubTitle("");
    setNewPubJournal("");
    setShowAddPub(false);
  };

  const handleRemovePublication = (index: number) => {
    setPublications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isPendingReview) {
      alert("Hồ sơ đang trong quá trình thẩm định, không thể chỉnh sửa.");
      return;
    }

    if (!degree.trim() || !organizationName.trim()) {
      setSaveStatus("error");
      setSaveMessage("Vui lòng điền đầy đủ Học vị cao nhất và Cơ quan công tác.");
      return;
    }

    setSaveStatus("saving");
    setSaveMessage("");

    const keywords = specializedKeywordsText
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const payload: UpdateExpertProfilePayload = {
      academicRank: academicRank === "NONE" ? null : academicRank,
      academicRankYear: academicRankYear || null,
      degree: degree.trim(),
      degreeYear: Number(degreeYear) || new Date().getFullYear(),
      organizationName: organizationName.trim(),
      organizationAddress: organizationAddress.trim() || null,
      researchTitle: researchTitle.trim() || null,
      positionTitle: positionTitle.trim() || null,
      expertiseSectors: selectedSector ? [selectedSector] : [],
      specializedKeywords: keywords,
      publicBio: publicBio.trim() || null,
      isAcceptingConsultation,
      consultingSummary: consultingSummary.trim() || null,
      publicationsJson: publications.length > 0 ? JSON.stringify(publications) : null,
    };

    try {
      await updateMyExpertProfile(payload);

      // Cập nhật lại chỉ số hoàn thiện hồ sơ sau khi lưu
      const refreshedComp = await getMyExpertCompleteness().catch(() => null);
      if (refreshedComp) setCompleteness(refreshedComp);

      setSaveStatus("success");
      setSaveMessage("Đã cập nhật thành công hồ sơ Chuyên gia! Dữ liệu đã được đồng bộ vào Danh bạ Công khai.");
    } catch (err: unknown) {
      setSaveStatus("error");
      setSaveMessage(err instanceof Error ? err.message : "Cập nhật hồ sơ thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      {/* TOP HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/portal"
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition dark:hover:bg-slate-800 dark:text-slate-300"
              title="Quay lại Portal"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 text-base dark:text-white">
                  CHỈNH SỬA HỒ SƠ CHUYÊN GIA
                </span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-caption font-bold px-2 py-0.5 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                  VERIFIED EXPERT
                </span>
              </div>
              <p className="text-caption text-slate-500 font-semibold uppercase tracking-wider dark:text-slate-400">
                Mã Định Danh: {expertCode || "CG-BL"} · {fullName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/portal"
              className="px-3 py-1.5 rounded-lg text-label font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem Hồ Sơ Sổ Tay</span>
            </Link>
            <AppButton
              variant="primary"
              disabled={isPendingReview || saveStatus === "saving"}
              onClick={() => void handleSaveProfile()}
              className="px-4 py-2 rounded-lg text-label font-bold shadow-xs flex items-center gap-1.5"
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi Hồ Sơ</span>
                </>
              )}
            </AppButton>
          </div>
        </div>
      </header>

      {/* MAIN EDITING BODY */}
      <main className="max-w-[1440px] mx-auto px-3 sm:px-5 py-4 flex-1 w-full space-y-5">
        <Async state={uxState} errorMessage={errorMessage} onRetry={() => setReloadSeq((c) => c + 1)}>
          {/* PENDING REVIEW LOCK BANNER */}
          {isPendingReview && (
            <div className="rounded-surface border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-900">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Hồ sơ đang trong quá trình thẩm định (SLA: tối đa 48 giờ làm việc), không thể chỉnh sửa.</span>
              </div>
            </div>
          )}

          {/* SAVE FEEDBACK ALERT */}
          {saveStatus === "success" && (
            <div className="rounded-surface border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold text-body">{saveMessage}</span>
            </div>
          )}
          {saveStatus === "error" && (
            <div className="rounded-surface border border-rose-200 bg-rose-50 p-4 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="font-semibold text-body">{saveMessage}</span>
            </div>
          )}

          {/* COMPLETENESS & STATUS BAR */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-800 to-brand-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                {fullName ? fullName.slice(0, 2).toUpperCase() : "BL"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{fullName}</h2>
                  <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-800 text-caption font-bold border border-brand-200 dark:bg-brand-950 dark:text-brand-300 dark:border-brand-800">
                    {organizationName || "Hiệp hội BACLINK"}
                  </span>
                </div>
                <p className="text-caption text-slate-500 mt-0.5 dark:text-slate-400">
                  Mã Định Danh Chuyên Gia: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{expertCode}</span>
                </p>
                {completeness && (
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-caption font-bold text-slate-700 dark:text-slate-300">
                      Điểm hoàn thiện: <strong className="text-brand-700 dark:text-brand-300">{completeness.score}/100</strong> (Hạng {completeness.grade})
                    </span>
                    <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden dark:bg-slate-700">
                      <div
                        className={`h-full rounded-full transition-all ${
                          completeness.score >= 90 ? "bg-emerald-500" : completeness.score >= 70 ? "bg-brand-600" : "bg-amber-500"
                        }`}
                        style={{ width: `${completeness.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-caption text-slate-500 font-semibold block dark:text-slate-400">Trạng thái nhận lời mời:</span>
                <span className={`text-label font-bold flex items-center gap-1 justify-end ${
                  isAcceptingConsultation ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
                }`}>
                  {isAcceptingConsultation ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Đang Nhận Tư Vấn
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-slate-400" /> Tạm Ngưng
                    </>
                  )}
                </span>
              </div>
              <button
                type="button"
                disabled={isPendingReview}
                onClick={() => setIsAcceptingConsultation(!isAcceptingConsultation)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-label font-bold text-slate-600 hover:bg-slate-50 transition dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                {isAcceptingConsultation ? "Tạm Ngưng" : "Kích Hoạt"}
              </button>
            </div>
          </div>

          {/* EDIT FORM */}
          <form onSubmit={(e) => void handleSaveProfile(e)} className="space-y-6">
            {/* SECTION 1: HỌC VỊ & CƠ QUAN */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4 dark:bg-slate-900 dark:border-slate-800">
              <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 dark:text-white">
                  <span className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-caption font-black dark:bg-brand-950 dark:text-brand-300">
                    1
                  </span>
                  <span>Học Hàm, Học Vị & Cơ Quan Công Tác Chính</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-label">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 dark:text-slate-200">Học Hàm Cao Nhất:</label>
                  <select
                    disabled={isPendingReview}
                    value={academicRank}
                    onChange={(e) => setAcademicRank(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white form-control dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                  >
                    <option value="GS">Giáo Sư (GS)</option>
                    <option value="PGS">Phó Giáo Sư (PGS)</option>
                    <option value="NONE">Chưa có học hàm</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 dark:text-slate-200">
                    Học Vị Cao Nhất: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    disabled={isPendingReview}
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white form-control dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                  >
                    <option value="DOCTOR">Tiến Sĩ Khoa Học / Tiến Sĩ (TS)</option>
                    <option value="MASTER">Thạc Sĩ (ThS)</option>
                    <option value="ENGINEER_BACHELOR">Kỹ Sư / Cử Nhân (KS/CN)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 dark:text-slate-200">Năm Được Phong / Công Nhận:</label>
                  <input
                    disabled={isPendingReview}
                    type="number"
                    value={academicRankYear || ""}
                    onChange={(e) => setAcademicRankYear(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="2018"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold form-control dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1 dark:text-slate-200">
                    Cơ Quan / Đơn Vị Công Tác Hiện Tại: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    disabled={isPendingReview}
                    required
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Viện Cơ học & Tự động hóa · Viện Hàn lâm KH&CN Việt Nam"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 form-control dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 dark:text-slate-200">Chức Vụ Chuyên Môn:</label>
                  <input
                    disabled={isPendingReview}
                    type="text"
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    placeholder="Trưởng phòng Thí nghiệm..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium form-control dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1 dark:text-slate-200">Địa Chỉ Cơ Quan Công Tác:</label>
                  <input
                    disabled={isPendingReview}
                    type="text"
                    value={organizationAddress}
                    onChange={(e) => setOrganizationAddress(e.target.value)}
                    placeholder="18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium form-control dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: NGÀNH CÔNG NGHIỆP CHUYÊN MÔN & TỪ KHÓA CHUYÊN SÂU */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4 dark:bg-slate-900 dark:border-slate-800">
              <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 dark:text-white">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-caption font-black dark:bg-emerald-950 dark:text-emerald-300">
                    2
                  </span>
                  <span>Ngành công nghiệp chuyên môn (BACLINK) & Từ Khóa Nghiên Cứu</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-label">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 dark:text-slate-200">
                    Ngành công nghiệp chuyên môn (BACLINK):
                  </label>
                  <select
                    disabled={isPendingReview}
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-brand-700 bg-brand-50/40 form-control dark:bg-slate-800 dark:text-brand-300 dark:border-slate-700"
                  >
                    {sectorOptions.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 dark:text-slate-200">
                    Từ Khóa Chuyên Sâu (SpecializedKeywords):
                  </label>
                  <input
                    disabled={isPendingReview}
                    type="text"
                    value={specializedKeywordsText}
                    onChange={(e) => setSpecializedKeywordsText(e.target.value)}
                    placeholder="Robot Delta, Xử lý ảnh công nghiệp, Thị giác máy tính..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 form-control dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                  />
                  <span className="text-caption text-slate-400 mt-1 block dark:text-slate-500">
                    Phân cách nhau bằng dấu phẩy để hệ thống tự động gợi ý ghép nối cung cầu công nghệ
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 3: CẬP NHẬT CÔNG TRÌNH & SÁNG CHẾ */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 dark:text-white">
                  <span className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-caption font-black dark:bg-brand-950 dark:text-brand-300">
                    3
                  </span>
                  <span>Danh Mục Công Trình Khoa Học, Sáng Chế & Đề Tài</span>
                </h3>
                {!isPendingReview && (
                  <button
                    type="button"
                    onClick={() => setShowAddPub(!showAddPub)}
                    className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 text-label font-bold border border-brand-200 flex items-center gap-1 dark:bg-slate-800 dark:text-brand-300 dark:border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm Công Bố Mới
                  </button>
                )}
              </div>

              {/* Form thêm mới công bố */}
              {showAddPub && !isPendingReview && (
                <div className="p-4 rounded-xl border border-brand-200 bg-brand-50/50 space-y-3 dark:bg-slate-800 dark:border-brand-900 text-label">
                  <h4 className="font-bold text-brand-800 dark:text-brand-200">Khai báo công trình mới:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-caption font-bold text-slate-700 mb-1 dark:text-slate-300">Tên công trình:</label>
                      <input
                        type="text"
                        value={newPubTitle}
                        onChange={(e) => setNewPubTitle(e.target.value)}
                        placeholder="Tên bài báo khoa học, bằng sáng chế..."
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white form-control dark:bg-slate-900 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-caption font-bold text-slate-700 mb-1 dark:text-slate-300">Năm công bố:</label>
                      <input
                        type="number"
                        value={newPubYear}
                        onChange={(e) => setNewPubYear(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white form-control dark:bg-slate-900 dark:border-slate-700"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-caption font-bold text-slate-700 mb-1 dark:text-slate-300">Tạp chí / Bằng sáng chế / Cơ quan:</label>
                      <input
                        type="text"
                        value={newPubJournal}
                        onChange={(e) => setNewPubJournal(e.target.value)}
                        placeholder="IEEE Transactions / Bằng độc quyền sáng chế số VN..."
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white form-control dark:bg-slate-900 dark:border-slate-700"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPub(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 font-semibold"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleAddPublication}
                      className="px-4 py-1.5 rounded-lg bg-brand-600 text-white font-bold"
                    >
                      Thêm vào danh sách
                    </button>
                  </div>
                </div>
              )}

              {/* Danh sách công bố */}
              <div className="space-y-3 text-label">
                {publications.length === 0 ? (
                  <p className="text-body text-slate-500 py-3 text-center dark:text-slate-400">
                    Chưa có công trình khoa học hoặc sáng chế nào được khai báo.
                  </p>
                ) : (
                  publications.map((pub, idx) => (
                    <div
                      key={`${pub.title}-${idx}`}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between dark:bg-slate-800 dark:border-slate-700"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-caption dark:bg-emerald-950 dark:text-emerald-300">
                            Công bố ({pub.year})
                          </span>
                          <span className="font-mono text-slate-500 text-caption dark:text-slate-400">{pub.journalOrConference}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-body dark:text-white">{pub.title}</h4>
                      </div>
                      {!isPendingReview && (
                        <button
                          type="button"
                          onClick={() => handleRemovePublication(idx)}
                          className="text-rose-600 hover:text-rose-700 p-1 rounded-lg"
                          title="Xóa công trình"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECTION 4: TIỂU SỬ & TÓM TẮT TƯ VẤN */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4 dark:bg-slate-900 dark:border-slate-800">
              <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 dark:text-white">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-caption font-black dark:bg-amber-950 dark:text-amber-300">
                    4
                  </span>
                  <span>Tóm Tắt Tiểu Sử & Năng Lực Tư Vấn Công Nghệ</span>
                </h3>
              </div>

              <div className="space-y-4 text-label">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 dark:text-slate-200">
                    Tóm Tắt Tiểu Sử Khoa Học Công Khai (PublicBio):
                  </label>
                  <textarea
                    disabled={isPendingReview}
                    rows={3}
                    value={publicBio}
                    onChange={(e) => setPublicBio(e.target.value)}
                    placeholder="Chuyên gia có hơn 15 năm kinh nghiệm trong lĩnh vực Cơ học tự động hóa, điều khiển Robot và Thị giác máy tính..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium form-control dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 dark:text-slate-200">
                    Tóm Tắt Kinh Nghiệm Tư Vấn Chuyển Giao (ConsultingSummary):
                  </label>
                  <textarea
                    disabled={isPendingReview}
                    rows={2}
                    value={consultingSummary}
                    onChange={(e) => setConsultingSummary(e.target.value)}
                    placeholder="Từng chủ nhiệm 3 đề tài cấp Nhà nước, chuyển giao thành công 2 dây chuyền sản xuất cho doanh nghiệp..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium form-control dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex items-center justify-between pt-4">
              <Link
                href="/portal"
                className="text-label text-slate-500 font-bold hover:underline dark:text-slate-400"
              >
                Quay lại Không Gian Tác Nghiệp
              </Link>

              <div className="flex items-center gap-3">
                <Link
                  href="/portal"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-label hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Hủy Bỏ
                </Link>
                <AppButton
                  variant="primary"
                  type="submit"
                  disabled={isPendingReview || saveStatus === "saving"}
                  className="px-6 py-2.5 rounded-xl font-bold text-label shadow-md flex items-center gap-2"
                >
                  {saveStatus === "saving" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Lưu Toàn Bộ Hồ Sơ</span>
                    </>
                  )}
                </AppButton>
              </div>
            </div>
          </form>
        </Async>
      </main>
    </div>
  );
}
