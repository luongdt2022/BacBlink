import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import GovOpportunitiesRetiredPage from "./page";
import { authClient } from "@/lib/auth-client";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  usePathname: () => "/gov/opportunities",
  useSearchParams: () => new URLSearchParams(),
}));

describe("GovOpportunitiesRetiredPage (/gov/opportunities 410 Gone & 3-Tier RBAC)", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    mockReplace.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders 410 Gone notice without legacy /gov/opportunities queue and redirects ADMIN to /admin", () => {
    authClient.setSession("t", {
      id: "admin-1",
      email: "admin@baclink.org.vn",
      fullName: "Quản trị viên BACLINK",
      role: "ADMIN",
    });

    render(<GovOpportunitiesRetiredPage />);

    expect(screen.getByTestId("deprecated-route-410")).toBeInTheDocument();
    expect(screen.getByText("410 Gone")).toBeInTheDocument();
    expect(screen.queryByTestId("gov-sla-chip")).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/admin");
  });

  it("redirects ENTERPRISE to /portal and legacy PROVINCIAL_ADMIN / anonymous to /", () => {
    authClient.setSession("t", {
      id: "ent-1",
      email: "dn@baclink.org.vn",
      fullName: "Doanh nghiệp Hội viên",
      role: "ENTERPRISE",
    });

    const { unmount } = render(<GovOpportunitiesRetiredPage />);
    expect(mockReplace).toHaveBeenCalledWith("/portal");

    unmount();
    mockReplace.mockReset();
    authClient.setSession("t", {
      id: "user-hp-01",
      email: "lanhdao@hp.gov.vn",
      fullName: "Lãnh đạo Sở KH&CN",
      role: "PROVINCIAL_ADMIN",
    });

    render(<GovOpportunitiesRetiredPage />);
    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});
