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
  };
});

vi.mock("@/services/survey-docx-exporter", async () => {
  const actual = await vi.importActual("@/services/survey-docx-exporter");
  return {
    ...actual,
    exportTt17SurveyDocx: vi.fn(),
  };
});

// Mock URL methods for downloading
global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/test-blob-url");
global.URL.revokeObjectURL = vi.fn();

describe("T-09.24 [FE] AdminAssessmentRecordsPage — Quản Lý Bản Ghi Phiếu Thu Thập & Đánh Giá", () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assessmentApi.getGovAssessmentQueue).mockResolvedValue(mockAssessments);
    vi.mocked(exporterApi.exportTt17SurveyDocx).mockResolvedValue(
      new Blob(["fake docx data"], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("renders Header, title, and 2 CTA buttons with correct download templates", async () => {
    render(<AdminAssessmentRecordsPage />);

    expect(
      screen.getByText("Quản Lý Bản Ghi Phiếu Thu Thập & Đánh Giá Doanh Nghiệp")
    ).toBeInTheDocument();

    const tt17TemplateBtn = screen.getByRole("link", { name: /Tải mẫu Phiếu TT17/i });
    expect(tt17TemplateBtn).toBeInTheDocument();
    expect(tt17TemplateBtn).toHaveAttribute(
      "href",
      "/templates/surveys/phieu_thu_thap_tt17_mau_trang.docx"
    );

    const demandTemplateBtn = screen.getByRole("link", { name: /Tải mẫu Phiếu Nhu cầu/i });
    expect(demandTemplateBtn).toBeInTheDocument();
    expect(demandTemplateBtn).toHaveAttribute(
      "href",
      "/templates/surveys/phieu_khao_sat_nhu_cau_dnnvv_mau_trang.docx"
    );
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

    // Filter by TIEN_TIEN
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
});
