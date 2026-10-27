import React from "react";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import AdminAuditLogsPage from "./page";

const mockAuditLogs = [
  {
    id: "LOG-2026-001",
    createdAt: "2026-10-26T08:45:12Z",
    actorName: "Nguyễn Văn Hùng",
    actorRole: "SUPER_ADMIN",
    provinceCode: "HN",
    action: "OVERRIDE_APPROVE",
    targetTitle: "PGS.TS Trần Mạnh Cương (Lý lịch khoa học)",
    targetType: "EXPERT",
    reason: "Thực thi can thiệp vượt cấp Tầng 0 theo Công văn chỉ đạo số 142/BKHCN-ĐMST",
    ipAddress: "14.238.102.45",
  },
  {
    id: "LOG-2026-002",
    createdAt: "2026-10-26T07:30:00Z",
    actorName: "Lê Thị Thảo",
    actorRole: "PROVINCIAL_ADMIN",
    provinceCode: "SG",
    action: "APPROVED",
    targetTitle: "Công ty CP Giải pháp Năng lượng Xanh SG (Gian hàng)",
    targetType: "SHOP",
    reason: "ĐKKD và năng lực tài chính hợp lệ đạt chuẩn Sàn giao dịch",
    ipAddress: "115.79.201.88",
  },
];

beforeEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ success: true, data: mockAuditLogs }),
    }))
  );
});

afterEach(() => {
  cleanup();
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/audit-logs",
  useSearchParams: () => new URLSearchParams(),
}));

describe("T069 [FE-AuditLogs] Interactive Audit Logs Data Table Verification", () => {
  it("renders live audit log records, filters and export button", async () => {
    render(<AdminAuditLogsPage />);

    expect(screen.getByText("Nhật Ký Kiểm Toán Toàn Quốc (Audit Logs)")).toBeInTheDocument();
    expect(screen.getByText("Xuất File CSV / Excel")).toBeInTheDocument();

    // Table columns
    expect(await screen.findByText("Thời Gian")).toBeInTheDocument();
    expect(screen.getByText("Tác Nhân Thực Thi")).toBeInTheDocument();
    expect(screen.getByText("Địa Bàn")).toBeInTheDocument();
    expect(screen.getByText("Hành Vi Thao Tác")).toBeInTheDocument();
    expect(screen.getByText("Hồ Sơ / Chủ Thể")).toBeInTheDocument();

    // Records visible
    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Hùng")).toBeInTheDocument();
      expect(screen.getByText("Lê Thị Thảo")).toBeInTheDocument();
    });
  });

  it("filters audit log records by search query keyword", async () => {
    render(<AdminAuditLogsPage />);

    const searchInput = screen.getByPlaceholderText(/Tìm theo tên cán bộ, hồ sơ/i);
    fireEvent.change(searchInput, { target: { value: "Nguyễn Văn Hùng" } });

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Hùng")).toBeInTheDocument();
      expect(screen.queryByText("Lê Thị Thảo")).not.toBeInTheDocument();
    });
  });

  it("filters audit log records by action dropdown", async () => {
    render(<AdminAuditLogsPage />);

    const select = screen.getByDisplayValue("Tất cả hành vi");
    fireEvent.change(select, { target: { value: "OVERRIDE_APPROVE" } });

    await waitFor(() => {
      expect(screen.getByText("Can Thiệp Tầng 0")).toBeInTheDocument();
      expect(screen.queryByText("Lê Thị Thảo")).not.toBeInTheDocument();
    });
  });

  it("opens modal detail view when clicking 'Chi tiết'", async () => {
    render(<AdminAuditLogsPage />);

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Hùng")).toBeInTheDocument();
    });

    const detailButtons = screen.getAllByRole("button", { name: /Chi tiết/i });
    fireEvent.click(detailButtons[0]);

    // Modal opens
    expect(screen.getByText(/Chi Tiết Vết Kiểm Toán/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Thực thi can thiệp vượt cấp Tầng 0/i).length).toBeGreaterThanOrEqual(1);

    // Close modal
    fireEvent.click(screen.getByRole("button", { name: "✕" }));
    expect(screen.queryByText(/Chi Tiết Vết Kiểm Toán/i)).not.toBeInTheDocument();
  });

  it("enforces Zero-Mock by showing empty state when backend returns 0 logs without seed fallback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      })
    );

    render(<AdminAuditLogsPage />);

    expect(
      await screen.findByText(/Không tìm thấy nhật ký kiểm toán phù hợp/i)
    ).toBeInTheDocument();
    expect(screen.queryByText("Nguyễn Văn Hùng")).not.toBeInTheDocument();
  });
});
