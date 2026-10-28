import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "./navbar";
import { authClient } from "@/lib/auth-client";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push }),
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props}>{children}</a>,
}));
vi.mock("./i18n-provider", () => ({
  I18nToggle: () => <span>Ngôn ngữ</span>,
  useI18n: () => ({ t: (key: string) => ({ home: "Trang chủ", about: "Giới thiệu", technology_offers: "Công nghệ", technology_demands: "Nhu cầu", innovative_enterprises: "DN ĐMST", experts: "Chuyên gia", user_guide: "Hướng dẫn", services: "Dịch vụ", logout: "Đăng xuất", login: "Đăng nhập", register: "Đăng ký", expert_upgrade: "Nâng hạng" })[key] ?? key }),
}));
vi.mock("./theme-toggle", () => ({ ThemeToggle: () => <span>Giao diện</span> }));
vi.mock("./toast", () => ({ useToast: () => ({ info: vi.fn() }) }));

describe("Navbar account menu", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockReset();
    authClient.setSession("token", { id: "person-1", email: "member@nacentech.local", fullName: "Nguyễn Minh An", role: "PUBLIC_USER" });
  });

  afterEach(cleanup);

  it("opens the authenticated account menu with dashboard, workspace, settings and logout, and hides dashboard from main nav", async () => {
    render(<Navbar />);

    // Verify Dashboard & CR is not in the main navigation bar
    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    expect(within(mainNav).queryByText("Dashboard & CR")).not.toBeInTheDocument();

    const trigger = await screen.findByRole("button", { name: "Mở menu tài khoản" });
    fireEvent.click(trigger);

    const menu = screen.getByRole("menu", { name: "Menu tài khoản" });
    expect(within(menu).getByRole("menuitem", { name: /Dashboard & CR/i })).toHaveAttribute("href", "/dashboard");
    expect(within(menu).getByRole("menuitem", { name: /Không gian làm việc/i })).toHaveAttribute("href", "/portal");
    expect(within(menu).getByRole("menuitem", { name: "Cài đặt tài khoản" })).toHaveAttribute("href", "/settings");
    expect(within(menu).getByRole("menuitem", { name: "Đăng xuất" })).toBeVisible();
    expect(within(menu).queryByText(/Đánh giá công nghệ \(TT17\)/i)).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("menu", { name: "Menu tài khoản" })).not.toBeInTheDocument();
  });

  it("only clears the session after logout is confirmed", async () => {
    render(<Navbar />);
    fireEvent.click(await screen.findByRole("button", { name: "Mở menu tài khoản" }));
    fireEvent.click(within(screen.getByRole("menu", { name: "Menu tài khoản" })).getByRole("menuitem", { name: "Đăng xuất" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Ở lại" }));
    expect(authClient.getToken()).toBe("token");

    fireEvent.click(screen.getByRole("button", { name: "Mở menu tài khoản" }));
    fireEvent.click(within(screen.getByRole("menu", { name: "Menu tài khoản" })).getByRole("menuitem", { name: "Đăng xuất" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Đăng xuất" }));

    expect(authClient.getToken()).toBeNull();
    expect(authClient.getUser()).toBeNull();
    expect(push).toHaveBeenCalledWith("/");
  });
});
