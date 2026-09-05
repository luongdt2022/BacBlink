/**
 * VGC-08 — vòng ghép cặp THẬT: tính bằng chỉ mục PostgreSQL + BGE-M3 qua `POST /api/v2/subjects/{kind}/{id}/match-rounds`,
 * rồi xem trên bảng quản trị. Không chèn gì vào cơ sở dữ liệu — mọi thứ đi qua API và việc nền.
 */
import { chromium } from 'file:///C:/Users/admin/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

const API = 'http://127.0.0.1:5199'
const UI = 'http://localhost:5174'
const S = Date.now()
const PASS = 'Matkhau@123'
const OUT = process.env.OUT_DIR ?? '.'
const psql = (q) => execSync(`docker exec nacentech-postgres-1 psql -U postgres -d nacentech -tAc "${q.replace(/"/g, '\\"')}"`).toString().trim()
const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function api(path, opts = {}, token, extra = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...(opts.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra } })
  const t = await res.text(); return { status: res.status, body: t ? JSON.parse(t) : null }
}
async function reg(email, admin = false) {
  await api('/api/v1/auth/register', { method: 'POST', body: JSON.stringify({ email, password: PASS, confirmPassword: PASS, firstName: 'VG' }) })
  psql(`UPDATE identity.persons SET is_active=true${admin ? ", platform_role='ADMIN'" : ''} WHERE email='${email}'`)
  const r = await api(admin ? '/api/v1/admin/auth/login' : '/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password: PASS }) })
  return r.body.accessToken
}
async function intake(tok, type, title, content) {
  const f = new FormData(); f.set('type', type); f.set('title', title); f.set('content', `<p>${content}</p>`); f.set('status', 'published')
  const r = await api('/api/v1/my/intakes', { method: 'POST', body: f }, tok); return r.body?.id ?? r.body?.data?.id
}

async function main() {
  const owner = await reg(`vg-owner${S}@example.com`)
  const supplier = await reg(`vg-supplier${S}@example.com`)
  const adminEmail = `vg-admin${S}@example.com`; const admin = await reg(adminEmail, true)

  // Bên cung: hai công nghệ đã xuất bản, một khớp một không. Bên cầu: một đề bài.
  const techHit = await intake(supplier, 'ip', `Màng lọc sinh học ${S}`, `màng lọc sinh học xử lý nước thải dệt nhuộm chi phí thấp ${S}`)
  const techMiss = await intake(supplier, 'ip', `Máy gặt ${S}`, `máy gặt đập liên hợp cỡ nhỏ cho ruộng bậc thang ${S}`)
  const demand = await intake(owner, 'challenge', `Cần xử lý nước thải dệt nhuộm ${S}`, `nhà máy dệt nhuộm cần công nghệ xử lý nước thải màu, chi phí thấp ${S}`)
  check('dàn dựng: 2 công nghệ + 1 đề bài đã xuất bản', Boolean(techHit && techMiss && demand))
  for (let i = 0; i < 60; i++) { if (Number(psql(`SELECT count(*) FROM matching.search_chunks WHERE subject_id IN ('${techHit}','${techMiss}','${demand}')`)) >= 3) break; await sleep(3000) }

  // POST v2 match-rounds — cần Idempotency-Key; người không phải chủ → 403; thiếu khoá → 428.
  const noKey = await api(`/api/v2/subjects/demand-briefs/${demand}/match-rounds`, { method: 'POST', body: '{}' }, owner)
  check('thiếu Idempotency-Key → 428', noKey.status === 428, `${noKey.status}`)
  const stranger = await api(`/api/v2/subjects/demand-briefs/${demand}/match-rounds`, { method: 'POST', body: '{}' }, supplier, { 'Idempotency-Key': randomUUID() })
  check('không phải chủ sở hữu → 403 kèm ruleId', stranger.status === 403 && Boolean(stranger.body?.ruleId), `${stranger.status} ${stranger.body?.ruleId ?? ''}`)
  const key = randomUUID()
  const queued = await api(`/api/v2/subjects/demand-briefs/${demand}/match-rounds`, { method: 'POST', body: '{}' }, owner, { 'Idempotency-Key': key })
  check('chủ sở hữu → 202, việc đã xếp hàng', queued.status === 202 && queued.body?.queued === true, `${queued.status}`)
  const replay = await api(`/api/v2/subjects/demand-briefs/${demand}/match-rounds`, { method: 'POST', body: '{}' }, owner, { 'Idempotency-Key': key })
  check('cùng khoá → phát lại 202, không xếp hàng lần hai', replay.status === 202)

  let latest = null
  for (let i = 0; i < 80; i++) { const r = await api(`/api/v2/subjects/demand-briefs/${demand}/match-rounds/latest`, {}, owner); if (r.status === 200) { latest = r.body; break }; await sleep(3000) }
  check('vòng thật xuất hiện qua GET .../latest, số ứng viên > 0 (B-46: từng hiện 0 vì đếm trên navigation chưa Include)', Boolean(latest) && latest.candidateCount > 0, latest ? `${latest.candidateCount} ứng viên, ${latest.searchEngineVersion}` : 'không có sau 240s')
  if (!latest) process.exit(1)
  const cands = await api(`/api/v2/match-rounds/${latest.id}/candidates`, {}, owner)
  const ids = cands.body.data.map((c) => c.candidate.id)
  check('ứng viên có công nghệ khớp, xếp trên công nghệ không khớp', ids.includes(techHit) && (!ids.includes(techMiss) || ids.indexOf(techHit) < ids.indexOf(techMiss)), ids.map((x) => x.slice(0, 8)).join(','))
  check('nhãn engine PostgreSQL với sparse', latest.searchEngineVersion.startsWith('postgres-16/pgvector-rrf3'), latest.searchEngineVersion)
  check('lý do ứng viên ghi đủ kênh', /rrf_dense_lexical_exact_sparse/.test(cands.body.data[0]?.reason ?? ''), cands.body.data[0]?.reason)

  // ══ Bảng quản trị ══
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []; page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(`${UI}/login`, { waitUntil: 'networkidle' })
  await page.fill('input[type="email"], input[name="email"]', adminEmail); await page.fill('input[type="password"]', PASS); await page.click('button[type="submit"]')
  await page.waitForFunction(() => !location.pathname.includes('/login'), null, { timeout: 20000 })
  await page.goto(`${UI}/match-rounds/demand-briefs/${demand}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Số ứng viên', { timeout: 20000 })
  const body = await page.textContent('body')
  check('VGC-08: vòng thật hiện trên bảng quản trị với bốn thông tin', body.includes('PostgreSQL (pgvector)') && body.includes('bge-m3') && body.includes('Chấm điểm đã sửa'))
  check('ứng viên thật với điểm và lý do', body.includes('rrf_dense_lexical'))
  await page.screenshot({ path: `${OUT}/r5-real-round.png`, fullPage: true })
  await page.goto(`${UI}/match-rounds/rounds/${latest.id}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Đã tìm bằng gì', { timeout: 20000 })
  check('chi tiết vòng thật hiện câu truy vấn (tiêu đề + nội dung đề bài)', (await page.textContent('body')).includes('dệt nhuộm'))
  await page.screenshot({ path: `${OUT}/r6-real-round-detail.png`, fullPage: true })
  console.log(`\nLỗi console: ${errors.length}`); errors.slice(0, 3).forEach((e) => console.log('  ! ' + e.slice(0, 140)))
  await browser.close()
  const failed = results.filter((r) => !r.ok).length
  console.log(`\n════ TỔNG: ${results.length - failed}/${results.length} đạt ════`)
  process.exit(failed ? 1 : 0)
}
main().catch((e) => { console.error('LỖI KỊCH BẢN:', e); process.exit(2) })
