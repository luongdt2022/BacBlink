import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";

import AdminAuditLogsPage from "./audit-logs/page";
import AdminSystemConfigPage from "./system-config/page";

afterEach(() => {
  cleanup();
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin",
  useSearchParams: () => new URLSearchParams(),
}));

describe("T061 [QC-Routing] Admin Breadcrumbs WAI-ARIA Standard Verification", () => {
  it("renders WAI-ARIA breadcrumbs on AdminAuditLogsPage and excludes AdminNav", () => {
    const { container } = render(<AdminAuditLogsPage />);

    const nav = screen.getByRole("navigation", { name: /Breadcrumb/i });
    expect(nav).toBeInTheDocument();

    const homeLink = screen.getByRole("link", { name: /Trang chủ/i });
    expect(homeLink).toHaveAttribute("href", "/");

    const adminLink = screen.getByRole("link", { name: /Quản Trị Hệ Thống/i });
    expect(adminLink).toHaveAttribute("href", "/admin");

    const currentPage = screen.getByText("Nhật Ký Kiểm Toán Cấp Độ 3");
    expect(currentPage).toHaveAttribute("aria-current", "page");

    // Must NOT contain AdminNav
    expect(container.querySelector('[data-testid="admin-nav"]')).toBeNull();
  });

  it("renders WAI-ARIA breadcrumbs on AdminSystemConfigPage and excludes AdminNav", () => {
    const { container } = render(<AdminSystemConfigPage />);

    const nav = screen.getByRole("navigation", { name: /Breadcrumb/i });
    expect(nav).toBeInTheDocument();

    const currentPage = screen.getByText("Cấu Hình Hệ Thống & Tham Số SLA");
    expect(currentPage).toHaveAttribute("aria-current", "page");

    expect(container.querySelector('[data-testid="admin-nav"]')).toBeNull();
  });
});
