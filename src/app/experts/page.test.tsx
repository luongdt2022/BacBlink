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
        masteredTechCodes: ["TECH-AI-VISION", "TECH-SUPERCRITICAL-CO2", "TECH-IOT-GATEWAY"],
        provinceCode: "HN",
        provinceName: "Hà Nội",
        publicationCount: 45,
        patentCount: 3,
        projectCount: 12,
        isVerified: true,
        isAcceptingConsultation: true,
        connectionCount: 12,
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
        connectionCount: 0,
      },
      {
        expertCode: "CG-NACEN-NOCOUNT",
        fullName: "KS. Lê Hoàng Long",
        academicRank: "NONE",
        degree: "ENGINEER",
        organizationName: "Viện Tự Động Hóa",
        positionTitle: "Kỹ sư trưởng",
        primarySectorCode: "03",
        primarySectorName: "03. Điện tử & CNTT",
        expertiseSectors: ["03"],
        masteredTechCodes: ["TECH-AI-VISION"],
        provinceCode: "HN",
        provinceName: "Hà Nội",
        publicationCount: 0,
        patentCount: 0,
        projectCount: 0,
        isVerified: true,
        isAcceptingConsultation: true,
      },
    ],
    totalCount: 3,
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

    // Thẻ chuyên gia 1 có TECH-AI-VISION và TECH-SUPERCRITICAL-CO2 (xuất hiện ở Spotlight Rail và Thẻ kết quả)
    expect(screen.getAllByText("Thị giác máy tính AI").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Chiết xuất CO2 siêu tới hạn").length).toBeGreaterThanOrEqual(1);

    // Thẻ chuyên gia 2 có TECH-IOT-GATEWAY
    expect(screen.getAllByText("Cổng kết nối IoT Gateway").length).toBeGreaterThanOrEqual(1);

    // Khẳng định KHÔNG xuất hiện chuỗi mã thô nào bắt đầu bằng TECH-
    expect(screen.queryByText(/TECH-AI-VISION/i)).toBeNull();
    expect(screen.queryByText(/TECH-SUPERCRITICAL-CO2/i)).toBeNull();
    expect(screen.queryByText(/TECH-IOT-GATEWAY/i)).toBeNull();

    // Khẳng định nhãn công nghệ trên card không mang class font-mono
    const aiBadges = screen.getAllByText("Thị giác máy tính AI");
    const cardBadge = aiBadges.find((el) => el.className.includes("font-sans"));
    expect(cardBadge).toBeDefined();
    expect(cardBadge?.className).not.toContain("font-mono");
    expect(cardBadge?.className).toContain("font-sans");
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

  it("supports searchable multi-select province combobox with checkboxes (TASK-05-CR144)", async () => {
    setupFetch();

    render(<ExpertsDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId("province-filter-combobox")).toBeDefined();
    });

    // 1. Click trigger để mở combobox
    const trigger = screen.getByTestId("province-filter-combobox");
    fireEvent.click(trigger);

    // 2. Ô tìm kiếm xuất hiện
    const searchInput = screen.getByTestId("province-search-input");
    expect(searchInput).toBeDefined();

    // 3. Tích chọn checkbox Hà Nội (HN) và Đà Nẵng (DN)
    const hnCheckbox = screen.getByTestId("province-checkbox-HN");
    const dnCheckbox = screen.getByTestId("province-checkbox-DN");
    fireEvent.click(hnCheckbox);
    fireEvent.click(dnCheckbox);

    // 4. Trigger hiển thị số lượng đã chọn
    expect(screen.getByText(/Đã chọn \(2 Tỉnh\/TP\)/i)).toBeDefined();

    // 5. Active chips xuất hiện cho cả 2 tỉnh
    await waitFor(() => {
      expect(screen.getByText(/Địa bàn: Sở KH&CN TP. Hà Nội/i)).toBeDefined();
      expect(screen.getByText(/Địa bàn: Sở KH&CN TP. Đà Nẵng/i)).toBeDefined();
    });

    // 6. Nhập từ khóa tìm kiếm lọc danh sách tỉnh
    fireEvent.change(searchInput, { target: { value: "Hải Phòng" } });
    expect(screen.getByTestId("province-checkbox-HP")).toBeDefined();
    expect(screen.queryByTestId("province-checkbox-SG")).toBeNull();
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

  it("automatically imports and suggests logged in user info in connection modal", async () => {
    localStorage.setItem(
      "nacentwin_user_context",
      JSON.stringify({
        id: "usr-123",
        fullName: "Trần Doanh Nghiệp",
        organizationName: "Công ty Cổ phần Cơ Điện Tân Tiến",
        email: "contact@tantien.vn",
        phone: "0912345678",
        role: "BUYER",
      })
    );
    setupFetch();

    render(<ExpertsDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByText("GS.TS. Nguyễn Văn An")).toBeDefined();
    });

    const connectBtns = screen.getAllByTitle("Gửi yêu cầu kết nối");
    fireEvent.click(connectBtns[0]);

    expect(screen.getByText("Gửi Yêu Cầu Kết Nối & Tư Vấn")).toBeDefined();
    expect(screen.getByText(/Đang đăng nhập:/i)).toBeDefined();
    expect(screen.getByText("Trần Doanh Nghiệp")).toBeDefined();
    expect(screen.getByText(/Đã tự động điền thông tin/i)).toBeDefined();

    const companyInput = screen.getByPlaceholderText(/VD: Công ty Cổ phần Công nghệ ABC/i) as HTMLInputElement;
    const nameInput = screen.getByPlaceholderText(/Nguyễn Văn A/i) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText(/contact@doanhnghiep.vn/i) as HTMLInputElement;

    expect(companyInput.value).toBe("Công ty Cổ phần Cơ Điện Tân Tiến");
    expect(nameInput.value).toBe("Trần Doanh Nghiệp");
    expect(emailInput.value).toBe("contact@tantien.vn");

    localStorage.removeItem("nacentwin_user_context");
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

  it("renders friendly expert avatars on cards with fallback support", async () => {
    setupFetch();

    render(<ExpertsDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByText("GS.TS. Nguyễn Văn An")).toBeDefined();
    });

    const avatarContainers = screen.getAllByTestId("expert-avatar-container");
    expect(avatarContainers.length).toBeGreaterThanOrEqual(2);
    // Verified badges exist on avatars
    const verifiedBadges = screen.getAllByTestId("expert-avatar-verified-badge");
    expect(verifiedBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("renders primary sector badge and up to 2 tech chips on Spotlight Rail (T147)", async () => {
    setupFetch();

    render(<ExpertsDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId("featured-experts-rail")).toBeDefined();
    });

    const rail = screen.getByTestId("featured-experts-rail");
    // Spotlight rail hiển thị badge ngành chuyên môn chính
    expect(rail.textContent).toContain("03. Điện tử & CNTT");
    // Spotlight rail hiển thị chip công nghệ tiêu biểu qua resolveTechLabel
    expect(rail.textContent).toContain("Thị giác máy tính AI");
    expect(rail.textContent).toContain("Chiết xuất CO2 siêu tới hạn");
  });

  it("replaces naked +N text with standardized Pill Badge '+{count} công nghệ' (T148)", async () => {
    setupFetch();

    render(<ExpertsDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByText("GS.TS. Nguyễn Văn An")).toBeDefined();
    });

    // Chuyên gia 1 có 3 công nghệ -> hiển thị Pill Badge "+1 công nghệ"
    const pillBadge = screen.getByTestId("expert-tech-pill-badge");
    expect(pillBadge).toBeDefined();
    expect(pillBadge.textContent).toBe("+1 công nghệ");
    expect(pillBadge.className).toContain("rounded-full");
    expect(pillBadge.className).toContain("bg-slate-100");

    // Khẳng định KHÔNG còn text trần "+1" không viền không khối
    const nakedText = screen.queryByText(/^\+1$/);
    expect(nakedText).toBeNull();
  });

  it("renders Social Proof Badge when connectionCount > 0 and strictly hides when 0 or undefined (BR-DELTA-01, T148)", async () => {
    setupFetch();

    render(<ExpertsDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByText("GS.TS. Nguyễn Văn An")).toBeDefined();
    });

    // Chuyên gia 1 có connectionCount = 12 -> hiển thị Social Proof Badge
    const connectionBadges = screen.getAllByTestId("expert-connection-badge");
    expect(connectionBadges.length).toBe(1);
    expect(connectionBadges[0].textContent).toContain("12 lượt kết nối");
    expect(connectionBadges[0].textContent).toContain("🤝");

    // Chuyên gia 2 (connectionCount = 0) và Chuyên gia 3 (undefined) -> TUYỆT ĐỐI KHÔNG hiển thị badge
    expect(screen.queryByText(/0 lượt kết nối/i)).toBeNull();
  });

  it("renders elegant sliding window pagination with ellipsis, quick jump, and page size selector when totalPages > 1 (TASK-05-PAGINATION)", async () => {
    const multiPageData = {
      ...mockExpertsData,
      data: {
        ...mockExpertsData.data,
        totalCount: 1081,
        page: 24,
        pageSize: 9,
        totalPages: 121,
      },
    };
    setupFetch(multiPageData);

    render(<ExpertsDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByText("GS.TS. Nguyễn Văn An")).toBeDefined();
    });

    // 1. Kiểm tra summary bên trái: hiển thị gọn gàng, không bị ép chữ dọc
    expect(screen.getAllByText(/Hiển thị/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("1.081")).toBeDefined();
    expect(screen.getByText("Trang 24 / 121")).toBeDefined();

    // 2. Kiểm tra bộ chọn pageSize
    const pageSizeSelect = screen.getByLabelText("Số bản ghi mỗi trang") as HTMLSelectElement;
    expect(pageSizeSelect).toBeDefined();
    expect(pageSizeSelect.value).toBe("9");

    // 3. Kiểm tra sliding window: Trang hiện tại 24 -> có nút 1, dots, 23, 24, 25, dots, 121
    expect(screen.getByRole("button", { name: "1" })).toBeDefined();
    expect(screen.getByRole("button", { name: "23" })).toBeDefined();
    expect(screen.getByRole("button", { name: "24" })).toBeDefined();
    expect(screen.getByRole("button", { name: "25" })).toBeDefined();
    expect(screen.getByRole("button", { name: "121" })).toBeDefined();

    // Tuyệt đối KHÔNG render tràn lan 121 nút số (ví dụ trang 10 hay 50 không nằm trong sliding window)
    expect(screen.queryByRole("button", { name: "10" })).toBeNull();
    expect(screen.queryByRole("button", { name: "50" })).toBeNull();

    // 4. Kiểm tra nút điều hướng
    expect(screen.getByLabelText("Trang đầu tiên")).toBeDefined();
    expect(screen.getByLabelText("Trang trước")).toBeDefined();
    expect(screen.getByLabelText("Trang sau")).toBeDefined();
    expect(screen.getByLabelText("Trang cuối cùng")).toBeDefined();

    // 5. Kiểm tra form quick jump
    const jumpInput = screen.getByLabelText("Nhập số trang cần đến");
    expect(jumpInput).toBeDefined();
  });
});

