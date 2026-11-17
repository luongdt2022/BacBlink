import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import KhaoSatDmstPage from "./page";

// Mock router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/khao-sat-dmst",
}));

// Mock toast
vi.mock("@/components/common/toast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

const mockPrefillResponse = {
  isAuthenticated: true,
  enterpriseId: "1a6d4b00-770b-4ece-8e47-9821caeff592",
  isVerifiedProfile: true,
  autofill: {
    legalName: "CÔNG TY TNHH TRƯỜNG HOAN",
    taxCode: "0100255428",
    isTaxCodeLocked: true,
    addressDetail: "Cụm Công nghiệp Ngọc Hồi, Thanh Trì, Hà Nội",
    provinceCity: "Hà Nội",
    mainSectorName: "Nông nghiệp công nghệ cao, nông nghiệp số",
    sectorCode: "LV01",
    ownershipType: "Doanh nghiệp tư nhân",
    workforceScale: "50 - dưới 100 người",
    revenueRange: "Từ 10 đến dưới 50 tỷ VNĐ",
    operatingZone: "Cụm công nghiệp",
    highQualificationRatio: "10 - dưới 30%",
    hasRdUnit: false,
    hasMachineryUpgrade: true,
    hasTechTraining: false,
    hasRdBudget: false,
    isExporting: false,
    inValueChain: false,
    contactPerson: "Nguyễn Văn Hoan",
    contactEmail: "buyer.user@demo.nacentech.vn",
    contactPhone: "0912 345 678",
    website: "https://truonghoan-tech.vn",
  },
  existingEvaluation: {
    hasEvaluated: false,
    latestScore: null,
  },
};

const mockSubmitResponse = {
  surveyId: "surv-123",
  enterpriseId: "1a6d4b00-770b-4ece-8e47-9821caeff592",
  evaluationId: "eval-123",
  innovationScore: 73.5,
  innovationTier: "DEVELOPING",
  tniScore: 76.0,
  tniClassification: "HIGH",
  radarChart: [
    { axis: "Quản trị", score: 9.5, maxScore: 12, percentage: 79 },
    { axis: "R&D & CN", score: 13.0, maxScore: 18, percentage: 72 },
    { axis: "SP / Quy trình", score: 17.0, maxScore: 20, percentage: 85 },
    { axis: "Sở hữu trí tuệ", score: 8.0, maxScore: 10, percentage: 80 },
    { axis: "Chuyển đổi số", score: 7.0, maxScore: 10, percentage: 70 },
    { axis: "Thị trường", score: 9.0, maxScore: 15, percentage: 60 },
    { axis: "Nhân lực", score: 5.0, maxScore: 7, percentage: 71 },
    { axis: "Liên kết", score: 5.0, maxScore: 8, percentage: 62 },
  ],
  results: {
    totalScore: 73.5,
    classification: "DEVELOPING",
    classificationLabel: "Đang phát triển",
    badgeName: "Huy hiệu Bạc ĐMST",
    groupScores: [
      { groupCode: "QT", groupName: "Quản trị", score: 9.5, maxScore: 12, percentage: 79 },
      { groupCode: "CN", groupName: "R&D và Công nghệ", score: 13.0, maxScore: 18, percentage: 72 },
      { groupCode: "SP", groupName: "Sản phẩm / Quy trình", score: 17.0, maxScore: 20, percentage: 85 },
      { groupCode: "IP", groupName: "Sở hữu trí tuệ", score: 8.0, maxScore: 10, percentage: 80 },
      { groupCode: "S", groupName: "Chuyển đổi số", score: 7.0, maxScore: 10, percentage: 70 },
      { groupCode: "TT", groupName: "Thị trường", score: 9.0, maxScore: 15, percentage: 60 },
      { groupCode: "NL", groupName: "Nhân lực", score: 5.0, maxScore: 7, percentage: 71 },
      { groupCode: "LK", groupName: "Liên kết", score: 5.0, maxScore: 8, percentage: 62 },
    ],
    tni: {
      score: 76.0,
      classification: "HIGH",
      classificationName: "Nhu cầu cao",
      urgencyK: 4,
      impactL: 4,
      capacityN: 3,
      readinessO: 4,
    },
  },
};

describe("KhaoSatDmstPage (CR-2026-020 43 Questions Wizard)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/api/v1/surveys/innovation-demand/prefill")) {
          return {
            ok: true,
            json: async () => mockPrefillResponse,
          } as Response;
        }
        if (url.includes("/api/v1/surveys/innovation-demand/submit")) {
          return {
            ok: true,
            json: async () => mockSubmitResponse,
          } as Response;
        }
        return { ok: true, json: async () => ({}) } as Response;
      })
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders Step 1 cleanly blank and allows filling from detected profile with locked tax code", async () => {
    render(<KhaoSatDmstPage />);

    // Chờ prefill hoàn tất
    await waitFor(() => {
      expect(screen.getByText(/Khối I: Định Danh Pháp Nhân/i)).toBeInTheDocument();
    });

    // Form mở ra để trắng sạch
    const companyInput = screen.getByPlaceholderText(/Ví dụ: CÔNG TY TNHH CÔNG NGHỆ CHÍNH XÁC BẮC NINH/i);
    expect((companyInput as HTMLInputElement).value).toBe("");

    // Hiển thị gợi ý tài khoản Doanh nghiệp đã đăng nhập
    expect(screen.getByText(/Gợi ý: Phát hiện tài khoản Doanh nghiệp đã đăng nhập/i)).toBeInTheDocument();
    const fillBtn = screen.getByRole("button", { name: /Điền thông tin DN vào form/i });
    expect(fillBtn).toBeInTheDocument();

    // Bấm nút điền thông tin DN
    fireEvent.click(fillBtn);

    // Kiểm tra tên công ty đã được điền và trường MST bị khóa có huy hiệu SSOT
    await waitFor(() => {
      expect(screen.getByDisplayValue("CÔNG TY TNHH TRƯỜNG HOAN")).toBeInTheDocument();
    });
    const taxCodeInput = screen.getByDisplayValue("0100255428");
    expect(taxCodeInput).toBeDisabled();
    expect(screen.getByText(/Đã xác thực từ Hồ sơ Pháp nhân SSOT/i)).toBeInTheDocument();
  });

  it("navigates through steps 1 to 5 and updates step counter", async () => {
    render(<KhaoSatDmstPage />);

    await waitFor(() => {
      expect(screen.getByText(/Khối I: Định Danh Pháp Nhân/i)).toBeInTheDocument();
    });

    // Điền thông tin DN từ hồ sơ
    const fillBtn = screen.getByRole("button", { name: /Điền thông tin DN vào form/i });
    fireEvent.click(fillBtn);

    // Bấm Tiếp tục sang Bước 2
    const btnNext1 = screen.getByRole("button", { name: /Tiếp tục Bước 2/i });
    fireEvent.click(btnNext1);

    await waitFor(() => {
      expect(screen.getByText(/Khối II: Quản Trị & Nguồn Lực Đổi Mới Sáng Tạo/i)).toBeInTheDocument();
    });

    // Bấm Tiếp tục sang Bước 3
    const btnNext2 = screen.getByRole("button", { name: /Tiếp tục Bước 3/i });
    fireEvent.click(btnNext2);

    await waitFor(() => {
      expect(screen.getByText(/Khối III: Đổi Mới Sản Phẩm, Quy Trình/i)).toBeInTheDocument();
    });

    // Bấm Tiếp tục sang Bước 4
    const btnNext3 = screen.getByRole("button", { name: /Tiếp tục Bước 4/i });
    fireEvent.click(btnNext3);

    await waitFor(() => {
      expect(screen.getByText(/Khối IV: Hợp Tác Hệ Sinh Thái/i)).toBeInTheDocument();
    });

    // Bấm Tiếp tục sang Bước 5
    const btnNext4 = screen.getByRole("button", { name: /Tiếp tục Bước 5/i });
    fireEvent.click(btnNext4);

    await waitFor(() => {
      expect(screen.getByText(/Khối V: Nhu Cầu Công Nghệ, Chỉ Số TNI & Kiến Nghị/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Hoàn Thành & Nộp Phiếu Khảo Sát/i })).toBeInTheDocument();
    });
  });

  it("submits the survey and renders the Result Screen with radar chart and TNI badge", async () => {
    render(<KhaoSatDmstPage />);

    await waitFor(() => {
      expect(screen.getByText(/Khối I: Định Danh Pháp Nhân/i)).toBeInTheDocument();
    });

    // Điền thông tin DN từ hồ sơ
    const fillBtn = screen.getByRole("button", { name: /Điền thông tin DN vào form/i });
    fireEvent.click(fillBtn);

    // Nhảy tới bước 5 bằng nút Stepper
    const step5Button = screen.getByText(/C37 - C43/i).closest("button")!;
    fireEvent.click(step5Button);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Hoàn Thành & Nộp Phiếu Khảo Sát/i })).toBeInTheDocument();
    });

    // Chọn ít nhất 1 rào cản tại Câu 37
    const checkbox37 = screen.getByLabelText(/1\. Thiếu nguồn vốn/i);
    fireEvent.click(checkbox37);

    // Bấm nộp phiếu khảo sát
    const submitBtn = screen.getByRole("button", { name: /Hoàn Thành & Nộp Phiếu Khảo Sát/i });
    fireEvent.click(submitBtn);

    // Chờ màn hình kết quả hiển thị
    await waitFor(() => {
      expect(screen.getByText(/Kết Quả Đánh Giá Năng Lực Đổi Mới Sáng Tạo & Chỉ Số TNI/i)).toBeInTheDocument();
    });

    // Kiểm tra điểm số và huy hiệu
    expect(screen.getByText("73.5")).toBeInTheDocument();
    expect(screen.getByText("Đang phát triển")).toBeInTheDocument();
    expect(screen.getByText("76")).toBeInTheDocument();
    expect(screen.getByText("Nhu cầu cao")).toBeInTheDocument();

    // Kiểm tra liên kết xem hồ sơ doanh nghiệp
    const viewProfileLinks = screen.getAllByRole("link", { name: /Xem Hồ Sơ/i });
    expect(viewProfileLinks.length).toBeGreaterThan(0);
  });

  it("allows entering tax code and looking up enterprise info when unauthenticated", async () => {
    // Giả lập khách chưa đăng nhập (autofill = null)
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/api/v1/surveys/innovation-demand/prefill")) {
          return {
            ok: true,
            json: async () => ({
              isAuthenticated: false,
              enterpriseId: null,
              isVerifiedProfile: false,
              autofill: null,
            }),
          } as Response;
        }
        if (url.includes("/api/v1/enterprises/lookup-tax/")) {
          return {
            ok: true,
            json: async () => ({
              data: {
                found: true,
                source: "VIETQR",
                taxCode: "0108992134",
                name: "CÔNG TY CỔ PHẦN CÔNG NGHỆ TÂN TIẾN",
                address: "Tầng 5, Tòa nhà Innovation, Cầu Giấy, Hà Nội",
                province: "Hà Nội",
              },
            }),
          } as Response;
        }
        return { ok: true, json: async () => ({}) } as Response;
      })
    );

    render(<KhaoSatDmstPage />);

    await waitFor(() => {
      expect(screen.getByText(/Khối I: Định Danh Pháp Nhân/i)).toBeInTheDocument();
    });

    // Trường MST không bị khóa và nút Tra cứu MST hiển thị
    const taxInput = screen.getByPlaceholderText(/10 hoặc 13 chữ số MST/i);
    expect(taxInput).not.toBeDisabled();

    const lookupBtn = screen.getByRole("button", { name: /Tra cứu MST/i });
    expect(lookupBtn).toBeInTheDocument();

    // Nhập MST và bấm Tra cứu
    fireEvent.change(taxInput, { target: { value: "0108992134" } });
    fireEvent.click(lookupBtn);

    // Dữ liệu được tự động điền vào Tên DN và Địa chỉ
    await waitFor(() => {
      expect(screen.getByDisplayValue("CÔNG TY CỔ PHẦN CÔNG NGHỆ TÂN TIẾN")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Tầng 5, Tòa nhà Innovation, Cầu Giấy, Hà Nội")).toBeInTheDocument();
    });
  });
});
