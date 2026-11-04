import React from "react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import AdminAssessmentRecordsPage from "./page";
import * as assessmentApi from "@/services/api/assessment-tt17";
import * as exporterApi from "@/services/survey-docx-exporter";

vi.mock("@/services/api/assessment-tt17", async () => {
  const actual = await vi.importActual("@/services/api/assessment-tt17");
  return {
    ...actual,
    getGovAssessmentQueue: vi.fn(),
    getGovDemandSurveys: vi.fn(),
  };
});

vi.mock("@/services/survey-docx-exporter", async () => {
  const actual = await vi.importActual("@/services/survey-docx-exporter");
  return {
    ...actual,
    exportTt17SurveyDocx: vi.fn(),
    exportDemandSmeDocx: vi.fn(),
  };
});

// Mock URL methods for downloading
global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/test-blob-url");
global.URL.revokeObjectURL = vi.fn();

describe("CR-2026-026 AdminAssessmentRecordsPage — Bộ Tam Hợp 3 Phiếu Khảo Sát & Đánh Giá Thực Địa", () => {
  const mockAssessments: assessmentApi.Tt17Assessment[] = [
    {
      id: "tt17-rec-001",
      enterpriseId: "ent-001",
      enterpriseName: "Tập Đoàn Công Nghệ Nacen Hưng Yên",
      taxCode: "0900123456",
      scopeType: "PROVINCE",
      scopeId: "HY",
      industryCode: "C.26",
      assessmentYear: 2026,
      status: "APPROVED",
      submittedAt: "2026-10-25T08:30:00Z",
      createdAt: "2026-10-20T08:30:00Z",
      updatedAt: "2026-10-25T08:30:00Z",
      scoreResult: {
        scoreT: 27.5,
        scoreE: 18.0,
        scoreO: 16.5,
        scoreR: 15.0,
        scoreI: 12.0,
        totalScore: 89.0,
        syncCoefficient: 0.88,
        classification: "TIEN_TIEN",
        classificationLabel: "Trình độ Tiên tiến",
        bottlenecks: [],
        criteria: [
          {
            code: "TC01",
            group: "T",
            name: "Hệ số hao mòn máy móc",
            maxScore: 3,
            achievedScore: 2.8,
            isBottleneck: false,
            recommendation: "",
          },
        ],
      },
      surveyData: {
        ...assessmentApi.INITIAL_SURVEY_DATA,
        companyName: "Tập Đoàn Công Nghệ Nacen Hưng Yên",
        taxCode: "0900123456",
        companyAddress: "KCN Phố Nối A, Hưng Yên",
        totalWorkforce: 350,
      },
    },
    {
      id: "tt17-rec-002",
      enterpriseId: "ent-002",
      enterpriseName: "Công ty Cơ Khí Chế Tạo Tiền Giang",
      taxCode: "1200987654",
      scopeType: "PROVINCE",
      scopeId: "TG",
      industryCode: "C.28",
      assessmentYear: 2026,
      status: "SUBMITTED",
      submittedAt: "2026-10-26T14:15:00Z",
      createdAt: "2026-10-22T14:15:00Z",
      updatedAt: "2026-10-26T14:15:00Z",
      scoreResult: {
        scoreT: 18.0,
        scoreE: 12.0,
        scoreO: 11.0,
        scoreR: 9.0,
        scoreI: 6.0,
        totalScore: 56.0,
        syncCoefficient: 0.58,
        classification: "TRUNG_BINH",
        classificationLabel: "Trình độ Trung bình",
        bottlenecks: ["TC14"],
        criteria: [
          {
            code: "TC14",
            group: "O",
            name: "Ứng dụng CNTT trong điều hành",
            maxScore: 3,
            achievedScore: 1.0,
            isBottleneck: true,
            recommendation: "Cần số hóa ERP",
          },
        ],
      },
      surveyData: {
        ...assessmentApi.INITIAL_SURVEY_DATA,
        companyName: "Công ty Cơ Khí Chế Tạo Tiền Giang",
        taxCode: "1200987654",
        companyAddress: "KCN Mỹ Tho, Tiền Giang",
        totalWorkforce: 120,
      },
    },
  ];

  const mockDemandSurveys: assessmentApi.DemandSurveyItem[] = [
    {
      id: "demand-001",
      surveyCode: "SURV-2026-001",
      companyName: "Công ty Cổ phần Chế tạo Cơ khí Chính xác Minh Anh",
      taxCode: "0108992134",
      province: "Hà Nội",
      tniScore: 86,
      tniClassification: "VERY_HIGH",
      status: "COMPLETED",
      submittedAt: "2026-10-28T09:00:00Z",
      createdAt: "2026-10-28T09:00:00Z",
      topBottlenecks: ["Thiếu nhân lực R&D", "Công nghệ CNC cũ"],
      supportNeeds: ["Hỗ trợ chuyên gia ĐMST", "Kết nối viện trường"],
      representativeSignatureUrl: "data:image/png;base64,mockSign",
      items: [
        {
          id: "item-01",
          itemCode: "DMD-20261104-01",
          stageName: "Gia công & Lắp ráp",
          technicalProblem: "Tự động hóa phát hiện khuyết tật bề mặt mối hàn bằng AI Vision",
          desiredSolution: "Cánh tay Robot gắn Camera 3D kèm AI Deep Learning",
          expectedGoal: "Giảm tỷ lệ phế phẩm từ 4.5% xuống dưới 0.3%",
          budgetRange: "1–5 tỷ đồng",
          urgencyScore: 4,
          impactScore: 5,
          investmentCapacity: 4,
          adoptionReadiness: 4,
          tniScore: 86,
        },
      ],
      surveyDetails: JSON.stringify({
        hardestStage: "Kiểm tra chất lượng ngoại quan và đóng gói",
        primaryCause: "Thiếu hệ thống cảm biến quang học kiểm tra tự động",
        currentEquipments: [
          {
            StageName: "Đúc phôi & gia công tinh",
            MachineName: "Máy đúc áp lực buồng lạnh 650 tấn",
            TechOrigin: "Nhật Bản / G7",
            InvestmentYear: 2021,
            DepreciationStatus: "Đang hoạt động tốt (50–80%)",
          },
        ],
        criteria8: {
          "Mức độ hiện đại của dây chuyền & thiết bị": 4,
          "Chất lượng và độ đồng đều của sản phẩm": 4,
        },
        technicalPersonnel: {
          technicians: 12,
          engineers: 6,
          it: 2,
          automation: 3,
          rd: 2,
          quality: 4,
        },
        futureDirections: ["[Tự động hóa] Robot công nghiệp", "[Chuyển đổi số] AI Vision"],
      }),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assessmentApi.getGovAssessmentQueue).mockResolvedValue(mockAssessments);
    vi.mocked(assessmentApi.getGovDemandSurveys).mockResolvedValue(mockDemandSurveys);
    vi.mocked(exporterApi.exportTt17SurveyDocx).mockResolvedValue(
      new Blob(["fake docx data"], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
    );
    vi.mocked(exporterApi.exportDemandSmeDocx).mockResolvedValue(
      new Blob(["fake demand docx data"], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("renders Header, title, and exactly 3 CTA download buttons for the Triad Surveys", async () => {
    render(<AdminAssessmentRecordsPage />);

    expect(
      screen.getByText("Quản Lý Bản Ghi Phiếu Thu Thập & Đánh Giá Doanh Nghiệp")
    ).toBeInTheDocument();

    // 1. Nút Tải mẫu TT17
    const tt17TemplateBtn = screen.getByRole("link", { name: /Tải mẫu Đánh giá TT17/i });
    expect(tt17TemplateBtn).toBeInTheDocument();
    expect(tt17TemplateBtn).toHaveAttribute(
      "href",
      "/templates/surveys/phieu_thu_thap_tt17.docx"
    );
    expect(tt17TemplateBtn).toHaveAttribute(
      "download",
      "phieu_thu_thap_tt17.docx"
    );

    // 2. Nút Tải mẫu Khảo sát ĐMST 43 câu (CR-2026-026)
    const dmstTemplateBtn = screen.getByRole("link", { name: /Tải mẫu Khảo sát ĐMST/i });
    expect(dmstTemplateBtn).toBeInTheDocument();
    expect(dmstTemplateBtn).toHaveAttribute(
      "href",
      "/templates/surveys/phieu_khao_sat_dmst_43_cau_mau_trang.docx"
    );
    expect(dmstTemplateBtn).toHaveAttribute(
      "download",
      "phieu_khao_sat_dmst_43_cau_mau_trang.docx"
    );

    // 3. Nút Tải mẫu Nhu cầu DN
    const demandTemplateBtn = screen.getByRole("link", { name: /Tải mẫu Nhu cầu DN/i });
    expect(demandTemplateBtn).toBeInTheDocument();
    expect(demandTemplateBtn).toHaveAttribute(
      "href",
      "/templates/surveys/phieu_khao_sat_nhu_cau_dnnvv_mau_trang.docx"
    );
    expect(demandTemplateBtn).toHaveAttribute(
      "download",
      "phieu_khao_sat_nhu_cau_dnnvv_mau_trang.docx"
    );
  });

  it("supports dynamic context filtering when switching survey type", async () => {
    render(<AdminAssessmentRecordsPage />);

    const surveyTypeSelect = screen.getByLabelText(/Loại phiếu khảo sát/i);
    expect(surveyTypeSelect).toBeInTheDocument();

    // Verify 4 options exist
    expect(screen.getByRole("option", { name: /Tất cả loại phiếu \(3 loại\)/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Phiếu TT17 \(Công nghệ sản xuất\)/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Phiếu ĐMST \(43 câu hỏi ĐMST\)/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Phiếu Nhu cầu DN/i })).toBeInTheDocument();

    // Default label: "Phân loại / Xếp loại"
    expect(screen.getByText("Phân loại / Xếp loại")).toBeInTheDocument();

    // Switch to TT17 -> Label changes to "Xếp loại trình độ TT17"
    fireEvent.change(surveyTypeSelect, { target: { value: "TT17" } });
    expect(screen.getByText("Xếp loại trình độ TT17")).toBeInTheDocument();

    // Switch to INNOVATION -> Label changes to "Phân tầng năng lực ĐMST"
    fireEvent.change(surveyTypeSelect, { target: { value: "INNOVATION" } });
    expect(screen.getByText("Phân tầng năng lực ĐMST")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Dẫn đầu \(Leading - ≥ 75đ\)/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Đang phát triển \(Developing - 50–74đ\)/i })).toBeInTheDocument();

    // Switch to SME_DEMAND -> Label changes to "Mức độ cấp thiết TNI"
    fireEvent.change(surveyTypeSelect, { target: { value: "SME_DEMAND" } });
    expect(screen.getByText("Mức độ cấp thiết TNI")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Rất cao \(TNI ≥ 75\)/i })).toBeInTheDocument();
  });

  it("loads and displays list of records with 5 UX states discipline", async () => {
    render(<AdminAssessmentRecordsPage />);

    // Success state renders items
    await waitFor(() => {
      expect(screen.getByText("Tập Đoàn Công Nghệ Nacen Hưng Yên")).toBeInTheDocument();
      expect(screen.getByText("Công ty Cơ Khí Chế Tạo Tiền Giang")).toBeInTheDocument();
    });

    expect(screen.getByText("0900123456")).toBeInTheDocument();
    expect(screen.getByText("1200987654")).toBeInTheDocument();
    expect(screen.getByText("89/100")).toBeInTheDocument();
    expect(screen.getByText("56/100")).toBeInTheDocument();
  });

  it("handles error state with retry button", async () => {
    vi.mocked(assessmentApi.getGovAssessmentQueue).mockRejectedValueOnce(new Error("Network Error"));

    render(<AdminAssessmentRecordsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Không thể tải danh sách hồ sơ khảo sát & đánh giá/i)).toBeInTheDocument();
    });

    // Click retry
    vi.mocked(assessmentApi.getGovAssessmentQueue).mockResolvedValueOnce(mockAssessments);
    const retryBtn = screen.getByRole("button", { name: /Thử lại/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText("Tập Đoàn Công Nghệ Nacen Hưng Yên")).toBeInTheDocument();
    });
  });

  it("handles empty state when no record matches filters", async () => {
    render(<AdminAssessmentRecordsPage />);

    await waitFor(() => {
      expect(screen.getByText("Tập Đoàn Công Nghệ Nacen Hưng Yên")).toBeInTheDocument();
    });

    // Search for non-existent company
    const searchInput = screen.getByPlaceholderText("Nhập tên DN hoặc MST...");
    fireEvent.change(searchInput, { target: { value: "Không Tồn Tại 99999" } });

    await waitFor(() => {
      expect(screen.getByText("Không tìm thấy bản ghi phiếu nào")).toBeInTheDocument();
    });

    // Click Reset
    const resetBtn = screen.getByRole("button", { name: /Đặt lại tất cả bộ lọc/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText("Tập Đoàn Công Nghệ Nacen Hưng Yên")).toBeInTheDocument();
    });
  });

  it("filters records by classification and text search", async () => {
    render(<AdminAssessmentRecordsPage />);

    await waitFor(() => {
      expect(screen.getByText("Tập Đoàn Công Nghệ Nacen Hưng Yên")).toBeInTheDocument();
      expect(screen.getByText("Công ty Cơ Khí Chế Tạo Tiền Giang")).toBeInTheDocument();
    });

    // Switch to TT17 and filter by TIEN_TIEN
    const surveyTypeSelect = screen.getByLabelText(/Loại phiếu khảo sát/i);
    fireEvent.change(surveyTypeSelect, { target: { value: "TT17" } });

    const classSelect = screen.getByLabelText(/Xếp loại trình độ TT17/i);
    fireEvent.change(classSelect, { target: { value: "TIEN_TIEN" } });

    expect(screen.getByText("Tập Đoàn Công Nghệ Nacen Hưng Yên")).toBeInTheDocument();
    expect(screen.queryByText("Công ty Cơ Khí Chế Tạo Tiền Giang")).not.toBeInTheDocument();
  });

  it("opens Detail Modal when clicking 'Xem chi tiết'", async () => {
    render(<AdminAssessmentRecordsPage />);

    await waitFor(() => {
      expect(screen.getByText("Tập Đoàn Công Nghệ Nacen Hưng Yên")).toBeInTheDocument();
    });

    const detailButtons = screen.getAllByRole("button", { name: /Xem chi tiết/i });
    fireEvent.click(detailButtons[0]);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText(/Chi tiết Form Kê Khai Khảo Sát/i)).toBeInTheDocument();
      expect(screen.getByText(/Ma Trận Điểm 26 Tiêu Chí Đánh Giá/i)).toBeInTheDocument();
    });

    // Close modal
    const closeBtn = screen.getByTitle("Đóng cửa sổ");
    fireEvent.click(closeBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("triggers DOCX export when clicking 'Xuất Word (.docx)' button", async () => {
    render(<AdminAssessmentRecordsPage />);

    await waitFor(() => {
      expect(screen.getByText("Tập Đoàn Công Nghệ Nacen Hưng Yên")).toBeInTheDocument();
    });

    const exportButtons = screen.getAllByRole("button", { name: /Xuất Word \(\.docx\)/i });
    fireEvent.click(exportButtons[0]);

    await waitFor(() => {
      expect(exporterApi.exportTt17SurveyDocx).toHaveBeenCalledWith(mockAssessments[0]);
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it("filters and displays Demand Survey records when selecting Phiếu Nhu cầu DN and opens its modal", async () => {
    render(<AdminAssessmentRecordsPage />);

    await waitFor(() => {
      expect(screen.getByText("Công ty Cổ phần Chế tạo Cơ khí Chính xác Minh Anh")).toBeInTheDocument();
    });

    const surveyTypeSelect = screen.getByLabelText(/Loại phiếu khảo sát/i);
    fireEvent.change(surveyTypeSelect, { target: { value: "SME_DEMAND" } });

    // Minh Anh is present, TT17 items are filtered out
    expect(screen.getByText("Công ty Cổ phần Chế tạo Cơ khí Chính xác Minh Anh")).toBeInTheDocument();
    expect(screen.queryByText("Tập Đoàn Công Nghệ Nacen Hưng Yên")).not.toBeInTheDocument();
    expect(screen.getByText("TNI: 86")).toBeInTheDocument();

    // Click "Xem chi tiết" for Demand Survey
    const detailBtn = screen.getByRole("button", { name: /Xem chi tiết/i });
    fireEvent.click(detailBtn);

    await waitFor(() => {
      expect(screen.getByText(/Bản ghi Phiếu Nhu cầu DN/i)).toBeInTheDocument();
      expect(screen.getByText(/Chỉ số TNI/i)).toBeInTheDocument();
      // CR-2026-027 Section I: Bài toán kỹ thuật AI Vision
      expect(screen.getByText(/Tự động hóa phát hiện khuyết tật bề mặt mối hàn bằng AI Vision/i)).toBeInTheDocument();
      expect(screen.getByText(/Cánh tay Robot gắn Camera 3D/i)).toBeInTheDocument();
      // CR-2026-027 Section III: Máy móc thiết bị
      expect(screen.getByText(/Máy đúc áp lực buồng lạnh 650 tấn/i)).toBeInTheDocument();
      // CR-2026-027 Section IV: Khâu khó nhất
      expect(screen.getByText(/Kiểm tra chất lượng ngoại quan và đóng gói/i)).toBeInTheDocument();
      // CR-2026-027 Section V: Thống kê nhân lực
      expect(screen.getByText(/12 người/i)).toBeInTheDocument();
      // CR-2026-027 Section VI: Định hướng công nghệ
      expect(screen.getByText(/\[Tự động hóa\] Robot công nghiệp/i)).toBeInTheDocument();
    });
  });

  it("CR-2026-027 triggers exportDemandSmeDocx when clicking 'Xuất Word (.docx)' button on Demand row", async () => {
    render(<AdminAssessmentRecordsPage />);

    await waitFor(() => {
      expect(screen.getByText("Công ty Cổ phần Chế tạo Cơ khí Chính xác Minh Anh")).toBeInTheDocument();
    });

    const surveyTypeSelect = screen.getByLabelText(/Loại phiếu khảo sát/i);
    fireEvent.change(surveyTypeSelect, { target: { value: "SME_DEMAND" } });

    const exportDemandBtn = screen.getByRole("button", { name: /Xuất Word \(\.docx\)/i });
    expect(exportDemandBtn).toBeInTheDocument();
    fireEvent.click(exportDemandBtn);

    await waitFor(() => {
      expect(exporterApi.exportDemandSmeDocx).toHaveBeenCalledWith(mockDemandSurveys[0]);
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it("CR-2026-027 triggers exportDemandSmeDocx inside Modal Footer when clicking 'Xuất file Word (.docx)'", async () => {
    render(<AdminAssessmentRecordsPage />);

    await waitFor(() => {
      expect(screen.getByText("Công ty Cổ phần Chế tạo Cơ khí Chính xác Minh Anh")).toBeInTheDocument();
    });

    const surveyTypeSelect = screen.getByLabelText(/Loại phiếu khảo sát/i);
    fireEvent.change(surveyTypeSelect, { target: { value: "SME_DEMAND" } });

    // Mở modal
    const detailBtn = screen.getByRole("button", { name: /Xem chi tiết/i });
    fireEvent.click(detailBtn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Xuất file Word \(\.docx\)/i })).toBeInTheDocument();
    });

    const modalExportBtn = screen.getByRole("button", { name: /Xuất file Word \(\.docx\)/i });
    fireEvent.click(modalExportBtn);

    await waitFor(() => {
      expect(exporterApi.exportDemandSmeDocx).toHaveBeenCalledWith(mockDemandSurveys[0]);
    });
  });
});
