import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "./page";
import { authClient } from "@/lib/auth-client";

const push = vi.fn();
const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace }) }));
vi.mock("next/link", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

describe("RegisterPage", () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
    push.mockReset();
    replace.mockReset();
    localStorage.clear();
  });

  it("submits no role/scope, automatically logs in, sets session, and routes to /", async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/api/v1/auth/register")) {
        return { ok: true, json: async () => ({ code: "REGISTER_SUCCESS" }) };
      }
      if (url.includes("/api/v1/auth/login")) {
        return {
          ok: true,
          json: async () => ({
            accessToken: "auto-login-jwt-token",
            user: {
              id: "user-123",
              email: "public@test.local",
              fullName: "Nguyễn An",
              role: "PUBLIC_USER",
              scopeType: "GLOBAL",
              scopeId: null,
            },
          }),
        };
      }
      return { ok: false, status: 404 };
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Nguyễn Văn"), { target: { value: "Nguyễn" } });
    fireEvent.change(screen.getByPlaceholderText("An"), { target: { value: "An" } });
    fireEvent.change(screen.getByPlaceholderText("nguyenvanan@institute.gov.vn"), { target: { value: "public@test.local" } });
    const passwords = screen.getAllByPlaceholderText("••••••••");
    fireEvent.change(passwords[0], { target: { value: "Password-2026!" } });
    fireEvent.change(passwords[1], { target: { value: "Password-2026!" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Đăng ký thành viên" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const registerBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(registerBody).not.toHaveProperty("platformRole");
    expect(registerBody).not.toHaveProperty("scopeType");
    expect(registerBody).not.toHaveProperty("organization");

    const loginBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(loginBody.email).toBe("public@test.local");
    expect(loginBody.password).toBe("Password-2026!");

    expect(authClient.getToken()).toBe("auto-login-jwt-token");
    expect(authClient.getUser()?.role).toBe("PUBLIC_USER");
    expect(push).toHaveBeenCalledWith("/");
  });

  it("shows fallback message when register succeeds but auto-login encounters network error", async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/api/v1/auth/register")) {
        return { ok: true, json: async () => ({ code: "REGISTER_SUCCESS" }) };
      }
      if (url.includes("/api/v1/auth/login")) {
        throw new TypeError("Login network failed");
      }
      return { ok: false };
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Nguyễn Văn"), { target: { value: "Nguyễn" } });
    fireEvent.change(screen.getByPlaceholderText("An"), { target: { value: "An" } });
    fireEvent.change(screen.getByPlaceholderText("nguyenvanan@institute.gov.vn"), { target: { value: "public@test.local" } });
    const passwords = screen.getAllByPlaceholderText("••••••••");
    fireEvent.change(passwords[0], { target: { value: "Password-2026!" } });
    fireEvent.change(passwords[1], { target: { value: "Password-2026!" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Đăng ký thành viên" }));

    expect(await screen.findByText(/Tài khoản của bạn đã được khởi tạo thành công!/)).toBeInTheDocument();
    expect(screen.getByText("Đi đến trang Đăng nhập")).toBeInTheDocument();
    expect(authClient.getToken()).toBeNull();
  });

  it("shows Vietnamese validation in the form instead of the browser validation bubble", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<RegisterPage />);

    fireEvent.click(screen.getByRole("button", { name: "Đăng ký thành viên" }));

    expect(await screen.findByText("Vui lòng nhập Họ và Tên đệm.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("explains a network outage instead of exposing Load failed", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Load failed")));
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Nguyễn Văn"), { target: { value: "Nguyễn" } });
    fireEvent.change(screen.getByPlaceholderText("An"), { target: { value: "An" } });
    fireEvent.change(screen.getByPlaceholderText("nguyenvanan@institute.gov.vn"), { target: { value: "public@test.local" } });
    const passwords = screen.getAllByPlaceholderText("••••••••");
    fireEvent.change(passwords[0], { target: { value: "Password-2026!" } });
    fireEvent.change(passwords[1], { target: { value: "Password-2026!" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Đăng ký thành viên" }));

    expect(await screen.findByText("Không thể kết nối máy chủ đăng ký. Vui lòng kiểm tra API NacenTech đang chạy rồi thử lại.")).toBeInTheDocument();
  });

  it("blocks submission when PDPD consent is unchecked (TC-REG-03)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Nguyễn Văn"), { target: { value: "Trần" } });
    fireEvent.change(screen.getByPlaceholderText("An"), { target: { value: "Bình" } });
    fireEvent.change(screen.getByPlaceholderText("nguyenvanan@institute.gov.vn"), { target: { value: "binh@test.vn" } });
    const passwords = screen.getAllByPlaceholderText("••••••••");
    fireEvent.change(passwords[0], { target: { value: "NacenTech@2026" } });
    fireEvent.change(passwords[1], { target: { value: "NacenTech@2026" } });
    // KHÔNG TÍCH CHECKBOX PDPD
    fireEvent.click(screen.getByRole("button", { name: "Đăng ký thành viên" }));

    expect(await screen.findByText("Bạn cần đồng ý với Điều khoản Bảo vệ Dữ liệu Cá nhân (Nghị định 13/2023/NĐ-CP) để tiếp tục.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("blocks submission when password is shorter than 8 characters (TC-REG-04)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Nguyễn Văn"), { target: { value: "Trần" } });
    fireEvent.change(screen.getByPlaceholderText("An"), { target: { value: "Bình" } });
    fireEvent.change(screen.getByPlaceholderText("nguyenvanan@institute.gov.vn"), { target: { value: "binh@test.vn" } });
    const passwords = screen.getAllByPlaceholderText("••••••••");
    fireEvent.change(passwords[0], { target: { value: "1234567" } });
    fireEvent.change(passwords[1], { target: { value: "1234567" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Đăng ký thành viên" }));

    expect(await screen.findByText("Mật khẩu phải có ít nhất 8 ký tự.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("blocks submission when confirm password does not match (TC-REG-05)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Nguyễn Văn"), { target: { value: "Trần" } });
    fireEvent.change(screen.getByPlaceholderText("An"), { target: { value: "Bình" } });
    fireEvent.change(screen.getByPlaceholderText("nguyenvanan@institute.gov.vn"), { target: { value: "binh@test.vn" } });
    const passwords = screen.getAllByPlaceholderText("••••••••");
    fireEvent.change(passwords[0], { target: { value: "NacenTech@2026" } });
    fireEvent.change(passwords[1], { target: { value: "Different@2026" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Đăng ký thành viên" }));

    expect(await screen.findByText("Mật khẩu xác nhận không khớp.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("blocks submission when email is invalid format (TC-REG-06)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Nguyễn Văn"), { target: { value: "Trần" } });
    fireEvent.change(screen.getByPlaceholderText("An"), { target: { value: "Bình" } });
    fireEvent.change(screen.getByPlaceholderText("nguyenvanan@institute.gov.vn"), { target: { value: "invalid-email-format" } });
    const passwords = screen.getAllByPlaceholderText("••••••••");
    fireEvent.change(passwords[0], { target: { value: "NacenTech@2026" } });
    fireEvent.change(passwords[1], { target: { value: "NacenTech@2026" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Đăng ký thành viên" }));

    expect(await screen.findByText("Địa chỉ email chưa đúng định dạng.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("displays server error when API returns duplicate email 409 (TC-REG-02)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ message: "Email này đã được sử dụng." })
    }));
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Nguyễn Văn"), { target: { value: "Trần" } });
    fireEvent.change(screen.getByPlaceholderText("An"), { target: { value: "Bình" } });
    fireEvent.change(screen.getByPlaceholderText("nguyenvanan@institute.gov.vn"), { target: { value: "duplicate@nacentech.vn" } });
    const passwords = screen.getAllByPlaceholderText("••••••••");
    fireEvent.change(passwords[0], { target: { value: "NacenTech@2026" } });
    fireEvent.change(passwords[1], { target: { value: "NacenTech@2026" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Đăng ký thành viên" }));

    expect(await screen.findByText("Email này đã được sử dụng.")).toBeInTheDocument();
  });
});
