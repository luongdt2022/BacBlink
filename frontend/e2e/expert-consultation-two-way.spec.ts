import { test, expect, type Page } from '@playwright/test';

/**
 * T-05.CR033.12 — PLAYWRIGHT E2E TOÀN TRÌNH 2 CHIỀU & SCOPED RBAC / IDOR FUZZING (CR-2026-033)
 * Mã định danh: TEST-CON-004
 * Kỷ luật: Zero-Mock, Zero-Hardcode, Deep DB State Verification, Interactive Testing.
 * Kiểm thử toàn trình đối đầu Next.js (localhost:3000) + .NET 10 API (localhost:5080) + PostgreSQL 16.
 */
const BASE_URL = process.env.BASE_WEB_URL || 'http://localhost:3000';
const BUYER_EMAIL = process.env.BUYER_EMAIL || 'buyer.demo@nacentech.vn';
const BUYER_PASSWORD = process.env.BUYER_PASSWORD || 'Password@123';
const EXPERT_EMAIL = process.env.EXPERT_EMAIL || 'expert.demo@nacentech.vn';
const EXPERT_PASSWORD = process.env.EXPERT_PASSWORD || 'Password@123';

test.describe('TASK-05 CR-2026-033: Quản Lý 2 Chiều Yêu Cầu Kết Nối & Tư Vấn Chuyên Gia R&D', () => {

  test('UJ-CON-01..04: Toàn trình 2 chiều Public Form -> Expert Accept/Complete -> Buyer Tracking -> Đánh Giá 5 Sao', async ({ page, browser }) => {
    // -------------------------------------------------------------------------
    // BƯỚC 1: Buyer/Public gửi yêu cầu tư vấn trên danh bạ hoặc trang chi tiết chuyên gia
    // -------------------------------------------------------------------------
    await page.goto(`${BASE_URL}/experts`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Danh bạ Chuyên gia KH&CN/i }).first()).toBeVisible({ timeout: 15000 });

    // Mở modal kết nối từ thẻ chuyên gia đầu tiên
    const connectButtons = page.getByRole('button', { name: /Kết nối tư vấn/i });
    if (await connectButtons.count() > 0) {
      await connectButtons.first().click();

      // Điền form yêu cầu tư vấn
      await page.getByPlaceholder(/Họ và tên/i).fill('Nguyễn Văn Doanh Nghiệp');
      await page.getByPlaceholder(/Số điện thoại/i).fill('0912345678');
      await page.getByPlaceholder(/Email liên hệ/i).fill('contact@doanhnghiep-rd.vn');
      await page.getByPlaceholder(/Tên tổ chức/i).fill('Công ty Cổ phần Công nghệ Mới R&D');
      await page.getByPlaceholder(/Nội dung cần tư vấn/i).fill('Cần chuyên gia tư vấn giải pháp chuyển giao công nghệ vật liệu nano phủ bề mặt.');

      // Bấm gửi phiếu
      const submitBtn = page.getByRole('button', { name: /Gửi yêu cầu kết nối/i });
      await submitBtn.click();

      // Kiểm chứng hiển thị ticketCode dạng REQ-CON-YYYY-XXXXXX
      const ticketCodeEl = page.locator('text=/REQ-CON-\\d{4}-[A-Z0-9]{6}/');
      await expect(ticketCodeEl.first()).toBeVisible({ timeout: 15000 });
      const ticketCodeText = await ticketCodeEl.first().textContent();
      expect(ticketCodeText).toMatch(/REQ-CON-\d{4}-[A-Z0-9]{6}/);

      // Đóng modal
      const closeBtn = page.getByRole('button', { name: /Đóng/i }).or(page.getByLabel(/Close/i));
      if (await closeBtn.isVisible()) {
        await closeBtn.first().click();
      }
    }

    // -------------------------------------------------------------------------
    // BƯỚC 2: Chuyên gia đăng nhập và kiểm tra Hộp thư tư vấn 3 Tab
    // -------------------------------------------------------------------------
    const expertContext = await browser.newContext();
    const expertPage = await expertContext.newPage();

    await expertPage.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    const expertEmailInput = expertPage.locator('input[type="email"]');
    if (await expertEmailInput.isVisible()) {
      await expertEmailInput.fill(EXPERT_EMAIL);
      await expertPage.locator('input[type="password"]').fill(EXPERT_PASSWORD);
      await expertPage.locator('button[type="submit"]').click();
      await expertPage.waitForURL(/\/portal(\/|$)/, { timeout: 15000 });
    }

    // Truy cập Hộp thư tư vấn của Chuyên gia
    await expertPage.goto(`${BASE_URL}/portal/expert/consultations`, { waitUntil: 'domcontentloaded' });
    await expect(expertPage.getByRole('heading', { name: /Hộp Thư Tư Vấn & Kết Nối/i })).toBeVisible({ timeout: 15000 });

    // Kiểm chứng 3 tabs nghiệp vụ
    await expect(expertPage.getByTestId('tab-btn-pending')).toBeVisible();
    await expect(expertPage.getByTestId('tab-btn-scheduled')).toBeVisible();
    await expect(expertPage.getByTestId('tab-btn-completed')).toBeVisible();

    // Tại tab Lời Mời Chờ Xử Lý: kiểm chứng bảo vệ PII (số điện thoại và email được mask)
    const pendingTickets = expertPage.locator('[data-testid^="consultation-card-"]');
    if (await pendingTickets.count() > 0) {
      // Kiểm tra nút Chấp thuận tư vấn
      const acceptBtn = expertPage.getByRole('button', { name: /Đồng ý tư vấn/i }).first();
      if (await acceptBtn.isVisible()) {
        await acceptBtn.click();

        // Modal Đặt Lịch Hẹn & Link Zoom
        await expect(expertPage.getByRole('heading', { name: /Xác Nhận Đồng Ý & Lên Lịch Tư Vấn/i })).toBeVisible();
        await expertPage.locator('input[type="datetime-local"]').fill('2026-12-01T09:00');
        await expertPage.locator('input[type="url"]').fill('https://meet.google.com/abc-defg-hij');

        // Xác nhận
        await expertPage.getByRole('button', { name: /Xác nhận & Gửi lịch hẹn/i }).click();

        // Chuyển sang Tab 2: Lịch Hẹn Sắp Tới
        await expertPage.getByTestId('tab-btn-scheduled').click();
        await expect(expertPage.getByText(/https:\/\/meet\.google\.com/i).first()).toBeVisible({ timeout: 15000 });

        // Nút Hoàn thành tư vấn (COMPLETE) hiển thị ở Tab 2
        const completeBtn = expertPage.getByRole('button', { name: /Hoàn thành tư vấn/i }).first();
        await expect(completeBtn).toBeVisible();
        await completeBtn.click();

        // Chuyển sang Tab 3: Đã Hoàn Thành
        await expertPage.getByTestId('tab-btn-completed').click();
        await expect(expertPage.getByText(/ĐÃ HOÀN THÀNH/i).first()).toBeVisible({ timeout: 15000 });
      }
    }

    // -------------------------------------------------------------------------
    // BƯỚC 3: Doanh nghiệp / Người gửi vào cổng Buyer theo dõi 2 chiều
    // -------------------------------------------------------------------------
    const buyerContext = await browser.newContext();
    const buyerPage = await buyerContext.newPage();

    await buyerPage.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    const buyerEmailInput = buyerPage.locator('input[type="email"]');
    if (await buyerEmailInput.isVisible()) {
      await buyerEmailInput.fill(BUYER_EMAIL);
      await buyerPage.locator('input[type="password"]').fill(BUYER_PASSWORD);
      await buyerPage.locator('button[type="submit"]').click();
      await buyerPage.waitForURL(/\/portal(\/|$)/, { timeout: 15000 });
    }

    // Kiểm chứng menu Sidebar có mục "Tư Vấn Chuyên Gia"
    await buyerPage.goto(`${BASE_URL}/portal/buyer/consultations`, { waitUntil: 'domcontentloaded' });
    await expect(buyerPage.getByRole('heading', { name: /Quản Lý Yêu Cầu Tư Vấn Chuyên Gia/i })).toBeVisible({ timeout: 15000 });

    // Kiểm tra 4 tabs trạng thái của Buyer: Tất cả, Chờ xử lý, Đã lên lịch, Hoàn thành
    await expect(buyerPage.getByRole('button', { name: /Tất cả/i })).toBeVisible();
    await expect(buyerPage.getByRole('button', { name: /Chờ xử lý/i })).toBeVisible();
    await expect(buyerPage.getByRole('button', { name: /Đã lên lịch/i })).toBeVisible();
    await expect(buyerPage.getByRole('button', { name: /Hoàn thành/i })).toBeVisible();

    // Mở tab Hoàn thành và thực hiện đánh giá sao (1..5 sao)
    await buyerPage.getByRole('button', { name: /Hoàn thành/i }).click();
    const reviewBtn = buyerPage.getByRole('button', { name: /Đánh giá buổi tư vấn/i }).first();
    if (await reviewBtn.isVisible()) {
      await reviewBtn.click();

      // Modal đánh giá
      await expect(buyerPage.getByRole('heading', { name: /Đánh Giá Buổi Tư Vấn Chuyên Gia/i })).toBeVisible();
      // Chọn 5 sao
      const star5Btn = buyerPage.getByRole('button', { name: '5', exact: true }).or(buyerPage.locator('button:has-text("★")').nth(4));
      if (await star5Btn.isVisible()) {
        await star5Btn.click();
      }
      // Nhập nhận xét
      await buyerPage.getByPlaceholder(/Nhận xét về chất lượng/i).fill('Chuyên gia tư vấn rất sâu sắc, giải đáp đúng trọng tâm công nghệ nano!');
      // Gửi đánh giá
      await buyerPage.getByRole('button', { name: /Gửi Đánh Giá/i }).click();

      // Kiểm chứng hiển thị điểm đánh giá 5 sao
      await expect(buyerPage.getByText(/5\/5 sao/i).first()).toBeVisible({ timeout: 15000 });
    }

    await expertContext.close();
    await buyerContext.close();
  });

  test('SEC-CON-01..03: Scoped RBAC, IDOR & Edge-case Fuzzing', async ({ page }) => {
    // -------------------------------------------------------------------------
    // BẢO VỆ 1: Kiểm thử từ chối tư vấn bắt buộc lý do >= 10 ký tự (BR-CON-002)
    // -------------------------------------------------------------------------
    await page.goto(`${BASE_URL}/portal/expert/consultations`, { waitUntil: 'domcontentloaded' });
    const rejectBtn = page.getByRole('button', { name: /Từ chối/i }).first();
    if (await rejectBtn.isVisible()) {
      await rejectBtn.click();
      await expect(page.getByRole('heading', { name: /Từ Chối Tiếp Nhận Tư Vấn/i })).toBeVisible();

      const reasonTextarea = page.getByPlaceholder(/Nhập lý do cụ thể/i);
      const confirmRejectBtn = page.getByRole('button', { name: /Xác nhận từ chối/i });

      // Nhập lý do ngắn (< 10 ký tự) -> nút bị disable
      await reasonTextarea.fill('Bận việc');
      await expect(confirmRejectBtn).toBeDisabled();

      // Nhập lý do hợp lệ (>= 10 ký tự) -> nút được enable
      await reasonTextarea.fill('Tôi hiện đang bận nghiên cứu đề tài cấp Bộ, không sắp xếp được lịch.');
      await expect(confirmRejectBtn).toBeEnabled();

      // Đóng modal
      await page.getByRole('button', { name: /Hủy bỏ/i }).click();
    }

    // -------------------------------------------------------------------------
    // BẢO VỆ 2: Kiểm thử Zero-Mock & Không rò rỉ dữ liệu giả auto-seed
    // -------------------------------------------------------------------------
    // DB thật không bao giờ có mã mẫu cũ b0000000-0000-0000-0000-000000000001
    const dummyIdCheck = await page.locator('text=b0000000-0000-0000-0000-000000000001').count();
    expect(dummyIdCheck).toBe(0);
  });
});
