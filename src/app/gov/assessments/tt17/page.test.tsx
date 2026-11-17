import React from "react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import GovAssessmentsRetiredPage from "./page";
import { authClient } from "@/lib/auth-client";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  usePathname: () => "/gov/assessments/tt17",
  useSearchParams: () => new URLSearchParams(),
}));

describe("GovAssessmentsRetiredPage (/gov/assessments/tt17 410 Gone & 3-Tier RBAC)", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    mockReplace.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders 410 Gone notice without legacy provincial TT17 queue and redirects ADMIN to /admin", () => {
    authClient.setSession("t", {
      id: "admin-1",
      email: "admin@baclink.org.vn",
      fullName: "Quản trị viên BACLINK",
      role: "ADMIN",
    });

    render(<GovAssessmentsRetiredPage />);

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

    render(<GovAssessmentsRetiredPage />);
    expect(mockReplace).toHaveBeenCalledWith("/portal");
  });

  it("redirects legacy PROVINCE_OFFICER and unauthenticated users to /", () => {
    authClient.setSession("t", {
      id: "gov-user-hanoi",
      email: "chuyenvien@hanoi.gov.vn",
      fullName: "Lê Văn Thẩm Tra",
      role: "PROVINCE_OFFICER",
    });

    const { unmount } = render(<GovAssessmentsRetiredPage />);
    expect(mockReplace).toHaveBeenCalledWith("/");

    unmount();
    mockReplace.mockReset();
    authClient.clearSession();

    render(<GovAssessmentsRetiredPage />);
    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});
