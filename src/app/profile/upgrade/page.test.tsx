import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProfileUpgradeHubPage from "./page";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe("ProfileUpgradeHubPage (AC-DELTA-12..16)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders all 4 upgrade route cards and comparison matrix (AC-DELTA-12)", () => {
    render(<ProfileUpgradeHubPage />);

    expect(screen.getByText(/Lựa Chọn Lộ Trình Nâng Hạng Tài Khoản/i)).toBeInTheDocument();

    // 4 Cards presence
    expect(screen.getByRole("heading", { name: "Chuyên Gia KH&CN" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Doanh Nghiệp ĐMST" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bên Mua (Buyer)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bên Bán (Seller)" })).toBeInTheDocument();

    // Matrix
    expect(screen.getByText(/Bảng So Sánh Quyền Hạn & Điều Kiện 4 Lộ Trình/i)).toBeInTheDocument();
  });

  it("routes Expert to /profile/upgrade/expert and Buyer to /khao-sat-nhu-cau (AC-DELTA-13)", () => {
    render(<ProfileUpgradeHubPage />);

    const expertLink = screen.getByRole("link", { name: /Nâng hạng Chuyên gia \(3 Bước\)/i });
    expect(expertLink).toHaveAttribute("href", "/profile/upgrade/expert");

    const buyerLink = screen.getByRole("link", { name: /Khảo Sát Nhu Cầu & Bài Toán \(7 Bước\)/i });
    expect(buyerLink).toHaveAttribute("href", "/khao-sat-nhu-cau");
  });

  it("opens Enterprise modal, looks up tax code and submits verification (AC-DELTA-14)", async () => {
    render(<ProfileUpgradeHubPage />);

    // Click open enterprise modal
    const openBtn = screen.getByRole("button", { name: /Xác thực MST Doanh Nghiệp/i });
    fireEvent.click(openBtn);

    expect(screen.getByText("Nâng Cấp Hồ Sơ — Doanh Nghiệp ĐMST")).toBeInTheDocument();

    // Fill MST
    const mstInput = screen.getByPlaceholderText("0101234567");
    fireEvent.change(mstInput, { target: { value: "0109998888" } });

    // Click Tra cuu MST
    const lookupBtn = screen.getByRole("button", { name: /Tra Cứu MST/i });
    fireEvent.click(lookupBtn);

    await waitFor(() => {
      expect(screen.getByText(/✓ Đã tìm thấy dữ liệu doanh nghiệp hợp lệ/i)).toBeInTheDocument();
    });

    // Check legal pledge and submit
    const pledgeCheckbox = screen.getByRole("checkbox");
    fireEvent.click(pledgeCheckbox);

    const submitBtn = screen.getByRole("button", { name: /Gửi Hồ Sơ Thẩm Định/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Nộp Hồ Sơ Doanh Nghiệp ĐMST Thành Công/i)).toBeInTheDocument();
    });
  });

  it("opens Seller modal and submits shop registration with SLA 24h (AC-DELTA-15)", async () => {
    render(<ProfileUpgradeHubPage />);

    // Click open seller modal
    const openBtn = screen.getByRole("button", { name: /Đăng Ký Gian Hàng Seller/i });
    fireEvent.click(openBtn);

    expect(screen.getByText("Đăng Ký Mở Gian Hàng — Bên Bán (Seller)")).toBeInTheDocument();

    // Fill seller form
    const orgInput = screen.getByPlaceholderText("Viện Nghiên cứu & Phát triển Công nghệ Nano");
    fireEvent.change(orgInput, { target: { value: "Trung tâm R&D Robotics Việt Nam" } });

    const descInput = screen.getByPlaceholderText(/Tóm tắt các sáng chế/i);
    fireEvent.change(descInput, { target: { value: "Sản phẩm robot tự hành TRL 7" } });

    const pledgeCheckbox = screen.getByRole("checkbox");
    fireEvent.click(pledgeCheckbox);

    const submitBtn = screen.getByRole("button", { name: /Nộp Đơn Đăng Ký/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Đăng Ký Mở Gian Hàng Seller Thành Công/i)).toBeInTheDocument();
    });
  });
});
