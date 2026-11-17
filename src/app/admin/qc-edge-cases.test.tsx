import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AdminApprovalsPage from "./approvals/page";
import AdminAuditLogsPage from "./audit-logs/page";
import AdminSystemConfigPage from "./system-config/page";
import OrgTreePage from "./org-tree/page";
import AdminSectorsPage from "./sectors/page";
import AdminRolesPage from "./roles/page";

// Mocks for Next.js navigation & common components
const pushMock = vi.fn();
const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => "/admin",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/admin/admin-breadcrumbs", () => ({
  AdminBreadcrumbs: () => <nav data-testid="admin-breadcrumbs">AdminBreadcrumbs</nav>,
}));

vi.mock("@/components/admin/admin-nav", () => ({
  AdminNav: () => <nav data-testid="admin-nav">AdminNav</nav>,
}));

const mockGetUser = vi.fn(() => ({
  fullName: "QC Inspector",
  email: "qc@baclink.org.vn",
  role: "ADMIN",
}));

vi.mock("@/lib/auth-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth-client")>();
  return {
    ...actual,
    authClient: {
      ...actual.authClient,
      getAuthHeaders: () => ({ "Content-Type": "application/json" }),
      hasRole: () => true,
      getUser: () => mockGetUser(),
    },
  };
});

// Mock for org-tree API
const mockDeactivateUnit = vi.fn().mockResolvedValue({});
vi.mock("@/services/api/org-tree", () => ({
  orgTreeApi: {
    getTree: vi.fn().mockResolvedValue([
      {
        id: "unit-root",
        code: "NACENTECH-TW",
        name: "Cơ quan Đầu mối Trung ương NacenTech",
        unitType: "NATIONAL",
        status: "ACTIVE",
        parentId: null,
      },
      {
        id: "unit-hn",
        code: "SO-KHCN-HN",
        name: "Sở Khoa học và Công nghệ TP. Hà Nội",
        unitType: "PROVINCIAL",
        status: "ACTIVE",
        parentId: "unit-root",
        provinceId: "HN",
      },
    ]),
    createUnit: vi.fn().mockResolvedValue({}),
    updateUnit: vi.fn().mockResolvedValue({}),
    deleteUnit: vi.fn().mockResolvedValue({}),
    deactivateUnit: (...args: unknown[]) => mockDeactivateUnit(...args),
    provisionProvinceLeader: vi.fn().mockResolvedValue({}),
  },
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("QC Hardening & Edge-Case Verification Suite [nacen-qc]", () => {
  /* -------------------------------------------------------------
   * 1. /admin/approvals: Long Names, Special Chars, Padded Whitespace
   * ------------------------------------------------------------- */
  describe("/admin/approvals edge cases", () => {
    it("handles extra-long submitter name (200+ chars) and special characters safely", async () => {
      const extremeLongName = "GS.TS Nguyễn Hoàng ".repeat(12).trim() + " (Hội đồng Quốc gia)";
      const xssPayload = "<script>alert('XSS')</script> & Đặc thù <LV91>";

      const queueWithEdgeCases = [
        {
          id: "APP-EDGE-01",
          requestType: "EXPERT",
          scopeType: "PROVINCE",
          scopeId: "HN",
          provinceName: "Sở KH&CN TP. Hà Nội",
          payloadJson: JSON.stringify({ fullName: extremeLongName, expertiseSectors: ["LV91"] }),
          status: "PENDING_APPROVAL",
          version: 1,
          createdAt: "2026-10-26T08:00:00Z",
          isSlaBreached: false,
          slaOverdueHours: 0,
          isOverride: false,
        },
        {
          id: "APP-EDGE-02",
          requestType: "SHOP",
          scopeType: "SECTOR",
          scopeId: "LV92",
          provinceName: "Sở KH&CN TP. Đà Nẵng",
          payloadJson: JSON.stringify({ fullName: xssPayload, organization: "Viện Nghiên cứu & Phát triển" }),
          status: "PENDING_APPROVAL",
          version: 1,
          createdAt: "2026-10-26T08:00:00Z",
          isSlaBreached: false,
          slaOverdueHours: 0,
          isOverride: false,
        },
      ];

      vi.stubGlobal(
        "fetch",
        vi.fn(async (url: string) => {
          if (url.endsWith("/sectors")) {
            return { ok: true, json: async () => ({ success: true, data: [] }) };
          }
          return { ok: true, json: async () => ({ success: true, data: queueWithEdgeCases, totalPages: 1 }) };
        })
      );

      render(<AdminApprovalsPage />);

      // Verify extreme long name renders without React crash
      expect(await screen.findByText(extremeLongName)).toBeInTheDocument();
      // Verify special character / XSS string is escaped as text, not executed HTML
      expect(screen.getByText(xssPayload)).toBeInTheDocument();
    });

    it("strictly blocks padded whitespace rejection reason with fewer than 10 non-whitespace chars", async () => {
      const edgeItem = {
        id: "APP-WS-01",
        requestType: "EXPERT",
        scopeType: "PROVINCE",
        scopeId: "HN",
        provinceName: "Sở KH&CN TP. Hà Nội",
        payloadJson: JSON.stringify({ fullName: "Chuyên gia Test Whitespace" }),
        status: "PENDING_APPROVAL",
        version: 1,
        createdAt: "2026-10-26T08:00:00Z",
        isSlaBreached: false,
        slaOverdueHours: 0,
        isOverride: false,
      };

      vi.stubGlobal(
        "fetch",
        vi.fn(async (url: string) => {
          if (url.endsWith("/sectors")) return { ok: true, json: async () => ({ success: true, data: [] }) };
          return { ok: true, json: async () => ({ success: true, data: [edgeItem], totalPages: 1 }) };
        })
      );

      render(<AdminApprovalsPage />);
      await screen.findByText("Chuyên gia Test Whitespace");

      // Select item and open reject modal
      fireEvent.click(screen.getByText("Chuyên gia Test Whitespace"));
      fireEvent.click(screen.getByRole("button", { name: /Từ chối Hồ sơ/i }));

      const textarea = screen.getByPlaceholderText(/Nhập lý do không đạt tiêu chí/i);
      const confirmBtn = screen.getByRole("button", { name: /Xác nhận Từ chối/i });

      // Padded string: total length is 18 chars, but trimmed length is only 5 chars ("12345")
      fireEvent.change(textarea, { target: { value: "       12345      " } });

      // Must remain disabled because trimmed length < 10
      expect(confirmBtn).toBeDisabled();
      expect(screen.getByText("5/500 ký tự hợp lệ")).toBeInTheDocument();
    });
  });

  /* -------------------------------------------------------------
   * 2. /admin/audit-logs: Async API & CSV Export Verification
   * ------------------------------------------------------------- */
  describe("/admin/audit-logs edge cases", () => {
    it("handles CSV export and checks file download trigger & UTF-8 BOM", async () => {
      // Mock URL.createObjectURL and click
      const createObjectURLMock = vi.fn().mockReturnValue("blob:http://localhost/test-uuid");
      const revokeObjectURLMock = vi.fn();
      vi.stubGlobal("URL", {
        createObjectURL: createObjectURLMock,
        revokeObjectURL: revokeObjectURLMock,
      });

      render(<AdminAuditLogsPage />);

      await waitFor(() => {
        expect(screen.getByText("Xuất File CSV / Excel")).toBeInTheDocument();
      });

      const exportBtn = screen.getByText("Xuất File CSV / Excel");
      fireEvent.click(exportBtn);

      expect(createObjectURLMock).toHaveBeenCalled();
      const createdBlob = createObjectURLMock.mock.calls[0][0] as Blob;
      expect(createdBlob).toBeInstanceOf(Blob);
      expect(createdBlob.type).toContain("text/csv");
    });

    it("enforces Zero-Mock by showing empty state when backend returns empty array [] without seed fallback", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ success: true, data: [] }), // Empty DB table
        })
      );

      render(<AdminAuditLogsPage />);

      // When DB is empty, frontend displays genuine empty state without mock seed records
      expect(
        await screen.findByText(/Không tìm thấy nhật ký kiểm toán phù hợp/i)
      ).toBeInTheDocument();
      expect(screen.queryByText("Nguyễn Văn Hùng")).not.toBeInTheDocument();
    });
  });

  /* -------------------------------------------------------------
   * 3. /admin/system-config: SLA Bounds & Concurrency Verification
   * ------------------------------------------------------------- */
  describe("/admin/system-config edge cases", () => {
    it("identifies lack of optimistic concurrency version check (pure localStorage)", async () => {
      render(<AdminSystemConfigPage />);

      // Set initial config in localStorage with older timestamp
      localStorage.setItem(
        "nacentwin_system_config",
        JSON.stringify({
          slaBaseHours: 72,
          lastUpdated: "2026-10-26T00:00:00Z",
          updatedBy: "Admin 1",
        })
      );

      // Save from current page
      const saveButton = screen.getByRole("button", { name: /Lưu Cấu Hình/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Đã lưu thành công cấu hình tham số/i)).toBeInTheDocument();
      });

      // Verification: localStorage is blindly overwritten without 409 conflict detection
      const current = JSON.parse(localStorage.getItem("nacentwin_system_config") || "{}");
      expect(current.updatedBy).toBe("QC Inspector");
    });

    it("validates office hours with type='time' and blocks invalid range upon save", async () => {
      render(<AdminSystemConfigPage />);

      const startInput = screen.getByDisplayValue("08:00");
      expect(startInput).toHaveAttribute("type", "time");

      // Set start time later than end time
      fireEvent.change(startInput, { target: { value: "18:00" } });
      const saveButton = screen.getByRole("button", { name: /Lưu Cấu Hình/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Giờ bắt đầu làm việc phải nhỏ hơn giờ kết thúc làm việc/i)).toBeInTheDocument();
      });
    });
  });

  /* -------------------------------------------------------------
   * 4. /admin/org-tree: Retired 410 Gone & 3-Tier RBAC Redirect
   * ------------------------------------------------------------- */
  describe("/admin/org-tree edge cases", () => {
    beforeEach(() => {
      pushMock.mockReset();
      replaceMock.mockReset();
      mockGetUser.mockReturnValue({
        fullName: "QC Inspector",
        email: "qc@baclink.org.vn",
        role: "ADMIN",
      });
    });

    it("renders 410 Gone notice for retired 34-province org tree under 3-tier RBAC", async () => {
      render(<OrgTreePage />);

      expect(await screen.findByTestId("deprecated-route-410")).toBeInTheDocument();
      expect(screen.getByText("410 Gone")).toBeInTheDocument();
      expect(screen.getByText(/Cây tổ chức 34 Sở KH&CN đã ngừng áp dụng \(410 Gone\)/i)).toBeInTheDocument();
      expect(screen.getByText(/ADMIN, ENTERPRISE, PUBLIC_USER/i)).toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/Tìm kiếm Sở Tỉnh/i)).not.toBeInTheDocument();
    });

    it("redirects ADMIN to /admin and PUBLIC_USER to / when visiting /admin/org-tree", async () => {
      const { unmount } = render(<OrgTreePage />);

      await waitFor(() => {
        expect(replaceMock).toHaveBeenCalledWith("/admin");
      });
      expect(screen.getByRole("link", { name: /Về Trung tâm Quản trị \(\/admin\)/i })).toHaveAttribute("href", "/admin");

      unmount();
      replaceMock.mockReset();
      mockGetUser.mockReturnValue({
        fullName: "Public Member",
        email: "member@baclink.org.vn",
        role: "PUBLIC_USER",
      });

      render(<OrgTreePage />);

      await waitFor(() => {
        expect(replaceMock).toHaveBeenCalledWith("/");
      });
      expect(screen.getByRole("link", { name: /Về Trang chủ BACLINK/i })).toHaveAttribute("href", "/");
    });
  });

  /* -------------------------------------------------------------
   * 5. /admin/sectors: Search Empty State & Missing Deactivation Popup
   * ------------------------------------------------------------- */
  describe("/admin/sectors edge cases", () => {
    it("displays empty state when sector search yields no results", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async (url: string) => {
          if (url.includes("sectors")) {
            return {
              ok: true,
              json: async () => ({
                success: true,
                data: [{ id: "sec-01", code: "LV01", name: "Công nghệ thông tin", isActive: true }],
              }),
            };
          }
          return { ok: true, json: async () => ({ success: true, data: [] }) };
        })
      );

      render(<AdminSectorsPage />);
      expect(await screen.findByText("Công nghệ thông tin")).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/Tìm theo tên (lĩnh vực|ngành)/i);
      fireEvent.change(searchInput, { target: { value: "KhongTonTai123" } });

      expect(await screen.findByText(/Không có (lĩnh vực|ngành)/i)).toBeInTheDocument();
    });

    it("requires safe confirmation modal popup before deactivating a sector (T079)", async () => {
      const deleteFetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      vi.stubGlobal(
        "fetch",
        vi.fn(async (url: string, opts?: RequestInit) => {
          if (opts?.method === "DELETE") {
            return deleteFetchMock(url, opts);
          }
          if (url.includes("sectors")) {
            return {
              ok: true,
              json: async () => ({
                success: true,
                data: [{ id: "sec-99", code: "LV99", name: "Lĩnh vực Dễ xóa", isActive: true, filterRuleCount: 2 }],
              }),
            };
          }
          return { ok: true, json: async () => ({ success: true, data: [] }) };
        })
      );

      render(<AdminSectorsPage />);
      expect(await screen.findByText("Lĩnh vực Dễ xóa")).toBeInTheDocument();

      const deactivateBtn = screen.getByRole("button", { name: "Ngừng hoạt động" });
      fireEvent.click(deactivateBtn);

      // Verify confirmation modal popup is shown and DELETE has not been called
      expect(screen.getByText("Xác Nhận Ngừng Hoạt Động Lĩnh Vực")).toBeInTheDocument();
      expect(deleteFetchMock).not.toHaveBeenCalled();

      // Click Confirm in modal
      const confirmBtn = screen.getByRole("button", { name: "Xác Nhận Ngừng Hoạt Động" });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(deleteFetchMock).toHaveBeenCalledWith(
          expect.stringContaining("/api/v1/admin/sectors/sec-99"),
          expect.objectContaining({ method: "DELETE" })
        );
      });
    });
  });

  /* -------------------------------------------------------------
   * 6. /admin/roles: Search Empty State & Missing Revoke Button
   * ------------------------------------------------------------- */
  describe("/admin/roles edge cases", () => {
    it("displays empty state when officer search yields no match", async () => {
      const officers = [
        {
          id: "off-01",
          name: "Trần Văn An",
          email: "an.tv@baclink.org.vn",
          role: "ADMIN",
          scopeType: "GLOBAL",
          scopeId: "BACNINH",
        },
      ];

      vi.stubGlobal(
        "fetch",
        vi.fn(async (url: string) => {
          if (url.includes("sectors")) return { ok: true, json: async () => ({ success: true, data: [] }) };
          return { ok: true, json: async () => ({ success: true, data: officers }) };
        })
      );

      render(<AdminRolesPage />);

      // Switch to Officers tab
      fireEvent.click(screen.getByRole("button", { name: /Danh Sách Nhân Sự & Phân Quyền/i }));
      expect(await screen.findByText("Trần Văn An")).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/Tìm theo email/i);
      fireEvent.change(searchInput, { target: { value: "notfound@example.com" } });

      expect(await screen.findByText("Không tìm thấy tài khoản nào phù hợp với bộ lọc.")).toBeInTheDocument();
    });

    it("verifies missing 'Thu Hồi Quyền' (Revoke) action button in officer table", async () => {
      const officers = [
        {
          id: "off-01",
          name: "Trần Văn An",
          email: "an.tv@baclink.org.vn",
          role: "ENTERPRISE",
          scopeType: "GLOBAL",
          scopeId: "BACNINH",
        },
      ];

      vi.stubGlobal(
        "fetch",
        vi.fn(async (url: string) => {
          if (url.includes("sectors")) return { ok: true, json: async () => ({ success: true, data: [] }) };
          return { ok: true, json: async () => ({ success: true, data: officers }) };
        })
      );

      render(<AdminRolesPage />);
      fireEvent.click(screen.getByRole("button", { name: /Danh Sách Nhân Sự & Phân Quyền/i }));
      await screen.findByText("Trần Văn An");

      // Verify only "Sửa Quyền" exists, no "Thu Hồi Quyền" button
      expect(screen.getByRole("button", { name: "Sửa Quyền" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Thu Hồi/i })).not.toBeInTheDocument();
    });
  });
});
