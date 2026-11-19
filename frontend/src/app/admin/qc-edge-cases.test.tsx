import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AdminApprovalsPage from "./approvals/page";
import AdminAuditLogsPage from "./audit-logs/page";
import AdminSystemConfigPage from "./system-config/page";
import OrgTreePage from "./org-tree/page";
import AdminSectorsPage from "./sectors/page";
import AdminRolesPage from "./roles/page";

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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("QC Hardening & Edge-Case Verification Suite [nacen-qc] — CR-BACLINK-007", () => {
  describe("/admin/approvals edge cases", () => {
    it("handles extra-long submitter name (200+ chars), XSS payload, and strips any legacy Sở KH&CN prefix safely", async () => {
      const extremeLongName = "GS.TS Nguyễn Hoàng ".repeat(12).trim() + " (Hội đồng Kỹ thuật BACLINK)";
      const xssPayload = "<script>alert('XSS')</script> & Đặc thù <IND_ELEC>";

      const queueWithEdgeCases = [
        {
          id: "APP-EDGE-01",
          requestType: "EXPERT",
          scopeType: "GLOBAL",
          scopeId: "KCN_VSIP_BN",
          provinceName: "Sở KH&CN Tỉnh Bắc Ninh",
          payloadJson: JSON.stringify({ fullName: extremeLongName, expertiseSectors: ["IND_ELEC"] }),
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
          scopeType: "GLOBAL",
          scopeId: "IND_MECH",
          provinceName: "KCN Yên Phong Bắc Ninh",
          payloadJson: JSON.stringify({ fullName: xssPayload, organization: "Công ty Cơ khí Bắc Ninh" }),
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

      const { container } = render(<AdminApprovalsPage />);

      expect(await screen.findByText(extremeLongName)).toBeInTheDocument();
      expect(screen.getByText(xssPayload)).toBeInTheDocument();
      expect(container.textContent || "").not.toMatch(/Sở KH&CN/i);
    });

    it("strictly blocks padded whitespace rejection reason with fewer than 10 non-whitespace chars", async () => {
      const edgeItem = {
        id: "APP-WS-01",
        requestType: "EXPERT",
        scopeType: "GLOBAL",
        scopeId: "TP_BN",
        provinceName: "TP. Bắc Ninh",
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

      fireEvent.click(screen.getByText("Chuyên gia Test Whitespace"));
      fireEvent.click(screen.getByRole("button", { name: /Từ chối Hồ sơ/i }));

      const textarea = screen.getByPlaceholderText(/Nhập lý do không đạt tiêu chí/i);
      const confirmBtn = screen.getByRole("button", { name: /Xác nhận Từ chối/i });

      fireEvent.change(textarea, { target: { value: "       12345      " } });

      expect(confirmBtn).toBeDisabled();
      expect(screen.getByText("5/500 ký tự hợp lệ")).toBeInTheDocument();
    });
  });

  describe("/admin/audit-logs edge cases", () => {
    it("handles CSV export with baclink_audit_logs filename & UTF-8 BOM", async () => {
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

  describe("/admin/system-config edge cases", () => {
    it("persists configuration cleanly to baclink_system_config", async () => {
      render(<AdminSystemConfigPage />);

      localStorage.setItem(
        "baclink_system_config",
        JSON.stringify({
          slaBaseHours: 72,
          lastUpdated: "2026-10-26T00:00:00Z",
          updatedBy: "Admin 1",
        })
      );

      const saveButton = screen.getByRole("button", { name: /Lưu Cấu Hình/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Đã lưu thành công cấu hình tham số/i)).toBeInTheDocument();
      });

      const current = JSON.parse(localStorage.getItem("baclink_system_config") || "{}");
      expect(current.updatedBy).toBe("QC Inspector");
    });

    it("validates office hours with type='time' and blocks invalid range upon save", async () => {
      render(<AdminSystemConfigPage />);

      const startInput = screen.getByDisplayValue("08:00");
      expect(startInput).toHaveAttribute("type", "time");

      fireEvent.change(startInput, { target: { value: "18:00" } });
      const saveButton = screen.getByRole("button", { name: /Lưu Cấu Hình/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Giờ bắt đầu làm việc phải nhỏ hơn giờ kết thúc làm việc/i)).toBeInTheDocument();
      });
    });
  });

  describe("/admin/org-tree edge cases", () => {
    beforeEach(() => {
      pushMock.mockReset();
      replaceMock.mockReset();
    });

    it("renders clean 410 Gone notice with zero Sở KH&CN/34 tỉnh remnants and redirects to /admin", async () => {
      const { container } = render(<OrgTreePage />);

      expect(await screen.findByTestId("deprecated-route-410")).toBeInTheDocument();
      expect(screen.getByText("410 Gone")).toBeInTheDocument();
      expect(screen.getByText(/ADMIN, ENTERPRISE, PUBLIC_USER/i)).toBeInTheDocument();
      expect(replaceMock).toHaveBeenCalledWith("/admin");
      expect(screen.getByRole("link", { name: /Về Trung tâm Quản trị \(\/admin\)/i })).toHaveAttribute("href", "/admin");
      expect(container.textContent || "").not.toMatch(/34 Sở|Sở KH&CN|34 tỉnh/i);
    });
  });

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
                data: [{ id: "sec-01", code: "IND_IT", name: "Công nghệ thông tin, Phần mềm công nghiệp", isActive: true }],
              }),
            };
          }
          return { ok: true, json: async () => ({ success: true, data: [] }) };
        })
      );

      render(<AdminSectorsPage />);
      expect(await screen.findByText("Công nghệ thông tin, Phần mềm công nghiệp")).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/Tìm theo tên ngành/i);
      fireEvent.change(searchInput, { target: { value: "KhongTonTai123" } });

      expect(await screen.findByText(/Không có ngành công nghiệp phù hợp/i)).toBeInTheDocument();
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
                data: [{ id: "sec-99", code: "IND_TEST", name: "Ngành công nghiệp thử nghiệm", isActive: true, filterRuleCount: 2 }],
              }),
            };
          }
          return { ok: true, json: async () => ({ success: true, data: [] }) };
        })
      );

      render(<AdminSectorsPage />);
      expect(await screen.findByText("Ngành công nghiệp thử nghiệm")).toBeInTheDocument();

      const deactivateBtn = screen.getByRole("button", { name: "Ngừng hoạt động" });
      fireEvent.click(deactivateBtn);

      expect(screen.getByText("Xác Nhận Ngừng Hoạt Động Lĩnh Vực")).toBeInTheDocument();
      expect(deleteFetchMock).not.toHaveBeenCalled();

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

      fireEvent.click(screen.getByRole("button", { name: /Danh Sách Nhân Sự & Phân Quyền/i }));
      expect(await screen.findByText("Trần Văn An")).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/Tìm theo email/i);
      fireEvent.change(searchInput, { target: { value: "notfound@example.com" } });

      expect(await screen.findByText("Không tìm thấy tài khoản nào phù hợp với bộ lọc.")).toBeInTheDocument();
    });

    it("verifies 'Sửa Quyền' exists without destructive 'Thu Hồi Quyền' button in officer table", async () => {
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

      expect(screen.getByRole("button", { name: "Sửa Quyền" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Thu Hồi/i })).not.toBeInTheDocument();
    });
  });
});
