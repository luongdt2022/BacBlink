import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UserGuidePage from "./page";

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

describe("UserGuidePage", () => {
  beforeEach(() => {
    push.mockReset();
    window.location.hash = "";
  });

  afterEach(cleanup);

  it("renders page title and role navigation buttons", () => {
    render(<UserGuidePage />);

    expect(
      screen.getByText("Cẩm Nang Hướng Dẫn Sử Dụng Chi Tiết Cổng Thông Tin BACLINK")
    ).toBeInTheDocument();
    expect(screen.getAllByText(/11 Phân Hệ/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/3 Cấp Phân Quyền/i)).toBeInTheDocument();

    // Role buttons
    expect(
      screen.getByRole("button", { name: `Tất cả (${61})` })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Bên mua công nghệ/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Bên chào bán/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Chuyên gia KH&CN/i })
    ).toBeInTheDocument();
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

    const buyerBtn = screen.getByRole("button", { name: /Bên mua công nghệ/i });
    fireEvent.click(buyerBtn);

    expect(buyerBtn).toHaveClass("bg-brand-700");
  });

  it("filters and displays newly added expert screens when EXPERT role is selected", () => {
    render(<UserGuidePage />);

    const expertBtn = screen.getByRole("button", { name: /Chuyên gia KH&CN/i });
    fireEvent.click(expertBtn);

    expect(expertBtn).toHaveClass("bg-brand-700");
    expect(screen.getByText(/Vai trò: Chuyên gia KH&CN/i)).toBeInTheDocument();
    expect(
      screen.getByText("Sổ Tay Quản Lý Lịch Hẹn & Phiếu Yêu Cầu Tư Vấn 1-1 Doanh Nghiệp")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Quản Lý Đề Tài KH&CN & Dự Án Tư Vấn Chuyển Giao Công Nghệ")
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
      screen.getByText("Sổ Tay Quản Lý Lịch Hẹn & Phiếu Yêu Cầu Tư Vấn 1-1 Doanh Nghiệp")
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

  it("filters technology assessment screens and request forms when special filters are clicked", () => {
    render(<UserGuidePage />);

    const assessFilterBtn = screen.getByRole("button", { name: /Đánh Giá Công Nghệ/i });
    fireEvent.click(assessFilterBtn);

    expect(
      screen.getByText("Trung Tâm Đánh Giá Trình Độ & Năng Lực Công Nghệ Theo TT17/2019/TT-BKHCN")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Wizard Kê Khai 26 Tiêu Chí Đánh Giá Trình Độ Công Nghệ 5 Nhóm T-E-O-R-I")
    ).toBeInTheDocument();

    const requestFormsBtn = screen.getByRole("button", { name: /Phiếu Yêu Cầu/i });
    fireEvent.click(requestFormsBtn);

    expect(
      screen.getByText(/Phiếu Khảo Sát Sâu Nhu Cầu Đổi Mới Công Nghệ DNNVV/i)
    ).toBeInTheDocument();
  });
});
