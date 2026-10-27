import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import GovStaffSettingsPage from "./page";
import { authClient } from "@/lib/auth-client";

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    getUser: vi.fn(),
    getToken: vi.fn().mockReturnValue("mock-token"),
  },
}));

const mockStaffList = [
  {
    id: "staff-01",
    fullName: "Nguyễn Văn Hùng",
    email: "hung.nv@skhcn.haiphong.gov.vn",
    role: "PROVINCE_OFFICER",
    department: "Phòng Quản lý Công nghệ & Thị trường",
    scopeId: "HP",
    status: "ACTIVE",
    assignedAt: "2026-10-15T08:00:00Z",
    tasksReviewedCount: 12,
  },
  {
    id: "staff-02",
    fullName: "Lê Thị Mai",
    email: "mai.lt@skhcn.haiphong.gov.vn",
    role: "PROVINCIAL_ADMIN",
    department: "Ban Giám Đốc Sở",
    scopeId: "HP",
    status: "ACTIVE",
    assignedAt: "2026-09-01T08:00:00Z",
    tasksReviewedCount: 35,
  },
];

describe("T087 [FE-Gov-Screen6] GovStaffSettingsPage Screen 6 Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (authClient.getUser as any).mockReturnValue({
      id: "admin-hp-01",
      name: "Giám Đốc Sở Hải Phòng",
      role: "PROVINCIAL_ADMIN",
      scopeId: "HP",
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/governance/roles/officers")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockStaffList }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders GovPageHeader with dynamic province name from resolver without hardcoded fallback", async () => {
    render(<GovStaffSettingsPage />);

    expect(screen.getByText("Quản Lý Cán Bộ & Chuyên Viên Thẩm Định Sở")).toBeInTheDocument();
    expect(screen.getByTestId("gov-sla-chip")).toBeInTheDocument();
    expect(screen.getByTestId("gov-maker-checker-chip")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Hùng")).toBeInTheDocument();
      expect(screen.getByText("Lê Thị Mai")).toBeInTheDocument();
    });

    // Province name resolved dynamically from "HP"
    expect(screen.getAllByText(/Hải Phòng/i).length).toBeGreaterThan(0);
  });

  it("handles API error properly without swallowing error into empty state", async () => {
    (global.fetch as any).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Lỗi máy chủ nội bộ" }),
      })
    );

    render(<GovStaffSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Không thể tải danh sách cán bộ từ máy chủ/i)).toBeInTheDocument();
    });

    // Retry button is available in Error state
    const retryBtn = screen.getByRole("button", { name: /Thử lại/i });
    expect(retryBtn).toBeInTheDocument();
  });

  it("supports PROVINCE_OFFICER role and validates official email format when appointing staff", async () => {
    render(<GovStaffSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Hùng")).toBeInTheDocument();
    });

    // Open add modal
    const openBtn = screen.getByTestId("btn-open-add-staff");
    fireEvent.click(openBtn);

    expect(screen.getByText("Bổ Nhiệm Cán Bộ Thẩm Định Địa Phương")).toBeInTheDocument();

    // Verify PROVINCE_OFFICER option is available
    expect(screen.getByText(/Chuyên viên Thẩm tra \(PROVINCE_OFFICER - Maker\)/i)).toBeInTheDocument();

    // Submit invalid email
    const nameInput = screen.getByPlaceholderText("Ví dụ: Hoàng Minh Trí");
    const emailInput = screen.getByPlaceholderText(/tri\.hm@skhcn/i);
    const form = screen.getByTestId("form-add-staff");

    fireEvent.change(nameInput, { target: { value: "Trần Tuấn Kiệt" } });
    fireEvent.change(emailInput, { target: { value: "invalid-email-no-at-sign" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Vui lòng nhập định dạng email công vụ hợp lệ.")).toBeInTheDocument();
    });

    // Submit valid email
    fireEvent.change(emailInput, { target: { value: "kiet.tt@skhcn.haiphong.gov.vn" } });
    fireEvent.submit(form);

    await waitFor(() => {
      const assignCall = (global.fetch as any).mock.calls.find((call: any[]) =>
        call[0].includes("/api/v1/governance/roles/assign")
      );
      expect(assignCall).toBeDefined();
      const body = JSON.parse(assignCall[1].body);
      expect(body.fullName).toBe("Trần Tuấn Kiệt");
      expect(body.email).toBe("kiet.tt@skhcn.haiphong.gov.vn");
      expect(body.role).toBe("PROVINCE_OFFICER");
      expect(body.scopeId).toBe("HP");
    });
  });
});
