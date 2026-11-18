import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminDashboard from "./page";

const { getActiveSectorsMock, getStatsMock } = vi.hoisted(() => ({
  getActiveSectorsMock: vi.fn(),
  getStatsMock: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    getUser: () => ({
      id: "baclink-admin-id",
      email: "admin@baclink.org.vn",
      fullName: "Ban Quản trị BACLINK",
      role: "ADMIN",
    }),
    getToken: () => "test-token",
  },
}));

vi.mock("@/lib/master-data-client", () => ({
  getActiveSectors: getActiveSectorsMock,
}));

vi.mock("@/lib/portal-client", () => ({
  portalClient: {
    getStats: getStatsMock,
  },
}));

describe("AdminDashboard — CR-BACLINK-007 KPI & 3-Tier BACLINK Overview", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders shimmer skeletons on KPI cards and approval queue banner while loading, then renders BACLINK metrics with zero legacy terms", async () => {
    let resolveSectors!: (rows: Array<{ code: string; name: string }>) => void;
    let resolveStats!: (stats: {
      totalOffers: number;
      totalDemands: number;
      totalEnterprises: number;
      totalExperts: number;
      totalProvinces: number;
      updatedAt: string;
    }) => void;
    let resolveApprovals!: (res: unknown) => void;

    getActiveSectorsMock.mockReturnValue(
      new Promise((resolve) => {
        resolveSectors = resolve;
      })
    );
    getStatsMock.mockReturnValue(
      new Promise((resolve) => {
        resolveStats = resolve;
      })
    );
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        resolveApprovals = resolve;
      })
    );

    const { container } = render(<AdminDashboard />);

    const kpiSkeleton = screen.getByTestId("admin-kpi-skeleton");
    expect(kpiSkeleton).toHaveAttribute("aria-busy", "true");
    expect(kpiSkeleton.querySelectorAll(".animate-shimmer").length).toBeGreaterThanOrEqual(8);

    const queueBadgeSkeleton = screen.getByTestId("admin-queue-badge-skeleton");
    expect(queueBadgeSkeleton).toHaveAttribute("aria-busy", "true");

    const queueDescSkeleton = screen.getByTestId("admin-queue-desc-skeleton");
    expect(queueDescSkeleton).toHaveAttribute("aria-busy", "true");

    expect(screen.queryByText("Chưa có dữ liệu")).not.toBeInTheDocument();
    expect(screen.queryByText("Không có hồ sơ chờ")).not.toBeInTheDocument();

    resolveSectors([
      { code: "IND_ELEC", name: "Điện tử, Bán dẫn & Thiết bị điện" },
      { code: "IND_MECH", name: "Cơ khí chính xác" },
    ]);
    resolveStats({
      totalOffers: 10,
      totalDemands: 8,
      totalEnterprises: 7,
      totalExperts: 5,
      totalProvinces: 1,
      updatedAt: "2026-11-18T00:00:00Z",
    });
    resolveApprovals({
      ok: true,
      json: async () => ({ total: 3, data: [] }),
    });

    const kpiGrid = await screen.findByTestId("admin-kpi-grid");
    expect(screen.queryByTestId("admin-kpi-skeleton")).not.toBeInTheDocument();
    expect(kpiGrid).toHaveTextContent("12");
    expect(kpiGrid).toHaveTextContent("6 / 6 KCN");
    expect(kpiGrid).toHaveTextContent("2");
    expect(kpiGrid).toHaveTextContent("3");
    expect(screen.getByText("3 hồ sơ chờ xét duyệt")).toBeInTheDocument();
    expect(screen.getByText("ENTERPRISE (Dual-Mode: Bên Mua & Bên Bán)")).toBeInTheDocument();

    // Brand & scope purity checks (BR-BL07-BRAND-PURITY-002)
    const fullText = container.textContent || "";
    expect(fullText).not.toMatch(/TT17|Phiếu khảo sát|ĐMST|Sở KH&CN|34 tỉnh|Tầng 1 Sở Tỉnh|NacenTech|NacenTwin/i);
  });

  it("renders real zeroes and empty queue state only after API settles with zero counts", async () => {
    getActiveSectorsMock.mockResolvedValue([]);
    getStatsMock.mockResolvedValue({
      totalOffers: 0,
      totalDemands: 0,
      totalEnterprises: 0,
      totalExperts: 0,
      totalProvinces: 0,
      updatedAt: "2026-11-18T00:00:00Z",
    });
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ total: 0, data: [] }),
    });

    render(<AdminDashboard />);

    const kpiGrid = await screen.findByTestId("admin-kpi-grid");
    expect(kpiGrid).toHaveTextContent("6 / 6 KCN");
    expect(kpiGrid).toHaveTextContent("Chưa có dữ liệu");
    expect(kpiGrid).toHaveTextContent("Chưa có danh mục");
    expect(screen.getAllByText("Không có hồ sơ chờ").length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByText("Tất cả hồ sơ đăng ký và chào bán công nghệ đã được xử lý xong.")
    ).toBeInTheDocument();
  });
});
