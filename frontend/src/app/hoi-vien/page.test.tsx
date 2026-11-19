import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/lib/membership-client", async (orig) => {
  const real = await orig<typeof import("@/lib/membership-client")>();
  return { ...real, membershipClient: { tiers: vi.fn(async () => [
    { code: "OFFICIAL_M", name: "Hội viên chính thức – DN vừa", memberType: "OFFICIAL", audience: "100 – 300 lao động", annualFee: 6000000, joiningFee: 1000000, sortOrder: 2, isActive: true },
    { code: "HONORARY", name: "Hội viên danh dự", memberType: "HONORARY", audience: "Do BCH mời", annualFee: 0, joiningFee: 0, sortOrder: 5, isActive: true },
  ]) } };
});
import HoiVienPage from "./page";

describe("/hoi-vien (REQ-BL08-MEMBER-PUBLIC-006)", () => {
  afterEach(cleanup);
  it("có quyền lợi, bảng hội phí từ API, điều kiện, hồ sơ, quy trình và CTA gia nhập", async () => {
    render(<HoiVienPage />);
    expect(await screen.findByText("Hội viên chính thức – DN vừa")).toBeInTheDocument();
    expect(screen.getByText("6.000.000 đ")).toBeInTheDocument();
    expect(screen.getAllByText("Miễn phí").length).toBeGreaterThan(0);
    ["Quyền lợi hội viên", "Đối tượng, loại hình & hội phí", "Điều kiện gia nhập", "Hồ sơ cần chuẩn bị", "Quy trình gia nhập"].forEach((h) =>
      expect(screen.getByRole("heading", { name: new RegExp(h) })).toBeInTheDocument()
    );
    expect(screen.getAllByRole("link", { name: /Đăng ký hội viên|Bắt đầu đăng ký/ })[0]).toHaveAttribute("href", "/hoi-vien/gia-nhap");
  });
});
