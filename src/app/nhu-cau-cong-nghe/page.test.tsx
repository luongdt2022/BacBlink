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

const setupFetch = (bookmarkedIds: string[] = []) => {
  return vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/v1/sectors")) {
      return {
        ok: true,
        json: async () => ({ success: true, data: mockSectors }),
      } as Response;
    }
    if (url.includes("/api/v1/demands/bookmarks/ids")) {
      return {
        ok: true,
        json: async () => bookmarkedIds,
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
    window.scrollTo = vi.fn();
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

    // Kiểm tra các thành phần Banner đại diện và nội dung nguyên bản:
    // 1. Công đoạn và Giải pháp mong muốn
    expect(screen.getAllByText(/Công đoạn:/i).length).toBe(2);
    expect(screen.getAllByText(/Giải pháp mong muốn:/i).length).toBe(2);

    // 2. Icon bảo vệ danh tính PDPD (đã thu gọn không còn text thừa)
    expect(screen.getAllByTitle(/Bảo vệ danh tính \(PDPD\)/i).length).toBe(2);
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

  it("handles client-side pagination (9 items per page) and page navigation correctly", async () => {
    // Tạo 12 items giả lập để chia thành 2 trang (Trang 1: 9 items, Trang 2: 3 items)
    const manyDemands = Array.from({ length: 12 }, (_, index) => ({
      id: `dem-bulk-${index + 1}`,
      itemCode: `DMD-202610-${String(index + 1).padStart(3, "0")}`,
      stageName: `Công đoạn số ${index + 1}`,
      technicalProblem: `Bài toán kỹ thuật kiểm thử phân trang số ${index + 1}`,
      sectorCode: "LV08",
      techGroupCode: "CN01",
      budgetRange: "1 - 2 tỷ đồng",
      tniScore: 80,
      tniClassification: "VERY_HIGH",
      expectedGoal: `Mục tiêu ${index + 1}`,
      desiredSolution: `Giải pháp ${index + 1}`,
      province: "Hà Nội",
    }));

    vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
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
          json: async () => manyDemands,
        } as Response;
      }
      return { ok: true, json: async () => ({}) } as Response;
    });

    render(<PublicDemandsPage />);

    // Chờ danh sách tải xong: Trang 1 hiển thị 9 items đầu tiên
    await waitFor(() => {
      expect(screen.getByText("Bài toán kỹ thuật kiểm thử phân trang số 1")).toBeInTheDocument();
    });
    expect(screen.getByText("Bài toán kỹ thuật kiểm thử phân trang số 9")).toBeInTheDocument();
    // Item thứ 10 không nằm trên Trang 1
    expect(screen.queryByText("Bài toán kỹ thuật kiểm thử phân trang số 10")).not.toBeInTheDocument();

    // Kiểm tra controls phân trang hiển thị đúng 2 trang
    const page2Button = screen.getByRole("button", { name: "2" });
    expect(page2Button).toBeInTheDocument();

    // Chuyển sang Trang 2
    fireEvent.click(page2Button);

    // Trang 2 hiển thị các items 10, 11, 12 và không còn hiển thị item 1
    expect(screen.getByText("Bài toán kỹ thuật kiểm thử phân trang số 10")).toBeInTheDocument();
    expect(screen.getByText("Bài toán kỹ thuật kiểm thử phân trang số 12")).toBeInTheDocument();
    expect(screen.queryByText("Bài toán kỹ thuật kiểm thử phân trang số 1")).not.toBeInTheDocument();
  });

  it("prompts login modal and warning when unauthenticated user clicks bookmark button (CR-DEMAND-BOOKMARK)", async () => {
    setupFetch();
    render(<PublicDemandsPage />);

    await waitFor(() => {
      expect(screen.getByText("Tự động hóa phát hiện khuyết tật mối hàn vi mạch SMT bằng AI")).toBeInTheDocument();
    });

    const bookmarkButtons = screen.getAllByTitle("Lưu theo dõi bài toán");
    expect(bookmarkButtons.length).toBeGreaterThan(0);

    // Bấm nút bookmark khi chưa đăng nhập
    fireEvent.click(bookmarkButtons[0]);

    // Modal xác thực đăng nhập phải xuất hiện với đúng thông điệp
    await waitFor(() => {
      expect(
        screen.getByText("Quý đơn vị vui lòng đăng nhập tài khoản Doanh nghiệp hoặc Chuyên gia để lưu bài toán vào danh sách theo dõi.")
      ).toBeInTheDocument();
      expect(screen.getByText("Đăng Nhập Ngay")).toBeInTheDocument();
    });
  });

  it("loads bookmarked IDs from server and allows authenticated user to toggle bookmark (CR-DEMAND-BOOKMARK)", async () => {
    authClient.setSession("test-token-jwt", {
      id: "buyer-user-01",
      email: "buyer@nacentech.vn",
      role: ROLES.BUYER,
    });

    let toggled = false;
    vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/sectors")) {
        return { ok: true, json: async () => ({ success: true, data: mockSectors }) } as Response;
      }
      if (url.includes("/api/v1/demands/bookmarks/ids")) {
        return { ok: true, json: async () => ["dem-001"] } as Response;
      }
      if (url.includes("/api/v1/public/demands")) {
        return { ok: true, json: async () => mockDemands } as Response;
      }
      if (url.includes("/api/v1/demands/dem-002/bookmark") && init?.method === "POST") {
        toggled = true;
        expect(init.headers).toEqual(
          expect.objectContaining({
            Authorization: "Bearer test-token-jwt",
          })
        );
        return {
          ok: true,
          json: async () => ({ isBookmarked: true, message: "Đã lưu bài toán thành công." }),
        } as Response;
      }
      return { ok: true, json: async () => ({}) } as Response;
    });

    render(<PublicDemandsPage />);

    await waitFor(() => {
      expect(screen.getByText("Tự động hóa phát hiện khuyết tật mối hàn vi mạch SMT bằng AI")).toBeInTheDocument();
    });

    // dem-001 đã bookmark từ server -> hiển thị title "Bỏ lưu theo dõi"
    await waitFor(() => {
      expect(screen.getByTitle("Bỏ lưu theo dõi")).toBeInTheDocument();
    });

    // dem-002 chưa bookmark -> có title "Lưu theo dõi bài toán"
    const saveButton = screen.getByTitle("Lưu theo dõi bài toán");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toggled).toBe(true);
    });

    // Sau khi toggle thành công, cả 2 bài toán đều ở trạng thái "Bỏ lưu theo dõi"
    await waitFor(() => {
      const bookmarkedButtons = screen.getAllByTitle("Bỏ lưu theo dõi");
      expect(bookmarkedButtons.length).toBe(2);
    });
  });

  it("filters demands by bookmarked status when 'Đã lưu' pill is clicked (CR-DEMAND-BOOKMARK)", async () => {
    authClient.setSession("test-token-jwt", {
      id: "buyer-user-01",
      email: "buyer@nacentech.vn",
      role: ROLES.BUYER,
    });

    setupFetch(["dem-001"]);
    render(<PublicDemandsPage />);

    await waitFor(() => {
      expect(screen.getByText("Tự động hóa phát hiện khuyết tật mối hàn vi mạch SMT bằng AI")).toBeInTheDocument();
    });

    // Nút lọc "Đã lưu" hiển thị số lượng 1
    const bookmarkFilterButton = screen.getByTitle("Lọc các bài toán đã lưu theo dõi");
    expect(bookmarkFilterButton).toBeInTheDocument();
    expect(bookmarkFilterButton).toHaveTextContent("Đã lưu");
    expect(bookmarkFilterButton).toHaveTextContent("1");

    // Click vào bộ lọc "Đã lưu"
    fireEvent.click(bookmarkFilterButton);

    // Chỉ còn dem-001 hiển thị, dem-002 bị ẩn
    expect(
      screen.getByText("Tự động hóa phát hiện khuyết tật mối hàn vi mạch SMT bằng AI")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Khắc phục hiện tượng nứt chân chim và co ngót khí khi đúc áp lực")
    ).not.toBeInTheDocument();

    // Click "Xóa lọc" để trở lại bình thường
    const clearFilterButton = screen.getByTitle("Xóa bộ lọc");
    fireEvent.click(clearFilterButton);

    // Cả 2 bài toán đều hiển thị trở lại
    expect(
      screen.getByText("Tự động hóa phát hiện khuyết tật mối hàn vi mạch SMT bằng AI")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Khắc phục hiện tượng nứt chân chim và co ngót khí khi đúc áp lực")
    ).toBeInTheDocument();
  });
});

