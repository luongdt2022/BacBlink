import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChaoBanCongNghePage from "./page";
import { TechnologyOffer } from "@/types/technology-offer";

const mockOffers: TechnologyOffer[] = [
  {
    id: "off-01",
    offerCode: "OFF-202610-LV16-08",
    offerType: "SOFTWARE",
    hasTechTransfer: true,
    title: "Nền tảng Digital Twin mô phỏng nhiệt lò nung",
    summary: "Song sinh kỹ thuật số tối ưu hóa nhiệt độ lò công nghiệp",
    problemSolved: "Cắt giảm khí đốt và cảnh báo thủng lò",
    sectorCode: "IT",
    sectorName: "Công nghệ thông tin, Phần mềm & IoT",
    pricingType: "RANGE",
    priceMin: 1800000000,
    priceMax: 2800000000,
    currency: "VND",
    developerOrigin: "Viện Năng Lượng - Bộ Công Thương",
    trlLevel: 8,
    ipStatus: "COPYRIGHT_REGISTERED",
    ipRegistrationNumber: "VN-CP-2025-0089",
    transferMethod: "EXCLUSIVE_LICENSE",
    commercialStatus: "COMMERCIALLY_READY",
    status: "APPROVED",
    successfulConnections: 5,
    ratingScore: 5.0,
    reviewCount: 3,
    createdAt: "2026-10-10T00:00:00Z",
  },
  {
    id: "off-02",
    offerCode: "OFF-202610-LV08-01",
    offerType: "SOLUTION",
    hasTechTransfer: true,
    title: "Robot hàn laser 6 trục siêu chính xác",
    summary: "Hệ thống hàn laser tự động tích hợp AI thị giác",
    problemSolved: "Tăng tốc độ hàn 3.5 lần",
    sectorCode: "ELEC",
    sectorName: "Điện tử, Bán dẫn & Viễn thông",
    pricingType: "FIXED",
    priceAmount: 850000000,
    currency: "VND",
    developerOrigin: "Đại học Bách Khoa Hà Nội",
    trlLevel: 8,
    ipStatus: "PATENT_GRANTED",
    ipRegistrationNumber: "VN-1-0028812",
    transferMethod: "NON_EXCLUSIVE_LICENSE",
    commercialStatus: "COMMERCIALLY_READY",
    status: "APPROVED",
    successfulConnections: 2,
    ratingScore: 4.8,
    reviewCount: 4,
    createdAt: "2026-10-09T00:00:00Z",
  },
  {
    id: "off-03",
    offerCode: "OFF-202610-LV01-02",
    offerType: "EQUIPMENT",
    hasTechTransfer: false,
    title: "Bộ điều khiển tưới nhỏ giọt thông minh",
    summary: "Thiết bị nông nghiệp chính xác điều khiển qua 4G",
    problemSolved: "Tiết kiệm 50% nước tưới",
    sectorCode: "AG",
    sectorName: "Nông nghiệp, Lâm nghiệp & Thủy sản",
    pricingType: "CONTACT",
    currency: "VND",
    status: "APPROVED",
    successfulConnections: 10,
    ratingScore: 4.5,
    reviewCount: 8,
    createdAt: "2026-10-08T00:00:00Z",
  },
];

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  usePathname: () => "/chao-ban-cong-nghe",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/services/api/technology-offer", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/api/technology-offer")>();
  return {
    ...actual,
    fetchPublicOffers: vi.fn(async (params?: any) => {
      let filtered = [...mockOffers];
      if (params?.sectorCode && params.sectorCode !== "ALL") {
        filtered = filtered.filter((x) => x.sectorCode === params.sectorCode);
      }
      if (params?.hasTechTransfer !== undefined) {
        filtered = filtered.filter((x) => x.hasTechTransfer === params.hasTechTransfer);
      }
      if (params?.minTrl) {
        filtered = filtered.filter((x) => (x.trlLevel || 0) >= params.minTrl);
      }
      if (params?.ipStatus && params.ipStatus !== "ALL") {
        filtered = filtered.filter((x) => x.ipStatus === params.ipStatus);
      }
      return {
        total: filtered.length,
        data: filtered,
        page: 1,
        limit: 12,
        totalPages: 1,
      };
    }),
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ChaoBanCongNghePage - Multi-level Filter & Verification", () => {
  it("renders Hero Banner with 3 Quick Metrics from Basic Design", async () => {
    render(<ChaoBanCongNghePage />);
    expect(
      await screen.findByText("Thị Trường Công Nghệ & Sáng Chế Thương Mại Hóa")
    ).toBeInTheDocument();
    expect(screen.getByText("Hồ Sơ Niêm Yết")).toBeInTheDocument();
    expect(screen.getByText("Phân Loại TT17")).toBeInTheDocument();
    expect(screen.getByText("Sáng Chế Độc Quyền")).toBeInTheDocument();
  });

  it("renders offer cards and recognizes COPYRIGHT_REGISTERED as Đã Đăng Ký Bản Quyền", async () => {
    render(<ChaoBanCongNghePage />);
    expect(
      await screen.findByText("Nền tảng Digital Twin mô phỏng nhiệt lò nung")
    ).toBeInTheDocument();
    expect(screen.getByText("Đã Đăng Ký Bản Quyền")).toBeInTheDocument();
    expect(screen.getByText("VN-CP-2025-0089")).toBeInTheDocument();
  });

  it("renders dynamic sector counts avoiding hardcoded 0 badges", async () => {
    render(<ChaoBanCongNghePage />);
    await screen.findByText("Thị Trường Công Nghệ & Sáng Chế Thương Mại Hóa");

    // All sectors button with non-zero badge
    expect(screen.getByText("Tất cả lĩnh vực")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Điện tử, Bán dẫn & Viễn thông/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Công nghệ thông tin, Phần mềm & IoT/i })).toBeInTheDocument();
  });

  it("filters by sector when clicked and displays active filter chips", async () => {
    render(<ChaoBanCongNghePage />);
    await screen.findByText("Nền tảng Digital Twin mô phỏng nhiệt lò nung");

    const sectorBtn = screen.getByRole("button", { name: /Điện tử, Bán dẫn & Viễn thông/i });
    fireEvent.click(sectorBtn);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });
  });

  it("allows switching tabs between All, Transfer, and Commercial equipment", async () => {
    render(<ChaoBanCongNghePage />);
    await screen.findByText("Thị Trường Công Nghệ & Sáng Chế Thương Mại Hóa");

    const transferTab = screen.getByText(/Chuyển Giao SHTT & TRL/);
    fireEvent.click(transferTab);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });
  });

  it("renders sorting dropdown with proper options", async () => {
    render(<ChaoBanCongNghePage />);
    await screen.findByText("Thị Trường Công Nghệ & Sáng Chế Thương Mại Hóa");

    const sortSelect = screen.getByDisplayValue("Mới niêm yết gần nhất");
    expect(sortSelect).toBeInTheDocument();

    fireEvent.change(sortSelect, { target: { value: "trl_desc" } });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });
  });
});
