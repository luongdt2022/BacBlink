import React from "react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import GovEnterpriseApprovalPage from "./page";
import * as enterpriseClient from "../../../../lib/enterprise-client";
import { authClient } from "@/lib/auth-client";

vi.mock("../../../../lib/enterprise-client", async () => {
  const actual = await vi.importActual("../../../../lib/enterprise-client");
  return {
    ...actual,
    fetchEnterprises: vi.fn(),
    approveEnterpriseGov: vi.fn(),
    rejectEnterpriseGov: vi.fn(),
  };
});

describe("T083 [FE-Gov-Screen2] GovEnterpriseApprovalPage Verification", () => {
  const mockEnterprises: enterpriseClient.EnterpriseDirectoryItem[] = [
    {
      id: "ent-001",
      name: "Công ty Cổ phần Công nghệ Sinh học Vinabiotech",
      taxCode: "0108889999",
      subjectType: "ENTERPRISE",
      provinceCity: "HN",
      mainSectorName: "Công nghệ sinh học trong y dược",
      sectorCode: "CN04",
      workforceScale: "50 tỷ VNĐ / 120 lao động",
      isVerified: false,
      ipCount: 3,
      hasRdUnit: true,
      status: "PENDING",
      tniScore: 82.5,
      tniClassification: "TIEN_TIEN",
    },
    {
      id: "ent-002",
      name: "Tập đoàn Chế tạo Máy Hải Phòng",
      taxCode: "0201112222",
      subjectType: "ENTERPRISE",
      provinceCity: "HP",
      mainSectorName: "Cơ khí chính xác và chế tạo máy",
      sectorCode: "CN05",
      workforceScale: "100 tỷ VNĐ / 350 lao động",
      isVerified: true,
      ipCount: 5,
      hasRdUnit: true,
      status: "ACTIVE",
      tniScore: 78.0,
      tniClassification: "TIEN_TIEN",
    },
  ];

  beforeEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();

    authClient.setSession("test-token", {
      id: "gov-user-1",
      email: "lanhdao@hanoi.gov.vn",
      fullName: "Trần Văn Lãnh Đạo",
      role: "PROVINCIAL_ADMIN",
      scopeId: "HN",
      organizationName: "Sở KH&CN Hà Nội",
    });

    vi.mocked(enterpriseClient.fetchEnterprises).mockResolvedValue({
      items: mockEnterprises,
      totalCount: 2,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    });

    vi.mocked(enterpriseClient.approveEnterpriseGov).mockResolvedValue({ success: true } as any);
    vi.mocked(enterpriseClient.rejectEnterpriseGov).mockResolvedValue({ success: true } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders GovPageHeader without double-padded main wrapper and shows action links", async () => {
    const { container } = render(<GovEnterpriseApprovalPage />);

    // No <main> tag causing double padding
    expect(container.querySelector("main")).toBeNull();

    // GovPageHeader title
    expect(
      await screen.findByRole("heading", { level: 1, name: /Thẩm Định & Xác Nhận Doanh Nghiệp ĐMST/i })
    ).toBeInTheDocument();

    // Scope badge
    expect(screen.getByTestId("gov-scope-badge")).toHaveTextContent("Hà Nội (HN)");

    // Actions links
    expect(screen.getByRole("link", { name: /Báo cáo Thống kê/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Danh bạ Công khai/i })).toBeInTheDocument();
  });

  it("renders Innovation verification criteria (MST, Vốn/Quy mô, SHTT, DN KH&CN)", async () => {
    render(<GovEnterpriseApprovalPage />);

    expect(await screen.findByText("Công ty Cổ phần Công nghệ Sinh học Vinabiotech")).toBeInTheDocument();

    // Tax Code (MST)
    expect(screen.getByText(/0108889999/)).toBeInTheDocument();

    // Vốn / Quy mô
    expect(screen.getByText(/50 tỷ VNĐ \/ 120 lao động/)).toBeInTheDocument();

    // SHTT
    expect(screen.getByText(/3 Bằng sáng chế/)).toBeInTheDocument();

    // DN KH&CN
    expect(screen.getAllByText(/Đạt chuẩn \(Có đơn vị R&D\)/)[0]).toBeInTheDocument();

    // Location & Sector resolved
    expect(screen.getByText("Hà Nội")).toBeInTheDocument();
    expect(screen.getByText("Công nghệ sinh học trong y dược")).toBeInTheDocument();
  });

  it("enforces validation on rejection/request changes (.trim().length >= 10)", async () => {
    render(<GovEnterpriseApprovalPage />);

    await screen.findByText("Công ty Cổ phần Công nghệ Sinh học Vinabiotech");

    // Click "Yêu cầu bổ sung"
    const rejectBtn = screen.getByRole("button", { name: /Yêu cầu bổ sung/i });
    fireEvent.click(rejectBtn);

    // Modal opens showing enterprise criteria
    expect(screen.getByText(/Yêu cầu bổ sung \/ Từ chối hồ sơ/i)).toBeInTheDocument();
    expect(screen.getAllByText(/0108889999/).length).toBeGreaterThan(0);

    const submitBtn = screen.getByRole("button", { name: /Gửi yêu cầu bổ sung/i });
    const textarea = screen.getByPlaceholderText(/Nhập nhận xét hoặc lý do yêu cầu bổ sung/i);

    // 1. Whitespace only
    fireEvent.change(textarea, { target: { value: "          " } });
    fireEvent.click(submitBtn);
    expect(
      screen.getByText(/Lý do từ chối hoặc yêu cầu bổ sung bắt buộc phải có ít nhất 10 ký tự/i)
    ).toBeInTheDocument();
    expect(enterpriseClient.rejectEnterpriseGov).not.toHaveBeenCalled();

    // 2. Note < 10 characters
    fireEvent.change(textarea, { target: { value: "chưa đủ" } });
    fireEvent.click(submitBtn);
    expect(
      screen.getByText(/Lý do từ chối hoặc yêu cầu bổ sung bắt buộc phải có ít nhất 10 ký tự/i)
    ).toBeInTheDocument();
    expect(enterpriseClient.rejectEnterpriseGov).not.toHaveBeenCalled();

    // 3. Valid note >= 10 characters
    fireEvent.change(textarea, {
      target: { value: "Doanh nghiệp cần bổ sung báo cáo tài chính kiểm toán và quyết định thành lập đơn vị R&D." },
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(enterpriseClient.rejectEnterpriseGov).toHaveBeenCalledWith(
        "ent-001",
        "Doanh nghiệp cần bổ sung báo cáo tài chính kiểm toán và quyết định thành lập đơn vị R&D."
      );
    });
  });

  it("handles approval flow with success alert feedback", async () => {
    render(<GovEnterpriseApprovalPage />);

    await screen.findByText("Công ty Cổ phần Công nghệ Sinh học Vinabiotech");

    // Click "Phê duyệt"
    const approveBtn = screen.getByRole("button", { name: /Phê duyệt/i });
    fireEvent.click(approveBtn);

    expect(screen.getByText(/Phê duyệt hồ sơ doanh nghiệp ĐMST/i)).toBeInTheDocument();

    const confirmApproveBtn = screen.getByRole("button", { name: /Xác nhận duyệt/i });
    fireEvent.click(confirmApproveBtn);

    await waitFor(() => {
      expect(enterpriseClient.approveEnterpriseGov).toHaveBeenCalledWith(
        "ent-001",
        "Hồ sơ đầy đủ tính pháp lý và tiêu chuẩn ĐMST theo quy định."
      );
    });
  });
});
