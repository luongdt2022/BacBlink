import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import PortalLayout from "./layout";
import { authClient } from "@/lib/auth-client";

let mockPathname = "/portal";
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/auth/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    getUser: vi.fn(),
  },
}));

describe("PortalLayout PO-Approved Role-Tailored Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/portal";
  });

  afterEach(() => {
    cleanup();
  });

  it("renders Buyer tailored workspace menu for BUYER role", () => {
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

    expect(screen.getByText("Bên Mua Công Nghệ")).toBeInTheDocument();
    expect(screen.getByText("Workspace Bên Mua")).toBeInTheDocument();
    expect(screen.getByText("Bài toán Tìm mua")).toBeInTheDocument();
    expect(screen.getByText("Tiến trình Hợp tác & MOU")).toBeInTheDocument();
    expect(screen.getByText("Khảo sát Nhu cầu (TNI)")).toBeInTheDocument();
    expect(screen.getByText("Đánh giá Năng lực TT17")).toBeInTheDocument();
    expect(screen.queryByText("Kho Công nghệ (TRL)")).not.toBeInTheDocument();
    expect(screen.queryByText("Hồ sơ LLKH của tôi")).not.toBeInTheDocument();
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
    expect(screen.getByText("Kho Công nghệ (TRL)")).toBeInTheDocument();
    expect(screen.getByText("Yêu cầu Kết nối Nhận được")).toBeInTheDocument();
    expect(screen.getByText("Tiến trình Chuyển giao & MOU")).toBeInTheDocument();
    expect(screen.queryByText("Niêm yết Công nghệ mới")).not.toBeInTheDocument();
    expect(screen.queryByText("Bài toán Tìm mua")).not.toBeInTheDocument();
    expect(screen.queryByText("Hồ sơ LLKH của tôi")).not.toBeInTheDocument();
  });

  it("renders Expert tailored workspace menu for VERIFIED_EXPERT role", () => {
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

    expect(screen.getByText("Chuyên Gia KH&CN")).toBeInTheDocument();
    expect(screen.getByText("Workspace Chuyên Gia")).toBeInTheDocument();
    expect(screen.getByText("Tài khoản Chuyên gia")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tài khoản Chuyên gia/i })).toHaveAttribute("href", "/portal/expert/account");
    expect(screen.getByText("Tổng quan Chuyên gia")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tổng quan Chuyên gia/i })).toHaveAttribute("href", "/portal/expert/profile");
    expect(screen.getByText("Hồ sơ LLKH của tôi")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Hồ sơ LLKH của tôi/i })).toHaveAttribute("href", "/portal/expert/profile/edit");
    expect(screen.getByText("Hộp Thư Tư Vấn & Kết Nối")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Hộp Thư Tư Vấn & Kết Nối/i })).toHaveAttribute("href", "/portal/expert/consultations");
    expect(screen.getByText("Radar Cơ hội Phù hợp (AI)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Radar Cơ hội Phù hợp \(AI\)/i })).toHaveAttribute("href", "/portal/matching/radar");
    expect(screen.getByText("Dự án Đồng hành & Hợp tác")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dự án Đồng hành & Hợp tác/i })).toHaveAttribute("href", "/portal/expert/projects");

    // Negative assertions: Expert workspace must not link to legacy pipeline
    expect(document.querySelector('a[href*="/portal/opportunities/pipeline"]')).toBeNull();
    expect(screen.queryByText("Kho Công nghệ (TRL)")).not.toBeInTheDocument();
    expect(screen.queryByText("Bài toán Tìm mua")).not.toBeInTheDocument();
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

  it("renders Innovation Entity grouped workspace menu for INNOVATION_ENTITY role", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u4",
      email: "innovation@dn.vn",
      fullName: "Doanh Nghiệp ĐMST",
      role: "INNOVATION_ENTITY",
    });

    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    );

    expect(screen.getByText("Doanh Nghiệp ĐMST")).toBeInTheDocument();
    expect(screen.getByText("Workspace Đổi Mới Sáng Tạo")).toBeInTheDocument();
    expect(screen.getByText("Hoạt động Cung – Cầu")).toBeInTheDocument();
    expect(screen.getByText("Bài toán Cần Mua")).toBeInTheDocument();
    expect(screen.getByText("Công nghệ Chào Bán")).toBeInTheDocument();
    expect(screen.getByText("Năng lực & Hồ sơ")).toBeInTheDocument();
    expect(screen.getByText("Tự Đánh giá TT17")).toBeInTheDocument();
  });

  it("renders Public User onboarding workspace menu for PUBLIC_USER role", () => {
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

    expect(screen.getByText("Thành Viên Đại Chúng")).toBeInTheDocument();
    expect(screen.getByText("Bàn Làm Việc Cá Nhân")).toBeInTheDocument();
    expect(screen.getByText("Radar Khám Phá AI")).toBeInTheDocument();
    expect(screen.getByText("Đăng ký Nâng hạng Vai trò")).toBeInTheDocument();
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
    expect(screen.getByText("Về Tổng Hành Dinh Quản Trị")).toBeInTheDocument();
    expect(screen.getByText("Kho Chào bán Toàn sàn")).toBeInTheDocument();
    expect(screen.getByText("Bài toán Nhu cầu Toàn sàn")).toBeInTheDocument();
  });

  it("activates only 'Tiến trình Chuyển giao & MOU' when on /portal/opportunities/pipeline without query", () => {
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

    const pipelineLink = screen.getByRole("link", { name: /Tiến trình Chuyển giao & MOU/i });
    const inboundLink = screen.getByRole("link", { name: /Yêu cầu Kết nối Nhận được/i });

    expect(pipelineLink.className).toContain("bg-brand-700");
    expect(pipelineLink.className).toContain("text-white");
    expect(inboundLink.className).not.toContain("bg-brand-700");
  });

  it("activates only 'Yêu cầu Kết nối Nhận được' when on /portal/opportunities/pipeline?tab=inbound", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u2",
      email: "seller@example.com",
      fullName: "Trần Văn Seller",
      role: "SELLER",
    });
    mockPathname = "/portal/opportunities/pipeline";
    mockSearchParams = new URLSearchParams("tab=inbound");

    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    );

    const pipelineLink = screen.getByRole("link", { name: /Tiến trình Chuyển giao & MOU/i });
    const inboundLink = screen.getByRole("link", { name: /Yêu cầu Kết nối Nhận được/i });

    expect(inboundLink.className).toContain("bg-brand-700");
    expect(inboundLink.className).toContain("text-white");
    expect(pipelineLink.className).not.toContain("bg-brand-700");
  });
});
