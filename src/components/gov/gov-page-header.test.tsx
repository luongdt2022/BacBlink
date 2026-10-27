import React from "react";
import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ShieldCheck, Download, RefreshCw } from "lucide-react";
import { GovPageHeader, GovBreadcrumbItem } from "./gov-page-header";

describe("T081 [FE-GovPageHeader] GovPageHeader Component Tests", () => {
  afterEach(cleanup);

  const defaultBreadcrumbs: GovBreadcrumbItem[] = [
    { label: "Cổng Công Vụ", href: "/gov" },
    { label: "Quản Lý Thẩm Định", href: "/gov/approvals" },
    { label: "Hàng Đợi Kiểm Duyệt Địa Bàn" },
  ];

  it("renders 3-level breadcrumbs with WAI-ARIA compliance", () => {
    render(
      <GovPageHeader
        breadcrumbs={defaultBreadcrumbs}
        title="Hàng Đợi Kiểm Duyệt Địa Bàn"
        icon={ShieldCheck}
      />
    );

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();

    const link1 = screen.getByRole("link", { name: "Cổng Công Vụ" });
    expect(link1).toHaveAttribute("href", "/gov");

    const link2 = screen.getByRole("link", { name: "Quản Lý Thẩm Định" });
    expect(link2).toHaveAttribute("href", "/gov/approvals");

    const currentPage = screen.getByText("Hàng Đợi Kiểm Duyệt Địa Bàn", { selector: "[aria-current='page']" });
    expect(currentPage).toBeInTheDocument();
  });

  it("renders page title, icon, and subtitle", () => {
    render(
      <GovPageHeader
        breadcrumbs={defaultBreadcrumbs}
        title="Hàng Đợi Kiểm Duyệt Địa Bàn"
        subtitle="Thẩm định hồ sơ theo cơ chế 3D Scoped RBAC"
        icon={ShieldCheck}
      />
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hàng Đợi Kiểm Duyệt Địa Bàn");
    expect(screen.getByText("Thẩm định hồ sơ theo cơ chế 3D Scoped RBAC")).toBeInTheDocument();
  });

  it("renders scope badge correctly with resolveProvinceName", () => {
    const { rerender } = render(
      <GovPageHeader
        breadcrumbs={defaultBreadcrumbs}
        title="Hàng Đợi Kiểm Duyệt"
        icon={ShieldCheck}
        scopeCode="HN"
      />
    );

    const badgeHN = screen.getByTestId("gov-scope-badge");
    expect(badgeHN).toHaveTextContent("Hà Nội (HN)");

    rerender(
      <GovPageHeader
        breadcrumbs={defaultBreadcrumbs}
        title="Hàng Đợi Kiểm Duyệt"
        icon={ShieldCheck}
        scopeCode="SG"
      />
    );
    const badgeSG = screen.getByTestId("gov-scope-badge");
    expect(badgeSG).toHaveTextContent("TP. Hồ Chí Minh (SG)");

    rerender(
      <GovPageHeader
        breadcrumbs={defaultBreadcrumbs}
        title="Hàng Đợi Kiểm Duyệt"
        icon={ShieldCheck}
        scopeCode="ALL"
      />
    );
    const badgeALL = screen.getByTestId("gov-scope-badge");
    expect(badgeALL).toHaveTextContent("Toàn quốc (ALL)");
  });

  it("omits scope badge when scopeCode is not provided or whitespace only", () => {
    const { rerender } = render(
      <GovPageHeader
        breadcrumbs={defaultBreadcrumbs}
        title="Hàng Đợi Kiểm Duyệt"
        icon={ShieldCheck}
      />
    );

    expect(screen.queryByTestId("gov-scope-badge")).not.toBeInTheDocument();

    rerender(
      <GovPageHeader
        breadcrumbs={defaultBreadcrumbs}
        title="Hàng Đợi Kiểm Duyệt"
        icon={ShieldCheck}
        scopeCode="   "
      />
    );
    expect(screen.queryByTestId("gov-scope-badge")).not.toBeInTheDocument();
  });

  it("renders default status chips for SLA ≤ 48h and Maker-Checker 2 Cấp", () => {
    render(
      <GovPageHeader
        breadcrumbs={defaultBreadcrumbs}
        title="Hàng Đợi Kiểm Duyệt"
        icon={ShieldCheck}
      />
    );

    const slaChip = screen.getByTestId("gov-sla-chip");
    expect(slaChip).toHaveTextContent("SLA ≤ 48h");

    const mcChip = screen.getByTestId("gov-maker-checker-chip");
    expect(mcChip).toHaveTextContent("Maker-Checker 2 Cấp");
  });

  it("supports custom status chip texts or hiding them", () => {
    const { rerender } = render(
      <GovPageHeader
        breadcrumbs={defaultBreadcrumbs}
        title="Hàng Đợi Kiểm Duyệt"
        icon={ShieldCheck}
        slaText="SLA ≤ 24h"
        makerCheckerText="Maker-Checker 3 Cấp"
      />
    );

    expect(screen.getByTestId("gov-sla-chip")).toHaveTextContent("SLA ≤ 24h");
    expect(screen.getByTestId("gov-maker-checker-chip")).toHaveTextContent("Maker-Checker 3 Cấp");

    rerender(
      <GovPageHeader
        breadcrumbs={defaultBreadcrumbs}
        title="Hàng Đợi Kiểm Duyệt"
        icon={ShieldCheck}
        slaText=""
        makerCheckerText=""
      />
    );

    expect(screen.queryByTestId("gov-sla-chip")).not.toBeInTheDocument();
    expect(screen.queryByTestId("gov-maker-checker-chip")).not.toBeInTheDocument();
  });

  it("renders actions slot with search, filter or export buttons", () => {
    render(
      <GovPageHeader
        breadcrumbs={defaultBreadcrumbs}
        title="Hàng Đợi Kiểm Duyệt"
        icon={ShieldCheck}
        actions={
          <div className="flex gap-2">
            <button type="button" className="action-btn">
              <RefreshCw className="w-4 h-4 mr-1" />
              Làm mới
            </button>
            <button type="button" className="action-btn">
              <Download className="w-4 h-4 mr-1" />
              Xuất Excel
            </button>
          </div>
        }
      />
    );

    const actionsContainer = screen.getByTestId("gov-header-actions");
    expect(actionsContainer).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Làm mới/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Xuất Excel/i })).toBeInTheDocument();
  });

  it("applies dark mode and custom classes gracefully", () => {
    const { container } = render(
      <GovPageHeader
        breadcrumbs={defaultBreadcrumbs}
        title="Tiêu Đề Tùy Biến"
        icon={ShieldCheck}
        className="custom-gov-header-class"
      />
    );

    const header = container.querySelector("header");
    expect(header).toHaveClass("custom-gov-header-class");
    expect(header).toHaveClass("dark:border-slate-800");
  });
});
