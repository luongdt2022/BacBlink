import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminRolesPage from "./page";

vi.mock("@/components/admin/admin-nav", () => ({ AdminNav: () => <nav>Admin</nav> }));
vi.mock("@/lib/auth-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth-client")>("@/lib/auth-client");
  return {
    ...actual,
    authClient: { getAuthHeaders: () => ({ Authorization: "Bearer dummy" }) },
  };
});

const officer = {
  id: "account-1",
  name: "Ban Quản trị thực",
  email: "admin@baclink.vn",
  role: "ADMIN",
  scopeType: "GLOBAL",
  scopeId: null,
  assignedAt: null,
};

const response = (data: unknown) => ({ ok: true, json: async () => ({ success: true, data }) });

describe("Runtime roles 3-tier BACLINK regression", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn(async () => response([officer]))));
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("loads persisted roster from backend API", async () => {
    render(<AdminRolesPage />);
    fireEvent.click(screen.getByRole("button", { name: /Danh Sách Nhân Sự/ }));
    expect(await screen.findByText("Ban Quản trị thực")).toBeInTheDocument();
    expect(screen.getByText("Toàn hệ thống BACLINK")).toBeInTheDocument();
    expect(screen.getByText("Chưa ghi nhận")).toBeInTheDocument();
  });

  it("keeps failure visible and never inserts a RAM officer", async () => {
    render(<AdminRolesPage />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Gán Vai Trò Tài Khoản" }));
    fireEvent.change(screen.getByPlaceholderText(/admin@baclink.vn/), { target: { value: "new@baclink.vn" } });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    fireEvent.click(screen.getByRole("button", { name: "Xác Nhận Bổ Nhiệm" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("offline");
    expect(screen.getByPlaceholderText(/admin@baclink.vn/)).toBeInTheDocument();
    expect(screen.queryByText("new@baclink.vn")).not.toBeInTheDocument();
  });

  it("posts 3-tier role with GLOBAL scope and reloads server roster before display", async () => {
    render(<AdminRolesPage />);
    fireEvent.click(screen.getByRole("button", { name: "Gán Vai Trò Tài Khoản" }));
    fireEvent.change(screen.getByPlaceholderText(/admin@baclink.vn/), { target: { value: "dn@baclink.vn" } });
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "ENTERPRISE" } });

    const request = vi.fn(async (url: string, _init?: RequestInit) =>
      url.endsWith("/assign")
        ? { ok: true, json: async () => ({ success: true, message: "Đã lưu phân quyền." }) }
        : response([officer])
    );
    vi.stubGlobal("fetch", request);

    fireEvent.click(screen.getByRole("button", { name: "Xác Nhận Bổ Nhiệm" }));
    await screen.findByText("Đã lưu phân quyền.");
    expect(request.mock.calls[0][0]).toContain("/governance/roles/assign");
    expect(JSON.parse(String((request.mock.calls[0][1] as RequestInit)?.body))).toEqual({
      email: "dn@baclink.vn",
      role: "ENTERPRISE",
      scopeType: "GLOBAL",
      scopeId: null,
    });
    await waitFor(() => expect(request.mock.calls.some(([url]) => String(url).endsWith("/officers"))).toBe(true));
  });
});
