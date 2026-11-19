import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import PortalLayout from "./layout";
import PortalLoading from "./loading";
import { authClient } from "@/lib/auth-client";
import * as enterpriseClient from "@/lib/enterprise-client";

let mockPathname = "/portal";
let mockSearchParams = new URLSearchParams();
const mockToastInfo = vi.fn();

vi.mock("@/components/common/toast", () => ({
  useToast: () => ({
    info: mockToastInfo,
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/auth/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/lib/auth-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth-client")>("@/lib/auth-client");
  return {
    ...actual,
    authClient: {
      getUser: vi.fn(),
    },
  };
});

describe("PortalLayout PO-Approved Role-Tailored Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/portal";
  });

  afterEach(() => {
    cleanup();
  });

  it("renders Buyer tailored workspace menu for BUYER role (Delta v13: 3 Sections)", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u1",
      email: "buyer@example.com",
      fullName: "Nguyễn Văn Buyer",
      role: "BUYER",
    });

    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    );

    // 1. Header & Badge
    expect(screen.getByText("Bên Mua Công Nghệ")).toBeInTheDocument();
    expect(screen.getByText("Workspace Bên Mua")).toBeInTheDocument();

    // 2. 3 Section Headers
    expect(screen.getByText("Tác nghiệp Mua sắm")).toBeInTheDocument();
    expect(screen.getByText("Khám phá & Ghép nối")).toBeInTheDocument();
    expect(screen.getByText("Hồ sơ Hội viên")).toBeInTheDocument();

    // 3. Section 1 Items
    expect(screen.getByText("Tổng quan Mua sắm")).toBeInTheDocument();
    expect(screen.getByText("Nhu cầu & Đơn mua")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Nhu cầu & Đơn mua/i })).toHaveAttribute("href", "/portal/buyer/demands");

    expect(screen.getByText("Giao dịch & MOU")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Giao dịch & MOU/i })).toHaveAttribute("href", "/portal/opportunities/pipeline");

    // 4. Section 2 Item
    expect(screen.getByText("Radar Ghép Nối AI")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Radar Ghép Nối AI/i })).toHaveAttribute("href", "/portal/matching/radar");
    expect(screen.getByText("Mới")).toBeInTheDocument(); // Badge new

    // 5. Section 3 Items (Compact mode: TNI & TT17 excluded)
    expect(screen.queryByText("Khảo sát Nhu cầu (TNI)")).not.toBeInTheDocument();
    expect(screen.queryByText("Đánh giá Năng lực TT17")).not.toBeInTheDocument();
    expect(screen.getByText("Hồ sơ Doanh nghiệp")).toBeInTheDocument();

    // Negative assertions
    expect(screen.queryByText("Sản phẩm & Công nghệ")).not.toBeInTheDocument();
    expect(screen.queryByText("Hồ sơ LLKH của tôi")).not.toBeInTheDocument();
    expect(screen.queryByText("Bài toán Tìm mua")).not.toBeInTheDocument();
  });

  it("renders Seller tailored workspace menu for SELLER role", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u2",
      email: "seller@example.com",
      fullName: "Trần Văn Seller",
      role: "SELLER",
    });

    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    );

    expect(screen.getByText("Nhà Cung Ứng Công Nghệ")).toBeInTheDocument();
    expect(screen.getByText("Workspace Nhà Cung Ứng")).toBeInTheDocument();
    expect(screen.getByText("Tác nghiệp Bán hàng")).toBeInTheDocument();
    expect(screen.getByText("Khám phá & Ghép nối")).toBeInTheDocument();
    expect(screen.getByText("Hồ sơ Hội viên")).toBeInTheDocument();
    expect(screen.getByText("Sản phẩm & Công nghệ")).toBeInTheDocument();
    expect(screen.getByText("Khách hàng liên hệ")).toBeInTheDocument();
    expect(screen.getByText("Tìm nhu cầu mua (AI)")).toBeInTheDocument();
    expect(screen.getByText("Giao dịch & MOU")).toBeInTheDocument();
    expect(screen.queryByText("Đánh giá Năng lực TT17")).not.toBeInTheDocument();
    expect(screen.getByText("Hồ sơ Doanh nghiệp")).toBeInTheDocument();
    expect(screen.queryByText("Hồ sơ Đơn vị / Viện Trường")).not.toBeInTheDocument();
    expect(screen.queryByText("Niêm yết Công nghệ mới")).not.toBeInTheDocument();
    expect(screen.queryByText("Bài toán Tìm mua")).not.toBeInTheDocument();
    expect(screen.queryByText("Nhu cầu & Đơn mua")).not.toBeInTheDocument();
    expect(screen.queryByText("Hồ sơ LLKH của tôi")).not.toBeInTheDocument();
  });

  it("renders Expert tailored workspace menu for VERIFIED_EXPERT role (CR-2026-006 Delta v1.3: 7 items in 3 sections)", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u3",
      email: "expert@example.com",
      fullName: "PGS.TS Lê Chuyên Gia",
      role: "VERIFIED_EXPERT",
    });

    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    );

    // 1. Header & Badge
    expect(screen.getByText("Chuyên Gia KH&CN")).toBeInTheDocument();
    expect(screen.getByText("Workspace Chuyên Gia")).toBeInTheDocument();

    // 2. 3 Section Headers
    expect(screen.getByText("Tác nghiệp hàng ngày")).toBeInTheDocument();
    expect(screen.getByText("Kinh tế & Hợp đồng")).toBeInTheDocument();
    expect(screen.getByText("Hồ sơ & Quản trị")).toBeInTheDocument();

    // 3. Khối 1: Tác nghiệp hàng ngày (5 items)
    expect(screen.getByText("Tổng quan Chuyên gia")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tổng quan Chuyên gia/i })).toHaveAttribute("href", "/portal/expert/profile");

    expect(screen.getByText("Hộp Thư Tư Vấn & Kết Nối")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Hộp Thư Tư Vấn & Kết Nối/i })).toHaveAttribute("href", "/portal/expert/consultations");
    expect(screen.getByText("2")).toBeInTheDocument(); // Badge count

    expect(screen.getByText("Radar Cơ hội Phù hợp (AI)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Radar Cơ hội Phù hợp \(AI\)/i })).toHaveAttribute("href", "/portal/matching/radar");
    expect(screen.getByText("Mới")).toBeInTheDocument(); // Badge new

    expect(screen.getByText("Dự án Đồng hành & Hợp tác")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dự án Đồng hành & Hợp tác/i })).toHaveAttribute("href", "/portal/expert/projects");

    expect(screen.getByText("Đơn hàng & Nhu cầu đặt mua")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Đơn hàng & Nhu cầu đặt mua/i })).toHaveAttribute("href", "/portal/buyer/demands");

    // 4. Khối 2: Kinh tế & Hợp đồng (1 item disabled)
    expect(screen.getByText("Hợp đồng & Thù lao")).toBeInTheDocument();
    const contractsBtn = screen.getByRole("button", { name: /Hợp đồng & Thù lao/i });
    expect(contractsBtn).toBeInTheDocument();
    expect(contractsBtn).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Sắp ra mắt")).toBeInTheDocument(); // Badge coming-soon

    // Click disabled contracts button triggers toast without navigation
    fireEvent.click(contractsBtn);
    expect(mockToastInfo).toHaveBeenCalledWith(
      "Tính năng Hợp đồng & Thù lao đang được phát triển theo lộ trình.",
      "Sắp Ra Mắt"
    );

    // 5. Khối 3: Hồ sơ & Quản trị (2 items)
    expect(screen.getByText("Hồ sơ LLKH của tôi")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Hồ sơ LLKH của tôi/i })).toHaveAttribute("href", "/portal/expert/profile/edit");

    expect(screen.getByText("Cài đặt & Tài khoản")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Cài đặt & Tài khoản/i })).toHaveAttribute("href", "/portal/expert/account");

    // Negative assertions: Expert workspace must not link to legacy pipeline
    expect(document.querySelector('a[href*="/portal/opportunities/pipeline"]')).toBeNull();
    expect(screen.queryByText("Kho Công nghệ (TRL)")).not.toBeInTheDocument();
    expect(screen.queryByText("Bài toán Tìm mua")).not.toBeInTheDocument();
    expect(screen.queryByText("Nhu cầu & Đơn mua")).not.toBeInTheDocument();
    expect(screen.queryByText("Sắp có")).not.toBeInTheDocument();
  });

  it("activates only consultations item on /portal/expert/consultations without colliding with projects", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u3",
      email: "expert@example.com",
      fullName: "PGS.TS Lê Chuyên Gia",
      role: "VERIFIED_EXPERT",
    });
    mockPathname = "/portal/expert/consultations";

    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    );

    const consultationsLink = screen.getByRole("link", { name: /Hộp Thư Tư Vấn & Kết Nối/i });
    const projectsLink = screen.getByRole("link", { name: /Dự án Đồng hành & Hợp tác/i });

    expect(consultationsLink.className).toContain("bg-brand-700");
    expect(consultationsLink.className).toContain("text-white");
    expect(projectsLink.className).not.toContain("bg-brand-700");
  });

  it("activates only projects item on /portal/expert/projects without colliding with consultations", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u3",
      email: "expert@example.com",
      fullName: "PGS.TS Lê Chuyên Gia",
      role: "VERIFIED_EXPERT",
    });
    mockPathname = "/portal/expert/projects";

    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    );

    const consultationsLink = screen.getByRole("link", { name: /Hộp Thư Tư Vấn & Kết Nối/i });
    const projectsLink = screen.getByRole("link", { name: /Dự án Đồng hành & Hợp tác/i });

    expect(projectsLink.className).toContain("bg-brand-700");
    expect(projectsLink.className).toContain("text-white");
    expect(consultationsLink.className).not.toContain("bg-brand-700");
  });

  it("activates only orders-demands item on /portal/buyer/demands for VERIFIED_EXPERT (CR-2026-012 Delta v1.4)", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u3",
      email: "expert@example.com",
      fullName: "PGS.TS Lê Chuyên Gia",
      role: "VERIFIED_EXPERT",
    });
    mockPathname = "/portal/buyer/demands";

    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    );

    const ordersLink = screen.getByRole("link", { name: /Đơn hàng & Nhu cầu đặt mua/i });
    const consultationsLink = screen.getByRole("link", { name: /Hộp Thư Tư Vấn & Kết Nối/i });

    expect(ordersLink.className).toContain("bg-brand-700");
    expect(ordersLink.className).toContain("text-white");
    expect(consultationsLink.className).not.toContain("bg-brand-700");
  });

  it("renders Member Enterprise grouped workspace menu for INNOVATION_ENTITY role", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u4",
      email: "member@baclink.org.vn",
      fullName: "Doanh nghiệp Hội viên",
      role: "INNOVATION_ENTITY",
    });

    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    );

    expect(screen.getByText("Doanh nghiệp Hội viên")).toBeInTheDocument();
    expect(screen.getByText("Workspace Doanh Nghiệp Hội Viên")).toBeInTheDocument();
    expect(screen.getByText("Tổng quan Giao thương")).toBeInTheDocument();
    expect(screen.getByText("Hoạt động Cung – Cầu")).toBeInTheDocument();
    expect(screen.getByText("Bài toán Cần Mua")).toBeInTheDocument();
    expect(screen.getByText("Công nghệ Chào Bán")).toBeInTheDocument();
    expect(screen.getByText("Hồ sơ Hội viên")).toBeInTheDocument();
    expect(screen.getByText("Hồ sơ Doanh nghiệp")).toBeInTheDocument();
    expect(screen.queryByText("Tự Đánh giá TT17")).not.toBeInTheDocument();
  });

  it("renders Public User onboarding workspace menu for PUBLIC_USER role (Delta v10: 5 items & zero legal entity modules)", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u5",
      email: "public@guest.com",
      fullName: "Thành viên đại chúng",
      role: "PUBLIC_USER",
    });

    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    );

    // 1. Header & Badge
    expect(screen.getByText("Thành Viên Đại Chúng")).toBeInTheDocument();
    expect(screen.getByText("Không Gian Thành Viên")).toBeInTheDocument();

    // 2. 5 Nav Items
    expect(screen.getByRole("link", { name: /^Trang tổng quan$/i })).toHaveAttribute("href", "/portal");
    expect(screen.getByRole("link", { name: /Nhu cầu công nghệ|Đơn hàng & Yêu cầu mua/i })).toHaveAttribute("href", "/portal/buyer/demands");
    const radarLink = screen.getByRole("link", { name: /Radar Ghép Nối AI/i });
    expect(radarLink).toBeInTheDocument();
    expect(radarLink).toHaveAttribute("href", "/portal/matching/radar");
    expect(screen.getByText("Mới")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Đăng ký hội viên BACLINK/i })).toHaveAttribute("href", "/hoi-vien/gia-nhap");
    expect(screen.getByRole("link", { name: /Cài đặt Tài khoản/i })).toHaveAttribute("href", "/settings");

    // 3. Zero legal entity modules
    expect(screen.queryByText("Sản phẩm & Công nghệ")).not.toBeInTheDocument();
    expect(screen.queryByText("Đánh giá Năng lực TT17")).not.toBeInTheDocument();
    expect(screen.queryByText("Hồ sơ Doanh nghiệp")).not.toBeInTheDocument();
    expect(screen.queryByText("Giao dịch & MOU")).not.toBeInTheDocument();
    expect(screen.queryByText("Pipeline Cơ Hội (Kanban)")).not.toBeInTheDocument();
  });

  it("renders Admin audit view with quick-link card for SUPER_ADMIN role", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u6",
      email: "admin@nacentech.gov.vn",
      fullName: "Super Admin",
      role: "SUPER_ADMIN",
    });

    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    );

    expect(screen.getByText("Quản Trị Viên Hệ Thống")).toBeInTheDocument();
    expect(screen.getByText("Góc Nhìn Giám Sát Thực Địa")).toBeInTheDocument();
    expect(screen.getByText("Về Trung Tâm Quản Trị Hệ Thống")).toBeInTheDocument();
    expect(screen.getByText("Kho Chào bán Toàn sàn")).toBeInTheDocument();
    expect(screen.getByText("Bài toán Nhu cầu Toàn sàn")).toBeInTheDocument();
  });

  it("activates only 'Giao dịch & MOU' when on /portal/opportunities/pipeline without query", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u2",
      email: "seller@example.com",
      fullName: "Trần Văn Seller",
      role: "SELLER",
    });
    mockPathname = "/portal/opportunities/pipeline";
    mockSearchParams = new URLSearchParams("");

    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    );

    const pipelineLink = screen.getByRole("link", { name: /Giao dịch & MOU/i });
    const inboundLink = screen.getByRole("link", { name: /Khách hàng liên hệ/i });

    expect(pipelineLink).toHaveAttribute("href", "/portal/opportunities/pipeline");
    expect(inboundLink).toHaveAttribute("href", "/portal/seller/connection-requests");
    expect(pipelineLink.className).toContain("bg-brand-700");
    expect(pipelineLink.className).toContain("text-white");
    expect(inboundLink.className).not.toContain("bg-brand-700");
  });

  it("activates only 'Khách hàng liên hệ' when on dedicated route /portal/seller/connection-requests", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u2",
      email: "seller@example.com",
      fullName: "Trần Văn Seller",
      role: "SELLER",
    });
    mockPathname = "/portal/seller/connection-requests";
    mockSearchParams = new URLSearchParams("");

    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    );

    const pipelineLink = screen.getByRole("link", { name: /Giao dịch & MOU/i });
    const inboundLink = screen.getByRole("link", { name: /Khách hàng liên hệ/i });

    expect(inboundLink).toHaveAttribute("href", "/portal/seller/connection-requests");
    expect(pipelineLink).toHaveAttribute("href", "/portal/opportunities/pipeline");
    expect(inboundLink.className).toContain("bg-brand-700");
    expect(inboundLink.className).toContain("text-white");
    expect(pipelineLink.className).not.toContain("bg-brand-700");
  });

  it("shows portal-route-skeleton immediately when clicking another sidebar item and clears when route settles", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u2",
      email: "seller@example.com",
      fullName: "Trần Văn Seller",
      role: "SELLER",
    });
    mockPathname = "/portal";
    mockSearchParams = new URLSearchParams("");

    const { rerender } = render(
      <PortalLayout>
        <div data-testid="portal-child-content">Portal Real Content</div>
      </PortalLayout>
    );

    expect(screen.getByTestId("portal-child-content")).toBeInTheDocument();
    expect(screen.queryByTestId("portal-route-skeleton")).not.toBeInTheDocument();

    // Clicking same route does not trigger skeleton
    fireEvent.click(screen.getByRole("link", { name: /Tổng quan Gian hàng/i }));
    expect(screen.queryByTestId("portal-route-skeleton")).not.toBeInTheDocument();

    // Ctrl+click (new tab) does not replace current workspace with skeleton
    const profileLink = screen.getByRole("link", { name: /Hồ sơ Doanh nghiệp/i });
    fireEvent.click(profileLink, { ctrlKey: true });
    expect(screen.queryByTestId("portal-route-skeleton")).not.toBeInTheDocument();

    // Normal click on another item (e.g. /portal/enterprise/profile) immediately shows skeleton & highlights target
    fireEvent.click(profileLink);
    expect(screen.getByTestId("portal-route-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("portal-child-content")).not.toBeInTheDocument();
    expect(profileLink.className).toContain("bg-brand-700");

    // When pathname updates, pending skeleton clears
    mockPathname = "/portal/enterprise/profile";
    rerender(
      <PortalLayout>
        <div data-testid="portal-child-content">Profile Loaded</div>
      </PortalLayout>
    );
    expect(screen.queryByTestId("portal-route-skeleton")).not.toBeInTheDocument();
    expect(screen.getByText("Profile Loaded")).toBeInTheDocument();
  });

  it("does not re-fetch fetchMyEnterpriseProfile redundantly on pathname changes", () => {
    const profileSpy = vi
      .spyOn(enterpriseClient, "fetchMyEnterpriseProfile")
      .mockResolvedValue({ id: "ent-1", activeRole: "SELLER" });

    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u2",
      email: "seller@example.com",
      fullName: "Trần Văn Seller",
      role: "SELLER",
    });
    mockPathname = "/portal";

    const { rerender } = render(
      <PortalLayout>
        <div>Content 1</div>
      </PortalLayout>
    );

    const initialCalls = profileSpy.mock.calls.length;
    expect(initialCalls).toBeGreaterThanOrEqual(1);

    mockPathname = "/portal/seller/technologies";
    rerender(
      <PortalLayout>
        <div>Content 2</div>
      </PortalLayout>
    );

    mockPathname = "/portal/seller/connection-requests";
    rerender(
      <PortalLayout>
        <div>Content 3</div>
      </PortalLayout>
    );

    expect(profileSpy.mock.calls.length).toBe(initialCalls);
    profileSpy.mockRestore();
  });

  it("renders PortalLoading route boundary with portal-route-skeleton", () => {
    render(<PortalLoading />);
    expect(screen.getByTestId("portal-route-skeleton")).toHaveAttribute("aria-busy", "true");
  });

  it("supports ENTERPRISE Dual-Mode via activeRole (BUYER default and switches to SELLER on nacentwin_role_switched without changing user.role)", () => {
    localStorage.clear();
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u-ent",
      email: "member@baclink.vn",
      fullName: "DN Hội Viên BACLINK",
      role: "ENTERPRISE",
    });

    render(
      <PortalLayout>
        <div>Enterprise Content</div>
      </PortalLayout>
    );

    // Default activeRole = BUYER
    expect(screen.getByText("Workspace Bên Mua")).toBeInTheDocument();
    expect(screen.getByText("Nhu cầu & Đơn mua")).toBeInTheDocument();

    // Switch activeRole via custom event from RoleSwitcher
    fireEvent(
      window,
      new CustomEvent("nacentwin_role_switched", { detail: { role: "SELLER" } })
    );

    expect(screen.getByText("Workspace Nhà Cung Ứng")).toBeInTheDocument();
    expect(screen.getByText("Sản phẩm & Công nghệ")).toBeInTheDocument();
  });
});
