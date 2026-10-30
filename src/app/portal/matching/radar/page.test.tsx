import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import MatchingRadarPage from "./page";
import { brokerageApi } from "@/services/api/brokerage";
import { authClient } from "@/lib/auth-client";

const mockToastError = vi.fn();
vi.mock("@/components/common/toast", () => ({
  useToast: () => ({
    error: mockToastError,
    warning: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/enterprise/SectorBannerBackground", () => ({
  SectorBannerBackground: () => <div data-testid="sector-banner-bg" />,
}));

describe("MatchingRadarPage - AI Matching, Demands Guard & Toast Integration", () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();

    // Default fetch mock for buyer demands
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (typeof url === "string" && url.includes("/api/v1/buyer/demands")) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: "dem-1", title: "Nhu cầu kiểm thử" }],
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    }) as any;
  });

  it("handles request error using toast.error without invoking window.alert", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    vi.spyOn(brokerageApi, "getRadarCandidates").mockResolvedValue([]);
    vi.spyOn(brokerageApi, "getConnectionRequests").mockResolvedValue([
      {
        id: "req-101",
        requestCode: "CONN-REQ-101",
        senderUserId: "user-1",
        demandId: "dem-1",
        offerId: "off-1",
        senderOrgName: "Doanh Nghiệp A",
        senderRole: "BUYER",
        receiverUserId: "user-2",
        receiverOrgName: "Viện Hàn Lâm",
        proposedBudgetRange: "500M - 1B",
        status: "PENDING",
        responseNote: null,
        respondedAt: null,
        message: "Mong muốn thảo luận chuyển giao",
        createdAt: "2026-10-15T08:00:00Z",
      },
    ]);
    vi.spyOn(brokerageApi, "respondConnectionRequest").mockRejectedValue(
      new Error("Lỗi mạng máy chủ trung gian")
    );

    render(<MatchingRadarPage />);

    // Switch to requests tab
    const requestsTabBtn = screen.getByRole("button", { name: /Yêu Cầu Kết Nối/i });
    fireEvent.click(requestsTabBtn);

    // Wait for the request to show
    expect(await screen.findByText("CONN-REQ-101")).toBeInTheDocument();

    // Click Chấp nhận
    const acceptBtn = screen.getByRole("button", { name: /Chấp nhận/i });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Lỗi mạng máy chủ trung gian",
        "Thao Tác Thất Bại"
      );
    });

    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("renders demand selection and Explainable AI (XAI) breakdown correctly when user has >= 1 demand", async () => {
    vi.spyOn(brokerageApi, "getRadarCandidates").mockResolvedValue([
      {
        id: "cand-1",
        demandId: "dem-1",
        demandCode: "DMD-001",
        demandTitle: "Hệ thống sấy nông sản lạnh",
        buyerOrganizationId: "org-buyer",
        buyerOrganizationName: "Doanh Nghiệp Mua",
        offerId: "off-1",
        offerCode: "OFF-001",
        offerTitle: "Công nghệ sấy thăng hoa chân không",
        sellerOrganizationId: "org-seller",
        sellerOrganizationName: "Viện Cơ điện Nông nghiệp",
        sectorCode: "AGRI_TECH",
        matchScore: 92,
        tniScore: 85,
        trlLevel: 7,
        ipStatus: "Đã cấp bằng sáng chế",
        isActive: true,
        createdAt: "2026-10-20T00:00:00Z",
      },
    ]);

    render(<MatchingRadarPage />);

    // Check header and demand selector label
    expect(screen.getByText(/Radar Ghép Nối Cung–Cầu/i)).toBeInTheDocument();
    expect(await screen.findByText("Bài toán nguồn:")).toBeInTheDocument();

    // Check candidate card
    expect(await screen.findByText("Công nghệ sấy thăng hoa chân không")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();

    // Check Explainable AI (XAI) section
    expect(screen.getByText(/Giải trình độ tương thích AI/i)).toBeInTheDocument();
    expect(screen.getByText("100% Khớp")).toBeInTheDocument();
    expect(screen.getAllByText("TRL 7").length).toBeGreaterThan(0);
    expect(screen.getByText("85/100")).toBeInTheDocument();
  });

  it("renders Empty State 'Radar Ghép Nối AI Chưa Kích Hoạt' and does NOT call getRadarCandidates when user has 0 demands (REQ-DEL-08-01, REQ-DEL-08-02, BR-DEL-08-01)", async () => {
    vi.spyOn(authClient, "getUser").mockReturnValue({
      id: "u-buyer-0",
      fullName: "Bên Mua Chưa Có Nhu Cầu",
      role: "BUYER",
      email: "buyer0@corp.vn",
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (typeof url === "string" && url.includes("/api/v1/buyer/demands")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }) as any;

    const getCandidatesSpy = vi.spyOn(brokerageApi, "getRadarCandidates");

    render(<MatchingRadarPage />);

    // Assert Interactive Guiding Empty State appears
    expect(await screen.findByText("Radar Ghép Nối AI Chưa Kích Hoạt")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Thuật toán Radar AI cần ít nhất 01 Nhu cầu công nghệ làm tâm đối sánh để phân tích điểm TRL, TNI và đề xuất các giải pháp công nghệ phù hợp nhất/i
      )
    ).toBeInTheDocument();

    // Primary Action CTA
    const primaryCta = screen.getByRole("link", { name: /\+ Gửi Nhu Cầu Công Nghệ Đầu Tiên/i });
    expect(primaryCta).toBeInTheDocument();
    expect(primaryCta).toHaveAttribute("href", "/khao-sat-nhu-cau");

    // Secondary Action CTA
    const secondaryCta = screen.getByRole("link", { name: /Khám phá Sàn Công nghệ/i });
    expect(secondaryCta).toBeInTheDocument();
    expect(secondaryCta).toHaveAttribute("href", "/chao-ban-cong-nghe");

    // Zero-Mock verification: Must NOT call getRadarCandidates()
    expect(getCandidatesSpy).not.toHaveBeenCalled();
  });

  it("renders radar candidates normally for Admin supervisory role even if demands count is 0", async () => {
    vi.spyOn(authClient, "getUser").mockReturnValue({
      id: "u-admin",
      fullName: "Quản Trị Viên Giám Sát",
      role: "ADMIN",
      email: "admin@gov.vn",
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (typeof url === "string" && url.includes("/api/v1/buyer/demands")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }) as any;

    const getCandidatesSpy = vi.spyOn(brokerageApi, "getRadarCandidates").mockResolvedValue([
      {
        id: "cand-admin-1",
        demandId: "dem-all-1",
        demandCode: "DMD-ALL-001",
        demandTitle: "Hệ thống giám sát vi khí hậu nông nghiệp",
        buyerOrganizationId: "org-buyer-admin",
        buyerOrganizationName: "DN Nông Nghiệp Xanh",
        offerId: "off-admin-1",
        offerCode: "OFF-002",
        offerTitle: "Cảm biến IoT LoRaWAN công nghiệp",
        sellerOrganizationId: "org-seller-admin",
        sellerOrganizationName: "Viện Điện Tử Tin Học",
        sectorCode: "LV01",
        matchScore: 88,
        tniScore: 82,
        trlLevel: 8,
        ipStatus: "PATENT_GRANTED",
        isActive: true,
        createdAt: "2026-10-25T00:00:00Z",
      },
    ]);

    render(<MatchingRadarPage />);

    expect(await screen.findByText("Bài toán nguồn:")).toBeInTheDocument();
    expect(await screen.findByText("Cảm biến IoT LoRaWAN công nghiệp")).toBeInTheDocument();
    expect(getCandidatesSpy).toHaveBeenCalled();
    expect(screen.queryByText("Radar Ghép Nối AI Chưa Kích Hoạt")).not.toBeInTheDocument();
  });
});
