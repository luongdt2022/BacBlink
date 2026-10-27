import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminSectorsPage from "./page";

vi.mock("@/components/admin/admin-nav", () => ({
  AdminNav: () => <nav data-testid="admin-nav">AdminNav</nav>,
}));

const rows = [{ code: "LV91", name: "Ngành runtime A", isActive: true }, { code: "LV92", name: "Ngành runtime B", isActive: false }];
vi.mock("@/lib/auth-client", () => ({ authClient: { getAuthHeaders: () => ({}) } }));
describe("Admin runtime sectors - mocked component regression", () => {
 beforeEach(() => { cleanup(); vi.restoreAllMocks(); vi.stubGlobal("fetch", vi.fn(async (url: string) => ({ ok: true, json: async () => ({ success: true, data: url.includes("sectors") ? rows : [] }) }))); });
 it("renders runtime names and active count instead of fixed ten", async () => { render(<AdminSectorsPage />); expect(await screen.findByText("Ngành runtime A")).toBeInTheDocument(); expect(screen.getByText("Ngành runtime B")).toBeInTheDocument(); expect(screen.getByRole("button", { name: /1 Lĩnh Vực hoạt động/ })).toBeInTheDocument(); });
 it("filters runtime names", async () => { render(<AdminSectorsPage />); await screen.findByText("Ngành runtime A"); fireEvent.change(screen.getByPlaceholderText(/Tìm theo tên lĩnh vực/), { target: { value: "runtime B" } }); expect(screen.getByText("Ngành runtime B")).toBeInTheDocument(); expect(screen.queryByText("Ngành runtime A")).not.toBeInTheDocument(); });
 it("empty response does not manufacture seed data", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: [] }) })); render(<AdminSectorsPage />); expect(await screen.findByText("Không có lĩnh vực phù hợp.")).toBeInTheDocument(); expect(screen.queryByText("LV01")).not.toBeInTheDocument(); });
 it("read error does not manufacture seed data", async () => { vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline"))); render(<AdminSectorsPage />); expect(await screen.findByText("Không tải được danh mục lĩnh vực.")).toBeInTheDocument(); expect(screen.queryByText("LV01")).not.toBeInTheDocument(); });
 it("network failure on create keeps form open without local row", async () => { render(<AdminSectorsPage />); await screen.findByText("Ngành runtime A"); fireEvent.click(screen.getByRole("button", { name: /Thêm Lĩnh Vực Mới/ })); fireEvent.change(screen.getByPlaceholderText(/VD: LV19/), { target: { value: "LV94" } }); fireEvent.change(screen.getByPlaceholderText(/VD: Năng Lượng/), { target: { value: "Ngành được tạo" } }); vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline"))); fireEvent.click(screen.getByRole("button", { name: "Lưu Lĩnh Vực" })); await waitFor(() => expect(screen.getByText("offline")).toBeInTheDocument()); expect(screen.getByRole("heading", { name: "Thêm Lĩnh Vực Mới" })).toBeInTheDocument(); expect(screen.queryByText("LV94")).not.toBeInTheDocument(); });
 it("opens safe confirmation dialog when deactivating sector and sends DELETE on confirmation (T079)", async () => {
  const rowsWithId = [{ id: "sec-91", code: "LV91", name: "Ngành runtime A", isActive: true, filterRuleCount: 3, tt17Code: "C26" }];
  const fetchSpy = vi.fn(async (url: string, opts?: RequestInit) => {
    if (opts?.method === "DELETE") return { ok: true, json: async () => ({ success: true }) };
    return { ok: true, json: async () => ({ success: true, data: rowsWithId }) };
  });
  vi.stubGlobal("fetch", fetchSpy);

  render(<AdminSectorsPage />);
  expect(await screen.findByText("Ngành runtime A")).toBeInTheDocument();

  const deactBtn = screen.getByRole("button", { name: "Ngừng hoạt động" });
  fireEvent.click(deactBtn);

  // Modal opens
  expect(screen.getByText("Xác Nhận Ngừng Hoạt Động Lĩnh Vực")).toBeInTheDocument();
  expect(screen.getAllByText(/3 quy tắc lọc/i).length).toBeGreaterThanOrEqual(1);

  // Confirm deactivation
  const confirmBtn = screen.getByRole("button", { name: "Xác Nhận Ngừng Hoạt Động" });
  fireEvent.click(confirmBtn);

  await waitFor(() => {
    const deleteCall = fetchSpy.mock.calls.find(([, opts]) => (opts as RequestInit)?.method === "DELETE");
    expect(deleteCall).toBeDefined();
  });
 });
});
