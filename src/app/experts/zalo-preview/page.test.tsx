import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ZaloPreviewPage from "./page";

vi.mock("@/components/common/toast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

describe("ZaloPreviewPage (GAP-06)", () => {
  it("renders mobile simulator by default with form inputs", () => {
    render(<ZaloPreviewPage />);
    expect(
      screen.getByText(/Giả Lập Kênh Zalo Mini App/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Họ và tên chuyên gia/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Gửi Hồ Sơ Nhanh/i })
    ).toBeInTheDocument();
  });

  it("switches to real QR Code tab and displays real scannable QR matrix", () => {
    render(<ZaloPreviewPage />);
    const qrTabBtns = screen.getAllByText(/Mã QR Quét Thật/i);
    const qrTabBtn = qrTabBtns[0].closest("button")!;
    fireEvent.click(qrTabBtn);

    // Verify QR code image is rendered with ISO 2D matrix
    const qrImg = screen.getByAltText(/Mã QR Quét Thật Zalo Mini App/i);
    expect(qrImg).toBeInTheDocument();
    expect(qrImg.getAttribute("src")).toContain("https://api.qrserver.com/v1/create-qr-code");
    expect(qrImg.getAttribute("src")).toContain("zalo.me%2Fs%2F3656836549317117720");

    // Check QR Target selector
    const webChannelBtn = screen.getByRole("button", { name: /Kênh Web Mobile Form/i });
    fireEvent.click(webChannelBtn);

    // After switching, QR should encode web mobile form
    const updatedQrImg = screen.getByAltText(/Mã QR Quét Thật Zalo Mini App/i);
    expect(updatedQrImg.getAttribute("src")).toContain("experts%2Fzalo-preview");
  });
});
