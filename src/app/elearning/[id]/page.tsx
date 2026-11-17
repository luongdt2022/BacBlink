"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  Video,
  List,
  CheckSquare,
  Compass,
  Briefcase,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Send,
  PlusCircle,
  Eye,
  Info,
  Users
} from "lucide-react";
import { Async, type AsyncState } from "@/components/ui/async";
import {
  fetchLmsCatalogDetail,
  recordLearnerProgress,
  getLearnerProgress,
  submitQuizAttempt,
  submitPracticeEvaluation,
  parseLearningRoadmap,
  parseKnowledgeSummary,
  parsePracticeWorkbook,
  parseLearningObjectives,
  type LmsMaterialDetailDto,
  type LearnerProgressDto,
  type QuizAttemptResultDto,
  type PracticeEvaluationResultDto,
  type MicroVideoDto,
  type InVideoQuizDto,
} from "@/lib/api/lms";
import { authClient, ROLES } from "@/lib/auth-client";
import { LmsMaterialFormModal } from "@/components/lms/LmsMaterialFormModal";

type DetailTabKey = "overview" | "practice" | "quiz" | "summary" | "documents" | "certificate";

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

  // Playlist 3 Micro-Videos state
  const [activeVideoOrder, setActiveVideoOrder] = useState<number>(1);

  // In-Video Pop-up Quiz Modal state (BR-EL-07)
  const [activeQuizModal, setActiveQuizModal] = useState<InVideoQuizDto | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string>("");
  const [quizAnswerFeedback, setQuizAnswerFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [passedQuizzes, setPassedQuizzes] = useState<Record<string, boolean>>({});

  // Practice Rubric Self-Scoring state (BR-EL-08)
  const [rubricScores, setRubricScores] = useState<Record<number, number>>({});
  const [practiceNotes, setPracticeNotes] = useState<string>("");
  const [submittingRubric, setSubmittingRubric] = useState<boolean>(false);
  const [rubricResult, setRubricResult] = useState<PracticeEvaluationResultDto | null>(null);

  // Final Quiz (10 câu) state (BR-EL-09)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizAttemptResultDto | null>(null);
  const [quizMode, setQuizMode] = useState<"take" | "review">("take");

  // Essay hints reveal state (3 câu tự luận)
  const [revealedEssayHints, setRevealedEssayHints] = useState<Record<number, boolean>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>({});

  // FAQ Accordion open/close state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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

      try {
        const prog = await getLearnerProgress(id);
        setProgress(prog);
      } catch {
        // Chưa đăng nhập hoặc chưa có tiến độ
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

  // Parsed metadata helpers
  const roadmapMeta = useMemo(() => parseLearningRoadmap(material?.learningRoadmapJson), [material]);
  const objectives = useMemo(() => parseLearningObjectives(material?.learningObjectivesJson), [material]);
  const knowledgeSummary = useMemo(() => parseKnowledgeSummary(material?.knowledgeSummaryJson), [material]);
  const practiceWorkbook = useMemo(() => parsePracticeWorkbook(material?.practiceWorkbookJson), [material]);

  // Video time update event handler & In-video quiz trigger (BR-EL-07)
  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || !id) return;
    const current = Math.floor(videoRef.current.currentTime);

    // Kích hoạt Pop-up quiz tại triggerSeconds
    if (material?.inVideoQuizzes && material.inVideoQuizzes.length > 0) {
      const quizTrigger = material.inVideoQuizzes.find(
        (q) => q.triggerSeconds === current && !passedQuizzes[q.quizCode] && activeQuizModal?.quizCode !== q.quizCode
      );
      if (quizTrigger) {
        videoRef.current.pause();
        setActiveQuizModal(quizTrigger);
        setSelectedQuizOption("");
        setQuizAnswerFeedback(null);
      }
    }

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
              isCompleted: pct >= 80,
              lastAccessedAt: new Date().toISOString(),
            });
          }
        })
        .catch(() => {});
    }
  };

  // Submit in-video quiz answer (BR-EL-07)
  const handleAnswerInVideoQuiz = () => {
    if (!activeQuizModal || !selectedQuizOption) return;
    const rawCorrect = activeQuizModal.correctOption ? activeQuizModal.correctOption.trim().toUpperCase() : "";
    const correct = rawCorrect || "B";
    const userSelected = selectedQuizOption.toUpperCase();

    if (userSelected === correct) {
      setQuizAnswerFeedback({
        isCorrect: true,
        message: activeQuizModal.explanation || "Chính xác! Bạn đã hiểu đúng bài giảng."
      });
      setPassedQuizzes((prev) => ({ ...prev, [activeQuizModal.quizCode]: true }));
    } else {
      setQuizAnswerFeedback({
        isCorrect: false,
        message: "Chưa chính xác. Vui lòng đọc kỹ bài giảng và thử lại."
      });
    }
  };

  // Submit Rubric Self-Scoring (BR-EL-08)
  const totalRubricScore = useMemo(() => {
    return Object.values(rubricScores).reduce((a, b) => a + b, 0);
  }, [rubricScores]);

  const isRubricPassed = totalRubricScore >= 11;

  const handleSubmitRubricEvaluation = async () => {
    if (!id) return;
    setSubmittingRubric(true);
    try {
      const res = await submitPracticeEvaluation(id, {
        scores: rubricScores,
        notes: practiceNotes,
      });
      setRubricResult(res);
      alert(`Đã lưu kết quả tự đánh giá: ${res.totalScore}/${res.maxScore} điểm! ${res.isPassed ? "Đạt chuẩn xuất sắc (≥ 11/14), đã mở khóa 2 nút CTA kết nối!" : "Chưa đạt ngưỡng 11/14."}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lưu kết quả tự chấm thất bại.");
    } finally {
      setSubmittingRubric(false);
    }
  };

  // Submit Final Quiz (BR-EL-09)
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
    currentUserRole === ROLES.OPERATOR_ADMIN ||
    ((currentUserRole === ROLES.ENTERPRISE || currentUserRole === ROLES.VERIFIED_EXPERT || currentUserRole === ROLES.EXPERT) && currentUserId === material?.createdBy);

  const leadInstructor = material?.instructors.find((i) => i.isLead) || material?.instructors[0];

  const currentMicroVideo = useMemo(() => {
    if (!material?.microVideos || material.microVideos.length === 0) return null;
    return material.microVideos.find((v) => v.videoOrder === activeVideoOrder) || material.microVideos[0];
  }, [material, activeVideoOrder]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* 1. BANNER ĐỎ LÝ DO GỠ BÀI (NẾU UNPUBLISHED) */}
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
            </div>
          </div>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200 transition"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Chỉnh sửa học liệu</span>
            </button>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Async state={asyncState} errorMessage={errorMessage} onRetry={loadMaterial}>
          {material && (
            <>
              {/* 2. HEADER METADATA CHUẨN ĐÀO TẠO KỸ THUẬT BACLINK */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg font-mono text-xs font-black bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    {material.materialCode}
                  </span>
                  {material.clusterCode && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                      Cụm {material.clusterCode}: {material.clusterName}
                    </span>
                  )}
                  {roadmapMeta?.moduleCode && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
                      Mô-đun {roadmapMeta.moduleCode}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                    {material.durationMinutes >= 10 ? "Chuyên gia (CG)" : "Đồ họa (ĐH)"}
                  </span>
                  {roadmapMeta?.templateCodes && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {roadmapMeta.templateCodes.join(", ")}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {material.title}
                </h1>

                {material.descriptionHtml && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
                    {material.descriptionHtml.replace(/<[^>]*>?/gm, "")}
                  </p>
                )}

                {/* 3 Khung thông tin nghiệp vụ: Đối tượng - Chuẩn bị - Đầu ra */}
                {(material.targetAudience || material.preparationNotes || material.expectedOutcome) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {material.targetAudience && (
                      <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 space-y-1">
                        <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> Đối tượng học viên:
                        </div>
                        <div className="text-slate-600 dark:text-slate-300">{material.targetAudience}</div>
                      </div>
                    )}
                    {material.preparationNotes && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 space-y-1">
                        <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Chuẩn bị trước giờ học:
                        </div>
                        <div className="text-slate-600 dark:text-slate-300">{material.preparationNotes}</div>
                      </div>
                    )}
                    {material.expectedOutcome && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 space-y-1">
                        <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Kết quả đầu ra (Sản phẩm):
                        </div>
                        <div className="text-slate-600 dark:text-slate-300">{material.expectedOutcome}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. KHU VỰC PLAYLIST 3 MICRO-VIDEOS & POP-UP QUIZZES */}
              <div className="bg-slate-900 text-white rounded-3xl overflow-hidden shadow-xl border border-slate-800">
                {/* Thanh điều hướng 3 Micro-Videos */}
                <div className="bg-slate-950/80 px-6 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-brand-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Playlist 3 Micro-Videos:</span>
                    {currentMicroVideo && (
                      <span className="text-xs text-brand-300 font-semibold truncate max-w-xs sm:max-w-md">
                        — {currentMicroVideo.title}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {[1, 2, 3].map((num) => {
                      const mv = material.microVideos?.find((v) => v.videoOrder === num);
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setActiveVideoOrder(num)}
                          title={mv?.title || `Phần ${num}`}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                            activeVideoOrder === num
                              ? "bg-brand-600 text-white shadow-xs"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Video {material.materialCode.replace("EL-", "")}.{num}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Trình phát Video Player hoặc Giao diện chờ Chuyên gia upload */}
                <div className="p-6">
                  {material.videoDownloadUrl || material.videoStorageKey ? (
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden relative">
                      <video
                        ref={videoRef}
                        src={material.videoDownloadUrl || (material.videoStorageKey?.startsWith("http") ? material.videoStorageKey : `/files/${material.videoStorageKey}`)}
                        controls
                        onTimeUpdate={handleVideoTimeUpdate}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 text-center space-y-4">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Video className="w-7 h-7" />
                      </div>
                      <div className="space-y-1 max-w-xl mx-auto">
                        <h4 className="font-bold text-base text-white">
                          Trạng thái Video: Chờ Chuyên gia tải lên bài giảng .MP4
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                          Video bài giảng đang được đồng bộ và xử lý lưu trữ.
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Nội dung học thuật, Đề cương 3 Micro-Videos, Kịch bản phân cảnh (Call Sheet) và Câu hỏi tương tác Pop-up Quiz đã sẵn sàng 100%. Bạn có thể thực hành các câu hỏi tương tác và phiếu bài tập ngay bên dưới.
                        </p>
                      </div>

                      {/* Hiển thị phân cảnh Call sheet của video đang chọn */}
                      {currentMicroVideo && currentMicroVideo.scenes && currentMicroVideo.scenes.length > 0 && (
                        <div className="mt-4 text-left bg-slate-900/90 rounded-xl p-4 border border-slate-800 max-h-56 overflow-y-auto text-xs space-y-2">
                          <div className="font-bold text-brand-400 pb-1 border-b border-slate-800">
                            Kịch bản phân cảnh (Call Sheet) — {currentMicroVideo.title}
                          </div>
                          {currentMicroVideo.scenes.map((sc, i) => (
                            <div key={i} className="py-1 border-b border-slate-800/50 flex items-start gap-2">
                              <span className="font-mono font-bold text-amber-300 shrink-0">{sc.sceneCode}</span>
                              <span className="text-slate-400 shrink-0">[{sc.layout}]</span>
                              <div className="text-slate-200 flex-1">
                                <strong>{sc.sceneName}:</strong> {sc.slideContent} {sc.lectureScript && `— "${sc.lectureScript.slice(0, 80)}..."`}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Thanh Checkpoints Pop-up Quiz Q1-Q6 */}
                  {material.inVideoQuizzes && material.inVideoQuizzes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                        <HelpCircle className="w-4 h-4 text-purple-400" />
                        <span>Câu hỏi tương tác Pop-up Quiz (BR-EL-07):</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {material.inVideoQuizzes.map((quiz) => {
                          const isDone = passedQuizzes[quiz.quizCode];
                          return (
                            <button
                              key={quiz.quizCode}
                              type="button"
                              onClick={() => {
                                setActiveQuizModal(quiz);
                                setSelectedQuizOption("");
                                setQuizAnswerFeedback(null);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 border ${
                                isDone
                                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-600"
                                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                              }`}
                            >
                              <span>{quiz.quizCode}</span>
                              {isDone && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* MODAL POP-UP QUIZ TƯƠNG TÁC (BR-EL-07) */}
              {activeQuizModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          {activeQuizModal.quizCode}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Câu Hỏi Tương Tác Trong Video (BR-EL-07)
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveQuizModal(null)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3">
                      <p className="font-bold text-sm text-slate-900 dark:text-white leading-relaxed">
                        {activeQuizModal.questionText}
                      </p>

                      <div className="space-y-2">
                        {[
                          { key: "A", text: activeQuizModal.optionA },
                          { key: "B", text: activeQuizModal.optionB },
                          { key: "C", text: activeQuizModal.optionC },
                          { key: "D", text: activeQuizModal.optionD },
                        ].map((opt) => (
                          <label
                            key={opt.key}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition ${
                              selectedQuizOption === opt.key
                                ? "bg-purple-50 border-purple-500 text-purple-900 dark:bg-purple-950/50 dark:text-purple-200"
                                : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="popup-quiz-opt"
                              checked={selectedQuizOption === opt.key}
                              onChange={() => setSelectedQuizOption(opt.key)}
                              className="mt-0.5 text-purple-600 focus:ring-purple-500"
                            />
                            <span><strong>{opt.key}.</strong> {opt.text}</span>
                          </label>
                        ))}
                      </div>

                      {quizAnswerFeedback && (
                        <div className={`p-3 rounded-xl text-xs ${
                          quizAnswerFeedback.isCorrect
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300"
                        }`}>
                          <div className="font-bold mb-1">
                            {quizAnswerFeedback.isCorrect ? "✓ Chính xác! Bạn đã hiểu đúng bài giảng." : "✗ Chưa chính xác!"}
                          </div>
                          <div>{quizAnswerFeedback.message}</div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                      {quizAnswerFeedback?.isCorrect ? (
                        <button
                          type="button"
                          onClick={() => setActiveQuizModal(null)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                        >
                          Tiếp tục bài học
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!selectedQuizOption}
                          onClick={handleAnswerInVideoQuiz}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs transition"
                        >
                          Kiểm tra câu trả lời
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. HỆ THỐNG 6 TABS NỘI DUNG HỌC TẬP */}
              <div className="space-y-6">
                <div role="tablist" className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
                  {[
                    { key: "overview", label: "Tổng quan & Đề cương", icon: BookOpen },
                    { key: "practice", label: "Thực hành & Tự chấm (BR-EL-08)", icon: Award },
                    { key: "quiz", label: "Bài tập tự luyện (BR-EL-09)", icon: HelpCircle },
                    { key: "summary", label: "Tóm tắt & FAQs (8 câu)", icon: List },
                    { key: "documents", label: "Tài liệu cẩm nang", icon: FileText },
                    { key: "certificate", label: "Chứng nhận hoàn thành", icon: FileCheck },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        role="tab"
                        aria-selected={isActive}
                        type="button"
                        onClick={() => setActiveTab(tab.key as DetailTabKey)}
                        className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${
                          isActive
                            ? "border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400"
                            : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: TỔNG QUAN & ĐỀ CƯƠNG */}
                {activeTab === "overview" && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-brand-600" />
                        Mục Tiêu Sau Khi Hoàn Thành Bài Học
                      </h3>
                      {objectives.length > 0 ? (
                        <div className="space-y-2">
                          {objectives.map((obj, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                              <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span>{obj}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">Mục tiêu bài học được tích hợp trong phần Tóm tắt kiến thức.</p>
                      )}
                    </div>

                    {/* Metadata & 4 Vai trò chuyên gia */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Mạng Lưới Chuyên Gia Phụ Trách & 4 Vai Trò Hỗ Trợ
                      </h4>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-black text-sm flex items-center justify-center">
                            {(leadInstructor?.fullName || "NC").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white">
                              {leadInstructor?.fullName || "Chuyên gia ĐMST NacenTech"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {leadInstructor?.degree || "Chuyên gia cao cấp"} · {leadInstructor?.organization || "Viện Đổi mới sáng tạo Quốc gia"}
                            </div>
                          </div>
                        </div>

                        <Link
                          href="/experts"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Gửi yêu cầu tư vấn (R50)</span>
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                        {["Chuyên gia giảng dạy", "Phản biện học liệu", "Cố vấn (Mentor)", "Tư vấn theo yêu cầu"].map((role, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
                            ✓ {role}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: THỰC HÀNH (BM/TĐG) & BẢNG TỰ CHẤM (BR-EL-08) */}
                {activeTab === "practice" && (
                  <div className="space-y-6">
                    {/* BẢNG TỰ CHẤM ĐIỂM 7 TIÊU CHÍ (BR-EL-08) */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            Bảng Tự Chấm Điểm Thực Hành 7 Tiêu Chí (BR-EL-08)
                          </h3>
                          <p className="text-xs text-slate-500">
                            Thang điểm: 0 (Chưa đạt), 1 (Đạt một phần), 2 (Đạt đầy đủ). Ngưỡng đạt: <strong>≥ 11/14 điểm</strong> để mở khóa CTA kết nối.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-4 py-2 rounded-2xl font-black text-sm border flex items-center gap-1.5 ${
                            isRubricPassed
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200"
                          }`}>
                            <span>{`Điểm: ${totalRubricScore}/14`}</span>
                            <span>{isRubricPassed ? "✓ ĐẠT CHUẨN" : "• Chưa đạt (cần ≥ 11)"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Danh sách 7 tiêu chí */}
                      <div className="space-y-4">
                        {(material.practiceRubrics && material.practiceRubrics.length > 0 ? material.practiceRubrics : [
                          { criterionNumber: 1, criterionName: "1. Mục tiêu kinh doanh nêu rõ kết quả và đối tượng", descriptionScore0: "Chưa có", descriptionScore1: "Mới có một phần", descriptionScore2: "Có đầy đủ kết quả và đối tượng" },
                          { criterionNumber: 2, criterionName: "2. KPI định nghĩa rõ và có kế hoạch đo đường cơ sở", descriptionScore0: "Mơ hồ", descriptionScore1: "Thiếu một phần", descriptionScore2: "Đủ cách tính, kỳ, nguồn dữ liệu" },
                          { criterionNumber: 3, criterionName: "3. Bản đồ quy trình có đầu-cuối và trách nhiệm", descriptionScore0: "Không có", descriptionScore1: "Thiếu", descriptionScore2: "Rõ bước và người phụ trách" },
                          { criterionNumber: 4, criterionName: "4. Điểm nghẽn phân biệt dữ kiện và giả thuyết", descriptionScore0: "Khẳng định vô căn cứ", descriptionScore1: "Mới tách", descriptionScore2: "Tách rõ và có cách kiểm tra" },
                          { criterionNumber: 5, criterionName: "5. Câu bài toán không áp đặt giải pháp", descriptionScore0: "Chỉ nêu công nghệ", descriptionScore1: "Thiếu", descriptionScore2: "Đủ người, bước, trở ngại, KPI, ràng buộc" },
                          { criterionNumber: 6, criterionName: "6. Có ít nhất hai phương án và điều kiện sàng lọc", descriptionScore0: "Không có", descriptionScore1: "So sánh sơ bộ", descriptionScore2: "Có so sánh tác động, khả thi, dữ liệu" },
                          { criterionNumber: 7, criterionName: "7. Có thử nghiệm, người xác nhận và tiêu chí dừng", descriptionScore0: "Không xác định", descriptionScore1: "Thiếu", descriptionScore2: "Đủ ba nội dung" },
                        ]).map((rub) => {
                          const currentScore = rubricScores[rub.criterionNumber] ?? 0;
                          return (
                            <div key={rub.criterionNumber} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
                              <div className="font-bold text-xs text-slate-900 dark:text-white">
                                {rub.criterionName}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {[
                                  { score: 0, label: "0 điểm", desc: rub.descriptionScore0 },
                                  { score: 1, label: "1 điểm", desc: rub.descriptionScore1 },
                                  { score: 2, label: "2 điểm", desc: rub.descriptionScore2 },
                                ].map((opt) => (
                                  <button
                                    key={opt.score}
                                    type="button"
                                    onClick={() => setRubricScores((prev) => ({ ...prev, [rub.criterionNumber]: opt.score }))}
                                    className={`p-2.5 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                                      currentScore === opt.score
                                        ? "bg-brand-50 border-brand-500 text-brand-900 dark:bg-brand-950 dark:text-brand-200 font-bold shadow-xs"
                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                                    }`}
                                  >
                                    <div className="font-bold mb-1 flex items-center justify-between">
                                      <span>{opt.label}</span>
                                      {currentScore === opt.score && <CheckCircle className="w-3.5 h-3.5 text-brand-600" />}
                                    </div>
                                    <div className="text-xs leading-tight">{opt.desc}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <button
                          type="button"
                          disabled={submittingRubric}
                          onClick={handleSubmitRubricEvaluation}
                          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                        >
                          {submittingRubric ? "Đang lưu..." : "Lưu & Chấm điểm Tự đánh giá"}
                        </button>

                        {/* 2 NÚT CTA CHIẾN LƯỢC MỞ KHÓA KHI >= 11/14 (BR-EL-08) */}
                        {isRubricPassed && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href="/experts"
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition animate-pulse"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>Gửi Chuyên gia phản biện (R50)</span>
                            </Link>
                            <Link
                              href="/demands/create"
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition"
                            >
                              <PlusCircle className="w-4 h-4" />
                              <span>Tạo Hồ sơ Nhu cầu Công nghệ</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: BÀI TẬP TỰ LUYỆN (10 TRẮC NGHIỆM + 3 TỰ LUẬN, BR-EL-09) */}
                {activeTab === "quiz" && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
                    {/* Phần I: 10 câu trắc nghiệm */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Phần I: 10 Câu Hỏi Trắc Nghiệm Cuối Bài (BR-EL-09)
                          </h3>
                          <p className="text-xs text-slate-500">
                            Yêu cầu đạt: <strong>≥ 60%</strong> (6/10 câu đúng) để ghi nhận hoàn thành bài học.
                          </p>
                        </div>
                        {quizResult && (
                          <div className={`px-4 py-1.5 rounded-xl text-xs font-black border ${
                            quizResult.passed ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-rose-50 text-rose-800 border-rose-300"
                          }`}>
                            <span>{`Điểm: ${quizResult.scorePercent}% (${quizResult.correctAnswers}/${quizResult.totalQuestions}) — ${quizResult.passed ? "ĐẠT" : "CHƯA ĐẠT"}`}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        {material.quizQuestions.map((q, idx) => {
                          const selected = quizAnswers[q.id || `q-${idx}`];
                          const isReview = quizMode === "review";
                          return (
                            <div key={q.id || idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                              <div className="font-bold text-xs text-slate-900 dark:text-white">
                                Câu {idx + 1}: {q.question}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {[
                                  { key: "A", text: q.optionA },
                                  { key: "B", text: q.optionB },
                                  { key: "C", text: q.optionC },
                                  { key: "D", text: q.optionD },
                                ].map((opt) => (
                                  <button
                                    key={opt.key}
                                    type="button"
                                    disabled={isReview}
                                    onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id || `q-${idx}`]: opt.key }))}
                                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                                      selected === opt.key
                                        ? "bg-brand-50 border-brand-500 text-brand-900 font-bold"
                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700"
                                    }`}
                                  >
                                    <strong>{opt.key}.</strong> {opt.text}
                                  </button>
                                ))}
                              </div>
                              {isReview && q.explanation && (
                                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 text-xs">
                                  <strong>Giải thích:</strong> {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                        {quizMode === "review" ? (
                          <button
                            type="button"
                            onClick={handleRetakeQuiz}
                            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                          >
                            Làm lại bài kiểm tra
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={submittingQuiz || Object.keys(quizAnswers).length === 0}
                            onClick={handleSubmitQuiz}
                            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs"
                          >
                            {submittingQuiz ? "Đang nộp..." : "Nộp bài kiểm tra trắc nghiệm"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Phần II: 3 câu hỏi tự luận tình huống */}
                    <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          Phần II: Bài Tập Tự Luận Tình Huống Ngắn (3 Câu)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Thực hành trả lời ngắn dựa trên tình huống thực tế của doanh nghiệp và đối chiếu với gợi ý của Chuyên gia.
                        </p>
                      </div>

                      {[
                        { id: 1, title: "1. Viết một mục tiêu kinh doanh và chỉ số KPI có cách đo lường cụ thể", hint: "Mục tiêu: Nâng tỷ lệ giao hàng đúng hẹn. KPI: số đơn đúng hẹn / tổng đơn giao trong kỳ. Cần thống nhất giờ cam kết và nguồn dữ liệu thực tế." },
                        { id: 2, title: "2. Phân biệt triệu chứng quan sát được và giả thuyết nguyên nhân gốc", hint: "Triệu chứng: Hàng dồn ứ tại khâu đóng gói. Giả thuyết: Lịch giao hàng thay đổi liên tục nhưng không truyền đạt kịp; cần kiểm tra nhật ký máy để đối soát." },
                        { id: 3, title: "3. Phát biểu câu bài toán công nghệ không áp đặt giải pháp mua sắm", hint: "Bộ phận kế hoạch và xưởng đóng gói cần ghi nhận thay đổi lịch để giảm tỷ lệ hoàn tất trễ; thử nghiệm giải pháp chuẩn hóa quy trình trước khi mua phần mềm." }
                      ].map((essay) => (
                        <div key={essay.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                          <div className="font-bold text-xs text-slate-900 dark:text-white">
                            {essay.title}
                          </div>
                          <textarea
                            rows={3}
                            value={essayAnswers[essay.id] || ""}
                            onChange={(e) => setEssayAnswers((prev) => ({ ...prev, [essay.id]: e.target.value }))}
                            placeholder="Nhập câu trả lời thực hành của bạn tại đây..."
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                          />
                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={() => setRevealedEssayHints((prev) => ({ ...prev, [essay.id]: !prev[essay.id] }))}
                              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{revealedEssayHints[essay.id] ? "Ẩn gợi ý chuyên gia" : "Xem gợi ý đối chiếu của Chuyên gia"}</span>
                            </button>
                          </div>
                          {revealedEssayHints[essay.id] && (
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs border border-emerald-200 dark:border-emerald-800">
                              <strong>Gợi ý Chuyên gia:</strong> {essay.hint}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: TÓM TẮT & FAQS (8 CÂU) */}
                {activeTab === "summary" && (
                  <div className="space-y-6">
                    {/* Bảng Tóm tắt kiến thức */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-brand-600" />
                        Tóm Tắt Kiến Thức Cốt Lõi
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="px-4 py-2.5">Chủ đề</th>
                              <th className="px-4 py-2.5">Nội dung cốt lõi</th>
                              <th className="px-4 py-2.5">Ví dụ minh họa</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {knowledgeSummary.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white max-w-[150px]">{item.topic}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{item.content}</td>
                                <td className="px-4 py-3 text-slate-500 italic">{item.example || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 8 FAQs Accordion */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-purple-600" />
                        Hỏi Đáp Thường Gặp (8 FAQs)
                      </h3>
                      <div className="space-y-2">
                        {(material.faqs || []).map((faq, idx) => {
                          const isOpen = openFaqIndex === idx;
                          return (
                            <div key={idx} className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                className="w-full px-5 py-3.5 text-left text-xs font-bold text-slate-900 dark:text-white bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 flex items-center justify-between"
                              >
                                <span>{`${faq.questionNumber}. ${faq.questionText}`}</span>
                                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                              </button>
                              {isOpen && (
                                <div className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                                  {faq.answerText}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: TÀI LIỆU CẨM NANG (.PDF & .DOCX) */}
                {activeTab === "documents" && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Download className="w-5 h-5 text-emerald-600" />
                      Tài Liệu Cẩm Nang & Biểu Mẫu Tải Về Thực Tế
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {material.attachments.map((att) => (
                        <div key={att.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-900 dark:text-white">{att.fileName}</div>
                              <div className="text-xs text-slate-500 font-mono">
                                {(att.fileSize / 1024).toFixed(1)} KB · {att.category}
                              </div>
                            </div>
                          </div>
                          {att.downloadUrl && (
                            <a
                              href={att.downloadUrl}
                              download
                              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" /> Tải về
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 6: CHỨNG NHẬN HOÀN THÀNH */}
                {activeTab === "certificate" && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 text-center">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                      <Award className="w-8 h-8" />
                    </div>
                    <div className="space-y-2 max-w-lg mx-auto">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        Giấy Chứng Nhận Hoàn Thành Khóa Học Trực Tuyến
                      </h3>
                      <p className="text-xs text-slate-500">
                        Cấp bởi Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK) theo tiêu chuẩn đào tạo kỹ thuật công nghiệp.
                      </p>
                    </div>

                    <div className="max-w-md mx-auto p-6 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 space-y-3 text-xs">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        Điều kiện cấp chứng chỉ điện tử:
                      </div>
                      <div className="text-left space-y-1.5 text-slate-600 dark:text-slate-400">
                        <div>✓ Đạt trắc nghiệm cuối bài ≥ 60% ({quizResult?.passed ? "ĐÃ HOÀN THÀNH" : "Chưa hoàn thành"})</div>
                        <div>✓ Tự chấm thực hành đạt ≥ 11/14 điểm ({isRubricPassed ? "ĐÃ HOÀN THÀNH" : "Chưa hoàn thành"})</div>
                      </div>
                      <div className="pt-2 text-xs text-slate-400">
                        {quizResult?.passed && isRubricPassed ? (
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ✓ Mã xác thực trực tuyến: CERT-2026-{material.materialCode}-BACLINK (QR Verified)
                          </span>
                        ) : (
                          <span>Mã xác thực trực tuyến sẽ được cấp tự động sau khi vượt qua cả 2 tiêu chí.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </Async>
      </main>

      {/* MODAL EDIT HỌC LIỆU (CHO ADMIN/EXPERT) */}
      {material && isEditModalOpen && (
        <LmsMaterialFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            loadMaterial();
          }}
          materialId={material.id}
        />
      )}
    </div>
  );
}
