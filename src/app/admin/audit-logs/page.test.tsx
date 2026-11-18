import React from "react";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import AdminAuditLogsPage from "./page";

const mockAuditLogs = [
  {
    id: "LOG-2026-001",
    createdAt: "2026-10-26T08:45:12Z",
    actorName: "Nguyễn Văn Hùng",
    actorRole: "ADMIN",
    provinceCode: "KCN_VSIP_BN",
    action: "OVERRIDE_APPROVE",
    targetTitle: "PGS.TS Trần Mạnh Cương (Hồ sơ Cố vấn kỹ thuật)",
    targetType: "EXPERT",
    reason: "Phê duyệt đặc cách bởi Ban Quản trị Hiệp hội BACLINK Bắc Ninh",
    ipAddress: "14.238.102.45",
  },
  {
    id: "LOG-2026-002",
    createdAt: "2026-10-26T07:30:00Z",
    actorName: "Lê Thị Thảo",
    actorRole: "ADMIN",
    provinceCode: "KCN_YEN_PHONG",
    action: "APPROVED",
    targetTitle: "Công ty CP Cơ khí Chính xác Yên Phong (Hồ sơ Hội viên)",
    targetType: "SHOP",
    reason: "ĐKKD và năng lực sản xuất hợp lệ đạt chuẩn Hội viên BACLINK",
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

describe("T069 [FE-AuditLogs] BACLINK Audit Logs Data Table Verification (CR-BACLINK-007)", () => {
  it("renders live audit log records, filters and export button with zero Sở/Tầng 0/NacenTwin remnants", async () => {
    const { container } = render(<AdminAuditLogsPage />);

    expect(screen.getByText("Nhật Ký Kiểm Toán Hệ Thống BACLINK (Audit Logs)")).toBeInTheDocument();
    expect(screen.getByText("Xuất File CSV / Excel")).toBeInTheDocument();

    expect(await screen.findByText("Thời Gian")).toBeInTheDocument();
    expect(screen.getByText("Tác Nhân Thực Thi")).toBeInTheDocument();
    expect(screen.getByText("Địa Bàn")).toBeInTheDocument();
    expect(screen.getByText("Hành Vi Thao Tác")).toBeInTheDocument();
    expect(screen.getByText("Hồ Sơ / Chủ Thể")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Hùng")).toBeInTheDocument();
      expect(screen.getByText("Lê Thị Thảo")).toBeInTheDocument();
    });

    const text = container.textContent || "";
    expect(text).not.toMatch(/Sở KH&CN|Tầng 0|TT17|ĐMST|NacenTwin|NacenTech/i);
  });

  it("filters audit log records by search query keyword", async () => {
    render(<AdminAuditLogsPage />);

    const searchInput = screen.getByPlaceholderText(/Tìm theo tên quản trị viên, hồ sơ/i);
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
      expect(screen.getAllByText("Phê Duyệt Đặc Cách").length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText("Lê Thị Thảo")).not.toBeInTheDocument();
    });
  });

  it("exports CSV with baclink_audit_logs_*.csv filename", async () => {
    const createObjectURLMock = vi.fn().mockReturnValue("blob:http://localhost/test-csv");
    vi.stubGlobal("URL", {
      createObjectURL: createObjectURLMock,
      revokeObjectURL: vi.fn(),
    });
    const appendSpy = vi.spyOn(document.body, "appendChild");

    render(<AdminAuditLogsPage />);
    await waitFor(() => expect(screen.getByText("Nguyễn Văn Hùng")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Xuất File CSV / Excel"));

    const appendedLink = appendSpy.mock.calls.find(
      ([node]) => (node as HTMLElement).tagName === "A"
    )?.[0] as HTMLAnchorElement | undefined;
    expect(appendedLink).toBeDefined();
    expect(appendedLink?.getAttribute("download")).toMatch(/^baclink_audit_logs_\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it("opens modal detail view when clicking 'Chi tiết'", async () => {
    render(<AdminAuditLogsPage />);

    await waitFor(() => {
      expect(screen.getByText("Nguyễn Văn Hùng")).toBeInTheDocument();
    });

    const detailButtons = screen.getAllByRole("button", { name: /Chi tiết/i });
    fireEvent.click(detailButtons[0]);

    expect(screen.getByText(/Chi Tiết Vết Kiểm Toán/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Phê duyệt đặc cách bởi Ban Quản trị Hiệp hội BACLINK/i).length).toBeGreaterThanOrEqual(1);

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
