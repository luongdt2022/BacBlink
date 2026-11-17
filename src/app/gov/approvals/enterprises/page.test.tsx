import React from "react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import GovEnterpriseApprovalsRetiredPage from "./page";
import { authClient } from "@/lib/auth-client";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  usePathname: () => "/gov/approvals/enterprises",
  useSearchParams: () => new URLSearchParams(),
}));

describe("GovEnterpriseApprovalsRetiredPage (/gov/approvals/enterprises 410 Gone & 3-Tier RBAC)", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    mockReplace.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders 410 Gone notice without legacy 34-province approval queue and redirects ADMIN to /admin", () => {
    authClient.setSession("t", {
      id: "admin-1",
      email: "admin@baclink.org.vn",
      fullName: "Ban Quản trị BACLINK",
      role: "ADMIN",
    });

    render(<GovEnterpriseApprovalsRetiredPage />);

    expect(screen.getByTestId("deprecated-route-410")).toBeInTheDocument();
    expect(screen.getByText("410 Gone")).toBeInTheDocument();
    expect(screen.queryByTestId("gov-scope-badge")).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/admin");
  });

  it("redirects ENTERPRISE to /portal", () => {
    authClient.setSession("t", {
      id: "ent-1",
      email: "dn@baclink.org.vn",
      fullName: "Doanh nghiệp Hội viên",
      role: "ENTERPRISE",
    });

    render(<GovEnterpriseApprovalsRetiredPage />);

    expect(mockReplace).toHaveBeenCalledWith("/portal");
    expect(screen.getByRole("link", { name: /Workspace Doanh nghiệp/i })).toHaveAttribute("href", "/portal");
  });

  it("denies legacy PROVINCIAL_ADMIN access and redirects to /", () => {
    authClient.setSession("t", {
      id: "gov-user-1",
      email: "lanhdao@hanoi.gov.vn",
      fullName: "Trần Văn Lãnh Đạo",
      role: "PROVINCIAL_ADMIN",
    });

    render(<GovEnterpriseApprovalsRetiredPage />);

    expect(mockReplace).toHaveBeenCalledWith("/");
    expect(screen.getByRole("link", { name: /Trang chủ BACLINK/i })).toHaveAttribute("href", "/");
  });
});
