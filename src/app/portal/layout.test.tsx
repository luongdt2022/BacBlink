import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import PortalLayout from "./layout";
import { authClient } from "@/lib/auth-client";

vi.mock("next/navigation", () => ({
  usePathname: () => "/portal",
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
    expect(screen.getByText("Hồ sơ LLKH của tôi")).toBeInTheDocument();
    expect(screen.getByText("Lời mời Tư vấn Doanh nghiệp")).toBeInTheDocument();
    expect(screen.getByText("Radar Cơ hội Phù hợp (AI)")).toBeInTheDocument();
    expect(screen.getByText("Dự án Đồng hành & Hợp tác")).toBeInTheDocument();
    expect(screen.queryByText("Kho Công nghệ (TRL)")).not.toBeInTheDocument();
    expect(screen.queryByText("Bài toán Tìm mua")).not.toBeInTheDocument();
    expect(screen.queryByText("Sắp có")).not.toBeInTheDocument();
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
});
