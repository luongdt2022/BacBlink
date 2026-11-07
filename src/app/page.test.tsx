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

  it("renders Omni-Search Bar with 4 tabs and search form (CR-2026-UIUX-003 T-01.31)", async () => {
    vi.spyOn(portalClient, "getStats").mockResolvedValue({
      totalOffers: 1479,
      totalDemands: 680,
      totalEnterprises: 304,
      totalExperts: 3420,
      totalProvinces: 63,
      totalSuccessfulConnections: 120,
      totalEstimatedValueMillionVnd: 15000,
      updatedAt: new Date().toISOString(),
    });

    render(<HomePage />);

    // 4 Tabs Omni-Search
    expect(screen.getByRole("tab", { name: /Công Nghệ Chào Bán/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Nhu Cầu Đặt Hàng/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Chuyên Gia KH&CN/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Doanh Nghiệp ĐMST/i })).toBeInTheDocument();

    // Input tìm kiếm và nút CTA
    expect(screen.getByLabelText(/Nhập từ khóa tìm kiếm/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tìm kiếm/i })).toBeInTheDocument();
    expect(screen.getByText(/Xu hướng tìm kiếm:/i)).toBeInTheDocument();
  });

  it("renders 4-step connection workflow section (CR-2026-UIUX-003 T-01.34)", async () => {
    vi.spyOn(portalClient, "getStats").mockResolvedValue({
      totalOffers: 10,
      totalDemands: 5,
      totalEnterprises: 20,
      totalExperts: 30,
      totalProvinces: 10,
      totalSuccessfulConnections: 2,
      totalEstimatedValueMillionVnd: 1000,
      updatedAt: new Date().toISOString(),
    });

    render(<HomePage />);

    expect(
      screen.getByText(/Quy Trình Kết Nối & Chuyển Giao Công Nghệ 4 Bước/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Khám Phá & Định Danh")).toBeInTheDocument();
    expect(screen.getByText("Thẩm Định TRL & Pháp Lý")).toBeInTheDocument();
    expect(screen.getByText("Khớp Nối AI & Đàm Phán")).toBeInTheDocument();
    expect(screen.getByText("Ký Kết Chuyển Giao & Hậu Kiểm")).toBeInTheDocument();
  });

  it("renders national partners network and global ecosystem CTA (CR-2026-UIUX-003 T-01.35)", async () => {
    vi.spyOn(portalClient, "getStats").mockResolvedValue({
      totalOffers: 10,
      totalDemands: 5,
      totalEnterprises: 20,
      totalExperts: 30,
      totalProvinces: 10,
      totalSuccessfulConnections: 2,
      totalEstimatedValueMillionVnd: 1000,
      updatedAt: new Date().toISOString(),
    });

    render(<HomePage />);

    expect(
      screen.getByText(/Mạng Lưới Đổi Mới Sáng Tạo & Chuyển Giao Công Nghệ Toàn Quốc/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Viện Nghiên Cứu & Trường Đại Học")).toBeInTheDocument();
    expect(screen.getByText("Mạng Lưới 63 Sở KH&CN Toàn Quốc")).toBeInTheDocument();
    expect(screen.getByText("Doanh Nghiệp ĐMST & Tập Đoàn Tiên Phong")).toBeInTheDocument();
    expect(
      screen.getByText(/Trợ Lý Ảo AI NacenTwin \(Đổi Mới Sáng Tạo\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Gia Nhập Hệ Sinh Thái Đổi Mới Sáng Tạo & Chuyển Giao Công Nghệ Quốc Gia/i)
    ).toBeInTheDocument();
  });
});
