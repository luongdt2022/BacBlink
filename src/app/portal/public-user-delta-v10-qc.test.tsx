import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import PortalDashboard from "./page";
import PortalLayout from "./layout";
import RegisterPage from "../(auth)/register/page";
import { authClient } from "@/lib/auth-client";
import * as enterpriseClient from "@/lib/enterprise-client";

const mockPush = vi.fn();
let mockPathname = "/portal";
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/components/auth/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <div data-testid="role-guard-wrapper">{children}</div>,
}));

vi.mock("@/components/portal/buyer-dashboard", () => ({
  BuyerDashboard: ({ user }: { user: any }) => (
    <div data-testid="buyer-dashboard-mock">
      <h2>Buyer Dashboard: {user?.fullName}</h2>
      <a href="/portal/buyer/demands">Quản lý bài toán</a>
    </div>
  ),
}));

vi.mock("@/components/portal/seller-dashboard", () => ({
  SellerDashboard: ({ user }: { user: any }) => (
    <div data-testid="seller-dashboard-mock">
      <h2>Seller Dashboard: {user?.fullName}</h2>
      <a href="/portal/seller/technologies">Kho công nghệ</a>
    </div>
  ),
}));

vi.mock("@/components/expert-detail/expert-dashboard", () => ({
  ExpertDashboard: () => (
    <div data-testid="expert-dashboard-mock">
      <h2>Expert Dashboard</h2>
    </div>
  ),
}));

vi.mock("@/lib/enterprise-client", () => ({
  fetchMyEnterpriseProfile: vi.fn(),
  switchEnterpriseActiveRole: vi.fn(),
  activateEnterpriseCapability: vi.fn(),
}));

describe("CR-2026-006 / Delta v10: Comprehensive Gate 4 Verification Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    localStorage.clear();
    mockPathname = "/portal";
  });

  afterEach(() => {
    cleanup();
  });

  /* =========================================================================
   * SECTION 1: INTERACTIVE TESTING ON PUBLIC_USER DASHBOARD (/portal)
   * ========================================================================= */
  describe("QC-REQ-01: 100% Interactive Controls & Routes on PUBLIC_USER Workspace", () => {
    const mockPublicUser = {
      id: "usr-public-001",
      email: "nam.le@gmail.com",
      fullName: "Lê Hải Nam",
      role: "PUBLIC_USER",
    };

    beforeEach(() => {
      vi.spyOn(authClient, "getUser").mockReturnValue(mockPublicUser);
    });

    it("QC-FLOW-01: renders personalized Hero Banner and verifies 2 Quick Action CTA buttons", () => {
      render(<PortalDashboard />);

      // Hero banner greetings & identity
      expect(screen.getByText("Xin chào, Lê Hải Nam!")).toBeInTheDocument();
      expect(screen.getByText("Thành viên Khám phá / Bên Mua tiềm năng")).toBeInTheDocument();
      expect(screen.getByText("Khám phá công nghệ và kết nối giải pháp đổi mới sáng tạo.")).toBeInTheDocument();

      // Button 1: [+ Gửi Nhu cầu Công nghệ mới] -> /khao-sat-nhu-cau
      const sendDemandBtn = screen.getByRole("link", { name: /\+ Gửi Nhu cầu Công nghệ mới/i });
      expect(sendDemandBtn).toBeInTheDocument();
      expect(sendDemandBtn).toHaveAttribute("href", "/khao-sat-nhu-cau");
      expect(sendDemandBtn.className).toContain("min-h-11"); // WCAG Touch Target >= 44px

      // Button 2: [Khám phá Sàn Công nghệ] -> /chao-ban-cong-nghe
      const exploreMarketBtn = screen.getByRole("link", { name: /^Khám phá Sàn Công nghệ$/i });
      expect(exploreMarketBtn).toBeInTheDocument();
      expect(exploreMarketBtn).toHaveAttribute("href", "/chao-ban-cong-nghe");
      expect(exploreMarketBtn.className).toContain("min-h-11");
    });

    it("QC-FLOW-02: verifies all 3 cards in the Explorer Grid have correct routes, copies, and badges", () => {
      render(<PortalDashboard />);

      // Card 1: Khám phá Sàn Công nghệ -> /chao-ban-cong-nghe
      const card1 = screen.getByRole("link", { name: /Khám phá Sàn Công nghệ.*Tiếp cận hàng trăm sáng chế/i });
      expect(card1).toBeInTheDocument();
      expect(card1).toHaveAttribute("href", "/chao-ban-cong-nghe");
      expect(screen.getByText(/Tiếp cận hàng trăm sáng chế, thiết bị và công nghệ sẵn sàng chuyển giao \(TRL 1–9\)/i)).toBeInTheDocument();

      // Card 2: Nhu cầu công nghệ của Bạn -> /portal/buyer/demands
      const card2 = screen.getByRole("link", { name: /Nhu cầu công nghệ của Bạn/i });
      expect(card2).toBeInTheDocument();
      expect(card2).toHaveAttribute("href", "/portal/buyer/demands");
      expect(screen.getByText(/Theo dõi các bài toán tìm mua, đặt hàng R&D và nhu cầu công nghệ đang quan tâm/i)).toBeInTheDocument();

      // Card 3: Radar Ghép Nối AI -> /portal/matching/radar with 'Chưa kích hoạt' badge
      const card3 = screen.getByRole("link", { name: /Radar Ghép Nối AI/i });
      expect(card3).toBeInTheDocument();
      expect(card3).toHaveAttribute("href", "/portal/matching/radar");
      expect(screen.getByText(/Thuật toán AI tự động đối sánh và đề xuất giải pháp khi bạn gửi ít nhất 01 nhu cầu công nghệ/i)).toBeInTheDocument();
      expect(screen.getByText("Chưa kích hoạt")).toBeInTheDocument();
    });

    it("QC-FLOW-03: verifies Upgrade CTA Banner links directly to /profile/upgrade with 4 target personas", () => {
      render(<PortalDashboard />);

      expect(screen.getByText("Nâng hạng Vai trò & Kết nối Pháp nhân")).toBeInTheDocument();
      expect(screen.getByText("Lộ trình Mở rộng Quyền hạn")).toBeInTheDocument();

      // 4 personas
      expect(screen.getByText("Doanh nghiệp Mua")).toBeInTheDocument();
      expect(screen.getByText("Nhà Cung ứng")).toBeInTheDocument();
      expect(screen.getByText("Chuyên gia KH&CN")).toBeInTheDocument();
      expect(screen.getByText("DN Đổi mới sáng tạo")).toBeInTheDocument();

      // CTA button
      const upgradeBtn = screen.getByRole("link", { name: /Đăng ký Nâng hạng Vai trò/i });
      expect(upgradeBtn).toBeInTheDocument();
      expect(upgradeBtn).toHaveAttribute("href", "/profile/upgrade");
      expect(upgradeBtn.className).toContain("min-h-11");
    });

    it("QC-NEG-01: ensures strict absence of legacy legal-entity modules for PUBLIC_USER", () => {
      render(<PortalDashboard />);

      expect(screen.queryByText("Gian hàng Công nghệ")).not.toBeInTheDocument();
      expect(screen.queryByText("Đánh Giá Công Nghệ (TT17)")).not.toBeInTheDocument();
      expect(screen.queryByText("Hồ Sơ Doanh Nghiệp")).not.toBeInTheDocument();
      expect(screen.queryByText("Pipeline Cơ Hội (Kanban)")).not.toBeInTheDocument();
    });
  });

  /* =========================================================================
   * SECTION 2: SIDEBAR NAVIGATION VERIFICATION FOR PUBLIC_USER
   * ========================================================================= */
  describe("QC-REQ-02: Lean 5-Item Sidebar Navigation for PUBLIC_USER", () => {
    beforeEach(() => {
      vi.spyOn(authClient, "getUser").mockReturnValue({
        id: "usr-public-002",
        email: "nghiencuu@khoahoc.vn",
        fullName: "Hoàng Minh Nghiên Cứu",
        role: "PUBLIC_USER",
      });
      vi.mocked(enterpriseClient.fetchMyEnterpriseProfile).mockResolvedValue(null);
    });

    it("QC-NAV-01: renders exactly 5 navigation items and correct badge labels", () => {
      render(
        <PortalLayout>
          <div>Public Workspace Content</div>
        </PortalLayout>
      );

      // Header & Badge
      expect(screen.getByText("Thành Viên Đại Chúng")).toBeInTheDocument();
      expect(screen.getByText("Không Gian Thành Viên")).toBeInTheDocument();

      // 5 Nav items
      const item1 = screen.getByRole("link", { name: /^Trang tổng quan$/i });
      expect(item1).toHaveAttribute("href", "/portal");

      const item2 = screen.getByRole("link", { name: /Đơn hàng & Yêu cầu mua|Nhu cầu công nghệ/i });
      expect(item2).toHaveAttribute("href", "/portal/buyer/demands");

      const item3 = screen.getByRole("link", { name: /Radar Ghép Nối AI/i });
      expect(item3).toHaveAttribute("href", "/portal/matching/radar");
      expect(screen.getByText("Mới")).toBeInTheDocument();

      const item4 = screen.getByRole("link", { name: /Đăng ký Nâng hạng Vai trò/i });
      expect(item4).toHaveAttribute("href", "/profile/upgrade");

      const item5 = screen.getByRole("link", { name: /Cài đặt Tài khoản/i });
      expect(item5).toHaveAttribute("href", "/settings");

      // Verify no other nav links
      expect(screen.queryByText("Kho Công nghệ (TRL)")).not.toBeInTheDocument();
      expect(screen.queryByText("Đánh giá Năng lực TT17")).not.toBeInTheDocument();
      expect(screen.queryByText("Hồ sơ Doanh nghiệp")).not.toBeInTheDocument();
      expect(screen.queryByText("Yêu cầu Kết nối Nhận được")).not.toBeInTheDocument();
      expect(screen.queryByText("Tiến trình Chuyển giao & MOU")).not.toBeInTheDocument();
    });
  });

  /* =========================================================================
   * SECTION 3: LEAN REGISTRATION FORM VERIFICATION (/register)
   * ========================================================================= */
  describe("QC-REQ-03: Lean Registration Form (Absence of Organization & Strict PDPD)", () => {
    it("QC-REG-01: verifies absolute zero presence of 'organization' or 'đơn vị công tác' input/label", () => {
      render(<RegisterPage />);

      expect(screen.queryByText(/Cơ quan/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Đơn vị/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Viện trường/i)).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/Công ty/i)).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/Viện/i)).not.toBeInTheDocument();

      // Verify all required 6 form fields exist
      expect(screen.getByPlaceholderText("Nguyễn Văn")).toBeInTheDocument(); // lastName
      expect(screen.getByPlaceholderText("An")).toBeInTheDocument(); // firstName
      expect(screen.getByPlaceholderText("nguyenvanan@institute.gov.vn")).toBeInTheDocument(); // email
      expect(screen.getByPlaceholderText("0912345678")).toBeInTheDocument(); // phone
      const passwords = screen.getAllByPlaceholderText("••••••••");
      expect(passwords).toHaveLength(2); // password & confirmPassword
      expect(screen.getByRole("checkbox")).toBeInTheDocument(); // acceptPdpd
    });

    it("QC-REG-02: prevents rapid double submit while request is pending (button state disabled)", async () => {
      let resolvePromise: (val: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.stubGlobal("fetch", vi.fn().mockReturnValue(fetchPromise));

      render(<RegisterPage />);

      fireEvent.change(screen.getByPlaceholderText("Nguyễn Văn"), { target: { value: "Trần" } });
      fireEvent.change(screen.getByPlaceholderText("An"), { target: { value: "Bảo" } });
      fireEvent.change(screen.getByPlaceholderText("nguyenvanan@institute.gov.vn"), { target: { value: "bao@test.vn" } });
      const passwords = screen.getAllByPlaceholderText("••••••••");
      fireEvent.change(passwords[0], { target: { value: "SecureP@ss2026" } });
      fireEvent.change(passwords[1], { target: { value: "SecureP@ss2026" } });
      fireEvent.click(screen.getByRole("checkbox"));

      const submitBtn = screen.getByRole("button", { name: /Đăng ký thành viên/i });
      fireEvent.click(submitBtn);

      // During pending request, button is disabled to prevent duplicate accounts
      expect(submitBtn).toBeDisabled();

      // Resolve API
      resolvePromise!({ ok: true, json: async () => ({ code: "REGISTER_SUCCESS" }) });
      await waitFor(() => {
        expect(screen.getByText(/Đăng ký thành công/i)).toBeInTheDocument();
      });
    });
  });

  /* =========================================================================
   * SECTION 4: CROSS-ROLE ISOLATION & ZERO REGRESSION
   * ========================================================================= */
  describe("QC-REQ-04: Cross-Role Isolation & Zero Regression for BUYER, SELLER, EXPERT", () => {
    it("QC-ROLE-01: BUYER role strictly renders BuyerDashboard, NOT GeneralPortalDashboard", async () => {
      vi.spyOn(authClient, "getUser").mockReturnValue({
        id: "usr-buyer-001",
        email: "buyer@techcorp.vn",
        fullName: "Đại Diện Bên Mua",
        role: "BUYER",
      });
      localStorage.setItem("nacentwin_active_role", "BUYER");

      render(<PortalDashboard />);

      expect(await screen.findByTestId("buyer-dashboard-mock")).toBeInTheDocument();
      expect(screen.queryByText("Thành viên Khám phá / Bên Mua tiềm năng")).not.toBeInTheDocument();
      expect(screen.queryByText("Nâng hạng Vai trò & Kết nối Pháp nhân")).not.toBeInTheDocument();
    });

    it("QC-ROLE-02: SELLER role strictly renders SellerDashboard, NOT GeneralPortalDashboard", async () => {
      vi.spyOn(authClient, "getUser").mockReturnValue({
        id: "usr-seller-001",
        email: "seller@techcorp.vn",
        fullName: "Đại Diện Nhà Cung Ứng",
        role: "SELLER",
      });
      localStorage.setItem("nacentwin_active_role", "SELLER");

      render(<PortalDashboard />);

      expect(await screen.findByTestId("seller-dashboard-mock")).toBeInTheDocument();
      expect(screen.queryByText("Thành viên Khám phá / Bên Mua tiềm năng")).not.toBeInTheDocument();
    });

    it("QC-ROLE-03: VERIFIED_EXPERT role strictly renders ExpertDashboard, NOT GeneralPortalDashboard", async () => {
      vi.spyOn(authClient, "getUser").mockReturnValue({
        id: "usr-expert-001",
        email: "expert@institute.vn",
        fullName: "GS.TS Nguyễn Văn Khoa Học",
        role: "VERIFIED_EXPERT",
      });

      render(<PortalDashboard />);

      expect(await screen.findByTestId("expert-dashboard-mock")).toBeInTheDocument();
      expect(screen.queryByText("Thành viên Khám phá / Bên Mua tiềm năng")).not.toBeInTheDocument();
    });

    it("QC-ROLE-04: Anonymous / unauthenticated fallback gracefully renders default greeting", () => {
      vi.spyOn(authClient, "getUser").mockReturnValue(null);

      render(<PortalDashboard />);

      expect(screen.getByText("Xin chào, Quý Thành Viên!")).toBeInTheDocument();
      expect(screen.getByText("Thành viên Khám phá / Bên Mua tiềm năng")).toBeInTheDocument();
    });

    it("QC-ROLE-05: Dynamic localStorage storage event triggers activeRole sync across tabs", async () => {
      vi.spyOn(authClient, "getUser").mockReturnValue({
        id: "usr-dual-001",
        email: "dual@business.vn",
        fullName: "Doanh Nghiệp Kép",
        role: "BUYER",
      });

      render(<PortalDashboard />);
      expect(await screen.findByTestId("buyer-dashboard-mock")).toBeInTheDocument();

      // Dispatch cross-tab storage change event to SELLER
      localStorage.setItem("nacentwin_active_role", "SELLER");
      fireEvent(window, new Event("storage"));

      expect(await screen.findByTestId("seller-dashboard-mock")).toBeInTheDocument();
    });
  });
});
