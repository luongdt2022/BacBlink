import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const notFound = vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); });
vi.mock("next/navigation", () => ({ notFound: () => notFound() }));
const openContact = vi.fn();
vi.mock("@/lib/contact-client", () => ({ openContactModal: (...a: unknown[]) => openContact(...a) }));

import DichVuDetailPage from "./page";
import DichVuHubPage from "../page";
import { BUSINESS_SERVICES } from "@/lib/constants/services";

describe("/dich-vu (CR-BACLINK-010)", () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it("hub liệt kê 8 dịch vụ có link chi tiết", () => {
    render(<DichVuHubPage />);
    BUSINESS_SERVICES.forEach((s) => expect(screen.getByRole("link", { name: new RegExp(s.title) })).toHaveAttribute("href", `/dich-vu/${s.slug}`));
  });

  it("trang chi tiết có đủ 4 câu hỏi và nút đăng ký mở popup chủ đề SERVICE", async () => {
    render(await DichVuDetailPage({ params: Promise.resolve({ slug: "ho-tro-chinh-sach" }) }));
    expect(screen.getByRole("heading", { name: "Dành cho ai?" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Giải quyết vấn đề gì?" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /hỗ trợ như thế nào\?/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Đăng ký ở đâu?" })).toBeInTheDocument();
    screen.getByRole("button", { name: "Gửi yêu cầu đăng ký" }).click();
    expect(openContact).toHaveBeenCalledWith("SERVICE", expect.stringContaining("Hỗ trợ & tư vấn chính sách"));
    expect(screen.getByRole("link", { name: /Ban Chính sách & Đối thoại đầu tư/ })).toHaveAttribute("href", "/gioi-thieu/co-cau-to-chuc/ban_cs_dtdt");
  });

  it("slug không tồn tại → notFound", async () => {
    await expect(DichVuDetailPage({ params: Promise.resolve({ slug: "khong-co" }) })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });
});
