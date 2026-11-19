import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FastTrackSubmitModal } from "./FastTrackSubmitModal";

describe("FastTrackSubmitModal", () => {
  afterEach(cleanup);

  it("renders when open and displays title, offerType, sectorName, pricing and fixed BACLINK authority", () => {
    render(
      <FastTrackSubmitModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Công nghệ sấy thăng hoa chân không"
        offerType="Thiết bị"
        sectorName="Cơ khí chính xác, Khuôn mẫu & Chế tạo máy"
        pricingDisplay="100,000,000 VND / Bộ"
        isSubmitting={false}
        managingAuthorityId="VN-BN"
        managingAuthorityName="Ban Thẩm định Kỹ thuật — Hiệp hội BACLINK"
      />
    );

    expect(screen.getByText(/Xác Nhận Nộp Hồ Sơ Nhanh \(Fast-Track\)/i)).toBeInTheDocument();
    expect(screen.getByText("Công nghệ sấy thăng hoa chân không")).toBeInTheDocument();
    expect(screen.getByText("Thiết bị")).toBeInTheDocument();
    expect(screen.getByText("Cơ khí chính xác, Khuôn mẫu & Chế tạo máy")).toBeInTheDocument();
    expect(screen.getByText("100,000,000 VND / Bộ")).toBeInTheDocument();
    expect(screen.getByText("Ban Thẩm định Kỹ thuật — Hiệp hội BACLINK")).toBeInTheDocument();
  });

  it("does not render provincial authority dropdown and enforces fixed BACLINK authority", () => {
    render(
      <FastTrackSubmitModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Công nghệ sấy thăng hoa chân không"
        offerType="Thiết bị"
        sectorName="Cơ khí chính xác, Khuôn mẫu & Chế tạo máy"
        pricingDisplay="100,000,000 VND / Bộ"
        isSubmitting={false}
      />
    );

    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getByText("Ban Thẩm định Kỹ thuật — Hiệp hội BACLINK")).toBeInTheDocument();
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
        sectorName="Vật liệu mới & Công nghiệp hỗ trợ"
        pricingDisplay="Liên hệ báo giá"
        isSubmitting={false}
        managingAuthorityId="VN-BN"
        managingAuthorityName="Ban Thẩm định Kỹ thuật — Hiệp hội BACLINK"
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
