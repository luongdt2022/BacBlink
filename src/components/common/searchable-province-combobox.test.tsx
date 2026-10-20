import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  SearchableProvinceCombobox,
  removeVietnameseDiacritics,
} from "./searchable-province-combobox";

afterEach(() => {
  cleanup();
});

describe("SearchableProvinceCombobox Unit Tests", () => {
  it("hàm removeVietnameseDiacritics loại bỏ dấu tiếng Việt chính xác", () => {
    expect(removeVietnameseDiacritics("Hà Nội")).toBe("ha noi");
    expect(removeVietnameseDiacritics("Đà Nẵng")).toBe("da nang");
    expect(removeVietnameseDiacritics("TP. Hồ Chí Minh")).toBe("tp. ho chi minh");
    expect(removeVietnameseDiacritics("Bắc Ninh")).toBe("bac ninh");
    expect(removeVietnameseDiacritics("Đắk Lắk")).toBe("dak lak");
  });

  it("render nút bấm với placeholder mặc định khi chưa chọn", () => {
    render(<SearchableProvinceCombobox onChange={vi.fn()} />);
    expect(screen.getByText("Tất cả Tỉnh / Thành phố")).toBeDefined();
  });

  it("mở popover danh sách khi bấm vào nút", () => {
    render(<SearchableProvinceCombobox onChange={vi.fn()} />);
    const triggerBtn = screen.getByRole("button");
    fireEvent.click(triggerBtn);

    // Kiểm tra ô tìm kiếm xuất hiện
    const searchInput = screen.getByPlaceholderText(/Gõ tên tỉnh thành/i);
    expect(searchInput).toBeDefined();

    // Kiểm tra hiển thị các tỉnh tiêu biểu
    expect(screen.getByText("Hà Nội")).toBeDefined();
    expect(screen.getByText("Đà Nẵng")).toBeDefined();
  });

  it("lọc chính xác tỉnh thành khi gõ tiếng Việt KHÔNG DẤU", () => {
    render(<SearchableProvinceCombobox onChange={vi.fn()} />);
    const triggerBtn = screen.getByRole("button");
    fireEvent.click(triggerBtn);

    const searchInput = screen.getByPlaceholderText(/Gõ tên tỉnh thành/i);
    // Gõ không dấu "bac ninh"
    fireEvent.change(searchInput, { target: { value: "bac ninh" } });

    // "Bắc Ninh" phải xuất hiện, các tỉnh khác không khớp phải bị ẩn
    expect(screen.getByText("Bắc Ninh")).toBeDefined();
    expect(screen.queryByText("Cần Thơ")).toBeNull();
  });

  it("gọi onChange khi người dùng bấm chọn một tỉnh thành", () => {
    const handleChange = vi.fn();
    render(<SearchableProvinceCombobox onChange={handleChange} />);

    const triggerBtn = screen.getByRole("button");
    fireEvent.click(triggerBtn);

    const haNoiOption = screen.getByText("Hà Nội");
    fireEvent.click(haNoiOption);

    expect(handleChange).toHaveBeenCalledWith("Hà Nội");
  });
});
