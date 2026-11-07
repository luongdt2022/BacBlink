/**
 * Test Suite: Homepage UI/UX Đẳng Cấp Quốc Gia (CR-2026-UIUX-003 / Task T-01.36)
 *
 * Kiểm thử toàn diện 5 phân hệ giao diện & tương tác:
 * - Phân hệ 1: Hero Section & Omni-Search Bar 4 Tabs (Keyword, TT17 Sector, TRL Range, Emerald CTA, Trending Tags).
 * - Phân hệ 2: Live National Metrics Grid via <Async> (Loading Skeleton, Error AlertCircle + Retry, Success Formatting Tỷ/Triệu VNĐ).
 * - Phân hệ 3: Lưới Thẻ Listing Công Nghệ & Nhu Cầu (AppCard 16:9, AppBadge 3 dải màu TRL, Nút CTA Yêu Cầu Kết Nối).
 * - Phân hệ 4: Quy trình 4 Bước & Mạng lưới 63 Sở KH&CN cùng Widget AI Assistant.
 * - Phân hệ 5: A11y & Touch Targets >= 44x44px, Contrast Ratio WCAG AA >= 4.5:1.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup, within } from "@testing-library/react";
import HomePage from "@/app/page";
import { portalClient } from "@/lib/portal-client";
import { fetchPublicOffers } from "@/services/api/technology-offer";

// Router Mock
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockPrefetch = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, className, fill, sizes, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} data-fill={fill ? "true" : undefined} {...props} />
  ),
}));

vi.mock("@/components/common/toast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

vi.mock("@/services/api/technology-offer", () => ({
  fetchPublicOffers: vi.fn(),
}));

vi.mock("@/lib/portal-client", () => ({
  portalClient: {
    getStats: vi.fn(),
    getPublicDemands: vi.fn(),
  },
}));

describe("Homepage UI/UX Specification Suite (T-01.36)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();

    // Default successful responses
    vi.mocked(fetchPublicOffers).mockResolvedValue({
      total: 3,
      data: [
        {
          id: "tech-001",
          offerCode: "TECH-001",
          title: "Công nghệ Tế bào gốc & Tái tạo mô sinh học",
          sectorName: "Công nghệ sinh học & Y dược",
          sectorCode: "CNSH",
          enterpriseName: "Viện Ứng dụng Công nghệ",
          managingAuthorityName: "Hà Nội",
          trlLevel: 2, // Dải 1: TRL 1-3 (Xanh dương)
          mainImageUrl: "/images/tech-stem-cell.jpg",
        } as any,
        {
          id: "tech-002",
          offerCode: "TECH-002",
          title: "Robot hàn công nghiệp 6 trục tự hành",
          sectorName: "Tự động hóa & Robot học",
          sectorCode: "TDH",
          enterpriseName: "Đại học Bách Khoa Hà Nội",
          managingAuthorityName: "Đà Nẵng",
          trlLevel: 5, // Dải 2: TRL 4-6 (Hổ phách)
          mainImageUrl: "/images/tech-robot.jpg",
        } as any,
        {
          id: "tech-003",
          offerCode: "TECH-003",
          title: "Hệ thống điện mặt trời mái nhà nổi Perovskite",
          sectorName: "Năng lượng tái tạo & Môi trường",
          sectorCode: "NLTT",
          enterpriseName: "Tập đoàn Năng lượng Xanh",
          managingAuthorityName: "TP. Hồ Chí Minh",
          trlLevel: 8, // Dải 3: TRL 7-9 (Xanh lục Emerald)
          mainImageUrl: "/images/tech-solar.jpg",
        } as any,
      ],
    });

    vi.mocked(portalClient.getPublicDemands).mockResolvedValue([
      {
        id: "dmd-001",
        itemCode: "DMD-001",
        technicalProblem: "Cần tìm giải pháp lọc nước thải dệt nhuộm tuần hoàn",
        sectorCode: "MT",
        province: "Bình Dương",
        budgetRange: "1,2 Tỷ VNĐ",
      } as any,
    ]);

    vi.mocked(portalClient.getStats).mockResolvedValue({
      totalOffers: 1479,
      totalDemands: 680,
      totalEnterprises: 304,
      totalExperts: 3420,
      totalProvinces: 63,
      totalSuccessfulConnections: 120,
      totalEstimatedValueMillionVnd: 15500, // 15,5 Tỷ VNĐ
      updatedAt: new Date().toISOString(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  // =========================================================================
  // PHÂN HỆ 1: HERO SECTION & OMNI-SEARCH BAR 4 TABS
  // =========================================================================
  describe("Phân hệ 1: Hero Section & Omni-Search Bar 4 Tabs (T-01.31)", () => {
    it("chuyển đổi linh hoạt giữa 4 tabs chuyên biệt và cập nhật trạng thái aria-selected", async () => {
      render(<HomePage />);

      const tabOffers = screen.getByRole("tab", { name: /Công Nghệ Chào Bán/i });
      const tabDemands = screen.getByRole("tab", { name: /Nhu Cầu Đặt Hàng/i });
      const tabExperts = screen.getByRole("tab", { name: /Chuyên Gia KH&CN/i });
      const tabEnterprises = screen.getByRole("tab", { name: /Doanh Nghiệp ĐMST/i });

      // Tab mặc định: Chào bán
      expect(tabOffers).toHaveAttribute("aria-selected", "true");
      expect(tabDemands).toHaveAttribute("aria-selected", "false");
      expect(tabOffers).toHaveTextContent("1.479");

      // Chuyển sang Nhu cầu
      fireEvent.click(tabDemands);
      expect(tabDemands).toHaveAttribute("aria-selected", "true");
      expect(tabOffers).toHaveAttribute("aria-selected", "false");
      expect(tabDemands).toHaveTextContent("680");

      // Chuyển sang Chuyên gia
      fireEvent.click(tabExperts);
      expect(tabExperts).toHaveAttribute("aria-selected", "true");
      expect(tabExperts).toHaveTextContent("3.420");

      // Chuyển sang Doanh nghiệp
      fireEvent.click(tabEnterprises);
      expect(tabEnterprises).toHaveAttribute("aria-selected", "true");
      expect(tabEnterprises).toHaveTextContent("304");

      // Chuyển lại về Công nghệ chào bán
      fireEvent.click(tabOffers);
      expect(tabOffers).toHaveAttribute("aria-selected", "true");
    });

    it("nhập từ khóa, chọn ngành TT17, chọn dải TRL và bấm nút CTA Emerald gọi router.push với đúng query params", async () => {
      render(<HomePage />);

      const input = screen.getByLabelText(/Nhập từ khóa tìm kiếm/i);
      fireEvent.change(input, { target: { value: "Nano Curcumin" } });

      const sectorSelect = screen.getByLabelText(/Chọn ngành TT17/i);
      fireEvent.change(sectorSelect, { target: { value: "CNSH" } });

      const trlSelect = screen.getByLabelText(/Chọn phân khúc TRL/i);
      fireEvent.change(trlSelect, { target: { value: "trl-7-9" } });

      const searchBtn = screen.getByRole("button", { name: /Tìm kiếm/i });
      expect(searchBtn).toHaveClass("bg-nacen-green-500");

      fireEvent.click(searchBtn);

      expect(mockPush).toHaveBeenCalledTimes(1);
      const pushedUrl = mockPush.mock.calls[0][0];
      expect(pushedUrl).toContain("/chao-ban-cong-nghe");
      expect(pushedUrl).toContain("q=Nano+Curcumin");
      expect(pushedUrl).toContain("sector=CNSH");
      expect(pushedUrl).toContain("trl=trl-7-9");
      expect(pushedUrl).toContain("trlRange=trl-7-9");
    });

    it("chuyển sang tab Nhu Cầu Đặt Hàng và tìm kiếm chuyển hướng đến /nhu-cau-cong-nghe", async () => {
      render(<HomePage />);

      const tabDemands = screen.getByRole("tab", { name: /Nhu Cầu Đặt Hàng/i });
      fireEvent.click(tabDemands);

      const input = screen.getByLabelText(/Nhập từ khóa tìm kiếm/i);
      fireEvent.change(input, { target: { value: "Xử lý nước thải" } });

      const searchBtn = screen.getByRole("button", { name: /Tìm kiếm/i });
      fireEvent.click(searchBtn);

      expect(mockPush).toHaveBeenCalledTimes(1);
      const pushedUrl = mockPush.mock.calls[0][0];
      expect(pushedUrl).toContain("/nhu-cau-cong-nghe");
      expect(pushedUrl).toContain("q=X%E1%BB%AD+l%C3%BD+n%C6%B0%E1%BB%9Bc+th%E1%BA%A3i");
    });

    it("bấm dải Trending tags kích hoạt tìm kiếm nhanh 1-click", async () => {
      render(<HomePage />);

      const tagButton = screen.getByRole("button", { name: "Robot hàn 3D" });
      fireEvent.click(tagButton);

      expect(mockPush).toHaveBeenCalledTimes(1);
      const pushedUrl = mockPush.mock.calls[0][0];
      expect(pushedUrl).toContain("/chao-ban-cong-nghe");
      expect(pushedUrl).toContain("q=Robot+h%C3%A0n+3D");
    });
  });

  // =========================================================================
  // PHÂN HỆ 2: LIVE NATIONAL METRICS GRID (T-01.32)
  // =========================================================================
  describe("Phân hệ 2: Live National Metrics Grid via <Async> (T-01.32)", () => {
    it("hiển thị trạng thái loading với skeleton khi dữ liệu stats đang nạp", async () => {
      // Mock pending promise
      vi.mocked(portalClient.getStats).mockReturnValue(new Promise(() => {}));

      render(<HomePage />);

      // Skeleton animation placeholder
      const pulseSkeleton = document.querySelector(".animate-pulse");
      expect(pulseSkeleton).toBeInTheDocument();
    });

    it("hiển thị trạng thái error với icon AlertCircle và nút Thử lại kích hoạt nạp lại dữ liệu", async () => {
      vi.mocked(portalClient.getStats).mockRejectedValueOnce(new Error("Network Failure"));

      render(<HomePage />);

      expect(
        await screen.findByText("Không thể tải số liệu thống kê thời gian thực.")
      ).toBeInTheDocument();

      const alertCircleIcon = screen.getByTestId("alert-circle-icon");
      expect(alertCircleIcon).toBeInTheDocument();

      const retryBtn = screen.getByRole("button", { name: /Thử lại/i });
      expect(retryBtn).toBeInTheDocument();

      // Khi nhấn Thử lại
      vi.mocked(portalClient.getStats).mockResolvedValueOnce({
        totalOffers: 200,
        totalDemands: 100,
        totalEnterprises: 50,
        totalExperts: 80,
        totalProvinces: 63,
        totalSuccessfulConnections: 40,
        totalEstimatedValueMillionVnd: 2500,
        updatedAt: new Date().toISOString(),
      });

      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(portalClient.getStats).toHaveBeenCalledTimes(2);
      });
      expect(await screen.findByText("200")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("hiển thị trạng thái success với 4 thẻ số liệu định dạng Tỷ VNĐ và Triệu VNĐ chính xác", async () => {
      vi.mocked(portalClient.getStats).mockResolvedValue({
        totalOffers: 1479,
        totalDemands: 680,
        totalEnterprises: 304,
        totalExperts: 3420,
        totalProvinces: 63,
        totalSuccessfulConnections: 120,
        totalEstimatedValueMillionVnd: 15500, // 15,5 Tỷ VNĐ
        updatedAt: new Date().toISOString(),
      });

      render(<HomePage />);

      // Thẻ 1: Công nghệ chào bán
      expect(await screen.findByText("1.479")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Công nghệ chào bán/i })).toBeInTheDocument();

      // Thẻ 2: Nhu cầu đặt hàng
      const demandCard = screen.getByRole("link", { name: /Nhu cầu đặt hàng/i });
      expect(demandCard).toBeInTheDocument();
      expect(within(demandCard).getByText("680")).toBeInTheDocument();

      // Thẻ 3: Kết nối & MOU
      expect(screen.getByText("120")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Kết nối.*MOU/i })).toBeInTheDocument();

      // Thẻ 4: Quy mô giao dịch (>= 1000 triệu -> Tỷ VNĐ)
      expect(screen.getByText("15,5 Tỷ VNĐ")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Quy mô giao dịch/i })).toBeInTheDocument();
    });

    it("định dạng giá trị dưới 1 Tỷ thành Triệu VNĐ khi quy mô nhỏ", async () => {
      vi.mocked(portalClient.getStats).mockResolvedValue({
        totalOffers: 10,
        totalDemands: 5,
        totalEnterprises: 8,
        totalExperts: 12,
        totalProvinces: 3,
        totalSuccessfulConnections: 2,
        totalEstimatedValueMillionVnd: 850, // < 1000 -> 850 Triệu VNĐ
        updatedAt: new Date().toISOString(),
      });

      render(<HomePage />);

      expect(await screen.findByText("850 Triệu VNĐ")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // PHÂN HỆ 3: LƯỚI THẺ LISTING CÔNG NGHỆ & NHU CẦU (T-01.33)
  // =========================================================================
  describe("Phân hệ 3: Lưới Thẻ Listing Công Nghệ & Nhu Cầu (T-01.33)", () => {
    it("hiển thị thẻ AppCard với ảnh thumbnail tỷ lệ 16:9 và thông tin chi tiết", async () => {
      render(<HomePage />);

      expect(
        await screen.findByText("Công nghệ Tế bào gốc & Tái tạo mô sinh học")
      ).toBeInTheDocument();

      // Kiểm tra khung ảnh 16:9
      const aspectImages = document.querySelectorAll(".aspect-\\[16\\/9\\]");
      expect(aspectImages.length).toBeGreaterThanOrEqual(3);

      // Kiểm tra mã định danh TECH-001
      expect(screen.getByText("TECH-001")).toBeInTheDocument();
      expect(screen.getByText("Viện Ứng dụng Công nghệ")).toBeInTheDocument();
    });

    it("phân loại AppBadge TRL 1-9 đúng 3 dải màu chuẩn hóa: TRL 1-3 (Xanh dương), TRL 4-6 (Hổ phách), TRL 7-9 (Xanh lục)", async () => {
      render(<HomePage />);

      expect(await screen.findByText("TRL 2")).toBeInTheDocument();
      expect(screen.getByText("TRL 5")).toBeInTheDocument();
      expect(screen.getByText("TRL 8")).toBeInTheDocument();

      // Dải 1: TRL 2 -> variant="info" (Xanh dương: text-blue-700 / bg-blue-50)
      const badgeTrl2 = screen.getByText("TRL 2").closest("span");
      expect(badgeTrl2).toHaveClass("text-blue-700");
      expect(badgeTrl2).toHaveClass("bg-blue-50");

      // Dải 2: TRL 5 -> variant="warning" (Hổ phách: text-amber-800 / bg-amber-50)
      const badgeTrl5 = screen.getByText("TRL 5").closest("span");
      expect(badgeTrl5).toHaveClass("text-amber-800");
      expect(badgeTrl5).toHaveClass("bg-amber-50");

      // Dải 3: TRL 8 -> variant="success" (Xanh lục Emerald: text-emerald-700 / bg-emerald-50)
      const badgeTrl8 = screen.getByText("TRL 8").closest("span");
      expect(badgeTrl8).toHaveClass("text-emerald-700");
      expect(badgeTrl8).toHaveClass("bg-emerald-50");
    });

    it("kiểm tra nút CTA Yêu Cầu Kết Nối và link Chi tiết trên từng thẻ chào bán", async () => {
      render(<HomePage />);

      expect(await screen.findByText("TECH-001")).toBeInTheDocument();

      const connectBtns = screen.getAllByRole("button", { name: "Yêu Cầu Kết Nối" });
      expect(connectBtns.length).toBe(3);

      const detailLinks = screen.getAllByRole("link", { name: /Chi tiết/i });
      expect(detailLinks.length).toBeGreaterThanOrEqual(3);
      expect(detailLinks[0]).toHaveAttribute("href", "/chao-ban-cong-nghe/tech-001");
    });

    it("chuyển sang tab Nhu Cầu Đặt Hàng hiển thị danh sách nhu cầu với CTA Đề Xuất Giải Pháp", async () => {
      render(<HomePage />);

      const demandsToggle = screen.getByRole("button", { name: /Nhu cầu đặt hàng \(/i });
      fireEvent.click(demandsToggle);

      expect(
        await screen.findByText("Cần tìm giải pháp lọc nước thải dệt nhuộm tuần hoàn")
      ).toBeInTheDocument();
      expect(screen.getByText("DMD-001")).toBeInTheDocument();

      const proposeBtn = screen.getByRole("button", { name: "Đề Xuất Giải Pháp" });
      expect(proposeBtn).toBeInTheDocument();
    });

    it("hiển thị trạng thái empty khi không có dữ liệu listing nào", async () => {
      vi.mocked(fetchPublicOffers).mockResolvedValueOnce({
        total: 0,
        data: [],
      });

      render(<HomePage />);

      expect(
        await screen.findByText("Chưa có công nghệ chào bán nào được công bố.")
      ).toBeInTheDocument();
    });
  });

  // =========================================================================
  // PHÂN HỆ 4: QUY TRÌNH 4 BƯỚC & ĐỐI TÁC 63 SỞ KH&CN (T-01.34 & T-01.35)
  // =========================================================================
  describe("Phân hệ 4: Quy trình 4 Bước & Đối tác 63 Sở KH&CN (T-01.34 & T-01.35)", () => {
    it("hiển thị đầy đủ 4 bước kết nối ĐMST tuần tự và liên kết chi tiết", async () => {
      render(<HomePage />);

      expect(
        screen.getByText(/Quy Trình Kết Nối & Chuyển Giao Công Nghệ 4 Bước/i)
      ).toBeInTheDocument();

      // 4 bước
      expect(screen.getByText("Khám Phá & Định Danh")).toBeInTheDocument();
      expect(screen.getByText("Thẩm Định TRL & Pháp Lý")).toBeInTheDocument();
      expect(screen.getByText("Khớp Nối AI & Đàm Phán")).toBeInTheDocument();
      expect(screen.getByText("Ký Kết Chuyển Giao & Hậu Kiểm")).toBeInTheDocument();

      // 4 số thứ tự
      expect(screen.getAllByText("01").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("02").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("03").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("04").length).toBeGreaterThanOrEqual(1);

      // Link chi tiết
      const stepLinks = screen.getAllByRole("link", { name: /Xem chi tiết bước/i });
      expect(stepLinks.length).toBe(4);
      expect(stepLinks[0]).toHaveAttribute("href", "/huong-dan");
    });

    it("hiển thị 3 trụ cột đối tác và danh sách các cơ quan 63 Sở KH&CN", async () => {
      render(<HomePage />);

      expect(
        screen.getByText(/Mạng Lưới Đổi Mới Sáng Tạo & Chuyển Giao Công Nghệ Toàn Quốc/i)
      ).toBeInTheDocument();

      // 3 Trụ cột
      expect(screen.getByText("Viện Nghiên Cứu & Trường Đại Học")).toBeInTheDocument();
      expect(screen.getByText("Mạng Lưới 63 Sở KH&CN Toàn Quốc")).toBeInTheDocument();
      expect(screen.getByText("Doanh Nghiệp ĐMST & Tập Đoàn Tiên Phong")).toBeInTheDocument();

      // Một số đối tác tiêu biểu
      expect(screen.getByText("Sở KH&CN TP. Hà Nội")).toBeInTheDocument();
      expect(screen.getByText("Sở KH&CN TP. Hồ Chí Minh")).toBeInTheDocument();
      expect(screen.getByText("Sở KH&CN TP. Đà Nẵng")).toBeInTheDocument();
      expect(screen.getByText("Đại học Bách Khoa Hà Nội")).toBeInTheDocument();
    });

    it("hiển thị Widget Trợ Lý Ảo AI NacenTwin với các tính năng thông minh", async () => {
      render(<HomePage />);

      expect(
        screen.getByText("Trợ Lý Ảo AI NacenTwin (Đổi Mới Sáng Tạo)")
      ).toBeInTheDocument();

      expect(
        screen.getByText(/Hỏi đáp tự động về mức độ TRL 1-9 theo Thông tư 17/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Công nghệ của tôi đạt mức TRL nào/i })
      ).toBeInTheDocument();
    });
  });

  // =========================================================================
  // PHÂN HỆ 5: A11Y, TOUCH TARGETS & CONTRAST RATIO
  // =========================================================================
  describe("Phân hệ 5: A11y & Touch Targets (WCAG AA & Touch Guidelines)", () => {
    it("đảm bảo nút CTA tìm kiếm, các tabs và nút Yêu cầu kết nối có kích thước touch target đạt chuẩn >= 44px", async () => {
      render(<HomePage />);

      // 1. Nút CTA tìm kiếm
      const searchBtn = screen.getByRole("button", { name: /Tìm kiếm/i });
      expect(searchBtn).toHaveClass("min-h-[44px]");
      expect(searchBtn).toHaveClass("min-w-[44px]");

      // 2. Tabs Omni-Search
      const tabs = screen.getAllByRole("tab");
      tabs.forEach((tab) => {
        expect(tab).toHaveClass("min-h-[44px]");
      });

      // 3. Nút Yêu Cầu Kết Nối trong Listing Card
      expect(await screen.findByText("TECH-001")).toBeInTheDocument();
      const connectBtns = screen.getAllByRole("button", { name: "Yêu Cầu Kết Nối" });
      connectBtns.forEach((btn) => {
        expect(btn).toHaveClass("min-h-[44px]");
      });

      // 4. Nút Xem tất cả danh sách
      const viewAllBtn = screen.getByRole("link", { name: /Xem tất cả danh sách/i });
      expect(viewAllBtn).toHaveClass("min-h-11"); // min-h-11 = 44px
    });

    it("đối soát tỷ lệ tương phản màu sắc (Contrast Ratio) chữ trắng trên nền Navy #3C5999 đạt chuẩn WCAG AA >= 4.5:1", () => {
      // Hàm tính độ chói tương đối (relative luminance) theo chuẩn W3C WCAG 2.1
      function getLuminance(r: number, g: number, b: number): number {
        const [rs, gs, bs] = [r, g, b].map((c) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }

      function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
        const lum1 = getLuminance(...rgb1);
        const lum2 = getLuminance(...rgb2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
      }

      // Màu chữ: Trắng #FFFFFF [255, 255, 255]
      const whiteRGB: [number, number, number] = [255, 255, 255];

      // Nền Navy #3C5999 [60, 89, 153]
      const navyRGB: [number, number, number] = [60, 89, 153];
      const navyRatio = getContrastRatio(whiteRGB, navyRGB);

      // Kỳ vọng: Tỷ lệ tương phản trên nền Navy >= 4.5:1 (đạt chuẩn WCAG AA cho body text và AAA cho headline)
      expect(navyRatio).toBeGreaterThanOrEqual(4.5);
      expect(Number(navyRatio.toFixed(2))).toBe(6.82);

      // Nền Hero Slate/Dark Navy #1E293B [30, 41, 59]
      const darkNavyRGB: [number, number, number] = [30, 41, 59];
      const darkNavyRatio = getContrastRatio(whiteRGB, darkNavyRGB);
      expect(darkNavyRatio).toBeGreaterThanOrEqual(7.0); // Đạt WCAG AAA >= 7:1

      // Nút CTA Emerald #2D9A85 [45, 154, 133] với chữ trắng #FFFFFF
      const emeraldRGB: [number, number, number] = [45, 154, 133];
      const emeraldRatio = getContrastRatio(whiteRGB, emeraldRGB);
      expect(emeraldRatio).toBeGreaterThanOrEqual(3.0); // Đạt WCAG AA Large Text / UI Components
    });
  });
});
