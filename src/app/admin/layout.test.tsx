import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import AdminLayout from "./layout";

afterEach(() => {
  cleanup();
});

// Mock Next.js navigation
let mockPathname = "/admin";
let mockSearch = "";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

// Mock role guard to render children directly
vi.mock("@/components/auth/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("T070 [UI/UX] Admin Menu Navigation & Layout Refinement", () => {
  it("renders 4 Accordion groups, header Tầng 0 and enterprise security badge", () => {
    mockPathname = "/admin";
    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    // Header
    expect(screen.getByText("Tầng 0: Quản Trị Tối Cao")).toBeInTheDocument();
    expect(screen.getByText("Trung Tâm Quản Trị Hệ Thống")).toBeInTheDocument();
    expect(screen.getByText("Phân hệ quản trị 34 tỉnh/thành trọng điểm")).toBeInTheDocument();

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
    expect(screen.getByRole("link", { name: /Tổng quan Dashboard 360°/i })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: /Danh sách Phiếu Thu thập & Đánh giá DN/i })).toHaveAttribute("href", "/admin/assessments/records");
    expect(screen.getByRole("link", { name: /Tất cả Hàng đợi Phê duyệt/i })).toHaveAttribute("href", "/admin/approvals");
    expect(screen.getByRole("link", { name: /Cảnh báo Quá hạn SLA Sở Tỉnh/i })).toHaveAttribute("href", "/admin/approvals?tab=sla");
    expect(screen.getByRole("link", { name: /Phê duyệt Vượt cấp \/ Can thiệp/i })).toHaveAttribute("href", "/admin/approvals?tab=override");
    expect(screen.getByRole("link", { name: /Quản lý 10 Vai trò \(RBAC\)/i })).toHaveAttribute("href", "/admin/roles");
    expect(screen.getByRole("link", { name: /Cây Thư mục 34 Tỉnh\/Thành/i })).toHaveAttribute("href", "/admin/org-tree");
    expect(screen.getByRole("link", { name: /Danh mục 10 Lĩnh Vực TT17 & TRL/i })).toHaveAttribute("href", "/admin/sectors");
    expect(screen.getByRole("link", { name: /Nhật ký Kiểm toán Toàn quốc/i })).toHaveAttribute("href", "/admin/audit-logs");
    expect(screen.getByRole("link", { name: /Cấu hình Tham số & SLA Hệ thống/i })).toHaveAttribute("href", "/admin/system-config");
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
    expect(screen.getByText("Quản lý 10 Vai trò (RBAC)")).toBeInTheDocument();

    // Non-matching items hidden
    expect(screen.queryByText("Nhật ký Kiểm toán Toàn quốc (Audit Logs)")).not.toBeInTheDocument();

    // Clear search
    const clearButton = screen.getByTitle("Xóa tìm kiếm");
    fireEvent.click(clearButton);

    expect(screen.getByText("Nhật ký Kiểm toán Toàn quốc (Audit Logs)")).toBeInTheDocument();
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
    expect(screen.queryByText("Tổng quan Dashboard 360° & BI Toàn quốc")).not.toBeInTheDocument();

    // Click again to expand all
    fireEvent.click(toggleAllBtn);
    expect(screen.getByText("Tổng quan Dashboard 360° & BI Toàn quốc")).toBeInTheDocument();
  });
});
