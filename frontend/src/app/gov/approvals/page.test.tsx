import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import GovApprovalsRetiredPage from "./page";
import { authClient } from "@/lib/auth-client";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  usePathname: () => "/gov/approvals",
  useSearchParams: () => new URLSearchParams(),
}));

describe("GovApprovalsRetiredPage (/gov/approvals 410 Gone & 3-Tier RBAC)", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    mockReplace.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders 410 Gone notice and redirects ADMIN to /admin", () => {
    authClient.setSession("t", {
      id: "admin-1",
      email: "admin@baclink.org.vn",
      fullName: "Quản trị viên BACLINK",
      role: "ADMIN",
    });

    render(<GovApprovalsRetiredPage />);

    expect(screen.getByTestId("deprecated-route-410")).toBeInTheDocument();
    expect(screen.getByText("410 Gone")).toBeInTheDocument();
    expect(screen.getByText(/Phân hệ không còn áp dụng \(410 Gone\)/i)).toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/admin");
    expect(screen.getByRole("link", { name: /Về Trung tâm Quản trị/i })).toHaveAttribute("href", "/admin");
  });

  it("redirects ENTERPRISE to /portal and legacy PROVINCIAL_ADMIN / PUBLIC_USER to /", () => {
    authClient.setSession("t", {
      id: "ent-1",
      email: "dn@baclink.org.vn",
      fullName: "Doanh nghiệp Hội viên",
      role: "ENTERPRISE",
    });

    const { unmount } = render(<GovApprovalsRetiredPage />);
    expect(mockReplace).toHaveBeenCalledWith("/portal");
    expect(screen.getByRole("link", { name: /Workspace Doanh nghiệp/i })).toHaveAttribute("href", "/portal");

    unmount();
    mockReplace.mockReset();
    authClient.setSession("t", {
      id: "gov-legacy",
      email: "legacy@gov.vn",
      fullName: "Legacy Gov",
      role: "PROVINCIAL_ADMIN",
    });

    render(<GovApprovalsRetiredPage />);
    expect(mockReplace).toHaveBeenCalledWith("/");
    expect(screen.getByRole("link", { name: /Trang chủ BACLINK/i })).toHaveAttribute("href", "/");
  });
});
