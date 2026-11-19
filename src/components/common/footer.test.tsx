import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const open = vi.fn();
vi.mock("@/lib/contact-client", () => ({ openContactModal: (...a: unknown[]) => open(...a) }));
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("./i18n-provider", () => ({ useI18n: () => ({ lang: "vi", t: (k: string) => k }) }));

import { Footer, FOOTER_LINKS } from "./footer";
import { ORG } from "@/lib/constants/organization";

describe("Footer BACLINK dạng gọn (CR-BACLINK-008)", () => {
  afterEach(() => { cleanup(); open.mockReset(); });

  it("hiển thị chủ quản, địa chỉ, QĐ từ ORG; bố cục 2 cột gọn", () => {
    render(<Footer />);
    expect(screen.getByText(ORG.fullNameUpper)).toBeInTheDocument();
    expect(screen.getByText(ORG.address)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(ORG.decision.number))).toBeInTheDocument();
    expect(screen.getByText(ORG.motto)).toBeInTheDocument();
  });

  it("không công bố điện thoại/email/Zalo và không có số liệu không nguồn", () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('a[href^="tel:"], a[href^="mailto:"], a[href*="zalo"]')).toBeNull();
    expect(screen.queryByText(/Lượt truy cập|NCSC|2\.689\.450/)).not.toBeInTheDocument();
  });

  it("nút liên hệ mở biểu mẫu; chỉ liên kết tới trang đang tồn tại", () => {
    render(<Footer />);
    fireEvent.click(screen.getByRole("button", { name: "Liên hệ & gửi yêu cầu" }));
    expect(open).toHaveBeenCalledTimes(1);
    const hrefs = FOOTER_LINKS.map((l) => l.href);
    ["/wireframes", "/matrix", "/dieu-khoan", "/bao-mat"].forEach((h) => expect(hrefs).not.toContain(h));
    hrefs.forEach((h) => expect(screen.getAllByRole("link").some((a) => a.getAttribute("href") === h)).toBe(true));
  });
});
