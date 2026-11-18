import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";
import { authClient } from "@/lib/auth-client";

const push = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace }) }));
vi.mock("next/link", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

describe("LoginPage", () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
    push.mockReset();
    replace.mockReset();
    localStorage.clear();
  });

  it.each([
    ["ADMIN", "/admin"],
    ["SUPER_ADMIN", "/admin"],
    ["OPERATOR_ADMIN", "/admin"],
    ["ENTERPRISE", "/portal"],
    ["SELLER", "/portal"],
    ["BUYER", "/portal"],
    ["INNOVATION_ENTITY", "/portal"],
    ["VERIFIED_EXPERT", "/portal"],
    ["PUBLIC_USER", "/"],
    ["PROVINCIAL_ADMIN", "/"],
    ["SECTOR_ADMIN", "/"],
    ["CLUSTER_ADMIN", "/"],
  ])("creates a session and routes canonical role %s to %s", async (role, expectedPath) => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        accessToken: "real-jwt",
        user: { id: "person-1", email: "role@baclink.org.vn", fullName: "Nguyễn Minh An", role, scopeType: "GLOBAL", scopeId: null },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("tenban@tochuc.vn"), { target: { value: "role@baclink.org.vn" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "correct-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập vào Hệ Thống" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/api\/v1\/auth\/login$/), expect.objectContaining({ method: "POST" }));
    expect(authClient.getToken()).toBe("real-jwt");
    expect(authClient.getUser()?.role).toBe(role);
    expect(push).toHaveBeenCalledWith(expectedPath);
  });

  it("does not retain a session when the API rejects credentials", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ message: "Email hoặc mật khẩu không đúng." }) }));
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("tenban@tochuc.vn"), { target: { value: "wrong@baclink.org.vn" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập vào Hệ Thống" }));

    expect(await screen.findByText("Email hoặc mật khẩu không đúng.")).toBeInTheDocument();
    expect(authClient.getToken()).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it("displays neutral security Vietnamese error when credentials are rejected (TC-C1-LOG-03)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ message: "Invalid credentials" }) }));
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("tenban@tochuc.vn"), { target: { value: "notfound@baclink.org.vn" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập vào Hệ Thống" }));

    expect(await screen.findByText("Tài khoản hoặc mật khẩu không chính xác.")).toBeInTheDocument();
    expect(authClient.getToken()).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it("redirects authenticated user to role path immediately if already logged in", () => {
    localStorage.setItem("nacentwin_access_token", "existing-jwt");
    localStorage.setItem(
      "nacentwin_user_context",
      JSON.stringify({ id: "user-1", email: "user@test.local", role: "VERIFIED_EXPERT" })
    );

    render(<LoginPage />);
    expect(replace).toHaveBeenCalledWith("/portal");
  });

  it("populates inputs correctly when clicking 3-tier BACLINK quick-fill accounts and excludes legacy demo accounts", () => {
    render(<LoginPage />);

    // Legacy accounts must be absent
    expect(screen.queryByRole("button", { name: /Super Admin/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Doanh Nghiệp ĐMST/i })).not.toBeInTheDocument();

    const adminBtn = screen.getByRole("button", { name: /Quản trị Hiệp hội \(Admin\)/i });
    const memberBtn = screen.getByRole("button", { name: /Doanh nghiệp Hội viên \(Mua & Bán\)/i });
    const advisorBtn = screen.getByRole("button", { name: /Ban Cố vấn Kỹ thuật BACLINK/i });
    const publicBtn = screen.getByRole("button", { name: /Thành viên công chúng \(Public\)/i });

    const emailInput = screen.getByPlaceholderText("tenban@tochuc.vn") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;

    fireEvent.click(adminBtn);
    expect(emailInput.value).toBe("admin@baclink.org.vn");
    expect(passwordInput.value).toBe("Password@123");

    fireEvent.click(memberBtn);
    expect(emailInput.value).toBe("member.hanelpt@baclink.org.vn");
    expect(passwordInput.value).toBe("Password@123");

    fireEvent.click(advisorBtn);
    expect(emailInput.value).toBe("khoi.nm@baclink.org.vn");
    expect(passwordInput.value).toBe("Password@123");

    fireEvent.click(publicBtn);
    expect(emailInput.value).toBe("guest@baclink.org.vn");
    expect(passwordInput.value).toBe("Password@123");
  });
});


