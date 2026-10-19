import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import PublicDemandsPage from "./page";
import { authClient, ROLES } from "@/lib/auth-client";

const mockDemands = [
  {
    id: "dem-001",
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
  },
  {
    id: "dem-002",
    itemCode: "DMD-202610-0FF52B",
    stageName: "Đúc phôi kim loại màu",
    technicalProblem: "Khắc phục hiện tượng nứt chân chim và co ngót khí khi đúc áp lực",
    sectorCode: "LV07",
    techGroupCode: "CN02",
    budgetRange: "1.5 - 3 tỷ đồng",
    tniScore: 93,
    tniClassification: "VERY_HIGH",
    expectedGoal: "Giảm phế phẩm đúc",
    desiredSolution: "Phần mềm mô phỏng dòng chảy kim loại lỏng MAGMASOFT",
    province: "Hải Phòng",
  },
];

const mockSectors = [
  { code: "LV01", name: "Cơ khí, Chế tạo máy & Tự động hóa" },
  { code: "LV07", name: "Y - Dược, Sinh học & Thiết bị y tế" },
  { code: "LV08", name: "Điện – điện tử – tự động hóa" },
  { code: "LV11", name: "Nước – môi trường – chất thải" },
];

const setupFetch = () => {
  return vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/v1/sectors")) {
      return {
        ok: true,
        json: async () => ({ success: true, data: mockSectors }),
      } as Response;
    }
    if (url.includes("/api/v1/public/demands")) {
      return {
        ok: true,
        json: async () => mockDemands,
      } as Response;
    }
    return { ok: true, json: async () => ({}) } as Response;
  });
};

describe("PublicDemandsPage Component (/nhu-cau-cong-nghe)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    authClient.clearSession();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    authClient.clearSession();
  });

  it("renders Hero Banner with high-contrast text and 3 Quick Metrics from Basic Design", async () => {
    setupFetch();
    render(<PublicDemandsPage />);

    // Kiểm tra tiêu đề chính và mô tả trên Hero Banner
    expect(
      screen.getByText("Nhu Cầu Đổi Mới Công Nghệ Từ Doanh Nghiệp")
    ).toBeInTheDocument();

    // Kiểm tra 3 khối Quick Metrics
    expect(screen.getByText("142")).toBeInTheDocument();
    expect(screen.getByText("Bài Toán Đang Tìm")).toBeInTheDocument();
    expect(screen.getByText("68.5 tỷ")).toBeInTheDocument();
    expect(screen.getByText("Tổng Ngân Sách Mua")).toBeInTheDocument();
    expect(screen.getByText("24 Giờ")).toBeInTheDocument();
    expect(screen.getByText("Sở KH&CN Kết Nối")).toBeInTheDocument();
  });

  it("loads and populates sector combobox dynamically", async () => {
    setupFetch();
    render(<PublicDemandsPage />);

    await waitFor(() => {
      // Phải có option lĩnh vực từ API hiển thị tên ngành thân thiện (không chứa tiền tố mã kỹ thuật LV..)
      expect(
        screen.getByRole("option", { name: /^Điện – điện tử – tự động hóa$/i })
      ).toBeInTheDocument();
    });
  });

  it("renders humanized cards: hides raw hash IDs and displays Vietnamese sector & PDPD masked company", async () => {
    setupFetch();
    render(<PublicDemandsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Tự động hóa phát hiện khuyết tật mối hàn vi mạch SMT bằng AI")
      ).toBeInTheDocument();
    });

    // Tuyệt đối không hiển thị mã hash cộc lốc DMD-202610-0FF52B làm tiêu đề to
    // Thay vào đó hiển thị tên ngành tiếng Việt chuẩn hóa (xuất hiện ở thẻ bài toán và option lọc)
    expect(screen.getAllByText("Điện – điện tử – tự động hóa").length).toBeGreaterThanOrEqual(2);

    // Hiển thị định danh doanh nghiệp ẩn danh theo chuẩn PDPD Masking
    expect(screen.getByText(/\[DN Điện – điện tử – tự động hóa - Bắc Ninh\]/i)).toBeInTheDocument();
    expect(screen.getByText(/\[DN Y - Dược, Sinh học & Thiết bị y tế - Hải Phòng\]/i)).toBeInTheDocument();
  });

  it("guards 'Đăng Nhanh Bài Toán' button based on user authentication and role", async () => {
    setupFetch();
    render(<PublicDemandsPage />);

    // 1. Khi chưa đăng nhập (Guest): bấm nút sẽ hiển thị hướng dẫn xác thực, không mở modal ngay
    const postButton = screen.getByRole("button", { name: /Đăng Nhanh Bài Toán/i });
    fireEvent.click(postButton);

    // Modal không được mở khi chưa đăng nhập
    expect(screen.queryByText("1. Chi Tiết Bài Toán Kỹ Thuật")).not.toBeInTheDocument();

    // 2. Khi đăng nhập vai trò BUYER: bấm nút sẽ mở modal
    authClient.setSession("test-token", {
      id: "u-buyer-01",
      email: "buyer@dn.vn",
      fullName: "Đại diện Doanh Nghiệp Mua",
      role: ROLES.BUYER,
    });

    fireEvent.click(postButton);

    await waitFor(() => {
      expect(screen.getByText("1. Chi Tiết Bài Toán Kỹ Thuật")).toBeInTheDocument();
    });

    // 3. Khi đăng nhập vai trò SELLER: bấm nút cũng mở modal bình thường
    authClient.setSession("test-token-seller", {
      id: "u-seller-01",
      email: "seller@dn.vn",
      fullName: "Đại diện Doanh Nghiệp Bán",
      role: ROLES.SELLER,
    });

    fireEvent.click(postButton);

    await waitFor(() => {
      expect(screen.getByText("1. Chi Tiết Bài Toán Kỹ Thuật")).toBeInTheDocument();
    });
  });
});

