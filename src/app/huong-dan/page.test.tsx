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
      screen.getByText("Cẩm Nang Hướng Dẫn Sử Dụng Chi Tiết Hệ Thống NacenTwin")
    ).toBeInTheDocument();
    expect(screen.getByText("11 Phân Hệ · 48 Màn Hình")).toBeInTheDocument();
    expect(screen.getByText("7 Vai Trò Tác Nhân")).toBeInTheDocument();

    // Role buttons
    expect(screen.getByRole("button", { name: "Tất cả (48)" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Bên mua công nghệ (6)" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Bên chào bán (8)" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Chuyên gia KH&CN (7)" })
    ).toBeInTheDocument();
  });

  it("renders action buttons including PDF download link and Zen mode toggle", () => {
    render(<UserGuidePage />);

    const pdfLink = screen.getByRole("link", { name: /Tải PDF/i });
    expect(pdfLink).toHaveAttribute("href", "/huong-dan-su-dung.pdf");
    expect(pdfLink).toHaveAttribute("download", "Huong_Dan_Su_Dung_NacenTwin.pdf");

    const zenButton = screen.getByRole("button", { name: /Tràn viền/i });
    expect(zenButton).toBeInTheDocument();

    fireEvent.click(zenButton);
    expect(screen.getByRole("button", { name: /Thu nhỏ/i })).toBeInTheDocument();
  });

  it("renders the interactive guide iframe", () => {
    render(<UserGuidePage />);

    const iframe = screen.getByTitle("Hướng Dẫn Sử Dụng Chi Tiết Hệ Thống NacenTwin");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "/huong-dan-su-dung.html");
  });

  it("changes role filter and updates URL hash", () => {
    render(<UserGuidePage />);

    const buyerBtn = screen.getByRole("button", { name: "Bên mua công nghệ (6)" });
    fireEvent.click(buyerBtn);

    expect(buyerBtn).toHaveClass("bg-brand-700");
  });
});
