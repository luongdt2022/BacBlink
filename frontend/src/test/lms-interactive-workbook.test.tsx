import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import ElearningDetailPage from "@/app/elearning/[id]/page";
import * as lmsApi from "@/lib/api/lms";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "el-002-test" }),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/elearning/el-002-test",
}));

// Mock authClient
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    getUser: () => ({ id: "user-1", email: "learner@nacentech.vn", role: "USER" }),
    isAuthenticated: () => true,
  },
  ROLES: {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    VERIFIED_EXPERT: "VERIFIED_EXPERT",
    USER: "USER",
  },
}));

// Mock toast
vi.mock("@/components/common/toast", () => ({
  useToast: () => ({
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const mockInteractiveMaterial: lmsApi.LmsMaterialDetailDto = {
  id: "el-002-test",
  materialCode: "EL-002",
  title: "BÀI 02: Xây Dựng Bản Đồ Nguồn Cung Công Nghệ Doanh Nghiệp",
  lessonType: "TYPE_A",
  sectorCode: "LV01",
  durationMinutes: 45,
  descriptionHtml: "<p>Bài giảng chuyên gia hướng dẫn phương pháp lập bản đồ công nghệ theo QĐ 1993/QĐ-BKHCN.</p>",
  videoStorageKey: "lms/videos/el-002.mp4",
  videoFileName: "el-002.mp4",
  videoFileSize: 104857600,
  videoDownloadUrl: "http://localhost:5080/files/lms/videos/el-002.mp4",
  thumbnailUrl: "https://cdn.nacentech.vn/thumbs/el-002.jpg",
  status: "PUBLISHED",
  createdBy: "expert-1",
  createdByName: "TS. Trần Văn Khoa",
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z",
  version: 1,
  clusterCode: "A",
  clusterName: "Cụm A: Nhận diện nhu cầu và bài toán công nghệ của doanh nghiệp",
  stepNumber: 2,
  targetAudience: "Lãnh đạo R&D, Giám đốc kỹ thuật, Cán bộ phụ trách ĐMST",
  preparationNotes: "Hiểu biết cơ bản về quy trình sản xuất và chuỗi giá trị doanh nghiệp",
  expectedOutcome: "Bản đồ công nghệ 3 lớp (Hiện tại - Chuyển tiếp - Tương lai) và Kế hoạch tìm kiếm nguồn cung",
  learningObjectivesJson: JSON.stringify([
    "Nắm vững 3 nguyên tắc lập bản đồ công nghệ theo chuẩn quốc tế",
    "Áp dụng biểu mẫu BM02 để rà soát nguồn cung trong và ngoài nước",
    "Tự đánh giá năng lực công nghệ qua radar chart 5 trục",
  ]),
  learningRoadmapJson: JSON.stringify({
    moduleCode: "M1",
    moduleName: "Mô-đun M1: Nền tảng về công nghệ, ĐMST và hệ sinh thái cung - cầu",
    pathways: ["LT1", "LT2"],
    videoFormat: "CG",
    videoFunction: "Kỹ năng thực hành",
    templateCodes: ["BM02"],
    level: "TC",
    durationText: "45 phút",
  }),
  knowledgeSummaryJson: JSON.stringify([
    {
      topic: "Bản đồ công nghệ (Technology Roadmap)",
      content: "Là công cụ liên kết mục tiêu kinh doanh với lộ trình phát triển sản phẩm và công nghệ gồm 3 tầng: Thị trường, Sản phẩm/Dịch vụ, và Công nghệ lõi.",
      example: "Nên cập nhật bản đồ định kỳ 6 tháng một lần theo biến động thị trường.",
    },
    {
      topic: "Phân loại nguồn cung công nghệ",
      content: "Nguồn cung nội bộ (In-house R&D) và Nguồn cung bên ngoài (Viện nghiên cứu, Trường đại học, Startup công nghệ).",
      example: "Ưu tiên nguồn cung có TRL từ 6-7 trở lên để giảm thiểu rủi ro chuyển giao.",
    },
  ]),
  practiceWorkbookJson: JSON.stringify({
    partA: [
      {
        item: "1. Đánh giá hiện trạng công nghệ hiện có",
        desc: "Phân tích 3 dây chuyền sản xuất chính và công nghệ áp dụng",
        example: "Dây chuyền chiết xuất tự động hóa 70%",
      },
    ],
    partB: [
      {
        solution: "Giải pháp 1: Chuyển giao công nghệ từ Viện Hàn lâm KH&CN",
        issue: "Cần cải tiến năng suất bóc tách hoạt chất",
        feasibility: "TRL 7, đã kiểm nghiệm pilot",
      },
    ],
    partC: [
      {
        step: 1,
        question: "Phân tích 3 rủi ro lớn nhất khi doanh nghiệp tiếp nhận công nghệ từ Viện/Trường?",
        example: "Rủi ro khác biệt văn hóa vận hành, độ trễ thích ứng công nghệ sản xuất quy mô lớn, và tranh chấp quyền SHTT.",
      },
    ],
  }),
  instructors: [
    {
      id: "inst-1",
      expertProfileId: "exp-1",
      fullName: "TS. Trần Văn Khoa",
      degree: "Tiến sĩ Đổi mới Sáng tạo",
      organization: "Viện Đổi Mới Công Nghệ Quốc Gia",
      avatarUrl: null,
      sortOrder: 1,
      isLead: true,
    },
  ],
  microVideos: [
    {
      id: "mv-1",
      videoOrder: 1,
      videoCode: "EL-002-V1",
      title: "Phần 1: Khái niệm và Khung tư duy Bản đồ Công nghệ",
      durationSeconds: 900,
      videoStorageKey: "lms/videos/el-002-part1.mp4",
      videoFileName: "el-002-part1.mp4",
      thumbnailUrl: null,
      callSheetJson: "Phân cảnh 1: Mở đầu; Phân cảnh 2: Khung tư duy 3 lớp; Phân cảnh 3: Tình huống mẫu",
      scenes: [
        {
          sceneCode: "SC01",
          layout: "SPLIT",
          sceneName: "Mở đầu",
          slideContent: "Nội dung slide mở đầu",
          lectureScript: "Chào các bạn, hôm nay chúng ta sẽ tìm hiểu về bản đồ công nghệ.",
          popupQuiz: "Khái niệm bản đồ công nghệ",
        },
      ],
    },
    {
      id: "mv-2",
      videoOrder: 2,
      videoCode: "EL-002-V2",
      title: "Phần 2: Phương pháp Rà soát và Đánh giá Nguồn cung theo BM02",
      durationSeconds: 900,
      videoStorageKey: "lms/videos/el-002-part2.mp4",
      videoFileName: "el-002-part2.mp4",
      thumbnailUrl: null,
      callSheetJson: "Phân cảnh 1: Hướng dẫn điền BM02; Phân cảnh 2: Rà soát Viện/Trường",
    },
    {
      id: "mv-3",
      videoOrder: 3,
      videoCode: "EL-002-V3",
      title: "Phần 3: Bài tập Tình huống Thực tế và Đánh giá Rubric",
      durationSeconds: 900,
      videoStorageKey: "lms/videos/el-002-part3.mp4",
      videoFileName: "el-002-part3.mp4",
      thumbnailUrl: null,
      callSheetJson: "Phân cảnh 1: Nghiên cứu tình huống; Phân cảnh 2: Tự chấm 7 tiêu chí",
    },
  ],
  inVideoQuizzes: [
    {
      id: "ivq-1",
      microVideoId: "mv-1",
      quizCode: "Q1",
      triggerSeconds: 300,
      questionText: "Khung bản đồ công nghệ 3 lớp bao gồm những tầng nào sau đây?",
      optionA: "Thị trường - Sản phẩm/Dịch vụ - Công nghệ lõi",
      optionB: "Ý tưởng - Thiết kế - Đóng gói",
      optionC: "Chi phí - Doanh thu - Lợi nhuận",
      optionD: "Nhân sự - Tài chính - Cơ sở vật chất",
      correctOption: "A",
      explanation: "Theo chuẩn quốc tế, bản đồ công nghệ kết nối 3 tầng: Thị trường, Sản phẩm và Công nghệ lõi.",
      displayOrder: 1,
    },
    {
      id: "ivq-2",
      microVideoId: "mv-2",
      quizCode: "Q2",
      triggerSeconds: 600,
      questionText: "Chỉ số TRL mức mấy được coi là sẵn sàng thử nghiệm pilot tại nhà máy?",
      optionA: "TRL 1-2",
      optionB: "TRL 6-7",
      optionC: "TRL 9+",
      optionD: "TRL 0",
      correctOption: "B",
      explanation: "TRL 6-7 chứng minh công nghệ đã hoạt động tốt trong môi trường mô phỏng/thực địa.",
      displayOrder: 2,
    },
  ],
  practiceRubrics: [
    {
      id: "rub-1",
      criterionNumber: 1,
      criterionName: "Tính rõ ràng của bài toán công nghệ",
      descriptionScore0: "Mô tả bài toán mơ hồ, không rõ yêu cầu kỹ thuật",
      descriptionScore1: "Xác định được bài toán nhưng chưa rõ thông số kỹ thuật",
      descriptionScore2: "Xác định rõ ràng thông số kỹ thuật, KPI và điều kiện biên cụ thể",
      weightMultiplier: 1,
    },
    {
      id: "rub-2",
      criterionNumber: 2,
      criterionName: "Phân tích hiện trạng và khoảng trống công nghệ",
      descriptionScore0: "Chưa phân tích hiện trạng",
      descriptionScore1: "Có phân tích hiện trạng nhưng chưa chỉ rõ khoảng trống",
      descriptionScore2: "Phân tích sâu hiện trạng và xác định rõ 100% khoảng trống công nghệ",
      weightMultiplier: 1,
    },
    {
      id: "rub-3",
      criterionNumber: 3,
      criterionName: "Khảo sát và lập danh mục nguồn cung",
      descriptionScore0: "Không có danh mục nguồn cung",
      descriptionScore1: "Khảo sát dưới 3 nguồn cung tiềm năng",
      descriptionScore2: "Khảo sát tối thiểu 5 nguồn cung đa dạng kèm đánh giá sơ bộ",
      weightMultiplier: 1,
    },
    {
      id: "rub-4",
      criterionNumber: 4,
      criterionName: "Đánh giá mức độ sẵn sàng TRL/CRI",
      descriptionScore0: "Chưa đánh giá TRL",
      descriptionScore1: "Đánh giá TRL dựa trên cảm tính",
      descriptionScore2: "Đánh giá TRL chặt chẽ theo tiêu chuẩn 9 cấp độ",
      weightMultiplier: 1,
    },
    {
      id: "rub-5",
      criterionNumber: 5,
      criterionName: "Kế hoạch thử nghiệm PoC / Pilot",
      descriptionScore0: "Không có kế hoạch PoC",
      descriptionScore1: "Kế hoạch PoC thiếu mốc thời gian và tiêu chí nghiệm thu",
      descriptionScore2: "Kế hoạch PoC chi tiết mốc thời gian, chi phí và tiêu chí nghiệm thu rõ ràng",
      weightMultiplier: 1,
    },
    {
      id: "rub-6",
      criterionNumber: 6,
      criterionName: "Dự phòng rủi ro và bảo vệ SHTT",
      descriptionScore0: "Chưa nhận diện rủi ro SHTT",
      descriptionScore1: "Nhận diện rủi ro nhưng chưa có phương án xử lý",
      descriptionScore2: "Lập phương án bảo hộ SHTT và ký thỏa thuận NDA bài bản",
      weightMultiplier: 1,
    },
    {
      id: "rub-7",
      criterionNumber: 7,
      criterionName: "Tính khả thi triển khai thực tế",
      descriptionScore0: "Thiếu tính khả thi",
      descriptionScore1: "Khả thi ở quy mô phòng thí nghiệm",
      descriptionScore2: "Hoàn toàn khả thi để ứng dụng ngay vào dây chuyền sản xuất",
      weightMultiplier: 1,
    },
  ],
  faqs: [
    {
      id: "faq-1",
      questionNumber: 1,
      questionText: "Doanh nghiệp vừa và nhỏ (SME) có cần lập bản đồ công nghệ không?",
      answerText: "Rất cần thiết. Bản đồ công nghệ giúp SME tập trung nguồn lực hữu hạn vào những công nghệ sống còn, tránh đầu tư dàn trải lãng phí.",
      displayOrder: 1,
    },
    {
      id: "faq-2",
      questionNumber: 2,
      questionText: "Làm thế nào để bảo mật thông tin khi đi khảo sát nguồn cung bên ngoài?",
      answerText: "Bắt buộc ký thỏa thuận bảo mật thông tin (NDA) trước khi chia sẻ dữ liệu chi tiết và chỉ công bố các yêu cầu kỹ thuật ở dạng tổng quát.",
      displayOrder: 2,
    },
  ],
  quizQuestions: [
    {
      id: "q-1",
      sortOrder: 1,
      question: "Bản đồ công nghệ gồm mấy tầng chính theo phương pháp luận quốc tế?",
      optionA: "3 tầng: Thị trường - Sản phẩm - Công nghệ",
      optionB: "2 tầng: Tài chính - Kỹ thuật",
      optionC: "4 tầng: Lãnh đạo - Kỹ sư - Công nhân - Khách hàng",
      optionD: "1 tầng duy nhất",
      correctOption: "A",
      explanation: "Chuẩn quốc tế xác định 3 tầng cơ bản.",
    },
    {
      id: "q-2",
      sortOrder: 2,
      question: "Biểu mẫu BM02 dùng để làm gì trong chương trình 1993/QĐ-BKHCN?",
      optionA: "Phiếu khảo sát và lập bản đồ nguồn cung công nghệ",
      optionB: "Hợp đồng lao động",
      optionC: "Hóa đơn giá trị gia tăng",
      optionD: "Biên bản họp hội đồng",
      correctOption: "A",
      explanation: "BM02 là biểu mẫu chuẩn để khảo sát nguồn cung.",
    },
  ],
  attachments: [
    {
      id: "att-1",
      category: "SUMMARY_SLIDE",
      fileName: "Tom_Tat_Kien_Thuc_Bai_02.pdf",
      storageKey: "lms/docs/el-002/Tom_Tat_Kien_Thuc_Bai_02.pdf",
      contentType: "application/pdf",
      fileSize: 1048576,
      sortOrder: 1,
      downloadUrl: "http://localhost:5080/files/lms/docs/el-002/Tom_Tat_Kien_Thuc_Bai_02.pdf",
    },
    {
      id: "att-2",
      category: "PRACTICE_TOOL",
      fileName: "Phieu_Thuc_Hanh_BM02.docx",
      storageKey: "lms/docs/el-002/Phieu_Thuc_Hanh_BM02.docx",
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileSize: 524288,
      sortOrder: 2,
      downloadUrl: "http://localhost:5080/files/lms/docs/el-002/Phieu_Thuc_Hanh_BM02.docx",
    },
  ],
  dbLinks: [],
};

describe("TASK-10: Wave 3 Frontend Interactive E-Learning & Workbook Suite", () => {
  beforeEach(() => {
    vi.spyOn(lmsApi, "fetchLmsCatalogDetail").mockResolvedValue(mockInteractiveMaterial);
    vi.spyOn(lmsApi, "getLearnerProgress").mockResolvedValue({
      learningMaterialId: "el-002-test",
      watchedSeconds: 60,
      progressPercent: 10,
      isCompleted: false,
      lastAccessedAt: new Date().toISOString(),
    });
  });

  describe("1. Metadata Header QĐ 1993/QĐ-BKHCN & 8 Thành Phần", () => {
    it("renders course header with cluster, module, audience and badges", async () => {
      render(<ElearningDetailPage />);

      await waitFor(() => {
        expect(
          screen.getByText("BÀI 02: Xây Dựng Bản Đồ Nguồn Cung Công Nghệ Doanh Nghiệp")
        ).toBeInTheDocument();
      });

      // Check Cluster badge & Module code
      expect(screen.getByText(/Cụm A/i)).toBeInTheDocument();
      expect(screen.getByText(/EL-002/i)).toBeInTheDocument();
      expect(screen.getByText(/Mô-đun M1/i)).toBeInTheDocument();

      // Check Target Audience and Expected Outputs
      expect(screen.getByText(/Lãnh đạo R&D, Giám đốc kỹ thuật/i)).toBeInTheDocument();
      expect(screen.getByText(/Bản đồ công nghệ 3 lớp/i)).toBeInTheDocument();
    });

    it("renders playlist with 3 micro-videos and allows switching active video", async () => {
      render(<ElearningDetailPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Phần 1: Khái niệm và Khung tư duy/i)
        ).toBeInTheDocument();
      });

      // Verify all 3 micro-video buttons exist in playlist
      expect(screen.getByRole("button", { name: /Video 002\.1/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Video 002\.2/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Video 002\.3/i })).toBeInTheDocument();

      // Click on Video 002.2 to switch active micro-video
      const part2Button = screen.getByRole("button", { name: /Video 002\.2/i });
      fireEvent.click(part2Button);

      // Check active title is updated to Part 2
      await waitFor(() => {
        expect(
          screen.getByText(/Phần 2: Phương pháp Rà soát và Đánh giá Nguồn cung/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("2. In-Video Pop-up Quiz Interaction (BR-EL-07)", () => {
    it("opens in-video quiz modal when clicking checkpoint question and verifies correct/incorrect flow", async () => {
      render(<ElearningDetailPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Q1" })).toBeInTheDocument();
      });

      // Click on checkpoint question button Q1
      const q1Btn = screen.getByRole("button", { name: "Q1" });
      fireEvent.click(q1Btn);

      // Modal should appear with question text
      await waitFor(() => {
        expect(
          screen.getByText(/Khung bản đồ công nghệ 3 lớp bao gồm những tầng nào sau đây?/i)
        ).toBeInTheDocument();
      });

      // Step A: Select WRONG answer (Option B)
      const wrongOption = screen.getByText(/Ý tưởng - Thiết kế - Đóng gói/i);
      fireEvent.click(wrongOption);

      const checkAnswerBtn = screen.getByRole("button", { name: /Kiểm tra câu trả lời/i });
      fireEvent.click(checkAnswerBtn);

      // Warning message should be shown for wrong answer
      await waitFor(() => {
        expect(screen.getByText(/✗ Chưa chính xác!/i)).toBeInTheDocument();
      });
      // "Tiếp tục bài học" button should NOT be shown yet
      expect(screen.queryByRole("button", { name: /Tiếp tục bài học/i })).toBeNull();

      // Step B: Select RIGHT answer (Option A)
      const correctOption = screen.getByText(/Thị trường - Sản phẩm\/Dịch vụ - Công nghệ lõi/i);
      fireEvent.click(correctOption);
      fireEvent.click(checkAnswerBtn);

      // Success message and continue button should appear
      await waitFor(() => {
        expect(screen.getByText(/Chính xác! Bạn đã hiểu đúng bài giảng/i)).toBeInTheDocument();
      });

      const continueBtn = screen.getByRole("button", { name: /Tiếp tục bài học/i });
      expect(continueBtn).toBeInTheDocument();

      // Click continue to close modal
      fireEvent.click(continueBtn);
      await waitFor(() => {
        expect(
          screen.queryByText(/Khung bản đồ công nghệ 3 lớp bao gồm những tầng nào sau đây?/i)
        ).toBeNull();
      });
    });
  });

  describe("3. Practice Rubric Self-Scoring & Dual Unlock CTA (BR-EL-08)", () => {
    it("calculates rubric score and unlocks dual CTA (Expert Review R50 & Demand Intake TASK-03) when total >= 11/14", async () => {
      render(<ElearningDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("BÀI 02: Xây Dựng Bản Đồ Nguồn Cung Công Nghệ Doanh Nghiệp")).toBeInTheDocument();
      });

      // Navigate to Practice tab
      const practiceTabBtn = screen.getByRole("tab", { name: /Thực hành & Tự chấm/i });
      fireEvent.click(practiceTabBtn);

      // Check 7 criteria rendered
      await waitFor(() => {
        expect(screen.getByText("Tính rõ ràng của bài toán công nghệ")).toBeInTheDocument();
        expect(screen.getByText("Phân tích hiện trạng và khoảng trống công nghệ")).toBeInTheDocument();
      });

      // Initial total score is 0/14 -> CTA buttons should NOT be unlocked
      expect(screen.getByText(/Điểm: 0\/14/i)).toBeInTheDocument();
      expect(screen.getByText(/• Chưa đạt \(cần ≥ 11\)/i)).toBeInTheDocument();
      expect(screen.queryByText(/Gửi Chuyên gia phản biện \(R50\)/i)).toBeNull();
      expect(screen.queryByText(/Tạo Hồ sơ Nhu cầu Công nghệ/i)).toBeNull();

      // Now click "2 điểm" button for first 6 criteria (6 * 2 = 12 points >= 11/14)
      const score2Buttons = screen.getAllByRole("button", { name: /2 điểm/i });
      expect(score2Buttons.length).toBeGreaterThanOrEqual(6);

      for (let i = 0; i < 6; i++) {
        fireEvent.click(score2Buttons[i]);
      }

      // Check updated score display
      await waitFor(() => {
        expect(screen.getByText(/Điểm: 12\/14/i)).toBeInTheDocument();
      });

      // Verification: Dual CTA buttons MUST now be unlocked and visible!
      expect(screen.getByText(/✓ ĐẠT CHUẨN/i)).toBeInTheDocument();
      expect(screen.getByText(/Gửi Chuyên gia phản biện \(R50\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Tạo Hồ sơ Nhu cầu Công nghệ/i)).toBeInTheDocument();

      // Test submitting evaluation
      const submitEvalSpy = vi.spyOn(lmsApi, "submitPracticeEvaluation").mockResolvedValue({
        evaluationId: "eval-123",
        totalScore: 12,
        maxScore: 14,
        isPassed: true,
        unlockedExpertReviewCta: true,
        unlockedDemandCreateCta: true,
        evaluatedAt: new Date().toISOString(),
      });

      const saveEvalBtn = screen.getByRole("button", { name: /Lưu & Chấm điểm Tự đánh giá/i });
      fireEvent.click(saveEvalBtn);

      await waitFor(() => {
        expect(submitEvalSpy).toHaveBeenCalledWith("el-002-test", expect.objectContaining({
          scores: expect.any(Object),
        }));
      });
    });
  });

  describe("4. Essay Questions & Expert Hint (Tab Bài Tập Tự Luyện)", () => {
    it("displays 3 essay questions and toggles expert hint", async () => {
      render(<ElearningDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("BÀI 02: Xây Dựng Bản Đồ Nguồn Cung Công Nghệ Doanh Nghiệp")).toBeInTheDocument();
      });

      // Navigate to Quiz & Essay tab
      const quizTabBtn = screen.getByRole("tab", { name: /Bài tập tự luyện/i });
      fireEvent.click(quizTabBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Phần II: Bài Tập Tự Luận Tình Huống Ngắn/i)
        ).toBeInTheDocument();
      });

      // Hint should initially be hidden
      expect(
        screen.queryByText(/Mục tiêu: Nâng tỷ lệ giao hàng đúng hẹn/i)
      ).toBeNull();

      // Click "Xem gợi ý đối chiếu của Chuyên gia" button
      const toggleHintBtns = screen.getAllByRole("button", { name: /Xem gợi ý đối chiếu của Chuyên gia/i });
      expect(toggleHintBtns.length).toBeGreaterThan(0);
      fireEvent.click(toggleHintBtns[0]);

      // Hint should now be visible
      await waitFor(() => {
        expect(
          screen.getByText(/Mục tiêu: Nâng tỷ lệ giao hàng đúng hẹn/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("5. Knowledge Summary & 8 FAQs Accordion", () => {
    it("renders knowledge takeaways and opens FAQ accordion", async () => {
      render(<ElearningDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("BÀI 02: Xây Dựng Bản Đồ Nguồn Cung Công Nghệ Doanh Nghiệp")).toBeInTheDocument();
      });

      // Navigate to Summary & FAQ tab
      const summaryTabBtn = screen.getByRole("tab", { name: /Tóm tắt & FAQs/i });
      fireEvent.click(summaryTabBtn);

      // Check takeaways
      await waitFor(() => {
        expect(screen.getByText(/Bản đồ công nghệ \(Technology Roadmap\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Phân loại nguồn cung công nghệ/i)).toBeInTheDocument();
      });

      // Check FAQ question
      expect(
        screen.getByText(/Doanh nghiệp vừa và nhỏ \(SME\) có cần lập bản đồ công nghệ không\?/i)
      ).toBeInTheDocument();

      // Click FAQ to expand answer
      const faqTrigger = screen.getByText(/Doanh nghiệp vừa và nhỏ \(SME\) có cần lập bản đồ công nghệ không\?/i);
      fireEvent.click(faqTrigger);

      await waitFor(() => {
        expect(
          screen.getByText(/Rất cần thiết\. Bản đồ công nghệ giúp SME tập trung nguồn lực hữu hạn/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("6. End-of-Lesson Quiz (BR-EL-09: >= 60% Passing)", () => {
    it("allows answering quiz and shows congratulation banner when passing >= 60%", async () => {
      render(<ElearningDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("BÀI 02: Xây Dựng Bản Đồ Nguồn Cung Công Nghệ Doanh Nghiệp")).toBeInTheDocument();
      });

      // Navigate to Quiz tab
      const quizTabBtn = screen.getByRole("tab", { name: /Bài tập tự luyện/i });
      fireEvent.click(quizTabBtn);

      await waitFor(() => {
        expect(screen.getByText(/Bản đồ công nghệ gồm mấy tầng chính/i)).toBeInTheDocument();
      });

      // Select Option A for Question 1
      const q1OptA = screen.getByRole("button", { name: /3 tầng: Thị trường - Sản phẩm - Công nghệ/i });
      fireEvent.click(q1OptA);

      // Select Option A for Question 2
      const q2OptA = screen.getByRole("button", { name: /Phiếu khảo sát và lập bản đồ nguồn cung công nghệ/i });
      fireEvent.click(q2OptA);

      // Submit Quiz
      const submitQuizSpy = vi.spyOn(lmsApi, "submitQuizAttempt").mockResolvedValue({
        totalQuestions: 2,
        correctAnswers: 2,
        scorePercent: 100,
        passed: true,
      });

      const submitBtn = screen.getByRole("button", { name: /Nộp bài kiểm tra trắc nghiệm/i });
      fireEvent.click(submitBtn);

      // Verify submit call and passing feedback
      await waitFor(() => {
        expect(submitQuizSpy).toHaveBeenCalledWith("el-002-test", expect.any(Object));
      });

      await waitFor(() => {
        expect(screen.getByText(/Điểm: 100% \(2\/2\) — ĐẠT/i)).toBeInTheDocument();
      });
    });
  });
});
