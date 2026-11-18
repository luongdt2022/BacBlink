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

  it("renders Cố vấn dropdown containing E-Learning and expert catalog links", () => {
    render(<Navbar />);

    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    const expertTrigger = within(mainNav).getByRole("link", { name: /^Cố vấn$/i });
    expect(expertTrigger).toHaveAttribute("href", "/experts");

    // Sub-items inside Cố vấn dropdown
    const elearningLink = within(mainNav).getByRole("link", { name: /E-Learning & Đào tạo/i });
    expect(elearningLink).toHaveAttribute("href", "/elearning");
    expect(within(elearningLink).getByText("LMS")).toBeInTheDocument();

    const expertCatalogLink = within(mainNav).getByRole("link", { name: /^Mạng lưới Chuyên gia/i });
    expect(expertCatalogLink).toHaveAttribute("href", "/experts");

    const expertUpgradeLink = within(mainNav).getByRole("link", { name: /^Đăng ký Chuyên gia/i });
    expect(expertUpgradeLink).toHaveAttribute("href", "/profile/upgrade/expert");
  });

  it("renders Nhu cầu dropdown with marketplace link and excludes survey forms", () => {
    render(<Navbar />);

    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    const demandTrigger = within(mainNav).getByRole("link", { name: /^Nhu cầu$/i });
    expect(demandTrigger).toHaveAttribute("href", "/nhu-cau-cong-nghe");

    const demandListLink = within(mainNav).getByRole("link", { name: /Bảng Nhu cầu Mua & Đặt hàng/i });
    expect(demandListLink).toHaveAttribute("href", "/nhu-cau-cong-nghe");

    expect(within(mainNav).queryByRole("link", { name: /Khảo sát/i })).not.toBeInTheDocument();
  });

  it("renders Chào bán công nghệ dropdown with marketplace, registration and excludes supply survey", () => {
    render(<Navbar />);

    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    const offerTrigger = within(mainNav).getByRole("link", { name: /^Cung ứng$/i });
    expect(offerTrigger).toHaveAttribute("href", "/chao-ban-cong-nghe");

    const createOfferLink = within(mainNav).getByRole("link", { name: /Đăng Chào bán Công nghệ mới/i });
    expect(createOfferLink).toHaveAttribute("href", "/portal/seller/technologies/create");

    expect(within(mainNav).queryByRole("link", { name: /Khảo sát/i })).not.toBeInTheDocument();
  });

  it("renders Hội viên dropdown with catalog and excludes legacy surveys", () => {
    render(<Navbar />);

    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    const enterpriseTrigger = within(mainNav).getByRole("link", { name: /^Hội viên$/i });
    expect(enterpriseTrigger).toHaveAttribute("href", "/doanh-nghiep-dmst");

    expect(within(mainNav).getByRole("link", { name: /Danh bạ Doanh nghiệp$/i })).toBeInTheDocument();
    expect(within(mainNav).queryByRole("link", { name: /Khảo sát/i })).not.toBeInTheDocument();
  });

  it("renders Dịch vụ khác dropdown containing SHTT, valuation, FDI supply chain consulting and Radar links", () => {
    render(<Navbar />);

    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    const servicesTrigger = within(mainNav).getByRole("link", { name: /^Dịch vụ$/i });
    expect(servicesTrigger).toHaveAttribute("href", "/dich-vu-khac");

    const shttLink = within(mainNav).getByRole("link", { name: /Tư vấn & Bảo hộ SHTT/i });
    expect(shttLink).toHaveAttribute("href", "/dich-vu-khac");

    const valuationLink = within(mainNav).getByRole("link", { name: /Thẩm định & Định giá Công nghệ/i });
    expect(valuationLink).toHaveAttribute("href", "/dich-vu-khac#dinh-gia-cong-nghe");

    const fdiChainLink = within(mainNav).getByRole("link", { name: /Tư vấn Chuẩn hóa Chuỗi cung ứng FDI/i });
    expect(fdiChainLink).toHaveAttribute("href", "/dich-vu-khac#chuoi-cung-ung-fdi");

    const radarLink = within(mainNav).getByRole("link", { name: /Radar Ghép nối Cung - Cầu/i });
    expect(radarLink).toHaveAttribute("href", "/portal/matching/radar");
    expect(within(radarLink).getByText("AI")).toBeInTheDocument();
  });

  it("handles mouse hover and click toggle on Cố vấn dropdown", async () => {
    render(<Navbar />);

    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    const expertTrigger = within(mainNav).getByRole("link", { name: /^Cố vấn$/i });

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

  it("renders Giới thiệu dropdown containing guide, wireframes, and legal framework, and excludes top-level Hướng dẫn", () => {
    render(<Navbar />);

    const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });

    // Top-level item Hướng dẫn must be removed
    expect(within(mainNav).queryByRole("link", { name: /^Hướng dẫn$/i })).not.toBeInTheDocument();

    // Giới thiệu trigger exists
    const aboutTrigger = within(mainNav).getByRole("link", { name: /^Giới thiệu$/i });
    expect(aboutTrigger).toHaveAttribute("href", "/gioi-thieu");

    // Contains the 2 moved items and original items
    const guideLink = within(mainNav).getByRole("link", { name: /Trung tâm Hướng dẫn Toàn trình/i });
    expect(guideLink).toHaveAttribute("href", "/huong-dan");

    const wireframesLink = within(mainNav).getByRole("link", { name: /Sơ đồ Kiến trúc Chức năng/i });
    expect(wireframesLink).toHaveAttribute("href", "/wireframes");

    const aboutSubLink = within(mainNav).getByRole("link", { name: /Về Hiệp hội BACLINK/i });
    expect(aboutSubLink).toHaveAttribute("href", "/gioi-thieu");

    const matrixLink = within(mainNav).getByRole("link", { name: /Khung Pháp lý & Chuẩn mực/i });
    expect(matrixLink).toHaveAttribute("href", "/matrix");
  });
});
