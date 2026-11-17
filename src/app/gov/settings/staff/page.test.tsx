import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import GovStaffRetiredPage from "./page";
import { authClient } from "@/lib/auth-client";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  usePathname: () => "/gov/settings/staff",
  useSearchParams: () => new URLSearchParams(),
}));

describe("GovStaffRetiredPage (/gov/settings/staff 410 Gone & 3-Tier RBAC)", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    mockReplace.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders 410 Gone notice without legacy provincial staff management and redirects ADMIN to /admin", () => {
    authClient.setSession("t", {
      id: "admin-1",
      email: "admin@baclink.org.vn",
      fullName: "Quản trị viên BACLINK",
      role: "ADMIN",
    });

    render(<GovStaffRetiredPage />);

    expect(screen.getByTestId("deprecated-route-410")).toBeInTheDocument();
    expect(screen.getByText("410 Gone")).toBeInTheDocument();
    expect(screen.queryByTestId("btn-open-add-staff")).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/admin");
  });

  it("redirects ENTERPRISE to /portal", () => {
    authClient.setSession("t", {
      id: "ent-1",
      email: "dn@baclink.org.vn",
      fullName: "Doanh nghiệp Hội viên",
      role: "ENTERPRISE",
    });

    render(<GovStaffRetiredPage />);
    expect(mockReplace).toHaveBeenCalledWith("/portal");
    expect(screen.getByRole("link", { name: /Workspace Doanh nghiệp/i })).toHaveAttribute("href", "/portal");
  });

  it("denies legacy PROVINCIAL_ADMIN / PUBLIC_USER and redirects to /", () => {
    authClient.setSession("t", {
      id: "admin-hp-01",
      email: "giamdoc@hp.gov.vn",
      fullName: "Giám Đốc Sở Hải Phòng",
      role: "PROVINCIAL_ADMIN",
    });

    render(<GovStaffRetiredPage />);
    expect(mockReplace).toHaveBeenCalledWith("/");
    expect(screen.getByRole("link", { name: /Trang chủ BACLINK/i })).toHaveAttribute("href", "/");
  });
});
