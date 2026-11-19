/**
 * Nghiệm thu trên trình duyệt thật — trang giới thiệu, lần đầu.
 *
 * Ba thứ chỉ đo được ở đây: mục câu chuyện có hiện không (LANDING-01 — CORS đúng thì mới có), năm nút kêu gọi
 * trỏ đi đâu (B-21), và một câu chuyện có tác giả KHÔNG tra được có làm trắng cả trang không (B-22).
 */
import { chromium } from 'file:///C:/Users/admin/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs'
import { execSync } from 'node:child_process'

const API = 'http://127.0.0.1:5199'
const UI = 'http://localhost:5175'
const S = Date.now()
const PASS = 'Matkhau@123'
const OUT = process.env.OUT_DIR ?? '.'
const psql = (q) => execSync(`docker exec nacentech-postgres-1 psql -U postgres -d nacentech -tAc "${q}"`).toString().trim()

const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`) }

async function api(path, opts = {}, token) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } })
  const t = await res.text(); return { status: res.status, body: t ? JSON.parse(t) : null }
}

async function main() {
  // ── Dàn dựng: một tác giả có 2 câu chuyện đã xuất bản; câu thứ hai sẽ bị "mồ côi" tác giả ──
  const email = `landing${S}@example.com`
  await api('/api/v1/auth/register', { method: 'POST', body: JSON.stringify({ email, password: PASS, confirmPassword: PASS, firstName: 'Tac', lastName: 'Gia', organization: 'Vien X' }) })
  psql(`UPDATE identity.persons SET is_active=true WHERE email='${email}'`)
  const login = await api('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password: PASS }) })
  const tok = login.body.accessToken
  const s1 = await api('/api/v1/stories', { method: 'POST', body: JSON.stringify({ title: `Câu chuyện có tác giả ${S}`, type: 'success', content: '<p>Nội dung một</p>', status: 'published' }) }, tok)
  const s2 = await api('/api/v1/stories', { method: 'POST', body: JSON.stringify({ title: `Câu chuyện MỒ CÔI ${S}`, type: 'success', content: '<p>Nội dung hai</p>', status: 'published' }) }, tok)
  check('tạo được hai câu chuyện đã xuất bản', s1.status === 201 && s2.status === 201, `${s1.status}/${s2.status}`)
  // B-22: tác giả không tra được → máy chủ trả author: null
  psql(`UPDATE content.stories SET author_person_id = gen_random_uuid() WHERE id='${s2.body.id}'`)
  const pub = await api('/api/v1/public/stories?limit=50')
  const orphan = pub.body.data.find((x) => x.id === s2.body.id)
  check('máy chủ trả author: null cho câu chuyện mồ côi', orphan && orphan.author === null)

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  const apiCalls = []
  page.on('response', (r) => { if (r.url().includes('/api/')) apiCalls.push(`${r.status()} ${r.url()}`) })

  await page.goto(UI, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)

  // ══ LANDING-01: mục câu chuyện hiện được (tức CORS đúng cho origin thứ ba) ══
  console.log('\n════ LANDING-01  mục câu chuyện ════')
  const storiesOk = apiCalls.some((c) => c.startsWith('200') && c.includes('/public/stories'))
  check('gọi được /public/stories từ origin trang giới thiệu (CORS)', storiesOk, apiCalls.find((c) => c.includes('stories')) ?? 'không có lời gọi')
  const body = await page.textContent('body')
  check('câu chuyện có tác giả hiện trên trang', body.includes(`Câu chuyện có tác giả ${S}`))

  // ══ B-22: câu chuyện mồ côi KHÔNG làm trắng trang ══
  console.log('\n════ B-22  tác giả null ════')
  check('câu chuyện mồ côi vẫn hiện (thẻ không kéo cả trang)', body.includes(`Câu chuyện MỒ CÔI ${S}`))
  check('không có lỗi runtime (trước đây: TypeError → trang trắng)', errors.filter((e) => e.startsWith('pageerror')).length === 0, errors.slice(0, 2).join(' | '))
  const headings = await page.locator('h1, h2').count()
  check('trang không trắng — vẫn có tiêu đề', headings > 0, `${headings} tiêu đề`)
  await page.screenshot({ path: `${OUT}/l1-landing.png`, fullPage: true })

  // ══ B-21: năm nút kêu gọi ══
  console.log('\n════ B-21  nút kêu gọi ════')
  const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href')))
  const toOld = hrefs.filter((h) => h && h.includes('twin.nacentech.vn'))
  const toPortal = hrefs.filter((h) => h && h.startsWith('http://localhost:5173'))
  check('0 liên kết tới hệ cũ twin.nacentech.vn', toOld.length === 0, `${toOld.length}`)
  check('nút kêu gọi trỏ tới cổng người dùng (PORTAL_URL)', toPortal.length >= 5, `${toPortal.length} liên kết`)

  console.log(`\n════ Lỗi console: ${errors.length} ════`)
  errors.slice(0, 4).forEach((e) => console.log(`  ! ${e.slice(0, 150)}`))
  await browser.close()
  const failed = results.filter((r) => !r.ok).length
  console.log(`\n════ TỔNG: ${results.length - failed}/${results.length} đạt ════`)
  process.exit(failed ? 1 : 0)
}
main().catch((e) => { console.error('LỖI KỊCH BẢN:', e); process.exit(2) })
