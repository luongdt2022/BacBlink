import { test, expect, Page } from "@playwright/test";
import { execFileSync } from "child_process";

/**
 * CR-BACLINK-007 — T-00.BL07.06: Full-Web Black-Box & Deep DB Live Sweep
 * Kỷ luật: ZERO-MOCK (Tuyệt đối không chặn mạng hay giả lập API/token).
 * Chạy trực tiếp trên Web Production (http://localhost:3001) + API (http://localhost:5080) + PostgreSQL thật (nacentech-postgres-1).
 */

const API_BASE = "http://localhost:5080";

const BANNED_UI_PATTERNS: Array<{ label: string; regex: RegExp }> = [
  { label: "\\bTT17\\b", regex: /\bTT17\b/i },
  { label: "Thông tư 17", regex: /Thông tư 17/i },
  { label: "Phiếu khảo sát", regex: /Phiếu khảo sát/i },
  { label: "43 câu", regex: /43 câu/i },
  { label: "Bộ tam hợp", regex: /Bộ tam hợp/i },
  { label: "Sở KH&CN", regex: /Sở KH&CN/i },
  { label: "Sở Khoa học", regex: /Sở Khoa học/i },
  { label: "Bộ KH&CN", regex: /Bộ KH&CN/i },
  { label: "Bộ Khoa học và Công nghệ", regex: /Bộ Khoa học và Công nghệ/i },
  { label: "Cục ĐMST", regex: /Cục ĐMST/i },
  { label: "34 tỉnh", regex: /34 tỉnh/i },
  { label: "63 tỉnh", regex: /63 tỉnh/i },
  { label: "Địa phương phụ trách", regex: /Địa phương phụ trách/i },
  { label: "Cổng công vụ", regex: /Cổng công vụ/i },
  { label: "PROVINCIAL_ADMIN", regex: /PROVINCIAL_ADMIN/i },
  { label: "PROVINCE_OFFICER", regex: /PROVINCE_OFFICER/i },
  { label: "SUPER_ADMIN", regex: /SUPER_ADMIN/i },
  { label: "NacenTech", regex: /NacenTech/i },
  { label: "NacenTwin", regex: /NacenTwin/i },
  { label: "Doanh nghiệp ĐMST", regex: /Doanh nghiệp ĐMST/i },
  { label: "\\bDN ĐMST\\b", regex: /\bDN ĐMST\b/i },
];

function queryPostgres(sql: string): string {
  return execFileSync(
    "docker",
    ["exec", "nacentech-postgres-1", "psql", "-t", "-A", "-U", "postgres", "-d", "nacentech", "-c", sql],
    { encoding: "utf-8" }
  ).trim();
}

async function waitForPageReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(800);
}

async function assertZeroBannedUiPatterns(page: Page, contextLabel: string) {
  await waitForPageReady(page);

  const snapshot = await page.evaluate(() => {
    const visibleText = document.body?.innerText || "";
    const optionTexts = Array.from(document.querySelectorAll("select option"))
      .map((opt) => (opt.textContent || "").trim())
      .filter(Boolean)
      .join(" | ");
    return {
      url: window.location.href,
      visibleText,
      optionTexts,
      combined: `${visibleText}\n[SELECT_OPTIONS]: ${optionTexts}`,
    };
  });

  const violations: string[] = [];
  for (const pat of BANNED_UI_PATTERNS) {
    const match = snapshot.combined.match(pat.regex);
    if (match) {
      const idx = match.index ?? 0;
      const snippet = snapshot.combined
        .slice(Math.max(0, idx - 50), Math.min(snapshot.combined.length, idx + 80))
        .replace(/\s+/g, " ");
      violations.push(`[${pat.label}] matched "${match[0]}" near: "...${snippet}..."`);
    }
  }

  expect(
    violations,
    `Vi phạm từ khóa cấm trên [${contextLabel}] (URL: ${snapshot.url}):\n${violations.join("\n")}`
  ).toEqual([]);
}

async function loginViaRealUi(page: Page, email: string, password = "Password@123") {
  await page.goto("/login");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.goto("/login");
  await assertZeroBannedUiPatterns(page, `/login (trước đăng nhập ${email})`);

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /Đăng nhập vào Hệ Thống/i }).click();

  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 15000 });
  await waitForPageReady(page);
}

test.describe("CR-BACLINK-007 Full-Stack Live Verification & Zero-Mock E2E Sweep", () => {
  test.setTimeout(180000);

  test("Tầng 2 & Tầng 3: Đối soát API Contract & Dữ liệu PostgreSQL thật (Zero-Mock)", async ({ request }) => {
    const activeSectorsCount = Number(
      queryPostgres("SELECT count(*) FROM policy.taxonomy_terms WHERE kind='SECTOR' AND is_active=true AND code LIKE 'IND_%';")
    );
    expect(activeSectorsCount).toBe(8);

    const enterprisesCount = Number(queryPostgres("SELECT count(*) FROM enterprise.enterprises;"));
    expect(enterprisesCount).toBe(7);

    const offersCount = Number(queryPostgres("SELECT count(*) FROM technology.seller_technology_offers WHERE offer_code LIKE 'OFF-BL-%';"));
    expect(offersCount).toBe(10);

    const demandsCount = Number(queryPostgres("SELECT count(*) FROM demand.demand_items WHERE item_code LIKE 'DMD-BL-%';"));
    expect(demandsCount).toBe(8);

    const expertsCount = Number(queryPostgres("SELECT count(*) FROM brokerage.expert_profiles WHERE expert_code LIKE 'CG-BL-%';"));
    expect(expertsCount).toBe(5);

    const lmsCount = Number(queryPostgres("SELECT count(*) FROM lms.learning_materials WHERE material_code LIKE 'LMS-BL-%';"));
    expect(lmsCount).toBe(6);

    const tt17AssessmentsCount = Number(queryPostgres("SELECT count(*) FROM assessment.tt17_assessments;"));
    expect(tt17AssessmentsCount).toBe(0);

    const tt17PoliciesCount = Number(
      queryPostgres("SELECT count(*) FROM blockchain.anchor_policies WHERE entity_type='TT17_ASSESSMENT';")
    );
    expect(tt17PoliciesCount).toBe(0);

    const legacyRolesCount = Number(
      queryPostgres("SELECT count(*) FROM identity.persons WHERE platform_role NOT IN ('ADMIN', 'ENTERPRISE', 'PUBLIC_USER');")
    );
    expect(legacyRolesCount).toBe(0);

    const statsRes = await request.get(`${API_BASE}/api/v1/portal/stats`);
    expect(statsRes.ok()).toBe(true);
    const statsBody = await statsRes.json();
    expect(statsBody.data.totalOffers).toBe(10);
    expect(statsBody.data.totalDemands).toBe(8);
    expect(statsBody.data.totalEnterprises).toBe(7);
    expect(statsBody.data.totalExperts).toBe(5);

    const sectorsRes = await request.get(`${API_BASE}/api/v1/sectors`);
    expect(sectorsRes.ok()).toBe(true);
    const sectorsText = await sectorsRes.text();
    for (const pat of BANNED_UI_PATTERNS) {
      expect(sectorsText).not.toMatch(pat.regex);
    }
  });

  test("Nhóm 1: Quét toàn bộ 20+ màn hình Công khai, Mega-menu, Footer, Quick-Login & Trang chi tiết", async ({ page }) => {
    await page.goto("/");
    await assertZeroBannedUiPatterns(page, "Public / (Trang chủ)");

    const navButtons = page.locator("header nav button, header button");
    const navBtnCount = await navButtons.count();
    for (let i = 0; i < Math.min(navBtnCount, 6); i++) {
      const btn = navButtons.nth(i);
      if (await btn.isVisible()) {
        await btn.hover().catch(() => {});
        await page.waitForTimeout(150);
        await assertZeroBannedUiPatterns(page, `Header Hover Menu #${i + 1}`);
      }
    }

    const publicStaticRoutes = [
      "/gioi-thieu",
      "/tin-tuc",
      "/doanh-nghiep-dmst",
      "/dich-vu-khac",
      "/huong-dan",
      "/matrix",
      "/wireframes",
      "/login",
      "/register",
    ];
    for (const route of publicStaticRoutes) {
      await page.goto(route);
      await assertZeroBannedUiPatterns(page, `Public ${route}`);
    }

    await page.goto("/tin-tuc");
    const newsDetailLink = page.locator('a[href^="/tin-tuc/"]').first();
    if ((await newsDetailLink.count()) > 0) {
      const newsHref = await newsDetailLink.getAttribute("href");
      if (newsHref) {
        await page.goto(newsHref);
        await assertZeroBannedUiPatterns(page, `Public News Detail ${newsHref}`);
      }
    }

    await page.goto("/chao-ban-cong-nghe");
    await page.waitForTimeout(600);
    await assertZeroBannedUiPatterns(page, "Public /chao-ban-cong-nghe");
    const offerId = queryPostgres("SELECT id FROM technology.seller_technology_offers WHERE offer_code='OFF-BL-2026-001' LIMIT 1;");
    await page.goto(`/chao-ban-cong-nghe/${offerId}`);
    await page.waitForTimeout(600);
    await assertZeroBannedUiPatterns(page, `Public /chao-ban-cong-nghe/${offerId}`);

    await page.goto("/nhu-cau-cong-nghe");
    await page.waitForTimeout(600);
    await assertZeroBannedUiPatterns(page, "Public /nhu-cau-cong-nghe");
    const demandId = queryPostgres("SELECT id FROM demand.demand_items WHERE item_code='DMD-BL-2026-001' LIMIT 1;");
    await page.goto(`/nhu-cau-cong-nghe/${demandId}`);
    await page.waitForTimeout(600);
    await assertZeroBannedUiPatterns(page, `Public /nhu-cau-cong-nghe/${demandId}`);

    await page.goto("/enterprises");
    await page.waitForTimeout(600);
    await assertZeroBannedUiPatterns(page, "Public /enterprises");
    await page.goto("/enterprises/0101420901");
    await page.waitForTimeout(600);
    await expect(page.locator("body")).toContainText(/Hanel PT/i);
    await assertZeroBannedUiPatterns(page, "Public /enterprises/0101420901 (Hanel PT)");

    await page.goto("/experts");
    await page.waitForTimeout(600);
    await assertZeroBannedUiPatterns(page, "Public /experts");
    await page.goto("/experts/CG-BL-001");
    await page.waitForTimeout(600);
    await assertZeroBannedUiPatterns(page, "Public /experts/CG-BL-001");

    await page.goto("/elearning");
    await page.waitForTimeout(600);
    await assertZeroBannedUiPatterns(page, "Public /elearning");
    const lmsId = queryPostgres("SELECT id FROM lms.learning_materials WHERE material_code='LMS-BL-001' LIMIT 1;");
    await page.goto(`/elearning/${lmsId}`);
    await page.waitForTimeout(600);
    await assertZeroBannedUiPatterns(page, `Public /elearning/${lmsId} (LMS-BL-001)`);
  });

  test("Nhóm 2: Kiểm thử Phá hoại 14 Đường dẫn Đã Gỡ Bỏ (100% Redirect & 0 Form Khảo Sát / Sở / TT17)", async ({ page }) => {
    const removedRoutes = [
      "/khao-sat-nhu-cau",
      "/khao-sat-doanh-nghiep",
      "/khao-sat-cong-nghe",
      "/khao-sat-dmst",
      "/dieu-tra-trinh-do-nang-luc",
      "/assessments/tt17",
      "/assessments/tt17/wizard",
      "/assessments/buyer",
      "/admin/assessments/records",
      "/admin/assessments/tt17",
      "/admin/org-tree",
      "/gov",
      "/gov/approvals",
      "/governance/approvals",
    ];

    for (const oldPath of removedRoutes) {
      await page.goto(oldPath);
      await page.waitForTimeout(700);
      const finalPath = new URL(page.url()).pathname;
      expect(finalPath, `Đường dẫn cũ ${oldPath} không được phép đứng yên tại chỗ`).not.toBe(oldPath);
      await assertZeroBannedUiPatterns(page, `Removed Route Redirect ${oldPath} -> ${finalPath}`);
    }
  });

  test("Nhóm 3A: Đăng nhập thật guest@baclink.org.vn (PUBLIC_USER) & Kiểm thử Chặn RBAC /admin", async ({ page }) => {
    await loginViaRealUi(page, "guest@baclink.org.vn");

    const userRole = await page.evaluate(() => {
      const raw = window.localStorage.getItem("nacentwin_user_context");
      return raw ? JSON.parse(raw).role : null;
    });
    expect(userRole).toBe("PUBLIC_USER");

    const guestRoutes = ["/portal", "/profile", "/profile/upgrade", "/profile/upgrade/expert", "/settings"];
    for (const route of guestRoutes) {
      await page.goto(route);
      await page.waitForTimeout(500);
      await assertZeroBannedUiPatterns(page, `PUBLIC_USER ${route}`);
    }

    await page.goto("/admin");
    await page.waitForTimeout(900);
    const afterAdminAttempt = new URL(page.url()).pathname;
    const bodyText = await page.evaluate(() => document.body.innerText);
    const isBlockedOrRedirected =
      !afterAdminAttempt.startsWith("/admin") ||
      /không có quyền|truy cập bị từ chối|yêu cầu quyền|đăng nhập/i.test(bodyText);
    expect(isBlockedOrRedirected, `PUBLIC_USER không được phép xem nội dung /admin (URL: ${afterAdminAttempt})`).toBe(
      true
    );
    await assertZeroBannedUiPatterns(page, "PUBLIC_USER RBAC Block /admin");
  });

  test("Nhóm 3B: Đăng nhập thật member.hanelpt@baclink.org.vn (ENTERPRISE Dual-Mode BUYER <-> SELLER + DB Sync)", async ({
    page,
  }) => {
    await loginViaRealUi(page, "member.hanelpt@baclink.org.vn");

    const initialAuth = await page.evaluate(() => {
      const raw = window.localStorage.getItem("nacentwin_user_context");
      return raw ? JSON.parse(raw) : null;
    });
    expect(initialAuth?.role).toBe("ENTERPRISE");

    const buyerRoutes = [
      "/portal",
      "/portal/buyer/demands",
      "/portal/buyer/consultations",
      "/portal/opportunities/pipeline",
      "/portal/matching/radar",
      "/portal/enterprise/profile",
    ];
    for (const route of buyerRoutes) {
      await page.goto(route);
      await page.waitForTimeout(600);
      await assertZeroBannedUiPatterns(page, `ENTERPRISE (BUYER) ${route}`);

      if (route === "/portal/buyer/demands") {
        const openModalBtn = page
          .getByRole("button", { name: /Đăng nhu cầu|Tạo nhu cầu|Thêm nhu cầu/i })
          .first();
        if ((await openModalBtn.count()) > 0 && (await openModalBtn.isVisible())) {
          await openModalBtn.click();
          await page.waitForTimeout(400);
          await assertZeroBannedUiPatterns(page, "ENTERPRISE QuickDemandModal Open");
          await page.keyboard.press("Escape").catch(() => {});
        }
      }
    }

    await page.goto("/portal");
    await page.waitForTimeout(600);
    const sellerSwitchBtn = page.getByRole("button", { name: /^Bên Bán$|^Bán$/i }).first();
    await expect(sellerSwitchBtn).toBeVisible();
    await sellerSwitchBtn.click();
    await page.waitForTimeout(800);

    const afterSwitchAuth = await page.evaluate(() => {
      const raw = window.localStorage.getItem("nacentwin_user_context");
      return {
        user: raw ? JSON.parse(raw) : null,
        activeRole: window.localStorage.getItem("nacentwin_active_role"),
      };
    });
    expect(afterSwitchAuth.user?.role).toBe("ENTERPRISE");
    expect(afterSwitchAuth.activeRole).toBe("SELLER");

    const dbActiveRole = queryPostgres(
      "SELECT active_role FROM enterprise.enterprises WHERE tax_code='0101420901';"
    );
    expect(dbActiveRole).toBe("SELLER");

    const sellerRoutes = [
      "/portal",
      "/portal/seller/technologies",
      "/portal/seller/technologies/create",
      "/portal/seller/connection-requests",
    ];
    for (const route of sellerRoutes) {
      await page.goto(route);
      await page.waitForTimeout(600);
      await assertZeroBannedUiPatterns(page, `ENTERPRISE (SELLER) ${route}`);
    }

    await page.goto("/portal");
    await page.waitForTimeout(500);
    const buyerSwitchBtn = page.getByRole("button", { name: /^Bên Mua$|^Mua$/i }).first();
    if (await buyerSwitchBtn.isVisible()) {
      await buyerSwitchBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test("Nhóm 3C: Đăng nhập thật khoi.nm@baclink.org.vn (Cố vấn kỹ thuật CG-BL-001) & Quét Workspace", async ({ page }) => {
    await loginViaRealUi(page, "khoi.nm@baclink.org.vn");

    const expertRoutes = [
      "/portal/expert/profile",
      "/portal/expert/profile/edit",
      "/portal/expert/consultations",
      "/portal/expert/projects",
      "/portal/expert/account",
      "/portal/expert/elearning",
    ];
    for (const route of expertRoutes) {
      await page.goto(route);
      await page.waitForTimeout(600);
      await assertZeroBannedUiPatterns(page, `EXPERT (CG-BL-001) ${route}`);
    }
  });

  test("Nhóm 3D: Đăng nhập thật admin@baclink.org.vn (ADMIN) & Quét toàn bộ 10 màn hình Quản trị + Modals", async ({
    page,
  }) => {
    await loginViaRealUi(page, "admin@baclink.org.vn");

    const adminAuth = await page.evaluate(() => {
      const raw = window.localStorage.getItem("nacentwin_user_context");
      return raw ? JSON.parse(raw) : null;
    });
    expect(adminAuth?.role).toBe("ADMIN");

    const adminRoutes = [
      "/admin",
      "/admin/approvals",
      "/admin/users",
      "/admin/roles",
      "/admin/sectors",
      "/admin/elearning",
      "/admin/audit-logs",
      "/admin/system-config",
      "/admin/blockchain",
      "/admin/enterprises/dashboard",
    ];

    for (const route of adminRoutes) {
      await page.goto(route);
      await page.waitForTimeout(700);
      await assertZeroBannedUiPatterns(page, `ADMIN ${route}`);

      if (route === "/admin/sectors") {
        const pageText = await page.evaluate(() => document.body.innerText);
        expect(pageText).not.toMatch(/Phân loại TT17|Cây Tổ Chức|Triển lãm KH&CN/i);
      }

      if (route === "/admin/elearning") {
        const createLmsBtn = page.getByRole("button", { name: /Đăng bài học mới/i });
        await expect(createLmsBtn).toBeVisible();
        await createLmsBtn.click();
        await page.waitForTimeout(400);
        await assertZeroBannedUiPatterns(page, "ADMIN /admin/elearning Modal Tab A");

        const optionValues = await page.evaluate(() =>
          Array.from(document.querySelectorAll("select option")).map((o) => (o as HTMLOptionElement).value)
        );
        for (const code of ["IND_ELEC", "IND_MECH", "IND_AUTO", "IND_PLAS", "IND_MAT", "IND_IT", "IND_GREEN", "IND_LOG"]) {
          expect(optionValues).toContain(code);
        }

        const tabDBtn = page.getByRole("button", { name: /Tab D/i });
        await expect(tabDBtn).toBeVisible();
        await tabDBtn.click();
        await page.waitForTimeout(300);
        await assertZeroBannedUiPatterns(page, "ADMIN /admin/elearning Modal Tab D");
        await page.keyboard.press("Escape").catch(() => {});
      }

      if (route === "/admin/blockchain") {
        await page.goto("/admin/blockchain?tab=ledger");
        await page.waitForTimeout(600);
        await assertZeroBannedUiPatterns(page, "ADMIN /admin/blockchain?tab=ledger");
        const verifierOptions = await page.evaluate(() =>
          Array.from(document.querySelectorAll("select option")).map((o) => o.textContent || "")
        );
        expect(verifierOptions.join(" ")).not.toMatch(/TT17_ASSESSMENT|TT17/i);
      }
    }
  });
});
