import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import GioiThieuPage from "./page";

describe("GioiThieuPage (Giới Thiệu NacenTwin)", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders main hero title and navigation links", () => {
    render(<GioiThieuPage />);

    expect(
      screen.getByText(/NacenTwin — Cầu Nối Số Hóa Hệ Sinh Thái Đổi Mới Sáng Tạo Quốc Gia/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Khám Phá Sàn Công Nghệ/i)).toBeInTheDocument();
    expect(screen.getByText(/Mạng Lưới Chuyên Gia/i)).toBeInTheDocument();
    expect(screen.getByText(/Tìm Hiểu Dịch Vụ SHTT/i)).toBeInTheDocument();
  });
});
