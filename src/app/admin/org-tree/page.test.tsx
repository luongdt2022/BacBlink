import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrgTreeRetiredPage from "./page";
import { authClient } from "@/lib/auth-client";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
}));

describe("OrgTreeRetiredPage (410 Gone)", () => {
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

    render(<OrgTreeRetiredPage />);

    expect(screen.getByTestId("deprecated-route-410")).toBeInTheDocument();
    expect(screen.getByText("410 Gone")).toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/admin");
  });
});
