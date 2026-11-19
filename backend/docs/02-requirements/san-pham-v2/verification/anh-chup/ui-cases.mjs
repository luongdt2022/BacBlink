/**
 * Nghiệm thu trên trình duyệt thật — ba màn hình mới của bảng quản trị: console hồ sơ vụ việc, ảnh chụp chính
 * sách, vòng ghép cặp. Kèm B-42 (một người hai vai) và B-38 (ô lọc người dùng phát ra đúng từ vựng máy chủ).
 *
 * Những thứ chỉ đo được ở đây: thanh giai đoạn chỉ cho bấm đích đi tới được; hộp thoại chọn sẵn loại quyết
 * định; nút Xác nhận tắt khi chưa có diễn giải; 409 giữ diễn giải; gỡ khoá tạo mục dòng thời gian khác kiểu.
 */
import { chromium } from 'file:///C:/Users/admin/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

const API = 'http://127.0.0.1:5199'
const UI = 'http://localhost:5174'
const S = Date.now()
const PASS = 'Matkhau@123'
const OUT = process.env.OUT_DIR ?? '.'
const psql = (q) => execSync(`docker exec nacentech-postgres-1 psql -U postgres -d nacentech -tAc "${q}"`).toString().trim()

const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`) }

async function api(path, opts = {}, token, extra = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra } })
  const t = await res.text(); return { status: res.status, body: t ? JSON.parse(t) : null }
}

async function main() {
  // ── Dàn dựng: một quản trị viên (sẽ là CẢ chủ bài toán lẫn môi giới chính — B-42) ──
  const adminEmail = `case${S}@example.com`
  await api('/api/v1/auth/register', { method: 'POST', body: JSON.stringify({ email: adminEmail, password: PASS, confirmPassword: PASS, firstName: 'Hai', lastName: 'Vai' }) })
  psql(`UPDATE identity.persons SET is_active=true, platform_role='ADMIN' WHERE email='${adminEmail}'`)
  const adminId = psql(`SELECT id FROM identity.persons WHERE email='${adminEmail}'`)
  const login = await api('/api/v1/admin/auth/login', { method: 'POST', body: JSON.stringify({ email: adminEmail, password: PASS }) })
  const tok = login.body.accessToken

  const created = await api('/api/v2/cases', { method: 'POST', body: JSON.stringify({
    track: 'CHALLENGE_PILOT', title: `Hồ sơ nghiệm thu ${S}`, problemOwnerPersonId: adminId, demandBriefId: randomUUID(),
    demandBriefVersionNo: 1, confidentialityLevel: 'CONFIDENTIAL', leadBrokerPersonId: adminId,
  }) }, tok, { 'Idempotency-Key': randomUUID() })
  check('tạo hồ sơ qua API v2 (cùng người là chủ + môi giới)', created.status === 201, `${created.status}`)
  const caseId = created.body.id

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

  await page.goto(`${UI}/login`, { waitUntil: 'networkidle' })
  await page.fill('input[type="email"], input[name="email"]', adminEmail)
  await page.fill('input[type="password"]', PASS)
  await page.click('button[type="submit"]')
  await page.waitForFunction(() => !location.pathname.includes('/login'), null, { timeout: 20000 })

  // ══ Danh sách hồ sơ, bộ lọc trong URL ══
  console.log('\n════ /cases  danh sách ════')
  await page.goto(`${UI}/cases?stage=DISCOVERY`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  let body = await page.textContent('body')
  check('hồ sơ vừa tạo hiện trong danh sách lọc theo giai đoạn (URL)', body.includes(`Hồ sơ nghiệm thu ${S}`))
  check('ô giai đoạn đọc từ URL', (await page.inputValue('#c-stage')) === 'DISCOVERY')
  await page.screenshot({ path: `${OUT}/c1-cases-list.png`, fullPage: true })

  // ══ Chi tiết: phần đầu, thanh giai đoạn chỉ cho bấm đích đi tới được ══
  console.log('\n════ /cases/:id  phần đầu + thanh giai đoạn ════')
  await page.goto(`${UI}/cases/${caseId}`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => !document.body.textContent.includes('Đang tải hồ sơ'), null, { timeout: 15000 })
  body = await page.textContent('body')
  check('giai đoạn hiện tại hiện ngay', body.includes('Giai đoạn hiện tại') && body.includes('Khám phá'))
  check('chính sách chưa chốt: nói KHI NÀO chốt, không nói "không tìm thấy"', body.includes('được chốt khi hồ sơ vào'))
  check('phiên bản đề bài ghim hiện ngay', body.includes('phiên bản 1'))
  const clickable = await page.locator('ol[aria-label="Giai đoạn"] button').allTextContents()
  check('từ Khám phá chỉ Thẩm định bấm được trên dải chính', clickable.length === 1 && clickable[0] === 'Thẩm định', clickable.join('|'))
  const outlets = await page.locator('text=Đường ra:').locator('..').locator('button').allTextContents()
  check('đường ra ở Khám phá là Từ chối + Rút lui (không có Huỷ)', outlets.join('|') === 'Từ chối|Rút lui', outlets.join('|'))
  await page.screenshot({ path: `${OUT}/c2-case-detail.png`, fullPage: true })

  // ══ Hộp thoại quyết định ══
  console.log('\n════ hộp thoại quyết định ════')
  await page.click('ol[aria-label="Giai đoạn"] button:has-text("Thẩm định")')
  await page.waitForSelector('[role="dialog"]')
  let dlg = await page.textContent('[role="dialog"]')
  check('tiến: có ô chọn hai loại quyết định', (await page.locator('#d-decision option').count()) === 2)
  check('nút Xác nhận tắt khi chưa có diễn giải', await page.locator('[role="dialog"] button:has-text("Xác nhận")').isDisabled())
  check('ô diễn giải được focus sẵn', await page.evaluate(() => document.activeElement?.id === 'd-rationale'))
  await page.type('#d-rationale', 'Dòng một')
  await page.keyboard.press('Enter')
  await page.type('#d-rationale', 'Dòng hai')
  check('Enter trong ô diễn giải xuống dòng, không gửi', (await page.inputValue('#d-rationale')).includes('\n') && await page.locator('[role="dialog"]').isVisible())
  check('có diễn giải → nút Xác nhận bật', !(await page.locator('[role="dialog"] button:has-text("Xác nhận")').isDisabled()))

  // 409: người khác sửa hồ sơ trong lúc hộp thoại đang mở (gán lại môi giới qua API → phiên bản tăng)
  const bump = await api(`/api/v2/cases/${caseId}/lead-broker`, { method: 'POST', body: JSON.stringify({ brokerPersonId: adminId, expectedVersion: created.body.version }) }, tok, { 'Idempotency-Key': randomUUID() })
  check('dàn dựng: người khác đã tăng phiên bản', bump.status === 200 && bump.body.version > created.body.version, `${bump.status} v${bump.body?.version}`)
  await page.keyboard.press('Control+Enter')
  await page.waitForFunction(() => document.querySelector('[role="dialog"]')?.textContent.includes('người khác cập nhật'), null, { timeout: 15000 })
  dlg = await page.textContent('[role="dialog"]')
  check('409 → hộp thoại KHÔNG đóng, nói hồ sơ vừa được người khác cập nhật', dlg.includes('người khác cập nhật'))
  check('409 → diễn giải được GIỮ', (await page.inputValue('#d-rationale')).includes('Dòng hai'))
  check('409 → hộp thoại hiện phiên bản mới từ phản hồi', dlg.includes(`phiên bản ${bump.body.version}`))
  await page.screenshot({ path: `${OUT}/c3-dialog-409.png` })

  // Gửi lại với phiên bản mới → thành công (B-42: cùng người là chủ + môi giới, vai môi giới cho phép)
  await page.keyboard.press('Control+Enter')
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), null, { timeout: 15000 })
  await page.waitForTimeout(800)
  body = await page.textContent('body')
  check('B-42: người hai vai chuyển được giai đoạn (trước đây 403)', body.includes('Giai đoạn hiện tại') && (await page.locator('ol[aria-label="Giai đoạn"] [aria-current="step"]').textContent()) === 'Thẩm định')
  check('dòng thời gian có mục Khám phá → Thẩm định với diễn giải', body.includes('Dòng một') && body.includes('Dòng hai'))
  check('chính sách đã chốt → có liên kết ảnh chụp', body.includes('Ảnh chụp chính sách đang áp'))
  await page.screenshot({ path: `${OUT}/c4-after-transition.png`, fullPage: true })

  // Escape với diễn giải đang viết → hỏi trước khi bỏ
  await page.click('ol[aria-label="Giai đoạn"] button:has-text("Ghép cặp")')
  await page.waitForSelector('[role="dialog"]')
  await page.type('#d-rationale', 'sắp bỏ')
  await page.keyboard.press('Escape')
  check('Escape khi có diễn giải → hỏi trước, chưa đóng', await page.locator('[role="dialog"]').isVisible() && (await page.textContent('[role="dialog"]')).includes('Bỏ diễn giải'))
  await page.keyboard.press('Escape')
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), null, { timeout: 5000 })
  check('Escape lần hai → đóng', true)

  // ══ Khoá tạm: mở → mọi nút chuyển tắt; gỡ → mục dòng thời gian khác kiểu ══
  console.log('\n════ khoá tạm ════')
  await page.click('button:has-text("Khoá hồ sơ")')
  await page.fill('#hold-reason', 'Chờ xác nhận ngân sách')
  await page.click('button:has-text("Khoá"):not(:has-text("hồ sơ"))')
  await page.waitForFunction(() => document.body.textContent.includes('Hồ sơ đang bị khoá'), null, { timeout: 15000 })
  check('dải khoá hiện ở đầu trang, có lý do', (await page.textContent('body')).includes('Chờ xác nhận ngân sách'))
  check('mọi nút chuyển giai đoạn tắt khi khoá', (await page.locator('ol[aria-label="Giai đoạn"] button').count()) === 0)
  await page.screenshot({ path: `${OUT}/c5-on-hold.png`, fullPage: true })
  await page.click('button:has-text("Gỡ khoá")')
  await page.fill('textarea[id^="rel-"]', 'Ngân sách đã xác nhận')
  await page.click('button:has-text("Xác nhận gỡ")')
  await page.waitForFunction(() => !document.body.textContent.includes('Hồ sơ đang bị khoá'), null, { timeout: 15000 })
  await page.waitForTimeout(800)
  const noteEntries = await page.locator('ol[aria-label="Dòng thời gian"] li:has-text("Gỡ khoá")').count()
  // Mũi tên là một biểu tượng SVG, không phải ký tự — đếm mục KHÔNG phải ghi chú gỡ khoá.
  const arrowEntries = await page.locator('ol[aria-label="Dòng thời gian"] li:not(:has-text("Gỡ khoá"))').count()
  check('gỡ khoá tạo mục dòng thời gian, vẽ như ghi chú (không mũi tên)', noteEntries === 1, `${noteEntries} ghi chú`)
  check('mục chuyển giai đoạn vẫn vẽ mũi tên', arrowEntries >= 1, `${arrowEntries}`)
  check('sau gỡ khoá, nút chuyển bật lại', (await page.locator('ol[aria-label="Giai đoạn"] button').count()) > 0)
  await page.screenshot({ path: `${OUT}/c6-hold-released.png`, fullPage: true })

  // ══ Ảnh chụp chính sách ══
  console.log('\n════ /policy-snapshots/:id ════')
  await page.click('a:has-text("Ảnh chụp chính sách đang áp")')
  await page.waitForFunction(() => location.pathname.startsWith('/policy-snapshots/'), null, { timeout: 10000 })
  // Chờ một mốc CỦA trang mới, không chờ "chữ đang tải biến mất": ngay sau khi đường dẫn đổi, thành phần mới
  // có thể chưa mount, body vẫn là trang cũ và không có chữ "Đang tải" nào — phép chờ phủ định qua ngay.
  await page.waitForSelector('text=Cổng theo giai đoạn', { timeout: 15000 })
  body = await page.textContent('body')
  check('tuyến + hai phiên bản + thời điểm chốt hiện ngay', body.includes('Tuyến của hồ sơ') && body.includes('platform') && body.includes('challenge_pilot-v1'))
  check('nói bản này đang hiện hành', body.includes('đang hiện hành'))
  check('cổng theo giai đoạn: 7 nhóm có mục, 5 nhóm nói "không đặt cổng"', (body.match(/không đặt cổng/g) ?? []).length === 5, `${(body.match(/không đặt cổng/g) ?? []).length}`)
  check('cảnh báo cổng là luật ĐÃ GHI, chưa thi hành', body.includes('chưa phải bộ luật đã thi hành'))
  check('hash kèm mã phiên bản chuẩn hoá JCS-1 và câu giải thích', body.includes('JCS-1') && body.includes('không bị sửa'))
  check('có nút chép bản chuẩn hoá', body.includes('Chép bản chuẩn hoá'))
  check('KHÔNG tự tuyên bố đã kiểm toàn vẹn', !body.includes('đã kiểm tra toàn vẹn'))
  await page.screenshot({ path: `${OUT}/c7-policy-snapshot.png`, fullPage: true })

  // ══ Vòng ghép cặp: chưa từng tính (204) ══
  console.log('\n════ /match-rounds ════')
  await page.goto(`${UI}/match-rounds/commercialization-cases/${caseId}`, { waitUntil: 'networkidle' })
  await page.waitForFunction(
    () => ['chưa từng được tính', 'Số ứng viên', 'Không có bản ghi nào'].some((t) => document.body.textContent.includes(t)),
    null, { timeout: 15000 })
  body = await page.textContent('body')
  check('204 → "chưa từng được tính", phân biệt với "0 ứng viên"', body.includes('chưa từng được tính'))
  check('nói thẳng trang so sánh chưa dựng được vì API', body.includes('chưa dựng được'))
  await page.screenshot({ path: `${OUT}/c8-match-rounds.png`, fullPage: true })

  // ══ B-38: ô lọc người dùng phát ra đúng từ vựng máy chủ ══
  console.log('\n════ B-38  ô lọc người dùng ════')
  const seen = []
  page.on('request', (r) => { if (r.url().includes('/admin/users')) seen.push(r.url()) })
  await page.goto(`${UI}/users`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await page.click('[role="combobox"]').catch(() => {})
  await page.click('[role="option"]:has-text("Khóa"), [role="option"]:has-text("Khoá"), [role="option"]:has-text("hoạt động")').catch(() => {})
  await page.waitForTimeout(1500)
  const withStatus = seen.filter((u) => /status=(active|inactive)/.test(u))
  check('ô lọc gửi status=active|inactive (không có locked/pending)', withStatus.length > 0 && !seen.some((u) => /status=(locked|pending)/.test(u)), withStatus[withStatus.length - 1] ?? seen[seen.length - 1])

  console.log(`\n════ Lỗi console: ${errors.length} ════`)
  errors.slice(0, 5).forEach((e) => console.log(`  ! ${e.slice(0, 160)}`))
  await browser.close()
  const failed = results.filter((r) => !r.ok).length
  console.log(`\n════ TỔNG: ${results.length - failed}/${results.length} đạt ════`)
  process.exit(failed ? 1 : 0)
}
main().catch((e) => { console.error('LỖI KỊCH BẢN:', e); process.exit(2) })
