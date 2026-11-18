import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminAssessmentModuleRetiredPage from "./page";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock }),
}));

describe("AdminAssessmentModuleRetiredPage — CR-BACLINK-007 Clean Redirect", () => {
  beforeEach(() => {
    replaceMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("immediately replaces route to /admin and renders clean BACLINK notice with zero TT17/survey/34-province UI", () => {
    const { container } = render(<AdminAssessmentModuleRetiredPage />);

    expect(replaceMock).toHaveBeenCalledWith("/admin");
    expect(screen.getByTestId("deprecated-route-410")).toBeInTheDocument();
    expect(screen.getByText("410 Gone")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Về Trung tâm Quản trị \(\/admin\)/i })
    ).toHaveAttribute("href", "/admin");

    const text = container.textContent || "";
    expect(text).not.toMatch(/TT17|Thông tư 17|Phiếu khảo sát|ĐMST|34 tỉnh|Sở KH&CN|NacenTech|NacenTwin/i);
  });
});
