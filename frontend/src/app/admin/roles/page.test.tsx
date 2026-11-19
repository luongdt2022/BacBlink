import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminRolesPage from "./page";

vi.mock("@/components/admin/admin-nav", () => ({ AdminNav: () => <nav>AdminNav</nav> }));
vi.mock("@/lib/auth-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth-client")>("@/lib/auth-client");
  return {
    ...actual,
    authClient: { getAuthHeaders: () => ({}) },
  };
});

const officers = [
  {
    id: "1",
    name: "Quản trị viên BACLINK",
    email: "admin@baclink.vn",
    role: "ADMIN",
    scopeType: "GLOBAL",
    scopeId: null,
    assignedAt: null,
  },
];

let fetchMock: ReturnType<typeof vi.fn>;

describe("AdminRoles 3-tier BACLINK RBAC contracts", () => {
  beforeEach(() => {
    fetchMock = vi.fn(async (_url: string, opts?: RequestInit) => ({
      ok: true,
      json: async () => ({
        success: true,
        data: opts?.method === "POST" ? {} : officers,
        message: opts?.method === "POST" ? "Đã lưu phân quyền." : undefined,
      }),
    }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders 3-tier BACLINK RBAC matrix (ADMIN, ENTERPRISE, PUBLIC_USER) without legacy 10-role rows", () => {
    render(<AdminRolesPage />);
    expect(screen.getByText("Ma Trận 3 Cấp Vai Trò & Thẩm Quyền Cốt Lõi")).toBeInTheDocument();
    for (const role of ["ADMIN", "ENTERPRISE", "PUBLIC_USER"]) {
      expect(screen.getByText(role)).toBeInTheDocument();
    }
    expect(screen.queryByText("PROVINCIAL_ADMIN")).not.toBeInTheDocument();
    expect(screen.queryByText("SECTOR_ADMIN")).not.toBeInTheDocument();
    expect(screen.queryByText("CLUSTER_ADMIN")).not.toBeInTheDocument();
  });

  it("reads account list and filters by search query", async () => {
    render(<AdminRolesPage />);
    fireEvent.click(screen.getByRole("button", { name: /Danh Sách Nhân Sự & Phân Quyền/i }));
    expect(await screen.findByText("Quản trị viên BACLINK")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Tìm theo email/), { target: { value: "no-match" } });
    expect(screen.queryByText("Quản trị viên BACLINK")).not.toBeInTheDocument();
  });

  it("assigns 3-tier role with GLOBAL scope via POST and reloads after provider confirms", async () => {
    render(<AdminRolesPage />);
    fireEvent.click(screen.getByRole("button", { name: /Gán Vai Trò Tài Khoản/i }));
    fireEvent.change(screen.getByPlaceholderText("VD: admin@baclink.vn"), {
      target: { value: "officer@baclink.vn" },
    });
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "ENTERPRISE" } });
    fireEvent.click(screen.getByRole("button", { name: /Xác Nhận Bổ Nhiệm/i }));

    expect(await screen.findByText("Đã lưu phân quyền.")).toBeInTheDocument();
    const call = fetchMock.mock.calls.find(([, opts]) => (opts as RequestInit)?.method === "POST");
    expect(call).toBeDefined();
    expect(JSON.parse((call![1] as RequestInit).body as string)).toEqual({
      email: "officer@baclink.vn",
      role: "ENTERPRISE",
      scopeType: "GLOBAL",
      scopeId: null,
    });
  });

  it("requires email via HTML validation", () => {
    render(<AdminRolesPage />);
    fireEvent.click(screen.getByRole("button", { name: /Gán Vai Trò Tài Khoản/i }));
    const input = screen.getByPlaceholderText("VD: admin@baclink.vn") as HTMLInputElement;
    expect(input).toBeRequired();
    expect(input.checkValidity()).toBe(false);
  });

  it("keeps assignment modal open and reports error when provider fails", async () => {
    render(<AdminRolesPage />);
    fireEvent.click(screen.getByRole("button", { name: /Gán Vai Trò Tài Khoản/i }));
    fireEvent.change(screen.getByPlaceholderText("VD: admin@baclink.vn"), {
      target: { value: "officer@baclink.vn" },
    });
    fetchMock.mockRejectedValueOnce(new Error("provider unavailable"));
    fireEvent.click(screen.getByRole("button", { name: /Xác Nhận Bổ Nhiệm/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("provider unavailable"));
    expect(screen.getByText("Bổ Nhiệm & Gán Vai Trò 3 Cấp")).toBeInTheDocument();
  });
});
