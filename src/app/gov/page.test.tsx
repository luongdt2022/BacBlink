import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GovExecutiveDashboard from "./page";
import { authClient } from "@/lib/auth-client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/gov",
  useSearchParams: () => new URLSearchParams(),
}));

describe("T082 [FE-Gov-Screen1] GovExecutiveDashboard 360° Verification", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    authClient.setSession("test-token", {
      id: "gov-leader-01",
      email: "lanhdao@hanoi.gov.vn",
      fullName: "Trần Văn Lãnh Đạo",
      role: "PROVINCIAL_ADMIN",
      scopeId: "HN",
      organizationName: "Sở KH&CN Hà Nội",
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders header with executive title, breadcrumbs, province badge and action buttons without slogan chips", () => {
    render(<GovExecutiveDashboard />);

    expect(screen.getByText("Trung Tâm Điều Hành & Giám Sát KH&CN Hà Nội")).toBeInTheDocument();
    expect(screen.getByTestId("gov-scope-badge")).toHaveTextContent("Hà Nội (HN)");
    expect(screen.getByText("Làm Mới")).toBeInTheDocument();
    expect(screen.getByText("Vào Hàng Đợi Kiểm Duyệt")).toBeInTheDocument();

    // Slogan chips are hidden in the executive dashboard
    expect(screen.queryByTestId("gov-sla-chip")).not.toBeInTheDocument();
    expect(screen.queryByTestId("gov-maker-checker-chip")).not.toBeInTheDocument();
  });

  it("renders 4 executive KPI cards covering core provincial indicators", () => {
    render(<GovExecutiveDashboard />);

    // KPI 1: Hồ sơ chờ phê duyệt
    expect(screen.getByText("Hồ Sơ Chờ Phê Duyệt")).toBeInTheDocument();
    expect(screen.getByText("việc cần xử lý")).toBeInTheDocument();

    // KPI 2: Công nghệ & Sáng chế
    expect(screen.getByText("Công Nghệ & Sáng Chế")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument();
    expect(screen.getByText("TRL 6.8 / 9")).toBeInTheDocument();

    // KPI 3: Nhu cầu đặt hàng & Deal
    expect(screen.getByText("Nhu Cầu Đặt Hàng & Deal")).toBeInTheDocument();
    expect(screen.getByText("28")).toBeInTheDocument();
    expect(screen.getByText("14 đang kết nối")).toBeInTheDocument();

    // KPI 4: DN ĐMST & TT17
    expect(screen.getByText("DN ĐMST & TT17")).toBeInTheDocument();
    expect(screen.getByText("64")).toBeInTheDocument();
    expect(screen.getByText("19 Hội đồng TT17")).toBeInTheDocument();
  });

  it("renders priority work queue with standardized record codes and filter chips", () => {
    render(<GovExecutiveDashboard />);

    // Header
    expect(screen.getByText("Công Việc Cần Xử Lý Ngay (Hàng Đợi Ưu Tiên)")).toBeInTheDocument();

    // Sample records present with formatted codes
    expect(screen.getByText("CB-HN-C25347")).toBeInTheDocument();
    expect(screen.getByText("CG-HN-A109F2")).toBeInTheDocument();
    expect(screen.getByText("NC-HN-88E29E")).toBeInTheDocument();
    expect(screen.getByText("DN-HN-825CDC")).toBeInTheDocument();

    // Filter chips
    const filterAllBtn = screen.getByRole("button", { name: /Tất cả \(/i });
    const filterExpBtn = screen.getByRole("button", { name: /Chuyên gia \(/i });
    expect(filterAllBtn).toBeInTheDocument();
    expect(filterExpBtn).toBeInTheDocument();

    // Filter by Expert
    fireEvent.click(filterExpBtn);
    expect(screen.getByText("CG-HN-A109F2")).toBeInTheDocument();
    expect(screen.queryByText("NC-HN-88E29E")).not.toBeInTheDocument();

    // Filter back to All
    fireEvent.click(filterAllBtn);
    expect(screen.getByText("NC-HN-88E29E")).toBeInTheDocument();
  });

  it("copies standardized record code when clicking copy button", () => {
    render(<GovExecutiveDashboard />);

    const copyButtons = screen.getAllByTitle("Sao chép mã hồ sơ");
    expect(copyButtons.length).toBeGreaterThan(0);

    fireEvent.click(copyButtons[0]);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("CB-HN-C25347");
  });

  it("renders 18 TT17 key sectors distribution bars and 4 administrative shortcut cards", () => {
    render(<GovExecutiveDashboard />);

    // TT17 Sectors
    expect(screen.getByText("Cơ Cấu Lĩnh Vực Công Nghệ Trọng Điểm Địa Bàn")).toBeInTheDocument();
    expect(screen.getByText("Công nghệ thông tin & Viễn thông")).toBeInTheDocument();
    expect(screen.getByText("Cơ khí chế tạo & Tự động hóa")).toBeInTheDocument();

    // 4 Shortcuts
    expect(screen.getByText("Lối Tắt Nghiệp Vụ Điều Hành")).toBeInTheDocument();
    expect(screen.getByText("Hàng Đợi Kiểm Duyệt")).toBeInTheDocument();
    expect(screen.getByText("Thẩm Định Doanh Nghiệp ĐMST")).toBeInTheDocument();
    expect(screen.getByText("Hội Đồng Đánh Giá TT17")).toBeInTheDocument();
    expect(screen.getByText("Phân Công Cán Bộ Thẩm Tra")).toBeInTheDocument();
  });
});
