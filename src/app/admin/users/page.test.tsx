import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminUsersPage from "./page";

vi.mock("@/components/admin/admin-breadcrumbs", () => ({
  AdminBreadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>,
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    getUser: () => ({
      id: "admin-current-id",
      email: "super.admin@nacentech.gov.vn",
      fullName: "Super Admin",
      role: "SUPER_ADMIN",
    }),
    getAuthHeaders: () => ({ Authorization: "Bearer test-token" }),
  },
}));

const mockUsers = [
  {
    id: "admin-current-id",
    email: "super.admin@nacentech.gov.vn",
    firstName: "Admin",
    lastName: "Super",
    phone: "0900000001",
    organization: "NacenTech Trung Ương",
    role: "admin",
    platformRole: "SUPER_ADMIN",
    scopeType: "GLOBAL",
    scopeId: null,
    isActive: true,
    createdAt: "2026-10-01T00:00:00Z",
  },
  {
    id: "root-admin-id",
    email: "admin@nacentech.gov.vn",
    firstName: "Gốc",
    lastName: "Admin",
    phone: "0900000000",
    organization: "NacenTech",
    role: "admin",
    platformRole: "SUPER_ADMIN",
    scopeType: "GLOBAL",
    scopeId: null,
    isActive: true,
    createdAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "user-so-hanoi-id",
    email: "minhtv@sokhcn.hanoi.gov.vn",
    firstName: "Minh",
    lastName: "Trần Văn",
    phone: "0912345678",
    organization: "Sở KH&CN Hà Nội",
    role: "user",
    platformRole: "PROVINCIAL_ADMIN",
    scopeType: "PROVINCE",
    scopeId: "01",
    isActive: true,
    createdAt: "2026-10-15T00:00:00Z",
  },
  {
    id: "user-locked-id",
    email: "locked.user@example.com",
    firstName: "Khóa",
    lastName: "Tài Khoản",
    phone: "0988888888",
    organization: "Công ty TNHH Thử Nghiệm",
    role: "user",
    platformRole: "ENTERPRISE",
    scopeType: "TENANT",
    scopeId: "DN-999",
    isActive: false,
    createdAt: "2026-10-20T00:00:00Z",
  },
];

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(async (url: string, opts?: RequestInit) => {
    // GET /api/v1/admin/users
    if (url.includes("/api/v1/admin/users") && !opts?.method) {
      if (url.includes("/profile")) {
        return {
          ok: true,
          json: async () => ({
            user: mockUsers[2],
            ipIntakes: [{ id: "ip-1", title: "Giải pháp Robot AI", status: "published", createdAt: "2026-10-25T00:00:00Z" }],
            challengeIntakes: [{ id: "ch-1", title: "Tìm kiếm công nghệ sấy lúa", status: "open", createdAt: "2026-10-26T00:00:00Z" }],
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({
          data: mockUsers,
          meta: { total: mockUsers.length, page: 1, limit: 10, totalPages: 1 },
        }),
      };
    }

    // PATCH /api/v1/admin/users/{id}
    if (opts?.method === "PATCH") {
      return {
        ok: true,
        json: async () => ({ success: true, message: "User updated successfully" }),
      };
    }

    // DELETE /api/v1/admin/users/{id}
    if (opts?.method === "DELETE") {
      return {
        ok: true,
        json: async () => ({ success: true, message: "User deactivated successfully" }),
      };
    }

    // POST /api/v1/admin/users/{id}/reset-password
    if (url.includes("/reset-password") && opts?.method === "POST") {
      return {
        ok: true,
        json: async () => ({ message: "Password reset successfully" }),
      };
    }

    // POST /api/v1/admin/users
    if (opts?.method === "POST") {
      return {
        ok: true,
        json: async () => ({ success: true, message: "User created" }),
      };
    }

    return { ok: true, json: async () => ({}) };
  });

  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AdminUsersPage — Super Admin User Management Center (CR-2026-025)", () => {
  it("renders header, KPI metrics and user list from API (REQ-USER-01)", async () => {
    render(<AdminUsersPage />);

    expect(screen.getByText("Trung Tâm Quản Trị Người Dùng Toàn Quốc")).toBeInTheDocument();
    expect(screen.getByText("User 360° Console")).toBeInTheDocument();

    // Verify users rendered
    expect(await screen.findByText("super.admin@nacentech.gov.vn")).toBeInTheDocument();
    expect(screen.getByText("minhtv@sokhcn.hanoi.gov.vn")).toBeInTheDocument();
    expect(screen.getByText("locked.user@example.com")).toBeInTheDocument();

    // Verify badges
    expect(screen.getByText("Bạn")).toBeInTheDocument();
    expect(screen.getByText("Gốc")).toBeInTheDocument();
  });

  it("enforces BR-USER-01 and BR-USER-02: disables lock button on self and root admin", async () => {
    render(<AdminUsersPage />);

    expect(await screen.findByText("super.admin@nacentech.gov.vn")).toBeInTheDocument();

    const selfLockBtn = screen.getByTitle("Quy tắc BR-USER-01: Không thể tự khóa chính mình");
    expect(selfLockBtn).toBeDisabled();

    const rootLockBtn = screen.getByTitle("Quy tắc BR-USER-02: Không thể khóa tài khoản gốc");
    expect(rootLockBtn).toBeDisabled();
  });

  it("opens User 360° Drawer and loads connected challenge and tech offers (REQ-USER-03)", async () => {
    render(<AdminUsersPage />);

    expect(await screen.findByText("minhtv@sokhcn.hanoi.gov.vn")).toBeInTheDocument();

    const viewButtons = screen.getAllByTitle("Xem chi tiết 360°");
    fireEvent.click(viewButtons[2]); // Click on user-so-hanoi

    expect(await screen.findByText("Hồ Sơ Chi Tiết 360°")).toBeInTheDocument();
    expect(await screen.findByText("Giải pháp Robot AI")).toBeInTheDocument();
    expect(screen.getByText("Tìm kiếm công nghệ sấy lúa")).toBeInTheDocument();

    // Close drawer
    fireEvent.click(screen.getByRole("button", { name: "Đóng" }));
    await waitFor(() => {
      expect(screen.queryByText("Hồ Sơ Chi Tiết 360°")).not.toBeInTheDocument();
    });
  });

  it("opens Edit Profile modal and submits PATCH request (REQ-USER-04)", async () => {
    render(<AdminUsersPage />);

    expect(await screen.findByText("minhtv@sokhcn.hanoi.gov.vn")).toBeInTheDocument();

    const editButtons = screen.getAllByTitle("Chỉnh sửa thông tin");
    fireEvent.click(editButtons[2]);

    expect(screen.getByText("Chỉnh Sửa Thông Tin Tài Khoản")).toBeInTheDocument();

    const phoneInput = screen.getByPlaceholderText("0912345678");
    fireEvent.change(phoneInput, { target: { value: "0999999999" } });

    fireEvent.click(screen.getByRole("button", { name: "Lưu Thay Đổi" }));

    await waitFor(() => {
      const patchCall = fetchMock.mock.calls.find(([, opts]) => opts?.method === "PATCH");
      expect(patchCall).toBeDefined();
    });
  });

  it("opens Reset Password modal and submits POST request (REQ-USER-05)", async () => {
    render(<AdminUsersPage />);

    expect(await screen.findByText("minhtv@sokhcn.hanoi.gov.vn")).toBeInTheDocument();

    const resetButtons = screen.getAllByTitle("Đặt lại mật khẩu");
    fireEvent.click(resetButtons[2]);

    expect(screen.getByText("Đặt Lại Mật Khẩu")).toBeInTheDocument();

    const pwdInput = screen.getByPlaceholderText("Nhập tối thiểu 6 ký tự...");
    fireEvent.change(pwdInput, { target: { value: "NewSecurePassword@123" } });

    fireEvent.click(screen.getByRole("button", { name: "Xác Nhận Đổi" }));

    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find(([url, opts]) => url.includes("/reset-password") && opts?.method === "POST");
      expect(postCall).toBeDefined();
    });
  });

  it("opens Lock Account modal, enforces reason input and submits DELETE request (REQ-USER-06)", async () => {
    render(<AdminUsersPage />);

    expect(await screen.findByText("minhtv@sokhcn.hanoi.gov.vn")).toBeInTheDocument();

    const lockButtons = screen.getAllByTitle("Khóa tài khoản");
    // Button index 0 is for minhtv (active, not self, not root)
    fireEvent.click(lockButtons[0]);

    expect(screen.getByText("Khóa Tài Khoản Người Dùng")).toBeInTheDocument();

    const reasonInput = screen.getByPlaceholderText(/Nhập lý do khóa tài khoản/);
    fireEvent.change(reasonInput, { target: { value: "Vi phạm quy chế sử dụng dịch vụ" } });

    fireEvent.click(screen.getByRole("button", { name: "Xác Nhận Khóa" }));

    await waitFor(() => {
      const deleteCall = fetchMock.mock.calls.find(([, opts]) => opts?.method === "DELETE");
      expect(deleteCall).toBeDefined();
      expect(JSON.parse(deleteCall![1].body)).toEqual({ reason: "Vi phạm quy chế sử dụng dịch vụ" });
    });
  });

  it("opens Create User modal and submits POST /api/v1/admin/users (REQ-USER-07)", async () => {
    render(<AdminUsersPage />);

    fireEvent.click(screen.getByRole("button", { name: /Thêm Tài Khoản Mới/i }));

    expect(screen.getByText("Thêm Tài Khoản Người Dùng Mới")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/canbo@sokhcn.gov.vn/), { target: { value: "new.officer@sokhcn.gov.vn" } });
    fireEvent.change(screen.getByPlaceholderText("Văn Minh"), { target: { value: "Thành Đạt" } });

    fireEvent.click(screen.getByRole("button", { name: "Tạo Tài Khoản" }));

    await waitFor(() => {
      const createCall = fetchMock.mock.calls.find(([url, opts]) => url.endsWith("/api/v1/admin/users") && opts?.method === "POST");
      expect(createCall).toBeDefined();
      expect(JSON.parse(createCall![1].body)).toMatchObject({
        email: "new.officer@sokhcn.gov.vn",
        firstName: "Thành Đạt",
      });
    });
  });

  it("CR-2026-029 (BR-ADM-LOAD-01): shows shimmer skeleton with aria-busy and zero fake zeroes while loading, then renders real KPI counts", async () => {
    let resolveFetch!: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    fetchMock.mockImplementationOnce(() => pendingPromise as Promise<Response>);

    render(<AdminUsersPage />);

    const kpiSkeleton = screen.getByTestId("users-kpi-skeleton");
    expect(kpiSkeleton).toHaveAttribute("aria-busy", "true");
    const cards = kpiSkeleton.querySelectorAll('[aria-busy="true"]');
    expect(cards).toHaveLength(4);
    cards.forEach((card) => {
      expect(card.querySelectorAll(".animate-shimmer").length).toBeGreaterThanOrEqual(2);
      expect(card.textContent).not.toContain("0");
    });
    expect(kpiSkeleton.textContent).not.toContain("0");
    expect(kpiSkeleton).toHaveTextContent("Tổng Người Dùng");
    expect(kpiSkeleton).toHaveTextContent("Đang Hoạt Động");
    expect(kpiSkeleton).toHaveTextContent("Đang Bị Khóa");
    expect(kpiSkeleton).toHaveTextContent("Cán Bộ Quản Trị");

    resolveFetch({
      ok: true,
      json: async () => ({
        data: mockUsers,
        meta: { total: mockUsers.length, page: 1, limit: 10, totalPages: 1 },
      }),
    });

    const kpiGrid = await screen.findByTestId("users-kpi-grid");
    expect(kpiGrid).not.toHaveAttribute("aria-busy");
    expect(screen.queryByTestId("users-kpi-skeleton")).not.toBeInTheDocument();
    expect(kpiGrid).toHaveTextContent("4");
    expect(kpiGrid).toHaveTextContent("3");
    expect(kpiGrid).toHaveTextContent("1");
  });

  it("CR-2026-029 (BR-ADM-LOAD-01): renders real zero KPI values only after API resolves with empty dataset", async () => {
    let resolveFetch!: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    fetchMock.mockImplementationOnce(() => pendingPromise as Promise<Response>);

    render(<AdminUsersPage />);

    const kpiSkeleton = screen.getByTestId("users-kpi-skeleton");
    expect(kpiSkeleton.textContent).not.toContain("0");

    resolveFetch({
      ok: true,
      json: async () => ({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
      }),
    });

    const kpiGrid = await screen.findByTestId("users-kpi-grid");
    const zeroNodes = kpiGrid.querySelectorAll(".text-2xl");
    expect(zeroNodes).toHaveLength(4);
    zeroNodes.forEach((node) => {
      expect(node.textContent).toBe("0");
    });
  });
});
