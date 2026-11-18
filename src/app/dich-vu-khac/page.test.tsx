import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import DichVuKhacPage from "./page";
import { brokerageApi } from "@/services/api/brokerage";

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock("@/components/common/toast", () => ({
  useToast: () => mockToast,
}));

describe("DichVuKhacPage (Dịch Vụ Khác)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(brokerageApi, "createConnectionRequest").mockResolvedValue({
      id: "req-srv-01",
      requestCode: "REQ-202610-1234",
      status: "PENDING",
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and core industrial services", () => {
    const { container } = render(<DichVuKhacPage />);

    expect(screen.getByText(/Dịch Vụ Hỗ Trợ Hội Viên & Tư Vấn Kỹ Thuật Công Nghiệp/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Đăng Ký Bảo Hộ SHTT & Sáng Chế/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Thẩm Định & Định Giá Công Nghệ/i)).toBeInTheDocument();
    expect(screen.getByText(/3. Tư Vấn Chuẩn Hóa Chuỗi Cung Ứng FDI \(ISO \/ IATF \/ ESG\)/i)).toBeInTheDocument();
    expect(screen.getByText(/4. Môi Giới & Hợp Đồng Chuyển Giao/i)).toBeInTheDocument();
    expect(container.querySelector("#chuoi-cung-ung-fdi")).not.toBeNull();
    expect(container.querySelector("#dinh-gia-cong-nghe")).not.toBeNull();
  });

  it("excludes national survey and assessment service cards in compact mode", () => {
    render(<DichVuKhacPage />);

    // Survey cards are excluded in compact mode
    expect(screen.queryByText(/Khảo Sát Nhu Cầu & Đánh Giá Năng Lực Công Nghệ/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Làm Khảo Sát TNI Ngay/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Tự Đánh Giá TT17 Ngay/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Làm Khảo Sát ĐMST Ngay/i })).not.toBeInTheDocument();
  });

  it("validates mandatory fields on consultation form submit", () => {
    render(<DichVuKhacPage />);

    const submitBtn = screen.getByRole("button", { name: /Gửi Phiếu Yêu Cầu Hỗ Trợ/i });
    fireEvent.submit(submitBtn.closest("form")!);

    expect(mockToast.error).toHaveBeenCalledWith(
      "Vui lòng điền đầy đủ họ tên, email và số điện thoại liên hệ.",
      "Thiếu thông tin"
    );
  });

  it("submits consultation form successfully when fields are filled", async () => {
    render(<DichVuKhacPage />);

    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Nguyễn Văn A/i), {
      target: { value: "Trần Văn Bình" },
    });
    fireEvent.change(screen.getByPlaceholderText(/nguyenvana@gmail\.com/i), {
      target: { value: "binh.tv@enterprise.vn" },
    });
    fireEvent.change(screen.getByPlaceholderText(/0912 345 678/i), {
      target: { value: "0912345678" },
    });

    const submitBtn = screen.getByRole("button", { name: /Gửi Phiếu Yêu Cầu Hỗ Trợ/i });
    fireEvent.click(submitBtn);

    await waitFor(
      () => {
        expect(mockToast.success).toHaveBeenCalledWith(
          expect.stringContaining("Yêu cầu tư vấn đã được tiếp nhận"),
          "Đăng ký thành công"
        );
      },
      { timeout: 1500 }
    );

    expect(await screen.findByText(/Yêu Cầu Của Bạn Đã Được Gửi Thành Công!/i, {}, { timeout: 1500 })).toBeInTheDocument();
  });
});
