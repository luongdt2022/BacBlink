import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Footer } from "./footer";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("./i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        ministry_title: "UBND TỈNH BẮC NINH",
        institute_title: "HIỆP HỘI SẢN XUẤT CÔNG NGHIỆP TỈNH BẮC NINH (BACLINK)",
        footer_address: "Địa chỉ: Số 7 Lý Thái Tổ, Phường Suối Hoa, TP. Bắc Ninh, Tỉnh Bắc Ninh",
        footer_contact: "Email: contact@baclink.org.vn | Hotline: 0222.3888.686",
        footer_rights: "© 2026 BACLINK - Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh. QĐ thành lập số 1652/QĐ-UBND.",
        footer_system_status: "Hệ thống kết nối chuỗi cung ứng công nghiệp Bắc Ninh.",
      };
      return translations[key] || key;
    },
  }),
}));

describe("Footer Component (BACLINK Official Portal Style)", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders authoritative government hierarchy and contact info", () => {
    render(<Footer />);

    expect(screen.getByText(/Cơ quan thành lập:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/UBND TỈNH BẮC NINH/i).length).toBeGreaterThan(0);

    expect(screen.getByText(/Đơn vị vận hành:/i)).toBeInTheDocument();
    expect(screen.getByText(/HIỆP HỘI SẢN XUẤT CÔNG NGHIỆP TỈNH BẮC NINH \(BACLINK\)/i)).toBeInTheDocument();

    expect(screen.getByText(/Địa chỉ: Số 7 Lý Thái Tổ, Phường Suối Hoa, TP. Bắc Ninh, Tỉnh Bắc Ninh/i)).toBeInTheDocument();
    expect(screen.getByText(/Điện thoại: 0222.3888.686/i)).toBeInTheDocument();
    expect(screen.getByText(/E-mail: contact@baclink.org.vn/i)).toBeInTheDocument();
  });

  it("renders copyright, live visitor counter and system testing phase notice", () => {
    render(<Footer />);

    expect(screen.getByText(/© 2026 BACLINK/i)).toBeInTheDocument();
    expect(screen.getByText(/Lượt truy cập:/i)).toBeInTheDocument();
    expect(screen.getByText("2.689.450")).toBeInTheDocument();
    expect(screen.getByText(/Thành lập theo Quyết định số 1652\/QĐ-UBND/i)).toBeInTheDocument();
  });
});
