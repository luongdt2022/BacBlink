import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import DeepSurveyRetiredPage from "./page";
import { calculateTniScore, getTniBadge } from "./types";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  usePathname: () => "/khao-sat-nhu-cau",
}));

describe("Retired Survey Route (/khao-sat-nhu-cau) & TNI Helpers", () => {
  beforeEach(() => {
    cleanup();
    mockReplace.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects retired survey route to /nhu-cau-cong-nghe without exposing survey form", () => {
    render(<DeepSurveyRetiredPage />);
    expect(screen.getByTestId("deprecated-route-410")).toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/nhu-cau-cong-nghe");
    expect(screen.getByRole("link", { name: /Bảng Nhu Cầu Mua & Đặt Hàng/i })).toHaveAttribute(
      "href",
      "/nhu-cau-cong-nghe"
    );
  });

  it("calculates TNI priority score accurately on K-L-N-O 1-5 scale", () => {
    expect(calculateTniScore(5, 5, 5, 5)).toBe(100);
    expect(calculateTniScore(4, 4, 3, 3)).toBe(73);
    expect(getTniBadge(85).label).toContain("Cấp thiết rất cao");
  });
});
