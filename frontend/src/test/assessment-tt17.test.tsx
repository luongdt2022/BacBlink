import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Tt17WizardRetiredPage from "@/app/(portal)/assessments/tt17/wizard/page";
import Tt17HubRetiredPage from "@/app/(portal)/assessments/tt17/page";
import BuyerRetiredPage from "@/app/(portal)/assessments/buyer/page";
import CapacitySurveyRetiredPage from "@/app/(portal)/dieu-tra-trinh-do-nang-luc/page";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock }),
  usePathname: () => "/assessments/tt17",
  useSearchParams: () => new URLSearchParams(),
}));

describe("CR-BACLINK-007: Retired Assessment & Survey Routes Redirect Safely", () => {
  beforeEach(() => {
    cleanup();
    replaceMock.mockReset();
  });

  afterEach(cleanup);

  it("redirects /assessments/tt17 to /portal without rendering survey form", () => {
    render(<Tt17HubRetiredPage />);
    expect(screen.getByTestId("deprecated-route-410")).toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/portal");
  });

  it("redirects /assessments/tt17/wizard to /portal without rendering 26-criteria wizard", () => {
    render(<Tt17WizardRetiredPage />);
    expect(screen.getByTestId("deprecated-route-410")).toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/portal");
  });

  it("redirects /assessments/buyer to /nhu-cau-cong-nghe", () => {
    render(<BuyerRetiredPage />);
    expect(screen.getByTestId("deprecated-route-410")).toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/nhu-cau-cong-nghe");
  });

  it("redirects /dieu-tra-trinh-do-nang-luc to /doanh-nghiep-dmst", () => {
    render(<CapacitySurveyRetiredPage />);
    expect(screen.getByTestId("deprecated-route-410")).toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/doanh-nghiep-dmst");
  });
});
