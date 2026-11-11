import React from "react";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import PortalDashboard from "./page";
import OpportunitiesPipelinePage from "./opportunities/pipeline/page";
import MatchingRadarPage from "./matching/radar/page";
import { authClient } from "@/lib/auth-client";
import * as techApi from "@/services/api/technology-offer";
import { brokerageApi } from "@/services/api/brokerage";

let mockPathname = "/portal";
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    getUser: vi.fn(),
  },
}));

vi.mock("@/services/api/technology-offer", () => ({
  fetchSellerWorkspace: vi.fn(),
}));

vi.mock("@/services/api/brokerage", () => ({
  brokerageApi: {
    getConnectionRequests: vi.fn(),
    getOpportunities: vi.fn(),
    getRadarCandidates: vi.fn(),
  },
}));

describe("Wave 1 QC Test Suite: Seller Dashboard & Zero Gov Leakage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/portal";
    mockSearchParams = new URLSearchParams();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("WAVE1-TEST-01: renders specialized SellerDashboard when role is SELLER", async () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u-seller",
      email: "seller@techcorp.vn",
      fullName: "Nguyễn Doanh Nghiệp",
      role: "SELLER",
    });

    vi.mocked(techApi.fetchSellerWorkspace).mockResolvedValue({
      kpi: {
        totalOffers: 8,
        publishedOffers: 6,
        pendingOffers: 2,
        draftOffers: 0,
        successfulConnections: 14,
      },
      data: [
        {
          id: "off-1",
          offerCode: "OFF-001",
          title: "Hệ thống AI IoT Giám sát Nông nghiệp",
          trlLevel: 7,
          status: "APPROVED",
          mainSectorName: "Nông nghiệp Công nghệ cao",
        } as any,
      ],
    });

    vi.mocked(brokerageApi.getConnectionRequests).mockResolvedValue([
      {
        id: "req-1",
        requestCode: "REQ-001",
        senderOrgName: "Công ty Mua Sắm B2B",
        message: "Cần tìm hiểu bản quyền sáng chế",
        status: "PENDING",
      } as any,
    ]);

    vi.mocked(brokerageApi.getOpportunities).mockResolvedValue([
      {
        id: "opp-1",
        stage: "NEGOTIATING",
        dealCode: "DEAL-001",
      } as any,
    ]);

    render(<PortalDashboard />);

    // 1. Executive Banner & Greetings
    await waitFor(() => {
      expect(screen.getByText(/Trung Tâm Quản Trị Gian Hàng Công Nghệ B2B/i)).toBeInTheDocument();
      expect(screen.getByText(/Xin chào, Nguyễn Doanh Nghiệp!/i)).toBeInTheDocument();
    });

    // 2. 4 Business KPI cards
    expect(screen.getByText(/Giải pháp Chào bán/i)).toBeInTheDocument();
    expect(screen.getByText(/Lượt Quan Tâm Gian Hàng/i)).toBeInTheDocument();
    expect(screen.getByText(/Yêu Cầu Kết Nối Mới/i)).toBeInTheDocument();
    expect(screen.getByText(/Thương Vụ Đang Đàm Phán/i)).toBeInTheDocument();

    // 3. Quick Actions
    const createLink = screen.getByRole("link", { name: /Đăng Giải Pháp Mới/i });
    expect(createLink).toHaveAttribute("href", "/portal/seller/technologies/create");
    expect(createLink.className).toContain("bg-white");
    expect(createLink.className).toContain("text-brand-700");

    // 4. Inbound Leads and Top Tech lists
    expect(screen.getByText("Công ty Mua Sắm B2B")).toBeInTheDocument();
    expect(screen.getByText("Hệ thống AI IoT Giám sát Nông nghiệp")).toBeInTheDocument();

    // 5. NEGATIVE ASSERTION: The 4 generic navigation cards (including Buyer demand card) MUST NOT exist!
    expect(screen.queryByText("Chọn mô-đun phù hợp với quyền và nhu cầu tác nghiệp của anh/chị.")).not.toBeInTheDocument();
  });

  it("WAVE1-TEST-02: zero Gov leakage in opportunities/pipeline header", async () => {
    vi.mocked(brokerageApi.getOpportunities).mockResolvedValue([]);
    vi.mocked(brokerageApi.getConnectionRequests).mockResolvedValue([]);

    render(<OpportunitiesPipelinePage />);

    // Negative Assertion: Link to /gov/opportunities must be purged
    expect(document.querySelector('a[href*="/gov/opportunities"]')).toBeNull();
    expect(screen.queryByText(/Giám Sát Sở KH&CN/i)).not.toBeInTheDocument();
  });

  it("WAVE1-TEST-03: zero Gov leakage in matching/radar header", async () => {
    vi.mocked(brokerageApi.getRadarCandidates).mockResolvedValue([]);
    vi.mocked(brokerageApi.getConnectionRequests).mockResolvedValue([]);

    render(<MatchingRadarPage />);

    // Negative Assertion: Link to /gov/opportunities must be purged
    expect(document.querySelector('a[href*="/gov/opportunities"]')).toBeNull();
    expect(screen.queryByText(/Cổng Giám Sát Sở KH&CN/i)).not.toBeInTheDocument();
  });
});