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

  it("renders Step 1 with the 3 text fields before Sector & Tech Transfer, uses 8 BACLINK IND_* sectors, and styles Tiếp tục button visibly", () => {
    render(<TaoHoSoChaoBanPage />);

    // Verify field order in DOM: Title, Summary, ProblemSolved appear BEFORE Sector combobox
    const titleLabel = screen.getByText(/Tên sản phẩm \/ thiết bị \/ công nghệ/i);
    const summaryLabel = screen.getByText(/Mô tả ngắn giải pháp/i);
    const problemLabel = screen.getByText(/Công dụng \/ Bài toán kỹ thuật giải quyết/i);
    const sectorLabel = screen.getByText(/Ngành công nghiệp \(BACLINK\)/i);

    expect(
      titleLabel.compareDocumentPosition(sectorLabel) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      summaryLabel.compareDocumentPosition(sectorLabel) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      problemLabel.compareDocumentPosition(sectorLabel) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    // Verify Sector SearchableCombobox defaults to IND_ELEC without exposing raw code
    const sectorTrigger = screen.getByLabelText("Ngành công nghiệp (BACLINK)");
    expect(sectorTrigger.textContent).toContain("Điện tử, Bán dẫn");
    expect(sectorTrigger.textContent).not.toContain("IND_ELEC");

    // Open Sector Combobox and filter for "Cơ khí"
    fireEvent.click(sectorTrigger);
    const searchInput = screen.getByPlaceholderText(/Tìm ngành công nghiệp/i);
    fireEvent.change(searchInput, { target: { value: "Cơ khí" } });

    const mechOption = screen.getByRole("option", { name: /Cơ khí chính xác/i });
    expect(mechOption.textContent).not.toContain("IND_MECH");
    fireEvent.click(mechOption);

    expect(sectorTrigger.textContent).toContain("Cơ khí chính xác");
    expect(sectorTrigger.textContent).not.toContain("IND_MECH");

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
    expect(screen.getByText(/Bước 2: Thông số kỹ thuật & Đặc thù ngành công nghiệp/i)).toBeInTheDocument();
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

  const fillStep1Valid = () => {
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
  };

  it("blocks Fast-Track modal and displays validation error when Step 1 required fields are missing", () => {
    render(<TaoHoSoChaoBanPage />);

    const fastTrackBtn = screen.getByRole("button", { name: /Gửi chờ duyệt ngay \(Fast-Track\)/i });
    fireEvent.click(fastTrackBtn);

    // Modal should NOT open
    expect(screen.queryByText(/Xác Nhận Nộp Hồ Sơ Nhanh \(Fast-Track\)/i)).toBeNull();
    // Error feedback should be displayed
    expect(
      screen.getByText(/Vui lòng hoàn thiện các trường bắt buộc ở Bước 1 trước khi gửi hồ sơ Fast-Track/i)
    ).toBeInTheDocument();
  });

  it("supports Fast-Track submission directly from Step 1 via modal when Step 1 is valid", () => {
    render(<TaoHoSoChaoBanPage />);

    // Fill valid Step 1
    fillStep1Valid();

    // Find Fast-Track button in Step 1
    const fastTrackBtn = screen.getByRole("button", { name: /Gửi chờ duyệt ngay \(Fast-Track\)/i });
    expect(fastTrackBtn).toBeInTheDocument();

    // Click Fast Track button to open modal
    fireEvent.click(fastTrackBtn);
    expect(screen.getByText(/Xác Nhận Nộp Hồ Sơ Nhanh \(Fast-Track\)/i)).toBeInTheDocument();

    // Verify modal action button is enabled (since agreed is true by default)
    const submitConfirmBtn = screen.getByRole("button", { name: /Xác nhận & Nộp hồ sơ chờ duyệt/i });
    expect(submitConfirmBtn).not.toBeDisabled();

    // Verify modal displays fixed BACLINK authority
    expect(screen.getAllByText(/Ban Thẩm định Kỹ thuật — Hiệp hội BACLINK/i).length).toBeGreaterThanOrEqual(1);
  });

  it("displays fixed Ban Thẩm định Kỹ thuật — Hiệp hội BACLINK in Step 1 and Step 4 without Sở KH&CN selector", () => {
    render(<TaoHoSoChaoBanPage />);

    // Step 1: Check that fixed BACLINK authority is displayed and no Sở KH&CN text exists
    expect(screen.getAllByText("Ban Thẩm định Kỹ thuật — Hiệp hội BACLINK").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/Sở KH&CN/i)).toBeNull();
    expect(screen.queryByText(/Sở Khoa học/i)).toBeNull();

    // Step 4 also shows fixed BACLINK authority
    const stepperTitle = screen.getByText(/Tiến trình hồ sơ/i);
    const stepperContainer = stepperTitle.closest("div")?.parentElement!;
    const stepButtons = stepperContainer.querySelectorAll("button");
    fireEvent.click(stepButtons[3]);

    expect(screen.getAllByText("Ban Thẩm định Kỹ thuật — Hiệp hội BACLINK").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/Sở KH&CN/i)).toBeNull();
  });

  it("allows clicking freely on any step in FormStepper without being locked, and confirms 5 UX states panel is removed", () => {
    render(<TaoHoSoChaoBanPage />);

    // Get stepper buttons container
    const stepperTitle = screen.getByText(/Tiến trình hồ sơ/i);
    const stepperContainer = stepperTitle.closest("div")?.parentElement!;
    const stepButtons = stepperContainer.querySelectorAll("button");

    // Click directly on Step 2 in FormStepper
    fireEvent.click(stepButtons[0]); // Step 1
    fireEvent.click(stepButtons[1]); // Step 2
    expect(screen.getByText(/Bước 2: Thông số kỹ thuật & Đặc thù ngành công nghiệp/i)).toBeInTheDocument();

    // Click directly on Step 3 in FormStepper
    fireEvent.click(stepButtons[2]); // Step 3
    expect(screen.getByText(/Bước 3: Điều Kiện Thương Mại Chi Tiết/i)).toBeInTheDocument();

    // Click directly on Step 4 in FormStepper
    fireEvent.click(stepButtons[3]); // Step 4
    expect(screen.getByText(/Bước 4: Pháp Lý Sở Hữu Trí Tuệ & DataRoom/i)).toBeInTheDocument();

    // Verify 5 UX states debug panel is removed
    expect(screen.queryByText(/5 trạng thái UX hệ thống/i)).toBeNull();
  });
});
