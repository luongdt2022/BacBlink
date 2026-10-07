import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ExpertsDirectoryPage from "./page";

// Mock global fetch
const mockExpertsData = {
  success: true,
  data: {
    items: [
      {
        expertCode: "CG-NACEN-TEST01",
        fullName: "GS.TS. Nguyễn Văn An",
        academicRank: "GS",
        degree: "DOCTOR",
        organizationName: "Viện Ứng Dụng Công Nghệ",
        positionTitle: "Viện trưởng",
        primarySectorCode: "03",
        primarySectorName: "03. Điện tử & CNTT",
        expertiseSectors: ["03", "04"],
        masteredTechCodes: ["CN01", "CN02"],
        provinceCode: "HN",
        provinceName: "Hà Nội",
        publicationCount: 45,
        patentCount: 3,
        projectCount: 12,
        isVerified: true,
        isAcceptingConsultation: true,
      },
    ],
    totalCount: 1,
    page: 1,
    pageSize: 9,
    totalPages: 1,
  },
};

const setupFetch = (directory = mockExpertsData) => {
  const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/v1/sectors")) return { ok: true, json: async () => ({ success: true, data: [{ code: "LV01", name: "Nông nghiệp" }] }) } as Response;
    if (url.includes("/public-provinces")) return { ok: true, json: async () => ({ success: true, data: [{ code: "HN", name: "Hà Nội" }] }) } as Response;
    if (url.includes("/consultation-requests")) return { ok: true, status: 202, json: async () => ({ success: true, message: "Accepted" }) } as Response;
    return { ok: true, json: async () => directory } as Response;
  });
  return fetchSpy;
};

describe("ExpertsDirectoryPage Component (/experts)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the directory with hero banner and search form", async () => {
    setupFetch();

    render(<ExpertsDirectoryPage />);

    expect(screen.getByText("Danh Bạ Chuyên Gia Khoa Học & Công Nghệ")).toBeDefined();
    expect(screen.getByPlaceholderText(/Tìm theo họ tên chuyên gia/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText("GS.TS. Nguyễn Văn An")).toBeDefined();
    });

    expect(screen.getByText("Viện Ứng Dụng Công Nghệ")).toBeDefined();
    expect(screen.getAllByText("Giáo sư (GS)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Đã xác thực")).toBeDefined();
    expect(screen.getByText("Lĩnh vực chuyên môn (1)")).toBeDefined();
    expect(screen.getByText("Nông nghiệp")).toBeDefined();
  });

  it("handles empty state when no experts match filter", async () => {
    setupFetch({
      success: true,
      data: {
        items: [], totalCount: 0, page: 1, pageSize: 9, totalPages: 0,
      },
    });

    render(<ExpertsDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId("expert-empty-state")).toBeDefined();
      expect(screen.getByText("Không tìm thấy chuyên gia phù hợp")).toBeDefined();
    });
  });

  it("opens modal to send connection request when clicking connect button", async () => {
    const fetchSpy = setupFetch();

    render(<ExpertsDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByText("GS.TS. Nguyễn Văn An")).toBeDefined();
    });

    const connectBtns = screen.getAllByTitle("Gửi yêu cầu kết nối");
    fireEvent.click(connectBtns[0]);

    expect(screen.getByText("Gửi Yêu Cầu Kết Nối & Tư Vấn")).toBeDefined();
    expect(screen.getByPlaceholderText(/VD: Công ty Cổ phần Công nghệ ABC/i)).toBeDefined();
    fireEvent.change(screen.getByPlaceholderText(/VD: Công ty Cổ phần Công nghệ ABC/i), { target: { value: "Công ty A" } });
    fireEvent.change(screen.getByPlaceholderText(/Mô tả ngắn gọn khó khăn kỹ thuật/i), { target: { value: "Tối ưu dây chuyền" } });
    fireEvent.change(screen.getByPlaceholderText(/Nguyễn Văn A/i), { target: { value: "Nguyễn Văn B" } });
    fireEvent.change(screen.getByPlaceholderText(/0912345678/i), { target: { value: "0912345678" } });
    fireEvent.change(screen.getByPlaceholderText(/contact@doanhnghiep.vn/i), { target: { value: "user@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Gửi yêu cầu" }));
    await waitFor(() => expect(screen.getByText("Đã tiếp nhận yêu cầu")).toBeDefined());
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/public/experts/CG-NACEN-TEST01/consultation-requests"),
      expect.objectContaining({ method: "POST" }),
    );
  });
});
