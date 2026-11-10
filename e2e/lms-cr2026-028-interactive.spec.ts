import { test, expect } from '@playwright/test';

/**
 * T-10.30 — KỊCH BẢN PLAYWRIGHT E2E INTERACTIVE & VISUAL QA (CR-2026-028)
 * Kỷ luật: Zero-Mock, Zero-Hardcode, không dùng page.route() giả lập API.
 * Kiểm thử trực tiếp đối đầu với Next.js 15 (localhost:3000), .NET 10 API (localhost:5080) & PostgreSQL 16 (localhost:55440).
 */
test.describe('TASK-10 LMS CR-2026-028: 50 Khóa Học & Bàn Làm Việc Học Tập Tương Tác 8 Thành Phần', () => {
  test('UJ-01..UJ-05: Toàn trình Danh mục 50 khóa học, Micro-Videos, In-Video Quiz, Rubric 7 tiêu chí, Bài tập & FAQ', async ({ page }) => {
    // Hành trình 1: Danh mục 50 khóa học & Bộ lọc Cụm A–F, LT1–LT5, M1–M8, CG/ĐH
    await page.goto('http://localhost:3000/elearning', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('course-grid')).toBeVisible();
    const allCardsCount = await page.locator('[data-testid="course-grid"] > div').count();
    expect(allCardsCount).toBeGreaterThanOrEqual(50);

    await page.getByTestId('cluster-tab-A').click();
    await expect(page.getByTestId('cluster-banner-A')).toBeVisible();
    await page.getByTestId('cluster-tab-ALL').click();

    await page.getByTestId('pathway-filter-LT1').click();
    await page.getByTestId('pathway-filter-ALL').click();

    await page.getByTestId('module-filter-M1').click();
    await page.getByTestId('module-filter-ALL').click();

    await page.getByTestId('format-filter-CG').click();
    await page.getByTestId('format-filter-ALL').click();

    // Tìm kiếm bài học EL-002 và mở chi tiết
    await page.getByTestId('elearning-search-input').fill('EL-002');
    await page.locator('[data-testid^="course-cta-"]').first().click();

    // Hành trình 2: Playlist 3 Micro-Videos, Call Sheet & Checkpoint Q1 (BR-EL-07)
    await expect(page.getByTestId('lesson-detail-title')).toBeVisible();
    await expect(page.locator('[data-testid^="micro-video-item-"]')).toHaveCount(3);
    await page.getByTestId('tab-btn-video').click();
    await expect(page.getByTestId('call-sheet-panel')).toBeVisible();

    await page.getByTestId('trigger-invideo-quiz-Q1').click();
    await expect(page.getByTestId('in-video-quiz-modal')).toBeVisible();

    // Hành trình 3: Tab Thực hành & Bảng tự chấm 7 tiêu chí (BR-EL-08)
    const closeBtn = page.locator('[data-testid="in-video-quiz-modal"] button').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click().catch(() => {});
    }
    await page.getByTestId('tab-btn-practice').click();
    await expect(page.getByTestId('tab-content-practice')).toBeVisible();
    await expect(page.locator('[data-testid^="rubric-row-"]')).toHaveCount(7);

    // Hành trình 4: Tab Bài tập tự luyện (10 câu trắc nghiệm + 3 câu tự luận tình huống)
    await page.getByTestId('tab-btn-quiz').click();
    await expect(page.locator('[data-testid^="quiz-question-card-"]')).toHaveCount(10);
    await expect(page.locator('[data-testid^="essay-question-card-"]')).toHaveCount(3);
    await page.getByTestId('toggle-essay-hint-1').click();
    await expect(page.getByTestId('essay-hint-box-1')).toBeVisible();

    // Hành trình 5: Tab Tóm tắt kiến thức & 8 FAQ Accordion + Tải biểu mẫu đính kèm
    await page.getByTestId('tab-btn-summary-faq').click();
    await expect(page.locator('[data-testid^="faq-item-"]')).toHaveCount(8);
    await page.getByTestId('faq-toggle-2').click();
    await expect(page.getByTestId('faq-answer-2')).toBeVisible();
  });
});
