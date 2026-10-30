import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "./page";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("next/link", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

describe("RegisterPage", () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
    push.mockReset();
  });

  it("submits no role/scope, resets the form, and confirms immediate PUBLIC_USER sign-in", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: "REGISTER_SUCCESS" }) });
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

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).not.toHaveProperty("platformRole");
    expect(body).not.toHaveProperty("scopeType");
    expect(body).not.toHaveProperty("organization");
    expect(await screen.findByText(/Đăng ký thành công! Tài khoản công chúng/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nguyễn Văn")).toHaveValue("");
    expect(screen.getByPlaceholderText("nguyenvanan@institute.gov.vn")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Đăng ký thành viên" })).toBeInTheDocument();
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
