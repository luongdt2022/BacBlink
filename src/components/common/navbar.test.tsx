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

  it("renders Chuyên gia dropdown containing E-Learning and expert catalog links", () => {
    render(<Navbar />);

    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    const expertTrigger = within(mainNav).getByRole("link", { name: /^Chuyên gia$/i });
    expect(expertTrigger).toHaveAttribute("href", "/chuyen-gia");

    // Sub-items inside Chuyên gia dropdown
    const elearningLink = within(mainNav).getByRole("link", { name: /E-Learning & Đào tạo/i });
    expect(elearningLink).toHaveAttribute("href", "/elearning");
    expect(within(elearningLink).getByText("LMS")).toBeInTheDocument();

    const expertCatalogLink = within(mainNav).getByRole("link", { name: /^Mạng lưới Chuyên gia/i });
    expect(expertCatalogLink).toHaveAttribute("href", "/chuyen-gia");

    const expertUpgradeLink = within(mainNav).getByRole("link", { name: /^Đăng ký Chuyên gia/i });
    expect(expertUpgradeLink).toHaveAttribute("href", "/profile/upgrade");
  });

  it("renders Nhu cầu công nghệ dropdown with TNI and quick registration forms", () => {
    render(<Navbar />);

    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    const demandTrigger = within(mainNav).getByRole("link", { name: /^Nhu cầu$/i });
    expect(demandTrigger).toHaveAttribute("href", "/nhu-cau-cong-nghe");

    const tniLink = within(mainNav).getByRole("link", { name: /Khảo sát Nhu cầu Công nghệ \(TNI\)/i });
    expect(tniLink).toHaveAttribute("href", "/khao-sat-nhu-cau");
    expect(within(tniLink).getByText("TNI")).toBeInTheDocument();

    const quickDemandLink = within(mainNav).getByRole("link", { name: /Đăng nhanh Nhu cầu Kỹ thuật/i });
    expect(quickDemandLink).toHaveAttribute("href", "/khao-sat-doanh-nghiep");
  });

  it("renders Chào bán công nghệ dropdown with marketplace, registration and supply assessment", () => {
    render(<Navbar />);

    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    const offerTrigger = within(mainNav).getByRole("link", { name: /^Công nghệ$/i });
    expect(offerTrigger).toHaveAttribute("href", "/chao-ban-cong-nghe");

    const createOfferLink = within(mainNav).getByRole("link", { name: /Đăng Chào bán Công nghệ mới/i });
    expect(createOfferLink).toHaveAttribute("href", "/portal/seller/technologies/create");

    const supplySurveyLink = within(mainNav).getByRole("link", { name: /Khảo sát Năng lực Cung/i });
    expect(supplySurveyLink).toHaveAttribute("href", "/khao-sat-cong-nghe");
  });

  it("renders Doanh nghiệp ĐMST dropdown with catalog, DMST 43 criteria and TT17", () => {
    render(<Navbar />);

    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    const enterpriseTrigger = within(mainNav).getByRole("link", { name: /^DN ĐMST$/i });
    expect(enterpriseTrigger).toHaveAttribute("href", "/doanh-nghiep-dmst");

    const dmstLink = within(mainNav).getByRole("link", { name: /Khảo sát Năng lực ĐMST/i });
    expect(dmstLink).toHaveAttribute("href", "/khao-sat-dmst");

    const tt17Link = within(mainNav).getByRole("link", { name: /Đánh giá Năng lực TT 17/i });
    expect(tt17Link).toHaveAttribute("href", "/assessments/tt17/wizard");
  });

  it("renders Dịch vụ khác dropdown containing SHTT, Radar and buyer assessment links", () => {
    render(<Navbar />);

    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    const servicesTrigger = within(mainNav).getByRole("link", { name: /^Dịch vụ$/i });
    expect(servicesTrigger).toHaveAttribute("href", "/dich-vu-khac");

    const radarLink = within(mainNav).getByRole("link", { name: /Radar Ghép nối Cung - Cầu/i });
    expect(radarLink).toHaveAttribute("href", "/portal/matching/radar");

    const buyerLink = within(mainNav).getByRole("link", { name: /Thẩm định Hồ sơ Công nghệ/i });
    expect(buyerLink).toHaveAttribute("href", "/assessments/buyer");
  });

  it("handles mouse hover and click toggle on Chuyên gia dropdown", async () => {
    render(<Navbar />);

    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    const expertTrigger = within(mainNav).getByRole("link", { name: /^Chuyên gia$/i });

    // Initial state: aria-expanded is false
    expect(expertTrigger).toHaveAttribute("aria-expanded", "false");

    // Mouse enter on trigger
    fireEvent.mouseEnter(expertTrigger.closest(".relative")!);
    expect(expertTrigger).toHaveAttribute("aria-expanded", "true");

    // Click trigger toggles dropdown off
    fireEvent.click(expertTrigger);
    expect(expertTrigger).toHaveAttribute("aria-expanded", "false");

    // Click trigger toggles dropdown back on
    fireEvent.click(expertTrigger);
    expect(expertTrigger).toHaveAttribute("aria-expanded", "true");
  });
});
