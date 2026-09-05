/**
 * Nghiệm thu trên trình duyệt thật — cổng người dùng, lần đầu.
 *
 * Mục quan trọng nhất là B-12: phiên hết hạn. Trước bản vá, bộ chặn HTTP vứt mã trạng thái nên không màn hình
 * nào biết mình đang gặp 401; cookie thì sống 365 ngày, nên người dùng mắc kẹt và không có đường tự thoát.
 * Không phép đo curl nào nói được điều đó — phải để trình duyệt cầm một token hỏng rồi xem ứng dụng làm gì.
 */
import { chromium } from 'file:///C:/Users/admin/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs'
import { execSync } from 'node:child_process'

const API = 'http://127.0.0.1:5199'
const UI = 'http://localhost:5173'
const S = Date.now()
const PASS = 'Matkhau@123'
const OUT = process.env.OUT_DIR ?? '.'
const psql = (q) => execSync(`docker exec nacentech-postgres-1 psql -U postgres -d nacentech -tAc "${q}"`).toString().trim()

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

async function main() {
  const email = `portal${S}@example.com`
  await fetch(`${API}/api/v1/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASS, confirmPassword: PASS, firstName: 'Portal' }),
  })
  psql(`UPDATE identity.persons SET is_active=true WHERE email='${email}'`)

  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const consoleErrors = []
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })

  // ══ Đăng nhập ══
  console.log('\n════ Đăng nhập ════')
  await page.goto(`${UI}/login`, { waitUntil: 'networkidle' })
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', PASS)
  await page.click('button[type="submit"]')
  await page.waitForFunction(() => !location.pathname.includes('/login'), null, { timeout: 20000 })
  check('đăng nhập thành công, rời trang /login', !page.url().includes('/login'), page.url())

  // ══ B-09: tuổi cookie ══
  console.log('\n════ B-09  tuổi cookie ════')
  const cookie = (await ctx.cookies()).find((c) => c.name === 'dmst_access_token')
  check('cookie phiên tồn tại', !!cookie)
  if (cookie) {
    const days = (cookie.expires - Date.now() / 1000) / 86400
    check('cookie sống ≈ 1 ngày, không phải 365', days > 0.9 && days < 1.1, `${days.toFixed(2)} ngày`)
  }
  await page.screenshot({ path: `${OUT}/p1-logged-in.png`, fullPage: true })

  // ══ B-12: phiên hết hạn ══
  console.log('\n════ B-12  phiên hết hạn (401) ════')
  // Mô phỏng token hết hạn: thay giá trị cookie bằng một chuỗi không phải JWT hợp lệ. Máy chủ sẽ trả 401 ở
  // lời gọi tiếp theo — đúng tình huống 24 giờ sau khi đăng nhập.
  await ctx.addCookies([{ ...cookie, value: 'token-da-het-han' }])
  await page.goto(`${UI}/ips`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => location.pathname.includes('/login'), null, { timeout: 15000 }).catch(() => {})
  check('token hỏng → về trang đăng nhập (trước đây: kẹt với lỗi lạ)', page.url().includes('/login'), page.url())

  const after = (await ctx.cookies()).find((c) => c.name === 'dmst_access_token')
  check('cookie hỏng đã bị xoá (không lặp vòng ở lần tải sau)', !after || !after.value, after ? `còn: ${after.value.slice(0, 20)}` : 'đã xoá')
  await page.screenshot({ path: `${OUT}/p2-after-401.png`, fullPage: true })

  // Lần tải sau KHÔNG được lặp vòng: vào /ips phải ở lại /login, không nhấp nháy về /ips rồi lỗi.
  await page.goto(`${UI}/ips`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  check('tải lại trang bảo vệ → vẫn ở /login, không lặp vòng', page.url().includes('/login'), page.url())

  // ══ B-14: không còn gọi cổng 3001 ══
  console.log('\n════ B-14  địa chỉ backend ════')
  const calls = []
  page.on('request', (r) => { if (r.url().includes('/api/')) calls.push(r.url()) })
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', PASS)
  await page.click('button[type="submit"]')
  await page.waitForFunction(() => !location.pathname.includes('/login'), null, { timeout: 20000 })
  await page.waitForTimeout(1500)
  const to3001 = calls.filter((u) => u.includes(':3001'))
  check('không lời gọi nào tới cổng NestJS cũ 3001', to3001.length === 0, `${calls.length} lời gọi API, ${to3001.length} tới 3001`)
  check('lời gọi đi tới backend .NET 5199', calls.some((u) => u.includes('5199')))

  console.log(`\n════ Lỗi console: ${consoleErrors.length} ════`)
  consoleErrors.slice(0, 5).forEach((e) => console.log(`  ! ${e.slice(0, 160)}`))
  await browser.close()

  const failed = results.filter((r) => !r.ok).length
  console.log(`\n════ TỔNG: ${results.length - failed}/${results.length} đạt ════`)
  process.exit(failed ? 1 : 0)
}
main().catch((e) => { console.error('LỖI KỊCH BẢN:', e); process.exit(2) })
