import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EnterpriseDetailPage from "./page";
import * as enterpriseClient from "@/lib/enterprise-client";
import * as techOfferApi from "@/services/api/technology-offer";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ taxCode: "0900123456" }),
}));

// Mock RadarChart
vi.mock("@/components/RadarChart", () => ({
  default: () => <div data-testid="mock-radar-chart">Mock Radar Chart</div>,
}));

const mockCommercialEnterprise: enterpriseClient.EnterprisePublicDetail = {
  id: "ent-comm-01",
  name: "CÔNG TY CỔ PHẦN CHẾ BIẾN NÔNG SẢN VÀ THỰC PHẨM XUẤT KHẨU VIỆT HƯNG",
  taxCode: "0900123456",
  subjectType: "COMMERCIAL_ENTERPRISE",
  establishedDate: "2015-06-15",
  provinceCity: "Hưng Yên",
  addressDetail: "Số 48, Phố Nối, Phường Bần Yên Nhân, Thị xã Mỹ Hào, Tỉnh Hưng Yên",
  website: "www.viethungfood.vn",
  isVerified: true,
  mainSectorName: "Chế biến nông sản & thực phẩm",
  sectorCode: "1030",
  ownershipType: "Doanh Nghiệp Sản Xuất & Thương Mại",
  workforceScale: "150–200 nhân sự",
  revenueRange: "[BẢO MẬT THEO NĐ 13/2023]",
  operatingZone: "Nhà máy 12.000m² tại KCN Phố Nối A với 8 dây chuyền sấy khép kín",
  highQualificationRatio: "25%",
  tniScore: undefined,
  tniClassification: undefined,
  hasRdUnit: false,
  hasRdBudget: false,
  isExporting: true,
  inValueChain: true,
  topBottlenecks: [],
  supportNeeds: [],
  projects: [],
  intellectualProperties: [],
};

const mockInnovativeEnterprise: enterpriseClient.EnterprisePublicDetail = {
  ...mockCommercialEnterprise,
  id: "ent-inno-02",
  name: "TẬP ĐOÀN CÔNG NGHỆ ĐỔI MỚI SÁNG TẠO NACENINNO",
  subjectType: "INNOVATIVE_ENTERPRISE",
  tniScore: 82.5,
  tniClassification: "LEADING",
  hasRdUnit: true,
  hasRdBudget: true,
  projects: [
    {
      id: "p-01",
      title: "Hệ thống sấy thăng hoa AI vi sóng",
      description: "Nghiên cứu ứng dụng trí tuệ nhân tạo điều khiển vi sóng sấy thăng hoa",
      status: "COMPLETED",
      partners: "Viện Hàn Lâm KH&CN",
    },
  ],
  intellectualProperties: [
    {
      id: "ip-01",
      type: "PATENT",
      title: "Quy trình sấy thăng hoa liên tục tiết kiệm năng lượng",
      registrationNumber: "VN-1-0029988",
    },
  ],
};

const mockInnovationRating: enterpriseClient.InnovationEvaluation = {
  id: "eval-01",
  enterpriseId: "ent-inno-02",
  taxCode: "0900123456",
  evaluationYear: 2024,
  criteriaVersion: "v1.0",
  totalScore: 82.5,
  classification: "LEADING",
  classificationLabel: "Dẫn đầu",
  badgeName: "Huy hiệu Vàng ĐMST",
  status: "APPROVED",
  reviewedBy: "Sở KH&CN",
  reviewedAt: "2024-10-15T00:00:00Z",
  groupScores: [
    {
      groupCode: "G1",
      groupName: "Năng lực lãnh đạo & chiến lược ĐMST",
      maxScore: 15,
      score: 13.5,
      percentage: 90,
    },
    {
      groupCode: "G2",
      groupName: "Nguồn lực tài chính cho R&D",
      maxScore: 15,
      score: 12,
      percentage: 80,
    },
  ],
  radarChartData: [
    { axis: "Chiến lược ĐMST", value: 90, maxValue: 100 },
    { axis: "Tài chính R&D", value: 80, maxValue: 100 },
  ],
};

const mockOffers = [
  {
    id: "off-01",
    offerCode: "VH-MG01",
    offerType: "PRODUCT",
    hasTechTransfer: false,
    title: "Xoài Cát Chu Sấy Dẻo Xuất Khẩu",
    summary: "Công nghệ sấy lạnh nhiệt độ thấp giữ nguyên vị ngọt tự nhiên, không đường hóa học.",
    sectorCode: "1030",
    sectorName: "Trái Cây Sấy Dẻo",
    pricingType: "FIXED",
    priceAmount: 185000,
    currency: "VND",
    developerOrigin: "Việt Hưng Food",
    status: "APPROVED",
    createdAt: "2026-10-15T00:00:00Z",
  },
  {
    id: "off-02",
    offerCode: "VH-FD03",
    offerType: "PRODUCT",
    hasTechTransfer: false,
    title: "Sầu Riêng Ri6 Sấy Thăng Hoa",
    summary: "Công nghệ sấy thăng hoa -40°C bảo tồn 98% cấu trúc múi sầu riêng và hương vị nguyên bản.",
    sectorCode: "1030",
    sectorName: "Sấy Thăng Hoa",
    pricingType: "FIXED",
    priceAmount: 750000,
    currency: "VND",
    developerOrigin: "Việt Hưng Food",
    status: "APPROVED",
    createdAt: "2026-10-16T00:00:00Z",
  },
];

describe("Commercial & Innovative Enterprise Profile (TASK-02)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("TC-COMM-01: Renders Commercial Layout when subjectType !== INNOVATIVE_ENTERPRISE", async () => {
    vi.spyOn(enterpriseClient, "fetchEnterpriseDetail").mockResolvedValue(mockCommercialEnterprise);
    vi.spyOn(enterpriseClient, "getInnovationRating").mockResolvedValue(null as any);
    vi.spyOn(techOfferApi, "fetchPublicOffers").mockResolvedValue({
      data: mockOffers as any,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    render(<EnterpriseDetailPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: mockCommercialEnterprise.name, level: 1 })).toBeInTheDocument();
    });

    // Verify Commercial Badges & Highlights
    expect(screen.getByText("MST Đã Xác Thực")).toBeInTheDocument();
    expect(screen.getByText("Thành Viên Vàng B2B")).toBeInTheDocument();
    expect(screen.getByText("Chứng Chỉ Tiêu Chuẩn Quốc Tế")).toBeInTheDocument();
    expect(screen.getByText("Năng Lực Cung Ứng & Cơ Sở")).toBeInTheDocument();
    expect(screen.getByText("Thị Trường Tiêu Thụ Trọng Điểm")).toBeInTheDocument();

    // Verify Commercial 3 Tabs
    expect(screen.getByText("1. Sản Phẩm & Dịch Vụ Cung Cấp")).toBeInTheDocument();
    expect(screen.getByText("2. Nhu Cầu Mua / Thu Mua")).toBeInTheDocument();
    expect(screen.getByText("3. Giới Thiệu & Năng Lực Doanh Nghiệp")).toBeInTheDocument();

    // Verify that TNI Radar Chart is OUT-OF-SCOPE for commercial layout
    expect(screen.queryByTestId("mock-radar-chart")).not.toBeInTheDocument();

    // Verify Tab 1 Offers are rendered
    expect(screen.getByText("Xoài Cát Chu Sấy Dẻo Xuất Khẩu")).toBeInTheDocument();
    expect(screen.getByText("Sầu Riêng Ri6 Sấy Thăng Hoa")).toBeInTheDocument();

    // Verify PII Protection compliance badge
    expect(screen.getByText("Bảo Vệ Dữ Liệu Cá Nhân (NĐ 13/2023)")).toBeInTheDocument();
    expect(screen.getByText("PII Protection Standard")).toBeInTheDocument();
  });

  it("TC-COMM-02: Tab switching works across Offers, Demands, and Overview", async () => {
    vi.spyOn(enterpriseClient, "fetchEnterpriseDetail").mockResolvedValue(mockCommercialEnterprise);
    vi.spyOn(enterpriseClient, "getInnovationRating").mockResolvedValue(null as any);
    vi.spyOn(techOfferApi, "fetchPublicOffers").mockResolvedValue({
      data: mockOffers as any,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    render(<EnterpriseDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: mockCommercialEnterprise.name, level: 1 })).toBeInTheDocument();
    });

    // Switch to Tab 2: Nhu Cầu Mua / Thu Mua (Demands)
    const demandsTabBtn = screen.getByText("2. Nhu Cầu Mua / Thu Mua");
    fireEvent.click(demandsTabBtn);

    expect(screen.getByText("Doanh nghiệp đang chủ động mở thầu thu mua (Active RFQs)")).toBeInTheDocument();
    expect(
      screen.getByText("Thu Mua 100 Tấn Xoài Cát Chu Tươi Đạt Chuẩn VietGAP Phục Vụ Chế Biến Quý 4/2026")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Cung Cấp 200.000 Túi Màng Nhôm Phức Hợp 4 Lớp Đóng Gói Chân Không Xuất Khẩu")
    ).toBeInTheDocument();

    // Switch to Tab 3: Giới Thiệu & Năng Lực
    const overviewTabBtn = screen.getByText("3. Giới Thiệu & Năng Lực Doanh Nghiệp");
    fireEvent.click(overviewTabBtn);

    expect(screen.getByText("Giới Thiệu Chung Về Doanh Nghiệp")).toBeInTheDocument();
    expect(screen.getByText("12.000 m²")).toBeInTheDocument();
    expect(screen.getByText("8 Dây Chuyền")).toBeInTheDocument();
    expect(screen.getByText("ISO 22000:2018")).toBeInTheDocument();
    expect(screen.getByText("Chứng Nhận FDA Hoa Kỳ")).toBeInTheDocument();
  });

  it("TC-COMM-03: Interactive RFQ Modal flow opens and submits successfully", async () => {
    vi.spyOn(enterpriseClient, "fetchEnterpriseDetail").mockResolvedValue(mockCommercialEnterprise);
    vi.spyOn(enterpriseClient, "getInnovationRating").mockResolvedValue(null as any);
    vi.spyOn(techOfferApi, "fetchPublicOffers").mockResolvedValue({
      data: mockOffers as any,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    render(<EnterpriseDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: mockCommercialEnterprise.name, level: 1 })).toBeInTheDocument();
    });

    // Click Hero CTA RFQ button
    const heroRfqBtn = screen.getByRole("button", { name: /Gửi Yêu Cầu Báo Giá \(RFQ\)/i });
    fireEvent.click(heroRfqBtn);

    // Verify Modal appears
    expect(screen.getByText("Gửi Yêu Cầu Báo Giá / Đề Xuất Giao Thương")).toBeInTheDocument();

    // Fill form
    const qtyInput = screen.getByPlaceholderText(/500 kg hoặc 2 tấn/i);
    const companyInput = screen.getByPlaceholderText(/Chuỗi siêu thị/i);
    const contactInput = screen.getByPlaceholderText(/Nguyễn Văn A/i);
    const phoneInput = screen.getByPlaceholderText(/0912 345 678/i);

    fireEvent.change(qtyInput, { target: { value: "500 kg" } });
    fireEvent.change(companyInput, { target: { value: "Công ty TNHH Phân Phối Á Châu" } });
    fireEvent.change(contactInput, { target: { value: "Trần Mai Phương" } });
    fireEvent.change(phoneInput, { target: { value: "0987654321" } });

    // Submit form (click the submit button inside the modal form)
    const submitBtn = screen.getByRole("button", { name: /^Gửi Yêu Cầu Báo Giá$/i });
    fireEvent.click(submitBtn);

    // Modal closes and toast appears
    await waitFor(() => {
      expect(screen.getByText(/Đã gửi yêu cầu báo giá thành công!/i)).toBeInTheDocument();
    });
  });

  it("TC-COMM-04: Renders Innovative Layout when subjectType === INNOVATIVE_ENTERPRISE", async () => {
    vi.spyOn(enterpriseClient, "fetchEnterpriseDetail").mockResolvedValue(mockInnovativeEnterprise);
    vi.spyOn(enterpriseClient, "getInnovationRating").mockResolvedValue(mockInnovationRating);
    vi.spyOn(techOfferApi, "fetchPublicOffers").mockResolvedValue({
      data: mockOffers as any,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    render(<EnterpriseDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: mockInnovativeEnterprise.name, level: 1 })).toBeInTheDocument();
    });

    // Innovative badges & TNI score
    expect(screen.getByText(/TNI: LEADING/i)).toBeInTheDocument();
    expect(screen.getByText("⭐ Năng Lực ĐMST")).toBeInTheDocument();
    expect(screen.getByText("🔬 Năng Lực R&D & ĐMST")).toBeInTheDocument();

    // Switch to Innovation tab
    const innoTab = screen.getByText("⭐ Năng Lực ĐMST");
    fireEvent.click(innoTab);

    // Radar chart should be rendered
    expect(screen.getByTestId("mock-radar-chart")).toBeInTheDocument();
    expect(screen.getByText("Biểu Đồ Radar Năng Lực 360°")).toBeInTheDocument();
  });

  it("TC-COMM-05: Supports switching view mode via quick switcher", async () => {
    vi.spyOn(enterpriseClient, "fetchEnterpriseDetail").mockResolvedValue(mockCommercialEnterprise);
    vi.spyOn(enterpriseClient, "getInnovationRating").mockResolvedValue(null as any);
    vi.spyOn(techOfferApi, "fetchPublicOffers").mockResolvedValue({
      data: mockOffers as any,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    render(<EnterpriseDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: mockCommercialEnterprise.name, level: 1 })).toBeInTheDocument();
    });

    // By default, Commercial profile is shown
    expect(screen.getByText("1. Sản Phẩm & Dịch Vụ Cung Cấp")).toBeInTheDocument();

    // Manually switch to Innovative view mode
    const innoBtn = screen.getByRole("button", { name: /DN ĐMST \(TT17\)/i });
    fireEvent.click(innoBtn);

    // Innovative tabs appear
    expect(screen.getByText("⭐ Năng Lực ĐMST")).toBeInTheDocument();

    // Switch back to Commercial view mode
    const commBtn = screen.getByRole("button", { name: /DN Thương Mại/i });
    fireEvent.click(commBtn);

    expect(screen.getByText("1. Sản Phẩm & Dịch Vụ Cung Cấp")).toBeInTheDocument();
  });

  it("TC-COMM-06: Error state handles 404/failure gracefully", async () => {
    vi.spyOn(enterpriseClient, "fetchEnterpriseDetail").mockRejectedValue(new Error("Mã số thuế không tồn tại"));

    render(<EnterpriseDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Không tìm thấy thông tin doanh nghiệp")).toBeInTheDocument();
      expect(screen.getByText("Mã số thuế không tồn tại")).toBeInTheDocument();
    });
  });
});
