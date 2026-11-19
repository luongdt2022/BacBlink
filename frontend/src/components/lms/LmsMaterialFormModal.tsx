"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  AlertCircle,
  AlertTriangle,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Film,
  CheckCircle,
  FileText,
  Link as LinkIcon,
  HelpCircle,
  Sparkles,
  Info,
} from "lucide-react";
import {
  type LmsLessonType,
  type LmsStatus,
  type LmsAttachmentCategory,
  type InstructorDto,
  type QuizQuestionDto,
  type AttachmentDto,
  type DbLinkDto,
  type CreateLearningMaterialRequest,
  type UpdateLearningMaterialRequest,
  type LmsMaterialDetailDto,
  createLmsMaterial,
  updateLmsMaterial,
  fetchLmsMaterialDetail,
  uploadLmsMedia,
  lookupInstructors,
  type InstructorLookupDto,
} from "@/lib/api/lms";

interface LmsMaterialFormModalProps {
  materialId?: string | null; // null = tạo mới, có id = cập nhật
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type TabKey = "A" | "B" | "C" | "D";

export function LmsMaterialFormModal({
  materialId,
  isOpen,
  onClose,
  onSuccess,
}: LmsMaterialFormModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("A");
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [version, setVersion] = useState<number>(1);
  const [initialStatus, setInitialStatus] = useState<LmsStatus>("DRAFT");
  const [title, setTitle] = useState<string>("");
  const [lessonType, setLessonType] = useState<LmsLessonType>("TYPE_A");
  const [sectorCode, setSectorCode] = useState<string>("IND_ELEC");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [descriptionHtml, setDescriptionHtml] = useState<string>("");
  const [videoStorageKey, setVideoStorageKey] = useState<string>("");
  const [videoFileName, setVideoFileName] = useState<string>("");
  const [videoFileSize, setVideoFileSize] = useState<number>(0);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");

  // Video Upload Progress & Abort
  const [videoUploadPercent, setVideoUploadPercent] = useState<number | null>(null);
  const videoAbortController = useRef<AbortController | null>(null);

  // Tab A: Instructors
  const [instructors, setInstructors] = useState<InstructorDto[]>([]);
  const [instructorQuery, setInstructorQuery] = useState<string>("");
  const [instructorOptions, setInstructorOptions] = useState<InstructorLookupDto[]>([]);
  const [searchingInstructor, setSearchingInstructor] = useState<boolean>(false);

  // Tab B: Quiz Questions
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionDto[]>([]);

  // Tab C: Attachments
  const [attachments, setAttachments] = useState<AttachmentDto[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState<boolean>(false);

  // Tab D: Db Links
  const [dbLinks, setDbLinks] = useState<DbLinkDto[]>([]);

  // Confirm unpublish warning (BR-EL-03)
  const [showDraftWarningConfirm, setShowDraftWarningConfirm] = useState<boolean>(false);
  const [pendingDraftSubmit, setPendingDraftSubmit] = useState<boolean>(false);

  // Video HTML element ref for canvas thumbnail extraction
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);

  // Load existing material if editing
  useEffect(() => {
    if (!isOpen) return;

    if (materialId) {
      setLoading(true);
      fetchLmsMaterialDetail(materialId)
        .then((detail) => {
          setVersion(detail.version);
          setInitialStatus(detail.status);
          setTitle(detail.title);
          setLessonType(detail.lessonType);
          setSectorCode(detail.sectorCode || "IND_ELEC");
          setDurationMinutes(detail.durationMinutes);
          setDescriptionHtml(detail.descriptionHtml || "");
          setVideoStorageKey(detail.videoStorageKey || "");
          setVideoFileName(detail.videoFileName || "");
          setVideoFileSize(detail.videoFileSize || 0);
          setThumbnailUrl(detail.thumbnailUrl || "");
          setInstructors(detail.instructors || []);
          setQuizQuestions(detail.quizQuestions || []);
          setAttachments(detail.attachments || []);
          setDbLinks(detail.dbLinks || []);
        })
        .catch((err) => {
          setErrorMessage(err instanceof Error ? err.message : "Không thể tải chi tiết học liệu.");
        })
        .finally(() => setLoading(false));
    } else {
      // Reset defaults
      setVersion(1);
      setInitialStatus("DRAFT");
      setTitle("");
      setLessonType("TYPE_A");
      setSectorCode("IND_ELEC");
      setDurationMinutes(60);
      setDescriptionHtml("");
      setVideoStorageKey("");
      setVideoFileName("");
      setVideoFileSize(0);
      setThumbnailUrl("");
      setInstructors([]);
      setQuizQuestions([]);
      setAttachments([]);
      setDbLinks([]);
      setErrorMessage(null);
    }
  }, [isOpen, materialId]);

  // Search instructors from brokerage.expert_profiles
  useEffect(() => {
    if (!instructorQuery.trim()) {
      setInstructorOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingInstructor(true);
      try {
        const results = await lookupInstructors(instructorQuery.trim());
        setInstructorOptions(results);
      } catch {
        setInstructorOptions([]);
      } finally {
        setSearchingInstructor(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [instructorQuery]);

  // Tab Error Counting
  const getTabErrors = () => {
    const errors: Record<TabKey, string[]> = { A: [], B: [], C: [], D: [] };

    // Tab A validation
    if (!title.trim()) errors.A.push("Tiêu đề bài học không được để trống");
    if (title.length > 250) errors.A.push("Tiêu đề không được vượt quá 250 ký tự");
    if (durationMinutes < 1 || durationMinutes > 300) errors.A.push("Thời lượng phải từ 1 đến 300 phút");

    // Tab B validation: Quiz questions
    quizQuestions.forEach((q, idx) => {
      if (!q.question.trim()) errors.B.push(`Câu hỏi số ${idx + 1} chưa có nội dung`);
      if (!q.optionA.trim() || !q.optionB.trim()) {
        errors.B.push(`Câu hỏi số ${idx + 1} phải có tối thiểu phương án A và B`);
      }
      if (!q.correctOption) {
        errors.B.push(`Câu hỏi số ${idx + 1} chưa chọn đáp án đúng`);
      }
    });

    // Tab D validation: DB Links
    dbLinks.forEach((link, idx) => {
      if (!link.url.trim() || !link.url.startsWith("http")) {
        errors.D.push(`Liên kết số ${idx + 1} không phải là đường dẫn URL hợp lệ`);
      }
    });

    return errors;
  };

  const tabErrors = getTabErrors();

  // Video Upload Handler with HTML5 Canvas Auto-Thumbnail
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".mp4") && file.type !== "video/mp4") {
      alert("Chỉ chấp nhận tệp định dạng .mp4");
      return;
    }

    if (file.size > 1_073_741_824) {
      alert("Dung lượng video không được vượt quá 1GB.");
      return;
    }

    // Auto extract thumbnail using HTML5 Video + Canvas at second 2.0
    try {
      const videoUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;
      video.currentTime = 2.0;

      video.onloadeddata = () => {
        video.currentTime = Math.min(2.0, video.duration / 2 || 1.0);
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setThumbnailUrl(dataUrl);
        }
        URL.revokeObjectURL(videoUrl);
      };
    } catch {
      // Fallback: ignore thumbnail extraction if browser restricts
    }

    // Upload with real progress bar
    videoAbortController.current = new AbortController();
    setVideoUploadPercent(0);

    try {
      const res = await uploadLmsMedia(
        file,
        "video",
        (percent) => setVideoUploadPercent(percent),
        videoAbortController.current.signal
      );
      setVideoStorageKey(res.storageKey);
      setVideoFileName(res.fileName);
      setVideoFileSize(res.fileSize);
      setVideoUploadPercent(null);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setVideoUploadPercent(null);
        return;
      }
      alert(err instanceof Error ? err.message : "Tải lên video thất bại.");
      setVideoUploadPercent(null);
    }
  };

  const handleCancelVideoUpload = () => {
    if (videoAbortController.current) {
      videoAbortController.current.abort();
      videoAbortController.current = null;
      setVideoUploadPercent(null);
    }
  };

  // Add Instructor
  const handleSelectInstructor = (expert: InstructorLookupDto) => {
    if (instructors.length >= 10) {
      alert("Tối đa 10 giảng viên chuyên gia cho một bài học.");
      return;
    }
    if (instructors.some((i) => i.expertProfileId === expert.expertProfileId)) {
      alert("Chuyên gia này đã được thêm vào danh sách.");
      return;
    }

    const newInst: InstructorDto = {
      expertProfileId: expert.expertProfileId,
      fullName: expert.fullName,
      degree: expert.degree,
      organization: expert.organization,
      avatarUrl: expert.avatarUrl,
      sortOrder: instructors.length + 1,
      isLead: instructors.length === 0,
    };
    setInstructors([...instructors, newInst]);
    setInstructorQuery("");
    setInstructorOptions([]);
  };

  const handleRemoveInstructor = (index: number) => {
    const updated = instructors.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((i) => i.isLead)) {
      updated[0].isLead = true;
    }
    setInstructors(updated);
  };

  // Add Quiz Question (Tab B)
  const handleAddQuizQuestion = () => {
    if (quizQuestions.length >= 10) {
      alert("Tối đa 10 câu hỏi trắc nghiệm cho một bài giảng (BR-EL-05).");
      return;
    }
    const newQ: QuizQuestionDto = {
      sortOrder: quizQuestions.length + 1,
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A",
      explanation: "",
    };
    setQuizQuestions([...quizQuestions, newQ]);
  };

  const handleUpdateQuizQuestion = (index: number, patch: Partial<QuizQuestionDto>) => {
    const updated = [...quizQuestions];
    updated[index] = { ...updated[index], ...patch };
    setQuizQuestions(updated);
  };

  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === quizQuestions.length - 1) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...quizQuestions];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    // Cập nhật lại sortOrder
    updated.forEach((q, i) => (q.sortOrder = i + 1));
    setQuizQuestions(updated);
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = quizQuestions.filter((_, i) => i !== index);
    updated.forEach((q, i) => (q.sortOrder = i + 1));
    setQuizQuestions(updated);
  };

  // Kiểm tra cảnh báo chênh lệch phương án BR-EL-04
  const checkOptionLengthDisparity = (q: QuizQuestionDto) => {
    const lengths = [q.optionA, q.optionB, q.optionC, q.optionD]
      .filter((opt) => opt.trim().length > 0)
      .map((opt) => opt.trim().length);
    if (lengths.length < 2) return false;
    const max = Math.max(...lengths);
    const min = Math.min(...lengths);
    return min > 0 && max > 2 * min;
  };

  // Add Attachment (Tab C)
  const handleUploadAttachment = async (
    e: React.ChangeEvent<HTMLInputElement>,
    category: LmsAttachmentCategory
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (category === "PRACTICE_TOOL") {
      if (file.size > 10 * 1024 * 1024) {
        alert("Công cụ thực hành không được vượt quá 10MB.");
        return;
      }
      if (attachments.filter((a) => a.category === "PRACTICE_TOOL").length >= 10) {
        alert("Tối đa 10 tệp công cụ thực hành.");
        return;
      }
    } else if (category === "SUMMARY_SLIDE") {
      if (file.size > 10 * 1024 * 1024) {
        alert("Phiếu tóm tắt không được vượt quá 10MB.");
        return;
      }
      if (attachments.filter((a) => a.category === "SUMMARY_SLIDE").length >= 1) {
        alert("Chỉ được tải lên 1 phiếu tóm tắt bài giảng.");
        return;
      }
    } else {
      if (file.size > 25 * 1024 * 1024) {
        alert("Tài liệu tham khảo không được vượt quá 25MB.");
        return;
      }
      if (attachments.filter((a) => a.category === "OTHER_DOCUMENT").length >= 10) {
        alert("Tối đa 10 tệp tài liệu tham khảo.");
        return;
      }
    }

    setUploadingAttachment(true);
    try {
      const res = await uploadLmsMedia(file, "document");
      const newAtt: AttachmentDto = {
        category,
        fileName: res.fileName,
        storageKey: res.storageKey,
        contentType: res.contentType,
        fileSize: res.fileSize,
        downloadUrl: res.downloadUrl,
        sortOrder: attachments.length + 1,
      };
      setAttachments([...attachments, newAtt]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Tải tệp đính kèm thất bại.");
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Add DB Link (Tab D)
  const handleAddDbLink = () => {
    if (dbLinks.length >= 5) {
      alert("Tối đa 5 liên kết dữ liệu BACLINK cho một bài học (BR-EL-05).");
      return;
    }
    const newLink: DbLinkDto = {
      title: "",
      url: "https://",
      targetType: "TECHNOLOGY_ASSET",
      sortOrder: dbLinks.length + 1,
    };
    setDbLinks([...dbLinks, newLink]);
  };

  const handleUpdateDbLink = (index: number, patch: Partial<DbLinkDto>) => {
    const updated = [...dbLinks];
    updated[index] = { ...updated[index], ...patch };
    setDbLinks(updated);
  };

  const handleRemoveDbLink = (index: number) => {
    setDbLinks(dbLinks.filter((_, i) => i !== index));
  };

  // Submit Logic
  const handleSubmit = async (targetStatus: LmsStatus) => {
    setErrorMessage(null);

    // Rule BR-EL-03: Cảnh báo chuyển từ PUBLISHED về DRAFT
    if (initialStatus === "PUBLISHED" && targetStatus === "DRAFT" && !pendingDraftSubmit) {
      setShowDraftWarningConfirm(true);
      return;
    }

    // Validation
    if (targetStatus === "PUBLISHED") {
      // Bắt buộc toàn bộ Tab A (BR-EL-01)
      if (!title.trim()) {
        setActiveTab("A");
        setErrorMessage("Vui lòng nhập Tiêu đề bài học trước khi xuất bản.");
        return;
      }
      if (!videoStorageKey) {
        setActiveTab("A");
        setErrorMessage("Bài học công khai bắt buộc phải có tệp Video bài giảng đã tải lên.");
        return;
      }
      // Kiểm tra lỗi các tab khác
      if (tabErrors.B.length > 0) {
        setActiveTab("B");
        setErrorMessage(tabErrors.B[0]);
        return;
      }
      if (tabErrors.D.length > 0) {
        setActiveTab("D");
        setErrorMessage(tabErrors.D[0]);
        return;
      }
    } else {
      // Lưu DRAFT: Chỉ bắt buộc Tiêu đề (BR-EL-01)
      if (!title.trim()) {
        setActiveTab("A");
        setErrorMessage("Vui lòng nhập Tiêu đề bài giảng để lưu nháp.");
        return;
      }
    }

    setSaving(true);
    try {
      const payload: CreateLearningMaterialRequest = {
        title: title.trim(),
        lessonType,
        sectorCode,
        durationMinutes,
        descriptionHtml,
        videoStorageKey: videoStorageKey || undefined,
        videoFileName: videoFileName || undefined,
        videoFileSize: videoFileSize || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        status: targetStatus,
        instructors,
        quizQuestions,
        attachments,
        dbLinks,
      };

      if (materialId) {
        const updatePayload: UpdateLearningMaterialRequest = {
          ...payload,
          version,
        };
        await updateLmsMaterial(materialId, updatePayload);
      } else {
        await createLmsMaterial(payload);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Đã xảy ra lỗi trong quá trình lưu học liệu."
      );
    } finally {
      setSaving(false);
      setShowDraftWarningConfirm(false);
      setPendingDraftSubmit(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl my-8 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 rounded-xl">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {materialId ? "Cập Nhật Học Liệu Số" : "Biên Soạn & Đăng Bài Học Mới"}
              </h2>
              <p className="text-xs text-slate-500">
                Chuẩn hóa 5 thành phần & tích hợp băm chunk AI RAG
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 TABS NAVIGATION */}
        <div className="flex items-center px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 overflow-x-auto">
          {(
            [
              { key: "A", label: "Tab A: Thông tin chung & Video" },
              { key: "B", label: "Tab B: Câu hỏi kiểm tra (Quiz)" },
              { key: "C", label: "Tab C: Học liệu bổ trợ & File" },
              { key: "D", label: "Tab D: Liên kết Tài liệu BACLINK" },
            ] as const
          ).map((tab) => {
            const errorCount = tabErrors[tab.key].length;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                  isActive
                    ? "border-brand-600 text-brand-600 dark:text-brand-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                <span>{tab.label}</span>
                {errorCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {errorCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ERROR NOTIFICATION BAR */}
        {errorMessage && (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-xs text-rose-700 font-semibold flex items-center justify-between dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-200 shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* MODAL BODY (TABS CONTENT) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ===================== TAB A ===================== */}
          {activeTab === "A" && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Tiêu đề bài học <span className="text-rose-500">* (Bắt buộc, tối đa 250 ký tự)</span>
                </label>
                <input
                  type="text"
                  maxLength={250}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Kỹ thuật xây dựng Prompt Engineering chuẩn hoá cho Doanh nghiệp"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Cấp độ / Loại bài <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={lessonType}
                    onChange={(e) => setLessonType(e.target.value as LmsLessonType)}
                    className="form-control-sm w-full text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="TYPE_A">Loại A - Cơ sở (Đại chúng)</option>
                    <option value="TYPE_B">Loại B - Chuyên sâu (Doanh nghiệp)</option>
                    <option value="TYPE_B_PLUS">Loại B+ - Nâng cao (Chuyên gia)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Ngành công nghiệp BACLINK
                  </label>
                  <select
                    value={sectorCode}
                    onChange={(e) => setSectorCode(e.target.value)}
                    className="form-control-sm w-full text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="IND_ELEC">IND_ELEC — Điện tử, Bán dẫn &amp; Thiết bị điện</option>
                    <option value="IND_MECH">IND_MECH — Cơ khí chính xác, Khuôn mẫu &amp; Chế tạo máy</option>
                    <option value="IND_AUTO">IND_AUTO — Tự động hóa, Robot &amp; Smart Factory</option>
                    <option value="IND_PLAS">IND_PLAS — Nhựa kỹ thuật, Bao bì &amp; Hóa chất công nghiệp</option>
                    <option value="IND_MAT">IND_MAT — Vật liệu mới &amp; Công nghiệp hỗ trợ</option>
                    <option value="IND_IT">IND_IT — CNTT, Phần mềm công nghiệp &amp; MES/ERP</option>
                    <option value="IND_GREEN">IND_GREEN — Công nghiệp xanh, Năng lượng sạch &amp; ESG</option>
                    <option value="IND_LOG">IND_LOG — Logistics công nghiệp, Kho vận &amp; Chuỗi cung ứng</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Thời lượng (phút) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                    className="form-control-sm w-full px-3.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* TỆP VIDEO & AUTO THUMBNAIL */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-brand-600" />
                    <span>Tệp Video bài giảng (.mp4 &le; 1GB)</span>
                  </div>
                  {videoStorageKey && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Đã sẵn sàng phát trực tuyến
                    </span>
                  )}
                </div>

                {videoStorageKey ? (
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex items-center gap-3 truncate">
                      <Film className="w-8 h-8 text-brand-600 shrink-0" />
                      <div className="truncate">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                          {videoFileName || "video-bai-giang.mp4"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {videoFileSize ? `${(videoFileSize / (1024 * 1024)).toFixed(1)} MB` : "Video HD"}
                        </div>
                      </div>
                    </div>
                    <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition shrink-0 dark:bg-slate-800 dark:text-slate-300">
                      Thay thế video
                      <input
                        type="file"
                        accept="video/mp4"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center space-y-3">
                    {videoUploadPercent !== null ? (
                      <div className="space-y-3 max-w-sm mx-auto">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Đang tải video lên máy chủ: {videoUploadPercent}%
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="bg-brand-600 h-2 rounded-full transition-all duration-150"
                            style={{ width: `${videoUploadPercent}%` }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleCancelVideoUpload}
                          className="text-xs text-rose-600 font-semibold hover:underline"
                        >
                          Hủy bỏ tải lên
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                        <div>
                          <label className="cursor-pointer text-sm font-bold text-brand-600 hover:underline">
                            Nhấn để chọn tệp video .mp4
                            <input
                              type="file"
                              accept="video/mp4"
                              onChange={handleVideoUpload}
                              className="hidden"
                            />
                          </label>
                          <p className="text-xs text-slate-400 mt-1">
                            Hỗ trợ chuẩn nén H.264/MP4, tối đa 1.073.741.824 bytes (1GB)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* THUMBNAIL PREVIEW */}
                {thumbnailUrl && (
                  <div className="flex items-center gap-4 pt-2">
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail Preview"
                      className="w-28 h-16 object-cover rounded-xl border border-slate-200 shadow-xs"
                    />
                    <div className="text-xs text-slate-500">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        Ảnh đại diện (Thumbnail)
                      </div>
                      <div>Tự động trích xuất từ khung hình giây 2.0 của video</div>
                    </div>
                  </div>
                )}
              </div>

              {/* GIẢNG VIÊN CHUYÊN GIA */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Chuyên gia giảng dạy (Tối đa 10 người)
                  </label>
                  <span className="text-xs text-slate-400">{instructors.length}/10</span>
                </div>

                {/* Danh sách đã chọn */}
                <div className="space-y-2">
                  {instructors.map((inst, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono text-slate-400">#{idx + 1}</span>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <span>{inst.fullName}</span>
                            {inst.isLead && (
                              <span className="px-1.5 py-0.5 rounded bg-brand-100 text-brand-800 text-[10px] font-bold">
                                Chủ nhiệm
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {inst.degree ? `${inst.degree} — ` : ""}
                            {inst.organization || "Chuyên gia độc lập"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!inst.isLead && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = instructors.map((item, i) => ({
                                ...item,
                                isLead: i === idx,
                              }));
                              setInstructors(updated);
                            }}
                            className="text-xs text-brand-600 hover:underline"
                          >
                            Đặt làm chủ nhiệm
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveInstructor(idx)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tìm kiếm thêm chuyên gia */}
                {instructors.length < 10 && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm chuyên gia theo họ tên từ hệ thống..."
                      value={instructorQuery}
                      onChange={(e) => setInstructorQuery(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                    />
                    {searchingInstructor && (
                      <span className="absolute right-3 top-2 text-xs text-slate-400">
                        Đang tìm...
                      </span>
                    )}
                    {instructorOptions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {instructorOptions.map((opt) => (
                          <div
                            key={opt.expertProfileId}
                            onClick={() => handleSelectInstructor(opt)}
                            className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-800 dark:text-slate-200">
                                {opt.fullName}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {opt.degree ? `${opt.degree} • ` : ""}
                                {opt.organization || "Cố vấn kỹ thuật BACLINK"}
                              </div>
                            </div>
                            <span className="text-brand-600 font-semibold">+ Thêm</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* MÔ TẢ RICH TEXT / HTML */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Giới thiệu tổng quan bài giảng
                </label>
                <textarea
                  rows={4}
                  value={descriptionHtml}
                  onChange={(e) => setDescriptionHtml(e.target.value)}
                  placeholder="Mô tả mục tiêu kiến thức, đối tượng người học và kết quả đạt được..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* ===================== TAB B ===================== */}
          {activeTab === "B" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-brand-600" />
                    Bộ câu hỏi tự kiểm tra trắc nghiệm 4 đáp án (Tối đa 10 câu)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cung cấp cho học viên sau khi xem xong video để củng cố tri thức
                  </p>
                </div>
                <button
                  type="button"
                  disabled={quizQuestions.length >= 10}
                  onClick={handleAddQuizQuestion}
                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm câu hỏi ({quizQuestions.length}/10)
                </button>
              </div>

              {quizQuestions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-400">Chưa có câu hỏi nào. Nhấn &ldquo;Thêm câu hỏi&rdquo; để bắt đầu.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizQuestions.map((q, idx) => {
                    const hasLengthDisparity = checkOptionLengthDisparity(q);

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition ${
                          hasLengthDisparity
                            ? "bg-amber-50/40 border-amber-300 dark:bg-amber-950/20 dark:border-amber-700"
                            : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {/* Header câu hỏi */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Câu hỏi #{idx + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveQuestion(idx, "up")}
                              className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-20"
                              title="Di chuyển lên"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === quizQuestions.length - 1}
                              onClick={() => handleMoveQuestion(idx, "down")}
                              className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-20"
                              title="Di chuyển xuống"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(idx)}
                              className="p-1 text-slate-400 hover:text-rose-500 ml-2"
                              title="Xóa câu hỏi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Nội dung câu hỏi */}
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Nhập nội dung câu hỏi..."
                            value={q.question}
                            onChange={(e) => handleUpdateQuizQuestion(idx, { question: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          />

                          {/* 4 Phương án */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {(["A", "B", "C", "D"] as const).map((optKey) => {
                              const propKey = `option${optKey}` as keyof QuizQuestionDto;
                              const isCorrect = q.correctOption === optKey;

                              return (
                                <div
                                  key={optKey}
                                  className={`flex items-center gap-2 p-2 rounded-xl border ${
                                    isCorrect
                                      ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40"
                                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`correct-${idx}`}
                                    checked={isCorrect}
                                    onChange={() => handleUpdateQuizQuestion(idx, { correctOption: optKey })}
                                    className="text-emerald-600 focus:ring-emerald-500"
                                    title="Đánh dấu đáp án đúng"
                                  />
                                  <span className="font-bold text-slate-600 dark:text-slate-300">
                                    {optKey}:
                                  </span>
                                  <input
                                    type="text"
                                    placeholder={`Phương án ${optKey}...`}
                                    value={(q[propKey] as string) || ""}
                                    onChange={(e) =>
                                      handleUpdateQuizQuestion(idx, { [propKey]: e.target.value })
                                    }
                                    className="flex-1 bg-transparent border-none focus:outline-none text-xs dark:text-white"
                                  />
                                </div>
                              );
                            })}
                          </div>

                          {/* Cảnh báo vàng BR-EL-04 */}
                          {hasLengthDisparity && (
                            <div className="p-2.5 bg-amber-100/70 border border-amber-300 rounded-xl text-[11px] text-amber-900 flex items-center gap-1.5 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>
                                <strong>Cảnh báo (BR-EL-04):</strong> Độ dài giữa các phương án chênh lệch lớn hơn 2 lần. Điều này có thể vô tình gợi ý đáp án cho người học.
                              </span>
                            </div>
                          )}

                          {/* Giải thích đáp án */}
                          <input
                            type="text"
                            placeholder="Giải thích ngắn gọn lý do đáp án đúng (hiển thị khi rà soát)..."
                            value={q.explanation || ""}
                            onChange={(e) => handleUpdateQuizQuestion(idx, { explanation: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-500 italic dark:text-slate-400"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB C ===================== */}
          {activeTab === "C" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand-600" />
                  Học liệu & Tài liệu đính kèm (3 Khối độc lập)
                </h3>
                <p className="text-xs text-slate-400">
                  Tài liệu tải về cho người học thực hành và ôn tập
                </p>
              </div>

              {/* KHỐI 1: CÔNG CỤ THỰC HÀNH */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    1. Công cụ thực hành (.docx, .pdf &le; 10MB, tối đa 10 tệp)
                  </span>
                  <label className="cursor-pointer px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition">
                    + Tải tệp lên
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      disabled={uploadingAttachment}
                      onChange={(e) => handleUploadAttachment(e, "PRACTICE_TOOL")}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="space-y-1.5">
                  {attachments
                    .filter((a) => a.category === "PRACTICE_TOOL")
                    .map((att, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      >
                        <span className="truncate max-w-sm font-medium">{att.fileName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-mono text-[11px]">
                            {(att.fileSize / 1024).toFixed(0)} KB
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(attachments.indexOf(att))}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* KHỐI 2: PHIẾU TÓM TẮT BÀI GIẢNG */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    2. Phiếu tóm tắt slide bài giảng (.pdf &le; 10MB, tối đa 1 tệp)
                  </span>
                  {attachments.filter((a) => a.category === "SUMMARY_SLIDE").length === 0 && (
                    <label className="cursor-pointer px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition">
                      + Tải tệp lên
                      <input
                        type="file"
                        accept=".pdf"
                        disabled={uploadingAttachment}
                        onChange={(e) => handleUploadAttachment(e, "SUMMARY_SLIDE")}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="space-y-1.5">
                  {attachments
                    .filter((a) => a.category === "SUMMARY_SLIDE")
                    .map((att, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      >
                        <span className="truncate max-w-sm font-medium">{att.fileName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-mono text-[11px]">
                            {(att.fileSize / 1024).toFixed(0)} KB
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(attachments.indexOf(att))}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* KHỐI 3: TÀI LIỆU KHÁC */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    3. Tài liệu tham khảo khác (.pdf, .docx, .pptx &le; 25MB, tối đa 10 tệp)
                  </span>
                  <label className="cursor-pointer px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition">
                    + Tải tệp lên
                    <input
                      type="file"
                      accept=".pdf,.docx,.pptx"
                      disabled={uploadingAttachment}
                      onChange={(e) => handleUploadAttachment(e, "OTHER_DOCUMENT")}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="space-y-1.5">
                  {attachments
                    .filter((a) => a.category === "OTHER_DOCUMENT")
                    .map((att, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      >
                        <span className="truncate max-w-sm font-medium">{att.fileName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-mono text-[11px]">
                            {(att.fileSize / 1024).toFixed(0)} KB
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(attachments.indexOf(att))}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB D ===================== */}
          {activeTab === "D" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-brand-600" />
                    Liên kết dữ liệu BACLINK (Tối đa 5 liên kết)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kết nối trực tiếp tới Sản phẩm năng lực hội viên, Nhu cầu đặt hàng hoặc Hồ sơ cố vấn kỹ thuật
                  </p>
                </div>
                <button
                  type="button"
                  disabled={dbLinks.length >= 5}
                  onClick={handleAddDbLink}
                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm liên kết ({dbLinks.length}/5)
                </button>
              </div>

              {dbLinks.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-400">Chưa có liên kết dữ liệu BACLINK nào.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dbLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Liên kết #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDbLink(idx)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Tiêu đề hiển thị..."
                          value={link.title}
                          onChange={(e) => handleUpdateDbLink(idx, { title: e.target.value })}
                          className="form-control-sm w-full bg-white dark:bg-slate-900 rounded-xl focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Đường dẫn URL (https://...)..."
                          value={link.url}
                          onChange={(e) => handleUpdateDbLink(idx, { url: e.target.value })}
                          className="form-control-sm w-full bg-white dark:bg-slate-900 rounded-xl focus:outline-none"
                        />
                        <select
                          value={link.targetType || "TECHNOLOGY_ASSET"}
                          onChange={(e) => handleUpdateDbLink(idx, { targetType: e.target.value })}
                          className="form-control-sm w-full bg-white dark:bg-slate-900 rounded-xl focus:outline-none"
                        >
                          <option value="TECHNOLOGY_ASSET">Cung công nghệ (TRL)</option>
                          <option value="INNOVATION_DEMAND">Nhu cầu công nghệ</option>
                          <option value="EXPERT_CONSULTATION">Tư vấn chuyên gia</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Đóng
          </button>

          <div className="flex items-center gap-3">
            {/* Nút Lưu Nháp (BR-EL-01) */}
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit("DRAFT")}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
            >
              Lưu bản nháp
            </button>

            {/* Nút Xuất Bản Công Khai */}
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit("PUBLISHED")}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{materialId ? "Cập nhật & Công khai" : "Xuất bản bài học ngay"}</span>
            </button>
          </div>
        </div>

        {/* CẢNH BÁO POPUP CHUYỂN VỀ NHÁP (BR-EL-03) */}
        {showDraftWarningConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Cảnh báo chuyển về Nháp (BR-EL-03)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Học liệu này hiện đang ở trạng thái <strong>Công khai</strong>. Việc chuyển về <strong>Bản nháp</strong> sẽ làm bài học tạm thời bị ẩn khỏi Cổng học tập công khai đối với tất cả học viên và dọn dẹp vector AI trợ lý. Bạn có chắc chắn muốn tiếp tục?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDraftWarningConfirm(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingDraftSubmit(true);
                    handleSubmit("DRAFT");
                  }}
                  className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow"
                >
                  Xác nhận chuyển về Nháp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
