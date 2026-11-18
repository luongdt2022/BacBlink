import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import EnterpriseAdminDashboardPage from "./page";

const { fetchDashboardStatsMock } = vi.hoisted(() => ({
  fetchDashboardStatsMock: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("../../../../lib/enterprise-client", () => ({
  fetchDashboardStats: fetchDashboardStatsMock,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EnterpriseAdminDashboardPage — CR-BACLINK-007 Clean BACLINK Labels", () => {
  it("renders BACLINK member dashboard headings and stats with zero TT17/ĐMST/Quốc gia/34 tỉnh remnants", async () => {
    fetchDashboardStatsMock.mockResolvedValue({
      totalEnterprises: 7,
      verifiedCount: 7,
      byProvince: [
        { province: "KCN VSIP Bắc Ninh", count: 3 },
        { province: "KCN Yên Phong", count: 4 },
      ],
      byTniClassification: [{ classification: "Quy mô lớn", count: 4 }],
      bySector: [{ sector: "Điện tử, Bán dẫn & Thiết bị điện", count: 4 }],
      topBottlenecks: [{ name: "Tự động hóa kiểm tra ngoại quan AOI", count: 3 }],
    });

    const { container } = render(<EnterpriseAdminDashboardPage />);

    expect(
      await screen.findByText("Bảng Điều Khiển Doanh Nghiệp Hội Viên BACLINK")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Thống kê năng lực sản xuất & chuỗi cung ứng của Doanh nghiệp Hội viên tại các KCN Bắc Ninh"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("8 Ngành công nghiệp mũi nhọn BACLINK")).toBeInTheDocument();

    const text = container.textContent || "";
    expect(text).not.toMatch(/TT17|Thông tư 17|ĐMST|Quốc gia|34 tỉnh|Sở KH&CN|NacenTech|NacenTwin/i);
  });
});
