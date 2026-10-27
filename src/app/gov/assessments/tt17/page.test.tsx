import React from "react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import GovAssessmentQueuePage from "./page";
import * as assessmentApi from "@/services/api/assessment-tt17";
import { authClient } from "@/lib/auth-client";

vi.mock("@/services/api/assessment-tt17", async () => {
  const actual = await vi.importActual("@/services/api/assessment-tt17");
  return {
    ...actual,
    getGovAssessmentQueue: vi.fn(),
    reviewAssessment: vi.fn(),
  };
});

describe("T084 [FE-Gov-Screen3] GovAssessmentQueuePage Verification", () => {
  const mockAssessments: assessmentApi.Tt17Assessment[] = [
    {
      id: "tt17-001",
      enterpriseId: "ent-101",
      enterpriseName: "Công ty Thực phẩm Sạch Hà Nội",
      taxCode: "0109998888",
      industryCode: "C.10",
      assessmentYear: 2026,
      status: "SUBMITTED",
      scoreResult: {
        scoreT: 25.5,
        scoreE: 16.0,
        scoreO: 15.5,
        scoreR: 12.0,
        scoreI: 10.0,
        totalScore: 79.0,
        syncCoefficient: 0.82,
        classification: "TIEN_TIEN",
        classificationLabel: "Trình độ Tiên tiến",
        bottlenecks: ["TC14"],
        criteria: [
          {
            code: "TC01",
            group: "T",
            name: "Hệ số trang bị kỹ thuật",
            maxScore: 3,
            achievedScore: 2.5,
            isBottleneck: false,
            recommendation: "",
          },
          {
            code: "TC14",
            group: "O",
            name: "Mức độ ứng dụng phần mềm quản lý",
            maxScore: 3,
            achievedScore: 1.0,
            isBottleneck: true,
            recommendation: "Cần nâng cấp MES/ERP",
          },
        ],
      },
      createdAt: "2026-10-21T00:00:00Z",
      updatedAt: "2026-10-21T00:00:00Z",
    } as any,
    {
      id: "tt17-002",
      enterpriseId: "ent-102",
      enterpriseName: "Công ty Thiết bị Quang học Thủ Đô",
      taxCode: "0107776666",
      industryCode: "C.26",
      assessmentYear: 2026,
      status: "IN_REVIEW",
      scoreResult: {
        scoreT: 18.0,
        scoreE: 12.0,
        scoreO: 10.0,
        scoreR: 8.0,
        scoreI: 6.0,
        totalScore: 54.0,
        syncCoefficient: 0.55,
        classification: "TRUNG_BINH",
        classificationLabel: "Trình độ Trung bình",
        bottlenecks: [],
        criteria: [],
      },
      createdAt: "2026-10-22T00:00:00Z",
      updatedAt: "2026-10-22T00:00:00Z",
    } as any,
  ];

  beforeEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();

    authClient.setSession("test-token", {
      id: "gov-user-hanoi",
      email: "chuyenvien@hanoi.gov.vn",
      fullName: "Lê Văn Thẩm Tra",
      role: "PROVINCE_OFFICER",
      scopeId: "HN",
      organizationName: "Sở KH&CN Hà Nội",
    });

    vi.mocked(assessmentApi.getGovAssessmentQueue).mockResolvedValue(mockAssessments);
    vi.mocked(assessmentApi.reviewAssessment).mockImplementation(
      async (id, action, notes) => ({
        ...mockAssessments.find((a) => a.id === id)!,
        status: action === "APPROVE" ? "APPROVED" : action === "REJECT" ? "REJECTED" : "CHANGES_REQUESTED",
        reviewNotes: notes,
      })
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("reads initial scopeId from currentUser.scopeId instead of hardcoding HP", async () => {
    render(<GovAssessmentQueuePage />);

    // GovPageHeader displays resolved name for currentUser.scopeId ("HN" -> "Hà Nội (HN)")
    expect(
      await screen.findByRole("heading", { level: 1, name: /Hội Đồng Chấm Điểm & Thẩm Định TT17/i })
    ).toBeInTheDocument();

    const scopeBadge = screen.getByTestId("gov-scope-badge");
    expect(scopeBadge).toHaveTextContent("Hà Nội (HN)");
    expect(scopeBadge).not.toHaveTextContent("Hải Phòng (HP)");

    // API called with HN scope
    expect(assessmentApi.getGovAssessmentQueue).toHaveBeenCalledWith("HN", undefined);
  });

  it("resolves 23 manufacturing VSIC sector names (C.10, C.26)", async () => {
    render(<GovAssessmentQueuePage />);

    expect(await screen.findByText("Công ty Thực phẩm Sạch Hà Nội")).toBeInTheDocument();

    // C.10 resolved with sector name
    expect(screen.getByText("C.10: Chế biến thực phẩm")).toBeInTheDocument();

    // C.26 resolved with sector name
    expect(screen.getByText("C.26: Sản xuất điện tử, máy tính và quang học")).toBeInTheDocument();
  });

  it("filters assessments by technology classification (Tiên tiến / Trung bình)", async () => {
    render(<GovAssessmentQueuePage />);

    expect(await screen.findByText("Công ty Thực phẩm Sạch Hà Nội")).toBeInTheDocument();
    expect(screen.getByText("Công ty Thiết bị Quang học Thủ Đô")).toBeInTheDocument();

    // Filter by TIEN_TIEN
    const classFilter = screen.getByLabelText(/Lọc xếp loại công nghệ/i);
    fireEvent.change(classFilter, { target: { value: "TIEN_TIEN" } });

    expect(screen.getByText("Công ty Thực phẩm Sạch Hà Nội")).toBeInTheDocument();
    expect(screen.queryByText("Công ty Thiết bị Quang học Thủ Đô")).not.toBeInTheDocument();
  });

  it("opens review drawer with 26 criteria matrix and enforces note validation >= 10 chars", async () => {
    render(<GovAssessmentQueuePage />);

    await screen.findByText("Công ty Thực phẩm Sạch Hà Nội");

    // Click "Thẩm định"
    const openBtns = screen.getAllByTestId("open-review-btn");
    fireEvent.click(openBtns[0]);

    // Drawer opens
    expect(screen.getByText("Hồ Sơ Đánh Giá TT17")).toBeInTheDocument();
    expect(screen.getByText("Ma Trận Chi Tiết 26 Tiêu Chí Đánh Giá")).toBeInTheDocument();
    expect(screen.getByText("TC01: Hệ số trang bị kỹ thuật")).toBeInTheDocument();
    expect(screen.getByText("TC14: Mức độ ứng dụng phần mềm quản lý")).toBeInTheDocument();
    expect(screen.getByText("Điểm nghẽn")).toBeInTheDocument();

    // Test rejection validation without valid note
    const rejectBtn = screen.getByRole("button", { name: /Từ chối hồ sơ/i });
    const notesTextarea = screen.getByPlaceholderText(/Ghi rõ nhận xét về số liệu thiết bị/i);

    // Empty note
    fireEvent.change(notesTextarea, { target: { value: "   " } });
    fireEvent.click(rejectBtn);
    expect(
      screen.getByText(/Lý do xử lý bắt buộc phải có ít nhất 10 ký tự hợp lệ/i)
    ).toBeInTheDocument();
    expect(assessmentApi.reviewAssessment).not.toHaveBeenCalled();

    // Valid note >= 10 chars
    fireEvent.change(notesTextarea, {
      target: { value: "Số liệu thiết bị tự động hóa không có hóa đơn chứng từ hợp lệ." },
    });
    fireEvent.click(rejectBtn);

    await waitFor(() => {
      expect(assessmentApi.reviewAssessment).toHaveBeenCalledWith(
        "tt17-001",
        "REJECT",
        "Số liệu thiết bị tự động hóa không có hóa đơn chứng từ hợp lệ."
      );
    });
  });
});
