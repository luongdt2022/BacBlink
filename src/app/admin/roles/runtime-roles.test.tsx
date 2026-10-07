import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminRolesPage from "./page";

vi.mock("@/components/admin/admin-nav", () => ({ AdminNav: () => <nav>Admin</nav> }));
vi.mock("@/lib/auth-client", () => ({ authClient: { getAuthHeaders: () => ({ Authorization: "Bearer dummy" }) } }));
const officer = { id: "account-1", name: "Cán bộ thực", email: "officer@example.test", role: "SECTOR_ADMIN", scopeType: "SECTOR", scopeId: "LV99", assignedAt: null };
const response = (data: unknown) => ({ ok: true, json: async () => ({ success: true, data }) });
describe("Runtime roles developer component regression", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn(async (url: string) => response(url.endsWith("/sectors") ? [{ code: "LV99", name: "Ngành hiện hành" }] : [officer]))));
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
  it("loads persisted roster and resolves runtime industry names", async () => {
    render(<AdminRolesPage />);
    fireEvent.click(screen.getByRole("button", { name: /Danh Sách Cán Bộ/ }));
    expect(await screen.findByText("Cán bộ thực")).toBeInTheDocument();
    expect(screen.getByText("Ngành hiện hành")).toBeInTheDocument();
    expect(screen.getByText("Chưa ghi nhận")).toBeInTheDocument();
  });
  it("keeps failure visible and never inserts a RAM officer", async () => {
    render(<AdminRolesPage />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Gán Vai Trò Cán Bộ" }));
    fireEvent.change(screen.getByPlaceholderText(/so.danang/), { target: { value: "new@example.test" } });
    fireEvent.change(screen.getByPlaceholderText("Nhập mã scope"), { target: { value: "HN" } });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    fireEvent.click(screen.getByRole("button", { name: "Xác Nhận Bổ Nhiệm" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("offline");
    expect(screen.getByPlaceholderText(/so.danang/)).toBeInTheDocument();
    expect(screen.queryByText("new@example.test")).not.toBeInTheDocument();
  });
  it("posts selected runtime code and reloads server roster before local display", async () => {
    render(<AdminRolesPage />);
    fireEvent.click(screen.getByRole("button", { name: "Gán Vai Trò Cán Bộ" }));
    fireEvent.change(screen.getByPlaceholderText(/so.danang/), { target: { value: "officer@example.test" } });
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "SECTOR_ADMIN" } });
    await screen.findByRole("option", { name: "LV99 — Ngành hiện hành" });
    fireEvent.change(screen.getAllByRole("combobox")[2], { target: { value: "LV99" } });
    const request = vi.fn(async (url: string, init?: RequestInit) => url.endsWith("/assign") ? ({ ok: true, json: async () => ({ success: true, message: "Đã lưu phân quyền." }) }) : response([officer]));
    vi.stubGlobal("fetch", request);
    fireEvent.click(screen.getByRole("button", { name: "Xác Nhận Bổ Nhiệm" }));
    await screen.findByText("Đã lưu phân quyền.");
    expect(request.mock.calls[0][0]).toContain("/governance/roles/assign");
    expect(JSON.parse(String(request.mock.calls[0][1]?.body))).toEqual({ email: "officer@example.test", role: "SECTOR_ADMIN", scopeType: "SECTOR", scopeId: "LV99" });
    await waitFor(() => expect(request.mock.calls.some(([url]) => url.endsWith("/officers"))).toBe(true));
  });
  it("disables sector assignment when runtime list is empty", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => response([])));
    render(<AdminRolesPage />);
    fireEvent.click(screen.getByRole("button", { name: "Gán Vai Trò Cán Bộ" }));
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "SECTOR_ADMIN" } });
    expect(await screen.findByText("Chưa có ngành đang hoạt động để gán quyền.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xác Nhận Bổ Nhiệm" })).toBeDisabled();
  });
});
