import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import EnterpriseSurveyRetiredPage from "./page";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  usePathname: () => "/khao-sat-doanh-nghiep",
}));

describe("Retired Enterprise Survey Route (/khao-sat-doanh-nghiep)", () => {
  beforeEach(() => {
    cleanup();
    mockReplace.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects /khao-sat-doanh-nghiep cleanly to /nhu-cau-cong-nghe", () => {
    render(<EnterpriseSurveyRetiredPage />);
    expect(screen.getByTestId("deprecated-route-410")).toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/nhu-cau-cong-nghe");
  });
});
