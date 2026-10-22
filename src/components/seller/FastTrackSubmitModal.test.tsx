import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FastTrackSubmitModal } from "./FastTrackSubmitModal";

describe("FastTrackSubmitModal", () => {
  afterEach(cleanup);

  it("renders when open and displays title, offerType, sectorName, pricing", () => {
    render(
      <FastTrackSubmitModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Công nghệ sấy thăng hoa chân không"
        offerType="Thiết bị"
        sectorName="Chế biến thực phẩm"
        pricingDisplay="100,000,000 VND / Bộ"
        isSubmitting={false}
        managingAuthorityId="VN-HN"
        managingAuthorityName="Sở Khoa học và Công nghệ TP. Hà Nội"
      />
    );

    expect(screen.getByText(/Xác Nhận Nộp Hồ Sơ Nhanh \(Fast-Track\)/i)).toBeInTheDocument();
    expect(screen.getByText("Công nghệ sấy thăng hoa chân không")).toBeInTheDocument();
    expect(screen.getByText("Thiết bị")).toBeInTheDocument();
    expect(screen.getByText("Chế biến thực phẩm")).toBeInTheDocument();
    expect(screen.getByText("100,000,000 VND / Bộ")).toBeInTheDocument();
  });

  it("calls onAuthorityChange with VN-TN and Thái Nguyên name when user selects Thái Nguyên", () => {
    const handleAuthorityChange = vi.fn();
    render(
      <FastTrackSubmitModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Công nghệ sấy thăng hoa chân không"
        offerType="Thiết bị"
        sectorName="Chế biến thực phẩm"
        pricingDisplay="100,000,000 VND / Bộ"
        isSubmitting={false}
        managingAuthorityId="VN-HN"
        managingAuthorityName="Sở Khoa học và Công nghệ TP. Hà Nội"
        onAuthorityChange={handleAuthorityChange}
      />
    );

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    // Select VN-TN (Sở Khoa học và Công nghệ tỉnh Thái Nguyên)
    fireEvent.change(select, { target: { value: "VN-TN" } });

    expect(handleAuthorityChange).toHaveBeenCalledTimes(1);
    expect(handleAuthorityChange).toHaveBeenCalledWith(
      "VN-TN",
      "Sở Khoa học và Công nghệ tỉnh Thái Nguyên"
    );
  });

  it("disables submit button when legal agreement checkbox is unchecked", () => {
    const handleConfirm = vi.fn();
    render(
      <FastTrackSubmitModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={handleConfirm}
        title="Công nghệ Nano"
        offerType="Sản phẩm"
        sectorName="Vật liệu mới"
        pricingDisplay="Liên hệ báo giá"
        isSubmitting={false}
        managingAuthorityId="VN-TN"
        managingAuthorityName="Sở Khoa học và Công nghệ tỉnh Thái Nguyên"
      />
    );

    const submitBtn = screen.getByRole("button", { name: /Xác nhận & Nộp hồ sơ chờ duyệt/i });
    expect(submitBtn).not.toBeDisabled();

    // Uncheck legal agreement checkbox
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(submitBtn).toBeDisabled();

    // Re-check
    fireEvent.click(checkbox);
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });
});
