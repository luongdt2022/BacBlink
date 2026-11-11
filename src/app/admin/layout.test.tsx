import React from "react";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import AdminLayout from "./layout";
import AdminLoading from "./loading";

beforeEach(() => {
  mockPathname = "/admin";
  mockSearch = "";
  mockRoleGuardBlocked = false;
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
});

// Mock Next.js navigation
let mockPathname = "/admin";
let mockSearch = "";
let mockRoleGuardBlocked = false;

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

// Mock role guard to render children directly (unless blocked in RBAC test)
vi.mock("@/components/auth/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) =>
    mockRoleGuardBlocked ? (
      <div data-testid="role-guard-denied">Truy cập bị từ chối</div>
    ) : (
      <div>{children}</div>
    ),
}));

describe("T070 [UI/UX] Admin Menu Navigation & Layout Refinement", () => {
  it("renders 4 Accordion groups, header and enterprise security badge", () => {
    mockPathname = "/admin";
    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    // Header
    expect(screen.queryByText("Tầng 0: Quản Trị Tối Cao")).not.toBeInTheDocument();
    expect(screen.getByText("Trung Tâm Quản Trị Hệ Thống")).toBeInTheDocument();
    expect(screen.queryByText("Phân hệ quản trị 34 tỉnh/thành trọng điểm")).not.toBeInTheDocument();

    // 4 Group Headers
    expect(screen.getByText("1. Trung Tâm Điều Hành")).toBeInTheDocument();
    expect(screen.getByText("2. Phê Duyệt Toàn Quốc")).toBeInTheDocument();
    expect(screen.getByText("3. Quản Trị Danh Mục & Cơ Cấu")).toBeInTheDocument();
    expect(screen.getByText("4. Giám Sát & Vận Hành")).toBeInTheDocument();

    // Badges đã được gỡ bỏ hoàn toàn theo yêu cầu tối giản đồng bộ Workspace
    expect(screen.queryByText("BI 360°")).not.toBeInTheDocument();
    expect(screen.queryByText("HUB")).not.toBeInTheDocument();

    // Footer
    expect(screen.getByText("An Toàn TT: Cấp 3")).toBeInTheDocument();
    expect(screen.getByText("NĐ 85/2016")).toBeInTheDocument();
  });

  it("renders all 8 critical navigation links with correct destinations", () => {
    mockPathname = "/admin";
    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    // 8 links
    expect(screen.getByRole("link", { name: /Tổng quan hệ thống/i })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: /Phiếu thu thập & đánh giá DN/i })).toHaveAttribute("href", "/admin/assessments/records");
    expect(screen.getByRole("link", { name: /Hàng đợi phê duyệt/i })).toHaveAttribute("href", "/admin/approvals");
    expect(screen.getByRole("link", { name: /Cảnh báo quá hạn SLA/i })).toHaveAttribute("href", "/admin/approvals?tab=sla");
    expect(screen.getByRole("link", { name: /Phê duyệt vượt cấp/i })).toHaveAttribute("href", "/admin/approvals?tab=override");
    expect(screen.getByRole("link", { name: /Phân quyền \(RBAC\)/i })).toHaveAttribute("href", "/admin/roles");
    expect(screen.getByRole("link", { name: /Cơ cấu 34 tỉnh\/thành/i })).toHaveAttribute("href", "/admin/org-tree");
    expect(screen.getByRole("link", { name: /Lĩnh vực TT17 & TRL/i })).toHaveAttribute("href", "/admin/sectors");
    expect(screen.getByRole("link", { name: /Nhật ký kiểm toán/i })).toHaveAttribute("href", "/admin/audit-logs");
    expect(screen.getByRole("link", { name: /Cấu hình hệ thống/i })).toHaveAttribute("href", "/admin/system-config");
  });

  it("removes distracting badges (SLA 72h, Tầng 0, 34 Tỉnh, Bản ghi DN) to ensure clean typography", () => {
    mockPathname = "/admin";
    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    // Toàn bộ badge gây dày/rối đã được gỡ bỏ để nhãn menu hiển thị trọn vẹn
    expect(screen.queryByText("SLA 72h")).not.toBeInTheDocument();
    expect(screen.queryByText("Tầng 0")).not.toBeInTheDocument();
    expect(screen.queryByText("34 Tỉnh")).not.toBeInTheDocument();
    expect(screen.queryByText("Bản ghi DN")).not.toBeInTheDocument();
    expect(screen.queryByText("TT17")).not.toBeInTheDocument();
    expect(screen.queryByText("Live")).not.toBeInTheDocument();
    expect(screen.queryByText("NDAChain")).not.toBeInTheDocument();
  });

  it("allows searching/filtering menu items dynamically", () => {
    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    const searchInput = screen.getByPlaceholderText("Tìm nhanh tác vụ (RBAC, SLA, Tỉnh...)");

    // Search for "RBAC"
    fireEvent.change(searchInput, { target: { value: "RBAC" } });

    // Matching item visible
    expect(screen.getByText("Phân quyền (RBAC)")).toBeInTheDocument();

    // Non-matching items hidden
    expect(screen.queryByText("Nhật ký kiểm toán")).not.toBeInTheDocument();

    // Clear search
    const clearButton = screen.getByTitle("Xóa tìm kiếm");
    fireEvent.click(clearButton);

    expect(screen.getByText("Nhật ký kiểm toán")).toBeInTheDocument();
  });

  it("toggles all accordion groups with the master expand/collapse button", () => {
    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    const toggleAllBtn = screen.getByTitle("Thu gọn / Mở rộng tất cả");

    // Initially open, click to collapse all
    fireEvent.click(toggleAllBtn);
    expect(screen.queryByText("Tổng quan hệ thống")).not.toBeInTheDocument();

    // Click again to expand all
    fireEvent.click(toggleAllBtn);
    expect(screen.getByText("Tổng quan hệ thống")).toBeInTheDocument();
  });

  it("activates only 'Quản lý người dùng' when pathname is /admin/users and does NOT activate 'Phân quyền (RBAC)'", () => {
    mockPathname = "/admin/users";
    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    const usersLink = screen.getByRole("link", { name: /Quản lý người dùng/i });
    const rolesLink = screen.getByRole("link", { name: /Phân quyền \(RBAC\)/i });

    expect(usersLink.className).toContain("bg-brand-700");
    expect(rolesLink.className).not.toContain("bg-brand-700");
  });
});

describe("CR-2026-029 [Wave 2] AdminLayout Route Loading & SearchParams Sync", () => {
  it("renders AdminLoading route boundary with admin-route-skeleton", () => {
    render(<AdminLoading />);
    const skeleton = screen.getByTestId("admin-route-skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-busy", "true");
  });

  it("synchronizes active item for /admin/approvals, ?tab=sla, and ?tab=override via useSearchParams()", () => {
    mockPathname = "/admin/approvals";
    mockSearch = "";

    const { rerender } = render(
      <AdminLayout>
        <div>Approvals Content</div>
      </AdminLayout>
    );

    const queueLink = screen.getByRole("link", { name: /Hàng đợi phê duyệt/i });
    const slaLink = screen.getByRole("link", { name: /Cảnh báo quá hạn SLA/i });
    const overrideLink = screen.getByRole("link", { name: /Phê duyệt vượt cấp/i });

    expect(queueLink.className).toContain("bg-brand-700");
    expect(slaLink.className).not.toContain("bg-brand-700");
    expect(overrideLink.className).not.toContain("bg-brand-700");

    mockSearch = "tab=sla";
    rerender(
      <AdminLayout>
        <div>SLA Content</div>
      </AdminLayout>
    );

    expect(slaLink.className).toContain("bg-brand-700");
    expect(queueLink.className).not.toContain("bg-brand-700");
    expect(overrideLink.className).not.toContain("bg-brand-700");

    mockSearch = "tab=override";
    rerender(
      <AdminLayout>
        <div>Override Content</div>
      </AdminLayout>
    );

    expect(overrideLink.className).toContain("bg-brand-700");
    expect(queueLink.className).not.toContain("bg-brand-700");
    expect(slaLink.className).not.toContain("bg-brand-700");
  });

  it("shows admin-route-skeleton and optimistic active item immediately on navigating to another route/tab, then clears when route updates", () => {
    mockPathname = "/admin";
    mockSearch = "";

    const { rerender } = render(
      <AdminLayout>
        <div>Admin Home Content</div>
      </AdminLayout>
    );

    expect(screen.getByText("Admin Home Content")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-route-skeleton")).toBeNull();

    const usersLink = screen.getByRole("link", { name: /Quản lý người dùng/i });
    const homeLink = screen.getByRole("link", { name: /Tổng quan hệ thống/i });

    fireEvent.click(usersLink);

    expect(screen.getByTestId("admin-route-skeleton")).toBeInTheDocument();
    expect(screen.queryByText("Admin Home Content")).not.toBeInTheDocument();
    expect(usersLink.className).toContain("bg-brand-700");
    expect(homeLink.className).not.toContain("bg-brand-700");

    // Route resolves
    mockPathname = "/admin/users";
    rerender(
      <AdminLayout>
        <div>Users Console Content</div>
      </AdminLayout>
    );

    expect(screen.queryByTestId("admin-route-skeleton")).toBeNull();
    expect(screen.getByText("Users Console Content")).toBeInTheDocument();
    expect(usersLink.className).toContain("bg-brand-700");
  });

  it("shows skeleton when switching between /admin/approvals and ?tab=sla and clears when searchParams changes", () => {
    mockPathname = "/admin/approvals";
    mockSearch = "";

    const { rerender } = render(
      <AdminLayout>
        <div>All Approvals</div>
      </AdminLayout>
    );

    const slaLink = screen.getByRole("link", { name: /Cảnh báo quá hạn SLA/i });
    fireEvent.click(slaLink);

    expect(screen.getByTestId("admin-route-skeleton")).toBeInTheDocument();
    expect(slaLink.className).toContain("bg-brand-700");

    mockSearch = "tab=sla";
    rerender(
      <AdminLayout>
        <div>SLA Approvals</div>
      </AdminLayout>
    );

    expect(screen.queryByTestId("admin-route-skeleton")).toBeNull();
    expect(screen.getByText("SLA Approvals")).toBeInTheDocument();
  });

  it("does NOT show skeleton when clicking the exact current route/tab or holding modifier keys (ctrlKey/metaKey)", () => {
    mockPathname = "/admin/approvals";
    mockSearch = "tab=sla";

    render(
      <AdminLayout>
        <div>SLA Approvals</div>
      </AdminLayout>
    );

    const slaLink = screen.getByRole("link", { name: /Cảnh báo quá hạn SLA/i });
    const usersLink = screen.getByRole("link", { name: /Quản lý người dùng/i });

    // Same route+tab
    fireEvent.click(slaLink);
    expect(screen.queryByTestId("admin-route-skeleton")).toBeNull();
    expect(screen.getByText("SLA Approvals")).toBeInTheDocument();

    // Ctrl+click / Meta+click
    fireEvent.click(usersLink, { ctrlKey: true });
    fireEvent.click(usersLink, { metaKey: true });
    expect(screen.queryByTestId("admin-route-skeleton")).toBeNull();
    expect(screen.getByText("SLA Approvals")).toBeInTheDocument();
  });

  it("auto-clears pending skeleton after 12s fail-safe timeout if navigation never completes", () => {
    vi.useFakeTimers();
    mockPathname = "/admin";
    mockSearch = "";

    render(
      <AdminLayout>
        <div>Admin Home Content</div>
      </AdminLayout>
    );

    fireEvent.click(screen.getByRole("link", { name: /Cấu hình hệ thống/i }));
    expect(screen.getByTestId("admin-route-skeleton")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(12000);
    });

    expect(screen.queryByTestId("admin-route-skeleton")).toBeNull();
    expect(screen.getByText("Admin Home Content")).toBeInTheDocument();
  });

  it("does NOT render admin-route-skeleton or admin shell when RoleGuard denies access", () => {
    mockRoleGuardBlocked = true;

    render(
      <AdminLayout>
        <div>Secret Admin Content</div>
      </AdminLayout>
    );

    expect(screen.getByTestId("role-guard-denied")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-route-skeleton")).toBeNull();
    expect(screen.queryByText("Trung Tâm Quản Trị Hệ Thống")).toBeNull();
    expect(screen.queryByText("Secret Admin Content")).toBeNull();
  });

  it("cancels pending skeleton and restores active highlight on Ping-Pong A -> B -> A click before B commits", () => {
    mockPathname = "/admin";
    mockSearch = "";

    render(
      <AdminLayout>
        <div>Admin Home Content</div>
      </AdminLayout>
    );

    const homeLink = screen.getByRole("link", { name: /Tổng quan hệ thống/i });
    const usersLink = screen.getByRole("link", { name: /Quản lý người dùng/i });

    expect(homeLink.className).toContain("bg-brand-700");

    // Click B while still on A
    fireEvent.click(usersLink);
    expect(screen.getByTestId("admin-route-skeleton")).toBeInTheDocument();
    expect(screen.queryByText("Admin Home Content")).not.toBeInTheDocument();
    expect(usersLink.className).toContain("bg-brand-700");
    expect(homeLink.className).not.toContain("bg-brand-700");

    // Click back to A before B commits
    fireEvent.click(homeLink);
    expect(screen.queryByTestId("admin-route-skeleton")).toBeNull();
    expect(screen.getByText("Admin Home Content")).toBeInTheDocument();
    expect(homeLink.className).toContain("bg-brand-700");
    expect(usersLink.className).not.toContain("bg-brand-700");
  });

  it("handles same-frame (<16ms) Ping-Pong A -> B -> A inside a single act() without leaving skeleton stuck", () => {
    mockPathname = "/admin";
    mockSearch = "";

    render(
      <AdminLayout>
        <div>Admin Home Content</div>
      </AdminLayout>
    );

    const homeLink = screen.getByRole("link", { name: /Tổng quan hệ thống/i });
    const usersLink = screen.getByRole("link", { name: /Quản lý người dùng/i });

    act(() => {
      fireEvent.click(usersLink);
      fireEvent.click(homeLink);
    });

    expect(screen.queryByTestId("admin-route-skeleton")).toBeNull();
    expect(screen.getByText("Admin Home Content")).toBeInTheDocument();
    expect(homeLink.className).toContain("bg-brand-700");
    expect(usersLink.className).not.toContain("bg-brand-700");
  });
});
