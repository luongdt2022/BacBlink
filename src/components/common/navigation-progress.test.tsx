import React from "react";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NavigationProgress } from "./navigation-progress";

// Mock next/navigation
let currentPathname = "/";
let currentSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
  useSearchParams: () => currentSearchParams,
}));

describe("NavigationProgress Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    currentPathname = "/";
    currentSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("does not render when idle and progress is 0", () => {
    const { container } = render(<NavigationProgress />);
    expect(container.firstChild).toBeNull();
  });

  it("activates progress bar when an internal link is clicked", () => {
    render(
      <div>
        <NavigationProgress />
        <a href="/chao-ban-cong-nghe" data-testid="internal-link">
          Chào bán
        </a>
      </div>
    );

    const link = screen.getByTestId("internal-link");
    
    act(() => {
      fireEvent.click(link);
    });

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
    expect(Number(progressBar.getAttribute("aria-valuenow"))).toBeGreaterThan(0);
  });

  it("ignores external links, anchor hashes, and target=_blank", () => {
    render(
      <div>
        <NavigationProgress />
        <a href="#section" data-testid="hash-link">
          Hash
        </a>
        <a href="https://google.com" target="_blank" data-testid="external-link">
          External
        </a>
      </div>
    );

    act(() => {
      fireEvent.click(screen.getByTestId("hash-link"));
      fireEvent.click(screen.getByTestId("external-link"));
    });

    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("completes and hides progress bar after route changes", () => {
    const { rerender } = render(
      <div>
        <NavigationProgress />
        <a href="/nhu-cau-cong-nghe" data-testid="link">
          Nhu cầu
        </a>
      </div>
    );

    act(() => {
      fireEvent.click(screen.getByTestId("link"));
    });

    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    // Giả lập pathname đổi sau khi chuyển trang
    currentPathname = "/nhu-cau-cong-nghe";
    rerender(
      <div>
        <NavigationProgress />
        <a href="/nhu-cau-cong-nghe" data-testid="link">
          Nhu cầu
        </a>
      </div>
    );

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});
