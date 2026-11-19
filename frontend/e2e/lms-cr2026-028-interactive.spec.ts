import { test, expect } from '@playwright/test';

/**
 * T-10.30 — KỊCH BẢN PLAYWRIGHT E2E INTERACTIVE & VISUAL QA (CR-2026-028)
 * Kỷ luật: Zero-Mock, Zero-Hardcode, không dùng page.route() giả lập API.
 * Kiểm thử trực tiếp đối đầu với Next.js 15 (localhost:3000), .NET 10 API (localhost:5080) & PostgreSQL 16 (localhost:55440).
 */
test.describe('TASK-10 LMS CR-2026-028: 50 Khóa Học & Bàn Làm Việc Học Tập Tương Tác 8 Thành Phần', () => {
  test('UJ-01..UJ-05: Toàn trình Danh mục 50 khóa học, Micro-Videos, In-Video Quiz, Rubric 7 tiêu chí, Bài tập & FAQ', async ({ page }) => {
    // Hành trình 1: Danh mục 50 khóa học & Bộ lọc Cụm A–F, LT1–LT5, M1–M8, CG/ĐH
    await page.goto('http://localhost:3000/elearning', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('EL-001').first()).toBeVisible({ timeout: 20000 });
    const allCardsCount = await page.getByRole('link', { name: /Vào học/i }).count();
    expect(allCardsCount).toBeGreaterThanOrEqual(50);

    await page.getByRole('button', { name: /Cụm A:/i }).click();
    await page.getByRole('button', { name: /Tất cả 6 Cụm/i }).click();

    await page.getByRole('button', { name: /LT1:/i }).click();
    await page.getByRole('button', { name: 'Tất cả lộ trình' }).click();

    await page.getByRole('button', { name: /^M1:/i }).click();
    await page.getByRole('button', { name: 'Tất cả 8 Mô-đun' }).click();

    await page.getByRole('button', { name: 'Chuyên gia (CG - 30 bài)' }).click();
    await page.getByRole('button', { name: 'Tất cả hình thức' }).click();

    // Tìm kiếm bài học EL-002 và mở chi tiết
    await page.getByPlaceholder(/Tìm theo mã bài/i).fill('EL-002');
    await page.getByRole('link', { name: /Vào học/i }).first().click();

    // Hành trình 2: Playlist 3 Micro-Videos, Call Sheet & Checkpoint Q1 (BR-EL-07)
    await expect(page.getByRole('button', { name: /Video 002\.1/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('button', { name: /Video 002\.2/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Video 002\.3/i })).toBeVisible();
    await expect(page.getByText(/Kịch bản phân cảnh \(Call Sheet\)/i)).toBeVisible();

    await page.getByRole('button', { name: 'Q1', exact: true }).click();
    await expect(page.getByText('Câu Hỏi Tương Tác Trong Video (BR-EL-07)')).toBeVisible();
    await page.getByRole('button', { name: '✕' }).click();

    // Hành trình 3: Tab Thực hành & Bảng tự chấm 7 tiêu chí (BR-EL-08)
    await page.getByRole('tab', { name: /Thực hành & Tự chấm/i }).click();
    const score2Btns = page.getByRole('button', { name: /^2 điểm/i });
    await expect(score2Btns).toHaveCount(7);
    for (let i = 0; i < 6; i++) {
      await score2Btns.nth(i).click();
    }
    await expect(page.getByText(/Gửi Chuyên gia phản biện/i)).toBeVisible();
    await expect(page.getByText(/Tạo Hồ sơ Nhu cầu Công nghệ/i)).toBeVisible();

    // Hành trình 4: Tab Bài tập tự luyện (10 câu trắc nghiệm + 3 câu tự luận tình huống)
    await page.getByRole('tab', { name: /Bài tập tự luyện/i }).click();
    await expect(page.getByText('Câu 10:')).toBeVisible();
    await page.getByRole('button', { name: 'Xem gợi ý đối chiếu của Chuyên gia' }).first().click();
    await expect(page.getByText('Gợi ý Chuyên gia:').first()).toBeVisible();

    // Hành trình 5: Tab Tóm tắt kiến thức & 8 FAQ Accordion + Tải biểu mẫu đính kèm
    await page.getByRole('tab', { name: /Tóm tắt & FAQs/i }).click();
    await expect(page.getByText('Tóm Tắt Kiến Thức Cốt Lõi')).toBeVisible();
    await page.getByRole('button', { name: /^2\./ }).first().click();
  });
});
