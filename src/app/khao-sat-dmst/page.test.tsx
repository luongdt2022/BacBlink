import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import KhaoSatDmstRetiredPage from "./page";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  usePathname: () => "/khao-sat-dmst",
}));

describe("Retired Capacity Survey Route (/khao-sat-dmst)", () => {
  beforeEach(() => {
    cleanup();
    mockReplace.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects /khao-sat-dmst cleanly to /doanh-nghiep-dmst without exposing 43-question survey", () => {
    render(<KhaoSatDmstRetiredPage />);
    expect(screen.getByTestId("deprecated-route-410")).toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/doanh-nghiep-dmst");
    expect(screen.getByRole("link", { name: /Danh bạ Doanh nghiệp Hội viên/i })).toHaveAttribute(
      "href",
      "/doanh-nghiep-dmst"
    );
  });
});
