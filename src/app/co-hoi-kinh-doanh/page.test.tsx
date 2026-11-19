import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

let loai: string | null = null;
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => loai }),
  useRouter: () => ({ replace }),
}));
const demands = vi.fn();
const events = vi.fn();
vi.mock("@/lib/portal-client", () => ({ portalClient: { getPublicDemands: (...a: unknown[]) => demands(...a), listEvents: (...a: unknown[]) => events(...a) } }));
const offers = vi.fn();
vi.mock("@/services/api/technology-offer", () => ({ fetchPublicOffers: (...a: unknown[]) => offers(...a) }));
const openContact = vi.fn();
vi.mock("@/lib/contact-client", () => ({ openContactModal: (...a: unknown[]) => openContact(...a) }));

import Page from "./page";

describe("/co-hoi-kinh-doanh (REQ-BL10-OPPS-002)", () => {
  beforeEach(() => {
    loai = null;
    demands.mockReset().mockResolvedValue([{ id: "d1", technicalProblem: "Cấp phôi tự động", itemCode: "DMD-1", province: "Bắc Ninh", budgetRange: "500 triệu" }]);
    offers.mockReset().mockResolvedValue({ data: [{ id: "o1", title: "Khuôn mẫu chính xác", enterpriseName: "Cty A", sectorName: "Cơ khí", summary: "Mô tả" }] });
    events.mockReset().mockResolvedValue({ data: [{ id: "e1", title: "Phiên kết nối B2B", location: "Bắc Ninh", startDate: "2026-12-05T00:00:00Z" }], total: 1 });
  });
  afterEach(() => { cleanup(); replace.mockReset(); openContact.mockReset(); });

  it("mặc định hiện nhu cầu mua hàng; 5 tab theo góp ý", async () => {
    render(<Page />);
    expect(await screen.findByText("Cấp phôi tự động")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(5);
    expect(screen.getByRole("link", { name: /Cấp phôi tự động/ })).toHaveAttribute("href", "/nhu-cau-cong-nghe/d1");
    expect(screen.getByText("Ngân sách dự kiến: 500 triệu")).toBeInTheDocument();
  });

  it("tab đối tác công nghệ gọi API với hasTechTransfer; tab B2B lấy sự kiện", async () => {
    loai = "doi-tac-cong-nghe";
    render(<Page />);
    expect(await screen.findByText("Khuôn mẫu chính xác")).toBeInTheDocument();
    expect(offers).toHaveBeenCalledWith(expect.objectContaining({ hasTechTransfer: true }));
    cleanup();
    loai = "ket-noi-b2b";
    render(<Page />);
    expect(await screen.findByText("Phiên kết nối B2B")).toBeInTheDocument();
  });

  it("cơ hội đầu tư chưa có nguồn → 'Đang cập nhật' + nút gửi thông tin (không bịa nội dung)", async () => {
    loai = "dau-tu";
    render(<Page />);
    expect(await screen.findByText("Đang cập nhật")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Gửi thông tin cho Văn phòng" }));
    expect(openContact).toHaveBeenCalledWith("PARTNERSHIP", expect.stringContaining("Cơ hội đầu tư"));
  });

  it("đổi tab → cập nhật URL; lỗi API → nút thử lại", async () => {
    render(<Page />);
    await screen.findByText("Cấp phôi tự động");
    fireEvent.click(screen.getByRole("tab", { name: /Chương trình kết nối B2B/ }));
    expect(replace).toHaveBeenCalledWith("/co-hoi-kinh-doanh?loai=ket-noi-b2b", { scroll: false });
    cleanup();
    demands.mockRejectedValue(new Error("x"));
    render(<Page />);
    await waitFor(() => expect(screen.getByRole("button", { name: /Thử lại/i })).toBeInTheDocument());
  });
});
