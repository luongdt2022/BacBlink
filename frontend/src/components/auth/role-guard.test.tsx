import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RoleGuard } from "./role-guard";
import { authClient } from "@/lib/auth-client";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("RoleGuard", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockReset();
    vi.restoreAllMocks();
  });

  afterEach(cleanup);

  it("renders login required (401) when user is not authenticated", async () => {
    authClient.clearSession();

    render(
      <RoleGuard allowedRoles={["SUPER_ADMIN", "OPERATOR_ADMIN"]} portalName="Cổng Quản Trị Tối Cao">
        <div data-testid="protected-content">Bảo mật</div>
      </RoleGuard>
    );

    expect(screen.getByText("Yêu cầu Đăng nhập")).toBeInTheDocument();
    expect(screen.getByText(/Bạn cần đăng nhập bằng tài khoản có thẩm quyền/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Đi đến trang Đăng nhập/i })).toHaveAttribute("href", "/login");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("blocks unprivileged roles with 403 Forbidden and redirect guidance", async () => {
    authClient.setSession("jwt-token", {
      id: "user-1",
      email: "public@nacentech.local",
      fullName: "Nguyễn Văn A",
      role: "PUBLIC_USER",
    });

    render(
      <RoleGuard allowedRoles={["SUPER_ADMIN", "OPERATOR_ADMIN"]} portalName="Cổng Quản Trị Tối Cao">
        <div data-testid="protected-content">Bảo mật</div>
      </RoleGuard>
    );

    expect(screen.getByText("Truy cập bị từ chối (403 Forbidden)")).toBeInTheDocument();
    expect(screen.getByText(/Tài khoản của bạn có vai trò/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Về Cổng làm việc của bạn/i })).toHaveAttribute("href", "/");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("renders children when user role matches allowed roles", async () => {
    authClient.setSession("jwt-token", {
      id: "admin-1",
      email: "admin@nacentech.local",
      fullName: "Quản trị viên Tối cao",
      role: "SUPER_ADMIN",
    });

    render(
      <RoleGuard allowedRoles={["SUPER_ADMIN", "OPERATOR_ADMIN"]} portalName="Cổng Quản Trị Tối Cao">
        <div data-testid="protected-content">Nội dung Quản Trị Tối Cao</div>
      </RoleGuard>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.getByText("Nội dung Quản Trị Tối Cao")).toBeInTheDocument();
    expect(screen.queryByText("Truy cập bị từ chối (403 Forbidden)")).not.toBeInTheDocument();
  });
});
