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

  it("activates synchronously at 25% with high-contrast h-[3px] CLS=0 bar immediately on click", () => {
    render(
      <div>
        <NavigationProgress />
        <a href="/admin/users" data-testid="sync-link">
          Users
        </a>
      </div>
    );

    fireEvent.click(screen.getByTestId("sync-link"));

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar.getAttribute("aria-valuenow")).toBe("25");
    expect(progressBar.className).toContain("fixed");
    expect(progressBar.className).toContain("top-0");
    expect(progressBar.className).toContain("h-[3px]");
    expect(progressBar.className).toContain("pointer-events-none");
  });

  it("ignores mailto:, tel:, modifier keys (ctrlKey/metaKey), and defaultPrevented clicks", () => {
    const preventInCapture = (e: MouseEvent) => {
      if ((e.target as HTMLElement | null)?.closest("[data-testid='prevented-link']")) {
        e.preventDefault();
      }
    };
    window.addEventListener("click", preventInCapture, true);

    try {
      render(
        <div>
          <NavigationProgress />
          <a href="mailto:support@nacentech.vn" data-testid="mailto-link">
            Mail
          </a>
          <a href="tel:02412345678" data-testid="tel-link">
            Tel
          </a>
          <a href="/admin/users" data-testid="mod-link">
            Users
          </a>
          <a href="/admin/roles" data-testid="prevented-link">
            Prevented
          </a>
        </div>
      );

      act(() => {
        fireEvent.click(screen.getByTestId("mailto-link"));
        fireEvent.click(screen.getByTestId("tel-link"));
        fireEvent.click(screen.getByTestId("mod-link"), { ctrlKey: true });
        fireEvent.click(screen.getByTestId("mod-link"), { metaKey: true });
        fireEvent.click(screen.getByTestId("prevented-link"));
      });

      expect(screen.queryByRole("progressbar")).toBeNull();
    } finally {
      window.removeEventListener("click", preventInCapture, true);
    }
  });

  it("ignores clicks pointing to the exact same pathname and search as current location", () => {
    window.history.replaceState({}, "", "/admin/approvals?tab=sla");
    currentPathname = "/admin/approvals";
    currentSearchParams = new URLSearchParams("tab=sla");

    render(
      <div>
        <NavigationProgress />
        <a href="/admin/approvals?tab=sla" data-testid="same-route-link">
          Same SLA
        </a>
      </div>
    );

    act(() => {
      fireEvent.click(screen.getByTestId("same-route-link"));
    });

    expect(screen.queryByRole("progressbar")).toBeNull();
    window.history.replaceState({}, "", "/");
  });

  it("completes and hides when only searchParams changes (e.g., ?tab=sla)", () => {
    window.history.replaceState({}, "", "/admin/approvals");
    currentPathname = "/admin/approvals";
    currentSearchParams = new URLSearchParams();

    const { rerender } = render(
      <div>
        <NavigationProgress />
        <a href="/admin/approvals?tab=sla" data-testid="tab-link">
          SLA Tab
        </a>
      </div>
    );

    act(() => {
      fireEvent.click(screen.getByTestId("tab-link"));
    });

    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    currentSearchParams = new URLSearchParams("tab=sla");
    rerender(
      <div>
        <NavigationProgress />
        <a href="/admin/approvals?tab=sla" data-testid="tab-link">
          SLA Tab
        </a>
      </div>
    );

    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByRole("progressbar")).toBeNull();
    window.history.replaceState({}, "", "/");
  });

  it("auto-closes via 15s fail-safe timeout if route never changes", () => {
    render(
      <div>
        <NavigationProgress />
        <a href="/slow-route" data-testid="slow-link">
          Slow
        </a>
      </div>
    );

    act(() => {
      fireEvent.click(screen.getByTestId("slow-link"));
    });

    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(15000);
    });

    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("cleans up all active timers and event listeners on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

    const { unmount } = render(
      <div>
        <NavigationProgress />
        <a href="/admin/sectors" data-testid="sectors-link">
          Sectors
        </a>
      </div>
    );

    act(() => {
      fireEvent.click(screen.getByTestId("sectors-link"));
    });

    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(clearIntervalSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it("ignores non-primary mouse buttons (e.g., button: 1) and links with download attribute", () => {
    render(
      <div>
        <NavigationProgress />
        <a href="/admin/users" data-testid="middle-click-link">
          Users
        </a>
        <a href="/files/report.pdf" download data-testid="download-link">
          Download
        </a>
      </div>
    );

    act(() => {
      fireEvent.click(screen.getByTestId("middle-click-link"), { button: 1 });
      fireEvent.click(screen.getByTestId("download-link"));
    });

    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("immediately hides and resets progress bar on Ping-Pong A -> B -> A click before B commits", () => {
    window.history.replaceState({}, "", "/admin");
    currentPathname = "/admin";
    currentSearchParams = new URLSearchParams();

    render(
      <div>
        <NavigationProgress />
        <a href="/admin" data-testid="link-a">
          Admin A
        </a>
        <a href="/admin/users" data-testid="link-b">
          Users B
        </a>
      </div>
    );

    // Click B while on A
    act(() => {
      fireEvent.click(screen.getByTestId("link-b"));
    });

    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    // Click back to A before B commits
    act(() => {
      fireEvent.click(screen.getByTestId("link-a"));
    });

    expect(screen.queryByRole("progressbar")).toBeNull();
    window.history.replaceState({}, "", "/");
  });
});
