import { test, expect, type Page } from '@playwright/test';

/**
 * T119 — PLAYWRIGHT E2E ZERO-MOCK (CR-2026-029)
 * Kiểm thử trực tiếp đối đầu Next.js (localhost:3000) + .NET API (localhost:5080) + PostgreSQL thật.
 * Tuyệt đối không dùng page.route(), route.fulfill(), hay fake token.
 */
const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'super.admin@demo.nacentech.vn';
const ADMIN_PASSWORD = 'Password@123';

async function loginAsSuperAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  const submitBtn = page.locator('button[type="submit"]');

  await emailInput.waitFor({ state: 'visible', timeout: 15000 });
  await emailInput.fill(ADMIN_EMAIL);
  await passwordInput.fill(ADMIN_PASSWORD);
  await expect(emailInput).toHaveValue(ADMIN_EMAIL);
  await expect(passwordInput).toHaveValue(ADMIN_PASSWORD);

  await submitBtn.click();
  await page.waitForURL(/\/admin(\/|$)/, { timeout: 25000 });
}

async function assertNoHorizontalOverflow(page: Page, label: string) {
  const overflow = await page.evaluate(() => {
    const workspace = document.querySelector('[data-testid="admin-main-workspace"]') as HTMLElement | null;
    const pageContainer = workspace?.firstElementChild as HTMLElement | null;
    const mainEl = document.querySelector('main') as HTMLElement | null;
    return {
      hasWorkspace: Boolean(workspace),
      workspaceScrollW: workspace ? workspace.scrollWidth : 0,
      workspaceClientW: workspace ? workspace.clientWidth : 0,
      pageScrollW: pageContainer ? pageContainer.scrollWidth : 0,
      pageClientW: pageContainer ? pageContainer.clientWidth : 0,
      mainScrollW: mainEl ? mainEl.scrollWidth : 0,
      mainClientW: mainEl ? mainEl.clientWidth : 0,
    };
  });
  expect(overflow.hasWorkspace, `${label}: [data-testid="admin-main-workspace"] must exist`).toBe(true);
  expect(
    overflow.workspaceScrollW,
    `${label}: workspace scrollWidth (${overflow.workspaceScrollW}) must not exceed clientWidth (${overflow.workspaceClientW})`
  ).toBeLessThanOrEqual(overflow.workspaceClientW + 2);
  expect(
    overflow.pageScrollW,
    `${label}: page container scrollWidth (${overflow.pageScrollW}) must not exceed clientWidth (${overflow.pageClientW})`
  ).toBeLessThanOrEqual(overflow.pageClientW + 2);
  if (overflow.mainClientW > 0) {
    expect(
      overflow.mainScrollW,
      `${label}: main scrollWidth (${overflow.mainScrollW}) must not exceed clientWidth (${overflow.mainClientW})`
    ).toBeLessThanOrEqual(overflow.mainClientW + 2);
  }
}

test.describe('TASK-07 CR-2026-029: Admin Route Loading, Sidebar Sync & KPI Skeleton (Zero-Mock)', () => {
  test('E2E-CR029: Real login, AdminSidebarNav tab sync, Ping-Pong A->B->A, KPI real data & Desktop/Mobile responsive', async ({
    page,
  }) => {
    test.setTimeout(120000);

    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const server5xx: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      pageErrors.push(String(err));
    });
    page.on('response', (res) => {
      if (res.status() >= 500) {
        server5xx.push(`${res.status()} ${res.url()}`);
      }
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAsSuperAdmin(page);

    // 1. /admin dashboard: real KPIs, no "Đang tải..." leftover
    await expect(
      page.getByRole('heading', { name: /Trung Tâm Điều Hành & Giám Sát Cấp Cao/i })
    ).toBeVisible({ timeout: 20000 });
    const adminKpiGrid = page.getByTestId('admin-kpi-grid');
    await expect(adminKpiGrid).toBeVisible({ timeout: 25000 });
    await expect(page.getByTestId('admin-kpi-skeleton')).toBeHidden();
    await expect(page.getByText('Đang tải...')).toHaveCount(0);
    await assertNoHorizontalOverflow(page, '/admin Desktop 1440x900');

    // 2. AdminSidebarNav active sync for /admin/approvals, ?tab=sla, ?tab=override
    const approvalsLink = page.locator('aside nav a[href="/admin/approvals"]');
    const slaLink = page.locator('aside nav a[href="/admin/approvals?tab=sla"]');
    const overrideLink = page.locator('aside nav a[href="/admin/approvals?tab=override"]');

    await approvalsLink.click();
    await page.waitForURL(/\/admin\/approvals$/, { timeout: 20000 });
    await expect(page.getByTestId('admin-route-skeleton')).toBeHidden({ timeout: 20000 });
    await expect(approvalsLink).toHaveClass(/bg-brand-700/);
    await expect(slaLink).not.toHaveClass(/bg-brand-700/);

    await slaLink.click();
    await page.waitForURL(/\/admin\/approvals\?tab=sla/, { timeout: 20000 });
    await expect(page.getByTestId('admin-route-skeleton')).toBeHidden({ timeout: 20000 });
    await expect(slaLink).toHaveClass(/bg-brand-700/);
    await expect(approvalsLink).not.toHaveClass(/bg-brand-700/);

    await overrideLink.click();
    await page.waitForURL(/\/admin\/approvals\?tab=override/, { timeout: 20000 });
    await expect(page.getByTestId('admin-route-skeleton')).toBeHidden({ timeout: 20000 });
    await expect(overrideLink).toHaveClass(/bg-brand-700/);
    await expect(slaLink).not.toHaveClass(/bg-brand-700/);

    // 3. Ping-Pong navigation A -> B -> A without stuck skeleton
    const usersLink = page.locator('aside nav a[href="/admin/users"]');
    const overviewLink = page.locator('aside nav a[href="/admin"]');

    await usersLink.click();
    await page.waitForURL(/\/admin\/users$/, { timeout: 20000 });
    await expect(page.getByTestId('admin-route-skeleton')).toBeHidden({ timeout: 20000 });

    await overviewLink.click();
    await page.waitForURL(/\/admin$/, { timeout: 20000 });
    await expect(page.getByTestId('admin-route-skeleton')).toBeHidden({ timeout: 20000 });

    await usersLink.click();
    await page.waitForURL(/\/admin\/users$/, { timeout: 20000 });
    await expect(page.getByTestId('admin-route-skeleton')).toBeHidden({ timeout: 20000 });

    // Clicking the already active link must NOT trigger stuck skeleton
    await usersLink.click();
    await expect(page.getByTestId('admin-route-skeleton')).toBeHidden();

    // 4. /admin/users real KPIs from PostgreSQL
    await expect(
      page.getByRole('heading', { name: /Trung Tâm Quản Trị Người Dùng Toàn Quốc/i })
    ).toBeVisible({ timeout: 20000 });
    const usersKpiGrid = page.getByTestId('users-kpi-grid');
    await expect(usersKpiGrid).toBeVisible({ timeout: 25000 });
    await expect(page.getByTestId('users-kpi-skeleton')).toBeHidden();
    const totalUsersText = await usersKpiGrid.locator('.text-2xl').first().innerText();
    expect(Number(totalUsersText.replace(/\D/g, ''))).toBeGreaterThan(0);
    await assertNoHorizontalOverflow(page, '/admin/users Desktop 1440x900');

    // 5. /admin/assessments/tt17 real KPIs from PostgreSQL & 1440px table non-clipping check
    const tt17Link = page.locator('aside nav a[href="/admin/assessments/tt17"]');
    await tt17Link.click();
    await page.waitForURL(/\/admin\/assessments\/tt17$/, { timeout: 20000 });
    await expect(page.getByTestId('admin-route-skeleton')).toBeHidden({ timeout: 20000 });
    await expect(
      page.getByRole('heading', { name: /Dashboard Đánh Giá Trình Độ & Năng Lực Công Nghệ Doanh Nghiệp/i })
    ).toBeVisible({ timeout: 20000 });
    const tt17KpiGrid = page.getByTestId('tt17-kpi-grid');
    await expect(tt17KpiGrid).toBeVisible({ timeout: 25000 });
    await expect(page.getByTestId('tt17-kpi-skeleton')).toBeHidden();
    await expect(page.getByText('Đang tải dữ liệu đánh giá doanh nghiệp...')).toHaveCount(0);
    const tt17TotalText = await tt17KpiGrid.locator('.text-3xl').first().innerText();
    expect(Number(tt17TotalText.replace(/\D/g, ''))).toBeGreaterThan(0);
    await assertNoHorizontalOverflow(page, '/admin/assessments/tt17 Desktop 1440x900');

    // Verify "Báo cáo" action button in detail table is not clipped at 1440px
    const firstReportLink = page.locator('table tbody tr a:has-text("Báo cáo")').first();
    await expect(firstReportLink).toBeVisible({ timeout: 15000 });
    const clipCheck = await page.evaluate(() => {
      const ws = document.querySelector('[data-testid="admin-main-workspace"]') as HTMLElement | null;
      const reportBtn = document.querySelector('table tbody tr a[href*="/report"]') as HTMLElement | null;
      if (!ws || !reportBtn) return null;
      const wsRect = ws.getBoundingClientRect();
      const btnRect = reportBtn.getBoundingClientRect();
      return { wsRight: wsRect.right, btnRight: btnRect.right, wsWidth: wsRect.width };
    });
    expect(clipCheck).not.toBeNull();
    expect(
      clipCheck!.btnRight,
      `1440px TT17 "Báo cáo" button right (${clipCheck!.btnRight}) must fit inside workspace right (${clipCheck!.wsRight})`
    ).toBeLessThanOrEqual(clipCheck!.wsRight + 1);

    // 6. Desktop 1280x800 & Mobile 390x844 workspace overflow checks
    await page.setViewportSize({ width: 1280, height: 800 });
    for (const route of ['/admin', '/admin/users', '/admin/assessments/tt17']) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
      await assertNoHorizontalOverflow(page, `${route} Desktop 1280x800`);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ['/admin', '/admin/users', '/admin/assessments/tt17']) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
      await assertNoHorizontalOverflow(page, `${route} Mobile 390x844`);
    }

    expect(consoleErrors, `Console errors: ${consoleErrors.join(' | ')}`).toEqual([]);
    expect(pageErrors, `Page errors: ${pageErrors.join(' | ')}`).toEqual([]);
    expect(server5xx, `HTTP 5xx responses: ${server5xx.join(' | ')}`).toEqual([]);
  });

  test('E2E-CR029-CDP-Slow3G: Shimmer KPI skeleton renders without fake zeroes under real CDP Slow 3G', async ({
    page,
  }) => {
    test.setTimeout(120000);

    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAsSuperAdmin(page);

    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (400 * 1024) / 8,
      uploadThroughput: (400 * 1024) / 8,
      latency: 400,
    });

    try {
      await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'domcontentloaded' });

      // During Slow 3G fetch, either skeleton is observed with zero fake "0" or data already resolved
      const skeleton = page.getByTestId('users-kpi-skeleton');
      const grid = page.getByTestId('users-kpi-grid');
      await expect(skeleton.or(grid)).toBeVisible({ timeout: 25000 });

      if (await skeleton.isVisible()) {
        await expect(skeleton).toHaveAttribute('aria-busy', 'true');
        const skeletonText = await skeleton.innerText();
        expect(skeletonText).not.toMatch(/\b0\b/);
      }

      await expect(grid).toBeVisible({ timeout: 30000 });
      await expect(skeleton).toBeHidden();
    } finally {
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0,
      });
    }
  });
});
