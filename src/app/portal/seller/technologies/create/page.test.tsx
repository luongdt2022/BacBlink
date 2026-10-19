import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import TaoHoSoChaoBanPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

describe("TaoHoSoChaoBanPage (/portal/seller/technologies/create)", () => {
  afterEach(cleanup);

  it("renders Step 1 with the 3 text fields before Sector & Tech Transfer, hides LV.. codes, and styles Tiếp tục button visibly", () => {
    render(<TaoHoSoChaoBanPage />);

    // Verify field order in DOM: Title, Summary, ProblemSolved appear BEFORE Sector combobox
    const titleLabel = screen.getByText(/Tên sản phẩm \/ thiết bị \/ công nghệ/i);
    const summaryLabel = screen.getByText(/Mô tả ngắn giải pháp/i);
    const problemLabel = screen.getByText(/Công dụng \/ Bài toán kỹ thuật giải quyết/i);
    const sectorLabel = screen.getByText(/Ngành công nghiệp \(18 nhóm ngành TT17\)/i);

    expect(
      titleLabel.compareDocumentPosition(sectorLabel) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      summaryLabel.compareDocumentPosition(sectorLabel) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      problemLabel.compareDocumentPosition(sectorLabel) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    // Verify Sector SearchableCombobox does NOT display LV01 code on trigger
    const sectorTrigger = screen.getByLabelText("Ngành công nghiệp (18 nhóm ngành TT17)");
    expect(sectorTrigger.textContent).toContain("Nông nghiệp");
    expect(sectorTrigger.textContent).not.toContain("LV01");

    // Open Sector Combobox and filter for "Cơ khí"
    fireEvent.click(sectorTrigger);
    const searchInput = screen.getByPlaceholderText(/Tìm ngành công nghiệp/i);
    fireEvent.change(searchInput, { target: { value: "Cơ khí" } });

    const mechOption = screen.getByRole("option", { name: /Cơ khí chế tạo/i });
    expect(mechOption.textContent).not.toContain("LV07");
    fireEvent.click(mechOption);

    expect(sectorTrigger.textContent).toContain("Cơ khí chế tạo");
    expect(sectorTrigger.textContent).not.toContain("LV07");

    // Verify "Tiếp tục: Thông số ngành" button is visible and uses bg-brand-700
    const nextBtn = screen.getByRole("button", { name: /Tiếp tục: Thông số ngành/i });
    expect(nextBtn.className).toContain("bg-brand-700");
    expect(nextBtn.className).toContain("text-white");

    // Fill 3 required fields and click Next to verify navigation to Step 2
    fireEvent.change(
      screen.getByPlaceholderText(/Máy sấy thăng hoa chân không/i),
      { target: { value: "Robot hàn laser tự động 6 bậc tự do" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText(/Nêu ngắn gọn đặc điểm chính/i),
      { target: { value: "Hệ thống hàn laser độ chính xác cao tích hợp camera AI." } }
    );
    fireEvent.change(
      screen.getByPlaceholderText(/Sản phẩm giải quyết nỗi đau/i),
      { target: { value: "Giảm 90% tỷ lệ rỗ khí mối hàn kim loại tấm mỏng." } }
    );

    fireEvent.click(nextBtn);
    expect(screen.getByText(/Bước 2: Thông số kỹ thuật & 18 Ngành TT17/i)).toBeInTheDocument();
  });

  it("toggles the reactive yellow TRL panel when Chuyển giao công nghệ switch is toggled", () => {
    render(<TaoHoSoChaoBanPage />);

    // Initially hasTechTransfer is true (by default in Wireframe), so TRL panel is visible
    expect(screen.getByText(/Hồ Sơ Chuyển Giao Công Nghệ & SHTT \(IP Quad\)/i)).toBeInTheDocument();

    // Select TRL 6
    const trl6Btn = screen.getByRole("button", { name: "6" });
    expect(trl6Btn).toBeInTheDocument();
    fireEvent.click(trl6Btn);

    // Click "Không" button to toggle off -> TRL panel hides
    const noButton = screen.getByRole("button", { name: "Không" });
    fireEvent.click(noButton);
    expect(screen.queryByText(/Hồ Sơ Chuyển Giao Công Nghệ & SHTT \(IP Quad\)/i)).toBeNull();

    // Click "Có" button in tech transfer segmented control -> TRL panel reappears
    const yesButton = screen.getByRole("button", { name: "Có" });
    fireEvent.click(yesButton);
    expect(screen.getByText(/Hồ Sơ Chuyển Giao Công Nghệ & SHTT \(IP Quad\)/i)).toBeInTheDocument();
  });

  it("supports Fast-Track submission directly from Step 1 via modal", () => {
    render(<TaoHoSoChaoBanPage />);

    // Find Fast-Track button in Step 1
    const fastTrackBtn = screen.getByRole("button", { name: /Gửi chờ duyệt ngay \(Fast-Track\)/i });
    expect(fastTrackBtn).toBeInTheDocument();

    // Click Fast Track button to open modal
    fireEvent.click(fastTrackBtn);
    expect(screen.getByText(/Xác Nhận Nộp Hồ Sơ Nhanh \(Fast-Track\)/i)).toBeInTheDocument();

    // Verify modal action button is enabled (since agreed is true by default)
    const submitConfirmBtn = screen.getByRole("button", { name: /Xác nhận & Nộp hồ sơ chờ duyệt/i });
    expect(submitConfirmBtn).not.toBeDisabled();
  });
});
