import React from "react";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import AdminSystemConfigPage from "./page";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/system-config",
  useSearchParams: () => new URLSearchParams(),
}));

describe("T070 [FE-SystemConfig] BACLINK System Config & SLA Form Verification (CR-BACLINK-007)", () => {
  it("renders BACLINK SLA settings, office hours inputs and action buttons with zero Sở/Tầng 0/NacenTwin remnants", () => {
    const { container } = render(<AdminSystemConfigPage />);

    expect(screen.getByText("Cấu Hình Tham Số & SLA Hệ Thống")).toBeInTheDocument();
    expect(screen.getByText("Tham Số SLA Phê Duyệt Hồ Sơ Hiệp Hội")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Lưu Cấu Hình/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mặc Định/i })).toBeInTheDocument();

    expect(screen.getByDisplayValue("08:00")).toBeInTheDocument();
    expect(screen.getByDisplayValue("17:00")).toBeInTheDocument();
    expect(screen.getByDisplayValue("20")).toBeInTheDocument();

    const text = container.textContent || "";
    expect(text).not.toMatch(/Cấp Sở|Lãnh đạo Sở|Tầng 0|34 tỉnh|Bộ KH&CN|TT17|NacenTwin|NacenTech/i);
  });

  it("changes SLA threshold and saves configuration to baclink_system_config", async () => {
    render(<AdminSystemConfigPage />);

    const slaSelect = screen.getByDisplayValue(/72 giờ làm việc/i);
    fireEvent.change(slaSelect, { target: { value: "48" } });

    const saveButton = screen.getByRole("button", { name: /Lưu Cấu Hình/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Đã lưu thành công cấu hình tham số/i)).toBeInTheDocument();
    });

    const saved = JSON.parse(localStorage.getItem("baclink_system_config") || "{}");
    expect(saved.slaBaseHours).toBe(48);
  });

  it("validates minimum reason character threshold", async () => {
    render(<AdminSystemConfigPage />);

    const minCharsInput = screen.getByDisplayValue("20");
    fireEvent.change(minCharsInput, { target: { value: "5" } });

    const saveButton = screen.getByRole("button", { name: /Lưu Cấu Hình/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Độ dài tối thiểu lý do giải trình phải từ 10 ký tự trở lên/i)).toBeInTheDocument();
    });
  });

  it("validates that officeHoursStart must be earlier than officeHoursEnd", async () => {
    render(<AdminSystemConfigPage />);

    const startInput = screen.getByDisplayValue("08:00");
    fireEvent.change(startInput, { target: { value: "18:00" } });

    const saveButton = screen.getByRole("button", { name: /Lưu Cấu Hình/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Giờ bắt đầu làm việc phải nhỏ hơn giờ kết thúc làm việc/i)).toBeInTheDocument();
    });
  });
});
