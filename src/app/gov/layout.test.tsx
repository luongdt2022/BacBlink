import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GovLayout from "./layout";
import { authClient } from "@/lib/auth-client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/gov",
  useSearchParams: () => new URLSearchParams(),
}));

describe("GovLayout & GovSidebarNav Minimalist UI/UX", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
    authClient.setSession("test-token", {
      id: "u1",
      email: "leader@hanoi.gov.vn",
      fullName: "Nguyễn Văn Lãnh Đạo",
      role: "PROVINCIAL_ADMIN",
      scopeId: "HN",
      organizationName: "Sở KH&CN Hà Nội",
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders header with province, level 1 badge, and clean header without slogan chips", () => {
    render(
      <GovLayout>
        <div>Content</div>
      </GovLayout>
    );

    expect(screen.getAllByText("Tầng 1: Quản Trị Nhà Nước")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Sở KH&CN Hà Nội")[0]).toBeInTheDocument();
    expect(screen.getAllByText("HN")[0]).toBeInTheDocument();
    // Khẩu hiệu đã được gỡ bỏ theo yêu cầu tối giản
    expect(screen.queryByText(/SLA ≤ 48h/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Maker-Checker 2 Cấp")).not.toBeInTheDocument();
  });

  it("renders all 4 menu groups and minimalist 7 items without right-side badges", () => {
    render(
      <GovLayout>
        <div>Content</div>
      </GovLayout>
    );

    // Group titles
    expect(screen.getByText("1. Tổng Quan & Phê Duyệt")).toBeInTheDocument();
    expect(screen.getByText("2. Thẩm Định Công Nghệ TT17")).toBeInTheDocument();
    expect(screen.getByText("3. Giám Sát Cung–Cầu & Địa Bàn")).toBeInTheDocument();
    expect(screen.getByText("4. Quản Trị Công Vụ & Nhân Sự")).toBeInTheDocument();

    // 7 menu items
    expect(screen.getByText("Tổng quan địa bàn")).toBeInTheDocument();
    expect(screen.getByText("Hàng đợi kiểm duyệt")).toBeInTheDocument();
    expect(screen.getByText("Thẩm định DN ĐMST")).toBeInTheDocument();
    expect(screen.getByText("Hội đồng Chấm điểm TT17")).toBeInTheDocument();
    expect(screen.getByText("Tiến trình Đàm phán & SLA")).toBeInTheDocument();
    expect(screen.getByText("Bài toán Nhu cầu DNNVV")).toBeInTheDocument();
    expect(screen.getByText("Phân công Cán bộ & Chuyên viên")).toBeInTheDocument();

    // Badges bên phải đã được gỡ bỏ hoàn toàn
    expect(screen.queryByText("Hàng đợi")).not.toBeInTheDocument();
    expect(screen.queryByText("EXP")).not.toBeInTheDocument();
    expect(screen.queryByText("TRL")).not.toBeInTheDocument();
    expect(screen.queryByText("26 Tiêu chí")).not.toBeInTheDocument();
  });

  it("filters menu items accurately when searching", () => {
    render(
      <GovLayout>
        <div>Content</div>
      </GovLayout>
    );

    const searchInput = screen.getByPlaceholderText(/Tìm nhanh tác vụ/i);
    fireEvent.change(searchInput, { target: { value: "TT17" } });

    // Should still show TT17 item
    expect(screen.getByText("Hội đồng Chấm điểm TT17")).toBeInTheDocument();
    // Should NOT show unrelated items
    expect(screen.queryByText("Phân công Cán bộ & Chuyên viên")).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: "" } });
    expect(screen.getByText("Phân công Cán bộ & Chuyên viên")).toBeInTheDocument();
  });

  it("toggles group accordions when clicking header or toggle all", () => {
    render(
      <GovLayout>
        <div>Content</div>
      </GovLayout>
    );

    // Collapse group 1
    const group1Btn = screen.getByText("1. Tổng Quan & Phê Duyệt");
    fireEvent.click(group1Btn);

    // Group 1 items should be hidden
    expect(screen.queryByText("Tổng quan địa bàn")).not.toBeInTheDocument();

    // Re-open
    fireEvent.click(group1Btn);
    expect(screen.getByText("Tổng quan địa bàn")).toBeInTheDocument();

    // Toggle all
    const toggleAllBtn = screen.getByTitle("Thu gọn / Mở rộng tất cả");
    fireEvent.click(toggleAllBtn); // collapses all
    expect(screen.queryByText("Tổng quan địa bàn")).not.toBeInTheDocument();
    expect(screen.queryByText("Hội đồng Chấm điểm TT17")).not.toBeInTheDocument();
  });

  it("displays user info, role display name, security level and portal return button in footer", () => {
    render(
      <GovLayout>
        <div>Content</div>
      </GovLayout>
    );

    expect(screen.getByText("Nguyễn Văn Lãnh Đạo")).toBeInTheDocument();
    expect(screen.getByText("Lãnh đạo Sở (Admin)")).toBeInTheDocument();
    expect(screen.getByText("An Toàn TT: Cấp 3")).toBeInTheDocument();
    expect(screen.getByText("NĐ 85/2016")).toBeInTheDocument();
    expect(screen.getByText("Về Cổng Khám Phá Quốc Gia")).toBeInTheDocument();
  });

  it("pins desktop sidebar with sticky top-[68px] and viewport-calculated height to prevent disappearing on scroll", () => {
    const { container } = render(
      <GovLayout>
        <div style={{ height: "2000px" }}>Long Content Area</div>
      </GovLayout>
    );

    const desktopWrapper = container.querySelector(".lg\\:sticky");
    expect(desktopWrapper).toBeInTheDocument();
    expect(desktopWrapper).toHaveClass("lg:sticky", "lg:top-[68px]", "lg:self-start", "lg:h-[calc(100vh-68px)]");

    const aside = desktopWrapper?.querySelector("aside");
    expect(aside).toBeInTheDocument();
    expect(aside).toHaveClass("h-full");
  });
});
