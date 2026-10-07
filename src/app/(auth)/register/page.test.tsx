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
});
