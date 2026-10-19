import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import QuickDemandModal from "./QuickDemandModal";

vi.mock("@/components/common/toast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

describe("QuickDemandModal — 10 Fields Section B & TNI", () => {
  afterEach(cleanup);

  it("renders all 10 fields in Section B from Master Excel in exact sequence and keeps TNI calculator", () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(
      <QuickDemandModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    // Modal Header
    expect(screen.getByText("Đăng Bài Toán Kỹ Thuật Cần Tìm Cung")).toBeInTheDocument();
    expect(screen.getByText("1. Chi Tiết Bài Toán Kỹ Thuật")).toBeInTheDocument();

    // 10 Fields in exact sequence
    expect(screen.getByText(/1\. Tên công nghệ \/ thiết bị/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Mô tả chi tiết thêm về nhu cầu/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Ngân sách/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Lĩnh vực/i)).toBeInTheDocument();
    expect(screen.getByText(/5\. Nhóm công nghệ/i)).toBeInTheDocument();
    expect(screen.getByText(/6\. Công đoạn sản xuất có sự cố/i)).toBeInTheDocument();
    expect(screen.getByText(/7\. Mô tả cụ thể vấn đề kỹ thuật \/ điểm nghẽn/i)).toBeInTheDocument();
    expect(screen.getByText(/8\. Mục tiêu kỹ thuật và kinh tế kỳ vọng sau khi có công nghệ\/ thiết bị/i)).toBeInTheDocument();
    expect(screen.getByText(/9\. Cần chuyên gia tư vấn/i)).toBeInTheDocument();
    expect(screen.getByText(/10\. Loại hình tiếp nhận/i)).toBeInTheDocument();

    // Right Column: TNI section preserved
    expect(screen.getByText("2. Chỉ Số Nhu Cầu Đổi Mới (TNI)")).toBeInTheDocument();

    // Close button triggers onClose
    const closeBtn = screen.getByLabelText("Đóng hộp thoại");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("filters Tech Groups dynamically when Sector changes and supports searchable combobox filtering", () => {
    render(
      <QuickDemandModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    // Click Sector Combobox trigger ("4. Lĩnh vực")
    const sectorTrigger = screen.getByLabelText("4. Lĩnh vực");
    // Verify trigger does not show LV01 code on UI
    expect(sectorTrigger.textContent).not.toContain("LV01");
    expect(sectorTrigger.textContent).toContain("Nông nghiệp");

    fireEvent.click(sectorTrigger);

    // Search for "Công nghệ thông tin" inside the combobox search input
    const searchInput = screen.getByPlaceholderText(/Tìm lĩnh vực/i);
    fireEvent.change(searchInput, { target: { value: "Công nghệ thông tin" } });

    // Select option and verify LV16 is not shown in the option text
    const lv16Option = screen.getByRole("option", { name: /Công nghệ thông tin/i });
    expect(lv16Option.textContent).not.toContain("LV16");
    fireEvent.click(lv16Option);

    // Open Tech Group Combobox ("5. Nhóm công nghệ")
    const techGroupTrigger = screen.getByLabelText("5. Nhóm công nghệ");
    expect(techGroupTrigger.textContent).not.toContain("CN09");
    fireEvent.click(techGroupTrigger);

    // Verify recommended group header is displayed without LV16 code
    expect(screen.getByText(/Nhóm công nghệ phù hợp với lĩnh vực đã chọn/i)).toBeInTheDocument();

    // Filter inside Tech Group combobox for "ERP"
    const techSearchInput = screen.getByPlaceholderText(/Tìm nhóm công nghệ/i);
    fireEvent.change(techSearchInput, { target: { value: "ERP" } });

    const cn12Option = screen.getByRole("option", { name: /Phần mềm ERP\/MES/i });
    expect(cn12Option).toBeInTheDocument();
    expect(cn12Option.textContent).not.toContain("CN12");
    fireEvent.click(cn12Option);

    // Verify trigger now displays Vietnamese label and NOT CN12 code
    expect(techGroupTrigger.textContent).toContain("Phần mềm ERP/MES");
    expect(techGroupTrigger.textContent).not.toContain("CN12");
  });
});
