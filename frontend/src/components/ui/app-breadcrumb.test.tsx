import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AppBreadcrumb } from "./app-breadcrumb";

let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("AppBreadcrumb Component", () => {
  afterEach(() => {
    cleanup();
    mockPathname = "/";
  });

  it("hides on home '/' by default when hideOnHome is true", () => {
    mockPathname = "/";
    const { container } = render(<AppBreadcrumb />);
    expect(container.firstChild).toBeNull();
  });

  it("renders breadcrumbs correctly for nested paths with mapped labels", () => {
    mockPathname = "/chao-ban-cong-nghe/create";
    render(<AppBreadcrumb />);

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();

    // Home link
    const homeLink = screen.getByRole("link", { name: /Trang chủ/i });
    expect(homeLink).toHaveAttribute("href", "/");

    // Parent link
    const parentLink = screen.getByRole("link", { name: /Chào bán công nghệ/i });
    expect(parentLink).toHaveAttribute("href", "/chao-ban-cong-nghe");

    // Current page
    const currentPage = screen.getByText("Đăng ký mới");
    expect(currentPage).toBeInTheDocument();
    expect(currentPage).toHaveAttribute("aria-current", "page");
  });

  it("renders custom items when provided", () => {
    const customItems = [
      { label: "Bắt đầu", href: "/" },
      { label: "Dự án", href: "/projects" },
      { label: "Chi tiết", current: true },
    ];
    render(<AppBreadcrumb items={customItems} />);

    expect(screen.getByRole("link", { name: "Bắt đầu" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Dự án" })).toHaveAttribute("href", "/projects");
    expect(screen.getByText("Chi tiết")).toHaveAttribute("aria-current", "page");
  });

  it("injects Schema.org JSON-LD BreadcrumbList script", () => {
    mockPathname = "/chuyen-gia";
    const { container } = render(<AppBreadcrumb />);

    const script = container.querySelector("script[type='application/ld+json']");
    expect(script).not.toBeNull();
    const data = JSON.parse(script?.textContent || "{}");
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement).toHaveLength(2);
    expect(data.itemListElement[0].name).toBe("Trang chủ");
    expect(data.itemListElement[1].name).toBe("Mạng lưới Chuyên gia");
  });
});
