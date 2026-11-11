import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import HomePage from "./page";
import { portalClient } from "@/lib/portal-client";
import { getActiveSectors } from "@/lib/master-data-client";
import { fetchPublicOffers } from "@/services/api/technology-offer";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/common/toast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("@/services/api/technology-offer", () => ({
  fetchPublicOffers: vi.fn().mockResolvedValue({
    success: true,
    data: [
      {
        id: "off-1",
        offerCode: "TECH-001",
        title: "Công nghệ xử lý nước thải",
        sectorCode: "LV01",
        trlLevel: 7,
      },
    ],
  }),
}));

vi.mock("@/lib/master-data-client", () => ({
  getActiveSectors: vi.fn().mockResolvedValue([
    { code: "LV01", name: "Công nghệ sinh học", description: "Mô tả sinh học" },
  ]),
}));

vi.mock("@/lib/portal-client", () => ({
  portalClient: {
    getStats: vi.fn(),
    getPublicDemands: vi.fn().mockResolvedValue([]),
  },
}));

describe("HomePage Component (TASK-01 Home Architecture & 4 Realtime Metrics)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders 4 realtime metrics cards via <Async> in success state", async () => {
    vi.spyOn(portalClient, "getStats").mockResolvedValue({
      totalOffers: 128,
      totalDemands: 45,
      totalEnterprises: 89,
      totalExperts: 34,
      totalProvinces: 12,
      totalSuccessfulConnections: 24,
      totalEstimatedValueMillionVnd: 5500,
      updatedAt: new Date().toISOString(),
    });

    render(<HomePage />);

    expect(await screen.findByText("128")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Công nghệ chào bán/i })).toBeInTheDocument();

    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Nhu cầu đặt hàng/i })).toBeInTheDocument();

    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Kết nối/i })).toBeInTheDocument();

    expect(screen.getByText("5,5 Tỷ VNĐ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Quy mô giao dịch/i })).toBeInTheDocument();
  });

  it("renders error state with retry button when portal stats fetch fails", async () => {
    vi.spyOn(portalClient, "getStats").mockRejectedValue(new Error("Lỗi mạng"));

    render(<HomePage />);

    expect(
      await screen.findByText("Không thể tải số liệu thống kê thời gian thực.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tải lại số liệu/i })).toBeInTheDocument();
  });

  it("renders ListingCard sector name and TRL badge as translucent frosted pills in a non-overlapping flex row", async () => {
    vi.spyOn(portalClient, "getStats").mockResolvedValue({
      totalOffers: 10,
      totalDemands: 5,
      totalEnterprises: 20,
      totalExperts: 8,
      totalProvinces: 12,
      totalSuccessfulConnections: 3,
      totalEstimatedValueMillionVnd: 1200,
      updatedAt: new Date().toISOString(),
    });
    vi.mocked(fetchPublicOffers).mockResolvedValueOnce({
      total: 1,
      data: [
        {
          id: "off-trl-1",
          offerCode: "TECH-009",
          title: "Hệ thống gia công chính xác CNC",
          sectorCode: "LV07",
          sectorName: "Cơ khí – chế tạo – công nghiệp hỗ trợ",
          trlLevel: 8,
          trlVerificationStatus: "SELF_DECLARED",
        } as any,
      ],
    });

    render(<HomePage />);

    const sectorPill = await screen.findByText("Cơ khí – chế tạo – công nghiệp hỗ trợ");
    expect(sectorPill.className).toContain("rounded-full");
    expect(sectorPill.className).toContain("bg-slate-900/75");
    expect(sectorPill.className).toContain("text-white");
    expect(sectorPill.className).toContain("backdrop-blur-md");

    const trlText = screen.getByText("TRL 8/9 (Chưa kiểm định)");
    const trlBadge = trlText.parentElement;
    expect(trlBadge?.className).toContain("rounded-full border");
    expect(trlBadge?.className).toContain("bg-slate-900/75");
    expect(trlBadge?.className).toContain("text-white");
    expect(trlBadge?.className).toContain("backdrop-blur-md");

    const headerOverlay = sectorPill.parentElement;
    expect(headerOverlay?.className).toContain("flex");
    expect(headerOverlay?.className).toContain("justify-between");
    expect(headerOverlay?.className).toContain("left-2.5");
    expect(headerOverlay?.className).toContain("right-2.5");
  });
});
