/**
 * Nghiệm thu trên trình duyệt thật — lần đầu tiên trong cả đợt.
 *
 * Bốn mục dưới đây KHÔNG đo được bằng curl, vì cái sai nằm ở chỗ giao diện gọi gì chứ không ở chỗ máy chủ trả
 * gì. B-26 là ví dụ rõ nhất: máy chủ hoàn toàn khoẻ mạnh, và cái nút thì gọi nhầm lệnh.
 */
import { chromium } from 'file:///C:/Users/admin/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs'
import { execSync } from 'node:child_process'

const API = 'http://127.0.0.1:5199'
const UI = 'http://localhost:5174'
const S = Date.now()
const PASS = 'Matkhau@123'
const OUT = process.env.OUT_DIR ?? '.'

const psql = (sql) =>
  execSync(`docker exec nacentech-postgres-1 psql -U postgres -d nacentech -tAc "${sql}"`).toString().trim()

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers ?? {}) },
  })
  const text = await res.text()
  return { status: res.status, body: text ? JSON.parse(text) : null }
}

async function main() {
  // ── Dàn dựng: một quản trị viên, và một người dùng thường để thao tác lên ──
  const adminEmail = `uiadmin${S}@example.com`
  const victimEmail = `uivictim${S}@example.com`
  for (const email of [adminEmail, victimEmail]) {
    await api('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password: PASS, confirmPassword: PASS, firstName: 'UI' }),
    })
  }
  psql(`UPDATE identity.persons SET is_active=true WHERE email LIKE '%${S}@example.com'`)
  psql(`UPDATE identity.persons SET platform_role='ADMIN' WHERE email='${adminEmail}'`)
  const victimId = psql(`SELECT id FROM identity.persons WHERE email='${victimEmail}'`)

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const consoleErrors = []
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))

  // ══ B-11: liên kết sâu lúc chưa đăng nhập phải đưa về ĐÚNG chỗ sau khi đăng nhập ══
  console.log('\n════ B-11  đích đến sau đăng nhập ════')
  await page.goto(`${UI}/audit-log`, { waitUntil: 'networkidle' })
  // `ProtectedRoute` hiện "Đang tải…" trong lúc kiểm phiên rồi mới chuyển hướng; đọc URL ngay sau
  // `networkidle` là đọc trước khi nó kịp quyết định.
  await page.waitForFunction(() => location.pathname.includes('/login'), null, { timeout: 15000 })
    .catch(() => {})
  check('liên kết sâu khi chưa đăng nhập → trang đăng nhập', page.url().includes('/login'), page.url())

  await page.fill('input[type="email"], input[name="email"]', adminEmail)
  await page.fill('input[type="password"]', PASS)
  await page.click('button[type="submit"]')
  await page.waitForFunction(() => !location.pathname.includes('/login'), null, { timeout: 20000 })
  check('sau đăng nhập quay lại đúng /audit-log (không phải /dashboard)',
    page.url().includes('/audit-log'), page.url())
  await page.screenshot({ path: `${OUT}/01-audit-log.png`, fullPage: true })

  // ══ Màn hình nhật ký kiểm toán ══
  console.log('\n════ Màn hình nhật ký kiểm toán ════')
  const bodyText = await page.textContent('body')
  check('mở ra RỖNG, không tự đổ nhật ký', bodyText.includes('Đặt ít nhất một bộ lọc'))
  check('dải thường trực nói nhật ký chỉ ghi thêm', bodyText.includes('chỉ ghi thêm'))
  check('nói rõ nhật ký KHÔNG ghi mọi thứ', bodyText.includes('không ghi mọi thứ'))

  await page.click('button:has-text("Xem các lượt bị từ chối")')
  await page.waitForTimeout(1500)
  check('bộ lọc nằm trong URL (chia sẻ được)',
    page.url().includes('outcome=DENY') && page.url().includes('from='), page.url())
  const rows = await page.locator('table tbody tr').count()
  check('bảng có dòng dữ liệu thật', rows > 0, `${rows} dòng`)
  const hasTextLabel = (await page.locator('table tbody').textContent()).includes('Từ chối')
  check('kết quả có nhãn CHỮ, không chỉ màu', hasTextLabel)
  await page.screenshot({ path: `${OUT}/02-audit-deny.png`, fullPage: true })

  if (rows > 0) {
    await page.locator('table tbody tr').first().click()
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 })
    // Ngăn chi tiết nạp dữ liệu bất đồng bộ; đọc ngay sau khi nó xuất hiện chỉ thấy "Đang tải…".
    await page.waitForFunction(
      () => { const d = document.querySelector('[role="dialog"]'); return d && !d.textContent.includes('Đang tải') },
      null, { timeout: 15000 })
    const detail = await page.textContent('[role="dialog"]')
    check('ngăn chi tiết mở được', detail.length > 0)
    check('có mã tương quan để nối với báo lỗi', detail.includes('Mã tương quan'))
    check('mã quy tắc tách phần phiên bản bộ quy tắc', detail.includes('Phiên bản bộ quy tắc'))
    const deviceShown = detail.includes('Địa chỉ IP') || detail.includes('Đã hết hạn lưu') || detail.includes('Không áp dụng')
    check('dấu vết thiết bị nói rõ một trong ba trạng thái', deviceShown)
    await page.screenshot({ path: `${OUT}/03-audit-detail.png` })
    await page.keyboard.press('Escape')
  }

  // ══ B-26: nút "Khóa tài khoản" phải KHOÁ, không XOÁ ══
  console.log('\n════ B-26  nút Khóa tài khoản ════')
  await page.goto(`${UI}/users`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.fill('input[placeholder*="ìm"], input[type="search"]', victimEmail).catch(() => {})
  await page.waitForTimeout(2000)

  const before = psql(`SELECT count(*) FROM identity.persons WHERE id='${victimId}'`)
  const lockBtn = page.locator('button[title="Khóa tài khoản"]').first()
  const lockVisible = await lockBtn.count()
  check('tìm thấy nút "Khóa tài khoản"', lockVisible > 0)

  if (lockVisible > 0) {
    await lockBtn.click()
    await page.waitForTimeout(2500)
    const after = psql(`SELECT count(*) FROM identity.persons WHERE id='${victimId}'`)
    const active = psql(`SELECT is_active FROM identity.persons WHERE id='${victimId}'`)
    check('bản ghi VẪN CÒN sau khi bấm (không bị xoá)', before === '1' && after === '1', `trước=${before} sau=${after}`)
    check('tài khoản đã bị khoá thật', active === 'f', `is_active=${active}`)
  }
  await page.screenshot({ path: `${OUT}/04-users.png`, fullPage: true })

  // ══ B-25: hộp thoại tạo người dùng phải có ô mật khẩu ══
  console.log('\n════ B-25  tạo người dùng ════')
  await page.click('button:has-text("Tạo mới người dùng")').catch(async () => {
    await page.click('button:has-text("Tạo")')
  })
  await page.waitForTimeout(1200)
  const pwField = await page.locator('input[type="password"]').count()
  check('hộp thoại CÓ ô mật khẩu', pwField > 0, `${pwField} ô`)
  await page.screenshot({ path: `${OUT}/05-create-user.png` })

  if (pwField > 0) {
    const newEmail = `uinew${S}@example.com`
    await page.fill('input[type="email"]', newEmail)
    await page.fill('input[type="password"]', PASS)
    await page.click('button:has-text("Tạo người dùng")')
    await page.waitForTimeout(3000)
    const created = psql(`SELECT count(*) FROM identity.persons WHERE email='${newEmail}'`)
    check('tạo người dùng THÀNH CÔNG (trước đây luôn hỏng)', created === '1', `${created} bản ghi`)
  }

  console.log(`\n════ Lỗi console trong suốt phiên: ${consoleErrors.length} ════`)
  consoleErrors.slice(0, 5).forEach((e) => console.log(`  ! ${e.slice(0, 160)}`))

  await browser.close()

  const failed = results.filter((r) => !r.ok)
  console.log(`\n════ TỔNG: ${results.length - failed.length}/${results.length} đạt ════`)
  process.exit(failed.length > 0 ? 1 : 0)
}

main().catch((e) => { console.error('LỖI KỊCH BẢN:', e); process.exit(2) })
