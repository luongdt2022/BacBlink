import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GovLayout from "./layout";
import { authClient } from "@/lib/auth-client";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  usePathname: () => "/gov",
  useSearchParams: () => new URLSearchParams(),
}));

describe("GovLayout Retired Route Redirect & 410 Gone", () => {
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
      id: "a1",
      email: "admin@baclink.vn",
      fullName: "Admin",
      role: "ADMIN",
    });

    render(
      <GovLayout>
        <div>Legacy Gov Child</div>
      </GovLayout>
    );

    expect(screen.getByTestId("deprecated-route-410")).toBeInTheDocument();
    expect(screen.getByText("410 Gone")).toBeInTheDocument();
    expect(screen.queryByText("Legacy Gov Child")).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/admin");
  });

  it("redirects ENTERPRISE to /portal", () => {
    authClient.setSession("t", {
      id: "e1",
      email: "dn@baclink.vn",
      fullName: "DN Hội Viên",
      role: "ENTERPRISE",
    });

    render(
      <GovLayout>
        <div>Legacy Gov Child</div>
      </GovLayout>
    );

    expect(mockReplace).toHaveBeenCalledWith("/portal");
    expect(screen.getByRole("link", { name: /Workspace Doanh nghiệp/i })).toHaveAttribute("href", "/portal");
  });

  it("redirects legacy PROVINCIAL_ADMIN / PUBLIC_USER / anonymous to /", () => {
    authClient.setSession("t", {
      id: "g1",
      email: "legacy@gov.vn",
      fullName: "Legacy Gov",
      role: "PROVINCIAL_ADMIN",
    });

    render(
      <GovLayout>
        <div>Legacy Gov Child</div>
      </GovLayout>
    );

    expect(mockReplace).toHaveBeenCalledWith("/");
    expect(screen.getByRole("link", { name: /Trang chủ BACLINK/i })).toHaveAttribute("href", "/");
  });
});
