import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";
import { authClient } from "@/lib/auth-client";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("next/link", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

describe("LoginPage", () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
    push.mockReset();
    localStorage.clear();
  });

  it.each([
    ["SUPER_ADMIN", "/admin"], ["OPERATOR_ADMIN", "/admin"],
    ["PROVINCIAL_ADMIN", "/gov"], ["SECTOR_ADMIN", "/gov"], ["CLUSTER_ADMIN", "/gov"],
    ["SELLER", "/portal"], ["BUYER", "/portal"], ["INNOVATION_ENTITY", "/portal"], ["VERIFIED_EXPERT", "/portal"],
    ["PUBLIC_USER", "/"],
  ])("creates a session and routes canonical role %s to %s", async (role, expectedPath) => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        accessToken: "real-jwt",
        user: { id: "person-1", email: "role@nacentech.local", fullName: "Nguyễn Minh An", role, scopeType: "GLOBAL", scopeId: null },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("tenban@tochuc.vn"), { target: { value: "role@nacentech.local" } });
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
    fireEvent.change(screen.getByPlaceholderText("tenban@tochuc.vn"), { target: { value: "wrong@nacentech.local" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập vào Hệ Thống" }));

    expect(await screen.findByText("Email hoặc mật khẩu không đúng.")).toBeInTheDocument();
    expect(authClient.getToken()).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it("displays neutral security Vietnamese error when credentials are rejected (TC-C1-LOG-03)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ message: "Invalid credentials" }) }));
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("tenban@tochuc.vn"), { target: { value: "notfound@nacentech.local" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập vào Hệ Thống" }));

    expect(await screen.findByText("Tài khoản hoặc mật khẩu không chính xác.")).toBeInTheDocument();
    expect(authClient.getToken()).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it("populates inputs correctly when clicking quick-fill for Doanh Nghiệp ĐMST", () => {
    render(<LoginPage />);
    const dnDmstBtn = screen.getByRole("button", { name: /Doanh Nghiệp ĐMST/i });
    expect(dnDmstBtn).toBeInTheDocument();

    fireEvent.click(dnDmstBtn);

    const emailInput = screen.getByPlaceholderText("tenban@tochuc.vn") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;

    expect(emailInput.value).toBe("innovation.entity@demo.nacentech.vn");
    expect(passwordInput.value).toBe("Password@123");
  });
});


