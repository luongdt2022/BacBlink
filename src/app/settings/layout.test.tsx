import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SettingsLayout from "./layout";
import { authClient } from "@/lib/auth-client";

let mockPathname = "/settings";
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
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/components/auth/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    getUser: vi.fn(),
  },
  normalizePlatformRole: (role: string) => {
    const upper = (role || "").toUpperCase();
    if (["ADMIN", "SUPER_ADMIN", "OPERATOR_ADMIN", "PROVINCIAL_ADMIN", "SECTOR_ADMIN", "CLUSTER_ADMIN"].includes(upper)) return "ADMIN";
    if (["ENTERPRISE", "SELLER", "BUYER", "INNOVATION_ENTITY"].includes(upper)) return "ENTERPRISE";
    return "PUBLIC_USER";
  },
}));

vi.mock("@/lib/enterprise-client", () => ({
  fetchMyEnterpriseProfile: vi.fn().mockResolvedValue(null),
}));

describe("SettingsLayout - Retaining Left Workspace Sidebar Menu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/settings";
  });

  afterEach(() => {
    cleanup();
  });

  it("retains the left sidebar menu for PUBLIC_USER with active 'Cài đặt Tài khoản' link", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u-public-1",
      email: "public1@gmail.com",
      fullName: "Dang Luong Luong",
      role: "PUBLIC_USER",
    });

    render(
      <SettingsLayout>
        <div data-testid="settings-child">Nội dung cài đặt tài khoản</div>
      </SettingsLayout>
    );

    // 1. Sidebar header and badge are rendered
    expect(screen.getByText("Không Gian Thành Viên")).toBeInTheDocument();
    expect(screen.getByText("Thành Viên Đại Chúng")).toBeInTheDocument();

    // 2. Sidebar navigation items are present
    expect(screen.getByRole("link", { name: /^Trang tổng quan$/i })).toHaveAttribute("href", "/portal");
    expect(screen.getByRole("link", { name: /Nhu cầu công nghệ/i })).toHaveAttribute("href", "/portal/buyer/demands");
    expect(screen.getByRole("link", { name: /Radar Ghép Nối AI/i })).toHaveAttribute("href", "/portal/matching/radar");
    expect(screen.getByRole("link", { name: /Đăng ký Nâng hạng Vai trò/i })).toHaveAttribute("href", "/profile/upgrade");

    // 3. 'Cài đặt Tài khoản' link is present and highlighted as active
    const settingsLink = screen.getByRole("link", { name: /Cài đặt Tài khoản/i });
    expect(settingsLink).toBeInTheDocument();
    expect(settingsLink).toHaveAttribute("href", "/settings");
    expect(settingsLink.className).toContain("bg-brand-700");
    expect(settingsLink.className).toContain("text-white");

    // 4. Children content is rendered
    expect(screen.getByTestId("settings-child")).toBeInTheDocument();
  });

  it("retains the left sidebar menu for EXPERT with active 'Cài đặt & Tài khoản' link", () => {
    vi.mocked(authClient.getUser).mockReturnValue({
      id: "u-exp-1",
      email: "expert@nacentech.vn",
      fullName: "TS. Nguyễn Chuyên Gia",
      role: "VERIFIED_EXPERT",
    });

    render(
      <SettingsLayout>
        <div data-testid="settings-child">Nội dung cài đặt tài khoản</div>
      </SettingsLayout>
    );

    // 1. Expert workspace title & badge
    expect(screen.getByText("Workspace Chuyên Gia")).toBeInTheDocument();
    expect(screen.getByText("Chuyên Gia KH&CN")).toBeInTheDocument();

    // 2. 'Cài đặt & Tài khoản' is active
    const accountLink = screen.getByRole("link", { name: /Cài đặt & Tài khoản/i });
    expect(accountLink).toBeInTheDocument();
    expect(accountLink.className).toContain("bg-brand-700");
    expect(accountLink.className).toContain("text-white");

    // 3. Children content is rendered
    expect(screen.getByTestId("settings-child")).toBeInTheDocument();
  });
});
