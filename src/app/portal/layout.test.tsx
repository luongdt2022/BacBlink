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

describe("PortalLayout Dynamic Role Navigation", () => {
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
    expect(screen.getByText("Bài toán Tìm mua (Buyer)")).toBeInTheDocument();
    expect(screen.getByText("Khảo sát Nhu cầu DNNVV")).toBeInTheDocument();
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
    expect(screen.getByText("Niêm yết Công nghệ mới")).toBeInTheDocument();
    expect(screen.queryByText("Bài toán Tìm mua (Buyer)")).not.toBeInTheDocument();
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
    expect(screen.getByText("Radar Cơ hội AI")).toBeInTheDocument();
    expect(screen.queryByText("Kho Công nghệ (TRL)")).not.toBeInTheDocument();
    expect(screen.queryByText("Bài toán Tìm mua (Buyer)")).not.toBeInTheDocument();
  });

  it("renders Admin quick-link card and unified market view for SUPER_ADMIN role", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u4",
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
    expect(screen.getByText("Về Tổng Hành Dinh Quản Trị")).toBeInTheDocument();
    expect(screen.getByText("Kho Chào bán (TRL)")).toBeInTheDocument();
    expect(screen.getByText("Bài toán Tìm mua")).toBeInTheDocument();
  });
});
