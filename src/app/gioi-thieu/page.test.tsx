import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import GioiThieuPage from "./page";

describe("GioiThieuPage (Giới Thiệu BACLINK)", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders main hero title, legal decision and executive leadership info", () => {
    render(<GioiThieuPage />);

    expect(
      screen.getByText(/BACLINK — Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Quyết định số 1652\/QĐ-UBND ngày 16\/06\/2025/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Bà Trần Thị Thu Trang/i)).toBeInTheDocument();
    expect(screen.getByText(/Số 7 Lý Thái Tổ, Phường Suối Hoa/i)).toBeInTheDocument();
    expect(screen.getByText(/Khám Phá Sàn Cung Ứng/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Ban Cố Vấn Kỹ Thuật/i).length).toBeGreaterThan(0);
  });
});
