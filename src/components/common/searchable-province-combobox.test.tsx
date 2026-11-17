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

describe("SearchableProvinceCombobox Unit Tests (Bac Ninh Areas & KCNs)", () => {
  it("hàm removeVietnameseDiacritics loại bỏ dấu tiếng Việt chính xác", () => {
    expect(removeVietnameseDiacritics("TP. Bắc Ninh")).toBe("tp. bac ninh");
    expect(removeVietnameseDiacritics("H. Yên Phong")).toBe("h. yen phong");
    expect(removeVietnameseDiacritics("TX. Thuận Thành")).toBe("tx. thuan thanh");
    expect(removeVietnameseDiacritics("TP. Từ Sơn")).toBe("tp. tu son");
    expect(removeVietnameseDiacritics("KCN Đại Đồng - Hoàn Sơn")).toBe("kcn dai dong - hoan son");
  });

  it("render nút bấm với placeholder mặc định Địa bàn / KCN Bắc Ninh khi chưa chọn", () => {
    render(<SearchableProvinceCombobox onChange={vi.fn()} />);
    expect(screen.getByText("Tất cả Địa bàn / KCN Bắc Ninh")).toBeDefined();
  });

  it("mở popover danh sách 8+1 Địa bàn & KCN Bắc Ninh khi bấm vào nút (không còn 34 tỉnh)", () => {
    render(<SearchableProvinceCombobox onChange={vi.fn()} />);
    const triggerBtn = screen.getByRole("button");
    fireEvent.click(triggerBtn);

    const searchInput = screen.getByPlaceholderText(/Gõ tên địa bàn, KCN/i);
    expect(searchInput).toBeDefined();

    expect(screen.getByText("TP. Bắc Ninh")).toBeDefined();
    expect(screen.getByText("H. Yên Phong")).toBeDefined();
    expect(screen.getByText("KCN VSIP Bắc Ninh")).toBeDefined();
    expect(screen.getByText("KCN Yên Phong I")).toBeDefined();
    expect(screen.queryByText("Hà Nội")).toBeNull();
    expect(screen.queryByText("Đà Nẵng")).toBeNull();
  });

  it("lọc chính xác địa bàn và KCN khi gõ tiếng Việt KHÔNG DẤU", () => {
    render(<SearchableProvinceCombobox onChange={vi.fn()} />);
    const triggerBtn = screen.getByRole("button");
    fireEvent.click(triggerBtn);

    const searchInput = screen.getByPlaceholderText(/Gõ tên địa bàn, KCN/i);
    fireEvent.change(searchInput, { target: { value: "yen phong" } });

    expect(screen.getByText("H. Yên Phong")).toBeDefined();
    expect(screen.getByText("KCN Yên Phong I")).toBeDefined();
    expect(screen.queryByText("TP. Từ Sơn")).toBeNull();
  });

  it("gọi onChange khi người dùng bấm chọn một Địa bàn hoặc KCN Bắc Ninh", () => {
    const handleChange = vi.fn();
    render(<SearchableProvinceCombobox onChange={handleChange} />);

    const triggerBtn = screen.getByRole("button");
    fireEvent.click(triggerBtn);

    const vsipOption = screen.getByText("KCN VSIP Bắc Ninh");
    fireEvent.click(vsipOption);

    expect(handleChange).toHaveBeenCalledWith("KCN VSIP Bắc Ninh");
  });
});
