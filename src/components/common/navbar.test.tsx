import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "./navbar";
import { authClient } from "@/lib/auth-client";
import { MAIN_NAV, JOIN_HREF, SEARCH_HREF } from "@/lib/constants/navigation";
import { ORG } from "@/lib/constants/organization";

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
  useI18n: () => ({ t: (key: string) => ({ home: "Trang chủ", about: "Giới thiệu", technology_offers: "Cung ứng", technology_demands: "Nhu cầu", innovative_enterprises: "Hội viên", experts: "Cố vấn", user_guide: "Hướng dẫn", services: "Dịch vụ", logout: "Đăng xuất", login: "Đăng nhập", register: "Đăng ký", expert_upgrade: "Nâng hạng hội viên" })[key] ?? key }),
}));
vi.mock("./theme-toggle", () => ({ ThemeToggle: () => <span>Giao diện</span> }));
vi.mock("./toast", () => ({ useToast: () => ({ info: vi.fn() }) }));

describe("Navbar account menu", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockReset();
    authClient.setSession("token", { id: "person-1", email: "guest@baclink.org.vn", fullName: "Nguyễn Minh An", role: "PUBLIC_USER" });
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

  // ===== CR-BACLINK-008 · REQ-BL08-IA-001 / REQ-BL08-HEADER-002 =====
  it("renders exactly 7 top-level menus in the customer-approved order", () => {
    render(<Navbar />);
    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    const triggers = within(mainNav).getAllByRole("link").filter((a) => a.hasAttribute("aria-haspopup"));
    expect(triggers.map((a) => a.textContent?.trim())).toEqual(MAIN_NAV.map((m) => m.label));
    expect(triggers).toHaveLength(7);
  });

  it("every sub-menu link from MAIN_NAV is rendered and no internal page is exposed", () => {
    render(<Navbar />);
    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    const hrefs = within(mainNav).getAllByRole("link").map((a) => a.getAttribute("href"));
    MAIN_NAV.flatMap((m) => m.children).forEach((c) => expect(hrefs).toContain(c.href));
    expect(hrefs).not.toContain("/wireframes");
    expect(hrefs).not.toContain("/matrix");
    expect(hrefs.some((h) => h?.startsWith("/assessments") || h?.startsWith("/khao-sat"))).toBe(false);
  });

  it("header shows search, language and the join CTA for a PUBLIC_USER", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: "Tìm kiếm" })).toHaveAttribute("href", SEARCH_HREF);
    expect(screen.getByText("Ngôn ngữ")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Hoàn tất hồ sơ hội viên|Hội viên/ }).some((a) => a.getAttribute("href") === JOIN_HREF)).toBe(true);
  });

  it("guest sees Đăng nhập and Gia nhập BACLINK", () => {
    authClient.clearSession();
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /^Đăng nhập$/ })).toHaveAttribute("href", "/login");
    expect(screen.getAllByRole("link", { name: /Gia nhập BACLINK/ })[0]).toHaveAttribute("href", JOIN_HREF);
  });

  it("không còn thanh trên cùng (hotline/email) ở đầu trang", () => {
    render(<Navbar />);
    const header = screen.getByRole("banner");
    expect(within(header).queryByText(new RegExp(ORG.motto))).not.toBeInTheDocument();
    expect(within(header).queryByRole("link", { name: /Zalo/ })).not.toBeInTheDocument();
  });

  it("handles mouse hover and click toggle on a dropdown", () => {
    render(<Navbar />);
    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    const trigger = within(mainNav).getByRole("link", { name: /^Hội viên$/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.mouseEnter(trigger.closest(".relative")!);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("menu cấp 1 vẫn sáng khi ở trang con không nằm trong danh sách menu con (activePrefixes)", () => {
    const m = MAIN_NAV.find((x) => x.label === "Cơ hội kinh doanh")!;
    expect(m.activePrefixes).toEqual(expect.arrayContaining(["/chao-ban-cong-nghe", "/nhu-cau-cong-nghe"]));
    MAIN_NAV.forEach((x) => expect(x.activePrefixes?.length ?? 0).toBeGreaterThan(0));
  });
});
