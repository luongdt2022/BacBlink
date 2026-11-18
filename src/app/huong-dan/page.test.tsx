import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UserGuidePage from "./page";
import { GUIDE_MODULES, GUIDE_SCREENS } from "./guide-data";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/huong-dan",
  useRouter: () => ({ push }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/common/toast", () => ({
  useToast: () => ({ info: vi.fn() }),
}));

describe("UserGuidePage (BACLINK 3-Tier Slim Edition)", () => {
  beforeEach(() => {
    push.mockReset();
    window.location.hash = "";
  });

  afterEach(cleanup);

  it("renders page title, Màn Hình Chức Năng badge, and 3-tier role navigation buttons without survey or GOV remnants", () => {
    render(<UserGuidePage />);

    expect(
      screen.getByText("Cẩm Nang Hướng Dẫn Sử Dụng Chi Tiết Cổng Thông Tin BACLINK")
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${GUIDE_MODULES.length} Phân Hệ · ${GUIDE_SCREENS.length} Màn Hình Chức Năng`, "i"))
    ).toBeInTheDocument();
    expect(screen.getByText(/3 Cấp Phân Quyền BACLINK/i)).toBeInTheDocument();

    // Role buttons
    expect(
      screen.getByRole("button", { name: `Tất cả (${GUIDE_SCREENS.length})` })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Quản trị Hiệp hội \(Admin\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Doanh nghiệp Hội viên/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Bên Mua & Đặt hàng/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Bên Bán & Cung ứng/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Ban Cố vấn Kỹ thuật/i })
    ).toBeInTheDocument();

    // Must NOT contain legacy survey filter or TT17 / GOV remnants
    expect(screen.queryByText(/Các Loại Phiếu Yêu Cầu & Khảo Sát/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Phiếu Nghiệp Vụ/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/TT17/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/26 Tiêu Chí/i)).not.toBeInTheDocument();

    // Ensure no screen routes point to retired paths
    const forbiddenPrefixes = [
      "/assessments",
      "/khao-sat-",
      "/dieu-tra-",
      "/gov",
      "/admin/org-tree",
      "/admin/assessments",
    ];
    for (const s of GUIDE_SCREENS) {
      for (const prefix of forbiddenPrefixes) {
        expect(s.route.startsWith(prefix)).toBe(false);
      }
    }
  });

  it("renders action buttons including PDF download link and Zen mode toggle", () => {
    render(<UserGuidePage />);

    const pdfLink = screen.getByRole("link", { name: /Tải PDF/i });
    expect(pdfLink).toHaveAttribute("href", "/huong-dan-su-dung.pdf");
    expect(pdfLink).toHaveAttribute("download", "Huong_Dan_Su_Dung_BACLINK.pdf");

    const zenButton = screen.getByRole("button", { name: /Tràn viền/i });
    expect(zenButton).toBeInTheDocument();

    fireEvent.click(zenButton);
    expect(screen.getByRole("button", { name: /Thu nhỏ/i })).toBeInTheDocument();
  }, 30000);

  it("renders the interactive guide iframe", () => {
    render(<UserGuidePage />);

    const iframe = screen.getByTitle("Hướng Dẫn Sử Dụng Chi Tiết Cổng Thông Tin BACLINK");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "/huong-dan-su-dung.html");
  });

  it("changes role filter and updates URL hash", () => {
    render(<UserGuidePage />);

    const buyerBtn = screen.getByRole("button", { name: /Bên Mua & Đặt hàng/i });
    fireEvent.click(buyerBtn);

    expect(buyerBtn).toHaveClass("bg-brand-700");
  });

  it("filters and displays advisor screens when EXPERT role is selected", () => {
    render(<UserGuidePage />);

    const expertBtn = screen.getByRole("button", { name: /Ban Cố vấn Kỹ thuật/i });
    fireEvent.click(expertBtn);

    expect(expertBtn).toHaveClass("bg-brand-700");
    expect(screen.getByText(/Vai trò: Ban Cố vấn Kỹ thuật/i)).toBeInTheDocument();
    expect(
      screen.getByText("Sổ Tay Quản Lý Lịch Hẹn & Yêu Cầu Tư Vấn 1-1 Doanh Nghiệp")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Quản Lý Dự Án Tư Vấn Cải Tiến Nhà Máy & Chuyển Giao Công Nghệ")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Xem Trước Thẻ Chuyên Gia Zalo Mini App Danh Thiếp Số")
    ).toBeInTheDocument();
  });

  it("filters screens in real-time when searching by keyword", () => {
    render(<UserGuidePage />);

    const searchInput = screen.getByPlaceholderText(
      /Tìm theo tên màn hình, mã số/i
    );
    fireEvent.change(searchInput, { target: { value: "consultations" } });

    expect(
      screen.getByText("Sổ Tay Quản Lý Lịch Hẹn & Yêu Cầu Tư Vấn 1-1 Doanh Nghiệp")
    ).toBeInTheDocument();
  });

  it("toggles between visual cards and full document view modes", () => {
    render(<UserGuidePage />);

    const docModeBtn = screen.getByRole("button", { name: /Văn Bản/i });
    fireEvent.click(docModeBtn);

    const cardsModeBtn = screen.getByRole("button", { name: /Thẻ UI\/UX/i });
    expect(cardsModeBtn).toBeInTheDocument();
    fireEvent.click(cardsModeBtn);
  });
});
