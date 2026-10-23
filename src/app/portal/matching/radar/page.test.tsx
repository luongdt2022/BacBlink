import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import MatchingRadarPage from "./page";
import { brokerageApi } from "@/services/api/brokerage";

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

describe("MatchingRadarPage - AI Matching & Toast Integration", () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
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

  it("renders demand selection and Explainable AI (XAI) breakdown correctly", async () => {
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
    expect(screen.getByText("Bài toán nguồn:")).toBeInTheDocument();

    // Check candidate card
    expect(await screen.findByText("Công nghệ sấy thăng hoa chân không")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();

    // Check Explainable AI (XAI) section
    expect(screen.getByText(/Giải trình độ tương thích AI/i)).toBeInTheDocument();
    expect(screen.getByText("100% Khớp")).toBeInTheDocument();
    expect(screen.getAllByText("TRL 7").length).toBeGreaterThan(0);
    expect(screen.getByText("85/100")).toBeInTheDocument();
  });
});
