import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import GioiThieuPage from "./page";
import { ORG } from "@/lib/constants/organization";

describe("GioiThieuPage (Giới Thiệu BACLINK)", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders main hero title, legal decision and executive leadership info", () => {
    render(<GioiThieuPage />);

    expect(
      screen.getByText(/BACLINK — Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(`Quyết định số ${ORG.decision.number}`)).length).toBeGreaterThan(0);
    expect(screen.getByText(/Bà Trần Thị Thu Trang/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(ORG.address))).toBeInTheDocument();
    expect(screen.getByText(/Khám Phá Sàn Cung Ứng/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Ban Cố Vấn Kỹ Thuật/i).length).toBeGreaterThan(0);
  });

  it("renders 3 strategic pillars without TT17 capacity assessment", () => {
    render(<GioiThieuPage />);

    expect(screen.getByText(/3 Trụ Cột Phát Triển BACLINK/i)).toBeInTheDocument();
    expect(screen.getByText("Danh Bạ Hội Viên KCN")).toBeInTheDocument();
    expect(screen.getByText("Radar AI Ghép Nối B2B")).toBeInTheDocument();
    expect(screen.getByText("Xúc Tiến Giao Thương & MOU")).toBeInTheDocument();
    expect(screen.queryByText(/Đánh Giá Năng Lực TT17/i)).not.toBeInTheDocument();
  });
});
