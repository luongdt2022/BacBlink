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
        ministry_title: "BỘ KHOA HỌC VÀ CÔNG NGHỆ",
        institute_title: "VIỆN ĐỔI MỚI SÁNG TẠO QUỐC GIA",
        footer_address: "Địa chỉ: Số 25 Lê Thánh Tông, Hoàn Kiếm, Hà Nội",
        footer_contact: "Email: contact@nacentech.gov.vn | Hotline: 024.3933.1234",
        footer_rights: "© 2026 NacenTwin - Mạng lưới Đổi mới sáng tạo & Chuyển giao Công nghệ Quốc gia.",
        footer_system_status: "Hệ thống đang trong giai đoạn thử nghiệm.",
      };
      return translations[key] || key;
    },
  }),
}));

describe("Footer Component (STI.gov.vn style for NacenTwin)", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders authoritative government hierarchy and contact info", () => {
    render(<Footer />);

    expect(screen.getByText(/Cơ quan chủ quản:/i)).toBeInTheDocument();
    expect(screen.getByText(/BỘ KHOA HỌC VÀ CÔNG NGHỆ/i)).toBeInTheDocument();

    expect(screen.getByText(/Đơn vị vận hành:/i)).toBeInTheDocument();
    expect(screen.getByText(/VIỆN ĐỔI MỚI SÁNG TẠO QUỐC GIA/i)).toBeInTheDocument();

    expect(screen.getByText(/Địa chỉ: Số 25 Lê Thánh Tông, Hoàn Kiếm, Hà Nội/i)).toBeInTheDocument();
    expect(screen.getByText(/Điện thoại: 024.3933.1234/i)).toBeInTheDocument();
    expect(screen.getByText(/E-mail: contact@nacentech.gov.vn/i)).toBeInTheDocument();
  });

  it("renders copyright, live visitor counter and system testing phase notice", () => {
    render(<Footer />);

    expect(screen.getByText(/© 2026 NacenTwin/i)).toBeInTheDocument();
    expect(screen.getByText(/Lượt truy cập:/i)).toBeInTheDocument();
    expect(screen.getByText("2,689,450")).toBeInTheDocument();
    expect(screen.getByText("Hệ thống đang trong giai đoạn thử nghiệm.")).toBeInTheDocument();
  });
});
