import React from "react";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import PortalLayout from "./layout";
import { RoleSwitcher } from "@/components/common/role-switcher";
import { authClient } from "@/lib/auth-client";
import * as enterpriseClient from "@/lib/enterprise-client";

let mockPathname = "/portal";
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/components/auth/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    getUser: vi.fn(),
    getToken: vi.fn().mockReturnValue("mock-token"),
    setSession: vi.fn(),
  },
}));

vi.mock("@/lib/enterprise-client", () => ({
  fetchMyEnterpriseProfile: vi.fn(),
  switchEnterpriseActiveRole: vi.fn(),
  activateEnterpriseCapability: vi.fn(),
}));

describe("Portal Navigation Delta v11 (CR-2026-014) QC Verification Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/portal";
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("QC-TEST-01: renders complete 7-item menu for SELLER role including TT17 Assessment and Business Profile", async () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u-seller",
      email: "seller@techcorp.vn",
      fullName: "Nguyễn Doanh Nghiệp",
      role: "SELLER",
      organizationName: "Công ty Cổ phần Công nghệ Cao",
    });

    vi.mocked(enterpriseClient.fetchMyEnterpriseProfile).mockResolvedValue({
      id: "ent-1",
      name: "Công ty Cổ phần Công nghệ Cao",
      subjectType: "Doanh nghiệp KH&CN",
    });

    render(
      <PortalLayout>
        <div>Portal Body</div>
      </PortalLayout>
    );

    // 1. Header & Badge
    expect(screen.getByText("Nhà Cung Ứng Công Nghệ")).toBeInTheDocument();
    expect(screen.getByText("Workspace Nhà Cung Ứng")).toBeInTheDocument();

    // 2. 7 Menu items verification
    expect(screen.getByText("Tổng quan Gian hàng")).toBeInTheDocument();
    expect(screen.getByText("Kho Công nghệ (TRL)")).toBeInTheDocument();
    expect(screen.getByText("Yêu cầu Kết nối Nhận được")).toBeInTheDocument();
    expect(screen.getByText("Radar Tìm Kiếm Nhu Cầu (AI)")).toBeInTheDocument();
    expect(screen.getByText("Tiến trình Chuyển giao & MOU")).toBeInTheDocument();
    
    // AC-DELTA-18: TT17 presence
    const tt17Link = screen.getByRole("link", { name: /Đánh giá Năng lực TT17/i });
    expect(tt17Link).toBeInTheDocument();
    expect(tt17Link).toHaveAttribute("href", "/assessments/tt17");

    // AC-DELTA-17: Business profile label
    await waitFor(() => {
      expect(screen.getByText("Hồ sơ Doanh nghiệp")).toBeInTheDocument();
    });
    expect(screen.queryByText("Hồ sơ Đơn vị / Viện Trường")).not.toBeInTheDocument();
  });

  it("QC-TEST-02: dynamically resolves 'Hồ sơ Viện / Trường' when subjectType indicates Research Institute or University", async () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u-uni",
      email: "dean@hust.edu.vn",
      fullName: "GS. Trần Viện Trưởng",
      role: "SELLER",
      organizationName: "Trường Đại học Bách Khoa",
    });

    vi.mocked(enterpriseClient.fetchMyEnterpriseProfile).mockResolvedValue({
      id: "inst-1",
      name: "Trường Đại học Bách Khoa",
      subjectType: "Viện / Trường",
    });

    render(
      <PortalLayout>
        <div>Portal Body</div>
      </PortalLayout>
    );

    await waitFor(() => {
      expect(screen.getByText("Hồ sơ Viện / Trường")).toBeInTheDocument();
    });
    expect(screen.queryByText("Hồ sơ Doanh nghiệp")).not.toBeInTheDocument();
  });

  it("QC-TEST-03: dynamically resolves 'Hồ sơ Hợp tác xã' when subjectType indicates Cooperative", async () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u-coop",
      email: "admin@htx-tech.vn",
      fullName: "Lê Chủ Nhiệm",
      role: "SELLER",
    });

    vi.mocked(enterpriseClient.fetchMyEnterpriseProfile).mockResolvedValue({
      id: "coop-1",
      name: "Hợp tác xã Công nghệ Nông nghiệp",
      subjectType: "Hợp tác xã",
    });

    render(
      <PortalLayout>
        <div>Portal Body</div>
      </PortalLayout>
    );

    await waitFor(() => {
      expect(screen.getByText("Hồ sơ Hợp tác xã")).toBeInTheDocument();
    });
  });

  it("QC-TEST-04: dynamically resolves 'Hồ sơ Doanh nghiệp ĐMST' for INNOVATION_ENTITY role", async () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u-innov",
      email: "contact@innovate.vn",
      fullName: "Đại diện ĐMST",
      role: "INNOVATION_ENTITY",
    });

    vi.mocked(enterpriseClient.fetchMyEnterpriseProfile).mockResolvedValue({
      id: "innov-1",
      name: "Tập đoàn Đổi mới Sáng tạo",
      subjectType: "DN ĐMST",
    });

    render(
      <PortalLayout>
        <div>Portal Body</div>
      </PortalLayout>
    );

    await waitFor(() => {
      expect(screen.getByText("Hồ sơ Doanh nghiệp ĐMST")).toBeInTheDocument();
    });
  });

  it("QC-TEST-05: verifies RoleSwitcher displays concise 'Bên Mua' and 'Bên Bán' without truncation bug", async () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u-dual",
      email: "business@corp.vn",
      fullName: "Doanh Nghiệp Kép",
      role: "SELLER",
    });

    vi.mocked(enterpriseClient.fetchMyEnterpriseProfile).mockResolvedValue({
      id: "ent-dual",
      capabilityTier: "DUAL",
      isBuyer: true,
      isSeller: true,
      activeRole: "SELLER",
    });

    render(<RoleSwitcher />);

    // AC-DELTA-19: Button labels must be concise 'Bên Mua' and 'Bên Bán'
    const buyerBtn = screen.getByRole("button", { name: /Bên Mua/i });
    const sellerBtn = screen.getByRole("button", { name: /Bên Bán/i });

    expect(buyerBtn).toBeInTheDocument();
    expect(sellerBtn).toBeInTheDocument();

    // Verify there are no long English labels that cause ellipsis
    expect(screen.queryByText(/Bên Mua \(Buyer\)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Bên Bán \(Seller\)/i)).not.toBeInTheDocument();
  });

  it("QC-TEST-06: triggers switchEnterpriseActiveRole when switching from SELLER to BUYER in RoleSwitcher", async () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u-dual",
      email: "business@corp.vn",
      fullName: "Doanh Nghiệp Kép",
      role: "SELLER",
    });

    vi.mocked(enterpriseClient.fetchMyEnterpriseProfile).mockResolvedValue({
      id: "ent-dual",
      capabilityTier: "DUAL",
      isBuyer: true,
      isSeller: true,
      activeRole: "SELLER",
    });

    vi.mocked(enterpriseClient.switchEnterpriseActiveRole).mockResolvedValue({ success: true } as any);

    render(<RoleSwitcher />);

    // Wait for async profile fetch to activate DUAL mode
    await waitFor(() => {
      expect(screen.getByText("DUAL")).toBeInTheDocument();
    });

    const buyerBtn = screen.getByRole("button", { name: /Bên Mua/i });
    fireEvent.click(buyerBtn);

    await waitFor(() => {
      expect(enterpriseClient.switchEnterpriseActiveRole).toHaveBeenCalledWith("BUYER");
    });
  });

  it("QC-TEST-07: renders complete 3-section structured menu for BUYER role with dynamic badges and standardized technology demand label (Delta v13 CR-2026-016)", async () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u-buyer-qc",
      email: "buyer@innovationcorp.vn",
      fullName: "Nguyễn Doanh Nghiệp Mua",
      role: "BUYER",
      organizationName: "Công ty CP Sản Xuất & Chế Tạo",
    });

    vi.mocked(enterpriseClient.fetchMyEnterpriseProfile).mockResolvedValue({
      id: "ent-buyer-1",
      name: "Công ty CP Sản Xuất & Chế Tạo",
      subjectType: "Doanh nghiệp sản xuất",
    });

    render(
      <PortalLayout>
        <div>Buyer Portal Content</div>
      </PortalLayout>
    );

    // 1. Header & Badge
    expect(screen.getByText("Bên Mua Công Nghệ")).toBeInTheDocument();
    expect(screen.getByText("Workspace Bên Mua")).toBeInTheDocument();

    // 2. 3 Section Headers
    expect(screen.getByText("Tác nghiệp Mua sắm")).toBeInTheDocument();
    expect(screen.getByText("Khám phá & Ghép nối")).toBeInTheDocument();
    expect(screen.getByText("Chẩn đoán & Hồ sơ")).toBeInTheDocument();

    // 3. Section 1 Items
    const overviewLink = screen.getByRole("link", { name: /Tổng quan Mua sắm/i });
    expect(overviewLink).toBeInTheDocument();
    expect(overviewLink).toHaveAttribute("href", "/portal");

    const demandLink = screen.getByRole("link", { name: /Bài toán Đổi mới Công nghệ/i });
    expect(demandLink).toBeInTheDocument();
    expect(demandLink).toHaveAttribute("href", "/portal/buyer/demands");
    expect(screen.getByText("3")).toBeInTheDocument(); // Badge count

    const pipelineLink = screen.getByRole("link", { name: /Tiến trình Hợp tác & MOU/i });
    expect(pipelineLink).toBeInTheDocument();
    expect(pipelineLink).toHaveAttribute("href", "/portal/opportunities/pipeline");
    expect(screen.getByText("1")).toBeInTheDocument(); // Badge count

    // 4. Section 2 Item
    const radarLink = screen.getByRole("link", { name: /Radar Ghép Nối AI/i });
    expect(radarLink).toBeInTheDocument();
    expect(radarLink).toHaveAttribute("href", "/portal/matching/radar");
    expect(screen.getByText("Mới")).toBeInTheDocument(); // Badge new

    // 5. Section 3 Items
    const tniLink = screen.getByRole("link", { name: /Khảo sát Nhu cầu \(TNI\)/i });
    expect(tniLink).toBeInTheDocument();
    expect(tniLink).toHaveAttribute("href", "/khao-sat-nhu-cau");

    const tt17Link = screen.getByRole("link", { name: /Đánh giá Năng lực TT17/i });
    expect(tt17Link).toBeInTheDocument();
    expect(tt17Link).toHaveAttribute("href", "/assessments/tt17");

    await waitFor(() => {
      expect(screen.getByText("Hồ sơ Doanh nghiệp")).toBeInTheDocument();
    });

    // 6. Negative verification: Legacy and foreign labels must NOT exist
    expect(screen.queryByText("Bài toán Tìm mua")).not.toBeInTheDocument();
    expect(screen.queryByText("Kho Công nghệ (TRL)")).not.toBeInTheDocument();
    expect(screen.queryByText("Hồ sơ LLKH của tôi")).not.toBeInTheDocument();
  });
});