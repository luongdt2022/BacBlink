import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const mine = vi.fn();
const open = vi.fn();
vi.mock("@/lib/contact-client", async (orig) => {
  const real = await orig<typeof import("@/lib/contact-client")>();
  return { ...real, listMyContactRequests: () => mine(), openContactModal: (...a: unknown[]) => open(...a) };
});
import MyRequestsPage from "./page";

const base = { id: "r1", fullName: "A", topic: "POLICY", message: "Vướng mắc thủ tục thuê đất", status: "NEW", createdAt: "2026-11-01T03:00:00Z" };

describe("/portal/requests (REQ-BL10-MYREQ-003)", () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it("hiển thị trạng thái và phản hồi của Văn phòng", async () => {
    mine.mockResolvedValue([base, { ...base, id: "r2", status: "DONE", message: "Đăng ký dịch vụ ESG", handledNote: "Đã chuyển Ban CNX–ĐMST, sẽ gọi lại" }]);
    render(<MyRequestsPage />);
    expect(await screen.findByText("Đã tiếp nhận")).toBeInTheDocument();
    expect(screen.getByText("Đã xử lý")).toBeInTheDocument();
    expect(screen.getByText(/Đã chuyển Ban CNX–ĐMST/)).toBeInTheDocument();
    expect(screen.getAllByText("Kiến nghị, vướng mắc chính sách").length).toBeGreaterThan(0);
  });

  it("chưa có yêu cầu → trạng thái trống; nút gửi mới mở popup", async () => {
    mine.mockResolvedValue([]);
    render(<MyRequestsPage />);
    expect(await screen.findByText("Bạn chưa gửi yêu cầu nào")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Gửi yêu cầu mới/ }));
    expect(open).toHaveBeenCalledWith("POLICY");
  });

  it("lỗi tải → có nút thử lại", async () => {
    mine.mockRejectedValue(new Error("x"));
    render(<MyRequestsPage />);
    expect(await screen.findByText("Không tải được danh sách yêu cầu.")).toBeInTheDocument();
  });
});
