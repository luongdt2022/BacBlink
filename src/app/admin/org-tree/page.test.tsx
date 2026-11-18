import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrgTreeRetiredPage from "./page";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
}));

describe("OrgTreeRetiredPage — CR-BACLINK-007 Clean Redirect", () => {
  beforeEach(() => {
    cleanup();
    mockReplace.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders 410 Gone notice without 34 Sở KH&CN remnants and redirects to /admin", () => {
    const { container } = render(<OrgTreeRetiredPage />);

    expect(screen.getByTestId("deprecated-route-410")).toBeInTheDocument();
    expect(screen.getByText("410 Gone")).toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/admin");
    expect(
      screen.getByRole("link", { name: /Về Trung tâm Quản trị \(\/admin\)/i })
    ).toHaveAttribute("href", "/admin");

    const text = container.textContent || "";
    expect(text).not.toMatch(/34 Sở|Sở KH&CN|34 tỉnh|TT17|ĐMST|NacenTech|NacenTwin/i);
  });
});
