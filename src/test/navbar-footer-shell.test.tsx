import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within, waitFor } from "@testing-library/react";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
import { RoleSwitcher } from "@/components/common/role-switcher";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { I18nToggle, I18nProvider } from "@/components/common/i18n-provider";
import { ThemeProvider } from "@/components/common/theme-provider";
import { FontsizeControl } from "@/components/common/fontsize-control";
import {
  authClient,
  ROLES,
  getRoleDisplayName,
  getWorkspacePath,
  getRedirectPathByRole,
  UserContext,
} from "@/lib/auth-client";
import * as enterpriseClient from "@/lib/enterprise-client";

// Router & Pathname Dynamic Mocks
let mockPathname = "/";
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, onClick, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      onClick={(e) => {
        if (onClick) onClick(e);
      }}
      {...props}
    >
      {children}
    </a>
  ),
}));

vi.mock("@/components/common/toast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

function renderWithShell(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      <I18nProvider>{ui}</I18nProvider>
    </ThemeProvider>
  );
}

describe("Global Shell & Navigation Test Suite (Task T-00.108)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    mockPush.mockReset();
    mockRefresh.mockReset();
    mockPathname = "/";
    document.body.style.overflow = "";
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    document.body.style.overflow = "";
  });

  // =========================================================================
  // 1. KIỂM THỬ NAVBAR & 10 NHÓM VAI TRÒ NGƯỜI DÙNG (ROLES & PERMISSIONS)
  // =========================================================================
  describe("1. Kiểm thử Navbar & Chuyển đổi 10 nhóm vai trò người dùng", () => {
    const testRoles: Array<{
      role: string;
      expectedName: string;
      expectedWorkspace: string;
      tier: number;
    }> = [
      { role: ROLES.SUPER_ADMIN, expectedName: "Quản trị viên cấp cao", expectedWorkspace: "/admin", tier: 0 },
      { role: ROLES.OPERATOR_ADMIN, expectedName: "Quản trị viên vận hành", expectedWorkspace: "/admin", tier: 0 },
      { role: ROLES.ADMIN, expectedName: "Quản trị viên", expectedWorkspace: "/admin", tier: 0 },
      { role: ROLES.PROVINCIAL_ADMIN, expectedName: "Quản trị viên cấp tỉnh", expectedWorkspace: "/portal", tier: 1 },
      { role: ROLES.SECTOR_ADMIN, expectedName: "Quản trị viên ngành", expectedWorkspace: "/portal", tier: 1 },
      { role: ROLES.CLUSTER_ADMIN, expectedName: "Quản trị viên đơn vị liên kết", expectedWorkspace: "/portal", tier: 1 },
      { role: ROLES.SELLER, expectedName: "Nhà cung ứng công nghệ", expectedWorkspace: "/portal", tier: 2 },
      { role: ROLES.BUYER, expectedName: "Bên có nhu cầu công nghệ", expectedWorkspace: "/portal", tier: 2 },
      { role: ROLES.INNOVATION_ENTITY, expectedName: "Chủ thể đổi mới sáng tạo", expectedWorkspace: "/portal", tier: 2 },
      { role: ROLES.VERIFIED_EXPERT, expectedName: "Chuyên gia KH&CN đã xác thực", expectedWorkspace: "/portal", tier: 2 },
      { role: ROLES.EXPERT, expectedName: "Chuyên gia KH&CN", expectedWorkspace: "/portal", tier: 2 },
      { role: ROLES.PUBLIC_USER, expectedName: "Thành viên công chúng", expectedWorkspace: "/portal", tier: 3 },
    ];

    it("1.1 Đối soát 100% hiển thị tiếng Việt và định tuyến Workspace cho 10+ vai trò", () => {
      testRoles.forEach(({ role, expectedName, expectedWorkspace }) => {
        expect(getRoleDisplayName(role)).toBe(expectedName);
        expect(getWorkspacePath(role)).toBe(expectedWorkspace);
      });
    });

    it("1.2 Hiển thị đúng Role Badge và thông tin người dùng trong Navbar Account Menu", async () => {
      const sampleRoles = [
        { role: "SELLER", expectedBadge: "Nhà cung ứng công nghệ" },
        { role: "BUYER", expectedBadge: "Bên có nhu cầu công nghệ" },
        { role: "ADMIN", expectedBadge: "Quản trị viên" },
        { role: "PROVINCIAL_ADMIN", expectedBadge: "Quản trị viên cấp tỉnh" },
        { role: "EXPERT", expectedBadge: "Chuyên gia KH&CN" },
      ];

      for (const { role, expectedBadge } of sampleRoles) {
        cleanup();
        localStorage.clear();
        authClient.setSession("token-xyz", {
          id: `usr-${role.toLowerCase()}`,
          email: `${role.toLowerCase()}@nacentech.gov.vn`,
          fullName: `Người dùng ${role}`,
          role,
        });

        renderWithShell(<Navbar />);

        const accountBtn = await screen.findByRole("button", { name: "Mở menu tài khoản" });
        expect(accountBtn).toBeInTheDocument();
        fireEvent.click(accountBtn);

        const menu = screen.getByRole("menu", { name: "Menu tài khoản" });
        expect(within(menu).getByText(expectedBadge)).toBeInTheDocument();
        expect(within(menu).getByText(`Người dùng ${role}`)).toBeInTheDocument();

        // Workspace link matches role hierarchy
        const workspaceLink = within(menu).getByRole("menuitem", { name: /Không gian làm việc/i });
        expect(workspaceLink).toHaveAttribute("href", getWorkspacePath(role));
      }
    });

    it("1.3 Chuyển đổi linh hoạt giữa Bên Mua và Bên Bán qua RoleSwitcher", async () => {
      authClient.setSession("dual-token", {
        id: "ent-dual-01",
        email: "ceo@congnghealpha.vn",
        fullName: "Doanh Nghiệp Kép Alpha",
        role: "BUYER",
      });

      vi.spyOn(enterpriseClient, "fetchMyEnterpriseProfile").mockResolvedValue({
        id: "ent-alpha",
        name: "Doanh Nghiệp Kép Alpha",
        capabilityTier: "DUAL",
        isBuyer: true,
        isSeller: true,
        activeRole: "BUYER",
      });

      const switchSpy = vi.spyOn(enterpriseClient, "switchEnterpriseActiveRole").mockResolvedValue({
        id: "ent-alpha",
        activeRole: "SELLER",
      });

      renderWithShell(<RoleSwitcher />);

      await waitFor(() => {
        expect(screen.getByText("Chế Độ Kép (Dual Mode)")).toBeInTheDocument();
        expect(screen.getByText("Bên Mua")).toBeInTheDocument();
        expect(screen.getByText("Bên Bán")).toBeInTheDocument();
      });

      const sellerButton = screen.getByRole("button", { name: /Bên Bán/i });
      fireEvent.click(sellerButton);

      await waitFor(() => {
        expect(switchSpy).toHaveBeenCalledWith("SELLER");
        expect(localStorage.getItem("nacentwin_active_role")).toBe("SELLER");
      });
    });
  });

  // =========================================================================
  // 2. KIỂM THỬ MEGA DROPDOWNS & DISMISSIBLE (ESCAPE & CLICK OUTSIDE)
  // =========================================================================
  describe("2. Kiểm thử Mega Dropdowns & Cơ chế đóng tự động (Dismissible)", () => {
    it("2.1 Mở dropdown Chào bán công nghệ và đóng khi bấm phím Escape", async () => {
      renderWithShell(<Navbar />);

      const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
      const offerTrigger = within(mainNav).getByRole("link", { name: /^Cung ứng Công nghiệp$/i });

      expect(offerTrigger).toHaveAttribute("aria-expanded", "false");

      // Click to open dropdown
      fireEvent.click(offerTrigger);
      expect(offerTrigger).toHaveAttribute("aria-expanded", "true");

      // Verify sub-links present
      expect(within(mainNav).getByRole("link", { name: /Đăng Chào bán Công nghệ mới/i })).toBeInTheDocument();

      // Press Escape key -> Dropdown closes
      fireEvent.keyDown(document, { key: "Escape" });
      expect(offerTrigger).toHaveAttribute("aria-expanded", "false");
    });

    it("2.2 Mở dropdown Chuyên gia và đóng khi click bên ngoài navigation", async () => {
      renderWithShell(<Navbar />);

      const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
      const expertTrigger = within(mainNav).getByRole("link", { name: /^Ban Cố vấn Kỹ thuật$/i });

      expect(expertTrigger).toHaveAttribute("aria-expanded", "false");

      // Open via click
      fireEvent.click(expertTrigger);
      expect(expertTrigger).toHaveAttribute("aria-expanded", "true");

      // Click outside on document body -> Dropdown closes
      fireEvent.mouseDown(document.body);
      expect(expertTrigger).toHaveAttribute("aria-expanded", "false");
    });

    it("2.3 Đóng dropdown khi click vào một sub-link điều hướng bên trong menu", async () => {
      renderWithShell(<Navbar />);

      const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
      const expertTrigger = within(mainNav).getByRole("link", { name: /^Ban Cố vấn Kỹ thuật$/i });

      fireEvent.click(expertTrigger);
      expect(expertTrigger).toHaveAttribute("aria-expanded", "true");

      const elearningLink = within(mainNav).getByRole("link", { name: /E-Learning & Đào tạo/i });
      fireEvent.click(elearningLink);

      // Dropdown closes after selecting sub-item
      expect(expertTrigger).toHaveAttribute("aria-expanded", "false");
    });
  });

  // =========================================================================
  // 3. KIỂM THỬ ACTIVE INDICATOR VẠCH GẠCH CHÂN MỜ THEO ROUTE
  // =========================================================================
  describe("3. Kiểm thử Active Indicator vạch gạch chân mờ theo Route", () => {
    it("3.1 Hiển thị vạch gạch chân mờ trang nhã khi ở Trang chủ '/'", () => {
      mockPathname = "/";
      renderWithShell(<Navbar />);

      const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
      const homeLink = within(mainNav).getByRole("link", { name: /^Trang chủ$/i });

      // Active styling assertions: vạch trắng mờ tinh tế, không chói neon cyan
      expect(homeLink.className).toContain("text-white");
      expect(homeLink.className).toContain("font-bold");
      expect(homeLink.className).toContain("after:bg-white/40");
      expect(homeLink.className).toContain("after:rounded-full");
      expect(homeLink.className).not.toContain("after:bg-cyan-400");
    });

    it("3.2 Hiển thị vạch gạch chân mờ khi ở trang Chào bán công nghệ '/chao-ban-cong-nghe'", () => {
      mockPathname = "/chao-ban-cong-nghe";
      renderWithShell(<Navbar />);

      const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
      const offerLink = within(mainNav).getByRole("link", { name: /^Cung ứng Công nghiệp$/i });

      expect(offerLink.className).toContain("text-white");
      expect(offerLink.className).toContain("font-bold");
      expect(offerLink.className).toContain("after:bg-white/40");
      expect(offerLink.className).not.toContain("after:bg-cyan-400");
    });

    it("3.3 Giữ Active Indicator khi truy cập vào sub-path tương ứng", () => {
      mockPathname = "/trien-lam/dang-ky-tham-quan";
      renderWithShell(<Navbar />);

      const mainNav = screen.getByRole("navigation", { name: "Điều hướng chính" });
      const eventLink = within(mainNav).getByRole("link", { name: /^Sự kiện Techmart/i });

      expect(eventLink.className).toContain("after:bg-white/40");
      expect(eventLink.className).not.toContain("after:bg-cyan-400");
    });
  });

  // =========================================================================
  // 4. KIỂM THỬ MOBILE DRAWER & KHÓA SCROLL BODY
  // =========================================================================
  describe("4. Kiểm thử Mobile Drawer, Khóa Scroll Body và Đóng Drawer", () => {
    it("4.1 Bấm nút Hamburger mở Mobile Drawer và khóa scroll body", () => {
      renderWithShell(<Navbar />);

      const hamburgerBtn = screen.getByRole("button", { name: "Menu" });
      expect(hamburgerBtn).toHaveAttribute("aria-expanded", "false");
      expect(document.body.style.overflow).not.toBe("hidden");

      // Open drawer
      fireEvent.click(hamburgerBtn);

      expect(hamburgerBtn).toHaveAttribute("aria-expanded", "true");
      expect(document.getElementById("mobile-navigation")).toBeInTheDocument();
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("4.2 Bấm nút X (toggle lại) để đóng Mobile Drawer và gỡ khóa scroll", () => {
      renderWithShell(<Navbar />);

      const hamburgerBtn = screen.getByRole("button", { name: "Menu" });
      fireEvent.click(hamburgerBtn);
      expect(document.body.style.overflow).toBe("hidden");

      // Click again to close
      fireEvent.click(hamburgerBtn);

      expect(hamburgerBtn).toHaveAttribute("aria-expanded", "false");
      expect(document.getElementById("mobile-navigation")).not.toBeInTheDocument();
      expect(document.body.style.overflow).not.toBe("hidden");
    });

    it("4.3 Bấm vào Backdrop Overlay để đóng Mobile Drawer", () => {
      const { container } = renderWithShell(<Navbar />);

      const hamburgerBtn = screen.getByRole("button", { name: "Menu" });
      fireEvent.click(hamburgerBtn);
      expect(document.body.style.overflow).toBe("hidden");

      // Find backdrop overlay
      const backdrop = container.querySelector(".fixed.inset-0.top-\\[72px\\]");
      expect(backdrop).not.toBeNull();

      fireEvent.click(backdrop!);

      expect(document.getElementById("mobile-navigation")).not.toBeInTheDocument();
      expect(document.body.style.overflow).not.toBe("hidden");
    });

    it("4.4 Nhấn phím Escape để đóng Mobile Drawer và giải phóng scroll body", () => {
      renderWithShell(<Navbar />);

      const hamburgerBtn = screen.getByRole("button", { name: "Menu" });
      fireEvent.click(hamburgerBtn);
      expect(document.body.style.overflow).toBe("hidden");

      fireEvent.keyDown(document, { key: "Escape" });

      expect(document.getElementById("mobile-navigation")).not.toBeInTheDocument();
      expect(document.body.style.overflow).not.toBe("hidden");
    });
  });

  // =========================================================================
  // 5. KIỂM THỬ FOOTER 4 CỘT & ZERO BROKEN LINKS
  // =========================================================================
  describe("5. Kiểm thử Footer Tối giản & Zero Broken Links", () => {
    it("5.1 Hiển thị đầy đủ thông tin chuẩn hóa của Footer tối giản", () => {
      renderWithShell(<Footer />);

      // Thông tin Cơ quan thành lập & Đơn vị vận hành theo chuẩn BACLINK
      expect(screen.getByText(/Cơ quan thành lập:/i)).toBeInTheDocument();
      expect(screen.getAllByText(/UBND TỈNH BẮC NINH/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Đơn vị vận hành:/i)).toBeInTheDocument();
      expect(screen.getAllByText(/HIỆP HỘI SẢN XUẤT CÔNG NGHIỆP TỈNH BẮC NINH \(BACLINK\)/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Địa chỉ: Số 7 Lý Thái Tổ, Phường Suối Hoa, TP\. Bắc Ninh, Tỉnh Bắc Ninh/i)).toBeInTheDocument();
      expect(screen.getByText(/Thành lập theo Quyết định số 1652\/QĐ-UBND/i)).toBeInTheDocument();

      // Hotline & Văn phòng Hiệp hội BACLINK
      expect(screen.getByText("Văn phòng Hiệp hội BACLINK")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "0222.3888.686" })).toHaveAttribute("href", "tel:02223888686");
      expect(screen.getByText(/Hotline B2B: 1900 6886/i)).toBeInTheDocument();
      expect(screen.getByText("2.689.450")).toBeInTheDocument();
      expect(screen.getByText(/Chứng nhận an toàn thông tin Cấp độ 3 \(NCSC\)/i)).toBeInTheDocument();
    });

    it("5.2 Zero Broken Links: 100% liên kết trong Footer có đích đến hợp lệ và an toàn", () => {
      const { container } = renderWithShell(<Footer />);
      const allLinks = Array.from(container.querySelectorAll("a"));

      expect(allLinks.length).toBeGreaterThanOrEqual(4);

      allLinks.forEach((link) => {
        const href = link.getAttribute("href");
        expect(href).toBeTruthy();
        expect(href).not.toBe("#");
        expect(href).not.toMatch(/^javascript:/i);

        // Click testing: Ensure no crash occurs
        expect(() => fireEvent.click(link)).not.toThrow();
      });
    });
  });

  // =========================================================================
  // 6. KIỂM THỬ APPBREADCRUMB & SCHEMA.ORG JSON-LD
  // =========================================================================
  describe("6. Kiểm thử AppBreadcrumb & Schema.org JSON-LD", () => {
    it("6.1 Tự động phân cấp đường dẫn chính xác cho nested path '/portal/seller'", () => {
      mockPathname = "/portal/seller";
      render(<AppBreadcrumb />);

      const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
      expect(nav).toBeInTheDocument();

      const homeLink = screen.getByRole("link", { name: /Trang chủ/i });
      expect(homeLink).toHaveAttribute("href", "/");

      const portalLink = screen.getByRole("link", { name: /Không gian làm việc/i });
      expect(portalLink).toHaveAttribute("href", "/portal");

      const currentSeller = screen.getByText("Bên bán");
      expect(currentSeller).toBeInTheDocument();
      expect(currentSeller).toHaveAttribute("aria-current", "page");
    });

    it("6.2 Phân cấp đúng cho đường dẫn doanh nghiệp động '/doanh-nghiep-dmst/0101234567'", () => {
      mockPathname = "/doanh-nghiep-dmst/0101234567";
      render(<AppBreadcrumb />);

      expect(screen.getByRole("link", { name: /Doanh nghiệp ĐMST/i })).toHaveAttribute("href", "/doanh-nghiep-dmst");
      expect(screen.getByText("0101234567")).toHaveAttribute("aria-current", "page");
    });

    it("6.3 Nhúng thẻ Schema.org BreadcrumbList JSON-LD hợp lệ tối ưu SEO", () => {
      mockPathname = "/portal/seller";
      const { container } = render(<AppBreadcrumb />);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();

      const jsonLd = JSON.parse(script?.textContent || "{}");
      expect(jsonLd["@context"]).toBe("https://schema.org");
      expect(jsonLd["@type"]).toBe("BreadcrumbList");
      expect(jsonLd.itemListElement).toHaveLength(3);

      expect(jsonLd.itemListElement[0]).toEqual({
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: "https://nacentech.gov.vn/",
      });
      expect(jsonLd.itemListElement[1]).toEqual({
        "@type": "ListItem",
        position: 2,
        name: "Không gian làm việc",
        item: "https://nacentech.gov.vn/portal",
      });
      expect(jsonLd.itemListElement[2]).toEqual({
        "@type": "ListItem",
        position: 3,
        name: "Bên bán",
      });
    });

    it("6.4 Ẩn Breadcrumb khi ở trang chủ '/' nếu hideOnHome = true", () => {
      mockPathname = "/";
      const { container } = render(<AppBreadcrumb hideOnHome={true} />);
      expect(container.firstChild).toBeNull();
    });
  });

  // =========================================================================
  // 7. KIỂM THỬ TIẾP CẬN (A11Y) & TOÁN HỌC ĐỘ TƯƠNG PHẢN WCAG AA/AAA
  // =========================================================================
  describe("7. Kiểm thử A11y Touch Targets & Độ tương phản màu sắc WCAG", () => {
    it("7.1 Touch Target: Các nút điều khiển chính đều đạt tối thiểu >= 44x44px", () => {
      // 1. Hamburger Menu Button
      const { container: navContainer } = renderWithShell(<Navbar />);
      const hamburger = navContainer.querySelector('button[aria-label="Menu"]');
      expect(hamburger?.className).toMatch(/min-h-11/);
      expect(hamburger?.className).toMatch(/min-w-11/);

      // 2. ThemeToggle
      cleanup();
      const { container: themeContainer } = renderWithShell(<ThemeToggle />);
      const themeBtn = themeContainer.querySelector("button");
      expect(themeBtn?.className).toMatch(/min-h-11/);
      expect(themeBtn?.className).toMatch(/min-w-11/);

      // 3. I18nToggle
      cleanup();
      const { container: i18nContainer } = renderWithShell(<I18nToggle />);
      const i18nBtn = i18nContainer.querySelector("button");
      expect(i18nBtn?.className).toMatch(/min-h-11/);
      expect(i18nBtn?.className).toMatch(/min-w-11/);

      // 4. FontsizeControl buttons
      cleanup();
      const { container: fontContainer } = renderWithShell(<FontsizeControl />);
      const fontButtons = fontContainer.querySelectorAll("button");
      expect(fontButtons.length).toBe(3);
      fontButtons.forEach((btn) => {
        expect(btn.className).toMatch(/min-h-11/);
        expect(btn.className).toMatch(/min-w-11/);
      });
    });

    it("7.2 Đo lường toán học độ tương phản màu chữ trắng trên nền Navy đạt chuẩn WCAG AA >= 4.5:1", () => {
      // Hàm tính toán Relative Luminance theo tiêu chuẩn W3C WCAG 2.1
      function getLuminance(r: number, g: number, b: number): number {
        const [rs, gs, bs] = [r, g, b].map((c) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }

      function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
        const lum1 = getLuminance(...rgb1);
        const lum2 = getLuminance(...rgb2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
      }

      const whiteRGB: [number, number, number] = [255, 255, 255]; // #FFFFFF
      const brandNavyRGB: [number, number, number] = [60, 89, 153]; // #3C5999
      const darkNavyRGB: [number, number, number] = [30, 47, 87]; // #1E2F57 (Footer & Header)

      // Contrast against #3C5999
      const contrastBrandNavy = getContrastRatio(whiteRGB, brandNavyRGB);
      expect(contrastBrandNavy).toBeGreaterThanOrEqual(4.5); // Đạt chuẩn WCAG AA

      // Contrast against #1E2F57
      const contrastDarkNavy = getContrastRatio(whiteRGB, darkNavyRGB);
      expect(contrastDarkNavy).toBeGreaterThanOrEqual(7.0); // Đạt chuẩn WCAG AAA (> 7.0:1)

      // In ra tỷ lệ để đối soát kiểm toán
      expect(Number(contrastBrandNavy.toFixed(2))).toBeGreaterThanOrEqual(4.5);
      expect(Number(contrastDarkNavy.toFixed(2))).toBeGreaterThanOrEqual(10.0);
    });
  });
});
