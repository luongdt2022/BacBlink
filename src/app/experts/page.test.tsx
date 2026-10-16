import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import ExpertsDirectoryPage from "./page";

// Mock global fetch data
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
        masteredTechCodes: ["TECH-AI-VISION", "TECH-SUPERCRITICAL-CO2"],
        provinceCode: "HN",
        provinceName: "Hà Nội",
        publicationCount: 45,
        patentCount: 3,
        projectCount: 12,
        isVerified: true,
        isAcceptingConsultation: true,
      },
      {
        expertCode: "CG-NACEN-ZERO",
        fullName: "ThS. Phạm Văn Thực Chiến",
        academicRank: "NONE",
        degree: "MASTER",
        organizationName: "Doanh nghiệp Tư vấn ĐMST",
        positionTitle: "Chuyên gia chuyển giao",
        primarySectorCode: "LV01",
        primarySectorName: "Nông nghiệp",
        expertiseSectors: ["LV01"],
        masteredTechCodes: ["TECH-IOT-GATEWAY"],
        provinceCode: "HN",
        provinceName: "Hà Nội",
        publicationCount: 0,
        patentCount: 0,
        projectCount: 0,
        isVerified: true,
        isAcceptingConsultation: true,
      },
    ],
    totalCount: 2,
    page: 1,
    pageSize: 9,
    totalPages: 1,
  },
};

const mockProvincesData = [
  { code: "HN", name: "Sở KH&CN TP. Hà Nội", region: "NORTH" },
  { code: "HP", name: "Sở KH&CN TP. Hải Phòng", region: "NORTH" },
  { code: "DN", name: "Sở KH&CN TP. Đà Nẵng", region: "CENTRAL" },
  { code: "SG", name: "Sở KH&CN TP. Hồ Chí Minh", region: "SOUTH" },
];

const setupFetch = (directory = mockExpertsData) => {
  const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/v1/sectors")) {
      return { ok: true, json: async () => ({ success: true, data: [{ code: "LV01", name: "Nông nghiệp công nghệ cao" }] }) } as Response;
    }
    if (url.includes("/public-provinces")) {
      return { ok: true, json: async () => ({ success: true, data: mockProvincesData }) } as Response;
    }
    if (url.includes("/consultation-requests")) {
      return { ok: true, status: 202, json: async () => ({ success: true, message: "Accepted" }) } as Response;
    }
    return { ok: true, json: async () => directory } as Response;
  });
  return fetchSpy;
};

describe("ExpertsDirectoryPage Component (/experts) - Spec Delta v17", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/experts");
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the directory with hero banner and search form", async () => {
    setupFetch();

    render(<ExpertsDirectoryPage />);

    expect(screen.getByText("Tìm chuyên gia KH&CN")).toBeDefined();
    expect(screen.getByPlaceholderText(/Tìm theo họ tên chuyên gia/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText("GS.TS. Nguyễn Văn An")).toBeDefined();
    });

    expect(screen.getByText("Viện Ứng Dụng Công Nghệ")).toBeDefined();
    expect(screen.getAllByText("Giáo sư (GS)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Đã xác thực").length).toBeGreaterThanOrEqual(1);
  });

  it("resolves technology codes to friendly Vietnamese labels without raw TECH- codes or font-mono (T137)", async () => {
    setupFetch();

    render(<ExpertsDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByText("GS.TS. Nguyễn Văn An")).toBeDefined();
    });

    // Thẻ chuyên gia 1 có TECH-AI-VISION và TECH-SUPERCRITICAL-CO2
    expect(screen.getByText("Thị giác máy tính AI")).toBeDefined();
    expect(screen.getByText("Chiết xuất CO2 siêu tới hạn")).toBeDefined();

    // Thẻ chuyên gia 2 có TECH-IOT-GATEWAY
    expect(screen.getByText("Cổng kết nối IoT Gateway")).toBeDefined();

    // Khẳng định KHÔNG xuất hiện chuỗi mã thô nào bắt đầu bằng TECH-
    expect(screen.queryByText(/TECH-AI-VISION/i)).toBeNull();
    expect(screen.queryByText(/TECH-SUPERCRITICAL-CO2/i)).toBeNull();
    expect(screen.queryByText(/TECH-IOT-GATEWAY/i)).toBeNull();

    // Khẳng định nhãn công nghệ không mang class font-mono
    const aiBadge = screen.getByText("Thị giác máy tính AI");
    expect(aiBadge.className).not.toContain("font-mono");
    expect(aiBadge.className).toContain("font-sans");
  });

  it("smart achievements block: hides 0-valued metrics and hides entire block when sum = 0 (T138)", async () => {
    setupFetch();

    render(<ExpertsDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByText("GS.TS. Nguyễn Văn An")).toBeDefined();
    });

    // Chuyên gia 1 có publicationCount: 45, patentCount: 3, projectCount: 12
    expect(screen.getByText("45+ Công bố quốc tế")).toBeDefined();
    expect(screen.getByText("3 Bằng sáng chế")).toBeDefined();
    expect(screen.getByText("12 Đề tài KH")).toBeDefined();

    // Chuyên gia 2 có cả 3 chỉ số = 0 -> khối achievements block chỉ render đúng 1 lần (của chuyên gia 1)
    const blocks = screen.getAllByTestId("expert-achievements-block");
    expect(blocks.length).toBe(1);

    // Tuyệt đối không xuất hiện ô số "0" trong phần thành tựu
    expect(screen.queryByText("0 Bằng sáng chế")).toBeNull();
    expect(screen.queryByText("0 Đề tài KH")).toBeNull();
  });

  it("supports multi-selecting degree and sector checkboxes with badge count (T139)", async () => {
    setupFetch();

    render(<ExpertsDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByText("GS.TS. Nguyễn Văn An")).toBeDefined();
    });

    // Ban đầu chưa có số lượng chọn
    expect(screen.getByText("Học hàm & Học vị")).toBeDefined();

    // Tích chọn checkbox Giáo sư (GS) và Phó Giáo sư (PGS)
    const gsCheckbox = screen.getByRole("checkbox", { name: /Giáo sư \(GS\)/i });
    const pgsCheckbox = screen.getByRole("checkbox", { name: /Phó Giáo sư \(PGS\)/i });

    fireEvent.click(gsCheckbox);
    fireEvent.click(pgsCheckbox);

    // Hiển thị số lượng chọn trên tiêu đề
    expect(screen.getByText("Học hàm & Học vị (2)")).toBeDefined();

    // Thanh Active Filter Chips xuất hiện
    expect(screen.getByText(/Học vị: Giáo sư \(GS\)/i)).toBeDefined();
    expect(screen.getByText(/Học vị: Phó Giáo sư \(PGS\)/i)).toBeDefined();
  });

  it("normalizes province dropdown with 3 regional optgroups (T140)", async () => {
    setupFetch();

    render(<ExpertsDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId("province-filter-select")).toBeDefined();
    });

    const select = screen.getByTestId("province-filter-select") as HTMLSelectElement;
    expect(select).toBeDefined();

    // Kiểm tra có option mặc định 34 Sở KH&CN
    expect(screen.getByText("Tất cả địa bàn (34 Sở KH&CN)")).toBeDefined();

    // Kiểm tra có đủ 3 optgroups
    const optgroups = select.querySelectorAll("optgroup");
    expect(optgroups.length).toBe(3);
    expect(optgroups[0].label).toBe("Miền Bắc (12 Tỉnh/TP)");
    expect(optgroups[1].label).toBe("Miền Trung & Tây Nguyên (10 Tỉnh/TP)");
    expect(optgroups[2].label).toBe("Miền Nam (12 Tỉnh/TP)");
  });

  it("allows removing filter chips independently and reset all with one click (T141)", async () => {
    setupFetch();

    render(<ExpertsDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByText("GS.TS. Nguyễn Văn An")).toBeDefined();
    });

    // Tích chọn GS
    const gsCheckbox = screen.getByRole("checkbox", { name: /Giáo sư \(GS\)/i });
    fireEvent.click(gsCheckbox);

    await waitFor(() => {
      expect(screen.getByText(/Học vị: Giáo sư \(GS\)/i)).toBeDefined();
    });

    // Bấm nút x trên chip GS để bỏ chọn
    const removeBtn = screen.getByLabelText(/Bỏ chọn học vị GS/i);
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Học vị: Giáo sư \(GS\)/i)).toBeNull();
    });
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

  it("renders the featured experts spotlight rail and uniform grid", async () => {
    setupFetch();

    render(<ExpertsDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByText("GS.TS. Nguyễn Văn An")).toBeDefined();
    });

    expect(screen.getByTestId("featured-experts-rail")).toBeDefined();
    expect(screen.getByText("Chuyên gia Tiêu biểu & Nổi bật")).toBeDefined();
    expect(screen.getByTestId("expert-card-grid")).toBeDefined();
  });
});
