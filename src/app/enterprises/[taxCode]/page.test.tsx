import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import EnterpriseDetailPage from "./page";

// Mock useParams
vi.mock("next/navigation", () => ({
  useParams: () => ({ taxCode: "2400120030" }),
}));

// Mock enterprise client
vi.mock("../../../lib/enterprise-client", () => ({
  fetchEnterpriseDetail: vi.fn().mockResolvedValue({
    id: "e8112d52-8637-4d95-a52b-2fa7e6bf4455",
    name: "CÔNG TY TNHH MỘT THÀNH VIÊN LÂM NGHIỆP ĐÔNG BẮC",
    taxCode: "2400120030",
    subjectType: "ENTERPRISE",
    provinceCity: "Lạng Sơn",
    mainSectorName: "Nông nghiệp công nghệ cao, nông nghiệp số",
    ownershipType: "Nhà nước",
    workforceScale: "50-dưới 100 người",
    revenueRange: "Từ 10 đến dưới 50 tỷ đồng",
    operatingZone: "Ngoài các khu trên",
    highQualificationRatio: "10–30%",
    status: "ACTIVE",
    isVerified: true,
    intellectualProperties: [],
  }),
  getInnovationRating: vi.fn().mockResolvedValue({
    taxCode: "2400120030",
    enterpriseName: "CÔNG TY TNHH MỘT THÀNH VIÊN LÂM NGHIỆP ĐÔNG BẮC",
    totalScore: 78.5,
    classification: "LEADING",
    classificationLabel: "Dẫn đầu",
    badgeName: "Huy hiệu Vàng ĐMST",
    evaluatedAt: "2026-10-14T00:00:00Z",
    evaluationYear: 2024,
    groupScores: [],
    radarChartData: [
      { axis: "Quản trị ĐMST", value: 85, fullMark: 100 },
      { axis: "Năng lực Công nghệ", value: 70, fullMark: 100 },
      { axis: "Sản phẩm & Dịch vụ", value: 80, fullMark: 100 },
      { axis: "Tài sản Trí tuệ", value: 90, fullMark: 100 },
      { axis: "Tài chính & Đầu tư", value: 65, fullMark: 100 },
      { axis: "Thị trường & Khách hàng", value: 80, fullMark: 100 },
      { axis: "Nhân lực ĐMST", value: 75, fullMark: 100 },
      { axis: "Liên kết & Hợp tác", value: 85, fullMark: 100 },
    ],
    criteriaDetails: [],
  }),
}));

// Mock technology offer API
vi.mock("@/services/api/technology-offer", () => ({
  fetchPublicOffers: vi.fn().mockResolvedValue({
    total: 1,
    data: [
      {
        id: "11111111-1111-1111-1111-111111111111",
        offerCode: "OFF-20261008-00001",
        offerType: "SOLUTION",
        title: "Hệ thống sấy thăng hoa chân không tích hợp AI tối ưu năng lượng",
        summary: "Công nghệ sấy nhiệt độ thấp bảo toàn 98% hoạt tính sinh học.",
        sectorCode: "FOOD",
        sectorName: "Công nghệ chế biến nông sản - thực phẩm",
        pricingType: "RANGE",
        priceMin: 850000000,
        priceMax: 1200000000,
        enterpriseTaxCode: "2400120030",
        enterpriseName: "CÔNG TY TNHH MỘT THÀNH VIÊN LÂM NGHIỆP ĐÔNG BẮC",
      },
    ],
  }),
}));

describe("EnterpriseDetailPage (/enterprises/[taxCode]) - Delta v4 Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("T-04.46: Hiển thị đầy đủ thông tin Doanh nghiệp thường và Tab sản phẩm chào bán", async () => {
    render(<EnterpriseDetailPage />);

    // Chờ tải xong thông tin doanh nghiệp (có thể xuất hiện ở Breadcrumb và Heading h1)
    await waitFor(() => {
      const elements = screen.getAllByText("CÔNG TY TNHH MỘT THÀNH VIÊN LÂM NGHIỆP ĐÔNG BẮC");
      expect(elements.length).toBeGreaterThan(0);
    });

    // Kiểm tra định danh và loại hình
    expect(screen.getByText("2400120030")).toBeInTheDocument();
    expect(screen.getByText("ENTERPRISE")).toBeInTheDocument();
    expect(screen.getByText("✓ Đã kiểm chứng (Sở KH&CN)")).toBeInTheDocument();

    // Kiểm tra có tab Sản phẩm chào bán
    const productTab = screen.getByText(/Sản Phẩm Chào Bán/i);
    expect(productTab).toBeInTheDocument();
  });
});
