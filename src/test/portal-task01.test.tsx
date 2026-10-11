import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";
import TechmartEventsPage from "@/app/trien-lam/page";
import { AIAssistantWidget } from "@/components/home/AIAssistantWidget";
import { portalClient } from "@/lib/portal-client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
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
});

describe("TASK-01: Portal Home, Live Stats & Techmart Showcase", () => {
  it("portalClient.getStats correctly calls API and returns PortalOverviewStats DTO", async () => {
    const mockStats = {
      totalOffers: 125,
      totalDemands: 89,
      totalEnterprises: 310,
      totalExperts: 96,
      totalProvinces: 34,
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
    expect(stats.totalProvinces).toBe(34);
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

  it("HomePage renders Techmart navigation and Floating AI Widget", async () => {
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
            totalProvinces: 34,
            updatedAt: "2026-10-11T00:00:00Z",
          },
        }),
      })
    );

    render(<HomePage />);

    // Link Sàn Sự Kiện Techmart
    expect(screen.getByRole("link", { name: /Sàn Sự Kiện Techmart/i })).toHaveAttribute(
      "href",
      "/trien-lam"
    );

    // Nút kích hoạt AI trên HomePage
    expect(
      screen.getByRole("button", { name: "Mở Trợ Lý AI" })
    ).toBeInTheDocument();
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
