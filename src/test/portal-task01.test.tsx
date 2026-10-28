import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";
import TechmartEventsPage from "@/app/trien-lam/page";
import { AIAssistantWidget } from "@/components/home/AIAssistantWidget";
import { portalClient } from "@/lib/portal-client";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/",
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    getUser: () => null,
    onSessionChange: vi.fn(),
    getAuthHeaders: () => ({}),
  },
}));

vi.mock("@/components/common/toast", () => ({
  useToast: () => ({
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  mockPush.mockClear();
});

describe("TASK-01: Portal Home, Live Stats & Techmart Showcase", () => {
  it("portalClient.getStats correctly calls API and returns PortalOverviewStats DTO", async () => {
    const mockStats = {
      totalOffers: 125,
      totalDemands: 89,
      totalEnterprises: 310,
      totalExperts: 96,
      totalProvinces: 63,
      updatedAt: "2026-10-11T12:00:00Z",
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockStats }),
      })
    );

    const stats = await portalClient.getStats();
    expect(stats.totalOffers).toBe(125);
    expect(stats.totalDemands).toBe(89);
    expect(stats.totalProvinces).toBe(63);
    expect(stats.totalEnterprises).toBe(310);
  });

  it("portalClient.listEvents fetches techmart event listing", async () => {
    const mockEvents = [
      {
        id: "77777777-7777-7777-7777-777777777701",
        title: "Techmart Hà Nội 2026",
        description: "Hội chợ triển lãm công nghệ quốc gia",
        location: "Hà Nội",
        startDate: "2026-11-15T08:00:00Z",
        endDate: "2026-11-18T17:00:00Z",
        status: "UPCOMING",
        technologiesCount: 45,
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { items: mockEvents, total: 1 } }),
      })
    );

    const res = await portalClient.listEvents("UPCOMING");
    expect(res.total).toBe(1);
    expect(res.data[0].title).toBe("Techmart Hà Nội 2026");
  });

  it("portalClient.registerEvent submits payload and receives registrationCode", async () => {
    const mockRes = {
      registrationCode: "TM-202610-8888",
      status: "CONFIRMED",
      registeredAt: "2026-10-11T14:00:00Z",
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockRes }),
      })
    );

    const res = await portalClient.registerEvent({
      eventId: "77777777-7777-7777-7777-777777777701",
      organizationName: "Viện Hàn Lâm KH&CN",
      contactName: "Nguyễn Văn Test",
      phoneNumber: "0912345678",
      email: "test@vienhanlam.vn",
      roleType: "VISITOR",
    });

    expect(res.registrationCode).toBe("TM-202610-8888");
    expect(res.status).toBe("CONFIRMED");
  });

  it("HomePage renders 4-Tab Quick Search, Metric links and interactive controls (Zero-Shallow)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            totalOffers: 150,
            totalDemands: 90,
            totalEnterprises: 320,
            totalExperts: 100,
            totalProvinces: 63,
            updatedAt: "2026-10-11T00:00:00Z",
          },
        }),
      })
    );

    render(<HomePage />);

    // 1. Kiểm tra thanh tìm kiếm phẳng và từ khóa gợi ý hiện diện
    expect(screen.getByPlaceholderText(/Tìm công nghệ, lĩnh vực, đơn vị chuyển giao/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tìm kiếm/i })).toBeInTheDocument();
    expect(screen.getByText(/Gợi ý tìm kiếm:/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sàn Sự Kiện Techmart/i })).toHaveAttribute("href", "/trien-lam");

    // 2. Kiểm tra các thẻ Metric Card có link chuyển trang (Không còn là thẻ chết)
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Công nghệ chào bán/i })).toHaveAttribute(
        "href",
        "/chao-ban-cong-nghe"
      );
      expect(screen.getByRole("link", { name: /Nhu cầu đặt hàng/i })).toHaveAttribute(
        "href",
        "/nhu-cau-cong-nghe"
      );
      expect(screen.getByRole("link", { name: /Tỉnh, thành kết nối/i })).toHaveAttribute(
        "href",
        "/matrix"
      );
      expect(screen.getByRole("link", { name: /Doanh nghiệp tham gia/i })).toHaveAttribute(
        "href",
        "/enterprises"
      );
    });

    // 3. Kiểm tra Nút Đăng Ký Tư Vấn Thẩm Định có link điều hướng (Không còn nút chết)
    expect(screen.getByRole("link", { name: /Đăng Ký Tư Vấn Thẩm Định/i })).toHaveAttribute(
      "href",
      "/khao-sat-nhu-cau"
    );

    // 3b. Kiểm tra 4 Card Khảo Sát & Đánh Giá Năng Lực Quốc Gia (TNI, TT17, DN ĐMST, TRL 1-9)
    expect(screen.getByRole("link", { name: /Làm Khảo Sát TNI Ngay/i })).toHaveAttribute(
      "href",
      "/khao-sat-nhu-cau"
    );
    expect(screen.getByRole("link", { name: /Tự Đánh Giá TT17 Ngay/i })).toHaveAttribute(
      "href",
      "/assessments/tt17/wizard"
    );
    expect(screen.getByRole("link", { name: /Tra Cứu & Đánh Giá ĐMST/i })).toHaveAttribute(
      "href",
      "/doanh-nghiep-dmst"
    );
    expect(screen.getByRole("link", { name: /Khám Phá Công Nghệ TRL/i })).toHaveAttribute(
      "href",
      "/chao-ban-cong-nghe"
    );

    // 4. KIỂM THỬ TƯƠNG TÁC THỰC: Submit form tìm kiếm phải gọi router.push
    const searchInput = screen.getByPlaceholderText(/Tìm công nghệ/i);
    fireEvent.change(searchInput, { target: { value: "Robot Laser" } });
    const searchButton = screen.getByRole("button", { name: /Tìm kiếm/i });
    fireEvent.click(searchButton);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("/chao-ban-cong-nghe?q=Robot%20Laser")
    );

    // 5. KIỂM THỬ TƯƠNG TÁC THỰC: Click từ khóa gợi ý phải gọi router.push
    const kwButton = screen.getByRole("button", { name: "AI thị giác máy" });
    fireEvent.click(kwButton);
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("/chao-ban-cong-nghe?q=AI%20th%E1%BB%8B%20gi%C3%A1c%20m%C3%A1y")
    );
  });

  it("AIAssistantWidget renders floating FAB and opens chat conversation", async () => {
    render(<AIAssistantWidget />);
    const fab = screen.getByRole("button", { name: "Mở Trợ lý Ảo AI NacentTwin" });
    expect(fab).toBeInTheDocument();
    fireEvent.click(fab);
    expect(screen.getByText("Trợ Lý Ảo AI NacentTwin")).toBeInTheDocument();
  });

  it("TechmartEventsPage renders event list and opens registration modal", async () => {
    const mockEvents = [
      {
        id: "77777777-7777-7777-7777-777777777701",
        title: "Techmart Hà Nội 2026: Giải Pháp Chuyển Đổi Số",
        description: "Hội chợ triển lãm công nghệ",
        location: "Hà Nội",
        startDate: "2026-11-15T08:00:00Z",
        endDate: "2026-11-18T17:00:00Z",
        status: "UPCOMING",
        technologiesCount: 45,
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { items: mockEvents, total: 1 } }),
      })
    );

    render(<TechmartEventsPage />);

    expect(
      await screen.findByText("Techmart Hà Nội 2026: Giải Pháp Chuyển Đổi Số")
    ).toBeInTheDocument();

    const regButtons = screen.getAllByRole("button", { name: /Đăng Ký Tham Gia/i });
    expect(regButtons.length).toBeGreaterThan(0);
    fireEvent.click(regButtons[0]);

    expect(
      screen.getByText("Đăng Ký Tham Gia Phiên Chào Giá Techmart")
    ).toBeInTheDocument();
  });
});
