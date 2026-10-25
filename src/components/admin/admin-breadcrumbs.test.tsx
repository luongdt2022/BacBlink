import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminBreadcrumbs } from "./admin-breadcrumbs";

describe("AdminBreadcrumbs (T056)", () => {
  it("renders correctly according to WAI-ARIA breadcrumbs pattern", () => {
    render(
      <AdminBreadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Quản Trị Hệ Thống", href: "/admin" },
          { label: "Hàng Đợi Phê Duyệt Toàn Quốc" },
        ]}
      />
    );

    const nav = screen.getByRole("navigation", { name: /Breadcrumb/i });
    expect(nav).toBeInTheDocument();

    const homeLink = screen.getByRole("link", { name: /Trang chủ/i });
    expect(homeLink).toHaveAttribute("href", "/");

    const adminLink = screen.getByRole("link", { name: /Quản Trị Hệ Thống/i });
    expect(adminLink).toHaveAttribute("href", "/admin");

    const currentPage = screen.getByText("Hàng Đợi Phê Duyệt Toàn Quốc");
    expect(currentPage).toHaveAttribute("aria-current", "page");
  });

  it("returns null when items is empty", () => {
    const { container } = render(<AdminBreadcrumbs items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
