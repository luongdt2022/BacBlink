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
      id: "super-admin-id",
      email: "super.admin@demo.nacentech.vn",
      fullName: "Super Admin",
      role: "SUPER_ADMIN",
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

describe("AdminDashboard — CR-2026-029 KPI & Queue Shimmer Skeleton (BR-ADM-LOAD-01)", () => {
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

  it("renders shimmer skeletons on KPI cards and approval queue banner with zero fake strings while loading, then renders real API metrics", async () => {
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

    render(<AdminDashboard />);

    const kpiSkeleton = screen.getByTestId("admin-kpi-skeleton");
    expect(kpiSkeleton).toHaveAttribute("aria-busy", "true");
    expect(kpiSkeleton.querySelectorAll(".animate-shimmer").length).toBeGreaterThanOrEqual(8);

    const queueBadgeSkeleton = screen.getByTestId("admin-queue-badge-skeleton");
    expect(queueBadgeSkeleton).toHaveAttribute("aria-busy", "true");
    expect(queueBadgeSkeleton).toHaveClass("animate-shimmer");

    const queueDescSkeleton = screen.getByTestId("admin-queue-desc-skeleton");
    expect(queueDescSkeleton).toHaveAttribute("aria-busy", "true");
    expect(queueDescSkeleton).toHaveClass("animate-shimmer");

    // Zero fake placeholders or zeroes during initial loading
    expect(screen.queryByText("Đang tải...")).not.toBeInTheDocument();
    expect(screen.queryByText("Chưa có dữ liệu")).not.toBeInTheDocument();
    expect(screen.queryByText("Chưa kết nối")).not.toBeInTheDocument();
    expect(screen.queryByText("Chưa có danh mục")).not.toBeInTheDocument();
    expect(screen.queryByText("Không có hồ sơ chờ")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Tất cả hồ sơ đăng ký và chào bán công nghệ đã được xử lý xong.")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("0 / 34")).not.toBeInTheDocument();

    resolveSectors([
      { code: "CNTT", name: "Công nghệ thông tin" },
      { code: "NL", name: "Năng lượng" },
    ]);
    resolveStats({
      totalOffers: 45,
      totalDemands: 12,
      totalEnterprises: 120,
      totalExperts: 30,
      totalProvinces: 17,
      updatedAt: "2026-11-11T00:00:00Z",
    });
    resolveApprovals({
      ok: true,
      json: async () => ({ total: 5, data: [] }),
    });

    const kpiGrid = await screen.findByTestId("admin-kpi-grid");
    expect(screen.queryByTestId("admin-kpi-skeleton")).not.toBeInTheDocument();
    expect(kpiGrid).toHaveTextContent("150");
    expect(kpiGrid).toHaveTextContent("17 / 34");
    expect(kpiGrid).toHaveTextContent("50% Tỉnh/Thành Trọng Điểm");
    expect(kpiGrid).toHaveTextContent("2");
    expect(kpiGrid).toHaveTextContent("5");
    expect(screen.getByText("5 hồ sơ chờ xét duyệt")).toBeInTheDocument();
  });

  it("renders real zeroes and empty queue state only after API settles with zero counts", async () => {
    getActiveSectorsMock.mockResolvedValue([]);
    getStatsMock.mockResolvedValue({
      totalOffers: 0,
      totalDemands: 0,
      totalEnterprises: 0,
      totalExperts: 0,
      totalProvinces: 0,
      updatedAt: "2026-11-11T00:00:00Z",
    });
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ total: 0, data: [] }),
    });

    render(<AdminDashboard />);

    const kpiGrid = await screen.findByTestId("admin-kpi-grid");
    expect(kpiGrid).toHaveTextContent("0 / 34");
    expect(kpiGrid).toHaveTextContent("Chưa có dữ liệu");
    expect(kpiGrid).toHaveTextContent("Chưa kết nối");
    expect(kpiGrid).toHaveTextContent("Chưa có danh mục");
    expect(screen.getAllByText("Không có hồ sơ chờ").length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByText("Tất cả hồ sơ đăng ký và chào bán công nghệ đã được xử lý xong.")
    ).toBeInTheDocument();
  });
});
