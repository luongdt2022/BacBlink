import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GovLayout from "./layout";
import GovLoading from "./loading";
import { authClient } from "@/lib/auth-client";

let mockGovPathname = "/gov";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => mockGovPathname,
  useSearchParams: () => new URLSearchParams(),
}));

describe("GovLayout & GovSidebarNav Minimalist UI/UX", () => {
  beforeEach(() => {
    cleanup();
    mockGovPathname = "/gov";
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

  it("renders synced 3 menu groups with DMST and TT17 together under Group 1 without right-side badges", () => {
    render(
      <GovLayout>
        <div>Content</div>
      </GovLayout>
    );

    // 3 synced group titles
    expect(screen.getByText("1. Tổng Quan & Phê Duyệt")).toBeInTheDocument();
    expect(screen.getByText("2. Giám Sát Cung–Cầu & Địa Bàn")).toBeInTheDocument();
    expect(screen.getByText("3. Quản Trị Công Vụ & Nhân Sự")).toBeInTheDocument();
    expect(screen.queryByText("2. Thẩm Định Công Nghệ TT17")).not.toBeInTheDocument();
    expect(screen.queryByText("4. Quản Trị Công Vụ & Nhân Sự")).not.toBeInTheDocument();

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

    // Collapse group 1: both DMST and TT17 are inside Group 1 so both collapse together
    const group1Btn = screen.getByText("1. Tổng Quan & Phê Duyệt");
    fireEvent.click(group1Btn);

    // Group 1 items should be hidden
    expect(screen.queryByText("Tổng quan địa bàn")).not.toBeInTheDocument();
    expect(screen.queryByText("Thẩm định DN ĐMST")).not.toBeInTheDocument();
    expect(screen.queryByText("Hội đồng Chấm điểm TT17")).not.toBeInTheDocument();

    // Re-open
    fireEvent.click(group1Btn);
    expect(screen.getByText("Tổng quan địa bàn")).toBeInTheDocument();
    expect(screen.getByText("Thẩm định DN ĐMST")).toBeInTheDocument();
    expect(screen.getByText("Hội đồng Chấm điểm TT17")).toBeInTheDocument();

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

  it("shows gov-route-skeleton immediately on sidebar click and clears when pathname changes", () => {
    const { rerender } = render(
      <GovLayout>
        <div data-testid="gov-real-content">Gov Content</div>
      </GovLayout>
    );

    expect(screen.getByTestId("gov-real-content")).toBeInTheDocument();
    expect(screen.queryByTestId("gov-route-skeleton")).not.toBeInTheDocument();

    // Same route click does not trigger skeleton
    fireEvent.click(screen.getByRole("link", { name: /Tổng quan địa bàn/i }));
    expect(screen.queryByTestId("gov-route-skeleton")).not.toBeInTheDocument();

    // Ctrl+click ignores pending skeleton
    const tt17Link = screen.getByRole("link", { name: /Hội đồng Chấm điểm TT17/i });
    fireEvent.click(tt17Link, { ctrlKey: true });
    expect(screen.queryByTestId("gov-route-skeleton")).not.toBeInTheDocument();

    // Normal click shows skeleton and highlights TT17 link
    fireEvent.click(tt17Link);
    expect(screen.getByTestId("gov-route-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("gov-real-content")).not.toBeInTheDocument();
    expect(tt17Link.className).toContain("bg-brand-700");

    // Pathname settles -> skeleton clears
    mockGovPathname = "/gov/assessments/tt17";
    rerender(
      <GovLayout>
        <div data-testid="gov-real-content">TT17 Loaded</div>
      </GovLayout>
    );
    expect(screen.queryByTestId("gov-route-skeleton")).not.toBeInTheDocument();
    expect(screen.getByText("TT17 Loaded")).toBeInTheDocument();
  });

  it("renders GovLoading route boundary with gov-route-skeleton", () => {
    render(<GovLoading />);
    expect(screen.getByTestId("gov-route-skeleton")).toHaveAttribute("aria-busy", "true");
  });
});
