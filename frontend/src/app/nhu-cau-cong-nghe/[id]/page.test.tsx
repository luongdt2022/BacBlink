import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import PublicDemandDetailPage from "./page";
import { authClient, ROLES } from "@/lib/auth-client";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "dem-test-01" }),
}));

const mockDemandDetail = {
  id: "dem-test-01",
  itemCode: "DMD-202610-DT01",
  stageName: "Kiểm định chất lượng (QC/KCS)",
  technicalProblem: "Tự động hóa phát hiện khuyết tật mối hàn vi mạch SMT bằng AI",
  sectorCode: "LV08",
  techGroupCode: "CN01",
  budgetRange: "2 - 5 tỷ đồng",
  tniScore: 96,
  tniClassification: "VERY_HIGH",
  expectedGoal: "Giảm tỷ lệ lỗi xuống 0.1%",
  desiredSolution: "Hệ thống quang học 3D kết hợp AI Deep Learning",
  province: "Bắc Ninh",
};

const setupFetch = (submitSuccess = true) => {
  return vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes("/api/v1/public/demands/dem-test-01/offer")) {
      if (submitSuccess) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            opportunityCode: "DEAL-2026-TEST",
            message: "Đã gửi đề xuất thành công.",
          }),
        } as Response;
      } else {
        return {
          ok: false,
          json: async () => ({ message: "Lỗi kết nối khi gửi đề xuất." }),
        } as Response;
      }
    }
    if (url.includes("/api/v1/public/demands/dem-test-01")) {
      return {
        ok: true,
        json: async () => mockDemandDetail,
      } as Response;
    }
    return { ok: true, json: async () => ({}) } as Response;
  });
};

describe("PublicDemandDetailPage Component (/nhu-cau-cong-nghe/[id])", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    authClient.clearSession();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    authClient.clearSession();
  });

  it("renders demand detail correctly with PDPD privacy protection info", async () => {
    setupFetch();
    render(<PublicDemandDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Tự động hóa phát hiện khuyết tật mối hàn vi mạch SMT bằng AI")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("DMD-202610-DT01")).toBeInTheDocument();
    expect(screen.getByText(/Nghị định 13\/2023\/NĐ-CP \(PDPD\)/i)).toBeInTheDocument();
  });

  it("auto-fills sellerName, sellerEmail, and sellerPhone when logged-in user types solution title", async () => {
    setupFetch();

    authClient.setSession("seller-token", {
      id: "u-seller-01",
      email: "supplier@viencn.gov.vn",
      fullName: "Viện Nghiên Cứu Vi Mạch Bán Dẫn",
      role: ROLES.SELLER,
      organizationName: "Viện Nghiên Cứu Vi Mạch Bán Dẫn",
      phone: "0988776655",
    });

    render(<PublicDemandDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Nộp Đề Xuất Giải Pháp")).toBeInTheDocument();
    });

    // Ban đầu ô đơn vị và email chưa có giá trị
    const titleInput = screen.getByPlaceholderText(/Ví dụ: Thiết bị kiểm định thị giác AI/i);
    const sellerInput = screen.getByPlaceholderText(/Viện \/ Trường \/ Doanh nghiệp/i) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText(/seller@domain.vn/i) as HTMLInputElement;
    const phoneInput = screen.getByPlaceholderText(/0912xxxxxx/i) as HTMLInputElement;

    expect(sellerInput.value).toBe("");
    expect(emailInput.value).toBe("");

    // Khi người dùng gõ tên giải pháp
    fireEvent.change(titleInput, { target: { value: "Hệ thống camera quét quang học AOI" } });

    // Tự động điền đơn vị, email, sđt từ tài khoản
    expect(sellerInput.value).toBe("Viện Nghiên Cứu Vi Mạch Bán Dẫn");
    expect(emailInput.value).toBe("supplier@viencn.gov.vn");
    expect(phoneInput.value).toBe("0988776655");

    // Hiển thị thông báo trạng thái tự động điền
    expect(screen.getByText(/Đã tự động điền đơn vị, email và SĐT từ tài khoản đăng nhập/i)).toBeInTheDocument();
  });

  it("submits offer and displays guidance to track progress in Pipeline", async () => {
    setupFetch(true);

    authClient.setSession("seller-token", {
      id: "u-seller-01",
      email: "contact@techvina.com",
      fullName: "Công ty Cổ phần Công nghệ TechVina",
      role: ROLES.SELLER,
      organizationName: "TechVina Solution",
      phone: "0912345678",
    });

    render(<PublicDemandDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Nộp Đề Xuất Giải Pháp")).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText(/Ví dụ: Thiết bị kiểm định thị giác AI/i);
    fireEvent.change(titleInput, { target: { value: "Thiết bị kiểm định AI 3D tiên tiến" } });

    const submitBtn = screen.getByRole("button", { name: /Gửi Chào Bán Giải Pháp/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Đã Gửi Đề Xuất Thành Công!")).toBeInTheDocument();
    });

    // Kiểm tra hiển thị mã kết nối và hướng dẫn nơi kiểm tra tiến trình
    expect(screen.getByText(/Mã cơ hội: DEAL-2026-TEST/i)).toBeInTheDocument();
    expect(screen.getByText(/Nơi kiểm tra thông báo & tiến trình xử lý:/i)).toBeInTheDocument();
    expect(screen.getByText(/Tiến trình Chuyển giao & MOU/i)).toBeInTheDocument();

    // Có link điều hướng thẳng tới Pipeline
    const pipelineLink = screen.getByRole("link", { name: /Xem Tiến Trình Hợp Tác Trong Pipeline/i });
    expect(pipelineLink).toHaveAttribute("href", "/portal/opportunities/pipeline");
  });

  it("renders pending approval banner and locks offer form when status is PENDING", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/v1/public/demands/dem-test-01")) {
        return {
          ok: true,
          json: async () => ({
            ...mockDemandDetail,
            status: "PENDING",
            canSubmitOffer: false,
          }),
        } as Response;
      }
      return { ok: true, json: async () => ({}) } as Response;
    });

    render(<PublicDemandDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Hồ Sơ Nhu Cầu Đang Chờ Thẩm Định")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Hồ sơ bài toán đang chờ Ban Quản trị Hiệp hội BACLINK thẩm định/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText("CHỜ HIỆP HỘI THẨM ĐỊNH").length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Bài toán đang trong quy trình thẩm định sơ bộ của Ban Cố vấn Hiệp hội BACLINK/i)
    ).toBeInTheDocument();
    expect(screen.queryByText("Nộp Đề Xuất Giải Pháp")).not.toBeInTheDocument();
  });

  it("renders VERIFIED status and opens offer form when status is VERIFIED", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/v1/public/demands/dem-test-01")) {
        return {
          ok: true,
          json: async () => ({
            ...mockDemandDetail,
            status: "VERIFIED",
            canSubmitOffer: true,
          }),
        } as Response;
      }
      return { ok: true, json: async () => ({}) } as Response;
    });

    render(<PublicDemandDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText("ĐANG MỞ TÌM CUNG").length).toBeGreaterThan(0);
    });

    expect(screen.queryByText("Hồ Sơ Nhu Cầu Đang Chờ Thẩm Định")).not.toBeInTheDocument();
    expect(screen.getByText("Nộp Đề Xuất Giải Pháp")).toBeInTheDocument();
  });
});
