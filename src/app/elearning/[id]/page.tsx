"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Sparkles,
  Award,
  BookOpen,
  Film,
  HelpCircle,
  FileText,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Download,
  ExternalLink,
  MessageSquare,
  Edit,
  ShieldAlert,
  Play,
  RotateCw,
} from "lucide-react";
import { Async, type AsyncState } from "@/components/ui/async";
import {
  fetchLmsCatalogDetail,
  recordLearnerProgress,
  getLearnerProgress,
  submitQuizAttempt,
  type LmsMaterialDetailDto,
  type LearnerProgressDto,
  type QuizAttemptResultDto,
  type LmsLessonType,
} from "@/lib/api/lms";
import { authClient, ROLES } from "@/lib/auth-client";
import { LmsMaterialFormModal } from "@/components/lms/LmsMaterialFormModal";

const LESSON_TYPE_LABELS: Record<LmsLessonType, { label: string; badgeClass: string }> = {
  TYPE_A: {
    label: "Loại A - Cơ sở",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900",
  },
  TYPE_B: {
    label: "Loại B - Chuyên sâu",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900",
  },
  TYPE_B_PLUS: {
    label: "Loại B+ - Nâng cao",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900",
  },
};

type DetailTabKey = "overview" | "video" | "quiz" | "documents" | "links";

export default function ElearningDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [material, setMaterial] = useState<LmsMaterialDetailDto | null>(null);
  const [progress, setProgress] = useState<LearnerProgressDto | null>(null);
  const [asyncState, setAsyncState] = useState<AsyncState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [activeTab, setActiveTab] = useState<DetailTabKey>("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // User auth
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Quiz interactive state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizAttemptResultDto | null>(null);
  const [quizMode, setQuizMode] = useState<"take" | "review">("take"); // 'review' cho Admin/Author hoặc sau khi nộp

  // Video progress throttle
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastRecordedTime = useRef<number>(0);

  useEffect(() => {
    const user = authClient.getUser();
    if (user) {
      setCurrentUserRole(user.role?.toUpperCase() || null);
      setCurrentUserId(user.id || null);
    }
  }, []);

  const loadMaterial = useCallback(async () => {
    if (!id) return;
    setAsyncState("loading");
    setErrorMessage("");
    try {
      const data = await fetchLmsCatalogDetail(id);
      setMaterial(data);

      // Tải tiến độ học tập nếu đã đăng nhập
      try {
        const prog = await getLearnerProgress(id);
        setProgress(prog);
      } catch {
        // Học viên chưa đăng nhập hoặc chưa có tiến độ
      }

      setAsyncState("success");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Không thể tải chi tiết học liệu.");
      setAsyncState("error");
    }
  }, [id]);

  useEffect(() => {
    loadMaterial();
  }, [loadMaterial]);

  // Video time update event handler
  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || !id) return;
    const current = Math.floor(videoRef.current.currentTime);
    // Ghi nhận tiến độ mỗi 15 giây
    if (current - lastRecordedTime.current >= 15) {
      lastRecordedTime.current = current;
      recordLearnerProgress(id, current)
        .then(() => {
          if (material && material.durationMinutes > 0) {
            const totalSec = material.durationMinutes * 60;
            const pct = Math.min(100, Math.round((current / totalSec) * 100));
            setProgress({
              learningMaterialId: id,
              watchedSeconds: current,
              progressPercent: pct,
              isCompleted: pct >= 90,
              lastAccessedAt: new Date().toISOString(),
            });
          }
        })
        .catch(() => {});
    }
  };

  // Submit Quiz Answers
  const handleSubmitQuiz = async () => {
    if (!id) return;
    setSubmittingQuiz(true);
    try {
      const res = await submitQuizAttempt(id, quizAnswers);
      setQuizResult(res);
      setQuizMode("review");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Nộp bài kiểm tra thất bại.");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers({});
    setQuizResult(null);
    setQuizMode("take");
  };

  const isAuthorOrAdmin =
    currentUserRole === ROLES.SUPER_ADMIN ||
    currentUserRole === ROLES.ADMIN ||
    (currentUserRole === ROLES.VERIFIED_EXPERT && currentUserId === material?.createdBy);

  const leadInstructor = material?.instructors.find((i) => i.isLead) || material?.instructors[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* 1. BANNER ĐỎ LÝ DO GỠ BÀI (KHÔNG THỂ ĐÓNG - US-EL-03, US-EL-05) */}
      {material?.status === "UNPUBLISHED" && (
        <div className="bg-rose-600 text-white px-4 py-3 shadow-md">
          <div className="max-w-7xl mx-auto flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="font-bold uppercase tracking-wide">
                Học liệu này đã được gỡ bỏ khỏi Cổng công khai
              </div>
              <div>
                <strong>Lý do gỡ bài kiểm toán:</strong> &ldquo;
                {material.unpublishReason || "Cập nhật và rà soát chuyên môn định kỳ"}
                &rdquo;
              </div>
              {material.unpublishedAt && (
                <div className="text-[11px] text-rose-200">
                  Thời gian thực hiện: {new Date(material.unpublishedAt).toLocaleString("vi-VN")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR / NAVIGATION */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/elearning"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Cổng học liệu số</span>
          </Link>

          {isAuthorOrAdmin && (
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-900 transition"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Chỉnh sửa học liệu</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Async
          state={asyncState}
          onRetry={loadMaterial}
          errorMessage={errorMessage}
          loadingSkeleton={
            <div className="space-y-6 animate-pulse">
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            </div>
          }
        >
          {material && (
            <div className="space-y-8">
              {/* HEADER INFO */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {material.materialCode}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                      LESSON_TYPE_LABELS[material.lessonType]?.badgeClass || "bg-slate-100"
                    }`}
                  >
                    {LESSON_TYPE_LABELS[material.lessonType]?.label || material.lessonType}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Lĩnh vực: {material.sectorCode}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {material.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Thời lượng: {material.durationMinutes} phút</span>
                  </div>
                  <div>
                    Ngày cập nhật: {new Date(material.updatedAt).toLocaleDateString("vi-VN")}
                  </div>
                  <div>Phiên bản: v{material.version}.0</div>
                </div>
              </div>

              {/* PROGRESS BAR NẾU ĐÃ HỌC */}
              {progress && (
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Tiến độ học tập của bạn
                    </span>
                    <span className="text-brand-600 font-mono">{progress.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progressPercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 text-right">
                    Đã xem {Math.floor(progress.watchedSeconds / 60)} phút / {material.durationMinutes} phút
                  </div>
                </div>
              )}

              {/* GRID 2 CỘT: PLAYER & THẺ CHUYÊN GIA */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CỘT TRÁI (2 PHẦN): VIDEO PLAYER HOẶC BANNER */}
                <div className="lg:col-span-2 space-y-6">
                  {/* VIDEO PLAYER HTTP 206 */}
                  <div className="bg-black rounded-3xl overflow-hidden shadow-xl aspect-video relative flex items-center justify-center">
                    {(() => {
                      const videoSrc =
                        material.videoDownloadUrl ||
                        (material.videoStorageKey
                          ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/files/${material.videoStorageKey}`
                          : null);

                      return videoSrc ? (
                        <video
                          ref={videoRef}
                          controls
                          playsInline
                          poster={material.thumbnailUrl || undefined}
                          onTimeUpdate={handleVideoTimeUpdate}
                          src={videoSrc}
                          className="w-full h-full object-contain"
                        >
                          Trình duyệt của bạn không hỗ trợ phát thẻ video HTML5.
                        </video>
                      ) : (
                        <div className="text-center p-8 space-y-3">
                          <Film className="w-12 h-12 text-slate-600 mx-auto" />
                          <p className="text-xs text-slate-400">
                            Video bài giảng đang được đồng bộ và xử lý lưu trữ.
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 5 TABS NỘI DUNG CHI TIẾT */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    {/* Tabs Header */}
                    <div className="flex items-center px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 overflow-x-auto">
                      {(
                        [
                          { key: "overview", label: "Tổng quan", icon: BookOpen },
                          {
                            key: "quiz",
                            label: `Câu hỏi tự kiểm tra (${material.quizQuestions.length})`,
                            icon: HelpCircle,
                          },
                          {
                            key: "documents",
                            label: `Tài liệu (${material.attachments.length})`,
                            icon: FileText,
                          },
                          {
                            key: "links",
                            label: `Liên kết CSDL (${material.dbLinks.length})`,
                            icon: LinkIcon,
                          },
                        ] as const
                      ).map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                          <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`py-4 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                              isActive
                                ? "border-brand-600 text-brand-600 dark:text-brand-400"
                                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Tabs Body */}
                    <div className="p-6">
                      {/* TAB 1: TỔNG QUAN */}
                      {activeTab === "overview" && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                              Giới thiệu bài giảng
                            </h3>
                            {material.descriptionHtml ? (
                              <div
                                className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 prose dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: material.descriptionHtml }}
                              />
                            ) : (
                              <p className="text-xs text-slate-400 italic">
                                Bài giảng chưa có mô tả chi tiết.
                              </p>
                            )}
                          </div>

                          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div className="space-y-1">
                              <span className="text-slate-400">Hình thức học:</span>
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                Trực tuyến (Video HD)
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-slate-400">Đánh giá năng lực:</span>
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                Trắc nghiệm tương tác
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-slate-400">Cấp độ học tập:</span>
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                {LESSON_TYPE_LABELS[material.lessonType]?.label || material.lessonType}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-slate-400">Đào tạo AI NacenTwin:</span>
                              <div className="font-semibold text-amber-600 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" /> Có (pgvector 1024d)
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: CÂU HỎI TỰ KIỂM TRA (CHẾ ĐỘ KÉP - US-EL-03, US-EL-04) */}
                      {activeTab === "quiz" && (
                        <div className="space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Bài kiểm tra trắc nghiệm củng cố kiến thức
                              </h3>
                              <p className="text-xs text-slate-500">
                                Hoàn thành tối thiểu 80% câu trả lời đúng để vượt qua bài học
                              </p>
                            </div>

                            {/* TOGGLE CHẾ ĐỘ RÀ SOÁT ĐÁP ÁN CHO ADMIN/EXPERT */}
                            {isAuthorOrAdmin && (
                              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => setQuizMode("take")}
                                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                                    quizMode === "take"
                                      ? "bg-white text-brand-700 shadow-xs dark:bg-slate-700 dark:text-white"
                                      : "text-slate-500 hover:text-slate-800"
                                  }`}
                                >
                                  Làm bài thử
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setQuizMode("review")}
                                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                                    quizMode === "review"
                                      ? "bg-white text-brand-700 shadow-xs dark:bg-slate-700 dark:text-white"
                                      : "text-slate-500 hover:text-slate-800"
                                  }`}
                                >
                                  Rà soát đáp án
                                </button>
                              </div>
                            )}
                          </div>

                          {/* KẾT QUẢ NỘP BÀI */}
                          {quizResult && (
                            <div
                              className={`p-5 rounded-2xl border flex items-center justify-between ${
                                quizResult.passed
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-200"
                                  : "bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-200"
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="text-sm font-bold flex items-center gap-2">
                                  {quizResult.passed ? (
                                    <>
                                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                                      <span>Chúc mừng! Bạn đã hoàn thành xuất sắc bài kiểm tra</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-5 h-5 text-rose-600" />
                                      <span>Bạn chưa đạt điểm tối thiểu (yêu cầu &ge; 80%)</span>
                                    </>
                                  )}
                                </div>
                                <div className="text-xs">
                                  Đúng {quizResult.correctAnswers} / {quizResult.totalQuestions} câu hỏi (Điểm số: {quizResult.scorePercent}%)
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={handleRetakeQuiz}
                                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700"
                              >
                                Làm lại bài
                              </button>
                            </div>
                          )}

                          {/* DANH SÁCH CÂU HỎI */}
                          {material.quizQuestions.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">
                              Chưa có câu hỏi tự kiểm tra cho bài giảng này.
                            </p>
                          ) : (
                            <div className="space-y-6">
                              {material.quizQuestions.map((q, idx) => {
                                const qId = q.id || `q-${idx}`;
                                const selectedOption = quizAnswers[qId];

                                return (
                                  <div
                                    key={qId}
                                    className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3"
                                  >
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                                      Câu {idx + 1}: {q.question}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                      {(["A", "B", "C", "D"] as const).map((optKey) => {
                                        const optText = q[`option${optKey}` as keyof typeof q] as string;
                                        if (!optText) return null;

                                        const isSelected = selectedOption === optKey;
                                        const isCorrectAnswer =
                                          quizMode === "review" && q.correctOption === optKey;

                                        return (
                                          <div
                                            key={optKey}
                                            onClick={() => {
                                              if (quizMode === "take") {
                                                setQuizAnswers({
                                                  ...quizAnswers,
                                                  [qId]: optKey,
                                                });
                                              }
                                            }}
                                            className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-2.5 ${
                                              isCorrectAnswer
                                                ? "bg-emerald-100/80 border-emerald-500 font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                                                : isSelected
                                                ? "bg-brand-50 border-brand-500 font-bold text-brand-900 dark:bg-brand-950 dark:text-brand-200"
                                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                            }`}
                                          >
                                            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0">
                                              {optKey}
                                            </span>
                                            <span className="flex-1">{optText}</span>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* LỜI GIẢI THÍCH (NẾU Ở CHẾ ĐỘ REVIEW VÀ CÓ GIẢI THÍCH) */}
                                    {quizMode === "review" && q.explanation && (
                                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 dark:bg-blue-950/60 dark:border-blue-900 dark:text-blue-200">
                                        <strong>Giải thích chuyên gia:</strong> {q.explanation}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {quizMode === "take" && (
                                <div className="pt-4 flex justify-end">
                                  <button
                                    type="button"
                                    disabled={
                                      submittingQuiz ||
                                      Object.keys(quizAnswers).length < material.quizQuestions.length
                                    }
                                    onClick={handleSubmitQuiz}
                                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    {submittingQuiz
                                      ? "Đang chấm điểm..."
                                      : `Nộp bài làm (${Object.keys(quizAnswers).length}/${material.quizQuestions.length})`}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 3: TÀI LIỆU ĐÍNH KÈM */}
                      {activeTab === "documents" && (
                        <div className="space-y-6">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Tài liệu & Công cụ học tập đính kèm
                          </h3>

                          {material.attachments.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">
                              Không có tài liệu đính kèm cho bài học này.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {material.attachments.map((att, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl"
                                >
                                  <div className="flex items-center gap-3 truncate">
                                    <div className="p-2 bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 rounded-xl shrink-0">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="truncate">
                                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {att.fileName}
                                      </div>
                                      <div className="text-[11px] text-slate-400">
                                        {att.category === "PRACTICE_TOOL"
                                          ? "Công cụ thực hành"
                                          : att.category === "SUMMARY_SLIDE"
                                          ? "Phiếu tóm tắt bài giảng"
                                          : "Tài liệu tham khảo"}{" "}
                                        • {(att.fileSize / 1024).toFixed(0)} KB
                                      </div>
                                    </div>
                                  </div>

                                  <a
                                    href={att.downloadUrl || `#`}
                                    target="_blank"
                                    rel="noreferrer"
                                    download={att.fileName}
                                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-brand-600 hover:bg-slate-50 shadow-xs flex items-center gap-1.5 shrink-0 dark:bg-slate-800 dark:border-slate-700 dark:text-brand-400"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Tải về</span>
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 4: LIÊN KẾT CSDL */}
                      {activeTab === "links" && (
                        <div className="space-y-6">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Liên kết Cơ sở dữ liệu NacenTech
                          </h3>

                          {material.dbLinks.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">
                              Chưa có liên kết cơ sở dữ liệu cho bài học này.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {material.dbLinks.map((link, i) => (
                                <a
                                  key={i}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-brand-500 transition shadow-xs"
                                >
                                  <div className="space-y-1">
                                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition flex items-center gap-2">
                                      <span>{link.title}</span>
                                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600" />
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-mono">
                                      {link.url}
                                    </div>
                                  </div>
                                  <span className="text-xs font-semibold px-2 py-1 rounded-md bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950 dark:text-brand-300 dark:border-brand-900">
                                    {link.targetType || "CSDL"}
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CỘT PHẢI (1 PHẦN): THẺ CHUYÊN GIA GIẢNG DẠY (HOME1 R50) */}
                <div className="space-y-6">
                  {leadInstructor && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Chuyên gia giảng dạy chính
                      </div>

                      <div className="flex items-center gap-4">
                        {leadInstructor.avatarUrl ? (
                          <img
                            src={leadInstructor.avatarUrl}
                            alt={leadInstructor.fullName}
                            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center text-xl font-bold shadow-xs">
                            {leadInstructor.fullName[0]}
                          </div>
                        )}
                        <div>
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                            {leadInstructor.fullName}
                          </h3>
                          <div className="text-xs text-slate-500 font-medium">
                            {leadInstructor.degree || "Chuyên gia KH&CN"}
                          </div>
                          <div className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-0.5">
                            {leadInstructor.organization || "NacenTech"}
                          </div>
                        </div>
                      </div>

                      {/* NÚT CTA GỬI YÊU CẦU TƯ VẤN (HOME1 R50) */}
                      <Link
                        href={
                          leadInstructor.expertProfileId
                            ? `/experts/${leadInstructor.expertProfileId}?action=consult`
                            : `/experts`
                        }
                        className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow-md transition flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-950" />
                        <span>Gửi Yêu Cầu Tư Vấn Chuyên Gia</span>
                      </Link>

                      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                        Kết nối trực tiếp 1-1 với Chuyên gia để được hướng dẫn chuyên sâu, thẩm định công nghệ và tư vấn giải pháp ĐMST.
                      </p>
                    </div>
                  )}

                  {/* THẺ ĐỒNG GIẢNG VIÊN (NẾU CÓ) */}
                  {material.instructors.length > 1 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Đồng giảng viên ({material.instructors.length - 1})
                      </div>
                      <div className="space-y-2">
                        {material.instructors
                          .filter((i) => !i.isLead)
                          .map((inst, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {inst.fullName}
                              </span>
                              <span className="text-slate-400">
                                {inst.organization ? `(${inst.organization})` : ""}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Async>
      </div>

      {/* MODAL SỬA BÀI HỌC */}
      {material && (
        <LmsMaterialFormModal
          isOpen={isEditModalOpen}
          materialId={material.id}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={loadMaterial}
        />
      )}
    </div>
  );
}
